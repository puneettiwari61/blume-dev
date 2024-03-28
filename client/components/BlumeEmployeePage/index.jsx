import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom/cjs/react-router-dom";
import { toast } from "react-toastify";
import NameForm from "../NameForm";
// import { useLocation } from "react-router-dom/cjs/react-router-dom";

const BlumeEmployeePage = () => {
  // const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.currentUser);
  // const displayName = user?.firstName + user?.lastName;

  const [uploading, setUploading] = useState(false);
  const [areContactsMapped, setAreContactsMapped] = useState(false);
  const email = user?.email;
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const csvData = reader.result;

      setUploading(true);
      try {
        // Make a POST request to send the CSV file to the backend
        const newToken = localStorage.getItem("blumeToken") || "";
        axios.defaults.headers.Authorization = newToken;
        const response = await axios.post(
          "/api/v1/upload-linkendInCSV",
          { csvData, email }, // Include CSV data and user ID in the request body
          {
            headers: {
              "Content-Type": "application/json", // Set content type to JSON
            },
          }
        );
        dispatch({ type: "USER_LOGIN_SUCCESS", user: response.data.admin });

        console.log("CSV file uploaded successfully:", response.data);
        toast.success("LinkedIn contacts imported successfuly");
      } catch (error) {
        console.error("Error uploading CSV file:", error);
      }
      setUploading(false);
    };

    reader.readAsText(file); // Read the file as text
  };

  const handleOrganise = async () => {
    try {
      const newToken = localStorage.getItem("blumeToken") || "";
      axios.defaults.headers.Authorization = newToken;
      const response = await axios.get("/api/v1/organiseContacts");
      toast.success("Contacts mapped successfully");
      setAreContactsMapped(true);

      console.log(response, "response");
    } catch (error) {
      console.error("Error uploading CSV file:", error);
    }
  };

  if (!user?.firstName) {
    return <NameForm />;
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="max-w-md mx-auto bg-white p-8 border border-gray-300 rounded shadow-md">
        {!user?.hasLinkedInContacts ? (
          <>
            {" "}
            <h1 className="text-blue-500 text-3xl mb-2"> Blume Navigator</h1>
            <h2 className="text-blue-500 text-3xl mb-2">Welcome, {email}!</h2>
            <p className="text-gray-600 mb-6">
              Your Google contacts have been saved successfully.
            </p>
            <p className="text-gray-600 mb-6">
              You can now import your LinkedIn contacts by uploading a CSV file.
            </p>
            <label className="block mb-2">
              Import LinkedIn Contacts (CSV):
            </label>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            {uploading && (
              <p className="text-blue-500 mt-4">Uploading CSV file...</p>
            )}
          </>
        ) : (
          <>
            {" "}
            <h1 className="text-blue-500 text-3xl mb-2"> Blume Navigator</h1>
            <h2 className="text-blue-500 text-3xl mb-2">Welcome, {email}!</h2>
            <p className="text-gray-600 mb-6">
              You have already imported all your contacts
            </p>
            {areContactsMapped ? (
              <p className="text-gray-600 mb-6">
                Contacts are mapped successfully.
                <br /> Please click below to check your connection requests{" "}
                <br />
                <Link className="text-blue-500" to="/ConnectionRequestsPage">
                  Connections Requests
                </Link>
              </p>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Click below to proceed to Organise your contacts
                </p>
                <button onClick={handleOrganise} className="text-blue-500 mt-4">
                  Organise Contacts
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlumeEmployeePage;
