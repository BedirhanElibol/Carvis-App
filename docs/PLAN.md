# Plan - Landing Screen Revamp (Mindbody-Inspired)

Bu plan, Rapidsy ana sayfasını (`LandingScreen.jsx`) modern bir hizmet arama dizini ve etkileşimli harita modülüyle zenginleştirmeyi amaçlamaktadır.

---

## 🤖 Agents & Roles

- **project-planner:** Detaylı görev dağılımı ve `docs/PLAN.md` dokümantasyonunu hazırlar.
- **frontend-specialist:** [LandingScreen.jsx](file:///c:/Users/Bedirhan/Desktop/Carvis-App/Carvis/src/features/home/LandingScreen.jsx) üzerinde glassmorphic arama çubuğu, kategori grid'i, interaktif harita pinleri ve Framer Motion animasyonlarını uygular.
- **seo-specialist:** Sayfanın arama motoru optimizasyonu (meta tags, alt tags, heading hierarchy) ve UX kontrast uyumluluğunu test eder.

---

## 📋 Task Breakdown

### Phase 1: Planning & Setup
- [x] Brainstorming ve yaklaşım seçimi (Option A hibrit tercih edildi)
- [ ] `docs/PLAN.md` dosyasının oluşturulması ve kullanıcı onayı

### Phase 2: Design & UI Implementation
- [ ] **State Tanımlamaları:** `LandingScreen.jsx` içerisine `searchTerm`, `searchLocation` ve `hoveredPin` state'lerinin eklenmesi.
- [ ] **Hero Search Bar:** Şehir seçimi (İstanbul, Ankara, İzmir) ve hizmet arama girdisi içeren entegre arama çubuğunun oluşturulması.
- [ ] **Quick Categories Carousel:** Lucide ikonlarıyla süslenmiş yuvarlak, parlayan kategori kartlarının eklenmesi.
- [ ] **Interactive Map Preview (Hover Pins):**
  - Sol tarafta popüler 3 servis kartı.
  - Sağ tarafta pinleri olan etkileşimli bir SVG harita illüstrasyonu.
  - Pinlerin ve kartların hover durumunda birbirini tetiklemesi.
- [ ] **Nasıl Çalışır Stepper'ı:** 3 adımlı sürecin animasyonlu kartlarla eklenmesi.

### Phase 3: Integration & APIs
- [ ] Arama yapıldığında veya kategorilere tıklandığında konum ve arama parametrelerinin `/application/home` kokpit sayfasına taşınması.

### Phase 4: Verification & Audit
- [ ] `ux_audit.py` ile görsel uyumluluk denetimi.
- [ ] `seo_checker.py` ile SEO uygunluk denetimi.
- [ ] `checklist.py` ile genel sistem doğrulaması.

---

## 🏁 Verification Commands
```powershell
python .agent/skills/frontend-design/scripts/ux_audit.py .
python .agent/skills/seo-fundamentals/scripts/seo_checker.py .
python .agent/scripts/checklist.py .
```
