define(['./geometry'], geometry =>
    // An entity which may be placed in a map and scripted with
    // update, draw, onCollide, and onObstruct callbacks.
    ({
        Entity: class {
            constructor(x, y, shape) {
                this.x = x;
                this.y = y;
                this.shape = shape;
            }
        
            // Puts a subpath of its underlying collision primitive onto
            // the drawing context.
            shapeSubpath(context, xoff, yoff) {
                this.shape.subpath(context, this.x + xoff, this.y + yoff);
                return;
            }
        
            // Detects if entity bounds are left of another's bounds.
            boundsLeftOf(other) {
                return this.x + this.shape.bounds_offsets[1] <
                    other.x + other.shape.bounds_offsets[0];
            }
    
            // Tests whether entity box bounds intersect.
            // This is useful for collision and drawing culling.
            boundsIntersects(other) {
                let bounds_a = this.shape.bounds_offsets;
                let bounds_b = other.shape.bounds_offsets;
            
                return this.x + bounds_a[0] <= other.x + bounds_b[1] &&
                    this.x + bounds_a[1] >= other.x + bounds_b[0] &&
                    this.y + bounds_a[2] <= other.y + bounds_b[3] &&
                    this.y + bounds_a[3] >= other.y + bounds_b[2];
            }
        
            // Tests whether entity intersects another entity.
            // Used when collision manager updates.
            intersects(other) {
                if (this.boundsIntersects(other)) {
                    return geometry.intersects(this.x, other.x, this.y, other.y,
                        this.shape, other.shape);
                }
                return false;
            }
        }
    })
);

