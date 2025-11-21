
import { StickerType, Language } from './types';

export const MAX_UPLOAD_COUNT = 3;

export const STICKER_SPECS: Record<string, any> = {
    static: {
        labelKey: 'stickerTypeStatic',
        descKey: 'stickerTypeStaticDesc',
        countOptions: [2, 8, 16, 24, 40],
        width: 370,
        height: 320,
    },
    message: {
        labelKey: 'stickerTypeMessage',
        descKey: 'stickerTypeMessageDesc',
        countOptions: [8, 16, 24],
        width: 370,
        height: 320,
    },
    custom: {
        labelKey: 'stickerTypeCustom',
        descKey: 'stickerTypeCustomDesc',
        countOptions: [8, 16, 24, 40],
        width: 370,
        height: 320,
    },
    big: {
        labelKey: 'stickerTypeBig',
        descKey: 'stickerTypeBigDesc',
        countOptions: [8, 16, 24],
        width: 396,
        height: 660,
    },
    emoji: {
        labelKey: 'stickerTypeEmoji',
        descKey: 'stickerTypeEmojiDesc',
        countOptions: [2, 8, 16, 24, 40],
        width: 180,
        height: 180,
    }
};

export const TEXT_LANGUAGE_OPTIONS_I18N = {
    'zh-Hant': [
        { id: 'english', label: '英文', prompt: 'English' },
        { id: 'chinese_traditional', label: '繁體中文', prompt: 'Traditional Chinese' },
        { id: 'japanese', label: '日文', prompt: 'Japanese' },
        { id: 'korean', label: '韓文', prompt: 'Korean' }
    ],
    'en': [
        { id: 'english', label: 'English', prompt: 'English' },
        { id: 'chinese_traditional', label: 'Traditional Chinese', prompt: 'Traditional Chinese' },
        { id: 'japanese', label: 'Japanese', prompt: 'Japanese' },
        { id: 'korean', label: 'Korean', prompt: 'Korean' }
    ],
    'ja': [
        { id: 'english', label: '英語', prompt: 'English' },
        { id: 'chinese_traditional', label: '繁体字中国語', prompt: 'Traditional Chinese' },
        { id: 'japanese', label: '日本語', prompt: 'Japanese' },
        { id: 'korean', label: '韓国語', prompt: 'Korean' }
    ]
};

export const STYLE_IDS = ['original', 'anime', 'chibi', 'american', 'realistic', 'ink', 'yuji', 'ghibli', 'pixel', 'flat', 'popart', 'neon', 'spongebob', 'ppg', 'adventuretime', 'sketch', 'toy', 'pixar', 'jojo', 'renaissance', 'uscomic', 'murakami', 'simpsons', 'toriyama', 'graffiti', 'minimalist', 'kurosawa', 'steampunk', 'abstract', 'vangogh', 'picasso', 'watercolor', 'picturebook', 'irasutoya', 'ukiyo-e', 'crayon', 'fantasyCg', 'one', 'southPark', 'timBurton', 'arcane'];

export const NO_THREE_VIEW_STYLES = [
    'pixel', 'abstract', 'minimalist', 'crayon', 'graffiti', 
    'vangogh', 'picasso', 'ukiyo-e', 'sketch', 'one', 'southPark', 
    'timBurton', 'irasutoya'
];

