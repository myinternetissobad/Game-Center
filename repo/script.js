const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const TAU = Math.PI * 2;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;

const gameTitleEl = document.getElementById("game-title");
const gameSummaryEl = document.getElementById("game-summary");
const gameStatusEl = document.getElementById("game-status");
const controlsCopyEl = document.getElementById("controls-copy");
const specialPanelEl = document.getElementById("special-panel");
const playSectionEl = document.getElementById("play");
const towerShopPanelEl = document.getElementById("tower-shop-panel");
const secondaryActionButton = document.getElementById("secondary-action");
const restartButton = document.getElementById("restart-button");
const overlay = document.getElementById("game-overlay");
const overlayKicker = document.getElementById("overlay-kicker");
const overlayTitle = document.getElementById("overlay-title");
const overlayCopy = document.getElementById("overlay-copy");
const overlayRestart = document.getElementById("overlay-restart");
const statLabelEls = [
  document.getElementById("stat-label-1"),
  document.getElementById("stat-label-2"),
  document.getElementById("stat-label-3"),
];
const statValueEls = [
  document.getElementById("stat-value-1"),
  document.getElementById("stat-value-2"),
  document.getElementById("stat-value-3"),
];

const GAME_DEFS = {
  platformer: {
    title: "Sky Hop Islands",
    summary: "Leap from island to island, collect glowing shells, and reach the coral gate.",
    status: "Use A/D or the arrow keys to move. Space jumps.",
    controls: [
      "Move with A/D or the arrow keys.",
      "Tap Space or W to jump and keep your momentum.",
      "Reach the coral gate at the far right to win.",
    ],
    statLabels: ["Gems", "Lives", "Checkpoint"],
    special:
      "Land near the center of each island to keep your grip. If you fall, the checkpoint system pulls you back to the last island you touched.",
    cursor: "default",
    secondaryActionLabel: null,
  },
  tower: {
    title: "Coral Bastion",
    summary: "Build from a colorful right-side shop rail and stop the creeps before they break through.",
    status: "Place towers from the shop and hold back endless waves.",
    controls: [
      "Click a tower in the right-side shop to select it.",
      "Click anywhere on the battlefield to build on that spot.",
      "Use the Next Wave button to speed up the next push.",
    ],
    statLabels: ["Money", "Lives", "Wave"],
    special:
      "Buy towers from the right-side shop, then click anywhere on the battlefield to place them. The higher-cost towers hit harder, shoot farther, or control crowds better, and the waves keep coming forever.",
    cursor: "crosshair",
    secondaryActionLabel: "Next wave",
  },
  zombie: {
    title: "Moonlight Outbreak",
    summary: "Move through a neon night, aim with the mouse, and survive the swarm until dawn.",
    status: "WASD or arrows move. Hold click or Space to fire.",
    controls: [
      "Move with WASD or the arrow keys.",
      "Aim with the mouse and hold click or Space to fire.",
      "Collect medkits and keep moving to avoid being cornered.",
    ],
    statLabels: ["Score", "Health", "Time"],
    special:
      "Circle strafe when the swarm closes in. Holding distance matters more than standing your ground.",
    cursor: "crosshair",
    secondaryActionLabel: null,
  },
};

const TOWER_TYPES = {
  sunburst: {
    label: "Sunburst",
    short: "Cheap, fast shots",
    cost: 45,
    range: 165,
    damage: 12,
    cooldown: 0.42,
    projectileSpeed: 540,
    color: "#ffd86a",
    accent: "#ff9e5f",
    body: "#f0b93f",
    glow: "#fff0a4",
    shape: "sun",
    splash: 0,
  },
  prism: {
    label: "Prism",
    short: "Balanced beam bolts",
    cost: 70,
    range: 215,
    damage: 24,
    cooldown: 0.78,
    projectileSpeed: 620,
    color: "#66e5ff",
    accent: "#9988ff",
    body: "#3c90ff",
    glow: "#b2f2ff",
    shape: "prism",
    splash: 0,
  },
  ember: {
    label: "Ember",
    short: "Slow, heavy bursts",
    cost: 100,
    range: 255,
    damage: 40,
    cooldown: 1.28,
    projectileSpeed: 680,
    color: "#ff9b5f",
    accent: "#ffd36c",
    body: "#d85c44",
    glow: "#ffe39d",
    shape: "ember",
    splash: 38,
  },
  frost: {
    label: "Frost",
    short: "Slows creeps down",
    cost: 180,
    range: 235,
    damage: 10,
    cooldown: 0.66,
    projectileSpeed: 560,
    color: "#8fe8ff",
    accent: "#6f7dff",
    body: "#52b8ff",
    glow: "#d5fbff",
    shape: "prism",
    slowFactor: 0.6,
    slowDuration: 1.5,
    splash: 0,
  },
  volt: {
    label: "Volt",
    short: "Twin zap bursts",
    cost: 240,
    range: 280,
    damage: 11,
    cooldown: 0.36,
    projectileSpeed: 760,
    color: "#9ffcff",
    accent: "#fffb9d",
    body: "#54d8ff",
    glow: "#f0ffff",
    shape: "sun",
    shots: 2,
    spread: 0.08,
    splash: 0,
  },
  bloom: {
    label: "Bloom",
    short: "Wide crowd control",
    cost: 320,
    range: 295,
    damage: 14,
    cooldown: 0.9,
    projectileSpeed: 600,
    color: "#9cf0b7",
    accent: "#ff8fc0",
    body: "#62c97f",
    glow: "#f5ffc6",
    shape: "sun",
    shots: 3,
    spread: 0.12,
    splash: 18,
  },
  comet: {
    label: "Comet",
    short: "Heavy splash shots",
    cost: 450,
    range: 330,
    damage: 44,
    cooldown: 1.1,
    projectileSpeed: 720,
    color: "#fff1a8",
    accent: "#ffb96d",
    body: "#f08d4f",
    glow: "#fff8cf",
    shape: "ember",
    splash: 46,
  },
  shatter: {
    label: "Shatter",
    short: "Rapid crystal shards",
    cost: 600,
    range: 340,
    damage: 12,
    cooldown: 0.56,
    projectileSpeed: 760,
    color: "#c9c2ff",
    accent: "#7ff6ff",
    body: "#7f86ff",
    glow: "#eef1ff",
    shape: "prism",
    shots: 4,
    spread: 0.09,
    splash: 0,
  },
  nova: {
    label: "Nova",
    short: "Long-range blast",
    cost: 800,
    range: 390,
    damage: 68,
    cooldown: 1.45,
    projectileSpeed: 820,
    color: "#ffcc8d",
    accent: "#9bf0ff",
    body: "#ff9b5f",
    glow: "#fff0a4",
    shape: "ember",
    splash: 58,
  },
  atlas: {
    label: "Atlas",
    short: "Ultimate fortress cannon",
    cost: 1000,
    range: 440,
    damage: 96,
    cooldown: 1.86,
    projectileSpeed: 860,
    color: "#8fe8ff",
    accent: "#ffd36c",
    body: "#4c8eff",
    glow: "#f0ffff",
    shape: "ember",
    shots: 2,
    spread: 0.05,
    splash: 72,
  },
};

