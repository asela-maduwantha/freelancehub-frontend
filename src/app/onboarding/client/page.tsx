'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ClientProfileCreationDto } from '@/lib/types/client';
import { useClientProfileStore } from '@/store/clientProfileStore';

interface ClientProfileFormData {
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
  website: string | null;
  country: string;
  city: string;
  province: string;
}

const clientProfileSchema = yup.object().shape({
  companyName: yup.string().required('Company name is required'),
  industry: yup.string().required('Industry is required'),
  companySize: yup.string().required('Company size is required'),
  description: yup.string().max(300, 'Description must be less than 300 characters').required('Description is required'),
  website: yup.string().url('Invalid website URL').nullable(),
  country: yup.string().required('Country is required'),
  city: yup.string().required('City is required'),
  province: yup.string().required('Province/State is required'),
});

export default function ClientOnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ClientProfileFormData>({
    resolver: yupResolver(clientProfileSchema) as any,
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      industry: '',
      companySize: '',
      description: '',
      website: null,
      country: '',
      city: '',
      province: '',
    },
  });

  const onSubmit = async (data: ClientProfileFormData) => {
    setIsLoading(true);
    try {
      const profileData: ClientProfileCreationDto = {
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        description: data.description,
        website: data.website || undefined,
        location: {
          country: data.country,
          city: data.city,
          province: data.province,
        },
      };

      await useClientProfileStore.getState().submitProfile(profileData);
      toast.success('Profile created successfully!');
      router.push('/client');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to create profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Marketing', 'Consulting', 'Media', 'Non-profit', 'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tell us about your company to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <FormInput
              id="companyName"
              label="Company Name"
              placeholder="Enter your company name"
              error={errors.companyName}
              {...register('companyName')}
            />

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Industry
              </label>
              <select
                id="industry"
                {...register('industry')}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select an industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Brief description of your company and what you do..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            <FormInput
              id="website"
              label="Website (Optional)"
              type="url"
              placeholder="https://yourcompany.com"
              error={errors.website}
              {...register('website')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="country"
                label="Country"
                placeholder="e.g., USA"
                error={errors.country}
                {...register('country')}
              />

              <FormInput
                id="city"
                label="City"
                placeholder="e.g., San Francisco"
                error={errors.city}
                {...register('city')}
              />

              <FormInput
                id="province"
                label="Province/State"
                placeholder="e.g., CA"
                error={errors.province}
                {...register('province')}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Creating Profile...
              </>
            ) : (
              'Complete Profile'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need to change your role?{' '}
            <a
              href="/auth/role-selection"
              className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              Go back
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
