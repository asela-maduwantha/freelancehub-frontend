'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
  onAdd: (skills: string[]) => Promise<void>;
  onRemove: (skill: string) => Promise<void>;
  isLoading?: boolean;
}

export default function SkillsSection({ skills, onAdd, onRemove, isLoading }: SkillsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillsToAdd, setSkillsToAdd] = useState<string[]>([]);

  const handleAddSkillToList = () => {
    if (skillInput.trim() && !skillsToAdd.includes(skillInput.trim()) && !skills.includes(skillInput.trim())) {
      setSkillsToAdd([...skillsToAdd, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveFromList = (skill: string) => {
    setSkillsToAdd(skillsToAdd.filter(s => s !== skill));
  };

  const handleSubmit = async () => {
    if (skillsToAdd.length === 0) return;
    
    try {
      await onAdd(skillsToAdd);
      setSkillsToAdd([]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add skills:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={16} />
          Add Skills
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No skills added yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-2"
            >
              {skill}
              <button
                onClick={() => onRemove(skill)}
                disabled={isLoading}
                className="hover:text-indigo-900 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Skills Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Add Skills</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSkillsToAdd([]);
                  setSkillInput('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Skill
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillToList();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="JavaScript"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkillToList}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {skillsToAdd.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills to Add
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillsToAdd.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromList(skill)}
                          className="hover:text-indigo-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || skillsToAdd.length === 0}
                  className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Skills
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSkillsToAdd([]);
                    setSkillInput('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
