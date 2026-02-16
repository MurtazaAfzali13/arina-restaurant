// app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log('Test API - Full URL:', url.toString());
  console.log('Test API - Pathname:', url.pathname);
  
  return NextResponse.json({
    status: 'ok',
    message: 'Test API is working',
    timestamp: new Date().toISOString()
  });
}