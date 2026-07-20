"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { AddLocalFiles } from "./AddLocalFiles";
import { AddNotionFiles } from "./AddNotionFiles";
import { AddGoogleDriveFiles } from "./AddGoogleDriveFiles";
import { AddDropboxFiles } from "./AddDropboxFiles";
import { AddOneDriveFiles } from "./AddOneDriveFiles";
import { AddBoxFiles } from "./AddBoxFiles";
import { AddGithubFiles } from "./AddGithubFiles";
import { AddMegaCloudFiles } from "./AddMegaCloudFiles";
import { AddICloudFiles } from "./AddICloudFiles";
import { AddConfluenceFiles } from "./AddConfluenceFiles";
import { AddSharePointFiles } from "./AddSharePointFiles";
import { AddGitBookFiles } from "./AddGitBookFiles";

// Simple fallback components
const BoxIcon = () => (
  <img
    src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDA2MUQ1IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Qm94PC90aXRsZT48cGF0aCBkPSJNLjk1OSA1LjUyM2MtLjU0IDAtLjk1OS40Mi0uOTU5Ljg5OXY3LjU0OWE0LjU5IDQuNTkgMCAwMDQuNjEzIDQuNDk0IDQuNzE3IDQuNzE3IDAgMDA0LjEzNS0yLjQ1N2MuNzc5IDEuNDM4IDIuMzM3IDIuNDU3IDQuMDc0IDIuNDU3IDIuNTc3IDAgNC42NzQtMi4wMzcgNC42NzQtNC42MTMuMDYtMi40NTctMi4wMzctNC40OTUtNC42MTMtNC40OTUtMS43MzggMC0zLjI5NS45NTktNC4wNzQgMi4zOTctLjc4LTEuNDM4LTIuMzM4LTIuMzk3LTQuMTM1LTIuMzk3LTEuMDc5IDAtMi4wMzguMzYtMi44MTcuODk5VjYuNDIyYS45Mi45MiAwIDAwLS44OTgtLjg5OXpNMTcuNjAyIDkuMjZhLjk1Ljk1IDAgMDAtLjcwNC4xNThjLS4zNi4zLS40NzkuODk5LS4xOCAxLjMxOGwyLjM5NyAzLjExNi0yLjM5NiAzLjExNWMtLjMuNDItLjI0Ljk2LjE4IDEuMjYuNDE5LjMgMS4wMTYuMjk4IDEuMzE2LS4xMjJsMi4wMzktMi42MzYgMi4wOTYgMi42OTdjLjMuMzYuODk5LjQxOSAxLjMxOC4xMi4zNi0uMy40Mi0uODQuMTIxLTEuMjU5bC0yLjMzOC0zLjExNSAyLjMzOC0zLjA1N2MuMy0uNDE5LjI5OC0xLjAxOC0uMTIxLTEuMzE4LS40OC0uMy0xLjAxOS0uMjQtMS4zMTguMThsLTIuMDk2IDIuNTc2LTIuMDQtMi42OTVjLS4xNDktLjE4LS4zNzMtLjMtLjYxMi0uMzM4ek00LjYxMyAxMS4xNTRjMS41NTggMCAyLjgxNyAxLjI2IDIuODE3IDIuNzU4IDAgMS41NTgtMS4yNTkgMi43NTYtMi44MTcgMi43NTYtMS41NTggMC0yLjgxNi0xLjE5OC0yLjgxNi0yLjc1NiAwLTEuNDk4IDEuMjU4LTIuNzU4IDIuODE2LTIuNzU4em04LjI3IDBjMS41NTggMCAyLjgxNiAxLjI2IDIuODE2IDIuNzU4LS4wNiAxLjU1OC0xLjMxOCAyLjc1Ni0yLjgxNiAyLjc1Ni0xLjU1OCAwLTIuODE3LTEuMTk4LTIuODE3LTIuNzU2IDAtMS40OTggMS4yNTktMi43NTggMi44MTctMi43NThaIi8+PC9zdmc+"
    alt="Box"
    className="h-6 w-6 object-contain"
  />
);

