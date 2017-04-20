/**
 *
 * The Game state is the main game loop. All game related logic will reside in this state. Upon completion of the game the Game state will
 * start the Achievements state to display to the user the prize they one.
 *
 */

Game.Game = function(game) { };

var HEIGHT = 30;
var WIDTH = 20;

var ghostDenX = 9;
var ghostDenY = 11;

var GHOST_SPEED = 80;
var GHOST_RUNNING_AWAY_SPEED = 60;
var DEAD_GHOST_SPEED = 200;
var GHOST_TURN_THRESHOLD = 7;

var map;
var layer;
var tiles;
var cursors;
var music;
var player_startPosX;
var player_startPosY;
//var wasd;
var gridsize = 32;
var directions = [null, null, null, null];
var opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
var treats;
var sTreats;
var treatIndex;
var sTreatsIndex;
var safetile;

var upButton;
var downButton;
var leftButton;
var rightButton;

var endX;
var endY;
var score;
var scoreText;
var timer;
var time;
var timeText;
var gameOver = false;


var player;
var player_data;
var level;
var enemyStartX;
var enemyStartY;

var enemy_data;
var NUM_ENEMIES;
var enemy_sprites;

var buttonLeftDown;
var buttonRightDown;
var buttonUpDown;
var buttonDownDown;
var enemiesMoving = false;

var moveDirection;

// game entity object used for players and enemies
function GameEntity(startX, startY, speed, threshold, current, turning, marker, turnPoint) {
    this.startX = startX;
    this.startY = startY;
    this.speed = speed;
    this.threshold = threshold;
    this.current = current;
    this.turning = turning;
    this.marker = marker;
    this.turnPoint = turnPoint;
}

//creates the player data
function make_player_data() {
    var p_data = new GameEntity(player_startPosX, player_startPosY, 150, 20, Phaser.RIGHT, Phaser.NONE, new Phaser.Point(), new Phaser.Point());
    p_data.powered_up = 0;
    return p_data;
}

// creates a enemy data object, with a given starting position and movement function
function make_enemy_data(startX, startY, movement_function) {
    var enemy = new GameEntity(startX, startY, GHOST_SPEED, GHOST_TURN_THRESHOLD, Phaser.RIGHT, Phaser.NONE, new Phaser.Point(), new Phaser.Point());
    enemy.move = movement_function;
    enemy.turnSpeed = 150;
    enemy.running = false;
    enemy.alive = true;
    return enemy;
}

