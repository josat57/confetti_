"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';

export default function RegisterSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid registration flow");
      router.push("/register");
      return;
    }

    toast.success("Registration successful! Please check your email for verification.");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.info("Redirecting to sign in page...");
          router.push("/sign-in");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold text-gray-900 mb-4"
          >
            Registration Successful!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mb-2"
          >
            A verification email has been sent to:
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-purple-600 font-medium mb-6"
          >
            {email}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mb-4"
          >
            Please check your email and click the verification link to activate your account.
            The verification link will include your email address and a token.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-500"
          >
            Redirecting to sign in page in {countdown} seconds...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
} 