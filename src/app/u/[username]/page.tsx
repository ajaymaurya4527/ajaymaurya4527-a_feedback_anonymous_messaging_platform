"use client";

import { ApiResponse } from "@/src/types/apiResponse";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Sparkles, ImageIcon, Video, Library, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

function SendMessage() {
  const { data: session } = useSession();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [collections, setCollections] = useState<{ url: string, type: 'image' | 'video', publicId: string }[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const params = useParams<{ username: string }>();
  const username = params?.username;

  // AUTH LOGIC: This checks if the person viewing the page is the actual owner
  const isOwner = session?.user?.username === username;

  const fetchUserCollection = useCallback(async () => {
    setIsDataLoading(true);
    
    try {
      const response = await axios.get(`/api/get-user-profile?username=${username}`);
      if (response.data.success) {
        setCollections(response.data.user.collections || []);
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) fetchUserCollection();
  }, [username, fetchUserCollection]);

  // UPDATED: Logic to ensure only logged-in owner can delete
  const handleDeleteCollection = async (publicId: string, type: 'image' | 'video') => {
    // 1. Client-side security check
    if (!isOwner) {
      toast.error("Unauthorized: Only the owner can delete items.");
      return;
    }

    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await axios.delete(`/api/delete-collection?publicId=${publicId}&type=${type}`);

      if (response.data.success) {
        toast.success(response.data.message);
        setCollections((prev) => prev.filter((item) => item.publicId !== publicId));
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to delete item");
    }
  };

  const fetchSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const response = await axios.post("/api/suggest-messages");
      if (response.data.success) {
        const questionsArray = response.data.questions.split("||").map((q: string) => q.trim()).filter((q: string) => q.length > 0);
        setSuggestions(questionsArray);
        toast.success("Suggestions updated!");
      }
    } catch (error) {
      toast.error("AI service is currently busy.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => setContent(suggestion);

  const send = async () => {
    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-messages", { username, content });
      toast.success(response.data.message || "Message sent!");
      setContent("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-12 overflow-y-auto bg-slate-950 mt-16">
      <Toaster position="top-right" />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUMN 1: MESSAGE BOX */}
        <div className="h-fit lg:sticky lg:top-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-4xl font-extrabold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Anonymous Vault
            </h1>
            <p className="text-center text-gray-500 mb-8 font-medium">Send a secret message to <span className="text-purple-600">@{username}</span></p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Your Message</label>
                <textarea
                  className="w-full p-4 border border-gray-100 bg-white/50 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-700 shadow-sm"
                  rows={4}
                  placeholder="What's on your mind?..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <button onClick={fetchSuggestions} disabled={isSuggesting} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm transition-all group">
                  {isSuggesting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Ask AI for Ideas
                </button>
                {suggestions.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {suggestions.map((q, index) => (
                      <button key={index} onClick={() => handleSuggestionClick(q)} className="text-left text-sm p-4 bg-white border border-gray-100 rounded-xl hover:bg-purple-50 transition-all text-gray-700">
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={send} disabled={isLoading || !content.trim()} className="w-full py-4 rounded-2xl text-white font-bold tracking-wide shadow-lg transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Send Message"}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: MEDIA COLLECTION */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Library size={22} className="text-purple-400" />
            Collection Showcase
          </h2>

          {isDataLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-purple-400" size={30} />
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map((item, index) => (
                <div key={index} className="group relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all">
                  
                  {/* Position Number Badge */}
                  <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-md shadow-lg border border-purple-400/50">
                    #{index + 1}
                  </div>

                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={item.url} alt={`Collection item ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}

                  <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white">
                    {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                  </div>

                  {/* LOGIC: Delete button ONLY renders if session user is the profile owner */}
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteCollection(item.publicId, item.type)}
                      className="absolute bottom-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-slate-400 text-sm">No media in this vault yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendMessage;