import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 400 });
        }

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: process.env.TURNSTILE_SECRET_KEY!,
                response: token,
            }),
        });

        const data = await response.json();

        console.log('Turnstile verification response:', data);

        if (data.success) {
            return NextResponse.json({ success: true, message: 'Token verified!' });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Verification failed',
                errors: data['error-codes'],
            });
        }
    } catch (error) {
        console.error('Turnstile test error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
