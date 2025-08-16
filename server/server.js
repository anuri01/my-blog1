//const bcrypt = require('bcryptjs'); // 기본 require 방식
// ES Module 사용(리액트와 맞춤)
import 'dotenv/config'; // dotenv 설정 방식이 변경됨
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'http'; // node.js 기본 http 모듈 import
import { Server } from 'socket.io'; // socket.io 서버 임포트 추가 
import passport from 'passport'; // passport import
import { Strategy as NaverStrategy } from 'passport-naver'; // naver passport import
import upload from './upload.js'; // 업로드 기능 추가

// db 스키마 및 모델 분리
import User from './models/User.js'; // 👈 이 줄 추가
import Post from './models/Post.js'; // 👈 이 줄 추가
import Comment from './models/Comment.js'; // 👈 이 줄 추가

//Express 앱 생성 및 설정
const app = express();
const PORT = process.env.PORT || 4500;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    // path: "/api/socket.io", // 경로 추가
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',  // 프론트엔드 주소 허용
        methods: [ "GET", "POST" ],
    }
});

// "누군가 접속하면..." 이라는 이벤트를 감지합니다.
io.on('connection', (socket) => {
    console.log('✅ A user connected:', socket.id);

// 접속이 끊어지면 실행됩니다.
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});
// --- passport 설정 추가 -----
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: '/api/users/naver/callback',
},
// 네이버 프로필 정보를 가져왔을떄 실행할 함수
async ( accessToken, refreshToken, profile, done ) => {
        try {
        //1. 네이버 프로필의 이메일(또는 고유 ID)로 우리 DB에서 사용자를 찾는다. 
        let user = await User.findOne({naverId: profile.id});

        //2. 사용자가 없다면 새로 가입시킴
        if (!user) {
            // 2. username 중복 방지 처리
            const username = profile.displayName;
            const existingUser = await User.findOne({ username });
            let finalUsername = username;

            if (existingUser) {
                // 중복 방지: 네이버 ID를 붙이거나 랜덤값 추가
                finalUsername = `${username}_naver`;
            }

            user = new User({
            username: finalUsername, // 네이버 프로필의 닉네임을 사용
            naverId: profile.id, // 네이버 고유 id는 별도 저장.
            password: 'naver_login_password_placeholder', // 소셜 로그인므로 실제 비밀번호는 필요없음.
            });
            await user.save();
        }
        //3. 찾거나 새로 만든 사용자 정보를 다음 단계로 전달
        return done(null, user);
    } catch (error) {
        if (error.code === 11000) {
            console.error('중복된 username으로 인해 사용자 생성 실패:', error);
            return done(null, false, { message: '중복된 사용자 이름입니다.' });
        }
        return done(error);
    }
}
));

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB에 연결됨'))
    .catch(err => console.error('MongoDB 연결 오류', err));


// aws-sdk (v3)을 사용해 삭제 명령을 준비(S3 Client 생성)
        import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
        const s3 = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            region: process.env.AWS_REGION,
        });

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

// 파일 업로드 
// upload.single('image')는 'image'라는 이름으로 전송된 단일 파일을 처리하는 미들웨어입. 
// app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
//     //파일 업로드 성공시 req.file 객체에 파일이 담김
//     if(!req.file) {
//         return res.status(400).json({ message: '파일이 없습니다.' });
//     }

//     // s3에 저장된 파일의 url을 클라이언트에 보내줌
//     res.json({ imageUrl: req.file.location });
// });

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

//네이버 로그인관련 라우트 추가
// 1. 로그인 시작 라우트(해당 경로로 요청이 오면 네이버 로그인 창으로 보냄
app.get('/api/users/naver', passport.authenticate('naver', { authType: 'reprompt'}));

// 2. 로그인 성공 후 Callback 라우트
app.get('/api/users/naver/callback',
    // passport.authenricate가 중간에 네이버 정보를 받아 위에서 설정한 callback 함수를 실행
    passport.authenticate('naver', {session: false, failureRedirect: '/login'}),
    (req, res) => {
        //3. 콜백함수에서 전달받은 user 정보(req.user)로 우리 앱의 JWT토튼을 생성합니다. 
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );
        //4. 생성된 토큰을 쿼리 파라미터에 담아 프론트엔드의 특정페이지로 리다이렉션
        // 이 부분은 나중에 프론트 엔드에서 토튼을 받을 페이지를 만들고 연결함. 
        res.redirect(`${process.env.FRONTEND_URL}/auth/naver/callback?token=${token}`);
    }
);

