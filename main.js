const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {
  willReadFrequently: true,
});

canvas.style.backgroundColor = "black";

let canvasW = (canvas.width = window.innerWidth * 0.7);
let canvasH = (canvas.height = window.innerHeight * 0.7);

const image = new Image();

let pixels = null;

const loadImage = () => {
  return new Promise((resolve, reject) => {
    image.onload = () => {
      console.log("Image loaded !");
      resolve();
    };
    image.onerror = () => {
      reject(new Error("Image load error !"));
    };
    image.src = "alien_nobg.png";
  });
};

let ratio = 0;
let offsetX = 0;
let offsetY = 0;

const drawImage = () => {
  ctx.clearRect(0, 0, canvasW, canvasH);

  let hRatio = canvas.width / image.width;
  let vRatio = canvas.height / image.height;
  ratio = Math.min(hRatio, vRatio);

  const newWidth = image.width * ratio;
  const newHeight = image.height * ratio;

  offsetX = canvasW / 2 - newWidth / 2;
  offsetY = canvasH / 2 - newHeight / 2;

  ctx.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    offsetX,
    offsetY,
    newWidth,
    newHeight,
  );

  pixels = ctx.getImageData(offsetX, offsetY, newWidth, newHeight);
};

class Particules {
  constructor() {
    this.radius = 1;
    this.x = Math.random() * (canvasW - this.radius) + this.radius;
    this.y = Math.random() * -canvasH;
    this.speed = Math.random() * (100 - 50) + 50;
    this.vy = 0;
    this.vx = 0;
    this.color = null;
    this.defaultColor = "rgba(21, 45, 124, 0.84)";
    this.lastTime = performance.now();
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  update(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.vy += this.speed * deltaTime;

    this.y += this.vy * deltaTime;
    this.x += this.vx * deltaTime;

    if (this.y > canvasH) {
      this.y = -this.radius;
      this.vy = 0;
      this.x = Math.random() * canvasW;
    }
  }
}

const maxParticules = 5000;
const particules = [];

const createParticules = () => {
  for (let i = 0; i < maxParticules; i++) {
    particules.push(new Particules());
  }
};

const checkPixels = () => {
  if (!pixels) return;

  for (let i = 0; i < particules.length; i++) {
    const px = Math.floor(particules[i].x - offsetX);
    const py = Math.floor(particules[i].y - offsetY);

    if (px >= 0 && px < pixels.width && py >= 0 && py < pixels.height) {
      const index = (py * pixels.width + px) * 4;
      const r = pixels.data[index];
      const g = pixels.data[index + 1];
      const b = pixels.data[index + 2];
      const a = pixels.data[index + 3];

      if (a > 0) {
        particules[i].color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        particules[i].vy *= 0.99;
      } else {
        particules[i].color = particules[i].defaultColor;
      }
    } else {
      particules[i].color = particules[i].defaultColor;
    }
  }
};

const update = (timestamp) => {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  checkPixels();
  particules.forEach((particule) => {
    particule.update(timestamp);
    particule.draw();
  });

  requestAnimationFrame(update);
};

const loadScene = async () => {
  try {
    await loadImage();
    drawImage();
    createParticules();
    update(performance.now());
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

loadScene();

window.addEventListener("resize", () => {
  canvasW = canvas.width = window.innerWidth;
  canvasH = canvas.height = window.innerHeight;
  drawImage();
});
