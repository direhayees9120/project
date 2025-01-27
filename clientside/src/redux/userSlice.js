import { createSlice } from "@reduxjs/toolkit";
import { users } from "../utils/data";

const getStoredUser = () => {
  const storedUser = JSON.parse(localStorage.getItem("userInfo"));
  return storedUser && storedUser._id ? storedUser : null;
};

const initialState = {
  user: getStoredUser() ?? users[0] ?? null, // Ensure a valid fallback
};

const userSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload; // Store the entire user object
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export default userSlice.reducer;

export function Login(user) {
  return (dispatch) => {
    dispatch(userSlice.actions.login(user)); // Pass the full user object
  };
}

export function Logout() {
  return (dispatch) => {
    dispatch(userSlice.actions.logout());
  };
}
