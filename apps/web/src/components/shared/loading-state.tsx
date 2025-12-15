"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { container: "min-h-[200px]", icon: "h-6 w-6", text: "text-sm" },
  md: { container: "min-h-[300px]", icon: "h-8 w-8", text: "text-base" },
  lg: { container: "min-h-[400px]", icon: "h-10 w-10", text: "text-lg" },
};

export function LoadingState({
  message = "Chargement...",
  className,
  size = "md",
}: LoadingStateProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        config.container,
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-muted-foreground", config.icon)} />
      {message && (
        <p className={cn("text-muted-foreground", config.text)}>{message}</p>
      )}
    </div>
  );
}
