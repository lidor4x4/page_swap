import { NextResponse } from 'next/server';
import { Clerk } from '@clerk/clerk-sdk-node';

export async function GET(request) {
    try {
        const url = new URL(request.url); // Create a new URL object from the request URL
        const searchParams = url.searchParams; // Get the search params from the URL object
        const userId = searchParams.get('userId'); // Get the value of the userId parameter
        const token = searchParams.get('token'); // Get the value of the token parameter

        const clerk = new Clerk({
            secretKey: process.env.CLERK_SECRET_KEY,
            jwtKey: `Bearer ${token}`,
        });

        const user = await clerk.users.getUser(userId);

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
