import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import postStore from "@/store/postStore";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import urlsWp from "@/state/sites";

type SiteStatus = "pending" | "in-progress" | "success" | "failed";

interface Site {
  id: number;
  name: string;
  status: SiteStatus;
  updatedAt: Date;
  url: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  link: string;
  urls: string[];
}

const ProgressPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  //const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SiteStatus | "all">("all");
  const posts = postStore((state) => state.posts);
  const getPost = postStore((state) => state.getPost);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { post, title } = location.state || {};
  const urls = urlsWp || [];
  // lấy getProgress
  const getProgress = postStore((state) => state.getProgress);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchProgress = async () => {
      const progress = await getProgress(post.title);
      setOverallProgress(progress ? progress * 100 : 0);
    };

    fetchProgress();

    interval = setInterval(fetchProgress, 5000);

    return () => clearInterval(interval);
  }, [post.title]);

  useEffect(() => {
    getPost();
  }, []);

  const handleParseUrl = (urls: string[]) => {
    const baseUrls = urls.map((url) => {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}`;
    });
    return baseUrls;
  };

  useEffect(() => {
    const urlsList = [
      `https://canho-bconssolary.com`,
      `https://aquacityvn.com`,
    ];
    const baseUrls = handleParseUrl(urls);
    console.log("post.urls", baseUrls[0]);
    const mockSites: Site[] = Array.from({ length: urls.length }, (_, i) => ({
      id: i + 1,
      name: `Satellite Site ${i + 1}`,
      status: urlsList.includes(baseUrls[i])
        ? ("success" as SiteStatus)
        : ("pending" as SiteStatus),
      updatedAt: new Date(),
      url: urls[i],
    }));

    setSites(mockSites);
    console.log("mockSites", mockSites);
  }, []);

  // Reset all sites to pending and restart the process
  const restartPublishing = () => {
    window.location.reload();
  };

  // Filter sites based on status
  const filteredSites =
    activeFilter === "all"
      ? sites
      : sites.filter((site) => site.status === activeFilter);

  // Status icon component
  const StatusIcon = ({ status }: { status: SiteStatus }) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
      case "in-progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const SitesList = ({ sites }: { sites: Site[] }) => (
    <div className="space-y-4">
      {sites.map((site) => (
        <div
          key={site.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div className="flex items-center gap-3">
            <StatusIcon status={site.status} />
            <div>
              <h3 className="font-medium">{site.name}</h3>
              <p className="text-xs text-gray-500">
                Updated {site.updatedAt.toLocaleTimeString()}
              </p>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {site.url}
              </a>
            </div>
          </div>
        </div>
      ))}

      {sites.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sites match the selected filter
        </div>
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
              Restart Publishing
            </Button>
          </div>

          {/* Post Selection */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Selected Post</CardTitle>
            </CardHeader>
            <CardContent>
              {post || title ? (
                <div className="flex flex-col space-y-2">
                  <h3 className="font-semibold text-lg">
                    {post.title || title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {post.content ? post.content : ""}
                  </p>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {post.link}
                  </a>
                </div>
              ) : (
                <p className="text-gray-500">No post selected</p>
              )}
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    {overallProgress}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    {sites.filter((site) => site.status === "success").length}{" "}
                    of {sites.length} sites
                  </span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Site Status List */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Satellite Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeFilter}
                onValueChange={(value) =>
                  setActiveFilter(value as SiteStatus | "all")
                }
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({sites.length})</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending (
                    {sites.filter((s) => s.status === "pending").length})
                  </TabsTrigger>
                  <TabsTrigger value="in-progress">
                    In Progress (
                    {sites.filter((s) => s.status === "in-progress").length})
                  </TabsTrigger>
                  <TabsTrigger value="success">
                    Success (
                    {sites.filter((s) => s.status === "success").length})
                  </TabsTrigger>
                  <TabsTrigger value="failed">
                    Failed ({sites.filter((s) => s.status === "failed").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <SitesList sites={filteredSites} />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <SitesList sites={filteredSites} />
                </TabsContent>
                <TabsContent value="in-progress" className="mt-0">
                  <SitesList sites={filteredSites} />
                </TabsContent>
                <TabsContent value="success" className="mt-0">
                  <SitesList sites={filteredSites} />
                </TabsContent>
                <TabsContent value="failed" className="mt-0">
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
