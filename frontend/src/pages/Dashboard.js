import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line
} from 'recharts';
import {
  TrendingUp, Clock, Euro, PlusCircle, Route, Moon, Percent,
  Filter, X, ChevronDown, Calendar as CalendarIcon, Users, Car as CarIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CarBrandLogo from '@/components/CarBrandLogo';

const COLORS = ['#D9F99D', '#BEF264', '#A3E635', '#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#365314'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white text-sm font-mono font-medium">
          {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('eur') ? `€${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

const EuroTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }} className="text-sm font-mono font-medium">
          {p.name}: €{p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { axiosAuth } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [activeFilters, setActiveFilters] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const api = axiosAuth();
    const params = new URLSearchParams();
    if (filterMonth !== 'all') params.append('month', filterMonth);
    if (filterClient !== 'all') params.append('client_name', filterClient);
    if (filterBrand !== 'all') params.append('car_brand', filterBrand);
    const qs = params.toString();
    try {
      const res = await api.get(`/stats${qs ? '?' + qs : ''}`);
      setStats(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [axiosAuth, filterMonth, filterClient, filterBrand]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    let count = 0;
    if (filterMonth !== 'all') count++;
    if (filterClient !== 'all') count++;
    if (filterBrand !== 'all') count++;
    setActiveFilters(count);
  }, [filterMonth, filterClient, filterBrand]);

  const clearFilters = () => {
    setFilterMonth('all');
    setFilterClient('all');
    setFilterBrand('all');
  };

  if (loading && !stats) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = stats || {};
  const noData = s.total_rides === 0;

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }} data-testid="dashboard-title">
              Dashboard
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {noData ? 'Voeg je eerste rit toe om statistieken te zien' : `${s.total_rides} ritten gevonden`}
            </p>
          </div>
          <Link
            to="/rides/add"
            data-testid="dashboard-add-ride-btn"
            className="flex items-center gap-2 bg-[#D9F99D] text-black font-bold px-5 py-3 rounded-lg hover:bg-[#BEF264] hover:shadow-[0_0_20px_rgba(217,249,157,0.3)] transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Rit Toevoegen</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-4 mb-8" data-testid="dashboard-filters">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#D9F99D]" />
            <span className="text-white text-sm font-medium">Filters</span>
            {activeFilters > 0 && (
              <span className="bg-[#D9F99D] text-black text-xs font-bold px-2 py-0.5 rounded-full">{activeFilters}</span>
            )}
            {activeFilters > 0 && (
              <button onClick={clearFilters} data-testid="clear-filters-btn" className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" /> Wis filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="bg-[#09090B] border-[#27272A] text-white h-10" data-testid="filter-month">
                <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <SelectValue placeholder="Alle maanden" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F11] border-[#27272A] z-[100]">
                <SelectItem value="all">Alle maanden</SelectItem>
                {(s.available_months || []).map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="bg-[#09090B] border-[#27272A] text-white h-10" data-testid="filter-client">
                <Users className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <SelectValue placeholder="Alle klanten" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F11] border-[#27272A] z-[100]">
                <SelectItem value="all">Alle klanten</SelectItem>
                {(s.available_clients || []).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="bg-[#09090B] border-[#27272A] text-white h-10" data-testid="filter-brand">
                <CarIcon className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <SelectValue placeholder="Alle merken" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F11] border-[#27272A] z-[100]">
                <SelectItem value="all">Alle merken</SelectItem>
                {(s.available_brands || []).map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stat Cards - 2 rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Route} label="Ritten" value={s.total_rides || 0} format="num" delay={0} />
          <StatCard icon={Clock} label="Uren" value={s.total_hours || 0} format="hours" delay={1} />
          <StatCard icon={Euro} label="Bruto" value={s.total_gross || 0} format="eur" delay={2} />
          <StatCard icon={TrendingUp} label="Netto" value={s.total_net || 0} format="eur" delay={3} highlight />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Clock} label="Overuren" value={s.total_overtime_hours || 0} format="hours" delay={4} />
          <StatCard icon={Moon} label="Nachturen" value={s.total_night_hours || 0} format="hours" delay={5} />
          <StatCard icon={Euro} label="Gem/Rit" value={s.avg_per_ride || 0} format="eur" delay={6} />
          <StatCard icon={Euro} label="Gem/Uur" value={s.avg_per_hour || 0} format="eur" delay={7} />
        </div>

        {noData ? (
          <EmptyState />
        ) : (
          <>
            {/* Charts Tabs */}
            <Tabs defaultValue="earnings" className="mb-10">
              <TabsList className="bg-[#0F0F11] border border-[#27272A] p-1 rounded-lg mb-6" data-testid="chart-tabs">
                <TabsTrigger value="earnings" className="data-[state=active]:bg-[#D9F99D]/10 data-[state=active]:text-[#D9F99D] rounded-md text-sm">Verdiensten</TabsTrigger>
                <TabsTrigger value="hours" className="data-[state=active]:bg-[#D9F99D]/10 data-[state=active]:text-[#D9F99D] rounded-md text-sm">Uren</TabsTrigger>
                <TabsTrigger value="cars" className="data-[state=active]:bg-[#D9F99D]/10 data-[state=active]:text-[#D9F99D] rounded-md text-sm">Auto's</TabsTrigger>
                <TabsTrigger value="patterns" className="data-[state=active]:bg-[#D9F99D]/10 data-[state=active]:text-[#D9F99D] rounded-md text-sm">Patronen</TabsTrigger>
              </TabsList>

              {/* Earnings Tab */}
              <TabsContent value="earnings">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Monthly Earnings */}
                  <div className="lg:col-span-2 bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="monthly-earnings-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Maandelijkse Verdiensten</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={s.monthly_earnings || []} barCategoryGap="20%">
                        <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<EuroTooltip />} />
                        <Bar dataKey="net" name="Netto" fill="#D9F99D" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="gross" name="Bruto" fill="#27272A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Client Earnings Ranking */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="client-stats">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Top Klanten</h3>
                    {(s.client_stats || []).length > 0 ? (
                      <div className="space-y-3">
                        {(s.client_stats || []).slice(0, 6).map((c, i) => (
                          <div key={c.client} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-zinc-600 w-5">{i + 1}.</span>
                              <div>
                                <p className="text-white text-sm">{c.client}</p>
                                <p className="text-zinc-600 text-xs">{c.rides} ritten | {c.hours}u</p>
                              </div>
                            </div>
                            <span className="text-[#D9F99D] font-mono text-sm font-medium">€{c.earnings.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : <NoChartData />}
                  </div>
                </div>

                {/* Weekly Trend */}
                {(s.weekly_earnings || []).length > 1 && (
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6 mt-6" data-testid="weekly-trend-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Wekelijkse Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={s.weekly_earnings}>
                        <defs>
                          <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D9F99D" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D9F99D" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="week" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<EuroTooltip />} />
                        <Area type="monotone" dataKey="net" name="Netto" stroke="#D9F99D" fillOpacity={1} fill="url(#limeGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              {/* Hours Tab */}
              <TabsContent value="hours">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Hours Breakdown */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="monthly-hours-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Maandelijkse Uren Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={s.monthly_earnings || []} barCategoryGap="15%">
                        <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="hours" name="Normaal" fill="#D9F99D" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="overtime" name="Overuren" fill="#BEF264" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="night" name="Nachturen" fill="#4D7C0F" radius={[4, 4, 0, 0]} stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Hours Summary */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="hours-summary">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Uren Overzicht</h3>
                    <div className="space-y-4">
                      <HoursBar label="Normaal" hours={Math.max(0, (s.total_hours || 0) - (s.total_overtime_hours || 0))} total={s.total_hours || 1} color="#D9F99D" />
                      <HoursBar label="Overuren" hours={s.total_overtime_hours || 0} total={s.total_hours || 1} color="#BEF264" />
                      <HoursBar label="Nachturen" hours={s.total_night_hours || 0} total={s.total_hours || 1} color="#4D7C0F" />
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#27272A]">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Totaal gewerkt</span>
                        <span className="text-white font-mono font-bold">{(s.total_hours || 0).toFixed(1)} uur</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-zinc-400">Sociale bijdrage</span>
                        <span className="text-red-400 font-mono">-€{(s.total_social || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-zinc-400">WWV vergoeding</span>
                        <span className="text-green-400 font-mono">+€{(s.total_wwv || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-zinc-400">Extra kosten</span>
                        <span className="text-green-400 font-mono">+€{(s.total_extra_costs || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Cars Tab */}
              <TabsContent value="cars">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Brand Pie */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="brand-pie-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Ritten per Merk</h3>
                    {(s.brand_stats || []).length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={s.brand_stats} dataKey="rides" nameKey="brand" cx="50%" cy="50%" outerRadius={100} innerRadius={50} strokeWidth={0}>
                              {(s.brand_stats || []).map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#0F0F11', border: '1px solid #27272A', borderRadius: '8px', color: '#fff' }} formatter={(val, name) => [`${val} ritten`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-3 space-y-2">
                          {(s.brand_stats || []).map((b, i) => (
                            <div key={b.brand} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CarBrandLogo brand={b.brand} size="sm" />
                                <span className="text-zinc-300 text-sm">{b.brand}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-500 text-xs">{b.rides}x</span>
                                <span className="text-[#D9F99D] font-mono text-sm">€{b.earnings.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <NoChartData />}
                  </div>

                  {/* Car Model Details */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="car-model-stats">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Auto Details</h3>
                    {(s.car_stats || []).length > 0 ? (
                      <div className="space-y-3">
                        {(s.car_stats || []).map((c) => (
                          <div key={c.car} className="flex items-center justify-between p-3 bg-[#09090B] rounded-lg border border-[#1a1a1e]">
                            <div className="flex items-center gap-3">
                              <CarBrandLogo brand={c.brand} size="md" />
                              <div>
                                <p className="text-white text-sm font-medium">{c.car}</p>
                                <p className="text-zinc-500 text-xs">{c.hours}u gewerkt</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#D9F99D] font-mono text-sm font-medium">€{c.earnings.toFixed(2)}</p>
                              <p className="text-zinc-600 text-xs">{c.rides} ritten</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <NoChartData />}
                  </div>
                </div>
              </TabsContent>

              {/* Patterns Tab */}
              <TabsContent value="patterns">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Day of Week Radar */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="day-of-week-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Activiteit per Weekdag</h3>
                    {(s.day_of_week_stats || []).some(d => d.rides > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={s.day_of_week_stats}>
                          <PolarGrid stroke="#27272A" />
                          <PolarAngleAxis dataKey="day" tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                          <PolarRadiusAxis tick={{ fill: '#71717A', fontSize: 10 }} />
                          <Radar name="Ritten" dataKey="rides" stroke="#D9F99D" fill="#D9F99D" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : <NoChartData />}
                  </div>

                  {/* Hourly Distribution */}
                  <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="hourly-distribution-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Werktijden Verdeling</h3>
                    {(s.hourly_distribution || []).some(h => h.count > 0) ? (
                      <>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={s.hourly_distribution}>
                            <XAxis dataKey="hour" tick={{ fill: '#71717A', fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
                            <YAxis tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Ritten" radius={[3, 3, 0, 0]}>
                              {(s.hourly_distribution || []).map((entry, i) => (
                                <Cell key={i} fill={parseInt(entry.hour) >= 20 || parseInt(entry.hour) < 6 ? '#4D7C0F' : '#D9F99D'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-[#D9F99D]" />
                            <span>Dag (06:00-20:00)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-[#4D7C0F]" />
                            <span>Nacht (20:00-06:00)</span>
                          </div>
                        </div>
                      </>
                    ) : <NoChartData />}
                  </div>

                  {/* Day of Week Earnings */}
                  <div className="lg:col-span-2 bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="day-earnings-chart">
                    <h3 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>Verdiensten per Weekdag</h3>
                    {(s.day_of_week_stats || []).some(d => d.earnings > 0) ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={s.day_of_week_stats} barCategoryGap="25%">
                          <XAxis dataKey="day" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<EuroTooltip />} />
                          <Bar dataKey="earnings" name="Verdiensten" fill="#D9F99D" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <NoChartData />}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Recent Rides */}
            <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-6" data-testid="recent-rides-section">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm tracking-wide" style={{ fontFamily: 'Chivo, sans-serif' }}>Recente Ritten</h3>
                <Link to="/rides" className="text-[#D9F99D] text-xs hover:underline" data-testid="view-all-rides-link">Bekijk alles</Link>
              </div>
              <div className="space-y-3">
                {(s.recent_rides || []).map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between py-3 px-4 bg-[#09090B] rounded-lg border border-[#1a1a1e] hover:border-[#27272A] transition-colors"
                    data-testid={`recent-ride-${ride.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <CarBrandLogo brand={ride.car_brand} />
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, format, delay, highlight }) {
  const formatVal = (val, fmt) => {
    if (fmt === 'eur') return `€${val.toFixed(2)}`;
    if (fmt === 'hours') return `${val.toFixed(1)}u`;
    return val;
  };
  return (
    <div
      data-testid={`stat-card-${label.toLowerCase().replace(/[\s\/\.]/g, '-')}`}
      className={`bg-[#0F0F11] border rounded-xl p-5 transition-all opacity-0 animate-fadeInUp ${highlight ? 'border-[#D9F99D]/30 glow-lime-border' : 'border-[#27272A] hover:border-[#D9F99D]/20'}`}
      style={{ animationDelay: `${delay * 0.05}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#D9F99D]" />
        <span className="text-zinc-500 text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-mono ${highlight ? 'text-[#D9F99D]' : 'text-white'}`}>{formatVal(value, format)}</p>
    </div>
  );
}

function HoursBar({ label, hours, total, color }) {
  const pct = total > 0 ? (hours / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-mono">{hours.toFixed(1)}u ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-[#09090B] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function NoChartData() {
  return <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm">Nog geen data beschikbaar</div>;
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-[#0F0F11] border border-[#27272A] rounded-xl">
      <CarIcon className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
      <p className="text-zinc-500 mb-4">Nog geen ritten geregistreerd.</p>
      <Link to="/rides/add" className="inline-flex items-center gap-2 bg-[#D9F99D] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#BEF264] transition-all text-sm">
        <PlusCircle className="w-4 h-4" /> Voeg je eerste rit toe
      </Link>
    </div>
  );
}
