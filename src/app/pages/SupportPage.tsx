import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Mail, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export function SupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      // Create email content
      const subject = encodeURIComponent(`Kynnect Support: ${category}`);
      const body = encodeURIComponent(
        `Category: ${category}\n\n` +
        `From: ${user?.name} (${user?.email})\n` +
        `User ID: ${user?.id}\n\n` +
        `Message:\n${message}`
      );

      // Open default email client
      window.location.href = `mailto:alexis@kynnect.net?subject=${subject}&body=${body}`;

      toast.success('Email client opened! Please send the email to complete your support request.');
      
      // Reset form
      setTimeout(() => {
        setCategory('');
        setMessage('');
        setIsSending(false);
      }, 1000);
    } catch (error) {
      console.error('Error opening email client:', error);
      toast.error('Failed to open email client. Please email us directly at alexis@kynnect.net');
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Support</h1>
              <p className="text-gray-400 text-sm">We're here to help</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Support Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-2">Get in Touch</h2>
              <p className="text-sm text-gray-700 mb-3">
                Having issues or questions? Send us a message and we'll get back to you as soon as possible.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="font-medium">alexis@kynnect.net</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-semibold mb-4">Send Support Request</h3>
            
            {/* User Info Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
              <p className="text-gray-600 mb-1">Sending as:</p>
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            {/* Category Selection */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug Report">Bug Report</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Account Issue">Account Issue</SelectItem>
                  <SelectItem value="Event Issue">Event Issue</SelectItem>
                  <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                  <SelectItem value="General Question">General Question</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Please include as much detail as possible to help us assist you better.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSending || !category || !message.trim()}
            className="w-full h-12 bg-black hover:bg-gray-800"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Opening Email...' : 'Send Support Request'}
          </Button>

          {/* Alternative Contact */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>You can also email us directly at:</p>
            <a 
              href="mailto:alexis@kynnect.net"
              className="text-blue-600 hover:underline font-medium"
            >
              alexis@kynnect.net
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}