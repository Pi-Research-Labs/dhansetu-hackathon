"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, setCredentials, OfficerUser } from "@/redux/slices/authSlice";
import { useTranslation } from "@/utils/translations/useTranslation";
import { LanguageCode } from "@/redux/slices/languageSlice";
import { STORAGE_KEYS } from "@/utils/constants";
import { isTokenValid } from "@/utils/auth";
import { fetchAuthMe } from "@/utils/api-config";
import { Globe, LogOut, UserCheck, ChevronDown, Check } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t, currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Restore session from stored token using GET /auth/me on app start
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUserStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (token && isTokenValid(token) && storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          dispatch(setCredentials({ user: storedUser, token }));
        } catch {
          // ignore invalid json
        }

        // Call GET /auth/me with Authorization: Bearer <token> to restore identity from server
        fetchAuthMe()
          .then((meData) => {
            const restoredUser: OfficerUser = {
              role: meData.role || "officer",
              officer_id: meData.officer_id || (meData.user_id as string) || "FO1",
              officer_name: meData.officer_name || (meData.name as string) || "Prakash Nair",
              district_id: meData.district_id ?? 1,
            };
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(restoredUser));
            dispatch(setCredentials({ user: restoredUser, token }));
          })
          .catch((err: unknown) => {
            const errStr = String(err);
            if (errStr.includes("401") || errStr.includes("Unauthorized")) {
              localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_INFO);
              dispatch(logout());
            }
          });
      } else if (token && !isTokenValid(token)) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        dispatch(logout());
      }
    }
  }, [dispatch, isAuthenticated]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
    router.push("/");
  };

  const officerName = user?.officer_name || user?.name || "Officer";
  const initialLetter = officerName.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-white border-b border-[#E2E6D8] sticky top-0 z-50 shadow-xs">
      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full border border-[#2E7D32]/30 overflow-hidden group-hover:scale-105 transition-transform">
            <Image
              src="/favicon.png"
              alt="Dhansetu Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-baseline gap-1.5 font-['Poppins',sans-serif] font-bold text-xl tracking-tight text-[#1A2016]">
            <span>DHANSETU</span>
            <span className="text-[#2E7D32] font-semibold text-lg">धनसेतु</span>
          </div>
        </Link>

        {/* Right Menu Controls */}
        <div className="flex items-center gap-3" ref={menuRef}>
          {isAuthenticated ? (
            /* Authenticated User Dropdown Menu */
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 bg-[#FAFBF6] hover:bg-[#E8F5E9] border border-[#E2E6D8] hover:border-[#2E7D32]/40 rounded-full pl-2 pr-3 py-1 text-left cursor-pointer transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-bold">
                  {initialLetter}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-[#1A2016] leading-tight">
                    {officerName}
                  </div>
                  <div className="text-[10px] text-[#5F6656] leading-tight">Field Officer</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#5F6656] transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Card */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E2E6D8] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Officer Info Card */}
                  <div className="p-3 rounded-xl bg-[#FAFBF6] border border-[#E2E6D8] mb-2.5">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#2E7D32]" />
                      <span className="text-xs font-bold text-[#1A2016]">{officerName}</span>
                    </div>
                    <div className="text-[10.5px] text-[#2E7D32] font-semibold mt-0.5">Field Officer</div>
                    <div className="text-[10px] font-mono text-[#5F6656] mt-1">
                      ID: {user?.officer_id || "FO1"} {user?.district_id ? `· District #${user.district_id}` : ""}
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="px-1 py-1.5 border-t border-[#E2E6D8] pt-2.5">
                    <div className="text-[10.5px] font-bold text-[#5F6656] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#2E7D32]" />
                      <span>Language / भाषा</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {availableLanguages.map((lang) => {
                        const isSelected = currentLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              changeLanguage(lang.code as LanguageCode);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left font-medium transition-all cursor-pointer ${isSelected
                              ? "bg-[#E8F5E9] text-[#2E7D32] font-bold"
                              : "hover:bg-[#FAFBF6] text-[#1A2016]"
                              }`}
                          >
                            <span>{lang.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#2E7D32]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logout Item */}
                  <div className="border-t border-[#E2E6D8] mt-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#C62828] hover:bg-[#FFEBEE] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#C62828]" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Dropdown & Login Button */
            <div className="flex items-center gap-2.5">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-1.5 bg-[#FAFBF6] hover:bg-[#E8F5E9] border border-[#E2E6D8] rounded-full px-3 py-1.5 text-xs text-[#1A2016] font-medium cursor-pointer transition-all shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>{availableLanguages.find((l) => l.code === currentLanguage)?.name}</span>
                  <ChevronDown className={`w-3 h-3 text-[#5F6656] transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-[#E2E6D8] rounded-xl shadow-xl p-1.5 z-50">
                    {availableLanguages.map((lang) => {
                      const isSelected = currentLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            changeLanguage(lang.code as LanguageCode);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isSelected
                            ? "bg-[#E8F5E9] text-[#2E7D32] font-bold"
                            : "hover:bg-[#FAFBF6] text-[#1A2016]"
                            }`}
                        >
                          <span>{lang.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#2E7D32]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Officer Login Button */}
              <Link
                href="/login"
                className="bg-[#2E7D32] hover:bg-[#236327] text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.nav.officerLogin}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
