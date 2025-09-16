// Placeholder user slice
const userSlice = {
  reducer: (state = { profile: null }, action: any) => {
    switch (action.type) {
      case 'user/setProfile':
        return { ...state, profile: action.payload };
      default:
        return state;
    }
  }
};

export default userSlice.reducer;