"use client";

import { ArrowUpRightIcon, MoreHorizontalIcon } from "blode-icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ActionMenuItem {
  label: string;
  href: string;
  external?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerLabel: string;
}

export const ActionMenu = ({ items, triggerLabel }: ActionMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={triggerLabel}
          className="text-muted-foreground"
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontalIcon />
        </Button>
      </PopoverTrigger>
      {open ? (
        <PopoverContent align="end" className="w-60 p-1" sideOffset={6}>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.label}>
                <a
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-foreground text-sm hover:bg-accent"
                  href={item.href}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  target={item.external ? "_blank" : undefined}
                >
                  <span>{item.label}</span>
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                </a>
              </li>
            ))}
          </ul>
        </PopoverContent>
      ) : null}
    </Popover>
  );
};
