// app/Contexts/CartContext.tsx
'use client';

import { 
  createContext, 
  useContext, 
  useReducer, 
  ReactNode, 
  useEffect,
  useMemo,
  useCallback
} from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  branchId: number;
  branchName?: string;
  imageUrl?: string;
  maxStock?: number; // حداکثر موجودی برای اعتبارسنجی
  sku?: string; // کد محصول
};

type BranchCart = {
  [branchId: number]: {
    items: CartItem[];
    branchName?: string;
    lastUpdated?: string;
  };
};

type CartState = {
  branchCarts: BranchCart;
  version: number; // برای مدیریت تغییرات ساختار داده
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number; branchId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; branchId: number; quantity: number } }
  | { type: 'CLEAR_BRANCH'; payload: { branchId: number } }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_BRANCH_NAME'; payload: { branchId: number; branchName: string } }
  | { type: 'SYNC_CART'; payload: CartState }
  | { type: 'MERGE_CART'; payload: CartItem[] };

type CartContextProps = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalPrice: number;
  totalItems: number;
  totalUniqueItems: number;
  clearAll: () => void;
  getBranchTotal: (branchId: number) => number;
  getBranchItems: (branchId: number) => CartItem[];
  getItemQuantity: (itemId: number, branchId: number) => number;
  getBranchInfo: (branchId: number) => { items: CartItem[]; branchName?: string; total: number } | null;
  getAllBranches: () => Array<{ branchId: number; branchName?: string; itemCount: number; total: number }>;
  mergeCart: (items: CartItem[]) => void;
  syncCart: (cartState: CartState) => void;
};

// کلید ذخیره‌سازی در localStorage
const CART_STORAGE_KEY = 'shopping_cart_v2';

// حالت اولیه
const initialState: CartState = {
  branchCarts: {},
  version: 2
};

// تابع برای بارگذاری از localStorage با مهاجرت نسخه
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') return initialState;
  
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return initialState;
    
    const parsed = JSON.parse(saved);
    
    // مهاجرت از نسخه قدیمی به جدید اگر لازم بود
    if (parsed.version === 1) {
      // تبدیل ساختار قدیمی به جدید
      return {
        branchCarts: parsed.branchCarts || {},
        version: 2
      };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
    return initialState;
  }
};

// اعتبارسنجی آیتم سبد خرید
const validateCartItem = (item: CartItem): boolean => {
  if (!item || typeof item !== 'object') return false;
  if (!item.id || item.id <= 0) return false;
  if (!item.name || typeof item.name !== 'string') return false;
  if (!item.price || item.price < 0) return false;
  if (!item.quantity || item.quantity <= 0) return false;
  if (!item.branchId || item.branchId <= 0) return false;
  return true;
};

