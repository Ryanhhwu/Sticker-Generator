
import React, { useState } from 'react';
import { EditingStickerInfo } from '../types';

interface EditModalProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    editingSticker: EditingStickerInfo;
    setEditingSticker: (info: EditingStickerInfo | null) => void;
    onSaveAndRegenerate: (stickerId: string, userRequest: string) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ t, editingSticker, setEditingSticker, onSaveAndRegenerate }) => {
    const [userRequest, setUserRequest] = useState('');

    const handleSave = async () => {
        if (!userRequest.trim()) {
            alert("請輸入您想修改的內容！");
            return;
        }

        const stickerId = editingSticker.id;
        setEditingSticker(null); // Close modal immediately
        await onSaveAndRegenerate(stickerId, userRequest);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="p-6 rounded-xl shadow-2xl w-full max-w-2xl border" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
                <h3 className="text-lg font-bold mb-4 text-green-600">{t('editModalTitle')}</h3>
                <p className="text-base mb-4" style={{ color: 'var(--text-muted-color)' }}>{t('editModalDesc')}</p>
                <textarea
                    value={userRequest}
                    onChange={(e) => setUserRequest(e.target.value)}
                    className="w-full h-24 rounded-lg p-3 text-base border focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('editModalPlaceholder')}
                    style={{ backgroundColor: 'var(--input-bg-color)', color: 'var(--text-color)', borderColor: 'var(--input-border-color)' }}
                />
                <h4 className="text-md font-semibold mt-4 mb-2" style={{ color: 'var(--text-muted-color)' }}>{t('currentPrompt')}</h4>
                <textarea
                    readOnly
                    value={editingSticker.prompt}
                    className="w-full h-32 rounded-lg p-3 text-sm border"
                    style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-muted-color)', borderColor: 'var(--input-border-color)' }}
                />
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={() => setEditingSticker(null)} className="btn-secondary px-4 py-2 rounded-lg text-base">{t('cancel')}</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded-lg text-white text-base">{t('saveAndRegenerate')}</button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
