"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Users, UserCheck, Home, ArrowLeft, Pencil, Plus, Trash2, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  getSyndic,
  createManager,
  deleteManager,
  type SyndicDetail,
} from "@/lib/api";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  active: { label: "Actif", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  invited: { label: "Invité", variant: "secondary" },
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
    if (!managerForm.firstName || !managerForm.lastName || !managerForm.email)
      return;

    try {
      setAddingManager(true);
      await createManager(id, {
        firstName: managerForm.firstName,
        lastName: managerForm.lastName,
        email: managerForm.email,
      });
      setAddManagerOpen(false);
      setManagerForm({ firstName: "", lastName: "", email: "" });
      toast.success("Manager ajouté avec succès", {
        description: `${managerForm.firstName} ${managerForm.lastName} recevra un email avec ses identifiants.`,
      });
      await fetchTenant();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout du manager", {
        description: "Veuillez réessayer ultérieurement.",
      });
    } finally {
      setAddingManager(false);
    }
  };

  const handleDeleteManager = async (managerId: string, managerName: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce manager ?")) return;

    try {
      await deleteManager(id, managerId);
      toast.success("Manager supprimé", {
        description: `${managerName} n'a plus accès au compte.`,
      });
      await fetchTenant();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression", {
        description: "Veuillez réessayer ultérieurement.",
      });
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
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/platform">Platform</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/platform/tenants">Syndics</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{tenant.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/platform/tenants">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{tenant.name}</h1>
              <p className="text-[13px] text-muted-foreground">
                Créé le {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline"
            className={
              tenant.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : tenant.status === 'suspended'
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }
          >
            {statusConfig[tenant.status]?.label ?? tenant.status}
          </Badge>
          <Link href={`/platform/tenants/${id}/edit`}>
            <Button className="gap-2">
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Copropriétés */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Copropriétés</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {tenant.condominiums?.length ?? tenant.condominiumsCount ?? 0}
                  </span>
                </div>
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
                    {tenant.ownersCount ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managers */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Managers</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {tenant.managers?.length ?? tenant.managersCount ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Coordonnées</h2>
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-[14px] font-medium text-foreground">{tenant.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condominiums */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Copropriétés gérées</h2>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            {!tenant.condominiums || tenant.condominiums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Home className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">Aucune copropriété</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Ce gestionnaire n&apos;a pas encore de copropriétés</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid min-w-[600px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                  <div className="col-span-4 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nom
                  </div>
                  <div className="col-span-5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Adresse
                  </div>
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ville
                  </div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {tenant.condominiums.map((condo) => (
                    <div
                      key={condo.id}
                      className="grid min-w-[600px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                          <Home className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-[14px] font-medium text-foreground truncate">{condo.name}</span>
                      </div>
                      <div className="col-span-5 flex items-center">
                        <span className="text-[14px] text-muted-foreground truncate">{condo.address}</span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-[14px] text-muted-foreground truncate">{condo.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Managers */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Managers</h2>
          <Dialog open={addManagerOpen} onOpenChange={setAddManagerOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un manager
              </Button>
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

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            {!tenant.managers || tenant.managers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <UserCheck className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">Aucun manager</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Ajoutez un manager pour gérer ce compte</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid min-w-[800px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nom
                  </div>
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Statut
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rôle
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Créé le
                  </div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {tenant.managers.map((manager) => (
                    <div
                      key={manager.id}
                      className="grid min-w-[800px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50 group"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[14px] font-medium text-foreground truncate">
                          {manager.firstName} {manager.lastName}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-[14px] text-muted-foreground truncate">{manager.email}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Badge 
                          variant="outline"
                          className={
                            manager.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : manager.status === 'invited'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }
                        >
                          {statusConfig[manager.status]?.label ?? manager.status}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <Badge variant="outline">
                          {roleLabels[manager.role] || manager.role}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-[13px] text-muted-foreground">
                          {new Date(manager.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDeleteManager(
                              manager.id,
                              `${manager.firstName} ${manager.lastName}`
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
