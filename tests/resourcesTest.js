import fs from 'fs'
import path from 'path'
import util from 'util'
import rimraf from 'rimraf'

import { copyResources } from '../lib/index'
import { _copySingleFile } from '../lib/resources'

const FIXTURES = path.join(__dirname, 'fixtures')
const VOLATILE = path.join(__dirname, 'volatile')

const rm = util.promisify(rimraf)
const fsAccess = util.promisify(fs.access)

beforeAll(async () => {
  await rm(VOLATILE)
})
//
// test('copyResources singleFile', async () => {
//   const exampleResource = {
//     // The directory where to copy the files
//     targetDir: path.join(VOLATILE, 'single', 'image'),
//
//     // all the resources to be copied to the target directory
//     resources: [
//       {
//         file: {
//           source: path.join(FIXTURES, 'foo', 'bar', 'images', 'yourImage.svg'),
//           startDir: path.join(FIXTURES, 'foo', 'bar '),
//         },
//       },
//     ],
//   }
//
//   await copyResources(exampleResource)
// })

test('copyResources multiple files', async () => {
  const resourceDef = {
    targetDir: 'tests/volatile/copyResources',

    resources: [
      {
        pattern: ['*.jpg'],
        startDir: FIXTURES,
      },
      {
        file: 'gum/bo/img/some.png',
        startDir: FIXTURES,
      },
    ],
  }

  await copyResources(resourceDef)

  const expectFile1 = path.join(
    VOLATILE,
    'copyResources',
    'gum/bo/img/',
    'all.jpg'
  )
  const expectFile2 = path.join(
    VOLATILE,
    'copyResources',
    'gum/bo/img/',
    'some.png'
  )
  const expectFile3 = path.join(
    VOLATILE,
    'copyResources',
    'foo/bar/images/',
    'myImage.jpg'
  )

  await expect(fsAccess(expectFile1, fs.constants.F_OK)).resolves.toBe(
    undefined
  )
  await expect(fsAccess(expectFile2, fs.constants.F_OK)).resolves.toBe(
    undefined
  )
  await expect(fsAccess(expectFile3, fs.constants.F_OK)).resolves.toBe(
    undefined
  )
})

test('_copySingleFile relative names', async () => {
  const config = {
    source: 'foo/bar/images/myImage.jpg',
    targetDir: 'tests/volatile/_copySingleFile',
    startDir: 'tests/fixtures',
  }
  await _copySingleFile(config)

  const expectFile = path.join(
    __dirname,
    'volatile/_copySingleFile',
    'foo/bar/images/myImage.jpg'
  )

  await expect(fsAccess(expectFile, fs.constants.F_OK)).resolves.toBe(undefined)
})

test('_copySingleFile: source absolute name', async () => {
  const config = {
    source: path.join(FIXTURES, 'foo/bar/images/yourImage.svg'),
    targetDir: 'tests/volatile/_copySingleFile',
    startDir: 'tests/fixtures',
  }
  await _copySingleFile(config)

  const expectFile = path.join(
    __dirname,
    'volatile/_copySingleFile',
    'foo/bar/images/yourImage.svg'
  )

  await expect(fsAccess(expectFile, fs.constants.F_OK)).resolves.toBe(undefined)
})

test('_copySingleFile: targetDir absolute name', async () => {
  const config = {
    source: 'gum/bo/img/some.png',
    targetDir: path.join(VOLATILE, '_copySingleFile'),
    startDir: 'tests/fixtures',
  }
  await _copySingleFile(config)

  const expectFile = path.join(
    __dirname,
    'volatile/_copySingleFile',
    'gum/bo/img/some.png'
  )

  await expect(fsAccess(expectFile, fs.constants.F_OK)).resolves.toBe(undefined)
})

test('_copySingleFile: startDir absolute name', async () => {
  const config = {
    source: 'gum/bo/img/all.jpg',
    targetDir: 'tests/volatile/_copySingleFile',
    startDir: FIXTURES,
  }
  await _copySingleFile(config)

  const expectFile = path.join(
    __dirname,
    'volatile/_copySingleFile',
    'gum/bo/img/all.jpg'
  )

  await expect(fsAccess(expectFile, fs.constants.F_OK)).resolves.toBe(undefined)
})
