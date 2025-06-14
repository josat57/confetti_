"use client";

import { motion } from 'framer-motion';
import { Wand2, Calendar, MessageSquare, BarChart3, Bell, Settings } from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI Event Planning',
    description: 'Get personalized event recommendations powered by advanced AI algorithms.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automatically find the perfect date and time for your event with our smart calendar.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Collaboration',
    description: 'Work seamlessly with your team and vendors through our integrated chat system.',
  },
  {
    icon: BarChart3,
    title: 'Budget Tracking',
    description: 'Keep track of your expenses and stay within budget with our intuitive tools.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss important deadlines with our intelligent reminder system.',
  },
  {
    icon: Settings,
    title: 'Customizable Templates',
    description: 'Choose from a variety of beautiful templates or create your own.',
  },
];

const FeaturesSection = () => {
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
            Powerful Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Everything you need to plan the perfect event, all in one place.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <button className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
            Explore All Features
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection; 