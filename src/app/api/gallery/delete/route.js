import { connectDB } from '@/src/lib/db';
import Artwork from '@/src/models/artWork';
import User from '@/src/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const artworkId = searchParams.get('id');

    if (!artworkId) {
      return NextResponse.json({ message: 'Artwork ID required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
    if (!payload?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.id);
    if (!user || user.role !== 'artist') {
      return NextResponse.json({ message: 'Only artists can delete artworks' }, { status: 403 });
    }

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return NextResponse.json({ message: 'Artwork not found' }, { status: 404 });
    }

    if (artwork.artistId !== payload.id) {
      return NextResponse.json({ message: 'Not authorized to delete this artwork' }, { status: 403 });
    }

    await Artwork.deleteOne({ _id: artworkId });
    await User.findByIdAndUpdate(payload.id, {
      $pull: { uploadedArtworks: artworkId },
    });
    return NextResponse.json({ message: 'Artwork deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete API error', error);
    return NextResponse.json({ message: 'Failed to delete artwork' }, { status: 500 });
  }
}
