'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NavigationButtons from '../NavigationButtons';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';
import { freelancerApi } from '@/lib/api/freelancer';

interface SkillsFormData {
  skills: string[];
}

// Mock skills data - in real app this would come from API
const ALL_SKILLS = [
  // Web Development
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'JavaScript', 'TypeScript',
  'Node.js', 'Express.js', 'Django', 'Flask', 'Ruby on Rails', 'PHP', 'Laravel',
  'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap', 'Material-UI',

  // Mobile Development
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Ionic', 'Xamarin',

  // Backend & Databases
  'Python', 'Java', 'C#', 'Go', 'Rust', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Redis', 'GraphQL', 'REST API', 'Microservices',

  // DevOps & Cloud
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  'Terraform', 'Ansible', 'Linux', 'Nginx', 'Apache',

  // Design
  'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision',
  'UI/UX Design', 'Graphic Design', 'Wireframing', 'Prototyping',

  // Data & AI
  'Machine Learning', 'Data Science', 'Python', 'R', 'TensorFlow', 'PyTorch',
  'Pandas', 'NumPy', 'Jupyter', 'Tableau', 'Power BI',

  // Marketing & Business
  'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Social Media',
  'Email Marketing', 'Marketing Strategy', 'Business Analysis', 'Project Management',

  // Other
  'Git', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Slack', 'Communication',
  'Problem Solving', 'Leadership', 'Team Management'
];

const POPULAR_SKILLS_BY_CATEGORY = {
  'Web Development': [
    'React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'TypeScript', 'Next.js', 'Vue.js'
  ],
  'Design': [
    'Figma', 'UI/UX Design', 'Adobe XD', 'Photoshop', 'Sketch', 'Wireframing'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Ionic'
  ],
  'Backend & Database': [
    'Python', 'PostgreSQL', 'Node.js', 'MongoDB', 'MySQL', 'Django'
  ],
  'DevOps & Cloud': [
    'AWS', 'Docker', 'Kubernetes', 'Linux', 'Git', 'CI/CD'
  ],
  'Data & AI': [
    'Python', 'Machine Learning', 'Data Science', 'SQL', 'Tableau'
  ],
  'Marketing': [
    'SEO', 'Social Media', 'Content Marketing', 'Google Ads', 'Email Marketing'
  ]
};

const SkillsStep: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.onboarding);

  const [formData, setFormData] = useState<SkillsFormData>({
    skills: progress?.formData?.skills || [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = ALL_SKILLS.filter(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !formData.skills.includes(skill)
      ).slice(0, 10); // Limit to 10 suggestions
      setFilteredSkills(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, formData.skills]);

  const handleAddSkill = (skill: string) => {
    if (!formData.skills.includes(skill) && formData.skills.length < 15) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSearchQuery('');
      setShowSuggestions(false);
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddCustomSkill = () => {
    const skill = searchQuery.trim();
    if (skill && !formData.skills.includes(skill) && formData.skills.length < 15) {
      handleAddSkill(skill);
    }
  };

  const validateFormData = (): boolean => {
    if (formData.skills.length < 3) {
      setErrors({ skills: 'Please add at least 3 skills' });
      return false;
    }
    if (formData.skills.length > 15) {
      setErrors({ skills: 'Maximum 15 skills allowed' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleContinue = async () => {
    if (!validateFormData()) {
      return;
    }

    setIsSaving(true);
    try {
      // Save skills to backend
      await freelancerApi.addSkills({ skills: formData.skills });

      // Update progress
      dispatch(onboardingActions.updateStep(3, formData));

      // Mark step as completed
      dispatch(onboardingActions.completeStep(2));

      // Navigate to next step (portfolio)
      router.push('/freelancer/onboarding?step=3');
    } catch (error) {
      console.error('Failed to save skills:', error);
      setErrors({ skills: 'Failed to save skills. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/freelancer/onboarding?step=1');
  };

  const handleSkip = () => {
    // Navigate to next step without saving
    dispatch(onboardingActions.updateStep(3, {}));
    router.push('/freelancer/onboarding?step=3');
  };

  return (
    <div className="space-y-8">
      {/* Skills Search and Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>
        <p className="text-gray-600 mb-6">
          Add your technical skills, tools, and expertise. Choose at least 3 skills to help clients find you.
        </p>

        {/* Search Input */}
        <div className="relative mb-6">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for skills (e.g., React, Python, UI/UX Design)"
            className="w-full"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSkills.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {skill}
                </button>
              ))}
              {searchQuery.trim() && !filteredSkills.includes(searchQuery.trim()) && (
                <button
                  onClick={handleAddCustomSkill}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-t border-gray-200 text-blue-600"
                >
                  Add "{searchQuery.trim()}"
                </button>
              )}
            </div>
          )}
        </div>

        {/* Selected Skills */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Skills ({formData.skills.length}/15)
            </h4>
            {formData.skills.length > 0 && (
              <button
                onClick={() => setFormData({ skills: [] })}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>

          {formData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-500 hover:text-blue-700 ml-1"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p>No skills selected yet</p>
              <p className="text-sm">Start typing above to add your first skill</p>
            </div>
          )}
        </div>

        {errors.skills && (
          <p className="text-sm text-red-600 mb-4">{errors.skills}</p>
        )}
      </Card>

      {/* Popular Skills by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Skills</h3>
        <p className="text-gray-600 mb-6">
          Quick-add popular skills from different categories
        </p>

        <div className="space-y-6">
          {Object.entries(POPULAR_SKILLS_BY_CATEGORY).map(([category, skills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => {
                  const isSelected = formData.skills.includes(skill);
                  const isDisabled = !isSelected && formData.skills.length >= 15;

                  return (
                    <button
                      key={skill}
                      onClick={() => !isDisabled && handleAddSkill(skill)}
                      disabled={isDisabled}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700 cursor-default'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <NavigationButtons
        onNext={handleContinue}
        onBack={handleBack}
        onSkip={handleSkip}
        nextLabel="Continue"
        backLabel="Back"
        skipLabel="Skip for now"
        showSkip={true}
        nextDisabled={isSaving}
        loading={isSaving}
      />
    </div>
  );
};

export default SkillsStep;