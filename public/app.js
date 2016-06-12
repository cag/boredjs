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
require.register("cg.js", function(exports, require, module) {
'use strict';

// This is an auto-generated source file.
define(['cg/audio', 'cg/entity', 'cg/game', 'cg/geometry', 'cg/input', 'cg/loader', 'cg/map', 'cg/physics', 'cg/sprite', 'cg/util'], function (audio, entity, game, geometry, input, loader, map, physics, sprite, util) {
    return {
        audio: audio,
        entity: entity,
        game: game,
        geometry: geometry,
        input: input,
        loader: loader,
        map: map,
        physics: physics,
        sprite: sprite,
        util: util
    };
});
});

require.register("character.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['./cg'], function (cg) {
    var input = cg.input;
    var audio = cg.audio;
    var util = cg.util;
    var game = cg.game;
    var geometry = cg.geometry;
    var entity = cg.entity;
    var physics = cg.physics;

    var Character = function (_entity$Entity) {
        _inherits(Character, _entity$Entity);

        function Character(x, y, shape, sprite) {
            _classCallCheck(this, Character);

            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Character).call(this, x, y, shape));

            _this.sprite = sprite;
            _this.sprite.startAnimation('look down');
            return _this;
        }

        _createClass(Character, [{
            key: 'draw',
            value: function draw(context, offx, offy) {
                this.sprite.draw(context, this.x + offx, this.y + offy, this.facing_left);
                return;
            }
        }]);

        return Character;
    }(entity.Entity);

    return function (_Character) {
        _inherits(PlayerCharacter, _Character);

        function PlayerCharacter(x, y, shape, sprite) {
            _classCallCheck(this, PlayerCharacter);

            var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(PlayerCharacter).call(this, x, y, shape, sprite));

            _this2.state = 'look down';
            _this2.dir = 'down';

            var _game$currentScene = game.currentScene();

            var map = _game$currentScene.map;

            var player = _this2;
            var ent_layer = map.getLayerByName('Entities');

            _this2.activation_point_check = new entity.Entity(x, y + 2 * _this2.shape.bounds_offsets[3], new geometry.Point());
            _this2.activation_point_check.collides = util.constructBitmask([0]);
            _this2.activation_point_check.onCollide = function (ent, info) {
                if (game.state === 'world' && input.jump.pressed) {
                    if (!(ent.onActivate != null) && ent.properties != null) {
                        ent.onActivate = map.tryGettingCallbackForName(ent.properties.onActivate);
                    }
                    ent.onActivate(ent);
                }
                return;
            };
            ent_layer.addEntity(_this2.activation_point_check);

            map.camera.post_update = function (dt) {
                this.x = player.x;
                this.y = player.y;
                return;
            };
            return _this2;
        }

        _createClass(PlayerCharacter, [{
            key: 'update',
            value: function update(dt) {
                var sprite = this.sprite;
                var state = this.state;

                var switchStateTo = function switchStateTo(name) {
                    if (state !== name) {
                        sprite.startAnimation(name);
                        state = name;
                    }
                    return;
                };

                if (game.state === 'world') {
                    var vxc = 0.0;
                    var vyc = 0.0;

                    if (input.left.state && !input.right.state) {
                        this.facing_left = true;
                        vxc = -1.0;
                        this.dir = 'right';
                    } else if (input.right.state && !input.left.state) {
                        this.facing_left = false;
                        vxc = 1.0;
                        this.dir = 'right';
                    }

                    if (input.up.state && !input.down.state) {
                        vyc = -1.0;
                        this.dir = 'up';
                    } else if (input.down.state && !input.up.state) {
                        vyc = 1.0;
                        this.dir = 'down';
                    }

                    if (vyc === 0.0) {
                        if (vxc === 0.0) {
                            switchStateTo('look ' + this.dir);
                        } else {
                            switchStateTo('go right');
                        }
                    } else if (vyc < 0.0) {
                        switchStateTo('go up');
                    } else if (vyc > 0.0) {
                        switchStateTo('go down');
                    }

                    this.state = state;
                    this.velocity = [64.0 * vxc, 64.0 * vyc];
                    physics.integrate(this, dt);

                    // TODO: make this better
                    if (this.dir === 'right') {
                        if (this.facing_left) {
                            this.activation_point_check.x = this.x + 2 * this.shape.bounds_offsets[0];
                            this.activation_point_check.y = this.y;
                        } else {
                            this.activation_point_check.x = this.x + 2 * this.shape.bounds_offsets[1];
                            this.activation_point_check.y = this.y;
                        }
                    } else if (this.dir === 'up') {
                        this.activation_point_check.x = this.x;
                        this.activation_point_check.y = this.y + 2 * this.shape.bounds_offsets[2];
                    } else if (this.dir === 'down') {
                        this.activation_point_check.x = this.x;
                        this.activation_point_check.y = this.y + 2 * this.shape.bounds_offsets[3];
                    }
                }

                sprite.update(dt);
                return;
            }
        }]);

        return PlayerCharacter;
    }(Character);
});
});

