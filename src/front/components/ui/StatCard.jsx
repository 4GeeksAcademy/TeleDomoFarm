import React from 'react';

const StatCard = ({ title, value, icon, change, changeType }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                    <p
                        className={`text-sm mt-2 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                            }`}
                    >
                        {change} {changeType === 'increase' ? '↑' : '↓'} desde el mes pasado
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-opacity-20 bg-gray-200">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