export const STYLE_CARD_THUMBNAILS: Record<string, string> = { 
    original: 'https://placehold.co/150x80/BDBDBD/FFFFFF?text=ORIGINAL',
    anime: 'https://placehold.co/150x80/FF4081/FFFFFF?text=ANIME', 
    chibi: 'https://placehold.co/150x80/8BC34A/000000?text=CHIBI', 
    american: 'https://placehold.co/150x80/00BCD4/000000?text=CARTOON', 
    realistic: 'https://placehold.co/150x80/757575/FFFFFF?text=REALISM', 
    ink: 'https://placehold.co/150x80/212121/FFFFFF?text=INK', 
    yuji: 'https://placehold.co/150x80/FFEB3B/000000?text=YUJI', 
    ghibli: 'https://placehold.co/150x80/81C784/FFFFFF?text=GHIBLI', 
    pixel: 'https://placehold.co/150x80/424242/FFD700?text=PIXEL', 
    flat: 'https://placehold.co/150x80/64B5F6/FFFFFF?text=FLAT', 
    popart: 'https://placehold.co/150x80/F44336/FFFFFF?text=POP', 
    neon: 'https://placehold.co/150x80/303F9F/FF00FF?text=CYBERPUNK', 
    spongebob: 'https://placehold.co/150x80/FFF300/000000?text=SPONGEBOB', 
    ppg: 'https://placehold.co/150x80/FF80AB/000000?text=PPG', 
    adventuretime: 'https://placehold.co/150x80/FFD700/000000?text=A.TIME', 
    sketch: 'https://placehold.co/150x80/B0BEC5/000000?text=SKETCH', 
    toy: 'https://placehold.co/150x80/FFCDD2/000000?text=TOY', 
    pixar: 'https://placehold.co/150x80/007bff/FFFFFF?text=PIXAR', 
    jojo: 'https://placehold.co/150x80/FF00FF/00FFFF?text=JOJO', 
    renaissance: 'https://placehold.co/150x80/8B4513/FFFFFF?text=RENAISSANCE', 
    uscomic: 'https://placehold.co/150x80/FF0000/FFFF00?text=COMIC', 
    murakami: 'https://placehold.co/150x80/FF1493/FFFFFF?text=MURAKAMI', 
    simpsons: 'https://placehold.co/150x80/FFD700/000000?text=SIMPSONS', 
    toriyama: 'https://placehold.co/150x80/FFA500/000000?text=TORIYAMA', 
    graffiti: 'https://placehold.co/150x80/000000/00FF00?text=GRAFFITI', 
    minimalist: 'https://placehold.co/150x80/EEEEEE/000000?text=MINIMAL', 
    kurosawa: 'https://placehold.co/150x80/000000/FFFFFF?text=KUROSAWA', 
    steampunk: 'https://placehold.co/150x80/8B4513/FFFFFF?text=STEAMPUNK', 
    abstract: 'https://placehold.co/150x80/FF6347/FFFFFF?text=ABSTRACT', 
    vangogh: 'https://placehold.co/150x80/FFD700/0000FF?text=VAN+GOGH', 
    picasso: 'https://placehold.co/150x80/E2442F/000000?text=PICASSO',
    watercolor: 'https://placehold.co/150x80/A9D2E1/FFFFFF?text=WATERCOLOR',
    picturebook: 'https://placehold.co/150x80/FADCA5/FFFFFF?text=PICTUREBOOK',
    irasutoya: 'https://placehold.co/150x80/FFC0CB/000000?text=IRASUTOYA',
    'ukiyo-e': 'https://placehold.co/150x80/B388FF/FFFFFF?text=UKIYO-E',
    crayon: 'https://placehold.co/150x80/FF69B4/000000?text=CRAYON',
    fantasyCg: 'https://placehold.co/150x80/9C27B0/FFFFFF?text=CG',
    one: 'https://placehold.co/150x80/757575/FFFFFF?text=ONE',
    southPark: 'https://placehold.co/150x80/F44336/FFFFFF?text=S.+PARK',
    timBurton: 'https://placehold.co/150x80/424242/FFFFFF?text=BURTON',
    arcane: 'https://placehold.co/150x80/3F51B5/FFFFFF?text=ARCANE'
};

