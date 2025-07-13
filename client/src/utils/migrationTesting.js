// Migration testing utilities
export const MIGRATION_CHECKLIST = {
  // Visual checks to perform after each migration
  visualChecks: [
    'Colors match original design',
    'Spacing is consistent',
    'Typography looks correct',
    'Borders and shadows are preserved',
    'Hover states work properly',
    'Responsive behavior is maintained',
    'Accessibility features still work'
  ],
  
  // Browser compatibility checks
  browserChecks: [
    'Chrome - Latest',
    'Firefox - Latest', 
    'Safari - Latest',
    'Edge - Latest',
    'Mobile Safari',
    'Mobile Chrome'
  ],
  
  // Functionality checks
  functionalityChecks: [
    'All interactive elements work',
    'Forms submit correctly',
    'Modals open/close properly',
    'Navigation works',
    'Search/filter functions work',
    'Responsive breakpoints trigger correctly'
  ]
};

// Helper function to compare CSS values
export const compareStyles = (element, expectedStyles) => {
  const computed = window.getComputedStyle(element);
  const differences = [];
  
  Object.entries(expectedStyles).forEach(([property, expectedValue]) => {
    const actualValue = computed[property];
    if (actualValue !== expectedValue) {
      differences.push({
        property,
        expected: expectedValue,
        actual: actualValue
      });
    }
  });
  
  return differences;
};

// Migration progress tracker
export const MIGRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  TESTED: 'tested'
};

export const MIGRATION_COMPONENTS = [
  { name: 'FeatureDictionaryModal', status: MIGRATION_STATUS.COMPLETED },
  { name: 'FeaturesTable', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'PredictionsPage', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'NewsPage', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'EducationCenter', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'TradeSimulatorPage', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'SearchPage', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'OhlcPage', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'App', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'Sidebar', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'Button', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'Modal', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'Tooltip', status: MIGRATION_STATUS.NOT_STARTED },
  { name: 'ValidatedInput', status: MIGRATION_STATUS.NOT_STARTED }
]; 