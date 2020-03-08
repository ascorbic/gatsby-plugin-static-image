import traverse from "@babel/traverse";
import { babelParseToAst } from "./babel-parse-to-ast";
import { getLiteralPropValue } from "jsx-ast-utils";
import fs from "fs-extra";
import { AllProps } from "./utils";

export const extractStaticImageProps = (text: string, path: string) => {
    const ast: babel.types.File = babelParseToAst(text, path);
    const componentImport = `StaticImage`;
    let localName = componentImport;

    const images: AllProps[] = [];

    if (!ast) {
        return images;
    }
    traverse(ast, {
        ImportSpecifier(path) {
            if (path.node.imported.name === componentImport) {
                localName = path.node.local.name;
            }
        },
        JSXOpeningElement(path) {
            const { name } = path.node;
            if (
                name.type === `JSXMemberExpression` ||
                name.name !== localName
            ) {
                return;
            }
            const props = path.node.attributes.reduce((prev, next) => {
                if (
                    next.type === "JSXSpreadAttribute" ||
                    typeof next.name.name !== "string"
                ) {
                    return prev;
                }
                prev[next.name.name] = getLiteralPropValue(next);
                return prev;
            }, {} as Record<string, unknown>);
            images.push((props as unknown) as AllProps);
        }
    });
    return images;
};

export const extractImagesFromFile = async (filename: string) => {
    const contents = await fs.readFile(filename, `utf8`);

    if (!contents.includes("StaticImage")) {
        return [];
    }

    return extractStaticImageProps(contents, filename);
};
