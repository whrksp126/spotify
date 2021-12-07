import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from '../../../lib/spotify';

async function refreshAccessToken(token){
  try {

    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const {body: refreshedToken} = await spotifyApi.refreshAccessToken();
    console.log('REFRESHED TOKEN IS, 갱신된 토큰은', refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now + refreshedToken.expores_in * 1000, // = Spotify API에서 3600 반환으로 1시간
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,

    }

  } catch (error) {
    console.error(error);
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    }
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authrization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({token, account, user}){
      // 초기 로그인
      if(account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
          // 만료 시간을 밀리초 단위로 처리하므로 * 1000
        }
      }
      // 액세스 토큰이 아직 만료되지 않은 경우 이전 토큰 반환
      if(Date.now() < token.accessTokenExpires){
        console.log('EXISTING ACCESS TOKEN IS VALID, 기존 액세스 토큰이 유효합니다')
        return token;
      }
      // 액세스 토큰이 만료되었으므로 새로 고쳐야 합니다...
      console.log('ACCESS TOKEN HAS EXPIRED, REFRESHING..., 액세스 토큰이 만료되었습니다. 새로고침 중...')
      return await refreshAccessToken(token);
    },


    async session({session, token}){
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    }
  },
});