import path from "path"

const indexModule = (process.env.MAIN ? path.resolve(process.env.MAIN) : path.join(__dirname, "..", "src")) |> require

/**
 * @type { import("../src") }
 */
const {default: compareDependencies} = indexModule

it("should run for realistic package", () => {
  const oldPkg = {
    dependencies: {
      lodash: "4.17.15",
      eslint: "6.1.0",
      zahl: "2.0.1",
    },
  }
  const newPkg = {
    dependencies: {
      lodash: "4.17.15",
      eslint: "6.3.0",
      "jaid-core": "4.5.2",
    },
  }
  const result = compareDependencies(oldPkg, newPkg)
  expect(result.production.added).toStrictEqual(["jaid-core"])
  expect(result.production.removed).toStrictEqual(["zahl"])
  expect(result.production.upgraded[0].name).toStrictEqual("eslint")
  expect(result.production.upgraded[0].oldRange.version).toMatchObject({
    major: 6,
    minor: 1,
    patch: 0,
  })
  expect(result.production.upgraded[0].newRange.version).toMatchObject({
    major: 6,
    minor: 3,
    patch: 0,
  })
})

it("should run for detailed package", () => {
  const oldPkg = {
    dependencies: {
      a: "1.2.3", // Removed
      c: "1.2.3",
      d: "1.2.3",
      e: "1.2.3",
      f: "^1.2.3",
      g: "1.2.3",
      h: "^1.2.3",
    },
  }
  const newPkg = {
    dependencies: {
      b: "1.2.3", // Added
      c: "1.2.3", // Equal
      d: "2.3.4", // Upgraded
      e: "1.2.0", // Downgraded
      f: "1.2.3", // Locked
      g: "^1.2.3", // Unlocked
    },
    peerDependencies: {
      h: "^1.2.3", // Moved
    },
  }
  const result = compareDependencies(oldPkg, newPkg)
  expect(result.production.added).toStrictEqual(["b"])
  expect(result.production.removed).toStrictEqual(["a", "h"])
  expect(result.production.upgraded.length).toBe(1)
  expect(result.production.upgraded[0].name).toBe("d")
  expect(result.production.downgraded.length).toBe(1)
  expect(result.production.downgraded[0].name).toBe("e")
  expect(result.production.locked.length).toBe(1)
  expect(result.production.locked[0].name).toBe("f")
  expect(result.production.unlocked.length).toBe(1)
  expect(result.production.unlocked[0].name).toBe("g")
  expect(result.peer.moved.length).toBe(1)
  expect(result.peer.moved[0]).toStrictEqual({
    name: "h",
    newType: "peer",
    oldTypes: ["production"],
  })
})