export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  calories?: number;
  rating?: number;
  category?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  categories: string[];
  menu: Dish[];
}

export interface CartItem extends Dish {
  quantity: number;
  notes?: string;
}

export enum Screen {
  HOME = 'HOME',
  RESTAURANT = 'RESTAURANT',
  DISH_DETAILS = 'DISH_DETAILS',
  CART = 'CART',
  TRACKING = 'TRACKING',
  BROWSE = 'BROWSE'
}