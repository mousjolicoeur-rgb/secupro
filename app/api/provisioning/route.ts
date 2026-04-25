import { NextResponse } from 'next/server';
import { importAgentsCSV } from '@/lib/actions/provisioning';
import { z } from 'zod';

const provisioningSchema = z.object({
  societeId: z.string().uuid("L'identifiant de société doit être un UUID valide"),
  filename: z.string().optional(),
  csvContent: z.string().min(1, "Le contenu CSV ne peut pas être vide")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = provisioningSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides : ' + validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { societeId, filename, csvContent } = validated.data;

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
