// Flappy Bird - Pixel Edition (Core Loop, Bird, Controls)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
// const GRAVITY = 0.5; // Now set per difficulty
const FLAP = -6;
const BIRD_X = 60;
const GROUND_HEIGHT = 112;
const BIRD_SIZE = 24;
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Pipe constants
const PIPE_WIDTH = 52;
const PIPE_GAP_BASE = 100;
const PIPE_MIN = 40;
const PIPE_MAX = GAME_HEIGHT - GROUND_HEIGHT - 40;
const PIPE_INTERVAL = 90; // frames between pipes
const PIPE_SPEED_BASE = 2;

// Game state
let birdY = GAME_HEIGHT / 2;
let birdVY = 0;
let gameStarted = false;
let gameOver = false;

let pipes = [];
let frame = 0;
let score = 0;
let highScore = 0;

// Difficulty settings
let difficulty = 'normal';
const DIFFICULTY_SETTINGS = {
  easy:   { gap: 120, speed: 1.5, gravity: 0.4 },
  normal: { gap: 100, speed: 2.0, gravity: 0.5 },
  hard:   { gap: 80,  speed: 2.7, gravity: 0.65 }
};

function resetGame() {
  birdY = GAME_HEIGHT / 2;
  birdVY = 0;
  gameStarted = false;
  gameOver = false;
  pipes = [];
  frame = 0;
  score = 0;
}

function flap() {
  if (!gameStarted) gameStarted = true;
  if (!gameOver) birdVY = FLAP;
  if (gameOver) resetGame();
}

// Input
window.addEventListener('keydown', e => {
  if (e.code === 'Space') flap();
});
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', e => { e.preventDefault(); flap(); });

// Difficulty button listeners
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('easy-btn').onclick = () => { difficulty = 'easy'; resetGame(); };
  document.getElementById('normal-btn').onclick = () => { difficulty = 'normal'; resetGame(); };
  document.getElementById('hard-btn').onclick = () => { difficulty = 'hard'; resetGame(); };
});

function getPipeGap() {
  // Gap narrows as score increases, but base is set by difficulty
  const base = DIFFICULTY_SETTINGS[difficulty].gap;
  return Math.max(60, base - Math.floor(score / 5) * 10);
}

function getPipeSpeed() {
  // Speed increases as score increases, but base is set by difficulty
  const base = DIFFICULTY_SETTINGS[difficulty].speed;
  return base + Math.floor(score / 10) * 0.5;
}

function addPipe() {
  const gap = getPipeGap();
  const top = Math.floor(Math.random() * (PIPE_MAX - PIPE_MIN - gap)) + PIPE_MIN;
  pipes.push({
    x: GAME_WIDTH,
    top: top,
    bottom: top + gap
  });
}

function update() {
  if (gameStarted && !gameOver) {
    birdVY += DIFFICULTY_SETTINGS[difficulty].gravity;
    birdY += birdVY;
    if (birdY + BIRD_SIZE / 2 >= GAME_HEIGHT - GROUND_HEIGHT) {
      birdY = GAME_HEIGHT - GROUND_HEIGHT - BIRD_SIZE / 2;
      gameOver = true;
      if (score > highScore) highScore = score;
    }
    if (birdY - BIRD_SIZE / 2 < 0) {
      birdY = BIRD_SIZE / 2;
      birdVY = 0;
    }
    // Pipes
    frame++;
    if (frame % PIPE_INTERVAL === 0) {
      addPipe();
    }
    let pipeSpeed = getPipeSpeed();
    for (let i = 0; i < pipes.length; i++) {
      pipes[i].x -= pipeSpeed;
    }
    // Remove off-screen pipes
    if (pipes.length && pipes[0].x < -PIPE_WIDTH) {
      pipes.shift();
    }
    // Collision and scoring
    for (let i = 0; i < pipes.length; i++) {
      let p = pipes[i];
      // Pipe collision
      if (
        BIRD_X + BIRD_SIZE/2 > p.x &&
        BIRD_X - BIRD_SIZE/2 < p.x + PIPE_WIDTH
      ) {
        if (
          birdY - BIRD_SIZE/2 < p.top ||
          birdY + BIRD_SIZE/2 > p.bottom
        ) {
          gameOver = true;
          if (score > highScore) highScore = score;
        }
      }
      // Score (only once per pipe)
      if (!p.passed && p.x + PIPE_WIDTH < BIRD_X - BIRD_SIZE/2) {
        p.passed = true;
        score++;
      }
    }
  }
}

