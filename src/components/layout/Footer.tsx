'use client';

import Link from "next/link";
import { Trophy, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Trophy className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-display tracking-tight text-white uppercase italic">
                Play <span className="text-primary-500 font-normal">For</span> Cause
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              We're redefining the golf experience by combining elite performance tracking with meaningful charitable impact. Every score counts, every subscription gives back.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/charities" className="hover:text-primary-400 transition-colors">Explore Charities</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary-400 transition-colors">Draw Mechanics</Link></li>
              <li><Link href="/subscribe" className="hover:text-primary-400 transition-colors">Subscription Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Connect</h4>
            <div className="flex space-x-5">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
            <p className="mt-8 text-xs text-slate-500">
              Contact: support@digitalheroes.co.in
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-slate-500">
          <p>© 2026 Digital Heroes. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
