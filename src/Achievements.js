/**
 *
 * Achievements state is for the screen directly after the game completes. This state will display the
 * user's score and their corresponding prize. This state will link to the screen which is used to collect their user info.
 */

Game.Achievements = function(game){

};

Game.Achievements.prototype = {

    create: function(){
        var fontAchievements = { font: "32px Arial", fill: "000" };
        var textAchievements = this.add.text(100, 75, 'Achievements screen', fontAchievements);

        var buttonBack = this.add.button(this.world.width-20,
            game.world.height-20, 'button-back', this.clickBack, this, 1, 0, 2);

        buttonBack.anchor.set(1, 1);
        buttonBack.x = this.world.width+buttonBack.width+20;
        this.add.tween(buttonBack).to({x: this.world.width-20}, 500, Phaser.Easing.Exponential.Out, true);
    }

    clickBack: function() {
        this.game.state.start('MainMenu');
    }
};
