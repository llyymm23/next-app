'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

import CommentForm from '@/components/CommentForm';
import ListComments from '@/components/ListComments';

export default function ViewPost() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState({});
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [hasReported, setHasReported] = useState(false);
    const [hasLiked, setHasLiked] = useState(false); 
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        fetchPost();
        checkIfReported();
        checkIfLiked();  
        fetchLikesCount();
    }, [id]);

    // 게시글 조회
    const fetchPost = async () => {
        try {
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

            const post = await axios.get(
                `http://localhost:3002/api/posts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPost(post.data.data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || '게시물 조회에 실패하였습니다.';
            console.error('게시글 조회 오류: ', err);
            Swal.fire({
                title: '게시글 조회 실패',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: '확인',
            }).then(() => {
                router.push('/');
            });
        }
    };

    // 게시글 신고 여부 조회
    const checkIfReported = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            const response = await axios.get(
                `http://localhost:3002/api/reports/post/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("게시글 신고 여부 확인 : ", response.data.data.reported);

            setHasReported(response.data.data.reported);
        } catch (err) {
            console.error('신고 여부 확인 오류:', err);
        }
    };

    // 게시글 추천 여부 조회
    const checkIfLiked = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await axios.get(
                `http://localhost:3002/api/recommend/post/${id}`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("게시글 추천 여부 확인 : ",response.data.data.recommended);

            setHasLiked(response.data.data.recommended); 
        } catch (err) {
            console.error('추천 여부 확인 오류:', err);
        }
    };

    // 추천 수 조회
    const fetchLikesCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await axios.get(
                `http://localhost:3002/api/recommend/post/${id}/likes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("게시글 추천수 : ", response.data.data);
            setLikesCount(response.data.data);  
        } catch (err) {
            console.error('추천수 조회 오류:', err);
        }
    };

    // 추천하기
    const handleLike = async () => {
        console.log('hasLiked:', hasLiked);

        if (hasLiked) {
            Swal.fire({
                icon: 'info',
                title: '이미 추천하셨습니다.',
                text: '이 게시글을 이미 추천하셨습니다.',
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '로그인 후 추천해주세요.',
                });
                return;
            }

            const response = await axios.post(
                `http://localhost:3002/api/recommend`,
                { postId : id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                setPost((prevPost) => ({
                    ...prevPost,
                    likes: prevPost.likes + 1,
                }));
                setHasLiked(true);  
                Swal.fire({
                    icon: 'success',
                    title: '추천 완료',
                    text: '게시물을 추천하였습니다!',
                });
            }
        } catch (err) {
            console.error('추천하기 오류:', err);
            Swal.fire({
                icon: 'error',
                title: '추천 실패',
                text: '추천을 처리할 수 없습니다.',
            });
        }
    };

    // 신고하기
    const handleReport = async () => {
        if (!reportReason.trim()) {
            Swal.fire({
                icon: 'warning',
                title: '신고 사유를 입력하세요.',
                text: '신고 사유를 입력한 후 제출해주세요.',
            });
            return;
        }

        setIsLoadingReport(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '로그인 후 신고할 수 있습니다.',
                });
                return;
            }

            const response = await axios.post(
                `http://localhost:3002/api/reports`,
                { reason: reportReason, postId: id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: '신고 완료',
                    text: '게시글을 신고하였습니다.',
                }).then(() => {
                    setIsReportOpen(false);
                    setHasReported(true);
                });
            }
        } catch (err) {
            console.error('신고하기 오류:', err);
            Swal.fire({
                icon: 'error',
                title: '신고 실패',
                text: '신고를 처리할 수 없습니다.',
            });
        } finally {
            setIsLoadingReport(false);
        }
    };

    // 이미지 파일 확인
    const isImage = (filePath) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = filePath.split('.').pop().toLowerCase();
        return imageExtensions.includes(fileExtension);
    };

    return (
        <div className="max-w-3xl mx-auto mt-5 p-6 bg-white shadow-lg rounded-lg">

            <div className="mb-4">
                <Link href="/" className="btn btn-primary">
                    홈으로 가기
                </Link>
            </div>

            <h1 className="text-4xl font-bold text-center mb-6">{post.title}</h1>

            <div className="flex justify-end space-x-4 mb-6">
                <div className="text-lg text-gray-600 text-right">
                    <p>작성자: {post.name}</p>
                    <p className="text-sm text-gray-500">
                        Posted on: {new Date(post.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                        Last updated: {new Date(post.updatedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">조회수: {post.views}</p>
                    <p className="text-sm text-gray-500">공개 상태: {post.status}</p>
                    <p className="text-sm text-gray-500">카테고리: {post.category}</p>
                </div>
            </div>

            {post.filePath && (
                <div className="mb-6">
                    <a
                        href={`http://localhost:3002/api/posts/download/${post.filePath}`}
                        className="text-blue-500 underline"
                        download
                    >
                        Download file
                    </a>
                </div>
            )}

            <div className="border-t border-gray-300 mt-4 pt-4 pb-6 bg-gray-50 rounded-lg">
                {post.filePath && isImage(post.filePath) && (
                    <div className="mb-6">
                        <img
                            src={`http://localhost:3002/api/posts/download/${post.filePath}`}
                            alt="Post Image"
                            className="w-full h-auto rounded-lg mt-4"
                        />
                    </div>
                )}
                <p className="text-lg text-gray-700 whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>
            
            <div className="mt-4 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                    <button
                    onClick={handleLike}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    disabled={hasLiked}
                    >
                        {hasLiked ? '추천 완료' : '추천하기'}
                    </button>
                        
                        <span className="text-lg text-gray-700">
                            추천 수 : {likesCount} 
                        </span>
                            
                </div>
                
                <div>
                    <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    disabled={hasReported}
                    >
                        {hasReported ? '신고 완료' : '신고하기'}
                    </button>
                </div>
            </div>

            {isReportOpen && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">신고 사유 입력</h3>
                    <textarea
                        className="w-full p-2 border rounded mb-4"
                        rows="4"
                        placeholder="신고 사유를 입력해주세요..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div className="flex justify-between">
                        <button
                            onClick={() => setIsReportOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleReport}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            disabled={isLoadingReport}
                        >
                            {isLoadingReport ? '신고 중...' : '신고하기'}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
                <ListComments postId={id} />
                <CommentForm
                    postId={id}
                    onCommentAdded={() => fetchPost()}
                />
            </div>
        </div>
    );
}

