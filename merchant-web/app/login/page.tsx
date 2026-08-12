"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  ArrowRight,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { authLogin } from '@/utils/api-config';
import { GovHeader } from '@/components/common/GovHeader';
import { SecurityBadge } from '@/components/common/SecurityBadge';
import { CustomAlert } from '@/components/common/CustomAlert';

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, login, isAuthenticated } = useMerchantStore();
  const t = L[lang] || L.en;

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Load saved credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPhone = localStorage.getItem('@dhansetu_phone');
        const savedPassword = localStorage.getItem('@dhansetu_password');
        if (savedPhone && savedPassword) {
          setPhone(savedPhone);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Failed to load saved credentials:', error);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length !== 10) {
      showAlert('Validation Error', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }
    if (password.length < 4) {
      showAlert('Validation Error', 'Password must be at least 4 characters long.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Call auth backend
      const data = await authLogin(trimmedPhone, password);

      // Save credentials if Remember Me is checked
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('@dhansetu_phone', trimmedPhone);
          localStorage.setItem('@dhansetu_password', password);
        } else {
          localStorage.removeItem('@dhansetu_phone');
          localStorage.removeItem('@dhansetu_password');
        }
      }

      // Save in Zustand
      await login(trimmedPhone, data.access_token, data.enterprise_id, data.proprietor_name);

      // Redirect
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.detail || 'Invalid credentials or connection timeout. Please check your login details and try again.';
      showAlert('Access Denied', errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = phone.trim().length !== 10 || password.trim().length < 4 || isLoading;

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Top Header Row with Logo & Language Toggle */}
        <div className="flex items-center justify-between">
          <GovHeader />
          <div className="flex items-center gap-1.5 bg-white border border-[#E7E5DA] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5F6656]">
            <Globe className="w-3.5 h-3.5 text-[#2E7D32]" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 font-semibold text-[#1D261F]"
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Branding Intro */}
        <div>
          <h2 className="text-[#1D261F] text-2xl font-bold tracking-tight">{t.merchantAccessPortal}</h2>
          <p className="text-[#6F6B5E] text-xs leading-normal mt-1.5">{t.officialPortalSub}</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Phone Group */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">
                {t.mobileLabel || 'Registered Mobile Number *'}
              </label>
              <div className="flex items-center bg-[#FAFAF5] border border-[#E7E5DA] rounded-lg px-3 py-2.5 focus-within:border-[#2E7D32] transition-colors gap-2.5">
                <Smartphone className="w-4 h-4 text-[#6F6B5E]" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent flex-1 text-xs font-semibold text-[#1D261F] focus:outline-none placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Group */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">
                  {t.passwordLabel || 'Password *'}
                </label>
                <button
                  type="button"
                  onClick={() => showAlert('Password Reset', 'Contact your regional Nodal Officer or reset via Aadhaar OTP on the settings page once logged in.', 'info')}
                  className="text-[#2E7D32] text-[10px] font-bold hover:underline cursor-pointer"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="flex items-center bg-[#FAFAF5] border border-[#E7E5DA] rounded-lg px-3 py-2.5 focus-within:border-[#2E7D32] transition-colors gap-2.5">
                <Lock className="w-4 h-4 text-[#6F6B5E]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-xs font-semibold text-[#1D261F] focus:outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6F6B5E] hover:text-[#1D261F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer mt-1 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#2E7D32] focus:ring-[#2E7D32] border-[#E7E5DA] cursor-pointer"
              />
              <span className="text-[#6F6B5E] text-xs font-semibold">{t.rememberMe}</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-3 rounded-lg text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-sm ${
                isSubmitDisabled
                  ? 'bg-[#BDC5BD] cursor-not-allowed opacity-75'
                  : 'bg-[#2E7D32] hover:bg-[#225F26] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="border-t border-[#E7E5DA] pt-3">
            <SecurityBadge />
          </div>
        </div>

        {/* Footer Support & Disclaimer */}
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            onClick={() => showAlert('Merchant Helpdesk', 'Toll Free Helpline: 1800-11-2244\nEmail Support: support@dhansetu.example', 'info')}
            className="flex items-center gap-1.5 text-[#6F6B5E] hover:text-[#2E7D32] transition-colors text-xs font-bold cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="underline">{t.needHelp}</span>
          </button>
          
          <p className="text-[#6F6B5E] text-[10px] leading-relaxed max-w-sm">
            {t.disclaimer}
          </p>
        </div>

      </div>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </div>
  );
}
