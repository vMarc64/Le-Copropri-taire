"use client";

import Link from "next/link";
import { useState } from "react";
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

// Mock data
const documents = [
  { id: "1", name: "PV AG 2025.pdf", category: "ag", date: "15/06/2025", size: "2.4 MB" },
  { id: "2", name: "PV AG 2024.pdf", category: "ag", date: "12/06/2024", size: "2.1 MB" },
  { id: "3", name: "Appel de fonds T4 2025.pdf", category: "call", date: "01/12/2025", size: "156 KB" },
  { id: "4", name: "Appel de fonds T3 2025.pdf", category: "call", date: "01/09/2025", size: "152 KB" },
  { id: "5", name: "Appel de fonds T2 2025.pdf", category: "call", date: "01/06/2025", size: "148 KB" },
  { id: "6", name: "Règlement de copropriété.pdf", category: "legal", date: "15/03/2020", size: "5.2 MB" },
  { id: "7", name: "Budget prévisionnel 2025.pdf", category: "budget", date: "01/01/2025", size: "320 KB" },
  { id: "8", name: "Attestation assurance 2025.pdf", category: "insurance", date: "01/01/2025", size: "180 KB" },
];

const categories: Record<string, { label: string; icon: string }> = {
  ag: { label: "Assemblée Générale", icon: "📋" },
  call: { label: "Appel de fonds", icon: "💰" },
  legal: { label: "Documents juridiques", icon: "⚖️" },
  budget: { label: "Budget", icon: "📊" },
  insurance: { label: "Assurance", icon: "🛡️" },
};

const ownerInfo = {
  name: "M. Jean Dupont",
};

export default function PortalDocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal" className="flex items-center gap-2">
              <span className="text-xl font-bold">🏠 Le Copropriétaire</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/portal">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/portal/payments">
              <Button variant="ghost" size="sm">Paiements</Button>
            </Link>
            <Link href="/portal/documents">
              <Button variant="default" size="sm">Documents</Button>
            </Link>
            <Link href="/portal/sepa">
              <Button variant="ghost" size="sm">Mandat SEPA</Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground">{ownerInfo.name}</span>
            <Link href="/login">
              <Button variant="outline" size="sm">Déconnexion</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">📁 Mes documents</h1>
            <p className="text-muted-foreground">
              Documents de la copropriété mis à votre disposition
            </p>
          </div>

          {/* Stats by Category */}
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(categories).map(([key, { label, icon }]) => {
              const count = documents.filter(d => d.category === key).length;
              return (
                <Card key={key} className="cursor-pointer hover:bg-muted/50" onClick={() => setCategoryFilter(key)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                      <span className="text-2xl">{icon}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-4">
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
          </div>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documents disponibles</CardTitle>
              <CardDescription>{filteredDocuments.length} document(s)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          📄 {doc.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categories[doc.category]?.icon} {categories[doc.category]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">👁️ Voir</Button>
                          <Button variant="ghost" size="sm">⬇️ Télécharger</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Le Copropriétaire. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
