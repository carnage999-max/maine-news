import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToLocalMedia } from '@/lib/mediaStorage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!(imageFile instanceof File) || imageFile.size === 0) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        if (!imageFile.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const url = await uploadToLocalMedia(buffer, imageFile.name, imageFile.type, 'editorial-inline');

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Failed to upload editor image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
