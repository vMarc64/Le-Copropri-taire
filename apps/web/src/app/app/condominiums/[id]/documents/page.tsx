"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  FileText,
  Files,
  ClipboardList,
  Receipt,
  FolderOpen,
  Search,
  Upload,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Loader2,
  FileSpreadsheet,
  FileCheck,
  Scale,
  Shield,
  Wallet,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  category: string;
  size: string;
  date: string;
  uploadedBy: string;
}

const categories: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; bgColor: string; textColor: string }> = {
  ag: { label: "Assemblée Générale", icon: ClipboardList, bgColor: "bg-blue-100 dark:bg-blue-950", textColor: "text-blue-600 dark:text-blue-400" },
  budget: { label: "Budget", icon: Wallet, bgColor: "bg-green-100 dark:bg-green-950", textColor: "text-green-600 dark:text-green-400" },
  contract: { label: "Contrat", icon: FileCheck, bgColor: "bg-purple-100 dark:bg-purple-950", textColor: "text-purple-600 dark:text-purple-400" },
  legal: { label: "Juridique", icon: Scale, bgColor: "bg-gray-100 dark:bg-gray-800", textColor: "text-gray-600 dark:text-gray-400" },
  insurance: { label: "Assurance", icon: Shield, bgColor: "bg-yellow-100 dark:bg-yellow-950", textColor: "text-yellow-600 dark:text-yellow-400" },
  quote: { label: "Devis", icon: FileSpreadsheet, bgColor: "bg-orange-100 dark:bg-orange-950", textColor: "text-orange-600 dark:text-orange-400" },
  invoice: { label: "Facture", icon: Receipt, bgColor: "bg-red-100 dark:bg-red-950", textColor: "text-red-600 dark:text-red-400" },
  other: { label: "Autre", icon: FolderOpen, bgColor: "bg-gray-100 dark:bg-gray-800", textColor: "text-gray-600 dark:text-gray-400" },
};

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
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
    contracts: documents.filter(d => d.category === "contract").length,
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les documents de la copropriété
            </p>
          </div>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
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
                    {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </span>
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
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Files className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total documents</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <ClipboardList className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ag}</p>
              <p className="text-xs text-muted-foreground">PV d'AG</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <Receipt className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.invoices}</p>
              <p className="text-xs text-muted-foreground">Factures</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <FileCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.contracts}</p>
              <p className="text-xs text-muted-foreground">Contrats</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-medium">Nom</TableHead>
              <TableHead className="font-medium">Catégorie</TableHead>
              <TableHead className="font-medium">Taille</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucun document trouvé</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ajouter un document
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const category = categories[doc.category] || categories.other;
                const CategoryIcon = category.icon;
                
                return (
                  <TableRow
                    key={doc.id}
                    className="group border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded ${category.bgColor}`}>
                          <FileText className={`h-4 w-4 ${category.textColor}`} />
                        </div>
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${category.bgColor} ${category.textColor} border-0`}>
                        <CategoryIcon className="mr-1 h-3 w-3" />
                        {category.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.size}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.date}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
