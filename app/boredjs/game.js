import $ from 'jquery'
import screenfull from 'screenfull'

import util from './util'
import input from './input'
import audio from './audio'

let canvas = null,
    context = null,
    canvas_top_offset = 0,
    canvas_left_offset = 0,
    game_w = 0,
    game_h = 0,
    game_x_offset = 0,
    game_y_offset = 0,
    game_coord_scale = 0;

let current_scene = null;

// Stores the last delta time
let last_dt = null;

// If delta time is fixed, this is set
let fixed_dt = null;

// A clamp is placed on delta time so tunneling may be avoided with
// some careful planning by the developer.
let dt_clamp = 50,
    paused = true;

// Lists of coroutines for executing coroutines
let update_coroutines = [],
    draw_coroutines = [];

// Callbacks for keys are delegated to the input module.
let handleKeyDown = function(event) {
    input.handleKeyDown(event.keyCode);
};

let handleKeyUp = function(event) {
    input.handleKeyUp(event.keyCode);
};

let getGameSpaceCoordinatesFromEvent = function(event) {
    let offsetX = event.offsetX,
        offsetY = event.offsetY;

    if(offsetX == null || offsetY == null) {
        let pageX = event.pageX,
            pageY = event.pageY;

        if(pageX == null || pageY == null) {
            pageX = event.touches[0].pageX;
            pageY = event.touches[0].pageY;
        }

        if(pageX == null || pageY == null) {
            console.error('could not get pageX or pageY from event!');
            console.error(event);
        }
        offsetX = pageX - canvas_left_offset;
        offsetY = pageY - canvas_top_offset;
    }

    return [
        offsetX * game_coord_scale - game_x_offset,
        offsetY * game_coord_scale - game_y_offset
    ];

};

// Callbacks for the pointer are also delegated to the input module after processing
let handlePointerDown = function(event) {
    let [gameX, gameY] = getGameSpaceCoordinatesFromEvent(event);
    input.handlePointerDown(gameX, gameY);
    event.preventDefault();
};

let handlePointerUp = function(event) {
    let [gameX, gameY] = getGameSpaceCoordinatesFromEvent(event);
    input.handlePointerUp(gameX, gameY);
    event.preventDefault();
};

let handlePointerMove = function(event) {
    let [gameX, gameY] = getGameSpaceCoordinatesFromEvent(event);
    input.handlePointerUp(gameX, gameY);
    event.preventDefault();
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
};

// Update call.
let update = function(dt) {
    input.update();
    current_scene.update(dt);
    advanceCoroutines(update_coroutines, dt);
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
};

// Canvas resizing callback
let resizeCanvasToAspectRatio = function() {
    // First set these so that canvas will attempt to be at the right size
    canvas.width = game_w;
    canvas.height = game_h;

    // Expand canvas draw dimensions to fill actual dimensions
    if (game_w / game_h < canvas.clientWidth / canvas.clientHeight) {
        game_coord_scale = game_h / canvas.clientHeight;
        canvas.width = game_h * canvas.clientWidth / canvas.clientHeight;
        canvas.height = game_h;
        game_x_offset = (0.5 * (canvas.width - game_w)) | 0;
        game_y_offset = 0;
    } else {
        game_coord_scale = game_w / canvas.clientWidth;
        canvas.width = game_w;
        canvas.height = game_w * canvas.clientHeight / canvas.clientWidth;
        game_x_offset = 0;
        game_y_offset = (0.5 * (canvas.height - game_h)) | 0;
    }

    let elem = canvas, offsets = [];
    canvas_left_offset = 0;
    canvas_top_offset = 0;

    while(elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
        offsets.push([elem.offsetLeft, elem.offsetTop]);
        canvas_left_offset += elem.offsetLeft;
        canvas_top_offset += elem.offsetTop;
        elem = elem.offsetParent;
    }
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

        canvas = document.getElementById('game');

        game_w = width;
        game_h = height;

        resizeCanvasToAspectRatio();
    
        context = canvas.getContext('2d');
    
        document.body.tabIndex = 0;
        document.body.focus();
    
        input.init();
    
        window.addEventListener('keydown', handleKeyDown, false);
        window.addEventListener('keyup', handleKeyUp, false);
        $(canvas).on('touchstart mousedown', handlePointerDown);
        $(canvas).on('touchend mouseup', handlePointerUp);
    
        audio.init();
    },

    // Runs the game loop, starting the scene and calling update and
    // draw when appropriate.
    run() {
        if (current_scene == null) { throw Error('no current scene!'); }
    
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
