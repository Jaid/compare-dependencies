/** @module compare-dependencies */

import dependencyTypes from "./dependencyTypes.yml"

/**
 * @typedef {Object} DependencyComparison
 */

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
 * @param {number} [compareValue]
 * @returns {number} Seconds passed since Unix epoch (01 January 1970)
 */
export default (oldPkg, newPkg) => {

}