# PRD-05: AI Chat & Live Voice Assistant

---

## 1. Module Overview & Goal
The AI Chat & Live Voice Assistant module provides a contextual, conversational advisory layer embedded directly within the VyapaarSathi dashboard. It enables rural micro-entrepreneurs to ask natural-language questions about their generated feasibility report and repayment obligations in their preferred language (Tamil, Telugu, Hindi, or English). The module features an expandable bottom chat drawer backed by Vertex AI Gemini 2.5 Flash for grounded text Q&A, an optional live voice toggle backed by Vertex AI Gemini Live 2.5 Flash Native Audio over WebSockets for spoken dialogue, and complete transcript persistence in Cloud SQL.  
**Traceability:** Sourced from `Docs/Problem statement.txt` (Expected Solution: NLP-powered multilingual assistant), `Docs/01_PRODUCT_VISION.md` (Sections 2, 4), `Docs/02_USER_PERSONAS.md` (Meena's low-literacy and regional language context), `Docs/03_USER_JOURNEY_MAPS.md` (Stages 8, 8b), `Docs/04_DATA_DICTIONARY_IA.md` (Section 2: `chat_messages`, `llm_usage_log`), and `Docs/05_TECH_STACK_CONSTRAINTS.md` (Section 4, 6).

---

## 2. In Scope / Out of Scope

### In Scope
- **Dockable Bottom Chat Drawer:** Collapsible conversational drawer located at the base of `/report`, expandable to full screen on mobile devices.
- **Context-Infused Text Advisory (`gemini-2.5-flash`):** Conversational engine initialized with the full system prompt containing the active assessment's 6-point feasibility report, Layer 2 village demographics, and Module 2 repayment schedule so answers are strictly grounded in the user's specific data.
- **Live Voice Session Toggle (`gemini-live-2.5-flash-native-audio`):** WebSocket-based bidirectional audio streaming for real-time speech-to-speech advisory with an animated pulsing waveform UI and session duration timer.
- **Multilingual Support:** Conversational understanding and response generation in English (`en`), Hindi (`hi`), Tamil (`ta`), and Telugu (`te`), defaulting to the user's profile setting.
- **Transcript Persistence:** Every message (user query, assistant reply, and transcribed live voice turn) persisted to `chat_messages` linked to the active `assessment_id`.
- **Source-Cited Responses:** Assistant responses must explicitly tag when citing report figures (e.g. *"According to your 6.5% Micro Finance schedule..."*).
- **Suggested Follow-Up Prompts:** Quick-tap chips above the input bar (e.g. *"Can I repay my loan early?"*, *"Where can I buy bulk raw materials?"*, *"What happens during the 3-month moratorium?"*).

### Out of Scope
- **Unbounded Open-Ended World Knowledge Q&A:** The assistant is guardrailed exclusively as a business feasibility and government loan advisor; it politely declines queries unrelated to micro-enterprises, finance, or government schemes.
- **Direct Phone Call / PSTN Integration:** Voice interaction occurs exclusively via in-browser WebRTC / WebSocket audio, not through carrier cellular calls.
- **Voice Biometrics / Voice Auth:** Voice is used solely for speech communication, not for identity verification or signing transactions.

---

## 3. User Stories
- **US-5.1 (Contextual Report Clarification):** As Meena, I want to ask *"Why do I have to pay only ₹2,031 in the first quarter?"* in the chat drawer and get an instant, plain-Tamil explanation that it's interest-only during my 3-month moratorium (`Docs/02_USER_PERSONAS.md`, `Docs/03_USER_JOURNEY_MAPS.md` Stage 8).
- **US-5.2 (Hands-Free Voice Advisory):** As Meena, I want to tap the microphone button and speak in Tamil to ask about my business risks without having to type on a small mobile keyboard (`Docs/02_USER_PERSONAS.md`, `Docs/03_USER_JOURNEY_MAPS.md` Stage 8b).
- **US-5.3 (One-Tap Quick Chips):** As Meena, I want to tap ready-made questions like *"How do I register for Udyam?"* so that I can learn what to do next without figuring out what to type (`Docs/02_USER_PERSONAS.md`, `Docs/Rough Plan/frontend_spec_master.md` Page 5).
- **US-5.4 (Conversation History Resumption):** As Meena, I want my earlier chat messages to still be there when I reopen my saved report tomorrow so that I don't lose the advisor's guidance (`Docs/03_USER_JOURNEY_MAPS.md` Stage 8, `Docs/04_DATA_DICTIONARY_IA.md` Section 2).

---

## 4. Functional Requirements

### Conversational Context & Grounding
- **FR-5.1:** Whenever a chat session is opened on `/report?id={assessment_id}`, the backend shall load:
  - `assessments.module1_report_json` (SWOT, competitor count, consumer reach, pricing),
  - `assessments.module2_result_json` (Project cost, loan cap, scheme name, interest rate, quarterly installment, moratorium months, FOIR verdict),
  - `users.preferred_language` and `users.name`.
- **FR-5.2:** The backend shall inject this data into the Vertex AI system instruction:
  ```
  You are VyapaarSathi, an empathetic rural business advisory assistant for the Ministry of Social Justice and Empowerment.
  You are speaking with {user_name} regarding their proposed {business_category} in {village_name}, {district_name}.
  Strictly ground all advice on the user's generated feasibility report and financial structuring plan:
  - Project Cost: ₹{project_cost}, Loan Amount: ₹{loan_amount}
  - Scheme: {scheme_name} (Interest: {interest_rate_pa}%, Moratorium: {moratorium_months} months)
  - Quarterly Installment: ₹{quarterly_installment}, Affordability Verdict: {foir_verdict}
  - Competitor Saturation: {competitor_saturation}, Market Reach: {market_reach}
  Always explain financial terms in simple, jargon-free analogies. Respond in {preferred_language}.
  Never invent numbers outside this context.
  ```

### Dockable Chat Drawer Interface
- **FR-5.3:** The chat drawer shall dock at the bottom of the screen with a persistent banner showing: `💬 AI Advisory Assistant` and an "Expand / Minimize" button.
- **FR-5.4:** In expanded mode, the drawer shall render:
  - Message bubble stream (Aqua Blue for user messages, white cards with MoSJE badge for assistant responses),
  - Quick-action suggestion chips,
  - Multilingual text input field with send button,
  - Live Voice Toggle button with microphone icon.

### Text Advisory Pipeline (`gemini-2.5-flash`)
- **FR-5.5:** When the user sends a text message, the frontend dispatches `POST /api/chat/message`:
  - Payload: `{assessment_id, content}`.
- **FR-5.6:** The backend retrieves the last 10 messages from `chat_messages` for conversation continuity, builds the Vertex AI prompt, and invokes `gemini-2.5-flash`.
- **FR-5.7:** The assistant response is returned to the client and both user message and assistant reply are written to `chat_messages` (`is_voice = false`).
- **FR-5.8:** The backend increments the token consumption record in `llm_usage_log`.

### Live Voice Assistant Pipeline (`gemini-live-2.5-flash-native-audio`)
- **FR-5.9:** Tapping the microphone button shall request browser microphone permissions (`navigator.mediaDevices.getUserMedia`) and establish a secure WebSocket connection to `/ws/live-voice?assessment_id={assessment_id}`.
- **FR-5.10:** The backend WebSocket handler bridges the client audio stream directly to Vertex AI Gemini Live (`gemini-live-2.5-flash-native-audio`) using GCP Service Account credentials.
- **FR-5.11:** Client-side UI displays an active voice overlay with:
  - Animated pulsing waveform bars reflecting microphone input volume,
  - Live session duration timer (auto-terminates at 10 minutes to manage cloud costs),
  - "Mute" and "End Voice Session" controls.
- **FR-5.12:** Inbound audio chunks from Gemini Live are streamed to the client and played via Web Audio API.
- **FR-5.13:** As turns complete, the backend extracts the transcribed user speech and model text transcripts and persists them to `chat_messages` with `is_voice = true`.
- **FR-5.14:** Voice session token/minute consumption is logged to `llm_usage_log`.

### Guardrails & Policy
- **FR-5.15:** If the user asks a question unrelated to business, loans, schemes, or local economics (e.g. sports, politics, entertainment), the assistant shall respond: *"I am your business advisory assistant. I can only help you with questions about your business plan, loan calculations, or government schemes."*

---

## 5. Data Requirements

### Tables Read
- **`assessments`:** `assessment_id`, `user_id`, `business_category`, `module1_report_json`, `module2_result_json`.
- **`users`:** `name`, `preferred_language`.
- **`chat_messages`:** `WHERE assessment_id = :assessment_id ORDER BY created_at ASC` (retrieves recent conversational history).

### Tables Written
- **`chat_messages` Table (`Docs/04_DATA_DICTIONARY_IA.md` Section 2):**
  - `message_id` (PK, auto-increment),
  - `assessment_id` (FK),
  - `sender` (`'user'` or `'assistant'`),
  - `content` (Text),
  - `is_voice` (Boolean, true for voice sessions),
  - `created_at` (Timestamp).
- **`llm_usage_log` Table:**
  - Writes token consumption for every text turn and live audio session.

---

## 6. API / Integration Requirements
- **Vertex AI Generative AI (`gemini-2.5-flash`):** Called via Spring Boot Vertex AI SDK / REST client with service account authentication (`roles/aiplatform.user`).
- **Vertex AI Gemini Live (`gemini-live-2.5-flash-native-audio`):** Bidirectional streaming via WebSockets.
- **Audio Codec:** Linear PCM 16kHz or Opus audio encoding for low-latency streaming over rural networks.
- **Fallback Behavior:**
  - If WebSocket connection to Gemini Live fails (e.g. firewall or 2G packet loss), the UI gracefully displays a toast: *"Live voice unavailable on current network. Switched to text chat mode"* and returns to the standard text drawer.
  - If microphone permission is denied, voice toggle is disabled with a tooltip explaining that microphone access is required.

---

## 7. Edge Cases & Error States
- **EC-5.1 (Microphone Permission Denied):** If user blocks mic access, show inline notice: *"Microphone access blocked. You can still type your questions in the box below."*
- **EC-5.2 (Audio Feedback / Background Noise in Rural Markets):** Live voice pipeline applies client-side echo cancellation and noise suppression constraints (`echoCancellation: true, noiseSuppression: true`) during `getUserMedia`.
- **EC-5.3 (WebSocket Disconnect Mid-Sentence):** If rural connection drops during voice conversation, the WebSocket connection closes cleanly, any partially transcribed text is flushed to `chat_messages`, and the UI reverts to the text drawer.
- **EC-5.4 (Exceeded Token Quota):** When daily query limit reaches 100, the chat input is disabled with message: *"Daily advisory question quota reached. Please return tomorrow."*

---

## 8. Acceptance Criteria
- [ ] Tapping the chat drawer on `/report` expands the drawer and displays 3 relevant quick-action chips.
- [ ] Asking a specific question about the report (e.g. *"What is my interest rate?"*) returns the exact rate ($6.5\%$ or $8.0\%$) generated by Module 2.
- [ ] Asking a question in Tamil returns a grammatically coherent, culturally appropriate response in Tamil.
- [ ] Asking an out-of-scope query (e.g. *"Who won the cricket match?"*) triggers the polite business-only refusal guardrail.
- [ ] Every exchanged text message is persisted in Cloud SQL `chat_messages` with `is_voice = false`.
- [ ] Tapping the voice toggle prompts for microphone access, displays pulsing waveform animations, and connects via WebSocket.
- [ ] Spoken questions stream to Gemini Live and return clear synthesized audio speech through device speakers.
- [ ] Spoken voice dialogue transcripts appear in `chat_messages` with `is_voice = true`.
- [ ] Refreshing the report page reloads the previous chat history from `chat_messages`.
- [ ] All chat and voice interactions write token usage entries into `llm_usage_log`.

---

## 9. Dependencies on Other Modules
- **Depends on PRD-01:** Authenticated user session.
- **Depends on PRD-02 & PRD-03:** The chat assistant cannot function without the context from `module1_report_json` and `module2_result_json`.
- **Depends on PRD-04:** The chat drawer is embedded in the Unified Dashboard UI.

---

## 10. Open Questions / Assumptions
- **Gemini Live Cost Management:** `Docs/05_TECH_STACK_CONSTRAINTS.md` Section 6 notes that native audio streaming is resource-intensive. A hard session cap of 10 minutes per voice session is established to prevent inadvertent background data and quota exhaustion.
- **Bhashini API vs. Vertex Native Multilingual:** `Docs/SIH26091 Deep Dive Analysis.md` mentions Bhashini as an alternative; since `05_TECH_STACK_CONSTRAINTS.md` explicitly locks `gemini-2.5-flash` and `gemini-live-2.5-flash-native-audio` via Vertex AI, multilingual capability is delivered natively via Gemini's strong Indic-language training without adding an external translation proxy.
