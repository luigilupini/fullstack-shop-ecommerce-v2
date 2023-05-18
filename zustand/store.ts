// The `create` package provides a function that can be used to create a Zustand
// store. The store is created with an initial state.
import { AddCartType } from '@/types/AddCartType';
import { create } from 'zustand';
// A `persist` middleware in Zustand allows you to "persist" your store's state
// across sessions. It does so by saving your state to a storage location (i.e.
// localStorage in a browser) whenever it changes, & loading it from there when
// your app starts. `persist` middleware is not included in Zustand by default
// and must be installed separately as shown below.
import { persist } from 'zustand/middleware';

type CartActions = {
  toggleCart: () => void;
  addProduct: (item: AddCartType) => void;
  removeProduct: (item: AddCartType) => void;
};

type CartStateType = {
  isOpen: boolean;
  cart: AddCartType[];
} & CartActions;

/* ZUSTAND: HOW TO USE OUR SETUP FUNCTION AND TYPES
We have created `SetState` and `GetState` types for the `set` & `get` functions.
We have modified the setupFunction to take `set: SetState` & `get: GetState` as
parameters, so TypeScript now knows what type they are.

FIRST SET ARGUMENT
- set: (fn: (state: CartStateType) => CartStateType) => void

A `set` function is a method provided by Zustand that allows you to update your
store's state. It accepts a function parameter `fn` that takes current state as
`state: CartStateType` and must return new state `CartStateType`.

Hence, `state: CartStateType => CartStateType`. Now, the `set` function itself
doesn't return anything (it just causes a state update), hence => `void`.

FIRST GET ARGUMENT
- get: () => CartStateType

A `get` function is another method provided by Zustand that allows you to access
the current state of your store. It doesn't need any parameters and when called,
it returns current state of the store, hence the return type `CartStateType`. 

So in simpler terms: The `set` is a function that accepts another function. This
accepted function takes a current state as parameter and returns the new state.
set itself does not return anything. A `get` is a function that takes no
parameters and returns the current state of the store.

It might seem a bit complicated due to higher order functions (HOF) being used
(functions that operate on other functions, either by taking them as arguments
or by returning them), but it's a common pattern in JS and TS, especially when
dealing with state management. */
type SetState = (fn: (state: CartStateType) => CartStateType) => void;
type GetState = () => CartStateType;

// ZUSTAND: PASS OPTIONS OBJECT ARGUMENT (STEP 3) ⭐️
// This is the options object for the `persist` middleware. It includes our
// configuration options like the name of the storage key (`name`) etc...
const options = { name: 'cart-store' };

// ZUSTAND: PASS SETUP FUNCTION ARGUMENT (STEP 2) ⭐️
// This is our state setup function that includes initial state & any actions.
// It takes a `set` function as its argument, which can update the state.
const setupFunction = (set: SetState, get: GetState): CartStateType => ({
  cart: [],
  isOpen: false,
  toggleCart: () => {
    set((state) => {
      return { ...state, isOpen: !state.isOpen };
    });
  },
  addProduct: (item: AddCartType) => {
    set((state) => {
      const existingItem = state.cart.find(
        (cartItem) => cartItem.id === item.id
      );
      // If the item exists in the cart, we want to update the quantity only of
      // that item, not add it as a new item to cart again.
      if (existingItem) {
        const updatedCart = state.cart.map((cartItem) => {
          if (cartItem.id === item.id) {
            // We spread the existing `cartItem` to ensure we don't mutate it.
            return { ...cartItem, quantity: cartItem.quantity! + 1 };
          }
          // If the item is not the one we are looking for, we return it as is.
          return cartItem;
        });
        // We then return the updated cart array after spreading existing state!
        return { ...state, cart: updatedCart };
      } else {
        // Otherwise, if an item is not in the cart already, add it to cart. We
        // ensure we don't mutate state directly, instead we create a new array
        // spreading existing state and we then spread the cart separately also.
        return {
          ...state,
          cart: [...state.cart, { ...item, quantity: 1 }],
        };
      }
    });
  },
  removeProduct: (item: AddCartType) => {
    set((state) => {
      // If the item exists in the cart, we want to update the quantity only of
      // that item, not add it as a new item to cart again.
      const existingItem = state.cart.find(
        (cartItem) => cartItem.id === item.id
      );
      // If the item exists in the cart and its quantity is more than 1, we want
      // to update and decrease the quantity and for only that item.
      if (existingItem && existingItem.quantity! > 1) {
        const updatedCart = state.cart.map((cartItem) => {
          if (cartItem.id === item.id) {
            // We spread the existing `cartItem` to ensure we don't mutate it.
            return { ...cartItem, quantity: cartItem.quantity! - 1 };
          }
          // If the item is not the one we are looking for, we return it as is.
          return cartItem;
        });
        // We then return the updated cart array after spreading existing state!
        return { ...state, cart: updatedCart };
      } else {
        // Otherwise, we filter the cart array to remove the item from the cart.
        // Ensure we don't mutate state directly, instead we create a new array
        // spreading existing state and we then spread the cart separately also.
        const filterCart = state.cart.filter(
          (cartItem) => cartItem.id !== item.id
        );
        return { ...state, cart: filterCart };
      }
    });
  },
});

// ZUSTAND: CREATING STORE (STEP 1) ⭐️
// The `useCartStore` creates Zustand store that is used to manage state of the
// shopping cart. The "store" is created with an initial state. Specifically the
// `persist` function takes the state setup function (or configuration object),
// which includes both the `setupFunction` initial state and any actions, and an
// options object. The `set` function is used to update the state, is passed to
// the state setup function, not to persist directly.
export const useCartStore = create(persist(setupFunction, options));

/* Zustand is a small, fast, scalable state management solution for React based
on hooks. It has an easy-to-learn and use API.

Best practices for using Zustand include:

Centralized State: Zustand can manage all of your state in a single store making
your code more maintainable and easier to test. However, multiple stores can be
created if required by your application's architecture.

Immutable State: Although Zustand does'nt enforce immutability, a good practice
is to treat your state immutable to prevent bugs & make your code predictable. 

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
