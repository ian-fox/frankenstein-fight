function buildGame() {
    var game = {};

    game.keys = {'left': false, 'right': false, 'up': false, 'down': false, 'W': false, 'A': false, 'S': false, 'D': false, 'Q': false, 'E': false};


    game.run = function() {    
        game.tick = 0;
        game.menuState = 'main';
        game.health = 50;
        game.stage = new createjs.Stage('canvas');
        game.stage.addChild(game.menu);
        game.monster = new monster();
        game.frankenstein = new frankenstein();
        game.villagers = [];
        game.difficulty = 1;
        game.calculatePathing();
        game.deaths = [];
        
        createjs.Ticker.addEventListener('tick', handleTick);
        function handleTick(event) {
            game.tick ++;
            game.difficulty += 0.001;
            if (game.menuState === 'game') {
                game.frankenstein.move();
                game.monster.move();
                
                for (var i = 0; i < game.villagers.length; i++) {
                    game.villagers[i].move();
                }
                game.spawnVillagers();
                game.killVillagers();
                game.checkLoss();
            }
            game.stage.update();
        }
    };

    game.start = function() {
        if (game.menuState === 'main'){
            game.stage.addChild(game.menu_bolt);
            createjs.Sound.play('thunder');
            setTimeout(function() {
                game.menuState = 'game';
                game.stage.children = [];
                game.tick = 0;
                game.stage.addChild(game.background);
                for (var i = 0; i < 27; i++) {
                    game.rooms[i].draw();
                }
                game.stage.addChild(game.monster.sprite);
                game.stage.addChild(game.frankenstein.sprite);
                game.stage.addChild(game.foreground);
                var rect = new createjs.Shape();
                rect.graphics.beginFill('#000000').drawRect(0, 574, 800, 600);
                game.stage.addChild(rect);
                game.healthBar = new createjs.Sprite(game.healthSheet);
                game.healthBar.x = 754;
                game.healthBar.y = 10;
                game.healthBar.gotoAndStop(0);
                game.stage.addChild(game.healthBar);
            }, 100);
        }
    }

    game.help = function() {
        if (game.menuState === 'main'){
            game.menuState = 'transition';
            game.menu.y -= 600;
            game.menuState = 'help'
        }
    };

    game.main = function() {
        if (game.menuState === 'help') {
            game.menuState = 'transition';
            game.menu.y += 600;
            game.menuState = 'main';
        }
    };

    var room = function(paths, sprite, x, y) {
        this.sprite = sprite;
        this.paths = paths;
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.gotoAndStop(this.sprite._currentFrame);
        
        this.draw = function() {
            game.stage.addChild(this.sprite);
        }
    };

    game.createMap = function() {
        game.rooms = [];
        game.rooms.push(new room(['down'],new createjs.Sprite(game.roomSheet,0),192,128));
        game.rooms.push(new room(['left','up'],new createjs.Sprite(game.roomSheet,1),64,192));
        game.rooms.push(new room(['right'],new createjs.Sprite(game.roomSheet,2),128,192));
        game.rooms.push(new room(['up','down','left','right'],new createjs.Sprite(game.roomSheet,3),192,192));
        game.rooms.push(new room(['left','right'],new createjs.Sprite(game.roomSheet,4),256,192));
        game.rooms.push(new room(['up','down','left','right'],new createjs.Sprite(game.roomSheet,5),320,192));
        game.rooms.push(new room(['left'],new createjs.Sprite(game.roomSheet,6),384,192));
        game.rooms.push(new room(['up','down','right'],new createjs.Sprite(game.roomSheet,7),64,256));
        game.rooms.push(new room(['left','right','down'],new createjs.Sprite(game.roomSheet,8),128,256));
        game.rooms.push(new room(['left','right','up'],new createjs.Sprite(game.roomSheet,9),192,256));
        game.rooms.push(new room(['left','down','right'],new createjs.Sprite(game.roomSheet,10),256,256));
        game.rooms.push(new room(['right'],new createjs.Sprite(game.roomSheet,11),320,256));
        game.rooms.push(new room(['left'],new createjs.Sprite(game.roomSheet,12),384,256));
        game.rooms.push(new room(['up','right'],new createjs.Sprite(game.roomSheet,13),64,320));
        game.rooms.push(new room(['up','down','left','right'],new createjs.Sprite(game.roomSheet,14),128,320));
        game.rooms.push(new room(['down','right'],new createjs.Sprite(game.roomSheet,15),192,320));
        game.rooms.push(new room(['up','down','left','right'],new createjs.Sprite(game.roomSheet,16),256,320));
        game.rooms.push(new room(['left','right','down'],new createjs.Sprite(game.roomSheet,17),320,320));
        game.rooms.push(new room(['left','right'],new createjs.Sprite(game.roomSheet,18),384,320));
        game.rooms.push(new room(['left','right','up','down'],new createjs.Sprite(game.roomSheet,19),128,384));
        game.rooms.push(new room(['left','right'],new createjs.Sprite(game.roomSheet,20),192,384));
        game.rooms.push(new room(['left','right','up','down'],new createjs.Sprite(game.roomSheet,21),256,384));
        game.rooms.push(new room(['left','right','up','down'],new createjs.Sprite(game.roomSheet,22),320,384));
        game.rooms.push(new room(['left','up'],new createjs.Sprite(game.roomSheet,23),384,384));
        game.rooms.push(new room(['up','right'],new createjs.Sprite(game.roomSheet,24),128,448));
        game.rooms.push(new room(['left','right','up'],new createjs.Sprite(game.roomSheet,25),192,448));
        game.rooms.push(new room(['left','right','up'],new createjs.Sprite(game.roomSheet,26),256,448));
        
        game.roomX = [192,64,128,192,256,320,384,64,128,192,256,320,384,64,128,192,256,320,384,128,192,256,320,384,128,192,256];
        game.roomY = [128,192,192,192,192,192,192,256,256,256,256,256,256,320,320,320,320,320,320,384,384,384,384,384,448,448,448];
    };

    Array.prototype.move = function(from, to) {
        var removed = []
        for (var i = 0; i < from.length; i++) {
            removed.push(this[from[i]]);
            this[from[i]] = null;
        }
        removed.reverse();
        for (var i = 0; i < to.length; i++) {
            this[to[i]] = removed.pop()
        }
        if (from.indexOf(game.monster.room) !== -1) {
            game.monster.room = to[from.indexOf(game.monster.room)];
        }
        
        for (var i = 0; i < game.villagers.length; i++) {
            if (from.indexOf(game.villagers[i].room) !== -1) {
                game.villagers[i].room = to[from.indexOf(game.villagers[i].room)];
            }
        }
        return this;
    };

    game.changeRooms = function(cycle, direction) {
        if (cycle === 1) {
            if (direction === 1){
                game.rooms.move([1,2,8,14,13],[2,8,14,13,1]);
            } else {
                game.rooms.move([1,2,8,14,13],[13,1,2,8,14]);
            }
        } else if (cycle === 2) {
            if (direction === 1) {
                game.rooms.move([2,3,4,10,9,8],[3,4,10,9,8,2]);
            } else {
                game.rooms.move([2,3,4,10,9,8],[8,2,3,4,10,9]);
            }
        } else if (cycle === 3) {
            if (direction === 1) {
                game.rooms.move([4,5,11,17,10],[5,11,17,10,4]);
            } else {
                game.rooms.move([4,5,11,17,10],[10,4,5,11,17]);
            }
        } else if (cycle === 4) {
            if (direction === 1) {
                game.rooms.move([9,10,11,17,22,21,20,15],[10,11,17,22,21,20,15,9]);
            } else {
                game.rooms.move([9,10,11,17,22,21,20,15],[15,9,10,11,17,22,21,20]);
            }
        } else if (cycle === 5) {
            if (direction === 1) {
                game.rooms.move([14,15,21,26,25,20,19],[15,21,26,25,20,19,14]);
            } else {
                game.rooms.move([14,15,21,26,25,20,19],[19,14,15,21,26,25,20]);
            }
        } else if (cycle === 6) {
            if (direction === 1) {
                game.rooms.move([17,18,22,26,21],[18,22,26,21,17]);
            } else {
                game.rooms.move([17,18,22,26,21],[21,17,18,22,26]);
            }
        }
        
        for (var i = 0; i < 27; i++) {
            game.rooms[i].sprite.x = game.roomX[i];
            game.rooms[i].sprite.y = game.roomY[i];
        }
    };

    game.loadImages = function() {
        game.menu = new createjs.Bitmap('./resources/images/game/menu.png');
        game.menu.x = 0;
        game.menu.y = 0;
        
        game.menu_bolt = new createjs.Bitmap('./resources/images/game/menu_bolt.png');
        game.menu_bolt.x = 0;
        game.menu_bolt.y = 0;
        
        game.background = new createjs.Bitmap('./resources/images/game/background_dark.png');
        game.background.x = 0;
        game.background.y = -26;
        
        game.foreground = new createjs.Bitmap('./resources/images/game/foreground_dark.png');
        game.foreground.x = 0;
        game.foreground.y = -26;
        
        var data = {
            images: ['./resources/images/game/rooms.png'],
            frames: {width:64, height:64}
        };
        game.roomSheet = new createjs.SpriteSheet(data);
        
        data = {
            framerate: 8,
            images: ['./resources/images/game/frankenstein.png'],
            frames: {width: 32, height: 32},
            animations: {
                standLeft: [0],
                standRight: [1],
                walkLeft: [8,11,'standLeft'],
                walkRight: [4,7,'standRight']
            }
        };
        game.frankensteinSheet = new createjs.SpriteSheet(data);
        
        data = {
            framerate: 8,
            images: ['./resources/images/game/monster.png'],
            frames: {width: 32, height: 32},
            animations: {
                standLeft: [0],
                standRight: [1],
                walkLeft: [8,11,'standLeft'],
                walkRight: [4,7,'standRight']
            }
        };
        game.monsterSheet = new createjs.SpriteSheet(data);
        
        data = {
            framerate: 8,
            images: ['./resources/images/game/villager.png'],
            frames: {width: 32, height: 34},
            animations: {
                standLeft: [0],
                standRight: [1],
                walkLeft: [4,7,'standLeft'],
                walkRight: [8,11,'standRight'],
                ladder: [16,21],
                jump: [12,15],
                death: [40,47,'dead'],
                dead: [47]
            }
        };
        game.villagerSheet = new createjs.SpriteSheet(data);
        
        data = {
            images: ['./resources/images/game/health.png'],
            frames: {width: 36, height: 240}
        };
        game.healthSheet = new createjs.SpriteSheet(data);
    };

    var frankenstein = function() {
        this.room = 0;
        this.x = 16;
        this.sprite = new createjs.Sprite(game.frankensteinSheet);
        this.sprite.gotoAndStop(0);
        this.sprite.x = game.roomX[this.room] + this.x;
        this.sprite.y = game.roomY[this.room] + 24;
        this.animation = null;
        this.frames = 0;
        this.vertDelay = 0;
        this.switchDelay = 0;
        this.move = function() {
            if (game.keys.D && !game.keys.A) {
                if (this.x < 29) {
                    this.x += 2;
                    if (this.animation !== 'right' || game.tick - this.frames > 4) {
                        this.sprite.gotoAndPlay('walkRight');
                        this.animation = 'right';
                        this.frames = game.tick;
                    }
                } else if (game.rooms[this.room].paths.indexOf('right') !== -1 && game.rooms[this.room + 1].paths.indexOf('left') !== -1 && [0,6,12,18,23,26].indexOf(this.room) === -1) {
                    this.x = 3;
                    this.room ++;
                    game.calculatePathing();
                }
            }
            if (game.keys.A && !game.keys.D) {
                if (this.x > 3) {
                    this.x -= 2;
                    if (this.animation !== 'left' || game.tick - this.frames > 4) {
                        this.sprite.gotoAndPlay('walkLeft');
                        this.animation = 'left';
                        this.frames = game.tick;
                    }
                } else if (game.rooms[this.room].paths.indexOf('left') !== -1 && game.rooms[this.room - 1].paths.indexOf('right') !== -1 && [0,1,7,13,19,24].indexOf(this.room) === -1) {
                    this.x = 29;
                    this.room --;
                    game.calculatePathing();
                }
            }
            if (game.keys.W && !game.keys.S && game.tick - this.vertDelay > 8 && game.rooms[this.room].paths.indexOf('up') !== -1 && [0,1,2,4,5,6].indexOf(this.room) === -1) {
                if (game.rooms[roomAbove(this.room)].paths.indexOf('down') !== -1) {
                    this.vertDelay = game.tick;
                    this.room = roomAbove(this.room);
                    createjs.Sound.play('step');
                    game.calculatePathing();
                }
            }
            if (game.keys.S && !game.keys.W && game.tick - this.vertDelay > 8 && game.rooms[this.room].paths.indexOf('down') !== -1 && this.room !== 13 && this.room < 22) {
                if (game.rooms[roomBelow(this.room)].paths.indexOf('up') !== -1) {
                    this.vertDelay = game.tick;
                    this.room = roomBelow(this.room);
                    createjs.Sound.play('step');
                    game.calculatePathing();
                }
            }
            if ((game.keys.Q || game.keys.E) && game.tick - this.switchDelay > 8) {
                if (game.keys.Q && !game.keys.E) {
                    direction = -1;
                } else if (game.keys.E && ! game.keys.Q) {
                    direction = 1;
                } else {
                    direction = 0;
                }
                if (direction !== 0) {
                    this.switchDelay = game.tick;
                    game.changeRooms([7,0,6,16,24,23].indexOf(this.room)+1,direction)
                    createjs.Sound.play('switch');
                }
            }

            this.sprite.x = game.roomX[this.room] + this.x;
            this.sprite.y = game.roomY[this.room] + 24;
        };
    };

    function roomBelow(room) {
        if (room > 21 || room === 13) {
            return null;
        } else if (0 < room && room < 13) {
            return room + 6;
        } else if (room === 0) {
            return 3
        } else {
            return room + 5;
        } 
    }

    function roomAbove(room) {
        if (room < 3 || (3 < room && room < 7)) {
            return null;
        } else if (6 < room && room < 19) {
            return room - 6;
        } else if (18 < room) {
            return room - 5;
        } else if (room === 3) {
            return 0;
        }
    }

    var monster = function() {
        this.room = 15;
        this.x = 16;
        this.sprite = new createjs.Sprite(game.monsterSheet);
        this.sprite.gotoAndStop(0);
        this.sprite.x = game.roomX[this.room] + this.x;
        this.sprite.y = game.roomY[this.room] + 28;
        this.animation = null;
        this.frames = 0;
        this.move = function() {
            if (game.keys.right && !game.keys.left) {
                if (this.x < 29) {
                    this.x ++;
                    if (this.animation !== 'right' || game.tick - this.frames > 4) {
                        this.sprite.gotoAndPlay('walkRight');
                        this.animation = 'right';
                        this.frames = game.tick;
                    }
                } else if (game.rooms[this.room].paths.indexOf('right') !== -1 && game.rooms[this.room + 1].paths.indexOf('left') !== -1 && [0,6,12,18,23,26].indexOf(this.room) === -1) {
                    this.x = 3;
                    this.room ++;
                    game.calculatePathing();
                }
            }
            if (game.keys.left && !game.keys.right) {
                if (this.x > 3) {
                    this.x --;
                    if (this.animation !== 'left' || game.tick - this.frames > 4) {
                        this.sprite.gotoAndPlay('walkLeft');
                        this.animation = 'left';
                        this.frames = game.tick;
                    }
                } else if (game.rooms[this.room].paths.indexOf('left') !== -1 && game.rooms[this.room - 1].paths.indexOf('right') !== -1 && [0,1,7,13,19,24].indexOf(this.room) === -1) {
                    this.x = 29;
                    this.room --;
                    game.calculatePathing();
                }
            }

            this.sprite.x = game.roomX[this.room] + this.x;
            this.sprite.y = game.roomY[this.room] + 28;
        };

    };

    var villager = function() {
        this.room = -1;
        this.x = 29;
        this.sprite = new createjs.Sprite(game.villagerSheet);
        this.sprite.gotoAndStop(0);
        this.sprite.x = 800;
        this.sprite.y = 600;
        this.animation = null;
        this.frames = 0;
        this.soundDelay = 0;
        this.vertDelay = 0;
        this.ladder = (Math.random() > 0.65);
        
        this.move = function() {
            if (this.room === -1) {
                if (this.ladder){
                    if (this.sprite.x > 500) {
                        this.sprite.x -= 75/50;
                        this.sprite.y -= 57/50;
                        if (game.tick - this.frames > 4) {
                            this.frames = game.tick;
                            this.sprite.gotoAndPlay('walkLeft');
                        }
                    } else if (this.sprite.x >= 470){
                        this.sprite.x -= 36/40
                        this.sprite.y -= 15/5
                        if (game.tick - this.frames > 6) {
                            this.frames = game.tick;
                            this.sprite.gotoAndPlay('ladder');
                        }
                    } else {
                        this.room = 12;
                        this.sprite.x = 348;
                        this.sprite.y = 285;
                        this.sprite.gotoAndStop('standLeft');
                    }
                } else {
                    if (this.sprite.x > 470) {
                        this.sprite.x -= 165/60;
                        this.sprite.y -= 119/60;
                        if (game.tick - this.frames > 4) {
                            this.frames = game.tick;
                            this.sprite.gotoAndPlay('walkLeft');
                        }
                    } else {
                        this.room = 18;
                        this.sprite.x = 413;
                        this.sprite.y = 345;
                    }
                }
            } else {
                var target = null;
                var targetValue = game.paths[this.room];
                var above = roomAbove(this.room);
                var below = roomBelow(this.room);
                if (this.room !== 26){
                    if (game.paths[this.room + 1] < targetValue && [0,6,12,18,23,26].indexOf(this.room) === -1 && game.rooms[this.room].paths.indexOf('right') !== -1 && game.rooms[this.room + 1].paths.indexOf('left') !== -1) {
                        target = 'right';
                        targetValue = game.paths[this.room + 1];
                    }
                }
                if (this.room !== 0){
                    if (game.paths[this.room - 1] < targetValue && [0,1,7,13,19,24].indexOf(this.room) === -1 && game.rooms[this.room].paths.indexOf('left') !== -1 && game.rooms[this.room - 1].paths.indexOf('right') !== -1) {
                        target = 'left';
                        targetValue = game.paths[this.room - 1];
                    }
                }
                if (above || above === 0) {
                    if (game.paths[above] < targetValue && game.rooms[this.room].paths.indexOf('up') !== -1 && game.rooms[above].paths.indexOf('down') !== -1) {
                        target = 'up';
                        targetValue = game.paths[above];
                    }
                }
                if (below) {
                    if (game.paths[below] < targetValue && game.rooms[this.room].paths.indexOf('down') !== -1 && game.rooms[below].paths.indexOf('up') !== -1) {
                        target = 'down';
                        targetValue = game.paths[below];
                    }
                }
                if (target === null) {
                    if (this.animation !== 'jump' || game.tick - this.frames > 4) {
                        this.sprite.gotoAndPlay('jump');
                        this.animation = 'jump';
                        this.frames = game.tick;
                        game.health -= 0.1;
                        game.healthBar.gotoAndStop(8 - Math.ceil(game.health/50*8));
                    }
                    if (this.animation !== 'jump' || game.tick - this.soundDelay > 8) {
                        createjs.Sound.play('damage');
                        this.soundDelay = game.tick;
                    }
                }
                
                if (target === 'right') {
                    if (this.x < 29) {
                        this.x ++;
                        if (this.animation !== 'right' || game.tick - this.frames > 4) {
                            this.animation = 'right';
                            this.frames = game.tick;
                            this.sprite.gotoAndPlay('walkRight');
                        }
                    } else {
                        this.x = 3;
                        this.room ++;
                    }
                } else if (target === 'left') {
                    if (this.x > 3) {
                        this.x --;
                        if (this.animation !== 'left' || game.tick - this.frames > 4) {
                            this.animation = 'left';
                            this.frames = game.tick;
                            this.sprite.gotoAndPlay('walkLeft');
                        }
                    } else {
                        this.x = 29;
                        this.room --;
                    }
                } else if (target === 'up') {
                    if (game.tick - this.vertDelay > 24) {
                        this.room = above;
                        this.vertDelay = game.tick;
                        createjs.Sound.play('step');
                    }
                } else if (target === 'down') {
                    if (game.tick - this.vertDelay > 24) {
                        this.room = below;
                        this.vertDelay = game.tick;
                        createjs.Sound.play('step');
                    }
                } else {
                    if (this.x < 29 && game.monster.x < this.x) {
                        this.x ++;
                    } else if (this.x > 3 && game.monster.x > this.x) {
                        this.x --;
                    }
                }
                
                
                this.sprite.x = game.roomX[this.room] + this.x;
                this.sprite.y = game.roomY[this.room] + 25;
            }
        }
    }

    game.calculatePathing = function() {
        game.tunnels = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
        for (var i = 0; i < 27; i++) {
            if (game.monster.room !== i) {
                if (i < 26){
                    if (game.rooms[i].paths.indexOf('right') !== -1 && game.rooms[i+1].paths.indexOf('left') !== -1 && [0,6,12,18,23,26].indexOf(i) === -1 && game.monster.room !== i+1) {
                        game.tunnels[i].push(i+1);
                    }
                }
                if (i > 1) {
                    if (game.rooms[i].paths.indexOf('left') !== -1 && game.rooms[i - 1].paths.indexOf('right') !== -1 && [0,1,7,13,19,24].indexOf(i) === -1 && game.monster.room !== i-1) {
                        game.tunnels[i].push(i-1);
                    }
                }
                var above = roomAbove(i);
                if (game.rooms[i].paths.indexOf('up') !== -1 && [0,1,2,4,5,6].indexOf(i) === -1) {
                    if (game.rooms[above].paths.indexOf('down') !== -1 && game.monster.room !== above) {
                        game.tunnels[i].push(above);
                    }
                }
                var below = roomBelow(i);
                if (game.rooms[i].paths.indexOf('down') !== -1 && i !== 13 && i < 22) {
                    if (game.rooms[below].paths.indexOf('up') !== -1 && game.monster.room !== below) {
                        game.tunnels[i].push(below);
                    }
                }
            }
        }
        
        var queue = [game.frankenstein.room];
        var distances = [99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99];
        distances[game.frankenstein.room] = 0;
        while (queue.length > 0) {
            var point = queue.shift();
            for (var i = 0; i < game.tunnels[point].length; i++) {
                if (distances[game.tunnels[point][i]] > distances[point] + 1) {
                    distances[game.tunnels[point][i]] = distances[point] + 1;
                    queue.push(game.tunnels[point][i]);
                }
            }
        }
        game.paths = distances;
    };

    game.killVillagers = function() {
        for (var i = game.villagers.length - 1; i > -1; i--) {
            if (game.villagers[i].room === game.monster.room && Math.abs(game.villagers[i].x - game.monster.x) < 16) {
                game.stage.removeChild(game.villagers[i].sprite);
                var death = new createjs.Sprite(game.villagerSheet)
                game.deaths.push(death);
                game.stage.addChildAt(game.deaths[game.deaths.length - 1],game.stage.children.length - 4)
                death.x = game.villagers[i].sprite.x;
                death.y = game.villagers[i].sprite.y;
                death.gotoAndPlay('death');
                setTimeout(function(death) {
                    game.stage.removeChild(game.deaths.shift());
                }, 2000);
                game.villagers.splice(i,1);
            }
        }
    };

    game.checkLoss = function() {
        for (var i = 0; i < game.villagers.length; i++) {
            if ((game.villagers[i].room === game.frankenstein.room && Math.abs(game.villagers[i].room - game.frankenstein.room) < 16) || game.health < 0) {
                game.menuState = 'lose';
                game.over = new createjs.Bitmap('./resources/images/game/game_over.png');
                game.over.x = 0;
                game.over.y = 0;
                createjs.Sound.play('thunder');
                scoreText = 'Score: ' + game.tick.toString();
                game.score = new createjs.Text(scoreText, '20px slkscr', '#ffffff');
                game.score.x = 375 - game.score.getBounds().width/2;
                game.score.y = 400;
                game.stage.children = [game.over,game.score];
            }
        }
    };

    game.spawnVillagers = function() {
        if (game.tick%100 === 0) {
            var num = Math.ceil(Math.random()*game.difficulty)
            for (var i = 0; i < num; i++) {
                game.villagers.push(new villager());
                game.stage.addChildAt(game.villagers[game.villagers.length - 1].sprite, game.stage.children.length - 4);
            }
        }
    }

    game.keys = {
        'right': false,
        'left': false,
        'W': false,
        'A': false,
        'S': false,
        'D': false,
        'Q': false,
        'E': false
    };

    handlekey = function(event) {
        if (event.keyIdentifier === 'Right') {
            game.keys.right = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'Left') {
            game.keys.left = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'U+0057') {
            game.keys.W = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'U+0041') {
            game.keys.A = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'U+0053') {
            game.keys.S = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'U+0044') {
            game.keys.D = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'U+0051') {
            game.keys.Q = (event.type === 'keydown');
        } else if (event.keyIdentifier === 'U+0045') {
            game.keys.E = (event.type == 'keydown');
        } else if (event.keyIdentifier === 'U+0020') {
            if (game.menuState !== 'lose') {
                game.start();
            } else {
                buildGame();
            }
        } else if (event.keyIdentifier === 'Enter') {
            if (event.type === 'keydown') {
                game.help();
            } else {
                game.main();
            }
        }
    };

    var loadSounds = function() {
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.FlashPlugin]);
        createjs.Sound.registerSound('./resources/sounds/damage.wav', 'damage');
        createjs.Sound.registerSound('./resources/sounds/switch.wav', 'switch');
        createjs.Sound.registerSound('./resources/sounds/step.wav', 'step');
        createjs.Sound.registerSound('./resources/sounds/thunder.wav', 'thunder');
        createjs.Sound.addEventListener("fileload", handleLoad);
        function handleLoad(event) {
            createjs.Sound.play('rain', {loop:-1});
        }
        createjs.Sound.registerSound('./resources/sounds/rain.ogg', 'rain');
    }



    loadSounds();
    game.loadImages();
    game.createMap();
    game.run();
}

buildGame();

window.onkeydown = function(event){handlekey(event);};
window.onkeyup = function(event){handlekey(event);};