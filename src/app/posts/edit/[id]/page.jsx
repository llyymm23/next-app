'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EditPost() {
    const router = useRouter();
    const { id } = useParams();
    const [inputs, setInputs] = useState({
        title: '',
        content: '',
        category: 'NONE',
        status: 'PUBLIC',
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (id) {
            getPost();
        }
    }, [id]);

    const getPost = async () => {
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

            const authResponse = await axios.get(
                `http://localhost:3002/api/posts/${id}/mine`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!authResponse.data.data.mine) {
                Swal.fire({
                    icon: 'error',
                    title: '수정 권한 없음',
                    text: '본인이 작성한 게시글만 수정할 수 있습니다.',
                }).then(() => {
                    router.push('/');
                });
                return;
            }

            const response = await axios.get(
                `http://localhost:3002/api/posts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const post = response.data.data;
            setInputs({
                title: post.title,
                content: post.content,
                category: post.category,
                status: post.status,
            });

            console.log('수정 게시글 정보: ', post);
        } catch (error) {
            console.error('게시글 수정 조회 에러: ', error);
            Swal.fire({
                icon: 'error',
                title: '조회 실패',
                text: '게시글을 가져오는 데 실패했습니다.',
            });
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: value,
        }));
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleCancel = () => {
        router.push('/');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: '인증 오류',
                text: '로그인 후 진행해주세요.',
            });
            return;
        }

        const formData = new FormData();
        Object.keys(inputs).forEach((key) => {
            formData.append(key, inputs[key]);
        });

        if (file) {
            formData.append('file', file);
        }

        try {
            await axios.put(
                `http://localhost:3002/api/posts/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Swal.fire({
                icon: 'success',
                title: '수정 성공',
                text: '게시물이 성공적으로 수정되었습니다!',
            }).then(() => {
                router.push('/');
            });
        } catch (error) {
            console.error('게시글 수정 에러 : ', error.response?.data);
            const errorMessage = error.response?.data?.message || '게시물 수정에 실패했습니다.';
            Swal.fire({
                icon: 'error',
                title: '수정 실패',
                text: errorMessage,
            });
        }
    };

    return (
        <div className="max-w-md mx-auto mt-5">
            <h1 className="text-2xl text-center mb-2">게시물 수정</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        className="input input-bordered input-primary w-full max-w-xs"
                        value={inputs.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Content
                    </label>
                    <textarea
                        name="content"
                        id="content"
                        className="textarea textarea-bordered textarea-primary w-full h-40"
                        value={inputs.content}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-900"
                    >
                        Category
                    </label>
                    <select
                        name="category"
                        id="category"
                        className="select select-bordered select-primary w-full max-w-xs"
                        onChange={handleChange}
                        value={inputs.category}
                        required
                    >
                        <option value="NONE">카테고리 선택</option>
                        <option value="PIZZA">PIZZA</option>
                        <option value="CHICKEN">CHICKEN</option>
                        <option value="PASTA">PASTA</option>
                        <option value="BURGER">BURGER</option>
                        <option value="DESSERT">DESSERT</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-900"
                    >
                        공개 여부
                    </label>
                    <select
                        name="status"
                        id="status"
                        className="select select-bordered select-primary w-full max-w-xs"
                        onChange={handleChange}
                        value={inputs.status}
                    >
                        <option value="PUBLIC">공개</option>
                        <option value="PRIVATE">비공개</option>
                    </select>
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="file"
                        className="block text-sm font-medium text-gray-900"
                    >
                        파일 업로드
                    </label>
                    <input
                        type="file"
                        name="file"
                        id="file"
                        className="input input-bordered input-primary w-full max-w-xs"
                        onChange={handleFileChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    수정 
                </button>
                <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                    >
                        취소
                    </button>
            </form>
        </div>
    );
}
