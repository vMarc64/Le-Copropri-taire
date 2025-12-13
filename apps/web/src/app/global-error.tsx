"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
          <p className="text-gray-500">
            {error.message || "Quelque chose s'est mal passé"}
          </p>
          <Button onClick={reset}>Réessayer</Button>
        </div>
      </body>
    </html>
  );
}
