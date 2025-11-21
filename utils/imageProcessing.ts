
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
            
            // Pass 1: Global Green Mask Generation
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const index = i / 4;

                // --- White/Outline Protection ---
                // If a pixel is very bright and has low saturation (White/Grey), preserve it immediately.
                // This prevents eating into white sticker borders.
                // L > 0.9 (approx > 230 RGB) and low variance
                if (r > 230 && g > 230 && b > 230 && Math.abs(r - g) < 20 && Math.abs(r - b) < 20) {
                    continue; 
                }

                // --- Green Detection Logic ---
                
                // 1. Exact/Fast Green Check (Euclidean distance to pure green)
                // Target: (0, 255, 0). Dist < 18 is very strict.
                const dist = Math.sqrt(Math.pow(r - 0, 2) + Math.pow(g - 255, 2) + Math.pow(b - 0, 2));
                if (dist < 18) {
                    isGreenFlags[index] = 1;
                    continue;
                }

                // 2. Channel Dominance Check (Crucial)
                // Green must be significantly higher than Red and Blue
                if (!(g > r + 12 && g > b + 12)) {
                    continue; // If not dominant, it's likely part of the subject
                }

                // 3. Loose HSL Check (for textures/shadows on green screen)
                const [h, s, l] = rgbToHsl(r, g, b);
                
                // Hue: 60 - 185 (Green range)
                // Saturation: >= 0.22 (Must have some color)
                // Lightness: 0.12 - 0.95 (Avoid pure black or pure white, though white is handled above)
                if (h >= 60 && h <= 185 && s >= 0.22 && l >= 0.12 && l <= 0.95) {
                    isGreenFlags[index] = 1;
                }
            }
            
            // Pass 2: Execution, Despill & Feathering
            for (let i = 0; i < data.length; i += 4) {
                const index = i / 4;
                
                if (isGreenFlags[index] === 1) {
                    data[i + 3] = 0; // Full transparency
                } else {
                    // Check for Edges (Neighbors that are marked as background)
                    const x = index % width;
                    const y = Math.floor(index / width);
                    let isEdge = false;
                    
                    // Simple 4-neighbor check
                    const neighbors = [
                        index - 1, index + 1, index - width, index + width
                    ];

                    for (const nIdx of neighbors) {
                        if (nIdx >= 0 && nIdx < isGreenFlags.length && isGreenFlags[nIdx] === 1) {
                            isEdge = true;
                            break;
                        }
                    }

                    if (isEdge) {
                        let r = data[i];
                        let g = data[i + 1];
                        let b = data[i + 2];

                        // Despill: If edge pixel is still greenish, neutralize it
                        if (g > r && g > b) {
                            // Replace Green with the average of R and B, or max of R/B to maintain brightness
                            const replacement = Math.max(r, b);
                            data[i + 1] = replacement; 
                        }

                        // Feathering: Soften the alpha of edge pixels
                        // Instead of hard cut (255), reduce to create a 1px blur effect
                        data[i + 3] = 180; 
                    }
                }
            }

            sourceCtx.putImageData(imageData, 0, 0);

            // Cropping and resizing logic
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
            
            // Use high quality image smoothing
            finalCtx.imageSmoothingEnabled = true;
            finalCtx.imageSmoothingQuality = 'high';

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
