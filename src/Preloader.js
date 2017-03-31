/**
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
        //this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

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
     * Load all game resources
     */
    'image' : [
        //['tiles', 'assets/img/tile2.png'],
        //['ptiles', 'assets/img/TileCraftGroundSet.png'],
        //['pacman', 'assets/img/pac.png'],
        //['dot', 'assets/img/dot.png'],
        //['bigDot', 'assets/img/bigDot.png'],
        //['dot48', 'assets/img/dot48.png'],
        //['bigDot48', 'assets/img/bigDot48.png'],
        ['dot32', 'assets/img/dot32.png'],
        ['bigDot32', 'assets/img/bigDot32.png'],
        ['cherry', 'assets/img/cherry.png'],
        //['femur', 'assets/img/femur.png'],
        //['ham', 'assets/img/ham.png'],
        //['ghost', 'assets/img/ghost4.png'],
        //['vacuum', 'assets/img/vacuum.png'],
        //['land', 'assets/img/land.png'],
        //['bone', 'assets/img/bone.png'],
        //['bigBone', 'assets/img/bigBone.png'],
        //['cTile', 'assets/img/chompermazetiles.png'],
        //['cTile48', 'assets/img/chompermazetiles48.png'],
        ['cTile32', 'assets/img/chompermazetiles32g.png'],
        ['down', 'assets/img/down.png'],
        ['left', 'assets/img/left.png'],
        ['right', 'assets/img/right.png'],
        ['up', 'assets/img/up.png'],
        ['circle', 'assets/img/circle.png']

    ],

    'audio': [
        ['level_music', ['assets/audio/DPROC_Main_Loop2.mp3', 'assets/audio/DPROC_Main_Loop2.ogg']]
    ],

    'tilemap': [
        //['map', 'assets/maps/map.csv'],
        //['pupmap', 'assets/maps/pupmap.csv'],
        //['testmap1', 'assets/maps/testmap1.csv'],
        //['pmap48', 'assets/maps/pmap48.csv'],
        //['pmap', 'assets/maps/pmap.csv'],
        ['pmap32', 'assets/maps/pmap32.csv']



    ],

    'spritesheet': [
        //['pup', 'assets/img/pup.png', 32, 32],
        //['dog', 'assets/img/dog.png', 64, 64],
        //['csprites','assets/img/chompersprites.png', 64, 64],
        //['csprites48','assets/img/chompersprites48.png', 48, 48],
        ['csprites32','assets/img/chompersprites32.png', 32, 32],
        ['cSpTile32', 'assets/img/chompermazetiles32g.png', 32, 32]

    ]

};