const GithubIcon = () => (
  <img
    src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMTgxNzE3IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R2l0SHViPC90aXRsZT48cGF0aCBkPSJNMTIgLjI5N2MtNi42MyAwLTEyIDUuMzczLTEyIDEyIDAgNS4zMDMgMy40MzggOS44IDguMjA1IDExLjM4NS42LjExMy44Mi0uMjU4LjgyLS41NzcgMC0uMjg1LS4wMS0xLjA0LS4wMTUtMi4wNC0zLjMzOC43MjQtNC4wNDItMS42MS00LjA0Mi0xLjYxQzQuNDIyIDE4LjA3IDMuNjMzIDE3LjcgMy42MzMgMTcuN2MtMS4wODctLjc0NC4wODQtLjcyOS4wODQtLjcyOSAxLjIwNS4wODQgMS44MzggMS4yMzYgMS44MzggMS4yMzYgMS4wNyAxLjgzNSAyLjgwOSAxLjMwNSAzLjQ5NS45OTguMTA4LS43NzYuNDE3LTEuMzA1Ljc2LTEuNjA1LTIuNjY1LS4zLTUuNDY2LTEuMzMyLTUuNDY2LTUuOTMgMC0xLjMxLjQ2NS0yLjM4IDEuMjM1LTMuMjItLjEzNS0uMzAzLS41NC0xLjUyMy4xMDUtMy4xNzYgMCAwIDEuMDA1LS4zMjIgMy4zIDEuMjMuOTYtLjI2NyAxLjk4LS4zOTkgMy0uNDA1IDEuMDIuMDA2IDIuMDQuMTM4IDMgLjQwNSAyLjI4LTEuNTUyIDMuMjg1LTEuMjMgMy4yODUtMS4yMy42NDUgMS42NTMuMjQgMi44NzMuMTIgMy4xNzYuNzY1Ljg0IDEuMjMgMS45MSAxLjIzIDMuMjIgMCA0LjYxLTIuODA1IDUuNjI1LTUuNDc1IDUuOTIuNDIuMzYuODEgMS4wOTYuODEgMi4yMiAwIDEuNjA2LS4wMTUgMi44OTYtLjAxNSAzLjI4NiAwIC4zMTUuMjEuNjkuODI1LjU3QzIwLjU2NSAyMi4wOTIgMjQgMTcuNTkyIDI0IDEyLjI5N2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyIi8+PC9zdmc+"
    alt="GitHub"
    className="h-6 w-6 object-contain"
  />
);
//  for icons that might not be in lucide-react or need specific branding colors
const NotionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 object-contain" viewBox="0 0 256 268">
    <path fill="#FFF" d="M16.092 11.538L164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188"/>
    <path fill="#000" d="M164.09.608L16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608M69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921M212.377 89.53c1.034 4.681 0 9.362-4.681 9.897l-7.783 1.542v114.404c-6.758 3.637-12.981 5.715-18.18 5.715c-8.308 0-10.386-2.604-16.609-10.396l-50.898-80.079v77.476l16.1 3.646s0 9.362-12.989 9.362l-35.814 2.077c-1.043-2.086 0-7.284 3.63-8.318l9.351-2.595V109.823l-12.98-1.052c-1.044-4.68 1.55-11.439 8.826-11.965l38.426-2.585l52.958 81.113v-71.76l-13.498-1.552c-1.043-5.733 3.111-9.896 8.3-10.404z"/>
  </svg>
);

const DriveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 object-contain" viewBox="0 0 256 229">
    <path fill="#0066DA" d="m19.354 196.034l11.29 19.5c2.346 4.106 5.718 7.332 9.677 9.678q17.009-21.591 23.68-33.137q6.77-11.717 16.641-36.655q-26.604-3.502-40.32-3.502q-13.165 0-40.322 3.502c0 4.545 1.173 9.09 3.519 13.196z"/>
    <path fill="#EA4335" d="M215.681 225.212c3.96-2.346 7.332-5.572 9.677-9.677l4.692-8.064l22.434-38.855a26.57 26.57 0 0 0 3.518-13.196q-27.315-3.502-40.247-3.502q-13.899 0-40.248 3.502q9.754 25.075 16.422 36.655q6.724 11.683 23.752 33.137"/>
    <path fill="#00832D" d="M128.001 73.311q19.68-23.768 27.125-36.655q5.996-10.377 13.196-33.137C164.363 1.173 159.818 0 155.126 0h-54.25C96.184 0 91.64 1.32 87.68 3.519q9.16 26.103 15.544 37.154q7.056 12.213 24.777 32.638"/>
    <path fill="#2684FC" d="M175.36 155.42H80.642l-40.32 69.792c3.958 2.346 8.503 3.519 13.195 3.519h148.968c4.692 0 9.238-1.32 13.196-3.52z"/>
    <path fill="#00AC47" d="M128.001 73.311L87.681 3.52c-3.96 2.346-7.332 5.571-9.678 9.677L3.519 142.224A26.57 26.57 0 0 0 0 155.42h80.642z"/>
    <path fill="#FFBA00" d="m215.242 77.71l-37.243-64.514c-2.345-4.106-5.718-7.331-9.677-9.677l-40.32 69.792l47.358 82.109h80.496c0-4.546-1.173-9.09-3.519-13.196z"/>
  </svg>
);

const DropboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 object-contain" viewBox="0 0 256 218">
    <path fill="#0061FF" d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192 0l-64 40.775l64 40.775l64.001-40.775zM0 122.321l63.995 40.772L128 122.321L63.995 81.55zM192 81.55l-64 40.775l64 40.774l64-40.774zM64 176.771l64.005 40.772L192 176.771L128.005 136z"/>
  </svg>
);

