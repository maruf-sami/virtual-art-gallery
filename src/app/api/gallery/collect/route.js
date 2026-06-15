import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return NextResponse.json({ message: "Please log in first" }, { status: 401 });
    }

    const token = tokenCookie.value;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const { artworkId, action } = await req.json(); 
    if (!artworkId) {
      return NextResponse.json({ message: "Artwork ID is required" }, { status: 400 });
    }

    let updateQuery = {};
    let successMessage = "";

    if (action === 'collect') {
      updateQuery = { $addToSet: { collectedArtworks: artworkId } };
      successMessage = "Masterpiece added to your collection!";
    } else if (action === 'remove') {
      updateQuery = { $pull: { collectedArtworks: artworkId } };
      successMessage = "Removed from your collection.";
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(payload.id, updateQuery, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: successMessage, 
      collectedArtworks: updatedUser.collectedArtworks 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Toggle Collect API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) return NextResponse.json({ isCollected: false });

    const payload = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get('artworkId');

    const user = await User.findById(payload.id).select('collectedArtworks');
    if (!user) return NextResponse.json({ isCollected: false });

    const isCollected = user.collectedArtworks.includes(artworkId);
    return NextResponse.json({ isCollected });
  } catch (error) {
    return NextResponse.json({ isCollected: false });
  }
}
