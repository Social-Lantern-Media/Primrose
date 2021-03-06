import { Vector3 } from "three/src/math/Vector3";

const POSITION = new Vector3(),
  START_POINT = new Vector3(),
  MAX_MOVE_DISTANCE = 5,
  MAX_MOVE_DISTANCE_SQ = MAX_MOVE_DISTANCE * MAX_MOVE_DISTANCE,
  TELEPORT_COOLDOWN = 250;

export default class Teleporter {
  constructor(env, ground) {

    this.enabled = true;
    this._environment = env;
    this._ground = ground;

    this._enter = this._enter.bind(this);
    this._exit = this._exit.bind(this);
    this._start = this._start.bind(this);
    this._move = this._move.bind(this);
    this._end = this._end.bind(this);

    ground.addEventListener("exit", this._enter);
    ground.addEventListener("enter", this._exit);

    ground.addEventListener("pointerstart", this._start);
    ground.addEventListener("gazestart", this._start);

    ground.addEventListener("pointermove", this._move);
    ground.addEventListener("gazemove", this._move);

    ground.addEventListener("pointerend", this._end);
    ground.addEventListener("gazecomplete", this._end);
  }

  _enter(evt) {
    if(this.enabled) {
      evt.pointer.disk.visible = false;
    }
  }

  _exit(evt) {
    if(this.enabled) {
      this._updatePosition(evt);
      evt.pointer.disk.visible = true;
    }
  }

  _start(evt) {
    if(this.enabled) {
      this._updatePosition(evt);
      START_POINT.copy(POSITION);
    }
  }

  _move(evt) {
    if(this.enabled) {
      this._updatePosition(evt);
      evt.pointer.moveTeleportPad(POSITION);
    }
  }

  _end(evt) {
    if(this.enabled) {
      this._updatePosition(evt);
      START_POINT.sub(POSITION);
      const len = START_POINT.lengthSq();
      if(len < 0.01){
        this._environment.teleport(POSITION);
      }
    }
  }

  _updatePosition(evt) {
    POSITION.copy(evt.hit.point)
      .sub(this._environment.input.head.position);

    var distSq = POSITION.x * POSITION.x + POSITION.z * POSITION.z;
    if (distSq > MAX_MOVE_DISTANCE_SQ) {
      var dist = Math.sqrt(distSq),
        factor = MAX_MOVE_DISTANCE / dist,
        y = POSITION.y;
      POSITION.y = 0;
      POSITION.multiplyScalar(factor);
      POSITION.y = y;
    }

    POSITION.add(this._environment.input.head.position);
  }
};