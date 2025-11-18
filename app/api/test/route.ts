import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  try {
    // یک query ساده روی جدول profiles
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Supabase connected successfully!',
        userCount: data.length,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
    });
  }
}
