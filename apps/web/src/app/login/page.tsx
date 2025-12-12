import { LoginForm } from "@/components/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function LoginPage() {
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
          Plateforme de gestion de copropriété
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Vous êtes gestionnaire ?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </p>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
        © 2025 Le Copropriétaire. Tous droits réservés.
      </footer>
    </div>
  );
}
