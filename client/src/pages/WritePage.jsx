import React, { useState } from "react";
import api from "../api/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import './WritePage.css';

function WritePage() {

const navigate = useNavigate();
const { isLoggedIn } = useUserStore();
const [ title, setTitle ] = useState('');
const [ content, setContent ] = useState('');

// 새글 작성 폼 제출 시 실행될 함수
const handlePostSubmit = async (e) => {
    // form 제출시 기본 동작 막음
    e.preventDefault();
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해 주세요.');
        return;
    }
    
    try {
        const response = await api.post('/posts', { title, content });
        // 게시물 등록 성공 시 입력폼 초기화 
        setTitle('');
        setContent('');
        navigate(`/post/${response.data._id}`);

    } catch(error) {
        console.log('게시글 작성에 실패했어요.', error);
        alert('게시글 작성에 실패했어요.');
    }
};

return (
        <div className="wirte-page">
            <h1>새 글 작성하기</h1>
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
                        <textarea 
                        className="form-textarea"
                        placeholder="내용을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        />
                        <button type="submit" className="button button-primary">등록</button>
                        <div className="write-post-link-container">
                        <Link to='/' className="button">취소</Link>
                        </div>
                    </form>
                </section>
            )}
            </div>
)
}

export default WritePage;