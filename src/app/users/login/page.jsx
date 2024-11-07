'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Login() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const router = useRouter();

     const handleSubmit = async (e) => {
          e.preventDefault();

          try {
               console.log('로그인 전달 이메일 : ', email);
               console.log('로그인 전달 비밀번호 : ', password);

               const res = await axios.post(
                    'http://localhost:3002/api/users/signIn',
                    {
                         email,
                         password,
                    },
                    {
                         withCredentials: true,
                    }
               );

               if (res.status === 200) {
                    console.log('토큰 : ', res.data.data);
                    const token = res.data.data;
                    localStorage.setItem('token', token);
                    Swal.fire({
                         icon: 'success',
                         title: '로그인 성공',
                         text: '로그인에 성공했습니다.',
                    }).then(() => {
                         router.push('/');
                    });
               }
          } catch (error) {
               console.log('로그인 오류 : ', error);

               const errorMessage =
                    error.response?.data?.message || '로그인에 실패하였습니다.';
               Swal.fire({
                    icon: 'error',
                    title: '로그인 실패',
                    text: errorMessage,
               });
          }
     };

     return (
          <div className="flex justify-center items-center min-h-screen">
               <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded shadow-md"
               >
                    <h2 className="text-2xl font-bold mb-4">로그인</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="mb-4">
                         <label className="block mb-2">이메일</label>
                         <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="input input-bordered w-full"
                              required
                         />
                    </div>
                    <div className="mb-4">
                         <label className="block mb-2">비밀번호</label>
                         <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="input input-bordered w-full"
                              required
                         />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                         로그인
                    </button>
               </form>
          </div>
     );
}
