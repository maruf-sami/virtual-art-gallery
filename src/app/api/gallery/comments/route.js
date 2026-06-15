import { connectDB } from '@/src/lib/db';
import Comment from '@/src/models/Comment';
import Artwork from '@/src/models/artWork';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get('artworkId');

    if (!artworkId || !mongoose.Types.ObjectId.isValid(artworkId)) {
      return NextResponse.json({ message: "Valid Artwork ID required" }, { status: 400 });
    }

    const comments = await Comment.find({ artworkId }).sort({ createdAt: -1 });
    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("❌ GET Comments Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: "Please log in to comment" }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { artworkId, text, commentId } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ message: "Comment text cannot be empty" }, { status: 400 });
    }

    if (!artworkId || !mongoose.Types.ObjectId.isValid(artworkId)) {
      return NextResponse.json({ message: "Invalid Artwork ID" }, { status: 400 });
    }

    const userId = decoded.id || decoded._id;
    const userName = decoded.name || decoded.username || "Anonymous";
    const userRole = decoded.role || "visitor";

    if (!userId) {
      return NextResponse.json({ message: "User identity mismatch" }, { status: 400 });
    }

    const cleanUserId = new mongoose.Types.ObjectId(userId);
    const cleanArtworkId = new mongoose.Types.ObjectId(artworkId);

    if (commentId) {
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return NextResponse.json({ message: "Invalid Comment ID for reply" }, { status: 400 });
      }

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $push: { replies: { userId: cleanUserId, userName, userRole, text } } },
        { new: true }
      );
      return NextResponse.json({ message: "Reply added!", comment: updatedComment }, { status: 201 });
    } else {
      
      const newComment = await Comment.create({ 
        artworkId: cleanArtworkId, 
        userId: cleanUserId, 
        userName, 
        userRole, 
        text 
      });
      return NextResponse.json({ message: "Comment posted!", comment: newComment }, { status: 201 });
    }
  } catch (error) {
    console.error("❌ Post Comment API Error:", error);
    return NextResponse.json({ message: error.message || "Failed to post comment" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { commentId, artworkId } = await req.json();
    const artwork = await Artwork.findById(artworkId);
    
    const currentUserId = decoded.id || decoded._id;

    if (!artwork || artwork.artistId.toString() !== currentUserId.toString()) {
      return NextResponse.json({ message: "Only the artist of this artwork can delete comments" }, { status: 403 });
    }

    await Comment.findByIdAndDelete(commentId);
    return NextResponse.json({ message: "Comment removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE Comment Error:", error);
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
