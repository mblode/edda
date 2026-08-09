"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { captureEvent } from "@/lib/analytics";

type LoginLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: ComponentProps<typeof Link>["href"];
  location: string;
};

export const LoginLink = ({
  location,
  href = "/oauth/consent",
  onClick,
  ...props
}: LoginLinkProps) => (
  <Link
    href={href}
    onClick={(event) => {
      captureEvent("login_intent_selected", { location });
      onClick?.(event);
    }}
    {...props}
  />
);
