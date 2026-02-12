import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Car, Euro, PlusCircle, Route } from 'lucide-react';

const COLORS = ['#D9F99D', '#BEF264', '#A3E635', '#84CC16', '#65A30D', '#4D7C0F'];

export default function Dashboard() {
  const { axiosAuth } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = axiosAuth();
    api.get('/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [axiosAuth]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = stats || { total_rides: 0, total_hours: 0, total_gross: 0, total_net: 0, total_wwv: 0, monthly_earnings: [], car_stats: [], recent_rides: [] };

  const statCards = [
    { icon: Route, label: 'Totaal Ritten', value: s.total_rides, format: 'num' },
    { icon: Clock, label: 'Totaal Uren', value: s.total_hours, format: 'hours' },
    { icon: Euro, label: 'Bruto Verdiensten', value: s.total_gross, format: 'eur' },
    { icon: TrendingUp, label: 'Netto Verdiensten', value: s.total_net, format: 'eur' },
  ];

  const formatVal = (val, fmt) => {
    if (fmt === 'eur') return `€${val.toFixed(2)}`;
    if (fmt === 'hours') return `${val.toFixed(1)}u`;
    return val;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg px-4 py-3 shadow-xl">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-mono font-medium">
            {p.name}: €{p.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }} data-testid="dashboard-title">
              Dashboard
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Overzicht van je verdiensten</p>
          </div>
          <Link
            to="/rides/add"
            data-testid="dashboard-add-ride-btn"
            className="flex items-center gap-2 bg-[#D9F99D] text-black font-bold px-5 py-3 rounded-lg hover:bg-[#BEF264] hover:shadow-[0_0_20px_rgba(217,249,157,0.3)] transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Rit Toevoegen</span>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(({ icon: Icon, label, value, format }, i) => (
            <div
              key={label}
              data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={`bg-[#0F0F11] border border-[#27272A] rounded-xl p-5 hover:border-[#D9F99D]/30 transition-all opacity-0 animate-fadeInUp`}
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-[#D9F99D]" />
                <span className="text-zinc-500 text-xs font-medium tracking-wide uppercase">{label}</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">{formatVal(value, format)}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Monthly Earnings Chart */}
          <div className="lg:col-span-2 bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="monthly-earnings-chart">
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Maandelijkse Verdiensten
            </h3>
            {s.monthly_earnings.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={s.monthly_earnings} barCategoryGap="20%">
                  <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="net" name="Netto" fill="#D9F99D" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="gross" name="Bruto" fill="#27272A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-zinc-600 text-sm">
                Nog geen data beschikbaar
              </div>
            )}
          </div>

          {/* Car Stats Pie */}
          <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="car-stats-chart">
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Auto Verdeling
            </h3>
            {s.car_stats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={s.car_stats}
                      dataKey="rides"
                      nameKey="car"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      strokeWidth={0}
                    >
                      {s.car_stats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0F0F11', border: '1px solid #27272A', borderRadius: '8px', color: '#fff' }}
                      formatter={(val, name) => [`${val} ritten`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {s.car_stats.slice(0, 5).map((c, i) => (
                    <div key={c.car} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-zinc-400">{c.car}</span>
                      </div>
                      <span className="text-white font-mono">{c.rides}x</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm">
                Nog geen data
              </div>
            )}
          </div>
        </div>

        {/* Recent Rides */}
        <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="recent-rides-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm tracking-wide" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Recente Ritten
            </h3>
            <Link to="/rides" className="text-[#D9F99D] text-xs hover:underline" data-testid="view-all-rides-link">
              Bekijk alles
            </Link>
          </div>
          {s.recent_rides.length > 0 ? (
            <div className="space-y-3">
              {s.recent_rides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between py-3 px-4 bg-[#09090B] rounded-lg border border-[#1a1a1e] hover:border-[#27272A] transition-colors"
                  data-testid={`recent-ride-${ride.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#D9F99D]/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-[#D9F99D]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{ride.client_name}</p>
                      <p className="text-zinc-500 text-xs">{ride.date} | {ride.car_brand} {ride.car_model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#D9F99D] font-mono font-medium text-sm">€{ride.net_pay?.toFixed(2)}</p>
                    <p className="text-zinc-600 text-xs">{ride.total_hours}u</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 text-sm">
              <Car className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
              Nog geen ritten geregistreerd.
              <Link to="/rides/add" className="text-[#D9F99D] ml-1 hover:underline">Voeg je eerste rit toe!</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
