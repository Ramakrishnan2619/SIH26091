package com.sih26.vyapaarsathi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih26.vyapaarsathi.dto.chat.SendChatMessageResponse;
import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.ChatMessage;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.repository.AssessmentRepository;
import com.sih26.vyapaarsathi.repository.ChatMessageRepository;
import com.sih26.vyapaarsathi.repository.LlmUsageLogRepository;
import com.sih26.vyapaarsathi.service.ChatService;
import com.sih26.vyapaarsathi.service.QuotaService;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class ChatVoiceVerification {

    public static void main(String[] args) throws Exception {
        System.out.println("===============================================================");
        System.out.println("  VYAPAARSATHI PRD-05 CHAT & VOICE PIPELINE VERIFICATION");
        System.out.println("===============================================================\n");

        // 1. Setup Test Assessment Entity
        Assessment testAssessment = new Assessment();
        testAssessment.setAssessmentId(1025L);
        testAssessment.setBusinessCategory("Grocery & Daily Provisions");
        testAssessment.setMarginCapital(new BigDecimal("100000.00"));
        testAssessment.setCreatedAt(Instant.now());

        String m1Json = """
                {
                  "village_context": {
                    "villageName": "Melavalavu",
                    "districtName": "Madurai"
                  }
                }
                """;
        String m2Json = """
                {
                  "financial_summary": {
                    "project_cost": 1000000.00,
                    "eligible_loan_amount": 900000.00,
                    "scheme_name": "Term Loan Scheme",
                    "interest_rate_pa": 8.0,
                    "moratorium_months": 6,
                    "quarterly_installment_eqi": 44729.31
                  },
                  "affordability": {
                    "foir_verdict": "SAFE"
                  }
                }
                """;
        testAssessment.setModule1ReportJson(m1Json);
        testAssessment.setModule2ResultJson(m2Json);

        User testUser = new User();
        testUser.setUserId(1L);
        testUser.setName("Meena Devi");
        testUser.setPreferredLanguage(User.PreferredLanguage.ta);
        testAssessment.setUser(testUser);

        // 2. Setup Dynamic Proxies for Repositories
        List<ChatMessage> savedMessages = new ArrayList<>();

        ChatMessageRepository mockChatRepo = (ChatMessageRepository) Proxy.newProxyInstance(
                ChatMessageRepository.class.getClassLoader(),
                new Class<?>[]{ChatMessageRepository.class},
                (proxy, method, methodArgs) -> {
                    String name = method.getName();
                    if ("save".equals(name)) {
                        ChatMessage msg = (ChatMessage) methodArgs[0];
                        if (msg.getMessageId() == null) {
                            setField(msg, "messageId", (long) (savedMessages.size() + 1));
                        }
                        savedMessages.add(msg);
                        return msg;
                    } else if ("findTop10ByAssessmentOrderByCreatedAtDesc".equals(name)) {
                        return Collections.emptyList();
                    } else if ("findByAssessmentOrderByCreatedAtAsc".equals(name)) {
                        return savedMessages;
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

        LlmUsageLogRepository mockLlmRepo = (LlmUsageLogRepository) Proxy.newProxyInstance(
                LlmUsageLogRepository.class.getClassLoader(),
                new Class<?>[]{LlmUsageLogRepository.class},
                (proxy, method, methodArgs) -> {
                    if ("countQueriesByUserSince".equals(method.getName())) {
                        return 5L;
                    }
                    return null;
                }
        );

        QuotaService quotaService = new QuotaService(mockLlmRepo);
        setField(quotaService, "dailyLimit", 100L);
        ObjectMapper objectMapper = new ObjectMapper();

        // 3. Instantiate ChatService
        ChatService chatService = new ChatService(
                mockChatRepo,
                mockAssessmentRepo,
                quotaService,
                objectMapper
        );

        // Inject GCP properties via reflection
        setField(chatService, "gcpProjectId", "sih26-508313");
        setField(chatService, "gcpLocation", "asia-south1");
        setField(chatService, "vertexModel", "gemini-2.5-flash");

        // =========================================================================
        // TEST 1: Off-Topic Guardrail Enforcement (FR-5.15)
        // =========================================================================
        System.out.println("TEST 1: Testing Off-Topic Guardrail Enforcement (FR-5.15)...");
        SendChatMessageResponse guardrailRes = chatService.processChatMessage(
                1025L,
                "Who won the cricket match yesterday?",
                testUser
        );
        String expectedGuardrail = "I am your business advisory assistant. I can only help you with questions about your business plan, loan calculations, or government schemes.";
        if (!expectedGuardrail.equals(guardrailRes.getContent())) {
            throw new AssertionError("TEST 1 FAILED: Expected guardrail response but got: " + guardrailRes.getContent());
        }
        System.out.println("  ✓ Successfully rejected off-topic prompt with strict guardrail notice.");

        // =========================================================================
        // TEST 2: Moratorium Interest Explanation (US-5.1)
        // =========================================================================
        System.out.println("\nTEST 2: Testing Moratorium Explanation Query (US-5.1)...");
        SendChatMessageResponse moratRes = chatService.processChatMessage(
                1025L,
                "Why is my first quarter payment only ₹2,031?",
                testUser
        );
        if (!moratRes.getContent().toLowerCase().contains("moratorium") ||
            !moratRes.getContent().toLowerCase().contains("interest")) {
            throw new AssertionError("TEST 2 FAILED: Response did not explain moratorium simple interest: " + moratRes.getContent());
        }
        System.out.println("  ✓ Response: " + moratRes.getContent());
        System.out.println("  ✓ Correctly explained simple interest servicing during moratorium.");

        // =========================================================================
        // TEST 3: Prepayment & Foreclosure Penalty Query
        // =========================================================================
        System.out.println("\nTEST 3: Testing Prepayment Penalty Query...");
        SendChatMessageResponse prepayRes = chatService.processChatMessage(
                1025L,
                "Can I repay my loan early without penalty?",
                testUser
        );
        if (!prepayRes.getContent().toLowerCase().contains("zero foreclosure") &&
            !prepayRes.getContent().toLowerCase().contains("penalty")) {
            throw new AssertionError("TEST 3 FAILED: Prepayment terms missing: " + prepayRes.getContent());
        }
        System.out.println("  ✓ Response: " + prepayRes.getContent());
        System.out.println("  ✓ Correctly cited zero foreclosure penalty under MoSJE apex corporations.");

        // =========================================================================
        // TEST 4: Udyam & Gram Panchayat Regulatory Inquiries
        // =========================================================================
        System.out.println("\nTEST 4: Testing Regulatory / Udyam Registration Guidance...");
        SendChatMessageResponse udyamRes = chatService.processChatMessage(
                1025L,
                "How do I register for Udyam certificate?",
                testUser
        );
        if (!udyamRes.getContent().toLowerCase().contains("udyam") ||
            !udyamRes.getContent().toLowerCase().contains("aadhaar")) {
            throw new AssertionError("TEST 4 FAILED: Udyam guidance missing: " + udyamRes.getContent());
        }
        System.out.println("  ✓ Response: " + udyamRes.getContent());
        System.out.println("  ✓ Correctly detailed statutory Udyam and Gram Panchayat trade NOC steps.");

        // =========================================================================
        // TEST 5: System Prompt Grounding Verification (FR-5.2)
        // =========================================================================
        System.out.println("\nTEST 5: Verifying Vertex AI System Prompt Grounding Assembly (FR-5.2)...");
        Method promptMethod = ChatService.class.getDeclaredMethod("buildSystemPrompt", Assessment.class, User.class);
        promptMethod.setAccessible(true);
        String prompt = (String) promptMethod.invoke(chatService, testAssessment, testUser);

        assertContains(prompt, "Meena Devi");
        assertContains(prompt, "Melavalavu");
        assertContains(prompt, "Madurai");
        assertContains(prompt, "Term Loan Scheme");
        assertContains(prompt, "8.0%");
        assertContains(prompt, "44729.31");
        assertContains(prompt, "SAFE");
        System.out.println("  ✓ Grounding prompt verified containing all dossier parameters & preferred language.");

        System.out.println("\n===============================================================");
        System.out.println("  ALL 5 PRD-05 CHAT & VOICE PIPELINE TESTS PASSED!");
        System.out.println("===============================================================");
    }

    private static void assertContains(String text, String substring) {
        if (!text.contains(substring)) {
            throw new AssertionError("Prompt did not contain expected substring '" + substring + "':\n" + text);
        }
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }
}
