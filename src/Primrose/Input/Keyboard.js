pliny.class({
  parent: "Primrose.Input",
    name: "Keyboard",
    baseClass: "Primrose.Input.InputProcessor",
    description: "| [under construction]",
    parameters: [{
      name: "",
      type: "",
      description: ""
    }, {
      name: "",
      type: "",
      description: ""
    }, {
      name: "",
      type: "",
      description: ""
    }, {
      name: "",
      type: "",
      description: ""
    }]
});

import InputProcessor from "./InputProcessor";
import isFirefox from "../../flags/isFirefox";
import isChrome from "../../flags/isChrome";
import isIE from "../../flags/isIE";
import isOpera from "../../flags/isOpera";
import isSafari from "../../flags/isSafari";
import isMacOS from "../../flags/isMacOS";
import Windows from "../Text/OperatingSystems/Windows";
import macOS from "../Text/OperatingSystems/macOS";
import CodePages from "../Text/CodePages";
export default class Keyboard extends InputProcessor {
  constructor(input, commands) {
    super("Keyboard", commands);

    this._operatingSystem = null;
    this.browser = isChrome ? "CHROMIUM" : (isFirefox ? "FIREFOX" : (isIE ? "IE" : (isOpera ? "OPERA" : (isSafari ? "SAFARI" : "UNKNOWN"))));
    this._codePage = null;
  }

  dispatchEvent(evt) {
    this.setButton(evt.keyCode, evt.type === "keydown");
  }

  doTyping(elem, evt) {
    if (elem && elem.execCommand && this.operatingSystem && this.browser && this.codePage) {
      var oldDeadKeyState = this.operatingSystem._deadKeyState,
        cmdName = this.operatingSystem.makeCommandName(evt, this.codePage);
      if (elem.execCommand(this.browser, this.codePage, cmdName)) {
        evt.preventDefault();
      }
      if (this.operatingSystem._deadKeyState === oldDeadKeyState) {
        this.operatingSystem._deadKeyState = "";
      }
    }
  }

  get operatingSystem() {
    return this._operatingSystem;
  }

  set operatingSystem(os) {
    this._operatingSystem = os || (isMacOS ? macOS : Windows);
  }

  get codePage() {
    return this._codePage;
  }

  set codePage(cp) {
    var key,
      code,
      char,
      name;
    this._codePage = cp;
    if (!this._codePage) {
      var lang = (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        navigator.userLanguage ||
        navigator.browserLanguage;

      if (!lang || lang === "en") {
        lang = "en-US";
      }

      for (key in CodePages) {
        cp = CodePages[key];
        if (cp.language === lang) {
          this._codePage = cp;
          break;
        }
      }

      if (!this._codePage) {
        this._codePage = CodePages.EN_US;
      }
    }
  }
}