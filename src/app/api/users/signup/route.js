import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
     try {
          const { name, email, password } = await req.json();

          if (!name || !email || !password) {
               return NextResponse.json(
                    { message: '모든 필드를 작성해주세요.' },
                    { status: 400 }
               );
          }

          const existingUser = await prisma.users.findUnique({
               where: { email },
          });

          if (existingUser) {
               return NextResponse.json(
                    { message: '이미 존재하는 이메일입니다.' },
                    { status: 400 }
               );
          }

          const hashedPassword = await hash(password, 10);

          const newUser = await prisma.users.create({
               data: {
                    name,
                    email,
                    password: hashedPassword,
               },
          });

          return NextResponse.json(
               { message: '회원가입 성공', user: newUser },
               { status: 201 }
          );
     } catch (err) {
          console.error(err);
          return NextResponse.json(
               { message: '회원가입에 실패하였습니다.' },
               { status: 500 }
          );
     }
}
