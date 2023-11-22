let paragraph = document.getElementById("screen");

// paragraph.requestPointerLock();
let mousePosX = 0,
  mousePosY = 0;

window.addEventListener("mousemove", function (event) {
  var mouse = {
    x: event.clientX,
    y: event.clientY,
  };
  mousePosX = event.clientX;
  mousePosY = event.clientY;
  // console.log(mouse.x, mouse.y);
});

var Key = {
  _pressed: {},

  JUMP: 32,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  LEFTSHIFT: 16,
  X: 88,
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  R: 82,

  isDown: function (keyCode) {
    return this._pressed[keyCode];
  },

  onKeyDown: function (event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyUp: function (event) {
    delete this._pressed[event.keyCode];
  },
};
window.addEventListener(
  "keyup",
  function (event) {
    Key.onKeyUp(event);
  },
  false
);
window.addEventListener(
  "keydown",
  function (event) {
    Key.onKeyDown(event);
  },
  false
);

let Screen = {
  screenArray: [],
  screenString: "",
  meshes: new Map(),
  meshesLoaded: new Map(),
  colorArray: [],
  screenWidth: 0,
  screenHeight: 0,
  angle: 90,
  fov: 0,
  aspectRatio: 0,
  zFar: 1000,
  zNear: 0.1,
  zQ: 0,
  projMat: new Mat4(),
  elapsedTime: 0,

  vCamera: new Vec3(0, 0, -3),
  upward: new Vec3(0, -1, 0),
  vUp: new Vec3(0, -1, 0),
  vTarget: new Vec3(0, 0, 1),
  matCameraRot: new Mat4(),
  vLookDir: new Vec3(0, 0, -1),
  matCamera: new Mat4(),

  lightPos: new Vec3(),
  lightDir: new Vec3(0, 0, 1),
  lightColor: new Vec3(255, 255, 255),
  ambient: 0.9,
  diff: 0.5,

  mousePosX: mousePosX,
  mousePosY: mousePosY,
  lastMousePosX: mousePosX,
  lastMousePosY: mousePosY,
  mouseXOffset: 0,
  mouseYOffset: 0,
  sensitivity: 0.1,
  yaw: 0,
  pitch: 0,

  changeCharSize: function () {
    const screenWidth =
      window.inneroloWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const screenHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    let pixel;

    if (
      (screenWidth - 10) / this.screenWidth >
      (screenHeight - 10) / this.screenHeight
    )
      pixel = Math.floor((screenHeight - 10) / this.screenHeight);
    else pixel = Math.floor((screenHeight - 10) / this.screenHeight);
    paragraph.style.fontSize = pixel.toString().concat("px");
    // paragraph.style.fontSize = "5px";
  },

  setProjectionMatrix() {
    this.projMat.matrix = [
      // [this.aspectRatio * this.fov, 0, 0, 0],
      // [0, this.fov, 0, 0],
      // [0, 0, this.zQ, 1],
      // [0, 0, -this.zNear, 0]
      [this.aspectRatio * this.fov, 0, 0, 0],
      [0, this.fov, 0, 0],
      [0, 0, this.zQ, -this.zNear],
      [0, 0, 1, 0],
    ];
  },

  init: function (width, height) {
    this.screenWidth = width;
    this.screenHeight = height;

    this.aspectRatio = this.screenHeight / this.screenWidth;
    this.fov = 1 / Math.tan((this.angle / 360) * Math.PI);
    this.zQ = this.zFar / (this.zFar - this.zNear);

    this.setProjectionMatrix();

    for (let i = 0; i < this.screenHeight; i++) {
      let newArray = [];
      let newColorArray = [];
      for (let j = 0; j < this.screenWidth; j++) {
        newArray.push(0);
        newColorArray.push(new Vec3(0, 0, 0));
      }
      this.screenArray.push(newArray);
      this.colorArray.push(newColorArray);
    }

    window.addEventListener("resize", this.changeCharSize);
    this.changeCharSize();
  },

  translateMesh: function (name, transVec) {
    let newMesh = new Mesh();
    for (let i = 0; i < this.meshes.get(name).triangles.length; i++) {
      let newTri = new Triangle();
      this.meshes.get(name).triangles[i].points[0].x += transVec.x;
      this.meshes.get(name).triangles[i].points[0].y += transVec.y;
      this.meshes.get(name).triangles[i].points[0].z += transVec.z;
      this.meshes.get(name).triangles[i].points[1].x += transVec.x;
      this.meshes.get(name).triangles[i].points[1].y += transVec.y;
      this.meshes.get(name).triangles[i].points[1].z += transVec.z;
      this.meshes.get(name).triangles[i].points[2].x += transVec.x;
      this.meshes.get(name).triangles[i].points[2].y += transVec.y;
      this.meshes.get(name).triangles[i].points[2].z += transVec.z;
      newMesh.triangles.push(newTri);
    }
    return newMesh;
  },

  doGet: function (path, callback, name) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          // console.log(xhr.responseText);
          // console.log(name);
          callback(xhr.responseText, name);
          // Screen.meshes.set(name, callback(xhr.responseText));
        } else {
          alert("file is not working bruhhh");
        }
      }
    };
    xhr.open("GET", path, false);
    xhr.send();
  },

  parseObjFile: function (fileString, name) {
    let lines = [];
    lines = fileString.split("\n");
    let vertices = [];
    let newMesh = new Mesh();
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let words = [];
      words = line.split(" ");
      // console.log(words[0]);
      if (words[0] == "v") {
        vertices.push(
          new Vec3(
            parseFloat(words[1]),
            parseFloat(words[2]),
            parseFloat(words[3])
          )
        );
      } else if (words[0] == "f") {
        newMesh.triangles.push(
          new Triangle(
            vertices[words[1] - 1],
            vertices[words[2] - 1],
            vertices[words[3] - 1]
          )
        );
      }
    }
    // console.log(newMesh.triangles.length);
    Screen.meshes.set(name, newMesh);
  },

  loadMeshFromArray: function (coords, name) {
    let newMesh = new Mesh();
    this.meshesLoaded.set(name, false);
    for (let i = 0; i < coords.length; i++) {
      let newTri = new Triangle(
        new Vec3(coords[i][0][0], coords[i][0][1], coords[i][0][2]),
        new Vec3(coords[i][1][0], coords[i][1][1], coords[i][1][2]),
        new Vec3(coords[i][2][0], coords[i][2][1], coords[i][2][2])
      );
      newMesh.triangles.push(newTri);
    }
    this.meshes.set(name, newMesh);
    this.meshesLoaded.set(name, true);
    // console.log(this.meshes);
  },

  loadMesh: function (objFilePath, name) {
    this.doGet(objFilePath, this.parseObjFile, name);
  },

  drawMesh: function (name) {
    let trianglesToSort = [];
    // trianglesToSort = [];
    let fTheta = 0;
    // let fTheta = this.elapsedTime;
    let matRotZ = new Mat4();
    matRotZ = MakeRotateZAxis(fTheta);
    // matRotZ = MakeRotate(new Vec3(0, 0, 1), fTheta);

    let matRotX = new Mat4();
    matRotX = MakeRotateXAxis(fTheta * 0.5);

    let matTrans = MakeTranslate(new Vec3(0.0, 0.0, 8.0));

    let model = new Mat4();
    model.setIdentity();
    model = MultiplyMatMat(matRotX, matRotZ);
    model = MultiplyMatMat(matTrans, model);
    // console.log(model);

    for (let i = 0; i < this.meshes.get(name).triangles.length; i++) {
      let triProjected = new Triangle();
      let triTransformed = new Triangle();
      let triView = new Triangle();

      let normal = new Vec3();

      // console.log(this.meshes.get(name).triangles[i].points[0]);
      // console.log(this.meshes.get(name).triangles[i].points[1]);
      // console.log(this.meshes.get(name).triangles[i].points[2]);
      triTransformed.points[0] = MultiplyVecMat(
        this.meshes.get(name).triangles[i].points[0],
        model
      );
      triTransformed.points[1] = MultiplyVecMat(
        this.meshes.get(name).triangles[i].points[1],
        model
      );
      triTransformed.points[2] = MultiplyVecMat(
        this.meshes.get(name).triangles[i].points[2],
        model
      );

      normal = getNormal(triTransformed);

      let lightDot = dot(normalize(this.lightDir), normal);
      let shade = 220 * lightDot + 35;

      // console.log(shade);

      if (dot(normal, vec3Sub(this.vCamera, triTransformed.points[0])) < 0) {
        // console.log("draw");
        // console.log(triTransformed.points[0].z);
        triView.points[0] = MultiplyVecMat(
          triTransformed.points[0],
          this.matView
        );
        triView.points[1] = MultiplyVecMat(
          triTransformed.points[1],
          this.matView
        );
        triView.points[2] = MultiplyVecMat(
          triTransformed.points[2],
          this.matView
        );

        // console.log(triView);

        triProjected.points[0] = MultiplyVecMat(
          triView.points[0],
          this.projMat
        );
        triProjected.points[1] = MultiplyVecMat(
          triView.points[1],
          this.projMat
        );
        triProjected.points[2] = MultiplyVecMat(
          triView.points[2],
          this.projMat
        );

        // triProjected.points[0] = MultiplyVecMat(triTransformed.points[0], this.projMat);
        // triProjected.points[1] = MultiplyVecMat(triTransformed.points[1], this.projMat);
        // triProjected.points[2] = MultiplyVecMat(triTransformed.points[2], this.projMat);

        // console.log(triProjected.points[0].z);

        triProjected = translateTriangle(triProjected, new Vec3(1, 1, 0));
        triProjected = scaleTriToScreen(
          triProjected,
          this.screenWidth,
          this.screenHeight
        );

        // console.log(shade);
        triProjected.shade = Math.floor(Math.abs(shade));

        trianglesToSort.push(triProjected);
      }
    }

    trianglesToSort.sort((a, b) => {
      aZMid = (a.points[0].z + a.points[1].z + a.points[2].z) / 3;
      bZMid = (b.points[0].z + b.points[1].z + b.points[2].z) / 3;
      // console.log(a, b);
      return bZMid - aZMid;
    });

    for (let i = 0; i < trianglesToSort.length; i++) {
      this.drawFilledTriangle(
        trianglesToSort[i],
        1,
        new Vec3(
          trianglesToSort[i].shade,
          trianglesToSort[i].shade,
          trianglesToSort[i].shade
        )
      );
    }
  },

  draw: function (p, i, color = new Vec3(255, 255, 255)) {
    p.floor();
    if (
      0 < p.x &&
      p.x < this.screenWidth - 1 &&
      0 < p.y &&
      p.y < this.screenHeight - 1
    ) {
      this.colorArray[p.y][p.x] = color;
      this.screenArray[p.y][p.x] = i;
    }
  },

  drawLine: function (p1, p2, i, color = new Vec3(255, 255, 255)) {
    let ydiff = p2.y - p1.y,
      xdiff = p2.x - p1.x,
      m = ydiff / xdiff;
    if (xdiff != 0 && (m >= 1 || m <= -1) && ydiff > 0) {
      // console.log("a");
      for (let y = p1.y; y < p2.y; y++) {
        // console.log("a");
        x = (y + m * p1.x - p1.y) / m;
        this.draw(new Vec2(Math.floor(x), y), i, color);
      }
    } else if (m < 1 && m > -1 && xdiff > 0) {
      for (let x = p1.x; x < p2.x; x++) {
        y = m * (x - p1.x) + p1.y;
        this.draw(new Vec2(x, Math.floor(y)), i, color);
      }
    } else if (xdiff != 0 && (m >= 1 || m <= -1) && ydiff < 0) {
      // console.log("a");
      for (let y = p2.y; y < p1.y; y++) {
        x = (y + m * p1.x - p1.y) / m;
        this.draw(new Vec2(Math.floor(x), y), i, color);
      }
    } else if (m < 1 && m > -1 && xdiff < 0) {
      for (let x = p2.x; x < p1.x; x++) {
        y = m * (x - p1.x) + p1.y;
        this.draw(new Vec2(x, Math.floor(y)), i, color);
      }
    } else if (m == 0 && xdiff > 0) {
      for (let x = p1.x; x < p2.x; x++) {
        this.draw(new Vec2(x, p1.y), i, color);
      }
    } else if (m == 0 && xdiff < 0) {
      for (let x = p2.x; x < p1.x; x++) {
        this.draw(new Vec2(x, p1.y), i, color);
      }
    } else if (xdiff == 0 && ydiff > 0) {
      // console.log("a");
      for (let y = p1.y; y < p2.y; y++) {
        // console.log("a");
        this.draw(new Vec2(p1.x, y), i, color);
      }
    } else if (xdiff == 0 && ydiff < 0) {
      // console.log("b");
      for (let y = p2.y; y < p1.y; y++) {
        this.draw(new Vec2(p1.x, y), i, color);
      }
    } else if (xdiff == 0 && ydiff == 0) {
      this.draw(new Vec2(p1.x, p1.y), i, color);
    }
  },

  drawTriangle: function (triangle, i, color = new Vec3(255, 255, 255)) {
    // console.log(triangle.points[0].x, triangle.points[0].y, triangle.points[0].z);
    this.drawLine(triangle.points[0], triangle.points[1], i, color);
    this.drawLine(triangle.points[1], triangle.points[2], i, color);
    this.drawLine(triangle.points[2], triangle.points[0], i, color);
  },

  drawFilledTriangle: function (triangle, i, color = new Vec3(255, 255, 255)) {
    let p1 = triangle.points[0];
    let p2 = triangle.points[1];
    let p3 = triangle.points[2];
    p1.floor();
    p2.floor();
    p3.floor();
    if (p1 == p2 && p2 == p3) this.draw(p1, 1, color);
    if (p2.y < p1.y) [p2, p1] = [p1, p2];
    if (p3.y < p1.y) [p3, p1] = [p1, p3];
    if (p3.y < p2.y) [p3, p2] = [p2, p3];
    if (p1.y == p2.y) {
      if (p1.x < p2.x && p1.x < p3.x) [p1, p2] = [p2, p1];
      if (p1.x > p2.x && p1.x > p3.x) [p2, p1] = [p1, p2];
    }

    let x12, x23, x13;
    x12 = interpolate(p1, p2);
    x23 = interpolate(p2, p3);
    x13 = interpolate(p1, p3);

    // if(x12.size > 1)
    //     x12.delete(p2.y);

    //sometimes the right middle value is more left than the left middle value
    //i need to fix this part
    let m1 = Math.floor((p2.y + p1.y) / 2);
    // let m2 = Math.floor((p3.y +p1.y) / 2);
    let midX1 = Math.floor((x12.get(m1)[0] + x12.get(m1).slice(-1)[0]) / 2);
    let midX2 = Math.floor((x13.get(m1)[0] + x13.get(m1).slice(-1)[0]) / 2);

    // console.log(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    // console.log(p2.y);
    // console.log(midX1);
    // console.log(midX2);

    if (midX2 < midX1) {
      for (let y = Math.floor(p1.y); y < p2.y; y++) {
        // console.log(y);
        // console.log(x13.get(y)[0], x12.get(y)[0]);
        for (let x = x13.get(y)[0]; x < x12.get(y)[0]; x++) {
          this.draw(new Vec2(x, y), 1, color);
        }
      }
      for (let y = Math.floor(p2.y); y < p3.y; y++) {
        // console.log(x13[y - p1.y]);
        // console.log(x13.get(y)[0], x12.get(y)[0]);
        for (let x = x13.get(y)[0]; x < x23.get(y)[0]; x++) {
          this.draw(new Vec2(x, y), 1, color);
        }
      }
    } else if (midX2 > midX1) {
      for (let y = Math.floor(p1.y); y < p2.y; y++) {
        // console.log(x13.get(y)[0], x12.get(y)[0]);

        for (let x = x12.get(y)[0]; x < x13.get(y)[0]; x++) {
          this.draw(new Vec2(x, y), 1, color);
        }
      }
      for (let y = Math.floor(p2.y); y < p3.y; y++) {
        // console.log(x13.get(y)[0], x23.get(y)[0]);

        for (let x = x23.get(y)[0]; x < x13.get(y)[0]; x++) {
          this.draw(new Vec2(x, y), 1, color);
        }
      }
    } else if (midX2 == midX1) {
      // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      // console.log(p1, p2, p3);
      if (x13.get(p2.y)[0] < x12.get(p2.y)[0]) {
        for (let y = Math.floor(p1.y); y < Math.ceil(p2.y); y++) {
          // console.log(y);
          // console.log(x13.get(y)[0], x12.get(y)[0]);
          for (let x = x13.get(y)[0]; x <= x12.get(y)[0]; x++) {
            this.draw(new Vec2(x, y), 1, color);
          }
        }
        for (let y = Math.floor(p2.y); y < Math.ceil(p3.y); y++) {
          // console.log(x13[y - p1.y]);
          // console.log(x13.get(y)[0], x12.get(y)[0]);
          for (let x = x13.get(y)[0]; x <= x23.get(y)[0]; x++) {
            this.draw(new Vec2(x, y), 1, color);
          }
        }
      } else {
        for (let y = Math.floor(p1.y); y < Math.ceil(p2.y); y++) {
          // console.log(x13.get(y)[0], x12.get(y)[0]);

          for (let x = x12.get(y)[0]; x <= x13.get(y)[0]; x++) {
            this.draw(new Vec2(x, y), 1, color);
          }
        }
        for (let y = Math.floor(p2.y); y < Math.ceil(p3.y); y++) {
          // console.log(x13.get(y)[0], x23.get(y)[0]);

          for (let x = x23.get(y)[0]; x <= x13.get(y)[0]; x++) {
            this.draw(new Vec2(x, y), 1, color);
          }
        }
      }
    }
  },

  fillRect: function (p1, p2, i) {
    for (let y = p1.y; y < p2.y; y++) {
      for (let x = x1; x < x2; x++) {
        this.draw(x, y, i);
      }
    }
  },

  drawScreen: function () {
    // console.log("a");
    this.screenString = "";
    for (let i = 0; i < this.screenHeight; i++) {
      for (let j = 0; j < this.screenWidth; j++) {
        switch (this.screenArray[i][j]) {
          case 0:
            this.screenString = this.screenString.concat("&emsp;");
            break;
          case 1:
            this.screenString = this.screenString.concat(
              '<span style = "color: rgb('
            );
            this.screenString = this.screenString.concat(
              this.colorArray[i][j].x.toString()
            );
            this.screenString = this.screenString.concat(",");
            this.screenString = this.screenString.concat(
              this.colorArray[i][j].y.toString()
            );
            this.screenString = this.screenString.concat(",");
            this.screenString = this.screenString.concat(
              this.colorArray[i][j].z.toString()
            );
            this.screenString = this.screenString.concat(')">');
            this.screenString = this.screenString.concat("壁</span>");
            break;
        }
      }
      this.screenString = this.screenString.concat("<br>");
    }
    paragraph.innerHTML = this.screenString;
  },

  update: function (time) {
    for (let y = 0; y < this.screenHeight; y++) {
      for (let x = 0; x < this.screenWidth; x++) {
        this.screenArray[y][x] = 0;
      }
    }
    this.mousePosX = mousePosX;
    this.mousePosY = mousePosY;
    this.mouseXOffset = this.mousePosX - this.lastMousePosX;
    this.mouseYOffset = this.lastMousePosY - this.mousePosY;

    this.mouseXOffset *= this.sensitivity;
    this.mouseYOffset *= this.sensitivity;

    this.lastMousePosX = this.mousePosX;
    this.lastMousePosY = this.mousePosY;

    if (!Key.isDown(Key.R)) {
      this.yaw += this.mouseXOffset;
      this.pitch += this.mouseYOffset;

      // console.log(this.yaw);

      if (this.pitch > 89.0) {
        this.pitch = 89.0;
      }
      if (this.pitch < -89.0) {
        this.pitch = -89.0;
      }

      this.vLookDir.x = Math.cos(toRad(this.yaw)) * Math.cos(toRad(this.pitch));
      this.vLookDir.y = Math.sin(toRad(this.pitch));
      this.vLookDir.z = Math.sin(toRad(this.yaw)) * Math.cos(toRad(this.pitch));
      this.vLookDir = normalize(this.vLookDir);

      let vRight = new Vec3();
      vRight = normalize(cross(this.vLookDir, this.upward));

      this.vUp = cross(vRight, this.vLookDir);
    }
    // console.log(this.vLookDir);

    // this.matCameraRot = MakeRotate(new Vec3(0, 1, 0), toRad(this.yaw));

    // this.vLookDir = MultiplyVecMat(this.vTarget, this.matCameraRot);

    let forward = vec3Multiply(this.vLookDir, 10.0 * time);
    forward.y = 0;
    if (Key.isDown(Key.LEFTSHIFT)) {
      this.vCamera.y -= 10.0 * time;
      // console.log(this.vCamera.y);
    }
    if (Key.isDown(Key.JUMP)) {
      this.vCamera.y += 10.0 * time;
      // console.log("UP");
      // console.log(this.vCamera.y);
    }
    if (Key.isDown(Key.UP)) {
      this.vCamera.y += 10.0 * time;
      // console.log("UP");
      // console.log(this.vCamera.y);
    }
    if (Key.isDown(Key.D)) {
      this.vCamera = vec3Add(this.vCamera, cross(this.vUp, forward));
    }
    if (Key.isDown(Key.A)) {
      this.vCamera = vec3Add(this.vCamera, cross(forward, this.vUp));
    }
    if (Key.isDown(Key.W)) {
      this.vCamera = vec3Add(this.vCamera, forward);
    }
    if (Key.isDown(Key.S)) {
      this.vCamera = vec3Sub(forward, this.vCamera);
    }
    // if(Key.isDown(Key.LEFT))
    // {
    //     this.yaw += 2.0 * time;
    // }
    // if(Key.isDown(Key.RIGHT))
    // {
    //     this.yaw -= 2.0 * time;
    // }

    // this.matCameraRot = MakeRotateYAxis(toRad(this.yaw));
    // this.vLookDir = MultiplyVecMat(this.vTarget, this.matCameraRot);

    this.vTarget = vec3Add(this.vLookDir, this.vCamera);
    this.matCamera = MakePointAt(this.vCamera, this.vTarget, this.vUp);
    this.matView = MatInverse(this.matCamera);
    this.elapsedTime += time;
  },
};
