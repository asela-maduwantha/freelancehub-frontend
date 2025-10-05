'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input/Input';
import { clientOnboardingActions } from '@/store/slices/clientOnboarding';
import { RootState } from '@/store';
import { ClientOnboardingFormData } from '@/types/clientOnboarding';
import { clientApi } from '@/lib/api/clientApi';
import { fileService } from '@/lib/api/files';

interface Step1Props {
  onNext: () => void;
}

const Step1ProfileCompany: React.FC<Step1Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.clientOnboarding);

  const [formData, setFormData] = useState<Pick<ClientOnboardingFormData, 'companyName' | 'companySize' | 'industry' | 'logo'>>({
    companyName: '',
    companySize: '',
    industry: '',
    logo: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing data if available
    if (progress?.formData) {
      setFormData({
        companyName: progress.formData.companyName || '',
        companySize: progress.formData.companySize || '',
        industry: progress.formData.industry || '',
        logo: progress.formData.logo,
      });
      if (progress.formData.logo && typeof progress.formData.logo === 'string') {
        setLogoPreview(progress.formData.logo);
      }
    }
  }, [progress]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: file }));
        setErrors(prev => ({ ...prev, logo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      let logoUrl: string | undefined;

      // Upload logo if provided
      if (formData.logo && formData.logo instanceof File) {
        const uploadResponse = await fileService.uploadDocument({
          file: formData.logo,
          description: 'Company logo'
        });
        logoUrl = uploadResponse.url;
      }

      // Save to backend API
      await clientApi.updateProfile({
        companyName: formData.companyName,
        companySize: formData.companySize as '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+',
        industry: formData.industry,
        logo: logoUrl,
      });

      // Update Redux state with the logo URL
      const updatedFormData = {
        ...formData,
        logo: logoUrl || formData.logo,
      };
      dispatch(clientOnboardingActions.updateStep(1, updatedFormData));

      // Mark step as completed
      dispatch(clientOnboardingActions.completeStep(1));

      // Proceed to next step
      onNext();
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      setErrors(prev => ({ ...prev, submit: error.response?.data?.message || 'Failed to save profile. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Marketing',
    'Real Estate',
    'Other',
  ];

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile & Company Information</h2>
        <p className="text-gray-600">
          Tell us about yourself and your company to get started with posting jobs and hiring freelancers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">Upload company logo (optional)</p>
          {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
        </div>

        {/* Company Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter your company name"
            className={errors.companyName ? 'border-red-500' : ''}
          />
          {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Size <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.companySize}
              onChange={(e) => handleInputChange('companySize', e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companySize ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select company size</option>
              {companySizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.companySize && <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.industry ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select industry</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Continue to Payment Setup'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default Step1ProfileCompany;