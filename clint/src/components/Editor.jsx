/** @format */

import React, { useEffect } from "react";

import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import "./Editor.css";

const Editor = () => {
  useEffect(() => {
    async function init() {
      Codemirror.fromTextArea(document.getElementById("realTimeEditor"), {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
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

  return <textarea id="realTimeEditor"></textarea>;
};

export default Editor;
