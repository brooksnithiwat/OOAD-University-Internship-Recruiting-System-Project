interface JobSkillBadgeProps {
  skill: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const variantClasses = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-green-100 text-green-800',
  tertiary: 'bg-purple-100 text-purple-800',
};

export const JobSkillBadge: React.FC<JobSkillBadgeProps> = ({ skill, variant = 'primary' }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {skill}
    </span>
  );
};
