import React from 'react';
import { 
  ArrowRight, MapPin, Coins, Award, FileText, 
  ShieldCheck, Sparkles 
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { StepBadge } from './common/StepBadge';

export function LandingPage({ onStartAssessment, onGoToLogin, currentUser, selectedLang = 'en' }) {
  const t = getTranslation(selectedLang);

  const stats = [
    {
      icon: MapPin,
      iconColor: 'bg-[#CBF9FF]/60 text-[#006B7A]',
      val: t.statVillages,
      desc: t.statVillagesDesc
    },
    {
      icon: Coins,
      iconColor: 'bg-emerald-50 text-emerald-700',
      val: t.statLoanCap,
      desc: t.statLoanCapDesc
    },
    {
      icon: Award,
      iconColor: 'bg-cyan-50 text-cyan-800',
      val: t.statInterest,
      desc: t.statInterestDesc
    },
    {
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-700',
      val: t.statReport,
      desc: t.statReportDesc
    }
  ];

  const steps = [
    { num: 1, title: t.step1Title, desc: t.step1Desc },
    { num: 2, title: t.step2Title, desc: t.step2Desc },
    { num: 3, title: t.step3Title, desc: t.step3Desc },
    { num: 4, title: t.step4Title, desc: t.step4Desc }
  ];

  const corporations = [
    {
      code: "NSFDC",
      name: "National Scheduled Castes Finance & Dev. Corp.",
      desc: "Loans up to ₹50L at 6%-8% p.a. for Scheduled Caste entrepreneurs with margin subvention."
    },
    {
      code: "NBCFDC",
      name: "National Backward Classes Finance & Dev. Corp.",
      desc: "Concessional finance up to ₹15L at 8% p.a. for OBC beneficiaries below double poverty line."
    },
    {
      code: "NSKFDC",
      name: "National Safai Karamcharis Finance & Dev. Corp.",
      desc: "Rehabilitation credit at 4%-6% p.a. for sanitation workers and their dependents."
    },
    {
      code: "NDFDC",
      name: "National Divyangjan Finance & Dev. Corp.",
      desc: "Self-employment micro-credit and skill development for Persons with Disabilities (PwD)."
    }
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F6FCFD]">
      {/* 1. Spacious Sovereign Hero Section */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-[#006B7A] tracking-tight leading-tight mb-4 sm:mb-5 px-1">
            {t.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-6 sm:mb-8 px-1">
            {t.heroSubtitle}
          </p>

          {/* Primary Call to Action Button - Reusable Component with Single Text Node */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <Button
              variant="primary"
              size="default"
              onClick={currentUser ? onStartAssessment : onGoToLogin}
              icon={ArrowRight}
              className="px-8 shadow-md hover:shadow-lg"
            >
              {t.heroCta}
            </Button>
          </div>

          {/* Account Login Prompt */}
          {!currentUser && (
            <p className="text-xs text-slate-500 mt-3">
              {t.heroSignInPrompt}{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-[#006B7A] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {t.heroSignInLink}
              </button>
            </p>
          )}
        </div>
      </section>

      {/* 2. Key National Metrics & Trust Stats */}
      <section className="px-4 sm:px-6 -mt-8 max-w-6xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} padding="default" className="flex flex-col justify-between">
                <div>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconColor} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-black text-slate-900">{stat.val}</div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{stat.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Four-Step Citizen Journey ("How It Works") */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block text-xs font-black text-[#006B7A] uppercase tracking-wider mb-2">
            Simple 4-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {t.howItWorksTitle}
          </h2>
          <p className="text-sm text-slate-600">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step) => (
            <Card key={step.num} padding="default" className="flex flex-col">
              <StepBadge state="upcoming" stepNumber={step.num} className="mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Apex Corporations Banner */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-6xl mx-auto w-full">
        <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-[#003B44] text-white shadow-md border border-[#006B7A]">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-black text-[#79E4F3] uppercase tracking-wider mb-2">
              Ministry of Social Justice and Empowerment
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {t.corporationsTitle}
            </h2>
            <p className="text-sm text-slate-200">
              {t.corporationsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {corporations.map((corp) => (
              <div
                key={corp.code}
                className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-[#79E4F3] font-black text-sm mb-1">{corp.code}</div>
                  <div className="text-xs text-white font-bold">{corp.name}</div>
                  <p className="text-[11px] text-slate-200 mt-2 leading-relaxed">{corp.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-200 max-w-md">
              Zero-math project report generation. 100% compliant with apex corporation statutory guidelines.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={currentUser ? onStartAssessment : onGoToLogin}
              icon={ArrowRight}
              className="bg-white text-[#006B7A] hover:bg-slate-100 font-black border-0 shadow-md"
            >
              {t.heroCta}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