const MegaIcon = () => (
  <svg className="h-6 w-6 object-contain" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.18L20.18 7v10L12 21.82 3.82 17V7L12 2.18z" fill="#D9272E" />
    <path d="M12 5.5L6 9v6l6 3.5L18 15V9l-6-3.5zm0 1.73L16.18 10v4L12 16.77 7.82 14v-4L12 7.23z" fill="#D9272E" />
  </svg>
);

const ICloudIcon = () => (
  <svg className="h-6 w-6 object-contain" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
      fill="#3B82F6"
    />
  </svg>
);

const OneDriveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 object-contain" viewBox="0 0 256 165">
    <path fill="#0364B8" d="m154.66 110.682l52.842-50.534c-10.976-42.8-54.57-68.597-97.37-57.62a80 80 0 0 0-46.952 33.51c.817-.02 91.48 74.644 91.48 74.644"/>
    <path fill="#0078D4" d="m97.618 45.552l-.002.009a63.7 63.7 0 0 0-33.619-9.543c-.274 0-.544.017-.818.02C27.852 36.476-.432 65.47.005 100.798a63.97 63.97 0 0 0 11.493 35.798l79.165-9.915l60.694-48.94z"/>
    <path fill="#1490DF" d="M207.502 60.148a53 53 0 0 0-3.51-.131a51.8 51.8 0 0 0-20.61 4.254l-.002-.005l-32.022 13.475l35.302 43.607l63.11 15.341c13.62-25.283 4.164-56.82-21.12-70.44a52 52 0 0 0-21.148-6.1"/>
    <path fill="#28A8EA" d="M11.498 136.596a63.91 63.91 0 0 0 52.5 27.417h139.994a51.99 51.99 0 0 0 45.778-27.323l-98.413-58.95z"/>
  </svg>
);

const ConfluenceIcon = () => (
  <svg className="h-6 w-6 object-contain" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.04 18.32c-.18.3-.16.68.12.9l3.58 2.72c.16.12.36.18.56.18.22 0 .44-.08.6-.24 0 0 4.42-5.34 9.3-5.34 1.92 0 3.14.62 3.14.62.32.16.7.08.94-.18l2.52-3.2c.2-.26.22-.62.04-.9C22.58 12.46 19.58 10 15.6 10 10.06 10 4.08 15 2.04 18.32zM21.96 5.68c.18-.3.16-.68-.12-.9L18.26 2.06c-.16-.12-.36-.18-.56-.18-.22 0-.44.08-.6.24 0 0-4.42 5.34-9.3 5.34-1.92 0-3.14-.62-3.14-.62-.32-.16-.7-.08-.94.18L1.2 10.22c-.2.26-.22.62-.04.9C1.42 11.54 4.42 14 8.4 14c5.54 0 11.52-5 13.56-8.32z" fill="#0052CC"/>
  </svg>
);

const SharePointIcon = () => (
  <svg className="h-6 w-6 object-contain" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="156" cy="88" r="68" fill="#036C70"/>
    <circle cx="116" cy="160" r="56" fill="#1A9BA1"/>
    <circle cx="176" cy="176" r="48" fill="#37C6D0"/>
    <rect x="80" y="56" width="40" height="144" rx="4" fill="#035B5F" opacity="0.15"/>
    <path d="M100 80h-8c-6.6 0-12 5.4-12 12v72c0 6.6 5.4 12 12 12h8V80z" fill="#038387" opacity="0.3"/>
  </svg>
);

const GitBookIcon = () => (
  <svg className="h-6 w-6 object-contain" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.513 1.097c-.645 0-1.233.34-2.407 1.017L3.675 5.82A7.233 7.233 0 0 0 0 12.063v.236a7.233 7.233 0 0 0 3.667 6.238L7.69 20.86c2.354 1.36 3.531 2.042 4.824 2.042 1.292.001 2.47-.678 4.825-2.038l4.251-2.453c1.177-.68 1.764-1.02 2.087-1.579.323-.56.324-1.24.323-2.6v-2.63a1.04 1.04 0 0 0-1.558-.903l-8.728 5.024c-.587.337-.88.507-1.201.507-.323 0-.616-.168-1.204-.506l-5.904-3.393c-.297-.171-.446-.256-.565-.271a.603.603 0 0 0-.634.368c-.045.111-.045.282-.043.625.002.252 0 .378.025.494.053.259.189.493.387.667.089.077.198.14.416.266l6.315 3.65c.589.34.884.51 1.207.51.324 0 .617-.17 1.206-.509l7.74-4.469c.202-.116.302-.172.377-.13.075.044.075.16.075.392v1.193c0 .34.001.51-.08.649-.08.14-.227.224-.522.394l-6.382 3.685c-1.178.68-1.767 1.02-2.413 1.02-.646 0-1.236-.34-2.412-1.022l-5.97-3.452-.043-.025a4.106 4.106 0 0 1-2.031-3.52V11.7c0-.801.427-1.541 1.12-1.944a1.979 1.979 0 0 1 1.982-.001l4.946 2.858c1.174.679 1.762 1.019 2.407 1.02.645 0 1.233-.34 2.41-1.017l7.482-4.306a1.091 1.091 0 0 0 0-1.891L14.92 2.11c-1.175-.675-1.762-1.013-2.406-1.013Z" fill="#343434" />
  </svg>
);

