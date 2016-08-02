// These constants determine how debug drawing is rendered when
// shape subpaths are being created.
let POINT_RADIUS = 2;
let NORMAL_OFFSET = 4;
let NORMAL_LENGTH = 2;

// This is currently the epsilon used to detect small differences
// in normals.
let EPSILON = Math.pow(2, -50);

// Some basic linear algebra.
let dotProduct = (u, v) => u[0] * v[0] + u[1] * v[1];

let normalize = function(v) {
    let invnorm = 1 / Math.sqrt((dotProduct(v, v)));
    return [invnorm * v[0], invnorm * v[1]];
};

// Axis is assumed to be normalized so only a dot product is used
// in the projection.
let projectShapeOntoAxis = function(shape, axis) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    
    let stype = shape.type;
    
    if (stype === 'Point') {
        min = 0;
        max = 0;
    } else if (stype === 'Aabb') {
        let hw_proj = dotProduct(shape.halfwidth, axis);
        if (hw_proj < 0) {
            min = Math.min(min, hw_proj);
            max = Math.max(max, -hw_proj);
        } else {
            min = Math.min(min, -hw_proj);
            max = Math.max(max, hw_proj);
        }
        
        hw_proj = dotProduct([
                shape.halfwidth[0], -shape.halfwidth[1]
            ], axis);
        if (hw_proj < 0) {
            min = Math.min(min, hw_proj);
            max = Math.max(max, -hw_proj);
        } else {
            min = Math.min(min, -hw_proj);
            max = Math.max(max, hw_proj);
        }
        
    } else if (stype === 'Polygon') {
        let pts = shape.points;
        for (let i = 0; i < pts.length; i++) {
            let point = pts[i];
            let pt_proj = dotProduct(point, axis);
            min = Math.min(min, pt_proj);
            max = Math.max(max, pt_proj);
        }
    }
    
    return [min, max];
};

// This returns how much interval `b` should be displaced to render
// the intervals disjoint (except maybe at a point).
let intervalsIntersect = function(a, b) {
    if (a[1] < b[0] || b[1] < a[0]) { return false; }
    
    let aoff = b[1] - a[0];
    let boff = a[1] - b[0];
    
    if (aoff < boff) { return -aoff; }
    return boff;
};

