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
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window.parent !== window;
    setIsInIframe(inIframe);

    // Get params from URL
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const condominiumId = searchParams.get("condominium_id");

    if (success === "true") {
      // Success case - connection was saved by the backend
      setStatus("success");
      setMessage("Votre compte bancaire a été connecté avec succès !");

      // Notify parent window if in iframe - parent will close modal and refresh
      if (inIframe) {
        window.parent.postMessage({
          type: "powens-callback",
          status: "success",
          condominiumId,
        }, "*");
        // Don't redirect - parent will handle it
        return;
      }

      // Only redirect if NOT in iframe (direct access)
      const redirectTo = condominiumId 
        ? `/app/condominiums/${condominiumId}/bank?success=true`
        : "/app?success=true";
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
      
    } else if (error) {
      // Error case
      setStatus("error");
      setMessage(errorDescription || error || "Une erreur est survenue");
      
      // Notify parent window if in iframe
      if (inIframe) {
        window.parent.postMessage({
          type: "powens-callback",
          status: "error",
          error,
          errorDescription,
        }, "*");
      }
    } else {
      // No status yet, might be initial load
      setStatus("loading");
      setMessage("Traitement de la connexion...");
      
      // If no params after 5 seconds, show error
      const timeout = setTimeout(() => {
        setStatus("error");
        setMessage("Aucune donnée de callback reçue");
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  // If in iframe and success, show minimal UI (parent will close)
  if (isInIframe && status === "success") {
    return (
      <div className="text-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Compte connecté !</h2>
        <p className="text-sm text-muted-foreground">Fermeture en cours...</p>
      </div>
    );
  }

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
