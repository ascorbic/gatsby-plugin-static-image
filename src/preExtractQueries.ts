import path from "path";
import glob from "glob";
import normalize from "normalize-path";
import { GatsbyNode } from "gatsby";
import { extractImagesFromFile } from "./parser";
import { saveFragmentForProps } from "./write";
import fs from "fs-extra";

export const onPreExtractQueries: GatsbyNode["onPreExtractQueries"] = async ({
    store
}) => {
    const filesRegex = `*.+(tsx|js?(x))`;

    const pathRegex = `/{${filesRegex},!(node_modules)/**/${filesRegex}}`;

    const root = store.getState().program.directory;

    const srcDir = path.join(root, "src");

    const fragmentDir = path.join(
        root,
        ".cache",
        "fragments",
        "gatsby-plugin-static-image"
    );

    await fs.emptyDir(fragmentDir);

    const files = [
        ...new Set(
            glob
                .sync(path.join(srcDir, pathRegex), {
                    nodir: true
                })
                .map(path => normalize(path))
        )
    ];

    const results = files.map(async file =>
        Promise.all(
            (await extractImagesFromFile(file)).map(props =>
                saveFragmentForProps(props, fragmentDir)
            )
        )
    );

    return Promise.all(results);
};
