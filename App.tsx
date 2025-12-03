import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Search, ShoppingBag, User, MapPin, Clock, 
  ChevronRight, Star, Plus, Minus, CreditCard, CheckCircle, Sparkles, Send, ArrowRight, ChevronLeft
} from 'lucide-react';
import { Screen, Restaurant, Dish, CartItem } from './types';
import { getGeminiRecommendations } from './services/geminiService';
import { Button, Header, IconButton, RatingBadge, QuantitySelector } from './components/UI';

// --- MOCK DATA ---
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Burger & Co.',
    rating: 4.5,
    deliveryTime: '25-35 min',
    deliveryFee: 1.99,
    image: 'https://picsum.photos/seed/burger/800/600',
    categories: ['American', 'Burgers'],
    menu: [
      { id: 'd1', name: 'Classic Cheese', description: 'Angus beef, cheddar, lettuce, tomato, secret sauce', price: 12.99, image: 'https://picsum.photos/seed/cheeseburger/400/300', calories: 850 },
      { id: 'd2', name: 'Bacon Deluxe', description: 'Double patty, crispy bacon, onion rings, BBQ sauce', price: 15.99, image: 'https://picsum.photos/seed/baconburger/400/300', calories: 1100 },
      { id: 'd3', name: 'Veggie Stack', description: 'Plant-based patty, avocado, sprouts, aioli', price: 13.50, image: 'https://picsum.photos/seed/veggieburger/400/300', calories: 650 },
    ]
  },
  {
    id: 'r2',
    name: 'Sushi Zen',
    rating: 4.8,
    deliveryTime: '40-55 min',
    deliveryFee: 3.99,
    image: 'https://picsum.photos/seed/sushi/800/600',
    categories: ['Japanese', 'Sushi'],
    menu: [
      { id: 'd4', name: 'Dragon Roll', description: 'Eel, cucumber, topped with avocado', price: 14.00, image: 'https://picsum.photos/seed/sushis/400/300', calories: 400 },
      { id: 'd5', name: 'Spicy Tuna', description: 'Fresh tuna, spicy mayo, sesame seeds', price: 9.50, image: 'https://picsum.photos/seed/spicytuna/400/300', calories: 320 },
    ]
  },
  {
    id: 'r3',
    name: 'Bella Napoli',
    rating: 4.7,
    deliveryTime: '30-45 min',
    deliveryFee: 0,
    image: 'https://picsum.photos/seed/pizza/800/600',
    categories: ['Italian', 'Pizza'],
    menu: [
      { id: 'd6', name: 'Margherita', description: 'San Marzano tomato, mozzarella di bufala, basil', price: 16.00, image: 'https://picsum.photos/seed/margherita/400/300', calories: 900 },
      { id: 'd7', name: 'Pepperoni', description: 'Mozzarella, spicy pepperoni, oregano', price: 18.00, image: 'https://picsum.photos/seed/pepperoni/400/300', calories: 1050 },
    ]
  }
];

const BROWSE_CATEGORIES = [
  'Burgers', 'Pizza', 'Sushi', 'Asian', 'Mexican', 
  'Dessert', 'Healthy', 'Indian', 'Thai', 'Italian', 
  'Breakfast', 'Vegan', 'Wings', 'Sandwiches', 'Coffee', 'Ice Cream'
];

