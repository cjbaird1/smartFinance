import { useState, useEffect } from 'react';

export const useFeatureDictionary = () => {
  const [allFeatures, setAllFeatures] = useState([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllFeatures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/features');
      if (response.ok) {
        const data = await response.json();
        setAllFeatures(data.features || []);
      } else {
        setError('Failed to fetch features');
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
      setError('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  const openFeatureModal = () => setShowFeatureModal(true);
  const closeFeatureModal = () => setShowFeatureModal(false);

  useEffect(() => {
    fetchAllFeatures();
  }, []);

  return {
    allFeatures,
    showFeatureModal,
    loading,
    error,
    openFeatureModal,
    closeFeatureModal,
    refetchFeatures: fetchAllFeatures
  };
}; 