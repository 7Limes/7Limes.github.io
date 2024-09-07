const FEATURED_LINK = "https://7limes.github.io/Gunpowder-Grotto/"
const TRIANGLE = [
  [0, -20],
  [-15, 15],
  [0, 10],
  [15, 15]
];
const BULLET_VELOCITY = 7;
const LINKBOX_MAX_DAMAGE = 5;
const LINKBOX_SIZE = 100;

const DAMAGEBOX_COLOR = "#202032";

const LINE_DURATION = 120;

var canvas, cHeight, cWidth, cCenterX, cCenterY, font;
var bullets = [];
var linkboxes = [];
var shootCooldown = 0;
var redirecting = false;

var lines = [];
var prevLinePoint = null;
var currentLineHue = 0;

class LinkBox {
  constructor(x, y, width, height, text, link) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.link = link;
    this.damage = 0;

    this.halfwidth = width/2;
    this.halfheight = height/2;
  }

  draw() {
    noFill();
    rect(this.x, this.y, this.width, this.height);
    noStroke();
    if (this.damage != 0) {
      fill(DAMAGEBOX_COLOR);
      let damageBoxWidth = this.width/LINKBOX_MAX_DAMAGE*this.damage;
      let damageBoxHeight = this.height/LINKBOX_MAX_DAMAGE*this.damage;
      let damageBoxX = this.halfwidth-this.halfwidth/LINKBOX_MAX_DAMAGE*this.damage+this.x;
      let damageBoxY = this.halfheight-this.halfheight/LINKBOX_MAX_DAMAGE*this.damage+this.y;
      rect(damageBoxX, damageBoxY, damageBoxWidth, damageBoxHeight, 5);
    }
    fill(255);
    text(this.text, this.x+this.halfwidth-5, this.y+this.halfheight+3, 10);
    stroke(255);
  }

  hits(point) {
    let [px, py] = point;
    if (px < this.x || px > this.x+this.width)
      return false;
    if (py < this.y || py > this.y+this.height)
      return false;
    return true;
  }
}

class Bullet {
  constructor(x, y, vec) {
    this.x = x;
    this.y = y;
    this.vec = vec;
  }

  tick() {
    this.x += this.vec.x;
    this.y += this.vec.y;
    for (let box of linkboxes) {
      if (box.hits([this.x, this.y])) {
        if (box.damage < LINKBOX_MAX_DAMAGE)
          box.damage += 1;
        if (!redirecting && box.damage >= LINKBOX_MAX_DAMAGE) {
          redirecting = true;
          window.location.href = box.link;
        }
        return true;
      }
    }
    if (this.x < 0 || this.x > cWidth)
      return true;
    if (this.y < 0 || this.y > cHeight)
      return true;
    return false;
  }
}

class Line {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.life = LINE_DURATION;
  }

  draw() {
    colorMode(HSL);
    let lineLightness = map(this.life, 0, LINE_DURATION, 0, 100);
    stroke(currentLineHue, 100, lineLightness);
    line(this.p1[0], this.p1[1], this.p2[0], this.p2[1]);
    colorMode(RGB, 255);
    this.life -= 1
    return this.life <= 0
  }
}

function rotatePointAroundPoint(point, center, angle) {
  let [px, py] = point;
  let [cx, cy] = center;
  let s = Math.sin(angle);
  let c = Math.cos(angle);
  px -= cx;
  py -= cy;
  let newx = px*c - py*s;
  let newy = px*s + py*c;
  return [cx+newx, cy+newy];
}

function drawTriangle(center, angle) {
  beginShape();
  for (let point of TRIANGLE) {
    let newPoint = [point[0]+center[0], point[1]+center[1]]
    let [vx, vy] = rotatePointAroundPoint(newPoint, center, angle);
    vertex(vx, vy);
  }
  endShape(CLOSE);
}

function calculateMouseAngle(point) {
  let [px, py] = point;
  return Math.atan2(mouseY-py, mouseX-px) + 1.57079633;
}

function shootBullet() {
  let vec = createVector(mouseX-cCenterX, mouseY-cCenterY);
  vec.normalize();
  vec.mult(BULLET_VELOCITY);
  let bullet = new Bullet(cCenterX, cCenterY, vec);
  bullets.push(bullet);
}

function setGlobals() {
  cHeight = windowHeight;
  cWidth = windowWidth;
  cCenterX = cWidth/2;
  cCenterY = cHeight/2;
  
  linkboxes = [
    new LinkBox(cCenterX-LINKBOX_SIZE/2, 50, LINKBOX_SIZE, LINKBOX_SIZE, "Projects", "projects"),
    new LinkBox(cCenterX-LINKBOX_SIZE/2, cHeight-LINKBOX_SIZE-50, LINKBOX_SIZE, LINKBOX_SIZE, "Github", "https://github.com/7limes"),
    new LinkBox(cCenterX+LINKBOX_SIZE/2-Math.min(cCenterX, cCenterY), cCenterY-LINKBOX_SIZE/2, LINKBOX_SIZE, LINKBOX_SIZE, "Featured Project", FEATURED_LINK),
  ];
}

function drawLines() {
  strokeWeight(5);
  stroke(255);
  for (let i = 0; i < lines.length; i++) {
    let thisLine = lines[i];
    let remove = thisLine.draw();
    if (remove) {
      lines.splice(i, 1);
      i--;
    }
  }
}

addEventListener("popstate", (event) => {
  setGlobals();
})

function preload() {
  font = loadFont('assets/RobotoMono.ttf');
}

function setup() {
  setGlobals();
  canvas = createCanvas(cWidth, cHeight);
  canvas.parent("canvas_container");
  canvas.position(windowWidth/2-cCenterX, windowHeight/2-cCenterY);
  frameRate(60);
  textSize(15);
  textFont(font);
  textAlign(CENTER);
}

function draw() {
  if (mouseIsPressed) {
    if (shootCooldown == 0) {
      shootBullet();
      shootCooldown = 5;
    }
    if (prevLinePoint !== null) {
      let l = new Line(prevLinePoint, [mouseX, mouseY]);
      lines.push(l)
    }
    prevLinePoint = [mouseX, mouseY]
  }
  else if (prevLinePoint !== null) {
    prevLinePoint = null;
  }
  if (shootCooldown > 0)
    shootCooldown -= 1;
  let angle = calculateMouseAngle([cCenterX, cCenterY]);
  
  clear();
  fill(255);
  stroke(255);
  strokeWeight(1);
  noFill();
  drawTriangle([cCenterX, cCenterY], angle);
  if (bullets.length) {
    for (let i = 0; i < bullets.length; i++) {
      let bullet = bullets[i];
      if (bullet.tick())
        bullets.splice(i, 1);
      else
        ellipse(bullet.x, bullet.y, 3);
    }
  }
  for (let box of linkboxes) {
    box.draw();
  }
  drawLines()
  currentLineHue = (currentLineHue + 1) % 360
}

function windowResized() {
  console.log('resize');
  resizeCanvas(windowWidth, windowHeight);
  setGlobals();
  canvas.position(windowWidth/2-cCenterX, windowHeight/2-cCenterY);
}
