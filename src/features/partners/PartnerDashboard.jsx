import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import MechanicDashboardView from './components/MechanicDashboardView';
import PartsDashboardView from './components/PartsDashboardView';
import CarwashDashboardView from './components/CarwashDashboardView';
import TowTruckDashboardView from './components/TowTruckDashboardView';
import InsuranceDashboardView from './components/InsuranceDashboardView';
import ParkingDashboard from './ParkingDashboard';
import ValetDashboard from './ValetDashboard';

const PartnerDashboard = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();

    // Determine active role based on logged-in user profile role
    const activeRole = searchParams.get('role') || currentUser?.role || 'mechanic';

    const renderDashboard = () => {
        switch (activeRole) {
            case 'mechanic':
                return <MechanicDashboardView currentUser={currentUser} />;
            case 'parts':
                return <PartsDashboardView currentUser={currentUser} />;
            case 'carwash':
                return <CarwashDashboardView currentUser={currentUser} />;
            case 'tow_truck':
                return <TowTruckDashboardView currentUser={currentUser} />;
            case 'insurance':
                return <InsuranceDashboardView currentUser={currentUser} />;
            case 'parking':
                return <ParkingDashboard currentUser={currentUser} />;
            case 'valet':
                return <ValetDashboard currentUser={currentUser} />;
            default:
                return <MechanicDashboardView currentUser={currentUser} />;
        }
    };

    return (
        <div className="animate-fade-in">
            {renderDashboard()}
        </div>
    );
};

export default PartnerDashboard;
