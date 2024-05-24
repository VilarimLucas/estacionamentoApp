const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Número de CPUs é ${totalCPUs}`);
    console.log(`Master ${process.pid} está rodando`);

    // Cria workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} morreu`);
        cluster.fork(); // Reinicia um novo worker quando um morre
    });
} else {
    // Código para os Workers
    const express = require('express');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const helmet = require('helmet');
    const morgan = require('morgan');

    const app = express();
    const port = 8081;

    // Importações de controladores
    const proprietario = require('./controllers/ProprietarioControlls.js');
    const veiculo = require('./controllers/VeiculoControlls.js');

    // Middlewares
    // 1. Helmet para ajudar a proteger sua aplicação configurando vários cabeçalhos HTTP
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    // 2. Morgan para logging de requisições HTTP no console
    app.use(morgan('tiny'));

    // 3. CORS para permitir que sua API aceite requisições de diferentes origens
    app.use(cors());

    // 4. bodyParser.json() para parsing de JSON no corpo das requisições
    app.use(bodyParser.json());

    // Rotas
    app.get('/', (req, res) => res.send('Serviço ativo!'));

    // Rota para Proprietário
    app.use('/proprietario', proprietario);

    // Rota para Veículo
    app.use('/veiculo', veiculo);

    // Iniciando o servidor em cada Worker
    app.listen(port, () => console.log(`Worker ${process.pid} iniciado na porta ${port}`));
}
