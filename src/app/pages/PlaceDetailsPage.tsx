import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Phone, ExternalLink, Navigation, MessageCircle, Send, Edit2, X, Check } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useEthnicity } from '../context/EthnicityContext';
import { toast } from 'sonner';
import { type Place, type PlaceType } from '../../lib/supabasePlaces';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { formatDistanceToNow } from 'date-fns';

const ADMIN_EMAIL = 'alexisaemerzian@gmail.com';

const typeIcons: Record<PlaceType, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  church: '⛪',
  bakery: '🥐',
  shop: '🛍️',
  other: '📍',
};

const typeColors: Record<PlaceType, string> = {
  restaurant: 'border-orange-300 text-orange-700 bg-orange-50',
  cafe: 'border-amber-300 text-amber-700 bg-amber-50',
  church: 'border-purple-300 text-purple-700 bg-purple-50',
  bakery: 'border-pink-300 text-pink-700 bg-pink-50',
  shop: 'border-blue-300 text-blue-700 bg-blue-50',
  other: 'border-gray-300 text-gray-700 bg-gray-50',
};

interface Comment {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export function PlaceDetailsPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const { user } = useAuth();
  const { selectedEthnicity } = useEthnicity();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Load place details
  useEffect(() => {
    async function loadPlace() {
      if (!placeId || !selectedEthnicity) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${placeId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Failed to load place:', response.status, data);
          
          if (response.status === 403) {
            toast.error('This place is pending approval');
          } else if (response.status === 404) {
            toast.error('Place not found');
          } else {
            toast.error('Failed to load place details');
          }
          
          setIsLoading(false);
          return;
        }

        setPlace(data.place);
      } catch (error) {
        console.error('Error loading place:', error);
        toast.error('Failed to load place details');
      } finally {
        setIsLoading(false);
      }
    }

    loadPlace();
  }, [placeId, selectedEthnicity]);

  // Load comments
  useEffect(() => {
    async function loadComments() {
      if (!placeId) return;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${placeId}/comments`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Failed to load comments:', response.status, errorData);
          setComments([]);
          return;
        }

        const data = await response.json();
        console.log('✅ Loaded comments:', data.comments?.length || 0);
        
        // Filter out any null or malformed comments
        const validComments = (data.comments || []).filter(
          (c: any) => c && c.id && c.userName && c.comment && c.createdAt
        );
        setComments(validComments);
      } catch (error) {
        console.error('❌ Error loading comments:', error);
        setComments([]);
      }
    }

    loadComments();
  }, [placeId]);

  // Submit comment
  const handleSubmitComment = async () => {
    if (!user || !placeId || !commentText.trim()) {
      if (!user) {
        toast.error('Please sign in to comment');
      } else {
        toast.error('Please enter a comment');
      }
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${placeId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name,
            comment: commentText.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Update comment
  const handleUpdateComment = async () => {
    if (!user || !placeId || !editingCommentId || !editingCommentText.trim()) {
      if (!user) {
        toast.error('Please sign in to comment');
      } else {
        toast.error('Please enter a comment');
      }
      return;
    }

    setIsUpdatingComment(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${placeId}/comments/${editingCommentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name,
            comment: editingCommentText.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const data = await response.json();
      setComments(comments.map(c => c.id === editingCommentId ? data.comment : c));
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comment updated!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // Get directions
  const handleGetDirections = () => {
    if (!place) return;
    const query = encodeURIComponent(place.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-700 mb-2 text-lg font-semibold">Place Not Available</p>
          <p className="text-gray-500 mb-6 text-sm">This place may be pending approval or doesn't exist.</p>
          <Button onClick={() => navigate('/places')} className="bg-black hover:bg-gray-800">
            Back to Places
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/places')}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{place.name}</h1>
              <p className="text-gray-400 text-sm">{place.city}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Place Images (if any) */}
        {place.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Place Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold">{place.name}</h2>
            <Badge variant="outline" className={typeColors[place.type]}>
              {typeIcons[place.type]} {place.type}
            </Badge>
          </div>

          <p className="text-gray-700 mb-6">{place.description}</p>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-900">{place.address}</p>
              </div>
            </div>

            {/* Phone */}
            {place.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <a
                  href={`tel:${place.phone}`}
                  className="text-gray-900 hover:text-black font-medium"
                >
                  {place.phone}
                </a>
              </div>
            )}

            {/* Website */}
            {place.website && (
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Get Directions Button */}
          <Button
            onClick={handleGetDirections}
            className="w-full mt-6 bg-black hover:bg-gray-800"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Comments</h3>
            <span className="text-sm text-gray-500">({comments.length})</span>
          </div>

          {/* Comment Input */}
          {user ? (
            <div className="mb-6">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience..."
                className="mb-3"
                rows={3}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmittingComment}
                className="bg-black hover:bg-gray-800"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                <button
                  onClick={() => navigate('/login')}
                  className="text-black font-medium hover:underline"
                >
                  Sign in
                </button>{' '}
                to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.filter(comment => comment && comment.userName && comment.comment).map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-sm">{comment.userName}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                      {isAdmin && editingCommentId !== comment.id && (
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.comment);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit comment"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateComment}
                          disabled={!editingCommentText.trim() || isUpdatingComment}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          {isUpdatingComment ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingCommentText('');
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm">{comment.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm py-8">
              No comments yet. Be the first to share your experience!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}