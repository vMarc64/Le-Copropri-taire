import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-foreground">Le Copropriétaire</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Design System Demo</h2>
            <p className="text-muted-foreground">
              Test du thème clair/sombre avec nos design tokens
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Composants de base</CardTitle>
              <CardDescription>Boutons et badges avec les différentes variantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-success text-success-foreground">Payé</Badge>
                <Badge className="bg-warning text-warning-foreground">En attente</Badge>
                <Badge className="bg-error text-error-foreground">Impayé</Badge>
                <Badge variant="outline">Neutre</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
                <CardDescription>Une carte avec du contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Le thème change automatiquement selon vos préférences système.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
                <CardDescription>Avec des badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge>Tag 1</Badge>
                  <Badge variant="secondary">Tag 2</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
                <CardDescription>Actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Action</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
