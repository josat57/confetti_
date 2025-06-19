"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
  };
  paymentProvider: 'flutterwave' | 'paystack';
  onSuccess: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaymentModal = ({ isOpen, onClose, plan, paymentProvider, onSuccess }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      onClose();
      return;
    }

    if (paymentProvider === 'paystack') {
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: plan.price * 100, // Convert to kobo/cents
        currency: 'NGN',
        ref: `${Math.ceil(Math.random() * 1000000000)}`,
        callback: (response: any) => {
          onSuccess();
          onClose();
          toast.success('Payment successful!');
        },
        onClose: () => {
          toast.info('Payment cancelled');
        },
      });
      handler.openIframe();
    } else {
      // Handle Flutterwave payment
      setIsProcessing(true);
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        onSuccess();
        onClose();
        toast.success('Payment successful!');
      } catch (error) {
        console.error('Payment error:', error);
        toast.error('An error occurred during payment. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Subscription</h3>
                <p className="text-gray-600">
                  You're subscribing to the {plan.name} plan
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">${plan.price}{plan.period}</span>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    isProcessing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    `Pay with ${paymentProvider === 'flutterwave' ? 'Flutterwave' : 'Paystack'}`
                  )}
                </button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-4">
                Your payment is secure and encrypted
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal; 