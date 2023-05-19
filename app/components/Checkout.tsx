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
import { loadStripe } from '@stripe/stripe-js';

// STRIPE: ELEMENTS FOR USING CARD ELEMENT ⭐️
// Our `react-stripe-js` library provides a set of React components `Element` to
// facilitate integration with the sStripe API. By using `loadStripe`, we async
// load and initialize a Stripe object. The Promise returned by `loadStripe` is
// passed as a prop to the `Elements` provider. This way, any descendants of our
// Elements context in our component tree has access to the Stripe instance once
// the Promise resolves.
import { Elements } from '@stripe/react-stripe-js';

import { useCartStore } from '@/zustand/store';
import { useEffect, useState } from 'react';

// STRIPE: LOAD STRIPE PROMISE ⭐️
// Since environment variables are server-side constructs, they are not readily
// available on the client-side in a Next app. You can use `publicRuntimeConfig`
// object in the Next config file to expose certain environment variables to the
// client-side. Alternatively, you can also prefix the environment variable with
// `NEXT_PUBLIC_` to make them available in the client browser.
// 👇🏻 This might not work on the client side
const promiseOops = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);
// 👇🏻 This would work on both server and client side
const promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
// This is a secure way to use variables that you need on the client side, but
// remember to never expose sensitive secrets this way. Stripe publishable key
// is safe to use in the browser, but your secret key should never be exposed.

export default function Checkout() {
  // ZUSTAND: CONSUMING THE STORE ⭐️
  const cartStore = useCartStore();
  // 👇🏻 A customer will require a client secret to complete a payment.
  const [clientSecret, setClientSecret] = useState('');

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
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 👇🏻 We send cart items to the server to create or update a payment intent.
      // We `stringify` cart items because a body of fetch requests must be only
      // be a string or `Blob` object. Zustand we `persist` all  store state to
      // localStorage, so that store state is preserved across page loads.
      body: JSON.stringify({
        items: cartStore.cart,
        // This will be used to update a existing PaymentIntent if provided one.
        // If not provided, a new intent will be created with these items.
        payment_intent_id: cartStore.paymentIntent,
      }),
    });
  }, []);

  return (
    <div>
      <p>Checkout</p>
    </div>
  );
}
