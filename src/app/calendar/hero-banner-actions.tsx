"use client";

import { ArrowLeft, MoonIcon, SunMediumIcon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function HeroBannerActions() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";

  return (
    <div className="absolute inset-x-4 top-4 z-20 flex justify-end">
      <div className="flex flex-col items-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/60 bg-white/90 text-slate-900 hover:bg-white"
          disabled={!mounted}
          onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        >
          {isDarkMode ? (
            <SunMediumIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
          {mounted ? (isDarkMode ? "Claro" : "Escuro") : "Tema"}
        </Button>

        <Link href="https://turboflow.com.br/gerenciadorleads" target="_blank">
          <Button
            type="button"
            size="sm"
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            <ArrowLeft className="size-4" />
            TurboFlow
          </Button>
        </Link>
      </div>
    </div>
  );
}
