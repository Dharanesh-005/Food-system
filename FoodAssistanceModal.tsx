import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { Beneficiary, GeoLocation } from '../../types';
import { Utensils, X, MapPin, AlertTriangle, Check, ShieldCheck } from 'lucide-react';

interface FoodAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBeneficiary?: Beneficiary | null;
}

export const FoodAssistanceModal: React.FC<FoodAssistanceModalProps> = ({
  isOpen,
  onClose,
  targetBeneficiary,
}) => {
  const { beneficiaries, requestFood, addToast } = useCareNest();

  const [selectedBenId, setSelectedBenId] = useState<string>(
    targetBeneficiary ? targetBeneficiary.id : beneficiaries[0]?.id || ''
  );
  const [foodRequired, setFoodRequired] = useState(
    targetBeneficiary ? targetBeneficiary.foodRequirement : 'Ponni Boiled Rice (3kg) + Toor Dal (1kg)'
  );
  const [quantity, setQuantity] = useState('4 kg standard ration pack');
  const [reason, setReason] = useState('Stock exhausted, unable to purchase from market');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Urgent');
  const [useCurrentGps, setUseCurrentGps] = useState(true);

  if (!isOpen) return null;

  const currentBen = beneficiaries.find((b) => b.id === selectedBenId) || targetBeneficiary;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBenId) return;

    let coords: GeoLocation | undefined = undefined;
    if (useCurrentGps && currentBen) {
      coords = currentBen.coords;
    }

    requestFood(selectedBenId, foodRequired, quantity, reason, priority, coords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Create Food Assistance Request
              </h3>
              <p className="text-xs text-slate-500">
                Dispatches urgent food ration or cooked meals to vulnerable seniors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Beneficiary selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Beneficiary
            </label>
            <select
              value={selectedBenId}
              onChange={(e) => {
                setSelectedBenId(e.target.value);
                const ben = beneficiaries.find((b) => b.id === e.target.value);
                if (ben) {
                  setFoodRequired(ben.foodRequirement);
                }
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.age} yrs · {b.area}) - {b.code}
                </option>
              ))}
            </select>
          </div>

          {/* Food Required */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Food Provisions / Meal Required
            </label>
            <input
              type="text"
              required
              value={foodRequired}
              onChange={(e) => setFoodRequired(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
              placeholder="e.g. Rice 3kg, Toor Dal 1kg, Vegetable Basket"
            />
          </div>

          {/* Quantity & Pack size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Quantity / Volume
              </label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
                placeholder="e.g. 4 kg total"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full p-2.5 border rounded-xl text-xs font-bold ${
                  priority === 'Emergency'
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : priority === 'Urgent'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-stone-50 border-stone-200 text-slate-800'
                }`}
              >
                <option value="Normal">Normal (Scheduled within 24h)</option>
                <option value="Urgent">Urgent (Stock Critical / Today)</option>
                <option value="Emergency">🚨 Emergency (Immediate Dispatch)</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Reason / Field Notes
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
              placeholder="e.g. Stock below 0.5 kg, bedridden, caregiver unavailable..."
            />
          </div>

          {/* Location details */}
          {currentBen && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Delivery Location: {currentBen.area}
                </span>
                <span className="text-[11px] text-slate-500 block">{currentBen.address}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  Lat: {currentBen.coords.lat.toFixed(4)}, Lng: {currentBen.coords.lng.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Submit Request to NGO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
