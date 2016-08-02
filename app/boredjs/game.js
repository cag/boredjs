import util from './util'
import input from './input'
import audio from './audio'

let canvas = null;
let context = null;
let game_w = 0;
let game_h = 0;
let game_x_offset = 0;
let game_y_offset = 0;

let current_scene = null;

// Stores the last delta time
let last_dt = null;

// If delta time is fixed, this is set
let fixed_dt = null;

// A clamp is placed on delta time so tunneling may be avoided with
// some careful planning by the developer.
let dt_clamp = 50;
let paused = true;

// Lists of coroutines for executing coroutines
let update_coroutines = [];
let draw_coroutines = [];

// Callbacks for keys are delegated to the input module.
let handleKeyDown = function(event) {
    input.handleKeyDown(event.keyCode);
    return;
};

let handleKeyUp = function(event) {
    input.handleKeyUp(event.keyCode);
    return;
};

// Advances the execution state of a set of coroutines with a parameter
let advanceCoroutines = function(coroutines, arg) {
    for (let i = coroutines.length-1; i >= 0; i--) {
        let coroutine = coroutines[i];
        coroutine.next(arg);
        if (coroutine.done) {
            coroutines.splice(i, 1);
        }
    }
    return;
};

// Update call.
let update = function(dt) {
    input.update();
    current_scene.update(dt);
    advanceCoroutines(update_coroutines, dt);
    return;
};

// Draw call.
let draw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(game_x_offset, game_y_offset);
    context.beginPath();
    context.rect(0, 0, game_w, game_h);
    context.clip();

    current_scene.draw(context);
    advanceCoroutines(draw_coroutines, context);

    context.restore();
    return;
};

// Canvas resizing callback
let resizeCanvasToAspectRatio = function() {
    if (game_w / game_h < canvas.clientWidth / canvas.clientHeight) {
        canvas.width = game_h * canvas.clientWidth / canvas.clientHeight;
        canvas.height = game_h;
        game_x_offset = (0.5 * (canvas.width - game_w)) | 0;
        game_y_offset = 0;
    } else {
        canvas.width = game_w;
        canvas.height = game_w * canvas.clientHeight / canvas.clientWidth;
        game_x_offset = 0;
        game_y_offset = (0.5 * (canvas.height - game_h)) | 0;
    }
    return;
};
export default {
    resizeCanvasToAspectRatio,

    // Canvas instance.
    canvas() { return canvas; },

    // Game dimensions.
    width() { return game_w; },
    height() { return game_h; },

    // Last delta time.
    lastDt() { return last_dt; },

    // Current scene.
    currentScene() { return current_scene; },

    // Switch scene to new scene.
    switchScene(new_scene) {
        if (new_scene == null) { throw 'cannot switch to nonexistent scene'; }
        current_scene.end();
        current_scene = new_scene;
        current_scene.start();
        return;
    },

    // Initialize the game with the specified parameters. Pass in null
    // for `fdt` (fixed delta-time) in order to initialize in variable
    // delta-time mode. `dtc` clamps the delta time, and `initial_scene`
    // is the first scene to start the game with.
    init(width, height, fdt, dtc, initial_scene) {
        current_scene = initial_scene;
    
        if (fdt != null) {
            fixed_dt = fdt;
            last_dt = fdt;
        } else if (dtc != null) {
            dt_clamp = dtc;
            last_dt = dtc;
        } else {
            last_dt = 1 / 60;
        }
    
        let container = (document.getElementById('game')) || document.body;
        canvas = document.createElement('canvas');
    
        game_w = width;
        game_h = height;

        container.appendChild(canvas);
        resizeCanvasToAspectRatio();
    
        context = canvas.getContext('2d');
    
        document.body.tabIndex = 0;
        document.body.focus();
    
        input.init();
    
        document.body.addEventListener('keydown', handleKeyDown, false);
        document.body.addEventListener('keyup', handleKeyUp, false);
    
        audio.init();
        return;
    },

    // Runs the game loop, starting the scene and calling update and
    // draw when appropriate.
    run() {
        if (current_scene == null) { throw 'no current scene!'; }
    
        let {requestAnimationFrame} = window;
        let {time} = util;
    
        let last_frame = time();
        let dt_accumulator = 0;
        paused = false;
    
        let gameLoop = function() {
            if (!paused) { requestAnimationFrame(gameLoop); }
            let now = time();
            let dt = now - last_frame;
            dt = dt > dt_clamp ? dt_clamp : dt;
            last_frame = now;
            if (fixed_dt != null) {
                dt_accumulator += dt;
                while (dt_accumulator > fixed_dt) {
                    update(fixed_dt);
                    dt_accumulator -= fixed_dt;
                }
            } else {
                update(dt);
                last_dt = dt;
            }
            return draw();
        };
    
        current_scene.start();
        gameLoop();
        return;
    },

    // Pushes a coroutine set onto the invocation stack.
    invoke(coroutine_set) {
        if (coroutine_set.draw != null) {
            draw_coroutines.push(coroutine_set.draw);
        }
        if (coroutine_set.update != null) {
            return update_coroutines.push(coroutine_set.update);
        }
    }
};
