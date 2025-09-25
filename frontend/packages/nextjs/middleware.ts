import { NextRequest, NextResponse } from 'next/server';

// 需要认证保护的路径
const PROTECTED_ROUTES = [
  '/get-did-document',
  // 可以添加更多需要认证的路由
];

// 公开路径（不需要认证）
const PUBLIC_ROUTES = [
  '/',
  '/create-did',
  '/login',
  '/blockexplorer',
  '/debug',
  '/api',
  '/_next',
  '/favicon.ico',
  '/logo.svg',
  '/manifest.json',
  '/thumbnail.jpg',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否为公开路径
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // 如果是公开路径，直接通过
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // 检查是否为需要保护的路径
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // 从 cookie 中获取认证状态
    const authToken = request.cookies.get('auth_token')?.value;
    const isLoggedIn = request.cookies.get('is_logged_in')?.value === 'true';
    const currentDID = request.cookies.get('current_did')?.value;
    
    // 如果没有认证信息，重定向到登录页面
    if (!authToken || !isLoggedIn || !currentDID) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // 添加认证信息到请求头，供页面组件使用
    const response = NextResponse.next();
    response.headers.set('x-auth-token', authToken);
    response.headers.set('x-current-did', currentDID);
    response.headers.set('x-is-logged-in', 'true');
    
    return response;
  }
  
  // 默认通过
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
