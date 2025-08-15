import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore";
import './HomePage.css';


function HomePage() {
//전역 스토에서 로그인 상태만 가져옴
const { isLoggedIn, user } = useUserStore();
// 관리할 상태 설정
// 목록은 배열이므로 빈배열로 초기화
const [ posts, setPosts ] = useState([]);
const [ currentPage, setCurrentPage ] = useState(1);
const [ totalPages, setTotalPages ] = useState(1);
const [ searchParams, setSearchParams ] = useSearchParams();
const [ isLoading, setIsLoading ] = useState(true);


// '새 글 작성' 관련 상태(title, content)와 함수(handlePostSubmit)는 여기서 삭제됩니다.
// const [ title, setTitle ] = useState('');
// const [ content, setContent ] = useState('');

// 게시글 수정관련 상태 설정 추가
// const [ editingPostId, setEditingPostId ] = useState('null');
// const [ editTitle, setEditTitle ] = useState('');
// const [ editContent, setEditContent ] = useState('');

// 기능(함수) 정의
// 서버로부터 모든 게시물을 불러옴
const fetchPosts = async (page) => {
    setIsLoading(true); // api 요청시작 -> "로딩 중" 스위치 킴
    try{
        const response = await api.get(`/posts/?page=${page}&limit=5)`);
        const { posts, currentPage, totalPages } = response.data;
        setPosts(posts);
        setCurrentPage(currentPage);
        setTotalPages(totalPages);

    } catch (error) {
        console.error("게시물을 불러오는데 실패했습니다.", error);
    } finally {
       // try가 성공하든, catch로 에러가 나든, 항상 마지막에 실행됩니다.
      setIsLoading(false); // API 요청 끝 -> "로딩 중" 스위치를 끕니다. 
    }
};

// seatchParams hook을 사용해 url상 페이지 자져오기
useEffect(() => {
    const page = searchParams.get('page') || 1;
    fetchPosts(page);
 }, [searchParams]);

// 페이지 이동 함수 추가 
const handlePageChange = (page) => {
    setSearchParams( { page: page });
}

// 게시글 삭제 시 실행될 함수
const handleDeletePost = async (postId) => {
    if (!window.confirm('게시물을 삭제하시겠어요?')) return;
    try {
        setIsLoading(true);
        await api.delete(`/posts/${postId}`);
        fetchPosts(); // 목록 새로 고침
    } catch (error) {
        console.error("게시물 삭제에 실패했습니다.", error);
        alert('게시글 삭제에 실패했어요.');
    } finally {
        setIsLoading(false);
    }
};
// 게시글 수정 모드 진입 시 실행될 함수
// 수정하는 게시글 객체를 불러오는 방법 확인
// const handleEditClick = (post) => {
//     setEditingPostId(post._id);
//     setEditTitle(post.title);
//     setEditContent(post.content);
// }

// 수정 게시글 등록 시 실행될 함수
// const handleUpdateSubmit = async ( e, postId ) => {
//     e.preventDefault();
//     try {
//         await api.put(`/posts/${postId}`, { title: editTitle, content: editContent });
//         setEditingPostId(null); // 수정모드 종료
//         fetchPosts();
//     } catch (error) {
//         console.error('게시글 수정에 실패했습니다.', error);
//         alert('게시글 수정에 실패했습니다.');
//     }
// };
// 로딩중일 때 보여줄 ui (조기반환)
if( isLoading ) {
    return <div className="loading-message">데이터를 불러오는 중입니다.</div>
}

    
    return (
        <div className="homepage">
            <h1>블로그 메인페이지 </h1>
            
            <section className="post-list">
            <h2>전체 게시글</h2>
            {
            posts.length > 0 ? (
            posts.map(post => (
                <div key={post._id} className="post-card">
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
                    <Link to={`/edit/${post._id}`} className="action-button">수정</Link>
                    {/* <button onClick={() => handleEditClick(post)}>수정</button> */}
                    <button className="action-button" onClick={() => handleDeletePost(post._id)}>삭제</button>
                </div>
                )}
                </>
                </div>
            ))

        ) : (
                <p className="no-posts-message">등록된 게시물이 없습니다.</p>
            )}
        </section>
        <div className="pagination">
            { Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={ `page-button ${currentPage === page ? 'active' : ''}` }
                >
                  {page}
                </button>
            ))}
        </div>
       
        { isLoggedIn && (                
                      <div className="write-post-link-container">
                         <Link to="/write" className="button-medium button-primary-single">새 글 작성하기</Link>
                      </div>
            )}
    </div>
    );
}

export default HomePage;