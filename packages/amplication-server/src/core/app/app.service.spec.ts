import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from 'src/services/prisma.service';
import { EntityService } from '../entity/entity.service';
import { App } from 'src/models/App';
import { User } from 'src/models/User';
import { Entity } from 'src/models/Entity';
import { Commit } from 'prisma/dal';

const EXAMPLE_MESSAGE = 'exampleMessage';
const EXAMPLE_APP_ID = 'exampleAppId';
const EXAMPLE_APP_NAME = 'exampleAppName';
const EXAMPLE_APP_DESCRIPTION = 'exampleAppName';

const EXAMPLE_APP: App = {
  id: EXAMPLE_APP_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: EXAMPLE_APP_NAME,
  description: EXAMPLE_APP_DESCRIPTION
};

const EXAMPLE_USER_ID = 'exampleUserId';
const EXAMPLE_USER_APP_ROLE = {
  name: 'user',
  displayName: 'User'
};

const EXAMPLE_USER: User = {
  id: EXAMPLE_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date()
};

const EXAMPLE_ENTITY_ID = 'exampleEntityId';
const EXAMPLE_ENTITY_NAME = 'exampleEntityName';
const EXAMPLE_ENTITY_DISPLAY_NAME = 'exampleEntityDisplayName';
const EXAMPLE_ENTITY_PLURAL_DISPLAY_NAME = 'exampleEntityPluralDisplayName';

const EXAMPLE_ENTITY: Entity = {
  id: EXAMPLE_ENTITY_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  appId: EXAMPLE_APP_ID,
  name: EXAMPLE_ENTITY_NAME,
  displayName: EXAMPLE_ENTITY_DISPLAY_NAME,
  pluralDisplayName: EXAMPLE_ENTITY_PLURAL_DISPLAY_NAME,
  isPersistent: true,
  allowFeedback: true
};

const EXAMPLE_COMMIT_ID = 'exampleCommitId';

const EXAMPLE_COMMIT: Commit = {
  id: EXAMPLE_COMMIT_ID,
  createdAt: new Date(),
  userId: EXAMPLE_USER_ID,
  message: EXAMPLE_MESSAGE,
  appId: EXAMPLE_APP_ID
};

const prismaAppCreateMock = jest.fn(() => {
  return EXAMPLE_APP;
});
const prismaAppFindOneMock = jest.fn(() => {
  return EXAMPLE_APP;
});
const prismaAppFindManyMock = jest.fn(() => {
  return [EXAMPLE_APP];
});
const prismaAppDeleteMock = jest.fn(() => {
  return EXAMPLE_APP;
});
const prismaAppUpdateMock = jest.fn(() => {
  return EXAMPLE_APP;
});
const prismaEntityFindManyMock = jest.fn(() => {
  return [EXAMPLE_ENTITY];
});
const prismaCommitCreateMock = jest.fn(() => {
  return EXAMPLE_COMMIT;
});

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        EntityService,
        {
          provide: PrismaService,
          useClass: jest.fn().mockImplementation(() => ({
            app: {
              create: prismaAppCreateMock,
              findOne: prismaAppFindOneMock,
              findMany: prismaAppFindManyMock,
              delete: prismaAppDeleteMock,
              update: prismaAppUpdateMock
            },
            entity: {
              findMany: prismaEntityFindManyMock
            },
            commit: {
              create: prismaCommitCreateMock
            }
          }))
        }
      ]
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an app', async () => {
    const createAppArgs = {
      args: {
        data: {
          name: EXAMPLE_APP_NAME,
          description: EXAMPLE_APP_DESCRIPTION
        }
      },
      user: EXAMPLE_USER
    };
    const returnArgs = {
      data: {
        ...createAppArgs.args.data,
        organization: {
          connect: {
            id: createAppArgs.user.organization?.id
          }
        },
        appRoles: {
          create: EXAMPLE_USER_APP_ROLE
        }
      }
    };
    expect(
      await service.createApp(createAppArgs.args, createAppArgs.user)
    ).toEqual(EXAMPLE_APP);
    expect(prismaAppCreateMock).toBeCalledTimes(1);
    expect(prismaAppCreateMock).toBeCalledWith(returnArgs);
  });

  it('should find an app', async () => {
    const args = { where: { id: EXAMPLE_APP_ID } };
    expect(await service.app(args)).toEqual(EXAMPLE_APP);
    expect(prismaAppFindOneMock).toBeCalledTimes(1);
    expect(prismaAppFindOneMock).toBeCalledWith(args);
  });

  it('should find many apps', async () => {
    const args = { where: { id: EXAMPLE_APP_ID } };
    expect(await service.apps(args)).toEqual([EXAMPLE_APP]);
    expect(prismaAppFindManyMock).toBeCalledTimes(1);
    expect(prismaAppFindManyMock).toBeCalledWith(args);
  });

  it('should delete an app', async () => {
    const args = { where: { id: EXAMPLE_APP_ID } };
    expect(await service.deleteApp(args)).toEqual(EXAMPLE_APP);
    expect(prismaAppDeleteMock).toBeCalledTimes(1);
    expect(prismaAppDeleteMock).toBeCalledWith(args);
  });

  it('should update an app', async () => {
    const args = {
      data: { name: EXAMPLE_APP_NAME },
      where: { id: EXAMPLE_APP_ID }
    };
    expect(await service.updateApp(args)).toEqual(EXAMPLE_APP);
    expect(prismaAppUpdateMock).toBeCalledTimes(1);
    expect(prismaAppUpdateMock).toBeCalledWith(args);
  });

  //WORK IN PROGRESS:
  it('should commit', async () => {
    const args = {
      data: {
        message: EXAMPLE_MESSAGE,
        app: { connect: { id: EXAMPLE_APP_ID } },
        user: { connect: { id: EXAMPLE_USER_ID } }
      }
    };
    const findManyArgs = {
      where: {
        id: EXAMPLE_APP_ID,
        organization: {
          users: {
            some: {
              id: EXAMPLE_USER_ID
            }
          }
        }
      }
    };
    const changedEntitiesArgs = {
      where: {
        lockedByUserId: EXAMPLE_USER_ID
      }
    };
    expect(await service.commit(args)).toEqual(EXAMPLE_COMMIT);
    expect(prismaAppFindManyMock).toBeCalledTimes(1);
    expect(prismaAppFindManyMock).toBeCalledWith(findManyArgs);
    expect(prismaEntityFindManyMock).toBeCalledTimes(1);
    expect(prismaEntityFindManyMock).toBeCalledWith(changedEntitiesArgs);
    expect(prismaCommitCreateMock).toBeCalledTimes(1);
    expect(prismaCommitCreateMock).toBeCalledWith(args);
  });
});
