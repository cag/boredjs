import $ from 'jquery'
import util from './util'

// Similar to the map module, sprites are loaded via JSON from
// a url constructed from @file.

class Sprite {
    constructor(path, onload) {
        this.path = path;
        this.name = path.substr(path.lastIndexOf('/') + 1, path.length);
        this.folder = path.substr(0, path.lastIndexOf('/'));
        this.loaded = false;
        Promise.all([
            $.getJSON(`${this.path}.json`),
            util.getImage(`${this.path}.png`),
        ]).then(([data, image]) => {
            try {
                this.load(data, image, onload);
            } catch (err) {
                throw Error(`could not load sprite ${path}: ${err}`);
            }
        }).catch((err) => {
            console.error(`error loading sprite ${path}: ${err}`);
        });
    }

    // Data is exported from Aseprite
    load(data, image, onload) {
        if(data.meta == null || data.frames == null) {
            throw Error(`Corrupt data (${this.path}.json)`);
        }

        let {meta, frames: frameData} = data;

        if(meta.app !== "http://www.aseprite.org/" || meta.format !== "I8") {
            console.warn(`Unexpected app/format value: (${meta.app}/${meta.format})`);
        }

        let keyRegExp = new RegExp(`^${util.escapeForRegExp(this.name)} \\((.*)\\) (\\d+)\\.ase$`),
            frames = [];
        for(let key in frameData) {
            let [_, layer, idx] = keyRegExp.exec(key),
                frameDatum = frameData[key];
            idx = parseInt(idx);
            frames[idx] = {
                pos: [frameDatum.frame.x, frameDatum.frame.y],
                size: [frameDatum.frame.w, frameDatum.frame.h],
                offset: [
                    frameDatum.spriteSourceSize.x - .5 * frameDatum.sourceSize.w,
                    frameDatum.spriteSourceSize.y - .5 * frameDatum.sourceSize.h
                ],
                duration: .001 * frameDatum.duration
            };
        }

        let animations = {};
        for(let frameTag of meta.frameTags) {
            let animation = {},
                frameName = frameTag.name.replace(/~$/, ''),
                totalDuration = 0;

            animation.loop = !frameTag.name.endsWith('~');
            animation.frames = [];
            for(let i = frameTag.from; i <= frameTag.to; i++) {
                let frameDuration = frames[i].duration;
                animation.frames.push([i, frameDuration]);
                totalDuration += frameDuration;
            }
            animation.duration = totalDuration;

            animations[frameName] = animation;
        }

        this.animations = animations;

        this.setupFrames(image, [0, 0], frames);
        this.loaded = true;
        if(onload != null) onload(this);
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
    }

    startAnimation(anim_name, anim_speed = 1) {
        this.current_animation = this.animations[anim_name];
        if(!this.current_animation) {
            console.warn(`${anim_name} is not an animation for ${this.name}`);
            this.current_animation = { frames:[[0, 1.0]], loop: false, duration: 1.0 };
        }
        this.animation_time = 0;
        this.animation_speed = anim_speed;
    }

    update(dt) {
        this.animation_time += dt * this.animation_speed;
    }

    draw(context, x, y, flip_h) {
        let cur_anim = this.current_animation;
        let cur_anim_dur = cur_anim.duration;
        let frame_index = -1;
        let anim_time = this.animation_time;
        let frame_hflipped;
    
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
                frame_hflipped = !!frame[2];
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
    }
}

export default { Sprite };