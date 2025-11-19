
export type Language = 'zh-Hant' | 'en' | 'ja';
export type Theme = 'light' | 'dark';
export type View = 'upload_style' | 'ideas' | 'results' | 'export' | 'complete';
export type StickerType = 'static' | 'message' | 'custom' | 'big' | 'emoji';
export type OutlineStyle = 'black' | 'white' | 'none';
export type TextMode = 'none' | 'with_text';

export interface UploadedImage {
  base64: string;
  name: string;
}

export interface StickerIdea {
  id: string;
  text: string;
  base: string;
  memeText: string;
}

export interface GeneratedSticker {
  id: string; // Corresponds to StickerIdea id
  originalSrc: string | null; // The raw, green-screened image from the API
  displaySrc: string | null; // The processed, resized, transparent image for UI
  prompt: string;
  isGenerating: boolean;
  hashtags: string[];
}

export interface EditingStickerInfo {
  id: string;
  src: string; // The base64 source of the image to be edited
  prompt: string; // The original prompt, for reference
}

export interface EditingIdeaInfo {
  id: string;
  text: string;
}

// FIX: Added missing AssistantMessage type.
export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  stickerId?: string;
}
