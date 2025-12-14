"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Building2,
  LayoutDashboard,
  Users,
  Landmark,
  FileText,
  HelpCircle,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/app", icon: LayoutDashboard },
  { title: "Copropriétés", href: "/app/condominiums", icon: Building2 },
  { title: "Propriétaires", href: "/app/owners", icon: Users },
  { title: "Banque", href: "/app/bank", icon: Landmark },
  { title: "Documents", href: "/app/documents", icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle asChild>
            <Link 
              href="/app" 
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-semibold text-foreground">Le Copropriétaire</span>
                <span className="text-[12px] font-normal text-muted-foreground">Gestion immobilière</span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "text-primary")}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="border-t border-border p-4 mt-auto">
          <div className="rounded-xl bg-muted p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span>Besoin d&apos;aide ?</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Consultez notre documentation
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 w-full rounded-lg border-border text-[13px] font-medium"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="/app/help">Voir la doc</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
