import { useNavigate } from 'react-router-dom';
import { JobSkillBadge } from './JobSkillBadge';

export interface JobCardProps {
  jobId: string;
  title: string;
  companyName: string;
  location: string | null;
  minGpa: number;
  applicationDeadline: string;
  skills: string[];
}

const isDeadlineUrgent = (deadline: string): boolean => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
};

export const JobCard: React.FC<JobCardProps> = ({
  jobId,
  title,
  companyName,
  location,
  minGpa,
  applicationDeadline,
  skills,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${jobId}`)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900 flex-1">{title}</h3>
        {isDeadlineUrgent(applicationDeadline) && (
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
            Closing Soon
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">{companyName}</p>

      <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-700">
        {location && (
          <span className="flex items-center gap-1">
            📍 {location}
          </span>
        )}
        <span>Min GPA: {minGpa.toFixed(2)}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {skills.slice(0, 3).map((skill: string, index: number) => (
          <JobSkillBadge
            key={skill}
            skill={skill}
            variant={(['primary', 'secondary', 'tertiary'] as const)[index % 3]}
          />
        ))}
        {skills.length > 3 && (
          <span className="text-xs text-gray-500 px-2 py-1">+{skills.length - 3} more</span>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Deadline: {new Date(applicationDeadline).toLocaleDateString()}
      </p>
    </div>
  );
};
