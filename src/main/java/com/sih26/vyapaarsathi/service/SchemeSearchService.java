package com.sih26.vyapaarsathi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchemeSearchService {

    private final SchemeSearchSessionRepository sessionRepository;
    private final AssessmentRepository assessmentRepository;
    private final ObjectMapper objectMapper;

    private List<SchemeArchetypeDto> archetypeCatalog = new ArrayList<>();

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
        SchemeSearchRequest.PrimaryApplicantDto applicant = q.getPrimaryApplicant();

        // 1. Synthesize Tailored Recommendations based on Archetype Catalog
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
        String strategyInsight;
        if (isFemale) {
            strategyInsight = "Registering the enterprise under " +
                    (user != null && user.getName() != null ? user.getName() : "the Primary Applicant") +
                    " (Female) unlocks an additional 0.5% to 1.5% concessional interest rebate and higher rural subsidy priority under apex corporation schemes.";
        } else {
            strategyInsight = "If registered jointly with a female family member, the enterprise may qualify for enhanced Mahila Samriddhi subvention and higher KVIC subsidy margins.";
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
