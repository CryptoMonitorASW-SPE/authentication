import { expect } from 'chai'

describe('HelloWorld Test Suite', () => {
  it('should return correct greeting', () => {
    const greeting = 'Hello World!'
    expect(greeting).to.equal('Hello World!')
  })
})
