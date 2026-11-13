const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.style.backgroundColor = "black";

const canvasW = canvas.width = window.innerWidth;
const canvasH = canvas.height = window.innerHeight;

const image = new Image();

const imageSize = 600;
const imageX = canvasW / 2 - imageSize / 2;
const imageY = canvasH / 2 - imageSize / 2;

const loadImage = () => {
    return new Promise((resolve, reject) => {
        image.onload = () => {
            console.log("Image loaded !");
            resolve();
        }

        image.onerror = () => {
            console.log("Image load error !");
            reject(new Error("Image load error !"));
        }

        image.src = "alien.png";
    })
}

const drawImage = () => {

    ctx.drawImage(image, 0, 0, image.width, image.height, imageX, imageY, imageSize, imageSize);

}

const checkPixels = () => {
    const pixels = ctx.getImageData(imageX, imageY, imageSize, imageSize);

    for (let y = 0; y < pixels.height; y++) {
        for (let x = 0; x < pixels.width; x++) {

            const index = (y * pixels.width + x) * 4;

            const r = pixels.data[index];
            const g = pixels.data[index + 1];
            const b = pixels.data[index + 2];
            const a = pixels.data[index + 3];

            // if (r < 25) {
            //     pixels.data[index + 3] = 0;
            // }
        }
    }

    ctx.putImageData(pixels, imageX, imageY);
};


const update = () => {
    // ctx.fillStyle = "rgba(0,0,0,0.1)";
    // ctx.clearRect(0, 0, canvasW, canvasH);
    requestAnimationFrame(update);
}


const loadScene = async () => {
    try {
        await loadImage();
        drawImage();
        checkPixels();
        update();
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }

}

loadScene();

window.addEventListener("click", () => {
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
})