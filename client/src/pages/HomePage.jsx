import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore";
import './HomePage.css';


function HomePage() {
//전역 스토에서 로그인 상태만 가져옴
const { isLoggedIn } = useUserStore();
// 관리할 상태 설정
// 목록은 배열이므로 빈배열로 초기화
const [ posts, setPosts ] = useState([]);
const [ title, setTitle ] = useState('');
const [ content, setContent ] = useState('');

// 기능(함수) 정의
// 서버로부터 모든 게시물을 불러옴
const fetchPosts = async () => {    
    try{
        const response = await api.get('/posts');
        setPosts(response.data);
    } catch (error) {
        console.error("게시물을 불러오는데 실패했습니다.", error);
    }
};

useEffect(() => { fetchPosts(); }, []);

// 새글 작성 폼 제출 시 실행될 함수
const handlePostSubmit = async (e) => {
    // form 제출시 기본 동작 막음
    e.preventDefault();
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해 주세요.');
        return;
    }
    
    try {
        await api.post('/posts', { title, content });
        // 게시물 등록 성공 시 입력폼 초기화 
        setTitle('');
        setContent('');
        fetchPosts();

    } catch(error) {
        console.log('게시글 작성에 실패했어요.', error);
        alert('게시글 작성에 실패했어요.');
    }
};
    
    return (
        <div className="homepage">
            <h3>블로그 메인페이지 </h3>
            { isLoggedIn && (
                <section className="post-creator">
                    <h3>새 글 작성하기</h3>
                    <form onSubmit={handlePostSubmit}>
                        <input 
                        className="form-input"
                        type="text"
                        placeholder="게시물 제목을 입력하세요."
                        value={title}
                        maxLength={50}
                        onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea 
                        className="form-textarea"
                        placeholder="내용을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        />
                        <button type="submit" className="button button-primary">등록</button>
                    </form>
                </section>
            )}
            <section className="post-list">
            <h2>전체 게시글</h2>
            {
            posts.length > 0 ? (
            posts.map(post => (
                <article key={post._id} className="post-card">
                <h3>{post.title}</h3>
                <p className="post-content">{post.content}</p>
                <div className="post-meta">
                <span>작성자: {post.author ? post.author.username : '알 수 없음'}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                </article>
            )) ) : (
                <p className="no-posts-message">등록된 게시물이 없습니다.</p>
            )
            }
            </section>
    </div>
    );
}

export default HomePage;