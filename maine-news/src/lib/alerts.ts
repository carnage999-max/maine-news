import { Resend } from 'resend';

const DEVELOPER_EMAIL = 'jamesezekiel039@gmail.com';

export async function alertDeveloper(subject: string, message: string) {
    if (!process.env.RESEND_API_KEY) {
        console.error(`[ALERT] RESEND_API_KEY not set, cannot send alert: ${subject} - ${message}`);
        return;
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'Maine News Now <info@nathanreardon.com>',
            to: [DEVELOPER_EMAIL],
            subject: `[Maine News Now] ${subject}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #ef2b2d; border-bottom: 2px solid #ef2b2d; padding-bottom: 10px;">${subject}</h2>
                    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">${message}</div>
                </div>
            `,
        });
    } catch (error) {
        console.error('[ALERT] Failed to send developer alert email:', error);
    }
}
