"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  MessageSquare, Shield, Send, BarChart3, Settings,
  LogOut, RefreshCcw, Loader2, Copy, Check
} from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';

// Internal Components
import { MessageCard } from '@/src/components/messageCard';
import { Message } from '@/src/model/user.model';
import { ApiResponse } from '@/src/types/apiResponse';

const AnonymousDashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State Management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [acceptMessages, setAcceptMessages] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- LOGIC SECTION ---

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id.toString() !== messageId));
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setAcceptMessages(response.data.isAcceptingMessage || true);
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setIsSwitchLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) toast.success("Inbox updated");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // 2. ONLY run if status is explicitly 'authenticated'
    if (status === 'authenticated' && session?.user) {
      fetchMessages();
      fetchAcceptMessages();
    }
  }, [session, status, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const nextState = !acceptMessages;
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: nextState,
      });
      setAcceptMessages(nextState);
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Status update failed");
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // URL Helpers
  const username = session?.user?.username || "Ghost";
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/u/${username}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setIsCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };
  const Home=`${window.location.protocol}//${window.location.host}`

  if (!session || !session.user) return <div className="h-screen bg-[#0B0E14]" />;

  return (
    <div className="flex h-screen bg-[#0B0E14] text-slate-200 font-sans mt-16">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-64 bg-[#151921] border-r border-slate-800 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AnonGhost</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<BarChart3 size={20} />} label="Overview" active />
          <NavItem icon={<MessageSquare size={20} />} label="Inbox" badge={messages.length.toString()} />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <button
          onClick={() => {
            signOut({ callbackUrl: '/sign-in' });
            toast.success("Logged out");
          }}
          className="mt-8 w-full flex bg-red-800 items-center justify-center gap-2 rounded-xl py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all border border-slate-700/50"
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 lg:mt-0">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 w-full">
          {/* 1. Welcome Text */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-semibold">Welcome, {username}</h2>
            <p className="text-slate-500">You have {messages.length} messages in your vault.</p>
          </div>

          {/* 2. Custom Toggle Switch */}
          <div className="flex items-center gap-3 bg-[#151921] border border-slate-800 px-4 py-2 rounded-xl">
            <span className="text-xs font-medium text-slate-400">Accepting</span>
            <button
              onClick={handleSwitchChange}
              disabled={isSwitchLoading}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${acceptMessages ? 'bg-indigo-500' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${acceptMessages ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* 3. Link Display and Share Button */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Link Text Display */}
            <div className="flex items-center bg-[#0B0E14] border border-slate-800 px-4 py-2 rounded-xl w-full md:w-64">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="bg-transparent text-xs text-slate-400 outline-none w-full truncate"
                placeholder="Your link will appear here..."
              />
            </div>

            {/* Share Button */}
            <button
              onClick={copyToClipboard}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
            >
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
              {isCopied ? "Copied" : "Share Link"}
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Messages" value={messages.length.toString()} change="Real-time" />
          <StatCard title="Status" value={acceptMessages ? "Active" : "Paused"} color={acceptMessages ? "text-emerald-400" : "text-amber-400"} />
          <div className="bg-[#151921] p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
            <button
              onClick={() => fetchMessages(true)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-all"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
              Refresh Inbox
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Recent Messages</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageCard
                  key={message._id as unknown as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#151921] rounded-3xl border border-dashed border-slate-800">
                <MessageSquare className="mx-auto text-slate-700 mb-4" size={48} />
                <p className="text-slate-500">No secret messages yet. Share your link!</p>
              </div>
            )}
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
    {badge && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">{badge}</span>}
  </div>
);

const StatCard = ({ title, value, change, color = "text-emerald-400" }: { title: string; value: string; change?: string; color?: string }) => (
  <div className="bg-[#151921] p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
    <h4 className="text-2xl font-bold mb-2">{value}</h4>
    {change && <span className={`text-xs font-medium ${color}`}>{change}</span>}
  </div>
);

export default AnonymousDashboard;