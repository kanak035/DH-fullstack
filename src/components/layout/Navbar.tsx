'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Trophy, Heart, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Explore Charities", href: "/charities", icon: <Heart className="w-4 h-4" /> },
    { name: "Draw Mechanics", href: "/how-it-works", icon: <Trophy className="w-4 h-4" /> },
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white uppercase italic">
              Play <span className="text-primary-500 font-normal">For</span> Cause
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-2">
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            <Link href="/subscribe" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20">
              Subscribe Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="flex items-center space-x-4 text-lg font-medium text-slate-300 hover:text-white">
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              <Link href="/subscribe" onClick={() => setIsOpen(false)} className="block w-full text-center bg-primary-600 text-white font-semibold py-4 rounded-2xl">
                Subscribe Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
