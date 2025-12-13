import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-foreground">Le Copropriétaire</h1>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Main content - Centered */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Bienvenue sur Le Copropriétaire
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La plateforme de gestion de copropriété moderne et intuitive
            </p>
          </div>

          {/* 3 Blocks */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Block 1 - Notre produit */}
            <Link href="/product" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-colors">
                    <Sparkles className="h-8 w-8 text-violet-500" />
                  </div>
                  <CardTitle className="text-xl">Notre produit</CardTitle>
                  <CardDescription>
                    Découvrez comment Le Copropriétaire simplifie la gestion de copropriété
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="text-sm font-medium text-violet-500 group-hover:underline">
                    En savoir plus →
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Block 2 - Espace Copropriétaire */}
            <Link href="/owner/login" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-xl hover:border-foreground/30 hover:-translate-y-1 cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted group-hover:bg-muted/80 transition-colors">
                    <Home className="h-8 w-8 text-foreground" />
                  </div>
                  <CardTitle className="text-xl">Espace Copropriétaire</CardTitle>
                  <CardDescription>
                    Accédez à vos informations, paiements et documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="text-sm font-medium text-foreground group-hover:underline">
                    Connexion / Inscription →
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Block 3 - Espace Gestionnaire */}
            <Link href="/manager/login" className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Espace Gestionnaire</CardTitle>
                  <CardDescription>
                    Gérez vos copropriétés, propriétaires et paiements
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Connexion / Inscription →
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Le Copropriétaire. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
