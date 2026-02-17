"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Zap, 
  MessageSquare, 
  Lock, 
  ArrowRight, 
  Github,
  CheckCircle2
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 selection:bg-indigo-500/30">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Shield size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AnonGhost
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
          <Link href="/sign-in" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-fade-in">
          <Zap size={14} />
          <span>Version 2.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
          Identity stays <span className="text-indigo-500">hidden.</span> <br />
          Truth stays <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">honest.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate platform for honest feedback. Create your secret link, 
          share it with the world, and collect anonymous messages in your private vault.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group">
            Get your Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="https://github.com" className="w-full sm:w-auto px-8 py-4 bg-[#151921] hover:bg-[#1c222d] text-slate-300 rounded-2xl font-bold text-lg transition-all border border-slate-800 flex items-center justify-center gap-2">
            <Github size={20} /> View Source
          </a>
        </div>

        {/* Mockup Preview */}
        <div className="mt-20 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-[#151921] border border-slate-800 rounded-2xl p-4 md:p-8 overflow-hidden">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                <div className="ml-4 h-6 w-48 bg-slate-800 rounded-md" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-[#0B0E14] p-6 rounded-xl border border-slate-800 text-left">
                    <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
                    <div className="h-3 w-full bg-slate-900 rounded mb-2" />
                    <div className="h-3 w-2/3 bg-slate-900 rounded" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why use AnonGhost?</h2>
          <p className="text-slate-500">Built for privacy, designed for simplicity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Lock className="text-indigo-400" />}
            title="End-to-End Privacy"
            desc="Messages are stored securely in your private vault. Only you have the key to access them."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-emerald-400" />}
            title="Instant Sharing"
            desc="One-click copy for your unique profile URL. Share it on Instagram, Twitter, or WhatsApp."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="text-amber-400" />}
            title="Real-time Control"
            desc="Toggle your message acceptance on or off instantly from your dashboard."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© 2026 AnonGhost. Built with Next.js & Tailwind.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-[#151921] p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all group">
    <div className="w-12 h-12 bg-[#0B0E14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default HomePage;