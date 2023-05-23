'use client';

import { AddCartType } from '@/types/AddCartType';
import { useCartStore } from '@/zustand/store';
import { useState } from 'react';

export default function addCartBtn({
  id,
  name,
  image,
  unit_amount,
  quantity,
}: AddCartType) {
  const [added, setAdded] = useState(false);
  const cartStore = useCartStore();

  const handleAddToCart = () => {
    cartStore.addProduct({ id, name, image, unit_amount, quantity });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1000);
  };

  return (
    <div className="pt-2 mt-auto">
      <button
        onClick={handleAddToCart}
        className="btn btn-primary"
        disabled={added}
      >
        {!added ? <span>Add to cart </span> : <span>Adding to cart</span>}
      </button>
    </div>
  );
}
