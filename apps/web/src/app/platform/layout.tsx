import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/platform" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">Le Copropriétaire</span>
              <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                Admin
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/platform"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/platform/tenants"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Gestionnaires
              </Link>
              <Link
                href="/platform/settings"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Paramètres
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              PA
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">{children}</main>
    </div>
  );
}
