import {
    queryfromProps,
    hashFromQuery,
    makeFragmentFile,
    AllProps
} from "./utils";
import fs from "fs-extra";

export const saveFragmentForProps = async (
    props: AllProps,
    fragmentDir: string
) => {
    const query = queryfromProps(props);
    const hash = hashFromQuery(query);
    const filename = `${fragmentDir}/StaticImage${hash}.js`;
    return fs.writeFile(filename, makeFragmentFile(query));
};
