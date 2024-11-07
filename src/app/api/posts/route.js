import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// 게시물 조회
export async function GET(req) {
     const { searchParams } = new URL(req.url);
     const page = parseInt(searchParams.get('page')) || 1;
     const limit = parseInt(searchParams.get('limit')) || 10;
     const skip = (page - 1) * limit;

     try {
          const [posts, totalPosts] = await Promise.all([
               prisma.posts.findMany({
                    skip,
                    take: limit,
                    orderBy: { postId: 'asc' },
                    include: {
                         user: {
                              select: { name: true },
                         },
                    },
               }),
               prisma.posts.count(),
          ]);

          const totalPages = Math.ceil(totalPosts / limit);

          return NextResponse.json({
               message: '게시물 조회 성공',
               posts: posts.map((post) => ({
                    ...post,
                    name: post.user.name,
               })),
               totalPages,
          });
     } catch (error) {
          return NextResponse.json(
               { message: '게시물 조회에 실패하였습니다.' },
               { status: 500 }
          );
     }
}

// 새 게시물 생성
export async function POST(req) {
     try {
          const token = req.cookies.get('token');

          if (!token) {
               return NextResponse.json(
                    { message: '로그인 후 진행해주세요.' },
                    { status: 401 }
               );
          }

          const decoded = verify(token.value, process.env.JWT_SECRET);

          const user = await prisma.users.findUnique({
               where: { userId: decoded.userId },
          });

          if (!user) {
               return NextResponse.json(
                    { message: '사용자를 찾을 수 없습니다.' },
                    { status: 404 }
               );
          }

          const data = await req.formData();
          const title = data.get('title');
          const content = data.get('content');
          const file = data.get('file');

          console.log('title : ', title);
          console.log('content : ', content);
          console.log('file : ', file);

          if (!title || !content) {
               return NextResponse.json(
                    { message: '모든 필드를 작성해주세요.' },
                    { status: 400 }
               );
          }

          let imageUrl = null;

          if (file) {
               const uploadDir = path.join(process.cwd(), 'public/uploads');
               await fs.mkdir(uploadDir, { recursive: true });

               const filePath = path.join(uploadDir, file.name);
               const fileBuffer = Buffer.from(await file.arrayBuffer());

               await fs.writeFile(filePath, fileBuffer);
               imageUrl = `/uploads/${file.name}`;

               console.log('imageUrl : ', imageUrl);
          }

          const newPost = await prisma.posts.create({
               data: {
                    title,
                    content,
                    imageUrl,
                    user: {
                         connect: { userId: user.userId },
                    },
               },
          });

          return NextResponse.json(
               {
                    message: '게시물 작성 성공',
                    post: newPost,
               },
               { status: 201 }
          );
     } catch (err) {
          return NextResponse.json(
               { message: '게시물 작성에 실패하였습니다.' },
               { status: 500 }
          );
     }
}
