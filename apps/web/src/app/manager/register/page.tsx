"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building2, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength calculation
function calculatePasswordStrength(password: string): { score: number; checks: { label: string; passed: boolean }[] } {
  const checks = [
    { label: "Au moins 8 caractères", passed: password.length >= 8 },
    { label: "Une lettre minuscule", passed: /[a-z]/.test(password) },
    { label: "Une lettre majuscule", passed: /[A-Z]/.test(password) },
    { label: "Un chiffre", passed: /\d/.test(password) },
    { label: "Un caractère spécial", passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  
  const score = checks.filter(c => c.passed).length;
  return { score, checks };
}

function getStrengthColor(score: number): string {
  if (score <= 1) return "bg-destructive";
  if (score <= 2) return "bg-orange-500";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-primary/70";
  return "bg-primary";
}

function getStrengthLabel(score: number): string {
  if (score <= 1) return "Très faible";
  if (score <= 2) return "Faible";
  if (score <= 3) return "Moyen";
  if (score <= 4) return "Fort";
  return "Très fort";
}

export default function ManagerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password") || "";
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const handleNextStep = async () => {
    const isValid = await trigger(["firstName", "lastName", "email"]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: "manager",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const result = await response.json();
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      
      router.push("/app/pending");
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
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-primary/5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-primary/10 shadow-lg mb-8 border border-primary/20">
            <Building2 className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Le Copropriétaire
          </h1>
          <h2 className="text-xl font-medium text-primary">
            Espace Gestionnaire
          </h2>
          <p className="text-muted-foreground/70 mt-2 max-w-sm mx-auto">
            Créez votre compte pour gérer vos copropriétés
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-primary">Espace Gestionnaire</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Créer un compte
            </CardTitle>
            <CardDescription>
              Inscrivez-vous pour accéder à la plateforme
            </CardDescription>
            
            {/* Steps indicator */}
            <div className="flex items-center gap-2 pt-4">
              <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              Étape {step} sur 2 - {step === 1 ? 'Informations personnelles' : 'Sécurité du compte'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        Prénom
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        className="h-11"
                        {...register("firstName")}
                        disabled={isLoading}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Nom
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Dupont"
                        className="h-11"
                        {...register("lastName")}
                        disabled={isLoading}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Adresse email professionnelle
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@syndic.com"
                      className="h-11"
                      {...register("email")}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-11"
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 pr-10"
                        {...register("password")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {password && (
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                i <= passwordStrength.score
                                  ? getStrengthColor(passwordStrength.score)
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Force : <span className="font-medium">{getStrengthLabel(passwordStrength.score)}</span>
                        </p>
                        
                        {/* Password requirements */}
                        <div className="grid grid-cols-1 gap-1 pt-1">
                          {passwordStrength.checks.map((check, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-xs ${
                                check.passed ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              {check.passed ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {check.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 pr-10"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        <>
                          S&apos;inscrire
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <p className="text-center text-sm text-muted-foreground pt-2">
                Vous avez déjà un compte ?{" "}
                <Link 
                  href="/manager/login" 
                  className="font-medium text-primary hover:opacity-80"
                >
                  Se connecter
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
