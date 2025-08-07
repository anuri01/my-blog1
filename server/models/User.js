import mongoose from 'mongoose';

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

const User = mongoose.model('User', userSchema);

export default User;