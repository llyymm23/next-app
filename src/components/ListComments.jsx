import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ListComments({ postId }) {
    const [comments, setComments] = useState([]);
    const [editComment, setEditComment] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/comments?postId=${postId}`);
            setComments(response.data.comments);
        } catch (err) {
            console.log('댓글 조회 실패', err);
        }
    };

    const handleEditClick = (comment) => {
        setEditComment(comment);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const { commentId, newComment } = editComment;

        try {
            await axios.patch(`/api/comments/${commentId}`, { comment: newComment });

            Swal.fire({
                icon: 'success',
                title: '댓글 수정 성공',
                text: '댓글이 수정되었습니다.',
            });

            setEditComment(null);
            fetchComments();

        } catch (err) {
            const errorMessage = err.response?.data?.message || '댓글 수정에 실패하였습니다.';

            Swal.fire({
                icon: 'error',
                title: '댓글 수정 실패',
                text: errorMessage,
            });
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await axios.delete(`/api/comments/${commentId}`);

            Swal.fire({
                icon: 'success',
                title: '댓글 삭제 성공',
                text: '댓글이 성공적으로 삭제되었습니다.',
            });

            fetchComments();

        } catch (err) {
            const errorMessage = err.response?.data?.message || '댓글 삭제에 실패하였습니다.';

            Swal.fire({
                icon: 'error',
                title: '댓글 삭제 실패',
                text: errorMessage,
            });
        }
    };

    return (
        <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.commentId} className="border-b border-gray-200 py-4 flex items-start">
                        <div className="flex-1">
                            <p className="font-bold">{comment.name}</p>
                            {editComment && editComment.commentId === comment.commentId ? (
                                <form onSubmit={handleEditSubmit} className="flex flex-col mt-2">
                                    <textarea
                                        value={editComment.newComment}
                                        onChange={(e) => setEditComment({ ...editComment, newComment: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded mb-2"
                                    />
                                    <div className="flex space-x-2">
                                        <button type="submit" className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded">수정 완료</button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditComment(null);
                                            }}
                                            className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                                    <div className="flex space-x-2 mt-2">
                                        <button onClick={() => handleEditClick(comment)} className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded">수정</button>
                                        <button onClick={() => handleDelete(comment.commentId)} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded">삭제</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">댓글이 없습니다.</p>
            )}
        </section>
    );
}
