const LINKBOX_DATA = [
    ["About", "/about", [250, 70, 70]],
    ["Projects", "/projects", [250, 225, 50]],
    ["GitHub", "https://github.com/7Limes", [85, 240, 90]],
    ["Resume", "https://github.com/7Limes", [70, 110, 235]],
]

const LINKBOX_X_OFFSET = 300;
const LINKBOX_Y_OFFSET = 150;

const CAMERA_ANIMATION_DURATION = 30;  // Frames


let font;
let linkboxes = [];

let cameraAnimationCount = 0;
let navigating = false;


function preload() {
    font = loadFont("assets/RobotoMono-Regular.ttf");
}


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL).parent("canvas-container");

    textFont(font);
    textSize(24);
    textAlign(CENTER, CENTER);

    strokeWeight(2);
    smooth();

    camera(0, 0, 0, 0, 0, -800);

    // Create linkboxes
    for (let i = 0; i < LINKBOX_DATA.length; i++) {
        let [text, link, color] = LINKBOX_DATA[i];
        const xQuadrant = i % 2;
        const yQuadrant = Math.floor(i / 2);
        const xOffset = map(xQuadrant, 0, 1, -LINKBOX_X_OFFSET, LINKBOX_X_OFFSET);
        const yOffset = map(yQuadrant, 0, 1, -LINKBOX_Y_OFFSET, LINKBOX_Y_OFFSET);
        const linkbox = new LinkBox(xOffset, yOffset, i*23, [xQuadrant, yQuadrant], text, link, color);
        linkboxes.push(linkbox);
    }
}


function draw() {
    background(LinkBox.backgroundColor);

    if (LinkBox.navigateLink !== null) {
        cameraAnimationCount = moveToward(cameraAnimationCount, CAMERA_ANIMATION_DURATION, 1);
        const ease = easeInOut(cameraAnimationCount / CAMERA_ANIMATION_DURATION);
        const [navX, navY, navZ] = LinkBox.navigatePos;
        const cameraPosVector = createVector(0, 0, 0).lerp(navX, navY, navZ, ease);
        const cameraLookVector = createVector(0, 0, LINKBOX_Z).lerp(navX, navY, navZ, ease);

        camera(cameraPosVector.x, cameraPosVector.y, cameraPosVector.z, cameraLookVector.x, cameraLookVector.y, cameraLookVector.z);

        if (!navigating && cameraAnimationCount == CAMERA_ANIMATION_DURATION) {
            navigating = true;
            window.location.href = LinkBox.navigateLink;
        }
    }

    if (CAMERA_ANIMATION_DURATION - cameraAnimationCount > 7) {  // Don't draw during the last few frames
        for (const linkbox of linkboxes) {
            linkbox.draw();
        }
    }
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
