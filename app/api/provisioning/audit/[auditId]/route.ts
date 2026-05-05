import { createClient } from '@supabase/supabase-js';

export async function GET(_req: Request, { params }: { params: Promise<{ auditId: string }> }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { auditId } = await params;

  if (!auditId) return Response.json({ error: 'Audit ID manquant' }, { status: 400 });

  try {
    const { data: audit, error } = await supabase
      .from('import_audits')
      .select('*')
      .eq('id', auditId)
      .single();

    if (error || !audit) return Response.json({ error: 'Audit non trouvé' }, { status: 404 });

    return Response.json(audit);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
