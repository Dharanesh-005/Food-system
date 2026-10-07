import React, { useState } from 'react';
import { CareNestProvider, useCareNest } from './context/CareNestContext';
import { Navbar } from './components/layout/Navbar';
import { NGODashboard } from './components/dashboard/NGODashboard';
import { BeneficiaryList } from './components/beneficiaries/BeneficiaryList';
import { BeneficiaryProfileModal } from './components/beneficiaries/BeneficiaryProfileModal';
import { FoodAssistanceModal } from './components/food/FoodAssistanceModal';
import { FoodMonitoringSection } from './components/food/FoodMonitoringSection';
import { LiveDeliveryCenter } from './components/deliveries/LiveDeliveryCenter';
import { EmergencyCenter } from './components/emergency/EmergencyCenter';
import { CommunityMarket } from './components/market/CommunityMarket';
import { NGOAnalytics } from './components/analytics/NGOAnalytics';
import { ElderlyPortal } from './components/beneficiaries/ElderlyPortal';
import { VolunteerPortal } from './components/volunteers/VolunteerPortal';
import { Beneficiary } from './types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, activeTab, setActiveTab, toasts, removeToast } = useCareNest();

  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetBenForRequest, setTargetBenForRequest] = useState<Beneficiary | null>(null);

  const handleOpenBeneficiary = (ben: Beneficiary) => {
    setSelectedBeneficiary(ben);
    setIsProfileModalOpen(true);
  };

  const handleOpenRequestFood = (ben?: Beneficiary) => {
    setTargetBenForRequest(ben || null);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Render role-appropriate view */}
        {role === 'beneficiary' ? (
          <ElderlyPortal />
        ) : role === 'volunteer' && activeTab === 'volunteer-portal' ? (
          <VolunteerPortal />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <NGODashboard
                onOpenBeneficiary={handleOpenBeneficiary}
                onOpenNewRequest={() => handleOpenRequestFood()}
              />
            )}
            {activeTab === 'beneficiaries' && (
              <BeneficiaryList
                onSelectBeneficiary={handleOpenBeneficiary}
                onRequestFood={handleOpenRequestFood}
              />
            )}
            {activeTab === 'deliveries' && <LiveDeliveryCenter />}
            {activeTab === 'food-monitoring' && <FoodMonitoringSection />}
            {activeTab === 'emergency' && (
              <EmergencyCenter onOpenBeneficiary={handleOpenBeneficiary} />
            )}
            {activeTab === 'market' && <CommunityMarket />}
            {activeTab === 'analytics' && <NGOAnalytics />}
            {activeTab === 'elderly-portal' && <ElderlyPortal />}
            {activeTab === 'volunteer-portal' && <VolunteerPortal />}
          </>
        )}
      </main>

      {/* Global Modals */}
      <BeneficiaryProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        beneficiary={selectedBeneficiary}
        onRequestFood={(ben) => {
          setIsProfileModalOpen(false);
          handleOpenRequestFood(ben);
        }}
      />

      <FoodAssistanceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        targetBeneficiary={targetBenForRequest}
      />

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-950'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-white border-stone-200 text-slate-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-teal-700" />}
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <h4 className="font-bold">{toast.title}</h4>
              <p className="mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
              <span className="text-[10px] opacity-60 mt-1 block">{toast.timestamp}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                CN
              </div>
              <span className="font-bold text-slate-800">
                CareNest · Kumbakonam Community Food Assistance & Elderly Care Platform
              </span>
            </div>
            <div className="flex items-center gap-3 font-medium">
              <span className="text-teal-800 font-semibold">SDG 2: Zero Hunger</span>
              <span>·</span>
              <span>Health & Hygiene Monitoring</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center sm:text-left leading-relaxed">
            Service Areas: Kumbakonam Town, Darasuram, Swamimalai, Thiruvidaimarudur, Patteeswaram,
            Nachiyarkoil, Valangaiman, Koranattukaruppur, Ullur, and Cholapuram, Tamil Nadu, India.
            Privacy Safeguard: Simulated sample beneficiary data and coordinates are used for operational
            prototyping.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CareNestProvider>
      <AppContent />
    </CareNestProvider>
  );
}
