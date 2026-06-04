'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserFromToken, logout } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUserFromToken());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🌍</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">GeoManager</span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden sm:flex items-center gap-1">
              <NavLink href="/countries" label="🗺️ Pays" active={isActive('/countries')} />
              <NavLink href="/cities" label="🏙️ Villes" active={isActive('/cities')} />
            </div>
          )}

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Badge rôle */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800 leading-none">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{user.role}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/login')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile hamburger (pour utilisateur connecté) */}
            {user && (
              <button
                className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && menuOpen && (
          <div className="sm:hidden border-t border-slate-100 py-3 space-y-1">
            <MobileNavLink href="/countries" label="🗺️ Pays" active={isActive('/countries')} onClick={() => setMenuOpen(false)} />
            <MobileNavLink href="/cities" label="🏙️ Villes" active={isActive('/cities')} onClick={() => setMenuOpen(false)} />
            <div className="pt-2 border-t border-slate-100 mt-2">
              <p className="text-xs text-slate-400 px-3 mb-1">{user.email} · {user.role}</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
