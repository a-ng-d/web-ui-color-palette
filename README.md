![GitHub package.json version](https://img.shields.io/github/package-json/v/a-ng-d/web-ui-color-palette?color=informational) ![GitHub last commit](https://img.shields.io/github/last-commit/a-ng-d/web-ui-color-palette?color=informational) ![GitHub](https://img.shields.io/github/license/a-ng-d/web-ui-color-palette?color=informational) [![Release production version](https://github.com/a-ng-d/web-ui-color-palette/actions/workflows/release.yml/badge.svg)](https://github.com/a-ng-d/web-ui-color-palette/actions/workflows/release.yml) ![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white) ![Worker status](https://img.shields.io/website?url=https%3A%2F%web-uicp.yelbolt.workers.dev&label=status&up_message=online&down_message=offline)

# UI Color Palette Web App

UI Color Palette is a web app that creates consistent and accessible color palettes specifically for UI. It uses alternative color spaces, like `LCH`, `OKLCH`, `CIELAB`, `OKLAB`, and `HSLuv`, to create color shades and tints based on the configured lightness scale. These spaces ensure [WCAG standards](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance and sufficient contrast between information and background color.

This web app will allow you to:
- Create a complete palette from any existing color to help you build a color scaling (or Primitive colors)
- Manage the color palette in real-time to control the contrast
- Sync the color shades/tints with local styles, and variables
- Generate code in various languages
- Publish the palette for reuse across multiple documents or add shared palettes from the community

## Documentation
The full documentation can be consulted on [docs.ui-color-palette.com](https://uicp.ylb.lt/docs).

## Contribution
### Community
Ask questions, submit your ideas or requests on [Canny](https://uicp.ylb.lt/ideas).

### Issues
Have you encountered a bug? Could a feature be improved?
Go to the `Issues` section and browse the existing tickets or create a new one.

### Development
- Clone this repository (or fork it)
- Install dependencies with `npm install`
- Run `npm run dev` to start the Vite dev server
- Run `npm run dev:worker` to build and preview the app through the Cloudflare Worker locally
- Branch off `dev`, then create a `Pull Request` back into `dev`
- _Let's do this_

### Preview
Every branch pushed to GitHub gets its own live deployment automatically, built and deployed by Cloudflare:
- `dev` deploys to [dev.preview.ui-color-palette.com](https://dev.preview.ui-color-palette.com)
- any other branch (including `release/**`) deploys to `<branch-slug>.preview.ui-color-palette.com`
- merging a `release/**` branch into `prod` ships to production at [app.ui-color-palette.com](https://app.ui-color-palette.com)

---

## Attribution
- The colors are managed thanks to the [chroma.js](https://github.com/gka/chroma.js) library by [Gregor Aisch](https://github.com/gka)
- The APCA algorithm is provided thanks to the [apca-w3](https://www.npmjs.com/package/apca-w3) module by [Andrew Somers](https://github.com/Myndex)
- The color names are provided by [color-name](https://github.com/meodai/color-names) by [meodai](https://github.com/meodai/color-names)
- Presets inspired by these organizations and projects: [Ant Design](https://ant.design/docs/spec/colors) | [Bootstrap](https://getbootstrap.com/docs/5.3/customize/color/#all-colors) | [Tailwind CSS](https://tailwindcss.com/docs/colors) | [Material (M3)](https://m3.material.io/styles/color/static/baseline) | [Untitled UI](https://untitledui.com/) | [Open Color](https://yeun.github.io/open-color/) | [Radix](https://www.radix-ui.com/colors) | [Atlassian](https://atlassian.design/foundations/color-new/color-palette-new) | [Shopify Polaris](https://polaris-react.shopify.com/design/colors/palettes-and-roles) | [Uber Base](https://base.uber.com/6d2425e9f/p/797362-color-beta) | [Microsoft Fluent](https://fluent2.microsoft.design/color/) | [IBM Carbon](https://carbondesignsystem.com/elements/color/overview/) | [Adobe Spectrum](https://spectrum.adobe.com/page/color-palette/)

## Support
- [Follow the project LinkedIn page](https://uicp.ylb.lt/network)
- [Support the author](https://uicp.ylb.lt/author)
