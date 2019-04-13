const FIRST = /^[^]/;
const SPACES = /\s+([\S])/g;
const CAMELS = /[a-z]([A-Z])/g;
const KEBABS = /-([a-z])/g;
export function capitalize(string) {
    return string ? string.replace(FIRST, string[0].toUpperCase()) : string;
}
export function uncapitalize(string) {
    return string ? string.replace(FIRST, string[0].toLowerCase()) : string;
}
export function camelCase(string) {
    let matches;
    if (string) {
        string = string.trim();
        while ((matches = SPACES.exec(string))) {
            string = string.replace(matches[0], matches[1].toUpperCase());
            SPACES.lastIndex = 0;
        }
        while ((matches = KEBABS.exec(string))) {
            string = string.replace(matches[0], matches[1].toUpperCase());
            KEBABS.lastIndex = 0;
        }
    }
    return uncapitalize(string);
}
export function kebabCase(string) {
    let matches;
    if (string) {
        string = string.trim();
        while ((matches = SPACES.exec(string))) {
            string = string.replace(matches[0], '-' + matches[1]);
            SPACES.lastIndex = 0;
        }
        while ((matches = CAMELS.exec(string))) {
            string = string.replace(matches[0], matches[0][0] + '-' + matches[1]);
            CAMELS.lastIndex = 0;
        }
    }
    return string ? string.toLowerCase() : string;
}
//# sourceMappingURL=string-utils.js.map