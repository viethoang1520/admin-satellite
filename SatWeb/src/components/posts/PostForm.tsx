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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import wpSites from "@/state/wpSite";
import useProgressStore from "@/store/progress";
import { CheckCircle, Loader2, UploadCloud } from "lucide-react";
import { PerformanceDisplay } from "@/components/ui/PerformanceDisplay";

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
  const [showMetrics, setShowMetrics] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addPost } = postStore();
  const { setProgress } = useProgressStore();
  const { measureAsync, clearMetrics, metrics } = usePerformanceMonitor();

  const storeImg = useRef({
    siteA: {
      name: "SiteA",
      baseUrl: "https://canho-bconssolary.com/",
      img: [],
    },
    siteB: { name: "SiteB", baseUrl: "https://aquacityvn.com/", img: [] },
  });

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
    const toastId = toast.info("🔄 Bắt đầu clone bài viết...", {
      autoClose: false,
    });

    setProgress({
      status: "in-progress",
      message: "Đang gửi yêu cầu tạo bài viết...",
      percent: 10,
    });

    // 🎨 Hàm giả lập từng giai đoạn chuyên nghiệp
    const fakeStep = async (message: string, percent: number, delay = 1000) => {
      let icon, color;
      if (percent < 40) {
        icon = <Loader2 className="animate-spin text-blue-500" />;
        color = "bg-blue-50";
      } else if (percent < 70) {
        icon = <UploadCloud className="text-amber-500 animate-pulse" />;
        color = "bg-amber-50";
      } else {
        icon = <CheckCircle className="text-green-500" />;
        color = "bg-green-50";
      }

      setProgress({ status: "in-progress", message, percent });
      toast.update(toastId, {
        render: (
          <div className={`flex items-center gap-3 ${color} p-2 rounded-md`}>
            {icon}
            <span className="font-medium text-gray-800">{message}</span>
            <span className="ml-auto font-semibold text-primary-600">
              {percent}%
            </span>
          </div>
        ),
        type: "info",
        autoClose: false,
      });

      await new Promise((res) => setTimeout(res, delay));
    };

    // ⚙️ Gọi từng bước
    await fakeStep("🧩 Đang xử lý nội dung bài viết...", 25);
    await fakeStep("🖼️ Đang tải ảnh và dữ liệu liên quan...", 45);
    await fakeStep("📡 Đang gửi yêu cầu đến máy chủ...", 65);

    navigate("/progress");
    setUploading(true);

    try {
      await measureAsync("Tạo bài viết mới", async () => {
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/post`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values, storeImg: storeImg.current }),
        });

        if (!response.ok) throw new Error("Yêu cầu thất bại");

        const { newPost, satelliteUrls } = await response.json();
        setProgress({
          status: "success",
          message: "🎉 Tạo bài viết thành công!",
          percent: 100,
          newPost,
          satelliteUrls,
        });

        addPost(newPost);
        onSubmit(newPost);
        toast.update(toastId, {
          render: "✅ Tạo bài viết thành công!",
          type: "success",
          autoClose: 2500,
        });
        return newPost;
      });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("❌ Tạo bài viết thất bại!", { autoClose: 3000 });
    } finally {
      setUploading(false);
    }
  };

  // Upload ảnh lên nhiều WordPress site
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

      if (site.name === "SiteA")
        storeImg.current.siteA.img.push(data.source_url);
      else if (site.name === "SiteB")
        storeImg.current.siteB.img.push(data.source_url);

      return { site: site.name, link: data.source_url };
    });
    return await Promise.all(uploadPromises);
  };

  // TinyMCE file picker
  const file_picker_callback = (callback, value, meta) => {
    if (meta.filetype === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async function () {
        const file = (this as HTMLInputElement).files?.[0];
        if (file) {
          const results = await uploadImageToMultipleWordPress(file);
          callback(results[0].link, { alt: file.name });
        }
      };
      input.click();
    }
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
                      onEditorChange={(v) => field.onChange(v)}
                      init={{
                        height: 600,
                        menubar: true,
                        width: "100%",
                        language: "vi",
                        language_url:
                          "https://cdn.tiny.cloud/1/de7eylucb6hopyd8di8ruii0oabt5ylm78zmnnw9dgahz07g/tinymce/8/langs/vi.js",
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
                          "help",
                          "wordcount",
                        ],
                        toolbar:
                          "undo redo | formatselect | bold italic underline | " +
                          "alignleft aligncenter alignright alignjustify | " +
                          "bullist numlist outdent indent | image media table | removeformat | help",
                        file_picker_callback: file_picker_callback,
                        images_upload_handler: async (blobInfo) => {
                          const file = blobInfo.blob();
                          const urls = await uploadImageToMultipleWordPress(
                            file
                          );
                          return urls[0].link;
                        },
                        automatic_uploads: true,
                        file_picker_types: "image",
                        image_advtab: true,
                        image_dimensions: true,
                        image_caption: true,
                        object_resizing: true,
                        paste_data_images: true,
                        draggable_modal: true,
                        contextmenu: "link image table",
                        content_style: `
                          body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; }
                          img { max-width: 100%; height: auto; cursor: move; }
                          figure.image { display: inline-block; margin: 0 auto; }
                        `,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                }}
              >
                Hủy
              </Button>
              <Button disabled={uploading} type="submit">
                {isEditing ? "💾 Lưu thay đổi" : "🚀 Tạo bài viết"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PostForm;
