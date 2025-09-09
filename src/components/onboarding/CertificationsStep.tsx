'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/Button';

export default function CertificationsStep() {
  const { formData, updateFormData } = useOnboardingStore();

  const addCertification = () => {
    const newCertification = {
      name: '',
      issuer: '',
      year: new Date().getFullYear(),
      url: '',
    };
    updateFormData({
      certifications: [...(formData.certifications || []), newCertification],
    });
  };

  const updateCertification = (index: number, field: string, value: string | number) => {
    const updatedCertifications = [...(formData.certifications || [])];
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value };
    updateFormData({ certifications: updatedCertifications });
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = [...(formData.certifications || [])];
    updatedCertifications.splice(index, 1);
    updateFormData({ certifications: updatedCertifications });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Certifications & Credentials
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add any relevant certifications, courses, or professional credentials. This is optional.
        </p>
      </div>

      {formData.certifications && formData.certifications.length > 0 ? (
        <div className="space-y-4">
          {formData.certifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Certification Name"
                  placeholder="AWS Certified Developer"
                  value={cert.name}
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                />
                <FormInput
                  label="Issuing Organization"
                  placeholder="Amazon Web Services"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                />
                <FormInput
                  label="Year Obtained"
                  type="number"
                  placeholder="2023"
                  value={cert.year}
                  onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value))}
                />
                <FormInput
                  label="Credential URL (Optional)"
                  placeholder="https://..."
                  value={cert.url || ''}
                  onChange={(e) => updateCertification(index, 'url', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCertification(index)}
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
            No certifications added yet
          </p>
        </div>
      )}

      <Button onClick={addCertification} variant="outline" className="w-full">
        Add Certification
      </Button>
    </motion.div>
  );
}