export const STYLE_DESCRIPTION_IMAGES: Record<string, string> = {
    ...STYLE_CARD_THUMBNAILS,
    original: 'https://i.pinimg.com/1200x/83/b4/0c/83b40c9b85b51752d8b59615d39f2e9c.jpg',
    anime: 'https://i.pinimg.com/1200x/46/a1/aa/46a1aafe3242845ff0733b089ea1092b.jpg',
    chibi: 'https://i.pinimg.com/1200x/87/c3/1a/87c31ae90bbeef71cbe88f0ac37a5e55.jpg',
    american: 'https://i.pinimg.com/736x/8c/6d/db/8c6ddb5fe6600fcc4b183cb2ee228eb7.jpg',
    realistic: 'https://i.pinimg.com/1200x/8a/88/c0/8a88c0152e545699a01b452ef1519857.jpg',
    ink: 'https://i.pinimg.com/1200x/79/23/26/79232608934728ec055cf6d68e37c0d6.jpg',
    yuji: 'https://i.pinimg.com/1200x/23/bc/6f/23bc6ff9754c1373ddd5881cc8ff66a5.jpg',
    ghibli: 'https://i.pinimg.com/736x/4f/6c/73/4f6c739378bb57659083f34fa533f15b.jpg',
    pixel: 'https://i.pinimg.com/736x/fa/e1/2d/fae12d6aa58e363727a5515955892098.jpg',
    flat: 'https://i.pinimg.com/736x/47/2d/e8/472de8412c39ba2dca67e4518d8f4269.jpg',
    popart: 'https://i.pinimg.com/1200x/5d/a6/46/5da646a179e1e1d31cad2c90185be045.jpg',
    neon: 'https://i.pinimg.com/736x/70/47/89/7047897f18d8eb2b1a7bcf75af1b3adf.jpg',
    spongebob: 'https://i.pinimg.com/1200x/a7/c3/75/a7c3754996434cec42f5755275fbf2a1.jpg',
    ppg: 'https://i.pinimg.com/736x/99/6e/73/996e7375adb5526482d0f7ec87a0ebb9.jpg',
    adventuretime: 'https://i.pinimg.com/1200x/6e/10/3d/6e103d459a69ca74617b346f65119fee.jpg',
    sketch: 'https://i.pinimg.com/736x/02/88/8c/02888cd09f3b88f1df6915b5044ff7df.jpg',
    toy: 'https://i.pinimg.com/736x/24/48/bd/2448bdf732b89da3c77d73597bf50154.jpg',
    pixar: 'https://i.pinimg.com/736x/36/9d/9a/369d9acccf464b483ba37f136cb7c89c.jpg',
    jojo: 'https://i.pinimg.com/736x/38/80/f9/3880f99ad04e79c05f24ed2922d8ae47.jpg',
    renaissance: 'https://i.pinimg.com/1200x/43/c6/12/43c61262cf3831f1a850d187c28cc026.jpg',
    uscomic: 'https://i.pinimg.com/736x/e4/ee/ac/e4eeac744ec302105afd313b7109652c.jpg',
    murakami: 'https://i.pinimg.com/1200x/29/85/30/298530981d0a1646e500a58aae524c81.jpg',
    simpsons: 'https://i.pinimg.com/736x/20/2d/f6/202df6f95c1cc5b89f6af5caec7037e9.jpg',
    toriyama: 'https://i.pinimg.com/736x/a1/b5/f9/a1b5f9ca1816ea4dddad180480148277.jpg',
    graffiti: 'https://i.pinimg.com/736x/e9/ec/75/e9ec7571edeedfbbbae5dee11a774fad.jpg',
    minimalist: 'https://i.pinimg.com/736x/07/e8/f7/07e8f73cd9ae53b5b2b59e93afdc4ac1.jpg',
    kurosawa: 'https://i.pinimg.com/736x/9a/8d/9b/9a8d9b9376f5992ad7a27ee9d7719294.jpg',
    steampunk: 'https://i.pinimg.com/736x/a1/b2/a4/a1b2a467cc6ec2fb68e3f81f3ab07d4a.jpg',
    abstract: 'https://i.pinimg.com/736x/3b/e7/8d/3be78d9a3cd754d3ad5789e30db92ab0.jpg',
    vangogh: 'https://i.pinimg.com/736x/b1/e7/e9/b1e7e91ad518ebbc14eb65fb08dbb148.jpg',
    picasso: 'https://i.pinimg.com/736x/17/13/c5/1713c5a9fb7a50fe76fe633c374d4b2e.jpg',
    watercolor: 'https://i.pinimg.com/736x/4d/8e/a2/4d8ea201aa4974da9a16da715e2b3664.jpg',
    picturebook: 'https://i.pinimg.com/736x/c5/62/71/c56271764917b0227f14dc064485fa96.jpg',
    irasutoya: 'https://i.pinimg.com/736x/db/6b/d1/db6bd11221e10c373d036914ec98f66f.jpg',
    'ukiyo-e': 'https://i.pinimg.com/736x/34/59/4d/34594d7289ae9b9de61dbddd608807c4.jpg',
    crayon: 'https://i.pinimg.com/736x/7f/f6/3b/7ff63b61b410043d6cdba32af09254b6.jpg',
    fantasyCg: 'https://i.pinimg.com/1200x/81/35/c4/8135c497ed1cfa518923a2b177efcdf6.jpg',
    one: 'https://i.pinimg.com/736x/d1/70/d5/d170d549daa695f54968fa76dda5cfbc.jpg',
    southPark: 'https://i.pinimg.com/736x/a5/c1/02/a5c102b6f7c2a36624205c5872717728.jpg',
    timBurton: 'https://i.pinimg.com/1200x/63/07/a3/6307a388666cf34f58cbf574d2ea080c.jpg',
    arcane: 'https://i.pinimg.com/736x/5a/9a/ea/5a9aead8f4eeeb89a1445fc265d71844.jpg'
};


