/**
 *
 * The Story state is used to create the Music/Sprite objects necessary to begin the game. Once created the Story state will start the Game state.
 */

Game.Story = function(game) { };

Game.Story.prototype = {

    create: function(game){
        this.music = this.add.audio('menu_music');
        this.music.play();

        this.gameBg = this.game.add.image(0, 0, 'story-bg');

        var buttonContinue = this.add.button(game.world.width-20, game.world.height-150, 'button-play', this.clickContinue, this, 1, 0, 2);

        buttonContinue.anchor.set(0.5, 0.5);
        buttonContinue.x = -700;

        var buttonRules = this.add.button(this.world.width/2, game.world.height-40, 'button-rules', function() {
            window.open('disclaimer.html', '_blank')
        }, this, 1, 0, 2);
        buttonRules.anchor.set(0.5, 0.5);
        buttonRules.x = -700;

        this.add.tween(buttonContinue).to({x: this.world.width/2}, 500, Phaser.Easing.Exponential.Out, true, 1000);
        this.add.tween(buttonRules).to({x: this.world.width/2}, 500, Phaser.Easing.Exponential.Out, true, 1250);

        this.camera.flash(0, 500, false);


    },

    clickContinue: function(game) {
        this.music.stop();
        this.camera.shake(0.01, 200, true, Phaser.Camera.SHAKE_BOTH, true);
        this.camera.fade(0, 200, false);
        this.time.events.add(200, function() {
            this.state.start('Game');
        }, this);
    }
};
