/** @module compare-dependencies */

import dependencyTypes from "lib/dependencyTypes"
import {intersection, difference} from "lodash"
import {SemverRange} from "sver"

import DependencyHolder from "./DependencyHolder"

/**
 * @typedef {Object} PkgWithDependencies
 * @prop {Object<string, string>} dependencies
 * @prop {Object<string, string>} devDependencies
 * @prop {Object<string, string>} peerDependencies
 * @prop {Object<string, string>} optionalDependencies
 * @prop {Object<string, string>} bundleDependencies
 * @prop {Object<string, string>} bundledDependencies
 */

/**
 * @typedef {Object} MoveEvent
 * @prop {string} name
 * @prop {string} oldType
 * @prop {string} newType
 */

/**
 * @typedef {Object} LockEvent
 * @prop {string} name
 * @prop {import("sver").SemverRange} oldRange
 * @prop {import("sver").SemverRange} newRange
 */

/**
 * @typedef {Object} UnlockEvent
 * @prop {string} name
 * @prop {import("sver").SemverRange} oldRange
 * @prop {import("sver").SemverRange} newRange
 */

/**
 * @typedef {Object} UpgradeEvent
 * @prop {string} name
 * @prop {import("sver").SemverRange} oldRange
 * @prop {import("sver").SemverRange} newRange
 */

/**
 * @typedef {Object} DowngradeEvent
 * @prop {string} name
 * @prop {import("sver").SemverRange} oldRange
 * @prop {import("sver").SemverRange} newRange
 */

/**
 * @typedef {Object} TypeChanges
 * @prop {string[]} added
 * @prop {string[]} removed
 * @prop {UpgradeEvent[]} upgraded
 * @prop {DowngradeEvent[]} downgraded
 * @prop {UnlockEvent[]} unlocked
 * @prop {LockEvent[]} locked
 * @prop {MoveEvent} moved
 */

/**
 * @typedef {Object} Changes
 * @prop {TypeChanges} production
 * @prop {TypeChanges} peer
 * @prop {TypeChanges} bundled
 * @prop {TypeChanges} development
 * @prop {TypeChanges} optional
 */

/**
 * @param {PkgWithDependencies} oldPkg
 * @param {PkgWithDependencies} newPkg
 * @returns {Changes}
 */
export default (oldPkg, newPkg) => {
  const oldDependencies = new DependencyHolder(oldPkg)
  const newDependencies = new DependencyHolder(newPkg)
  const allChanges = {}
  for (const [type, {key, title}] of Object.entries(dependencyTypes)) {
    const oldDependencyNames = oldDependencies.getDependencyNamesForType(type)
    const newDependencyNames = newDependencies.getDependencyNamesForType(type)
    const addedDependencyNames = difference(newDependencyNames, oldDependencyNames)
    const removedDependencyNames = difference(oldDependencyNames, newDependencyNames)
    const changes = {
      added: addedDependencyNames.filter(name => !oldDependencies.hasDependency(name)),
      removed: removedDependencyNames.filter(name => oldDependencies.hasDependency(name)),
      upgraded: [],
      downgraded: [],
      locked: [],
      unlocked: [],
      moved: [],
    }
    for (const name of addedDependencyNames.filter(name => oldDependencies.hasDependency(name))) {
      changes.moved.push({
        name,
        newType: type,
        oldTypes: oldDependencies.getTypesForDependencyName(name),
      })
    }
    const intersectionDependencyNames = intersection(oldDependencyNames, newDependencyNames)
    for (const name of intersectionDependencyNames) {
      const oldRange = new SemverRange(oldDependencies.getDependenciesForType(type)[name])
      const newRange = new SemverRange(newDependencies.getDependenciesForType(type)[name])
      if (oldRange.eq(newRange)) {
        continue
      }
      if (oldRange.isExact && !newRange.isExact) {
        changes.unlocked.push({
          name,
          oldRange,
          newRange,
        })
        continue
      }
      if (!oldRange.isExact && newRange.isExact) {
        changes.locked.push({
          name,
          oldRange,
          newRange,
        })
        continue
      }
      if (newRange.gt(oldRange)) {
        changes.upgraded.push({
          name,
          oldRange,
          newRange,
        })
        continue
      }
      if (oldRange.gt(newRange)) {
        changes.downgraded.push({
          name,
          oldRange,
          newRange,
        })
        continue
      }
    }
    allChanges[type] = changes
  }
  return allChanges
}