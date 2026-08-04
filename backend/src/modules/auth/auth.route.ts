import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { registerSchema, loginSchema, updateProfileSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

const router = Router();

// Mapping User Prisma -> UserProfile frontend
function toProfile(u: any) {
  return {
    id: u.id,
    name: u.name,
    role: u.role === 'ADMIN' ? 'Administrator' : 'Anggota KWT Melati Sorgum',
    avatar: u.avatar || '',
    isAdmin: u.role === 'ADMIN',
    phone: u.phone || '',
    lahanLocation: u.lahanLocation || '',
    sorghumType: u.sorghumType || '',
    memberSince: u.memberSince || '',
    firstName: u.firstName || u.name.split(' ')[0] || '',
    lastName: u.lastName || u.name.split(' ').slice(1).join(' ') || '',
    dob: u.dob || '',
    email: u.email,
    country: u.country || '',
    city: u.city || '',
    postalCode: u.postalCode || '',
  };
}

// ── POST /api/auth/register ────────────────────────
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;

    if (await prisma.user.findUnique({ where: { email } })) {
      throw new AppError('Email sudah terdaftar', 409);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
        phone: phone || '',
        memberSince: 'Hari ini',
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    return successResponse(res, { token, user: toProfile(user) }, 'Registrasi berhasil', 201);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ───────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Email atau password salah', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    return successResponse(res, { token, user: toProfile(user) }, 'Login berhasil');
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ───────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError('User tidak ditemukan', 404);
    return successResponse(res, toProfile(user));
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/auth/profile ──────────────────────────
router.put('/profile', authenticate, validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, dob, email, phone, avatar, country, city, postalCode, lahanLocation, sorghumType } = req.body;

    const dataToUpdate: any = {};
    if (firstName !== undefined) dataToUpdate.firstName = firstName;
    if (lastName !== undefined) dataToUpdate.lastName = lastName;
    if (firstName !== undefined || lastName !== undefined) {
      // derive name
      const current = await prisma.user.findUnique({ where: { id: userId } });
      const fName = firstName !== undefined ? firstName : current?.firstName || '';
      const lName = lastName !== undefined ? lastName : current?.lastName || '';
      dataToUpdate.name = `${fName} ${lName}`.trim();
    }
    
    if (dob !== undefined) dataToUpdate.dob = dob;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    if (country !== undefined) dataToUpdate.country = country;
    if (city !== undefined) dataToUpdate.city = city;
    if (postalCode !== undefined) dataToUpdate.postalCode = postalCode;
    if (lahanLocation !== undefined) dataToUpdate.lahanLocation = lahanLocation;
    if (sorghumType !== undefined) dataToUpdate.sorghumType = sorghumType;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    return successResponse(res, toProfile(updatedUser), 'Profil berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

export default router;