export const INSPIRATION_THEMES = {
    'zh-Hant': ['辦公室社畜日常', '情侶甜蜜互動', '厭世語錄', '吃貨的快樂時光', '遊戲廢人專用', '可愛寵物賣萌', '寶寶的成長日記', '朋友間的互嗆', '正能量打氣', 'ㄎㄧㄤ掉的每一天', '耍廢週末', '旅行中的美好', '健身狂人', '貓奴狗奴心聲', '迷因梗圖', '感謝與祝福', '問候早安晚安', '節日快樂', '諧音冷笑話', '學生黨的吶喊'],
    'en': ['Office Life', 'Couple Moments', 'Sarcastic Quotes', 'Foodie Time', 'Gamer Life', 'Cute Pets', 'Baby Diary', 'Friendly Teasing', 'Positive Vibes', 'Goofy Days', 'Lazy Weekend', 'Travel Memories', 'Fitness Freak', 'For Pet Lovers', 'Meme World', 'Thanks & Blessings', 'Daily Greetings', 'Happy Holidays', 'Pun Fun', 'Student Struggles'],
    'ja': ['オフィスライフ', 'カップルの日常', '皮肉な一言', '食いしん坊の幸せ', 'ゲーマー専用', 'かわいいペット', '赤ちゃんの成長日記', '友達とのやりとり', 'ポジティブな応援', 'おかしな毎日', '怠惰な週末', '旅行の思い出', '筋トレマニア', 'ペット愛好家', 'ネットミーム', '感謝と祝福', '毎日の挨拶', '祝日おめでとう', 'ダジャレ', '学生の叫び'],
}

