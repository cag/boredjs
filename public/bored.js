(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("boredjs/audio.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['./util'], function (util) {
    // A prefix and suffix applied to names passed into sound
    // constructors so that they load from the right place.
    var url_prefix = 'assets/';
    var url_suffix = '.wav';

    // Thanks Boris Smus for the [Web Audio tutorial](http://www.html5rocks.com/en/tutorials/webaudio/intro/).
    (function () {
        var w = window;
        w.AudioContext = w.AudioContext || w.webkitAudioContext;
        return;
    })();

    var audio_context = null;

    // Initializes the audio system.
    return {
        init: function init() {
            if (typeof AudioContext !== 'undefined' && AudioContext !== null) {
                audio_context = new AudioContext();
            } else {
                console.warn('could not initialize audio!');
            }
            return;
        },


        // See the [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
        // for information on how to use the audio context.
        getAudioContext: function getAudioContext() {
            return audio_context;
        },


        // The `Sound` class handles loading sound buffers and playing them.
        Sound: function () {
            function Sound(name, onload) {
                _classCallCheck(this, Sound);

                this.name = name;
                if (audio_context == null) {
                    if (onload != null) {
                        onload();
                    }
                    return;
                }

                var request = new XMLHttpRequest();
                request.open('GET', url_prefix + this.name + url_suffix, true);
                request.responseType = 'arraybuffer';

                var obj = this;
                request.onload = function () {
                    return audio_context.decodeAudioData(request.response, function (buffer) {
                        obj.buffer = buffer;
                        if (onload != null) {
                            onload();
                        }
                        return;
                    }, function () {
                        throw 'could not load sound buffer from ' + url;
                        return;
                    });
                };

                request.send();
                return;
            }

            // Pass in a node to connect to if not playing this sound
            // straight to output.


            _createClass(Sound, [{
                key: 'play',
                value: function play() {
                    var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
                    var looped = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                    var node = arguments[2];

                    if (audio_context != null && this.buffer != null) {
                        var source = audio_context.createBufferSource();
                        source.buffer = this.buffer;
                        source.loop = looped;
                        source.connect(node || audio_context.destination);
                        source.noteOn(delay + audio_context.currentTime);
                        return source;
                    }
                    return null;
                }
            }]);

            return Sound;
        }(),

        // Ptolemy's intense diatonic tuning in A440 has a C4 of 264 Hz
        ptolemy_c4: 264,
        ptolemy_tuning_factors: [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8],

        // Pythagorean tuning in A440 has a C4 of 260.741 Hz
        pythagorean_c4: 260.741
    };
});
});

require.register("boredjs/entity.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['./geometry'], function (geometry) {
    return(
        // An entity which may be placed in a map and scripted with
        // update, draw, onCollide, and onObstruct callbacks.
        {
            Entity: function () {
                function Entity(x, y, shape) {
                    _classCallCheck(this, Entity);

                    this.x = x;
                    this.y = y;
                    this.shape = shape;
                }

                // Puts a subpath of its underlying collision primitive onto
                // the drawing context.


                _createClass(Entity, [{
                    key: 'shapeSubpath',
                    value: function shapeSubpath(context, xoff, yoff) {
                        this.shape.subpath(context, this.x + xoff, this.y + yoff);
                        return;
                    }

                    // Detects if entity bounds are left of another's bounds.

                }, {
                    key: 'boundsLeftOf',
                    value: function boundsLeftOf(other) {
                        return this.x + this.shape.bounds_offsets[1] < other.x + other.shape.bounds_offsets[0];
                    }

                    // Tests whether entity box bounds intersect.
                    // This is useful for collision and drawing culling.

                }, {
                    key: 'boundsIntersects',
                    value: function boundsIntersects(other) {
                        var bounds_a = this.shape.bounds_offsets;
                        var bounds_b = other.shape.bounds_offsets;

                        return this.x + bounds_a[0] <= other.x + bounds_b[1] && this.x + bounds_a[1] >= other.x + bounds_b[0] && this.y + bounds_a[2] <= other.y + bounds_b[3] && this.y + bounds_a[3] >= other.y + bounds_b[2];
                    }

                    // Tests whether entity intersects another entity.
                    // Used when collision manager updates.

                }, {
                    key: 'intersects',
                    value: function intersects(other) {
                        if (this.boundsIntersects(other)) {
                            return geometry.intersects(this.x, other.x, this.y, other.y, this.shape, other.shape);
                        }
                        return false;
                    }
                }]);

                return Entity;
            }()
        }
    );
});
});

