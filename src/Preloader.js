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
        ['dot32', 'assets/img/dot32.png'],
        ['bigDot32', 'assets/img/bigDot32.png'],
        ['cherry', 'assets/img/cherry.png'],
        ['cTile32', 'assets/img/chompermazetiles32g.png'],
        ['down', 'assets/img/down.png'],
        ['left', 'assets/img/left.png'],
        ['right', 'assets/img/right.png'],
        ['up', 'assets/img/up.png'],
        ['circle', 'assets/img/circle.png'],
        ['story-bg', 'assets/img/Packground.png'],
        ['bg-story', 'assets/img/StoryBackgroundBlur.png'],
        ['logo', 'assets/img/Logo.png'],
        ['instructions', 'assets/img/instructions.png'],
        ['overlay', 'assets/img/overlay.png'],
        ['ui-bg', 'assets/img/ui-bg.png'],
        ['particle', 'assets/img/particle.png'],
        ['black', 'assets/img/black.png'],
        ['cup', 'assets/img/trophy.png'],
        ['congrats', 'assets/img/congrats.png'],
        ['coupon-one', 'assets/img/dealercoupon.png'],
        ['coupon-two', 'assets/img/dealercoupontwo.png'],
        ['coupon-three', 'assets/img/dealercouponthree.png']

    ],

    'atlasXML': [
        ['spark', 'assets/atlasXML/spark.png', 'assets/atlasXML/spark.xml']
    ],

    'audio': [
        ['level_music', ['assets/audio/finalMainLoop.mp3', 'assets/audio/finalMainLoop.ogg']],
        ['menu_music', ['assets/audio/menuLoop.mp3', 'assets/audio/menuLoop.ogg']],
        ['big_eat_sfx', ['assets/audio/bigEat.mp3', 'assets/audio/bigEat.ogg']],
		['ghost_eat_sfx', ['assets/audio/ghostEat.mp3','assets/audio/ghostEat.ogg']]
    ],

    'tilemap': [
        ['pmap32', 'assets/maps/pmap32.csv']



    ],

    'spritesheet': [
        ['csprites32','assets/img/chompersprites32.png', 32, 32],
        ['cSpTile32', 'assets/img/chompermazetiles32g.png', 32, 32],
        ['downs', 'assets/img/downs.png', 143,182],
        ['lefts', 'assets/img/lefts.png', 182, 143],
        ['rights', 'assets/img/rights.png', 182, 143],
        ['ups', 'assets/img/ups.png', 143,182],
        ['button-start', 'assets/img/button-start.png', 180, 180],
        ['button-rules', 'assets/img/rules-btn.png', 110, 40],
        ['button-play', 'assets/img/play-btn.png', 475, 140],
        ['button-continue', 'assets/img/button-continue.png', 180, 180],
        ['button-mainmenu', 'assets/img/button-mainmenu.png', 180, 180],
        ['button-restart', 'assets/img/button-tryagain.png', 180, 180],
        ['button-achievements', 'assets/img/button-achievements.png', 110, 110],
        ['button-pause', 'assets/img/button-pause.png', 80, 80],
        ['button-audio', 'assets/img/button-sound.png', 80, 80],
        ['button-back', 'assets/img/button-back.png', 70, 70],
        ['claim-prize-btn', 'assets/img/claimPrizes.png', 400, 60]

    ]

};
