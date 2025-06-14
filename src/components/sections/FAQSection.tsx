"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does the AI-powered planning work?',
    answer:
      'Our AI analyzes your preferences, budget, and requirements to provide personalized recommendations for venues, vendors, and event details. It learns from your feedback to continuously improve suggestions.',
  },
  {
    question: 'What types of events can you help plan?',
    answer:
      'We specialize in all types of events including weddings, corporate events, birthday parties, academic ceremonies, and custom celebrations. Our platform adapts to your specific needs.',
  },
  {
    question: 'How much does the service cost?',
    answer:
      'We offer flexible pricing plans starting from $99/month. The cost varies based on event size, complexity, and additional services required. Contact us for a personalized quote.',
  },
  {
    question: 'Can I manage multiple events at once?',
    answer:
      'Yes! Our platform allows you to manage multiple events simultaneously. Each event has its own dashboard, timeline, and vendor management system.',
  },
  {
    question: 'How do you handle vendor coordination?',
    answer:
      'We provide a centralized platform for vendor communication, contract management, and payment processing. Our AI helps match you with the best vendors based on your requirements.',
  },
  {
    question: 'What if I need to make last-minute changes?',
    answer:
      'Our platform is designed to handle changes efficiently. The AI will automatically update all affected components and notify relevant vendors. Our support team is also available 24/7.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Everything you need to know about our services
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-purple-600 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-gray-50 rounded-b-lg">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 