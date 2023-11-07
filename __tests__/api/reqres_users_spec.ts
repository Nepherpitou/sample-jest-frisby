import frisby, { setup } from 'frisby';

// Этот код будет выполнен перед всеми тестами
beforeAll(async () => {
  console.log('Тут можно вывести сообщение или выполнить аутентификацию реальным запросом в API');
  // Начальная настройка. Тут можно указать заголовки аутентификации для запросов
  frisby.globalSetup({
    request: {
      headers: {
        Authorization: 'JWT Foo.Bar.Buzz',
      },
    },
  });
});

it('Test first page is not emty', async function () {
  await frisby
    .get('https://reqres.in/api/users?page=1')
    // Проверяем статус ответа == 200
    .expect('status', 200)
    // В ответе есть { ..., "page": 1 }
    .expect('json', 'page', 1)
    // Тут jsonTypes указывает на проверку структуры, а не значений. Используется json-path для указания проверяемых узлов
    // В ответе есть { ..., "data": [...] } и это массив чего-угодно
    .expect('jsonTypes', 'data', frisby.Joi.array())
    // promise() делает "магию" и нужен чтобы дождаться выполнения теста до выхода из него
    .promise();
});

it('Test page users has ID', async function () {
  await frisby
    .get('https://reqres.in/api/users?page=1')
    .expect('status', 200)
    // data.*.id - JSON-path нотация.
    // data - есть путь { "data": ... }
    // data.* - data - это массив и проверка применяется к каждому элементу
    // data.*.id - проверяется свойство id каждого элемента массива data
    .expect('jsonTypes', 'data.*.id', frisby.Joi.number().positive())
    .promise();
});

it('Test there are more than 2 pages', async function () {
  // Можно написать тупой код с любыми циклами
  for (let page = 1; page < 5; page++) {
    await frisby
      // И проверить каждую страницу
      .get(`https://reqres.in/api/users?page=${page}`)
      .expect('status', 200)
      .expect('jsonTypes', 'data', frisby.Joi.array().required())
      .promise();
  }
});
