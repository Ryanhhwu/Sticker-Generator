
import { StickerIdea, TextMode, OutlineStyle, StickerType } from '../types';
import { STYLE_PROMPTS } from '../constants';

export const createEnhancedPrompt = (
    idea: Pick<StickerIdea, 'base' | 'memeText'>,
    styleIds: string[],
    textMode: TextMode,
    textLanguagePrompt: string, // e.g., "Traditional Chinese"
    characterDescription: string,
    outlineStyle: OutlineStyle,
    stickerType: StickerType,
    styleStrength: number,
): string => {
    
    let characterFidelityPrompt: string;
    let styleApplicationPrompt: string;

    switch (styleStrength) {
        case 1: // Most faithful
            characterFidelityPrompt = "**Absolute Priority: Recreate the character from the reference image with MAXIMUM fidelity. Strictly preserve every detail: face, hair, clothing, colors. The style should only be a subtle hint.**";
            styleApplicationPrompt = "Subtly influenced by the style of";
            break;
        case 2:
            characterFidelityPrompt = "**High Priority: Recreate the character from the reference image with HIGH fidelity. All core features must be preserved. The style is secondary to character accuracy.**";
            styleApplicationPrompt = "In the style of";
            break;
        case 4:
            characterFidelityPrompt = "**Use the reference image as strong inspiration. Core features should be recognizable, but allow for significant stylistic interpretation to fit the aesthetic.**";
            styleApplicationPrompt = "In a strong and expressive interpretation of the style of";
            break;
        case 5: // Most stylized
            characterFidelityPrompt = "**The artistic style is the TOP PRIORITY. Use the reference image only as a concept. Freely reinterpret the character to perfectly match the exaggerated and iconic features of the style.**";
            styleApplicationPrompt = "In a dominant and exaggerated version of the style of";
            break;
        case 3: // Balanced (default)
        default:
            characterFidelityPrompt = "**Crucial Instruction: Recreate the character from the provided reference image with HIGH fidelity, balancing it with the chosen style. Preserve core features like face and hairstyle.**";
            styleApplicationPrompt = "In the distinct style of";
    }
    
    let finalStylePrompt;
    if (styleIds.includes('original')) {
        finalStylePrompt = STYLE_PROMPTS['original'];
    } else if (styleIds.length > 1) {
        const combinedPrompts = styleIds.map(id => (STYLE_PROMPTS[id] || '').replace(/\*\*Crucial Fidelity Requirement.*?\*\* /g, '').replace(/\*\*.*?\*\*/g, '')).join(', and ');
        finalStylePrompt = `${styleApplicationPrompt} a harmonious blend of the following styles: ${combinedPrompts}`;
    } else {
        const styleId = styleIds[0] || 'anime';
        const styleCorePrompt = (STYLE_PROMPTS[styleId] || '').replace(/\*\*Crucial Fidelity Requirement.*?\*\* /g, '');
        finalStylePrompt = `${styleApplicationPrompt} ${styleCorePrompt}`;
    }
    
    const characterInfo = characterDescription 
        ? `The character is: ${characterDescription}.` 
        : 'The character is as depicted in the reference image.';
    
    let textInstruction = '';
    if (textMode === 'with_text' && idea.memeText) {
        textInstruction = `The sticker should prominently feature the text "${idea.memeText}" in ${textLanguagePrompt}. The text should be stylish, legible, and integrated with the character's pose and expression.`;
    }

    let outlineInstruction = '';
    switch (outlineStyle) {
        case 'black':
            outlineInstruction = 'The final image MUST have a thick, clean, black outline around the character, suitable for a sticker.';
            break;
        case 'white':
            outlineInstruction = 'The final image MUST have a thick, clean, white outline around the character, suitable for a sticker.';
            break;
        case 'none':
            outlineInstruction = 'The final image should NOT have any artificial sticker-like outline.';
            break;
    }

    const stickerTypeInfo = `This is for a "${stickerType}" type sticker.`;

    let compositionInstruction = `The character should be the central focus with a dynamic and clear pose. The composition must be clean and simple. Ensure the character is fully visible and not cut off. **Absolute Requirement: The main character, as described and shown in references, MUST be the primary subject and clearly visible in the image. Do not generate an image without the character.**
    **Camera Angle:** Use a dynamic and interesting camera angle to make the sticker more expressive. Consider using one of the following: dramatic low-angle shot, cute high-angle shot, dynamic dutch angle, intimate close-up on the face, full-body action shot, or a standard eye-level shot. Vary the angles across different stickers.`;

    if (stickerType === 'emoji') {
        compositionInstruction = `This is for a small emoji. **Focus on a close-up of the character's face, capturing a clear, strong emotion. Alternatively, focus on a specific, expressive part of the character's body (like hands making a gesture). The background must be minimal to non-existent. The character's expression is the MOST IMPORTANT part.** The character must be clearly visible and not cut off.`;
    }

    const prompt = `
        Generate an image for a LINE sticker with a pure solid green background (#00FF00).
        **Adherence to Reference:** ${characterFidelityPrompt}
        **Core Idea:** A character ${idea.base}. The expression and body language MUST be extremely clear, dynamic, and exaggerated to convey the intended emotion effectively.
        **Style:** ${finalStylePrompt}
        **Character Details:** ${characterInfo}
        **Text:** ${textInstruction || 'No text should be included in the image.'}
        **Outline:** ${outlineInstruction}
        **Composition:** ${compositionInstruction}
        **Format:** ${stickerTypeInfo}
    `.replace(/\s+/g, ' ').trim();

    return prompt;
};
