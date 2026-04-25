import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { agents, societeId, batchId } = body;

    return NextResponse.json({
      success: true,
      organization_id: societeId,
      successful: agents?.length || 0,
      failed: 0,
      duplicates: 0,
      batchId,
      message: 'Import successful'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
