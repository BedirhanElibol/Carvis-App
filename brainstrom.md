# Rapidsy UI Audit & Feedback (Brainstorming)

As requested, I've "clicked" through the code paths of every button. Here is the breakdown of findings and logic errors.

## 🛑 Critical Logic Gaps (Broken Buttons)

### 1. The "Usta/Mechanic" Bottom-Nav Loop
- **Problem**: Clicking the 🔧 icon sets the tab to `mechanics` but **instantly** triggers `setShowVehicleFlow(true)`.
- **Result**: The user never sees the list of mechanics; they are immediately forced into a vehicle search/add flow. This feels like the app is "stuck" or "going to the wrong place".
- **Fix**: Navigation should only switch tabs. The vehicle flow should be a separate button *within* the Mechanics screen or a "Smart Bid" CTA.

### 2. The AI Assistant "Thinking" Trap
- **Problem**: `pollinations.ai` is used as a proxy. If it times out or returns a 50x error, the `isAiLoading` state remains true (or the user receives a generic "internet connection" message that doesn't clear the visual state in some paths).
- **Result**: "AI doesn't answer" or hangs on "düşünüyor".
- **Fix**: Implement a 10s timeout and a "Try Again" bubble.

### 3. "Buy Now" Button Inactivity
- **Problem**: In the `CartDrawer`, the "Buy Now" button is `disabled` if `!selectedAddress`.
- **Result**: For a new user, the button is just gray and does nothing. There is no hint saying "Please add/select an address first".
- **Fix**: Add a tool-tip or a red border blink on the address selector if the user clicks "Buy Now" while it's empty.

### 4. Seller Product Sync Race
- **Problem**: `handleRealProductAdd` calls `fetchProductsFromSupabase`, but `fetchPublicData` (in a separate `useEffect`) might overwrite this with old/cached public data if not careful.
- **Result**: User adds a product, but it "disappears" or doesn't update until a hard refresh.

---

## 🏗 Skeleton (Architectural) Gaps

### 1. Prop Drilling Nightmare
- Every component receives `t`, `showAlert`, `currentUser`. If one component in the chain forgets to pass it down, the button crashes.
- **Solution**: Implement `AuthContext` and `TranslationContext`.

### 2. Lack of "Loading Skeleton" UI
- When fetching from Supabase, the app just shows empty lists. This causes the "chasing results" feeling.
- **Solution**: Use React Suspense or explicit `SkeletonCard` components.

### 3. Hardcoded Mock Logic Mixture
- Real Supabase logic is currently fighting with MOCK data in the same state variables.
- **Solution**: Clean separation of `INITIAL_DATA` and `SERVER_DATA`.

---

**Next Action**: Decomposing `App.jsx` and applying the logic fixes outlined above.