require.register("demo.js", function(exports, require, module) {
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

define(['./cg'], function (cg) {
    var input = cg.input;
    var audio = cg.audio;
    var util = cg.util;
    var game = cg.game;
    var geometry = cg.geometry;
    var entity = cg.entity;
    var physics = cg.physics;

    var player_sprite = null;

    return {
        setupSky: function setupSky(layer) {
            layer.draw = function (context, targx, targy) {
                var cam = this.map.camera;

                context.beginPath();
                cam.shapeSubpath(context, targx - cam.x, targy - cam.y);
                context.fillStyle = '#A5DFEA';
                context.fill();
                return;
            };
            return;
        },
        setPlayerSprite: function setPlayerSprite(sprite) {
            player_sprite = sprite;
            return;
        },
        handlePlayerStart: function handlePlayerStart(obj) {
            // actx = audio.getAudioContext()
            // if actx?
            //     osc = actx.createOscillator()
            //     osc.type = osc.TRIANGLE

            //     gain = actx.createGain()
            //     gain.gain.value = .25

            //     osc.connect gain
            //     gain.connect actx.destination

            //     time_ptr = actx.currentTime
            //     note_dur = .25
            //     for tuning_factor in audio.ptolemy_tuning_factors
            //         osc.frequency.setValueAtTime \
            //             1.0 * audio.ptolemy_c4 * tuning_factor,
            //             time_ptr
            //         time_ptr += note_dur

            //     osc.frequency.setValueAtTime \
            //         audio.ptolemy_c4 * .25,
            //         time_ptr

            //     time_ptr += note_dur
            //     osc.start actx.currentTime
            //     osc.stop time_ptr

            var player = new entity.Entity(obj.x, obj.y, new geometry.Aabb([2, 11]));

            player_sprite.startAnimation('idle');
            player.sprite = player_sprite;

            player.obstructs = util.constructBitmask([0]);

            var walk_vel_threshold = 2;
            var walk_accel = 640;
            var walk_anim_speed_factor = .125;
            var run_vel_threshold = 16;
            var run_accel = 2560;
            var run_anim_speed_factor = .125 / 3;
            var grounded_damping = .25;
            var jump_vel = -160;
            var jump_release_factor = .5;
            var aerial_move_accel = 32;
            var aerial_damping = .984375;
            var wall_slide_damping = .875;
            var wall_jump_angle = .25 * Math.PI;
            var wall_jump_speed = -160;
            var gravity = 160;

            var cos_wja = Math.cos(wall_jump_angle);
            var sin_wja = Math.sin(wall_jump_angle);

            player.update = function (dt) {
                var v = this.velocity || [0, 0];
                var a = [0, 0];

                var x_spd = Math.abs(this.x - (this.last_x || this.x)) / game.lastDt();

                var sprite = this.sprite;
                var state = this.state;

                var switchStateTo = function switchStateTo(name) {
                    if (state !== name) {
                        sprite.startAnimation(name);
                        state = name;
                    }
                    return;
                };

                if (input.left.state && !input.right.state) {
                    this.facing_left = true;
                } else if (input.right.state && !input.left.state) {
                    this.facing_left = false;
                }

                var moving_forward = this.facing_left && v[0] < -walk_vel_threshold || !this.facing_left && v[0] > walk_vel_threshold;

                var running_forward = moving_forward && Math.abs(v[0]) > run_vel_threshold;

                if (input.debug.pressed) {
                    console.log(running_forward);
                }

                if (this.grounded) {
                    if (!moving_forward || this.against_wall) {
                        switchStateTo('idle');
                    } else if (running_forward) {
                        switchStateTo('run');
                        sprite.animation_speed = x_spd * run_anim_speed_factor;
                    } else {
                        switchStateTo('walk');
                        sprite.animation_speed = x_spd * walk_anim_speed_factor;
                    }

                    if (input.jump.pressed) {
                        switchStateTo('jump');
                        v[1] = jump_vel;
                        this.damping = aerial_damping;
                    } else {
                        var move_accel = input.run.state ? run_accel : walk_accel;
                        if (input.left.state && !input.right.state) {
                            a[0] -= move_accel * this.ground_normal[1];
                            a[1] += move_accel * this.ground_normal[0];
                        } else if (input.right.state && !input.left.state) {
                            a[0] += move_accel * this.ground_normal[1];
                            a[1] -= move_accel * this.ground_normal[0];
                        }

                        this.damping = grounded_damping;
                    }
                } else {
                    if (input.left.state) {
                        a[0] -= aerial_move_accel;
                    }
                    if (input.right.state) {
                        a[0] += aerial_move_accel;
                    }
                    a[1] += gravity;
                    if (v[1] < 0 && input.jump.released) {
                        v[1] *= jump_release_factor;
                    } else {
                        this.damping = aerial_damping;
                        if (this.sliding && input.jump.pressed) {
                            if (this.wall_normal[0] > 0) {
                                v[0] = wall_jump_speed * geometry.dotProduct(this.wall_normal, [cos_wja, -sin_wja]);
                                v[1] = wall_jump_speed * geometry.dotProduct(this.wall_normal, [sin_wja, cos_wja]);
                            } else if (this.wall_normal[0] < 0) {
                                v[0] = wall_jump_speed * geometry.dotProduct(this.wall_normal, [cos_wja, sin_wja]);
                                v[1] = wall_jump_speed * geometry.dotProduct(this.wall_normal, [-sin_wja, cos_wja]);
                            } else {
                                console.warn('wall jump strangeness');
                            }
                            switchStateTo('wall jump');
                        } else if (this.against_wall && v[1] > 0) {
                            this.damping = wall_slide_damping;
                            switchStateTo('wall slide');
                            this.facing_left = this.wall_normal[0] > 0;
                        } else if (this.sliding) {
                            switchStateTo('slide');
                            this.facing_left = this.wall_normal[0] > 0;
                        } else if (v[1] > 0) {
                            switchStateTo('fall');
                        }
                    }
                }

                if (this.grounded && (a[0] !== 0 || v[1] < 0)) {
                    a[1] += gravity;
                    this.grounded = false;
                }

                this.sliding = false;
                this.against_wall = false;

                this.acceleration = a;
                this.velocity = v;
                this.last_x = this.x;
                physics.integrate(this, dt);

                this.state = state;
                sprite.update(dt);
                return;
            };

            player.onCollide = function (other, info) {
                var _info = _slicedToArray(info, 2);

                var pen_amt = _info[0];
                var pen_dir = _info[1];

                if (input.debug.pressed) {
                    console.log(pen_dir);
                }
                if (pen_dir[1] >= Math.abs(pen_dir[0])) {
                    this.grounded = true;
                    this.ground_normal = pen_dir;
                } else if (pen_dir[1] >= 0) {
                    this.sliding = true;
                    this.wall_normal = pen_dir;
                    if (input.left.state && pen_dir[0] < -Math.abs(pen_dir[1]) || input.right.state && pen_dir[0] > Math.abs(pen_dir[1])) {
                        this.against_wall = true;
                    }
                }
                return;
            };

            player.draw = function (context, offx, offy) {
                this.sprite.draw(context, this.x + offx, this.y + offy, this.facing_left);
                return;
            };

            obj.layer.addEntity(player);

            obj.map.camera.post_update = function (dt) {
                this.x = player.x;
                this.y = player.y;
                return;
            };

            return;
        }
    };
});
});

