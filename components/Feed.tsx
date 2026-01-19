import React, { useState } from 'react';
import { IFeedItem } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera, X, Send } from 'lucide-react';
import { RARITY_BADGE_COLORS } from '../constants';

interface FeedProps {
  items: IFeedItem[];
}

const FeedItem: React.FC<{ item: IFeedItem }> = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  
  // Local state for memory media (Photo/Video)
  const [memory, setMemory] = useState<string | null>(item.memoryImage || null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const toggleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'LoveDeck',
      text: `${item.user.name} jugó la carta ${item.card.title} en LoveDeck`,
      url: shareUrl,
    };

    const fallbackShare = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
             alert("¡Enlace copiado al portapapeles!");
        }).catch(() => {
             console.error("Failed to copy");
        });
    };

    // Verify if navigator.share exists and the URL is valid (http/https) for sharing
    if (navigator.share && (shareUrl.startsWith('http') || shareUrl.startsWith('https'))) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Ignore AbortError (user cancelled share sheet)
        if ((error as Error).name !== 'AbortError') {
            console.warn("Share failed:", error);
            fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setMemory(url);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [...prev, commentText]);
    setCommentText("");
  };

  return (
    <div className="bg-white border-b border-gray-100 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <img src={item.user.avatar} alt={item.user.name} className="w-8 h-8 rounded-full border border-gray-200" />
          <div>
            <p className="text-sm font-semibold">{item.user.name}</p>
            <p className="text-xs text-gray-500">Jugó {item.card.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <span className={`text-[10px] px-2 py-1 rounded-full ${RARITY_BADGE_COLORS[item.card.rarity]}`}>
              {item.card.rarity}
            </span>
            <button className="text-gray-400">
                <MoreHorizontal size={16} />
            </button>
        </div>
      </div>

      {/* Content (Card Visual) */}
      <div className="relative w-full bg-gray-50 flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-all">
         <div className={`absolute inset-0 opacity-10 ${RARITY_BADGE_COLORS[item.card.rarity]}`}></div>
         
         <div className="z-10 max-w-xs">
            <h3 className="text-xl font-bold text-gray-800 mb-3">{item.card.title}</h3>
            <p className="text-gray-600 italic font-serif">"{item.card.description}"</p>
         </div>
      </div>

      {/* Add Memory Section (Compact) */}
      <div className="px-4 mt-3">
        {memory ? (
            <div className="relative rounded-xl overflow-hidden shadow-sm bg-gray-100">
                {mediaType === 'image' ? (
                   <img src={memory} className="w-full h-auto max-h-96 object-cover" alt="Recuerdo" />
                ) : (
                   <video src={memory} controls className="w-full h-auto max-h-96" />
                )}
                <button 
                  onClick={() => setMemory(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <X size={16} />
                </button>
            </div>
        ) : (
             <label className="flex items-center justify-center w-full py-2.5 border border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors gap-2 group">
                <Camera size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-purple-700">Añadir foto o video</span>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
            </label>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex justify-between items-center mt-1">
        <div className="flex space-x-4">
            <button 
                onClick={toggleLike}
                className={`${liked ? 'text-pink-600 scale-110' : 'text-gray-800 hover:text-pink-600'} transition-all duration-200`}
            >
                <Heart size={26} fill={liked ? "currentColor" : "none"} />
            </button>
            <button 
                onClick={() => setShowComments(!showComments)}
                className={`transition-colors ${showComments ? 'text-blue-500' : 'text-gray-800 hover:text-blue-500'}`}
            >
                <MessageCircle size={26} />
            </button>
            <button onClick={handleShare} className="text-gray-800 hover:text-green-500 transition-colors">
                <Share2 size={26} />
            </button>
        </div>
      </div>

      {/* Likes & Info */}
      <div className="px-4 space-y-1 mb-2">
        <p className="text-sm font-bold text-gray-900">{likeCount} Me gusta</p>
        <p className="text-gray-500 text-[10px] uppercase tracking-wide pt-1">
          {item.timestamp.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-2 animate-in slide-in-from-top-2 duration-200">
             {comments.length > 0 && (
                <div className="mb-3 space-y-2">
                    {comments.map((c, i) => (
                        <div key={i} className="text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <span className="font-bold text-xs text-gray-900 block mb-0.5">Tú</span>
                            <span className="text-gray-700">{c}</span>
                        </div>
                    ))}
                </div>
             )}
             <form onSubmit={handlePostComment} className="flex gap-2 items-center">
                <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-gray-100 text-sm px-4 py-2.5 rounded-full outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white border border-transparent focus:border-purple-200 transition-all"
                />
                <button 
                    type="submit" 
                    disabled={!commentText.trim()} 
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                    <Send size={18} />
                </button>
             </form>
        </div>
      )}
    </div>
  );
};

export const Feed: React.FC<FeedProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8 text-center">
        <Heart size={48} className="mb-4 opacity-50" />
        <p>Aún no hay recuerdos.</p>
        <p className="text-sm">¡Juega una carta para empezar!</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-2">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
};