'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/Button';

export default function EducationStep() {
  const { formData, updateFormData } = useOnboardingStore();

  const addEducation = () => {
    const newEducation = {
      institution: '',
      degree: '',
      field: '',
      year: new Date().getFullYear(),
    };
    updateFormData({
      education: [...(formData.education || []), newEducation],
    });
  };

  const updateEducation = (index: number, field: string, value: string | number) => {
    const updatedEducation = [...(formData.education || [])];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    updateFormData({ education: updatedEducation });
  };

  const removeEducation = (index: number) => {
    const updatedEducation = [...(formData.education || [])];
    updatedEducation.splice(index, 1);
    updateFormData({ education: updatedEducation });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Education Background
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add your educational background to showcase your qualifications. This is optional.
        </p>
      </div>

      {formData.education && formData.education.length > 0 ? (
        <div className="space-y-4">
          {formData.education.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Institution"
                  placeholder="University name"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                />
                <FormInput
                  label="Degree"
                  placeholder="Bachelor's, Master's, etc."
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                />
                <FormInput
                  label="Field of Study"
                  placeholder="Computer Science, Design, etc."
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                />
                <FormInput
                  label="Year"
                  type="number"
                  placeholder="2020"
                  value={edu.year}
                  onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeEducation(index)}
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
            No education added yet
          </p>
        </div>
      )}

      <Button onClick={addEducation} variant="outline" className="w-full">
        Add Education
      </Button>
    </motion.div>
  );
}
