import { getToken } from "next-auth/jwt";
import {NextResponse} from 'next/server';

export async function middleware(req) {
  // 사용자가 로그인하면 토큰이 존재합니다.
  const token = await getToken({req, secret: process.env.JWT_SECRET});

  const {pathname} = req.nextUrl

  // 다음이 참이면 요청을 허용합니다...
  // 1) 다음 인증 세션에 대한 요청입니다.
  // 2) 토큰이 존재
  if(pathname.includes('/api/auth') || token){
    return NextResponse.next();
  }

  // 토큰이 없고 보호된 경로를 요청하는 경우 로그인하도록 리디렉션합니다.
  if(!token && pathname !== '/login'){
    return NextResponse.redirect('/login');
  }
}