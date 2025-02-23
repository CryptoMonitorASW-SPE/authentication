import { filesOfProject } from 'tsarch'
import { expect } from 'chai'

describe('Authentication Architecture Tests', () => {
  // Test 1: the domain should not depend on infrastructure
  it('domain should not depend on infrastructure', async () => {
    const rule = filesOfProject()
      .inFolder('src/domain')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/infrastructure')

    const result = await rule.check()
    expect(result).to.have.lengthOf(0)
  })

  // Test 2: the domain should not depend on application
  it('domain should not depend on application', async () => {
    const rule = filesOfProject()
      .inFolder('src/domain')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/application')

    const result = await rule.check()
    expect(result).to.have.lengthOf(0)
  })

  // Test 3: the application should not depend on infrastructure
  it('application should not depend on infrastructure', async () => {
    const rule = filesOfProject()
      .inFolder('src/application')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/infrastructure')

    const result = await rule.check()
    expect(result).to.have.lengthOf(0)
  })

  // Test 4: the infrastructure should depend on application through interfaces
  it('infrastructure should depend on application through interfaces', async () => {
    const rule = filesOfProject()
      .inFolder('src/infrastructure')
      .should()
      .dependOnFiles()
      .inFolder('src/application')

    const result = await rule.check()
    expect(result).to.have.length.above(0)
  })

  // Test 5: the infrastructure should depend on domain through interfaces
  it('infrastructure should depend on domain through interfaces', async () => {
    const rule = filesOfProject()
      .inFolder('src/infrastructure')
      .should()
      .dependOnFiles()
      .inFolder('src/domain')

    const result = await rule.check()
    expect(result).to.have.length.above(0)
  })
})
