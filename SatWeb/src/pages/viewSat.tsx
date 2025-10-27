import React, { useEffect, useState } from "react";
import { ExternalLink, Eye, EyeOff, Copy } from "lucide-react";
import useSatelliteStore from "@/store/satetillite";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/**
 * Expected site item shape:
 * {
 *   id: number|string,
 *   url: string,
 *   username: string,
 *   password: string,
 *   note?: string
 * }
 *
 * Props:
 * - sites: array of site items (optional; fallback to mock)
 */
const ViewSat = ({ sites: initialSites } = {}) => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { satellites, getSatellite } = useSatelliteStore();

  useEffect(() => {
    getSatellite();
  }, [getSatellite]);
  console.log("Satellites from store:", satellites);
  // fallback mock data (so file works standalone)
  const mockSites = satellites || [];

  const sites =
    Array.isArray(initialSites) && initialSites.length
      ? initialSites
      : mockSites;

  const toggleShowPasswords = () => setShowPasswords((v) => !v);

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const openSite = (url) => {
    // ensure url has protocol
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
          <div className="flex items-center gap-3">
            <button
              onClick={toggleShowPasswords}
              className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm bg-white hover:shadow-sm transition"
              title={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            </button>
          </div>
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
                <tr key={s.id ?? idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {idx + 1}
                  </td>

                  <td className="px-4 py-3 align-middle text-sm">
                    <div className="flex items-center gap-2">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[320px]"
                        onClick={(e) => {
                          // allow link but also prevent double-handling
                        }}
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

                  <td className="px-4 py-3 align-middle text-sm">
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

                  <td className="px-4 py-3 align-middle text-sm">
                    <div className="flex items-center gap-2">
                      <code className="block truncate max-w-[200px] bg-gray-100 px-2 py-1 rounded">
                        {showPasswords ? s.password : "•".repeat(8)}
                      </code>
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

                  <td className="px-4 py-3 align-middle text-sm text-gray-600">
                    <Button>
                      <Link to={`/viewSat/${s._id}`}>Xem chi tiết</Link>
                    </Button>
                  </td>

                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openSite(s.url)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md bg-white hover:shadow-sm transition"
                        title="Open site"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Mở
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

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
