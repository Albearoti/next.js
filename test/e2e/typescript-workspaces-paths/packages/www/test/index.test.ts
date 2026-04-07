/* eslint-env jest */

import { join } from 'path'
import { nextTestSetup } from 'e2e-utils'

describe('TypeScript Features', () => {
  describe('default behavior', () => {
    const { next } = nextTestSetup({
      skipDeployment: true,
      files: join(__dirname, '../../../'),
      subDir: 'packages/www',
    })

    it('should alias components', async () => {
      const $ = await next.render$('/basic-alias')
      expect($('body').text()).toMatch(/World/)
    })

    it('should resolve the first item in the array first', async () => {
      const $ = await next.render$('/resolve-order')
      expect($('body').text()).toMatch(/Hello from a/)
    })

    it('should resolve the second item in as a fallback', async () => {
      const $ = await next.render$('/resolve-fallback')
      expect($('body').text()).toMatch(/Hello from only b/)
    })

    it('should resolve a single matching alias', async () => {
      const $ = await next.render$('/single-alias')
      expect($('body').text()).toMatch(/Hello/)
    })

    it('should not resolve to .d.ts files', async () => {
      const $ = await next.render$('/alias-to-d-ts')
      expect($('body').text()).toMatch(/Not aliased to d\.ts file/)
    })
  })
})