require.register("boredjs/game.js", function(exports, require, module) {
'use strict';

define(['./util', './input', './audio'], function (util, input, audio) {
    var _canvas = null;
    var context = null;
    var game_w = 0;
    var game_h = 0;
    var game_x_offset = 0;
    var game_y_offset = 0;

    var current_scene = null;

    // Stores the last delta time
    var last_dt = null;

    // If delta time is fixed, this is set
    var fixed_dt = null;

    // A clamp is placed on delta time so tunneling may be avoided with
    // some careful planning by the developer.
    var dt_clamp = 50;
    var paused = true;

    // Lists of coroutines for executing coroutines
    var update_coroutines = [];
    var draw_coroutines = [];

    // Callbacks for keys are delegated to the input module.
    var handleKeyDown = function handleKeyDown(event) {
        input.handleKeyDown(event.keyCode);
        return;
    };

    var handleKeyUp = function handleKeyUp(event) {
        input.handleKeyUp(event.keyCode);
        return;
    };

    // Advances the execution state of a set of coroutines with a parameter
    var advanceCoroutines = function advanceCoroutines(coroutines, arg) {
        var iterable = __range__(coroutines.length - 1, 0, true);
        for (var j = iterable.length - 1; j >= 0; j--) {
            var i = iterable[j];
            var coroutine = coroutines[i];
            coroutine.next(arg);
            if (coroutine.done) {
                coroutines.splice(i, 1);
            }
        }
        return;
    };

    // Update call.
    var update = function update(dt) {
        input.update();
        current_scene.update(dt);
        advanceCoroutines(update_coroutines, dt);
        return;
    };

    // Draw call.
    var draw = function draw() {
        context.clearRect(0, 0, _canvas.width, _canvas.height);
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
    var resizeCanvasToAspectRatio = function resizeCanvasToAspectRatio() {
        if (game_w / game_h < _canvas.clientWidth / _canvas.clientHeight) {
            _canvas.width = game_h * _canvas.clientWidth / _canvas.clientHeight;
            _canvas.height = game_h;
            game_x_offset = 0.5 * (_canvas.width - game_w) | 0;
            game_y_offset = 0;
        } else {
            _canvas.width = game_w;
            _canvas.height = game_w * _canvas.clientHeight / _canvas.clientWidth;
            game_x_offset = 0;
            game_y_offset = 0.5 * (_canvas.height - game_h) | 0;
        }
        return;
    };
    return {
        resizeCanvasToAspectRatio: resizeCanvasToAspectRatio,

        // Canvas instance.
        canvas: function canvas() {
            return _canvas;
        },


        // Game dimensions.
        width: function width() {
            return game_w;
        },
        height: function height() {
            return game_h;
        },


        // Last delta time.
        lastDt: function lastDt() {
            return last_dt;
        },


        // Current scene.
        currentScene: function currentScene() {
            return current_scene;
        },


        // Switch scene to new scene.
        switchScene: function switchScene(new_scene) {
            if (new_scene == null) {
                throw 'cannot switch to nonexistent scene';
            }
            current_scene.end();
            current_scene = new_scene;
            current_scene.start();
            return;
        },


        // Initialize the game with the specified parameters. Pass in null
        // for `fdt` (fixed delta-time) in order to initialize in variable
        // delta-time mode. `dtc` clamps the delta time, and `initial_scene`
        // is the first scene to start the game with.
        init: function init(width, height, fdt, dtc, initial_scene) {
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

            var container = document.getElementById('game') || document.body;
            _canvas = document.createElement('canvas');

            game_w = width;
            game_h = height;

            container.appendChild(_canvas);
            resizeCanvasToAspectRatio();

            context = _canvas.getContext('2d');

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
        run: function run() {
            if (current_scene == null) {
                throw 'no current scene!';
            }

            var _window = window;
            var requestAnimationFrame = _window.requestAnimationFrame;
            var time = util.time;


            var last_frame = time();
            var dt_accumulator = 0;
            paused = false;

            var gameLoop = function gameLoop() {
                if (!paused) {
                    requestAnimationFrame(gameLoop);
                }
                var now = time();
                var dt = now - last_frame;
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
        invoke: function invoke(coroutine_set) {
            if (coroutine_set.draw != null) {
                draw_coroutines.push(coroutine_set.draw);
            }
            if (coroutine_set.update != null) {
                return update_coroutines.push(coroutine_set.update);
            }
        }
    };
});

function __range__(left, right, inclusive) {
    var range = [];
    var ascending = left < right;
    var end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
});

;require.register("boredjs/geometry.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(function () {
    // These constants determine how debug drawing is rendered when
    // shape subpaths are being created.
    var POINT_RADIUS = 2;
    var NORMAL_OFFSET = 4;
    var NORMAL_LENGTH = 2;

    // This is currently the epsilon used to detect small differences
    // in normals.
    var EPSILON = Math.pow(2, -50);

    // Some basic linear algebra.
    var dotProduct = function dotProduct(u, v) {
        return u[0] * v[0] + u[1] * v[1];
    };

    var normalize = function normalize(v) {
        var invnorm = 1 / Math.sqrt(dotProduct(v, v));
        return [invnorm * v[0], invnorm * v[1]];
    };

    // Axis is assumed to be normalized so only a dot product is used
    // in the projection.
    var projectShapeOntoAxis = function projectShapeOntoAxis(shape, axis) {
        var min = Number.POSITIVE_INFINITY;
        var max = Number.NEGATIVE_INFINITY;

        var stype = shape.type;

        if (stype === 'Point') {
            min = 0;
            max = 0;
        } else if (stype === 'Aabb') {
            var hw_proj = dotProduct(shape.halfwidth, axis);
            if (hw_proj < 0) {
                min = Math.min(min, hw_proj);
                max = Math.max(max, -hw_proj);
            } else {
                min = Math.min(min, -hw_proj);
                max = Math.max(max, hw_proj);
            }

            hw_proj = dotProduct([shape.halfwidth[0], -shape.halfwidth[1]], axis);
            if (hw_proj < 0) {
                min = Math.min(min, hw_proj);
                max = Math.max(max, -hw_proj);
            } else {
                min = Math.min(min, -hw_proj);
                max = Math.max(max, hw_proj);
            }
        } else if (stype === 'Polygon') {
            var pts = shape.points;
            for (var i = 0; i < pts.length; i++) {
                var point = pts[i];
                var pt_proj = dotProduct(point, axis);
                min = Math.min(min, pt_proj);
                max = Math.max(max, pt_proj);
            }
        }

        return [min, max];
    };

    // This returns how much interval `b` should be displaced to render
    // the intervals disjoint (except maybe at a point).
    var intervalsIntersect = function intervalsIntersect(a, b) {
        if (a[1] < b[0] || b[1] < a[0]) {
            return false;
        }

        var aoff = b[1] - a[0];
        var boff = a[1] - b[0];

        if (aoff < boff) {
            return -aoff;
        }
        return boff;
    };

    // Figures out how much shape is penetrating polygon. A penetration
    // amount and direction may be passed in order to continue a test
    // with data from prior analysis.
    var calcShapePolygonMinimumPenetrationVector = function calcShapePolygonMinimumPenetrationVector(s, sx, sy, p, px, py) {
        var pen_amt = arguments.length <= 6 || arguments[6] === undefined ? Number.POSITIVE_INFINITY : arguments[6];
        var pen_dir = arguments[7];
        var negate = arguments.length <= 8 || arguments[8] === undefined ? false : arguments[8];

        var iterable = __range__(0, p.normals.length, false);
        for (var j = 0; j < iterable.length; j++) {
            var i = iterable[j];
            var normal = p.normals[i];
            var p_bounds = p.bounds_on_normals[i];

            var proj_s_pos = dotProduct([sx, sy], normal);
            var proj_p_pos = dotProduct([px, py], normal);

            var s_bounds = projectShapeOntoAxis(s, normal);

            var intersects = intervalsIntersect([s_bounds[0] + proj_s_pos, s_bounds[1] + proj_s_pos], [p_bounds[0] + proj_p_pos, p_bounds[1] + proj_p_pos]);

            if (!intersects) {
                return false;
            }

            var abs_intersects = Math.abs(intersects);

            if (abs_intersects < pen_amt) {
                pen_amt = abs_intersects;
                if (negate === intersects < 0) {
                    pen_dir = normal;
                } else {
                    pen_dir = [-normal[0], -normal[1]];
                }
            }
        }

        return [pen_amt, pen_dir];
    };

    // Finds bounds of the polygon. Equivalent to concatenating the
    // results of a polygon projection onto [1, 0] and [0, 1].
    var calcPolyBounds = function calcPolyBounds(points) {
        var minx = points[0][0];
        var maxx = points[0][0];
        var miny = points[0][1];
        var maxy = points[0][1];
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            minx = Math.min(minx, point[0]);
            maxx = Math.max(maxx, point[0]);
            miny = Math.min(miny, point[1]);
            maxy = Math.max(maxy, point[1]);
        }
        return [minx, maxx, miny, maxy];
    };

    // A whole bunch of individual types of shape intersection tests.
    // Polygons are assumed to be convex and use the hyperplane
    // separation theorem. Points and AABBs are simply special cases.
    var testPointPointIntersection = function testPointPointIntersection(p1, p1x, p1y, p2, p2x, p2y) {
        return [0, [1, 0]];
    };

    var testPointAabbIntersection = function testPointAabbIntersection(p, px, py, a, ax, ay) {
        var pen_amt = ax + a.halfwidth[0] - px;
        var pen_dir = [-1, 0];

        var next_proj = ay + a.halfwidth[1] - py;
        if (next_proj < pen_amt) {
            pen_amt = next_proj;
            pen_dir = [0, -1];
        }

        next_proj = px - (ax - a.halfwidth[0]);
        if (next_proj < pen_amt) {
            pen_amt = next_proj;
            pen_dir = [1, 0];
        }

        next_proj = py - (ay - a.halfwidth[1]);
        if (next_proj < pen_amt) {
            pen_amt = next_proj;
            pen_dir = [0, 1];
        }

        return [pen_amt, pen_dir];
    };

    var testPointPolygonIntersection = function testPointPolygonIntersection(p1, p1x, p1y, p2, p2x, p2y) {
        return calcShapePolygonMinimumPenetrationVector(p1, p1x, p1y, p2, p2x, p2y);
    };

    var testAabbAabbIntersection = function testAabbAabbIntersection(a1, a1x, a1y, a2, a2x, a2y) {
        var pen_amt = a2x + a2.halfwidth[0] - (a1x - a1.halfwidth[0]);
        var pen_dir = [-1, 0];

        var next_proj = a2y + a2.halfwidth[1] - (a1y - a1.halfwidth[1]);
        if (next_proj < pen_amt) {
            pen_amt = next_proj;
            pen_dir = [0, -1];
        }

        next_proj = a1x + a1.halfwidth[0] - (a2x - a2.halfwidth[0]);
        if (next_proj < pen_amt) {
            pen_amt = next_proj;
            pen_dir = [1, 0];
        }

        next_proj = a1y + a1.halfwidth[1] - (a2y - a2.halfwidth[1]);
        if (next_proj < pen_amt) {
            pen_amt = next_proj;
            pen_dir = [0, 1];
        }

        return [pen_amt, pen_dir];
    };

    var testAabbPolygonIntersection = function testAabbPolygonIntersection(a, ax, ay, p, px, py) {
        var intersects = intervalsIntersect([ax + a.bounds_offsets[0], ax + a.bounds_offsets[1]], [px + p.bounds_offsets[0], px + p.bounds_offsets[1]]);

        if (intersects < 0) {
            var pen_amt = -intersects;
            var pen_dir = [-1, 0];
        } else {
            var pen_amt = intersects;
            var pen_dir = [1, 0];
        }

        intersects = intervalsIntersect([ay + a.bounds_offsets[2], ay + a.bounds_offsets[3]], [py + p.bounds_offsets[2], py + p.bounds_offsets[3]]);

        if (intersects < 0) {
            var pen_amt = -intersects;
            var pen_dir = [0, -1];
        } else {
            var pen_amt = intersects;
            var pen_dir = [0, 1];
        }

        return calcShapePolygonMinimumPenetrationVector(a, ax, ay, p, px, py, pen_amt, pen_dir);
    };

    var testPolygonPolygonIntersection = function testPolygonPolygonIntersection(p1, p1x, p1y, p2, p2x, p2y) {
        var ret = calcShapePolygonMinimumPenetrationVector(p1, p1x, p1y, p2, p2x, p2y);

        if (ret) {
            var _ret = _slicedToArray(ret, 2);

            var pen_amt = _ret[0];
            var pen_dir = _ret[1];
        } else {
            return false;
        }

        return calcShapePolygonMinimumPenetrationVector(p2, p2x, p2y, p1, p1x, p1y, pen_amt, pen_dir, true);
    };

    // A mapping from pairs of shape types to the appropriate hit test.
    var intersection_test_map = {
        Point: {
            Point: testPointPointIntersection,
            Aabb: testPointAabbIntersection,
            Polygon: testPointPolygonIntersection
        },
        Aabb: {
            Aabb: testAabbAabbIntersection,
            Polygon: testAabbPolygonIntersection
        },
        Polygon: {
            Polygon: testPolygonPolygonIntersection
        }
    };

    return {
        dotProduct: dotProduct,

        // A point.
        Point: function () {
            function Point() {
                _classCallCheck(this, Point);

                this.type = 'Point';
                this.bounds_offsets = [0, 0, 0, 0];
            }

            _createClass(Point, [{
                key: 'subpath',
                value: function subpath(context, offx, offy) {
                    context.moveTo(offx + POINT_RADIUS, offy);
                    context.arc(offx, offy, POINT_RADIUS, 0, 2 * Math.PI);
                    return;
                }
            }]);

            return Point;
        }(),

        // An axis-aligned bounding box.
        Aabb: function () {
            function Aabb(halfwidth) {
                _classCallCheck(this, Aabb);

                this.halfwidth = halfwidth;
                this.type = 'Aabb';
                var hw = this.halfwidth;
                this.bounds_offsets = [-hw[0], hw[0], -hw[1], hw[1]];
                return;
            }

            _createClass(Aabb, [{
                key: 'subpath',
                value: function subpath(context, offx, offy) {
                    var hw = this.halfwidth;
                    context.rect(offx - hw[0], offy - hw[1], 2 * hw[0], 2 * hw[1]);
                    return;
                }
            }]);

            return Aabb;
        }(),

        // A *convex* polygon.
        Polygon: function () {
            function Polygon(points) {
                _classCallCheck(this, Polygon);

                this.type = 'Polygon';
                this.bounds_offsets = calcPolyBounds(points);

                var sumx = 0;
                var sumy = 0;
                var num_vertices = points.length;
                for (var i1 = 0; i1 < points.length; i1++) {
                    var pt = points[i1];
                    sumx += pt[0];
                    sumy += pt[1];
                }
                this.center_offset = [sumx / num_vertices, sumy / num_vertices];

                var ccw = null;
                var ptslen = points.length;
                var iterable = __range__(0, ptslen, false);
                for (var j1 = 0; j1 < iterable.length; j1++) {
                    var i = iterable[j1];
                    var j = (i + 1) % ptslen;
                    var k = (i + 2) % ptslen;
                    var edge1 = [points[j][0] - points[i][0], points[j][1] - points[i][1]];
                    var edge2 = [points[k][0] - points[j][0], points[k][1] - points[j][1]];
                    var cross = edge1[0] * edge2[1] - edge2[0] * edge1[1];

                    if (ccw != null) {
                        if (ccw && cross > 0 || !ccw && cross < 0) {
                            throw 'tried to construct non-convex polygon';
                        }
                    } else {
                        ccw = cross < 0;
                    }
                }

                if (ccw) {
                    this.points = points.reverse();
                } else {
                    this.points = points;
                }

                var normals = [];
                var bounds_on_normals = [];
                var iterable1 = __range__(0, ptslen, false);
                for (var k1 = 0; k1 < iterable1.length; k1++) {
                    var i = iterable1[k1];
                    var j = (i + 1) % ptslen;
                    var normal = normalize([this.points[i][1] - this.points[j][1], this.points[j][0] - this.points[i][0]]);

                    var skip = false;
                    for (var i2 = 0; i2 < normals.length; i2++) {
                        var other = normals[i2];
                        if (Math.abs(dotProduct(normal, other)) > 1 - EPSILON) {
                            skip = true;
                            continue;
                        }
                    }

                    if (skip) {
                        continue;
                    }

                    var bounds_on_normal = projectShapeOntoAxis(this, normal);

                    normals.push(normal);
                    bounds_on_normals.push(bounds_on_normal);
                }

                this.normals = normals;
                this.bounds_on_normals = bounds_on_normals;

                return;
            }

            _createClass(Polygon, [{
                key: 'subpath',
                value: function subpath(context, offx, offy) {
                    var pts = this.points;
                    context.moveTo(pts[0][0] + offx, pts[0][1] + offy);
                    var iterable = __range__(1, pts.length, false);
                    for (var j = 0; j < iterable.length; j++) {
                        var i = iterable[j];
                        context.lineTo(pts[i][0] + offx, pts[i][1] + offy);
                    }
                    context.closePath();

                    var coffx = offx + this.center_offset[0];
                    var coffy = offy + this.center_offset[1];
                    context.moveTo(coffx + POINT_RADIUS, coffy);
                    context.arc(coffx, coffy, POINT_RADIUS, 0, 2 * Math.PI);

                    for (var k = 0; k < this.normals.length; k++) {
                        var normal = this.normals[k];
                        context.moveTo(coffx + NORMAL_OFFSET * normal[0], coffy + NORMAL_OFFSET * normal[1]);
                        context.lineTo(coffx + (NORMAL_LENGTH + NORMAL_OFFSET) * normal[0], coffy + (NORMAL_LENGTH + NORMAL_OFFSET) * normal[1]);
                    }

                    return;
                }
            }]);

            return Polygon;
        }(),

        intersects: function intersects(x_a, x_b, y_a, y_b, shape_a, shape_b) {
            var test = intersection_test_map[shape_a.type];
            if (test != null) {
                test = test[shape_b.type];
                if (test != null) {
                    return test(shape_a, x_a, y_a, shape_b, x_b, y_b);
                }
            } else {
                test = intersection_test_map[shape_b.type];
                if (test != null) {
                    test = test[shape_a.type];
                    if (test != null) {
                        var result = test(shape_b, x_b, y_b, shape_a, x_a, y_a);
                        if (result) {
                            return [result[0], [-result[1][0], -result[1][1]]];
                        } else {
                            return false;
                        }
                    }
                }
            }

            throw 'can\'t test ' + shape_a.type + ' against ' + shape_b.type;
            return false;
        }
    };
});

function __range__(left, right, inclusive) {
    var range = [];
    var ascending = left < right;
    var end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
});

;require.register("boredjs/input.js", function(exports, require, module) {
"use strict";

define(function () {
    return(
        // A default map of button names to key code values.
        {
            default_buttons: {
                left: 37,
                up: 38,
                right: 39,
                down: 40,
                run: 16,
                jump: 90,
                debug: 192
            },

            init: function init(buttons) {
                this.buttons = buttons || this.default_buttons;
                for (var button in this.buttons) {
                    this[button] = {};
                }
                return;
            },
            update: function update() {
                // Each button's pressed and released states stay true for only
                // up to one frame per press.
                var updateInputHash = function updateInputHash(hash) {
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
                    return;
                };

                for (var button in this.buttons) {
                    updateInputHash(this[button]);
                }

                return;
            },
            handleKeyDown: function handleKeyDown(keyCode) {
                for (var button in this.buttons) {
                    var bcode = this.buttons[button];
                    if (keyCode === bcode) {
                        this[button].state = true;
                    }
                }
                return;
            },
            handleKeyUp: function handleKeyUp(keyCode) {
                for (var button in this.buttons) {
                    var bcode = this.buttons[button];
                    if (keyCode === bcode) {
                        this[button].state = false;
                    }
                }
                return;
            }
        }
    );
});
});

require.register("boredjs/loader.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['./map', './sprite', './audio'], function (map, sprite, audio) {
    return(
        // A scene for loading resources. Pass in an object of the form:
        //
        //     {
        //         maps:
        //             MAPVAR: { name: MAPNAME, script: MAPSCRIPT },
        //             ...
        //         sprites:
        //             SPRITEVAR: SPRITENAME,
        //             ...
        //         sounds:
        //             SOUNDVAR: SOUNDNAME,
        //             ...
        //     }
        //
        // The resources will load into an object of the form:
        //
        //     {
        //         maps:
        //             MAPVAR: MAP,
        //             ...
        //         sprites:
        //             SPRITEVAR: SPRITE,
        //             ...
        //         sounds:
        //             SOUNDVAR: SOUND,
        //             ...
        //     }
        //
        // This object will be passed into the `@onload` callback, which
        // will be a good time for setting up a new scene to switch into.
        {
            LoaderScene: function () {
                function LoaderScene(resources, onload) {
                    _classCallCheck(this, LoaderScene);

                    this.resources = resources;
                    this.onload = onload;
                    this.loaded = {
                        maps: {},
                        sprites: {},
                        sounds: {}
                    };

                    var resource_count = 0;
                    for (var type in this.resources) {
                        var obj = this.resources[type];
                        resource_count += Object.keys(obj).length;
                    }
                    this.resource_count = resource_count;

                    if (resource_count <= 0) {
                        throw 'invalid resource count (' + resource_count + ')';
                    }
                    return;
                }

                _createClass(LoaderScene, [{
                    key: 'start',
                    value: function start() {
                        var Map = map.Map;
                        var Sprite = sprite.Sprite;
                        var Sound = audio.Sound;


                        var load_count = 0;
                        var loader = this;
                        this.progress = 0;
                        this.finished = false;

                        var callback = function callback() {
                            ++load_count;
                            loader.progress = load_count / loader.resource_count;
                            // console.log loader.progress
                            if (load_count === loader.resource_count) {
                                loader.finished = true;
                                if (loader.onload != null) {
                                    loader.onload(loader.loaded);
                                }
                            }
                            return;
                        };

                        for (var type in this.resources) {
                            var obj = this.resources[type];
                            var target = this.loaded[type];

                            if (type === 'maps') {
                                for (var key in obj) {
                                    var res = obj[key];
                                    target[key] = new Map(res.name, res.script, callback);
                                }
                            } else if (type === 'sprites') {
                                for (var key in obj) {
                                    var res = obj[key];
                                    target[key] = new Sprite(res, callback);
                                }
                            } else if (type === 'sounds') {
                                for (var key in obj) {
                                    var res = obj[key];
                                    target[key] = new Sound(res, callback);
                                }
                            } else {
                                throw 'attempting to load unknown type ' + type;
                            }
                        }
                        return;
                    }
                }, {
                    key: 'end',
                    value: function end() {
                        return;
                    }
                }, {
                    key: 'update',
                    value: function update(dt) {
                        return;
                    }
                }, {
                    key: 'draw',
                    value: function draw(context) {
                        return;
                    }
                }]);

                return LoaderScene;
            }()
        }
    );
});
});

