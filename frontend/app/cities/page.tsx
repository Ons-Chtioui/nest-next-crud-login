'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { getUserFromToken } from '@/lib/auth';
import Modal from '@/components/Modal';

type City = {
  id: number;
  name: string;
  description: string;
  active: boolean;
  country: { id: number; name: string; code: string } | null;
};

type Country = {
  id: number;
  name: string;
  code: string;
};

type CityForm = {
  name: string;
  description: string;
  active: boolean;
  countryId: number;
};

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [showCreate, setShowCreate] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [deleteCity, setDeleteCity] = useState<City | null>(null);

  const user = getUserFromToken();
  const isAdmin = user?.role === 'admin';

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CityForm>({ defaultValues: { active: true } });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm<CityForm>({ defaultValues: { active: true } });

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities');
      setCities(res.data.data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError("Vous n'avez pas la permission d'accéder aux villes.");
      } else {
        setError('Impossible de charger les villes');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await api.get('/country');
      setCountries(res.data.data);
    } catch {
      
    }
  };

  useEffect(() => {
    fetchCities();
    fetchCountries();
  }, []);

  const openCreate = () => {
    resetCreate({ active: true, countryId: 0 });
    setFormError('');
    setShowCreate(true);
  };

  const openEdit = (city: City) => {
    setEditValue('name', city.name);
    setEditValue('description', city.description || '');
    setEditValue('active', city.active);
    setEditValue('countryId', city.country?.id ?? 0);
    setFormError('');
    setEditCity(city);
  };

  const onCreate = async (data: CityForm) => {
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/cities', { ...data, countryId: Number(data.countryId) });
      await fetchCities();
      setShowCreate(false);
      resetCreate();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la création';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = async (data: CityForm) => {
    if (!editCity) return;
    setFormError('');
    setSubmitting(true);
    try {
      await api.patch(`/cities/${editCity.id}`, {
        ...data,
        countryId: Number(data.countryId),
      });
      await fetchCities();
      setEditCity(null);
      resetEdit();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la modification';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deleteCity) return;
    setSubmitting(true);
    try {
      await api.delete(`/cities/${deleteCity.id}`);
      await fetchCities();
      setDeleteCity(null);
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = cities.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.active) ||
      (filterStatus === 'inactive' && !c.active);
    return matchSearch && matchStatus;
  });

  const activeCount = cities.filter((c) => c.active).length;
  const inactiveCount = cities.length - activeCount;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Chargement des villes...</p>
        </div>
      </div>
    );
  }

  if (error && cities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <p className="text-lg font-bold text-slate-800 mb-1">Accès refusé</p>
          <p className="text-slate-500 text-sm">{error}</p>
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
            <span className="text-4xl">🏙️</span> Villes
          </h1>
          <p className="text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{cities.length}</span> villes enregistrées
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
            Ajouter une ville
          </button>
        )}
      </div>

      {/* Role notice */}
      {!isAdmin && (
        <div className="mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          <span>ℹ️</span>
          <span>Mode lecture seule — seuls les administrateurs peuvent gérer les villes.</span>
        </div>
      )}

      {/* Stats */}
      {cities.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <StatChip value={cities.length} label="Total" color="slate" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
          <StatChip value={activeCount} label="Actives" color="green" active={filterStatus === 'active'} onClick={() => setFilterStatus('active')} />
          <StatChip value={inactiveCount} label="Inactives" color="slate" active={filterStatus === 'inactive'} onClick={() => setFilterStatus('inactive')} />
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
            placeholder="Rechercher une ville ou un pays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder-slate-400 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <p className="text-lg font-semibold text-slate-700">Aucune ville trouvée</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? `Aucun résultat pour "${search}"` : 'Commencez par ajouter une ville'}
          </p>
          {isAdmin && !search && (
            <button onClick={openCreate} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
              + Ajouter une ville
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((city) => (
            <div
              key={city.id}
              className={`card-hover bg-white rounded-2xl border shadow-sm p-5 ${
                city.active ? 'border-slate-200' : 'border-slate-200 opacity-70'
              }`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    city.active ? 'bg-blue-50' : 'bg-slate-100'
                  }`}>
                    <span className="text-xl">🏙️</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{city.name}</h2>
                      <StatusBadge active={city.active} />
                    </div>
                    {city.country && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                          {city.country.code}
                        </span>
                        <span className="text-xs text-slate-400">{city.country.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(city)}
                      title="Modifier"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteCity(city)}
                      title="Supprimer"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {city.description && (
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 pl-13">{city.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Créer ── */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetCreate(); }} title="Ajouter une ville">
        <form onSubmit={handleCreateSubmit(onCreate)} className="space-y-4">
          <CityFields
            register={registerCreate}
            errors={createErrors}
            countries={countries}
            formError={formError}
            submitting={submitting}
            onCancel={() => { setShowCreate(false); resetCreate(); }}
            submitLabel="+ Créer"
          />
        </form>
      </Modal>

      {/* ── Modal Modifier ── */}
      <Modal
        isOpen={!!editCity}
        onClose={() => { setEditCity(null); resetEdit(); }}
        title={`Modifier — ${editCity?.name}`}
      >
        <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4">
          <CityFields
            register={registerEdit}
            errors={editErrors}
            countries={countries}
            formError={formError}
            submitting={submitting}
            onCancel={() => { setEditCity(null); resetEdit(); }}
            submitLabel="✓ Enregistrer"
          />
        </form>
      </Modal>

      {/* ── Modal Supprimer ── */}
      <Modal
        isOpen={!!deleteCity}
        onClose={() => setDeleteCity(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗑️</span>
          </div>
          <p className="font-semibold text-slate-800 mb-1">
            Supprimer <span className="text-red-600">{deleteCity?.name}</span> ?
          </p>
          <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteCity(null)}
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

// ── Sous-composants ─────────────────────────────────────────────────────────

function CityFields({
  register,
  errors,
  countries,
  formError,
  submitting,
  onCancel,
  submitLabel,
}: {
  register: any;
  errors: any;
  countries: Country[];
  formError: string;
  submitting: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la ville</label>
        <input
          placeholder="Paris"
          {...register('name', {
            required: 'Le nom est requis',
            minLength: { value: 3, message: 'Minimum 3 caractères' },
          })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder-slate-400"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
        </label>
        <textarea
          placeholder="Une brève description..."
          rows={3}
          {...register('description')}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 placeholder-slate-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pays</label>
        <select
          {...register('countryId', {
            required: 'Veuillez sélectionner un pays',
            valueAsNumber: true,
            validate: (v: number) => v > 0 || 'Veuillez sélectionner un pays',
          })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 bg-white"
        >
          <option value={0}>— Sélectionner un pays —</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
        {errors.countryId && (
          <p className="mt-1 text-xs text-red-500">{errors.countryId.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          id="active-field"
          {...register('active')}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
        <label htmlFor="active-field" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
          Ville active
        </label>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span> {formError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
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
          ) : submitLabel}
        </button>
      </div>
    </>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
      active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function StatChip({
  value,
  label,
  color,
  active,
  onClick,
}: {
  value: number;
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    slate: active ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
    green: active ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:border-green-300',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${colors[color]}`}
    >
      <span className="font-bold">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </button>
  );
}
