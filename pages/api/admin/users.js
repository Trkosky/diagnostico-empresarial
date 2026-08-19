import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Não autorizado' })
  if (!session.user.isAdmin) return res.status(403).json({ error: 'Acesso restrito a administradores' })

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    return res.status(200).json(users)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'ID obrigatório' })
    if (id === session.user.id) return res.status(400).json({ error: 'Você não pode excluir sua própria conta' })
    await prisma.submission.updateMany({ where: { userId: Number(id) }, data: { userId: null } })
    await prisma.user.delete({ where: { id: Number(id) } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
