"use client";

// oxlint-disable eslint-plugin-react-perf/jsx-no-new-function-as-prop -- deferred useCallback refactor
import type { Project } from "@repo/contracts";
import { LinkIcon } from "blode-icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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

const DETAILS_ANCHOR = "project-details";

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
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deployment-name">Deployment name</FieldLabel>
            <Input
              className="w-[300px] max-w-full"
              id="deployment-name"
              onChange={(event) => setDeploymentName(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
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
