'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import payment from '@/public/payment_mail.gif';
import Link from 'next/link';

import { useCartStore } from '@/zustand/store';
import { useEffect } from 'react';

export default function OrderConfirmed() {
  const cartStore = useCartStore();

  useEffect(() => {
    cartStore.setPaymentIntent('');
    cartStore.clearCart();
  }, []);

  const handleCheckout = () => {
    setTimeout(() => {
      cartStore.setCheckout('cart');
    }, 1000);
    cartStore.toggleCart();
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center my-12"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="p-12 text-center rounded-b-md">
        <h1 className="text-xl font-medium">Your order has been confirmed</h1>
        <h2 className="my-4 text-sm">Check your email for the receipt</h2>
        <Image
          src={payment}
          alt="payment"
          width={120}
          height={120}
          className="w-full py-8"
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <Link href="/dashboard">
          <button
            onClick={() => {
              setTimeout(() => {
                handleCheckout();
              }, 1000);
            }}
            className="px-4 py-2 font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            Check your Order
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
