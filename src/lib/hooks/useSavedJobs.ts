import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../components/common/Toast';

interface SavedJob {
  id: string;
  title: string;
  savedAt: string;
}

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error, info } = useToast();

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    const loadSavedJobs = () => {
      try {
        const saved = localStorage.getItem('savedJobs');
        if (saved) {
          setSavedJobs(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      }
    };

    loadSavedJobs();
  }, []);

  // Save to localStorage whenever savedJobs changes
  useEffect(() => {
    try {
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    } catch (error) {
      console.error('Error saving jobs to localStorage:', error);
    }
  }, [savedJobs]);

  const isJobSaved = useCallback((jobId: string) => {
    return savedJobs.some(job => job.id === jobId);
  }, [savedJobs]);

  const saveJob = useCallback(async (job: { id: string; title: string }) => {
    if (isJobSaved(job.id)) {
      info('Job already saved');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to save job on backend
      // await jobService.saveJob(job.id);

      const newSavedJob: SavedJob = {
        id: job.id,
        title: job.title,
        savedAt: new Date().toISOString()
      };

      setSavedJobs(prev => [...prev, newSavedJob]);
      success('Job saved successfully!');
    } catch (err) {
      console.error('Error saving job:', err);
      error('Failed to save job');
    } finally {
      setIsLoading(false);
    }
  }, [isJobSaved, info, success, error]);

  const unsaveJob = useCallback(async (jobId: string) => {
    setIsLoading(true);
    try {
      // TODO: Call API to unsave job on backend
      // await jobService.unsaveJob(jobId);

      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      success('Job removed from saved jobs');
    } catch (err) {
      console.error('Error unsaving job:', err);
      error('Failed to remove job');
    } finally {
      setIsLoading(false);
    }
  }, [success, error]);

  const toggleSaveJob = useCallback(async (job: { id: string; title: string }) => {
    if (isJobSaved(job.id)) {
      await unsaveJob(job.id);
    } else {
      await saveJob(job);
    }
  }, [isJobSaved, saveJob, unsaveJob]);

  return {
    savedJobs,
    isLoading,
    isJobSaved,
    saveJob,
    unsaveJob,
    toggleSaveJob
  };
};