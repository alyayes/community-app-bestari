import React, { useState } from 'react';
import { InfoArticle } from '../../types';
import { X, Calendar, MapPin, User, Download, Share2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface ArticleDetailModalProps {
  article: InfoArticle | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!article) return null;

  const images = article.gallery && article.gallery.length > 0 
    ? article.gallery 
    : [article.image];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#E6E1D5] my-8 animate-in fade-in zoom-in-95">
        {/* Top Header / Image Gallery */}
        <div className="relative h-72 sm:h-96 bg-gray-900">
          <img
            src={images[activeImageIdx]}
            alt={article.title}
            className="w-full h-full object-cover opacity-90 transition-all duration-300"
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-[#2C4219] text-white shadow-sm">
            {article.category}
          </span>

          {/* Image Slider Controls */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                {activeImageIdx + 1} / {images.length}
              </span>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Header */}
          <div className="space-y-3 pb-4 border-b border-[#E6E1D5]">
            <div className="flex items-center gap-4 text-xs text-[#433A30]/70">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#2C4219]" /> {article.date || article.timeAgo}</span>
              {article.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#2C4219]" /> {article.location}</span>
              )}
            </div>

            <h2 className="font-title font-extrabold text-2xl text-[#2C4219] leading-snug">
              {article.title}
            </h2>

            {article.author && (
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2C4219]/20"
                />
                <div>
                  <p className="font-bold text-xs text-[#2C4219]">{article.author.name}</p>
                  <p className="text-[10px] text-[#433A30]/70">{article.author.role}</p>
                </div>
              </div>
            )}
          </div>

          {/* Storytelling Article Content */}
          <div className="space-y-4 text-xs sm:text-sm text-[#433A30] leading-relaxed">
            <p className="font-medium text-[#2C4219] text-sm bg-[#FAF6EE] p-4 rounded-xl border border-[#E6E1D5]">
              "{article.summary}"
            </p>

            {article.content && article.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Action Footer Bar */}
          <div className="pt-6 border-t border-[#E6E1D5] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => alert(`Mengunduh dokumen Laporan Kegiatan: "${article.title}.pdf"`)}
              className="px-5 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-[#A8B774]" />
              <span>Unduh Laporan Panduan PDF</span>
            </button>

            <button
              onClick={() => alert('Link artikel berhasil disalin!')}
              className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] hover:bg-[#E6E1D5]/50 text-[#2C4219] text-xs font-semibold flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Artikel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
