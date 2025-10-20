import { StickerIdea, TextMode, OutlineStyle, StickerType } from '../types';
import { STYLE_PROMPTS } from '../constants';

export const createEnhancedPrompt = (
    idea: Pick<StickerIdea, 'base' | 'memeText'>,
    styleId: string,
    textMode: TextMode,
    textLanguagePrompt: string, // e.g., "Traditional Chinese"
    characterDescription: string,
    outlineStyle: OutlineStyle,
    stickerType: StickerType,
): string => {
    
    const stylePrompt = STYLE_PROMPTS[styleId] || '';
    
    const characterInfo = characterDescription 
        ? `The character is: ${characterDescription}.` 
        : 'The character is as depicted in the reference image.';

    const characterFidelityPrompt = "**Crucial Instruction: Recreate the character from the provided reference image with the HIGHEST POSSIBLE FIDELITY. It is essential to strictly preserve all core features, including face shape, hairstyle, clothing, and color scheme. Do not invent new features or alter the existing ones.**";
    
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

    let compositionInstruction = `The character should be the central focus, full-body or half-body, with a dynamic and clear pose. The composition must be clean and simple. Ensure the character is fully visible and not cut off. **Absolute Requirement: The main character, as described and shown in references, MUST be the primary subject and clearly visible in the image. Do not generate an image without the character.**`;

    if (stickerType === 'emoji') {
        compositionInstruction = `This is for a small emoji. **Focus on a close-up of the character's face, capturing a clear, strong emotion. Alternatively, focus on a specific, expressive part of the character's body (like hands making a gesture). The background must be minimal to non-existent. The character's expression is the MOST IMPORTANT part.** The character must be clearly visible and not cut off.`;
    }

    const prompt = `
        Generate an image for a LINE sticker with a pure solid green background (#00FF00).
        **Adherence to Reference:** ${characterFidelityPrompt}
        **Core Idea:** A character ${idea.base}.
        **Style:** ${stylePrompt}
        **Character Details:** ${characterInfo}
        **Text:** ${textInstruction || 'No text should be included in the image.'}
        **Outline:** ${outlineInstruction}
        **Composition:** ${compositionInstruction}
        **Format:** ${stickerTypeInfo}
    `.replace(/\s+/g, ' ').trim();

    return prompt;
};