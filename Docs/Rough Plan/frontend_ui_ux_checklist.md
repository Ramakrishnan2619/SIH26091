# 🎨 Master UI/UX & Component Architecture Blueprint

This document contains the complete UI/UX blueprint, component library mapping (Motion.dev / Shadcn / KokonutUI), and the recreated **Final Advisory Dashboard** layout based on your reference image.

---

## 📦 Component Library & Installation Commands

Here is the exact mapping of every interactive component you specified:

| Component                         | Source / Package                                       | Location in App        | Purpose                                                                   |
| :-------------------------------- | :----------------------------------------------------- | :--------------------- | :------------------------------------------------------------------------ |
| **Morphic Navbar**          | `@motion/morphic-navbar`                             | Top Header             | Active tab morphs into a smooth rounded pill.                             |
| **Mega Menu**               | `npx shadcn@latest add @motion/nav-mega-menu`        | Navigation             | Scheme categories & Government portal links.                              |
| **3D Card Flip**            | React + Tailwind 3D transforms                         | Home Page              | Flips on hover to reveal Business Stages (Seed -> Growth).                |
| **Feature Bento**           | `npx shadcn@latest add @motion/bento-staggered`      | Home Page & Report     | Staggered reveal of Module 1 (SWOT) & Module 2 features.                  |
| **Testimonials Stack**      | `npx shadcn@latest add @motion/testimonials-stack`   | Home Page              | Success stories of rural beneficiaries / SHG members.                     |
| **FAQ Plus-Minus**          | `npx shadcn@latest add @motion/faq-plus-minus`       | Home Page              | Plus-to-minus accordion for MoSJE scheme FAQs.                            |
| **Sticky Reveal Footer**    | `npx shadcn@latest add @motion/footer-sticky-reveal` | Bottom of Page         | Under-page footer that uncovers smoothly on scroll.                       |
| **Curtain Transitions**     | Motion for React page transitions                      | Global App             | Smooth curtain/wipe transitions between pages.                            |
| **Loader (Gradient Rings)** | Motion Ring Spinner                                    | Global Loading         | Rotating gradient rings with step-by-step Gemini status text.             |
| **Skeleton Loader**         | `npx shadcn@latest add @motion/loader-skeleton`      | Report & Forms         | Shimmer placeholders before real-time data loads.                         |
| **Toast Stack**             | `npx shadcn@latest add @motion/overlay-toast-stack`  | Notification Layer     | Hardware-accelerated feedback ("Report Generated", "Location Pinned").    |
| **AI Voice Assistant**      | Animated Waveform Bar                                  | Floating Bottom        | Floating voice button with recording timer & audio transcripts.           |
| **Smooth Tab Switcher**     | Motion Animated Tabs                                   | Final Report & Profile | Sliding active indicator for Report Sections & LLM token stats.           |
| **Apple Activity Rings**    | Animated SVG Progress Circles                          | Final Report           | Multi-ring visual for**Readiness Score** & **Affordability**. |
| **Carousel Cards**          | Shadcn Carousel Primitives                             | Final Report           | Horizontally scrolling nearby competitor/supplier photos.                 |
| **Profile Dropdown**        | Shadcn Dropdown Menu                                   | Top Right Navbar       | User avatar, JWT session info, LLM token usage stats, Logout.             |
| **File Upload**             | Motion Animated Dropzone                               | Document Verification  | Fallback upload for DigiLocker documents.                                 |

---

## 📊 Final Advisory Dashboard: Structure (Recreated from Reference Image)

