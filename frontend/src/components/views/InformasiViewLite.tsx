import React, { useState, useEffect } from 'react';
import { InfoArticle } from '../../types';
import { ArrowLeft, Image as ImageIcon, ChevronLeft } from 'lucide-react';

interface InformasiViewLiteProps {
  articles: InfoArticle[];
  selectedArticle: InfoArticle | null;
  onSelectArticle: (article: InfoArticle | null) => void;
  searchQuery?: string;
}

export const InformasiViewLite: React.FC<InformasiViewLiteProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  searchQuery = ''
}) => {
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (selectedArticle?.gallery && selectedArticle.gallery.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIdx((prev) => (prev + 1) % selectedArticle.gallery!.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedArticle]);

  // Detail View (Tampilan Baca Artikel)
    if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-[#E6E1D5] animate-in fade-in duration-300">
        <button 
          onClick={() => onSelectArticle(null)}
          className="flex items-center gap-2 text-[#2C4219] font-bold text-xl mb-6 active:scale-95 transition-transform bg-[#FAF6EE] px-5 py-4 rounded-2xl border-2 border-[#E6E1D5] w-fit shadow-sm"
        >
          <ChevronLeft className="w-8 h-8" />
          Kembali ke Daftar
        </button>

        <h1 className="text-3xl md:text-4xl font-black text-[#2C4219] mb-6 leading-tight">
          {selectedArticle.title}
        </h1>
        
        {selectedArticle.gallery && selectedArticle.gallery.length > 0 ? (
          <div className="relative mb-6 group overflow-hidden rounded-2xl shadow-sm bg-[#E6E1D5]/30">
            <div className="relative w-full h-64 md:h-80 lg:h-96">
              {selectedArticle.gallery.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`${selectedArticle.title} ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    idx === activeImageIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ))}
            </div>
            {/* Indicators */}
            {selectedArticle.gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {selectedArticle.gallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`transition-all rounded-full ${
                      idx === activeImageIdx 
                        ? 'w-6 h-2 bg-[#A8B774]' 
                        : 'w-2 h-2 bg-white/80 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedArticle.image && (
          <img 
            src={selectedArticle.image} 
            alt={selectedArticle.title}
            className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm"
          />
        )}

        <div className="prose prose-xl max-w-none text-[#433A30] leading-relaxed [&>h1]:text-[#2C4219] [&>h2]:text-[#2C4219] text-xl font-medium">
          {selectedArticle.content && selectedArticle.content.length > 0 ? (
            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.join('\n') }} />
          ) : (
            <p>{selectedArticle.summary}</p>
          )}
        </div>
      </div>
    );
  }

  // List View (Daftar Artikel)
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300 w-full">
      <div className="bg-[#FAF6EE] p-6 lg:p-10 rounded-3xl border-2 border-[#E6E1D5] text-center md:text-left shadow-sm">
        <h2 className="text-4xl font-black text-[#2C4219] mb-2">Kabar & Tips</h2>
        <p className="text-xl text-[#433A30] font-medium">Ketuk berita di bawah ini untuk mulai membaca.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(art => (
            <div 
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white rounded-3xl p-5 border-2 border-[#E6E1D5] flex flex-col gap-4 active:scale-95 transition-transform cursor-pointer shadow-md hover:border-[#607829]"
            >
              <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden shrink-0 bg-[#FAF6EE] flex items-center justify-center">
                {art.image ? (
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-[#2C4219]/30" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-2xl text-[#2C4219] leading-tight mb-3">
                    {art.title}
                  </h3>
                  <p className="text-lg text-[#433A30]/80 line-clamp-2 font-medium">
                    {art.summary}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="w-full bg-[#2C4219] text-white py-4 rounded-2xl font-bold text-xl text-center hover:bg-[#1E2E11] transition-colors">
                    Baca Berita Lengkap
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 bg-white rounded-3xl border-2 border-[#E6E1D5] col-span-full">
            <p className="text-xl text-[#433A30]/60">Tidak ada informasi yang sesuai.</p>
          </div>
        )}
      </div>
    </div>
  );
};
