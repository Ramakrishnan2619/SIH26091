# 🏛️ VyapaarSathi: Master Frontend UI/UX Specification Document
**Project:** AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant (SIH 26091)  
**Target Organization:** Ministry of Social Justice and Empowerment (MoSJE)  
**Cloud / Backend:** Spring Boot (Java 21), Google Cloud Run (`sih26-508313`), Cloud SQL (MySQL 8.0)  
**LLM Engine:** `gemini-2.5-flash` (Chat/RAG) & `gemini-live-2.5-flash-native-audio` (Live Voice)

---

## ⚡ 1. Low-Network & Latency Optimization (2G/3G/Rural Mode)

To ensure instantaneous loading in rural villages with unstable 2G/3G connectivity:
1. **Asset Compression:** Use pure SVG vector graphics and CSS gradients (no heavy PNG/JPG banners).
2. **Font Preloading:** Load Google Fonts with `font-display: swap` to prevent FOIT (Flash of Invisible Text).
3. **Hardware-Accelerated Transitions:** Use CSS transforms (`translate3d`, `scale`) and GPU-accelerated Motion transforms.
4. **Conditional Animation Switch:** When Accessibility **"Pause Animation"** or **Low-Bandwidth Mode** is detected, disable cursor-repellent canvas effects.

---

## 🎨 2. Global Design Tokens (UX4G Aqua Blue Mode)

### SCSS Variables (`_variables.scss`)
```scss
// --- Global Base ---
$deep-blue: #1D0A69;
$bright-gray: #EBEAEA;
$anti-flash-white: #f1f1f1;
$rhythm: #3D4043;
$white: #FFFFFF;
$black: #150202;
$black-pure: #000000;
$profile-border-color: #D5CBBD;
$profile-card-secondary: #DBEBEB;

// --- Active Mode: Aqua Blue (UX4G Digital India Standard) ---
$banner-transparency: rgba(0, 157, 179, 0.95);
$eagle-green: #006B7A;          // Primary Headers, Top Gov Banner, Brand Title
$wintergreen-dream: #009DB3;    // Primary Action Buttons & CTAs
$powder-blue: #02C6E1;          // Hover states, focus rings, link highlights
$columbia-blue: #79E4F3;        // Subtle borders, card dividers
$azureish-white: #A8EFF9;       // Soft badge backgrounds, active pill highlights
$azureish-white-bg: #CBF9FF;    // Page background tint

// --- Semantic Verdict Tokens ---
$status-safe: #15803D;          // 🟢 Safe Affordability
$status-caution: #B45309;       // 🟡 Caution / Moderate Risk
$status-risk: #B91C1C;          // 🔴 High Financial Burden / Saturated

// --- Typography ---
$font-family-base: 'Plus Jakarta Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', sans-serif;
$touch-target-min-height: 48px;  // Essential for rural touchscreens
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-full: 9999px;
$shadow-card: 0 1px 3px rgba(0, 107, 122, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
$shadow-hover: 0 8px 16px -4px rgba(0, 107, 122, 0.15);
```

### Google Fonts CDN Link
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 📦 3. UI Component Library Matrix & Motion Commands

