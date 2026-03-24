'use client';

import { motion } from "framer-motion";
import { 
  Trophy, 
  Heart, 
  Calendar, 
  Target, 
  ArrowUpRight, 
  CreditCard, 
  History,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const stats = [
    { label: "Subscription", value: "Premium Yearly", sub: "Renews Apr 20, 2026", icon: <CreditCard className="w-5 h-5 text-primary-400" /> },
    { label: "Latest Score", value: "38 pts", sub: "Mar 22 • Stableford", icon: <Target className="w-5 h-5 text-emerald-400" /> },
    { label: "Charity Share", value: "15%", sub: "Red Cross Intl", icon: <Heart className="w-5 h-5 text-accent-400" /> },
    { label: "Draw Entries", value: "12", sub: "Next draw in 8 days", icon: <Trophy className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold font-display text-white mb-2 tracking-tight">
              Welcome back, <span className="text-primary-500">Alex</span>
            </h1>
            <p className="text-slate-400 text-lg">Your game is making a difference today.</p>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  {stat.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              <div className="mt-4 pt-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Entry Logic - Main Section */}
          <section className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Enter Score</h2>
                  <p className="text-slate-400 text-sm">Stableford format (1-45 range)</p>
                </div>
              </div>

              <form className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Score Value</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="45"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 36"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Play Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4 shadow-xl shadow-primary-500/10">
                  Record Score
                </button>
              </form>
              
              <div className="mt-8 flex items-center space-x-3 text-amber-500 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>New scores automatically replace your oldest entries (rolling 5 limit).</p>
              </div>
            </div>

            {/* Score History */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                  <History className="w-5 h-5 text-slate-400" />
                  <span>Recent Performance</span>
                </h3>
                <Link href="#" className="text-sm text-primary-400 hover:text-white transition-colors">View All History</Link>
              </div>
              
              <div className="space-y-4">
                {[
                  { score: 38, date: "Mar 22", trend: "up" },
                  { score: 34, date: "Mar 15", trend: "down" },
                  { score: 41, date: "Mar 08", trend: "up" },
                  { score: 36, date: "Mar 01", trend: "even" },
                  { score: 32, date: "Feb 22", trend: "down" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-xl">
                        {s.score}
                      </div>
                      <div>
                        <p className="text-white font-semibold">Stableford Points</p>
                        <p className="text-slate-500 text-xs tracking-wide uppercase font-bold">{s.date}, 2026</p>
                      </div>
                    </div>
                    <div className="text-emerald-500">
                      <TrendingUp className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar / Secondary Sections */}
          <aside className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-accent-600/10 to-transparent">
              <h3 className="text-xl font-bold text-white mb-6">Charity Spotlight</h3>
              <div className="aspect-video rounded-2xl bg-slate-800 mb-6 relative overflow-hidden">
                {/* Image Placeholder */}
                <img 
                   src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300&h=200" 
                   alt="Charity" 
                   className="object-cover w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Red Cross International</h4>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2">
                Providing critical emergency response and humanitarian aid across conflict zones and natural disasters.
              </p>
              <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">
                <span>Contribution</span>
                <span className="text-white">15%</span>
              </div>
              <button className="w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold text-white">
                Change Charity
              </button>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary-600/10 to-transparent">
              <h3 className="text-xl font-bold text-white mb-6">Next Draw</h3>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2 font-display">$84,200</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Estimated 5-Match Jackpot</div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white font-medium">March 31, 2026</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-slate-400">Entries</span>
                  <span className="text-white font-medium">12/12 Verified</span>
                </div>
              </div>
              <Link href="/how-it-works" className="mt-8 block text-center text-sm font-bold text-primary-400 hover:text-white transition-colors">
                How prizes are calculated →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
