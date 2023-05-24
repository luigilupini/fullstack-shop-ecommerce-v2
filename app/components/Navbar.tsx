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
import ThemeBtn from './ThemeBtn';
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
  const handleBlurOut = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  return (
    <nav className="flex items-center justify-between py-12">
      <Link href={'/'}>
        <h1 className="text-lg">Superdry Clone</h1>
      </Link>
      <ul className="flex items-center justify-center gap-8">
        <li
          className="relative text-3xl cursor-pointer"
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
                className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white rounded-full shadow-md bg-primary left-4 bottom-4"
              >
                {cartStore.cart.length}
              </motion.span>
            )}
          </AnimatePresence>
        </li>
        {/* > If the user is not signed in: */}
        {!user && (
          <li className="px-2 py-1 text-sm text-white rounded-md bg-primary">
            <button onClick={() => signIn()}>Sign in</button>
          </li>
        )}
        <ThemeBtn />
        {user && (
          <div className="cursor-pointer dropdown dropdown-end avatar">
            <Image
              src={user?.image as string}
              alt={user?.name as string}
              width={38}
              height={38}
              className="object-cover rounded-full shadow cursor-pointer"
              priority
              tabIndex={0}
            />
            <ul
              tabIndex={0}
              className="w-48 p-4 space-y-4 text-sm shadow-lg dropdown-content menu bg-base-100 rounded-box"
            >
              <Link
                className="p-4 rounded-md hover:bg-base-300"
                href={'/dashboard'}
                onClick={handleBlurOut}
              >
                My Orders
              </Link>
              <li
                className="p-4 rounded-md hover:bg-base-300"
                onClick={() => {
                  handleBlurOut();
                  signOut();
                }}
              >
                Sign out
              </li>
            </ul>
          </div>
        )}
      </ul>
      <AnimatePresence>
        {/* Required condition when a component is removed from React tree */}
        {cartStore.isOpen && <Cart />}
      </AnimatePresence>
    </nav>
  );
}
