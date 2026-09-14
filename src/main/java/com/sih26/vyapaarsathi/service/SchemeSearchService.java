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
        Assessment assessment = assessmentRepository.findById(req.getAssessmentId())
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found: " + req.getAssessmentId()));

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

        // 3. Persist Search Session to DB
        SchemeSearchSession session = new SchemeSearchSession();
        session.setAssessment(assessment);
        try {
            session.setHouseholdAnswersJson(objectMapper.writeValueAsString(q));
            session.setGeneratedSchemesJson(objectMapper.writeValueAsString(recommended));
        } catch (Exception e) {
            log.error("Failed to serialize scheme session data", e);
        }
        session.setCreatedAt(Instant.now());
        SchemeSearchSession savedSession = sessionRepository.save(session);

        return SchemeSearchResponse.builder()
                .sessionId(savedSession.getSessionId())
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
        String category = applicant != null && applicant.getSocialCategory() != null ? applicant.getSocialCategory() : "SC";
        boolean isFemale = "female".equalsIgnoreCase(gender);
        boolean isDisability = applicant != null && Boolean.TRUE.equals(applicant.getDisabilityStatus());
        String bizCategory = assessment.getBusinessCategory() != null ? assessment.getBusinessCategory().toLowerCase() : "retail";

        // Archetype 1: Women SC Credit (Mahila Samriddhi)
        if (isFemale || "sc".equalsIgnoreCase(category)) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NSFDC_MAHILA_SAMRIDDHI")
                    .schemeName("NSFDC Mahila Samriddhi Yojana (Illustrative)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch("Recommended for " + gender + " " + category + " entrepreneur")
                    .illustrativeBenefit("Up to ₹1,40,000 credit limit with special 1.5% interest subvention for rural women SHG members")
                    .indicativeInterestRate("4.0% - 6.5% p.a. concessional")
                    .participatingInstitutions("State Channelizing Agencies (SCAs) / NSFDC / Regional Rural Banks")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // Archetype 2: Business-linked (Dairy vs Retail / Grocery)
        if (bizCategory.contains("dairy") || bizCategory.contains("milk") || bizCategory.contains("cattle")) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("MICRO_WOMEN_DAIRY")
                    .schemeName("Women Rural Dairy Cooperative Scheme (Illustrative)")
                    .category("business_linked")
                    .targetBeneficiaryMatch("Specific matching for Dairy & Milk Production enterprise")
                    .illustrativeBenefit("Working capital and milch cattle financing with milk collection tie-up and 25% back-ended capital subsidy")
                    .indicativeInterestRate("5.0% - 6.5% p.a.")
                    .participatingInstitutions("District Cooperative Milk Producers Union / NABARD")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("MUDRA_SHISHU_RETAIL")
                    .schemeName("Pradhan Mantri MUDRA Yojana - Shishu (Illustrative)")
                    .category("business_linked")
                    .targetBeneficiaryMatch("Matching for Grocery, Provisions, and Micro Retail Trade")
                    .illustrativeBenefit("Collateral-free working capital loan up to ₹50,000 with RuPay business debit card")
                    .indicativeInterestRate("7.5% - 9.0% p.a.")
                    .participatingInstitutions("All Public Sector Banks & Regional Rural Banks")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // Archetype 3: Bank & Apex Corporation Term Loan
        if ("obc".equalsIgnoreCase(category)) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NBCFDC_GENERAL_TERM_LOAN")
                    .schemeName("NBCFDC General Term Loan Scheme (Illustrative)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch("Other Backward Classes (OBC) target demographic")
                    .illustrativeBenefit("90% concessional credit up to ₹50 Lakh with 84-month repayment tenure and 6-month moratorium")
                    .indicativeInterestRate("8.0% p.a. (reducing balance)")
                    .participatingInstitutions("State Backward Classes Economic Development Corporation")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else if ("safai karamchari".equalsIgnoreCase(category)) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NSKFDC_SWACCHTA_UDYAMI")
                    .schemeName("NSKFDC Swacchta Udyami Yojana (Illustrative)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch("Safai Karamchari & Sanitation Workers Community")
                    .illustrativeBenefit("Capital subsidy up to ₹3,25,000 with 4.0% concessional interest rate")
                    .indicativeInterestRate("4.0% - 6.0% p.a.")
                    .participatingInstitutions("National Safai Karamcharis Finance & Development Corporation")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("PMEGP_RURAL_ARTISAN")
                    .schemeName("Prime Minister Employment Generation Programme (PMEGP)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch("Rural Micro-Enterprise & Service Units")
                    .illustrativeBenefit("Up to 35% margin money government subsidy in rural areas for special category beneficiaries")
                    .indicativeInterestRate("Standard bank lending rate with back-ended subsidy")
                    .participatingInstitutions("KVIC / KVIB / District Industries Centre (DIC)")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // Archetype 4: Disability or Stand-Up India
        if (isDisability) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("NHFDC_DIVYANGJAN_SWAVALAMBAN")
                    .schemeName("Divyangjan Swavalamban Yojana (Illustrative)")
                    .category("bank_specific")
                    .targetBeneficiaryMatch("Persons with Benchmark Disabilities (PwD)")
                    .illustrativeBenefit("100% concessional credit up to ₹5,00,000 with 0.5% special rebate for women")
                    .indicativeInterestRate("5.0% p.a.")
                    .participatingInstitutions("National Handicapped Finance and Development Corporation (NHFDC)")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        } else if (isFemale) {
            recommended.add(RecommendedSchemeDto.builder()
                    .schemeId("STANDUP_INDIA_SC_WOMEN")
                    .schemeName("Stand-Up India Scheme (Illustrative)")
                    .category("loan_type_specific")
                    .targetBeneficiaryMatch("Women & SC/ST Greenfield Enterprise Promotion")
                    .illustrativeBenefit("Composite term and working capital finance from ₹10 Lakh to ₹1 Crore")
                    .indicativeInterestRate("MCLR + 3% concessional ceiling")
                    .participatingInstitutions("All Scheduled Commercial Bank branches (2 loans mandated per branch)")
                    .isIllustrative(true)
                    .mandatoryDisclosure("AI-generated illustrative match — verify with your nearest SCA/bank before applying")
                    .build());
        }

        // 2. Household Strategy Insight
        String appName = (q != null && q.getApplicantName() != null && !q.getApplicantName().trim().isEmpty())
                ? q.getApplicantName().trim()
                : (user != null && user.getName() != null ? user.getName() : "the Primary Applicant");
        String strategyInsight;
        if (isFemale) {
            strategyInsight = "Registering the enterprise under " + appName +
                    " (Female) unlocks an additional 0.5% to 1.5% concessional interest rebate and higher rural subsidy priority under apex corporation schemes.";
        } else {
            strategyInsight = "Registering the enterprise under " + appName +
                    " positions the business for targeted concessional schemes. If registered jointly with an eligible female family member, the enterprise may also qualify for enhanced Mahila Samriddhi subvention and higher subsidy margins.";
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
