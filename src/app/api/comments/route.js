import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';


const prisma = new PrismaClient();

// 댓글 조회하기
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json({ message: '해당 게시글이 존재하지 않습니다.' }, { status: 400 });
        }

        const comments = await prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: {
                user: {
                    select: { name: true }
                }
            }

        });

        return NextResponse.json({
            message: '댓글 조회 성공', comments: comments.map(comment =>
                ({ ...comment, name: comment.user.name }))
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ message: '댓글 조회에 실패하였습니다.' }, { status: 500 });
    }
}

// 댓글 작성하기
export async function POST(req) {
    try {
        const { postId, comment } = await req.json();

        console.log("comment : ", comment);

        if (!postId || !comment) {
            return NextResponse.json(
                { message: '모든 필드를 작성해주세요.' },
                { status: 400 }
            );
        }

        const token = req.cookies.get('token');

        if (!token) {
            return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
        }

        const decoded = verify(token.value, process.env.JWT_SECRET);

        // console.log("decoded : ", decoded);

        const newComment = await prisma.comment.create({
            data: {
                postId: Number(postId),
                comment,
                userId: decoded.userId,
            },
        });

        return NextResponse.json({ message: '댓글 작성 성공', comment: newComment }, { status: 201 });

    } catch (err) {
        return NextResponse.json({ message: '댓글 작성에 실패하였습니다.' }, { status: 500 });
    }
}
