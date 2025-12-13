"use client";

import * as React from "react";
import { Moon, Sun, Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const themeColors = [
  { name: "Neutral", value: "neutral", color: "#737373" },
  { name: "Blue", value: "blue", color: "#3b82f6" },
  { name: "Green", value: "green", color: "#22c55e" },
  { name: "Orange", value: "orange", color: "#f97316" },
  { name: "Red", value: "red", color: "#ef4444" },
  { name: "Rose", value: "rose", color: "#f43f5e" },
  { name: "Violet", value: "violet", color: "#8b5cf6" },
  { name: "Yellow", value: "yellow", color: "#eab308" },
] as const;

type ThemeColor = (typeof themeColors)[number]["value"];

export function useThemeColor() {
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>("neutral");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme-color") as ThemeColor | null;
    if (stored && themeColors.some(t => t.value === stored)) {
      setThemeColorState(stored);
      document.documentElement.setAttribute("data-theme", stored === "neutral" ? "" : stored);
    }
  }, []);

  const setThemeColor = React.useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("theme-color", color);
    document.documentElement.setAttribute("data-theme", color === "neutral" ? "" : color);
  }, []);

  return { themeColor, setThemeColor, mounted };
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor, mounted } = useThemeColor();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const isDark = theme === "dark" || (!theme && true); // dark by default

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span 
            className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-background"
            style={{ backgroundColor: themeColors.find(t => t.value === themeColor)?.color }}
          />
          <span className="sr-only">Theme settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          Light
          {theme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          Dark
          {(theme === "dark" || !theme) && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        
        {themeColors.map((color) => (
          <DropdownMenuItem 
            key={color.value} 
            onClick={() => setThemeColor(color.value)}
            className="gap-2"
          >
            <span 
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: color.color }}
            />
            {color.name}
            {themeColor === color.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
