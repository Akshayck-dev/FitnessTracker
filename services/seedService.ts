import { collection, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import {
    WEEKLY_STATS,
    MACROS,
    RECENT_WORKOUTS,
    GROCERY_LIST,
    PLANNED_MEALS,
    EXERCISE_HISTORY,
    PERSONAL_RECORDS
} from '../constants';

export const seedUserData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to seed data");

    const batch = writeBatch(db);
    const userId = user.uid;

    // 1. Seed Workouts
    RECENT_WORKOUTS.forEach(workout => {
        const ref = doc(collection(db, `users/${userId}/workouts`));
        batch.set(ref, { ...workout, timestamp: new Date().toISOString() });
    });

    // 2. Seed Groceries
    GROCERY_LIST.forEach(item => {
        const ref = doc(collection(db, `users/${userId}/groceries`));
        batch.set(ref, { ...item, createdAt: new Date().toISOString() });
    });

    // 3. Seed Daily Log (Nutrition)
    const dailyLogRef = doc(db, `users/${userId}/daily_logs`, 'current');
    batch.set(dailyLogRef, { logs: PLANNED_MEALS });

    // 4. Seed Exercise History
    Object.entries(EXERCISE_HISTORY).forEach(([exercise, logs]) => {
        const ref = doc(db, `users/${userId}/exercise_history`, exercise);
        batch.set(ref, { logs });
    });

    // 5. Seed Personal Records
    const prRef = doc(db, `users/${userId}/personal_records`, 'main');
    batch.set(prRef, { records: PERSONAL_RECORDS });

    // 6. Seed Profile (if not exists, but let's just set a default)
    const profileRef = doc(db, `users/${userId}/profile`, 'main');
    batch.set(profileRef, {
        name: user.displayName || 'Fitness User',
        email: user.email,
        goal: 'Get Fit',
        joinedAt: new Date().toISOString()
    }, { merge: true });

    await batch.commit();
    console.log("Database seeded successfully!");
};
