"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkIsAuthenticated } from "@/utils/auth";
import OfficerLoginForm from "@/components/login/OfficerLoginForm";

export default function OfficerLoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated || checkIsAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F5F0] text-[#1A2016] flex flex-col justify-center py-10 px-4">
      <OfficerLoginForm />
    </div>
  );
}