function cartReducer(state: CartState, action: CartAction): CartState {
  const { branchCarts } = state;

  switch (action.type) {
    case 'ADD_ITEM': {
      const { branchId, ...item } = action.payload;
      
      // اعتبارسنجی داده‌ها
      if (!validateCartItem(action.payload)) {
        console.warn('Invalid cart item:', action.payload);
        return state;
      }
      
      // اعتبارسنجی موجودی
      if (item.maxStock && item.quantity > item.maxStock) {
        console.warn(`Item ${item.id} exceeds max stock of ${item.maxStock}`);
        // می‌توانید تصمیم بگیرید که مقدار را محدود کنید یا اضافه نکنید
        return state;
      }
      
      const branch = branchCarts[branchId] || { items: [] };
      const existingItem = branch.items.find(i => i.id === item.id);

      const newItems = existingItem
        ? branch.items.map(i =>
            i.id === item.id
              ? { 
                  ...i, 
                  quantity: Math.min(i.quantity + item.quantity, i.maxStock || 999),
                  price: item.price // به روز رسانی قیمت در صورت تغییر
                }
              : i
          )
        : [...branch.items, { ...item, branchId }];

      return {
        ...state,
        branchCarts: {
          ...branchCarts,
          [branchId]: { 
            ...branch, 
            items: newItems,
            lastUpdated: new Date().toISOString()
          }
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
        return { ...state, branchCarts: newBranchCarts };
      }

      return {
        ...state,
        branchCarts: {
          ...branchCarts,
          [branchId]: { 
            ...branch, 
            items: newItems,
            lastUpdated: new Date().toISOString()
          }
        }
      };
    }

    case 'UPDATE_QUANTITY': {
      const { branchId, id, quantity } = action.payload;
      const branch = branchCarts[branchId];
      if (!branch) return state;

      // محدود کردن مقدار به محدوده معتبر
      const safeQuantity = Math.max(1, Math.min(quantity, 999));
      
      const existingItem = branch.items.find(i => i.id === id);
      if (existingItem?.maxStock && safeQuantity > existingItem.maxStock) {
        console.warn(`Quantity ${safeQuantity} exceeds max stock for item ${id}`);
        return state;
      }

      let newItems = branch.items;
      if (safeQuantity <= 0) {
        newItems = newItems.filter(i => i.id !== id);
      } else {
        newItems = newItems.map(i => 
          i.id === id ? { ...i, quantity: safeQuantity } : i
        );
      }

      if (newItems.length === 0) {
        const newBranchCarts = { ...branchCarts };
        delete newBranchCarts[branchId];
        return { ...state, branchCarts: newBranchCarts };
      }

      return {
        ...state,
        branchCarts: {
          ...branchCarts,
          [branchId]: { 
            ...branch, 
            items: newItems,
            lastUpdated: new Date().toISOString()
          }
        }
      };
    }

    case 'CLEAR_BRANCH': {
      const { branchId } = action.payload;
      const newBranchCarts = { ...branchCarts };
      delete newBranchCarts[branchId];
      return { ...state, branchCarts: newBranchCarts };
    }

    case 'CLEAR_ALL':
      return { ...initialState };

    case 'SET_BRANCH_NAME': {
      const { branchId, branchName } = action.payload;
      const branch = branchCarts[branchId] || { items: [] };
      return {
        ...state,
        branchCarts: {
          ...branchCarts,
          [branchId]: { ...branch, branchName }
        }
      };
    }

    case 'SYNC_CART': {
      return { ...action.payload };
    }

    case 'MERGE_CART': {
      const items = action.payload;
      const newBranchCarts = { ...branchCarts };
      
      items.forEach(item => {
        if (!validateCartItem(item)) return;
        
        const { branchId } = item;
        const branch = newBranchCarts[branchId] || { items: [] };
        const existingItem = branch.items.find(i => i.id === item.id);
        
        if (existingItem) {
          // اگر آیتم وجود دارد، مقدار را جمع کن
          newBranchCarts[branchId] = {
            ...branch,
            items: branch.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        } else {
          // اگر آیتم جدید است، اضافه کن
          newBranchCarts[branchId] = {
            ...branch,
            items: [...branch.items, item]
          };
        }
      });
      
      return {
        ...state,
        branchCarts: newBranchCarts
      };
    }

    default:
      return state;
  }
}

// هوک کمکی برای مدیریت سبد هر شعبه
export function useBranchCart(branchId: number) {
  const { 
    state, 
    dispatch, 
    getBranchTotal, 
    getBranchItems, 
    getItemQuantity 
  } = useCart();
  
  const addItem = useCallback((item: Omit<CartItem, 'branchId'>) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { ...item, branchId } 
    });
  }, [dispatch, branchId]);
  
  const removeItem = useCallback((id: number) => {
    dispatch({ 
      type: 'REMOVE_ITEM', 
      payload: { id, branchId } 
    });
  }, [dispatch, branchId]);
  
  const updateQuantity = useCallback((id: number, quantity: number) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id, branchId, quantity } 
    });
  }, [dispatch, branchId]);
  
  const clearBranch = useCallback(() => {
    dispatch({ 
      type: 'CLEAR_BRANCH', 
      payload: { branchId } 
    });
  }, [dispatch, branchId]);
  
  const setBranchName = useCallback((branchName: string) => {
    dispatch({ 
      type: 'SET_BRANCH_NAME', 
      payload: { branchId, branchName } 
    });
  }, [dispatch, branchId]);
  
  const incrementQuantity = useCallback((id: number) => {
    const currentQty = getItemQuantity(id, branchId);
    updateQuantity(id, currentQty + 1);
  }, [getItemQuantity, updateQuantity, branchId]);
  
  const decrementQuantity = useCallback((id: number) => {
    const currentQty = getItemQuantity(id, branchId);
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1);
    }
  }, [getItemQuantity, updateQuantity, branchId]);
  
  return {
    items: getBranchItems(branchId),
    total: getBranchTotal(branchId),
    itemCount: getBranchItems(branchId).length,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearBranch,
    setBranchName,
    getItemQuantity: (id: number) => getItemQuantity(id, branchId),
    isEmpty: getBranchItems(branchId).length === 0
  };
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer, 
    initialState,
    loadCartFromStorage
  );

  // ذخیره خودکار در localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }, [state]);

  // محاسبه مقادیر با useMemo برای عملکرد بهتر
  const { totalPrice, totalItems, totalUniqueItems, branchSummaries } = useMemo(() => {
    const allItems = Object.values(state.branchCarts)
      .flatMap(branch => branch.items);
    
    const branchSummaries = Object.entries(state.branchCarts).map(([branchId, branch]) => ({
      branchId: parseInt(branchId),
      branchName: branch.branchName,
      itemCount: branch.items.length,
      total: branch.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }));
    
    return {
      totalPrice: allItems.reduce((total, item) => total + item.price * item.quantity, 0),
      totalItems: allItems.reduce((total, item) => total + item.quantity, 0),
      totalUniqueItems: allItems.length,
      branchSummaries
    };
  }, [state.branchCarts]);

  // جمع کل یک شعبه خاص
  const getBranchTotal = useCallback((branchId: number) => {
    const branch = state.branchCarts[branchId];
    if (!branch) return 0;
    return branch.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [state.branchCarts]);

  // آیتم‌های یک شعبه خاص
  const getBranchItems = useCallback((branchId: number) => {
    return state.branchCarts[branchId]?.items || [];
  }, [state.branchCarts]);

  // تعداد یک آیتم خاص در شعبه
  const getItemQuantity = useCallback((itemId: number, branchId: number) => {
    const branch = state.branchCarts[branchId];
    if (!branch) return 0;
    const item = branch.items.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }, [state.branchCarts]);

  // اطلاعات کامل یک شعبه
  const getBranchInfo = useCallback((branchId: number) => {
    const branch = state.branchCarts[branchId];
    if (!branch) return null;
    
    return {
      items: branch.items,
      branchName: branch.branchName,
      total: getBranchTotal(branchId),
      itemCount: branch.items.length,
      lastUpdated: branch.lastUpdated
    };
  }, [state.branchCarts, getBranchTotal]);

  // لیست همه شعب
  const getAllBranches = useCallback(() => {
    return Object.entries(state.branchCarts).map(([branchId, branch]) => ({
      branchId: parseInt(branchId),
      branchName: branch.branchName,
      itemCount: branch.items.length,
      total: getBranchTotal(parseInt(branchId))
    }));
  }, [state.branchCarts, getBranchTotal]);

  // متدهای کمکی
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const mergeCart = useCallback((items: CartItem[]) => {
    dispatch({ type: 'MERGE_CART', payload: items });
  }, []);

  const syncCart = useCallback((cartState: CartState) => {
    dispatch({ type: 'SYNC_CART', payload: cartState });
  }, []);

  // قابلیت export/import سبد خرید
  const exportCart = useCallback(() => {
    return JSON.stringify(state);
  }, [state]);

  const importCart = useCallback((cartData: string) => {
    try {
      const parsed = JSON.parse(cartData);
      if (parsed.branchCarts && parsed.version) {
        syncCart(parsed);
        return true;
      }
    } catch (error) {
      console.error('Failed to import cart:', error);
    }
    return false;
  }, [syncCart]);

  const value = {
    state,
    dispatch,
    totalPrice,
    totalItems,
    totalUniqueItems,
    clearAll,
    getBranchTotal,
    getBranchItems,
    getItemQuantity,
    getBranchInfo,
    getAllBranches,
    mergeCart,
    syncCart,
    exportCart,
    importCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// هوک برای ذخیره سبد خرید در sessionStorage در صورت بسته شدن تب
export function useCartSessionPersistence() {
  const { state } = useCart();
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('cart_backup', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to backup cart:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state]);
  
  // بازگرداندن از sessionStorage در صورت لود صفحه
  useEffect(() => {
    const backup = sessionStorage.getItem('cart_backup');
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        // می‌توانید تصمیم بگیرید که از backup استفاده کنید یا خیر
        sessionStorage.removeItem('cart_backup');
      } catch (error) {
        console.error('Failed to restore cart backup:', error);
      }
    }
  }, []);
}