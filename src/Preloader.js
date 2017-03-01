/**
 * Created by Marty on 2/20/2017.
 *
 * The Preloader state is used to preload assets before the MainMenu is displayed. Once assets have been loaded the Preloader state
 * will start the MainMenu state
 */


Game.Preloader = function(game) { };

Game.Preloader.prototype = {
    preload:function(){
        var preloadBG = this.add.sprite((this.world.width-580)*0.5, (this.world.height+150)*0.5, 'loading-background');
        var preloadProgress = this.add.sprite((this.world.width-540)*0.5, (this.world.height+170)*0.5, 'loading-progress');
        this.load.setPreloadSprite(preloadProgress);
        this.preloadResources();

    },
    preloadResources: function() {
        var pack = Game.Preloader.resources;

        for(var method in pack) {
            pack[method].forEach(function(args){
                var loader = this.load[method];
                loader && loader.apply(this.load, args);
            }, this);
        }


    },

    create:function(){
        this.state.start('MainMenu');
    }
};

Game.Preloader.resources = {
    /*
     *  Some examples of how to load various types of assets using this style of loading 
     */
    'image' : [
        ['tileset', 'assets/img/level_tileset.png']
    ],

    'spritesheet' : [
        ['buttons', 'assets/img/buttons.png', 193, 71]
    ],

    'audio': [
        ['level_music', ['assets/audio/level_music.mp3', 'assets/audio/level_music.ogg']]
    ],

    'tilemap': [
        ['map1', 'assets/maps/level1.json', null, Phaser.Tilemap.TILED_JSON]    /*JSON style tilemap loading */

    ]

};