// Asset loading
const IMAGES = {};
let assetsLoaded = 0;
const ASSET_LIST = [
  {name: 'background', src: 'assets/background-day.png'},
  {name: 'ground', src: 'assets/ground.png'},
  {name: 'bird', src: 'assets/bird.png'},
  {name: 'pipe', src: 'assets/pipe-green.png'},
  // Removed font.png
];
ASSET_LIST.forEach(asset => {
  const img = new Image();
  img.src = asset.src;
  img.onload = () => { assetsLoaded++; };
  IMAGES[asset.name] = img;
});

// Bird animation
// const BIRD_FRAME_W = 34, BIRD_FRAME_H = 24, BIRD_FRAMES = 3;
// let birdFrame = 0, birdAnimTick = 0;

function drawBackground() {
  // Loop background
  const bg = IMAGES.background;
  if (bg.complete) {
    for (let x = 0; x < GAME_WIDTH; x += bg.width) {
      ctx.drawImage(bg, x, 0);
    }
  } else {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}

function drawGround() {
  const ground = IMAGES.ground;
  if (ground.complete) {
    for (let x = 0; x < GAME_WIDTH; x += ground.width) {
      ctx.drawImage(ground, x, GAME_HEIGHT - GROUND_HEIGHT);
    }
  } else {
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);
    ctx.fillStyle = '#bada55';
    ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, 16);
  }
}

function drawBird() {
  const bird = IMAGES.bird;
  ctx.save();
  ctx.translate(BIRD_X, birdY);
  ctx.rotate(Math.min(birdVY / 10, 0.5));
  if (bird.complete) {
    ctx.drawImage(
      bird,
      -BIRD_SIZE/2, -BIRD_SIZE/2, BIRD_SIZE, BIRD_SIZE
    );
  } else {
    ctx.fillStyle = '#ff0';
    ctx.fillRect(-BIRD_SIZE/2, -BIRD_SIZE/2, BIRD_SIZE, BIRD_SIZE);
    ctx.fillStyle = '#222';
    ctx.fillRect(4, -6, 4, 4);
    ctx.fillStyle = '#f80';
    ctx.fillRect(BIRD_SIZE/2-2, -2, 6, 4);
  }
  ctx.restore();
}

function drawPipes() {
  const pipe = IMAGES.pipe;
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    if (pipe.complete) {
      // Top pipe (flipped)
      ctx.save();
      ctx.translate(p.x + PIPE_WIDTH/2, p.top);
      ctx.scale(1, -1);
      ctx.drawImage(pipe, -PIPE_WIDTH/2, 0, PIPE_WIDTH, PIPE_MAX);
      ctx.restore();
      // Bottom pipe
      ctx.drawImage(pipe, p.x, p.bottom, PIPE_WIDTH, PIPE_MAX);
    } else {
      ctx.fillStyle = '#5fdc4d';
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
      ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, GAME_HEIGHT - GROUND_HEIGHT - p.bottom);
      ctx.strokeStyle = '#387c2b';
      ctx.lineWidth = 4;
      ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);
      ctx.strokeRect(p.x, p.bottom, PIPE_WIDTH, GAME_HEIGHT - GROUND_HEIGHT - p.bottom);
    }
  }
}

function drawScore() {
  ctx.font = '32px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(score, GAME_WIDTH/2, 80);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#ff0';
  ctx.fillText('HI ' + highScore, GAME_WIDTH/2, 110);
}

function drawUI() {
  ctx.font = '20px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('Difficulty: ' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1), GAME_WIDTH/2, 30);
  if (!gameStarted) {
    ctx.fillText('FLAPPY BIRD', GAME_WIDTH/2, GAME_HEIGHT/2 - 40);
    ctx.fillText('Press SPACE or TAP', GAME_WIDTH/2, GAME_HEIGHT/2);
  }
  if (gameOver) {
    ctx.fillText('GAME OVER', GAME_WIDTH/2, GAME_HEIGHT/2 - 40);
    ctx.fillText('Press SPACE or TAP', GAME_WIDTH/2, GAME_HEIGHT/2);
  }
}

function gameLoop() {
  if (assetsLoaded < ASSET_LIST.length) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.font = '20px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Loading...', GAME_WIDTH/2, GAME_HEIGHT/2);
    requestAnimationFrame(gameLoop);
    return;
  }
  update();
  drawBackground();
  drawPipes();
  drawGround();
  drawBird();
  drawScore();
  drawUI();
  requestAnimationFrame(gameLoop);
}

gameLoop(); 