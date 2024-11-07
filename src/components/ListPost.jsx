import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';

const CATEGORY_ENUM = {
    PIZZA: 'PIZZA',
    CHICKEN: 'CHICKEN',
    PASTA: 'PASTA',
    BURGER: 'BURGER',
    DESSERT: 'DESSERT',
    OTHER: 'OTHER',
};

export default function ListPost({ currentPage, postsPerPage }) {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // 게시물 조회
    const getPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/posts');

            setPosts(response.data.data);
        } catch (error) {
            console.error('게시물 목록 조회 실패', error);
            Swal.fire({
                icon: 'error',
                title: '게시물 조회 실패',
                text: '게시물을 가져오는 데 실패했습니다.',
            });
        }
    };

    // 카테고리별 게시물 조회
    const getPostsByCategory = async (category) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '로그인이 필요합니다.',
                });
                return;
            }

            const response = await axios.get(`http://localhost:3002/api/posts/category/${category}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("카테고리 조회 완료 : ", response.data.data);
            
            setPosts(response.data.data); 
        } catch (error) {
            console.error('카테고리 게시물 조회 실패', error);
        }
    };


    // 게시물 삭제
    const deletePost = async (id) => {
        const token = localStorage.getItem('token');

        if (!token) {
            return Swal.fire({
                icon: 'error',
                title: '인증 오류',
                text: '로그인이 필요합니다.',
            });
        }

        try {
            await axios.delete(`http://localhost:3002/api/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Swal.fire({
                icon: 'success',
                title: '삭제 성공',
                text: '게시물이 성공적으로 삭제되었습니다.',
            });

            getPosts(); 
        } catch (error) {
            console.log('게시글 삭제 에러 메시지 : ', error);
            const errorMessage = error.response?.data?.message || '게시글 삭제에 실패하였습니다.';

            Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: errorMessage,
            });
        }
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleCategorySearch = () => {
        if (selectedCategory) {
            getPostsByCategory(selectedCategory); 
        } else {
            getPosts(); 
        }
    };

    useEffect(() => {
        getPosts();
    }, [currentPage]);

    return (
        <>
                <div className="mb-5 flex gap-4 items-center">
                <label htmlFor="category" className="text-lg">카테고리:</label>
                <select
                    id="category"
                    name="category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="p-2 border rounded"
                >
                    <option value="">전체</option>
                    {Object.entries(CATEGORY_ENUM).map(([key, value]) => (
                        <option key={key} value={value}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleCategorySearch}
                    className="btn btn-primary"
                >
                    조회
                </button>
                <Link href="/report" className="btn btn-warning ml-4">
                    신고 게시판
                </Link>
            </div>
            <table className="table table-zebra">
                <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="py-3 px-6">#</th>
                        <th className="py-3 px-6">작성자</th>
                        <th className="py-3 px-6">제목</th>
                        <th className="py-3 px-6">조회수</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post, key) => (
                        <tr key={key} className="bg-white border-b">
                            <td className="py-3 px-6">{post.postId}</td>
                            <td className="py-3 px-6">{post.name}</td>
                            <td className="py-3 px-6">{post.title}</td>
                            <td className="py-3 px-6">{post.views}</td>
                            <td className="flex justify-center gap-1 py-3">
                                <Link href={`/posts/read/${post.postId}`} className="btn btn-success">
                                    View
                                </Link>
                                <Link href={`/posts/edit/${post.postId}`} className="btn btn-info">
                                    Edit
                                </Link>
                                <button
                                    onClick={() => deletePost(post.postId)}
                                    className="btn btn-error"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

