// An implementation of insertion sort
let insertionSort = function(ary, cmp) {
    cmp = cmp || function(a, b) { if (a < b) { return -1; } else if (a === b) { return 0; } else { return 1; } };
    for (let i = 1; i < ary.length; i++) {
        let tmp = ary[i];
        let j = i;
        while (j > 0 && (cmp(ary[j - 1], tmp)) > 0) {
            ary[j] = ary[j - 1];
            --j;
        }
        ary[j] = tmp;
    }
    return;
};

// requestAnimationFrame shim by Erik Möller
// with fixes from Paul Irish and Tino Zijdel.
//
// CoffeeScript port by Jacob Rus
(function() {
    let w = window;
    let iterable = ['ms', 'moz', 'webkit', 'o'];
    for (let i = 0; i < iterable.length; i++) {
        let vendor = iterable[i];
        if (w.requestAnimationFrame) { break; }
        w.requestAnimationFrame = w[vendor +
            'RequestAnimationFrame'];
        w.cancelAnimationFrame = (w[vendor +
            'CancelAnimationFrame'] ||
            w[`${vendor}CancelRequestAnimationFrame`]);
    }

    // Deal with the case where rAF is built in but cAF is not.
    if (w.requestAnimationFrame) {
        if (w.cancelAnimationFrame) { return; }
        let browserRaf = w.requestAnimationFrame;
        let canceled = {};
        w.requestAnimationFrame = function(callback) {
            let id;
            return id = browserRaf(function(time) {
                if (id in canceled) { return delete canceled[id];
                } else { return callback(time); }
            });
        };
        w.cancelAnimationFrame = id => canceled[id] = true;

    // Handle legacy browsers which don’t implement rAF.
    } else {
        let targetTime = 0;
        w.requestAnimationFrame = function(callback) {
            let currentTime;
            targetTime = Math.max(targetTime + 16, currentTime = +new Date());
            return w.setTimeout((() => callback(+new Date())), targetTime - currentTime);
        };

        w.cancelAnimationFrame = id => clearTimeout(id);
    }
    
    return;
})();

// Performance.now polyfill.
// Thanks Tony Gentilcore for the [heads up](http://gent.ilcore.com/2012/06/better-timer-for-javascript.html).
let pNow = (function() {
    // A monotonic but slightly inaccurate timer in seconds.
    // Referenced Kevin Reid's implementation.
    let time_offset = 0;
    let time_seen = 0;
    let fallback = function() {
        let t = Date.now();
        if (t < time_seen) { time_offset += time_seen - t; }
        time_seen = t;
        return (t + time_offset);
    };
    
    if (typeof performance !== 'undefined' && performance !== null) {
        if (performance.now != null) { return performance.now; }
        
        let iterable = ['ms', 'moz', 'webkit', 'o'];
        for (let i = 0; i < iterable.length; i++) {
            let vendor = iterable[i];
            pNow = performance[vendor + 'Now'];
            if (pNow != null) { return pNow; }
        }
    }
    
    return fallback;
})();

// An epsilon for things involving real numbers and convergence.
export default {
    EPSILON: Math.pow(2, -50),

    time() { return .001 * pNow.call(window.performance); },

    // Insertion sort is used as a sort for arrays which don't change
    // order much between frames.
    persistentSort: insertionSort,

    // Constructs a 32-bit bitmask from an array of values ranging from
    // 0 to 31 inclusive.
    constructBitmask(group_array) {
        let mask = 0;
        for (let i = 0; i < group_array.length; i++) {
            let group = group_array[i];
            mask |= 1 << group;
        }
        return mask;
    },

    // Turns an RGB tuple into a web-friendly hex representation.
    rgbToHex(r, g, b) {
        let toTwoDigitHex = v => `00${
            (Math.min((Math.max((Math.round(v * 256)), 0)), 255)).
                toString(16)}`.substr(-2) ;
        return `#${toTwoDigitHex(r)}${toTwoDigitHex(g)}${toTwoDigitHex(b)}`;
    },

    // Prepares a coroutine set from generator constructors
    prepareCoroutineSet(updateGenerator, drawGenerator) {
        let updateGen = updateGenerator();
        let drawGen = drawGenerator();
        updateGen.next();
        drawGen.next();

        return {
            update: updateGen,
            draw: drawGen
        };
    }
};
