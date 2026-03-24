'use client';

import { motion } from "framer-motion";
import { Trophy, Heart, Target, ChevronRight, ArrowRight, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-black text-white selection:bg-primary-500/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/10 rounded-full blur-[120px] animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-8 hover:bg-white/10 transition-colors cursor-pointer">
              <Star className="w-4 h-4 text-primary-400 fill-primary-400" />
              <span className="text-sm font-medium text-slate-300">New: Monthly Drawing Live Now</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold font-display tracking-tight leading-[1.1] mb-8">
              Every Score <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500">
                Changes a Life
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
              The premier subscription platform for golfers who care. Track your game, win elite prizes, and support global charities with every round you play.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/subscribe" className="w-full sm:w-auto btn-primary flex items-center justify-center space-x-2">
                <span>Join the Cause</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center space-x-2">
                <span>How Draw Works</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { label: "Minimum Contribution", value: "10%", icon: <Heart className="w-6 h-6 text-accent-500" /> },
              { label: "Total Prize Pool", value: "$420K+", icon: <Trophy className="w-6 h-6 text-primary-500" /> },
              { label: "Verified Charities", value: "150+", icon: <ShieldCheck className="w-6 h-6 text-green-500" /> },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-colors group"
              >
                <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="section-title">The Giving Circle</h2>
            <p className="section-subtitle">
              Your passion for golf meets a purpose that matters. We&apos;ve built an ecosystem where your performance directly fuels positive change globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Track Performance",
                description: "Enter your last 5 Stableford scores. Our system maintains your rolling performance to ensure fair draw weighting.",
                icon: <Target className="w-10 h-10 text-primary-500" />
              },
              {
                title: "Choose Your Cause",
                description: "Select from our directory of verified charities. You decide where 10% (or more) of your subscription goes.",
                icon: <Heart className="w-10 h-10 text-accent-500" />
              },
              {
                title: "Win Elite Rewards",
                description: "Participate in monthly draws for 3, 4, and 5-number matches. Jackpots roll over until a champion is crowned.",
                icon: <Trophy className="w-10 h-10 text-amber-500" />
              }
            ].map((feature) => (
              <div key={feature.title} className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all">
                <div className="mb-8">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-16 rounded-[4rem] bg-gradient-to-r from-primary-900/50 to-accent-900/50 border border-white/10 relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">Ready to play for more?</h2>
             <p className="text-xl text-slate-300 mb-12 relative z-10 max-w-2xl mx-auto">
               Join 12,000+ golfers who are making a difference with every swing. Subscriptions start from $19/month.
             </p>
             <Link href="/subscribe" className="inline-flex btn-primary relative z-10 scale-110">
               Start Your Subscription
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
