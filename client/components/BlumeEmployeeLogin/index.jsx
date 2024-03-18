import React, { useState } from "react";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { useDispatch } from "react-redux";

const BlumeEmployeeLogin = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const history = useHistory();
  const scopes = [
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/contacts.other.readonly",
    "https://www.googleapis.com/auth/directory.readonly",
    "https://www.googleapis.com/auth/user.addresses.read",
    "https://www.googleapis.com/auth/user.birthday.read",
    "https://www.googleapis.com/auth/user.emails.read",
    "https://www.googleapis.com/auth/user.gender.read",
    "https://www.googleapis.com/auth/user.organization.read",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: scopes.join(" "),
    onSuccess: async (codeResponse) => {
      console.log(codeResponse);
      const userData = await axios.post("/api/v1/auth/google", {
        code: codeResponse.code,
      });
      localStorage.setItem("blumeToken", userData.data.token);
      dispatch({ type: "USER_LOGIN_SUCCESS", user: userData?.data?.admin });
      history.push("/blumeEmployeePage", userData?.data?.info);

      setLoading(false);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });
  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="max-w-md mx-auto bg-white p-8 border border-gray-300 rounded shadow-md">
        <h1 className="text-blue-500 text-4xl mb-2"> Blume Navigator</h1>
        <h2 className="text-2xl font-bold mb-4">Login with Google</h2>
        <p className="text-gray-600 mb-6">
          Data will be collected for importing your Google contacts, directory
          contacts, and other contacts. Please approve all the permissions while
          logging in.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            googleLogin();
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Loading..." : "Login with Google"}
        </button>
      </div>
    </div>
  );
};

export default BlumeEmployeeLogin;
