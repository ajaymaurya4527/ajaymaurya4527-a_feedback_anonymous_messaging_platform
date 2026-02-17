import {z} from "zod";


// Zod Schema for validation
export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" })
    .max(300, { message: "Content must be less than 300 characters" })
});