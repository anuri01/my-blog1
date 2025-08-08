import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

function NaverCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useUserStore();

  useEffect(() => {
    // 1. URL에서 'token' 값을 꺼냅니다.
    const token = searchParams.get('token');

    // 2. 토큰이 존재하면,
    if (token) {
      // 3. Zustand 스토어에 토큰을 저장하여 로그인 상태로 만듭니다.
      setToken(token);
      // 4. 즉시 홈페이지로 이동시킵니다.
      navigate('/');
    } else {
      // 토큰이 없는 비정상적인 접근일 경우, 로그인 페이지로 보냅니다.
      alert('로그인에 실패했습니다.');
      navigate('/login');
    }
  }, [searchParams, navigate, setToken]);

  // 이 페이지는 사용자에게 로딩 중이라는 것만 보여줍니다.
  return <div>로그인 처리 중...</div>;
}

export default NaverCallback;