require.register("boredjs/map.js", function(exports, require, module) {
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['jquery', './game', './input', './entity', './geometry', './util'], function ($, game, input, entity, geometry, util) {
    // A prefix and suffix applied to names passed into map constructors
    // so that it loads from the right place.
    var numt = void 0;
    var cw = void 0;
    var ch = void 0;
    var url_prefix = 'assets/';
    var url_suffix = '.json';

    // If `layers_cached` is true, then tiles will be cached in blocks
    // of `layer_cache_factor` square and the blocks will be drawn
    // instead of tiles.
    var layers_cached = true;
    var layer_cache_factor = 16;

    // Comparison helper functions for sorting entities.
    var byLeftBound = function byLeftBound(ent_a, ent_b) {
        return ent_a.x + ent_a.shape.bounds_offsets[0] - ent_b.x - ent_b.shape.bounds_offsets[0];
    };

    var byBottomBound = function byBottomBound(ent_a, ent_b) {
        return ent_a.y + ent_a.shape.bounds_offsets[3] - ent_b.y - ent_b.shape.bounds_offsets[3];
    };

    // This module expects maps created in [Tiled](http://www.mapeditor.org/)
    // and exported using the JSON option.
    // Refer to the [TMX Map Format](https://github.com/bjorn/tiled/wiki/TMX-Map-Format)
    // for information on how the map format works.

    var TileSet = function () {
        function TileSet(json_data, onload) {
            _classCallCheck(this, TileSet);

            this.name = json_data.name;
            this.first_gid = json_data.firstgid;
            this.tile_width = json_data.tilewidth;
            this.tile_height = json_data.tileheight;
            this.margin = json_data.margin;
            this.spacing = json_data.spacing;
            this.properties = json_data.properties;

            var tileset = this;
            this.image = new Image();
            this.image.onload = function () {
                var iw = this.naturalWidth;
                var ih = this.naturalHeight;
                if (iw !== json_data.imagewidth || ih !== json_data.imageheight) {
                    throw 'tileset ' + tileset.name + ' dimension mismatch (' + iw + 'x' + ih + ' vs ' + this.naturalWidth + 'x' + this.naturalHeight + ')';
                }

                tileset.setupTileMapping();
                if (onload != null) {
                    return onload();
                }
            };
            this.image.src = url_prefix + json_data.image;
            return;
        }

        _createClass(TileSet, [{
            key: 'setupTileMapping',
            value: function setupTileMapping() {
                var img = this.image;
                var iw = img.naturalWidth;
                var ih = img.naturalHeight;
                var tw = this.tile_width;
                var th = this.tile_height;

                var margin = this.margin;

                var twps = tw + this.spacing;
                var thps = th + this.spacing;

                var numtx = (iw - margin) / twps | 0;
                var numty = (ih - margin) / thps | 0;
                this.num_tiles = numt = numtx * numty;

                var grabTile = function grabTile(xiter, yiter) {
                    var tcanvas = document.createElement('canvas');
                    tcanvas.width = tw;
                    tcanvas.height = th;

                    var sx = margin + xiter * twps;
                    var sy = margin + yiter * thps;

                    var tctx = tcanvas.getContext('2d');
                    tctx.drawImage(img, sx, sy, tw, th, 0, 0, tw, th);

                    return tcanvas;
                };

                this.tiles = __range__(0, numt, false).map(function (i) {
                    return grabTile(i % numtx, i / numtx | 0);
                });

                return;
            }
        }, {
            key: 'hasGID',
            value: function hasGID(gid) {
                return this.first_gid <= gid && gid < this.first_gid + this.num_tiles;
            }
        }, {
            key: 'drawTile',
            value: function drawTile(context, gid, flip_h, flip_v, flip_d, x, y) {
                var idx = gid - this.first_gid;
                var tw = this.tile_width;
                var th = this.tile_height;

                context.save();

                context.translate(x, y);
                if (flip_h) {
                    context.transform(-1, 0, 0, 1, tw, 0);
                }
                if (flip_v) {
                    context.transform(1, 0, 0, -1, 0, th);
                }
                if (flip_d) {
                    context.transform(0, 1, 1, 0, 0, 0);
                }

                context.drawImage(this.tiles[idx], 0, 0);

                context.restore();
                return;
            }
        }]);

        return TileSet;
    }();

    var Layer = function Layer(json_data, map) {
        _classCallCheck(this, Layer);

        this.map = map;
        this.name = json_data.name;
        this.type = json_data.type;
        this.properties = json_data.properties;
        this.visible = json_data.visible;
        this.opacity = json_data.opacity;
        this.x = json_data.x;
        this.y = json_data.y;
        this.width = json_data.width;
        this.height = json_data.height;
        return;
    };

    var TileLayer = function (_Layer) {
        _inherits(TileLayer, _Layer);

        function TileLayer(json_data, map) {
            _classCallCheck(this, TileLayer);

            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TileLayer).call(this, json_data, map));

            if (_this.type !== 'tilelayer') {
                throw 'can\'t construct TileLayer from ' + _this.type + ' layer';
            }

            var parseGID = function parseGID(gid) {
                var flip_h = false;
                // Javascript uses 32-bit signed bitwise ops, but
                // values are written to json unsigned in Tiled.
                if (gid > 2147483648) {
                    flip_h = true;
                    gid -= 2147483648;
                }
                var flip_v = gid & 1073741824 ? true : false;
                var flip_d = gid & 536870912 ? true : false;
                gid &= ~1610612736;
                return [gid, flip_h, flip_v, flip_d];
            };

            var width = _this.width;
            var height = _this.height;

            _this.data = [];
            var iterable = __range__(0, width, false);
            for (var k = 0; k < iterable.length; k++) {
                var i = iterable[k];
                var iterable1 = __range__(0, height, false);
                for (var i1 = 0; i1 < iterable1.length; i1++) {
                    var j = iterable1[i1];
                    _this.data.push(parseGID(json_data.data[i + j * width]));
                }
            }

            // Parallax can be set in tile layer properties in Tiled.
            if (_this.properties != null) {
                if (_this.properties.parallax != null) {
                    _this.parallax = +_this.properties.parallax;
                }
            } else {
                _this.parallax = 1;
            }

            return _possibleConstructorReturn(_this);
        }

        _createClass(TileLayer, [{
            key: 'buildCache',
            value: function buildCache() {
                var layer = this;
                var lcf = layer_cache_factor;
                var w = this.width;
                var h = this.height;
                var tw = this.map.tilewidth;
                var th = this.map.tileheight;
                this.cache_width = cw = Math.ceil(w / lcf);
                this.cache_height = ch = Math.ceil(h / lcf);

                var cacheBlock = function cacheBlock(bi, bj) {
                    var nbx = Math.min(lcf, w - bi);
                    var nby = Math.min(lcf, h - bj);

                    var canvas = document.createElement('canvas');
                    canvas.width = tw * nbx;
                    canvas.height = th * nby;

                    var context = canvas.getContext('2d');
                    layer.drawRaw(context, bi, bi + nbx, bj, bj + nby, 0, 0);

                    return canvas;
                };
                this.cache = [];
                var iterable = __range__(0, cw, false);
                for (var k = 0; k < iterable.length; k++) {
                    var i = iterable[k];
                    var iterable1 = __range__(0, ch, false);
                    for (var i1 = 0; i1 < iterable1.length; i1++) {
                        var j = iterable1[i1];
                        this.cache.push(cacheBlock(i * lcf, j * lcf));
                    }
                }

                return;
            }
        }, {
            key: 'setTile',
            value: function setTile(txi, tyi, td) {
                this.data[txi][tyi] = td;
                if (layers_cached) {
                    var map = this.map;

                    var lcf = layer_cache_factor;
                    var ci = txi / lcf | 0;
                    var cj = tyi / lcf | 0;
                    var block = this.cache[ci][cj];
                    var bxo = txi % lcf * map.tilewidth;
                    var byo = tyi % lcf * map.tileheight;
                    var context = block.getContext('2d');
                    map.drawTile(context, td[0], td[1], td[2], td[3], bxo, byo);
                }
                return;
            }
        }, {
            key: 'drawRaw',
            value: function drawRaw(context, lowtx, hightx, lowty, highty, dx, dy) {
                var map = this.map;

                var tw = map.tilewidth;
                var th = map.tileheight;
                var data = this.data;

                var iterable = __range__(lowtx, hightx, false);
                for (var k = 0; k < iterable.length; k++) {
                    var i = iterable[k];
                    var iterable1 = __range__(lowty, highty, false);
                    for (var i1 = 0; i1 < iterable1.length; i1++) {
                        var j = iterable1[i1];
                        var datum = data[i][j];
                        map.drawTile(context, datum[0], datum[1], datum[2], datum[3], dx + (i - lowtx) * tw, dy + (j - lowty) * th);
                    }
                }
                return;
            }
        }, {
            key: 'draw',
            value: function draw(context, targx, targy) {
                var map = this.map;

                var cam = map.camera;
                var cambounds = cam.shape.bounds_offsets;

                var tw = map.tilewidth;
                var th = map.tileheight;

                var mlcamxwp = cam.x * this.parallax - this.x * tw;
                var mlcamywp = cam.y * this.parallax - this.y * th;

                var w = cambounds[1] - cambounds[0];
                var h = cambounds[3] - cambounds[2];

                var destx = targx - mlcamxwp;
                var desty = targy - mlcamywp;

                var mlsx = mlcamxwp + cambounds[0];
                var mlsy = mlcamywp + cambounds[2];

                context.save();

                context.beginPath();
                cam.shapeSubpath(context, targx - cam.x, targy - cam.y);
                context.clip();

                context.globalAlpha *= this.opacity;

                if (layers_cached) {
                    var cache = this.cache;

                    var lcf = layer_cache_factor;
                    var bw = tw * lcf;
                    var bh = th * lcf;
                    var lowbx = Math.max(0, mlsx / bw | 0);
                    var highbx = Math.min(this.cache_width, Math.ceil((mlsx + w) / bw));
                    var lowby = Math.max(0, mlsy / bh | 0);
                    var highby = Math.min(this.cache_height, Math.ceil((mlsy + h) / bh));

                    var iterable = __range__(lowbx, highbx, false);
                    for (var k = 0; k < iterable.length; k++) {
                        var i = iterable[k];
                        var iterable1 = __range__(lowby, highby, false);
                        for (var i1 = 0; i1 < iterable1.length; i1++) {
                            var j = iterable1[i1];
                            context.drawImage(cache[i][j], Math.round(destx + i * bw), Math.round(desty + j * bh));
                        }
                    }
                } else {
                    var lowtx = Math.max(0, mlsx / tw | 0);
                    var hightx = Math.min(this.width, Math.ceil((mlsx + w) / tw));
                    var lowty = Math.max(0, mlsy / th | 0);
                    var highty = Math.min(this.height, Math.ceil((mlsy + h) / th));

                    this.drawRaw(context, lowtx, hightx, lowty, highty, Math.round(destx + lowtx * tw), Math.round(desty + lowty * th));
                }

                context.restore();
                return;
            }
        }]);

        return TileLayer;
    }(Layer);

    var ObjectLayer = function (_Layer2) {
        _inherits(ObjectLayer, _Layer2);

        function ObjectLayer(json_data, map) {
            _classCallCheck(this, ObjectLayer);

            // Bitmasks are created from a comma-separated list of
            // integers from 0-31. They are used to determine collision
            // groups for zones and obstruction groups.
            var tryMakingBitmaskFromString = function tryMakingBitmaskFromString(bitmask_str) {
                if (bitmask_str != null) {
                    return constructBitmask(bitmask_str.split(','));
                }
                return 0;
            };

            var Point = geometry.Point;
            var Aabb = geometry.Aabb;
            var Polyline = geometry.Polyline;
            var Polygon = geometry.Polygon;
            var Entity = entity.Entity;
            var constructBitmask = util.constructBitmask;

            var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectLayer).call(this, json_data, map));

            if (_this2.type !== 'objectgroup') {
                throw 'can\'t construct ObjectLayer from ' + _this2.type + ' layer';
            }

            var objects = json_data.objects;

            _this2.entities = [];
            var mapents = map.entities;

            if (_this2.properties != null) {
                var l_collides = tryMakingBitmaskFromString(_this2.properties.collides);
                var l_onCollide = map.tryGettingCallbackForName(_this2.properties.onCollide);

                var l_obstructs = tryMakingBitmaskFromString(_this2.properties.obstructs);
                var l_onObstruct = map.tryGettingCallbackForName(_this2.properties.onObstruct);
            }

            var setupEntityWithProperties = function setupEntityWithProperties(ent, object) {
                if (object.properties != null) {
                    ent.onStart = map.tryGettingCallbackForName(object.properties.onStart);

                    // Object level callbacks take precedence over layer
                    // level callbacks.

                    var obj_onCollide = map.tryGettingCallbackForName(object.properties.onCollide);

                    if (obj_onCollide != null) {
                        ent.onCollide = obj_onCollide;
                    } else {
                        ent.onCollide = l_onCollide;
                    }

                    var obj_onObstruct = map.tryGettingCallbackForName(object.properties.onObstruct);

                    if (obj_onObstruct != null) {
                        ent.onObstruct = obj_onObstruct;
                    } else {
                        ent.onObstruct = l_onObstruct;
                    }
                }

                // These objects are assumed not to move, so they
                // may act as static obstructions/zones.
                ent.static = true;

                if (object.properties != null) {
                    // Bitmasks from the object and layer are combined.
                    var obj_collides = tryMakingBitmaskFromString(object.properties.collides);
                    ent.collides = l_collides | obj_collides;

                    var obj_obstructs = tryMakingBitmaskFromString(object.properties.obstructs);
                    ent.obstructs = l_obstructs | obj_obstructs;

                    ent.properties = object.properties;
                }

                return;
            };

            for (var j = 0; j < objects.length; j++) {
                var object = objects[j];
                var objx = object.x;
                var objy = object.y;
                var objw = object.width;
                var objh = object.height;

                if (object.polygon != null) {
                    var ent = new Entity(objx, objy, new Polygon(object.polygon.map(function (point) {
                        return [point.x, point.y];
                    })));
                } else if (object.polyline != null) {
                    // Polylines are modeled as multiple polygons.
                    var iterable = __range__(0, object.polyline.length - 1, false);
                    for (var k = 0; k < iterable.length; k++) {
                        var i = iterable[k];
                        var point_a = object.polyline[i];
                        var point_b = object.polyline[i + 1];
                        var ent = new Entity(objx, objy, new Polygon([[point_a.x, point_a.y], [point_b.x, point_b.y]]));

                        setupEntityWithProperties(ent, object);
                        _this2.addEntity(ent);
                    }
                    continue;
                } else if (objw === 0 && objh === 0) {
                    var ent = new Entity(objx, objy, new Point());
                } else {
                    var objhwx = .5 * objw;
                    var objhwy = .5 * objh;
                    var ent = new Entity(objx + objhwx, objy + objhwy, new Aabb([objhwx, objhwy]));
                }

                setupEntityWithProperties(ent, object);
                _this2.addEntity(ent);
            }

            _this2.entities.sort(byBottomBound);
            if (_this2.properties != null) {
                _this2.onStart = map.tryGettingCallbackForName(_this2.properties.onStart);
            }
            return _possibleConstructorReturn(_this2);
        }

        _createClass(ObjectLayer, [{
            key: 'addEntity',
            value: function addEntity(ent) {
                ent.layer = this;
                ent.map = this.map;
                this.entities.push(ent);
                return this.map.entities.push(ent);
            }
        }, {
            key: 'draw',
            value: function draw(context, targx, targy) {
                var map = this.map;

                var cam = map.camera;

                var xoff = targx - cam.x - this.x * map.tilewidth;
                var yoff = targy - cam.y - this.y * map.tileheight;

                var ents = this.entities;
                util.persistentSort(ents, byBottomBound);
                for (var i = 0; i < ents.length; i++) {
                    var ent = ents[i];
                    if (ent.draw != null) {
                        ent.draw(context, xoff, yoff);
                    }
                }
                return;
            }
        }, {
            key: 'debugDraw',
            value: function debugDraw(context, targx, targy) {
                var map = this.map;

                var cam = map.camera;
                var cambounds = cam.shape.bounds_offsets;
                var camlx = cam.x + cambounds[0];
                var camly = cam.y + cambounds[2];
                var w = cambounds[1] - cambounds[0];
                var h = cambounds[3] - cambounds[2];
                var destx = targx + cambounds[0];
                var desty = targy + cambounds[2];

                var xoff = destx - camlx - this.x * this.map.tilewidth;
                var yoff = desty - camly - this.y * this.map.tileheight;

                context.save();
                context.beginPath();
                context.globalAlpha *= .75;

                for (var i = 0; i < this.entities.length; i++) {
                    var ent = this.entities[i];
                    if (ent.boundsIntersects(cam)) {
                        ent.shapeSubpath(context, xoff, yoff);
                    }
                }

                context.stroke();

                context.restore();
                return;
            }
        }]);

        return ObjectLayer;
    }(Layer);

    // Maps are loaded from a URL containing `@name` and callbacks are
    // searched for inside of the `@script` passed.


    return {
        Map: function () {
            function Map(name, script, onload) {
                _classCallCheck(this, Map);

                this.name = name;
                this.script = script;
                this.loaded = false;
                this.entities = [];
                var cb_target = this;
                $.getJSON(url_prefix + this.name + url_suffix, function (data) {
                    cb_target.load(data, onload);return;
                });
                return;
            }

            _createClass(Map, [{
                key: 'load',
                value: function load(json_data, onload) {
                    if (json_data.orientation !== 'orthogonal') {
                        throw 'orientation ' + orientation + ' not supported';
                    }

                    this.width = json_data.width;
                    this.height = json_data.height;
                    this.tilewidth = json_data.tilewidth;
                    this.tileheight = json_data.tileheight;
                    this.orientation = json_data.orientation;
                    this.properties = json_data.properties;

                    var map = this;

                    var createLayer = function createLayer(data) {
                        var type = data.type;

                        if (type === 'tilelayer') {
                            return new TileLayer(data, map);
                        } else if (type === 'objectgroup') {
                            return new ObjectLayer(data, map);
                        } else {
                            console.warn('unknown layer type ' + type + ' requested');
                            return new Layer(data, map);
                        }
                    };

                    this.layers = json_data.layers.map(createLayer);

                    var tilesets = json_data.tilesets;

                    var tileset_load_total = tilesets.length;
                    var tileset_load_count = 0;
                    var ts_load_cb = function ts_load_cb() {
                        if (++tileset_load_count >= tileset_load_total) {
                            if (layers_cached) {
                                map.buildLayerCaches();
                            }
                            map.loaded = true;
                            if (onload != null) {
                                onload();
                            }
                        }
                        return;
                    };

                    this.tilesets = tilesets.map(function (ts) {
                        return new TileSet(ts, ts_load_cb);
                    });

                    this.entities.sort(byLeftBound);
                    return;
                }
            }, {
                key: 'tryGettingCallbackForName',
                value: function tryGettingCallbackForName(name) {
                    if (name != null) {
                        var callback = this.script[name];
                        if (callback != null) {
                            return callback;
                        } else {
                            throw 'missing callback ' + name + '!';
                        }
                    }
                    return null;
                }
            }, {
                key: 'buildLayerCaches',
                value: function buildLayerCaches() {
                    for (var i = 0; i < this.layers.length; i++) {
                        var layer = this.layers[i];
                        if (layer.type === 'tilelayer') {
                            layer.buildCache();
                        }
                    }
                    return;
                }
            }, {
                key: 'drawTile',
                value: function drawTile(context, gid, flip_h, flip_v, flip_d, x, y) {
                    for (var i = 0; i < this.tilesets.length; i++) {
                        var tileset = this.tilesets[i];
                        if (tileset.hasGID(gid)) {
                            tileset.drawTile(context, gid, flip_h, flip_v, flip_d, x, y);
                            break;
                        }
                    }
                    return;
                }
            }, {
                key: 'doCollisions',
                value: function doCollisions() {
                    var ents = this.entities;
                    util.persistentSort(ents, byLeftBound);
                    var j = 0;
                    var iterable = __range__(1, ents.length, false);
                    for (var i1 = 0; i1 < iterable.length; i1++) {
                        var i = iterable[i1];
                        var enti = this.entities[i];

                        while (j < i && ents[j].x + ents[j].shape.bounds_offsets[1] < enti.x + enti.shape.bounds_offsets[0]) {
                            ++j;
                        }

                        var iterable1 = __range__(j, i, false);
                        for (var j1 = 0; j1 < iterable1.length; j1++) {
                            var k = iterable1[j1];
                            this.doCollision(enti, this.entities[k]);
                        }
                    }

                    return;
                }
            }, {
                key: 'doCollision',
                value: function doCollision(ent_a, ent_b) {
                    if (ent_a.static && ent_b.static) {
                        return;
                    }

                    var can_collide = ent_a.collides & ent_b.collides;
                    var can_obstruct = ent_a.obstructs & ent_b.obstructs;

                    if (!can_collide && !can_obstruct) {
                        return;
                    }

                    var collision_info = ent_a.intersects(ent_b);

                    if (collision_info) {
                        var _collision_info = _slicedToArray(collision_info, 2);

                        var pen_amt = _collision_info[0];
                        var pen_dir = _collision_info[1];


                        var neg_collision_info = [pen_amt, [-pen_dir[0], -pen_dir[1]]];

                        if (ent_a.onCollide != null) {
                            ent_a.onCollide(ent_b, collision_info);
                        }
                        if (ent_b.onCollide != null) {
                            ent_b.onCollide(ent_a, neg_collision_info);
                        }

                        if (can_obstruct) {
                            var proj_x = pen_amt * pen_dir[0];
                            var proj_y = pen_amt * pen_dir[1];
                            if (ent_a.static) {
                                ent_b.x += proj_x;
                                ent_b.y += proj_y;
                            } else if (ent_b.static) {
                                ent_a.x -= proj_x;
                                ent_a.y -= proj_y;
                            } else {
                                // For now, splits the resolution 50-50 between
                                // dynamic objects.
                                var rat = .5;
                                var notrat = 1 - rat;

                                ent_a.x -= rat * proj_x;
                                ent_a.y -= rat * proj_y;
                                ent_b.x += notrat * proj_x;
                                ent_b.y += notrat * proj_y;
                            }

                            if (ent_a.onCollide != null) {
                                ent_a.onObstruct(ent_b, collision_info);
                            }
                            if (ent_b.onObstruct != null) {
                                ent_b.onObstruct(ent_a, neg_collision_info);
                            }
                        }
                    }
                    return;
                }

                // Gets a layer by name. Returns null if the layer is not found.

            }, {
                key: 'getLayerByName',
                value: function getLayerByName(name) {
                    for (var i = 0; i < this.layers.length; i++) {
                        var layer = this.layers[i];
                        if (layer.name === name) {
                            return layer;
                        }
                    }
                    return null;
                }
            }, {
                key: 'start',
                value: function start() {
                    for (var i = 0; i < this.layers.length; i++) {
                        var layer = this.layers[i];
                        if (layer.onStart != null) {
                            layer.onStart(layer);
                        }
                    }
                    for (var j = 0; j < this.entities.length; j++) {
                        var ent = this.entities[j];
                        if (ent.onStart != null) {
                            ent.onStart(ent);
                        }
                    }
                    return;
                }
            }, {
                key: 'update',
                value: function update(dt) {
                    for (var i = 0; i < this.entities.length; i++) {
                        var ent = this.entities[i];
                        if (ent.update != null) {
                            ent.update(dt);
                        }
                    }
                    this.doCollisions();
                    if (this.camera.post_update != null) {
                        this.camera.post_update(dt);
                    }
                    return;
                }
            }, {
                key: 'draw',
                value: function draw(context, targx, targy) {
                    for (var i = 0; i < this.layers.length; i++) {
                        var layer = this.layers[i];
                        layer.draw(context, targx, targy);
                    }
                    return;
                }
            }, {
                key: 'debugDraw',
                value: function debugDraw(context, targx, targy) {
                    var cam = this.camera;
                    var xoff = targx - cam.x;
                    var yoff = targy - cam.y;

                    var found_first = false;
                    var iterable = __range__(0, this.entities.length, false);
                    for (var j = 0; j < iterable.length; j++) {
                        var i = iterable[j];
                        var ent = this.entities[i];
                        if (ent.boundsIntersects(cam)) {
                            ent.shapeSubpath(context, xoff, yoff);
                            found_first = true;
                        } else if (found_first && cam.boundsLeftOf(ent)) {
                            break;
                        }
                    }

                    for (var k = 0; k < this.layers.length; k++) {
                        var layer = this.layers[k];
                        if (layer.type === 'objectgroup') {
                            layer.debugDraw(context, targx, targy);
                        }
                    }

                    return;
                }
            }]);

            return Map;
        }(),

        // A scene for running a map.
        MapScene: function () {
            function MapScene(map) {
                _classCallCheck(this, MapScene);

                this.map = map;
                return;
            }

            _createClass(MapScene, [{
                key: 'start',
                value: function start() {
                    if (!this.map.loaded) {
                        throw this.map.name + ' not loaded!';
                    }
                    var Entity = entity.Entity;
                    var Aabb = geometry.Aabb;

                    // Camera is initially positioned at the origin.

                    this.map.camera = new Entity(0, 0, new Aabb([.5 * game.width(), .5 * game.height()]));

                    this.map.entities.push(this.map.camera);

                    this.map.start();
                    return;
                }
            }, {
                key: 'end',
                value: function end() {}
            }, {
                key: 'update',
                value: function update(dt) {
                    this.map.update(dt);
                    return;
                }
            }, {
                key: 'draw',
                value: function draw(context) {
                    var gw = game.width();
                    var gh = game.height();
                    var hgw = .5 * gw;
                    var hgh = .5 * gh;

                    context.clearRect(0, 0, gw, gh);
                    context.beginPath();

                    this.map.draw(context, hgw, hgh);
                    if (input.debug.state) {
                        this.map.debugDraw(context, hgw, hgh);
                    }

                    return;
                }
            }]);

            return MapScene;
        }()
    };
});

