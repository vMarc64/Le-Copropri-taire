"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { getSyndic, createManager, deleteManager, type SyndicDetail, type Manager } from "@/lib/api";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  suspended: { label: "Suspendu", variant: "destructive" },
};

const roleLabels: Record<string, string> = {
  tenant_admin: "Administrateur",
  tenant_manager: "Gestionnaire",
};

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tenant, setTenant] = useState<SyndicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [managerForm, setManagerForm] = useState({ firstName: "", lastName: "", email: "" });
  const [addingManager, setAddingManager] = useState(false);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const data = await getSyndic(id);
      setTenant(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement du gestionnaire");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handleAddManager = async () => {
    if (!managerForm.firstName || !managerForm.lastName || !managerForm.email) return;
    
    try {
      setAddingManager(true);
      await createManager(id, {
        firstName: managerForm.firstName,
        lastName: managerForm.lastName,
        email: managerForm.email,
      });
      setAddManagerOpen(false);
      setManagerForm({ firstName: "", lastName: "", email: "" });
      await fetchTenant();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du manager");
    } finally {
      setAddingManager(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce manager ?")) return;
    
    try {
      await deleteManager(id, managerId);
      await fetchTenant();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du manager");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          {error || "Gestionnaire non trouvé"}
        </p>
        <Link href="/platform/tenants">
          <Button variant="outline">← Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/platform/tenants">
            <Button variant="ghost" size="sm">
              ← Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">
              Créé le {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={statusConfig[tenant.status]?.variant ?? "secondary"}>
            {statusConfig[tenant.status]?.label ?? tenant.status}
          </Badge>
          <Link href={`/platform/tenants/${id}/edit`}>
            <Button>✏️ Modifier</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.condominiums?.length ?? tenant.condominiumsCount ?? 0}</div>
            <p className="text-sm text-muted-foreground">Copropriétés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.ownersCount ?? 0}</div>
            <p className="text-sm text-muted-foreground">Copropriétaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.managers?.length ?? tenant.managersCount ?? 0}</div>
            <p className="text-sm text-muted-foreground">Managers</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{tenant.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condominiums */}
      <Card>
        <CardHeader>
          <CardTitle>Copropriétés gérées</CardTitle>
          <CardDescription>
            Liste des immeubles gérés par ce gestionnaire
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Ville</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!tenant.condominiums || tenant.condominiums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Aucune copropriété
                  </TableCell>
                </TableRow>
              ) : (
                tenant.condominiums.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell className="font-medium">{condo.name}</TableCell>
                    <TableCell>{condo.address}</TableCell>
                    <TableCell>{condo.city}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Managers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Managers</CardTitle>
              <CardDescription>
                Équipe de gestion de ce cabinet
              </CardDescription>
            </div>
            <Dialog open={addManagerOpen} onOpenChange={setAddManagerOpen}>
              <DialogTrigger asChild>
                <Button size="sm">➕ Ajouter un manager</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un manager</DialogTitle>
                  <DialogDescription>
                    Le manager recevra un email avec ses identifiants de connexion.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={managerForm.firstName}
                        onChange={(e) => setManagerForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={managerForm.lastName}
                        onChange={(e) => setManagerForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={managerForm.email}
                      onChange={(e) => setManagerForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>
                  <Button onClick={handleAddManager} disabled={addingManager} className="w-full">
                    {addingManager ? "Ajout en cours..." : "Ajouter"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!tenant.managers || tenant.managers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Aucun manager
                  </TableCell>
                </TableRow>
              ) : (
                tenant.managers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell className="font-medium">{manager.firstName} {manager.lastName}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[manager.role] || manager.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteManager(manager.id)}
                      >
                        🗑️
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
