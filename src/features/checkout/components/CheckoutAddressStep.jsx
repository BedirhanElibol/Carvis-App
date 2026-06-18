import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";
const AddAddressModal = ({ onClose, onSaved }) => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    title: "Ev",
    fullAddress: "",
    city: "",
    district: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleSave = async () => {
    if (!form.fullAddress.trim() || !form.city.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert([
          {
            user_id: currentUser.id,
            title: form.title,
            full_address: form.fullAddress,
            city: form.city,
            district: form.district,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      onSaved(data);
      onClose();
    } catch (err) {
      console.error("Address save error:", err);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end p-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {" "}
      <div
        className="w-full max-w-lg mx-auto bg-slate-900 border-t border-white/10 rounded-t-[2rem] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="font-bold text-white text-lg">Yeni Adres</h3>{" "}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Icons.X size={18} className="text-slate-400" />
          </button>{" "}
        </div>{" "}
        <div className="flex gap-2">
          {" "}
          {["Ev", "İş", "Diğer"].map((t) => (
            <button
              key={t}
              onClick={() => set("title", t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${form.title === t ? "bg-primary-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {" "}
              {t}{" "}
            </button>
          ))}{" "}
        </div>{" "}
        {[
          ["Tam Adres *", "fullAddress", "Mahalle, Cadde, Sokak, No/Daire"],
          ["Şehir *", "city", "İstanbul"],
          ["İlçe", "district", "Kadıköy"],
        ].map(([label, key, ph]) => (
          <div key={key}>
            {" "}
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">
              {label}
            </label>{" "}
            <input
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition"
              placeholder={ph}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />{" "}
          </div>
        ))}{" "}
        <button
          onClick={handleSave}
          disabled={!form.fullAddress || !form.city || saving}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50"
        >
          {" "}
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icons.Save size={16} /> Kaydet
            </>
          )}{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
};
const CheckoutAddressStep = () => {
  const { addresses, setAddresses, selectedAddress, setSelectedAddress } =
    useShop();
  const { currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const handleAddressSaved = (newAddr) => {
    const mapped = {
      id: newAddr.id,
      title: newAddr.title,
      fullAddress: newAddr.full_address,
      city: newAddr.city,
      district: newAddr.district,
    };
    setAddresses((prev) => [...prev, mapped]);
    setSelectedAddress(mapped);
  };
  const handleDelete = async (addrId) => {
    try {
      await supabase.from("addresses").delete().eq("id", addrId);
      setAddresses((prev) => prev.filter((a) => a.id !== addrId));
      if (selectedAddress?.id === addrId) setSelectedAddress(null);
    } catch (err) {
      console.error("Delete address error:", err);
    }
  };
  return (
    <div className="space-y-4 animate-slide-up">
      {" "}
      {showAddModal && (
        <AddAddressModal
          onClose={() => setShowAddModal(false)}
          onSaved={handleAddressSaved}
        />
      )}{" "}
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        {" "}
        <Icons.MapPin className="text-primary-500" /> Teslimat Adresi{" "}
      </h2>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {" "}
        {addresses.map((addr) => (
          <div
            key={addr.id}
            onClick={() => setSelectedAddress(addr)}
            className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all ${selectedAddress?.id === addr.id ? "border-primary-500 bg-primary-600/10" : "border-white/5 hover:border-white/20"}`}
          >
            {" "}
            <div className="flex justify-between items-start mb-2">
              {" "}
              <h4 className="font-bold text-white flex items-center gap-2">
                {" "}
                {addr.title}{" "}
                {selectedAddress?.id === addr.id && (
                  <Icons.CheckCircle size={16} className="text-primary-500" />
                )}{" "}
              </h4>{" "}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(addr.id);
                }}
                className="text-slate-500 hover:text-red-400 transition"
              >
                {" "}
                <Icons.Trash2 size={14} />{" "}
              </button>{" "}
            </div>{" "}
            <p className="text-xs text-slate-400 leading-relaxed mb-3 h-10 line-clamp-2">
              {addr.fullAddress}
            </p>{" "}
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {addr.city}
              {addr.district ? ` / ${addr.district}` : ""}
            </p>{" "}
          </div>
        ))}{" "}
        {currentUser && !currentUser.isAnonymous && (
          <button
            onClick={() => setShowAddModal(true)}
            className="glass-card p-5 rounded-3xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {" "}
            <Icons.Plus size={24} />{" "}
            <span className="text-xs font-bold">Yeni Adres Ekle</span>{" "}
          </button>
        )}{" "}
      </div>{" "}
      {addresses.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          {" "}
          <Icons.MapPin size={32} className="mx-auto mb-2 opacity-30" />{" "}
          <p className="text-sm">
            Henüz kayıtlı adresiniz yok.
            <br />
            Yukarıdan yeni adres ekleyebilirsiniz.
          </p>{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default CheckoutAddressStep;
