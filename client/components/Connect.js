import axios from "axios";
import React, { Component, useState } from "react";
import { useSelector } from "react-redux";

const Connect = ({ employeeID }) => {
  const [context, setContext] = useState("");
  const { user } = useSelector((store) => store.currentUser);

  //   const handleConnectClick = () => {
  //     setShowTextArea(true);
  //   };

  const handleSubmitClick = () => {
    console.log("Context:", context, employeeID);
    const newToken = localStorage.getItem("blumeToken") || "";
    axios.defaults.headers.Authorization = newToken;
    const response = axios.post("/api/v1/founders/connect", {
      context,
      employeeID,
    });
    // You can perform further actions here, like sending the context to the server.
    // For this example, it just logs the context to the console.
    // You can also hide the text area or reset the input after submission.
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full ml-4 flex flex-col justify-center items-center">
        <textarea
          placeholder="Enter context for connection..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="w-1/2 h-32 resize-none border rounded-md px-3 py-2 my-3 focus:outline-none focus:border-blue-500"
        ></textarea>
        <button
          onClick={handleSubmitClick}
          className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded my-3"
        >
          Connect
        </button>
      </div>
    </div>
  );
};

export default Connect;
