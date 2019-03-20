/**
 * A simple css template literal tag
 *
 * @remarks
 * The tag itself doesn't do anything that an untagged template literal wouldn't do, but it can be used by
 * editor plugins to infer the "virtual document type" to provide code completion and highlighting. It could
 * also be used in the future to more securely convert substitutions into strings.
 *
 * ```typescript
 * const color = 'green';
 *
 * const mixinBox = (borderWidth: string = '1px', borderColor: string = 'silver') => css`
 *   display: block;
 *   box-sizing: border-box;
 *   border: ${borderWidth} solid ${borderColor};
 * `;
 *
 * const mixinHover = (selector: string) => css`
 * ${ selector }:hover {
 *   background-color: var(--hover-color, dodgerblue);
 * }
 * `;
 *
 * const styles = css`
 * :host {
 *   --hover-color: ${ color };
 *   display: block;
 *   ${ mixinBox() }
 * }
 * ${ mixinHover(':host') }
 * ::slotted(*) {
 *   margin: 0;
 * }
 * `;
 *
 * // will produce...
 * :host {
 * --hover-color: green;
 * display: block;
 *
 * display: block;
 * box-sizing: border-box;
 * border: 1px solid silver;
 *
 * }
 *
 * :host:hover {
 * background-color: var(--hover-color, dodgerblue);
 * }
 *
 * ::slotted(*) {
 * margin: 0;
 * }
 * ```
 */
export declare const css: (literals: TemplateStringsArray, ...substitutions: any[]) => string;
//# sourceMappingURL=css.d.ts.map