// 게시글 목록
app.get('/api/posts', async(req, res) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const skip = (page - 1) * limit;
        const posts = await Post.find({})
        .sort({createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username'); // author 필드를 User정보로 채우고, username만 선택
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    res.json({ posts,
               currentPage: page,
               totalPages,
             });
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
app.post('/api/posts', authMiddleware, upload.array('files', 5), async(req, res) => {
    try {
        
        console.log('=== 게시물 생성 디버깅 ===');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        console.log('Content-Type:', req.headers['content-type']);
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({message:'게시물 제목과 내용은 필수사항이에요.'});
        }

        // req.files 배열을 우리가 원하는 데이터 형태로 가공
        const filesData = req.files ? req.files.map(file => ({
            url: file.location,
            name: Buffer.from(file.originalname, 'latin1').toString('utf8'), // 한글 파일명 복원,
            type: file.mimetype,
        })) : [];

        console.log('가공된 files 데이터:', filesData);

        const newPost = new Post({
            //키 값과 변수명이 같을 경우 키값 생략가능 ES6 문법(객체 속성 축약)
            title: title,
            content: content,
            files: filesData, // 가공된 데이터 배열을 저장
            author: req.user.id
        });

        console.log('저장할 게시물 데이터:', newPost);
        await newPost.save();
        console.log('✅ 게시물 저장 성공');
        res.status(201).json(newPost);
        } catch (error) {
             console.error('❌ 게시물 저장 중 에러 발생:', error);
             if (error.errors) {
             console.error('Validation 에러:', error.errors);
            }
            res.status(500).json({message: '서버 오류가 발생했어요.', error: error.message});
        }
    

});

// app.post('/api/posts', authMiddleware, (req, res, next) => {
//     // 👇 --- multer를 수동으로 실행하고 에러를 직접 처리하는 로직 추가 --- 👇
//     const uploadMiddleware = upload.array('files', 5);

//     uploadMiddleware(req, res, function (err) {
//         if (err) {
//             // Multer나 S3 연결 등 모든 종류의 파일 업로드 에러를 여기서 잡습니다.
//             console.error('!!! 파일 업로드 중 에러 발생 !!!', err);
//             return res.status(500).json({ message: '파일 업로드 중 서버 오류가 발생했습니다.' });
//         }
//         // 에러가 없으면, 다음 API 핸들러로 넘어갑니다.
//         next();
//     });
// }, async (req, res) => {
//     // 기존의 게시글 생성 로직은 그대로 둡니다.
//     try {
//         const { title, content } = req.body;
//         if (!title || !content) {
//             return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
//         }
        
//         const filesData = req.files ? req.files.map(file => ({
//             url: file.location,
//             name: file.originalname,
//             type: file.mimetype,
//         })) : [];
        
//         const newPost = new Post({
//             title,
//             content,
//             files: filesData,
//             author: req.user.id
//         });
//         await newPost.save();
//         res.status(201).json(newPost);
//     } catch (error) {
//         res.status(500).json({ message: '서버 오류가 발생했습니다.' });
//     }
// });

//작성 게시글 수정
app.put('/api/posts/:id', authMiddleware, upload.array('files', 5), async(req, res) => {
    try {
        // console.log('서버가 받은 데이터 (req.body):', req.body);
        const { title, content, existingFiles, deletedFiles } = req.body;
        const postId = req.params.id;
        // console.log('jons변환전 데이터:', existingFiles);

        // 1. 프론트에서 보낸 '남아있는 기존 파일' 목로을 JSON으로 파싱.
        const keptFiles = JSON.parse(existingFiles || []);
        const fileToDelete = JSON.parse(deletedFiles || []);

        if( fileToDelete.length > 0 ) {
            //promise all을 사용해 파일을 동시에 삭제함
            await Promise.all(fileToDelete.map(file => {
                const fileKey = decodeURIComponent(new URL(file.url).pathname.substring(1));
                // 2. 디버깅을 위해 실제 키가 어떻게 보이는지 확인합니다.
                // console.log('S3에서 삭제 시도하는 파일 키:', fileKey);

                const command = new DeleteObjectCommand({
                   Bucket: process.env.S3_BUCKET_NAME,
                   Key: fileKey, 
                });
                return s3.send(command);
            }));
        }
        // console.log('jons변환후 데이터:', keptFiles);

        // 2. 새로 업데이트된 파일은 스키마에 맞게 가공
        const newUploadFiles = req.files ? req.files.map(file => ({
            url: file.location,
            name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
            type: file.mimetype,
        })) : []

        // 3. 기존 파일과 새 파일을 합쳐 최종 파일 목록을 생성
        const finalFiles = [...keptFiles, ...newUploadFiles];
        const updateData = {title, content, files: finalFiles};
        
        if ( !title || !content ) {
            return res.status(400).json({message:'제목과 내용을 필수사항이에요'});
        }
        // 조건, 내용, 옵션의 객체로 구성
        const updatePost = await Post.findOneAndUpdate(
            { _id: postId, author: req.user.id }, // 업데이트 조건: ID일지, 작성자 일치
            updateData, // 업데이트할 내용
            { new: true } // 옵션 : 업데이트된 문서를 반환
        );
        // 저장 실패 시 처리
        if(!updatePost) {
            return res.status(404).json({message:'게시물을 찾을 수 없거나 수정 권한이 없어요'});
        }
        // 저장 성공 시 처리
        res.status(201).json(updatePost);

    } catch (error) {
         console.error("!!! 게시글 생성 중 에러 발생 !!!", error);
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
         console.error("!!! 게시글 수정 중 에러 발생 !!!", error);
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
        io.emit('newComment', populateComment); // 방송 송출
        res.status(201).json(populateComment);

        

    } catch(error) {
        console.error("!!! 댓글 저장 중 에러 발생 !!!", error);
        res.status(500).json({message: '서버 오류가 발생했습니다.', error});
    }
});

// 작성된 댓글 삭제

// 작성된 댓글 수정(선택)

//사용자 정보(프로필)
app.get('/api/users/me', authMiddleware, async( req, res ) => {
     try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({message:'사용자를 찾을 수 없습니다.'});
        }
        res.json(user);

    } catch (error) {
        res.status(500).json({message:'서버 오류가 발생했습니다.'});
    }
});

