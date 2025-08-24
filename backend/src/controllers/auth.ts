import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, generateToken } from '@/utils/auth';
import { createError } from '@/middleware/errorHandler';
import { loginSchema, registerSchema } from '@fisiohub/shared';

export const register = async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  
  // No novo schema enterprise, precisaríamos do hospitalId para verificar email único
  // Por enquanto, vamos verificar se existe algum usuário com esse email
  const existingUser = await prisma.user.findFirst({
    where: { email: validatedData.email }
  });
  
  if (existingUser) {
    throw createError('Email já está em uso', 400);
  }
  
  if (validatedData.crf) {
    const existingCrf = await prisma.user.findFirst({
      where: { crf: validatedData.crf }
    });
    
    if (existingCrf) {
      throw createError('CRF já está em uso', 400);
    }
  }
  
  const hashedPassword = await hashPassword(validatedData.password);
  
  const user = await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      crf: true,
      phone: true,
      specialty: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });
  
  res.status(201).json({
    success: true,
    message: 'Usuário criado com sucesso',
    data: {
      user,
      token,
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  
  // No novo schema enterprise, email não é mais único globalmente
  // Precisamos buscar o primeiro usuário com esse email
  const user = await prisma.user.findFirst({
    where: { email: validatedData.email }
  });
  
  if (!user) {
    throw createError('Credenciais inválidas', 401);
  }
  
  const isPasswordValid = await comparePassword(validatedData.password, user.password);
  
  if (!isPasswordValid) {
    throw createError('Credenciais inválidas', 401);
  }
  
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });
  
  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        crf: user.crf,
        phone: user.phone,
        specialty: user.specialty,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    }
  });
};

export const me = async (req: Request, res: Response) => {
  const authReq = req as any;
  const userId = authReq.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      crf: true,
      phone: true,
      specialty: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }
  
  res.json({
    success: true,
    data: user
  });
};