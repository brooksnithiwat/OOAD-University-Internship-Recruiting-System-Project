import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { ResumesRepository } from '../src/resumes/resumes.repository';
import { ResumesService } from '../src/resumes/resumes.service';
import { StorageFactory } from '../src/common/services/storage.factory';
import { StorageService } from '../src/common/services/storage.interface';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-1234'),
}));

describe('ResumesService', () => {
  let service: ResumesService;
  let repository: {
    createResume: jest.Mock;
    findByStudentId: jest.Mock;
    findById: jest.Mock;
    deleteById: jest.Mock;
  };
  let prismaService: any;
  let storageFactory: {
    getStorageService: jest.Mock;
  };
  let mockStorageService: {
    uploadFile: jest.Mock;
    deleteFile: jest.Mock;
    getFileUrl: jest.Mock;
    getStorageMode: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      createResume: jest.fn(),
      findByStudentId: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    prismaService = {
      student: {
        findUnique: jest.fn(),
      },
    };

    // Mock StorageService
    mockStorageService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
      getStorageMode: jest.fn(),
    };

    // Mock StorageFactory
    storageFactory = {
      getStorageService: jest.fn(() => mockStorageService),
    };

    service = new ResumesService(
      repository as unknown as ResumesRepository,
      prismaService,
      storageFactory as unknown as StorageFactory,
    );

    // Mock resolveUserIdToStudentId to avoid actual Prisma calls
    (service as any).resolveUserIdToStudentId = jest.fn(async (userId: string) => {
      if (userId === 'user-1') return 'student-1';
      if (userId === 'user-2') return 'student-2';
      throw new NotFoundException('Student not found');
    });

    // Mock storage service uploadFile
    mockStorageService.uploadFile.mockResolvedValue({
      fileKey: 'uploads/uuid-1234-resume.pdf',
      fileUrl: 'uploads/uuid-1234-resume.pdf',
    });

    // Mock storage service getFileUrl
    mockStorageService.getFileUrl.mockImplementation((fileKey: string) => fileKey);

    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined as any);
    jest.spyOn(fs, 'copyFileSync').mockImplementation(() => undefined as any);
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined as any);

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
    repository.deleteById.mockResolvedValue({
      resumeId: 'resume-1',
      studentId: 'student-1',
      fileName: 'resume.pdf',
      fileRef: 'uploads/uuid-1234-resume.pdf',
      fileSizeBytes: 204800,
      mimeType: 'application/pdf',
      virusScanStatus: 'PENDING',
      uploadedAt: new Date('2026-04-01T00:00:00.000Z'),
    });
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
      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(1);
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
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
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
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is missing', async () => {
      await expect(service.uploadResume('user-1', undefined as unknown as any)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(repository.createResume).not.toHaveBeenCalled();
    });

    it('should store file with pattern {uuid}-{originalname}', async () => {
      mockStorageService.uploadFile.mockResolvedValueOnce({
        fileKey: 'uploads/uuid-1234-my_resume_final.pdf',
        fileUrl: 'uploads/uuid-1234-my_resume_final.pdf',
      });
      
      const file: any = {
        originalname: 'my resume final.pdf',
        mimetype: 'application/pdf',
        size: 204800,
        buffer: Buffer.from('pdf-content'),
      };

      await service.uploadResume('user-1', file);

      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'my resume final.pdf',
          mimetype: 'application/pdf',
        })
      );
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

  describe('deleteResume', () => {
    it('should delete resume and physical file when student is the owner', async () => {
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

      const result = await service.deleteResume('user-1', 'resume-1');

      expect(result).toEqual({ message: 'Resume deleted successfully' });
      expect(repository.findById).toHaveBeenCalledWith('resume-1');
      expect(repository.deleteById).toHaveBeenCalledWith('resume-1');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('uploads/uuid-1234-resume.pdf');
    });

    it('should throw NotFoundException when resumeId does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteResume('user-1', 'missing-resume')).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.deleteById).not.toHaveBeenCalled();
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when resume belongs to another student', async () => {
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

      await expect(service.deleteResume('user-1', 'resume-1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(repository.deleteById).not.toHaveBeenCalled();
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should delete physical file after DB record is deleted', async () => {
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

      await service.deleteResume('user-1', 'resume-1');

      expect(repository.deleteById).toHaveBeenCalledWith('resume-1');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('uploads/uuid-1234-resume.pdf');
    });
  });
});
