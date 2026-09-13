import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export function LoginPage({ onLoginSuccess, onCancel, selectedLang = 'en' }) {
  const t = getTranslation(selectedLang);
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('beneficiary');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Google OAuth 2.0 Handler
  const handleGoogleSignIn = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  // Standard Email/Password Login Handler
  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = tab === 'login'
      ? { email: email.trim(), password }
      : { email: email.trim(), password, name: name.trim(), role, preferredLanguage: selectedLang };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t.loginError);
      }

      const data = await res.json();
      localStorage.setItem('vyapaarsathi_token', data.token);
      localStorage.setItem('vyapaarsathi_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(err.message || t.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16 bg-slate-100 min-h-[600px]">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-white border border-slate-300 shadow-md">
        {/* Government Masthead */}
        <div className="text-center mb-8 pb-6 border-b border-slate-200">
          <img
            src="/favicon.svg"
            alt="VyapaarSathi Emblem"
            className="w-14 h-14 rounded-full mx-auto mb-4 shadow-sm"
          />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.govIndia}
          </div>
          <h2 className="text-2xl font-black text-[#0B2545] tracking-tight mt-1">
            {t.loginTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {t.ministryName}
          </p>
        </div>

        {/* 1. Google OAuth 2.0 Sign In */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 hover:border-slate-400 active:scale-98 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t.googleSignIn}</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="shrink-0 mx-4 text-xs font-semibold text-slate-400">
            {t.orDivider}
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Tab Toggle: Sign In / Create Account */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabLogin}
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabRegister}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleStandardAuth} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.labelName} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t.placeholderName}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.labelEmail} *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.placeholderEmail}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.labelPassword} *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.placeholderPassword}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.labelRole}
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="beneficiary">{t.roleBeneficiary}</option>
                <option value="officer">{t.roleOfficer}</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0B2545] hover:bg-[#133E68] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>{t.loading}</span>
            ) : (
              <>
                <span>{tab === 'login' ? t.btnSignInAction : t.btnRegisterAction}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            {t.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
}
