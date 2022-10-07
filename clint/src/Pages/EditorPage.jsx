/** @format */

import React, { useState,useRef, useEffect } from "react";
import logo from "../assets/logo.png";
import "./EditorPage.css";
import Clint from "../components/Clint";
import Editor from "../components/Editor";
import {initSocket} from "../Socket"

const EditorPage = () => {
  const socketRef = useRef(null)
  const [users, setUsers] = useState([
    { UserId: 1, UserName: "Varun" },
    { UserId: 2, UserName: "Vivek" },
    { UserId: 3, UserName: "Vivek" },
  ]);

  useEffect(()=>{

    const init = async () => {
     socketRef.current = await initSockets();
    }
    
    init()

  },[])

  return (
    <div className="editorHomeWrapper">
      <div className="leftWrapper">
        <div className="leftTop">
          <img src={logo} className="mainlogo" alt="logo" />
          <h2>Connected</h2>
          <div className="Clintsdisplay">
            {users.map((user) => (
              <Clint Name={user.UserName} key={user.UserId} />
            ))}
          </div>
        </div>
        <div className="leftBottom">
          <button className="leftBtn copy">Copy Room Id</button>
          <button className="leftBtn leave">Leave Room</button>
        </div>
      </div>
      <div className="rightWrapper">
        <Editor />
      </div>
    </div>
  );
};

export default EditorPage;
