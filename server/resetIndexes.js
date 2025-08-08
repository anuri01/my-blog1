import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const resetIndexes = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB에 연결되었습니다.');

  try {
    // 기존 username 인덱스 삭제
    await User.collection.dropIndex('username_1');
    console.log('기존 username 인덱스가 삭제되었습니다.');

    // 새로운 unique 인덱스 생성
    await User.collection.createIndex({ username: 1 }, { unique: true });
    console.log('새로운 username unique 인덱스가 생성되었습니다.');
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('삭제할 username 인덱스가 없습니다. 새 인덱스를 생성합니다.');
      await User.collection.createIndex({ username: 1 }, { unique: true });
      console.log('새로운 username unique 인덱스가 생성되었습니다.');
    } else {
      console.error('인덱스 재설정 중 오류가 발생했습니다:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
};

resetIndexes();