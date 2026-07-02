import { log, spinner } from "@clack/prompts";

// Single source of truth for TTY/CI/json awareness. Interactive UX (clack
// prompts, spinners) is only safe on a real terminal that is not CI and when
// the caller has not asked for machine-readable output.
export const isInteractive = (json = false): boolean =>
  !json && Boolean(process.stdout.isTTY) && !process.env.CI;

export interface Reporter {
  /** True when clack interactive UX (spinner + prompts) is active. */
  readonly interactive: boolean;
  /** Begin or update a progress step. */
  step(message: string): void;
  /** Complete the current step or print a standalone success line. */
  success(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  /** Stop any in-flight progress, optionally with a final message. */
  stop(message?: string): void;
  /** Emit a machine-readable JSON line on stdout (non-interactive only). */
  json(payload: unknown): void;
}

const writeLine = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

// In non-interactive/json mode progress and logs go to stderr as plain lines so
// stdout stays clean for a single `--json` payload. In interactive mode we defer
// to clack exactly as the commands did before this helper existed.
export const createReporter = ({
  json = false,
}: { json?: boolean } = {}): Reporter => {
  const interactive = isInteractive(json);

  if (!interactive) {
    return {
      info: writeLine,
      interactive,
      json: (payload) => {
        process.stdout.write(`${JSON.stringify(payload)}\n`);
      },
      step: writeLine,
      stop: (message) => {
        if (message) {
          writeLine(message);
        }
      },
      success: writeLine,
      warn: writeLine,
    };
  }

  const s = spinner();
  let active = false;

  return {
    info(message) {
      if (active) {
        s.stop();
        active = false;
      }
      log.info(message);
    },
    interactive,
    json() {
      // JSON payloads are suppressed in interactive mode.
    },
    step(message) {
      if (active) {
        s.message(message);
      } else {
        s.start(message);
        active = true;
      }
    },
    stop(message) {
      if (active) {
        s.stop(message);
        active = false;
      }
    },
    success(message) {
      if (active) {
        s.stop(message);
        active = false;
      } else {
        log.success(message);
      }
    },
    warn(message) {
      if (active) {
        s.stop();
        active = false;
      }
      log.warn(message);
    },
  };
};
