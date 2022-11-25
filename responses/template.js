const responses = {
    badRequest: {
        ok: false,
        msg: 'Bad request',
        code: 400,
    },
    badServer: {
        ok: false,
        msg: 'Bad server request',
        code: 500,
    },
    success: {
        ok: true,
        msg: 'Done!',
        code: 200,
    },
};

module.exports = responses;