function __range__(left, right, inclusive) {
    var range = [];
    var ascending = left < right;
    var end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
});

;require.register("boredjs/physics.js", function(exports, require, module) {
'use strict';

define(['./game'], function (game) {
    return(
        // Using ye old midpoint method
        {
            integrate: function integrate(obj, dt) {
                var v = obj.velocity || [0, 0];
                var a = obj.acceleration || [0, 0];
                var last_a = obj.last_acceleration || a;

                var damping = obj.damping || 1;

                v[0] *= damping;
                v[1] *= damping;

                obj.x = obj.x + v[0] * dt + a[0] * dt * dt;
                obj.y = obj.y + v[1] * dt + a[1] * dt * dt;

                v[0] = v[0] + a[0] * dt;
                v[1] = v[1] + a[1] * dt;

                obj.velocity = v;
                return;
            }
        }
    );
});
});

require.register("boredjs/sprite.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define(['jquery'], function ($) {
    // Similar to the map module, sprites are loaded via JSON from
    // a url constructed from @name.
    var url_prefix = 'assets/';
    var url_suffix = '.json';

    return {
        Sprite: function () {
            function Sprite(name, onload) {
                _classCallCheck(this, Sprite);

                this.name = name;
                this.loaded = false;
                var cb_target = this;
                $.getJSON(url_prefix + this.name + url_suffix, function (data) {
                    try {
                        cb_target.load(data, onload);
                    } catch (e) {
                        throw 'could not load sprite ' + url_prefix + cb_target.name + url_suffix;
                    }
                    return;
                });
                return;
            }

            // The sprite JSON format is as follows:
            //
            //     {
            //       "spritesheet": FILENAME,
            //       "offset": [SOFFX, SOFFY],
            //       "frames": [
            //         {
            //           "pos": [X, Y],
            //           "size": [W, H],
            //           "offset": [FOFFX, FOFFY]
            //         },
            //         ...
            //       ],
            //       "animations": {
            //         NAME: {
            //           "frames": [[INDEX, DURATION(, HFLIPPED)], ...],
            //           "loop": LOOP
            //         },
            //         ...
            //       }
            //     }
            //
            // Note: `FILENAME` is a string containing the name of the
            // image which contains the spritesheet, `[SOFFX, SOFFY]` is
            // the offset of the spritesheet in the image, `[X, Y]` is the
            // top-left corner of the frame described in the spritesheet,
            // `[W, H]` is the size of the frame, `[FOFFX, FOFFY]` is the
            // offset of the top left corner of the frame from the position
            // of the sprite (around which drawing flipped versions will
            // be based), `NAME` is a string naming an animation, `INDEX`
            // refers to the index of a frame, `DURATION` is how long that
            // frame should stay onscreen in seconds, and `LOOP` is true
            // or false depending on whether the animation should loop.


            _createClass(Sprite, [{
                key: 'load',
                value: function load(json_data, onload) {
                    var offset = json_data.offset;
                    var frames = json_data.frames;
                    var animations = json_data.animations;


                    for (var name in animations) {
                        var animation = animations[name];
                        var duration = 0;
                        for (var i = 0; i < animation.frames.length; i++) {
                            var frame = animation.frames[i];
                            duration += frame[1];
                        }
                        animations[name].duration = duration;
                    }

                    this.animations = animations;
                    var sprite = this;

                    var image = new Image();
                    image.onload = function () {
                        sprite.setupFrames(image, offset, frames);
                        this.loaded = true;
                        if (onload != null) {
                            onload();
                        }
                        return;
                    };
                    image.src = url_prefix + json_data.spritesheet;
                    return;
                }
            }, {
                key: 'setupFrames',
                value: function setupFrames(img, offset, frames) {
                    var grabFrame = function grabFrame(frame) {
                        var fw = frame.size[0];
                        var fh = frame.size[1];
                        var fcanvas = document.createElement('canvas');
                        fcanvas.width = fw;
                        fcanvas.height = fh;
                        var fctx = fcanvas.getContext('2d');
                        fctx.drawImage(img, offset[0] + frame.pos[0], offset[1] + frame.pos[1], fw, fh, 0, 0, fw, fh);

                        return fcanvas;
                    };

                    this.frames = frames.map(grabFrame);
                    this.frame_offsets = frames.map(function (frame) {
                        return frame.offset;
                    });
                    return;
                }
            }, {
                key: 'startAnimation',
                value: function startAnimation(anim_name) {
                    var anim_speed = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

                    this.current_animation = this.animations[anim_name];
                    this.animation_time = 0;
                    this.animation_speed = anim_speed;
                    return;
                }
            }, {
                key: 'update',
                value: function update(dt) {
                    this.animation_time += dt * this.animation_speed;
                    return;
                }
            }, {
                key: 'draw',
                value: function draw(context, x, y, flip_h) {
                    var cur_anim = this.current_animation;
                    var cur_anim_dur = cur_anim.duration;
                    var frame_index = -1;
                    var anim_time = this.animation_time;

                    if (cur_anim.loop) {
                        anim_time %= cur_anim_dur;
                    } else if (anim_time > cur_anim_dur) {
                        anim_time = cur_anim_dur;
                    }

                    for (var i = 0; i < cur_anim.frames.length; i++) {
                        var frame = cur_anim.frames[i];
                        anim_time -= frame[1];
                        if (anim_time <= 0) {
                            frame_index = frame[0];
                            var frame_hflipped = !!frame[2];
                            break;
                        }
                    }

                    var frame_img = this.frames[frame_index];
                    var frame_offset = this.frame_offsets[frame_index];

                    context.save();

                    context.translate(Math.round(x), Math.round(y));
                    if (!!flip_h !== frame_hflipped) {
                        context.transform(-1, 0, 0, 1, 0, 0);
                    }
                    context.drawImage(frame_img, frame_offset[0], frame_offset[1]);

                    context.restore();

                    return;
                }
            }]);

            return Sprite;
        }()
    };
});
});

