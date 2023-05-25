## Fullstack ecommerce app with Next 13

> Demonstrating a Next 13 application with Prisma, Postgres, Stripe, Tailwind,
> Daisy UI, Zustand and more.

![alt text](./docs/capture-1.png 'Home Route')

Featuring:

- Prisma indeed is a database toolkit for Node.js and TypeScript that simplifies
  the process of querying, migrating, and modeling your database.

Object-Relational Mapping (ORM) tool that provides an abstraction over your db,
allowing you to interact with it in a more intuitive and type-safe way.

Quick start: https://www.prisma.io/docs/getting-started/quickstart

This project makes use of Prisma, a modern Object-Relational Mapping (ORM) and
db toolkit for TypeScript and Node. It provides a intuitive way to interact with
the database via JavaScript, offering robust features like migrations & advanced
query capabilities. Prisma primarily supports PostgreSQL, MySQL, SQLite, and SQL
Server. The database is defined using Prisma's `schema` definition language.

- **Directory Structure**: This project's Prisma configuration is stored in the
  `/prisma` folder, which contains the `schema.prisma` file. The `schema.prisma`
  file defines the db structure using Prisma's db schema definition language.

- **Configuring Connection**: A connection is configured via a `datasource db`
  in `schema.prisma`. A `provider` attribute specifies the type of db used (e.g,
  postgresql, mysql, sqlite, sqlserver). The `url` attribute is a connection URL
  that points to the database and is typically stored environment variable.

- **Prisma Client Generator**: A Client is configured in the `generator` block.
  The `provider` attribute instructs Prisma to generate a Prisma Client in JS,
  which allows for type-safe database access.

- **Database Models**: DB models are defined in the `model` blocks. Each model
  corresponds to a table in the database, and each field in a model represents a
  column in the table. Relationships between models can also be defined here. In
  example, in the `User` model, `Account[]`, `Session[]`, `Order[]` represent a
  one-to-many relationships with their respective models.

- **Database Migration**: After defining models, you synchronize your database
  with the defined models by running the command `npx prisma migrate dev`. This
  command generates SQL migration files and applies them to the database. The
  connection string for your database should be specified in the `DATABASE_URL`
  environment variable. Railways hosts the online database.

- **NextAuth Integration**: The project uses NextAuth for authentication, with
  a Prisma adapter that enables NextAuth to store session and user info in your
  db using Prisma. A adapter configured in `pages/api/auth/[...nextauth].ts`.

For a detailed walkthrough, refer to the in-line comments in the `schema.prisma`
file. Please remember not to commit sensitive information such as database
connections or other secrets to version control systems.

