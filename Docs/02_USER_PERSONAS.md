# User Personas

## Persona Decision (read this first)

Per project scope decision: **this build has one primary, fully-designed persona.** The "SCA/Bank Officer" role that appears in the Settings page (`Role: Beneficiary / SCA Officer`) is kept as a **field/label only** — it does not get its own dashboard, permissions model, or distinct journey in this build. This was chosen for simplicity: building a second real persona flow would roughly double the surface area (auth roles, permission checks, a second UI) for a role that isn't the PS's stated primary user. If the project continues past the hackathon, Officer-mode is a natural v2 addition (see Section 3).

---

## Primary Persona: "Meena" — The First-Time Rural Entrepreneur

**Who she is:**
- Lives in a village or small block in Tamil Nadu, considering starting a small enterprise (dairy, tailoring, kirana, tea stall, etc.)
- Eligible for margin-money-based concessional credit under a scheme like NSFDC/NSKFDC/NBCFDC
- First-time applicant — has not run a registered business before
- Often from a marginalized community (SC/ST/OBC/disabled/ex-servicemen family/women-headed household) — this is who the underlying government scheme is designed for

**Device & connectivity context:**
- Basic-to-mid-range Android smartphone
- 2G/3G/unstable rural connectivity — this is a hard design constraint, not an edge case
- Comfortable with WhatsApp/YouTube-style apps; not comfortable with dense text-heavy dashboards

**Language & literacy:**
- More comfortable in Tamil (or another regional language) than English
- Variable literacy — needs icons, voice, and short text over long paragraphs

**Goals:**
- "Will this business actually work where I live?"
- "How much can I really borrow, and what will I owe every month?"
- "What documents and steps do I need, and are there other schemes I might also qualify for?"

**Pain points today (why this product exists):**
- No way to check local market saturation before committing
- Scheme math (10%/90%, tiered interest, moratorium) is genuinely confusing without help
- Bank/SCA officers are busy and can't give personalized feasibility research
- Doesn't know what she doesn't know — e.g., that a "quarterly repayment schedule" or "moratorium" even applies to her

**What "success" looks like for her in this app:**
- Gets a clear go/no-go signal (🟢🟡🔴 affordability) she can act on
- Understands, in plain terms, what to sell and how much to break even
- Leaves with a specific loan scheme name, EMI number, and a sense of what schemes exist for her situation — even knowing the scheme-matching part is illustrative, she still gets a real starting point

---

## Secondary Persona (context-only, not a built flow): "Rajesh" — SCA/Bank Field Officer

**Why he's documented at all:** he's the indirect beneficiary of this tool (fewer unviable loan applications reaching him), and he's part of the PS's real-world stakeholder picture, referenced in the Settings role label.

- Reviews margin-money loan applications for a State Channelizing Agency or partner bank
- Currently does feasibility/eligibility counseling manually, one applicant at a time, with no data tooling
- **Not designed for in this build:** no officer login, no officer dashboard, no case-review queue. If Meena wants to show her report to Rajesh, she does it by showing/downloading her own report — there's no separate officer-side feature.

---

## Explicit Anti-Persona (keeps scope honest)

This product is **not** designed for:
- Urban entrepreneurs with access to formal consultants, CA firms, or bank relationship managers
- Existing, already-registered businesses seeking working-capital top-ups or expansion financing beyond ₹50L project cost
- Users needing real (non-illustrative) government scheme eligibility determination — the Search for Schemes module explicitly does not replace that, and disclosure copy says so

## 3. Roadmap Note (not this build)

If continued past the hackathon: an Officer persona would need its own auth role, a queue of submitted applicant reports, and read-only access to Meena's saved feasibility/financial data — but this is deliberately out of scope now.
