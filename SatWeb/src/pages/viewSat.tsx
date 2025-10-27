import React, { useEffect, useState } from "react";
import { ExternalLink, Eye, EyeOff, Copy } from "lucide-react";
import useSatelliteStore from "@/store/satetillite";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ViewSat = ({ sites: initialSites } = {}) => {
  const [visiblePasswordId, setVisiblePasswordId] = useState<
    string | number | null
  >(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { satellites, getSatellite } = useSatelliteStore();

  useEffect(() => {
    getSatellite();
  }, [getSatellite]);

  const sites =
    Array.isArray(initialSites) && initialSites.length
      ? initialSites
      : satellites || [];

  // ✅ Toggle hiển thị mật khẩu của từng site (chỉ 1 cái mở)
  const togglePassword = (id: string | number) => {
    setVisiblePasswordId((prev) => (prev === id ? null : id));
  };

  // ✅ Copy text và hiển thị “Copied”
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // ✅ Mở site trong tab mới
  const openSite = (url: string) => {
    const fixed =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    window.open(fixed, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin site vệ tinh
          </h2>
        </div>

        <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Password
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Chỉnh sửa
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {sites.map((s, idx) => (
                <tr key={s.id ?? idx} className="hover:bg-gray-50 transition">
                  {/* STT */}
                  <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>

                  {/* URL */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[320px]"
                      >
                        {s.url}
                      </a>
                      <button
                        onClick={() => handleCopy(s.url, `url-${s.id}`)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    {copiedId === `url-${s.id}` && (
                      <div className="text-xs text-green-600">Copied</div>
                    )}
                  </td>

                  {/* Username */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[160px]">
                        {s.username}
                      </span>
                      <button
                        onClick={() => handleCopy(s.username, `user-${s.id}`)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        title="Copy username"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    {copiedId === `user-${s.id}` && (
                      <div className="text-xs text-green-600">Copied</div>
                    )}
                  </td>

                  {/* Password */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="block truncate max-w-[200px] bg-gray-100 px-2 py-1 rounded">
                        {visiblePasswordId === s.id
                          ? s.password
                          : "•".repeat(8)}
                      </code>
                      <button
                        onClick={() => togglePassword(s.id)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        title={
                          visiblePasswordId === s.id
                            ? "Ẩn mật khẩu"
                            : "Hiện mật khẩu"
                        }
                      >
                        {visiblePasswordId === s.id ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(s.password, `pass-${s.id}`)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        title="Copy password"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    {copiedId === `pass-${s.id}` && (
                      <div className="text-xs text-green-600">Copied</div>
                    )}
                  </td>

                  {/* Chỉnh sửa */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <Button asChild>
                      <Link to={`/viewSat/${s._id}`}>Xem chi tiết</Link>
                    </Button>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openSite(s.url)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md bg-white hover:shadow-sm transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mở
                    </button>
                  </td>
                </tr>
              ))}

              {/* Không có dữ liệu */}
              {sites.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Không có site vệ tinh
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewSat;
