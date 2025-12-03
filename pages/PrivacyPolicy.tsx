import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-10 font-sans text-white">
            <header className="px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold tracking-tight">Privacy Policy</h1>
            </header>

            <div className="px-6 py-4 space-y-6 text-gray-300 leading-relaxed">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our fitness tracking features. This includes your name, email, height, weight, and fitness goals.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, such as generating personalized workout plans and tracking your progress.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Data Security</h2>
                    <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">4. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at support@fitnesshub.com.</p>
                </section>

                <p className="text-xs text-gray-500 mt-8">Last updated: October 2023</p>
            </div>
        </div>
    );
};
