function RandomRange(min, max) {
    return Math.random() * (max - min) + min;
}

class Game {
    cvs;
    ctx;
    sprite;
    lastFrame = 0;

    entities;
    baseSpeedX;
    speedX;

    entityFactory;
    scoreManager;
    inputManager;
    soundPlayer;

    groundY;
    ground;

    player;

    currentLoop;

    #loop = (ts) => {
        requestAnimationFrame(this.#loop);
        const delta = Math.min(ts - this.lastFrame, 30);
        this.lastFrame = ts;
        this.currentLoop(delta);
    }

    #gameReadyLoop = () => {
        const ctx = this.ctx;

        ctx.fillStyle = "#3395ff";
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

        this.ground.draw(this.sprite);

        ctx.fillStyle = "rgb(255,255,255)";
        ctx.textAlign = "center";
        ctx.font = "128px comic sans ms";
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0)";
        ctx.shadowBlur = 4;
        ctx.fillText("Paper Air Plane", this.cvs.width / 2, this.cvs.height / 2.5);
        ctx.restore();
        ctx.font = "32px comic sans ms";
        ctx.fillText("Press Space to Start", this.cvs.width / 2, this.groundY);

        if (this.inputManager.isUp) {
            this.gameStart();
        }
    }

    #gameLoop = (delta) => {
        const ctx = this.ctx;

        ctx.fillStyle = "#3395ff";
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
        this.entityFactory.update(delta);
        this.ground.update(delta);
        this.ground.draw(this.sprite);
        this.player.update(delta);
        this.player.draw(this.sprite);
        const arr = this.entities;
        for (let i = arr.length - 1; i >= 0; i--) {
            const e = arr[i];
            if (e.update(delta, i)) {
                const last = arr.length - 1;
                if (i !== last) arr[i] = arr[last];
                arr.pop();
            } else {
                e.draw(this.sprite);
            }
        }
        this.scoreManager.update(delta);
        this.scoreManager.draw();

        this.player.drawPowerBar();
    }

    #gameOverLoop = () => {
        const ctx = this.ctx;

        // game things in background
        ctx.fillStyle = "#3395ff";
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
        this.player.y = this.groundY;
        for (const e of this.entities) {
            e.draw(this.sprite);
        }
        this.ground.draw(this.sprite);
        this.player.draw(this.sprite);

        // black overlay
        ctx.fillStyle = "rgba(0,0,0,0.625)";
        ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

        // game over text
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.textAlign = "center";
        ctx.font = "64px comic sans ms";
        ctx.fillText("Game Over", this.cvs.width / 2, this.cvs.height / 2);
        ctx.font = "32px comic sans ms";
        ctx.fillText(`Score: ${this.scoreManager.score.toFixed()}`, this.cvs.width / 2, this.cvs.height / 2 + 40);
        ctx.font = "24px comic sans ms";
        ctx.fillText("Press Space to Restart", this.cvs.width / 2, this.groundY);

        // check for restart
        if (this.inputManager.isUp) {
            this.gameStart();
        }
    }

    constructor(cvsId, spritePath) {
        this.cvs = document.getElementById(cvsId);
        this.ctx = this.cvs.getContext("2d");
        this.sprite = new Image();
        this.sprite.src = spritePath;
        this.soundPlayer = new SoundPlayer();
        this.inputManager = new InputManager(this);
        this.player = new Player(this, 200, 200);
        this.entityFactory = new EntityFactory(this);
        this.scoreManager = new ScoreManager(this);
        this.ground = new Ground(this);
        window.addEventListener("resize", () => this.resize());
        this.resize();
        this.gameReady();
        requestAnimationFrame(this.#loop);
    }

    resize() {
        this.cvs.width = Math.max(window.innerWidth, 400);
        this.cvs.height = Math.max(window.innerHeight, 400);
        this.groundY = this.cvs.height - Ground.height;
        this.ground.y = this.groundY;
    }

    gameReady() {
        this.currentLoop = this.#gameReadyLoop;
    }

    gameStart() {
        this.entities = [];
        this.baseSpeedX = 0.5;
        this.speedX = this.baseSpeedX;
        this.entityFactory.init();
        this.scoreManager.init();
        this.player.init();
        this.currentLoop = this.#gameLoop;
        this.soundPlayer.playStartSound();
    }

    gameOver() {
        this.inputManager.isUp = false; // prevent immediate restart
        this.currentLoop = this.#gameOverLoop;
    }
}

