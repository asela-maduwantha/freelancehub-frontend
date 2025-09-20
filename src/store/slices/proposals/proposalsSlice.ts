// Proposals slice for Redux
import { ProposalResponse, ProposalListResponse, CreateProposalRequest } from '../../../lib/api/proposals';

export interface ProposalsState {
  proposals: ProposalResponse[];
  currentProposal: ProposalResponse | null;
  myProposals: ProposalResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: ProposalsState = {
  proposals: [],
  currentProposal: null,
  myProposals: [],
  loading: false,
  error: null,
  pagination: null,
};

// Action types
export const PROPOSALS_ACTIONS = {
  FETCH_PROPOSALS_START: 'proposals/fetchProposalsStart',
  FETCH_PROPOSALS_SUCCESS: 'proposals/fetchProposalsSuccess',
  FETCH_PROPOSALS_FAILURE: 'proposals/fetchProposalsFailure',
  FETCH_MY_PROPOSALS_START: 'proposals/fetchMyProposalsStart',
  FETCH_MY_PROPOSALS_SUCCESS: 'proposals/fetchMyProposalsSuccess',
  FETCH_MY_PROPOSALS_FAILURE: 'proposals/fetchMyProposalsFailure',
  FETCH_PROPOSAL_DETAIL_START: 'proposals/fetchProposalDetailStart',
  FETCH_PROPOSAL_DETAIL_SUCCESS: 'proposals/fetchProposalDetailSuccess',
  FETCH_PROPOSAL_DETAIL_FAILURE: 'proposals/fetchProposalDetailFailure',
  CREATE_PROPOSAL_START: 'proposals/createProposalStart',
  CREATE_PROPOSAL_SUCCESS: 'proposals/createProposalSuccess',
  CREATE_PROPOSAL_FAILURE: 'proposals/createProposalFailure',
  UPDATE_PROPOSAL_START: 'proposals/updateProposalStart',
  UPDATE_PROPOSAL_SUCCESS: 'proposals/updateProposalSuccess',
  UPDATE_PROPOSAL_FAILURE: 'proposals/updateProposalFailure',
  WITHDRAW_PROPOSAL_START: 'proposals/withdrawProposalStart',
  WITHDRAW_PROPOSAL_SUCCESS: 'proposals/withdrawProposalSuccess',
  WITHDRAW_PROPOSAL_FAILURE: 'proposals/withdrawProposalFailure',
  ACCEPT_PROPOSAL_START: 'proposals/acceptProposalStart',
  ACCEPT_PROPOSAL_SUCCESS: 'proposals/acceptProposalSuccess',
  ACCEPT_PROPOSAL_FAILURE: 'proposals/acceptProposalFailure',
  REJECT_PROPOSAL_START: 'proposals/rejectProposalStart',
  REJECT_PROPOSAL_SUCCESS: 'proposals/rejectProposalSuccess',
  REJECT_PROPOSAL_FAILURE: 'proposals/rejectProposalFailure',
  CLEAR_ERROR: 'proposals/clearError',
  SET_LOADING: 'proposals/setLoading',
  RESET_CURRENT_PROPOSAL: 'proposals/resetCurrentProposal',
} as const;

// Action creators
export const proposalsActions = {
  fetchProposalsStart: () => ({ type: PROPOSALS_ACTIONS.FETCH_PROPOSALS_START }),
  fetchProposalsSuccess: (data: ProposalListResponse) => ({
    type: PROPOSALS_ACTIONS.FETCH_PROPOSALS_SUCCESS,
    payload: data,
  }),
  fetchProposalsFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.FETCH_PROPOSALS_FAILURE,
    payload: error,
  }),
  fetchMyProposalsStart: () => ({ type: PROPOSALS_ACTIONS.FETCH_MY_PROPOSALS_START }),
  fetchMyProposalsSuccess: (data: ProposalListResponse) => ({
    type: PROPOSALS_ACTIONS.FETCH_MY_PROPOSALS_SUCCESS,
    payload: data,
  }),
  fetchMyProposalsFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.FETCH_MY_PROPOSALS_FAILURE,
    payload: error,
  }),
  fetchProposalDetailStart: () => ({ type: PROPOSALS_ACTIONS.FETCH_PROPOSAL_DETAIL_START }),
  fetchProposalDetailSuccess: (proposal: ProposalResponse) => ({
    type: PROPOSALS_ACTIONS.FETCH_PROPOSAL_DETAIL_SUCCESS,
    payload: proposal,
  }),
  fetchProposalDetailFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.FETCH_PROPOSAL_DETAIL_FAILURE,
    payload: error,
  }),
  createProposalStart: () => ({ type: PROPOSALS_ACTIONS.CREATE_PROPOSAL_START }),
  createProposalSuccess: (proposal: ProposalResponse) => ({
    type: PROPOSALS_ACTIONS.CREATE_PROPOSAL_SUCCESS,
    payload: proposal,
  }),
  createProposalFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.CREATE_PROPOSAL_FAILURE,
    payload: error,
  }),
  updateProposalStart: () => ({ type: PROPOSALS_ACTIONS.UPDATE_PROPOSAL_START }),
  updateProposalSuccess: (proposal: ProposalResponse) => ({
    type: PROPOSALS_ACTIONS.UPDATE_PROPOSAL_SUCCESS,
    payload: proposal,
  }),
  updateProposalFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.UPDATE_PROPOSAL_FAILURE,
    payload: error,
  }),
  withdrawProposalStart: () => ({ type: PROPOSALS_ACTIONS.WITHDRAW_PROPOSAL_START }),
  withdrawProposalSuccess: (proposalId: string) => ({
    type: PROPOSALS_ACTIONS.WITHDRAW_PROPOSAL_SUCCESS,
    payload: proposalId,
  }),
  withdrawProposalFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.WITHDRAW_PROPOSAL_FAILURE,
    payload: error,
  }),
  acceptProposalStart: () => ({ type: PROPOSALS_ACTIONS.ACCEPT_PROPOSAL_START }),
  acceptProposalSuccess: (proposal: ProposalResponse) => ({
    type: PROPOSALS_ACTIONS.ACCEPT_PROPOSAL_SUCCESS,
    payload: proposal,
  }),
  acceptProposalFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.ACCEPT_PROPOSAL_FAILURE,
    payload: error,
  }),
  rejectProposalStart: () => ({ type: PROPOSALS_ACTIONS.REJECT_PROPOSAL_START }),
  rejectProposalSuccess: (proposal: ProposalResponse) => ({
    type: PROPOSALS_ACTIONS.REJECT_PROPOSAL_SUCCESS,
    payload: proposal,
  }),
  rejectProposalFailure: (error: string) => ({
    type: PROPOSALS_ACTIONS.REJECT_PROPOSAL_FAILURE,
    payload: error,
  }),
  clearError: () => ({ type: PROPOSALS_ACTIONS.CLEAR_ERROR }),
  setLoading: (loading: boolean) => ({
    type: PROPOSALS_ACTIONS.SET_LOADING,
    payload: loading,
  }),
  resetCurrentProposal: () => ({ type: PROPOSALS_ACTIONS.RESET_CURRENT_PROPOSAL }),
};

