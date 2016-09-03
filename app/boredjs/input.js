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
            this[button] = {};
        }
    },

    update() {
        // Each button's pressed and released states stay true for only
        // up to one frame per press.
        let updateInputHash = function(hash) {
            if (hash.state) {
                if (hash.last_state) {
                    hash.pressed = false;
                } else {
                    hash.pressed = true;
                }
            } else {
                if (hash.last_state) {
                    hash.released = true;
                } else {
                    hash.released = false;
                }
            }
        
            hash.last_state = hash.state;
        };
    
        for (let button in this.buttons) {
            updateInputHash(this[button]);
        }    
    },

    handleKeyDown(keyCode) {
        for (let button in this.buttons) {
            let bcode = this.buttons[button];
            if (keyCode === bcode) {
                this[button].state = true;
            }
        }
    },

    handleKeyUp(keyCode) {
        for (let button in this.buttons) {
            let bcode = this.buttons[button];
            if (keyCode === bcode) {
                this[button].state = false;
            }
        }
    }
};
