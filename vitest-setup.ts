import 'reflect-metadata';
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  console.log('Global setup before all tests');
});

afterAll(() => {
  console.log('Global teardown after all tests');
});
