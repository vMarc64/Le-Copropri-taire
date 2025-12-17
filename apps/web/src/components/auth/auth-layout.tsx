"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, LucideIcon } from "lucide-react";

export interface AuthLayoutProps {
  children: React.ReactNode;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColorClass?: string;
  titleColorClass?: string;
  sidebarGradientFrom?: string;
  sidebarGradientTo?: string;
}

export function AuthLayout({
  children,
  icon: Icon,
  title,
  subtitle,
  iconColorClass = "text-foreground",
  titleColorClass = "text-foreground",
  sidebarGradientFrom = "from-blue-500",
  sidebarGradientTo = "to-indigo-600",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Back button */}
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </Link>

      {/* Left side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br ${sidebarGradientFrom} ${sidebarGradientTo}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl shadow-lg mb-8 border bg-white/10 border-white/20">
            <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Le Copropriétaire
          </h1>
          <h2 className="text-xl font-medium text-white/90">
            {title}
          </h2>
          <p className="text-white/70 mt-2 max-w-sm mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        {children}
      </div>
    </div>
  );
}
