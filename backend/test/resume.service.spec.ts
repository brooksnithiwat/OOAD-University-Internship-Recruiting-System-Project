import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { ResumesRepository } from '../src/resumes/resumes.repository';
import { ResumesService } from '../src/resumes/resumes.service';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-1234'),
}));

describe('ResumesService', () => {
  let service: ResumesService;
  let repository: {
    createResume: jest.Mock;
    findByStudentId: jest.Mock;
    findById: jest.Mock;
  };
  let prismaService: any;

  beforeEach(() => {
    repository = {
      createResume: jest.fn(),
      findByStudentId: jest.fn(),
      findById: jest.fn(),
    };

    prismaService = {
      student: {
        findUnique: jest.fn(),
      },
    };

    service = new ResumesService(
      repository as unknown as ResumesRepository,
      prismaService,
    );

    // Mock resolveUserIdToStudentId to avoid actual Prisma calls
    (service as any).resolveUserIdToStudentId = jest.fn(async (userId: string) => {
      if (userId === 'user-1') return 'student-1';
      if (userId === 'user-2') return 'student-2';
      throw new NotFoundException('Student not found');
    });

    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined as any);
    jest.spyOn(fs, 'copyFileSync').mockImplementation(() => undefined as any);

    repository.createResume.mockResolvedValue({
      resumeId: 'resume-1',
      studentId: 'student-1',
      fileName: 'resume.pdf',
      fileRef: 'uploads/uuid-1234-resume.pdf',
      fileSizeBytes: 204800,
      mimeType: 'application/pdf',
      virusScanStatus: 'PENDING',
      uploadedAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    repository.findByStudentId.mockResolvedValue([]);
    repository.findById.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('uploadResume', () => {
    it('should save resume and return response when file is a valid PDF under 5MB', async () => {
      const file: any = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 204800,
        buffer: Buffer.from('pdf-content'),
      };

      const result = await service.uploadResume('user-1', file);

      expect(result).toEqual({
        resumeId: 'resume-1',
        fileName: 'resume.pdf',
        fileRef: 'uploads/uuid-1234-resume.pdf',
        fileSizeBytes: 204800,
        uploadedAt: new Date('2026-04-01T00:00:00.000Z'),
      });
      expect(repository.createResume).toHaveBeenCalledWith({
        studentId: 'student-1',
        fileName: 'resume.pdf',
        fileRef: 'uploads/uuid-1234-resume.pdf',
        fileSizeBytes: 204800,
        mimeType: 'application/pdf',
        virusScanStatus: 'PENDING',
      });
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when file is not PDF', async () => {
      const file: any = {
        originalname: 'resume.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('text-content'),
      };

      await expect(service.uploadResume('user-1', file)).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.createResume).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file exceeds 5MB', async () => {
      const file: any = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 5 * 1024 * 1024 + 1,
        buffer: Buffer.from('large-content'),
      };

      await expect(service.uploadResume('user-1', file)).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.createResume).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is missing', async () => {
      await expect(service.uploadResume('user-1', undefined as unknown as any)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(repository.createResume).not.toHaveBeenCalled();
    });

    it('should store file with pattern {uuid}-{originalname}', async () => {
      const file: any = {
        originalname: 'my resume final.pdf',
        mimetype: 'application/pdf',
        size: 204800,
        buffer: Buffer.from('pdf-content'),
      };

      await service.uploadResume('user-1', file);

      const writtenPath = (fs.writeFileSync as jest.Mock).mock.calls[0][0] as string;
      expect(writtenPath).toContain('uuid-1234-my_resume_final.pdf');
      expect(repository.createResume).toHaveBeenCalledWith(
        expect.objectContaining({
          fileRef: 'uploads/uuid-1234-my_resume_final.pdf',
        })
      );
    });

    it('should set virusScanStatus to PENDING on upload', async () => {
      const file: any = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 204800,
        buffer: Buffer.from('pdf-content'),
      };

      await service.uploadResume('user-1', file);

      expect(repository.createResume).toHaveBeenCalledWith(
        expect.objectContaining({
          virusScanStatus: 'PENDING',
        })
      );
    });
  });

  describe('getMyResumes', () => {
    it('should return only resumes belonging to the logged-in student', async () => {
      repository.findByStudentId.mockResolvedValue([
        {
          resumeId: 'resume-1',
          studentId: 'student-1',
          fileName: 'resume.pdf',
          fileRef: 'uploads/uuid-1234-resume.pdf',
          fileSizeBytes: 204800,
          mimeType: 'application/pdf',
          virusScanStatus: 'PENDING',
          uploadedAt: new Date('2026-04-01T00:00:00.000Z'),
        },
      ]);

      const result = await service.getMyResumes('user-1');

      expect(result).toHaveLength(1);
      expect(repository.findByStudentId).toHaveBeenCalledWith('student-1');
    });

    it('should return empty array when student has no resumes', async () => {
      repository.findByStudentId.mockResolvedValue([]);

      const result = await service.getMyResumes('user-1');

      expect(result).toEqual([]);
      expect(repository.findByStudentId).toHaveBeenCalledWith('student-1');
    });
  });

  describe('getResumeById', () => {
    it('should return a resume when it belongs to the requesting student', async () => {
      repository.findById.mockResolvedValue({
        resumeId: 'resume-1',
        studentId: 'student-1',
        fileName: 'resume.pdf',
        fileRef: 'uploads/uuid-1234-resume.pdf',
        fileSizeBytes: 204800,
        mimeType: 'application/pdf',
        virusScanStatus: 'PENDING',
        uploadedAt: new Date('2026-04-01T00:00:00.000Z'),
      });

      const result = await service.getResumeById('user-1', 'resume-1');

      expect(result.resumeId).toBe('resume-1');
      expect(repository.findById).toHaveBeenCalledWith('resume-1');
    });

    it('should throw NotFoundException when the resume does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getResumeById('user-1', 'missing-resume')).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('missing-resume');
    });

    it('should throw ForbiddenException when a different student tries to access the resume', async () => {
      repository.findById.mockResolvedValue({
        resumeId: 'resume-1',
        studentId: 'student-2',
        fileName: 'resume.pdf',
        fileRef: 'uploads/uuid-1234-resume.pdf',
        fileSizeBytes: 204800,
        mimeType: 'application/pdf',
        virusScanStatus: 'PENDING',
        uploadedAt: new Date('2026-04-01T00:00:00.000Z'),
      });

      await expect(service.getResumeById('user-1', 'resume-1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(repository.findById).toHaveBeenCalledWith('resume-1');
    });
  });
});
