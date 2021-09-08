import nock from 'nock'
import { unfurl } from '../../src/'

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