class Entity {
    game;
    x;
    y;
    width;
    height;
    halfWidth;
    halfHeight;
    spriteX;
    spriteY;

    constructor(game, x, y, width, height, spriteX, spriteY) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;
        this.spriteX = spriteX;
        this.spriteY = spriteY;
    }

    draw(sprite) {
        this.game.ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
    }

    // Return true to remove the entity.
    update(delta) {
        return false;
    }
}

class Player extends Entity {
    static gravity;
    static terminalSpeed;
    static acceleration;
    static dragCoefficient;
    static hitGroundPowerLoss;

    startY;
    inputManager;
    speedY;
    rotation;
    power;

    constructor(game, x, y) {
        super(game, x, y, 40, 30, 208, 0);
        this.startY = y;
        this.inputManager = game.inputManager;
        this.init();
    }

    init() {
        this.y = this.startY;
        this.speedY = -0.1;
        this.rotation = 0;
        this.power = 1;
        Player.gravity = 0.0008;
        Player.terminalSpeed = 0.8;
        Player.acceleration = -0.001;
        Player.dragCoefficient = -Player.gravity / Player.terminalSpeed;
        Player.hitGroundPowerLoss = 0.8;
    }

    static changeAcceleration(factor) {
        Player.gravity *= factor;
        Player.terminalSpeed *= factor;
        Player.acceleration *= factor;
    }

    addPower(amount) {
        this.power = Math.min(1, this.power + amount);
    }

    reducePower(amount) {
        this.power = Math.max(0, this.power - amount);
    }

    draw(sprite) {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, -this.halfWidth, -this.halfHeight, this.width, this.height);
        ctx.restore();
    }

    drawPowerBar() {
        const ctx = this.game.ctx;
        ctx.fillStyle = "rgb(255,250,3)";
        ctx.fillRect(0, 0, 5, this.game.cvs.height * this.power);
    }

    update(delta) {
        const upCost = delta * 0.0002;
        const up = this.inputManager.isUp && this.power > upCost;
        if (up) {
            this.power -= upCost;
            const acceleration = Player.acceleration + this.speedY * Player.dragCoefficient;
            this.speedY += acceleration * delta;
        } else {
            const acceleration = Player.gravity + this.speedY * Player.dragCoefficient;
            this.speedY += acceleration * delta;
        }

        const speedY = this.speedY;
        this.y += speedY * delta;
        const percent = speedY / Player.terminalSpeed;
        if (speedY > 0) {
            this.addPower(percent * delta * 0.0003);
        }
        this.game.speedX = this.game.baseSpeedX + percent * percent * 0.25;

        if (this.y < this.halfHeight) {
            this.y = this.halfHeight;
            this.speedY *= -0.2;
        }
        if (this.y > this.game.groundY) {
            this.y = this.game.groundY;
            this.game.soundPlayer.playHitGroundSound();
            if (this.power > Player.hitGroundPowerLoss) {
                this.power -= Player.hitGroundPowerLoss;
                this.speedY *= -1;
            } else {
                this.game.gameOver();
            }
        }

        this.rotation = Math.atan(this.speedY / this.game.speedX);
    }
}

class Ground extends Entity {
    static height = 80;

    constructor(game, x = 0, y = 0) {
        super(game, x, y, 256, Ground.height, 0, 112);
    }

    draw(sprite) {
        const ctx = this.game.ctx;
        for (let i = -1; i <= Math.ceil(this.game.cvs.width / this.width); i++) {
            ctx.drawImage(sprite, this.spriteX, this.spriteY, this.width, this.height, this.x + i * this.width, this.y, this.width, this.height);
        }
    }

    update(delta) {
        this.x -= this.game.speedX * delta;
        if (this.x < -this.width) {
            this.x += this.width;
        }
    }
}

