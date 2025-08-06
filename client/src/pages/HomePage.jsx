import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore";
import './HomePage.css';


function HomePage() {
//전역 스토에서 로그인 상태만 가져옴
const { isLoggedIn, user } = useUserStore();
// 관리할 상태 설정
// 목록은 배열이므로 빈배열로 초기화
const [ posts, setPosts ] = useState([]);

// '새 글 작성' 관련 상태(title, content)와 함수(handlePostSubmit)는 여기서 삭제됩니다.
// const [ title, setTitle ] = useState('');
// const [ content, setContent ] = useState('');

// 게시글 수정관련 상태 설정 추가
const [ editingPostId, setEditingPostId ] = useState('null');
const [ editTitle, setEditTitle ] = useState('');
const [ editContent, setEditContent ] = useState('');

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

useEffect(() => {
    fetchPosts();
 }, []);

// 새글 작성 폼 제출 시 실행될 함수 - WritePage로 이동
// const handlePostSubmit = async (e) => {
//     // form 제출시 기본 동작 막음
//     e.preventDefault();
//     if (!title || !content) {
//         alert('제목과 내용을 모두 입력해 주세요.');
//         return;
//     }
    
//     try {
//         await api.post('/posts', { title, content });
//         // 게시물 등록 성공 시 입력폼 초기화 
//         setTitle('');
//         setContent('');
//         fetchPosts();

//     } catch(error) {
//         console.log('게시글 작성에 실패했어요.', error);
//         alert('게시글 작성에 실패했어요.');
//     }
// };

// 게시글 삭제 시 실행될 함수

const handleDeletePost = async (postId) => {
    if (!window.confirm('게시물을 삭제하시겠어요?')) return;
    try {
        await api.delete(`/posts/${postId}`);
        fetchPosts(); // 목록 새로 고침
    } catch (error) {
        console.error("게시물 삭제에 실패했습니다.", error);
        alert('게시글 삭제에 실패했어요.');
    }
};

// 게시글 수정 모드 진입 시 실행될 함수
// 수정하는 게시글 객체를 불러오는 방법 확인
const handleEditClick = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
}

// 수정 게시글 등록 시 실행될 함수
const handleUpdateSubmit = async ( e, postId ) => {
    e.preventDefault();
    try {
        await api.put(`/posts/${postId}`, { title: editTitle, content: editContent });
        setEditingPostId(null); // 수정모드 종료
        fetchPosts();
    } catch (error) {
        console.error('게시글 수정에 실패했습니다.', error);
        alert('게시글 수정에 실패했습니다.');
    }
};

    
    return (
        <div className="homepage">
            <h1>블로그 메인페이지 </h1>
            
            <section className="post-list">
            <h2>전체 게시글</h2>
            {
            posts.length > 0 ? (
            posts.map(post => (
                <div key={post._id} className="post-card">
                    {editingPostId === post._id ? (
                        // ---- 수정 모드 UI ----
                        <form onSubmit={(e) => handleUpdateSubmit(e, post._id)} className="edit-post-form">
                            <input
                                type="text"
                                className="form-input"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <textarea 
                                className="form-textarea"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="edit-buttons">
                                <button type="button" className="button button-secondary" onClick={() => setEditingPostId(null)}>취소</button>
                                <button type="submit" className="button button-primary"> 저장</button>
                            </div>
                        </form>
                    ) : (
                        // 일반 보기 UI
                <>
                <div className="post-item-info">
                <Link to={`/post/${post._id}`} className="post-title-link">
                <h3 className="post-title">{post.title}</h3>
                </Link>
                {/* <p className="post-content">{post.content}</p> */}
                <div className="post-item-meta">
                <span className="post-item-author">작성자: {post.author ? post.author.username : '알 수 없음'}</span>
                <span className="post-item-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                </div>
                {/* 👇 로그인한 사용자가 본인 글일 때만 수정/삭제 버튼 보이기 */}
                  {isLoggedIn && user?.id === post.author?._id && (
                <div className="post-actions">
                    <button onClick={() => handleEditClick(post)}>수정</button>
                    <button onClick={() => handleDeletePost(post._id)}>삭제</button>
                </div>
                )}
                </>
            )}
                </div>
            )) 
        ) : (
                <p className="no-posts-message">등록된 게시물이 없습니다.</p>
            )}
        </section>
        { isLoggedIn && (                
                      <div className="write-post-link-container">
                         <Link to="/write" className="button button-primary">새 글 작성하기</Link>
                      </div>
            )}
    </div>
    );
}

export default HomePage;