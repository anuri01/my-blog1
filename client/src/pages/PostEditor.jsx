import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import useUserStore from "../store/userStore";
import TiptapEditor from "../components/TiptapEditor";
import './PostEditor.css';

function PostEditor() {

const [ title, setTitle ] = useState('');
const [ content, setContent ] = useState('');
const navigate = useNavigate();
const { postId } = useParams(); // URL에서 PostId를 꺼내 옴
const isEditMode = Boolean(postId); // PostId가 있으면 true(수정모드) 없으면 false(등록모드)
const { isLoggedIn } = useUserStore();

//수정 모드일때, 원본 게시글을 불러오는 기능 
useEffect(() => {
    if (isEditMode) {
        const fetchPostData = async () => {
            try {
                const response = await api.get(`/posts/${postId}`);
                setTitle(response.data.title);
                setContent(response.data.content);
            } catch (error) {
                console.error("게시물 정보를 불러오지 못했습니다.", error);
                alert('게시물 정보를 불러오지 못했습니다.');
                navigate('/') // 홈으로 바로 이당
            }
        };
        fetchPostData();
    }
}, [postId, isEditMode, navigate]); // 의존성 배얼

// 폼 제출 시 실행될 함수(글쓰기/ 수정 통합)
const handlePostSubmit = async (e) => {
    // form 제출시 기본 동작 막음
    e.preventDefault();
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해 주세요.');
        return;
    }
    
    // isEditMode 값에 따라 다른 Api 호출
    try {
        let response;
        if (isEditMode) {
            // 수정모드일 경우 PUT 요청
            response = await api.put(`/posts/${postId}`, { title, content });
        } else {
            // 글쓰기 모드일경우 POST 요청
            response = await api.post('/posts', { title, content });
        }
        // 게시물 등록 성공 시 게시물 상세페이지로 이동 
        // setTitle('');
        // setContent('');
        navigate(`/post/${response.data._id}`);

    } catch(error) {
        console.log('게시글 작성에 실패했어요.', error);
        alert('게시글 작성에 실패했어요.');
    }
};

return (
        <div className="post-editor">
            {/* isEditMode 값에 따라 제목을 동적으로 변경 */}
            <h1>{isEditMode ? '게시글 수정하기' : '새 글 작성하기'}</h1>
            { isLoggedIn && (
                <section className="post-creator">
                    {/* <h3>내용을 입력하세요.</h3> */}
                    <form onSubmit={handlePostSubmit}>
                        <input 
                        className="form-input"
                        type="text"
                        placeholder="게시물 제목을 입력하세요."
                        value={title}
                        maxLength={50}
                        onChange={(e) => setTitle(e.target.value)}
                        />
                        {/* 👇 기존 textarea/ReactQuill을 TiptapEditor 컴포넌트로 교체합니다. */}
                         <TiptapEditor 
                        content={content}
                        onChange={(newContent) => {
                        setContent(newContent);
                        }}
                        />
                        {/* <textarea 
                        className="form-textarea"
                        placeholder="내용을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        /> */}
                        <div className="button-group">
                        <Link to='/' className="button button-secondary">취소</Link>
                        <button type="submit" className="button button-primary">
                            {isEditMode ? '수정 완료' : '등록'}
                        </button>
                        </div>
                    </form>
                </section>
            )}
            </div>
)
}

export default PostEditor;