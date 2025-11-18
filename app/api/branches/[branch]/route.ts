import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET({ params }: { params: { branch: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const branchSlug = params.branch;

  if (!branchSlug) {
    return NextResponse.json({ error: 'branch param is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('branches')
    .select('id, name, slug, location, lat, lng, image_url')
    .eq('slug', branchSlug)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
