import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/users";

export const metadata: Metadata = {
  title: "Golf & Giving | Premium Charity Subscription Platform",
  description: "Join the elite golf community that gives back. Enter scores, win monthly prizes, and support your favorite charities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    await ensureUserProfile(user);
  }

  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar userEmail={user?.email ?? null} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
