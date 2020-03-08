# Experimental static images for Gatsby

The [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/), combined with the sharp plugin, as an awesome way to automatically resize and optimise your, and serve them on the most performant way. This plugin is a proof of concept for a simpler way to use Gatsby's image processing tools without needing to write GraphQL queries. It is designed for static images such as logos rather than ones loaded dynamically from a CMS.

The normal way to do this now is with `useStaticQuery`:

```js
import React from "react";
import Img from "gatsby-image";

export const Dino = () => {
  const data = useStaticQuery(graphql`
    query LogoQuery {
      file(relativePath: { eq: "trex.png" }) {
        childImageSharp {
          fixed(height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `);

  return <Img fixed={data?.file?.childImageSharp?.fixed} alt="T-Rex" />;
};
```

This component lets you write this instead:

```js
import React from "react";
import { StaticImage as Img } from "gatsby-plugin-static-image";

export const Dino = () => <Img height={100} src="trex.png" alt="T-Rex" />;
```

You can pass in options that match ones passed to the `ImageSharp` query:

```js
import React from "react";
import { StaticImage as Img } from "gatsby-plugin-static-image";

export const Dino = () => (
  <Img
    src="trex.png"
    base64={false}
    fluid
    webP
    grayscale
    maxWidth={200}
    alt="T-Rex"
  />
);
```

...is equivalent to:

```js
import React from "react";
import Img from "gatsby-image";

export const Dino = () => {
  const data = useStaticQuery(graphql`
    query LogoQuery {
      file(relativePath: { eq: "trex.png" }) {
        childImageSharp {
          fluid(maxWidth: 200, grayscale: true) {
            ...GatsbyImageSharpFixed_withWebp_noBase64
          }
        }
      }
    }
  `);

  return <Img fixed={data?.file?.childImageSharp?.fixed} alt="T-Rex" />;
};
```

## How does it work?

When your site is compiled, any references to StaticImage components are extracted and the props are used to generate a static query. This query is written-out to the fragments directory, which is then parsed by Gatsby as usual. The StaticImage component `require`s the data when it is rendered.

### Are there restrictions to how this is used?

You cannot pass variables to the props: they must be literal values. For example, this is forbidden:

```js
//Doesn't work
({ logo }) => <Img src={logo}>
```

...and nor does this:

```js
//Doesn't work
() => {
    const width = 200;
    return <Img src="trex-png" width={width}>
}
```

## Any other caveats?

Currently it doesn't recompile images during `develop`, so you'll need to restart compilation if you add or change the images.

Because of the way `require` works, all image data will be compiled into the bundle, rather that just the ones that you're using, so don't create lots of StaticImages that you're not going to use.

## Should I used this in production?

This is a proof of concept. It may change completely or be abandoned if this turns out to be a fatally flawed approach.

## Installation

```bash
npm install gatsby-plugin-static-image
```

...then add it to your `gatsby-config.js`:

```js
module.exports = {
  //...
  plugins: [
    "gatsby-plugin-static-image"
    //...
  ]
};
```

### API

The only required prop is `src`. The default type is `fixed`.

For now:

```typescript
export interface ImageOptions {
  fixed?: boolean; //Default true
  fluid?: boolean;
  webP?: boolean;
  base64?: boolean; // Default true
  tracedSVG?: boolean;
}

export interface SomeGatsbyImageProps {
  fadeIn?: boolean;
  durationFadeIn?: number;
  title?: string;
  alt?: string;
  className?: string | object;
  critical?: boolean;
  crossOrigin?: string | boolean;
  style?: object;
  imgStyle?: object;
  placeholderStyle?: object;
  placeholderClassName?: string;
  backgroundColor?: string | boolean;
  onLoad?: () => void;
  onError?: (event: Event) => void;
  onStartLoad?: (param: { wasCached: boolean }) => void;
  Tag?: string;
  itemProp?: string;
  loading?: `auto` | `lazy` | `eager`;
  draggable?: boolean;
}

export interface CommonImageProps {
  quality?: number;
  jpegQuality?: number;
  pngQuality?: number;
  webpQuality?: number;
  grayscale?: boolean;
  duotone?: false | { highlight: string; shadow: string };
  toFormat?: "NO_CHANGE" | "JPG" | "PNG" | "WEBP";
  cropFocus?:
    | "CENTER"
    | "NORTH"
    | "NORTHEAST"
    | "EAST"
    | "SOUTHEAST"
    | "SOUTH"
    | "SOUTHWEST"
    | "WEST"
    | "NORTHWEST"
    | "ENTROPY"
    | "ATTENTION";
  pngCompressionSpeed?: number;
  rotate?: number;
}

export interface FluidImageProps extends CommonImageProps {
  fluid?: true;
  fixed?: false;
  maxWidth?: number;
  maxHeight?: number;
  srcSetBreakpoints?: number[];
  fit?: number;
  background?: number;
}

export interface FixedImageProps extends CommonImageProps {
  fixed?: true;
  fluid?: false;
  width?: number;
  height?: number;
}

export type AllProps = ImageOptions &
  FluidImageProps &
  FixedImageProps &
  SomeGatsbyImageProps & { src: string };
```
