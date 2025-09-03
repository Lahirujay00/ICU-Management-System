import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    nextAuthUrl: process.env.NEXTAUTH_URL ? 'SET' : 'NOT_SET',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('GOOGLE') || key.includes('NEXTAUTH')
    )
  })
}
