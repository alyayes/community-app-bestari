import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { successResponse } from '../../utils/response';

const router = Router();

// Get the global CMS configuration
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let cms = await prisma.cms.findUnique({ where: { id: 'global' } });
    
    // If not exists, create with defaults
    if (!cms) {
      cms = await prisma.cms.create({
        data: {
          id: 'global',
          landingTitle: 'Menanam Bersama,\\nTumbuh Bersama',
          landingDesc: 'Wadah digital interaktif bagi ibu-ibu KWT Melati Sorgum. Mari saling terhubung untuk mencatat hasil panen, berdiskusi, dan memajukan produk olahan lokal kita bersama.',
          landingImages: [
            {
              url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920',
              title: 'Senja Keemasan di Ladang Sorgum Desa',
              caption: 'Mendukung Ketahanan Pangan Nasional Melalui Komunitas Petani Wanita'
            },
            {
              url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1920',
              title: 'Budidaya Sorgum Bioguma Agritan',
              caption: 'Hasil Tanaman Berkualitas Tinggi dengan Penerapan Teknologi Ramah Lingkungan'
            },
            {
              url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1920',
              title: 'Gotong Royong Panen Raya KWT',
              caption: 'Semangat Kebersamaan Ibu-Ibu Tani Membangun Ekonomi Kemandirian Desa'
            }
          ],
          loginTitle: 'Selamat Datang Kembali Ibu!',
          loginDesc: 'Masuk ke akun Anda untuk melihat catatan panen, informasi agenda gotong royong, serta kabar diskusi komunitas KWT Melati Sorgum.',
          loginImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
          registerTitle: 'Bergabung Bersama Kami Ibu!',
          registerDesc: 'Daftarkan diri Anda untuk bergabung dengan komunitas petani wanita KWT Melati Sorgum. Mari bersama-sama membangun kemandirian ekonomi dari desa.',
          registerImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200'
        }
      });
    }

    return successResponse(res, cms);
  } catch (err) {
    next(err);
  }
});

// Update the global CMS configuration (Admin only)
router.put('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus Admin.' });
    }

    const data = req.body;
    const cms = await prisma.cms.upsert({
      where: { id: 'global' },
      update: {
        landingTitle: data.landingTitle,
        landingDesc: data.landingDesc,
        landingImages: data.landingImages,
        loginTitle: data.loginTitle,
        loginDesc: data.loginDesc,
        loginImage: data.loginImage,
        loginImages: Array.isArray(data.loginImages) ? data.loginImages : (data.loginImage ? [{ url: data.loginImage, title: '', caption: '' }] : []),
        registerTitle: data.registerTitle,
        registerDesc: data.registerDesc,
        registerImage: data.registerImage,
        registerImages: Array.isArray(data.registerImages) ? data.registerImages : (data.registerImage ? [{ url: data.registerImage, title: '', caption: '' }] : [])
      },
      create: {
        id: 'global',
        landingTitle: data.landingTitle,
        landingDesc: data.landingDesc,
        landingImages: data.landingImages,
        loginTitle: data.loginTitle,
        loginDesc: data.loginDesc,
        loginImage: data.loginImage,
        loginImages: Array.isArray(data.loginImages) ? data.loginImages : [],
        registerTitle: data.registerTitle,
        registerDesc: data.registerDesc,
        registerImage: data.registerImage,
        registerImages: Array.isArray(data.registerImages) ? data.registerImages : []
      }
    });

    return successResponse(res, cms, 'Tampilan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

export default router;
