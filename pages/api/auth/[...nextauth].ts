// This library allows you to easily add authentication to your Next.js app.
// https://next-auth.js.org/configuration/nextjs#getServerSession
import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
// This is a prebuilt provider for Google OAuth authentication, making it easy
// to integrate Google Sign-In into your app.
import GoogleProvider from 'next-auth/providers/google';

// NEXTAUTH: PRISMA ADAPTER FOR AUTHENTICATION (STEP 1) ⭐️
// https://authjs.dev/reference/adapter/prisma
// Setup the adapter from our pages/api/auth/[...nextauth].js route file.
// This adapter allows NextAuth to interact with your database using the Prisma
// ORM (Object-Relational Mapping) library. It works with your `@prisma/client`,
// an auto-generated & type-safe query builder tailored to your db schema.
import { PrismaAdapter } from '@next-auth/prisma-adapter';
// This is the main entry point to your database, allowing you to make queries
// and perform operations on your data via a helpful client API library.
import { PrismaClient } from '@prisma/client';
// Creating a new instance of PrismaClient, which we interact with the database.
const prisma = new PrismaClient();

// STRIPE: USING EVENT HANDLERS WITH STRIPE API (STEP 1) ⭐️
import Stripe from 'stripe';

// NEXTAUTH: PROVIDERS (STEP 2) ⭐️
// This is the main export from this file. A `NextAuth` function that configures
// your application's authentication. The function takes a object as an argument
// which configures how NextAuth behaves and what features it enables.
export const authOptions: NextAuthOptions = {
  // Here we are passing the `PrismaClient` instance to the PrismaAdapter.
  // This tells NextAuth to use Prisma as its database ORM.
  adapter: PrismaAdapter(prisma),
  // https://next-auth.js.org/configuration/options#nextauth_secret
  secret: process.env.NEXTAUTH_SECRET,
  // The 'providers' property is an array of all the authentication providers
  // you want to use in your app. These are not necessarily all available providers,
  // but the ones you choose to integrate.
  providers: [
    // https://next-auth.js.org/providers/google
    // Here, we're adding Google as an authentication provider. We're passing an
    // object to `GoogleProvider` that includes our Google client ID and secret.
    // These are typically stored as environment variables for security reasons.
    // A 'as string' part is a type assertion, ensuring that values are strings.
    // Next packages "NextAuth" only access `.env.local` environment variables.
    // However Node.js apps like "Prisma" they only work with `.env` files.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // You can add more providers here by following this pattern. Just import a
    // provider from 'next-auth/providers/{provider-name}' and add it here!
  ],
  // STRIPE: USING EVENT HANDLERS WITH STRIPE API (STEP 2) ⭐️
  // A events property in NextAuth.js is an object that allows you to subscribe
  // to a series of events that occur in a NextAuth.js lifecycle. These "events"
  // could be related to user creation, sign-in, sign-out, session changes, or
  // user creation, among others.  By subscribing to these events, you can write
  // custom code to execute when these events occur. Below, your are subscribing
  // to `createUser` event, which is fired whenever a new user is created:
  events: {
    // A 'createUser' event fired whenever a new user created in ur NextAuth app.
    // An object with 'user' key contains info about the newly created user.
    createUser: async ({ user }) => {
      // console.log('createUser: ', { user });
      // Creating a new instance of the Stripe object with your secret key. Its
      // a payment processing service and this object allows you to interact with
      // their API. A 'as string' part is a TS type assertion ensuring that the
      // value is a string. A `stripe` instance can make various requests toward
      // a Stripe API endpoint. Here `stripe.customers.create({...})` creates a
      // new customer in your Stripe account, for keeping track of their payment
      // data. Remember to handle sensitive data such as Stripe, keep your keys
      // secret. Here we do not expose it in client-side code or version control
      // systems. Instead, environment variables handle them.
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        // Setting the Stripe API version to be used.
        apiVersion: '2022-11-15',
      });
      // If a user has an email and a name, a new customer is created in Stripe.
      // This customer corresponds to the newly created user in your app.
      if (user.email && user.name) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        // STRIPE: UPDATE USER RECORD IN PRISMA ⭐️
        // Update Prisma with the `stripeCustomerId`. The user's corresponding
        // record in the Prisma database is then updated with the ID of a newly
        // created Stripe customer. This allows for easy linking of your users
        // to their Stripe customer info, when handling payments.
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customer.id },
        });
      }
    },
    /* LIST OF OTHER NEXTAUTH EVENT HANDLERS:
    In the `createUser` event handler, you're receiving the newly created user
    object and executing logic which involves interacting with Stripe & updating
    your Prisma database. Here's a list of other events you can subscribe to:

    `signIn`: Fired when a user signs in.
    `signOut`: Fired when a user signs out.
    `createUser`: Fired when a new user is created.
    `updateUser`: Fired when a user is updated.
    `createSession`: Fired when a session is created.
    `updateSession`: Fired when a session is updated.
    `deleteSession`: Fired when a session is deleted.
    `error`: Fired when an error occurs.

    Each event handler receives different arguments related to the event. For
    example, the createUser event handler receives an object containing the newly
    created user, while the signIn event handler receives the user, account, and
    profile related to the sign-in event. */
  },
  // STRIPE: UPDATE SESSION CALLBACK ⭐️
  // A `callbacks` property in NextAuth is a object that allows you to hook into
  // various events in the NextAuth.js lifecycle. These `callbacks` are invoked
  // when certain events occur. Here we are subscribing to a `session` callback.
  // This callback invoked whenever NextAuth.js needs current session data. For
  // instance, during sign in or when `getSession` & `useSession` are called in
  // your Next application, example Checkout component calls our create payment
  // intent api route the returns this session info. By providing this callback,
  // we modify the session object that's usually returned by NextAuth. Here, we
  // adding info with req and res data from our Checkout using that route.
  callbacks: {
    // Needed info is passed in from `pages/api/create-payment-intent.ts` route.
    async session({ session, token, user }) {
      session.user = user;
      return session;
    },
  },
};

export default NextAuth(authOptions);
