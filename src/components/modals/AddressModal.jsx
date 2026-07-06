import React, { useState } from "react";
import { MapPin, PlusCircle, X } from "lucide-react";

const AddressModal = ({
  show,
  onClose,
  t,
  addresses,
  onSelectAddress,
  onAddAddress,
}) => {
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newFullAddress, setNewFullAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (!show || !t) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[85] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg font-sans">{t.selectAddress}</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {!isAdding ? (
          <div className="space-y-3 mb-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr)}
                className="p-4 rounded-2xl border border-slate-100 hover:border-orange-600 hover:bg-orange-50 cursor-pointer transition shadow-md"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-orange-600" />
                  <span className="font-bold text-slate-900 font-sans">{addr.title}</span>
                </div>
                <p className="text-xs text-slate-500 pl-6 font-sans">
                  {addr.fullAddress}
                </p>
              </div>
            ))}
            <button
              onClick={() => setIsAdding(true)}
              className="w-full border-2 border-dashed border-orange-400 text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-500 transition shadow-inner"
            >
              <PlusCircle size={18} />
              <span className="font-sans">{t.addNewAddress}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              value={newAddressTitle}
              onChange={(e) => setNewAddressTitle(e.target.value)}
              placeholder={t.addressTitle}
              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-orange-400 transition"
            />
            <textarea
              value={newFullAddress}
              onChange={(e) => setNewFullAddress(e.target.value)}
              placeholder={t.fullAddress}
              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none text-sm h-24 resize-none focus:ring-2 focus:ring-orange-400 transition font-sans"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                {t.back}
              </button>
              <button
                onClick={() => {
                  onAddAddress({
                    title: newAddressTitle,
                    fullAddress: newFullAddress,
                  });
                  setIsAdding(false);
                }}
                className="flex-[2] bg-orange-600 text-slate-900 dark:text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/50"
              >
                <span className="font-sans">{t.save}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressModal;
