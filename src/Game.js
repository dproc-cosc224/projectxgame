/**
 *
 * The Game state is the main game loop. All game related logic will reside in this state. Upon completion of the game the Game state will
 * start the Achievements state to display to the user the prize they one.
 *
 */

Game.Game = function(game) { };

var HEIGHT = 30;
var WIDTH = 20;

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

var player;
var player_data;
var level;
var enemyStartX;
var enemyStartY;

var enemy_data;
var NUM_ENEMIES;
var enemy_sprites;
var huntMode;

var buttonLeftDown;
var buttonRightDown;
var buttonUpDown;
var buttonDownDown;

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
    var enemy = new GameEntity(startX, startY, 140, 7, Phaser.RIGHT, Phaser.NONE, new Phaser.Point(), new Phaser.Point());
    enemy.move = movement_function;
    enemy.turnSpeed = 150;
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

        // map = this.add.tilemap('pupmap', gridsize, gridsize);
        // map.addTilesetImage('ptiles');



        if (level == 'dog') {

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

        } else if (level == 'pacmap') {

            map = this.add.tilemap('pmap32', gridsize, gridsize);
            map.addTilesetImage('cTile32');
            layer = map.createLayer(0);

            player_startPosX = 18;
            player_startPosY = 19;

            enemyStartX = 4;
            enemyStartY = 7;

            enemy_data= [
                // make_enemy_data(enemyStartX * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function_1),
                // make_enemy_data((enemyStartX+1) * gridsize + gridsize/2, enemyStartY * gridsize + gridsize/2, enemy_movement_function_1)
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
            map.createFromTiles(sTreatsIndex, safetile, 'bigDot32', layer, sTreats);


        }


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
        timeText = this.add.text(400, 32, 'Time Left : ' + time, {fontSize: '32px', fill: '#ffffff'});
        timeText.visible = true;

        //create the player
        if (level == 'dog') {

            player = this.add.sprite((player_startPosX * gridsize) + (gridsize / 2), (player_startPosY * gridsize) + (gridsize / 2), 'dog', 0);
            player.anchor.setTo(0.5, 0.5);
            player.animations.add('walkLeft', [0, 1, 2, 3, 4, 5, 4, 3, 2, 1], 20, true);
            player.animations.add('walkRight', [6, 7, 8, 9, 10, 11, 10, 9, 8, 7], 20, true);
            player.animations.add('walkUp', [12, 13, 14, 15, 16, 17, 16, 15, 14, 13], 20, true);
            player.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 22, 21, 20, 19], 20, true);
        }else if(level == 'pacmap'){

            player = this.add.sprite((player_startPosX * gridsize) + (gridsize / 2), (player_startPosY * gridsize) + (gridsize / 2), 'csprites32', 38);
            player.anchor.setTo(0.5, 0.5);
            player.animations.add('walkLeft', [38, 39], 10, true);
            player.animations.add('walkRight', [10, 11], 10, true);
            player.animations.add('walkUp', [52, 53], 10, true);
            player.animations.add('walkDown', [24, 25],10, true);
        }
        // player.animations.add('walkLeft', [0, 1 , 2 , 1], 20, true);
        // player.animations.add('walkRight', [3, 4, 5, 3], 20, true);
        // player.animations.add('walkUp', [6, 7, 8, 6], 20, true);
        // player.animations.add('walkDown', [9, 10, 11, 10], 20, true);


        this.physics.arcade.enable(player);
        player.body.setSize(gridsize, gridsize, 0, 0);

        // create enemies
        for(var i = 0; i < NUM_ENEMIES; i++) {
            if (level == 'dog') {
                var enemy = game.add.sprite(enemy_data[i].startX, enemy_data[i].startY, 'vacuum', 0);
            }else if(level == 'pacmap'){
                var enemy = game.add.sprite(enemy_data[i].startX, enemy_data[i].startY, 'csprites32', 0);
                enemy.animations.add('moving', [0, 1], 10, true);
                enemy.animations.add('runAway', [12, 13, 26, 27], 20, true);
                enemy.play('moving');
            }
            enemy.anchor.setTo(0.5, 0.5);
            this.physics.arcade.enable(enemy);
            enemy.body.collideWorldBounds = true;
            enemy_sprites[i] = enemy;
            this.move(enemy_sprites[i], enemy_data[i]);
        }

        //set the score to zero
        score = 0;
        scoreText = this.add.text(32 ,32, 'score : 0', { fontSize: '32px', fill: '#ffffff'});
        scoreText.visible = true;

        //set the gameOverText and set it to not visible
        gameOverText = this.add.text((game.width/2)-142, (game.height/2)-50, 'Congratulation! You Scored : ' + score , { fontSize: '32px', fill: '#ffffff'});
        gameOverText.visible = false;

        huntMode = false;

        upButton = this.add.button((9.2 * gridsize), (24 * gridsize), 'up',  null, this, 0,1,0,1);
        upButton.scale.setTo(0.4,0.4);
        upButton.events.onInputOver.add(function(){ buttonUpDown = true; });
        upButton.events.onInputOut.add(function(){ buttonUpDown = false;});
        upButton.events.onInputDown.add(function(){ buttonUpDown = true; });
        upButton.events.onInputUp.add(function(){ buttonUpDown = false; });
        //upButton.animations.add('press', [0,1,2,1],20, false);

        downButton = this.add.button((9.2 * gridsize), (26.75 * gridsize), 'down',  null, this, 0,1,0,1);
        downButton.scale.setTo(0.4,0.4);
        downButton.events.onInputOver.add(function(){ buttonDownDown = true; });
        downButton.events.onInputOut.add(function(){ buttonDownDown = false;});
        downButton.events.onInputDown.add(function(){ buttonDownDown = true; });
        downButton.events.onInputUp.add(function(){ buttonDownDown = false; });
        //downButton.animations.add('press', [0,1,2,1],20, false);

        rightButton = this.add.button((10.45 * gridsize), (25.65 * gridsize), 'right',  null, this, 0,1,0,1);
        rightButton.scale.setTo(.4,.4);
        rightButton.events.onInputOver.add(function(){ buttonRightDown = true; });
        rightButton.events.onInputOut.add(function(){ buttonRightDown = false;});
        rightButton.events.onInputDown.add(function(){ buttonRightDown = true; });
        rightButton.events.onInputUp.add(function(){ buttonRightDown = false; });
        //rightButton.animations.add('press', [0,1,2,1],20, false);

        leftButton = this.add.button((7.45 * gridsize), (25.65 * gridsize), 'left',  null, this, 0,1,0,1);
        leftButton.scale.setTo(.4,.4);
        leftButton.events.onInputOver.add(function(){ buttonLeftDown = true; });
        leftButton.events.onInputOut.add(function(){ buttonLeftDown = false;});
        leftButton.events.onInputDown.add(function(){ buttonLeftDown = true; });
        leftButton.events.onInputUp.add(function(){ buttonLeftDown = false; });
        //leftButton.animations.add('press', [0,1,2,1],20, false);

        var circle = this.add.sprite(( 9.45 * gridsize), (25.85 * gridsize), 'circle', 0);
        circle.scale.setTo(.3,.3);

        cursors = this.input.keyboard.createCursorKeys();

        //add the WASD keys to the possible input
        wasd = {

            up : game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A)
        };

        this.move(player, player_data);

        game.input.onDown.add(this.beginSwipe, this);

    },