require.register("boredjs/util.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

define(function () {
    // An implementation of insertion sort
    var insertionSort = function insertionSort(ary, cmp) {
        cmp = cmp || function (a, b) {
            if (a < b) {
                return -1;
            } else if (a === b) {
                return 0;
            } else {
                return 1;
            }
        };
        var iterable = __range__(1, ary.length, false);
        for (var k = 0; k < iterable.length; k++) {
            var i = iterable[k];
            var tmp = ary[i];
            var j = i;
            while (j > 0 && cmp(ary[j - 1], tmp) > 0) {
                ary[j] = ary[j - 1];
                --j;
            }
            ary[j] = tmp;
        }
        return;
    };

    // requestAnimationFrame shim by Erik Möller
    // with fixes from Paul Irish and Tino Zijdel.
    //
    // CoffeeScript port by Jacob Rus
    (function () {
        var w = window;
        var iterable = ['ms', 'moz', 'webkit', 'o'];
        for (var i = 0; i < iterable.length; i++) {
            var vendor = iterable[i];
            if (w.requestAnimationFrame) {
                break;
            }
            w.requestAnimationFrame = w[vendor + 'RequestAnimationFrame'];
            w.cancelAnimationFrame = w[vendor + 'CancelAnimationFrame'] || w[vendor + 'CancelRequestAnimationFrame'];
        }

        // Deal with the case where rAF is built in but cAF is not.
        if (w.requestAnimationFrame) {
            var _ret = function () {
                if (w.cancelAnimationFrame) {
                    return {
                        v: void 0
                    };
                }
                var browserRaf = w.requestAnimationFrame;
                var canceled = {};
                w.requestAnimationFrame = function (callback) {
                    var id = void 0;
                    return id = browserRaf(function (time) {
                        if (id in canceled) {
                            return delete canceled[id];
                        } else {
                            return callback(time);
                        }
                    });
                };
                w.cancelAnimationFrame = function (id) {
                    return canceled[id] = true;
                };

                // Handle legacy browsers which don’t implement rAF.
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
                (function () {
                    var targetTime = 0;
                    w.requestAnimationFrame = function (callback) {
                        var currentTime = void 0;
                        targetTime = Math.max(targetTime + 16, currentTime = +new Date());
                        return w.setTimeout(function () {
                            return callback(+new Date());
                        }, targetTime - currentTime);
                    };

                    w.cancelAnimationFrame = function (id) {
                        return clearTimeout(id);
                    };
                })();
            }

        return;
    })();

    // Performance.now polyfill.
    // Thanks Tony Gentilcore for the [heads up](http://gent.ilcore.com/2012/06/better-timer-for-javascript.html).
    var pNow = function () {
        // A monotonic but slightly inaccurate timer in seconds.
        // Referenced Kevin Reid's implementation.
        var time_offset = 0;
        var time_seen = 0;
        var fallback = function fallback() {
            var t = Date.now();
            if (t < time_seen) {
                time_offset += time_seen - t;
            }
            time_seen = t;
            return t + time_offset;
        };

        if (typeof performance !== 'undefined' && performance !== null) {
            if (performance.now != null) {
                return performance.now;
            }

            var iterable = ['ms', 'moz', 'webkit', 'o'];
            for (var i = 0; i < iterable.length; i++) {
                var vendor = iterable[i];
                pNow = performance[vendor + 'Now'];
                if (pNow != null) {
                    return pNow;
                }
            }
        }

        return fallback;
    }();

    // An epsilon for things involving real numbers and convergence.
    return {
        EPSILON: Math.pow(2, -50),

        time: function time() {
            return .001 * pNow.call(window.performance);
        },


        // Insertion sort is used as a sort for arrays which don't change
        // order much between frames.
        persistentSort: insertionSort,

        // Constructs a 32-bit bitmask from an array of values ranging from
        // 0 to 31 inclusive.
        constructBitmask: function constructBitmask(group_array) {
            var mask = 0;
            for (var i = 0; i < group_array.length; i++) {
                var group = group_array[i];
                mask |= 1 << group;
            }
            return mask;
        },


        // Turns an RGB tuple into a web-friendly hex representation.
        rgbToHex: function rgbToHex(r, g, b) {
            var toTwoDigitHex = function toTwoDigitHex(v) {
                return ('00' + Math.min(Math.max(Math.round(v * 256), 0), 255).toString(16)).substr(-2);
            };
            return '#' + toTwoDigitHex(r) + toTwoDigitHex(g) + toTwoDigitHex(b);
        },


        // Prepares a coroutine set from generator constructors
        prepareCoroutineSet: function prepareCoroutineSet(updateGenerator, drawGenerator) {
            var updateGen = updateGenerator();
            var drawGen = drawGenerator();
            updateGen.next();
            drawGen.next();

            return {
                update: updateGen,
                draw: drawGen
            };
        }
    };
});
function __range__(left, right, inclusive) {
    var range = [];
    var ascending = left < right;
    var end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=bored.js.map