Based on your reference screenshot, here is how our **Rural Business Feasibility & Financial Structuring Dashboard** is structured:

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
| 🔹 Fleet/Enterprise Financial Summary (3-KPIs)           | 📈 Break-Even & Revenue Projection (Curve Graph)         |
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
|                                                          |  🔵 Documents Ready: 90%   🟠 Permits: 80%   🟢 Net Margin: 10% |
|                                                          |                                                         |
+----------------------------------------------------------+---------------------------------------------------------+
|                                                          |                                                         |
| 🤝 Recommended Raw Material Suppliers / Local SCAs       | ⚖️ 6-Point Risk Matrix                                  |
|  - Sampla Daily Needs Wholesaler (3.2 km away)           |  - Market Risk: 🟢 Low (High Footfall)                   |
|  - District Channelizing Agency (Rohtak Office)          |  - Seasonal Risk: 🟡 Moderate (Monsoon Dip)              |
|                                                          |  - Regulatory Risk: 🟢 Low (Udyam + FSSAI Ready)         |
|                                                          |                                                         |
+--------------------------------------------------------------------------------------------------------------------+
| 💬 Interactive AI Business Advisory Chat (Bottom Drawer with Audio Live Mode Toggle)                               |
+--------------------------------------------------------------------------------------------------------------------+
```

---

## 📋 Comprehensive Master Checklist

- [ ] **Phase 1: Global Setup, Theming, & Accessibility**
  - [ ] Design Tokens: Aqua Blue Mode (`$eagle-green`, `$wintergreen-dream`, `$powder-blue`, `$azureish-white-bg`)
  - [ ] Typography: Plus Jakarta Sans + Noto Sans (Hindi, Tamil, Telugu)
  - [ ] Accessibility Toolbar (`Ctrl+F2` modal: Dyslexia mode, ADHD, Invert Colors, Text Resizing)
  - [ ] Language Switcher (EN, HI, TA, TE)
- [ ] **Phase 2: Authentication & Navigation**
  - [ ] Morphic Navbar + Mega Menu integration
  - [ ] Google OAuth 2.0 Button with KokonutUI attract-hover effect
  - [ ] Form inputs (48px touch targets, focus rings)
  - [ ] Profile Dropdown (Avatar, Token usage, Logout)
  - [ ] Toast Stack notifications (`@motion/overlay-toast-stack`)
- [ ] **Phase 3: Home Page & Storytelling**
  - [ ] Hero Section with Staggered Feature Bento (`@motion/bento-staggered`)
  - [ ] 3D Card Flip for Business Stages (Seed -> Launch -> Repay -> Grow)
  - [ ] Testimonials Card Stack (`@motion/testimonials-stack`)
  - [ ] FAQ Section with plus-to-minus morph (`@motion/faq-plus-minus`)
  - [ ] Large "Try Out" CTA button with KokonutUI attract physics
  - [ ] Sticky Reveal Footer (`@motion/footer-sticky-reveal`)
- [ ] **Phase 4: Intake Form & Rapido-Style Map**
  - [ ] Dynamic Calendar for Age selection (Styled after [Peanav Interactive Date Picker](https://codepen.io/peanav/pen/DmZEEp) with dynamic Year/Month/Date slider)
  - [ ] Floating AI Voice Assistant bar (Waveform & Timer)
  - [ ] Rapido-style Top-Corner Map Component (5km-10km radius circle)
  - [ ] Form submission button (Activated only when all `*` fields confirmed)
  - [ ] Transparent Rotating Ring Loader with step-by-step Gemini status
- [ ] **Phase 5: Unified Advisory Dashboard (Recreated from Image)**
  - [ ] Top Header: User Greeting, Download PDF, AI Support Live Toggle
  - [ ] Smooth Tab Switcher (Feasibility, Financials, Risk, Schemes)
  - [ ] 3-KPI Financial Cards (Project Cost, Margin 10%, Loan 90%)
  - [ ] Break-Even & Revenue Projection Graph (Chart.js / Recharts)
  - [ ] Apple Activity Rings for Application Readiness & Verdict Badge (🟢 Safe)
  - [ ] Competitor Density & Supplier Contact List (with Carousel Zoom)
  - [ ] 6-Point Risk Matrix Cards
  - [ ] Bottom AI Chat Interface with Native Audio toggle
- [ ] **Phase 6: Progressive Scheme Search**
  - [ ] Accordion / Slide Questioning (One family member at a time)
  - [ ] Scheme Recommendation Cards with best financial outcome highlighted
- [ ] **Phase 7: Settings & Supporting Pages**
  - [ ] History of Sessions view (offline/interrupted session recovery)
  - [ ] Profile & Gemini Token Usage Analytics
  - [ ] About, Error (404/500), and Contact Pages
