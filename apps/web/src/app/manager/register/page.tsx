"use client";

import { KeyRound } from "lucide-react";
import { AuthLayout, RegisterForm } from "@/components/auth";

export default function ManagerRegisterPage() {
  return (
    <AuthLayout
      icon={KeyRound}
      title="Espace Gestionnaire"
      subtitle="Plateforme de gestion professionnelle"
      iconColorClass="text-emerald-600"
      titleColorClass="text-emerald-600"
      sidebarGradientFrom="from-emerald-500"
      sidebarGradientTo="to-teal-600"
    >
      <RegisterForm
        userType="manager"
        icon={KeyRound}
        title="Espace Gestionnaire"
        redirectAfterRegister="/app/pending"
        loginUrl="/manager/login"
        iconColorClass="text-emerald-600"
        titleColorClass="text-emerald-600"
        buttonClass="bg-emerald-600 hover:bg-emerald-700"
        linkColorClass="text-emerald-600"
      />
    </AuthLayout>
  );
}
