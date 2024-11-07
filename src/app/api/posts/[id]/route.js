import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

// 게시물 단건 조회
export async function GET(req) {
     const url = new URL(req.url);
     const pathname = url.pathname;
     const postId = pathname.split('/').pop();

     const token = req.cookies.get('token');

     if (!token) {
          return NextResponse.json(
               { message: '로그인 후 진행해주세요.' },
               { status: 401 }
          );
     }

     try {
          const post = await prisma.posts.findUnique({
               where: { postId: Number(postId) },
               include: { user: true },
          });

          if (!post) {
               return NextResponse.json(
                    { message: '해당 게시물이 존재하지 않습니다.' },
                    { status: 404 }
               );
          }

          return NextResponse.json({
               message: '게시물 조회 성공',
               post: {
                    ...post,
                    name: post.user.name,
                    imageUrl: post.imageUrl,
               },
          });
     } catch (err) {
          return NextResponse.json(
               { message: '게시물 조회에 실패하였습니다.' },
               { status: 500 }
          );
     }
}

// 게시물 수정
export async function PATCH(req) {
     const url = new URL(req.url);
     const pathname = url.pathname;
     const postId = pathname.split('/').pop();

     const token = req.cookies.get('token');

     if (!token) {
          return NextResponse.json(
               { message: '로그인 후 진행해주세요.' },
               { status: 401 }
          );
     }

     const { title, content } = await req.json();

     if (!title || !content) {
          return NextResponse.json(
               { message: '모든 필드를 작성해주세요.' },
               { status: 400 }
          );
     }

     try {
          const decoded = verify(token.value, process.env.JWT_SECRET);

          const post = await prisma.posts.findUnique({
               where: { postId: Number(postId) },
          });

          if (!post) {
               return NextResponse.json(
                    { message: '수정하고자 하는 게시물이 존재하지 않습니다.' },
                    { status: 404 }
               );
          }

          if (post.userId !== decoded.userId) {
               return NextResponse.json(
                    { message: '본인이 작성한 게시물만 수정할 수 있습니다.' },
                    { status: 403 }
               );
          }

          const updatedPost = await prisma.posts.update({
               where: { postId: Number(postId) },
               data: {
                    title: title ?? post.title,
                    content: content ?? post.content,
               },
          });

          return NextResponse.json(
               { message: '게시물 수정 성공', post: updatedPost },
               { status: 200 }
          );
     } catch (err) {
          return NextResponse.json(
               { message: '게시물 수정에 실패하였습니다.' },
               { status: 500 }
          );
     }
}

// 게시물 삭제
export async function DELETE(req) {
     const url = new URL(req.url);
     const pathname = url.pathname;
     const postId = pathname.split('/').pop();

     const token = req.cookies.get('token');

     if (!token) {
          return NextResponse.json(
               { message: '로그인 후 진행해주세요.' },
               { status: 401 }
          );
     }

     try {
          const decoded = verify(token.value, process.env.JWT_SECRET);

          const post = await prisma.posts.findUnique({
               where: { postId: Number(postId) },
          });

          if (!post) {
               return NextResponse.json(
                    { message: '삭제하고자 하는 게시물이 존재하지 않습니다.' },
                    { status: 404 }
               );
          }

          if (post.userId !== decoded.userId) {
               return NextResponse.json(
                    { message: '본인이 작성한 게시물만 삭제할 수 있습니다.' },
                    { status: 403 }
               );
          }

          await prisma.posts.delete({
               where: { postId: Number(postId) },
          });

          return NextResponse.json({ message: '게시물 삭제 성공' });
     } catch (err) {
          return NextResponse.json(
               { message: '게시물 삭제에 실패하였습니다.' },
               { status: 500 }
          );
     }
}
