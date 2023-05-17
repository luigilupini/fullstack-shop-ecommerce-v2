import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ProductType } from '@/types/ProductType';

import priceFormat from '@/utils/priceFormat';

export default function Product({
  id,
  name,
  images,
  unit_amount,
  metadata: { features },
}: ProductType) {
  // console.log({ id, name, images, unit_amount, features });
  return (
    <Link
      href={{
        pathname: `/product/${id}`,
        query: { id, name, images, unit_amount, features },
      }}
      className="overflow-hidden border rounded-lg shadow-sm"
    >
      <div className="overflow-hidden">
        <Image
          src={images}
          alt={name}
          width={800}
          height={800}
          className="object-cover w-full transition-transform duration-300 h-80 hover:scale-105"
          priority
        />
      </div>
      <div className="px-2 py-4 bg-gray-50/95">
        <h1 className="text-[15px] font-bold">{name}</h1>
        <h2 className="text-sm text-gray-700">
          {unit_amount !== null ? priceFormat(unit_amount) : 'N/A'}
        </h2>
      </div>
    </Link>
  );
}
