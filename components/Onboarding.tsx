
import React, { useState } from 'react';
import { Heart, Sparkles, Copy, Check, ArrowRight, UserPlus, Users, ChevronDown } from 'lucide-react';
import { IUser } from '../types';
import { INITIAL_DECK } from '../constants';

interface OnboardingProps {
  onLogin: (user: IUser) => void;
}

type Step = 'welcome' | 'create_profile' | 'join_profile' | 'code_reveal';

export const Onboarding: React.FC<OnboardingProps> = ({ onLogin }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'Hombre',
    partnerName: '',
    partnerGender: 'Mujer',
    code: '',
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateAccount = () => {
    if (!formData.name || !formData.partnerName) return; // Basic validation

    const newCode = generateCode();
    setGeneratedCode(newCode);
    setStep('code_reveal');
  };

  const handleJoinAccount = () => {
    if (!formData.name || !formData.code || !formData.partnerName) return;

    try {
      // Create user in Firestore
      const newUser: IUser = {
        id: `user_${Date.now()}`, // In a real auth, use auth.currentUser.uid
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        partnerName: formData.partnerName,
        partnerGender: formData.partnerGender,
        coupleCode: formData.code,
        deck: [], // Deck deals in App
        lastPlayedDate: null
      };

      onLogin(newUser);
    } catch (error) {
      console.error("Error joining:", error);
      alert("Hubo un error al unirse. Inténtalo de nuevo.");
    }
  };

  const finishCreation = () => {
    // Create User Object
    const newUser: IUser = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      gender: formData.gender,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      partnerName: formData.partnerName,
      partnerGender: formData.partnerGender,
      coupleCode: generatedCode,
      deck: [], // Deck is dealt in App.tsx
      lastPlayedDate: null
    };

    onLogin(newUser);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- RENDER STEPS ---

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-800 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 mb-8 shadow-2xl">
          <Heart size={64} className="text-pink-300 drop-shadow-lg animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-2 font-serif tracking-wide">LoveDeck</h1>
        <p className="text-lg text-purple-100 mb-12 max-w-xs leading-relaxed">
          Gamifica tu relación, conecta con tu pareja y crea recuerdos inolvidables.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setStep('create_profile')}
            className="w-full bg-white text-purple-700 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-50 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Crear Nueva Pareja
          </button>

          <button
            onClick={() => setStep('join_profile')}
            className="w-full bg-purple-900/40 text-white border border-white/30 py-4 rounded-xl font-bold text-lg hover:bg-purple-900/60 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Tengo un Código
          </button>
        </div>

        <p className="text-xs text-white/40 mt-8">Versión 1.1.0</p>
      </div>
    );
  }

  const GenderSelect = ({ label, name, value }: { label: string, name: string, value: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all appearance-none bg-white"
        >
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="No Binario">No Binario</option>
        </select>
        <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
      </div>
    </div>
  );

  if (step === 'create_profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 overflow-y-auto">
        <button onClick={() => setStep('welcome')} className="self-start p-2 text-gray-400 hover:text-gray-800">
          ← Volver
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-6">
          <div className="mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Perfil</h2>
            <p className="text-gray-500">Inicia tu aventura en pareja.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
              <input
                name="name"
                type="text"
                placeholder="Ej. Alex"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              />
            </div>
            <GenderSelect label="Tu Género" name="gender" value={formData.gender} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Email</label>
              <input
                name="email"
                type="email"
                placeholder="alex@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              />
            </div>
            <hr className="border-gray-100 my-2" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Pareja</label>
              <input
                name="partnerName"
                type="text"
                placeholder="Ej. Sam"
                value={formData.partnerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Así aparecerá en tu interfaz hasta que se una.</p>
            </div>
            <GenderSelect label="Género de tu Pareja" name="partnerGender" value={formData.partnerGender} />
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={!formData.name || !formData.partnerName}
            className="mt-8 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (step === 'code_reveal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-800 flex flex-col items-center justify-center p-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¡Código Creado!</h2>
        <p className="text-purple-100 mb-8 max-w-xs">
          Comparte este código con {formData.partnerName} para vincular sus cuentas.
        </p>

        <div
          onClick={copyToClipboard}
          className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 mb-4 w-full max-w-xs cursor-pointer hover:bg-white/30 transition-colors relative group"
        >
          <p className="text-sm text-white/60 mb-2 uppercase tracking-widest font-bold">Código de Pareja</p>
          <p className="text-4xl font-mono font-bold tracking-widest">{generatedCode}</p>

          <div className="absolute top-4 right-4 text-white/60 group-hover:text-white transition-colors">
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </div>
        </div>

        <p className="text-sm text-white/60 mb-12 h-6">
          {copied ? '¡Copiado al portapapeles!' : 'Toca la tarjeta para copiar'}
        </p>

        <button
          onClick={finishCreation}
          className="w-full max-w-xs bg-white text-purple-700 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
        >
          Entrar a LoveDeck <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  if (step === 'join_profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 overflow-y-auto">
        <button onClick={() => setStep('welcome')} className="self-start p-2 text-gray-400 hover:text-gray-800">
          ← Volver
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-6">
          <div className="mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Unirse a Pareja</h2>
            <p className="text-gray-500">Ingresa el código que te compartieron.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
              <input
                name="name"
                type="text"
                placeholder="Ej. Sam"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>
            <GenderSelect label="Tu Género" name="gender" value={formData.gender} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Email</label>
              <input
                name="email"
                type="email"
                placeholder="sam@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>
            <hr className="border-gray-100 my-2" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Pareja</label>
              <input
                name="partnerName"
                type="text"
                placeholder="Ej. Alex"
                value={formData.partnerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>
            <GenderSelect label="Género de tu Pareja" name="partnerGender" value={formData.partnerGender} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de Invitación</label>
              <input
                name="code"
                type="text"
                placeholder="XXXXXX"
                maxLength={6}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-mono tracking-widest uppercase"
              />
            </div>
          </div>

          <button
            onClick={handleJoinAccount}
            disabled={!formData.name || !formData.code || !formData.partnerName}
            className="mt-8 w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
          >
            Vincular y Entrar
          </button>
        </div>
      </div>
    );
  }

  return null;
};
