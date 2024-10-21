import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        console.log("email : ", email);
        console.log("password : ", password);

        if (!email || !password) {
            return NextResponse.json(
                { message: '이메일과 비밀번호를 모두 입력해주세요.' },
                { status: 400 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: '존재하지 않는 사용자입니다.' },
                { status: 400 }
            );
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: '비밀번호가 올바르지 않습니다.' },
                { status: 400 }
            );
        }

        const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        const res = NextResponse.json({ message: '로그인 성공' }, { status: 200 });

        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600,
        });

        return res;

    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: '로그인에 실패하였습니다.' }, { status: 500 });
    }
}
