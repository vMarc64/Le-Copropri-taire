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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, ArrowRight, Loader2, Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne doit contenir que des lettres"),
  lastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne doit contenir que des lettres"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide").optional().or(z.literal("")),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleNextStep = async () => {
    const isValid = await trigger(["firstName", "lastName", "email", "phone"]);
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
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          userType: "owner",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      router.push("/owner/login?registered=true");
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
            Créez votre compte pour accéder à vos informations
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Home className="h-6 w-6 text-foreground" />
              <span className="font-semibold text-foreground">Espace Copropriétaire</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Inscription
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Renseignez vos informations personnelles"
                : "Définissez votre mot de passe sécurisé"
              }
            </CardDescription>
            {/* Progress indicator */}
            <div className="flex gap-2 pt-2">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-foreground" : "bg-muted"}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-foreground" : "bg-muted"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        {...register("firstName")}
                        disabled={isLoading}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        placeholder="Dupont"
                        {...register("lastName")}
                        disabled={isLoading}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      {...register("email")}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01 23 45 67 89"
                      {...register("phone")}
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    type="button" 
                    className="w-full bg-foreground text-background hover:bg-foreground/90"
                    onClick={handleNextStep}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className={`flex items-center gap-2 text-xs transition-colors ${hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Min. 8 caractères
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${hasUppercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        1 majuscule
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        1 chiffre
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                        className="pr-10"
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

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Retour
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        "Créer mon compte"
                      )}
                    </Button>
                  </div>
                </>
              )}

              <p className="text-center text-sm text-muted-foreground pt-2">
                Vous avez déjà un compte ?{" "}
                <Link 
                  href="/owner/login" 
                  className="font-medium text-foreground hover:opacity-80"
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