require.register("demo2.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['./cg', './ui'], function (cg, ui) {
    var input = cg.input;
    var audio = cg.audio;
    var util = cg.util;
    var game = cg.game;
    var geometry = cg.geometry;
    var entity = cg.entity;
    var physics = cg.physics;
    var map = cg.map;


    var fadeIn = function fadeIn(duration, callback) {
        var t_accum = 0.0;
        var updateGenerator = regeneratorRuntime.mark(function updateGenerator() {
            var dt;
            return regeneratorRuntime.wrap(function updateGenerator$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(t_accum < duration)) {
                                _context.next = 7;
                                break;
                            }

                            _context.next = 3;
                            return undefined;

                        case 3:
                            dt = _context.sent;

                            t_accum += dt;
                            _context.next = 0;
                            break;

                        case 7:
                            if (!(callback != null)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('return', callback());

                        case 9:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, updateGenerator, this);
        });
        var drawGenerator = regeneratorRuntime.mark(function drawGenerator() {
            return regeneratorRuntime.wrap(function drawGenerator$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.delegateYield(regeneratorRuntime.mark(function _callee() {
                                var result, context, alpha;
                                return regeneratorRuntime.wrap(function _callee$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                result = [];

                                            case 1:
                                                if (!(t_accum < duration)) {
                                                    _context2.next = 10;
                                                    break;
                                                }

                                                _context2.next = 4;
                                                return undefined;

                                            case 4:
                                                context = _context2.sent;
                                                alpha = 1.0 - Math.min(t_accum / duration, 1.0);

                                                context.fillStyle = 'rgba(0,0,0,' + alpha + ')';
                                                result.push(context.fillRect(0, 0, game.width(), game.height()));
                                                _context2.next = 1;
                                                break;

                                            case 10:
                                                return _context2.abrupt('return', result);

                                            case 11:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee, this);
                            }).call(this), 't0', 1);

                        case 1:
                            return _context3.abrupt('return', _context3.t0);

                        case 2:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, drawGenerator, this);
        });

        return util.prepareCoroutineSet(updateGenerator, drawGenerator);
    };

    var DemoScene = function (_map$MapScene) {
        _inherits(DemoScene, _map$MapScene);

        function DemoScene() {
            _classCallCheck(this, DemoScene);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(DemoScene).apply(this, arguments));
        }

        _createClass(DemoScene, [{
            key: 'start',
            value: function start() {
                _get(Object.getPrototypeOf(DemoScene.prototype), 'start', this).call(this);
                game.state = 'fx';
                return game.invoke(fadeIn(0.5, function () {
                    return game.state = 'world';
                }));
            }
        }]);

        return DemoScene;
    }(map.MapScene);

    var Character = function (_entity$Entity) {
        _inherits(Character, _entity$Entity);

        function Character(x, y, shape, sprite) {
            _classCallCheck(this, Character);

            var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Character).call(this, x, y, shape));

            _this2.sprite = sprite;
            _this2.sprite.startAnimation('look down');
            return _this2;
        }

        _createClass(Character, [{
            key: 'draw',
            value: function draw(context, offx, offy) {
                this.sprite.draw(context, this.x + offx, this.y + offy, this.facing_left);
                return;
            }
        }]);

        return Character;
    }(entity.Entity);

    var PlayerCharacter = function (_Character) {
        _inherits(PlayerCharacter, _Character);

        function PlayerCharacter(x, y, shape, sprite) {
            _classCallCheck(this, PlayerCharacter);

            var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(PlayerCharacter).call(this, x, y, shape, sprite));

            _this3.dir = 'down';
            _this3.state = 'look ' + _this3.dir;

            var _game$currentScene = game.currentScene();

            map = _game$currentScene.map;

            var player = _this3;
            var ent_layer = map.getLayerByName('Entities');

            _this3.activation_point_check = new entity.Entity(x, y + 2 * _this3.shape.bounds_offsets[3], new geometry.Point());
            _this3.activation_point_check.collides = util.constructBitmask([0]);
            _this3.activation_point_check.onCollide = function (ent, info) {
                if (game.state === 'world' && input.jump.pressed) {
                    if (!(ent.onActivate != null) && ent.properties != null) {
                        ent.onActivate = map.tryGettingCallbackForName(ent.properties.onActivate);
                    }
                    player.sprite.startAnimation('look ' + player.dir);
                    ent.onActivate(ent);
                }
                return;
            };
            ent_layer.addEntity(_this3.activation_point_check);

            map.camera.post_update = function (dt) {
                this.x = player.x;
                this.y = player.y;
                return;
            };
            return _this3;
        }

        _createClass(PlayerCharacter, [{
            key: 'update',
            value: function update(dt) {
                var sprite = this.sprite;
                var state = this.state;

                var switchStateTo = function switchStateTo(name) {
                    if (state !== name) {
                        sprite.startAnimation(name);
                        state = name;
                    }
                    return;
                };

                if (game.state === 'world') {
                    var vxc = 0.0;
                    var vyc = 0.0;

                    if (input.left.state && !input.right.state) {
                        vxc = -1.0;
                    } else if (input.right.state && !input.left.state) {
                        vxc = 1.0;
                    }

                    if (input.up.state && !input.down.state) {
                        vyc = -1.0;
                    } else if (input.down.state && !input.up.state) {
                        vyc = 1.0;
                    }

                    if (vxc < 0.0) {
                        if (vyc < 0.0) {
                            this.dir = 'up-left';
                        } else if (vyc > 0.0) {
                            this.dir = 'down-left';
                        } else {
                            this.dir = 'left';
                        }
                    } else if (vxc > 0.0) {
                        if (vyc < 0.0) {
                            this.dir = 'up-right';
                        } else if (vyc > 0.0) {
                            this.dir = 'down-right';
                        } else {
                            this.dir = 'right';
                        }
                    } else {
                        if (vyc < 0.0) {
                            this.dir = 'up';
                        } else if (vyc > 0.0) {
                            this.dir = 'down';
                        }
                    }

                    if (vyc === 0.0 && vxc === 0.0) {
                        switchStateTo('look ' + this.dir);
                    } else {
                        switchStateTo('go ' + this.dir);
                    }

                    this.state = state;
                    var inv_spd_c = vxc === 0.0 && vyc === 0.0 ? 1.0 : 1.0 / Math.sqrt(vxc * vxc + vyc * vyc);
                    this.velocity = [48.0 * vxc * inv_spd_c, 48.0 * vyc * inv_spd_c];
                    physics.integrate(this, dt);

                    if (this.dir === 'left') {
                        this.activation_point_check.x = this.x + 2 * this.shape.bounds_offsets[0];
                        this.activation_point_check.y = this.y;
                    } else if (this.dir === 'right') {
                        this.activation_point_check.x = this.x + 2 * this.shape.bounds_offsets[1];
                        this.activation_point_check.y = this.y;
                    } else if (this.dir === 'up') {
                        this.activation_point_check.x = this.x;
                        this.activation_point_check.y = this.y + 2 * this.shape.bounds_offsets[2];
                    } else if (this.dir === 'down') {
                        this.activation_point_check.x = this.x;
                        this.activation_point_check.y = this.y + 2 * this.shape.bounds_offsets[3];
                    } else if (this.dir === 'up-left') {
                        this.activation_point_check.x = this.x + Math.sqrt(2) * this.shape.bounds_offsets[0];
                        this.activation_point_check.y = this.y + Math.sqrt(2) * this.shape.bounds_offsets[2];
                    } else if (this.dir === 'up-right') {
                        this.activation_point_check.x = this.x + Math.sqrt(2) * this.shape.bounds_offsets[1];
                        this.activation_point_check.y = this.y + Math.sqrt(2) * this.shape.bounds_offsets[2];
                    } else if (this.dir === 'down-left') {
                        this.activation_point_check.x = this.x + Math.sqrt(2) * this.shape.bounds_offsets[0];
                        this.activation_point_check.y = this.y + Math.sqrt(2) * this.shape.bounds_offsets[3];
                    } else if (this.dir === 'down-right') {
                        this.activation_point_check.x = this.x + Math.sqrt(2) * this.shape.bounds_offsets[1];
                        this.activation_point_check.y = this.y + Math.sqrt(2) * this.shape.bounds_offsets[3];
                    }
                }

                sprite.update(dt);
                return;
            }
        }]);

        return PlayerCharacter;
    }(Character);

    var player = null;
    var player_shape = null;
    var player_sprite = null;

    return {
        setPlayerMetadata: function setPlayerMetadata(shape, sprite) {
            player_shape = shape;
            player_sprite = sprite;
            return;
        },
        handlePlayerStart: function handlePlayerStart(obj) {
            player = new PlayerCharacter(obj.x, obj.y, player_shape, player_sprite, obj.map.camera);
            player.obstructs = util.constructBitmask([0]);
            obj.layer.addEntity(player);
            return;
        },
        handleChest1Start: function handleChest1Start(obj) {
            return;
        },
        tryOpeningChest1: function tryOpeningChest1(obj) {
            var tx = obj.x / obj.map.tilewidth | 0;
            var ty = obj.y / obj.map.tileheight | 0;
            var layer = obj.map.getLayerByName('Ground');
            var td = layer.data[tx][ty].slice();
            td[0]++;
            layer.setTile(tx, ty, td);
            ui.textBoxDialog('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 0, 0, 160, 44, 10.0, null, null, function () {
                return game.state = 'world';
            });
            return;
        },


        DemoScene: DemoScene
    };
});
});

