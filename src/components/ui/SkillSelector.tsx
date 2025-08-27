"use client";
import { useState, useRef, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface Skill {
  id: string;
  name: string;
  category: string;
  popularity?: number;
}

interface SkillSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
  suggestions?: Skill[];
}

// Mock popular skills - in real app, this would come from API
const mockSkills: Skill[] = [
  { id: '1', name: 'React', category: 'Frontend', popularity: 95 },
  { id: '2', name: 'Node.js', category: 'Backend', popularity: 88 },
  { id: '3', name: 'TypeScript', category: 'Programming', popularity: 92 },
  { id: '4', name: 'Python', category: 'Programming', popularity: 90 },
  { id: '5', name: 'JavaScript', category: 'Programming', popularity: 98 },
  { id: '6', name: 'Vue.js', category: 'Frontend', popularity: 75 },
  { id: '7', name: 'Angular', category: 'Frontend', popularity: 70 },
  { id: '8', name: 'Express.js', category: 'Backend', popularity: 85 },
  { id: '9', name: 'MongoDB', category: 'Database', popularity: 80 },
  { id: '10', name: 'PostgreSQL', category: 'Database', popularity: 78 },
  { id: '11', name: 'AWS', category: 'Cloud', popularity: 82 },
  { id: '12', name: 'Docker', category: 'DevOps', popularity: 79 },
  { id: '13', name: 'Figma', category: 'Design', popularity: 87 },
  { id: '14', name: 'Photoshop', category: 'Design', popularity: 85 },
  { id: '15', name: 'UI/UX Design', category: 'Design', popularity: 90 },
];

const SkillSelector = ({
  value,
  onChange,
  placeholder = "Add your skills...",
  maxSkills = 20,
  error,
  disabled = false,
  className,
  suggestions = mockSkills
}: SkillSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Skill[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions
        .filter(skill => 
          skill.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(skill.name)
        )
        .slice(0, 10);
      setFilteredSuggestions(filtered);
      setIsOpen(true);
    } else {
      // Show popular skills when no input
      const popular = suggestions
        .filter(skill => !value.includes(skill.name))
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 8);
      setFilteredSuggestions(popular);
      setIsOpen(false);
    }
  }, [inputValue, value, suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skillName: string) => {
    if (!skillName.trim() || value.includes(skillName) || value.length >= maxSkills) {
      return;
    }

    onChange([...value, skillName.trim()]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last skill when backspacing on empty input
      removeSkill(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {/* Selected Skills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
            >
              {skill}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            disabled={disabled || value.length >= maxSkills}
            placeholder={value.length >= maxSkills ? `Maximum ${maxSkills} skills reached` : placeholder}
            className={clsx(
              'w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2',
              {
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20': !error && !disabled,
                'border-red-500 focus:border-red-500 focus:ring-red-500/20': error && !disabled,
                'bg-gray-50 cursor-not-allowed': disabled || value.length >= maxSkills,
              }
            )}
          />
        </div>

        {/* Skill Count */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-sm text-gray-500">
            {value.length}/{maxSkills}
          </span>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              {inputValue ? 'Matching Skills' : 'Popular Skills'}
            </div>
            <div className="space-y-1">
              {filteredSuggestions.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => addSkill(skill.name)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-gray-900">{skill.name}</div>
                    <div className="text-xs text-gray-500">{skill.category}</div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popular Skills (when no skills selected) */}
      {value.length === 0 && !isOpen && !inputValue && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Popular Skills:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
              .slice(0, 6)
              .map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => addSkill(skill.name)}
                  disabled={disabled}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {skill.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SkillSelector;
