// define(['./game'], game =>
import game from './game'
    // Using ye old midpoint method
    export default {
        integrate(obj, dt) {
            let v = obj.velocity || [0, 0];
            let a = obj.acceleration || [0, 0];
            let last_a = obj.last_acceleration || a;
        
            let damping = obj.damping || 1;
        
            v[0] *= damping;
            v[1] *= damping;
        
            obj.x = obj.x + v[0] * dt + a[0] * dt * dt;
            obj.y = obj.y + v[1] * dt + a[1] * dt * dt;
        
            v[0] = v[0] + a[0] * dt;
            v[1] = v[1] + a[1] * dt;
        
            obj.velocity = v;
            return;
        }
    };
// );

