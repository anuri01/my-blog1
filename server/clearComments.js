import mongoose from 'mongoose';
import Comment from './models/Comment.js';
import dotenv from 'dotenv';

dotenv.config(); // dotenv는 import 후 config()를 따로 호출해줍니다.

const clearComments = async () => {
    try {
        console.log('DB에 연결 중...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB 연결 성공. 게시물 삭제를 시작합니다...');

        const result = await Comment.deleteMany({});
        console.log(`✅ ${result.deletedCount}개의 게시물이 성공적으로 삭제되었습니다.`);

    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        // 작업이 끝나면 DB 연결을 닫습니다.
        await mongoose.connection.close();
        console.log('DB 연결이 종료되었습니다.');
    }
};

// 스크립트 실행
clearComments();