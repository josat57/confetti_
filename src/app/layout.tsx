import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../contexts/AuthContext";
import { SubscriptionProvider } from "../contexts/SubscriptionContext";
import { AdminProvider } from "../contexts/AdminContext";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Confetti - Event Planning Made Easy",
  description:
    "Plan your perfect event with Confetti. From weddings to corporate events, we make event planning simple and stress-free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>{/* ... existing head content ... */}</head>
      <body className="min-h-screen bg-white">
        <AuthProvider>
          <SubscriptionProvider>
            <AdminProvider>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </AdminProvider>
          </SubscriptionProvider>
        </AuthProvider>

        {/* Payment Provider Scripts */}
        <Script
          src="https://checkout.flutterwave.com/v3.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