| Feature / UI Element | Component Name | Template / Source | Installation Command |
| :--- | :--- | :--- | :--- |
| **Site Navigation** | Morphic Navbar + Mega Menu | Motion for React | `npx shadcn@latest add @motion/nav-mega-menu` |
| **Hero Feature Showcase** | Staggered Feature Bento | Motion for React | `npx shadcn@latest add @motion/bento-staggered` |
| **Business Lifecycle Stages** | 3D Card Flip on Hover | React + Tailwind 3D | Custom 3D perspective flip |
| **Beneficiary Success Stories** | Testimonials Card Stack | Motion for React | `npx shadcn@latest add @motion/testimonials-stack` |
| **Frequently Asked Questions** | FAQ Plus-Minus Morph | Motion for React | `npx shadcn@latest add @motion/faq-plus-minus` |
| **Sticky Page Footer** | Sticky Reveal Footer | Motion for React | `npx shadcn@latest add @motion/footer-sticky-reveal` |
| **Global Page Transitions** | Curtains (Fade/Wipe) | Motion for React | Motion page transition wrapper |
| **Date & Age Picker** | Dynamic Sliding Calendar | Peanav CodePen | [CodePen DmZEEp](https://codepen.io/peanav/pen/DmZEEp) |
| **Global Loading State** | Rotating Gradient Rings | Motion Ring Spinner | Dual rotating SVG ring loader |
| **Skeleton Loaders** | Shimmer Placeholders | Motion for React | `npx shadcn@latest add @motion/loader-skeleton` |
| **Notifications & Alerts** | Toast Stack | Motion for React | `npx shadcn@latest add @motion/overlay-toast-stack` |
| **Document Fallback** | Animated Drag-Drop Upload | Motion for React | Custom Animated Dropzone |
| **Floating AI Voice Agent** | AI Voice Waveform Bar | Tailwind + Audio API | Pulsing waveform bars & timer |
| **Readiness & Verdict Ring** | Apple Activity Ring Card | Animated SVG Circles | Multi-ring SVG progress indicator |
| **Nearby Suppliers / Photos** | Horizontally Scrolling Carousel | Shadcn Carousel | `npx shadcn@latest add carousel` |
| **Profile & Token Tracker** | Profile Dropdown Menu | Shadcn Dropdown | `npx shadcn@latest add dropdown-menu` |
| **Report Section Switcher** | Smooth Sliding Tab Bar | Motion Animated Tabs | LayoutId sliding indicator |
| **Action & Try Out Buttons** | Magnetic Attract Buttons | KokonutUI | Attract physics hover effect |

---

## 🖥️ 4. Detailed Specification of All 7 Pages

### 📄 Page 1: Login & Registration (`/login`)
- **Top Banner:** Government of India & MoSJE emblems with Language Switcher (`EN`, `HI`, `TA`, `TE`) and Accessibility Trigger (`Ctrl+F2`).
- **Card UI:** Centered Aqua Blue container (`$azureish-white-bg` canvas).
- **Google OAuth 2.0 CTA:**
  - Official Google SVG logo.
  - KokonutUI attract hover animation.
  - Triggers Spring Boot `/oauth2/authorization/google` (retrieves Profile Pic, Name, Gmail).
- **Form Controls:** 48px height inputs for Email/Phone and Password with show/hide password toggle.
- **Security Badge:** `🛡️ 100% Secure Sandbox Mode (JWT 1-Hour Session)`.

---

### 📄 Page 2: Home Page (`/`)
- **Morphic Navbar:** Links for Home, Schemes, History, About, Contact. Active link morphs into an Aqua Blue rounded pill.
- **Hero Section:** High-impact title: *"Transforming Rural Aspirations into Bankable Enterprises"*.
- **Staggered Feature Bento (`@motion/bento-staggered`):**
  - Card 1: Hyper-Local SWOT & Saturation Matrix.
  - Card 2: 10% Margin Money & 90% Concessional Credit Calculator.
  - Card 3: Multilingual Voice Assistant in 4 Regional Dialects.
  - Card 4: DigiLocker & API Setu Instant Document Verification.
- **3D Flip Cards (Business Lifecycle):**
  - *Front:* Stage Name & Icon (Seed, Launch, Repay, Grow).
  - *Back (on hover):* Concrete milestones (Udyam Registration -> SCA Loan -> Mudra Upgrade).
- **Testimonials Card Stack (`@motion/testimonials-stack`):** Real-world success stories of rural women SHGs and artisans.
- **FAQ Plus-Minus (`@motion/faq-plus-minus`):** Expandable answers for margin money requirements, interest subsidies, and eligible categories.
- **Primary CTA:** Prominent **"Try Out Assistant"** button right above the footer.
- **Sticky Reveal Footer (`@motion/footer-sticky-reveal`):** Uncovers smoothly with MoSJE contact details and official links.

---

### 📄 Page 3: Intake Form & Rapido-Style Map (`/assess`)
*Opened when user clicks "Try Out".*
- **Form Fields (All with `*` confirmed state):**
  - Enterprise Owner Name.
  - Dynamic Age Selector (Styled after [Peanav Interactive Date Picker](https://codepen.io/peanav/pen/DmZEEp)).
  - Available Margin Capital (₹).
  - Business Category Dropdown (Agro, Kirana, Tailoring, Dairy, Digital Center, Artisan).
  - Business Idea Description (Text area).
- **Live / Share Location Button:**
  - Triggers Geolocation API.
  - **Rapido-Style Top-Corner Map Component:** Map slides down into top corner, drops pin at user coordinates, draws a **5km-10km circle**, and plots competitor dots.
- **Floating AI Voice Bar:** Stays at bottom right with pulsing waveform for speech-to-text.
- **Submit Button:** Becomes active only when all fields are valid.
- **Loading Overlay:** Transparent screen with rotating gradient rings and real-time status text:
  1. *"Querying Google Places for competitor density..."*
  2. *"Calculating 90% concessional loan & reducing-balance EMI..."*
  3. *"Synthesizing 6-Point Feasibility Report with Gemini 2.5 Flash..."*

---

### 📄 Page 4: Final Unified Advisory Dashboard (`/report`)
*(Recreated directly from your reference SaaS layout)*

```
+--------------------------------------------------------------------------------------------------------------------+
| 🇮🇳 MoSJE Portal   [ 🔍 Search Schemes / Services ]              [ ♿ Accessibility ] [ 🌐 Lang ] [ 👤 Profile Dropdown ] |
+--------------------------------------------------------------------------------------------------------------------+
| 📋 [Icon] Good Morning, [User Name]                                         [ 📥 Download PDF ] [ ✨ AI Support (Live) ]|
|           "Real-time Enterprise Feasibility & Concessional Credit Assessment"                                      |
+--------------------------------------------------------------------------------------------------------------------+
| [ 🔘 General Feasibility Report ]  [ 💳 Financial & EMI Plan ]  [ 📊 Risk & Saturation ]  [ 🏛️ Scheme Eligibility ] |
+--------------------------------------------------------------------------------------------------------------------+
|                                                          |                                                         |
| 🔹 Enterprise Financial Summary (3-KPIs)                 | 📈 Break-Even & Revenue Projection (Curve Graph)         |
|  - Total Project Cost: ₹1,40,000                          |  - Estimated Monthly Revenue: ₹28,500                    |
|  - Margin Money (10%):  ₹14,000                          |  - Break-Even Target: Month 3.5                          |
|  - Concessional Loan:  ₹1,26,000 (at 6.5% interest)      |  - 🟢 Trajectory: Positive Growth                        |
|                                                          |                                                         |
+----------------------------------------------------------+---------------------------------------------------------+
|                                                          |                                                         |
| 📍 Hyper-Local Competitor Density (Map & Bar Stats)      | 🎯 Bank Readiness & Affordability (Apple Activity Ring) |
|  - Total Nearby Shops (5km): 18                          |                                                         |
|  - Direct Competitors: 3 (Low Saturation)                |             (( 85% ))  🟢 SAFE AFFORDABILITY           |
|  - Market Opportunity Gap: High (60% Unmet Demand)       |                                                         |
|                                                          |  🔵 Documents: 90%   🟠 Permits: 80%   🟢 Net Margin: 10% |
|                                                          |                                                         |
+----------------------------------------------------------+---------------------------------------------------------+
|                                                          |                                                         |
| 🤝 Recommended Raw Material Suppliers / Local SCAs       | ⚖️ 6-Point Risk Matrix                                  |
|  - Sampla Daily Needs Wholesaler (3.2 km away)           |  - Market Risk: 🟢 Low (High Footfall)                   |
|  - District Channelizing Agency (Rohtak Office)          |  - Seasonal Risk: 🟡 Moderate (Monsoon Dip)              |
|                                                          |  - Regulatory Risk: 🟢 Low (Udyam + FSSAI Ready)         |
|                                                          |                                                         |
+--------------------------------------------------------------------------------------------------------------------+
| 💬 Interactive AI Advisory Chat Drawer (Bottom of screen with Native Audio Live Session Toggle)                    |
+--------------------------------------------------------------------------------------------------------------------+
```

---

### 📄 Page 5: AI Chat Interface & Native Audio Session (`/chat`)
- **Chat Drawer:** Dockable at bottom or expandable to full page.
- **Message Bubbles:** Aqua Blue bubbles for user, white cards with verified sources for Gemini responses.
- **Live Voice Session Toggle:** Connects WebSocket directly to `gemini-live-2.5-flash-native-audio` with interactive voice visualizer.
- **History Sync:** All transcripts saved in Cloud SQL for offline resumption.

---

### 📄 Page 6: User Settings & LLM Usage (`/settings`)
- **Profile Card:** Avatar, Full Name, Gmail ID, Role (Beneficiary / SCA Officer).
- **LLM Token & Rate-Limit Tracker:**
  - Progress bar showing daily requests used (`12 / 100 queries`).
  - Rate-limit countdown timer.
- **Language Default Preference:** Set default dialect (Telugu, Tamil, English, Hindi).
- **Session Manager:** Active JWT countdown (1 hr expiry) + Clear Cache / Logout.

---

### 📄 Page 7: Supporting Pages (About, Contact, Error)
- **About Page (`/about`):** Details the problem statement (PS 26091), MoSJE mandate, and technological architecture.
- **Contact & SCA Directory (`/contact`):** Searchable list of District Channelizing Agencies (SCAs), toll-free helpline (`1800-XXX-XXXX`), and feedback form.
- **Error Page (`/error` or `404`):** Clean vector graphic + *"Lost in the fields? Let's take you back to your business advisory."* + [ 🏠 Return Home ] button.

---

## ♿ 5. Accessibility Modal Specification (`Ctrl+F2`)
*UX4G Government Compliance Modal Structure:*
1. **Text Controls:** Bigger Text (`+`), Smaller Text (`-`), Text Spacing, Line Height.
2. **Cognitive Adjustments:** Dyslexia-Friendly Font Toggle, ADHD Mode (Highlight current reading line).
3. **Visual & Contrast:** Saturation Adjuster, Light/Dark Mode, Invert Colors, Highlight Hyperlinks.
4. **Media & Voice:** Text-to-Speech Page Reader, Custom High-Contrast Cursor, Pause Animations, Hide Images (for slow 2G).

---

## 🚀 6. Frontend Developer Quick-Start Instructions

1. **Install Dependencies:**
   ```bash
   npm install clsx tailwind-merge framer-motion lucide-react recharts
   npx shadcn@latest add @motion/nav-mega-menu @motion/bento-staggered @motion/testimonials-stack @motion/faq-plus-minus @motion/footer-sticky-reveal @motion/loader-skeleton @motion/overlay-toast-stack dropdown-menu carousel
   ```
2. **Import Variables:** Place `_variables.scss` into `src/styles/` and include Google Fonts CDN.
3. **Build Views:** Follow the 7-page blueprint outlined above.
