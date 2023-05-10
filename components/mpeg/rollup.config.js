import babel from "@rollup/plugin-babel";
import { append, prepend } from "rollup-plugin-insert";
import { terser } from "rollup-plugin-terser";

// @babel/core  @babel/preset-env @rollup/plugin-babel "rollup rollup-plugin-insert rollup-plugin-terser

// git clone https://github.com/phoboslab/jsmpeg/tree/924acfbd96fdf15e6748d1368a36d79d8f4cecf6 deps/jsmpeg
const gitSubmodules = `[submodule "packages/mpeg/deps/jsmpeg"]
	path = packages/mpeg/deps/jsmpeg
	url = git@github.com:phoboslab/jsmpeg.git`;

const jsmpegDeclarationTypeScript = `export class Surface {}

export namespace Renderer {
  export class Canvas2D extends Surface {
    canvas: HTMLCanvasElement
    context?: CanvasRenderingContext2D

    constructor(options: {
      width: number
      height: number
      canvas?: HTMLCanvasElement
    })
  }
}

export namespace Decoder {
  export class MPEG1Video {
    constructor(options: { onVideoDecode?: () => void })
    connect(surface: Surface): void
    write(time: number, buffers: Uint8Array[]): void
  }
}`;


export default { // Todo use the source correctly
  input: 'deps/jsmpeg/jsmpeg.min.js',
  output: { file: 'jsmpeg.js', format: "esm", sourcemap: true,  },
  plugins: [
    prepend('var document = typeof document === "undefined" ? { addEventListener: function() {} } : document;'),
    prepend('var window = self;'),
    append('export default JSMpeg;'),
    babel({ babelHelpers: "bundled",
      presets: [["@babel/preset-env",  { targets: { esmodules: true } }]],
    }),
    terser(),
  ],
}
