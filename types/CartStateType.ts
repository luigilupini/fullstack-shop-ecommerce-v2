type CartItemType = {
  id: string;
  name: string;
  images?: string[];
  unit_amount: number;
  description?: string;
  quantity: number;
};

export type CartStateType = {
  isOpen: boolean;
  cart: CartItemType[]; // An an array of the above cart item types
  toggleCart: () => void;
};
