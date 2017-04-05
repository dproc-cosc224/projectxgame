/**
 *
 * The MainMenu state is used to display the games rules/instructions as well as providing a link to the terms and conditions of the game.
 * The main menu will provide a start button which upon being pressed will load the Story state.
 */

var menumusic;
Game.MainMenu = function(game) { };

Game.MainMenu.prototype = {

    create:function(game){
        menumusic = game.add.audio('menu_music');
        menumusic.play('', 0, 0.5, true);

        game.Storage = this.game.plugins.add(Phaser.Plugin.Storage);

        game.Storage.initUnset('Highscore', 0);
        var highscore = game.Storage.get('Highscore') || 0;

        var buttonStart = this.add.button(230, this.world.height-380, 'button-start', this.clickStart, this, 1, 0, 2);
        buttonStart.anchor.set(0);

    },

    clickStart: function() {
        //Game._playAudio('click');
		menumusic.mute=true;
        this.camera.fade(0, 200, false);
        this.time.events.add(200, function() {
            this.state.start('Story');
        }, this);
    }
};
