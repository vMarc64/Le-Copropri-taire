"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get params from URL
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const condominiumId = searchParams.get("condominium_id");

    if (success === "true") {
      // Success case - connection was saved by the backend
      setStatus("success");
      setMessage("Votre compte bancaire a été connecté avec succès !");
      
      const redirectTo = condominiumId 
        ? `/app/condominiums/${condominiumId}/bank?success=true`
        : "/app?success=true";
      setRedirectUrl(redirectTo);

      // Notify parent window if in iframe
      if (window.parent !== window) {
        window.parent.postMessage({
          type: "powens-callback",
          status: "success",
          condominiumId,
        }, "*");
      }

      // Auto redirect after 2 seconds
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
      
    } else if (error) {
      // Error case
      setStatus("error");
      setMessage(errorDescription || error || "Une erreur est survenue");
      
      // Notify parent window if in iframe
      if (window.parent !== window) {
        window.parent.postMessage({
          type: "powens-callback",
          status: "error",
          error,
        }, "*");
      }
    } else {
      // No status yet, might be initial load
      setStatus("loading");
      setMessage("Traitement de la connexion...");
      
      // If no params after 3 seconds, show error
      setTimeout(() => {
        if (status === "loading") {
          setStatus("error");
          setMessage("Aucune donnée de callback reçue");
        }
      }, 3000);
    }
  }, [searchParams, router, status]);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        {status === "loading" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Connexion en cours...</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Connexion réussie !</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirection automatique...
            </p>
            {redirectUrl && (
              <Button onClick={() => router.push(redirectUrl)} className="mt-4">
                Continuer maintenant
              </Button>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Erreur de connexion</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/app")}
              className="mt-4"
            >
              Retour au tableau de bord
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PowensCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              <h2 className="text-xl font-semibold">Chargement...</h2>
            </div>
          </CardContent>
        </Card>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
