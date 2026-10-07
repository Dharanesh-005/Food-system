import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { FoodRecord, AreaName, FoodStatus } from '../../types';
import { PhotoUploadModal } from '../common/PhotoUploadModal';
import {
  Activity,
  Plus,
  Camera,
  Thermometer,
  Droplets,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const FoodMonitoringSection: React.FC = () => {
  const { foodRecords, beneficiaries, uploadFoodRecord } = useCareNest();

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);

  // New food record form state
  const [selectedBenId, setSelectedBenId] = useState(beneficiaries[0]?.id || '');
  const [foodType, setFoodType] = useState('Ponni Boiled Rice');
  const [quantity, setQuantity] = useState(0.5);
  const [requiredQuantity, setRequiredQuantity] = useState(3.0);
  const [temp, setTemp] = useState(29.4);
  const [humidity, setHumidity] = useState(62);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>(
    '/src/assets/images/market_rice_curry_1790230577633.jpg'
  );

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const ben = beneficiaries.find((b) => b.id === selectedBenId);
    if (!ben) return;

    const ratio = quantity / requiredQuantity;
    let status: FoodStatus = 'sufficient';
    if (ratio <= 0.25) status = 'critical';
    else if (ratio <= 0.5) status = 'low';

    uploadFoodRecord({
      beneficiaryId: ben.id,
      beneficiaryName: ben.name,
      area: ben.area,
      foodType,
      quantity,
      requiredQuantity,
      unit: 'kg',
      temp,
      humidity,
      photoUrl: capturedPhotoUrl,
      status,
    });

    setIsNewRecordOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & SDG 2 Notice */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              SDG 2 Zero Hunger Telemetry
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Food Monitoring & Environmental Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time household grain inventory, storage humidity, ambient temperatures & photo logs
          </p>
        </div>

        <button
          onClick={() => setIsNewRecordOpen(true)}
          className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Log Food Inspection Record
        </button>
      </div>

      {/* Mandatory Accuracy Disclaimer banner */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">System Food Verification Policy:</span> Manual measurements
          conducted by volunteers and verified scale weights are used for all inventory
          calculations. Photo records are captured for audit verification and storage conditions.
        </div>
      </div>

      {/* Active Food Stock Cards (Beneficiary Live Telemetry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map((b) => {
          const ratio = b.currentStockKg / b.requiredStockKg;
          const percent = Math.round(ratio * 100);

          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-sm transition-all space-y-3"
            >
              {/* Beneficiary Name & Area */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {b.area} · <span className="font-mono text-slate-600">{b.code}</span>
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    b.foodStatus === 'emergency'
                      ? 'bg-purple-100 text-purple-700'
                      : b.foodStatus === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : b.foodStatus === 'low'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {b.foodStatus.toUpperCase()}
                </span>
              </div>

              {/* Food Item & Stock Level Bar */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">🍚 {b.foodRequirement}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {b.currentStockKg} kg remaining
                  </span>
                </div>

                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent <= 25
                        ? 'bg-red-500'
                        : percent <= 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>{percent}% of 3.0 kg quota</span>
                  <span>
                    {b.foodStatus === 'critical'
                      ? '🔴 Critical'
                      : b.foodStatus === 'low'
                      ? '🟡 Low'
                      : '🟢 Sufficient'}
                  </span>
                </div>
              </div>

              {/* Temperature and Humidity Telemetry */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>{b.ambientTemp}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>{b.ambientHumidity}% Humidity</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">
                  Updated {b.locationLastUpdated}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Food Photo History Gallery */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Food Inspection Photo Gallery
            </h3>
            <p className="text-xs text-slate-500">
              Audited provisions and storage condition captures from field volunteer checks
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {foodRecords.length} verified records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {foodRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-sm transition-all"
            >
              <div className="relative aspect-4/3 bg-stone-200 overflow-hidden">
                <img
                  src={rec.photoUrl}
                  alt={rec.foodType}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                      rec.status === 'critical'
                        ? 'bg-red-500 text-white'
                        : rec.status === 'low'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {rec.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{rec.beneficiaryName}</h4>
                  <p className="text-[11px] text-slate-500">{rec.area}</p>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold">{rec.foodType}</span>
                  <span className="font-mono font-bold">{rec.quantity} kg</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-stone-200/70 pt-2">
                  <span>
                    🌡️ {rec.temp}°C · 💧 {rec.humidity}%
                  </span>
                  <span>{rec.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Food Inspection Record Modal */}
      {isNewRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Log Food Inspection Record</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record verified scale weight and upload container condition photo.
            </p>

            <form onSubmit={handleCreateRecord} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Beneficiary</label>
                <select
                  value={selectedBenId}
                  onChange={(e) => setSelectedBenId(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - {b.area} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Food Item</label>
                <input
                  type="text"
                  required
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Remaining Stock (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quota Target (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(parseFloat(e.target.value) || 3)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ambient Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value) || 29)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(parseInt(e.target.value) || 60)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Food Condition Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                    <img
                      src={capturedPhotoUrl}
                      alt="Food"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-4 h-4" /> Change Photo
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewRecordOpen(false)}
                  className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoSelected={(url) => setCapturedPhotoUrl(url)}
        title="Upload Food Inspection Photo"
        description="Capture image of food supplies, grain tins, or meal packet."
        consentNotice="Food container photos are recorded for quality control and zero-hunger verification."
      />
    </div>
  );
};
