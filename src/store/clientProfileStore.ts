import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClientProfileCreationDto, ClientProfileResponse, ClientProfileDraft } from '@/lib/types/client';
import { ClientService } from '@/lib/services/client';

interface ClientProfileState {
  profile: ClientProfileResponse | null;
  draft: ClientProfileDraft | null;
  profileId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadMyProfile: () => Promise<void>;
  saveDraft: (data: Partial<ClientProfileCreationDto>) => Promise<void>;
  submitProfile: (data: ClientProfileCreationDto) => Promise<void>;
  clear: () => void;
}

export const useClientProfileStore = create<ClientProfileState>()(
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
          const profile = await ClientService.getMyClientProfile();
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
          } as ClientProfileDraft;

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
          const result = await ClientService.createProfile(data);
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
      name: 'client-profile-store',
      partialize: (s) => ({ profile: s.profile, draft: s.draft, profileId: s.profileId }),
    }
  )
);
