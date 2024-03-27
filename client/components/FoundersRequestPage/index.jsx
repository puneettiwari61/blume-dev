import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom/cjs/react-router-dom";

const FoundersRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((store) => store.currentUser);
  const displayName = user?.firstName + user?.lastName;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const newToken = localStorage.getItem("blumeToken") || "";

      axios.defaults.headers.Authorization = newToken;

      const response = await axios.get("/api/v1/founders/requests");
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto mt-8">
      <div className="text-center absolute top-3 right-5 flex flex-col items-start gap-2">
        {displayName || user?.email ? (
          <>
            <span className="font-bold">
              Welcome! {displayName || user?.email}
            </span>
            <span
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="font-bold text-blue-500 cursor-pointer"
            >
              Logout
            </span>
          </>
        ) : null}
      </div>
      <div className="text-center absolute top-3 left-5 flex flex-col items-start gap-2">
        <Link className="text-blue-500" to="/">
          {" "}
          Home{" "}
        </Link>
      </div>
      <h1 className="text-3xl font-semibold mb-4">My Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="border p-4 rounded-lg shadow-md mx-1"
              >
                <p className="text-xl font-semibold mb-2">
                  {request.requestedName}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {request.status === "pending" ? (
                    <span className="text-yellow-600">Pending</span>
                  ) : request.status === "accepted" ? (
                    <span className="text-green-600">Accepted</span>
                  ) : (
                    <span className="text-red-600">Declined</span>
                  )}
                </p>
                <p>
                  <strong>Context:</strong> {request.context}
                </p>
                <p>
                  <strong>Company Blurb:</strong> {request.companyBlurb}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FoundersRequestsPage;
