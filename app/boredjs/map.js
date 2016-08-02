import $ from 'jquery'
import game from './game'
import input from './input'
import entity from './entity'
import geometry from './geometry'
import util from './util'

// A prefix and suffix applied to names passed into map constructors
// so that it loads from the right place.
let numt;
let cw;
let ch;
let url_prefix = 'assets/';
let url_suffix = '.json';

// If `layers_cached` is true, then tiles will be cached in blocks
// of `layer_cache_factor` square and the blocks will be drawn
// instead of tiles.
let layers_cached = true;
let layer_cache_factor = 16;

// Comparison helper functions for sorting entities.
let byLeftBound = (ent_a, ent_b) =>
    ent_a.x + ent_a.shape.bounds_offsets[0] -
        ent_b.x - ent_b.shape.bounds_offsets[0]
;

let byBottomBound = (ent_a, ent_b) =>
    ent_a.y + ent_a.shape.bounds_offsets[3] -
        ent_b.y - ent_b.shape.bounds_offsets[3]
;

// This module expects maps created in [Tiled](http://www.mapeditor.org/)
// and exported using the JSON option.
// Refer to the [TMX Map Format](https://github.com/bjorn/tiled/wiki/TMX-Map-Format)
// for information on how the map format works.
class TileSet {
    constructor(json_data, onload) {
        this.name = json_data.name;
        this.first_gid = json_data.firstgid;
        this.tile_width = json_data.tilewidth;
        this.tile_height = json_data.tileheight;
        this.margin = json_data.margin;
        this.spacing = json_data.spacing;
        this.properties = json_data.properties;
        
        let tileset = this;
        this.image = new Image();
        this.image.onload = function() {
            let iw = this.naturalWidth;
            let ih = this.naturalHeight;
            if (iw !== json_data.imagewidth ||
               ih !== json_data.imageheight) {
                throw `tileset ${tileset.name}` +
                    ' dimension mismatch (' +
                    iw + 'x' + ih + ' vs ' +
                    this.naturalWidth + 'x' + this.naturalHeight + ')';
            }
            
            tileset.setupTileMapping();
            if (onload != null) { return onload(); }
        };
        this.image.src = url_prefix + json_data.image;
        return;
    }
    
    setupTileMapping() {
        let img = this.image;
        let iw = img.naturalWidth;
        let ih = img.naturalHeight;
        let tw = this.tile_width;
        let th = this.tile_height;
        
        let { margin } = this;
        let twps = tw + this.spacing;
        let thps = th + this.spacing;
        
        let numtx = ((iw - margin) / twps) | 0;
        let numty = ((ih - margin) / thps) | 0;
        this.num_tiles = numt = numtx * numty;
        
        let grabTile = function(xiter, yiter) {
            let tcanvas = document.createElement('canvas');
            tcanvas.width = tw;
            tcanvas.height = th;
            
            let sx = margin + xiter * twps;
            let sy = margin + yiter * thps;
            
            let tctx = tcanvas.getContext('2d');
            tctx.drawImage(img, sx, sy, tw, th, 0, 0, tw, th);
            
            return tcanvas;
        };
        
        this.tiles = [];
        for(let i = 0; i < numt; i++) {
            this.tiles[i] = grabTile(i % numtx, (i / numtx) | 0);
        }
    }
    
    hasGID(gid) { return this.first_gid <= gid && gid < this.first_gid + this.num_tiles; }
    
    drawTile(context, gid, flip_h, flip_v, flip_d, x, y) {
        let idx = gid - this.first_gid;
        let tw = this.tile_width;
        let th = this.tile_height;
        
        context.save();
        
        context.translate(x, y);
        if (flip_h) { context.transform(-1, 0, 0, 1, tw, 0); }
        if (flip_v) { context.transform(1, 0, 0, -1, 0, th); }
        if (flip_d) { context.transform(0, 1, 1, 0, 0, 0); }
        
        context.drawImage(this.tiles[idx], 0, 0);
        
        context.restore();
        return;
    }
}

class Layer {
    constructor(json_data, map) {
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
    }
}