// Figures out how much shape is penetrating polygon. A penetration
// amount and direction may be passed in order to continue a test
// with data from prior analysis.
let calcShapePolygonMinimumPenetrationVector = function(s, sx, sy, p, px, py,
  pen_amt = Number.POSITIVE_INFINITY,
  pen_dir,
  negate = false) {
    for (let i = 0; i < p.normals.length; i++) {
        let normal = p.normals[i];
        let p_bounds = p.bounds_on_normals[i];
        
        let proj_s_pos = dotProduct([sx, sy], normal);
        let proj_p_pos = dotProduct([px, py], normal);
        
        let s_bounds = projectShapeOntoAxis(s, normal);
        
        let intersects = intervalsIntersect([
            s_bounds[0] + proj_s_pos, s_bounds[1] + proj_s_pos], [
            p_bounds[0] + proj_p_pos, p_bounds[1] + proj_p_pos]);
        
        if (!intersects) { return false; }
        
        let abs_intersects = Math.abs(intersects);
        
        if (abs_intersects < pen_amt) {
            pen_amt = abs_intersects;
            if (negate === (intersects < 0)) {
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
let calcPolyBounds = function(points) {
        let minx = points[0][0];
        let maxx = points[0][0];
        let miny = points[0][1];
        let maxy = points[0][1];
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
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
let testPointPointIntersection = (p1, p1x, p1y, p2, p2x, p2y) => [0, [1, 0]];

let testPointAabbIntersection = function(p, px, py, a, ax, ay) {
    let pen_amt = ax + a.halfwidth[0] - px;
    let pen_dir = [-1, 0];
    
    let next_proj = ay + a.halfwidth[1] - py;
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

let testPointPolygonIntersection = (p1, p1x, p1y, p2, p2x, p2y) =>
    calcShapePolygonMinimumPenetrationVector( 
        p1, p1x, p1y,
        p2, p2x, p2y)
;

let testAabbAabbIntersection = function(a1, a1x, a1y, a2, a2x, a2y) {
    let pen_amt = a2x + a2.halfwidth[0] - (a1x - a1.halfwidth[0]);
    let pen_dir = [-1, 0];
    
    let next_proj = a2y + a2.halfwidth[1] - (a1y - a1.halfwidth[1]);
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

let testAabbPolygonIntersection = function(a, ax, ay, p, px, py) {
    let intersects = intervalsIntersect([
        ax + a.bounds_offsets[0], ax + a.bounds_offsets[1]], [
        px + p.bounds_offsets[0], px + p.bounds_offsets[1]]);
    
    if (intersects < 0) {
        var pen_amt = -intersects;
        var pen_dir = [-1, 0];
    } else {
        var pen_amt = intersects;
        var pen_dir = [1, 0];
    }
    
    intersects = intervalsIntersect([
        ay + a.bounds_offsets[2], ay + a.bounds_offsets[3]], [
        py + p.bounds_offsets[2], py + p.bounds_offsets[3]]);
    
    if (intersects < 0) {
        var pen_amt = -intersects;
        var pen_dir = [0, -1];
    } else {
        var pen_amt = intersects;
        var pen_dir = [0, 1];
    }
    
    return calcShapePolygonMinimumPenetrationVector( 
        a, ax, ay,
        p, px, py,
        pen_amt, pen_dir);
};

let testPolygonPolygonIntersection = function(p1, p1x, p1y, p2, p2x, p2y) {
    let ret = calcShapePolygonMinimumPenetrationVector( 
        p1, p1x, p1y,
        p2, p2x, p2y);
    
    if (ret) {
        var [pen_amt, pen_dir] = ret;
    } else {
        return false;
    }
    
    return calcShapePolygonMinimumPenetrationVector( 
        p2, p2x, p2y,
        p1, p1x, p1y,
        pen_amt, pen_dir, true);
};

// A mapping from pairs of shape types to the appropriate hit test.
let intersection_test_map = {
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

export default {
    dotProduct,

    // A point.
    Point: class {
        constructor() {
            this.type = 'Point';
            this.bounds_offsets = [0, 0, 0, 0];
        }
        
        subpath(context, offx, offy) {
            context.moveTo(offx + POINT_RADIUS, offy);
            context.arc(offx, offy, POINT_RADIUS, 0, 2 * Math.PI);
            return;
        }
    },

    // An axis-aligned bounding box.
    Aabb: class {
        constructor(halfwidth) {
            this.halfwidth = halfwidth;
            this.type = 'Aabb';
            let hw = this.halfwidth;
            this.bounds_offsets = [-hw[0], hw[0], -hw[1], hw[1]];
            return;
        }
    
        subpath(context, offx, offy) {
            let hw = this.halfwidth;
            context.rect(offx - hw[0], offy - hw[1],
                2 * hw[0], 2 * hw[1]);
            return;
        }
    },

    // A *convex* polygon.
    Polygon: class {
        constructor(points) {
            this.type = 'Polygon';
            this.bounds_offsets = calcPolyBounds(points);
        
            let sumx = 0;
            let sumy = 0;
            let num_vertices = points.length;
            for (let i1 = 0; i1 < points.length; i1++) {
                let pt = points[i1];
                sumx += pt[0];
                sumy += pt[1];
            }
            this.center_offset = [sumx / num_vertices, sumy / num_vertices];
        
            let ccw = null;
            let ptslen = points.length;
            for (let i = 0; i < ptslen; i++) {
                var j = (i + 1) % ptslen;
                let k = (i + 2) % ptslen;
                let edge1 = [points[j][0] - points[i][0],
                    points[j][1] - points[i][1]];
                let edge2 = [points[k][0] - points[j][0],
                    points[k][1] - points[j][1]];
                let cross = edge1[0] * edge2[1] - edge2[0] * edge1[1];
            
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
        
            let normals = [];
            let bounds_on_normals = [];
            for (let i = 0; i < ptslen; i++) {
                var j = (i + 1) % ptslen;
                let normal = normalize([this.points[i][1] - this.points[j][1],
                    this.points[j][0] - this.points[i][0]]);
            
                let skip = false;
                for (let i2 = 0; i2 < normals.length; i2++) {
                    let other = normals[i2];
                    if (Math.abs(dotProduct(normal, other)) > 1 - EPSILON) {
                        skip = true;
                        continue;
                    }
                }
            
                if (skip) { continue; }
            
                let bounds_on_normal = projectShapeOntoAxis(this, normal);
            
                normals.push(normal);
                bounds_on_normals.push(bounds_on_normal);
            }
        
            this.normals = normals;
            this.bounds_on_normals = bounds_on_normals;
        
            return;
        }
    
        subpath(context, offx, offy) {
            let pts = this.points;
            context.moveTo(pts[0][0] + offx, pts[0][1] + offy);
            for (let i = 1; i < pts.length; i++) {
                context.lineTo(pts[i][0] + offx, pts[i][1] + offy);
            }
            context.closePath();
        
            let coffx = offx + this.center_offset[0];
            let coffy = offy + this.center_offset[1];
            context.moveTo(coffx + POINT_RADIUS, coffy);
            context.arc(coffx, coffy, POINT_RADIUS, 0, 2 * Math.PI);
        
            for (let k = 0; k < this.normals.length; k++) {
                let normal = this.normals[k];
                context.moveTo(coffx + NORMAL_OFFSET * normal[0],
                    coffy + NORMAL_OFFSET * normal[1]);
                context.lineTo(coffx +
                    (NORMAL_LENGTH + NORMAL_OFFSET) * normal[0],
                    coffy + (NORMAL_LENGTH + NORMAL_OFFSET) * normal[1]);
            }
        
            return;
        }
    },

    intersects(x_a, x_b, y_a, y_b, shape_a, shape_b) {
        let test = intersection_test_map[shape_a.type];
        if (test != null) {
            test = test[shape_b.type];
            if (test != null) {
                return test(shape_a, x_a, y_a, shape_b, x_b, y_b);
            }
        }
        test = intersection_test_map[shape_b.type];
        if (test != null) {
            test = test[shape_a.type];
            if (test != null) {
                let result = test(shape_b, x_b, y_b, shape_a, x_a, y_a);
                if (result) {
                    return [result[0], [-result[1][0], -result[1][1]]];
                } else {
                    return false;
                }
            }
        }
    
        throw `can't test ${shape_a.type} against ${shape_b.type}`;
        return false;
    }
};
