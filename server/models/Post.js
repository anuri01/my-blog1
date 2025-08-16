import mongoose from 'mongoose';

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
    next();
  } catch (error) {
    next(error);
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;