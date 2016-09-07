import 'babel-core/register'
import 'babel-polyfill'
import $ from 'jquery'
import screenfull from 'screenfull'

import game from 'boredjs/game'
import loader from 'boredjs/loader'
import map from 'boredjs/map'
import geometry from 'boredjs/geometry'
import demo from './demo'
import demo2 from './demo2'
import ui from 'ui'
import zonko_desert from 'zonko_desert'

function setupFullscreen() {
    if(screenfull.enabled) {
        $('.fullscreen-toggle').click(() => {
            screenfull.request(document.getElementById('game'));
        });
    } else {
        $('.fullscreen-toggle').hide();
    }
}

$(() => {
    // Force jQuery to grab fresh data in its Ajax requests.
    $.ajaxSetup({cache: false});
    
    // This is where the game code starts.
    let loader_scene = new loader.LoaderScene({
            maps: {
                demo: { file: 'assets/demo.json', script: demo },
                demo2: { file: 'assets/demo2.json', script: demo2 },
            },
            sprites: {
                player: 'assets/player.json',
                demo2player: 'assets/demo2player.json',
            },
            sounds: {
                noise: 'assets/white_noise.ogg'
            }
        }, (loaded) => {
            demo.setPlayerSprite(loaded.sprites.player);
            let demo_scene = new map.MapScene(loaded.maps.demo);

            demo2.setPlayerMetadata(new geometry.Aabb([4, 4]), loaded.sprites.demo2player);
            let demo_scene2 = new demo2.DemoScene(loaded.maps.demo2);

            game.switchScene(demo_scene2);
        });

    game.init(160, 120, 1 / 60, 1 / 20, loader_scene);
    setupFullscreen();
    $(window).resize(game.resizeCanvasToAspectRatio);
    $(game.canvas()).attr('dir', ui.isRightToLeft() ? 'rtl' : 'ltr');
    game.run();
});
