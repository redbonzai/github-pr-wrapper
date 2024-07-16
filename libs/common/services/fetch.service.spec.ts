import { fetchData } from './fetch.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('fetchData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should make a GET request and return data', async () => {
    const mockResponse = { data: 'mockData' };
    const fetchDataSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchData('http://example.com', 'GET');

    expect(fetchDataSpy).toHaveBeenCalledWith('http://example.com', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should make a POST request with data and return data', async () => {
    const mockResponse = { data: 'mockData' };
    const fetchDataSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const postData = { key: 'value' };
    const result = await fetchData(
      'http://example.com',
      'POST',
      { 'Content-Type': 'application/json' },
      postData,
    );

    expect(fetchDataSpy).toHaveBeenCalledWith('http://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(postData),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error for a failed request', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    } as Response);

    await expect(fetchData('http://example.com', 'GET')).rejects.toThrow(
      'HTTP error! Status: 500, Body: {"message":"Internal Server Error"}',
    );
  });
});
