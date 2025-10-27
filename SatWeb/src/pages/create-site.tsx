import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../components/ui/form";
import { CustomFormField } from "../components/ui/FormField";
import { Button } from "../components/ui/button";
import * as z from "zod";
import { Globe, Lock, User } from "lucide-react";
import useSatelliteStore, { Satellite } from "@/store/satetillite";
import { useParams } from "react-router";

const settingsSchema = z.object({
  url: z.string().url("Invalid URL"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: SettingsFormData;
  onSubmit: (data: SettingsFormData) => Promise<void>;
}

const CreateSite = () => {
  const [editMode, setEditMode] = useState(false);
  const { getSatellite, satellites, loading, addNewSatellite } =
    useSatelliteStore();
  const { id } = useParams();
  useEffect(() => {
    getSatellite();
  }, [getSatellite]);
  const sat = satellites.find((s) => s._id === id);
  const initialData: SettingsFormData = {
    url: sat ? sat.url : "",
    username: sat ? sat.username : "",
    password: sat ? sat.password : "",
  };
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) form.reset(initialData);
  };

  const handleSubmit = async (data: SettingsFormData) => {
    await onSubmit(data);
    setEditMode(false);
  };
  const onSubmit = async (data: SettingsFormData) => {
    // Xử lý lưu dữ liệu ở đây
    await addNewSatellite(data as Satellite);
    console.log("Submitted data:", data);
  };
  return (
    <div className="mt-10 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary-600" />
          Thêm mới website vệ tinh
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Nhập thông tin cấu hình cho website vệ tinh cần thêm.
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-white/90 backdrop-blur-md border-2xl border-gray-200 shadow-xl hover:shadow-2xl rounded-2xl p-8 transition-all duration-300">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              <CustomFormField
                name="url"
                label="Website URL"
                placeholder="https://example.com"
                disabled={!editMode}
              />
              <CustomFormField
                name="username"
                label="Username"
                placeholder="admin_user"
                disabled={!editMode}
              />

              <CustomFormField
                name="password"
                label="Password"
                type="password"
                placeholder="*Vui lòng nhập Application password"
                disabled={!editMode}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex justify-end gap-4">
              <Button
                type="button"
                onClick={toggleEditMode}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {editMode ? "Hủy" : "Chỉnh sửa"}
              </Button>

              {editMode && (
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Lưu thay đổi
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateSite;
