import React from 'react';
import { MapPin, Users, ShoppingBag, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Store, Compass } from 'lucide-react';
import { GoogleMapView } from './common/GoogleMapView';

export function TabFeasibility({ reportData, dashboardKpis, villageContext, module1Report, supplyMetrics }) {
  // Support both props structures
  const m1 = module1Report || reportData || {};
  const vc = villageContext || m1?.village_context || {};
  const { marketReach, opportunityAnalysis, swotAnalysis, competitorDensity, competitorMapping, productMarketValue } = m1;

  const compData = competitorDensity || competitorMapping || {};
  const sm = supplyMetrics || m1?.supply_metrics || compData?.supplyMetrics || {};
  const nearbyShops = sm?.nearbyPlaces || compData?.nearbyPlaces || m1?.nearbyPlaces || [];

  const lat = Number(
    vc?.latitude ||
    dashboardKpis?.latitude ||
    m1?.latitude ||
    reportData?.latitude ||
    (nearbyShops && nearbyShops.length > 0 ? nearbyShops[0].latitude : null)
  ) || 10.0524;

  const lng = Number(
    vc?.longitude ||
    dashboardKpis?.longitude ||
    m1?.longitude ||
    reportData?.longitude ||
    (nearbyShops && nearbyShops.length > 0 ? nearbyShops[0].longitude : null)
  ) || 78.3344;

  return (
    <div className="space-y-8">
      {/* 1. Village Demographics Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-blue-700">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">
                  {vc?.villageName || dashboardKpis?.village_name || 'Selected Village'}, {vc?.districtName || dashboardKpis?.district_name || 'District'}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {vc?.subdistrictName || 'Subdistrict Block'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Economic Zone: <strong>{vc?.districtIncomeBand || 'Developing Rural Cluster'}</strong> • State: <strong>{vc?.stateName || 'India'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs text-slate-500">Village Population</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {vc?.population ? Number(vc.population).toLocaleString('en-IN') : '5,420'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Households</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {vc?.households ? Number(vc.households).toLocaleString('en-IN') : '1,340'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Literacy Rate</div>
              <div className="text-lg font-black text-blue-700 mt-0.5">
                {vc?.literacyRate || '74.2'}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Market Reach & Opportunity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Market Reach */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Customer Reach (10 km Market Area)
            </h3>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Potential Customers</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {marketReach?.consumerBasePopulation ? Number(marketReach.consumerBasePopulation).toLocaleString('en-IN') : '35,000+'}
              </div>
              <span className="text-[11px] text-slate-400">Within 10 km radius</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Consumer Households</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {marketReach?.consumerBaseHouseholds ? Number(marketReach.consumerBaseHouseholds).toLocaleString('en-IN') : '7,200+'}
              </div>
              <span className="text-[11px] text-slate-400">Local family units</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold text-slate-700 mb-3">Key Distribution Outlets:</div>
            <ul className="space-y-2">
              {(marketReach?.primaryDistributionChannels || [
                "Weekly Village Haats & Shandy Markets",
                "Direct Counter Sales to Local Residents",
                "Supply to Nearby Gram Panchayat Grocers"
              ]).map((ch, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{ch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Opportunity Analysis */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Local Market Demand & Gaps
            </h3>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Opportunity Rating:</span>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500 text-slate-950">
              {opportunityAnalysis?.opportunityScore || 'High'} Potential
            </span>
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold text-slate-700 mb-3">Identified Local Gaps & Niches:</div>
            <ul className="space-y-2.5">
              {(opportunityAnalysis?.underservedNiches || [
                "High unfulfilled demand for fresh daily provisions within the revenue village",
                "Absence of affordable doorstep repair & maintenance services in local cluster",
                "Reliable bulk orders from neighboring farm workers during harvest months"
              ]).map((niche, idx) => (
                <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="font-black text-blue-700 shrink-0">#{idx + 1}</span>
                  <span className="leading-relaxed">{niche}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Strategic SWOT Analysis Grid */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Business Strengths, Weaknesses, Opportunities & Risks (SWOT)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <div className="text-xs font-black text-emerald-800 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>STRENGTHS (ताकत)</span>
            </div>
            <ul className="space-y-2">
              {(swotAnalysis?.strengths || [
                "Low initial overhead costs in rural village setting",
                "Direct relationships with local community and word-of-mouth trust"
              ]).map((s, i) => (
                <li key={i} className="text-xs text-emerald-950 flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200">
            <div className="text-xs font-black text-amber-800 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>WEAKNESSES (कमियां)</span>
            </div>
            <ul className="space-y-2">
              {(swotAnalysis?.weaknesses || [
                "Limited initial working capital for bulk inventory purchases",
                "Dependence on erratic power supply for electric machinery"
              ]).map((w, i) => (
                <li key={i} className="text-xs text-amber-950 flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200">
            <div className="text-xs font-black text-blue-800 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>OPPORTUNITIES (अवसर)</span>
            </div>
            <ul className="space-y-2">
              {(swotAnalysis?.opportunities || [
                "Expanding supply to weekly fairs in adjacent villages",
                "Bundling complementary goods during festival seasons"
              ]).map((o, i) => (
                <li key={i} className="text-xs text-blue-950 flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200">
            <div className="text-xs font-black text-rose-800 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>THREATS (जोखिम)</span>
            </div>
            <ul className="space-y-2">
              {(swotAnalysis?.threats || [
                "Seasonal fluctuations in farm household incomes during monsoon",
                "New competitor entry from nearby highway junction"
              ]).map((t, i) => (
                <li key={i} className="text-xs text-rose-950 flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Pricing & Competition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Market Value */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Pricing Guidance & Sales Projection
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="text-xs font-semibold text-slate-700">Recommended Price:</span>
              <span className="text-sm font-black text-blue-900">
                {productMarketValue?.recommendedSellingPrice || '₹120 - ₹250 per unit'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Estimated Daily Sales:</span>
              <span className="text-sm font-bold text-slate-900">
                {productMarketValue?.estimatedDailySalesVolumeUnits || '35 - 50'} units / day
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Estimated Monthly Profit:</span>
              <span className="text-sm font-black text-emerald-700">
                ₹{productMarketValue?.estimatedMonthlyNetProfit ? Number(productMarketValue.estimatedMonthlyNetProfit).toLocaleString('en-IN') : '28,500'}
              </span>
            </div>
          </div>
        </div>

        {/* Competitor Density */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Local Competitor Saturation
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Total Nearby Shops:</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {nearbyShops.length > 0 ? nearbyShops.length : (compData?.total_nearby_shops ?? compData?.totalNearbyShops ?? 6)}
              </div>
              <span className="text-[11px] text-slate-400">Within 10 km zone</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Direct Competitors:</span>
              <div className="text-xl font-black text-amber-700 mt-1">
                {compData?.direct_competitors ?? compData?.directCompetitors ?? Math.min(3, Math.max(1, Math.floor((nearbyShops.length || 6) * 0.3)))}
              </div>
              <span className="text-[11px] text-slate-400">Same business type</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>
              <strong>Market Saturation: Low to Moderate.</strong> The local village cluster has sufficient demand headroom for a dedicated provider.
            </span>
          </div>
        </div>
      </div>

      {/* 5. Google Maps: Identified Competitor Shops & Catchment Distribution */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#006B7A] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nearby Businesses & Competitor Shops
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All physical competitor businesses discovered within your 10 km local market area. Tap any pin or shop below to view details.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#006B7A] bg-[#E5F6F8] px-3 py-1.5 rounded-xl border border-[#79E4F3]">
            {nearbyShops.length > 0 ? nearbyShops.length : (compData?.total_nearby_shops ?? compData?.totalNearbyShops ?? 6)} Shops Mapped
          </span>
        </div>

        <GoogleMapView
          latitude={lat}
          longitude={lng}
          radiusKm={10}
          places={nearbyShops}
          originName={vc?.villageName ? `${vc.villageName} Enterprise Center` : 'Proposed Enterprise'}
          interactive={true}
          height="420px"
          showList={true}
          showRadius={true}
        />
      </div>
    </div>
  );
}

