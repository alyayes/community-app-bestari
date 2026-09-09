/**
 * Script untuk membersihkan URL absolut lama (seperti community-bestari.kolab.top atau localhost)
 * menjadi relative path (/uploads/...) di semua tabel database.
 *
 * Jalankan dengan: node clean_upload_urls.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function cleanUrl(u) {
  if (!u || typeof u !== 'string') return u;
  const idx = u.indexOf('/uploads/');
  if (idx !== -1) {
    return u.substring(idx);
  }
  return u;
}

function cleanArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => cleanUrl(item));
}

async function main() {
  console.log('--- Mulai Pembersihan URL Uploads di Database ---');

  // 1. Bersihkan Agenda (materiUrls, dokumentasiUrls)
  const agendas = await prisma.agenda.findMany();
  let updatedAgendas = 0;
  for (const ag of agendas) {
    let rawMateri = ag.materiUrls;
    if (typeof rawMateri === 'string') {
      try { rawMateri = JSON.parse(rawMateri); } catch {}
    }
    let rawDok = ag.dokumentasiUrls;
    if (typeof rawDok === 'string') {
      try { rawDok = JSON.parse(rawDok); } catch {}
    }

    const cleanedMateri = cleanArray(rawMateri);
    const cleanedDok = cleanArray(rawDok);

    const isMateriChanged = JSON.stringify(rawMateri) !== JSON.stringify(cleanedMateri);
    const isDokChanged = JSON.stringify(rawDok) !== JSON.stringify(cleanedDok);

    if (isMateriChanged || isDokChanged) {
      await prisma.agenda.update({
        where: { id: ag.id },
        data: {
          materiUrls: cleanedMateri,
          dokumentasiUrls: cleanedDok
        }
      });
      console.log(`[Agenda] Berhasil update agenda id ${ag.id}: ${ag.title}`);
      updatedAgendas++;
    }
  }
  console.log(`Selesai Agenda: ${updatedAgendas} agenda diperbarui.`);

  // 2. Bersihkan Artikel (image, gallery, authorAvatar)
  const artikels = await prisma.artikel.findMany();
  let updatedArtikels = 0;
  for (const art of artikels) {
    let rawGallery = art.gallery;
    if (typeof rawGallery === 'string') {
      try { rawGallery = JSON.parse(rawGallery); } catch {}
    }
    const cleanedImage = cleanUrl(art.image);
    const cleanedAvatar = cleanUrl(art.authorAvatar);
    const cleanedGallery = cleanArray(rawGallery);

    const isChanged =
      cleanedImage !== art.image ||
      cleanedAvatar !== art.authorAvatar ||
      JSON.stringify(rawGallery) !== JSON.stringify(cleanedGallery);

    if (isChanged) {
      await prisma.artikel.update({
        where: { id: art.id },
        data: {
          image: cleanedImage,
          authorAvatar: cleanedAvatar,
          gallery: cleanedGallery
        }
      });
      console.log(`[Artikel] Berhasil update artikel id ${art.id}: ${art.title}`);
      updatedArtikels++;
    }
  }
  console.log(`Selesai Artikel: ${updatedArtikels} artikel diperbarui.`);

  // 3. Bersihkan Avatar User
  const users = await prisma.user.findMany();
  let updatedUsers = 0;
  for (const u of users) {
    const cleanedAvatar = cleanUrl(u.avatar);
    if (cleanedAvatar !== u.avatar) {
      await prisma.user.update({
        where: { id: u.id },
        data: { avatar: cleanedAvatar }
      });
      console.log(`[User] Berhasil update avatar user: ${u.email}`);
      updatedUsers++;
    }
  }
  console.log(`Selesai User: ${updatedUsers} user diperbarui.`);

  console.log('--- Pembersihan Selesai ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
