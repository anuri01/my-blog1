// ES Module 사용(리액트와 맞춤)
import 'dotenv/config'; // dotenv 설정 방식이 변경됨
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
//const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
import { populate } from 'dotenv';

// db 스키마 및 모델 분리
import Post from './models/Post.js'; // 👈 이 줄 추가
import User from './models/User.js'; // 👈 이 줄 추가
import Comment from './models/Comment.js'; // 👈 이 줄 추가

//Express 앱 생성 및 설정
const app = express();
const PORT = process.env.PORT || 4500;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB에 연결됨'))
    .catch(err => console.error('MongoDB 연결 오류', err));


app.get('/api', (req, res) => {
    res.send('블로그 API 서버');
});

//인증 미들웨어 함수
const authMiddleware = (req, res, next) => {
    // 사용자 요청헤더에서 토큰값을 꺼냄옴(Authorizarion은 클라이언트 측 사용자가 정한 이름) axiosConfig에 설정됨
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('에러: 토큰 없음');
        return res.status(401).json({message:'인증 토큰이 필요합니다.'});
    }
    // 실제 토큰 값만 저장 공백을 기준으로 나누고 2번째 배열 저장
    const token = authHeader.split(' ')[1];
    try {
        console.log('토큰 검증시도');
        // 토큰값 검증하기 해당 사용자에게 발행한 토큰이 맞는지 유효기간이 지나지 않았는지 검증.(verity 메소드 사용 및 씨크리키를 통해 검증)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 검증이 완료되면 req.user 정보에 사용자 id와 username 추가해 다음 스텝을 진행할때 사용(username은 클라이언트에서 넘겨주기 떄문에 없어도 될 것으로 생각됨.)
        req.user = { id: decoded.id, username: decoded.username };
        console.log('토큰 검증 성공');
        next();
        }  catch (error) {
            console.log('토큰유효하지 않음');
        return res.status(401).json({message: '유효하지 않은 토큰입니다.'});
    }
};

// --- 사용자 API 라우트 ---

// 회원 가입
app.post('/api/users/signup', async(req,res) => {
    try {
        const { username, password } = req.body;
        if ( !username || !password ) {
            return res.status(400).json({message: '사용자 이름과 비밀번호는 필수입니다.'});
        }
        // 기존 사용자가 있는지 검사
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({message: '이미 사용중인 이름입니다.'});
        }
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({message: '회원 가입이 완료되었습니다.'})
    } catch (error) {
        res.status(500).json({message:'서버 오류 발생'});
    }
});

//로그인
app.post('/api/users/login', async(req,res) => {
    // 사용자 정보를 저장하고 현재 있는 사용자 있는 판단하고 비밀번호를 비교한 뒤 비밀번호가 맞으면 토큰을 발행한 뒤 로그인 처리
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(400).json({message:'사용자 정보가 올바르지 않습니다.'});
        }
        // bcrypt 패키지의 compare 메소드를 이용해 암호비교
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message:'비밀번호가 올바르지 않습니다.'});
        }
        // 토큰 발행시 user id와 username을 포함한다. 
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        res.json({ token, message:'로그인에 성공했습니다.' });
    } catch(error) {
        res.status(500).json({message:'서버 오류가 발생했습니다.'});
    }
});

// 게시글 목록
app.get('/api/posts', async(req, res) => {
    try {
        const posts = await Post.find({})
        .populate('author', 'username') // author 필드를 User정보로 채우고, username만 선택
        .sort({createdAt: -1 });
        res.json(posts);
    } catch(error) {
        res.status(500).json({message:'서버 오류가 발생했습니다.'});
    }
});

// 게시글 상세페이지 
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        // User에서 username 정보까지 추가해 저장
        const postDetail = await Post.findById(postId).populate('author', 'username');
        if(!postDetail) {
            return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
        }
        res.status(200).json(postDetail);

    } catch (error) {
        res.status(500).json({message: '서버 오류가 발생했습니다.'});
    }
});

// 작성된 게시글 등록
app.post('/api/posts', authMiddleware, async(req, res) => {
    try {
        // console.log('서버가 받은 데이터 (req.body):', req.body);
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({message:'게시물 제목과 내용은 필수사항이에요.'});
        }
        const newPost = new Post({
            //키 값과 변수명이 같을 경우 키값 생략가능 ES6 문법(객체 속성 축약)
            title: title,
            content: content,
            author: req.user.id
        });
        await newPost.save();
        res.status(201).json(newPost);
        } catch (error) {
            res.status(500).json({message: '서버 오류가 발생했어요.'});
        }
    

});

//작성 게시글 수정
app.put('/api/posts/:id', authMiddleware, async(req, res) => {
    try {
        // console.log('서버가 받은 데이터 (req.body):', req.body);
        const { title, content } = req.body;
        const postId = req.params.id;

        if ( !title || !content ) {
            return res.status(400).json({message:'제목과 내용을 필수사항이에요'});
        }
        // 조건, 내용, 옵션의 객체로 구성
        const updatePost = await Post.findOneAndUpdate(
            { _id: postId, author: req.user.id }, // 업데이트 조건: ID일지, 작성자 일치
            { title, content }, // 업데이트할 내용
            { new: true } // 옵션 : 업데이트된 문서를 반환
        );
        // 저장 실패 시 처리
        if(!updatePost) {
            return res.status(404).json({message:'게시물을 찾을 수 없거나 수정 권한이 없어요'});
        }
        // 저장 성공 시 처리
        res.status(201).json(updatePost);

    } catch (error) {
        res.status(500).json({message:'서버 오류 발생'});
    }
});

//작성 게시글 삭제
app.delete('/api/posts/:id', authMiddleware, async( req, res ) => {
    try {
        const postId = req.params.id;
        const deletedPost = await Post.findOneAndDelete({ _id: postId, author: req.user.id });

        // 삭제 실패 시 처리
        if(!deletedPost) {
            return res.status(404).json({message:'게시물을 찾을 수 없거나 삭제 권한이 없어요.'});
        }
        // 삭제 성공 시 처리
        res.json({message:`'${deletedPost.title}' 게시물이 삭제됐어요.`});

    } catch (error) {
        res.status(500).json({message:'서버 오류 발생'});
    }
});

// 댓글 목록(게시물에 연결된 댓글만 표시한다.)
app.get('/api/posts/:postId/comments', async(req, res) => {
    try {
    const comments = await Comment.find({post: req.params.postId})
    .populate('author', 'username')
    .sort({createdAt: -1});

    res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({message: '서버 오류가 발생했습니다.', error});
    } 
});

// 작성된 댓글 등록(로그인 필요)
app.post('/api/posts/:postId/comments', authMiddleware, async ( req, res ) => {
    console.log('api 라우트 전달');
    try {
        const { content } = req.body;
        if (!content) { 
            return res.status(400).json({message: '댓글 내용을 입력해 주세요.'});
        }
        const newComment = new Comment({
            content,
            author: req.user.id,
            post: req.params.postId
        });

         // --- 2. 저장 직전 로그 ---
        console.log('--- 5. DB에 저장을 시도합니다... ---');

        await newComment.save();

         // --- 3. 저장 성공 로그 ---
        console.log('--- 6. DB 저장 성공! ---');

        const populateComment = await Comment.findById(newComment._id).populate('author', 'username');
        res.status(201).json(populateComment);

    } catch(error) {
        console.error("!!! 댓글 저장 중 에러 발생 !!!", error);
        res.status(500).json({message: '서버 오류가 발생했습니다.', error});
    }
});

// 작성된 댓글 삭제

// 작성된 댓글 수정(선택)

// 서버실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`)
});