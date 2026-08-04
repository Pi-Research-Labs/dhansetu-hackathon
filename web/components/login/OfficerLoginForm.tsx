"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials, OfficerUser } from "@/redux/slices/authSlice";
import { useTranslation } from "@/utils/translations/useTranslation";
import { officerLogin } from "@/utils/api-config";
import { STORAGE_KEYS } from "@/utils/constants";
import {
  UserCheck,
  Lock,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function OfficerLoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemoCredentials = () => {
    setPhoneNumber("8000000001");
    setPassword("Prakash@FO1");
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        phone_number: phoneNumber,
        password: password,
      };

      // Call central API function officerLogin
      const data = await officerLogin(payload);

      if (!data || !data.access_token) {
        throw new Error("Invalid login response from server");
      }

      const token = data.access_token;
      const officerUser: OfficerUser = {
        officer_id: data.officer_id || "FO1",
        officer_name: data.officer_name || "Field Officer",
        district_id: data.district_id,
        phone_number: phoneNumber,
      };

      // Save token and officer info in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(officerUser));
      }

      // Dispatch to Redux store
      dispatch(setCredentials({ user: officerUser, token }));

      // Redirect to protected officer portfolio dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid phone number or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[460px] w-full mx-auto">
      {/* Header Badge & Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
          <span>OFFICER AUTHORIZATION PORTAL</span>
        </div>

        <h1 className="font-['Poppins',sans-serif] font-bold text-2xl tracking-tight text-[#1A2016] mb-1">
          DHANSETU <span className="text-[#2E7D32]">धनसेतु</span>
        </h1>
        <p className="text-xs text-[#5F6656]">{t.dash.tagline}</p>
      </div>

      {/* Login Form Container */}
      <div className="bg-white border border-[#E2E6D8] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#E2E6D8]">
          <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center justify-center text-[#2E7D32]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A2016]">{t.login.title}</h2>
            <p className="text-[11px] text-[#5F6656]">{t.login.subtitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-[#FFEBEE] border border-[#FFCDD2] text-[#B71C1C] text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold text-[#5F6656] mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#5F6656]" />
              <span>{t.login.phoneLabel}</span>
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-[#5F6656]">
                +91
              </span>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.login.phonePlaceholder}
                className="block w-full pl-12 pr-3 py-2.5 bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg text-sm text-[#1A2016] placeholder-[#9E9E9E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5F6656] mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#5F6656]" />
              <span>{t.login.passwordLabel}</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordPlaceholder}
              className="block w-full px-3 py-2.5 bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg text-sm text-[#1A2016] placeholder-[#9E9E9E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#2E7D32] hover:bg-[#236327] disabled:opacity-50 transition-all cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-2"
          >
            <span>{loading ? t.login.submitting : t.login.submitButton}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Demo Helper Box */}
        <div className="mt-5 pt-4 border-t border-[#E2E6D8]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#1565C0] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1565C0]" />
              {t.login.quickDemoHeader}
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[10.5px] text-[#2E7D32] font-bold hover:underline cursor-pointer"
            >
              Auto Fill Credentials
            </button>
          </div>
          {/* <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8] text-[11px] font-mono text-[#1A2016] space-y-0.5">
            <div>Phone: <span className="font-bold">9000000031</span></div>
            <div>Password: <span className="font-bold">Lakshmi@0031</span></div>
          </div> */}
        </div>
      </div>

      <p className="mt-4 text-[10.5px] text-center text-[#5F6656]">
        {t.login.govtPortalNote}
      </p>
    </div>
  );
}
