import axios from "axios";
import { jwtDecode } from "jwt-decode";
import useUserStore from "../store/userStore";

// 마이블로그 전용 axios인스턴스 생성 및 baseURL 설정
const api = axios.create({
    // 배포시에는 env파일 필요
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4500/api'
})

// 요청 인터셉트 추가
api.interceptors.request.use(
    // 요청 성공적으로 보내지기 전에 실행될 함수
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            // 토큰 해독
            const decodedToken = jwtDecode('token');
            // 현재 시간과 토큰 만료시간 비교
            // decodedToken.exp는 초(second) 단위이므로, 1000을 곱해 밀리초(ms)로 바꿔줍니다.
            if(decodedToken.exp * 1000 < Date.now()) {
                useUserStore.getState.logout();
                window.location.href = '/';
                return Promise.reject(new Error('토큰이 만료되었습니다.'));
            }
            // 토큰이 유효하면 헤더에 토큰을 추가함. 
            config.headers.authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 추후 용도 확인
//  api.interceptors.response.use(
//     // 1. 성공적인 응답은 그대로 반환
//     (response) => response,

//     //2. 만약 에러가 401 (Unauthorized) 상태 코드면
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             // Zustand 스토어의 logout 액션을 직접 호출해 상태를 초기화
//             useUserstore.getState().logout();
//             // 로그인 페이지로 리다이렉션
//             window.location.href = '/login';
//         }
//         // 다른 종류의 에러는 그대로 반환해 각 컴포넌트에서 처리 
//         return Promise.reject(error);
//     }
// );

export default api;