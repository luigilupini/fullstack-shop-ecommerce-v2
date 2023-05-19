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

// FRAMER: USING MOTION ⭐️
// We import the `motion` component from 'framer-motion'. This component is used
// to animate elements on the page by prefixing the HTML element with `motion`.
// By using an `animate` prop, we define the animation. A `motion` component acts
// as a wrapper around the HTML element, meaning we can still use all the normal HTML
// attributes and props. A `initial` prop sets the initial state of the animation,
// while the `animate` prop determines final state of the animation. To apply an
// `exit` animations, we need to use the `AnimatePresence` component. This component
// is used to animate elements when unmounted from the React tree, like when a carts empty.
// When adding/removing multiple children, each child must have a unique `key` prop.
// Any `motion` component with an `exit` prop will animate ou, when removed from the tree.
// So, we need to ensure that the components `AnimatePresence` wraps have a condition
// that determines if they unmount, like our short-circuiting `&&` operator below.
import { AnimatePresence, motion } from 'framer-motion';
// ! IMPORTANT: ANIMATE PRESENCE
// AnimatePresence should be placed as close as possible to the dynamic content
// that it's handling, typically at the point where a component is conditionally
// rendered into the tree. For instance, if you have AnimatePresence high up within
// your App component, this usage might cause problems. If something causes the
// parent component (App component) to re-render, React might unmount and remount
// AnimatePresence and its children, which could interrupt any `exit` in progress.

// Defining the Navbar component. This component takes a `user` prop, which is
// typed with a Session. Session type ensures TypeScript knows what properties
// are available on the `user` object provided by NextAuth.
export default function Navbar({ user }: Session) {
  // ZUSTAND: CONSUMING THE STORE ⭐️
  const cartStore = useCartStore();

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

          <AnimatePresence>
            {/* Required condition when a component is removed from React tree */}
            {cartStore.cart.length > 0 && (
              <motion.span
                animate={{ scale: 1 }}
                initial={{ scale: 0 }}
                exit={{ scale: 0 }}
                className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white border border-orange-500 rounded-full shadow-lg left-3 bottom-3 bg-orange-500/95"
              >
                {cartStore.cart.length}
              </motion.span>
            )}
          </AnimatePresence>
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
      <AnimatePresence>
        {/* Required condition when a component is removed from React tree */}
        {cartStore.isOpen && <Cart />}
      </AnimatePresence>
    </nav>
  );
}
