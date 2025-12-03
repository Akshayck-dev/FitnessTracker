import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { GeneratedPlan, SavedPlan, Booking, Notification, UserProfile, GroceryItem, DailyMealLog, MealItem, WorkoutSession } from '../types';
import { GROCERY_LIST, TODAY_MEALS } from '../constants';

// Helper to get current user ID
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};

// --- PLANS ---
export const savePlan = async (plan: GeneratedPlan, type: 'workout' | 'diet' | 'comprehensive'): Promise<SavedPlan> => {
  const userId = getUserId();
  const planData = {
    ...plan,
    createdAt: new Date().toISOString(),
    type,
    userId
  };

  const docRef = await addDoc(collection(db, `users/${userId}/plans`), planData);
  return { ...planData, id: docRef.id } as SavedPlan;
};

export const getPlans = async (): Promise<SavedPlan[]> => {
  try {
    const userId = getUserId();
    const q = query(collection(db, `users/${userId}/plans`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedPlan));
  } catch (e) {
    console.error("Error fetching plans:", e);
    return [];
  }
};

export const getPlanById = async (id: string): Promise<SavedPlan | undefined> => {
  try {
    const userId = getUserId();
    const docRef = doc(db, `users/${userId}/plans`, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SavedPlan;
    }
    return undefined;
  } catch (e) {
    console.error("Error fetching plan:", e);
    return undefined;
  }
};

export const deletePlan = async (id: string): Promise<void> => {
  const userId = getUserId();
  await deleteDoc(doc(db, `users/${userId}/plans`, id));
};

// --- BOOKINGS ---
export const saveBooking = async (booking: Omit<Booking, 'id' | 'timestamp' | 'status'>): Promise<Booking> => {
  const userId = getUserId();
  const bookingData = {
    ...booking,
    timestamp: new Date().toISOString(),
    status: 'confirmed',
    userId
  };

  const docRef = await addDoc(collection(db, `users/${userId}/bookings`), bookingData);

  // Auto-generate notification
  await addNotification({
    title: 'Booking Confirmed!',
    message: `You are booked for ${booking.studioName} on ${booking.date} at ${booking.time}.`,
    type: 'booking'
  });

  return { ...bookingData, id: docRef.id } as Booking;
};

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const userId = getUserId();
    const q = query(collection(db, `users/${userId}/bookings`), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (e) {
    console.error("Error fetching bookings:", e);
    return [];
  }
};

export const cancelBooking = async (id: string): Promise<void> => {
  const userId = getUserId();
  const bookingRef = doc(db, `users/${userId}/bookings`, id);
  await updateDoc(bookingRef, { status: 'cancelled' });
};

// --- NOTIFICATIONS ---
export const addNotification = async (notif: Omit<Notification, 'id' | 'date' | 'read'>): Promise<void> => {
  const userId = getUserId();
  await addDoc(collection(db, `users/${userId}/notifications`), {
    ...notif,
    date: new Date().toISOString(),
    read: false,
    userId
  });
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const userId = getUserId();
    const q = query(collection(db, `users/${userId}/notifications`), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (e) {
    console.error("Error fetching notifications:", e);
    return [];
  }
};

export const markNotificationsRead = async (): Promise<void> => {
  const userId = getUserId();
  const q = query(collection(db, `users/${userId}/notifications`), where('read', '==', false));
  const querySnapshot = await getDocs(q);
  const batch = []; // In a real app, use writeBatch
  querySnapshot.forEach(async (docSnap) => {
    await updateDoc(doc(db, `users/${userId}/notifications`, docSnap.id), { read: true });
  });
};

// --- FAVORITES ---
export const toggleFavorite = async (studioId: string): Promise<boolean> => {
  const userId = getUserId();
  const favRef = doc(db, `users/${userId}/favorites`, studioId);
  const docSnap = await getDoc(favRef);

  if (docSnap.exists()) {
    await deleteDoc(favRef);
    return false;
  } else {
    await setDoc(favRef, { studioId, addedAt: new Date().toISOString() });
    return true;
  }
};

export const getFavorites = async (): Promise<string[]> => {
  try {
    const userId = getUserId();
    const querySnapshot = await getDocs(collection(db, `users/${userId}/favorites`));
    return querySnapshot.docs.map(doc => doc.id);
  } catch (e) {
    return [];
  }
};

export const isStudioFavorite = async (studioId: string): Promise<boolean> => {
  const userId = getUserId();
  const docSnap = await getDoc(doc(db, `users/${userId}/favorites`, studioId));
  return docSnap.exists();
};

// --- PROFILE ---
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const userId = getUserId();
  await setDoc(doc(db, `users/${userId}/profile`, 'main'), profile);
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const userId = getUserId();
    const docSnap = await getDoc(doc(db, `users/${userId}/profile`, 'main'));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    // Default to auth data if no profile exists
    const user = auth.currentUser;
    return {
      name: user?.displayName || 'User',
      email: user?.email || '',
      height: '',
      weight: '',
      goal: '',
      isCoach: false,
      coachVerificationStatus: 'none'
    };
  } catch (e) {
    console.error("Error fetching profile:", e);
    const user = auth.currentUser;
    return {
      name: user?.displayName || 'User',
      email: user?.email || '',
      height: '',
      weight: '',
      goal: '',
      isCoach: false,
      coachVerificationStatus: 'none'
    };
  }
};

