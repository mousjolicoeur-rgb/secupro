import { NextResponse } from 'next/server';
import { importAgentsCSV } from '@/lib/actions/provisioning';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { societeId, filename, csvContent } = body;

    if (!societeId || !csvContent) {
      return NextResponse.json(
        { success: false, error: 'societeId et csvContent sont requis.' },
        { status: 400 }
      );
    }

    // Appel à l'action serveur qui gère le parsing, l'insertion et l'audit
    const result = await importAgentsCSV(societeId, filename || 'import.csv', csvContent);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Provisioning]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
