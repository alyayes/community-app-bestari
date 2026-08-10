import React from 'react';
import { InfoArticle } from '../../types';
import { X } from 'lucide-react';
import { InformasiView } from '../views/InformasiView';

interface ArticleDetailModalProps {
  article: InfoArticle | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={onClose}>
      <div
        className="min-h-screen flex items-start justify-center p-4 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FAF6EE] w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-[#E6E1D5] animate-in fade-in zoom-in-95 relative p-6 pt-12">
          {/* Top bar with close absolute */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white border border-[#E6E1D5] text-[#7A7062] hover:text-[#2C4219] hover:border-[#2C4219] flex items-center justify-center transition-colors shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
          
          <InformasiView 
            articles={[article]} 
            selectedArticle={article} 
            onSelectArticle={onClose} 
          />
        </div>
      </div>
    </div>
  );
};
