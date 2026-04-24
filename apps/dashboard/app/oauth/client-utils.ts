"use client";

import { createSupabaseClient } from "@/lib/supabase";

export const redirectIfAlreadyAuthorized = async (authorizationId: string) => {
  const supabase = createSupabaseClient();

  const { data: details, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (details && "redirect_url" in details) {
    window.location.assign(details.redirect_url);
    return null;
  }

  return error?.message ?? null;
};

export const approveOrRedirect = async (authorizationId: string) => {
  const supabase = createSupabaseClient();

  const { data: details, error: detailsError } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (details && "redirect_url" in details) {
    window.location.assign(details.redirect_url);
    return null;
  }
  if (detailsError) {
    return detailsError.message;
  }

  const { error } =
    await supabase.auth.oauth.approveAuthorization(authorizationId);
  if (error) {
    return error.message;
  }

  return null;
};

export const formatAuthorizationError = (message: string): string =>
  message.includes("authorization not found")
    ? "This authorization link has expired. Please run `blodemd login` again in your terminal."
    : message;
