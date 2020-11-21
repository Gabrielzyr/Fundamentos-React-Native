import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartItems = await AsyncStorage.getItem('@GoMarket/Cart');
      if (cartItems) {
        setProducts([...JSON.parse(cartItems)]);
        console.log('cartItems', cartItems);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const alreadyInCart = products.find(item => item.id === product.id);

      if (alreadyInCart) {
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@GoMarket/Cart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem('@GoMarket/Cart', JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const getProductQuantity = products.find(item => item.id === id);

      if (getProductQuantity?.quantity === 1) {
        const excludeProduct = products.filter(product =>
          product.id !== id ? { ...product } : null,
        );
        setProducts(excludeProduct);
        await AsyncStorage.setItem(
          '@GoMarket/Cart',
          JSON.stringify(excludeProduct),
        );
      } else {
        const lessProducts = products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        );
        setProducts(lessProducts);
        await AsyncStorage.setItem(
          '@GoMarket/Cart',
          JSON.stringify(lessProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
