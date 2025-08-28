"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";

// Dummy categories data
const dummyCategories = [
  { id: "1", name: "Web Development" },
  { id: "2", name: "UI/UX Design" },
  { id: "3", name: "Content Writing" },
  { id: "4", name: "Digital Marketing" },
  { id: "5", name: "Mobile Apps" },
  { id: "6", name: "Logo Design" },
  { id: "7", name: "SEO" },
  { id: "8", name: "Social Media" },
  { id: "9", name: "Data Analysis" },
  { id: "10", name: "Graphic Design" },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Use dummy categories
  const categories = dummyCategories;

  const skillTags = [
    "Web Development", "UI/UX Design", "Content Writing", "Digital Marketing",
    "Mobile Apps", "Logo Design", "SEO", "Social Media", "Data Analysis",
    "Graphic Design", "WordPress", "React", "Python", "Photography"
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find the Perfect Freelancer
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search through thousands of skilled professionals ready to bring your projects to life
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 outline-none"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 text-lg rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 outline-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                onClick={() => {
                  // Demo search - just log the search parameters
                  console.log('Search query:', searchQuery);
                  console.log('Selected category:', selectedCategory);
                  alert(`Demo search: "${searchQuery}" in category "${selectedCategory || 'All'}"`);
                }}
              >
                <SearchIcon className="w-6 h-6" />
                Search Freelancers
              </motion.button>
            </div>
            
            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="text-sm font-medium text-gray-500">Popular searches:</span>
              {skillTags.slice(0, 8).map((tag, index) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-sm bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 px-4 py-2 rounded-full transition-all duration-300 font-medium"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Verified Freelancers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
