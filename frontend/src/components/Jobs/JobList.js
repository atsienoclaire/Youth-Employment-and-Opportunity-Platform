import React from 'react';
import { Link } from 'react-router-dom';

const JobList = ({ jobs }) => {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                <Link to={`/jobs/${job._id}`} className="hover:text-blue-600">
                  {job.title}
                </Link>
              </h3>
              <p className="text-gray-600 mt-1">{job.company}</p>
              <p className="text-gray-500 text-sm mt-1">{job.location}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {job.jobType}
              </span>
              {job.salary && (
                <p className="text-gray-900 font-medium mt-2">
                  ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mt-3 line-clamp-2">{job.description}</p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.category}
              </span>
            </div>
            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;