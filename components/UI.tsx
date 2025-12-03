import React from 'react';
import { ChevronLeft, ShoppingBag, Plus, Minus, Star, Clock } from 'lucide-react';

// --- Types ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

// --- Components ---

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', fullWidth, className = '', ...props 
}) => {
  const baseStyle = "font-medium rounded-lg py-3 px-6 transition-all active:scale-95 shadow-sm";
  const variants = {
    primary: "bg-primary text-white hover:bg-primaryDark shadow-md",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    outline: "border-2 border-primary text-primary hover:bg-green-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none"
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const IconButton: React.FC<IconButtonProps> = ({ icon, className = '', ...props }) => (
  <button 
    className={`p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors ${className}`}
    {...props}
  >
    {icon}
  </button>
);

export const Header: React.FC<{ 
  title?: string; 
  onBack?: () => void; 
  rightAction?: React.ReactNode;
  transparent?: boolean;
}> = ({ title, onBack, rightAction, transparent = false }) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 transition-all duration-300 ${transparent ? 'bg-transparent text-white' : 'bg-surface text-gray-900 shadow-sm'}`}>
      <div className="flex items-center gap-2">
        {onBack && (
          <IconButton 
            icon={<ChevronLeft size={24} className={transparent ? "text-white drop-shadow-md" : "text-gray-800"} />} 
            onClick={onBack} 
            className={transparent ? "bg-black/20 hover:bg-black/30 backdrop-blur-sm" : ""}
          />
        )}
        {title && <h1 className="text-xl font-bold truncate">{title}</h1>}
      </div>
      <div>{rightAction}</div>
    </div>
  );
};

export const RatingBadge: React.FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => (
  <div className={`flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold ${className}`}>
    <Star size={12} fill="currentColor" />
    <span>{rating}</span>
  </div>
);

export const QuantitySelector: React.FC<{ 
  quantity: number; 
  onIncrease: () => void; 
  onDecrease: () => void; 
}> = ({ quantity, onIncrease, onDecrease }) => (
  <div className="flex items-center gap-4 bg-gray-100 rounded-full px-2 py-1">
    <IconButton onClick={onDecrease} icon={<Minus size={18} />} disabled={quantity <= 1} />
    <span className="font-bold text-lg w-6 text-center">{quantity}</span>
    <IconButton onClick={onIncrease} icon={<Plus size={18} />} />
  </div>
);
