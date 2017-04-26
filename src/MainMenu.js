/**
 *
 * The MainMenu state is used to display the games rules/instructions as well as providing a link to the terms and conditions of the game.
 * The main menu will provide a start button which upon being pressed will load the Story state.
 */

var menumusic;
Game.MainMenu = function(game) { };

Game.MainMenu.prototype = {

    create:function(game){
        this.state.start('Story');
    }
};
