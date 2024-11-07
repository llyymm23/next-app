'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Profile() {
    const [userProfile, setUserProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '로그인 후 진행해주세요.',
                }).then(() => {
                    router.push('/users/login');
                });
                return;
            }

            try {
                const profileResponse = await axios.get(
                    `http://localhost:3002/api/users/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUserProfile(profileResponse.data.data);

                const postsResponse = await axios.get(
                    `http://localhost:3002/api/posts/my`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("본인이 작성한 게시글 목록 : ", postsResponse.data.data);
                setUserPosts(postsResponse.data.data); 
            } catch (err) {
                console.error('프로필 조회 오류:', err);
                setError(err.message || '프로필을 가져오는 데 실패했습니다.');
                Swal.fire({
                    icon: 'error',
                    title: '프로필 조회 실패',
                    text: error,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router, error]);

    // 게시글 삭제 
    const handleDelete = async (postId) => {
        const token = localStorage.getItem('token');
        
        const result = await Swal.fire({
            title: '게시글 삭제',
            text: '이 게시글을 삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3002/api/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                Swal.fire({
                    icon: 'success',
                    title: '삭제 성공',
                    text: '게시글이 삭제되었습니다.',
                });

                setUserPosts(userPosts.filter(post => post.postId !== postId));
            } catch (error) {
                console.error('게시글 삭제 실패:', error);
                Swal.fire({
                    icon: 'error',
                    title: '삭제 실패',
                    text: '게시글 삭제에 실패했습니다.',
                });
            }
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="absolute top-4 left-4">
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    홈으로 가기
                </button>
            </div>
            <h2 className="text-3xl font-bold mb-4">프로필</h2>
            {userProfile ? (
                <div className="bg-white p-6 rounded shadow-md w-1/2">
                    <h3 className="text-2xl mb-2">이름: {userProfile.name}</h3>
                    <p className="text-gray-700">이메일: {userProfile.email}</p>
                </div>
            ) : (
                <p>사용자 프로필 정보를 찾을 수 없습니다.</p>
            )}

            <div className="mt-8 w-1/2">
                <h3 className="text-xl font-semibold mb-4">작성한 게시글 목록</h3>
                {userPosts.length === 0 ? (
                    <p>작성한 게시글이 없습니다.</p>
                ) : (
                    <ul className="space-y-4">
                        {userPosts.map((post) => (
                            <li key={post.postId} className="bg-white p-4 rounded shadow">
                                <h4 className="font-semibold text-lg">{post.title}</h4>
                                <p className="text-sm text-gray-500">
                                    조회수: {post.views}
                                </p>
                                <p className="text-sm text-gray-500">
                                    상태: {post.status === 'PUBLIC' ? '공개' : '비공개'}
                                </p>
                                <div className="flex justify-between mt-2">
                                    <button
                                        onClick={() => router.push(`/posts/read/${post.postId}`)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        게시글 보기
                                    </button>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => router.push(`/posts/edit/${post.postId}`)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.postId)}
                                            className="text-red-500 hover:underline"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
