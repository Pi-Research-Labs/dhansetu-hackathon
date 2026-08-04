import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LanguageCode = "en" | "hi" | "mr" | "te";

interface LanguageState {
  currentLanguage: LanguageCode;
}

const initialState: LanguageState = {
  currentLanguage: "en",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
