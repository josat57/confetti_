"use client";

import { motion } from 'framer-motion';
import { Calendar, Users, Heart, Briefcase, GraduationCap, Cake } from 'lucide-react';

const categories = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Weddings',
    description: 'Create your perfect day with our AI-powered wedding planning tools',
    color: 'bg-pink-500',
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    title: 'Corporate Events',
    description: 'Professional events that make an impact',
    color: 'bg-blue-500',
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'Academic Events',
    description: 'From graduations to conferences',
    color: 'bg-green-500',
  },
  {
    icon: <Cake className="w-8 h-8" />,
    title: 'Birthday Parties',
    description: 'Celebrate special moments in style',
    color: 'bg-yellow-500',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Social Gatherings',
    description: 'Perfect for any social occasion',
    color: 'bg-purple-500',
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Custom Events',
    description: 'Tailored solutions for unique celebrations',
    color: 'bg-indigo-500',
  },
];

const EventCategoriesSection = () => {
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
            Event Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            From intimate gatherings to grand celebrations, we've got you covered
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`${category.color} h-2`} />
              <div className="p-8">
                <div className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6`}>
                  {category.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {category.title}
                </h3>
                <p className="text-gray-600">{category.description}</p>
                <button className="mt-6 text-purple-600 font-medium hover:text-purple-700 transition-colors">
                  Learn More →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventCategoriesSection; 