import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
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
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // SW registered
      })
      .catch((registrationError) => {
        console.error("SW registration failed: ", registrationError);
      });
  });
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
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
