import React from "react";
import { BrowserRouter } from "react-router-dom";
import store from "./store";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId =
  "775614405027-913fiotduieu2cnckd0l6o7d4djck461.apps.googleusercontent.com";

export default function Wrapper({ children }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  );
}
