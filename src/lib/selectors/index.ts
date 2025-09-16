import { RootState } from '../../store';

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export const selectAuthLoading = (state: RootState) => state.auth.loading;

export const selectAuthError = (state: RootState) => state.auth.error;

export const selectJobs = (state: RootState) => state.jobs;

export const selectAllJobs = (state: RootState) => state.jobs.jobs;

export const selectJobById = (id: string) => (state: RootState) =>
  state.jobs.jobs.find((job: any) => job.id === id);

export const selectJobsLoading = (state: RootState) => state.jobs.loading;

export const selectJobsError = (state: RootState) => state.jobs.error;

export const selectJobsPagination = (state: RootState) => ({
  page: state.jobs.page,
  totalPages: state.jobs.totalPages,
  total: state.jobs.total,
});


export const selectUserProfile = (state: RootState) => state.user.profile;

export const selectUserProfileLoading = (state: RootState) => state.user.loading;

export const selectUserProfileError = (state: RootState) => state.user.error;


export const selectNotifications = (state: RootState) => state.notifications.notifications;

export const selectUnreadNotificationsCount = (state: RootState) =>
  state.notifications.notifications.filter((n: any) => !n.read).length;

export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;

export const selectUI = (state: RootState) => state.ui;

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;

export const selectTheme = (state: RootState) => state.ui.theme;

export const selectModal = (state: RootState) => state.ui.modal;

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