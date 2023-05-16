import { ProductType } from '@/types/ProductType';
import priceFormat from '@/utils/priceFormat';
import Image from 'next/image';
import React from 'react';

export default function Product({ name, images, unit_amount }: ProductType) {
  return (
    <div className="overflow-hidden border rounded-lg shadow-sm">
      <Image
        src={images}
        alt={name}
        width={800}
        height={800}
        className="object-cover w-full h-80"
        priority
      />
      <div className="px-2 py-4 bg-gray-50/95">
        <h1 className="font-bold">{name}</h1>
        <h2 className="text-xs text-gray-700">
          {unit_amount !== null ? priceFormat(unit_amount) : 'N/A'}
        </h2>
      </div>
    </div>
  );
}
