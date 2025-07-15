import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import ValidatedInput from './ValidatedInput';
import FeaturesTable from './FeaturesTable';
import { 
  FEATURE_CATEGORIES, 
  filterFeatures 
} from '../utils/featureMetadata';
import { COMPONENT_PATTERNS } from '../utils/tailwindMapping';

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
      <div className="max-w-[900px] min-w-[700px] md:min-w-[500px] sm:min-w-[320px] max-h-[80vh] min-h-[400px] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h2 className="m-0 text-text-main text-2xl font-semibold">Feature Dictionary</h2>
          <button 
            className="bg-transparent border-none text-text-muted text-2xl cursor-pointer p-1 rounded w-8 h-8 flex items-center justify-center hover:bg-white hover:bg-opacity-10 hover:text-text-main transition-all"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-5">
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
        <div className="flex gap-4 mb-5 items-center">
          <div className="flex-1">
            <ValidatedInput
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search features..."
              className="w-full min-w-[200px]"
            />
          </div>
          
          <div className="min-w-[150px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 px-3 border border-border rounded-radius bg-bg-main text-text-main text-sm cursor-pointer transition-colors focus:outline-none focus:border-accent"
            >
              {FEATURE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Features Table - Scrollable Area */}
        <div className="flex-1 overflow-auto min-h-[200px] overflow-x-auto">
          <FeaturesTable
            features={filteredFeatures}
            activeTab={activeTab}
            onLearnMore={handleLearnMore}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
          <p className="m-0 text-text-muted text-sm">
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