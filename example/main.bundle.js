(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const directives = new WeakMap();
    const isDirective = (o) => {
        return typeof o === 'function' && directives.has(o);
    };
    //# sourceMappingURL=directive.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * True if the custom elements polyfill is in use.
     */
    const isCEPolyfill = window.customElements !== undefined &&
        window.customElements.polyfillWrapFlushCallback !==
            undefined;
    /**
     * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
     * `container`.
     */
    const removeNodes = (container, start, end = null) => {
        while (start !== end) {
            const n = start.nextSibling;
            container.removeChild(start);
            start = n;
        }
    };
    //# sourceMappingURL=dom.js.map

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * A sentinel value that signals that a value was handled by a directive and
     * should not be written to the DOM.
     */
    const noChange = {};
    /**
     * A sentinel value that signals a NodePart to fully clear its content.
     */
    const nothing = {};
    //# sourceMappingURL=part.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * An expression marker with embedded unique key to avoid collision with
     * possible text in templates.
     */
    const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
    /**
     * An expression marker used text-positions, multi-binding attributes, and
     * attributes with markup-like text values.
     */
    const nodeMarker = `<!--${marker}-->`;
    const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
    /**
     * Suffix appended to all bound attribute names.
     */
    const boundAttributeSuffix = '$lit$';
    /**
     * An updateable Template that tracks the location of dynamic parts.
     */
    class Template {
        constructor(result, element) {
            this.parts = [];
            this.element = element;
            const nodesToRemove = [];
            const stack = [];
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
            const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
            // Keeps track of the last index associated with a part. We try to delete
            // unnecessary nodes, but we never want to associate two different parts
            // to the same index. They must have a constant node between.
            let lastPartIndex = 0;
            let index = -1;
            let partIndex = 0;
            const { strings, values: { length } } = result;
            while (partIndex < length) {
                const node = walker.nextNode();
                if (node === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    continue;
                }
                index++;
                if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                    if (node.hasAttributes()) {
                        const attributes = node.attributes;
                        const { length } = attributes;
                        // Per
                        // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                        // attributes are not guaranteed to be returned in document order.
                        // In particular, Edge/IE can return them out of order, so we cannot
                        // assume a correspondence between part index and attribute index.
                        let count = 0;
                        for (let i = 0; i < length; i++) {
                            if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            // Get the template literal section leading up to the first
                            // expression in this attribute
                            const stringForPart = strings[partIndex];
                            // Find the attribute name
                            const name = lastAttributeNameRegex.exec(stringForPart)[2];
                            // Find the corresponding attribute
                            // All bound attributes have had a suffix added in
                            // TemplateResult#getHTML to opt out of special attribute
                            // handling. To look up the attribute value we also need to add
                            // the suffix.
                            const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                            const attributeValue = node.getAttribute(attributeLookupName);
                            node.removeAttribute(attributeLookupName);
                            const statics = attributeValue.split(markerRegex);
                            this.parts.push({ type: 'attribute', index, name, strings: statics });
                            partIndex += statics.length - 1;
                        }
                    }
                    if (node.tagName === 'TEMPLATE') {
                        stack.push(node);
                        walker.currentNode = node.content;
                    }
                }
                else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                    const data = node.data;
                    if (data.indexOf(marker) >= 0) {
                        const parent = node.parentNode;
                        const strings = data.split(markerRegex);
                        const lastIndex = strings.length - 1;
                        // Generate a new text node for each literal section
                        // These nodes are also used as the markers for node parts
                        for (let i = 0; i < lastIndex; i++) {
                            let insert;
                            let s = strings[i];
                            if (s === '') {
                                insert = createMarker();
                            }
                            else {
                                const match = lastAttributeNameRegex.exec(s);
                                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                    s = s.slice(0, match.index) + match[1] +
                                        match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                                }
                                insert = document.createTextNode(s);
                            }
                            parent.insertBefore(insert, node);
                            this.parts.push({ type: 'node', index: ++index });
                        }
                        // If there's no text, we must insert a comment to mark our place.
                        // Else, we can trust it will stick around after cloning.
                        if (strings[lastIndex] === '') {
                            parent.insertBefore(createMarker(), node);
                            nodesToRemove.push(node);
                        }
                        else {
                            node.data = strings[lastIndex];
                        }
                        // We have a part for each match found
                        partIndex += lastIndex;
                    }
                }
                else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                    if (node.data === marker) {
                        const parent = node.parentNode;
                        // Add a new marker node to be the startNode of the Part if any of
                        // the following are true:
                        //  * We don't have a previousSibling
                        //  * The previousSibling is already the start of a previous part
                        if (node.previousSibling === null || index === lastPartIndex) {
                            index++;
                            parent.insertBefore(createMarker(), node);
                        }
                        lastPartIndex = index;
                        this.parts.push({ type: 'node', index });
                        // If we don't have a nextSibling, keep this node so we have an end.
                        // Else, we can remove it to save future costs.
                        if (node.nextSibling === null) {
                            node.data = '';
                        }
                        else {
                            nodesToRemove.push(node);
                            index--;
                        }
                        partIndex++;
                    }
                    else {
                        let i = -1;
                        while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            // Comment node has a binding marker inside, make an inactive part
                            // The binding won't work, but subsequent bindings will
                            // TODO (justinfagnani): consider whether it's even worth it to
                            // make bindings in comments work
                            this.parts.push({ type: 'node', index: -1 });
                            partIndex++;
                        }
                    }
                }
            }
            // Remove text binding nodes after the walk to not disturb the TreeWalker
            for (const n of nodesToRemove) {
                n.parentNode.removeChild(n);
            }
        }
    }
    const endsWith = (str, suffix) => {
        const index = str.length - suffix.length;
        return index >= 0 && str.slice(index) === suffix;
    };
    const isTemplatePartActive = (part) => part.index !== -1;
    // Allows `document.createComment('')` to be renamed for a
    // small manual size-savings.
    const createMarker = () => document.createComment('');
    /**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#elements-attributes
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-characters
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
     * space character except " ".
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */
    const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
    //# sourceMappingURL=template.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */
    class TemplateInstance {
        constructor(template, processor, options) {
            this.__parts = [];
            this.template = template;
            this.processor = processor;
            this.options = options;
        }
        update(values) {
            let i = 0;
            for (const part of this.__parts) {
                if (part !== undefined) {
                    part.setValue(values[i]);
                }
                i++;
            }
            for (const part of this.__parts) {
                if (part !== undefined) {
                    part.commit();
                }
            }
        }
        _clone() {
            // There are a number of steps in the lifecycle of a template instance's
            // DOM fragment:
            //  1. Clone - create the instance fragment
            //  2. Adopt - adopt into the main document
            //  3. Process - find part markers and create parts
            //  4. Upgrade - upgrade custom elements
            //  5. Update - set node, attribute, property, etc., values
            //  6. Connect - connect to the document. Optional and outside of this
            //     method.
            //
            // We have a few constraints on the ordering of these steps:
            //  * We need to upgrade before updating, so that property values will pass
            //    through any property setters.
            //  * We would like to process before upgrading so that we're sure that the
            //    cloned fragment is inert and not disturbed by self-modifying DOM.
            //  * We want custom elements to upgrade even in disconnected fragments.
            //
            // Given these constraints, with full custom elements support we would
            // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
            //
            // But Safari dooes not implement CustomElementRegistry#upgrade, so we
            // can not implement that order and still have upgrade-before-update and
            // upgrade disconnected fragments. So we instead sacrifice the
            // process-before-upgrade constraint, since in Custom Elements v1 elements
            // must not modify their light DOM in the constructor. We still have issues
            // when co-existing with CEv0 elements like Polymer 1, and with polyfills
            // that don't strictly adhere to the no-modification rule because shadow
            // DOM, which may be created in the constructor, is emulated by being placed
            // in the light DOM.
            //
            // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
            // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
            // in one step.
            //
            // The Custom Elements v1 polyfill supports upgrade(), so the order when
            // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
            // Connect.
            const fragment = isCEPolyfill ?
                this.template.element.content.cloneNode(true) :
                document.importNode(this.template.element.content, true);
            const stack = [];
            const parts = this.template.parts;
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
            const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
            let partIndex = 0;
            let nodeIndex = 0;
            let part;
            let node = walker.nextNode();
            // Loop through all the nodes and parts of a template
            while (partIndex < parts.length) {
                part = parts[partIndex];
                if (!isTemplatePartActive(part)) {
                    this.__parts.push(undefined);
                    partIndex++;
                    continue;
                }
                // Progress the tree walker until we find our next part's node.
                // Note that multiple parts may share the same node (attribute parts
                // on a single element), so this loop may not run at all.
                while (nodeIndex < part.index) {
                    nodeIndex++;
                    if (node.nodeName === 'TEMPLATE') {
                        stack.push(node);
                        walker.currentNode = node.content;
                    }
                    if ((node = walker.nextNode()) === null) {
                        // We've exhausted the content inside a nested template element.
                        // Because we still have parts (the outer for-loop), we know:
                        // - There is a template in the stack
                        // - The walker will find a nextNode outside the template
                        walker.currentNode = stack.pop();
                        node = walker.nextNode();
                    }
                }
                // We've arrived at our part's node.
                if (part.type === 'node') {
                    const part = this.processor.handleTextExpression(this.options);
                    part.insertAfterNode(node.previousSibling);
                    this.__parts.push(part);
                }
                else {
                    this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                }
                partIndex++;
            }
            if (isCEPolyfill) {
                document.adoptNode(fragment);
                customElements.upgrade(fragment);
            }
            return fragment;
        }
    }
    //# sourceMappingURL=template-instance.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const commentMarker = ` ${marker} `;
    /**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */
    class TemplateResult {
        constructor(strings, values, type, processor) {
            this.strings = strings;
            this.values = values;
            this.type = type;
            this.processor = processor;
        }
        /**
         * Returns a string of HTML used to create a `<template>` element.
         */
        getHTML() {
            const l = this.strings.length - 1;
            let html = '';
            let isCommentBinding = false;
            for (let i = 0; i < l; i++) {
                const s = this.strings[i];
                // For each binding we want to determine the kind of marker to insert
                // into the template source before it's parsed by the browser's HTML
                // parser. The marker type is based on whether the expression is in an
                // attribute, text, or comment poisition.
                //   * For node-position bindings we insert a comment with the marker
                //     sentinel as its text content, like <!--{{lit-guid}}-->.
                //   * For attribute bindings we insert just the marker sentinel for the
                //     first binding, so that we support unquoted attribute bindings.
                //     Subsequent bindings can use a comment marker because multi-binding
                //     attributes must be quoted.
                //   * For comment bindings we insert just the marker sentinel so we don't
                //     close the comment.
                //
                // The following code scans the template source, but is *not* an HTML
                // parser. We don't need to track the tree structure of the HTML, only
                // whether a binding is inside a comment, and if not, if it appears to be
                // the first binding in an attribute.
                const commentOpen = s.lastIndexOf('<!--');
                // We're in comment position if we have a comment open with no following
                // comment close. Because <-- can appear in an attribute value there can
                // be false positives.
                isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                    s.indexOf('-->', commentOpen + 1) === -1;
                // Check to see if we have an attribute-like sequence preceeding the
                // expression. This can match "name=value" like structures in text,
                // comments, and attribute values, so there can be false-positives.
                const attributeMatch = lastAttributeNameRegex.exec(s);
                if (attributeMatch === null) {
                    // We're only in this branch if we don't have a attribute-like
                    // preceeding sequence. For comments, this guards against unusual
                    // attribute values like <div foo="<!--${'bar'}">. Cases like
                    // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                    // below.
                    html += s + (isCommentBinding ? commentMarker : nodeMarker);
                }
                else {
                    // For attributes we use just a marker sentinel, and also append a
                    // $lit$ suffix to the name to opt-out of attribute-specific parsing
                    // that IE and Edge do for style and certain SVG attributes.
                    html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                        attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                        marker;
                }
            }
            html += this.strings[l];
            return html;
        }
        getTemplateElement() {
            const template = document.createElement('template');
            template.innerHTML = this.getHTML();
            return template;
        }
    }
    //# sourceMappingURL=template-result.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const isPrimitive = (value) => {
        return (value === null ||
            !(typeof value === 'object' || typeof value === 'function'));
    };
    const isIterable = (value) => {
        return Array.isArray(value) ||
            // tslint:disable-next-line:no-any
            !!(value && value[Symbol.iterator]);
    };
    /**
     * Writes attribute values to the DOM for a group of AttributeParts bound to a
     * single attibute. The value is only set once even if there are multiple parts
     * for an attribute.
     */
    class AttributeCommitter {
        constructor(element, name, strings) {
            this.dirty = true;
            this.element = element;
            this.name = name;
            this.strings = strings;
            this.parts = [];
            for (let i = 0; i < strings.length - 1; i++) {
                this.parts[i] = this._createPart();
            }
        }
        /**
         * Creates a single part. Override this to create a differnt type of part.
         */
        _createPart() {
            return new AttributePart(this);
        }
        _getValue() {
            const strings = this.strings;
            const l = strings.length - 1;
            let text = '';
            for (let i = 0; i < l; i++) {
                text += strings[i];
                const part = this.parts[i];
                if (part !== undefined) {
                    const v = part.value;
                    if (isPrimitive(v) || !isIterable(v)) {
                        text += typeof v === 'string' ? v : String(v);
                    }
                    else {
                        for (const t of v) {
                            text += typeof t === 'string' ? t : String(t);
                        }
                    }
                }
            }
            text += strings[l];
            return text;
        }
        commit() {
            if (this.dirty) {
                this.dirty = false;
                this.element.setAttribute(this.name, this._getValue());
            }
        }
    }
    /**
     * A Part that controls all or part of an attribute value.
     */
    class AttributePart {
        constructor(committer) {
            this.value = undefined;
            this.committer = committer;
        }
        setValue(value) {
            if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
                this.value = value;
                // If the value is a not a directive, dirty the committer so that it'll
                // call setAttribute. If the value is a directive, it'll dirty the
                // committer if it calls setValue().
                if (!isDirective(value)) {
                    this.committer.dirty = true;
                }
            }
        }
        commit() {
            while (isDirective(this.value)) {
                const directive = this.value;
                this.value = noChange;
                directive(this);
            }
            if (this.value === noChange) {
                return;
            }
            this.committer.commit();
        }
    }
    /**
     * A Part that controls a location within a Node tree. Like a Range, NodePart
     * has start and end locations and can set and update the Nodes between those
     * locations.
     *
     * NodeParts support several value types: primitives, Nodes, TemplateResults,
     * as well as arrays and iterables of those types.
     */
    class NodePart {
        constructor(options) {
            this.value = undefined;
            this.__pendingValue = undefined;
            this.options = options;
        }
        /**
         * Appends this part into a container.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendInto(container) {
            this.startNode = container.appendChild(createMarker());
            this.endNode = container.appendChild(createMarker());
        }
        /**
         * Inserts this part after the `ref` node (between `ref` and `ref`'s next
         * sibling). Both `ref` and its next sibling must be static, unchanging nodes
         * such as those that appear in a literal section of a template.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterNode(ref) {
            this.startNode = ref;
            this.endNode = ref.nextSibling;
        }
        /**
         * Appends this part into a parent part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendIntoPart(part) {
            part.__insert(this.startNode = createMarker());
            part.__insert(this.endNode = createMarker());
        }
        /**
         * Inserts this part after the `ref` part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterPart(ref) {
            ref.__insert(this.startNode = createMarker());
            this.endNode = ref.endNode;
            ref.endNode = this.startNode;
        }
        setValue(value) {
            this.__pendingValue = value;
        }
        commit() {
            while (isDirective(this.__pendingValue)) {
                const directive = this.__pendingValue;
                this.__pendingValue = noChange;
                directive(this);
            }
            const value = this.__pendingValue;
            if (value === noChange) {
                return;
            }
            if (isPrimitive(value)) {
                if (value !== this.value) {
                    this.__commitText(value);
                }
            }
            else if (value instanceof TemplateResult) {
                this.__commitTemplateResult(value);
            }
            else if (value instanceof Node) {
                this.__commitNode(value);
            }
            else if (isIterable(value)) {
                this.__commitIterable(value);
            }
            else if (value === nothing) {
                this.value = nothing;
                this.clear();
            }
            else {
                // Fallback, will render the string representation
                this.__commitText(value);
            }
        }
        __insert(node) {
            this.endNode.parentNode.insertBefore(node, this.endNode);
        }
        __commitNode(value) {
            if (this.value === value) {
                return;
            }
            this.clear();
            this.__insert(value);
            this.value = value;
        }
        __commitText(value) {
            const node = this.startNode.nextSibling;
            value = value == null ? '' : value;
            // If `value` isn't already a string, we explicitly convert it here in case
            // it can't be implicitly converted - i.e. it's a symbol.
            const valueAsString = typeof value === 'string' ? value : String(value);
            if (node === this.endNode.previousSibling &&
                node.nodeType === 3 /* Node.TEXT_NODE */) {
                // If we only have a single text node between the markers, we can just
                // set its value, rather than replacing it.
                // TODO(justinfagnani): Can we just check if this.value is primitive?
                node.data = valueAsString;
            }
            else {
                this.__commitNode(document.createTextNode(valueAsString));
            }
            this.value = value;
        }
        __commitTemplateResult(value) {
            const template = this.options.templateFactory(value);
            if (this.value instanceof TemplateInstance &&
                this.value.template === template) {
                this.value.update(value.values);
            }
            else {
                // Make sure we propagate the template processor from the TemplateResult
                // so that we use its syntax extension, etc. The template factory comes
                // from the render function options so that it can control template
                // caching and preprocessing.
                const instance = new TemplateInstance(template, value.processor, this.options);
                const fragment = instance._clone();
                instance.update(value.values);
                this.__commitNode(fragment);
                this.value = instance;
            }
        }
        __commitIterable(value) {
            // For an Iterable, we create a new InstancePart per item, then set its
            // value to the item. This is a little bit of overhead for every item in
            // an Iterable, but it lets us recurse easily and efficiently update Arrays
            // of TemplateResults that will be commonly returned from expressions like:
            // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
            // If _value is an array, then the previous render was of an
            // iterable and _value will contain the NodeParts from the previous
            // render. If _value is not an array, clear this part and make a new
            // array for NodeParts.
            if (!Array.isArray(this.value)) {
                this.value = [];
                this.clear();
            }
            // Lets us keep track of how many items we stamped so we can clear leftover
            // items from a previous render
            const itemParts = this.value;
            let partIndex = 0;
            let itemPart;
            for (const item of value) {
                // Try to reuse an existing part
                itemPart = itemParts[partIndex];
                // If no existing part, create a new one
                if (itemPart === undefined) {
                    itemPart = new NodePart(this.options);
                    itemParts.push(itemPart);
                    if (partIndex === 0) {
                        itemPart.appendIntoPart(this);
                    }
                    else {
                        itemPart.insertAfterPart(itemParts[partIndex - 1]);
                    }
                }
                itemPart.setValue(item);
                itemPart.commit();
                partIndex++;
            }
            if (partIndex < itemParts.length) {
                // Truncate the parts array so _value reflects the current state
                itemParts.length = partIndex;
                this.clear(itemPart && itemPart.endNode);
            }
        }
        clear(startNode = this.startNode) {
            removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
        }
    }
    /**
     * Implements a boolean attribute, roughly as defined in the HTML
     * specification.
     *
     * If the value is truthy, then the attribute is present with a value of
     * ''. If the value is falsey, the attribute is removed.
     */
    class BooleanAttributePart {
        constructor(element, name, strings) {
            this.value = undefined;
            this.__pendingValue = undefined;
            if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
                throw new Error('Boolean attributes can only contain a single expression');
            }
            this.element = element;
            this.name = name;
            this.strings = strings;
        }
        setValue(value) {
            this.__pendingValue = value;
        }
        commit() {
            while (isDirective(this.__pendingValue)) {
                const directive = this.__pendingValue;
                this.__pendingValue = noChange;
                directive(this);
            }
            if (this.__pendingValue === noChange) {
                return;
            }
            const value = !!this.__pendingValue;
            if (this.value !== value) {
                if (value) {
                    this.element.setAttribute(this.name, '');
                }
                else {
                    this.element.removeAttribute(this.name);
                }
                this.value = value;
            }
            this.__pendingValue = noChange;
        }
    }
    /**
     * Sets attribute values for PropertyParts, so that the value is only set once
     * even if there are multiple parts for a property.
     *
     * If an expression controls the whole property value, then the value is simply
     * assigned to the property under control. If there are string literals or
     * multiple expressions, then the strings are expressions are interpolated into
     * a string first.
     */
    class PropertyCommitter extends AttributeCommitter {
        constructor(element, name, strings) {
            super(element, name, strings);
            this.single =
                (strings.length === 2 && strings[0] === '' && strings[1] === '');
        }
        _createPart() {
            return new PropertyPart(this);
        }
        _getValue() {
            if (this.single) {
                return this.parts[0].value;
            }
            return super._getValue();
        }
        commit() {
            if (this.dirty) {
                this.dirty = false;
                // tslint:disable-next-line:no-any
                this.element[this.name] = this._getValue();
            }
        }
    }
    class PropertyPart extends AttributePart {
    }
    // Detect event listener options support. If the `capture` property is read
    // from the options object, then options are supported. If not, then the thrid
    // argument to add/removeEventListener is interpreted as the boolean capture
    // value so we should only pass the `capture` property.
    let eventOptionsSupported = false;
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // tslint:disable-next-line:no-any
        window.addEventListener('test', options, options);
        // tslint:disable-next-line:no-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
    }
    class EventPart {
        constructor(element, eventName, eventContext) {
            this.value = undefined;
            this.__pendingValue = undefined;
            this.element = element;
            this.eventName = eventName;
            this.eventContext = eventContext;
            this.__boundHandleEvent = (e) => this.handleEvent(e);
        }
        setValue(value) {
            this.__pendingValue = value;
        }
        commit() {
            while (isDirective(this.__pendingValue)) {
                const directive = this.__pendingValue;
                this.__pendingValue = noChange;
                directive(this);
            }
            if (this.__pendingValue === noChange) {
                return;
            }
            const newListener = this.__pendingValue;
            const oldListener = this.value;
            const shouldRemoveListener = newListener == null ||
                oldListener != null &&
                    (newListener.capture !== oldListener.capture ||
                        newListener.once !== oldListener.once ||
                        newListener.passive !== oldListener.passive);
            const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
            if (shouldRemoveListener) {
                this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
            }
            if (shouldAddListener) {
                this.__options = getOptions(newListener);
                this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
            }
            this.value = newListener;
            this.__pendingValue = noChange;
        }
        handleEvent(event) {
            if (typeof this.value === 'function') {
                this.value.call(this.eventContext || this.element, event);
            }
            else {
                this.value.handleEvent(event);
            }
        }
    }
    // We copy options because of the inconsistent behavior of browsers when reading
    // the third argument of add/removeEventListener. IE11 doesn't support options
    // at all. Chrome 41 only reads `capture` if the argument is an object.
    const getOptions = (o) => o &&
        (eventOptionsSupported ?
            { capture: o.capture, passive: o.passive, once: o.once } :
            o.capture);
    //# sourceMappingURL=parts.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * Creates Parts when a template is instantiated.
     */
    class DefaultTemplateProcessor {
        /**
         * Create parts for an attribute-position binding, given the event, attribute
         * name, and string literals.
         *
         * @param element The element containing the binding
         * @param name  The attribute name
         * @param strings The string literals. There are always at least two strings,
         *   event for fully-controlled bindings with a single expression.
         */
        handleAttributeExpressions(element, name, strings, options) {
            const prefix = name[0];
            if (prefix === '.') {
                const committer = new PropertyCommitter(element, name.slice(1), strings);
                return committer.parts;
            }
            if (prefix === '@') {
                return [new EventPart(element, name.slice(1), options.eventContext)];
            }
            if (prefix === '?') {
                return [new BooleanAttributePart(element, name.slice(1), strings)];
            }
            const committer = new AttributeCommitter(element, name, strings);
            return committer.parts;
        }
        /**
         * Create parts for a text-position binding.
         * @param templateFactory
         */
        handleTextExpression(options) {
            return new NodePart(options);
        }
    }
    const defaultTemplateProcessor = new DefaultTemplateProcessor();
    //# sourceMappingURL=default-template-processor.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * The default TemplateFactory which caches Templates keyed on
     * result.type and result.strings.
     */
    function templateFactory(result) {
        let templateCache = templateCaches.get(result.type);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(result.type, templateCache);
        }
        let template = templateCache.stringsArray.get(result.strings);
        if (template !== undefined) {
            return template;
        }
        // If the TemplateStringsArray is new, generate a key from the strings
        // This key is shared between all templates with identical content
        const key = result.strings.join(marker);
        // Check if we already have a Template for this key
        template = templateCache.keyString.get(key);
        if (template === undefined) {
            // If we have not seen this key before, create a new Template
            template = new Template(result, result.getTemplateElement());
            // Cache the Template for this key
            templateCache.keyString.set(key, template);
        }
        // Cache all future queries for this TemplateStringsArray
        templateCache.stringsArray.set(result.strings, template);
        return template;
    }
    const templateCaches = new Map();
    //# sourceMappingURL=template-factory.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const parts = new WeakMap();
    /**
     * Renders a template result or other value to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result Any value renderable by NodePart - typically a TemplateResult
     *     created by evaluating a template tag like `html` or `svg`.
     * @param container A DOM parent to render to. The entire contents are either
     *     replaced, or efficiently updated if the same result type was previous
     *     rendered there.
     * @param options RenderOptions for the entire render tree rendered to this
     *     container. Render options must *not* change between renders to the same
     *     container, as those changes will not effect previously rendered DOM.
     */
    const render = (result, container, options) => {
        let part = parts.get(container);
        if (part === undefined) {
            removeNodes(container, container.firstChild);
            parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
            part.appendInto(container);
        }
        part.setValue(result);
        part.commit();
    };
    //# sourceMappingURL=render.js.map

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // IMPORTANT: do not change the property name or the assignment expression.
    // This line will be used in regexes to search for lit-html usage.
    // TODO(justinfagnani): inject version number at build time
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.2');
    /**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */
    const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
    //# sourceMappingURL=lit-html.js.map

    /**
     * The default attribute converter
     *
     * @remarks
     * This converter is used as the default converter for decorated properties unless a different one
     * is specified. The converter tries to infer the property type when converting to attributes and
     * uses `JSON.parse()` when converting strings from attributes. If `JSON.parse()` throws an error,
     * the converter will use the attribute value as a string.
     */
    const AttributeConverterDefault = {
        fromAttribute: (value) => {
            // `JSON.parse()` will throw an error for empty strings - we consider it null
            if (value === null || value === '') {
                return null;
            }
            else
                try {
                    // `JSON.parse()` will successfully parse `boolean`, `number` and `JSON.stringify`'d values
                    return JSON.parse(value);
                }
                catch (error) {
                    // if it throws, it means we're probably dealing with a regular string
                    return value;
                }
        },
        toAttribute: (value) => {
            switch (typeof value) {
                case 'boolean':
                    return value ? '' : null;
                case 'object':
                    return (value == null) ? value : JSON.stringify(value);
                case 'undefined':
                    return value;
                case 'string':
                    return value;
                default: // number, bigint, symbol, function
                    return value.toString();
            }
        }
    };
    /**
     * Handles boolean attributes, like `disabled`, which are considered true if they are set with
     * any value at all. In order to set the attribute to false, the attribute has to be removed by
     * setting the attribute value to `null`.
     */
    const AttributeConverterBoolean = {
        fromAttribute: (value) => (value !== null),
        toAttribute: (value) => value ? '' : null
    };
    /**
     * Handles boolean ARIA attributes, like `aria-checked` or `aria-selected`, which have to be
     * set explicitly to `true` or `false`.
     */
    const AttributeConverterARIABoolean = {
        fromAttribute: (value) => value === 'true',
        // pass through null or undefined using `value == null`
        toAttribute: (value) => (value == null) ? value : value.toString()
    };
    const AttributeConverterString = {
        fromAttribute: (value) => (value === null) ? null : value,
        // pass through null or undefined
        toAttribute: (value) => value
    };
    const AttributeConverterNumber = {
        fromAttribute: (value) => (value === null) ? null : Number(value),
        // pass through null or undefined using `value == null`
        toAttribute: (value) => (value == null) ? value : value.toString()
    };
    //# sourceMappingURL=attribute-converter.js.map

    /**
     * The default {@link ComponentDeclaration}
     */
    const DEFAULT_COMPONENT_DECLARATION = {
        selector: '',
        shadow: true,
        define: true,
    };
    //# sourceMappingURL=component-declaration.js.map

    /**
     * Decorates a {@link Component} class
     *
     * @param options A {@link ComponentDeclaration}
     */
    function component(options = {}) {
        const declaration = Object.assign(Object.assign({}, DEFAULT_COMPONENT_DECLARATION), options);
        return (target) => {
            const constructor = target;
            constructor.selector = declaration.selector || target.selector;
            constructor.shadow = declaration.shadow;
            constructor.template = declaration.template || target.template;
            // use keyof signatures to catch refactoring errors
            const observedAttributesKey = 'observedAttributes';
            const stylesKey = 'styles';
            /**
             * Property decorators get called before class decorators, so at this point all decorated properties
             * have stored their associated attributes in {@link Component.attributes}.
             * We can now combine them with the user-defined {@link Component.observedAttributes} and,
             * by using a Set, eliminate all duplicates in the process.
             *
             * As the user-defined {@link Component.observedAttributes} will also include decorator generated
             * observed attributes, we always inherit all observed attributes from a base class. For that reason
             * we have to keep track of attribute overrides when extending any {@link Component} base class.
             * This is done in the {@link property} decorator. Here we have to make sure to remove overridden
             * attributes.
             */
            const observedAttributes = [
                ...new Set(
                // we take the inherited observed attributes...
                constructor.observedAttributes
                    // ...remove overridden generated attributes...
                    .reduce((attributes, attribute) => attributes.concat(constructor.overridden && constructor.overridden.has(attribute) ? [] : attribute), [])
                    // ...and recombine the list with the newly generated attributes (the Set prevents duplicates)
                    .concat([...target.attributes.keys()]))
            ];
            // delete the overridden Set from the constructor
            delete constructor.overridden;
            /**
             * We don't want to inherit styles automatically, unless explicitly requested, so we check if the
             * constructor declares a static styles property (which may use super.styles to explicitly inherit)
             * and if it doesn't, we ignore the parent class's styles (by not invoking the getter).
             * We then merge the decorator defined styles (if existing) into the styles and remove duplicates
             * by using a Set.
             */
            const styles = [
                ...new Set((constructor.hasOwnProperty(stylesKey)
                    ? constructor.styles
                    : []).concat(declaration.styles || []))
            ];
            /**
             * Finally we override the {@link Component.observedAttributes} getter with a new one, which returns
             * the unique set of user defined and decorator generated observed attributes.
             */
            Reflect.defineProperty(constructor, observedAttributesKey, {
                configurable: true,
                enumerable: false,
                get() {
                    return observedAttributes;
                }
            });
            /**
             * We override the {@link Component.styles} getter with a new one, which returns
             * the unique set of statically defined and decorator defined styles.
             */
            Reflect.defineProperty(constructor, stylesKey, {
                configurable: true,
                enumerable: true,
                get() {
                    return styles;
                }
            });
            if (declaration.define) {
                window.customElements.define(constructor.selector, constructor);
            }
        };
    }
    //# sourceMappingURL=component.js.map

    /**
     * Decorates a {@link Component} method as an event listener
     *
     * @param options The listener declaration
     */
    function listener(options) {
        return function (target, propertyKey, descriptor) {
            const constructor = target.constructor;
            prepareConstructor(constructor);
            if (options.event === null) {
                constructor.listeners.delete(propertyKey);
            }
            else {
                constructor.listeners.set(propertyKey, Object.assign({}, options));
            }
        };
    }
    /**
     * Prepares the component constructor by initializing static properties for the listener decorator,
     * so we don't modify a base class's static properties.
     *
     * @remarks
     * When the listener decorator stores listener declarations in the constructor, we have to make sure the
     * static listeners field is initialized on the current constructor. Otherwise we add listener declarations
     * to the base class's static field. We also make sure to initialize the listener maps with the values of
     * the base class's map to properly inherit all listener declarations.
     *
     * @param constructor The component constructor to prepare
     *
     * @internal
     * @private
     */
    function prepareConstructor(constructor) {
        if (!constructor.hasOwnProperty('listeners'))
            constructor.listeners = new Map(constructor.listeners);
    }
    //# sourceMappingURL=listener.js.map

    const SPACES = /\s+([\S])/g;
    const CAMELS = /[a-z]([A-Z])/g;
    function kebabCase(string) {
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

    /**
     * A type guard for {@link AttributeReflector}
     *
     * @param reflector A reflector to test
     */
    function isAttributeReflector(reflector) {
        return typeof reflector === 'function';
    }
    /**
     * A type guard for {@link PropertyReflector}
     *
     * @param reflector A reflector to test
     */
    function isPropertyReflector(reflector) {
        return typeof reflector === 'function';
    }
    /**
     * A type guard for {@link PropertyNotifier}
     *
     * @param notifier A notifier to test
     */
    function isPropertyNotifier(notifier) {
        return typeof notifier === 'function';
    }
    /**
     * A type guard for {@link PropertyChangeDetector}
     *
     * @param detector A detector to test
     */
    function isPropertyChangeDetector(detector) {
        return typeof detector === 'function';
    }
    /**
     * A type guard for {@link PropertyKey}
     *
     * @param key A property key to test
     */
    function isPropertyKey(key) {
        return typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol';
    }
    /**
     * Encodes a string for use as html attribute removing invalid attribute characters
     *
     * @param value A string to encode for use as html attribute
     * @returns     An encoded string usable as html attribute
     */
    function encodeAttribute(value) {
        return kebabCase(value.replace(/\W+/g, '-').replace(/\-$/, ''));
    }
    /**
     * A helper function to create an attribute name from a property key
     *
     * @remarks
     * Numeric property indexes or symbols can contain invalid characters for attribute names. This method
     * sanitizes those characters and replaces sequences of invalid characters with a dash.
     * Attribute names are not allowed to start with numbers either and are prefixed with 'attr-'.
     *
     * N.B.: When using custom symbols as property keys, use unique descriptions for the symbols to avoid
     * clashing attribute names.
     *
     * ```typescript
     * const a = Symbol();
     * const b = Symbol();
     *
     * a !== b; // true
     *
     * createAttributeName(a) !== createAttributeName(b); // false --> 'attr-symbol' === 'attr-symbol'
     *
     * const c = Symbol('c');
     * const d = Symbol('d');
     *
     * c !== d; // true
     *
     * createAttributeName(c) !== createAttributeName(d); // true --> 'attr-symbol-c' === 'attr-symbol-d'
     * ```
     *
     * @param propertyKey   A property key to convert to an attribute name
     * @returns             The generated attribute name
     */
    function createAttributeName(propertyKey) {
        if (typeof propertyKey === 'string') {
            return kebabCase(propertyKey);
        }
        else {
            // TODO: this could create multiple identical attribute names, if symbols don't have unique description
            return `attr-${encodeAttribute(String(propertyKey))}`;
        }
    }
    /**
     * A helper function to create an event name from a property key
     *
     * @remarks
     * Event names don't have the same restrictions as attribute names when it comes to invalid
     * characters. However, for consistency's sake, we apply the same rules for event names as
     * for attribute names.
     *
     * @param propertyKey   A property key to convert to an attribute name
     * @param prefix        An optional prefix, e.g.: 'on'
     * @param suffix        An optional suffix, e.g.: 'changed'
     * @returns             The generated event name
     */
    function createEventName(propertyKey, prefix, suffix) {
        let propertyString = '';
        if (typeof propertyKey === 'string') {
            propertyString = kebabCase(propertyKey);
        }
        else {
            // TODO: this could create multiple identical event names, if symbols don't have unique description
            propertyString = encodeAttribute(String(propertyKey));
        }
        return `${prefix ? `${kebabCase(prefix)}-` : ''}${propertyString}${suffix ? `-${kebabCase(suffix)}` : ''}`;
    }
    /**
     * The default property change detector
     *
     * @param oldValue  The old property value
     * @param newValue  The new property value
     * @returns         A boolean indicating if the property value changed
     */
    const DEFAULT_PROPERTY_CHANGE_DETECTOR = (oldValue, newValue) => {
        // in case `oldValue` and `newValue` are `NaN`, `(NaN !== NaN)` returns `true`,
        // but `(NaN === NaN || NaN === NaN)` returns `false`
        return oldValue !== newValue && (oldValue === oldValue || newValue === newValue);
    };
    // TODO: maybe provide flat array/object change detector? date change detector?
    /**
     * The default {@link PropertyDeclaration}
     */
    const DEFAULT_PROPERTY_DECLARATION = {
        attribute: true,
        converter: AttributeConverterDefault,
        reflectAttribute: true,
        reflectProperty: true,
        notify: true,
        observe: DEFAULT_PROPERTY_CHANGE_DETECTOR,
    };
    //# sourceMappingURL=property-declaration.js.map

    /**
     * Get the {@link PropertyDescriptor} of a property from its prototype
     * or a parent prototype - excluding {@link Object.prototype} itself.
     *
     * @param target        The prototype to get the descriptor from
     * @param propertyKey   The property key for which to get the descriptor
     *
     * @internal
     * @private
     */
    function getPropertyDescriptor(target, propertyKey) {
        if (propertyKey in target) {
            while (target !== Object.prototype) {
                if (target.hasOwnProperty(propertyKey)) {
                    return Object.getOwnPropertyDescriptor(target, propertyKey);
                }
                target = Object.getPrototypeOf(target);
            }
        }
        return undefined;
    }
    //# sourceMappingURL=get-property-descriptor.js.map

    /**
     * Decorates a {@link Component} property
     *
     * @remarks
     * Many of the {@link PropertyDeclaration} options support custom functions, which will be invoked
     * with the component instance as `this`-context during execution. In order to support correct
     * typing in these functions, the `@property` decorator supports generic types. Here is an example
     * of how you can use this with a custom {@link PropertyReflector}:
     *
     * ```typescript
     * class MyElement extends Component {
     *
     *      myHiddenProperty = true;
     *
     *      // use a generic to support proper instance typing in the property reflector
     *      @property<MyElement>({
     *          reflectProperty: (propertyKey: string, oldValue: any, newValue: any) {
     *              // the generic type allows for correct typing of this
     *              if (this.myHiddenProperty && newValue) {
     *                  this.setAttribute('my-property', '');
     *              } else {
     *                  this.removeAttribute('my-property');
     *              }
     *          }
     *      })
     *      myProperty = false;
     * }
     * ```
     *
     * @param options A property declaration
     */
    function property(options = {}) {
        return function (target, propertyKey, propertyDescriptor) {
            /**
             * When defining classes in TypeScript, class fields actually don't exist on the class's prototype, but
             * rather, they are instantiated in the constructor and exist only on the instance. Accessor properties
             * are an exception however and exist on the prototype. Furthermore, accessors are inherited and will
             * be invoked when setting (or getting) a property on an instance of a child class, even if that class
             * defines the property field on its own. Only if the child class defines new accessors will the parent
             * class's accessors not be inherited.
             * To keep this behavior intact, we need to ensure, that when we create accessors for properties, which
             * are not declared as accessors, we invoke the parent class's accessor as expected.
             * The {@link getPropertyDescriptor} function allows us to look for accessors on the prototype chain of
             * the class we are decorating.
             */
            const descriptor = propertyDescriptor || getPropertyDescriptor(target, propertyKey);
            const hiddenKey = (typeof propertyKey === 'string') ? `__${propertyKey}` : Symbol();
            // if we found an accessor descriptor (from either this class or a parent) we use it, otherwise we create
            // default accessors to store the actual property value in a hidden field and retrieve it from there
            const getter = descriptor && descriptor.get || function () { return this[hiddenKey]; };
            const setter = descriptor && descriptor.set || function (value) { this[hiddenKey] = value; };
            // we define a new accessor descriptor which will wrap the previously retrieved or created accessors
            // and request an update of the component whenever the property is set
            const wrappedDescriptor = {
                configurable: true,
                enumerable: true,
                get() {
                    return getter.call(this);
                },
                set(value) {
                    const oldValue = this[propertyKey];
                    setter.call(this, value);
                    // don't pass `value` on as `newValue` - an inherited setter might modify it
                    // instead get the new value by invoking the getter
                    this.requestUpdate(propertyKey, oldValue, getter.call(this));
                }
            };
            const constructor = target.constructor;
            const declaration = Object.assign(Object.assign({}, DEFAULT_PROPERTY_DECLARATION), options);
            // generate the default attribute name
            if (declaration.attribute === true) {
                declaration.attribute = createAttributeName(propertyKey);
            }
            // set the default property change detector
            if (declaration.observe === true) {
                declaration.observe = DEFAULT_PROPERTY_DECLARATION.observe;
            }
            prepareConstructor$1(constructor);
            // check if we inherited an observed attribute for the property from the base class
            const attribute = constructor.properties.has(propertyKey) ? constructor.properties.get(propertyKey).attribute : undefined;
            // if attribute is truthy it's a string and it will exist in the attributes map
            if (attribute) {
                // remove the inherited attribute as it's overridden
                constructor.attributes.delete(attribute);
                // mark attribute as overridden for {@link component} decorator
                constructor.overridden.add(attribute);
            }
            if (declaration.attribute) {
                constructor.attributes.set(declaration.attribute, propertyKey);
            }
            // store the property declaration *after* processing the attributes, so we can still access the
            // inherited property declaration when processing the attributes
            constructor.properties.set(propertyKey, declaration);
            if (!propertyDescriptor) {
                // if no propertyDescriptor was defined for this decorator, this decorator is a property
                // decorator which must return void and we can define the wrapped descriptor here
                Object.defineProperty(target, propertyKey, wrappedDescriptor);
            }
            else {
                // if a propertyDescriptor was defined for this decorator, this decorator is an accessor
                // decorator and we must return the wrapped property descriptor
                return wrappedDescriptor;
            }
        };
    }
    /**
     * Prepares the component constructor by initializing static properties for the property decorator,
     * so we don't modify a base class's static properties.
     *
     * @remarks
     * When the property decorator stores property declarations and attribute mappings in the constructor,
     * we have to make sure those static fields are initialized on the current constructor. Otherwise we
     * add property declarations and attribute mappings to the base class's static fields. We also make
     * sure to initialize the constructors maps with the values of the base class's maps to properly
     * inherit all property declarations and attributes.
     *
     * @param constructor The component constructor to prepare
     *
     * @internal
     */
    function prepareConstructor$1(constructor) {
        // this will give us a compile-time error if we refactor one of the static constructor properties
        // and we won't miss renaming the property keys
        const properties = 'properties';
        const attributes = 'attributes';
        const overridden = 'overridden';
        if (!constructor.hasOwnProperty(properties))
            constructor.properties = new Map(constructor.properties);
        if (!constructor.hasOwnProperty(attributes))
            constructor.attributes = new Map(constructor.attributes);
        if (!constructor.hasOwnProperty(overridden))
            constructor.overridden = new Set();
    }
    //# sourceMappingURL=property.js.map

    /**
     * @internal
     */
    const ATTRIBUTE_REFLECTOR_ERROR = (attributeReflector) => new Error(`Error executing attribute reflector ${String(attributeReflector)}.`);
    /**
     * @internal
     */
    const PROPERTY_REFLECTOR_ERROR = (propertyReflector) => new Error(`Error executing property reflector ${String(propertyReflector)}.`);
    /**
     * @internal
     */
    const PROPERTY_NOTIFIER_ERROR = (propertyNotifier) => new Error(`Error executing property notifier ${String(propertyNotifier)}.`);
    /**
     * @internal
     */
    const CHANGE_DETECTOR_ERROR = (changeDetector) => new Error(`Error executing property change detector ${String(changeDetector)}.`);
    /**
     * The component base class
     */
    class Component extends HTMLElement {
        /**
         * The component constructor
         */
        constructor(...args) {
            super();
            /**
             * @internal
             * @private
             */
            this._updateRequest = Promise.resolve(true);
            /**
             * @internal
             * @private
             */
            this._changedProperties = new Map();
            /**
             * @internal
             * @private
             */
            this._reflectingProperties = new Map();
            /**
             * @internal
             * @private
             */
            this._notifyingProperties = new Map();
            /**
             * @internal
             * @private
             */
            this._listenerDeclarations = [];
            /**
             * @internal
             * @private
             */
            this._hasUpdated = false;
            /**
             * @internal
             * @private
             */
            this._hasRequestedUpdate = false;
            /**
             * @internal
             * @private
             */
            this._isReflecting = false;
            this.renderRoot = this._createRenderRoot();
        }
        /**
         * The component's {@link CSSStyleSheet}
         *
         * @remarks
         * When constructable stylesheets are available, this getter will create a {@link CSSStyleSheet}
         * instance and cache it for use with each instance of the component.
         *
         * @internal
         * @private
         */
        static get styleSheet() {
            if (this.styles.length && !this.hasOwnProperty('_styleSheet')) {
                try {
                    // create a style sheet and cache it in the constructor
                    // this will work once constructable stylesheets arrive
                    // https://wicg.github.io/construct-stylesheets/
                    this._styleSheet = new CSSStyleSheet();
                    this._styleSheet.replaceSync(this.styles.join('\n'));
                }
                catch (error) { }
            }
            return this._styleSheet;
        }
        /**
         * The component's {@link HTMLStyleElement}
         *
         * @remarks
         * This getter will create a {@link HTMLStyleElement} node and cache it for use with each
         * instance of the component.
         *
         * @internal
         * @private
         */
        static get styleElement() {
            if (this.styles.length && !this.hasOwnProperty('_styleElement')) {
                this._styleElement = document.createElement('style');
                this._styleElement.title = this.selector;
                this._styleElement.textContent = this.styles.join('\n');
            }
            return this._styleElement;
        }
        // TODO: create tests for style inheritance
        /**
         * The component's styles
         *
         * @remarks
         * Can be set through the {@link component} decorator's `styles` option (defaults to `undefined`).
         * Styles set in the {@link component} decorator will be merged with the class's static property.
         * This allows to inherit styles from a parent component and add additional styles on the child component.
         * In order to inherit styles from a parent component, an explicit super call has to be included. By
         * default no styles are inherited.
         *
         * ```typescript
         * @component({
         *      selector: 'my-element'
         * })
         * class MyElement extends MyBaseElement {
         *
         *      static get styles (): string[] {
         *
         *          return [
         *              ...super.styles,
         *              ':host { background-color: green; }'
         *          ];
         *      }
         * }
         * ```
         */
        static get styles() {
            return [];
        }
        /**
         * Override to specify attributes which should be observed, but don't have an associated property
         *
         * @remark
         * For properties which are decorated with the {@link property} decorator, an observed attribute
         * is automatically created and does not need to be specified here. Fot attributes that don't
         * have an associated property, return the attribute names in this getter. Changes to these
         * attributes can be handled in the {@link attributeChangedCallback} method.
         *
         * When extending components, make sure to return the super class's observedAttributes
         * if you override this getter (except if you don't want to inherit observed attributes):
         *
         * ```typescript
         * @component({
         *      selector: 'my-element'
         * })
         * class MyElement extends MyBaseElement {
         *
         *      static get observedAttributes (): string[] {
         *
         *          return [...super.observedAttributes, 'my-additional-attribute'];
         *      }
         * }
         * ```
         */
        static get observedAttributes() {
            return [];
        }
        /**
         * Invoked each time the component is moved to a new document
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         *
         * N.B.: When overriding this callback, make sure to include a super-call.
         */
        adoptedCallback() {
            this._notifyLifecycle('adopted');
        }
        /**
         * Invoked each time the component is appended into a document-connected element
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         *
         * N.B.: When overriding this callback, make sure to include a super-call.
         */
        connectedCallback() {
            this.requestUpdate();
            this._notifyLifecycle('connected');
        }
        /**
         * Invoked each time the component is disconnected from the document's DOM
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         *
         * N.B.: When overriding this callback, make sure to include a super-call.
         */
        disconnectedCallback() {
            this._unlisten();
            this._notifyLifecycle('disconnected');
            this._hasUpdated = false;
        }
        /**
         * Invoked each time one of the component's attributes is added, removed, or changed
         *
         * @remarks
         * Which attributes to notice change for is specified in {@link observedAttributes}.
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         *
         * For decorated properties with an associated attribute, this is handled automatically.
         *
         * This method can be overridden to customize the handling of attribute changes. When overriding
         * this method, a super-call should be included, to ensure attribute changes for decorated properties
         * are processed correctly.
         *
         * ```typescript
         * @component({
         *      selector: 'my-element'
         * })
         * class MyElement extends Component {
         *
         *      attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
         *
         *          super.attributeChangedCallback(attribute, oldValue, newValue);
         *
         *          // do custom handling...
         *      }
         * }
         * ```
         *
         * @param attribute The name of the changed attribute
         * @param oldValue  The old value of the attribute
         * @param newValue  The new value of the attribute
         */
        attributeChangedCallback(attribute, oldValue, newValue) {
            if (this._isReflecting || oldValue === newValue)
                return;
            this.reflectAttribute(attribute, oldValue, newValue);
        }
        /**
         * Invoked each time the component updates
         *
         * @remarks
         * The `updateCallback` is invoked synchronously by the {@link update} method and therefore happens directly after
         * rendering, property reflection and property change events.
         *
         * N.B.: Changes made to properties or attributes inside this callback *won't* cause another update.
         * To cause an update, defer changes with the help of a Promise.
         *
         * ```typescript
         * @component({
         *      selector: 'my-element'
         * })
         * class MyElement extends Component {
         *
         *      updateCallback (changes: Changes, firstUpdate: boolean) {
         *
         *          Promise.resolve().then(() => {
         *              // perform changes which need to cause another update here
         *          });
         *      }
         * }
         * ```
         *
         * @param changes       A map of properties that changed in the update, containg the property key and the old value
         * @param firstUpdate   A boolean indicating if this was the first update
         */
        updateCallback(changes, firstUpdate) { }
        /**
         * Dispatch a custom event
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
         *
         * @param eventName An event name
         * @param eventInit A {@link CustomEventInit} dictionary
         */
        notify(eventName, eventInit) {
            this.dispatchEvent(new CustomEvent(eventName, eventInit));
        }
        /**
         * Watch property changes occurring in the executor and raise custom events
         *
         * @remarks
         * Property changes should trigger custom events when they are caused by internal state changes,
         * but not if they are caused by a consumer of the component API directly, e.g.:
         *
         * ```typescript
         * document.querySelector('my-custom-element').customProperty = true;
         * ```.
         *
         * This means, we cannot automate this process through property setters, as we can't be sure who
         * invoked the setter - internal calls or external calls.
         *
         * One option is to manually raise the event, which can become tedious and forces us to use string-
         * based event names or property names, which are difficult to refactor, e.g.:
         *
         * ```typescript
         * this.customProperty = true;
         * // if we refactor the property name, we can easily miss the notify call
         * this.notify('customProperty');
         * ```
         *
         * A more convenient way is to execute the internal changes in a wrapper which can detect the changed
         * properties and will automatically raise the required events. This eliminates the need to manually
         * raise events and refactoring does no longer affect the process.
         *
         * ```typescript
         * this.watch(() => {
         *
         *      this.customProperty = true;
         *      // we can add more property modifications to notify in here
         * });
         * ```
         *
         * @param executor A function that performs the changes which should be notified
         */
        watch(executor) {
            // back up current changed properties
            const previousChanges = new Map(this._changedProperties);
            // execute the changes
            executor();
            // add all new or updated changed properties to the notifying properties
            for (const [propertyKey, oldValue] of this._changedProperties) {
                const added = !previousChanges.has(propertyKey);
                const updated = !added && this.hasChanged(propertyKey, previousChanges.get(propertyKey), oldValue);
                if (added || updated) {
                    this._notifyingProperties.set(propertyKey, oldValue);
                }
            }
        }
        /**
         * Request an update of the component
         *
         * @remarks
         * This method is called automatically when the value of a decorated property or its associated
         * attribute changes. If you need the component to update based on a state change that is
         * not covered by a decorated property, call this method without any arguments.
         *
         * @param propertyKey   The name of the changed property that requests the update
         * @param oldValue      The old property value
         * @param newValue      the new property value
         * @returns             A Promise which is resolved when the update is completed
         */
        requestUpdate(propertyKey, oldValue, newValue) {
            if (propertyKey) {
                // if the {@link PropertyDeclaration}'s observe option is `false`, {@link hasChanged}
                // will return `false` and no update will be requested
                if (!this.hasChanged(propertyKey, oldValue, newValue))
                    return this._updateRequest;
                // store changed property for batch processing
                this._changedProperties.set(propertyKey, oldValue);
                // if we are in reflecting state, an attribute is reflecting to this property and we
                // can skip reflecting the property back to the attribute
                // property changes need to be tracked however and {@link render} must be called after
                // the attribute change is reflected to this property
                if (!this._isReflecting)
                    this._reflectingProperties.set(propertyKey, oldValue);
            }
            if (!this._hasRequestedUpdate) {
                // enqueue update request if none was enqueued already
                this._enqueueUpdate();
            }
            return this._updateRequest;
        }
        /**
         * Renders the component's template to its {@link renderRoot}
         *
         * @remarks
         * Uses lit-html's {@link lit-html#render} method to render a {@link lit-html#TemplateResult} to the
         * component's render root. The component instance will be passed to the static template method
         * automatically. To make additional properties available to the template method, you can pass them to the
         * render method.
         *
         * ```typescript
         * const dateFormatter = (date: Date) => { // return some date transformation...
         * };
         *
         * @component({
         *      selector: 'my-element',
         *      template: (element, formatDate) => html`<span>Last updated: ${ formatDate(element.lastUpdated) }</span>`
         * })
         * class MyElement extends Component {
         *
         *      @property()
         *      lastUpdated: Date;
         *
         *      render () {
         *          // make the date formatter available in the template by passing it to render()
         *          super.render(dateFormatter);
         *      }
         * }
         * ```
         *
         * @param helpers   Any additional objects which should be available in the template scope
         */
        render(...helpers) {
            const constructor = this.constructor;
            const template = constructor.template && constructor.template(this, ...helpers);
            if (template)
                render(template, this.renderRoot, { eventContext: this });
        }
        /**
         * Updates the component after an update was requested with {@link requestUpdate}
         *
         * @remarks
         * This method renders the template, reflects changed properties to attributes and
         * dispatches change events for properties which are marked for notification.
         * To handle updates differently, this method can be overridden and a map of property
         * changes is provided.
         *
         * @param changes   A map of properties that changed in the update, containg the property key and the old value
         */
        update(changes) {
            this.render();
            // reflect all properties marked for reflection
            this._reflectingProperties.forEach((oldValue, propertyKey) => {
                this.reflectProperty(propertyKey, oldValue, this[propertyKey]);
            });
            // notify all properties marked for notification
            this._notifyingProperties.forEach((oldValue, propertyKey) => {
                this.notifyProperty(propertyKey, oldValue, this[propertyKey]);
            });
        }
        /**
         * Check if a property changed
         *
         * @remarks
         * This method resolves the {@link PropertyChangeDetector} for the property and returns its result.
         * If none is defined (the property declaration's `observe` option is `false`) it returns false.
         * It catches any error in custom {@link PropertyChangeDetector}s and throws a more helpful one.
         *
         * @param propertyKey   The key of the property to check
         * @param oldValue      The old property value
         * @param newValue      The new property value
         * @returns             `true` if the property changed, `false` otherwise
         */
        hasChanged(propertyKey, oldValue, newValue) {
            const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
            // observe is either `false` or a {@link PropertyChangeDetector}
            if (propertyDeclaration && isPropertyChangeDetector(propertyDeclaration.observe)) {
                try {
                    return propertyDeclaration.observe.call(null, oldValue, newValue);
                }
                catch (error) {
                    throw CHANGE_DETECTOR_ERROR(propertyDeclaration.observe);
                }
            }
            return false;
        }
        /**
         * Gets the {@link PropertyDeclaration} for a decorated property
         *
         * @param propertyKey The property key for which to retrieve the declaration
         */
        getPropertyDeclaration(propertyKey) {
            return this.constructor.properties.get(propertyKey);
        }
        /**
         * Reflect an attribute value to its associated property
         *
         * @remarks
         * This method checks, if any custom {@link AttributeReflector} has been defined for the
         * associated property and invokes the appropriate reflector. If not, it will use the default
         * reflector {@link _reflectAttribute}.
         *
         * It catches any error in custom {@link AttributeReflector}s and throws a more helpful one.
         *
         * @param attributeName The propert key of the property to reflect
         * @param oldValue      The old property value
         * @param newValue      The new property value
         */
        reflectAttribute(attributeName, oldValue, newValue) {
            const constructor = this.constructor;
            const propertyKey = constructor.attributes.get(attributeName);
            // ignore user-defined observed attributes
            // TODO: test this and remove the log
            if (!propertyKey) {
                console.log(`observed attribute "${attributeName}" not found... ignoring...`);
                return;
            }
            const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
            // don't reflect if {@link PropertyDeclaration.reflectAttribute} is false
            if (propertyDeclaration.reflectAttribute) {
                this._isReflecting = true;
                if (isAttributeReflector(propertyDeclaration.reflectAttribute)) {
                    try {
                        propertyDeclaration.reflectAttribute.call(this, attributeName, oldValue, newValue);
                    }
                    catch (error) {
                        throw ATTRIBUTE_REFLECTOR_ERROR(propertyDeclaration.reflectAttribute);
                    }
                }
                else if (isPropertyKey(propertyDeclaration.reflectAttribute)) {
                    try {
                        this[propertyDeclaration.reflectAttribute](attributeName, oldValue, newValue);
                    }
                    catch (error) {
                        throw ATTRIBUTE_REFLECTOR_ERROR(propertyDeclaration.reflectAttribute);
                    }
                }
                else {
                    this._reflectAttribute(attributeName, oldValue, newValue);
                }
                this._isReflecting = false;
            }
        }
        /**
         * Reflect a property value to its associated attribute
         *
         * @remarks
         * This method checks, if any custom {@link PropertyReflector} has been defined for the
         * property and invokes the appropriate reflector. If not, it will use the default
         * reflector {@link _reflectProperty}.
         *
         * It catches any error in custom {@link PropertyReflector}s and throws a more helpful one.
         *
         * @param propertyKey   The propert key of the property to reflect
         * @param oldValue      The old property value
         * @param newValue      The new property value
         */
        reflectProperty(propertyKey, oldValue, newValue) {
            const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
            // don't reflect if {@link propertyDeclaration.reflectProperty} is false
            if (propertyDeclaration && propertyDeclaration.reflectProperty) {
                // attributeChangedCallback is called synchronously, we can catch the state there
                this._isReflecting = true;
                if (isPropertyReflector(propertyDeclaration.reflectProperty)) {
                    try {
                        propertyDeclaration.reflectProperty.call(this, propertyKey, oldValue, newValue);
                    }
                    catch (error) {
                        throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                    }
                }
                else if (isPropertyKey(propertyDeclaration.reflectProperty)) {
                    try {
                        this[propertyDeclaration.reflectProperty](propertyKey, oldValue, newValue);
                    }
                    catch (error) {
                        throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                    }
                }
                else {
                    this._reflectProperty(propertyKey, oldValue, newValue);
                }
                this._isReflecting = false;
            }
        }
        /**
         * Raise an event for a property change
         *
         * @remarks
         * This method checks, if any custom {@link PropertyNotifier} has been defined for the
         * property and invokes the appropriate notifier. If not, it will use the default
         * notifier {@link _notifyProperty}.
         *
         * It catches any error in custom {@link PropertyReflector}s and throws a more helpful one.
         *
         * @param propertyKey   The propert key of the property to raise an event for
         * @param oldValue      The old property value
         * @param newValue      The new property value
         */
        notifyProperty(propertyKey, oldValue, newValue) {
            const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
            if (propertyDeclaration && propertyDeclaration.notify) {
                if (isPropertyNotifier(propertyDeclaration.notify)) {
                    try {
                        propertyDeclaration.notify.call(this, propertyKey, oldValue, newValue);
                    }
                    catch (error) {
                        throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify.toString());
                    }
                }
                else if (isPropertyKey(propertyDeclaration.notify)) {
                    try {
                        this[propertyDeclaration.notify](propertyKey, oldValue, newValue);
                    }
                    catch (error) {
                        throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify);
                    }
                }
                else {
                    this._notifyProperty(propertyKey, oldValue, newValue);
                }
            }
        }
        /**
         * Creates the component's render root
         *
         * @remarks
         * The render root is where the {@link render} method will attach its DOM output. When using the component
         * with shadow mode, it will be a {@link ShadowRoot}, otherwise it will be the component itself.
         *
         * @internal
         * @private
         */
        _createRenderRoot() {
            return this.constructor.shadow
                ? this.attachShadow({ mode: 'open' })
                : this;
        }
        /**
         * Adds the component's styles to its {@link renderRoot}
         *
         * @remarks
         * If constructable stylesheets are available, the component's {@link CSSStyleSheet} instance will be adopted
         * by the {@link ShadowRoot}. If not, a style element is created and attached to the {@link ShadowRoot}. If the
         * component is not using shadow mode, a script tag will be appended to the document's `<head>`. For multiple
         * instances of the same component only one stylesheet will be added to the document.
         *
         * @internal
         * @private
         */
        _adoptStyles() {
            const constructor = this.constructor;
            const styleSheet = constructor.styleSheet;
            const styleElement = constructor.styleElement;
            const styles = constructor.styles;
            if (styleSheet) {
                // TODO: test this part once we have constructable stylesheets (Chrome 73)
                if (!constructor.shadow) {
                    if (document.adoptedStyleSheets.includes(styleSheet))
                        return;
                    document.adoptedStyleSheets = [
                        ...document.adoptedStyleSheets,
                        styleSheet
                    ];
                }
                else {
                    // this will work once constructable stylesheets arrive
                    // https://wicg.github.io/construct-stylesheets/
                    this.renderRoot.adoptedStyleSheets = [styleSheet];
                }
            }
            else if (styleElement) {
                // TODO: test we don't duplicate stylesheets for non-shadow elements
                const styleAlreadyAdded = constructor.shadow
                    ? false
                    : Array.from(document.styleSheets).find(style => style.title === constructor.selector) && true || false;
                if (styleAlreadyAdded)
                    return;
                // clone the cached style element
                const style = styleElement.cloneNode(true);
                if (constructor.shadow) {
                    this.renderRoot.appendChild(style);
                }
                else {
                    document.head.appendChild(style);
                }
            }
        }
        /**
         * The default attribute reflector
         *
         * @remarks
         * If no {@link AttributeReflector} is defined in the {@link PropertyDeclaration} this
         * method is used to reflect the attribute value to its associated property.
         *
         * @param attributeName The name of the attribute to reflect
         * @param oldValue      The old attribute value
         * @param newValue      The new attribute value
         *
         * @internal
         * @private
         */
        _reflectAttribute(attributeName, oldValue, newValue) {
            const constructor = this.constructor;
            const propertyKey = constructor.attributes.get(attributeName);
            const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
            const propertyValue = propertyDeclaration.converter.fromAttribute.call(this, newValue);
            this[propertyKey] = propertyValue;
        }
        /**
         * The default property reflector
         *
         * @remarks
         * If no {@link PropertyReflector} is defined in the {@link PropertyDeclaration} this
         * method is used to reflect the property value to its associated attribute.
         *
         * @param propertyKey   The property key of the property to reflect
         * @param oldValue      The old property value
         * @param newValue      The new property value
         *
         * @internal
         * @private
         */
        _reflectProperty(propertyKey, oldValue, newValue) {
            // this function is only called for properties which have a declaration
            const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
            // if the default reflector is used, we need to check if an attribute for this property exists
            // if not, we won't reflect
            if (!propertyDeclaration.attribute)
                return;
            // if attribute is truthy, it's a string
            const attributeName = propertyDeclaration.attribute;
            // resolve the attribute value
            const attributeValue = propertyDeclaration.converter.toAttribute.call(this, newValue);
            // undefined means don't change
            if (attributeValue === undefined) {
                return;
            }
            // null means remove the attribute
            else if (attributeValue === null) {
                this.removeAttribute(attributeName);
            }
            else {
                this.setAttribute(attributeName, attributeValue);
            }
        }
        /**
         * Dispatch a property-changed event
         *
         * @param propertyKey
         * @param oldValue
         * @param newValue
         *
         * @internal
         * @private
         */
        _notifyProperty(propertyKey, oldValue, newValue) {
            const eventName = createEventName(propertyKey, '', 'changed');
            this.dispatchEvent(new CustomEvent(eventName, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    property: propertyKey,
                    previous: oldValue,
                    current: newValue,
                },
            }));
        }
        /**
         * Dispatch a lifecycle event
         *
         * @param lifecycle The lifecycle for which to raise the event (will be the event name)
         * @param detail    Optional event details
         *
         * @internal
         * @private
         */
        _notifyLifecycle(lifecycle, detail) {
            this.dispatchEvent(new CustomEvent(lifecycle, Object.assign({ bubbles: true, composed: true, cancelable: true }, (detail ? { detail: detail } : {}))));
        }
        /**
         * Bind component listeners
         *
         * @internal
         * @private
         */
        _listen() {
            this.constructor.listeners.forEach((declaration, listener) => {
                const instanceDeclaration = {
                    // copy the class's static listener declaration into an instance listener declaration
                    event: declaration.event,
                    options: declaration.options,
                    // bind the components listener method to the component instance and store it in the instance declaration
                    listener: this[listener].bind(this),
                    // determine the event target and store it in the instance declaration
                    target: (declaration.target)
                        ? (typeof declaration.target === 'function')
                            ? declaration.target.call(this)
                            : declaration.target
                        : this
                };
                // add the bound event listener to the target
                instanceDeclaration.target.addEventListener(instanceDeclaration.event, instanceDeclaration.listener, instanceDeclaration.options);
                // save the instance listener declaration in the component instance
                this._listenerDeclarations.push(instanceDeclaration);
            });
        }
        /**
         * Unbind component listeners
         *
         * @internal
         * @private
         */
        _unlisten() {
            this._listenerDeclarations.forEach((declaration) => {
                declaration.target.removeEventListener(declaration.event, declaration.listener, declaration.options);
            });
        }
        /**
         * Enqueue a request for an asynchronous update
         *
         * @internal
         * @private
         */
        _enqueueUpdate() {
            return __awaiter(this, void 0, void 0, function* () {
                let resolve;
                const previousRequest = this._updateRequest;
                // mark the component as having requested an update, the {@link _requestUpdate}
                // method will not enqueue a further request for update if one is scheduled
                this._hasRequestedUpdate = true;
                this._updateRequest = new Promise(res => resolve = res);
                // wait for the previous update to resolve
                // `await` is asynchronous and will return execution to the {@link requestUpdate} method
                // and essentially allows us to batch multiple synchronous property changes, before the
                // execution can resume here
                yield previousRequest;
                const result = this._scheduleUpdate();
                // the actual update may be scheduled asynchronously as well
                if (result)
                    yield result;
                // resolve the new {@link _updateRequest} after the result of the current update resolves
                resolve(!this._hasRequestedUpdate);
            });
        }
        /**
         * Schedule the update of the component
         *
         * @remarks
         * Schedules the first update of the component as soon as possible and all consecutive updates
         * just before the next frame. In the latter case it returns a Promise which will be resolved after
         * the update is done.
         *
         * @internal
         * @private
         */
        _scheduleUpdate() {
            if (!this._hasUpdated) {
                this._performUpdate();
            }
            else {
                // schedule the update via requestAnimationFrame to avoid multiple redraws per frame
                return new Promise(resolve => requestAnimationFrame(() => {
                    this._performUpdate();
                    resolve();
                }));
            }
        }
        /**
         * Perform the component update
         *
         * @remarks
         * Invokes {@link updateCallback} after performing the update and cleans up the component
         * state. During the first update the element's styles will be added. Dispatches the update
         * lifecycle event.
         *
         * @internal
         * @private
         */
        _performUpdate() {
            // we have to wait until the component is connected before we can do any updates
            // the {@link connectedCallback} will call {@link requestUpdate} in any case, so we can
            // simply bypass any actual update and clean-up until then
            if (this.isConnected) {
                const changes = new Map(this._changedProperties);
                // pass a copy of the property changes to the update method, so property changes
                // are available in an overridden update method
                this.update(changes);
                // reset property maps directly after the update, so changes during the updateCallback
                // can be recorded for the next update, which has to be triggered manually though
                this._changedProperties = new Map();
                this._reflectingProperties = new Map();
                this._notifyingProperties = new Map();
                // in the first update we adopt the element's styles and set up declared listeners
                if (!this._hasUpdated) {
                    this._adoptStyles();
                    // bind listeners after the update, this way we ensure all DOM is rendered, all properties
                    // are up-to-date and any user-created objects (e.g. workers) will be created in an
                    // overridden connectedCallback
                    this._listen();
                }
                this.updateCallback(changes, !this._hasUpdated);
                this._notifyLifecycle('update', { changes: changes, firstUpdate: !this._hasUpdated });
                this._hasUpdated = true;
            }
            // mark component as updated *after* the update to prevent infinte loops in the update process
            // N.B.: any property changes during the update will not trigger another update
            this._hasRequestedUpdate = false;
        }
    }
    /**
     * A map of attribute names and their respective property keys
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * property key that belongs to an attribute name.
     *
     * @internal
     */
    Component.attributes = new Map();
    /**
     * A map of property keys and their respective property declarations
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * {@link PropertyDeclaration} of a property.
     *
     * @internal
     */
    Component.properties = new Map();
    /**
     * A map of property keys and their respective listener declarations
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * {@link ListenerDeclaration} of a method.
     *
     * @internal
     */
    Component.listeners = new Map();
    //# sourceMappingURL=component.js.map

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
    const css = (literals, ...substitutions) => {
        return substitutions.reduce((prev, curr, i) => prev + curr + literals[i + 1], literals[0]);
    };
    // const color = 'green';
    // const mixinBox = (borderWidth: string = '1px', borderColor: string = 'silver') => css`
    //   display: block;
    //   box-sizing: border-box;
    //   border: ${borderWidth} solid ${borderColor};
    // `;
    // const mixinHover = (selector: string) => css`
    // ${ selector }:hover {
    //   background-color: var(--hover-color, dodgerblue);
    // }
    // `;
    // const styles = css`
    // :host {
    //   --hover-color: ${ color };
    //   display: block;
    //   ${ mixinBox() }
    // }
    // ${ mixinHover(':host') }
    // ::slotted(*) {
    //   margin: 0;
    // }
    // `;
    // console.log(styles);
    //# sourceMappingURL=css.js.map

    const ArrowUp = 'ArrowUp';
    const ArrowDown = 'ArrowDown';
    const ArrowLeft = 'ArrowLeft';
    const ArrowRight = 'ArrowRight';
    const Enter = 'Enter';
    const Escape = 'Escape';
    const Space = ' ';
    const Tab = 'Tab';
    //# sourceMappingURL=keys.js.map

    class ListKeyManager extends EventTarget {
        constructor(host, items, direction = 'vertical') {
            super();
            this.host = host;
            this.direction = direction;
            this.listeners = new Map();
            this.items = Array.from(items);
            this.itemType = this.items[0] && this.items[0].constructor;
            this.bindHost();
        }
        getActiveItem() {
            return this.activeItem;
        }
        ;
        setActiveItem(item, interactive = false) {
            const index = this.items.indexOf(item);
            const entry = [
                index > -1 ? index : undefined,
                index > -1 ? item : undefined
            ];
            this.setEntryActive(entry, interactive);
        }
        setNextItemActive(interactive = false) {
            this.setEntryActive(this.getNextEntry(), interactive);
        }
        setPreviousItemActive(interactive = false) {
            this.setEntryActive(this.getPreviousEntry(), interactive);
        }
        setFirstItemActive(interactive = false) {
            this.setEntryActive(this.getFirstEntry(), interactive);
        }
        setLastItemActive(interactive = false) {
            this.setEntryActive(this.getLastEntry(), interactive);
        }
        handleKeydown(event) {
            const [prev, next] = (this.direction === 'horizontal') ? [ArrowLeft, ArrowRight] : [ArrowUp, ArrowDown];
            const prevIndex = this.activeIndex;
            let handled = false;
            switch (event.key) {
                case prev:
                    this.setPreviousItemActive(true);
                    handled = true;
                    break;
                case next:
                    this.setNextItemActive(true);
                    handled = true;
                    break;
            }
            if (handled) {
                event.preventDefault();
                if (prevIndex !== this.activeIndex)
                    this.dispatchActiveItemChange(prevIndex);
            }
        }
        handleMousedown(event) {
            const target = event.target;
            if (this.itemType && target instanceof this.itemType && !target.disabled) {
                const prevIndex = this.activeIndex;
                this.setActiveItem(event.target, true);
                if (prevIndex !== this.activeIndex)
                    this.dispatchActiveItemChange(prevIndex);
            }
        }
        handleFocus(event) {
            const target = event.target;
            if (this.itemType && target instanceof this.itemType && !target.disabled) {
                const prevIndex = this.activeIndex;
                this.setActiveItem(event.target, true);
                if (prevIndex !== this.activeIndex)
                    this.dispatchActiveItemChange(prevIndex);
            }
        }
        dispatchActiveItemChange(previousIndex) {
            const event = new CustomEvent('active-item-change', {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: {
                    previous: {
                        index: previousIndex,
                        item: (typeof previousIndex === 'number') ? this.items[previousIndex] : undefined
                    },
                    current: {
                        index: this.activeIndex,
                        item: this.activeItem
                    }
                }
            });
            this.dispatchEvent(event);
        }
        setEntryActive(entry, interactive = false) {
            [this.activeIndex, this.activeItem] = entry;
        }
        getNextEntry(fromIndex) {
            fromIndex = (typeof fromIndex === 'number')
                ? fromIndex
                : (typeof this.activeIndex === 'number')
                    ? this.activeIndex
                    : -1;
            const lastIndex = this.items.length - 1;
            let nextIndex = fromIndex + 1;
            let nextItem = this.items[nextIndex];
            while (nextIndex < lastIndex && nextItem && nextItem.disabled) {
                nextItem = this.items[++nextIndex];
            }
            return (nextItem && !nextItem.disabled) ? [nextIndex, nextItem] : [this.activeIndex, this.activeItem];
        }
        getPreviousEntry(fromIndex) {
            fromIndex = (typeof fromIndex === 'number')
                ? fromIndex
                : (typeof this.activeIndex === 'number')
                    ? this.activeIndex
                    : 0;
            let prevIndex = fromIndex - 1;
            let prevItem = this.items[prevIndex];
            while (prevIndex > 0 && prevItem && prevItem.disabled) {
                prevItem = this.items[--prevIndex];
            }
            return (prevItem && !prevItem.disabled) ? [prevIndex, prevItem] : [this.activeIndex, this.activeItem];
        }
        getFirstEntry() {
            return this.getNextEntry(-1);
        }
        getLastEntry() {
            return this.getPreviousEntry(this.items.length);
        }
        bindHost() {
            // TODO: enable reconnecting the host element? no need if FocusManager is created in connectedCallback
            this.listeners = new Map([
                ['focusin', this.handleFocus.bind(this)],
                ['keydown', this.handleKeydown.bind(this)],
                ['mousedown', this.handleMousedown.bind(this)],
                ['disconnected', this.unbindHost.bind(this)]
            ]);
            this.listeners.forEach((listener, event) => this.host.addEventListener(event, listener));
        }
        unbindHost() {
            this.listeners.forEach((listener, event) => this.host.removeEventListener(event, listener));
        }
    }
    class FocusKeyManager extends ListKeyManager {
        setEntryActive(entry, interactive = false) {
            super.setEntryActive(entry, interactive);
            if (this.activeItem && interactive)
                this.activeItem.focus();
        }
    }
    //# sourceMappingURL=list-key-manager.js.map

    var Icon_1;
    let Icon = Icon_1 = class Icon extends Component {
        constructor() {
            super(...arguments);
            this.icon = 'info';
            this.set = 'fa';
        }
        /**
         * Get the svg sprite url for the requested icon set
         *
         * @remarks
         * The sprite url for an icon set can be set through a `meta` tag in the html document. You can define
         * custom icon sets by chosing an identifier (such as `:myset` instead of `:fa`, `:mat` or `:ie`) and
         * configuring its location.
         *
         * ```html
         * <!doctype html>
         * <html>
         *    <head>
         *    <!-- supports multiple svg sprites -->
         *    <meta name="ui-icon:svg-sprite:fa" content="assets/icons/sprites/font-awesome/sprite.svg" />
         *    <meta name="ui-icon:svg-sprite:mat" content="assets/icons/sprites/material/sprite.svg" />
         *    <meta name="ui-icon:svg-sprite:ei" content="assets/icon/sprites/evil-icons/sprite.svg" />
         *    <!-- supports custom svg sprites -->
         *    <meta name="ui-icon:svg-sprite:myset" content="assets/icon/sprites/myset/my_sprite.svg" />
         *    </head>
         *    ...
         * </html>
         * ```
         *
         * When using the icon element, specify your custom icon set.
         *
         * ```html
         * <!-- use attributes -->
         * <ui-icon data-icon="my_icon_id" data-set="myset"></ui-icon>
         * <!-- or use property bindings within lit-html templates -->
         * <ui-icon .icon=${'my_icon_id'} .set=${'myset'}></ui-icon>
         * ```
         *
         * If no sprite url is specified for a set, the icon element will attempt to use an svg icon from
         * an inlined svg element in the current document.
         */
        static getSprite(set) {
            if (!this._sprites.has(set)) {
                const meta = document.querySelector(`meta[name="ui-icon:sprite:${set}"][content]`);
                if (meta) {
                    this._sprites.set(set, meta.getAttribute('content'));
                }
            }
            return this._sprites.get(set) || '';
        }
        connectedCallback() {
            super.connectedCallback();
            this.setAttribute('role', 'img');
            this.setAttribute('aria-hidden', 'true');
        }
    };
    /**
     * A map for caching an icon set's sprite url
     */
    Icon._sprites = new Map();
    __decorate([
        property({
            attribute: 'data-icon'
        }),
        __metadata("design:type", Object)
    ], Icon.prototype, "icon", void 0);
    __decorate([
        property({
            attribute: 'data-set'
        }),
        __metadata("design:type", Object)
    ], Icon.prototype, "set", void 0);
    Icon = Icon_1 = __decorate([
        component({
            selector: 'ui-icon',
            styles: [css `
    :host {
        display: inline-flex;
        width: var(--line-height, 1.5em);
        height: var(--line-height, 1.5em);
        padding: calc((var(--line-height, 1.5em) - var(--font-size, 1em)) / 2);
        line-height: inherit;
        font-size: inherit;
        vertical-align: bottom;
        box-sizing: border-box;
    }
    svg {
        width: 100%;
        height: 100%;
        line-height: inherit;
        font-size: inherit;
        overflow: visible;
        fill: var(--icon-color, currentColor);
    }
    :host([data-set=uni]) {
        padding: 0em;
    }
    :host([data-set=mat]) {
        padding: 0;
    }
    :host([data-set=ei]) {
        padding: 0;
    }
    `],
            template: (element) => {
                const set = element.set;
                const icon = (set === 'mat')
                    ? `ic_${element.icon}_24px`
                    : (set === 'ei')
                        ? `ei-${element.icon}-icon`
                        : element.icon;
                return html `
        <svg focusable="false">
            <use href="${element.constructor.getSprite(set)}#${icon}"
            xlink:href="${element.constructor.getSprite(set)}#${icon}" />
        </svg>`;
            }
        })
    ], Icon);
    //# sourceMappingURL=icon.js.map

    let AccordionHeader = class AccordionHeader extends Component {
        constructor() {
            super(...arguments);
            this._disabled = false;
            this.expanded = false;
        }
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = value;
            this.tabindex = value ? null : 0;
        }
        connectedCallback() {
            super.connectedCallback();
            this.role = 'button';
            this.tabindex = this.disabled ? null : 0;
        }
        handleKeydown(event) {
            if (event.key === Enter || event.key === Space) {
                event.preventDefault();
                event.stopPropagation();
                this.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                }));
            }
        }
    };
    __decorate([
        property({
            attribute: 'aria-disabled',
            converter: AttributeConverterARIABoolean
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], AccordionHeader.prototype, "disabled", null);
    __decorate([
        property({
            attribute: 'aria-expanded',
            converter: AttributeConverterARIABoolean
        }),
        __metadata("design:type", Object)
    ], AccordionHeader.prototype, "expanded", void 0);
    __decorate([
        property({
            attribute: 'aria-controls',
            converter: AttributeConverterString
        }),
        __metadata("design:type", String)
    ], AccordionHeader.prototype, "controls", void 0);
    __decorate([
        property({
            converter: AttributeConverterString
        }),
        __metadata("design:type", String)
    ], AccordionHeader.prototype, "role", void 0);
    __decorate([
        property({
            converter: AttributeConverterNumber
        }),
        __metadata("design:type", Object)
    ], AccordionHeader.prototype, "tabindex", void 0);
    __decorate([
        listener({
            event: 'keydown'
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], AccordionHeader.prototype, "handleKeydown", null);
    AccordionHeader = __decorate([
        component({
            selector: 'ui-accordion-header',
            styles: [css `
    :host {
        all: inherit;
        display: flex;
        flex-flow: row;
        flex: 1 1 100%;
        justify-content: space-between;
        padding: 1rem;
        font-weight: bold;
        cursor: pointer;
    }
    :host([aria-disabled=true]) {
        cursor: default;
    }
    :host([aria-expanded=true]) > ui-icon.expand,
    :host([aria-expanded=false]) > ui-icon.collapse {
        display: none;
    }
    `],
            template: element => html `
    <slot></slot>
    <ui-icon class="collapse" data-icon="minus" data-set="uni" aria-hidden="true"></ui-icon>
    <ui-icon class="expand" data-icon="plus" data-set="uni" aria-hidden="true"></ui-icon>
    `
        })
    ], AccordionHeader);
    //# sourceMappingURL=accordion-header.js.map

    const copyright = (date, author) => {
        return html `&copy; Copyright ${date.getFullYear()} ${author.trim()}`;
    };
    //# sourceMappingURL=copyright.js.map

    let nextAccordionPanelId = 0;
    let AccordionPanel = class AccordionPanel extends Component {
        constructor() {
            super();
            this._header = null;
            this._body = null;
            this.level = 1;
            this.expanded = false;
            this.disabled = false;
            this.id = this.id || `ui-accordion-panel-${nextAccordionPanelId++}`;
        }
        get contentHeight() {
            return !this.expanded ?
                '0px' :
                this._body ?
                    `${this._body.scrollHeight}px` :
                    'auto';
        }
        toggle() {
            if (this.disabled)
                return;
            // wrapping the property change in the watch method will dispatch a property change event
            this.watch(() => {
                this.expanded = !this.expanded;
                if (this._header)
                    this._header.expanded = this.expanded;
            });
        }
        connectedCallback() {
            super.connectedCallback();
            this.setHeader(this.querySelector(AccordionHeader.selector));
        }
        updateCallback(changes, firstUpdate) {
            if (firstUpdate) {
                // in the first update, we query the accordion-panel-body
                this._body = this.renderRoot.querySelector(`#${this.id}-body`);
                // having queried the accordion-panel-body, {@link contentHeight} can now calculate the
                // correct height of the panel body for animation
                // in order to re-evaluate the template binding for {@link contentHeight} we need to
                // trigger another render (this is cheap, only contentHeight has changed and will be updated)
                // however we cannot request another update while we are still in the current update cycle
                // using a Promise, we can defer requesting the update until after the current update is done
                Promise.resolve(true).then(() => this.requestUpdate());
            }
        }
        /**
         * Override the render method to inject custom helpers into the template
         */
        render() {
            super.render(copyright);
        }
        setHeader(header) {
            this._header = header;
            if (!header)
                return;
            header.setAttribute('slot', 'header');
            header.id = header.id || `${this.id}-header`;
            header.controls = `${this.id}-body`;
            header.expanded = this.expanded;
            header.disabled = this.disabled;
        }
    };
    __decorate([
        property({
            converter: AttributeConverterNumber
        }),
        __metadata("design:type", Object)
    ], AccordionPanel.prototype, "level", void 0);
    __decorate([
        property({
            converter: AttributeConverterBoolean
        }),
        __metadata("design:type", Object)
    ], AccordionPanel.prototype, "expanded", void 0);
    __decorate([
        property({
            converter: AttributeConverterBoolean
        }),
        __metadata("design:type", Object)
    ], AccordionPanel.prototype, "disabled", void 0);
    AccordionPanel = __decorate([
        component({
            selector: 'ui-accordion-panel',
            styles: [css `
    :host {
        display: flex;
        flex-direction: column;
    }
    :host > .ui-accordion-header {
        display: flex;
        flex-flow: row;
    }
    :host > .ui-accordion-body {
        height: auto;
        overflow: auto;
        transition: height .2s ease-out;
    }
    :host > .ui-accordion-body[aria-hidden=true] {
        height: 0;
        overflow: hidden;
    }
    .copyright {
        padding: 0 1rem 1rem;
        color: var(--disabled-color, '#ccc');
        font-size: 0.75rem;
    }
    `],
            template: (panel, copyright) => html `
    <div class="ui-accordion-header"
        role="heading"
        aria-level="${panel.level}"
        @click=${panel.toggle}>
        <slot name="header"></slot>
    </div>
    <div class="ui-accordion-body"
        id="${panel.id}-body"
        style="height: ${panel.contentHeight};"
        role="region"
        aria-hidden="${!panel.expanded}"
        aria-labelledby="${panel.id}-header">
        <slot></slot>
        <span class="copyright">${copyright(new Date(), 'Alexander Wende')}</span>
    </div>
    `
        }),
        __metadata("design:paramtypes", [])
    ], AccordionPanel);
    //# sourceMappingURL=accordion-panel.js.map

    let Accordion = class Accordion extends Component {
        constructor() {
            super(...arguments);
            this.role = 'presentation';
        }
        connectedCallback() {
            super.connectedCallback();
            this.role = 'presentation';
            this.focusManager = new FocusKeyManager(this, this.querySelectorAll(AccordionHeader.selector));
        }
    };
    __decorate([
        property({
            reflectAttribute: false
        }),
        __metadata("design:type", Object)
    ], Accordion.prototype, "role", void 0);
    Accordion = __decorate([
        component({
            selector: 'ui-accordion',
            styles: [css `
    :host {
        display: flex;
        flex-direction: column;
        background: #fff;
        background-clip: border-box;
        box-sizing: border-box;
        border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
        border-radius: var(--border-radius, 0.25rem);
    }
    `],
            template: () => html `
    <slot></slot>
    `
        })
    ], Accordion);
    //# sourceMappingURL=accordion.js.map

    const styles = css `
demo-app {
  display: flex;
  flex-direction: column;
}

header {
  flex: 0 0 auto;
}

main {
  flex: 1 1 auto;
  padding: 1rem;
  box-sizing: border-box;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  grid-gap: 1rem;
}

.icons {
  display: flex;
  flex-flow: row wrap;
}

.settings-list {
  padding: 0;
  list-style: none;
}

.settings-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

ui-card {
  box-shadow: var(--box-shadow);
}

ui-accordion {
  box-shadow: var(--box-shadow);
}

ui-accordion-panel:not(:first-child) {
  border-top: var(--border-width) solid var(--border-color);
}

ui-accordion-panel h3 {
  margin: 1rem;
}

ui-accordion-panel p {
  margin: 1rem;
}
`;
    //# sourceMappingURL=app.styles.js.map

    const template = (element) => html `
    <header>
        <h1>Examples</h1>
    </header>

    <main>

        <div>
            <h2>Icon</h2>

            <h3>Font Awesome</h3>

            <div class="icons">
                <ui-icon .icon=${'chevron-right'}></ui-icon>
                <ui-icon .icon=${'envelope'}></ui-icon>
                <ui-icon .icon=${'lock'}></ui-icon>
                <ui-icon .icon=${'lock-open'}></ui-icon>
                <ui-icon .icon=${'paint-brush'}></ui-icon>
                <ui-icon .icon=${'pen'}></ui-icon>
                <ui-icon .icon=${'check'}></ui-icon>
                <ui-icon .icon=${'times'}></ui-icon>
                <ui-icon .icon=${'trash-alt'}></ui-icon>
                <ui-icon .icon=${'exclamation-triangle'}></ui-icon>
                <ui-icon .icon=${'info-circle'}></ui-icon>
                <ui-icon .icon=${'question-circle'}></ui-icon>
                <ui-icon .icon=${'user-circle'}></ui-icon>
                <ui-icon .icon=${'user'}></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${'check'}></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${'times'}></ui-icon></span>
                </li>
            </ul>

            <h3>Unicons</h3>

            <div class="icons">
                <ui-icon .icon=${'angle-right-b'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'envelope-alt'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'lock'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'unlock'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'brush-alt'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'pen'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'check'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'times'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'trash-alt'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'user-circle'} .set=${'uni'}></ui-icon>
                <ui-icon .icon=${'user'} .set=${'uni'}></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${'check'} .set=${'uni'}></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${'times'} .set=${'uni'}></ui-icon></span>
                </li>
            </ul>

            <h3>Material Icons</h3>

            <div class="icons">
                <ui-icon .icon=${'chevron_right'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'mail'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'lock'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'lock_open'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'brush'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'edit'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'check'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'clear'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'delete'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'warning'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'info'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'help'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'account_circle'} .set=${'mat'}></ui-icon>
                <ui-icon .icon=${'person'} .set=${'mat'}></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${'check'} .set=${'mat'}></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${'clear'} .set=${'mat'}></ui-icon></span>
                </li>
            </ul>

            <h3>Evil Icons</h3>

            <div class="icons">
                <ui-icon .icon=${'chevron-right'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'envelope'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'lock'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'unlock'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'paperclip'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'pencil'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'check'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'close'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'trash'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'exclamation'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'question'} .set=${'ei'}></ui-icon>
                <ui-icon .icon=${'user'} .set=${'ei'}></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${'check'} .set=${'ei'}></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${'close'} .set=${'ei'}></ui-icon></span>
                </li>
            </ul>

            <h2>Checkbox</h2>
            <ui-checkbox .checked=${true}></ui-checkbox>

            <h2>Toggle</h2>
            <ul class="settings-list">
                <li>
                    <span id="notify-email">Notification email</span>
                    <ui-toggle label-on="yes" label-off="no" aria-labelledby="notify-email" aria-checked="true"></ui-toggle>
                </li>
                <li>
                    <span id="notify-sms">Notification sms</span>
                    <ui-toggle label-on="yes" label-off="no" aria-labelledby="notify-sms"></ui-toggle>
                </li>
            </ul>
            <ul class="settings-list">
                <li>
                    <span id="notify">Notifications</span>
                    <ui-toggle aria-labelledby="notify" aria-checked="true"></ui-toggle>
                </li>
            </ul>
        </div>

        <div>
            <h2>Card</h2>
            <ui-card>
                <h3 slot="ui-card-header">Card Title</h3>
                <p slot="ui-card-body">Card body text...</p>
                <p slot="ui-card-footer">Card footer</p>
            </ui-card>

            <h2>Action Card</h2>
            <ui-action-card>
                <h3 slot="ui-action-card-header">Card Title</h3>
                <p slot="ui-action-card-body">Card body text...</p>
                <button slot="ui-action-card-actions">More</button>
            </ui-action-card>

            <h2>Plain Card</h2>
            <ui-plain-card>
                <h3 slot="ui-card-header">Card Title</h3>
                <p slot="ui-card-body">Card body text...</p>
                <p slot="ui-card-footer">Card footer</p>
            </ui-plain-card>

            <h2>Tabs</h2>
            <ui-tab-list>
                <ui-tab id="tab-1" aria-controls="tab-panel-1"><span>First Tab</span></ui-tab>
                <ui-tab id="tab-2" aria-controls="tab-panel-2">Second Tab</ui-tab>
                <ui-tab id="tab-3" aria-controls="tab-panel-3" aria-disabled="true">Third Tab</ui-tab>
                <ui-tab id="tab-4" aria-controls="tab-panel-4">Fourth Tab</ui-tab>
            </ui-tab-list>
            <ui-tab-panel id="tab-panel-1">
                <h3>First Tab Panel</h3>
                <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est. Laudem
                    constituam ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro recusabo an
                    est, wisi summo necessitatibus cum ne.</p>
            </ui-tab-panel>
            <ui-tab-panel id="tab-panel-2">
                <h3>Second Tab Panel</h3>
                <p>In clita tollit minimum quo, an accusata volutpat euripidis vim. Ferri quidam deleniti quo ea, duo
                    animal accusamus eu, cibo erroribus et mea. Ex eam wisi admodum praesent, has cu oblique ceteros
                    eleifend. Ex mel platonem assentior persequeris, vix cibo libris ut. Ad timeam accumsan est, et autem
                    omnes civibus mel. Mel eu ubique equidem molestiae, choro docendi moderatius ei nam.</p>
            </ui-tab-panel>
            <ui-tab-panel id="tab-panel-3">
                <h3>Third Tab Panel</h3>
                <p>I'm disabled, you shouldn't see me.</p>
            </ui-tab-panel>
            <ui-tab-panel id="tab-panel-4">
                <h3>Fourth Tab Panel</h3>
                <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est. Laudem
                    constituam ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro recusabo an
                    est, wisi summo necessitatibus cum ne.</p>
            </ui-tab-panel>
        </div>

        <div>
            <h2>Accordion</h2>

            <ui-accordion>

                <ui-accordion-panel id="custom-panel-id" expanded level="3">

                    <ui-accordion-header>Panel One</ui-accordion-header>

                    <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est.
                        Laudem constituam ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro
                        recusabo an est, wisi summo necessitatibus cum ne.</p>
                    <p>At usu epicurei assentior, putent dissentiet repudiandae ea quo. Pro ne debitis placerat
                        signiferumque, in sonet volumus interpretaris cum. Dolorum appetere ne quo. Dicta qualisque eos
                        ea, eam at nulla tamquam.
                    </p>

                </ui-accordion-panel>

                <ui-accordion-panel level="3">

                    <ui-accordion-header>Panel Two</ui-accordion-header>

                    <p>In clita tollit minimum quo, an accusata volutpat euripidis vim. Ferri quidam deleniti quo ea,
                        duo animal accusamus eu, cibo erroribus et mea. Ex eam wisi admodum praesent, has cu oblique
                        ceteros eleifend. Ex mel platonem assentior persequeris, vix cibo libris ut. Ad timeam accumsan
                        est, et autem omnes civibus mel. Mel eu ubique equidem molestiae, choro docendi moderatius ei
                        nam.</p>
                    <p>Qui suas solet ceteros cu, pertinax vulputate deterruisset eos ne. Ne ius vide nullam, alienum
                        ancillae reformidans cum ad. Ea meliore sapientem interpretaris eam. Commune delicata
                        repudiandae in eos, placerat incorrupte definitiones nec ex. Cu elitr tantas instructior sit,
                        eu eum alia graece neglegentur.</p>

                </ui-accordion-panel>

            </ui-accordion>

            <h2>Popover</h2>

            <overlay-demo></overlay-demo>
        </div>

    </main>
    `;
    //# sourceMappingURL=app.template.js.map

    // we can define mixins as
    const mixinContainer = (background = '#fff') => css `
    background: ${background};
    background-clip: border-box;
    box-sizing: border-box;
    border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
    border-radius: var(--border-radius, 0.25rem);
`;
    const style = css `
:host {
    --max-width: 40ch;
    display: flex;
    flex-flow: column;
    max-width: var(--max-width);
    padding: 1rem;
    /* we can apply mixins with spread syntax */
    ${mixinContainer()}
}
::slotted(*) {
    margin: 0;
}
`;
    let Card = class Card extends Component {
        connectedCallback() {
            super.connectedCallback();
            this.worker = new Worker('worker.js');
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.worker.terminate();
        }
        handleClick(event) {
            this.worker.terminate();
        }
        handleMessage(event) {
            this.watch(() => this.counter = event.data);
        }
    };
    __decorate([
        property({
            attribute: false
        }),
        __metadata("design:type", Number)
    ], Card.prototype, "counter", void 0);
    __decorate([
        listener({
            event: 'click',
            target: function () { return this.renderRoot.querySelector('button'); }
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], Card.prototype, "handleClick", null);
    __decorate([
        listener({
            event: 'message',
            target: function () { return this.worker; }
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MessageEvent]),
        __metadata("design:returntype", void 0)
    ], Card.prototype, "handleMessage", null);
    Card = __decorate([
        component({
            selector: 'ui-card',
            styles: [style],
            template: card => html `
    <slot name="ui-card-header"></slot>
    <slot name="ui-card-body"></slot>
    <slot name="ui-card-footer"></slot>
    <div>Worker counter: ${card.counter}</div>
    <button>Stop worker</button>
    `
        })
    ], Card);
    let ActionCard = class ActionCard extends Card {
        // we can inherit styles explicitly
        static get styles() {
            return [
                ...super.styles,
                'slot[name=ui-action-card-actions] { display: block; text-align: right; }'
            ];
        }
        handleClick() { }
        handleMessage() { }
    };
    __decorate([
        listener({ event: null }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ActionCard.prototype, "handleClick", null);
    __decorate([
        listener({ event: null }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ActionCard.prototype, "handleMessage", null);
    ActionCard = __decorate([
        component({
            selector: 'ui-action-card',
            template: card => html `
    <slot name="ui-action-card-header"></slot>
    <slot name="ui-action-card-body"></slot>
    <slot name="ui-action-card-actions"></slot>
    `
        })
    ], ActionCard);
    let PlainCard = class PlainCard extends Card {
    };
    PlainCard = __decorate([
        component({
            selector: 'ui-plain-card',
            styles: [
                `:host {
            display: block;
            max-width: 40ch;
        }`
            ]
            // if we don't specify a template, it will be inherited
        })
    ], PlainCard);
    //# sourceMappingURL=card.js.map

    let Checkbox = class Checkbox extends Component {
        constructor() {
            super(...arguments);
            this.checked = false;
        }
        toggle() {
            this.watch(() => this.checked = !this.checked);
        }
        handeKeyDown(event) {
            if (event.key === Enter || event.key === Space) {
                this.toggle();
                event.preventDefault();
            }
        }
        connectedCallback() {
            super.connectedCallback();
            // TODO: Document this use case!
            // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
            // HTMLElement has a setter and getter for tabIndex, we don't need a property decorator to reflect it
            // we are not allowed to set it in the constructor though, as it creates a reflected attribute, which
            // causes an error
            this.tabIndex = 0;
            // we initialize role in the connectedCallback as well, to prevent Chrome from reflecting early
            this.role = 'checkbox';
        }
    };
    __decorate([
        property(),
        __metadata("design:type", String)
    ], Checkbox.prototype, "role", void 0);
    __decorate([
        property({
            // the converter will be used to reflect from the checked attribute to the property, but not
            // the other way around, as we define a custom {@link PropertyReflector}
            converter: AttributeConverterBoolean,
            // we can use a {@link PropertyReflector} to reflect to multiple attributes in different ways
            reflectProperty: function (propertyKey, oldValue, newValue) {
                if (this.checked) {
                    this.setAttribute('checked', '');
                    this.setAttribute('aria-checked', 'true');
                }
                else {
                    this.removeAttribute('checked');
                    this.setAttribute('aria-checked', 'false');
                }
            }
        }),
        __metadata("design:type", Object)
    ], Checkbox.prototype, "checked", void 0);
    __decorate([
        listener({
            event: 'click'
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Checkbox.prototype, "toggle", null);
    __decorate([
        listener({
            event: 'keydown'
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], Checkbox.prototype, "handeKeyDown", null);
    Checkbox = __decorate([
        component({
            selector: 'ui-checkbox',
            styles: [css `
    :host {
            position: relative;
            display: inline-flex;
            width: 1rem;
            height: 1rem;
            cursor: pointer;
            border: var(--border-width, 0.125rem) solid var(--border-color, #bfbfbf);
            border-radius: var(--border-radius, 0.25rem);
            box-sizing: content-box;
            transition: .1s ease-in;
        }
        :host([aria-checked="true"]) {
            border-color: var(--selected-color, #bfbfbf);
            background-color: var(--selected-color, #bfbfbf);
        }
        .check-mark {
            position: absolute;
            top: 0.25rem;
            left: 0.125rem;
            display: block;
            width: 0.625rem;
            height: 0.25rem;
            border: solid var(--background-color, #ffffff);
            border-width: 0 0 var(--border-width, 0.125rem) var(--border-width, 0.125rem);
            transform: rotate(-45deg);
            transition: .1s ease-in;
            opacity: 0;
        }
        :host([aria-checked="true"]) .check-mark {
            opacity: 1;
        }
    `],
            template: checkbox => html `
    <span class="check-mark"></span>
    `
        })
    ], Checkbox);
    //# sourceMappingURL=checkbox.js.map

    function isEventBinding(binding) {
        return typeof binding === 'object'
            && typeof binding.target === 'object'
            && typeof binding.type === 'string'
            && (typeof binding.listener === 'function'
                || typeof binding.listener === 'object');
    }
    /**
     * Dispatches a CustomEvent on the target
     */
    function dispatch(target, type, detail, eventInit) {
        return target.dispatchEvent(new CustomEvent(type, Object.assign(Object.assign({ bubbles: true, composed: true, cancelable: true }, eventInit), { detail })));
    }
    /**
     * A class for managing event listeners
     *
     * @description
     * The EventManager class can be used to handle multiple event listeners on multiple targets. It caches all event listeners
     * and can remove them separately or all together. This can be useful when event listeners need to be added and removed during
     * the lifetime of a component and makes manually saving references to targets, listeners and options unnecessary.
     *
     * ```ts
     *  // create an EventManager instance
     *  const manager = new EventManager();
     *
     *  // you can save a reference (an EventBinding) to the added event listener if you need to manually remove it later
     *  const binding = manager.listen(document, 'scroll', (event) => {...});
     *
     *  // ...or ignore the reference if you don't need it
     *  manager.listen(document.body, 'click', (event) => {...});
     *
     *  // you can remove a specific event listener using a reference
     *  manager.unlisten(binding);
     *
     *  // ...or remove all previously added event listeners in one go
     *  manager.unlistenAll();
     * ```
     */
    class EventManager {
        constructor() {
            this.bindings = new Set();
        }
        hasBinding(targetOrBinding, type, listener, options) {
            return (isEventBinding(targetOrBinding)
                ? this.findBinding(targetOrBinding)
                : this.findBinding(targetOrBinding, type, listener, options)) !== undefined;
        }
        findBinding(bindingOrTarget, type, listener, options) {
            let searchBinding = isEventBinding(bindingOrTarget) ? bindingOrTarget : this.createBinding(bindingOrTarget, type, listener, options);
            let foundBinding;
            if (this.bindings.has(searchBinding))
                return searchBinding;
            for (let binding of this.bindings.values()) {
                if (this.compareBindings(searchBinding, binding)) {
                    foundBinding = binding;
                    break;
                }
            }
            return foundBinding;
        }
        listen(bindingOrTarget, type, listener, options) {
            const binding = isEventBinding(bindingOrTarget)
                ? bindingOrTarget
                : this.createBinding(bindingOrTarget, type, listener, options);
            if (!this.hasBinding(binding)) {
                binding.target.addEventListener(binding.type, binding.listener, binding.options);
                this.bindings.add(binding);
                return binding;
            }
        }
        unlisten(bindingOrTarget, type, listener, options) {
            const binding = isEventBinding(bindingOrTarget)
                ? this.findBinding(bindingOrTarget)
                : this.findBinding(bindingOrTarget, type, listener, options);
            if (binding) {
                binding.target.removeEventListener(binding.type, binding.listener, binding.options);
                this.bindings.delete(binding);
                return binding;
            }
        }
        /**
         * Removes all event listeners from their targets
         */
        unlistenAll() {
            this.bindings.forEach(binding => this.unlisten(binding));
        }
        dispatch(target, eventOrType, detail, eventInit = {}) {
            if (eventOrType instanceof Event) {
                return target.dispatchEvent(eventOrType);
            }
            return target.dispatchEvent(new CustomEvent(eventOrType, Object.assign(Object.assign({ bubbles: true, composed: true, cancelable: true }, eventInit), { detail })));
        }
        /**
         * Creates an {@link EventBinding} object
         *
         * @internal
         */
        createBinding(target, type, listener, options) {
            return Object.freeze({
                target,
                type,
                listener,
                options
            });
        }
        /**
         * Compares two {@link EventBinding} objects
         *
         * @returns `true` if the binding objects have the same target, type listener and options
         *
         * @internal
         */
        compareBindings(binding, other) {
            if (binding === other)
                return true;
            return binding.target === other.target
                && binding.type === other.type
                && this.compareListeners(binding.listener, other.listener)
                && this.compareOptions(binding.options, other.options);
        }
        /**
         * Compares two event listeners
         *
         * @returns `true` if the listeners are the same
         *
         * @internal
         */
        compareListeners(listener, other) {
            // catches both listeners being null, a function or the same EventListenerObject
            if (listener === other)
                return true;
            // compares the handlers of two EventListenerObjects
            if (typeof listener === 'object' && typeof other === 'object') {
                return listener.handleEvent === other.handleEvent;
            }
            return false;
        }
        /**
         * Compares two event listener options
         *
         * @returns `true` if the options are the same
         *
         * @internal
         */
        compareOptions(options, other) {
            // catches both options being undefined or same boolean value
            if (options === other)
                return true;
            // compares two options objects
            if (typeof options === 'object' && typeof other === 'object') {
                return options.capture === other.capture
                    && options.passive === other.passive
                    && options.once === other.once;
            }
            return false;
        }
    }
    //# sourceMappingURL=event-manager.js.map

    class IDGenerator {
        /**
         *
         * @param prefix - An optional prefix for the generated ID including an optional separator, e.g.: `'my-prefix-' or 'prefix--' or 'prefix_' or 'prefix`
         * @param suffix - An optional suffix for the generated ID including an optional separator, e.g.: `'-my-suffix' or '--suffix' or '_suffix' or 'suffix`
         */
        constructor(prefix = '', suffix = '') {
            this.prefix = prefix;
            this.suffix = suffix;
            this._next = 0;
        }
        getNextID() {
            return `${this.prefix}${this._next++}${this.suffix}`;
        }
    }
    //# sourceMappingURL=id-generator.js.map

    class Behavior {
        constructor() {
            this._attached = false;
            this.eventManager = new EventManager();
        }
        get hasAttached() {
            return this._attached;
        }
        get element() {
            return this._element;
        }
        attach(element, ...args) {
            this._element = element;
            this._attached = true;
        }
        detach(...args) {
            this.eventManager.unlistenAll();
            this._element = undefined;
            this._attached = false;
        }
        listen(target, type, listener, options) {
            return this.eventManager.listen(target, type, listener, options);
        }
        unlisten(target, type, listener, options) {
            return this.eventManager.unlisten(target, type, listener, options);
        }
        dispatch(eventOrType, detail, eventInit) {
            if (this.hasAttached && this.element) {
                return (eventOrType instanceof Event)
                    ? this.eventManager.dispatch(this.element, eventOrType)
                    : this.eventManager.dispatch(this.element, eventOrType, detail, eventInit);
            }
            return false;
        }
    }
    //# sourceMappingURL=behavior.js.map

    class FocusMonitor extends Behavior {
        constructor() {
            super(...arguments);
            this.hasFocus = false;
        }
        attach(element) {
            super.attach(element);
            this.listen(this.element, 'focusin', event => this.handleFocusIn(event));
            this.listen(this.element, 'focusout', event => this.handleFocusOut(event));
        }
        handleFocusIn(event) {
            if (!this.hasFocus) {
                this.hasFocus = true;
                this.dispatch('focus-changed', { type: 'focusin', event: event });
            }
        }
        handleFocusOut(event) {
            // if the relatedTarget (the element which will receive the focus next) is within the monitored element,
            // we can ignore this event; it will eventually be handled as focusin event of the relatedTarget
            if (this.element === event.relatedTarget || this.element.contains(event.relatedTarget))
                return;
            if (this.hasFocus) {
                this.hasFocus = false;
                this.dispatch('focus-changed', { type: 'focusout', event: event });
            }
        }
    }
    //# sourceMappingURL=focus-monitor.js.map

    const TABBABLES = [
        'a[href]:not([disabled]):not([tabindex^="-"])',
        'area[href]:not([disabled]):not([tabindex^="-"])',
        'button:not([disabled]):not([tabindex^="-"])',
        'input:not([disabled]):not([tabindex^="-"])',
        'select:not([disabled]):not([tabindex^="-"])',
        'textarea:not([disabled]):not([tabindex^="-"])',
        'iframe:not([disabled]):not([tabindex^="-"])',
        '[contentEditable]:not([disabled]):not([tabindex^="-"])',
        '[tabindex]:not([tabindex^="-"])',
    ];
    const DEFAULT_FOCUS_TRAP_CONFIG = {
        tabbableSelector: TABBABLES.join(','),
        wrapFocus: true,
        autoFocus: true,
        restoreFocus: true,
    };
    class FocusTrap extends FocusMonitor {
        constructor(config) {
            super();
            this.config = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), config);
        }
        attach(element) {
            super.attach(element);
            this.update();
            if (this.config.autoFocus) {
                this.focusInitial();
            }
            this.listen(this.element, 'keydown', ((event) => this.handleKeyDown(event)));
        }
        detach() {
            if (!this.hasAttached)
                return;
            super.detach();
        }
        focusInitial() {
            if (this.config.initialFocus) {
                const initialFocus = this.element.querySelector(this.config.initialFocus);
                if (initialFocus) {
                    initialFocus.focus();
                    return;
                }
                else {
                    console.warn(`FocusTrap could not find initialFocus element selector ${this.config.initialFocus}. Possible error in FocusTrapConfig.`);
                }
            }
            this.focusFirst();
        }
        focusFirst() {
            this.start.focus();
        }
        focusLast() {
            this.end.focus();
        }
        update() {
            if (!this.hasAttached)
                return;
            this.tabbables = this.element.querySelectorAll(this.config.tabbableSelector);
            const length = this.tabbables.length;
            this.start = length
                ? this.tabbables.item(0)
                : this.element;
            this.end = length
                ? this.tabbables.item(length - 1)
                : this.element;
        }
        handleKeyDown(event) {
            switch (event.key) {
                case Tab:
                    if (event.shiftKey && event.target === this.start) {
                        event.preventDefault();
                        if (this.config.wrapFocus) {
                            this.focusLast();
                        }
                    }
                    else if (!event.shiftKey && event.target === this.end) {
                        event.preventDefault();
                        if (this.config.wrapFocus) {
                            this.focusFirst();
                        }
                    }
                    break;
            }
        }
    }
    //# sourceMappingURL=focus-trap.js.map

    const DEFAULT_OVERLAY_CONTROLLER_CONFIG = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), { autoFocus: true, trapFocus: true, restoreFocus: true, closeOnEscape: true, closeOnFocusLoss: true });
    //# sourceMappingURL=overlay-controller-config.js.map

    function hasOffsetChanged(offset, other) {
        if (offset && other) {
            return offset.horizontal !== other.horizontal
                || offset.vertical !== other.vertical;
        }
        return offset !== other;
    }
    //# sourceMappingURL=offset.js.map

    function hasAlignmentChanged(alignment, other) {
        if (alignment && other) {
            return alignment.horizontal !== other.horizontal
                || alignment.vertical !== other.vertical;
        }
        return alignment !== other;
    }
    function hasAlignmentPairChanged(alignmentPair, other) {
        if (alignmentPair && other) {
            return hasAlignmentChanged(alignmentPair.target, other.target)
                || hasAlignmentChanged(alignmentPair.origin, other.origin)
                || hasOffsetChanged(alignmentPair.offset, other.offset);
        }
        return alignmentPair !== other;
    }
    function getAlignedPosition(elementBox, elementAlignment) {
        const position = { x: 0, y: 0 };
        switch (elementAlignment.horizontal) {
            case 'start':
                position.x = elementBox.x;
                break;
            case 'center':
                position.x = elementBox.x + elementBox.width / 2;
                break;
            case 'end':
                position.x = elementBox.x + elementBox.width;
                break;
        }
        switch (elementAlignment.vertical) {
            case 'start':
                position.y = elementBox.y;
                break;
            case 'center':
                position.y = elementBox.y + elementBox.height / 2;
                break;
            case 'end':
                position.y = elementBox.y + elementBox.height;
                break;
        }
        return position;
    }
    function getTargetPosition(originBox, originAlignment, targetBox, targetAlignment) {
        const originPosition = getAlignedPosition(originBox, originAlignment);
        const targetPosition = getAlignedPosition(Object.assign(Object.assign({}, targetBox), { x: 0, y: 0 }), targetAlignment);
        return {
            x: originPosition.x - targetPosition.x,
            y: originPosition.y - targetPosition.y,
        };
    }
    //# sourceMappingURL=alignment.js.map

    function hasSizeChanged(size, other) {
        if (size && other) {
            return size.width !== other.width
                || size.height !== other.height
                || size.maxWidth !== other.maxWidth
                || size.maxHeight !== other.maxHeight;
        }
        return size !== other;
    }
    //# sourceMappingURL=size.js.map

    const POSITION_CONFIG_FIELDS = [
        'width',
        'height',
        'maxWidth',
        'maxHeight',
        'origin',
        'alignment'
    ];
    const DEFAULT_POSITION_CONFIG = {
        width: 'auto',
        maxWidth: '100vw',
        height: 'auto',
        maxHeight: '100vh',
        origin: 'viewport',
        alignment: {
            origin: {
                horizontal: 'center',
                vertical: 'center',
            },
            target: {
                horizontal: 'center',
                vertical: 'center',
            },
            offset: {
                horizontal: 0,
                vertical: 0,
            }
        }
    };
    function hasPositionConfigChanged(positionConfig, other) {
        if (positionConfig && other) {
            return positionConfig.origin !== other.origin
                || hasAlignmentPairChanged(positionConfig.alignment, other.alignment)
                || hasSizeChanged(positionConfig, other);
        }
        return positionConfig !== other;
    }
    //# sourceMappingURL=position-config.js.map

    const OVERLAY_CONFIG_FIELDS = [
        'width',
        'height',
        'maxWidth',
        'maxHeight',
        'origin',
        'alignment',
        'positionType',
        'controller',
        'controllerType',
        'stacked',
        'template',
        'context',
        'backdrop',
        'closeOnEscape',
        'closeOnFocusLoss',
        'closeOnBackdropClick',
        'trapFocus',
        'autoFocus',
        'initialFocus',
        'restoreFocus',
        'wrapFocus',
        'tabbableSelector'
    ];
    const DEFAULT_OVERLAY_CONFIG = Object.assign(Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG), DEFAULT_OVERLAY_CONTROLLER_CONFIG), { positionType: 'default', controller: undefined, controllerType: 'default', stacked: true, template: undefined, context: undefined, backdrop: true, closeOnBackdropClick: true });
    //# sourceMappingURL=overlay-config.js.map

    const ID_GENERATOR = new IDGenerator('partkit-overlay-');
    let Overlay = class Overlay extends Component {
        constructor() {
            super(...arguments);
            // TODO: clean this up
            this._config = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), { trapFocus: true });
            this._open = false;
            this.tabindex = -1;
            this.controllerType = 'default';
            this.positionType = 'default';
            this.origin = 'viewport';
        }
        get open() {
            return this._open;
        }
        set open(open) {
            if (open === this.open)
                return;
            // setting the open property of the overlay doesn't actually set anything, therefore requestUpdate won't see any changes
            // instead, we dispatch an event which acts as a command to open or close the overlay
            // we do this to allow the OverlayService and OverlayControllers to listen to these events and run their appropriate logic
            // in the same way, the OverlayService and OverlayController can dispatch this event and the overlay will behave as if its
            // open property would have been set, without re-emitting the same event
            // we will handle the actual property change in the handlers below and also call requestUpdate from there
            dispatch(this, open ? 'command-open' : 'command-close', {
                target: this,
                source: undefined,
            });
        }
        set config(config) {
            this._config = Object.assign(Object.assign({}, this._config), config);
        }
        get config() {
            const config = Object.assign({}, this._config);
            OVERLAY_CONFIG_FIELDS.forEach(key => {
                if (this[key] !== undefined) {
                    config[key] = this[key];
                }
            });
            return config;
        }
        connectedCallback() {
            this.id = this.id || ID_GENERATOR.getNextID();
            this.role = this.getAttribute('role') || 'dialog';
            this.reflectOpen();
            super.connectedCallback();
        }
        updateCallback(changes, firstUpdate) {
            const config = {};
            OVERLAY_CONFIG_FIELDS.forEach(key => {
                if (changes.has(key))
                    config[key] = this[key];
            });
            if (Object.keys(config).length > 0) ;
        }
        reflectOpen() {
            if (this.open) {
                this.setAttribute('open', '');
                this.setAttribute('aria-hidden', 'false');
            }
            else {
                this.removeAttribute('open');
                this.setAttribute('aria-hidden', 'true');
            }
        }
        handleOpen(event) {
            if (!this.open) {
                this._open = true;
                // TODO: we need to also make the property reflect!
                this.requestUpdate('open', false, true);
            }
        }
        handleClose(event) {
            if (this.open) {
                this._open = false;
                this.requestUpdate('open', true, false);
            }
        }
        // TODO: see if we actually need this...
        handleToggle(event) {
            if (this.open) {
                this.handleClose(event);
            }
            else {
                this.handleOpen(event);
            }
        }
    };
    __decorate([
        property({
            converter: AttributeConverterARIABoolean,
            reflectProperty: 'reflectOpen'
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Overlay.prototype, "open", null);
    __decorate([
        property({
            converter: AttributeConverterNumber
        }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "tabindex", void 0);
    __decorate([
        property({
            converter: AttributeConverterString
        }),
        __metadata("design:type", String)
    ], Overlay.prototype, "role", void 0);
    __decorate([
        property(),
        __metadata("design:type", String)
    ], Overlay.prototype, "controller", void 0);
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Overlay.prototype, "controllerType", void 0);
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Overlay.prototype, "positionType", void 0);
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Overlay.prototype, "origin", void 0);
    __decorate([
        listener({
            event: 'command-open',
            options: { capture: true },
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [CustomEvent]),
        __metadata("design:returntype", void 0)
    ], Overlay.prototype, "handleOpen", null);
    __decorate([
        listener({
            event: 'command-close',
            options: { capture: true },
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [CustomEvent]),
        __metadata("design:returntype", void 0)
    ], Overlay.prototype, "handleClose", null);
    __decorate([
        listener({
            event: 'command-toggle',
            options: { capture: true },
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [CustomEvent]),
        __metadata("design:returntype", void 0)
    ], Overlay.prototype, "handleToggle", null);
    Overlay = __decorate([
        component({
            selector: 'ui-overlay',
            styles: [css `
    :host {
        display: block;
        position: absolute;
        box-sizing: border-box;
        border: 2px solid #bfbfbf;
        background-color: #fff;
        border-radius: 4px;
        will-change: transform;
    }
    :host([aria-hidden=true]) {
        display: none;
        will-change: auto;
    }
    `],
            template: () => html `
    <slot></slot>
    `,
        })
    ], Overlay);

    /**
     * Insert a Node after a reference Node
     *
     * @param newChild - The Node to insert
     * @param refChild - The reference Node after which to insert
     */
    const insertAfter = (newChild, refChild) => {
        return refChild.parentNode.insertBefore(newChild, refChild.nextSibling);
    };
    //# sourceMappingURL=dom.js.map

    class DefaultOverlayController extends Behavior {
        constructor(overlay, overlayService, config) {
            super();
            this.overlay = overlay;
            this.overlayService = overlayService;
            this.config = config;
            this.focusTrap = this.config.trapFocus
                ? new FocusTrap(config)
                : new FocusMonitor();
        }
        attach(element) {
            if (this.hasAttached)
                return;
            super.attach(element);
            this.listen(this.overlay, 'keydown', event => this.handleKeydown(event));
            this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event));
            this.listen(this.overlay, 'open-changed', event => event.detail.current
                ? this.handleOpen()
                : this.handleClose());
        }
        open(event) {
            return __awaiter(this, void 0, void 0, function* () {
                this.storeFocus();
                const result = yield this.overlayService.openOverlay(this.overlay, event);
                return result;
            });
        }
        close(event) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.overlayService.closeOverlay(this.overlay, event);
                this.restoreFocus(event);
                return result;
            });
        }
        toggle(event) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.overlayService.isOverlayOpen(this.overlay)) {
                    return this.close(event);
                }
                else {
                    return this.open(event);
                }
            });
        }
        handleOpen() {
            console.log('handleOpen...', this);
            if (this.focusTrap) {
                this.focusTrap.attach(this.overlay);
            }
        }
        handleClose() {
            console.log('handleClose...', this);
            if (this.focusTrap) {
                this.focusTrap.detach();
            }
        }
        handleFocusChange(event) {
            const hasFocus = event.detail.type === 'focusin';
            if (!hasFocus) {
                // when loosing focus, we wait for potential focusin events on child or parent overlays by delaying
                // the active check in a new macrotask via setTimeout
                setTimeout(() => {
                    // then we check if the overlay is active and if not, we close it
                    if (!this.overlayService.isOverlayActive(this.overlay)) {
                        // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
                        const parent = this.overlayService.getParentOverlay(this.overlay);
                        if (this.config.closeOnFocusLoss) {
                            this.close(event);
                        }
                        if (parent) {
                            // if we have a parent overlay, we let the parent know that our overlay has lost focus,
                            // by dispatching the FocusChangeEvent on the parent overlay to be handled or ignored
                            // by the parent's OverlayController
                            parent.dispatchEvent(event);
                        }
                    }
                }, 0);
            }
        }
        handleKeydown(event) {
            console.log('overlay-controller.handleKeydown()...', event);
            switch (event.key) {
                case Escape:
                    if (!this.overlayService.isOverlayOpen(this.overlay))
                        return;
                    if (!this.config.closeOnEscape)
                        return;
                    this.close(event);
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        }
        storeFocus() {
            this.previousFocus = document.activeElement || undefined;
        }
        restoreFocus(event) {
            // we only restore the focus if the overlay is closed pressing Escape or programmatically
            const restoreFocus = this.config.restoreFocus
                && this.previousFocus
                && (this.isEscape(event) || !event);
            if (restoreFocus) {
                this.previousFocus.focus();
            }
            this.previousFocus = undefined;
        }
        isEscape(event) {
            return event && event.type === 'keydown' && event.key === Escape || false;
        }
    }

    const DIALOG_OVERLAY_CONTROLLER_CONFIG = Object.assign({}, DEFAULT_OVERLAY_CONTROLLER_CONFIG);
    class DialogOverlayController extends DefaultOverlayController {
        attach(element) {
            if (this.hasAttached)
                return;
            super.attach(element);
            this.element.setAttribute('aria-haspopup', 'dialog');
            this.listen(this.element, 'keydown', (event) => this.handleKeydown(event));
            this.listen(this.element, 'mousedown', (event) => this.handleMousedown(event));
            this.listen(this.overlay, 'open-changed', (event) => this.handleOpenChange(event));
            this.update();
        }
        detach() {
            if (!this.hasAttached)
                return;
            this.element.removeAttribute('aria-haspopup');
            this.element.removeAttribute('aria-expanded');
            super.detach();
        }
        update() {
            if (!this.hasAttached)
                return;
            this.element.setAttribute('aria-expanded', this.overlay.open ? 'true' : 'false');
        }
        handleOpenChange(event) {
            this.update();
        }
        handleKeydown(event) {
            switch (event.key) {
                case Enter:
                case Space:
                    if (event.target !== this.element)
                        return;
                    this.toggle(event);
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                default:
                    super.handleKeydown(event);
                    break;
            }
        }
        handleMousedown(event) {
            this.toggle(event);
        }
    }
    //# sourceMappingURL=dialog-overlay-controller.js.map

    const TOOLTIP_OVERLAY_CONTROLLER_CONFIG = Object.assign(Object.assign({}, DEFAULT_OVERLAY_CONTROLLER_CONFIG), { trapFocus: false, autoFocus: false, restoreFocus: false });
    class TooltipOverlayController extends DefaultOverlayController {
        attach(element) {
            if (this.hasAttached)
                return;
            super.attach(element);
            this.overlay.role = 'tooltip';
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('aria-describedby', this.overlay.id);
            this.listen(this.element, 'mouseenter', (event) => this.open(event));
            this.listen(this.element, 'mouseleave', (event) => this.close(event));
            this.listen(this.element, 'focus', (event) => this.open(event));
            this.listen(this.element, 'blur', (event) => this.close(event));
        }
        detach() {
            if (!this.hasAttached)
                return;
            this.element.removeAttribute('tabindex');
            this.element.removeAttribute('aria-describedby');
            super.detach();
        }
    }
    //# sourceMappingURL=tooltip-overlay-controller.js.map

    const DEFAULT_OVERLAY_CONTROLLERS = {
        default: DefaultOverlayController,
        dialog: DialogOverlayController,
        tooltip: TooltipOverlayController,
    };
    const DEFAULT_OVERLAY_CONTROLLER_CONFIGS = {
        default: DEFAULT_OVERLAY_CONTROLLER_CONFIG,
        dialog: DIALOG_OVERLAY_CONTROLLER_CONFIG,
        tooltip: TOOLTIP_OVERLAY_CONTROLLER_CONFIG,
    };
    class OverlayControllerFactory {
        constructor(controllers = DEFAULT_OVERLAY_CONTROLLERS, configs = DEFAULT_OVERLAY_CONTROLLER_CONFIGS) {
            this.controllers = controllers;
            this.configs = configs;
        }
        createOverlayController(type, overlay, overlayService, config) {
            const controller = this.controllers[type] || DefaultOverlayController;
            const configuration = Object.assign(Object.assign({}, (this.configs[type] || DEFAULT_OVERLAY_CONTROLLER_CONFIG)), config);
            return new controller(overlay, overlayService, configuration);
        }
    }

    let OverlayBackdrop = class OverlayBackdrop extends Component {
        constructor() {
            super(...arguments);
            this.transparent = false;
        }
        connectedCallback() {
            super.connectedCallback();
            this.hidden = true;
        }
        show() {
            this.watch(() => this.hidden = false);
        }
        hide() {
            this.watch(() => this.hidden = true);
        }
    };
    __decorate([
        property({
            converter: AttributeConverterBoolean
        }),
        __metadata("design:type", Boolean)
    ], OverlayBackdrop.prototype, "hidden", void 0);
    __decorate([
        property({
            converter: AttributeConverterBoolean
        }),
        __metadata("design:type", Object)
    ], OverlayBackdrop.prototype, "transparent", void 0);
    OverlayBackdrop = __decorate([
        component({
            selector: 'ui-overlay-backdrop',
            styles: [css `
    :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--overlay-backdrop-background);
    }
    :host([hidden]) {
        display: none;
    }
    :host([transparent]) {
        background: transparent;
    }
    `]
        })
    ], OverlayBackdrop);
    //# sourceMappingURL=overlay-backdrop.js.map

    const DEFAULT_POSITION = {
        x: 0,
        y: 0,
    };
    function isPosition(position) {
        return typeof position.x !== 'undefined' && typeof position.y !== 'undefined';
    }
    function hasPositionChanged(position, other) {
        if (position && other) {
            return position.x !== other.x
                || position.y !== other.y;
        }
        return position !== other;
    }
    //# sourceMappingURL=position.js.map

    class PositionStrategy {
        constructor(target, config) {
            this.target = target;
            this._config = DEFAULT_POSITION_CONFIG;
            this.config = config;
        }
        set origin(origin) {
            // cache the origin element if it is a CSS selector
            if (typeof origin === 'string' && origin !== 'viewport') {
                origin = document.querySelector(origin) || undefined;
            }
            this._origin = origin;
        }
        get origin() {
            return this._origin;
        }
        set config(config) {
            this._config = Object.assign(Object.assign({}, this._config), config);
            this.origin = this.config.origin;
        }
        get config() {
            return this._config;
        }
        update(position, size) {
            if (!this.animationFrame) {
                this.animationFrame = requestAnimationFrame(() => {
                    const nextPosition = position || this.getPosition();
                    const nextSize = size || this.getSize();
                    if (!this.currentPosition || this.hasPositionChanged(nextPosition, this.currentPosition)) {
                        this.applyPosition(nextPosition);
                        this.currentPosition = nextPosition;
                    }
                    if (!this.currentSize || this.hasSizeChanged(nextSize, this.currentSize)) {
                        this.applySize(nextSize);
                        this.currentSize = nextSize;
                    }
                    this.animationFrame = undefined;
                });
            }
        }
        destroy() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = undefined;
            }
        }
        /**
         * Calculate the position of the positioned element
         *
         * @description
         * The position will depend on the alignment and origin options of the {@link PositionConfig}.
         */
        getPosition() {
            const originBox = this.getBoundingBox(this.origin);
            const targetBox = this.getBoundingBox(this.target);
            // TODO: include alignment offset
            return getTargetPosition(originBox, this.config.alignment.origin, targetBox, this.config.alignment.target);
        }
        /**
         * Calculate the size of the positioned element
         *
         * @description
         * We take the settings from the {@link PositionConfig} so we are always up-to-date if the configuration was updated.
         *
         * This hook also allows us to do things like matching the origin's width, or looking at the available viewport dimensions.
         */
        getSize() {
            return {
                width: this.config.width,
                height: this.config.height,
                maxWidth: this.config.maxWidth,
                maxHeight: this.config.maxHeight,
            };
        }
        getBoundingBox(reference) {
            const boundingBox = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };
            if (isPosition(reference)) {
                boundingBox.x = reference.x;
                boundingBox.y = reference.y;
            }
            else if (reference === 'viewport') {
                boundingBox.width = window.innerWidth;
                boundingBox.height = window.innerHeight;
            }
            else if (reference instanceof HTMLElement) {
                const originRect = reference.getBoundingClientRect();
                boundingBox.x = originRect.left;
                boundingBox.y = originRect.top;
                boundingBox.width = originRect.width;
                boundingBox.height = originRect.height;
            }
            return boundingBox;
        }
        applyPosition(position) {
            this.target.style.top = this.parseStyle(position.y);
            this.target.style.left = this.parseStyle(position.x);
            this.target.style.right = '';
            this.target.style.bottom = '';
        }
        applySize(size) {
            this.target.style.width = this.parseStyle(size.width);
            this.target.style.height = this.parseStyle(size.height);
            this.target.style.maxWidth = this.parseStyle(size.maxWidth);
            this.target.style.maxHeight = this.parseStyle(size.maxHeight);
        }
        parseStyle(value) {
            return (typeof value === 'number') ? `${value}px` : value;
        }
        hasPositionChanged(position, other) {
            return hasPositionChanged(position, other);
        }
        hasSizeChanged(size, other) {
            return hasSizeChanged(size, other);
        }
    }
    //# sourceMappingURL=position-strategy.js.map

    const DEFAULT_POSITION_CONFIG_CENTERED = Object.assign({}, DEFAULT_POSITION_CONFIG);
    class CenteredPositionStrategy extends PositionStrategy {
        constructor(target, config) {
            super(target, Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG_CENTERED), config));
            this.target = target;
        }
        /**
         * We override the getPosition method to always return the {@link DEFAULT_POSITION}
         *
         * We actually don't care about the position, because we are going to use viewport relative
         * CSS units to position the element. After the first calculation of the position, it's
         * never going to change and applyPosition will only be called once. This makes this
         * position strategy really cheap.
         */
        getPosition() {
            return DEFAULT_POSITION;
        }
        /**
         * We override the applyPosition method to center the element relative to the viewport
         * dimensions and its own size. This style has to be applied only once and is responsive
         * by default.
         */
        applyPosition(position) {
            this.target.style.top = '50vh';
            this.target.style.left = '50vw';
            this.target.style.right = '';
            this.target.style.bottom = '';
            this.target.style.transform = `translate(-50%, -50%)`;
        }
    }
    //# sourceMappingURL=centered-position-strategy.js.map

    const DEFAULT_POSITION_CONFIG_CONNECTED = Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG), { alignment: {
            origin: {
                horizontal: 'start',
                vertical: 'end'
            },
            target: {
                horizontal: 'start',
                vertical: 'start'
            },
            offset: {
                horizontal: 0,
                vertical: 0,
            },
        } });
    class ConnectedPositionStrategy extends PositionStrategy {
        constructor(target, config) {
            super(target, Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG_CONNECTED), config));
            this.target = target;
            this.updateListener = () => this.update();
            window.addEventListener('resize', this.updateListener);
            document.addEventListener('scroll', this.updateListener, true);
        }
        destroy() {
            window.removeEventListener('resize', this.updateListener);
            document.removeEventListener('scroll', this.updateListener, true);
            super.destroy();
        }
        /**
         * We override the applyPosition method, so we can use a CSS transform to position the element.
         *
         * This can result in better performance.
         */
        applyPosition(position) {
            this.target.style.top = '';
            this.target.style.left = '';
            this.target.style.right = '';
            this.target.style.bottom = '';
            this.target.style.transform = `translate(${this.parseStyle(position.x)}, ${this.parseStyle(position.y)})`;
        }
    }
    //# sourceMappingURL=connected-position-strategy.js.map

    const DEFAULT_POSITION_STRATEGIES = {
        default: PositionStrategy,
        centered: CenteredPositionStrategy,
        connected: ConnectedPositionStrategy,
    };
    const DEFAULT_POSITION_CONFIGS = {
        default: DEFAULT_POSITION_CONFIG,
        centered: DEFAULT_POSITION_CONFIG_CENTERED,
        connected: DEFAULT_POSITION_CONFIG_CONNECTED,
    };
    class PositionStrategyFactory {
        constructor(strategies = DEFAULT_POSITION_STRATEGIES, configs = DEFAULT_POSITION_CONFIGS) {
            this.strategies = strategies;
            this.configs = configs;
        }
        createPositionStrategy(type, target, config) {
            const strategy = this.strategies[type] || PositionStrategy;
            const configuration = Object.assign(Object.assign({}, this.configs[type] || DEFAULT_POSITION_CONFIG), config);
            return new strategy(target, configuration);
        }
    }
    //# sourceMappingURL=position-strategy-factory.js.map

    const OVERLAY_UNREGISTERED_ERROR = (overlay) => new Error(`Overlay is not registered: ${overlay.selector}`);
    let OVERLAY_SERVICE_INSTANCE;
    class OverlayService {
        constructor(positionStrategyFactory = new PositionStrategyFactory(), overlayControllerFactory = new OverlayControllerFactory(), root = document.body) {
            this.positionStrategyFactory = positionStrategyFactory;
            this.overlayControllerFactory = overlayControllerFactory;
            this.root = root;
            this.registeredOverlays = new Map();
            this.activeOverlays = [];
            if (!OVERLAY_SERVICE_INSTANCE) {
                console.log('OverlayService.constructor()...');
                OVERLAY_SERVICE_INSTANCE = this;
                this.createBackdrop();
                document.body.addEventListener('connected', event => {
                    if (event.target instanceof Overlay) {
                        console.log(event);
                        if (this.hasOverlay(event.target))
                            return;
                        this.registerOverlay(event.target, event.target.config);
                    }
                });
                document.body.addEventListener('disconnected', event => {
                    if (event.target instanceof Overlay) {
                        console.log(event);
                        if (!this.hasOverlay(event.target))
                            return;
                        this.destroyOverlay(event.target, false);
                    }
                });
            }
            return OVERLAY_SERVICE_INSTANCE;
        }
        // TODO: maybe not needed? if needed, it's wrong as we can have unstacked open overlays
        hasOpenOverlays() {
            return this.activeOverlays.length > 0;
        }
        hasOverlay(overlay) {
            return this.registeredOverlays.has(overlay);
        }
        isOverlayOpen(overlay) {
            this._throwUnregiseredOverlay(overlay);
            return overlay.open;
            // TODO: this no longer works with unstacked overlays
            // return this.activeOverlays.includes(overlay);
        }
        /**
         * An overlay is considered focused, if either itself or any of its descendant nodes has focus.
         */
        isOverlayFocused(overlay) {
            this._throwUnregiseredOverlay(overlay);
            const activeElement = document.activeElement;
            return overlay === activeElement || overlay.contains(activeElement);
        }
        /**
         * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
         */
        isOverlayActive(overlay) {
            this._throwUnregiseredOverlay(overlay);
            let isFound = false;
            let isActive = false;
            for (let index = 0, length = this.activeOverlays.length; index < length && !isActive; index++) {
                if (!isFound && this.activeOverlays[index] === overlay)
                    isFound = true;
                if (isFound) {
                    isActive = this.isOverlayFocused(this.activeOverlays[index]);
                }
            }
            return isActive;
        }
        getParentOverlay(overlay) {
            if (this.isOverlayOpen(overlay)) {
                const index = this.activeOverlays.findIndex(current => current === overlay);
                if (index > 0) {
                    return this.activeOverlays[index - 1];
                }
            }
        }
        createBackdrop() {
            this.backdrop = document.createElement(OverlayBackdrop.selector);
            this.root.appendChild(this.backdrop);
        }
        /**
         * Create a new overlay
         *
         * @description
         * Creates a new overlay instances and registers it with the service.
         */
        createOverlay(config) {
            const overlay = document.createElement(Overlay.selector);
            this.registerOverlay(overlay, config);
            return overlay;
        }
        /**
         * Register an overlay with the overlay service
         *
         * @description
         * Adds the overlay instance to the overlay service's registry, extracts the overlay's configuration and
         * attaches the overlay to the overlay service's root location in the document body.
         *
         * @returns True if the overlay was registered successfully, false if the overlay has been registered already
         */
        registerOverlay(overlay, config = {}) {
            if (this.hasOverlay(overlay))
                return false;
            this.registeredOverlays.set(overlay, this.configureOverlay(overlay, config));
            this.attachOverlay(overlay);
            this.renderOverlay(overlay);
            return true;
        }
        openOverlay(overlay, event) {
            return __awaiter(this, void 0, void 0, function* () {
                this._throwUnregiseredOverlay(overlay);
                return new Promise((resolve, reject) => {
                    if (this.isOverlayOpen(overlay)) {
                        reject(false);
                        return;
                    }
                    overlay.addEventListener('open-changed', (event) => resolve(true), { once: true });
                    const config = this.registeredOverlays.get(overlay).config;
                    if (config.stacked) {
                        // we need to check if an event caused the overlay to open and if it originates from any active overlay in the stack
                        let length = this.activeOverlays.length, index = length - 1;
                        if (event && length && event.target instanceof Node) {
                            for (index; index >= 0; index--) {
                                let activeOverlay = this.activeOverlays[index];
                                if (activeOverlay === event.target || activeOverlay.contains(event.target)) {
                                    // we found the active overlay that caused the event, we keep the stack up to this overlay
                                    break;
                                }
                                else {
                                    // the active overlay didn't cause the event, so it should be closed and discarded from the stack
                                    this.closeOverlay(overlay);
                                }
                            }
                        }
                        // push overlay on the stack to mark it as currently active overlay
                        this.activeOverlays.push(overlay);
                    }
                    // overlay.show();
                    overlay.open = true;
                    console.log(this.activeOverlays);
                });
            });
        }
        /**
         * Close an overlay
         *
         * @description
         * When closing an overlay, all its open descendant overlays have to be closed as well.
         *
         * @param overlay - The overlay to close
         * @param event - An optional event that was responsible for closing the overlay
         */
        closeOverlay(overlay, event) {
            return __awaiter(this, void 0, void 0, function* () {
                this._throwUnregiseredOverlay(overlay);
                return new Promise((resolve, reject) => {
                    if (!this.isOverlayOpen(overlay)) {
                        reject(false);
                        return;
                    }
                    overlay.addEventListener('open-changed', (event) => resolve(true), { once: true });
                    const config = this.registeredOverlays.get(overlay).config;
                    if (config.stacked) {
                        let isFound = false;
                        while (!isFound) {
                            // activeOverlay is either a descendant of overlay or overlay itself
                            let activeOverlay = this.activeOverlays.pop();
                            // if we arrived at the overlay, we stop closing
                            isFound = activeOverlay === overlay || activeOverlay === undefined;
                            // activeOverlay.hide();
                            overlay.open = false;
                        }
                    }
                    else {
                        // overlay.hide();
                        overlay.open = false;
                    }
                });
            });
        }
        toggleOverlay(overlay, event) {
            if (this.isOverlayOpen(overlay)) {
                this.closeOverlay(overlay, event);
            }
            else {
                this.openOverlay(overlay, event);
            }
        }
        destroyOverlay(overlay, disconnect = true) {
            this._throwUnregiseredOverlay(overlay);
            // TODO: we need to also destroy descendant overlays?
            this.closeOverlay(overlay);
            const definition = this.registeredOverlays.get(overlay);
            if (definition && definition.destroy) {
                definition.destroy();
            }
            if (disconnect && overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
            }
            this.registeredOverlays.delete(overlay);
        }
        onOverlayOpen(overlay) {
            if (this.hasOverlay(overlay)) {
                const { updateListener, positionStrategy, config } = this.registeredOverlays.get(overlay);
                if (config.template && config.context) {
                    // to keep a template up-to-date with it's context, we have to render the template
                    // everytime the context renders - that is, on every update which was triggered
                    config.context.addEventListener('update', updateListener);
                    this.renderOverlay(overlay);
                }
                if (positionStrategy) {
                    positionStrategy.update();
                }
                // TODO: manage backdrop
                // if (config.backdrop) {
                //     this.backdrop.show();
                // }
            }
        }
        onOverlayClose(overlay) {
            // TODO: this doesn't get called when programmatic overlays close...
            // the issue is the open-changed event being triggered in the overlay's update cycle
            // which is after the overlay was destroyed already...
            if (this.hasOverlay(overlay)) {
                const { updateListener, config } = this.registeredOverlays.get(overlay);
                if (config.template && config.context) {
                    config.context.removeEventListener('update', updateListener);
                }
                // this.backdrop.hide();
            }
        }
        configureOverlay(overlay, config = {}) {
            console.log('configureOverlay()... ', overlay, config);
            const definition = {
                config: config,
                positionStrategy: this.createPositionStrategy(overlay, config),
                overlayController: this.createOverlayController(overlay, config),
                updateListener: () => this.renderOverlay(overlay),
                openChangeListener: (event) => this.handleOpenChange(overlay, event),
                focusChangeListener: (event) => this.handleFocusChange(overlay, event),
                destroy: () => {
                    overlay.removeEventListener('open-changed', definition.openChangeListener);
                    this.disposePositionStrategy(overlay);
                    this.disposeOverlayController(overlay);
                }
            };
            overlay.addEventListener('open-changed', definition.openChangeListener);
            return definition;
        }
        updateOverlayConfig(overlay, config = {}) {
            this._throwUnregiseredOverlay(overlay);
            const overlayDefinition = this.registeredOverlays.get(overlay);
            const overlayConfig = Object.assign(Object.assign({}, overlayDefinition.config), config);
            this.updatePositionStrategy(overlay, overlayConfig);
            this.updateOverlayController(overlay, overlayConfig);
            // finally store the updated config in the OverlayDefinition
            overlayDefinition.config = overlayConfig;
        }
        updatePositionStrategy(overlay, config) {
            const definition = this.registeredOverlays.get(overlay);
            const hasTypeChanged = definition.config.positionType !== config.positionType;
            const hasConfigChanged = hasPositionConfigChanged(definition.config, config);
            console.log('updatePositionStrategy... type changed: %s, config changed: %s', hasTypeChanged, hasConfigChanged);
            if (hasTypeChanged || hasConfigChanged) {
                this.disposePositionStrategy(overlay);
                definition.positionStrategy = this.createPositionStrategy(overlay, config);
            }
        }
        createPositionStrategy(overlay, config) {
            if (config.positionType) {
                const positionStrategy = this.positionStrategyFactory.createPositionStrategy(config.positionType, overlay, this._extractPositionConfig(config));
                // the position strategy builds its own config based on the positionType setting, we need to reflect this back
                // TODO: this seems a tad hacky...
                Object.assign(config, positionStrategy.config);
                return positionStrategy;
            }
        }
        disposePositionStrategy(overlay) {
            const definition = this.registeredOverlays.get(overlay);
            if (definition.positionStrategy) {
                definition.positionStrategy.destroy();
                definition.positionStrategy = undefined;
            }
        }
        /**
         * Updates the trigger element and trigger type of an Overlay
         *
         * If the trigger element changed, the OverlayTrigger instance will be detached from the old trigger element
         * and re-attached to the new trigger element. If the trigger type changed, the old OverlayTrigger will be detached,
         * a new one will be created and attached to the trigger element.
         */
        updateOverlayController(overlay, config) {
            const definition = this.registeredOverlays.get(overlay);
            const hasTypeChanged = config.controllerType !== definition.config.controllerType;
            const hasTriggerChanged = config.controller !== definition.config.controller;
            console.log('updateOverlayTrigger... type changed: %s, trigger changed: %s', hasTypeChanged, hasTriggerChanged);
            if (hasTriggerChanged || hasTypeChanged) {
                this.disposeOverlayController(overlay);
                definition.overlayController = this.createOverlayController(overlay, config);
            }
        }
        createOverlayController(overlay, config) {
            if (config.controllerType) {
                const overlayController = this.overlayControllerFactory.createOverlayController(config.controllerType, overlay, this, config);
                const controllerElement = config.controller ? document.querySelector(config.controller) || undefined : undefined;
                overlayController.attach(controllerElement);
                return overlayController;
            }
        }
        disposeOverlayController(overlay) {
            const definition = this.registeredOverlays.get(overlay);
            if (definition.overlayController) {
                definition.overlayController.detach();
                definition.overlayController = undefined;
            }
        }
        /**
         * Attach an overlay to the {@link OverlayService}'s root element
         *
         * All overlays are attached to the root element in order, after the {@link OverlayBackdrop}.
         *
         * @param overlay - The overlay instance to attach
         */
        attachOverlay(overlay) {
            if (overlay.parentElement === this.root)
                return;
            let lastOverlay = this.backdrop;
            while (lastOverlay.nextSibling && lastOverlay.nextSibling instanceof Overlay) {
                lastOverlay = lastOverlay.nextSibling;
            }
            insertAfter(overlay, lastOverlay);
        }
        renderOverlay(overlay) {
            if (this.hasOverlay(overlay)) {
                // TODO: use template and context from definition.config
                const { template, context } = this.registeredOverlays.get(overlay).config;
                if (template) {
                    // TODO: check if context is always available, otherwise use overlay as fallback-context
                    render(template(context || overlay), overlay, { eventContext: context || overlay });
                }
            }
        }
        handleOpenChange(overlay, event) {
            const open = event.detail.current;
            if (open) {
                this.onOverlayOpen(overlay);
            }
            else {
                this.onOverlayClose(overlay);
            }
        }
        handleFocusChange(overlay, event) {
            const hasFocus = event.detail.type === 'focusin';
            if (!hasFocus) {
                // when loosing focus, we wait for potential focusin events on child overlays by delaying the active check with a promise
                Promise.resolve().then(() => {
                    // then we check if the overlay is active and if not, we close it
                    if (!this.isOverlayActive(overlay))
                        this.closeOverlay(overlay, event);
                });
            }
        }
        _extractPositionConfig(overlayConfig) {
            const positionConfig = {};
            POSITION_CONFIG_FIELDS.forEach(key => {
                if (overlayConfig[key] !== undefined) {
                    positionConfig[key] = overlayConfig[key];
                }
            });
            return positionConfig;
        }
        _throwUnregiseredOverlay(overlay) {
            if (!this.hasOverlay(overlay)) {
                throw OVERLAY_UNREGISTERED_ERROR(overlay.constructor);
            }
        }
    }
    //# sourceMappingURL=overlay-service.js.map

    const customOverlayConfig = {
        alignment: {
            origin: {
                horizontal: 'start',
                vertical: 'start',
            },
            target: {
                horizontal: 'start',
                vertical: 'end',
            },
            offset: {
                horizontal: 0,
                vertical: 0,
            }
        }
    };
    const tooltipOverlayConfig = {
        backdrop: false,
        trapFocus: false,
        stacked: false,
        alignment: {
            origin: {
                horizontal: 'center',
                vertical: 'start',
            },
            target: {
                horizontal: 'center',
                vertical: 'end',
            },
            offset: {
                horizontal: 0,
                vertical: 10,
            }
        }
    };
    let OverlayDemoComponent = class OverlayDemoComponent extends Component {
        constructor() {
            super(...arguments);
            this.overlayService = new OverlayService();
            this.counter = 0;
        }
        connectedCallback() {
            super.connectedCallback();
            this.count();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.stop();
        }
        confirm() {
            alert(`You confirmed at ${this.counter}.`);
        }
        cancel() {
            alert(`You cancelled at ${this.counter}.`);
        }
        showOverlay(event) {
            if (!this.overlay) {
                // create a template function in the app component's context
                const template = () => html `
                <h3>Programmatic Overlay</h3>
                <p>This is the content of the popover: ${this.counter}</p>
                <p><button @click=${this.closeOverlay}>Got it</button></p>
            `;
                const trigger = event.target;
                // pass the template function and a reference to the template's context (the app component)
                // to the overlay service
                this.overlay = this.overlayService.createOverlay({ positionType: 'centered', controllerType: 'default', template: template, context: this, stacked: true, trapFocus: true, autoFocus: true });
            }
            this.overlayService.openOverlay(this.overlay);
        }
        closeOverlay() {
            // if (this.overlay) this.overlayService.closeOverlay(this.overlay);
            if (this.overlay) {
                this.overlayService.destroyOverlay(this.overlay);
                this.overlay = undefined;
            }
        }
        count() {
            this.timeout = setTimeout(() => {
                this.counter++;
                this.count();
            }, 1000);
        }
        stop() {
            clearTimeout(this.timeout);
            this.counter = 0;
        }
    };
    __decorate([
        property({
            attribute: false
        }),
        __metadata("design:type", Object)
    ], OverlayDemoComponent.prototype, "counter", void 0);
    OverlayDemoComponent = __decorate([
        component({
            selector: 'overlay-demo',
            shadow: false,
            template: (element) => html `
    <button id="overlay">Show Overlay</button>

    <ui-overlay controller="#overlay" controller-type="dialog" position-type="connected" origin="#overlay" .config=${customOverlayConfig}>
        <h3>Overlay</h3>
        <p>This is the content of the overlay: ${element.counter}</p>
        <p>
            This is an input: <input type="text"/>
        </p>
        <p>
            This button opens another overlay:

            <button id="another-overlay">Another Overlay</button>
        </p>
    </ui-overlay>

    <ui-overlay controller="#another-overlay" controller-type="dialog" position-type="connected" origin="#another-overlay">
        <h3>Another Overlay</h3>
        <p>Just some static content...</p>
    </ui-overlay>

    <button id="overlay-programmatic" @click=${element.showOverlay}>Show programmatic overlay</button>

    <p>We have <a href="#" id="tooltip">tooltips</a> too...</p>

    <ui-overlay controller="#tooltip" controller-type="tooltip" position-type="connected" origin="#tooltip" .config=${tooltipOverlayConfig}>
        <p>I am the tooltip content.</p>
    </ui-overlay>

    <ui-overlay controller="#tooltip" controller-type="dialog" position-type="connected" origin="#tooltip">
        <p>I'm another overlay on the tooltip trigger.</p>
    </ui-overlay>
    `
        })
    ], OverlayDemoComponent);

    let Tab$1 = class Tab extends Component {
        constructor() {
            super(...arguments);
            this._panel = null;
            this._selected = false;
            this._disabled = false;
        }
        get selected() {
            return this._selected;
        }
        set selected(value) {
            this._selected = value;
            this.tabindex = this.disabled ? null : (value ? 0 : -1);
        }
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = value;
            this.tabindex = value ? null : (this.selected ? 0 : -1);
        }
        get panel() {
            if (!this._panel) {
                this._panel = document.getElementById(this.controls);
            }
            return this._panel;
        }
        connectedCallback() {
            super.connectedCallback();
            this.role = 'tab';
            this.tabindex = this.disabled ? null : -1;
        }
        updateCallback(changes, firstUpdate) {
            if (firstUpdate) {
                if (this.panel)
                    this.panel.labelledBy = this.id;
            }
        }
        select() {
            if (this.disabled)
                return;
            this.watch(() => this.selected = true);
        }
        deselect() {
            if (this.disabled)
                return;
            this.watch(() => this.selected = false);
        }
    };
    __decorate([
        property({
            converter: AttributeConverterString,
        }),
        __metadata("design:type", String)
    ], Tab$1.prototype, "role", void 0);
    __decorate([
        property({
            attribute: 'aria-controls',
            converter: AttributeConverterString,
        }),
        __metadata("design:type", String)
    ], Tab$1.prototype, "controls", void 0);
    __decorate([
        property({
            attribute: 'tabindex',
            converter: AttributeConverterNumber
        }),
        __metadata("design:type", Object)
    ], Tab$1.prototype, "tabindex", void 0);
    __decorate([
        property({
            attribute: 'aria-selected',
            converter: AttributeConverterARIABoolean
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Tab$1.prototype, "selected", null);
    __decorate([
        property({
            attribute: 'aria-disabled',
            converter: AttributeConverterARIABoolean,
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Tab$1.prototype, "disabled", null);
    Tab$1 = __decorate([
        component({
            selector: 'ui-tab',
            styles: [css `
    :host {
        position: relative;
        display: inline-flex;
        flex-flow: row;
        padding: 0.5rem 0.5rem;
        cursor: pointer;
        border: var(--border);
        border-bottom: none;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        box-shadow: var(--box-shadow);
        background-color: var(--background-color);
    }
    :host([aria-selected=true]):after {
        content: '';
        display: block;
        position: absolute;
        z-index: 2;
        left: 0;
        bottom: calc(-1 * var(--border-width));
        width: 100%;
        height: calc(var(--border-width) + 0.5rem);
        background-color: var(--background-color);
    }
    `],
            template: () => html `<slot></slot>`
        })
    ], Tab$1);
    //# sourceMappingURL=tab.js.map

    let TabList = class TabList extends Component {
        connectedCallback() {
            super.connectedCallback();
            this.role = 'tablist';
            this.focusManager = new FocusKeyManager(this, this.querySelectorAll(Tab$1.selector), 'horizontal');
        }
        updateCallback(changes, firstUpdate) {
            if (firstUpdate) {
                // const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;
                // slot.addEventListener('slotchange', () => {
                //     console.log(`${slot.name} changed...`, slot.assignedNodes());
                // });
                const selectedTab = this.querySelector(`${Tab$1.selector}[aria-selected=true]`);
                selectedTab
                    ? this.focusManager.setActiveItem(selectedTab)
                    : this.focusManager.setFirstItemActive();
                // setting the active item via the focus manager's API will not trigger an event
                // so we have to manually select the initially active tab
                Promise.resolve().then(() => this.selectTab(this.focusManager.getActiveItem()));
            }
        }
        handleKeyDown(event) {
            switch (event.key) {
                case ArrowDown:
                    const selectedTab = this.focusManager.getActiveItem();
                    if (selectedTab && selectedTab.panel)
                        selectedTab.panel.focus();
                    break;
            }
        }
        handleActiveTabChange(event) {
            const previousTab = event.detail.previous.item;
            const selectedTab = event.detail.current.item;
            if (previousTab !== selectedTab) {
                this.deselectTab(previousTab);
                this.selectTab(selectedTab);
            }
        }
        selectTab(tab) {
            if (tab) {
                tab.select();
                if (tab.panel)
                    tab.panel.hidden = false;
            }
        }
        deselectTab(tab) {
            if (tab) {
                tab.deselect();
                if (tab.panel)
                    tab.panel.hidden = true;
            }
        }
    };
    __decorate([
        property(),
        __metadata("design:type", String)
    ], TabList.prototype, "role", void 0);
    __decorate([
        listener({ event: 'keydown' }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], TabList.prototype, "handleKeyDown", null);
    __decorate([
        listener({
            event: 'active-item-change',
            target: function () { return this.focusManager; }
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TabList.prototype, "handleActiveTabChange", null);
    TabList = __decorate([
        component({
            selector: 'ui-tab-list',
            styles: [css `
    :host {
        display: flex;
        flex-flow: row nowrap;
    }
    ::slotted(ui-tab) {
        margin-right: 0.25rem;
    }
    `],
            template: () => html `<slot></slot>`
        })
    ], TabList);
    //# sourceMappingURL=tab-list.js.map

    let TabPanel = class TabPanel extends Component {
        connectedCallback() {
            super.connectedCallback();
            this.role = 'tabpanel';
            this.hidden = true;
            this.tabIndex = -1;
        }
    };
    __decorate([
        property({
            converter: AttributeConverterString,
        }),
        __metadata("design:type", String)
    ], TabPanel.prototype, "role", void 0);
    __decorate([
        property({
            attribute: 'aria-hidden',
            converter: AttributeConverterARIABoolean,
        }),
        __metadata("design:type", Boolean)
    ], TabPanel.prototype, "hidden", void 0);
    __decorate([
        property({
            attribute: 'aria-labelledby',
            converter: AttributeConverterString,
        }),
        __metadata("design:type", String)
    ], TabPanel.prototype, "labelledBy", void 0);
    TabPanel = __decorate([
        component({
            selector: 'ui-tab-panel',
            styles: [css `
    :host {
        display: block;
        position: relative;
        z-index: 1;
        padding: 0 1rem;
        background-color: var(--background-color);
        border: var(--border);
        border-radius: 0 var(--border-radius) var(--border-radius) var(--border-radius);
        box-shadow: var(--box-shadow);
    }
    :host([aria-hidden=true]) {
        display: none;
    }
    `],
            template: () => html `<slot></slot>`
        })
    ], TabPanel);
    //# sourceMappingURL=tab-panel.js.map

    let Toggle = class Toggle extends Component {
        constructor() {
            super(...arguments);
            this.checked = false;
            this.label = '';
            this.labelOn = '';
            this.labelOff = '';
        }
        connectedCallback() {
            super.connectedCallback();
            this.role = 'switch';
            this.tabIndex = 0;
        }
        toggle() {
            // trigger property-change event for `checked`
            this.watch(() => this.checked = !this.checked);
        }
        handeKeyDown(event) {
            if (event.key === Enter || event.key === Space) {
                this.toggle();
                // prevent space key from scrolling the page
                event.preventDefault();
            }
        }
    };
    __decorate([
        property({
            attribute: 'aria-checked',
            converter: AttributeConverterARIABoolean
        }),
        __metadata("design:type", Object)
    ], Toggle.prototype, "checked", void 0);
    __decorate([
        property({
            converter: AttributeConverterString
        }),
        __metadata("design:type", Object)
    ], Toggle.prototype, "label", void 0);
    __decorate([
        property({
            converter: AttributeConverterString,
            reflectProperty: false
        }),
        __metadata("design:type", Object)
    ], Toggle.prototype, "labelOn", void 0);
    __decorate([
        property({
            converter: AttributeConverterString,
            reflectProperty: false
        }),
        __metadata("design:type", Object)
    ], Toggle.prototype, "labelOff", void 0);
    __decorate([
        property(),
        __metadata("design:type", String)
    ], Toggle.prototype, "role", void 0);
    __decorate([
        listener({
            event: 'click'
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Toggle.prototype, "toggle", null);
    __decorate([
        listener({
            event: 'keydown'
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], Toggle.prototype, "handeKeyDown", null);
    Toggle = __decorate([
        component({
            selector: 'ui-toggle',
            template: toggle => html `
    <style>
        :host {
            --timing-cubic: cubic-bezier(0.55, 0.06, 0.68, 0.19);
            --timing-sine: cubic-bezier(0.47, 0, 0.75, 0.72);
            --transition-timing: var(--timing-sine);
            --transition-duration: .1s;
        }
        :host {
            display: inline-grid;
            grid-template-columns: repeat(auto-fit, minmax(var(--font-size), 1fr));

            min-width: calc(var(--font-size) * 2 + var(--border-width) * 2);
            height: calc(var(--font-size) + var(--border-width, 0.125rem) * 2);
            box-sizing: border-box;
            position: relative;

            line-height: var(--font-size, 1rem);
            vertical-align: middle;
            cursor: pointer;

            border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
            background-color: var(--border-color, rgba(0,0,0,.25));
            border-radius: var(--font-size, 1rem);

            /* transition-property: background-color, border-color;
            transition-duration: var(--transition-duration);
            transition-timing-function: var(--transition-timing); */
            transition: var(--transition-duration) var(--transition-timing);
        }
        :host([aria-checked=true]) {
            border-color: var(--selected-color, rgba(0,0,0,.25));
            background-color: var(--selected-color, rgba(0,0,0,.25));
        }
        :host([label-on][label-off]) {
            background-color: var(--background-color, #ffffff);
            border-radius: var(--border-radius, 0.25rem);
        }
        .toggle-thumb {
            height: var(--font-size);
            width: var(--font-size);
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 50%;
            background-color: var(--background-color, #ffffff);
            transition: all var(--transition-duration) var(--transition-timing);
        }
        :host([label-on][label-off]) .toggle-thumb {
            width: 50%;
            background-color: var(--border-color, rgba(0,0,0,.25));
            border-top-left-radius: calc(var(--border-radius, 0.25rem) - var(--border-width, 0.125rem));
            border-bottom-left-radius: calc(var(--border-radius, 0.25rem) - var(--border-width, 0.125rem));
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        :host([aria-checked="true"]) .toggle-thumb {
            left: 50%;
        }
        :host([aria-checked="true"][label-on][label-off]) .toggle-thumb {
            background-color: var(--selected-color, rgba(0,0,0,.25));
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-top-right-radius: calc(var(--border-radius, 0.25rem) - var(--border-width, 0.125rem));
            border-bottom-right-radius: calc(var(--border-radius, 0.25rem) - var(--border-width, 0.125rem));
        }
        .label {
            position: relative;
            padding: 0 .25rem;
            align-self: stretch;
            justify-self: stretch;
            text-align: center;
            font-size: 0.75rem;
            font-weight: bold;
            color: var(--border-color, rgba(0,0,0,.25));
            text-transform: uppercase;
            user-select: none;
            transition: var(--transition-duration) var(--transition-timing);
        }
        :host([aria-checked="true"]) .label-on {
            color: var(--background-color, #ffffff);
        }
        :host([aria-checked="false"]) .label-off {
            color: var(--background-color, #ffffff);
        }

    </style>
    <span class="toggle-thumb"></span>
    ${toggle.labelOn && toggle.labelOff
            ? html `<span class="label label-off">${toggle.labelOff}</span><span class="label label-on">${toggle.labelOn}</span>`
            : ''}
    `
        })
    ], Toggle);
    //# sourceMappingURL=toggle.js.map

    let App = class App extends Component {
    };
    App = __decorate([
        component({
            selector: 'demo-app',
            shadow: false,
            styles: [styles],
            template: template
        })
    ], App);
    //# sourceMappingURL=app.js.map

    function bootstrap() {
        const checkbox = document.querySelector('ui-checkbox');
        if (checkbox) {
            checkbox.addEventListener('checked-changed', event => console.log(event.detail));
        }
    }
    window.addEventListener('load', bootstrap);
    //# sourceMappingURL=main.js.map

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9pY29uL2ljb24udHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1oZWFkZXIudHMiLCJzcmMvaGVscGVycy9jb3B5cmlnaHQudHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1wYW5lbC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIiwic3JjL2FwcC5zdHlsZXMudHMiLCJzcmMvYXBwLnRlbXBsYXRlLnRzIiwic3JjL2NhcmQudHMiLCJzcmMvY2hlY2tib3gudHMiLCJzcmMvZXZlbnQtbWFuYWdlci50cyIsInNyYy9pZC1nZW5lcmF0b3IudHMiLCJzcmMvYmVoYXZpb3IudHMiLCJzcmMvb3ZlcmxheS9mb2N1cy1tb25pdG9yLnRzIiwic3JjL292ZXJsYXkvZm9jdXMtdHJhcC50cyIsInNyYy9vdmVybGF5L2NvbnRyb2xsZXIvb3ZlcmxheS1jb250cm9sbGVyLWNvbmZpZy50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL29mZnNldC50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL2FsaWdubWVudC50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3NpemUudHMiLCJzcmMvb3ZlcmxheS9wb3NpdGlvbi9wb3NpdGlvbi1jb25maWcudHMiLCJzcmMvb3ZlcmxheS9vdmVybGF5LWNvbmZpZy50cyIsInNyYy9vdmVybGF5L292ZXJsYXkudHMiLCJzcmMvZG9tLnRzIiwic3JjL292ZXJsYXkvY29udHJvbGxlci9kZWZhdWx0LW92ZXJsYXktY29udHJvbGxlci50cyIsInNyYy9vdmVybGF5L2NvbnRyb2xsZXIvZGlhbG9nLW92ZXJsYXktY29udHJvbGxlci50cyIsInNyYy9vdmVybGF5L2NvbnRyb2xsZXIvdG9vbHRpcC1vdmVybGF5LWNvbnRyb2xsZXIudHMiLCJzcmMvb3ZlcmxheS9jb250cm9sbGVyL292ZXJsYXktY29udHJvbGxlci1mYWN0b3J5LnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS1iYWNrZHJvcC50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3Bvc2l0aW9uLnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3kudHMiLCJzcmMvb3ZlcmxheS9wb3NpdGlvbi9zdHJhdGVnaWVzL2NlbnRlcmVkLXBvc2l0aW9uLXN0cmF0ZWd5LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vc3RyYXRlZ2llcy9jb25uZWN0ZWQtcG9zaXRpb24tc3RyYXRlZ3kudHMiLCJzcmMvb3ZlcmxheS9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneS1mYWN0b3J5LnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS1zZXJ2aWNlLnRzIiwic3JjL292ZXJsYXktZGVtby50cyIsInNyYy90YWJzL3RhYi50cyIsInNyYy90YWJzL3RhYi1saXN0LnRzIiwic3JjL3RhYnMvdGFiLXBhbmVsLnRzIiwic3JjL3RvZ2dsZS50cyIsInNyYy9hcHAudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmNvbnN0IGRpcmVjdGl2ZXMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBCcmFuZHMgYSBmdW5jdGlvbiBhcyBhIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uIHNvIHRoYXQgbGl0LWh0bWwgd2lsbCBjYWxsXG4gKiB0aGUgZnVuY3Rpb24gZHVyaW5nIHRlbXBsYXRlIHJlbmRlcmluZywgcmF0aGVyIHRoYW4gcGFzc2luZyBhcyBhIHZhbHVlLlxuICpcbiAqIEEgX2RpcmVjdGl2ZV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgUGFydCBhcyBhbiBhcmd1bWVudC4gSXQgaGFzIHRoZVxuICogc2lnbmF0dXJlOiBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLlxuICpcbiAqIEEgZGlyZWN0aXZlIF9mYWN0b3J5XyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYXJndW1lbnRzIGZvciBkYXRhIGFuZFxuICogY29uZmlndXJhdGlvbiBhbmQgcmV0dXJucyBhIGRpcmVjdGl2ZS4gVXNlcnMgb2YgZGlyZWN0aXZlIHVzdWFsbHkgcmVmZXIgdG9cbiAqIHRoZSBkaXJlY3RpdmUgZmFjdG9yeSBhcyB0aGUgZGlyZWN0aXZlLiBGb3IgZXhhbXBsZSwgXCJUaGUgcmVwZWF0IGRpcmVjdGl2ZVwiLlxuICpcbiAqIFVzdWFsbHkgYSB0ZW1wbGF0ZSBhdXRob3Igd2lsbCBpbnZva2UgYSBkaXJlY3RpdmUgZmFjdG9yeSBpbiB0aGVpciB0ZW1wbGF0ZVxuICogd2l0aCByZWxldmFudCBhcmd1bWVudHMsIHdoaWNoIHdpbGwgdGhlbiByZXR1cm4gYSBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKlxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgdXNpbmcgdGhlIGByZXBlYXQoKWAgZGlyZWN0aXZlIGZhY3RvcnkgdGhhdCB0YWtlcyBhblxuICogYXJyYXkgYW5kIGEgZnVuY3Rpb24gdG8gcmVuZGVyIGFuIGl0ZW06XG4gKlxuICogYGBganNcbiAqIGh0bWxgPHVsPjwke3JlcGVhdChpdGVtcywgKGl0ZW0pID0+IGh0bWxgPGxpPiR7aXRlbX08L2xpPmApfTwvdWw+YFxuICogYGBgXG4gKlxuICogV2hlbiBgcmVwZWF0YCBpcyBpbnZva2VkLCBpdCByZXR1cm5zIGEgZGlyZWN0aXZlIGZ1bmN0aW9uIHRoYXQgY2xvc2VzIG92ZXJcbiAqIGBpdGVtc2AgYW5kIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi4gV2hlbiB0aGUgb3V0ZXIgdGVtcGxhdGUgaXMgcmVuZGVyZWQsIHRoZVxuICogcmV0dXJuIGRpcmVjdGl2ZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgUGFydCBmb3IgdGhlIGV4cHJlc3Npb24uXG4gKiBgcmVwZWF0YCB0aGVuIHBlcmZvcm1zIGl0J3MgY3VzdG9tIGxvZ2ljIHRvIHJlbmRlciBtdWx0aXBsZSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0gZiBUaGUgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24uIE11c3QgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYVxuICogZnVuY3Rpb24gb2YgdGhlIHNpZ25hdHVyZSBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLiBUaGUgcmV0dXJuZWQgZnVuY3Rpb24gd2lsbFxuICogYmUgY2FsbGVkIHdpdGggdGhlIHBhcnQgb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogaW1wb3J0IHtkaXJlY3RpdmUsIGh0bWx9IGZyb20gJ2xpdC1odG1sJztcbiAqXG4gKiBjb25zdCBpbW11dGFibGUgPSBkaXJlY3RpdmUoKHYpID0+IChwYXJ0KSA9PiB7XG4gKiAgIGlmIChwYXJ0LnZhbHVlICE9PSB2KSB7XG4gKiAgICAgcGFydC5zZXRWYWx1ZSh2KVxuICogICB9XG4gKiB9KTtcbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9IChmKSA9PiAoKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBkID0gZiguLi5hcmdzKTtcbiAgICBkaXJlY3RpdmVzLnNldChkLCB0cnVlKTtcbiAgICByZXR1cm4gZDtcbn0pO1xuZXhwb3J0IGNvbnN0IGlzRGlyZWN0aXZlID0gKG8pID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdmdW5jdGlvbicgJiYgZGlyZWN0aXZlcy5oYXMobyk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlyZWN0aXZlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogVHJ1ZSBpZiB0aGUgY3VzdG9tIGVsZW1lbnRzIHBvbHlmaWxsIGlzIGluIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ0VQb2x5ZmlsbCA9IHdpbmRvdy5jdXN0b21FbGVtZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sgIT09XG4gICAgICAgIHVuZGVmaW5lZDtcbi8qKlxuICogUmVwYXJlbnRzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydGAgKGluY2x1c2l2ZSkgdG8gYGVuZGAgKGV4Y2x1c2l2ZSksXG4gKiBpbnRvIGFub3RoZXIgY29udGFpbmVyIChjb3VsZCBiZSB0aGUgc2FtZSBjb250YWluZXIpLCBiZWZvcmUgYGJlZm9yZWAuIElmXG4gKiBgYmVmb3JlYCBpcyBudWxsLCBpdCBhcHBlbmRzIHRoZSBub2RlcyB0byB0aGUgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgcmVwYXJlbnROb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsLCBiZWZvcmUgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKHN0YXJ0LCBiZWZvcmUpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8qKlxuICogUmVtb3ZlcyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLCBmcm9tXG4gKiBgY29udGFpbmVyYC5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZU5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwpID0+IHtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgICAgICBjb25zdCBuID0gc3RhcnQubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG9tLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxOCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IHt9O1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIE5vZGVQYXJ0IHRvIGZ1bGx5IGNsZWFyIGl0cyBjb250ZW50LlxuICovXG5leHBvcnQgY29uc3Qgbm90aGluZyA9IHt9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHdpdGggZW1iZWRkZWQgdW5pcXVlIGtleSB0byBhdm9pZCBjb2xsaXNpb24gd2l0aFxuICogcG9zc2libGUgdGV4dCBpbiB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBtYXJrZXIgPSBge3tsaXQtJHtTdHJpbmcoTWF0aC5yYW5kb20oKSkuc2xpY2UoMil9fX1gO1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB1c2VkIHRleHQtcG9zaXRpb25zLCBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZXMsIGFuZFxuICogYXR0cmlidXRlcyB3aXRoIG1hcmt1cC1saWtlIHRleHQgdmFsdWVzLlxuICovXG5leHBvcnQgY29uc3Qgbm9kZU1hcmtlciA9IGA8IS0tJHttYXJrZXJ9LS0+YDtcbmV4cG9ydCBjb25zdCBtYXJrZXJSZWdleCA9IG5ldyBSZWdFeHAoYCR7bWFya2VyfXwke25vZGVNYXJrZXJ9YCk7XG4vKipcbiAqIFN1ZmZpeCBhcHBlbmRlZCB0byBhbGwgYm91bmQgYXR0cmlidXRlIG5hbWVzLlxuICovXG5leHBvcnQgY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIFRlbXBsYXRlIHRoYXQgdHJhY2tzIHRoZSBsb2NhdGlvbiBvZiBkeW5hbWljIHBhcnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbXTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZWxlbWVudC5jb250ZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgaW5kZXggYXNzb2NpYXRlZCB3aXRoIGEgcGFydC4gV2UgdHJ5IHRvIGRlbGV0ZVxuICAgICAgICAvLyB1bm5lY2Vzc2FyeSBub2RlcywgYnV0IHdlIG5ldmVyIHdhbnQgdG8gYXNzb2NpYXRlIHR3byBkaWZmZXJlbnQgcGFydHNcbiAgICAgICAgLy8gdG8gdGhlIHNhbWUgaW5kZXguIFRoZXkgbXVzdCBoYXZlIGEgY29uc3RhbnQgbm9kZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgbGFzdFBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgeyBzdHJpbmdzLCB2YWx1ZXM6IHsgbGVuZ3RoIH0gfSA9IHJlc3VsdDtcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAvKiBOb2RlLkVMRU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGxlbmd0aCB9ID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9OYW1lZE5vZGVNYXAsXG4gICAgICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHJldHVybmVkIGluIGRvY3VtZW50IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBwYXJ0aWN1bGFyLCBFZGdlL0lFIGNhbiByZXR1cm4gdGhlbSBvdXQgb2Ygb3JkZXIsIHNvIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgICAgICAvLyBhc3N1bWUgYSBjb3JyZXNwb25kZW5jZSBiZXR3ZWVuIHBhcnQgaW5kZXggYW5kIGF0dHJpYnV0ZSBpbmRleC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoKGF0dHJpYnV0ZXNbaV0ubmFtZSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBzZWN0aW9uIGxlYWRpbmcgdXAgdG8gdGhlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIGluIHRoaXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gc3RyaW5nc1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMoc3RyaW5nRm9yUGFydClbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxsIGJvdW5kIGF0dHJpYnV0ZXMgaGF2ZSBoYWQgYSBzdWZmaXggYWRkZWQgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBsYXRlUmVzdWx0I2dldEhUTUwgdG8gb3B0IG91dCBvZiBzcGVjaWFsIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcuIFRvIGxvb2sgdXAgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB3ZSBhbHNvIG5lZWQgdG8gYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3VmZml4LlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTG9va3VwTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKSArIGJvdW5kQXR0cmlidXRlU3VmZml4O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IGF0dHJpYnV0ZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdhdHRyaWJ1dGUnLCBpbmRleCwgbmFtZSwgc3RyaW5nczogc3RhdGljcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBzdGF0aWNzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gZGF0YS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbnNlcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcyA9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocyA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBjcmVhdGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCAmJiBlbmRzV2l0aChtYXRjaFsyXSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArIG1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzJdLnNsaWNlKDAsIC1ib3VuZEF0dHJpYnV0ZVN1ZmZpeC5sZW5ndGgpICsgbWF0Y2hbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpbnNlcnQsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogKytpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIHRleHQsIHdlIG11c3QgaW5zZXJ0IGEgY29tbWVudCB0byBtYXJrIG91ciBwbGFjZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHRydXN0IGl0IHdpbGwgc3RpY2sgYXJvdW5kIGFmdGVyIGNsb25pbmcuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9IHN0cmluZ3NbbGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgcGFydCBmb3IgZWFjaCBtYXRjaCBmb3VuZFxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogTm9kZS5DT01NRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kYXRhID09PSBtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2ZcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gICogV2UgZG9uJ3QgaGF2ZSBhIHByZXZpb3VzU2libGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyAgKiBUaGUgcHJldmlvdXNTaWJsaW5nIGlzIGFscmVhZHkgdGhlIHN0YXJ0IG9mIGEgcHJldmlvdXMgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IG51bGwgfHwgaW5kZXggPT09IGxhc3RQYXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0UGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBuZXh0U2libGluZywga2VlcCB0aGlzIG5vZGUgc28gd2UgaGF2ZSBhbiBlbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiByZW1vdmUgaXQgdG8gc2F2ZSBmdXR1cmUgY29zdHMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGkgPSBub2RlLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBjb25zaWRlciB3aGV0aGVyIGl0J3MgZXZlbiB3b3J0aCBpdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBiaW5kaW5ncyBpbiBjb21tZW50cyB3b3JrXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiAtMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSB0ZXh0IGJpbmRpbmcgbm9kZXMgYWZ0ZXIgdGhlIHdhbGsgdG8gbm90IGRpc3R1cmIgdGhlIFRyZWVXYWxrZXJcbiAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVuZHNXaXRoID0gKHN0ciwgc3VmZml4KSA9PiB7XG4gICAgY29uc3QgaW5kZXggPSBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aDtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBzdHIuc2xpY2UoaW5kZXgpID09PSBzdWZmaXg7XG59O1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLy8gQWxsb3dzIGBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKWAgdG8gYmUgcmVuYW1lZCBmb3IgYVxuLy8gc21hbGwgbWFudWFsIHNpemUtc2F2aW5ncy5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbi8qKlxuICogVGhpcyByZWdleCBleHRyYWN0cyB0aGUgYXR0cmlidXRlIG5hbWUgcHJlY2VkaW5nIGFuIGF0dHJpYnV0ZS1wb3NpdGlvblxuICogZXhwcmVzc2lvbi4gSXQgZG9lcyB0aGlzIGJ5IG1hdGNoaW5nIHRoZSBzeW50YXggYWxsb3dlZCBmb3IgYXR0cmlidXRlc1xuICogYWdhaW5zdCB0aGUgc3RyaW5nIGxpdGVyYWwgZGlyZWN0bHkgcHJlY2VkaW5nIHRoZSBleHByZXNzaW9uLCBhc3N1bWluZyB0aGF0XG4gKiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhbiBhdHRyaWJ1dGUtdmFsdWUgcG9zaXRpb24uXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx4MDlcXHgwYVxceDBjXFx4MGRcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2luZnJhc3RydWN0dXJlLmh0bWwjc3BhY2UtY2hhcmFjdGVyc1xuICpcbiAqIFwiXFwwLVxceDFGXFx4N0YtXFx4OUZcIiBhcmUgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnMsIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5XG4gKiBzcGFjZSBjaGFyYWN0ZXIgZXhjZXB0IFwiIFwiLlxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIGNvbnRyb2wgY2hhcmFjdGVyLCBzcGFjZSBjaGFyYWN0ZXIsICgnKSxcbiAqICAgIChcIiksIFwiPlwiLCBcIj1cIiwgb3IgXCIvXCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmV4cG9ydCBjb25zdCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4ID0gLyhbIFxceDA5XFx4MGFcXHgwY1xceDBkXSkoW15cXDAtXFx4MUZcXHg3Ri1cXHg5RiBcIic+PS9dKykoWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qPVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKig/OlteIFxceDA5XFx4MGFcXHgwY1xceDBkXCInYDw+PV0qfFwiW15cIl0qfCdbXiddKikpJC87XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNDRVBvbHlmaWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgYSBgVGVtcGxhdGVgIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIHRoZSBET00gYW5kIHVwZGF0ZWRcbiAqIHdpdGggbmV3IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlSW5zdGFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBwcm9jZXNzb3IsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fX3BhcnRzID0gW107XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIHVwZGF0ZSh2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5zZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jbG9uZSgpIHtcbiAgICAgICAgLy8gVGhlcmUgYXJlIGEgbnVtYmVyIG9mIHN0ZXBzIGluIHRoZSBsaWZlY3ljbGUgb2YgYSB0ZW1wbGF0ZSBpbnN0YW5jZSdzXG4gICAgICAgIC8vIERPTSBmcmFnbWVudDpcbiAgICAgICAgLy8gIDEuIENsb25lIC0gY3JlYXRlIHRoZSBpbnN0YW5jZSBmcmFnbWVudFxuICAgICAgICAvLyAgMi4gQWRvcHQgLSBhZG9wdCBpbnRvIHRoZSBtYWluIGRvY3VtZW50XG4gICAgICAgIC8vICAzLiBQcm9jZXNzIC0gZmluZCBwYXJ0IG1hcmtlcnMgYW5kIGNyZWF0ZSBwYXJ0c1xuICAgICAgICAvLyAgNC4gVXBncmFkZSAtIHVwZ3JhZGUgY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIC8vICA1LiBVcGRhdGUgLSBzZXQgbm9kZSwgYXR0cmlidXRlLCBwcm9wZXJ0eSwgZXRjLiwgdmFsdWVzXG4gICAgICAgIC8vICA2LiBDb25uZWN0IC0gY29ubmVjdCB0byB0aGUgZG9jdW1lbnQuIE9wdGlvbmFsIGFuZCBvdXRzaWRlIG9mIHRoaXNcbiAgICAgICAgLy8gICAgIG1ldGhvZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgaGF2ZSBhIGZldyBjb25zdHJhaW50cyBvbiB0aGUgb3JkZXJpbmcgb2YgdGhlc2Ugc3RlcHM6XG4gICAgICAgIC8vICAqIFdlIG5lZWQgdG8gdXBncmFkZSBiZWZvcmUgdXBkYXRpbmcsIHNvIHRoYXQgcHJvcGVydHkgdmFsdWVzIHdpbGwgcGFzc1xuICAgICAgICAvLyAgICB0aHJvdWdoIGFueSBwcm9wZXJ0eSBzZXR0ZXJzLlxuICAgICAgICAvLyAgKiBXZSB3b3VsZCBsaWtlIHRvIHByb2Nlc3MgYmVmb3JlIHVwZ3JhZGluZyBzbyB0aGF0IHdlJ3JlIHN1cmUgdGhhdCB0aGVcbiAgICAgICAgLy8gICAgY2xvbmVkIGZyYWdtZW50IGlzIGluZXJ0IGFuZCBub3QgZGlzdHVyYmVkIGJ5IHNlbGYtbW9kaWZ5aW5nIERPTS5cbiAgICAgICAgLy8gICogV2Ugd2FudCBjdXN0b20gZWxlbWVudHMgdG8gdXBncmFkZSBldmVuIGluIGRpc2Nvbm5lY3RlZCBmcmFnbWVudHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEdpdmVuIHRoZXNlIGNvbnN0cmFpbnRzLCB3aXRoIGZ1bGwgY3VzdG9tIGVsZW1lbnRzIHN1cHBvcnQgd2Ugd291bGRcbiAgICAgICAgLy8gcHJlZmVyIHRoZSBvcmRlcjogQ2xvbmUsIFByb2Nlc3MsIEFkb3B0LCBVcGdyYWRlLCBVcGRhdGUsIENvbm5lY3RcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQnV0IFNhZmFyaSBkb29lcyBub3QgaW1wbGVtZW50IEN1c3RvbUVsZW1lbnRSZWdpc3RyeSN1cGdyYWRlLCBzbyB3ZVxuICAgICAgICAvLyBjYW4gbm90IGltcGxlbWVudCB0aGF0IG9yZGVyIGFuZCBzdGlsbCBoYXZlIHVwZ3JhZGUtYmVmb3JlLXVwZGF0ZSBhbmRcbiAgICAgICAgLy8gdXBncmFkZSBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLiBTbyB3ZSBpbnN0ZWFkIHNhY3JpZmljZSB0aGVcbiAgICAgICAgLy8gcHJvY2Vzcy1iZWZvcmUtdXBncmFkZSBjb25zdHJhaW50LCBzaW5jZSBpbiBDdXN0b20gRWxlbWVudHMgdjEgZWxlbWVudHNcbiAgICAgICAgLy8gbXVzdCBub3QgbW9kaWZ5IHRoZWlyIGxpZ2h0IERPTSBpbiB0aGUgY29uc3RydWN0b3IuIFdlIHN0aWxsIGhhdmUgaXNzdWVzXG4gICAgICAgIC8vIHdoZW4gY28tZXhpc3Rpbmcgd2l0aCBDRXYwIGVsZW1lbnRzIGxpa2UgUG9seW1lciAxLCBhbmQgd2l0aCBwb2x5ZmlsbHNcbiAgICAgICAgLy8gdGhhdCBkb24ndCBzdHJpY3RseSBhZGhlcmUgdG8gdGhlIG5vLW1vZGlmaWNhdGlvbiBydWxlIGJlY2F1c2Ugc2hhZG93XG4gICAgICAgIC8vIERPTSwgd2hpY2ggbWF5IGJlIGNyZWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCBpcyBlbXVsYXRlZCBieSBiZWluZyBwbGFjZWRcbiAgICAgICAgLy8gaW4gdGhlIGxpZ2h0IERPTS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHJlc3VsdGluZyBvcmRlciBpcyBvbiBuYXRpdmUgaXM6IENsb25lLCBBZG9wdCwgVXBncmFkZSwgUHJvY2VzcyxcbiAgICAgICAgLy8gVXBkYXRlLCBDb25uZWN0LiBkb2N1bWVudC5pbXBvcnROb2RlKCkgcGVyZm9ybXMgQ2xvbmUsIEFkb3B0LCBhbmQgVXBncmFkZVxuICAgICAgICAvLyBpbiBvbmUgc3RlcC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIEN1c3RvbSBFbGVtZW50cyB2MSBwb2x5ZmlsbCBzdXBwb3J0cyB1cGdyYWRlKCksIHNvIHRoZSBvcmRlciB3aGVuXG4gICAgICAgIC8vIHBvbHlmaWxsZWQgaXMgdGhlIG1vcmUgaWRlYWw6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLFxuICAgICAgICAvLyBDb25uZWN0LlxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGlzQ0VQb2x5ZmlsbCA/XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkgOlxuICAgICAgICAgICAgZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy50ZW1wbGF0ZS5wYXJ0cztcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZnJhZ21lbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgICAgIGxldCBwYXJ0O1xuICAgICAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHRoZSBub2RlcyBhbmQgcGFydHMgb2YgYSB0ZW1wbGF0ZVxuICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIGlmICghaXNUZW1wbGF0ZVBhcnRBY3RpdmUocGFydCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgdGhlIHRyZWUgd2Fsa2VyIHVudGlsIHdlIGZpbmQgb3VyIG5leHQgcGFydCdzIG5vZGUuXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgbXVsdGlwbGUgcGFydHMgbWF5IHNoYXJlIHRoZSBzYW1lIG5vZGUgKGF0dHJpYnV0ZSBwYXJ0c1xuICAgICAgICAgICAgLy8gb24gYSBzaW5nbGUgZWxlbWVudCksIHNvIHRoaXMgbG9vcCBtYXkgbm90IHJ1biBhdCBhbGwuXG4gICAgICAgICAgICB3aGlsZSAobm9kZUluZGV4IDwgcGFydC5pbmRleCkge1xuICAgICAgICAgICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGV4aGF1c3RlZCB0aGUgY29udGVudCBpbnNpZGUgYSBuZXN0ZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlIHdhbGtlciB3aWxsIGZpbmQgYSBuZXh0Tm9kZSBvdXRzaWRlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlJ3ZlIGFycml2ZWQgYXQgb3VyIHBhcnQncyBub2RlLlxuICAgICAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucHJvY2Vzc29yLmhhbmRsZVRleHRFeHByZXNzaW9uKHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcGFydC5pbnNlcnRBZnRlck5vZGUobm9kZS5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2goLi4udGhpcy5wcm9jZXNzb3IuaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMobm9kZSwgcGFydC5uYW1lLCBwYXJ0LnN0cmluZ3MsIHRoaXMub3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ0VQb2x5ZmlsbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRvcHROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIGN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1pbnN0YW5jZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJvdW5kQXR0cmlidXRlU3VmZml4LCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LCBtYXJrZXIsIG5vZGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmNvbnN0IGNvbW1lbnRNYXJrZXIgPSBgICR7bWFya2VyfSBgO1xuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgYGh0bWxgLCB3aGljaCBob2xkcyBhIFRlbXBsYXRlIGFuZCB0aGUgdmFsdWVzIGZyb21cbiAqIGludGVycG9sYXRlZCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdHJpbmdzLCB2YWx1ZXMsIHR5cGUsIHByb2Nlc3Nvcikge1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgSFRNTCB1c2VkIHRvIGNyZWF0ZSBhIGA8dGVtcGxhdGU+YCBlbGVtZW50LlxuICAgICAqL1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLnN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgbGV0IGlzQ29tbWVudEJpbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3NbaV07XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBiaW5kaW5nIHdlIHdhbnQgdG8gZGV0ZXJtaW5lIHRoZSBraW5kIG9mIG1hcmtlciB0byBpbnNlcnRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIHRlbXBsYXRlIHNvdXJjZSBiZWZvcmUgaXQncyBwYXJzZWQgYnkgdGhlIGJyb3dzZXIncyBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFRoZSBtYXJrZXIgdHlwZSBpcyBiYXNlZCBvbiB3aGV0aGVyIHRoZSBleHByZXNzaW9uIGlzIGluIGFuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGUsIHRleHQsIG9yIGNvbW1lbnQgcG9pc2l0aW9uLlxuICAgICAgICAgICAgLy8gICAqIEZvciBub2RlLXBvc2l0aW9uIGJpbmRpbmdzIHdlIGluc2VydCBhIGNvbW1lbnQgd2l0aCB0aGUgbWFya2VyXG4gICAgICAgICAgICAvLyAgICAgc2VudGluZWwgYXMgaXRzIHRleHQgY29udGVudCwgbGlrZSA8IS0te3tsaXQtZ3VpZH19LS0+LlxuICAgICAgICAgICAgLy8gICAqIEZvciBhdHRyaWJ1dGUgYmluZGluZ3Mgd2UgaW5zZXJ0IGp1c3QgdGhlIG1hcmtlciBzZW50aW5lbCBmb3IgdGhlXG4gICAgICAgICAgICAvLyAgICAgZmlyc3QgYmluZGluZywgc28gdGhhdCB3ZSBzdXBwb3J0IHVucXVvdGVkIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAgICAgICAgICAgIC8vICAgICBTdWJzZXF1ZW50IGJpbmRpbmdzIGNhbiB1c2UgYSBjb21tZW50IG1hcmtlciBiZWNhdXNlIG11bHRpLWJpbmRpbmdcbiAgICAgICAgICAgIC8vICAgICBhdHRyaWJ1dGVzIG11c3QgYmUgcXVvdGVkLlxuICAgICAgICAgICAgLy8gICAqIEZvciBjb21tZW50IGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgc28gd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vICAgICBjbG9zZSB0aGUgY29tbWVudC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgc2NhbnMgdGhlIHRlbXBsYXRlIHNvdXJjZSwgYnV0IGlzICpub3QqIGFuIEhUTUxcbiAgICAgICAgICAgIC8vIHBhcnNlci4gV2UgZG9uJ3QgbmVlZCB0byB0cmFjayB0aGUgdHJlZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwsIG9ubHlcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgYSBiaW5kaW5nIGlzIGluc2lkZSBhIGNvbW1lbnQsIGFuZCBpZiBub3QsIGlmIGl0IGFwcGVhcnMgdG8gYmVcbiAgICAgICAgICAgIC8vIHRoZSBmaXJzdCBiaW5kaW5nIGluIGFuIGF0dHJpYnV0ZS5cbiAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRPcGVuID0gcy5sYXN0SW5kZXhPZignPCEtLScpO1xuICAgICAgICAgICAgLy8gV2UncmUgaW4gY29tbWVudCBwb3NpdGlvbiBpZiB3ZSBoYXZlIGEgY29tbWVudCBvcGVuIHdpdGggbm8gZm9sbG93aW5nXG4gICAgICAgICAgICAvLyBjb21tZW50IGNsb3NlLiBCZWNhdXNlIDwtLSBjYW4gYXBwZWFyIGluIGFuIGF0dHJpYnV0ZSB2YWx1ZSB0aGVyZSBjYW5cbiAgICAgICAgICAgIC8vIGJlIGZhbHNlIHBvc2l0aXZlcy5cbiAgICAgICAgICAgIGlzQ29tbWVudEJpbmRpbmcgPSAoY29tbWVudE9wZW4gPiAtMSB8fCBpc0NvbW1lbnRCaW5kaW5nKSAmJlxuICAgICAgICAgICAgICAgIHMuaW5kZXhPZignLS0+JywgY29tbWVudE9wZW4gKyAxKSA9PT0gLTE7XG4gICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhbiBhdHRyaWJ1dGUtbGlrZSBzZXF1ZW5jZSBwcmVjZWVkaW5nIHRoZVxuICAgICAgICAgICAgLy8gZXhwcmVzc2lvbi4gVGhpcyBjYW4gbWF0Y2ggXCJuYW1lPXZhbHVlXCIgbGlrZSBzdHJ1Y3R1cmVzIGluIHRleHQsXG4gICAgICAgICAgICAvLyBjb21tZW50cywgYW5kIGF0dHJpYnV0ZSB2YWx1ZXMsIHNvIHRoZXJlIGNhbiBiZSBmYWxzZS1wb3NpdGl2ZXMuXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVNYXRjaCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzKTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVNYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgaW4gdGhpcyBicmFuY2ggaWYgd2UgZG9uJ3QgaGF2ZSBhIGF0dHJpYnV0ZS1saWtlXG4gICAgICAgICAgICAgICAgLy8gcHJlY2VlZGluZyBzZXF1ZW5jZS4gRm9yIGNvbW1lbnRzLCB0aGlzIGd1YXJkcyBhZ2FpbnN0IHVudXN1YWxcbiAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGUgdmFsdWVzIGxpa2UgPGRpdiBmb289XCI8IS0tJHsnYmFyJ31cIj4uIENhc2VzIGxpa2VcbiAgICAgICAgICAgICAgICAvLyA8IS0tIGZvbz0keydiYXInfS0tPiBhcmUgaGFuZGxlZCBjb3JyZWN0bHkgaW4gdGhlIGF0dHJpYnV0ZSBicmFuY2hcbiAgICAgICAgICAgICAgICAvLyBiZWxvdy5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMgKyAoaXNDb21tZW50QmluZGluZyA/IGNvbW1lbnRNYXJrZXIgOiBub2RlTWFya2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBhdHRyaWJ1dGVzIHdlIHVzZSBqdXN0IGEgbWFya2VyIHNlbnRpbmVsLCBhbmQgYWxzbyBhcHBlbmQgYVxuICAgICAgICAgICAgICAgIC8vICRsaXQkIHN1ZmZpeCB0byB0aGUgbmFtZSB0byBvcHQtb3V0IG9mIGF0dHJpYnV0ZS1zcGVjaWZpYyBwYXJzaW5nXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBJRSBhbmQgRWRnZSBkbyBmb3Igc3R5bGUgYW5kIGNlcnRhaW4gU1ZHIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzLnN1YnN0cigwLCBhdHRyaWJ1dGVNYXRjaC5pbmRleCkgKyBhdHRyaWJ1dGVNYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU1hdGNoWzJdICsgYm91bmRBdHRyaWJ1dGVTdWZmaXggKyBhdHRyaWJ1dGVNYXRjaFszXSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBodG1sICs9IHRoaXMuc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0aGlzLmdldEhUTUwoKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCBmb3IgU1ZHIGZyYWdtZW50cy5cbiAqXG4gKiBUaGlzIGNsYXNzIHdyYXBzIEhUTUwgaW4gYW4gYDxzdmc+YCB0YWcgaW4gb3JkZXIgdG8gcGFyc2UgaXRzIGNvbnRlbnRzIGluIHRoZVxuICogU1ZHIG5hbWVzcGFjZSwgdGhlbiBtb2RpZmllcyB0aGUgdGVtcGxhdGUgdG8gcmVtb3ZlIHRoZSBgPHN2Zz5gIHRhZyBzbyB0aGF0XG4gKiBjbG9uZXMgb25seSBjb250YWluZXIgdGhlIG9yaWdpbmFsIGZyYWdtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU1ZHVGVtcGxhdGVSZXN1bHQgZXh0ZW5kcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgcmV0dXJuIGA8c3ZnPiR7c3VwZXIuZ2V0SFRNTCgpfTwvc3ZnPmA7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBzdXBlci5nZXRUZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBjb250ZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoc3ZnRWxlbWVudCk7XG4gICAgICAgIHJlcGFyZW50Tm9kZXMoY29udGVudCwgc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLXJlc3VsdC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9wYXJ0LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuaW1wb3J0IHsgY3JlYXRlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICEodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpKTtcbn07XG5leHBvcnQgY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSB8fFxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICEhKHZhbHVlICYmIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pO1xufTtcbi8qKlxuICogV3JpdGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdG8gdGhlIERPTSBmb3IgYSBncm91cCBvZiBBdHRyaWJ1dGVQYXJ0cyBib3VuZCB0byBhXG4gKiBzaW5nbGUgYXR0aWJ1dGUuIFRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzXG4gKiBmb3IgYW4gYXR0cmlidXRlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydHNbaV0gPSB0aGlzLl9jcmVhdGVQYXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNpbmdsZSBwYXJ0LiBPdmVycmlkZSB0aGlzIHRvIGNyZWF0ZSBhIGRpZmZlcm50IHR5cGUgb2YgcGFydC5cbiAgICAgKi9cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG4gICAgICAgIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gcGFydC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQcmltaXRpdmUodikgfHwgIWlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogU3RyaW5nKHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0IG9mIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHQgPT09ICdzdHJpbmcnID8gdCA6IFN0cmluZyh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgdGhpcy5fZ2V0VmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGFsbCBvciBwYXJ0IG9mIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGNvbW1pdHRlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNvbW1pdHRlciA9IGNvbW1pdHRlcjtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBub0NoYW5nZSAmJiAoIWlzUHJpbWl0aXZlKHZhbHVlKSB8fCB2YWx1ZSAhPT0gdGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhIG5vdCBhIGRpcmVjdGl2ZSwgZGlydHkgdGhlIGNvbW1pdHRlciBzbyB0aGF0IGl0J2xsXG4gICAgICAgICAgICAvLyBjYWxsIHNldEF0dHJpYnV0ZS4gSWYgdGhlIHZhbHVlIGlzIGEgZGlyZWN0aXZlLCBpdCdsbCBkaXJ0eSB0aGVcbiAgICAgICAgICAgIC8vIGNvbW1pdHRlciBpZiBpdCBjYWxscyBzZXRWYWx1ZSgpLlxuICAgICAgICAgICAgaWYgKCFpc0RpcmVjdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1pdHRlci5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21taXR0ZXIuY29tbWl0KCk7XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhIGxvY2F0aW9uIHdpdGhpbiBhIE5vZGUgdHJlZS4gTGlrZSBhIFJhbmdlLCBOb2RlUGFydFxuICogaGFzIHN0YXJ0IGFuZCBlbmQgbG9jYXRpb25zIGFuZCBjYW4gc2V0IGFuZCB1cGRhdGUgdGhlIE5vZGVzIGJldHdlZW4gdGhvc2VcbiAqIGxvY2F0aW9ucy5cbiAqXG4gKiBOb2RlUGFydHMgc3VwcG9ydCBzZXZlcmFsIHZhbHVlIHR5cGVzOiBwcmltaXRpdmVzLCBOb2RlcywgVGVtcGxhdGVSZXN1bHRzLFxuICogYXMgd2VsbCBhcyBhcnJheXMgYW5kIGl0ZXJhYmxlcyBvZiB0aG9zZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvKGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBub2RlIChiZXR3ZWVuIGByZWZgIGFuZCBgcmVmYCdzIG5leHRcbiAgICAgKiBzaWJsaW5nKS4gQm90aCBgcmVmYCBhbmQgaXRzIG5leHQgc2libGluZyBtdXN0IGJlIHN0YXRpYywgdW5jaGFuZ2luZyBub2Rlc1xuICAgICAqIHN1Y2ggYXMgdGhvc2UgdGhhdCBhcHBlYXIgaW4gYSBsaXRlcmFsIHNlY3Rpb24gb2YgYSB0ZW1wbGF0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyTm9kZShyZWYpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSByZWY7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5uZXh0U2libGluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIHBhcmVudCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50b1BhcnQocGFydCkge1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuZW5kTm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlclBhcnQocmVmKSB7XG4gICAgICAgIHJlZi5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLmVuZE5vZGU7XG4gICAgICAgIHJlZi5lbmROb2RlID0gdGhpcy5zdGFydE5vZGU7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub3RoaW5nO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2luc2VydChub2RlKSB7XG4gICAgICAgIHRoaXMuZW5kTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbiAgICBfX2NvbW1pdE5vZGUodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLl9faW5zZXJ0KHZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfX2NvbW1pdFRleHQodmFsdWUpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuc3RhcnROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xuICAgICAgICAvLyBJZiBgdmFsdWVgIGlzbid0IGFscmVhZHkgYSBzdHJpbmcsIHdlIGV4cGxpY2l0bHkgY29udmVydCBpdCBoZXJlIGluIGNhc2VcbiAgICAgICAgLy8gaXQgY2FuJ3QgYmUgaW1wbGljaXRseSBjb252ZXJ0ZWQgLSBpLmUuIGl0J3MgYSBzeW1ib2wuXG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgICBpZiAobm9kZSA9PT0gdGhpcy5lbmROb2RlLnByZXZpb3VzU2libGluZyAmJlxuICAgICAgICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIHRleHQgbm9kZSBiZXR3ZWVuIHRoZSBtYXJrZXJzLCB3ZSBjYW4ganVzdFxuICAgICAgICAgICAgLy8gc2V0IGl0cyB2YWx1ZSwgcmF0aGVyIHRoYW4gcmVwbGFjaW5nIGl0LlxuICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogQ2FuIHdlIGp1c3QgY2hlY2sgaWYgdGhpcy52YWx1ZSBpcyBwcmltaXRpdmU/XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZUFzU3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWVBc1N0cmluZykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZUZhY3RvcnkodmFsdWUpO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlSW5zdGFuY2UgJiZcbiAgICAgICAgICAgIHRoaXMudmFsdWUudGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHByb3BhZ2F0ZSB0aGUgdGVtcGxhdGUgcHJvY2Vzc29yIGZyb20gdGhlIFRlbXBsYXRlUmVzdWx0XG4gICAgICAgICAgICAvLyBzbyB0aGF0IHdlIHVzZSBpdHMgc3ludGF4IGV4dGVuc2lvbiwgZXRjLiBUaGUgdGVtcGxhdGUgZmFjdG9yeSBjb21lc1xuICAgICAgICAgICAgLy8gZnJvbSB0aGUgcmVuZGVyIGZ1bmN0aW9uIG9wdGlvbnMgc28gdGhhdCBpdCBjYW4gY29udHJvbCB0ZW1wbGF0ZVxuICAgICAgICAgICAgLy8gY2FjaGluZyBhbmQgcHJlcHJvY2Vzc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUsIHZhbHVlLnByb2Nlc3NvciwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKCk7XG4gICAgICAgICAgICBpbnN0YW5jZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgICAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAgICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG4gICAgICAgIC8vIElmIF92YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgICAgICAvLyBpdGVyYWJsZSBhbmQgX3ZhbHVlIHdpbGwgY29udGFpbiB0aGUgTm9kZVBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlci4gSWYgX3ZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgICAgIC8vIGFycmF5IGZvciBOb2RlUGFydHMuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgICAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMudmFsdWU7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaXRlbVBhcnQ7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgICAgICBpZiAoaXRlbVBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0ID0gbmV3IE5vZGVQYXJ0KHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnRzLnB1c2goaXRlbVBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuYXBwZW5kSW50b1BhcnQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5pbnNlcnRBZnRlclBhcnQoaXRlbVBhcnRzW3BhcnRJbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtUGFydC5zZXRWYWx1ZShpdGVtKTtcbiAgICAgICAgICAgIGl0ZW1QYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKGl0ZW1QYXJ0ICYmIGl0ZW1QYXJ0LmVuZE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyKHN0YXJ0Tm9kZSA9IHRoaXMuc3RhcnROb2RlKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKHRoaXMuc3RhcnROb2RlLnBhcmVudE5vZGUsIHN0YXJ0Tm9kZS5uZXh0U2libGluZywgdGhpcy5lbmROb2RlKTtcbiAgICB9XG59XG4vKipcbiAqIEltcGxlbWVudHMgYSBib29sZWFuIGF0dHJpYnV0ZSwgcm91Z2hseSBhcyBkZWZpbmVkIGluIHRoZSBIVE1MXG4gKiBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIElmIHRoZSB2YWx1ZSBpcyB0cnV0aHksIHRoZW4gdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50IHdpdGggYSB2YWx1ZSBvZlxuICogJycuIElmIHRoZSB2YWx1ZSBpcyBmYWxzZXksIHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzdHJpbmdzLmxlbmd0aCAhPT0gMiB8fCBzdHJpbmdzWzBdICE9PSAnJyB8fCBzdHJpbmdzWzFdICE9PSAnJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb29sZWFuIGF0dHJpYnV0ZXMgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9ICEhdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG59XG4vKipcbiAqIFNldHMgYXR0cmlidXRlIHZhbHVlcyBmb3IgUHJvcGVydHlQYXJ0cywgc28gdGhhdCB0aGUgdmFsdWUgaXMgb25seSBzZXQgb25jZVxuICogZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHMgZm9yIGEgcHJvcGVydHkuXG4gKlxuICogSWYgYW4gZXhwcmVzc2lvbiBjb250cm9scyB0aGUgd2hvbGUgcHJvcGVydHkgdmFsdWUsIHRoZW4gdGhlIHZhbHVlIGlzIHNpbXBseVxuICogYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IHVuZGVyIGNvbnRyb2wuIElmIHRoZXJlIGFyZSBzdHJpbmcgbGl0ZXJhbHMgb3JcbiAqIG11bHRpcGxlIGV4cHJlc3Npb25zLCB0aGVuIHRoZSBzdHJpbmdzIGFyZSBleHByZXNzaW9ucyBhcmUgaW50ZXJwb2xhdGVkIGludG9cbiAqIGEgc3RyaW5nIGZpcnN0LlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlDb21taXR0ZXIgZXh0ZW5kcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHRoaXMuc2luZ2xlID1cbiAgICAgICAgICAgIChzdHJpbmdzLmxlbmd0aCA9PT0gMiAmJiBzdHJpbmdzWzBdID09PSAnJyAmJiBzdHJpbmdzWzFdID09PSAnJyk7XG4gICAgfVxuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5UGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5zaW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnRzWzBdLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0VmFsdWUoKTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMubmFtZV0gPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xufVxuLy8gRGV0ZWN0IGV2ZW50IGxpc3RlbmVyIG9wdGlvbnMgc3VwcG9ydC4gSWYgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eSBpcyByZWFkXG4vLyBmcm9tIHRoZSBvcHRpb25zIG9iamVjdCwgdGhlbiBvcHRpb25zIGFyZSBzdXBwb3J0ZWQuIElmIG5vdCwgdGhlbiB0aGUgdGhyaWRcbi8vIGFyZ3VtZW50IHRvIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlzIGludGVycHJldGVkIGFzIHRoZSBib29sZWFuIGNhcHR1cmVcbi8vIHZhbHVlIHNvIHdlIHNob3VsZCBvbmx5IHBhc3MgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eS5cbmxldCBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSBmYWxzZTtcbnRyeSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZ2V0IGNhcHR1cmUoKSB7XG4gICAgICAgICAgICBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbn1cbmNhdGNoIChfZSkge1xufVxuZXhwb3J0IGNsYXNzIEV2ZW50UGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgZXZlbnROYW1lLCBldmVudENvbnRleHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuZXZlbnRDb250ZXh0ID0gZXZlbnRDb250ZXh0O1xuICAgICAgICB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCA9IChlKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGUpO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0xpc3RlbmVyID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLnZhbHVlO1xuICAgICAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9IG5ld0xpc3RlbmVyID09IG51bGwgfHxcbiAgICAgICAgICAgIG9sZExpc3RlbmVyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAobmV3TGlzdGVuZXIuY2FwdHVyZSAhPT0gb2xkTGlzdGVuZXIuY2FwdHVyZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5vbmNlICE9PSBvbGRMaXN0ZW5lci5vbmNlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLnBhc3NpdmUgIT09IG9sZExpc3RlbmVyLnBhc3NpdmUpO1xuICAgICAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9IG5ld0xpc3RlbmVyICE9IG51bGwgJiYgKG9sZExpc3RlbmVyID09IG51bGwgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuICAgICAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaG91bGRBZGRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5fX29wdGlvbnMgPSBnZXRPcHRpb25zKG5ld0xpc3RlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuY2FsbCh0aGlzLmV2ZW50Q29udGV4dCB8fCB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gV2UgY29weSBvcHRpb25zIGJlY2F1c2Ugb2YgdGhlIGluY29uc2lzdGVudCBiZWhhdmlvciBvZiBicm93c2VycyB3aGVuIHJlYWRpbmdcbi8vIHRoZSB0aGlyZCBhcmd1bWVudCBvZiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci4gSUUxMSBkb2Vzbid0IHN1cHBvcnQgb3B0aW9uc1xuLy8gYXQgYWxsLiBDaHJvbWUgNDEgb25seSByZWFkcyBgY2FwdHVyZWAgaWYgdGhlIGFyZ3VtZW50IGlzIGFuIG9iamVjdC5cbmNvbnN0IGdldE9wdGlvbnMgPSAobykgPT4gbyAmJlxuICAgIChldmVudE9wdGlvbnNTdXBwb3J0ZWQgP1xuICAgICAgICB7IGNhcHR1cmU6IG8uY2FwdHVyZSwgcGFzc2l2ZTogby5wYXNzaXZlLCBvbmNlOiBvLm9uY2UgfSA6XG4gICAgICAgIG8uY2FwdHVyZSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0cy5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciB9IGZyb20gJy4vcGFydHMuanMnO1xuLyoqXG4gKiBDcmVhdGVzIFBhcnRzIHdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3Ige1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYW4gYXR0cmlidXRlLXBvc2l0aW9uIGJpbmRpbmcsIGdpdmVuIHRoZSBldmVudCwgYXR0cmlidXRlXG4gICAgICogbmFtZSwgYW5kIHN0cmluZyBsaXRlcmFscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gbmFtZSAgVGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtIHN0cmluZ3MgVGhlIHN0cmluZyBsaXRlcmFscy4gVGhlcmUgYXJlIGFsd2F5cyBhdCBsZWFzdCB0d28gc3RyaW5ncyxcbiAgICAgKiAgIGV2ZW50IGZvciBmdWxseS1jb250cm9sbGVkIGJpbmRpbmdzIHdpdGggYSBzaW5nbGUgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBoYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IG5hbWVbMF07XG4gICAgICAgIGlmIChwcmVmaXggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IFByb3BlcnR5Q29tbWl0dGVyKGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnQCcpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEV2ZW50UGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBvcHRpb25zLmV2ZW50Q29udGV4dCldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICc/Jykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgQm9vbGVhbkF0dHJpYnV0ZVBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBBdHRyaWJ1dGVDb21taXR0ZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYSB0ZXh0LXBvc2l0aW9uIGJpbmRpbmcuXG4gICAgICogQHBhcmFtIHRlbXBsYXRlRmFjdG9yeVxuICAgICAqL1xuICAgIGhhbmRsZVRleHRFeHByZXNzaW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlUGFydChvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yID0gbmV3IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgbWFya2VyLCBUZW1wbGF0ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBUaGUgZGVmYXVsdCBUZW1wbGF0ZUZhY3Rvcnkgd2hpY2ggY2FjaGVzIFRlbXBsYXRlcyBrZXllZCBvblxuICogcmVzdWx0LnR5cGUgYW5kIHJlc3VsdC5zdHJpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVGYWN0b3J5KHJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZUNhY2hlID0gdGVtcGxhdGVDYWNoZXMuZ2V0KHJlc3VsdC50eXBlKTtcbiAgICBpZiAodGVtcGxhdGVDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUgPSB7XG4gICAgICAgICAgICBzdHJpbmdzQXJyYXk6IG5ldyBXZWFrTWFwKCksXG4gICAgICAgICAgICBrZXlTdHJpbmc6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlcy5zZXQocmVzdWx0LnR5cGUsIHRlbXBsYXRlQ2FjaGUpO1xuICAgIH1cbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFRlbXBsYXRlU3RyaW5nc0FycmF5IGlzIG5ldywgZ2VuZXJhdGUgYSBrZXkgZnJvbSB0aGUgc3RyaW5nc1xuICAgIC8vIFRoaXMga2V5IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXMgd2l0aCBpZGVudGljYWwgY29udGVudFxuICAgIGNvbnN0IGtleSA9IHJlc3VsdC5zdHJpbmdzLmpvaW4obWFya2VyKTtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLmdldChrZXkpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm90IHNlZW4gdGhpcyBrZXkgYmVmb3JlLCBjcmVhdGUgYSBuZXcgVGVtcGxhdGVcbiAgICAgICAgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0LCByZXN1bHQuZ2V0VGVtcGxhdGVFbGVtZW50KCkpO1xuICAgICAgICAvLyBDYWNoZSB0aGUgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLnNldChrZXksIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLy8gQ2FjaGUgYWxsIGZ1dHVyZSBxdWVyaWVzIGZvciB0aGlzIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gICAgdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuc2V0KHJlc3VsdC5zdHJpbmdzLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xufVxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlQ2FjaGVzID0gbmV3IE1hcCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtZmFjdG9yeS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBOb2RlUGFydCB9IGZyb20gJy4vcGFydHMuanMnO1xuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCBjb25zdCBwYXJ0cyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIFJlbmRlcnMgYSB0ZW1wbGF0ZSByZXN1bHQgb3Igb3RoZXIgdmFsdWUgdG8gYSBjb250YWluZXIuXG4gKlxuICogVG8gdXBkYXRlIGEgY29udGFpbmVyIHdpdGggbmV3IHZhbHVlcywgcmVldmFsdWF0ZSB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBhbmRcbiAqIGNhbGwgYHJlbmRlcmAgd2l0aCB0aGUgbmV3IHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gcmVzdWx0IEFueSB2YWx1ZSByZW5kZXJhYmxlIGJ5IE5vZGVQYXJ0IC0gdHlwaWNhbGx5IGEgVGVtcGxhdGVSZXN1bHRcbiAqICAgICBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWcgbGlrZSBgaHRtbGAgb3IgYHN2Z2AuXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIHBhcmVudCB0byByZW5kZXIgdG8uIFRoZSBlbnRpcmUgY29udGVudHMgYXJlIGVpdGhlclxuICogICAgIHJlcGxhY2VkLCBvciBlZmZpY2llbnRseSB1cGRhdGVkIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhcyBwcmV2aW91c1xuICogICAgIHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgUmVuZGVyT3B0aW9ucyBmb3IgdGhlIGVudGlyZSByZW5kZXIgdHJlZSByZW5kZXJlZCB0byB0aGlzXG4gKiAgICAgY29udGFpbmVyLiBSZW5kZXIgb3B0aW9ucyBtdXN0ICpub3QqIGNoYW5nZSBiZXR3ZWVuIHJlbmRlcnMgdG8gdGhlIHNhbWVcbiAqICAgICBjb250YWluZXIsIGFzIHRob3NlIGNoYW5nZXMgd2lsbCBub3QgZWZmZWN0IHByZXZpb3VzbHkgcmVuZGVyZWQgRE9NLlxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKHJlc3VsdCwgY29udGFpbmVyLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IHBhcnQgPSBwYXJ0cy5nZXQoY29udGFpbmVyKTtcbiAgICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKGNvbnRhaW5lciwgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICBwYXJ0cy5zZXQoY29udGFpbmVyLCBwYXJ0ID0gbmV3IE5vZGVQYXJ0KE9iamVjdC5hc3NpZ24oeyB0ZW1wbGF0ZUZhY3RvcnkgfSwgb3B0aW9ucykpKTtcbiAgICAgICAgcGFydC5hcHBlbmRJbnRvKGNvbnRhaW5lcik7XG4gICAgfVxuICAgIHBhcnQuc2V0VmFsdWUocmVzdWx0KTtcbiAgICBwYXJ0LmNvbW1pdCgpO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqXG4gKiBNYWluIGxpdC1odG1sIG1vZHVsZS5cbiAqXG4gKiBNYWluIGV4cG9ydHM6XG4gKlxuICogLSAgW1todG1sXV1cbiAqIC0gIFtbc3ZnXV1cbiAqIC0gIFtbcmVuZGVyXV1cbiAqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKiBAcHJlZmVycmVkXG4gKi9cbi8qKlxuICogRG8gbm90IHJlbW92ZSB0aGlzIGNvbW1lbnQ7IGl0IGtlZXBzIHR5cGVkb2MgZnJvbSBtaXNwbGFjaW5nIHRoZSBtb2R1bGVcbiAqIGRvY3MuXG4gKi9cbmltcG9ydCB7IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmltcG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmV4cG9ydCB7IGRpcmVjdGl2ZSwgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2xpYi9kaXJlY3RpdmUuanMnO1xuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogcmVtb3ZlIGxpbmUgd2hlbiB3ZSBnZXQgTm9kZVBhcnQgbW92aW5nIG1ldGhvZHNcbmV4cG9ydCB7IHJlbW92ZU5vZGVzLCByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9saWIvZG9tLmpzJztcbmV4cG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9saWIvcGFydC5qcyc7XG5leHBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEF0dHJpYnV0ZVBhcnQsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIGlzSXRlcmFibGUsIGlzUHJpbWl0aXZlLCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIsIFByb3BlcnR5UGFydCB9IGZyb20gJy4vbGliL3BhcnRzLmpzJztcbmV4cG9ydCB7IHBhcnRzLCByZW5kZXIgfSBmcm9tICcuL2xpYi9yZW5kZXIuanMnO1xuZXhwb3J0IHsgdGVtcGxhdGVDYWNoZXMsIHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmV4cG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBjcmVhdGVNYXJrZXIsIGlzVGVtcGxhdGVQYXJ0QWN0aXZlLCBUZW1wbGF0ZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLmpzJztcbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBpbmplY3QgdmVyc2lvbiBudW1iZXIgYXQgYnVpbGQgdGltZVxuKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gfHwgKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gPSBbXSkpLnB1c2goJzEuMS4yJyk7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBTVkdUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdzdmcnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGl0LWh0bWwuanMubWFwIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIi4uL2NvbXBvbmVudFwiO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIG1hcCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVNYXBwZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudCwgVCA9IGFueT4gPSAodGhpczogQywgdmFsdWU6IHN0cmluZyB8IG51bGwpID0+IFQgfCBudWxsO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIG1hcCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZSB2YWx1ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU1hcHBlcjxDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50LCBUID0gYW55PiA9ICh0aGlzOiBDLCB2YWx1ZTogVCB8IG51bGwpID0+IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgaG9sZHMgYW4ge0BsaW5rIEF0dHJpYnV0ZU1hcHBlcn0gYW5kIGEge0BsaW5rIFByb3BlcnR5TWFwcGVyfVxuICpcbiAqIEByZW1hcmtzXG4gKiBGb3IgdGhlIG1vc3QgY29tbW9uIHR5cGVzLCBhIGNvbnZlcnRlciBleGlzdHMgd2hpY2ggY2FuIGJlIHJlZmVyZW5jZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIEBwcm9wZXJ0eSh7XG4gKiAgICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAqICAgICAgfSlcbiAqICAgICAgbXlQcm9wZXJ0eSA9IHRydWU7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVDb252ZXJ0ZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudCwgVCA9IGFueT4ge1xuICAgIHRvQXR0cmlidXRlOiBQcm9wZXJ0eU1hcHBlcjxDLCBUPjtcbiAgICBmcm9tQXR0cmlidXRlOiBBdHRyaWJ1dGVNYXBwZXI8QywgVD47XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgYXR0cmlidXRlIGNvbnZlcnRlclxuICpcbiAqIEByZW1hcmtzXG4gKiBUaGlzIGNvbnZlcnRlciBpcyB1c2VkIGFzIHRoZSBkZWZhdWx0IGNvbnZlcnRlciBmb3IgZGVjb3JhdGVkIHByb3BlcnRpZXMgdW5sZXNzIGEgZGlmZmVyZW50IG9uZVxuICogaXMgc3BlY2lmaWVkLiBUaGUgY29udmVydGVyIHRyaWVzIHRvIGluZmVyIHRoZSBwcm9wZXJ0eSB0eXBlIHdoZW4gY29udmVydGluZyB0byBhdHRyaWJ1dGVzIGFuZFxuICogdXNlcyBgSlNPTi5wYXJzZSgpYCB3aGVuIGNvbnZlcnRpbmcgc3RyaW5ncyBmcm9tIGF0dHJpYnV0ZXMuIElmIGBKU09OLnBhcnNlKClgIHRocm93cyBhbiBlcnJvcixcbiAqIHRoZSBjb252ZXJ0ZXIgd2lsbCB1c2UgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBhcyBhIHN0cmluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQ6IEF0dHJpYnV0ZUNvbnZlcnRlciA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHtcbiAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHN1Y2Nlc3NmdWxseSBwYXJzZSBgYm9vbGVhbmAsIGBudW1iZXJgIGFuZCBgSlNPTi5zdHJpbmdpZnlgJ2QgdmFsdWVzXG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgaXQgdGhyb3dzLCBpdCBtZWFucyB3ZSdyZSBwcm9iYWJseSBkZWFsaW5nIHdpdGggYSByZWd1bGFyIHN0cmluZ1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICB9LFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiBudWxsO1xuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgZGVmYXVsdDogLy8gbnVtYmVyLCBiaWdpbnQsIHN5bWJvbCwgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBib29sZWFuIGF0dHJpYnV0ZXMsIGxpa2UgYGRpc2FibGVkYCwgd2hpY2ggYXJlIGNvbnNpZGVyZWQgdHJ1ZSBpZiB0aGV5IGFyZSBzZXQgd2l0aFxuICogYW55IHZhbHVlIGF0IGFsbC4gSW4gb3JkZXIgdG8gc2V0IHRoZSBhdHRyaWJ1dGUgdG8gZmFsc2UsIHRoZSBhdHRyaWJ1dGUgaGFzIHRvIGJlIHJlbW92ZWQgYnlcbiAqIHNldHRpbmcgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBgbnVsbGAuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSAhPT0gbnVsbCksXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYm9vbGVhbiB8IG51bGwpID0+IHZhbHVlID8gJycgOiBudWxsXG59XG5cbi8qKlxuICogSGFuZGxlcyBib29sZWFuIEFSSUEgYXR0cmlidXRlcywgbGlrZSBgYXJpYS1jaGVja2VkYCBvciBgYXJpYS1zZWxlY3RlZGAsIHdoaWNoIGhhdmUgdG8gYmVcbiAqIHNldCBleHBsaWNpdGx5IHRvIGB0cnVlYCBvciBgZmFsc2VgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW46IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIGJvb2xlYW4+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZSkgPT4gdmFsdWUgPT09ICd0cnVlJyxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZSkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBzdHJpbmc+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiB2YWx1ZSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWRcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2YWx1ZVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBudW1iZXI+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiBOdW1iZXIodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBudW1iZXIgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck9iamVjdDogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgb2JqZWN0PiA9IHtcbiAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogSlNPTi5wYXJzZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IG9iamVjdCB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJBcnJheTogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgYW55W10+ID0ge1xuICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBKU09OLnBhcnNlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYW55W10gfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckRhdGU6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIERhdGU+ID0ge1xuICAgIC8vIGBuZXcgRGF0ZSgpYCB3aWxsIHJldHVybiBhbiBgSW52YWxpZCBEYXRlYCBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IG5ldyBEYXRlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogRGF0ZSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlbGVjdG9yIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNlbGVjdG9yIHdpbGwgYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHdpdGggdGhlIGJyb3dzZXInc1xuICAgICAqIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQSS4gSWYgbm8gc2VsZWN0b3IgaXMgc3BlY2lmaWVkLCB0aGUgY29tcG9uZW50IGNsYXNzXG4gICAgICogbmVlZHMgdG8gcHJvdmlkZSBvbmUgaW4gaXRzIHN0YXRpYyB7QGxpbmsgQ29tcG9uZW50LnNlbGVjdG9yfSBwcm9wZXJ0eS5cbiAgICAgKiBBIHNlbGVjdG9yIGRlZmluZWQgaW4gdGhlIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn0gd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGVcbiAgICAgKiBzdGF0aWMgY2xhc3MgcHJvcGVydHkuXG4gICAgICovXG4gICAgc2VsZWN0b3I6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTSB0byByZW5kZXIgdGhlIGNvbXBvbmVudHMgdGVtcGxhdGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNoYWRvdyBET00gY2FuIGJlIGRpc2FibGVkIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYCwgaW4gd2hpY2ggY2FzZSB0aGVcbiAgICAgKiBjb21wb25lbnQncyB0ZW1wbGF0ZSB3aWxsIGJlIHJlbmRlcmVkIGFzIGNoaWxkIG5vZGVzIG9mIHRoZSBjb21wb25lbnQuIFRoaXMgY2FuIGJlXG4gICAgICogdXNlZnVsIGlmIGFuIGlzb2xhdGVkIERPTSBhbmQgc2NvcGVkIENTUyBpcyBub3QgZGVzaXJlZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHNoYWRvdzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBBdXRvbWF0aWNhbGx5IHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgYnJvd3NlcidzIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQST9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW4gY2FzZXMgd2hlcmUgeW91IHdhbnQgdG8gZW1wbG95IGEgbW9kdWxlIHN5c3RlbSB3aGljaCByZWdpc3RlcnMgY29tcG9uZW50cyBvbiBhXG4gICAgICogY29uZGl0aW9uYWwgYmFzaXMsIHlvdSBjYW4gZGlzYWJsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYC5cbiAgICAgKiBZb3VyIG1vZHVsZSBvciBib290c3RyYXAgc3lzdGVtIHdpbGwgaGF2ZSB0byB0YWtlIGNhcmUgb2YgZGVmaW5pbmcgdGhlIGNvbXBvbmVudCBsYXRlci5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIGRlZmluZTogYm9vbGVhbjtcbiAgICAvLyBUT0RPOiB0ZXN0IG1lZGlhIHF1ZXJpZXNcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEFuIGFycmF5IG9mIENTUyBydWxlc2V0cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL1N5bnRheCNDU1NfcnVsZXNldHMpLlxuICAgICAqIFN0eWxlcyBkZWZpbmVkIHVzaW5nIHRoZSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCBzdHlsZXMgZGVmaW5lZCBpbiB0aGUgY29tcG9uZW50J3NcbiAgICAgKiBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlci5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHN0eWxlczogW1xuICAgICAqICAgICAgICAgICdoMSwgaDIgeyBmb250LXNpemU6IDE2cHQ7IH0nLFxuICAgICAqICAgICAgICAgICdAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA5MDBweCkgeyBhcnRpY2xlIHsgcGFkZGluZzogMXJlbSAzcmVtOyB9IH0nXG4gICAgICogICAgICBdXG4gICAgICogfSlcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB1bmRlZmluZWRgXG4gICAgICovXG4gICAgc3R5bGVzPzogc3RyaW5nW107XG4gICAgLy8gVE9ETzogdXBkYXRlIGRvY3VtZW50YXRpb25cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEge0BsaW5rICNsaXQtaHRtbC5UZW1wbGF0ZVJlc3VsdH0uIFRoZSBmdW5jdGlvbidzIGBlbGVtZW50YFxuICAgICAqIHBhcmFtZXRlciB3aWxsIGJlIHRoZSBjdXJyZW50IGNvbXBvbmVudCBpbnN0YW5jZS4gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgYnkgdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFRoZSBtZXRob2QgbXVzdCByZXR1cm4gYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHdoaWNoIGlzIGNyZWF0ZWQgdXNpbmcgbGl0LWh0bWwnc1xuICAgICAqIHtAbGluayBsaXQtaHRtbCNodG1sIHwgYGh0bWxgfSBvciB7QGxpbmsgbGl0LWh0bWwjc3ZnIHwgYHN2Z2B9IHRlbXBsYXRlIG1ldGhvZHMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGNvbXBvbmVudCBpbnN0YW5jZSByZXF1ZXN0aW5nIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHRlbXBsYXRlPzogKGVsZW1lbnQ6IFR5cGUsIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT046IENvbXBvbmVudERlY2xhcmF0aW9uID0ge1xuICAgIHNlbGVjdG9yOiAnJyxcbiAgICBzaGFkb3c6IHRydWUsXG4gICAgZGVmaW5lOiB0cnVlLFxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnREZWNsYXJhdGlvbiwgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT04gfSBmcm9tICcuL2NvbXBvbmVudC1kZWNsYXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlIH0gZnJvbSAnLi9wcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gY2xhc3NcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudDxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogUGFydGlhbDxDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB7IC4uLkRFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICByZXR1cm4gKHRhcmdldDogdHlwZW9mIENvbXBvbmVudCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0IGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3RydWN0b3Iuc2VsZWN0b3IgPSBkZWNsYXJhdGlvbi5zZWxlY3RvciB8fCB0YXJnZXQuc2VsZWN0b3I7XG4gICAgICAgIGNvbnN0cnVjdG9yLnNoYWRvdyA9IGRlY2xhcmF0aW9uLnNoYWRvdztcbiAgICAgICAgY29uc3RydWN0b3IudGVtcGxhdGUgPSBkZWNsYXJhdGlvbi50ZW1wbGF0ZSB8fCB0YXJnZXQudGVtcGxhdGU7XG5cbiAgICAgICAgLy8gdXNlIGtleW9mIHNpZ25hdHVyZXMgdG8gY2F0Y2ggcmVmYWN0b3JpbmcgZXJyb3JzXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlc0tleToga2V5b2YgdHlwZW9mIENvbXBvbmVudCA9ICdvYnNlcnZlZEF0dHJpYnV0ZXMnO1xuICAgICAgICBjb25zdCBzdHlsZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnc3R5bGVzJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvcGVydHkgZGVjb3JhdG9ycyBnZXQgY2FsbGVkIGJlZm9yZSBjbGFzcyBkZWNvcmF0b3JzLCBzbyBhdCB0aGlzIHBvaW50IGFsbCBkZWNvcmF0ZWQgcHJvcGVydGllc1xuICAgICAgICAgKiBoYXZlIHN0b3JlZCB0aGVpciBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMgaW4ge0BsaW5rIENvbXBvbmVudC5hdHRyaWJ1dGVzfS5cbiAgICAgICAgICogV2UgY2FuIG5vdyBjb21iaW5lIHRoZW0gd2l0aCB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBhbmQsXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LCBlbGltaW5hdGUgYWxsIGR1cGxpY2F0ZXMgaW4gdGhlIHByb2Nlc3MuXG4gICAgICAgICAqXG4gICAgICAgICAqIEFzIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IHdpbGwgYWxzbyBpbmNsdWRlIGRlY29yYXRvciBnZW5lcmF0ZWRcbiAgICAgICAgICogb2JzZXJ2ZWQgYXR0cmlidXRlcywgd2UgYWx3YXlzIGluaGVyaXQgYWxsIG9ic2VydmVkIGF0dHJpYnV0ZXMgZnJvbSBhIGJhc2UgY2xhc3MuIEZvciB0aGF0IHJlYXNvblxuICAgICAgICAgKiB3ZSBoYXZlIHRvIGtlZXAgdHJhY2sgb2YgYXR0cmlidXRlIG92ZXJyaWRlcyB3aGVuIGV4dGVuZGluZyBhbnkge0BsaW5rIENvbXBvbmVudH0gYmFzZSBjbGFzcy5cbiAgICAgICAgICogVGhpcyBpcyBkb25lIGluIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvci4gSGVyZSB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0byByZW1vdmUgb3ZlcnJpZGRlblxuICAgICAgICAgKiBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZWRBdHRyaWJ1dGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAvLyB3ZSB0YWtlIHRoZSBpbmhlcml0ZWQgb2JzZXJ2ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm9ic2VydmVkQXR0cmlidXRlc1xuICAgICAgICAgICAgICAgICAgICAvLyAuLi5yZW1vdmUgb3ZlcnJpZGRlbiBnZW5lcmF0ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChhdHRyaWJ1dGVzLCBhdHRyaWJ1dGUpID0+IGF0dHJpYnV0ZXMuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiAmJiBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuLmhhcyhhdHRyaWJ1dGUpID8gW10gOiBhdHRyaWJ1dGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgc3RyaW5nW11cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAvLyAuLi5hbmQgcmVjb21iaW5lIHRoZSBsaXN0IHdpdGggdGhlIG5ld2x5IGdlbmVyYXRlZCBhdHRyaWJ1dGVzICh0aGUgU2V0IHByZXZlbnRzIGR1cGxpY2F0ZXMpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoWy4uLnRhcmdldC5hdHRyaWJ1dGVzLmtleXMoKV0pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gZGVsZXRlIHRoZSBvdmVycmlkZGVuIFNldCBmcm9tIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgY29uc3RydWN0b3Iub3ZlcnJpZGRlbjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IHN0eWxlcyBhdXRvbWF0aWNhbGx5LCB1bmxlc3MgZXhwbGljaXRseSByZXF1ZXN0ZWQsIHNvIHdlIGNoZWNrIGlmIHRoZVxuICAgICAgICAgKiBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHN0YXRpYyBzdHlsZXMgcHJvcGVydHkgKHdoaWNoIG1heSB1c2Ugc3VwZXIuc3R5bGVzIHRvIGV4cGxpY2l0bHkgaW5oZXJpdClcbiAgICAgICAgICogYW5kIGlmIGl0IGRvZXNuJ3QsIHdlIGlnbm9yZSB0aGUgcGFyZW50IGNsYXNzJ3Mgc3R5bGVzIChieSBub3QgaW52b2tpbmcgdGhlIGdldHRlcikuXG4gICAgICAgICAqIFdlIHRoZW4gbWVyZ2UgdGhlIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcyAoaWYgZXhpc3RpbmcpIGludG8gdGhlIHN0eWxlcyBhbmQgcmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICAgICAgICogYnkgdXNpbmcgYSBTZXQuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIChjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShzdHlsZXNLZXkpXG4gICAgICAgICAgICAgICAgICAgID8gY29uc3RydWN0b3Iuc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgIDogW11cbiAgICAgICAgICAgICAgICApLmNvbmNhdChkZWNsYXJhdGlvbi5zdHlsZXMgfHwgW10pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmFsbHkgd2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBnZXR0ZXIgd2l0aCBhIG5ldyBvbmUsIHdoaWNoIHJldHVybnNcbiAgICAgICAgICogdGhlIHVuaXF1ZSBzZXQgb2YgdXNlciBkZWZpbmVkIGFuZCBkZWNvcmF0b3IgZ2VuZXJhdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVkQXR0cmlidXRlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50LnN0eWxlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHN0YXRpY2FsbHkgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGRlZmluZWQgc3R5bGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgc3R5bGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0eWxlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmRlZmluZSkge1xuXG4gICAgICAgICAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKGNvbnN0cnVjdG9yLnNlbGVjdG9yLCBjb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBMaXN0ZW5lckRlY2xhcmF0aW9uIH0gZnJvbSAnLi9saXN0ZW5lci1kZWNsYXJhdGlvbi5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gbWV0aG9kIGFzIGFuIGV2ZW50IGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgVGhlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5lcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogTGlzdGVuZXJEZWNsYXJhdGlvbjxUeXBlPikge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmV2ZW50ID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5kZWxldGUocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5zZXQocHJvcGVydHlLZXksIHsgLi4ub3B0aW9ucyB9IGFzIExpc3RlbmVyRGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBsaXN0ZW5lciBkZWNvcmF0b3Igc3RvcmVzIGxpc3RlbmVyIGRlY2xhcmF0aW9ucyBpbiB0aGUgY29uc3RydWN0b3IsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoZVxuICogc3RhdGljIGxpc3RlbmVycyBmaWVsZCBpcyBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlIGFkZCBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAqIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkLiBXZSBhbHNvIG1ha2Ugc3VyZSB0byBpbml0aWFsaXplIHRoZSBsaXN0ZW5lciBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZlxuICogdGhlIGJhc2UgY2xhc3MncyBtYXAgdG8gcHJvcGVybHkgaW5oZXJpdCBhbGwgbGlzdGVuZXIgZGVjbGFyYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IHR5cGVvZiBDb21wb25lbnQpIHtcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ2xpc3RlbmVycycpKSBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLmxpc3RlbmVycyk7XG59XG4iLCJjb25zdCBGSVJTVCA9IC9eW15dLztcbmNvbnN0IFNQQUNFUyA9IC9cXHMrKFtcXFNdKS9nO1xuY29uc3QgQ0FNRUxTID0gL1thLXpdKFtBLVpdKS9nO1xuY29uc3QgS0VCQUJTID0gLy0oW2Etel0pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnJlcGxhY2UoRklSU1QsIHN0cmluZ1swXS50b1VwcGVyQ2FzZSgpKSA6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9Mb3dlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW1lbENhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBLRUJBQlMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBLRUJBQlMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmNhcGl0YWxpemUoc3RyaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlYmFiQ2FzZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IG1hdGNoZXM7XG5cbiAgICBpZiAoc3RyaW5nKSB7XG5cbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnRyaW0oKTtcblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBTUEFDRVMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCAnLScgKyBtYXRjaGVzWzFdKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBDQU1FTFMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzBdWzBdICsgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIENBTUVMUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy50b0xvd2VyQ2FzZSgpIDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlciwgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCB9IGZyb20gJy4vYXR0cmlidXRlLWNvbnZlcnRlci5qcyc7XG5pbXBvcnQgeyBrZWJhYkNhc2UgfSBmcm9tICcuL3V0aWxzL3N0cmluZy11dGlscy5qcyc7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgZGlzcGF0Y2ggYSBjdXN0b20gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Tm90aWZpZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJldHVybiBgdHJ1ZWAgaWYgdGhlIGBvbGRWYWx1ZWAgYW5kIHRoZSBgbmV3VmFsdWVgIG9mIGEgcHJvcGVydHkgYXJlIGRpZmZlcmVudCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gcmVmbGVjdG9yIEEgcmVmbGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0cmlidXRlUmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBBdHRyaWJ1dGVSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5UmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBQcm9wZXJ0eVJlZmxlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIHJlZmxlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eU5vdGlmaWVyfVxuICpcbiAqIEBwYXJhbSBub3RpZmllciBBIG5vdGlmaWVyIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlOb3RpZmllciAobm90aWZpZXI6IGFueSk6IG5vdGlmaWVyIGlzIFByb3BlcnR5Tm90aWZpZXIge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBub3RpZmllciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICpcbiAqIEBwYXJhbSBkZXRlY3RvciBBIGRldGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciAoZGV0ZWN0b3I6IGFueSk6IGRldGVjdG9yIGlzIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiBkZXRlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUtleX1cbiAqXG4gKiBAcGFyYW0ga2V5IEEgcHJvcGVydHkga2V5IHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlLZXkgKGtleTogYW55KToga2V5IGlzIFByb3BlcnR5S2V5IHtcblxuICAgIHJldHVybiB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJyB8fCB0eXBlb2Yga2V5ID09PSAnc3ltYm9sJztcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgc3RyaW5nIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGUgcmVtb3ZpbmcgaW52YWxpZCBhdHRyaWJ1dGUgY2hhcmFjdGVyc1xuICpcbiAqIEBwYXJhbSB2YWx1ZSBBIHN0cmluZyB0byBlbmNvZGUgZm9yIHVzZSBhcyBodG1sIGF0dHJpYnV0ZVxuICogQHJldHVybnMgICAgIEFuIGVuY29kZWQgc3RyaW5nIHVzYWJsZSBhcyBodG1sIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQXR0cmlidXRlICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBrZWJhYkNhc2UodmFsdWUucmVwbGFjZSgvXFxXKy9nLCAnLScpLnJlcGxhY2UoL1xcLSQvLCAnJykpO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBhdHRyaWJ1dGUgbmFtZSBmcm9tIGEgcHJvcGVydHkga2V5XG4gKlxuICogQHJlbWFya3NcbiAqIE51bWVyaWMgcHJvcGVydHkgaW5kZXhlcyBvciBzeW1ib2xzIGNhbiBjb250YWluIGludmFsaWQgY2hhcmFjdGVycyBmb3IgYXR0cmlidXRlIG5hbWVzLiBUaGlzIG1ldGhvZFxuICogc2FuaXRpemVzIHRob3NlIGNoYXJhY3RlcnMgYW5kIHJlcGxhY2VzIHNlcXVlbmNlcyBvZiBpbnZhbGlkIGNoYXJhY3RlcnMgd2l0aCBhIGRhc2guXG4gKiBBdHRyaWJ1dGUgbmFtZXMgYXJlIG5vdCBhbGxvd2VkIHRvIHN0YXJ0IHdpdGggbnVtYmVycyBlaXRoZXIgYW5kIGFyZSBwcmVmaXhlZCB3aXRoICdhdHRyLScuXG4gKlxuICogTi5CLjogV2hlbiB1c2luZyBjdXN0b20gc3ltYm9scyBhcyBwcm9wZXJ0eSBrZXlzLCB1c2UgdW5pcXVlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIHN5bWJvbHMgdG8gYXZvaWRcbiAqIGNsYXNoaW5nIGF0dHJpYnV0ZSBuYW1lcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBhID0gU3ltYm9sKCk7XG4gKiBjb25zdCBiID0gU3ltYm9sKCk7XG4gKlxuICogYSAhPT0gYjsgLy8gdHJ1ZVxuICpcbiAqIGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYSkgIT09IGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYik7IC8vIGZhbHNlIC0tPiAnYXR0ci1zeW1ib2wnID09PSAnYXR0ci1zeW1ib2wnXG4gKlxuICogY29uc3QgYyA9IFN5bWJvbCgnYycpO1xuICogY29uc3QgZCA9IFN5bWJvbCgnZCcpO1xuICpcbiAqIGMgIT09IGQ7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGMpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGQpOyAvLyB0cnVlIC0tPiAnYXR0ci1zeW1ib2wtYycgPT09ICdhdHRyLXN5bWJvbC1kJ1xuICogYGBgXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlTmFtZSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogc3RyaW5nIHtcblxuICAgIGlmICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgcmV0dXJuIGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBhdHRyaWJ1dGUgbmFtZXMsIGlmIHN5bWJvbHMgZG9uJ3QgaGF2ZSB1bmlxdWUgZGVzY3JpcHRpb25cbiAgICAgICAgcmV0dXJuIGBhdHRyLSR7IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKSB9YDtcbiAgICB9XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGV2ZW50IG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBFdmVudCBuYW1lcyBkb24ndCBoYXZlIHRoZSBzYW1lIHJlc3RyaWN0aW9ucyBhcyBhdHRyaWJ1dGUgbmFtZXMgd2hlbiBpdCBjb21lcyB0byBpbnZhbGlkXG4gKiBjaGFyYWN0ZXJzLiBIb3dldmVyLCBmb3IgY29uc2lzdGVuY3kncyBzYWtlLCB3ZSBhcHBseSB0aGUgc2FtZSBydWxlcyBmb3IgZXZlbnQgbmFtZXMgYXNcbiAqIGZvciBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHByZWZpeCAgICAgICAgQW4gb3B0aW9uYWwgcHJlZml4LCBlLmcuOiAnb24nXG4gKiBAcGFyYW0gc3VmZml4ICAgICAgICBBbiBvcHRpb25hbCBzdWZmaXgsIGUuZy46ICdjaGFuZ2VkJ1xuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBldmVudCBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudE5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgcHJlZml4Pzogc3RyaW5nLCBzdWZmaXg/OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IHByb3BlcnR5U3RyaW5nID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0ga2ViYWJDYXNlKHByb3BlcnR5S2V5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBjcmVhdGUgbXVsdGlwbGUgaWRlbnRpY2FsIGV2ZW50IG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0gZW5jb2RlQXR0cmlidXRlKFN0cmluZyhwcm9wZXJ0eUtleSkpO1xuICAgIH1cblxuICAgIHJldHVybiBgJHsgcHJlZml4ID8gYCR7IGtlYmFiQ2FzZShwcmVmaXgpIH0tYCA6ICcnIH0keyBwcm9wZXJ0eVN0cmluZyB9JHsgc3VmZml4ID8gYC0keyBrZWJhYkNhc2Uoc3VmZml4KSB9YCA6ICcnIH1gO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBEb2VzIHByb3BlcnR5IGhhdmUgYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IE5vIGF0dHJpYnV0ZSB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHByb3BlcnR5XG4gICAgICogKiBgdHJ1ZWA6IFRoZSBhdHRyaWJ1dGUgbmFtZSB3aWxsIGJlIGluZmVycmVkIGJ5IGNhbWVsLWNhc2luZyB0aGUgcHJvcGVydHkgbmFtZVxuICAgICAqICogYHN0cmluZ2A6IFVzZSB0aGUgcHJvdmlkZWQgc3RyaW5nIGFzIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBuYW1lXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGU6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b21pemUgdGhlIGNvbnZlcnNpb24gb2YgdmFsdWVzIGJldHdlZW4gcHJvcGVydHkgYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENvbnZlcnRlcnMgYXJlIG9ubHkgdXNlZCB3aGVuIHtAbGluayByZWZsZWN0UHJvcGVydHl9IGFuZC9vciB7QGxpbmsgcmVmbGVjdEF0dHJpYnV0ZX0gYXJlIHNldCB0byB0cnVlLlxuICAgICAqIElmIGN1c3RvbSByZWZsZWN0b3JzIGFyZSB1c2VkLCB0aGV5IGhhdmUgdG8gdGFrZSBjYXJlIG9yIGNvbnZlcnRpbmcgdGhlIHByb3BlcnR5L2F0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiB7QGxpbmsgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdH1cbiAgICAgKi9cbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUncyB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBhdHRyaWJ1dGUgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBhdHRyaWJ1dGUgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIHByb3BlcnR5IHVzaW5nIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjb21wb25lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBhdHRyaWJ1dGUgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0QXR0cmlidXRlOiBib29sZWFuIHwga2V5b2YgVHlwZSB8IEF0dHJpYnV0ZVJlZmxlY3RvcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgcHJvcGVydHkgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgcHJvcGVydHkgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBwcm9wZXJ0eSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgYXV0b21hdGljYWxseSB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgdXNpbmcgdGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgcHJvcGVydHkgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0UHJvcGVydHk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgYSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2UgcmFpc2UgYSBjdXN0b20gZXZlbnQ/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IGNyZWF0ZSBhIGN1c3RvbSBldmVudCBmb3IgdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBDcmVhdGUgY3VzdG9tIGV2ZW50cyBmb3IgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBVc2UgdGhlIG1ldGhvZCB3aXRoIHRoaXMgcHJvcGVydHkga2V5IG9uIHRoZSBjb21wb25lbnQgdG8gY3JlYXRlIGN1c3RvbSBldmVudHNcbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzIChgdGhpc2AgY29udGV4dCB3aWxsIGJlIHRoZSBjb21wb25lbnQgaW5zdGFuY2UpXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBub3RpZnk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlOb3RpZmllcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSBob3cgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5IHNob3VsZCBiZSBtb25pdG9yZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQnkgZGVmYXVsdCBhIGRlY29yYXRlZCBwcm9wZXJ0eSB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzICh0aHJvdWdoIGEgY3VzdG9tIHNldHRlciBmb3IgdGhlIHByb3BlcnR5KS5cbiAgICAgKiBBbnkgYHNldGAtb3BlcmF0aW9uIG9mIHRoaXMgcHJvcGVydHkgd2lsbCB0aGVyZWZvcmUgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhbmQgaW5pdGlhdGVcbiAgICAgKiBhIHJlbmRlciBhcyB3ZWxsIGFzIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IG9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5ICh0aGlzIHdpbGwgYnlwYXNzIHJlbmRlciwgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uKVxuICAgICAqICogYHRydWVgOiBPYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSB1c2luZyB0aGUge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfVxuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSBwcm92aWRlZCBtZXRob2QgdG8gY2hlY2sgaWYgcHJvcGVydHkgdmFsdWUgaGFzIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYCAodXNlcyB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9IGludGVybmFsbHkpXG4gICAgICovXG4gICAgb2JzZXJ2ZTogYm9vbGVhbiB8IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3I7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gKlxuICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGNoYW5nZWRcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SOiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICAvLyBpbiBjYXNlIGBvbGRWYWx1ZWAgYW5kIGBuZXdWYWx1ZWAgYXJlIGBOYU5gLCBgKE5hTiAhPT0gTmFOKWAgcmV0dXJucyBgdHJ1ZWAsXG4gICAgLy8gYnV0IGAoTmFOID09PSBOYU4gfHwgTmFOID09PSBOYU4pYCByZXR1cm5zIGBmYWxzZWBcbiAgICByZXR1cm4gb2xkVmFsdWUgIT09IG5ld1ZhbHVlICYmIChvbGRWYWx1ZSA9PT0gb2xkVmFsdWUgfHwgbmV3VmFsdWUgPT09IG5ld1ZhbHVlKTtcbn07XG5cbi8vIFRPRE86IG1heWJlIHByb3ZpZGUgZmxhdCBhcnJheS9vYmplY3QgY2hhbmdlIGRldGVjdG9yPyBkYXRlIGNoYW5nZSBkZXRlY3Rvcj9cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT046IFByb3BlcnR5RGVjbGFyYXRpb24gPSB7XG4gICAgYXR0cmlidXRlOiB0cnVlLFxuICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCxcbiAgICByZWZsZWN0QXR0cmlidXRlOiB0cnVlLFxuICAgIHJlZmxlY3RQcm9wZXJ0eTogdHJ1ZSxcbiAgICBub3RpZnk6IHRydWUsXG4gICAgb2JzZXJ2ZTogREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1IsXG59O1xuIiwiLyoqXG4gKiBHZXQgdGhlIHtAbGluayBQcm9wZXJ0eURlc2NyaXB0b3J9IG9mIGEgcHJvcGVydHkgZnJvbSBpdHMgcHJvdG90eXBlXG4gKiBvciBhIHBhcmVudCBwcm90b3R5cGUgLSBleGNsdWRpbmcge0BsaW5rIE9iamVjdC5wcm90b3R5cGV9IGl0c2VsZi5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0ICAgICAgICBUaGUgcHJvdG90eXBlIHRvIGdldCB0aGUgZGVzY3JpcHRvciBmcm9tXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IGZvciB3aGljaCB0byBnZXQgdGhlIGRlc2NyaXB0b3JcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQge1xuXG4gICAgaWYgKHByb3BlcnR5S2V5IGluIHRhcmdldCkge1xuXG4gICAgICAgIHdoaWxlICh0YXJnZXQgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcblxuICAgICAgICAgICAgaWYgKHRhcmdldC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eUtleSkpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXJnZXQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgY3JlYXRlQXR0cmlidXRlTmFtZSwgREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTiwgUHJvcGVydHlEZWNsYXJhdGlvbiB9IGZyb20gJy4vcHJvcGVydHktZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yIH0gZnJvbSAnLi91dGlscy9nZXQtcHJvcGVydHktZGVzY3JpcHRvci5qcyc7XG5cbi8qKlxuICogQSB0eXBlIGV4dGVuc2lvbiB0byBhZGQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRvIGEge0BsaW5rIENvbXBvbmVudH0gY29uc3RydWN0b3IgZHVyaW5nIGRlY29yYXRpb25cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSB0eXBlb2YgQ29tcG9uZW50ICYgeyBvdmVycmlkZGVuPzogU2V0PHN0cmluZz4gfTtcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBwcm9wZXJ0eVxuICpcbiAqIEByZW1hcmtzXG4gKiBNYW55IG9mIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gb3B0aW9ucyBzdXBwb3J0IGN1c3RvbSBmdW5jdGlvbnMsIHdoaWNoIHdpbGwgYmUgaW52b2tlZFxuICogd2l0aCB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFzIGB0aGlzYC1jb250ZXh0IGR1cmluZyBleGVjdXRpb24uIEluIG9yZGVyIHRvIHN1cHBvcnQgY29ycmVjdFxuICogdHlwaW5nIGluIHRoZXNlIGZ1bmN0aW9ucywgdGhlIGBAcHJvcGVydHlgIGRlY29yYXRvciBzdXBwb3J0cyBnZW5lcmljIHR5cGVzLiBIZXJlIGlzIGFuIGV4YW1wbGVcbiAqIG9mIGhvdyB5b3UgY2FuIHVzZSB0aGlzIHdpdGggYSBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICpcbiAqICAgICAgbXlIaWRkZW5Qcm9wZXJ0eSA9IHRydWU7XG4gKlxuICogICAgICAvLyB1c2UgYSBnZW5lcmljIHRvIHN1cHBvcnQgcHJvcGVyIGluc3RhbmNlIHR5cGluZyBpbiB0aGUgcHJvcGVydHkgcmVmbGVjdG9yXG4gKiAgICAgIEBwcm9wZXJ0eTxNeUVsZW1lbnQ+KHtcbiAqICAgICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogKHByb3BlcnR5S2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAqICAgICAgICAgICAgICAvLyB0aGUgZ2VuZXJpYyB0eXBlIGFsbG93cyBmb3IgY29ycmVjdCB0eXBpbmcgb2YgdGhpc1xuICogICAgICAgICAgICAgIGlmICh0aGlzLm15SGlkZGVuUHJvcGVydHkgJiYgbmV3VmFsdWUpIHtcbiAqICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ215LXByb3BlcnR5JywgJycpO1xuICogICAgICAgICAgICAgIH0gZWxzZSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdteS1wcm9wZXJ0eScpO1xuICogICAgICAgICAgICAgIH1cbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgbXlQcm9wZXJ0eSA9IGZhbHNlO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvcGVydHk8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8UHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICAgICAgdGFyZ2V0OiBPYmplY3QsXG4gICAgICAgIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgICAgcHJvcGVydHlEZXNjcmlwdG9yPzogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICk6IGFueSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gZGVmaW5pbmcgY2xhc3NlcyBpbiBUeXBlU2NyaXB0LCBjbGFzcyBmaWVsZHMgYWN0dWFsbHkgZG9uJ3QgZXhpc3Qgb24gdGhlIGNsYXNzJ3MgcHJvdG90eXBlLCBidXRcbiAgICAgICAgICogcmF0aGVyLCB0aGV5IGFyZSBpbnN0YW50aWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCBleGlzdCBvbmx5IG9uIHRoZSBpbnN0YW5jZS4gQWNjZXNzb3IgcHJvcGVydGllc1xuICAgICAgICAgKiBhcmUgYW4gZXhjZXB0aW9uIGhvd2V2ZXIgYW5kIGV4aXN0IG9uIHRoZSBwcm90b3R5cGUuIEZ1cnRoZXJtb3JlLCBhY2Nlc3NvcnMgYXJlIGluaGVyaXRlZCBhbmQgd2lsbFxuICAgICAgICAgKiBiZSBpbnZva2VkIHdoZW4gc2V0dGluZyAob3IgZ2V0dGluZykgYSBwcm9wZXJ0eSBvbiBhbiBpbnN0YW5jZSBvZiBhIGNoaWxkIGNsYXNzLCBldmVuIGlmIHRoYXQgY2xhc3NcbiAgICAgICAgICogZGVmaW5lcyB0aGUgcHJvcGVydHkgZmllbGQgb24gaXRzIG93bi4gT25seSBpZiB0aGUgY2hpbGQgY2xhc3MgZGVmaW5lcyBuZXcgYWNjZXNzb3JzIHdpbGwgdGhlIHBhcmVudFxuICAgICAgICAgKiBjbGFzcydzIGFjY2Vzc29ycyBub3QgYmUgaW5oZXJpdGVkLlxuICAgICAgICAgKiBUbyBrZWVwIHRoaXMgYmVoYXZpb3IgaW50YWN0LCB3ZSBuZWVkIHRvIGVuc3VyZSwgdGhhdCB3aGVuIHdlIGNyZWF0ZSBhY2Nlc3NvcnMgZm9yIHByb3BlcnRpZXMsIHdoaWNoXG4gICAgICAgICAqIGFyZSBub3QgZGVjbGFyZWQgYXMgYWNjZXNzb3JzLCB3ZSBpbnZva2UgdGhlIHBhcmVudCBjbGFzcydzIGFjY2Vzc29yIGFzIGV4cGVjdGVkLlxuICAgICAgICAgKiBUaGUge0BsaW5rIGdldFByb3BlcnR5RGVzY3JpcHRvcn0gZnVuY3Rpb24gYWxsb3dzIHVzIHRvIGxvb2sgZm9yIGFjY2Vzc29ycyBvbiB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gICAgICAgICAqIHRoZSBjbGFzcyB3ZSBhcmUgZGVjb3JhdGluZy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBwcm9wZXJ0eURlc2NyaXB0b3IgfHwgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICBjb25zdCBoaWRkZW5LZXkgPSAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykgPyBgX18keyBwcm9wZXJ0eUtleSB9YCA6IFN5bWJvbCgpO1xuXG4gICAgICAgIC8vIGlmIHdlIGZvdW5kIGFuIGFjY2Vzc29yIGRlc2NyaXB0b3IgKGZyb20gZWl0aGVyIHRoaXMgY2xhc3Mgb3IgYSBwYXJlbnQpIHdlIHVzZSBpdCwgb3RoZXJ3aXNlIHdlIGNyZWF0ZVxuICAgICAgICAvLyBkZWZhdWx0IGFjY2Vzc29ycyB0byBzdG9yZSB0aGUgYWN0dWFsIHByb3BlcnR5IHZhbHVlIGluIGEgaGlkZGVuIGZpZWxkIGFuZCByZXRyaWV2ZSBpdCBmcm9tIHRoZXJlXG4gICAgICAgIGNvbnN0IGdldHRlciA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5nZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSkgeyByZXR1cm4gdGhpc1toaWRkZW5LZXldOyB9O1xuICAgICAgICBjb25zdCBzZXR0ZXIgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3Iuc2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnksIHZhbHVlOiBhbnkpIHsgdGhpc1toaWRkZW5LZXldID0gdmFsdWU7IH07XG5cbiAgICAgICAgLy8gd2UgZGVmaW5lIGEgbmV3IGFjY2Vzc29yIGRlc2NyaXB0b3Igd2hpY2ggd2lsbCB3cmFwIHRoZSBwcmV2aW91c2x5IHJldHJpZXZlZCBvciBjcmVhdGVkIGFjY2Vzc29yc1xuICAgICAgICAvLyBhbmQgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCB3aGVuZXZlciB0aGUgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgIGNvbnN0IHdyYXBwZWREZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IgJiBUaGlzVHlwZTxhbnk+ID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogYW55IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0ICh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzW3Byb3BlcnR5S2V5XTtcbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgcGFzcyBgdmFsdWVgIG9uIGFzIGBuZXdWYWx1ZWAgLSBhbiBpbmhlcml0ZWQgc2V0dGVyIG1pZ2h0IG1vZGlmeSBpdFxuICAgICAgICAgICAgICAgIC8vIGluc3RlYWQgZ2V0IHRoZSBuZXcgdmFsdWUgYnkgaW52b2tpbmcgdGhlIGdldHRlclxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIGdldHRlci5jYWxsKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb246IFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4gPSB7IC4uLkRFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIC4uLm9wdGlvbnMgfTtcblxuICAgICAgICAvLyBnZW5lcmF0ZSB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgbmFtZVxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9IGNyZWF0ZUF0dHJpYnV0ZU5hbWUocHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0IHRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICAgICAgICBpZiAoZGVjbGFyYXRpb24ub2JzZXJ2ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5vYnNlcnZlID0gREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTi5vYnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICAvLyBjaGVjayBpZiB3ZSBpbmhlcml0ZWQgYW4gb2JzZXJ2ZWQgYXR0cmlidXRlIGZvciB0aGUgcHJvcGVydHkgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLmhhcyhwcm9wZXJ0eUtleSkgPyBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSkhLmF0dHJpYnV0ZSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBpZiBhdHRyaWJ1dGUgaXMgdHJ1dGh5IGl0J3MgYSBzdHJpbmcgYW5kIGl0IHdpbGwgZXhpc3QgaW4gdGhlIGF0dHJpYnV0ZXMgbWFwXG4gICAgICAgIGlmIChhdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmhlcml0ZWQgYXR0cmlidXRlIGFzIGl0J3Mgb3ZlcnJpZGRlblxuICAgICAgICAgICAgY29uc3RydWN0b3IuYXR0cmlidXRlcy5kZWxldGUoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBtYXJrIGF0dHJpYnV0ZSBhcyBvdmVycmlkZGVuIGZvciB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3JcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4hLmFkZChhdHRyaWJ1dGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IuYXR0cmlidXRlcy5zZXQoZGVjbGFyYXRpb24uYXR0cmlidXRlLCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24gKmFmdGVyKiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzLCBzbyB3ZSBjYW4gc3RpbGwgYWNjZXNzIHRoZVxuICAgICAgICAvLyBpbmhlcml0ZWQgcHJvcGVydHkgZGVjbGFyYXRpb24gd2hlbiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBkZWNsYXJhdGlvbiBhcyBQcm9wZXJ0eURlY2xhcmF0aW9uKTtcblxuICAgICAgICBpZiAoIXByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgICAgICAvLyBpZiBubyBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBkZWNvcmF0b3Igd2hpY2ggbXVzdCByZXR1cm4gdm9pZCBhbmQgd2UgY2FuIGRlZmluZSB0aGUgd3JhcHBlZCBkZXNjcmlwdG9yIGhlcmVcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCB3cmFwcGVkRGVzY3JpcHRvcik7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gaWYgYSBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhbiBhY2Nlc3NvclxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIGFuZCB3ZSBtdXN0IHJldHVybiB0aGUgd3JhcHBlZCBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlZERlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIHByb3BlcnR5IGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgcHJvcGVydHkgZGVjb3JhdG9yIHN0b3JlcyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZSBtYXBwaW5ncyBpbiB0aGUgY29uc3RydWN0b3IsXG4gKiB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aG9zZSBzdGF0aWMgZmllbGRzIGFyZSBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlXG4gKiBhZGQgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgdG8gdGhlIGJhc2UgY2xhc3MncyBzdGF0aWMgZmllbGRzLiBXZSBhbHNvIG1ha2VcbiAqIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgY29uc3RydWN0b3JzIG1hcHMgd2l0aCB0aGUgdmFsdWVzIG9mIHRoZSBiYXNlIGNsYXNzJ3MgbWFwcyB0byBwcm9wZXJseVxuICogaW5oZXJpdCBhbGwgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGVzLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZnVuY3Rpb24gcHJlcGFyZUNvbnN0cnVjdG9yIChjb25zdHJ1Y3RvcjogRGVjb3JhdGVkQ29tcG9uZW50VHlwZSkge1xuXG4gICAgLy8gdGhpcyB3aWxsIGdpdmUgdXMgYSBjb21waWxlLXRpbWUgZXJyb3IgaWYgd2UgcmVmYWN0b3Igb25lIG9mIHRoZSBzdGF0aWMgY29uc3RydWN0b3IgcHJvcGVydGllc1xuICAgIC8vIGFuZCB3ZSB3b24ndCBtaXNzIHJlbmFtaW5nIHRoZSBwcm9wZXJ0eSBrZXlzXG4gICAgY29uc3QgcHJvcGVydGllczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdwcm9wZXJ0aWVzJztcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ2F0dHJpYnV0ZXMnO1xuICAgIGNvbnN0IG92ZXJyaWRkZW46IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAnb3ZlcnJpZGRlbic7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KHByb3BlcnRpZXMpKSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZXMpKSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KG92ZXJyaWRkZW4pKSBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuID0gbmV3IFNldCgpO1xufVxuIiwiaW1wb3J0IHsgcmVuZGVyLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7XG4gICAgQXR0cmlidXRlUmVmbGVjdG9yLFxuICAgIGNyZWF0ZUV2ZW50TmFtZSxcbiAgICBpc0F0dHJpYnV0ZVJlZmxlY3RvcixcbiAgICBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IsXG4gICAgaXNQcm9wZXJ0eUtleSxcbiAgICBpc1Byb3BlcnR5Tm90aWZpZXIsXG4gICAgaXNQcm9wZXJ0eVJlZmxlY3RvcixcbiAgICBMaXN0ZW5lckRlY2xhcmF0aW9uLFxuICAgIFByb3BlcnR5RGVjbGFyYXRpb24sXG4gICAgUHJvcGVydHlOb3RpZmllcixcbiAgICBQcm9wZXJ0eVJlZmxlY3RvclxufSBmcm9tIFwiLi9kZWNvcmF0b3JzL2luZGV4LmpzXCI7XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IgPSAoYXR0cmlidXRlUmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBhdHRyaWJ1dGUgcmVmbGVjdG9yICR7IFN0cmluZyhhdHRyaWJ1dGVSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IgPSAocHJvcGVydHlSZWZsZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IHJlZmxlY3RvciAkeyBTdHJpbmcocHJvcGVydHlSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUiA9IChwcm9wZXJ0eU5vdGlmaWVyOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSBub3RpZmllciAkeyBTdHJpbmcocHJvcGVydHlOb3RpZmllcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IENIQU5HRV9ERVRFQ1RPUl9FUlJPUiA9IChjaGFuZ2VEZXRlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yICR7IFN0cmluZyhjaGFuZ2VEZXRlY3RvcikgfS5gKTtcblxuLyoqXG4gKiBFeHRlbmRzIHRoZSBzdGF0aWMge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IHRvIGluY2x1ZGUgdGhlIGJvdW5kIGxpc3RlbmVyXG4gKiBmb3IgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogQGludGVybmFsXG4gKi9cbmludGVyZmFjZSBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gZXh0ZW5kcyBMaXN0ZW5lckRlY2xhcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBib3VuZCBsaXN0ZW5lciB3aWxsIGJlIHN0b3JlZCBoZXJlLCBzbyBpdCBjYW4gYmUgcmVtb3ZlZCBpdCBsYXRlclxuICAgICAqL1xuICAgIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGV2ZW50IHRhcmdldCB3aWxsIGFsd2F5cyBiZSByZXNvbHZlZCB0byBhbiBhY3R1YWwge0BsaW5rIEV2ZW50VGFyZ2V0fVxuICAgICAqL1xuICAgIHRhcmdldDogRXZlbnRUYXJnZXQ7XG59XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2VzLCBhcyB1c2VkIGluIHtAbGluayB1cGRhdGVDYWxsYmFja31cbiAqL1xuZXhwb3J0IHR5cGUgQ2hhbmdlcyA9IE1hcDxQcm9wZXJ0eUtleSwgYW55PjtcblxuLyoqXG4gKiBBIHR5cGUgZm9yIHByb3BlcnR5IGNoYW5nZSBldmVudCBkZXRhaWxzLCBhcyB1c2VkIGJ5IHtAbGluayBQcm9wZXJ0eUNoYW5nZUV2ZW50fVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlRXZlbnREZXRhaWw8VD4ge1xuICAgIHByb3BlcnR5OiBzdHJpbmc7XG4gICAgcHJldmlvdXM6IFQ7XG4gICAgY3VycmVudDogVDtcbn1cblxuLyoqXG4gKiBBIHR5cGUgZm9yIHByb3BlcnR5IGNoYW5nZSBldmVudHMsIGFzIGRpc3BhdGNoZWQgYnkgdGhlIHtAbGluayBfbm90aWZ5UHJvcGVydHl9IG1ldGhvZFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlRXZlbnQ8VD4gZXh0ZW5kcyBDdXN0b21FdmVudDxQcm9wZXJ0eUNoYW5nZUV2ZW50RGV0YWlsPFQ+PiB7fVxuXG4vKipcbiAqIFRoZSBjb21wb25lbnQgYmFzZSBjbGFzc1xuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIGNhY2hlZCB7QGxpbmsgQ1NTU3R5bGVTaGVldH0gaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N0eWxlU2hlZXQ6IENTU1N0eWxlU2hlZXQgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoZW4gY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBDU1NTdHlsZVNoZWV0fVxuICAgICAqIGluc3RhbmNlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaCBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgc3R5bGVTaGVldCAoKTogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxlbmd0aCAmJiAhdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX3N0eWxlU2hlZXQnKSkge1xuXG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgc3R5bGUgc2hlZXQgYW5kIGNhY2hlIGl0IGluIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCB3b3JrIG9uY2UgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcnJpdmVcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL3dpY2cuZ2l0aHViLmlvL2NvbnN0cnVjdC1zdHlsZXNoZWV0cy9cbiAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVNoZWV0ID0gbmV3IENTU1N0eWxlU2hlZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVNoZWV0LnJlcGxhY2VTeW5jKHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlU2hlZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIGNhY2hlZCB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH0gaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBnZXR0ZXIgd2lsbCBjcmVhdGUgYSB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH0gbm9kZSBhbmQgY2FjaGUgaXQgZm9yIHVzZSB3aXRoIGVhY2hcbiAgICAgKiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgc3R5bGVFbGVtZW50ICgpOiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVFbGVtZW50JykpIHtcblxuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50aXRsZSA9IHRoaXMuc2VsZWN0b3I7XG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLnN0eWxlcy5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgYXR0cmlidXRlIG5hbWVzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGtleXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHByb3BlcnR5IGtleSB0aGF0IGJlbG9uZ3MgdG8gYW4gYXR0cmlidXRlIG5hbWUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgYXR0cmlidXRlczogTWFwPHN0cmluZywgUHJvcGVydHlLZXk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBvZiBhIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIHByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgUHJvcGVydHlEZWNsYXJhdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIGxpc3RlbmVyIGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IG9mIGEgbWV0aG9kLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIGxpc3RlbmVyczogTWFwPFByb3BlcnR5S2V5LCBMaXN0ZW5lckRlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzZWxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzZWxlY3RvcmAgb3B0aW9uLCBpZiBwcm92aWRlZC5cbiAgICAgKiBPdGhlcndpc2UgdGhlIGRlY29yYXRvciB3aWxsIHVzZSB0aGlzIHByb3BlcnR5IHRvIGRlZmluZSB0aGUgY29tcG9uZW50LlxuICAgICAqL1xuICAgIHN0YXRpYyBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBzZXQgYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzaGFkb3dgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHRydWVgKS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2hhZG93OiBib29sZWFuO1xuXG4gICAgLy8gVE9ETzogY3JlYXRlIHRlc3RzIGZvciBzdHlsZSBpbmhlcml0YW5jZVxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzdHlsZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc3R5bGVzYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBTdHlsZXMgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICogVGhpcyBhbGxvd3MgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQgYW5kIGFkZCBhZGRpdGlvbmFsIHN0eWxlcyBvbiB0aGUgY2hpbGQgY29tcG9uZW50LlxuICAgICAqIEluIG9yZGVyIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50LCBhbiBleHBsaWNpdCBzdXBlciBjYWxsIGhhcyB0byBiZSBpbmNsdWRlZC4gQnlcbiAgICAgKiBkZWZhdWx0IG5vIHN0eWxlcyBhcmUgaW5oZXJpdGVkLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gW1xuICAgICAqICAgICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICogICAgICAgICAgICAgICc6aG9zdCB7IGJhY2tncm91bmQtY29sb3I6IGdyZWVuOyB9J1xuICAgICAqICAgICAgICAgIF07XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGB0ZW1wbGF0ZWAgb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogSWYgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IsIGl0IHdpbGwgaGF2ZSBwcmVjZWRlbmNlIG92ZXIgdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgICBUaGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHdoaWNoIHNob3VsZCBleGlzdCBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBzdGF0aWMgdGVtcGxhdGU/OiAoZWxlbWVudDogYW55LCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdG8gc3BlY2lmeSBhdHRyaWJ1dGVzIHdoaWNoIHNob3VsZCBiZSBvYnNlcnZlZCwgYnV0IGRvbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya1xuICAgICAqIEZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBkZWNvcmF0ZWQgd2l0aCB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IsIGFuIG9ic2VydmVkIGF0dHJpYnV0ZVxuICAgICAqIGlzIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzcGVjaWZpZWQgaGVyZS4gRm90IGF0dHJpYnV0ZXMgdGhhdCBkb24ndFxuICAgICAqIGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eSwgcmV0dXJuIHRoZSBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhpcyBnZXR0ZXIuIENoYW5nZXMgdG8gdGhlc2VcbiAgICAgKiBhdHRyaWJ1dGVzIGNhbiBiZSBoYW5kbGVkIGluIHRoZSB7QGxpbmsgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrfSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBXaGVuIGV4dGVuZGluZyBjb21wb25lbnRzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIHRoZSBzdXBlciBjbGFzcydzIG9ic2VydmVkQXR0cmlidXRlc1xuICAgICAqIGlmIHlvdSBvdmVycmlkZSB0aGlzIGdldHRlciAoZXhjZXB0IGlmIHlvdSBkb24ndCB3YW50IHRvIGluaGVyaXQgb2JzZXJ2ZWQgYXR0cmlidXRlcyk6XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbLi4uc3VwZXIub2JzZXJ2ZWRBdHRyaWJ1dGVzLCAnbXktYWRkaXRpb25hbC1hdHRyaWJ1dGUnXTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMgKCk6IHN0cmluZ1tdIHtcblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF91cGRhdGVSZXF1ZXN0OiBQcm9taXNlPGJvb2xlYW4+ID0gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jaGFuZ2VkUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0aW5nUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2xpc3RlbmVyRGVjbGFyYXRpb25zOiBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXNVcGRhdGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSByZW5kZXIgcm9vdCBpcyB3aGVyZSB0aGUge0BsaW5rIHJlbmRlcn0gbWV0aG9kIHdpbGwgYXR0YWNoIGl0cyBET00gb3V0cHV0XG4gICAgICovXG4gICAgcmVhZG9ubHkgcmVuZGVyUm9vdDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKC4uLmFyZ3M6IGFueVtdKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlbmRlclJvb3QgPSB0aGlzLl9jcmVhdGVSZW5kZXJSb290KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBtb3ZlZCB0byBhIG5ldyBkb2N1bWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgYWRvcHRlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Fkb3B0ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgZG9jdW1lbnQncyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl91bmxpc3RlbigpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnZGlzY29ubmVjdGVkJyk7XG5cbiAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIG9uZSBvZiB0aGUgY29tcG9uZW50J3MgYXR0cmlidXRlcyBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGljaCBhdHRyaWJ1dGVzIHRvIG5vdGljZSBjaGFuZ2UgZm9yIGlzIHNwZWNpZmllZCBpbiB7QGxpbmsgb2JzZXJ2ZWRBdHRyaWJ1dGVzfS5cbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIEZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB3aXRoIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlLCB0aGlzIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUgaGFuZGxpbmcgb2YgYXR0cmlidXRlIGNoYW5nZXMuIFdoZW4gb3ZlcnJpZGluZ1xuICAgICAqIHRoaXMgbWV0aG9kLCBhIHN1cGVyLWNhbGwgc2hvdWxkIGJlIGluY2x1ZGVkLCB0byBlbnN1cmUgYXR0cmlidXRlIGNoYW5nZXMgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICogYXJlIHByb2Nlc3NlZCBjb3JyZWN0bHkuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBzdXBlci5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAqXG4gICAgICogICAgICAgICAgLy8gZG8gY3VzdG9tIGhhbmRsaW5nLi4uXG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZSBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUmVmbGVjdGluZyB8fCBvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgdXBkYXRlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgYHVwZGF0ZUNhbGxiYWNrYCBpcyBpbnZva2VkIHN5bmNocm9ub3VzbHkgYnkgdGhlIHtAbGluayB1cGRhdGV9IG1ldGhvZCBhbmQgdGhlcmVmb3JlIGhhcHBlbnMgZGlyZWN0bHkgYWZ0ZXJcbiAgICAgKiByZW5kZXJpbmcsIHByb3BlcnR5IHJlZmxlY3Rpb24gYW5kIHByb3BlcnR5IGNoYW5nZSBldmVudHMuXG4gICAgICpcbiAgICAgKiBOLkIuOiBDaGFuZ2VzIG1hZGUgdG8gcHJvcGVydGllcyBvciBhdHRyaWJ1dGVzIGluc2lkZSB0aGlzIGNhbGxiYWNrICp3b24ndCogY2F1c2UgYW5vdGhlciB1cGRhdGUuXG4gICAgICogVG8gY2F1c2UgYW4gdXBkYXRlLCBkZWZlciBjaGFuZ2VzIHdpdGggdGhlIGhlbHAgb2YgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgKiAgICAgICAgICAgICAgLy8gcGVyZm9ybSBjaGFuZ2VzIHdoaWNoIG5lZWQgdG8gY2F1c2UgYW5vdGhlciB1cGRhdGUgaGVyZVxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgICAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZmlyc3RVcGRhdGUgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIHdhcyB0aGUgZmlyc3QgdXBkYXRlXG4gICAgICovXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7IH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgY3VzdG9tIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBBbiBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIGV2ZW50SW5pdCBBIHtAbGluayBDdXN0b21FdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5IChldmVudE5hbWU6IHN0cmluZywgZXZlbnRJbml0PzogQ3VzdG9tRXZlbnRJbml0KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIGV2ZW50SW5pdCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoIHByb3BlcnR5IGNoYW5nZXMgb2NjdXJyaW5nIGluIHRoZSBleGVjdXRvciBhbmQgcmFpc2UgY3VzdG9tIGV2ZW50c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIHNob3VsZCB0cmlnZ2VyIGN1c3RvbSBldmVudHMgd2hlbiB0aGV5IGFyZSBjYXVzZWQgYnkgaW50ZXJuYWwgc3RhdGUgY2hhbmdlcyxcbiAgICAgKiBidXQgbm90IGlmIHRoZXkgYXJlIGNhdXNlZCBieSBhIGNvbnN1bWVyIG9mIHRoZSBjb21wb25lbnQgQVBJIGRpcmVjdGx5LCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ215LWN1c3RvbS1lbGVtZW50JykuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIGBgYC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWVhbnMsIHdlIGNhbm5vdCBhdXRvbWF0ZSB0aGlzIHByb2Nlc3MgdGhyb3VnaCBwcm9wZXJ0eSBzZXR0ZXJzLCBhcyB3ZSBjYW4ndCBiZSBzdXJlIHdob1xuICAgICAqIGludm9rZWQgdGhlIHNldHRlciAtIGludGVybmFsIGNhbGxzIG9yIGV4dGVybmFsIGNhbGxzLlxuICAgICAqXG4gICAgICogT25lIG9wdGlvbiBpcyB0byBtYW51YWxseSByYWlzZSB0aGUgZXZlbnQsIHdoaWNoIGNhbiBiZWNvbWUgdGVkaW91cyBhbmQgZm9yY2VzIHVzIHRvIHVzZSBzdHJpbmctXG4gICAgICogYmFzZWQgZXZlbnQgbmFtZXMgb3IgcHJvcGVydHkgbmFtZXMsIHdoaWNoIGFyZSBkaWZmaWN1bHQgdG8gcmVmYWN0b3IsIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogLy8gaWYgd2UgcmVmYWN0b3IgdGhlIHByb3BlcnR5IG5hbWUsIHdlIGNhbiBlYXNpbHkgbWlzcyB0aGUgbm90aWZ5IGNhbGxcbiAgICAgKiB0aGlzLm5vdGlmeSgnY3VzdG9tUHJvcGVydHknKTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEEgbW9yZSBjb252ZW5pZW50IHdheSBpcyB0byBleGVjdXRlIHRoZSBpbnRlcm5hbCBjaGFuZ2VzIGluIGEgd3JhcHBlciB3aGljaCBjYW4gZGV0ZWN0IHRoZSBjaGFuZ2VkXG4gICAgICogcHJvcGVydGllcyBhbmQgd2lsbCBhdXRvbWF0aWNhbGx5IHJhaXNlIHRoZSByZXF1aXJlZCBldmVudHMuIFRoaXMgZWxpbWluYXRlcyB0aGUgbmVlZCB0byBtYW51YWxseVxuICAgICAqIHJhaXNlIGV2ZW50cyBhbmQgcmVmYWN0b3JpbmcgZG9lcyBubyBsb25nZXIgYWZmZWN0IHRoZSBwcm9jZXNzLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMud2F0Y2goKCkgPT4ge1xuICAgICAqXG4gICAgICogICAgICB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAgICAgIC8vIHdlIGNhbiBhZGQgbW9yZSBwcm9wZXJ0eSBtb2RpZmljYXRpb25zIHRvIG5vdGlmeSBpbiBoZXJlXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgQSBmdW5jdGlvbiB0aGF0IHBlcmZvcm1zIHRoZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBiZSBub3RpZmllZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3YXRjaCAoZXhlY3V0b3I6ICgpID0+IHZvaWQpIHtcblxuICAgICAgICAvLyBiYWNrIHVwIGN1cnJlbnQgY2hhbmdlZCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNoYW5nZXNcbiAgICAgICAgZXhlY3V0b3IoKTtcblxuICAgICAgICAvLyBhZGQgYWxsIG5ldyBvciB1cGRhdGVkIGNoYW5nZWQgcHJvcGVydGllcyB0byB0aGUgbm90aWZ5aW5nIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBbcHJvcGVydHlLZXksIG9sZFZhbHVlXSBvZiB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcykge1xuXG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9ICFwcmV2aW91c0NoYW5nZXMuaGFzKHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSAhYWRkZWQgJiYgdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBwcmV2aW91c0NoYW5nZXMuZ2V0KHByb3BlcnR5S2V5KSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoYWRkZWQgfHwgdXBkYXRlZCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdmFsdWUgb2YgYSBkZWNvcmF0ZWQgcHJvcGVydHkgb3IgaXRzIGFzc29jaWF0ZWRcbiAgICAgKiBhdHRyaWJ1dGUgY2hhbmdlcy4gSWYgeW91IG5lZWQgdGhlIGNvbXBvbmVudCB0byB1cGRhdGUgYmFzZWQgb24gYSBzdGF0ZSBjaGFuZ2UgdGhhdCBpc1xuICAgICAqIG5vdCBjb3ZlcmVkIGJ5IGEgZGVjb3JhdGVkIHByb3BlcnR5LCBjYWxsIHRoaXMgbWV0aG9kIHdpdGhvdXQgYW55IGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIHByb3BlcnR5IHRoYXQgcmVxdWVzdHMgdGhlIHVwZGF0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICB0aGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgQSBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIHdoZW4gdGhlIHVwZGF0ZSBpcyBjb21wbGV0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVxdWVzdFVwZGF0ZSAocHJvcGVydHlLZXk/OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU/OiBhbnksIG5ld1ZhbHVlPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0ncyBvYnNlcnZlIG9wdGlvbiBpcyBgZmFsc2VgLCB7QGxpbmsgaGFzQ2hhbmdlZH1cbiAgICAgICAgICAgIC8vIHdpbGwgcmV0dXJuIGBmYWxzZWAgYW5kIG5vIHVwZGF0ZSB3aWxsIGJlIHJlcXVlc3RlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0NoYW5nZWQocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSkpIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuXG4gICAgICAgICAgICAvLyBzdG9yZSBjaGFuZ2VkIHByb3BlcnR5IGZvciBiYXRjaCBwcm9jZXNzaW5nXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgYXJlIGluIHJlZmxlY3Rpbmcgc3RhdGUsIGFuIGF0dHJpYnV0ZSBpcyByZWZsZWN0aW5nIHRvIHRoaXMgcHJvcGVydHkgYW5kIHdlXG4gICAgICAgICAgICAvLyBjYW4gc2tpcCByZWZsZWN0aW5nIHRoZSBwcm9wZXJ0eSBiYWNrIHRvIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIC8vIHByb3BlcnR5IGNoYW5nZXMgbmVlZCB0byBiZSB0cmFja2VkIGhvd2V2ZXIgYW5kIHtAbGluayByZW5kZXJ9IG11c3QgYmUgY2FsbGVkIGFmdGVyXG4gICAgICAgICAgICAvLyB0aGUgYXR0cmlidXRlIGNoYW5nZSBpcyByZWZsZWN0ZWQgdG8gdGhpcyBwcm9wZXJ0eVxuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1JlZmxlY3RpbmcpIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gZW5xdWV1ZSB1cGRhdGUgcmVxdWVzdCBpZiBub25lIHdhcyBlbnF1ZXVlZCBhbHJlYWR5XG4gICAgICAgICAgICB0aGlzLl9lbnF1ZXVlVXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZSB0byBpdHMge0BsaW5rIHJlbmRlclJvb3R9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFVzZXMgbGl0LWh0bWwncyB7QGxpbmsgbGl0LWh0bWwjcmVuZGVyfSBtZXRob2QgdG8gcmVuZGVyIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB0byB0aGVcbiAgICAgKiBjb21wb25lbnQncyByZW5kZXIgcm9vdC4gVGhlIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgc3RhdGljIHRlbXBsYXRlIG1ldGhvZFxuICAgICAqIGF1dG9tYXRpY2FsbHkuIFRvIG1ha2UgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGF2YWlsYWJsZSB0byB0aGUgdGVtcGxhdGUgbWV0aG9kLCB5b3UgY2FuIHBhc3MgdGhlbSB0byB0aGVcbiAgICAgKiByZW5kZXIgbWV0aG9kLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGNvbnN0IGRhdGVGb3JtYXR0ZXIgPSAoZGF0ZTogRGF0ZSkgPT4geyAvLyByZXR1cm4gc29tZSBkYXRlIHRyYW5zZm9ybWF0aW9uLi4uXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50JyxcbiAgICAgKiAgICAgIHRlbXBsYXRlOiAoZWxlbWVudCwgZm9ybWF0RGF0ZSkgPT4gaHRtbGA8c3Bhbj5MYXN0IHVwZGF0ZWQ6ICR7IGZvcm1hdERhdGUoZWxlbWVudC5sYXN0VXBkYXRlZCkgfTwvc3Bhbj5gXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBAcHJvcGVydHkoKVxuICAgICAqICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICpcbiAgICAgKiAgICAgIHJlbmRlciAoKSB7XG4gICAgICogICAgICAgICAgLy8gbWFrZSB0aGUgZGF0ZSBmb3JtYXR0ZXIgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSBieSBwYXNzaW5nIGl0IHRvIHJlbmRlcigpXG4gICAgICogICAgICAgICAgc3VwZXIucmVuZGVyKGRhdGVGb3JtYXR0ZXIpO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBoZWxwZXJzICAgQW55IGFkZGl0aW9uYWwgb2JqZWN0cyB3aGljaCBzaG91bGQgYmUgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSBzY29wZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW5kZXIgKC4uLmhlbHBlcnM6IGFueVtdKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSAmJiBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSh0aGlzLCAuLi5oZWxwZXJzKTtcblxuICAgICAgICBpZiAodGVtcGxhdGUpIHJlbmRlcih0ZW1wbGF0ZSwgdGhpcy5yZW5kZXJSb290LCB7IGV2ZW50Q29udGV4dDogdGhpcyB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjb21wb25lbnQgYWZ0ZXIgYW4gdXBkYXRlIHdhcyByZXF1ZXN0ZWQgd2l0aCB7QGxpbmsgcmVxdWVzdFVwZGF0ZX1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVuZGVycyB0aGUgdGVtcGxhdGUsIHJlZmxlY3RzIGNoYW5nZWQgcHJvcGVydGllcyB0byBhdHRyaWJ1dGVzIGFuZFxuICAgICAqIGRpc3BhdGNoZXMgY2hhbmdlIGV2ZW50cyBmb3IgcHJvcGVydGllcyB3aGljaCBhcmUgbWFya2VkIGZvciBub3RpZmljYXRpb24uXG4gICAgICogVG8gaGFuZGxlIHVwZGF0ZXMgZGlmZmVyZW50bHksIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGFuZCBhIG1hcCBvZiBwcm9wZXJ0eVxuICAgICAqIGNoYW5nZXMgaXMgcHJvdmlkZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlIChjaGFuZ2VzPzogQ2hhbmdlcykge1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gcmVmbGVjdCBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIHJlZmxlY3Rpb25cbiAgICAgICAgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWU6IGFueSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMucmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDb21wb25lbnRdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbm90aWZ5IGFsbCBwcm9wZXJ0aWVzIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uXG4gICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWUsIHByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMubm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIENvbXBvbmVudF0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHByb3BlcnR5IGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVzb2x2ZXMgdGhlIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfSBmb3IgdGhlIHByb3BlcnR5IGFuZCByZXR1cm5zIGl0cyByZXN1bHQuXG4gICAgICogSWYgbm9uZSBpcyBkZWZpbmVkICh0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24ncyBgb2JzZXJ2ZWAgb3B0aW9uIGlzIGBmYWxzZWApIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBjaGFuZ2VkLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNDaGFuZ2VkIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBvYnNlcnZlIGlzIGVpdGhlciBgZmFsc2VgIG9yIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZS5jYWxsKG51bGwsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBDSEFOR0VfREVURUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gZm9yIGEgZGVjb3JhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIGRlY2xhcmF0aW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFByb3BlcnR5RGVjbGFyYXRpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVjbGFyYXRpb24gfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIGFzc29jaWF0ZWQgcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RBdHRyaWJ1dGV9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICAvLyBpZ25vcmUgdXNlci1kZWZpbmVkIG9ic2VydmVkIGF0dHJpYnV0ZXNcbiAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIGFuZCByZW1vdmUgdGhlIGxvZ1xuICAgICAgICBpZiAoIXByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBvYnNlcnZlZCBhdHRyaWJ1dGUgXCIkeyBhdHRyaWJ1dGVOYW1lIH1cIiBub3QgZm91bmQuLi4gaWdub3JpbmcuLi5gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNBdHRyaWJ1dGVSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlLmNhbGwodGhpcywgYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZV0gYXMgQXR0cmlidXRlUmVmbGVjdG9yKShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5fSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkge1xuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHksIHdlIGNhbiBjYXRjaCB0aGUgc3RhdGUgdGhlcmVcbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5UmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5XSBhcyBQcm9wZXJ0eVJlZmxlY3RvcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJhaXNlIGFuIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSBub3RpZmllci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIG5vdGlmaWVyIHtAbGluayBfbm90aWZ5UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByYWlzZSBhbiBldmVudCBmb3JcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpIHtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlOb3RpZmllcihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnldIGFzIFByb3BlcnR5Tm90aWZpZXIpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBjb21wb25lbnQncyByZW5kZXIgcm9vdFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dC4gV2hlbiB1c2luZyB0aGUgY29tcG9uZW50XG4gICAgICogd2l0aCBzaGFkb3cgbW9kZSwgaXQgd2lsbCBiZSBhIHtAbGluayBTaGFkb3dSb290fSwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NyZWF0ZVJlbmRlclJvb3QgKCk6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkuc2hhZG93XG4gICAgICAgICAgICA/IHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pXG4gICAgICAgICAgICA6IHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgY29tcG9uZW50J3Mgc3R5bGVzIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlIHdpbGwgYmUgYWRvcHRlZFxuICAgICAqIGJ5IHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIG5vdCwgYSBzdHlsZSBlbGVtZW50IGlzIGNyZWF0ZWQgYW5kIGF0dGFjaGVkIHRvIHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIHRoZVxuICAgICAqIGNvbXBvbmVudCBpcyBub3QgdXNpbmcgc2hhZG93IG1vZGUsIGEgc2NyaXB0IHRhZyB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLiBGb3IgbXVsdGlwbGVcbiAgICAgKiBpbnN0YW5jZXMgb2YgdGhlIHNhbWUgY29tcG9uZW50IG9ubHkgb25lIHN0eWxlc2hlZXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2Fkb3B0U3R5bGVzICgpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcbiAgICAgICAgY29uc3Qgc3R5bGVTaGVldCA9IGNvbnN0cnVjdG9yLnN0eWxlU2hlZXQ7XG4gICAgICAgIGNvbnN0IHN0eWxlRWxlbWVudCA9IGNvbnN0cnVjdG9yLnN0eWxlRWxlbWVudDtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gY29uc3RydWN0b3Iuc3R5bGVzO1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0KSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBwYXJ0IG9uY2Ugd2UgaGF2ZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIChDaHJvbWUgNzMpXG4gICAgICAgICAgICBpZiAoIWNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgaWYgKChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLmluY2x1ZGVzKHN0eWxlU2hlZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgICh0aGlzLnJlbmRlclJvb3QgYXMgU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW3N0eWxlU2hlZXRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoc3R5bGVFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3Qgd2UgZG9uJ3QgZHVwbGljYXRlIHN0eWxlc2hlZXRzIGZvciBub24tc2hhZG93IGVsZW1lbnRzXG4gICAgICAgICAgICBjb25zdCBzdHlsZUFscmVhZHlBZGRlZCA9IGNvbnN0cnVjdG9yLnNoYWRvd1xuICAgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgICAgICA6IEFycmF5LmZyb20oZG9jdW1lbnQuc3R5bGVTaGVldHMpLmZpbmQoc3R5bGUgPT4gc3R5bGUudGl0bGUgPT09IGNvbnN0cnVjdG9yLnNlbGVjdG9yKSAmJiB0cnVlIHx8IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoc3R5bGVBbHJlYWR5QWRkZWQpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gY2xvbmUgdGhlIGNhY2hlZCBzdHlsZSBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChjb25zdHJ1Y3Rvci5zaGFkb3cpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vdC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlTmFtZSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgYXR0cmlidXRlIHZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci5mcm9tQXR0cmlidXRlLmNhbGwodGhpcywgbmV3VmFsdWUpO1xuXG4gICAgICAgIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgdGhpc10gPSBwcm9wZXJ0eVZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IHByb3BlcnR5IHJlZmxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBubyB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9IGlzIGRlZmluZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSB0aGlzXG4gICAgICogbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCB0aGUgcHJvcGVydHkgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgYXR0cmlidXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnR5IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgLy8gdGhpcyBmdW5jdGlvbiBpcyBvbmx5IGNhbGxlZCBmb3IgcHJvcGVydGllcyB3aGljaCBoYXZlIGEgZGVjbGFyYXRpb25cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIGlmIHRoZSBkZWZhdWx0IHJlZmxlY3RvciBpcyB1c2VkLCB3ZSBuZWVkIHRvIGNoZWNrIGlmIGFuIGF0dHJpYnV0ZSBmb3IgdGhpcyBwcm9wZXJ0eSBleGlzdHNcbiAgICAgICAgLy8gaWYgbm90LCB3ZSB3b24ndCByZWZsZWN0XG4gICAgICAgIGlmICghcHJvcGVydHlEZWNsYXJhdGlvbi5hdHRyaWJ1dGUpIHJldHVybjtcblxuICAgICAgICAvLyBpZiBhdHRyaWJ1dGUgaXMgdHJ1dGh5LCBpdCdzIGEgc3RyaW5nXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmF0dHJpYnV0ZSBhcyBzdHJpbmc7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgYXR0cmlidXRlIHZhbHVlXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlID0gcHJvcGVydHlEZWNsYXJhdGlvbi5jb252ZXJ0ZXIudG9BdHRyaWJ1dGUuY2FsbCh0aGlzLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgLy8gdW5kZWZpbmVkIG1lYW5zIGRvbid0IGNoYW5nZVxuICAgICAgICBpZiAoYXR0cmlidXRlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVsbCBtZWFucyByZW1vdmUgdGhlIGF0dHJpYnV0ZVxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIHByb3BlcnR5LWNoYW5nZWQgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KTogdm9pZCB7XG5cbiAgICAgICAgY29uc3QgZXZlbnROYW1lID0gY3JlYXRlRXZlbnROYW1lKHByb3BlcnR5S2V5LCAnJywgJ2NoYW5nZWQnKTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eUtleSxcbiAgICAgICAgICAgICAgICBwcmV2aW91czogb2xkVmFsdWUsXG4gICAgICAgICAgICAgICAgY3VycmVudDogbmV3VmFsdWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBsaWZlY3ljbGUgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBsaWZlY3ljbGUgVGhlIGxpZmVjeWNsZSBmb3Igd2hpY2ggdG8gcmFpc2UgdGhlIGV2ZW50ICh3aWxsIGJlIHRoZSBldmVudCBuYW1lKVxuICAgICAqIEBwYXJhbSBkZXRhaWwgICAgT3B0aW9uYWwgZXZlbnQgZGV0YWlsc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlMaWZlY3ljbGUgKGxpZmVjeWNsZTogJ2Fkb3B0ZWQnIHwgJ2Nvbm5lY3RlZCcgfCAnZGlzY29ubmVjdGVkJyB8ICd1cGRhdGUnLCBkZXRhaWw/OiBvYmplY3QpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGxpZmVjeWNsZSwge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIC4uLihkZXRhaWwgPyB7IGRldGFpbDogZGV0YWlsIH0gOiB7fSlcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW4gKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLmxpc3RlbmVycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbGlzdGVuZXIpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEZWNsYXJhdGlvbjogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgY2xhc3MncyBzdGF0aWMgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW50byBhbiBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGV2ZW50OiBkZWNsYXJhdGlvbi5ldmVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBkZWNsYXJhdGlvbi5vcHRpb25zLFxuXG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aGUgY29tcG9uZW50cyBsaXN0ZW5lciBtZXRob2QgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6ICh0aGlzW2xpc3RlbmVyIGFzIGtleW9mIHRoaXNdIGFzIHVua25vd24gYXMgRXZlbnRMaXN0ZW5lcikuYmluZCh0aGlzKSxcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnQgdGFyZ2V0IGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICB0YXJnZXQ6IChkZWNsYXJhdGlvbi50YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgID8gKHR5cGVvZiBkZWNsYXJhdGlvbi50YXJnZXQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGRlY2xhcmF0aW9uLnRhcmdldC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgYm91bmQgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRhcmdldFxuICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmV2ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGluIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLnB1c2goaW5zdGFuY2VEZWNsYXJhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5ldmVudCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVucXVldWUgYSByZXF1ZXN0IGZvciBhbiBhc3luY2hyb25vdXMgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2VucXVldWVVcGRhdGUgKCkge1xuXG4gICAgICAgIGxldCByZXNvbHZlOiAocmVzdWx0OiBib29sZWFuKSA9PiB2b2lkO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVxdWVzdCA9IHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgLy8gbWFyayB0aGUgY29tcG9uZW50IGFzIGhhdmluZyByZXF1ZXN0ZWQgYW4gdXBkYXRlLCB0aGUge0BsaW5rIF9yZXF1ZXN0VXBkYXRlfVxuICAgICAgICAvLyBtZXRob2Qgd2lsbCBub3QgZW5xdWV1ZSBhIGZ1cnRoZXIgcmVxdWVzdCBmb3IgdXBkYXRlIGlmIG9uZSBpcyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzID0+IHJlc29sdmUgPSByZXMpO1xuXG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB1cGRhdGUgdG8gcmVzb2x2ZVxuICAgICAgICAvLyBgYXdhaXRgIGlzIGFzeW5jaHJvbm91cyBhbmQgd2lsbCByZXR1cm4gZXhlY3V0aW9uIHRvIHRoZSB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gbWV0aG9kXG4gICAgICAgIC8vIGFuZCBlc3NlbnRpYWxseSBhbGxvd3MgdXMgdG8gYmF0Y2ggbXVsdGlwbGUgc3luY2hyb25vdXMgcHJvcGVydHkgY2hhbmdlcywgYmVmb3JlIHRoZVxuICAgICAgICAvLyBleGVjdXRpb24gY2FuIHJlc3VtZSBoZXJlXG4gICAgICAgIGF3YWl0IHByZXZpb3VzUmVxdWVzdDtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zY2hlZHVsZVVwZGF0ZSgpO1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdXBkYXRlIG1heSBiZSBzY2hlZHVsZWQgYXN5bmNocm9ub3VzbHkgYXMgd2VsbFxuICAgICAgICBpZiAocmVzdWx0KSBhd2FpdCByZXN1bHQ7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgbmV3IHtAbGluayBfdXBkYXRlUmVxdWVzdH0gYWZ0ZXIgdGhlIHJlc3VsdCBvZiB0aGUgY3VycmVudCB1cGRhdGUgcmVzb2x2ZXNcbiAgICAgICAgcmVzb2x2ZSEoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NoZWR1bGUgdGhlIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNjaGVkdWxlcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYXMgc29vbiBhcyBwb3NzaWJsZSBhbmQgYWxsIGNvbnNlY3V0aXZlIHVwZGF0ZXNcbiAgICAgKiBqdXN0IGJlZm9yZSB0aGUgbmV4dCBmcmFtZS4gSW4gdGhlIGxhdHRlciBjYXNlIGl0IHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgKiB0aGUgdXBkYXRlIGlzIGRvbmUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NjaGVkdWxlVXBkYXRlICgpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzY2hlZHVsZSB0aGUgdXBkYXRlIHZpYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdG8gYXZvaWQgbXVsdGlwbGUgcmVkcmF3cyBwZXIgZnJhbWVcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21wb25lbnQgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEludm9rZXMge0BsaW5rIHVwZGF0ZUNhbGxiYWNrfSBhZnRlciBwZXJmb3JtaW5nIHRoZSB1cGRhdGUgYW5kIGNsZWFucyB1cCB0aGUgY29tcG9uZW50XG4gICAgICogc3RhdGUuIER1cmluZyB0aGUgZmlyc3QgdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVzIHdpbGwgYmUgYWRkZWQuIERpc3BhdGNoZXMgdGhlIHVwZGF0ZVxuICAgICAqIGxpZmVjeWNsZSBldmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcGVyZm9ybVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgLy8gd2UgaGF2ZSB0byB3YWl0IHVudGlsIHRoZSBjb21wb25lbnQgaXMgY29ubmVjdGVkIGJlZm9yZSB3ZSBjYW4gZG8gYW55IHVwZGF0ZXNcbiAgICAgICAgLy8gdGhlIHtAbGluayBjb25uZWN0ZWRDYWxsYmFja30gd2lsbCBjYWxsIHtAbGluayByZXF1ZXN0VXBkYXRlfSBpbiBhbnkgY2FzZSwgc28gd2UgY2FuXG4gICAgICAgIC8vIHNpbXBseSBieXBhc3MgYW55IGFjdHVhbCB1cGRhdGUgYW5kIGNsZWFuLXVwIHVudGlsIHRoZW5cbiAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBwYXNzIGEgY29weSBvZiB0aGUgcHJvcGVydHkgY2hhbmdlcyB0byB0aGUgdXBkYXRlIG1ldGhvZCwgc28gcHJvcGVydHkgY2hhbmdlc1xuICAgICAgICAgICAgLy8gYXJlIGF2YWlsYWJsZSBpbiBhbiBvdmVycmlkZGVuIHVwZGF0ZSBtZXRob2RcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKGNoYW5nZXMpO1xuXG4gICAgICAgICAgICAvLyByZXNldCBwcm9wZXJ0eSBtYXBzIGRpcmVjdGx5IGFmdGVyIHRoZSB1cGRhdGUsIHNvIGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGVDYWxsYmFja1xuICAgICAgICAgICAgLy8gY2FuIGJlIHJlY29yZGVkIGZvciB0aGUgbmV4dCB1cGRhdGUsIHdoaWNoIGhhcyB0byBiZSB0cmlnZ2VyZWQgbWFudWFsbHkgdGhvdWdoXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSB3ZSBhZG9wdCB0aGUgZWxlbWVudCdzIHN0eWxlcyBhbmQgc2V0IHVwIGRlY2xhcmVkIGxpc3RlbmVyc1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9hZG9wdFN0eWxlcygpO1xuXG4gICAgICAgICAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnMgYWZ0ZXIgdGhlIHVwZGF0ZSwgdGhpcyB3YXkgd2UgZW5zdXJlIGFsbCBET00gaXMgcmVuZGVyZWQsIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgLy8gYXJlIHVwLXRvLWRhdGUgYW5kIGFueSB1c2VyLWNyZWF0ZWQgb2JqZWN0cyAoZS5nLiB3b3JrZXJzKSB3aWxsIGJlIGNyZWF0ZWQgaW4gYW5cbiAgICAgICAgICAgICAgICAvLyBvdmVycmlkZGVuIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soY2hhbmdlcywgIXRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ3VwZGF0ZScsIHsgY2hhbmdlczogY2hhbmdlcywgZmlyc3RVcGRhdGU6ICF0aGlzLl9oYXNVcGRhdGVkIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hcmsgY29tcG9uZW50IGFzIHVwZGF0ZWQgKmFmdGVyKiB0aGUgdXBkYXRlIHRvIHByZXZlbnQgaW5maW50ZSBsb29wcyBpbiB0aGUgdXBkYXRlIHByb2Nlc3NcbiAgICAgICAgLy8gTi5CLjogYW55IHByb3BlcnR5IGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGUgd2lsbCBub3QgdHJpZ2dlciBhbm90aGVyIHVwZGF0ZVxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICB9XG59XG4iLCIvKipcbiAqIEEgc2ltcGxlIGNzcyB0ZW1wbGF0ZSBsaXRlcmFsIHRhZ1xuICpcbiAqIEByZW1hcmtzXG4gKiBUaGUgdGFnIGl0c2VsZiBkb2Vzbid0IGRvIGFueXRoaW5nIHRoYXQgYW4gdW50YWdnZWQgdGVtcGxhdGUgbGl0ZXJhbCB3b3VsZG4ndCBkbywgYnV0IGl0IGNhbiBiZSB1c2VkIGJ5XG4gKiBlZGl0b3IgcGx1Z2lucyB0byBpbmZlciB0aGUgXCJ2aXJ0dWFsIGRvY3VtZW50IHR5cGVcIiB0byBwcm92aWRlIGNvZGUgY29tcGxldGlvbiBhbmQgaGlnaGxpZ2h0aW5nLiBJdCBjb3VsZFxuICogYWxzbyBiZSB1c2VkIGluIHRoZSBmdXR1cmUgdG8gbW9yZSBzZWN1cmVseSBjb252ZXJ0IHN1YnN0aXR1dGlvbnMgaW50byBzdHJpbmdzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcbiAqXG4gKiBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuICogICBkaXNwbGF5OiBibG9jaztcbiAqICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAqICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbiAqIGA7XG4gKlxuICogY29uc3QgbWl4aW5Ib3ZlciA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBjc3NgXG4gKiAkeyBzZWxlY3RvciB9OmhvdmVyIHtcbiAqICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuICogfVxuICogYDtcbiAqXG4gKiBjb25zdCBzdHlsZXMgPSBjc3NgXG4gKiA6aG9zdCB7XG4gKiAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICAkeyBtaXhpbkJveCgpIH1cbiAqIH1cbiAqICR7IG1peGluSG92ZXIoJzpob3N0JykgfVxuICogOjpzbG90dGVkKCopIHtcbiAqICAgbWFyZ2luOiAwO1xuICogfVxuICogYDtcbiAqXG4gKiAvLyB3aWxsIHByb2R1Y2UuLi5cbiAqIDpob3N0IHtcbiAqIC0taG92ZXItY29sb3I6IGdyZWVuO1xuICogZGlzcGxheTogYmxvY2s7XG4gKlxuICogZGlzcGxheTogYmxvY2s7XG4gKiBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogYm9yZGVyOiAxcHggc29saWQgc2lsdmVyO1xuICpcbiAqIH1cbiAqXG4gKiA6aG9zdDpob3ZlciB7XG4gKiBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKlxuICogOjpzbG90dGVkKCopIHtcbiAqIG1hcmdpbjogMDtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgY3NzID0gKGxpdGVyYWxzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uc3Vic3RpdHV0aW9uczogYW55W10pID0+IHtcblxuICAgIHJldHVybiBzdWJzdGl0dXRpb25zLnJlZHVjZSgocHJldjogc3RyaW5nLCBjdXJyOiBhbnksIGk6IG51bWJlcikgPT4gcHJldiArIGN1cnIgKyBsaXRlcmFsc1tpICsgMV0sIGxpdGVyYWxzWzBdKTtcbn07XG5cbi8vIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcblxuLy8gY29uc3QgbWl4aW5Cb3ggPSAoYm9yZGVyV2lkdGg6IHN0cmluZyA9ICcxcHgnLCBib3JkZXJDb2xvcjogc3RyaW5nID0gJ3NpbHZlcicpID0+IGNzc2Bcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4vLyAgIGJvcmRlcjogJHtib3JkZXJXaWR0aH0gc29saWQgJHtib3JkZXJDb2xvcn07XG4vLyBgO1xuXG4vLyBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2Bcbi8vICR7IHNlbGVjdG9yIH06aG92ZXIge1xuLy8gICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4vLyB9XG4vLyBgO1xuXG4vLyBjb25zdCBzdHlsZXMgPSBjc3NgXG4vLyA6aG9zdCB7XG4vLyAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4vLyAgIGRpc3BsYXk6IGJsb2NrO1xuLy8gICAkeyBtaXhpbkJveCgpIH1cbi8vIH1cblxuLy8gJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG5cbi8vIDo6c2xvdHRlZCgqKSB7XG4vLyAgIG1hcmdpbjogMDtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4iLCJleHBvcnQgY29uc3QgQXJyb3dVcCA9ICdBcnJvd1VwJztcbmV4cG9ydCBjb25zdCBBcnJvd0Rvd24gPSAnQXJyb3dEb3duJztcbmV4cG9ydCBjb25zdCBBcnJvd0xlZnQgPSAnQXJyb3dMZWZ0JztcbmV4cG9ydCBjb25zdCBBcnJvd1JpZ2h0ID0gJ0Fycm93UmlnaHQnO1xuZXhwb3J0IGNvbnN0IEVudGVyID0gJ0VudGVyJztcbmV4cG9ydCBjb25zdCBFc2NhcGUgPSAnRXNjYXBlJztcbmV4cG9ydCBjb25zdCBTcGFjZSA9ICcgJztcbmV4cG9ydCBjb25zdCBUYWIgPSAnVGFiJztcbmV4cG9ydCBjb25zdCBCYWNrc3BhY2UgPSAnQmFja3NwYWNlJztcbmV4cG9ydCBjb25zdCBBbHQgPSAnQWx0JztcbmV4cG9ydCBjb25zdCBTaGlmdCA9ICdTaGlmdCc7XG5leHBvcnQgY29uc3QgQ29udHJvbCA9ICdDb250cm9sJztcbmV4cG9ydCBjb25zdCBNZXRhID0gJ01ldGEnO1xuIiwiaW1wb3J0IHsgQXJyb3dEb3duLCBBcnJvd0xlZnQsIEFycm93UmlnaHQsIEFycm93VXAgfSBmcm9tICcuL2tleXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RJdGVtIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVJdGVtQ2hhbmdlPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBDdXN0b21FdmVudCB7XG4gICAgdHlwZTogJ2FjdGl2ZS1pdGVtLWNoYW5nZSc7XG4gICAgZGV0YWlsOiB7XG4gICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGl0ZW06IFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnR5cGUgTGlzdEVudHJ5PFQgZXh0ZW5kcyBMaXN0SXRlbT4gPSBbbnVtYmVyIHwgdW5kZWZpbmVkLCBUIHwgdW5kZWZpbmVkXTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpc3RLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBFdmVudFRhcmdldCB7XG5cbiAgICBwcm90ZWN0ZWQgYWN0aXZlSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJdGVtOiBUIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGxpc3RlbmVyczogTWFwPHN0cmluZywgRXZlbnRMaXN0ZW5lcj4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgaXRlbVR5cGU6IGFueTtcblxuICAgIHB1YmxpYyBpdGVtczogVFtdO1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwdWJsaWMgaG9zdDogSFRNTEVsZW1lbnQsXG4gICAgICAgIGl0ZW1zOiBOb2RlTGlzdE9mPFQ+LFxuICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJykge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IEFycmF5LmZyb20oaXRlbXMpO1xuICAgICAgICB0aGlzLml0ZW1UeXBlID0gdGhpcy5pdGVtc1swXSAmJiB0aGlzLml0ZW1zWzBdLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHRoaXMuYmluZEhvc3QoKTtcbiAgICB9XG5cbiAgICBnZXRBY3RpdmVJdGVtICgpOiBUIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJdGVtO1xuICAgIH07XG5cbiAgICBzZXRBY3RpdmVJdGVtIChpdGVtOiBULCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBMaXN0RW50cnk8VD4gPSBbXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaW5kZXggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaXRlbSA6IHVuZGVmaW5lZFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXROZXh0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXROZXh0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldFByZXZpb3VzSXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRQcmV2aW91c0VudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRGaXJzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0Rmlyc3RFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0TGFzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0TGFzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IFtwcmV2LCBuZXh0XSA9ICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSA/IFtBcnJvd0xlZnQsIEFycm93UmlnaHRdIDogW0Fycm93VXAsIEFycm93RG93bl07XG4gICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBwcmV2OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQcmV2aW91c0l0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgbmV4dDpcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TmV4dEl0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IHRhcmdldDogVCB8IG51bGwgPSBldmVudC50YXJnZXQgYXMgVCB8IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgdGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSAmJiAhdGFyZ2V0IS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRm9jdXMgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlIChwcmV2aW91c0luZGV4OiBudW1iZXIgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICBjb25zdCBldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUPiA9IG5ldyBDdXN0b21FdmVudCgnYWN0aXZlLWl0ZW0tY2hhbmdlJywge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiAodHlwZW9mIHByZXZpb3VzSW5kZXggPT09ICdudW1iZXInKSA/IHRoaXMuaXRlbXNbcHJldmlvdXNJbmRleF0gOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHRoaXMuYWN0aXZlSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuYWN0aXZlSXRlbVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgQWN0aXZlSXRlbUNoYW5nZTxUPjtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRFbnRyeUFjdGl2ZSAoZW50cnk6IExpc3RFbnRyeTxUPiwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dID0gZW50cnk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldE5leHRFbnRyeSAoZnJvbUluZGV4PzogbnVtYmVyKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICBmcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICA/IGZyb21JbmRleFxuICAgICAgICAgICAgOiAodHlwZW9mIHRoaXMuYWN0aXZlSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmVJbmRleFxuICAgICAgICAgICAgICAgIDogLTE7XG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5pdGVtcy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgbmV4dEluZGV4ID0gZnJvbUluZGV4ICsgMTtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gdGhpcy5pdGVtc1tuZXh0SW5kZXhdO1xuXG4gICAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsYXN0SW5kZXggJiYgbmV4dEl0ZW0gJiYgbmV4dEl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zWysrbmV4dEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAobmV4dEl0ZW0gJiYgIW5leHRJdGVtLmRpc2FibGVkKSA/IFtuZXh0SW5kZXgsIG5leHRJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRQcmV2aW91c0VudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAwO1xuXG4gICAgICAgIGxldCBwcmV2SW5kZXggPSBmcm9tSW5kZXggLSAxO1xuICAgICAgICBsZXQgcHJldkl0ZW0gPSB0aGlzLml0ZW1zW3ByZXZJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKHByZXZJbmRleCA+IDAgJiYgcHJldkl0ZW0gJiYgcHJldkl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgcHJldkl0ZW0gPSB0aGlzLml0ZW1zWy0tcHJldkluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAocHJldkl0ZW0gJiYgIXByZXZJdGVtLmRpc2FibGVkKSA/IFtwcmV2SW5kZXgsIHByZXZJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRGaXJzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldE5leHRFbnRyeSgtMSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldExhc3RFbnRyeSAoKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcmV2aW91c0VudHJ5KHRoaXMuaXRlbXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYmluZEhvc3QgKCkge1xuXG4gICAgICAgIC8vIFRPRE86IGVuYWJsZSByZWNvbm5lY3RpbmcgdGhlIGhvc3QgZWxlbWVudD8gbm8gbmVlZCBpZiBGb2N1c01hbmFnZXIgaXMgY3JlYXRlZCBpbiBjb25uZWN0ZWRDYWxsYmFja1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBNYXAoW1xuICAgICAgICAgICAgWydmb2N1c2luJywgdGhpcy5oYW5kbGVGb2N1cy5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2Vkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2Rpc2Nvbm5lY3RlZCcsIHRoaXMudW5iaW5kSG9zdC5iaW5kKHRoaXMpXVxuICAgICAgICBdKTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1bmJpbmRIb3N0ICgpIHtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZvY3VzS2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgTGlzdEtleU1hbmFnZXI8VD4ge1xuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgc3VwZXIuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJdGVtICYmIGludGVyYWN0aXZlKSB0aGlzLmFjdGl2ZUl0ZW0uZm9jdXMoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50PEljb24+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWljb24nLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICB3aWR0aDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBwYWRkaW5nOiBjYWxjKCh2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pIC0gdmFyKC0tZm9udC1zaXplLCAxZW0pKSAvIDIpO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIH1cbiAgICBzdmcge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgICAgICAgZmlsbDogdmFyKC0taWNvbi1jb2xvciwgY3VycmVudENvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PXVuaV0pIHtcbiAgICAgICAgcGFkZGluZzogMGVtO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9bWF0XSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9ZWldKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBjb25zdCBzZXQgPSBlbGVtZW50LnNldDtcbiAgICAgICAgY29uc3QgaWNvbiA9IChzZXQgPT09ICdtYXQnKVxuICAgICAgICAgICAgPyBgaWNfJHsgZWxlbWVudC5pY29uIH1fMjRweGBcbiAgICAgICAgICAgIDogKHNldCA9PT0gJ2VpJylcbiAgICAgICAgICAgICAgICA/IGBlaS0keyBlbGVtZW50Lmljb24gfS1pY29uYFxuICAgICAgICAgICAgICAgIDogZWxlbWVudC5pY29uO1xuXG4gICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICA8c3ZnIGZvY3VzYWJsZT1cImZhbHNlXCI+XG4gICAgICAgICAgICA8dXNlIGhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIlxuICAgICAgICAgICAgeGxpbms6aHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiIC8+XG4gICAgICAgIDwvc3ZnPmA7XG4gICAgfVxufSlcbmV4cG9ydCBjbGFzcyBJY29uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIGZvciBjYWNoaW5nIGFuIGljb24gc2V0J3Mgc3ByaXRlIHVybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3Nwcml0ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHN2ZyBzcHJpdGUgdXJsIGZvciB0aGUgcmVxdWVzdGVkIGljb24gc2V0XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzcHJpdGUgdXJsIGZvciBhbiBpY29uIHNldCBjYW4gYmUgc2V0IHRocm91Z2ggYSBgbWV0YWAgdGFnIGluIHRoZSBodG1sIGRvY3VtZW50LiBZb3UgY2FuIGRlZmluZVxuICAgICAqIGN1c3RvbSBpY29uIHNldHMgYnkgY2hvc2luZyBhbiBpZGVudGlmaWVyIChzdWNoIGFzIGA6bXlzZXRgIGluc3RlYWQgb2YgYDpmYWAsIGA6bWF0YCBvciBgOmllYCkgYW5kXG4gICAgICogY29uZmlndXJpbmcgaXRzIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhZG9jdHlwZSBodG1sPlxuICAgICAqIDxodG1sPlxuICAgICAqICAgIDxoZWFkPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgbXVsdGlwbGUgc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpmYVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9mb250LWF3ZXNvbWUvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTptYXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvbWF0ZXJpYWwvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTplaVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL2V2aWwtaWNvbnMvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBjdXN0b20gc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpteXNldFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL215c2V0L215X3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwvaGVhZD5cbiAgICAgKiAgICAuLi5cbiAgICAgKiA8L2h0bWw+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBXaGVuIHVzaW5nIHRoZSBpY29uIGVsZW1lbnQsIHNwZWNpZnkgeW91ciBjdXN0b20gaWNvbiBzZXQuXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCEtLSB1c2UgYXR0cmlidXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiBkYXRhLWljb249XCJteV9pY29uX2lkXCIgZGF0YS1zZXQ9XCJteXNldFwiPjwvdWktaWNvbj5cbiAgICAgKiA8IS0tIG9yIHVzZSBwcm9wZXJ0eSBiaW5kaW5ncyB3aXRoaW4gbGl0LWh0bWwgdGVtcGxhdGVzIC0tPlxuICAgICAqIDx1aS1pY29uIC5pY29uPSR7J215X2ljb25faWQnfSAuc2V0PSR7J215c2V0J30+PC91aS1pY29uPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogSWYgbm8gc3ByaXRlIHVybCBpcyBzcGVjaWZpZWQgZm9yIGEgc2V0LCB0aGUgaWNvbiBlbGVtZW50IHdpbGwgYXR0ZW1wdCB0byB1c2UgYW4gc3ZnIGljb24gZnJvbVxuICAgICAqIGFuIGlubGluZWQgc3ZnIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBnZXRTcHJpdGUgKHNldDogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3Nwcml0ZXMuaGFzKHNldCkpIHtcblxuICAgICAgICAgICAgY29uc3QgbWV0YSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYG1ldGFbbmFtZT1cInVpLWljb246c3ByaXRlOiR7IHNldCB9XCJdW2NvbnRlbnRdYCk7XG5cbiAgICAgICAgICAgIGlmIChtZXRhKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVzLnNldChzZXQsIG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50JykhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zcHJpdGVzLmdldChzZXQpIHx8ICcnO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtaWNvbidcbiAgICB9KVxuICAgIGljb24gPSAnaW5mbyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLXNldCdcbiAgICB9KVxuICAgIHNldCA9ICdmYSdcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2ltZycpO1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgJy4uL2ljb24vaWNvbic7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcblxuQGNvbXBvbmVudDxBY2NvcmRpb25IZWFkZXI+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1oZWFkZXInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGFsbDogaW5oZXJpdDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIGZsZXg6IDEgMSAxMDAlO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWRpc2FibGVkPXRydWVdKSB7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9dHJ1ZV0pID4gdWktaWNvbi5leHBhbmQsXG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9ZmFsc2VdKSA+IHVpLWljb24uY29sbGFwc2Uge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8dWktaWNvbiBjbGFzcz1cImNvbGxhcHNlXCIgZGF0YS1pY29uPVwibWludXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICA8dWktaWNvbiBjbGFzcz1cImV4cGFuZFwiIGRhdGEtaWNvbj1cInBsdXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkhlYWRlciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5cbmV4cG9ydCB0eXBlIENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZykgPT4gVGVtcGxhdGVSZXN1bHQ7XG5cbmV4cG9ydCBjb25zdCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0ID0+IHtcblxuICAgIHJldHVybiBodG1sYCZjb3B5OyBDb3B5cmlnaHQgJHsgZGF0ZS5nZXRGdWxsWWVhcigpIH0gJHsgYXV0aG9yLnRyaW0oKSB9YDtcbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IGNvcHlyaWdodCwgQ29weXJpZ2h0SGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9jb3B5cmlnaHQnO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcblxubGV0IG5leHRBY2NvcmRpb25QYW5lbElkID0gMDtcblxuQGNvbXBvbmVudDxBY2NvcmRpb25QYW5lbD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24taGVhZGVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5IHtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgICBvdmVyZmxvdzogYXV0bztcbiAgICAgICAgdHJhbnNpdGlvbjogaGVpZ2h0IC4ycyBlYXNlLW91dDtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHlbYXJpYS1oaWRkZW49dHJ1ZV0ge1xuICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuICAgIC5jb3B5cmlnaHQge1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW0gMXJlbTtcbiAgICAgICAgY29sb3I6IHZhcigtLWRpc2FibGVkLWNvbG9yLCAnI2NjYycpO1xuICAgICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAocGFuZWwsIGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyKSA9PiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24taGVhZGVyXCJcbiAgICAgICAgcm9sZT1cImhlYWRpbmdcIlxuICAgICAgICBhcmlhLWxldmVsPVwiJHsgcGFuZWwubGV2ZWwgfVwiXG4gICAgICAgIEBjbGljaz0keyBwYW5lbC50b2dnbGUgfT5cbiAgICAgICAgPHNsb3QgbmFtZT1cImhlYWRlclwiPjwvc2xvdD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWJvZHlcIlxuICAgICAgICBpZD1cIiR7IHBhbmVsLmlkIH0tYm9keVwiXG4gICAgICAgIHN0eWxlPVwiaGVpZ2h0OiAkeyBwYW5lbC5jb250ZW50SGVpZ2h0IH07XCJcbiAgICAgICAgcm9sZT1cInJlZ2lvblwiXG4gICAgICAgIGFyaWEtaGlkZGVuPVwiJHsgIXBhbmVsLmV4cGFuZGVkIH1cIlxuICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCIkeyBwYW5lbC5pZCB9LWhlYWRlclwiPlxuICAgICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY29weXJpZ2h0XCI+JHsgY29weXJpZ2h0KG5ldyBEYXRlKCksICdBbGV4YW5kZXIgV2VuZGUnKSB9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIF9oZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwgPSBudWxsO1xuICAgIHByb3RlY3RlZCBfYm9keTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIHByb3RlY3RlZCBnZXQgY29udGVudEhlaWdodCAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gIXRoaXMuZXhwYW5kZWQgP1xuICAgICAgICAgICAgJzBweCcgOlxuICAgICAgICAgICAgdGhpcy5fYm9keSA/XG4gICAgICAgICAgICAgICAgYCR7IHRoaXMuX2JvZHkuc2Nyb2xsSGVpZ2h0IH1weGAgOlxuICAgICAgICAgICAgICAgICdhdXRvJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgbGV2ZWwgPSAxO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IgKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgYHVpLWFjY29yZGlvbi1wYW5lbC0keyBuZXh0QWNjb3JkaW9uUGFuZWxJZCsrIH1gO1xuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICAvLyB3cmFwcGluZyB0aGUgcHJvcGVydHkgY2hhbmdlIGluIHRoZSB3YXRjaCBtZXRob2Qgd2lsbCBkaXNwYXRjaCBhIHByb3BlcnR5IGNoYW5nZSBldmVudFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hlYWRlcikgdGhpcy5faGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRIZWFkZXIodGhpcy5xdWVyeVNlbGVjdG9yKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlLCB3ZSBxdWVyeSB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHlcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcihgIyR7IHRoaXMuaWQgfS1ib2R5YCk7XG5cbiAgICAgICAgICAgIC8vIGhhdmluZyBxdWVyaWVkIHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keSwge0BsaW5rIGNvbnRlbnRIZWlnaHR9IGNhbiBub3cgY2FsY3VsYXRlIHRoZVxuICAgICAgICAgICAgLy8gY29ycmVjdCBoZWlnaHQgb2YgdGhlIHBhbmVsIGJvZHkgZm9yIGFuaW1hdGlvblxuICAgICAgICAgICAgLy8gaW4gb3JkZXIgdG8gcmUtZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGJpbmRpbmcgZm9yIHtAbGluayBjb250ZW50SGVpZ2h0fSB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIGFub3RoZXIgcmVuZGVyICh0aGlzIGlzIGNoZWFwLCBvbmx5IGNvbnRlbnRIZWlnaHQgaGFzIGNoYW5nZWQgYW5kIHdpbGwgYmUgdXBkYXRlZClcbiAgICAgICAgICAgIC8vIGhvd2V2ZXIgd2UgY2Fubm90IHJlcXVlc3QgYW5vdGhlciB1cGRhdGUgd2hpbGUgd2UgYXJlIHN0aWxsIGluIHRoZSBjdXJyZW50IHVwZGF0ZSBjeWNsZVxuICAgICAgICAgICAgLy8gdXNpbmcgYSBQcm9taXNlLCB3ZSBjYW4gZGVmZXIgcmVxdWVzdGluZyB0aGUgdXBkYXRlIHVudGlsIGFmdGVyIHRoZSBjdXJyZW50IHVwZGF0ZSBpcyBkb25lXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodHJ1ZSkudGhlbigoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgcmVuZGVyIG1ldGhvZCB0byBpbmplY3QgY3VzdG9tIGhlbHBlcnMgaW50byB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICgpIHtcblxuICAgICAgICBzdXBlci5yZW5kZXIoY29weXJpZ2h0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0SGVhZGVyIChoZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwpIHtcblxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBoZWFkZXI7XG5cbiAgICAgICAgaWYgKCFoZWFkZXIpIHJldHVybjtcblxuICAgICAgICBoZWFkZXIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2hlYWRlcicpO1xuXG4gICAgICAgIGhlYWRlci5pZCA9IGhlYWRlci5pZCB8fCBgJHsgdGhpcy5pZCB9LWhlYWRlcmA7XG4gICAgICAgIGhlYWRlci5jb250cm9scyA9IGAkeyB0aGlzLmlkIH0tYm9keWA7XG4gICAgICAgIGhlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIGhlYWRlci5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCAnLi9hY2NvcmRpb24tcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPEFjY29yZGlvbkhlYWRlcj47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICByZWZsZWN0QXR0cmlidXRlOiBmYWxzZVxuICAgIH0pXG4gICAgcm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBjc3MgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gY3NzYFxuZGVtby1hcHAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuXG5oZWFkZXIge1xuICBmbGV4OiAwIDAgYXV0bztcbn1cblxubWFpbiB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBwYWRkaW5nOiAxcmVtO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBvdmVyZmxvdzogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgxNXJlbSwgMWZyKSk7XG4gIGdyaWQtZ2FwOiAxcmVtO1xufVxuXG4uaWNvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWZsb3c6IHJvdyB3cmFwO1xufVxuXG4uc2V0dGluZ3MtbGlzdCB7XG4gIHBhZGRpbmc6IDA7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5zZXR0aW5ncy1saXN0IGxpIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuXG51aS1jYXJkIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbiB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWw6bm90KDpmaXJzdC1jaGlsZCkge1xuICBib3JkZXItdG9wOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBoMyB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIHAge1xuICBtYXJnaW46IDFyZW07XG59XG5gO1xuIiwiaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vYXBwJztcblxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlID0gKGVsZW1lbnQ6IEFwcCkgPT4gaHRtbGBcbiAgICA8aGVhZGVyPlxuICAgICAgICA8aDE+RXhhbXBsZXM8L2gxPlxuICAgIDwvaGVhZGVyPlxuXG4gICAgPG1haW4+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5JY29uPC9oMj5cblxuICAgICAgICAgICAgPGgzPkZvbnQgQXdlc29tZTwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jay1vcGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFpbnQtYnJ1c2gnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24tdHJpYW5nbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPlVuaWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYW5nbGUtcmlnaHQtYicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZS1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPk1hdGVyaWFsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb25fcmlnaHQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbWFpbCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2tfb3BlbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlZGl0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2RlbGV0ZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd3YXJuaW5nJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaGVscCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhY2NvdW50X2NpcmNsZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZXJzb24nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5FdmlsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYXBlcmNsaXAnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW5jaWwnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgyPkNoZWNrYm94PC9oMj5cbiAgICAgICAgICAgIDx1aS1jaGVja2JveCAuY2hlY2tlZD0keyB0cnVlIH0+PC91aS1jaGVja2JveD5cblxuICAgICAgICAgICAgPGgyPlRvZ2dsZTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1lbWFpbFwiPk5vdGlmaWNhdGlvbiBlbWFpbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LWVtYWlsXCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1zbXNcIj5Ob3RpZmljYXRpb24gc21zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktc21zXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeVwiPk5vdGlmaWNhdGlvbnM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5XCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkNhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktY2FyZD5cblxuICAgICAgICAgICAgPGgyPkFjdGlvbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1hY3Rpb24tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBzbG90PVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPk1vcmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvdWktYWN0aW9uLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5QbGFpbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1wbGFpbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLXBsYWluLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5UYWJzPC9oMj5cbiAgICAgICAgICAgIDx1aS10YWItbGlzdD5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTFcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTFcIj48c3Bhbj5GaXJzdCBUYWI8L3NwYW4+PC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0yXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0yXCI+U2Vjb25kIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItM1wiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtM1wiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+VGhpcmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi00XCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC00XCI+Rm91cnRoIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgPC91aS10YWItbGlzdD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMVwiPlxuICAgICAgICAgICAgICAgIDxoMz5GaXJzdCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0yXCI+XG4gICAgICAgICAgICAgICAgPGgzPlNlY29uZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSwgZHVvXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWUgY2V0ZXJvc1xuICAgICAgICAgICAgICAgICAgICBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW4gZXN0LCBldCBhdXRlbVxuICAgICAgICAgICAgICAgICAgICBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpIG5hbS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtM1wiPlxuICAgICAgICAgICAgICAgIDxoMz5UaGlyZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkknbSBkaXNhYmxlZCwgeW91IHNob3VsZG4ndCBzZWUgbWUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTRcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rm91cnRoIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+QWNjb3JkaW9uPC9oMj5cblxuICAgICAgICAgICAgPHVpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgaWQ9XCJjdXN0b20tcGFuZWwtaWRcIiBleHBhbmRlZCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBPbmU8L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICBMYXVkZW0gY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3Ryb1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXNhYm8gYW4gZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPkF0IHVzdSBlcGljdXJlaSBhc3NlbnRpb3IsIHB1dGVudCBkaXNzZW50aWV0IHJlcHVkaWFuZGFlIGVhIHF1by4gUHJvIG5lIGRlYml0aXMgcGxhY2VyYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25pZmVydW1xdWUsIGluIHNvbmV0IHZvbHVtdXMgaW50ZXJwcmV0YXJpcyBjdW0uIERvbG9ydW0gYXBwZXRlcmUgbmUgcXVvLiBEaWN0YSBxdWFsaXNxdWUgZW9zXG4gICAgICAgICAgICAgICAgICAgICAgICBlYSwgZWFtIGF0IG51bGxhIHRhbXF1YW0uXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBUd288L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVvIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNldGVyb3MgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuXG4gICAgICAgICAgICAgICAgICAgICAgICBlc3QsIGV0IGF1dGVtIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPlF1aSBzdWFzIHNvbGV0IGNldGVyb3MgY3UsIHBlcnRpbmF4IHZ1bHB1dGF0ZSBkZXRlcnJ1aXNzZXQgZW9zIG5lLiBOZSBpdXMgdmlkZSBudWxsYW0sIGFsaWVudW1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFlIHJlZm9ybWlkYW5zIGN1bSBhZC4gRWEgbWVsaW9yZSBzYXBpZW50ZW0gaW50ZXJwcmV0YXJpcyBlYW0uIENvbW11bmUgZGVsaWNhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHVkaWFuZGFlIGluIGVvcywgcGxhY2VyYXQgaW5jb3JydXB0ZSBkZWZpbml0aW9uZXMgbmVjIGV4LiBDdSBlbGl0ciB0YW50YXMgaW5zdHJ1Y3Rpb3Igc2l0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXUgZXVtIGFsaWEgZ3JhZWNlIG5lZ2xlZ2VudHVyLjwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICA8L3VpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgPGgyPlBvcG92ZXI8L2gyPlxuXG4gICAgICAgICAgICA8b3ZlcmxheS1kZW1vPjwvb3ZlcmxheS1kZW1vPlxuICAgICAgICA8L2Rpdj5cblxuICAgIDwvbWFpbj5cbiAgICBgO1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbi8vIHdlIGNhbiBkZWZpbmUgbWl4aW5zIGFzXG5jb25zdCBtaXhpbkNvbnRhaW5lcjogKGJhY2tncm91bmQ/OiBzdHJpbmcpID0+IHN0cmluZyA9IChiYWNrZ3JvdW5kOiBzdHJpbmcgPSAnI2ZmZicpID0+IGNzc2BcbiAgICBiYWNrZ3JvdW5kOiAkeyBiYWNrZ3JvdW5kIH07XG4gICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG5gO1xuXG5jb25zdCBzdHlsZSA9IGNzc2Bcbjpob3N0IHtcbiAgICAtLW1heC13aWR0aDogNDBjaDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZmxvdzogY29sdW1uO1xuICAgIG1heC13aWR0aDogdmFyKC0tbWF4LXdpZHRoKTtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICAgIC8qIHdlIGNhbiBhcHBseSBtaXhpbnMgd2l0aCBzcHJlYWQgc3ludGF4ICovXG4gICAgJHsgbWl4aW5Db250YWluZXIoKSB9XG59XG46OnNsb3R0ZWQoKikge1xuICAgIG1hcmdpbjogMDtcbn1cbmA7XG5cbkBjb21wb25lbnQ8Q2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2FyZCcsXG4gICAgc3R5bGVzOiBbc3R5bGVdLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1jYXJkLWJvZHlcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtZm9vdGVyXCI+PC9zbG90PlxuICAgIDxkaXY+V29ya2VyIGNvdW50ZXI6ICR7IGNhcmQuY291bnRlciB9PC9kaXY+XG4gICAgPGJ1dHRvbj5TdG9wIHdvcmtlcjwvYnV0dG9uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyITogbnVtYmVyO1xuXG4gICAgd29ya2VyITogV29ya2VyO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJykhOyB9XG4gICAgfSlcbiAgICBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ21lc3NhZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud29ya2VyOyB9XG4gICAgfSlcbiAgICBoYW5kbGVNZXNzYWdlIChldmVudDogTWVzc2FnZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNvdW50ZXIgPSBldmVudC5kYXRhKTtcbiAgICB9XG59XG5cbkBjb21wb25lbnQ8QWN0aW9uQ2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWN0aW9uLWNhcmQnLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjdGlvbkNhcmQgZXh0ZW5kcyBDYXJkIHtcblxuICAgIC8vIHdlIGNhbiBpbmhlcml0IHN0eWxlcyBleHBsaWNpdGx5XG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAgICAgICAgJ3Nsb3RbbmFtZT11aS1hY3Rpb24tY2FyZC1hY3Rpb25zXSB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiByaWdodDsgfSdcbiAgICAgICAgXVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlQ2xpY2sgKCkgeyB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogbnVsbCB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKCkgeyB9XG59XG5cbkBjb21wb25lbnQ8UGxhaW5DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1wbGFpbi1jYXJkJyxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgbWF4LXdpZHRoOiA0MGNoO1xuICAgICAgICB9YFxuICAgIF1cbiAgICAvLyBpZiB3ZSBkb24ndCBzcGVjaWZ5IGEgdGVtcGxhdGUsIGl0IHdpbGwgYmUgaW5oZXJpdGVkXG59KVxuZXhwb3J0IGNsYXNzIFBsYWluQ2FyZCBleHRlbmRzIENhcmQgeyB9XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBjb21wb25lbnQsIENvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8Q2hlY2tib3g+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWNoZWNrYm94JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgICAgICB3aWR0aDogMXJlbTtcbiAgICAgICAgICAgIGhlaWdodDogMXJlbTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgICAgICAgICAgYm94LXNpemluZzogY29udGVudC1ib3g7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAuMXMgZWFzZS1pbjtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgI2JmYmZiZik7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgI2JmYmZiZik7XG4gICAgICAgIH1cbiAgICAgICAgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwLjI1cmVtO1xuICAgICAgICAgICAgbGVmdDogMC4xMjVyZW07XG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiAwLjYyNXJlbTtcbiAgICAgICAgICAgIGhlaWdodDogMC4yNXJlbTtcbiAgICAgICAgICAgIGJvcmRlcjogc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IDAgMCB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKTtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC00NWRlZyk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAuMXMgZWFzZS1pbjtcbiAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl0pIC5jaGVjay1tYXJrIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogY2hlY2tib3ggPT4gaHRtbGBcbiAgICA8c3BhbiBjbGFzcz1cImNoZWNrLW1hcmtcIj48L3NwYW4+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDaGVja2JveCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvLyBDaHJvbWUgYWxyZWFkeSByZWZsZWN0cyBhcmlhIHByb3BlcnRpZXMsIGJ1dCBGaXJlZm94IGRvZXNuJ3QsIHNvIHdlIG5lZWQgYSBwcm9wZXJ0eSBkZWNvcmF0b3JcbiAgICAvLyBob3dldmVyLCB3ZSBjYW5ub3QgaW5pdGlhbGl6ZSByb2xlIHdpdGggYSB2YWx1ZSBoZXJlLCBhcyBDaHJvbWUncyByZWZsZWN0aW9uIHdpbGwgY2F1c2UgYW5cbiAgICAvLyBhdHRyaWJ1dGUgY2hhbmdlIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgdGhhdCB3aWxsIHRocm93IGFuIGVycm9yXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3czYy9hcmlhL2lzc3Vlcy82OTFcbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHk8Q2hlY2tib3g+KHtcbiAgICAgICAgLy8gdGhlIGNvbnZlcnRlciB3aWxsIGJlIHVzZWQgdG8gcmVmbGVjdCBmcm9tIHRoZSBjaGVja2VkIGF0dHJpYnV0ZSB0byB0aGUgcHJvcGVydHksIGJ1dCBub3RcbiAgICAgICAgLy8gdGhlIG90aGVyIHdheSBhcm91bmQsIGFzIHdlIGRlZmluZSBhIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbixcbiAgICAgICAgLy8gd2UgY2FuIHVzZSBhIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gdG8gcmVmbGVjdCB0byBtdWx0aXBsZSBhdHRyaWJ1dGVzIGluIGRpZmZlcmVudCB3YXlzXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZnVuY3Rpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJycpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2tleWRvd24nXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIC8vIFRPRE86IERvY3VtZW50IHRoaXMgdXNlIGNhc2UhXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2N1c3RvbS1lbGVtZW50cy5odG1sI2N1c3RvbS1lbGVtZW50LWNvbmZvcm1hbmNlXG4gICAgICAgIC8vIEhUTUxFbGVtZW50IGhhcyBhIHNldHRlciBhbmQgZ2V0dGVyIGZvciB0YWJJbmRleCwgd2UgZG9uJ3QgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvciB0byByZWZsZWN0IGl0XG4gICAgICAgIC8vIHdlIGFyZSBub3QgYWxsb3dlZCB0byBzZXQgaXQgaW4gdGhlIGNvbnN0cnVjdG9yIHRob3VnaCwgYXMgaXQgY3JlYXRlcyBhIHJlZmxlY3RlZCBhdHRyaWJ1dGUsIHdoaWNoXG4gICAgICAgIC8vIGNhdXNlcyBhbiBlcnJvclxuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcblxuICAgICAgICAvLyB3ZSBpbml0aWFsaXplIHJvbGUgaW4gdGhlIGNvbm5lY3RlZENhbGxiYWNrIGFzIHdlbGwsIHRvIHByZXZlbnQgQ2hyb21lIGZyb20gcmVmbGVjdGluZyBlYXJseVxuICAgICAgICB0aGlzLnJvbGUgPSAnY2hlY2tib3gnO1xuICAgIH1cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgRXZlbnRCaW5kaW5nIHtcbiAgICByZWFkb25seSB0YXJnZXQ6IEV2ZW50VGFyZ2V0O1xuICAgIHJlYWRvbmx5IHR5cGU6IHN0cmluZztcbiAgICByZWFkb25seSBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGw7XG4gICAgcmVhZG9ubHkgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXZlbnRCaW5kaW5nIChiaW5kaW5nOiBhbnkpOiBiaW5kaW5nIGlzIEV2ZW50QmluZGluZyB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGJpbmRpbmcgPT09ICdvYmplY3QnXG4gICAgICAgICYmIHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLnRhcmdldCA9PT0gJ29iamVjdCdcbiAgICAgICAgJiYgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykudHlwZSA9PT0gJ3N0cmluZydcbiAgICAgICAgJiYgKHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICB8fCB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS5saXN0ZW5lciA9PT0gJ29iamVjdCcpO1xufVxuXG4vKipcbiAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuIHtcblxuICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICBkZXRhaWxcbiAgICB9KSk7XG59XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgbWFuYWdpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgRXZlbnRNYW5hZ2VyIGNsYXNzIGNhbiBiZSB1c2VkIHRvIGhhbmRsZSBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgb24gbXVsdGlwbGUgdGFyZ2V0cy4gSXQgY2FjaGVzIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAqIGFuZCBjYW4gcmVtb3ZlIHRoZW0gc2VwYXJhdGVseSBvciBhbGwgdG9nZXRoZXIuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGV2ZW50IGxpc3RlbmVycyBuZWVkIHRvIGJlIGFkZGVkIGFuZCByZW1vdmVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIGEgY29tcG9uZW50IGFuZCBtYWtlcyBtYW51YWxseSBzYXZpbmcgcmVmZXJlbmNlcyB0byB0YXJnZXRzLCBsaXN0ZW5lcnMgYW5kIG9wdGlvbnMgdW5uZWNlc3NhcnkuXG4gKlxuICogYGBgdHNcbiAqICAvLyBjcmVhdGUgYW4gRXZlbnRNYW5hZ2VyIGluc3RhbmNlXG4gKiAgY29uc3QgbWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcbiAqXG4gKiAgLy8geW91IGNhbiBzYXZlIGEgcmVmZXJlbmNlIChhbiBFdmVudEJpbmRpbmcpIHRvIHRoZSBhZGRlZCBldmVudCBsaXN0ZW5lciBpZiB5b3UgbmVlZCB0byBtYW51YWxseSByZW1vdmUgaXQgbGF0ZXJcbiAqICBjb25zdCBiaW5kaW5nID0gbWFuYWdlci5saXN0ZW4oZG9jdW1lbnQsICdzY3JvbGwnLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8gLi4ub3IgaWdub3JlIHRoZSByZWZlcmVuY2UgaWYgeW91IGRvbid0IG5lZWQgaXRcbiAqICBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudC5ib2R5LCAnY2xpY2snLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8geW91IGNhbiByZW1vdmUgYSBzcGVjaWZpYyBldmVudCBsaXN0ZW5lciB1c2luZyBhIHJlZmVyZW5jZVxuICogIG1hbmFnZXIudW5saXN0ZW4oYmluZGluZyk7XG4gKlxuICogIC8vIC4uLm9yIHJlbW92ZSBhbGwgcHJldmlvdXNseSBhZGRlZCBldmVudCBsaXN0ZW5lcnMgaW4gb25lIGdvXG4gKiAgbWFuYWdlci51bmxpc3RlbkFsbCgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG4gICAgcHJvdGVjdGVkIGJpbmRpbmdzID0gbmV3IFNldDxFdmVudEJpbmRpbmc+KCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYW4gRXZlbnRCaW5kaW5nIGV4aXN0cyB0aGF0IG1hdGNoZXMgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICovXG4gICAgaGFzQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGhhc0JpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbjtcblxuICAgIGhhc0JpbmRpbmcgKFxuICAgICAgICB0YXJnZXRPckJpbmRpbmc6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIChpc0V2ZW50QmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA/IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nKVxuICAgICAgICAgICAgOiB0aGlzLmZpbmRCaW5kaW5nKHRhcmdldE9yQmluZGluZywgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucykpICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBmaW5kQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIGZpbmRCaW5kaW5nIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgbGV0IHNlYXJjaEJpbmRpbmc6IEV2ZW50QmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldCkgPyBiaW5kaW5nT3JUYXJnZXQgOiB0aGlzLmNyZWF0ZUJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBsZXQgZm91bmRCaW5kaW5nOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYmluZGluZ3MuaGFzKHNlYXJjaEJpbmRpbmcpKSByZXR1cm4gc2VhcmNoQmluZGluZztcblxuICAgICAgICBmb3IgKGxldCBiaW5kaW5nIG9mIHRoaXMuYmluZGluZ3MudmFsdWVzKCkpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZUJpbmRpbmdzKHNlYXJjaEJpbmRpbmcsIGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgICAgICBmb3VuZEJpbmRpbmcgPSBiaW5kaW5nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kQmluZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0IG9mIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyBhZGRlZCBvciB1bmRlZmluZWQgYSBtYXRjaGluZyBldmVudCBiaW5kaW5nIGFscmVhZHkgZXhpc3RzXG4gICAgICovXG4gICAgbGlzdGVuIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgbGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gYmluZGluZ09yVGFyZ2V0XG4gICAgICAgICAgICA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNCaW5kaW5nKGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFkZChiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lciBmcm9tIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyByZW1vdmVkIG9yIHVuZGVmaW5lZCBpZiBubyBtYXRjaGluZyBldmVudCBiaW5kaW5nIGV4aXN0c1xuICAgICAqL1xuICAgIHVubGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbik6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIHVubGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhblxuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoYmluZGluZykge1xuXG4gICAgICAgICAgICBiaW5kaW5nLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGJpbmRpbmcudHlwZSwgYmluZGluZy5saXN0ZW5lciwgYmluZGluZy5vcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5kZWxldGUoYmluZGluZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlaXIgdGFyZ2V0c1xuICAgICAqL1xuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLmJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB0aGlzLnVubGlzdGVuKGJpbmRpbmcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIGFuIEV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gICAgICovXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcblxuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ6IFBhcnRpYWw8RXZlbnRJbml0PiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGV2ZW50T3JUeXBlIGluc3RhbmNlb2YgRXZlbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50T3JUeXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnRPclR5cGUhLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICAgICAgZGV0YWlsXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdFxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byB7QGxpbmsgRXZlbnRCaW5kaW5nfSBvYmplY3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGJpbmRpbmcgb2JqZWN0cyBoYXZlIHRoZSBzYW1lIHRhcmdldCwgdHlwZSBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbXBhcmVCaW5kaW5ncyAoYmluZGluZzogRXZlbnRCaW5kaW5nLCBvdGhlcjogRXZlbnRCaW5kaW5nKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGJpbmRpbmcgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gYmluZGluZy50YXJnZXQgPT09IG90aGVyLnRhcmdldFxuICAgICAgICAgICAgJiYgYmluZGluZy50eXBlID09PSBvdGhlci50eXBlXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVMaXN0ZW5lcnMoYmluZGluZy5saXN0ZW5lciwgb3RoZXIubGlzdGVuZXIpXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVPcHRpb25zKGJpbmRpbmcub3B0aW9ucywgb3RoZXIub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUxpc3RlbmVycyAobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvdGhlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggbGlzdGVuZXJzIGJlaW5nIG51bGwsIGEgZnVuY3Rpb24gb3IgdGhlIHNhbWUgRXZlbnRMaXN0ZW5lck9iamVjdFxuICAgICAgICBpZiAobGlzdGVuZXIgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBjb21wYXJlcyB0aGUgaGFuZGxlcnMgb2YgdHdvIEV2ZW50TGlzdGVuZXJPYmplY3RzXG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChsaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudCA9PT0gKG90aGVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBldmVudCBsaXN0ZW5lciBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9wdGlvbnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZU9wdGlvbnMgKG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsIG90aGVyPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbiB7XG5cbiAgICAgICAgLy8gY2F0Y2hlcyBib3RoIG9wdGlvbnMgYmVpbmcgdW5kZWZpbmVkIG9yIHNhbWUgYm9vbGVhbiB2YWx1ZVxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHR3byBvcHRpb25zIG9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb3RoZXIgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNhcHR1cmUgPT09IG90aGVyLmNhcHR1cmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLnBhc3NpdmUgPT09IG90aGVyLnBhc3NpdmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLm9uY2UgPT09IG90aGVyLm9uY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIElER2VuZXJhdG9yIHtcblxuICAgIHByaXZhdGUgX25leHQgPSAwO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJlZml4IC0gQW4gb3B0aW9uYWwgcHJlZml4IGZvciB0aGUgZ2VuZXJhdGVkIElEIGluY2x1ZGluZyBhbiBvcHRpb25hbCBzZXBhcmF0b3IsIGUuZy46IGAnbXktcHJlZml4LScgb3IgJ3ByZWZpeC0tJyBvciAncHJlZml4Xycgb3IgJ3ByZWZpeGBcbiAgICAgKiBAcGFyYW0gc3VmZml4IC0gQW4gb3B0aW9uYWwgc3VmZml4IGZvciB0aGUgZ2VuZXJhdGVkIElEIGluY2x1ZGluZyBhbiBvcHRpb25hbCBzZXBhcmF0b3IsIGUuZy46IGAnLW15LXN1ZmZpeCcgb3IgJy0tc3VmZml4JyBvciAnX3N1ZmZpeCcgb3IgJ3N1ZmZpeGBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHByZWZpeDogc3RyaW5nID0gJycsIHB1YmxpYyBzdWZmaXg6IHN0cmluZyA9ICcnKSB7IH1cblxuICAgIGdldE5leHRJRCAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gYCR7IHRoaXMucHJlZml4IH0keyB0aGlzLl9uZXh0KysgfSR7IHRoaXMuc3VmZml4IH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEV2ZW50QmluZGluZywgRXZlbnRNYW5hZ2VyIH0gZnJvbSBcIi4vZXZlbnQtbWFuYWdlclwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIF9hdHRhY2hlZCA9IGZhbHNlO1xuXG4gICAgcHJvdGVjdGVkIF9lbGVtZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBldmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKCk7XG5cbiAgICBnZXQgaGFzQXR0YWNoZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9hdHRhY2hlZDtcbiAgICB9XG5cbiAgICBnZXQgZWxlbWVudCAoKTogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudD86IEhUTUxFbGVtZW50LCAuLi5hcmdzOiBhbnlbXSkge1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKC4uLmFyZ3M6IGFueVtdKSB7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIudW5saXN0ZW5BbGwoKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICB1bmxpc3RlbiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9ucyB8IGJvb2xlYW4pOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50TWFuYWdlci51bmxpc3Rlbih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCAoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaDxUID0gYW55PiAodHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuO1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+IChldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiB0aGlzLmVsZW1lbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChldmVudE9yVHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5ldmVudE1hbmFnZXIuZGlzcGF0Y2godGhpcy5lbGVtZW50LCBldmVudE9yVHlwZSlcbiAgICAgICAgICAgICAgICA6IHRoaXMuZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKHRoaXMuZWxlbWVudCwgZXZlbnRPclR5cGUhLCBkZXRhaWwsIGV2ZW50SW5pdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tIFwiLi4vYmVoYXZpb3JcIjtcblxuZXhwb3J0IGludGVyZmFjZSBGb2N1c0NoYW5nZUV2ZW50RGV0YWlsIHtcbiAgICB0eXBlOiAnZm9jdXNpbicgfCAnZm9jdXNvdXQnO1xuICAgIGV2ZW50OiBGb2N1c0V2ZW50O1xufVxuXG5leHBvcnQgdHlwZSBGb2N1c0NoYW5nZUV2ZW50ID0gQ3VzdG9tRXZlbnQ8Rm9jdXNDaGFuZ2VFdmVudERldGFpbD47XG5cbmV4cG9ydCBjbGFzcyBGb2N1c01vbml0b3IgZXh0ZW5kcyBCZWhhdmlvciB7XG5cbiAgICBoYXNGb2N1cyA9IGZhbHNlO1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuXG4gICAgICAgIHN1cGVyLmF0dGFjaChlbGVtZW50KTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXNpbicsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNJbihldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdmb2N1c291dCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNPdXQoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0luIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLmhhc0ZvY3VzID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPignZm9jdXMtY2hhbmdlZCcsIHsgdHlwZTogJ2ZvY3VzaW4nLCBldmVudDogZXZlbnQgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNPdXQgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgLy8gaWYgdGhlIHJlbGF0ZWRUYXJnZXQgKHRoZSBlbGVtZW50IHdoaWNoIHdpbGwgcmVjZWl2ZSB0aGUgZm9jdXMgbmV4dCkgaXMgd2l0aGluIHRoZSBtb25pdG9yZWQgZWxlbWVudCxcbiAgICAgICAgLy8gd2UgY2FuIGlnbm9yZSB0aGlzIGV2ZW50OyBpdCB3aWxsIGV2ZW50dWFsbHkgYmUgaGFuZGxlZCBhcyBmb2N1c2luIGV2ZW50IG9mIHRoZSByZWxhdGVkVGFyZ2V0XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnQhID09PSBldmVudC5yZWxhdGVkVGFyZ2V0IHx8IHRoaXMuZWxlbWVudCEuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBOb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0ZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPignZm9jdXMtY2hhbmdlZCcsIHsgdHlwZTogJ2ZvY3Vzb3V0JywgZXZlbnQ6IGV2ZW50IH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ1NTU2VsZWN0b3IgfSBmcm9tICcuLi9kb20nO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBGb2N1c01vbml0b3IgfSBmcm9tICcuL2ZvY3VzLW1vbml0b3InO1xuXG5leHBvcnQgY29uc3QgVEFCQkFCTEVTID0gW1xuICAgICdhW2hyZWZdOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnYXJlYVtocmVmXTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ2lucHV0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnc2VsZWN0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAndGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdpZnJhbWU6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdbY29udGVudEVkaXRhYmxlXTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleF49XCItXCJdKScsXG5dO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzVHJhcENvbmZpZyB7XG4gICAgdGFiYmFibGVTZWxlY3RvcjogQ1NTU2VsZWN0b3I7XG4gICAgd3JhcEZvY3VzOiBib29sZWFuO1xuICAgIGF1dG9Gb2N1czogYm9vbGVhbjtcbiAgICByZXN0b3JlRm9jdXM6IGJvb2xlYW47XG4gICAgaW5pdGlhbEZvY3VzPzogQ1NTU2VsZWN0b3I7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHOiBGb2N1c1RyYXBDb25maWcgPSB7XG4gICAgdGFiYmFibGVTZWxlY3RvcjogVEFCQkFCTEVTLmpvaW4oJywnKSxcbiAgICB3cmFwRm9jdXM6IHRydWUsXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxuICAgIHJlc3RvcmVGb2N1czogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBGb2N1c1RyYXAgZXh0ZW5kcyBGb2N1c01vbml0b3Ige1xuXG4gICAgcHJvdGVjdGVkIHRhYmJhYmxlcyE6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+O1xuXG4gICAgcHJvdGVjdGVkIHN0YXJ0ITogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgZW5kITogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlnOiBGb2N1c1RyYXBDb25maWc7XG5cbiAgICBjb25zdHJ1Y3RvciAoY29uZmlnPzogUGFydGlhbDxGb2N1c1RyYXBDb25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgfVxuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuXG4gICAgICAgIHN1cGVyLmF0dGFjaChlbGVtZW50KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c0luaXRpYWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdrZXlkb3duJywgKChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KSkgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICBzdXBlci5kZXRhY2goKTtcbiAgICB9XG5cbiAgICBmb2N1c0luaXRpYWwgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5pbml0aWFsRm9jdXMpIHtcblxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbEZvY3VzID0gdGhpcy5lbGVtZW50IS5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50Pih0aGlzLmNvbmZpZy5pbml0aWFsRm9jdXMpO1xuXG4gICAgICAgICAgICBpZiAoaW5pdGlhbEZvY3VzKSB7XG5cbiAgICAgICAgICAgICAgICBpbml0aWFsRm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvY3VzVHJhcCBjb3VsZCBub3QgZmluZCBpbml0aWFsRm9jdXMgZWxlbWVudCBzZWxlY3RvciAkeyB0aGlzLmNvbmZpZy5pbml0aWFsRm9jdXMgfS4gUG9zc2libGUgZXJyb3IgaW4gRm9jdXNUcmFwQ29uZmlnLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb2N1c0ZpcnN0KCk7XG4gICAgfVxuXG4gICAgZm9jdXNGaXJzdCAoKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydC5mb2N1cygpO1xuICAgIH1cblxuICAgIGZvY3VzTGFzdCAoKSB7XG5cbiAgICAgICAgdGhpcy5lbmQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUgKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMudGFiYmFibGVzID0gdGhpcy5lbGVtZW50IS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuY29uZmlnLnRhYmJhYmxlU2VsZWN0b3IpO1xuXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMudGFiYmFibGVzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLnN0YXJ0ID0gbGVuZ3RoXG4gICAgICAgICAgICA/IHRoaXMudGFiYmFibGVzLml0ZW0oMClcbiAgICAgICAgICAgIDogdGhpcy5lbGVtZW50ITtcblxuICAgICAgICB0aGlzLmVuZCA9IGxlbmd0aFxuICAgICAgICAgICAgPyB0aGlzLnRhYmJhYmxlcy5pdGVtKGxlbmd0aCAtIDEpXG4gICAgICAgICAgICA6IHRoaXMuZWxlbWVudCE7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBUYWI6XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZXZlbnQudGFyZ2V0ID09PSB0aGlzLnN0YXJ0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcud3JhcEZvY3VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzTGFzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFldmVudC5zaGlmdEtleSAmJiBldmVudC50YXJnZXQgPT09IHRoaXMuZW5kKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcud3JhcEZvY3VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzRmlyc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEZvY3VzVHJhcENvbmZpZywgREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRyB9IGZyb20gJy4uL2ZvY3VzLXRyYXAnO1xuXG5leHBvcnQgdHlwZSBPdmVybGF5Q29udHJvbGxlckNvbmZpZyA9IEZvY3VzVHJhcENvbmZpZyAmIHtcbiAgICBhdXRvRm9jdXM6IGJvb2xlYW47XG4gICAgdHJhcEZvY3VzOiBib29sZWFuO1xuICAgIHJlc3RvcmVGb2N1czogYm9vbGVhbjtcbiAgICBjbG9zZU9uRXNjYXBlOiBib29sZWFuO1xuICAgIGNsb3NlT25Gb2N1c0xvc3M6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHOiBPdmVybGF5Q29udHJvbGxlckNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLFxuICAgIGF1dG9Gb2N1czogdHJ1ZSxcbiAgICB0cmFwRm9jdXM6IHRydWUsXG4gICAgcmVzdG9yZUZvY3VzOiB0cnVlLFxuICAgIGNsb3NlT25Fc2NhcGU6IHRydWUsXG4gICAgY2xvc2VPbkZvY3VzTG9zczogdHJ1ZSxcbn07XG4iLCJleHBvcnQgaW50ZXJmYWNlIE9mZnNldCB7XG4gICAgaG9yaXpvbnRhbDogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHZlcnRpY2FsOiBzdHJpbmcgfCBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPZmZzZXRDaGFuZ2VkIChvZmZzZXQ/OiBPZmZzZXQsIG90aGVyPzogT2Zmc2V0KTogYm9vbGVhbiB7XG5cbiAgICBpZiAob2Zmc2V0ICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIG9mZnNldC5ob3Jpem9udGFsICE9PSBvdGhlci5ob3Jpem9udGFsXG4gICAgICAgICAgICB8fCBvZmZzZXQudmVydGljYWwgIT09IG90aGVyLnZlcnRpY2FsO1xuICAgIH1cblxuICAgIHJldHVybiBvZmZzZXQgIT09IG90aGVyO1xufVxuIiwiaW1wb3J0IHsgT2Zmc2V0LCBoYXNPZmZzZXRDaGFuZ2VkIH0gZnJvbSAnLi9vZmZzZXQnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcblxuZXhwb3J0IHR5cGUgQWxpZ25tZW50T3B0aW9uID0gJ3N0YXJ0JyB8ICdjZW50ZXInIHwgJ2VuZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxpZ25tZW50IHtcbiAgICBob3Jpem9udGFsOiBBbGlnbm1lbnRPcHRpb247XG4gICAgdmVydGljYWw6IEFsaWdubWVudE9wdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbGlnbm1lbnRQYWlyIHtcbiAgICBvcmlnaW46IEFsaWdubWVudDtcbiAgICB0YXJnZXQ6IEFsaWdubWVudDtcbiAgICBvZmZzZXQ/OiBPZmZzZXQ7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0FMSUdOTUVOVF9QQUlSOiBBbGlnbm1lbnRQYWlyID0ge1xuICAgIG9yaWdpbjoge1xuICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICB2ZXJ0aWNhbDogJ2VuZCdcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICB2ZXJ0aWNhbDogJ3N0YXJ0J1xuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FsaWdubWVudCAoYWxpZ25tZW50OiBhbnkpOiBhbGlnbm1lbnQgaXMgQWxpZ25tZW50IHtcblxuICAgIHJldHVybiB0eXBlb2YgKGFsaWdubWVudCBhcyBBbGlnbm1lbnQpLmhvcml6b250YWwgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAoYWxpZ25tZW50IGFzIEFsaWdubWVudCkudmVydGljYWwgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWxpZ25tZW50Q2hhbmdlZCAoYWxpZ25tZW50OiBBbGlnbm1lbnQsIG90aGVyOiBBbGlnbm1lbnQpOiBib29sZWFuIHtcblxuICAgIGlmIChhbGlnbm1lbnQgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gYWxpZ25tZW50Lmhvcml6b250YWwgIT09IG90aGVyLmhvcml6b250YWxcbiAgICAgICAgICAgIHx8IGFsaWdubWVudC52ZXJ0aWNhbCAhPT0gb3RoZXIudmVydGljYWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsaWdubWVudCAhPT0gb3RoZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZCAoYWxpZ25tZW50UGFpcj86IEFsaWdubWVudFBhaXIsIG90aGVyPzogQWxpZ25tZW50UGFpcik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKGFsaWdubWVudFBhaXIgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gaGFzQWxpZ25tZW50Q2hhbmdlZChhbGlnbm1lbnRQYWlyLnRhcmdldCwgb3RoZXIudGFyZ2V0KVxuICAgICAgICAgICAgfHwgaGFzQWxpZ25tZW50Q2hhbmdlZChhbGlnbm1lbnRQYWlyLm9yaWdpbiwgb3RoZXIub3JpZ2luKVxuICAgICAgICAgICAgfHwgaGFzT2Zmc2V0Q2hhbmdlZChhbGlnbm1lbnRQYWlyLm9mZnNldCwgb3RoZXIub2Zmc2V0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpZ25tZW50UGFpciAhPT0gb3RoZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQm91bmRpbmdCb3gge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsaWduZWRQb3NpdGlvbiAoZWxlbWVudEJveDogQm91bmRpbmdCb3gsIGVsZW1lbnRBbGlnbm1lbnQ6IEFsaWdubWVudCk6IFBvc2l0aW9uIHtcblxuICAgIGNvbnN0IHBvc2l0aW9uOiBQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgc3dpdGNoIChlbGVtZW50QWxpZ25tZW50Lmhvcml6b250YWwpIHtcblxuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94LnggKyBlbGVtZW50Qm94LndpZHRoIC8gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54ICsgZWxlbWVudEJveC53aWR0aDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZWxlbWVudEFsaWdubWVudC52ZXJ0aWNhbCkge1xuXG4gICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBlbGVtZW50Qm94Lnk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgcG9zaXRpb24ueSA9IGVsZW1lbnRCb3gueSArIGVsZW1lbnRCb3guaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0gZWxlbWVudEJveC55ICsgZWxlbWVudEJveC5oZWlnaHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXRQb3NpdGlvbiAob3JpZ2luQm94OiBCb3VuZGluZ0JveCwgb3JpZ2luQWxpZ25tZW50OiBBbGlnbm1lbnQsIHRhcmdldEJveDogQm91bmRpbmdCb3gsIHRhcmdldEFsaWdubWVudDogQWxpZ25tZW50KTogUG9zaXRpb24ge1xuXG4gICAgY29uc3Qgb3JpZ2luUG9zaXRpb24gPSBnZXRBbGlnbmVkUG9zaXRpb24ob3JpZ2luQm94LCBvcmlnaW5BbGlnbm1lbnQpO1xuICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0QWxpZ25lZFBvc2l0aW9uKHsgLi4udGFyZ2V0Qm94LCB4OiAwLCB5OiAwIH0sIHRhcmdldEFsaWdubWVudCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBvcmlnaW5Qb3NpdGlvbi54IC0gdGFyZ2V0UG9zaXRpb24ueCxcbiAgICAgICAgeTogb3JpZ2luUG9zaXRpb24ueSAtIHRhcmdldFBvc2l0aW9uLnksXG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBTaXplIHtcbiAgICB3aWR0aDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIGhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIG1heFdpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG4gICAgbWF4SGVpZ2h0OiBudW1iZXIgfCBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTaXplQ2hhbmdlZCAoc2l6ZT86IFBhcnRpYWw8U2l6ZT4sIG90aGVyPzogUGFydGlhbDxTaXplPik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHNpemUgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gc2l6ZS53aWR0aCAhPT0gb3RoZXIud2lkdGhcbiAgICAgICAgICAgIHx8IHNpemUuaGVpZ2h0ICE9PSBvdGhlci5oZWlnaHRcbiAgICAgICAgICAgIHx8IHNpemUubWF4V2lkdGggIT09IG90aGVyLm1heFdpZHRoXG4gICAgICAgICAgICB8fCBzaXplLm1heEhlaWdodCAhPT0gb3RoZXIubWF4SGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiBzaXplICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IENTU1NlbGVjdG9yIH0gZnJvbSAnLi4vLi4vZG9tJztcbmltcG9ydCB7IEFsaWdubWVudFBhaXIsIGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkIH0gZnJvbSAnLi9hbGlnbm1lbnQnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcbmltcG9ydCB7IGhhc1NpemVDaGFuZ2VkLCBTaXplIH0gZnJvbSAnLi9zaXplJztcblxuZXhwb3J0IGNvbnN0IFZJRVdQT1JUID0gJ3ZpZXdwb3J0JztcblxuZXhwb3J0IGNvbnN0IE9SSUdJTiA9ICdvcmlnaW4nO1xuXG4vKipcbiAqIEEgUG9zaXRpb25Db25maWcgY29udGFpbnMgdGhlIHNpemUgYW5kIGFsaWdubWVudCBvZiBhbiBFbGVtZW50IGFuZCBtYXkgaW5jbHVkZSBhbiBvcmlnaW4sIHdoaWNoIHJlZmVyZW5jZXMgYW4gb3JpZ2luIEVsZW1lbnRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbmZpZyBleHRlbmRzIFNpemUge1xuICAgIC8vIFRPRE86IGhhbmRsZSAnb3JpZ2luJyBjYXNlIGluIFBvc2l0aW9uU3RyYXRlZ3lcbiAgICB3aWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgaGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBtYXhXaWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgbWF4SGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBvcmlnaW46IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBDU1NTZWxlY3RvciB8ICd2aWV3cG9ydCc7XG4gICAgYWxpZ25tZW50OiBBbGlnbm1lbnRQYWlyO1xufVxuXG5leHBvcnQgY29uc3QgUE9TSVRJT05fQ09ORklHX0ZJRUxEUzogKGtleW9mIFBvc2l0aW9uQ29uZmlnKVtdID0gW1xuICAgICd3aWR0aCcsXG4gICAgJ2hlaWdodCcsXG4gICAgJ21heFdpZHRoJyxcbiAgICAnbWF4SGVpZ2h0JyxcbiAgICAnb3JpZ2luJyxcbiAgICAnYWxpZ25tZW50J1xuXTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT05fQ09ORklHOiBQb3NpdGlvbkNvbmZpZyA9IHtcbiAgICB3aWR0aDogJ2F1dG8nLFxuICAgIG1heFdpZHRoOiAnMTAwdncnLFxuICAgIGhlaWdodDogJ2F1dG8nLFxuICAgIG1heEhlaWdodDogJzEwMHZoJyxcbiAgICBvcmlnaW46ICd2aWV3cG9ydCcsXG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZCAocG9zaXRpb25Db25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPiwgb3RoZXI/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHBvc2l0aW9uQ29uZmlnICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnLm9yaWdpbiAhPT0gb3RoZXIub3JpZ2luXG4gICAgICAgICAgICB8fCBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZChwb3NpdGlvbkNvbmZpZy5hbGlnbm1lbnQsIG90aGVyLmFsaWdubWVudClcbiAgICAgICAgICAgIHx8IGhhc1NpemVDaGFuZ2VkKHBvc2l0aW9uQ29uZmlnLCBvdGhlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLCBPdmVybGF5Q29udHJvbGxlckNvbmZpZyB9IGZyb20gJy4vY29udHJvbGxlci9vdmVybGF5LWNvbnRyb2xsZXItY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4vcG9zaXRpb24vcG9zaXRpb24tY29uZmlnJztcblxuZXhwb3J0IHR5cGUgT3ZlcmxheUNvbmZpZyA9IFBvc2l0aW9uQ29uZmlnICYgT3ZlcmxheUNvbnRyb2xsZXJDb25maWcgJiB7XG4gICAgLy8gVE9ETzogbWF5YmUgaW50cm9kdWNlIGEgY29uc3QgZm9yIHRoZSAndmlld3BvcnQnIHZhbHVlP1xuICAgIHBvc2l0aW9uVHlwZTogc3RyaW5nO1xuICAgIGNvbnRyb2xsZXI/OiBzdHJpbmc7XG4gICAgY29udHJvbGxlclR5cGU6IHN0cmluZztcbiAgICBzdGFja2VkOiBib29sZWFuO1xuICAgIHRlbXBsYXRlPzogVGVtcGxhdGVGdW5jdGlvbjtcbiAgICBjb250ZXh0PzogQ29tcG9uZW50O1xuICAgIGJhY2tkcm9wOiBib29sZWFuO1xuICAgIGNsb3NlT25CYWNrZHJvcENsaWNrOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgT1ZFUkxBWV9DT05GSUdfRklFTERTOiAoa2V5b2YgT3ZlcmxheUNvbmZpZylbXSA9IFtcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdtYXhXaWR0aCcsXG4gICAgJ21heEhlaWdodCcsXG4gICAgJ29yaWdpbicsXG4gICAgJ2FsaWdubWVudCcsXG4gICAgJ3Bvc2l0aW9uVHlwZScsXG4gICAgJ2NvbnRyb2xsZXInLFxuICAgICdjb250cm9sbGVyVHlwZScsXG4gICAgJ3N0YWNrZWQnLFxuICAgICd0ZW1wbGF0ZScsXG4gICAgJ2NvbnRleHQnLFxuICAgICdiYWNrZHJvcCcsXG4gICAgJ2Nsb3NlT25Fc2NhcGUnLFxuICAgICdjbG9zZU9uRm9jdXNMb3NzJyxcbiAgICAnY2xvc2VPbkJhY2tkcm9wQ2xpY2snLFxuICAgICd0cmFwRm9jdXMnLFxuICAgICdhdXRvRm9jdXMnLFxuICAgICdpbml0aWFsRm9jdXMnLFxuICAgICdyZXN0b3JlRm9jdXMnLFxuICAgICd3cmFwRm9jdXMnLFxuICAgICd0YWJiYWJsZVNlbGVjdG9yJ1xuXTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfT1ZFUkxBWV9DT05GSUc6IE92ZXJsYXlDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLFxuICAgIHBvc2l0aW9uVHlwZTogJ2RlZmF1bHQnLFxuICAgIGNvbnRyb2xsZXI6IHVuZGVmaW5lZCxcbiAgICBjb250cm9sbGVyVHlwZTogJ2RlZmF1bHQnLFxuICAgIHN0YWNrZWQ6IHRydWUsXG4gICAgdGVtcGxhdGU6IHVuZGVmaW5lZCxcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgYmFja2Ryb3A6IHRydWUsXG4gICAgY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IHRydWUsXG59O1xuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4gfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi4vZXZlbnQtbWFuYWdlcic7XG5pbXBvcnQgeyBJREdlbmVyYXRvciB9IGZyb20gJy4uL2lkLWdlbmVyYXRvcic7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRyB9IGZyb20gJy4vZm9jdXMtdHJhcCc7XG5pbXBvcnQgeyBPdmVybGF5Q29uZmlnLCBPVkVSTEFZX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuL292ZXJsYXktY29uZmlnJztcblxuY29uc3QgSURfR0VORVJBVE9SID0gbmV3IElER2VuZXJhdG9yKCdwYXJ0a2l0LW92ZXJsYXktJyk7XG5cbkBjb21wb25lbnQ8T3ZlcmxheT4oe1xuICAgIHNlbGVjdG9yOiAndWktb3ZlcmxheScsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgI2JmYmZiZjtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgICAgd2lsbC1jaGFuZ2U6IGF1dG87XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICBgLFxufSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIFRPRE86IGNsZWFuIHRoaXMgdXBcbiAgICBwcml2YXRlIF9jb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7IC4uLkRFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUcsIHRyYXBGb2N1czogdHJ1ZSB9O1xuXG4gICAgcHJvdGVjdGVkIF9vcGVuID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHk8T3ZlcmxheT4oe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6ICdyZWZsZWN0T3BlbidcbiAgICB9KVxuICAgIGdldCBvcGVuICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3BlbjtcbiAgICB9XG5cbiAgICBzZXQgb3BlbiAob3BlbjogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChvcGVuID09PSB0aGlzLm9wZW4pIHJldHVybjtcblxuICAgICAgICAvLyBzZXR0aW5nIHRoZSBvcGVuIHByb3BlcnR5IG9mIHRoZSBvdmVybGF5IGRvZXNuJ3QgYWN0dWFsbHkgc2V0IGFueXRoaW5nLCB0aGVyZWZvcmUgcmVxdWVzdFVwZGF0ZSB3b24ndCBzZWUgYW55IGNoYW5nZXNcbiAgICAgICAgLy8gaW5zdGVhZCwgd2UgZGlzcGF0Y2ggYW4gZXZlbnQgd2hpY2ggYWN0cyBhcyBhIGNvbW1hbmQgdG8gb3BlbiBvciBjbG9zZSB0aGUgb3ZlcmxheVxuICAgICAgICAvLyB3ZSBkbyB0aGlzIHRvIGFsbG93IHRoZSBPdmVybGF5U2VydmljZSBhbmQgT3ZlcmxheUNvbnRyb2xsZXJzIHRvIGxpc3RlbiB0byB0aGVzZSBldmVudHMgYW5kIHJ1biB0aGVpciBhcHByb3ByaWF0ZSBsb2dpY1xuICAgICAgICAvLyBpbiB0aGUgc2FtZSB3YXksIHRoZSBPdmVybGF5U2VydmljZSBhbmQgT3ZlcmxheUNvbnRyb2xsZXIgY2FuIGRpc3BhdGNoIHRoaXMgZXZlbnQgYW5kIHRoZSBvdmVybGF5IHdpbGwgYmVoYXZlIGFzIGlmIGl0c1xuICAgICAgICAvLyBvcGVuIHByb3BlcnR5IHdvdWxkIGhhdmUgYmVlbiBzZXQsIHdpdGhvdXQgcmUtZW1pdHRpbmcgdGhlIHNhbWUgZXZlbnRcbiAgICAgICAgLy8gd2Ugd2lsbCBoYW5kbGUgdGhlIGFjdHVhbCBwcm9wZXJ0eSBjaGFuZ2UgaW4gdGhlIGhhbmRsZXJzIGJlbG93IGFuZCBhbHNvIGNhbGwgcmVxdWVzdFVwZGF0ZSBmcm9tIHRoZXJlXG4gICAgICAgIGRpc3BhdGNoKHRoaXMsIG9wZW4gPyAnY29tbWFuZC1vcGVuJyA6ICdjb21tYW5kLWNsb3NlJywge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgc291cmNlOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCA9IC0xO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVGdW5jdGlvbiB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnRleHQ6IENvbXBvbmVudCB8IHVuZGVmaW5lZDtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgY29udHJvbGxlciE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgY29udHJvbGxlclR5cGUgPSAnZGVmYXVsdCc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHBvc2l0aW9uVHlwZSA9ICdkZWZhdWx0JztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgb3JpZ2luID0gJ3ZpZXdwb3J0JztcblxuICAgIHNldCBjb25maWcgKGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPikge1xuXG4gICAgICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4udGhpcy5fY29uZmlnLCAuLi5jb25maWcgfTtcbiAgICB9XG5cbiAgICBnZXQgY29uZmlnICgpOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+IHtcblxuICAgICAgICBjb25zdCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7IC4uLnRoaXMuX2NvbmZpZyB9O1xuXG4gICAgICAgIE9WRVJMQVlfQ09ORklHX0ZJRUxEUy5mb3JFYWNoKGtleSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzW2tleSBhcyBrZXlvZiBPdmVybGF5XSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICBjb25maWdba2V5XSA9IHRoaXNba2V5IGFzIGtleW9mIE92ZXJsYXldIGFzIGFueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgSURfR0VORVJBVE9SLmdldE5leHRJRCgpO1xuICAgICAgICB0aGlzLnJvbGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgncm9sZScpIHx8ICdkaWFsb2cnO1xuXG4gICAgICAgIHRoaXMucmVmbGVjdE9wZW4oKTtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9O1xuXG4gICAgICAgIE9WRVJMQVlfQ09ORklHX0ZJRUxEUy5mb3JFYWNoKGtleSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLmhhcyhrZXkpKSBjb25maWdba2V5XSA9ICh0aGlzIGFzIGFueSlba2V5XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNvbmZpZykubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB3aGVuIG92ZXJsYXkgZ2V0cyBjcmVhdGVkIHZpYSBvdmVybGF5IHNlcnZpY2UsIHRoZSBjb25maWcgZnJvbSBvdXRzaWRlIHNob3VsZCBvdmVycmlkZSBvdmVybGF5J3MgZGVmYXVsdHNcbiAgICAgICAgICAgIC8vIHRoaXMub3ZlcmxheVNlcnZpY2UudXBkYXRlT3ZlcmxheUNvbmZpZyh0aGlzLCBjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVmbGVjdE9wZW4gKCkge1xuXG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ29wZW4nLCAnJyk7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnb3BlbicpO1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAnY29tbWFuZC1vcGVuJyxcbiAgICAgICAgb3B0aW9uczogeyBjYXB0dXJlOiB0cnVlIH0sXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbiAoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5fb3BlbiA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHdlIG5lZWQgdG8gYWxzbyBtYWtlIHRoZSBwcm9wZXJ0eSByZWZsZWN0IVxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCdvcGVuJywgZmFsc2UsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjb21tYW5kLWNsb3NlJyxcbiAgICAgICAgb3B0aW9uczogeyBjYXB0dXJlOiB0cnVlIH0sXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlQ2xvc2UgKGV2ZW50OiBDdXN0b21FdmVudCkge1xuXG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5fb3BlbiA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoJ29wZW4nLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOiBzZWUgaWYgd2UgYWN0dWFsbHkgbmVlZCB0aGlzLi4uXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjb21tYW5kLXRvZ2dsZScsXG4gICAgICAgIG9wdGlvbnM6IHsgY2FwdHVyZTogdHJ1ZSB9LFxuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZVRvZ2dsZSAoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsb3NlKGV2ZW50KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU9wZW4oZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyoqXG4gKiBBIENTUyBzZWxlY3RvciBzdHJpbmdcbiAqXG4gKiBAc2VlXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX1NlbGVjdG9yc1xuICovXG5leHBvcnQgdHlwZSBDU1NTZWxlY3RvciA9IHN0cmluZztcblxuLyoqXG4gKiBJbnNlcnQgYSBOb2RlIGFmdGVyIGEgcmVmZXJlbmNlIE5vZGVcbiAqXG4gKiBAcGFyYW0gbmV3Q2hpbGQgLSBUaGUgTm9kZSB0byBpbnNlcnRcbiAqIEBwYXJhbSByZWZDaGlsZCAtIFRoZSByZWZlcmVuY2UgTm9kZSBhZnRlciB3aGljaCB0byBpbnNlcnRcbiAqL1xuZXhwb3J0IGNvbnN0IGluc2VydEFmdGVyID0gPFQgZXh0ZW5kcyBOb2RlPiAobmV3Q2hpbGQ6IFQsIHJlZkNoaWxkOiBOb2RlKTogVCA9PiB7XG5cbiAgICByZXR1cm4gcmVmQ2hpbGQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKG5ld0NoaWxkLCByZWZDaGlsZC5uZXh0U2libGluZyk7XG59O1xuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuLi8uLi9iZWhhdmlvcic7XG5pbXBvcnQgeyBFc2NhcGUgfSBmcm9tICcuLi8uLi9rZXlzJztcbmltcG9ydCB7IEZvY3VzQ2hhbmdlRXZlbnQsIEZvY3VzTW9uaXRvciB9IGZyb20gJy4uL2ZvY3VzLW1vbml0b3InO1xuaW1wb3J0IHsgRm9jdXNUcmFwIH0gZnJvbSAnLi4vZm9jdXMtdHJhcCc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5U2VydmljZSB9IGZyb20gJy4uL292ZXJsYXktc2VydmljZSc7XG5pbXBvcnQgeyBPdmVybGF5Q29udHJvbGxlciB9IGZyb20gJy4vb3ZlcmxheS1jb250cm9sbGVyJztcbmltcG9ydCB7IE92ZXJsYXlDb250cm9sbGVyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LWNvbnRyb2xsZXItY29uZmlnJztcbmltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdzcmMvY29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIERlZmF1bHRPdmVybGF5Q29udHJvbGxlciBleHRlbmRzIEJlaGF2aW9yIGltcGxlbWVudHMgT3ZlcmxheUNvbnRyb2xsZXIge1xuXG4gICAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzVHJhcCB8IEZvY3VzTW9uaXRvcjtcblxuICAgIHByb3RlY3RlZCBwcmV2aW91c0ZvY3VzPzogSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIG92ZXJsYXk6IE92ZXJsYXksIHByb3RlY3RlZCBvdmVybGF5U2VydmljZTogT3ZlcmxheVNlcnZpY2UsIHByb3RlY3RlZCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbnRyb2xsZXJDb25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuY29uZmlnLnRyYXBGb2N1c1xuICAgICAgICAgICAgPyBuZXcgRm9jdXNUcmFwKGNvbmZpZylcbiAgICAgICAgICAgIDogbmV3IEZvY3VzTW9uaXRvcigpO1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudD86IEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICBzdXBlci5hdHRhY2goZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAna2V5ZG93bicsIGV2ZW50ID0+IHRoaXMuaGFuZGxlS2V5ZG93bihldmVudCBhcyBLZXlib2FyZEV2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2ZvY3VzLWNoYW5nZWQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzQ2hhbmdlKGV2ZW50IGFzIEZvY3VzQ2hhbmdlRXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnb3Blbi1jaGFuZ2VkJywgZXZlbnQgPT5cbiAgICAgICAgICAgIChldmVudCBhcyBQcm9wZXJ0eUNoYW5nZUV2ZW50PGJvb2xlYW4+KS5kZXRhaWwuY3VycmVudFxuICAgICAgICAgICAgICAgID8gdGhpcy5oYW5kbGVPcGVuKClcbiAgICAgICAgICAgICAgICA6IHRoaXMuaGFuZGxlQ2xvc2UoKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGFzeW5jIG9wZW4gKGV2ZW50PzogRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICB0aGlzLnN0b3JlRm9jdXMoKTtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm92ZXJsYXlTZXJ2aWNlLm9wZW5PdmVybGF5KHRoaXMub3ZlcmxheSwgZXZlbnQpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2UgKGV2ZW50PzogRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm92ZXJsYXlTZXJ2aWNlLmNsb3NlT3ZlcmxheSh0aGlzLm92ZXJsYXksIGV2ZW50KTtcblxuICAgICAgICB0aGlzLnJlc3RvcmVGb2N1cyhldmVudCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBhc3luYyB0b2dnbGUgKGV2ZW50PzogRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBpZiAodGhpcy5vdmVybGF5U2VydmljZS5pc092ZXJsYXlPcGVuKHRoaXMub3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvc2UoZXZlbnQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wZW4oZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU9wZW4gKCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdoYW5kbGVPcGVuLi4uJywgdGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZm9jdXNUcmFwKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNUcmFwLmF0dGFjaCh0aGlzLm92ZXJsYXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUNsb3NlICgpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnaGFuZGxlQ2xvc2UuLi4nLCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5mb2N1c1RyYXApIHtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c1RyYXAuZGV0YWNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNDaGFuZ2UgKGV2ZW50OiBGb2N1c0NoYW5nZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgaGFzRm9jdXMgPSBldmVudC5kZXRhaWwudHlwZSA9PT0gJ2ZvY3VzaW4nO1xuXG4gICAgICAgIGlmICghaGFzRm9jdXMpIHtcblxuICAgICAgICAgICAgLy8gd2hlbiBsb29zaW5nIGZvY3VzLCB3ZSB3YWl0IGZvciBwb3RlbnRpYWwgZm9jdXNpbiBldmVudHMgb24gY2hpbGQgb3IgcGFyZW50IG92ZXJsYXlzIGJ5IGRlbGF5aW5nXG4gICAgICAgICAgICAvLyB0aGUgYWN0aXZlIGNoZWNrIGluIGEgbmV3IG1hY3JvdGFzayB2aWEgc2V0VGltZW91dFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIGNoZWNrIGlmIHRoZSBvdmVybGF5IGlzIGFjdGl2ZSBhbmQgaWYgbm90LCB3ZSBjbG9zZSBpdFxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5U2VydmljZS5pc092ZXJsYXlBY3RpdmUodGhpcy5vdmVybGF5KSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gZ2V0IHRoZSBwYXJlbnQgYmVmb3JlIGNsb3NpbmcgdGhlIG92ZXJsYXkgLSB3aGVuIG92ZXJsYXkgaXMgY2xvc2VkLCBpdCBkb2Vzbid0IGhhdmUgYSBwYXJlbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5vdmVybGF5U2VydmljZS5nZXRQYXJlbnRPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmNsb3NlT25Gb2N1c0xvc3MpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZShldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHdlIGhhdmUgYSBwYXJlbnQgb3ZlcmxheSwgd2UgbGV0IHRoZSBwYXJlbnQga25vdyB0aGF0IG91ciBvdmVybGF5IGhhcyBsb3N0IGZvY3VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnkgZGlzcGF0Y2hpbmcgdGhlIEZvY3VzQ2hhbmdlRXZlbnQgb24gdGhlIHBhcmVudCBvdmVybGF5IHRvIGJlIGhhbmRsZWQgb3IgaWdub3JlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnkgdGhlIHBhcmVudCdzIE92ZXJsYXlDb250cm9sbGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdvdmVybGF5LWNvbnRyb2xsZXIuaGFuZGxlS2V5ZG93bigpLi4uJywgZXZlbnQpO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgRXNjYXBlOlxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlTZXJ2aWNlLmlzT3ZlcmxheU9wZW4odGhpcy5vdmVybGF5KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5jbG9zZU9uRXNjYXBlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN0b3JlRm9jdXMgKCkge1xuXG4gICAgICAgIHRoaXMucHJldmlvdXNGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQgfHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCByZXN0b3JlRm9jdXMgKGV2ZW50PzogRXZlbnQpIHtcblxuICAgICAgICAvLyB3ZSBvbmx5IHJlc3RvcmUgdGhlIGZvY3VzIGlmIHRoZSBvdmVybGF5IGlzIGNsb3NlZCBwcmVzc2luZyBFc2NhcGUgb3IgcHJvZ3JhbW1hdGljYWxseVxuICAgICAgICBjb25zdCByZXN0b3JlRm9jdXMgPSB0aGlzLmNvbmZpZy5yZXN0b3JlRm9jdXNcbiAgICAgICAgICAgICYmIHRoaXMucHJldmlvdXNGb2N1c1xuICAgICAgICAgICAgJiYgKHRoaXMuaXNFc2NhcGUoZXZlbnQpIHx8ICFldmVudCk7XG5cbiAgICAgICAgaWYgKHJlc3RvcmVGb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMhLmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGlzRXNjYXBlIChldmVudD86IEV2ZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyAmJiAoZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkua2V5ID09PSBFc2NhcGUgfHwgZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUHJvcGVydHlDaGFuZ2VFdmVudCB9IGZyb20gJ3NyYy9jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi4vLi4va2V5cyc7XG5pbXBvcnQgeyBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIgfSBmcm9tICcuL2RlZmF1bHQtb3ZlcmxheS1jb250cm9sbGVyJztcbmltcG9ydCB7IE92ZXJsYXlDb250cm9sbGVyIH0gZnJvbSAnLi9vdmVybGF5LWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLCBPdmVybGF5Q29udHJvbGxlckNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb250cm9sbGVyLWNvbmZpZyc7XG5cbmV4cG9ydCBjb25zdCBESUFMT0dfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRzogT3ZlcmxheUNvbnRyb2xsZXJDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHXG59O1xuXG5leHBvcnQgY2xhc3MgRGlhbG9nT3ZlcmxheUNvbnRyb2xsZXIgZXh0ZW5kcyBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIgaW1wbGVtZW50cyBPdmVybGF5Q29udHJvbGxlciB7XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICBzdXBlci5hdHRhY2goZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCAnZGlhbG9nJyk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2tleWRvd24nLCAoZXZlbnQ6IEV2ZW50KSA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2Vkb3duJywgKGV2ZW50OiBFdmVudCkgPT4gdGhpcy5oYW5kbGVNb3VzZWRvd24oZXZlbnQgYXMgTW91c2VFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLm92ZXJsYXksICdvcGVuLWNoYW5nZWQnLCAoZXZlbnQ6IEV2ZW50KSA9PiB0aGlzLmhhbmRsZU9wZW5DaGFuZ2UoZXZlbnQgYXMgUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpO1xuXG4gICAgICAgIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLm92ZXJsYXkub3BlbiA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuQ2hhbmdlIChldmVudDogUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikge1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBFbnRlcjpcbiAgICAgICAgICAgIGNhc2UgU3BhY2U6XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgICAgICAgICAgc3VwZXIuaGFuZGxlS2V5ZG93bihldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIgfSBmcm9tICcuL2RlZmF1bHQtb3ZlcmxheS1jb250cm9sbGVyJztcbmltcG9ydCB7IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRywgT3ZlcmxheUNvbnRyb2xsZXJDb25maWcgfSBmcm9tICcuL292ZXJsYXktY29udHJvbGxlci1jb25maWcnO1xuXG5leHBvcnQgY29uc3QgVE9PTFRJUF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHOiBPdmVybGF5Q29udHJvbGxlckNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUcsXG4gICAgdHJhcEZvY3VzOiBmYWxzZSxcbiAgICBhdXRvRm9jdXM6IGZhbHNlLFxuICAgIHJlc3RvcmVGb2N1czogZmFsc2UsXG59O1xuXG5leHBvcnQgY2xhc3MgVG9vbHRpcE92ZXJsYXlDb250cm9sbGVyIGV4dGVuZHMgRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN1cGVyLmF0dGFjaChlbGVtZW50KTtcblxuICAgICAgICB0aGlzLm92ZXJsYXkucm9sZSA9ICd0b29sdGlwJztcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIHRoaXMub3ZlcmxheS5pZCk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ21vdXNlZW50ZXInLCAoZXZlbnQpID0+IHRoaXMub3BlbihldmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VsZWF2ZScsIChldmVudCkgPT4gdGhpcy5jbG9zZShldmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXMnLCAoZXZlbnQpID0+IHRoaXMub3BlbihldmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnYmx1cicsIChldmVudCkgPT4gdGhpcy5jbG9zZShldmVudCkpO1xuICAgIH1cblxuICAgIGRldGFjaCAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG5cbiAgICAgICAgc3VwZXIuZGV0YWNoKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4uL292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuLi9vdmVybGF5LXNlcnZpY2UnO1xuaW1wb3J0IHsgRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyIH0gZnJvbSAnLi9kZWZhdWx0LW92ZXJsYXktY29udHJvbGxlcic7XG5pbXBvcnQgeyBEaWFsb2dPdmVybGF5Q29udHJvbGxlciwgRElBTE9HX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUcgfSBmcm9tICcuL2RpYWxvZy1vdmVybGF5LWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgT3ZlcmxheUNvbnRyb2xsZXIgfSBmcm9tICcuL292ZXJsYXktY29udHJvbGxlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUcsIE92ZXJsYXlDb250cm9sbGVyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LWNvbnRyb2xsZXItY29uZmlnJztcbmltcG9ydCB7IFRvb2x0aXBPdmVybGF5Q29udHJvbGxlciwgVE9PTFRJUF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHIH0gZnJvbSAnLi90b29sdGlwLW92ZXJsYXktY29udHJvbGxlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheUNvbnRyb2xsZXJNYXAge1xuICAgIFtrZXk6IHN0cmluZ106IHsgbmV3KG92ZXJsYXk6IE92ZXJsYXksIG92ZXJsYXlTZXJ2aWNlOiBPdmVybGF5U2VydmljZSwgY29uZmlnOiBPdmVybGF5Q29udHJvbGxlckNvbmZpZyk6IE92ZXJsYXlDb250cm9sbGVyIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheUNvbnRyb2xsZXJDb25maWdNYXAge1xuICAgIFtrZXk6IHN0cmluZ106IE92ZXJsYXlDb250cm9sbGVyQ29uZmlnO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJTOiBPdmVybGF5Q29udHJvbGxlck1hcCA9IHtcbiAgICBkZWZhdWx0OiBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIsXG4gICAgZGlhbG9nOiBEaWFsb2dPdmVybGF5Q29udHJvbGxlcixcbiAgICB0b29sdGlwOiBUb29sdGlwT3ZlcmxheUNvbnRyb2xsZXIsXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHUzogT3ZlcmxheUNvbnRyb2xsZXJDb25maWdNYXAgPSB7XG4gICAgZGVmYXVsdDogREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLFxuICAgIGRpYWxvZzogRElBTE9HX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUcsXG4gICAgdG9vbHRpcDogVE9PTFRJUF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLFxufTtcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlDb250cm9sbGVyRmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBjb250cm9sbGVyczogT3ZlcmxheUNvbnRyb2xsZXJNYXAgPSBERUZBVUxUX09WRVJMQVlfQ09OVFJPTExFUlMsXG4gICAgICAgIHByb3RlY3RlZCBjb25maWdzOiBPdmVybGF5Q29udHJvbGxlckNvbmZpZ01hcCA9IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJR1NcbiAgICApIHsgfVxuXG4gICAgY3JlYXRlT3ZlcmxheUNvbnRyb2xsZXIgKHR5cGU6IHN0cmluZywgb3ZlcmxheTogT3ZlcmxheSwgb3ZlcmxheVNlcnZpY2U6IE92ZXJsYXlTZXJ2aWNlLCBjb25maWc/OiBQYXJ0aWFsPE92ZXJsYXlDb250cm9sbGVyQ29uZmlnPik6IE92ZXJsYXlDb250cm9sbGVyIHtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyc1t0eXBlXSB8fCBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXI7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7IC4uLih0aGlzLmNvbmZpZ3NbdHlwZV0gfHwgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHKSwgLi4uY29uZmlnIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBjb250cm9sbGVyKG92ZXJsYXksIG92ZXJsYXlTZXJ2aWNlLCBjb25maWd1cmF0aW9uKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiB9IGZyb20gXCJAcGFydGtpdC9jb21wb25lbnRcIjtcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS1vdmVybGF5LWJhY2tkcm9wJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLW92ZXJsYXktYmFja2Ryb3AtYmFja2dyb3VuZCk7XG4gICAgfVxuICAgIDpob3N0KFtoaWRkZW5dKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIDpob3N0KFt0cmFuc3BhcmVudF0pIHtcbiAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIGBdXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXlCYWNrZHJvcCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGhpZGRlbiE6IGJvb2xlYW47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIHRyYW5zcGFyZW50ID0gZmFsc2U7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgc2hvdyAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmhpZGRlbiA9IGZhbHNlKTtcbiAgICB9XG5cbiAgICBoaWRlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuaGlkZGVuID0gdHJ1ZSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbiB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT046IFBvc2l0aW9uID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc2l0aW9uIChwb3NpdGlvbjogYW55KTogcG9zaXRpb24gaXMgUG9zaXRpb24ge1xuXG4gICAgcmV0dXJuIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnggIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnkgIT09ICd1bmRlZmluZWQnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgIGlmIChwb3NpdGlvbiAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbi54ICE9PSBvdGhlci54XG4gICAgICAgICAgICB8fCBwb3NpdGlvbi55ICE9PSBvdGhlci55O1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbiAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBCb3VuZGluZ0JveCwgZ2V0VGFyZ2V0UG9zaXRpb24gfSBmcm9tICcuL2FsaWdubWVudCc7XG5pbXBvcnQgeyBoYXNQb3NpdGlvbkNoYW5nZWQsIGlzUG9zaXRpb24sIFBvc2l0aW9uIH0gZnJvbSAnLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgUG9zaXRpb25Db25maWcgfSBmcm9tICcuL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBoYXNTaXplQ2hhbmdlZCwgU2l6ZSB9IGZyb20gJy4vc2l6ZSc7XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgIHByaXZhdGUgX2NvbmZpZzogUG9zaXRpb25Db25maWcgPSBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRztcblxuICAgIHByaXZhdGUgX29yaWdpbjogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhbmltYXRpb25GcmFtZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRQb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFNpemU6IFNpemUgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgc2V0IG9yaWdpbiAob3JpZ2luOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgLy8gY2FjaGUgdGhlIG9yaWdpbiBlbGVtZW50IGlmIGl0IGlzIGEgQ1NTIHNlbGVjdG9yXG4gICAgICAgIGlmICh0eXBlb2Ygb3JpZ2luID09PSAnc3RyaW5nJyAmJiBvcmlnaW4gIT09ICd2aWV3cG9ydCcpIHtcblxuICAgICAgICAgICAgb3JpZ2luID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcmlnaW4pIGFzIEhUTUxFbGVtZW50IHx8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX29yaWdpbiA9IG9yaWdpbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IG9yaWdpbiAoKTogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX29yaWdpbjtcbiAgICB9XG5cbiAgICBzZXQgY29uZmlnIChjb25maWc6IFBvc2l0aW9uQ29uZmlnKSB7XG5cbiAgICAgICAgdGhpcy5fY29uZmlnID0geyAuLi50aGlzLl9jb25maWcsIC4uLmNvbmZpZyB9O1xuXG4gICAgICAgIHRoaXMub3JpZ2luID0gdGhpcy5jb25maWcub3JpZ2luO1xuICAgIH1cblxuICAgIGdldCBjb25maWcgKCk6IFBvc2l0aW9uQ29uZmlnIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudCwgY29uZmlnPzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4pIHtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyBhcyBQb3NpdGlvbkNvbmZpZztcbiAgICB9XG5cbiAgICB1cGRhdGUgKHBvc2l0aW9uPzogUG9zaXRpb24sIHNpemU/OiBTaXplKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRTaXplID0gc2l6ZSB8fCB0aGlzLmdldFNpemUoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50UG9zaXRpb24gfHwgdGhpcy5oYXNQb3NpdGlvbkNoYW5nZWQobmV4dFBvc2l0aW9uLCB0aGlzLmN1cnJlbnRQb3NpdGlvbikpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTaXplIHx8IHRoaXMuaGFzU2l6ZUNoYW5nZWQobmV4dFNpemUsIHRoaXMuY3VycmVudFNpemUpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseVNpemUobmV4dFNpemUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaXplID0gbmV4dFNpemU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcblxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZSk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgcG9zaXRpb25lZCBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBUaGUgcG9zaXRpb24gd2lsbCBkZXBlbmQgb24gdGhlIGFsaWdubWVudCBhbmQgb3JpZ2luIG9wdGlvbnMgb2YgdGhlIHtAbGluayBQb3NpdGlvbkNvbmZpZ30uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luQm94ID0gdGhpcy5nZXRCb3VuZGluZ0JveCh0aGlzLm9yaWdpbik7XG4gICAgICAgIGNvbnN0IHRhcmdldEJveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3godGhpcy50YXJnZXQpO1xuXG4gICAgICAgIC8vIFRPRE86IGluY2x1ZGUgYWxpZ25tZW50IG9mZnNldFxuXG4gICAgICAgIHJldHVybiBnZXRUYXJnZXRQb3NpdGlvbihvcmlnaW5Cb3gsIHRoaXMuY29uZmlnLmFsaWdubWVudC5vcmlnaW4sIHRhcmdldEJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50LnRhcmdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFdlIHRha2UgdGhlIHNldHRpbmdzIGZyb20gdGhlIHtAbGluayBQb3NpdGlvbkNvbmZpZ30gc28gd2UgYXJlIGFsd2F5cyB1cC10by1kYXRlIGlmIHRoZSBjb25maWd1cmF0aW9uIHdhcyB1cGRhdGVkLlxuICAgICAqXG4gICAgICogVGhpcyBob29rIGFsc28gYWxsb3dzIHVzIHRvIGRvIHRoaW5ncyBsaWtlIG1hdGNoaW5nIHRoZSBvcmlnaW4ncyB3aWR0aCwgb3IgbG9va2luZyBhdCB0aGUgYXZhaWxhYmxlIHZpZXdwb3J0IGRpbWVuc2lvbnMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFNpemUgKCk6IFNpemUge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5jb25maWcud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuY29uZmlnLmhlaWdodCxcbiAgICAgICAgICAgIG1heFdpZHRoOiB0aGlzLmNvbmZpZy5tYXhXaWR0aCxcbiAgICAgICAgICAgIG1heEhlaWdodDogdGhpcy5jb25maWcubWF4SGVpZ2h0LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRCb3VuZGluZ0JveCAocmVmZXJlbmNlOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkKTogQm91bmRpbmdCb3gge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94OiBCb3VuZGluZ0JveCA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb24ocmVmZXJlbmNlKSkge1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC54ID0gcmVmZXJlbmNlLng7XG4gICAgICAgICAgICBib3VuZGluZ0JveC55ID0gcmVmZXJlbmNlLnk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWZlcmVuY2UgPT09ICd2aWV3cG9ydCcpIHtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIGNvbnN0IG9yaWdpblJlY3QgPSByZWZlcmVuY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnggPSBvcmlnaW5SZWN0LmxlZnQ7XG4gICAgICAgICAgICBib3VuZGluZ0JveC55ID0gb3JpZ2luUmVjdC50b3A7XG4gICAgICAgICAgICBib3VuZGluZ0JveC53aWR0aCA9IG9yaWdpblJlY3Qud2lkdGg7XG4gICAgICAgICAgICBib3VuZGluZ0JveC5oZWlnaHQgPSBvcmlnaW5SZWN0LmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLnkpO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5yaWdodCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVNpemUgKHNpemU6IFNpemUpIHtcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS53aWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLndpZHRoKTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHNpemUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUubWF4V2lkdGggPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5tYXhXaWR0aCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLm1heEhlaWdodCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHBhcnNlU3R5bGUgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XG5cbiAgICAgICAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSA/IGAkeyB2YWx1ZSB9cHhgIDogdmFsdWU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1Bvc2l0aW9uQ2hhbmdlZCAocG9zaXRpb24/OiBQb3NpdGlvbiwgb3RoZXI/OiBQb3NpdGlvbik6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiBoYXNQb3NpdGlvbkNoYW5nZWQocG9zaXRpb24sIG90aGVyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFzU2l6ZUNoYW5nZWQgKHNpemU/OiBTaXplLCBvdGhlcj86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzU2l6ZUNoYW5nZWQoc2l6ZSwgb3RoZXIpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IERFRkFVTFRfUE9TSVRJT04sIFBvc2l0aW9uIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IFBvc2l0aW9uU3RyYXRlZ3kgfSBmcm9tICcuLi9wb3NpdGlvbi1zdHJhdGVneSc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRDogUG9zaXRpb25Db25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIodGFyZ2V0LCB7IC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NFTlRFUkVELCAuLi5jb25maWcgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGdldFBvc2l0aW9uIG1ldGhvZCB0byBhbHdheXMgcmV0dXJuIHRoZSB7QGxpbmsgREVGQVVMVF9QT1NJVElPTn1cbiAgICAgKlxuICAgICAqIFdlIGFjdHVhbGx5IGRvbid0IGNhcmUgYWJvdXQgdGhlIHBvc2l0aW9uLCBiZWNhdXNlIHdlIGFyZSBnb2luZyB0byB1c2Ugdmlld3BvcnQgcmVsYXRpdmVcbiAgICAgKiBDU1MgdW5pdHMgdG8gcG9zaXRpb24gdGhlIGVsZW1lbnQuIEFmdGVyIHRoZSBmaXJzdCBjYWxjdWxhdGlvbiBvZiB0aGUgcG9zaXRpb24sIGl0J3NcbiAgICAgKiBuZXZlciBnb2luZyB0byBjaGFuZ2UgYW5kIGFwcGx5UG9zaXRpb24gd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlLiBUaGlzIG1ha2VzIHRoaXNcbiAgICAgKiBwb3NpdGlvbiBzdHJhdGVneSByZWFsbHkgY2hlYXAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgcmV0dXJuIERFRkFVTFRfUE9TSVRJT047XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kIHRvIGNlbnRlciB0aGUgZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgdmlld3BvcnRcbiAgICAgKiBkaW1lbnNpb25zIGFuZCBpdHMgb3duIHNpemUuIFRoaXMgc3R5bGUgaGFzIHRvIGJlIGFwcGxpZWQgb25seSBvbmNlIGFuZCBpcyByZXNwb25zaXZlXG4gICAgICogYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gJzUwdmgnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gJzUwdncnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5yaWdodCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKC01MCUsIC01MCUpYDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSAnLi4vcG9zaXRpb24tc3RyYXRlZ3knO1xuaW1wb3J0IHsgUG9zaXRpb25Db25maWcsIERFRkFVTFRfUE9TSVRJT05fQ09ORklHIH0gZnJvbSAnLi4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9DT05GSUdfQ09OTkVDVEVEOiBQb3NpdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX1BPU0lUSU9OX0NPTkZJRyxcbiAgICBhbGlnbm1lbnQ6IHtcbiAgICAgICAgb3JpZ2luOiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICAgICAgdmVydGljYWw6ICdlbmQnXG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ3N0YXJ0JyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9LFxuICAgIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBwcm90ZWN0ZWQgdXBkYXRlTGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIodGFyZ2V0LCB7IC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NPTk5FQ1RFRCwgLi4uY29uZmlnIH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlTGlzdGVuZXIgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy51cGRhdGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzdHJveSAoKSB7XG5cbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlTGlzdGVuZXIpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyLCB0cnVlKTtcblxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kLCBzbyB3ZSBjYW4gdXNlIGEgQ1NTIHRyYW5zZm9ybSB0byBwb3NpdGlvbiB0aGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FuIHJlc3VsdCBpbiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnRvcCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmJvdHRvbSA9ICcnO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHsgdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpIH0sICR7IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi55KSB9KWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb25TdHJhdGVneSB9IGZyb20gJy4vcG9zaXRpb24tc3RyYXRlZ3knO1xuaW1wb3J0IHsgQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5LCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRCB9IGZyb20gJy4vc3RyYXRlZ2llcy9jZW50ZXJlZC1wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQgeyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DT05ORUNURUQgfSBmcm9tICcuL3N0cmF0ZWdpZXMvY29ubmVjdGVkLXBvc2l0aW9uLXN0cmF0ZWd5JztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvblN0cmF0ZWd5TWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiB7IG5ldyh0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IFBvc2l0aW9uU3RyYXRlZ3kgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbmZpZ01hcCB7XG4gICAgW2tleTogc3RyaW5nXTogUG9zaXRpb25Db25maWc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX1NUUkFURUdJRVM6IFBvc2l0aW9uU3RyYXRlZ3lNYXAgPSB7XG4gICAgZGVmYXVsdDogUG9zaXRpb25TdHJhdGVneSxcbiAgICBjZW50ZXJlZDogQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5LFxuICAgIGNvbm5lY3RlZDogQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR1M6IFBvc2l0aW9uQ29uZmlnTWFwID0ge1xuICAgIGRlZmF1bHQ6IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIGNlbnRlcmVkOiBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRCxcbiAgICBjb25uZWN0ZWQ6IERFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NPTk5FQ1RFRCxcbn07XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBzdHJhdGVnaWVzOiBQb3NpdGlvblN0cmF0ZWd5TWFwID0gREVGQVVMVF9QT1NJVElPTl9TVFJBVEVHSUVTLFxuICAgICAgICBwcm90ZWN0ZWQgY29uZmlnczogUG9zaXRpb25Db25maWdNYXAgPSBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR1NcbiAgICApIHsgfVxuXG4gICAgY3JlYXRlUG9zaXRpb25TdHJhdGVneSAodHlwZTogc3RyaW5nLCB0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IFBvc2l0aW9uU3RyYXRlZ3kge1xuXG4gICAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5zdHJhdGVnaWVzW3R5cGVdIHx8IFBvc2l0aW9uU3RyYXRlZ3k7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7IC4uLnRoaXMuY29uZmlnc1t0eXBlXSB8fCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgLi4uY29uZmlnIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBzdHJhdGVneSh0YXJnZXQsIGNvbmZpZ3VyYXRpb24pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgaW5zZXJ0QWZ0ZXIgfSBmcm9tICcuLi9kb20nO1xuaW1wb3J0IHsgT3ZlcmxheUNvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXIvb3ZlcmxheS1jb250cm9sbGVyJztcbmltcG9ydCB7IE92ZXJsYXlDb250cm9sbGVyRmFjdG9yeSB9IGZyb20gJy4vY29udHJvbGxlci9vdmVybGF5LWNvbnRyb2xsZXItZmFjdG9yeSc7XG5pbXBvcnQgeyBGb2N1c0NoYW5nZUV2ZW50IH0gZnJvbSAnLi9mb2N1cy1tb25pdG9yJztcbmltcG9ydCB7IEZvY3VzVHJhcCB9IGZyb20gJy4vZm9jdXMtdHJhcCc7XG5pbXBvcnQgeyBPdmVybGF5LCBPdmVybGF5QmFja2Ryb3AsIE92ZXJsYXlDb25maWcgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZCwgUG9zaXRpb25Db25maWcsIFBPU0lUSU9OX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSAnLi9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB9IGZyb20gJy4vcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5cbmNvbnN0IE9WRVJMQVlfVU5SRUdJU1RFUkVEX0VSUk9SID0gKG92ZXJsYXk6IHR5cGVvZiBPdmVybGF5KSA9PiBuZXcgRXJyb3IoYE92ZXJsYXkgaXMgbm90IHJlZ2lzdGVyZWQ6ICR7IG92ZXJsYXkuc2VsZWN0b3IgfWApO1xuXG5sZXQgT1ZFUkxBWV9TRVJWSUNFX0lOU1RBTkNFOiBPdmVybGF5U2VydmljZSB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGludGVyZmFjZSBPdmVybGF5RGVmaW5pdGlvbiB7XG4gICAgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+O1xuICAgIHBvc2l0aW9uU3RyYXRlZ3k/OiBQb3NpdGlvblN0cmF0ZWd5O1xuICAgIG92ZXJsYXlDb250cm9sbGVyPzogT3ZlcmxheUNvbnRyb2xsZXI7XG4gICAgZm9jdXNUcmFwPzogRm9jdXNUcmFwO1xuICAgIHVwZGF0ZUxpc3RlbmVyOiAoZXZlbnQ6IEN1c3RvbUV2ZW50KSA9PiB2b2lkO1xuICAgIG9wZW5DaGFuZ2VMaXN0ZW5lcjogKGV2ZW50OiBDdXN0b21FdmVudCkgPT4gdm9pZDtcbiAgICBmb2N1c0NoYW5nZUxpc3RlbmVyOiAoZXZlbnQ6IEZvY3VzQ2hhbmdlRXZlbnQpID0+IHZvaWQ7XG4gICAgZGVzdHJveTogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlTZXJ2aWNlIHtcblxuICAgIHByb3RlY3RlZCByZWdpc3RlcmVkT3ZlcmxheXM6IE1hcDxPdmVybGF5LCBPdmVybGF5RGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgYWN0aXZlT3ZlcmxheXM6IE92ZXJsYXlbXSA9IFtdO1xuXG4gICAgcHJvdGVjdGVkIGJhY2tkcm9wITogT3ZlcmxheUJhY2tkcm9wO1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwcm90ZWN0ZWQgcG9zaXRpb25TdHJhdGVneUZhY3Rvcnk6IFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5ID0gbmV3IFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5KCksXG4gICAgICAgIHByb3RlY3RlZCBvdmVybGF5Q29udHJvbGxlckZhY3Rvcnk6IE92ZXJsYXlDb250cm9sbGVyRmFjdG9yeSA9IG5ldyBPdmVybGF5Q29udHJvbGxlckZhY3RvcnkoKSxcbiAgICAgICAgcHJvdGVjdGVkIHJvb3Q6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuYm9keVxuICAgICkge1xuXG4gICAgICAgIGlmICghT1ZFUkxBWV9TRVJWSUNFX0lOU1RBTkNFKSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5U2VydmljZS5jb25zdHJ1Y3RvcigpLi4uJyk7XG5cbiAgICAgICAgICAgIE9WRVJMQVlfU0VSVklDRV9JTlNUQU5DRSA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQmFja2Ryb3AoKTtcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjb25uZWN0ZWQnLCBldmVudCA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgT3ZlcmxheSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNPdmVybGF5KGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyT3ZlcmxheShldmVudC50YXJnZXQsIGV2ZW50LnRhcmdldC5jb25maWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc2Nvbm5lY3RlZCcsIGV2ZW50ID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBPdmVybGF5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNPdmVybGF5KGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3lPdmVybGF5KGV2ZW50LnRhcmdldCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIE9WRVJMQVlfU0VSVklDRV9JTlNUQU5DRTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBtYXliZSBub3QgbmVlZGVkPyBpZiBuZWVkZWQsIGl0J3Mgd3JvbmcgYXMgd2UgY2FuIGhhdmUgdW5zdGFja2VkIG9wZW4gb3ZlcmxheXNcbiAgICBoYXNPcGVuT3ZlcmxheXMgKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU92ZXJsYXlzLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgaGFzT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5oYXMob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgaXNPdmVybGF5T3BlbiAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiBvdmVybGF5Lm9wZW47XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBubyBsb25nZXIgd29ya3Mgd2l0aCB1bnN0YWNrZWQgb3ZlcmxheXNcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuYWN0aXZlT3ZlcmxheXMuaW5jbHVkZXMob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gb3ZlcmxheSBpcyBjb25zaWRlcmVkIGZvY3VzZWQsIGlmIGVpdGhlciBpdHNlbGYgb3IgYW55IG9mIGl0cyBkZXNjZW5kYW50IG5vZGVzIGhhcyBmb2N1cy5cbiAgICAgKi9cbiAgICBpc092ZXJsYXlGb2N1c2VkIChvdmVybGF5OiBPdmVybGF5KTogYm9vbGVhbiB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgcmV0dXJuIG92ZXJsYXkgPT09IGFjdGl2ZUVsZW1lbnQgfHwgb3ZlcmxheS5jb250YWlucyhhY3RpdmVFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBvdmVybGF5IGlzIGNvbnNpZGVyZWQgYWN0aXZlIGlmIGl0IGlzIGVpdGhlciBmb2N1c2VkIG9yIGhhcyBhIGRlc2NlbmRhbnQgb3ZlcmxheSB3aGljaCBpcyBmb2N1c2VkLlxuICAgICAqL1xuICAgIGlzT3ZlcmxheUFjdGl2ZSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGxldCBpc0ZvdW5kID0gZmFsc2U7XG4gICAgICAgIGxldCBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdGhpcy5hY3RpdmVPdmVybGF5cy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoICYmICFpc0FjdGl2ZTsgaW5kZXgrKykge1xuXG4gICAgICAgICAgICBpZiAoIWlzRm91bmQgJiYgdGhpcy5hY3RpdmVPdmVybGF5c1tpbmRleF0gPT09IG92ZXJsYXkpIGlzRm91bmQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNGb3VuZCkge1xuXG4gICAgICAgICAgICAgICAgaXNBY3RpdmUgPSB0aGlzLmlzT3ZlcmxheUZvY3VzZWQodGhpcy5hY3RpdmVPdmVybGF5c1tpbmRleF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH1cblxuICAgIGdldFBhcmVudE92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXkpOiBPdmVybGF5IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5pc092ZXJsYXlPcGVuKG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5hY3RpdmVPdmVybGF5cy5maW5kSW5kZXgoY3VycmVudCA9PiBjdXJyZW50ID09PSBvdmVybGF5KTtcblxuICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlT3ZlcmxheXNbaW5kZXggLSAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUJhY2tkcm9wICgpIHtcblxuICAgICAgICB0aGlzLmJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChPdmVybGF5QmFja2Ryb3Auc2VsZWN0b3IpIGFzIE92ZXJsYXlCYWNrZHJvcDtcblxuICAgICAgICB0aGlzLnJvb3QuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZHJvcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IG92ZXJsYXlcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIENyZWF0ZXMgYSBuZXcgb3ZlcmxheSBpbnN0YW5jZXMgYW5kIHJlZ2lzdGVycyBpdCB3aXRoIHRoZSBzZXJ2aWNlLlxuICAgICAqL1xuICAgIGNyZWF0ZU92ZXJsYXkgKGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPik6IE92ZXJsYXkge1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KE92ZXJsYXkuc2VsZWN0b3IpIGFzIE92ZXJsYXk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3Rlck92ZXJsYXkob3ZlcmxheSwgY29uZmlnKTtcblxuICAgICAgICByZXR1cm4gb3ZlcmxheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhbiBvdmVybGF5IHdpdGggdGhlIG92ZXJsYXkgc2VydmljZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQWRkcyB0aGUgb3ZlcmxheSBpbnN0YW5jZSB0byB0aGUgb3ZlcmxheSBzZXJ2aWNlJ3MgcmVnaXN0cnksIGV4dHJhY3RzIHRoZSBvdmVybGF5J3MgY29uZmlndXJhdGlvbiBhbmRcbiAgICAgKiBhdHRhY2hlcyB0aGUgb3ZlcmxheSB0byB0aGUgb3ZlcmxheSBzZXJ2aWNlJ3Mgcm9vdCBsb2NhdGlvbiBpbiB0aGUgZG9jdW1lbnQgYm9keS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG92ZXJsYXkgd2FzIHJlZ2lzdGVyZWQgc3VjY2Vzc2Z1bGx5LCBmYWxzZSBpZiB0aGUgb3ZlcmxheSBoYXMgYmVlbiByZWdpc3RlcmVkIGFscmVhZHlcbiAgICAgKi9cbiAgICByZWdpc3Rlck92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLnNldChvdmVybGF5LCB0aGlzLmNvbmZpZ3VyZU92ZXJsYXkob3ZlcmxheSwgY29uZmlnKSk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBvcGVuT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ/OiBFdmVudCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzT3ZlcmxheU9wZW4ob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgICAgIHJlamVjdChmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4tY2hhbmdlZCcsIChldmVudCkgPT4gcmVzb2x2ZSh0cnVlKSwgeyBvbmNlOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhLmNvbmZpZztcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5zdGFja2VkKSB7XG5cbiAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGNoZWNrIGlmIGFuIGV2ZW50IGNhdXNlZCB0aGUgb3ZlcmxheSB0byBvcGVuIGFuZCBpZiBpdCBvcmlnaW5hdGVzIGZyb20gYW55IGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgIGxldCBsZW5ndGggPSB0aGlzLmFjdGl2ZU92ZXJsYXlzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBsZW5ndGggLSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50ICYmIGxlbmd0aCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbmRleDsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aXZlT3ZlcmxheSA9IHRoaXMuYWN0aXZlT3ZlcmxheXNbaW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlT3ZlcmxheSA9PT0gZXZlbnQudGFyZ2V0IHx8IGFjdGl2ZU92ZXJsYXkuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgZm91bmQgdGhlIGFjdGl2ZSBvdmVybGF5IHRoYXQgY2F1c2VkIHRoZSBldmVudCwgd2Uga2VlcCB0aGUgc3RhY2sgdXAgdG8gdGhpcyBvdmVybGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYWN0aXZlIG92ZXJsYXkgZGlkbid0IGNhdXNlIHRoZSBldmVudCwgc28gaXQgc2hvdWxkIGJlIGNsb3NlZCBhbmQgZGlzY2FyZGVkIGZyb20gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkob3ZlcmxheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBwdXNoIG92ZXJsYXkgb24gdGhlIHN0YWNrIHRvIG1hcmsgaXQgYXMgY3VycmVudGx5IGFjdGl2ZSBvdmVybGF5XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVPdmVybGF5cy5wdXNoKG92ZXJsYXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBvdmVybGF5LnNob3coKTtcbiAgICAgICAgICAgIG92ZXJsYXkub3BlbiA9IHRydWU7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYWN0aXZlT3ZlcmxheXMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBhbiBvdmVybGF5XG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBXaGVuIGNsb3NpbmcgYW4gb3ZlcmxheSwgYWxsIGl0cyBvcGVuIGRlc2NlbmRhbnQgb3ZlcmxheXMgaGF2ZSB0byBiZSBjbG9zZWQgYXMgd2VsbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvdmVybGF5IC0gVGhlIG92ZXJsYXkgdG8gY2xvc2VcbiAgICAgKiBAcGFyYW0gZXZlbnQgLSBBbiBvcHRpb25hbCBldmVudCB0aGF0IHdhcyByZXNwb25zaWJsZSBmb3IgY2xvc2luZyB0aGUgb3ZlcmxheVxuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ/OiBFdmVudCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5pc092ZXJsYXlPcGVuKG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgICAgICByZWplY3QoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKCdvcGVuLWNoYW5nZWQnLCAoZXZlbnQpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpIS5jb25maWc7XG5cbiAgICAgICAgICAgIGlmIChjb25maWcuc3RhY2tlZCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGlzRm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHdoaWxlICghaXNGb3VuZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFjdGl2ZU92ZXJsYXkgaXMgZWl0aGVyIGEgZGVzY2VuZGFudCBvZiBvdmVybGF5IG9yIG92ZXJsYXkgaXRzZWxmXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3RpdmVPdmVybGF5ID0gdGhpcy5hY3RpdmVPdmVybGF5cy5wb3AoKSE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgYXJyaXZlZCBhdCB0aGUgb3ZlcmxheSwgd2Ugc3RvcCBjbG9zaW5nXG4gICAgICAgICAgICAgICAgICAgIGlzRm91bmQgPSBhY3RpdmVPdmVybGF5ID09PSBvdmVybGF5IHx8IGFjdGl2ZU92ZXJsYXkgPT09IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhY3RpdmVPdmVybGF5LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxheS5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gb3ZlcmxheS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgb3ZlcmxheS5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvZ2dsZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGV2ZW50PzogRXZlbnQpIHtcblxuICAgICAgICBpZiAodGhpcy5pc092ZXJsYXlPcGVuKG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXksIGV2ZW50KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLm9wZW5PdmVybGF5KG92ZXJsYXksIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3lPdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCBkaXNjb25uZWN0OiBib29sZWFuID0gdHJ1ZSkge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIC8vIFRPRE86IHdlIG5lZWQgdG8gYWxzbyBkZXN0cm95IGRlc2NlbmRhbnQgb3ZlcmxheXM/XG4gICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24gJiYgZGVmaW5pdGlvbi5kZXN0cm95KSB7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24uZGVzdHJveSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpc2Nvbm5lY3QgJiYgb3ZlcmxheS5wYXJlbnRFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIG92ZXJsYXkucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChvdmVybGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmRlbGV0ZShvdmVybGF5KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgb25PdmVybGF5T3BlbiAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmICh0aGlzLmhhc092ZXJsYXkob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgY29uc3QgeyB1cGRhdGVMaXN0ZW5lciwgcG9zaXRpb25TdHJhdGVneSwgY29uZmlnIH0gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLnRlbXBsYXRlICYmIGNvbmZpZy5jb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0byBrZWVwIGEgdGVtcGxhdGUgdXAtdG8tZGF0ZSB3aXRoIGl0J3MgY29udGV4dCwgd2UgaGF2ZSB0byByZW5kZXIgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgLy8gZXZlcnl0aW1lIHRoZSBjb250ZXh0IHJlbmRlcnMgLSB0aGF0IGlzLCBvbiBldmVyeSB1cGRhdGUgd2hpY2ggd2FzIHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgIGNvbmZpZy5jb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJPdmVybGF5KG92ZXJsYXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocG9zaXRpb25TdHJhdGVneSkge1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25TdHJhdGVneS51cGRhdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVE9ETzogbWFuYWdlIGJhY2tkcm9wXG5cbiAgICAgICAgICAgIC8vIGlmIChjb25maWcuYmFja2Ryb3ApIHtcblxuICAgICAgICAgICAgLy8gICAgIHRoaXMuYmFja2Ryb3Auc2hvdygpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uT3ZlcmxheUNsb3NlIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBkb2Vzbid0IGdldCBjYWxsZWQgd2hlbiBwcm9ncmFtbWF0aWMgb3ZlcmxheXMgY2xvc2UuLi5cbiAgICAgICAgLy8gdGhlIGlzc3VlIGlzIHRoZSBvcGVuLWNoYW5nZWQgZXZlbnQgYmVpbmcgdHJpZ2dlcmVkIGluIHRoZSBvdmVybGF5J3MgdXBkYXRlIGN5Y2xlXG4gICAgICAgIC8vIHdoaWNoIGlzIGFmdGVyIHRoZSBvdmVybGF5IHdhcyBkZXN0cm95ZWQgYWxyZWFkeS4uLlxuICAgICAgICBpZiAodGhpcy5oYXNPdmVybGF5KG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHsgdXBkYXRlTGlzdGVuZXIsIGNvbmZpZyB9ID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy50ZW1wbGF0ZSAmJiBjb25maWcuY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgY29uZmlnLmNvbnRleHQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndXBkYXRlJywgdXBkYXRlTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoaXMuYmFja2Ryb3AuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvbmZpZ3VyZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9KTogT3ZlcmxheURlZmluaXRpb24ge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdjb25maWd1cmVPdmVybGF5KCkuLi4gJywgb3ZlcmxheSwgY29uZmlnKTtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uOiBPdmVybGF5RGVmaW5pdGlvbiA9IHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KG92ZXJsYXksIGNvbmZpZyksXG4gICAgICAgICAgICBvdmVybGF5Q29udHJvbGxlcjogdGhpcy5jcmVhdGVPdmVybGF5Q29udHJvbGxlcihvdmVybGF5LCBjb25maWcpLFxuICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXI6ICgpID0+IHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5KSxcbiAgICAgICAgICAgIG9wZW5DaGFuZ2VMaXN0ZW5lcjogKGV2ZW50OiBQcm9wZXJ0eUNoYW5nZUV2ZW50PGJvb2xlYW4+KSA9PiB0aGlzLmhhbmRsZU9wZW5DaGFuZ2Uob3ZlcmxheSwgZXZlbnQpLFxuICAgICAgICAgICAgZm9jdXNDaGFuZ2VMaXN0ZW5lcjogKGV2ZW50OiBGb2N1c0NoYW5nZUV2ZW50KSA9PiB0aGlzLmhhbmRsZUZvY3VzQ2hhbmdlKG92ZXJsYXksIGV2ZW50KSxcbiAgICAgICAgICAgIGRlc3Ryb3k6ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIG92ZXJsYXkucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3Blbi1jaGFuZ2VkJywgZGVmaW5pdGlvbi5vcGVuQ2hhbmdlTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2VQb3NpdGlvblN0cmF0ZWd5KG92ZXJsYXkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZU92ZXJsYXlDb250cm9sbGVyKG92ZXJsYXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gYXMgT3ZlcmxheURlZmluaXRpb247XG5cbiAgICAgICAgb3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKCdvcGVuLWNoYW5nZWQnLCBkZWZpbml0aW9uLm9wZW5DaGFuZ2VMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyKTtcblxuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVPdmVybGF5Q29uZmlnIChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7fSkge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXlEZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBjb25zdCBvdmVybGF5Q29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0geyAuLi5vdmVybGF5RGVmaW5pdGlvbi5jb25maWcsIC4uLmNvbmZpZyB9O1xuXG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb25TdHJhdGVneShvdmVybGF5LCBvdmVybGF5Q29uZmlnKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZU92ZXJsYXlDb250cm9sbGVyKG92ZXJsYXksIG92ZXJsYXlDb25maWcpO1xuXG4gICAgICAgIC8vIGZpbmFsbHkgc3RvcmUgdGhlIHVwZGF0ZWQgY29uZmlnIGluIHRoZSBPdmVybGF5RGVmaW5pdGlvblxuICAgICAgICBvdmVybGF5RGVmaW5pdGlvbi5jb25maWcgPSBvdmVybGF5Q29uZmlnO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVQb3NpdGlvblN0cmF0ZWd5IChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pIHtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBjb25zdCBoYXNUeXBlQ2hhbmdlZCA9IGRlZmluaXRpb24uY29uZmlnLnBvc2l0aW9uVHlwZSAhPT0gY29uZmlnLnBvc2l0aW9uVHlwZTtcbiAgICAgICAgY29uc3QgaGFzQ29uZmlnQ2hhbmdlZCA9IGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZChkZWZpbml0aW9uLmNvbmZpZywgY29uZmlnKTtcblxuICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlUG9zaXRpb25TdHJhdGVneS4uLiB0eXBlIGNoYW5nZWQ6ICVzLCBjb25maWcgY2hhbmdlZDogJXMnLCBoYXNUeXBlQ2hhbmdlZCwgaGFzQ29uZmlnQ2hhbmdlZCk7XG5cbiAgICAgICAgaWYgKGhhc1R5cGVDaGFuZ2VkIHx8IGhhc0NvbmZpZ0NoYW5nZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5kaXNwb3NlUG9zaXRpb25TdHJhdGVneShvdmVybGF5KTtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5wb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KG92ZXJsYXksIGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUG9zaXRpb25TdHJhdGVneSAob3ZlcmxheTogT3ZlcmxheSwgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+KTogUG9zaXRpb25TdHJhdGVneSB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5wb3NpdGlvblR5cGUpIHtcblxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMucG9zaXRpb25TdHJhdGVneUZhY3RvcnkuY3JlYXRlUG9zaXRpb25TdHJhdGVneShcbiAgICAgICAgICAgICAgICBjb25maWcucG9zaXRpb25UeXBlLFxuICAgICAgICAgICAgICAgIG92ZXJsYXksXG4gICAgICAgICAgICAgICAgdGhpcy5fZXh0cmFjdFBvc2l0aW9uQ29uZmlnKGNvbmZpZykpO1xuXG4gICAgICAgICAgICAvLyB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgYnVpbGRzIGl0cyBvd24gY29uZmlnIGJhc2VkIG9uIHRoZSBwb3NpdGlvblR5cGUgc2V0dGluZywgd2UgbmVlZCB0byByZWZsZWN0IHRoaXMgYmFja1xuICAgICAgICAgICAgLy8gVE9ETzogdGhpcyBzZWVtcyBhIHRhZCBoYWNreS4uLlxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihjb25maWcsIHBvc2l0aW9uU3RyYXRlZ3kuY29uZmlnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uU3RyYXRlZ3k7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcG9zZVBvc2l0aW9uU3RyYXRlZ3kgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBpZiAoZGVmaW5pdGlvbi5wb3NpdGlvblN0cmF0ZWd5KSB7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24ucG9zaXRpb25TdHJhdGVneS5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24ucG9zaXRpb25TdHJhdGVneSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIHRyaWdnZXIgZWxlbWVudCBhbmQgdHJpZ2dlciB0eXBlIG9mIGFuIE92ZXJsYXlcbiAgICAgKlxuICAgICAqIElmIHRoZSB0cmlnZ2VyIGVsZW1lbnQgY2hhbmdlZCwgdGhlIE92ZXJsYXlUcmlnZ2VyIGluc3RhbmNlIHdpbGwgYmUgZGV0YWNoZWQgZnJvbSB0aGUgb2xkIHRyaWdnZXIgZWxlbWVudFxuICAgICAqIGFuZCByZS1hdHRhY2hlZCB0byB0aGUgbmV3IHRyaWdnZXIgZWxlbWVudC4gSWYgdGhlIHRyaWdnZXIgdHlwZSBjaGFuZ2VkLCB0aGUgb2xkIE92ZXJsYXlUcmlnZ2VyIHdpbGwgYmUgZGV0YWNoZWQsXG4gICAgICogYSBuZXcgb25lIHdpbGwgYmUgY3JlYXRlZCBhbmQgYXR0YWNoZWQgdG8gdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlT3ZlcmxheUNvbnRyb2xsZXIgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPikge1xuXG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgIGNvbnN0IGhhc1R5cGVDaGFuZ2VkID0gY29uZmlnLmNvbnRyb2xsZXJUeXBlICE9PSBkZWZpbml0aW9uLmNvbmZpZy5jb250cm9sbGVyVHlwZTtcbiAgICAgICAgY29uc3QgaGFzVHJpZ2dlckNoYW5nZWQgPSBjb25maWcuY29udHJvbGxlciAhPT0gZGVmaW5pdGlvbi5jb25maWcuY29udHJvbGxlcjtcblxuICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlT3ZlcmxheVRyaWdnZXIuLi4gdHlwZSBjaGFuZ2VkOiAlcywgdHJpZ2dlciBjaGFuZ2VkOiAlcycsIGhhc1R5cGVDaGFuZ2VkLCBoYXNUcmlnZ2VyQ2hhbmdlZCk7XG5cbiAgICAgICAgaWYgKGhhc1RyaWdnZXJDaGFuZ2VkIHx8IGhhc1R5cGVDaGFuZ2VkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZU92ZXJsYXlDb250cm9sbGVyKG92ZXJsYXkpO1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLm92ZXJsYXlDb250cm9sbGVyID0gdGhpcy5jcmVhdGVPdmVybGF5Q29udHJvbGxlcihvdmVybGF5LCBjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZU92ZXJsYXlDb250cm9sbGVyIChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pOiBPdmVybGF5Q29udHJvbGxlciB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5jb250cm9sbGVyVHlwZSkge1xuXG4gICAgICAgICAgICBjb25zdCBvdmVybGF5Q29udHJvbGxlciA9IHRoaXMub3ZlcmxheUNvbnRyb2xsZXJGYWN0b3J5LmNyZWF0ZU92ZXJsYXlDb250cm9sbGVyKGNvbmZpZy5jb250cm9sbGVyVHlwZSwgb3ZlcmxheSwgdGhpcywgY29uZmlnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXJFbGVtZW50ID0gY29uZmlnLmNvbnRyb2xsZXIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbmZpZy5jb250cm9sbGVyKSBhcyBIVE1MRWxlbWVudCB8fCB1bmRlZmluZWQgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIG92ZXJsYXlDb250cm9sbGVyLmF0dGFjaChjb250cm9sbGVyRWxlbWVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBvdmVybGF5Q29udHJvbGxlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwb3NlT3ZlcmxheUNvbnRyb2xsZXIgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBpZiAoZGVmaW5pdGlvbi5vdmVybGF5Q29udHJvbGxlcikge1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLm92ZXJsYXlDb250cm9sbGVyLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLm92ZXJsYXlDb250cm9sbGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIG92ZXJsYXkgdG8gdGhlIHtAbGluayBPdmVybGF5U2VydmljZX0ncyByb290IGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEFsbCBvdmVybGF5cyBhcmUgYXR0YWNoZWQgdG8gdGhlIHJvb3QgZWxlbWVudCBpbiBvcmRlciwgYWZ0ZXIgdGhlIHtAbGluayBPdmVybGF5QmFja2Ryb3B9LlxuICAgICAqXG4gICAgICogQHBhcmFtIG92ZXJsYXkgLSBUaGUgb3ZlcmxheSBpbnN0YW5jZSB0byBhdHRhY2hcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXR0YWNoT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmIChvdmVybGF5LnBhcmVudEVsZW1lbnQgPT09IHRoaXMucm9vdCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBsYXN0T3ZlcmxheTogSFRNTEVsZW1lbnQgPSB0aGlzLmJhY2tkcm9wO1xuXG4gICAgICAgIHdoaWxlIChsYXN0T3ZlcmxheS5uZXh0U2libGluZyAmJiBsYXN0T3ZlcmxheS5uZXh0U2libGluZyBpbnN0YW5jZW9mIE92ZXJsYXkpIHtcblxuICAgICAgICAgICAgbGFzdE92ZXJsYXkgPSBsYXN0T3ZlcmxheS5uZXh0U2libGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGluc2VydEFmdGVyKG92ZXJsYXksIGxhc3RPdmVybGF5KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVuZGVyT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmICh0aGlzLmhhc092ZXJsYXkob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdXNlIHRlbXBsYXRlIGFuZCBjb250ZXh0IGZyb20gZGVmaW5pdGlvbi5jb25maWdcbiAgICAgICAgICAgIGNvbnN0IHsgdGVtcGxhdGUsIGNvbnRleHQgfSA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSEuY29uZmlnO1xuXG4gICAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGNvbnRleHQgaXMgYWx3YXlzIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIHVzZSBvdmVybGF5IGFzIGZhbGxiYWNrLWNvbnRleHRcbiAgICAgICAgICAgICAgICByZW5kZXIodGVtcGxhdGUoY29udGV4dCB8fCBvdmVybGF5KSwgb3ZlcmxheSwgeyBldmVudENvbnRleHQ6IGNvbnRleHQgfHwgb3ZlcmxheSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuQ2hhbmdlIChvdmVybGF5OiBPdmVybGF5LCBldmVudDogUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikge1xuXG4gICAgICAgIGNvbnN0IG9wZW4gPSBldmVudC5kZXRhaWwuY3VycmVudDtcblxuICAgICAgICBpZiAob3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLm9uT3ZlcmxheU9wZW4ob3ZlcmxheSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlDbG9zZShvdmVybGF5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0NoYW5nZSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ6IEZvY3VzQ2hhbmdlRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBoYXNGb2N1cyA9IGV2ZW50LmRldGFpbC50eXBlID09PSAnZm9jdXNpbic7XG5cbiAgICAgICAgaWYgKCFoYXNGb2N1cykge1xuXG4gICAgICAgICAgICAvLyB3aGVuIGxvb3NpbmcgZm9jdXMsIHdlIHdhaXQgZm9yIHBvdGVudGlhbCBmb2N1c2luIGV2ZW50cyBvbiBjaGlsZCBvdmVybGF5cyBieSBkZWxheWluZyB0aGUgYWN0aXZlIGNoZWNrIHdpdGggYSBwcm9taXNlXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gd2UgY2hlY2sgaWYgdGhlIG92ZXJsYXkgaXMgYWN0aXZlIGFuZCBpZiBub3QsIHdlIGNsb3NlIGl0XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzT3ZlcmxheUFjdGl2ZShvdmVybGF5KSkgdGhpcy5jbG9zZU92ZXJsYXkob3ZlcmxheSwgZXZlbnQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2V4dHJhY3RQb3NpdGlvbkNvbmZpZyAob3ZlcmxheUNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPik6IFBhcnRpYWw8UG9zaXRpb25Db25maWc+IHtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbkNvbmZpZzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4gPSB7fTtcblxuICAgICAgICBQT1NJVElPTl9DT05GSUdfRklFTERTLmZvckVhY2goa2V5ID0+IHtcblxuICAgICAgICAgICAgaWYgKG92ZXJsYXlDb25maWdba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbkNvbmZpZ1trZXldID0gb3ZlcmxheUNvbmZpZ1trZXldIGFzIGFueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc092ZXJsYXkob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgdGhyb3cgT1ZFUkxBWV9VTlJFR0lTVEVSRURfRVJST1Iob3ZlcmxheS5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgT3ZlcmxheSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCAnLi9vdmVybGF5L292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4vb3ZlcmxheS9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXlDb25maWcgfSBmcm9tICcuL292ZXJsYXkvb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHsgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuL292ZXJsYXkvb3ZlcmxheS1zZXJ2aWNlJztcblxuY29uc3QgY3VzdG9tT3ZlcmxheUNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHtcbiAgICBhbGlnbm1lbnQ6IHtcbiAgICAgICAgb3JpZ2luOiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICAgICAgdmVydGljYWw6ICdzdGFydCcsXG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ3N0YXJ0JyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnZW5kJyxcbiAgICAgICAgfSxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICAgICAgdmVydGljYWw6IDAsXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCB0b29sdGlwT3ZlcmxheUNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHtcbiAgICBiYWNrZHJvcDogZmFsc2UsXG4gICAgdHJhcEZvY3VzOiBmYWxzZSxcbiAgICBzdGFja2VkOiBmYWxzZSxcbiAgICBhbGlnbm1lbnQ6IHtcbiAgICAgICAgb3JpZ2luOiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnLFxuICAgICAgICB9LFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgICAgICAgICAgdmVydGljYWw6ICdlbmQnLFxuICAgICAgICB9LFxuICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6IDAsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogMTAsXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5AY29tcG9uZW50PE92ZXJsYXlEZW1vQ29tcG9uZW50Pih7XG4gICAgc2VsZWN0b3I6ICdvdmVybGF5LWRlbW8nLFxuICAgIHNoYWRvdzogZmFsc2UsXG4gICAgdGVtcGxhdGU6IChlbGVtZW50KSA9PiBodG1sYFxuICAgIDxidXR0b24gaWQ9XCJvdmVybGF5XCI+U2hvdyBPdmVybGF5PC9idXR0b24+XG5cbiAgICA8dWktb3ZlcmxheSBjb250cm9sbGVyPVwiI292ZXJsYXlcIiBjb250cm9sbGVyLXR5cGU9XCJkaWFsb2dcIiBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCIgb3JpZ2luPVwiI292ZXJsYXlcIiAuY29uZmlnPSR7IGN1c3RvbU92ZXJsYXlDb25maWcgfT5cbiAgICAgICAgPGgzPk92ZXJsYXk8L2gzPlxuICAgICAgICA8cD5UaGlzIGlzIHRoZSBjb250ZW50IG9mIHRoZSBvdmVybGF5OiAkeyBlbGVtZW50LmNvdW50ZXIgfTwvcD5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICBUaGlzIGlzIGFuIGlucHV0OiA8aW5wdXQgdHlwZT1cInRleHRcIi8+XG4gICAgICAgIDwvcD5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICBUaGlzIGJ1dHRvbiBvcGVucyBhbm90aGVyIG92ZXJsYXk6XG5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJhbm90aGVyLW92ZXJsYXlcIj5Bbm90aGVyIE92ZXJsYXk8L2J1dHRvbj5cbiAgICAgICAgPC9wPlxuICAgIDwvdWktb3ZlcmxheT5cblxuICAgIDx1aS1vdmVybGF5IGNvbnRyb2xsZXI9XCIjYW5vdGhlci1vdmVybGF5XCIgY29udHJvbGxlci10eXBlPVwiZGlhbG9nXCIgcG9zaXRpb24tdHlwZT1cImNvbm5lY3RlZFwiIG9yaWdpbj1cIiNhbm90aGVyLW92ZXJsYXlcIj5cbiAgICAgICAgPGgzPkFub3RoZXIgT3ZlcmxheTwvaDM+XG4gICAgICAgIDxwPkp1c3Qgc29tZSBzdGF0aWMgY29udGVudC4uLjwvcD5cbiAgICA8L3VpLW92ZXJsYXk+XG5cbiAgICA8YnV0dG9uIGlkPVwib3ZlcmxheS1wcm9ncmFtbWF0aWNcIiBAY2xpY2s9JHsgZWxlbWVudC5zaG93T3ZlcmxheSB9PlNob3cgcHJvZ3JhbW1hdGljIG92ZXJsYXk8L2J1dHRvbj5cblxuICAgIDxwPldlIGhhdmUgPGEgaHJlZj1cIiNcIiBpZD1cInRvb2x0aXBcIj50b29sdGlwczwvYT4gdG9vLi4uPC9wPlxuXG4gICAgPHVpLW92ZXJsYXkgY29udHJvbGxlcj1cIiN0b29sdGlwXCIgY29udHJvbGxlci10eXBlPVwidG9vbHRpcFwiIHBvc2l0aW9uLXR5cGU9XCJjb25uZWN0ZWRcIiBvcmlnaW49XCIjdG9vbHRpcFwiIC5jb25maWc9JHsgdG9vbHRpcE92ZXJsYXlDb25maWcgfT5cbiAgICAgICAgPHA+SSBhbSB0aGUgdG9vbHRpcCBjb250ZW50LjwvcD5cbiAgICA8L3VpLW92ZXJsYXk+XG5cbiAgICA8dWktb3ZlcmxheSBjb250cm9sbGVyPVwiI3Rvb2x0aXBcIiBjb250cm9sbGVyLXR5cGU9XCJkaWFsb2dcIiBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCIgb3JpZ2luPVwiI3Rvb2x0aXBcIj5cbiAgICAgICAgPHA+SSdtIGFub3RoZXIgb3ZlcmxheSBvbiB0aGUgdG9vbHRpcCB0cmlnZ2VyLjwvcD5cbiAgICA8L3VpLW92ZXJsYXk+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5RGVtb0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgb3ZlcmxheVNlcnZpY2UgPSBuZXcgT3ZlcmxheVNlcnZpY2UoKTtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5PzogT3ZlcmxheTtcblxuICAgIHByb3RlY3RlZCB0aW1lb3V0ITogbnVtYmVyO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiBmYWxzZVxuICAgIH0pXG4gICAgY291bnRlciA9IDA7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLmNvdW50KCk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmRpc2Nvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgfVxuXG4gICAgY29uZmlybSAoKSB7XG5cbiAgICAgICAgYWxlcnQoYFlvdSBjb25maXJtZWQgYXQgJHsgdGhpcy5jb3VudGVyIH0uYCk7XG4gICAgfVxuXG4gICAgY2FuY2VsICgpIHtcblxuICAgICAgICBhbGVydChgWW91IGNhbmNlbGxlZCBhdCAkeyB0aGlzLmNvdW50ZXIgfS5gKTtcbiAgICB9XG5cbiAgICBzaG93T3ZlcmxheSAoZXZlbnQ6IEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXkpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgdGVtcGxhdGUgZnVuY3Rpb24gaW4gdGhlIGFwcCBjb21wb25lbnQncyBjb250ZXh0XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9ICgpID0+IGh0bWxgXG4gICAgICAgICAgICAgICAgPGgzPlByb2dyYW1tYXRpYyBPdmVybGF5PC9oMz5cbiAgICAgICAgICAgICAgICA8cD5UaGlzIGlzIHRoZSBjb250ZW50IG9mIHRoZSBwb3BvdmVyOiAkeyB0aGlzLmNvdW50ZXIgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD48YnV0dG9uIEBjbGljaz0keyB0aGlzLmNsb3NlT3ZlcmxheSB9PkdvdCBpdDwvYnV0dG9uPjwvcD5cbiAgICAgICAgICAgIGA7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyaWdnZXIgPSBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIHBhc3MgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uIGFuZCBhIHJlZmVyZW5jZSB0byB0aGUgdGVtcGxhdGUncyBjb250ZXh0ICh0aGUgYXBwIGNvbXBvbmVudClcbiAgICAgICAgICAgIC8vIHRvIHRoZSBvdmVybGF5IHNlcnZpY2VcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IHRoaXMub3ZlcmxheVNlcnZpY2UuY3JlYXRlT3ZlcmxheSh7IHBvc2l0aW9uVHlwZTogJ2NlbnRlcmVkJywgY29udHJvbGxlclR5cGU6ICdkZWZhdWx0JywgdGVtcGxhdGU6IHRlbXBsYXRlLCBjb250ZXh0OiB0aGlzLCBzdGFja2VkOiB0cnVlLCB0cmFwRm9jdXM6IHRydWUsIGF1dG9Gb2N1czogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2Uub3Blbk92ZXJsYXkodGhpcy5vdmVybGF5KTtcbiAgICB9XG5cbiAgICBjbG9zZU92ZXJsYXkgKCkge1xuXG4gICAgICAgIC8vIGlmICh0aGlzLm92ZXJsYXkpIHRoaXMub3ZlcmxheVNlcnZpY2UuY2xvc2VPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheSkge1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlTZXJ2aWNlLmRlc3Ryb3lPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb3VudCAoKSB7XG5cbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY291bnRlcisrO1xuXG4gICAgICAgICAgICB0aGlzLmNvdW50KCk7XG5cbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN0b3AgKCkge1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsXG4gICAgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIENoYW5nZXMsIENvbXBvbmVudCxcbiAgICBjb21wb25lbnQsXG4gICAgY3NzLFxuICAgIGxpc3RlbmVyLFxuICAgIHByb3BlcnR5XG59IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgVGFiUGFuZWwgfSBmcm9tICcuL3RhYi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgcGFkZGluZzogMC41cmVtIDAuNXJlbTtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIDAgMDtcbiAgICAgICAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1zZWxlY3RlZD10cnVlXSk6YWZ0ZXIge1xuICAgICAgICBjb250ZW50OiAnJztcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgYm90dG9tOiBjYWxjKC0xICogdmFyKC0tYm9yZGVyLXdpZHRoKSk7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tYm9yZGVyLXdpZHRoKSArIDAuNXJlbSk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWIgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJpdmF0ZSBfcGFuZWw6IFRhYlBhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIF9zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtY29udHJvbHMnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogV2UgcHJvdmlkZSBvdXIgb3duIHRhYmluZGV4IHByb3BlcnR5LCBzbyB3ZSBjYW4gc2V0IGl0IHRvIGBudWxsYFxuICAgICAqIHRvIHJlbW92ZSB0aGUgdGFiaW5kZXgtYXR0cmlidXRlLlxuICAgICAqL1xuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ3RhYmluZGV4JyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtc2VsZWN0ZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgc2VsZWN0ZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAodmFsdWUgPyAwIDogLTEpO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6ICh0aGlzLnNlbGVjdGVkID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBnZXQgcGFuZWwgKCk6IFRhYlBhbmVsIHwgbnVsbCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuXG4gICAgICAgICAgICB0aGlzLl9wYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udHJvbHMpIGFzIFRhYlBhbmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWInXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IC0xO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYW5lbCkgdGhpcy5wYW5lbC5sYWJlbGxlZEJ5ID0gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBkZXNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSBmYWxzZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBBcnJvd0Rvd24gfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IEFjdGl2ZUl0ZW1DaGFuZ2UsIEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi90YWInO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1saXN0JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdyBub3dyYXA7XG4gICAgfVxuICAgIDo6c2xvdHRlZCh1aS10YWIpIHtcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjI1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWJMaXN0IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8VGFiPjtcblxuICAgIHByb3RlY3RlZCBzZWxlY3RlZFRhYiE6IFRhYjtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJsaXN0JztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFRhYi5zZWxlY3RvciksICdob3Jpem9udGFsJyk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGNvbnN0IHNsb3QgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3Rvcignc2xvdCcpIGFzIEhUTUxTbG90RWxlbWVudDtcblxuICAgICAgICAgICAgLy8gc2xvdC5hZGRFdmVudExpc3RlbmVyKCdzbG90Y2hhbmdlJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coYCR7c2xvdC5uYW1lfSBjaGFuZ2VkLi4uYCwgc2xvdC5hc3NpZ25lZE5vZGVzKCkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5xdWVyeVNlbGVjdG9yKGAkeyBUYWIuc2VsZWN0b3IgfVthcmlhLXNlbGVjdGVkPXRydWVdYCkgYXMgVGFiO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRhYlxuICAgICAgICAgICAgICAgID8gdGhpcy5mb2N1c01hbmFnZXIuc2V0QWN0aXZlSXRlbShzZWxlY3RlZFRhYilcbiAgICAgICAgICAgICAgICA6IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuXG4gICAgICAgICAgICAvLyBzZXR0aW5nIHRoZSBhY3RpdmUgaXRlbSB2aWEgdGhlIGZvY3VzIG1hbmFnZXIncyBBUEkgd2lsbCBub3QgdHJpZ2dlciBhbiBldmVudFxuICAgICAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBtYW51YWxseSBzZWxlY3QgdGhlIGluaXRpYWxseSBhY3RpdmUgdGFiXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuc2VsZWN0VGFiKHRoaXMuZm9jdXNNYW5hZ2VyLmdldEFjdGl2ZUl0ZW0oKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdrZXlkb3duJyB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgQXJyb3dEb3duOlxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSB0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkVGFiICYmIHNlbGVjdGVkVGFiLnBhbmVsKSBzZWxlY3RlZFRhYi5wYW5lbC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyPFRhYkxpc3Q+KHtcbiAgICAgICAgZXZlbnQ6ICdhY3RpdmUtaXRlbS1jaGFuZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZm9jdXNNYW5hZ2VyOyB9XG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlQWN0aXZlVGFiQ2hhbmdlIChldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUYWI+KSB7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNUYWIgPSBldmVudC5kZXRhaWwucHJldmlvdXMuaXRlbTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSBldmVudC5kZXRhaWwuY3VycmVudC5pdGVtO1xuXG4gICAgICAgIGlmIChwcmV2aW91c1RhYiAhPT0gc2VsZWN0ZWRUYWIpIHtcblxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFRhYihwcmV2aW91c1RhYik7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdFRhYihzZWxlY3RlZFRhYik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5zZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRlc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5kZXNlbGVjdCgpO1xuXG4gICAgICAgICAgICBpZiAodGFiLnBhbmVsKSB0YWIucGFuZWwuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDAgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cyk7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1oaWRkZW4nLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtbGFiZWxsZWRieScsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgbGFiZWxsZWRCeSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJwYW5lbCdcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxUb2dnbGU+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRvZ2dsZScsXG4gICAgdGVtcGxhdGU6IHRvZ2dsZSA9PiBodG1sYFxuICAgIDxzdHlsZT5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgICAgLS10aW1pbmctY3ViaWM6IGN1YmljLWJlemllcigwLjU1LCAwLjA2LCAwLjY4LCAwLjE5KTtcbiAgICAgICAgICAgIC0tdGltaW5nLXNpbmU6IGN1YmljLWJlemllcigwLjQ3LCAwLCAwLjc1LCAwLjcyKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi10aW1pbmc6IHZhcigtLXRpbWluZy1zaW5lKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi1kdXJhdGlvbjogLjFzO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCh2YXIoLS1mb250LXNpemUpLCAxZnIpKTtcblxuICAgICAgICAgICAgbWluLXdpZHRoOiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKiAyICsgdmFyKC0tYm9yZGVyLXdpZHRoKSAqIDIpO1xuICAgICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKyB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSAqIDIpO1xuICAgICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICAgICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG5cbiAgICAgICAgICAgIC8qIHRyYW5zaXRpb24tcHJvcGVydHk6IGJhY2tncm91bmQtY29sb3IsIGJvcmRlci1jb2xvcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tZHVyYXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pO1xuICAgICAgICAgICAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTsgKi9cbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPXRydWVdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2xhYmVsLW9uXVtsYWJlbC1vZmZdKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgICAgICB9XG4gICAgICAgIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgaGVpZ2h0OiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgd2lkdGg6IHZhcigtLWZvbnQtc2l6ZSk7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICB3aWR0aDogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAwO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXVtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgfVxuICAgICAgICAubGFiZWwge1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgcGFkZGluZzogMCAuMjVyZW07XG4gICAgICAgICAgICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAganVzdGlmeS1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAubGFiZWwtb24ge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJmYWxzZVwiXSkgLmxhYmVsLW9mZiB7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgIH1cblxuICAgIDwvc3R5bGU+XG4gICAgPHNwYW4gY2xhc3M9XCJ0b2dnbGUtdGh1bWJcIj48L3NwYW4+XG4gICAgJHsgdG9nZ2xlLmxhYmVsT24gJiYgdG9nZ2xlLmxhYmVsT2ZmXG4gICAgICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vZmZcIj4keyB0b2dnbGUubGFiZWxPZmYgfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9uXCI+JHsgdG9nZ2xlLmxhYmVsT24gfTwvc3Bhbj5gXG4gICAgICAgICAgICA6ICcnXG4gICAgICAgIH1cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIFRvZ2dsZSBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNoZWNrZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZ1xuICAgIH0pXG4gICAgbGFiZWwgPSAnJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6IGZhbHNlXG4gICAgfSlcbiAgICBsYWJlbE9uID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPZmYgPSAnJztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdzd2l0Y2gnO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICAvLyB0cmlnZ2VyIHByb3BlcnR5LWNoYW5nZSBldmVudCBmb3IgYGNoZWNrZWRgXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBFbnRlciB8fCBldmVudC5rZXkgPT09IFNwYWNlKSB7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgIC8vIHByZXZlbnQgc3BhY2Uga2V5IGZyb20gc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0ICcuL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSAnLi9hcHAuc3R5bGVzJztcbmltcG9ydCB7IHRlbXBsYXRlIH0gZnJvbSAnLi9hcHAudGVtcGxhdGUnO1xuaW1wb3J0ICcuL2NhcmQnO1xuaW1wb3J0ICcuL2NoZWNrYm94JztcbmltcG9ydCAnLi9pY29uL2ljb24nO1xuaW1wb3J0ICcuL292ZXJsYXktZGVtbyc7XG5pbXBvcnQgJy4vdGFicy90YWInO1xuaW1wb3J0ICcuL3RhYnMvdGFiLWxpc3QnO1xuaW1wb3J0ICcuL3RhYnMvdGFiLXBhbmVsJztcbmltcG9ydCAnLi90b2dnbGUnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2RlbW8tYXBwJyxcbiAgICBzaGFkb3c6IGZhbHNlLFxuICAgIHN0eWxlczogW3N0eWxlc10sXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG59KVxuZXhwb3J0IGNsYXNzIEFwcCBleHRlbmRzIENvbXBvbmVudCB7IH1cbiIsImltcG9ydCAnLi9zcmMvYXBwJztcblxuZnVuY3Rpb24gYm9vdHN0cmFwICgpIHtcblxuICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndWktY2hlY2tib3gnKTtcblxuICAgIGlmIChjaGVja2JveCkge1xuXG4gICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoZWNrZWQtY2hhbmdlZCcsIGV2ZW50ID0+IGNvbnNvbGUubG9nKChldmVudCBhcyBDdXN0b21FdmVudCkuZGV0YWlsKSk7XG4gICAgfVxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGJvb3RzdHJhcCk7XG4iXSwibmFtZXMiOlsicHJlcGFyZUNvbnN0cnVjdG9yIiwiVGFiIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsTUFBTSxVQUFVLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUNqQyxJQTZDTyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSztJQUNsQyxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssVUFBVSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDO0lBQ0Y7O0lDOURBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVM7SUFDL0QsSUFBSSxNQUFNLENBQUMs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
