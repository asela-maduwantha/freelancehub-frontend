// Placeholder jobs slice
const jobsSlice = {
  reducer: (state = { jobs: [], loading: false }, action: any) => {
    switch (action.type) {
      case 'jobs/setJobs':
        return { ...state, jobs: action.payload, loading: false };
      case 'jobs/setLoading':
        return { ...state, loading: action.payload };
      default:
        return state;
    }
  }
};

export default jobsSlice.reducer;