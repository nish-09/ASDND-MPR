process.env.DATABASE_URL = 'postgresql://eventbook:eventbook@localhost:5432/eventbook';
process.env.TEST_DATABASE_URL = 'postgresql://eventbook:eventbook@localhost:5432/eventbook_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test-secret-that-is-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-that-is-at-least-32-chars-long';
process.env.CORS_ORIGIN = 'http://localhost:8080';
process.env.NODE_ENV = 'test';
