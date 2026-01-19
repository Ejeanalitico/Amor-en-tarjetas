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
    switch(card.rarity) {
      case 'Común': return <Coffee size={mini ? 16 : 24} />;
      case 'Rara': return <Heart size={mini ? 16 : 24} />;
      case 'Épica': return <Shield size={mini ? 16 : 24} />;
      case 'Legendaria': return <Zap size={mini ? 16 : 24} />;
      case 'Especial': return <Sparkles size={mini ? 16 : 24} />;
      default: return <Coffee size={mini ? 16 : 24} />;
    }
  };

  const baseClasses = `relative rounded-xl border-2 shadow-sm transition-transform active:scale-95 flex flex-col justify-between overflow-hidden cursor-pointer ${RARITY_COLORS[card.rarity]}`;
  const sizeClasses = mini ? 'w-24 h-32 p-2' : 'w-full aspect-[3/4] p-4';

  return (
    <div 
      className={`${baseClasses} ${sizeClasses}`} 
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className={`rounded-full p-1 ${RARITY_BADGE_COLORS[card.rarity]} bg-opacity-20`}>
          {getIcon()}
        </div>
        {!mini && <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${RARITY_BADGE_COLORS[card.rarity]}`}>{card.rarity}</span>}
      </div>

      <div className="flex-1 flex flex-col justify-center text-center mt-2">
        <h3 className={`${mini ? 'text-xs leading-tight' : 'text-lg'} font-bold mb-1`}>{card.title}</h3>
        {!mini && <p className="text-sm opacity-90 leading-snug">{card.description}</p>}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );
};