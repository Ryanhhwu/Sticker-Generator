
import React from 'react';
import { CheckIcon } from './icons/Icons';

interface PreviewSelectionModalProps {
    t: (key: string) => string;
    candidates: string[];
    onSelect: (selectedImage: string) => void;
    onClose: () => void;
}

const PreviewSelectionModal: React.FC<PreviewSelectionModalProps> = ({ t, candidates, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="p-6 rounded-2xl shadow-2xl w-full max-w-5xl border" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }} onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-2 text-green-600">{t('previewSelectionTitle')}</h2>
                <p className="text-center mb-6" style={{ color: 'var(--text-muted-color)'}}>{t('previewSelectionDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {candidates.map((src, index) => (
                        <div key={index} className="group relative aspect-square border rounded-lg cursor-pointer overflow-hidden transform transition-transform hover:scale-105" onClick={() => onSelect(src)} style={{borderColor: 'var(--input-border-color)'}}>
                            <img src={src} alt={`Preview candidate ${index + 1}`} className="w-full h-full object-contain p-2" style={{ backgroundColor: 'var(--card-hover-bg)' }}/>
                            <div className="absolute inset-0 bg-green-600/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckIcon />
                                <span className="text-white text-xl font-bold mt-2">{t('select')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewSelectionModal;
