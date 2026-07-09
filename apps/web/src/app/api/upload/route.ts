import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp'])

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
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${randomUUID()}.webp`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'animals')

  let processed: Buffer
  try {
    const image = sharp(buffer)
    const { format } = await image.metadata()
    if (!format || !ALLOWED_FORMATS.has(format)) {
      return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 })
    }

    processed = await image
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
  }

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), processed)

  return NextResponse.json({ url: `/uploads/animals/${filename}` })
}
