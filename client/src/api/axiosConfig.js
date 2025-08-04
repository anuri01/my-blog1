import axios from "axios";

// 마이블로그 전용 axios인스턴스 생성 및 baseURL 설정
const api = axios.create({
    // 배포시에는 env파일 필요
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4500/api'
})

// 요청 인터셉트 추가
api.interceptors.request.use(
    // 요청 성공적으로 보내지기 전에 실해될 함수
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;