'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  branchId: number;
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number; branchId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; branchId: number; quantity: number } }
  | { type: 'CLEAR_CART' };

type CartContextProps = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalPrice: number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextProps | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(
        item => item.id === action.payload.id && item.branchId === action.payload.branchId
      );
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.id === action.payload.id && item.branchId === action.payload.branchId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        items: [...state.items, action.payload]
      };

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          item => !(item.id === action.payload.id && item.branchId === action.payload.branchId)
        )
      };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          items: state.items.filter(
            item => !(item.id === action.payload.id && item.branchId === action.payload.branchId)
          )
        };
      }
      return {
        items: state.items.map(item =>
          item.id === action.payload.id && item.branchId === action.payload.branchId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        items: []
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const totalPrice = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, dispatch, totalPrice, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}