import { connectDB } from '@/src/lib/db';
import Artwork from '@/src/models/artWork';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const artworks = await Artwork.find({}).sort({ createdAt: -1 });

    return NextResponse.json(artworks, { status: 200 });
    
  } catch (error) {
    console.error("❌ Gallery API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch gallery masterpieces" }, 
      { status: 500 }
    );
  }
}