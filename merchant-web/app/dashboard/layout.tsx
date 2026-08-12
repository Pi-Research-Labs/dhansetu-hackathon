"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  PlusCircle,
  Bell,
  Store,
  User,
  LogOut,
  Landmark,
} from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { GovHeader } from '@/components/common/GovHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    lang,
    isAuthenticated,
    restoreSession,
    logout,
    name,
    proprietorName,
    hasUnreadAlerts,
  } = useMerchantStore();

  const [loading, setLoading] = useState(true);
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const t = L[lang] || L.en;

  // Authentication gate & session restoration
  useEffect(() => {
    const checkSession = async () => {
      const isSessionActive = await restoreSession();
      if (!isSessionActive) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [restoreSession, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const navItems = [
    {
      label: t.myPortfolio || 'Portfolio',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t.addNew || 'Add Entry',
      path: '/dashboard/add-entry',
      icon: PlusCircle,
    },
    {
      label: 'Alerts',
      path: '/dashboard/alerts',
      icon: Bell,
      badge: hasUnreadAlerts,
    },
    {
      label: lang === 'hi' ? 'बाज़ार' : (lang === 'mr' ? 'बाजार' : (lang === 'te' ? 'మార్కెట్' : 'Market')),
      path: '/dashboard/market',
      icon: Store,
    },
    {
      label: t.accountTitle ? t.accountTitle.split(' ')[0] : 'Settings',
      path: '/dashboard/account',
      icon: User,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF5]">
        <div className="w-10 h-10 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-[#6F6B5E]">Establishing Secure Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1D261F] flex flex-col md:flex-row">

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E7E5DA] fixed top-0 bottom-0 left-0 p-4 justify-between z-30">
        <div className="flex flex-col gap-6">
          <div className="py-2 border-b border-[#E7E5DA] pb-4">
            <GovHeader />
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${isActive
                      ? 'bg-[#E7F2E7] text-[#2E7D32]'
                      : 'text-[#6F6B5E] hover:bg-[#FAFAF5] hover:text-[#1D261F]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2E7D32]' : 'text-[#6F6B5E]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <div className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* QR Code Phone App Download Card */}
        {isQrExpanded ? (
          <div
            onClick={() => setIsQrExpanded(false)}
            className="bg-[#FAFBF6] border border-[#E7E5DA] rounded-xl p-3 flex flex-col items-center text-center gap-1.5 mt-auto mb-2 select-none cursor-pointer hover:bg-[#FAFBF6]/90 transition-all"
          >
            <img src="/app-qr.png" alt="DhanSetu App QR" className="w-16 h-16 bg-white p-1 rounded-lg border border-[#E7E5DA] object-contain" />
            <span className="text-[9px] font-bold text-[#1D261F]">Get DhanSetu Phone App</span>
            <span className="text-[8px] text-[#6F6B5E] leading-normal font-semibold">Scan to sync SMS & Voice alerts</span>
          </div>
        ) : (
          <button
            onClick={() => setIsQrExpanded(true)}
            className="mt-auto mb-2 py-2 px-3 bg-[#FAFBF6] hover:bg-[#E7F2E7] border border-[#E7E5DA] rounded-lg text-[9px] font-bold text-[#2E7D32] transition-all text-center w-full cursor-pointer"
          >
            scan qr to download our dhansetu app
          </button>
        )}

        {/* User Card & Logout */}
        <div className="border-t border-[#E7E5DA] pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-[#E7F2E7] flex items-center justify-center font-bold text-xs text-[#2E7D32] border border-[#E7E5DA]">
              {proprietorName ? proprietorName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#1D261F] truncate leading-tight">{name}</p>
              <p className="text-[9px] font-semibold text-[#6F6B5E] truncate mt-0.5">{proprietorName}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-bold text-[#C0392B] hover:bg-[#F8E6E2] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout || 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE CONTAINER ─── */}
      <div className="flex-1 flex flex-col md:pl-64">

        {/* Sticky Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E7E5DA] sticky top-0 z-40 shadow-xs">
          <GovHeader />
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full bg-[#FAFAF5] border border-[#E7E5DA] text-[#C0392B] hover:bg-[#F8E6E2]"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-grow p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>

        {/* Sticky Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E7E5DA] flex items-center justify-around px-2 z-40 shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all ${isActive ? 'text-[#2E7D32]' : 'text-[#6F6B5E]'
                  }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#2E7D32]' : 'text-[#6F6B5E]'}`} />
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C0392B] border border-white"></span>
                  )}
                </div>
                <span className="scale-90">{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
