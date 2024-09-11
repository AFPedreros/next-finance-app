import { z } from "zod";

import { createAccountFormSchema, updateFormSchema } from "../schemas";

export type CreateAccountInputs = z.infer<typeof createAccountFormSchema>;
export type UpdateAccountInputs = z.infer<typeof updateFormSchema>;