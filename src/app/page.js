"use client";

import ListPost from "@/components/ListPost";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 2;

  //전체 페이지 수 가져오기
  const fetchTotalPages = async () => {
    try {
      const response = await fetch(`/api/posts?page=1&limit=${postsPerPage}`);
      const data = await response.json();
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('페이지 수 조회 실패', error);
    }
  };

  useEffect(() => {
    fetchTotalPages();
  }, [postsPerPage]);

  const changePage = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="w-screen py-20 flex justify-center flex-col items-center">
      <div className="flex items-center justify-between gap-1 mb-5">
        <h1 className="text-4xl font-bold">Next.js 게시판</h1>
      </div>

      <div className="mb-5 flex gap-4">
        <Link href="/users/signup" className="btn btn-primary">
          회원가입
        </Link>
        <Link href="/users/login" className="btn btn-secondary">
          로그인
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="mb-2 w-full text-right">
          <Link href="/posts/create" className="btn btn-outline">
            새 게시물 작성
          </Link>
        </div>
        <Suspense fallback="Loading...">
          <ListPost currentPage={currentPage} postsPerPage={postsPerPage} />
        </Suspense>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn"
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => handlePageChange(index + 1)}
          className={`btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn"
      >
        다음
      </button>
    </div>
  );
}
