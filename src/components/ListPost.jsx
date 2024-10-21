import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function ListPost({ currentPage, postsPerPage }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        getPosts();
    }, [currentPage]);

    // 게시물 조회
    async function getPosts() {
        try {
            const response = await axios.get('/api/posts', {
                params: { page: currentPage, limit: postsPerPage },
            });
            setPosts(response.data.posts);
        } catch (error) {
            console.error("게시물 목록 조회 실패", error);
        }
    }

    const deletePost = async (id) => {
        try {
            await axios.delete(`/api/posts/${id}`);
            Swal.fire({
                icon: 'success',
                title: '삭제 성공',
                text: '게시물이 성공적으로 삭제되었습니다.',
            });
            getPosts();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "게시물 삭제에 실패하였습니다.";
            Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: errorMessage,
            });
        }
    };

    return (
        <>
            <table className="table table-zebra">
                <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="py-3 px-6">#</th>
                        <th className="py-3 px-6">작성자</th>
                        <th className="py-3 px-6">제목</th>
                        <th className="py-3 px-6">최종 수정 시간</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post, key) => (
                        <tr key={key} className="bg-white border-b">
                            <td className="py-3 px-6">{post.postId}</td>
                            <td className="py-3 px-6">{post.name}</td>
                            <td className="py-3 px-6">{post.title}</td>
                            <td className="py-3 px-6">{post.updatedAt}</td>
                            <td className="flex justify-center gap-1 py-3">
                                <Link href={`/posts/read/${post.postId}`} className="btn btn-success">
                                    View
                                </Link>
                                <Link className="btn btn-info" href={`/posts/edit/${post.postId}`}>
                                    Edit
                                </Link>
                                <button onClick={() => deletePost(post.postId)} className="btn btn-error">
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
