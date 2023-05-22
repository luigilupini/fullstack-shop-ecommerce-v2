import { NextApiRequest, NextApiResponse } from 'next';

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { AddCartType } from '@/types/AddCartType';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Setting the Stripe API version to be used.
  apiVersion: '2022-11-15',
});

const prisma = new PrismaClient();

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
  // will return the user's session object if a session exists. It contains info
  // about the currently authenticated user, such as their email, name, image, &
  // any other session data you've chosen to include.
  const userSession = await getServerSession(req, res, authOptions);
  // `userSession` object should contain data about authenticated user & provide
  // session details. If no session exist for a user, `userSession` would likely
  // be null or undefined. A exact shape & return value depends on ur (NextAuth)
  // config, & any custom session data you've chosen to include in its callback.

  if (!userSession?.user) {
    // If no user session, return error message.
    res.status(403).json({ message: 'User not logged in :(' });
    return; // Exit early, stop the api endpoint from running further.
  }

  // STRIPE: EXTRACT PASSED IN DATA FROM BODY ⭐️
  // Our effect hook makes a fetch request to this API route. Our `items` passed
  // in via the request `body` are from our Zustand `cart` store/state.
  const { items, payment_intent_id } = req.body;

  // STRIPE: CREATE ORDER DATA FOR PRISMA ⭐️
  // We're preparing a `orderData` object that represents an Order record. This
  // assumes that all relations are properly set up in your Prisma schema, and
  // that creating these records won't violate any constraints in your db.
  const orderData = {
    // A user property is using Prisma `connect` operation to link this `Order`
    // to a `User` record in the database. This assumes that you have a relation
    // set up between the `User` and `Order` models in your Prisma schema. The
    // `connect` operation is going to be given the current signed in user.
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
    // Simply map over items in the `cart` and save it to the database.
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
  // Depending on whether a payment_intent_id is already associated with a order
  // then we can either update the existing order or create a new one.

  // STEP 1: IF PAYMENT INTENT ALREADY EXISTS JUST UPDATE ORDER ⭐️
  // If a payment_intent_id already exists just update the order in Prisma.
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
    // If no payment_intent_id exists we then create a new intent for the order.
    // Note we're enabling automatic payment methods. This means if a customer's
    // payment method doesn't require any further steps (such as 3D Secure auth)
    // then the payment will be completed automatically.
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
