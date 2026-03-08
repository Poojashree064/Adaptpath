import React from "react";
import { Link } from "react-router-dom";
import "./auth.css";

function Dashboard() {
  return (
    <div className="dashboard-container">

      <h1>Dashboard</h1>
      <p>Hello, Student — quick overview.</p>

      <div className="dashboard-cards">

        {/* Diagnostic Test Card */}
        <div className="card">
          <h3>Diagnostic Test</h3>
          <p>Start your 100-question skill assessment.</p>
          <Link className="card-link" to="/diagnostic">
            → Start Diagnostic Test
          </Link>
        </div>

        {/* Practice Test Card */}
        <div className="card">
          <h3>Today's Practice</h3>
          <p>Start a short test to check your progress.</p>
          <Link className="card-link" to="/practice">
            → Go to practice test
          </Link>
        </div>

        {/* Recommended Topic Card */}
        <div className="card">
          <h3>Recommended Topic</h3>
          <p>Derivatives — basics</p>
          <Link className="card-link" to="/practice">
            → Study this topic
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
