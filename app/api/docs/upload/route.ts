import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 30;

// Prefer SUPABASE_SERVICE_ROLE_KEY (added more recently), fall back to SUPABASE_SERVICE_KEY
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceKey,
);

const BUCKET = 'documents-agents';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file   = formData.get('file')   as File   | null;
    const userId = (formData.get('userId') as string) || 'unknown';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path     = `${userId}/${Date.now()}_${safeName}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ file_url: data.publicUrl, file_path: path });
  } catch (err) {
    console.error('[docs/upload]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload échoué' },
      { status: 500 },
    );
  }
}
