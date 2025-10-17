import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import postStore from "@/store/postStore";
import { Editor } from "@tinymce/tinymce-react";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Eye,
  EyeOff,
  Clock,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceDisplay } from "@/components/ui/PerformanceDisplay";
import { useNavigate } from "react-router";
import { title } from "process";
import wpSites from "@/state/wpSite";
const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tiêu đề không được để trống" })
    .max(100, { message: "Tiêu đề phải ít hơn 100 ký tự" }),
  content: z.string().min(1, { message: "Nội dung không được để trống" }),
  link: z
    .string()
    .url({ message: "Vui lòng nhập URL hợp lệ" })
    .or(z.string().length(0)),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostFormProps {
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  isEditing?: boolean;
}

const PostForm = ({
  initialValues,
  onSubmit,
  isEditing = false,
}: PostFormProps) => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { posts, addPost } = postStore();
  const { measureAsync, clearMetrics, metrics } = usePerformanceMonitor();
  const defaultValues: FormValues = initialValues || {
    title: "",
    content: "",
    link: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: FormValues) => {
    console.log("Submitting form with values:", values);
    const toastId = toast.info("Đang tạo bài viết mới...", {
      autoClose: false,
    });

    // navigate("/progress", { state: { post: { title: values.title } } });
    // setUploading(true);
    try {
      await measureAsync("Tạo bài viết mới", async () => {
        const url = "http://localhost:3000/api/post";
        console.log("url", url);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values, storeImg: storeImg.current }),
        });

        if (!response.ok) {
          throw new Error("Yêu cầu thất bại");
        }

        const { newPost, urls } = await response.json();

        const post = {
          id: newPost._id,
          title: newPost.title,
          content: newPost.content,
          urls: urls,
        };

        console.log("Tạo bài viết thành công:", post);
        addPost(post);
        onSubmit(post);
        toast.dismiss(toastId);
        toast.success("Tạo bài viết thành công!", { autoClose: 3000 });
        return post;
      });
    } catch (error) {
      console.log("Tạo bài viết thất bại:", error);
      toast.dismiss(toastId);
      toast.error("Tạo bài viết thất bại!", { autoClose: 3000 });
    } finally {
      setUploading(false);
    }
  };

  const file_picker_callback = (callback, value, meta) => {
    if (meta.filetype === "image") {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");

      input.onchange = async function () {
        const file = (this as HTMLInputElement).files?.[0];
        if (file) {
          // Upload lên nhiều WordPress site
          const results = await uploadImageToMultipleWordPress(file);
          // Chèn ảnh đầu tiên vào editor
          callback(results[0].link, { alt: file.name });
        }
      };

      input.click();
    }
  };

  const storeImg = useRef({
    siteA: {
      name: "SiteA",
      baseUrl: "https://canho-bconssolary.com/",
      img: [],
    },
    siteB: { name: "SiteB", baseUrl: "https://aquacityvn.com/", img: [] },
  });

  const uploadImageToMultipleWordPress = async (file: File) => {
    const uploadPromises = wpSites.map(async (site) => {
      const url = `${site.baseUrl}/wp-json/wp/v2/media`;
      const appPassword = site.appPassword.replace(/\s+/g, "");
      const formData = new FormData();
      formData.append("file", file, file.name);

      const auth = btoa(`${site.username}:${appPassword}`);

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed for ${site.name}`);
      const data = await res.json();
      if (site.name === "SiteA") {
        console.log("data", data);
        storeImg.current.siteA.img.push(data.source_url);
      } else if (site.name === "SiteB") {
        storeImg.current.siteB.img.push(data.source_url);
      }
      return { site: site.name, link: data.source_url };
    });
    const results = await Promise.all(uploadPromises);
    return results;
  };

  return (
    <div className="space-y-4">
      {showMetrics && (
        <PerformanceDisplay metrics={metrics} onClear={clearMetrics} />
      )}
      <div className="w-full border-[2px] max-w-4xl mx-auto bg-white">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 p-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề bài viết" {...field} />
                  </FormControl>
                  <FormDescription>Tiêu đề của bài viết</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Editor
                      apiKey="de7eylucb6hopyd8di8ruii0oabt5ylm78zmnnw9dgahz07g"
                      value={field.value}
                      onEditorChange={(newValue) => field.onChange(newValue)}
                      init={{
                        height: 400,
                        menubar: true,
                        plugins: [
                          "advlist",
                          "autolink",
                          "lists",
                          "link",
                          "image",
                          "charmap",
                          "preview",
                          "anchor",
                          "searchreplace",
                          "visualblocks",
                          "code",
                          "fullscreen",
                          "insertdatetime",
                          "media",
                          "table",
                          "paste",
                          "help",
                          "wordcount",
                        ],
                        toolbar:
                          "undo redo | formatselect | " +
                          "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                          "bullist numlist outdent indent | image media table | removeformat | help",
                        file_picker_callback: file_picker_callback,
                        images_upload_handler: async (blobInfo) => {
                          const file = blobInfo.blob();
                          const urls = await uploadImageToMultipleWordPress(
                            file
                          );
                          // chỉ hiển thị ảnh từ site đầu tiên
                          return urls[0].link;
                        },
                        automatic_uploads: true,
                        images_reuse_filename: false,
                        file_picker_types: "image",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (Tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link liên kết ngoài liên quan đến bài viết
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center space-x-2 pt-4 border-t">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMetrics(!showMetrics)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {showMetrics ? "Ẩn" : "Hiện"} thống kê
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setPreviewMode(false);
                  }}
                >
                  Hủy
                </Button>
                <Button disabled={uploading} type="submit">
                  {isEditing ? "Lưu thay đổi" : "Tạo bài viết"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PostForm;