```prisma
// PRISMA: CREATE FOLDER STRUCTURE MANUALLY ⭐️
// Rather than running `npx prisma init` command, you can also manually create a
// folder structure. This might be beneficial if you want more granular control
// over the initialization process. You should create a new folder name 'prisma'
// in your project root, and in this folder, create a new file `schema.prisma`.

// PRISMA: DEFINE YOUR DATA SOURCE AND GENERATOR ⭐️
datasource db {
  // Specifies a database provider (e.g., postgresql, mysql, sqlite, sqlserver).
  provider = "postgresql"
  // Connection URL to a database, stored in environment variable for security.
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// PRISMA: DEFINE YOUR DATABASE MODELS ⭐️
model User {
  id String @id @default(cuid())
  name String?
  email String? @unique
  emailVerified DateTime?
  image String?
  stripeCustomerId String?

  // 👇🏻 One-to-many relationship
  accounts Account[]
  sessions Session[]
  orders   Order[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  // 👇🏻 Many-to-one relationship
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  // 👇🏻 Many-to-one relationship
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Order {
  id              String    @id @default(cuid())
  // 👇🏻 Many-to-one relationship
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  amount          Float
  currency        String
  status          String
  createdDate     DateTime  @default(now())
  paymentIntentID String?   @unique
  // 👇🏻 One-to-many relationship
  products        Product[]
}

model Product {
  id          String  @id @default(cuid())
  name        String
  description String?
  unit_amount Float
  image       String?
  quantity    Float   @default(0)
  // 👇🏻 One-to-many relationship
  orders      Order[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// PRISMA: SYNC YOUR MODELS WITH THE DATABASE (MIGRATE) ⭐️
// After defining your models, run `npx prisma migrate dev` cmd to synchronize
// your models with the actual db structure. This cmd generates (SQL migration)
// files & applies them to the db. Remember to specify the connection string for
// your db in the DATABASE_URL environment variable.

// In other words, to sync your models with the db (i.e. create the db tables),
// run `npx prisma migrate dev` cmd in your terminal. This generates & executes
// the necessary SQL migration files. Remember `DATABASE_URL` is and environment
// variable that should point to your actual database hosted in this case on an
// online service like railway.app 🚃.

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// npx prisma migrate dev
// Environment variables loaded from .env
// Prisma schema loaded from prisma/schema.prisma
// Datasource "db": PostgreSQL database "railway", schema "public" at
// "containers-us-west-96.railway.app:7035"

// ✔ Enter a name for the new migration: … added my todo model
// Applying migration `20230515104242_added_my_todo_model`

// Following migration(s) have been created and applied from new schema changes:

// migrations/
//   └─ 20230515104242_added_my_todo_model/
//     └─ migration.sql

// Your database is now in sync with your schema.

// ✔ Generated Prisma Client (4.14.0 | library) to ./node_modules/@prisma/client
// in 108ms
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

We use prisma to create the db schema, and to generate client code to interact
with the database. We docs/capture next-auth users with associated stripe events. We
make use of a `PrismaClient` single instance via `prisma/prisma.ts`. Example:

```ts
// Update existing order with new products.
const updated_order = await prisma.order.update({
  where: { id: existing_order?.id },
  data: {
    amount: calcOrderAmount(items),
    products: {
      deleteMany: {},
      create: items.map((item: any) => ({
        name: item.name,
        description: item.description || null,
        unit_amount: parseFloat(item.unit_amount),
        image: item.image,
        quantity: item.quantity,
      })),
    },
  },
});
```

`PrismaClient` is mostly used in our API routes, but can also be used in a React
component directly. The client is used to perform CRUD operations in our db. For
more info, see `pages/api` folder and endpoints.

- Zustand is a lightweight and straightforward state management library for
  React. It provides a simple API to create and manage global application state,
  making it easy to share data across your application's components without
  using a more complex solution like Redux.

The store is created in `zustand/store.ts` and is used throughout the app. The
core of Zustand is the store, which holds your application's state. To create a
store, import Zustand and use the `create` function that takes a setup function
that returns the store's (INITIAL STATE), and any (ACTIONS).

```ts
const setupFunction = (set: SetState, get: GetState): CartStateType => ({
  // INITIAL STATE
  cart: [],
  isOpen: false,
  paymentIntent: '',
  onCheckout: 'cart',
  // ACTIONS
  toggleCart: () => {
    set((state) => {
      return { ...state, isOpen: !state.isOpen };
    });
  },
  // Adding is simpler to map through the cart items and increment the quantity
  // if the item exists, or else we add the item at the end of the array.
  addProduct: (item) => {
    set((state) => {
      const itemExists = state.cart.find((cartItem) => cartItem.id === item.id);
      // If the item exists in the cart, we want to update the quantity.
      if (itemExists) {
        return {
          ...state, // 👈🏻 spread existing state
          // If the item already exists in the cart, increment its quantity
          cart: state.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity! + 1 }
              : // Otherwise return the item as is (no change)
                cartItem
          ),
        };
      }
      // If the item does not exist in the cart, add it with quantity 1
      return {
        ...state, // 👈🏻 spread existing state
        cart: [...state.cart, { ...item, quantity: 1 }],
      };
    });
  },
  removeProduct: (item) => {
    set((state) => {
      const itemExists = state.cart.find((cartItem) => cartItem.id === item.id);
      // If the item exists in the cart and its quantity is greater than 1, we
      // want to decrement the quantity.
      if (itemExists && itemExists.quantity! > 1) {
        return {
          ...state, // 👈🏻 spread existing state
          cart: state.cart.map(
            (cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity! - 1 }
                : cartItem // All other items are added and remain unchanged :)
          ),
        };
      } else {
        // Otherwise, else if the item exists in the cart and its quantity is 1
        // or less, we want to remove the item from the cart.
        return {
          ...state, // 👈🏻 spread existing state
          cart: state.cart.filter((cartItem) => cartItem.id !== item.id),
        };
      }
    });
  },
  setPaymentIntent: (value) => {
    set((state) => {
      return { ...state, paymentIntent: value };
    });
  },
  setCheckout: (value) => {
    set((state) => {
      return { ...state, onCheckout: value };
    });
  },
  clearCart: () => {
    set((state) => {
      return { ...state, cart: [] };
    });
  },
});

