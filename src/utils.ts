import murmurhash from "babel-plugin-remove-graphql-queries/murmur";

import {
    removeDefaultValues,
    healOptions,
    getPluginOptions
} from "gatsby-plugin-sharp/plugin-options";

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

export type ImageProps = FluidImageProps | FixedImageProps;
export type AnyImageProps = (FluidImageProps | FixedImageProps) &
    CommonImageProps;

export type AllProps = ImageOptions &
    FluidImageProps &
    FixedImageProps &
    SomeGatsbyImageProps & { src: string };

export interface ImageOptions {
    webP?: boolean;
    base64?: boolean;
    tracedSVG?: boolean;
}

export const splitProps = (
    props: AllProps
): {
    commonOptions: CommonImageProps;
    fluidOptions: FluidImageProps;
    fixedOptions: FixedImageProps;
    isFluid: boolean;
    isFixed: boolean;
    imageOptions: ImageOptions;
    gatsbyImageProps: SomeGatsbyImageProps;
    src: string;
} => {
    const {
        fluid,
        fixed,
        quality,
        jpegQuality,
        pngQuality,
        webpQuality,
        grayscale,
        duotone,
        toFormat,
        cropFocus,
        pngCompressionSpeed,
        maxWidth,
        maxHeight,
        srcSetBreakpoints,
        fit,
        background,
        width,
        height,
        webP,
        base64,
        tracedSVG,
        src,
        ...gatsbyImageProps
    } = props;

    const isFixed = fixed ?? true;
    const isFluid = isFixed ?? !fluid;

    const commonOptions: CommonImageProps = {
        quality,
        jpegQuality,
        pngQuality,
        webpQuality,
        grayscale,
        duotone,
        toFormat,
        cropFocus,
        pngCompressionSpeed
    };

    const fluidOptions: FluidImageProps = {
        fluid: isFluid,
        maxWidth,
        maxHeight,
        srcSetBreakpoints,
        fit,
        background
    };

    const imageOptions: ImageOptions = {
        webP,
        base64,
        tracedSVG
    };

    const fixedOptions: FixedImageProps = { fixed: isFixed, width, height };

    return {
        src,
        commonOptions,
        fluidOptions,
        fixedOptions,
        isFluid,
        isFixed,
        imageOptions,
        gatsbyImageProps
    };
};

const quoteValue = (key: string, value: unknown) =>
    ["toFormat", "cropFocus"].includes(key)
        ? (value as string).toString().toUpperCase()
        : JSON.stringify(value);

const optionsFromProps = (props: AnyImageProps) =>
    (Object.keys(props) as Array<keyof AnyImageProps>)
        .map(key => `${key}: ${quoteValue(key, props[key])}`)
        .join(", ");

const imageFragmentFromProps = ({
    webP,
    base64 = true,
    tracedSVG
}: ImageOptions) => {
    const parts = [];
    if (webP) {
        parts.push("_withWebp");
    }
    if (tracedSVG) {
        parts.push("_tracedSVG");
    } else if (!base64) {
        parts.push("_noBase64");
    }
    return parts.join("");
};

const fluidFragment = (
    props: FluidImageProps & CommonImageProps,
    options: ImageOptions
) => `            
fluid(${optionsFromProps(props)}) {
    ...GatsbyImageSharpFluid${imageFragmentFromProps(options)}
}
`;

const fixedFragment = (
    props: FixedImageProps & CommonImageProps,
    options: ImageOptions
) => `            
fixed(${optionsFromProps(props)}) {
    ...GatsbyImageSharpFixed${imageFragmentFromProps(options)}
}
`;

export const queryfromProps = ({ fixed, fluid, ...props }: AllProps) => {
    if (!props.src) {
        throw new Error("Missing 'src' prop");
    }

    const ext = (props.src as string).split(".").pop();

    const { nodeType = "file", toFormat: format, ...options } = healOptions(
        getPluginOptions(),
        props,
        ext
    );

    if (format !== ext) {
        options.toFormat = ext;
    }

    const {
        isFluid,
        commonOptions,
        fixedOptions,
        fluidOptions,
        imageOptions
    } = splitProps(options);

    const fragment = isFluid
        ? fluidFragment(
              removeDefaultValues({ ...fluidOptions, ...commonOptions }, {}),
              imageOptions
          )
        : fixedFragment(
              removeDefaultValues({ ...fixedOptions, ...commonOptions }, {}),
              imageOptions
          );

    return `
query {
    staticImage: ${nodeType}(relativePath: { eq: "${props.src}" }) {
        childImageSharp {
            ${fragment}
        }
    }
}
`;
};

export const hashFromQuery = (query: string) => murmurhash(query, `abc`);

export const hashFromProps = (props: AllProps) =>
    hashFromQuery(queryfromProps(props));

export const makeFragmentFile = (
    query: string
) => `import { useStaticQuery, graphql } from "gatsby"
export const imageData = useStaticQuery(graphql\`${query}\`);
`;
