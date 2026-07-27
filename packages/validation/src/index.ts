import {
  DocsConfigSchema,
  FrontmatterSchemaByType,
  SiteConfigSchema,
} from "@repo/models";
import type {
  ContentType,
  DocsConfig,
  FrontmatterByType,
  SiteConfig,
} from "@repo/models";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

const formatIssues = (issues: { path: PropertyKey[]; message: string }[]) =>
  issues.map((issue) => {
    const path = issue.path.length ? issue.path.map(String).join(".") : "root";
    return `${path}: ${issue.message}`;
  });

export const validateSiteConfig = (
  input: unknown
): ValidationResult<SiteConfig> => {
  const result = SiteConfigSchema.safeParse(input);
  if (result.success) {
    return { data: result.data, success: true };
  }

  const issues = formatIssues(result.error.issues);
  return { errors: issues, success: false };
};

export const validateDocsConfig = (
  input: unknown
): ValidationResult<DocsConfig> => {
  const result = DocsConfigSchema.safeParse(input);
  if (result.success) {
    return { data: result.data, success: true };
  }

  const issues = formatIssues(result.error.issues);
  return { errors: issues, success: false };
};

const UNRECOGNIZED_KEYS = "unrecognized_keys";
// One pass removes every key Zod reported, but a union arm can only surface the
// next layer of unknowns once the outer ones are gone.
const MAX_STRIP_PASSES = 5;

interface UnrecognizedKeysIssue {
  path: PropertyKey[];
  keys: string[];
}

interface RawIssue {
  code?: string;
  keys?: string[];
  message: string;
  path: PropertyKey[];
}

interface Parseable {
  safeParse: (
    input: unknown
  ) =>
    | { success: true; data: unknown }
    | { success: false; error: { issues: RawIssue[] } };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Rebuild `value` without `keys` at `path`, leaving everything else intact. */
const omitKeysAt = (
  value: unknown,
  path: PropertyKey[],
  keys: string[]
): unknown => {
  const [head, ...rest] = path;

  if (head === undefined) {
    return isRecord(value)
      ? Object.fromEntries(
          Object.entries(value).filter(([key]) => !keys.includes(key))
        )
      : value;
  }

  if (Array.isArray(value) && typeof head === "number") {
    return value.map((item, index) =>
      index === head ? omitKeysAt(item, rest, keys) : item
    );
  }

  if (isRecord(value) && String(head) in value) {
    return {
      ...value,
      [String(head)]: omitKeysAt(value[String(head)], rest, keys),
    };
  }

  return value;
};

const describeKey = (path: PropertyKey[], key: string) =>
  path.length ? `${path.map(String).join(".")}.${key}` : key;

/**
 * Parse a config for rendering, dropping keys the schema does not know about
 * instead of rejecting the whole document.
 *
 * An unknown key means the config was written for a different version of the
 * platform -- either newer than what is deployed, or older. That is not a
 * reason to take a published site down, so at render time we ignore it and
 * report it as a warning. Every other kind of error still fails: a malformed
 * navigation tree cannot be rendered around.
 *
 * Authoring paths (`blodemd validate`, deploy) keep using the strict parse, so
 * typos are still caught before anything ships.
 */
const parseTolerantly = (
  schema: Parseable,
  input: unknown
): ValidationResult<unknown> & { ignoredKeys?: string[] } => {
  let candidate = input;
  const ignoredKeys: string[] = [];

  for (let pass = 0; pass < MAX_STRIP_PASSES; pass += 1) {
    const result = schema.safeParse(candidate);
    if (result.success) {
      return { data: result.data, ignoredKeys, success: true };
    }

    const { issues } = result.error;
    const unknownIssues: UnrecognizedKeysIssue[] = issues.flatMap((issue) =>
      issue.code === UNRECOGNIZED_KEYS && Array.isArray(issue.keys)
        ? [{ keys: issue.keys, path: issue.path }]
        : []
    );

    // A real error, not just a key we do not recognise. Report it as-is.
    if (unknownIssues.length !== issues.length) {
      return { errors: formatIssues(issues), success: false };
    }

    let stripped = candidate;
    for (const issue of unknownIssues) {
      stripped = omitKeysAt(stripped, issue.path, issue.keys);
      for (const key of issue.keys) {
        ignoredKeys.push(describeKey(issue.path, key));
      }
    }

    if (stripped === candidate) {
      return { errors: formatIssues(issues), success: false };
    }
    candidate = stripped;
  }

  return {
    errors: [
      `Could not resolve unknown config keys: ${ignoredKeys.join(", ")}`,
    ],
    success: false,
  };
};

export const validateSiteConfigForRender = (input: unknown) =>
  parseTolerantly(SiteConfigSchema, input) as ValidationResult<SiteConfig> & {
    ignoredKeys?: string[];
  };

export const validateDocsConfigForRender = (input: unknown) =>
  parseTolerantly(DocsConfigSchema, input) as ValidationResult<DocsConfig> & {
    ignoredKeys?: string[];
  };

export const validateFrontmatter = <Type extends ContentType>(
  type: Type,
  input: unknown
): ValidationResult<FrontmatterByType[Type]> => {
  const schema = FrontmatterSchemaByType[type];
  const result = schema.safeParse(input);
  if (result.success) {
    return { data: result.data as FrontmatterByType[Type], success: true };
  }

  const issues = formatIssues(result.error.issues);
  return { errors: issues, success: false };
};
