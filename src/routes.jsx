import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import SEO from './components/SEO';

// Lazy Load Screens
const LandingScreen = lazy(() => import('./features/home/LandingScreen'));
const CustomerHome = lazy(() => import('./features/home/CustomerHome'));
const PartsScreen = lazy(() => import('./features/shop/PartsScreen'));
const MechanicsScreen = lazy(() => import('./features/services/MechanicsScreen'));
const MapScreen = lazy(() => import('./features/map/MapScreen'));
const ProfileScreen = lazy(() => import('./features/profile/ProfileScreen'));
const AIChatScreen = lazy(() => import('./features/ai/AIChatScreen'));
const OrdersScreen = lazy(() => import('./features/orders/OrdersScreen'));
const QuotesScreen = lazy(() => import('./features/quotes/QuotesScreen'));
const AppointmentsScreen = lazy(() => import('./features/appointments/AppointmentScreen'));

// --- SECONDARY FEATURES ---
const CampaignsScreen = lazy(() => import('./features/extras/CampaignsScreen'));
const FuelScreen = lazy(() => import('./features/extras/FuelScreen'));
const ParkingScreen = lazy(() => import('./features/extras/ParkingScreen'));
const ProductDetailScreen = lazy(() => import('./features/shop/ProductDetailScreen'));
const WalletScreen = lazy(() => import('./features/extras/WalletScreen'));
const TenderScreen = lazy(() => import('./features/extras/TenderScreen'));
const ValetScreen = lazy(() => import('./features/extras/ValetScreen'));

// --- PARTNER FEATURES (New) ---
const PartnerLayout = lazy(() => import('./components/layout/PartnerLayout'));
const CheckoutScreen = lazy(() => import('./features/checkout/CheckoutScreen')); // NEW
const PartnerDashboard = lazy(() => import('./features/partners/PartnerDashboard'));
const ParkingCapacity = lazy(() => import('./features/partners/parking/ParkingCapacity'));
const ValetRequests = lazy(() => import('./features/partners/valet/ValetRequests'));
const MechanicJobs = lazy(() => import('./features/partners/mechanic/MechanicJobs'));
const MechanicServices = lazy(() => import('./features/partners/mechanic/MechanicServices'));
const SellerProducts = lazy(() => import('./features/partners/products/SellerProducts'));
// Partner Auth
const PartnerLandingScreen = lazy(() => import('./features/partners/PartnerLandingScreen'));
const PartnerAuthScreen = lazy(() => import('./features/partners/auth/PartnerAuthScreen'));

// --- ADMIN FEATURES ---
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./features/admin/UserManagement'));

const NotificationScreen = lazy(() => import('./features/notifications/NotificationScreen'));
const MessageListScreen = lazy(() => import('./features/messages/MessageListScreen'));

// Protected Route Component with RBAC
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;
    }

    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    // Role check if allowedRoles is provided
    if (allowedRoles.length > 0) {
        const userRole = currentUser.role || 'customer';
        if (!allowedRoles.includes(userRole)) {
            // Redirect based on role if unauthorized
            if (userRole === 'partner') return <Navigate to="/partner/dashboard" replace />;
            if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
            return <Navigate to="/application/home" replace />;
        }
    }

    return children;
};

export const AppRoutes = () => {
    const { currentUser } = useAuth();

    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary-600" size={32} /></div>}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<><SEO title="Oto Servis & Bakım Asistanı" description="Carvis ile en iyi ustaları bulun, bakım takibi yapın." /><LandingScreen /></>} />
                <Route path="/partner-login" element={<><SEO title="Kurumsal Giriş" /><PartnerLandingScreen /></>} />
                <Route path="/partner-login/:role" element={<PartnerAuthScreen />} />

                {/* Customer Routes */}
                <Route path="/application/home" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><SEO title="Garajım" /><CustomerHome /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}><NotificationScreen /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}><MessageListScreen /></ProtectedRoute>} />
                <Route path="/app/home" element={<Navigate to="/application/home" replace />} />

                <Route path="/app/parts" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><PartsScreen /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><CheckoutScreen /></ProtectedRoute>} />
                <Route path="/app/mechanics" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><MechanicsScreen /></ProtectedRoute>} />
                <Route path="/app/profile" element={<ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}><ProfileScreen /></ProtectedRoute>} />
                <Route path="/app/ai" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><AIChatScreen /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}><OrdersScreen /></ProtectedRoute>} />
                <Route path="/quotes" element={<ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}><QuotesScreen /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}><AppointmentsScreen /></ProtectedRoute>} />

                {/* Secondary Features */}
                <Route path="/app/campaigns" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><CampaignsScreen /></ProtectedRoute>} />
                <Route path="/app/fuel" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><FuelScreen /></ProtectedRoute>} />
                <Route path="/app/parking" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><ParkingScreen /></ProtectedRoute>} />
                <Route path="/app/product/:id" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><ProductDetailScreen /></ProtectedRoute>} />
                <Route path="/app/wallet" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><WalletScreen /></ProtectedRoute>} />
                <Route path="/app/tender" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><TenderScreen /></ProtectedRoute>} />
                <Route path="/app/map" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><MapScreen /></ProtectedRoute>} />
                <Route path="/app/valet" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><ValetScreen /></ProtectedRoute>} />

                {/* Legacy Seller Redirect */}
                <Route path="/seller/dashboard" element={<Navigate to="/partner/dashboard" replace />} />
                <Route path="/seller/*" element={<Navigate to="/partner/dashboard" replace />} />

                {/* Partner Routes */}
                <Route path="/partner" element={<ProtectedRoute allowedRoles={['partner', 'admin']}><PartnerLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<PartnerDashboard />} />
                    <Route path="parking/capacity" element={<ParkingCapacity />} />
                    <Route path="valet/requests" element={<ValetRequests />} />
                    <Route path="mechanic/jobs" element={<MechanicJobs />} />
                    <Route path="mechanic/services" element={<MechanicServices />} />
                    <Route path="products" element={<SellerProducts />} />
                    <Route path="settings" element={<div className="p-6 text-white">Ayarlar (Yapım Aşamasında)</div>} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="finance" element={<div className="p-6 text-white text-2xl font-bold">Finans & Kasa (Yakında)</div>} />
                    <Route path="settings" element={<div className="p-6 text-white text-2xl font-bold">Sistem Ayarları (Yakında)</div>} />
                </Route>

                {/* Catch all */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
            </Routes>
        </Suspense>
    );
};
