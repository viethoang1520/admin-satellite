import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Plus,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostTable from "./posts/PostTable";
import PostForm from "./posts/PostForm";
import postStore from "@/store/postStore";
import useSatelliteStore from "@/store/satetillite";
import { Post } from "../../index";
const Home = () => {
  const navigate = useNavigate();

  const {
    posts,
    getPost,
    getPostedPosts,
    getErrorPosts,
    totalPublishedPosts,
    totalErrorPosts,
  } = postStore();

  const { satellites, getSatellite } = useSatelliteStore();

  useEffect(() => {
    getPost();
  }, [getPost]);

  useEffect(() => {
    getSatellite();
  }, [getSatellite]);

  useEffect(() => {
    getPostedPosts();
    getErrorPosts();
  }, [posts]);

  const handleCreatePostClick = () => {
    navigate("/create-post");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="sm:text-3xl text-2xl font-bold tracking-tight text-gray-900 mb-1">
                Quản lý bài viết
              </h1>
              <p className="hidden sm:block text-sm text-gray-500">
                Tạo, chỉnh sửa và xuất bản bài viết lên các website vệ tinh của
                bạn.
              </p>
            </div>
            <Button
              onClick={handleCreatePostClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo bài viết</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {/* Tổng số bài viết */}
            <Card className="hover:shadow-lg transition-all duration-200 border border-gray-100 h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-800 text-sm font-medium">
                  Tổng số bài viết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {posts.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bài viết đang hoạt động
                </p>
              </CardContent>
            </Card>

            {/* Bài viết đã đăng thành công */}
            <Card className="hover:shadow-lg transition-all duration-200 border border-gray-100 h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 text-sm font-medium">
                  Bài viết đã đăng thành công
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
                  {totalPublishedPosts || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Đăng thành công lên website vệ tinh
                </p>
              </CardContent>
            </Card>

            {/* Bài viết đăng thất bại */}
            <Card className="hover:shadow-lg transition-all duration-200 border border-gray-100 h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-600 text-sm font-medium">
                  Bài viết đăng thất bại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">
                  {totalErrorPosts || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lỗi khi đăng lên website vệ tinh
                </p>
              </CardContent>
            </Card>

            {/* Số website vệ tinh */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 h-full flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-100 text-blue-600">
                    <Globe className="h-3 w-3" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-800">
                    Số website vệ tinh
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">
                  {satellites?.length ?? 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Website đang hoạt động
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Post Table */}
          <Card
            id="posts-section"
            className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardHeader>
              <CardTitle className="text-gray-900">Bài viết</CardTitle>
              <CardDescription className="text-gray-500">
                Quản lý bài viết và xuất bản chúng lên các trang vệ tinh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostTable posts={posts} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Home;
