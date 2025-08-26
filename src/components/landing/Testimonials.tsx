"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Play, Heart } from "lucide-react";
import { useTestimonials } from "@/hooks/useLanding";

// Default testimonials as fallback
const defaultTestimonials = [
  {
    id: 1,
    content:
      "Finding qualified developers in Sri Lanka used to be challenging until I discovered this platform. I hired a full-stack developer within 48 hours who delivered exceptional work that exceeded all expectations.",
    author: "Dinesh Perera",
    position: "CTO, TechLanka",
    avatar: "/user.jpg",
    rating: 5,
    isFreelancer: false,
    project: "E-commerce Platform",
    budget: "₨150,000",
    timeline: "2 weeks",
    skills: ["React", "Node.js", "MongoDB"]
  },
  {
    id: 2,
    content:
      "As a freelance content writer, this platform has connected me with quality clients who value my work. The local payment system makes everything so much easier and the support team is fantastic.",
    author: "Priyanka Jayawardena",
    position: "Content Writer",
    avatar: "/user.jpg",
    rating: 5,
    isFreelancer: true,
    project: "Blog Content Creation",
    budget: "₨25,000/month",
    timeline: "Ongoing",
    skills: ["Content Writing", "SEO", "Social Media"]
  },
  {
    id: 3,
    content:
      "We needed a UI designer for our startup and found the perfect match through this platform. The communication was seamless and the quality exceeded our expectations by far.",
    author: "Ahmed Fazil",
    position: "Founder, EduSL",
    avatar: "/user.jpg",
    rating: 5,
    isFreelancer: false,
    project: "Mobile App Design",
    budget: "₨80,000",
    timeline: "3 weeks",
    skills: ["UI/UX", "Figma", "Mobile Design"]
  },
  {
    id: 4,
    content:
      "Working with international clients through this platform has been a game-changer for my freelance career. The secure payment system gives everyone confidence.",
    author: "Ravindu Silva",
    position: "Full Stack Developer",
    avatar: "/user.jpg",
    rating: 5,
    isFreelancer: true,
    project: "Web Application",
    budget: "₨200,000",
    timeline: "1 month",
    skills: ["React", "Python", "AWS"]
  },
  {
    id: 5,
    content:
      "The quality of freelancers on this platform is exceptional. I've hired multiple designers and developers, and they all delivered outstanding results on time.",
    author: "Samantha Fernando",
    position: "Marketing Director, StartupLK",
    avatar: "/user.jpg",
    rating: 5,
    isFreelancer: false,
    project: "Brand Identity",
    budget: "₨120,000",
    timeline: "2 weeks",
    skills: ["Branding", "Logo Design", "Marketing"]
  }
];

