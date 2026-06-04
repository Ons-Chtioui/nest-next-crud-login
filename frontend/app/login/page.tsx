'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const token = res.data.data.access_token;
      setToken(token);
      router.push('/cities');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Email ou mot de passe incorrect';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
            <p className="text-slate-500 text-sm mt-1">Accédez à votre espace GeoManager</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="exemple@email.com"
                autoComplete="email"
                {...register('email', {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Format d'email invalide",
                  },
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800 placeholder-slate-400"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: { value: 6, message: 'Minimum 6 caractères' },
                  })}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Erreur serveur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <span>👑</span> Compte démo administrateur
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>admin@gmail.com</span>
            <span className="text-slate-300">/</span>
            <span>123456</span>
            <button
              type="button"
              onClick={() => {
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                const pwdInput = document.querySelector('input[type="password"], input[type="text"]') as HTMLInputElement;
                if (emailInput) emailInput.value = 'admin@gmail.com';
                if (pwdInput) pwdInput.value = '123456';
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium transition-colors"
            >
              Copier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
