"use client"
import { ApiResponse } from "@/src/types/apiResponse";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Sparkles } from "lucide-react";
import { messageSchema } from "@/src/schemas/messageSchema";


function SendMessage() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const params = useParams<{ username: string }>();
  const username = params?.username;

  const fetchSuggestions = async () => {
    setIsSuggesting(true);

    try {
      const response = await axios.post("/api/suggest-messages"); 
      if (response.data.success) {
        const questionsString = response.data.questions;
        const questionsArray = questionsString
          .split("||")
          .map((q: string) => q.trim())
          .filter((q: string) => q.length > 0);
          
        setSuggestions(questionsArray);
        toast.success("Suggestions updated!");
      }
    } catch (error) {
      console.error(error);
      toast.error("AI service is currently busy.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setContent(suggestion);
  };

  const send = async () => {
    const result = messageSchema.safeParse({ content });
    
    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-messages", { 
        username, 
        content 
      });
      
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
    // AWESOME BACKGROUND WRAPPER
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>

      <div className="container relative z-10 mx-auto p-6 bg-white/90 backdrop-blur-xl rounded-2xl max-w-2xl shadow-2xl border border-white/20">
        <Toaster position="top-center" />
        
        <h1 className="text-4xl font-extrabold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Anonymous Vault
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">Send a secret message to <span className="text-purple-600">@{username}</span></p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Your Message
            </label>
            <textarea
              className="w-full p-4 border border-gray-100 bg-white/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-700 shadow-sm"
              rows={4}
              placeholder="What's on your mind?..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={fetchSuggestions}
              disabled={isSuggesting}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm transition-all disabled:opacity-50 group"
            >
              {isSuggesting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles className="group-hover:rotate-12 transition-transform" size={18} />}
              Ask AI for Ideas
            </button>

            {suggestions.length > 0 && (
              <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {suggestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(q)}
                    className="text-left text-sm p-4 bg-white border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm transition-all text-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={send}
            disabled={isLoading || !content.trim()}
            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide shadow-lg transition-all transform ${
              isLoading || !content.trim() 
              ? "bg-gray-300 cursor-not-allowed opacity-70" 
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-purple-300/50 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Sending...</span>
              </div>
            ) : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendMessage;