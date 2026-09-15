package com.sih26.vyapaarsathi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import com.sih26.vyapaarsathi.dto.scheme.RecommendedSchemeDto;
import com.sih26.vyapaarsathi.dto.scheme.SchemeArchetypeDto;
import com.sih26.vyapaarsathi.dto.scheme.SchemeSearchRequest;
import com.sih26.vyapaarsathi.dto.scheme.SchemeSearchResponse;
import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.SchemeSearchSession;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.repository.AssessmentRepository;
import com.sih26.vyapaarsathi.repository.SchemeSearchSessionRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SchemeSearchService {

    private final SchemeSearchSessionRepository sessionRepository;
    private final AssessmentRepository assessmentRepository;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private QuotaService quotaService;

    @Autowired(required = false)
    private GeminiApiClient geminiApiClient;

    @Value("${app.gcp.project-id:sih26-508313}")
    private String gcpProjectId = "sih26-508313";

    @Value("${app.gcp.location:asia-south1}")
    private String gcpLocation = "asia-south1";

    @Value("${app.gcp.vertex-model:gemini-2.5-flash}")
    private String vertexModel = "gemini-2.5-flash";

    private List<SchemeArchetypeDto> archetypeCatalog = new ArrayList<>();

    public SchemeSearchService(SchemeSearchSessionRepository sessionRepository,
                               AssessmentRepository assessmentRepository,
                               ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.assessmentRepository = assessmentRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("mock_scheme_archetypes.json");
            try (InputStream is = resource.getInputStream()) {
                archetypeCatalog = objectMapper.readValue(is, new TypeReference<List<SchemeArchetypeDto>>() {});
                log.info("Successfully loaded {} mock scheme archetypes from classpath.", archetypeCatalog.size());
            }
        } catch (Exception e) {
            log.warn("Could not load mock_scheme_archetypes.json from classpath: {}", e.getMessage());
        }
    }

    public List<SchemeArchetypeDto> getArchetypeCatalog() {
        return archetypeCatalog;
    }

    @Transactional
    public SchemeSearchResponse searchSchemes(SchemeSearchRequest req, User user) {
        Assessment assessment = null;
        if (req.getAssessmentId() != null) {
            assessment = assessmentRepository.findById(req.getAssessmentId()).orElse(null);
        }
        if (assessment == null) {
            assessment = assessmentRepository.findAll().stream().findFirst().orElse(null);
        }
        if (assessment == null) {
            assessment = new Assessment();
            assessment.setAssessmentId(req.getAssessmentId() != null ? req.getAssessmentId() : 101L);
            assessment.setBusinessCategory("Retail & Micro-Enterprise");
            assessment.setMarginCapital(new BigDecimal("100000"));
        }

        SchemeSearchRequest.QuestionnaireDto q = req.getQuestionnaire();

        // 1. Attempt Live Vertex AI Gemini Prompt Synthesis
        SchemeSearchResponse aiResponse = attemptVertexAiSchemeSearch(assessment, q, user);

        List<RecommendedSchemeDto> recommended;
        String strategyInsight;

        if (aiResponse != null && aiResponse.getRecommendedSchemes() != null && !aiResponse.getRecommendedSchemes().isEmpty()) {
            recommended = aiResponse.getRecommendedSchemes();
            strategyInsight = aiResponse.getHouseholdStrategyInsight();
            log.info("Successfully retrieved {} dynamic schemes via Vertex AI Gemini.", recommended.size());
        } else {
            // 2. Fallback to Curated Grounded Archetype Synthesis
            log.info("Using grounded deterministic archetype synthesis fallback for assessment ID {}", req.getAssessmentId());
            SchemeSearchResponse fallback = synthesizeArchetypeFallback(q, assessment, user);
            recommended = fallback.getRecommendedSchemes();
            strategyInsight = fallback.getHouseholdStrategyInsight();
        }

        // 3. Persist Search Session to DB if assessment is persisted
        Long sessionId = System.currentTimeMillis();
        if (assessment.getAssessmentId() != null && assessmentRepository.existsById(assessment.getAssessmentId())) {
            try {
                SchemeSearchSession session = new SchemeSearchSession();
                session.setAssessment(assessment);
                session.setHouseholdAnswersJson(objectMapper.writeValueAsString(q));
                session.setGeneratedSchemesJson(objectMapper.writeValueAsString(recommended));
                session.setCreatedAt(Instant.now());
                SchemeSearchSession savedSession = sessionRepository.save(session);
                sessionId = savedSession.getSessionId();
            } catch (Exception e) {
                log.warn("Could not persist scheme search session: {}", e.getMessage());
            }
        }

        return SchemeSearchResponse.builder()
                .sessionId(sessionId)
                .assessmentId(assessment.getAssessmentId())
                .isIllustrative(true)
                .mandatoryGlobalDisclosure("AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.")
                .householdStrategyInsight(strategyInsight)
                .recommendedSchemes(recommended)
                .build();
    }

    private SchemeSearchResponse attemptVertexAiSchemeSearch(Assessment assessment, SchemeSearchRequest.QuestionnaireDto q, User user) {
        // 1. Attempt Google AI Studio direct Gemini API if configured
        if (geminiApiClient != null && geminiApiClient.isApiKeyConfigured()) {
            try {
                String prompt = buildSchemePrompt(assessment, q, user);
                String responseText = geminiApiClient.generateContent(prompt);
                if (responseText != null && !responseText.trim().isEmpty()) {
                    if (quotaService != null && user != null) {
                        quotaService.recordUsage(user, vertexModel, 650);
                    }
                    SchemeSearchResponse parsed = parseGeminiResponse(responseText, assessment.getAssessmentId());
                    if (parsed != null) {
                        log.info("Successfully generated tailored scheme recommendations via Google AI Studio Gemini API");
                        return parsed;
                    }
                }
            } catch (Exception ex) {
                log.warn("Google AI Studio Gemini scheme call failed ({}), attempting GCP Vertex fallback.", ex.getMessage());
            }
        }

        // 2. Attempt live Vertex AI call if GCP project is available (e.g. on Cloud Run)
        try (VertexAI vertexAI = new VertexAI(gcpProjectId, gcpLocation)) {
            com.google.cloud.vertexai.api.GenerationConfig genConfig =
                    com.google.cloud.vertexai.api.GenerationConfig.newBuilder()
                            .setTemperature(0.15f)
                            .build();

            GenerativeModel model = new GenerativeModel(vertexModel, vertexAI)
                    .withGenerationConfig(genConfig);

            String prompt = buildSchemePrompt(assessment, q, user);
            GenerateContentResponse response = model.generateContent(prompt);
            String responseText = ResponseHandler.getText(response);

            if (responseText != null && !responseText.trim().isEmpty()) {
                if (quotaService != null && user != null) {
                    quotaService.recordUsage(user, vertexModel, 650);
                }
                return parseGeminiResponse(responseText, assessment.getAssessmentId());
            }
        } catch (Exception ex) {
            log.warn("Vertex AI scheme search call bypassed or unavailable ({}). Falling back to grounded catalog.", ex.getMessage());
        }
        return null;
    }

    private String buildSchemePrompt(Assessment assessment, SchemeSearchRequest.QuestionnaireDto q, User user) {
        SchemeSearchRequest.PrimaryApplicantDto applicant = q.getPrimaryApplicant();
        SchemeSearchRequest.HouseholdHistoryDto history = q.getHouseholdHistory();

        String applicantName = (q.getApplicantName() != null && !q.getApplicantName().trim().isEmpty())
                ? q.getApplicantName().trim()
                : ((user != null && user.getName() != null) ? user.getName() : "Primary Applicant");
        String gender = (applicant != null && applicant.getGender() != null) ? applicant.getGender() : "Female";
        String category = (applicant != null && applicant.getSocialCategory() != null) ? applicant.getSocialCategory() : "SC";
        int age = (applicant != null && applicant.getAge() != null) ? applicant.getAge() : 32;
        String incomeBand = (applicant != null && applicant.getAnnualHouseholdIncomeBand() != null) ? applicant.getAnnualHouseholdIncomeBand() : "< ₹1.5 Lakh";
        boolean isDisability = (applicant != null && Boolean.TRUE.equals(applicant.getDisabilityStatus()));
        boolean isExServicemen = (applicant != null && Boolean.TRUE.equals(applicant.getExServicemenStatus()));

        String bizCategory = assessment.getBusinessCategory() != null ? assessment.getBusinessCategory() : "Retail & Grocery";
        BigDecimal marginCapital = assessment.getMarginCapital() != null ? assessment.getMarginCapital() : new BigDecimal("100000");
        BigDecimal estimatedProjectCost = marginCapital.multiply(BigDecimal.TEN);

        String villageName = q.getVillageName();
        String districtName = q.getDistrictName();
        String stateName = q.getStateName();
        if (villageName == null || districtName == null) {
            try {
                if (assessment.getModule1ReportJson() != null) {
                    com.fasterxml.jackson.databind.JsonNode m1 = objectMapper.readTree(assessment.getModule1ReportJson());
                    if (m1.has("village_context")) {
                        com.fasterxml.jackson.databind.JsonNode vc = m1.get("village_context");
                        if (villageName == null && vc.has("villageName")) villageName = vc.get("villageName").asText();
                        if (districtName == null && vc.has("districtName")) districtName = vc.get("districtName").asText();
                        if (stateName == null && vc.has("stateName")) stateName = vc.get("stateName").asText();
                    }
                }
            } catch (Exception ignored) {}
        }
        String locationContext = (villageName != null ? villageName + ", " : "") +
                (districtName != null ? districtName + ", " : "") +
                (stateName != null ? stateName : "Tamil Nadu, India");
        if (assessment.getVillageLgdCode() != null) {
            locationContext += " (LGD Code: " + assessment.getVillageLgdCode() + ")";
        }

        String lang = q.getPreferredLanguage();
        if (lang == null || lang.trim().isEmpty()) {
            lang = (user != null && user.getPreferredLanguage() != null) ? user.getPreferredLanguage().name() : "en";
        }
        String langInstruction = switch (lang.toLowerCase()) {
            case "ta" -> "CRITICAL: The applicant prefers TAMIL (தமிழ்). All textual fields (target_beneficiary_match, illustrative_benefit, household_strategy_insight, etc.) MUST be written in natural, fluent TAMIL (தமிழ்).";
            case "hi" -> "CRITICAL: The applicant prefers HINDI (हिन्दी). All textual fields (target_beneficiary_match, illustrative_benefit, household_strategy_insight, etc.) MUST be written in natural, fluent HINDI (हिन्दी).";
            case "te" -> "CRITICAL: The applicant prefers TELUGU (తెలుగు). All textual fields (target_beneficiary_match, illustrative_benefit, household_strategy_insight, etc.) MUST be written in natural, fluent TELUGU (తెలుగు).";
            default -> "Write all responses in clear, professional English.";
        };

        return """
                You are VyapaarSathi's National Scheme Discovery Engine for the Ministry of Social Justice and Empowerment (MoSJE), Government of India.
                Your task is to analyze the applicant's household profile and provide 3 to 5 highly relevant, realistic Central and State government concessional credit schemes matching their eligibility.

                %s

                APPLICANT & ENTERPRISE CONTEXT:
                - Name: %s
                - Age: %d, Gender: %s
                - Social Category: %s
                - Annual Household Income: %s
                - Disability Status: %s | Ex-Servicemen: %s
                - Proposed Enterprise Category: %s
                - Available Margin Capital: ₹%s (Estimated Project Cost: ₹%s)
                - Location Context: %s
                - Ownership Choice: %s
                - Prior Subsidies: %s
                - Existing Business: %s

                INSTRUCTIONS & RULES:
                1. Match schemes against real Ministry of Social Justice & Empowerment apex corporations (NSFDC for SC, NBCFDC for OBC, NSKFDC for Safai Karamchari, NDFDC for PwD), MSME Ministry (PMEGP, Mudra Shishu/Kishore/Tarun, PM SVANidhi), and State Channelizing Agencies (SCAs like TAHDCO / TABCEDCO).
                2. Address the applicant directly by their actual name (%s) in the strategy insight and recommendations. DO NOT assume any hardcoded persona name.
                3. Every scheme MUST be categorized into one of these EXACT 3 values:
                   - "loan_type_specific": Concessional loan matching their specific social category or gender (e.g. NSFDC Mahila Samriddhi for SC Women, NBCFDC New Swarnima for OBC Women, Stand-Up India for SC/ST/Women).
                   - "business_linked": Scheme directly aligned with the specific business trade (e.g. Dairy cooperative / AHIDF for dairy; Mudra for grocery/kirana; PMEGP for manufacturing/artisan units; PM SVANidhi for street vendors).
                   - "bank_specific": State Channelizing Agency or Scheduled Commercial Bank / Regional Rural Bank credit tie-up with back-ended capital subsidy or interest subvention.
                4. Include realistic, accurate details for indicative_interest_rate (e.g. 4.0 to 6.5 percent per annum concessional), illustrative_benefit (loan caps, margin money requirements, subsidy percentage), and participating_institutions (SCAs, RRBs, Lead Bank).
                5. Provide a strategic "household_strategy_insight" explaining whether registering under %s or spouse yields a better interest rebate (e.g., Mahila Samriddhi rebate for women), higher subsidy priority, or joint SHG benefits.
                6. Mark is_illustrative as true and include mandatory_disclosure: "AI-generated illustrative match — verify with your nearest SCA/bank before applying".

                Return ONLY valid JSON matching this schema:
                {
                  "household_strategy_insight": "string",
                  "recommended_schemes": [
                    {
                      "scheme_id": "STRING_UPPERCASE_SLUG",
                      "scheme_name": "Full Scheme Name (Illustrative)",
                      "category": "loan_type_specific | business_linked | bank_specific",
                      "target_beneficiary_match": "string explaining exact eligibility match",
                      "illustrative_benefit": "string specifying loan limit, subsidy, tenure",
                      "indicative_interest_rate": "string with interest percent per annum",
                      "participating_institutions": "string listing SCAs, RRBs, Public Sector Banks",
                      "is_illustrative": true,
                      "mandatory_disclosure": "AI-generated illustrative match — verify with your nearest SCA/bank before applying"
                    }
                  ]
                }
                """.formatted(
                langInstruction,
                applicantName, age, gender, category, incomeBand,
                isDisability ? "Yes (Benchmark PwD)" : "No",
                isExServicemen ? "Yes" : "No",
                bizCategory,
                marginCapital.toPlainString(), estimatedProjectCost.toPlainString(),
                locationContext,
                q.getOwnership() != null ? q.getOwnership() : "Me (Primary Applicant)",
                history != null && history.getPreviousSubsidies() != null ? history.getPreviousSubsidies() : "None",
                history != null && Boolean.TRUE.equals(history.getHasExistingBusiness()) ? "Yes" : "No",
                applicantName, applicantName
        );
    }

    private SchemeSearchResponse parseGeminiResponse(String responseText, Long assessmentId) {
        try {
            String json = responseText;
            if (json.contains("```json")) {
                json = json.substring(json.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```"));
            } else if (json.contains("```")) {
                json = json.substring(json.indexOf("```") + 3);
                json = json.substring(0, json.indexOf("```"));
            }

            JsonNode root = objectMapper.readTree(json.trim());
            String insight = root.has("household_strategy_insight") ? root.get("household_strategy_insight").asText() : "";
            JsonNode schemesNode = root.get("recommended_schemes");
            if (schemesNode != null && schemesNode.isArray()) {
                List<RecommendedSchemeDto> list = objectMapper.readValue(
                        schemesNode.traverse(),
                        new TypeReference<List<RecommendedSchemeDto>>() {}
                );
                if (!list.isEmpty()) {
                    return SchemeSearchResponse.builder()
                            .assessmentId(assessmentId)
                            .isIllustrative(true)
                            .mandatoryGlobalDisclosure("AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.")
                            .householdStrategyInsight(insight)
                            .recommendedSchemes(list)
                            .build();
                }
            }
        } catch (Exception ex) {
            log.warn("Could not parse Vertex AI scheme response as RecommendedSchemeDto list: {}", ex.getMessage());
        }
        return null;
    }

    private SchemeSearchResponse synthesizeArchetypeFallback(
            SchemeSearchRequest.QuestionnaireDto q,
            Assessment assessment,
            User user) {

        SchemeSearchRequest.PrimaryApplicantDto applicant = q.getPrimaryApplicant();
        List<RecommendedSchemeDto> recommended = new ArrayList<>();
        String gender = applicant != null && applicant.getGender() != null ? applicant.getGender() : "Female";
        String category = applicant != null && applicant.getSocialCategory() != null ? applicant.getSocialCategory().toUpperCase() : "OBC";
        boolean isFemale = "female".equalsIgnoreCase(gender);
        boolean isDisability = applicant != null && Boolean.TRUE.equals(applicant.getDisabilityStatus());
        String bizCategory = assessment.getBusinessCategory() != null ? assessment.getBusinessCategory().toLowerCase() : "retail";
        String lang = (q.getPreferredLanguage() != null && !q.getPreferredLanguage().trim().isEmpty())
                ? q.getPreferredLanguage().toLowerCase()
                : (user != null && user.getPreferredLanguage() != null ? user.getPreferredLanguage().name().toLowerCase() : "en");

        boolean isTamil = "ta".equals(lang);

        // 1. Statutory Demographic & Apex Corporation Schemes
        if (category.contains("OBC") || category.contains("BACKWARD")) {
            if (isFemale) {
                recommended.add(RecommendedSchemeDto.builder()
                        .schemeId("NBCFDC_NEW_SWARNIMA")
                        .schemeName(isTamil ? "தேசிய பிற்படுத்தப்பட்டோர் புதிய ஸ்வர்ணிமா திட்டம் (NBCFDC)" : "NBCFDC New Swarnima Scheme for Women (Illustrative)")
                        .category("loan_type_specific")
                        .targetBeneficiaryMatch(isTamil ? "இதர பிற்படுத்தப்பட்ட (OBC) மகளிர் தொழில்முனைவோர்" : "OBC Women Micro-Entrepreneurs")
                        .illustrativeBenefit(isTamil ? "ரூ. 2.00 லட்சம் வரை 5.0% குறைந்த வட்டியில் பிணையில்லா கடன்" : "Up to ₹2.00 Lakh term loan at subsidized 5.0% p.a. interest rate for self-reliant rural women")
                        .indicativeInterestRate("5.0% p.a.")
                        .participatingInstitutions(isTamil ? "TABCEDCO / மாவட்ட மத்திய கூட்டுறவு வங்கி" : "TABCEDCO / State Backward Classes Economic Development Corporation")
                        .isIllustrative(true)
                        .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                        .build());
            } else {
                recommended.add(RecommendedSchemeDto.builder()
                        .schemeId("NBCFDC_GENERAL_TERM_LOAN")
                        .schemeName(isTamil ? "தேசிய பிற்படுத்தப்பட்டோர் பொது தவணைக் கடன் திட்டம் (NBCFDC)" : "NBCFDC General Term Loan Scheme (Illustrative)")
                        .category("loan_type_specific")
                        .targetBeneficiaryMatch(isTamil ? "இதர பிற்படுத்தப்பட்ட (OBC) வகுப்பினர்" : "Other Backward Classes (OBC) entrepreneurs")
                        .illustrativeBenefit(isTamil ? "ரூ. 50.00 லட்சம் வரை 90% அரசு கடன் பங்கு மற்றும் 6 மாத அசல் விலக்கு" : "90% project cost financing up to ₹50 Lakh with 84-month tenure and 6-month moratorium")
                        .indicativeInterestRate("8.0% p.a. (reducing balance)")
                        .participatingInstitutions(isTamil ? "TABCEDCO / தேசியமயமாக்கப்பட்ட வங்கிகள்" : "TABCEDCO / State Backward Classes Economic Development Corporation")
                        .isIllustrative(true)
                        .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                        .build());
            }

            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TABCEDCO_MICRO_FINANCE")
                    .schemeName(isTamil ? "தமிழ்நாடு பிற்படுத்தப்பட்டோர் பொருளாதார மேம்பாட்டுக் கழக மைக்ரோ கடன்" : "TABCEDCO Micro Finance Credit Scheme (Illustrative)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch(isTamil ? "கிராமப்புற சிறு குறு வணிகர்கள் மற்றும் சுய உதவிக் குழுக்கள்" : "Rural Micro Traders & Self Help Group members")
                    .illustrativeBenefit(isTamil ? "ரூ. 1,40,000 வரை 6.5% குறைந்த வட்டியில் எளிய தவணை கடன்" : "Micro-credit support up to ₹1,40,000 at 6.5% interest rate with simplified single-window processing")
                    .indicativeInterestRate("6.0% - 6.5% p.a.")
                    .participatingInstitutions(isTamil ? "TABCEDCO / தொடக்க வேளாண்மை கூட்டுறவு சங்கம் (PACCS)" : "TABCEDCO / State Channelizing Agency")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else if (category.contains("SC") || category.contains("SCHEDULED CASTE")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NSFDC_MAHILA_SAMRIDDHI")
                    .schemeName(isTamil ? "தேசிய ஆதிதிராவிடர் மகிளா சம்ரித்தி திட்டம் (NSFDC)" : "NSFDC Mahila Samriddhi Yojana (Illustrative)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil ? "பட்டியலின (SC) மகளிர் தொழில்முனைவோர்" : "Scheduled Caste (SC) Women Entrepreneurs")
                    .illustrativeBenefit(isTamil ? "ரூ. 1,40,000 வரை வெறும் 4.0% சலுகை வட்டியில் நுண்கடன்" : "Up to ₹1,40,000 credit limit with 1.5% special rebate at 4.0% p.a. concessional interest")
                    .indicativeInterestRate("4.0% p.a.")
                    .participatingInstitutions(isTamil ? "TAHDCO / நபார்டு / கிராம வங்கி" : "TAHDCO / NSFDC / Regional Rural Banks")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());

            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TAHDCO_ENTERPRISE_SUBSIDY")
                    .schemeName(isTamil ? "தாட்கோ சுயதொழில் மூலதன மானிய திட்டம் (TAHDCO)" : "TAHDCO Special Economic Assistance Scheme (Illustrative)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch(isTamil ? "தமிழ்நாடு பட்டியலின மற்றும் பழங்குடியினர்" : "Tamil Nadu Scheduled Caste Beneficiaries")
                    .illustrativeBenefit(isTamil ? "30% அல்லது அதிகபட்சம் ரூ. 2.25 லட்சம் வரை அரசு மூலதன மானியம்" : "30% back-ended capital subsidy up to ₹2.25 Lakh combined with commercial bank credit")
                    .indicativeInterestRate("Standard bank lending rate with 30% capital grant")
                    .participatingInstitutions(isTamil ? "தாட்கோ (TAHDCO) / பொதுத்துறை வங்கிகள்" : "TAHDCO / State Scheduled Castes Development Corp")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else if (category.contains("SAFAI") || category.contains("SANITATION")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NSKFDC_SWACCHTA_UDYAMI")
                    .schemeName(isTamil ? "தூய்மைப் பணியாளர் உத்யமி திட்டம் (NSKFDC)" : "NSKFDC Swacchta Udyami Yojana (Illustrative)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil ? "தூய்மைப் பணியாளர்கள் மற்றும் அவர்தம் சார்ந்த குடும்பத்தினர்" : "Safai Karamchari & Sanitation Workers Community")
                    .illustrativeBenefit(isTamil ? "ரூ. 15.00 லட்சம் வரை கடன் மற்றும் ரூ. 3.25 லட்சம் நேரடி மானியம்" : "Capital subsidy up to ₹3,25,000 with 4.0% concessional interest rate")
                    .indicativeInterestRate("4.0% - 6.0% p.a.")
                    .participatingInstitutions("National Safai Karamcharis Finance & Development Corporation")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // 2. Business Trade-Specific Schemes
        if (bizCategory.contains("dairy") || bizCategory.contains("milk") || bizCategory.contains("cattle")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("MICRO_WOMEN_DAIRY")
                    .schemeName(isTamil ? "பால் பண்ணை & கால்நடை வளர்ப்பு கூட்டுறவு திட்டம்" : "Women Rural Dairy Cooperative Scheme (Illustrative)")
                    .category("business_linked")
                    .targetBeneficiaryMatch(isTamil ? "பால் பண்ணை மற்றும் கால்நடை வளர்ப்பு வணிகம்" : "Dairy & Livestock rearing enterprise")
                    .illustrativeBenefit(isTamil ? "ரூ. 2.00 லட்சம் வரை கடன் மற்றும் 25% மூலதன மானியம் (ஆவின் இணைப்பு)" : "Milch cattle financing with milk collection tie-up and 25% back-ended capital subsidy")
                    .indicativeInterestRate("5.0% - 6.5% p.a.")
                    .participatingInstitutions(isTamil ? "மாவட்ட பால் உற்பத்தியாளர்கள் சங்கம் / நபார்டு" : "District Cooperative Milk Producers Union / NABARD")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else if (bizCategory.contains("textile") || bizCategory.contains("tailor") || bizCategory.contains("carpentry") || bizCategory.contains("metal") || bizCategory.contains("craft") || bizCategory.contains("artisan")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("PM_VISHWAKARMA")
                    .schemeName(isTamil ? "பிரதமர் விஸ்வகர்மா திட்டம் (PM Vishwakarma)" : "PM Vishwakarma Scheme (Illustrative)")
                    .category("business_linked")
                    .targetBeneficiaryMatch(isTamil ? "பாரம்பரிய கைவினைஞர்கள், தையல் மற்றும் மர/உலோக வேலை கலைஞர்கள்" : "Traditional Artisans, Tailors, Carpenters, and Metal Crafters")
                    .illustrativeBenefit(isTamil ? "பிணையில்லா கடன் ரூ. 3.00 லட்சம் (5% வட்டி) + ரூ. 15,000 இலவச கருவி மானியம்" : "Collateral-free credit up to ₹3.00 Lakh at 5.0% interest + ₹15,000 modern toolkit grant")
                    .indicativeInterestRate("5.0% p.a. flat")
                    .participatingInstitutions(isTamil ? "மத்திய சிறு, குறு தொழில்கள் அமைச்சகம் (MSME) / வங்கிகள்" : "Ministry of MSME / National Skill Development Corporation")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("MUDRA_KISHORE_RETAIL")
                    .schemeName(isTamil ? "பிரதமர் முத்ரா திட்டம் - கிஷோர் & தருண் (MUDRA)" : "Pradhan Mantri MUDRA Yojana - Kishore/Tarun (Illustrative)")
                    .category("business_linked")
                    .targetBeneficiaryMatch(isTamil ? "மளிகை, பல்பொருள் அங்காடி மற்றும் சில்லறை வணிக நிறுவனங்கள்" : "Grocery, Provisions, and Micro Retail Trade")
                    .illustrativeBenefit(isTamil ? "ரூ. 50,000 முதல் ரூ. 10.00 லட்சம் வரை பிணையில்லா தொழில் விரிவாக்க கடன்" : "Collateral-free working capital & machinery loan up to ₹10 Lakh with RuPay business card")
                    .indicativeInterestRate("8.5% - 9.5% p.a.")
                    .participatingInstitutions(isTamil ? "அனைத்து பொதுத்துறை மற்றும் பிராந்திய கிராம வங்கிகள்" : "All Public Sector Banks & Regional Rural Banks")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // 3. Flagship Government Capital Grant Scheme: PMEGP
        recommended.add(RecommendedSchemeDto.builder()
                .schemeId("PMEGP_RURAL_SUBSIDY")
                .schemeName(isTamil ? "பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)" : "Prime Minister Employment Generation Programme (PMEGP)")
                .category("bank_specific")
                .targetBeneficiaryMatch(isTamil ? "கிராமப்புற சிறு உற்பத்தி மற்றும் சேவை தொழில்முனைவோர்" : "Rural Micro-Enterprise & Service Units")
                .illustrativeBenefit(isTamil ? "கிராமப்புற சிறப்பு பிரிவினருக்கு 35% வரை திரும்ப செலுத்த வேண்டாத அரசு மூலதன மானியம்" : "Up to 35% margin money government subsidy in rural areas for special category beneficiaries")
                .indicativeInterestRate(isTamil ? "வங்கி வட்டி விகிதத்தில் 35% நேரடி அரசு மானியம்" : "Commercial bank lending rate offset by 35% back-ended capital grant")
                .participatingInstitutions(isTamil ? "காதிராமத் தொழில் வாரியம் (KVIC) / மாவட்ட தொழில் மையம் (DIC)" : "KVIC / KVIB / District Industries Centre (DIC)")
                .isIllustrative(true)
                .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                .build());

        // 4. Disability Support
        if (isDisability) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NHFDC_DIVYANGJAN_SWAVALAMBAN")
                    .schemeName(isTamil ? "திவ்யாங்ஜன் ஸ்வாவலம்பன் திட்டம் (NHFDC)" : "Divyangjan Swavalamban Yojana (Illustrative)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil ? "மாற்றுத்திறனாளி தொழில்முனைவோர் (40%+ சான்று)" : "Persons with Benchmark Disabilities (PwD)")
                    .illustrativeBenefit(isTamil ? "ரூ. 5.00 லட்சம் வரை 5.0% வட்டியில் 100% கடன் நிதி உதவி" : "100% concessional credit up to ₹5,00,000 with 0.5% special rebate for women")
                    .indicativeInterestRate("5.0% p.a.")
                    .participatingInstitutions("National Handicapped Finance and Development Corporation (NHFDC)")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // 5. Household Strategy Insight
        String appName = (q != null && q.getApplicantName() != null && !q.getApplicantName().trim().isEmpty())
                ? q.getApplicantName().trim()
                : (user != null && user.getName() != null ? user.getName() : "the Primary Applicant");
        String strategyInsight;
        if (isTamil) {
            strategyInsight = appName + " அவர்களின் சமூக தகுதி (" + category + ") மற்றும் கிராமப்புற தொழில் அமைவிடத்தின் அடிப்படையில் அரசு சலுகைக் கடன்கள் மற்றும் அதிகபட்ச 35% மூலதன மானியம் பொருந்துகிறது. மகளிர் பெயரில் அல்லது கூட்டு விண்ணப்பமாக சமர்ப்பித்தால் கூடுதல் 1.0% வட்டி தள்ளுபடி மற்றும் முன்னுரிமை கிடைக்கும்.";
        } else if (isFemale) {
            strategyInsight = "Registering the enterprise under " + appName +
                    " (Female) unlocks an additional 0.5% to 1.5% concessional interest rebate and higher rural subsidy priority under apex corporation schemes.";
        } else {
            strategyInsight = "Registering the enterprise under " + appName +
                    " (" + category + ") positions the business for targeted concessional apex schemes. If registered jointly with an eligible female family member, the enterprise may also qualify for enhanced Mahila Samriddhi subvention and higher subsidy margins.";
        }

        return SchemeSearchResponse.builder()
                .assessmentId(assessment.getAssessmentId())
                .isIllustrative(true)
                .mandatoryGlobalDisclosure("AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.")
                .householdStrategyInsight(strategyInsight)
                .recommendedSchemes(recommended)
                .build();
    }

    @Transactional(readOnly = true)
    public SchemeSearchResponse getSession(Long sessionId, User user) {
        SchemeSearchSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        List<RecommendedSchemeDto> schemes = new ArrayList<>();
        try {
            if (session.getGeneratedSchemesJson() != null) {
                schemes = objectMapper.readValue(
                        session.getGeneratedSchemesJson(),
                        new TypeReference<List<RecommendedSchemeDto>>() {}
                );
            }
        } catch (Exception e) {
            log.warn("Could not deserialize saved schemes: {}", e.getMessage());
        }

        return SchemeSearchResponse.builder()
                .sessionId(session.getSessionId())
                .assessmentId(session.getAssessment().getAssessmentId())
                .isIllustrative(true)
                .mandatoryGlobalDisclosure("AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.")
                .householdStrategyInsight("Saved session match history from " + session.getCreatedAt().toString())
                .recommendedSchemes(schemes)
                .build();
    }
}
