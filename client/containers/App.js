import React, { Component, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Route } from "react-router-dom";
// import '../scss/index.scss';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../index.css";

import HomePage from "../components/HomePage";
import SeedPage from "../components/Seed";
import Contacts from "../components/GoogleAuth";
import BlumeEmployeeLogin from "../components/BlumeEmployeeLogin";
import BlumeEmployeePage from "../components/BlumeEmployeePage";
import FoundersLogin from "../components/FoundersLogin";
import axios from "axios";
import ConnectionRequestsPage from "../components/ConnectionRequestsPage";
import FoundersRequestsPage from "../components/FoundersRequestPage";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("blumeToken") || "";
    if (token) {
      getCurrentUser();
    }
  }, []);

  const getCurrentUser = async () => {
    const newToken = localStorage.getItem("blumeToken") || "";
    axios.defaults.headers.Authorization = newToken;
    const getUser = await axios.get("/api/v1/founders/me");
    dispatch({ type: "USER_LOGIN_SUCCESS", user: getUser.data.user });
  };

  return (
    <>
      {" "}
      <div className="mt-40">
        <Route exact path="/" component={HomePage} />
        <Route exact path="/seed" component={SeedPage} />
        <Route exact path="/contacts" component={Contacts} />
        <Route
          exact
          path="/blumeEmployeeLogin"
          component={BlumeEmployeeLogin}
        />
        <Route exact path="/blumeEmployeePage" component={BlumeEmployeePage} />
        <Route exact path="/foundersLogin" component={FoundersLogin} />
        <Route
          exact
          path="/connectionRequestsPage"
          component={ConnectionRequestsPage}
        />
        <Route
          exact
          path="/founders/connectionRequestsPage"
          component={FoundersRequestsPage}
        />
      </div>
      <ToastContainer />
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.user,
  };
};

export default connect(mapStateToProps)(App);
