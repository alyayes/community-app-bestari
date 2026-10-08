import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSizeOption = 'kecil' | 'sedang' | 'besar';

interface FontSizeContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

/**
 * Peta ukuran font ke nilai px pada elemen <html>.
 * Pendekatan ini mengikuti pola WhatsApp: mengubah base font-size
 * sehingga semua elemen yang menggunakan rem/em otomatis menyesuaikan.
 */
const FONT_SIZE_MAP: Record<FontSizeOption, string> = {
  kecil: '13px',
  sedang: '14.5px',
  besar: '16.5px',
};

const STORAGE_KEY = 'bestari_font_size';

export const FontSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'kecil' || saved === 'sedang' || saved === 'besar') return saved;
    return 'sedang';
  });

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) throw new Error('useFontSize must be used within FontSizeProvider');
  return context;
};
