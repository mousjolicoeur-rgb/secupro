import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.COMPLIANCE_SUPABASE_URL
  const key = process.env.COMPLIANCE_SUPABASE_ANON_KEY

  console.log('URL length:', url?.length, 'starts:', url?.substring(0, 20))
  console.log('KEY length:', key?.length, 'starts:', key?.substring(0, 20))

  try {
    const client = createClient(url!, key!)
    const { data, error } = await client.rpc('get_analyses_safe')
    return Response.json({
      success: !error,
      error: error?.message,
      count: data?.length,
      urlLength: url?.length,
      keyLength: key?.length,
      urlStart: url?.substring(0, 20),
      urlEnd: url?.substring((url?.length ?? 0) - 5),
      keyStart: key?.substring(0, 20),
      keyEnd: key?.substring((key?.length ?? 0) - 5),
    })
  } catch (e: unknown) {
    return Response.json({ success: false, error: e instanceof Error ? e.message : String(e) })
  }
}
