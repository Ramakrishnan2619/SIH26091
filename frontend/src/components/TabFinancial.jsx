import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, IndianRupee, ShieldAlert, CheckCircle2, 
  HelpCircle, Calendar, Percent, RefreshCw, BarChart2, Layers
} from 'lucide-react';
import { calculateFinanceClientSide } from '../utils/financialMath';

export function TabFinancial({ module2Result, onMarginChange, selectedLang = 'en' }) {
  const initialMargin = module2Result?.marginCapital || module2Result?.margin_capital || module2Result?.financial_summary?.margin_money_amount || 100000;
  const initialNetProfit = module2Result?.affordability?.estimated_net_profit_monthly || 28500;

  const [marginInput, setMarginInput] = useState(initialMargin);

  // Compute live recalculation based on margin input
  const liveCalc = calculateFinanceClientSide(marginInput, initialNetProfit);
  const display = liveCalc?.isEligible ? liveCalc : null;

  return (
    <div className="space-y-8">
      {/* 1. Header & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-700" />
            <span>Financial Viability & Loan Structuring</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Government Concessional Credit Scheme (NSFDC / NBCFDC Aligned) • 8.0% p.a.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {display?.schemeName || "Term Loan Scheme"}
          </span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            display?.foirBadgeColor === 'GREEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            display?.foirBadgeColor === 'YELLOW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            Repayment Status: {display?.foirVerdictLabel || "Safe"}
          </span>
        </div>
      </div>

      {/* 2. Primary 3-Metric Cards with Breathing Space */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Project Cost</span>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">
            ₹{display?.projectCost ? Number(display.projectCost).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Total capital for machinery, equipment & setup
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Your Investment (10%)</span>
            <IndianRupee className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-3">
            ₹{display?.marginCapital ? Number(display.marginCapital).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Beneficiary promoter margin required
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Government Loan (90%)</span>
            <Percent className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-3">
            ₹{display?.loanAmount ? Number(display.loanAmount).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            @8.0% p.a. • 84 Months ({display?.moratoriumMonths || 6} Months Grace Period)
          </div>
        </div>
      </div>

      {/* 3. Interactive Margin Money Simulator */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Loan & Investment Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your self-investment to see the updated loan eligibility and repayment schedule.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">Your Investment Selected: </span>
            <span className="text-lg font-black text-blue-700">₹{Number(marginInput).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="py-3">
          <input
            type="range"
            min="5000"
            max="500000"
            step="1000"
            value={marginInput}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMarginInput(val);
              if (onMarginChange) onMarginChange(val);
            }}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>₹5,000 (Min Micro)</span>
            <span>₹1,00,000</span>
            <span>₹2,50,000</span>
            <span>₹5,00,000 (₹50 Lakh Maximum)</span>
          </div>
        </div>

        {/* Repayment Breakdown Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">Monthly Equivalent (EMI)</div>
            <div className="text-lg font-black text-blue-700 mt-1">
              ₹{display?.monthlyEquivalentInstallment ? Number(display.monthlyEquivalentInstallment).toLocaleString('en-IN') : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Budgeted monthly outflow</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">Quarterly Installment</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              ₹{display?.quarterlyInstallment ? Number(display.quarterlyInstallment).toLocaleString('en-IN') : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Paid once every 3 months</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">Setup Grace Period</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {display?.moratoriumMonths || 6} Months
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Pay only minimal interest during startup</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">Loan Repayment Capacity</div>
            <div className={`text-lg font-black mt-1 ${
              display?.foirBadgeColor === 'GREEN' ? 'text-emerald-700' :
              display?.foirBadgeColor === 'YELLOW' ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {display?.foirPercentage}% (Safe)
            </div>
            <div className="text-[11px] text-slate-400 mt-1">of ₹{initialNetProfit.toLocaleString('en-IN')} net income</div>
          </div>
        </div>
      </div>

      {/* 4. Monthly Profit Cushion Projection */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-700" />
              <span>Monthly Business Profit & Repayment Cushion</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Safe benchmark: Debt payments should not exceed 35% of monthly net income.
            </p>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            Estimated Monthly Savings Surplus: ₹{Math.max(0, initialNetProfit - (display?.monthlyEquivalentInstallment || 0)).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Visual Cushion Bar */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-600">Loan Repayment Share:</span>
              <span className="font-bold text-blue-700">
                ₹{display?.monthlyEquivalentInstallment?.toLocaleString('en-IN')} ({display?.foirPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, display?.foirPercentage || 25)}%` }}
              />
              <div className="h-full bg-slate-200 flex-1" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe Range (&lt; 35%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate (35% - 50%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> High Burden (&gt; 50%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
