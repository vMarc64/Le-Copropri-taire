"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  FileText, 
  Download, 
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";

export interface Document {
  id: string;
  name: string;
  type: "invoice" | "ag" | "quote" | "contract" | "report" | "other";
  date: string;
  size?: string;
  mimeType?: string;
  url?: string;
}

interface DocumentListProps {
  documents: Document[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  maxItems?: number;
  variant?: "table" | "cards" | "compact";
  showActions?: boolean;
  onView?: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  className?: string;
}

const typeConfig = {
  invoice: { label: "Facture", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  ag: { label: "AG", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  quote: { label: "Devis", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  contract: { label: "Contrat", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  report: { label: "Rapport", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  other: { label: "Autre", className: "bg-muted text-muted-foreground" },
};

function getFileIcon(mimeType?: string) {
  if (!mimeType) return File;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("image")) return FileImage;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  return FileText;
}

export function DocumentList({
  documents,
  title = "Documents",
  showViewAll = false,
  viewAllHref = "/documents",
  maxItems,
  variant = "table",
  showActions = true,
  onView,
  onDownload,
  className,
}: DocumentListProps) {
  const displayedDocuments = maxItems ? documents.slice(0, maxItems) : documents;

  if (documents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucun document</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedDocuments.map((doc) => {
            const FileIcon = getFileIcon(doc.mimeType);
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {doc.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(doc.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (variant === "cards") {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {displayedDocuments.map((doc) => {
            const type = typeConfig[doc.type];
            const FileIcon = getFileIcon(doc.mimeType);
            return (
              <div
                key={doc.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-xs", type.className)}>
                      {type.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                {showActions && (
                  <div className="flex gap-1">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onDownload && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={viewAllHref}>
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Mobile view */}
        <div className="space-y-3 md:hidden">
          {displayedDocuments.map((doc) => {
            const type = typeConfig[doc.type];
            const FileIcon = getFileIcon(doc.mimeType);
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[180px]">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <Badge className={cn("text-xs", type.className)}>{type.label}</Badge>
              </div>
            );
          })}
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedDocuments.map((doc) => {
                const type = typeConfig[doc.type];
                const FileIcon = getFileIcon(doc.mimeType);
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={type.className}>{type.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(doc.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onView(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onDownload && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
