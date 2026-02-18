import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import { NextResponse } from "next/server";
import { useSession } from "next-auth/react";

export async function GET(request: Request) {
  await dbConnect();
  

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    // Find user and select only public fields
    // We include 'isAcceptingMessage' and 'collections'
    const user = await UserModel.findOne({ username }).select(
      "username isAcceptingMessage collections"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          username: user.username,
          isAcceptingMessage: user.isAcceptingMessage,
          collections: user.collections || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}