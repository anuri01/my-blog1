import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"
import io from "socket.io-client";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore"; // 로그인 상태 확인
import './PostDetailPage.css';

// const socket = io(import.meta.env.SOCKET_API_URL || 'http://localhost:4500', { path:'/api/socket.id' });
const socket = io(import.meta.env.VITE_SOCKET_API_URL || 'http://localhost:4500/');

function PostDetailPage() {
    // 게시글 상세페이지에 사용할 상태 설정(게시글, 게시글 불러오는중, 에러)
    const [ post, setPost ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState('');
    // 댓글 상태 설정 추가
    const [ comments, setComments ] = useState([]); // 댓글 목록 상태
    const [ newComment, setNewComment ] = useState(''); // 새 댓글 입력창 상태
    const [ visibleCommentsCount, setVisibleCommentsCount ] = useState(5); // 보이는 댓글 개수

    // useParams 훅을 통해 url에서 게시물 id를 가져옴
    const { postId } = useParams();
    const { isLoggedIn, user } = useUserStore(); // 로그인 상태 가져오기
    const navigate = useNavigate();

    // 기능 함수정의
    // 해당 게시물 상세 및 댓글 가져오기. Promise.all([...]) 을 이용해 비동기 요청을 한번에 보내서 받기
    useEffect(() => {
        const fetchPostAndComments = async () => {
            setIsLoading(true);
            try {
                const [ postRes, commentRes ] = await Promise.all([
                    api.get(`/posts/${postId}`),
                    api.get(`/posts/${postId}/comments`),
                ]);
                setPost(postRes.data); // 성공 시 받아온 데이터로 post 셋팅
                setComments(commentRes.data); // 성공 시 받아온 데이터로 comments 셋팅
            } catch  {
                setError('게시물을 찾을 수 없습니다.'); // 실패 시 에러메시지 세팅
            } finally { // 결과에 상관없이 항상 실행되는 부분
                setIsLoading(false); // API 요청 끝 -> 로딩중 스위치를 끔
            }
        };
        fetchPostAndComments();

        // 방송 수신 쏘스 추가
        const onNewComment = (newCommentData) => {
            if ( newCommentData.post === postId ) {
                const currentUser = useUserStore.getState().user;
                if(!currentUser || currentUser.id !== newCommentData.author._id) {
                     toast('새로운 댓글이 달렸습니다.!', { icon: '💬' });
                setComments(prevComments => [newCommentData, ...prevComments]);
                }
            }
        };

        socket.on('newComment', onNewComment);

        return () => {
            socket.off('newComment', onNewComment);
        }

    }, [postId, user]);

    // 👇 게시글 삭제 함수 추가
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/'); // 삭제 성공 후 홈으로 이동
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.', error);
    }
  };
    
    //댓글 등록 요청 함수
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if(!newComment) return;
        try {
            const response = await api.post(`/posts/${postId}/comments`, { content: newComment });
            // 목록 전체를 다시 불러오지 않고, 배열의 스프레드 문법으로 새로 추가된 댓글말 기존 목록에 추가
            setComments(prevComments => [response.data, ...prevComments]);
            setNewComment(''); // 입력창 비우기
        } catch (error) {
            console.error('댓글 등록에 실패했습니다.', error);
            alert('댓글 등록에 실패했어요.');
        }
    };

    // 더보기 버튼 클릭 함수
    const handleLoadMoreComments = () => {
        setVisibleCommentsCount(prev => prev + 5);
    };

    // 현재 표시할 댓글들 계산
    const visibleComments = comments.slice(0, visibleCommentsCount);
    const hasMoreComments = comments.length > visibleCommentsCount;

    if(isLoading) {
        return <div className="loading-message">로딩 중...</div>; // 로딩중 일떄 표시
    }
    if(error) {
        return <div>{error} <Link to="/">홈으로</Link></div>; // 에러가 났을때 이 ui만 표시
    }
    // post가 아직 null일 경우를 대비한 안전장치
    if (!post) {
    return null; 
    }


    return (
        <article className="post-detail">
            {/* 👇 --- 게시글 대표 이미지 표시 추가 --- 👇 */}
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="post-image" />}

            <header className="post-header">
                <h1>게시물 상세보기</h1>
                <h2>{post.title}</h2>
                <div className="post-meta">
                    <span>작성자: {post.author.username}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
            </header>
             <div 
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content }} 
            />
            <div className="util-button-group">
            <Link to="/" className="action-button">목록</Link>
            { isLoggedIn && user?.id === post.author?._id && <div className="author-actions">
            <Link to={`/edit/${post._id}`} className="action-button">수정</Link>
            {/* <button onClick={() => handleEditClick(post)}>수정</button> */}
            <button className="action-button" onClick={() => handleDeletePost(post._id)}>삭제</button> 
            </div> }
            </div>
            <section className="comments-section">
                <h4> 댓글 ({comments.length})</h4>
                { isLoggedIn && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea 
                        className="form-textarea"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글 내용을 입력하세요."
                        />
                        <button type="submit" className="button-medium button-primary-single">댓글 등록</button>
                    </form>
                )}

                { comments && comments.length > 0 ? (
                    <div className="comment-list">
                        { visibleComments.map(comment => ( 
                        <div key={comment._id} className="comment-item" >
                            <div className="comment-meta">
                                <span className="comment-author">작성자: { comment.author?.username || '알수없음' }</span>
                                <span className="comment-date">작성일: { new Date(comment.createdAt).toLocaleDateString() }</span>
                             </div>
                            <p className="comment-body">{ comment.content }</p>
                        </div>
                        ))}
                
                        {/* 더보기 버튼과 댓글 개수 표시 */}
                        {hasMoreComments && (
                            <div className="comment-pagination">
                                <button 
                                    className="load-more-button" 
                                    onClick={handleLoadMoreComments}
                                >
                                    더보기 ▼ {visibleCommentsCount}/{comments.length}
                                </button>
                            </div>
                        )}
               </div>
               ) : (
               <h2 className="no-comments-message">등록된 댓글이 없습니다.</h2>)}

            </section>
                        {/* <div className="post-body">
                {post.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div> */}
            
        </article>
    );
}

export default PostDetailPage;