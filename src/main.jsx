import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./main.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { ShopProvider } from "./context/ShopContext";
import { SellerProvider } from "./context/SellerContext";
import { GarageProvider } from "./context/GarageContext";
import { QuoteProvider } from "./context/QuoteContext";
import { NotificationProvider } from "./context/NotificationContext";
import { MessageProvider } from "./context/MessageContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import { PaymentProvider } from "./context/PaymentContext";
import { OrderProvider } from "./context/OrderContext";
import { AIProvider } from "./context/AIContext";
import { MapProvider } from "./context/MapContext";
import { WalletProvider } from "./context/WalletContext";
import { HelmetProvider } from "react-helmet-async";
// Global Dynamic Import Chunk Error Handler for Vercel Deployments & Stale SW Caches
window.addEventListener("error", (event) => {
  const msg = event?.message || "";
  if (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Expected a JavaScript-or-Wasm module script") ||
    msg.includes("Importing a module script failed")
  ) {
    const lastReload = sessionStorage.getItem("chunk_reload_ts");
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
      sessionStorage.setItem("chunk_reload_ts", String(now));
      window.location.reload();
    }
  }
});

// Purge any stale legacy Service Worker caches
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister();
    }
  }).catch(() => {});
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {" "}
    <HelmetProvider>
      {" "}
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {" "}
        <AuthProvider>
          {" "}
          <UIProvider>
            {" "}
            <WalletProvider>
              {" "}
              <GarageProvider>
                {" "}
                <AIProvider>
                  {" "}
                  <MapProvider>
                    {" "}
                    <ShopProvider>
                      {" "}
                      <SellerProvider>
                        {" "}
                        <QuoteProvider>
                          {" "}
                          <NotificationProvider>
                            {" "}
                            <MessageProvider>
                              {" "}
                              <AppointmentProvider>
                                {" "}
                                <PaymentProvider>
                                  {" "}
                                  <OrderProvider>
                                    {" "}
                                    <App />{" "}
                                  </OrderProvider>{" "}
                                </PaymentProvider>{" "}
                              </AppointmentProvider>{" "}
                            </MessageProvider>{" "}
                          </NotificationProvider>{" "}
                        </QuoteProvider>{" "}
                      </SellerProvider>{" "}
                    </ShopProvider>{" "}
                  </MapProvider>{" "}
                </AIProvider>{" "}
              </GarageProvider>{" "}
            </WalletProvider>{" "}
          </UIProvider>{" "}
        </AuthProvider>{" "}
      </BrowserRouter>{" "}
    </HelmetProvider>{" "}
  </StrictMode>,
);
