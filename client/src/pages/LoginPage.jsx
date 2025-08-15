import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore";
import './AuthPage.css'

function LoginPage() {
    // 1. 사용할 상태 설정
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    
    // 2. 사용 컴포넌트(기능) 셋팅
    const navigate = useNavigate();
    const { isLoggedIn, setToken } = useUserStore();
    const backendUrl = import.meta.env.VITE_API_URL;

    // 로그인한 사용자가 접근 시 메인페이지로 리다이렉트(app.jsx 라우트에서 이미 처리했지만 페이지 내에서 상태가 바뀔경우를 대비해 추가)
    useEffect( () => {
        if( isLoggedIn ) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);
    
    // 3. 로그인 요청 함수
    const handleSubmit = async(e) => {
        e.preventDefault();
        // setUsername('');
        // setPassword('');
        setError('');

        try {
            const response = await api.post('/users/login', {username, password});
            setToken(response.data.token);
            toast.success('로그인 되었습니다.')
            navigate('/')

        } catch (err) {
            // if ( err.response ) {
            // setError(err.response.data.message);
            // } else {
            // setError('서버에 연결할 수 없음.')

            // toast 팝업으로 변경
            const errorMessage = err.response ? err.response.data.message : '서버에 연결할 수 없음';
            toast.error(errorMessage);
        }
         
      };    
    
      return (
        <>
            <h1>로그인 페이지</h1>
             <form className="auth-form" onSubmit={handleSubmit}>
                <input className="signup-form-input" type='text' placeholder="사용자 이름" value={username} maxLength={12} onChange={ (e) => setUsername(e.target.value) }></input>
                <input className="signup-form-input" type='password' placeholder="비밀번호" value={password} maxLength={21} onChange={ (e) => setPassword(e.target.value)}></input>
                <button type='submit' className="button button-primary-single">로그인</button>
            </form>

            {/* --- 👇 네이버 로그인 버튼 (새로 추가) --- */}
            <div className="social-login">
                {/* a 태그를 사용해 백엔드의 네이버 로그인 시작 API로 이동시킵니다. */}
                <a href={`${backendUrl}/users/naver`} className="naver-login-button">
                네이버로 로그인
                </a>
            </div>

            {error && <p className="error-message">{error}</p>}
            <p className="auth-p">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
        </>
    );
}

export default LoginPage;