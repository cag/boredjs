define(['jquery'], function($) {
    // Similar to the map module, sprites are loaded via JSON from
    // a url constructed from @name.
    let url_prefix = 'assets/';
    let url_suffix = '.json';
    
    return {
        Sprite: class {
            constructor(name, onload) {
                this.name = name;
                this.loaded = false;
                let cb_target = this;
                $.getJSON(url_prefix + this.name + url_suffix, function(data) {
                    try {
                        cb_target.load(data, onload);
                    } catch (e) {
                        throw 'could not load sprite ' +
                            url_prefix + cb_target.name + url_suffix;
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
            load(json_data, onload) {
                let {offset, frames, animations} = json_data;
            
                for (let name in animations) {
                    let animation = animations[name];
                    let duration = 0;
                    for (let i = 0; i < animation.frames.length; i++) {
                        let frame = animation.frames[i];
                        duration += frame[1];
                    }
                    animations[name].duration = duration;
                }
            
                this.animations = animations;
                let sprite = this;
            
                let image = new Image();
                image.onload = function() {
                    sprite.setupFrames(image, offset, frames);
                    this.loaded = true;
                    if (onload != null) { onload(); }
                    return;
                };
                image.src = url_prefix + json_data.spritesheet;
                return;
            }
        
            setupFrames(img, offset, frames) {
                let grabFrame = function(frame) {
                    let fw = frame.size[0];
                    let fh = frame.size[1];
                    let fcanvas = document.createElement('canvas');
                    fcanvas.width = fw;
                    fcanvas.height = fh;
                    let fctx = fcanvas.getContext('2d');
                    fctx.drawImage(img,
                        offset[0] + frame.pos[0],
                        offset[1] + frame.pos[1],
                        fw, fh, 0, 0, fw, fh);
                
                    return fcanvas;
                };
            
                this.frames = frames.map(grabFrame);
                this.frame_offsets = frames.map(frame => frame.offset);
                return;
            }
        
            startAnimation(anim_name, anim_speed = 1) {
                this.current_animation = this.animations[anim_name];
                this.animation_time = 0;
                this.animation_speed = anim_speed;
                return;
            }
        
            update(dt) {
                this.animation_time += dt * this.animation_speed;
                return;
            }
        
            draw(context, x, y, flip_h) {
                let cur_anim = this.current_animation;
                let cur_anim_dur = cur_anim.duration;
                let frame_index = -1;
                let anim_time = this.animation_time;
            
                if (cur_anim.loop) {
                    anim_time %= cur_anim_dur;
                } else if (anim_time > cur_anim_dur) {
                    anim_time = cur_anim_dur;
                }
            
                for (let i = 0; i < cur_anim.frames.length; i++) {
                    let frame = cur_anim.frames[i];
                    anim_time -= frame[1];
                    if (anim_time <= 0) {
                        frame_index = frame[0];
                        var frame_hflipped = !!frame[2];
                        break;
                    }
                }
            
                let frame_img = this.frames[frame_index];
                let frame_offset = this.frame_offsets[frame_index];
            
                context.save();
            
                context.translate(Math.round(x), Math.round(y));
                if (!!flip_h !== frame_hflipped) { context.transform(-1, 0, 0, 1, 0, 0); }
                context.drawImage(frame_img, frame_offset[0], frame_offset[1]);
            
                context.restore();
            
                return;
            }
        }
    };
});

