import React, { useState, useEffect } from "react";
// import axios from "axios";
import toast from "react-hot-toast"; // 토스트팝업 실제 띄우는 메소드
import api from "../api/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import { validateUsername, validatePassword } from "../utils/validation";
import './AuthPage.css'; // 로그인/회원가입 페이지 공통 스타일

function SignupPage() {
    // 사용할 상태 설정
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    const navigate = useNavigate();
    const { isLoggedIn } = useUserStore();

      // 로그인한 사용자가 접근 시 메인페이지로 리다이렉트(app.jsx 라우트에서 이미 처리했지만 페이지 내에서 상태가 바뀔경우를 대비해 추가)
        useEffect( () => {
            if( isLoggedIn ) {
                navigate('/');
            }
        }, [isLoggedIn, navigate]);

    // 가입정보 제출 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // 사용자 이름 유효성
        const usernameError = validateUsername(username);
        if (usernameError) {
            toast.error(usernameError);
            return;
        }

        const passwordError = validatePassword(password);
        if(passwordError) {
            toast.error(passwordError);
            return;
        }

        try {
            // 서버에 회원가입 요청
            await api.post('/users/signup', { username, password });

            // 요청 성공시 실행
            toast.success('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');

        } catch (err) {
            // 요청 실패 시 실행
            // if(err.response) {
            //     setError(err.response.data.message);
            // } else {
            //     setError('서버에 연결할 수 없습니다.');
            // }
            
            // 에러메시지도 토스트 팝업으로 변경
            const errorMessage = err.response ? err.response.data.message : "서버에 연결할 수 없습니다.";
            toast.error(errorMessage);
        }
    };
    
    return (
        <>
            <h1>마이블로그 회원가입</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input className="signup-form-input" type='text' placeholder="사용자 이름(10자 이내)" value={username} maxLength={12} onChange={ (e) => setUsername(e.target.value) }></input>
                <input className="signup-form-input" type='password' placeholder="비밀번호" value={password} maxLength={21} onChange={ (e) => setPassword(e.target.value)}></input>
                <button type='submit' className="button button-primary-single">회원가입</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p className="auth-p">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </>
    );
}

export default SignupPage;