import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data - will be replaced with API calls
const stats = {
  condominiums: 12,
  lots: 248,
  owners: 186,
  pendingPayments: 23,
  monthlyIncome: 45600,
  unpaidAmount: 8450,
};

const recentActivities = [
  { id: "1", type: "payment", description: "Paiement reçu - M. Dupont (Résidence Les Lilas)", amount: 450, date: "Il y a 2h" },
  { id: "2", type: "document", description: "Document ajouté - PV AG Immeuble Haussmann", date: "Il y a 5h" },
  { id: "3", type: "message", description: "Nouveau message - Mme Martin (question charges)", date: "Hier" },
  { id: "4", type: "alert", description: "Impayé > 90 jours - M. Bernard (Le Parc des Roses)", amount: 1350, date: "Hier" },
];

const upcomingMeetings = [
  { id: "1", title: "AG Résidence Les Lilas", date: "18 Déc 2025", status: "confirmed" },
  { id: "2", title: "CS Immeuble Haussmann", date: "22 Déc 2025", status: "pending" },
];

const alerts = [
  { id: "1", type: "danger", message: "3 impayés > 90 jours", link: "/app/payments?filter=overdue" },
  { id: "2", type: "warning", message: "5 mandats SEPA en attente", link: "/app/bank/sepa" },
  { id: "3", type: "info", message: "Nouvel appel de fonds à préparer", link: "/app/calls/new" },
];

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-2">
          {alerts.map((alert) => (
            <Link key={alert.id} href={alert.link}>
              <div
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted ${
                  alert.type === "danger"
                    ? "border-destructive/50 bg-destructive/10"
                    : alert.type === "warning"
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-blue-500/50 bg-blue-500/10"
                }`}
              >
                <span className="text-sm font-medium">
                  {alert.type === "danger" ? "🚨" : alert.type === "warning" ? "⚠️" : "ℹ️"}{" "}
                  {alert.message}
                </span>
                <span className="text-sm text-muted-foreground">Voir →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Copropriétés</CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.condominiums}</div>
            <p className="text-xs text-muted-foreground">{stats.lots} lots au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propriétaires</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.owners}</div>
            <p className="text-xs text-muted-foreground">Copropriétaires actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyIncome.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impayés</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.unpaidAmount.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">{stats.pendingPayments} paiements en attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  {activity.amount && (
                    <span className={`text-sm font-medium ${activity.type === "alert" ? "text-destructive" : "text-green-600"}`}>
                      {activity.type === "alert" ? "-" : "+"}{activity.amount} €
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prochaines réunions</CardTitle>
                <CardDescription>AG et conseils syndicaux à venir</CardDescription>
              </div>
              <Link href="/app/meetings" className="text-sm text-primary hover:underline">
                Voir tout →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">{meeting.date}</p>
                  </div>
                  <Badge variant={meeting.status === "confirmed" ? "default" : "secondary"}>
                    {meeting.status === "confirmed" ? "Confirmée" : "En attente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/app/condominiums/new">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">🏢</span>
              <span className="font-medium">Nouvelle copropriété</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/calls/new">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">📨</span>
              <span className="font-medium">Appel de fonds</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/documents/upload">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">📁</span>
              <span className="font-medium">Ajouter document</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/messages/new">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">✉️</span>
              <span className="font-medium">Envoyer message</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
