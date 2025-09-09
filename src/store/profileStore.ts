import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FreelancerProfileCreationDto } from '@/lib/types/auth';
import type { FreelancerProfileResponse, FreelancerProfileDraft } from '@/lib/types/freelancer';
import { FreelancerService } from '@/lib/services/freelancer';

interface ProfileState {
  profile: FreelancerProfileResponse | null;
  draft: FreelancerProfileDraft | null;
  profileId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadMyProfile: () => Promise<void>;
  saveDraft: (data: Partial<FreelancerProfileCreationDto>) => Promise<void>;
  submitProfile: (data: FreelancerProfileCreationDto) => Promise<void>;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      draft: null,
      profileId: null,
      isLoading: false,
      isSaving: false,
      error: null,

      loadMyProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const profile = await FreelancerService.getMyFreelancerProfile();
          set({ profile, profileId: profile.id });
        } catch (e: unknown) {
          // 404 means not created yet — not an error for consumers
          const status = (e as { statusCode?: number; response?: { status?: number } })?.statusCode
            ?? (e as { response?: { status?: number } })?.response?.status;
          if (status === 404) {
            set({ profile: null, profileId: null });
          } else {
            const message = (e as { message?: string })?.message ?? 'Failed to load profile';
            set({ error: message });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      saveDraft: async (data) => {
        set({ isSaving: true, error: null });
        try {
          const currentDraft = get().draft;
          const updatedDraft = {
            ...currentDraft,
            ...data,
            id: currentDraft?.id || 'draft-' + Date.now(), // Generate an ID if none exists
            updatedAt: new Date().toISOString(),
          } as FreelancerProfileDraft;
          
          set({ draft: updatedDraft, profileId: updatedDraft.id });
        } catch (e: unknown) {
          const message = (e as { message?: string })?.message ?? 'Failed to save draft';
          set({ error: message });
          throw e;
        } finally {
          set({ isSaving: false });
        }
      },

      submitProfile: async (data) => {
        set({ isSaving: true, error: null });
        try {
          const result = await FreelancerService.createProfile(data);
          set({ profile: result, profileId: result.id, draft: null });
        } catch (e: unknown) {
          const message = (e as { message?: string })?.message ?? 'Failed to submit profile';
          set({ error: message });
          throw e;
        } finally {
          set({ isSaving: false });
        }
      },

      clear: () => set({ profile: null, draft: null, profileId: null, error: null }),
    }),
    {
      name: 'profile-store',
      partialize: (s) => ({ profile: s.profile, draft: s.draft, profileId: s.profileId }),
    }
  )
);
