import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Slider } from '../components/ui/slider';
import { ArrowLeft, Camera, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfile } from '../../lib/supabaseAuth';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import type { Area } from 'react-easy-crop';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, userId, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  
  // Image cropping state
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });
  
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No 2d context');
    }
    
    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    
    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.9);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Read the file and show crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setShowCropDialog(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };
  
  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !userId) return;
    
    setIsUploadingAvatar(true);
    
    try {
      // Get cropped image as base64
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Upload to server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/upload-avatar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            imageData: croppedImage,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      const { avatarUrl: newAvatarUrl } = await response.json();
      setAvatarUrl(newAvatarUrl);
      setShowCropDialog(false);
      setImageSrc(null);
      toast.success('Avatar uploaded successfully!');
      await refreshUser();
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('User not found');
      return;
    }
    
    console.log('🔄 Updating profile...');
    console.log('User ID:', userId);
    console.log('Updates:', { name, city, bio, phone });
    
    setIsLoading(true);
    
    try {
      const { success, error } = await updateUserProfile(userId, {
        name,
        city,
        bio,
        phone,
      });
      
      console.log('Update result:', { success, error });
      
      if (error) {
        console.error('❌ Update failed:', error);
        toast.error(error);
        return;
      }
      
      if (success) {
        toast.success('Profile updated successfully!');
        console.log('✅ Profile updated, refreshing user data...');
        await refreshUser(); // Refresh user data in context
        console.log('✅ User data refreshed');
        navigate('/profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Edit Profile</h1>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-gray-100">
                  <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                  <AvatarFallback>{name[0] || 'U'}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploadingAvatar}
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
              <p className="text-sm text-gray-500 text-center">
                {avatarUrl ? 'Click camera icon to change your photo' : 'Your avatar is automatically generated from your name'}
              </p>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Los Angeles, CA"
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                className="mt-1.5"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Share your interests, what you love about the community, etc.
              </p>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-1.5"
              />
            </div>
          </div>
          
          {/* Contact Info (Read-only) */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold mb-3">Email Address</h3>
            <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
            <p className="text-xs text-gray-500">
              To change your email, please contact support
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/profile')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Your Profile Photo</DialogTitle>
            <DialogDescription>
              Drag to reposition and use the slider to zoom in/out
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Cropper Area */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>
            
            {/* Zoom Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ZoomOut className="w-4 h-4" />
                  Zoom
                </span>
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([value]) => setZoom(value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 text-center">
                Drag the image to reposition • Pinch or scroll to zoom
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCropDialog(false);
                setImageSrc(null);
              }}
              disabled={isUploadingAvatar}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-black hover:bg-gray-800"
              onClick={handleCropSave}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Save Photo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}