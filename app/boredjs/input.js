// A default map of button names to key code values.
export default {
    default_buttons: {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        run: 16,
        jump: 90,
        debug: 192
    },

    init(buttons) {
        this.buttons = buttons || this.default_buttons;
        for (let button in this.buttons) {
            if(button in this) {
                console.warn(`${button} cannot be a button name!`)
            } else {
                this[button] = {};
            }
        }
        this.pointer = { x: 0, y: 0 };
    },

    update() {
        // Each button's pressed and released states stay true for only
        // up to one frame per press.
        let updateInputHash = function(hash) {
            if(hash.pressedDuringLastFrame) {
                hash.pressed = true;
                hash.state = true;
                hash.pressedDuringLastFrame = false;
            } else {
                hash.pressed = false;
            }

            if(hash.releasedDuringLastFrame) {
                hash.released = true;
                hash.state = false;
                hash.releasedDuringLastFrame = false;
            } else {
                hash.released = false;
            }
        };
    
        for (let button in this.buttons) {
            updateInputHash(this[button]);
        }

        updateInputHash(this.pointer)
    },

    handleKeyDown(keyCode) {
        for(let button in this.buttons) {
            let bcode = this.buttons[button];
            if (keyCode === bcode) {
                this[button].pressedDuringLastFrame = true;
            }
        }
    },

    handleKeyUp(keyCode) {
        for(let button in this.buttons) {
            let bcode = this.buttons[button];
            if (keyCode === bcode) {
                this[button].releasedDuringLastFrame = true;
            }
        }
    },

    handlePointerEnter() {
        this.pointer.active = true;
    },

    handlePointerExit() {
        this.pointer.active = false;
    },

    handlePointerDown(x, y) {
        this.pointer.x = x;
        this.pointer.y = y;
        this.pointer.pressedDuringLastFrame = true;
    },

    handlePointerUp(x, y) {
        this.pointer.x = x;
        this.pointer.y = y;
        this.pointer.releasedDuringLastFrame = true;
    },

    handlePointerMove(x, y) {
        this.pointer.x = x;
        this.pointer.y = y;
    }
};
