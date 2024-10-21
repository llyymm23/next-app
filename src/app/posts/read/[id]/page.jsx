"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from "next/navigation";
import Swal from 'sweetalert2';

import CommentForm from '@/components/CommentForm';
import ListComments from '@/components/ListComments';

export default function ViewPost() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState({});

    useEffect(() => {
        fetchPost();
    }, [id]);

    // 게시물 조회
    const fetchPost = async () => {
        try {
            const response = await axios.get(`/api/posts/${id}`);
            setPost(response.data.post);

        } catch (err) {
            const errorMessage = err.response?.data?.message || '게시물 조회에 실패하였습니다.';

            Swal.fire({
                title: '게시글 조회 실패',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: '확인'
            }).then(() => {
                router.push('/');
            });
        }
    };

    console.log("imageUrl", post.imageUrl);

    return (
        <div className="max-w-3xl mx-auto mt-5 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-4xl font-bold text-center mb-6">{post.title}</h1>

            <div className="flex justify-end space-x-4 mb-6">
                <div className="text-lg text-gray-600 text-right">
                    <p>By: {post.name}</p>
                    <p className="text-sm text-gray-500">Posted on: {new Date(post.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Last updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>

            {post.imageUrl && (
                <div className="mb-6">
                    <a
                        href={post.imageUrl}
                        download
                        className="text-blue-500 underline"
                    >
                        Download file
                    </a>
                </div>
            )}

            <div className="border-t border-gray-300 mt-4 pt-4 pb-6 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
                <ListComments postId={id} />
                <CommentForm postId={id} onCommentAdded={() => fetchPost()} />
            </div>
        </div>
    );
}
