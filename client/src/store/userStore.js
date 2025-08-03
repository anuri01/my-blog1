import { create } from 'zustand';

const useUserStore = create((set) => ({
    // 1. State 설정(보관할 데이터)
    // 앱 시작 시 localstorage에 토근이 있으면 로그인 상태, 없으면 로그아웃 상태로 시작
    token: localStorage.getItem('token') || null,
    isLoggedIn: !!localStorage.getItem('token'),

    // 2. 액션(Action): 상태를 변경하는 함수
    // 로그인 시 토근을 받아 상태를 업데이트하는 함수
    setToken: (token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('LoginTimestamp', Date.now());
        set({ token: token, isLoggedIn: true });

    },
    //로그아웃 시 토큰을 제거하고 상태를 업데이트
    logout: () => {
        localStorage.removeItem('token');
        set({token: null, isLoggedIn: false});
    }
}));

export default useUserStore;