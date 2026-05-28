import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Move, X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState(600);

  // Set canvas size based on screen size
  useEffect(() => {
    const updateCanvasSize = () => {
      const size = Math.min(600, window.innerWidth - 32, window.innerHeight - 200);
      setCanvasSize(size);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Load image and recenter when canvas size changes
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Center the image initially
      if (canvasSize) {
        const imgAspect = img.width / img.height;
        const canvasAspect = 1; // Square canvas

        let displayWidth, displayHeight;
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          displayWidth = canvasSize;
          displayHeight = canvasSize / imgAspect;
        } else {
          // Image is taller than canvas
          displayHeight = canvasSize;
          displayWidth = canvasSize * imgAspect;
        }

        setPosition({
          x: (canvasSize - displayWidth) / 2,
          y: (canvasSize - displayHeight) / 2,
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl, canvasSize]);

  // Draw image on canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate display size
    const imgAspect = image.width / image.height;
    const canvasAspect = canvas.width / canvas.height;

    let displayWidth, displayHeight;
    if (imgAspect > canvasAspect) {
      displayWidth = canvas.width * scale;
      displayHeight = (canvas.width / imgAspect) * scale;
    } else {
      displayHeight = canvas.height * scale;
      displayWidth = (canvas.height * imgAspect) * scale;
    }

    // Draw image
    ctx.drawImage(image, position.x, position.y, displayWidth, displayHeight);

    // Draw overlay (darkened area outside the crop box)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    const cropSize = Math.min(canvas.width, canvas.height) * 0.9;
    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;
    ctx.fillRect(cropX, cropY, cropSize, cropSize);

    // Draw crop box border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);
  }, [image, scale, position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleCrop = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropSize = Math.min(canvas.width, canvas.height) * 0.9;
    cropCanvas.width = 800; // Output size
    cropCanvas.height = 800;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Calculate what portion of the original image is in the crop box
    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;

    // Calculate display size
    const imgAspect = image.width / image.height;
    const canvasAspect = canvas.width / canvas.height;

    let displayWidth, displayHeight;
    if (imgAspect > canvasAspect) {
      displayWidth = canvas.width * scale;
      displayHeight = (canvas.width / imgAspect) * scale;
    } else {
      displayHeight = canvas.height * scale;
      displayWidth = (canvas.height * imgAspect) * scale;
    }

    // Calculate source coordinates
    const scaleX = image.width / displayWidth;
    const scaleY = image.height / displayHeight;

    const sourceX = (cropX - position.x) * scaleX;
    const sourceY = (cropY - position.y) * scaleY;
    const sourceWidth = cropSize * scaleX;
    const sourceHeight = cropSize * scaleY;

    // Draw cropped image
    cropCtx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      800,
      800
    );

    // Convert to blob and create file
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-event-image.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Adjust Image</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="cursor-move touch-none max-w-full"
            style={{ width: canvasSize, height: canvasSize }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <Move className="w-4 h-4" />
            Drag to reposition
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black text-white p-4 space-y-4">
        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm min-w-20 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            className="flex-1 bg-white text-black hover:bg-gray-200"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