const liveActivity = [
  { action: "hired", user: "Tech Solutions LK", freelancer: "Kasun M.", skill: "React Developer", time: "2m ago" },
  { action: "completed", user: "Digital Agency", freelancer: "Nimali S.", skill: "Content Writer", time: "5m ago" },
  { action: "posted", user: "Startup Hub", project: "Mobile App Design", budget: "₨150k", time: "8m ago" },
  { action: "hired", user: "E-commerce Store", freelancer: "Tharindu P.", skill: "WordPress Dev", time: "12m ago" },
];

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { testimonials: apiTestimonials, loading: testimonialsLoading, error: testimonialsError } = useTestimonials();
  
  // Merge API testimonials with default structure
  const testimonials = apiTestimonials.length > 0 ? apiTestimonials.map((apiTest, index) => ({
    id: index + 1,
    content: apiTest.comment,
    author: apiTest.clientName || apiTest.freelancerName || 'Anonymous',
    position: apiTest.clientCompany ? `Client, ${apiTest.clientCompany}` : 'Freelancer',
    avatar: "/user.jpg",
    rating: apiTest.rating,
    isFreelancer: !!apiTest.freelancerName,
    project: apiTest.projectType,
    budget: "₨50,000", // Default since not provided in API
    timeline: "2 weeks", // Default since not provided in API
    skills: [apiTest.projectType] // Using project type as skill
  })) : defaultTestimonials;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [likedCards, setLikedCards] = useState<number[]>([]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setAutoPlay(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoPlay(false);
  };

  const toggleLike = (id: number) => {
    setLikedCards(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-green-100 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 bg-blue-100 rounded-full opacity-20"
          animate={{
            scale: [1, 0.8, 1],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Star className="w-4 h-4" />
            Client Success Stories
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What People Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from our clients and freelancers about their experience using
            our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Main Testimonial Carousel */}
          <div className="lg:col-span-2 pb-16">
            <div className="relative min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.5 }}
                >
                  <div 
                    className="bg-white p-6 md:p-8 rounded-2xl shadow-xl min-h-[480px] flex flex-col justify-between border border-gray-100 relative overflow-hidden"
                    onMouseEnter={() => setHoveredCard(testimonials[currentIndex].id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Quote Icon */}
                    <motion.div
                      className="absolute top-6 right-6 text-green-200"
                      animate={hoveredCard === testimonials[currentIndex].id ? { scale: 1.2, rotate: 15 } : { scale: 1, rotate: 0 }}
                    >
                      <Quote className="w-12 h-12" />
                    </motion.div>

                    {/* Rating */}
                    <motion.div 
                      className="flex mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Star
                            className={`w-6 h-6 ${i < testimonials[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Content */}
                    <motion.div
                      className="flex-grow space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-lg text-gray-700 leading-relaxed">
                        &apos;&apos;{testimonials[currentIndex].content}&apos;&apos;
                      </p>

                      {/* Project Details */}
                      <motion.div 
                        className="bg-gray-50 p-4 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Project:</span>
                            <p className="font-medium">{testimonials[currentIndex].project}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Budget:</span>
                            <p className="font-medium text-green-600">{testimonials[currentIndex].budget}</p>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {testimonials[currentIndex].skills.map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Author */}
                    <motion.div 
                      className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center">
                        <motion.div 
                          className="relative h-12 w-12 rounded-full overflow-hidden mr-4"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Image
                            src={testimonials[currentIndex].avatar}
                            alt={testimonials[currentIndex].author}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {testimonials[currentIndex].author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {testimonials[currentIndex].position}
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              testimonials[currentIndex].isFreelancer 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {testimonials[currentIndex].isFreelancer ? "Freelancer" : "Client"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Like Button */}
                      <motion.button
                        className={`p-2 rounded-full transition-colors ${
                          likedCards.includes(testimonials[currentIndex].id)
                            ? "bg-red-100 text-red-500"
                            : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleLike(testimonials[currentIndex].id)}
                      >
                        <Heart className={`w-5 h-5 ${likedCards.includes(testimonials[currentIndex].id) ? 'fill-current' : ''}`} />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="absolute -bottom-16 left-0 flex items-center gap-4">
                <motion.button
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                  onClick={handlePrev}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                  onClick={handleNext}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className={`p-3 rounded-full shadow-lg transition-colors border ${
                    autoPlay ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-400 border-gray-200"
                  }`}
                  onClick={() => setAutoPlay(!autoPlay)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Dots Indicator */}
              <div className="absolute -bottom-16 right-0 flex gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex ? "bg-green-500 scale-125" : "bg-gray-300"
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setAutoPlay(false);
                    }}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <motion.div
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h3 className="font-semibold text-gray-900">Live Activity</h3>
            </div>

            <div className="space-y-4">
              {liveActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'hired' ? 'bg-green-500' : 
                    activity.action === 'completed' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">{activity.user}</span>
                      {activity.action === 'hired' && ` hired ${activity.freelancer} for ${activity.skill}`}
                      {activity.action === 'completed' && ` completed project with ${activity.freelancer}`}
                      {activity.action === 'posted' && ` posted ${activity.project} for ${activity.budget}`}
                    </p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-6 p-4 bg-green-50 rounded-lg text-center"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-green-700 font-medium">Join 1,250+ active users!</p>
              <p className="text-xs text-green-600">New project posted every 3 minutes</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
