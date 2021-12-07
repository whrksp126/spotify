import { signIn,useSession } from "next-auth/react";
import {useEffect} from 'react';
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
});

function useSpotify() {
  const {data: session, status} = useSession();

  useEffect(() => {
    if(session) {
      // 액세스 토큰 새로 고침 시도가 실패하면 사용자를 로그인하도록 안내합니다...
      if(session.error === 'RefreshAccessTokenError'){
        signIn();
      }
      spotifyApi.setAccessToken(session.user.accessToken);
    }
  }, [session])

  return spotifyApi;

}

export default useSpotify
