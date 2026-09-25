import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      slug,
      code,
      description,
      startDate,
      endDate,
      location,
      status,
    } = body;

    if (!name || !slug || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, slug, start date and end date are required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingEvent = await Event.findOne({
      slug,
    });

    if (existingEvent) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An event with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const event = await Event.create({
      name: name.trim(),

      slug: slug.trim().toLowerCase(),

      code: code?.trim() || "",

      description:
        description?.trim() ||
        "Event badge management workspace.",

      startDate,

      endDate,

      location:
        location?.trim() || "Location not set",

      status: status ?? "draft",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        event,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create event",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}