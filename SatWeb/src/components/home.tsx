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

interface Post {
  id: string;
  title: string;
  content: string;
  link: string;
  image?: string;
  status?: "draft" | "published" | "failed";
}

const Home = () => {
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const {
    posts,
    getPost,
    getPostedPosts,
    getErrorPosts,
    totalPublishedPosts,
    totalErrorPosts,
  }: any = postStore();

  const { satellites, getSatellite } = useSatelliteStore();
  const [postsv2, setPostsv2] = useState(posts);

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

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePost = (values: any) => {
    if (editingPost) {
      setPostsv2((prev) =>
        prev.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: values.title,
                content: values.content,
                link: values.link || "",
                image: values.image || "",
              }
            : post
        )
      );
      setIsEditDialogOpen(false);
      setEditingPost(null);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPostsv2((prev) => prev.filter((post) => post.id !== postId));
  };

  const handlePublishPost = (postId: string) => {
    setPostsv2((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: "published" as const } : post
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
                Quản lý bài viết
              </h1>
              <p className="text-sm text-gray-500">
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

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="hover:shadow-lg transition-all duration-200 border border-gray-100">
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

            <Card className="hover:shadow-lg transition-all duration-200 border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 text-sm font-medium">
                  Bài viết đã đăng thành công
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">
                  {totalPublishedPosts}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Đăng thành công lên website vệ tinh
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border border-gray-100">
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

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-800">
                    Số website vệ tinh
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/viewSat" className="text-xs">
                    Quản lý
                  </Link>
                </Button>
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
              <PostTable
                posts={posts}
                onDelete={handleDeletePost}
                onPublish={handlePublishPost}
              />
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <PostForm
              initialValues={{
                title: editingPost.title,
                content: editingPost.content,
                link: editingPost.link,
              }}
              onSubmit={handleUpdatePost}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
