import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { authors } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const profiles = await db.query.authors.findMany({
            orderBy: [desc(authors.createdAt)],
            columns: {
                id: true,
                name: true,
                role: true,
                avatar: true,
                bio: true,
                email: true,
                contactInfo: true,
            },
        });

        return NextResponse.json({ authors: profiles });
    } catch (error) {
        console.error('Failed to fetch public authors:', error);
        return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
    }
}