class TileLayer extends Layer {
    constructor(json_data, map) {
        super(json_data, map);
        
        if (this.type !== 'tilelayer') {
            throw `can't construct TileLayer from ${this.type} layer`;
        }
        
        let parseGID = function(gid) {
            let flip_h = false;
            // Javascript uses 32-bit signed bitwise ops, but
            // values are written to json unsigned in Tiled.
            if (gid > 2147483648) {
                flip_h = true;
                gid -= 2147483648;
            }
            let flip_v = gid & 1073741824 ? true : false;
            let flip_d = gid & 536870912 ? true : false;
            gid &= ~1610612736;
            return [gid, flip_h, flip_v, flip_d];
        };
        
        let { width } = this;
        let { height } = this;
        this.data = [];
        for (let i = 0; i < width; i++) {
            this.data[i] = [];
            for (let j = 0; j < height; j++) {
                this.data[i][j] = parseGID(json_data.data[i + j * width]);
            }
        }
        
        // Parallax can be set in tile layer properties in Tiled.
        if (this.properties != null) {
            if (this.properties.parallax != null) {
                this.parallax = +this.properties.parallax;
            }
        } else {
            this.parallax = 1;
        }
    }
    
    buildCache() {
        let layer = this;
        let lcf = layer_cache_factor;
        let w = this.width;
        let h = this.height;
        let tw = this.map.tilewidth;
        let th = this.map.tileheight;
        this.cache_width = cw = Math.ceil(w / lcf);
        this.cache_height = ch = Math.ceil(h / lcf);
        
        let cacheBlock = function(bi, bj) {
            let nbx = Math.min(lcf, w - bi);
            let nby = Math.min(lcf, h - bj);
            
            let canvas = document.createElement('canvas');
            canvas.width = tw * nbx;
            canvas.height = th * nby;
            
            let context = canvas.getContext('2d');
            layer.drawRaw(context, bi, bi + nbx, bj, bj + nby, 0, 0);
            
            return canvas;
        };
        this.cache = [];
        for (let i = 0; i < cw; i++) {
            this.cache[i] = []
            for (let j = 0; j < ch; j++) {
                this.cache[i][j] = cacheBlock(i * lcf, j * lcf);
            }
        }
    }
    
    setTile(txi, tyi, td) {
        this.data[txi][tyi] = td;
        if (layers_cached) {
            let { map } = this;
            let lcf = layer_cache_factor;
            let ci = (txi / lcf) | 0;
            let cj = (tyi / lcf) | 0;
            let block = this.cache[ci][cj];
            let bxo = (txi % lcf) * map.tilewidth;
            let byo = (tyi % lcf) * map.tileheight;
            let context = block.getContext('2d');
            map.drawTile(context,
                td[0], td[1], td[2], td[3],
                bxo, byo);
        }
        return;
    }

    drawRaw(context, lowtx, hightx, lowty, highty, dx, dy) {
        let { map } = this;
        let tw = map.tilewidth;
        let th = map.tileheight;
        let { data } = this;
        for (let i = lowtx; i < hightx; i++) {
            for (let j = lowty; j < highty; j++) {
                let datum = data[i][j];
                map.drawTile(context,
                    datum[0], datum[1], datum[2], datum[3],
                    dx + (i - lowtx) * tw,
                    dy + (j - lowty) * th);
            }
        }
        return;
    }
    
    draw(context, targx, targy) {
        let { map } = this;
        let cam = map.camera;
        let cambounds = cam.shape.bounds_offsets;
        
        let tw = map.tilewidth;
        let th = map.tileheight;
        
        let mlcamxwp = cam.x * this.parallax - this.x * tw;
        let mlcamywp = cam.y * this.parallax - this.y * th;
        
        let w = cambounds[1] - cambounds[0];
        let h = cambounds[3] - cambounds[2];
        
        let destx = targx - mlcamxwp;
        let desty = targy - mlcamywp;
        
        let mlsx = mlcamxwp + cambounds[0];
        let mlsy = mlcamywp + cambounds[2];
        
        context.save();
        
        context.beginPath();
        cam.shapeSubpath(context, targx - cam.x, targy - cam.y);
        context.clip();
        
        context.globalAlpha *= this.opacity;
        
        if (layers_cached) {
            let { cache } = this;
            let lcf = layer_cache_factor;
            let bw = tw * lcf;
            let bh = th * lcf;
            let lowbx = Math.max(0, (mlsx / bw) | 0);
            let highbx = Math.min(this.cache_width,
                Math.ceil((mlsx + w) / bw));
            let lowby = Math.max(0, (mlsy / bh) | 0);
            let highby = Math.min(this.cache_height,
                Math.ceil((mlsy + h) / bh));
            
            for (let i = lowbx; i < highbx; i++) {
                for (let j = lowby; j < highby; j++) {
                    context.drawImage(cache[i][j],
                        Math.round(destx + i * bw),
                        Math.round(desty + j * bh));
                }
            }
        } else {
            let lowtx = Math.max(0, (mlsx / tw) | 0);
            let hightx = Math.min(this.width, Math.ceil((mlsx + w) / tw));
            let lowty = Math.max(0, (mlsy / th) | 0);
            let highty = Math.min(this.height, Math.ceil((mlsy + h) / th));
            
            this.drawRaw(context, lowtx, hightx, lowty, highty,
                Math.round(destx + lowtx * tw),
                Math.round(desty + lowty * th));
        }
            
        context.restore();
    }
}

