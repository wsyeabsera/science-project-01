import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/three.ts", "src/cesium.ts"],
  format: ["esm", "cjs"],
  dts: true,
  tsconfig: "tsconfig.tsup.json",
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "three", "cesium", "@react-three/fiber", "@react-three/drei"],
  treeshake: true,
});
