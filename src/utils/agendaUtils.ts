export const getCategoryColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('KREATIF')) return 'bg-[#e5a300] text-white'; // Citrus Yellow
  if (cat.includes('WORKSHOP')) return 'bg-[#293379] text-white'; // Blue Crate
  if (cat.includes('PANEN')) return 'bg-[#ee7302] text-white'; // Orange
  if (cat.includes('UMKM')) return 'bg-[#a6af32] text-white'; // Lettuce Green
  if (cat.includes('RAPAT')) return 'bg-[#b81817] text-white'; // Tomatoe Red
  return 'bg-[#607829] text-white'; // Green Beans
};

export const getCategoryBorderColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('KREATIF')) return 'border-[#e5a300]'; 
  if (cat.includes('WORKSHOP')) return 'border-[#293379]'; 
  if (cat.includes('PANEN')) return 'border-[#ee7302]'; 
  if (cat.includes('UMKM')) return 'border-[#a6af32]'; 
  if (cat.includes('RAPAT')) return 'border-[#b81817]'; 
  return 'border-[#607829]'; 
};

export const getCategoryHoverBorderColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('KREATIF')) return 'hover:border-[#e5a300]'; 
  if (cat.includes('WORKSHOP')) return 'hover:border-[#293379]'; 
  if (cat.includes('PANEN')) return 'hover:border-[#ee7302]'; 
  if (cat.includes('UMKM')) return 'hover:border-[#a6af32]'; 
  if (cat.includes('RAPAT')) return 'hover:border-[#b81817]'; 
  return 'hover:border-[#607829]'; 
};
