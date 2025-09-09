'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Button } from '@/components/ui/Button';

const commonLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese (Mandarin)',
  'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Dutch', 'Swedish', 'Norwegian', 'Danish'
];

const proficiencyLevels = [
  { value: 'native', label: 'Native', description: 'Native or bilingual proficiency' },
  { value: 'fluent', label: 'Fluent', description: 'Full professional proficiency' },
  { value: 'conversational', label: 'Conversational', description: 'Professional working proficiency' },
  { value: 'basic', label: 'Basic', description: 'Elementary proficiency' },
];

export default function LanguagesStep() {
  const { formData, updateFormData } = useOnboardingStore();

  const addLanguage = (language?: string) => {
    const newLanguage = {
      language: language || '',
      proficiency: '',
    };
    updateFormData({
      languages: [...(formData.languages || []), newLanguage],
    });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updatedLanguages = [...(formData.languages || [])];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    updateFormData({ languages: updatedLanguages });
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = [...(formData.languages || [])];
    updatedLanguages.splice(index, 1);
    updateFormData({ languages: updatedLanguages });
  };

  const getAvailableLanguages = () => {
    const usedLanguages = (formData.languages || []).map(l => l.language);
    return commonLanguages.filter(lang => !usedLanguages.includes(lang));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Languages You Speak
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add languages you're comfortable communicating in for work. This helps clients find freelancers who can communicate effectively.
        </p>
      </div>

      {formData.languages && formData.languages.length > 0 ? (
        <div className="space-y-4">
          {formData.languages.map((lang, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={lang.language}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a language</option>
                    {commonLanguages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proficiency Level
                  </label>
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select proficiency</option>
                    {proficiencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeLanguage(index)}
                className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No languages added yet
          </p>
        </div>
      )}

      {/* Quick Add Common Languages */}
      {getAvailableLanguages().length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick add common languages:
          </h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {getAvailableLanguages().slice(0, 6).map((language) => (
              <button
                key={language}
                onClick={() => addLanguage(language)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors dark:bg-blue-900/20 dark:text-blue-200 dark:hover:bg-blue-900/40"
              >
                + {language}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={() => addLanguage()} variant="outline" className="w-full">
        Add Another Language
      </Button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">🌍 Why languages matter</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Helps clients find freelancers who speak their language</li>
          <li>• Increases your visibility in global marketplace</li>
          <li>• Be honest about your proficiency level</li>
          <li>• English is often required for international projects</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
