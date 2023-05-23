'use client';

import { useState, useEffect, FormEvent } from 'react';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { useCartStore } from '@/zustand/store';
import priceFormat from '@/utils/priceFormat';

interface Props {
  clientSecret: string;
}

export default function CheckoutForm({ clientSecret }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const cartStore = useCartStore();

  const totalPrice = cartStore.cart.reduce(
    (acc, item) => acc + item.unit_amount! * item.quantity!,
    0
  );

  useEffect(() => {
    if (!stripe) return;
    if (!clientSecret) return;
  }, [stripe]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    stripe
      .confirmPayment({
        elements,
        redirect: 'if_required',
      })
      .then((result) => {
        if (!result.error) {
          cartStore.setCheckout('success');
        }
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} id="payment-form">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <h1 className="py-4 mt-4 text-sm font-semibold ">
        Total: {priceFormat(totalPrice)}
      </h1>
      <button
        id="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full my-4 btn btn-primary"
      >
        {isLoading ? <span>Processing</span> : <span>Pay now</span>}
      </button>
    </form>
  );
}
