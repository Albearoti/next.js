/* eslint-env jest */

import { join } from 'path'
import { nextTestSetup } from 'e2e-utils'
import { readFileSync, writeFileSync } from 'fs'
import * as os from 'os'

describe('TypeScript Features', () => {
  describe.each([
    [
      { label: '', testBaseUrl: true },
      { label: ' without baseUrl', testBaseUrl: false },
    ],
  ])('default behavior$label', ({ testBaseUrl }) => {
    const tsConfigPath = join(__dirname, '../../../tsconfig.json')
    let previousTsConfigJson: string | null = null
    beforeAll(() => {
      if (testBaseUrl) {
        // Store the original tsconfig.json content
        previousTsConfigJson = readFileSync(tsConfigPath, 'utf-8')
        const tsconfig = JSON.parse(previousTsConfigJson)

        delete tsconfig.baseUrl
        tsconfig.compilerOptions.paths = {
          'isomorphic-unfetch': ['./packages/www/types/unfetch.d.ts'],
          '@c/*': ['./packages/www/components/*'],
          '@lib/*': ['./packages/lib/a/*', './packages/lib/b/*'],
          '@mycomponent': ['./packages/www/components/hello.tsx'],
          'd-ts-alias': [
            './packages/www/components/alias-to-d-ts.d.ts',
            './packages/www/components/alias-to-d-ts.tsx',
          ],
        }
        writeFileSync(tsConfigPath, JSON.stringify(tsconfig, null, 2) + os.EOL)
      }
    })

    afterAll(() => {
      if (previousTsConfigJson !== null) {
        writeFileSync(tsConfigPath, previousTsConfigJson)
      }
    })

    const { next } = nextTestSetup({
      skipDeployment: true,
      dependencies: testBaseUrl
        ? {
            typescript: '5.9.3',
          }
        : undefined,
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
