/** @format */

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import logo from "../assets/logo.png";
import "./EditorPage.css";
import { toast } from "react-hot-toast";
import Clint from "../components/Clint";
import Editor from "../components/Editor";
import { initSocket } from "../Socket";
import ACTIONS from "../Actions";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        navigate("/");
      }

      const featchcode = async () => {
        const url = process.env.REACT_APP_BACKEND_URL + `codehistory/${roomId}`;
        // const url =
        //   process.env.REACT_APP_BACKEND_URL +
        //   `codehistory/62895a63-fe91-461d-844b-ab645cc78655`;
        const res = await axios.get(url);
        if (res?.data?.code) codeRef.current = res.data.code;
      };
      featchcode();

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        userName: location.state?.userName,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, userName, socketId }) => {
          if (userName != location.state?.userName) {
            toast.success(`${userName} joined the room.`);
          }
          setUsers(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} disconnected from the room.`);
        setUsers((prev) => {
          return prev.filter((clint) => clint.socketId != socketId);
        });
      });
    };

    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();

        socketRef.current.off(ACTIONS.JOINED).disconnect();
        socketRef.current.off(ACTIONS.DISCONNECTED).disconnect();
      }
    };
  }, []);

  if (!location.state) {
    navigate("/");
  }

  const copyRoomId = async () => {
    try {
      console.log(roomId);
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id has been copied to clipboard.");
    } catch (error) {
      toast.error("Unable to copy Room Id");
    }
  };

  const saveCode = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + `codehistory/push`;

    const code = await axios.patch(url, {
      roomId,
      code: codeRef.current,
    });
    toast.success("Code History saved.");
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  return (
    <div className="editorHomeWrapper">
      <div className="leftWrapper">
        <div className="leftTop">
          <img src={logo} className="mainlogo" alt="logo" />
          <h2>Connected</h2>
          <div className="Clintsdisplay">
            {users.map((user) => (
              <Clint Name={user.userName} key={user.scoketId} />
            ))}
          </div>
        </div>
        <div className="leftBottom">
          <div className="leftBottomBtn">
            <button className="saveBtn" onClick={saveCode}>
              save
            </button>
          </div>

          <div className="leftBottomBtns">
            <button className="leftBtn copy" onClick={copyRoomId}>
              Copy Room Id
            </button>
            <button className="leftBtn leave" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>
      </div>
      <div className="rightWrapper">
        <div className="topBar"></div>
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => (codeRef.current = code)}
        />
      </div>
    </div>
  );
};

export default EditorPage;
