import React from 'react' // React 엔진과 useEffect 훅
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // // 페이지 이동(라우팅) 도구 세트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// import ProflePage from './pages/ProfilePage';
import useUserStore from './store/userStore';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
//1. Zustand 스토어에서 필요한 상태와 함수를 가져옴
const { isLoggedIn, logout } = useUserStore();
const navigate = useNavigate();

//2. 로그아웃 버튼을 눌렀을때 실행될 함수'
const handleLogout = () => {
  logout();
  alert('로그아웃 되었습니다.');
  navigate('/login');
};
 
  return (
    <>
      <div className='app-container'> {/* 모바일 화면처럼 보이게할 전체 컨테이터 */}
        <header className='app-header'>
          <div className='logo'>
            <Link to="/">My blog</Link> {/* 로고를 누르면 홈으로 이동함*/}
          </div>
          <nav className='navigation'>
            {/* 로그인 상태에 따라 다른 메뉴를 보여줌 */}
            { isLoggedIn ? (
              <>
              <Link to="/profile">프로필</Link>
              <button onClick={handleLogout} className='nav-button'>로그아웃</button>
              </>
            ) : (
              <>
              <Link to="/signup">회원가입</Link>
              <Link to="/login">로그인</Link>
              </>
            )}
          </nav>
        </header>
        <main className='app-main'>
          <Routes>
            <Route path='/' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            {/* <Route path='/profile' element={<ProfilePage />} /> */}
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App
