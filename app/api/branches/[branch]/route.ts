import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ branch: string }> }
) {
  try {
    // await the params promise
    const { branch } = await context.params;
    
    // منطق شما اینجا قرار می‌گیرد
    // مثال:
    if (!branch) {
      return NextResponse.json({ error: 'Branch parameter is required' }, { status: 400 });
    }

    // مثال بازگشت داده
    return NextResponse.json({
      id: 1,
      name: 'Branch Name',
      slug: branch,
      location: 'Location',
      lat: 35.6895,
      lng: 51.3890,
      image_url: '/images/branch.jpg'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}