"use client";

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

const vendorPlans = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for vendors just starting out',
    features: [
      'Basic profile listing',
      'Up to 5 event listings per month',
      'Basic analytics',
      'Email support',
      'Standard search visibility',
    ],
    limitations: [
      'No featured listings',
      'Limited photo uploads',
      'Basic customer reviews',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'Ideal for growing vendors',
    features: [
      'Enhanced profile listing',
      'Unlimited event listings',
      'Advanced analytics',
      'Priority support',
      'Featured in search results',
      'Photo gallery (up to 50 images)',
      'Customer review management',
      'Booking calendar',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For established vendors',
    features: [
      'Premium profile listing',
      'Unlimited event listings',
      'Advanced analytics & reporting',
      '24/7 priority support',
      'Top search visibility',
      'Unlimited photo gallery',
      'Advanced review management',
      'Custom booking system',
      'API access',
      'White-label options',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
  },
];

const plannerPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for personal event planning',
    features: [
      'Basic event planning tools',
      'Up to 3 active events',
      'Basic vendor search',
      'Email support',
      'Standard templates',
    ],
    limitations: [
      'No AI recommendations',
      'Limited guest management',
      'Basic budget tracking',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For professional event planners',
    features: [
      'Advanced planning tools',
      'Unlimited active events',
      'AI-powered recommendations',
      'Priority support',
      'Premium templates',
      'Advanced guest management',
      'Budget tracking & analytics',
      'Vendor management tools',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$79',
    period: '/month',
    description: 'For event planning agencies',
    features: [
      'All Professional features',
      'Team collaboration tools',
      'Custom branding',
      '24/7 priority support',
      'Advanced analytics & reporting',
      'API access',
      'White-label options',
      'Dedicated account manager',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
  },
];

const PricingSection = () => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'planner'>('vendor');

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose the perfect plan for your needs
          </motion.p>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center space-x-4 mt-8"
          >
            <button
              onClick={() => setActiveTab('vendor')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === 'vendor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              For Vendors
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === 'planner'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              For Event Planners
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(activeTab === 'vendor' ? vendorPlans : plannerPlans).map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-purple-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start">
                      <X className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{limitation}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-gray-600">
            Need a custom plan?{' '}
            <a href="#contact" className="text-purple-600 hover:text-purple-700 font-medium">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection; 