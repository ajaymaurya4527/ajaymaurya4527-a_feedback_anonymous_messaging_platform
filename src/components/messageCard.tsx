"use client";

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Trash2, MessageSquare, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Message } from '../model/user.model';
import { ApiResponse } from '../types/apiResponse'; 
// toast को इम्पोर्ट किया
import toast from 'react-hot-toast'; 

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    // Loading toast शुरू करें
    const loadingToast = toast.loading("Deleting message...");

    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      
      // सफलता मिलने पर loading toast को success में बदलें
      toast.success(response.data.message || "Deleted successfully!", {
        id: loadingToast,
      });

      onMessageDelete(message._id.toString());
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message ?? 'Failed to delete message';
      
      // एरर होने पर loading toast को error में बदलें
      toast.error(errorMessage, {
        id: loadingToast,
      });
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Message Card UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} />
                Anonymous
              </span>
              <span className="text-gray-400 text-[10px] sm:text-xs flex items-center gap-1">
                <Clock size={12} />
                {dayjs(message.createdAt).format('MMM D, YYYY')}
              </span>
            </div>

            <button 
              onClick={() => setShowConfirm(true)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="relative min-h-[60px]">
            <MessageSquare className="absolute -left-1 -top-1 text-gray-100 h-8 w-8 -z-0" />
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed relative z-10 pl-2">
              {message.content}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 italic">
            <span>Received {dayjs(message.createdAt).format('h:mm A')}</span>
            <button className="text-indigo-600 text-xs sm:text-sm font-medium hover:underline not-italic">
              Share Response
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowConfirm(false)}
          ></div>
          
          <div className="bg-white rounded-xl shadow-2xl relative z-10 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. Are you sure?
              </p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}