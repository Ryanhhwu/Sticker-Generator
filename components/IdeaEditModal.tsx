import React, { useState, useEffect } from 'react';
import { EditingIdeaInfo } from '../types';
import { SaveIcon, CloseIcon } from './icons/Icons';

interface IdeaEditModalProps {
    t: (key: string) => string;
    editingIdea: EditingIdeaInfo;
    onClose: () => void;
    onSave: (stickerId: string, newText: string) => Promise<void>;
}

const IdeaEditModal: React.FC<IdeaEditModalProps> = ({ t, editingIdea, onClose, onSave }) => {
    const [text, setText] = useState(editingIdea.text);

    useEffect(() => {
        setText(editingIdea.text);
    }, [editingIdea]);

    const handleSaveClick = () => {
        onSave(editingIdea.id, text);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="p-6 rounded-2xl shadow-2xl w-full max-w-lg border flex flex-col gap-4" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }} onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-green-600">{t('editIdeaTitle')}</h3>
                <p className="text-base" style={{ color: 'var(--text-muted-color)' }}>{t('editIdeaDesc')}</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-40 rounded-lg p-3 text-base border focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ backgroundColor: 'var(--input-bg-color)', color: 'var(--text-color)', borderColor: 'var(--input-border-color)' }}
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-2">
                    <button onClick={onClose} className="btn-secondary px-6 py-2 rounded-lg text-base flex items-center gap-2"><CloseIcon/>{t('cancel')}</button>
                    <button onClick={handleSaveClick} className="btn-primary px-6 py-2 rounded-lg text-white text-base flex items-center gap-2"><SaveIcon/>{t('save')}</button>
                </div>
            </div>
        </div>
    );
};

export default IdeaEditModal;
