// import { authOptions } from "../../../../lib/session";
import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import { connectToDb } from "../../../../lib/mongoose";
import { comparePassword } from "../../../../lib/functions";
import User from "../../../../lib/models/user";

const handler = NextAuth({
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      authorize: async (credentials) => {
        try {
          await connectToDb();
          const user = await User.findOne({ email: credentials?.email });

          if (!user) {
            throw new Error("No user found!");
          }

          const isValid = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password! Try again!");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.log("Error checking");
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({ email: session.user.email });

      session.user.id = sessionUser._id.toString();

      return session;
    },
  },
});

export { handler as GET, handler as POST };
