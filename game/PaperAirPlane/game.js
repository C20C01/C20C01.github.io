const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");

const sprite = new Image();
sprite.src = "sprite.png";

let player_X = window.innerWidth / 10;
let top_Y = 0;
let floor_Y = window.innerHeight / 10 * 9;

const getRotation = Math.PI * 0.4;

let score = 0;

let dx = 0.5;

const state = {
    current: 0, getReady: 0, game: 1, over: 2
}

const debounce = (fn, delay) => {
    let timer;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn();
        }, delay);
    }
};

const keyDown = (e) => {
    if (e.repeat) {
        return;
    }

    if (e.keyCode === 32) {
        switch (state.current) {
            case state.game:
                player.isUp = true;
                break;
            case state.over:
                resetAll();
                state.current = state.game;
                break;
            case state.getReady:
                state.current = state.game;
                break;
        }


        if (state.current === state.game) {
            player.isUp = true;
        }
    }
};

const keyUp = (e) => {
    if (e.repeat) {
        return;
    }

    if (e.keyCode === 32) {
        if (state.current === state.game) {
            player.isUp = false;
        }
    }
};

function resetAll() {
    cloud.reset();
    coin.reset();
    player.x = player_X;
    player.y = top_Y;
    player.speed = 0;
    player.power = 1;
    floor.y = floor_Y + player.h / 2;
    this.speed = 0;
    score = 0;
    dx = 0.5;
    baseSummonGap = 1000;
}

const player = {
    w: 40, h: 31, x: player_X, y: top_Y, speed: 0, a: 0.0006, degree: 0, power: 1, isUp: false,

    draw: function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.degree);
        ctx.drawImage(sprite, 152, 32, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
        ctx.fillStyle = "rgb(255,250,3)";
        ctx.fillRect(0, 0, 5, cvs.height * this.power);
    },

    update: function (gap) {
        if (state.current === state.over || state.current === state.getReady) {
            return
        }

        this.power = Math.min(1, this.power);
        this.power = Math.max(0, this.power);

        if (this.y < top_Y) {
            this.y = top_Y;
            this.speed = 0;
        } else if (this.y > floor_Y) {
            this.y = floor_Y;
            this.speed = 0;
            state.current = state.over;
            console.log("Game Over! Your Score: " + score);
        } else {
            this.speed += ((this.isUp && this.power > 0) ? -0.0012 : 0.0006) * gap;
            this.y += gap * this.speed;
        }

        if (this.isUp) {
            this.power -= gap * 0.0003;
        } else if (this.speed > 0.5) {
            this.power += gap * 0.002 * (this.speed);
        }

        this.degree = this.speed * getRotation * 0.9;
        dx = Math.abs(this.speed) * 0.2 + 0.5;
    },

    hit: function () {
        this.power -= 0.6;
    }
}

const cloud = {
    position: [], w: 147, h: 100, radiusPow: 2000,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            ctx.drawImage(sprite, 0, 32, this.w, this.h, p.x, p.y, this.w, this.h);
        }
    },

    update: function (gap) {
        if (state.current !== state.game) return;

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            if (p.notCollided) {
                let xx1 = player.x + 20;
                let yy1 = player.y + 15;
                let xx2 = p.x + 73;
                let yy2 = p.y + 50;

                if (Math.pow(xx1 - xx2, 2) + Math.pow(yy1 - yy2, 2) < this.radiusPow && state.current === state.game) {
                    player.hit();
                    p.notCollided = false;
                }
            }

            p.x -= dx * gap;

            if (p.x + this.w <= 0) {
                this.position.shift();
                addScore(1);
            }
        }
    },

    reset: function () {
        this.position = [];
    },

    summon: function () {
        this.position.push({
            x: cvs.width, y: (floor_Y - top_Y - this.h) * Math.random(), notCollided: true
        });
    }
}

const floor = {
    w: 394 * 5, h: 30 * 5, x: 0, y: floor_Y + player.h / 2,

    draw: function () {
        ctx.drawImage(sprite, 0, 0, this.w / 5, this.h / 5, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, 0, 0, this.w / 5, this.h / 5, this.x + this.w, this.y, this.w, this.h);
    },

    update: function (gap) {
        if (state.current === state.game) {
            this.x -= dx * gap;
            if (this.x + this.w <= 0) {
                this.x = 0;
            }
        }
    },
}

