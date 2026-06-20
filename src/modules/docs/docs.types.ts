import type { infer as Infer } from "zod";

import type { openApiSpecSchema } from "./docs.schema.js";

export type OpenApiSpec = Infer<typeof openApiSpecSchema>;