require.register("main.js", function(exports, require, module) {
'use strict';

// Configure RequireJS to load jQuery from a common URL.
requirejs.config({
    paths: {
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min',
        screenfull: '../libs/screenfull'
    }
});

require(['jquery', 'screenfull', './cg', './demo', './demo2', './ui', './zonko_desert'], function ($, __void__, cg, demo, demo2, ui, zonko_desert) {
    var game = cg.game;
    var loader = cg.loader;
    var map = cg.map;


    var setupScreenfull = function setupScreenfull(game) {
        if (typeof screenfull !== 'undefined' && screenfull !== null && screenfull.enabled) {
            var fs_btn_container = document.getElementById('fs-btn') || document.body;
            var fs_button = $('<button/>').text('Fullscreen').click(function () {
                var game_canvas = game.canvas();
                screenfull.request(game_canvas);
                $(game_canvas).focus();
                return;
            });
            return fs_btn_container.appendChild(fs_button[0]);
        }
    };

    $(function () {
        // Force jQuery to grab fresh data in its Ajax requests.
        $.ajaxSetup({ cache: false });

        // This is where the game code starts.
        var loader_scene = new loader.LoaderScene({
            maps: {
                demo: { name: 'demo', script: demo },
                demo2: { name: 'demo2', script: demo2 },
                zonko_desert: { name: 'zonko_desert', script: zonko_desert }
            },
            sprites: {
                player: 'player',
                demo2player: 'demo2player',
                joanna: 'joanna',
                shaun: 'shaun',
                javelina: 'javelina'
            },
            sounds: {}
        }, function (loaded) {
            demo.setPlayerSprite(loaded.sprites.player);
            var demo_scene = new map.MapScene(loaded.maps.demo);

            demo2.setPlayerMetadata(new cg.geometry.Aabb([4, 4]), loaded.sprites.joanna);
            var demo_scene2 = new demo2.DemoScene(loaded.maps.demo2);

            zonko_desert = new demo2.DemoScene(loaded.maps.zonko_desert);

            game.switchScene(zonko_desert);
            return;
        });

        game.init(320, 240, 1 / 60, 1 / 20, loader_scene);
        setupScreenfull(game);
        $(window).resize(game.resizeCanvasToAspectRatio);
        $(game.canvas()).attr('dir', ui.isRightToLeft() ? 'rtl' : 'ltr');
        game.run();
        return;
    });
    return;
});
});

