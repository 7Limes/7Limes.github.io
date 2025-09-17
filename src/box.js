const LINKBOX_Z = -800;
const LINKBOX_SIZE = 150;

const HOVER_ANIMATION_DURATION = 45  // Frames


class LinkBox {
    static backgroundColor = [220, 220, 220];
    static navigateLink = null;
    static navigatePos;
    
    constructor(x, y, oscillateOffset, quadrant, text, link, color) {
        this.x = x;
        this.y = y;
        this.oscillateOffset = oscillateOffset;
        this.quadrant = quadrant

        this.text = text;
        this.link = link;
        this.color = color

        this.animationCount = 0;
    }


    isHovered() {
        const [xQuad, yQuad] = this.quadrant;
        const halfWidth = windowWidth / 2;
        const halfHeight = windowHeight / 2;
        const boxX = xQuad * halfWidth;
        const boxY = yQuad * halfHeight;

        return (
            mouseX >= boxX && mouseX <= boxX + halfWidth && 
            mouseY >= boxY && mouseY <= boxY + halfHeight 
        );
    }


    draw() {
        const isHovered = this.isHovered();
        const windowWidthFactor = map(windowWidth, 1920, 300, 1.0, 0.25);
        const windowHeightFactor = map(windowHeight, 1000, 200, 1.0, 0.25);
        const sizeFactor = windowHeight < windowWidth ? windowHeightFactor : windowWidthFactor * 2;
        const size = LINKBOX_SIZE * sizeFactor;

        const oscillateValue = frameCount + this.oscillateOffset

        // Calculate box position
        const xPosition = this.x * windowWidthFactor;
        const yPosition = (this.y + sin(oscillateValue * 0.02) * 10) * windowHeightFactor;

        // Check if this box was clicked on
        if (LinkBox.navigateLink === null && isHovered && mouseButton === LEFT) {
            LinkBox.navigateLink = this.link;
            LinkBox.navigatePos = [xPosition, yPosition, LINKBOX_Z];
        }

        push();
        translate(xPosition, yPosition, LINKBOX_Z);

        // Calculate box rotation
        const toValue = isHovered ? HOVER_ANIMATION_DURATION : 0;
        this.animationCount = moveToward(this.animationCount, toValue, 1);
        
        const angleToCameraXZ = atan2(xPosition, LINKBOX_Z);
        const angleToCameraYZ = atan2(yPosition, LINKBOX_Z);
        
        const ease = easeInOut(this.animationCount / HOVER_ANIMATION_DURATION);
        const yRotation = angleToCameraXZ * ease;
        const xRotation = angleToCameraYZ * ease;

        push();
        rotateY(yRotation);
        rotateX(xRotation);

        // Update background
        if (isHovered) {
            const prevColor = LinkBox.backgroundColor;
            LinkBox.backgroundColor = lerpColor(prevColor, this.color, ease);
        }

        // Draw the box
        noFill();
        box(size + 30 * ease, size + 30 * ease);
        pop();

        // Draw text inside box
        const textRotation = sin(oscillateValue * 0.02) * 0.3
        rotateY(textRotation);
        fill(lerpColor(0, 255, ease));
        textSize(size * 0.15 + 5 * ease)
        text(this.text, 0, 0);

        pop();
    }
}
