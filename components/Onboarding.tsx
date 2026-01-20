
import React, { useState } from 'react';
import { Heart, Sparkles, Copy, Check, ArrowRight, UserPlus, Users, ChevronDown } from 'lucide-react';
import { IUser } from '../types';
import { INITIAL_DECK } from '../constants';

interface OnboardingProps {
  onLogin: (user: IUser, isCreator: boolean) => void;
  authUser?: any;
}

type Step = 'welcome' | 'create_profile' | 'join_profile' | 'code_reveal' | 'login';

import { registerUser, loginUser } from '../services/authService';

export const Onboarding: React.FC<OnboardingProps> = ({ onLogin, authUser }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    name: authUser?.displayName || '',
    email: authUser?.email || '',
    password: '',
    gender: 'Hombre',
    partnerName: '',
    partnerGender: 'Mujer',
    code: '',
  });

  // Effect to handle case where user is already auth'd (e.g. from failed creation flow)
  React.useEffect(() => {
    if (authUser?.email) {
      setFormData(prev => ({ ...prev, email: authUser.email }));
      // If we are on login screen but already auth'd, go to welcome or profile creation
      if (step === 'login') {
        setStep('welcome');
      }
    }
  }, [authUser]);

  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLoginAccount = async () => {
    if (!formData.email || !formData.password) {
      alert("Por favor ingresa email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(formData.email, formData.password);
    } catch (error: any) {
      console.error("Login Error:", error);
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.name || !formData.partnerName || (!authUser && (!formData.email || !formData.password))) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      if (!authUser) {
        await registerUser(formData.email, formData.password);
      }
      const newCode = generateCode();
      setGeneratedCode(newCode);
      setStep('code_reveal');
    } catch (error: any) {
      console.error("Registration Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        // Optionally try to login if password matches, or just alert user
        try {
          await loginUser(formData.email, formData.password);
          // If login succeeds with the same credentials, just proceed to code generation/profile setup
          // Check if user already has a profile? For now, we assume if they are "creating" they might want to overwrite or just enter.
          // But 'finishCreation' logic relies on 'generatedCode'.

          // Simplest flow: Tell them the email exists and redirect to login state
          alert("Este correo ya está registrado. Redirigiendo a inicio de sesión...");
          setStep('login');
        } catch (loginError: any) {
          alert("Este correo ya está registrado, pero la contraseña no coincide. Por favor inicia sesión.");
          setStep('login');
        }
      } else {
        alert("Error al crear cuenta: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAccount = async () => {
    if (!formData.name || !formData.code || !formData.partnerName || (!authUser && (!formData.email || !formData.password))) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      let uid = authUser?.uid;

      if (!authUser) {
        const userCredential = await registerUser(formData.email, formData.password);
        uid = userCredential.user.uid;
      }

      // Create user in Firestore with the Auth UID
      const newUser: IUser = {
        id: uid,
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        partnerName: formData.partnerName,
        partnerGender: formData.partnerGender,
        coupleCode: formData.code,
        deck: [],
        lastPlayedDate: null
      };

      onLogin(newUser, false); // isCreator = false
    } catch (error: any) {
      console.error("Error joining:", error);
      alert("Hubo un error al unirse: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const finishCreation = () => {
    // At this point user is already created in Auth (from handleCreateAccount)
    // We just need to construct the object and pass it to App.tsx to save in Firestore
    // Note: Ideally we should use the auth.currentUser.uid here
    const uid = authUser?.uid;

    if (uid) {
      const newUser: IUser = {
        id: uid,
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        partnerName: formData.partnerName,
        partnerGender: formData.partnerGender,
        coupleCode: generatedCode,
        deck: [],
        lastPlayedDate: null
      };
      onLogin(newUser, true); // isCreator = true
    } else {
      import('../services/firebase').then(({ auth }) => {
        if (auth.currentUser) {
          const newUser: IUser = {
            id: auth.currentUser.uid,
            name: formData.name,
            email: formData.email,
            gender: formData.gender,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
            partnerName: formData.partnerName,
            partnerGender: formData.partnerGender,
            coupleCode: generatedCode,
            deck: [],
            lastPlayedDate: null
          };
          onLogin(newUser, true);
        }
      });
    }
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

        {authUser && (
          <div className="mb-8 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/20 animate-in fade-in slide-in-from-top-4">
            <p className="text-sm text-white/90 font-medium">Sesión iniciada como</p>
            <p className="font-bold text-lg">{authUser.email}</p>
            <p className="text-xs text-white/70 mt-1">Completa tu perfil para continuar</p>
          </div>
        )}

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setStep('create_profile')}
            className="w-full bg-white text-purple-700 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-50 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            {authUser ? 'Completar Perfil' : 'Crear Nueva Pareja'}
          </button>

          <button
            onClick={() => setStep('join_profile')}
            className="w-full bg-purple-900/40 text-white border border-white/30 py-4 rounded-xl font-bold text-lg hover:bg-purple-900/60 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Users size={20} />
            {authUser ? 'Vincular con Código' : 'Tengo un Código'}
          </button>

          {!authUser && (
            <button
              onClick={() => setStep('login')}
              className="w-full bg-white/10 text-white border border-white/40 hover:bg-white/20 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              ¿Ya tienes cuenta? Iniciar Sesión
            </button>
          )}
        </div>

        <p className="text-xs text-white/40 mt-8">Versión 1.1.0</p>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl">
          <button onClick={() => setStep('welcome')} className="text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-2">
            <ArrowRight size={16} className="rotate-180" /> Volver
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
          <p className="text-gray-500 mb-8">Ingresa tus credenciales para continuar.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleLoginAccount}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-purple-700 mt-8 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Iniciar Sesión <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
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
            <div className={`w-12 h-12 ${authUser ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-600'} rounded-full flex items-center justify-center mb-4`}>
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{authUser ? 'Completar Perfil' : 'Crear Perfil'}</h2>
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
                disabled={!!authUser} // Disable if already auth'd
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all ${authUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>

            {!authUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crea una Contraseña</label>
                <input
                  name="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                />
              </div>
            )}

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
            <div className={`w-12 h-12 ${authUser ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'} rounded-full flex items-center justify-center mb-4`}>
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{authUser ? 'Completar Vinculación' : 'Unirse a Pareja'}</h2>
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
                disabled={!!authUser}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all ${authUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>

            {!authUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crea una Contraseña</label>
                <input
                  name="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>
            )}

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
