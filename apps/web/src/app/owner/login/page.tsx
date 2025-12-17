"use client";

import { Building2 } from "lucide-react";
import { AuthLayout, LoginForm } from "@/components/auth";

export default function OwnerLoginPage() {
  return (
    <AuthLayout
      icon={Building2}
      title="Le Copropriétaire"
      subtitle="Gérez votre copropriété en toute simplicité"
      iconColorClass="text-blue-600"
      titleColorClass="text-blue-600"
      sidebarGradientFrom="from-blue-500"
      sidebarGradientTo="to-indigo-600"
    >
      <LoginForm
        userType="owner"
        icon={Building2}
        title="Le Copropriétaire"
        description="Accédez à votre espace copropriétaire"
        registerUrl="/owner/register"
        redirectAfterLogin="/portal"
        pendingRedirectUrl="/portal/pending"
        iconColorClass="text-blue-600"
        titleColorClass="text-blue-600"
        buttonClass="bg-blue-600 hover:bg-blue-700"
        linkColorClass="text-blue-600"
      />
    </AuthLayout>
  );
}
