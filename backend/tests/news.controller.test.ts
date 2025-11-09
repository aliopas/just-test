import type { Response } from 'express';
import { newsController } from '../src/controllers/news.controller';
import {
  approveNews,
  createNews,
  createNewsImageUploadUrl,
  deleteNews,
  getNewsById,
  listNews,
  publishScheduledNews,
  rejectNews,
  updateNews,
} from '../src/services/news.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';

jest.mock('../src/services/news.service', () => ({
  approveNews: jest.fn(),
  createNews: jest.fn(),
  createNewsImageUploadUrl: jest.fn(),
  listNews: jest.fn(),
  getNewsById: jest.fn(),
  updateNews: jest.fn(),
  deleteNews: jest.fn(),
  publishScheduledNews: jest.fn(),
  rejectNews: jest.fn(),
}));

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  statusCode?: number;
  body?: unknown;
};

const createMockResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {};
  res.status = jest.fn().mockImplementation(code => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation(payload => {
    res.body = payload;
    return res;
  });
  res.send = jest.fn().mockImplementation(payload => {
    res.body = payload;
    return res;
  });
  return res as MockResponse;
};

const mockedCreateNews = createNews as jest.Mock;
const mockedCreateNewsImageUploadUrl = createNewsImageUploadUrl as jest.Mock;
const mockedListNews = listNews as jest.Mock;
const mockedGetNewsById = getNewsById as jest.Mock;
const mockedUpdateNews = updateNews as jest.Mock;
const mockedDeleteNews = deleteNews as jest.Mock;
const mockedPublishScheduled = publishScheduledNews as jest.Mock;
const mockedApproveNews = approveNews as jest.Mock;
const mockedRejectNews = rejectNews as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('newsController.list', () => {
  it('returns paginated news', async () => {
    mockedListNews.mockResolvedValueOnce({
      news: [],
      meta: { page: 1, limit: 20, total: 0, pageCount: 0, hasNext: false },
    });

    const req = {
      query: { page: '1', limit: '20' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.list(req, res as unknown as Response);

    expect(mockedListNews).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 for invalid query', async () => {
    const req = {
      query: { limit: '-5' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.list(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedListNews).not.toHaveBeenCalled();
  });

  it('handles internal errors', async () => {
    mockedListNews.mockRejectedValueOnce(new Error('boom'));
    const req = {
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.list(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('newsController.create', () => {
  it('creates a news item', async () => {
    mockedCreateNews.mockResolvedValueOnce({ id: 'news-1' });
    const req = {
      user: { id: 'admin-1' },
      body: {
        title: 'Hello world',
        slug: 'hello-world',
        bodyMd: '# Markdown',
        status: 'draft',
      },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.create(req, res as unknown as Response);

    expect(mockedCreateNews).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'admin-1',
        input: expect.objectContaining({ slug: 'hello-world' }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('validates request body', async () => {
    const req = {
      body: { title: 'Hi' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.create(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateNews).not.toHaveBeenCalled();
  });

  it('handles duplicate slug', async () => {
    mockedCreateNews.mockRejectedValueOnce(new Error('NEWS_SLUG_EXISTS'));
    const req = {
      user: { id: 'admin-1' },
      body: {
        title: 'Hello world',
        slug: 'hello-world',
        bodyMd: '# Markdown',
      },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.create(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe('newsController.detail', () => {
  it('requires id', async () => {
    const req = {
      params: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.detail(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns news detail', async () => {
    mockedGetNewsById.mockResolvedValueOnce({ id: 'news-1' });
    const req = {
      params: { id: 'news-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.detail(req, res as unknown as Response);

    expect(mockedGetNewsById).toHaveBeenCalledWith('news-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles not found', async () => {
    mockedGetNewsById.mockRejectedValueOnce(new Error('NEWS_NOT_FOUND'));
    const req = {
      params: { id: 'missing' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.detail(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('newsController.update', () => {
  it('rejects missing id', async () => {
    const req = {
      params: {},
      body: { title: 'Updated' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.update(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUpdateNews).not.toHaveBeenCalled();
  });

  it('rejects invalid payload', async () => {
    const req = {
      params: { id: 'news-1' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.update(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates news', async () => {
    mockedUpdateNews.mockResolvedValueOnce({ id: 'news-1' });
    const req = {
      params: { id: 'news-1' },
      body: { title: 'Updated' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.update(req, res as unknown as Response);

    expect(mockedUpdateNews).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'news-1' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles slug conflict', async () => {
    mockedUpdateNews.mockRejectedValueOnce(new Error('NEWS_SLUG_EXISTS'));
    const req = {
      params: { id: 'news-1' },
      body: { slug: 'duplicate' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.update(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe('newsController.remove', () => {
  it('requires id', async () => {
    const req = {
      params: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.remove(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deletes news and returns 204', async () => {
    mockedDeleteNews.mockResolvedValueOnce(undefined);
    const req = {
      params: { id: 'news-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.remove(req, res as unknown as Response);

    expect(mockedDeleteNews).toHaveBeenCalledWith('news-1');
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('handles not found', async () => {
    mockedDeleteNews.mockRejectedValueOnce(new Error('NEWS_NOT_FOUND'));
    const req = {
      params: { id: 'missing' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.remove(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('newsController.presignImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for invalid payload', async () => {
    const req = {
      body: { fileName: 'invalid' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.presignImage(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateNewsImageUploadUrl).not.toHaveBeenCalled();
  });

  it('returns presigned url on success', async () => {
    mockedCreateNewsImageUploadUrl.mockResolvedValueOnce({
      bucket: 'news-images',
      storageKey: 'cover/2025/01/abc.png',
      uploadUrl: 'https://signed',
      token: 'token',
      headers: { 'Content-Type': 'image/png' },
      path: 'cover/2025/01/abc.png',
    });

    const req = {
      body: {
        fileName: 'cover.png',
        fileType: 'image/png',
        fileSize: 1000,
        variant: 'cover',
      },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.presignImage(req, res as unknown as Response);

    expect(mockedCreateNewsImageUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'cover.png' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: 'news-images',
        uploadUrl: 'https://signed',
      })
    );
  });

  it('handles internal error', async () => {
    mockedCreateNewsImageUploadUrl.mockRejectedValueOnce(new Error('failed'));

    const req = {
      body: {
        fileName: 'cover.png',
        fileType: 'image/png',
        fileSize: 1000,
      },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.presignImage(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('newsController.publishScheduled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns list of published news', async () => {
    mockedPublishScheduled.mockResolvedValueOnce([{ id: 'news-1' }]);
    const req = {} as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.publishScheduled(req, res as unknown as Response);

    expect(mockedPublishScheduled).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 1,
        items: [{ id: 'news-1' }],
      })
    );
  });

  it('handles internal error', async () => {
    mockedPublishScheduled.mockRejectedValueOnce(new Error('boom'));
    const req = {} as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.publishScheduled(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('newsController.approve', () => {
  it('requires news id', async () => {
    const req = {
      user: { id: 'admin-1' },
      params: {},
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedApproveNews).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    const req = {
      params: { id: 'news-1' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('validates payload', async () => {
    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: 123 },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedApproveNews).not.toHaveBeenCalled();
  });

  it('approves news successfully', async () => {
    mockedApproveNews.mockResolvedValueOnce({
      news: { id: 'news-1', status: 'published' },
      review: { id: 'review-1' },
    });

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: 'Looks good' },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(mockedApproveNews).toHaveBeenCalledWith(
      expect.objectContaining({
        newsId: 'news-1',
        reviewerId: 'admin-1',
        input: { comment: 'Looks good' },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        news: expect.objectContaining({ id: 'news-1' }),
      })
    );
  });

  it('maps not found error', async () => {
    mockedApproveNews.mockRejectedValueOnce(new Error('NEWS_NOT_FOUND'));

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'missing' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps invalid state error', async () => {
    mockedApproveNews.mockRejectedValueOnce(new Error('NEWS_INVALID_STATE'));

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('handles unexpected errors', async () => {
    mockedApproveNews.mockRejectedValueOnce(new Error('boom'));

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.approve(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('newsController.reject', () => {
  it('requires news id', async () => {
    const req = {
      user: { id: 'admin-1' },
      params: {},
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedRejectNews).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    const req = {
      params: { id: 'news-1' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('validates payload', async () => {
    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: '' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedRejectNews).not.toHaveBeenCalled();
  });

  it('rejects news successfully', async () => {
    mockedRejectNews.mockResolvedValueOnce({
      news: { id: 'news-1', status: 'rejected' },
      review: { id: 'review-9' },
    });

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: 'Needs fixes' },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(mockedRejectNews).toHaveBeenCalledWith(
      expect.objectContaining({
        newsId: 'news-1',
        reviewerId: 'admin-1',
        input: { comment: 'Needs fixes' },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('maps not found error', async () => {
    mockedRejectNews.mockRejectedValueOnce(new Error('NEWS_NOT_FOUND'));

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'missing' },
      body: { comment: 'Reason' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps invalid state error', async () => {
    mockedRejectNews.mockRejectedValueOnce(new Error('NEWS_INVALID_STATE'));

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: 'Reason' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('maps comment required error', async () => {
    mockedRejectNews.mockRejectedValueOnce(
      new Error('NEWS_REVIEW_COMMENT_REQUIRED')
    );

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: 'Reason' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles unexpected errors', async () => {
    mockedRejectNews.mockRejectedValueOnce(new Error('boom'));

    const req = {
      user: { id: 'admin-1' },
      params: { id: 'news-1' },
      body: { comment: 'Reason' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await newsController.reject(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

