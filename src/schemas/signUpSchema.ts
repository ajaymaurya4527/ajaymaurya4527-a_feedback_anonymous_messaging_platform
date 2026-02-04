import { email, z } from "zod";

export const userNameValidation=z
    .string()
    .min(5,"username must be at least 5 charcter")
    .max(20,"username msut be no more than 20 character")
    .regex(/^[a-zA-Z0-9_]+$/, "username can only contain letters, numbers, and underscores")



export const signUpSchema=z.object({
    username:userNameValidation,
    email:z.string().email({message:"Invalid Email address"}),
    password:z.string().min(6,{message:"Password must be at least 6 characters"})
})
       