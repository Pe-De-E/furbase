import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file || !file.size) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${randomUUID()}.webp`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'animals')

  await mkdir(uploadDir, { recursive: true })

  const processed = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  await writeFile(path.join(uploadDir, filename), processed)

  return NextResponse.json({ url: `/uploads/animals/${filename}` })
}
