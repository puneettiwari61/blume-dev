import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const FoundersLoginPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpGenerated, setOtpGenerated] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!otpGenerated) {
        // Make a POST request to send email for OTP generation
        const response = await axios.post("/api/v1/founders/send-email-otp", {
          email,
        });
        console.log("OTP generated successfully:", response.data);
        setOtpGenerated(true);
      } else {
        const response = await axios.post("/api/v1/founders/verify-otp", {
          email,
          otp,
        });
        if (response.data.success) {
          localStorage.setItem("blumeToken", response.data.token);
          dispatch({ type: "USER_LOGIN_SUCCESS", user: response.data.user });

          history.push("/");
        }
        console.log("OTP verified ", response.data);
        // Redirect to login page or dashboard
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to proceed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center bg-[#dfdfdf] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-blue-500 text-4xl mb-2 text-center">
            Blume Navigator
          </h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Founders Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {otpGenerated && (
              <>
                <div>
                  <label htmlFor="otp" className="sr-only">
                    OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Loading..." : otpGenerated ? "Verify OTP" : "Get OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoundersLoginPage;
