import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-10 font-sans text-white">
            <header className="px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-md z-20 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold tracking-tight">Terms of Service</h1>
            </header>

            <div className="px-6 py-4 space-y-6 text-gray-300 leading-relaxed">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Acceptance of Terms</h2>
                    <p>By accessing or using our fitness tracking application, you agree to be bound by these Terms of Service.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. Use of Service</h2>
                    <p>You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Health Disclaimer</h2>
                    <p>This app offers health and fitness information and is designed for educational and entertainment purposes only. You should consult your physician or other health care professional before starting this or any other fitness program.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">4. Termination</h2>
                    <p>We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </section>

                <p className="text-xs text-gray-500 mt-8">Last updated: October 2023</p>
            </div>
        </div>
    );
};
