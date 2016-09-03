import 'babel-core/register'
import 'babel-polyfill'
import $ from 'jquery'
import game from 'boredjs/game'
import loader from 'boredjs/loader'
import map from 'boredjs/map'
import geometry from 'boredjs/geometry'
import demo from './demo'
import demo2 from './demo2'
import ui from 'ui'
import zonko_desert from 'zonko_desert'

$(() => {
    // Force jQuery to grab fresh data in its Ajax requests.
    $.ajaxSetup({cache: false});
    
    // This is where the game code starts.
    let loader_scene = new loader.LoaderScene({
            maps: {
                demo: { file: 'assets/demo.json', script: demo },
                demo2: { file: 'assets/demo2.json', script: demo2 },
                // zonko_desert: { name: 'zonko_desert', script: zonko_desert}
            },
            sprites: {
                player: 'assets/player.json',
                demo2player: 'assets/demo2player.json',
                // joanna: 'joanna',
                // shaun: 'shaun',
                // javelina: 'javelina'
            },
            sounds: {}
        }, (loaded) => {
            demo.setPlayerSprite(loaded.sprites.player);
            let demo_scene = new map.MapScene(loaded.maps.demo);

            demo2.setPlayerMetadata(new geometry.Aabb([4, 4]), loaded.sprites.demo2player);
            let demo_scene2 = new demo2.DemoScene(loaded.maps.demo2);

            game.switchScene(demo_scene);
        });

    game.init(480, 240, 1 / 60, 1 / 20, loader_scene);
    // setupScreenfull(game);
    $(window).resize(game.resizeCanvasToAspectRatio);
    $(game.canvas()).attr('dir', ui.isRightToLeft() ? 'rtl' : 'ltr');
    game.run();
});
