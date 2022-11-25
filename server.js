require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const faceitRequest = require('./service/faceitRequest');
const resps = require('./responses/template');

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/stats', (req, res) => {
    const { playerid } = req.query;

    if (playerid) {
        const buildQuery = `/players/${playerid}/stats/csgo`;

        faceitRequest('get', buildQuery)
            .then((data) => {
                if (data.ok) {
                    res.status(200).json({ ...resps.success, data: data.data });
                } else {
                    res.status(404).json({
                        ...resps.badRequest,
                        msg: data.tree.message,
                        code: 404,
                    });
                }
            }) // Service provides with proper response template
            .catch((e) =>
                res.status(500).json({ ...resps.badServer, tree: e }),
            );
    } else {
        res.status(400).json({
            ...resps.badRequest,
            msg: 'You must provide a playerid query (?playerid={id})',
        });
    }
});

app.get('/players', (req, res) => {
    const { nickname, player_id } = req.query;

    if (nickname || player_id) {
        const buildQuery = () => {
            if (nickname) {
                return `/search/players?nickname=${nickname.trim()}`;
            } else {
                return `/players/${player_id}`;
            }
        };

        faceitRequest('get', buildQuery())
            .then((data) => {
                if (data.ok) {
                    res.status(200).json({ ...resps.success, data: data.data });
                } else {
                    res.status(404).json({
                        ...resps.badRequest,
                        msg: data.tree.message,
                        code: 404,
                    });
                }
            }) // Service provides with proper response template
            .catch((e) =>
                res.status(500).json({ ...resps.badServer, tree: e }),
            );
    } else {
        res.status(400).json({
            ...resps.badRequest,
            msg: 'You must provide a nickname query (?nickname={nickname})',
        });
    }
});

app.post('/players', async (req, res) => {
    const { players } = req.body;

    if (players && players.length > 0) {
        let dataFromFaceit = [];

        for (let i = 0; i < players.length; i++) {
            try {
                const response = await faceitRequest(
                    'get',
                    '/players/' + players[i],
                );

                if (response.ok) {
                    dataFromFaceit.push(response.data);
                } else {
                    return res.status(404).json({
                        ...resps.badRequest,
                        code: 404,
                        msg: response.tree.response.message,
                    });
                }
            } catch (error) {
                return res
                    .status(500)
                    .json({ ...resps.badServer, tree: error });
            }
        }

        return res.status(200).json({
            ...resps.success,
            data: dataFromFaceit,
        });
    } else {
        return res.status(400).json({
            ...resps.badRequest,
            msg: 'You must provide a nickname query (?nickname={nickname})',
        });
    }
});

app.get('/gamestats', async (req, res) => {
    const { game, playerid } = req.query;

    if (game && playerid) {
        const pathConstructor = `/players/${playerid}/stats/${game}`;
        try {
            const response = await faceitRequest('get', pathConstructor);
            res.status(200).json({ ...resps.success, data: response.data });
        } catch (error) {
            res.status(404).json({ ...resps.badRequest, msg: 'not found' });
        }
    } else {
        res.status(400).json({
            ...resps.badRequest,
            msg: 'missing playerid or gameid - /gamestats?game={gameid}&playerid={playerid}',
        });
    }
});

app.use('*', (req, res) => {
    res.status(404).json({
        ...resps.badRequest,
        msg: 'Available paths: GET /players, GET /stats',
    });
});

app.listen(port, () => {
    console.log('='.repeat(30));
    console.log('Server running at port: ' + port);
    console.log('='.repeat(30));
});