export const STYLE_PROMPTS: Record<string, string> = {
    original: '**Strictly adhere to the artistic style, line work, and coloring of the provided reference image. Do not add any other stylistic elements or interpretations.**',
    anime: 'Vibrant Japanese Anime/Manga style, ultra-clean linework, subtle highlights and shadows, highly expressive face, MUST resemble a high-quality production cel.',
    chibi: 'Chibi Kawaii style, rounded and disproportionate features, thick black outlines, extremely high saturation and brightness, focus on simple, high-impact colors, hand-drawn texture.',
    american: 'Bold American Animation style, thick, stylized linework, strong cel-shading and hard shadows, exaggerated expressions, bright primary color palette, MUST look like a classic 90s cartoon.',
    realistic: 'Realistic Digital Painting style, smooth and soft lighting, photorealistic textures, subtle color palette, focus on detailed rendering of skin and fabric.',
    ink: 'Traditional Chinese Ink Wash (Shui-Mo) style, monochromatic black ink with sparse color accents, dynamic and freehand brushstrokes, emphasis on negative space and flowing movement.',
    yuji: 'Bold, thick, yet soft line art, Yuji Nishimura style, extremely high clarity, minimalist shading, expressive and bouncy dynamic pose, pure white filling with key colors only. MUST look like a clean, vector-based design.',
    ghibli: 'Ghibli inspired watercolor painting style, soft diffused lighting, pastel color palette, hand-painted texture, highly detailed background elements, ethereal and fantastical quality. **Focus on light, natural brushstrokes.**',
    pixel: 'Retro 16-bit pixel art style, low resolution, defined sprite outlines, highly limited color palette (max 32 colors), perfect isometric or frontal view. MUST look like classic video game graphics.',
    flat: 'Minimalist flat design vector illustration, bold geometric shapes, no gradients or shading, pure color blocks, thick key lines, clean and modern aesthetic. **MUST be immediately recognizable as vector art.**',
    popart: 'Vintage Pop Art style inspired by Roy Lichtenstein, heavy use of Ben-Day dots, thick black outlines, primary color scheme (red, yellow, blue), dynamic comic book composition, **high contrast and graphic feel.**',
    neon: 'Cyberpunk neon illustration style, high contrast, dark shadows, primary light source is intense neon glowing colors (blue/pink/cyan), volumetric light effects, **wet reflective surfaces, futuristic atmosphere.**',
    spongebob: 'SpongeBob SquarePants Cartoon Style, highly expressive and goofy, thick, uneven black outlines, simple yet vibrant color palette, slight rubber hose animation feel, MUST capture the recognizable aesthetic of the show.',
    ppg: 'The Powerpuff Girls Cartoon Style, minimalistic character design, oversized eyes, simple geometric shapes, very thick black outlines, bold, flat colors, high contrast shading, MUST resemble the character design by Craig McCracken.',
    adventuretime: 'Adventure Time Cartoon Style, minimalist, loose and flowing black lines, simple rounded shapes, pastel and earthy color scheme, slightly distorted or whimsical proportions, MUST capture the unique, laid-back, and surreal aesthetic.',
    sketch: 'Detailed charcoal or graphite sketch style, monochromatic black and white, soft pencil shading, cross-hatching textures, realistic depth and volume using only shades of gray.',
    toy: 'High-fidelity vinyl toy or miniature figurine style, matte plastic texture, clear seam lines and joints, strong studio lighting with soft shadows, MUST resemble a 3D rendered collectible model.',
    pixar: 'Pixar Animation Studio style, 3D rendered look, soft global illumination, detailed textures on surfaces, subsurface scattering on skin, extremely expressive and appealing character design, cinematic quality.',
    jojo: 'JoJo\'s Bizarre Adventure manga style, Araki Hirohiko aesthetic, heavy black ink shading (beta-kake), dramatic and contorted "JoJo-pose", sharp and angular facial features, unique and vibrant color palettes, sound effect characters (onomatopoeia) in the background.',
    renaissance: 'In the style of a Renaissance masterpiece oil painting. MUST feature dramatic chiaroscuro lighting, creating intense contrast between light and shadow. Employ techniques like sfumato for soft, hazy transitions. The composition must be balanced and harmonious, often with a triangular structure. Characters should have realistic anatomy and solemn, emotionally charged expressions in dramatic poses. Use a rich, deep color palette with an aged, varnish-like texture. The final image must evoke the gravitas and grandeur of a work by Caravaggio, Leonardo da Vinci, or Rembrandt.',
    uscomic: 'Modern American Comic Book style (like DC/Marvel), dynamic and heroic poses, detailed ink lines with varied weight, cross-hatching for shadows, vibrant digital coloring with some gradients, high-action composition.',
    murakami: 'Takashi Murakami Superflat style, extremely vibrant and psychedelic colors, bold and clean outlines, anime-inspired large eyes, often features smiling flowers or mushroom characters, merges pop art with traditional Japanese motifs.',
    simpsons: 'The Simpsons cartoon style, Matt Groening aesthetic, characters MUST have yellow skin, large circular eyes with small black pupils, a noticeable overbite, simple and bold outlines, flat color palette, no shading.',
    toriyama: 'Akira Toriyama manga style, Dragon Ball Z aesthetic, sharp and distinct linework, characters with spiky hair and expressive, angular eyes, dynamic action poses with speed lines, simple cel-shading, clear and uncluttered composition.',
    graffiti: 'Urban graffiti street art style, spray paint textures with drips and overspray, bold and bubble-like or sharp-angled lettering, vibrant and high-contrast color scheme, often layered with tags and abstract shapes, energetic and rebellious feel.',
    minimalist: 'Extreme Minimalism style, composed of only essential lines and simple geometric shapes. Heavy use of negative space, ultra-limited and muted color palette (max 3-4 colors). No textures, gradients, or details. MUST look clean and conceptual.',
    kurosawa: 'Akira Kurosawa cinematic style, high-contrast black and white (monochrome), dramatic chiaroscuro lighting, deep, oppressive shadows, dynamic composition with a low-angle shot, sense of epic movement, heavy film grain texture. MUST resemble a frame from a classic samurai film.',
    steampunk: 'Steampunk style, Victorian-era aesthetics fused with industrial steam-powered technology. Character MUST wear goggles, leather, and brass accessories. Intricate details of gears, cogs, pipes, and gauges are essential. Sepia-toned color palette with accents of copper and bronze.',
    abstract: 'Abstract Art style, non-representational and expressive. Deconstruct the subject into geometric shapes, bold colors, and gestural lines. Focus on composition, form, and color harmony rather than a literal depiction. Inspired by Kandinsky or Picasso\'s cubism.',
    vangogh: 'In the style of Vincent Van Gogh, post-impressionist oil painting. MUST use thick, visible impasto brushstrokes, swirling lines, and a vibrant, emotional color palette. High energy and texture.',
    picasso: 'In the style of Pablo Picasso\'s cubism. The subject MUST be deconstructed into geometric forms and shapes, showing multiple viewpoints simultaneously. Abstract and fragmented appearance.',
    watercolor: 'Soft and gentle watercolor illustration style. Transparent, layered colors with visible paper texture. Wet-on-wet blending effects and soft, feathered edges. MUST resemble a classic, fresh watercolor painting.',
    picturebook: 'Charming children\'s book illustration style. Whimsical characters with friendly expressions. Warm and soft color palette with gentle, textured shading. MUST evoke a classic, heartwarming storybook feel.',
    irasutoya: 'In the distinct, gentle style of Japanese illustrator Irasutoya. The MOST CRITICAL feature is the iconic cheek blush: all characters and animals MUST have two distinct, soft, elliptical pink blush marks on their cheeks. Facial features are extremely simple: small, black, solid dot or bean-shaped eyes set slightly apart, and a simple, gentle curved line for the mouth. Use soft, slightly rounded black outlines that feel hand-drawn. The color palette must be soft, warm, and gentle with low saturation, using flat colors with minimal to no gradients. The composition must be flat with no complex perspective or depth, presenting characters in a simple frontal or side view. The overall aesthetic must be clean, cute, and universally appealing.',
    'ukiyo-e': 'In the style of a Japanese Ukiyo-e woodblock print. The image MUST feature bold, flowing black outlines, flat areas of color, and a sense of flattened perspective typical of the Edo period. The artwork should evoke the masters like Hokusai or Utamaro, with potential for subtle wood grain texture in the background. The overall aesthetic must be classical, elegant, and distinctly Japanese.',
    crayon: 'In the distinct style of a child\'s crayon drawing. The MOST CRITICAL features are wobbly, imperfect, and shaky outlines, as if drawn by a child. The coloring MUST be scribbled, uneven, and go outside the lines, mimicking a crayon or colored pencil texture on paper. Use a vibrant, high-saturation palette of primary colors (red, yellow, blue, green). The perspective MUST be flat with a complete lack of realistic proportion (e.g., the character might be larger than a house). The scene can include iconic childlike elements like a smiling sun in the corner, stick figures, or simple triangle-roof houses in the background. The final image must exude a charming, innocent, and naive hand-drawn quality.',
    fantasyCg: 'Ornate Fantasy CG style, painterly, intricate details, epic fantasy, high contrast lighting, dynamic pose, glowing magic effects, game art, polished, digital illustration.',
    one: 'style of ONE (One-Punch Man author), crude line art, sketchy, doodle, minimalist, black and white, manga sketch, deadpan expression, intentionally bad drawing, webcomic style.',
    southPark: 'South Park style, construction paper cutout, digital cutout animation, flat colors, simple geometric shapes, 2D flat, crude, vibrant colors.',
    timBurton: 'Tim Burton style, gothic art, creepy cute, elongated limbs, distorted proportions, large hollow eyes, desaturated colors, gloomy, spooky, spirals and stripes, German expressionism.',
    arcane: 'Arcane (League of Legends) style, digital oil painting, painterly 3D, hand-painted textures, strong chiaroscuro, stylized realism, Art Deco influence, dramatic lighting, visible brushstrokes.'
};