// Reducer
const proposalsReducer = (state: ProposalsState = initialState, action: any): ProposalsState => {
  switch (action.type) {
    case PROPOSALS_ACTIONS.FETCH_PROPOSALS_START:
    case PROPOSALS_ACTIONS.FETCH_MY_PROPOSALS_START:
    case PROPOSALS_ACTIONS.FETCH_PROPOSAL_DETAIL_START:
    case PROPOSALS_ACTIONS.CREATE_PROPOSAL_START:
    case PROPOSALS_ACTIONS.UPDATE_PROPOSAL_START:
    case PROPOSALS_ACTIONS.WITHDRAW_PROPOSAL_START:
    case PROPOSALS_ACTIONS.ACCEPT_PROPOSAL_START:
    case PROPOSALS_ACTIONS.REJECT_PROPOSAL_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROPOSALS_ACTIONS.FETCH_PROPOSALS_SUCCESS:
      return {
        ...state,
        proposals: action.payload.proposals,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.FETCH_MY_PROPOSALS_SUCCESS:
      return {
        ...state,
        myProposals: action.payload.proposals,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.FETCH_PROPOSAL_DETAIL_SUCCESS:
      return {
        ...state,
        currentProposal: action.payload,
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.CREATE_PROPOSAL_SUCCESS:
      return {
        ...state,
        proposals: [action.payload, ...state.proposals],
        myProposals: [action.payload, ...state.myProposals],
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.UPDATE_PROPOSAL_SUCCESS:
      return {
        ...state,
        proposals: state.proposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        ),
        myProposals: state.myProposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        ),
        currentProposal: state.currentProposal?._id === action.payload._id ? action.payload : state.currentProposal,
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.WITHDRAW_PROPOSAL_SUCCESS:
      return {
        ...state,
        proposals: state.proposals.map(proposal =>
          proposal._id === action.payload ? { ...proposal, status: 'withdrawn' as const } : proposal
        ),
        myProposals: state.myProposals.map(proposal =>
          proposal._id === action.payload ? { ...proposal, status: 'withdrawn' as const } : proposal
        ),
        currentProposal: state.currentProposal?._id === action.payload
          ? { ...state.currentProposal!, status: 'withdrawn' as const }
          : state.currentProposal,
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.ACCEPT_PROPOSAL_SUCCESS:
    case PROPOSALS_ACTIONS.REJECT_PROPOSAL_SUCCESS:
      return {
        ...state,
        proposals: state.proposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        ),
        myProposals: state.myProposals.map(proposal =>
          proposal._id === action.payload._id ? action.payload : proposal
        ),
        currentProposal: state.currentProposal?._id === action.payload._id ? action.payload : state.currentProposal,
        loading: false,
        error: null,
      };

    case PROPOSALS_ACTIONS.FETCH_PROPOSALS_FAILURE:
    case PROPOSALS_ACTIONS.FETCH_MY_PROPOSALS_FAILURE:
    case PROPOSALS_ACTIONS.FETCH_PROPOSAL_DETAIL_FAILURE:
    case PROPOSALS_ACTIONS.CREATE_PROPOSAL_FAILURE:
    case PROPOSALS_ACTIONS.UPDATE_PROPOSAL_FAILURE:
    case PROPOSALS_ACTIONS.WITHDRAW_PROPOSAL_FAILURE:
    case PROPOSALS_ACTIONS.ACCEPT_PROPOSAL_FAILURE:
    case PROPOSALS_ACTIONS.REJECT_PROPOSAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case PROPOSALS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case PROPOSALS_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case PROPOSALS_ACTIONS.RESET_CURRENT_PROPOSAL:
      return {
        ...state,
        currentProposal: null,
      };

    default:
      return state;
  }
};

export default proposalsReducer;