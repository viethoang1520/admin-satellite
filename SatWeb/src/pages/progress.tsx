import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import postStore from "@/store/postStore";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useProgressStore from "@/store/progress";
import { stripHtmlTags } from "@/lib/utils";
import useSatelliteStore from "@/store/satetillite";
import { get } from "http";

type SiteStatus = "pending" | "in-progress" | "success" | "failed";

interface Site {
  id: number;
  name: string;
  status: SiteStatus;
  updatedAt: Date;
  url: string;
  msg: string;
}

const ProgressPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SiteStatus | "all">("all");

  const posts = postStore((state) => state.posts);
  const addPost = postStore((state) => state.addPost);
  const getPost = postStore((state) => state.getPost);
  const getPostById = postStore((state) => state.getPostById);
  const { satelliteUrls } = useProgressStore();
  const { satellites } = useSatelliteStore();
  const location = useLocation();
  const post = location.state?.post;
  const newPost = location.state?.newPost;

  const realPost = useMemo(() => {
    return posts.find((p) => p._id === newPost?._id) || post;
  }, [posts, newPost, post, satellites]);

  const [realPostv2, setRealPostv2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getPost();
  }, [satellites]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!realPost._id) return;
      setLoading(true);
      const result = await getPostById(realPost._id);
      if (result) setRealPostv2(result);
      setLoading(false);
    };

    fetchPost();
  }, [realPost._id, getPostById]);

  useEffect(() => {
    if (realPostv2) {
      const rate = realPostv2.successfulRate || 0;
      setOverallProgress(Number((rate * 100).toFixed(1)));
    }
  }, [realPostv2]);

  useEffect(() => {
    if (!realPostv2) return;

    const postedList = realPostv2.postedSatellite || [];
    const errorList = realPostv2.errorSatellite || [];

    const allSites: Site[] = [
      ...postedList.map((url: string, i: number) => ({
        id: i + 1,
        name: `Satellite ${i + 1}`,
        status: "success" as SiteStatus,
        updatedAt: new Date(),
        url,
        msg: "",
      })),
      ...errorList.map((err: any, i: number) => ({
        id: postedList.length + i + 1,
        name: `Satellite ${postedList.length + i + 1}`,
        status: "failed" as SiteStatus,
        updatedAt: new Date(),
        url: err.url,
        msg: getErrorMessage(err.errorCode),
      })),
    ];

    setSites(allSites);
  }, [realPostv2, satelliteUrls]);

  const restartPublishing = async () => {
    toast.info("Đang làm mới dữ liệu...");
    await getPost();
  };

  const getErrorMessage = (code: number) => {
    switch (code) {
      case 400:
        return "Yêu cầu không hợp lệ.";
      case 401:
        return "Chưa xác thực.";
      case 403:
        return "Bị cấm truy cập.";
      case 404:
        return "Không tìm thấy trang web.";
      case 500:
        return "Lỗi máy chủ nội bộ.";
      default:
        return "Lỗi không xác định.";
    }
  };

  const filteredSites =
    activeFilter === "all"
      ? sites
      : sites.filter((site) => site.status === activeFilter);

  const StatusIcon = ({ status }: { status: SiteStatus }) => {
    const icons: Record<SiteStatus, JSX.Element> = {
      pending: <Clock className="h-5 w-5 text-gray-400" />,
      "in-progress": <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      failed: <XCircle className="h-5 w-5 text-red-500" />,
    };
    return icons[status];
  };

  const SitesList = ({ sites }: { sites: Site[] }) => (
    <div className="space-y-4">
      {sites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Đã xảy ra lỗi hoặc không có trang vệ tinh để hiển thị.
        </div>
      ) : (
        sites.map((site) => (
          <div
            key={site.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div className="flex items-center gap-3">
              <StatusIcon status={site.status} />
              <div>
                <h3 className="font-medium">{site.name}</h3>
                <p className="text-xs text-gray-500">
                  Cập nhật {site.updatedAt.toLocaleTimeString()}
                </p>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {site.url}
                </a>
                {site.msg && (
                  <p className="text-red-500 text-sm mt-1">{site.msg}</p>
                )}
              </div>
            </div>
            {site.status === "failed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.warn("Tính năng đăng lại đang phát triển")}
              >
                Đăng lại
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Publishing Progress
              </h1>
              <p className="text-gray-600">
                Track the publishing status of your posts across satellite sites
              </p>
            </div>
            <Button
              onClick={restartPublishing}
              variant="outline"
              className="flex items-center bg-black text-white gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          {/* Selected Post */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Post</CardTitle>
            </CardHeader>
            <CardContent>
              {realPost ? (
                <div className="flex flex-col space-y-2">
                  <h3 className="font-semibold text-lg">{realPost.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {realPost.content ? stripHtmlTags(realPost.content) : ""}
                  </p>
                  {realPost.link && (
                    <a
                      href={realPost.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {realPost.link}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No post selected</p>
              )}
            </CardContent>
          </Card>
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    {overallProgress
                      ? `${overallProgress}% Complete`
                      : "0% Complete"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {sites.filter((s) => s.status === "success").length} /{" "}
                    {sites.length} sites
                  </span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Satellite Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeFilter}
                onValueChange={(v) => setActiveFilter(v as SiteStatus | "all")}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({sites.length})</TabsTrigger>
                  <TabsTrigger value="success">
                    Success (
                    {sites.filter((s) => s.status === "success").length})
                  </TabsTrigger>
                  <TabsTrigger value="failed">
                    Failed ({sites.filter((s) => s.status === "failed").length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={activeFilter}>
                  <SitesList sites={filteredSites} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
