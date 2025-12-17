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
import { ArrowRight, Loader2, Eye, EyeOff, LucideIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  userType: "owner" | "manager";
  icon: LucideIcon;
  title: string;
  description: string;
  registerUrl: string;
  redirectAfterLogin: string;
  pendingRedirectUrl: string;
  iconColorClass?: string;
  titleColorClass?: string;
  buttonClass?: string;
  linkColorClass?: string;
}

export function LoginForm({
  userType,
  icon: Icon,
  title,
  description,
  registerUrl,
  redirectAfterLogin,
  pendingRedirectUrl,
  iconColorClass = "text-foreground",
  titleColorClass = "text-foreground",
  buttonClass = "bg-foreground text-background hover:bg-foreground/90",
  linkColorClass = "text-foreground",
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const redirectUrl = searchParams.get('redirect');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        body: JSON.stringify({ ...data, rememberMe, loginContext: userType }),
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
      const role = result.user?.role;
      
      // Platform admin goes to platform (manager only)
      if (userType === "manager" && role === 'platform_admin') {
        router.push("/platform");
        return;
      }
      
      if (!hasTenant) {
        router.push(pendingRedirectUrl);
      } else {
        router.push(redirectAfterLogin);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
          <span className={`font-semibold ${titleColorClass}`}>{title}</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Connexion
        </CardTitle>
        <CardDescription>
          {description}
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
              className={`text-sm ${linkColorClass} hover:opacity-80`}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button 
            type="submit" 
            className={`w-full h-11 ${buttonClass}`}
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
              href={registerUrl} 
              className={`font-medium ${linkColorClass} hover:opacity-80`}
            >
              S&apos;inscrire
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
