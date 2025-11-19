
import React, { useState } from 'react';
import { EditingStickerInfo } from '../types';
import * as geminiService from '../services/geminiService';
import { LoadingSpinnerIcon, SaveIcon, CloseIcon, SparklesIcon } from './icons/Icons';

interface ImageEditModalProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    editingSticker: EditingStickerInfo;
    onClose: () => void;
    onSave: (stickerId: string, finalImageBase64: string) => Promise<void>;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ t, editingSticker, onClose, onSave }) => {
    const [currentImage, setCurrentImage] = useState(editingSticker.src);
    const [userInput, setUserInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApplyEdit = async () => {
        if (!userInput.trim()) return;
        setIsEditing(true);
        setError(null);
        try {
            const newImage = await geminiService.editImage(currentImage, userInput, editingSticker.prompt);
            setCurrentImage(newImage);
            setUserInput('');
        } catch (err: any) {
            setError(err.message || 'Editing failed.');
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleSave = async () => {
        await onSave(editingSticker.id, currentImage);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="p-6 rounded-2xl shadow-2xl w-full max-w-4xl border flex flex-col md:flex-row gap-6" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-4 text-green-600">{t('editModalTitle')}</h3>
                    <div className="relative w-full aspect-square border rounded-lg shadow-inner" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)'}}>
                        <img src={currentImage} alt="Editing Sticker" className="w-full h-full object-contain rounded-lg p-2" />
                        {isEditing && (
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                <LoadingSpinnerIcon className="h-12 w-12 text-green-500" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <p className="text-base mb-3" style={{ color: 'var(--text-muted-color)' }}>{t('editModalDesc')}</p>
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleApplyEdit(); } }}
                            className="w-full h-28 rounded-lg p-3 text-base border focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={t('editModalPlaceholder')}
                            style={{ backgroundColor: 'var(--input-bg-color)', color: 'var(--text-color)', borderColor: 'var(--input-border-color)' }}
                        />
                         {error && (
                            <div className="mt-2 p-2 text-sm bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/50 dark:border-red-700 dark:text-red-200">
                                {error}
                            </div>
                        )}
                        <button onClick={handleApplyEdit} disabled={isEditing || !userInput.trim()} className="w-full mt-3 py-3 rounded-lg btn-secondary flex items-center justify-center gap-2 text-base">
                            <SparklesIcon />
                            {isEditing ? t('generatingIdeas') : t('applyChanges')}
                        </button>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={onClose} className="btn-secondary px-6 py-2 rounded-lg text-base flex items-center gap-2"><CloseIcon/>{t('cancel')}</button>
                        <button onClick={handleSave} className="btn-primary px-6 py-2 rounded-lg text-white text-base flex items-center gap-2"><SaveIcon/>{t('save')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditModal;