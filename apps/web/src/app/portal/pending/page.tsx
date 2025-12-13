"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Clock, LogOut, Mail, Building } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PendingOwnerPage() {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-lg shadow-xl border-blue-500/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
            <Clock className="h-10 w-10 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Compte en attente d&apos;association
          </CardTitle>
          <CardDescription className="text-base">
            Votre compte copropriétaire a bien été créé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">En attente d&apos;association à une copropriété</p>
                <p className="text-sm text-muted-foreground">
                  Votre gestionnaire de copropriété doit vous associer à votre résidence pour que vous puissiez accéder à vos informations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Contactez votre syndic</p>
                <p className="text-sm text-muted-foreground">
                  Si vous n&apos;avez pas encore communiqué votre email à votre syndic, faites-le pour qu&apos;il puisse vous associer à votre lot.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Notification par email</p>
                <p className="text-sm text-muted-foreground">
                  Vous recevrez un email dès que votre compte sera activé.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Si vous pensez qu&apos;il y a une erreur ou pour toute question,{" "}
              <a href="mailto:support@lecopropritaire.fr" className="text-blue-500 hover:underline">
                contactez le support
              </a>
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
