import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { message: "No file uploaded" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
        const uploadDir = path.join(process.cwd(), "public/uploads");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: "Upload failed" },
            { status: 500 }
        );
    }
}
