"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, LogOut, User, Zap } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const username = session?.user?.username || session?.user?.name || "Ghost";
  const publicProfileUrl = `/u/${username}`;

  const navLinks = [
    
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Your Feed', href: publicProfileUrl },
  ];

  if (session)return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 w-full ${
        scrolled 
          ? 'py-2' 
          : 'py-0'
      }`}
    >
      <div 
        className={`w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-[#151921]/90 backdrop-blur-md border-slate-700/50 shadow-2xl' 
            : 'bg-[#0B0E14] border-transparent'
        }`}
      >
        {/* Content Container - Limits width of text/icons but background remains full width */}
        <div className="max-w-[1400px] mx-auto flex justify-between h-16 items-center px-4 md:px-10">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative p-1.5 bg-[#1b2029] border border-slate-700 rounded-lg">
                  <Shield size={20} className="text-indigo-500" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Anon<span className="text-indigo-500">Ghost</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-slate-800/50 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  )}
                </Link>
              );
            })}
            
            <div className="h-6 w-[1px] bg-slate-800 mx-4" />

            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-slate-300 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  {username}
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link 
                href="/sign-in" 
                className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm transition-all hover:bg-indigo-500 hover:text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel - Also Full Width */}
      {isOpen && (
        <div className="md:hidden w-full border-b border-slate-800 bg-[#0B0E14]/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
          <div className="px-6 py-8 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-4 text-lg font-semibold ${
                  pathname === link.href ? 'text-indigo-500' : 'text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-slate-800">
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 text-red-500 font-bold"
                >
                  <LogOut size={20} /> Logout
                </button>
              ) : (
                <Link
                  href="/sign-in"
                  className="block w-full text-center bg-indigo-600 text-white py-4 rounded-2xl font-bold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;