// Jobs slice for Redux
import { JobResponse, JobListResponse, CreateJobRequest } from '../../../lib/api/jobs';

export interface JobsState {
  jobs: JobResponse[];
  currentJob: JobResponse | null;
  myJobs: JobResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  myJobs: [],
  loading: false,
  error: null,
  pagination: null,
};

// Action types
export const JOBS_ACTIONS = {
  FETCH_JOBS_START: 'jobs/fetchJobsStart',
  FETCH_JOBS_SUCCESS: 'jobs/fetchJobsSuccess',
  FETCH_JOBS_FAILURE: 'jobs/fetchJobsFailure',
  FETCH_MY_JOBS_START: 'jobs/fetchMyJobsStart',
  FETCH_MY_JOBS_SUCCESS: 'jobs/fetchMyJobsSuccess',
  FETCH_MY_JOBS_FAILURE: 'jobs/fetchMyJobsFailure',
  FETCH_JOB_DETAIL_START: 'jobs/fetchJobDetailStart',
  FETCH_JOB_DETAIL_SUCCESS: 'jobs/fetchJobDetailSuccess',
  FETCH_JOB_DETAIL_FAILURE: 'jobs/fetchJobDetailFailure',
  CREATE_JOB_START: 'jobs/createJobStart',
  CREATE_JOB_SUCCESS: 'jobs/createJobSuccess',
  CREATE_JOB_FAILURE: 'jobs/createJobFailure',
  UPDATE_JOB_START: 'jobs/updateJobStart',
  UPDATE_JOB_SUCCESS: 'jobs/updateJobSuccess',
  UPDATE_JOB_FAILURE: 'jobs/updateJobFailure',
  DELETE_JOB_START: 'jobs/deleteJobStart',
  DELETE_JOB_SUCCESS: 'jobs/deleteJobSuccess',
  DELETE_JOB_FAILURE: 'jobs/deleteJobFailure',
  APPLY_TO_JOB_START: 'jobs/applyToJobStart',
  APPLY_TO_JOB_SUCCESS: 'jobs/applyToJobSuccess',
  APPLY_TO_JOB_FAILURE: 'jobs/applyToJobFailure',
  CLEAR_ERROR: 'jobs/clearError',
  SET_LOADING: 'jobs/setLoading',
  RESET_CURRENT_JOB: 'jobs/resetCurrentJob',
} as const;

// Action creators
export const jobsActions = {
  fetchJobsStart: () => ({ type: JOBS_ACTIONS.FETCH_JOBS_START }),
  fetchJobsSuccess: (data: JobListResponse) => ({
    type: JOBS_ACTIONS.FETCH_JOBS_SUCCESS,
    payload: data,
  }),
  fetchJobsFailure: (error: string) => ({
    type: JOBS_ACTIONS.FETCH_JOBS_FAILURE,
    payload: error,
  }),
  fetchMyJobsStart: () => ({ type: JOBS_ACTIONS.FETCH_MY_JOBS_START }),
  fetchMyJobsSuccess: (data: JobListResponse) => ({
    type: JOBS_ACTIONS.FETCH_MY_JOBS_SUCCESS,
    payload: data,
  }),
  fetchMyJobsFailure: (error: string) => ({
    type: JOBS_ACTIONS.FETCH_MY_JOBS_FAILURE,
    payload: error,
  }),
  fetchJobDetailStart: () => ({ type: JOBS_ACTIONS.FETCH_JOB_DETAIL_START }),
  fetchJobDetailSuccess: (job: JobResponse) => ({
    type: JOBS_ACTIONS.FETCH_JOB_DETAIL_SUCCESS,
    payload: job,
  }),
  fetchJobDetailFailure: (error: string) => ({
    type: JOBS_ACTIONS.FETCH_JOB_DETAIL_FAILURE,
    payload: error,
  }),
  createJobStart: () => ({ type: JOBS_ACTIONS.CREATE_JOB_START }),
  createJobSuccess: (job: JobResponse) => ({
    type: JOBS_ACTIONS.CREATE_JOB_SUCCESS,
    payload: job,
  }),
  createJobFailure: (error: string) => ({
    type: JOBS_ACTIONS.CREATE_JOB_FAILURE,
    payload: error,
  }),
  updateJobStart: () => ({ type: JOBS_ACTIONS.UPDATE_JOB_START }),
  updateJobSuccess: (job: JobResponse) => ({
    type: JOBS_ACTIONS.UPDATE_JOB_SUCCESS,
    payload: job,
  }),
  updateJobFailure: (error: string) => ({
    type: JOBS_ACTIONS.UPDATE_JOB_FAILURE,
    payload: error,
  }),
  deleteJobStart: () => ({ type: JOBS_ACTIONS.DELETE_JOB_START }),
  deleteJobSuccess: (jobId: string) => ({
    type: JOBS_ACTIONS.DELETE_JOB_SUCCESS,
    payload: jobId,
  }),
  deleteJobFailure: (error: string) => ({
    type: JOBS_ACTIONS.DELETE_JOB_FAILURE,
    payload: error,
  }),
  applyToJobStart: () => ({ type: JOBS_ACTIONS.APPLY_TO_JOB_START }),
  applyToJobSuccess: (data: any) => ({
    type: JOBS_ACTIONS.APPLY_TO_JOB_SUCCESS,
    payload: data,
  }),
  applyToJobFailure: (error: string) => ({
    type: JOBS_ACTIONS.APPLY_TO_JOB_FAILURE,
    payload: error,
  }),
  clearError: () => ({ type: JOBS_ACTIONS.CLEAR_ERROR }),
  setLoading: (loading: boolean) => ({
    type: JOBS_ACTIONS.SET_LOADING,
    payload: loading,
  }),
  resetCurrentJob: () => ({ type: JOBS_ACTIONS.RESET_CURRENT_JOB }),
};

