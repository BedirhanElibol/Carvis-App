import React, { useState, useRef, useEffect } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AIService } from "../../services/ai/AIService";
import { useShop } from "../../context/ShopContext";
import { useNavigate } from "react-router-dom";

const QUICK_PROMPTS = [
  { emoji: "🔴", label: "Arıza Lambası", text: "Arıza lambam yandı ne yapmalıyım?" },
  { emoji: "🔊", label: "Motor Sesi", text: "Motordan tıkırtı sesi geliyor" },
  { emoji: "🛑", label: "Fren Sorunu", text: "Fren yaparken gıcırdıyor" },
  { emoji: "🔋", label: "Akü / Marş", text: "Araç marş yapmıyor, akü bitmiş olabilir mi?" },
  { emoji: "🛢️", label: "Yağ / Bakım", text: "Yağ lambası yandı ne yapmalıyım?" },
  { emoji: "💨", label: "Lastik", text: "Lastik basıncım düştü, ne kadar olmalı?" },
];

const urgencyColors = {
  low: "bg-green-500/10 border-green-500/30 text-green-300",
  medium: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  high: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  critical: "bg-red-500/10 border-red-500/30 text-red-300",
};

const ProductCard = ({ product, onAddToCart }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 hover:border-primary-500/40 transition-all">
    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">🔧</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-white truncate uppercase">{product.name}</p>
      <p className="text-[10px] text-slate-400">{product.brand}</p>
      <p className="text-sm font-black text-teal-400 mt-0.5">{product.price?.toLocaleString("tr-TR")} ₺</p>
    </div>
    <button onClick={() => onAddToCart(product)} className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-xl transition-all">
      <Icons.ShoppingCart size={16} />
    </button>
  </motion.div>
);

const DiagnosisCard = ({ data, onBookAppointment }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border p-4 ${urgencyColors[data.urgency] || urgencyColors.medium}`}>
    <div className="flex items-start gap-2 mb-2">
      <Icons.AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-black uppercase">{data.title}</p>
        <p className="text-[11px] opacity-80 mt-1">{data.description}</p>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
      <p className="text-xs font-black">{data.estimatedCost}</p>
      <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-black/20">
        {data.urgency === 'critical' ? 'Kritik' : 'Ön Analiz'}
      </span>
    </div>
    {data.urgency !== 'low' && (
      <button onClick={onBookAppointment} className="mt-3 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold uppercase">
        <Icons.CalendarPlus size={14} /> Randevu Al
      </button>
    )}
  </motion.div>
);

const AIAssistant = () => {
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: `Merhaba! 🚗 Ben Carvis Asistan. Aracınızın sorunlarını analiz eder, size en uygun parça ve servisleri öneririm.` }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  const handleSendMessage = async (textOverride) => {
    const text = textOverride || inputText;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInputText("");
    setIsTyping(true);
    try {
      const chatResponse = await AIService.chat(text, messages);
      setMessages(prev => [...prev, chatResponse]);
      const diagnosis = await AIService.diagnoseIssue(text);
      if (diagnosis.success && diagnosis.data.urgency !== "low") {
        setMessages(prev => [...prev, { role: "ai", type: "diagnosis", data: diagnosis.data }]);
        if (diagnosis.data.suggestedPartKeyword) {
          const products = await AIService.searchProductsByKeyword(diagnosis.data.suggestedPartKeyword);
          if (products.length > 0) {
            setMessages(prev => [...prev, { role: "ai", type: "products", content: `Önerilen Ürünler:`, products }]);
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Şu an yanıt veremiyorum, lütfen tekrar deneyin." }]);
    } finally { setIsTyping(false); }
  };

  const renderMessage = (msg, index) => {
    if (msg.type === "diagnosis") return <div key={index} className="max-w-[90%] w-full"><DiagnosisCard data={msg.data} onBookAppointment={() => navigate("/app/appointments")} /></div>;
    if (msg.type === "products") return (
      <div key={index} className="max-w-[90%] w-full space-y-2">
        <p className="text-xs text-slate-400 flex items-center gap-1 font-bold"><Icons.Package size={12} /> {msg.content}</p>
        {msg.products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
      </div>
    );
    return (
      <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${msg.role === "user" ? "bg-teal-600 text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"}`}>
          {msg.role === "ai" && <Icons.Bot size={14} className="inline mr-2 text-teal-400" />}
          {msg.content}
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 z-50 w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center text-white border border-white/10">
          <Icons.MessageSquare size={26} className="animate-pulse" />
        </motion.button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-sm h-[70vh] flex flex-col rounded-3xl border border-white/10 shadow-2xl bg-slate-950 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-teal-800 to-emerald-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><Icons.Bot size={22} className="text-white" /></div>
                <div><h3 className="font-black text-white text-sm uppercase">Carvis Asistan</h3><p className="text-[10px] text-teal-300 font-bold uppercase">Oto Uzman Desteği</p></div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><Icons.X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 custom-scrollbar">
              {messages.map((msg, i) => renderMessage(msg, i))}
              {isTyping && <div className="flex gap-1.5 p-3.5 bg-white/5 rounded-2xl w-fit"><span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div>}
              <div ref={messagesEndRef} />
            </div>
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK_PROMPTS.map(p => <button key={p.label} onClick={() => handleSendMessage(p.text)} className="whitespace-nowrap px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-300 uppercase">{p.emoji} {p.label}</button>)}
              </div>
            )}
            <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2">
              <input type="text" placeholder="Sorununuzu yazın..." className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === "Enter" && !isTyping && handleSendMessage()} />
              <button onClick={() => handleSendMessage()} disabled={!inputText.trim() || isTyping} className="p-2.5 bg-teal-600 text-white rounded-xl active:scale-95 transition"><Icons.Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
