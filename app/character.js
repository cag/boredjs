define(['./cg'],
  function(cg) {
    let {input, audio, util, game, geometry, entity, physics} = cg;

    class Character extends entity.Entity {
        constructor(x, y, shape, sprite) {
            super(x, y, shape);
            this.sprite = sprite;
            this.sprite.startAnimation('look down');
        }

        draw(context, offx, offy) {
            this.sprite.draw(context, this.x + offx, this.y + offy, this.facing_left);
        }
    }

    return class PlayerCharacter extends Character {
        constructor(x, y, shape, sprite) {
            super(x, y, shape, sprite);
            this.state = 'look down';
            this.dir = 'down';
            let { map } = game.currentScene();
            let player = this;
            let ent_layer = map.getLayerByName('Entities');

            this.activation_point_check = new entity.Entity(x, y + 2 * this.shape.bounds_offsets[3], new geometry.Point());
            this.activation_point_check.collides = util.constructBitmask([0]);
            this.activation_point_check.onCollide = function(ent, info) {
                if (game.state === 'world' && input.jump.pressed) {
                    if (!(ent.onActivate != null) && (ent.properties != null)) {
                        ent.onActivate = map.tryGettingCallbackForName(ent.properties.onActivate);
                    }
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
            let { sprite } = this;
            let { state } = this;
            let switchStateTo = function(name) {
                if (state !== name) {
                    sprite.startAnimation(name);
                    state = name;
                }
            };

            if (game.state === 'world') {
                let vxc = 0.0;
                let vyc = 0.0;

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
                        switchStateTo(`look ${this.dir}`);
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
        }
    };
});

