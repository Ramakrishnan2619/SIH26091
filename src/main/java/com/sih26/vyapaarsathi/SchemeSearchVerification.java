package com.sih26.vyapaarsathi;

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
import com.sih26.vyapaarsathi.service.SchemeSearchService;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class SchemeSearchVerification {

    public static void main(String[] args) throws Exception {
        System.out.println("===============================================================");
        System.out.println("  VYAPAARSATHI PRD-06 SCHEME DISCOVERY VERIFICATION");
        System.out.println("===============================================================\n");

        ObjectMapper objectMapper = new ObjectMapper();

        // 1. Setup Test Assessment Entity
        Assessment testAssessment = new Assessment();
        testAssessment.setAssessmentId(1025L);
        testAssessment.setBusinessCategory("Grocery & Daily Provisions");
        testAssessment.setMarginCapital(new BigDecimal("100000.00"));
        testAssessment.setCreatedAt(Instant.now());

        User testUser = new User();
        testUser.setUserId(1L);
        testUser.setName("Meena Devi");
        testUser.setPreferredLanguage(User.PreferredLanguage.ta);
        testAssessment.setUser(testUser);

        // 2. Setup Dynamic Proxies for Repositories
        List<SchemeSearchSession> savedSessions = new ArrayList<>();

        SchemeSearchSessionRepository mockSessionRepo = (SchemeSearchSessionRepository) Proxy.newProxyInstance(
                SchemeSearchSessionRepository.class.getClassLoader(),
                new Class<?>[]{SchemeSearchSessionRepository.class},
                (proxy, method, methodArgs) -> {
                    String name = method.getName();
                    if ("save".equals(name)) {
                        SchemeSearchSession s = (SchemeSearchSession) methodArgs[0];
                        if (s.getSessionId() == null) {
                            setField(s, "sessionId", (long) (savedSessions.size() + 801));
                        }
                        savedSessions.add(s);
                        return s;
                    } else if ("findById".equals(name)) {
                        Long id = (Long) methodArgs[0];
                        return savedSessions.stream()
                                .filter(s -> id.equals(s.getSessionId()))
                                .findFirst();
                    }
                    return null;
                }
        );

        AssessmentRepository mockAssessmentRepo = (AssessmentRepository) Proxy.newProxyInstance(
                AssessmentRepository.class.getClassLoader(),
                new Class<?>[]{AssessmentRepository.class},
                (proxy, method, methodArgs) -> {
                    if ("findById".equals(method.getName())) {
                        Long id = (Long) methodArgs[0];
                        if (Long.valueOf(1025L).equals(id)) {
                            return Optional.of(testAssessment);
                        }
                    }
                    return Optional.empty();
                }
        );

        // 3. Instantiate and Initialize SchemeSearchService
        SchemeSearchService service = new SchemeSearchService(
                mockSessionRepo,
                mockAssessmentRepo,
                objectMapper
        );
        service.init();

        // =========================================================================
        // TEST 1: Archetype Catalog Completeness (FR-6.4)
        // =========================================================================
        System.out.println("TEST 1: Verifying Static Archetype Catalog Loading (FR-6.4)...");
        List<SchemeArchetypeDto> catalog = service.getArchetypeCatalog();
        System.out.println("  Archetypes loaded: " + catalog.size());
        if (catalog.size() < 8) {
            throw new AssertionError("TEST 1 FAILED: Expected at least 8 archetypes, found " + catalog.size());
        }
        for (SchemeArchetypeDto a : catalog) {
            if (!Boolean.TRUE.equals(a.getIsIllustrative())) {
                throw new AssertionError("TEST 1 FAILED: Archetype " + a.getSchemeId() + " missing is_illustrative: true");
            }
            if (a.getMandatoryDisclosure() == null || !a.getMandatoryDisclosure().contains("AI-generated illustrative match")) {
                throw new AssertionError("TEST 1 FAILED: Archetype " + a.getSchemeId() + " missing mandatory disclosure");
            }
        }
        System.out.println("  ✓ All " + catalog.size() + " archetypes loaded with verified mandatory disclaimers.");

        // =========================================================================
        // TEST 2: Progressive Household Search Execution (FR-6.2 & FR-6.5)
        // =========================================================================
        System.out.println("\nTEST 2: Executing Progressive Scheme Search for Meena Devi (SC Female)...");
        SchemeSearchRequest request = new SchemeSearchRequest();
        request.setAssessmentId(1025L);

        SchemeSearchRequest.QuestionnaireDto q = new SchemeSearchRequest.QuestionnaireDto();
        q.setOwnership("Me (Primary Applicant)");

        SchemeSearchRequest.PrimaryApplicantDto applicant = new SchemeSearchRequest.PrimaryApplicantDto();
        applicant.setAge(34);
        applicant.setGender("Female");
        applicant.setSocialCategory("SC");
        applicant.setAnnualHouseholdIncomeBand("< ₹1.5 Lakh");
        applicant.setEducationLevel("10th Pass");
        applicant.setDisabilityStatus(false);
        applicant.setExServicemenStatus(false);
        q.setPrimaryApplicant(applicant);

        SchemeSearchRequest.HouseholdHistoryDto history = new SchemeSearchRequest.HouseholdHistoryDto();
        history.setHasExistingBusiness(false);
        history.setPreviousSubsidies("None");
        history.setCoApplicant(new SchemeSearchRequest.CoApplicantDto("Spouse", "Male", false));
        q.setHouseholdHistory(history);

        request.setQuestionnaire(q);

        SchemeSearchResponse response = service.searchSchemes(request, testUser);

        // Verify session persistence
        if (response.getSessionId() == null || response.getSessionId() < 801) {
            throw new AssertionError("TEST 2 FAILED: Invalid session_id: " + response.getSessionId());
        }
        System.out.println("  ✓ Generated session ID: #" + response.getSessionId());

        // =========================================================================
        // TEST 3: Mandatory Global and Card-Level Disclaimers (FR-6.6, FR-6.8, FR-6.9)
        // =========================================================================
        System.out.println("\nTEST 3: Verifying Mandatory Non-Removable Disclaimers (FR-6.6 & FR-6.8)...");
        if (!Boolean.TRUE.equals(response.getIsIllustrative())) {
            throw new AssertionError("TEST 3 FAILED: response.is_illustrative must be TRUE");
        }
        if (response.getMandatoryGlobalDisclosure() == null ||
            !response.getMandatoryGlobalDisclosure().contains("do NOT constitute statutory sanction")) {
            throw new AssertionError("TEST 3 FAILED: Global mandatory disclosure missing statutory warning");
        }
        System.out.println("  ✓ Global disclosure: " + response.getMandatoryGlobalDisclosure());

        for (RecommendedSchemeDto s : response.getRecommendedSchemes()) {
            if (!Boolean.TRUE.equals(s.getIsIllustrative())) {
                throw new AssertionError("TEST 3 FAILED: Scheme " + s.getSchemeId() + " has is_illustrative false");
            }
            if (s.getMandatoryDisclosure() == null || !s.getMandatoryDisclosure().contains("AI-generated illustrative match")) {
                throw new AssertionError("TEST 3 FAILED: Scheme " + s.getSchemeId() + " missing mandatory card disclosure");
            }
        }
        System.out.println("  ✓ All " + response.getRecommendedSchemes().size() + " recommended scheme cards contain verified disclaimers.");

        // =========================================================================
        // TEST 4: Household Strategy Insight (FR-6.5)
        // =========================================================================
        System.out.println("\nTEST 4: Verifying Household Strategy Optimization Insight...");
        String insight = response.getHouseholdStrategyInsight();
        System.out.println("  Insight: " + insight);
        if (insight == null || !insight.toLowerCase().contains("female") || !insight.toLowerCase().contains("rebate")) {
            throw new AssertionError("TEST 4 FAILED: Household strategy did not highlight female rebate advantages");
        }
        System.out.println("  ✓ Correctly generated gender/caste strategy recommendations.");

        // =========================================================================
        // TEST 5: Scheme Category Grouping (FR-6.7)
        // =========================================================================
        System.out.println("\nTEST 5: Verifying Tri-Bucket Visual Categorization (FR-6.7)...");
        boolean hasBusinessLinked = response.getRecommendedSchemes().stream().anyMatch(s -> "business_linked".equals(s.getCategory()));
        boolean hasBankSpecific = response.getRecommendedSchemes().stream().anyMatch(s -> "bank_specific".equals(s.getCategory()));
        boolean hasLoanType = response.getRecommendedSchemes().stream().anyMatch(s -> "loan_type_specific".equals(s.getCategory()));

        System.out.println("  Business-Linked matches present: " + hasBusinessLinked);
        System.out.println("  Bank-Specific matches present:    " + hasBankSpecific);
        System.out.println("  Loan/Subsidy matches present:     " + hasLoanType);

        if (!hasBusinessLinked || !hasBankSpecific || !hasLoanType) {
            throw new AssertionError("TEST 5 FAILED: Must contain schemes across all 3 visual categories");
        }
        System.out.println("  ✓ Tri-bucket category distribution verified.");

        System.out.println("\n===============================================================");
        System.out.println("  ALL 5 PRD-06 SCHEME DISCOVERY TESTS PASSED!");
        System.out.println("===============================================================");
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }
}
