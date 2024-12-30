import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    {
      name: "Manage",
      subMenu: [
        { name: "Clients", path: "/dashboard/clients" },
        { name: "Cases", path: "/dashboard/cases" },
        { name: "Appointments", path: "/dashboard/appointments" },
        { name: "Lawyer", path: "/dashboard/lawyer" },
      ],
    },
  ];

  return (
    <>
      <style>
        {`
          .navbar {
            height: 60px;
            background-color: #34495e;
            color: white;
            display: flex;
            align-items: center;
            padding: 0 20px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
          }
          .layout {
            display: flex;
            margin-top: 60px; /* Adjust to the navbar's height */
          }
          .sidebar {
            width: 240px;
            background-color: #2c3e50;
            height: calc(100vh - 60px); /* Full height minus navbar height */
            color: #fff;
            padding: 20px;
            position: fixed;
            top: 60px; /* Start below the navbar */
            left: 0;
          }
          .sidebar h2 {
            margin-bottom: 20px;
          }
          .sidebar ul {
            list-style: none;
            padding: 0;
          }
          .sidebar li {
            margin: 15px 0;
          }
          .sidebar a {
            color: #fff;
            text-decoration: none;
            display: block;
            padding: 10px;
            border-radius: 4px;
            transition: background-color 0.3s ease;
          }
          .sidebar a:hover {
            background-color: #34495e;
          }
          .sidebar h4 {
            margin-bottom: 10px;
          }
          .sidebar ul ul {
            padding-left: 15px;
          }
          .content {
            margin-left: 240px;
            padding: 20px;
            width: calc(100% - 240px);
          }
        `}
      </style>
      <div className="layout">
        <div className="sidebar">
          <h2>LawOffice</h2>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.subMenu ? (
                  <div>
                    <h4>{item.name}</h4>
                    <ul>
                      {item.subMenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link to={subItem.path}>{subItem.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link to={item.path}>{item.name}</Link>
                )}
              </li>
            ))}
            <li>
              <Link to="/dashboard/view-details" className="nav-link">
                <i className="fas fa-eye"></i>
                <span style={{ marginLeft: "10px" }}>View Details</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="content">
          {/* Main content will be rendered here */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
