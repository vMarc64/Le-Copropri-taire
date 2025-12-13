"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  Search,
  FolderOpen,
  FileCheck,
  Receipt,
  Scale,
  PieChart,
  Shield,
  Loader2,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  description: string;
}

const categories = {
  all: { label: "Tous", icon: FolderOpen },
  ag: { label: "Assemblée Générale", icon: FileCheck },
  call: { label: "Appels de fonds", icon: Receipt },
  legal: { label: "Documents juridiques", icon: Scale },
  budget: { label: "Budget & Comptes", icon: PieChart },
  insurance: { label: "Assurances", icon: Shield },
};

export default function PortalDocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
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
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (category: string) => {
    if (category === "all") return documents.length;
    return documents.filter(d => d.category === category).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Mes documents
        </h1>
        <p className="text-muted-foreground">
          Accédez à tous les documents de votre copropriété
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
          <Card 
            key={key} 
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${categoryFilter === key ? "border-primary bg-primary/5" : ""}`}
            onClick={() => setCategoryFilter(key)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${categoryFilter === key ? "bg-primary/20" : "bg-muted"}`}>
                  <Icon className={`h-4 w-4 ${categoryFilter === key ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{getCategoryCount(key)}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un document..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents disponibles</CardTitle>
          <CardDescription>
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? "s" : ""} trouvé{filteredDocuments.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Taille</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun document trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => {
                  const CategoryIcon = categories[doc.category as keyof typeof categories]?.icon || FileText;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="rounded bg-muted p-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground hidden sm:block">{doc.description}</p>
                            <div className="flex items-center gap-2 sm:hidden mt-1">
                              <Badge variant="outline" className="text-xs">
                                {categories[doc.category as keyof typeof categories]?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{doc.date}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="gap-1">
                          <CategoryIcon className="h-3 w-3" />
                          {categories[doc.category as keyof typeof categories]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {doc.date}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {doc.size}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Voir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Télécharger">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Access Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Documents récents par catégorie</CardTitle>
          <CardDescription>Accès rapide aux derniers documents ajoutés</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ag">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ag">AG</TabsTrigger>
              <TabsTrigger value="call">Appels</TabsTrigger>
              <TabsTrigger value="legal">Juridique</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="insurance">Assurance</TabsTrigger>
            </TabsList>
            {Object.keys(categories).filter(k => k !== "all").map((category) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="space-y-2">
                  {documents
                    .filter(d => d.category === category)
                    .slice(0, 3)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.date} • {doc.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Télécharger
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
