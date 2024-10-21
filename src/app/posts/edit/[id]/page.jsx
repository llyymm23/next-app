"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function EditPost() {
    const { id } = useParams();
    const [inputs, setInputs] = useState({ title: "", content: "" });

    useEffect(() => {
        getPost();
    }, []);

    async function getPost() {
        try {
            const response = await axios.get(`/api/posts/${id}`);
            console.log(response.data.post);
            setInputs({ title: response.data.post.title, content: response.data.post.content });
        } catch (error) {
            console.error("게시물 가져오기 실패", error);
        }
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    }

    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await axios.patch(`/api/posts/${id}`, {
                ...inputs
            });

            Swal.fire({
                icon: 'success',
                title: '수정 성공',
                text: '수정 완료되었습니다.',
                confirmButtonText: '확인'
            }).then(() => {
                router.push('/');
            });

        } catch (error) {
            const errorMessage = error.response?.data?.message || "게시물 수정에 실패하였습니다.";
            Swal.fire({
                icon: 'error',
                title: '수정 실패',
                text: errorMessage,
                confirmButtonText: '확인'
            });
        }
    }

    return (
        <div className="max-w-md mx-auto mt-5">
            <h1 className="text-2xl text-center mb-2">게시물 수정</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3 mt-3">
                    <label className="block text-sm font-medium text-gray-900">title:</label>
                    <input type="text"
                        name="title"
                        className="input input-bordered input-primary w-full max-w-xs"
                        value={inputs.title || ''}
                        onChange={handleChange} />
                </div>
                <div className="mb-3 mt-3">
                    <label className="block text-sm font-medium text-gray-900">content:</label>
                    <textarea type="text"
                        name="content"
                        className="textarea textarea-bordered textarea-primary w-full h-40"
                        value={inputs.content || ''}
                        onChange={handleChange} />
                </div>
                <button type="submit" name="update" className="btn btn-primary">Update</button>
            </form>
        </div>
    )
}