class ObjectLayer extends Layer {
    constructor(json_data, map) {
        // Bitmasks are created from a comma-separated list of
        // integers from 0-31. They are used to determine collision
        // groups for zones and obstruction groups.
        let tryMakingBitmaskFromString = function(bitmask_str) {
            if (bitmask_str != null) {
                return constructBitmask(bitmask_str.split(','));
            }
            return 0;
        };
        
        let {Point, Aabb, Polyline, Polygon} = geometry;
        let {Entity} = entity;
        var {constructBitmask} = util;
        
        super(json_data, map);
        
        if (this.type !== 'objectgroup') {
            throw `can't construct ObjectLayer from ${this.type} layer`;
        }
        
        let { objects } = json_data;
        this.entities = [];
        let mapents = map.entities;
        
        if (this.properties != null) {
            var l_collides = tryMakingBitmaskFromString( 
                this.properties.collides);
            var l_onCollide = map.tryGettingCallbackForName( 
                this.properties.onCollide);
            
            var l_obstructs = tryMakingBitmaskFromString( 
                this.properties.obstructs);
            var l_onObstruct = map.tryGettingCallbackForName( 
                this.properties.onObstruct);
        }
        
        let setupEntityWithProperties = function(ent, object) {
            if (object.properties != null) {
                ent.onStart = map.tryGettingCallbackForName( 
                    object.properties.onStart);
                
                // Object level callbacks take precedence over layer
                // level callbacks.
                
                let obj_onCollide = map.tryGettingCallbackForName( 
                    object.properties.onCollide);
                
                if (obj_onCollide != null) {
                    ent.onCollide = obj_onCollide;
                } else {
                    ent.onCollide = l_onCollide;
                }
                
                let obj_onObstruct = map.tryGettingCallbackForName( 
                    object.properties.onObstruct);
                
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
                let obj_collides = tryMakingBitmaskFromString( 
                    object.properties.collides);
                ent.collides = l_collides | obj_collides;
                
                let obj_obstructs = tryMakingBitmaskFromString( 
                    object.properties.obstructs);
                ent.obstructs = l_obstructs | obj_obstructs;
                
                ent.properties = object.properties;
            }

            return;
        };
        
        for (let j = 0; j < objects.length; j++) {
            let object = objects[j];
            let objx = object.x;
            let objy = object.y;
            let objw = object.width;
            let objh = object.height;
            
            if (object.polygon != null) {
                var ent = new Entity(objx, objy,
                    new Polygon(object.polygon.map(point => [point.x, point.y])));
            } else if (object.polyline != null) {
                // Polylines are modeled as multiple polygons.
                for (let i = 0; i < object.polyline.length - 1; i++) {
                    let point_a = object.polyline[i];
                    let point_b = object.polyline[i + 1];
                    var ent = new Entity(objx, objy,
                        new Polygon([[point_a.x, point_a.y],
                            [point_b.x, point_b.y]]));
                    
                    setupEntityWithProperties(ent, object);
                    this.addEntity(ent);
                }
                continue;
            } else if (objw === 0 && objh === 0) {
                var ent = new Entity(objx, objy, new Point());
            } else {
                let objhwx = .5 * objw;
                let objhwy = .5 * objh;
                var ent = new Entity(objx + objhwx, objy + objhwy,
                    new Aabb([objhwx, objhwy]));
            }
            
            setupEntityWithProperties(ent, object);
            this.addEntity(ent);
        }
        
        this.entities.sort(byBottomBound);
        if (this.properties != null) { this.onStart = map.tryGettingCallbackForName(this.properties.onStart); }
        return;
    }
    
    addEntity(ent) {
        ent.layer = this;
        ent.map = this.map;
        this.entities.push(ent);
        return this.map.entities.push(ent);
    }
    
