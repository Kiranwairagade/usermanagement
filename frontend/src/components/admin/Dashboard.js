import React from "react";
import "./Dashboard.css";
import Sidebar from "../common/Sidebar";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="user-management-container">
        <div className="user-management-content">
          <Sidebar />
          <div className="user-management-content-right">       
         <h4> Welcome to User management application.</h4>
          <h5> This application is designed to manage user permissions and access to CRUD operations for a particular Master Module.</h5>
          <h5> The application is built using React for the frontend and Node.js with dotnet for the backend.</h5>
          <h5> The application is designed to be user-friendly and easy to navigate.</h5>          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
