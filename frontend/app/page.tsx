import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4">

      {/* Hero badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Application de gestion géographique
      </div>

      {/* Globe icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6 rotate-3">
        <span className="text-4xl">🌍</span>
      </div>

      <h1 className="text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
        Bienvenue sur{' '}
        <span className="gradient-text">GeoManager</span>
      </h1>
      <p className="text-xl text-slate-500 mb-10 max-w-lg">
        Gérez vos pays et villes facilement avec une interface moderne et sécurisée.
      </p>

      <div className="flex flex-wrap gap-4 justify-center mb-16">
        <Link
          href="/login"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          Créer un compte
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        <FeatureCard
          emoji="🗺️"
          title="Pays"
          description="Créez et gérez vos pays avec leur code ISO et leurs villes associées."
          color="blue"
        />
        <FeatureCard
          emoji="🏙️"
          title="Villes"
          description="Ajoutez des villes, associez-les à leurs pays et gérez leur statut."
          color="indigo"
        />
        <FeatureCard
          emoji="🔒"
          title="Sécurisé"
          description="Authentification JWT avec gestion des rôles admin / utilisateur."
          color="purple"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
  color,
}: {
  emoji: string;
  title: string;
  description: string;
  color: 'blue' | 'indigo' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card-hover bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-left">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
