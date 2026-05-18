import { connectDB } from '@/src/lib/db';
import Artwork from '@/src/models/artWork';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    
    const title = formData.get('title');
    const artist_name = formData.get('artist_name');
    const category = formData.get('category');
    const dimension = formData.get('dimension');
    const medium = formData.get('medium');
    const artist_note = formData.get('artist_note');
    const file = formData.get('image');

    if (!file || !title || !artist_name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudinaryResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'vanguard_art_gallery' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = cloudinaryResponse.secure_url;

    const newArtwork = new Artwork({
      title,
      artist_name,
      artistId: 'temp_artist_id_123',
      category,
      image: imageUrl,
      dimension,
      medium,
      artist_note: artist_note || '',
    });

    await newArtwork.save();

    return NextResponse.json({ message: 'Artwork uploaded successfully!', artwork: newArtwork }, { status: 201 });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: 'Something went wrong during upload' }, { status: 500 });
  }
}