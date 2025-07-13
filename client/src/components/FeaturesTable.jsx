import React from 'react';
import Button from './Button';
import Tooltip from './Tooltip';
import { getFeatureMetadata, formatFeatureValue } from '../utils/featureMetadata';

const FeaturesTable = ({ features, activeTab, onLearnMore }) => {
  if (features.length === 0) {
    return (
      <div className="features-table-container">
        <table className="features-table">
          <thead>
            <tr>
              <th>Feature Name</th>
              {activeTab === 'active' && <th>Value</th>}
              <th>Description</th>
              <th>Category</th>
              <th>Learn More</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={activeTab === 'active' ? 5 : 4} className="no-results">
                No features available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="features-table-container">
      <table className="features-table">
        <thead>
          <tr>
            <th>Feature Name</th>
            {activeTab === 'active' && <th>Value</th>}
            <th>Description</th>
            <th>Category</th>
            <th>Learn More</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => {
            const metadata = getFeatureMetadata(feature.name);
            return (
              <tr key={feature.name} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td className="feature-name">
                  <Tooltip content={feature.name}>
                    <span>{metadata.name}</span>
                  </Tooltip>
                </td>
                {activeTab === 'active' && (
                  <td className="feature-value">
                    <Tooltip content={`Value: ${formatFeatureValue(feature.value)}`}>
                      <span>{formatFeatureValue(feature.value)}</span>
                    </Tooltip>
                  </td>
                )}
                <td className="feature-description">
                  <Tooltip content={metadata.description}>
                    <span>{metadata.description}</span>
                  </Tooltip>
                </td>
                <td className="feature-category">
                  <span className={`category-badge category-${metadata.category}`}>
                    {metadata.category}
                  </span>
                </td>
                <td className="feature-learn-more">
                  {metadata.learnMore ? (
                    <Button
                      variant="search"
                      onClick={() => onLearnMore(metadata.learnMore)}
                      className="learn-more-btn"
                    >
                      Learn More
                    </Button>
                  ) : (
                    <span className="no-link">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FeaturesTable; 