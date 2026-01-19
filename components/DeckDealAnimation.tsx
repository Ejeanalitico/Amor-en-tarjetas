import React, { useEffect, useState } from 'react';
import { CardComponent } from './CardComponent';
import { ICard, Rarity } from '../types';

interface DeckDealAnimationProps {
  onComplete: () => void;
}

// Mock card for animation
const BACK_OF_CARD: ICard = {
  id: 'back',
  title: 'LoveDeck',
  description: '',
  rarity: Rarity.COMMON, // Using common color for back
};

export const DeckDealAnimation: React.FC<DeckDealAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(1); // Start dealing
    }, 500);

    const finishTimer = setTimeout(() => {
        onComplete();
    }, 3500); // Animation duration

    return () => {
        clearTimeout(timer);
        clearTimeout(finishTimer);
    }
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-48 h-64">
        {/* The Stack */}
        {[...Array(5)].map((_, i) => (
           <div 
             key={i}
             className="absolute inset-0 bg-white rounded-xl border-4 border-white shadow-2xl flex items-center justify-center transform transition-all duration-500"
             style={{ 
                 top: -i * 2, 
                 zIndex: 10 - i,
                 background: 'linear-gradient(135deg, #FF69B4 0%, #8A2BE2 100%)'
             }}
           >
              <span className="text-white font-serif font-bold text-2xl opacity-20">LD</span>
           </div>
        ))}

        {/* Flying Cards Animation */}
        {step >= 1 && (
            <>
                {/* Cards to User (Bottom) */}
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg animate-[throwToUser_0.5s_ease-out_forwards] z-20" style={{ animationDelay: '0.1s' }}></div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg animate-[throwToUser_0.5s_ease-out_forwards] z-20" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg animate-[throwToUser_0.5s_ease-out_forwards] z-20" style={{ animationDelay: '0.7s' }}></div>
                
                {/* Cards to Partner (Top) */}
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg animate-[throwToPartner_0.5s_ease-out_forwards] z-20" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg animate-[throwToPartner_0.5s_ease-out_forwards] z-20" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg animate-[throwToPartner_0.5s_ease-out_forwards] z-20" style={{ animationDelay: '0.8s' }}></div>
            </>
        )}
      </div>

      <div className={`mt-12 text-center transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-2xl font-bold text-white mb-2">Repartiendo la Suerte...</h2>
        <p className="text-gray-300">Asignando cartas a ti y a tu pareja</p>
      </div>

      <style>{`
        @keyframes throwToUser {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(0, 150vh) scale(1.5); opacity: 0; }
        }
        @keyframes throwToPartner {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(0, -150vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};