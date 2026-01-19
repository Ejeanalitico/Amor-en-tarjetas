import React from 'react';
import { IStory, IUser } from '../types';

interface StoriesProps {
  stories: IStory[];
  currentUser: IUser;
  onStoryClick: (story: IStory) => void;
  onAddClick: () => void;
}

export const Stories: React.FC<StoriesProps> = ({ stories, currentUser, onStoryClick, onAddClick }) => {
  // Check if current user has an active story
  const myStory = stories.find(s => s.user.id === currentUser.id);
  const otherStories = stories.filter(s => s.user.id !== currentUser.id);

  return (
    <div className="w-full bg-white border-b border-gray-100 pt-4 pb-2">
      <div className="flex overflow-x-auto space-x-4 px-4 pb-2 no-scrollbar">
        
        {/* User Story / Add Button */}
        <div 
            className="flex flex-col items-center space-y-1 min-w-[72px] cursor-pointer"
            onClick={() => myStory ? onStoryClick(myStory) : onAddClick()}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${myStory ? 'p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600' : 'border-2 border-dashed border-gray-300 bg-gray-50'}`}>
             <img 
                src={currentUser.avatar} 
                alt="Me" 
                className={`w-full h-full rounded-full object-cover border-2 border-white ${!myStory && 'opacity-50'}`} 
             />
             {!myStory && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl text-gray-600 font-bold">+</span>
                 </div>
             )}
          </div>
          <span className="text-xs text-gray-500 font-medium">Tu estado</span>
        </div>

        {/* Active Stories */}
        {otherStories.map(story => (
          <div 
            key={story.id} 
            className="flex flex-col items-center space-y-1 min-w-[72px] cursor-pointer"
            onClick={() => onStoryClick(story)}
          >
            <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600 transition-transform active:scale-95">
              <img 
                src={story.user.avatar} 
                alt={story.user.name} 
                className="w-full h-full rounded-full border-2 border-white object-cover" 
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                🃏
              </div>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center">{story.user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};