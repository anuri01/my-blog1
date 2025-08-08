import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 

// -- 데이터 모델 정의 ---

// 사용자(User) 모델 스키마정의
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String},
    naverId: { type: String, unique: true, sparse: true } // 네이버 고유 ID를 위한 필드
});

// 사용자 정보 저장 시 비밀번호 암호화 훅 추가
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// 모델 생성
const User = mongoose.model('User', userSchema);


export default User;