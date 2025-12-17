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
import { ArrowRight, Loader2, Eye, EyeOff, Check, X, ArrowLeft, LucideIcon } from "lucide-react";

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
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  userType: "owner" | "manager";
  icon: LucideIcon;
  title: string;
  emailPlaceholder?: string;
  emailLabel?: string;
  redirectAfterRegister: string;
  loginUrl: string;
  iconColorClass?: string;
  titleColorClass?: string;
  buttonClass?: string;
  progressBarColorClass?: string;
  linkColorClass?: string;
}

export function RegisterForm({
  userType,
  icon: Icon,
  title,
  emailPlaceholder = "vous@exemple.com",
  emailLabel = "Adresse email *",
  redirectAfterRegister,
  loginUrl,
  iconColorClass = "text-foreground",
  titleColorClass = "text-foreground",
  buttonClass = "bg-foreground text-background hover:bg-foreground/90",
  progressBarColorClass = "bg-foreground",
  linkColorClass = "text-foreground",
}: RegisterFormProps) {
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
    mode: "all",
  });

  const password = watch("password", "");
  
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

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
          userType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const result = await response.json();
      
      if (userType === "manager") {
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      
      router.push(redirectAfterRegister);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const isManager = userType === "manager";

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
          <span className={`font-semibold ${titleColorClass}`}>{title}</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isManager ? "Créer un compte" : "Inscription"}
        </CardTitle>
        <CardDescription>
          {step === 1 
            ? (isManager ? "Inscrivez-vous pour accéder à la plateforme" : "Renseignez vos informations personnelles")
            : (isManager ? "Sécurité du compte" : "Définissez votre mot de passe sécurisé")
          }
        </CardDescription>
        {/* Progress indicator */}
        <div className="flex gap-2 pt-2">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? progressBarColorClass : "bg-muted"}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? progressBarColorClass : "bg-muted"}`} />
        </div>
        {isManager && (
          <p className="text-xs text-muted-foreground">
            Étape {step} sur 2 - {step === 1 ? 'Informations personnelles' : 'Sécurité du compte'}
          </p>
        )}
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
                  <Label htmlFor="firstName" className="text-sm font-medium">Prénom *</Label>
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
                  <Label htmlFor="lastName" className="text-sm font-medium">Nom *</Label>
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
                <Label htmlFor="email" className="text-sm font-medium">{emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={emailPlaceholder}
                  className="h-11"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01 23 45 67 89"
                  className="h-11"
                  {...register("phone")}
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="button" 
                className={`w-full h-11 ${buttonClass}`}
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
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe *</Label>
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
                  <div className={`flex items-center gap-2 text-xs transition-colors ${hasSpecialChar ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    1 caractère spécial (!@#$%...)
                  </div>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe *</Label>
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

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  {isManager && <ArrowLeft className="mr-2 h-4 w-4" />}
                  Retour
                </Button>
                <Button 
                  type="submit" 
                  className={`flex-1 h-11 ${buttonClass}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : isManager ? (
                    <>
                      S&apos;inscrire
                      <ArrowRight className="ml-2 h-4 w-4" />
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
              href={loginUrl} 
              className={`font-medium ${linkColorClass} hover:opacity-80`}
            >
              Se connecter
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
