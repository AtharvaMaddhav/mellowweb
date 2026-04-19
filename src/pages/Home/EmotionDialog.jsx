import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';

const EmotionDialog = ({ user, onClose, onSubmit }) => {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emotions = [
    { name: 'Happy', emoji: '😊' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Angry', emoji: '😠' },
    { name: 'Excited', emoji: '😃' },
    { name: 'Calm', emoji: '😌' },
  ];

  const handleSubmit = async () => {
    if (!selectedEmotion) {
      alert('Please select an emotion.');
      return;
    }

    try {
      setSubmitting(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        dailyEmotions: arrayUnion({
          date: today,
          emotion: selectedEmotion,
          description: description.trim() || null,
        }),
      });
      onSubmit();
    } catch (error) {
      console.error('Error saving emotion:', error);
      alert('Failed to save your emotion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">How do you feel today?</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-4">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              onClick={() => setSelectedEmotion(emotion.name)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                selectedEmotion === emotion.name
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <span className="text-3xl mb-1">{emotion.emoji}</span>
              <span className="text-sm text-gray-300">{emotion.name}</span>
            </button>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedEmotion}
            className={`px-4 py-2 rounded-lg text-white ${
              submitting || !selectedEmotion
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionDialog;