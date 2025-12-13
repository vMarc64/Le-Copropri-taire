"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Upload,
  FolderOpen,
  File,
  FileSpreadsheet,
  FileImage,
  Download,
  MoreHorizontal,
  Calendar,
  Building2,
  Eye,
  Trash2,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDocuments, type Document } from "@/lib/api";

const documentTypes = [
  { value: "all", label: "Tous les types" },
  { value: "ag_report", label: "PV d'AG" },
  { value: "budget", label: "Budget" },
  { value: "invoice", label: "Facture" },
  { value: "contract", label: "Contrat" },
  { value: "legal", label: "Document légal" },
  { value: "other", label: "Autre" },
];

const categories = [
  { value: "all", label: "Toutes les catégories" },
  { value: "legal", label: "Juridique" },
  { value: "finances", label: "Finances" },
  { value: "contrats", label: "Contrats" },
  { value: "travaux", label: "Travaux" },
  { value: "energie", label: "Énergie" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("image")) return FileImage;
  return File;
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    ag_report: { label: "PV AG", className: "bg-primary/10 text-primary" },
    budget: { label: "Budget", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    invoice: { label: "Facture", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    contract: { label: "Contrat", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    legal: { label: "Légal", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    other: { label: "Autre", className: "bg-muted text-muted-foreground" },
  };

  const { label, className } = config[type] || config.other;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  const config: Record<string, { label: string; className: string }> = {
    managers: { label: "Gestionnaires", className: "bg-muted text-muted-foreground" },
    owners: { label: "Propriétaires", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    tenants: { label: "Locataires", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    all: { label: "Tous", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  };

  const { label, className } = config[visibility] || config.managers;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondominium, setSelectedCondominium] = useState("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getDocuments();
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des documents");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extract unique condominiums from documents
  const condominiums = useMemo(() => [
    { value: "all", label: "Toutes les résidences" },
    ...Array.from(new Map(documents.map(d => [d.condominiumId, { value: d.condominiumId, label: d.condominiumName }])).values()),
  ], [documents]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesCondominium = selectedCondominium === "all" || doc.condominiumId === selectedCondominium;
    return matchesSearch && matchesType && matchesCategory && matchesCondominium;
  });

  const stats = {
    total: documents.length,
    thisMonth: documents.filter((d) => new Date(d.createdAt).getMonth() === new Date().getMonth()).length,
    totalSize: documents.reduce((sum, d) => sum + d.fileSize, 0),
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Documents
            </h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Gérez et partagez les documents de vos copropriétés
            </p>
          </div>
          <Button className="h-10 gap-2 rounded-lg px-4 text-[13px] font-medium">
            <Upload className="h-4 w-4" />
            Ajouter un document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                  <p className="text-[13px] text-muted-foreground">Documents totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.thisMonth}</p>
                  <p className="text-[13px] text-muted-foreground">Ajoutés ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-[13px] text-muted-foreground">Espace utilisé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 rounded-lg"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px] h-10 rounded-lg">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px] h-10 rounded-lg">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCondominium} onValueChange={setSelectedCondominium}>
            <SelectTrigger className="w-[220px] h-10 rounded-lg">
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Résidence" />
            </SelectTrigger>
            <SelectContent>
              {condominiums.map((condo) => (
                <SelectItem key={condo.value} value={condo.value}>{condo.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid min-w-[800px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
              <div className="col-span-5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Document
              </div>
              <div className="col-span-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </div>
              <div className="col-span-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Copropriété
              </div>
              <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Visibilité
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
              {filteredDocuments.map((doc) => {
                const FileIcon = getFileIcon(doc.mimeType);
                
                return (
                  <div
                    key={doc.id}
                    className="grid min-w-[800px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-foreground">
                          {doc.name}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <TypeBadge type={doc.type} />
                    </div>

                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{doc.condominiumName}</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <VisibilityBadge visibility={doc.visibility} />
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            Aperçu
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-[15px] font-medium text-foreground">Aucun document trouvé</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Essayez de modifier vos filtres ou ajoutez un nouveau document
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
