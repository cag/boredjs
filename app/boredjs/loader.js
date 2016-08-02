import map from './map'
import sprite from './sprite'
import audio from './audio'

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
export default {
    LoaderScene: class {
        constructor(resources, onload) {
            this.resources = resources;
            this.onload = onload;
            this.loaded = {
                maps: {},
                sprites: {},
                sounds: {}
            };
        
            let resource_count = 0;
            for (let type in this.resources) {
                let obj = this.resources[type];
                resource_count += (Object.keys(obj)).length;
            }
            this.resource_count = resource_count;
        
            if (resource_count <= 0) {
                throw `invalid resource count (${resource_count})`;
            }
            return;
        }
    
        start() {
            let {Map} = map;
            let {Sprite} = sprite;
            let {Sound} = audio;
        
            let load_count = 0;
            let loader = this;
            this.progress = 0;
            this.finished = false;
        
            let callback = function() {
                ++load_count;
                loader.progress = load_count / loader.resource_count;
                // console.log loader.progress
                if (load_count === loader.resource_count) {
                    loader.finished = true;
                    if (loader.onload != null) { loader.onload(loader.loaded); }
                }
                return;
            };
        
            for (let type in this.resources) {
                let obj = this.resources[type];
                let target = this.loaded[type];
            
                if (type === 'maps') {
                    for (var key in obj) {
                        var res = obj[key];
                        target[key] = new Map(res.name, res.script,
                            callback);
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
                    throw `attempting to load unknown type ${type}`;
                }
            }
            return;
        }
    
        end() {
            return;
        }
    
        update(dt) {
            return;
        }
    
        draw(context) {
            return;
        }
    }
};
