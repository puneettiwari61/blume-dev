import React, { Component } from "react";
import EmployeeSearch from "./EmplpoyeesSearch";
import { Link } from "react-router-dom/cjs/react-router-dom";
import { useSelector } from "react-redux";

const HomePage = () => {
  const { user } = useSelector((store) => store.currentUser);
  console.log(user, "user");
  const displayName = user?.firstName + user?.lastName;
  return (
    <div>
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
        ) : (
          <>
            {" "}
            <Link to="/foundersLogin">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Users Login
              </button>
            </Link>
            <Link to="/blumeEmployeeLogin">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Admin Login
              </button>
            </Link>
          </>
        )}
      </div>
      <div>
        <p className="text-blue-500 text-4xl text-center">Blume Navigator</p>
        <p className="text-gray-500 text-3xl text-center">
          Find partners in Blume's network
        </p>
      </div>

      <EmployeeSearch />
    </div>
  );
};

export default HomePage;
