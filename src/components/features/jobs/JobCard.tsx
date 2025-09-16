import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Display';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  skills: string[];
  description: string;
  postedDate: string;
  onViewDetails?: (id: string) => void;
  onApply?: (id: string) => void;
  className?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  location,
  salary,
  type,
  skills,
  description,
  postedDate,
  onViewDetails,
  onApply,
  className = ''
}) => {
  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-orange-100 text-orange-800';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800';
      case 'freelance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{company}</p>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
          <Badge className={getJobTypeColor(type)}>
            {type.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardBody>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{description}</p>

        {salary && (
          <p className="text-lg font-semibold text-green-600 mb-3">{salary}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 3} more
            </Badge>
          )}
        </div>

        <p className="text-xs text-gray-500">Posted {postedDate}</p>
      </CardBody>

      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(id)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onApply?.(id)}
          >
            Apply Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;