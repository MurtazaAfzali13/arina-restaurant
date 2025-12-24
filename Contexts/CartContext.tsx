// app/Contexts/CartContext.tsx
'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  branchId: number;
  branchName?: string; // اضافه شده
  imageUrl?: string;
};

type BranchCart = {
  [branchId: number]: {
    items: CartItem[];
    branchName?: string;
  };
};

type CartState = {
  branchCarts: BranchCart;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number; branchId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; branchId: number; quantity: number } }
  | { type: 'CLEAR_BRANCH'; payload: { branchId: number } }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_BRANCH_NAME'; payload: { branchId: number; branchName: string } };

type CartContextProps = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalPrice: number;
  totalItems: number;
  clearAll: () => void;
  getBranchTotal: (branchId: number) => number;
  getBranchItems: (branchId: number) => CartItem[];
};

const CartContext = createContext<CartContextProps | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  const { branchCarts } = state;

  switch (action.type) {
    case 'ADD_ITEM': {
      const { branchId, ...item } = action.payload;
      const branch = branchCarts[branchId] || { items: [] };
      const existingItem = branch.items.find(i => i.id === item.id);

      const newItems = existingItem
        ? branch.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        : [...branch.items, { ...item, branchId }];

      return {
        branchCarts: {
          ...branchCarts,
          [branchId]: { ...branch, items: newItems }
        }
      };
    }

    case 'REMOVE_ITEM': {
      const { branchId, id } = action.payload;
      const branch = branchCarts[branchId];
      if (!branch) return state;

      const newItems = branch.items.filter(i => i.id !== id);
      if (newItems.length === 0) {
        const newBranchCarts = { ...branchCarts };
        delete newBranchCarts[branchId];
        return { branchCarts: newBranchCarts };
      }

      return {
        branchCarts: {
          ...branchCarts,
          [branchId]: { ...branch, items: newItems }
        }
      };
    }

    case 'UPDATE_QUANTITY': {
      const { branchId, id, quantity } = action.payload;
      const branch = branchCarts[branchId];
      if (!branch) return state;

      let newItems = branch.items;
      if (quantity <= 0) {
        newItems = newItems.filter(i => i.id !== id);
      } else {
        newItems = newItems.map(i => 
          i.id === id ? { ...i, quantity } : i
        );
      }

      if (newItems.length === 0) {
        const newBranchCarts = { ...branchCarts };
        delete newBranchCarts[branchId];
        return { branchCarts: newBranchCarts };
      }

      return {
        branchCarts: {
          ...branchCarts,
          [branchId]: { ...branch, items: newItems }
        }
      };
    }

    case 'CLEAR_BRANCH': {
      const { branchId } = action.payload;
      const newBranchCarts = { ...branchCarts };
      delete newBranchCarts[branchId];
      return { branchCarts: newBranchCarts };
    }

    case 'CLEAR_ALL':
      return { branchCarts: {} };

    case 'SET_BRANCH_NAME': {
      const { branchId, branchName } = action.payload;
      const branch = branchCarts[branchId] || { items: [] };
      return {
        branchCarts: {
          ...branchCarts,
          [branchId]: { ...branch, branchName }
        }
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { branchCarts: {} });

  // محاسبه جمع کل کل سبد
  const totalPrice = Object.values(state.branchCarts)
    .flatMap(branch => branch.items)
    .reduce((total, item) => total + item.price * item.quantity, 0);

  // تعداد کل آیتم‌ها
  const totalItems = Object.values(state.branchCarts)
    .reduce((total, branch) => total + branch.items.length, 0);

  // جمع کل یک شعبه خاص
  const getBranchTotal = (branchId: number) => {
    const branch = state.branchCarts[branchId];
    if (!branch) return 0;
    return branch.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // آیتم‌های یک شعبه خاص
  const getBranchItems = (branchId: number) => {
    return state.branchCarts[branchId]?.items || [];
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      totalPrice,
      totalItems,
      clearAll,
      getBranchTotal,
      getBranchItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}