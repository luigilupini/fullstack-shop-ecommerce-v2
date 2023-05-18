'use client';

import { ReactNode, useEffect, useState } from 'react';

// ZUSTAND: HYDRATE COMPONENT TO HANDLE CLIENT-SIDE RENDERING (STEP 4) ⭐️
// This component prevents client-specific code from running on the server and
// causing a mismatch between pre-rendered server-rendered and client-rendered
// markup. It does this by rendering its `children` (client-specific code) only
// after the component has "mounted" on the client (i.e. after hydration).

// Because our Zustand implementation is a client-side state management library,
// we use this component to prevent Zustand-related state (like a `isOpen` state
// of the cartStore) from causing hydration errors if they don't sync up.

interface Props {
  children: ReactNode;
}

export default function Hydration({ children }: Props) {
  const [isHydrated, setIsHydrated] = useState(false);
  // Wait until Next.js completed hydration before rendering `children`:
  useEffect(() => setIsHydrated(true), []);
  // If hydration is complete, render `children`. If not render loading status.
  // Ensuring a `children` prop (which may depend on client-side state/library)
  // are only rendered "committed" on the client, preventing hydration errors,
  // once the component has "mounted" using our effect hook, on the client.
  return (
    <>
      {!isHydrated ? (
        <div className="flex items-center justify-center min-h-screen font-semibold text-gray-700">
          Loading...
        </div>
      ) : (
        children
      )}
    </>
  );
}

// ! ERROR IF NOT USED
// If you don't use a Hydrate component (or similar solution) you may encounter
// hydration errors when using client-side state or libraries (like Zustand) in
// a server-side rendering or static site generation context has pre-rendered a
// different React tree than the one that is rendered on the client.

// ! Error: "Expected server HTML to contain a matching <div> in <nav>." It
// ! means our HTML structure rendered on the server didn't match structure
// ! expected by the client, causing React's hydration process to fail.

// Typically caused by a part of your code (like a component, a library, etc.)
// behaving differently on the server and the client. Common example include use
// of a `window` API in a component's rendering or using a library like Zustand.
// That is because these are client-side-only services!

// What is React Hydration?
// When a React App server-rendered, the server sends a static HTML pre-rendered
// representation of the React components to the client. This allows the browser
// (client-side) to quickly display server-rendered markup to the user "without"
// having to wait for all the JS to load and execute. HTML sent from the server
// is essentially "dead" in the sense that it's not reactive - it non-respond to
// user interactions as no event handlers are attached to the HTML elements yet.

// When the JS bundle finally loads/executes on the client, React "hydrates" the
// server-rendered HTML by attaching event handlers to it, thereby enabling all
// the user interactions that are defined in your React components. This term is
// known as "hydrate" used to signify the idea that React making "dry" HTML sent
// from a server alive by attaching event handlers or any interactive behavior.

// This is beneficial as it allows the user to see the UI quickly without having
// to wait for all the JS loads found in early SPA usage. However it's important
// that HTML structure produced by the server "pre-rendered" matches what client
// browser React code expects when it re-renders or initial renders. If there's
// a mismatch between server-rendered HTML and what React tries to hydrate on a
// client, it can cause errors or lead to broken UI - "hydration error".

// To fix it, ensure your server-rendered and client-rendered markup matches. Do
// this by delaying the rendering of client-specific code after React hydration.
// Our Hydrate component does by only passing the `children` prop, once the App
// or RootLayout in effect, has "mounted" on the client. It's the responsibility
// of the developer to properly manage state when using server-side frameworks
// like Next, which includes taking care of hydration issues.

// ! UNHANDLED RUNTIME ERROR IF NOT USED 🤬
// See more info here: https://nextjs.org/docs/messages/react-hydration-error
// Error: Hydration failed because the initial UI does not match what rendered
// on the server. Markup rendered in the browser is different to the server.

// Warning: Expected server HTML to contain a matching <div> in <nav>.

// <body> RootLayout ./app/layout.tsx (server)
// <div> Cart ./app/components/Cart.tsx (client)
// <nav> Navbar ./app/components/Navbar.tsx (client)

// # Why This Error Occurred
// While rendering your application, there was a difference between the React
// tree that was pre-rendered (SSR/SSG) and the React tree that rendered during
// the first render in the Browser. The first render is called Hydration which
// is a feature of React. This can cause a React tree to be (out of sync) with
// the DOM and result in unexpected content/attributes being present.

// # Possible Ways to Fix It
// In general this issue is caused by using a specific library or application
// code relying on something that could be different between our pre-rendering
// (server side) and the first render in our browser (client-side). An example
// of this is using `window` in a component's rendering. The same applies to a
// libraries like `zustand` or `react-query` which are client-side only.

/* jsx
function MyComponent() {
  // This condition depends on `window`. During the first render of the browser 
  // the `color` variable will be different
  const color = typeof window !== 'undefined' ? 'red' : 'blue'
  // As color is passed as a prop there is a mismatch between what was rendered 
  // server-side vs what was rendered in the first render
  return <h1 className={`title ${color}`}>Hello World!</h1>
}
*/

// # How to fix it:
// In order to prevent the first render from being different you can `useEffect`
// which is only executed in the browser and is executed during hydration.

/* jsx
import { useEffect, useState } from 'react'
function MyComponent() {
  // The default value is 'blue', it will be used during pre-rendering and the 
  // first render in the browser (hydration)
  const [color, setColor] = useState('blue')
  // During hydration `useEffect` is called `window` is available in `useEffect`. 
  // and because we know we're in the browser checking for window is not needed. 
  // If you need to read something from `window` that is fine.

  // By calling `setColor` in `useEffect` a render is triggered after hydrating, 
  // this causes "browser specific" value to be available. In this case 'red'.
  useEffect(() => setColor('red'), [])
  // As color is a state passed as a prop there is no mismatch between what was 
  // rendered (server-side) vs whats rendered in the first render (client-side). 
  // After `useEffect` runs the color is set to 'red'
  return <h1 className={`title ${color}`}>Hello World!</h1>
}
*/

// * The Perils of Hydration
// https://www.joshwcomeau.com/react/the-perils-of-rehydration/
// When a React app hydrates, it assumes that the DOM structure will match.

// When the React app runs on the client for the first time, it builds up a
// mental picture of what the DOM should look like, by mounting all of your
// components. Then it squints at the DOM nodes already on the page, and tries
// to fit the two together. It's not playing the “spot-the-differences” game it
// does during a typical update, it's just trying to snap the two together, so
// that future updates will be handled correctly.

// By rendering something different depending on whether we're in server-side
// render or not, we're hacking the system. We're rendering one thing on the
// server, but then telling React to expect something else on the client

// Immediately after this comparison "diffing", we trigger a re-render, and this
// allows React to do a proper "reconciliation" of snapshots. It'll notice that
// there's some new content to render here—either an authenticated menu, or say
// a login link—and update the DOM accordingly.

// Two-pass rendering is the same idea. A first pass, at compile-time, produces
// all of the static non-personal content and leaves holes where dynamic content
// will go. Then, after the React app has mounted on the user's browser a second
// pass stamps in all the dynamic bits that depend on client state.
