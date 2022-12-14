/** @format */

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Split from "react-split";

import { Menu, MenuItem, MenuButton, MenuRadioGroup } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import { BsFillPlayFill } from "react-icons/bs";
import { BiRun } from "react-icons/bi";

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

  const [lang, setLang] = useState("javascript");
  const [theme, setTheme] = useState("3024-night");

  const [input, setInput] = useState("");
  const [output, setOuput] = useState("Waiting.....");
  const [isdisabled, setIsDisabled] = useState(false);

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
        const res = await axios.get(url);
        if (res?.data?.code) {
          codeRef.current = res.data.code;
          setLang(res.data.language);
        }
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
      language: lang,
    });
    toast.success("Code History saved.");
  };

  const runCodeOnline = async () => {
    setIsDisabled(true);
    setOuput("Running......");
    const url = process.env.REACT_APP_BACKEND_URL + `code/run`;
    const Result = await axios.post(url, {
      code: codeRef.current,
      language: lang,
      stdin: input,
    });
    var res =
      Result?.data?.stderr +
      (Result?.data?.signal ? Result?.data?.signal : "") +
      Result?.data?.stdout;
    setOuput(res);
    setIsDisabled(false);
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
        <div className="topBar">
          <div className="topBarLeft">
            <div className="topBarLeftItem">
              <h6>Language: </h6>
              <Menu menuButton={<MenuButton>{lang.toUpperCase()}</MenuButton>}>
                <MenuRadioGroup
                  value={lang}
                  onRadioChange={(e) => setLang(e.value)}
                >
                  <MenuItem type="radio" value="javascript">
                    JavaScript
                  </MenuItem>
                  <MenuItem type="radio" value="c++">
                    C++
                  </MenuItem>
                  <MenuItem type="radio" value="c">
                    C
                  </MenuItem>
                  <MenuItem type="radio" value="python">
                    Python
                  </MenuItem>
                  <MenuItem type="radio" value="go">
                    Go
                  </MenuItem>
                  <MenuItem type="radio" value="swift">
                    Swift
                  </MenuItem>
                  <MenuItem type="radio" value="php">
                    PHP
                  </MenuItem>
                </MenuRadioGroup>
              </Menu>
            </div>
            <div className="topBarLeftItem">
              <h6>Theme: </h6>
              <Menu
                className="langSelect"
                menuButton={<MenuButton>{theme.toUpperCase()}</MenuButton>}
              >
                <MenuRadioGroup
                  value={theme}
                  onRadioChange={(e) => setTheme(e.value)}
                >
                  <MenuItem type="radio" value="dracula">
                    Dracula
                  </MenuItem>
                  <MenuItem type="radio" value="3024-night">
                    3024-night
                  </MenuItem>
                  <MenuItem type="radio" value="rubyblue">
                    Rubyblue
                  </MenuItem>
                  <MenuItem type="radio" value="xq-dark">
                    Xq-dark
                  </MenuItem>
                  <MenuItem type="radio" value="nord">
                    nord
                  </MenuItem>
                  <MenuItem type="radio" value="neo">
                    Neo
                  </MenuItem>
                </MenuRadioGroup>
              </Menu>
            </div>
          </div>
          <button
            className="runBtn"
            disabled={isdisabled}
            onClick={runCodeOnline}
          >
            Run &nbsp;{!isdisabled ? <BsFillPlayFill /> : <BiRun />}
          </button>
        </div>
        <Split
          className="split"
          minSize={300}
          snapOffset={0}
          dragInterval={4}
          sizes={[80, 20]}
        >
          <div>
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => (codeRef.current = code)}
              lang={lang}
              theme={theme}
            />
          </div>
          <div className="inputOutput">
            <h6>Input</h6>
            <textarea
              className="inputOutputtextarea"
              cols="30"
              rows="13"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            ></textarea>
            <h6>Output</h6>
            <textarea
              className="inputOutputtextarea"
              cols="30"
              rows="17"
              value={output}
              disabled={true}
            ></textarea>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default EditorPage;
