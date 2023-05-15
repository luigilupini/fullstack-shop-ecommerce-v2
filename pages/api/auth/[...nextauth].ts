// This library allows you to easily add authentication to your Next.js app.
import NextAuth from 'next-auth';
// This is a prebuilt provider for Google OAuth authentication, making it easy
// to integrate Google Sign-In into your app.
import GoogleProvider from 'next-auth/providers/google';
// This adapter allows NextAuth to interact with your database using the Prisma
// ORM (Object-Relational Mapping) library. It works with your `@prisma/client`,
// an auto-generated & type-safe query builder tailored to your db schema.
import { PrismaAdapter } from '@next-auth/prisma-adapter';
// This is the main entry point to your database, allowing you to make queries
// and perform operations on your data via a helpful client API library.
import { PrismaClient } from '@prisma/client';
// Creating a new instance of PrismaClient, which we interact with the database.
const prisma = new PrismaClient();

// NEXTAUTH: PRISMA ADAPTER FOR AUTHENTICATION (STEP 1) ⭐️
// https://authjs.dev/reference/adapter/prisma
// Setup the adapter from our pages/api/auth/[...nextauth].js route file.

// NEXTAUTH: PROVIDERS (STEP 2) ⭐️
// This is the main export from this file. A `NextAuth` function that configures
// your application's authentication. The function takes a object as an argument
// which configures how NextAuth behaves and what features it enables.
export default NextAuth({
  // Here we are passing the `PrismaClient` instance to the PrismaAdapter.
  // This tells NextAuth to use Prisma as its database ORM.
  adapter: PrismaAdapter(prisma),
  // The 'providers' property is an array of all the authentication providers
  // you want to use in your app. These are not necessarily all available providers,
  // but the ones you choose to integrate.
  providers: [
    // https://next-auth.js.org/providers/google
    // Here, we're adding Google as an authentication provider.
    // We're passing an object to GoogleProvider that includes our Google client ID and secret.
    // These are typically stored as environment variables for security reasons.
    // The 'as string' part is a TypeScript type assertion, ensuring that the values are strings.
    // Next.js packages like NextAuth.js can only access environment variables from `.env.local` files.
    // However, Prisma, being a Node.js application, only has visibility of the `.env` files.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // You can add more providers here by following the same pattern...
    // Just import the provider from 'next-auth/providers/{provider-name}', and add it to this array.
  ],
});
