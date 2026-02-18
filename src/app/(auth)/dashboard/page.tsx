"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  MessageSquare, Shield, Send, BarChart3, Settings,
  LogOut, RefreshCcw, Loader2, Copy, Check, Library,
  Plus, ImageIcon, Video, Trash2, ExternalLink
} from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from 'axios';

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

  // New State for Collections
  const [collections, setCollections] = useState<{ url: string, type: 'image' | 'video', id: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'collection'>('overview');

  // --- EXISTING LOGIC ---
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

  // --- UPDATED NEW COLLECTION LOGIC ---
  const fetchCollection = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>('/api/get-collection'); 
      setCollections((response.data as any).collections || []);
    } catch (error) {
      console.log("Error fetching collection");
    }
  }, []);

  const handleCollectionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload-collection', formData);
      if (response.data.success) {
        toast.success("Media added!");
        // Update state with the specific item returned from the server
        setCollections(prev => [response.data.item, ...prev]);
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const handleDeleteCollection = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await axios.delete(`/api/delete-collection?publicId=${publicId}`);
      if (response.data.success) {
        toast.success("Item deleted from vault");
        // Update state only after successful database deletion
        setCollections((prev) => prev.filter((item) => item.id !== publicId));
      }
    } catch (error) {
      toast.error("Failed to delete item from database");
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchMessages();
      fetchAcceptMessages();
      fetchCollection();
    }
  }, [session, status, fetchMessages, fetchAcceptMessages, fetchCollection]);

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

  const MessagesGrid = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Recent Messages</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageCard
              key={msg._id as unknown as string}
              message={msg}
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
  );

  if (!session || !session.user) return <div className="h-screen bg-[#0B0E14]" />;

  return (
    <div className="flex h-screen bg-[#0B0E14] text-slate-200 font-sans mt-16">
      <Toaster position="top-right" />

      {/* Sidebar - Remains the same */}
      <aside className="w-64 bg-[#151921] border-r border-slate-800 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AnonGhost</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<BarChart3 size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<MessageSquare size={20} />} label="Inbox" badge={messages.length.toString()} active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
          <NavItem icon={<Library size={20} />} label="Collection" active={activeTab === 'collection'} onClick={() => setActiveTab('collection')} />
        </nav>

        <button onClick={() => signOut({ callbackUrl: '/sign-in' })} className="mt-8 w-full flex bg-red-800/10 items-center justify-center gap-2 rounded-xl py-3 text-red-400 hover:bg-red-500/20 transition-all border border-red-900/50">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 lg:mt-0">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500 space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 w-full bg-[#151921]/50 p-6 rounded-3xl border border-slate-800/50">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-semibold">Welcome, {username}</h2>
                <p className="text-slate-500">Quick snapshot of your account activity.</p>
              </div>

              <div className="flex items-center gap-4 bg-[#0B0E14] px-4 py-2 rounded-2xl border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Status</span>
                  <span className={`text-xs font-medium ${acceptMessages ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {acceptMessages ? 'Accepting' : 'Paused'}
                  </span>
                </div>
                <button
                  onClick={handleSwitchChange}
                  disabled={isSwitchLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${acceptMessages ? 'bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-700'}`}
                >
                  {isSwitchLoading ? <Loader2 size={14} className="animate-spin mx-auto text-white" /> : <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${acceptMessages ? 'translate-x-6' : 'translate-x-1'}`} />}
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={copyToClipboard} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95">
                  {isCopied ? <Check size={18} /> : <Copy size={18} />} Share Profile
                </button>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Messages" value={messages.length.toString()} change="Real-time" />
              <StatCard title="Status" value={acceptMessages ? "Active" : "Paused"} color={acceptMessages ? "text-emerald-400" : "text-amber-400"} />
              <div className="bg-[#151921] p-6 rounded-2xl border border-slate-800 flex items-center justify-center">
                <button onClick={() => setActiveTab('inbox')} className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">Go to Inbox →</button>
              </div>
            </div>
            <MessagesGrid />
          </div>
        )}

        {/* INBOX TAB - Remains the same */}
        {activeTab === 'inbox' && (
          <div className="animate-in slide-in-from-bottom-2 duration-500 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-semibold">Your Inbox</h2>
                <p className="text-slate-500">Manage and read your anonymous messages.</p>
              </div>
              <button onClick={() => fetchMessages(true)} disabled={isLoading} className="flex items-center gap-2 bg-[#151921] border border-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />} Refresh Inbox
              </button>
            </header>
            <MessagesGrid />
          </div>
        )}

        {/* UPDATED COLLECTION TAB UI */}
        {activeTab === 'collection' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-semibold">Media Collection</h2>
                <p className="text-slate-500">Showcase your images and videos on your profile.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl font-medium transition-all">
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Media
                </button>
                <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={handleCollectionUpload} />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.length === 0 && !isUploading && (
                <div className="col-span-full py-32 text-center bg-[#151921] rounded-3xl border border-dashed border-slate-800">
                  <Library className="mx-auto text-slate-700 mb-4" size={48} />
                  <p className="text-slate-500">Your collection is empty. Upload your first photo or video!</p>
                </div>
              )}

              {collections.map((item) => (
                <div key={item.id} className="group relative bg-[#151921] rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all shadow-lg">
                  {/* Actual Media Preview */}
                  <div className="aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" controls={false} />
                    ) : (
                      <img src={item.url} alt="Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white">
                      {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate capitalize">{item.type} Item</p>
                      <p className="text-[10px] text-slate-500">Stored in vault</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteCollection(item.id)} 
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete from database"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// NavItem and StatCard components remain the same
const NavItem = ({ icon, label, active = false, badge = null, onClick }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string | null; onClick: () => void }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
    <div className="flex items-center gap-3 font-medium">
      {icon}
      <span>{label}</span>
    </div>
    {badge && badge !== "0" && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">{badge}</span>}
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