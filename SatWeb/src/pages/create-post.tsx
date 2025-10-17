import React from "react";
import { useNavigate } from "react-router-dom";
import PostForm from "@/components/posts/PostForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  urls: string[];
}

const CreatePost = () => {
  const navigate = useNavigate();

  const handleCreatePost = (values: any) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: values.title,
      content: values.content,
      urls: values.urls,
    };

    // In a real app, you would save this to your backend/state management
    console.log("Creating post:", newPost);

    // Navigate back to home page
    navigate("/progress", { state: { post: newPost } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Post
            </h1>
            <p className="text-muted-foreground mt-2">
              Create a new post with content and images to publish across your
              satellite sites.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <PostForm onSubmit={handleCreatePost} />
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
