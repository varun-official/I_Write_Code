/** @format */

import React, { useEffect,useRef } from "react";

import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import "./Editor.css";
import ACTIONS from "../Actions";

const Editor = ({ socketRef,roomId }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realTimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();

        if(origin!== 'setValue')
        {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code, 
            });
        }

      });
    }
    init();

    async function init2() {
      var IDES = document.querySelector(".CodeMirror, .cm-s-dracula");
      console.log(IDES);

      for (var i = 1; i < IDES.length; i++) {
        IDES[i].style.display = "none";
      }
    }

    init2();
  }, []);

  useEffect(() => {
    if(socketRef.current)
    {
              socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code != null) {
                  editorRef.current.setValue(code);
                }
              });
    } 

  },[socketRef.current])

  return <textarea id="realTimeEditor"></textarea>;
};

export default Editor;
