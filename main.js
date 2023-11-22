let cube = [
  //south
  [
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [1.0, 1.0, 0.0],
  ],
  [
    [0.0, 0.0, 0.0],
    [1.0, 1.0, 0.0],
    [1.0, 0.0, 0.0],
  ],
  //east
  [
    [1.0, 0.0, 0.0],
    [1.0, 1.0, 0.0],
    [1.0, 1.0, 1.0],
  ],
  [
    [1.0, 0.0, 0.0],
    [1.0, 1.0, 1.0],
    [1.0, 0.0, 1.0],
  ],
  //north
  [
    [1.0, 0.0, 1.0],
    [1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0],
  ],
  [
    [1.0, 0.0, 1.0],
    [0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0],
  ],
  //west
  [
    [0.0, 0.0, 1.0],
    [0.0, 1.0, 1.0],
    [0.0, 1.0, 0.0],
  ],
  [
    [0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0],
  ],
  //top
  [
    [0.0, 1.0, 0.0],
    [0.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
  ],
  [
    [0.0, 1.0, 0.0],
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 0.0],
  ],
  //bottom
  [
    [1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0],
  ],
  [
    [1.0, 0.0, 1.0],
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
  ],
];

Screen.init(300, 150);
Screen.loadMeshFromArray(cube, "cube");
// Screen.loadMesh("VideoShip.obj", "ship").then(() => {Screen.meshesLoaded.set("ship", true);});
// Screen.loadMesh("axis.obj", "axis");
Screen.parseObjFile(axis, "axis");
Screen.parseObjFile(VideoShip, "ship");
// Screen.translateMesh("cube", new Vec3(0.0, 0.0, 3.0));
// console.log("a");

let lastTime = Date.now();
let deltaTime = 0;

function mainLoop() {
  let nowTime = Date.now();
  deltaTime = nowTime - lastTime;
  lastTime = nowTime;
  Screen.update(deltaTime / 1000);
  // Screen.drawFilledTriangle(new Triangle(new Vec3(-94, -37), new Vec3(114, 76), new Vec3(118, 79)), 1, new Vec3(255, 0, 0));
  // if(Screen.meshesLoaded.get("ship") == true)
  Screen.drawMesh("axis");
  Screen.drawScreen();
  requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
