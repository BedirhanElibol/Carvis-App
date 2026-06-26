import React, { useState, useEffect } from "react";
import { useAppointment } from "../../context/AppointmentContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import * as Icons from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";

const ServiceBookingModal = (props) => {
  const { isOpen, onClose, sellerId, serviceType, onBooked } = props;
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const { fetchSlots, checkAvailability, createAppointment } = useAppointment();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Müsait günleri hesapla (Örn: Gelecek 7 gün)
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    if (isOpen && sellerId) {
      loadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sellerId]);

  useEffect(() => {
    if (selectedDate && slots.length > 0) {
      updateAvailableTimes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, slots]);

  const loadSlots = async () => {
    setLoading(true);
    const { data } = await fetchSlots(sellerId);
    if (data) setSlots(data);
    setLoading(false);
  };

  const updateAvailableTimes = async () => {
    setLoading(true);
    const dayOfWeek = selectedDate.getDay();
    const daySlots = slots.filter(s => s.day_of_week === dayOfWeek);
    
    const { data: existingApts } = await checkAvailability(sellerId, format(selectedDate, "yyyy-MM-dd"));
    
    // Basit slot mantığı: daySlots içindeki start_time'ları al, existingApts'dakileri filtrele
    const times = daySlots.map(s => s.start_time.substring(0, 5));
    const bookedTimes = existingApts?.map(a => format(new Date(a.appointment_date), "HH:mm")) || [];
    
    setAvailableTimes(times.filter(t => !bookedTimes.includes(t)));
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!selectedTime) return;
    
    setBookingLoading(true);
    const appointmentDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0);

    const { error } = await createAppointment({
      customer_id: currentUser.id,
      seller_id: sellerId,
      service_type: serviceType,
      appointment_date: appointmentDate.toISOString(),
      status: "pending"
    });

    setBookingLoading(false);
    if (!error) {
      showAlert("Başarılı", "Randevu talebiniz iletildi.", "success");
      onBooked?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border-t sm:border border-black/10 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Randevu Planla</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{serviceType}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <Icons.X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Date Selection */}
          <div className="mb-8">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Tarih Seçin</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {next7Days.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center min-w-[4.5rem] p-4 rounded-2xl transition-all ${
                    isSameDay(selectedDate, date) 
                    ? "bg-primary-500 text-slate-900 dark:text-white shadow-lg shadow-primary-500/25 scale-105" 
                    : "bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:bg-white/10"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold opacity-60 mb-1">{format(date, "EEE", { locale: tr })}</span>
                  <span className="text-lg font-bold">{format(date, "dd")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-8">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Müsait Saatler</label>
            {loading ? (
              <div className="flex gap-2 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-20 bg-black/5 dark:bg-white/5 rounded-xl" />)}
              </div>
            ) : availableTimes.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl text-sm font-bold transition-all ${
                      selectedTime === time 
                      ? "bg-white text-slate-900 scale-105" 
                      : "bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:bg-white/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                Seçilen günde müsait randevu bulunmuyor.
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleBooking}
            disabled={!selectedTime || bookingLoading}
            className="w-full py-4 rounded-2xl bg-primary-500 text-slate-900 dark:text-white font-bold text-lg shadow-xl shadow-primary-500/20 active-scale disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
          >
            {bookingLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Icons.CheckCircle size={20} />
                Randevuyu Onayla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingModal;