class CollisionEntity extends Entity {
    player;
    radius;
    radiusSquared;
    speedX = 0;

    constructor(game, x, y, width, height, spriteX, spriteY, radius) {
        super(game, x, y, width, height, spriteX, spriteY);
        this.player = game.player;
        this.radius = radius;
        this.radiusSquared = radius * radius;
    }

    update(delta) {
        this.x -= (this.speedX + this.game.speedX) * delta;
        if (this.x < -this.halfWidth) {
            // out of screen
            return true;
        }

        if (this.isCollected()) {
            // collect with player
            return this.onCollect();
        }

        return false;
    }

    // Treat the player as a point and the entity as a circle for collision detection.
    isCollected() {
        const r = this.radius;
        const dx = this.x - this.player.x;
        if (dx > r || dx < -r) return false;
        const dy = this.y - this.player.y;
        if (dy > r || dy < -r) return false;
        return dx * dx + dy * dy <= this.radiusSquared;
    }

    // Return true to remove the entity.
    onCollect() {
        return true;
    }
}

class EntityFactory {
    static minSpawnInterval;

    game;
    player;
    lastSpawn;
    spawnInterval;
    baseEnemyChance;
    powerFactor;

    constructor(game) {
        this.game = game;
        this.player = game.player;
        this.init();
    }

    init() {
        this.lastSpawn = 0;
        this.spawnInterval = 900;
        this.baseEnemyChance = 0.4;
        this.powerFactor = 0.4;
        EntityFactory.minSpawnInterval = 300;
    }

    update(delta) {
        this.lastSpawn += delta;
        if (this.lastSpawn > this.spawnInterval) {
            this.lastSpawn = 0;
            this.spawn();
        }
    }

    addEnemyChance(amount) {
        this.baseEnemyChance = Math.min(0.9, this.baseEnemyChance + amount);
        this.powerFactor = Math.max(0, this.powerFactor - amount);
    }

    reduceInterval(amount) {
        if (this.spawnInterval > EntityFactory.minSpawnInterval) {
            this.spawnInterval = Math.max(EntityFactory.minSpawnInterval, this.spawnInterval - amount);
        }
    }

    spawn() {
        if (Math.random() > this.baseEnemyChance + this.player.power * this.powerFactor) {
            if (Math.random() > 0.85) {
                EntityFactory.spawnWindBubble(this.game);
            } else {
                EntityFactory.spawnBubble(this.game);
            }
        } else {
            if (Math.random() > 0.8) {
                EntityFactory.spawnGhost(this.game);
            } else {
                EntityFactory.spawnCloud(this.game);
            }
        }
    }

    static spawnEntity(game, EntityClass, minY, maxY) {
        const entity = new EntityClass(game);
        entity.x = game.cvs.width + entity.halfWidth;
        entity.y = Math.random() * (maxY - minY) + minY;
        game.entities.push(entity);
    }

    static spawnBubble(game) {
        EntityFactory.spawnEntity(game, Bubble, Bubble.height, game.groundY - Bubble.height);
    }

    static spawnCloud(game) {
        EntityFactory.spawnEntity(game, Cloud, Cloud.height, game.groundY - Cloud.height * 2);
    }

    static spawnWindBubble(game) {
        EntityFactory.spawnEntity(game, WindBubble, game.groundY / 2, game.groundY - WindBubble.height * 2);
    }

    static spawnGhost(game) {
        EntityFactory.spawnEntity(game, Ghost, Ghost.height, game.groundY - Ghost.height * 3);
    }
}

class Bubble extends CollisionEntity {
    static powerAmount = 0.2;
    static width = 32;
    static height = 32;

    constructor(game, x = 0, y = 0) {
        super(game, x, y, Bubble.width, Bubble.height, 160, 0, 40);
    }

    onCollect() {
        this.player.addPower(Bubble.powerAmount);
        this.game.scoreManager.score += 5;
        this.game.soundPlayer.playHitBubbleSound();
        return true;
    }
}

class WindBubble extends CollisionEntity {
    static powerAmount = 0.3;
    static width = 32;
    static height = 32;

