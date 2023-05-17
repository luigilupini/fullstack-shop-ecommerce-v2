'use client';

// NEXTAUTH: GETTING SESSION INFORMATION ⭐️
// This interface defines a shape of the session object that is used by NextAuth
// to manage a current `user` session. It's used to type the `user` prop in your
// Navbar component. This provides TypeScript with information. About structure
// of the user object, enabling better type checking and autocompletion.
import { Session } from 'next-auth';
// Importing the Session interface from 'next-auth'. This interface defines the
// structure of the user session object.

// Importing signIn & signOut functions from 'next-auth/react'. These functions
// allow users to sign in and out of your application.
import { signIn, signOut } from 'next-auth/react';

import Image from 'next/image';
import Link from 'next/link';

import { FiShoppingCart } from 'react-icons/fi';

import Cart from './Cart';
import { useCartStore } from '@/zustand/store';

// Defining the Navbar component. This component takes a `user` prop, which is
// typed with a Session. Session type ensures TypeScript knows what properties
// are available on the `user` object.
export default function Navbar({ user }: Session) {
  // ZUSTAND: CONSUMING THE STORE ⭐️
  const cartStore = useCartStore();
  console.log(cartStore);
  return (
    <nav className="flex items-center justify-between py-12">
      <Link href={'/'}>
        <h1>Company Name</h1>
      </Link>
      <ul className="flex items-center gap-6">
        <li
          className="relative text-[26px] text-gray-800 cursor-pointer pt-2"
          onClick={() => cartStore.toggleCart()}
        >
          <FiShoppingCart />
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white border border-orange-500 rounded-full shadow-lg bg-orange-500/95 left-3 bottom-3">
            {cartStore.cart.length}
          </span>
        </li>
        {/* > If the user is not signed in: */}
        {!user && (
          <li className="px-2 py-1 text-sm text-white bg-gray-800 rounded-md">
            <button onClick={() => signIn()}>Sign in</button>
          </li>
        )}
        {user && (
          <li>
            <Image
              src={user?.image as string}
              alt={user?.name as string}
              width={36}
              height={36}
              className="rounded-full cursor-pointer"
              priority
            />
          </li>
        )}
      </ul>
      {cartStore.isOpen && <Cart />}
    </nav>
  );
}
