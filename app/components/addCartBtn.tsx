'use client';

import { AddCartType } from '@/types/AddCartType';
import { SearchParamTypes } from '@/types/SearchParamType';
import { useCartStore } from '@/zustand/store';
import React from 'react';

export default function addCartBtn({
  id,
  name,
  images,
  unit_amount,
  quantity,
}: AddCartType) {
  const cartStore = useCartStore();
  return (
    <>
      <button
        className="px-6 py-2 mt-12 font-medium text-white duration-300 bg-gray-800 rounded-md w-fit hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        onClick={() =>
          cartStore.addProduct({
            id,
            name,
            images,
            unit_amount,
            quantity,
          })
        }
      >
        Add to cart
      </button>
    </>
  );
}
