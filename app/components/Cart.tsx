'use client';

import { useCartStore } from '@/zustand/store';
import Image from 'next/image';

export default function Cart() {
  const cartStore = useCartStore();
  return (
    <div>
      <h1>Cart</h1>
      {/* <Image /> */}
    </div>
  );
}