// ZUSTAND: CREATING STORE (STEP 1) ⭐️
// The `useCartStore` creates Zustand store that is used to manage state of the
// shopping cart. The "store" is created with an initial state. Specifically the
// `persist` function takes the state setup function (or configuration object),
// which includes both the `setupFunction` initial state and any actions, and an
// options object. The `set` function is used to update the state, is passed to
// the state setup function, not to persist directly.
export const useCartStore = create(persist(setupFunction, options));
```

Here is a summary of the `setupFunction` for your Zustand `cartStore`:

- **Initial State**: A initial state of the `cartStore` includes an empty array
  for the cart, `isOpen` set to false (it represents whether the cart is open or
  not), an empty string for the `paymentIntent` (presumably representing intent
  to make a payment), and 'cart' as the value for `onCheckout` (representing the
  current step in the checkout process).

- **Actions**: Are functions that can be used to update state of `cartStore`.

  - `toggleCart`: toggles `isOpen` state, effectively opening or closing the cart.

  - `addProduct`: takes an item as an argument and adds it to the cart. If item
    is already in the cart, it increases its quantity by 1. Otherwise, it adds
    the item to the cart with a quantity of 1.

  - `removeProduct`: takes an item as an argument and removes it from the cart
    or decreases its quantity. If the item is in the cart and its quantity is
    greater than 1, it decreases the item's quantity by 1. Otherwise, if the
    item's quantity is 1 or less, it removes the item from the cart.

  - `setPaymentIntent`: takes value as an argument and sets the `paymentIntent`
    to that value.

  - `setCheckout`: takes a value as an argument and sets the `onCheckout` to that value.

  - `clearCart`: clears the cart by setting `cart` to an empty array.

All of these functions we avoid mutation of current state directly as we spread
out before updating specific properties. This is a good practice as it keeps the
state updates immutable, meaning it doesn't change the existing state directly
but creates a new state with the desired changes.

A important process in React is to keep your state data immutable as it helps to
prevent bugs & makes ur code more predictable. Because no two JS objects `state`
are the same, we need to return "new" JS object state with the desired changes.
Remember, if you modify an object directly, it will be the same object in memory
and React will not re-render the component, as JS objects are reference types!

Best practices for using Zustand include:

Centralized State: Zustand can manage all of your state in a single store making
your code more maintainable and easier to test. However, multiple stores can be
created if required by your application's architecture.

Immutable State: Although Zustand does'nt enforce immutability, a good practice
is to treat your state immutable to prevent bugs & make your code predictable.

Middleware: Zustand supports middleware to add extra functionality to your store
and you can add logging, handling side effects, or even introduce immutability
with libraries like Immer or Immutability Helper.

State Persistence: Zustand provides a `persist` middleware to save and load your
store's state from a storage location like localStorage, IndexedDB, or any other
location that supports serializing JS objects.

Testing: Zustand's stores can be tested to ensure consistent state. Jest or any
other testing framework can be used depending on your preference and specifics
of your project architecture and requirements.

Don't get confused with `persist`. Zustand the `create` function usually takes a
setup function, which receives a `set` function as an argument that you can use
to update the state. But when using the `persist` middleware, `create` function
is called with no arguments, and instead the setup function passed to `persist`.

Here's how the pieces fit together:

1. The `persist` function takes two arguments: setup function & options object.

2. The setup function is similar to what you would normally pass to `create`.
   It receives a `set` function that you can use to update the state.

3. A options object allows you to configure how `persist` middleware works and
   includes options like storage key name (`name`) & storage method (`getStorage`).

We really calling `create` with the result of `persist(setupFunction, options)`.
`persist` function wraps our "setup function" adding persistence functionality,
and returns a new setup function that `create` can use to create the store.

Here's how it looks:

```javascript
import create from 'zustand';
import { persist } from 'zustand/middleware';

