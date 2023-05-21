import { NextApiRequest, NextApiResponse } from 'next';

import Stripe from 'stripe';

import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { AddCartType } from '@/types/AddCartType';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Setting the Stripe API version to be used.
  apiVersion: '2022-11-15',
});

const calcOrderAmount = (items: AddCartType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    return acc + item.unit_amount! * item.quantity!;
  }, 0);
  return totalPrice;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // STRIPE: GET USER SESSION INFO FROM NEXTAUTH ⭐️
  // The `getServerSession` function, when called within your API route handler,
  // will return the user's session object if a session exists. The object will
  // contains information about the currently authenticated user, such as their
  // email, name, image, and any other session data you've chosen to return.
  const userSession = await getServerSession(req, res, authOptions);
  // A `userSession` object should contain data about the authenticated user, &
  // provided session details. Unauthenticated users means `userSession` likely
  // contains null or undefined. A exact shape and return values here depend on
  // our (NextAuth) configuration and any custom session implemented.

  if (!userSession?.user) {
    // If no user session, return error message.
    res.status(401).json({ message: 'User not logged in :(' });
    return; // Exit early, stop the api endpoint from running further.
  }

  // STRIPE: EXTRACT PASSED IN DATA FROM BODY ⭐️
  // Our effect hook makes a fetch request to this API route. Our `items` passed
  // in via the request `body` are from our Zustand `cart` store/state.
  const { items, payment_intent_id } = req.body;

  // STRIPE: CREATE ORDER DATA FOR PRISMA ⭐️
  // We are preparing an `orderData` object that represents an Order record.
  const orderData = {
    // A user property is using Prisma `connect` operation to link this `Order`
    // to a `User` record in the database. This assumes that you have a relation
    // set up between the `User` and `Order` models in your Prisma schema.
    user: { connect: { id: (userSession.user as any).id } },
    amount: calcOrderAmount(items),
    currency: 'usd',
    status: 'pending',
    // A 'paymentIntentID' field is the value of `payment_intent_id`. Presumably
    // the ID of the payment intent from a payment processor like stripe.
    paymentIntentID: payment_intent_id,
    // A 'products' field uses Prisma `create` operation to create new Product
    // to record and associate them with this Order. Assuming that you have an
    // relation between the Product and Order models in your Prisma schema. The
    // `create` operation is given an array of product objects, each including
    // product details like name, description, unit_amount, image, & quantity.
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
  // This object can then be used with Prisma client `create` method to create
  // a new `Order` record in your db, along with associated Product records. Note
  // this assumes you have Order & Product models defined in your Prisma schema,
  // with appropriate relations to each other and to the User model. Also assumes
  // you've properly initialized Prisma client & are using it in an asynchronous
  // function, as the Prisma client's `create` method returns a Promise.

  // STRIPE: SAVE ORDER IN PRISMA ⭐️
  // ! AFTER CREATING THE PRISMA ORDER WE SAVE IT HERE (Saving orders chapter)

  // If we signed in and we have a session we return a 200 response!
  res.status(200).json({ userSession });
  return;
}
