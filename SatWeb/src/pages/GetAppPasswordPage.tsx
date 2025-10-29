import React, { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const GetAppPasswordPage: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const curlExample = `curl -X POST "https://your-site.com/wp-json/wp/v2/media" \\
  -H "Authorization: Basic $(echo -n 'username:application_password' | base64)" \\
  -F "file=@/path/to/file.jpg"`;

  const fetchExample = `await fetch("https://your-site.com/wp-json/wp/v2/media", {
  method: "POST",
  headers: {
    "Authorization": "Basic " + btoa("username:application_password")
  },
  body: formData
});`;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">
          Hướng dẫn lấy{" "}
          <span className="text-primary-600">Application Password</span> trên
          WordPress
        </h1>

        <section className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">
            1. Application Password là gì?
          </h2>
          <p className="text-sm text-gray-700">
            Application Password là mật khẩu dùng tạm thời để ứng dụng bên ngoài
            (ví dụ script, tool hoặc ứng dụng của bạn) truy cập REST API của
            WordPress mà không cần chia sẻ mật khẩu chính. Sau khi tạo,
            WordPress sẽ hiển thị mật khẩu một lần duy nhất — bạn phải{" "}
            <strong>sao chép ngay</strong> và lưu trữ an toàn.
          </p>
        </section>

        <section className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">
            2. Các bước tạo Application Password
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>
              Đăng nhập vào trang quản trị WordPress với tài khoản có quyền (ví
              dụ Administrator).
            </li>
            <li>
              Vào <strong>Users &gt; Profile</strong> (hoặc{" "}
              <strong>Users &gt; Your Profile</strong>).
            </li>
            <li>
              Kéo xuống phần <strong>Application Passwords</strong>.
            </li>
            <li>
              Nhập tên mô tả (ví dụ: <em>Admin API for uploader</em>) rồi bấm{" "}
              <strong>Add New Application Password</strong>.
            </li>
            <li>
              WordPress sẽ hiển thị một mật khẩu gồm 24 ký tự (thường có dấu
              cách). <strong>Copy</strong> mật khẩu này ngay — bạn sẽ không thấy
              lại toàn bộ sau khi đóng.
            </li>
            <li>
              Lưu mật khẩu ở nơi an toàn (password manager) hoặc dán vào cấu
              hình server của bạn.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default GetAppPasswordPage;
