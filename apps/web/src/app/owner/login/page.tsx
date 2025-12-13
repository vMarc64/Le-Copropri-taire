"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function OwnerLoginPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const redirectUrl = searchParams.get('redirect');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Identifiants incorrects");
      }

      const result = await response.json();
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      
      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }
      
      const hasTenant = result.user?.tenantId;
      
      if (!hasTenant) {
        router.push("/portal/pending");
      } else {
        router.push("/portal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-muted/30">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-card shadow-lg mb-8 border border-border">
            <Home className="w-16 h-16 text-foreground" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Le Copropriétaire
          </h1>
          <h2 className="text-xl font-medium text-foreground">
            Espace Copropriétaire
          </h2>
          <p className="text-muted-foreground/70 mt-2 max-w-sm mx-auto">
            Accédez à vos informations, paiements et documents
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Home className="h-6 w-6 text-foreground" />
              <span className="font-semibold text-foreground">Espace Copropriétaire</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Connexion
            </CardTitle>
            <CardDescription>
              Accédez à votre espace copropriétaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="h-11"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm font-normal text-muted-foreground cursor-pointer"
                  >
                    Se souvenir de moi
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-foreground hover:opacity-80"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Vous n&apos;avez pas de compte ?{" "}
                <Link 
                  href="/owner/register" 
                  className="font-medium text-foreground hover:opacity-80"
                >
                  S&apos;inscrire
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