    draw(context, targx, targy) {
        let { map } = this;
        let cam = map.camera;
        
        let xoff = targx - cam.x - this.x * map.tilewidth;
        let yoff = targy - cam.y - this.y * map.tileheight;
        
        let ents = this.entities;
        util.persistentSort(ents, byBottomBound);
        for (let i = 0; i < ents.length; i++) {
            let ent = ents[i];
            if (ent.draw != null) { ent.draw(context, xoff, yoff); }
        }
        return;
    }
    
    debugDraw(context, targx, targy) {
        let { map } = this;
        let cam = map.camera;
        let cambounds = cam.shape.bounds_offsets;
        let camlx = cam.x + cambounds[0];
        let camly = cam.y + cambounds[2];
        let w = cambounds[1] - cambounds[0];
        let h = cambounds[3] - cambounds[2];
        let destx = targx + cambounds[0];
        let desty = targy + cambounds[2];
        
        let xoff = destx - camlx - this.x * this.map.tilewidth;
        let yoff = desty - camly - this.y * this.map.tileheight;
        
        context.save();
        context.beginPath();
        context.globalAlpha *= .75;
        
        for (let i = 0; i < this.entities.length; i++) {
            let ent = this.entities[i];
            if (ent.boundsIntersects(cam)) {
                ent.shapeSubpath(context, xoff, yoff);
            }
        }
        
        context.stroke();
        
        context.restore();
        return;
    }
}

