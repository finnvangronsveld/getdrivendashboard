import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Save, RotateCcw, Euro, Clock, Moon, Route, Percent, Timer } from 'lucide-react';
import { toast } from 'sonner';

const FIELDS = [
  { key: 'base_rate', label: 'Basistarief (€/uur)', icon: Euro, step: '0.01', desc: 'Uurloon voor eerste uren' },
  { key: 'normal_hours_threshold', label: 'Normaal Uren Drempel', icon: Timer, step: '0.5', desc: 'Uren voordat overuren beginnen' },
  { key: 'overtime_multiplier', label: 'Overuren Multiplier', icon: Clock, step: '0.1', desc: 'Vermenigvuldigingsfactor voor overuren' },
  { key: 'night_surcharge', label: 'Nachttoeslag (€/uur)', icon: Moon, step: '0.01', desc: 'Extra per uur tussen 20:00-06:00' },
  { key: 'wwv_rate', label: 'WWV Tarief (€/km)', icon: Route, step: '0.01', desc: 'Woon-werk verkeer vergoeding per km' },
  { key: 'social_contribution_pct', label: 'Sociale Bijdrage (%)', icon: Percent, step: '0.01', desc: 'Percentage sociale bijdrage' },
];

const DEFAULTS = {
  base_rate: 12.83,
  overtime_multiplier: 1.5,
  night_surcharge: 1.46,
  wwv_rate: 0.26,
  social_contribution_pct: 2.71,
  normal_hours_threshold: 9.0,
};

export default function Settings() {
  const { axiosAuth } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const api = axiosAuth();
    api.get('/settings').then(res => {
      setSettings({ ...DEFAULTS, ...res.data });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [axiosAuth]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = axiosAuth();
      await api.put('/settings', settings);
      toast.success('Instellingen opgeslagen!');
    } catch {
      toast.error('Kon instellingen niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    toast.info('Standaardwaarden hersteld (nog niet opgeslagen)');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="settings-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'Chivo, sans-serif' }} data-testid="settings-title">
          Instellingen
        </h1>
        <p className="text-zinc-500 text-sm mb-10">Pas je tarieven aan. Deze worden toegepast op nieuwe ritten.</p>

        <div className="space-y-4">
          {FIELDS.map(({ key, label, icon: Icon, step, desc }) => (
            <div
              key={key}
              className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-5 hover:border-[#D9F99D]/20 transition-colors"
              data-testid={`setting-${key}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D9F99D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-[#D9F99D]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
                <input
                  type="number"
                  step={step}
                  min="0"
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: parseFloat(e.target.value) || 0 })}
                  data-testid={`setting-input-${key}`}
                  className="w-28 bg-[#09090B] border border-[#27272A] text-white h-10 rounded-lg px-3 text-right font-mono text-sm focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-[#D9F99D]/5 border border-[#D9F99D]/20 rounded-xl p-5">
          <h3 className="text-[#D9F99D] text-sm font-semibold mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>Hoe werkt de berekening?</h3>
          <ul className="text-zinc-400 text-xs space-y-1.5 leading-relaxed">
            <li>Eerste {settings.normal_hours_threshold}u aan €{settings.base_rate}/uur = normaal tarief</li>
            <li>Daarna: €{settings.base_rate} x {settings.overtime_multiplier} = €{(settings.base_rate * settings.overtime_multiplier).toFixed(2)}/uur (overuren)</li>
            <li>Tussen 20:00-06:00: +€{settings.night_surcharge}/uur nachttoeslag</li>
            <li>WWV: {settings.wwv_rate} €/km woon-werk verkeer vergoeding</li>
            <li>Sociale bijdrage: {settings.social_contribution_pct}% op bruto loon</li>
            <li>Student in Belgie: geen inkomstenbelasting</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            data-testid="settings-save-button"
            className="flex-1 bg-[#D9F99D] text-black font-bold h-12 rounded-lg hover:bg-[#BEF264] hover:shadow-[0_0_20px_rgba(217,249,157,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Opslaan
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            data-testid="settings-reset-button"
            className="px-5 h-12 rounded-lg border border-[#27272A] text-zinc-400 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