// --- GROCERY LIST ---
export const getGroceries = async (): Promise<GroceryItem[]> => {
  try {
    const userId = getUserId();
    const q = query(collection(db, `users/${userId}/groceries`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return GROCERY_LIST; // Default for new users
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
  } catch (e) {
    return GROCERY_LIST;
  }
};

export const saveGroceries = async (items: GroceryItem[]): Promise<void> => {
  // This function signature is tricky for Firestore since we usually update individual items.
  // For simplicity in migration, we might iterate. But ideally we update per item.
  // Let's keep the signature but implement it by overwriting or adding.
  // Actually, let's change the usage pattern in the UI to call specific add/update/delete functions.
  // For now, to match the interface, we'll just log a warning or try to sync.
  console.warn("saveGroceries (bulk) is deprecated in Firestore mode. Use add/toggle/delete.");
};

export const toggleGroceryItem = async (id: string, currentStatus: boolean): Promise<void> => {
  const userId = getUserId();
  await updateDoc(doc(db, `users/${userId}/groceries`, id), { checked: !currentStatus });
};

export const addGroceryItem = async (name: string): Promise<GroceryItem> => {
  const userId = getUserId();
  const newItem = {
    name,
    quantity: '1',
    category: 'Misc',
    checked: false,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, `users/${userId}/groceries`), newItem);
  return { ...newItem, id: docRef.id } as GroceryItem;
};

export const deleteGroceryItem = async (id: string): Promise<void> => {
  const userId = getUserId();
  await deleteDoc(doc(db, `users/${userId}/groceries`, id));
};

// --- DAILY LOG (NUTRITION) ---
export const getDailyLog = async (): Promise<DailyMealLog[]> => {
  try {
    const userId = getUserId();
    // In a real app, we'd query by date. For now, just get the 'today' doc or similar.
    // Let's assume we store daily logs as individual documents with a date field.
    // Or one big document for 'today'. Let's do one doc for 'current_log' for simplicity of this demo.
    const docSnap = await getDoc(doc(db, `users/${userId}/daily_logs`, 'current'));
    if (docSnap.exists()) {
      return docSnap.data().logs as DailyMealLog[];
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const saveDailyLog = async (logs: DailyMealLog[]): Promise<void> => {
  const userId = getUserId();
  await setDoc(doc(db, `users/${userId}/daily_logs`, 'current'), { logs });
};

export const addMealToLog = async (category: string, item: MealItem): Promise<DailyMealLog[]> => {
  const logs = await getDailyLog();

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
    logs.push({
      category: category as any,
      totalCalories: item.calories,
      items: [{ ...item, id: Date.now().toString() }]
    });
  }

  await saveDailyLog(logs);
  return logs;
};

// --- WORKOUTS ---
export const saveWorkout = async (workout: WorkoutSession): Promise<void> => {
  const userId = getUserId();
  await addDoc(collection(db, `users/${userId}/workouts`), {
    ...workout,
    timestamp: new Date().toISOString()
  });
};

export const getWorkouts = async (): Promise<WorkoutSession[]> => {
  try {
    const userId = getUserId();
    const q = query(collection(db, `users/${userId}/workouts`), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutSession));
  } catch (e) {
    console.error("Error fetching workouts:", e);
    return [];
  }
};

// --- DASHBOARD STATS ---
export const getDashboardStats = async () => {
  try {
    const workouts = await getWorkouts();
    const dailyLog = await getDailyLog();

    // 1. Workouts This Week & Active Time
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = workouts.filter(w => new Date(w.timestamp) >= startOfWeek);
    const workoutsCount = thisWeekWorkouts.length;
    const activeMinutes = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const hours = Math.floor(activeMinutes / 60);
    const minutes = activeMinutes % 60;
    const activeTimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // 2. Nutrition (Today)
    const totalCalories = dailyLog.reduce((sum, log) => sum + log.totalCalories, 0);
    // Calculate macros (approximate for now as we don't store macros per item in this simple type yet, 
    // but let's assume we can get them if we had them. For now, we'll return 0s or calculate if items have macros)
    // Since MealItem type has macros, we can calculate.
    let totalCarbs = 0, totalProtein = 0, totalFat = 0;
    dailyLog.forEach(log => {
      log.items.forEach(item => {
        totalCarbs += item.carbs;
        totalProtein += item.protein;
        totalFat += item.fat;
      });
    });

    const totalGrams = totalCarbs + totalProtein + totalFat;
    const carbsPct = totalGrams ? Math.round((totalCarbs / totalGrams) * 100) : 0;
    const proteinPct = totalGrams ? Math.round((totalProtein / totalGrams) * 100) : 0;
    const fatPct = totalGrams ? Math.round((totalFat / totalGrams) * 100) : 0;

    // 3. Weekly Consistency (Last 7 Days)
    const consistency = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const hasWorkout = workouts.some(w => {
        const wDate = new Date(w.timestamp);
        return wDate.getDate() === d.getDate() && wDate.getMonth() === d.getMonth();
      });
      consistency.push({ day: dayName, value: hasWorkout ? 100 : 0, active: hasWorkout });
    }

    return {
      workoutsCount,
      activeTimeStr,
      nutrition: {
        calories: totalCalories,
        macros: [
          { label: 'Carbs', value: carbsPct, color: '#f97316' },
          { label: 'Protein', value: proteinPct, color: '#3b82f6' },
          { label: 'Fat', value: fatPct, color: '#10b981' }
        ]
      },
      consistency
    };
  } catch (e) {
    console.error("Error calculating stats:", e);
    return {
      workoutsCount: 0,
      activeTimeStr: '0m',
      nutrition: {
        calories: 0,
        macros: [
          { label: 'Carbs', value: 0, color: '#f97316' },
          { label: 'Protein', value: 0, color: '#3b82f6' },
          { label: 'Fat', value: 0, color: '#10b981' }
        ]
      },
      consistency: []
    };
  }
};

// --- EXERCISE HISTORY ---
export const getExerciseHistory = async (): Promise<Record<string, { date: string, weight: number }[]>> => {
  try {
    const userId = getUserId();
    const querySnapshot = await getDocs(collection(db, `users/${userId}/exercise_history`));
    const history: Record<string, { date: string, weight: number }[]> = {};
    querySnapshot.forEach(doc => {
      history[doc.id] = doc.data().logs;
    });
    return history;
  } catch (e) {
    console.error("Error fetching exercise history:", e);
    return {};
  }
};

export const updateExerciseHistory = async (exercise: string, weight: number, date: string): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, `users/${userId}/exercise_history`, exercise);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const currentLogs = docSnap.data().logs || [];
    await updateDoc(docRef, {
      logs: [...currentLogs, { date, weight }]
    });
  } else {
    await setDoc(docRef, {
      logs: [{ date, weight }]
    });
  }
};

// --- PERSONAL RECORDS ---
export const getPersonalRecords = async (): Promise<{ exercise: string, weight: string, date: string }[]> => {
  try {
    const userId = getUserId();
    const docSnap = await getDoc(doc(db, `users/${userId}/personal_records`, 'main'));
    if (docSnap.exists()) {
      return docSnap.data().records || [];
    }
    return [];
  } catch (e) {
    console.error("Error fetching PRs:", e);
    return [];
  }
};

export const updatePersonalRecord = async (record: { exercise: string, weight: string, date: string }): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, `users/${userId}/personal_records`, 'main');
  const docSnap = await getDoc(docRef);

  let records = [];
  if (docSnap.exists()) {
    records = docSnap.data().records || [];
  }

  // Check if record exists and update, or add new
  const index = records.findIndex((r: any) => r.exercise === record.exercise);
  if (index > -1) {
    records[index] = record;
  } else {
    records.push(record);
  }

  await setDoc(docRef, { records });
};

