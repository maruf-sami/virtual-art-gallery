import { NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db'; 
import Artwork from '@/src/models/artWork'; 
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { id } = await params; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid Artwork ID format" }, 
        { status: 400 }
      );
    }

    await connectDB();

    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return NextResponse.json(
        { message: "Artwork not found in database" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(artwork, { status: 200 });

  } catch (error) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  }
}