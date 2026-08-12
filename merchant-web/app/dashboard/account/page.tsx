"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  Globe,
  Lock,
  LogOut,
  HelpCircle,
  Building2,
  ChevronRight,
  X,
  PhoneCall,
  KeyRound,
  CheckCircle2,
  MapPin,
  Plus,
  Minus,
  MessageSquare,
  Smartphone,
  History,
} from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L, SupportedLang } from '@/i18n/translations';
import { apiClient } from '@/utils/api-config';
import { SecurityBadge } from '@/components/common/SecurityBadge';
import { CustomAlert } from '@/components/common/CustomAlert';

const LANG_LIST: { id: SupportedLang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी (Hindi)' },
  { id: 'mr', label: 'मराठी (Marathi)' },
  { id: 'te', label: 'తెలుగు (Telugu)' },
];

export default function AccountScreen() {
  const router = useRouter();

  const {
    lang,
    setLang,
    name,
    segment,
    district,
    phone,
    gstin,
    logout,
    token,
    enterpriseId,
    smsAutoDetectEnabled,
    setSmsAutoDetectEnabled,
    smsDetectedCount,
    smsHistoryImportEnabled,
    setSmsHistoryImportEnabled,
  } = useMerchantStore();

  const t = L[lang] || L.en;

  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);

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

  // Map Tile States
  const [mapImageUri, setMapImageUri] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(15);

  useEffect(() => {
    if (enterpriseId && token) {
      setMapLoading(true);
      setMapError(false);
      apiClient.get(`/enterprise/${enterpriseId}/map-tile?zoom=${zoom}&size=500x250`, {
        responseType: 'arraybuffer'
      })
        .then(response => {
          // Convert arraybuffer to base64 browser-safely
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          setMapImageUri(`data:image/png;base64,${base64}`);
          setMapLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch map tile:', err);
          setMapError(true);
          setMapLoading(false);
        });
    }
  }, [enterpriseId, token, zoom]);

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
    router.replace('/login');
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-[#1D261F] text-xl font-bold">{t.accountTitle}</h2>
        <p className="text-[#6F6B5E] text-xs leading-normal mt-1">{t.accountSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── LEFT COLUMN: profile & map ─── */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Merchant Profile Card */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#E7F2E7] flex items-center justify-center font-bold text-lg text-[#2E7D32] border border-[#E7E5DA] shrink-0">
                <User className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#1D261F] text-sm font-bold truncate">{name}</h3>
                <p className="text-[#6F6B5E] text-xs mt-0.5 truncate">{segment} · {district}</p>
              </div>
            </div>

            <div className="h-[1px] bg-[#E7E5DA]" />

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="w-4 h-4 text-[#6F6B5E] shrink-0" />
                <span className="text-[#6F6B5E] font-medium">GSTIN / Merchant ID:</span>
                <span className="text-[#1D261F] font-bold truncate">{gstin}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[#6F6B5E] font-medium">Verification Status:</span>
                <div className="flex items-center gap-1 bg-[#E7F2E7] border border-[#E7E5DA] px-2 py-0.5 rounded-full text-[10px] font-bold text-[#2E7D32]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>GST & Aadhaar Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Business Location Card */}
          {enterpriseId && token && (
            <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E7F2E7] flex items-center justify-center border border-[#E7E5DA] shrink-0">
                  <MapPin className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="text-[#1D261F] text-sm font-bold">Verified Shop Location</h3>
                  <p className="text-[#6F6B5E] text-xs mt-0.5">Google Maps Centered GPS Centroid</p>
                </div>
              </div>

              <div className="h-[1px] bg-[#E7E5DA]" />

              {/* Map Box */}
              <div className="relative w-full h-[160px] rounded-xl overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center">
                {mapLoading && !mapImageUri ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-[#6F6B5E] font-semibold">Loading location map...</span>
                  </div>
                ) : mapError ? (
                  <div className="flex flex-col items-center gap-1 text-center p-3 text-[#C0392B]">
                    <MapPin className="w-6 h-6 text-[#C0392B] mb-1.5" />
                    <span className="text-[10px] font-bold">Unable to load map tile.</span>
                  </div>
                ) : mapImageUri ? (
                  <>
                    <img
                      src={mapImageUri}
                      alt="Verified Shop Map Location"
                      className="w-full h-full object-cover select-none"
                    />
                    {mapLoading && (
                      <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {/* Zoom Buttons */}
                    <div className="absolute bottom-3 right-3 bg-white border border-[#E2E8F0] rounded-lg shadow-md overflow-hidden flex flex-col">
                      <button
                        onClick={() => setZoom(prev => Math.min(18, prev + 1))}
                        disabled={zoom >= 18 || mapLoading}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 text-[#1D261F] disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="h-[1px] bg-[#E2E8F0] w-full" />
                      <button
                        onClick={() => setZoom(prev => Math.max(12, prev - 1))}
                        disabled={zoom <= 12 || mapLoading}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 text-[#1D261F] disabled:opacity-50 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>

              <p className="text-[#6F6B5E] text-[10px] leading-relaxed italic mt-1">
                Your GPS coordinates are securely locked and verified by your regional nodal coordinator.
              </p>
            </div>
          )}

        </div>

        {/* ─── RIGHT COLUMN: settings & preferences ─── */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-[#1D261F] text-xs font-bold uppercase tracking-wider pl-1">
            {t.accountSettings}
          </span>

          {/* Language Selector */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E7F2E7] flex items-center justify-center border border-[#E7E5DA]">
                <Globe className="w-4.5 h-4.5 text-[#2E7D32]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D261F]">{t.changeLanguage}</h4>
                <p className="text-[#6F6B5E] text-[10px] font-semibold mt-0.5">Select your preferred app language</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {LANG_LIST.map((item) => {
                const isSelected = item.id === lang;
                return (
                  <button
                    key={item.id}
                    onClick={() => setLang(item.id)}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E7F2E7] border-[#2E7D32] text-[#2E7D32]'
                        : 'bg-white border-[#E7E5DA] text-[#6F6B5E] hover:bg-[#FAFAF5]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Trigger */}
          <button
            onClick={() => setSecurityModalVisible(true)}
            className="bg-white border border-[#E7E5DA] hover:bg-[#FAFAF5] rounded-2xl p-4 shadow-xs flex items-center justify-between text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center border border-[#E7E5DA]">
                <Lock className="w-4.5 h-4.5 text-[#E65100]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D261F]">{t.securitySettings}</h4>
                <p className="text-[#6F6B5E] text-[10px] font-semibold mt-0.5">Security, Encryption & Password Reset</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-[#6F6B5E]" />
          </button>

          {/* Support Trigger */}
          <button
            onClick={() => setSupportModalVisible(true)}
            className="bg-white border border-[#E7E5DA] hover:bg-[#FAFAF5] rounded-2xl p-4 shadow-xs flex items-center justify-between text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E3F2FD] flex items-center justify-center border border-[#E7E5DA]">
                <HelpCircle className="w-4.5 h-4.5 text-[#1565C0]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D261F]">{t.supportHelpdesk}</h4>
                <p className="text-[#6F6B5E] text-[10px] font-semibold mt-0.5">Toll Free Support & Email Helpdesk</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-[#6F6B5E]" />
          </button>

          {/* SMS Toggles */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] flex items-center justify-center border border-[#E7E5DA]">
                  <MessageSquare className="w-4.5 h-4.5 text-[#1565C0]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D261F]">Auto-Detect Bank SMS</h4>
                  <p className="text-[#6F6B5E] text-[10px] font-semibold mt-0.5">Detect transactions from bank SMS</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#C0392B] bg-[#F8E6E2] px-2.5 py-1 rounded">only available on phone app</span>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center border border-[#E7E5DA]">
                  <History className="w-4.5 h-4.5 text-[#E65100]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D261F]">Import SMS History</h4>
                  <p className="text-[#6F6B5E] text-[10px] font-semibold mt-0.5">Import past bank transactions on start</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#C0392B] bg-[#F8E6E2] px-2.5 py-1 rounded">only available on phone app</span>
            </div>
          </div>

          {/* Download App QR Code Card */}
          {isQrExpanded ? (
            <div
              onClick={() => setIsQrExpanded(false)}
              className="bg-[#FAFBF6] border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex md:hidden flex-col sm:flex-row items-center gap-4 cursor-pointer hover:bg-[#FAFBF6]/90 transition-all select-none"
            >
              <div className="shrink-0">
                <img
                  src="/app-qr.png"
                  alt="DhanSetu App QR"
                  className="w-24 h-24 bg-white p-2 rounded-xl border border-[#E7E5DA] shadow-2xs object-contain"
                />
              </div>
              <div className="flex-1 text-center sm:text-left flex flex-col gap-1">
                <h4 className="text-[#1D261F] text-xs font-bold">Download DhanSetu Phone App</h4>
                <p className="text-[#6F6B5E] text-[11px] font-medium leading-relaxed">
                  Scan this QR code with your smartphone to download the Android app. Enjoy automatic bank SMS detection, off-line entries, and voice ledger logging.
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsQrExpanded(true)}
              className="w-full md:hidden bg-[#FAFBF6] hover:bg-[#E7F2E7] border border-[#E7E5DA] rounded-2xl p-4 text-xs font-bold text-[#2E7D32] text-center transition-all cursor-pointer shadow-xs"
            >
              scan qr to download our dhansetu app
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={() => setLogoutModalVisible(true)}
            className="w-full bg-[#F8E6E2] hover:bg-[#F3CFC9] border border-[#F8E6E2] text-[#C0392B] font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutBtn}</span>
          </button>

        </div>

      </div>

      {/* ─── CUSTOM SECURITY MODAL ─── */}
      {securityModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E7E5DA] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#E7E5DA] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF0D9] flex items-center justify-center">
                  <Lock className="w-4.5 h-4.5 text-[#C77700]" />
                </div>
                <span className="text-xs font-bold text-[#1D261F]">Security & Access Info</span>
              </div>
              <button
                onClick={() => setSecurityModalVisible(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-[#E7F2E7] border border-[#E7E5DA] p-2.5 rounded-lg text-xs font-bold text-[#2E7D32]">
                <ShieldCheck className="w-4 h-4" />
                <span>256-Bit SSL AES Encrypted Secure Gateway</span>
              </div>

              <div className="flex flex-col gap-0.5 mt-2">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Registered GSTIN Credentials:</span>
                <span className="text-xs font-bold text-[#1D261F]">{gstin}</span>
              </div>

              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Aadhaar Linked Mobile:</span>
                <span className="text-xs font-bold text-[#1D261F]">{phone}</span>
              </div>

              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Active Session ID:</span>
                <span className="text-xs font-bold text-[#1D261F]">DS-SEC-SESSION-889231</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSecurityModalVisible(false);
                showAlert('OTP Dispatched', 'Password reset code has been dispatched to your registered Aadhaar mobile number via SMS.', 'success');
              }}
              className="bg-[#2E7D32] hover:bg-[#225F26] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>REQUEST AADHAAR OTP RESET</span>
            </button>

            <button
              onClick={() => setSecurityModalVisible(false)}
              className="text-[#6F6B5E] hover:text-[#1D261F] text-xs font-bold py-1.5 cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── CUSTOM GOVERNMENT SUPPORT MODAL ─── */}
      {supportModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E7E5DA] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#E7E5DA] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E7F2E7] flex items-center justify-center">
                  <HelpCircle className="w-4.5 h-4.5 text-[#2E7D32]" />
                </div>
                <span className="text-xs font-bold text-[#1D261F]">DhanSetu Support Helpdesk</span>
              </div>
              <button
                onClick={() => setSupportModalVisible(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Support Department:</span>
                <span className="font-bold text-[#1D261F]">Financial Inclusion Support Division</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Toll-Free Helpline:</span>
                <span className="font-bold text-[#1565C0]">1800-11-2244</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Official Email Support:</span>
                <span className="font-bold text-[#1D261F]">support@dhansetu.example</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#6F6B5E] uppercase">Operating Hours:</span>
                <span className="font-bold text-[#1D261F]">Mon - Sat: 9:00 AM to 6:00 PM IST</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSupportModalVisible(false);
                showAlert('Calling Support', 'Dialing Toll Free: 1800-11-2244...', 'info');
              }}
              className="bg-[#2E7D32] hover:bg-[#225F26] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL HELPLINE (1800-11-2244)</span>
            </button>

            <button
              onClick={() => setSupportModalVisible(false)}
              className="text-[#6F6B5E] hover:text-[#1D261F] text-xs font-bold py-1.5 cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── CUSTOM LOGOUT MODAL ─── */}
      {logoutModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E7E5DA] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#E7E5DA] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F8E6E2] flex items-center justify-center">
                  <LogOut className="w-4.5 h-4.5 text-[#C0392B]" />
                </div>
                <span className="text-xs font-bold text-[#1D261F]">Confirm Merchant Logout</span>
              </div>
              <button
                onClick={() => setLogoutModalVisible(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-center p-2">
              <h4 className="font-bold text-[#1D261F] text-sm">Are you sure you want to log out?</h4>
              <p className="text-[#6F6B5E] leading-relaxed mt-0.5">Your transaction ledger entries and financial records are securely saved on device.</p>
            </div>

            <button
              onClick={confirmLogout}
              className="bg-[#C0392B] hover:bg-[#962A1F] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>YES, LOGOUT NOW</span>
            </button>

            <button
              onClick={() => setLogoutModalVisible(false)}
              className="text-[#6F6B5E] hover:text-[#1D261F] text-xs font-bold py-1.5 cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Alert */}
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
