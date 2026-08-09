"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { captureEvent } from "@/lib/analytics";

type SignupLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: ComponentProps<typeof Link>["href"];
  location: string;
};

export const SignupLink = ({
  location,
  href = "/oauth/consent",
  onClick,
  ...props
}: SignupLinkProps) => (
  <Link
    href={href}
    onClick={(event) => {
      captureEvent("signup_intent_selected", { location });
      onClick?.(event);
    }}
    {...props}
  />
);
