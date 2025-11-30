
import { GeneratedPlan, SavedPlan, Booking, Notification, UserProfile, GroceryItem, DailyMealLog, MealItem } from '../types';
import { GROCERY_LIST, TODAY_MEALS } from '../constants';

const PLANS_KEY = 'fitspot_saved_plans';
const BOOKINGS_KEY = 'fitspot_bookings';
const NOTIFICATIONS_KEY = 'fitspot_notifications';
const FAVORITES_KEY = 'fitspot_favorites';
const PROFILE_KEY = 'fitspot_profile';
const GROCERY_KEY = 'fitspot_groceries';
const DAILY_LOG_KEY = 'fitspot_daily_log';

// --- PLANS ---
export const savePlan = (plan: GeneratedPlan, type: 'workout' | 'diet' | 'comprehensive'): SavedPlan => {
  const plans = getPlans();
  const newPlan: SavedPlan = {
    ...plan,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    type
  };
  // Add to the beginning of the array
  plans.unshift(newPlan);
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  return newPlan;
};

export const getPlans = (): SavedPlan[] => {
  const stored = localStorage.getItem(PLANS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getPlanById = (id: string): SavedPlan | undefined => {
  const plans = getPlans();
  return plans.find(p => p.id === id);
};

export const deletePlan = (id: string): void => {
  const plans = getPlans();
  const filtered = plans.filter(p => p.id !== id);
  localStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
};

// --- BOOKINGS ---
export const saveBooking = (booking: Omit<Booking, 'id' | 'timestamp' | 'status'>): Booking => {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    status: 'confirmed'
  };
  bookings.unshift(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  
  // Auto-generate notification
  addNotification({
    title: 'Booking Confirmed!',
    message: `You are booked for ${booking.studioName} on ${booking.date} at ${booking.time}.`,
    type: 'booking'
  });

  return newBooking;
};

export const getBookings = (): Booking[] => {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const cancelBooking = (id: string): void => {
  const bookings = getBookings();
  const updated = bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
};

// --- NOTIFICATIONS ---
export const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>): void => {
  const list = getNotifications();
  const newNotif: Notification = {
    ...notif,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    read: false
  };
  list.unshift(newNotif);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
};

export const getNotifications = (): Notification[] => {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const markNotificationsRead = (): void => {
  const list = getNotifications();
  const updated = list.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

// --- FAVORITES ---
export const toggleFavorite = (studioId: string): boolean => {
  const favs = getFavorites();
  let newFavs;
  let isFav = false;
  if (favs.includes(studioId)) {
    newFavs = favs.filter(id => id !== studioId);
  } else {
    newFavs = [...favs, studioId];
    isFav = true;
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
  return isFav;
};

export const getFavorites = (): string[] => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const isStudioFavorite = (studioId: string): boolean => {
  return getFavorites().includes(studioId);
};

// --- PROFILE ---
export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : {
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    height: '180 cm',
    weight: '75 kg',
    goal: 'Build Muscle'
  };
};

// --- GROCERY LIST ---
export const getGroceries = (): GroceryItem[] => {
  const stored = localStorage.getItem(GROCERY_KEY);
  return stored ? JSON.parse(stored) : GROCERY_LIST;
};

export const saveGroceries = (items: GroceryItem[]): void => {
  localStorage.setItem(GROCERY_KEY, JSON.stringify(items));
};

export const toggleGroceryItem = (id: string): GroceryItem[] => {
  const items = getGroceries();
  const updated = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
  saveGroceries(updated);
  return updated;
};

export const addGroceryItem = (name: string): GroceryItem[] => {
  const items = getGroceries();
  const newItem: GroceryItem = {
    id: Date.now().toString(),
    name,
    quantity: '1',
    category: 'Misc',
    checked: false
  };
  const updated = [newItem, ...items];
  saveGroceries(updated);
  return updated;
};

export const deleteGroceryItem = (id: string): GroceryItem[] => {
  const items = getGroceries();
  const updated = items.filter(i => i.id !== id);
  saveGroceries(updated);
  return updated;
};

// --- DAILY LOG (NUTRITION) ---
export const getDailyLog = (): DailyMealLog[] => {
  const stored = localStorage.getItem(DAILY_LOG_KEY);
  return stored ? JSON.parse(stored) : TODAY_MEALS;
};

export const saveDailyLog = (logs: DailyMealLog[]): void => {
  localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(logs));
};

export const addMealToLog = (category: string, item: MealItem): DailyMealLog[] => {
  let logs = getDailyLog();
  
  // Check if category exists
  const existingCategoryIndex = logs.findIndex(l => l.category === category);
  
  if (existingCategoryIndex > -1) {
    // Add to existing category
    const catLog = logs[existingCategoryIndex];
    const updatedItems = [...catLog.items, { ...item, id: Date.now().toString() }];
    const updatedLog = {
      ...catLog,
      totalCalories: catLog.totalCalories + item.calories,
      items: updatedItems
    };
    logs[existingCategoryIndex] = updatedLog;
  } else {
    // Create new category if logic allows, typically we stick to strict cats, but if not found:
    logs.push({
      category: category as any,
      totalCalories: item.calories,
      items: [{ ...item, id: Date.now().toString() }]
    });
  }
  
  saveDailyLog(logs);
  return logs;
};
