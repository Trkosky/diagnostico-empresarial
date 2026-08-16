const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const subs = await prisma.submission.findMany({ orderBy: { createdAt: 'desc' } })
  console.log('Submissions count:', subs.length)
  subs.forEach(s => {
    console.log('---')
    console.log('id:', s.id)
    console.log('email:', s.email)
    console.log('createdAt:', s.createdAt)
    console.log('data:', s.data)
  })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
