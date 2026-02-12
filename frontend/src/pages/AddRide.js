import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CalendarIcon, Clock, User, Car, Euro, Route, FileText, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AddRide() {
  const { rideId } = useParams();
  const isEdit = Boolean(rideId);
  const { axiosAuth } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [extraCosts, setExtraCosts] = useState('0');
  const [wwvKm, setWwvKm] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const api = axiosAuth();
      api.get('/rides').then(res => {
        const ride = res.data.find(r => r.id === rideId);
        if (ride) {
          setDate(new Date(ride.date));
          setClientName(ride.client_name);
          setCarBrand(ride.car_brand);
          setCarModel(ride.car_model);
          setStartTime(ride.start_time);
          setEndTime(ride.end_time);
          setExtraCosts(String(ride.extra_costs));
          setWwvKm(String(ride.wwv_km));
          setNotes(ride.notes || '');
        }
      });
    }
  }, [isEdit, rideId, axiosAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const api = axiosAuth();
      const payload = {
        date: format(date, 'yyyy-MM-dd'),
        client_name: clientName,
        car_brand: carBrand,
        car_model: carModel,
        start_time: startTime,
        end_time: endTime,
        extra_costs: parseFloat(extraCosts) || 0,
        wwv_km: parseFloat(wwvKm) || 0,
        notes,
      };

      if (isEdit) {
        await api.put(`/rides/${rideId}`, payload);
        toast.success('Rit bijgewerkt!');
      } else {
        await api.post('/rides', payload);
        toast.success('Rit toegevoegd!');
      }
      navigate('/rides');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Er is iets misgegaan');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#09090B] border border-[#27272A] text-white h-12 rounded-lg pl-11 pr-4 placeholder:text-zinc-600 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none text-sm";

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="add-ride-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          data-testid="add-ride-back-btn"
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Terug
        </button>

        <h1 className="text-3xl font-black text-white tracking-tight mb-8" style={{ fontFamily: 'Chivo, sans-serif' }} data-testid="add-ride-title">
          {isEdit ? 'Rit Bewerken' : 'Nieuwe Rit'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Picker */}
          <div>
            <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Datum</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-testid="ride-date-picker"
                  className="w-full bg-[#09090B] border border-[#27272A] text-white h-12 rounded-lg px-4 flex items-center gap-3 hover:border-[#D9F99D]/50 transition-all text-sm text-left"
                >
                  <CalendarIcon className="w-4 h-4 text-zinc-600" />
                  {format(date, 'dd MMMM yyyy', { locale: nl })}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0F0F11] border-[#27272A]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { if (d) { setDate(d); setCalendarOpen(false); } }}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Client */}
          <div>
            <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Klantnaam</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Naam van de klant"
                required
                data-testid="ride-client-input"
                className={inputCls}
              />
            </div>
          </div>

          {/* Car */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Automerk</label>
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  placeholder="bijv. Mercedes"
                  required
                  data-testid="ride-car-brand-input"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Model</label>
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="bijv. S-Klasse"
                  required
                  data-testid="ride-car-model-input"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Startuur</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  data-testid="ride-start-time-input"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Einduur</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  data-testid="ride-end-time-input"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Extra costs & WWV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Extra Kosten (€)</label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={extraCosts}
                  onChange={(e) => setExtraCosts(e.target.value)}
                  data-testid="ride-extra-costs-input"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">WWV Kilometers</label>
              <div className="relative">
                <Route className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={wwvKm}
                  onChange={(e) => setWwvKm(e.target.value)}
                  data-testid="ride-wwv-km-input"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-zinc-500 text-xs font-medium tracking-wide uppercase mb-2 block">Opmerkingen</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optionele opmerkingen..."
                rows={3}
                data-testid="ride-notes-input"
                className="w-full bg-[#09090B] border border-[#27272A] text-white rounded-lg pl-11 pr-4 py-3 placeholder:text-zinc-600 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            data-testid="ride-submit-button"
            className="w-full bg-[#D9F99D] text-black font-bold h-14 rounded-lg hover:bg-[#BEF264] hover:shadow-[0_0_20px_rgba(217,249,157,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Rit Bijwerken' : 'Rit Opslaan'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
