
export interface Studio {
  id: string;
  name: string;
  type: string[];
  rating: number;
  reviewCount: number;
  distance: string; // "0.8 mi"
  address: string;
  isVerified: boolean;
  isOpen: boolean;
  closingTime: string;
  priceLevel: 1 | 2 | 3;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  website: string;
  // New Detailed Fields
  membershipPlans?: MembershipPlan[];
  classes?: ClassSession[];
  reviews?: Review[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  period: string; // "per month", "per session"
  features: string[];
  isPopular?: boolean;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: string;
  spotsLeft: number;
  intensity: 'Low' | 'Medium' | 'High';
}

export interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  text: string;
  helpfulCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  planData?: GeneratedPlan; // Optional structured data for plans
}

export interface DailyStats {
  day: string;
  value: number;
  active: boolean;
}

export interface MacroStats {
  label: string;
  value: number; // percentage
  color: string;
}

export interface WorkoutSession {
  id: string;
  type: string;
  duration: string;
  calories: number;
  date: string; // "Today", "Yesterday"
  time: string;
  icon: 'run' | 'lift' | 'swim' | 'yoga';
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  image?: string;
}

export interface DailyMealLog {
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  totalCalories: number;
  items: MealItem[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

export interface PlanPreferences {
  goal: string;
  level: string;
  equipment: string;
  dietaryRestrictions: string;
  daysPerWeek: number;
  // New Bio-metric fields for conversational AI
  age?: string;
  height?: string;
  currentWeight?: string;
  targetWeight?: string;
  medicalConditions?: string;
}

// Structured AI Plan Types
export interface PlanExercise {
  name: string;
  sets: string;
  reps: string;
}

export interface PlanDay {
  day: string;
  focus: string;
  exercises: PlanExercise[];
}

export interface PlanNutrition {
  dailyCalories: string;
  macros: string;
  mealPlan: string[];
}

export interface GeneratedPlan {
  planName: string;
  overview: string;
  schedule: PlanDay[];
  nutrition: PlanNutrition;
  tips: string[];
}

export interface SavedPlan extends GeneratedPlan {
  id: string;
  createdAt: string;
  type: 'workout' | 'diet' | 'comprehensive';
}

export interface Booking {
  id: string;
  studioId?: string;
  studioName: string;
  image?: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'promo';
  date: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  height: string;
  weight: string;
  goal: string;
  isCoach?: boolean;
  coachVerificationStatus?: 'pending' | 'verified' | 'rejected' | 'none';
}

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
}

export interface FoodSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
}