// --- APP COMPONENT ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [activeDish, setActiveDish] = useState<Dish | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Navigation Helper
  const navigateTo = (screen: Screen) => {
    window.scrollTo(0, 0);
    setCurrentScreen(screen);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setActiveRestaurant(restaurant);
    navigateTo(Screen.RESTAURANT);
  };

  const handleDishClick = (dish: Dish) => {
    setActiveDish(dish);
    navigateTo(Screen.DISH_DETAILS);
  };

  const addToCart = (dish: Dish, quantity: number, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => item.id === dish.id ? { 
          ...item, 
          quantity: item.quantity + quantity,
          notes: notes || item.notes 
        } : item);
      }
      return [...prev, { ...dish, quantity, notes }];
    });
    navigateTo(Screen.CART);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // --- SUB-SCREENS ---

  const SplashScreen = () => (
    <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center text-white animate-fade-out">
      <div className="animate-pulse flex flex-col items-center">
        <h1 className="text-7xl font-black tracking-tighter drop-shadow-md italic">ZEST</h1>
        <div className="w-12 h-1 bg-white rounded-full mt-2 mb-2"></div>
        <p className="text-green-50 text-sm font-bold tracking-[0.3em] uppercase">Food Delivery</p>
      </div>
    </div>
  );

  // 1. HOME SCREEN
  const HomeScreen = () => {
    const [prompt, setPrompt] = useState('');
    const [aiResults, setAiResults] = useState<Dish[]>([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    const handleAiSearch = async () => {
      if (!prompt.trim()) return;
      setIsLoadingAi(true);
      const results = await getGeminiRecommendations(prompt);
      setAiResults(results);
      setIsLoadingAi(false);
    };

    return (
      <div className="pb-24">
        <div className="bg-surface sticky top-0 z-10 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primaryDark">
              <MapPin size={20} />
              <span className="font-bold">123 Main St, New York</span>
              <ChevronRight size={16} />
            </div>
            <div className="bg-gray-100 p-2 rounded-full">
              <User size={20} className="text-gray-600" />
            </div>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="What are you craving?" 
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* AI Discovery Section */}
        <div className="mt-4 px-4">
          <div className="bg-gradient-to-r from-primary to-green-400 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-200 animate-pulse" />
                <h2 className="font-bold text-lg">AI Cravings Solver</h2>
              </div>
              <p className="text-sm opacity-90 mb-4">Tell us what you feel like eating, and we'll find the perfect match.</p>
              <div className="flex gap-2">
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. spicy asian food under $15"
                  className="flex-1 bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 text-white placeholder-white/70 outline-none border border-white/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                />
                <button 
                  onClick={handleAiSearch}
                  className="bg-white text-primary rounded-lg px-4 font-bold active:scale-95 transition-transform"
                >
                  {isLoadingAi ? '...' : <ArrowRight size={20} />}
                </button>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* AI Results */}
          {aiResults.length > 0 && (
            <div className="mt-6 animate-fade-in">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Recommended for you
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {aiResults.map(dish => (
                  <div key={dish.id} onClick={() => handleDishClick(dish)} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm overflow-hidden active:scale-95 transition-transform">
                    <img src={dish.image} alt={dish.name} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 line-clamp-1">{dish.name}</h4>
                        <span className="text-primary font-bold text-sm">${dish.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dish.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mt-6 px-4">
          <h3 className="font-bold text-lg mb-3">Categories</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {['Burgers', 'Pizza', 'Sushi', 'Asian', 'Mexican', 'Dessert'].map((cat, i) => (
              <div key={i} onClick={() => navigateTo(Screen.BROWSE)} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer active:scale-95 transition-transform">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center p-3">
                  <img src={`https://picsum.photos/seed/${cat}/100`} alt={cat} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-xs font-medium text-gray-700">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Restaurants */}
        <div className="mt-8 px-4">
          <h3 className="font-bold text-lg mb-4">Popular Near You</h3>
          <div className="flex flex-col gap-5">
            {MOCK_RESTAURANTS.map(restaurant => (
              <div key={restaurant.id} onClick={() => handleRestaurantClick(restaurant)} className="bg-white rounded-xl shadow-sm overflow-hidden active:bg-gray-50 transition-colors cursor-pointer">
                <div className="relative h-48">
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {restaurant.deliveryTime}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xl font-bold text-gray-900">{restaurant.name}</h4>
                    <RatingBadge rating={restaurant.rating} />
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <span>{restaurant.categories.join(', ')}</span>
                    <span>•</span>
                    <span>${restaurant.deliveryFee} delivery</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 2. RESTAURANT SCREEN
  const RestaurantScreen = () => {
    if (!activeRestaurant) return null;

    return (
      <div className="bg-white min-h-screen pb-20">
        <Header 
          transparent 
          onBack={() => navigateTo(Screen.HOME)} 
          rightAction={<IconButton icon={<Search size={24} className="text-white drop-shadow-md" />} />}
        />
        <div className="relative h-64">
          <img src={activeRestaurant.image} alt={activeRestaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold mb-1">{activeRestaurant.name}</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">{activeRestaurant.categories[0]}</span>
              <span>•</span>
              <div className="flex items-center">
                <Star size={14} className="fill-current text-yellow-400 mr-1" /> 
                {activeRestaurant.rating}
              </div>
              <span>•</span>
              <span>{activeRestaurant.deliveryTime}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-t-3xl -mt-6 bg-white relative z-10">
          <h2 className="font-bold text-xl mb-4">Menu</h2>
          <div className="space-y-6">
            {activeRestaurant.menu.map(dish => (
              <div key={dish.id} onClick={() => handleDishClick(dish)} className="flex gap-4 items-start border-b border-gray-100 pb-6 last:border-0 cursor-pointer">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{dish.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2">{dish.description}</p>
                  <span className="font-bold text-gray-900">${dish.price.toFixed(2)}</span>
                </div>
                <div className="w-28 h-28 flex-shrink-0 relative">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover rounded-xl" />
                  <button className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md text-primary">
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 3. DISH DETAILS SCREEN
  const DishDetailsScreen = () => {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [includeCutlery, setIncludeCutlery] = useState(false);
    
    if (!activeDish) return null;

    return (
      <div className="bg-white min-h-screen flex flex-col">
        <div className="relative h-[40vh]">
          <img src={activeDish.image} alt={activeDish.name} className="w-full h-full object-cover" />
          <Header transparent onBack={() => {
              if (activeRestaurant) navigateTo(Screen.RESTAURANT);
              else navigateTo(Screen.HOME);
          }} />
        </div>
        
        <div className="flex-1 bg-white -mt-10 rounded-t-3xl relative z-10 px-6 pt-8 pb-24 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900 w-3/4">{activeDish.name}</h1>
            <span className="text-2xl font-bold text-primary">${activeDish.price.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1"><Clock size={14}/> 20 min</span>
            <span>•</span>
            <span className="flex items-center gap-1">🔥 {activeDish.calories} kcal</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{activeDish.description}</p>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Special Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. No onions, sauce on the side..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
              rows={3}
            />
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-gray-900">Quantity</span>
              <QuantitySelector 
                quantity={quantity} 
                onIncrease={() => setQuantity(q => q + 1)}
                onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
              />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
               <input 
                  type="checkbox" 
                  id="cutlery"
                  checked={includeCutlery}
                  onChange={(e) => setIncludeCutlery(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
               <label htmlFor="cutlery" className="text-gray-700 font-medium cursor-pointer select-none">
                 Request disposable cutlery
               </label>
            </div>

            <Button fullWidth onClick={() => {
                const combinedNotes = [notes, includeCutlery ? 'Cutlery Requested' : ''].filter(Boolean).join(' | ');
                addToCart(activeDish, quantity, combinedNotes);
            }}>
              Add to Cart - ${(activeDish.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 4. CART SCREEN
  const CartScreen = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 2.99;
    const total = subtotal + delivery;

    if (cart.length === 0) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-green-100 p-6 rounded-full mb-6">
            <ShoppingBag size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => navigateTo(Screen.HOME)}>Start Exploring</Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background pb-32">
        <Header title="My Cart" onBack={() => navigateTo(Screen.HOME)} />
        <div className="mt-16 p-4 space-y-4">
          {/* Cart Items */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-6">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4">
                <img src={item.image} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                  {item.notes && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded mb-3 border border-gray-100 inline-block">
                      <span className="font-semibold">Note:</span> {item.notes}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 rounded px-2 py-1">
                      <button className="text-gray-400" onClick={() => item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item.id)}><Minus size={16}/></button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button className="text-primary" onClick={() => addToCart(item, 1)}><Plus size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method Preview */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <CreditCard className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Visa ending in 4242</p>
                <p className="text-xs text-gray-500">Default payment method</p>
              </div>
            </div>
            <span className="text-primary text-sm font-bold">Change</span>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>${delivery.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button fullWidth onClick={() => {
            setCart([]);
            navigateTo(Screen.TRACKING);
          }}>
            Checkout • ${total.toFixed(2)}
          </Button>
        </div>
      </div>
    );
  };

  // 5. TRACKING SCREEN
  const TrackingScreen = () => {
    // Simple state to simulate progress
    const [step, setStep] = useState(0);
    
    useEffect(() => {
      const timers = [
        setTimeout(() => setStep(1), 2000),
        setTimeout(() => setStep(2), 6000),
        setTimeout(() => setStep(3), 10000),
      ];
      return () => timers.forEach(clearTimeout);
    }, []);

    const steps = [
      { title: 'Order Placed', time: '12:30 PM', completed: step >= 0 },
      { title: 'Restaurant Preparing', time: '12:32 PM', completed: step >= 1 },
      { title: 'Driver Picked Up', time: '12:45 PM', completed: step >= 2 },
      { title: 'Arriving Soon', time: '12:55 PM', completed: step >= 3 },
    ];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
        {/* Mock Map Background */}
        <div className="h-[45vh] bg-blue-100 relative overflow-hidden flex items-center justify-center">
            {/* Simple CSS patterns to look like a map */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-0 w-full h-4 bg-white rotate-12"></div>
                <div className="absolute top-1/2 left-0 w-full h-6 bg-white -rotate-6"></div>
                <div className="absolute top-0 right-20 h-full w-4 bg-white"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center animate-bounce">
                <div className="bg-primary text-white p-3 rounded-full shadow-lg border-4 border-white">
                    <MapPin size={32} fill="currentColor" />
                </div>
                <div className="bg-black/20 w-8 h-2 rounded-[100%] mt-2 blur-sm"></div>
            </div>
            
            <Button 
                variant="ghost" 
                className="absolute top-4 left-4 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => navigateTo(Screen.HOME)}
            >
                <ChevronLeft />
            </Button>
        </div>

        <div className="flex-1 bg-white -mt-6 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] relative z-20 p-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Estimated Delivery</h2>
                    <p className="text-3xl font-bold text-primary mt-1">12:55 PM</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-3">
                   <Clock size={24} className="text-gray-600" /> 
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8 pl-4 border-l-2 border-gray-100 ml-2 relative">
                {steps.map((s, i) => (
                    <div key={i} className={`relative pl-6 transition-all duration-500 ${s.completed ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${s.completed ? 'bg-primary border-primary' : 'bg-white border-gray-300'} flex items-center justify-center`}>
                            {s.completed && <CheckCircle size={10} className="text-white" />}
                        </div>
                        <h4 className="font-bold text-gray-900">{s.title}</h4>
                        <p className="text-sm text-gray-500">{s.time}</p>
                    </div>
                ))}
            </div>

            {/* Driver Info */}
            {step >= 2 && (
                <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-center gap-4 animate-fade-in">
                    <img src="https://picsum.photos/seed/driver/100" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900">Michael R.</h4>
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span>4.9</span>
                            <span>•</span>
                            <span>Toyota Prius</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <IconButton icon={<Send size={18} className="text-primary"/>} className="bg-white shadow-sm" />
                    </div>
                </div>
            )}
            
            {step >= 3 && (
                 <div className="mt-6">
                    <Button fullWidth onClick={() => navigateTo(Screen.HOME)}>Order Received</Button>
                 </div>
            )}
        </div>
      </div>
    );
  };

  // 6. BROWSE SCREEN (NEW)
  const BrowseScreen = () => {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
         <div className="bg-white px-4 pt-4 pb-2 sticky top-0 z-10 shadow-sm">
           <h1 className="text-2xl font-bold mb-4">Browse</h1>
           <div className="relative mb-2">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search food, groceries, etc." 
                className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50"
              />
           </div>
         </div>
         
         <div className="p-4">
           <h2 className="font-bold text-lg mb-4">Top Categories</h2>
           <div className="grid grid-cols-2 gap-4">
             {BROWSE_CATEGORIES.map((cat, i) => (
               <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform h-36">
                  <img src={`https://picsum.photos/seed/${cat}/100`} alt={cat} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                  <span className="font-medium text-gray-800">{cat}</span>
               </div>
             ))}
           </div>
         </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  // Bottom Navigation Overlay (only for main screens)
  const showBottomNav = [Screen.HOME, Screen.CART, Screen.BROWSE, Screen.TRACKING].includes(currentScreen);

  // Return Splash Screen first
  if (showSplash) {
      return <SplashScreen />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl relative overflow-hidden">
      
      <div className="min-h-screen pb-safe">
        {currentScreen === Screen.HOME && <HomeScreen />}
        {currentScreen === Screen.RESTAURANT && <RestaurantScreen />}
        {currentScreen === Screen.DISH_DETAILS && <DishDetailsScreen />}
        {currentScreen === Screen.CART && <CartScreen />}
        {currentScreen === Screen.TRACKING && <TrackingScreen />}
        {currentScreen === Screen.BROWSE && <BrowseScreen />}
      </div>

      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 z-50 max-w-md mx-auto pb-4 h-[80px]">
             <div className="flex justify-between items-center relative h-full">
                
                {/* Left Side */}
                <button onClick={() => navigateTo(Screen.HOME)} className={`flex flex-col items-center gap-1 w-14 ${currentScreen === Screen.HOME ? 'text-primary' : 'text-gray-400'}`}>
                   <Home size={24} strokeWidth={currentScreen === Screen.HOME ? 2.5 : 2} />
                   <span className="text-[10px] font-medium">Home</span>
                </button>

                <button onClick={() => navigateTo(Screen.BROWSE)} className={`flex flex-col items-center gap-1 w-14 ${currentScreen === Screen.BROWSE ? 'text-primary' : 'text-gray-400'}`}>
                   <Search size={24} strokeWidth={currentScreen === Screen.BROWSE ? 3 : 2} />
                   <span className="text-[10px] font-medium">Browse</span>
                </button>

                {/* Center Spacer for Floating Button */}
                <div className="w-16"></div>

                {/* Right Side */}
                <button onClick={() => navigateTo(Screen.TRACKING)} className={`flex flex-col items-center gap-1 w-14 ${currentScreen === Screen.TRACKING ? 'text-primary' : 'text-gray-400'}`}>
                   <Clock size={24} strokeWidth={currentScreen === Screen.TRACKING ? 2.5 : 2} />
                   <span className="text-[10px] font-medium">Orders</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-400 w-14">
                   <User size={24} />
                   <span className="text-[10px] font-medium">Profile</span>
                </button>

                {/* Floating Cart Button - Absolutely Positioned Center */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8">
                   <button 
                     onClick={() => navigateTo(Screen.CART)}
                     className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-4 border-white transition-transform active:scale-95 ${cart.length > 0 ? 'bg-primary text-white' : 'bg-gray-800 text-white'}`}
                   >
                      <div className="relative">
                        <ShoppingBag size={26} fill="currentColor" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] min-w-[20px] h-5 flex items-center justify-center rounded-full font-bold border-2 border-white px-1">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                      </div>
                   </button>
                </div>

             </div>
          </div>
      )}
    </div>
  );
}