import { useState, useRef, useEffect } from "react";
import { uploadMediaToCloudinary } from "../../services/mediaService.js";

/**
 * Custom hook for handling media-related functionality
 * @param {Array} posts - The current posts array
 * @returns {Object} Media-related state and functions
 */
export const useMediaHandling = (posts) => {
  // Media handling state
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Open media viewer and set current index
  const openMediaViewer = (url, isVideo, index) => {
    setSelectedMedia({ url, isVideo });
    setCurrentMediaIndex(index);
  };

  // Handle media file selection
  const handleFileSelect = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  // Reset media state
  const resetMediaState = () => {
    setMediaFiles([]);
  };

  // Upload media files to storage
  const uploadMediaFiles = async () => {
    if (!mediaFiles.length) return [];

    const mediaUploads = await Promise.all(
      mediaFiles.map(async (file) => {
        const uploadResult = await uploadMediaToCloudinary(file);
        if (!uploadResult.success) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        return uploadResult.url;
      })
    );

    return mediaUploads;
  };

  // Add keyboard navigation for media viewer
  useEffect(() => {
    const handleKeyNavigation = (e) => {
      if (!selectedMedia) return;

      // Find the post with the currently viewed media
      const currentPost = posts.find(
        (post) => post.mediaUrls && post.mediaUrls.includes(selectedMedia.url)
      );

      if (!currentPost || !currentPost.mediaUrls.length) return;

      if (e.key === "ArrowRight") {
        // Navigate to next media
        const nextIndex =
          (currentMediaIndex + 1) % currentPost.mediaUrls.length;
        const nextUrl = currentPost.mediaUrls[nextIndex];
        setSelectedMedia({
          url: nextUrl,
          isVideo: nextUrl.includes("video"),
        });
        setCurrentMediaIndex(nextIndex);
      } else if (e.key === "ArrowLeft") {
        // Navigate to previous media
        const prevIndex =
          (currentMediaIndex - 1 + currentPost.mediaUrls.length) %
          currentPost.mediaUrls.length;
        const prevUrl = currentPost.mediaUrls[prevIndex];
        setSelectedMedia({
          url: prevUrl,
          isVideo: prevUrl.includes("video"),
        });
        setCurrentMediaIndex(prevIndex);
      }
    };

    document.addEventListener("keydown", handleKeyNavigation);

    return () => {
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [selectedMedia, currentMediaIndex, posts]);

  // Close media viewer on escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && selectedMedia) {
        setSelectedMedia(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [selectedMedia]);

  // Render media grid for a post
  const renderMedia = (mediaUrls) => {
    if (!mediaUrls?.length) return null;

    // Determine the layout class based on media count
    const getLayoutClass = () => {
      switch (mediaUrls.length) {
        case 1:
          return "grid-cols-1";
        case 2:
          return "grid-cols-2";
        case 3:
          return "grid-cols-2"; // First image takes full width
        case 4:
          return "grid-cols-2";
        default:
          return "grid-cols-3";
      }
    };

    // Function to render each media item
    const renderMediaItem = (url, index, totalCount) => {
      const isVideo = url.includes("video");

      // Use fixed height for all media items
      const fixedHeight = "h-64"; // or any other Tailwind height class

      // Special class for first item when there are 3 items
      const specialFirstItemClass =
        totalCount === 3 && index === 0 ? "col-span-2" : "";

      return (
        <div
          key={index}
          className={`relative overflow-hidden ${specialFirstItemClass} ${fixedHeight}`}
        >
          {isVideo ? (
            <div
              className="cursor-pointer h-full w-full"
              onClick={() => openMediaViewer(url, isVideo, index)}
            >
              <video
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
              >
                <source src={url} type="video/mp4" />
                Your browser does not support videos.
              </video>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white opacity-80"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <img
              src={url}
              alt="Post content"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openMediaViewer(url, isVideo, index)}
            />
          )}
        </div>
      );
    };

    return (
      <div className="mt-3">
        <div
          className={`grid ${getLayoutClass()} gap-1 rounded-lg overflow-hidden`}
        >
          {mediaUrls
            .slice(0, 5)
            .map((url, index) => renderMediaItem(url, index, mediaUrls.length))}

          {/* If there are more than 5 media items, show a +X overlay on the last visible one */}
          {mediaUrls.length > 5 && (
            <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white font-semibold px-2 py-1 rounded-tl-lg">
              +{mediaUrls.length - 5}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Media Viewer Modal Component
  const MediaViewerModal = () => {
    if (!selectedMedia) return null;

    // Find the post with this media to enable navigation
    const currentPost = posts.find(
      (post) => post.mediaUrls && post.mediaUrls.includes(selectedMedia.url)
    );
    const hasMultipleMedia = currentPost && currentPost.mediaUrls.length > 1;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
        onClick={() => setSelectedMedia(null)}
      >
        <div className="relative max-w-4xl max-h-screen p-2">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
            onClick={() => setSelectedMedia(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Left navigation arrow */}
          {hasMultipleMedia && (
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                const prevIndex =
                  (currentMediaIndex - 1 + currentPost.mediaUrls.length) %
                  currentPost.mediaUrls.length;
                const prevUrl = currentPost.mediaUrls[prevIndex];
                setSelectedMedia({
                  url: prevUrl,
                  isVideo: prevUrl.includes("video"),
                });
                setCurrentMediaIndex(prevIndex);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Media content */}
          {selectedMedia.isVideo ? (
            <video className="max-w-full max-h-[90vh]" controls autoPlay>
              <source src={selectedMedia.url} type="video/mp4" />
              Your browser does not support videos.
            </video>
          ) : (
            <img
              src={selectedMedia.url}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
          )}

          {/* Right navigation arrow */}
          {hasMultipleMedia && (
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                const nextIndex =
                  (currentMediaIndex + 1) % currentPost.mediaUrls.length;
                const nextUrl = currentPost.mediaUrls[nextIndex];
                setSelectedMedia({
                  url: nextUrl,
                  isVideo: nextUrl.includes("video"),
                });
                setCurrentMediaIndex(nextIndex);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Media counter */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
              {currentMediaIndex + 1} / {currentPost.mediaUrls.length}
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    mediaFiles,
    selectedMedia,
    fileInputRef,
    MediaViewerModal,
    openMediaViewer,
    handleFileSelect,
    resetMediaState,
    uploadMediaFiles,
    renderMedia,
  };
};