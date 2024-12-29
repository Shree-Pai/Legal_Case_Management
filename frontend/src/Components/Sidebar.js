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
        { name: "Lawyer", path: "/dashboard/lawyer"}
      ],
    },
  ];

  return (
    <div
      style={{
        width: "240px",
        backgroundColor: "#2c3e50",
        height: "100vh",
        color: "#fff",
        padding: "20px",
      }}
    >
      <h2>LawOffice</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {menuItems.map((item, index) => (
          <li key={index} style={{ margin: "15px 0" }}>
            {/* If item has a subMenu, render a sublist */}
            {item.subMenu ? (
              <div>
                <h4 style={{ color: "#fff", marginBottom: "10px" }}>{item.name}</h4>
                <ul style={{ listStyle: "none", paddingLeft: "15px" }}>
                  {item.subMenu.map((subItem, subIndex) => (
                    <li key={subIndex} style={{ margin: "10px 0" }}>
                      <Link
                        to={subItem.path}
                        style={{ color: "#fff", textDecoration: "none" }}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link
                to={item.path}
                style={{ color: "#fff", textDecoration: "none" }}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
