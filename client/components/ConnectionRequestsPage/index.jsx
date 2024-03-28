import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ConnectionRequestsPage = () => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const { user } = useSelector((store) => store.currentUser);
  const displayName = user?.firstName + user?.lastName;
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    // Extract connectionId and token from URL
    const searchParams = new URLSearchParams(location.search);
    const connectionId = searchParams.get("connectionId");
    console.log(connectionId, "checkId");
    if (connectionId) {
      setConnectionId(connectionId);
    }

    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("blumeToken", token);
      getCurrentUser();
    }
    history.replace(location.pathname);

    // Use connectionId and token to filter and display the selected request card
    // Implement your logic to filter and display the request card based on connectionId and token
  }, []);

  const getCurrentUser = async () => {
    const newToken = localStorage.getItem("blumeToken") || "";
    axios.defaults.headers.Authorization = newToken;
    const getUser = await axios.get("/api/v1/founders/me");
    dispatch({ type: "USER_LOGIN_SUCCESS", user: getUser.data.user });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (connectionId && connectionRequests.length > 0) {
      const request = connectionRequests.filter(
        (req) => req._id == connectionId
      )[0];

      if (request?._id) {
        MySwal.fire({
          showCancelButton: true,
          showConfirmButton: false,
          cancelButtonText: "Close",
          html: (
            <div
              key={request._id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                request.status === "approved"
                  ? "border-green-500"
                  : request.status === "pending"
                  ? "border-blue-500"
                  : request.status === "inReview"
                  ? "border-yellow-500"
                  : request.status === "declined"
                  ? "border-red-500"
                  : ""
              } border hover:bg-gray-100 transition duration-300`}
            >
              {/* Request details */}
              <h2 className="text-lg text-left font-bold mb-2">
                {request.blumeConnectionID.firstName}{" "}
                {request.blumeConnectionID.lastName}
              </h2>
              <p className="text-gray-600 mb-2 text-lg text-left">
                <strong>From:</strong> {request.blumeConnectionID.company}
              </p>
              <p className="text-gray-600 mb-2 text-lg text-left">
                <strong>To:</strong> {request.founderID.company}
              </p>
              <p className="text-gray-600 mb-2 text-lg text-left">
                <strong>To Designation:</strong>{" "}
                {request.blumeConnectionID.position}
              </p>
              <p className="text-gray-600 mb-2 text-lg text-left">
                <strong>To LinkedIn URL:</strong>{" "}
                <a
                  href={request.blumeConnectionID.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700"
                >
                  {request.blumeConnectionID.linkedInUrl}
                </a>
              </p>
              <p className="text-gray-600 mb-2 text-lg text-left">
                <strong>Date of Request:</strong>{" "}
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
              <div className="flex-col justify-between items-center">
                <span
                  className={`text-sm font-bold my-4 ${
                    request.status === "approved"
                      ? "text-green-500"
                      : request.status === "pending"
                      ? "text-blue-500"
                      : request.status === "declined"
                      ? "text-red-500"
                      : request.status === "inReview"
                      ? "text-yellow-500"
                      : "text-blue-500"
                  }`}
                >
                  {request.status.toUpperCase()}
                </span>
                {request.status === "pending" && (
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded mr-1 text-sm"
                      onClick={() => handleAction(request._id, "approved")}
                      disabled={isLoading}
                      style={{
                        cursor: isLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded mr-1 text-sm"
                      onClick={() => handleAction(request._id, "inReview")}
                      disabled={isLoading}
                      style={{
                        cursor: isLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      Can Try
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                      onClick={() => handleAction(request._id, "declined")}
                      disabled={isLoading}
                      style={{
                        cursor: isLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      No, Sorry!
                    </button>
                  </div>
                )}
              </div>
            </div>
          ),
        });
      }

      // MySwal.update();
    }
  }, [connectionId, connectionRequests]);

  const fetchRequests = async () => {
    try {
      // Fetch connection requests from the server
      const newToken = localStorage.getItem("blumeToken") || "";

      axios.defaults.headers.Authorization = newToken;
      const response = await axios.get("/api/v1/admin/requests");

      const approvedRequests = response.data.requests.filter(
        (request) => request.status === "approved"
      );
      const pendingRequests = response.data.requests.filter(
        (request) => request.status === "pending"
      );
      const declinedRequests = response.data.requests.filter(
        (request) => request.status === "declined"
      );
      const inReviewRequests = response.data.requests.filter(
        (request) => request.status === "inReview"
      );

      inReviewRequests.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      // Sort the filtered requests
      approvedRequests.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      pendingRequests.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      declinedRequests.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      // Concatenate the sorted requests in the specified order
      const sortedRequests = [
        ...approvedRequests,
        ...pendingRequests,
        ...inReviewRequests,
        ...declinedRequests,
      ];
      // Update state with fetched requests
      setConnectionRequests(sortedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("An error occurred while fetching connection requests.");
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      setIsLoading(true);

      // Perform action based on button clicked
      let actionText;
      if (action === "approved") {
        actionText = "accepted";
      } else if (action === "inReview") {
        actionText = "marked as 'Can Try'";
      } else if (action === "declined") {
        actionText = "declined";
      }

      const response = await toast.promise(
        axios.post("/api/v1/admin/requests", {
          action: action,
          requestId,
        }),
        {
          pending: "Updating Request",
          success: `Request ${actionText} successfully`,
          error: "Error handling connection request:",
        }
      );
      console.log(response, "response");

      // Dummy API call for demonstration purposes
      // In a real application, this would be replaced with actual API calls
      // toast.success(`Request ${actionText} successfully`);

      // Update the status of the connection request locally
      setConnectionRequests(
        connectionRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: "action taken" }
            : request
        )
      );

      setIsLoading(true);
      // fetchRequests();
    } catch (error) {
      console.error("Error handling connection request:", error);
      toast.error("An error occurred while handling the connection request.");
    }
  };

  return (
    <div className="container mx-auto mt-8 mb-4 px-4">
      <div className="text-center absolute top-3 right-5 flex flex-col items-start gap-2">
        {displayName || user?.email ? (
          <>
            <span className="font-bold">
              Welcome! {displayName || user?.email}
            </span>
            <span
              onClick={() => {
                localStorage.clear();
                window.location.href = window.location.origin;
              }}
              className="font-bold text-blue-500 cursor-pointer"
            >
              Logout
            </span>
          </>
        ) : null}
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-blue-500 text-3xl mb-8">Connection Requests</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connectionRequests.map((request) => {
            // if (connectionId) {
            // }
            return (
              <div
                key={request._id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  request.status === "approved"
                    ? "border-green-500"
                    : request.status === "pending"
                    ? "border-blue-500"
                    : request.status === "inReview"
                    ? "border-yellow-500"
                    : request.status === "declined"
                    ? "border-red-500"
                    : ""
                } border hover:bg-gray-100 transition duration-300`}
              >
                {/* Request details */}
                <h2 className="text-lg font-bold mb-2">
                  {request.blumeConnectionID.firstName}{" "}
                  {request.blumeConnectionID.lastName}
                </h2>
                <p className="text-gray-600 mb-2">
                  <strong>From:</strong> {request.blumeConnectionID.company}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>To:</strong> {request.founderID.company}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>To Designation:</strong>{" "}
                  {request.blumeConnectionID.position}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>To LinkedIn URL:</strong>{" "}
                  <a
                    href={request.blumeConnectionID.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700"
                  >
                    {request.blumeConnectionID.linkedInUrl}
                  </a>
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Date of Request:</strong>{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-bold ${
                      request.status === "approved"
                        ? "text-green-500"
                        : request.status === "pending"
                        ? "text-blue-500"
                        : request.status === "inReview"
                        ? "text-yellow-500"
                        : request.status === "declined"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                  {request.status === "pending" && (
                    <div className="flex justify-center">
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded mr-1"
                        onClick={() => handleAction(request._id, "approved")}
                        disabled={isLoading}
                        style={{
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        Yes
                      </button>
                      <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-2 rounded mr-1"
                        onClick={() => handleAction(request._id, "inReview")}
                        disabled={isLoading}
                        style={{
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        Can Try
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                        onClick={() => handleAction(request._id, "declined")}
                        disabled={isLoading}
                        style={{
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        No, Sorry!
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequestsPage;
