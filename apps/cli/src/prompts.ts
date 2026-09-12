import { isCancel as clackIsCancel } from "@clack/prompts";

/**
 * `@clack/prompts` resolves to `T | symbol`, but its own `isCancel` narrows to
 * `typeof CANCEL_SYMBOL` — a `unique symbol`. Excluding one unique symbol from
 * the wide `symbol` leaves `symbol`, so the negative branch never narrows to
 * `T`. Re-type the guard against the `symbol` the prompts actually return.
 */
export const isCancel = (value: unknown): value is symbol =>
  clackIsCancel(value);
