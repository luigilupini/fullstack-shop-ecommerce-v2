'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import payment from '@/public/payment_mail.gif';
import Link from 'next/link';

import { useCartStore } from '@/zustand/store';
import { useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

import orderCompleted from '@/public/orderCompleted.json';

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
      <div className="p-8 text-center rounded-b-md">
        <h1 className="text-xl font-medium">Your order has been confirmed</h1>
        <h2 className="my-4 text-sm">Check your email for the receipt</h2>
        {/* <Image
          src={payment}
          alt="payment"
          width={120}
          height={120}
          className="w-full py-8"
        /> */}
        <Player
          autoplay
          loop={false}
          keepLastFrame
          src={orderCompleted}
          style={{ height: '400px', width: '400px' }}
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
            className="my-4 btn btn-primary"
          >
            Check your Order
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
