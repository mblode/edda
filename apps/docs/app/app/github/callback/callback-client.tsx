"use client";

// oxlint-disable eslint-plugin-react-perf/jsx-no-new-function-as-prop -- deferred useCallback refactor
import { GithubIcon, LockIcon, SearchIcon } from "blode-icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, apiFetch } from "@/lib/api-client";
import { timeAgo } from "@/lib/time-ago";

interface GithubInstallCallbackProps {
  accessToken: string;
  installationId: number;
  state: string;
}

interface RepoSummary {
  defaultBranch: string;
  fullName: string;
  private: boolean;
  pushedAt: string | null;
}

interface PendingInstall {
  projectId: string;
  projectSlug: string;
  state: string;
}

const RepoAvatar = ({ fullName }: { fullName: string }) => {
  const owner = fullName.split("/")[0] ?? "";
  return (
    <Image
      alt=""
      className="size-6 shrink-0 rounded-full bg-muted ring-1 ring-black/5"
      height={24}
      src={`https://github.com/${owner}.png?size=48`}
      unoptimized
      width={24}
    />
  );
};

const RepoRow = ({
  onImport,
  repo,
}: {
  onImport: () => void;
  repo: RepoSummary;
}) => {
  const name = repo.fullName.split("/")[1] ?? repo.fullName;
  const ago = timeAgo(repo.pushedAt);
  return (
    <div className="flex items-center gap-4 bg-card px-4 py-3">
      <RepoAvatar fullName={repo.fullName} />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-sm font-medium" title={repo.fullName}>
          {name}
        </span>
        {repo.private && (
          <LockIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        {ago && (
          <>
            <span
              aria-hidden="true"
              className="hidden text-muted-foreground sm:inline"
            >
              ·
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {ago}
            </span>
          </>
        )}
      </div>
      <Button
        aria-label={`Import ${repo.fullName}`}
        onClick={onImport}
        size="sm"
        type="button"
      >
        Import
      </Button>
    </div>
  );
};

export const GithubInstallCallback = ({
  accessToken,
  installationId,
  state,
}: GithubInstallCallbackProps) => {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [repos, setRepos] = useState<RepoSummary[] | null>(null);
  const [formError, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RepoSummary | null>(null);
  const [branch, setBranch] = useState("main");
  const [docsPath, setDocsPath] = useState("docs");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const raw = sessionStorage.getItem("blodemd:install-state");
      let pending: PendingInstall | null = null;
      if (raw) {
        try {
          pending = JSON.parse(raw) as PendingInstall;
        } catch {
          pending = null;
        }
      }
      if (pending && pending.state === state && pending.projectId) {
        if (!cancelled) {
          setProjectId(pending.projectId);
          setProjectSlug(pending.projectSlug);
        }
      } else {
        try {
          const verified = await apiFetch<{
            projectId: string;
            projectSlug: string;
          }>(`/git/state/${encodeURIComponent(state)}`, { accessToken });
          if (!cancelled) {
            setProjectId(verified.projectId);
            setProjectSlug(verified.projectSlug);
          }
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : "Couldn't recover the install state. Please retry from the project Git tab.";
          if (!cancelled) {
            setError(message);
          }
          return;
        }
      }

      try {
        const reposResult = await apiFetch<{ repos: RepoSummary[] }>(
          `/git/installations/${installationId}/repos`,
          { accessToken }
        );
        if (!cancelled) {
          setRepos(reposResult.repos);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Failed to load repositories.";
        if (!cancelled) {
          setError(message);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [accessToken, installationId, state]);

  const handlePick = (repo: RepoSummary) => {
    setSelected(repo);
    setBranch(repo.defaultBranch || "main");
    setError(null);
  };

  const handleConnect = async () => {
    if (!(projectId && selected)) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/projects/${projectId}/git`, {
        accessToken,
        body: {
          branch: branch.trim() || "main",
          docsPath: docsPath.trim() || "docs",
          installationId,
          repository: selected.fullName,
        },
        method: "POST",
      });
      sessionStorage.removeItem("blodemd:install-state");
      router.push(`/app/${projectSlug}/git`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not save connection.";
      setError(message);
      setSubmitting(false);
    }
  };

  const ownerLogin = repos?.[0]?.fullName.split("/")[0] ?? "";

  const filtered =
    repos?.filter((repo) =>
      repo.fullName.toLowerCase().includes(search.trim().toLowerCase())
    ) ?? [];

  if (selected) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Configure repository</CardTitle>
            <CardDescription>
              Set the branch and docs folder for this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3">
              <RepoAvatar fullName={selected.fullName} />
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="truncate text-sm font-medium">
                  {selected.fullName}
                </span>
                {selected.private && (
                  <LockIcon className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </div>
              <Button
                onClick={() => setSelected(null)}
                size="sm"
                type="button"
                variant="ghost"
              >
                Change
              </Button>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="branch">Branch</FieldLabel>
                <Input
                  id="branch"
                  onChange={(event) => setBranch(event.target.value)}
                  value={branch}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="docs-path">Docs path</FieldLabel>
                <Input
                  id="docs-path"
                  onChange={(event) => setDocsPath(event.target.value)}
                  value={docsPath}
                />
                <FieldDescription>
                  Folder inside the repo with your <code>docs.json</code>.
                </FieldDescription>
              </Field>
            </FieldGroup>
            {formError && <FieldError>{formError}</FieldError>}
            <div>
              <Button
                disabled={submitting}
                onClick={handleConnect}
                type="button"
              >
                {submitting ? "Connecting..." : "Connect repository"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Import Git Repository</CardTitle>
          <CardDescription>
            Choose the repo with your docs. We&apos;ll deploy on every push to
            the selected branch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <GithubIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{ownerLogin || "…"}</span>
            </div>
            <div className="relative flex-1">
              <SearchIcon
                aria-hidden="true"
                className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
              />
              <Input
                aria-label="Search repositories"
                className="pl-9"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search…"
                type="search"
                value={search}
              />
            </div>
          </div>

          {formError && <FieldError>{formError}</FieldError>}

          {repos === null && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}

          {repos?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              The Blode.md app isn&apos;t installed on any repos yet. Add at
              least one in GitHub and refresh.
            </p>
          )}

          {repos && repos.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No repositories match &quot;{search}&quot;.
            </p>
          )}

          {filtered.length > 0 && (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {filtered.map((repo) => (
                <RepoRow
                  key={repo.fullName}
                  onImport={() => handlePick(repo)}
                  repo={repo}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
