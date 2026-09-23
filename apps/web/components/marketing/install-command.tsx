interface InstallCommandProps {
  commands: { command: string; label: string }[];
}

/**
 * Local mirror of `@blode/install-command`. The copy button, its copied and
 * error states, and `install_command_copied` live in `public/landing.js`
 * (the `onCopy` callback's job), so this renders without hydration. Without
 * JavaScript the button hides and the commands stay selectable.
 */
export const InstallCommand = ({ commands }: InstallCommandProps) => (
  <div className="flex flex-col gap-4">
    {commands.map((item) => (
      <div
        className="rounded-xl bg-surface p-4 font-mono text-sm md:p-5"
        data-copy-scope
        key={item.label}
      >
        <div className="mb-3 flex items-center justify-between gap-4 font-sans">
          <span className="text-muted-foreground text-xs">{item.label}</span>
          <button
            aria-label={`Copy ${item.label} commands`}
            className="inline-flex h-8 min-w-20 items-center justify-center rounded-md border border-border px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            data-copy-command={item.command}
            data-copy-label="Copy"
            data-copy-variant={item.label.toLowerCase()}
            type="button"
          >
            Copy
          </button>
        </div>
        <p
          aria-live="polite"
          className="mb-2 min-h-5 font-sans text-muted-foreground text-xs"
          data-copy-status
          role="status"
        />
        <pre className="overflow-x-auto whitespace-pre leading-7">
          <code>{item.command}</code>
        </pre>
      </div>
    ))}
  </div>
);
