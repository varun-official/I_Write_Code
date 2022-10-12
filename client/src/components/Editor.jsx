/** @format */

import React, { useEffect, useRef } from "react";

import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "codemirror/mode/go/go";
import "codemirror/mode/swift/swift";
import "codemirror/mode/php/php";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/keymap/sublime";
import "codemirror/addon/runmode/runmode";
import "./Editor.css";
import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange, lang }) => {
  const editorRef = useRef(null);

  const getThemeForLanguage = (lang) => {
    switch (lang) {
      case "cpp":
        return "clike";
      case "c":
        return "clike";
      case "java":
        return "clike";
      case "go":
        return "go";
      case "swift":
        return "swift";
      case "php":
        return "php";
      default:
        return "javascript";
    }
  };

  useEffect(() => {
          console.log(lang);
          editorRef.current = Codemirror.fromTextArea(
            document.getElementById("realTimeEditor"),
            {
              mode: { name: getThemeForLanguage(lang) },
              theme: "dracula",
              keyMap: "sublime",
              showHint: true,
              autoCloseTags: true,
              autoCloseBrackets: true,
              lineNumbers: true,
              lineWrapping: true,
              indentWithTabs: true,
            }
          );
  },[lang])

  useEffect(() => {
    async function init() {
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
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

      for (var i = 1; i < IDES.length; i++) {
        IDES[i].style.display = "none";
      }
    }

    init2();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code != null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return <textarea id="realTimeEditor"></textarea>;
};

export default Editor;
