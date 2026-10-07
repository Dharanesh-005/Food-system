import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Beneficiary,
  Volunteer,
  AssistanceRequest,
  Delivery,
  EmergencyAlert,
  MarketProduct,
  MarketOrder,
  CartItem,
  ActivityLog,
  FoodRecord,
  ToastNotification,
  AreaName,
  FoodStatus,
  DeliveryStatus,
  MealStatusType,
  GeoLocation,
} from '../types';
import {
  INITIAL_BENEFICIARIES,
  INITIAL_VOLUNTEERS,
  INITIAL_ASSISTANCE_REQUESTS,
  INITIAL_DELIVERIES,
  INITIAL_EMERGENCIES,
  INITIAL_MARKET_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_FOOD_RECORDS,
} from '../data/seedData';

interface CareNestContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBeneficiaryId: string | null;
  setSelectedBeneficiaryId: (id: string | null) => void;
  selectedBeneficiary: Beneficiary | null;
  
  // Data entities
  beneficiaries: Beneficiary[];
  volunteers: Volunteer[];
  requests: AssistanceRequest[];
  deliveries: Delivery[];
  emergencies: EmergencyAlert[];
  marketProducts: MarketProduct[];
  orders: MarketOrder[];
  activityLogs: ActivityLog[];
  foodRecords: FoodRecord[];
  
  // Cart
  cart: CartItem[];
  addToCart: (product: MarketProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Filters
  selectedAreaFilter: AreaName | 'All';
  setSelectedAreaFilter: (area: AreaName | 'All') => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  
  // Beneficiary & Food Actions
  requestFood: (
    beneficiaryId: string,
    foodRequired: string,
    quantity: string,
    reason: string,
    priority: 'Normal' | 'Urgent' | 'Emergency',
    coords?: GeoLocation
  ) => void;
  markMealCompleted: (beneficiaryId: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  shareLocation: (beneficiaryId: string, coords: GeoLocation) => void;
  stopSharingLocation: (beneficiaryId: string) => void;
  uploadBeneficiaryPhoto: (beneficiaryId: string, photoUrl: string) => void;
  uploadFoodRecord: (data: Omit<FoodRecord, 'id' | 'timestamp'>) => void;

  // Volunteer & Delivery Actions
  assignVolunteerToRequest: (requestId: string, volunteerId: string) => void;
  assignVolunteerToEmergency: (emergencyId: string, volunteerId: string) => void;
  updateDeliveryStatus: (deliveryId: string, newStatus: DeliveryStatus, proofPhotoUrl?: string) => void;

  // Emergency Actions
  triggerEmergency: (beneficiaryId: string, customCoords?: GeoLocation, notes?: string) => void;
  resolveEmergency: (emergencyId: string) => void;

  // Market Actions
  createMarketOrder: (order: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryType: 'delivery' | 'pickup';
    paymentMethod: 'UPI / GPay' | 'Cash on Delivery' | 'Card';
  }) => MarketOrder;
  updateOrderStatus: (orderId: string, status: MarketOrder['status']) => void;
  updateMarketProduct: (productId: string, updates: Partial<MarketProduct>) => void;
  addMarketProduct: (product: Omit<MarketProduct, 'id'>) => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;

  // Calculations & Analytics
  metrics: {
    totalBeneficiaries: number;
    needAttentionCount: number;
    activeDeliveriesCount: number;
    emergencyCount: number;
    totalMarketRevenue: number;
    mealsSupportedCount: number;
    sufficientCount: number;
    lowCount: number;
    criticalCount: number;
    areaStats: Record<string, { critical: number; low: number; sufficient: number; total: number }>;
  };
  
  resetToDefaults: () => void;
}

const CareNestContext = createContext<CareNestContextType | undefined>(undefined);

