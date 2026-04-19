"use client";

import { GithubIcon } from "blode-icons-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { MorphIcon } from "@/components/ui/morph-icon";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/lib/config";

interface SiteHeaderNavProps {
  dashboardHref: string;
  isSignedIn: boolean;
}

const menuLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export const SiteHeaderNav = ({
  dashboardHref,
  isSignedIn,
}: SiteHeaderNavProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="container flex items-center justify-between px-4 py-6">
      <Link
        className="flex items-center gap-3 transition-opacity hover:opacity-80"
        href="/"
      >
        <span className="font-semibold text-base tracking-tight">blode.md</span>
      </Link>
      <nav aria-label="Main" className="flex items-center gap-2">
        {isSignedIn ? (
          <Button asChild size="sm">
            <Link href={dashboardHref}>Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href="/oauth/consent">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/oauth/consent">Sign up</Link>
            </Button>
          </>
        )}
        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger asChild>
            <Button
              aria-label="Toggle menu"
              className="size-9"
              size="icon"
              variant="ghost"
            >
              <MorphIcon icon={open ? "cross" : "menu"} size={16} />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-6" side="right">
            <SheetHeader>
              <SheetTitle className="text-base">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {menuLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    className="rounded-md px-2 py-2 text-lg font-medium transition-colors hover:bg-muted"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <a
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-lg font-medium transition-colors hover:bg-muted"
                  href={siteConfig.links.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <GithubIcon />
                  GitHub
                </a>
              </SheetClose>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};
