import React from 'react';
import { ICard } from '../types';
import { RARITY_COLORS, RARITY_BADGE_COLORS } from '../constants';
import { Sparkles, Heart, Shield, Zap, Coffee } from 'lucide-react';

interface CardProps {
  card: ICard;
  onClick?: () => void;
  mini?: boolean;
}

export const CardComponent: React.FC<CardProps> = ({ card, onClick, mini = false }) => {
  const getIcon = () => {
    switch (card.rarity) {
      case 'Común': return <Coffee size={mini ? 16 : 28} strokeWidth={1.5} />;
      case 'Rara': return <Heart size={mini ? 16 : 28} strokeWidth={1.5} />;
      case 'Épica': return <Shield size={mini ? 16 : 28} strokeWidth={1.5} />;
      case 'Legendaria': return <Zap size={mini ? 16 : 28} strokeWidth={1.5} />;
      case 'Especial': return <Sparkles size={mini ? 16 : 28} strokeWidth={1.5} />;
      default: return <Coffee size={mini ? 16 : 28} strokeWidth={1.5} />;
    }
  };

  const baseClasses = `relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none ${RARITY_COLORS[card.rarity]}`;
  const sizeClasses = mini ? 'w-24 h-32 p-3 hover:-translate-y-1 hover:shadow-md' : 'w-full aspect-[2.5/4] max-w-sm mx-auto p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2';

  return (
    <div
      className={`${baseClasses} ${sizeClasses}`}
      onClick={onClick}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPScjZmZmJy8+CjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JzMwMCcvPgo8L3N2Zz4=')" }}></div>

      <div className="flex justify-between items-start z-10">
        <div className={`rounded-xl p-2 ${RARITY_BADGE_COLORS[card.rarity]} bg-opacity-30 backdrop-blur-sm shadow-sm`}>
          {getIcon()}
        </div>
        {!mini && (
          <div className="flex flex-col items-end">
            <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${RARITY_BADGE_COLORS[card.rarity]} bg-opacity-20 border border-current`}>
              {card.rarity}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center text-center mt-4 z-10">
        <h3 className={`${mini ? 'text-xs leading-tight line-clamp-3' : 'text-2xl'} font-black mb-3 tracking-tight text-gray-800 drop-shadow-sm`}>
          {card.title}
        </h3>
        {!mini && <p className="text-base text-gray-700 font-medium leading-relaxed opacity-90">{card.description}</p>}
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
    </div>
  );
};