export const CareNestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('carenest_role') as UserRole) || 'admin';
  });

  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('carenest_beneficiaries');
    return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
  });

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const saved = localStorage.getItem('carenest_volunteers');
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEERS;
  });

  const [requests, setRequests] = useState<AssistanceRequest[]>(() => {
    const saved = localStorage.getItem('carenest_requests');
    return saved ? JSON.parse(saved) : INITIAL_ASSISTANCE_REQUESTS;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('carenest_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('carenest_emergencies');
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCIES;
  });

  const [marketProducts, setMarketProducts] = useState<MarketProduct[]>(() => {
    const saved = localStorage.getItem('carenest_market_products');
    return saved ? JSON.parse(saved) : INITIAL_MARKET_PRODUCTS;
  });

  const [orders, setOrders] = useState<MarketOrder[]>(() => {
    const saved = localStorage.getItem('carenest_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('carenest_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>(() => {
    const saved = localStorage.getItem('carenest_food_records');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_RECORDS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('carenest_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedAreaFilter, setSelectedAreaFilter] = useState<AreaName | 'All'>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('carenest_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('carenest_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('carenest_volunteers', JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem('carenest_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('carenest_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('carenest_emergencies', JSON.stringify(emergencies));
  }, [emergencies]);

  useEffect(() => {
    localStorage.setItem('carenest_market_products', JSON.stringify(marketProducts));
  }, [marketProducts]);

  useEffect(() => {
    localStorage.setItem('carenest_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('carenest_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('carenest_food_records', JSON.stringify(foodRecords));
  }, [foodRecords]);

  useEffect(() => {
    localStorage.setItem('carenest_cart', JSON.stringify(cart));
  }, [cart]);

  const addToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 5)]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 5500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addActivity = (
    type: ActivityLog['type'],
    message: string,
    severity: ActivityLog['severity'] = 'info'
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'beneficiary') {
      setActiveTabState('elderly-portal');
    } else if (newRole === 'customer') {
      setActiveTabState('market');
    } else if (newRole === 'volunteer') {
      setActiveTabState('volunteer-portal');
    } else {
      setActiveTabState('dashboard');
    }
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
  };

  const selectedBeneficiary =
    beneficiaries.find((b) => b.id === selectedBeneficiaryId) || null;

  // Cart operations
  const addToCart = (product: MarketProduct, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast('Added to Cart', `${product.name} (x${quantity}) added.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Beneficiary Food Request
  const requestFood = (
    beneficiaryId: string,
    foodRequired: string,
    quantity: string,
    reason: string,
    priority: 'Normal' | 'Urgent' | 'Emergency',
    coords?: GeoLocation
  ) => {
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
    if (!beneficiary) return;

    const reqId = `req-${Date.now()}`;
    const newRequest: AssistanceRequest = {
      id: reqId,
      beneficiaryId: beneficiary.id,
      beneficiaryName: beneficiary.name,
      area: beneficiary.area,
      foodRequired,
      quantity,
      reason,
      priority,
      status: 'Requested',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      coords: coords || beneficiary.coords,
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Update beneficiary stock status
    setBeneficiaries((prev) =>
      prev.map((b) =>
        b.id === beneficiaryId
          ? {
              ...b,
              foodStatus: priority === 'Emergency' ? 'emergency' : 'critical',
              coords: coords || b.coords,
            }
          : b
      )
    );

    addActivity(
      'request',
      `${beneficiary.name} requested food (${foodRequired})`,
      priority === 'Emergency' ? 'danger' : 'warning'
    );

    addToast(
      'Request Created Successfully',
      `Assistance request for ${beneficiary.name} submitted to Kumbakonam Care Team.`,
      'success'
    );
  };

  // Meal Status toggle
  const markMealCompleted = (
    beneficiaryId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner'
  ) => {
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
    if (!beneficiary) return;

    setBeneficiaries((prev) =>
      prev.map((b) =>
        b.id === beneficiaryId
          ? {
              ...b,
              mealStatus: {
                ...b.mealStatus,
                [mealType]: 'completed',
              },
            }
          : b
      )
    );

    addActivity(
      'food',
      `${beneficiary.name} marked ${mealType} meal completed`,
      'success'
    );

    addToast(
      'Meal Completed Recorded',
      `Thank you, ${beneficiary.name}. ${mealType.toUpperCase()} marked completed!`,
      'success'
    );
  };

  // Location sharing
  const shareLocation = (beneficiaryId: string, coords: GeoLocation) => {
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
    if (!beneficiary) return;

    setBeneficiaries((prev) =>
      prev.map((b) =>
        b.id === beneficiaryId
          ? {
              ...b,
              coords,
              locationSharingActive: true,
              locationLastUpdated: 'Just now',
            }
          : b
      )
    );

    addActivity(
      'location',
      `${beneficiary.name} shared live GPS location from ${beneficiary.area}`,
      'info'
    );

    addToast(
      'Location Sharing Active',
      `GPS Coordinates (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}) securely shared with CareNest team.`,
      'info'
    );
  };

  const stopSharingLocation = (beneficiaryId: string) => {
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
    if (!beneficiary) return;

    setBeneficiaries((prev) =>
      prev.map((b) =>
        b.id === beneficiaryId
          ? {
              ...b,
              locationSharingActive: false,
              locationLastUpdated: 'Sharing stopped',
            }
          : b
      )
    );

    addToast(
      'Location Sharing Stopped',
      `Location sharing deactivated for ${beneficiary.name}.`,
      'warning'
    );
  };

  // Beneficiary Photo Upload
  const uploadBeneficiaryPhoto = (beneficiaryId: string, photoUrl: string) => {
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === beneficiaryId ? { ...b, profilePhotoUrl: photoUrl } : b))
    );
    addToast('Profile Photo Updated', 'Beneficiary photo updated with consent.', 'success');
  };

  // Food Record Upload
  const uploadFoodRecord = (data: Omit<FoodRecord, 'id' | 'timestamp'>) => {
    const newRecord: FoodRecord = {
      ...data,
      id: `frec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
    };
    setFoodRecords((prev) => [newRecord, ...prev]);

    // Update beneficiary stock quantity & status
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id === data.beneficiaryId) {
          const ratio = data.quantity / data.requiredQuantity;
          let newStatus: FoodStatus = 'sufficient';
          if (ratio <= 0.25) newStatus = 'critical';
          else if (ratio <= 0.5) newStatus = 'low';

          return {
            ...b,
            currentStockKg: data.quantity,
            requiredStockKg: data.requiredQuantity,
            foodStatus: newStatus,
            ambientTemp: data.temp,
            ambientHumidity: data.humidity,
          };
        }
        return b;
      })
    );

    addActivity('food', `Food record uploaded for ${data.beneficiaryName}: ${data.quantity}kg remaining`, 'info');
    addToast('Food Record Saved', 'Food quantity and environment record successfully updated.', 'success');
  };

  // Emergency SOS trigger
  const triggerEmergency = (
    beneficiaryId: string,
    customCoords?: GeoLocation,
    notes = 'Immediate assistance needed'
  ) => {
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
    if (!beneficiary) return;

    const alertId = `emg-${Date.now()}`;
    const newAlert: EmergencyAlert = {
      id: alertId,
      beneficiaryId: beneficiary.id,
      beneficiaryName: beneficiary.name,
      age: beneficiary.age,
      area: beneficiary.area,
      phone: beneficiary.phone,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active',
      coords: customCoords || beneficiary.coords,
      notes,
    };

    setEmergencies((prev) => [newAlert, ...prev]);

    setBeneficiaries((prev) =>
      prev.map((b) =>
        b.id === beneficiaryId
          ? {
              ...b,
              foodStatus: 'emergency',
              coords: customCoords || b.coords,
              locationSharingActive: true,
              locationLastUpdated: 'Emergency broadcast',
            }
          : b
      )
    );

    addActivity(
      'emergency',
      `Emergency SOS alert received from ${beneficiary.name} (${beneficiary.age} yrs, ${beneficiary.area})`,
      'danger'
    );

    addToast(
      '🚨 EMERGENCY ALERT TRANSMITTED',
      `Care team & nearby volunteers alerted for ${beneficiary.name}. Help is on the way.`,
      'error'
    );
  };

  const resolveEmergency = (emergencyId: string) => {
    const alert = emergencies.find((e) => e.id === emergencyId);
    if (!alert) return;

    setEmergencies((prev) =>
      prev.map((e) => (e.id === emergencyId ? { ...e, status: 'Resolved' } : e))
    );

    // Recheck beneficiary food status
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id === alert.beneficiaryId) {
          const ratio = b.currentStockKg / b.requiredStockKg;
          const normalStatus: FoodStatus =
            ratio <= 0.25 ? 'critical' : ratio <= 0.5 ? 'low' : 'sufficient';
          return { ...b, foodStatus: normalStatus };
        }
        return b;
      })
    );

    addActivity('emergency', `Emergency alert for ${alert.beneficiaryName} resolved`, 'success');
    addToast('Emergency Resolved', `Case for ${alert.beneficiaryName} closed by Care Team.`, 'success');
  };

  // Volunteer assignment to Request
  const assignVolunteerToRequest = (requestId: string, volunteerId: string) => {
    const req = requests.find((r) => r.id === requestId);
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!req || !vol) return;

    const delId = `del-${Date.now()}`;
    const newDelivery: Delivery = {
      id: delId,
      requestId: req.id,
      beneficiaryId: req.beneficiaryId,
      beneficiaryName: req.beneficiaryName,
      beneficiaryPhone:
        beneficiaries.find((b) => b.id === req.beneficiaryId)?.phone || '+91 94432 00000',
      volunteerId: vol.id,
      volunteerName: vol.name,
      volunteerPhone: vol.phone,
      area: req.area,
      foodItems: req.foodRequired,
      startCoords: vol.currentCoords,
      destCoords: req.coords,
      currentVolunteerCoords: vol.currentCoords,
      status: 'Assigned',
      distanceKm: 1.1,
      etaMinutes: 10,
    };

    setDeliveries((prev) => [newDelivery, ...prev]);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Assigned',
              assignedVolunteerId: vol.id,
              assignedVolunteerName: vol.name,
            }
          : r
      )
    );

    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId
          ? { ...v, availability: 'On Delivery', activeDeliveryId: delId }
          : v
      )
    );

    addActivity(
      'delivery',
      `Volunteer ${vol.name} assigned to deliver food to ${req.beneficiaryName}`,
      'info'
    );

    addToast(
      'Volunteer Assigned',
      `${vol.name} assigned for delivery to ${req.beneficiaryName}.`,
      'info'
    );
  };

  // Volunteer assignment to Emergency
  const assignVolunteerToEmergency = (emergencyId: string, volunteerId: string) => {
    const emg = emergencies.find((e) => e.id === emergencyId);
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!emg || !vol) return;

    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === emergencyId
          ? {
              ...e,
              status: 'Volunteer Assigned',
              assignedVolunteerId: vol.id,
              assignedVolunteerName: vol.name,
            }
          : e
      )
    );

    // Create immediate delivery record
    const delId = `del-emg-${Date.now()}`;
    const newDelivery: Delivery = {
      id: delId,
      requestId: `req-${emg.id}`,
      beneficiaryId: emg.beneficiaryId,
      beneficiaryName: emg.beneficiaryName,
      beneficiaryPhone: emg.phone,
      volunteerId: vol.id,
      volunteerName: vol.name,
      volunteerPhone: vol.phone,
      area: emg.area,
      foodItems: 'SOS Emergency Nutrition & First Response Kit',
      startCoords: vol.currentCoords,
      destCoords: emg.coords,
      currentVolunteerCoords: vol.currentCoords,
      status: 'Out for Delivery',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: 0.8,
      etaMinutes: 6,
    };

    setDeliveries((prev) => [newDelivery, ...prev]);

    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId
          ? { ...v, availability: 'On Delivery', activeDeliveryId: delId }
          : v
      )
    );

    addActivity(
      'emergency',
      `${vol.name} dispatched on emergency SOS for ${emg.beneficiaryName}`,
      'danger'
    );

    addToast(
      'Emergency Dispatched',
      `Volunteer ${vol.name} is on the way to ${emg.beneficiaryName}.`,
      'warning'
    );
  };

  // Update Delivery Status (Out for Delivery -> Arrived -> Delivered)
  const updateDeliveryStatus = (
    deliveryId: string,
    newStatus: DeliveryStatus,
    proofPhotoUrl?: string
  ) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          return {
            ...d,
            status: newStatus,
            ...(newStatus === 'Out for Delivery' ? { startedAt: timeStr } : {}),
            ...(newStatus === 'Arrived' ? { arrivedAt: timeStr } : {}),
            ...(newStatus === 'Delivered'
              ? {
                  completedAt: timeStr,
                  deliveryTimestamp: timeStr,
                  proofPhotoUrl: proofPhotoUrl || d.proofPhotoUrl,
                }
              : {}),
          };
        }
        return d;
      })
    );

    // Update associated request
    setRequests((prev) =>
      prev.map((r) => (r.id === del.requestId ? { ...r, status: newStatus } : r))
    );

    // If delivered:
    if (newStatus === 'Delivered') {
      // Free volunteer
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === del.volunteerId
            ? {
                ...v,
                availability: 'Available',
                activeDeliveryId: undefined,
                completedDeliveries: v.completedDeliveries + 1,
              }
            : v
        )
      );

      // Replenish beneficiary stock
      setBeneficiaries((prev) =>
        prev.map((b) => {
          if (b.id === del.beneficiaryId) {
            return {
              ...b,
              currentStockKg: b.requiredStockKg,
              foodStatus: 'sufficient',
              assistanceHistory: [
                {
                  id: `hist-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  type: del.foodItems,
                  status: 'Delivered',
                  notes: `Delivered by Volunteer ${del.volunteerName} with photo proof at ${timeStr}`,
                },
                ...b.assistanceHistory,
              ],
            };
          }
          return b;
        })
      );

      // Check if this resolved an emergency
      setEmergencies((prev) =>
        prev.map((e) =>
          e.beneficiaryId === del.beneficiaryId && e.status !== 'Resolved'
            ? { ...e, status: 'Resolved' }
            : e
        )
      );

      addActivity(
        'delivery',
        `Delivery to ${del.beneficiaryName} completed by ${del.volunteerName} at ${timeStr}`,
        'success'
      );

      addToast(
        'Delivery Complete!',
        `Food delivered to ${del.beneficiaryName} at ${timeStr}. Photo proof recorded.`,
        'success'
      );
    } else {
      addActivity(
        'delivery',
        `Delivery to ${del.beneficiaryName} updated to "${newStatus}"`,
        'info'
      );
      addToast('Status Updated', `Delivery is now "${newStatus}".`, 'info');
    }
  };

  // Market Order creation
  const createMarketOrder = (orderDetails: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryType: 'delivery' | 'pickup';
    paymentMethod: 'UPI / GPay' | 'Cash on Delivery' | 'Card';
  }): MarketOrder => {
    const orderNum = `CN-MKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    const totalAmount = cartTotal;
    const mealsCount = cartCount;

    const newOrder: MarketOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: orderDetails.customerName,
      customerPhone: orderDetails.customerPhone,
      deliveryAddress: orderDetails.deliveryAddress,
      deliveryType: orderDetails.deliveryType,
      paymentMethod: orderDetails.paymentMethod,
      items,
      totalAmount,
      status: 'Confirmed',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      impactNote: `Supports subsidizing ${Math.max(1, Math.round(totalAmount / 40))} senior meals`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct available stock
    setMarketProducts((prev) =>
      prev.map((prod) => {
        const inCart = cart.find((c) => c.product.id === prod.id);
        if (inCart) {
          const newStock = Math.max(0, prod.availableStock - inCart.quantity);
          return { ...prod, availableStock: newStock };
        }
        return prod;
      })
    );

    clearCart();

    addActivity(
      'market',
      `New order ${orderNum} (₹${totalAmount}) placed by ${orderDetails.customerName}`,
      'success'
    );

    addToast(
      'Order Confirmed 🎉',
      `Order #${orderNum} confirmed. Your purchase directly supports Kumbakonam community food care.`,
      'success'
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: MarketOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    addToast('Order Status Updated', `Order status changed to ${status}`, 'info');
  };

  const updateMarketProduct = (productId: string, updates: Partial<MarketProduct>) => {
    setMarketProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    addToast('Product Updated', 'Community market product details saved.', 'success');
  };

  const addMarketProduct = (productData: Omit<MarketProduct, 'id'>) => {
    const newProd: MarketProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setMarketProducts((prev) => [newProd, ...prev]);
    addToast('Product Added', `${newProd.name} added to marketplace.`, 'success');
  };

  // Reset function
  const resetToDefaults = () => {
    localStorage.clear();
    setBeneficiaries(INITIAL_BENEFICIARIES);
    setVolunteers(INITIAL_VOLUNTEERS);
    setRequests(INITIAL_ASSISTANCE_REQUESTS);
    setDeliveries(INITIAL_DELIVERIES);
    setEmergencies(INITIAL_EMERGENCIES);
    setMarketProducts(INITIAL_MARKET_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setFoodRecords(INITIAL_FOOD_RECORDS);
    setCart([]);
    addToast('Database Reset', 'Sample data restored to initial state.', 'info');
  };

  // Dynamic calculations
  const totalBeneficiaries = beneficiaries.length;
  const needAttentionCount = beneficiaries.filter(
    (b) => b.foodStatus === 'critical' || b.foodStatus === 'emergency'
  ).length;
  const activeDeliveriesCount = deliveries.filter(
    (d) => d.status !== 'Delivered' && d.status !== 'Completed'
  ).length;
  const emergencyCount = emergencies.filter((e) => e.status !== 'Resolved').length;

  const totalMarketRevenue =
    8450 + orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);

  const mealsSupportedCount = 126 + Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / 35);

  const sufficientCount = beneficiaries.filter((b) => b.foodStatus === 'sufficient').length;
  const lowCount = beneficiaries.filter((b) => b.foodStatus === 'low').length;
  const criticalCount = beneficiaries.filter((b) => b.foodStatus === 'critical').length;

  // Area statistics
  const areaStats: Record<string, { critical: number; low: number; sufficient: number; total: number }> = {};
  beneficiaries.forEach((b) => {
    if (!areaStats[b.area]) {
      areaStats[b.area] = { critical: 0, low: 0, sufficient: 0, total: 0 };
    }
    areaStats[b.area].total += 1;
    if (b.foodStatus === 'critical' || b.foodStatus === 'emergency') {
      areaStats[b.area].critical += 1;
    } else if (b.foodStatus === 'low') {
      areaStats[b.area].low += 1;
    } else {
      areaStats[b.area].sufficient += 1;
    }
  });

  return (
    <CareNestContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        selectedBeneficiaryId,
        setSelectedBeneficiaryId,
        selectedBeneficiary,
        beneficiaries,
        volunteers,
        requests,
        deliveries,
        emergencies,
        marketProducts,
        orders,
        activityLogs,
        foodRecords,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        selectedAreaFilter,
        setSelectedAreaFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        requestFood,
        markMealCompleted,
        shareLocation,
        stopSharingLocation,
        uploadBeneficiaryPhoto,
        uploadFoodRecord,
        assignVolunteerToRequest,
        assignVolunteerToEmergency,
        updateDeliveryStatus,
        triggerEmergency,
        resolveEmergency,
        createMarketOrder,
        updateOrderStatus,
        updateMarketProduct,
        addMarketProduct,
        toasts,
        addToast,
        removeToast,
        metrics: {
          totalBeneficiaries,
          needAttentionCount,
          activeDeliveriesCount,
          emergencyCount,
          totalMarketRevenue,
          mealsSupportedCount,
          sufficientCount,
          lowCount,
          criticalCount,
          areaStats,
        },
        resetToDefaults,
      }}
    >
      {children}
    </CareNestContext.Provider>
  );
};

export const useCareNest = () => {
  const context = useContext(CareNestContext);
  if (!context) {
    throw new Error('useCareNest must be used within a CareNestProvider');
  }
  return context;
};
