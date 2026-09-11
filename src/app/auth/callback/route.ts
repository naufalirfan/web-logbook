import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  // Redirect to home dashboard
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
