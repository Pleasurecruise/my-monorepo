import { schema } from "./schema.js";

export const env = schema.parse(process.env);
export type { Env } from "./schema.js";