const input = {
  keys: new Set(),
  justPressed: new Set(),
  justReleased: new Set(),
  pointer: {
    x: 0,
    y: 0,
    inside: false,
    down: false,
    pressed: false,
    released: false,
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

function normalizeVector(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length, length };
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = String(safe % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function formatMoney(value) {
  return `$${Math.max(0, Math.floor(value))}`;
}

function normalizeKey(key) {
  if (key === " " || key === "Spacebar") {
    return "Space";
  }
  return key.length === 1 ? key.toLowerCase() : key;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawStar(ctx, x, y, outerRadius, innerRadius, points, fillStyle) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawCloud(ctx, x, y, scale, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const blobs = [
    [-34, 4, 30],
    [-8, -14, 40],
    [22, -3, 28],
    [50, 6, 24],
  ];
  for (const [bx, by, radius] of blobs) {
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, TAU);
    ctx.fill();
  }
  ctx.fillRect(-42, 10, 100, 20);
  ctx.restore();
}

function drawPalm(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#8b5b34";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -46, 10, -84);
  ctx.stroke();
  ctx.strokeStyle = "#5ce091";
  ctx.lineWidth = 8;
  const leaves = [
    [-16, -76, -54, -98],
    [0, -84, 0, -126],
    [14, -76, 56, -92],
    [4, -64, 44, -60],
    [-6, -74, -44, -62],
  ];
  for (const [x1, y1, x2, y2] of leaves) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - 10, x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(ctx, particles) {
  for (const particle of particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    if (particle.shape === "star") {
      drawStar(ctx, particle.x, particle.y, particle.radius, particle.radius * 0.5, 5, particle.color);
    } else {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= Math.pow(0.2, dt);
    particle.vy *= Math.pow(0.2, dt);
    if (particle.gravity) {
      particle.vy += particle.gravity * dt;
    }
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function spawnBurst(particles, x, y, colors, count, speedMin, speedMax, lifeMin, lifeMax, radiusMin, radiusMax, shape = "dot") {
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, TAU);
    const speed = rand(speedMin, speedMax);
    const life = rand(lifeMin, lifeMax);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0,
      life,
      maxLife: life,
      radius: rand(radiusMin, radiusMax),
      color: colors[randInt(0, colors.length - 1)],
      shape,
    });
  }
}

function buildPath(points) {
  const segments = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    const length = distance(from.x, from.y, to.x, to.y);
    segments.push({ from, to, length });
    totalLength += length;
  }
  return { points, segments, totalLength };
}

function samplePath(path, progress) {
  if (!path.segments.length) {
    const fallback = path.points[0] || { x: 0, y: 0 };
    return { x: fallback.x, y: fallback.y, angle: 0 };
  }

  let remaining = clamp(progress, 0, path.totalLength);
  for (const segment of path.segments) {
    if (remaining <= segment.length) {
      const t = segment.length <= 0 ? 0 : remaining / segment.length;
      return {
        x: lerp(segment.from.x, segment.to.x, t),
        y: lerp(segment.from.y, segment.to.y, t),
        angle: Math.atan2(segment.to.y - segment.from.y, segment.to.x - segment.from.x),
      };
    }
    remaining -= segment.length;
  }

  const last = path.points[path.points.length - 1];
  const prev = path.points[path.points.length - 2] || last;
  return {
    x: last.x,
    y: last.y,
    angle: Math.atan2(last.y - prev.y, last.x - prev.x),
  };
}

function circleRectCollision(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function makeWaterRipple(x, y, radius, color) {
  return {
    x,
    y,
    vx: rand(-20, 20),
    vy: rand(-18, -6),
    gravity: 0,
    life: 1,
    maxLife: 1,
    radius,
    color,
    shape: "dot",
  };
}

class PlatformerGame {
  constructor() {
    this.meta = GAME_DEFS.platformer;
    this.resize(BASE_WIDTH, BASE_HEIGHT);
    this.reset();
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.scale = Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT);
    this.offsetX = (viewWidth - BASE_WIDTH * this.scale) / 2;
    this.offsetY = (viewHeight - BASE_HEIGHT * this.scale) / 2;
  }

  reset() {
    this.worldWidth = 2820;
    this.cameraX = 0;
    this.gemsCollected = 0;
    this.lives = 3;
    this.checkpointIndex = 0;
    this.finished = false;
    this.finishedReason = null;
    this.time = 0;
    this.banner = this.meta.status;
    this.bannerTimer = 0;
    this.particles = [];
    this.bubbles = [];
    this.clouds = [
      { x: 130, y: 92, scale: 1.12, drift: 18 },
      { x: 470, y: 132, scale: 0.88, drift: 10 },
      { x: 860, y: 78, scale: 1.04, drift: 14 },
      { x: 1210, y: 118, scale: 0.76, drift: 8 },
      { x: 1720, y: 88, scale: 1.24, drift: 16 },
      { x: 2150, y: 132, scale: 0.92, drift: 12 },
    ];
    this.mountains = [
      { x: -40, w: 420, h: 150, color: "#17354f" },
      { x: 300, w: 500, h: 178, color: "#1b4963" },
      { x: 760, w: 470, h: 154, color: "#133247" },
      { x: 1230, w: 620, h: 198, color: "#16395a" },
      { x: 1930, w: 520, h: 164, color: "#13304c" },
    ];
    this.stars = Array.from({ length: 45 }, () => ({
      x: rand(0, this.worldWidth),
      y: rand(32, 180),
      r: rand(1.2, 2.8),
      a: rand(0.35, 0.95),
    }));
    this.platforms = [
      { x: 64, y: 500, w: 260, h: 132, top: "#6fdb95", base: "#305c45", palm: true },
      { x: 360, y: 432, w: 210, h: 118, top: "#61c97f", base: "#27533d", palm: false },
      { x: 620, y: 486, w: 225, h: 124, top: "#79e89f", base: "#2d6146", palm: true },
      { x: 910, y: 360, w: 248, h: 140, top: "#64d07c", base: "#24503b", palm: true },
      { x: 1240, y: 432, w: 232, h: 120, top: "#70d98f", base: "#2a5d45", palm: false },
      { x: 1570, y: 328, w: 274, h: 144, top: "#59c871", base: "#234b39", palm: true },
      { x: 1910, y: 438, w: 232, h: 122, top: "#7ce39d", base: "#2d5d46", palm: false },
      { x: 2250, y: 344, w: 300, h: 146, top: "#65d282", base: "#274f3d", palm: true },
    ];
    this.goal = { x: 2468, y: 272, w: 72, h: 132 };
    this.gems = [
      { x: 158, y: 440, r: 12, collected: false, color: "#ffe07a" },
      { x: 468, y: 366, r: 12, collected: false, color: "#7ff6ff" },
      { x: 746, y: 410, r: 12, collected: false, color: "#ff8fc0" },
      { x: 1024, y: 304, r: 12, collected: false, color: "#ffe07a" },
      { x: 1320, y: 364, r: 12, collected: false, color: "#7ff6ff" },
      { x: 1680, y: 266, r: 12, collected: false, color: "#ff8fc0" },
      { x: 2040, y: 350, r: 12, collected: false, color: "#ffe07a" },
    ];
    this.player = {
      x: 112,
      y: this.platforms[0].y - 54,
      w: 34,
      h: 52,
      vx: 0,
      vy: 0,
      onGround: false,
      coyote: 0,
      jumpBuffer: 0,
      facing: 1,
    };
  }

  getCheckpoint() {
    return this.platforms[this.checkpointIndex];
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.offsetX) / this.scale + this.cameraX,
      y: (screenY - this.offsetY) / this.scale,
    };
  }

  pushBanner(message, duration = 1.6) {
    this.banner = message;
    this.bannerTimer = duration;
  }

  failRun(message) {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.finished = true;
      this.finishedReason = "lose";
      this.pushBanner(message, 2);
      return;
    }

    const checkpoint = this.getCheckpoint();
    this.player.x = checkpoint.x + checkpoint.w * 0.26;
    this.player.y = checkpoint.y - this.player.h - 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onGround = true;
    this.player.coyote = 0.12;
    this.player.jumpBuffer = 0;
    this.cameraX = clamp(this.player.x - BASE_WIDTH * 0.4, 0, this.worldWidth - BASE_WIDTH);
    this.pushBanner(message, 1.8);
  }

  update(dt, inputState) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
    }

    if (!this.finished) {
      this.time += dt;
      const moveLeft =
        inputState.keys.has("a") || inputState.keys.has("ArrowLeft");
      const moveRight =
        inputState.keys.has("d") || inputState.keys.has("ArrowRight");
      const jumpPressed =
        inputState.justPressed.has("Space") ||
        inputState.justPressed.has("w") ||
        inputState.justPressed.has("ArrowUp");

      if (jumpPressed) {
        this.player.jumpBuffer = 0.14;
      }

      if (moveLeft !== moveRight) {
        const direction = moveRight ? 1 : -1;
        this.player.vx += direction * 1650 * dt;
        this.player.facing = direction;
      } else {
        this.player.vx *= Math.pow(0.001, dt);
      }

      this.player.vx = clamp(this.player.vx, -320, 320);
      this.player.x += this.player.vx * dt;
      this.player.x = clamp(this.player.x, 0, this.worldWidth - this.player.w);

      this.player.vy += 1780 * dt;
      this.player.y += this.player.vy * dt;
      this.player.onGround = false;

      let landedPlatform = -1;
      if (this.player.vy >= 0) {
        const previousBottom = this.player.y + this.player.h - this.player.vy * dt;
        const currentBottom = this.player.y + this.player.h;
        for (let i = 0; i < this.platforms.length; i += 1) {
          const platform = this.platforms[i];
          const overlapX =
            this.player.x + this.player.w > platform.x + 20 &&
            this.player.x < platform.x + platform.w - 20;
          const crossedTop =
            previousBottom <= platform.y + 8 && currentBottom >= platform.y;
          if (overlapX && crossedTop) {
            this.player.y = platform.y - this.player.h;
            this.player.vy = 0;
            this.player.onGround = true;
            landedPlatform = i;
            break;
          }
        }
      }

      if (this.player.onGround) {
        this.player.coyote = 0.12;
        if (landedPlatform > this.checkpointIndex) {
          this.checkpointIndex = landedPlatform;
          this.pushBanner(`Checkpoint set on island ${landedPlatform + 1}.`, 1.4);
        }
      } else {
        this.player.coyote = Math.max(0, this.player.coyote - dt);
      }

      this.player.jumpBuffer = Math.max(0, this.player.jumpBuffer - dt);
      if (this.player.jumpBuffer > 0 && this.player.coyote > 0 && !this.finished) {
        this.player.vy = -720;
        this.player.jumpBuffer = 0;
        this.player.coyote = 0;
        this.player.onGround = false;
      }

      for (const gem of this.gems) {
        if (!gem.collected) {
          const dx = this.player.x + this.player.w / 2 - gem.x;
          const dy = this.player.y + this.player.h / 2 - gem.y;
          if (dx * dx + dy * dy < (gem.r + 20) * (gem.r + 20)) {
            gem.collected = true;
            this.gemsCollected += 1;
            this.pushBanner("Shell collected!", 1.2);
            spawnBurst(
              this.particles,
              gem.x,
              gem.y,
              ["#ffe47a", "#7ff6ff", "#ff8fc0"],
              10,
              80,
              220,
              0.35,
              0.75,
              2,
              4,
              "star",
            );
          }
        }
      }

      if (this.player.y > 660) {
        spawnBurst(
          this.particles,
          this.player.x + this.player.w / 2,
          642,
          ["#5fc6ff", "#7ff6ff", "#d5f8ff"],
          14,
          40,
          160,
          0.35,
          0.75,
          2,
          4,
        );
        this.failRun("Splash! Back to the last island.");
      }

      const goalHit =
        this.player.x < this.goal.x + this.goal.w &&
        this.player.x + this.player.w > this.goal.x &&
        this.player.y < this.goal.y + this.goal.h &&
        this.player.y + this.player.h > this.goal.y;
      if (goalHit) {
        this.finished = true;
        this.finishedReason = "win";
        this.pushBanner("The coral gate is open.", 2);
      }

      const targetCamera = clamp(
        this.player.x + this.player.w / 2 - BASE_WIDTH * 0.42,
        0,
        this.worldWidth - BASE_WIDTH,
      );
      this.cameraX += (targetCamera - this.cameraX) * Math.min(1, dt * 6);
    }

    for (const cloud of this.clouds) {
      cloud.x += cloud.drift * dt;
      if (cloud.x > this.worldWidth + 160) {
        cloud.x = -220;
      }
    }

    for (const bubble of this.bubbles) {
      bubble.x += bubble.vx * dt;
      bubble.y += bubble.vy * dt;
      bubble.life -= dt;
    }
    this.bubbles = this.bubbles.filter((bubble) => bubble.life > 0);

    if (Math.random() < dt * 1.6) {
      this.bubbles.push({
        x: rand(this.cameraX, this.cameraX + BASE_WIDTH),
        y: rand(636, 682),
        vx: rand(-8, 8),
        vy: rand(-18, -8),
        life: rand(0.6, 1.2),
        maxLife: 1.2,
        radius: rand(1.5, 3.5),
        color: "rgba(195, 244, 255, 0.84)",
        shape: "dot",
      });
    }

    updateParticles(this.particles, dt);
  }

  draw(ctx) {
    const viewGradient = ctx.createLinearGradient(0, 0, 0, this.viewHeight);
    viewGradient.addColorStop(0, "#13285c");
    viewGradient.addColorStop(0.38, "#63d9ff");
    viewGradient.addColorStop(0.72, "#6f8bff");
    viewGradient.addColorStop(1, "#081221");
    ctx.fillStyle = viewGradient;
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const sky = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
    sky.addColorStop(0, "#143d7f");
    sky.addColorStop(0.24, "#6fe1ff");
    sky.addColorStop(0.6, "#4d97ff");
    sky.addColorStop(1, "#0a1732");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    const sunGlow = ctx.createRadialGradient(968, 104, 16, 968, 104, 118);
    sunGlow.addColorStop(0, "rgba(255, 248, 210, 0.98)");
    sunGlow.addColorStop(0.45, "rgba(255, 211, 108, 0.4)");
    sunGlow.addColorStop(1, "rgba(255, 211, 108, 0)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(968, 104, 118, 0, TAU);
    ctx.fill();

    const peachGlow = ctx.createRadialGradient(238, 154, 18, 238, 154, 140);
    peachGlow.addColorStop(0, "rgba(255, 127, 168, 0.28)");
    peachGlow.addColorStop(0.45, "rgba(255, 180, 120, 0.18)");
    peachGlow.addColorStop(1, "rgba(255, 127, 168, 0)");
    ctx.fillStyle = peachGlow;
    ctx.beginPath();
    ctx.arc(238, 154, 140, 0, TAU);
    ctx.fill();

    for (const star of this.stars) {
      const twinkle = 0.68 + Math.sin(this.time * 2 + star.x * 0.02) * 0.22;
      ctx.fillStyle = `rgba(255, 255, 255, ${star.a * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x - this.cameraX * 0.08, star.y, star.r, 0, TAU);
      ctx.fill();
    }

    for (const cloud of this.clouds) {
      drawCloud(
        ctx,
        cloud.x - this.cameraX * 0.15,
        cloud.y,
        cloud.scale,
        0.8,
      );
    }

    for (const mountain of this.mountains) {
      const x = mountain.x - this.cameraX * 0.18;
      ctx.fillStyle = mountain.color;
      ctx.beginPath();
      ctx.moveTo(x, 540);
      ctx.lineTo(x + mountain.w * 0.16, 330);
      ctx.lineTo(x + mountain.w * 0.35, 430);
      ctx.lineTo(x + mountain.w * 0.58, 290);
      ctx.lineTo(x + mountain.w * 0.82, 395);
      ctx.lineTo(x + mountain.w, 350);
      ctx.lineTo(x + mountain.w, 540);
      ctx.closePath();
      ctx.fill();
    }

    const water = ctx.createLinearGradient(0, 620, 0, 720);
    water.addColorStop(0, "#10497b");
    water.addColorStop(0.45, "#0a2d56");
    water.addColorStop(1, "#061423");
    ctx.fillStyle = water;
    ctx.fillRect(0, 620, BASE_WIDTH, 100);

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let i = 0; i < 12; i += 1) {
      const waveX = ((i * 130 - this.cameraX * 0.7) % 1800) - 140;
      ctx.beginPath();
      ctx.ellipse(waveX, 660 + (i % 3) * 10, 88, 11, 0.1, 0, TAU);
      ctx.fill();
    }

    for (const bubble of this.bubbles) {
      const alpha = clamp(bubble.life / bubble.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bubble.color;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < this.platforms.length; i += 1) {
      this.drawIsland(ctx, this.platforms[i], i);
    }

    this.drawGoal(ctx);
    this.drawGems(ctx);
    this.drawPlayer(ctx);
    drawParticles(ctx, this.particles);

    ctx.restore();
  }

  drawIsland(ctx, island, index) {
    const x = island.x - this.cameraX;
    const y = island.y;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(island.w / 2, island.h * 0.76, island.w * 0.56, island.h * 0.24, 0, 0, TAU);
    ctx.fill();

    const baseGradient = ctx.createLinearGradient(0, 0, 0, island.h);
    baseGradient.addColorStop(0, island.top);
    baseGradient.addColorStop(0.58, island.base);
    baseGradient.addColorStop(1, "#2d5b42");
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.ellipse(island.w / 2, island.h * 0.6, island.w * 0.5, island.h * 0.36, 0, 0, TAU);
    ctx.fill();

    const topGradient = ctx.createLinearGradient(0, 0, 0, 50);
    topGradient.addColorStop(0, "#f5ffc6");
    topGradient.addColorStop(0.4, "#9cf0b7");
    topGradient.addColorStop(1, island.top);
    ctx.fillStyle = topGradient;
    ctx.beginPath();
    ctx.ellipse(island.w / 2, island.h * 0.44, island.w * 0.46, island.h * 0.18, 0, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(island.w / 2, island.h * 0.45, island.w * 0.45, island.h * 0.16, 0, Math.PI, 0);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(island.w / 2 - 20, island.h * 0.3, island.w * 0.2, island.h * 0.08, -0.18, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.ellipse(island.w * 0.66, island.h * 0.5, island.w * 0.18, island.h * 0.06, 0.08, 0, TAU);
    ctx.fill();

    const flowerOffsets = [
      [island.w * 0.16, island.h * 0.27, "#ffe07a"],
      [island.w * 0.34, island.h * 0.24, "#ff8fc0"],
      [island.w * 0.62, island.h * 0.26, "#7ff6ff"],
      [island.w * 0.78, island.h * 0.21, "#ffe07a"],
    ];
    for (const [fx, fy, color] of flowerOffsets) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, TAU);
      ctx.fill();
    }

    if (island.palm) {
      drawPalm(ctx, island.w * 0.12, island.h * 0.3, 0.82);
    }

    ctx.restore();
  }

  drawGoal(ctx) {
    const x = this.goal.x - this.cameraX;
    const y = this.goal.y;
    ctx.save();
    ctx.translate(x, y);
    const glow = ctx.createRadialGradient(36, 66, 4, 36, 66, 78);
    glow.addColorStop(0, "rgba(255, 220, 120, 0.95)");
    glow.addColorStop(0.5, "rgba(255, 160, 120, 0.42)");
    glow.addColorStop(1, "rgba(255, 160, 120, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(36, 66, 74, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "#ffe49d";
    ctx.lineWidth = 8;
    ctx.shadowColor = "rgba(255, 220, 120, 0.8)";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(36, 66, 30, Math.PI * 0.12, Math.PI * 1.88);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ff9b5f";
    drawRoundRect(ctx, 10, 84, 52, 22, 10);
    ctx.fill();

    ctx.fillStyle = "#7ff6ff";
    ctx.fillRect(31, 14, 10, 56);
    ctx.beginPath();
    ctx.moveTo(35, 18);
    ctx.lineTo(64, 32);
    ctx.lineTo(35, 46);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawGems(ctx) {
    for (const gem of this.gems) {
      if (gem.collected) {
        continue;
      }
      const x = gem.x - this.cameraX;
      const pulse = 1 + Math.sin(this.time * 4 + gem.x * 0.03) * 0.08;
      ctx.save();
      ctx.translate(x, gem.y);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = gem.color;
      ctx.shadowBlur = 18;
      drawStar(ctx, 0, 0, gem.r, gem.r * 0.5, 4, gem.color);
      ctx.restore();
    }
  }

  drawPlayer(ctx) {
    const x = this.player.x - this.cameraX;
    const y = this.player.y;
    const bob = Math.sin(this.time * 8) * (this.player.onGround ? 1.6 : 0.4);

    ctx.save();
    ctx.translate(x + this.player.w / 2, y + this.player.h / 2 + bob);
    ctx.scale(this.player.facing, 1);

    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.beginPath();
    ctx.ellipse(0, this.player.h / 2 + 10, 16, 8, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#fef0c8";
    ctx.beginPath();
    ctx.arc(0, -16, 12, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#293f63";
    drawRoundRect(ctx, -13, -20, 20, 10, 5);
    ctx.fill();

    ctx.fillStyle = "#ff8e74";
    drawRoundRect(ctx, -12, -4, 24, 26, 8);
    ctx.fill();

    ctx.fillStyle = "#7ff6ff";
    drawRoundRect(ctx, -16, 4, 12, 18, 6);
    ctx.fill();

    ctx.fillStyle = "#ffd36c";
    drawRoundRect(ctx, 4, 4, 12, 18, 6);
    ctx.fill();

    ctx.fillStyle = "#ffd36c";
    drawRoundRect(ctx, -11, -24, 22, 10, 5);
    ctx.fill();

    ctx.fillStyle = "#16304b";
    drawRoundRect(ctx, -4, -21, 8, 6, 3);
    ctx.fill();

    ctx.strokeStyle = "#28425c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, 20);
    ctx.lineTo(-11, 36);
    ctx.moveTo(8, 20);
    ctx.lineTo(11, 36);
    ctx.stroke();

    ctx.fillStyle = "#28425c";
    drawRoundRect(ctx, -16, 30, 11, 8, 4);
    ctx.fill();
    drawRoundRect(ctx, 5, 30, 11, 8, 4);
    ctx.fill();

    ctx.fillStyle = "#ffe9bf";
    ctx.beginPath();
    ctx.arc(4, -18, 3, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#0b1628";
    ctx.beginPath();
    ctx.arc(4, -15, 1.1, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  getStats() {
    return [
      String(this.gemsCollected),
      String(this.lives),
      `${this.checkpointIndex + 1}/${this.platforms.length}`,
    ];
  }

  getStatusText() {
    if (this.bannerTimer > 0) {
      return this.banner;
    }
    return this.finished
      ? this.finishedReason === "win"
        ? "You reached the coral gate."
        : "The tide won this run."
      : this.meta.status;
  }

  getOverlayState() {
    if (!this.finished) {
      return null;
    }
    if (this.finishedReason === "win") {
      return {
        kicker: "Victory",
        title: "You reached the coral gate.",
        copy: `You collected ${this.gemsCollected} shell${this.gemsCollected === 1 ? "" : "s"} and completed the island run.`,
      };
    }
    return {
      kicker: "Game over",
      title: "The tide won this run.",
      copy: "Restart to try the island run again with a cleaner jump rhythm.",
    };
  }

  getSecondaryActionLabel() {
    return null;
  }

  handleSecondaryAction() {}
}

class TowerDefenseGame {
  constructor() {
    this.meta = GAME_DEFS.tower;
    this.resize(BASE_WIDTH, BASE_HEIGHT);
    this.reset();
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.scale = Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT);
    this.offsetX = (viewWidth - BASE_WIDTH * this.scale) / 2;
    this.offsetY = (viewHeight - BASE_HEIGHT * this.scale) / 2;
  }

  reset() {
    this.money = 120;
    this.lives = 18;
    this.wave = 1;
    this.maxWaves = Infinity;
    this.waveActive = false;
    this.buildTimer = 2.5;
    this.spawnClock = 0;
    this.spawnQueue = [];
    this.selectedTowerType = "sunburst";
    this.finished = false;
    this.finishedReason = null;
    this.banner = this.meta.status;
    this.bannerTimer = 0;
    this.time = 0;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.previewPlacement = {
      x: BASE_WIDTH * 0.5,
      y: BASE_HEIGHT * 0.5,
      visible: false,
    };
    this.path = buildPath(
      [
        { x: 80, y: 160 },
        { x: 240, y: 160 },
        { x: 240, y: 300 },
        { x: 430, y: 300 },
        { x: 430, y: 120 },
        { x: 700, y: 120 },
        { x: 700, y: 360 },
        { x: 940, y: 360 },
        { x: 940, y: 560 },
        { x: 1150, y: 560 },
        { x: 1150, y: 640 },
      ],
    );
    this.buildPads = [
      { x: 160, y: 250, r: 24 },
      { x: 334, y: 214, r: 24 },
      { x: 344, y: 418, r: 24 },
      { x: 540, y: 236, r: 24 },
      { x: 612, y: 466, r: 24 },
      { x: 792, y: 214, r: 24 },
      { x: 840, y: 474, r: 24 },
      { x: 1012, y: 236, r: 24 },
      { x: 1070, y: 478, r: 24 },
      { x: 1178, y: 296, r: 24 },
    ];
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale,
    };
  }

  pushBanner(message, duration = 1.5) {
    this.banner = message;
    this.bannerTimer = duration;
  }

  selectTowerType(type) {
    if (TOWER_TYPES[type]) {
      this.selectedTowerType = type;
      this.pushBanner(`${TOWER_TYPES[type].label} selected.`, 1.2);
    }
  }

  startWave() {
    if (this.finished || this.waveActive) {
      return;
    }

    this.waveActive = true;
    this.spawnClock = 0;
    this.spawnQueue = this.makeWavePlan(this.wave);
    this.pushBanner(`Wave ${this.wave} incoming!`, 1.4);
  }

  launchNextWave() {
    if (this.finished) {
      return;
    }
    if (!this.waveActive) {
      this.buildTimer = 0;
      this.startWave();
    }
  }

  makeWavePlan(wave) {
    const count = Math.min(14 + Math.floor(wave * 2.5), 96);
    const interval = Math.max(0.16, 0.78 - wave * 0.012);
    const queue = [];
    for (let i = 0; i < count; i += 1) {
      const roll = Math.random();
      let type = "walker";
      if (wave >= 12 && roll > 0.97) {
        type = "atlas";
      } else if (wave >= 10 && roll > 0.94) {
        type = "nova";
      } else if (wave >= 8 && roll > 0.88) {
        type = "tank";
      } else if (wave >= 6 && roll > 0.8) {
        type = "shatter";
      } else if (wave >= 5 && roll > 0.66) {
        type = "brute";
      } else if (wave >= 3 && roll > 0.38) {
        type = "runner";
      }
      if (wave >= 2 && roll < 0.2 + wave * 0.005) {
        type = "swarm";
      }
      queue.push({
        type,
        delay: i * interval + rand(0, interval * 0.34),
      });
    }
    return queue;
  }

  spawnEnemy(typeKey) {
    const templates = {
      walker: {
        hp: 42,
        speed: 74,
        reward: 14,
        radius: 18,
        body: "#79f0a4",
        accent: "#205948",
        eye: "#fff4b0",
        glow: "#9cf0b7",
        drawScale: 1,
      },
      swarm: {
        hp: 18,
        speed: 130,
        reward: 10,
        radius: 12,
        body: "#7ff6ff",
        accent: "#9988ff",
        eye: "#ffffff",
        glow: "#d5fbff",
        drawScale: 0.72,
      },
      runner: {
        hp: 28,
        speed: 108,
        reward: 17,
        radius: 15,
        body: "#66e5ff",
        accent: "#2b7ad1",
        eye: "#ffffff",
        glow: "#b8f4ff",
        drawScale: 0.92,
      },
      shatter: {
        hp: 36,
        speed: 92,
        reward: 20,
        radius: 16,
        body: "#c9c2ff",
        accent: "#7ff6ff",
        eye: "#ffffff",
        glow: "#eef1ff",
        drawScale: 0.94,
      },
      brute: {
        hp: 84,
        speed: 52,
        reward: 28,
        radius: 24,
        body: "#ff9b5f",
        accent: "#c14d38",
        eye: "#fff4b0",
        glow: "#ffd36c",
        drawScale: 1.08,
      },
      tank: {
        hp: 150,
        speed: 38,
        reward: 45,
        radius: 30,
        body: "#8f7cff",
        accent: "#52b8ff",
        eye: "#fef0c8",
        glow: "#d8d4ff",
        drawScale: 1.24,
      },
      nova: {
        hp: 118,
        speed: 64,
        reward: 38,
        radius: 26,
        body: "#ffcc8d",
        accent: "#9bf0ff",
        eye: "#fff8cf",
        glow: "#fff0a4",
        drawScale: 1.12,
      },
      atlas: {
        hp: 220,
        speed: 30,
        reward: 70,
        radius: 34,
        body: "#4c8eff",
        accent: "#8fe8ff",
        eye: "#fef0c8",
        glow: "#f0ffff",
        drawScale: 1.34,
      },
    };
    const template = templates[typeKey];
    const point = this.path.points[0];
    const enemy = {
      type: typeKey,
      x: point.x - 14,
      y: point.y,
      progress: 0,
      hp: template.hp,
      maxHp: template.hp,
      speed: template.speed * rand(0.88, 1.12),
      reward: template.reward,
      radius: template.radius,
      body: template.body,
      accent: template.accent,
      eye: template.eye,
      glow: template.glow,
      drawScale: template.drawScale || 1,
      flash: 0,
      slowTimer: 0,
      slowFactor: 1,
    };
    this.enemies.push(enemy);
  }

  buildTowerAt(x, y) {
    if (this.finished) {
      return;
    }
    const type = TOWER_TYPES[this.selectedTowerType];
    if (this.money < type.cost) {
      this.pushBanner("Not enough money for that tower.", 1.3);
      return;
    }
    const placedX = clamp(x, 38, BASE_WIDTH - 38);
    const placedY = clamp(y, 38, BASE_HEIGHT - 38);
    for (const tower of this.towers) {
      if (distance(placedX, placedY, tower.x, tower.y) < 32) {
        this.pushBanner("That spot is already crowded.", 1.15);
        return;
      }
    }

    this.money -= type.cost;
    const tower = {
      x: placedX,
      y: placedY,
      typeKey: this.selectedTowerType,
      cooldown: rand(0, 0.25),
      recoil: 0,
      level: 1,
      angle: -Math.PI / 2,
    };
    this.towers.push(tower);
    this.pushBanner(`${type.label} tower placed.`, 1.2);
    spawnBurst(
      this.particles,
      tower.x,
      tower.y,
      [type.color, type.glow, "#ffffff"],
      14,
      80,
      220,
      0.32,
      0.7,
      2,
      4,
    );
  }

  handleSecondaryAction() {
    this.launchNextWave();
  }

  update(dt, inputState) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
    }

    if (inputState.justPressed.has("1")) {
      this.selectTowerType("sunburst");
    } else if (inputState.justPressed.has("2")) {
      this.selectTowerType("prism");
    } else if (inputState.justPressed.has("3")) {
      this.selectTowerType("ember");
    }

    if (!this.finished) {
      this.time += dt;
      const pointer = inputState.pointer;
      const worldPoint = this.screenToWorld(pointer.x, pointer.y);
      this.previewPlacement.x = clamp(worldPoint.x, 38, BASE_WIDTH - 38);
      this.previewPlacement.y = clamp(worldPoint.y, 38, BASE_HEIGHT - 38);
      this.previewPlacement.visible = pointer.inside || pointer.down || pointer.pressed;

      if (pointer.pressed) {
        this.buildTowerAt(worldPoint.x, worldPoint.y);
      }

      if (this.waveActive) {
        this.spawnClock += dt;
        while (this.spawnQueue.length && this.spawnClock >= this.spawnQueue[0].delay) {
          const spec = this.spawnQueue.shift();
          this.spawnEnemy(spec.type);
        }
      } else if (this.buildTimer > 0) {
        this.buildTimer -= dt;
        if (this.buildTimer <= 0) {
          this.startWave();
        }
      }

      for (const tower of this.towers) {
        tower.cooldown -= dt;
        tower.recoil *= Math.pow(0.002, dt);
        if (tower.cooldown <= 0 && this.enemies.length) {
          let bestEnemy = null;
          let bestDistance = Infinity;
          for (const enemy of this.enemies) {
            const d = distance(tower.x, tower.y, enemy.x, enemy.y);
            if (d < TOWER_TYPES[tower.typeKey].range && d < bestDistance) {
              bestDistance = d;
              bestEnemy = enemy;
            }
          }
          if (bestEnemy) {
            const type = TOWER_TYPES[tower.typeKey];
            const aim = normalizeVector(bestEnemy.x - tower.x, bestEnemy.y - tower.y);
            const shotCount = type.shots || 1;
            const spread = type.spread || 0;
            for (let shot = 0; shot < shotCount; shot += 1) {
              const offset = shotCount > 1 ? (shot - (shotCount - 1) / 2) * spread : 0;
              const angle = Math.atan2(aim.y, aim.x) + offset;
              const shotVector = {
                x: Math.cos(angle),
                y: Math.sin(angle),
              };
              this.projectiles.push({
                x: tower.x + shotVector.x * 18,
                y: tower.y + shotVector.y * 18,
                vx: shotVector.x * type.projectileSpeed,
                vy: shotVector.y * type.projectileSpeed,
                radius: type.shape === "ember" ? 7 : type.shape === "prism" ? 5 : 4,
                damage: type.damage,
                color: type.color,
                glow: type.glow,
                splash: type.splash,
                slowFactor: type.slowFactor || 1,
                slowDuration: type.slowDuration || 0,
                life: 1.6,
                maxLife: 1.6,
                owner: tower.typeKey,
              });
            }
            tower.cooldown = type.cooldown * rand(0.82, 1.08);
            tower.recoil = 1;
            spawnBurst(
              this.particles,
              tower.x + aim.x * 12,
              tower.y + aim.y * 12,
              [type.color, type.glow, "#ffffff"],
              4,
              18,
              88,
              0.18,
              0.45,
              1.8,
              3.2,
            );
          }
        }
      }

      for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
        const projectile = this.projectiles[i];
        projectile.life -= dt;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;
        if (
          projectile.life <= 0 ||
          projectile.x < -60 ||
          projectile.x > BASE_WIDTH + 60 ||
          projectile.y < -60 ||
          projectile.y > BASE_HEIGHT + 60
        ) {
          this.projectiles.splice(i, 1);
          continue;
        }

        let hitEnemy = null;
        for (const enemy of this.enemies) {
          const d = distance(projectile.x, projectile.y, enemy.x, enemy.y);
          if (d <= projectile.radius + enemy.radius) {
            hitEnemy = enemy;
            break;
          }
        }

        if (hitEnemy) {
          hitEnemy.hp -= projectile.damage;
          hitEnemy.flash = 0.14;
          if (projectile.slowFactor && projectile.slowFactor < 1) {
            hitEnemy.slowFactor = Math.min(hitEnemy.slowFactor, projectile.slowFactor);
            hitEnemy.slowTimer = Math.max(hitEnemy.slowTimer, projectile.slowDuration);
          }
          spawnBurst(
            this.particles,
            projectile.x,
            projectile.y,
            [projectile.color, projectile.glow, "#ffffff"],
            8,
            50,
            160,
            0.22,
            0.55,
            2,
            4,
          );
          if (projectile.splash > 0) {
            for (const enemy of this.enemies) {
              const splashDistance = distance(projectile.x, projectile.y, enemy.x, enemy.y);
              if (splashDistance <= projectile.splash) {
                enemy.hp -= projectile.damage * 0.4;
                enemy.flash = 0.1;
              }
            }
          }
          this.projectiles.splice(i, 1);
        }
      }

      for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
        const enemy = this.enemies[i];
        if (enemy.hp <= 0) {
          this.money += enemy.reward;
          spawnBurst(
            this.particles,
            enemy.x,
            enemy.y,
            [enemy.body, enemy.glow, "#ffffff"],
            14,
            60,
            180,
            0.3,
            0.7,
            2,
            4,
            "star",
          );
          if (Math.random() < 0.15) {
            this.particles.push({
              x: enemy.x + rand(-6, 6),
              y: enemy.y + rand(-6, 6),
              vx: rand(-18, 18),
              vy: rand(-30, -10),
              gravity: 0,
              life: 1.2,
              maxLife: 1.2,
              radius: 10,
              color: "#ff7ea8",
              shape: "dot",
              pickup: true,
            });
          }
          this.enemies.splice(i, 1);
          continue;
        }

        if (enemy.flash > 0) {
          enemy.flash -= dt;
        }

        if (enemy.slowTimer > 0) {
          enemy.slowTimer -= dt;
          if (enemy.slowTimer <= 0) {
            enemy.slowFactor = 1;
          }
        }

        enemy.progress += enemy.speed * enemy.slowFactor * dt;
        const pos = samplePath(this.path, enemy.progress);
        enemy.x = pos.x;
        enemy.y = pos.y;

        if (enemy.progress >= this.path.totalLength - 6) {
          spawnBurst(
            this.particles,
            enemy.x,
            enemy.y,
            ["#ff7f88", "#ff9b5f", "#ffffff"],
            12,
            60,
            140,
            0.24,
            0.6,
            2,
            4,
          );
          this.lives -= 1;
          this.enemies.splice(i, 1);
          this.pushBanner("An enemy slipped through!", 1.2);
          if (this.lives <= 0) {
            this.finished = true;
            this.finishedReason = "lose";
          }
        }
      }

      if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
        this.waveActive = false;
        this.money += 65 + this.wave * 16;
        this.wave += 1;
        this.buildTimer = Math.max(0.9, 3.1 - this.wave * 0.025);
        this.pushBanner(`Wave ${this.wave - 1} cleared. Endless mode continues.`, 2.2);
      }
    }

    updateParticles(this.particles, dt);
  }

  draw(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, this.viewHeight);
    bg.addColorStop(0, "#173e73");
    bg.addColorStop(0.42, "#69d8ff");
    bg.addColorStop(0.55, "#78cf8c");
    bg.addColorStop(1, "#19442e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const skyGlow = ctx.createRadialGradient(1050, 80, 20, 1050, 80, 220);
    skyGlow.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    skyGlow.addColorStop(0.5, "rgba(255, 211, 108, 0.22)");
    skyGlow.addColorStop(1, "rgba(255, 211, 108, 0)");
    ctx.fillStyle = skyGlow;
    ctx.beginPath();
    ctx.arc(1050, 80, 220, 0, TAU);
    ctx.fill();

    const grass = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
    grass.addColorStop(0, "#78e6a4");
    grass.addColorStop(0.6, "#52bb77");
    grass.addColorStop(1, "#1e563b");
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let i = 0; i < 36; i += 1) {
      const fx = (i * 53 + this.time * 18) % (BASE_WIDTH + 140) - 70;
      const fy = 64 + (i % 4) * 28;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.7 + (i % 3) * 0.4, 0, TAU);
      ctx.fill();
    }

    for (let i = 0; i < 10; i += 1) {
      const flowerX = 80 + i * 128 + Math.sin(this.time + i) * 10;
      const flowerY = 648 + (i % 2) * 10;
      ctx.fillStyle = i % 2 === 0 ? "#ffe07a" : "#ff8fc0";
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 4, 0, TAU);
      ctx.fill();
    }

    this.drawPath(ctx);
    this.drawPads(ctx);
    this.drawPlacementGuide(ctx);
    this.drawGoalBase(ctx);
    this.drawTowers(ctx);
    this.drawEnemies(ctx);
    this.drawProjectiles(ctx);
    drawParticles(ctx, this.particles);

    ctx.restore();
  }

  drawPath(ctx) {
    const roadWidth = 58;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(25, 13, 8, 0.4)";
    ctx.lineWidth = roadWidth + 20;
    ctx.beginPath();
    ctx.moveTo(this.path.points[0].x, this.path.points[0].y);
    for (const point of this.path.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    const road = ctx.createLinearGradient(0, 0, BASE_WIDTH, BASE_HEIGHT);
    road.addColorStop(0, "#93531e");
    road.addColorStop(0.45, "#f0a64f");
    road.addColorStop(1, "#cf7a2e");
    ctx.strokeStyle = road;
    ctx.lineWidth = roadWidth;
    ctx.beginPath();
    ctx.moveTo(this.path.points[0].x, this.path.points[0].y);
    for (const point of this.path.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 248, 196, 0.32)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(this.path.points[0].x, this.path.points[0].y);
    for (const point of this.path.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

  drawPads(ctx) {
    for (let i = 0; i < this.buildPads.length; i += 1) {
      const pad = this.buildPads[i];
      const pulse = 1 + Math.sin(this.time * 2 + i * 0.45) * 0.05;
      const glow = ctx.createRadialGradient(pad.x, pad.y, 4, pad.x, pad.y, pad.r * 3);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.32)");
      glow.addColorStop(0.45, i % 2 === 0 ? "rgba(102, 229, 255, 0.18)" : "rgba(255, 211, 108, 0.16)");
      glow.addColorStop(1, "rgba(255, 211, 108, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r * 2.3 * pulse, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r * 0.95, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = i % 2 === 0 ? "#7ff6ff" : "#fff0a4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r + 4, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r * 1.55, 0, TAU);
      ctx.stroke();
    }
  }

  drawPlacementGuide(ctx) {
    if (!this.previewPlacement.visible) {
      return;
    }

    const type = TOWER_TYPES[this.selectedTowerType];
    const pulse = 1 + Math.sin(this.time * 6.5) * 0.05;
    ctx.save();
    ctx.translate(this.previewPlacement.x, this.previewPlacement.y);
    ctx.globalAlpha = 0.92;
    ctx.shadowColor = type.glow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.beginPath();
    ctx.arc(0, 0, 22 * pulse, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = type.glow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 32 * pulse, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawGoalBase(ctx) {
    const baseX = 1150;
    const baseY = 624;
    ctx.save();
    ctx.translate(baseX, baseY);
    const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
    glow.addColorStop(0, "rgba(255, 211, 108, 0.8)");
    glow.addColorStop(1, "rgba(255, 211, 108, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#4f8eb0";
    drawRoundRect(ctx, -22, -42, 44, 58, 12);
    ctx.fill();

    ctx.fillStyle = "#2b5674";
    drawRoundRect(ctx, -48, -14, 96, 22, 10);
    ctx.fill();

    ctx.fillStyle = "#ffdf83";
    ctx.beginPath();
    ctx.moveTo(-50, -34);
    ctx.lineTo(0, -72);
    ctx.lineTo(50, -34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawTowers(ctx) {
    for (const tower of this.towers) {
      const type = TOWER_TYPES[tower.typeKey];
      const pulse = 1 + Math.sin(this.time * 5 + tower.x * 0.01) * 0.04;
      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.scale(pulse, pulse);

      if (type.shape === "sun") {
        ctx.fillStyle = "rgba(255, 248, 190, 0.18)";
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, TAU);
        ctx.fill();
        ctx.fillStyle = type.body;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, TAU);
        ctx.fill();
        ctx.fillStyle = type.accent;
        for (let i = 0; i < 8; i += 1) {
          const angle = (TAU / 8) * i;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
          ctx.lineTo(Math.cos(angle) * 31, Math.sin(angle) * 31);
          ctx.lineWidth = 8;
          ctx.strokeStyle = type.color;
          ctx.stroke();
        }
        ctx.fillStyle = "#fff7cf";
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, TAU);
        ctx.fill();
      } else if (type.shape === "prism") {
        ctx.fillStyle = "rgba(102, 229, 255, 0.16)";
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, TAU);
        ctx.fill();
        ctx.fillStyle = type.body;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(20, 8);
        ctx.lineTo(0, 32);
        ctx.lineTo(-20, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = type.glow;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = type.accent;
        ctx.fillRect(-8, 18, 16, 10);
      } else {
        ctx.fillStyle = "rgba(255, 155, 95, 0.16)";
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, TAU);
        ctx.fill();
        ctx.fillStyle = type.body;
        drawRoundRect(ctx, -18, -18, 36, 32, 10);
        ctx.fill();
        ctx.fillStyle = type.accent;
        ctx.beginPath();
        ctx.arc(0, -2, 12, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#ffe39d";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 12);
        ctx.lineTo(10, 12);
        ctx.stroke();
      }

      if (tower.recoil > 0.01) {
        ctx.save();
        ctx.globalAlpha = clamp(tower.recoil, 0, 1);
        ctx.strokeStyle = type.glow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 40 + tower.recoil * 10, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  drawEnemies(ctx) {
    for (const enemy of this.enemies) {
      const wobble = Math.sin(this.time * 8 + enemy.progress * 0.03) * 2.2;
      const walk = Math.sin(this.time * 11 + enemy.progress * 0.05);
      const lean = Math.sin(this.time * 3.5 + enemy.progress * 0.02) * 0.08;
      ctx.save();
      ctx.translate(enemy.x, enemy.y + wobble);
      ctx.rotate(lean);
      ctx.scale(enemy.drawScale || 1, enemy.drawScale || 1);

      ctx.shadowColor = enemy.glow;
      ctx.shadowBlur = 14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.beginPath();
      ctx.ellipse(0, enemy.radius + 8, enemy.radius * 1.05, 8, 0, 0, TAU);
      ctx.fill();

      if (enemy.type === "walker") {
        ctx.fillStyle = enemy.body;
        drawRoundRect(ctx, -14, -10, 28, 28, 12);
        ctx.fill();
        ctx.fillStyle = "#1b2d45";
        ctx.beginPath();
        ctx.ellipse(0, -2, 12, 10, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = enemy.accent;
        ctx.beginPath();
        ctx.arc(0, -16, 13, 0, TAU);
        ctx.fill();
        ctx.fillStyle = enemy.eye;
        ctx.beginPath();
        ctx.arc(-4, -16, 2.6, 0, TAU);
        ctx.arc(4, -16, 2.6, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#b83f56";
        drawRoundRect(ctx, -6, -8, 12, 4, 2);
        ctx.fill();
        ctx.strokeStyle = "#2e624f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 2 + walk * 2.5);
        ctx.lineTo(-18, 14 - walk * 2.5);
        ctx.moveTo(10, 2 - walk * 2.5);
        ctx.lineTo(18, 14 + walk * 2.5);
        ctx.stroke();
        ctx.strokeStyle = "#16303c";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-8, 10);
        ctx.lineTo(-10, 22 + walk * 2.2);
        ctx.moveTo(8, 10);
        ctx.lineTo(10, 22 - walk * 2.2);
        ctx.stroke();
      } else if (enemy.type === "runner") {
        ctx.fillStyle = enemy.body;
        drawRoundRect(ctx, -12, -8, 24, 22, 10);
        ctx.fill();
        ctx.fillStyle = "#16304b";
        ctx.beginPath();
        ctx.ellipse(0, -2, 10, 8, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = enemy.accent;
        drawRoundRect(ctx, -10, -16, 20, 8, 4);
        ctx.fill();
        ctx.fillStyle = enemy.eye;
        ctx.beginPath();
        ctx.arc(-3, -16, 2.8, 0, TAU);
        ctx.arc(3, -16, 2.8, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#1c547f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 1 + walk * 3.5);
        ctx.lineTo(-20, 10 - walk * 2.2);
        ctx.moveTo(10, 1 - walk * 3.5);
        ctx.lineTo(20, 10 + walk * 2.2);
        ctx.moveTo(-6, 10);
        ctx.lineTo(-8, 22 + walk * 3.5);
        ctx.moveTo(6, 10);
        ctx.lineTo(8, 22 - walk * 3.5);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = enemy.body;
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 22, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#6b2f25";
        drawRoundRect(ctx, -18, -14, 36, 30, 14);
        ctx.fill();
        ctx.fillStyle = enemy.accent;
        drawRoundRect(ctx, -24, -16, 16, 18, 8);
        ctx.fill();
        drawRoundRect(ctx, 8, -16, 16, 18, 8);
        ctx.fill();
        ctx.fillStyle = "#fff1b0";
        ctx.beginPath();
        ctx.arc(0, -18, 14, 0, TAU);
        ctx.fill();
        ctx.fillStyle = enemy.eye;
        ctx.beginPath();
        ctx.arc(-5, -18, 3, 0, TAU);
        ctx.arc(5, -18, 3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#ffe39d";
        ctx.beginPath();
        ctx.arc(0, -8, 7, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#3b271d";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-14, 2 + walk * 1.5);
        ctx.lineTo(-24, 16 - walk * 2.5);
        ctx.moveTo(14, 2 - walk * 1.5);
        ctx.lineTo(24, 16 + walk * 2.5);
        ctx.stroke();
        ctx.strokeStyle = "#201715";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-10, 12);
        ctx.lineTo(-12, 24 + walk * 2.2);
        ctx.moveTo(10, 12);
        ctx.lineTo(12, 24 - walk * 2.2);
        ctx.fill();
        ctx.stroke();
      }

      if (enemy.flash > 0) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius + 6, 0, TAU);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  drawProjectiles(ctx) {
    for (const projectile of this.projectiles) {
      const pulse = 1 + Math.sin(this.time * 16 + projectile.x * 0.02) * 0.1;
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = projectile.glow;
      ctx.shadowBlur = 16;
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(0, 0, projectile.radius, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  getStats() {
    const waveText = this.maxWaves === Infinity ? `${this.wave}/∞` : `${Math.min(this.wave, this.maxWaves)}/${this.maxWaves}`;
    return [
      formatMoney(this.money),
      String(this.lives),
      waveText,
    ];
  }

  getStatusText() {
    if (this.bannerTimer > 0) {
      return this.banner;
    }
    if (this.finished) {
      return this.finishedReason === "win"
        ? "Coral Bastion secured."
        : "The road was overrun.";
    }
    if (!this.waveActive) {
      return `Wave ${this.wave} starts in ${Math.max(0, Math.ceil(this.buildTimer))}s. Endless mode is live.`;
    }
    return `Wave ${this.wave} in progress. ${this.enemies.length} creep${this.enemies.length === 1 ? "" : "s"} on the road.`;
  }

  getOverlayState() {
    if (!this.finished) {
      return null;
    }
    if (this.finishedReason === "win") {
      return {
        kicker: "Victory",
        title: "Coral Bastion secured.",
        copy: `You held the path through all ${this.maxWaves} waves and finished with ${formatMoney(this.money)} in reserve.`,
      };
    }
    return {
      kicker: "Game over",
      title: "The road was overrun.",
      copy: "Restart and try a different tower mix to push the line farther back.",
    };
  }

  getSecondaryActionLabel() {
    return this.finished ? null : this.meta.secondaryActionLabel;
  }
}

class ZombieShooterGame {
  constructor() {
    this.meta = GAME_DEFS.zombie;
    this.resize(BASE_WIDTH, BASE_HEIGHT);
    this.reset();
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.scale = Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT);
    this.offsetX = (viewWidth - BASE_WIDTH * this.scale) / 2;
    this.offsetY = (viewHeight - BASE_HEIGHT * this.scale) / 2;
  }

  reset() {
    this.worldWidth = 2200;
    this.worldHeight = 1600;
    this.cameraX = 280;
    this.cameraY = 420;
    this.time = 0;
    this.score = 0;
    this.kills = 0;
    this.totalTime = 120;
    this.timeLeft = this.totalTime;
    this.spawnTimer = 0.7;
    this.spawnRate = 1.05;
    this.finished = false;
    this.finishedReason = null;
    this.banner = this.meta.status;
    this.bannerTimer = 0;
    this.bullets = [];
    this.zombies = [];
    this.pickups = [];
    this.particles = [];
    this.lastAimAngle = 0;
    this.player = {
      x: 1120,
      y: 820,
      vx: 0,
      vy: 0,
      r: 18,
      health: 100,
      fireCooldown: 0,
      flash: 0,
      invuln: 0,
    };
    this.props = Array.from({ length: 22 }, (_, index) => {
      const lane = index % 4;
      const baseX = 120 + index * 92;
      return {
        type: lane === 0 ? "building" : lane === 1 ? "lamp" : lane === 2 ? "barrel" : "fence",
        x: baseX + rand(-24, 24),
        y: lane === 0 ? rand(180, 380) : lane === 1 ? rand(420, 1180) : rand(560, 1360),
        w: lane === 0 ? rand(110, 160) : lane === 1 ? 14 : lane === 2 ? 22 : 120,
        h: lane === 0 ? rand(160, 290) : lane === 1 ? rand(70, 110) : lane === 2 ? 24 : 22,
        tint: lane === 0 ? "#2d356a" : lane === 1 ? "#ffd36c" : lane === 2 ? "#ff9b5f" : "#7ff6ff",
      };
    });
    this.buildings = Array.from({ length: 10 }, (_, index) => ({
      x: 40 + index * 216,
      w: rand(120, 190),
      h: rand(180, 340),
      windows: randInt(4, 8),
      color: index % 2 === 0 ? "#1f254a" : "#262f59",
    }));
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.offsetX) / this.scale + this.cameraX,
      y: (screenY - this.offsetY) / this.scale + this.cameraY,
    };
  }

  pushBanner(message, duration = 1.2) {
    this.banner = message;
    this.bannerTimer = duration;
  }

  spawnZombie() {
    const difficulty = 1 - this.timeLeft / this.totalTime;
    const roll = Math.random();
    let type = "walker";
    if (difficulty > 0.32 && roll > 0.62) {
      type = "runner";
    }
    if (difficulty > 0.72 && roll > 0.83) {
      type = "brute";
    }

    const templates = {
      walker: {
        hp: 30,
        speed: 66,
        damage: 12,
        radius: 18,
        body: "#7df4bd",
        accent: "#24715d",
        eye: "#fff4b0",
        glow: "#9cf0b7",
        score: 10,
      },
      runner: {
        hp: 20,
        speed: 102,
        damage: 10,
        radius: 15,
        body: "#66e5ff",
        accent: "#2f7bd1",
        eye: "#ffffff",
        glow: "#b8f4ff",
        score: 16,
      },
      brute: {
        hp: 62,
        speed: 44,
        damage: 18,
        radius: 24,
        body: "#ff9b5f",
        accent: "#b94f3e",
        eye: "#fff4b0",
        glow: "#ffe39d",
        score: 30,
      },
    };

    const template = templates[type];
    const side = randInt(0, 3);
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = this.cameraX - 90;
      y = rand(this.cameraY - 20, this.cameraY + BASE_HEIGHT + 20);
    } else if (side === 1) {
      x = this.cameraX + BASE_WIDTH + 90;
      y = rand(this.cameraY - 20, this.cameraY + BASE_HEIGHT + 20);
    } else if (side === 2) {
      x = rand(this.cameraX - 20, this.cameraX + BASE_WIDTH + 20);
      y = this.cameraY - 90;
    } else {
      x = rand(this.cameraX - 20, this.cameraX + BASE_WIDTH + 20);
      y = this.cameraY + BASE_HEIGHT + 90;
    }
    x = clamp(x, 0, this.worldWidth);
    y = clamp(y, 0, this.worldHeight);

    this.zombies.push({
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: 0,
      hp: template.hp,
      maxHp: template.hp,
      speed: template.speed * rand(0.88, 1.14),
      damage: template.damage,
      radius: template.radius,
      body: template.body,
      accent: template.accent,
      eye: template.eye,
      score: template.score,
      biteCooldown: rand(0.1, 0.35),
      flash: 0,
    });
  }

  spawnPickup(x, y) {
    this.pickups.push({
      x,
      y,
      r: 12,
      kind: "medkit",
      pulse: rand(0, TAU),
    });
  }

  update(dt, inputState) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
    }

    if (!this.finished) {
      this.time += dt;
      this.timeLeft -= dt;

      const moveX =
        (inputState.keys.has("d") || inputState.keys.has("ArrowRight") ? 1 : 0) -
        (inputState.keys.has("a") || inputState.keys.has("ArrowLeft") ? 1 : 0);
      const moveY =
        (inputState.keys.has("s") || inputState.keys.has("ArrowDown") ? 1 : 0) -
        (inputState.keys.has("w") || inputState.keys.has("ArrowUp") ? 1 : 0);

      if (moveX !== 0 || moveY !== 0) {
        const vector = normalizeVector(moveX, moveY);
        this.player.vx += vector.x * 1650 * dt;
        this.player.vy += vector.y * 1650 * dt;
      } else {
        this.player.vx *= Math.pow(0.001, dt);
        this.player.vy *= Math.pow(0.001, dt);
      }

      this.player.vx = clamp(this.player.vx, -340, 340);
      this.player.vy = clamp(this.player.vy, -340, 340);
      this.player.x = clamp(this.player.x + this.player.vx * dt, 0, this.worldWidth);
      this.player.y = clamp(this.player.y + this.player.vy * dt, 0, this.worldHeight);

      const targetCameraX = clamp(
        this.player.x - BASE_WIDTH / 2,
        0,
        this.worldWidth - BASE_WIDTH,
      );
      const targetCameraY = clamp(
        this.player.y - BASE_HEIGHT / 2,
        0,
        this.worldHeight - BASE_HEIGHT,
      );
      this.cameraX += (targetCameraX - this.cameraX) * Math.min(1, dt * 5);
      this.cameraY += (targetCameraY - this.cameraY) * Math.min(1, dt * 5);

  const pointer = inputState.pointer;
  const worldPoint = this.screenToWorld(pointer.x, pointer.y);
      if (pointer.inside || pointer.down || pointer.pressed) {
        this.lastAimAngle = Math.atan2(
          worldPoint.y - this.player.y,
          worldPoint.x - this.player.x,
        );
      }

      const firing = pointer.down || inputState.keys.has("Space");
      if (firing && this.player.fireCooldown <= 0) {
        const angle = this.lastAimAngle;
        this.bullets.push({
          x: this.player.x + Math.cos(angle) * (this.player.r + 8),
          y: this.player.y + Math.sin(angle) * (this.player.r + 8),
          vx: Math.cos(angle) * 820,
          vy: Math.sin(angle) * 820,
          radius: 5,
          damage: 18,
          life: 1.2,
          maxLife: 1.2,
          color: "#fff1a8",
          glow: "#66e5ff",
        });
        this.player.fireCooldown = 0.15;
        spawnBurst(
          this.particles,
          this.player.x + Math.cos(angle) * 18,
          this.player.y + Math.sin(angle) * 18,
          ["#ffe07a", "#66e5ff", "#ffffff"],
          4,
          20,
          80,
          0.12,
          0.28,
          1.5,
          3,
        );
      }

      this.player.fireCooldown = Math.max(0, this.player.fireCooldown - dt);
      this.player.invuln = Math.max(0, this.player.invuln - dt);
      this.player.flash = Math.max(0, this.player.flash - dt * 3);

      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnZombie();
        const difficulty = 1 - this.timeLeft / this.totalTime;
        const roll = rand(0, 1);
        this.spawnRate = Math.max(0.28, 0.98 - difficulty * 0.48);
        if (roll > 0.7) {
          this.spawnTimer = this.spawnRate * rand(0.6, 1.1);
        } else {
          this.spawnTimer = this.spawnRate * rand(0.9, 1.4);
        }
      }

      for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
        const bullet = this.bullets[i];
        bullet.life -= dt;
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        if (
          bullet.life <= 0 ||
          bullet.x < -80 ||
          bullet.x > this.worldWidth + 80 ||
          bullet.y < -80 ||
          bullet.y > this.worldHeight + 80
        ) {
          this.bullets.splice(i, 1);
          continue;
        }

        let hitIndex = -1;
        for (let z = 0; z < this.zombies.length; z += 1) {
          const zombie = this.zombies[z];
          const d = distance(bullet.x, bullet.y, zombie.x, zombie.y);
          if (d <= bullet.radius + zombie.radius) {
            hitIndex = z;
            break;
          }
        }

        if (hitIndex !== -1) {
          const zombie = this.zombies[hitIndex];
          zombie.hp -= bullet.damage;
          zombie.flash = 0.12;
          spawnBurst(
            this.particles,
            bullet.x,
            bullet.y,
            [bullet.color, bullet.glow, "#ffffff"],
            8,
            60,
            170,
            0.18,
            0.45,
            2,
            4,
          );
          this.bullets.splice(i, 1);
          if (zombie.hp <= 0) {
            this.score += zombie.score;
            this.kills += 1;
            spawnBurst(
              this.particles,
              zombie.x,
              zombie.y,
              [zombie.body, zombie.glow, "#ffffff"],
              16,
              70,
              220,
              0.24,
              0.72,
              2,
              4,
              "star",
            );
            if (Math.random() < 0.16) {
              this.spawnPickup(zombie.x, zombie.y);
            }
            this.zombies.splice(hitIndex, 1);
          }
        }
      }

      for (let i = this.zombies.length - 1; i >= 0; i -= 1) {
        const zombie = this.zombies[i];
        const vec = normalizeVector(this.player.x - zombie.x, this.player.y - zombie.y);
        zombie.vx = vec.x * zombie.speed;
        zombie.vy = vec.y * zombie.speed;
        zombie.x += zombie.vx * dt;
        zombie.y += zombie.vy * dt;
        zombie.angle = Math.atan2(zombie.vy, zombie.vx);
        zombie.flash = Math.max(0, zombie.flash - dt * 2.4);
        zombie.biteCooldown -= dt;

        const d = distance(zombie.x, zombie.y, this.player.x, this.player.y);
        if (d <= zombie.radius + this.player.r + 2 && zombie.biteCooldown <= 0 && this.player.invuln <= 0) {
          this.player.health -= zombie.damage;
          this.player.invuln = 0.36;
          zombie.biteCooldown = 0.54;
          this.player.flash = 1;
          this.pushBanner("They are closing in!", 0.85);
          spawnBurst(
            this.particles,
            this.player.x,
            this.player.y,
            ["#ff7ea8", "#ff9b5f", "#ffffff"],
            10,
            50,
            180,
            0.2,
            0.55,
            2,
            4,
          );
        }
      }

      for (let i = this.pickups.length - 1; i >= 0; i -= 1) {
        const pickup = this.pickups[i];
        pickup.pulse += dt * 4;
        if (distance(pickup.x, pickup.y, this.player.x, this.player.y) <= pickup.r + this.player.r) {
          this.player.health = Math.min(100, this.player.health + 22);
          this.pickups.splice(i, 1);
          this.pushBanner("Medkit grabbed.", 1);
          spawnBurst(
            this.particles,
            pickup.x,
            pickup.y,
            ["#ff7ea8", "#ffffff", "#7ff6ff"],
            10,
            40,
            120,
            0.24,
            0.56,
            2,
            4,
          );
        }
      }

      if (this.player.health <= 0) {
        this.finished = true;
        this.finishedReason = "lose";
      }

      if (this.timeLeft <= 0 && !this.finished) {
        this.finished = true;
        this.finishedReason = "win";
      }
    }

    updateParticles(this.particles, dt);
  }

  draw(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, this.viewHeight);
    bg.addColorStop(0, "#0b1632");
    bg.addColorStop(0.42, "#1e1d52");
    bg.addColorStop(1, "#070b13");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const nightGlow = ctx.createRadialGradient(980, 100, 20, 980, 100, 240);
    nightGlow.addColorStop(0, "rgba(102, 229, 255, 0.22)");
    nightGlow.addColorStop(0.5, "rgba(255, 127, 168, 0.12)");
    nightGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nightGlow;
    ctx.beginPath();
    ctx.arc(980, 100, 240, 0, TAU);
    ctx.fill();

    const stars = [
      [88, 76],
      [164, 122],
      [310, 54],
      [520, 86],
      [710, 36],
      [930, 142],
      [1110, 68],
      [1176, 154],
    ];
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (const [sx, sy] of stars) {
      const twinkle = 0.75 + Math.sin(this.time * 2 + sx * 0.04) * 0.22;
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const moonGlow = ctx.createRadialGradient(1064, 110, 10, 1064, 110, 84);
    moonGlow.addColorStop(0, "rgba(255, 241, 168, 0.96)");
    moonGlow.addColorStop(0.7, "rgba(255, 241, 168, 0.2)");
    moonGlow.addColorStop(1, "rgba(255, 241, 168, 0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(1064, 110, 84, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff4c6";
    ctx.beginPath();
    ctx.arc(1064, 110, 34, 0, TAU);
    ctx.fill();

    const distantSkyline = ctx.createLinearGradient(0, 0, 0, 460);
    distantSkyline.addColorStop(0, "#12234a");
    distantSkyline.addColorStop(1, "#232957");
    ctx.fillStyle = distantSkyline;
    for (const building of this.buildings) {
      const x = building.x - this.cameraX * 0.2;
      const y = 430;
      ctx.fillStyle = building.color;
      ctx.fillRect(x, y - building.h, building.w, building.h);
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      for (let row = 0; row < building.windows; row += 1) {
        for (let col = 0; col < 2; col += 1) {
          if ((row + col + building.x) % 3 === 0) {
            ctx.fillRect(x + 14 + col * 20, y - building.h + 18 + row * 22, 10, 12);
          }
        }
      }
      ctx.fillStyle = "rgba(102, 229, 255, 0.05)";
      ctx.fillRect(x, y - building.h, building.w, 12);
    }

    ctx.fillStyle = "#101b34";
    ctx.fillRect(0, 1180, this.worldWidth, 220);
    ctx.fillStyle = "#20314b";
    ctx.fillRect(0, 1230, this.worldWidth, 50);

    // Ground layer.
    const ground = ctx.createLinearGradient(0, 1140, 0, 1600);
    ground.addColorStop(0, "#296056");
    ground.addColorStop(1, "#102724");
    ctx.fillStyle = ground;
    ctx.fillRect(0, 1180, this.worldWidth, 420);

    for (let i = 0; i < 26; i += 1) {
      const baseX = i * 96 + (this.cameraX * 0.35) % 96;
      ctx.fillStyle = i % 2 === 0 ? "#2f6357" : "#1e483f";
      ctx.fillRect(baseX, 1180 + (i % 3) * 8, 50, 420);
    }

    // Decorative props.
    for (const prop of this.props) {
      const x = prop.x - this.cameraX * 0.55;
      const y = prop.y - this.cameraY * 0.4;
      if (prop.type === "building") {
        ctx.fillStyle = prop.tint;
        drawRoundRect(ctx, x, y - prop.h, prop.w, prop.h, 10);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (let w = 0; w < 3; w += 1) {
          ctx.fillRect(x + 14 + w * 24, y - prop.h + 18, 10, prop.h - 36);
        }
      } else if (prop.type === "lamp") {
        ctx.fillStyle = prop.tint;
        ctx.fillRect(x, y - prop.h, 6, prop.h);
        ctx.fillStyle = "#ffeab7";
        ctx.beginPath();
        ctx.arc(x + 3, y - prop.h - 8, 7, 0, TAU);
        ctx.fill();
        const glow = ctx.createRadialGradient(x + 3, y - prop.h - 8, 4, x + 3, y - prop.h - 8, 42);
        glow.addColorStop(0, "rgba(255, 220, 120, 0.9)");
        glow.addColorStop(1, "rgba(255, 220, 120, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 3, y - prop.h - 8, 42, 0, TAU);
        ctx.fill();
      } else if (prop.type === "barrel") {
        ctx.fillStyle = prop.tint;
        drawRoundRect(ctx, x - 11, y - prop.h, 22, prop.h, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x - 11, y - prop.h + 10, 22, 4);
      } else {
        ctx.strokeStyle = prop.tint;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - prop.h / 2);
        ctx.lineTo(x + prop.w, y - prop.h / 2);
        ctx.stroke();
        ctx.fillStyle = prop.tint;
        ctx.fillRect(x, y - prop.h / 2 - 4, 4, 14);
        ctx.fillRect(x + prop.w - 4, y - prop.h / 2 - 4, 4, 14);
      }
    }

    // Play space.
    const playGround = ctx.createLinearGradient(0, 720, 0, 1600);
    playGround.addColorStop(0, "#2a3555");
    playGround.addColorStop(1, "#0a0d18");
    ctx.fillStyle = playGround;
    ctx.fillRect(0, 720, this.worldWidth, 880);

    for (let i = 0; i < 54; i += 1) {
      const px = (i * 54 + this.time * 10) % (this.worldWidth + 100) - 50;
      const py = 750 + (i % 8) * 34;
      ctx.fillStyle = i % 3 === 0 ? "#324279" : "#232c55";
      ctx.beginPath();
      ctx.arc(px, py, 1.8 + (i % 2) * 0.6, 0, TAU);
      ctx.fill();
    }

    for (const pickup of this.pickups) {
      const pulse = 1 + Math.sin(this.time * 5 + pickup.pulse) * 0.14;
      const x = pickup.x - this.cameraX;
      const y = pickup.y - this.cameraY;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(pulse, pulse);
      const glow = ctx.createRadialGradient(0, 0, 6, 0, 0, 42);
      glow.addColorStop(0, "rgba(255, 127, 168, 0.95)");
      glow.addColorStop(1, "rgba(255, 127, 168, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ff7ea8";
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-3, -8, 6, 16);
      ctx.fillRect(-8, -3, 16, 6);
      ctx.restore();
    }

    for (const zombie of this.zombies) {
      this.drawZombie(ctx, zombie);
    }
    for (const bullet of this.bullets) {
      this.drawBullet(ctx, bullet);
    }
    this.drawPlayer(ctx);
    drawParticles(ctx, this.particles);

    ctx.restore();
  }

  drawZombie(ctx, zombie) {
    const bob = Math.sin(this.time * 9 + zombie.x * 0.03) * 2.4;
    const sway = Math.sin(this.time * 4 + zombie.y * 0.02) * 0.12;
    const walk = Math.sin(this.time * 10 + zombie.x * 0.04 + zombie.y * 0.02);
    ctx.save();
    ctx.translate(zombie.x - this.cameraX, zombie.y - this.cameraY + bob);
    ctx.rotate(zombie.angle + sway);
    ctx.shadowColor = zombie.glow;
    ctx.shadowBlur = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 14, zombie.radius * 0.95, 8, 0, 0, TAU);
    ctx.fill();

    if (zombie.type === "brute") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(2, -10, 14, 0, TAU);
      ctx.fill();

      ctx.fillStyle = zombie.body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 18, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#6f3529";
      drawRoundRect(ctx, -18, -12, 34, 26, 12);
      ctx.fill();
      ctx.fillStyle = zombie.accent;
      drawRoundRect(ctx, -22, -14, 16, 18, 8);
      ctx.fill();
      drawRoundRect(ctx, 6, -14, 16, 18, 8);
      ctx.fill();
      ctx.fillStyle = "#fff1b0";
      ctx.beginPath();
      ctx.arc(14, -6, 13, 0, TAU);
      ctx.fill();
      ctx.fillStyle = zombie.eye;
      ctx.beginPath();
      ctx.arc(11, -8, 3.4, 0, TAU);
      ctx.arc(17, -8, 3.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffe39d";
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#3b271d";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-12, 2 + walk * 1.8);
      ctx.lineTo(-22, 12 - walk * 2.2);
      ctx.moveTo(10, 2 - walk * 1.8);
      ctx.lineTo(22, 12 + walk * 2.2);
      ctx.stroke();
      ctx.strokeStyle = "#201715";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.lineTo(-10, 24 + walk * 2.4);
      ctx.moveTo(8, 10);
      ctx.lineTo(10, 24 - walk * 2.4);
      ctx.stroke();
    } else if (zombie.type === "runner") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(0, -11, 12, 0, TAU);
      ctx.fill();

      ctx.fillStyle = zombie.body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#18324f";
      drawRoundRect(ctx, -10, -8, 20, 18, 8);
      ctx.fill();
      ctx.fillStyle = zombie.accent;
      drawRoundRect(ctx, -9, -14, 18, 7, 4);
      ctx.fill();
      ctx.fillStyle = "#d8fffc";
      ctx.beginPath();
      ctx.arc(12, -6, 8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = zombie.eye;
      ctx.beginPath();
      ctx.arc(15, -8, 2.7, 0, TAU);
      ctx.arc(17, -4, 2.7, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#1c547f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 1 + walk * 3.8);
      ctx.lineTo(-20, 8 - walk * 2.8);
      ctx.moveTo(10, 1 - walk * 3.8);
      ctx.lineTo(20, 8 + walk * 2.8);
      ctx.moveTo(-5, 8);
      ctx.lineTo(-8, 20 + walk * 3.8);
      ctx.moveTo(5, 8);
      ctx.lineTo(8, 20 - walk * 3.8);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(0, -12, 11, 0, TAU);
      ctx.fill();

      ctx.fillStyle = zombie.body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 14, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#17364a";
      drawRoundRect(ctx, -12, -10, 24, 24, 10);
      ctx.fill();
      ctx.fillStyle = zombie.accent;
      ctx.beginPath();
      ctx.arc(12, -5, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fef7cf";
      ctx.beginPath();
      ctx.arc(15, -6, 2.6, 0, TAU);
      ctx.arc(17, -2, 2.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = zombie.eye;
      ctx.beginPath();
      ctx.arc(-4, -6, 2.8, 0, TAU);
      ctx.arc(0, -3, 2.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#b83f56";
      drawRoundRect(ctx, 2, -14, 10, 4, 2);
      ctx.fill();
      ctx.strokeStyle = "#2d5b42";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, 0 + walk * 1.8);
      ctx.lineTo(-18, 12 - walk * 2);
      ctx.moveTo(8, 0 - walk * 1.8);
      ctx.lineTo(18, 12 + walk * 2);
      ctx.stroke();
      ctx.strokeStyle = "#1f2f46";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(-8, 22 + walk * 2.4);
      ctx.moveTo(6, 10);
      ctx.lineTo(8, 22 - walk * 2.4);
      ctx.stroke();
    }
    if (zombie.flash > 0) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, zombie.radius + 5, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBullet(ctx, bullet) {
    const pulse = 1 + Math.sin(this.time * 18 + bullet.x * 0.03) * 0.08;
    ctx.save();
    ctx.translate(bullet.x - this.cameraX, bullet.y - this.cameraY);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = bullet.glow;
    ctx.shadowBlur = 16;
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(0, 0, bullet.radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawPlayer(ctx) {
    const x = this.player.x - this.cameraX;
    const y = this.player.y - this.cameraY;
    const angle = this.lastAimAngle;
    const flash = this.player.flash;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "#66e5ff";
    ctx.shadowBlur = 12;

    const cone = ctx.createLinearGradient(0, 0, Math.cos(angle) * 120, Math.sin(angle) * 120);
    cone.addColorStop(0, "rgba(255, 245, 180, 0.28)");
    cone.addColorStop(1, "rgba(255, 245, 180, 0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle - 0.35) * 140, Math.sin(angle - 0.35) * 140);
    ctx.lineTo(Math.cos(angle + 0.35) * 140, Math.sin(angle + 0.35) * 140);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = flash > 0.4 ? "#ffffff" : "#7ff6ff";
    ctx.beginPath();
    ctx.arc(0, 0, this.player.r + (flash > 0 ? 2 : 0), 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#16304b";
    ctx.beginPath();
    ctx.arc(4, -2, 9, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#fef0c8";
    ctx.beginPath();
    ctx.arc(-3, -6, 4, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#ff7ea8";
    drawRoundRect(ctx, -12, -6, 24, 22, 8);
    ctx.fill();

    ctx.fillStyle = "#ffd36c";
    drawRoundRect(ctx, -16, 6, 14, 12, 5);
    ctx.fill();

    ctx.fillStyle = "#1f3552";
    drawRoundRect(ctx, 10, -5, 16, 6, 3);
    ctx.fill();

    ctx.fillStyle = "#66e5ff";
    drawRoundRect(ctx, 24, -4, 4, 4, 2);
    ctx.fill();

    ctx.fillStyle = "#0a1020";
    ctx.fillRect(-6, 18, 12, 22);
    ctx.fillRect(-16, 34, 10, 8);
    ctx.fillRect(6, 34, 10, 8);
    ctx.restore();
  }

  getStats() {
    return [
      String(this.score),
      String(Math.max(0, Math.ceil(this.player.health))),
      formatTime(this.timeLeft),
    ];
  }

  getStatusText() {
    if (this.bannerTimer > 0) {
      return this.banner;
    }
    if (this.finished) {
      return this.finishedReason === "win"
        ? "You survived until dawn."
        : "The swarm caught you.";
    }
    return `${this.meta.status} ${formatTime(this.timeLeft)} left.`;
  }

  getOverlayState() {
    if (!this.finished) {
      return null;
    }
    if (this.finishedReason === "win") {
      return {
        kicker: "Victory",
        title: "You survived until dawn.",
        copy: `Final score: ${this.score}. You kept the street clear long enough to see the sun.`,
      };
    }
    return {
      kicker: "Game over",
      title: "The swarm caught you.",
      copy: `You were only a few moments away from dawn. Final score: ${this.score}.`,
    };
  }

  getSecondaryActionLabel() {
    return null;
  }
}

const games = {
  platformer: new PlatformerGame(),
  tower: new TowerDefenseGame(),
  zombie: new ZombieShooterGame(),
};

let activeGameId = "platformer";
let activeGame = games[activeGameId];
let viewWidth = 0;
let viewHeight = 0;

function renderControls(gameId) {
  const controls = GAME_DEFS[gameId].controls;
  controlsCopyEl.innerHTML = `<ul>${controls
    .map((control) => `<li>${control}</li>`)
    .join("")}</ul>`;
}

function renderSpecialPanel() {
  specialPanelEl.innerHTML = `
    <p class="support-copy">${GAME_DEFS[activeGameId].special}</p>
  `;
}

function renderTowerShop() {
  if (!towerShopPanelEl) {
    return;
  }

  if (activeGameId !== "tower") {
    towerShopPanelEl.classList.add("hidden");
    towerShopPanelEl.innerHTML = "";
    return;
  }

  const selected = activeGame.selectedTowerType;
  towerShopPanelEl.classList.remove("hidden");
  towerShopPanelEl.innerHTML = `
    <div class="tower-rail-header">
      <p class="eyebrow">Tower Shop</p>
      <p class="tower-rail-copy">Buy a tower, then click anywhere on the battlefield to place it.</p>
    </div>
    <div class="tower-loadout">
      ${Object.entries(TOWER_TYPES)
        .map(
          ([key, type]) => `
            <button
              type="button"
              class="tower-chip tower-chip--${key} ${selected === key ? "is-active" : ""}"
              data-tower="${key}"
              aria-pressed="${selected === key}"
              aria-label="${type.label}, ${type.cost} dollars, ${type.short}"
              title="${type.short}"
              style="--tower-accent: ${type.color}; --tower-glow: ${type.glow}; --tower-body: ${type.body}; --tower-label: ${type.color};"
            >
              <span class="tower-chip-icon tower-chip-icon--${key}" aria-hidden="true">
                <span class="tower-chip-icon-character"></span>
                <span class="tower-chip-icon-effect"></span>
              </span>
              <strong>${type.label}</strong>
              <span class="tower-chip-cost">$${type.cost}</span>
              <span class="tower-chip-short">${type.short}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function updateSelectionUI() {
  document.querySelectorAll("[data-select]").forEach((button) => {
    const isActive = button.dataset.select === activeGameId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll(".game-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.select === activeGameId);
  });

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.select === activeGameId);
  });
}

function updateCanvasCursor() {
  canvas.style.cursor = GAME_DEFS[activeGameId].cursor;
}

function syncHud() {
  const state = activeGame.getUiState ? activeGame.getUiState() : null;
  const title = state?.title ?? GAME_DEFS[activeGameId].title;
  const summary = state?.summary ?? GAME_DEFS[activeGameId].summary;
  const status = state?.status ?? GAME_DEFS[activeGameId].status;
  const statLabels = state?.statLabels ?? GAME_DEFS[activeGameId].statLabels;
  const statValues = state?.statValues ?? ["0", "0", "0"];
  const secondaryActionLabel = state?.secondaryActionLabel ?? GAME_DEFS[activeGameId].secondaryActionLabel;
  const overlayState = state?.overlay ?? null;

  gameTitleEl.textContent = title;
  gameSummaryEl.textContent = summary;
  gameStatusEl.textContent = status;

  for (let i = 0; i < 3; i += 1) {
    statLabelEls[i].textContent = statLabels[i];
    statValueEls[i].textContent = statValues[i];
  }

  secondaryActionButton.textContent = secondaryActionLabel || "";
  secondaryActionButton.classList.toggle("hidden", !secondaryActionLabel);

  if (overlayState) {
    overlay.classList.remove("hidden");
    overlayKicker.textContent = overlayState.kicker;
    overlayTitle.textContent = overlayState.title;
    overlayCopy.textContent = overlayState.copy;
  } else {
    overlay.classList.add("hidden");
  }
}

function updatePlayLayoutState() {
  if (playSectionEl) {
    playSectionEl.dataset.activeGame = activeGameId;
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  viewWidth = rect.width;
  viewHeight = rect.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  activeGame.resize(viewWidth, viewHeight);
}

function setActiveGame(gameId, shouldReset = true) {
  if (!games[gameId]) {
    return;
  }

  activeGameId = gameId;
  activeGame = games[gameId];
  if (shouldReset) {
    activeGame.reset();
  }

  input.keys.clear();
  input.justPressed.clear();
  input.justReleased.clear();
  input.pointer.down = false;
  input.pointer.pressed = false;
  input.pointer.released = false;

  updateSelectionUI();
  updateCanvasCursor();
  updatePlayLayoutState();
  resizeCanvas();
  renderControls(gameId);
  renderSpecialPanel();
  renderTowerShop();
  syncHud();
}

function restartCurrentGame() {
  activeGame.reset();
  renderSpecialPanel();
  renderTowerShop();
  syncHud();
}

document.querySelectorAll("[data-select]").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveGame(button.dataset.select);
  });
});

towerShopPanelEl?.addEventListener("click", (event) => {
  const towerButton = event.target.closest("[data-tower]");
  if (!towerButton || activeGameId !== "tower") {
    return;
  }
  activeGame.selectTowerType(towerButton.dataset.tower);
  renderTowerShop();
  syncHud();
});

secondaryActionButton.addEventListener("click", () => {
  activeGame.handleSecondaryAction?.();
  syncHud();
});

restartButton.addEventListener("click", restartCurrentGame);
overlayRestart.addEventListener("click", restartCurrentGame);

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  canvas.setPointerCapture?.(event.pointerId);
  input.pointer.x = event.offsetX;
  input.pointer.y = event.offsetY;
  input.pointer.inside = true;
  input.pointer.down = true;
  input.pointer.pressed = true;
  input.pointer.released = false;
});

canvas.addEventListener("pointermove", (event) => {
  input.pointer.x = event.offsetX;
  input.pointer.y = event.offsetY;
  input.pointer.inside = true;
});

canvas.addEventListener("pointerleave", () => {
  input.pointer.down = false;
  input.pointer.inside = false;
});

window.addEventListener("pointerup", () => {
  if (input.pointer.down) {
    input.pointer.down = false;
    input.pointer.released = true;
  }
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  const key = normalizeKey(event.key);
  const shouldPrevent =
    key === "Space" ||
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "r" ||
    key === "1" ||
    key === "2" ||
    key === "3" ||
    key === "a" ||
    key === "s" ||
    key === "d" ||
    key === "w";

  if (shouldPrevent) {
    event.preventDefault();
  }

  if (!event.repeat && !input.keys.has(key)) {
    input.keys.add(key);
    input.justPressed.add(key);
  }

  if (key === "r") {
    restartCurrentGame();
  }

  if (activeGameId === "tower") {
    if (key === "1") {
      activeGame.selectTowerType("sunburst");
      renderTowerShop();
      syncHud();
    } else if (key === "2") {
      activeGame.selectTowerType("prism");
      renderTowerShop();
      syncHud();
    } else if (key === "3") {
      activeGame.selectTowerType("ember");
      renderTowerShop();
      syncHud();
    }
  }
});

document.addEventListener("keyup", (event) => {
  const key = normalizeKey(event.key);
  input.keys.delete(key);
  input.justReleased.add(key);
});

let lastTime = performance.now();

function loop(timestamp) {
  const dt = clamp((timestamp - lastTime) / 1000, 0, 0.033);
  lastTime = timestamp;

  ctx.clearRect(0, 0, viewWidth, viewHeight);

  if (activeGame.draw) {
    activeGame.update(dt, input);
    activeGame.draw(ctx);
  }

  syncHud();

  input.justPressed.clear();
  input.justReleased.clear();
  input.pointer.pressed = false;
  input.pointer.released = false;

  requestAnimationFrame(loop);
}

window.addEventListener("resize", () => {
  resizeCanvas();
});

window.addEventListener("visibilitychange", () => {
  lastTime = performance.now();
});

PlatformerGame.prototype.getUiState = function getUiState() {
  return {
    title: this.meta.title,
    summary: this.meta.summary,
    status: this.getStatusText(),
    statLabels: this.meta.statLabels,
    statValues: this.getStats(),
    overlay: this.getOverlayState(),
    secondaryActionLabel: this.getSecondaryActionLabel(),
  };
};

TowerDefenseGame.prototype.getUiState = function getUiState() {
  return {
    title: this.meta.title,
    summary: this.meta.summary,
    status: this.getStatusText(),
    statLabels: this.meta.statLabels,
    statValues: this.getStats(),
    overlay: this.getOverlayState(),
    secondaryActionLabel: this.getSecondaryActionLabel(),
  };
};

ZombieShooterGame.prototype.getUiState = function getUiState() {
  return {
    title: this.meta.title,
    summary: this.meta.summary,
    status: this.getStatusText(),
    statLabels: this.meta.statLabels,
    statValues: this.getStats(),
    overlay: this.getOverlayState(),
    secondaryActionLabel: this.getSecondaryActionLabel(),
  };
};

setActiveGame("platformer", false);
requestAnimationFrame(loop);
