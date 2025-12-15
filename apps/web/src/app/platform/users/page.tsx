"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Link2, UserCheck, Users, Clock, Building2, Home } from "lucide-react";
import { getPendingUsers, getSyndics, associateUserToSyndic, PendingUser, Syndic } from "@/lib/api";

interface UserStats {
  pending: number;
  managers: number;
  owners: number;
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [syndics, setSyndics] = useState<Syndic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<UserStats>({ pending: 0, managers: 0, owners: 0 });
  const [page, setPage] = useState(1);
  const limit = 10;

  // Association modal
  const [associateModalOpen, setAssociateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [selectedSyndicId, setSelectedSyndicId] = useState<string>("");
  const [associating, setAssociating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setUsers(response.data);
      setTotal(response.total);
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error("Error fetching pending users:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  const fetchSyndics = useCallback(async () => {
    try {
      const response = await getSyndics({ limit: 100, status: "active" });
      setSyndics(response.data);
    } catch (error) {
      console.error("Error fetching syndics:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSyndics();
  }, [fetchUsers, fetchSyndics]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const openAssociateModal = (user: PendingUser) => {
    setSelectedUser(user);
    setSelectedSyndicId("");
    setAssociateModalOpen(true);
  };

  const handleAssociate = async () => {
    if (!selectedUser || !selectedSyndicId) return;

    try {
      setAssociating(true);
      await associateUserToSyndic(selectedUser.id, selectedSyndicId);
      setAssociateModalOpen(false);
      setSelectedUser(null);
      setSelectedSyndicId("");
      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error("Error associating user:", error);
      alert("Erreur lors de l'association. Veuillez réessayer.");
    } finally {
      setAssociating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "manager":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Gestionnaire</Badge>;
      case "owner":
        return <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">Copropriétaire</Badge>;
      case "platform_admin":
        return <Badge className="bg-violet-100 text-violet-700 border-violet-200">Admin Plateforme</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En attente</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Actif</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Suspendu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestion des utilisateurs</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Gérez les utilisateurs non associés à un syndic
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* En attente */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">En attente</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {stats.pending}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestionnaires */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Gestionnaires</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {stats.managers}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserCheck className="h-6 w-6 text-primary" />
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
                    {stats.owners}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Syndics disponibles */}
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-muted-foreground">Syndics disponibles</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {syndics.length}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Liste des utilisateurs</h2>
            <p className="text-[13px] text-muted-foreground mt-1">
              Associez les utilisateurs en attente à un syndic pour qu&apos;ils puissent accéder à la plateforme
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="platform_admin">Admins Plateforme</SelectItem>
              <SelectItem value="manager">Gestionnaires</SelectItem>
              <SelectItem value="owner">Copropriétaires</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <Users className="h-8 w-8 text-destructive" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-destructive">Erreur de chargement</p>
                <p className="mt-1 text-[13px] text-muted-foreground max-w-md">
                  {error}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => fetchUsers()}
                >
                  Réessayer
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">Aucun utilisateur trouvé</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {search || roleFilter !== "all" || statusFilter !== "all"
                    ? "Modifiez vos filtres pour voir plus de résultats"
                    : "Aucun utilisateur dans la plateforme"}
                </p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid min-w-[1000px] grid-cols-16 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Utilisateur
                  </div>
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rôle
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Statut
                  </div>
                  <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Syndic
                  </div>
                  <div className="col-span-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Copropriétés
                  </div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="grid min-w-[1000px] grid-cols-16 gap-4 px-6 py-4 transition-colors hover:bg-muted/50 group"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[14px] font-medium text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-[14px] text-muted-foreground truncate">{user.email}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="col-span-3 flex items-center">
                        {user.syndicName ? (
                          <span className="text-[13px] text-foreground truncate">{user.syndicName}</span>
                        ) : (
                          <span className="text-[13px] italic text-muted-foreground/60">Non associé</span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        {user.condominiums && user.condominiums.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Home className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[13px] text-foreground truncate">
                              {user.condominiums.length === 1 
                                ? user.condominiums[0].name 
                                : `${user.condominiums.length} copros`}
                            </span>
                          </div>
                        ) : user.role === 'owner' && user.tenantId ? (
                          <span className="text-[13px] italic text-amber-600">À assigner</span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground/60">—</span>
                        )}
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        {!user.tenantId && user.role !== 'platform_admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => openAssociateModal(user)}>
                                <Link2 className="h-4 w-4 mr-2" />
                                Associer à un syndic
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <p className="text-[13px] text-muted-foreground">
                      {(page - 1) * limit + 1} - {Math.min(page * limit, total)} sur {total} utilisateurs
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Association Modal */}
      <Dialog open={associateModalOpen} onOpenChange={setAssociateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associer l'utilisateur à un syndic</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Vous allez associer <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>{" "}
                  ({selectedUser.email}) à un syndic. L'utilisateur pourra ensuite accéder à la plateforme.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Sélectionner un syndic
            </label>
            <Select value={selectedSyndicId} onValueChange={setSelectedSyndicId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un syndic..." />
              </SelectTrigger>
              <SelectContent>
                {syndics.map((syndic) => (
                  <SelectItem key={syndic.id} value={syndic.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{syndic.name}</span>
                      {syndic.managersCount !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({syndic.managersCount} gestionnaires)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {syndics.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Aucun syndic disponible. Créez d'abord un syndic dans le tableau de bord.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssociateModalOpen(false)}
              disabled={associating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssociate}
              disabled={!selectedSyndicId || associating}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {associating ? "Association en cours..." : "Associer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
