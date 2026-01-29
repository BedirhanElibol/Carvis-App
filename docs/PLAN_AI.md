# 🤖 Phase 7: AI Intelligence Implementation Plan

**Objective**: Integrate "Smart" features into Carvis to differentiate it from standard apps.
**Strategy**: Implement a structured `AIService` that currently returns high-fidelity mock data but is ready for real Gemini/OpenAI API integration.

## 🏗️ 1. Architecture: The AI Layer

### Service Structure (`src/services/ai/`)
- **`AIService.js`**: Main entry point.
  - `diagnoseIssue(text, carModel)`: Returns potential problems + estimated cost.
  - `analyzeSound(audioBlob)`: (Mock) Returns "Alternator Belt" or "Engine Knock".
  - `estimateValetTime(location, time)`: Smart prediction for arrival.

### Context Integration
- AI needs access to `AuthContext` (User Name) and `CarContext` (User's Car Model).

## 🧩 2. Features & UI Components

### A. The "Carvis Brain" (Floating Assistant)
- **Component**: `AIAssistant.jsx`
- **Location**: Global Floating Action Button (FAB) on bottom-right (except Auth screens).
- **Capabilities**:
  - Chat Interface.
  - Quick Actions: "Arıza Lambası Nedir?", "Lastik Basıncı Kaç Olmalı?".

### B. Smart Mechanic (Arıza Tespit)
- **Flow**: User types "Arabadan ıslık sesi geliyor".
- **AI Response**:
  - *Diagnosis*: "Turbo hortumu çatlağı olabilir."
  - *Severity*: High.
  - *Action*: "En yakın 'Turbo' uzmanı servisi bulayım mı?" -> Links to Partner Logic.

### C. Visual Intelligence (Görüntü İşleme)
- **Input**: User uploads a photo of a Dashboard Light.
- **Output**: "Bu 'Motor Arıza Lambası' (Check Engine). Olası sebepler: Oksijen sensörü, Buji..."

## 🔄 3. Orchestration Steps
1.  **Skeleton**: Create `src/services/ai/gemini.js` (Mock implementation first).
2.  **UI**: Create `AIAssistant` component components.
3.  **Integration**: Add `AIAssistant` to `App.jsx` or `BottomNav`.
4.  **Testing**: Verify "Talk to AI" flow.

## ⚠️ Notes
- **Mock Mode**: Initially, we will use a "Simulation Mode" to demonstrate the UX without needing an API Key immediately.
- **Language**: AI responses will be in Turkish.
