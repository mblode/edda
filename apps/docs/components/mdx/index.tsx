import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps } from "react";

import { isExternalHref, resolveHref } from "@/lib/routes";

import { Accordion, AccordionGroup } from "./accordion";
import { AgentInstructions } from "./agent-instructions";
import { Badge } from "./badge";
import { Callout, Check, Danger, Info, Note, Tip, Warning } from "./callout";
import { Card } from "./card";
import { CodeBlock } from "./code-block";
import { CodeGroup } from "./code-group";
import { Color } from "./color";
import { Column, Columns } from "./columns";
import { Expandable } from "./expandable";
import { Frame } from "./frame";
import { Icon } from "./icon";
import { Iframe } from "./iframe";
import { Installer } from "./installer";
import { Panel } from "./panel";
import { ParamField } from "./param-field";
import { Preview } from "./preview";
import { Prompt } from "./prompt";
import { RequestExample, ResponseExample } from "./request-example";
import { ResponseField } from "./response-field";
import { Step, Steps } from "./steps";
import { Tab, Tabs } from "./tabs";
import { Tile } from "./tile";
import { Tooltip } from "./tooltip";
import { Tree as TreeRoot, TreeFile, TreeFolder } from "./tree";
import { TypeTable } from "./type-table";
import { Update } from "./update";
import { Video } from "./video";
import { View, ViewGroup } from "./view";

// Rebuild dotted MDX exports in the server module so Next's client references
// still expose `Tree.Folder` and `Tree.File` during MDX evaluation.
const Tree = Object.assign(
  (props: ComponentProps<typeof TreeRoot>) => <TreeRoot {...props} />,
  {
    File: TreeFile,
    Folder: TreeFolder,
  }
);

const createMdxLink = (basePath: string, currentPath: string) => {
  const MdxLink = ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) {
      return <a {...props}>{children}</a>;
    }
    if (isExternalHref(href)) {
      return (
        <a {...props} href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      );
    }
    return (
      <Link href={resolveHref(href, basePath, currentPath)} {...props}>
        {children}
      </Link>
    );
  };
  MdxLink.displayName = "MdxLink";
  return MdxLink;
};

export const createMdxComponents = (
  basePath = "",
  currentPath = ""
): MDXComponents => ({
  Accordion,
  AccordionGroup,
  AgentInstructions,
  Badge,
  Callout,
  Card,
  Check,
  CodeGroup,
  Color,
  Column,
  Columns,
  Danger,
  Expandable,
  Frame,
  Icon,
  Iframe,
  Info,
  Installer,
  Note,
  Panel,
  ParamField,
  Preview,
  Prompt,
  RequestExample,
  ResponseExample,
  ResponseField,
  Step,
  Steps,
  Tab,
  Tabs,
  Tile,
  Tip,
  Tooltip,
  Tree,
  TypeTable,
  Update,
  Video,
  View,
  ViewGroup,
  Warning,
  a: createMdxLink(basePath, currentPath),
  pre: CodeBlock,
});

export const mdxComponents: MDXComponents = createMdxComponents();
