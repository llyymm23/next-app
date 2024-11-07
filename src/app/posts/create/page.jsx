"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

const AddNewPost = () => {
    const [inputs, setInputs] = useState({});
    const [file, setFile] = useState(null);
    const router = useRouter();

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        Object.keys(inputs).forEach((key) => {
            formData.append(key, inputs[key]);
        });

        if (file) {
            formData.append('file', file);
        }

        try {
            console.log("작성 보내려는 데이터",formData);
                        
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
            
            const response = await axios.post('http://localhost:3002/api/posts', formData, {
                headers: {
                    //'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            console.log("게시글 작성 성공:", response.data);

            console.log(" formData : ", formData);

            Swal.fire({
                icon: 'success',
                title: '게시글 작성 성공',
                text: '게시글이 성공적으로 작성되었습니다!',
            }).then(() => {
                router.push('/');
            });

        } catch (err) {
            const errorMessage = err.response?.data?.message || '게시글 작성에 실패했습니다';

            Swal.fire({
                icon: 'error',
                title: '게시글 작성 실패',
                text: errorMessage,
            });
        }
    };

    const handleCancel = () => {
        router.push('/');
    };
    
    return (
        <div className="max-w-md mx-auto mt-5">
            <h1 className="text-2xl text-center mb-2">게시글 작성</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        className="input input-bordered input-primary w-full max-w-xs"
                        placeholder="Title..."
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-5">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-900">
                        Content
                    </label>
                    <textarea
                        name="content"
                        id="content"
                        className="textarea textarea-bordered textarea-primary w-full h-40"
                        placeholder="Content..."
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-5">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                        Category
                    </label>
                    <select
                        name="category"
                        id="category"
                        className="select select-bordered select-primary w-full max-w-xs"
                        onChange={handleChange}
                        value={inputs.category} 
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
                    <label htmlFor="isPublic" className="block text-sm font-medium text-gray-900">
                        공개 여부
                    </label>
                    <select
                        name="status"
                        id="status"
                        className="select select-bordered select-primary w-full max-w-xs"
                        onChange={handleChange}
                        value={inputs.status || "PUBLIC"} 
                    >
                        <option value="PUBLIC">공개</option>
                        <option value="PRIVATE">비공개</option>
                    </select>
                </div>
                
                <div className="mb-5">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-900">
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
                <button type="submit" className="btn btn-primary">게시글 등록</button>
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
};

export default AddNewPost;
