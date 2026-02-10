import NextAuth from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions);//msut be with same name
export { handler as GET, handler as POST };