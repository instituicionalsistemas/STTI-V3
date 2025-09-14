import React from 'react';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-4xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Veículo ampliado"
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:top-2 sm:right-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors"
          aria-label="Fechar imagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageLightbox;
