import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import useUserStore from "../store/userStore"; // 로그인 상태 확인
import './PostDetailPage.css';

function PostDetailPage() {
    // 게시글 상세페이지에 사용할 상태 설정(게시글, 게시글 불러오는중, 에러)
    const [ post, setPost ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState('');
    // 댓글 상태 설정 추가
    const [ comments, setComments ] = useState([]); // 댓글 목록 상태
    const [ newComment, setNewComment ] = useState(''); // 새 댓글 입력창 상태

    // useParams 훅을 통해 url에서 게시물 id를 가져옴
    const { postId } = useParams();
    const { isLoggedIn } = useUserStore(); // 로그인 상태 가져오기

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
            } catch (err) {
                setError('게시물을 찾을 수 없습니다.'); // 실패 시 에러메시지 세팅
            } finally { // 결과에 상관없이 항상 실행되는 부분
                setIsLoading(false); // API 요청 끝 -> 로딩중 스위치를 끔
            }
        };
        fetchPostAndComments();
    }, [postId]);
    
    //댓글 등록 요청 함수
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if(!newComment) return;
        try {
            const response = await api.post(`/posts/${postId}/comments`, { content: newComment });
            // 목록 전체를 다시 불러오지 않고, 배열의 스프레드 문법으로 새로 추가된 댓글말 기존 목록에 추가
            setComments([...comments, response.data]);
            setNewComment(''); // 입력창 비우기
        } catch (error) {
            console.error('댓글 등록에 실패했습니다.', error);
            alert('댓글 등록에 실패했어요.');
        }
    };

    if(isLoading) {
        return <div>로딩 중...</div>; // 로딩중 일떄 표시
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
            <Link to="/" className="back-to-list">목록으로 돌아가기</Link>
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
                        <button type="submit" className="button button-primary-single">댓글 등록</button>
                    </form>
                )}

                { comments && comments.length > 0 ? (
                    <div className="comment-list">
                        { comments.map(comment => ( 
                        <div key={comment._id} className="comment-item" >
                            <div className="comment-meta">
                                <span className="comment-author">작성자: { comment.author?.username || '알수없음' }</span>
                                <span className="comment-date">작성일: { new Date(comment.createdAt).toLocaleDateString() }</span>
                             </div>
                            <p className="comment-body">{ comment.content }</p>
                        </div>
                        ))}
                
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