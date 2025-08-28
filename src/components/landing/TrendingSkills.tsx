"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Code, Palette, PenTool, Megaphone, Smartphone, BarChart } from "lucide-react";

// Icon mapping for categories
const iconMap = {
  'code': Code,
  'palette': Palette,
  'pen-tool': PenTool,
  'megaphone': Megaphone,
  'mobile': Smartphone,
  'bar-chart': BarChart
};

// Default skill categories - will be enhanced with API data
const defaultSkillCategories = [
  {
    name: "Development",
    icon: <Code className="w-5 h-5" />,
    color: "from-blue-500 to-blue-600",
    skills: [
      { name: "React", demand: 95, rate: "₨2,500/hr", projects: 145 },
      { name: "Node.js", demand: 88, rate: "₨2,200/hr", projects: 122 },
      { name: "Python", demand: 92, rate: "₨2,800/hr", projects: 134 },
      { name: "Laravel", demand: 85, rate: "₨2,000/hr", projects: 98 },
      { name: "WordPress", demand: 90, rate: "₨1,800/hr", projects: 156 },
      { name: "Vue.js", demand: 78, rate: "₨2,300/hr", projects: 89 }
    ]
  },
  {
    name: "Design",
    icon: <Palette className="w-5 h-5" />,
    color: "from-purple-500 to-purple-600",
    skills: [
      { name: "UI/UX Design", demand: 94, rate: "₨2,200/hr", projects: 167 },
      { name: "Figma", demand: 89, rate: "₨1,900/hr", projects: 143 },
      { name: "Logo Design", demand: 87, rate: "₨15,000/project", projects: 198 },
      { name: "Photoshop", demand: 82, rate: "₨1,500/hr", projects: 124 },
      { name: "Illustrator", demand: 80, rate: "₨1,700/hr", projects: 112 },
      { name: "Branding", demand: 75, rate: "₨25,000/project", projects: 67 }
    ]
  },
  {
    name: "Content",
    icon: <PenTool className="w-5 h-5" />,
    color: "from-green-500 to-green-600",
    skills: [
      { name: "Content Writing", demand: 91, rate: "₨800/hr", projects: 234 },
      { name: "Copywriting", demand: 86, rate: "₨1,200/hr", projects: 156 },
      { name: "SEO Writing", demand: 83, rate: "₨1,000/hr", projects: 178 },
      { name: "Blog Writing", demand: 88, rate: "₨750/hr", projects: 189 },
      { name: "Technical Writing", demand: 79, rate: "₨1,500/hr", projects: 98 },
      { name: "Translation", demand: 77, rate: "₨600/hr", projects: 145 }
    ]
  },
  {
    name: "Marketing",
    icon: <Megaphone className="w-5 h-5" />,
    color: "from-orange-500 to-orange-600",
    skills: [
      { name: "Digital Marketing", demand: 93, rate: "₨1,800/hr", projects: 167 },
      { name: "Social Media", demand: 90, rate: "₨1,200/hr", projects: 203 },
      { name: "SEO", demand: 87, rate: "₨1,500/hr", projects: 189 },
      { name: "Google Ads", demand: 84, rate: "₨2,000/hr", projects: 134 },
      { name: "Facebook Ads", demand: 82, rate: "₨1,600/hr", projects: 156 },
      { name: "Email Marketing", demand: 76, rate: "₨1,100/hr", projects: 123 }
    ]
  },
  {
    name: "Mobile",
    icon: <Smartphone className="w-5 h-5" />,
    color: "from-teal-500 to-teal-600",
    skills: [
      { name: "React Native", demand: 89, rate: "₨3,000/hr", projects: 89 },
      { name: "Flutter", demand: 85, rate: "₨2,800/hr", projects: 76 },
      { name: "iOS Development", demand: 81, rate: "₨3,500/hr", projects: 54 },
      { name: "Android Development", demand: 83, rate: "₨3,200/hr", projects: 67 },
      { name: "Ionic", demand: 72, rate: "₨2,200/hr", projects: 45 },
      { name: "Xamarin", demand: 68, rate: "₨2,500/hr", projects: 34 }
    ]
  }
];

export default function TrendingSkills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Use default skill categories with dummy data
  const skillCategories = defaultSkillCategories;

  // Static positions for background elements to prevent hydration mismatch
  const backgroundElements = [
    { left: "81.7683288966725%", top: "65.01223256773801%" },
    { left: "12.380480114489822%", top: "50.18763219221306%" },
    { left: "34.797599077963824%", top: "66.93988593953168%" },
    { left: "66.06696746405618%", top: "17.167982639218636%" },
    { left: "66.58328741205828%", top: "34.35790086528995%" },
    { left: "71.1672591233299%", top: "76.019929650167%" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundElements.map((element, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-10"
            style={{
              left: element.left,
              top: element.top,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="w-4 h-4" />
            Trending Skills in Sri Lanka
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Most In-Demand Skills
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the skills that are driving Sri Lanka&apos;s freelance economy and find your next opportunity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Selector */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {skillCategories.map((category, index) => (
                <motion.button
                  key={category.name}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                    selectedCategory === index
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className={selectedCategory === index ? "text-white" : "text-gray-500"}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{category.name}</div>
                    <div className={`text-sm ${selectedCategory === index ? "text-white/80" : "text-gray-500"}`}>
                      {category.skills.length} skills
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            ref={ref}
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ delay: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillCategories[selectedCategory].skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  onHoverStart={() => setHoveredSkill(skill.name)}
                  onHoverEnd={() => setHoveredSkill(null)}
                >
                  {/* Skill Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {skill.name}
                    </h4>
                    <motion.div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        skill.demand >= 90 ? "bg-green-100 text-green-700" :
                        skill.demand >= 80 ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}
                      animate={hoveredSkill === skill.name ? { scale: 1.1 } : { scale: 1 }}
                    >
                      {skill.demand}% demand
                    </motion.div>
                  </div>

                  {/* Demand Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Market Demand</span>
                      <span>High</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${skillCategories[selectedCategory].color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.demand}%` }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Average Rate</p>
                      <p className="font-semibold text-gray-900">{skill.rate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Active Projects</p>
                      <p className="font-semibold text-gray-900">{skill.projects}</p>
                    </div>
                  </div>

                  {/* Trending Indicator */}
                  {skill.demand >= 85 && (
                    <motion.div
                      className="mt-4 flex items-center gap-2 text-green-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Trending Now</span>
                    </motion.div>
                  )}

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.5 }}
            >
              <motion.button
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore All Skills
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.button>
              <p className="mt-3 text-gray-600">
                Join 1,250+ freelancers earning with in-demand skills
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
