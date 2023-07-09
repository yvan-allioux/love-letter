const request = require('supertest');

describe('API integration tests', () => {
  const api = 'http://server'; // Utilisez le nom du service Docker de votre API

  it('should return 2 when accessing /carte/4/number', async () => {
    const res = await request(api).get('/carte/4/number');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBe(2);
  });

  it('should return correct description when accessing /carte/4/description', async () => {
    const res = await request(api).get('/carte/4/description');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBe('Vous ne pouvez pas être ciblé par les autres joueurs jusqu\'au début de votre prochain tour.');
  });

  it('should return correct card object when accessing /carte/4', async () => {
    const res = await request(api).get('/carte/4');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      name: 'Servante',
      power: 4,
      number: 2,
      description: 'Vous ne pouvez pas être ciblé par les autres joueurs jusqu\'au début de votre prochain tour.'
    });
  });

  // ajoutez d'autres tests ici
});
