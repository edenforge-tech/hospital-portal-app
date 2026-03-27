/**
 * Patient Feedback Widget
 * Collect patient satisfaction feedback and NPS scores
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, ThumbsUp, Camera } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { PatientFeedback } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const PatientFeedbackWidget: React.FC<WidgetProps> = ({ patientId, sessionId }) => {
  const [feedback, setFeedback] = useState<PatientFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [ratings, setRatings] = useState({
    staff: 0,
    facility: 0,
    treatment: 0,
    waitTime: 0,
  });
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (patientId && sessionId) loadFeedback();
  }, [patientId, sessionId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getPatientFeedback(sessionId!);
      setFeedback(data);
      if (!data.submitted) {
        setShowForm(true);
      }
    } catch (err) {
      console.error(err);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!npsScore || !sessionId) return;

    try {
      await widgetsApi.submitFeedback(sessionId, {
        npsScore,
        ratings,
        comments,
      });
      await loadFeedback();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (feedback && feedback.submitted) {
    return (
      <div className="h-full flex flex-col p-4 space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ThumbsUp className="w-5 h-5 mr-2 text-green-600" />
          Feedback Submitted
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Thank you for your valuable feedback!</p>
          <p className="text-sm text-green-700 mt-2">
            Your NPS Score: <strong>{feedback.npsScore}/10</strong>
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
        Share Your Feedback
      </h3>

      {/* NPS Score */}
      <div className="border rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">
          How likely are you to recommend us? (0-10)
        </label>
        <div className="flex justify-between gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
            <button
              key={score}
              onClick={() => setNpsScore(score)}
              className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                npsScore === score
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Not Likely</span>
          <span>Very Likely</span>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="font-medium">Rate Your Experience</h4>
        
        <div>
          <label className="block text-sm text-gray-700 mb-1">Staff Behavior</label>
          <StarRating value={ratings.staff} onChange={(val) => setRatings({ ...ratings, staff: val })} />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Facility & Cleanliness</label>
          <StarRating value={ratings.facility} onChange={(val) => setRatings({ ...ratings, facility: val })} />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Treatment Quality</label>
          <StarRating value={ratings.treatment} onChange={(val) => setRatings({ ...ratings, treatment: val })} />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Wait Time</label>
          <StarRating value={ratings.waitTime} onChange={(val) => setRatings({ ...ratings, waitTime: val })} />
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium mb-2">Additional Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
          rows={4}
          placeholder="Tell us more about your experience..."
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!npsScore}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default PatientFeedbackWidget;
