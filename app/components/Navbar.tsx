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

// Defining the Navbar component. This component takes a `user` prop, which is
// typed with a Session. Session type ensures TypeScript knows what properties
// are available on the `user` object.
export default function Navbar({ user }: Session) {
  return (
    <nav className="flex items-center justify-between py-8 border">
      <h1>Company Name</h1>
      <ul>
        {!user && (
          <li className="px-4 py-2 text-white bg-teal-600 rounded-md">
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
              />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
