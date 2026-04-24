import { z } from "zod";

export const IdSchema = z.string().uuid();
export type Id = z.infer<typeof IdSchema>;

export const SlugSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(/^(?!-)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);
export type Slug = z.infer<typeof SlugSchema>;

export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;

export const UrlSchema = z.string().url();
export type Url = z.infer<typeof UrlSchema>;

export const HostnameSchema = z.string().min(1);
export type Hostname = z.infer<typeof HostnameSchema>;

export const PathSchema = z.string().min(1);
export type Path = z.infer<typeof PathSchema>;
