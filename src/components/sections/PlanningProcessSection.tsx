"use client";

import { motion } from 'framer-motion';
import {
  Lightbulb,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  PartyPopper,
} from 'lucide-react';

const steps = [
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Initial Consultation',
    description:
      'Share your vision and requirements with our AI-powered planning assistant',
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Date & Venue Selection',
    description:
      'Get personalized recommendations for dates and venues that match your style',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Vendor Coordination',
    description:
      'Connect with top-rated vendors and manage all communications in one place',
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'Budget Management',
    description:
      'Track expenses and stay within budget with our smart financial tools',
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: 'Final Preparations',
    description:
      'Review and confirm all details with our comprehensive checklist',
  },
  {
    icon: <PartyPopper className="w-8 h-8" />,
    title: 'Event Day',
    description:
      'Enjoy your special day while we handle all the coordination',
  },
];

const PlanningProcessSection = () => {
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
            Planning Process
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            A seamless journey from idea to execution
          </motion.p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-200" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div
                  className={`w-1/2 ${
                    index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 ml-4">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanningProcessSection; 