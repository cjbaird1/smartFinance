import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold mb-4">Tailwind CSS Test Component</h1>
        <p className="text-lg">If you can see this styled content, Tailwind CSS is working!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold mb-2">Success Card</h3>
          <p className="text-green-700">This card uses green colors</p>
        </div>
        
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">Warning Card</h3>
          <p className="text-yellow-700">This card uses yellow colors</p>
        </div>
        
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Card</h3>
          <p className="text-red-700">This card uses red colors</p>
        </div>
      </div>
      
      <div className="mt-8">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest; 