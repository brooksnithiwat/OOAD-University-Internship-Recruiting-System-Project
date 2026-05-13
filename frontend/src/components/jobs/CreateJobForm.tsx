import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateJobPostRequest } from '../../services/jobPost.service';
import { title } from 'node:process';

const jobPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 20 characters'),
  location: z.string().optional(),
  minGpa: z.number().min(0).max(4, 'GPA must be between 0 and 4'),
  durationWeeks: z.number().min(10, 'Duration must be at least 10 weeks'),
  applicationDeadline: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Deadline must be in the future'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

interface CreateJobFormProps {
  onSubmit: (data: CreateJobPostRequest) => Promise<void>;
  initialData?: Partial<JobPostFormData>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const CreateJobForm: React.FC<CreateJobFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
  isEdit,
}) => {
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      minGpa: initialData?.minGpa || 0,
      durationWeeks: initialData?.durationWeeks || 10,
      applicationDeadline: initialData?.applicationDeadline || '',
      skills: initialData?.skills || [],
    },
  });

  const [skillInput, setSkillInput] = useState('');
  const skills = watch('skills');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue('skills', [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue('skills', skills.filter((s) => s !== skillToRemove));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input
              id="title"
              {...field}
              type="text"
              placeholder="e.g., Software Engineer Intern"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              id="description"
              {...field}
              placeholder="Describe the internship role, responsibilities, and expectations..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <input
                  id="location"
                {...field}
                type="text"
                placeholder="e.g., Bangkok, Thailand"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="minGpa" className="block text-sm font-medium text-gray-700 mb-1">Min GPA</label>
          <Controller
            name="minGpa"
            control={control}
            render={({ field }) => (
              <input
                  id="minGpa"
                {...field}
                type="number"
                step="0.01"
                min="0"
                max="4"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors.minGpa && <p className="text-red-500 text-xs mt-1">{errors.minGpa.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="durationWeeks" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (weeks) *
          </label>
          <Controller
            name="durationWeeks"
            control={control}
            render={({ field }) => (
              <input
                id="durationWeeks"
                {...field}
                type="number"
                min="10"
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors.durationWeeks && (
            <p className="text-red-500 text-xs mt-1">{errors.durationWeeks.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline *
          </label>
          <Controller
            name="applicationDeadline"
            control={control}
            render={({ field }) => (
              <input
                id="applicationDeadline"
                {...field}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors.applicationDeadline && (
            <p className="text-red-500 text-xs mt-1">{errors.applicationDeadline.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="skillInput" className="block text-sm font-medium text-gray-700 mb-1">Skills *</label>
        <div className="flex gap-2 mb-2">
          <input
            id="skillInput"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            placeholder="Type a skill and press Enter..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill: string) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="font-bold cursor-pointer hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Saving...' : isEdit ? 'Update Job Post' : 'Create Job Post'}
      </button>
    </form>
  );
};
