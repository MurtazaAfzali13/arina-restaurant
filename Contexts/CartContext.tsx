'use client'; // ⚠️ این خط خیلی مهم است

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
  useEffect,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  branchId: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
}

type Action =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: number; branchId: number } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: number; branchId: number; quantity: number };
    }
  | { type: "CLEAR_CART" };

const STORAGE_KEY = "arina-cart";

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.branchId === action.payload.branchId
      );

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.payload.quantity;
        return { items: newItems };
      }

      return { items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (item) =>
            !(
              item.id === action.payload.id &&
              item.branchId === action.payload.branchId
            )
        ),
      };
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id &&
          item.branchId === action.payload.branchId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

function initializeState(): CartState {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { items: [] };
    }
    const parsed = JSON.parse(stored) as CartState;
    if (Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to parse cart state", error);
  }

  return { items: [] };
}

interface CartContextProps {
  state: CartState;
  dispatch: React.Dispatch<Action>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] }, initializeState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to persist cart state", error);
    }
  }, [state]);

  const value = useMemo(() => {
    const totalItems = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalPrice = state.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    return { state, dispatch, totalItems, totalPrice };
  }, [state]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
