import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Send,
  FileText,
  Eye,
} from "lucide-react";

interface Post {
  _id: string;
  title: string;
  content: string;
  link: string;
  status?: "draft" | "published" | "failed";
}
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { title } from "process";
interface PostTableProps {
  posts?: Post[];
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onPublish?: (postId: string) => void;
}

const PostTable = ({
  posts,
  onEdit = () => {},
  onDelete = () => {},
  onPublish = () => {},
}: PostTableProps) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const handlePublish = (post: Post) => {
    onPublish(post._id);
    console.log("Navigating to progress page for post:", post);
    navigate(`/progress`, { state: { post } });
  };

  const confirmDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      onDelete(postToDelete);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handlePreview = (post: Post) => {
    setPreviewPost(post);
    setPreviewDialogOpen(true);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const truncateContent = (content: string, maxLength = 100) => {
    // Remove markdown image syntax for preview
    const textOnly = stripHtmlTags(content);
    // const textOnly = content.replace(
    //   /!\[([^\]]*)\]\(([^)]+)\)/g,
    //   "[Image: $1]"
    // );
    return textOnly.length > maxLength
      ? `${textOnly.substring(0, maxLength)}...`
      : textOnly;
  };

  const renderContentPreview = (content: string) => {
    // Simple markdown-to-HTML conversion for images
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    return content.split("\n").map((line, index) => {
      const processedLine = line.replace(imageRegex, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
      });

      return (
        <div key={index} className="mb-2">
          <span dangerouslySetInnerHTML={{ __html: processedLine }} />
        </div>
      );
    });
  };
  const stripHtmlTags = (html: string): string => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    const parser = new DOMParser();
    const decoded = parser.parseFromString(text, "text/html").documentElement
      .textContent;
    return decoded || "";
  };
  const hasImages = (content: string) => {
    return /!\[([^\]]*)\]\(([^)]+)\)/g.test(content);
  };

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="min-w-[300px]">Content Preview</TableHead>
              <TableHead className="min-w-[150px]">Xem tiến trình</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="h-8 w-8 text-gray-300" />
                    <p>
                      No posts found. Create your first post to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              posts
                .slice() // tạo bản sao để không mutate mảng gốc
                .sort((a, b) => b._id.localeCompare(a._id))
                .map((post) => (
                  <TableRow key={post._id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="font-medium text-gray-900 leading-tight">
                        {post.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {truncateContent(post.content)}
                        {hasImages(post.content) && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              Contains Images
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          onClick={() => handlePublish(post)}
                          className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Xem tiến trình
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Content Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewPost && (
              <div className="prose max-w-none">
                {renderContentPreview(previewPost.content)}
              </div>
            )}
            {previewPost?.link && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Related Link:</p>
                <a
                  href={previewPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {previewPost.link}
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostTable;
