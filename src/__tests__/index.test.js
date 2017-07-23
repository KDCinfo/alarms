/*
    I know nothing about testing, and have no idea if
    including all the code as I have below is correct
    or not (as it's done in the main [index.js] file).

    But... the below passed the 2 core tests:
        // Do snapshots align and measure up?
        // Plain and simple --> Does it load?
*/
import React from 'react'
import ReactDOM from 'react-dom'
import renderer from 'react-test-renderer'

// The tests included below, although they do pass, are incomplete
// and meant only to serve as a base for testing (PRs are welcome)

    // Tests Include:
    // Jest Snapshots
    // Does it Crash?

// This article is a good resource for component testing
// https://www.sitepoint.com/test-react-components-jest/

// Using LocalStorage with Testing
    // (with larger projects I'd add this as middleware instead of
    // mocking it (not that I know anything about middleware, but
    // it is working with Testing in my previous React project.))

    class LocalStorageMock {
      constructor() { this.store = {} }
      clear() { this.store = {} }
      getItem(key) { return this.store[key] || null }
      setItem(key, value) { this.store[key] = value }
      removeItem(key) { delete this.store[key] }
    }
    global.localStorage = new LocalStorageMock

// [describe] Optional - For logical grouping

// Can wrap Tests in either [test] or [it]

import TimerBox from '../App'

describe('TimerBox:', () => {

    test('Jest Snapshot', () => {
        const component = renderer.create(
            <TimerBox />
        )
        let tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })

    it('renders without crashing', () => {
        const div = document.createElement('div')
        ReactDOM.render(<TimerBox />, div)
    })
})
