import input from 'boredjs/input'
import audio from 'boredjs/audio'
import util from 'boredjs/util'
import game from 'boredjs/game'
import geometry from 'boredjs/geometry'
import entity from 'boredjs/entity'
import physics from 'boredjs/physics'
import map from 'boredjs/map'
import ui from 'ui'

let fadeIn = function(duration, callback) {
    let t_accum = 0.0;
    let updateGenerator = function*() {
        while (t_accum < duration) {
            let dt = yield undefined;
            t_accum += dt;
        }
        if (callback != null) { return callback(); }
    };
    let drawGenerator = function*() {
        while (t_accum < duration) {
            let context = yield undefined;
            context.save();
            context.globalAlpha = 1.0 - (Math.min(t_accum / duration, 1.0));
            context.fillStyle = 'black';
            context.fillRect(0, 0, game.width(), game.height());
            context.restore();
        }
    };

    return util.prepareCoroutineSet(updateGenerator, drawGenerator);
};

class DemoScene extends map.MapScene {
    start() {
        super.start();
        game.state = 'fx';
        return game.invoke(fadeIn(0.5, () => game.state = 'world'));
    }
}

class Character extends entity.Entity {
    constructor(x, y, shape, sprite) {
        super(x, y, shape);
        this.sprite = sprite;
        this.sprite.startAnimation('D');
    }

    draw(context, offx, offy) {
        this.sprite.draw(context, this.x + offx, this.y + offy, this.facing_left);
        // context.beginPath();
        // context.moveTo(
        //     game.currentScene().map.camera.x + offx,
        //     game.currentScene().map.camera.y + offy
        // );
        // let [px, py] = game.currentScene().screenToGameCoordinates(input.pointer.x, input.pointer.y)
        // context.lineTo(px + offx, py + offy);
        // context.strokeStyle = '#ffffff'
        // context.stroke();
    }
}

class PlayerCharacter extends Character {
    constructor(x, y, shape, sprite) {
        super(x, y, shape, sprite);
        this.state = this.dir = 'D';
        let map = game.currentScene().map;
        let player = this;
        let ent_layer = map.getLayerByName('Entities');

        this.activation_point_check = new entity.Entity(x, y + 2 * this.shape.bounds_offsets[3], new geometry.Point());
        this.activation_point_check.collides = util.constructBitmask([0]);
        this.activation_point_check.onCollide = function(ent, info) {
            if (game.state === 'world' && input.pointer.pressed) {
                if (!(ent.onActivate != null) && (ent.properties != null)) {
                    ent.onActivate = map.tryGettingCallbackForName(ent.properties.onActivate);
                }
                player.sprite.startAnimation(`${player.dir}`);
                ent.onActivate(ent);
            }
        };
        ent_layer.addEntity(this.activation_point_check);
        
        map.camera.post_update = function(dt) {
            this.x = player.x;
            this.y = player.y;
        };
    }

    update(dt) {
        let { sprite, state } = this,
            scene = game.currentScene();

        function switchStateTo(name) {
            if (state !== name) {
                sprite.startAnimation(name);
                state = name;
            }
        };

        if (game.state === 'world') {
            let vxc = 0.0, vyc = 0.0;

            if(input.pointer.state) {
                let [pgx, pgy] = scene.screenToGameCoordinates(input.pointer.x, input.pointer.y),
                    dx = pgx - this.x,
                    dy = pgy - this.y;

                if(Math.abs(dx) >= util.EPSILON && Math.abs(dy) >= util.EPSILON) {
                    let invPNorm = 1 / Math.sqrt(dx * dx + dy * dy);
                    vxc = dx * invPNorm;
                    vyc = dy * invPNorm;
                }
            }



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
                // if (vyc < 0.0) {
                //     this.dir = 'up-left';
                // } else if (vyc > 0.0) {
                //     this.dir = 'down-left';
                // } else {
                    this.dir = 'R';
                    this.facing_left = true;
                // }
            } else if (vxc > 0.0) {
                // if (vyc < 0.0) {
                //     this.dir = 'up-right';
                // } else if (vyc > 0.0) {
                //     this.dir = 'down-right';
                // } else {
                    this.dir = 'R';
                    this.facing_left = false;
                // }
            } else {
                if (vyc < 0.0) {
                    this.dir = 'U';
                } else if (vyc > 0.0) {
                    this.dir = 'D';
                }
            }

            if (vyc === 0.0 && vxc === 0.0) {
                switchStateTo(this.dir);
            } else {
                switchStateTo(`W${this.dir}`);
            }

            this.state = state;
            let inv_spd_c = vxc === 0.0 && vyc === 0.0 ? 1.0 : 1.0/Math.sqrt(vxc*vxc+vyc*vyc);
            this.velocity = [48.0 * vxc * inv_spd_c, 48.0 * vyc * inv_spd_c];
            physics.integrate(this, dt);

            if(vxc !== 0.0 || vyc !== 0.0) {
                this.activation_point_check.x = this.x + vxc * 2 * this.shape.bounds_offsets[1];
                this.activation_point_check.y = this.y + vyc * 2 * this.shape.bounds_offsets[3];
            }
        }

        sprite.update(dt);
    }
}

let player = null;
let player_shape = null;
let player_sprite = null;
const RADIUS = 10;
export default {
    setupOverlay(layer) {
        layer.draw = function(context, targx, targy) {
            if(input.pointer.active) {
                context.beginPath();
                context.moveTo(input.pointer.x + RADIUS, input.pointer.y);
                context.arc(input.pointer.x, input.pointer.y, RADIUS, 0, 2 * Math.PI);
                context.strokeStyle = '#' +
                    (input.pointer.state ? 'ff' : '00') +
                    (input.pointer.pressed ? 'ff' : '00') +
                    (input.pointer.released ? 'ff' : '00');
                context.stroke();
            }
        };
    },

    setPlayerMetadata(shape, sprite) {
        player_shape = shape;
        player_sprite = sprite;
    },

    handlePlayerStart(obj) {
        player = new PlayerCharacter(obj.x, obj.y, player_shape, player_sprite, obj.map.camera);
        player.obstructs = util.constructBitmask([0]);
        obj.layer.addEntity(player);
    },

    handleChest1Start(obj) {
    },

    tryOpeningChest1(obj) {
        let tx = (obj.x / obj.map.tilewidth) | 0;
        let ty = (obj.y / obj.map.tileheight) | 0;
        let layer = obj.map.getLayerByName('Ground');
        let td = layer.data[tx][ty].slice();
        td[0]++;
        layer.setTile(tx, ty, td);
        ui.textBoxDialog('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', {
            // width: 160,
            // height: 44,
            // speed: 10.0,
            callback: () => game.state = 'world'
        });
    },

    DemoScene
};
