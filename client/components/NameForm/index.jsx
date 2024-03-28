import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const NameForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState({});
  const { user } = useSelector((store) => store.currentUser);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrors({
        firstName: !firstName.trim() ? "First name is required" : "",
        lastName: !lastName.trim() ? "Last name is required" : "",
      });
      return;
    }
    const newToken = localStorage.getItem("blumeToken") || "";
    axios.defaults.headers.Authorization = newToken;
    const response = await axios.post("/api/v1/admin/nameForm", {
      firstName,
      lastName,
    });
    console.log(response, "response");
    // Form is valid, handle submission
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    // Reset form fields and errors
    // setFirstName("");
    // setLastName("");
    setErrors({});
    dispatch({ type: "USER_UPDATE", user: { firstName, lastName } });
    toast.success("Name updated Successfully");
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="max-w-md mx-auto bg-white p-8 border border-gray-300 rounded shadow-md">
        <h1 className="text-blue-500 text-3xl mb-2"> Blume Navigator</h1>
        <h2 className="text-blue-500 text-3xl mb-2">Welcome, {user?.email}!</h2>
        <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-bold mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className={`border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-md px-4 py-2 focus:outline-none focus:border-blue-500`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-bold mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className={`border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-md px-4 py-2 focus:outline-none focus:border-blue-500`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameForm;
