// define(['./cg'],
//   function(cg) {
import input from 'boredjs/input'
import audio from 'boredjs/audio'
import util from 'boredjs/util'
import game from 'boredjs/game'
import geometry from 'boredjs/geometry'
import entity from 'boredjs/entity'
import physics from 'boredjs/physics'

    let player_sprite = null;
    
    export default {
        setupSky(layer) {
            layer.draw = function(context, targx, targy) {
                let cam = this.map.camera;
            
                context.beginPath();
                cam.shapeSubpath(context, targx - cam.x, targy - cam.y);
                context.fillStyle = '#A5DFEA';
                context.fill();
                return;
            };
            return;
        },
    
        setPlayerSprite(sprite) {
            player_sprite = sprite;
            return;
        },
    
        handlePlayerStart(obj) {
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
        
            let player = new entity.Entity(obj.x, obj.y,
                new geometry.Aabb([2, 11]));
        
            player_sprite.startAnimation('idle');
            player.sprite = player_sprite;
        
            player.obstructs = util.constructBitmask([0]);
        
            let walk_vel_threshold = 2;
            let walk_accel = 640;
            let walk_anim_speed_factor = .125;
            let run_vel_threshold = 16;
            let run_accel = 2560;
            let run_anim_speed_factor = .125 / 3;
            let grounded_damping = .25;
            let jump_vel = -160;
            let jump_release_factor = .5;
            let aerial_move_accel = 32;
            let aerial_damping = .984375;
            let wall_slide_damping = .875;
            let wall_jump_angle = .25 * Math.PI;
            let wall_jump_speed = -160;
            let gravity = 160;
        
            let cos_wja = Math.cos(wall_jump_angle);
            let sin_wja = Math.sin(wall_jump_angle);
        
            player.update = function(dt) {
                let v = this.velocity || [0, 0];
                let a = [0, 0];
            
                let x_spd = Math.abs(this.x - (this.last_x || this.x)) / game.lastDt();
            
                let { sprite } = this;
                let { state } = this;
                let switchStateTo = function(name) {
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
            
                let moving_forward = this.facing_left &&
                    v[0] < -walk_vel_threshold ||
                    !this.facing_left && v[0] > walk_vel_threshold;

                let running_forward = moving_forward && Math.abs(v[0]) > run_vel_threshold;
            
                if (input.debug.pressed) { console.log(running_forward); }

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
                        let move_accel = input.run.state ? run_accel : walk_accel;
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
                                v[0] = wall_jump_speed *
                                    geometry.dotProduct(this.wall_normal,
                                    [cos_wja, -sin_wja]);
                                v[1] = wall_jump_speed *
                                    geometry.dotProduct(this.wall_normal,
                                    [sin_wja, cos_wja]);
                            } else if (this.wall_normal[0] < 0) {
                                v[0] = wall_jump_speed *
                                    geometry.dotProduct(this.wall_normal,
                                    [cos_wja, sin_wja]);
                                v[1] = wall_jump_speed *
                                    geometry.dotProduct(this.wall_normal,
                                    [-sin_wja, cos_wja]);
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
            
                if (this.grounded &&
                  (a[0] !== 0 || v[1] < 0)) {
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
        
            player.onCollide = function(other, info) {
                let [pen_amt, pen_dir] = info;
                if (input.debug.pressed) { console.log(pen_dir); }
                if (pen_dir[1] >= Math.abs(pen_dir[0])) {
                    this.grounded = true;
                    this.ground_normal = pen_dir;
                } else if (pen_dir[1] >= 0) {
                    this.sliding = true;
                    this.wall_normal = pen_dir;
                    if ((input.left.state &&
                      pen_dir[0] < -Math.abs(pen_dir[1])) ||
                      (input.right.state &&
                      pen_dir[0] > Math.abs(pen_dir[1]))) {
                        this.against_wall = true;
                    }
                }
                return;
            };
        
            player.draw = function(context, offx, offy) {
                this.sprite.draw(context, this.x + offx, this.y + offy, this.facing_left);
                return;
            };
        
            obj.layer.addEntity(player);
        
            obj.map.camera.post_update = function(dt) {
                this.x = player.x;
                this.y = player.y;
                return;
            };
        
            return;
        }
    };
// });

