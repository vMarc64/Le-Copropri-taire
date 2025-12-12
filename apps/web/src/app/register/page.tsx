"use client";

import { RegisterForm } from "@/components/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to login with success message
    router.push("/login?registered=true");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Le Copropriétaire</h1>
        <p className="text-muted-foreground mt-2">
          Inscription Gestionnaire de Copropriété
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm onSuccess={handleSuccess} />

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
        © 2025 Le Copropriétaire. Tous droits réservés.
      </footer>
    </div>
  );
}
