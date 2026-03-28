"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";

import { createSupabaseClient } from "../../../lib/supabase";

const AuthForm = () => {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get("redirect_uri") ?? "";

  const [error, submitAction, isPending] = useActionState(
    async (_previousState: string | null, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const mode = formData.get("mode") as string;

      if (!email || !password) {
        return "Email and password are required.";
      }

      const supabase = createSupabaseClient();

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          return signUpError.message;
        }
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        return signInError.message;
      }

      if (!data.session) {
        return "Failed to create session.";
      }

      if (redirectUri) {
        const callbackUrl = new URL(redirectUri);
        callbackUrl.searchParams.set("access_token", data.session.access_token);
        callbackUrl.searchParams.set(
          "refresh_token",
          data.session.refresh_token
        );
        window.location.href = callbackUrl.toString();
        return null;
      }

      return "Missing redirect_uri. Please run 'blodemd login' from your terminal.";
    },
    null
  );

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Blode Docs
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          Sign in to authenticate the CLI
        </p>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              color: "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              padding: "0.75rem",
            }}
          >
            {error}
          </div>
        )}

        <form action={submitAction}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "0.25rem",
            }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              display: "block",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              padding: "0.625rem 0.75rem",
              width: "100%",
            }}
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "0.25rem",
            }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              display: "block",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              padding: "0.625rem 0.75rem",
              width: "100%",
            }}
          />

          <button
            type="submit"
            name="mode"
            value="signin"
            disabled={isPending}
            style={{
              background: "#171717",
              borderRadius: "0.5rem",
              color: "#fff",
              cursor: isPending ? "wait" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "0.5rem",
              opacity: isPending ? 0.7 : 1,
              padding: "0.625rem",
              width: "100%",
            }}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="submit"
            name="mode"
            value="signup"
            disabled={isPending}
            style={{
              background: "transparent",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              color: "#171717",
              cursor: isPending ? "wait" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              opacity: isPending ? 0.7 : 1,
              padding: "0.625rem",
              width: "100%",
            }}
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
};

export default function CliAuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
