'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link'; 

export default function ReportBoard() {
    const [reports, setReports] = useState([]);

    // 신고 목록 조회
    const getReports = async () => {
        try {
            const token = localStorage.getItem('token');

            console.log('신고 목록 조회 전달 토큰 : ', token);

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

            const response = await axios.get('http://localhost:3002/api/reports', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('신고 목록 조회 : ', response.data.data);

            setReports(response.data.data);
        } catch (error) {
            console.error('신고 목록 조회 실패', error);
            Swal.fire({
                icon: 'error',
                title: '신고 목록 조회 실패',
                text: '신고 목록을 가져오는 데 실패했습니다.',
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return 'badge-warning'; // 처리 대기
            case 'IN_PROGRESS':
                return 'badge-info'; // 처리 중
            case 'RESOLVED':
                return 'badge-success'; // 처리 완료
            case 'REJECTED':
                return 'badge-error'; // 거절됨
            default:
                return 'badge-secondary'; // 기본값
        }
    };

    useEffect(() => {
        getReports();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <Link href="/" className="btn btn-primary">
                    홈으로 가기
                </Link>
            </div>
            
            <h1 className="text-2xl text-center mb-5">신고 목록</h1>

            <table className="table table-zebra w-full">
                <thead>
                    <tr>
                        <th className="py-3 px-6">#</th>
                        <th className="py-3 px-6">신고자</th>
                        <th className="py-3 px-6">신고 이유</th>
                        <th className="py-3 px-6">상태</th>
                        <th className="py-3 px-6">신고 게시글</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-3">
                                신고된 게시물이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                            <tr key={report.reportId}>
                                <td className="py-3 px-6">{report.reportId}</td>
                                <td className="py-3 px-6">{report.name}</td>
                                <td className="py-3 px-6">{report.reason}</td>
                                <td className="py-3 px-6">
                                    <span className={`badge ${getStatusBadge(report.status)}`}>
                                        {report.status === 'PENDING' && '처리 대기'}
                                        {report.status === 'IN_PROGRESS' && '처리 중'}
                                        {report.status === 'RESOLVED' && '처리 완료'}
                                        {report.status === 'REJECTED' && '거절됨'}
                                    </span>
                                </td>
                                <td className="py-3 px-6">
                                    <Link
                                        href={`/posts/read/${report.postId}`}
                                        className="btn btn-info btn-sm bg-blue-200 hover:bg-blue-300 text-blue-800"
                                    >
                                        게시글 보기
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
