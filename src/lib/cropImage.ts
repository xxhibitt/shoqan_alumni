export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Calculate bounding box of the rotated image
  const boundingBox = {
    width: image.width,
    height: image.height,
  };

  // set canvas size to match the bounding box
  canvas.width = boundingBox.width;
  canvas.height = boundingBox.height;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(boundingBox.width / 2, boundingBox.height / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using default blend mode
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // Scale down if image is too large (max width 1200px)
  if (canvas.width > 1200) {
    const scale = 1200 / canvas.width;
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = 1200;
    scaledCanvas.height = canvas.height * scale;
    const scaledCtx = scaledCanvas.getContext("2d");
    if (scaledCtx) {
      scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      return new Promise((resolve) => {
        scaledCanvas.toBlob((file) => {
          resolve(file);
        }, "image/jpeg", 0.8);
      });
    }
  }

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg", 0.8);
  });
}