const coin = {
    position: [], w: 40, h: 40, radiusPow: 1000,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            ctx.drawImage(sprite, 152, 72, this.w, this.h, p.x, p.y, this.w, this.h);
        }
    },

    update: function (gap) {
        if (state.current !== state.game) return;

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let xx1 = player.x + 20;
            let yy1 = player.y + 15;
            let xx2 = p.x + 20;
            let yy2 = p.y + 20;

            if (Math.pow(xx1 - xx2, 2) + Math.pow(yy1 - yy2, 2) < this.radiusPow && state.current === state.game) {
                this.hit(i);
            }

            p.x -= dx * gap;

            if (p.x + this.w <= 0) {
                this.position.shift();
            }
        }
    },

    reset: function () {
        this.position = [];
    },

    hit: function (i) {
        addScore(5);
        player.power += 0.2;
        this.position.splice(i, 1);
    },

    summon: function () {
        this.position.push({
            x: cvs.width, y: (floor_Y / 4 * 3 - top_Y - this.h) * Math.random()
        });
    }
}

const gameOver = {
    w: 192, h: 96, draw: function () {
        if (state.current === state.over) {
            let ww = (cvs.width - this.w) / 2;
            let hh = (cvs.height - this.h) / 2;

            ctx.drawImage(sprite, 200, 32, this.w, this.h, ww, hh, this.w, this.h);
            ctx.font = "50px Arial";
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillText(score, (cvs.width - ctx.measureText(score).width) / 2, hh + 80);
        }
    }
}

function drawScore() {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "30px Arial";
    ctx.fillText(score, 20, 40);
}

function drawTip() {
    if (state.current === state.getReady) {
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = "30px Arial";
        ctx.fillText("按住空格向上，松开空格向下", 20, cvs.height / 2 + 40);
        ctx.fillText("向上&撞云减少能量，俯冲&收集金币增加能量", 20, cvs.height / 2 + 80);
    }
}

let sumGap = 0;
let baseSummonGap = 1000;

function summonThings(gap) {
    if (state.current !== state.game) return;
    sumGap += gap;

    let summonGap = baseSummonGap * (Math.random() * 2 + 1);

    if (sumGap >= summonGap) {
        sumGap -= summonGap;

        const random = Math.random();

        if (random < 0.7) {
            cloud.summon();
        } else {
            coin.summon();
        }
    }
}

function addScore(i) {
    score += i;
    baseSummonGap = Math.max(400, 1000 - score * 3);
}

function update(gap) {
    if (isNaN(gap)) return;

    floor.update(gap);
    player.update(gap);
    summonThings(gap);
    cloud.update(gap);
    coin.update(gap);
}

function draw() {
    ctx.fillStyle = "#3395ff";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    floor.draw();
    player.draw();
    cloud.draw();
    coin.draw();
    gameOver.draw();
    drawScore();
    drawTip();
}

let lastFrame = 0.0

function loop(timeStamp) {
    if (!tooSmall) {
        // 与上一帧之间的时间间隔，单位为ms，速度单位为px/ms
        let gap = timeStamp - lastFrame
        update(gap);
        draw();
        frames++;
        lastFrame = timeStamp
    }
    requestAnimationFrame(loop);
}

let tooSmall = false;

function resize() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    tooSmall = window.innerHeight < 500 || window.innerWidth < 800;
    if (tooSmall) {
        window.alert("窗口过小，无法运行");
    }

    player_X = window.innerWidth / 10;
    top_Y = player.h / 2;
    floor_Y = window.innerHeight / 10 * 9;
    resetAll();
    state.current = state.getReady;
    console.log("width: " + cvs.width, "height: " + cvs.height);
}

function init() {
    window.addEventListener('resize', debounce(resize, 100));
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    resize();
    console.log("By CC2001(https://github.com/C20C01)")
}

init();
loop();