// This is the setup function that you pass to `persist`.
const setupFunction = (set) => ({
  // Initial state
  cart: [],
  isOpen: false,
  // Action
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
});

// These are the options for `persist`.
const options = { name: 'cart-store' };

// `persist` wraps around your setup function and returns a new setup function.
const persistedSetupFunction = persist(setupFunction, options);

// `create` uses the persisted setup function to create the store.
export const useCartStore = create(persistedSetupFunction);
```

This code is equivalent to your original code, but it separates each step into
its own line to make it clearer what's happening. I hope this helps clarify how
`persist` and `create` work together in Zustand!

To consume the store, we use the `useCartStore` hook. This hook returns state
and actions, and will re-render the component when the state changes.

```tsx
// ZUSTAND: CONSUMING STORE (STEP 2) ⭐️
function Cart() {
  // The `useCartStore` hook returns state and actions, and will re-render the
  // component when the state changes. The `useCartStore` hook is used to access
  // the state and actions of the store. The `useCartStore` hook returns state
  // and actions, and will re-render the component when the state changes.
  const { cart, isOpen, toggleCart } = useCartStore();

  return ( ...
  );
}
```

For more information, see the store `zustand/store.ts`.

- Hydration component prevents client-specific code from running on the server
  and causing a mismatch between pre-rendered server-rendered & client-rendered
  markup. It does this by rendering its `children` (client-specific code) only
  after the component has "mounted" on the client (i.e. after hydration).

```tsx
export default function Hydration({ children }: Props) {
  const [isHydrated, setIsHydrated] = useState(false);
  const themeStore = useThemeStore();
  // Wait until Next.js completed hydration before rendering `children`:
  useEffect(() => setIsHydrated(true), []);
  // If hydration is complete, render `children`. If not render loading status.
  // Ensuring a `children` prop (which may depend on client-side state/library)
  // are only rendered "committed" on the client, preventing hydration errors,
  // once the component has "mounted" using our effect hook, on the client.
  return (
    <>
      {!isHydrated ? (
        <body className="flex items-center justify-center w-full h-full">
          <code className="px-3 py-2 text-lg rounded-md bg-base-200">
            Loading...
          </code>
        </body>
      ) : (
        <body data-theme={themeStore.mode} className="px-4 lg:px-48 font-karla">
          {children}
        </body>
      )}
    </>
  );
}
```

Because our Zustand implementation is a client-side state management library,
we use this component to prevent Zustand-related state (like a `isOpen` state
of the cartStore) from causing hydration errors if they don't sync up.

- NextAuth provides us with a session object that contains the user's session
  information. This object is visible to both server and client-side code, so we
  can use it to determine if the user is logged in or not. For more details, see
  the `pages/api/auth/[...nextauth].ts` API route.

```ts
export const authOptions: NextAuthOptions = {
  // Here we are passing the `PrismaClient` instance to the PrismaAdapter.
  // This tells NextAuth to use Prisma as its database ORM.
  adapter: PrismaAdapter(prisma),
  // https://next-auth.js.org/configuration/options#nextauth_secret
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // https://next-auth.js.org/providers/google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // STRIPE: USING EVENT HANDLERS WITH STRIPE API (STEP 2) ⭐️
  events: {
    createUser: async ({ user }) => {
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
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customer.id },
        });
      }
    },
  },
  // STRIPE: UPDATE SESSION CALLBACK ⭐️
  callbacks: {
    // Needed info is passed in from `pages/api/create-payment-intent.ts` route.
    async session({ session, token, user }) {
      session.user = user;
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

This file is the main configuration for NextAuth.js in your application, and it
is responsible for setting up user authentication, managing user sessions, and
integrating with external services like Google and Stripe. Here's a summary:

1. The file imports necessary libraries and modules, including NextAuth.js, a
   prebuilt Google OAuth provider, the Prisma Adapter for NextAuth.js, the
   Prisma client from your local file, and the Stripe library.

2. Then we setup a main `NextAuth` function with an options object `authOptions`
   so that the function configures how authentication will work in our app.

3. The `authOptions` include the following configurations:

   - `adapter`: Configures NextAuth to use Prisma as its db ORM, using Prisma Adapter.

   - `secret`: The NextAuth.js secret which is used for encrypting cookies and tokens.

   - `providers`: Configures Google as an auth provider with your Google client ID and secret.

   - `events`: An object that details the subscribing of events in a NextAuth
     lifecycle. Here it listens to the `createUser` event to create a new Stripe
     customer whenever a new user is created in your app and updates the user
     record in your Prisma database with the new Stripe customer ID.

   - `callbacks`: Allows modifying certain behaviors of NextAuth. Here it's used
     to add user data to a session object, whenever a session's created or accessed.

4. Lastly we exports the configured `NextAuth` function as the default export.
   The function will be called with `authOptions` when the Next.js API route
   associated with NextAuth (usually `[...nextauth].js`) is hit.

In summary, this file orchestrates how authentication is handled in your app,
integrating Google for user authentication, Prisma for data storage, and Stripe
for customer management. It also provides a way to handle various authentication
events, allowing you to customize behavior to suit your app's specific needs.

- Checkout is handled by interaction with our Stripe API. The Stripe API is
  called from the `pages/api/create-payment-intent.ts` API route.

```ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // STRIPE: GET USER SESSION INFO FROM NEXTAUTH ⭐️
  const userSession = await getServerSession(req, res, authOptions);

  if (!userSession?.user) {
    // If no user session, return error message.
    res.status(403).json({ message: 'User not logged in :(' });
    return; // Exit early, stop the api endpoint from running further.
  }

  // STRIPE: EXTRACT PASSED IN DATA FROM BODY ⭐️
  const { items, payment_intent_id } = req.body;

  // STRIPE: CREATE ORDER DATA FOR PRISMA ⭐️
  const orderData = {
    user: { connect: { id: (userSession.user as any).id } },
    amount: calcOrderAmount(items),
    currency: 'usd',
    status: 'pending',
    paymentIntentID: payment_intent_id,
    products: {
      create: items.map((item: any) => ({
        name: item.name,
        description: item.description || null,
        unit_amount: parseFloat(item.unit_amount),
        image: item.image,
        quantity: item.quantity,
      })),
    },
  };

  // STRIPE: UPDATING ORDERS OR CREATING NEW INTENT ⭐️
  // STEP 1: IF PAYMENT INTENT ALREADY EXISTS JUST UPDATE ORDER
  if (payment_intent_id) {
    const current_intent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );
    // If payment_intent_id exists update current order from Stripe.
    if (current_intent) {
      const updated_intent = await stripe.paymentIntents.update(
        payment_intent_id,
        { amount: calcOrderAmount(items) }
      );
      // Fetch existing order from Prisma associated with payment_intent_id.
      const existing_order = await prisma.order.findFirst({
        where: { paymentIntentID: updated_intent.id },
        include: { products: true },
      });

      // If no order found, return error message response.
      if (!existing_order) {
        res.status(404).json({
          message: 'Oops no order or invalid payment intent :(',
          currentIntent: current_intent,
          existingOrder: existing_order,
        });
        return;
      }

      // Update existing order with new products.
      const updated_order = await prisma.order.update({
        where: { id: existing_order?.id },
        data: {
          amount: calcOrderAmount(items),
          products: {
            deleteMany: {},
            create: items.map((item: any) => ({
              name: item.name,
              description: item.description || null,
              unit_amount: parseFloat(item.unit_amount),
              image: item.image,
              quantity: item.quantity,
            })),
          },
        },
      });
      // If order updated then return success message response.
      res.status(200).json({
        message: 'Order updated successfully!',
        paymentIntent: updated_intent,
        order: updated_order,
      });
      return;
    }
  } else {
    // STEP 2: CREATING NEW ORDER IF PAYMENT INTENT DOESN'T EXIST ⭐️
    const new_payment_intent = await stripe.paymentIntents.create({
      amount: calcOrderAmount(items),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    // Update earlier defined orderData object with a new payment_intent_id!
    orderData.paymentIntentID = new_payment_intent.id;
    const newOrder = await prisma.order.create({
      data: orderData,
    });
    // STRIPE: RETURN PAYMENT INTENT ID ⭐️
    res
      .status(200)
      .json({ paymentIntent: new_payment_intent, order: newOrder });
    return;
  }
}
```

![alt text](./docs/capture-2.png 'Checkout and Payment Intent Creation')

This code provides a API route handler for creating or updating a Stripe Payment
Intent and an associated order in the Prisma database. It is primarily used to
process e-commerce transactions in the app.

It first uses a `getServerSession` function from NextAuth to fetch user session
details. If a user session doesn't exist, it sends an error message and ends the
process early. Otherwise, it continues to the next step.

The handler then extracts order items and an existing payment intent ID (if any)
from the request `body`. It calculates a total order amount by iterating through
the items, each consisting of a unit price & quantity.

For Prisma, an `orderData` object is prepared with details like the user who is
placing the order, total amount, currency, status, and the ID of the payment
intent from Stripe. It also includes product details for each item.

If payment intent ID exists, the handler will retrieve the existing intent from
Stripe and update an order's amount. It also updates the associated order in the
Prisma database by replacing the old products with the new ones.

But if no payment intent ID exists, a new payment intent is created on Stripe.
The `orderData` object is then updated with the new payment intent ID, and a new
order is created in the Prisma database.

In both cases, the final response includes the payment intent from Stripe and
the order from Prisma, whether updated or newly created.

"This API route is an integral part of processing payments and maintaining an
up-to-date order information in your application."

- Our UI changes and reflect the `onCheckout` store state status of our order.
  We use Zustand to manage and updated this part of the store, the order details
  and the payment intent ID process we are in. `<Cart>` has buttons that change
  the `onCheckout` state between "cart" and "checkout" and the `<CheckoutForm>`
  that has a side effect if the payment is is status of "success".

![alt text](./docs/capture-3.png 'Dashboard Route')

- Our order status in our Prisma database is updated to "completed" from being
  set to "pending" when the payment is successful. A Stripe Webhook endpoint is
  used to update the database order status in our Prisma via `update` method. A
  `api/webhooks` route/endpoint listens for specific Stripe events.

```ts
import Stripe from 'stripe';

// PRISMA: BEST PRACTICE FOR INSTANTIATING PRISMA CLIENT WITH NEXT.JS ⭐️
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/prisma/prisma';
// We need to instantiate a new Prisma client to update the order status. Notice
// that the objective of this webhook is to update the `order` status in our db.
// We use the `update` method from Prisma to update the order status.

import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';

// Required to disable body parser, otherwise we get an error from Stripe.
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});
// STRIPE: USING WEBHOOKS TO UPDATE ORDER STATUS ⭐️
// https://stripe.com/docs/payments/handling-payment-events#build-your-own-webhook
// We create a webhook endpoint to listen for events from Stripe `api/webhooks`
// Stripe CLI allows us to test webhook locally running: `stripe listen` & then
// forwarding to `--forward-to localhost:3000/api/webhooks`. We can also use the
// Stripe dashboard to test webhooks. Once our order is pending, our hook 🪝 is
// triggered & updates us when the order status is "complete".
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // EXPLAIN BUFFER AND STRIPE SIGNATURE ⭐️
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) return res.status(400).send('Missing the stripe signature');

  // STRIPE: VERIFYING WEBHOOK EVENTS ⭐️
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send('Webhook error' + err);
  }
  // STRIPE: HANDLING INCOMING WEBHOOK EVENTS ⭐️
  // A 'switch' statement used to perform different actions based on different
  // conditions, that being handle different types of Stripe events. If a event
  // type matches a case, the code within that case statement is executed.
  switch (event.type) {
    // 1) CASE: PAYMENT INTENT CREATED
    case 'payment_intent.created':
      const paymentIntent = event.data.object;
      console.log('Payment intent was created');
      break;
    // 2) CASE: UPDATE ORDER STATUS TO "COMPLETE"
    case 'charge.succeeded':
      const charge = event.data.object as Stripe.Charge;
      if (typeof charge.payment_intent === 'string') {
        const order = await prisma.order.update({
          where: { paymentIntentID: charge.payment_intent },
          data: { status: 'complete' },
        });
      }
      break;
    default:
      console.log('Unhandled event type:' + event.type);
  }
  // STRIPE: ACKNOWLEDGING WEBHOOK EVENTS ⭐️
  res.json({ received: true });
}
```

The provided code is for a webhook endpoint in Next.js that listens for events
from Stripe to update an order's status in the Prisma's database. It primarily
uses the Stripe Node.js library and Prisma for interacting the database.

1. Import the necessary modules: You're importing Stripe and Prisma to handle
   payments and database operations respectively. The `buffer` function from
   `micro` library is used to get the raw body of the request, necessary for
   Stripe's signature verification.

2. Stripe Initialization: You're initializing the Stripe library with the API
   version and secret key obtained from the environment variables.

3. Export handler: The async function `handler` is exported as default, which
   will handle incoming requests from the webhook at Stripe. It's configured to
   disable body parsing (`api.bodyParser: false`) to handle raw request data.

4. Signature Verification: In the handler function, the raw `body` of a request
   and Stripe's signature header are used to construct a verified Stripe event.
   If signature is missing or the event couldn't be constructed, an error
   response is sent back to Stripe.

5. Handle Different Stripe Events: A `switch` statement handles various Stripe
   event types. A `'payment_intent.created'` event it logs that a payment intent
   was created. On `'charge.succeeded'`, will update the corresponding order in
   your database from 'pending' to 'complete' using Prisma's `update` method.

> A `/dashboard` route/page that will fetch and display our Prisma order status.

6. Acknowledge Webhook Event: Finally, an acknowledgement response is sent back
   to Stripe to confirm the event was received. This is important as Stripe will
   continue to attempt delivery (3 days) if no response is received successful.

This webhook is designed to be used with Stripe CLI for local testing or can be
deployed on your production server to handle real events. Remember to keep your
secret keys secure and handle any errors appropriately.

![alt text](./docs/capture-4.png 'Local Stripe CLI or Remote Webhook')

In production, you'll need to configure your webhook endpoint in the Stripe. You
can do this in the Stripe dashboard under the "Developers" section.

![alt text](./docs/capture-5.png 'Remote Webhook Configuration')

- When pushing the build to Vercel, you'll need to add the environment variables
  to the Vercel dashboard. You can do this by going to the "Settings" tab and
  then "Environment Variables" section. Amend `STRIPE_WEBHOOK_SECRET` to the new
  remote webhook secret and your `NEXTAUTH_URL` to the new Vercel URL.

![alt text](./docs/capture-6.png 'Vercel Environment Variables')

Lastly you will need to update your Google OAuth credentials to include the new
Vercel URL. Open your Google Cloud Platform console and update the "Authorized
redirect URIs" setting to your new callback API route, your Vercel instance. You
can find this in the "Credentials" section under "OAuth 2.0 Client IDs". Do the
same for the "Authorized JavaScript origins" as well.

![alt text](./docs/capture-7.png 'Google OAuth Credentials')

Dependencies:

```json
"dependencies": {
  "@lottiefiles/react-lottie-player": "^3.5.2",
  "@next-auth/prisma-adapter": "^1.0.5",
  "@prisma/client": "^4.12.0",
  "@stripe/react-stripe-js": "^1.16.5",
  "@stripe/stripe-js": "^1.46.0",
  "@types/node": "18.15.3",
  "@types/react": "18.0.28",
  "@types/react-dom": "18.0.11",
  "daisyui": "^2.51.5",
  "framer-motion": "^10.6.1",
  "micro": "^10.0.1",
  "next": "13.2.4",
  "prisma": "^4.12.0",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-icons": "^4.8.0",
  "stripe": "^11.11.0",
  "ts-node": "^10.9.1",
  "typescript": "5.0.2",
  "zustand": "^4.3.3"
},
```

Regards, <br />
Luigi Lupini <br />
<br />
I ❤️ all things (🇮🇹 / 🛵 / ☕️ / 👨‍👩‍👧)<br />
