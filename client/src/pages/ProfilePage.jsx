import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './AuthPage.css'; // 공통 스타일 재사용

function ProfilePage() {
  // 프로필 페이지에 필요한 상태설정
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // 사용자 정보 초기 셋팅
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    };
    fetchUser();
  }, []);
  
  //패스워드 변경 함숨
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.put('/users/password', { currentPassword, newPassword });
      setMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  if (!user) return <div>잠시만 기다려주세요.</div>

  return (
    <div className="auth-page">
      <h1>내 프로필</h1>
      <div className="profile-info">
        <strong>사용자 이름:</strong> {user.username}
      </div>
      <hr />
      <h3>비밀번호 변경</h3>
      <form onSubmit={handlePasswordChange}>
        <input
          className="form-input"
          type="password"
          placeholder="기존 비밀번호"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          className="form-input"
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit" className="auth-button">변경하기</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ProfilePage;