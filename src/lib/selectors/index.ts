import { RootState } from '../../store';

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export const selectAuthError = (state: RootState) => state.auth.error;

export const selectJobs = (state: RootState) => state.jobs;

export const selectAllJobs = (state: RootState) => state.jobs.jobs;

export const selectJobById = (id: string) => (state: RootState) =>
  state.jobs.jobs.find((job: any) => job.id === id);

export const selectJobsLoading = (state: RootState) => state.jobs.loading;

export const selectJobsError = (state: RootState) => state.jobs.error;

export const selectJobsPagination = (state: RootState) => state.jobs.pagination;


export const selectUserProfile = (state: RootState) => state.user.profile;

// User loading and error states are not implemented in the current user slice


export const selectNotifications = (state: RootState) => state.notifications.notifications;

export const selectUnreadNotificationsCount = (state: RootState) =>
  state.notifications.notifications.filter((n: any) => !n.read).length;

// Notifications loading state is not implemented in the current slice

export const selectUI = (state: RootState) => state.ui;

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;

export const selectTheme = (state: RootState) => state.ui.theme;

// Modal state is not implemented in the current UI slice

export const selectAuthAndUser = (state: RootState) => ({
  auth: selectAuth(state),
  user: selectUser(state),
  isAuthenticated: selectIsAuthenticated(state),
});

export const selectJobsWithAuth = (state: RootState) => ({
  jobs: selectAllJobs(state),
  isAuthenticated: selectIsAuthenticated(state),
  user: selectUser(state),
});