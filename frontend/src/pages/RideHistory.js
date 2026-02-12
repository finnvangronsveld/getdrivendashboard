import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, Clock, Euro, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import CarBrandLogo from '@/components/CarBrandLogo';

export default function RideHistory() {
  const { axiosAuth } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRides = async () => {
    try {
      const api = axiosAuth();
      const res = await api.get('/rides');
      setRides(res.data);
    } catch {
      toast.error('Kon ritten niet laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, [axiosAuth]);

  const handleDelete = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze rit wilt verwijderen?')) return;
    try {
      const api = axiosAuth();
      await api.delete(`/rides/${id}`);
      setRides(rides.filter(r => r.id !== id));
      toast.success('Rit verwijderd');
    } catch {
      toast.error('Kon rit niet verwijderen');
    }
  };

  const filtered = rides.filter(r =>
    r.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.car_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.car_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date.includes(searchTerm)
  );

  const totalNet = filtered.reduce((s, r) => s + (r.net_pay || 0), 0);
  const totalHours = filtered.reduce((s, r) => s + (r.total_hours || 0), 0);

  // Group rides by month (YYYY-MM)
  const MONTH_NAMES = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filtered.forEach(r => {
      const key = r.date.substring(0, 7); // "YYYY-MM"
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    // Sort months descending, rides within month descending by date
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, monthRides]) => {
        const [y, m] = monthKey.split('-');
        const label = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
        const monthNet = monthRides.reduce((s, r) => s + (r.net_pay || 0), 0);
        const monthHours = monthRides.reduce((s, r) => s + (r.total_hours || 0), 0);
        const sorted = monthRides.sort((a, b) => b.date.localeCompare(a.date));
        return { key: monthKey, label, rides: sorted, net: monthNet, hours: monthHours };
      });
  }, [filtered]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="ride-history-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }} data-testid="ride-history-title">
              Ritten
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{filtered.length} ritten gevonden</p>
          </div>
          <Link
            to="/rides/add"
            data-testid="ride-history-add-btn"
            className="bg-[#D9F99D] text-black font-bold px-5 py-3 rounded-lg hover:bg-[#BEF264] hover:shadow-[0_0_20px_rgba(217,249,157,0.3)] transition-all text-sm"
          >
            + Nieuwe Rit
          </Link>
        </div>

        {/* Search & Summary */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Zoek op klant, auto of datum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="ride-search-input"
              className="w-full bg-[#09090B] border border-[#27272A] text-white h-11 rounded-lg pl-11 pr-4 placeholder:text-zinc-600 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg px-4 py-2 flex items-center gap-2">
              <Euro className="w-3.5 h-3.5 text-[#D9F99D]" />
              <span className="text-white font-mono text-sm font-medium" data-testid="rides-total-net">€{totalNet.toFixed(2)}</span>
            </div>
            <div className="bg-[#0F0F11] border border-[#27272A] rounded-lg px-4 py-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#D9F99D]" />
              <span className="text-white font-mono text-sm font-medium" data-testid="rides-total-hours">{totalHours.toFixed(1)}u</span>
            </div>
          </div>
        </div>

        {/* Rides List - Grouped by Month */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p>Geen ritten gevonden</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedByMonth.map(({ key, label, rides: monthRides, net, hours }) => (
              <div key={key} data-testid={`month-group-${key}`}>
                {/* Month Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D9F99D]" />
                    <h2 className="text-white text-base font-semibold" style={{ fontFamily: 'Chivo, sans-serif' }}>{label}</h2>
                    <span className="text-zinc-600 text-xs ml-1">{monthRides.length} ritten</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#D9F99D] font-mono font-medium">€{net.toFixed(2)}</span>
                    <span className="text-zinc-500 font-mono">{hours.toFixed(1)}u</span>
                  </div>
                </div>

                {/* Month Rides */}
                <div className="flex flex-col gap-4">
                  {monthRides.map((ride) => (
              <div
                key={ride.id}
                data-testid={`ride-item-${ride.id}`}
                className="bg-[#0F0F11] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D9F99D]/20 transition-colors"
              >
                {/* Main Row */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === ride.id ? null : ride.id)}
                >
                  <div className="flex items-center gap-4">
                    <CarBrandLogo brand={ride.car_brand} />
                    <div>
                      <p className="text-white text-sm font-medium">{ride.client_name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {ride.date} | {ride.car_brand} {ride.car_model} | {ride.start_time}-{ride.end_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[#D9F99D] font-mono font-medium text-sm">€{ride.net_pay?.toFixed(2)}</p>
                      <p className="text-zinc-600 text-xs">{ride.total_hours}u</p>
                    </div>
                    {expandedId === ride.id ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === ride.id && (
                  <div className="border-t border-[#1a1a1e] px-4 py-4 animate-slideDown" data-testid={`ride-details-${ride.id}`}>
                    {/* Salary Breakdown */}
                    <div className="mb-4">
                      <p className="text-zinc-500 text-xs uppercase tracking-wide mb-3">Loon Breakdown</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <DetailItem label="Normaal" value={`${ride.normal_hours}u`} sub={`€${ride.normal_pay?.toFixed(2)}`} />
                        <DetailItem label="Overuren" value={`${ride.overtime_hours}u`} sub={`€${ride.overtime_pay?.toFixed(2)}`} />
                        <DetailItem label="Nachturen" value={`${ride.night_hours}u`} sub={`€${ride.night_pay?.toFixed(2)}`} />
                        <DetailItem label="Uurloon Totaal" value={`€${ride.gross_pay?.toFixed(2)}`} sub={`${ride.total_hours}u gewerkt`} />
                      </div>
                    </div>

                    {/* Bruto / Netto */}
                    <div className="mb-4 p-3 bg-[#09090B] rounded-lg border border-[#1a1a1e]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">WWV</p>
                          <p className="text-green-400 font-mono">+€{ride.wwv_amount?.toFixed(2)} <span className="text-zinc-600 text-xs">({ride.wwv_km}km)</span></p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">Extra Kosten</p>
                          <p className="text-green-400 font-mono">+€{ride.extra_costs?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">Bruto</p>
                          <p className="text-white font-mono font-medium">€{(ride.gross_total || (ride.gross_pay + (ride.wwv_amount || 0) + (ride.extra_costs || 0) + (ride.social_contribution || 0)))?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">Sociale Bijdrage</p>
                          <p className="text-red-400 font-mono">-€{ride.social_contribution?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#27272A] flex justify-between items-center">
                        <span className="text-zinc-400 text-sm font-medium">Netto Uitbetaling</span>
                        <span className="text-[#D9F99D] font-mono font-bold text-lg">€{ride.net_pay?.toFixed(2)}</span>
                      </div>
                    </div>

                    {ride.notes && (
                      <p className="text-zinc-500 text-xs mb-4">Opmerking: {ride.notes}</p>
                    )}
                    <div className="flex gap-2">
                      <Link
                        to={`/rides/edit/${ride.id}`}
                        data-testid={`edit-ride-${ride.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all border border-[#27272A]"
                      >
                        <Edit2 className="w-3 h-3" /> Bewerken
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(ride.id); }}
                        data-testid={`delete-ride-${ride.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-all border border-red-400/20"
                      >
                        <Trash2 className="w-3 h-3" /> Verwijderen
                      </button>
                    </div>
                  </div>
                )}
              </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, sub, highlight }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-mono text-sm font-medium ${highlight ? 'text-[#D9F99D]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-zinc-600 text-xs">{sub}</p>}
    </div>
  );
}
