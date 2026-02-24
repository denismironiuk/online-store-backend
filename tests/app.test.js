const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); 

// Мокаем Redis (чтобы трекер онлайна не сломал тесты)
jest.mock('redis', () => require('redis-mock'));
// Мокаем твой файл utils/redis, если он где-то используется напрямую
jest.mock('../utils/redis', () => ({})); 

let mongoServer;

// 1. ПЕРЕД ВСЕМИ ТЕСТАМИ: Поднимаем фейковую Монгу в памяти
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// 2. ПОСЛЕ ВСЕХ ТЕСТОВ: Убиваем базу и закрываем соединения
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// 3. САМИ ТЕСТЫ
describe('Общее тестирование API (Integration)', () => {
  
  it('должен возвращать статус 404 для несуществующих роутов', async () => {
    const response = await request(app).get('/api/some-fake-route');
    expect(response.statusCode).toBe(404);
  });

  it('должен содержать правильные CORS заголовки', async () => {
    // Делаем OPTIONS запрос (Preflight), чтобы проверить заголовки
    const response = await request(app).options('/api/products'); // подставь любой свой роут
    
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
  });

  // Если у тебя есть метрики от Prometheus, проверим их!
  it('GET /metrics должен отдавать данные для Prometheus', async () => {
    const response = await request(app).get('/metrics');
    // Обычно метрики возвращают 200, если роут настроен правильно
    expect(response.statusCode).toBe(200);
  });

});