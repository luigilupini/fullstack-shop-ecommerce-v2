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

// Defining the Navbar component. This component takes a `user` prop, which is
// typed with a Session. Session type ensures TypeScript knows what properties
// are available on the `user` object.
export default function Navbar({ user }: Session) {
  return (
    <nav className="flex items-center justify-between py-8">
      <Link href={'/'}>
        <h1>Company Name</h1>
      </Link>
      <ul className="flex items-center gap-12">
        {!user && (
          <li className="px-2 py-1 text-sm text-white bg-gray-800 rounded-md">
            <button onClick={() => signIn()}>Sign in</button>
          </li>
        )}
        {user && (
          <>
            <li>
              <Image
                src={user?.image as string}
                alt={user?.name as string}
                width={48}
                height={48}
                className="rounded-full cursor-pointer"
                priority
              />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
