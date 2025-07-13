import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import ValidatedInput from './ValidatedInput';
import FeaturesTable from './FeaturesTable';
import { 
  FEATURE_CATEGORIES, 
  filterFeatures 
} from '../utils/featureMetadata';
import '../styles/feature-dictionary-modal.css';

const FeatureDictionaryModal = ({ isOpen, onClose, activeFeatures = [], allFeatures = [] }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter features based on search and category
  const filteredFeatures = useMemo(() => {
    const features = activeTab === 'active' ? activeFeatures : allFeatures;
    return filterFeatures(features, searchTerm, selectedCategory);
  }, [activeTab, activeFeatures, allFeatures, searchTerm, selectedCategory]);

  const handleLearnMore = (url) => {
    console.log('Navigate to:', url);
    alert('This would navigate to the Education Center page about this feature.');
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="feature-dictionary-modal">
        <div className="modal-header">
          <h2>Feature Dictionary</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <Button
            variant="indicator"
            active={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
          >
            Active Features ({activeFeatures.length})
          </Button>
          <Button
            variant="indicator"
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          >
            All Features ({allFeatures.length})
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-section">
          <div className="search-container">
            <ValidatedInput
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search features..."
              className="feature-search-input"
            />
          </div>
          
          <div className="filter-container">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              {FEATURE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Features Table */}
        <FeaturesTable
          features={filteredFeatures}
          activeTab={activeTab}
          onLearnMore={handleLearnMore}
        />

        {/* Footer */}
        <div className="modal-footer">
          <p className="feature-count">
            Showing {filteredFeatures.length} of {activeTab === 'active' ? activeFeatures.length : allFeatures.length} features
          </p>
          <Button variant="search" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeatureDictionaryModal; 