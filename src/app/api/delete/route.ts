import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      )
    }

    // Delete from Vercel Blob
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
