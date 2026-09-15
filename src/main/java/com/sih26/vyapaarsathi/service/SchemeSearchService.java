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
    private List<com.sih26.vyapaarsathi.dto.scheme.OfficialSchemeMasterDto> masterSchemeCatalog = new ArrayList<>();

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

        try {
            ClassPathResource masterResource = new ClassPathResource("government_scheme_master.json");
            try (InputStream is = masterResource.getInputStream()) {
                masterSchemeCatalog = objectMapper.readValue(is, new TypeReference<List<com.sih26.vyapaarsathi.dto.scheme.OfficialSchemeMasterDto>>() {});
                log.info("Successfully loaded {} official government master schemes from classpath.", masterSchemeCatalog.size());
            }
        } catch (Exception e) {
            log.warn("Could not load government_scheme_master.json from classpath: {}", e.getMessage());
        }
    }

    public List<SchemeArchetypeDto> getArchetypeCatalog() {
        return archetypeCatalog;
    }

    public List<com.sih26.vyapaarsathi.dto.scheme.OfficialSchemeMasterDto> getMasterSchemeCatalog() {
        return masterSchemeCatalog;
    }

    public List<com.sih26.vyapaarsathi.dto.scheme.OfficialSchemeMasterDto> filterMasterSchemes(String state, String category, String microOrTerm) {
        return masterSchemeCatalog.stream()
                .filter(s -> {
                    if (state != null && !state.trim().isEmpty() && !"all".equalsIgnoreCase(state)) {
                        String res = s.getResidenceRequirement() != null ? s.getResidenceRequirement() : "";
                        if (!res.equalsIgnoreCase("India") && !res.toLowerCase().contains(state.toLowerCase())) {
                            return false;
                        }
                    }
                    if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
                        String gen = s.getGenderRequirement() != null ? s.getGenderRequirement() : "";
                        String ben = s.getBeneficiaryType() != null ? s.getBeneficiaryType() : "";
                        String name = s.getSchemeName() != null ? s.getSchemeName() : "";
                        String combined = (gen + " " + ben + " " + name).toLowerCase();
                        if (category.equalsIgnoreCase("sc") && !combined.contains("sc") && !combined.contains("all genders")) {
                            return false;
                        }
                        if (category.equalsIgnoreCase("women") && !combined.contains("women") && !combined.contains("female") && !combined.contains("all genders")) {
                            return false;
                        }
                    }
                    if (microOrTerm != null && !microOrTerm.trim().isEmpty() && !"all".equalsIgnoreCase(microOrTerm)) {
                        String mt = s.getMicroOrTerm() != null ? s.getMicroOrTerm() : "";
                        if (microOrTerm.equalsIgnoreCase("micro") && !mt.toLowerCase().contains("micro")) {
                            return false;
                        }
                        if (microOrTerm.equalsIgnoreCase("term") && !mt.toLowerCase().contains("term")) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();
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
                1. Ground your recommendations in authentic Central & State government schemes from the official Government Scheme Master (e.g. for Tamil Nadu: TN-004 AABCS for SC/ST with 35% subsidy + 6% subvention, TN-003 TWEES for Women with 95% bank finance + 25% subsidy, TN-001 NEEDS with 25% subsidy up to ₹75 Lakh + 3% subvention, TN-002 UYEGP with 25% subsidy up to ₹3.75 Lakh, TN-005 KKT for artisans; and Central schemes: CEN-001 Micro Finance Scheme at 6.5% interest, CEN-004 Mudra, CEN-005 PMEGP with 35% rural subsidy, CEN-007 Stand-Up India ₹10L-₹1Cr, CEN-011 PM SVANidhi with 7% interest subsidy).
                2. Address the applicant directly by their actual name (%s) in the strategy insight and recommendations. DO NOT assume any hardcoded persona name.
                3. Every scheme MUST be categorized into one of these EXACT 3 values:
                   - "loan_type_specific": Concessional loan matching their specific social category or gender (e.g. AABCS for SC/ST, TWEES for Women, NEEDS for youth, Stand-Up India).
                   - "business_linked": Scheme directly aligned with the specific business trade (e.g. Mudra for retail/grocery; PMEGP for manufacturing; PMFME for food processing; PM SVANidhi for vending).
                   - "bank_specific": State Channelizing Agency or Scheduled Commercial Bank / Regional Rural Bank credit tie-up with back-ended capital subsidy or interest subvention.
                4. Include realistic, accurate details for indicative_interest_rate, illustrative_benefit, official_url, application_channel, subsidy_percentage, max_loan_amount, own_contribution, tenure, and moratorium.
                5. Provide a strategic "household_strategy_insight" explaining whether registering under %s or spouse yields a better interest rebate (e.g., Mahila subvention for women), higher subsidy priority (e.g. 35% AABCS/PMEGP vs general), or joint SHG benefits.
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
                      "official_url": "string valid URL or portal link",
                      "application_channel": "string application portal or nodal office",
                      "subsidy_percentage": "string e.g. 25% or 35%",
                      "max_loan_amount": "string e.g. ₹1.25 Lakh or ₹1.5 Crore",
                      "own_contribution": "string e.g. 5% or 10%",
                      "tenure": "string e.g. 3 years or 7 years",
                      "moratorium": "string e.g. 3 months or 6 months",
                      "required_documents": "Semi-colon separated list of exact required documents (e.g. Aadhaar / KYC; Community Certificate; DPR; Machinery Quotations; Bank Docs)",
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

        // 1. Social Category & Domicile Targeted Master Schemes (Tamil Nadu Grounded)
        if (category.contains("SC") || category.contains("SCHEDULED CASTE")) {
            // Flagship TN SC/ST Scheme: TN-004 AABCS
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TN-004")
                    .schemeName(isTamil 
                            ? "AABCS – அண்ணல் அம்பேத்கர் தொழில் முன்னோடிகள் திட்டம்" 
                            : "AABCS – Annal Ambedkar Business Champions Scheme (Official TN-004)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "100% பட்டியலின (SC/ST) தொழில்முனைவோர் மற்றும் நிறுவனங்கள்" 
                            : "Enterprises 100% owned by SC/ST entrepreneurs in Tamil Nadu")
                    .illustrativeBenefit(isTamil 
                            ? "35% நேரடி மூலதன மானியம் (அதிகபட்சம் ரூ. 1.50 கோடி) + 6% அரசு வட்டி மானியம் (Interest Subvention)" 
                            : "35% capital subsidy up to ₹1.50 Crore + 6% interest subvention for machinery loan up to 10 years")
                    .indicativeInterestRate(isTamil ? "வங்கி விகிதத்தில் 6% அரசு வட்டி மானியம்" : "Commercial bank rate with 6% interest subvention")
                    .participatingInstitutions("District Industries Centre (DIC) / District Level Sanctioning Committee")
                    .officialUrl("https://msmeonline.tn.gov.in/aabcs/")
                    .applicationChannel("Online AABCS portal / District Level Sanctioning Committee / DIC")
                    .subsidyPercentage("35% of eligible project cost (Max ₹1.50 Crore)")
                    .maxLoanAmount("65% Bank Finance")
                    .ownContribution("5% - 10%")
                    .tenure("Up to 10 years")
                    .moratorium("As per bank")
                    .requiredDocuments("Aadhaar / KYC; SC/ST Community Certificate; Detailed Project Report (DPR); Machinery Quotations; Bank Account Proof")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/aabcs/")
                    .build());

            // CEN-001 Micro Finance Scheme (MFS) via NSFDC
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("CEN-001")
                    .schemeName(isTamil 
                            ? "நுண்கடன் திட்டம் (MFS) – NSFDC / தாட்கோ" 
                            : "Micro Finance Scheme (MFS) – NSFDC (Official CEN-001)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "சிறு வருவாய் ஈட்டும் SC தொழில்முனைவோர் (குடும்ப வருமானம் <= ₹5 லட்சம்)" 
                            : "SC individuals with annual family income <= ₹5 Lakh")
                    .illustrativeBenefit(isTamil 
                            ? "ரூ. 1.40 லட்சம் வரை திட்ட மதிப்பீடு, 90% அரசு கடன் பங்கு (அதிகபட்சம் ரூ. 1.25 லட்சம்), 6.5% சலுகை வட்டி" 
                            : "Project cost up to ₹1.40 Lakh, 90% loan up to ₹1.25 Lakh, at 6.5% concessional interest rate")
                    .indicativeInterestRate("6.5% p.a. (Fixed)")
                    .participatingInstitutions("TAHDCO / State Channelising Agencies / PM-SURAJ")
                    .officialUrl("https://nsfdc.nic.in/")
                    .applicationChannel("PM-SURAJ / State Channelising Agencies (TAHDCO)")
                    .subsidyPercentage("90% Concessional Loan (Up to ₹1.25 Lakh)")
                    .maxLoanAmount("₹1.25 Lakh")
                    .ownContribution("Up to 10%")
                    .tenure("Up to 3 years")
                    .moratorium("3 months")
                    .requiredDocuments("Aadhaar / KYC; SC Caste Certificate; Family Income Proof (<= ₹5 Lakh); Micro Business Estimate; Bank Passbook")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Central Scheme under MoSJE / NSFDC — Apply via PM-SURAJ portal")
                    .build());

            // CEN-007 Stand-Up India
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("CEN-007")
                    .schemeName(isTamil 
                            ? "ஸ்டாண்ட்-அப் இந்தியா திட்டம் (Stand-Up India)" 
                            : "Stand-Up India Scheme for SC/ST & Women (Official CEN-007)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "பட்டியலின (SC/ST) மற்றும் மகளிர் தொழில்முனைவோர் (புதிய நிறுவனம்)" 
                            : "SC/ST and Women entrepreneurs setting up greenfield enterprises")
                    .illustrativeBenefit(isTamil 
                            ? "ரூ. 10.00 லட்சம் முதல் ரூ. 1.00 கோடி வரை பசுமை தொழில் ஒருங்கிணைந்த கடன், 15% சொந்த முதலீடு" 
                            : "Composite loan between ₹10 Lakh and ₹1 Crore for manufacturing, services, agri-allied or trading")
                    .indicativeInterestRate("MCLR + 3% + Tenor Premium")
                    .participatingInstitutions("Scheduled Commercial Banks / SIDBI / Stand-Up Mitra")
                    .officialUrl("https://www.standupmitra.in/")
                    .applicationChannel("Stand-Up Mitra Portal / All Commercial Bank Branches")
                    .subsidyPercentage("Credit Guarantee coverage (CGFSIL)")
                    .maxLoanAmount("₹1.00 Crore")
                    .ownContribution("15% (can converge with other subsidies)")
                    .tenure("Up to 7 years")
                    .moratorium("Up to 18 months")
                    .requiredDocuments("Aadhaar & PAN Card; SC/ST / Women Ownership Proof (51%+); Greenfield DPR; Machinery Quotations; Bank Account Details")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Central Scheme — Apply via standupmitra.in")
                    .build());
        } else if (isFemale) {
            // Flagship TN Women Scheme: TN-003 TWEES
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TN-003")
                    .schemeName(isTamil 
                            ? "TWEES – தமிழ்நாடு மகளிர் தொழில்முனைவோர் மேம்பாட்டு திட்டம்" 
                            : "TWEES – Tamil Nadu Women Entrepreneurs Empowerment Scheme (Official TN-003)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "தமிழ்நாடு பெண் தொழில்முனைவோர் (புதிய வணிகம்/சேவை/உற்பத்தி)" 
                            : "Women entrepreneurs with Tamil Nadu domicile establishing new enterprise")
                    .illustrativeBenefit(isTamil 
                            ? "திட்ட மதிப்பீட்டில் 95% வங்கி கடன், வெறும் 5% சொந்த முதலீடு, 25% மூலதன மானியம் (அதிகபட்சம் ரூ. 2.00 லட்சம்), பிணையில்லா கடன்" 
                            : "95% bank loan with only 5% promoter margin, 25% capital subsidy up to ₹2.00 Lakh, collateral-free")
                    .indicativeInterestRate("Bank lending rate")
                    .participatingInstitutions("District Industries Centre (DIC) / Commercial Banks")
                    .officialUrl("https://msmeonline.tn.gov.in/twees/")
                    .applicationChannel("Online TWEES portal / DIC / Banks")
                    .subsidyPercentage("25% of project cost (Max ₹2.00 Lakh)")
                    .maxLoanAmount("95% of project cost (Project up to ₹10 Lakh)")
                    .ownContribution("5% Promoter Contribution")
                    .tenure("As per bank (36 - 60 months)")
                    .moratorium("As per bank")
                    .requiredDocuments("Aadhaar / KYC; TN Residence Proof; Business Project Report (DPR); Machinery Invoices; Bank Account Passbook")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Tamil Nadu Government Scheme for Women — Apply via msmeonline.tn.gov.in/twees/")
                    .build());

            // TN-001 NEEDS (Special Category concession for Women)
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TN-001")
                    .schemeName(isTamil 
                            ? "NEEDS – புதிய தொழில்முனைவோர் மேம்பாட்டு திட்டம்" 
                            : "NEEDS – New Entrepreneur-cum-Enterprise Development Scheme (Official TN-001)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "பெண் தொழில்முனைவோர் (சிறப்பு பிரிவினருக்கு 5% குறைந்த சொந்த முதலீடு, 55 வயது வரை)" 
                            : "First-generation women entrepreneurs (5% promoter margin, age relaxation up to 55)")
                    .illustrativeBenefit(isTamil 
                            ? "25% அரசு மூலதன மானியம் (அதிகபட்சம் ரூ. 75 லட்சம்) + திருப்பிச் செலுத்தும் காலம் முழுவதும் 3% வட்டி மானியம்" 
                            : "25% capital subsidy up to ₹75 Lakh + 3% interest subvention throughout repayment period")
                    .indicativeInterestRate("Bank-linked with 3% Government interest subvention")
                    .participatingInstitutions("TIIC / Commercial Banks / TAICO / DIC")
                    .officialUrl("https://msmeonline.tn.gov.in/needs/")
                    .applicationChannel("Online NEEDS portal / TIIC / Commercial Banks / DIC")
                    .subsidyPercentage("25% of project cost (Max ₹75 Lakh)")
                    .maxLoanAmount("Bank/TIIC finance for balance project outlay (up to ₹5 Crore)")
                    .ownContribution("5% (Special / Women Category)")
                    .tenure("As per bank / TIIC")
                    .moratorium("As per bank")
                    .requiredDocuments("Aadhaar / KYC; Degree / Diploma Certificate; First-Gen Certificate; DPR; Machinery Quotations; Bank Documents")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/needs/")
                    .build());
        } else {
            // General / OBC: TN-001 NEEDS & TN-002 UYEGP
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TN-001")
                    .schemeName(isTamil 
                            ? "NEEDS – புதிய தொழில்முனைவோர் மற்றும் நிறுவன மேம்பாட்டு திட்டம்" 
                            : "NEEDS – New Entrepreneur-cum-Enterprise Development Scheme (Official TN-001)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "முதல் தலைமுறை தொழில்முனைவோர் (21-45 வயது, உற்பத்தி மற்றும் சேவை நிறுவனங்கள்)" 
                            : "First-generation entrepreneurs (Age 21-45, manufacturing & services)")
                    .illustrativeBenefit(isTamil 
                            ? "ரூ. 10 லட்சம் முதல் ரூ. 5 கோடி வரையிலான புதிய திட்டங்களுக்கு 25% மூலதன மானியம் (அதிகபட்சம் ரூ. 75 லட்சம்) + 3% அரசு வட்டி மானியம்" 
                            : "25% capital subsidy up to ₹75 Lakh + 3% interest subvention for projects between ₹10 Lakh and ₹5 Crore")
                    .indicativeInterestRate("Bank lending rate with 3% Government interest subvention")
                    .participatingInstitutions("TIIC / Commercial Banks / TAICO / DIC")
                    .officialUrl("https://msmeonline.tn.gov.in/needs/")
                    .applicationChannel("Online NEEDS portal / TIIC / Commercial Banks / TAICO / DIC")
                    .subsidyPercentage("25% of project cost (Max ₹75 Lakh)")
                    .maxLoanAmount("Project cost up to ₹5 Crore")
                    .ownContribution("10% General / 5% Special Categories")
                    .tenure("As per bank / TIIC")
                    .moratorium("As per bank")
                    .requiredDocuments("Aadhaar / KYC; Degree / Diploma Certificate; First-Gen Certificate; Detailed Project Report (DPR); Machinery Quotations")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/needs/")
                    .build());

            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TN-002")
                    .schemeName(isTamil 
                            ? "UYEGP – வேலைவாய்ப்பற்ற இளைஞர் வேலைவாய்ப்பு உருவாக்கும் திட்டம்" 
                            : "UYEGP – Unemployed Youth Employment Generation Programme (Official TN-002)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "தமிழ்நாடு சுயதொழில் இளைஞர்கள் (18-45 வயது, வர்த்தகம்/வணிக திட்டங்கள்)" 
                            : "Self-employment youth in Tamil Nadu for eligible business & trading projects up to ₹15 Lakh")
                    .illustrativeBenefit(isTamil 
                            ? "ரூ. 15.00 லட்சம் வரை திட்ட மதிப்பீடு, 25% அரசு மூலதன மானியம் (அதிகபட்சம் ரூ. 3.75 லட்சம்), 90-95% வங்கி கடன்" 
                            : "25% capital subsidy up to ₹3.75 Lakh with 90-95% bank finance for projects up to ₹15 Lakh")
                    .indicativeInterestRate("Bank lending rate")
                    .participatingInstitutions("District Industries Centre (DIC) / Commercial Banks")
                    .officialUrl("https://msmeonline.tn.gov.in/uyegp/")
                    .applicationChannel("Online UYEGP portal / DIC / Commercial Banks")
                    .subsidyPercentage("25% of project cost (Max ₹3.75 Lakh)")
                    .maxLoanAmount("90% - 95% of project cost (Project up to ₹15 Lakh)")
                    .ownContribution("10% General / 5% Special Categories")
                    .tenure("As per bank")
                    .moratorium("As per bank")
                    .requiredDocuments("Aadhaar / KYC; 8th Pass Transfer Certificate; Community Certificate; Project Quotation; Bank Documents")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/uyegp/")
                    .build());
        }

        // 2. Business Trade-Specific Match: PM Vishwakarma / TN-005 / CEN-004 Mudra / CEN-011 PM SVANidhi
        if (bizCategory.contains("artisan") || bizCategory.contains("craft") || bizCategory.contains("tailor") || bizCategory.contains("carpenter") || bizCategory.contains("wood")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("TN-005")
                    .schemeName(isTamil 
                            ? "கலைஞர் கைவினைத் திட்டம் (KKT) – தமிழ்நாடு அரசு" 
                            : "Kalaignar Kaivinai Thittam (KKT) – Tamil Nadu Artisan Scheme (Official TN-005)")
                    .category("business_linked")
                    .targetBeneficiaryMatch(isTamil 
                            ? "பாரம்பரிய கைவினைஞர்கள், தையல் மற்றும் கைவினை கலைஞர்கள்" 
                            : "Traditional artisans, craftsmen, and allied trades in Tamil Nadu")
                    .illustrativeBenefit(isTamil 
                            ? "25% நேரடி அரசு மூலதன மானியம் மற்றும் கடன் இணைப்பு உதவி" 
                            : "Credit-linked term loan with 25% capital subsidy for artisan self-employment")
                    .indicativeInterestRate("Subsidized cooperative/bank rate")
                    .participatingInstitutions("DIC / Handicrafts Department / Tamil Nadu Cooperative Banks")
                    .officialUrl("https://www.tn.gov.in/")
                    .applicationChannel("District Industries Centre / Tamil Nadu Handicrafts Development")
                    .subsidyPercentage("25% Capital Subsidy")
                    .maxLoanAmount("Credit-linked based on artisan trade")
                    .ownContribution("5% - 10%")
                    .tenure("3 to 5 years")
                    .requiredDocuments("Aadhaar; Artisan Welfare Board Registration Card; Trade Experience Proof; DPR; Bank Passbook")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Tamil Nadu Artisan Scheme — Apply via DIC")
                    .build());
        } else if (bizCategory.contains("vending") || bizCategory.contains("street") || bizCategory.contains("pushcart")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("CEN-011")
                    .schemeName(isTamil 
                            ? "பிரதமர் ஸ்வாநிதி திட்டம் (PM SVANidhi)" 
                            : "PM SVANidhi – Street Vendor's AtmaNirbhar Nidhi (Official CEN-011)")
                    .category("business_linked")
                    .targetBeneficiaryMatch(isTamil 
                            ? "தெருவோர வியாபாரிகள் மற்றும் தள்ளுவண்டி சிறு வணிகர்கள்" 
                            : "Street vendors in urban and peri-urban rural growth centres")
                    .illustrativeBenefit(isTamil 
                            ? "₹15,000 முதல் தவணை; ₹25,000 இரண்டாம் தவணை; ₹50,000 மூன்றாம் தவணை பிணையில்லா நடைமுறை மூலதனம், 7% வட்டி மானியம் மற்றும் டிஜிட்டல் கேஷ்பேக்" 
                            : "Collateral-free working capital in tranches (₹15k, ₹25k, ₹50k) with 7% interest subsidy & UPI cashback")
                    .indicativeInterestRate("Market rate with 7% direct interest subsidy")
                    .participatingInstitutions("Urban Local Bodies / Commercial Banks / Lending Institutions")
                    .officialUrl("https://pmsvanidhi.mohua.gov.in/")
                    .applicationChannel("PM SVANidhi portal / ULBs / Banks")
                    .subsidyPercentage("7% Interest Subsidy")
                    .maxLoanAmount("₹15,000 (1st) / ₹25,000 (2nd) / ₹50,000 (3rd)")
                    .ownContribution("0% (Nil)")
                    .tenure("12 to 36 months")
                    .moratorium("Nil")
                    .requiredDocuments("Aadhaar; Vending Certificate / LOR / Survey ID; Bank Account Details; Aadhaar-linked Mobile")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Central Scheme — Apply via pmsvanidhi.mohua.gov.in")
                    .build());
        } else {
            // CEN-004 PMMY MUDRA
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("CEN-004")
                    .schemeName(isTamil 
                            ? "பிரதமர் முத்ரா யோஜனா (PMMY) – கிஷோர் & தருண்" 
                            : "Pradhan Mantri MUDRA Yojana (PMMY) – Kishore & Tarun (Official CEN-004)")
                    .category("business_linked")
                    .targetBeneficiaryMatch(isTamil 
                            ? "சில்லறை வர்த்தகம், மளிகை, பல்பொருள் அங்காடி மற்றும் சேவை நிறுவனங்கள்" 
                            : "Micro and small business enterprises, retail trade, and service units")
                    .illustrativeBenefit(isTamil 
                            ? "ரூ. 50,000 முதல் ரூ. 10.00 லட்சம் வரை (தருண் பிளஸ் ரூ. 20 லட்சம் வரை) பிணையில்லா நடைமுறை மூலதன கடன், RuPay கார்டு" 
                            : "Collateral-free credit: Kishore (₹50k-₹5L), Tarun (₹5L-₹10L), Tarun Plus (₹10L-₹20L)")
                    .indicativeInterestRate("8.5% - 9.5% p.a. (bank-linked)")
                    .participatingInstitutions("All Commercial Banks / Regional Rural Banks / Small Finance Banks")
                    .officialUrl("https://www.mudra.org.in/")
                    .applicationChannel("Mudra Portal / Udyamimitra / All Bank Branches")
                    .subsidyPercentage("Nil margin up to ₹50,000; Credit Guarantee (CGFMU)")
                    .maxLoanAmount("Up to ₹10 Lakh (Tarun) / ₹20 Lakh (Tarun Plus)")
                    .ownContribution("0% (Shishu/Kishore) / up to 15% (Tarun)")
                    .tenure("Up to 5 years")
                    .moratorium("Up to 6 months")
                    .requiredDocuments("Aadhaar & PAN Card; Business Proof / Udyam; Passport Size Photos; Quotation for Machinery / Stock; 6 Months Bank Statement")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official Central MSME Scheme — Apply at any commercial bank or mudra.org.in")
                    .build());
        }

        // 3. Flagship Central Capital Subsidy: CEN-005 PMEGP
        recommended.add(RecommendedSchemeDto.builder()
                .schemeId("CEN-005")
                .schemeName(isTamil 
                        ? "பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)" 
                        : "Prime Minister's Employment Generation Programme (PMEGP Official CEN-005)")
                .category("bank_specific")
                .targetBeneficiaryMatch(isTamil 
                        ? "கிராமப்புற சிறு உற்பத்தி, செயலாக்கம் மற்றும் சேவை நிறுவனங்கள்" 
                        : "New micro-enterprises in manufacturing and services in rural/urban areas")
                .illustrativeBenefit(isTamil 
                        ? "கிராமப்புற சிறப்பு பிரிவினருக்கு 35% வரை திரும்ப செலுத்த வேண்டாத அரசு மூலதன மானியம் (நகர்ப்புறத்தில் 25%), வெறும் 5% சொந்த முதலீடு" 
                        : "Up to 35% rural margin money subsidy (25% urban) for special category (SC/ST/OBC/Women/PwD) with only 5% promoter margin")
                .indicativeInterestRate(isTamil ? "வங்கி வட்டி விகிதத்தில் 35% நேரடி மூலதன மானியம்" : "Normal bank rate with 35% back-ended capital grant")
                .participatingInstitutions("KVIC / KVIB / District Industries Centre (DIC) / Commercial Banks")
                .officialUrl("https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp")
                .applicationChannel("Online PMEGP e-Portal / KVIC / DIC / Banks")
                .subsidyPercentage("35% Rural Special / 25% Urban Special")
                .maxLoanAmount("Project cost up to ₹50 Lakh (Mfg) / ₹20 Lakh (Services)")
                .ownContribution("5% (Special Categories) / 10% (General)")
                .tenure("3 to 7 years (including lock-in of subsidy)")
                .moratorium("As per bank")
                .requiredDocuments("Aadhaar & PAN Card; Passport Size Photos; Detailed Project Report (DPR); Special Category / Caste Certificate; Bank Account Details")
                .isIllustrative(false)
                .mandatoryDisclosure("Official Central Scheme under Ministry of MSME — Apply via kviconline.gov.in")
                .build());

        // 4. Disability Support if applicable: Divyangjan Swavalamban
        if (isDisability) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NDFDC-001")
                    .schemeName(isTamil 
                            ? "திவ்யாங்ஜன் ஸ்வாவலம்பன் யோஜனா (NDFDC)" 
                            : "Divyangjan Swavalamban Yojana – NDFDC (Official)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch(isTamil 
                            ? "40% அல்லது அதற்கு மேற்பட்ட குறைபாடுடைய மாற்றுத்திறனாளி தொழில்முனைவோர்" 
                            : "Persons with Benchmark Disabilities (PwD 40%+ UDID card)")
                    .illustrativeBenefit(isTamil 
                            ? "ரூ. 5.00 லட்சம் வரை வெறும் 5.0% சலுகை வட்டியில் 100% கடன் நிதி உதவி, பெண்களுக்கு கூடுதல் 0.5% தள்ளுபடி" 
                            : "Concessional credit up to ₹5.00 Lakh at 5.0% interest rate with 0.5% special rebate for women")
                    .indicativeInterestRate("5.0% p.a.")
                    .participatingInstitutions("National Divyangjan Finance and Development Corporation (NDFDC)")
                    .officialUrl("https://nhfdc.nic.in/")
                    .applicationChannel("NDFDC / State Channelising Agencies / Nationalised Banks")
                    .subsidyPercentage("Interest concession down to 5.0% p.a.")
                    .maxLoanAmount("Up to ₹5.00 Lakh")
                    .ownContribution("Nil up to ₹50,000 / 5% above")
                    .tenure("Up to 7 years")
                    .isIllustrative(false)
                    .mandatoryDisclosure("Official MoSJE Concessional Credit Scheme for PwD")
                    .build());
        }

        // 5. Household Strategy Insight
        String appName = (q != null && q.getApplicantName() != null && !q.getApplicantName().trim().isEmpty())
                ? q.getApplicantName().trim()
                : (user != null && user.getName() != null ? user.getName() : "the Primary Applicant");
        String strategyInsight;
        if (isTamil) {
            if (category.contains("SC")) {
                strategyInsight = appName + " அவர்களின் சமூக தகுதி (SC) மற்றும் தமிழக அமைவிடத்தின் அடிப்படையில் 'அண்ணல் அம்பேத்கர் தொழில் முன்னோடிகள் திட்டம் (AABCS TN-004)' மூலம் அதிகபட்சம் 35% நேரடி மூலதன மானியம் (ரூ. 1.50 கோடி வரை) மற்றும் 6% வட்டி மானியம் பெற முழுத் தகுதி உள்ளது. கூடுதலாக NSFDC நுண்கடன் (MFS CEN-001) மூலம் 6.5% சலுகை வட்டி பெறலாம்.";
            } else if (isFemale) {
                strategyInsight = appName + " (பெண் தொழில்முனைவோர்) அவர்களின் பெயரில் பதிவு செய்வதன் மூலம் தமிழக அரசின் 'TWEES (TN-003)' திட்டத்தின் கீழ் 95% வங்கி கடன் மற்றும் 25% மூலதன மானியம் பிணையில்லாமல் பெறலாம். மேலும் PMEGP திட்டத்தில் 35% கிராமப்புற மானிய முன்னுரிமை கிடைக்கும்.";
            } else {
                strategyInsight = appName + " அவர்களுக்கு தமிழக அரசின் 'NEEDS (TN-001)' மூலம் 25% மூலதன மானியம் (ரூ. 75 லட்சம் வரை) மற்றும் 3% வட்டி மானியம், அல்லது 'UYEGP (TN-002)' மூலம் ரூ. 3.75 லட்சம் வரை மானியம் பொருந்தும். குடும்ப பெண் உறுப்பினர் பெயரில் கூட்டு விண்ணப்பம் செய்தால் கூடுதல் வட்டி சலுகை கிடைக்கும்.";
            }
        } else if (category.contains("SC")) {
            strategyInsight = "Based on " + appName + "'s SC demographic profile in Tamil Nadu, the enterprise is eligible for flagship Annal Ambedkar Business Champions Scheme (AABCS TN-004) offering a 35% capital subsidy up to ₹1.50 Crore plus 6% interest subvention, alongside NSFDC Micro Finance Scheme (CEN-001) at 6.5% interest.";
        } else if (isFemale) {
            strategyInsight = "Registering under " + appName + " (Female) unlocks Tamil Nadu's TWEES scheme (TN-003) providing 95% bank finance with only 5% margin, 25% capital subsidy, nil collateral, and maximum 35% rural subsidy quota under PMEGP.";
        } else {
            strategyInsight = "Enterprise profile matches Tamil Nadu's flagship NEEDS (TN-001) scheme for 25% capital subsidy up to ₹75 Lakh + 3% interest subvention, and UYEGP (TN-002) for projects up to ₹15 Lakh. Adding an eligible female family co-applicant unlocks additional 5% promoter margin concessions.";
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
