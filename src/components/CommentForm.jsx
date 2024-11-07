import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function CommentForm({ postId, refreshComments }) {
     const [comment, setComment] = useState('');

     const handleSubmit = async (e) => {
          e.preventDefault();

          try {
               const token = localStorage.getItem('token');

               console.log('게시글 조회 전달 토큰 : ', token);

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

               await axios.post(
                    `http://localhost:3002/api/comments/post/${postId}`,
                    { comment },
                    {
                         headers: {
                              Authorization: `Bearer ${token}`,
                         },
                    }
               );

               console.log('전달한 댓글 : ', comment);

               setComment('');

               Swal.fire({
                    icon: 'success',
                    title: '댓글 작성 성공',
                    text: '댓글이 작성되었습니다.',
               }).then(() => {
                    window.location.reload();
               });
          } catch (err) {
               const errorMessage =
                    err.response?.data?.message ||
                    '댓글 작성에 실패하였습니다.';

               Swal.fire({
                    icon: 'error',
                    title: '댓글 작성 실패',
                    text: errorMessage,
               });
          }
     };

     return (
          <div>
               <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                         placeholder="댓글 내용"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                         type="submit"
                         className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                         댓글 달기
                    </button>
               </form>
          </div>
     );
}
