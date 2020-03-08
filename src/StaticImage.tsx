import React from "react";
import { hashFromProps, splitProps, AllProps } from "./utils";
import Image, { FluidObject, FixedObject } from "gatsby-image";

export const dataForProps = (
    props: AllProps
): { fluid: FluidObject } | { fixed: FixedObject } => {
    const hash = hashFromProps(props);

    // Don't change the syntax here
    // eslint-disable-next-line
    const { imageData } = require(process.env.PUBLIC_DIR + "/../.cache/fragments/gatsby-plugin-static-image/StaticImage" + hash + ".js");
    return imageData?.staticImage?.childImageSharp;
};

export const StaticImage: React.FC<AllProps> = props => {
    const data = dataForProps(props);

    if (!data) {
        return null;
    }
    const { gatsbyImageProps } = splitProps(props);

    return <Image {...gatsbyImageProps} {...data} />;
};