require.register("ui.js", function(exports, require, module) {
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['./cg'], function (cg) {
    var input = cg.input;
    var audio = cg.audio;
    var util = cg.util;
    var game = cg.game;
    var geometry = cg.geometry;
    var entity = cg.entity;
    var physics = cg.physics;


    var right_to_left = false;

    var default_style = {
        fontSize: 10,
        font: 'sans-serif',
        lineStyles: 'white black 1.0 round round',
        fillStyle: 'rgb(26,47,158)'
    };

    var wordWrapText = function wordWrapText(text, width, style, context) {
        var _ref;

        var wordWrapLine = function wordWrapLine(line) {
            var word_delimeter = ' ';
            var words = line.split(word_delimeter);
            var lines = [];
            var current_line = '';
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                var current_line_candidate = i === 0 ? word : current_line + word_delimeter + word;
                if (context.measureText(current_line_candidate).width > width) {
                    lines.push(current_line);
                    current_line = word;
                } else {
                    current_line = current_line_candidate;
                }
            }
            if (current_line !== '') {
                lines.push(current_line);
            }
            return lines;
        };
        var line_delimeter = '\n';
        style = style || default_style;
        context = context || game.canvas().getContext('2d');
        context.save();
        context.font = style.fontSize + 'px ' + style.font;
        var lines = (_ref = []).concat.apply(_ref, _toConsumableArray(text.split(line_delimeter).map(wordWrapLine)));
        context.restore();
        return lines;
    };

    var drawTextBox = function drawTextBox(x, y, width, height, lines_scrolled, text_obj, style, context) {
        style = style || default_style;
        context = context || game.canvas().getContext('2d');

        context.save();

        context.font = style.font;
        context.textBaseline = "top";

        var styleDescriptors = style.lineStyles.split(' ');
        var mainLineStrokeStyle = styleDescriptors[0];
        context.strokeStyle = styleDescriptors[1];
        context.lineWidth = styleDescriptors[2];
        context.lineCap = styleDescriptors[3];
        context.lineJoin = styleDescriptors[4];
        context.fillStyle = style.fillStyle;

        context.fillRect(x + 1.0, y + 1.0, width - 2.0, height - 2.0);
        context.strokeRect(x + 1.5, y + 1.5, width - 2.0, height - 2.0);
        context.strokeStyle = mainLineStrokeStyle;
        context.strokeRect(x + 0.5, y + 0.5, width - 2.0, height - 2.0);

        context.beginPath();
        context.rect(x + 2.0, y + 2.0, width - 4.0, height - 4.0);
        context.clip();
        context.fillStyle = mainLineStrokeStyle;
        context.textAlign = 'start';
        for (var i = 0; i < text_obj.lines.length; i++) {
            var line = text_obj.lines[i];
            if (right_to_left) {
                context.fillText(line, x + width - 3.0, y + 3.0 + (i - lines_scrolled) * text_obj.spacing);
            } else {
                context.fillText(line, x + 3.0, y + 3.0 + (i - lines_scrolled) * text_obj.spacing);
            }
        }

        context.restore();
        return;
    };

    return {
        isRightToLeft: function isRightToLeft() {
            return right_to_left;
        },
        textBoxDialog: function textBoxDialog(text, x, y, width, height, speed, style, context, callback) {
            game.state = 'dialog';
            style = style || default_style;
            context = context || game.canvas().getContext('2d');
            var line_progress = 0.0;
            var lines_scrolled = 0.0;
            var num_lines_per_screen = (height - 6.0) / style.fontSize | 0;
            var cur_line_idx = 0;
            var cur_line = '';
            var word_wrapped_text = wordWrapText(text, width - 6, style, context);
            var displayed_text = [];
            var done = false;
            var updateGenerator = regeneratorRuntime.mark(function updateGenerator() {
                var dt, delta, new_line_progress;
                return regeneratorRuntime.wrap(function updateGenerator$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!(cur_line_idx < word_wrapped_text.length)) {
                                    _context.next = 10;
                                    break;
                                }

                                _context.next = 3;
                                return undefined;

                            case 3:
                                dt = _context.sent;
                                delta = dt * speed * (input.jump.state ? 3.0 : 1.0);

                                if (lines_scrolled >= cur_line_idx - num_lines_per_screen + 1) {
                                    new_line_progress = line_progress + delta;
                                } else {
                                    lines_scrolled = Math.min(cur_line_idx - num_lines_per_screen + 1, lines_scrolled + delta);
                                }
                                if (new_line_progress | 0 > line_progress | 0) {
                                    if (new_line_progress >= word_wrapped_text[cur_line_idx].length) {
                                        cur_line_idx++;
                                        cur_line = '';
                                        line_progress = 0.0;
                                        new_line_progress = 0.0;

                                        displayed_text = word_wrapped_text.slice(0, cur_line_idx);
                                    } else {
                                        cur_line = word_wrapped_text[cur_line_idx].slice(0, new_line_progress | 0).trim();
                                    }

                                    displayed_text[cur_line_idx] = cur_line;
                                }
                                line_progress = new_line_progress;
                                _context.next = 0;
                                break;

                            case 10:
                                // if input.debug.pressed
                                //     console.log {
                                //         num_lines_per_screen: num_lines_per_screen
                                //         line_progress: line_progress
                                //         lines_scrolled: lines_scrolled
                                //         cur_line_idx: cur_line_idx
                                //         cur_line: cur_line
                                //         word_wrapped_text: word_wrapped_text
                                //         displayed_text: displayed_text
                                //     }
                                displayed_text = word_wrapped_text;

                            case 11:
                                if (input.jump.pressed) {
                                    _context.next = 17;
                                    break;
                                }

                                _context.next = 14;
                                return undefined;

                            case 14:
                                dt = _context.sent;
                                _context.next = 11;
                                break;

                            case 17:
                                done = true;

                                if (!(callback != null)) {
                                    _context.next = 20;
                                    break;
                                }

                                return _context.abrupt('return', callback());

                            case 20:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, updateGenerator, this);
            });
            var drawGenerator = regeneratorRuntime.mark(function drawGenerator() {
                return regeneratorRuntime.wrap(function drawGenerator$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.delegateYield(regeneratorRuntime.mark(function _callee() {
                                    var result;
                                    return regeneratorRuntime.wrap(function _callee$(_context2) {
                                        while (1) {
                                            switch (_context2.prev = _context2.next) {
                                                case 0:
                                                    result = [];

                                                case 1:
                                                    if (done) {
                                                        _context2.next = 8;
                                                        break;
                                                    }

                                                    _context2.next = 4;
                                                    return undefined;

                                                case 4:
                                                    context = _context2.sent;

                                                    result.push(drawTextBox(x, y, width, height, lines_scrolled, {
                                                        spacing: style.fontSize,
                                                        lines: displayed_text
                                                    }, style, context));
                                                    _context2.next = 1;
                                                    break;

                                                case 8:
                                                    return _context2.abrupt('return', result);

                                                case 9:
                                                case 'end':
                                                    return _context2.stop();
                                            }
                                        }
                                    }, _callee, this);
                                }).call(this), 't0', 1);

                            case 1:
                                return _context3.abrupt('return', _context3.t0);

                            case 2:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, drawGenerator, this);
            });

            return game.invoke(util.prepareCoroutineSet(updateGenerator, drawGenerator));
        }
    };
});
});

require.register("world.js", function(exports, require, module) {
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['./cg'], function (cg) {
  var input = cg.input;
  var audio = cg.audio;
  var util = cg.util;
  var game = cg.game;
  var geometry = cg.geometry;
  var entity = cg.entity;
  var physics = cg.physics;
  var map = cg.map;


  return function (_map$MapScene) {
    _inherits(WorldScene, _map$MapScene);

    function WorldScene() {
      _classCallCheck(this, WorldScene);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(WorldScene).apply(this, arguments));
    }

    return WorldScene;
  }(map.MapScene);
});
});

require.register("zonko_desert.js", function(exports, require, module) {
"use strict";
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map