// resendService.ts
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendSickCowAlert(email: string, cowId: string, healthNote: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Ananta Farm <alerts@yourdomain.com>',
      to: email,
      subject: `⚠️ Cow ${cowId} Reported Sick`,
      html: `<p><strong>Cow ID:</strong> ${cowId}</p><p><strong>Issue:</strong> ${healthNote}</p>`,
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
}
