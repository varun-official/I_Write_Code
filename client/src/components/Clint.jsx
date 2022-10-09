/** @format */

import React from "react";
import Avatar from "react-avatar";
import "./Clint.css";
const Clint = ({ Name }) => {
  return (
    <div className="clint">
      <Avatar name={Name} size="45" round="10px" />
      <h3>{Name}</h3>
    </div>
  );
};

export default Clint;