export function AddFilesModal({ isOpen, onClose }) {
  const [activeView, setActiveView] = useState("menu");

  const handleOpenChange = (open) => {
    if (!open) {
      setTimeout(() => setActiveView("menu"), 300); // Reset after closing animation
    }
    onClose(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-5xl flex-col overflow-hidden p-0 sm:max-w-5xl">
        {activeView === "menu" ? (
          <ScrollArea className="h-[85vh]">
            <div className="p-6 sm:p-8">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-slate-800">
                Add Files
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-slate-500">
                Add files from multiple sources.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <p className="text-[14px] font-semibold text-slate-800">
                Choose a type to add files:
              </p>

              <div data-tour="website-files-source-options">
              <HoverEffect
                items={[
                  { title: "Local Files", description: "Upload files from your system", icon: <FileText strokeWidth={2.5} className="h-6 w-6 text-blue-500" />, onClick: () => setActiveView("local") },
                  { title: "Notion", description: "Import files from Notion", icon: <NotionIcon />, onClick: () => setActiveView("notion") },
                  { title: "Google Drive", description: "Import files from Google Drive", icon: <DriveIcon />, onClick: () => setActiveView("drive") },
                  { title: "Dropbox", description: "Import files from Dropbox", icon: <DropboxIcon />, onClick: () => setActiveView("dropbox") },
                  { title: "OneDrive", description: "Import files from OneDrive", icon: <OneDriveIcon />, onClick: () => setActiveView("onedrive") },
                  { title: "Box", description: "Import files from Box", icon: <BoxIcon />, onClick: () => setActiveView("box") },
                  { title: "GitHub", description: "Import files from GitHub", icon: <GithubIcon />, onClick: () => setActiveView("github") },
                  { title: "MEGA", description: "Import files from MEGA", icon: <MegaIcon />, onClick: () => setActiveView("mega") },
                  { title: "Confluence", description: "Import pages from Confluence", icon: <ConfluenceIcon />, onClick: () => setActiveView("confluence") },
                  { title: "SharePoint", description: "Import files from SharePoint (requires Microsoft 365 work/school account)", icon: <SharePointIcon />, onClick: () => setActiveView("sharepoint"), tooltip: "Only document files (.pdf, .txt, .csv, .docx) from SharePoint Document Libraries are supported. SharePoint Pages are not files and won't appear here — upload files to a Document Library via the SharePoint web UI." },
                  { title: "GitBook", description: "Import pages from GitBook", icon: <GitBookIcon />, onClick: () => setActiveView("gitbook") },
                  { title: "iCloud Drive", description: "Import files from iCloud", icon: <ICloudIcon />, disabled: true, badge: "Coming Soon" },
                ]}
                className="py-4"
              />
              </div>
            </div>
          </div>
          </ScrollArea>
        ) : activeView === "local" ? (
          <div className="flex-1 overflow-hidden">
            <AddLocalFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "notion" ? (
          <div className="flex-1 overflow-hidden">
            <AddNotionFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "drive" ? (
          <div className="flex-1 overflow-hidden">
            <AddGoogleDriveFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "dropbox" ? (
          <div className="flex-1 overflow-hidden">
            <AddDropboxFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "onedrive" ? (
          <div className="flex-1 overflow-hidden">
            <AddOneDriveFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "box" ? (
          <div className="flex-1 overflow-hidden">
            <AddBoxFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "github" ? (
          <div className="flex-1 overflow-hidden">
            <AddGithubFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "mega" ? (
          <div className="flex-1 overflow-hidden">
            <AddMegaCloudFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "confluence" ? (
          <div className="flex-1 overflow-hidden">
            <AddConfluenceFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "sharepoint" ? (
          <div className="flex-1 overflow-hidden">
            <AddSharePointFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "gitbook" ? (
          <div className="flex-1 overflow-hidden">
            <AddGitBookFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : activeView === "icloud" ? (
          <div className="flex-1 overflow-hidden">
            <AddICloudFiles onBack={() => setActiveView("menu")} onAdd={() => setActiveView("menu")} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
