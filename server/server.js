// ES Module 사용(리액트와 맞춤)
import 'dotenv/config'; // dotenv 설정 방식이 변경됨
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
//const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';

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

// -- 데이터 모델 정의 ---

// 사용자(User) 모델
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, repuired: true }
});

// 사용자 정보 저장 시 비밀번호 암호화
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 게시글(Post) 모델
const postSchema = new mongoose.Schema({
    // 포스트 제목, 포스트 내용, 작성자(userSchema 연결), 작성일(date) 필요.
    // 추후 수정일 필요할 수 있음.
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

app.get('/api', (req, res) => {
    res.send('블로그 API 서버');
});

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
        res.status(200).json({message: '회원 가입이 완료되었습니다.'})
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
        // 토큰 발핼
        const token = jwt.sign(
            { id: user._id, username: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        res.json({ token, message:'로그인에 성공했습니다.' });
    } catch(error) {
        res.status(500).json({message:'서버 오류가 발생했습니다.'});
    }
})

// 서버실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`)
});