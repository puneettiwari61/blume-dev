import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Connect = ({ employee, onBack }) => {
  const [context, setContext] = useState("");
  const [companyBlurb, setCompanyBlurb] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const handleSubmitClick = async () => {
    try {
      if (!context || !companyBlurb) {
        setError("Please fill in both Context and Company Blurb.");
        return;
      }
      setError("");
      setLoading(true);

      const newToken = localStorage.getItem("blumeToken") || "";
      axios.defaults.headers.Authorization = newToken;

      await axios.post("/api/v1/founders/connect", {
        context,
        companyBlurb,
        employeeID: employee._id,
      });
      setLoading(false);
      setIsRequestSent(true);
      toast.success("Connect Request Submitted Successfully");
    } catch (error) {
      toast.error("Failed to submit connect request. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full ml-4 flex flex-col justify-center items-center">
        {isRequestSent ? (
          <p className="text-black text-xl text-center">
            Request Successfully Submitted to connect with{" "}
            <span className="text-red-800">
              {employee?.firstName + " " + employee?.lastName}{" "}
            </span>
          </p>
        ) : (
          <p className="text-black text-xl text-center">
            Please submit a request to connect with{" "}
            <span className="text-red-800">
              {employee?.firstName + " " + employee?.lastName}{" "}
            </span>
          </p>
        )}
        {loading ? (
          <span className="flex items-center justify-center">
            Submitting request...
            <svg
              className="animate-spin h-5 w-5 ml-3 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V2.5A1.5 1.5 0 0010.5 1h-5A1.5 1.5 0 004 2.5V12zm2 7.5A1.5 1.5 0 017.5 18h5a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 015 20.5v-8.5zm14-3A1.5 1.5 0 0118.5 15h-5a1.5 1.5 0 01-1.5-1.5v-5A1.5 1.5 0 0113.5 7h8.5a1.5 1.5 0 011.5 1.5v5zm-8.5 1a.5.5 0 01-.5-.5V7.5a.5.5 0 01.5-.5h8.5a.5.5 0 01.5.5v8.5a.5.5 0 01-.5.5h-8.5z"
              ></path>
            </svg>
          </span>
        ) : isRequestSent ? null : (
          <>
            {" "}
            <textarea
              placeholder="Enter context for connection..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-3/4 sm:w-1/2 h-32 resize-none border rounded-md px-3 py-2 my-3 focus:outline-none focus:border-blue-500"
            ></textarea>
            <textarea
              placeholder="Enter company blurb..."
              value={companyBlurb}
              onChange={(e) => setCompanyBlurb(e.target.value)}
              className="w-3/4 sm:w-1/2 h-20 resize-none border rounded-md px-3 py-2 my-3 focus:outline-none focus:border-blue-500"
            ></textarea>
            {error && <p className="text-red-500">{error}</p>}
            <button
              onClick={handleSubmitClick}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded my-3"
            >
              Connect
            </button>
            <button
              onClick={onBack}
              className="mt-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded my-3"
            >
              Back to Search Results
            </button>
          </>
        )}
        {isRequestSent ? (
          <button
            onClick={onBack}
            className="mt-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded my-3"
          >
            Back to Search Results
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Connect;
