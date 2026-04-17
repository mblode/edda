"use client";

// oxlint-disable eslint-plugin-react-perf/jsx-no-new-function-as-prop -- deferred useCallback refactor
import type { Project } from "@repo/contracts";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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

interface ProjectSettingsFormProps {
  accessToken: string;
  project: Project;
}

export const ProjectSettingsForm = ({
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
    <Card>
      <CardHeader>
        <CardTitle>Project details</CardTitle>
        <CardDescription>
          Slug ({project.slug}) is permanent and used in your subdomain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {detailsError && <FieldError>{detailsError}</FieldError>}
          {detailsSaved && (
            <p className="text-sm text-muted-foreground">Saved.</p>
          )}
          <Field>
            <FieldLabel htmlFor="name">Project name</FieldLabel>
            <Input
              id="name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deployment-name">Deployment name</FieldLabel>
            <Input
              id="deployment-name"
              onChange={(event) => setDeploymentName(event.target.value)}
              value={deploymentName}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shown in the project topbar of deployed docs.
            </p>
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input
              id="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
              value={description}
            />
          </Field>
          <div>
            <Button
              disabled={savingDetails || !name.trim() || !deploymentName.trim()}
              onClick={handleSaveDetails}
              type="button"
            >
              {savingDetails ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
};
