import React from 'react';
import { Home, Layers, User } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItemClass = (view: ViewState) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === view ? 'text-pink-600' : 'text-gray-400'}`;

  return (
    <div className="fixed bottom-0 w-full h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe">
      <button onClick={() => setView('feed')} className={navItemClass('feed')}>
        <Home size={24} />
        <span className="text-xs font-medium">Historial</span>
      </button>
      <button onClick={() => setView('deck')} className={navItemClass('deck')}>
        <Layers size={24} />
        <span className="text-xs font-medium">Mazo</span>
      </button>
      <button onClick={() => setView('profile')} className={navItemClass('profile')}>
        <User size={24} />
        <span className="text-xs font-medium">Perfil</span>
      </button>
    </div>
  );
};