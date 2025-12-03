
import { Studio, ClassSession, Review, DailyStats, MacroStats, WorkoutSession, DailyMealLog, MembershipPlan, GroceryItem } from './types';

export const MOCK_MEMBERSHIPS: MembershipPlan[] = [
  { id: 'm1', name: 'Day Pass', price: '$25', period: 'one time', features: ['Gym Access', 'Locker Use'] },
  { id: 'm2', name: 'Monthly Pro', price: '$89', period: 'per month', features: ['Unlimited Access', 'Group Classes', 'Sauna'], isPopular: true },
  { id: 'm3', name: 'Annual Elite', price: '$950', period: 'per year', features: ['All Access', 'Free Guest Pass', 'Personal Training Session'] },
];

export const MOCK_CLASSES: ClassSession[] = [
  { id: 'c1', name: 'Morning HIIT', instructor: 'Sarah J.', time: '07:00 AM', duration: '45 min', spotsLeft: 3, intensity: 'High' },
  { id: 'c2', name: 'Power Yoga', instructor: 'Mike T.', time: '09:00 AM', duration: '60 min', spotsLeft: 8, intensity: 'Medium' },
  { id: 'c3', name: 'CrossFit WOD', instructor: 'Dave R.', time: '05:30 PM', duration: '60 min', spotsLeft: 5, intensity: 'High' },
  { id: 'c4', name: 'Spin Class', instructor: 'Jenny P.', time: '06:00 PM', duration: '45 min', spotsLeft: 0, intensity: 'Medium' },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', userName: 'Alex D.', userImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100', rating: 5, date: '2 days ago', text: 'Amazing facilities and super friendly staff. The equipment is top notch.', helpfulCount: 12 },
  { id: 'r2', userName: 'Jamie L.', userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100', rating: 4, date: '1 week ago', text: 'Great equipment, but can get crowded during peak hours. Love the sauna though!', helpfulCount: 8 },
  { id: 'r3', userName: 'Michael B.', userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100', rating: 5, date: '2 weeks ago', text: 'Best gym in the city hands down. Worth every penny.', helpfulCount: 15 },
];

export const STUDIOS: Studio[] = [
  {
    id: '1',
    name: 'Fitness Pro Gym',
    type: ['Gym', 'Cardio', 'Weights'],
    rating: 4.5,
    reviewCount: 124,
    distance: '0.8 mi',
    address: '123 Market St, San Francisco, CA',
    isVerified: true,
    isOpen: true,
    closingTime: '11:00 PM',
    priceLevel: 2,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop'
    ],
    description: 'A state-of-the-art facility focused on functional training and community. We offer open gym access, personal training, and high-intensity group classes.',
    amenities: ['Showers', 'Lockers', 'WiFi', 'Parking', 'Sauna', 'Juice Bar'],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    phone: '(555) 123-4567',
    website: 'www.ironpulse.com',
    classes: MOCK_CLASSES,
    reviews: MOCK_REVIEWS,
    membershipPlans: MOCK_MEMBERSHIPS
  },
  {
    id: '2',
    name: 'Yoga Flow Studio',
    type: ['Yoga', 'Pilates'],
    rating: 4.8,
    reviewCount: 89,
    distance: '1.2 mi',
    address: '456 Mission St, San Francisco, CA',
    isVerified: true,
    isOpen: true,
    closingTime: '9:00 PM',
    priceLevel: 3,
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1469&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1469&auto=format&fit=crop'
    ],
    description: 'Find your inner peace. Specialized in Vinyasa, Hatha, and Hot Yoga. Our studio provides a serene environment.',
    amenities: ['Mat Rental', 'Showers', 'Tea Lounge', 'Changing Rooms'],
    coordinates: { lat: 37.7849, lng: -122.4294 },
    phone: '(555) 987-6543',
    website: 'www.zenithyoga.com',
    classes: MOCK_CLASSES,
    reviews: MOCK_REVIEWS,
    membershipPlans: MOCK_MEMBERSHIPS
  },
  {
    id: '3',
    name: 'Iron Strong CrossFit',
    type: ['CrossFit', 'HIIT'],
    rating: 4.9,
    reviewCount: 210,
    distance: '2.1 mi',
    address: '789 Howard St, San Francisco, CA',
    isVerified: false,
    isOpen: false,
    closingTime: '8:00 PM',
    priceLevel: 1,
    image: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd512d?q=80&w=1470&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1517963879466-e1b54ebd512d?q=80&w=1470&auto=format&fit=crop'
    ],
    description: 'Old school bodybuilding gym. No frills, just weights. Open 24/7 for the dedicated lifter.',
    amenities: ['Free Weights', 'Cardio', 'Lockers'],
    coordinates: { lat: 37.7649, lng: -122.4094 },
    phone: '(555) 333-2222',
    website: 'www.metroflexmock.com',
    classes: MOCK_CLASSES,
    reviews: MOCK_REVIEWS,
    membershipPlans: MOCK_MEMBERSHIPS
  },
  {
    id: 'apex',
    name: 'Apex Fitness Center',
    type: ['Gym', 'Pool', 'Sauna'],
    rating: 4.7,
    reviewCount: 245,
    distance: '0.5 mi',
    address: '123 Wellness Avenue, Fitville, CA 90210',
    isVerified: true,
    isOpen: true,
    closingTime: '10:00 PM',
    priceLevel: 3,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop'
    ],
    description: 'Premier fitness destination featuring top-tier equipment, an olympic sized pool, and luxury recovery amenities.',
    amenities: ['Yoga', 'CrossFit', 'Sauna', '24/7 Access', 'Personal Training', 'Swimming Pool'],
    coordinates: { lat: 37.7949, lng: -122.4144 },
    phone: '(555) 777-8888',
    website: 'www.apexfitness.com',
    classes: MOCK_CLASSES,
    reviews: MOCK_REVIEWS,
    membershipPlans: MOCK_MEMBERSHIPS
  }
];

