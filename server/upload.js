import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// 1. aws s3와 연결하기 위한 설정
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 2. multer-s3를 사용해 s3업로드 엔진 생성
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read', // 파일에 대한 공개읽기 권한
    key: function ( req, file, cb ) {
      // 업로드될 파일의 이름을 설정합니다. 파일명 앞에 현재날짜를 붙여줌. path.basename 메소드를 활용해 file.originalname에서 파일명만 추출
      cb(null, `image/${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
});

export default upload;