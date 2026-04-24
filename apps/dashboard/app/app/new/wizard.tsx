"use client";

// oxlint-disable eslint-plugin-react-perf/jsx-no-new-function-as-prop -- deferred useCallback refactor
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, apiFetch } from "@/lib/api-client";
import { platformRootDomain } from "@/lib/env";

type SetupPath = "template" | "cli";

const SLUG_PATTERN = /^(?!-)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const MAX_SLUG_LENGTH = 63;

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 48);

interface NewProjectWizardProps {
  accessToken: string;
}

const PATH_OPTIONS: readonly {
  value: SetupPath;
  title: string;
  description: string;
  badge?: string;
}[] = [
  {
    badge: "Recommended",
    description: "Start from the official Blode.md MDX template.",
    title: "Use a template",
    value: "template",
  },
  {
    description: "Stay in the terminal — scaffold and push from your repo.",
    title: "Start from the CLI",
    value: "cli",
  },
];

export const NewProjectWizard = ({ accessToken }: NewProjectWizardProps) => {
  const router = useRouter();
  const [path, setPath] = useState<SetupPath>("template");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveSlug = useMemo(() => {
    if (slugTouched) {
      return slug;
    }
    return slugify(name);
  }, [name, slug, slugTouched]);

  const slugError = useMemo(() => {
    if (!effectiveSlug) {
      return null;
    }
    if (effectiveSlug.length > MAX_SLUG_LENGTH) {
      return "Use 63 characters or fewer.";
    }
    if (!SLUG_PATTERN.test(effectiveSlug)) {
      return "Use lowercase letters, numbers, and hyphens only.";
    }
    return null;
  }, [effectiveSlug]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!effectiveSlug) {
      setError("Project slug is required.");
      return;
    }
    if (slugError) {
      setError(slugError);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/projects", {
        accessToken,
        body: {
          name: name.trim(),
          slug: effectiveSlug,
        },
        method: "POST",
      });
      const next =
        path === "template"
          ? `/app/${effectiveSlug}?template=starter`
          : `/app/${effectiveSlug}`;
      router.push(next);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to create project.";
      setError(message);
      setIsSubmitting(false);
    }
  }, [accessToken, effectiveSlug, name, path, router, slugError]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a starting point, name your project, ship.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How would you like to set up your docs?</CardTitle>
          <CardDescription>
            You can switch later. None of these choices are permanent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {PATH_OPTIONS.map((option) => {
              const selected = option.value === path;
              return (
                <button
                  className={`text-left rounded-lg border p-4 transition-colors ${
                    selected
                      ? "border-foreground bg-muted/30"
                      : "border-border hover:border-foreground/30"
                  }`}
                  key={option.value}
                  onClick={() => setPath(option.value)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium">{option.title}</div>
                    {option.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Name your project</CardTitle>
          <CardDescription>
            Your slug becomes your default subdomain. Add a custom domain later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {formError && <FieldError>{formError}</FieldError>}
            <Field>
              <FieldLabel htmlFor="project-name">Project name</FieldLabel>
              <Input
                id="project-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Docs"
                required
                value={name}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-slug">Slug</FieldLabel>
              <Input
                id="project-slug"
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                placeholder="acme-docs"
                value={effectiveSlug}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {effectiveSlug || "your-slug"}.{platformRootDomain}
              </p>
              {slugError && <FieldError>{slugError}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/app">Cancel</Link>
        </Button>
        <Button
          disabled={
            isSubmitting || Boolean(slugError) || !name.trim() || !effectiveSlug
          }
          onClick={handleSubmit}
          type="button"
        >
          {isSubmitting ? "Creating..." : "Create project"}
        </Button>
      </div>
    </div>
  );
};
