import React, { useState } from "react";
import axios from "axios";
import Connect from "./Connect";
import { toast } from "react-toastify";

const EmployeeSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("displayName");
  const [searchResults, setSearchResults] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);

  const handleSearch = async () => {
    try {
      if (!searchQuery) {
        return;
      }
      const newToken = localStorage.getItem("blumeToken") || "";
      axios.defaults.headers.Authorization = newToken;
      const response = await axios.get("/api/v1/founders/search", {
        params: {
          [searchCriteria]: searchQuery, // Dynamically set the search criteria
        },
      });
      setSearchResults(response?.data?.results || []);
    } catch (error) {
      toast.error(error.response.data.message, { position: "top-center" });
      console.log("Error searching employees:", error.response.data.message);
    }
  };

  const handleConnectButton = (employee) => {
    setEmployeeId(employee?._id);
  };

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="flex mb-4 items-center">
        <select
          className="border border-gray-300 rounded px-4 py-2 mr-2 mb-4 text-xl"
          value={searchCriteria}
          onChange={(e) => {
            console.log(e.target.value, "e");
            setSearchCriteria(e.target.value);
          }}
        >
          <option value="displayName">Name</option>
          <option value="company">Company</option>
          <option value="position">Position</option>
        </select>
        <input
          type="text"
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
          placeholder={`Search by ${searchCriteria}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full`}
        style={{ cursor: searchQuery ? "pointer" : "not-allowed" }}
        onClick={handleSearch}
        disabled={!searchQuery}
      >
        Search
      </button>
      <div className="mt-8">
        {employeeId ? (
          <Connect employeeID={employeeId} />
        ) : searchResults.length ? (
          <table className="w-full border-collapse border border-gray-300">
            {/* Table header */}
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Company Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Designation
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Action
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {searchResults?.map((employee) => (
                <tr key={employee._id} className="bg-white hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.company}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.position}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button onClick={() => handleConnectButton(employee)}>
                      Connect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
};

export default EmployeeSearch;
