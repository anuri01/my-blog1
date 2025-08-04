import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './AuthPage.css'; // 로그인/회원가입 페이지 공통 스타일

function SignupPage() {
    // 사용할 상태 설정
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    const navigate = useNavigate();

    // 가입정보 제출 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 서버에 회원가입 요청
            await axios.post('http://localhost:4500/api/users/signup', { username, password });

            // 요청 성공시 실행
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');

        } catch (err) {
            // 요청 실패 시 실행
            if(err.response) {
                setError(err.response.data.message);
            } else {
                setError('서버에 연결할 수 없습니다.');
            }
        }
    };
    
    return (
        <>
            <h3>마이블로그 회원가입</h3>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input className="signup-form-input" type='text' placeholder="사용자 이름" value={username} onChange={ (e) => setUsername(e.target.value) }></input>
                <input className="signup-form-input" type='password' placeholder="비밀번호" value={password}  onChange={ (e) => setPassword(e.target.value)}></input>
                <button type='submit' className="button-primary">회원가입</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p className="auth-p">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </>
    );
}

export default SignupPage;