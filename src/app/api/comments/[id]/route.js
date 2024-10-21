import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

// 댓글 수정 
export async function PATCH(req) {
    const url = new URL(req.url);
    const commentId = url.pathname.split('/').pop();

    const { comment } = await req.json();

    //console.log("commentId : ", commentId);
    //console.log("comment : ", comment);

    if (!comment) {
        return NextResponse.json({ message: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    const token = req.cookies.get('token');

    if (!token) {
        return NextResponse.json({ message: '로그인 후 진행해주세요.' }, { status: 401 });
    }

    try {
        const decoded = verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const existingComment = await prisma.comment.findUnique({
            where: { commentId: Number(commentId) },
        });

        if (!existingComment) {
            return NextResponse.json(
                { message: '수정할 댓글이 존재하지 않습니다.' },
                { status: 404 }
            );
        }

        if (existingComment.userId !== userId) {
            return NextResponse.json(
                { message: '본인이 작성한 댓글만 수정할 수 있습니다.' },
                { status: 403 }
            );
        }

        const updatedComment = await prisma.comment.update({
            where: { commentId: Number(commentId) },
            data: { comment },
        });

        return NextResponse.json({ message: '댓글 수정 성공', comment: updatedComment }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ message: '댓글 수정에 실패하였습니다.' }, { status: 500 });
    }
}

//댓글 삭제
export async function DELETE(req) {
    const url = new URL(req.url);
    const commentId = url.pathname.split('/').pop();

    const token = req.cookies.get('token');

    if (!token) {
        return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
    }

    try {
        const decoded = verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const comment = await prisma.comment.findUnique({
            where: { commentId: Number(commentId) },
        });

        if (!comment) {
            return NextResponse.json(
                { message: '삭제할 댓글이 존재하지 않습니다.' },
                { status: 404 }
            );
        }

        if (comment.userId !== userId) {
            return NextResponse.json(
                { message: '본인이 작성한 댓글만 삭제할 수 있습니다.' },
                { status: 403 }
            );
        }

        await prisma.comment.delete({
            where: { commentId: Number(commentId) },
        });

        return NextResponse.json({ message: '댓글 삭제 성공' });

    } catch (err) {
        return NextResponse.json({ message: '댓글 삭제에 실패하였습니다.' }, { status: 500 });
    }
}
