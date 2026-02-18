import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ... existing imports

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const type = searchParams.get('type'); // Added: Capture the media type

    if (!publicId) {
      return Response.json({ success: false, message: "Public ID is required" }, { status: 400 });
    }

    // 1. Remove from Cloudinary 
    // FIX: Specify resource_type so videos actually get deleted
    await cloudinary.uploader.destroy(publicId, { 
      resource_type: type === 'video' ? 'video' : 'image' 
    });

    // 2. Remove from MongoDB User Document
    // Ensure 'publicId' here matches the key name in your MongoDB Schema
    await UserModel.updateOne(
      { _id: session.user._id },
      {
        $pull: {
          collections: { publicId: publicId }
        }
      }
    );

    return Response.json({
      success: true,
      message: "Media deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Delete error:", error);
    return Response.json({ success: false, message: "Failed to delete media" }, { status: 500 });
  }
}