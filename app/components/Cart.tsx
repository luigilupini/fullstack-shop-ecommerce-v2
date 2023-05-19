'use client';

import priceFormat from '@/utils/priceFormat';
import { useCartStore } from '@/zustand/store';
import Image from 'next/image';

import { TbSquareRoundedPlus, TbSquareRoundedMinus } from 'react-icons/tb';

import emptyBasket from '@/public/shopping-cart-empty.png';
import { motion } from 'framer-motion';

export default function Cart() {
  const cartStore = useCartStore();
  // Reduce to get total price:
  const totalPrice = cartStore.cart.reduce((acc, item) => {
    return acc + item.unit_amount! * item.quantity!;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => cartStore.toggleCart()}
      className="fixed top-0 bottom-0 left-0 right-0 w-full h-screen bg-black/25 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 w-1/4 h-screen p-12 overflow-y-scroll text-gray-700 bg-white"
      >
        <h1 className="mb-6 text-2xl font-bold">Your shopping cart</h1>

        {cartStore.cart.map((item) => (
          <div className="flex gap-2 py-4" key={item.id}>
            <Image
              className="object-cover w-24 h-24 rounded-full shadow"
              src={item.images}
              alt={item.name}
              width={120}
              height={120}
              priority
            />
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold">{item.name}</h2>
              <div className="flex items-center gap-2">
                <h2 className="text-sm">Qty: {item.quantity}</h2>
                <button onClick={() => cartStore.removeProduct(item)}>
                  <TbSquareRoundedMinus className="w-3 h-3 transition duration-300 ease-in cursor-pointer hover:drop-shadow-md hover:text-red-500 hover:scale-110" />
                </button>
                <button onClick={() => cartStore.addProduct(item)}>
                  <TbSquareRoundedPlus className="w-3 h-3 transition duration-300 ease-in cursor-pointer hover:drop-shadow-md hover:text-green-500 hover:scale-110" />
                </button>
              </div>
              <h2 className="mt-auto text-sm">
                {item.unit_amount && priceFormat(item.unit_amount)}
              </h2>
            </div>
          </div>
        ))}
        <p className="mt-6">
          <span className="font-semibold">Total:</span>{' '}
          {priceFormat(totalPrice)}
        </p>
        {cartStore.cart.length > 0 && (
          <button className="w-full px-4 py-2 mt-2 text-sm font-semibold text-white bg-black rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Checkout
          </button>
        )}

        {!cartStore.cart.length && (
          <motion.div
            initial={{ scale: 0.5, rotateZ: -10, opacity: 0 }}
            animate={{ scale: 1, rotateZ: 0, opacity: 0.75 }}
            className="flex flex-col items-center justify-center w-full h-full gap-2"
          >
            <Image
              src={emptyBasket}
              alt="Empty basket"
              width={200}
              height={200}
              priority
              className="object-cover"
            />
            <h2 className="text-lg font-semibold">Ohh no its empty :(</h2>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
