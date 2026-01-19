
import React, { useState, useEffect } from 'react';
import { INITIAL_DECK, MOCK_USER_ID, MOCK_PARTNER_ID, RARITY_BADGE_COLORS } from './constants';
import { ICard, IUser, IFeedItem, ViewState, IStory, Rarity } from './types';
import { generateCardFlavor } from './services/geminiService';
import { createUserProfile, updateUserProfile, getUserProfile } from './services/userService';
import { addToFeed, addStory, getFeed, getStories } from './services/feedService';
import { Navigation } from './components/Navigation';
import { CardComponent } from './components/CardComponent';
import { Feed } from './components/Feed';
import { Stories } from './components/Stories';
import { StoryViewer } from './components/StoryViewer';
import { Onboarding } from './components/Onboarding';
import { DeckDealAnimation } from './components/DeckDealAnimation';
import { Sparkles, X, Send, Lock, Copy, LogOut, RefreshCw, Edit2, Save } from 'lucide-react';

export default function App() {
    const [user, setUser] = useState<IUser | null>(null);
    const [view, setView] = useState<ViewState>('feed');
    const [feed, setFeed] = useState<IFeedItem[]>([]);
    const [stories, setStories] = useState<IStory[]>([]);

    // Dealing Animation State
    const [isDealing, setIsDealing] = useState(false);
    const [pendingUser, setPendingUser] = useState<IUser | null>(null);

    // Load User from LocalStorage on Mount
    useEffect(() => {
        const savedUserId = localStorage.getItem('lovedeck_user_id');
        if (savedUserId) {
            getUserProfile(savedUserId).then(u => {
                if (u) setUser(u);
            });
        }
        // Initial feed load
        getFeed().then(setFeed);
        getStories().then(setStories);
    }, []);

    // Card Play State
    const [selectedCard, setSelectedCard] = useState<ICard | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiText, setGeminiText] = useState<string>("");

    // Story View State
    const [viewingStory, setViewingStory] = useState<IStory | null>(null);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");

    const hasPlayedToday = () => {
        if (!user || !user.lastPlayedDate) return false;
        const today = new Date();
        return user.lastPlayedDate.getDate() === today.getDate() &&
            user.lastPlayedDate.getMonth() === today.getMonth() &&
            user.lastPlayedDate.getFullYear() === today.getFullYear();
    };

    const handleCardClick = (card: ICard) => {
        setSelectedCard(card);
        setGeminiText(""); // Reset
    };

    // --- Deck shuffling Logic ---
    const handleLogin = (newUser: IUser) => {
        setIsDealing(true);

        // Shuffle the full deck
        const shuffledDeck = [...INITIAL_DECK].sort(() => Math.random() - 0.5);

        // DEAL: Give 5 unique random cards to user
        const userDeck = shuffledDeck.slice(0, 5);

        // Assign to pending user
        const userWithDeck = {
            ...newUser,
            deck: userDeck
        };
        setPendingUser(userWithDeck);

        // Persist to Firestore
        createUserProfile(userWithDeck);
        localStorage.setItem('lovedeck_user_id', newUser.id);
    };

    const handleDealComplete = () => {
        if (pendingUser) {
            setUser(pendingUser);
            setPendingUser(null);
        }
        setIsDealing(false);
    };

    const handleReshuffle = () => {
        if (!user) return;
        setIsDealing(true);
        const shuffledDeck = [...INITIAL_DECK].sort(() => Math.random() - 0.5);
        const userDeck = shuffledDeck.slice(0, 5);
        setPendingUser({
            ...user,
            deck: userDeck
        });
    };

    const playCard = async () => {
        if (!selectedCard || !user) return;

        setIsPlaying(true);
        setGeminiLoading(true);

        const flavorText = await generateCardFlavor(selectedCard, user);

        setGeminiText(flavorText);
        setGeminiLoading(false);
    };

    const confirmPlayCard = () => {
        if (!selectedCard || !user) return;

        const newFeedItem: IFeedItem = {
            id: Math.random().toString(),
            card: { ...selectedCard, geminiContext: geminiText },
            user: user,
            timestamp: new Date(),
            likes: 0,
            comments: 0,
        };

        const newStory: IStory = {
            id: Math.random().toString(),
            user: user,
            activeCard: selectedCard,
            expiresAt: new Date(Date.now() + 86400000)
        };

        // Persist to Feed and Stories
        addToFeed(newFeedItem);
        addStory(newStory);

        setFeed([newFeedItem, ...feed]);
        setStories(prev => [newStory, ...prev.filter(s => s.user.id !== user.id)]);

        setUser(prev => {
            if (!prev) return null;
            const updatedUser = {
                ...prev,
                lastPlayedDate: new Date(),
                deck: prev.deck.filter(c => c.id !== selectedCard.id)
            };
            updateUserProfile(prev.id, updatedUser); // Sync to Firestore
            return updatedUser;
        });

        setSelectedCard(null);
        setIsPlaying(false);
        setView('feed');
    };

    const handleSaveProfile = () => {
        if (user && editName.trim()) {
            setUser({
                ...user,
                name: editName,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editName}` // Regen avatar based on new name
            });
            updateUserProfile(user.id, { name: editName });
            setIsEditingProfile(false);
        }
    };

    const startEditing = () => {
        if (user) {
            setEditName(user.name);
            setIsEditingProfile(true);
        }
    }

    const renderDeckByCategory = () => {
        if (!user) return null;
        const categories = Object.values(Rarity);
        const playedToday = hasPlayedToday();

        return (
            <div className="pb-24">
                {playedToday && (
                    <div className="bg-orange-50 border-b border-orange-100 p-4 mb-4 flex items-center justify-center space-x-2 text-orange-700">
                        <Lock size={16} />
                        <span className="text-sm font-medium">Has usado tu carta diaria. Vuelve mañana.</span>
                    </div>
                )}

                {categories.map(rarity => {
                    const cards = user.deck.filter(c => c.rarity === rarity);
                    if (cards.length === 0) return null;

                    return (
                        <div key={rarity} className="mb-6 px-4">
                            <div className="flex items-center mb-3">
                                <span className={`w-3 h-3 rounded-full mr-2 ${RARITY_BADGE_COLORS[rarity].split(' ')[0]}`}></span>
                                <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">{rarity}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {cards.map(card => (
                                    <div key={card.id} className={playedToday ? 'opacity-50 grayscale pointer-events-none' : ''}>
                                        <CardComponent card={card} onClick={() => handleCardClick(card)} mini />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {user.deck.length === 0 && (
                    <div className="py-12 px-6 text-center text-gray-400 flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Sparkles size={32} className="text-purple-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-700 mb-2">¡Ronda Terminada!</p>
                        <p className="text-sm mb-6">Has jugado todas tus cartas. ¿Listo para más?</p>
                        <button
                            onClick={handleReshuffle}
                            className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
                        >
                            <RefreshCw size={18} />
                            Nueva Mano (5 Cartas)
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // --- RENDER ---

    if (isDealing) {
        return <DeckDealAnimation onComplete={handleDealComplete} />;
    }

    if (!user) {
        return <Onboarding onLogin={handleLogin} />;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">

            {/* Top Bar (Sticky) */}
            <div className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="px-4 h-14 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 font-serif tracking-wide">
                        LoveDeck
                    </h1>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Sparkles size={20} className="text-gray-600" />
                    </button>
                </div>
                <Stories
                    stories={stories}
                    currentUser={user}
                    onStoryClick={setViewingStory}
                    onAddClick={() => setView('deck')}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {view === 'feed' && (
                    <Feed items={feed} />
                )}

                {view === 'deck' && renderDeckByCategory()}

                {view === 'profile' && (
                    <div className="p-6 pb-24 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
                        <div className="relative group">
                            <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 bg-gray-200" alt="Profile" />
                            {isEditingProfile && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-xs text-white font-medium">Se actualizará</span>
                                </div>
                            )}
                            <span className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>

                        {isEditingProfile ? (
                            <div className="flex items-center gap-2 mb-2 w-full max-w-[200px]">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full text-center border-b-2 border-purple-500 bg-transparent text-2xl font-bold text-gray-800 outline-none pb-1"
                                    autoFocus
                                />
                                <button onClick={handleSaveProfile} className="text-green-600 p-2 hover:bg-green-50 rounded-full">
                                    <Save size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                                <button onClick={startEditing} className="text-gray-400 hover:text-purple-600 p-1">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}

                        <p className="text-gray-500 mb-8 flex items-center gap-1">
                            Vinculado con <span className="font-semibold text-pink-600">{user.partnerName}</span>
                        </p>

                        <div className="w-full bg-white rounded-xl shadow-sm p-4 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-gray-600">Cartas jugadas</span>
                                <span className="font-bold">{feed.filter(f => f.user.id === user.id).length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-gray-600">Cartas recibidas</span>
                                <span className="font-bold">{feed.filter(f => f.user.id !== user.id).length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-gray-600">Cartas en mano</span>
                                <span className="font-bold text-blue-600">{user.deck.length}</span>
                            </div>

                            {/* Couple Code Section */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Tu Código de Vinculación</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-lg tracking-widest text-gray-800">{user.coupleCode || 'N/A'}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(user.coupleCode || '')}
                                        className="p-2 text-gray-400 hover:text-pink-600"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 w-full">
                            <button
                                onClick={() => {
                                    setUser(null);
                                    localStorage.removeItem('lovedeck_user_id');
                                }}
                                className="w-full py-3 text-red-500 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <Navigation currentView={view} setView={setView} />

            {/* Story Viewer Modal */}
            {viewingStory && (
                <StoryViewer story={viewingStory} onClose={() => setViewingStory(null)} />
            )}

            {/* Card Preview Modal */}
            {selectedCard && !isPlaying && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transform transition-all scale-100">
                        <div className="p-4 flex justify-end">
                            <button onClick={() => setSelectedCard(null)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 pb-6">
                            <CardComponent card={selectedCard} />
                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={playCard}
                                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex justify-center items-center gap-2"
                                >
                                    <Send size={18} />
                                    Lanzar Carta
                                </button>
                                <p className="text-xs text-center text-gray-400">Esta acción consume tu turno diario.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gemini Loading / Confirmation Modal */}
            {isPlaying && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
                    <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-8 text-center">
                        {geminiLoading ? (
                            <div className="py-8 flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                                <h3 className="text-lg font-bold text-gray-800">Conectando...</h3>
                                <p className="text-sm text-gray-500 mt-2">Enviando carta a {user.partnerName}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 text-purple-600 animate-pulse">
                                    <Sparkles size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Carta Lista!</h3>
                                <p className="text-gray-500 mb-8">
                                    Se ha notificado a tu pareja sobre esta acción.
                                </p>

                                <button
                                    onClick={confirmPlayCard}
                                    className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-transform"
                                >
                                    Confirmar Lanzamiento
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
