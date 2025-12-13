"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Home,
  Plus,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Eye
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gestionnaires
            </CardTitle>
            <Building2 className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.syndics ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Syndics sur la plateforme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Comptes actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Copropriétés
            </CardTitle>
            <Home className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.condominiums ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Immeubles gérés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Copropriétaires
            </CardTitle>
            <UserPlus className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.owners ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Propriétaires enregistrés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Syndics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-500" />
            Liste des Gestionnaires
          </CardTitle>
          <CardDescription>
            Tous les syndics enregistrés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syndics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun gestionnaire enregistré</p>
              <p className="text-sm mt-1">Cliquez sur &quot;Nouveau Gestionnaire&quot; pour en créer un</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Copropriétés</TableHead>
                  <TableHead className="text-center">Copropriétaires</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syndics.map((syndic) => (
                  <TableRow key={syndic.id}>
                    <TableCell className="font-medium">{syndic.name}</TableCell>
                    <TableCell className="text-muted-foreground">{syndic.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {syndic.condominiumsCount ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {syndic.ownersCount ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={syndic.status === 'active' ? 'default' : 'secondary'}
                        className={syndic.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                      >
                        {syndic.status === 'active' ? 'Actif' : syndic.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/platform/tenants/${syndic.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
