import React from 'react';

const getTimeRangeLabel = (timeRange) => {
  switch (timeRange) {
    case 'today':
      return "Aujourd'hui";
    case 'yesterday':
      return 'Hier';
    case 'this-week':
      return 'Cette semaine';
    case 'this-month':
      return 'Ce mois';
    case 'last-month':
      return 'Mois dernier';
    case 'this-year':
      return 'Cette année';
    default:
      return 'Tout';
  }
};

const StatCard = ({ title, value, change, isPositive, timeRange }) => {
  // Validate and format value
  const formattedValue = React.useMemo(() => {
    try {
      return typeof value === 'number' ? value : parseInt(value, 10) || 0;
    } catch (error) {
      console.error('Error formatting value:', error);
      return 0;
    }
  }, [value]);

  // Validate and format change text
  const formattedChange = React.useMemo(() => {
    try {
      return typeof change === 'string' ? change : 'Pas de données';
    } catch (error) {
      console.error('Error formatting change:', error);
      return 'Pas de données';
    }
  }, [change]);

  return (
    <div className="bg-gradient-to-br from-gray-800/30 via-gray-900/20 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-400 text-sm font-medium">
          {title}
          {timeRange !== 'all' && (
            <span className="text-blue-400 text-xs ml-2">• {getTimeRangeLabel(timeRange)}</span>
          )}
        </h3>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <svg
            className={`w-5 h-5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isPositive
                  ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
              }
            />
          </svg>
              </div>
            </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-white">{formattedValue}</div>
        <div className={`text-sm mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {formattedChange}
        </div>
            </div>
          </div>
  );
};

export default function StatsCards({ stats = [], timeRange = 'all' }) {
  // Validate stats array
  const validStats = React.useMemo(() => {
    try {
      if (!Array.isArray(stats)) {
        console.error('Stats must be an array');
        return [];
      }

      return stats.filter(stat => {
        const isValid = 
          stat &&
          typeof stat === 'object' &&
          'key' in stat &&
          'title' in stat &&
          'value' in stat &&
          'change' in stat;

        if (!isValid) {
          console.warn('Invalid stat object:', stat);
        }

        return isValid;
      });
    } catch (error) {
      console.error('Error validating stats:', error);
      return [];
    }
  }, [stats]);

  if (validStats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-800/30 via-gray-900/20 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {validStats.map(stat => (
        <StatCard
          key={stat.key}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          isPositive={stat.isPositive}
          timeRange={timeRange}
        />
      ))}
    </div>
  );
}