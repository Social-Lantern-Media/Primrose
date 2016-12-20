pliny.class({
  parent: "Primrose.Input",
  name: "VR",
  baseClass: "Primrose.Input.PoseInputProcessor",
  description: "An input manager for gamepad devices.",
  parameters: [{
    name: "avatarHeight",
    type: "Number",
    description: "The default height to use for the user, if the HMD doesn't provide a stage transform."
  }]
});

const DEFAULT_POSE = {
    position: [0, 0, 0],
    orientation: [0, 0, 0, 1]
  };

import { Vector3 } from "three/src/math/Vector3";
import { Matrix4 } from "three/src/math/Matrix4";
import PoseInputProcessor from "./PoseInputProcessor";
import isChrome from "../../flags/isChrome";
import isiOS from "../../flags/isiOS";
import isMobile from "../../flags/isMobile";
import PointerLock from "../../util/PointerLock";
import Orientation from "../../util/Orientation";
import standardFullScreenBehavior from "../../util/standardFullScreenBehavior";
import standardLockBehavior from "../../util/standardLockBehavior";
import installPolyfills from "../Displays/install";
import StandardMonitorVRDisplay from "../Displays/StandardMonitorVRDisplay";
export default class VR extends PoseInputProcessor {

  static isStereoDisplay(display) {
    const leftParams = display.getEyeParameters("left"),
        rightParams = display.getEyeParameters("right");
    return !!(leftParams && rightParams);
  }

  constructor(options) {
    super("VR");

    this.options = options;
    this._requestPresent = (layers) => this.currentDevice.requestPresent(layers)
          .catch((exp) => console.warn("requstPresent", exp));

    this.displays = [];
    this._transformers = [];
    this.currentDeviceIndex = -1;
    this.movePlayer = new Matrix4();
    this.stage = null;
    this.lastStageWidth = null;
    this.lastStageDepth = null;
    this.isStereo = false;
    installPolyfills(options);
    this.ready = navigator.getVRDisplays()
      .then((displays) => {
        this.displays.push.apply(this.displays, displays);
        this.connect(0);
        return this.displays;
      });

    this.frameData = new VRFrameData();
  }

  getViews() {
    if(this.currentDevice) {
      var left = this.currentDevice.getEyeParameters("left"),
        right = this.currentDevice.getEyeParameters("right"),
        x = 0,
        output = [{
        projection: this.frameData.leftProjectionMatrix,
        view: this.frameData.leftViewMatrix,
        viewport: {
          left: 0,
          top: 0,
          width: left.renderWidth,
          height: left.renderHeight
        }
      }];

      if(right) {
        output.push({
          projection: this.frameData.rightProjectionMatrix,
          view: this.frameData.rightViewMatrix,
          viewport: {
            left: left.renderWidth,
            top: 0,
            width: right.renderWidth,
            height: right.renderHeight
          }
        });
      }

      return output;
    }
  }

  get isNativeMobileWebVR() {
    return !(this.currentDevice && this.currentDevice.isPolyfilled) && isChrome && isMobile;
  }

  connect(selectedIndex) {
    this.currentDevice = null;
    this.currentDeviceIndex = selectedIndex;
    if (0 <= selectedIndex && selectedIndex <= this.displays.length) {
      this.currentDevice = this.displays[selectedIndex];
      this.currentDevice.getFrameData(this.frameData);
      this.currentPose = this.frameData.pose;
      this.isStereo = VR.isStereoDisplay(this.currentDevice);
    }
  }

  requestPresent(opts) {
    if (!this.currentDevice) {
      return Promise.reject("No display");
    }
    else {
      let layers = opts,
        elem = opts[0].source;

      if (!(layers instanceof Array)) {
        layers = [layers];
      }

      // A hack to deal with a bug in the current build of Chromium
      if (this.isNativeMobileWebVR && this.isStereo) {
        layers = layers[0];
      }

      const rp = this._requestPresent;
      var promise = null;
      if(isiOS){
        promise = rp(layers);
      }
      else if(this.currentDevice.capabilities.hasExternalDisplay){
        // PCs with HMD should also make the browser window on the main
        // display full-screen, so we can then also lock pointer.
        promise = standardFullScreenBehavior(elem)
          .then(() => rp(layers));
      }
      else {
        promise = rp(layers).then(standardLockBehavior);
      }
      return promise;
    }
  }

  cancel() {
    let promise = null;
    if (this.isPresenting) {
      promise = this.currentDevice.exitPresent();
      this.currentDevice = null;
      this.currentDeviceIndex = -1;
    }
    else {
      promise = Promise.resolve();
    }

    if (this.isNativeMobileWebVR) {
      promise = promise.then(Orientation.unlock);
    }

    return promise
      .then(PointerLock.exit)
      .catch((exp) => console.warn(exp))
      .then(() => this.connect(0));
  }

  zero() {
    super.zero();
    if (this.currentDevice) {
      this.currentDevice.resetPose();
    }
  }

  update(dt) {
    var x, z, stage;

    if (this.currentDevice) {
      this.currentDevice.getFrameData(this.frameData);
      this.currentPose = this.frameData.pose;
      stage = this.currentDevice.stageParameters;
    }
    else{
      stage = null;
    }

    super.update(dt);

    if (stage) {
      this.movePlayer.fromArray(stage.sittingToStandingTransform);
      x = stage.sizeX;
      z = stage.sizeZ;
    }
    else {
      this.movePlayer.makeTranslation(0, this.options.avatarHeight, 0);
      x = 0;
      z = 0;
    }

    var s = {
      matrix: this.movePlayer,
      sizeX: x,
      sizeZ: z
    };

    if (!this.stage || s.sizeX !== this.stage.sizeX || s.sizeZ !== this.stage.sizeZ) {
      this.stage = s;
    }
  }

  get hasStage() {
    return this.stage && this.stage.sizeX * this.stage.sizeZ > 0;
  }

  submitFrame() {
    if (this.currentDevice && this.currentDevice.isPresenting) {
      this.currentDevice.submitFrame();
    }
  }

  get canMirror() {
    return this.currentDevice && this.currentDevice.capabilities.hasExternalDisplay;
  }

  get isPolyfilled() {
    return this.currentDevice && this.currentDevice.isPolyfilled;
  }

  get isPresenting() {
    return this.currentDevice && this.currentDevice.isPresenting;
  }

  get hasOrientation() {
    return this.currentDevice && this.currentDevice.capabilities.hasOrientation;
  }

  get currentCanvas() {
    if(this.isPresenting) {
      var layers = this.currentDevice.getLayers();
      if(layers.length > 0){
        return layers[0].source;
      }
    }
    return null;
  }
}