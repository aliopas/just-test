import type { Response } from 'express';
import { publicNewsController } from '../src/controllers/public-news.controller';
import {
  getPublishedNewsById,
  listPublishedNews,
} from '../src/services/news.service';

jest.mock('../src/services/news.service', () => ({
  listPublishedNews: jest.fn(),
  getPublishedNewsById: jest.fn(),
}));

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
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
  return res as MockResponse;
};

const mockedListPublishedNews = listPublishedNews as jest.Mock;
const mockedGetPublishedNewsById = getPublishedNewsById as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('publicNewsController.list', () => {
  it('returns published news', async () => {
    mockedListPublishedNews.mockResolvedValueOnce({
      news: [],
      meta: { page: 1, limit: 12, total: 0, pageCount: 0, hasNext: false },
    });

    const req = {
      query: { page: '1', limit: '12' },
    } as any;
    const res = createMockResponse();

    await publicNewsController.list(req, res as unknown as Response);

    expect(mockedListPublishedNews).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 12 })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 for invalid query', async () => {
    const req = {
      query: { page: '0' },
    } as any;
    const res = createMockResponse();

    await publicNewsController.list(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedListPublishedNews).not.toHaveBeenCalled();
  });

  it('handles internal errors', async () => {
    mockedListPublishedNews.mockRejectedValueOnce(new Error('boom'));

    const req = {
      query: {},
    } as any;
    const res = createMockResponse();

    await publicNewsController.list(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicNewsController.detail', () => {
  it('requires id', async () => {
    const req = {
      params: {},
    } as any;
    const res = createMockResponse();

    await publicNewsController.detail(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedGetPublishedNewsById).not.toHaveBeenCalled();
  });

  it('returns news detail', async () => {
    mockedGetPublishedNewsById.mockResolvedValueOnce({ id: 'news-1' });

    const req = {
      params: { id: 'news-1' },
    } as any;
    const res = createMockResponse();

    await publicNewsController.detail(req, res as unknown as Response);

    expect(mockedGetPublishedNewsById).toHaveBeenCalledWith('news-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'news-1' })
    );
  });

  it('maps not found errors', async () => {
    mockedGetPublishedNewsById.mockRejectedValueOnce(
      new Error('NEWS_NOT_FOUND')
    );

    const req = {
      params: { id: 'missing' },
    } as any;
    const res = createMockResponse();

    await publicNewsController.detail(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles unexpected errors', async () => {
    mockedGetPublishedNewsById.mockRejectedValueOnce(new Error('boom'));

    const req = {
      params: { id: 'news-1' },
    } as any;
    const res = createMockResponse();

    await publicNewsController.detail(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

