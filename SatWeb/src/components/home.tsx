import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Plus,
  Menu,
  X,
  User,
  CheckCircle,
  XCircle,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import PostTable from "./posts/PostTable";
import PostForm from "./posts/PostForm";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import postStore from "@/store/postStore";
import useSatelliteStore, { Satellite } from "@/store/satetillite";

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
    getProgress,
    totalPublishedPosts,
    getErrorPosts,
    totalErrorPosts,
  }: any = postStore();
  const [postsv2, setPostsv2] = useState(posts);
  const { satellites, getSatellite } = useSatelliteStore();
  const scrollToPosts = () => {
    const postsSection = document.getElementById("posts-section");
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: "smooth" });
    }
  };
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

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      action: () => navigate("/"),
    },
    {
      name: "Post List",
      path: "#posts-section",
      icon: <FileText className="h-5 w-5" />,
      action: scrollToPosts,
    },
    {
      name: "Progress Tracking",
      path: "/progress",
      icon: <BarChart2 className="h-5 w-5" />,
      action: () => navigate("/progress"),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[oklch(0.147 0.004 49.25)] ">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:hidden">
                Quản lí bài viết
              </h1>
              <h1 className="text-black text-2xl font-bold tracking-tight hidden sm:block">
                Quản lý và xuất bản bài viết của bạn lên các trang vệ tinh.
              </h1>
            </div>
            <Button
              onClick={handleCreatePostClick}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo bài viết</span>
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="grid gap-2 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng số bài viết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bài viết đang hoạt động
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    Số bài viết đã đăng thành công
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalPublishedPosts}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bài viết đang hoạt động
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">
                    Số bài viết đã đăng thất bại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalErrorPosts && 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bài viết đang hoạt động
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-blue-100 text-blue-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-sm font-medium">
                      Số website vệ tinh đang có
                    </CardTitle>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link to="/viewSat" className="text-xs">
                      Quản lý
                    </Link>
                  </Button>
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {satellites?.length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Website đang hoạt động
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Post Table */}
            <Card id="posts-section">
              <CardHeader>
                <CardTitle>Bài viết</CardTitle>
                <CardDescription>
                  Quản lý bài viết của bạn và xuất bản chúng lên các trang vệ
                  tinh.
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
          </div>
        </main>
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
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
