import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const ConnectionRequestsPage = () => {
  const [connectionRequests, setConnectionRequests] = useState([
    {
      id: 1,
      context:
        "I would like to connect with you to discuss potential partnership opportunities.",
      founderName: "John Doe",
      status: "pending",
    },
    {
      id: 2,
      context:
        "Interested in discussing collaboration opportunities for our respective projects.",
      founderName: "Jane Smith",
      status: "expired",
    },
  ]);

  const handleAction = async (requestId, action) => {
    try {
      // Perform action based on button clicked
      let actionText;
      if (action === "yes") {
        actionText = "accepted";
      } else if (action === "canTry") {
        actionText = "marked as 'Can Try'";
      } else if (action === "no") {
        actionText = "declined";
      }

      // Dummy API call for demonstration purposes
      // In a real application, this would be replaced with actual API calls
      toast.success(`Request ${actionText} successfully`);

      // Update the status of the connection request
      setConnectionRequests(
        connectionRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "action taken" }
            : request
        )
      );
    } catch (error) {
      console.error("Error handling connection request:", error);
      toast.error("An error occurred while handling the connection request.");
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-blue-500 text-3xl mb-8">
          Connection Requests(Dummy Page)
        </h1>
        {connectionRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-lg font-bold mb-2">{request.founderName}</h2>
            <p className="text-gray-600 mb-4">{request.context}</p>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-bold ${
                  request.status === "pending"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                {request.status.toUpperCase()}
              </span>
              <div>
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => handleAction(request.id, "yes")}
                  disabled={request.status !== "pending"}
                >
                  Yes
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => handleAction(request.id, "canTry")}
                  disabled={request.status !== "pending"}
                >
                  Can Try
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleAction(request.id, "no")}
                  disabled={request.status !== "pending"}
                >
                  No, Sorry!
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionRequestsPage;
