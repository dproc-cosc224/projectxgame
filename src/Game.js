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

var GHOST_SPEED = 140;
var GHOST_RUNNING_AWAY_SPEED = 80;
var DEAD_GHOST_SPEED = 200;
var GHOST_TURN_THRESHOLD = 7;

var map;
var layer;
var tiles;
var cursors;
var music;
var player_startPosX;
var player_startPosY;
var wasd;
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
var gameOverText;

var killText;

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

    var p_data = new GameEntity(player_startPosX, player_startPosY, 150, 10, Phaser.RIGHT, Phaser.NONE, new Phaser.Point(), new Phaser.Point());
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

        if('level' in queryDict) {
            level = queryDict['level'];
        }else{
            level = 'pacmap';
        }

        game.stage.smoothed = true;

        music = game.add.audio('level_music');
        music.play('', 0, 0.5, true);

        if (level === 'dog') {

            map = this.add.tilemap('testmap1', gridsize, gridsize);
            map.addTilesetImage('land');
            layer = map.createLayer(0);

            player_startPosX = 14;
            player_startPosY = 21;

            enemyStartX = 7;
            enemyStartY = 11;

            enemy_data= [
                make_enemy_data(enemyStartX * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function_1),
                make_enemy_data((enemyStartX+1) * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function_1)
            ];
            player_data = make_player_data();
            NUM_ENEMIES = enemy_data.length;
            enemy_sprites = new Array(NUM_ENEMIES);

            treatIndex = 7;
            sTreatsIndex = 5;
            safetile = 7;

            treats = this.add.physicsGroup();
            sTreats = this.add.physicsGroup();

            map.createFromTiles(treatIndex, safetile, 'bone', layer, treats);
            map.createFromTiles(sTreatsIndex, safetile, 'bigBone', layer, sTreats);

        } else if (level === 'pacmap') {

            map = this.add.tilemap('pmap32', gridsize, gridsize);
            map.addTilesetImage('cTile32');
            layer = map.createLayer(0);

            player_startPosX = 18;
            player_startPosY = 19;

            enemyStartX = 9;
            enemyStartY = 11;

            enemy_data= [

                make_enemy_data(enemyStartX * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function_1),
                make_enemy_data((enemyStartX+1) * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function_1)

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

        }

        this.time.events.add(Phaser.Timer.SECOND * 3, function() {
            enemiesMoving = true;
        });

        //treats.setAll('x', 6, false, false, 1);
        //treats.setAll('y', 6, false, false, 1);

        //sTreats.setAll('y', 9, false, false, 1);
        map.setCollisionByExclusion([safetile], true, layer);

        layer.resizeWorld();

        //create the timer
        timer = this.time.create(false);
        timer.loop(1000, this.updateCounter, this);
        timer.start();
        time = 1000;
        timeText = this.add.text(400, 32, 'Time Left : ' + time, {font: 'Press Start 2P', fontSize: '16px', fill: '#ffffff'});
        timeText.visible = true;

        //create the player
        if (level === 'dog') {

            player = this.add.sprite((player_startPosX * gridsize) + (gridsize / 2), (player_startPosY * gridsize) + (gridsize / 2), 'dog', 0);
            player.anchor.setTo(0.5, 0.5);
            player.animations.add('walkLeft', [0, 1, 2, 3, 4, 5, 4, 3, 2, 1], 20, true);
            player.animations.add('walkRight', [6, 7, 8, 9, 10, 11, 10, 9, 8, 7], 20, true);
            player.animations.add('walkUp', [12, 13, 14, 15, 16, 17, 16, 15, 14, 13], 20, true);
            player.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 22, 21, 20, 19], 20, true);
        }else if(level === 'pacmap'){

            player = this.add.sprite((player_startPosX * gridsize) + (gridsize / 2), (player_startPosY * gridsize) + (gridsize / 2), 'csprites32', 38);
            player.anchor.setTo(0.5, 0.5);
            player.animations.add('walkLeft', [38, 39], 10, true);
            player.animations.add('walkRight', [10, 11], 10, true);
            player.animations.add('walkUp', [52, 53], 10, true);
            player.animations.add('walkDown', [24, 25],10, true);
        }


        this.physics.arcade.enable(player);
        player.body.setSize(gridsize, gridsize, 0, 0);

        // create enemies
        for(var i = 0; i < NUM_ENEMIES; i++) {
            var enemy;
            if (level === 'dog') {
                enemy = game.add.sprite(enemy_data[i].startX, enemy_data[i].startY, 'vacuum', 0);
            }else if(level === 'pacmap'){
                enemy = game.add.sprite(enemy_data[i].startX, enemy_data[i].startY, 'csprites32', 0);
                enemy.animations.add('walkRight', [0, 1], 10, true);
                enemy.animations.add('walkDown', [14, 15], 10, true);
                enemy.animations.add('walkLeft', [28, 29], 10, true);
                enemy.animations.add('walkUp', [42, 43], 10, true);
                enemy.animations.add('runAway', [12, 13, 26, 27], 20, true);
                enemy.animations.add('run', [12], 1, true);
                enemy.animations.add('score', [54], 1, true);
                enemy.animations.add('dead', [40], 1, true);
                enemy.play('walkRight');
            }
            enemy.anchor.setTo(0.5, 0.5);
            this.physics.arcade.enable(enemy);
            enemy.body.collideWorldBounds = true;
            enemy_sprites[i] = enemy;
            //this.move(enemy_sprites[i], enemy_data[i]);


        }

        //set the score to zero
        score = 0;
        scoreText = this.add.text(32 ,32, 'score : 0', {font: 'Press Start 2P', fontSize: '16px', fill: '#ffffff'});
        scoreText.visible = true;

        //set the gameOverText and set it to not visible
        gameOverText = this.add.text((game.width/2)-142, (game.height/2)-50, 'Congratulation! You Scored : ' + score , {font: 'Press Start 2P', fontSize: '16px', fill: '#ffffff'});
        gameOverText.visible = false;


        upButton = this.add.button((8.75 * gridsize), (22 * gridsize), 'up',  null, this, 0,1,0,1);
        upButton.scale.setTo(0.6,0.6);
        upButton.events.onInputOver.add(function(){ buttonUpDown = true; });
        upButton.events.onInputOut.add(function(){ buttonUpDown = false;});
        upButton.events.onInputDown.add(function(){ buttonUpDown = true; });
        upButton.events.onInputUp.add(function(){ buttonUpDown = false; });
        //upButton.animations.add('press', [0,1,2,1],20, false);

        downButton = this.add.button((8.75 * gridsize), (25.5 * gridsize), 'down',  null, this, 0,1,0,1);
        downButton.scale.setTo(0.6,0.6);
        downButton.events.onInputOver.add(function(){ buttonDownDown = true; });
        downButton.events.onInputOut.add(function(){ buttonDownDown = false;});
        downButton.events.onInputDown.add(function(){ buttonDownDown = true; });
        downButton.events.onInputUp.add(function(){ buttonDownDown = false; });
        //downButton.animations.add('press', [0,1,2,1],20, false);

        rightButton = this.add.button((10.65 * gridsize), (24 * gridsize), 'right',  null, this, 0,1,0,1);
        rightButton.scale.setTo(.6,.6);
        rightButton.events.onInputOver.add(function(){ buttonRightDown = true; });
        rightButton.events.onInputOut.add(function(){ buttonRightDown = false;});
        rightButton.events.onInputDown.add(function(){ buttonRightDown = true; });
        rightButton.events.onInputUp.add(function(){ buttonRightDown = false; });
        //rightButton.animations.add('press', [0,1,2,1],20, false);

        leftButton = this.add.button((6.1 * gridsize), (24 * gridsize), 'left',  null, this, 0,1,0,1);
        leftButton.scale.setTo(.6,.6);
        leftButton.events.onInputOver.add(function(){ buttonLeftDown = true; });
        leftButton.events.onInputOut.add(function(){ buttonLeftDown = false;});
        leftButton.events.onInputDown.add(function(){ buttonLeftDown = true; });
        leftButton.events.onInputUp.add(function(){ buttonLeftDown = false; });
        //leftButton.animations.add('press', [0,1,2,1],20, false);

        var circle = this.add.sprite(( 9.25 * gridsize), (24.60 * gridsize), 'circle', 0);
        circle.scale.setTo(.4,.4);

        cursors = this.input.keyboard.createCursorKeys();

        //add the WASD keys to the possible input
        wasd = {
            up : game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A)
        };

        this.move(player, player_data);
        //game.input.onDown.add(this.beginSwipe, this);

        var fontTitle = { font: "48px Arial", fill: "#000", stroke: "#FFFF00", strokeThickness: 10 };

        this.screenGameoverGroup = this.add.group();
        this.screenGameoverText = this.add.text(this.world.width*0.5, 100, 'Game over', fontTitle);
        this.screenGameoverText.anchor.set(0.5,0);
        this.screenGameoverScore = this.add.text(this.world.width*0.5, 300, 'Score: '+score, fontTitle);
        this.screenGameoverScore.anchor.set(0.5,0.5);
        this.screenGameoverGroup.add(this.screenGameoverText);
        this.screenGameoverGroup.add(this.screenGameoverScore);
        this.screenGameoverGroup.visible = false;

    },

    spawnEmitter: function(item, particle, number, lifespan, frequency, offsetX, offsetY, gravity) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        lifespan = lifespan || 2000;
        frequency = frequency || 0;
        var emitter = this.game.add.emitter(item.x+offsetX, item.y+offsetY, number);
        emitter.maxParticles = number;
        emitter.makeParticles(particle);
        emitter.setXSpeed(-500, 500);
        emitter.setYSpeed(-700, 300);
        emitter.setScale(4, 1, 4, 1, 500, Phaser.Easing.Linear.None);
        emitter.gravity = gravity || 250;
        emitter.start(false, lifespan, frequency, number);
    },

    stateBack: function(game) {
        this.screenGameoverGroup.visible = true;
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
        if((cursors.left.isDown  || wasd.left.isDown || buttonLeftDown || moveDirection === "left" )  && player_data.current !== Phaser.LEFT){

            this.checkDirection(player, player_data, Phaser.LEFT);

        }else if((cursors.right.isDown || wasd.right.isDown || buttonRightDown || moveDirection === "right")  && player_data.current !== Phaser.RIGHT){

            this.checkDirection(player, player_data, Phaser.RIGHT );

        }else if((cursors.up.isDown || wasd.up.isDown  || buttonUpDown || moveDirection === "up")  && player_data.current !== Phaser.UP){

            this.checkDirection(player, player_data, Phaser.UP);

        }else if((cursors.down.isDown  || wasd.down.isDown || buttonDownDown || moveDirection === "down")  && player_data.current !== Phaser.DOWN){

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
        moveDirection = null;

        obj.current = obj.turning;

    },

    // getAngle: function(sprite, obj, to) {
    //     // use these for sprite rotations -- assumes that sprite starts facing to the right
    //     var targetAngleTable = {};
    //     targetAngleTable[Phaser.RIGHT] = 0;
    //     targetAngleTable[Phaser.DOWN] = 90;
    //     targetAngleTable[Phaser.LEFT] = 180;
    //     targetAngleTable[Phaser.UP] = 270;
    //
    //     var curAngle = this.math.radToDeg(sprite.rotation);
    //
    //     var targetAngle = targetAngleTable[to];
    //     var targetAngleNeg = targetAngle - 360;
    //
    //     var diffTurnRight = this.math.difference(targetAngle, curAngle);
    //     var diffTurnLeft  = this.math.difference(targetAngleNeg, curAngle);
    //
    //     if(diffTurnLeft < diffTurnRight) {
    //         return targetAngleNeg;
    //     }
    //     return targetAngle;
    // },

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
        music.volume=0;
        var sfx = this.add.audio('big_eat_sfx');
        sfx.volume = temp;
        sfx.play('',0,0.5,true);
        treat.kill();
        this.time.events.add(Phaser.Timer.SECOND, function(){
            music.volume = temp;
        });


        // TODO
        // Make a sound or change appearance of player to indicate they have a power-up
        player_data.powered_up++;

        this.time.events.add(Phaser.Timer.SECOND * 3, function() {
           if(player_data.powered_up == 1) {
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

        if(level === 'pacmap' ){
            for(var i =0; i < NUM_ENEMIES; i++) {
                if(enemy_data[i].alive)
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
        timer.stop();
        music.stop();

        //remove the player
        player.kill();
        for(var i = 0; i < NUM_ENEMIES; i++) {
            enemy_sprites[i].kill();
        }

        this.black = this.game.add.sprite(0, 0, 'black');
        this.black.alpha = 0.7;

        this.collectbutton = this.add.button(this.world.width/2,
            this.world.height-100, 'claim-prize-btn', this.collect, this, 1, 0, 2);
        this.collectbutton.anchor.x = 0.5;
        this.collectbutton.anchor.y = 0.5;
        this.collectbutton.alpha = 0;

        this.couponOne = this.game.add.sprite(-270, 315, 'coupon-one');
        this.couponOne.anchor.x = 0.5;
        this.couponOne.alpha = 0;

        this.couponTwo = this.game.add.sprite(-270, 480, 'coupon-two');
        this.couponTwo.anchor.x = 0.5;
        this.couponTwo.alpha = 0;

        this.couponThree = this.game.add.sprite(-270, 645, 'coupon-three');
        this.couponThree.anchor.x = 0.5;
        this.couponThree.alpha = 0;

        this.spark_emitter = this.game.add.emitter(this.game.world.centerX, -32, 640);
        this.spark_emitter.makeParticles('spark', [0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19]);
        this.spark_emitter.maxParticleScale = 0.6;
        this.spark_emitter.minParticleScale = 0.2;
        this.spark_emitter.setYSpeed(20, 100);
        this.spark_emitter.gravity = 100;
        this.spark_emitter.width = this.game.world.width * 1.5;
        this.spark_emitter.minRotation = 0;
        this.spark_emitter.maxRotation = 40;

        // display game over ui
        this.game.world.bringToTop(this.screenGameoverGroup);
        this.fadeToBlack = this.game.add.tween(this.black).to({alpha: 0.75}, 1000, "Linear", true);
        this.screenGameoverGroup.visible = true;
        this.fadeToBlack.onComplete.add(this.gameoverScoreTween, this);

    },

    gameoverScoreTween: function() {
        this.spark_emitter.start(false, 14000, 20);
        this.screenGameoverScore.setText('Score: 0');
        if(score) {
            this.tweenedPoints = 0;
            var pointsTween = this.add.tween(this);
            pointsTween.to({ tweenedPoints: score }, 1000, Phaser.Easing.Linear.None, true, 500);
            pointsTween.onUpdateCallback(function(){
                this.screenGameoverScore.setText('Score: '+Math.floor(this.tweenedPoints));
            }, this);
            pointsTween.onComplete.addOnce(function(){
                this.screenGameoverScore.setText('Score: '+ score);
            }, this);
            pointsTween.start();
        }
    },

    update: function(game) {

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

        // for each enemy
        for(var j = 0; j < NUM_ENEMIES; j++) {
            var enemy = enemy_data[j];
            var enemy_sprite = enemy_sprites[j];

            if(enemiesMoving){
                enemy.move(this, enemy_sprite, enemy);
            }
        }
    }
};


function enemy_movement_function_1(game, sprite, obj) {

    // The movement function starts at the target point and searches until it
    // finds the ghosts's position. Set the ghost position.
    var enemy_x = Phaser.Math.snapToFloor(Math.floor(sprite.x), gridsize) / gridsize;
    var enemy_y = Phaser.Math.snapToFloor(Math.floor(sprite.y), gridsize) / gridsize;


    if(Math.abs(enemy_x-ghostDenX) <= 0 && Math.abs(enemy_y-ghostDenY) <= 0){
        obj.running = false;
        obj.speed = GHOST_SPEED;
        obj.alive = true;
    }

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

    // seen array will track the tiles we have already looked at
    var seen = new Array(WIDTH);
    for(var i = 0; i < WIDTH; i++) {
        seen[i] = new Array(HEIGHT).fill(false);
    }

    // path finding variables
    var target = Phaser.NONE;
    // possible directions
    var dirs = [Phaser.LEFT, Phaser.RIGHT, Phaser.UP, Phaser.DOWN];
    // corresponding x,y vectors for each direction
    var vectors = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // use a queue for searching
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
            //dfs
            current = queue.pop();
        }else{
            //bfs
            current = queue.shift();
        }

        // extract current x and y
        var current_x = current[0];
        var current_y = current[1];

        // check for valid directions and set this tile to be seen
        seen[current_x][current_y] = true;
        directions[Phaser.LEFT] = map.getTileLeft(index, current_x, current_y);
        directions[Phaser.RIGHT] = map.getTileRight(index, current_x, current_y);
        directions[Phaser.UP] = map.getTileAbove(index, current_x, current_y);
        directions[Phaser.DOWN] = map.getTileBelow(index, current_x, current_y);


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
            if(directions[target] !== null && directions[target].index === safetile){

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
