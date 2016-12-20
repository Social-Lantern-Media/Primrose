import Player from "../Replay/Player";
import VRDisplay from "./VRDisplay"

export default class MockVRDisplay extends VRDisplay {
  constructor(data) {
    super("MockVRDisplay", true);

    this._dataPack = {
      currentDisplay: this,
      currentEyeParams: {
        left: {
          fieldOfView: {
            downDegrees: null,
            leftDegrees: null,
            rightDegrees: null,
            upDegrees: null
          },
          renderWidth: null,
          renderHeight: null,
          offset: null
        },
        right: {
          fieldOfView: {
            downDegrees: null,
            leftDegrees: null,
            rightDegrees: null,
            upDegrees: null
          },
          renderWidth: null,
          renderHeight: null,
          offset: null
        }
      },
      currentPose: {
        orientation: null,
        position: null
      }
    };

    var timestamp = null;
    Object.defineProperties(this._dataPack.currentPose, {
      timestamp: {
        get: () => timestamp,
        set: (v) => timestamp = v
      },
      timeStamp: {
        get: () => timestamp,
        set: (v) => timestamp = v
      }
    });

    this._player = new Player(this._dataPack);
    this._player.load(data);
    this._player.update(0);

    this._startOn = null;
  }

  resetPose() {}

  _getImmediatePose() {
    return this._dataPack.currentPose;
  }

  getEyeParameters(side) {
    return this._dataPack.currentEyeParams[side];
  }

  requestAnimationFrame(thunk) {
    return window.requestAnimationFrame((t) => {
      if (this._startOn === null) {
        this._startOn = t;
      }
      this._player.update(t - this._startOn);
      thunk(t);
    });
  }
};