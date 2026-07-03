import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Loader2, Crop as CropIcon, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// Helper function to extract a cropped image
function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        blob.name = fileName;
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      1,
    );
  });
}

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ProfileAvatar({
  profileData,
  user,
  account,
  loading,
  login,
  setProfileData,
}) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [copiedAccountId, setCopiedAccountId] = useState(false);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const [completedCrop, setCompletedCrop] = useState(null);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleCopyAccountId = async () => {
    if (account?.id) {
      await navigator.clipboard.writeText(account.id);
      setCopiedAccountId(true);
      setTimeout(() => setCopiedAccountId(false), 2000);
      toast.success("Account ID copied");
    }
  };

  const handleAvatarClick = () => {
    if (uploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(null); // Reset crop state
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);

      // Reset file input so the same file could be selected again if needed
      e.target.value = "";
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // Enforce 1:1 aspect ratio
  };

  const handleCropSave = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please select a valid crop area.");
      return;
    }

    try {
      setCropModalOpen(false); // Close modal first to indicate progress
      setUploadingAvatar(true);

      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        selectedFileName || "avatar.jpg",
      );

      const formData = new FormData();
      formData.append("avatar", croppedFile);

      // accountId goes in the query string because the backend's
      // requireSuperAdmin runs before multer parses the multipart body
      const response = await api.patch(
        `/users/update-avatar?accountId=${encodeURIComponent(account?.id ?? "")}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message || "Avatar updated successfully");

        const updatedData = response.data.data;
        setProfileData((prev) => ({
          ...prev,
          avatar: updatedData.avatar,
          avatarFileId: updatedData.avatarFileId,
        }));

        if (user && login) {
          login({ ...user, avatar: updatedData.avatar }, account);
        }
      }
    } catch (error) {
      console.error("Error cropping/uploading avatar:", error);
      toast.error("Failed to update avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      setImgSrc(""); // Cleanup memory
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center">
        {loading ? (
          <Skeleton className="mb-4 h-32 w-32 rounded-full" />
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onSelectFile}
            />
            <div
              className={`group relative mb-4 cursor-pointer rounded-full ${
                uploadingAvatar ? "pointer-events-none opacity-70" : ""
              }`}
              onClick={handleAvatarClick}
            >
              <Avatar className="border-background h-32 w-32 border-4 shadow-md transition-all">
                {(profileData?.avatar || user?.avatar) && (
                  <AvatarImage
                    src={profileData?.avatar || user?.avatar}
                    alt={profileData?.name || "User"}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                  {getInitials(profileData?.name || user?.name || "User")}
                </AvatarFallback>
              </Avatar>

              {!uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex flex-col items-center text-white">
                    <Upload className="mb-1 h-6 w-6" />
                    <span className="text-xs font-medium">Update</span>
                  </div>
                </div>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          </>
        )}

        <div className="relative w-full space-y-1">
          {loading ? (
            <>
              <Skeleton className="mx-auto mb-2 h-6 w-3/4" />
              <Skeleton className="mx-auto h-4 w-1/2" />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">
                {profileData?.name || user?.name}
              </h2>
              <p className="text-muted-foreground text-sm break-all">
                {profileData?.email || user?.email}
              </p>
              {account?.id && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-muted-foreground/70 text-xs break-all">
                    Account: {account.id}
                  </p>
                  <button
                    onClick={handleCopyAccountId}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-primary/10 transition-colors"
                    title="Copy account ID"
                  >
                    {copiedAccountId ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                </div>
              )}
              <div className="bg-primary/10 text-primary mt-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {account?.role?.replace("_", " ") || "USER"}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={cropModalOpen}
        onOpenChange={(open) => !open && setCropModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="text-primary h-5 w-5" />
              Crop Profile Picture
            </DialogTitle>
          </DialogHeader>

          <div className="flex w-full justify-center overflow-hidden rounded-md bg-black/5 py-4 dark:bg-white/5">
            {!!imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[60vh] object-contain"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setCropModalOpen(false);
                setImgSrc("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCropSave} className="gap-2">
              <CropIcon className="h-4 w-4" />
              Upload Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
