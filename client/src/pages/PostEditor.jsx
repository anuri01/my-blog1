import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import useUserStore from "../store/userStore";
import TiptapEditor from "../components/TiptapEditor";
import toast from "react-hot-toast";
import './PostEditor.css';

function PostEditor() {

const [ title, setTitle ] = useState('');
const [ content, setContent ] = useState('');
// const [ imageFile, setImageFile ] = useState(null); // 선택한 이미지 파일을 기억할 상태
const [ files, setFiles ] = useState([]); // 단일 파일에 배열로 변경
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
                navigate('/') // 홈으로 바로 이동
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
        toast.error('제목과 내용을 모두 입력해 주세요.');
        return;
    }
    // formData 객체 생성

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (files.length > 0) {
        for ( let i = 0; i < files.length; i++) {
            formData.append('files', files[i]); //이름표를 'files'로 통일
        }
    }
    
    // 디버깅: FormData 내용 확인
    // console.log('=== FormData 내용 확인 ===');
    // for (let [key, value] of formData.entries()) { entries() 메소드는 객체 안의 값을 차례로 반환. for of 문법 그 값을 받아서 구조분해 할당함.
    //     console.log(key, value);
    // }

    // isEditMode 값에 따라 다른 Api 호출
    try {
        let response;
        if (isEditMode) {
            // 수정모드일 경우 PUT 요청
            response = await api.put(`/posts/${postId}`, formData);
            //   { 
            //      headers: { 'Content-Type': 'multipart/form-data' } // 파일 전송을 위한 헤더 설정
            //  });
        } else {
            // 글쓰기 모드일경우 POST 요청
            response = await api.post('/posts', formData);
            // { 
            //      headers: { 'Content-Type': 'multipart/form-data' } // 파일 전송을 위한 헤더 설정
            //  });
        }
        // 게시물 등록 성공 시 게시물 상세페이지로 이동 
        // setTitle('');
        // setContent('');
        navigate(`/post/${response.data._id}`);

    } catch(error) {
        console.log('게시글 작성에 실패했어요.', error);
        toast.error('게시글 작성에 실패했어요.');
    }
};

const handleCancle = () => {
    // 뒤로가기 기능을 실행함
    navigate(-1);
}
return (
        <div className="post-editor">
            {/* isEditMode 값에 따라 제목을 동적으로 변경 */}
            <h1>{isEditMode ? '게시글 수정하기' : '새 글 작성하기'}</h1>
            { isLoggedIn && (
                <section className="post-creator">
                    {/* <h3>내용을 입력하세요.</h3> */}
                    <form onSubmit={handlePostSubmit}>
                    <div>
                        {/* <label>제목</label> */}
                        <input 
                        className="form-input"
                        type="text"
                        placeholder="게시물 제목을 입력하세요."
                        value={title}
                        maxLength={50}
                        onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                        {/* 👇 기존 textarea/ReactQuill을 TiptapEditor 컴포넌트로 교체합니다. */}
                    <div className="form-group">
                        {/* <label>내용</label> */}
                         <TiptapEditor 
                        content={content}
                        onChange={(newContent) => {
                        setContent(newContent);
                        }}
                        />
                    </div>
                        <div className="form-group">
                            <label htmlFor="file-upload" className="button-medium button-primary-single">파일 선택(최대 5개)</label>
                            <input
                             id="file-upload"
                             type="file"
                             multiple
                             accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf" // 허용 파일 타입 지정
                            //  accept="image/*"
                             onChange={(e) => setFiles(Array.from(e.target.files))}
                             className="file-input" // input에 클래스 추가(숨기기위함)
                            />
                            {/* Array.from()을 사용해 FileList를 실제 배열로 변환 후 map을 실행합니다. */}
                            {Array.from(files).map((file, index) => (
                                <div key={index} className="file-list">
                                    <div className="file-item">
                                        <span>{file.name}</span>
                                    </div>
                                </div>
                            ))}
                                                  
                        {/* {files && <span className="file-name">{files.name}</span>} */}
                        </div>

                        {/* textarea를 사용할 경우 예시 */}
                        {/* <textarea 
                        className="form-textarea"
                        placeholder="내용을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        /> */}
                        <div className="button-group">
                        <button className="button button-secondary" type="button" onClick={handleCancle}>취소</button>
                        {/* <Link to='/' className="button button-secondary">취소</Link> */}
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