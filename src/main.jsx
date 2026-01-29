import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './main.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { ShopProvider } from './context/ShopContext'
import { SellerProvider } from './context/SellerContext'
import { GarageProvider } from './context/GarageContext'
import { QuoteProvider } from './context/QuoteContext'
import { NotificationProvider } from './context/NotificationContext'
import { MessageProvider } from './context/MessageContext'
import { AppointmentProvider } from './context/AppointmentContext'
import { PaymentProvider } from './context/PaymentContext'
import { OrderProvider } from './context/OrderContext'
import { AIProvider } from './context/AIContext'
import { MapProvider } from './context/MapContext'
import { HelmetProvider } from 'react-helmet-async';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <UIProvider>
            <GarageProvider>
              <AIProvider>
                <MapProvider>
                  <ShopProvider>
                    <SellerProvider>
                      <QuoteProvider>
                        <NotificationProvider>
                          <MessageProvider>
                            <AppointmentProvider>
                              <PaymentProvider>
                                <OrderProvider>
                                  <App />
                                </OrderProvider>
                              </PaymentProvider>
                            </AppointmentProvider>
                          </MessageProvider>
                        </NotificationProvider>
                      </QuoteProvider>
                    </SellerProvider>
                  </ShopProvider>
                </MapProvider>
              </AIProvider>
            </GarageProvider>
          </UIProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)