// Reducer
const jobsReducer = (state: JobsState = initialState, action: any): JobsState => {
  switch (action.type) {
    case JOBS_ACTIONS.FETCH_JOBS_START:
    case JOBS_ACTIONS.FETCH_MY_JOBS_START:
    case JOBS_ACTIONS.FETCH_JOB_DETAIL_START:
    case JOBS_ACTIONS.CREATE_JOB_START:
    case JOBS_ACTIONS.UPDATE_JOB_START:
    case JOBS_ACTIONS.DELETE_JOB_START:
    case JOBS_ACTIONS.APPLY_TO_JOB_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case JOBS_ACTIONS.FETCH_JOBS_SUCCESS:
      return {
        ...state,
        jobs: action.payload.jobs,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.FETCH_MY_JOBS_SUCCESS:
      return {
        ...state,
        myJobs: action.payload.jobs,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.FETCH_JOB_DETAIL_SUCCESS:
      return {
        ...state,
        currentJob: action.payload,
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.CREATE_JOB_SUCCESS:
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        myJobs: [action.payload, ...state.myJobs],
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.UPDATE_JOB_SUCCESS:
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id ? action.payload : job
        ),
        myJobs: state.myJobs.map(job =>
          job.id === action.payload.id ? action.payload : job
        ),
        currentJob: state.currentJob?.id === action.payload.id ? action.payload : state.currentJob,
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.DELETE_JOB_SUCCESS:
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        myJobs: state.myJobs.filter(job => job.id !== action.payload),
        currentJob: state.currentJob?.id === action.payload ? null : state.currentJob,
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.APPLY_TO_JOB_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case JOBS_ACTIONS.FETCH_JOBS_FAILURE:
    case JOBS_ACTIONS.FETCH_MY_JOBS_FAILURE:
    case JOBS_ACTIONS.FETCH_JOB_DETAIL_FAILURE:
    case JOBS_ACTIONS.CREATE_JOB_FAILURE:
    case JOBS_ACTIONS.UPDATE_JOB_FAILURE:
    case JOBS_ACTIONS.DELETE_JOB_FAILURE:
    case JOBS_ACTIONS.APPLY_TO_JOB_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case JOBS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case JOBS_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case JOBS_ACTIONS.RESET_CURRENT_JOB:
      return {
        ...state,
        currentJob: null,
      };

    default:
      return state;
  }
};

export default jobsReducer;