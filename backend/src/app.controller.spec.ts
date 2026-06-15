import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'bun:test';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './permissions/permissions.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: UsersService, useValue: {} },
        { provide: RolesService, useValue: {} },
        { provide: PermissionsService, useValue: {} },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API metadata with ok status', () => {
      const info = appController.getApiInfo();
      expect(info.name).toBe('Nestplate API');
      expect(info.status).toBe('ok');
      expect(info.docs).toBe('/api/docs');
      expect(typeof info.version).toBe('string');
      expect(typeof info.timestamp).toBe('string');
    });
  });
});