//비밀번호 수정
app.put('/api/users/password', authMiddleware, async ( req, res ) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if(!currentPassword || !newPassword) {
            return res.status(400).json({message: "모든 항목을 입력해 주세요."});
        }
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        const isSame = await bcrypt.compare(newPassword, user.password);
        if(!isMatch) {
            return res.status(400).json({message: '기존 비밀번호가 일치하지 않습니다.'});
        } else if(isSame) {
            return res.status(400).json({message: '기존 비밀번호와 동일한 비밀번호는 사용할수 없습니다.'});
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({message:'비밀번호가 변경되었습니다.'})

    } catch (error) {
        res.status(500).json({message:'서버 오류가 발생했습니다.'});
    }
});

// S3파일 삭제(수정완료시에만 지울 것이지 때문에 현재는 사용하지 않음)
app.post('/api/delete-file', authMiddleware, async( req, res ) => {
    // s3에 저장된 파일의 전체 url을 요청 body에 받는다. 
    const { fileUrl } = req.body;
    if(!fileUrl) {
        return res.status(400).json({message: '파일 url이 필요합니다.'});
    }

    try {
        // 1. 전체 url에서 파일 키(파일 경로 + 이름)을 추출
        // 예: https://버킷이름.s3.리전.amazonaws.com/images/12345_사진.jpg -> images/12345_사진.jpg
        const fileKey = new URL(fileUrl).pathname.substring(1);

            const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey, // 삭제할 파일 키
        });

        // 3. S3에 삭제 명령을 보냄. 
        await s3.send(command);
        res.json({message: 'S3에서 파일이 성공적으로 삭제되었습니다.'});
    } catch (error) {
        console.error("S3 파일 삭제 중 에러", error);
        res.status(500).json({message: '파일 삭제 중 서버 오류가 발생했습니다.'});

    }
}) 

// 서버실행
httpServer.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`)
});