Game.Game.prototype = {

    init: function(game) {
        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    create: function(game) {

        level = 'pacmap';

        game.stage.smoothed = true;

        music = game.add.audio('level_music');
        music.play('', 0, 0.5, true);

        map = this.add.tilemap('pmap32', gridsize, gridsize);
        map.addTilesetImage('cTile32');
        layer = map.createLayer(0);

        player_startPosX = 18;
        player_startPosY = 19;
        enemyStartX = 9;
        enemyStartY = 11;

        enemy_data= [
            make_enemy_data(enemyStartX * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function),
            make_enemy_data((enemyStartX+1) * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function)
        ];

        player_data = make_player_data();
        NUM_ENEMIES = enemy_data.length;
        enemy_sprites = new Array(NUM_ENEMIES);

        treatIndex = 2;
        sTreatsIndex = 8;
        safetile = -1;

        treats = this.add.physicsGroup();
        sTreats = this.add.physicsGroup();

        map.createFromTiles(treatIndex, safetile, 'dot32', layer, treats);
        map.createFromTiles(sTreatsIndex, safetile, 'cSpTile32', layer, sTreats);

        //add blink animations to bigdots
        sTreats.callAll('animations.add', 'animations', 'blink', [4, 8], 3, true);
        sTreats.callAll('animations.play', 'animations', 'blink');


        this.time.events.add(Phaser.Timer.SECOND * 2, function() {
            enemiesMoving = true;
        });

        map.setCollisionByExclusion([safetile], true, layer);

        layer.resizeWorld();

        //create the timer
        timer = this.time.create(false);
        timer.loop(1000, this.updateCounter, this);
        timer.start();
        time = 20;
        timeText = this.add.text(400, 32, 'Time Left : ' + time, {font: 'Press Start 2P', fontSize: '16px', fill: '#ffffff'});
        timeText.visible = true;

        //create the player
        player = this.add.sprite((player_startPosX * gridsize) + (gridsize / 2), (player_startPosY * gridsize) + (gridsize / 2), 'csprites32', 38);
        player.anchor.setTo(0.5, 0.5);
        player.animations.add('walkLeft', [38, 39], 10, true);
        player.animations.add('walkRight', [10, 11], 10, true);
        player.animations.add('walkUp', [52, 53], 10, true);
        player.animations.add('walkDown', [24, 25],10, true);

        this.physics.arcade.enable(player);
        player.body.setSize(gridsize-5, gridsize-5, 0, 0);

        // create enemies
        for(var i = 0; i < NUM_ENEMIES; i++) {
            var enemy = game.add.sprite(enemy_data[i].startX, enemy_data[i].startY, 'csprites32', 0);
            enemy.animations.add('walkRight', [0, 1], 10, true);
            enemy.animations.add('walkDown', [14, 15], 10, true);
            enemy.animations.add('walkLeft', [28, 29], 10, true);
            enemy.animations.add('walkUp', [42, 43], 10, true);
            enemy.animations.add('runAway', [12, 13, 26, 27], 20, true);
            enemy.animations.add('run', [12], 1, true);
            enemy.animations.add('score', [54], 1, true);
            enemy.animations.add('dead', [40], 1, true);
            enemy.play('walkRight');
            enemy.anchor.setTo(0.5, 0.5);
            this.physics.arcade.enable(enemy);
            enemy.body.collideWorldBounds = true;
            enemy_sprites[i] = enemy;
        }

        //set the score to zero
        score = 0;
        scoreText = this.add.text(32 ,32, 'score : 0', {font: 'Press Start 2P', fontSize: '16px', fill: '#ffffff'});
        scoreText.visible = true;


        upButton = this.add.button((8.75 * gridsize), (22 * gridsize), 'ups',  null, this, 1,0,1,0);
        upButton.scale.setTo(0.6, 0.6);
        upButton.events.onInputOver.add(function(){ buttonUpDown = true; upButton.scale.setTo(0.61, 0.61);});
        upButton.events.onInputOut.add(function(){ buttonUpDown = false; upButton.scale.setTo(0.6, 0.6);});
        upButton.events.onInputDown.add(function(){ buttonUpDown = true; upButton.scale.setTo(0.61, 0.61);});
        upButton.events.onInputUp.add(function(){ buttonUpDown = false; upButton.scale.setTo(0.6, 0.6);});

        downButton = this.add.button((8.75 * gridsize), (25.5 * gridsize), 'downs',  null, this, 1,0,1,0);
        downButton.scale.setTo(0.6, 0.6);
        downButton.events.onInputOver.add(function(){ buttonDownDown = true; downButton.scale.setTo(0.62, 0.62);});
        downButton.events.onInputOut.add(function(){ buttonDownDown = false; downButton.scale.setTo(0.6, 0.6);});
        downButton.events.onInputDown.add(function(){ buttonDownDown = true; downButton.scale.setTo(0.62, 0.62);});
        downButton.events.onInputUp.add(function(){ buttonDownDown = false; downButton.scale.setTo(0.6, 0.6);});

        rightButton = this.add.button((10.65 * gridsize), (24 * gridsize), 'rights',  null, this, 1,0,1,0);
        rightButton.scale.setTo(0.6, 0.6);
        rightButton.events.onInputOver.add(function(){ buttonRightDown = true; rightButton.scale.setTo(0.62, 0.62);});
        rightButton.events.onInputOut.add(function(){ buttonRightDown = false; rightButton.scale.setTo(0.6, 0.6);});
        rightButton.events.onInputDown.add(function(){ buttonRightDown = true; rightButton.scale.setTo(0.62, 0.62);});
        rightButton.events.onInputUp.add(function(){ buttonRightDown = false; rightButton.scale.setTo(0.6, 0.6);});

        leftButton = this.add.button((6.1 * gridsize), (24 * gridsize), 'lefts',  null, this, 1,0,1,0);
        leftButton.scale.setTo(0.6, 0.6);
        leftButton.events.onInputOver.add(function(){ buttonLeftDown = true; leftButton.scale.setTo(0.62, 0.62);});
        leftButton.events.onInputOut.add(function(){ buttonLeftDown = false; leftButton.scale.setTo(0.6, 0.6);});
        leftButton.events.onInputDown.add(function(){ buttonLeftDown = true; leftButton.scale.setTo(0.62, 0.62);});
        leftButton.events.onInputUp.add(function(){ buttonLeftDown = false; leftButton.scale.setTo(0.6, 0.6);});

        var circle = this.add.sprite(( 9.25 * gridsize), (24.60 * gridsize), 'circle', 0);
        circle.scale.setTo(0.4, 0.4);

        cursors = this.input.keyboard.createCursorKeys();

        // wasd = {
        //     up : game.input.keyboard.addKey(Phaser.Keyboard.W),
        //     down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        //     right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        //     left: game.input.keyboard.addKey(Phaser.Keyboard.A)
        // };

        this.move(player, player_data);
        //game.input.onDown.add(this.beginSwipe, this);

    },

    stateBack: function(game) {
        this.state.start('MainMenu');
    },

    stateRestart: function() {
        this.state.restart(true);
    },

    updateCounter : function(){
        time--;
        timeText.text = 'Time Left : ' + time;
        if(time === 0){
            this.gameOver();
        }
    },

/*    beginSwipe : function(){
      player_startPosX = this.game.input.worldX;
      player_startPosY = this.game.input.worldY;
      this.game.input.onDown.remove(this.beginSwipe);
      this.game.input.onUp.add(this.endSwipe, this);
    },

    endSwipe : function () {
        endX = this.game.input.worldX;
        endY = this.game.input.worldY;

        var distX = player_startPosX-endX;
        var distY = player_startPosY-endY;

        if(Math.abs(distX)>Math.abs(distY)*2 && Math.abs(distX) > 10){
            if(distX> 0 && player_data.current !== Phaser.LEFT){
                moveDirection = "left"; //this.checkDirection(player, player_data, Phaser.LEFT);
            }else if(distX < 0 && player_data.current !== Phaser.RIGHT){
                moveDirection = "right"; //this.checkDirection(player, player_data, Phaser.RIGHT);
            }
        }
        if(Math.abs(distY)>Math.abs(distX)*2 && Math.abs(distY)>10){
            if(distY>0 && player_data.current !== Phaser.UP){
                moveDirection = "up"; //this.checkDirection(player, player_data, Phaser.UP);
            }else if (distY < 0 && player_data.current !== Phaser.DOWN){
                moveDirection = "down"; //this.checkDirection(player, player_data, Phaser.DOWN);
            }
        }
        this.game.input.onDown.add(this.beginSwipe, this);
        this.game.input.onUp.remove(this.endSwipe);
    },*/


    checkKeys: function () {

        //if the left key is pressed and the player not currently facing left
        if((cursors.left.isDown || buttonLeftDown )  && player_data.current !== Phaser.LEFT){

            this.checkDirection(player, player_data, Phaser.LEFT);

        }else if((cursors.right.isDown || buttonRightDown )  && player_data.current !== Phaser.RIGHT){

            this.checkDirection(player, player_data, Phaser.RIGHT );

        }else if((cursors.up.isDown || buttonUpDown )  && player_data.current !== Phaser.UP){

            this.checkDirection(player, player_data, Phaser.UP);

        }else if((cursors.down.isDown  || buttonDownDown )  && player_data.current !== Phaser.DOWN){

            this.checkDirection(player, player_data, Phaser.DOWN);
        }
    },


    move: function (sprite, obj){

        var speed = obj.speed;

        if (obj.turning === Phaser.LEFT  || obj.turning === Phaser.UP){

            speed = -speed;
        }

        if (obj.turning === Phaser.LEFT || obj.turning === Phaser.RIGHT ){
            sprite.body.velocity.x = speed;
            sprite.body.velocity.y = 0;
        }else{
            sprite.body.velocity.y = speed;
            sprite.body.velocity.x = 0;
        }

        sprite.scale.x = 1;
        sprite.angle = 0;

        if(((enemy_data.indexOf(obj) > -1) && (!obj.running)) || obj === player_data) {
            if(obj.turning === Phaser.RIGHT){
                sprite.play('walkRight');
            }
            else if(obj.turning === Phaser.LEFT){
                sprite.play('walkLeft');
            }
            else if(obj.turning === Phaser.UP){
                sprite.play('walkUp');
            }
            else if (obj.turning === Phaser.DOWN) {
                sprite.play('walkDown');
            }
        }


        obj.current = obj.turning;

    },


    checkDirection: function(sprite, obj, turningTo) {
        //3 conditions to check:
        //The player is set to turn in that direction
        //There isn't a tile in that direction
        //The tile isn't a wall

        if (obj.turning === turningTo ||
            directions[turningTo] === null ||
            directions[turningTo].index !== safetile){

            //if they are already set to turn in that direction or
            //if there isn't a tile there, or the tile's index is 0

            return;
        }

        if(obj.current === opposites[turningTo]){
            //if the player wants to turn 180
            obj.turning = turningTo;
            this.move(sprite, obj);

        }else{
            obj.turning = turningTo;
            obj.turnPoint.x = (obj.marker.x * gridsize) + (gridsize / 2);
            obj.turnPoint.y = (obj.marker.y * gridsize) + (gridsize / 2);
        }
    },

    turn: function(sprite, obj){

        //take in the floor of the players position
        var sprite_x = Math.floor(sprite.x);
        var sprite_y = Math.floor(sprite.y);


        //if the player's cooridinates and the turning point
        //not within the alloted threshold, return false
        if(!this.math.fuzzyEqual(sprite_x, obj.turnPoint.x, obj.threshold) ||
            !this.math.fuzzyEqual(sprite_y, obj.turnPoint.y, obj.threshold)){

            return false;
        }

        //otherwise, we will align the player with the grid and
        //allow turning
        sprite.x = obj.turnPoint.x;
        sprite.y = obj.turnPoint.y;

        sprite.body.reset(obj.turnPoint.x, obj.turnPoint.y);

        //allow the player to turn in the desired direction
        this.move(sprite, obj);

        //reset the desired turning to none.
        obj.turning = Phaser.NONE;

        return true;

    },

    eatTreats: function (player, treat){
        //remove the dot
        treat.kill();

        //update the score
        score += 20;
        scoreText.text = 'Score: ' + score;

    },

    eatSTreats: function (player, treat){
        //remove the big dot
        var temp = music.volume;
        music.volume=temp/2
        var sfx = this.add.audio('big_eat_sfx');
        sfx.volume = temp;
        sfx.play('',0,0.5,true);
        treat.kill();
        this.time.events.add(Phaser.Timer.SECOND/2, function(){
            music.volume = temp;
        });


        // TODO
        // Make a sound or change appearance of player to indicate they have a power-up
        player_data.powered_up++;

        this.time.events.add(Phaser.Timer.SECOND * 3, function() {
           if(player_data.powered_up === 1) {
               for(var i = 0; i < NUM_ENEMIES; i++){
                   if(enemy_data[i].running && enemy_data[i].alive) {
                       enemy_sprites[i].play('runAway');
                   }
               }
           }
        });

        this.time.events.add(Phaser.Timer.SECOND * 4, function() {

            player_data.powered_up--;
            if(player_data.powered_up === 0){
                for(var i = 0; i < NUM_ENEMIES; i++){
                    if(enemy_data[i].running && enemy_data[i].alive) {
                        enemy_sprites[i].play('walkRight');
                        enemy_data[i].running = false;
                        enemy_data.speed = GHOST_SPEED;
                    }
                }
            }
        });


        //update the score
        score += 50;
        scoreText.text = 'Score: ' + score;

        for(var i =0; i < NUM_ENEMIES; i++) {
            if(enemy_data[i].alive) {
                enemy_sprites[i].play('run');
            }
        }
        for(var j = 0; j < NUM_ENEMIES; j++) {
            if (enemy_data[j].alive) {
                enemy_data[j].running = true;
                enemy_data[j].speed = GHOST_RUNNING_AWAY_SPEED;

            }
        }

    },

    enemyCollision: function (player, enemy){

        var enemy_obj = enemy_data[enemy_sprites.indexOf(enemy)];
        if(enemy_obj.running && enemy_obj.alive){
			var temp = music.volume;
			music.volume=temp/2
			var sfx = this.add.audio('ghost_eat_sfx');
			sfx.volume = temp;
			sfx.play('',0,0.5,true);
			this.time.events.add(Phaser.Timer.SECOND/2, function(){
				music.volume = temp;
			});

            enemy_obj.alive = false;
            enemy.play('dead');
            enemy.speed = DEAD_GHOST_SPEED;


            //update the score
            score += 500;
            scoreText.text = 'Score: ' + score;

        }else if(enemy_obj.alive) {
            this.gameOver();
        }
    },


    gameOver: function(game){
        //TODO Add an animation/sound on enemy collision

        //stop the timer
		var lose = this.add.audio('lose');
		lose.play('',0,0.5,true);
        timer.stop();
        music.stop();
        gameOver = true;

        //remove the player
        //player.kill();
        //for(var i = 0; i < NUM_ENEMIES; i++) {
        //    enemy_sprites[i].kill();
        //}

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        for(var i = 0; i < NUM_ENEMIES; i++) {
            enemy_sprites[i].body.velocity.x = 0;
            enemy_sprites[i].body.velocity.y = 0;
        }
        

        this.black = this.game.add.sprite(0, 0, 'black');
        this.black.alpha = 0.7;

        this.spark_emitter = this.game.add.emitter(this.game.world.centerX, -32, 640);
        this.spark_emitter.makeParticles('spark', [0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19]);
        this.spark_emitter.maxParticleScale = 0.6;
        this.spark_emitter.minParticleScale = 0.2;
        this.spark_emitter.setYSpeed(20, 100);
        this.spark_emitter.gravity = 100;
        this.spark_emitter.width = this.game.world.width * 1.5;
        this.spark_emitter.minRotation = 0;
        this.spark_emitter.maxRotation = 40;
               
        this.cup = this.game.add.sprite(this.world.width/2, (this.world.height + 400), 'cup');
        this.cup.anchor.x = 0.5;
        this.cup.anchor.y = 0.5;

        this.collectbutton = this.add.button(this.world.width/2,
        this.world.height-100, 'claim-prize-btn', this.collect, this, 1, 0, 2);
        this.collectbutton.anchor.x = 0.5;
        this.collectbutton.anchor.y = 0.5;
        this.collectbutton.alpha = 0;

        this.congrats = this.game.add.sprite(this.world.width/2, 15, 'congrats');
        this.congrats.anchor.x = 0.5;
        this.congrats.scale.x = 0.25;
        this.congrats.scale.y = 0.25;
        this.congrats.alpha = 0;

        this.couponOne = this.game.add.sprite(-270, 315, 'coupon-one');
        this.couponOne.anchor.x = 0.5;
        this.couponOne.alpha = 0;

        this.couponTwo = this.game.add.sprite(-270, 480, 'coupon-two');
        this.couponTwo.anchor.x = 0.5;
        this.couponTwo.alpha = 0;

        this.couponThree = this.game.add.sprite(-270, 645, 'coupon-three');
        this.couponThree.anchor.x = 0.5;
        this.couponThree.alpha = 0;


        // display game over ui
        this.camera.shake(0.01, 500, true, Phaser.Camera.SHAKE_BOTH, true);
        this.fadeToBlack = this.game.add.tween(this.black).to({alpha: 0.75}, 1000, "Linear", true);
        this.fadeToBlack.onComplete.add(this.endFunction, this);

    },

    endFunction: function() {
        this.spark_emitter.start(false, 14000, 20);
        this.raiseCup();
    },

    raiseCup: function(){
        this.game.time.events.add(Phaser.Timer.SECOND * 2, this.congratText, this);
        this.cupUp = this.game.add.tween(this.cup).to( { y: this.world.height/2 - 100 }, 2500, "Linear", true);
    },

    congratText: function(){
        this.game.add.tween(this.congrats).to( { alpha:1 }, 500, "Linear", true);
        this.scalecongratstext = this.game.add.tween(this.congrats.scale).to({ x:1 , y:1 }, 500, "Linear", true);
        this.scalecongratstext.onComplete.add(this.couponEntrance, this);
    },

    couponEntrance: function(){
        this.game.add.tween(this.cup.scale).to( { x:0.35, y:0.35 }, 1250, "Linear", true);
        this.cupUp = this.game.add.tween(this.cup).to( { y:250 }, 1250, "Linear", true);
        this.cupUp.onComplete.add(this.couponSlide, this);
    },

    couponSlide: function(){
        this.couponOneSlide = this.game.add.tween(this.couponOne).to( { x: this.world.width/2, alpha:1 }, 250, "Linear", true);
        this.couponTwoSlide = this.game.add.tween(this.couponTwo).to( { x: this.world.width/2, alpha:1 }, 250, "Linear", true, 125);
        this.couponThreeSlide = this.game.add.tween(this.couponThree).to( { x: this.world.width/2, alpha:1 }, 250, "Linear", true, 250);
        this.couponThreeSlide.onComplete.add(this.showCollectBtn, this);
    },

    showCollectBtn: function(){
        this.game.add.tween(this.collectbutton).to( { alpha:1 }, 250, "Linear", true);
    },

    collect: function() {
        $("#player_score").val(score);
        $("#form1").submit();
    },

    update: function(game) {

        if(gameOver) {
            return;
        }


        //make sure the level collides with the player
        this.physics.arcade.collide(player, layer);

        // collide enemies with the world and the player
        for(var i =0; i < NUM_ENEMIES; i++) {
            this.physics.arcade.collide(enemy_sprites[i], layer);
            this.physics.arcade.overlap(player, enemy_sprites[i], this.enemyCollision, null, this);
        }

        //ensure the player interacts with the treat
        this.physics.arcade.overlap(player, treats, this.eatTreats, null, this);
        this.physics.arcade.overlap(player, sTreats, this.eatSTreats, null, this);

        //find out where player is with grid coordinates
        player_data.marker.x = this.math.snapToFloor(Math.floor(player.x), gridsize) / gridsize;
        player_data.marker.y = this.math.snapToFloor(Math.floor(player.y), gridsize) / gridsize;

        var index = layer.index;
        var x = player_data.marker.x;
        var y = player_data.marker.y;

        //store the tiles around the player in the directions array
        //to be able to check if we can turn into the tile
        directions[Phaser.LEFT] = map.getTileLeft(index, x, y);
        directions[Phaser.RIGHT] = map.getTileRight(index, x, y);
        directions[Phaser.UP] = map.getTileAbove(index, x, y);
        directions[Phaser.DOWN] = map.getTileBelow(index, x, y);

        //every frame check to see if the a key is being pressed
        this.checkKeys();

        //as long as you have a valid direction to turn in, turn
        if(player_data.turning !== Phaser.NONE){
            this.turn(player, player_data);
        }

        //win condition
        //if(treats.total === 0  && sTreats.total === 0){
            // treats.callAll('revive');
            // sTreats.callAll('revive');
            //this.gameOver();
        //}

        if(enemiesMoving){
            // for each enemy
            for(var j = 0; j < NUM_ENEMIES; j++) {
                var enemy = enemy_data[j];
                var enemy_sprite = enemy_sprites[j];

                // set directions array and markers for each ghost.
                // If the ghost tries to move from it's movement function
                // the movement function will check this array to see if it's possible
                // for it to turn
                enemy.marker.x = game.math.snapToFloor(Math.floor(enemy_sprite.x), gridsize) / gridsize;
                enemy.marker.y = game.math.snapToFloor(Math.floor(enemy_sprite.y), gridsize) / gridsize;
                x = enemy.marker.x;
                y = enemy.marker.y;
                directions[Phaser.LEFT] = map.getTileLeft(index, x, y);
                directions[Phaser.RIGHT] = map.getTileRight(index, x, y);
                directions[Phaser.UP] = map.getTileAbove(index, x, y);
                directions[Phaser.DOWN] = map.getTileBelow(index, x, y);

                // call enemies movement function
                enemy.move(this, enemy_sprite, enemy);
            }
        }
    }
};


function enemy_movement_function(game, sprite, obj) {

    // The movement function starts at the target point and searches until it
    // finds the ghosts's position. Set the ghost position.
    var enemy_x = Phaser.Math.snapToFloor(Math.floor(sprite.x), gridsize) / gridsize;
    var enemy_y = Phaser.Math.snapToFloor(Math.floor(sprite.y), gridsize) / gridsize;

    // this resets the ghosts if they make it home
    //if(Math.abs(enemy_x-ghostDenX) <= 0 && Math.abs(enemy_y-ghostDenY) <= 0){
    //    obj.running = false;
    //    obj.speed = GHOST_SPEED;
    //    obj.alive = true;
    //}

    var running = obj.running;

    // set start point for the search
    var startX = Phaser.Math.snapToFloor(Math.floor(player.x), gridsize) / gridsize;
    var startY = Phaser.Math.snapToFloor(Math.floor(player.y), gridsize) / gridsize;
    if(running){
        startX = ghostDenX;
        startY = ghostDenY;
    }

    // index is the index of our tilemap layer
    var index = layer.index;

    // seen array will track the tiles we have already looked at during our search
    var seen = new Array(WIDTH);
    for(var i = 0; i < WIDTH; i++) {
        seen[i] = new Array(HEIGHT).fill(false);
    }

    var options = [];
    // path finding variables
    var target = Phaser.NONE;
    // possible directions
    var dirs = [Phaser.LEFT, Phaser.RIGHT, Phaser.UP, Phaser.DOWN];
    // corresponding x,y vectors for each direction
    var vectors = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // use a queue and/or stack for searching
    var queue = [];

    // push initial state into queue then start search
    // starting point of search is set to the location of the pacman
    // unless the ghosts are running, in which case the starting point
    // is set to be the center of the map
    queue.push([startX, startY]);
    while(queue !== null && queue.length !== 0) {

        // Stack vs Queue, pop will give you a DFS, shift will give you a BFS.
        // DFS will give you more "random" seeming movement
        // BFS will give you the shortest path between the ghost and pacman
        var current;
        if(running || obj === enemy_data[0] ){
            //bfs
            current = queue.shift();
        }else{
            //dfs
            current = queue.pop();
        }

        // extract current x and y
        var current_x = current[0];
        var current_y = current[1];

        // check for valid directions and set this tile to be seen
        seen[current_x][current_y] = true;
        options[Phaser.LEFT] = map.getTileLeft(index, current_x, current_y);
        options[Phaser.RIGHT] = map.getTileRight(index, current_x, current_y);
        options[Phaser.UP] = map.getTileAbove(index, current_x, current_y);
        options[Phaser.DOWN] = map.getTileBelow(index, current_x, current_y);


        // Loop through the tiles in each possible direction
        // If the target is there then we found our path, try to move the ghost there
        // else if the tile is valid and hasn't been seen then push it into the queue
        for(var j = 0; j < 4; j++){

            // set current target
            target = dirs[j];
            // extract the x,y coordinates of current tile
            var x = current_x + vectors[j][0];
            var y = current_y + vectors[j][1];

            // check if the tile is in bounds and is a moveable tile
            if(options[target] !== null && options[target].index === safetile){

                // check if the tile contains the ghost
                if(x === enemy_x && y === enemy_y){
                    target = opposites[target];
                    // check if ghosts is already moving in correct direction
                    if(obj.current !== target){
                        game.checkDirection(sprite, obj, target);
                        // check if ghosts can turn to target direction
                        if(obj.turning !== Phaser.NONE){
                            game.turn(sprite, obj);
                        }
                    }
                    // path was found, exit the function
                    return;
                }

                // push tile into queue if we haven't seen it
                if(!seen[x][y]){
                    seen[x][y] = true;
                    queue.push([x, y]);
                }
            }
        }
    }
}
