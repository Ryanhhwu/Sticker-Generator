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
    const mainSticker = successfulStickers.find(s => s.id === mainStickerId);

    const handleIncludeChange = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setIncludedStickerIds([...includedStickerIds, id]);
        } else {
            setIncludedStickerIds(includedStickerIds.filter(i => i !== id));
            if (mainStickerId === id) setMainStickerId(null);
            if (tabStickerId === id) setTabStickerId(null);
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
        <div className="w-full max-w-7xl p-6 sm:p-8 rounded-3xl shadow-xl border mx-auto" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
            <h2 className="text-2xl font-bold mb-2 text-green-600">{t('step4Title')}</h2>
            <p className="mb-2" style={{ color: 'var(--text-muted-color)'}}>{t('step4Desc1')}</p>
            <ul className="list-disc list-inside text-sm space-y-1 mb-6" style={{ color: 'var(--text-muted-color)'}}>
                <li className="ml-4"><b>{t('main')}:</b> {t('step4DescMain')}</li>
                <li className="ml-4"><b>{t('tab')}:</b> {t('step4DescTab')}</li>
            </ul>

            {mainSticker && (
                 <div className="mb-8 p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-6 items-center" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)'}}>
                    <div className="flex justify-center md:col-span-1">
                        <img src={mainSticker.displaySrc!} className="w-48 h-48 object-contain rounded-lg p-2" style={{backgroundColor: 'var(--bg-color)'}}/>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-bold text-lg">{t('storePreview')}</h3>
                        <div>
                            <label className="block text-sm font-semibold mb-1">{t('stickerTitle')}</label>
                            <input type="text" value={stickerPackTitle} onChange={(e) => setStickerPackTitle(e.target.value)} className="w-full border rounded-lg p-2 text-base" style={{ backgroundColor: 'var(--card-hover-bg)', borderColor: 'var(--input-border-color)'}} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">{t('stickerDesc')}</label>
                            <textarea value={stickerPackDescription} onChange={(e) => setStickerPackDescription(e.target.value)} className="w-full border rounded-lg p-2 text-base" rows={3} style={{ backgroundColor: 'var(--card-hover-bg)', borderColor: 'var(--input-border-color)'}} />
                        </div>
                    </div>
                </div>
            )}
            
            <h3 className="font-bold text-lg mb-4 mt-8">{t('selectYourStickers')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {successfulStickers.map(sticker => {
                    const idea = stickerIdeas.find(i => i.id === sticker.id);
                    const isIncluded = includedStickerIds.includes(sticker.id);
                    return (
                        <div key={sticker.id} className={`border rounded-lg p-2 flex flex-col gap-2 transition-opacity ${isIncluded ? 'opacity-100' : 'opacity-50'}`} style={{ backgroundColor: 'var(--card-hover-bg)', borderColor: 'var(--card-border-color)'}}>
                            <p className="text-xs font-semibold text-center break-words">{idea?.text || '...'}</p>
                            <div className="aspect-square mb-1 bg-white/50 rounded-md">
                                <img src={sticker.displaySrc!} className="w-full h-full object-contain p-1" />
                            </div>
                             <div className="flex items-center">
                                <input type="checkbox" id={`include-${sticker.id}`} onChange={e => handleIncludeChange(sticker.id, e.target.checked)} checked={isIncluded} className="form-checkbox mr-2"/>
                                <label htmlFor={`include-${sticker.id}`} className="text-sm cursor-pointer">{t('includeInExport')}</label>
                            </div>
                            <div className="text-sm flex justify-around gap-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="main-sticker-radio" onChange={e => setMainStickerId(e.target.checked ? sticker.id : null)} checked={mainStickerId === sticker.id} disabled={!isIncluded} className="form-radio mr-1"/>
                                    {t('main')}
                                </label>
                                 <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="tab-sticker-radio" onChange={e => setTabStickerId(e.target.checked ? sticker.id : null)} checked={tabStickerId === sticker.id} disabled={!isIncluded} className="form-radio mr-1"/>
                                    {t('tab')}
                                </label>
                            </div>
                             {sticker.hashtags.length > 0 && (
                                <div className="text-xs pt-1 border-t" style={{ borderColor: 'var(--card-border-color)', color: 'var(--text-muted-color)'}}>
                                    <p className="font-semibold">{t('keywords')}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {sticker.hashtags.map(h => <span key={h} className="px-1.5 py-0.5 rounded text-xs" style={{backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)'}}>{h}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <button onClick={() => setCurrentView('results')} className="btn-secondary px-6 py-3 rounded-xl w-full sm:w-auto">{t('back')}</button>
                 <button onClick={handleDownloadZip} disabled={isDownloading || !mainStickerId || !tabStickerId || includedStickerIds.length === 0} className="btn-primary px-8 py-4 rounded-lg text-lg w-full sm:w-auto flex items-center justify-center gap-2">
                    {isDownloading ? t('downloading') : <><DownloadIcon /> {t('exportButton', {count: includedStickerIds.length})}</>}
                </button>
            </div>
        </div>
    );
};

export default Step4Export;