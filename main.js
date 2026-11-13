const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.style.backgroundColor = "black";

let canvasW = (canvas.width = window.innerWidth);
let canvasH = (canvas.height = window.innerHeight);

const image = new Image();

let imageSize = Math.min(canvasW, canvasH);
let imageX = canvasW / 2 - imageSize / 2;
let imageY = canvasH / 2 - imageSize / 2;

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

const drawImage = () => {
  ctx.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    imageX,
    imageY,
    imageSize,
    imageSize
  );
  pixels = ctx.getImageData(imageX, imageY, imageSize, imageSize);
};

class Particules {
  constructor(color = null) {
    this.radius = 1;
    this.x = Math.random() * (canvasW - this.radius) + this.radius;
    this.y = Math.random() * (0 - canvasH);
    this.vy = Math.random() * (2  -1) + 1;
    this.color = color ?? "rgba(0,0,0,1)";
  }

  draw() {
    ctx.beginPath();
    
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    this.update();
  }

  update() {
    this.y += this.vy;

    if (this.y > canvasH) {
      this.y = 0;
      this.x = Math.random() * canvasW; 
    }
  }
}

const maxParticules = 10000;
const particules = [];

const createParticules = () => {
  for (let i = 0; i < maxParticules; i++) {
    particules.push(new Particules());
  }
};

const checkPixels = () => {
  if (!pixels) return;

  for (let i = 0; i < particules.length; i++) {
    const px = Math.floor(particules[i].x - imageX);
    const py = Math.floor(particules[i].y - imageY);

    if (px >= 0 && px < pixels.width && py >= 0 && py < pixels.height) {
      const index = (py * pixels.width + px) * 4;

      const r = pixels.data[index];
      const g = pixels.data[index + 1];
      const b = pixels.data[index + 2];
      const a = pixels.data[index + 3];

      if (a > 0) {
        particules[i].color = `rgba(${r}, ${g}, ${b}, ${a})`;
      } else {
        
        particules[i].color = "rgba(0,0,0,1)";
      }
    } else {
      particules[i].color = "rgba(0,0,0,1)";

    }
  }
};

const update = () => {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvasW, canvasH);
  
  particules.forEach((particule) => particule.draw());
  checkPixels();
  
  requestAnimationFrame(update);
};

const loadScene = async () => {
  try {
    await loadImage();
    drawImage();
    createParticules();
    update();
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

loadScene();

window.addEventListener("resize", () => {
  canvasW = canvas.width = window.innerWidth;
  canvasH = canvas.height = window.innerHeight;
  imageSize = Math.min(canvasW, canvasH);
  imageX = canvasW / 2 - imageSize / 2;
  imageY = canvasH / 2 - imageSize / 2;
  drawImage();
});
