// import aws from 'aws-sdk'; 라이브러리 2.0 기준
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// // 1. aws s3와 연결하기 위한 설정 라이브러리 2.0 기준
// aws.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// 2. multer-s3를 사용해 s3업로드 엔진 생성 2.0 기준
// const s3 = new aws.S3();
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     acl: 'public-read', // 파일에 대한 공개읽기 권한
//     key: function ( req, file, cb ) {
//       // 업로드될 파일의 이름을 설정합니다. 파일명 앞에 현재날짜를 붙여줌. path.basename 메소드를 활용해 file.originalname에서 파일명만 추출
//       cb(null, `image/${Date.now()}_${path.basename(file.originalname)}`);
//     },
//   }),
// });


// 1. aws s3 클라이언트 생성( v3 방식)
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  },
  region: process.env.AWS_REGION,
});

// --- 2. multer-s3 설정 ---
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
       // 👇 --- 여기가 수정된 핵심 로직입니다 --- 👇
      // 1. 원본 파일 이름을 UTF-8 NFC 형식으로 정규화(normalize)합니다.
      const normalizedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      // 2. 정규화된 이름으로 파일 경로를 생성합니다.
      cb(null, `images/${Date.now()}_${path.basename(normalizedOriginalName)}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // 파일 타입 자동 감지
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 👈 5MB 파일 크기 제한 (선택 사항)
});

export default upload;