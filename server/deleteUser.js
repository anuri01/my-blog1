import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const deleteUserByUsername = async () => {
  // 터미널에서 세 번째로 입력한 값을 사용자 이름으로 사용합니다.
  const usernameToDelete = process.argv[2];

  if (!usernameToDelete) {
    console.log('❌ 삭제할 사용자의 이름을 입력해주세요.');
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB에 연결되었습니다.');

  try {
    // 입력한 이름으로 사용자를 찾아 삭제합니다.
    const result = await User.deleteOne({ username: usernameToDelete });

    if (result.deletedCount > 0) {
      console.log(`✅ 사용자 '${usernameToDelete}'을(를) 성공적으로 삭제했습니다.`);
    } else {
      console.log(`'${usernameToDelete}' 사용자를 찾을 수 없습니다.`);
    }

  } catch (error) {
    console.error('오류가 발생했습니다:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
};

deleteUserByUsername();