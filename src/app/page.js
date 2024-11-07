'use client';

import ListPost from '@/components/ListPost';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Home() {
    const [token, setToken] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
        }
        console.log("목록 업데이트");
        fetchPosts(); 
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/posts');
            
            console.log("게시글 목록 조회 완료 : ",response.data.data);
            setPosts(response.data.data);
        } catch (error) {
            console.error('게시물 목록 조회 실패', error);
        }
    };

    // 로그아웃
    const handleLogout = () => {
        Swal.fire({
            title: '로그아웃 하시겠습니까?',
            text: '현재 세션이 종료됩니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '로그아웃',
            cancelButtonText: '취소',
            customClass: {
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md',
                cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md',
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                setToken(null);
                Swal.fire('로그아웃되었습니다.', '', 'success');
            }
        });
    };

    return (
        <div className="w-screen py-20 flex justify-center flex-col items-center">
            <div className="flex items-center justify-between gap-1 mb-5">
                <h1 className="text-4xl font-bold">게시판</h1>
            </div>

            <div className="mb-5 flex gap-4">
                {token ? (
                    <>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/users/signup" className="btn btn-primary">
                            회원가입
                        </Link>
                        <Link href="/users/login" className="btn btn-secondary">
                            로그인
                        </Link>
                    </>
                )}
            </div>
            <Link href="/users/profile" className="btn btn-tertiary">
                프로필 조회
            </Link>

            <div className="overflow-x-auto">
                <div className="mb-2 w-full text-right">
                    <Link href="/posts/create" className="btn btn-outline">
                        새 게시물 작성
                    </Link>
                </div>
                <ListPost
                    posts={posts} 
                />
            </div>
        </div>
    );
}