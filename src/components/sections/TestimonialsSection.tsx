import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Emma Thompson',
    role: 'Wedding Planner',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3',
    rating: 5,
    text: 'Confetti has revolutionized how I plan events. The AI-powered tools save me hours of work, and the vendor matching is spot-on!',
    event: 'Luxury Wedding',
  },
  {
    id: 2,
    name: 'James Wilson',
    role: 'Corporate Event Manager',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3',
    rating: 5,
    text: 'The budget optimization feature is a game-changer. We saved 20% on our last corporate event without compromising quality.',
    event: 'Annual Conference',
  },
  {
    id: 3,
    name: 'Sophia Chen',
    role: 'Event Enthusiast',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3',
    rating: 5,
    text: 'Planning my birthday party was a breeze! The AI suggestions were perfect, and the vendor recommendations were exactly what I needed.',
    event: 'Birthday Celebration',
  },
];

const TestimonialsSection = () => {
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
            What Our Users Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Join thousands of satisfied event planners and organizers who have
            transformed their event planning experience with Confetti.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="relative w-16 h-16 mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              <p className="text-gray-600 mb-4">{testimonial.text}</p>

              <div className="pt-4 border-t border-gray-100">
                <span className="text-sm text-purple-600 font-medium">
                  {testimonial.event}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <h3 className="text-4xl font-bold text-purple-600 mb-2">10K+</h3>
            <p className="text-gray-600">Events Planned</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-purple-600 mb-2">5K+</h3>
            <p className="text-gray-600">Happy Users</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-purple-600 mb-2">2K+</h3>
            <p className="text-gray-600">Vendors</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-purple-600 mb-2">4.9</h3>
            <p className="text-gray-600">Average Rating</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 