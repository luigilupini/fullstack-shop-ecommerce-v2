// The `create` package provides a function that can be used to create a Zustand
// store. The store is created with an initial state.
import { create } from 'zustand';
// A `persist` middleware in Zustand allows you to "persist" your store's state
// across sessions. It does so by saving your state to a storage location (i.e.
// localStorage in a browser) whenever it changes, & loading it from there when
// your app starts. `persist` middleware is not included in Zustand by default
// and must be installed separately as shown below.
import { persist } from 'zustand/middleware';

import { CartStateType } from '@/types/CartStateType';

// ZUSTAND: SETUP FUNCTION (STEP 1) ⭐️
// This is our state setup function that includes initial state & any actions.
// It takes a `set` function as its argument, which can update the state.
const setupFunction = (set: any): CartStateType => ({
  // Initial state for the store
  cart: [],
  isOpen: false,
  // Action to update the state using the `set` function
  toggleCart: () => set((state: CartStateType) => ({ isOpen: !state.isOpen })),
});

// ZUSTAND: OPTIONS OBJECT (STEP 2) ⭐️
// This is the options object for the `persist` middleware. It includes our
// configuration options like the name of the storage key (`name`) etc...
const options = { name: 'cart-store' };

// ZUSTAND: CREATING STORE (STEP 3) ⭐️
// The `useCartStore` creates Zustand store that is used to manage state of the
// shopping cart. The "store" is created with an initial state. Specifically the
// `persist` function takes the state setup function (or configuration object),
// which includes both the `setupFunction` initial state and any actions, and an
// options object. The `set` function is used to update the state, is passed to
// the state setup function, not to persist directly.
export const useCartStore = create<CartStateType>()(
  persist(setupFunction, options)
);

/* Zustand is a small, fast, scalable state management solution for React based
on hooks. It has an easy-to-learn and use API.

Best practices for using Zustand include:

Centralized State: Zustand can manage all of your state in a single store making
your code more maintainable and easier to test. However, multiple stores can be
created if required by your application's architecture.

Immutable State: Although Zustand does'nt enforce immutability, a good practice
is to treat your state immutable to prevent bugs and make your code predictable. 

Middleware: Zustand supports middleware to add extra functionality to your store
and you can add logging, handling side effects, or even introduce immutability
with libraries like Immer or Immutability Helper.

State Persistence: Zustand provides a `persist` middleware to save and load your
store's state from a storage location like localStorage, IndexedDB, or any other
location that supports serializing JS objects. 

Testing: Zustand's stores can be tested to ensure consistent state. Jest or any
other testing framework can be used depending on your preference and specifics
of your project architecture and requirements.

Don't get confused with `persist`. Zustand the `create` function usually takes a
setup function, which receives a `set` function as an argument that you can use
to update the state. But when using the `persist` middleware, `create` function
is called with no arguments, and instead the setup function passed to `persist`.

Here's how the pieces fit together:

1. The `persist` function takes two arguments: setup function & options object.

2. The setup function is similar to what you would normally pass to `create`.
It receives a `set` function that you can use to update the state.

3. A options object allows you to configure how `persist` middleware works and
includes options like storage key name (`name`) & storage method (`getStorage`).

We really calling `create` with the result of `persist(setupFunction, options)`.
`persist` function wraps our "setup function" adding persistence functionality,
and returns a new setup function that `create` can use to create the store.

Here's how it looks:

```javascript
import create from 'zustand';
import { persist } from 'zustand/middleware';

// This is the setup function that you pass to `persist`.
const setupFunction = (set) => ({
  // Initial state
  cart: [],
  isOpen: false,
  // Action
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
});

// These are the options for `persist`.
const options = { name: 'cart-store' };

// `persist` wraps around your setup function and returns a new setup function.
const persistedSetupFunction = persist(setupFunction, options);

// `create` uses the persisted setup function to create the store.
export const useCartStore = create(persistedSetupFunction);
```

This code is equivalent to your original code, but it separates each step into
its own line to make it clearer what's happening. I hope this helps clarify how
`persist` and `create` work together in Zustand! */
