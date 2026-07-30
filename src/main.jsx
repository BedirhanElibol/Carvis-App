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
// Unregister any conflicting legacy manual service workers to resolve false "no internet" errors
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      // Unregister manual conflicting scripts if present
      if (registration.active?.scriptURL?.includes("sw.js")) {
        registration.unregister();
      }
    }
  });
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
