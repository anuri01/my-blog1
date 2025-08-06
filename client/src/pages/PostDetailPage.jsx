import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import './PostDetailPage.css';

function PostDetailPage() {
    // 게시글 상세페이지에 사용할 상태 설정(게시글, 게시글 불러오는중, 에러)
    const [ post, setPost ] = useState(null);
    const [ isLoading, setIsLoding ] = useState(true);
    const [ error, setError ] = useState('');

    const { postId } = useParams();

    // 기능 함수정의
    // 해당 게시물 상세 가져오기
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoding(true);
                const response = await api.get(`/posts/${postId}`);
                setPost(response.data); // 성공 시 받아온 데이터로 post 셋팅

            } catch (err) {
                setError('게시물을 찾을 수 없습니다.'); // 실패 시 에러메시지 세팅
            } finally { // 결과에 상관없이 항상 실행되는 부분
                setIsLoding(false); // API 요청 끝 -> 로딩중 스위치를 끔
            }
        };
        fetchPost();
    }, [postId]); // postId가 바뀔때 마다 실행
    
    if(isLoading) {
        return <div>로딩 중...</div>; // 로딩중 일떄 표시
    }
    if(error) {
        return <div>{error} <Link to="/">홈으로</Link></div>; // 에러가 났을때 이 ui만 표시
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
                        {/* <div className="post-body">
                {post.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div> */}
            <Link to="/" className="back-to-list">목록으로 돌아가기</Link>
        </article>
    );
}

export default PostDetailPage;