export const WEEKLY_STATS: DailyStats[] = [
  { day: 'M', value: 40, active: false },
  { day: 'T', value: 70, active: false },
  { day: 'W', value: 50, active: false },
  { day: 'T', value: 20, active: false },
  { day: 'F', value: 90, active: true },
  { day: 'S', value: 80, active: false },
  { day: 'S', value: 45, active: false },
];

export const MACROS: MacroStats[] = [
  { label: 'Carbs', value: 40, color: '#f97316' },
  { label: 'Protein', value: 30, color: '#3b82f6' },
  { label: 'Fat', value: 30, color: '#10b981' },
];

export const RECENT_WORKOUTS: WorkoutSession[] = [
  { id: 'w1', type: 'Running', duration: '30 min', calories: 320, date: 'Today', time: '08:15 AM', icon: 'run' },
  { id: 'w2', type: 'Weightlifting', duration: '45 min', calories: 250, date: 'Yesterday', time: '06:30 PM', icon: 'lift' },
  { id: 'w3', type: 'Swimming', duration: '1 hr', calories: 410, date: 'Nov 18', time: '10:00 AM', icon: 'swim' },
];

// Expanded Data for Nutrition Page with Protein and Status

export const GROCERY_LIST: GroceryItem[] = [
  { id: 'g1', name: 'Rolled Oats', quantity: '1 kg', category: 'Pantry', checked: false },
  { id: 'g2', name: 'Almond Milk', quantity: '1 L', category: 'Dairy', checked: true },
  { id: 'g3', name: 'Frozen Berries', quantity: '500g', category: 'Produce', checked: false },
  { id: 'g4', name: 'Chicken Breast', quantity: '1 kg', category: 'Meat', checked: false },
  { id: 'g5', name: 'Brown Rice', quantity: '1 bag', category: 'Pantry', checked: false },
  { id: 'g6', name: 'Broccoli', quantity: '2 heads', category: 'Produce', checked: false },
  { id: 'g7', name: 'Salmon Fillets', quantity: '4 pcs', category: 'Meat', checked: false },
  { id: 'g8', name: 'Sweet Potatoes', quantity: '1 kg', category: 'Produce', checked: false },
  { id: 'g9', name: 'Greek Yogurt', quantity: '1 tub', category: 'Dairy', checked: true },
  { id: 'g10', name: 'Avocados', quantity: '3 pcs', category: 'Produce', checked: false }
];

export const PLANNED_MEALS: DailyMealLog[] = [
  {
    category: 'Breakfast',
    totalCalories: 450,
    items: [{ id: 'p1', name: 'Oatmeal, Protein Powder, Berries', calories: 450, protein: 30 }]
  },
  {
    category: 'Lunch',
    totalCalories: 600,
    items: [{ id: 'p2', name: 'Grilled Chicken, Brown Rice, Broccoli', calories: 600, protein: 50 }]
  },
  {
    category: 'Snacks',
    totalCalories: 250,
    items: [{ id: 'p3', name: 'Greek Yogurt & Almonds', calories: 250, protein: 20 }]
  },
  {
    category: 'Dinner',
    totalCalories: 550,
    items: [{ id: 'p4', name: 'Baked Salmon, Sweet Potato, Asparagus', calories: 550, protein: 45 }]
  }
];

