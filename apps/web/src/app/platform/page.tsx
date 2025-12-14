"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Home,
  Plus,
  Loader2,
  RefreshCw,
  Eye,
  TrendingUp
} from "lucide-react";
import { 
  getPlatformStats, 
  getSyndics, 
  createSyndic,
  type PlatformStats, 
  type Syndic 
} from "@/lib/api";
import Link from "next/link";

export default function PlatformDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [syndics, setSyndics] = useState<Syndic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    siret: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, syndicsData] = await Promise.all([
        getPlatformStats(),
        getSyndics({ limit: 50 }),
      ]);
      setStats(statsData);
      setSyndics(syndicsData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSyndic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setIsCreating(true);
      await createSyndic({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        siret: formData.siret || undefined,
      });
      
      // Reset form and close modal
      setFormData({ name: "", email: "", phone: "", address: "", siret: "" });
      setIsModalOpen(false);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Error creating syndic:", err);
      setError("Erreur lors de la création du gestionnaire");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Gestionnaire
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un Gestionnaire</DialogTitle>
                <DialogDescription>
                  Créez un nouveau syndic/gestionnaire sur la plateforme
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSyndic}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du syndic *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Syndic Immobilier Paris"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@syndic.fr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        placeholder="01 23 45 67 89"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siret">SIRET</Label>
                      <Input
                        id="siret"
                        placeholder="123 456 789 00012"
                        value={formData.siret}
                        onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      placeholder="123 rue de la Paix, 75001 Paris"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled={isCreating || !formData.name || !formData.email}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer le gestionnaire"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gestionnaires */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Gestionnaires</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {stats?.syndics ?? 0}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">Syndics sur la plateforme</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilisateurs */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Utilisateurs</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {stats?.users ?? 0}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">Comptes actifs</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copropriétés */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Copropriétés</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {stats?.condominiums ?? 0}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">Immeubles gérés</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Home className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copropriétaires */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Copropriétaires</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {stats?.owners ?? 0}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">Propriétaires enregistrés</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                <UserPlus className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Syndics List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Liste des Gestionnaires
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1">Tous les syndics enregistrés sur la plateforme</p>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            {syndics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">Aucun gestionnaire enregistré</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Cliquez sur &quot;Nouveau Gestionnaire&quot; pour en créer un</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid min-w-[700px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nom
                  </div>
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Copropriétés
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Copropriétaires
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Statut
                  </div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {syndics.map((syndic) => (
                    <Link
                      key={syndic.id}
                      href={`/platform/tenants/${syndic.id}`}
                      className="grid min-w-[700px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[14px] font-medium text-foreground truncate">{syndic.name}</span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-[14px] text-muted-foreground truncate">{syndic.email}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-secondary px-2.5 text-[13px] font-medium text-secondary-foreground">
                          {syndic.condominiumsCount ?? 0}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-secondary px-2.5 text-[13px] font-medium text-secondary-foreground">
                          {syndic.ownersCount ?? 0}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Badge 
                          variant="outline"
                          className={syndic.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : 'bg-secondary text-secondary-foreground'}
                        >
                          {syndic.status === 'active' ? 'Actif' : syndic.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
