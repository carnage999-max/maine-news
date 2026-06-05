import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { headline, details, isAnonymous } = data;

        if (!headline || !details) {
            return NextResponse.json({ error: 'Headline and details are required' }, { status: 400 });
        }

        const timestamp = new Date().getTime();
        const submittedAt = new Date().toISOString();
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'Maine News Now <info@nathanreardon.com>',
                to: ['jamesezekiel039@gmail.com', 'info@mainenewsnow.com', 'nathan@membershipauto.com'],
                subject: `NEWS TIP: ${headline}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #ef2b2d; border-bottom: 2px solid #ef2b2d; padding-bottom: 10px;">New Mobile News Tip</h2>
                        <p><strong>Headline:</strong> ${headline}</p>
                        <p><strong>Anonymous:</strong> ${isAnonymous ? 'Yes' : 'No'}</p>
                        <p><strong>Submitted:</strong> ${submittedAt}</p>
                        <p><strong>IP:</strong> ${ip}</p>
                        <p><strong>User Agent:</strong> ${userAgent}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap;">
                            ${details}
                        </div>
                    </div>
                `,
            });

            return NextResponse.json({
                success: true,
                message: 'Tip submitted securely. Thank you for your intelligence.',
                tipId: timestamp,
            });
        }

        // Local/dev fallback only
        const tipsDir = path.join(process.cwd(), 'secure-tips');
        try {
            await fs.access(tipsDir);
        } catch {
            await fs.mkdir(tipsDir);
        }

        const tipFileName = `tip-${timestamp}.json`;
        const tipPath = path.join(tipsDir, tipFileName);

        const tipContent = {
            id: timestamp,
            headline,
            details,
            isAnonymous,
            submittedAt,
            ip,
            userAgent
        };

        await fs.writeFile(tipPath, JSON.stringify(tipContent, null, 2), 'utf-8');

        console.log(`[SECURE TIP] Saved tip: ${tipFileName}`);

        return NextResponse.json({
            success: true,
            message: 'Tip submitted securely. Thank you for your intelligence.',
            tipId: timestamp
        });
    } catch (error) {
        console.error('Tip submission error:', error);
        return NextResponse.json({ error: 'Failed to submit tip securely' }, { status: 500 });
    }
}