export const TODAY_MEALS: DailyMealLog[] = [
  {
    category: 'Breakfast',
    totalCalories: 355,
    items: [
      { id: 'm1', name: 'Oatmeal with Berries', calories: 350, protein: 12 },
      { id: 'm2', name: 'Black Coffee', calories: 5, notes: 'No sugar', protein: 0 },
    ]
  },
  {
    category: 'Lunch',
    totalCalories: 550,
    items: [
      { id: 'm3', name: 'Grilled Chicken Salad', calories: 550, notes: 'Extra dressing', protein: 45 },
    ]
  }
];

export const EXERCISE_HISTORY = {
  'Bench Press': [
    { date: 'Oct 1', weight: 135 },
    { date: 'Oct 15', weight: 145 },
    { date: 'Nov 1', weight: 155 },
    { date: 'Nov 15', weight: 160 },
    { date: 'Dec 1', weight: 175 },
    { date: 'Dec 15', weight: 185 },
  ],
  'Squat': [
    { date: 'Oct 1', weight: 185 },
    { date: 'Oct 15', weight: 205 },
    { date: 'Nov 1', weight: 225 },
    { date: 'Nov 15', weight: 235 },
    { date: 'Dec 1', weight: 255 },
    { date: 'Dec 15', weight: 275 },
  ],
  'Deadlift': [
    { date: 'Oct 1', weight: 225 },
    { date: 'Oct 15', weight: 245 },
    { date: 'Nov 1', weight: 275 },
    { date: 'Nov 15', weight: 295 },
    { date: 'Dec 1', weight: 315 },
    { date: 'Dec 15', weight: 335 },
  ]
};

export const PERSONAL_RECORDS = [
  { exercise: 'Bench Press', weight: '185 lbs', date: 'Dec 15' },
  { exercise: 'Squat', weight: '275 lbs', date: 'Dec 15' },
  { exercise: 'Deadlift', weight: '335 lbs', date: 'Dec 15' },
  { exercise: 'Overhead Press', weight: '135 lbs', date: 'Nov 20' },
];

export const FOOD_DATABASE = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=150' },
  { name: 'White Rice (1 cup cooked)', calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150' },
  { name: 'Brown Rice (1 cup cooked)', calories: 216, protein: 5, carbs: 45, fat: 1.8, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150' },
  { name: 'Egg (Large)', calories: 78, protein: 6, carbs: 0.6, fat: 5, image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=150' },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=150' },
  { name: 'Banana (Medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, image: 'https://images.unsplash.com/photo-1571771896612-61013630f9f2?w=150' },
  { name: 'Apple (Medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150' },
  { name: 'Oatmeal (1 cup cooked)', calories: 158, protein: 6, carbs: 27, fat: 3, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=150' },
  { name: 'Greek Yogurt (1 cup)', calories: 100, protein: 17, carbs: 6, fat: 0.7, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=150' },
  { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14, image: 'https://images.unsplash.com/photo-1623227866882-c005c207758f?w=150' },
  { name: 'Broccoli (1 cup)', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=150' },
  { name: 'Sweet Potato (Medium)', calories: 103, protein: 2, carbs: 24, fat: 0.2, image: 'https://images.unsplash.com/photo-1596097635121-14b63b8a66cf?w=150' },
  { name: 'Avocado (Medium)', calories: 240, protein: 3, carbs: 12, fat: 22, image: 'https://images.unsplash.com/photo-1523049673856-640669e3323c?w=150' },
  { name: 'Protein Shake (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1, image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=150' },
  { name: 'Whole Wheat Bread (1 slice)', calories: 81, protein: 4, carbs: 14, fat: 1, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150' },
  { name: 'Peanut Butter (1 tbsp)', calories: 94, protein: 4, carbs: 3, fat: 8, image: 'https://images.unsplash.com/photo-1517662613602-4b8e02886677?w=150' },
  { name: 'Milk (1 cup)', calories: 103, protein: 8, carbs: 12, fat: 2.4, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150' },
  { name: 'Pasta (1 cup cooked)', calories: 220, protein: 8, carbs: 43, fat: 1.3, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=150' },
  { name: 'Tuna (1 can)', calories: 191, protein: 42, carbs: 0, fat: 1.4, image: 'https://images.unsplash.com/photo-1543353071-087f9a7ce435?w=150' },
  { name: 'Cottage Cheese (1 cup)', calories: 222, protein: 25, carbs: 8, fat: 10, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150' }
];
