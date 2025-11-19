
import React from 'react';
import { CloseIcon, RefreshIcon, WarningIcon } from './icons/Icons';

interface ConfirmationModalProps {
    t: (key: string) => string;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ t, title, message, confirmText, onConfirm, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="p-6 rounded-2xl shadow-2xl w-full max-w-md border flex flex-col gap-4" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }} onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                    <WarningIcon />
                    {title}
                </h3>
                <p className="text-base" style={{ color: 'var(--text-muted-color)' }}>{message}</p>
                <div className="flex justify-end gap-4 mt-2">
                    <button onClick={onClose} className="btn-secondary px-6 py-2 rounded-lg text-base">{t('cancel')}</button>
                    <button 
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg text-white text-base flex items-center gap-2 font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{ backgroundImage: 'linear-gradient(to right, #f87171, #dc2626)' }}
                    >
                        <RefreshIcon/>{confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
