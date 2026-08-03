"use client";

import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";

export default function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-white py-4 px-6 flex items-center justify-between shadow-md">
      <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90">
        DhanSetu
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-slate-300 hover:text-white transition-colors">
          Home
        </Link>
        {isAuthenticated ? (
          <span className="text-emerald-400 font-medium">
            Welcome, {user?.name || "User"}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">
            Not Logged In
          </span>
        )}
      </nav>
    </header>
  );
}
