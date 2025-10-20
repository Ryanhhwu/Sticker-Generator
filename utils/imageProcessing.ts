
export const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const cropImageToSquare = (imageBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;
            ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
        img.src = imageBase64;
    });
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s, l];
}

export const removeGreenScreenAndResize = (imageBase64: string, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const sourceCanvas = document.createElement('canvas');
            const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
            if (!sourceCtx) return reject(new Error('Could not get source canvas context'));

            sourceCanvas.width = img.width;
            sourceCanvas.height = img.height;
            sourceCtx.drawImage(img, 0, 0);

            const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
            const data = imageData.data;
            const width = sourceCanvas.width;
            const height = sourceCanvas.height;

            const isGreenFlags = new Uint8Array(width * height);
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const index = i / 4;

                const dist = Math.sqrt(Math.pow(r - 0, 2) + Math.pow(g - 255, 2) + Math.pow(b - 0, 2));
                if (dist < 18) {
                    isGreenFlags[index] = 1;
                    continue;
                }

                const [h, s, l] = rgbToHsl(r, g, b);
                if (h >= 60 && h <= 185 && s >= 0.22 && l >= 0.12 && l <= 0.95 && g >= r + 12 && g >= b + 12) {
                    isGreenFlags[index] = 1;
                }
            }

            const backgroundMask = new Uint8Array(width * height);
            const queue: [number, number][] = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                        const index = y * width + x;
                        if (isGreenFlags[index] === 1 && backgroundMask[index] === 0) {
                            queue.push([x, y]);
                            backgroundMask[index] = 1;
                        }
                    }
                }
            }
            
            let head = 0;
            while(head < queue.length) {
                const [x, y] = queue[head++];
                const neighbors = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]];
                for(const [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nIndex = ny * width + nx;
                        if (isGreenFlags[nIndex] === 1 && backgroundMask[nIndex] === 0) {
                            backgroundMask[nIndex] = 1;
                            queue.push([nx, ny]);
                        }
                    }
                }
            }

            for (let i = 0; i < data.length; i += 4) {
                const index = i / 4;
                if (backgroundMask[index] === 1) {
                    data[i + 3] = 0;
                } else {
                    const x = index % width;
                    const y = Math.floor(index / width);
                    let isEdge = false;
                    let neighborIsBgCount = 0;
                    const neighbors = [ [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y], [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1] ];
                    if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                        for(const [nx, ny] of neighbors) {
                            const nIndex = ny * width + nx;
                            if (backgroundMask[nIndex] === 1) {
                                isEdge = true;
                                neighborIsBgCount++;
                            }
                        }
                    }

                    if (isEdge) {
                        let r = data[i];
                        let g = data[i + 1];
                        let b = data[i + 2];
                        if (g > r && g > b) {
                            data[i + 1] = Math.min(g, Math.floor((r + b) * 0.7));
                        }
                        const featherAmount = 1 - (neighborIsBgCount / 8);
                        data[i + 3] = Math.min(255, data[i+3] * featherAmount + 64);
                    }
                }
            }

            sourceCtx.putImageData(imageData, 0, 0);

            let minX = width, minY = height, maxX = -1, maxY = -1;
            const newData = sourceCtx.getImageData(0, 0, width, height).data;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const alpha = newData[(y * width + x) * 4 + 3];
                    if (alpha > 10) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            const contentWidth = maxX - minX + 1;
            const contentHeight = maxY - minY + 1;

            if (contentWidth <= 0 || contentHeight <= 0) {
                const finalCanvasBlank = document.createElement('canvas');
                finalCanvasBlank.width = targetWidth;
                finalCanvasBlank.height = targetHeight;
                resolve(finalCanvasBlank.toDataURL('image/png'));
                return;
            }

            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            if (!finalCtx) return reject(new Error('Could not get final canvas context'));
            
            finalCanvas.width = targetWidth;
            finalCanvas.height = targetHeight;

            const padding = 10;
            const targetContentWidth = targetWidth - padding * 2;
            const targetContentHeight = targetHeight - padding * 2;

            const aspect = contentWidth / contentHeight;
            let drawWidth = targetContentWidth;
            let drawHeight = drawWidth / aspect;

            if (drawHeight > targetContentHeight) {
                drawHeight = targetContentHeight;
                drawWidth = drawHeight * aspect;
            }

            const drawX = (targetWidth - drawWidth) / 2;
            const drawY = (targetHeight - drawHeight) / 2;
            
            finalCtx.drawImage(
                sourceCanvas,
                minX, minY,
                contentWidth, contentHeight,
                drawX, drawY,
                drawWidth, drawHeight
            );
            
            resolve(finalCanvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageBase64;
    });
};
