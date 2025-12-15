"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared";
import {
  FileText,
  Download,
  Search,
  FolderOpen,
  File,
  FileBarChart,
  Gavel,
  Receipt,
  Clock,
  Calendar,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  uploadedAt: string;
  url: string;
  condominiumId: string;
}

type CategoryKey = "all" | "legal" | "financial" | "meeting" | "work" | "other";

const categories: { key: CategoryKey; label: string; icon: typeof FileText }[] = [
  { key: "all", label: "Tous", icon: FolderOpen },
  { key: "legal", label: "Juridique", icon: Gavel },
  { key: "financial", label: "Financier", icon: FileBarChart },
  { key: "meeting", label: "Assemblées", icon: File },
  { key: "work", label: "Travaux", icon: Receipt },
  { key: "other", label: "Autres", icon: FileText },
];

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  pdf: { label: "PDF", icon: FileText, color: "text-red-500" },
  doc: { label: "Word", icon: FileText, color: "text-blue-500" },
  docx: { label: "Word", icon: FileText, color: "text-blue-500" },
  xls: { label: "Excel", icon: FileBarChart, color: "text-green-500" },
  xlsx: { label: "Excel", icon: FileBarChart, color: "text-green-500" },
  jpg: { label: "Image", icon: File, color: "text-purple-500" },
  png: { label: "Image", icon: File, color: "text-purple-500" },
};

const categoryLabels: Record<string, string> = {
  legal: "Juridique",
  financial: "Financier",
  meeting: "Assemblée générale",
  work: "Travaux",
  other: "Autre",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/portal/documents");
      
      if (!response.ok) {
        throw new Error("Impossible de charger les documents");
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by year
  const documentsByYear = filteredDocuments.reduce((acc, doc) => {
    const year = new Date(doc.uploadedAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(doc);
    return acc;
  }, {} as Record<number, Document[]>);

  const sortedYears = Object.keys(documentsByYear).map(Number).sort((a, b) => b - a);

  // Stats
  const stats = {
    total: documents.length,
    byCategory: categories.slice(1).map(cat => ({
      ...cat,
      count: documents.filter(d => d.category === cat.key).length
    }))
  };

  const handleDownload = (doc: Document) => {
    // TODO: Implement actual download
    window.open(doc.url, "_blank");
  };

  const handleView = (doc: Document) => {
    // TODO: Implement viewer
    window.open(doc.url, "_blank");
  };

  if (loading) {
    return <LoadingState message="Chargement de vos documents..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDocuments} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mes documents</h1>
        <p className="text-muted-foreground mt-1">
          Accédez à tous les documents de votre copropriété
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {stats.byCategory.map(({ key, label, icon: Icon, count }) => (
          <Card key={key} className={cn(
            "cursor-pointer transition-colors hover:bg-muted/50",
            selectedCategory === key && "border-primary"
          )}
          onClick={() => setSelectedCategory(key as CategoryKey)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryKey)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun document"
              description={search ? "Aucun document ne correspond à votre recherche" : "Aucun document dans cette catégorie"}
            />
          ) : (
            <div className="space-y-6">
              {sortedYears.map(year => (
                <Card key={year}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      {year}
                    </CardTitle>
                    <CardDescription>
                      {documentsByYear[year].length} document{documentsByYear[year].length > 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documentsByYear[year].map((doc) => {
                        const ext = doc.name.split(".").pop()?.toLowerCase() || "";
                        const type = typeConfig[ext] || { label: ext.toUpperCase(), icon: File, color: "text-gray-500" };
                        const TypeIcon = type.icon;

                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg bg-muted", type.color)}>
                                <TypeIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="secondary" className="text-xs">
                                    {categoryLabels[doc.category] || doc.category}
                                  </Badge>
                                  <span>•</span>
                                  <span>{formatFileSize(doc.size)}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(doc)}
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(doc)}
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
