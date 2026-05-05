const LINKBOX_DATA = [
    ["About", "/about", [250, 70, 70]],
    ["Projects", "/projects", [250, 225, 50]],
    ["GitHub", "https://github.com/7Limes", [85, 240, 90]],
    ["Resume", "https://github.com/7Limes", [70, 110, 235]],
]

const LINKBOX_X_OFFSET = 300;
const LINKBOX_Y_OFFSET = 150;

const CAMERA_ANIMATION_DURATION = 0.5;  // Seconds
const RETURN_CAMERA_AFTER = 1.5;


let font;
let linkboxes = [];

let cameraAnimationTimer = 0;
let navigating = false;

let returnCameraTimer = -1;

let navigateLink = null;
let navigatePos = null;


function preload() {
    font = loadFont("assets/RobotoMono-Regular.ttf");
}


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL).parent("canvas-container");
    frameRate(60);

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

    if (navigateLink !== null) {
        cameraAnimationTimer = moveToward(cameraAnimationTimer, CAMERA_ANIMATION_DURATION, deltaTime/1000);
        const ease = easeInOut(cameraAnimationTimer / CAMERA_ANIMATION_DURATION);
        const [navX, navY, navZ] = navigatePos;
        const cameraPosVector = createVector(0, 0, 0).lerp(navX, navY, navZ, ease);
        const cameraLookVector = createVector(0, 0, LINKBOX_Z).lerp(navX, navY, navZ, ease);

        camera(cameraPosVector.x, cameraPosVector.y, cameraPosVector.z, cameraLookVector.x, cameraLookVector.y, cameraLookVector.z);

        if (!navigating && cameraAnimationTimer == CAMERA_ANIMATION_DURATION) {
            navigating = true;
            window.location.href = navigateLink;
            returnCameraTimer = 0;
        }
    }

    if (CAMERA_ANIMATION_DURATION - cameraAnimationTimer > 0.1) {  // Don't draw during the last few frames
        for (const linkbox of linkboxes) {
            let boxResult = linkbox.update();
            if (boxResult != null) {
                navigateLink = boxResult.navigateLink;
                navigatePos = boxResult.navigatePos;
            }
        }
    }

    if (returnCameraTimer != -1) {
        returnCameraTimer = moveToward(returnCameraTimer, RETURN_CAMERA_AFTER, deltaTime/1000);
        if (returnCameraTimer == RETURN_CAMERA_AFTER) {
            navigateLink = null;
            cameraAnimationTimer = 0;
            returnCameraTimer = -1;
            navigating = false;
            camera(0, 0, 0, 0, 0, -800);
        }
    }
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


window.addEventListener('load', function() {
    // Check if user came via back button
    console.log(performance.getEntriesByType('navigation')[0].type);
    if (performance.getEntriesByType('navigation')[0].type === 'back_forward') {
        console.log('Navigated using back button. Reloading...')
        window.location.reload();
    }
});
