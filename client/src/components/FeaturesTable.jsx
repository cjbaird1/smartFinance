import React from 'react';
import Button from './Button';
import Tooltip from './Tooltip';
import { getFeatureMetadata, formatFeatureValue } from '../utils/featureMetadata';

const toSlug = (str) => str.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

const FeaturesTable = ({ features, activeTab, onLearnMore }) => {
  if (features.length === 0) {
    return (
      <div className="features-table-container">
        <table className="features-table min-w-[700px]">
          <thead>
            <tr>
              <th className="text-left">Feature Name</th>
              <th className="text-left">Description</th>
              <th className="text-left">Category</th>
              <th className="text-left">Learn More</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="no-results">
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
      <table className="features-table min-w-[700px]">
        <thead>
          <tr>
            <th className="text-left">Feature Name</th>
            <th className="text-left">Description</th>
            <th className="text-left">Category</th>
            <th className="text-left">Learn More</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => {
            const metadata = getFeatureMetadata(feature.name);
            const truncatedDescription = metadata.description && metadata.description.length > 20
              ? metadata.description.slice(0, 20) + '...'
              : metadata.description;
            return (
              <tr key={feature.name} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td className="feature-name text-left">
                  <Tooltip content={feature.name}>
                    <span>{metadata.name}</span>
                  </Tooltip>
                </td>
                <td className="feature-description max-w-[180px] text-left">
                  <Tooltip content={metadata.description}>
                    <span className="truncate block cursor-help" title={metadata.description}>
                      {truncatedDescription}
                    </span>
                  </Tooltip>
                </td>
                <td className="feature-category text-left">
                  <span className={`category-badge category-${metadata.category}`}>
                    {metadata.category}
                  </span>
                </td>
                <td className="feature-learn-more text-left">
                  <Tooltip content="Learn more about this feature">
                    <a
                      href={`/education#${toSlug(metadata.name)}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-panel hover:bg-accent focus:bg-accent transition-colors text-accent hover:text-white focus:text-white border border-border focus:outline-none"
                      aria-label={`Learn more about ${metadata.name} in Education Center`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                      </svg>
                    </a>
                  </Tooltip>
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