    constructor(game, x = 0, y = 0) {
        super(game, x, y, WindBubble.width, WindBubble.height, 160, 48, 40);
        this.speedX = RandomRange(0.05, 0.1);
    }

    onCollect() {
        const absSpeedY = Math.abs(this.player.speedY);
        this.player.speedY = Math.max(absSpeedY, Player.terminalSpeed) * -1.5;
        this.player.addPower(WindBubble.powerAmount);
        this.game.scoreManager.score += 10;
        this.game.soundPlayer.playHitWindBubbleSound();
        return true;
    }
}

class Ghost extends CollisionEntity {
    static width = 32;
    static height = 32;
    collected; // has collected with player

    constructor(game, x = 0, y = 0) {
        super(game, x, y, Ghost.width, Ghost.height, 208, 48, 30);
        this.speedX = RandomRange(0.1, 0.3);
    }

    update(delta) {
        return super.update(delta);
    }

    onCollect() {
        if (this.collected) return false;
        this.collected = true;
        this.player.reducePower(0.4);
        this.game.soundPlayer.playHitGhostSound();
        return false;
    }
}

class Cloud extends CollisionEntity {
    static width = 144;
    static height = 96;
    collected; // has collected with player

    constructor(game, x = 0, y = 0) {
        super(game, x, y, Cloud.width, Cloud.height, 0, 0, 60);
        this.speedX = RandomRange(0.005, 0.01);
    }

    onCollect() {
        if (this.collected) return false;
        this.collected = true;
        this.player.reducePower(0.3);
        this.game.soundPlayer.playHitCloudSound();
        return false;
    }
}

class ScoreManager {
    game;
    ctx;
    score;
    lastHundred;

    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.init();
    }

    init() {
        this.score = 0;
        this.lastHundred = 0;
    }

    draw() {
        this.ctx.fillStyle = "rgb(255,255,255)";
        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(this.score.toFixed(), 20, 40);
    }

    update(delta) {
        const speedX = this.game.speedX;
        this.score += speedX / (2 + speedX) * delta * 0.01;

        const hundreds = Math.floor(this.score / 100);
        while (hundreds > this.lastHundred) {
            this.lastHundred++;
            this.game.baseSpeedX = Math.min(3, this.game.baseSpeedX + 0.005);
            const entityFactory = this.game.entityFactory;
            entityFactory.addEnemyChance(0.006);
            entityFactory.reduceInterval(40);
            Player.changeAcceleration(1.01);
        }
    }
}

class InputManager {
    isUp = false;
    game;

    constructor(game) {
        this.game = game;
        window.addEventListener("keydown", (e) => {
            if (!e.repeat && e.key === " ") {
                this.isUp = true;
            }
        });
        window.addEventListener("keyup", (e) => {
            if (!e.repeat && e.key === " ") {
                this.isUp = false;
            }
        });
        window.addEventListener("touchstart", () => {
            this.isUp = true;
        });
        window.addEventListener("touchend", (e) => {
            if (e.touches.length === 0) {
                this.isUp = false;
            }
        });
    }
}

class SoundPlayer {
    ctx;
    masterGain;

    constructor(masterVolume = 1) {
        // noinspection JSUnresolvedReference
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
    }

    playTone(freq = 500, duration = 0.2, type = 'sine', volume = 1, glideTo = null) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.005);
        gain.gain.linearRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        if (glideTo) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), now + duration);
        }
        osc.stop(now + duration);
        osc.onended = gain.disconnect;
    }

    playStartSound() {
        this.playTone(100, 0.5, "sine", 0.5, 1000);
    }

    playHitGroundSound() {
        this.playTone(300, 0.3, "square", 0.3, 200);
    }

    playHitGhostSound() {
        this.playTone(1400, 0.1, "square", 0.3, 800);
    }

    playHitCloudSound() {
        this.playTone(800, 0.1, "square", 0.3, 200);
    }

    playHitWindBubbleSound() {
        this.playTone(800, 0.2, "sawtooth", 0.2, 1200);
    }

    playHitBubbleSound() {
        this.playTone(400, 0.1, "sine", 0.2, 800);
    }
}

new Game("game", "sprite.png");