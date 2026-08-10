const fs = require('fs');
let content = fs.readFileSync('d:/Project Bestari/frontend/src/components/views/DiskusiView.tsx', 'utf8');

content = content.replace(/const categoryOptions = \[\s*\{ name: 'Semua Topik', label:[^\]]+\];/m, 
`const categoryOptions = [
    { name: 'Semua Topik', label: '💬 Semua Topik' },
    { name: 'Produksi & Pengolahan', label: '🥣 Produksi & Pengolahan' },
    { name: 'Budidaya Lahan', label: '🌾 Budidaya Lahan' },
    { name: 'Pemasaran & UMKM', label: '🛍️ Pemasaran & UMKM' },
    { name: 'Informasi Umum', label: '📢 Informasi Umum' }
  ];`);

content = content.replace(/const getCategoryEmoji = \(category: string\) => \{[^}]+\};/m,
`const getCategoryEmoji = (category: string) => {
    if (category.includes('Produksi')) return '🥣';
    if (category.includes('Budidaya')) return '🌾';
    if (category.includes('Pemasaran')) return '🛍️';
    return '📢';
  };`);

content = content.replace(/<select\s+value=\{editCategory\}[^>]+>[\s\S]*?<\/select>/,
`<select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#A8B774] bg-[#FAF6EE] text-[#433A30] font-bold focus:outline-none focus:border-[#2C4219] cursor-pointer"
                >
                  <option value="Produksi & Pengolahan">🥣 Produksi & Pengolahan</option>
                  <option value="Budidaya Lahan">🌾 Budidaya Lahan</option>
                  <option value="Pemasaran & UMKM">🛍️ Pemasaran & UMKM</option>
                  <option value="Informasi Umum">📢 Informasi Umum</option>
                </select>`);

content = content.replace(/content: \`[^`]+ Ibu \$\{currentUser\.name\} telah bergabung ke dalam grup\.\`,/, 'content: `🎉 Ibu ${currentUser.name} telah bergabung ke dalam grup.`,');
content = content.replace(/content: \`[^`]+ Ibu \$\{currentUser\.name\} telah keluar dari grup\.\`,/, 'content: `👋 Ibu ${currentUser.name} telah keluar dari grup.`,');
content = content.replace(/content: \`[^`]+ \$\{memberName\} telah dikeluarkan dari grup oleh Admin\.\`,/, 'content: `👢 ${memberName} telah dikeluarkan dari grup oleh Admin.`,');

content = content.replace(/[^>]+ \{activeThread\.joinedMembers \? activeThread\.joinedMembers\.length : 3\} Anggota/, '👥 {activeThread.joinedMembers ? activeThread.joinedMembers.length : 3} Anggota');
content = content.replace(/<span>[^<]+ Hanya pembuat grup \/ admin yang dapat mengirim pesan di grup pengumuman ini\.<\/span>/, '<span>🔒 Hanya pembuat grup / admin yang dapat mengirim pesan di grup pengumuman ini.</span>');

content = content.replace(/const sampleEmojis = \[.*?\];/, 
`const sampleEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
  '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄',
  '🌾', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌽', '🍅', '🍆', '🥔', '🍠', '🥑', '🥦', '🥬', '🌶', '🥒', '🥥', '🥭', '🍉', '🍌', '🍋', '🍊', '🍎', '🍓', '🍒', '🍑', '🍍', '🥝',
  '🥣', '🥗', '🍲', '🍚', '🍜', '🍝', '🍞', '🥩', '🍗', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍳', '🧀',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '🔥', '💧', '☀️', '⭐', '🌟', '💯', '✔️', '❌', '✅', '⚠️', '❗', '❓'
];`);

content = content.replace(/\{showEmojiPicker && \([\s\S]*?<div className="p-2 bg-white border border-\[#E6E1D5\] rounded-xl shadow-lg flex items-center gap-1\.5 overflow-x-auto mx-4 my-1 shrink-0 z-10">[\s\S]*?\{sampleEmojis\.map\(\(e, idx\) => \([\s\S]*?<button[\s\S]*?onClick=\{[\s\S]*?handle[\s\S]*?className="p-1\.5 text-base hover:bg-\[#FAF6EE\] rounded-lg transition-transform active:scale-125"[\s\S]*?>[\s\S]*?\{e\}[\s\S]*?<\/button>[\s\S]*?\}\)\}[\s\S]*?<\/div>[\s\S]*?\)\}/,
`{showEmojiPicker && (
                          <div className="absolute bottom-[72px] left-4 sm:left-6 w-[300px] sm:w-[350px] bg-white border border-[#E6E1D5] rounded-xl shadow-2xl p-3 z-50 animate-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 h-48 overflow-y-auto pr-1 pb-1 emoji-scrollbar">
                              {sampleEmojis.map((e, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleAddEmoji(e)}
                                  className="p-1.5 text-lg sm:text-xl hover:bg-[#FAF6EE] rounded-lg transition-transform active:scale-125 flex items-center justify-center"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}`);

fs.writeFileSync('d:/Project Bestari/frontend/src/components/views/DiskusiView.tsx', content, 'utf8');
console.log('done');
