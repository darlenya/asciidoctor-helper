import fs from 'fs'
import path from 'path'
import util from 'util'
import assert from 'assert'
import globby from 'globby'
import mkdirp from 'mkdirp'

const copyFile = util.promisify(fs.copyFile)
const md = util.promisify(mkdirp)


/**
 *
 */
export async function copyResources(resourceDefinition) {
  _prepareConfig(resourceDefinition)

  const targetDir = resourceDefinition.targetDir

  // ensure that the target dir does exists
  await md(targetDir)

  for (const resource of resourceDefinition.resources) {
    if (resource.file !== undefined) {
      for (const file of resource.file) {
        await _copySingleFile({
          source: file,
          targetDir,
          startDir: resource.startDir,
        })
      }
    }
    if (resource.pattern !== undefined) {
      // Macht aus den relativen patterns absolute
      const realPattern = []
      for (const pat of resource.pattern) {
        // realPatterns.push(`${startDir}/**/${pat}`)
        let startDir = resource.startDir
        if (!path.isAbsolute(startDir)) {
          startDir = path.join(process.cwd(), startDir)
        }
        realPattern.push(path.join(startDir, '**', pat))
      }

      const files = await globby(realPattern)
      for (const file of files) {
        await _copySingleFile({
          source: file,
          targetDir,
          startDir: resource.startDir,
        })
      }
    }
  }
}

/**
 * Copies a single file. It will ensure that the target directoy will be
 * created if not exists.
 * @param source {string} The absolute or relative source file to be copied.
 * @param startDir {string} The absolute or ralative source startDir. This is used to create the relative target
 * file name.
 * @param targetDir {string} The directory where to copy the files to.
 *
 */
export async function _copySingleFile({ source, targetDir, startDir }) {
  assert.ok(source, `No 'source' parameter given`)
  assert.ok(targetDir, `No 'targetDir' parameter given`)
  assert.ok(startDir, `No 'startDir' parameter given`)

  let srcStart = startDir
  if (!path.isAbsolute(srcStart)) {
    srcStart = path.join(process.cwd(), startDir)
  }

  let src = source
  if (!path.isAbsolute(source)) {
    src = path.join(srcStart, source)
  }

  let destBaseDir = targetDir
  if (!path.isAbsolute(targetDir)) {
    destBaseDir = path.join(process.cwd(), targetDir)
  }

  const relSourceFile = src.replace(srcStart, '')

  const dest = path.join(destBaseDir, relSourceFile)

  const destDir = path.dirname(dest)
  await md(destDir)

  await copyFile(src, dest)
}

/**
 * Validates the given config for copying the resources
 * @param config {object} The configuration
 */
export function _prepareConfig(config) {
  assert.ok(config, `No 'config' Object given`)

  if (config.targetDir === undefined) {
    config.targetDir = '.'
  }

  if (config.resources === undefined) {
    throw new Error(
      `No 'resources' property given in the config for 'copyResources'.`
    )
  }

  if (!Array.isArray(config.resources)) {
    throw new Error(
      `The 'resources' property in the config for 'copyResources' must be an array.`
    )
  }

  for (const resource of config.resources) {
    if (resource.startDir === undefined) {
      resource.startDir = '.'
    }
    if (resource.file === undefined && resource.pattern === undefined) {
      throw new Error(
        `Each resource in the 'resources' property must have either a 'file' or a 'pattern' property`
      )
    }
    if (resource.pattern !== undefined) {
      if (!Array.isArray(resource.pattern)) {
        resource.pattern = [resource.pattern]
      }
    }
    if (resource.file !== undefined) {
      if (!Array.isArray(resource.file)) {
        resource.file = [resource.file]
      }
    }
  }
}
