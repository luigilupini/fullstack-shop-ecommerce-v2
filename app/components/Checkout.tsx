'use client';

// STRIPE: USING STRIPE OBJECT TO ACCESS PAYMENT API ⭐️
// `loadStripe` function asynchronously loads Stripe.js & initializes a `Stripe`
// object. It takes your Stripe publishable API key as a parameter. The function
// returns a `Promise` which resolves with the Stripe object that allows you to
// interact with the stripe API. We create a instance of a Stripe object so that
// we can process payments in the application. `Elements` are individual & also
// customizable components that collect and validate user input. When creating a
// instance of `Elements` you can pass in `elements.Options` object to configure
// certain aspects of the `Elements` group.
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js';

// STRIPE: ELEMENTS FOR USING CARD ELEMENT ⭐️
// A Elements provider allow you to use Element components and access the Stripe
// object in any nested component. Render this Elements "provider" at a root of
// your React app so that it is available everywhere you need it. Use a Elements
// provider to invoke `loadStripe` with your publishable key. That function will
// asynchronously load a Stripe.js script and initialize a Stripe object.
import { Elements } from '@stripe/react-stripe-js';

import { useCartStore, useThemeStore } from '@/zustand/store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutForm from './CheckoutForm';

import OrderAnimation from './OrderAnimation';
import { motion } from 'framer-motion';

// STRIPE: LOAD STRIPE PROMISE ⭐️
// Since environment variables are server-side constructs, they are not readily
// available on the client-side in a Next app. You can use `publicRuntimeConfig`
// object in the Next config file to expose certain environment variables to the
// client-side. Alternatively, you can also prefix the environment variable with
// `NEXT_PUBLIC_` to make them available in the client browser.

// const promiseOops = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!); // ❌
const promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!); // ✅

// This is a secure way to use variables that you need on the client side, but
// remember to never expose sensitive secrets this way. Stripe publishable key
// is safe to use in the browser, but your secret key should never be exposed.

// STRIPE: WHAT THIS COMPONENT DOES ⭐️
// This component is responsible for loading the stripe library and initializing
// stripe elements for us and additionally it also creates a payment intent for
// us using the payment API route `create-payment-intent`. Either it creates a
// new payment intent or updates a existing one. We use Zustand to manage state
// of the cart and what payment intent stage we are in.
export default function Checkout() {
  // ZUSTAND: CONSUMING THE STORE ⭐️
  const cartStore = useCartStore();
  const themeStore = useThemeStore();

  // Every payment intent contain a `clientSecret`. The client secret is used by
  // the Stripe SDK to confirm the payment intent. Basically a key unique to the
  // individual/payment that Stripe use to track the state of the intent. On the
  // client side on your application, Stipe uses the `clientSecret` as parameter
  // to invoke specific actions or functions in Stripe. Like confirming payment,
  // confirming order, updating order, etc... We use Zustand to manage the state
  // of the cart and what payment intent stage we are in.
  const [clientSecret, setClientSecret] = useState('');
  const [stripeTheme, setStripeTheme] = useState<
    'flat' | 'stripe' | 'night' | 'none'
  >('stripe');

  const router = useRouter();

  // STRIPE: CREATE OR UPDATE A PAYMENT INTENT FOR THE ORDER ⭐️
  // A payment intent is a object that represent your intent to collect payment.
  // It's typically associated with a single purchase or transaction, which may
  // include a batch of multiple items together. Use a effect to either create a
  // new payment intent or update a existing one when the component mounts. This
  // allows customers to change their minds about an order before they pay. For
  // they can add/remove items from their cart. Keep in mind, that if the total
  // amount changes due to changes in the cart, the `PaymentIntent` will need to
  // be updated. In example the `paymentIntent` is managed in a Zustand store.

  // STRIPE: PAYMENT INTENT VS ORDER ⭐️
  // A single PaymentIntent is typically associated with a single purchase or a
  // transaction, rather than an order. But when building store, a user's order
  // includes multiple items, those usually covered by a single PaymentIntent.
  useEffect(() => {
    // THEME: SET MODE HERE
    if (themeStore.mode === 'dark') setStripeTheme('night');
    if (themeStore.mode === 'light') setStripeTheme('stripe');

    // STRIPE: DEFINE AN API ROUTE ⭐️
    // Here we passing our payment data to this API route.
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 👇🏻 We send cart items to a route to create or update a payment intent.
      // We `stringify` cart items because a body of fetch requests must be only
      // be a string or `Blob` object. Zustand we `persist` all  store state to
      // localStorage, so that store state is preserved across page loads.
      body: JSON.stringify({
        items: cartStore.cart,
        // This will be used to update a existing PaymentIntent if provided one.
        // If not provided, a new intent will be created with these items.
        payment_intent_id: cartStore.paymentIntent,
      }),
    })
      .then((res) => {
        // STRIPE: UNAUTHENTICATED USER WILL NAVIGATE TO SIGNIN PAGE ⭐️
        // By using useRouter we can access the query object. If the user is not
        // authenticated, navigate them to the api signin page.
        if (res.status === 403) {
          return router.push('/api/auth/signin');
        }
        // STRIPE: ASSOCIATE CLIENT SECRET WITH PAYMENT INTENT ⭐️
        // Here we condition if the user's not authenticated to return them to our
        // home route/page. Otherwise if logged in, we want to set the new payment
        // intent to a response we get from a Stripe API route. Here we associate
        // the client secret with the payment intent.
        return res.json();
      })
      .then((data) => {
        // STRIPE: ASSOCIATE CLIENT SECRET WITH PAYMENT INTENT ⭐️
        // If logged in, we want to set the new payment intent to a response we
        // get from a our custom payment API route. With a client secret we have
        // the ability to continue with the payment process.
        setClientSecret(data.paymentIntent.client_secret);
        cartStore.setPaymentIntent(data.paymentIntent.id);
      });
  }, []);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: stripeTheme,
      labels: 'floating',
    },
  };

  return (
    <div>
      {clientSecret && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{
            delay: 1,
            type: 'spring',
            duration: 0.5,
          }}
        >
          <Elements options={options} stripe={promise}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        </motion.div>
      )}
      {!clientSecret && <OrderAnimation />}
    </div>
  );
}