// Maps are loaded from a URL containing `@name` and callbacks are
// searched for inside of the `@script` passed.
export default {
    Map: class {
        constructor(name, script, onload) {
            this.name = name;
            this.script = script;
            this.loaded = false;
            this.entities = [];
            $.getJSON(url_prefix + this.name + url_suffix,
                (data) => { this.load(data, onload); }).fail((jqxhr, textStatus, error) => {
                    console.error(`Error loading map ${name}: ${error}`);
                });
            return;
        }
    
        load(json_data, onload) {
            if (json_data.orientation !== 'orthogonal') {
                throw `orientation ${orientation} not supported`;
            }
        
            this.width = json_data.width;
            this.height = json_data.height;
            this.tilewidth = json_data.tilewidth;
            this.tileheight = json_data.tileheight;
            this.orientation = json_data.orientation;
            this.properties = json_data.properties;
        
            let map = this;
        
            let createLayer = function(data) {
                let {type} = data;
                if (type === 'tilelayer') {
                    return new TileLayer(data, map);
                } else if (type === 'objectgroup') {
                    return new ObjectLayer(data, map);
                } else {
                    console.warn(`unknown layer type ${type} requested`);
                    return new Layer(data, map);
                }
            };
        
            this.layers = json_data.layers.map(createLayer);
        
            let {tilesets} = json_data;
            let tileset_load_total = tilesets.length;
            let tileset_load_count = 0;
            let ts_load_cb = function() {
                if (++tileset_load_count >= tileset_load_total) {
                    if (layers_cached) { map.buildLayerCaches(); }
                    map.loaded = true;
                    if (onload != null) { onload(); }
                }
                return;
            };
        
            this.tilesets = tilesets.map(ts => new TileSet(ts, ts_load_cb));
        
            this.entities.sort(byLeftBound);
            return;
        }
    
        tryGettingCallbackForName(name) {
            if (name != null) {
                let callback = this.script[name];
                if (callback != null) {
                    return callback;
                } else {
                    throw `missing callback ${name}!`;
                }
            }
            return null;
        }
    
        buildLayerCaches() {
            for (let i = 0; i < this.layers.length; i++) {
                let layer = this.layers[i];
                if (layer.type === 'tilelayer') {
                    layer.buildCache();
                }
            }
            return;
        }
    
        drawTile(context, gid, flip_h, flip_v, flip_d, x, y) {
            for (let i = 0; i < this.tilesets.length; i++) {
                let tileset = this.tilesets[i];
                if (tileset.hasGID(gid)) {
                    tileset.drawTile(context,
                        gid, flip_h, flip_v, flip_d, x, y);
                    break;
                }
            }
            return;
        }
    
        doCollisions() {
            let ents = this.entities;
            util.persistentSort(ents, byLeftBound);
            let j = 0;
            for (let i = 1; i < ents.length; i++) {
                let enti = this.entities[i];
            
                while (j < i &&
                  ents[j].x + ents[j].shape.bounds_offsets[1] <
                  enti.x + enti.shape.bounds_offsets[0]) {
                    ++j;
                }
            
                for (let k = j; k < i; k++) {
                    this.doCollision(enti, this.entities[k]);
                }
            }
        
            return;
        }
    
        doCollision(ent_a, ent_b) {
            if (ent_a.static && ent_b.static) { return; }
        
            let can_collide = (ent_a.collides & ent_b.collides);
            let can_obstruct = (ent_a.obstructs & ent_b.obstructs);
        
            if (!can_collide && !can_obstruct) { return; }
        
            let collision_info = ent_a.intersects(ent_b);
        
            if (collision_info) {
                let [pen_amt, pen_dir] = collision_info;
            
                let neg_collision_info = 
                    [pen_amt, [-pen_dir[0], -pen_dir[1]]];
            
                if (ent_a.onCollide != null) { ent_a.onCollide(ent_b, collision_info); }
                if (ent_b.onCollide != null) { ent_b.onCollide(ent_a, neg_collision_info); }
            
                if (can_obstruct) {
                    let proj_x = pen_amt * pen_dir[0];
                    let proj_y = pen_amt * pen_dir[1];
                    if (ent_a.static) {
                        ent_b.x += proj_x;
                        ent_b.y += proj_y;
                    } else if (ent_b.static) {
                        ent_a.x -= proj_x;
                        ent_a.y -= proj_y;
                    } else {
                        // For now, splits the resolution 50-50 between
                        // dynamic objects.
                        let rat = .5;
                        let notrat = 1 - rat;
                    
                        ent_a.x -= rat * proj_x;
                        ent_a.y -= rat * proj_y;
                        ent_b.x += notrat * proj_x;
                        ent_b.y += notrat * proj_y;
                    }
                
                    if (ent_a.onObstruct != null) { ent_a.onObstruct(ent_b, collision_info); }
                    if (ent_b.onObstruct != null) { ent_b.onObstruct(ent_a, neg_collision_info); }
                }
            }
            return;
        }

        // Gets a layer by name. Returns null if the layer is not found.
        getLayerByName(name) {
            for (let i = 0; i < this.layers.length; i++) {
                let layer = this.layers[i];
                if (layer.name === name) { return layer; }
            }
            return null;
        }
    
        start() {
            for (let i = 0; i < this.layers.length; i++) {
                let layer = this.layers[i];
                if (layer.onStart != null) { layer.onStart(layer); }
            }
            for (let j = 0; j < this.entities.length; j++) {
                let ent = this.entities[j];
                if (ent.onStart != null) { ent.onStart(ent); }
            }
            return;
        }
    
        update(dt) {
            for (let i = 0; i < this.entities.length; i++) {
                let ent = this.entities[i];
                if (ent.update != null) { ent.update(dt); }
            }
            this.doCollisions();
            if (this.camera.post_update != null) { this.camera.post_update(dt); }
            return;
        }
    
        draw(context, targx, targy) {
            for (let i = 0; i < this.layers.length; i++) {
                let layer = this.layers[i];
                layer.draw(context, targx, targy);
            }
            return;
        }
    
        debugDraw(context, targx, targy) {
            let cam = this.camera;
            let xoff = targx - cam.x;
            let yoff = targy - cam.y;
        
            let found_first = false;
            for (let ent of this.entities) {
                if (ent.boundsIntersects(cam)) {
                    ent.shapeSubpath(context, xoff, yoff);
                    found_first = true;
                } else if (found_first && cam.boundsLeftOf(ent)) {
                    break;
                }
            }
        
            for (let k = 0; k < this.layers.length; k++) {
                let layer = this.layers[k];
                if (layer.type === 'objectgroup') {
                    layer.debugDraw(context, targx, targy);
                }
            }
        }
    },

    // A scene for running a map.
    MapScene: class {
        constructor(map) {
            this.map = map;
            return;
        }
    
        start() {
            if (!this.map.loaded) { throw `${this.map.name} not loaded!`; }
            let {Entity} = entity;
            let {Aabb} = geometry;
        
            // Camera is initially positioned at the origin.
            this.map.camera = new Entity(0, 0,
                new Aabb([.5 * game.width(), .5 * game.height()]));
        
            this.map.entities.push(this.map.camera);
        
            this.map.start();
            return;
        }
    
        end() {}
    
        update(dt) {
            this.map.update(dt);
            return;
        }
    
        draw(context) {
            let gw = game.width();
            let gh = game.height();
            let hgw = .5 * gw;
            let hgh = .5 * gh;
        
            context.clearRect(0, 0, gw, gh);
            context.beginPath();
        
            this.map.draw(context, hgw, hgh);
            if (input.debug.state) { this.map.debugDraw(context, hgw, hgh); }
        
            return;
        }
    }
};
