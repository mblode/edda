"use client";

import { FileTextIcon } from "blode-icons-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LoginLink } from "@/components/ui/login-link";
import { MorphIcon } from "@/components/ui/morph-icon";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignupLink } from "@/components/ui/signup-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { external: true, href: siteConfig.links.github, label: "GitHub" },
];

export const MarketingHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 transition-all duration-300",
        scrolled ? "pt-3" : "pt-5"
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-[1200px] items-center justify-between rounded-full border pr-2 py-2 transition-all duration-300",
          scrolled
            ? "border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="flex items-center gap-1 pl-5">
          <Link
            aria-label="Blode.md home"
            className="flex items-center gap-1.5 rounded-full py-1 transition-opacity hover:opacity-70"
            href="/"
          >
            <FileTextIcon className="size-4" />
            <span className="flex items-baseline">
              <span className="font-semibold text-base leading-none tracking-tight">
                Blode
              </span>
              <span className="font-semibold text-base leading-none tracking-tight">
                .md
              </span>
            </span>
          </Link>
        </div>
        <nav
          aria-label="Primary"
          className="-translate-x-1/2 absolute left-1/2 hidden items-center gap-1 md:flex"
        >
          {navLinks.map((link) =>
            link.external ? (
              <a
                aria-label={`${link.label} (opens in new tab)`}
                className="rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                href={link.href}
                key={link.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ) : (
              <Link
                className="rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <nav aria-label="Account" className="flex items-center gap-1">
          <LoginLink
            className="hidden rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            location="header_desktop"
          >
            Log in
          </LoginLink>
          <SignupLink
            className="inline-flex h-8 items-center rounded-full bg-foreground px-4 font-medium text-background text-sm transition-opacity hover:opacity-90"
            location="header_desktop"
          >
            Sign up
          </SignupLink>
          <Sheet onOpenChange={setOpen} open={open}>
            <SheetTrigger asChild>
              <Button
                aria-label="Toggle menu"
                className="ml-1 size-8 rounded-full md:hidden"
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
                <SheetClose asChild>
                  <SignupLink
                    className="mb-2 inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 font-medium text-background text-sm transition-opacity hover:opacity-90"
                    location="header_mobile"
                  >
                    Sign up
                  </SignupLink>
                </SheetClose>
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    {link.external ? (
                      <a
                        aria-label={`${link.label} (opens in new tab)`}
                        className="rounded-md px-2 py-2 text-lg font-medium transition-colors hover:bg-muted"
                        href={link.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        className="rounded-md px-2 py-2 text-lg font-medium transition-colors hover:bg-muted"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    )}
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <LoginLink
                    className="rounded-md px-2 py-2 text-lg font-medium transition-colors hover:bg-muted sm:hidden"
                    location="header_mobile"
                  >
                    Log in
                  </LoginLink>
                </SheetClose>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-4">
                <span className="text-muted-foreground text-sm">Theme</span>
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
};
