pliny.class({
  parent: "Primrose.Controls",
  name: "Surface",
  baseClass: "Primrose.Controls.BaseTextured",
  description: "Cascades through a number of options to eventually return a CanvasRenderingContext2D object on which one will perform drawing operations.",
  parameters: [{
    name: "options",
    type: "Primrose.Controls.Surface.optionsHash",
    optional: true,
    description: "Optional settings for creating the surface, including ID and Bounds. See [`Primrose.Controls.Surface.optionsHash`](#Primrose_Controls_Surface_optionsHash) for more information."
  }]
});

pliny.record({
  parent: "Primrose.Controls.Surface",
  name: "optionsHash",
  parameters: [{
    name: "id",
    type: "String or HTMLCanvasElement or CanvasRenderingContext2D",
    description: "Either an ID of an element that exists, an element, or the ID to set on an element that is to be created."
  }, {
    name: "bounds",
    type: "Primrose.Text.Rectangle",
    description: "The size and location of the surface to create."
  }]
});

var COUNTER = 0;

import { Texture } from "three/src/textures/Texture";
import isChrome from "../../flags/isChrome";
import BaseTextured from "./BaseTextured";
import Rectangle from "../Text/Rectangle";
import textured from "../../live-api/textured";
import quad from "../../live-api/quad";
import shell from "../../live-api/shell";
export default class Surface extends BaseTextured {

  static create() {
    return new Surface();
  }

  constructor(options) {



    pliny.event({ parent: "Primrose.Controls.Surface", name: "focus", description: "If the element is focusable, occurs when the user clicks on an element for the first time, or when a program calls the `focus()` method." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "blur", description: "If the element is focused (which implies it is also focusable), occurs when the user clicks off of an element, or when a program calls the `blur()` method." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "click", description: "Occurs whenever the user clicks on an element." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "keydown", description: "Occurs when the user pushes a key down while focused on the element." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "keyup", description: "Occurs when the user releases a key while focused on the element." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "paste", description: "Occurs when the user activates the clipboard's `paste` command while focused on the element." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "cut", description: "Occurs when the user activates the clipboard's `cut` command while focused on the element." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "copy", description: "Occurs when the user activates the clipboard's `copy` command while focused on the element." });
    pliny.event({ parent: "Primrose.Controls.Surface", name: "wheel", description: "Occurs when the user scrolls the mouse wheel while focused on the element." });



    options = Object.assign({}, {
      id: "Primrose.Controls.Surface[" + (COUNTER++) + "]",
      bounds: new Rectangle()
    }, options);
    super(null, options);
    this.isSurface = true;
    this.bounds = this.options.bounds;
    this.canvas = null;
    this.context = null;
    this._opacity = 1;

    pliny.property({
      parent: "Primrose.Controls.Surface",
      name: "focused",
      type: "Boolean",
      description: "A flag indicating if the element, or a child element within it, has received focus from the user."
    });
    this.focused = false;

    pliny.property({
      parent: "Primrose.Controls.Surface",
      name: "focusable",
      type: "Boolean",
      description: "A flag indicating if the element, or any child elements within it, is capable of receiving focus."
    });
    this.focusable = true;

    this.style = {};

    Object.defineProperties(this.style, {
      width: {
        get: () => {
          return this.bounds.width;
        },
        set: (v) => {
          this.bounds.width = v;
          this.resize();
        }
      },
      height: {
        get: () => {
          return this.bounds.height;
        },
        set: (v) => {
          this.bounds.height = v;
          this.resize();
        }
      },
      left: {
        get: () => {
          return this.bounds.left;
        },
        set: (v) => {
          this.bounds.left = v;
        }
      },
      top: {
        get: () => {
          return this.bounds.top;
        },
        set: (v) => {
          this.bounds.top = v;
        }
      },
      opacity: {
        get: () => {
          return this._opacity;
        },
        set: (v) => {
          this._opacity = v;
        }
      },
      fontSize: {
        get: () => {
          return this.fontSize;
        },
        set: (v) => {
          this.fontSize = v;
        }
      },
      backgroundColor: {
        get: () => {
          return this.backgroundColor;
        },
        set: (v) => {
          this.backgroundColor = v;
        }
      },
      color: {
        get: () => {
          return this.color;
        },
        set: (v) => {
          this.color = v;
        }
      }
    });


    if (this.options.id.isSurface) {
      throw new Error("Object is already a Surface. Please don't try to wrap them.");
    }
    else if (this.options.id instanceof CanvasRenderingContext2D) {
      this.context = this.options.id;
      this.canvas = this.context.canvas;
    }
    else if (this.options.id instanceof HTMLCanvasElement) {
      this.canvas = this.options.id;
    }
    else if (typeof (this.options.id) === "string" || this.options.id instanceof String) {
      this.canvas = document.getElementById(this.options.id);
      if (this.canvas === null) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = this.options.id;
      }
      else if (this.canvas.tagName !== "CANVAS") {
        this.canvas = null;
      }
    }

