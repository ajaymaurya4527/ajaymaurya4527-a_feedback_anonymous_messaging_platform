import {z} from "zod";

export const messageSchema=z.object({
    content:z.string().min(10,{message:"contant must be atleast 10 character"}).max(300,{message:"contant must be less than 300 character"})
})