'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { getUserFromToken } from '@/lib/auth';
import Modal from '@/components/Modal';

type Country = {
  id: number;
  name: string;
  code: string;
  cities: { id: number; name: string }[];
};

type CountryForm = {
  name: string;
  code: string;
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [deleteCountry, setDeleteCountry] = useState<Country | null>(null);

  const user = getUserFromToken();
  const isAdmin = user?.role === 'admin';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CountryForm>();

  const fetchCountries = async () => {
    try {
      const res = await api.get('/country');
      setCountries(res.data.data);
    } catch {
      setError('Impossible de charger les pays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const openCreate = () => {
    reset();
    setFormError('');
    setShowCreate(true);
  };

  const openEdit = (country: Country) => {
    setEditCountry(country);
    setValue('name', country.name);
    setValue('code', country.code);
    setFormError('');
  };

  const onCreate = async (data: CountryForm) => {
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/country', { ...data, code: data.code.toUpperCase() });
      await fetchCountries();
      setShowCreate(false);
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la création';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = async (data: CountryForm) => {
    if (!editCountry) return;
    setFormError('');
    setSubmitting(true);
    try {
      await api.patch(`/country/${editCountry.id}`, {
        ...data,
        code: data.code.toUpperCase(),
      });
      await fetchCountries();
      setEditCountry(null);
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la modification';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deleteCountry) return;
    setSubmitting(true);
    try {
      await api.delete(`/country/${deleteCountry.id}`);
      await fetchCountries();
      setDeleteCountry(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Formulaire partagé Create / Edit ──────────────────────────────────────
  const CountryFormFields = ({ mode }: { mode: 'create' | 'edit' }) => (
    <form
      onSubmit={handleSubmit(mode === 'create' ? onCreate : onEdit)}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nom du pays
        </label>
        <input
          placeholder="France"
          {...register('name', {
            required: 'Le nom est requis',
            minLength: { value: 2, message: 'Minimum 2 caractères' },
          })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder-slate-400"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Code ISO{' '}
          <span className="text-slate-400 font-normal text-xs">(2–5 lettres)</span>
        </label>
        <input
          placeholder="FR"
          {...register('code', {
            required: 'Le code est requis',
            minLength: { value: 2, message: 'Minimum 2 caractères' },
            maxLength: { value: 5, message: 'Maximum 5 caractères' },
            pattern: { value: /^[A-Za-z]+$/, message: 'Lettres uniquement' },
          })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder-slate-400 uppercase tracking-widest"
        />
        {errors.code && (
          <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
        )}
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span> {formError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setShowCreate(false);
            setEditCountry(null);
            reset();
          }}
          className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> En cours...</>
          ) : mode === 'create' ? (
            '+ Créer'
          ) : (
            '✓ Enregistrer'
          )}
        </button>
      </div>
    </form>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Chargement des pays...</p>
        </div>
      </div>
    );
  }

  // ── Page ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="text-4xl">🗺️</span> Pays
          </h1>
          <p className="text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{countries.length}</span> pays enregistrés
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un pays
          </button>
        )}
      </div>

      {/* Role notice */}
      {!isAdmin && (
        <div className="mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          <span>ℹ️</span>
          <span>Mode lecture seule — seuls les administrateurs peuvent modifier les pays.</span>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un pays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder-slate-400 bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Stats bar */}
      {countries.length > 0 && (
        <div className="flex gap-4 mb-6">
          <StatBadge value={countries.length} label="Pays" color="blue" />
          <StatBadge
            value={countries.reduce((acc, c) => acc + (c.cities?.length || 0), 0)}
            label="Villes"
            color="indigo"
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucun pays trouvé"
          subtitle={search ? `Aucun résultat pour "${search}"` : 'Commencez par ajouter un pays'}
          action={isAdmin ? <button onClick={openCreate} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">+ Ajouter un pays</button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((country) => (
            <div
              key={country.id}
              className="card-hover bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            >
              {/* Header carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">{country.code}</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{country.name}</h2>
                    <span className="text-xs text-slate-400">ID #{country.id}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <ActionButton
                      onClick={() => openEdit(country)}
                      icon="✏️"
                      label="Modifier"
                      variant="blue"
                    />
                    <ActionButton
                      onClick={() => setDeleteCountry(country)}
                      icon="🗑️"
                      label="Supprimer"
                      variant="red"
                    />
                  </div>
                )}
              </div>

              {/* Villes */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Villes
                  </p>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {country.cities?.length || 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {country.cities?.length > 0 ? (
                    <>
                      {country.cities.slice(0, 4).map((city) => (
                        <span
                          key={city.id}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium"
                        >
                          {city.name}
                        </span>
                      ))}
                      {country.cities.length > 4 && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">
                          +{country.cities.length - 4}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Aucune ville</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}

      {/* Créer */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Ajouter un pays">
        <CountryFormFields mode="create" />
      </Modal>

      {/* Modifier */}
      <Modal
        isOpen={!!editCountry}
        onClose={() => { setEditCountry(null); reset(); }}
        title={`Modifier — ${editCountry?.name}`}
      >
        <CountryFormFields mode="edit" />
      </Modal>

      {/* Supprimer */}
      <Modal
        isOpen={!!deleteCountry}
        onClose={() => setDeleteCountry(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗑️</span>
          </div>
          <p className="font-semibold text-slate-800 mb-1">
            Supprimer <span className="text-red-600">{deleteCountry?.name}</span> ?
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Cette action est irréversible. Les villes liées seront également supprimées.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteCountry(null)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onDelete}
              disabled={submitting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Composants utilitaires ──────────────────────────────────────────────────

function StatBadge({ value, label, color }: { value: number; label: string; color: string }) {
  const classes: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${classes[color]}`}>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  variant,
}: {
  onClick: () => void;
  icon: string;
  label: string;
  variant: 'blue' | 'red';
}) {
  const cls =
    variant === 'blue'
      ? 'hover:text-blue-600 hover:bg-blue-50'
      : 'hover:text-red-600 hover:bg-red-50';
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 text-slate-400 rounded-lg transition-colors ${cls}`}
    >
      <span className="text-base leading-none">{icon}</span>
    </button>
  );
}

function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">🔍</span>
      </div>
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      {action}
    </div>
  );
}
