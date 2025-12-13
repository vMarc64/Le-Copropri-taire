"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Search, MoreVertical, Link2, UserCheck, Users, Clock, Building2 } from "lucide-react";
import { getPendingUsers, getSyndics, associateUserToSyndic, PendingUser, Syndic } from "@/lib/api";

// Format date without date-fns
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [syndics, setSyndics] = useState<Syndic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
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
      const response = await getPendingUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });
      setUsers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs en attente</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les utilisateurs qui attendent d'être associés à un syndic
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-violet-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600">{total}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {users.filter(u => u.role === "manager").length}
                </p>
                <p className="text-sm text-muted-foreground">Gestionnaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <Users className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-600">
                  {users.filter(u => u.role === "owner").length}
                </p>
                <p className="text-sm text-muted-foreground">Copropriétaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{syndics.length}</p>
                <p className="text-sm text-muted-foreground">Syndics disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Associez les utilisateurs en attente à un syndic pour qu'ils puissent accéder à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="manager">Gestionnaires</SelectItem>
                <SelectItem value="owner">Copropriétaires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Aucun utilisateur en attente</p>
              <p className="text-sm">
                {search || roleFilter !== "all"
                  ? "Modifiez vos filtres pour voir plus de résultats"
                  : "Tous les utilisateurs ont été associés à un syndic"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

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
