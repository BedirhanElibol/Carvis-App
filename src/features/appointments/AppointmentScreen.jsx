import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../../context/AppointmentContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
const AppointmentScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const { appointments, loading, updateAppointmentStatus } = useAppointment();
  const [filter, setFilter] = useState("all");
  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === filter);
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          label: "Beklemede",
        };
      case "confirmed":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/10",
          label: "Onaylandı",
        };
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          label: "Tamamlandı",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-400",
          bg: "bg-red-500/10",
          label: "İptal Edildi",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-slate-500 dark:text-slate-400",
          bg: "bg-slate-500/10",
          label: "Bilinmiyor",
        };
    }
  };
  const handleStatusChange = async (appointmentId, newStatus) => {
    const { error } = await updateAppointmentStatus(appointmentId, newStatus);
    if (error) {
      showAlert("Hata", "Randevu durumu güncellenemedi.", "error");
    } else {
      showAlert("Başarılı", "Randevu durumu güncellendi.", "success");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24">
      {" "}
      {/* Header */}{" "}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-5">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
            >
              {" "}
              <ArrowLeft size={20} />{" "}
            </button>{" "}
            <div>
              {" "}
              <h1 className="text-xl font-bold">Randevularım</h1>{" "}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredAppointments.length} randevu
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <Calendar size={20} className="text-slate-500 dark:text-slate-400" />{" "}
        </div>{" "}
        {/* Filter Tabs */}{" "}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {" "}
          {[
            { value: "all", label: "Tümü" },
            { value: "pending", label: "Beklemede" },
            { value: "confirmed", label: "Onaylandı" },
            { value: "completed", label: "Tamamlandı" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === option.value ? "bg-primary-500 text-slate-900 dark:text-white" : "glass-card text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"}`}
            >
              {" "}
              {option.label}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {/* Appointment List */}{" "}
      <div className="p-5 space-y-3">
        {" "}
        {loading ? (
          <div className="text-center py-20">
            {" "}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>{" "}
            <p className="text-slate-500 dark:text-slate-400 mt-4">Randevular yükleniyor...</p>{" "}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-20">
            {" "}
            <Calendar
              size={48}
              className="mx-auto text-slate-600 dark:text-slate-300 mb-4"
            />{" "}
            <p className="text-slate-500 dark:text-slate-400">Randevu bulunmuyor</p>{" "}
          </div>
        ) : (
          filteredAppointments.map((appointment) => {
            const config = getStatusConfig(appointment.status);
            const StatusIcon = config.icon;
            const isSeller = appointment.seller_id === currentUser.id;
            return (
              <div
                key={appointment.id}
                className="glass-card p-5 rounded-2xl border border-black/10 dark:border-white/10"
              >
                {" "}
                {/* Header */}{" "}
                <div className="flex items-start justify-between mb-3">
                  {" "}
                  <div className="flex-1">
                    {" "}
                    <div
                      className={`flex items-center gap-1.5 mb-2 ${config.bg} ${config.color} px-2 py-1 rounded-lg w-fit text-xs font-bold`}
                    >
                      {" "}
                      <StatusIcon size={14} /> {config.label}{" "}
                    </div>{" "}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {" "}
                      {appointment.service_type}{" "}
                    </h3>{" "}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {" "}
                      {isSeller
                        ? appointment.customer?.full_name
                        : appointment.seller?.company_name ||
                          appointment.seller?.full_name}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Date & Time */}{" "}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  {" "}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    {" "}
                    <Calendar size={16} />{" "}
                    {new Date(appointment.appointment_date).toLocaleDateString(
                      "tr-TR",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}{" "}
                  </div>{" "}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    {" "}
                    <Clock size={16} />{" "}
                    {new Date(appointment.appointment_date).toLocaleTimeString(
                      "tr-TR",
                      { hour: "2-digit", minute: "2-digit" },
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                {/* Vehicle Info */}{" "}
                {appointment.vehicle && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {" "}
                    {appointment.vehicle.brand} {appointment.vehicle.model} -{" "}
                    {appointment.vehicle.plate}{" "}
                  </div>
                )}{" "}
                {/* Notes */}{" "}
                {appointment.notes && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 p-3 bg-white dark:bg-slate-900 rounded-xl">
                    {" "}
                    {appointment.notes}{" "}
                  </p>
                )}{" "}
                {/* Actions (Seller Only) */}{" "}
                {isSeller && appointment.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                    {" "}
                    <button
                      onClick={() =>
                        handleStatusChange(appointment.id, "cancelled")
                      }
                      className="glass-card p-2 rounded-xl text-xs font-semibold text-red-400 active-scale"
                    >
                      {" "}
                      İptal Et{" "}
                    </button>{" "}
                    <button
                      onClick={() =>
                        handleStatusChange(appointment.id, "confirmed")
                      }
                      className="bg-primary-500 p-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white active-scale"
                    >
                      {" "}
                      Onayla{" "}
                    </button>{" "}
                  </div>
                )}{" "}
                {isSeller && appointment.status === "confirmed" && (
                  <button
                    onClick={() =>
                      handleStatusChange(appointment.id, "completed")
                    }
                    className="w-full bg-green-500 p-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white active-scale mt-3"
                  >
                    {" "}
                    Tamamlandı Olarak İşaretle{" "}
                  </button>
                )}{" "}
              </div>
            );
          })
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default AppointmentScreen;
