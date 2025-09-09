'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Button } from '@/components/ui/Button';

const skillCategories = {
  'Web Development': [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 
    'Express.js', 'HTML', 'CSS', 'Tailwind CSS', 'Sass', 'Bootstrap', 'PHP', 'Laravel'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Kotlin', 
    'Swift', 'Xamarin', 'Ionic', 'Cordova'
  ],
  'Backend Development': [
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET', 'Ruby', 
    'Ruby on Rails', 'Go', 'Rust', 'Scala', 'Elixir'
  ],
  'Data Science & AI': [
    'Python', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 
    'Data Analysis', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Computer Vision', 'NLP'
  ],
  'Design': [
    'UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 
    'InDesign', 'Graphic Design', 'Logo Design', 'Web Design', 'Mobile Design'
  ],
  'DevOps & Cloud': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 
    'GitLab CI', 'Terraform', 'Ansible', 'Linux', 'Monitoring'
  ],
  'Database': [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle', 
    'SQL Server', 'DynamoDB', 'Cassandra', 'Neo4j'
  ],
  'Others': [
    'Git', 'GitHub', 'Project Management', 'Agile', 'Scrum', 'Technical Writing', 
    'API Development', 'Microservices', 'Blockchain', 'Cybersecurity'
  ]
};

const projectCategories = [
  { id: 'web-development', name: 'Web Development', description: 'Websites, web applications, e-commerce' },
  { id: 'mobile-development', name: 'Mobile Development', description: 'iOS and Android applications' },
  { id: 'design', name: 'Design & Creative', description: 'UI/UX design, graphics, branding' },
  { id: 'data-science', name: 'Data Science & AI', description: 'Machine learning, analytics, AI solutions' },
  { id: 'devops', name: 'DevOps & Infrastructure', description: 'Cloud deployment, CI/CD, monitoring' },
  { id: 'content', name: 'Content & Writing', description: 'Technical writing, documentation, copywriting' },
  { id: 'consulting', name: 'Consulting & Strategy', description: 'Business analysis, project management' },
  { id: 'qa-testing', name: 'QA & Testing', description: 'Quality assurance, automated testing' },
];

export default function SkillsCategoriesStep() {
  const { formData, updateFormData } = useOnboardingStore();
  const [activeCategory, setActiveCategory] = useState<string>('Web Development');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedSkills = formData.skills || [];
  const selectedCategories = formData.categories || [];

  const handleSkillToggle = (skill: string) => {
    const updatedSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    updateFormData({ skills: updatedSkills });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId];
    
    updateFormData({ categories: updatedCategories });
  };

  const addCustomSkill = () => {
    if (searchTerm && !selectedSkills.includes(searchTerm)) {
      updateFormData({ skills: [...selectedSkills, searchTerm] });
      setSearchTerm('');
    }
  };

  const getFilteredSkills = () => {
    const categorySkills = skillCategories[activeCategory as keyof typeof skillCategories] || [];
    if (!searchTerm) return categorySkills;
    
    return categorySkills.filter(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Skills Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Your Skills
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedSkills.length} selected
          </span>
        </div>

        {/* Skill Search */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills or add custom skill..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            {searchTerm && !getFilteredSkills().includes(searchTerm) && (
              <Button
                type="button"
                onClick={addCustomSkill}
                variant="outline"
                size="sm"
              >
                Add "{searchTerm}"
              </Button>
            )}
          </div>
        </div>

        {/* Skill Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {Object.keys(skillCategories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                activeCategory === category
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <AnimatePresence>
            {getFilteredSkills().map((skill) => (
              <motion.button
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`p-2 text-sm rounded-lg border transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {skill}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Skills ({selectedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900 dark:text-green-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-2 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Categories
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCategories.length} selected
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select the types of projects you're interested in working on
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectCategories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryToggle(category.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCategories.includes(category.id)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded border-2 mt-1 ${
                  selectedCategories.includes(category.id)
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedCategories.includes(category.id) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Validation */}
      {selectedSkills.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ Please select at least one skill to continue
          </p>
        </motion.div>
      )}

      {selectedCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ Please select at least one project category to continue
          </p>
        </motion.div>
      )}

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Tips for skill selection</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Select skills you're confident using in professional projects</li>
          <li>• Include both technical skills and tools you're familiar with</li>
          <li>• Choose project categories that match your interests and expertise</li>
          <li>• You can always update these later as you grow your skills</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
