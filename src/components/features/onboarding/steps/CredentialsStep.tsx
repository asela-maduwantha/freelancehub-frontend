'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NavigationButtons from '../NavigationButtons';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';
import { EducationItem, CertificationItem } from '@/types/onboarding';

const CredentialsStep: React.FC = () => {
  const dispatch = useDispatch();
  const { progress, isLoading } = useSelector((state: RootState) => state.onboarding);

  const [education, setEducation] = useState<EducationItem[]>(
    progress?.formData?.education || []
  );
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    progress?.formData?.certifications || []
  );

  const [currentEducation, setCurrentEducation] = useState<Partial<EducationItem>>({
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    isCurrentlyStudying: false,
  });

  const [currentCertification, setCurrentCertification] = useState<Partial<CertificationItem>>({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddEducation = () => {
    setCurrentEducation({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
    });
    setIsAddingEducation(true);
    setEditingEducationIndex(null);
    setErrors({});
  };

  const handleAddCertification = () => {
    setCurrentCertification({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setIsAddingCertification(true);
    setEditingCertificationIndex(null);
    setErrors({});
  };

  const handleEditEducation = (index: number) => {
    const item = education[index];
    setCurrentEducation({ ...item });
    setIsAddingEducation(true);
    setEditingEducationIndex(index);
    setErrors({});
  };

  const handleEditCertification = (index: number) => {
    const item = certifications[index];
    setCurrentCertification({ ...item });
    setIsAddingCertification(true);
    setEditingCertificationIndex(index);
    setErrors({});
  };

  const handleDeleteEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    setEducation(updatedEducation);
  };

  const handleDeleteCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    setCertifications(updatedCertifications);
  };

  const handleSaveEducation = () => {
    const newErrors: Record<string, string> = {};

    if (!currentEducation.degree?.trim()) {
      newErrors.educationDegree = 'Degree is required';
    }

    if (!currentEducation.institution?.trim()) {
      newErrors.educationInstitution = 'Institution is required';
    }

    if (!currentEducation.startDate) {
      newErrors.educationStartDate = 'Start date is required';
    }

    if (!currentEducation.isCurrentlyStudying && !currentEducation.endDate) {
      newErrors.educationEndDate = 'End date is required unless currently studying';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const educationToSave: EducationItem = {
      id: currentEducation.id || `education-${Date.now()}`,
      degree: currentEducation.degree!,
      institution: currentEducation.institution!,
      startDate: currentEducation.startDate!,
      endDate: currentEducation.endDate || '',
      isCurrentlyStudying: currentEducation.isCurrentlyStudying || false,
    };

    let updatedEducation;
    if (editingEducationIndex !== null) {
      updatedEducation = [...education];
      updatedEducation[editingEducationIndex] = educationToSave;
    } else {
      updatedEducation = [...education, educationToSave];
    }

    setEducation(updatedEducation);
    setIsAddingEducation(false);
    setEditingEducationIndex(null);
    setCurrentEducation({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
    });
  };

  const handleSaveCertification = () => {
    const newErrors: Record<string, string> = {};

    if (!currentCertification.name?.trim()) {
      newErrors.certificationName = 'Certification name is required';
    }

    if (!currentCertification.issuingOrganization?.trim()) {
      newErrors.certificationOrganization = 'Issuing organization is required';
    }

    if (!currentCertification.issueDate) {
      newErrors.certificationIssueDate = 'Issue date is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const certificationToSave: CertificationItem = {
      id: currentCertification.id || `certification-${Date.now()}`,
      name: currentCertification.name!,
      issuingOrganization: currentCertification.issuingOrganization!,
      issueDate: currentCertification.issueDate!,
      expiryDate: currentCertification.expiryDate || '',
      credentialId: currentCertification.credentialId || '',
      credentialUrl: currentCertification.credentialUrl || '',
    };

    let updatedCertifications;
    if (editingCertificationIndex !== null) {
      updatedCertifications = [...certifications];
      updatedCertifications[editingCertificationIndex] = certificationToSave;
    } else {
      updatedCertifications = [...certifications, certificationToSave];
    }

    setCertifications(updatedCertifications);
    setIsAddingCertification(false);
    setEditingCertificationIndex(null);
    setCurrentCertification({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
  };

  const handleCancelEducation = () => {
    setIsAddingEducation(false);
    setEditingEducationIndex(null);
    setCurrentEducation({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
    });
    setErrors({});
  };

  const handleCancelCertification = () => {
    setIsAddingCertification(false);
    setEditingCertificationIndex(null);
    setCurrentCertification({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setErrors({});
  };

  const handleNext = () => {
    // Update Redux state
    dispatch(onboardingActions.updateStep(5, {
      education,
      certifications,
    }));

    // Mark step as completed
    dispatch(onboardingActions.completeStep(5));

    // Navigate to next step
    window.location.href = '/freelancer/onboarding/payment';
  };

  const handleBack = () => {
    window.location.href = '/freelancer/onboarding/portfolio';
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Education & Certifications</h2>
        <p className="text-gray-600">
          Add your educational background and professional certifications to build credibility.
        </p>
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          <Button size="sm" onClick={handleAddEducation}>
            Add Education
          </Button>
        </div>

        {education.length > 0 && (
          <div className="space-y-3">
            {education.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.degree}</h4>
                    <p className="text-gray-600">{item.institution}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.startDate).getFullYear()} - {
                        item.isCurrentlyStudying
                          ? 'Present'
                          : item.endDate
                            ? new Date(item.endDate).getFullYear()
                            : 'Present'
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditEducation(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEducation(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {education.length === 0 && !isAddingEducation && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No education added yet</p>
            <Button onClick={handleAddEducation}>Add Your Education</Button>
          </div>
        )}
      </div>

      {/* Education Form */}
      {isAddingEducation && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingEducationIndex !== null ? 'Edit Education' : 'Add Education'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree/Program *
              </label>
              <input
                type="text"
                value={currentEducation.degree || ''}
                onChange={(e) => setCurrentEducation(prev => ({ ...prev, degree: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.educationDegree ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Bachelor of Computer Science"
              />
              {errors.educationDegree && <p className="mt-1 text-sm text-red-600">{errors.educationDegree}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution *
              </label>
              <input
                type="text"
                value={currentEducation.institution || ''}
                onChange={(e) => setCurrentEducation(prev => ({ ...prev, institution: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.educationInstitution ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., University of Technology"
              />
              {errors.educationInstitution && <p className="mt-1 text-sm text-red-600">{errors.educationInstitution}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={currentEducation.startDate || ''}
                  onChange={(e) => setCurrentEducation(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.educationStartDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.educationStartDate && <p className="mt-1 text-sm text-red-600">{errors.educationStartDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date {!currentEducation.isCurrentlyStudying && '*'}
                </label>
                <input
                  type="date"
                  value={currentEducation.endDate || ''}
                  onChange={(e) => setCurrentEducation(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={currentEducation.isCurrentlyStudying}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.educationEndDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.educationEndDate && <p className="mt-1 text-sm text-red-600">{errors.educationEndDate}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="currentlyStudying"
                checked={currentEducation.isCurrentlyStudying || false}
                onChange={(e) => setCurrentEducation(prev => ({
                  ...prev,
                  isCurrentlyStudying: e.target.checked,
                  endDate: e.target.checked ? '' : prev.endDate
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="currentlyStudying" className="text-sm text-gray-700">
                I am currently studying here
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleSaveEducation}>
                {editingEducationIndex !== null ? 'Update Education' : 'Add Education'}
              </Button>
              <Button variant="secondary" onClick={handleCancelEducation}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Certifications Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
          <Button size="sm" onClick={handleAddCertification}>
            Add Certification
          </Button>
        </div>

        {certifications.length > 0 && (
          <div className="space-y-3">
            {certifications.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-gray-600">{item.issuingOrganization}</p>
                    <p className="text-sm text-gray-500">
                      Issued: {new Date(item.issueDate).toLocaleDateString()}
                      {item.expiryDate && ` • Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                    </p>
                    {item.credentialId && (
                      <p className="text-sm text-gray-500">ID: {item.credentialId}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditCertification(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCertification(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {certifications.length === 0 && !isAddingCertification && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No certifications added yet</p>
            <Button onClick={handleAddCertification}>Add Certification</Button>
          </div>
        )}
      </div>

      {/* Certification Form */}
      {isAddingCertification && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCertificationIndex !== null ? 'Edit Certification' : 'Add Certification'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Name *
              </label>
              <input
                type="text"
                value={currentCertification.name || ''}
                onChange={(e) => setCurrentCertification(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.certificationName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
              {errors.certificationName && <p className="mt-1 text-sm text-red-600">{errors.certificationName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuing Organization *
              </label>
              <input
                type="text"
                value={currentCertification.issuingOrganization || ''}
                onChange={(e) => setCurrentCertification(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.certificationOrganization ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Amazon Web Services"
              />
              {errors.certificationOrganization && <p className="mt-1 text-sm text-red-600">{errors.certificationOrganization}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={currentCertification.issueDate || ''}
                  onChange={(e) => setCurrentCertification(prev => ({ ...prev, issueDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.certificationIssueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.certificationIssueDate && <p className="mt-1 text-sm text-red-600">{errors.certificationIssueDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={currentCertification.expiryDate || ''}
                  onChange={(e) => setCurrentCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential ID (optional)
              </label>
              <input
                type="text"
                value={currentCertification.credentialId || ''}
                onChange={(e) => setCurrentCertification(prev => ({ ...prev, credentialId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ABC123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential URL (optional)
              </label>
              <input
                type="url"
                value={currentCertification.credentialUrl || ''}
                onChange={(e) => setCurrentCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://verify.certification.com/ABC123"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleSaveCertification}>
                {editingCertificationIndex !== null ? 'Update Certification' : 'Add Certification'}
              </Button>
              <Button variant="secondary" onClick={handleCancelCertification}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={(education.length > 0 || certifications.length > 0) ? "Continue to Payment Setup" : "Skip for Now"}
        loading={isLoading}
      />
    </div>
  );
};

export default CredentialsStep;