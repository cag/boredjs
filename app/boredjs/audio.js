import util from './util'

// Thanks Boris Smus for the [Web Audio tutorial](http://www.html5rocks.com/en/tutorials/webaudio/intro/).
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
let audio_context = null;

// Initializes the audio system.
export default {
    init() {
        if (typeof AudioContext !== 'undefined' && AudioContext !== null) {
            audio_context = new AudioContext();
        } else {
            console.warn('could not initialize audio!');
        }
        console.log(audio_context);
    },

    // See the [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
    // for information on how to use the audio context.
    getAudioContext() { return audio_context; },

    // The `Sound` class handles loading sound buffers and playing them.
    Sound: class {
        constructor(name, onload) {
            this.name = name;
            if (audio_context == null) {
                if (onload != null) { onload(); }
                return;
            }
        
            let request = new XMLHttpRequest();
            request.open('GET', this.name, true);
            request.responseType = 'arraybuffer';
        
            request.onload = () =>
                audio_context.decodeAudioData(request.response,
                    (buffer) => {
                        this.buffer = buffer;
                        if (onload != null) { onload(); }
                    }, function() {
                        throw Error(`could not load sound buffer from ${url}`);
                    })
            ;
        
            request.send();
        }
    
        // Pass in a node to connect to if not playing this sound
        // straight to output.
        play(delay = 0, looped = false, node) {
            if ((audio_context != null) && (this.buffer != null)) {
                let source = audio_context.createBufferSource();
                source.buffer = this.buffer;
                source.loop = looped;
                source.connect(node || audio_context.destination);
                source.noteOn(delay + audio_context.currentTime);
                return source;
            }
            return null;
        }
    },

    // Ptolemy's intense diatonic tuning in A440 has a C4 of 264 Hz
    ptolemy_c4: 264,
    ptolemy_tuning_factors: [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8],

    // Pythagorean tuning in A440 has a C4 of 260.741 Hz
    pythagorean_c4: 260.741
};
