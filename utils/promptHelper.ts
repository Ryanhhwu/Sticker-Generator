
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
    
    let referenceInstruction: string;
    let stylePriorityInstruction: string;
    let structuralInstruction: string;

    // Dynamic Prompting based on Strength
    // Strength 1: Image > Style (Fix line art, change only texture/color slightly)
    // Strength 5: Style > Image (Redesign character, change proportions/lines to fit style)
    switch (styleStrength) {
        case 1: // Maximum Fidelity
            referenceInstruction = "**REFERENCE IMAGE AUTHORITY: ABSOLUTE.** You MUST strictly trace the provided character image. Do NOT change the body proportions, facial structure, or line work style. Only apply the requested style as a subtle coloring or texture filter.";
            stylePriorityInstruction = "Style Application: Very Subtle. Keep the original drawing style dominant.";
            structuralInstruction = "Structure: Identical to reference.";
            break;
        case 2: // High Fidelity
            referenceInstruction = "**REFERENCE IMAGE AUTHORITY: HIGH.** Preserve the character's exact facial features and body shape. You may slightly adjust the shading to match the style, but the character must look exactly like the upload.";
            stylePriorityInstruction = "Style Application: Moderate. The character should look like the original drawing processed in this style.";
            structuralInstruction = "Structure: Preserve original proportions.";
            break;
        case 4: // High Stylization
            referenceInstruction = "**REFERENCE IMAGE AUTHORITY: CONCEPT ONLY.** Use the uploaded image ONLY as a reference for the character's species, colors, and accessories. **IGNORE the original art style.**";
            stylePriorityInstruction = "Style Application: DOMINANT. You MUST redraw the character to fit the requested artistic style perfectly. Change the line weight, shading method, and eyes to match the art style.";
            structuralInstruction = "Structure: Adapt character proportions to the art style (e.g., if the style is Chibi, make the head big; if Realistic, make it anatomical).";
            break;
        case 5: // Maximum Stylization
            referenceInstruction = "**REFERENCE IMAGE AUTHORITY: LOOSE.** The uploaded image is merely a color palette suggestion. **COMPLETELY RE-IMAGINE** the character in the requested style.";
            stylePriorityInstruction = "Style Application: EXTREME. The final image MUST look 100% like the requested art style. If the style conflicts with the original image's look, the STYLE WINS. Override original lines, textures, and anatomy.";
            structuralInstruction = "Structure: Fully transform the character's geometry to match the aesthetic (e.g., turn a photo into a flat icon, or a cartoon into a 3D render).";
            break;
        case 3: // Balanced (Default)
        default:
            referenceInstruction = "**REFERENCE IMAGE AUTHORITY: BALANCED.** Keep the character recognizable (same eyes, hair, accessories) but adapt the drawing technique (lines, coloring) to the target style.";
            stylePriorityInstruction = "Style Application: Balanced. Merge the character's identity with the artistic technique.";
            structuralInstruction = "Structure: Slight adaptation allowed to fit the style.";
    }
    
    let finalStylePrompt;
    if (styleIds.includes('original')) {
        finalStylePrompt = STYLE_PROMPTS['original'];
        // Override instructions for original style
        referenceInstruction = "**REFERENCE IMAGE AUTHORITY: ABSOLUTE.** Reproduce the character exactly as seen.";
        stylePriorityInstruction = "No style alteration.";
    } else if (styleIds.length > 1) {
        const combinedPrompts = styleIds.map(id => (STYLE_PROMPTS[id] || '')).join(' \n\n + ');
        finalStylePrompt = `
        **HYBRID STYLE INSTRUCTION:**
        Create a unique FUSION of the following art styles. Seamlessly blend the key visual elements, textures, and techniques of these styles together into a cohesive look. Do not separate them.
        
        The styles to blend are:
        ${combinedPrompts}
        `;
    } else {
        const styleId = styleIds[0] || 'anime';
        finalStylePrompt = STYLE_PROMPTS[styleId] || '';
    }
    
    const characterInfo = characterDescription 
        ? `Character Concept: ${characterDescription}.` 
        : 'Character Concept: As depicted in the reference image.';
    
    let textInstruction = '';
    if (textMode === 'with_text' && idea.memeText) {
        textInstruction = `**TEXT REQUIREMENT:** The sticker MUST include the text "${idea.memeText}" in ${textLanguagePrompt}. The text should be graphical, stylish, and integrated into the composition.`;
    }

    let outlineInstruction = '';
    let segmentationInstruction = '';

    switch (outlineStyle) {
        case 'black':
            outlineInstruction = 'Outline: Bold, continuous BLACK outline around the character.';
            segmentationInstruction = '**Segmentation Strategy:** Include the outline. Keep the stroke. Ensure the complete character silhouette is distinct.';
            break;
        case 'white':
            outlineInstruction = 'Outline: Thick, clean WHITE sticker border around the character.';
            segmentationInstruction = '**Segmentation Strategy:** Die-cut style. Keep the border. Treat the white border as part of the subject.';
            break;
        case 'none':
            outlineInstruction = 'Outline: NO artificial outline. Natural edges only.';
            segmentationInstruction = '**Segmentation Strategy:** Pixel-perfect segmentation. Hard cut edges. Do not fade into background.';
            break;
    }

    const stickerTypeInfo = `Format: This is a "${stickerType}" sticker.`;
    const isThreeView = idea.base.toLowerCase().includes('three views') || idea.base.toLowerCase().includes('reference sheet');

    let compositionInstruction = `**Composition:** The character must be the sole central focus. Dynamic pose. Full visibility.`;

    if (stickerType === 'emoji') {
        compositionInstruction = `**Composition:** ZOOM IN CLOSE-UP. Focus primarily on the face and expression. Minimal background. High readability at small sizes.`;
    } else if (isThreeView) {
        compositionInstruction = `**Composition:** Character Reference Sheet. Front, Side, and Back views arranged horizontally. Neutral pose. FULL BODY VISIBILITY. Ensure distinct separation between views.`;
    }

    // Incorporating the "Universal Core Logic" for segmentation
    const isolationLogic = `
    **Output Requirements:**
    1. **Background:** PURE SOLID GREEN (#00FF00) HEX COLOR. No gradients, no shadows on background.
    2. **Isolation:** The character must be cleanly separated from the green background.
    3. **Cutline:** The outermost contour is the cutline.
    `;

    // Reordering prompt for better LLM attention: Style & Task first, then Reference Constraints.
    const prompt = `
        **TASK:** Generate a high-quality LINE sticker illustration.
        
        **TARGET STYLE:**
        ${finalStylePrompt}
        ${stylePriorityInstruction}
        
        **CHARACTER & ACTION:**
        ${characterInfo}
        **Action/Pose:** ${idea.base}.
        ${!isThreeView ? 'Make the action EXAGGERATED and DYNAMIC.' : 'Neutral pose.'}
        ${structuralInstruction}

        **REFERENCE CONSTRAINTS:**
        ${referenceInstruction}

        **TECHNICAL SPECS:**
        ${outlineInstruction}
        ${textInstruction || 'NO TEXT in the image.'}
        ${stickerTypeInfo}
        ${compositionInstruction}
        ${segmentationInstruction}
        ${isolationLogic}
    `.replace(/\s+/g, ' ').trim();

    return prompt;
};