    if (this.canvas === null) {
      pliny.error({
        parent: "Primrose.Controls.Surface",
        name: "Invalid element",
        type: "Error",
        description: "If the element could not be found, could not be created, or one of the appropriate ID was found but did not match the expected type, an error is thrown to halt operation."
      });
      console.error(typeof (this.options.id));
      console.error(this.options.id);
      throw new Error(this.options.id + " does not refer to a valid canvas element.");
    }

    this.id = this.canvas.id;

    if (this.bounds.width === 0) {
      this.bounds.width = this.imageWidth;
      this.bounds.height = this.imageHeight;
    }

    this.imageWidth = this.bounds.width;
    this.imageHeight = this.bounds.height;

    if (this.context === null) {
      this.context = this.canvas.getContext("2d");
    }

    this.canvas.style.imageRendering = isChrome ? "pixelated" : "optimizespeed";
    this.context.imageSmoothingEnabled = false;
    this.context.textBaseline = "top";

    this._texture = null;
    this._material = null;
    this._environment = null;
  }

  addToBrowserEnvironment(env, scene) {
    this._environment = env;
    var geom = this.className === "shell" ? shell(3, 10, 10) : quad(2, 2);
    this._meshes[0] = textured(geom, this, {
      opacity: this._opacity
    });
    scene.add(this._meshes[0]);
    env.registerPickableObject(this._meshes[0]);
    return this._meshes[0];
  }

  invalidate(bounds) {
    var useDefault = !bounds;
    if (!bounds) {
      bounds = this.bounds.clone();
      bounds.left = 0;
      bounds.top = 0;
    }
    else if (bounds.isRectangle) {
      bounds = bounds.clone();
    }
    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i],
        overlap = bounds.overlap(child.bounds);
      if (overlap) {
        var x = overlap.left - child.bounds.left,
          y = overlap.top - child.bounds.top;
        this.context.drawImage(
          child.canvas,
          x, y, overlap.width, overlap.height,
          overlap.x, overlap.y, overlap.width, overlap.height);
      }
    }
    if (this._texture) {
      this._texture.needsUpdate = true;
    }
    if (this._material) {
      this._material.needsUpdate = true;
    }
    if (this.parent && this.parent.invalidate) {
      bounds.left += this.bounds.left;
      bounds.top += this.bounds.top;
      this.parent.invalidate(bounds);
    }
  }

  render() {
    this.invalidate();
  }

  get imageWidth() {
    return this.canvas.width;
  }

  set imageWidth(v) {
    this.canvas.width = v;
    this.bounds.width = v;
  }

  get imageHeight() {
    return this.canvas.height;
  }

  set imageHeight(v) {
    this.canvas.height = v;
    this.bounds.height = v;
  }

  get elementWidth() {
    return this.canvas.clientWidth * devicePixelRatio;
  }

  set elementWidth(v) {
    this.canvas.style.width = (v / devicePixelRatio) + "px";
  }

  get elementHeight() {
    return this.canvas.clientHeight * devicePixelRatio;
  }

  set elementHeight(v) {
    this.canvas.style.height = (v / devicePixelRatio) + "px";
  }

  get surfaceWidth() {
    return this.canvas.parentElement ? this.elementWidth : this.bounds.width;
  }

  get surfaceHeight() {
    return this.canvas.parentElement ? this.elementHeight : this.bounds.height;
  }

  get resized() {
    return this.imageWidth !== this.surfaceWidth ||
      this.imageHeight !== this.surfaceHeight;
  }

  resize() {
    this.setSize(this.surfaceWidth, this.surfaceHeight);
  }

  setSize(width, height) {
    const oldTextBaseline = this.context.textBaseline,
      oldTextAlign = this.context.textAlign;
    this.imageWidth = width;
    this.imageHeight = height;

    this.context.textBaseline = oldTextBaseline;
    this.context.textAlign = oldTextAlign;
  }

  get texture() {
    if (!this._texture) {
      this._texture = new Texture(this.canvas);
    }
    return this._texture;
  }

  get environment() {
    var head = this;
    while(head){
      if(head._environment){
        if(head !== this){
          this._environment = head._environment;
        }
        return this._environment;
      }
      head = head.parent;
    }
  }

  appendChild(child) {
    if (!(child.isSurface)) {
      throw new Error("Can only append other Surfaces to a Surface. You gave: " + child);
    }
    super.appendChild(child);
    this.invalidate();
  }

  mapUV(point) {
    if(point instanceof Array){
      return {
        x: point[0] * this.imageWidth,
        y: (1 - point[1]) * this.imageHeight
      };
    }
    else if(point.isVector2) {
      return {
        x: point.x * this.imageWidth,
        y: (1 - point.y) * this.imageHeight
      };
    }
  }

  unmapUV(point) {
    return [point.x / this.imageWidth, (1 - point.y / this.imageHeight)];
  }

  _findChild(x, y, thunk) {
    var here = this.inBounds(x, y),
      found = null;
    for (var i = this.children.length - 1; i >= 0; --i) {
      var child = this.children[i];
      if (!found && child.inBounds(x - this.bounds.left, y - this.bounds.top)) {
        found = child;
      }
      else if (child.focused) {
        child.blur();
      }
    }
    return found || here && this;
  }

  inBounds(x, y) {
    return this.bounds.left <= x && x < this.bounds.right && this.bounds.top <= y && y < this.bounds.bottom;
  }

  startPointer(x, y) {
    if (this.inBounds(x, y)) {
      var target = this._findChild(x, y, (child, x2, y2) => child.startPointer(x2, y2));
      if (target) {
        if (!this.focused) {
          this.focus();
        }
        this.emit("click", {
          target,
          x,
          y
        });
        if (target !== this) {
          target.startPointer(x - this.bounds.left, y - this.bounds.top);
        }
      }
      else if (this.focused) {
        this.blur();
      }
    }
  }

  movePointer(x, y) {
    var target = this._findChild(x, y, (child, x2, y2) => child.startPointer(x2, y2));
    if (target) {
      this.emit("move", {
        target,
        x,
        y
      });
      if (target !== this) {
        target.movePointer(x - this.bounds.left, y - this.bounds.top);
      }
    }
  }

  _forFocusedChild(name, evt) {
    var elem = this.focusedElement;
    if (elem && elem !== this) {
      elem[name](evt);
    }
  }

  startUV(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "startUV",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The pointer event to read"
      }],
      description: "Hooks up to the window's `mouseDown` and `touchStart` events, with coordinates translated to tangent-space UV coordinates, and propagates it to any of its focused children."
    });
    this._forFocusedChild("startUV", evt);
  }

  moveUV(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "moveUV",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The pointer event to read"
      }],
      description: "Hooks up to the window's `mouseMove` and `touchMove` events, with coordinates translated to tangent-space UV coordinates, and propagates it to any of its focused children."
    });
    this._forFocusedChild("moveUV", evt);
  }

  endPointer(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "endPointer",
      description: "Hooks up to the window's `mouseUp` and `toucheEnd` events and propagates it to any of its focused children."
    });
    this._forFocusedChild("endPointer", evt);
  }

  startUV2(point) {
    var p = this.mapUV(point);
    this.startPointer(p.x, p.y);
  }

  moveUV2(point) {
    var p = this.mapUV(point);
    this.movePointer(p.x, p.y);
  }



  focus() {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "focus",
      description: "If the control is focusable, sets the focus property of the control, does not change the focus property of any other control.",
      examples: [{
        name: "Focus on one control, blur all the rest",
        description: "When we have a list of controls and we are trying to track focus between them all, we must coordinate calls between `focus()` and `blur()`.\n\
\n\
  grammar(\"JavaScript\");\n\
  var ctrls = [\n\
  new Primrose.Controls.TextBox(),\n\
  new Primrose.Controls.TextBox(),\n\
  new Primrose.Controls.Button()\n\
  ];\n\
  \n\
  function focusOn(id){\n\
    for(var i = 0; i < ctrls.length; ++i){\n\
      var c = ctrls[i];\n\
      if(c.controlID === id){\n\
        c.focus();\n\
      }\n\
      else{\n\
        c.blur();\n\
      }\n\
    }\n\
  }"
      }]
    });
    if (this.focusable) {
      this.focused = true;
      this.emit("focus", {
        target: this
      });
    }
  }

  blur() {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "blur",
      description: "If the element is focused, unsets the focus property of the control and all child controls. Does not change the focus property of any parent or sibling controls.",
      examples: [{
        name: "Focus on one control, blur all the rest",
        description: "When we have a list of controls and we are trying to track focus between them all, we must coordinate calls between `focus()` and `blur()`.\n\
\n\
  grammar(\"JavaScript\");\n\
  var ctrls = [\n\
  new Primrose.Controls.TextBox(),\n\
  new Primrose.Controls.TextBox(),\n\
  new Primrose.Controls.Button()\n\
  ];\n\
  \n\
  function focusOn(id){\n\
    for(var i = 0; i < ctrls.length; ++i){\n\
      var c = ctrls[i];\n\
      if(c.controlID === id){\n\
        c.focus();\n\
      }\n\
      else{\n\
        c.blur();\n\
      }\n\
    }\n\
  }"
      }]
    });
    if (this.focused) {
      this.focused = false;
      for (var i = 0; i < this.children.length; ++i) {
        if (this.children[i].focused) {
          this.children[i].blur();
        }
      }
      this.emit("blur", {
        target: this
      });
    }
  }

  get theme() {
    pliny.property({
      parent: "Primrose.Controls.Surface",
      name: "theme",
      type: "Primrose.Text.Themes.*",
      description: "Get or set the theme used for rendering text on any controls in the control tree."
    });
    return null;
  }

  set theme(v) {
    for (var i = 0; i < this.children.length; ++i) {
      this.children[i].theme = v;
    }
  }

  get lockMovement() {
    pliny.property({
      parent: "Primrose.Controls.Surface",
      name: "lockMovement",
      type: "Boolean",
      description: "Recursively searches the deepest leaf-node of the control graph for a control that has its `lockMovement` property set to `true`, indicating that key events should not be used to navigate the user, because they are being interpreted as typing commands."
    });
    var lock = false;
    for (var i = 0; i < this.children.length && !lock; ++i) {
      lock = lock || this.children[i].lockMovement;
    }
    return lock;
  }

  get focusedElement() {
    pliny.property({
      parent: "Primrose.Controls.Surface",
      name: "focusedElement",
      type: "Primrose.Controls.Surface",
      description: "Searches the deepest leaf-node of the control graph for a control that has its `focused` property set to `true`."
    });
    var result = null,
      head = this;
    while (head && head.focused) {
      result = head;
      var children = head.children;
      head = null;
      for (var i = 0; i < children.length; ++i) {
        var child = children[i];
        if (child.focused) {
          head = child;
        }
      }
    }
    return result;
  }

  dispatchEvent2(evt) {
    switch(evt.type){
      case "pointerstart":
        this.startUV(evt.hit.uv);
      break;
      case "pointerend":
        this.endPointer(evt);
      break;
      case "pointermove":
      case "gazemove":
        this.moveUV(evt.hit.uv);
      break;
      case "gazecomplete":
        this.startUV(evt.hit.uv);
        setTimeout(() => this.endPointer(evt), 100);
      break;
    }
  }

  keyDown(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "keyDown",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The key event to read"
      }],
      description: "Hooks up to the window's `keyDown` event and propagates it to any of its focused children."
    });
    this._forFocusedChild("keyDown", evt);
  }

  keyUp(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "keyUp",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The key event to read"
      }],
      description: "Hooks up to the window's `keyUp` event and propagates it to any of its focused children."
    });
    this._forFocusedChild("keyUp", evt);
  }

  readClipboard(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "readClipboard",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The clipboard event to read"
      }],
      description: "Hooks up to the clipboard's `paste` event and propagates it to any of its focused children."
    });
    this._forFocusedChild("readClipboard", evt);
  }

  copySelectedText(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "copySelectedText",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The clipboard event to read"
      }],
      description: "Hooks up to the clipboard's `copy` event and propagates it to any of its focused children."
    });
    this._forFocusedChild("copySelectedText", evt);
  }

  cutSelectedText(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "cutSelectedText",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The clipboard event to read"
      }],
      description: "Hooks up to the clipboard's `cut` event and propagates it to any of its focused children."
    });
    this._forFocusedChild("cutSelectedText", evt);
  }

  readWheel(evt) {
    pliny.method({
      parent: "Primrose.Controls.Surface",
      name: "readWheel",
      parameters: [{
        name: "evt",
        type: "Event",
        description: "The wheel event to read"
      }],
      description: "Hooks up to the window's `wheel` event and propagates it to any of its focused children."
    });
    this._forFocusedChild("readWheel", evt);
  }
}