import React, { useEffect } from 'react';
import { IStory } from '../types';
import { X, Heart, MessageCircle } from 'lucide-react';
import { RARITY_COLORS, RARITY_BADGE_COLORS } from '../constants';

interface StoryViewerProps {
  story: IStory;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  // Auto-close after 5 seconds roughly simulating story behavior
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-200">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div className="h-full bg-white animate-[width_5s_linear]"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-4 mt-2">
        <div className="flex items-center space-x-2">
          <img src={story.user.avatar} className="w-8 h-8 rounded-full border border-white" alt={story.user.name} />
          <span className="text-white font-semibold text-sm">{story.user.name}</span>
          <span className="text-gray-300 text-xs">• Ahora</span>
        </div>
        <button onClick={onClose} className="text-white p-2">
          <X size={24} />
        </button>
      </div>

      {/* Story Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full aspect-[3/4] rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden ${RARITY_COLORS[story.activeCard.rarity]}`}>
           {/* Background Decoration */}
           <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${RARITY_BADGE_COLORS[story.activeCard.rarity]}`}></div>
           
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${RARITY_BADGE_COLORS[story.activeCard.rarity]}`}>
             {story.activeCard.rarity}
           </span>
           <h2 className="text-2xl font-bold mb-4">{story.activeCard.title}</h2>
           <p className="text-lg opacity-90">"{story.activeCard.description}"</p>
        </div>
      </div>

      {/* Footer / Reply */}
      <div className="p-4 pb-8 flex items-center space-x-4">
         <input 
            type="text" 
            placeholder={`Responder a ${story.user.name}...`}
            className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white"
         />
         <button className="text-white">
            <Heart size={28} />
         </button>
      </div>
    </div>
  );
};