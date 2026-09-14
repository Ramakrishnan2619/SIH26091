package com.sih26.vyapaarsathi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import com.sih26.vyapaarsathi.dto.chat.ChatMessageDto;
import com.sih26.vyapaarsathi.dto.chat.SendChatMessageResponse;
import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.ChatMessage;
import com.sih26.vyapaarsathi.entity.User;
import com.sih26.vyapaarsathi.repository.AssessmentRepository;
import com.sih26.vyapaarsathi.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final AssessmentRepository assessmentRepository;
    private final QuotaService quotaService;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private GeminiApiClient geminiApiClient;

    @Value("${app.gcp.project-id:sih26-508313}")
    private String gcpProjectId;

    @Value("${app.gcp.location:asia-south1}")
    private String gcpLocation;

    @Value("${app.gcp.vertex-model:gemini-2.5-flash}")
    private String vertexModel;

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(Long assessmentId, User user) {
        Assessment assessment = resolveAssessment(assessmentId, user);
        if (assessment == null) {
            return Collections.emptyList();
        }

        List<ChatMessage> messages = chatMessageRepository.findByAssessmentOrderByCreatedAtAsc(assessment);
        return messages.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private Assessment resolveAssessment(Long assessmentId, User user) {
        if (assessmentId != null) {
            java.util.Optional<Assessment> opt = assessmentRepository.findById(assessmentId);
            if (opt.isPresent()) return opt.get();
        }
        if (user != null) {
            List<Assessment> userAssessments = assessmentRepository.findByUserOrderByCreatedAtDesc(user);
            if (!userAssessments.isEmpty()) return userAssessments.get(0);
        }
        List<Assessment> all = assessmentRepository.findAll();
        if (!all.isEmpty()) {
            return all.get(all.size() - 1);
        }
        return null;
    }

    @Transactional
    public SendChatMessageResponse processChatMessage(Long assessmentId, String userText, User user) {
        return processChatMessage(assessmentId, userText, user, null);
    }

    @Transactional
    public SendChatMessageResponse processChatMessage(Long assessmentId, String userText, User user, String preferredLang) {
        // 1. Quota Check
        if (user != null) {
            quotaService.checkQuota(user);
        }

        // 2. Retrieve Assessment safely
        Assessment assessment = resolveAssessment(assessmentId, user);
        if (assessment == null) {
            assessment = new Assessment();
            assessment.setUser(user);
            assessment.setBusinessCategory("Retail & Provisions");
            assessment.setMarginCapital(new java.math.BigDecimal("100000"));
            assessment.setCreatedAt(Instant.now());
            assessment = assessmentRepository.save(assessment);
        }

        // 3. Save User Message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setAssessment(assessment);
        userMsg.setSender(ChatMessage.MessageSender.user);
        userMsg.setContent(userText);
        userMsg.setIsVoice(false);
        userMsg.setCreatedAt(Instant.now());
        chatMessageRepository.save(userMsg);

        // Language resolution
        String userLang = user != null && user.getPreferredLanguage() != null ? user.getPreferredLanguage().name() : "en";
        String resolvedLang = (preferredLang != null && !preferredLang.isBlank()) ? preferredLang : userLang;
        String trimmed = userText != null ? userText.trim() : "";
        boolean isTamil = "ta".equalsIgnoreCase(resolvedLang) || trimmed.contains("வணக்கம்") || trimmed.contains("ஹலோ") || trimmed.toLowerCase().contains("vanakkam") || containsTamilScript(trimmed);
        boolean isHindi = "hi".equalsIgnoreCase(resolvedLang) || trimmed.contains("नमस्ते") || trimmed.contains("हेलो") || trimmed.toLowerCase().contains("namaste") || containsDevanagariScript(trimmed);
        boolean isTelugu = "te".equalsIgnoreCase(resolvedLang) || trimmed.contains("నమస్కారం") || trimmed.toLowerCase().contains("namaskaram") || containsTeluguScript(trimmed);

        // 4. Check Greetings & Off-Topic Guardrail (FR-5.15)
        if (isGreeting(userText)) {
            String greetingReply = isTamil
                    ? "வணக்கம்! நான் வியாபார்சாதி, உங்கள் AI கடன் மற்றும் வணிக உதவியாளர். உங்கள் திட்ட அறிக்கை, கடன் தவணை அல்லது அரசு மானியம் குறித்து எவ்வாறு உதவ வேண்டும்?"
                    : isHindi
                    ? "नमस्ते! मैं व्यापारसाथी, आपका AI क्रेडिट एवं बिज़नेस सहायक हूँ। मैं आपकी रिपोर्ट, ऋण चुकौती अनुसूची या सरकारी योजनाओं में किस प्रकार सहायता कर सकता हूँ?"
                    : isTelugu
                    ? "నమస్కారం! నేను వ్యాపార్‌సాథి, మీ AI క్రెడిట్ మరియు బిజినెస్ సహాయకుడిని. మీ నివేదిక లేదా ప్రభుత్వ పథకాల గురించి నేను మీకు ఎలా సహాయపడగలను?"
                    : "Namaste! I am VyapaarSathi, your AI Credit & Business Sahayak. How can I assist you with your feasibility report, repayment schedule, or government schemes today?";

            ChatMessage asstMsg = saveAssistantMessage(assessment, greetingReply, false);
            return SendChatMessageResponse.builder()
                    .messageId(asstMsg.getMessageId())
                    .sender("assistant")
                    .content(greetingReply)
                    .tokensUsed(15)
                    .createdAt(asstMsg.getCreatedAt())
                    .build();
        }

        if (isOffTopic(userText)) {
            String guardrailReply = isTamil
                    ? "நான் உங்கள் வணிக ஆலோசனை உதவியாளர். உங்கள் வணிகத் திட்டம், கடன் கணக்கீடுகள் அல்லது அரசுத் திட்டங்கள் தொடர்பான கேள்விகளுக்கு மட்டுமே நான் உதவ முடியும்."
                    : "I am your business advisory assistant. I can only help you with questions about your business plan, loan calculations, or government schemes.";
            ChatMessage asstMsg = saveAssistantMessage(assessment, guardrailReply, false);
            return SendChatMessageResponse.builder()
                    .messageId(asstMsg.getMessageId())
                    .sender("assistant")
                    .content(guardrailReply)
                    .tokensUsed(25)
                    .createdAt(asstMsg.getCreatedAt())
                    .build();
        }

        // 5. Build Context & Call Vertex AI
        String assistantReply;
        int tokensUsed = 320;

        try {
            assistantReply = callVertexAiGemini(assessment, userText, user, resolvedLang);
            if (assistantReply != null && !assistantReply.trim().isEmpty()) {
                tokensUsed = 450;
            } else {
                assistantReply = buildContextualFallbackResponse(assessment, userText, resolvedLang);
            }
        } catch (Exception ex) {
            log.warn("Vertex AI chat generation bypassed or failed ({}), applying grounded dossier engine.", ex.getMessage());
            assistantReply = buildContextualFallbackResponse(assessment, userText, resolvedLang);
        }

        // 6. Save Assistant Reply
        ChatMessage asstMsg = saveAssistantMessage(assessment, assistantReply, false);

        // 7. Record Quota Usage
        if (user != null) {
            quotaService.recordUsage(user, vertexModel, tokensUsed);
        }

        return SendChatMessageResponse.builder()
                .messageId(asstMsg.getMessageId())
                .sender("assistant")
                .content(assistantReply)
                .tokensUsed(tokensUsed)
                .createdAt(asstMsg.getCreatedAt())
                .build();
    }

    private ChatMessage saveAssistantMessage(Assessment assessment, String content, boolean isVoice) {
        ChatMessage asstMsg = new ChatMessage();
        asstMsg.setAssessment(assessment);
        asstMsg.setSender(ChatMessage.MessageSender.assistant);
        asstMsg.setContent(content);
        asstMsg.setIsVoice(isVoice);
        asstMsg.setCreatedAt(Instant.now());
        return chatMessageRepository.save(asstMsg);
    }

    private boolean isGreeting(String text) {
        if (text == null) return false;
        String clean = text.trim().toLowerCase();
        return clean.equals("hello") ||
               clean.equals("hi") ||
               clean.equals("hey") ||
               clean.equals("namaste") ||
               clean.equals("vanakkam") ||
               clean.equals("namaskaram") ||
               clean.equals("வணக்கம்") ||
               clean.equals("ஹலோ") ||
               clean.equals("வணக்கங்க") ||
               clean.equals("नमस्ते") ||
               clean.equals("हेलो") ||
               clean.equals("नमस्कार") ||
               clean.equals("నమస్కారం") ||
               clean.startsWith("வணக்கம்") ||
               clean.startsWith("नमस्ते") ||
               clean.equals("good morning") ||
               clean.equals("good afternoon") ||
               clean.equals("good evening") ||
               clean.equals("hi vyapaarsathi") ||
               clean.equals("hello vyapaarsathi");
    }

    private boolean isOffTopic(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        return lower.contains("cricket") ||
               lower.contains("football") ||
               lower.contains("match") ||
               lower.contains("movie") ||
               lower.contains("cinema") ||
               lower.contains("celebrity") ||
               lower.contains("actor") ||
               lower.contains("actress") ||
               lower.contains("politician") ||
               lower.contains("election") ||
               lower.contains("prime minister") ||
               lower.contains("president of");
    }

    private String callVertexAiGemini(Assessment assessment, String userText, User user, String resolvedLang) {
        String systemInstruction = buildSystemPrompt(assessment, user, resolvedLang);

        // Fetch recent history
        List<ChatMessage> history = chatMessageRepository.findTop10ByAssessmentOrderByCreatedAtDesc(assessment);
        Collections.reverse(history);

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(systemInstruction).append("\n\nRecent Conversation History:\n");
        for (ChatMessage m : history) {
            promptBuilder.append(m.getSender().name()).append(": ").append(m.getContent()).append("\n");
        }
        promptBuilder.append("user: ").append(userText).append("\nassistant: ");

        String fullPrompt = promptBuilder.toString();

        // 1. Attempt Google AI Studio direct Gemini API if configured
        if (geminiApiClient != null && geminiApiClient.isApiKeyConfigured()) {
            try {
                String responseText = geminiApiClient.generateContent(fullPrompt);
                if (responseText != null && !responseText.trim().isEmpty()) {
                    log.info("Successfully generated chat response via Google AI Studio Gemini API");
                    return responseText;
                }
            } catch (Exception ex) {
                log.warn("Google AI Studio chat call failed ({}), attempting GCP Vertex fallback.", ex.getMessage());
            }
        }

        // 2. Attempt live Vertex AI call if GCP project is available
        try (VertexAI vertexAI = new VertexAI(gcpProjectId, gcpLocation)) {
            GenerativeModel model = new GenerativeModel(vertexModel, vertexAI);
            GenerateContentResponse response = model.generateContent(fullPrompt);
            return ResponseHandler.getText(response);
        } catch (Exception e) {
            log.debug("Live Vertex AI exception: {}", e.getMessage());
            return null;
        }
    }

    private String buildSystemPrompt(Assessment assessment, User user, String resolvedLang) {
        String userName = user != null && user.getName() != null ? user.getName() : "Entrepreneur";
        String lang = (resolvedLang != null && !resolvedLang.isBlank())
                ? resolvedLang
                : (user != null && user.getPreferredLanguage() != null ? user.getPreferredLanguage().name() : "en");
        String langInstruction = switch (lang.toLowerCase()) {
            case "ta" -> "CRITICAL: The user communicates in TAMIL (தமிழ்). You MUST answer strictly in natural, clear, empathetic TAMIL (தமிழ்) script. Even if the user asks in English, reply in Tamil script.";
            case "hi" -> "CRITICAL: The user communicates in HINDI (हिन्दी). You MUST answer strictly in natural, empathetic HINDI (हिन्दी) script.";
            case "te" -> "CRITICAL: The user communicates in TELUGU (తెలుగు). You MUST answer strictly in natural, empathetic TELUGU (తెలుగు) script.";
            default -> "Mirror the user's language. If the user writes or speaks in Tamil (தமிழ்), reply in Tamil. If in Hindi (हिन्दी), reply in Hindi. If in English, reply in English.";
        };

        // Extract key financial & demographic indicators from JSON
        String villageName = "Selected Village";
        String districtName = "District";
        String projectCost = "5,00,000";
        String loanAmount = "4,50,000";
        String schemeName = "Term Loan Scheme";
        String rate = "8.0%";
        String moratorium = "6";
        String eqi = "22,364.65";
        String foir = "Moderate";

        try {
            if (assessment.getModule1ReportJson() != null) {
                JsonNode m1 = objectMapper.readTree(assessment.getModule1ReportJson());
                if (m1.has("village_context")) {
                    JsonNode vc = m1.get("village_context");
                    if (vc.has("villageName")) villageName = vc.get("villageName").asText();
                    if (vc.has("districtName")) districtName = vc.get("districtName").asText();
                }
            }
            if (assessment.getModule2ResultJson() != null) {
                JsonNode m2 = objectMapper.readTree(assessment.getModule2ResultJson());
                // Handle CanonicalModule2Result fields (camelCase)
                if (m2.has("projectCost")) projectCost = m2.get("projectCost").asText();
                if (m2.has("loanAmount")) loanAmount = m2.get("loanAmount").asText();
                if (m2.has("schemeName")) schemeName = m2.get("schemeName").asText();
                if (m2.has("interestRatePa")) rate = m2.get("interestRatePa").asText() + "%";
                if (m2.has("moratoriumMonths")) moratorium = m2.get("moratoriumMonths").asText();
                if (m2.has("quarterlyInstallment")) eqi = m2.get("quarterlyInstallment").asText();
                if (m2.has("foirVerdictLabel")) foir = m2.get("foirVerdictLabel").asText();

                // Also support legacy nested financial_summary if present
                if (m2.has("financial_summary")) {
                    JsonNode fs = m2.get("financial_summary");
                    if (fs.has("project_cost")) projectCost = fs.get("project_cost").asText();
                    if (fs.has("eligible_loan_amount")) loanAmount = fs.get("eligible_loan_amount").asText();
                    if (fs.has("scheme_name")) schemeName = fs.get("scheme_name").asText();
                    if (fs.has("interest_rate_pa")) rate = fs.get("interest_rate_pa").asText() + "%";
                    if (fs.has("moratorium_months")) moratorium = fs.get("moratorium_months").asText();
                    if (fs.has("quarterly_installment_eqi")) eqi = fs.get("quarterly_installment_eqi").asText();
                }
                if (m2.has("affordability") && m2.get("affordability").has("foir_verdict")) {
                    foir = m2.get("affordability").get("foir_verdict").asText();
                }
            }
        } catch (Exception ignored) {}

        return """
                You are VyapaarSathi, an empathetic rural business advisory assistant for the Ministry of Social Justice and Empowerment (MoSJE).
                You are speaking with %s regarding their proposed %s enterprise in %s, %s.
                Strictly ground all advice on the user's generated feasibility report and financial structuring plan:
                - Project Cost: ₹%s, Loan Amount: ₹%s
                - Scheme: %s (Interest: %s, Moratorium: %s months)
                - Quarterly Installment: ₹%s, Affordability Verdict: %s
                Always explain financial terms in simple, jargon-free analogies.
                %s
                If the user sends a simple greeting or says hello, reply with a short, warm 1-sentence welcome in the appropriate language.
                Always keep answers concise, focused, structured with bullet points where appropriate, and avoid raw JSON or large essays.
                Never invent numbers outside this context. If citing figures from the report, explicitly mention the source.
                """.formatted(
                userName,
                assessment.getBusinessCategory() != null ? assessment.getBusinessCategory() : "Micro Enterprise",
                villageName, districtName,
                projectCost, loanAmount,
                schemeName, rate, moratorium, eqi, foir,
                langInstruction
        );
    }

    private String buildContextualFallbackResponse(Assessment assessment, String userText, String resolvedLang) {
        boolean isTamil = "ta".equalsIgnoreCase(resolvedLang) || containsTamilScript(userText);
        if (isGreeting(userText)) {
            return isTamil
                    ? "வணக்கம்! நான் வியாபார்சாதி, உங்கள் AI கடன் மற்றும் வணிக உதவியாளர். உங்கள் திட்ட அறிக்கை, கடன் தவணை அல்லது அரசு மானியம் குறித்து என்னிடம் கேளுங்கள்."
                    : "Namaste! I am VyapaarSathi, your AI Credit & Business Sahayak. How can I assist you with your feasibility report, repayment schedule, or government schemes today?";
        }
        String lower = userText != null ? userText.toLowerCase() : "";

        // Extract key context
        String villageName = "your village";
        String eqi = "22,364.65";
        try {
            if (assessment.getModule1ReportJson() != null) {
                JsonNode m1 = objectMapper.readTree(assessment.getModule1ReportJson());
                if (m1.has("village_context") && m1.get("village_context").has("villageName")) {
                    villageName = m1.get("village_context").get("villageName").asText();
                }
            }
            if (assessment.getModule2ResultJson() != null) {
                JsonNode m2 = objectMapper.readTree(assessment.getModule2ResultJson());
                if (m2.has("quarterlyInstallment")) {
                    eqi = m2.get("quarterlyInstallment").asText();
                } else if (m2.has("financial_summary") && m2.get("financial_summary").has("quarterly_installment_eqi")) {
                    eqi = m2.get("financial_summary").get("quarterly_installment_eqi").asText();
                }
            }
        } catch (Exception ignored) {}

        // Scenario 1: Moratorium / First quarter payment
        if (lower.contains("moratorium") || lower.contains("first quarter") || lower.contains("first payment") || lower.contains("why only") || lower.contains("interest")) {
            return isTamil
                    ? "உங்கள் திட்ட அறிக்கையின்படி, ஆரம்ப 6 மாத கால அவகாசத்தில் (moratorium) நீங்கள் குறைந்த எளிய வட்டியை மட்டுமே செலுத்த வேண்டும். இதனால் ஆரம்ப முதலீட்டு காலத்தில் மூலதனச் சுமை குறையும். அடுத்த காலாண்டில் இருந்து முழு அசல் தவணை தொடங்கும்."
                    : "According to your concessional loan schedule, during your initial moratorium period you are only required to service the simple interest. This ensures that your working capital is not squeezed while you purchase equipment, stock raw inventory, and establish steady village customers. Your full principal repayment begins only in the subsequent quarter.";
        }

        // Scenario 2: Early repayment / Prepayment penalty
        if (lower.contains("repay") || lower.contains("early") || lower.contains("prepay") || lower.contains("penalty") || lower.contains("foreclosure") || lower.contains("efficent") || lower.contains("efficient")) {
            return isTamil
                    ? "ஆம்! சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகத்தின் (MoSJE) வழிகாட்டுதலின் கீழ் (NSFDC / NBCFDC), கடனை முன்கூட்டியே அடைப்பதற்கு எவ்வித அபராதமும் (prepayment penalty) இல்லை. அறுவடை அல்லது பண்டிகை காலத்தில் உபரி வருமானம் கிடைக்கும் போது நீங்கள் எப்போது வேண்டுமானாலும் அசலை விரைவாகச் செலுத்தி வட்டியைச் சேமிக்கலாம்."
                    : "Yes! Under the Ministry of Social Justice and Empowerment (MoSJE) Apex Corporation guidelines (NSFDC / NBCFDC), there is zero foreclosure or prepayment penalty. You can clear your principal faster whenever you accumulate surplus earnings during harvest or festival peak seasons, reducing your total interest paid.";
        }

        // Scenario 3: Udyam / Permits / Licenses
        if (lower.contains("udyam") || lower.contains("register") || lower.contains("permit") || lower.contains("license") || lower.contains("panchayat")) {
            return isTamil
                    ? "கடன் ஒப்புதலுக்கு இரண்டு முக்கியமான சான்றிதழ்கள் தேவை: (1) உங்கள் ஆதார் மூலம் பெறப்படும் 100% இலவச ஆன்லைன் உத்யம் பதிவு (Udyam Registration), மற்றும் (2) உங்கள் கடைக்கான கிராம பஞ்சாயத்து வணிக தடையில்லாச் சான்றிதழ் (Trade NOC)."
                    : "To qualify for disbursement, you need two basic statutory documents: (1) Free online Udyam Registration (takes 10 minutes with your Aadhaar), and (2) Gram Panchayat Trade NOC for your shop premises. VyapaarSathi provides automated pre-filled formats to speed up your local sanction.";
        }

        // Scenario 4: Subsidies / SC / OBC / Women
        if (lower.contains("subsidy") || lower.contains("sc") || lower.contains("obc") || lower.contains("woman") || lower.contains("women")) {
            return isTamil
                    ? "NBCFDC மற்றும் NSFDC திட்டங்களின் கீழ், தகுதியான பெண் தொழில்முனைவோருக்கு 0.5% கூடுதல் வட்டி சலுகை வழங்கப்படுகிறது. மேலும், தொழில் செயல்பாடுகளை சரிபார்த்தவுடன் பின்னேற்பு மூலதன மானியம் (capital subsidy) நேரடியாக உங்கள் கடன் கணக்கில் வரவு வைக்கப்படும்."
                    : "Under NBCFDC and NSFDC credit lines, eligible women beneficiaries receive an additional 0.5% interest rate rebate. Furthermore, back-ended capital subsidies are routed directly into your loan account upon verification of active business operations by your State Channelizing Agency (SCA).";
        }

        // Scenario 5: Default grounded response
        return isTamil
                ? "உங்கள் சரிபார்க்கப்பட்ட திட்ட அறிக்கையின்படி உங்கள் காலாண்டு தவணை ₹" + eqi + " ஆகும். இந்த தவணை அமைப்பு உங்கள் அன்றாட குடும்ப செலவுகளை பாதிக்காமல் தொழிலை நிலையாக வளர்க்க உதவும் வகையில் பாதுகாப்பாக வடிவமைக்கப்பட்டுள்ளது."
                : "Based on your verified feasibility report for " + (assessment.getBusinessCategory() != null ? assessment.getBusinessCategory() : "your enterprise") +
                " in " + villageName +
                ", your structured quarterly installment is ₹" + eqi +
                ". With your safe debt servicing capacity, this repayment plan protects your baseline household earnings while building an asset base.";
    }

    private ChatMessageDto mapToDto(ChatMessage m) {
        return ChatMessageDto.builder()
                .messageId(m.getMessageId())
                .assessmentId(m.getAssessment().getAssessmentId())
                .sender(m.getSender().name())
                .content(m.getContent())
                .isVoice(m.getIsVoice())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private boolean containsTamilScript(String text) {
        if (text == null) return false;
        for (char c : text.toCharArray()) {
            if (c >= '\u0B80' && c <= '\u0BFF') return true;
        }
        return false;
    }

    private boolean containsDevanagariScript(String text) {
        if (text == null) return false;
        for (char c : text.toCharArray()) {
            if (c >= '\u0900' && c <= '\u097F') return true;
        }
        return false;
    }

    private boolean containsTeluguScript(String text) {
        if (text == null) return false;
        for (char c : text.toCharArray()) {
            if (c >= '\u0C00' && c <= '\u0C7F') return true;
        }
        return false;
    }
}
