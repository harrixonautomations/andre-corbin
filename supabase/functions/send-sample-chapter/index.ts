import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured. Please add your Resend API key in project settings.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) throw new Error('Unauthorized');

    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) throw new Error('Forbidden: Admin access required');

    const { requestId } = await req.json();
    if (!requestId) throw new Error('Missing requestId');

    // Get sample request
    const { data: sampleReq, error: reqErr } = await supabase
      .from('sample_requests')
      .select('id, email, book_id, status')
      .eq('id', requestId)
      .single();

    if (reqErr || !sampleReq) throw new Error('Sample request not found');
    if (!sampleReq.book_id) throw new Error('No book associated with this request');

    // Get book info
    const { data: book, error: bookErr } = await supabase
      .from('books')
      .select('title, sample_chapter_url')
      .eq('id', sampleReq.book_id)
      .single();

    if (bookErr || !book) throw new Error('Book not found');
    if (!book.sample_chapter_url) throw new Error('No sample chapter uploaded for this book. Please upload one first in the Samples tab.');

    // Download sample chapter from storage
    const { data: fileData, error: fileErr } = await supabase
      .storage
      .from('sample-chapters')
      .download(book.sample_chapter_url);

    if (fileErr || !fileData) throw new Error('Failed to download sample chapter file');

    // Convert to base64 for email attachment
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Content = btoa(binary);

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Andre' Corbin <onboarding@resend.dev>",
        to: [sampleReq.email],
        subject: `Your Free Chapter: ${book.title}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #1a1a1a; margin-bottom: 16px;">Here's your free chapter!</h2>
            <p style="color: #444; line-height: 1.6;">
              Thank you for your interest in <strong>"${book.title}"</strong>.
              Please find the sample chapter attached to this email.
            </p>
            <p style="color: #444; line-height: 1.6; margin-top: 24px;">
              Enjoy the read, and feel free to reach out if you have any questions.
            </p>
            <p style="color: #444; line-height: 1.6; margin-top: 32px;">
              Best regards,<br>
              <strong>Andre' Corbin</strong>
            </p>
          </div>
        `,
        attachments: [{
          filename: `${book.title} - Sample Chapter.pdf`,
          content: base64Content,
        }],
      }),
    });

    if (!emailResponse.ok) {
      const errBody = await emailResponse.text();
      throw new Error(`Email sending failed [${emailResponse.status}]: ${errBody}`);
    }

    // Update status to sent
    await supabase.from('sample_requests').update({ status: 'sent' }).eq('id', requestId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-sample-chapter:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
