"use client";

import { KeyRound } from "lucide-react";
import { AuthLayout, LoginForm } from "@/components/auth";

export default function ManagerLoginPage() {
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
      <LoginForm
        userType="manager"
        icon={KeyRound}
        title="Espace Gestionnaire"
        description="Accédez à votre espace gestionnaire"
        registerUrl="/manager/register"
        redirectAfterLogin="/app"
        pendingRedirectUrl="/app/pending"
        iconColorClass="text-emerald-600"
        titleColorClass="text-emerald-600"
        buttonClass="bg-emerald-600 hover:bg-emerald-700"
        linkColorClass="text-emerald-600"
      />
    </AuthLayout>
  );
}
