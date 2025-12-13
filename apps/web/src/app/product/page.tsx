"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Sparkles, Building2, CreditCard, FileText, PieChart, Shield } from "lucide-react";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 pt-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-500/10 mb-8">
          <Sparkles className="w-10 h-10 text-violet-500" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-4">
          Le Copropriétaire
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">
          La plateforme moderne de gestion de copropriété qui simplifie la vie des gestionnaires et des copropriétaires
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/manager/register">
            <Button size="lg" className="gap-2">
              <Building2 className="h-5 w-5" />
              Je suis Gestionnaire
            </Button>
          </Link>
          <Link href="/owner/register">
            <Button size="lg" variant="outline" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Je suis Copropriétaire
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CreditCard className="h-8 w-8 text-primary" />}
              title="Paiements simplifiés"
              description="Gérez les appels de fonds et suivez les paiements en temps réel"
            />
            <FeatureCard
              icon={<PieChart className="h-8 w-8 text-primary" />}
              title="Suivi bancaire"
              description="Synchronisation bancaire automatique pour une comptabilité précise"
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-primary" />}
              title="Documents centralisés"
              description="Tous vos documents accessibles en un clic depuis le portail"
            />
            <FeatureCard
              icon={<Building2 className="h-8 w-8 text-primary" />}
              title="Multi-copropriétés"
              description="Gérez plusieurs immeubles depuis une seule interface"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Sécurité maximale"
              description="Données chiffrées et conformité RGPD garantie"
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="Interface moderne"
              description="Une expérience utilisateur pensée pour le quotidien"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez les professionnels qui font confiance à notre plateforme
          </p>
          <Link href="/manager/register">
            <Button size="lg">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Le Copropriétaire. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Mentions légales</Link>
            <Link href="#" className="hover:text-foreground">Confidentialité</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-background border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
