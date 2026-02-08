import { z } from "zod";

export const signInSchema=z.object({
    identifier:z.string(),//identifer=email
    password:z.string()
})