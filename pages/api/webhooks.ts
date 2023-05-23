import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';

// Required to disable body parser, otherwise we get an error from Stripe.
export const config = {
  api: {
    bodyParser: false,
  },
};
// We need to instantiate a new Prisma client to update the order status. Notice
// that the objective of this webhook is to update the `order` status in our db.
// We use the `update` method from Prisma to update the order status.
const prisma = new PrismaClient();

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
  // A 'buffer' method from 'micro' library to get the raw body of the request.
  // This is necessary because Stripe sends event data in the `body` in its raw
  // form, and also sends a 'stripe-signature' in the headers. The signature is
  // used when payload generated has our webhook's signing secret. Both the raw
  // body & signature verify that the events are sent by Stripe.
  const buf = await buffer(req);
  // When Stripe sends your server a webhook event, it includes a signature in
  // the `Stripe-Signature` header. This signature is created by using a secret
  // (webhook endpoint signing secret) to sign the payload (raw HTTP body). This
  // signature allows your server to verify a event was indeed sent by Stripe.
  const sig = req.headers['stripe-signature'];

  if (!sig) return res.status(400).send('Missing the stripe signature');

  // STRIPE: VERIFYING WEBHOOK EVENTS ⭐️
  // A 'event' variable will store a `event` object that we get from Stripe API.
  // The event object contains all necessary info about what just happened, i.e.
  // including the type of event and the data associated with the event.
  let event: Stripe.Event;
  // The 'try-catch' block is used to handle any errors that might occur when we
  // call 'stripe.webhooks.constructEvent'. It "constructs" a event object from
  // a raw HTTP body `buffer`, a signature header, and a secret. Its mainly used
  // in the context of receiving and verifying "webhook" events from Stripe. It
  // takes three arguments: 1) payload: A raw HTTP body of the request. Usually
  // obtained by reading the incoming HTTP request's body raw not parsed into a
  // JS object. 2) header: The contents of the Stripe-Signature header from the
  // incoming HTTP request. `constructEvent` returns the parsed event object if
  // the signature verification passes, meaning the event can be trusted!
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
    // Here it means a new payment intent is created on Stripe. In this case, we
    // are simply logging that fact to the console.
    case 'payment_intent.created':
      const paymentIntent = event.data.object;
      console.log('Payment intent was created');
      break;
    // 2) CASE: UPDATE ORDER STATUS
    // Here a charge was just made at Stripe and it succeeded. In this case, we
    // update the corresponding order in our db from "pending" to "complete". We
    // use the `where` argument from Prisma to find the order by its payment ID.
    // We use the extracted `charge` object to get the payment intent ID, which
    // is the same as the payment intent ID we stored in our db when we created
    // the order. We use the `update` method to update the order status.
    case 'charge.succeeded':
      const charge = event.data.object as Stripe.Charge;
      if (typeof charge.payment_intent === 'string') {
        const order = await prisma.order.update({
          where: { paymentIntentID: charge.payment_intent },
          data: { status: 'complete' },
        });
      }
      break;
    // If the event type doesn't match any of the cases we prepared, we simply log
    // the event type to the console.
    default:
      console.log('Unhandled event type:' + event.type);
  }
  // STRIPE: ACKNOWLEDGING WEBHOOK EVENTS ⭐️
  // Send `res` response back to Stripe servers acknowledging successful receipt
  // of the webhook event. Importantly, because Stripe will continue to attempt
  // delivery for up to 3 days & if it doesn't receive a success response (HTTP
  // status codes 200-299). By sending response, we're letting Stripe know that
  // we successfully received the event so it doesn't need to continue retrying.
  // Note: this doesn't necessarily mean we've fully processed the event. If the
  // event's processing is time-consuming, consider handling it async to ensure
  // this acknowledgement is sent back to Stripe promptly.
  res.json({ received: true });
}
