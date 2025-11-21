
import React, { useState } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { GeneratedSticker, StickerIdea } from '../types';
import { DownloadIcon } from './icons/Icons';
import { removeGreenScreenAndResize } from '../utils/imageProcessing';

interface Step4Props {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    generatedStickers: GeneratedSticker[];
    stickerIdeas: StickerIdea[];
    setCurrentView: (view: any) => void;
    stickerPackTitle: string;
    setStickerPackTitle: (title: string) => void;
    stickerPackDescription: string;
    setStickerPackDescription: (desc: string) => void;
    includedStickerIds: string[];
    setIncludedStickerIds: (ids: string[]) => void;
    mainStickerId: string | null;
    setMainStickerId: (id: string | null) => void;
    tabStickerId: string | null;
    setTabStickerId: (id: string | null) => void;
}

const Step4Export: React.FC<Step4Props> = (props) => {
    const { 
        t, generatedStickers, stickerIdeas, setCurrentView,
        stickerPackTitle, setStickerPackTitle, stickerPackDescription, setStickerPackDescription,
        includedStickerIds, setIncludedStickerIds, mainStickerId, setMainStickerId,
        tabStickerId, setTabStickerId
    } = props;

    const [isDownloading, setIsDownloading] = useState(false);
    const successfulStickers = generatedStickers.filter(s => s.displaySrc);
    const mainStickerPreview = successfulStickers.find(s => s.id === mainStickerId);

    const handleIncludeChange = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setIncludedStickerIds([...includedStickerIds, id]);
        } else {
            const newIds = includedStickerIds.filter(i => i !== id);
            setIncludedStickerIds(newIds);
            if (mainStickerId === id) {
                setMainStickerId(newIds.length > 0 ? newIds[0] : null);
            }
            if (tabStickerId === id) {
                setTabStickerId(newIds.length > 0 ? newIds[0] : null);
            }
        }
    };
    
    const handleDownloadZip = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            const stickersToExport = successfulStickers.filter(s => includedStickerIds.includes(s.id));
            const mainStickerToExport = successfulStickers.find(s => s.id === mainStickerId);
            const tabStickerToExport = successfulStickers.find(s => s.id === tabStickerId);

            const processingPromises = [];

            if (mainStickerToExport?.originalSrc) {
                processingPromises.push(removeGreenScreenAndResize(mainStickerToExport.originalSrc, 240, 240).then(dataUrl => {
                    zip.file('main.png', dataUrl.split(',')[1], { base64: true });
                }));
            }
            if (tabStickerToExport?.originalSrc) {
                processingPromises.push(removeGreenScreenAndResize(tabStickerToExport.originalSrc, 96, 74).then(dataUrl => {
                    zip.file('tab.png', dataUrl.split(',')[1], { base64: true });
                }));
            }
            
            stickersToExport.forEach((sticker, index) => {
                if(sticker.originalSrc) {
                    processingPromises.push(removeGreenScreenAndResize(sticker.originalSrc, 370, 320).then(dataUrl => {
                        zip.file(`${index + 1}.png`, dataUrl.split(',')[1], { base64: true });
                    }));
                }
            });

            // Create and add info.txt file
            let infoFileContent = `Sticker Pack Information\n========================\n\n`;
            infoFileContent += `Title: ${stickerPackTitle}\n`;
            infoFileContent += `Description: ${stickerPackDescription}\n\n`;
            infoFileContent += `Stickers & Individual Keywords\n---------------------\n\n`;

            stickersToExport.forEach((sticker, index) => {
                const idea = stickerIdeas.find(i => i.id === sticker.id);
                infoFileContent += `Sticker ${index + 1} (${index + 1}.png):\n`;
                infoFileContent += `  - Idea: ${idea ? idea.text : 'N/A'}\n`;
                infoFileContent += `  - Keywords: ${sticker.hashtags.length > 0 ? sticker.hashtags.join(', ') : 'No keywords generated'}\n\n`;
            });
            
            zip.file('info.txt', infoFileContent);


            await Promise.all(processingPromises);
            
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'line_sticker_pack.zip');

            setCurrentView('complete');

        } catch (error) {
            console.error('Error creating zip file:', error);
            alert('Failed to create zip file.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    return (
        <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-green-500 dark:text-primary">{t('step4Title')}</h1>
                <p className="mt-2" style={{ color: 'var(--text-muted-color)' }}>{t('step4Desc1')}</p>
                <ul className="mt-2 list-disc list-inside space-y-1" style={{ color: 'var(--text-muted-color)' }}>
                    <li><span className="font-semibold" style={{ color: 'var(--text-color)' }}>{t('main')}:</span> {t('step4DescMain')}</li>
                    <li><span className="font-semibold" style={{ color: 'var(--text-color)' }}>{t('tab')}:</span> {t('step4DescTab')}</li>
                </ul>
            </header>

            <main className="space-y-10">
                <section className="p-6 sm:p-8 rounded-lg border" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>{t('storePreview')}</h2>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 w-full md:w-48 h-48 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--card-hover-bg)'}}>
                            {mainStickerPreview ? (
                                <img alt={t('main')} className="object-contain h-full w-full p-2" src={mainStickerPreview.displaySrc!} />
                            ) : (
                               <div className="text-center p-4" style={{ color: 'var(--text-muted-color)'}}>{t('selectMainSticker')}</div>
                            )}
                        </div>
                        <div className="flex-grow space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="sticker-title" style={{ color: 'var(--text-muted-color)' }}>{t('stickerTitle')}</label>
                                <input className="w-full rounded-lg border focus:ring-green-500 focus:border-green-500" id="sticker-title" type="text" value={stickerPackTitle} onChange={(e) => setStickerPackTitle(e.target.value)} style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)', color: 'var(--text-color)' }}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="sticker-description" style={{ color: 'var(--text-muted-color)' }}>{t('stickerDesc')}</label>
                                <textarea className="w-full rounded-lg border focus:ring-green-500 focus:border-green-500" id="sticker-description" rows={3} value={stickerPackDescription} onChange={(e) => setStickerPackDescription(e.target.value)} style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)', color: 'var(--text-color)' }}></textarea>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-baseline gap-4 mb-6">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{t('selectYourStickers')}</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted-color)' }}>{t('exportSelectionHint')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {successfulStickers.map(sticker => {
                            const idea = stickerIdeas.find(i => i.id === sticker.id);
                            const isIncluded = includedStickerIds.includes(sticker.id);
                            return (
                                <div key={sticker.id} className={`relative transition-opacity ${isIncluded ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                    <input 
                                        id={`include-${sticker.id}`} 
                                        checked={isIncluded} 
                                        onChange={e => handleIncludeChange(sticker.id, e.target.checked)} 
                                        className="form-checkbox h-6 w-6 rounded-md border-2 border-gray-300 dark:border-white/70 bg-white dark:bg-gray-800 text-primary checked:bg-primary checked:border-transparent focus:ring-offset-0 focus:ring-primary absolute top-3 left-3 z-10 transition-all cursor-pointer shadow-md" 
                                        type="checkbox"
                                    />
                                    <div className="rounded-lg border overflow-hidden flex flex-col h-full" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
                                        <div className="p-4">
                                            <p className="text-sm h-16 text-justify overflow-hidden" style={{ color: 'var(--text-muted-color)' }}>{idea?.text}</p>
                                        </div>
                                        <div className="aspect-w-1 aspect-h-1 w-full" style={{ backgroundColor: 'var(--card-hover-bg)' }}>
                                            <img alt={idea?.text} className="object-contain w-full h-full p-4" src={sticker.displaySrc!} />
                                        </div>
                                        <div className="p-4 space-y-4 border-t" style={{ borderColor: 'var(--input-border-color)' }}>
                                            <div className="flex items-center justify-around">
                                                <label className={`flex items-center space-x-2 ${isIncluded ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                                    <input disabled={!isIncluded} checked={mainStickerId === sticker.id} onChange={() => setMainStickerId(sticker.id)} className="form-radio h-4 w-4" name="main-sticker" type="radio"/>
                                                    <span className={`text-sm ${mainStickerId === sticker.id ? 'font-bold text-green-600' : ''}`} style={{ color: mainStickerId !== sticker.id ? 'var(--text-color)' : ''}}>{t('main')}</span>
                                                </label>
                                                <label className={`flex items-center space-x-2 ${isIncluded ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                                    <input disabled={!isIncluded} checked={tabStickerId === sticker.id} onChange={() => setTabStickerId(sticker.id)} className="form-radio h-4 w-4" name="tab-sticker" type="radio"/>
                                                    <span className={`text-sm ${tabStickerId === sticker.id ? 'font-bold text-green-600' : ''}`} style={{ color: tabStickerId !== sticker.id ? 'var(--text-color)' : ''}}>{t('tab')}</span>
                                                </label>
                                            </div>
                                            {sticker.hashtags.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted-color)' }}>{t('stickerKeywords')}</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sticker.hashtags.map(tag => (
                                                            <div key={tag} className="px-2.5 py-1 text-sm rounded-full" style={{backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)'}}>#{tag}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                 <footer className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t" style={{ borderColor: 'var(--card-border-color)' }}>
                    <button onClick={() => setCurrentView('results')} className="w-full sm:w-auto order-2 sm:order-1 mt-4 sm:mt-0 px-6 py-3 rounded-lg font-semibold transition-colors btn-secondary" type="button">
                        {t('back')}
                    </button>
                    <button onClick={handleDownloadZip} disabled={isDownloading || !mainStickerId || !tabStickerId || includedStickerIds.length === 0} className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold shadow-lg transition-all transform hover:scale-105 btn-primary disabled:opacity-50" type="button">
                        <DownloadIcon />
                         {isDownloading ? t('downloading') : t('exportButton', {count: includedStickerIds.length})}
                    </button>
                </footer>
            </main>
        </div>
    );
};

export default Step4Export;