/*    tap : function(){
        this.game.input.onDown.remove(this.tap);

        var tapPosX = this.game.input.worldX;
        var tapPosY = this.game.input.worldY;




        if(Math.abs(tapPosX)>Math.abs(tapPosY)*2 && Math.abs(tapPosX) > 10){
            if(tapPosX> 0 && player_data.current !== Phaser.LEFT){
                this.checkDirection(player, player_data, Phaser.LEFT);
            }else if(tapPosX < 0 && player_data.current !== Phaser.RIGHT){
                this.checkDirection(player, player_data, Phaser.RIGHT);
            }
        }
        if(Math.abs(tapPosY)>Math.abs(tapPosX)*2 && Math.abs(tapPosY)>10){
            if(tapPosY>0 && player_data.current !== Phaser.UP){
                this.checkDirection(player, player_data, Phaser.UP);
            }else if (tapPosY < 0 && player_data.current !== Phaser.DOWN){
                this.checkDirection(player, player_data, Phaser.DOWN);
            }
        }

        this.game.input.onDown.add(this.tap, this);


    },*/

    updateCounter : function(){
        time--;
        timeText.text = 'Time Left : ' + time;
        if(time === 0){
            this.gameOver();
        }
    },

    beginSwipe : function(){
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
    },


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

        if(obj == player_data) {
            if(obj.turning === Phaser.RIGHT){
                player.play('walkRight');
            }
            else if(obj.turning === Phaser.LEFT){
                player.play('walkLeft');
            }
            else if(obj.turning === Phaser.UP){
                player.play('walkUp');
            }
            else if (obj.turning === Phaser.DOWN){
                player.play('walkDown');
            }
        }else{
            // rotate the sprite
            //this.add.tween(sprite).to( {angle: this.getAngle(sprite, obj, obj.turning) }, obj.turnSpeed, "Linear", true);
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

    checkDirection : function(sprite, obj, turningTo) {
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
        var plX = Math.floor(sprite.x);
        var plY = Math.floor(sprite.y);

        //if the player's cooridinates and the turning point
        //not within the alloted threshold, return false
        if(!this.math.fuzzyEqual(plX, obj.turnPoint.x, obj.threshold) ||
            !this.math.fuzzyEqual(plY, obj.turnPoint.y, obj.threshold)){

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
        //remove the femur
        treat.kill();

        //update the score
        score += 20;
        scoreText.text = 'Score: ' + score;

    },

    eatSTreats: function (player, treat){
        //remove the ham
        treat.kill();

        // TODO
        // Make a sound or change appearance of player to indicate they have a power-up
        player_data.powered_up++;

        this.time.events.add(Phaser.Timer.SECOND * 4, function() {
            // TODO
            // make a sound or change appearance when power_up ends
            player_data.powered_up--;
        });


        //update the score
        score += 50;
        scoreText.text = 'Score: ' + score;

        //turn on huntMode
        huntMode = true;
        if(level == 'pacmap'){
            for(var i =0; i < NUM_ENEMIES; i++) {
                enemy_sprites[i].play('runAway');
            }
        }


    },

    enemyCollision: function (player, enemy){
        if(huntMode){
            enemy.kill();

            //update the score
            score += 500;
            scoreText.text = 'Score: ' + score;

        }else {
            this.gameOver();
        }
    },

    gameOver: function(){
        //stop the timer
        timer.stop();

        //remove the player
        player.kill();
        for(var i = 0; i < NUM_ENEMIES; i++) {
            enemy_sprites[i].kill();
        }

        //set the visibilty of the text
        gameOverText.text = 'Congratulations! \n You Scored : ' + score;

        gameOverText.visible = true;
        scoreText.visible = false;
        timeText.visible = false;

    },

    update: function(game) {

        //make sure the level collides with the player
        this.physics.arcade.collide(player, layer);

        for(var i =0; i < NUM_ENEMIES; i++) {
            game.physics.arcade.collide(enemy_sprites[i], layer);
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
        if(treats.total === 0  && sTreats.total == 0){
            // treats.callAll('revive');
            // sTreats.callAll('revive');
            //this.gameOver();
        }

        for(var i = 0; i < NUM_ENEMIES; i++) {
            var enemy = enemy_data[i];
            var enemy_sprite = enemy_sprites[i];

            enemy.marker.x = game.math.snapToFloor(Math.floor(enemy_sprite.x), gridsize) / gridsize;
            enemy.marker.y = game.math.snapToFloor(Math.floor(enemy_sprite.y), gridsize) / gridsize;

            x = enemy.marker.x;
            y = enemy.marker.y;

            directions[Phaser.LEFT] = map.getTileLeft(index, x, y);
            directions[Phaser.RIGHT] = map.getTileRight(index, x, y);
            directions[Phaser.UP] = map.getTileAbove(index, x, y);
            directions[Phaser.DOWN] = map.getTileBelow(index, x, y);

            enemy.move(this, enemy_sprite, enemy);
        }



    }

};

function enemy_movement_function_1(game, sprite, obj) {

    var enemy_x = Phaser.Math.snapToFloor(Math.floor(sprite.x), gridsize) / gridsize;


    var enemy_y = Phaser.Math.snapToFloor(Math.floor(sprite.y), gridsize) / gridsize;

    var player_x = Phaser.Math.snapToFloor(Math.floor(player.x), gridsize) / gridsize;
    var player_y = Phaser.Math.snapToFloor(Math.floor(player.y), gridsize) / gridsize;

    var index = layer.index;

    var seen = new Array(WIDTH);
    for(var i = 0; i < WIDTH; i++) {
        seen[i] = new Array(HEIGHT).fill(false);
    }

    var running = player_data.powered_up > 0;

    var queue = [];
    queue.push([player_x, player_y]);

    while(queue != null && queue.length != 0) {

        // Stack vs Queue, pop will give you a DFS, shift will give you a BFS.
        var current;
        if(running || obj == enemy_data[0] ){
            //bfs
            current = queue.shift();
        }else{
            //dfs
            current = queue.pop();
        }
        var current_x = current[0];
        var current_y = current[1];
        var target = Phaser.NONE;

        seen[current_x][current_y] = true;

        directions[Phaser.LEFT] = map.getTileLeft(index, current_x, current_y);
        directions[Phaser.RIGHT] = map.getTileRight(index, current_x, current_y);
        directions[Phaser.UP] = map.getTileAbove(index, current_x, current_y);
        directions[Phaser.DOWN] = map.getTileBelow(index, current_x, current_y);

        // TODO
        // make sure we don't collide with other ghosts

        if(directions[Phaser.LEFT] != null && directions[Phaser.LEFT].index == safetile){
            if(current_x - 1 == enemy_x && current_y == enemy_y){
                target = Phaser.RIGHT;
                if (running){
                    target = Phaser.LEFT;

                }
                if(!running || (running && map.getTileLeft(index, enemy_x, enemy_y).index == safetile)){
                    if(obj.current != target) {
                        game.checkDirection(sprite, obj, target);
                        if(obj.turning != Phaser.NONE){
                            game.turn(sprite, obj);
                        }
                    }
                    break;
                }

            }
            if(! seen[current_x-1][current_y]){
                seen[current_x-1][current_y] = true;
                queue.push([current_x - 1, current_y]);
            }
        }

        if(directions[Phaser.RIGHT] != null && directions[Phaser.RIGHT].index == safetile){
            if(current_x + 1 == enemy_x && current_y == enemy_y){
                target = Phaser.LEFT;
                if(running) {
                    target = Phaser.RIGHT;
                }
                if(!running || (running && map.getTileRight(index, enemy_x, enemy_y).index == safetile)){
                    if(obj.current != target) {
                        game.checkDirection(sprite, obj, target);
                        if(obj.turning != Phaser.NONE){
                            game.turn(sprite, obj);
                        }
                    }
                    break;
                }
            }
            if(! seen[current_x+1][current_y]){
                seen[current_x+1][current_y] = true;
                queue.push([current_x+1, current_y]);
            }
        }

        if(directions[Phaser.UP] != null && directions[Phaser.UP].index == safetile) {
            if(current_x == enemy_x && current_y - 1 == enemy_y){
                target = Phaser.DOWN;
                if(running) {
                    target = Phaser.UP;
                }
                if(!running || (running && map.getTileAbove(index, enemy_x, enemy_y).index == safetile)){
                    if(obj.current != target){
                        game.checkDirection(sprite, obj, target);
                        if(obj.turning != Phaser.NONE) {
                            game.turn(sprite, obj);
                        }
                    }
                    break;
                }
            }
            if(! seen[current_x][current_y - 1]){
                seen[current_x][current_y - 1] = true;
                queue.push([current_x, current_y - 1]);
            }
        }
        if(directions[Phaser.DOWN] != null && directions[Phaser.DOWN].index == safetile) {
            if(current_x == enemy_x && current_y + 1 == enemy_y){
                target = Phaser.UP;
                if(running) {
                    target = Phaser.DOWN;
                }
                if(!running || (running && map.getTileBelow(index, enemy_x, enemy_y).index == safetile)){
                    if(obj.current != target) {
                        game.checkDirection(sprite, obj, target);
                        if(obj.turning != Phaser.NONE){
                            game.turn(sprite, obj);
                        }
                    }
                    break;
                }
            }
            if(! seen[current_x][current_y + 1]){
                seen[current_x][current_y + 1] = true;
                queue.push([current_x, current_y + 1]);
            }
        }
    }
}
