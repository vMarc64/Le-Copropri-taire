"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Document {
  id: string;
  name: string;
  category: string;
  size: string;
  date: string;
  uploadedBy: string;
}

const categories: Record<string, { label: string; icon: string; color: string }> = {
  ag: { label: "Assemblée Générale", icon: "📋", color: "bg-blue-100 text-blue-800" },
  budget: { label: "Budget", icon: "💰", color: "bg-green-100 text-green-800" },
  contract: { label: "Contrat", icon: "📝", color: "bg-purple-100 text-purple-800" },
  legal: { label: "Juridique", icon: "⚖️", color: "bg-gray-100 text-gray-800" },
  insurance: { label: "Assurance", icon: "🛡️", color: "bg-yellow-100 text-yellow-800" },
  quote: { label: "Devis", icon: "📊", color: "bg-orange-100 text-orange-800" },
  invoice: { label: "Facture", icon: "🧾", color: "bg-red-100 text-red-800" },
  other: { label: "Autre", icon: "📁", color: "bg-gray-100 text-gray-800" },
};

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setDocuments([]);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des documents");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [condoId]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: documents.length,
    ag: documents.filter(d => d.category === "ag").length,
    invoices: documents.filter(d => d.category === "invoice").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/condominiums/${condoId}`}>
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">📁 Documents</h1>
            <p className="text-muted-foreground">
              Gérez les documents de la copropriété
            </p>
          </div>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>📤 Ajouter un document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
              <DialogDescription>
                Téléversez un nouveau document pour la copropriété
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Fichier *</Label>
                <Input id="file" type="file" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-name">Nom du document</Label>
                <Input id="doc-name" placeholder="Nom personnalisé (optionnel)" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, { label, icon }]) => (
                      <SelectItem key={key} value={key}>
                        {icon} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsUploadOpen(false)}>
                Téléverser
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.ag}</p>
            <p className="text-sm text-muted-foreground">PV d'AG</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.invoices}</p>
            <p className="text-sm text-muted-foreground">Factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{Object.keys(categories).length}</p>
            <p className="text-sm text-muted-foreground">Catégories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Rechercher un document..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(categories).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 ml-auto">
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("list")}
          >
            ☰
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            ▦
          </Button>
        </div>
      </div>

      {/* Documents */}
      {viewMode === "list" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Aucun document trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        📄 {doc.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={categories[doc.category]?.color}>
                        {categories[doc.category]?.icon} {categories[doc.category]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">👁️ Voir</Button>
                        <Button variant="ghost" size="sm">⬇️</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">🗑️</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredDocuments.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun document trouvé
              </CardContent>
            </Card>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-4xl mb-2">📄</span>
                    <p className="font-medium text-sm truncate w-full">{doc.name}</p>
                    <Badge className={`mt-2 ${categories[doc.category]?.color}`}>
                      {categories[doc.category]?.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{doc.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
