import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, MapPin, Calendar } from 'lucide-react';

const trendingVendors = [
  {
    id: 1,
    name: 'Elegant Events',
    category: 'Wedding Planning',
    rating: 4.9,
    reviews: 128,
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3',
    price: 'From $5,000',
    availability: 'Next 3 months',
  },
  {
    id: 2,
    name: 'Corporate Solutions',
    category: 'Corporate Events',
    rating: 4.8,
    reviews: 95,
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3',
    price: 'From $8,000',
    availability: 'Next 2 months',
  },
  {
    id: 3,
    name: 'Party Masters',
    category: 'Birthday Celebrations',
    rating: 4.7,
    reviews: 156,
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3',
    price: 'From $2,000',
    availability: 'Next 4 months',
  },
  {
    id: 4,
    name: 'Gourmet Catering',
    category: 'Catering Services',
    rating: 4.9,
    reviews: 203,
    location: 'Chicago, IL',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3',
    price: 'From $3,500',
    availability: 'Next 6 months',
  },
];

const TrendingVendorsSection = () => {
  return (
    <section id="vendors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Trending Vendors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover our top-rated vendors, handpicked for their exceptional service
            and quality.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={vendor.image}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
                  {vendor.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-600">{vendor.rating}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  {vendor.reviews} reviews
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{vendor.availability}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-purple-600 font-semibold">{vendor.price}</p>
                </div>
                <button className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <button className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-colors duration-200">
            View All Vendors
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingVendorsSection; 