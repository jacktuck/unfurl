import fs from 'fs'
import http from 'http'
import iconv from 'iconv-lite'

import nock from 'nock'

import { unfurl } from '../../src/'
import UnexpectedError from '../../src/unexpectedError'

test('should not throw when provided non-ascii url', async () => {
    expect.assertions(1)

    nock('http://localhost')
        .get(/.*/)
        .reply(200, '', { 
            'Content-Type': 'text/html' 
        })

    let err
    try {
        await unfurl('http://localhost/日本語urlってどうよ')
    } catch (e) {
        err = e
    } finally {
        expect(err).not.toBeDefined()
    }
})

