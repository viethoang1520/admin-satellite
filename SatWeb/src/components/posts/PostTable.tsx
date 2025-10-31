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
import { Post } from "../../../index";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { title } from "process";
import { stripHtmlTags } from "@/lib/utils";
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
    navigate(`/progress`, { state: { post } });
  };

  const truncateContent = (content: string, maxLength = 100) => {
    const textOnly = stripHtmlTags(content);
    return textOnly.length > maxLength
      ? `${textOnly.substring(0, maxLength)}...`
      : textOnly;
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
                          Xem tiến trình bài viết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PostTable;
