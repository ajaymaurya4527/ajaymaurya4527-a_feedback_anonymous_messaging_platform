"use client";
import React, { useState } from 'react';
import { MessageSquare, Shield, Send, BarChart3, Settings, LogOut, Eye, Trash2 } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"

const AnonymousDashboard = () => {
  const router = useRouter()
  const [messages, setMessages] = useState([
    { id: 1, text: "Your project is amazing! Keep it up.", time: "2m ago", read: false },
    { id: 2, text: "Can we talk about the new update?", time: "15m ago", read: true },
    { id: 3, text: "Anonymous feedback: The UI is super clean.", time: "1h ago", read: true },
  ]);

  return (
    <div className="flex h-screen bg-[#0B0E14] text-slate-200 font-sans mt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151921] border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AnonGhost</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<BarChart3 size={20} />} label="Overview" active />
          <NavItem icon={<MessageSquare size={20} />} label="Inbox" badge="3" />
          <NavItem icon={<Send size={20} />} label="My Links" />
          <NavItem icon={<Settings size={20} />} label="Security" />
        </nav>

        <button
          onClick={() => {
            signOut();
            toast.success("Signed out successfully");
            router.push("/sign-in")
            
            
          }}
          className="mt-8 w-full bg-red-700 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-white hover:bg-gray-800 transition"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-semibold">Welcome back, Ghost</h2>
            <p className="text-slate-500">You have 3 unread secret messages.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20">
            <Send size={18} /> Share My Link
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Messages" value="1,284" change="+12% this week" />
          <StatCard title="Profile Views" value="8,402" change="+5% this week" />
          <StatCard title="Active Links" value="4" change="0 change" />
        </div>

        {/* Live Inbox Feed */}
        <section className="bg-[#151921] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Messages</h3>
            <button className="text-indigo-400 text-sm hover:underline">Mark all as read</button>
          </div>
          <div className="divide-y divide-slate-800">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-6 flex items-start justify-between hover:bg-slate-800/30 transition-colors ${!msg.read ? 'border-l-4 border-indigo-500 bg-indigo-500/5' : ''}`}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 italic font-serif">
                    ?
                  </div>
                  <div>
                    <p className="text-slate-200 leading-relaxed mb-1">{msg.text}</p>
                    <span className="text-xs text-slate-500">{msg.time} • Encryption Active</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><Eye size={18} /></button>
                  <button className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active = false, badge = null }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string | null }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
    <div className="flex items-center gap-3 font-medium">
      {icon}
      <span>{label}</span>
    </div>
    {badge && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">{badge}</span>}
  </div>
);

const StatCard = ({ title, value, change }: { title: string; value: string; change: string }) => (
  <div className="bg-[#151921] p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
    <h4 className="text-2xl font-bold mb-2">{value}</h4>
    <span className="text-xs text-emerald-400 font-medium">{change}</span>
  </div>
);

export default AnonymousDashboard;