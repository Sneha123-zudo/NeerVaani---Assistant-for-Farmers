
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "firebase-admin";
import { initFirebaseAdmin } from "@/lib/firebase/firebase-admin";

// This route is called by the client to create a session cookie after login.
export async function POST(request: NextRequest) {
    await initFirebaseAdmin();

    const reqBody = (await request.json()) as { idToken: string };
    const idToken = reqBody.idToken;

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    try {
        const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
        const options = {
            name: "session",
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
        };

        const response = NextResponse.json({}, { status: 200 });
        response.cookies.set(options);
        return response;

    } catch (error) {
        console.error("Error creating session cookie", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// This route is called by the client to clear the session cookie on logout.
export async function DELETE() {
    const options = {
        name: "session",
        value: "",
        maxAge: -1,
    };

    const response = NextResponse.json({}, { status: 200 });
    response.cookies.set(options);
    return response;
}
