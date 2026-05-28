import { X, Check, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { EventRSVP } from '../types';

interface AttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: EventRSVP[];
  hostId: string;
  hostName: string;
  hostAvatar: string;
  eventTitle: string;
  currentUserId?: string; // To check if current user is the host
  onUserClick?: (userId: string) => void;
  onApprove?: (userId: string) => void;
  onDecline?: (userId: string) => void;
}

export function AttendeesModal({
  isOpen,
  onClose,
  attendees,
  hostId,
  hostName,
  hostAvatar,
  eventTitle,
  currentUserId,
  onUserClick,
  onApprove,
  onDecline,
}: AttendeesModalProps) {
  if (!isOpen) return null;

  const isHost = currentUserId === hostId;
  
  // Filter attendees by status
  const pendingAttendees = attendees.filter(a => a.status === 'pending');
  const acceptedAttendees = attendees.filter(a => a.status === 'accepted');
  const totalAttendees = acceptedAttendees.length + 1; // +1 for host

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold">People Attending</h2>
            <p className="text-sm text-gray-600">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attendees List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Pending Requests Section (Host Only) */}
          {isHost && pendingAttendees.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-orange-900">Pending Approval</p>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                  {pendingAttendees.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {pendingAttendees.map((attendee) => (
                  <div
                    key={attendee.userId}
                    className="bg-orange-50 rounded-lg p-3 border border-orange-200"
                  >
                    <div 
                      className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-orange-100 -m-3 p-3 rounded-t-lg transition-colors"
                      onClick={() => onUserClick?.(attendee.userId)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.userAvatar} />
                        <AvatarFallback>{attendee.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{attendee.userName}</p>
                        <p className="text-xs text-orange-700">Wants to join</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDecline?.(attendee.userId);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove?.(attendee.userId);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Attendees Section */}
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-gray-900">
              Going ({totalAttendees})
            </p>
          </div>

          <div className="space-y-2">
            {/* Host (always first) */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onUserClick?.(hostId)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={hostAvatar} />
                <AvatarFallback>{hostName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{hostName}</p>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                  Host
                </Badge>
              </div>
            </div>

            {/* Accepted Attendees */}
            {acceptedAttendees.map((attendee) => (
              <div
                key={attendee.userId}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onUserClick?.(attendee.userId)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={attendee.userAvatar} />
                  <AvatarFallback>{attendee.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attendee.userName}</p>
                  <p className="text-xs text-gray-500">Attending</p>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {acceptedAttendees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Only the host is attending so far</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}