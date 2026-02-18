import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";

// Configure Cloudinary (Add these to your .env file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    // 1. Authenticate the User
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract File from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // 3. Convert File to Buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload to Cloudinary using a Promise wrapper
    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: "auto", // Automatically detects image vs video
          folder: "user_collections" 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // 5. Save the URL to MongoDB
    const result = await UserModel.updateOne(
      { _id: session.user._id },
      {
        $push: {
          collections: {
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
            type: uploadResponse.resource_type, // 'image' or 'video'
            createdAt: new Date(),
          },
        },
      }
    );

    return Response.json({
      success: true,
      message: "Media uploaded successfully",
      item: {
        url: uploadResponse.secure_url,
        type: uploadResponse.resource_type,
        id: uploadResponse.public_id
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ success: false, message: "Failed to upload media" }, { status: 500 });
  }
}