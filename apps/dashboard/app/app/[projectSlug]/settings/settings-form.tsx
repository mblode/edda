"use client";

// oxlint-disable eslint-plugin-react-perf/jsx-no-new-function-as-prop -- deferred useCallback refactor
import type {
  ApiKey,
  ApiKeyCreated,
  Project,
  ProjectAnalytics,
} from "@repo/contracts";
import {
  KeyIcon,
  LinkIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "blode-icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const DETAILS_ANCHOR = "project-details";
const ANALYTICS_ANCHOR = "analytics";
const DEPLOY_KEYS_ANCHOR = "deploy-keys";

const GA4_REGEX = /^G-[A-Z0-9]{4,20}$/;
const POSTHOG_KEY_REGEX = /^phc_[A-Za-z0-9]{20,}$/;

const SectionTitle = ({
  anchor,
  children,
}: {
  anchor: string;
  children: React.ReactNode;
}) => (
  <h4 className="inline-flex items-center gap-3 font-semibold text-xl leading-8 tracking-[-0.02em]">
    <a
      className="group inline-flex items-center gap-2 text-inherit no-underline"
      href={`#${anchor}`}
    >
      <span>{children}</span>
      <LinkIcon
        aria-hidden="true"
        className="size-4 text-muted-foreground opacity-0 transition-opacity group-focus-visible:opacity-100 group-hover:opacity-100"
      />
    </a>
  </h4>
);

interface ProjectSettingsFormProps {
  accessToken: string;
  project: Project;
}

const ProjectDetailsCard = ({
  accessToken,
  project,
}: ProjectSettingsFormProps) => {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [deploymentName, setDeploymentName] = useState(project.deploymentName);
  const [description, setDescription] = useState(project.description ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const handleSaveDetails = useCallback(async () => {
    setDetailsError(null);
    setDetailsSaved(false);
    setSavingDetails(true);
    try {
      await apiFetch(`/projects/${project.id}`, {
        accessToken,
        body: {
          deploymentName: deploymentName.trim(),
          description: description.trim() || null,
          name: name.trim(),
        },
        method: "PATCH",
      });
      setDetailsSaved(true);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to save changes.";
      setDetailsError(message);
    } finally {
      setSavingDetails(false);
    }
  }, [accessToken, deploymentName, description, name, project.id, router]);

  return (
    <Card id={DETAILS_ANCHOR}>
      <CardHeader className="gap-2 px-6 pt-2">
        <SectionTitle anchor={DETAILS_ANCHOR}>Project Details</SectionTitle>
        <p className="text-muted-foreground text-sm">
          Slug ({project.slug}) is permanent and used in your subdomain.
        </p>
      </CardHeader>
      <CardContent className="px-6">
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="name">Project name</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="name"
              onChange={(event) => {
                setDetailsError(null);
                setDetailsSaved(false);
                setName(event.target.value);
              }}
              value={name}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deployment-name">Deployment name</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="deployment-name"
              onChange={(event) => {
                setDetailsError(null);
                setDeploymentName(event.target.value);
                setDetailsSaved(false);
              }}
              value={deploymentName}
            />
            <FieldDescription>
              Shown in the project topbar of deployed docs.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="description"
              onChange={(event) => {
                setDetailsError(null);
                setDescription(event.target.value);
                setDetailsSaved(false);
              }}
              placeholder="Optional"
              value={description}
            />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-between px-6">
        <div className="min-h-5 text-sm">
          {detailsError && <FieldError>{detailsError}</FieldError>}
          {!detailsError && detailsSaved && (
            <span className="text-muted-foreground">Saved.</span>
          )}
        </div>
        <Button
          disabled={savingDetails || !name.trim() || !deploymentName.trim()}
          onClick={handleSaveDetails}
          type="button"
        >
          {savingDetails ? "Saving..." : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
};

const buildAnalyticsPayload = (
  ga4Id: string,
  posthogKey: string,
  posthogHost: string
): ProjectAnalytics | null => {
  const payload: ProjectAnalytics = {};
  if (ga4Id.trim()) {
    payload.ga4 = { measurementId: ga4Id.trim() };
  }
  if (posthogKey.trim()) {
    payload.posthog = {
      projectKey: posthogKey.trim(),
      ...(posthogHost.trim() ? { host: posthogHost.trim() } : {}),
    };
  }
  return payload.ga4 || payload.posthog ? payload : null;
};

const validateAnalytics = (
  ga4Id: string,
  posthogKey: string,
  posthogHost: string
): string | null => {
  const ga4 = ga4Id.trim();
  if (ga4 && !GA4_REGEX.test(ga4)) {
    return "GA4 measurement IDs look like G-XXXXXXXXXX.";
  }
  const key = posthogKey.trim();
  if (key && !POSTHOG_KEY_REGEX.test(key)) {
    return "PostHog project keys start with phc_. Personal API keys (phx_) are not supported.";
  }
  const host = posthogHost.trim();
  if (host && !URL.canParse(host)) {
    return "PostHog host must be a valid URL.";
  }
  return null;
};

const AnalyticsCard = ({ accessToken, project }: ProjectSettingsFormProps) => {
  const router = useRouter();
  const initial = project.analytics ?? null;
  const [ga4Id, setGa4Id] = useState(initial?.ga4?.measurementId ?? "");
  const [posthogKey, setPosthogKey] = useState(
    initial?.posthog?.projectKey ?? ""
  );
  const [posthogHost, setPosthogHost] = useState(initial?.posthog?.host ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    const validationError = validateAnalytics(ga4Id, posthogKey, posthogHost);
    if (validationError) {
      setErrorMessage(validationError);
      setSaved(false);
      return;
    }
    setErrorMessage(null);
    setSaved(false);
    setSaving(true);
    try {
      await apiFetch(`/projects/${project.id}`, {
        accessToken,
        body: {
          analytics: buildAnalyticsPayload(ga4Id, posthogKey, posthogHost),
        },
        method: "PATCH",
      });
      setSaved(true);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to save changes.";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  }, [accessToken, ga4Id, posthogHost, posthogKey, project.id, router]);

  return (
    <Card id={ANALYTICS_ANCHOR}>
      <CardHeader className="gap-2 px-6 pt-2">
        <SectionTitle anchor={ANALYTICS_ANCHOR}>Analytics</SectionTitle>
        <p className="text-muted-foreground text-sm">
          Bring your own Google Analytics 4 or PostHog. We inject the scripts on
          every tenant page. Leave a field empty to disable that provider.
        </p>
      </CardHeader>
      <CardContent className="px-6">
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="ga4">Google Analytics 4</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="ga4"
              onChange={(event) => {
                setErrorMessage(null);
                setGa4Id(event.target.value);
                setSaved(false);
              }}
              placeholder="G-XXXXXXXXXX"
              value={ga4Id}
            />
            <FieldDescription>
              Measurement ID. Find it in GA4 → Admin → Data streams.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="posthog-key">PostHog project key</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="posthog-key"
              onChange={(event) => {
                setErrorMessage(null);
                setPosthogKey(event.target.value);
                setSaved(false);
              }}
              placeholder="phc_..."
              value={posthogKey}
            />
            <FieldDescription>
              Project API key. Find it in PostHog → Project settings.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="posthog-host">PostHog host</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="posthog-host"
              onChange={(event) => {
                setErrorMessage(null);
                setPosthogHost(event.target.value);
                setSaved(false);
              }}
              placeholder="https://us.i.posthog.com"
              value={posthogHost}
            />
            <FieldDescription>
              Optional. Defaults to https://us.i.posthog.com. Use
              https://eu.i.posthog.com for EU cloud.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-between px-6">
        <div className="min-h-5 text-sm">
          {errorMessage && <FieldError>{errorMessage}</FieldError>}
          {!errorMessage && saved && (
            <span className="text-muted-foreground">Saved.</span>
          )}
        </div>
        <Button disabled={saving} onClick={handleSave} type="button">
          {saving ? "Saving..." : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface DeployKeysCardProps extends ProjectSettingsFormProps {
  initialApiKeys: ApiKey[];
}

const DeployKeyRow = ({
  apiKey,
  disabled,
  error,
  onDelete,
}: {
  apiKey: ApiKey;
  disabled: boolean;
  error?: string;
  onDelete: () => void;
}) => (
  <div className="flex flex-col gap-2 rounded-xl border p-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-sm">{apiKey.name}</span>
          {apiKey.lastUsedAt ? null : (
            <Badge variant="outline">Never used</Badge>
          )}
        </div>
        <span className="font-mono text-muted-foreground text-sm">
          {apiKey.keyPrefix}…
        </span>
        <span className="text-muted-foreground text-xs">
          Created {timeAgo(apiKey.createdAt)}
          {apiKey.lastUsedAt
            ? ` · Last used ${timeAgo(apiKey.lastUsedAt)}`
            : ""}
        </span>
      </div>
      <Button
        aria-label={`Delete ${apiKey.name}`}
        className="size-9 shrink-0 rounded-xl"
        disabled={disabled}
        onClick={onDelete}
        size="icon"
        type="button"
        variant="outline"
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
    {error ? <p className="text-destructive text-sm">{error}</p> : null}
  </div>
);

const DeployKeysCard = ({
  accessToken,
  initialApiKeys,
  project,
}: DeployKeysCardProps) => {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<ApiKey | null>(null);
  const [revealed, setRevealed] = useState<ApiKeyCreated | null>(null);

  const setRowError = useCallback((keyId: string, message: string | null) => {
    setRowErrors((prev) => {
      if (message === null) {
        if (!(keyId in prev)) {
          return prev;
        }
        const { [keyId]: _removed, ...next } = prev;
        return next;
      }
      return { ...prev, [keyId]: message };
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (creating) {
      return;
    }
    setFormError(null);
    setCreating(true);
    try {
      const trimmed = name.trim();
      const created = await apiFetch<ApiKeyCreated>(
        `/projects/${project.id}/keys`,
        {
          accessToken,
          body: { name: trimmed || undefined },
          method: "POST",
        }
      );
      setApiKeys((prev) => [...prev, created.apiKey]);
      setRevealed(created);
      setName("");
      setShowForm(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to create key.";
      setFormError(message);
    } finally {
      setCreating(false);
    }
  }, [accessToken, creating, name, project.id, router]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }
    const target = pendingDelete;
    setPendingDelete(null);
    setIsCreating(true);
    try {
      await apiFetch(`/projects/${project.id}/keys/${target.id}`, {
        accessToken,
        method: "DELETE",
      });
      setApiKeys((prev) =>
        prev.filter((existing) => existing.id !== target.id)
      );
      setRowError(target.id, null);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to delete key.";
      setRowError(target.id, message);
    } finally {
      setIsCreating(false);
    }
  }, [accessToken, pendingDelete, project.id, router, setRowError]);

  return (
    <Card id={DEPLOY_KEYS_ANCHOR}>
      <CardHeader className="gap-2 px-6 pt-2">
        <SectionTitle anchor={DEPLOY_KEYS_ANCHOR}>Deploy keys</SectionTitle>
        <p className="text-muted-foreground text-sm">
          Project-scoped API keys let CI (for example GitHub Actions) run{" "}
          <code className="rounded-md bg-foreground/10 px-1.5 py-0.5 font-mono text-xs text-foreground">
            blodemd push
          </code>{" "}
          without your account credentials. Keys are shown once at creation.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <KeyIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">No deploy keys yet</p>
              <p className="text-muted-foreground text-sm">
                Create a key to authenticate deployments from CI.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {apiKeys.map((apiKey) => (
              <DeployKeyRow
                apiKey={apiKey}
                disabled={isCreating}
                error={rowErrors[apiKey.id]}
                key={apiKey.id}
                onDelete={() => setPendingDelete(apiKey)}
              />
            ))}
          </div>
        )}

        {showForm ? (
          <div className="flex flex-col gap-2">
            {formError ? (
              <p className="text-destructive text-sm">{formError}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                className="h-10 flex-1 rounded-xl"
                disabled={creating}
                onChange={(event) => {
                  setFormError(null);
                  setName(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder="Key name (optional), e.g. GitHub Actions"
                value={name}
              />
              <Button
                className="h-10 rounded-xl"
                disabled={creating}
                onClick={handleCreate}
                type="button"
              >
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button
                className="h-10 rounded-xl"
                disabled={creating}
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setFormError(null);
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button
              className="rounded-xl"
              onClick={() => setShowForm(true)}
              type="button"
              variant="outline"
            >
              <PlusIcon className="size-[18px]" />
              Create key
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setRevealed(null);
          }
        }}
        open={revealed !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your deploy key</DialogTitle>
            <DialogDescription>
              This is the only time the full key is shown. Store it securely —
              you won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-xl border bg-muted/50 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-sm">
              {revealed?.key}
            </code>
            <CopyButton
              className="shrink-0"
              content={revealed?.key ?? ""}
              variant="outline"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)} type="button">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        open={pendingDelete !== null}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <TriangleAlertIcon className="size-5 text-destructive" />
              </div>
              <div className="flex flex-col gap-2">
                <DialogTitle>
                  Delete {pendingDelete?.name ?? "key"}?
                </DialogTitle>
                <DialogDescription>
                  Any CI using this key will stop being able to deploy. This
                  cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setPendingDelete(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} type="button" variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface ProjectSettingsPageProps extends ProjectSettingsFormProps {
  initialApiKeys: ApiKey[];
}

export const ProjectSettingsForm = ({
  accessToken,
  initialApiKeys,
  project,
}: ProjectSettingsPageProps) => (
  <>
    <ProjectDetailsCard accessToken={accessToken} project={project} />
    <AnalyticsCard accessToken={accessToken} project={project} />
    <DeployKeysCard
      accessToken={accessToken}
      initialApiKeys={initialApiKeys}
      project={project}
    />
  </>
);
