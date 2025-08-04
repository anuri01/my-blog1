import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore";
import './AuthPage.css'

function LoginPage() {
    // 1. 사용할 상태 설정
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    
    // 2. 사용 컴포터는(기능) 셋팅
    const navigate = useNavigate();
    const { setToken } = useUserStore();
    
    // 3. 로그인 요청 함수
    const handleSubmit = async(e) => {
        e.preventDefault();
        // setUsername('');
        // setPassword('');
        setError('');

        try {
            const response = await api.post('/users/login', {username, password});
            setToken(response.data.token);
            alert('로그인 되었습니다.')
            navigate('/')

        } catch (err) {
            if ( err.response ) {
            setError(err.response.data.message);
            } else {
            setError('서버에 연결할 수 없음.')
        }
        } 
      };    
    
      return (
        <>
            <h3>로그인 페이지</h3>
             <form className="auth-form" onSubmit={handleSubmit}>
                <input className="signup-form-input" type='text' placeholder="사용자 이름" value={username} maxLength={12} onChange={ (e) => setUsername(e.target.value) }></input>
                <input className="signup-form-input" type='password' placeholder="비밀번호" value={password} maxLength={21} onChange={ (e) => setPassword(e.target.value)}></input>
                <button type='submit' className="button button-primary">로그인</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p className="auth-p">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
        </>
    );
}

export default LoginPage;