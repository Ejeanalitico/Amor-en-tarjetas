import React, { useState } from 'react';
import { X, ArrowRight, Heart, Layers, User, HelpCircle } from 'lucide-react';

interface TutorialOverlayProps {
    onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "¡Bienvenido a LoveDeck!",
            description: "Esta aplicación te ayudará a conectar con tu pareja a través de pequeños retos y preguntas diarias.",
            icon: <Heart size={48} className="text-pink-500 mb-4" />,
            highlight: ""
        },
        {
            title: "Tu Mazo de Cartas",
            description: "Tienes 100 cartas únicas. Cada carta es una oportunidad para interactuar.",
            icon: <Layers size={48} className="text-purple-500 mb-4" />,
            highlight: "En la pestaña 'Mazo' encontrarás todas tus cartas organizadas por rareza."
        },
        {
            title: "Juega una Carta al Día",
            description: "El objetivo es jugar UNA carta diariamente. Esto creará un recuerdo en el muro compartido.",
            icon: <Sparkles size={48} className="text-amber-500 mb-4" />,
            highlight: "Selecciona una carta y lánzala. Tu pareja recibirá una notificación (simulada por ahora)."
        },
        {
            title: "Tu Perfil y Pareja",
            description: "Aquí puedes ver tu progreso y el código para vincularte si aún no lo has hecho.",
            icon: <User size={48} className="text-blue-500 mb-4" />,
            highlight: "Visita tu perfil para ver estadísticas."
        }
    ];

    // Need to import Sparkles inside component to avoid error if not imported above? 
    // Ah, let's just use the Lucide import I already have or added.
    // Wait, I didn't import Sparkles in the import statement above. Adding it.

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-tr-full -ml-8 -mb-8 opacity-50 pointer-events-none"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                    <div className="mb-2 p-4 bg-gray-50 rounded-full border border-gray-100 shadow-sm animate-bounce-slow">
                        {currentStep.icon}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentStep.title}</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                        {currentStep.description}
                    </p>
                    {currentStep.highlight && (
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-6 text-sm text-blue-800 w-full font-medium">
                            💡 {currentStep.highlight}
                        </div>
                    )}

                    <div className="flex items-center justify-between w-full mt-4">
                        <div className="flex gap-2">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-purple-600' : 'w-2 bg-gray-300'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all active:scale-95"
                        >
                            {step === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
                            {step < steps.length - 1 && <ArrowRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple import fix for Sparkles if missing
import { Sparkles } from 'lucide-react';
