const fs = require('fs');

function moveSaveBtnToInsideDropdown(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // 1. Remove Save Button from Top Header
  const topHeaderOld = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Konten Website
                  </h1>
                  <p className="text-sm text-[#7A7062] font-medium mt-1">
                    Klik pada kartu di bawah untuk membuka dan mengedit konten secara langsung (dropdown).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCms as any}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Save className="w-4 h-4 text-[#A8B774]" />
                  Simpan Semua Perubahan
                </button>
              </div>`;

  const topHeaderNew = `<div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Kelola Konten Website
                </h1>
                <p className="text-sm text-[#7A7062] font-medium mt-1">
                  Klik pada kartu di bawah untuk membuka dan mengedit konten secara langsung (dropdown).
                </p>
              </div>`;

  if (c.includes(topHeaderOld)) {
    c = c.replace(topHeaderOld, topHeaderNew);
  }

  // 2. Add Save Button inside each Editor Form section
  const saveBtnInsideForm = `
                                  <div className="pt-4 border-t border-[#E6E1D5] flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleSaveCms as any}
                                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-md active:scale-95"
                                    >
                                      <Save className="w-4 h-4 text-[#A8B774]" />
                                      Simpan Perubahan
                                    </button>
                                  </div>`;

  // Insert save button before closing </div> of each key editor
  // Key 1: identitas
  c = c.replace(
    `setCmsUploading(false);\n                                            }\n                                          }}\n                                        />\n                                      </label>\n                                    </div>\n                                  </div>\n                                </div>\n                              )}`,
    `setCmsUploading(false);\n                                            }\n                                          }}\n                                        />\n                                      </label>\n                                    </div>\n                                  </div>\n${saveBtnInsideForm}\n                                </div>\n                              )}`
  );

  // Key 2: landing
  c = c.replace(
    `setCmsUploading(false);\n                                            }\n                                          }}\n                                        />\n                                      </label>\n                                    </div>\n                                  </div>\n                                </div>\n                              )}`,
    `setCmsUploading(false);\n                                            }\n                                          }}\n                                        />\n                                      </label>\n                                    </div>\n                                  </div>\n${saveBtnInsideForm}\n                                </div>\n                              )}`
  );

  // Key 3: login
  c = c.replace(
    `className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"\n                                    />\n                                  </div>\n                                </div>\n                              )}`,
    `className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"\n                                    />\n                                  </div>\n${saveBtnInsideForm}\n                                </div>\n                              )}`
  );

  // Key 4: register
  c = c.replace(
    `className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"\n                                    />\n                                  </div>\n                                </div>\n                              )}`,
    `className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"\n                                    />\n                                  </div>\n${saveBtnInsideForm}\n                                </div>\n                              )}`
  );

  // Key 5: footer
  c = c.replace(
    `className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"\n                                      />\n                                    </div>\n                                  </div>\n                                </div>\n                              )}`,
    `className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"\n                                      />\n                                    </div>\n                                  </div>\n${saveBtnInsideForm}\n                                </div>\n                              )}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Finished updating save button position in ' + filePath);
}

moveSaveBtnToInsideDropdown('src/components/views/admin/AdminPortalViewLite.tsx');
moveSaveBtnToInsideDropdown('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

moveSaveBtnToInsideDropdown('src/components/views/admin/AdminPortalView.tsx');
moveSaveBtnToInsideDropdown('frontend/src/components/views/admin/AdminPortalView.tsx');

console.log('Done moving save buttons.');
