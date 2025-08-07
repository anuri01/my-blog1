import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// 1. 스토어의 기본 틀은 그대로입니다.
const useUserStore = create((set) => { // 로직을 통해 state(상태)가 결정되므로 묵시적반환'()'으로 감싸지 않음.
  const token = localStorage.getItem('token');
  
  // 2. 스토어가 처음 로드될 때, 만료 시간을 확인하는 로직을 추가합니다.
  // 토큰의 exp(토튼 발행시간에 유효시간을 더한 값) 값을 바탕으로 토큰 휴효시간 계산으로 변경
  // const loginTime = localStorage.getItem('loginTime');
  // const ONE_HOUR = 60 * 60 * 1000; // 1시간을 밀리초로 계산, 변하지 않는 상수이므로 대문자로 표기

  // 상태에 따라 재할당 되므로 let으로 선언  
  let initialState = {
    token: null,
    isLoggedIn: false,
    user: null
  };

  // 토큰과 로그인 시간이 모두 존재하고, 1시간이 지나지 않았다면 로그인 상태로 초기화합니다.
  if (token) {
    const decodedToken = jwtDecode(token);
    // 토큰의 만료 시간(exp)과 현재 시간을 직접 비교함. exp의 시간은 초로 되어있어 밀리세컨드로 변환
    if(decodedToken.exp * 1000 > Date.now()) {
      initialState = { token, isLoggedIn: true, user: decodedToken };
    }    
  } else {
    // 토큰이 만료되었거나 없다면 localStorage를 깨끗하게 비웁니다.
    localStorage.removeItem('token');
  }

  // 3. 계산된 초기 상태와 액션들을 반환합니다.
  return {
    ...initialState,
    setToken: (token) => {
      const decodedToken = jwtDecode(token);
      localStorage.setItem('token', token);
      //  로그인 시, 현재 시간을 함께 저장합니다. => 토큰의 exp와 비교하기 때문에 필요없어짐
      // localStorage.setItem('loginTime', new Date().getTime());
      set({ token, isLoggedIn: true, user: decodedToken });
    },
    logout: () => {
      // 로그아웃 시, 토큰과 시간 기록을 모두 삭제합니다. 시간 기록은 필요없어짐
      localStorage.removeItem('token');
      // localStorage.removeItem('loginTime');
      set({ token: null, isLoggedIn: false, user: null });
    },
  };
});

export default useUserStore;