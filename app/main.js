// Configure RequireJS to load jQuery from a common URL.
// requirejs.config( {
//     paths: {
//         jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min',
//         screenfull: '../libs/screenfull'
//     }
// });

// require(['jquery', 'screenfull', './cg', './demo', './demo2', './ui',
// './zonko_desert'],
//   function($, __void__, cg, demo, demo2, ui,
//   zonko_desert) {
import $ from 'jquery'
import game from 'boredjs/game'
import loader from 'boredjs/loader'
import map from 'boredjs/map'
import geometry from 'boredjs/geometry'
import demo from './demo'
import demo2 from './demo2'
import ui from 'ui'
import zonko_desert from 'zonko_desert'

    // let {game, loader, map} = cg;

    // let setupScreenfull = function(game) {
    //     if ((typeof screenfull !== 'undefined' && screenfull !== null) && screenfull.enabled) {
    //         let fs_btn_container = (document.getElementById('fs-btn')) || document.body;
    //         let fs_button = $('<button/>').text('Fullscreen').click(function() {
    //             let game_canvas = game.canvas();
    //             screenfull.request(game_canvas);
    //             $(game_canvas).focus();
    //             return;
    //         });
    //         return fs_btn_container.appendChild(fs_button[0]);
    //     }
    // };

    $(() => {
        // Force jQuery to grab fresh data in its Ajax requests.
        $.ajaxSetup({cache: false});
        
        // This is where the game code starts.
        let loader_scene = new loader.LoaderScene({
                maps: {
                    demo: { name: 'demo', script: demo },
                    demo2: { name: 'demo2', script: demo2 },
                    // zonko_desert: { name: 'zonko_desert', script: zonko_desert}
                },
                sprites: {
                    player: 'player',
                    demo2player: 'demo2player',
                    // joanna: 'joanna',
                    // shaun: 'shaun',
                    // javelina: 'javelina'
                },
                sounds: {}
            }, (loaded) => {
                demo.setPlayerSprite(loaded.sprites.player);
                let demo_scene = new map.MapScene(loaded.maps.demo);

                demo2.setPlayerMetadata(new geometry.Aabb([4, 4]), loaded.sprites.joanna);
                let demo_scene2 = new demo2.DemoScene(loaded.maps.demo2);

                // let zonko_desert = new demo2.DemoScene(loaded.maps.zonko_desert);

                game.switchScene(demo_scene);
            });

        game.init(320, 240, 1 / 60, 1 / 20, loader_scene);
        // setupScreenfull(game);
        $(window).resize(game.resizeCanvasToAspectRatio);
        $(game.canvas()).attr('dir', ui.isRightToLeft() ? 'rtl' : 'ltr');
        game.run();
    });
// });

