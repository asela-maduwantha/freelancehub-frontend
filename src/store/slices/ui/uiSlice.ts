// Placeholder ui slice
const uiSlice = {
  reducer: (state = { theme: 'light', sidebarOpen: false }, action: any) => {
    switch (action.type) {
      case 'ui/toggleSidebar':
        return { ...state, sidebarOpen: !state.sidebarOpen };
      case 'ui/setTheme':
        return { ...state, theme: action.payload };
      default:
        return state;
    }
  }
};

export default uiSlice.reducer;