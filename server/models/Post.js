import mongoose from 'mongoose';
// S3 파일 삭제를 위해 aws-sdk 도구를 가져와야 합니다.
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// S3 클라이언트를 생성합니다.
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});


const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String }, // 이미지 url을 저장할 필드 추가
    files: [
      { // files 배열로 변경
        url: { type: String },
        name: { type: String },
        type: { type: String },
    }
    ],
    createdAt: { type: Date, default: Date.now }
});

postSchema.pre('findOneAndDelete', async function(next) {
  try {
    // this.getQuery()를 통해 현재 쿼리의 조건(예: { _id: '...' })을 가져올 수 있습니다.
    const postToDelete = await this.model.findOne(this.getQuery());
    
    // Comment 모델에서 해당 게시글(post)의 ID를 가진 댓글들을 모두 삭제합니다.
    await mongoose.model('Comment').deleteMany({ post: postToDelete._id });

     if( postToDelete && postToDelete.files && postToDelete.files.length > 0 ) {
                //promise all을 사용해 파일을 동시에 삭제함
                await Promise.all(postToDelete.files.map(file => {
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
    next();
  } catch (error) {
    next(error);
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;