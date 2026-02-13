import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trophy, CalendarRange, Clock, Euro, Coins, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const METRICS = [
  { value: 'net', label: 'Netto', icon: Euro },
  { value: 'gross', label: 'Bruto', icon: Coins },
  { value: 'hours', label: 'Uren', icon: Clock },
  { value: 'rides', label: 'Ritten', icon: Users },
];

const PERIODS = [
  { value: 'all', label: 'All time' },
  { value: 'last_month', label: 'Laatste maand' },
  { value: 'custom', label: 'Custom' },
];

function formatMetric(metric, value) {
  if (metric === 'hours') return `${value.toFixed(1)}u`;
  if (metric === 'rides') return `${value}`;
  return `€${value.toFixed(2)}`;
}

export default function Leaderboards() {
  const { axiosAuth } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('net');
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const metricConfig = useMemo(
    () => METRICS.find((m) => m.value === metric) || METRICS[0],
    [metric]
  );

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const api = axiosAuth();
      const params = { metric, period };
      if (period === 'custom') {
        if (!dateFrom || !dateTo) {
          setRows([]);
          setLoading(false);
          return;
        }
        params.date_from = dateFrom;
        params.date_to = dateTo;
      }
      const res = await api.get('/leaderboard', { params });
      setRows(res.data.rows || []);
    } catch {
      toast.error('Kon leaderboard niet laden');
    } finally {
      setLoading(false);
    }
  }, [axiosAuth, metric, period, dateFrom, dateTo]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-[#050505] pb-16" data-testid="leaderboards-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Leaderboards
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Vergelijk drivers op prestaties</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Metric
            </div>
            <div className="flex flex-wrap gap-2">
              {METRICS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setMetric(value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    metric === value
                      ? 'bg-[#D9F99D] text-black'
                      : 'bg-[#09090B] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
              <CalendarRange className="w-3.5 h-3.5" />
              Periode
            </div>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    period === value
                      ? 'bg-[#D9F99D] text-black'
                      : 'bg-[#09090B] text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
              <CalendarRange className="w-3.5 h-3.5" />
              Custom
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 bg-[#09090B] border border-[#27272A] text-xs text-white rounded-lg px-3 py-2"
                disabled={period !== 'custom'}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 bg-[#09090B] border border-[#27272A] text-xs text-white rounded-lg px-3 py-2"
                disabled={period !== 'custom'}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Trophy className="w-4 h-4 text-[#D9F99D]" />
              {metricConfig.label} leaderboard
            </div>
            {!loading && (
              <div className="text-xs text-zinc-500">{rows.length} drivers</div>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">Geen data voor deze filters</div>
          ) : (
            <div className="divide-y divide-[#27272A]">
              {rows.map((row, index) => (
                <div key={row.user_id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-[#D9F99D] text-black' : 'bg-[#09090B] text-zinc-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{row.name}</div>
                      <div className="text-zinc-500 text-xs">{row.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#D9F99D] font-mono text-sm font-semibold">
                      {formatMetric(metric, row.metric || 0)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {row.rides} ritten · {row.hours.toFixed(1)}u
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
