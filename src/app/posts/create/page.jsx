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
            const response = await axios.post('/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

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
            </form>
        </div>
    );
};

export default AddNewPost;
