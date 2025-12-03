import React from 'react';
import { X, Instagram, Facebook, Twitter, Download, Link as LinkIcon, Check } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        workouts: number;
        calories: number;
        minutes: number;
    };
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    const [copied, setCopied] = React.useState(false);

    const handleCopyLink = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden relative animate-in zoom-in duration-300 shadow-2xl">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
                >
                    <X size={24} />
                </button>

                {/* Preview Card */}
                <div className="bg-gradient-to-br from-primary/20 to-surface p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,227,118,0.4)]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" className="w-14 h-14 rounded-full" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Crushing It! 🔥</h2>
                        <p className="text-gray-300 text-sm mb-6">Just finished a killer week on FitSpot.</p>

                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <div className="bg-black/20 rounded-xl p-2 backdrop-blur-sm border border-white/5">
                                <p className="text-lg font-bold text-white">{stats.workouts}</p>
                                <p className="text-[10px] text-gray-400 uppercase">Workouts</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-2 backdrop-blur-sm border border-white/5">
                                <p className="text-lg font-bold text-white">{stats.calories}</p>
                                <p className="text-[10px] text-gray-400 uppercase">Kcal</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-2 backdrop-blur-sm border border-white/5">
                                <p className="text-lg font-bold text-white">{stats.minutes}</p>
                                <p className="text-[10px] text-gray-400 uppercase">Mins</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Actions */}
                <div className="p-6 bg-surface">
                    <p className="text-center text-gray-400 text-sm mb-4 font-medium">Share your progress</p>

                    <div className="flex justify-center gap-4 mb-6">
                        <button className="w-12 h-12 rounded-full bg-[#E1306C] text-white flex items-center justify-center hover:scale-110 transition shadow-lg">
                            <Instagram size={24} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-lg">
                            <Facebook size={24} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition shadow-lg">
                            <Twitter size={24} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center hover:scale-110 transition shadow-lg">
                            <Download size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-black/30 p-1 pl-4 rounded-xl border border-white/5">
                        <span className="text-xs text-gray-500 truncate flex-1">fitspot.app/share/alex-w829</span>
                        <button
                            onClick={handleCopyLink}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                            {copied ? <Check size={14} /> : <LinkIcon size={14} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
