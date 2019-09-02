import ensureArray from "ensure-array"
import hasContent from "has-content"
import {isObject} from "lodash"
import dependencyTypes from "lib/dependencyTypes"

/**
 * @class
 */
export default class DependencyHolder {

  constructor(pkg) {
    this.dependencies = {}
    this.dependencyNames = new Set
    for (const [type, {key, title}] of Object.entries(dependencyTypes)) {
      const foundDependencies = {}
      for (const pkgKey of ensureArray(key)) {
        const pkgDependencies = pkg[pkgKey]
        if (!isObject(pkgDependencies)) {
          continue
        }
        if (!hasContent(pkgDependencies)) {
          continue
        }
        Object.assign(foundDependencies, pkgDependencies)
        for (const pkgDependency of Object.keys(pkgDependencies)) {
          this.dependencyNames.add(pkgDependency)
        }
      }
      this.dependencies[type] = foundDependencies
    }
  }

  getDependenciesForType(typeName) {
    return this.dependencies[typeName]
  }

  getDependencyNamesForType(typeName) {
    return Object.keys(this.dependencies[typeName])
  }

  getDependencyNames() {
    return this.dependencyNames
  }

  hasDependency(name) {
    return this.dependencyNames.has(name)
  }

  getTypesForDependencyName(name) {
    const foundTypes = []
    for (const type of Object.keys(dependencyTypes)) {
      if (this.dependencies[type][name]) {
        foundTypes.push(type)
      }
    }
    return foundTypes
  }

}