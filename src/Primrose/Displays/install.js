import frameDataFromPose from "./frameDataFromPose";
import CardboardVRDisplay from "./CardboardVRDisplay";
import MockVRDisplay from "./MockVRDisplay";
import StandardMonitorVRDisplay from "./StandardMonitorVRDisplay";
import VRDisplay from "./VRDisplay";
import VRFrameData from "./VRFrameData";

import isMobile from "../../flags/isMobile";
import isGearVR from "../../flags/isGearVR";
import isiOS from "../../flags/isiOS";

import FullScreen from "../../util/FullScreen";

import getObject from "../HTTP/getObject";

const hasNativeWebVR = "getVRDisplays" in navigator,
  allDisplays = [],
  isCardboardCompatible = isMobile && !isGearVR;

let polyFillDevicesPopulated = false,
  standardMonitorPopulated = false;

function getPolyfillDisplays(options) {
  if (!polyFillDevicesPopulated) {
    if (isCardboardCompatible || options.FORCE_ENABLE_VR) {
      allDisplays.push(new CardboardVRDisplay(options));
    }

    polyFillDevicesPopulated = true;
  }

  return new Promise(function(resolve, reject) {
    try {
      resolve(allDisplays);
    } catch (e) {
      reject(e);
    }
  });
}

function installPolyfill(options){
  if (hasNativeWebVR) {
    console.log("don't need to install Polyfill");
  }
  else {
    // Provide navigator.getVRDisplays.
    navigator.getVRDisplays = getPolyfillDisplays.bind(window, options);

    // Provide the VRDisplay object.
    window.VRDisplay = VRDisplay;
  }
}

function installStandardMonitor(options) {
  if(standardMonitorPopulated || isGearVR){
    console.log("don't need to install standard monitor");
  }
  else {
    var oldGetVRDisplays = navigator.getVRDisplays;
    navigator.getVRDisplays = function () {
      return oldGetVRDisplays.call(navigator)
        .then((displays) => {
          var created = false;
          for(var i = 0; i < displays.length && !created; ++i){
            var dsp = displays[i];
            created = dsp instanceof StandardMonitorVRDisplay;
          }
          if (!created) {
            if(options && options.defaultFOV) {
              StandardMonitorVRDisplay.DEFAULT_FOV = options.defaultFOV;
            }
            displays.unshift(new StandardMonitorVRDisplay(displays[0]));
          }
          return displays;
        });
    };

    standardMonitorPopulated = true;
  }
}

function installMockDisplay(options) {
  var data = options && options.replayData;
  if(!data){
    console.log("don't need to install Mock VR Display");
  }
  else {
    var oldGetVRDisplays = navigator.getVRDisplays;
    navigator.getVRDisplays = () => oldGetVRDisplays.call(navigator)
      .then((displays) => {
        const mockDeviceExists = displays
          .map((d) => d instanceof MockVRDisplay)
          .reduce((a, b) => a || b, false);

        if (mockDeviceExists) {
          return displays;
        }
        else {
          var done = (obj) => {
            displays.push(new MockVRDisplay(obj));
            resolve(displays);
          };

          if (typeof data === "object") {
            return Promise.resolve(data);
          }
          else if (/\.json$/.test(data)) {
            return getObject(data);
          }
          else {
            return Promise.resolve(JSON.parse(data));
          }
        }
      });
  }
}

function upgrade1_0_to_1_1(){

  // Provide navigator.vrEnabled.
  if("vrEnabled" in navigator) {
    console.log("don't need to install vrEnabled.");
  }
  else {
    Object.defineProperty(navigator, "vrEnabled", {
      get: function () {
        return hasNativeWebVR || isCardboardCompatible() &&
          (FullScreen.available || isiOS); // just fake it for iOS
      }
    });
  }

  // Put a shim in place to update the API to 1.1 if needed.
  if ("VRFrameData" in window) {
    console.log("don't need to install VRFrameData");
  }
  else {
    // Provide the VRFrameData object.
    window.VRFrameData = VRFrameData;

    // A lot of Chrome builds don't have depthNear and depthFar, even
    // though they're in the WebVR 1.0 spec. Patch them in if they're not present.
    if(!("depthNear" in window.VRDisplay.prototype)) {
      window.VRDisplay.prototype.depthNear = 0.01;
    }

    if(!("depthFar" in window.VRDisplay.prototype)) {
      window.VRDisplay.prototype.depthFar = 10000.0;
    }

    window.VRDisplay.prototype.getFrameData = function(frameData) {
      return frameDataFromPose(frameData, this.getPose(), this);
    };
  }
}

export default function install(options) {
  options = Object.assign({
      // Forces availability of VR mode, even for non-mobile devices.
      FORCE_ENABLE_VR: false
    }, options);

  installPolyfill(options);
  installStandardMonitor(options);
  installMockDisplay(options);
  upgrade1_0_to_1_1();
};