export const PIPI_STICKERS: Record<string, { url: string; description: Record<Language, string> }> = {
    pipi_hello: {
        url: 'https://i.pinimg.com/736x/74/bb/1a/74bb1a2a22521de60f17c6628afc3caf.jpg',
        description: { 'zh-Hant': '熱情揮手打招呼', 'en': 'Enthusiastically waving hello', 'ja': '元気に手を振って挨拶' }
    },
    pipi_listening: {
        url: 'https://i.pinimg.com/736x/2a/a7/8c/2aa78c9859366284b4465ba8057fa005.jpg',
        description: { 'zh-Hant': '專心傾聽', 'en': 'Listening intently', 'ja': '熱心に聞いている' }
    },
    pipi_lazy: {
        url: 'https://i.pinimg.com/736x/ad/ed/dd/adeddd8cf638e652b106fb715b383d28.jpg',
        description: { 'zh-Hant': '慵懶地躺在鍵盤上', 'en': 'Lazily lying on the keyboard', 'ja': 'キーボードの上でゴロゴロ' }
    },
    pipi_idea: {
        url: 'https://i.pinimg.com/736x/eb/2a/57/eb2a57b49f9e8823e65cdb298d448913.jpg',
        description: { 'zh-Hant': '靈光一閃！', 'en': 'A brilliant idea!', 'ja': 'ひらめいた！' }
    },
    pipi_solved: {
        url: 'https://i.pinimg.com/736x/de/f1/92/def19234f815c50333ea6e1aca2a3911.jpg',
        description: { 'zh-Hant': '問題解決了！', 'en': 'Problem solved!', 'ja': '問題解決！' }
    },
    pipi_confused: {
        url: 'https://i.pinimg.com/736x/12/90/70/129070d2ae2af84bc4df27bf842a8cf1.jpg',
        description: { 'zh-Hant': '感到困惑', 'en': 'Feeling confused', 'ja': '困惑している' }
    },
    pipi_sorry: {
        url: 'https://i.pinimg.com/736x/5a/c8/85/5ac88590da97132aeedf092f8e47bc2d.jpg',
        description: { 'zh-Hant': '誠懇地道歉', 'en': 'Sincerely apologizing', 'ja': '心からお詫び' }
    },
    pipi_celebrate: {
        url: 'https://i.pinimg.com/736x/0b/64/2c/0b642cfb67b360102f7d2ec28040e718.jpg',
        description: { 'zh-Hant': '開心地慶祝', 'en': 'Happily celebrating', 'ja': '楽しくお祝い' }
    },
    pipi_love: {
        url: 'https://i.pinimg.com/736x/b3/60/a4/b360a4df08bddc7d02de92c8bf363768.jpg',
        description: { 'zh-Hant': '比出愛心感謝', 'en': 'Making a heart gesture to say thanks', 'ja': 'ハートで感謝' }
    },
    pipi_inspect: {
        url: 'https://i.pinimg.com/736x/19/01/68/190168029b195171d0ef2a4e5266baae.jpg',
        description: { 'zh-Hant': '仔細查看', 'en': 'Inspecting closely', 'ja': '詳しく調べている' }
    },
    pipi_yawn: {
        url: 'https://i.pinimg.com/736x/7c/8c/6e/7c8c6e3fa1d2c5308e30058c561d77fa.jpg',
        description: { 'zh-Hant': '疲憊地打哈欠', 'en': 'Yawning tiredly', 'ja': '疲れてあくび' }
    },
    pipi_relax: {
        url: 'https://i.pinimg.com/736x/3b/de/19/3bde19a0c43548180c163eeba0e7da0c.jpg',
        description: { 'zh-Hant': '喝杯咖啡，放鬆一下', 'en': 'Relaxing with a coffee break', 'ja': 'コーヒーでリラックス' }
    },
    pipi_cheer: {
        url: 'https://i.pinimg.com/736x/39/6b/f5/396bf52c8a2aed853a56fe7f79dd91e4.jpg',
        description: { 'zh-Hant': '為你加油！', 'en': 'Cheering for you!', 'ja': '応援してるよ！' }
    },
    pipi_surprised: {
        url: 'https://i.pinimg.com/736x/36/52/2a/36522a89a77cdf1a6663d6315038bb5a.jpg',
        description: { 'zh-Hant': '非常驚訝', 'en': 'Very surprised', 'ja': 'とても驚いている' }
    },
    pipi_touched: {
        url: 'https://i.pinimg.com/736x/35/6f/f8/356ff88b822ea0d8db4613b076ee1a51.jpg',
        description: { 'zh-Hant': '感動地哭了', 'en': 'Moved to tears', 'ja': '感動して涙' }
    },
    pipi_goodbye: {
        url: 'https://i.pinimg.com/736x/3e/af/6a/3eaf6aca2ca2efff0bac30010fd7b761.jpg',
        description: { 'zh-Hant': '開心地說再見', 'en': 'Happily saying goodbye', 'ja': '楽しくさようなら' }
    },
    pipi_thinking_hard: {
        url: 'https://i.pinimg.com/736x/bf/d3/8b/bfd38b608d6feb19d8f49fb6ae08a0e5.jpg',
        description: { 'zh-Hant': '努力思考中', 'en': 'Thinking very hard', 'ja': '一生懸命考えている' }
    }
};
