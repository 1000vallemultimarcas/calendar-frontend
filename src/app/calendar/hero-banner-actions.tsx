"use client";

import { ArrowLeft, MoonIcon, SunMediumIcon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function HeroBannerActions() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <div className="absolute inset-x-4 top-4 z-20 flex justify-end">
      <div className="flex flex-col items-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/60 bg-white/90 text-slate-900 hover:bg-white"
          onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        >
          {isDarkMode ? (
            <SunMediumIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
          {isDarkMode ? "Light" : "Dark"}
        </Button>

        <Link href="https://turboflow.com.br/" target="_blank">
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
