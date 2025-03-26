"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function MainNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2F4F4F]/20 bg-gradient-to-r from-white to-[#0066CC]/5 dark:from-gray-950 dark:to-[#0066CC]/10 backdrop-blur shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0066CC] to-[#2F4F4F] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="hidden font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0066CC] to-[#2F4F4F] text-lg sm:inline-block">
              AI Deadlock Resolver
            </span>
          </Link>
        </div>

        {/* Navigation centered */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "transition-all hover:text-[#0066CC] relative group py-1",
              pathname === "/" ? "text-[#0066CC] font-semibold" : "text-[#2F4F4F]"
            )}
          >
            Home
            <span className={cn("absolute -bottom-1 left-0 h-0.5 bg-[#0066CC] transition-all duration-300",
              pathname === "/" ? "w-full" : "w-0 group-hover:w-full")}></span>
          </Link>
          <Link
            href="/about"
            className={cn(
              "transition-all hover:text-[#0066CC] relative group py-1",
              pathname === "/about" ? "text-[#0066CC] font-semibold" : "text-[#2F4F4F]"
            )}
          >
            About
            <span className={cn("absolute -bottom-1 left-0 h-0.5 bg-[#0066CC] transition-all duration-300",
              pathname === "/about" ? "w-full" : "w-0 group-hover:w-full")}></span>
          </Link>
          <Link
            href="/team"
            className={cn(
              "transition-all hover:text-[#0066CC] relative group py-1",
              pathname === "/team" ? "text-[#0066CC] font-semibold" : "text-[#2F4F4F]"
            )}
          >
            Team
            <span className={cn("absolute -bottom-1 left-0 h-0.5 bg-[#0066CC] transition-all duration-300",
              pathname === "/team" ? "w-full" : "w-0 group-hover:w-full")}></span>
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "transition-all hover:text-[#0066CC] relative group py-1",
              pathname === "/dashboard" ? "text-[#0066CC] font-semibold" : "text-[#2F4F4F]"
            )}
          >
            Dashboard
            <span className={cn("absolute -bottom-1 left-0 h-0.5 bg-[#0066CC] transition-all duration-300",
              pathname === "/dashboard" ? "w-full" : "w-0 group-hover:w-full")}></span>
          </Link>
        </nav>

        {/* Theme toggle on the right */}
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="border-[#2F4F4F]/30 hover:border-[#0066CC] hover:bg-[#0066CC]/10 transition-all duration-300"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-[#0066CC] dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-[#2F4F4F] dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}