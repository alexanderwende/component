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

    const DEFAULT_SELECTOR_DECLARATION = {
        query: null,
        all: false,
    };
    //# sourceMappingURL=selector-declaration.js.map

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
     * A special error class which is thrown when a task is canceled
     *
     * @remarks
     * This error class is used to reject a task's Promise, when the task
     * is canceled. You can check for this specific error, to handle canceled
     * tasks different from otherwise rejected tasks.
     *
     * ```typescript
     * const task = microTask(() => {
     *      // do sth...
     * });
     *
     * task.cancel();
     *
     * task.promise.catch(reason => {
     *      if (reason instanceof TaskCanceledError) {
     *          // ...this task was canceled
     *      }
     * });
     * ```
     */
    class TaskCanceledError extends Error {
        constructor(message) {
            super(message);
            this.name = 'TaskCanceledError';
        }
    }
    const TASK_CANCELED_ERROR = () => new TaskCanceledError('Task canceled.');
    /**
     * Executes a task callback in the next micro-task and returns a Promise which will
     * resolve when the task was executed.
     *
     * @remarks
     * Uses {@link Promise.then} to schedule the task callback in the next micro-task.
     * If the task is canceled before the next micro-task, the Promise executor won't
     * run the task callback but reject the Promise.
     *
     * @param task  The callback function to execute
     * @returns     A Promise which will resolve after the callback was executed
     */
    function microTask(task) {
        let canceled = false;
        const promise = Promise.resolve().then(() => {
            /**
             * The actual Promise is created in `Promise.then`'s executor, in order
             * for it to execute the task in the next micro-task. This means we can't
             * get a reference of the Promise's reject method in the scope of this
             * function. But we can use a local variable in this function's scope to
             * prevent {@link runTask} to be executed.
             */
            return new Promise((resolve, reject) => {
                if (canceled) {
                    reject(TASK_CANCELED_ERROR());
                }
                else {
                    runTask(task, resolve, reject);
                }
            });
        });
        const cancel = () => canceled = true;
        return { promise, cancel };
    }
    /**
     * Executes a task callback in the next animation frame and returns a Promise which will
     * resolve when the task was executed
     *
     * @remarks
     * Uses {@link requestAnimationFrame} to schedule the task callback in the next animation frame.
     * If the task is canceled before the next animation frame, the animation frame is canceled and
     * the Promsie is rejected.
     *
     * @param task  The callback function to execute
     * @returns     A Promise which will resolve after the callback was executed
     */
    function animationFrameTask(task) {
        let cancel;
        const promise = new Promise((resolve, reject) => {
            let animationFrame = requestAnimationFrame(() => runTask(task, resolve, reject));
            cancel = () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = undefined;
                    reject(TASK_CANCELED_ERROR());
                }
            };
        });
        return { promise, cancel };
    }
    /**
     * Runs a task callback safely against a Promise's reject and resolve callbacks.
     *
     * @internal
     * @private
     */
    function runTask(task, resolve, reject) {
        try {
            resolve(task());
        }
        catch (error) {
            reject(error);
        }
    }
    //# sourceMappingURL=tasks.js.map

    /**
     * Decorates a {@link Component} property as a selector
     *
     * @param options The selector declaration
     */
    function selector(options) {
        return function (target, propertyKey, propertyDescriptor) {
            var _a, _b;
            const descriptor = propertyDescriptor || getPropertyDescriptor(target, propertyKey);
            const hiddenKey = Symbol(`__${propertyKey.toString()}`);
            const getter = ((_a = descriptor) === null || _a === void 0 ? void 0 : _a.get) || function () { return this[hiddenKey]; };
            const setter = ((_b = descriptor) === null || _b === void 0 ? void 0 : _b.set) || function (value) { this[hiddenKey] = value; };
            const wrappedDescriptor = {
                configurable: true,
                enumerable: true,
                get() {
                    return getter.call(this);
                },
                set(value) {
                    setter.call(this, value);
                    // selectors are queried during the update cycle, this means, when they change
                    // we cannot trigger another update from within the current update cycle
                    // we need to schedule an update just after this update is over
                    // also, selectors are not properties, so they don't appear in the property maps
                    // that's why we invoke requestUpdate without any parameters
                    microTask(() => this.requestUpdate());
                }
            };
            const constructor = target.constructor;
            options = Object.assign(Object.assign({}, DEFAULT_SELECTOR_DECLARATION), options);
            prepareConstructor$1(constructor);
            if (options.query === null) {
                constructor.selectors.delete(propertyKey);
            }
            else {
                constructor.selectors.set(propertyKey, Object.assign({}, options));
            }
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
     * Prepares the component constructor by initializing static properties for the selector decorator,
     * so we don't modify a base class's static properties.
     *
     * @remarks
     * When the selector decorator stores selector declarations in the constructor, we have to make sure the
     * static selectors field is initialized on the current constructor. Otherwise we add selector declarations
     * to the base class's static field. We also make sure to initialize the selector map with the values of
     * the base class's map to properly inherit all selector declarations.
     *
     * @param constructor The component constructor to prepare
     *
     * @internal
     * @private
     */
    function prepareConstructor$1(constructor) {
        if (!constructor.hasOwnProperty('selectors'))
            constructor.selectors = new Map(constructor.selectors);
    }
    //# sourceMappingURL=selector.js.map

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
        // TODO: consider setting false as default value
        attribute: true,
        converter: AttributeConverterDefault,
        reflectAttribute: true,
        reflectProperty: true,
        notify: true,
        observe: DEFAULT_PROPERTY_CHANGE_DETECTOR,
    };
    //# sourceMappingURL=property-declaration.js.map

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
            var _a, _b;
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
            const hiddenKey = Symbol(`__${propertyKey.toString()}`);
            // if we found an accessor descriptor (from either this class or a parent) we use it, otherwise we create
            // default accessors to store the actual property value in a hidden field and retrieve it from there
            const getter = ((_a = descriptor) === null || _a === void 0 ? void 0 : _a.get) || function () { return this[hiddenKey]; };
            const setter = ((_b = descriptor) === null || _b === void 0 ? void 0 : _b.set) || function (value) { this[hiddenKey] = value; };
            // we define a new accessor descriptor which will wrap the previously retrieved or created accessors
            // and request an update of the component whenever the property is set
            const wrappedDescriptor = {
                configurable: true,
                enumerable: true,
                get() {
                    return getter.call(this);
                },
                set(value) {
                    const oldValue = getter.call(this);
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
            prepareConstructor$2(constructor);
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
    function prepareConstructor$2(constructor) {
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
     * The default EventInit object
     *
     * @remarks
     * We usually want our CustomEvents to bubble, cross shadow DOM boundaries and be cancelable,
     * so we set up a default object with this configuration.
     */
    const DEFAULT_EVENT_INIT = {
        bubbles: true,
        cancelable: true,
        composed: true,
    };
    /**
     * The ComponentEvent class
     *
     * @remarks
     * The ComponentEvent class extends CustomEvent and simply provides the default EventInit object and its typing
     * ensures that the event detail contains a target value.
     */
    class ComponentEvent extends CustomEvent {
        constructor(type, detail, init = {}) {
            const eventInit = Object.assign(Object.assign(Object.assign({}, DEFAULT_EVENT_INIT), init), { detail });
            super(type, eventInit);
        }
    }
    /**
     * The PropertyChangeEvent class
     *
     * @remarks
     * A custom event, as dispatched by the {@link Component._notifyProperty} method. The constructor
     * ensures a conventional event name is created for the property key and imposes the correct type
     * on the event detail.
     */
    class PropertyChangeEvent extends ComponentEvent {
        constructor(propertyKey, detail, init) {
            const type = createEventName(propertyKey, '', 'changed');
            super(type, detail, init);
        }
    }
    /**
     * The LifecycleEvent class
     *
     * @remarks
     * A custom event, as dispatched by the {@link Component._notifyLifecycle} method. The constructor
     * ensures the allowed lifecycles.
     */
    class LifecycleEvent extends ComponentEvent {
        constructor(lifecycle, detail, init) {
            super(lifecycle, detail, init);
        }
    }
    //# sourceMappingURL=events.js.map

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
         *          return [
         *              ...super.observedAttributes,
         *              'my-additional-attribute'
         *          ];
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
            this._unselect();
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
         * @deprecated  Use {@link Component.dispatch} instead
         */
        notify(eventName, eventInit) {
            // TODO: improve this! we should pull the dispatch method from example into ./events
            // and use it here; we should change notify() arguments to type, detail, init
            // maybe we should even rename it to dispatch...
            this.dispatchEvent(new CustomEvent(eventName, eventInit));
        }
        dispatch(eventOrType, detail, init = {}) {
            if (typeof eventOrType === 'string') {
                eventOrType = new ComponentEvent(eventOrType, Object.assign({ target: this }, detail), init);
            }
            return this.dispatchEvent(eventOrType);
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
         * @param propertyKey   The key of the changed property that requests the update
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
         * To handle updates differently, this method can be overridden.
         *
         * @param changes       A map of properties that changed in the update, containg the property key and the old value
         * @param reflections   A map of properties that were marked for reflection in the update, containg the property key and the old value
         * @param notifications A map of properties that were marked for notification in the update, containg the property key and the old value
         * @param firstUpdate   A boolean indicating if this is the first update of the component
         */
        update(changes, reflections, notifications, firstUpdate = false) {
            this.render();
            // in the first update we adopt the element's styles and set up declared listeners
            if (firstUpdate) {
                this._style();
                this._select();
                // bind listeners after render to ensure all DOM is rendered, all properties
                // are up-to-date and any user-created objects (e.g. workers) will be created in an
                // overridden connectedCallback; but before dispatching any property-change events
                // to make sure local listeners are bound first
                this._listen();
            }
            else {
                this._select();
                // TODO: can we check if selected nodes changed and if listeners are affected?
            }
            this.reflectProperties(reflections);
            this.notifyProperties(notifications);
        }
        /**
         * Resets the component after an update
         *
         * @description
         * Resets the component's property tracking maps which are used in the update cycle to track changes.
         */
        reset() {
            this._changedProperties = new Map();
            this._reflectingProperties = new Map();
            this._notifyingProperties = new Map();
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
         * Reflect all property changes
         *
         * @remarks
         * This method is used to reflect all properties of the component, which have been marked for reflection.
         * It is called by the {@link Component.update} method after the template has been rendered. If no
         * properties map is provided, this method will reflect all properties which have been marked for
         * reflection since the last `update`.
         *
         * @param properties An optional map of property keys and their previous value
         */
        reflectProperties(properties) {
            properties = (properties !== null && properties !== void 0 ? properties : this._reflectingProperties);
            properties.forEach((oldValue, propertyKey) => {
                this.reflectProperty(propertyKey, oldValue, this[propertyKey]);
            });
        }
        /**
         * Raise change events for all changed properties
         *
         * @remarks
         * This method is used to raise change events for all properties of the component, which have been
         * marked for notification. It is called by the {@link Component.update} method after the template
         * has been rendered and properties have been reflected. If no properties map is provided, this
         * method will notify all properties which have been marked for notification since the last `update`.
         *
         * @param properties An optional map of property keys and their previous value
         */
        notifyProperties(properties) {
            properties = (properties !== null && properties !== void 0 ? properties : this._notifyingProperties);
            properties.forEach((oldValue, propertyKey) => {
                this.notifyProperty(propertyKey, oldValue, this[propertyKey]);
            });
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
        _style() {
            const constructor = this.constructor;
            let styleSheet;
            let styleElement;
            // we invoke the getter in the if statement to have the getter invoked lazily
            // the getters for styleSheet and styleElement will create the actual styleSheet
            // and styleElement and cache them statically and we don't want to create both
            // we prefer the constructable styleSheet and fallback to the style element
            if ((styleSheet = constructor.styleSheet)) {
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
            else if ((styleElement = constructor.styleElement)) {
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
         * Dispatch a {@link PropertyChangeEvent}
         *
         * @param propertyKey
         * @param oldValue
         * @param newValue
         *
         * @internal
         * @private
         */
        _notifyProperty(propertyKey, oldValue, newValue) {
            this.dispatch(new PropertyChangeEvent(propertyKey, {
                target: this,
                property: propertyKey.toString(),
                previous: oldValue,
                current: newValue,
            }));
        }
        /**
         * Dispatch a {@link LifecycleEvent}
         *
         * @param lifecycle The lifecycle for which to raise the event (will be the event name)
         * @param detail    Optional event details
         *
         * @internal
         * @private
         */
        _notifyLifecycle(lifecycle, detail = {}) {
            this.dispatch(new LifecycleEvent(lifecycle, Object.assign({ target: this }, detail)));
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
                    target: ((typeof declaration.target === 'function')
                        ? declaration.target.call(this)
                        : declaration.target)
                        || this,
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
         * Query component selectors
         *
         * @internal
         * @private
         */
        _select() {
            this.constructor.selectors.forEach((declaration, property) => {
                const root = ((typeof declaration.root === 'function')
                    ? declaration.root.call(this)
                    : declaration.root)
                    || this.renderRoot;
                const element = declaration.all
                    ? root.querySelectorAll(declaration.query)
                    : root.querySelector(declaration.query);
                this[property] = element;
            });
        }
        /**
         * Reset component selector references
         *
         * @internal
         * @private
         */
        _unselect() {
            this.constructor.selectors.forEach((declaration, property) => {
                this[property] = null;
            });
        }
        // TODO: review _enqueueUpdate method
        // await previousUpdate is already deferring everything to next micro task
        // then we await update - except for first time...
        // we never enqueue when _hasRequestedUpdate is true and we only set it to false
        // after the new request resolved
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
                // ask the scheduler for a new update
                const update = this._scheduleUpdate();
                // the actual update may be scheduled asynchronously as well, in which case we wait for it
                if (update)
                    yield update;
                // mark component as updated *after* the update to prevent infinte loops in the update process
                // N.B.: any property changes during the update will not trigger another update
                this._hasRequestedUpdate = false;
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
                const reflections = new Map(this._reflectingProperties);
                const notifications = new Map(this._notifyingProperties);
                // pass a copy of the property changes to the update method, so property changes
                // are available in an overridden update method
                this.update(changes, reflections, notifications, !this._hasUpdated);
                // reset property maps directly after the update, so changes during the updateCallback
                // can be recorded for the next update, which has to be triggered manually though
                this.reset();
                this.updateCallback(changes, !this._hasUpdated);
                this._notifyLifecycle('update', { changes: changes, firstUpdate: !this._hasUpdated });
                this._hasUpdated = true;
            }
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
     * This map is populated by the {@link listener} decorator and can be used to obtain the
     * {@link ListenerDeclaration} of a method.
     *
     * @internal
     */
    Component.listeners = new Map();
    /**
     * A map of property keys and their respective selector declarations
     *
     * @remarks
     * This map is populated by the {@link selector} decorator and can be used to obtain the
     * {@link SelectorDeclaration} of a property.
     *
     * @internal
     */
    Component.selectors = new Map();
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

    function hasSizeChanged(size, other) {
        if (size && other) {
            return size.width !== other.width
                || size.height !== other.height
                || size.maxWidth !== other.maxWidth
                || size.maxHeight !== other.maxHeight
                || size.minWidth !== other.minWidth
                || size.minHeight !== other.minHeight;
        }
        return size !== other;
    }
    //# sourceMappingURL=size.js.map

    const DEFAULT_ALIGNMENT_PAIR = {
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
    };
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

    const DEFAULT_POSITION_CONFIG = {
        width: 'auto',
        height: 'auto',
        maxWidth: '100vw',
        maxHeight: '100vh',
        minWidth: 'origin',
        minHeight: 'origin',
        origin: 'viewport',
        alignment: Object.assign({}, DEFAULT_ALIGNMENT_PAIR)
    };
    //# sourceMappingURL=position-config.js.map

    function isEventBinding(binding) {
        return typeof binding === 'object'
            && typeof binding.target === 'object'
            && typeof binding.type === 'string'
            && (typeof binding.listener === 'function'
                || typeof binding.listener === 'object');
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
    //# sourceMappingURL=events.js.map

    // TODO: move NOOP to some utility
    const NOOP = () => { };
    class Behavior {
        constructor() {
            this._attached = false;
            this._hasRequestedUpdate = false;
            this._updateTask = { promise: Promise.resolve(), cancel: NOOP };
            this._eventManager = new EventManager();
        }
        /**
         * True if the behavior's {@link Behavior.attach} method was called
         *
         * @readonly
         */
        get hasAttached() {
            return this._attached;
        }
        /**
         * The element that the behavior is attached to
         *
         * @remarks
         * We only expose a getter for the element, so it can't be set directly, but has to be set via
         * the behavior's attach method.
         */
        get element() {
            return this._element;
        }
        /**
         * Attaches the behavior instance to an HTMLElement
         *
         * @param element   An optional HTMLElement to attach the behavior to
         * @param args      Optional argumantes which can be passed to the attach method
         * @returns         A boolean indicating if the behavior was successfully attached
         */
        attach(element, ...args) {
            if (this.hasAttached)
                return false;
            this._element = element;
            this._attached = true;
            return true;
        }
        /**
         * Detaches the behavior instance
         *
         * @remarks
         * Detaching a behavior will cancel any scheduled update, remove all bound listeners
         * bound with the {@link Behavior.listen} method and clear the behavior's element
         * reference.
         *
         * @param args  Optional arguments which can be passed to the detach method
         */
        detach(...args) {
            if (!this.hasAttached)
                return false;
            this.cancelUpdate();
            this.unlistenAll();
            this._element = undefined;
            this._attached = false;
            return true;
        }
        /**
         * Request an update of the behavior instance
         *
         * @remarks
         * This method schedules an update call using requestAnimationFrame. It returns a Promise
         * which will resolve with the return value of the update method, or reject if an error
         * occurrs during update or the update was canceled. If an update has been scheduled
         * already, but hasn't executed yet, the scheduled update's promise is returned.
         */
        requestUpdate(...args) {
            if (this.hasAttached && !this._hasRequestedUpdate) {
                this._hasRequestedUpdate = true;
                this._updateTask = animationFrameTask(() => {
                    this.update(...args);
                    this._hasRequestedUpdate = false;
                });
            }
            return this._updateTask.promise;
        }
        /**
         * Cancel a requested but not yet executed update
         */
        cancelUpdate() {
            this._updateTask.cancel();
            this._hasRequestedUpdate = false;
        }
        /**
         * Update the behavior instance
         *
         * @remarks
         * This method is intended to be used synchronously, e.g. in the update cycle of a component
         * which is already scheduled via requestAnimationFrame. If a behavior wants to update itself
         * based on some event, it is recommended to use {@link Behavior.requestUpdate} instead.
         */
        update(...args) {
            return this.hasAttached;
        }
        listen(target, type, listener, options) {
            return this._eventManager.listen(target, type, listener, options);
        }
        unlisten(target, type, listener, options) {
            return this._eventManager.unlisten(target, type, listener, options);
        }
        unlistenAll() {
            this._eventManager.unlistenAll();
        }
        dispatch(eventOrType, detail, eventInit) {
            if (this.hasAttached && this.element) {
                return (eventOrType instanceof Event)
                    ? this._eventManager.dispatch(this.element, eventOrType)
                    : this._eventManager.dispatch(this.element, eventOrType, detail, eventInit);
            }
            return false;
        }
    }
    //# sourceMappingURL=behavior.js.map

    function applyDefaults(config, defaults) {
        for (const key in defaults) {
            if (config[key] === undefined)
                config[key] = defaults[key];
        }
        return config;
    }
    //# sourceMappingURL=config.js.map

    class PositionController extends Behavior {
        // TODO: unify the way configurations are treated by position and overlay controller...
        constructor(config) {
            super();
            this.config = applyDefaults(config || {}, DEFAULT_POSITION_CONFIG);
            this.origin = this.config.origin;
        }
        // TODO: maybe we shouldn't allow CSSQuery strings, because querySelector() through ShadowDOM will not work
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
        attach(element) {
            if (!super.attach(element))
                return false;
            this.requestUpdate();
            return true;
        }
        requestUpdate(position, size) {
            return super.requestUpdate(position, size);
        }
        update(position, size) {
            const nextPosition = position || this.getPosition();
            const nextSize = size || this.getSize();
            let updated = false;
            if (!this.currentPosition || this.hasPositionChanged(nextPosition, this.currentPosition)) {
                this.applyPosition(nextPosition);
                this.currentPosition = nextPosition;
                updated = true;
            }
            if (!this.currentSize || this.hasSizeChanged(nextSize, this.currentSize)) {
                this.applySize(nextSize);
                this.currentSize = nextSize;
                updated = true;
            }
            return updated;
        }
        /**
         * Calculate the position of the positioned element
         *
         * @description
         * The position will depend on the alignment and origin options of the {@link PositionConfig}.
         */
        getPosition() {
            const originBox = this.getBoundingBox(this.origin);
            const targetBox = this.getBoundingBox(this.element);
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
                minWidth: this.config.minWidth,
                minHeight: this.config.minHeight,
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
            if (!this.hasAttached)
                return;
            this.element.style.top = this.parseStyle(position.y);
            this.element.style.left = this.parseStyle(position.x);
            this.element.style.right = '';
            this.element.style.bottom = '';
        }
        applySize(size) {
            if (!this.hasAttached)
                return;
            this.element.style.width = this.parseStyle(size.width);
            this.element.style.height = this.parseStyle(size.height);
            this.element.style.maxWidth = this.parseStyle(size.maxWidth);
            this.element.style.maxHeight = this.parseStyle(size.maxHeight);
            this.element.style.minWidth = this.parseStyle(size.minWidth);
            this.element.style.minHeight = this.parseStyle(size.minHeight);
        }
        // TODO: maybe name this better, huh?
        parseStyle(value) {
            return (typeof value === 'number') ? `${value || 0}px` : value || '';
        }
        hasPositionChanged(position, other) {
            return hasPositionChanged(position, other);
        }
        hasSizeChanged(size, other) {
            return hasSizeChanged(size, other);
        }
    }
    //# sourceMappingURL=position-controller.js.map

    const UNDEFINED_TYPE = (type, map = 'behavior') => new Error(`Undefined type key: No ${map} found for key '${type}'.
Add a 'default' key to your ${map} map to provide a fallback ${map} for undefined types.`);
    class BehaviorFactory {
        constructor(behaviors, configurations) {
            this.behaviors = behaviors;
            this.configurations = configurations;
        }
        /**
         * Create a behavior of the specified type and configuration
         *
         * @description
         * Checks if the specified type key exists in behavior and configuration map,
         * merges the default configuration for the specified type into the provided
         * configuration and creates an instance of the correct behavior with the merged
         * configuration.
         */
        create(type, config, ...args) {
            this.checkType(type);
            const behavior = this.getBehavior(type);
            const configuration = applyDefaults(config, this.getConfiguration(type));
            return this.getInstance(type, behavior, configuration, ...args);
        }
        /**
         * Create a behavior instance
         *
         * @description
         * This method can be overridden by any BehaviorFactory to adjust the creation of Behavior instances.
         */
        getInstance(type, behavior, configuration, ...args) {
            return new behavior(configuration, ...args);
        }
        /**
         * Check if the specified type exists in behavior and configuration map
         *
         * @throws
         * {@link UNDEFINED_TYPE} error if neither the specified type nor a 'default' key
         * exists in the behavior or configuration map.
         */
        checkType(type) {
            if (!(type in this.behaviors || 'default' in this.behaviors))
                throw UNDEFINED_TYPE(type, 'behavior');
            if (!(type in this.configurations || 'default' in this.configurations))
                throw UNDEFINED_TYPE(type, 'configuration');
        }
        /**
         * Get the behavior class for the specified type key
         */
        getBehavior(type) {
            return this.behaviors[type] || this.behaviors['default'];
        }
        /**
         * Get the configuration for the specified type key
         */
        getConfiguration(type) {
            return this.configurations[type] || this.configurations['default'];
        }
    }
    //# sourceMappingURL=behavior-factory.js.map

    const CENTERED_POSITION_CONFIG = Object.assign({}, DEFAULT_POSITION_CONFIG);
    class CenteredPositionController extends PositionController {
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
            if (!this.hasAttached)
                return;
            this.element.style.top = '50vh';
            this.element.style.left = '50vw';
            this.element.style.right = '';
            this.element.style.bottom = '';
            this.element.style.transform = `translate(-50%, -50%)`;
        }
    }
    //# sourceMappingURL=centered-position-controller.js.map

    const CONNECTED_POSITION_CONFIG = Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG), { alignment: {
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
    class ConnectedPositionController extends PositionController {
        attach(element) {
            if (!super.attach(element))
                return false;
            this.listen(window, 'resize', () => this.requestUpdate(), true);
            this.listen(document, 'scroll', () => this.requestUpdate(), true);
            // TODO: add contend-changed event to overlay via MutationObserver
            // and update position when content changes
            return true;
        }
        /**
         * We override the applyPosition method, so we can use a CSS transform to position the element.
         *
         * This can result in better performance.
         */
        applyPosition(position) {
            if (!this.hasAttached)
                return;
            this.element.style.top = '';
            this.element.style.left = '';
            this.element.style.right = '';
            this.element.style.bottom = '';
            // this.element!.style.transform = `translate(${ this.parseStyle(position.x) }, ${ this.parseStyle(position.y) })`;
        }
    }
    //# sourceMappingURL=connected-position-controller.js.map

    const POSITION_CONTROLLERS = {
        default: PositionController,
        centered: CenteredPositionController,
        connected: ConnectedPositionController,
    };
    const POSITION_CONFIGURATIONS = {
        default: DEFAULT_POSITION_CONFIG,
        centered: CENTERED_POSITION_CONFIG,
        connected: CONNECTED_POSITION_CONFIG,
    };
    class PositionControllerFactory extends BehaviorFactory {
        constructor(behaviors = POSITION_CONTROLLERS, configurations = POSITION_CONFIGURATIONS) {
            super(behaviors, configurations);
            this.behaviors = behaviors;
            this.configurations = configurations;
        }
    }
    //# sourceMappingURL=position-controller-factory.js.map

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

    function MixinRole(Base, role = '') {
        let BaseHasRole = class BaseHasRole extends Base {
            connectedCallback() {
                this.role = this.getAttribute('role') || role;
                super.connectedCallback();
            }
        };
        __decorate([
            property({ converter: AttributeConverterString }),
            __metadata("design:type", String)
        ], BaseHasRole.prototype, "role", void 0);
        BaseHasRole = __decorate([
            component({ define: false })
        ], BaseHasRole);
        return BaseHasRole;
    }
    //# sourceMappingURL=role.js.map

    class FocusMonitor extends Behavior {
        constructor() {
            super(...arguments);
            this.hasFocus = false;
        }
        attach(element) {
            if (!super.attach(element))
                return false;
            this.listen(this.element, 'focusin', event => this.handleFocusIn(event));
            this.listen(this.element, 'focusout', event => this.handleFocusOut(event));
            return true;
        }
        handleFocusIn(event) {
            if (!this.hasFocus) {
                this.hasFocus = true;
                this.dispatch('focus-changed', { type: 'focusin', event: event, target: event.target });
            }
        }
        handleFocusOut(event) {
            // if the relatedTarget (the element which will receive the focus next) is within the monitored element,
            // we can ignore this event; it will eventually be handled as focusin event of the relatedTarget
            if (this.element === event.relatedTarget || this.element.contains(event.relatedTarget))
                return;
            if (this.hasFocus) {
                this.hasFocus = false;
                this.dispatch('focus-changed', { type: 'focusout', event: event, target: event.target });
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
            this.config = applyDefaults(config || {}, DEFAULT_FOCUS_TRAP_CONFIG);
        }
        attach(element) {
            if (!super.attach(element))
                return false;
            this.update();
            if (this.config.autoFocus) {
                this.focusInitial();
            }
            this.listen(this.element, 'keydown', ((event) => this.handleKeyDown(event)));
            return true;
        }
        detach() {
            return super.detach();
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
            // TODO: does this work with shadowDOM and re-attachment of overlay?
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
                        if (this.config.wrapFocus)
                            this.focusLast();
                    }
                    else if (!event.shiftKey && event.target === this.end) {
                        event.preventDefault();
                        if (this.config.wrapFocus)
                            this.focusFirst();
                    }
                    break;
            }
        }
    }
    //# sourceMappingURL=focus-trap.js.map

    const DEFAULT_OVERLAY_TRIGGER_CONFIG = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), { autoFocus: true, trapFocus: true, restoreFocus: true, closeOnEscape: true, closeOnFocusLoss: true });
    //# sourceMappingURL=overlay-trigger-config.js.map

    const DEFAULT_OVERLAY_CONFIG = {
        // ...DEFAULT_POSITION_CONFIG,
        // ...DEFAULT_OVERLAY_TRIGGER_CONFIG,
        positionType: 'default',
        trigger: undefined,
        triggerType: 'default',
        stacked: true,
        template: undefined,
        context: undefined,
        backdrop: true,
        closeOnBackdropClick: true,
    };
    //# sourceMappingURL=overlay-config.js.map

    /**
     * Insert a Node after a reference Node
     *
     * @param newChild - The Node to insert
     * @param refChild - The reference Node after which to insert
     * @returns The inserted Node
     */
    /**
     * Replace a reference Node with a new Node
     *
     * @param newChild - The Node to insert
     * @param refChild - The reference Node to replace
     * @returns The replaced reference Node
     */
    const replaceWith = (newChild, refChild) => {
        var _a;
        return (_a = refChild.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newChild, refChild);
    };
    /**
     * Get the currently active element
     *
     * @description
     * Gets the currently active element, but pierces shadow roots to find the active element
     * also within a custom element which has a shadow root.
     */
    const activeElement = () => {
        let root = document;
        let element;
        while (root && (element = root.activeElement)) {
            root = element.shadowRoot;
        }
        return element || document.body;
    };
    //# sourceMappingURL=dom.js.map

    class OverlayTrigger extends Behavior {
        constructor(config, overlay) {
            super();
            this.config = config;
            this.overlay = overlay;
            this.previousFocus = document.body;
            this.focusBehavior = this.config.trapFocus
                ? new FocusTrap(this.config)
                : new FocusMonitor();
        }
        attach(element) {
            if (!super.attach(element))
                return false;
            this.listen(this.overlay, 'open-changed', event => this.handleOpenChange(event));
            this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event));
            this.listen(this.overlay, 'keydown', event => this.handleKeydown(event));
            return true;
        }
        // TODO: remove event parameter...
        open(event) {
            this.overlay.open = true;
        }
        close(event) {
            this.overlay.open = false;
        }
        toggle(event, open) {
            this.overlay.open = (open !== null && open !== void 0 ? open : !this.overlay.open);
        }
        handleOpenChange(event) {
            const open = event.detail.current;
            console.log('OverlayTrigger.handleOpenChange()...', event);
            if (open) {
                this.storeFocus();
                if (this.focusBehavior) {
                    this.focusBehavior.attach(this.overlay);
                }
            }
            else {
                if (this.focusBehavior) {
                    this.focusBehavior.detach();
                }
            }
        }
        handleFocusChange(event) {
            const hasFocus = event.detail.type === 'focusin';
            console.log('OverlayTrigger.handleFocusChange()...', hasFocus);
            if (!hasFocus) {
                // when loosing focus, we wait for potential focusin events on child or parent overlays by delaying
                // the active check in a new macrotask via setTimeout
                setTimeout(() => {
                    // then we check if the overlay is active and if not, we close it
                    if (!this.overlay.static.isOverlayActive(this.overlay)) {
                        // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
                        const parent = this.overlay.static.getParentOverlay(this.overlay);
                        if (this.config.closeOnFocusLoss) {
                            this.close(event);
                        }
                        if (parent) {
                            // if we have a parent overlay, we let the parent know that our overlay has lost focus,
                            // by dispatching the FocusChangeEvent on the parent overlay to be handled or ignored
                            // by the parent's OverlayTrigger
                            parent.dispatchEvent(event);
                        }
                    }
                }, 0);
            }
        }
        handleKeydown(event) {
            console.log('OverlayTrigger.handleKeydown()...', event);
            switch (event.key) {
                case Escape:
                    if (!this.overlay.open || !this.config.closeOnEscape)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    this.close(event);
                    if (!this.config.restoreFocus)
                        return;
                    this.listen(this.overlay, 'open-changed', () => {
                        console.log('once: open-changed restoreFocus...');
                        this.restoreFocus();
                    }, { once: true });
                    break;
            }
        }
        storeFocus() {
            this.previousFocus = activeElement();
            console.log('OverlayTrigger.storeFocus()...', this.previousFocus);
        }
        restoreFocus() {
            this.previousFocus.focus();
            console.log('OverlayTrigger.restoreFocus()...', this.previousFocus);
        }
    }
    //# sourceMappingURL=overlay-trigger.js.map

    const DIALOG_OVERLAY_TRIGGER_CONFIG = Object.assign({}, DEFAULT_OVERLAY_TRIGGER_CONFIG);
    class DialogOverlayTrigger extends OverlayTrigger {
        attach(element) {
            if (!super.attach(element))
                return false;
            this.element.setAttribute('aria-haspopup', 'dialog');
            this.listen(this.element, 'click', (event) => this.handleClick(event));
            this.listen(this.element, 'keydown', (event) => this.handleKeydown(event));
            this.update();
            return true;
        }
        detach() {
            if (!this.hasAttached)
                return false;
            this.element.removeAttribute('aria-haspopup');
            this.element.removeAttribute('aria-expanded');
            return super.detach();
        }
        update() {
            if (!this.hasAttached)
                return;
            this.element.setAttribute('aria-expanded', this.overlay.open ? 'true' : 'false');
        }
        handleOpenChange(event) {
            super.handleOpenChange(event);
            this.update();
        }
        handleClick(event) {
            this.toggle(event);
        }
        handleKeydown(event) {
            switch (event.key) {
                case Enter:
                case Space:
                    // handle events that happen on the trigger element
                    if (event.target === this.element) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.toggle(event);
                        break;
                    }
                default:
                    super.handleKeydown(event);
                    break;
            }
        }
    }
    //# sourceMappingURL=dialog-overlay-trigger.js.map

    const TOOLTIP_OVERLAY_TRIGGER_CONFIG = Object.assign(Object.assign({}, DEFAULT_OVERLAY_TRIGGER_CONFIG), { trapFocus: false, autoFocus: false, restoreFocus: false });
    class TooltipOverlayTrigger extends OverlayTrigger {
        attach(element) {
            if (!super.attach(element))
                return false;
            this.overlay.role = 'tooltip';
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('aria-describedby', this.overlay.id);
            this.listen(this.element, 'mouseenter', (event) => this.open(event));
            this.listen(this.element, 'mouseleave', (event) => this.close(event));
            this.listen(this.element, 'focus', (event) => this.open(event));
            this.listen(this.element, 'blur', (event) => this.close(event));
            return true;
        }
        detach() {
            if (!this.hasAttached)
                return false;
            this.element.removeAttribute('tabindex');
            this.element.removeAttribute('aria-describedby');
            return super.detach();
        }
    }
    //# sourceMappingURL=tooltip-overlay-trigger.js.map

    const OVERLAY_TRIGGERS = {
        default: OverlayTrigger,
        dialog: DialogOverlayTrigger,
        tooltip: TooltipOverlayTrigger,
    };
    const OVERLAY_TRIGGER_CONFIGS = {
        default: DEFAULT_OVERLAY_TRIGGER_CONFIG,
        dialog: DIALOG_OVERLAY_TRIGGER_CONFIG,
        tooltip: TOOLTIP_OVERLAY_TRIGGER_CONFIG,
    };
    class OverlayTriggerFactory extends BehaviorFactory {
        constructor(behaviors = OVERLAY_TRIGGERS, configurations = OVERLAY_TRIGGER_CONFIGS) {
            super(behaviors, configurations);
            this.behaviors = behaviors;
            this.configurations = configurations;
        }
        /**
         * Override the {@link create} method to enforce the overlay parameter
         */
        create(type, config, overlay, ...args) {
            return super.create(type, config, overlay, ...args);
        }
    }
    //# sourceMappingURL=overlay-trigger-factory.js.map

    var Overlay_1;
    const ALREADY_INITIALIZED_ERROR = () => new Error('Cannot initialize Overlay. Overlay has already been initialized.');
    const ALREADY_REGISTERED_ERROR = (overlay) => new Error(`Overlay has already been registered: ${overlay.id}.`);
    const NOT_REGISTERED_ERROR = (overlay) => new Error(`Overlay is not registered: ${overlay.id}.`);
    const THROW_UNREGISTERED_OVERLAY = (overlay) => {
        if (!overlay.constructor.isOverlayRegistered(overlay)) {
            throw NOT_REGISTERED_ERROR(overlay);
        }
    };
    const ID_GENERATOR = new IDGenerator('partkit-overlay-');
    let Overlay = Overlay_1 = class Overlay extends MixinRole(Component, 'dialog') {
        constructor() {
            super(...arguments);
            /**
             * The overlay's configurtion
             *
             * @remarks
             * Initially _config only contains a partial OverlayConfig, but once the overlay instance has been
             * registered, _config will be a full OverlayConfig. This is to allow the BehaviorFactories for
             * position and trigger to apply their default configuration, based on the behavior type which is
             * created by the factories.
             *
             * @internal
             * */
            this._config = Object.assign({}, DEFAULT_OVERLAY_CONFIG);
            this.isReattaching = false;
            this.tabindex = -1;
            this.open = false;
        }
        static get overlayTriggerFactory() {
            return this._overlayTriggerFactory;
        }
        static get positionControllerFactory() {
            return this._positionControllerFactory;
        }
        static get overlayRoot() {
            return this._overlayRoot;
        }
        static get isInitialized() {
            return this._initialized;
        }
        static initialize(config) {
            if (this.isInitialized)
                throw ALREADY_INITIALIZED_ERROR();
            this._overlayTriggerFactory = config.overlayTriggerFactory || this._overlayTriggerFactory;
            this._positionControllerFactory = config.positionControllerFactory || this._positionControllerFactory;
            this._overlayRoot = config.overlayRoot || this._overlayRoot;
            this._initialized = true;
        }
        static isOverlayRegistered(overlay) {
            return this.registeredOverlays.has(overlay);
        }
        /**
        * An overlay is considered focused, if either itself or any of its descendant nodes has focus.
        */
        static isOverlayFocused(overlay) {
            THROW_UNREGISTERED_OVERLAY(overlay);
            const activeElement = document.activeElement;
            return overlay === activeElement || overlay.contains(activeElement);
        }
        /**
         * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
         */
        static isOverlayActive(overlay) {
            THROW_UNREGISTERED_OVERLAY(overlay);
            let isFound = false;
            let isActive = false;
            if (overlay.config.stacked && overlay.open) {
                for (let current of this.activeOverlays) {
                    isFound = isFound || current === overlay;
                    isActive = isFound && this.isOverlayFocused(current);
                    if (isActive)
                        break;
                }
            }
            return isActive;
        }
        /**
         * Get the parent overlay of an active overlay
         *
         * @description
         * If an overlay is stacked, its parent overlay is the one from which it was opened.
         * This parent overlay will be in the activeOverlays stack just before this one.
         */
        static getParentOverlay(overlay) {
            THROW_UNREGISTERED_OVERLAY(overlay);
            if (overlay.config.stacked && overlay.open) {
                // we start with parent being undefined
                // if the first active overlay in the set matches the specified overlay
                // then indeed the overlay has no parent (the first active overlay is the root)
                let parent = undefined;
                // go through the active overlays
                for (let current of this.activeOverlays) {
                    // if we have reached the specified active overlay
                    // we can return the parent of that overlay (it's the active overlay in the set just before this one)
                    if (current === overlay)
                        return parent;
                    // if we haven't found the specified overlay yet, we set
                    // the current overlay as potential parent and move on
                    parent = current;
                }
            }
        }
        /**
        * Create a new overlay
        */
        static createOverlay(config) {
            const overlay = document.createElement(Overlay_1.selector);
            overlay.config = Object.assign(Object.assign({}, DEFAULT_OVERLAY_CONFIG), config);
            return overlay;
        }
        static disposeOverlay(overlay) {
            var _a;
            (_a = overlay.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(overlay);
        }
        set config(value) {
            console.log('set config: ', value);
            this._config = Object.assign(this._config, value);
        }
        get config() {
            return this._config;
        }
        set origin(value) {
            console.log('set origin: ', value);
            this.config.origin = value;
        }
        get origin() {
            // TODO: fix typings for origin (remove CSSSelector)
            return this.config.origin;
        }
        set positionType(value) {
            console.log('set positionType: ', value);
            this.config.positionType = value;
        }
        get positionType() {
            return this.config.positionType;
        }
        set trigger(value) {
            console.log('set trigger: ', value);
            this.config.trigger = value;
        }
        get trigger() {
            return this.config.trigger;
        }
        set triggerType(value) {
            console.log('set triggerType: ', value);
            this.config.triggerType = value;
        }
        get triggerType() {
            return this.config.triggerType;
        }
        get static() {
            return this.constructor;
        }
        connectedCallback() {
            if (this.isReattaching)
                return;
            super.connectedCallback();
            this.id = this.id || ID_GENERATOR.getNextID();
            this.register();
        }
        disconnectedCallback() {
            if (this.isReattaching)
                return;
            this.unregister();
            super.disconnectedCallback();
        }
        updateCallback(changes, firstUpdate) {
            var _a, _b;
            if (firstUpdate) {
                this.setAttribute('aria-hidden', `${!this.open}`);
                (_b = (_a = this.static.registeredOverlays.get(this)) === null || _a === void 0 ? void 0 : _a.overlayTrigger) === null || _b === void 0 ? void 0 : _b.attach(this.config.trigger);
            }
            else {
                console.log('Overlay.updateCallback()... config: ', this.config);
                if (changes.has('open')) {
                    this.setAttribute('aria-hidden', `${!this.open}`);
                    this.notifyProperty('open', changes.get('open'), this.open);
                }
                if (changes.has('trigger') || changes.has('origin') || changes.has('triggerType') || changes.has('positionType')) {
                    this.configure();
                }
            }
        }
        /**
         * Handle the overlay's open-changed event
         *
         * @remarks
         * Property changes are dispatched during the update cycle of the component, so they run in
         * an animationFrame callback. We can therefore run code in these handlers, which runs inside
         * an animationFrame, like updating the position of the overlay without scheduling it.
         *
         * @param event
         */
        handleOpenChanged(event) {
            var _a, _b, _c, _d, _e, _f;
            console.log('Overlay.handleOpenChange()...', event.detail.current);
            const overlayRoot = this.static.overlayRoot;
            this.isReattaching = true;
            if (event.detail.current === true) {
                this.marker = document.createComment(this.id);
                replaceWith(this.marker, this);
                overlayRoot.appendChild(this);
                (_b = (_a = this.static.registeredOverlays.get(this)) === null || _a === void 0 ? void 0 : _a.positionController) === null || _b === void 0 ? void 0 : _b.attach(this);
                (_d = (_c = this.static.registeredOverlays.get(this)) === null || _c === void 0 ? void 0 : _c.positionController) === null || _d === void 0 ? void 0 : _d.update();
            }
            else {
                replaceWith(this, this.marker);
                this.marker = undefined;
                (_f = (_e = this.static.registeredOverlays.get(this)) === null || _e === void 0 ? void 0 : _e.positionController) === null || _f === void 0 ? void 0 : _f.detach();
            }
            this.isReattaching = false;
        }
        register() {
            if (this.static.isOverlayRegistered(this))
                throw ALREADY_REGISTERED_ERROR(this);
            console.log('Overly.register()... config: ', this.config);
            const settings = {
                config: this.config,
                events: new EventManager(),
                overlayTrigger: this.static.overlayTriggerFactory.create(this.config.triggerType, this.config, this),
                positionController: this.static.positionControllerFactory.create(this.config.positionType, this.config),
            };
            this.static.registeredOverlays.set(this, settings);
        }
        unregister() {
            var _a, _b;
            if (!this.static.isOverlayRegistered(this))
                throw NOT_REGISTERED_ERROR(this);
            const settings = this.static.registeredOverlays.get(this);
            (_a = settings.overlayTrigger) === null || _a === void 0 ? void 0 : _a.detach();
            (_b = settings.positionController) === null || _b === void 0 ? void 0 : _b.detach();
            settings.overlayTrigger = undefined;
            settings.positionController = undefined;
            this.static.registeredOverlays.delete(this);
        }
        configure(config = {}) {
            var _a, _b;
            console.log('Overlay.configure()...');
            const settings = this.static.registeredOverlays.get(this);
            this.config = config;
            (_a = settings.overlayTrigger) === null || _a === void 0 ? void 0 : _a.detach();
            (_b = settings.positionController) === null || _b === void 0 ? void 0 : _b.detach();
            settings.overlayTrigger = this.static.overlayTriggerFactory.create(this.config.triggerType, this.config, this);
            settings.positionController = this.static.positionControllerFactory.create(this.config.positionType, this.config);
            settings.overlayTrigger.attach(this.config.trigger);
            console.log(this.config);
        }
    };
    /** @internal */
    Overlay._initialized = false;
    /** @internal */
    Overlay._overlayTriggerFactory = new OverlayTriggerFactory();
    /** @internal */
    Overlay._positionControllerFactory = new PositionControllerFactory();
    /** @internal */
    Overlay._overlayRoot = document.body;
    Overlay.registeredOverlays = new Map();
    Overlay.activeOverlays = new Set();
    __decorate([
        property({
            converter: AttributeConverterNumber
        }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "tabindex", void 0);
    __decorate([
        property({ converter: AttributeConverterBoolean }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "open", void 0);
    __decorate([
        property({ attribute: false }),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], Overlay.prototype, "config", null);
    __decorate([
        property({ attribute: false }),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], Overlay.prototype, "origin", null);
    __decorate([
        property({ converter: AttributeConverterString }),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], Overlay.prototype, "positionType", null);
    __decorate([
        property({ attribute: false }),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], Overlay.prototype, "trigger", null);
    __decorate([
        property({ converter: AttributeConverterString }),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], Overlay.prototype, "triggerType", null);
    __decorate([
        listener({ event: 'open-changed', options: { capture: true } }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [PropertyChangeEvent]),
        __metadata("design:returntype", void 0)
    ], Overlay.prototype, "handleOpenChanged", null);
    Overlay = Overlay_1 = __decorate([
        component({
            selector: 'ui-overlay',
            styles: [css `
    :host {
        display: block;
        position: fixed;
        box-sizing: border-box;
        border: 2px solid #bfbfbf;
        background-color: #fff;
        border-radius: 4px;
    }
    :host([aria-hidden=true]) {
        display: none;
    }
    `],
            template: () => html `
    <slot></slot>
    `,
        })
    ], Overlay);
    //# sourceMappingURL=overlay.js.map

    const DIALOG_CONFIG = Object.assign(Object.assign(Object.assign({}, DEFAULT_OVERLAY_CONFIG), DIALOG_OVERLAY_TRIGGER_CONFIG), CONNECTED_POSITION_CONFIG);
    let OverlayDemoComponent = class OverlayDemoComponent extends Component {
        constructor() {
            super(...arguments);
            this.roles = ['dialog', 'menu', 'tooltip'];
            this.currentRole = 0;
        }
        updateCallback(changes, firstUpdate) {
            console.log('Demo.updateCallback()... firstUpdate: ', firstUpdate);
            if (firstUpdate) {
                console.log('overlay-demo... overlay: ', this.overlay);
                console.log('overlay-demo... dialogButton: ', this.dialogButton);
            }
        }
        changeRole() {
            this.currentRole = (this.currentRole + 1 < this.roles.length) ? this.currentRole + 1 : 0;
            this.overlay.role = this.roles[this.currentRole];
        }
        toggle() {
            this.overlay.open = !this.overlay.open;
        }
    };
    __decorate([
        selector({ query: '#overlay' }),
        __metadata("design:type", Overlay)
    ], OverlayDemoComponent.prototype, "overlay", void 0);
    __decorate([
        selector({ query: '#dialog-button' }),
        __metadata("design:type", HTMLButtonElement)
    ], OverlayDemoComponent.prototype, "dialogButton", void 0);
    OverlayDemoComponent = __decorate([
        component({
            selector: 'overlay-demo',
            template: element => html `
    <h2>Overlay</h2>

    <button @click=${element.changeRole}>Change Role</button>
    <button @click=${element.toggle}>Toggle</button>

    <ui-overlay id="overlay">
        <h3>Overlay</h3>
        <p>This is some overlay content.</p>
        <p>
            <input type="text" placeholder="Search term..."/> <button>Search</button>
        </p>
    </ui-overlay>

    <button id="dialog-button">Dialog</button>

    <ui-overlay trigger-type="dialog" position-type="connected" .trigger=${element.dialogButton} .origin=${element.dialogButton}>
        <h3>Dialog</h3>
        <p>This is some dialog content.</p>
        <p>
            <input type="text" placeholder="Search term..."/> <button>Search</button>
        </p>
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

    function bootstrap() {
        const checkbox = document.querySelector('ui-checkbox');
        if (checkbox) {
            checkbox.addEventListener('checked-changed', event => console.log(event.detail));
        }
    }
    window.addEventListener('load', bootstrap);
    //# sourceMappingURL=main.js.map

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3NlbGVjdG9yLWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvdGFza3MudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9zZWxlY3Rvci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvcHJvcGVydHkudHMiLCIuLi9zcmMvZXZlbnRzLnRzIiwiLi4vc3JjL2NvbXBvbmVudC50cyIsIi4uL3NyYy9jc3MudHMiLCJzcmMva2V5cy50cyIsInNyYy9saXN0LWtleS1tYW5hZ2VyLnRzIiwic3JjL2ljb24vaWNvbi50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLWhlYWRlci50cyIsInNyYy9oZWxwZXJzL2NvcHlyaWdodC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmVsLnRzIiwic3JjL2FjY29yZGlvbi9hY2NvcmRpb24udHMiLCJzcmMvYXBwLnN0eWxlcy50cyIsInNyYy9hcHAudGVtcGxhdGUudHMiLCJzcmMvY2FyZC50cyIsInNyYy9jaGVja2JveC50cyIsInNyYy9wb3NpdGlvbi9zaXplLnRzIiwic3JjL3Bvc2l0aW9uL2FsaWdubWVudC50cyIsInNyYy9wb3NpdGlvbi9wb3NpdGlvbi50cyIsInNyYy9wb3NpdGlvbi9wb3NpdGlvbi1jb25maWcudHMiLCJzcmMvZXZlbnRzLnRzIiwic3JjL2JlaGF2aW9yL2JlaGF2aW9yLnRzIiwic3JjL3V0aWxzL2NvbmZpZy50cyIsInNyYy9wb3NpdGlvbi9wb3NpdGlvbi1jb250cm9sbGVyLnRzIiwic3JjL2JlaGF2aW9yL2JlaGF2aW9yLWZhY3RvcnkudHMiLCJzcmMvcG9zaXRpb24vY29udHJvbGxlci9jZW50ZXJlZC1wb3NpdGlvbi1jb250cm9sbGVyLnRzIiwic3JjL3Bvc2l0aW9uL2NvbnRyb2xsZXIvY29ubmVjdGVkLXBvc2l0aW9uLWNvbnRyb2xsZXIudHMiLCJzcmMvcG9zaXRpb24vcG9zaXRpb24tY29udHJvbGxlci1mYWN0b3J5LnRzIiwic3JjL2lkLWdlbmVyYXRvci50cyIsInNyYy9taXhpbnMvcm9sZS50cyIsInNyYy9mb2N1cy9mb2N1cy1tb25pdG9yLnRzIiwic3JjL2ZvY3VzL2ZvY3VzLXRyYXAudHMiLCJzcmMvb3ZlcmxheS1uZXcvdHJpZ2dlci9vdmVybGF5LXRyaWdnZXItY29uZmlnLnRzIiwic3JjL292ZXJsYXktbmV3L292ZXJsYXktY29uZmlnLnRzIiwic3JjL2RvbS50cyIsInNyYy9vdmVybGF5LW5ldy90cmlnZ2VyL292ZXJsYXktdHJpZ2dlci50cyIsInNyYy9vdmVybGF5LW5ldy90cmlnZ2VyL2RpYWxvZy1vdmVybGF5LXRyaWdnZXIudHMiLCJzcmMvb3ZlcmxheS1uZXcvdHJpZ2dlci90b29sdGlwLW92ZXJsYXktdHJpZ2dlci50cyIsInNyYy9vdmVybGF5LW5ldy90cmlnZ2VyL292ZXJsYXktdHJpZ2dlci1mYWN0b3J5LnRzIiwic3JjL292ZXJsYXktbmV3L292ZXJsYXkudHMiLCJzcmMvb3ZlcmxheS1uZXcvZGVtby50cyIsInNyYy90YWJzL3RhYi50cyIsInNyYy90YWJzL3RhYi1saXN0LnRzIiwic3JjL3RhYnMvdGFiLXBhbmVsLnRzIiwic3JjL3RvZ2dsZS50cyIsInNyYy9hcHAudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmNvbnN0IGRpcmVjdGl2ZXMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBCcmFuZHMgYSBmdW5jdGlvbiBhcyBhIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uIHNvIHRoYXQgbGl0LWh0bWwgd2lsbCBjYWxsXG4gKiB0aGUgZnVuY3Rpb24gZHVyaW5nIHRlbXBsYXRlIHJlbmRlcmluZywgcmF0aGVyIHRoYW4gcGFzc2luZyBhcyBhIHZhbHVlLlxuICpcbiAqIEEgX2RpcmVjdGl2ZV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgUGFydCBhcyBhbiBhcmd1bWVudC4gSXQgaGFzIHRoZVxuICogc2lnbmF0dXJlOiBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLlxuICpcbiAqIEEgZGlyZWN0aXZlIF9mYWN0b3J5XyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYXJndW1lbnRzIGZvciBkYXRhIGFuZFxuICogY29uZmlndXJhdGlvbiBhbmQgcmV0dXJucyBhIGRpcmVjdGl2ZS4gVXNlcnMgb2YgZGlyZWN0aXZlIHVzdWFsbHkgcmVmZXIgdG9cbiAqIHRoZSBkaXJlY3RpdmUgZmFjdG9yeSBhcyB0aGUgZGlyZWN0aXZlLiBGb3IgZXhhbXBsZSwgXCJUaGUgcmVwZWF0IGRpcmVjdGl2ZVwiLlxuICpcbiAqIFVzdWFsbHkgYSB0ZW1wbGF0ZSBhdXRob3Igd2lsbCBpbnZva2UgYSBkaXJlY3RpdmUgZmFjdG9yeSBpbiB0aGVpciB0ZW1wbGF0ZVxuICogd2l0aCByZWxldmFudCBhcmd1bWVudHMsIHdoaWNoIHdpbGwgdGhlbiByZXR1cm4gYSBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKlxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgdXNpbmcgdGhlIGByZXBlYXQoKWAgZGlyZWN0aXZlIGZhY3RvcnkgdGhhdCB0YWtlcyBhblxuICogYXJyYXkgYW5kIGEgZnVuY3Rpb24gdG8gcmVuZGVyIGFuIGl0ZW06XG4gKlxuICogYGBganNcbiAqIGh0bWxgPHVsPjwke3JlcGVhdChpdGVtcywgKGl0ZW0pID0+IGh0bWxgPGxpPiR7aXRlbX08L2xpPmApfTwvdWw+YFxuICogYGBgXG4gKlxuICogV2hlbiBgcmVwZWF0YCBpcyBpbnZva2VkLCBpdCByZXR1cm5zIGEgZGlyZWN0aXZlIGZ1bmN0aW9uIHRoYXQgY2xvc2VzIG92ZXJcbiAqIGBpdGVtc2AgYW5kIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi4gV2hlbiB0aGUgb3V0ZXIgdGVtcGxhdGUgaXMgcmVuZGVyZWQsIHRoZVxuICogcmV0dXJuIGRpcmVjdGl2ZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgUGFydCBmb3IgdGhlIGV4cHJlc3Npb24uXG4gKiBgcmVwZWF0YCB0aGVuIHBlcmZvcm1zIGl0J3MgY3VzdG9tIGxvZ2ljIHRvIHJlbmRlciBtdWx0aXBsZSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0gZiBUaGUgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24uIE11c3QgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYVxuICogZnVuY3Rpb24gb2YgdGhlIHNpZ25hdHVyZSBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLiBUaGUgcmV0dXJuZWQgZnVuY3Rpb24gd2lsbFxuICogYmUgY2FsbGVkIHdpdGggdGhlIHBhcnQgb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogaW1wb3J0IHtkaXJlY3RpdmUsIGh0bWx9IGZyb20gJ2xpdC1odG1sJztcbiAqXG4gKiBjb25zdCBpbW11dGFibGUgPSBkaXJlY3RpdmUoKHYpID0+IChwYXJ0KSA9PiB7XG4gKiAgIGlmIChwYXJ0LnZhbHVlICE9PSB2KSB7XG4gKiAgICAgcGFydC5zZXRWYWx1ZSh2KVxuICogICB9XG4gKiB9KTtcbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9IChmKSA9PiAoKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBkID0gZiguLi5hcmdzKTtcbiAgICBkaXJlY3RpdmVzLnNldChkLCB0cnVlKTtcbiAgICByZXR1cm4gZDtcbn0pO1xuZXhwb3J0IGNvbnN0IGlzRGlyZWN0aXZlID0gKG8pID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdmdW5jdGlvbicgJiYgZGlyZWN0aXZlcy5oYXMobyk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlyZWN0aXZlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogVHJ1ZSBpZiB0aGUgY3VzdG9tIGVsZW1lbnRzIHBvbHlmaWxsIGlzIGluIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ0VQb2x5ZmlsbCA9IHdpbmRvdy5jdXN0b21FbGVtZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sgIT09XG4gICAgICAgIHVuZGVmaW5lZDtcbi8qKlxuICogUmVwYXJlbnRzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydGAgKGluY2x1c2l2ZSkgdG8gYGVuZGAgKGV4Y2x1c2l2ZSksXG4gKiBpbnRvIGFub3RoZXIgY29udGFpbmVyIChjb3VsZCBiZSB0aGUgc2FtZSBjb250YWluZXIpLCBiZWZvcmUgYGJlZm9yZWAuIElmXG4gKiBgYmVmb3JlYCBpcyBudWxsLCBpdCBhcHBlbmRzIHRoZSBub2RlcyB0byB0aGUgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgcmVwYXJlbnROb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsLCBiZWZvcmUgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKHN0YXJ0LCBiZWZvcmUpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8qKlxuICogUmVtb3ZlcyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLCBmcm9tXG4gKiBgY29udGFpbmVyYC5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZU5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwpID0+IHtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgICAgICBjb25zdCBuID0gc3RhcnQubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG9tLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxOCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IHt9O1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIE5vZGVQYXJ0IHRvIGZ1bGx5IGNsZWFyIGl0cyBjb250ZW50LlxuICovXG5leHBvcnQgY29uc3Qgbm90aGluZyA9IHt9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHdpdGggZW1iZWRkZWQgdW5pcXVlIGtleSB0byBhdm9pZCBjb2xsaXNpb24gd2l0aFxuICogcG9zc2libGUgdGV4dCBpbiB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBtYXJrZXIgPSBge3tsaXQtJHtTdHJpbmcoTWF0aC5yYW5kb20oKSkuc2xpY2UoMil9fX1gO1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB1c2VkIHRleHQtcG9zaXRpb25zLCBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZXMsIGFuZFxuICogYXR0cmlidXRlcyB3aXRoIG1hcmt1cC1saWtlIHRleHQgdmFsdWVzLlxuICovXG5leHBvcnQgY29uc3Qgbm9kZU1hcmtlciA9IGA8IS0tJHttYXJrZXJ9LS0+YDtcbmV4cG9ydCBjb25zdCBtYXJrZXJSZWdleCA9IG5ldyBSZWdFeHAoYCR7bWFya2VyfXwke25vZGVNYXJrZXJ9YCk7XG4vKipcbiAqIFN1ZmZpeCBhcHBlbmRlZCB0byBhbGwgYm91bmQgYXR0cmlidXRlIG5hbWVzLlxuICovXG5leHBvcnQgY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIFRlbXBsYXRlIHRoYXQgdHJhY2tzIHRoZSBsb2NhdGlvbiBvZiBkeW5hbWljIHBhcnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbXTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZWxlbWVudC5jb250ZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgaW5kZXggYXNzb2NpYXRlZCB3aXRoIGEgcGFydC4gV2UgdHJ5IHRvIGRlbGV0ZVxuICAgICAgICAvLyB1bm5lY2Vzc2FyeSBub2RlcywgYnV0IHdlIG5ldmVyIHdhbnQgdG8gYXNzb2NpYXRlIHR3byBkaWZmZXJlbnQgcGFydHNcbiAgICAgICAgLy8gdG8gdGhlIHNhbWUgaW5kZXguIFRoZXkgbXVzdCBoYXZlIGEgY29uc3RhbnQgbm9kZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgbGFzdFBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgeyBzdHJpbmdzLCB2YWx1ZXM6IHsgbGVuZ3RoIH0gfSA9IHJlc3VsdDtcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAvKiBOb2RlLkVMRU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGxlbmd0aCB9ID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9OYW1lZE5vZGVNYXAsXG4gICAgICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHJldHVybmVkIGluIGRvY3VtZW50IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBwYXJ0aWN1bGFyLCBFZGdlL0lFIGNhbiByZXR1cm4gdGhlbSBvdXQgb2Ygb3JkZXIsIHNvIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgICAgICAvLyBhc3N1bWUgYSBjb3JyZXNwb25kZW5jZSBiZXR3ZWVuIHBhcnQgaW5kZXggYW5kIGF0dHJpYnV0ZSBpbmRleC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoKGF0dHJpYnV0ZXNbaV0ubmFtZSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBzZWN0aW9uIGxlYWRpbmcgdXAgdG8gdGhlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIGluIHRoaXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gc3RyaW5nc1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMoc3RyaW5nRm9yUGFydClbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxsIGJvdW5kIGF0dHJpYnV0ZXMgaGF2ZSBoYWQgYSBzdWZmaXggYWRkZWQgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBsYXRlUmVzdWx0I2dldEhUTUwgdG8gb3B0IG91dCBvZiBzcGVjaWFsIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcuIFRvIGxvb2sgdXAgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB3ZSBhbHNvIG5lZWQgdG8gYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3VmZml4LlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTG9va3VwTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKSArIGJvdW5kQXR0cmlidXRlU3VmZml4O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IGF0dHJpYnV0ZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdhdHRyaWJ1dGUnLCBpbmRleCwgbmFtZSwgc3RyaW5nczogc3RhdGljcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBzdGF0aWNzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gZGF0YS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbnNlcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcyA9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocyA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBjcmVhdGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCAmJiBlbmRzV2l0aChtYXRjaFsyXSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArIG1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzJdLnNsaWNlKDAsIC1ib3VuZEF0dHJpYnV0ZVN1ZmZpeC5sZW5ndGgpICsgbWF0Y2hbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpbnNlcnQsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogKytpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIHRleHQsIHdlIG11c3QgaW5zZXJ0IGEgY29tbWVudCB0byBtYXJrIG91ciBwbGFjZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHRydXN0IGl0IHdpbGwgc3RpY2sgYXJvdW5kIGFmdGVyIGNsb25pbmcuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9IHN0cmluZ3NbbGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgcGFydCBmb3IgZWFjaCBtYXRjaCBmb3VuZFxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogTm9kZS5DT01NRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kYXRhID09PSBtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2ZcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gICogV2UgZG9uJ3QgaGF2ZSBhIHByZXZpb3VzU2libGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyAgKiBUaGUgcHJldmlvdXNTaWJsaW5nIGlzIGFscmVhZHkgdGhlIHN0YXJ0IG9mIGEgcHJldmlvdXMgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IG51bGwgfHwgaW5kZXggPT09IGxhc3RQYXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0UGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBuZXh0U2libGluZywga2VlcCB0aGlzIG5vZGUgc28gd2UgaGF2ZSBhbiBlbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiByZW1vdmUgaXQgdG8gc2F2ZSBmdXR1cmUgY29zdHMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGkgPSBub2RlLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBjb25zaWRlciB3aGV0aGVyIGl0J3MgZXZlbiB3b3J0aCBpdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBiaW5kaW5ncyBpbiBjb21tZW50cyB3b3JrXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiAtMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSB0ZXh0IGJpbmRpbmcgbm9kZXMgYWZ0ZXIgdGhlIHdhbGsgdG8gbm90IGRpc3R1cmIgdGhlIFRyZWVXYWxrZXJcbiAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVuZHNXaXRoID0gKHN0ciwgc3VmZml4KSA9PiB7XG4gICAgY29uc3QgaW5kZXggPSBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aDtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBzdHIuc2xpY2UoaW5kZXgpID09PSBzdWZmaXg7XG59O1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLy8gQWxsb3dzIGBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKWAgdG8gYmUgcmVuYW1lZCBmb3IgYVxuLy8gc21hbGwgbWFudWFsIHNpemUtc2F2aW5ncy5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbi8qKlxuICogVGhpcyByZWdleCBleHRyYWN0cyB0aGUgYXR0cmlidXRlIG5hbWUgcHJlY2VkaW5nIGFuIGF0dHJpYnV0ZS1wb3NpdGlvblxuICogZXhwcmVzc2lvbi4gSXQgZG9lcyB0aGlzIGJ5IG1hdGNoaW5nIHRoZSBzeW50YXggYWxsb3dlZCBmb3IgYXR0cmlidXRlc1xuICogYWdhaW5zdCB0aGUgc3RyaW5nIGxpdGVyYWwgZGlyZWN0bHkgcHJlY2VkaW5nIHRoZSBleHByZXNzaW9uLCBhc3N1bWluZyB0aGF0XG4gKiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhbiBhdHRyaWJ1dGUtdmFsdWUgcG9zaXRpb24uXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx4MDlcXHgwYVxceDBjXFx4MGRcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2luZnJhc3RydWN0dXJlLmh0bWwjc3BhY2UtY2hhcmFjdGVyc1xuICpcbiAqIFwiXFwwLVxceDFGXFx4N0YtXFx4OUZcIiBhcmUgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnMsIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5XG4gKiBzcGFjZSBjaGFyYWN0ZXIgZXhjZXB0IFwiIFwiLlxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIGNvbnRyb2wgY2hhcmFjdGVyLCBzcGFjZSBjaGFyYWN0ZXIsICgnKSxcbiAqICAgIChcIiksIFwiPlwiLCBcIj1cIiwgb3IgXCIvXCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmV4cG9ydCBjb25zdCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4ID0gLyhbIFxceDA5XFx4MGFcXHgwY1xceDBkXSkoW15cXDAtXFx4MUZcXHg3Ri1cXHg5RiBcIic+PS9dKykoWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qPVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKig/OlteIFxceDA5XFx4MGFcXHgwY1xceDBkXCInYDw+PV0qfFwiW15cIl0qfCdbXiddKikpJC87XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNDRVBvbHlmaWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgYSBgVGVtcGxhdGVgIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIHRoZSBET00gYW5kIHVwZGF0ZWRcbiAqIHdpdGggbmV3IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlSW5zdGFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBwcm9jZXNzb3IsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fX3BhcnRzID0gW107XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIHVwZGF0ZSh2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5zZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jbG9uZSgpIHtcbiAgICAgICAgLy8gVGhlcmUgYXJlIGEgbnVtYmVyIG9mIHN0ZXBzIGluIHRoZSBsaWZlY3ljbGUgb2YgYSB0ZW1wbGF0ZSBpbnN0YW5jZSdzXG4gICAgICAgIC8vIERPTSBmcmFnbWVudDpcbiAgICAgICAgLy8gIDEuIENsb25lIC0gY3JlYXRlIHRoZSBpbnN0YW5jZSBmcmFnbWVudFxuICAgICAgICAvLyAgMi4gQWRvcHQgLSBhZG9wdCBpbnRvIHRoZSBtYWluIGRvY3VtZW50XG4gICAgICAgIC8vICAzLiBQcm9jZXNzIC0gZmluZCBwYXJ0IG1hcmtlcnMgYW5kIGNyZWF0ZSBwYXJ0c1xuICAgICAgICAvLyAgNC4gVXBncmFkZSAtIHVwZ3JhZGUgY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIC8vICA1LiBVcGRhdGUgLSBzZXQgbm9kZSwgYXR0cmlidXRlLCBwcm9wZXJ0eSwgZXRjLiwgdmFsdWVzXG4gICAgICAgIC8vICA2LiBDb25uZWN0IC0gY29ubmVjdCB0byB0aGUgZG9jdW1lbnQuIE9wdGlvbmFsIGFuZCBvdXRzaWRlIG9mIHRoaXNcbiAgICAgICAgLy8gICAgIG1ldGhvZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgaGF2ZSBhIGZldyBjb25zdHJhaW50cyBvbiB0aGUgb3JkZXJpbmcgb2YgdGhlc2Ugc3RlcHM6XG4gICAgICAgIC8vICAqIFdlIG5lZWQgdG8gdXBncmFkZSBiZWZvcmUgdXBkYXRpbmcsIHNvIHRoYXQgcHJvcGVydHkgdmFsdWVzIHdpbGwgcGFzc1xuICAgICAgICAvLyAgICB0aHJvdWdoIGFueSBwcm9wZXJ0eSBzZXR0ZXJzLlxuICAgICAgICAvLyAgKiBXZSB3b3VsZCBsaWtlIHRvIHByb2Nlc3MgYmVmb3JlIHVwZ3JhZGluZyBzbyB0aGF0IHdlJ3JlIHN1cmUgdGhhdCB0aGVcbiAgICAgICAgLy8gICAgY2xvbmVkIGZyYWdtZW50IGlzIGluZXJ0IGFuZCBub3QgZGlzdHVyYmVkIGJ5IHNlbGYtbW9kaWZ5aW5nIERPTS5cbiAgICAgICAgLy8gICogV2Ugd2FudCBjdXN0b20gZWxlbWVudHMgdG8gdXBncmFkZSBldmVuIGluIGRpc2Nvbm5lY3RlZCBmcmFnbWVudHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEdpdmVuIHRoZXNlIGNvbnN0cmFpbnRzLCB3aXRoIGZ1bGwgY3VzdG9tIGVsZW1lbnRzIHN1cHBvcnQgd2Ugd291bGRcbiAgICAgICAgLy8gcHJlZmVyIHRoZSBvcmRlcjogQ2xvbmUsIFByb2Nlc3MsIEFkb3B0LCBVcGdyYWRlLCBVcGRhdGUsIENvbm5lY3RcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQnV0IFNhZmFyaSBkb29lcyBub3QgaW1wbGVtZW50IEN1c3RvbUVsZW1lbnRSZWdpc3RyeSN1cGdyYWRlLCBzbyB3ZVxuICAgICAgICAvLyBjYW4gbm90IGltcGxlbWVudCB0aGF0IG9yZGVyIGFuZCBzdGlsbCBoYXZlIHVwZ3JhZGUtYmVmb3JlLXVwZGF0ZSBhbmRcbiAgICAgICAgLy8gdXBncmFkZSBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLiBTbyB3ZSBpbnN0ZWFkIHNhY3JpZmljZSB0aGVcbiAgICAgICAgLy8gcHJvY2Vzcy1iZWZvcmUtdXBncmFkZSBjb25zdHJhaW50LCBzaW5jZSBpbiBDdXN0b20gRWxlbWVudHMgdjEgZWxlbWVudHNcbiAgICAgICAgLy8gbXVzdCBub3QgbW9kaWZ5IHRoZWlyIGxpZ2h0IERPTSBpbiB0aGUgY29uc3RydWN0b3IuIFdlIHN0aWxsIGhhdmUgaXNzdWVzXG4gICAgICAgIC8vIHdoZW4gY28tZXhpc3Rpbmcgd2l0aCBDRXYwIGVsZW1lbnRzIGxpa2UgUG9seW1lciAxLCBhbmQgd2l0aCBwb2x5ZmlsbHNcbiAgICAgICAgLy8gdGhhdCBkb24ndCBzdHJpY3RseSBhZGhlcmUgdG8gdGhlIG5vLW1vZGlmaWNhdGlvbiBydWxlIGJlY2F1c2Ugc2hhZG93XG4gICAgICAgIC8vIERPTSwgd2hpY2ggbWF5IGJlIGNyZWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCBpcyBlbXVsYXRlZCBieSBiZWluZyBwbGFjZWRcbiAgICAgICAgLy8gaW4gdGhlIGxpZ2h0IERPTS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHJlc3VsdGluZyBvcmRlciBpcyBvbiBuYXRpdmUgaXM6IENsb25lLCBBZG9wdCwgVXBncmFkZSwgUHJvY2VzcyxcbiAgICAgICAgLy8gVXBkYXRlLCBDb25uZWN0LiBkb2N1bWVudC5pbXBvcnROb2RlKCkgcGVyZm9ybXMgQ2xvbmUsIEFkb3B0LCBhbmQgVXBncmFkZVxuICAgICAgICAvLyBpbiBvbmUgc3RlcC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIEN1c3RvbSBFbGVtZW50cyB2MSBwb2x5ZmlsbCBzdXBwb3J0cyB1cGdyYWRlKCksIHNvIHRoZSBvcmRlciB3aGVuXG4gICAgICAgIC8vIHBvbHlmaWxsZWQgaXMgdGhlIG1vcmUgaWRlYWw6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLFxuICAgICAgICAvLyBDb25uZWN0LlxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGlzQ0VQb2x5ZmlsbCA/XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkgOlxuICAgICAgICAgICAgZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy50ZW1wbGF0ZS5wYXJ0cztcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZnJhZ21lbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgICAgIGxldCBwYXJ0O1xuICAgICAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHRoZSBub2RlcyBhbmQgcGFydHMgb2YgYSB0ZW1wbGF0ZVxuICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIGlmICghaXNUZW1wbGF0ZVBhcnRBY3RpdmUocGFydCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgdGhlIHRyZWUgd2Fsa2VyIHVudGlsIHdlIGZpbmQgb3VyIG5leHQgcGFydCdzIG5vZGUuXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgbXVsdGlwbGUgcGFydHMgbWF5IHNoYXJlIHRoZSBzYW1lIG5vZGUgKGF0dHJpYnV0ZSBwYXJ0c1xuICAgICAgICAgICAgLy8gb24gYSBzaW5nbGUgZWxlbWVudCksIHNvIHRoaXMgbG9vcCBtYXkgbm90IHJ1biBhdCBhbGwuXG4gICAgICAgICAgICB3aGlsZSAobm9kZUluZGV4IDwgcGFydC5pbmRleCkge1xuICAgICAgICAgICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGV4aGF1c3RlZCB0aGUgY29udGVudCBpbnNpZGUgYSBuZXN0ZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlIHdhbGtlciB3aWxsIGZpbmQgYSBuZXh0Tm9kZSBvdXRzaWRlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlJ3ZlIGFycml2ZWQgYXQgb3VyIHBhcnQncyBub2RlLlxuICAgICAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucHJvY2Vzc29yLmhhbmRsZVRleHRFeHByZXNzaW9uKHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcGFydC5pbnNlcnRBZnRlck5vZGUobm9kZS5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2goLi4udGhpcy5wcm9jZXNzb3IuaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMobm9kZSwgcGFydC5uYW1lLCBwYXJ0LnN0cmluZ3MsIHRoaXMub3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ0VQb2x5ZmlsbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRvcHROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIGN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1pbnN0YW5jZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJvdW5kQXR0cmlidXRlU3VmZml4LCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LCBtYXJrZXIsIG5vZGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmNvbnN0IGNvbW1lbnRNYXJrZXIgPSBgICR7bWFya2VyfSBgO1xuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgYGh0bWxgLCB3aGljaCBob2xkcyBhIFRlbXBsYXRlIGFuZCB0aGUgdmFsdWVzIGZyb21cbiAqIGludGVycG9sYXRlZCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdHJpbmdzLCB2YWx1ZXMsIHR5cGUsIHByb2Nlc3Nvcikge1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgSFRNTCB1c2VkIHRvIGNyZWF0ZSBhIGA8dGVtcGxhdGU+YCBlbGVtZW50LlxuICAgICAqL1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLnN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgbGV0IGlzQ29tbWVudEJpbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3NbaV07XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBiaW5kaW5nIHdlIHdhbnQgdG8gZGV0ZXJtaW5lIHRoZSBraW5kIG9mIG1hcmtlciB0byBpbnNlcnRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIHRlbXBsYXRlIHNvdXJjZSBiZWZvcmUgaXQncyBwYXJzZWQgYnkgdGhlIGJyb3dzZXIncyBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFRoZSBtYXJrZXIgdHlwZSBpcyBiYXNlZCBvbiB3aGV0aGVyIHRoZSBleHByZXNzaW9uIGlzIGluIGFuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGUsIHRleHQsIG9yIGNvbW1lbnQgcG9pc2l0aW9uLlxuICAgICAgICAgICAgLy8gICAqIEZvciBub2RlLXBvc2l0aW9uIGJpbmRpbmdzIHdlIGluc2VydCBhIGNvbW1lbnQgd2l0aCB0aGUgbWFya2VyXG4gICAgICAgICAgICAvLyAgICAgc2VudGluZWwgYXMgaXRzIHRleHQgY29udGVudCwgbGlrZSA8IS0te3tsaXQtZ3VpZH19LS0+LlxuICAgICAgICAgICAgLy8gICAqIEZvciBhdHRyaWJ1dGUgYmluZGluZ3Mgd2UgaW5zZXJ0IGp1c3QgdGhlIG1hcmtlciBzZW50aW5lbCBmb3IgdGhlXG4gICAgICAgICAgICAvLyAgICAgZmlyc3QgYmluZGluZywgc28gdGhhdCB3ZSBzdXBwb3J0IHVucXVvdGVkIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAgICAgICAgICAgIC8vICAgICBTdWJzZXF1ZW50IGJpbmRpbmdzIGNhbiB1c2UgYSBjb21tZW50IG1hcmtlciBiZWNhdXNlIG11bHRpLWJpbmRpbmdcbiAgICAgICAgICAgIC8vICAgICBhdHRyaWJ1dGVzIG11c3QgYmUgcXVvdGVkLlxuICAgICAgICAgICAgLy8gICAqIEZvciBjb21tZW50IGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgc28gd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vICAgICBjbG9zZSB0aGUgY29tbWVudC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgc2NhbnMgdGhlIHRlbXBsYXRlIHNvdXJjZSwgYnV0IGlzICpub3QqIGFuIEhUTUxcbiAgICAgICAgICAgIC8vIHBhcnNlci4gV2UgZG9uJ3QgbmVlZCB0byB0cmFjayB0aGUgdHJlZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwsIG9ubHlcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgYSBiaW5kaW5nIGlzIGluc2lkZSBhIGNvbW1lbnQsIGFuZCBpZiBub3QsIGlmIGl0IGFwcGVhcnMgdG8gYmVcbiAgICAgICAgICAgIC8vIHRoZSBmaXJzdCBiaW5kaW5nIGluIGFuIGF0dHJpYnV0ZS5cbiAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRPcGVuID0gcy5sYXN0SW5kZXhPZignPCEtLScpO1xuICAgICAgICAgICAgLy8gV2UncmUgaW4gY29tbWVudCBwb3NpdGlvbiBpZiB3ZSBoYXZlIGEgY29tbWVudCBvcGVuIHdpdGggbm8gZm9sbG93aW5nXG4gICAgICAgICAgICAvLyBjb21tZW50IGNsb3NlLiBCZWNhdXNlIDwtLSBjYW4gYXBwZWFyIGluIGFuIGF0dHJpYnV0ZSB2YWx1ZSB0aGVyZSBjYW5cbiAgICAgICAgICAgIC8vIGJlIGZhbHNlIHBvc2l0aXZlcy5cbiAgICAgICAgICAgIGlzQ29tbWVudEJpbmRpbmcgPSAoY29tbWVudE9wZW4gPiAtMSB8fCBpc0NvbW1lbnRCaW5kaW5nKSAmJlxuICAgICAgICAgICAgICAgIHMuaW5kZXhPZignLS0+JywgY29tbWVudE9wZW4gKyAxKSA9PT0gLTE7XG4gICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhbiBhdHRyaWJ1dGUtbGlrZSBzZXF1ZW5jZSBwcmVjZWVkaW5nIHRoZVxuICAgICAgICAgICAgLy8gZXhwcmVzc2lvbi4gVGhpcyBjYW4gbWF0Y2ggXCJuYW1lPXZhbHVlXCIgbGlrZSBzdHJ1Y3R1cmVzIGluIHRleHQsXG4gICAgICAgICAgICAvLyBjb21tZW50cywgYW5kIGF0dHJpYnV0ZSB2YWx1ZXMsIHNvIHRoZXJlIGNhbiBiZSBmYWxzZS1wb3NpdGl2ZXMuXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVNYXRjaCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzKTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVNYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgaW4gdGhpcyBicmFuY2ggaWYgd2UgZG9uJ3QgaGF2ZSBhIGF0dHJpYnV0ZS1saWtlXG4gICAgICAgICAgICAgICAgLy8gcHJlY2VlZGluZyBzZXF1ZW5jZS4gRm9yIGNvbW1lbnRzLCB0aGlzIGd1YXJkcyBhZ2FpbnN0IHVudXN1YWxcbiAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGUgdmFsdWVzIGxpa2UgPGRpdiBmb289XCI8IS0tJHsnYmFyJ31cIj4uIENhc2VzIGxpa2VcbiAgICAgICAgICAgICAgICAvLyA8IS0tIGZvbz0keydiYXInfS0tPiBhcmUgaGFuZGxlZCBjb3JyZWN0bHkgaW4gdGhlIGF0dHJpYnV0ZSBicmFuY2hcbiAgICAgICAgICAgICAgICAvLyBiZWxvdy5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMgKyAoaXNDb21tZW50QmluZGluZyA/IGNvbW1lbnRNYXJrZXIgOiBub2RlTWFya2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBhdHRyaWJ1dGVzIHdlIHVzZSBqdXN0IGEgbWFya2VyIHNlbnRpbmVsLCBhbmQgYWxzbyBhcHBlbmQgYVxuICAgICAgICAgICAgICAgIC8vICRsaXQkIHN1ZmZpeCB0byB0aGUgbmFtZSB0byBvcHQtb3V0IG9mIGF0dHJpYnV0ZS1zcGVjaWZpYyBwYXJzaW5nXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBJRSBhbmQgRWRnZSBkbyBmb3Igc3R5bGUgYW5kIGNlcnRhaW4gU1ZHIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzLnN1YnN0cigwLCBhdHRyaWJ1dGVNYXRjaC5pbmRleCkgKyBhdHRyaWJ1dGVNYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU1hdGNoWzJdICsgYm91bmRBdHRyaWJ1dGVTdWZmaXggKyBhdHRyaWJ1dGVNYXRjaFszXSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBodG1sICs9IHRoaXMuc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0aGlzLmdldEhUTUwoKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCBmb3IgU1ZHIGZyYWdtZW50cy5cbiAqXG4gKiBUaGlzIGNsYXNzIHdyYXBzIEhUTUwgaW4gYW4gYDxzdmc+YCB0YWcgaW4gb3JkZXIgdG8gcGFyc2UgaXRzIGNvbnRlbnRzIGluIHRoZVxuICogU1ZHIG5hbWVzcGFjZSwgdGhlbiBtb2RpZmllcyB0aGUgdGVtcGxhdGUgdG8gcmVtb3ZlIHRoZSBgPHN2Zz5gIHRhZyBzbyB0aGF0XG4gKiBjbG9uZXMgb25seSBjb250YWluZXIgdGhlIG9yaWdpbmFsIGZyYWdtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU1ZHVGVtcGxhdGVSZXN1bHQgZXh0ZW5kcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgcmV0dXJuIGA8c3ZnPiR7c3VwZXIuZ2V0SFRNTCgpfTwvc3ZnPmA7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBzdXBlci5nZXRUZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBjb250ZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoc3ZnRWxlbWVudCk7XG4gICAgICAgIHJlcGFyZW50Tm9kZXMoY29udGVudCwgc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLXJlc3VsdC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9wYXJ0LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuaW1wb3J0IHsgY3JlYXRlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICEodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpKTtcbn07XG5leHBvcnQgY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSB8fFxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICEhKHZhbHVlICYmIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pO1xufTtcbi8qKlxuICogV3JpdGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdG8gdGhlIERPTSBmb3IgYSBncm91cCBvZiBBdHRyaWJ1dGVQYXJ0cyBib3VuZCB0byBhXG4gKiBzaW5nbGUgYXR0aWJ1dGUuIFRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzXG4gKiBmb3IgYW4gYXR0cmlidXRlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydHNbaV0gPSB0aGlzLl9jcmVhdGVQYXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNpbmdsZSBwYXJ0LiBPdmVycmlkZSB0aGlzIHRvIGNyZWF0ZSBhIGRpZmZlcm50IHR5cGUgb2YgcGFydC5cbiAgICAgKi9cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG4gICAgICAgIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gcGFydC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQcmltaXRpdmUodikgfHwgIWlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogU3RyaW5nKHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0IG9mIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHQgPT09ICdzdHJpbmcnID8gdCA6IFN0cmluZyh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgdGhpcy5fZ2V0VmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGFsbCBvciBwYXJ0IG9mIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGNvbW1pdHRlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNvbW1pdHRlciA9IGNvbW1pdHRlcjtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBub0NoYW5nZSAmJiAoIWlzUHJpbWl0aXZlKHZhbHVlKSB8fCB2YWx1ZSAhPT0gdGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhIG5vdCBhIGRpcmVjdGl2ZSwgZGlydHkgdGhlIGNvbW1pdHRlciBzbyB0aGF0IGl0J2xsXG4gICAgICAgICAgICAvLyBjYWxsIHNldEF0dHJpYnV0ZS4gSWYgdGhlIHZhbHVlIGlzIGEgZGlyZWN0aXZlLCBpdCdsbCBkaXJ0eSB0aGVcbiAgICAgICAgICAgIC8vIGNvbW1pdHRlciBpZiBpdCBjYWxscyBzZXRWYWx1ZSgpLlxuICAgICAgICAgICAgaWYgKCFpc0RpcmVjdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1pdHRlci5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21taXR0ZXIuY29tbWl0KCk7XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhIGxvY2F0aW9uIHdpdGhpbiBhIE5vZGUgdHJlZS4gTGlrZSBhIFJhbmdlLCBOb2RlUGFydFxuICogaGFzIHN0YXJ0IGFuZCBlbmQgbG9jYXRpb25zIGFuZCBjYW4gc2V0IGFuZCB1cGRhdGUgdGhlIE5vZGVzIGJldHdlZW4gdGhvc2VcbiAqIGxvY2F0aW9ucy5cbiAqXG4gKiBOb2RlUGFydHMgc3VwcG9ydCBzZXZlcmFsIHZhbHVlIHR5cGVzOiBwcmltaXRpdmVzLCBOb2RlcywgVGVtcGxhdGVSZXN1bHRzLFxuICogYXMgd2VsbCBhcyBhcnJheXMgYW5kIGl0ZXJhYmxlcyBvZiB0aG9zZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvKGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBub2RlIChiZXR3ZWVuIGByZWZgIGFuZCBgcmVmYCdzIG5leHRcbiAgICAgKiBzaWJsaW5nKS4gQm90aCBgcmVmYCBhbmQgaXRzIG5leHQgc2libGluZyBtdXN0IGJlIHN0YXRpYywgdW5jaGFuZ2luZyBub2Rlc1xuICAgICAqIHN1Y2ggYXMgdGhvc2UgdGhhdCBhcHBlYXIgaW4gYSBsaXRlcmFsIHNlY3Rpb24gb2YgYSB0ZW1wbGF0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyTm9kZShyZWYpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSByZWY7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5uZXh0U2libGluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIHBhcmVudCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50b1BhcnQocGFydCkge1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuZW5kTm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlclBhcnQocmVmKSB7XG4gICAgICAgIHJlZi5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLmVuZE5vZGU7XG4gICAgICAgIHJlZi5lbmROb2RlID0gdGhpcy5zdGFydE5vZGU7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub3RoaW5nO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2luc2VydChub2RlKSB7XG4gICAgICAgIHRoaXMuZW5kTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbiAgICBfX2NvbW1pdE5vZGUodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLl9faW5zZXJ0KHZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfX2NvbW1pdFRleHQodmFsdWUpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuc3RhcnROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xuICAgICAgICAvLyBJZiBgdmFsdWVgIGlzbid0IGFscmVhZHkgYSBzdHJpbmcsIHdlIGV4cGxpY2l0bHkgY29udmVydCBpdCBoZXJlIGluIGNhc2VcbiAgICAgICAgLy8gaXQgY2FuJ3QgYmUgaW1wbGljaXRseSBjb252ZXJ0ZWQgLSBpLmUuIGl0J3MgYSBzeW1ib2wuXG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgICBpZiAobm9kZSA9PT0gdGhpcy5lbmROb2RlLnByZXZpb3VzU2libGluZyAmJlxuICAgICAgICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIHRleHQgbm9kZSBiZXR3ZWVuIHRoZSBtYXJrZXJzLCB3ZSBjYW4ganVzdFxuICAgICAgICAgICAgLy8gc2V0IGl0cyB2YWx1ZSwgcmF0aGVyIHRoYW4gcmVwbGFjaW5nIGl0LlxuICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogQ2FuIHdlIGp1c3QgY2hlY2sgaWYgdGhpcy52YWx1ZSBpcyBwcmltaXRpdmU/XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZUFzU3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWVBc1N0cmluZykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZUZhY3RvcnkodmFsdWUpO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlSW5zdGFuY2UgJiZcbiAgICAgICAgICAgIHRoaXMudmFsdWUudGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHByb3BhZ2F0ZSB0aGUgdGVtcGxhdGUgcHJvY2Vzc29yIGZyb20gdGhlIFRlbXBsYXRlUmVzdWx0XG4gICAgICAgICAgICAvLyBzbyB0aGF0IHdlIHVzZSBpdHMgc3ludGF4IGV4dGVuc2lvbiwgZXRjLiBUaGUgdGVtcGxhdGUgZmFjdG9yeSBjb21lc1xuICAgICAgICAgICAgLy8gZnJvbSB0aGUgcmVuZGVyIGZ1bmN0aW9uIG9wdGlvbnMgc28gdGhhdCBpdCBjYW4gY29udHJvbCB0ZW1wbGF0ZVxuICAgICAgICAgICAgLy8gY2FjaGluZyBhbmQgcHJlcHJvY2Vzc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUsIHZhbHVlLnByb2Nlc3NvciwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKCk7XG4gICAgICAgICAgICBpbnN0YW5jZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgICAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAgICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG4gICAgICAgIC8vIElmIF92YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgICAgICAvLyBpdGVyYWJsZSBhbmQgX3ZhbHVlIHdpbGwgY29udGFpbiB0aGUgTm9kZVBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlci4gSWYgX3ZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgICAgIC8vIGFycmF5IGZvciBOb2RlUGFydHMuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgICAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMudmFsdWU7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaXRlbVBhcnQ7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgICAgICBpZiAoaXRlbVBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0ID0gbmV3IE5vZGVQYXJ0KHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnRzLnB1c2goaXRlbVBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuYXBwZW5kSW50b1BhcnQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5pbnNlcnRBZnRlclBhcnQoaXRlbVBhcnRzW3BhcnRJbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtUGFydC5zZXRWYWx1ZShpdGVtKTtcbiAgICAgICAgICAgIGl0ZW1QYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKGl0ZW1QYXJ0ICYmIGl0ZW1QYXJ0LmVuZE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyKHN0YXJ0Tm9kZSA9IHRoaXMuc3RhcnROb2RlKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKHRoaXMuc3RhcnROb2RlLnBhcmVudE5vZGUsIHN0YXJ0Tm9kZS5uZXh0U2libGluZywgdGhpcy5lbmROb2RlKTtcbiAgICB9XG59XG4vKipcbiAqIEltcGxlbWVudHMgYSBib29sZWFuIGF0dHJpYnV0ZSwgcm91Z2hseSBhcyBkZWZpbmVkIGluIHRoZSBIVE1MXG4gKiBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIElmIHRoZSB2YWx1ZSBpcyB0cnV0aHksIHRoZW4gdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50IHdpdGggYSB2YWx1ZSBvZlxuICogJycuIElmIHRoZSB2YWx1ZSBpcyBmYWxzZXksIHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzdHJpbmdzLmxlbmd0aCAhPT0gMiB8fCBzdHJpbmdzWzBdICE9PSAnJyB8fCBzdHJpbmdzWzFdICE9PSAnJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb29sZWFuIGF0dHJpYnV0ZXMgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9ICEhdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG59XG4vKipcbiAqIFNldHMgYXR0cmlidXRlIHZhbHVlcyBmb3IgUHJvcGVydHlQYXJ0cywgc28gdGhhdCB0aGUgdmFsdWUgaXMgb25seSBzZXQgb25jZVxuICogZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHMgZm9yIGEgcHJvcGVydHkuXG4gKlxuICogSWYgYW4gZXhwcmVzc2lvbiBjb250cm9scyB0aGUgd2hvbGUgcHJvcGVydHkgdmFsdWUsIHRoZW4gdGhlIHZhbHVlIGlzIHNpbXBseVxuICogYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IHVuZGVyIGNvbnRyb2wuIElmIHRoZXJlIGFyZSBzdHJpbmcgbGl0ZXJhbHMgb3JcbiAqIG11bHRpcGxlIGV4cHJlc3Npb25zLCB0aGVuIHRoZSBzdHJpbmdzIGFyZSBleHByZXNzaW9ucyBhcmUgaW50ZXJwb2xhdGVkIGludG9cbiAqIGEgc3RyaW5nIGZpcnN0LlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlDb21taXR0ZXIgZXh0ZW5kcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHRoaXMuc2luZ2xlID1cbiAgICAgICAgICAgIChzdHJpbmdzLmxlbmd0aCA9PT0gMiAmJiBzdHJpbmdzWzBdID09PSAnJyAmJiBzdHJpbmdzWzFdID09PSAnJyk7XG4gICAgfVxuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5UGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5zaW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnRzWzBdLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0VmFsdWUoKTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMubmFtZV0gPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xufVxuLy8gRGV0ZWN0IGV2ZW50IGxpc3RlbmVyIG9wdGlvbnMgc3VwcG9ydC4gSWYgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eSBpcyByZWFkXG4vLyBmcm9tIHRoZSBvcHRpb25zIG9iamVjdCwgdGhlbiBvcHRpb25zIGFyZSBzdXBwb3J0ZWQuIElmIG5vdCwgdGhlbiB0aGUgdGhyaWRcbi8vIGFyZ3VtZW50IHRvIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlzIGludGVycHJldGVkIGFzIHRoZSBib29sZWFuIGNhcHR1cmVcbi8vIHZhbHVlIHNvIHdlIHNob3VsZCBvbmx5IHBhc3MgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eS5cbmxldCBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSBmYWxzZTtcbnRyeSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZ2V0IGNhcHR1cmUoKSB7XG4gICAgICAgICAgICBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbn1cbmNhdGNoIChfZSkge1xufVxuZXhwb3J0IGNsYXNzIEV2ZW50UGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgZXZlbnROYW1lLCBldmVudENvbnRleHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuZXZlbnRDb250ZXh0ID0gZXZlbnRDb250ZXh0O1xuICAgICAgICB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCA9IChlKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGUpO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0xpc3RlbmVyID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLnZhbHVlO1xuICAgICAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9IG5ld0xpc3RlbmVyID09IG51bGwgfHxcbiAgICAgICAgICAgIG9sZExpc3RlbmVyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAobmV3TGlzdGVuZXIuY2FwdHVyZSAhPT0gb2xkTGlzdGVuZXIuY2FwdHVyZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5vbmNlICE9PSBvbGRMaXN0ZW5lci5vbmNlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLnBhc3NpdmUgIT09IG9sZExpc3RlbmVyLnBhc3NpdmUpO1xuICAgICAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9IG5ld0xpc3RlbmVyICE9IG51bGwgJiYgKG9sZExpc3RlbmVyID09IG51bGwgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuICAgICAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaG91bGRBZGRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5fX29wdGlvbnMgPSBnZXRPcHRpb25zKG5ld0xpc3RlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuY2FsbCh0aGlzLmV2ZW50Q29udGV4dCB8fCB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gV2UgY29weSBvcHRpb25zIGJlY2F1c2Ugb2YgdGhlIGluY29uc2lzdGVudCBiZWhhdmlvciBvZiBicm93c2VycyB3aGVuIHJlYWRpbmdcbi8vIHRoZSB0aGlyZCBhcmd1bWVudCBvZiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci4gSUUxMSBkb2Vzbid0IHN1cHBvcnQgb3B0aW9uc1xuLy8gYXQgYWxsLiBDaHJvbWUgNDEgb25seSByZWFkcyBgY2FwdHVyZWAgaWYgdGhlIGFyZ3VtZW50IGlzIGFuIG9iamVjdC5cbmNvbnN0IGdldE9wdGlvbnMgPSAobykgPT4gbyAmJlxuICAgIChldmVudE9wdGlvbnNTdXBwb3J0ZWQgP1xuICAgICAgICB7IGNhcHR1cmU6IG8uY2FwdHVyZSwgcGFzc2l2ZTogby5wYXNzaXZlLCBvbmNlOiBvLm9uY2UgfSA6XG4gICAgICAgIG8uY2FwdHVyZSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0cy5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciB9IGZyb20gJy4vcGFydHMuanMnO1xuLyoqXG4gKiBDcmVhdGVzIFBhcnRzIHdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3Ige1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYW4gYXR0cmlidXRlLXBvc2l0aW9uIGJpbmRpbmcsIGdpdmVuIHRoZSBldmVudCwgYXR0cmlidXRlXG4gICAgICogbmFtZSwgYW5kIHN0cmluZyBsaXRlcmFscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gbmFtZSAgVGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtIHN0cmluZ3MgVGhlIHN0cmluZyBsaXRlcmFscy4gVGhlcmUgYXJlIGFsd2F5cyBhdCBsZWFzdCB0d28gc3RyaW5ncyxcbiAgICAgKiAgIGV2ZW50IGZvciBmdWxseS1jb250cm9sbGVkIGJpbmRpbmdzIHdpdGggYSBzaW5nbGUgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBoYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IG5hbWVbMF07XG4gICAgICAgIGlmIChwcmVmaXggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IFByb3BlcnR5Q29tbWl0dGVyKGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnQCcpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEV2ZW50UGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBvcHRpb25zLmV2ZW50Q29udGV4dCldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICc/Jykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgQm9vbGVhbkF0dHJpYnV0ZVBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBBdHRyaWJ1dGVDb21taXR0ZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYSB0ZXh0LXBvc2l0aW9uIGJpbmRpbmcuXG4gICAgICogQHBhcmFtIHRlbXBsYXRlRmFjdG9yeVxuICAgICAqL1xuICAgIGhhbmRsZVRleHRFeHByZXNzaW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlUGFydChvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yID0gbmV3IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgbWFya2VyLCBUZW1wbGF0ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBUaGUgZGVmYXVsdCBUZW1wbGF0ZUZhY3Rvcnkgd2hpY2ggY2FjaGVzIFRlbXBsYXRlcyBrZXllZCBvblxuICogcmVzdWx0LnR5cGUgYW5kIHJlc3VsdC5zdHJpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVGYWN0b3J5KHJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZUNhY2hlID0gdGVtcGxhdGVDYWNoZXMuZ2V0KHJlc3VsdC50eXBlKTtcbiAgICBpZiAodGVtcGxhdGVDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUgPSB7XG4gICAgICAgICAgICBzdHJpbmdzQXJyYXk6IG5ldyBXZWFrTWFwKCksXG4gICAgICAgICAgICBrZXlTdHJpbmc6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlcy5zZXQocmVzdWx0LnR5cGUsIHRlbXBsYXRlQ2FjaGUpO1xuICAgIH1cbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFRlbXBsYXRlU3RyaW5nc0FycmF5IGlzIG5ldywgZ2VuZXJhdGUgYSBrZXkgZnJvbSB0aGUgc3RyaW5nc1xuICAgIC8vIFRoaXMga2V5IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXMgd2l0aCBpZGVudGljYWwgY29udGVudFxuICAgIGNvbnN0IGtleSA9IHJlc3VsdC5zdHJpbmdzLmpvaW4obWFya2VyKTtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLmdldChrZXkpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm90IHNlZW4gdGhpcyBrZXkgYmVmb3JlLCBjcmVhdGUgYSBuZXcgVGVtcGxhdGVcbiAgICAgICAgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0LCByZXN1bHQuZ2V0VGVtcGxhdGVFbGVtZW50KCkpO1xuICAgICAgICAvLyBDYWNoZSB0aGUgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLnNldChrZXksIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLy8gQ2FjaGUgYWxsIGZ1dHVyZSBxdWVyaWVzIGZvciB0aGlzIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gICAgdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuc2V0KHJlc3VsdC5zdHJpbmdzLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xufVxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlQ2FjaGVzID0gbmV3IE1hcCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtZmFjdG9yeS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBOb2RlUGFydCB9IGZyb20gJy4vcGFydHMuanMnO1xuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCBjb25zdCBwYXJ0cyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIFJlbmRlcnMgYSB0ZW1wbGF0ZSByZXN1bHQgb3Igb3RoZXIgdmFsdWUgdG8gYSBjb250YWluZXIuXG4gKlxuICogVG8gdXBkYXRlIGEgY29udGFpbmVyIHdpdGggbmV3IHZhbHVlcywgcmVldmFsdWF0ZSB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBhbmRcbiAqIGNhbGwgYHJlbmRlcmAgd2l0aCB0aGUgbmV3IHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gcmVzdWx0IEFueSB2YWx1ZSByZW5kZXJhYmxlIGJ5IE5vZGVQYXJ0IC0gdHlwaWNhbGx5IGEgVGVtcGxhdGVSZXN1bHRcbiAqICAgICBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWcgbGlrZSBgaHRtbGAgb3IgYHN2Z2AuXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIHBhcmVudCB0byByZW5kZXIgdG8uIFRoZSBlbnRpcmUgY29udGVudHMgYXJlIGVpdGhlclxuICogICAgIHJlcGxhY2VkLCBvciBlZmZpY2llbnRseSB1cGRhdGVkIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhcyBwcmV2aW91c1xuICogICAgIHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgUmVuZGVyT3B0aW9ucyBmb3IgdGhlIGVudGlyZSByZW5kZXIgdHJlZSByZW5kZXJlZCB0byB0aGlzXG4gKiAgICAgY29udGFpbmVyLiBSZW5kZXIgb3B0aW9ucyBtdXN0ICpub3QqIGNoYW5nZSBiZXR3ZWVuIHJlbmRlcnMgdG8gdGhlIHNhbWVcbiAqICAgICBjb250YWluZXIsIGFzIHRob3NlIGNoYW5nZXMgd2lsbCBub3QgZWZmZWN0IHByZXZpb3VzbHkgcmVuZGVyZWQgRE9NLlxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKHJlc3VsdCwgY29udGFpbmVyLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IHBhcnQgPSBwYXJ0cy5nZXQoY29udGFpbmVyKTtcbiAgICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKGNvbnRhaW5lciwgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICBwYXJ0cy5zZXQoY29udGFpbmVyLCBwYXJ0ID0gbmV3IE5vZGVQYXJ0KE9iamVjdC5hc3NpZ24oeyB0ZW1wbGF0ZUZhY3RvcnkgfSwgb3B0aW9ucykpKTtcbiAgICAgICAgcGFydC5hcHBlbmRJbnRvKGNvbnRhaW5lcik7XG4gICAgfVxuICAgIHBhcnQuc2V0VmFsdWUocmVzdWx0KTtcbiAgICBwYXJ0LmNvbW1pdCgpO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqXG4gKiBNYWluIGxpdC1odG1sIG1vZHVsZS5cbiAqXG4gKiBNYWluIGV4cG9ydHM6XG4gKlxuICogLSAgW1todG1sXV1cbiAqIC0gIFtbc3ZnXV1cbiAqIC0gIFtbcmVuZGVyXV1cbiAqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKiBAcHJlZmVycmVkXG4gKi9cbi8qKlxuICogRG8gbm90IHJlbW92ZSB0aGlzIGNvbW1lbnQ7IGl0IGtlZXBzIHR5cGVkb2MgZnJvbSBtaXNwbGFjaW5nIHRoZSBtb2R1bGVcbiAqIGRvY3MuXG4gKi9cbmltcG9ydCB7IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmltcG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmV4cG9ydCB7IGRpcmVjdGl2ZSwgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2xpYi9kaXJlY3RpdmUuanMnO1xuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogcmVtb3ZlIGxpbmUgd2hlbiB3ZSBnZXQgTm9kZVBhcnQgbW92aW5nIG1ldGhvZHNcbmV4cG9ydCB7IHJlbW92ZU5vZGVzLCByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9saWIvZG9tLmpzJztcbmV4cG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9saWIvcGFydC5qcyc7XG5leHBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEF0dHJpYnV0ZVBhcnQsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIGlzSXRlcmFibGUsIGlzUHJpbWl0aXZlLCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIsIFByb3BlcnR5UGFydCB9IGZyb20gJy4vbGliL3BhcnRzLmpzJztcbmV4cG9ydCB7IHBhcnRzLCByZW5kZXIgfSBmcm9tICcuL2xpYi9yZW5kZXIuanMnO1xuZXhwb3J0IHsgdGVtcGxhdGVDYWNoZXMsIHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmV4cG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBjcmVhdGVNYXJrZXIsIGlzVGVtcGxhdGVQYXJ0QWN0aXZlLCBUZW1wbGF0ZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLmpzJztcbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBpbmplY3QgdmVyc2lvbiBudW1iZXIgYXQgYnVpbGQgdGltZVxuKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gfHwgKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gPSBbXSkpLnB1c2goJzEuMS4yJyk7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBTVkdUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdzdmcnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGl0LWh0bWwuanMubWFwIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHkgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlTWFwcGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBhbnksIFQgPSBhbnk+ID0gKHRoaXM6IEMsIHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiBUIHwgbnVsbDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlNYXBwZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IGFueSwgVCA9IGFueT4gPSAodGhpczogQywgdmFsdWU6IFQgfCBudWxsKSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEFuIG9iamVjdCB0aGF0IGhvbGRzIGFuIHtAbGluayBBdHRyaWJ1dGVNYXBwZXJ9IGFuZCBhIHtAbGluayBQcm9wZXJ0eU1hcHBlcn1cbiAqXG4gKiBAcmVtYXJrc1xuICogRm9yIHRoZSBtb3N0IGNvbW1vbiB0eXBlcywgYSBjb252ZXJ0ZXIgZXhpc3RzIHdoaWNoIGNhbiBiZSByZWZlcmVuY2VkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBAcHJvcGVydHkoe1xuICogICAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ29udmVydGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBhbnksIFQgPSBhbnk+IHtcbiAgICB0b0F0dHJpYnV0ZTogUHJvcGVydHlNYXBwZXI8QywgVD47XG4gICAgZnJvbUF0dHJpYnV0ZTogQXR0cmlidXRlTWFwcGVyPEMsIFQ+O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBjb252ZXJ0ZXJcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhpcyBjb252ZXJ0ZXIgaXMgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb252ZXJ0ZXIgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHVubGVzcyBhIGRpZmZlcmVudCBvbmVcbiAqIGlzIHNwZWNpZmllZC4gVGhlIGNvbnZlcnRlciB0cmllcyB0byBpbmZlciB0aGUgcHJvcGVydHkgdHlwZSB3aGVuIGNvbnZlcnRpbmcgdG8gYXR0cmlidXRlcyBhbmRcbiAqIHVzZXMgYEpTT04ucGFyc2UoKWAgd2hlbiBjb252ZXJ0aW5nIHN0cmluZ3MgZnJvbSBhdHRyaWJ1dGVzLiBJZiBgSlNPTi5wYXJzZSgpYCB0aHJvd3MgYW4gZXJyb3IsXG4gKiB0aGUgY29udmVydGVyIHdpbGwgdXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0OiBBdHRyaWJ1dGVDb252ZXJ0ZXIgPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCBzdWNjZXNzZnVsbHkgcGFyc2UgYGJvb2xlYW5gLCBgbnVtYmVyYCBhbmQgYEpTT04uc3RyaW5naWZ5YCdkIHZhbHVlc1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0IHRocm93cywgaXQgbWVhbnMgd2UncmUgcHJvYmFibHkgZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgfSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG51bWJlciwgYmlnaW50LCBzeW1ib2wsIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBhdHRyaWJ1dGVzLCBsaWtlIGBkaXNhYmxlZGAsIHdoaWNoIGFyZSBjb25zaWRlcmVkIHRydWUgaWYgdGhleSBhcmUgc2V0IHdpdGhcbiAqIGFueSB2YWx1ZSBhdCBhbGwuIEluIG9yZGVyIHRvIHNldCB0aGUgYXR0cmlidXRlIHRvIGZhbHNlLCB0aGUgYXR0cmlidXRlIGhhcyB0byBiZSByZW1vdmVkIGJ5XG4gKiBzZXR0aW5nIHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gYG51bGxgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPGFueSwgYm9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgIT09IG51bGwpLFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGJvb2xlYW4gfCBudWxsKSA9PiB2YWx1ZSA/ICcnIDogbnVsbFxufVxuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBBUklBIGF0dHJpYnV0ZXMsIGxpa2UgYGFyaWEtY2hlY2tlZGAgb3IgYGFyaWEtc2VsZWN0ZWRgLCB3aGljaCBoYXZlIHRvIGJlXG4gKiBzZXQgZXhwbGljaXRseSB0byBgdHJ1ZWAgb3IgYGZhbHNlYC5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWUpID0+IHZhbHVlID09PSAndHJ1ZScsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPGFueSwgc3RyaW5nPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogdmFsdWUsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdmFsdWVcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlcjogQXR0cmlidXRlQ29udmVydGVyPGFueSwgbnVtYmVyPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogTnVtYmVyKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJPYmplY3Q6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnksIG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnksIGFueVtdPiA9IHtcbiAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogSlNPTi5wYXJzZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGFueVtdIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn07XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEYXRlOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBEYXRlPiA9IHtcbiAgICAvLyBgbmV3IERhdGUoKWAgd2lsbCByZXR1cm4gYW4gYEludmFsaWQgRGF0ZWAgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBuZXcgRGF0ZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IERhdGUgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBzZWxlY3RvciBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzZWxlY3RvciB3aWxsIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB3aXRoIHRoZSBicm93c2VyJ3NcbiAgICAgKiB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEkuIElmIG5vIHNlbGVjdG9yIGlzIHNwZWNpZmllZCwgdGhlIGNvbXBvbmVudCBjbGFzc1xuICAgICAqIG5lZWRzIHRvIHByb3ZpZGUgb25lIGluIGl0cyBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zZWxlY3Rvcn0gcHJvcGVydHkuXG4gICAgICogQSBzZWxlY3RvciBkZWZpbmVkIGluIHRoZSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlXG4gICAgICogc3RhdGljIGNsYXNzIHByb3BlcnR5LlxuICAgICAqL1xuICAgIHNlbGVjdG9yOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET00gdG8gcmVuZGVyIHRoZSBjb21wb25lbnRzIHRlbXBsYXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTaGFkb3cgRE9NIGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgICogY29tcG9uZW50J3MgdGVtcGxhdGUgd2lsbCBiZSByZW5kZXJlZCBhcyBjaGlsZCBub2RlcyBvZiB0aGUgY29tcG9uZW50LiBUaGlzIGNhbiBiZVxuICAgICAqIHVzZWZ1bCBpZiBhbiBpc29sYXRlZCBET00gYW5kIHNjb3BlZCBDU1MgaXMgbm90IGRlc2lyZWQuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBzaGFkb3c6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSByZWdpc3RlciB0aGUgY29tcG9uZW50IHdpdGggdGhlIGJyb3dzZXIncyB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluIGNhc2VzIHdoZXJlIHlvdSB3YW50IHRvIGVtcGxveSBhIG1vZHVsZSBzeXN0ZW0gd2hpY2ggcmVnaXN0ZXJzIGNvbXBvbmVudHMgb24gYVxuICAgICAqIGNvbmRpdGlvbmFsIGJhc2lzLCB5b3UgY2FuIGRpc2FibGUgYXV0b21hdGljIHJlZ2lzdHJhdGlvbiBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAuXG4gICAgICogWW91ciBtb2R1bGUgb3IgYm9vdHN0cmFwIHN5c3RlbSB3aWxsIGhhdmUgdG8gdGFrZSBjYXJlIG9mIGRlZmluaW5nIHRoZSBjb21wb25lbnQgbGF0ZXIuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBkZWZpbmU6IGJvb2xlYW47XG4gICAgLy8gVE9ETzogdGVzdCBtZWRpYSBxdWVyaWVzXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBBbiBhcnJheSBvZiBDU1MgcnVsZXNldHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9TeW50YXgjQ1NTX3J1bGVzZXRzKS5cbiAgICAgKiBTdHlsZXMgZGVmaW5lZCB1c2luZyB0aGUgZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggc3R5bGVzIGRlZmluZWQgaW4gdGhlIGNvbXBvbmVudCdzXG4gICAgICogc3RhdGljIHtAbGluayBDb21wb25lbnQuc3R5bGVzfSBnZXR0ZXIuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzdHlsZXM6IFtcbiAgICAgKiAgICAgICAgICAnaDEsIGgyIHsgZm9udC1zaXplOiAxNnB0OyB9JyxcbiAgICAgKiAgICAgICAgICAnQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogOTAwcHgpIHsgYXJ0aWNsZSB7IHBhZGRpbmc6IDFyZW0gM3JlbTsgfSB9J1xuICAgICAqICAgICAgXVxuICAgICAqIH0pXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqL1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIC8vIFRPRE86IHVwZGF0ZSBkb2N1bWVudGF0aW9uXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHtAbGluayAjbGl0LWh0bWwuVGVtcGxhdGVSZXN1bHR9LiBUaGUgZnVuY3Rpb24ncyBgZWxlbWVudGBcbiAgICAgKiBwYXJhbWV0ZXIgd2lsbCBiZSB0aGUgY3VycmVudCBjb21wb25lbnQgaW5zdGFuY2UuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIGJ5IHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBUaGUgbWV0aG9kIG11c3QgcmV0dXJuIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB3aGljaCBpcyBjcmVhdGVkIHVzaW5nIGxpdC1odG1sJ3NcbiAgICAgKiB7QGxpbmsgbGl0LWh0bWwjaHRtbCB8IGBodG1sYH0gb3Ige0BsaW5rIGxpdC1odG1sI3N2ZyB8IGBzdmdgfSB0ZW1wbGF0ZSBtZXRob2RzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHVuZGVmaW5lZGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBjb21wb25lbnQgaW5zdGFuY2UgcmVxdWVzdGluZyB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZT86IChlbGVtZW50OiBUeXBlLCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OOiBDb21wb25lbnREZWNsYXJhdGlvbiA9IHtcbiAgICBzZWxlY3RvcjogJycsXG4gICAgc2hhZG93OiB0cnVlLFxuICAgIGRlZmluZTogdHJ1ZSxcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50RGVjbGFyYXRpb24sIERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OIH0gZnJvbSAnLi9jb21wb25lbnQtZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSB9IGZyb20gJy4vcHJvcGVydHkuanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IGNsYXNzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnQ8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8Q29tcG9uZW50RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0geyAuLi5ERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgcmV0dXJuICh0YXJnZXQ6IHR5cGVvZiBDb21wb25lbnQpID0+IHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldCBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yLnNlbGVjdG9yID0gZGVjbGFyYXRpb24uc2VsZWN0b3IgfHwgdGFyZ2V0LnNlbGVjdG9yO1xuICAgICAgICBjb25zdHJ1Y3Rvci5zaGFkb3cgPSBkZWNsYXJhdGlvbi5zaGFkb3c7XG4gICAgICAgIGNvbnN0cnVjdG9yLnRlbXBsYXRlID0gZGVjbGFyYXRpb24udGVtcGxhdGUgfHwgdGFyZ2V0LnRlbXBsYXRlO1xuXG4gICAgICAgIC8vIHVzZSBrZXlvZiBzaWduYXR1cmVzIHRvIGNhdGNoIHJlZmFjdG9yaW5nIGVycm9yc1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnb2JzZXJ2ZWRBdHRyaWJ1dGVzJztcbiAgICAgICAgY29uc3Qgc3R5bGVzS2V5OiBrZXlvZiB0eXBlb2YgQ29tcG9uZW50ID0gJ3N0eWxlcyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3BlcnR5IGRlY29yYXRvcnMgZ2V0IGNhbGxlZCBiZWZvcmUgY2xhc3MgZGVjb3JhdG9ycywgc28gYXQgdGhpcyBwb2ludCBhbGwgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICogaGF2ZSBzdG9yZWQgdGhlaXIgYXNzb2NpYXRlZCBhdHRyaWJ1dGVzIGluIHtAbGluayBDb21wb25lbnQuYXR0cmlidXRlc30uXG4gICAgICAgICAqIFdlIGNhbiBub3cgY29tYmluZSB0aGVtIHdpdGggdGhlIHVzZXItZGVmaW5lZCB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gYW5kLFxuICAgICAgICAgKiBieSB1c2luZyBhIFNldCwgZWxpbWluYXRlIGFsbCBkdXBsaWNhdGVzIGluIHRoZSBwcm9jZXNzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBBcyB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSB3aWxsIGFsc28gaW5jbHVkZSBkZWNvcmF0b3IgZ2VuZXJhdGVkXG4gICAgICAgICAqIG9ic2VydmVkIGF0dHJpYnV0ZXMsIHdlIGFsd2F5cyBpbmhlcml0IGFsbCBvYnNlcnZlZCBhdHRyaWJ1dGVzIGZyb20gYSBiYXNlIGNsYXNzLiBGb3IgdGhhdCByZWFzb25cbiAgICAgICAgICogd2UgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIGF0dHJpYnV0ZSBvdmVycmlkZXMgd2hlbiBleHRlbmRpbmcgYW55IHtAbGluayBDb21wb25lbnR9IGJhc2UgY2xhc3MuXG4gICAgICAgICAqIFRoaXMgaXMgZG9uZSBpbiB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IuIEhlcmUgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdG8gcmVtb3ZlIG92ZXJyaWRkZW5cbiAgICAgICAgICogYXR0cmlidXRlcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlcyA9IFtcbiAgICAgICAgICAgIC4uLm5ldyBTZXQoXG4gICAgICAgICAgICAgICAgLy8gd2UgdGFrZSB0aGUgaW5oZXJpdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4ucmVtb3ZlIG92ZXJyaWRkZW4gZ2VuZXJhdGVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgoYXR0cmlidXRlcywgYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4gJiYgY29uc3RydWN0b3Iub3ZlcnJpZGRlbi5oYXMoYXR0cmlidXRlKSA/IFtdIDogYXR0cmlidXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdIGFzIHN0cmluZ1tdXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4uYW5kIHJlY29tYmluZSB0aGUgbGlzdCB3aXRoIHRoZSBuZXdseSBnZW5lcmF0ZWQgYXR0cmlidXRlcyAodGhlIFNldCBwcmV2ZW50cyBkdXBsaWNhdGVzKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KFsuLi50YXJnZXQuYXR0cmlidXRlcy5rZXlzKCldKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIGRlbGV0ZSB0aGUgb3ZlcnJpZGRlbiBTZXQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIGRvbid0IHdhbnQgdG8gaW5oZXJpdCBzdHlsZXMgYXV0b21hdGljYWxseSwgdW5sZXNzIGV4cGxpY2l0bHkgcmVxdWVzdGVkLCBzbyB3ZSBjaGVjayBpZiB0aGVcbiAgICAgICAgICogY29uc3RydWN0b3IgZGVjbGFyZXMgYSBzdGF0aWMgc3R5bGVzIHByb3BlcnR5ICh3aGljaCBtYXkgdXNlIHN1cGVyLnN0eWxlcyB0byBleHBsaWNpdGx5IGluaGVyaXQpXG4gICAgICAgICAqIGFuZCBpZiBpdCBkb2Vzbid0LCB3ZSBpZ25vcmUgdGhlIHBhcmVudCBjbGFzcydzIHN0eWxlcyAoYnkgbm90IGludm9raW5nIHRoZSBnZXR0ZXIpLlxuICAgICAgICAgKiBXZSB0aGVuIG1lcmdlIHRoZSBkZWNvcmF0b3IgZGVmaW5lZCBzdHlsZXMgKGlmIGV4aXN0aW5nKSBpbnRvIHRoZSBzdHlsZXMgYW5kIHJlbW92ZSBkdXBsaWNhdGVzXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAoY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoc3R5bGVzS2V5KVxuICAgICAgICAgICAgICAgICAgICA/IGNvbnN0cnVjdG9yLnN0eWxlc1xuICAgICAgICAgICAgICAgICAgICA6IFtdXG4gICAgICAgICAgICAgICAgKS5jb25jYXQoZGVjbGFyYXRpb24uc3R5bGVzIHx8IFtdKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaW5hbGx5IHdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHVzZXIgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGdlbmVyYXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgb2JzZXJ2ZWRBdHRyaWJ1dGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBvdmVycmlkZSB0aGUge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlciB3aXRoIGEgbmV3IG9uZSwgd2hpY2ggcmV0dXJuc1xuICAgICAgICAgKiB0aGUgdW5pcXVlIHNldCBvZiBzdGF0aWNhbGx5IGRlZmluZWQgYW5kIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcy5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIHN0eWxlc0tleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5kZWZpbmUpIHtcblxuICAgICAgICAgICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZShjb25zdHJ1Y3Rvci5zZWxlY3RvciwgY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgTGlzdGVuZXJEZWNsYXJhdGlvbiB9IGZyb20gJy4vbGlzdGVuZXItZGVjbGFyYXRpb24uanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IG1ldGhvZCBhcyBhbiBldmVudCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IExpc3RlbmVyRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5ldmVudCA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBMaXN0ZW5lckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIGxpc3RlbmVyIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yIHN0b3JlcyBsaXN0ZW5lciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBsaXN0ZW5lcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgbGlzdGVuZXIgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBiYXNlIGNsYXNzJ3MgbWFwIHRvIHByb3Blcmx5IGluaGVyaXQgYWxsIGxpc3RlbmVyIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiB0eXBlb2YgQ29tcG9uZW50KSB7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KCdsaXN0ZW5lcnMnKSkgY29uc3RydWN0b3IubGlzdGVuZXJzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5saXN0ZW5lcnMpO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IHNlbGVjdG9yIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0b3JEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlbGVjdG9yIHRvIHF1ZXJ5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNldHRpbmcgcXVlcnkgdG8gYG51bGxgIGFsbG93cyB0byB1bmJpbmQgYW4gaW5oZXJpdGVkIHNlbGVjdG9yLlxuICAgICAqL1xuICAgIHF1ZXJ5OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJvb3QgZWxlbWVudC9kb2N1bWVudCBmcm9tIHdoaWNoIHRvIHF1ZXJ5XG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBUaGUgY29tcG9uZW50J3MgYHJlbmRlclJvb3RgXG4gICAgICovXG4gICAgcm9vdD86IERvY3VtZW50IHwgRG9jdW1lbnRGcmFnbWVudCB8IEVsZW1lbnQgfCAoKHRoaXM6IFR5cGUpID0+IERvY3VtZW50IHwgRG9jdW1lbnRGcmFnbWVudCB8IEVsZW1lbnQgfCB1bmRlZmluZWQpO1xuXG4gICAgLyoqXG4gICAgICogVXNlIHF1ZXJ5U2VsZWN0b3JBbGwgZm9yIHF1ZXJ5aW5nXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgZmFsc2VgXG4gICAgICovXG4gICAgYWxsPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VMRUNUT1JfREVDTEFSQVRJT046IFNlbGVjdG9yRGVjbGFyYXRpb24gPSB7XG4gICAgcXVlcnk6IG51bGwsXG4gICAgYWxsOiBmYWxzZSxcbn07XG4iLCIvKipcbiAqIEdldCB0aGUge0BsaW5rIFByb3BlcnR5RGVzY3JpcHRvcn0gb2YgYSBwcm9wZXJ0eSBmcm9tIGl0cyBwcm90b3R5cGVcbiAqIG9yIGEgcGFyZW50IHByb3RvdHlwZSAtIGV4Y2x1ZGluZyB7QGxpbmsgT2JqZWN0LnByb3RvdHlwZX0gaXRzZWxmLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgICAgICAgIFRoZSBwcm90b3R5cGUgdG8gZ2V0IHRoZSBkZXNjcmlwdG9yIGZyb21cbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGVzY3JpcHRvclxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BlcnR5RGVzY3JpcHRvciAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZCB7XG5cbiAgICBpZiAocHJvcGVydHlLZXkgaW4gdGFyZ2V0KSB7XG5cbiAgICAgICAgd2hpbGUgKHRhcmdldCAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KHByb3BlcnR5S2V5KSkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhcmdldCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsIi8qKlxuICogQSB0YXNrIG9iamVjdCBpbnRlcmZhY2UgYXMgcmV0dXJuZWQgYnkgdGhlIHNjaGVkdWxlciBtZXRob2RzXG4gKlxuICogQHJlbWFya3NcbiAqIEEgdGFzayBpcyBhbiBvYmplY3QgY29uc2lzdGluZyBvZiBhIHtAbGluayBQcm9taXNlfSB3aGljaCB3aWxsIGJlIHJlc29sdmVkXG4gKiB3aGVuIHRoZSB0YXNrIGNhbGxiYWNrIHdhcyBleGVjdXRlZCBhbmQgYSBjYW5jZWwgbWV0aG9kLCB3aGljaCB3aWxsIHByZXZlbnRcbiAqIHRoZSB0YXNrIGNhbGxiYWNrIGZyb20gYmVpbmcgZXhlY3V0ZWQgYW5kIHJlamVjdCB0aGUgdGFzaydzIFByb21pc2UuIEEgdGFza1xuICogd2hpY2ggaXMgYWxyZWFkeSByZXNvbHZlZCBjYW5ub3QgYmUgY2FuY2VsZWQgYW55bW9yZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXNrPFQgPSBhbnk+IHtcbiAgICBwcm9taXNlOiBQcm9taXNlPFQ+O1xuICAgIGNhbmNlbDogKCkgPT4gdm9pZDtcbn07XG5cbi8qKlxuICogQSBzcGVjaWFsIGVycm9yIGNsYXNzIHdoaWNoIGlzIHRocm93biB3aGVuIGEgdGFzayBpcyBjYW5jZWxlZFxuICpcbiAqIEByZW1hcmtzXG4gKiBUaGlzIGVycm9yIGNsYXNzIGlzIHVzZWQgdG8gcmVqZWN0IGEgdGFzaydzIFByb21pc2UsIHdoZW4gdGhlIHRhc2tcbiAqIGlzIGNhbmNlbGVkLiBZb3UgY2FuIGNoZWNrIGZvciB0aGlzIHNwZWNpZmljIGVycm9yLCB0byBoYW5kbGUgY2FuY2VsZWRcbiAqIHRhc2tzIGRpZmZlcmVudCBmcm9tIG90aGVyd2lzZSByZWplY3RlZCB0YXNrcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCB0YXNrID0gbWljcm9UYXNrKCgpID0+IHtcbiAqICAgICAgLy8gZG8gc3RoLi4uXG4gKiB9KTtcbiAqXG4gKiB0YXNrLmNhbmNlbCgpO1xuICpcbiAqIHRhc2sucHJvbWlzZS5jYXRjaChyZWFzb24gPT4ge1xuICogICAgICBpZiAocmVhc29uIGluc3RhbmNlb2YgVGFza0NhbmNlbGVkRXJyb3IpIHtcbiAqICAgICAgICAgIC8vIC4uLnRoaXMgdGFzayB3YXMgY2FuY2VsZWRcbiAqICAgICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFRhc2tDYW5jZWxlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgY29uc3RydWN0b3IgKG1lc3NhZ2U/OiBzdHJpbmcpIHtcblxuICAgICAgICBzdXBlcihtZXNzYWdlKTtcblxuICAgICAgICB0aGlzLm5hbWUgPSAnVGFza0NhbmNlbGVkRXJyb3InO1xuICAgIH1cbn1cblxuY29uc3QgVEFTS19DQU5DRUxFRF9FUlJPUiA9ICgpID0+IG5ldyBUYXNrQ2FuY2VsZWRFcnJvcignVGFzayBjYW5jZWxlZC4nKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgbWljcm8tdGFzayBhbmQgcmV0dXJucyBhIFByb21pc2Ugd2hpY2ggd2lsbFxuICogcmVzb2x2ZSB3aGVuIHRoZSB0YXNrIHdhcyBleGVjdXRlZC5cbiAqXG4gKiBAcmVtYXJrc1xuICogVXNlcyB7QGxpbmsgUHJvbWlzZS50aGVufSB0byBzY2hlZHVsZSB0aGUgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBtaWNyby10YXNrLlxuICogSWYgdGhlIHRhc2sgaXMgY2FuY2VsZWQgYmVmb3JlIHRoZSBuZXh0IG1pY3JvLXRhc2ssIHRoZSBQcm9taXNlIGV4ZWN1dG9yIHdvbid0XG4gKiBydW4gdGhlIHRhc2sgY2FsbGJhY2sgYnV0IHJlamVjdCB0aGUgUHJvbWlzZS5cbiAqXG4gKiBAcGFyYW0gdGFzayAgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGVcbiAqIEByZXR1cm5zICAgICBBIFByb21pc2Ugd2hpY2ggd2lsbCByZXNvbHZlIGFmdGVyIHRoZSBjYWxsYmFjayB3YXMgZXhlY3V0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pY3JvVGFzazxUID0gYW55PiAodGFzazogKCkgPT4gVCk6IFRhc2s8VD4ge1xuXG4gICAgbGV0IGNhbmNlbGVkID0gZmFsc2U7XG5cbiAgICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBhY3R1YWwgUHJvbWlzZSBpcyBjcmVhdGVkIGluIGBQcm9taXNlLnRoZW5gJ3MgZXhlY3V0b3IsIGluIG9yZGVyXG4gICAgICAgICAqIGZvciBpdCB0byBleGVjdXRlIHRoZSB0YXNrIGluIHRoZSBuZXh0IG1pY3JvLXRhc2suIFRoaXMgbWVhbnMgd2UgY2FuJ3RcbiAgICAgICAgICogZ2V0IGEgcmVmZXJlbmNlIG9mIHRoZSBQcm9taXNlJ3MgcmVqZWN0IG1ldGhvZCBpbiB0aGUgc2NvcGUgb2YgdGhpc1xuICAgICAgICAgKiBmdW5jdGlvbi4gQnV0IHdlIGNhbiB1c2UgYSBsb2NhbCB2YXJpYWJsZSBpbiB0aGlzIGZ1bmN0aW9uJ3Mgc2NvcGUgdG9cbiAgICAgICAgICogcHJldmVudCB7QGxpbmsgcnVuVGFza30gdG8gYmUgZXhlY3V0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHtcblxuICAgICAgICAgICAgICAgIHJlamVjdChUQVNLX0NBTkNFTEVEX0VSUk9SKCkpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcnVuVGFzayh0YXNrLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNhbmNlbCA9ICgpID0+IGNhbmNlbGVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB7IHByb21pc2UsIGNhbmNlbCB9O1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBtYWNyby10YXNrIGFuZCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsXG4gKiByZXNvbHZlIHdoZW4gdGhlIHRhc2sgd2FzIGV4ZWN1dGVkXG4gKlxuICogQHJlbWFya3NcbiAqIFVzZXMge0BsaW5rIHNldFRpbWVvdXR9IHRvIHNjaGVkdWxlIHRoZSB0YXNrIGNhbGxiYWNrIGluIHRoZSBuZXh0IG1hY3JvLXRhc2suXG4gKiBJZiB0aGUgdGFzayBpcyBjYW5jZWxlZCBiZWZvcmUgdGhlIG5leHQgbWFjcm8tdGFzaywgdGhlIHRpbWVvdXQgaXMgY2xlYXJlZCBhbmRcbiAqIHRoZSBQcm9tc2llIGlzIHJlamVjdGVkLlxuICpcbiAqIEBwYXJhbSB0YXNrICBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZVxuICogQHJldHVybnMgICAgIEEgUHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgYWZ0ZXIgdGhlIGNhbGxiYWNrIHdhcyBleGVjdXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFjcm9UYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBUKTogVGFzazxUPiB7XG5cbiAgICBsZXQgY2FuY2VsITogKCkgPT4gdm9pZDtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgbGV0IHRpbWVvdXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHNldFRpbWVvdXQoKCkgPT4gcnVuVGFzayh0YXNrLCByZXNvbHZlLCByZWplY3QpLCAwKTtcblxuICAgICAgICBjYW5jZWwgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFRBU0tfQ0FOQ0VMRURfRVJST1IoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4geyBwcm9taXNlLCBjYW5jZWwgfTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lIGFuZCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsXG4gKiByZXNvbHZlIHdoZW4gdGhlIHRhc2sgd2FzIGV4ZWN1dGVkXG4gKlxuICogQHJlbWFya3NcbiAqIFVzZXMge0BsaW5rIHJlcXVlc3RBbmltYXRpb25GcmFtZX0gdG8gc2NoZWR1bGUgdGhlIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lLlxuICogSWYgdGhlIHRhc2sgaXMgY2FuY2VsZWQgYmVmb3JlIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZSwgdGhlIGFuaW1hdGlvbiBmcmFtZSBpcyBjYW5jZWxlZCBhbmRcbiAqIHRoZSBQcm9tc2llIGlzIHJlamVjdGVkLlxuICpcbiAqIEBwYXJhbSB0YXNrICBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZVxuICogQHJldHVybnMgICAgIEEgUHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgYWZ0ZXIgdGhlIGNhbGxiYWNrIHdhcyBleGVjdXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0aW9uRnJhbWVUYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBUKTogVGFzazxUPiB7XG5cbiAgICBsZXQgY2FuY2VsITogKCkgPT4gdm9pZDtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgbGV0IGFuaW1hdGlvbkZyYW1lOiBudW1iZXIgfCB1bmRlZmluZWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gcnVuVGFzayh0YXNrLCByZXNvbHZlLCByZWplY3QpKTtcblxuICAgICAgICBjYW5jZWwgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICByZWplY3QoVEFTS19DQU5DRUxFRF9FUlJPUigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7IHByb21pc2UsIGNhbmNlbCB9O1xufVxuXG4vKipcbiAqIFJ1bnMgYSB0YXNrIGNhbGxiYWNrIHNhZmVseSBhZ2FpbnN0IGEgUHJvbWlzZSdzIHJlamVjdCBhbmQgcmVzb2x2ZSBjYWxsYmFja3MuXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBydW5UYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBULCByZXNvbHZlOiAodmFsdWU6IFQpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbjogYW55KSA9PiB2b2lkKSB7XG5cbiAgICB0cnkge1xuXG4gICAgICAgIHJlc29sdmUodGFzaygpKTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgU2VsZWN0b3JEZWNsYXJhdGlvbiwgREVGQVVMVF9TRUxFQ1RPUl9ERUNMQVJBVElPTiB9IGZyb20gJy4vc2VsZWN0b3ItZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yIH0gZnJvbSAnLi91dGlscy9nZXQtcHJvcGVydHktZGVzY3JpcHRvci5qcyc7XG5pbXBvcnQgeyBtaWNyb1Rhc2sgfSBmcm9tICcuLi90YXNrcy5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHkgYXMgYSBzZWxlY3RvclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBzZWxlY3RvciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFNlbGVjdG9yRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBwcm9wZXJ0eURlc2NyaXB0b3IgfHwgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICBjb25zdCBoaWRkZW5LZXkgPSBTeW1ib2woYF9fJHsgcHJvcGVydHlLZXkudG9TdHJpbmcoKSB9YCk7XG5cbiAgICAgICAgY29uc3QgZ2V0dGVyID0gZGVzY3JpcHRvcj8uZ2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnkpIHsgcmV0dXJuIHRoaXNbaGlkZGVuS2V5XTsgfTtcbiAgICAgICAgY29uc3Qgc2V0dGVyID0gZGVzY3JpcHRvcj8uc2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnksIHZhbHVlOiBhbnkpIHsgdGhpc1toaWRkZW5LZXldID0gdmFsdWU7IH07XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlZERlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvciA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKHRoaXM6IFR5cGUpOiBhbnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQgKHRoaXM6IFR5cGUsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0b3JzIGFyZSBxdWVyaWVkIGR1cmluZyB0aGUgdXBkYXRlIGN5Y2xlLCB0aGlzIG1lYW5zLCB3aGVuIHRoZXkgY2hhbmdlXG4gICAgICAgICAgICAgICAgLy8gd2UgY2Fubm90IHRyaWdnZXIgYW5vdGhlciB1cGRhdGUgZnJvbSB3aXRoaW4gdGhlIGN1cnJlbnQgdXBkYXRlIGN5Y2xlXG4gICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byBzY2hlZHVsZSBhbiB1cGRhdGUganVzdCBhZnRlciB0aGlzIHVwZGF0ZSBpcyBvdmVyXG4gICAgICAgICAgICAgICAgLy8gYWxzbywgc2VsZWN0b3JzIGFyZSBub3QgcHJvcGVydGllcywgc28gdGhleSBkb24ndCBhcHBlYXIgaW4gdGhlIHByb3BlcnR5IG1hcHNcbiAgICAgICAgICAgICAgICAvLyB0aGF0J3Mgd2h5IHdlIGludm9rZSByZXF1ZXN0VXBkYXRlIHdpdGhvdXQgYW55IHBhcmFtZXRlcnNcbiAgICAgICAgICAgICAgICBtaWNyb1Rhc2soKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBvcHRpb25zID0geyAuLi5ERUZBVUxUX1NFTEVDVE9SX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5xdWVyeSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5zZWxlY3RvcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5zZWxlY3RvcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBTZWxlY3RvckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgICAgIC8vIGlmIG5vIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGEgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciB3aGljaCBtdXN0IHJldHVybiB2b2lkIGFuZCB3ZSBjYW4gZGVmaW5lIHRoZSB3cmFwcGVkIGRlc2NyaXB0b3IgaGVyZVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIHdyYXBwZWREZXNjcmlwdG9yKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBpZiBhIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGFuIGFjY2Vzc29yXG4gICAgICAgICAgICAvLyBkZWNvcmF0b3IgYW5kIHdlIG11c3QgcmV0dXJuIHRoZSB3cmFwcGVkIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVkRGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIHNlbGVjdG9yIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgc2VsZWN0b3IgZGVjb3JhdG9yIHN0b3JlcyBzZWxlY3RvciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBzZWxlY3RvcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgc2VsZWN0b3IgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgc2VsZWN0b3IgbWFwIHdpdGggdGhlIHZhbHVlcyBvZlxuICogdGhlIGJhc2UgY2xhc3MncyBtYXAgdG8gcHJvcGVybHkgaW5oZXJpdCBhbGwgc2VsZWN0b3IgZGVjbGFyYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IHR5cGVvZiBDb21wb25lbnQpIHtcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ3NlbGVjdG9ycycpKSBjb25zdHJ1Y3Rvci5zZWxlY3RvcnMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLnNlbGVjdG9ycyk7XG59XG4iLCJjb25zdCBGSVJTVCA9IC9eW15dLztcbmNvbnN0IFNQQUNFUyA9IC9cXHMrKFtcXFNdKS9nO1xuY29uc3QgQ0FNRUxTID0gL1thLXpdKFtBLVpdKS9nO1xuY29uc3QgS0VCQUJTID0gLy0oW2Etel0pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnJlcGxhY2UoRklSU1QsIHN0cmluZ1swXS50b1VwcGVyQ2FzZSgpKSA6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9Mb3dlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW1lbENhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBLRUJBQlMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBLRUJBQlMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmNhcGl0YWxpemUoc3RyaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlYmFiQ2FzZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IG1hdGNoZXM7XG5cbiAgICBpZiAoc3RyaW5nKSB7XG5cbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnRyaW0oKTtcblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBTUEFDRVMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCAnLScgKyBtYXRjaGVzWzFdKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBDQU1FTFMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzBdWzBdICsgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIENBTUVMUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy50b0xvd2VyQ2FzZSgpIDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlciwgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCB9IGZyb20gJy4vYXR0cmlidXRlLWNvbnZlcnRlci5qcyc7XG5pbXBvcnQgeyBrZWJhYkNhc2UgfSBmcm9tICcuL3V0aWxzL3N0cmluZy11dGlscy5qcyc7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgZGlzcGF0Y2ggYSBjdXN0b20gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Tm90aWZpZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJldHVybiBgdHJ1ZWAgaWYgdGhlIGBvbGRWYWx1ZWAgYW5kIHRoZSBgbmV3VmFsdWVgIG9mIGEgcHJvcGVydHkgYXJlIGRpZmZlcmVudCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gcmVmbGVjdG9yIEEgcmVmbGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0cmlidXRlUmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBBdHRyaWJ1dGVSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5UmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBQcm9wZXJ0eVJlZmxlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIHJlZmxlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eU5vdGlmaWVyfVxuICpcbiAqIEBwYXJhbSBub3RpZmllciBBIG5vdGlmaWVyIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlOb3RpZmllciAobm90aWZpZXI6IGFueSk6IG5vdGlmaWVyIGlzIFByb3BlcnR5Tm90aWZpZXIge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBub3RpZmllciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICpcbiAqIEBwYXJhbSBkZXRlY3RvciBBIGRldGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciAoZGV0ZWN0b3I6IGFueSk6IGRldGVjdG9yIGlzIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiBkZXRlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUtleX1cbiAqXG4gKiBAcGFyYW0ga2V5IEEgcHJvcGVydHkga2V5IHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlLZXkgKGtleTogYW55KToga2V5IGlzIFByb3BlcnR5S2V5IHtcblxuICAgIHJldHVybiB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJyB8fCB0eXBlb2Yga2V5ID09PSAnc3ltYm9sJztcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgc3RyaW5nIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGUgcmVtb3ZpbmcgaW52YWxpZCBhdHRyaWJ1dGUgY2hhcmFjdGVyc1xuICpcbiAqIEBwYXJhbSB2YWx1ZSBBIHN0cmluZyB0byBlbmNvZGUgZm9yIHVzZSBhcyBodG1sIGF0dHJpYnV0ZVxuICogQHJldHVybnMgICAgIEFuIGVuY29kZWQgc3RyaW5nIHVzYWJsZSBhcyBodG1sIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQXR0cmlidXRlICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBrZWJhYkNhc2UodmFsdWUucmVwbGFjZSgvXFxXKy9nLCAnLScpLnJlcGxhY2UoL1xcLSQvLCAnJykpO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBhdHRyaWJ1dGUgbmFtZSBmcm9tIGEgcHJvcGVydHkga2V5XG4gKlxuICogQHJlbWFya3NcbiAqIE51bWVyaWMgcHJvcGVydHkgaW5kZXhlcyBvciBzeW1ib2xzIGNhbiBjb250YWluIGludmFsaWQgY2hhcmFjdGVycyBmb3IgYXR0cmlidXRlIG5hbWVzLiBUaGlzIG1ldGhvZFxuICogc2FuaXRpemVzIHRob3NlIGNoYXJhY3RlcnMgYW5kIHJlcGxhY2VzIHNlcXVlbmNlcyBvZiBpbnZhbGlkIGNoYXJhY3RlcnMgd2l0aCBhIGRhc2guXG4gKiBBdHRyaWJ1dGUgbmFtZXMgYXJlIG5vdCBhbGxvd2VkIHRvIHN0YXJ0IHdpdGggbnVtYmVycyBlaXRoZXIgYW5kIGFyZSBwcmVmaXhlZCB3aXRoICdhdHRyLScuXG4gKlxuICogTi5CLjogV2hlbiB1c2luZyBjdXN0b20gc3ltYm9scyBhcyBwcm9wZXJ0eSBrZXlzLCB1c2UgdW5pcXVlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIHN5bWJvbHMgdG8gYXZvaWRcbiAqIGNsYXNoaW5nIGF0dHJpYnV0ZSBuYW1lcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBhID0gU3ltYm9sKCk7XG4gKiBjb25zdCBiID0gU3ltYm9sKCk7XG4gKlxuICogYSAhPT0gYjsgLy8gdHJ1ZVxuICpcbiAqIGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYSkgIT09IGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYik7IC8vIGZhbHNlIC0tPiAnYXR0ci1zeW1ib2wnID09PSAnYXR0ci1zeW1ib2wnXG4gKlxuICogY29uc3QgYyA9IFN5bWJvbCgnYycpO1xuICogY29uc3QgZCA9IFN5bWJvbCgnZCcpO1xuICpcbiAqIGMgIT09IGQ7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGMpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGQpOyAvLyB0cnVlIC0tPiAnYXR0ci1zeW1ib2wtYycgPT09ICdhdHRyLXN5bWJvbC1kJ1xuICogYGBgXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlTmFtZSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogc3RyaW5nIHtcblxuICAgIGlmICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgcmV0dXJuIGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBhdHRyaWJ1dGUgbmFtZXMsIGlmIHN5bWJvbHMgZG9uJ3QgaGF2ZSB1bmlxdWUgZGVzY3JpcHRpb25cbiAgICAgICAgcmV0dXJuIGBhdHRyLSR7IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKSB9YDtcbiAgICB9XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGV2ZW50IG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBFdmVudCBuYW1lcyBkb24ndCBoYXZlIHRoZSBzYW1lIHJlc3RyaWN0aW9ucyBhcyBhdHRyaWJ1dGUgbmFtZXMgd2hlbiBpdCBjb21lcyB0byBpbnZhbGlkXG4gKiBjaGFyYWN0ZXJzLiBIb3dldmVyLCBmb3IgY29uc2lzdGVuY3kncyBzYWtlLCB3ZSBhcHBseSB0aGUgc2FtZSBydWxlcyBmb3IgZXZlbnQgbmFtZXMgYXNcbiAqIGZvciBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHByZWZpeCAgICAgICAgQW4gb3B0aW9uYWwgcHJlZml4LCBlLmcuOiAnb24nXG4gKiBAcGFyYW0gc3VmZml4ICAgICAgICBBbiBvcHRpb25hbCBzdWZmaXgsIGUuZy46ICdjaGFuZ2VkJ1xuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBldmVudCBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudE5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgcHJlZml4Pzogc3RyaW5nLCBzdWZmaXg/OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IHByb3BlcnR5U3RyaW5nID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0ga2ViYWJDYXNlKHByb3BlcnR5S2V5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBjcmVhdGUgbXVsdGlwbGUgaWRlbnRpY2FsIGV2ZW50IG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0gZW5jb2RlQXR0cmlidXRlKFN0cmluZyhwcm9wZXJ0eUtleSkpO1xuICAgIH1cblxuICAgIHJldHVybiBgJHsgcHJlZml4ID8gYCR7IGtlYmFiQ2FzZShwcmVmaXgpIH0tYCA6ICcnIH0keyBwcm9wZXJ0eVN0cmluZyB9JHsgc3VmZml4ID8gYC0keyBrZWJhYkNhc2Uoc3VmZml4KSB9YCA6ICcnIH1gO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBEb2VzIHByb3BlcnR5IGhhdmUgYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IE5vIGF0dHJpYnV0ZSB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHByb3BlcnR5XG4gICAgICogKiBgdHJ1ZWA6IFRoZSBhdHRyaWJ1dGUgbmFtZSB3aWxsIGJlIGluZmVycmVkIGJ5IGNhbWVsLWNhc2luZyB0aGUgcHJvcGVydHkgbmFtZVxuICAgICAqICogYHN0cmluZ2A6IFVzZSB0aGUgcHJvdmlkZWQgc3RyaW5nIGFzIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBuYW1lXG4gICAgICpcbiAgICAgKiAvLyBUT0RPOiBjb25zaWRlciBzZXR0aW5nIHRoaXMgdG8gZmFsc2VcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGU6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b21pemUgdGhlIGNvbnZlcnNpb24gb2YgdmFsdWVzIGJldHdlZW4gcHJvcGVydHkgYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENvbnZlcnRlcnMgYXJlIG9ubHkgdXNlZCB3aGVuIHtAbGluayByZWZsZWN0UHJvcGVydHl9IGFuZC9vciB7QGxpbmsgcmVmbGVjdEF0dHJpYnV0ZX0gYXJlIHNldCB0byB0cnVlLlxuICAgICAqIElmIGN1c3RvbSByZWZsZWN0b3JzIGFyZSB1c2VkLCB0aGV5IGhhdmUgdG8gdGFrZSBjYXJlIG9yIGNvbnZlcnRpbmcgdGhlIHByb3BlcnR5L2F0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiB7QGxpbmsgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdH1cbiAgICAgKi9cbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUncyB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBhdHRyaWJ1dGUgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBhdHRyaWJ1dGUgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIHByb3BlcnR5IHVzaW5nIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjb21wb25lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBhdHRyaWJ1dGUgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0QXR0cmlidXRlOiBib29sZWFuIHwga2V5b2YgVHlwZSB8IEF0dHJpYnV0ZVJlZmxlY3RvcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgcHJvcGVydHkgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgcHJvcGVydHkgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBwcm9wZXJ0eSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgYXV0b21hdGljYWxseSB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgdXNpbmcgdGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgcHJvcGVydHkgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0UHJvcGVydHk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgYSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2UgcmFpc2UgYSBjdXN0b20gZXZlbnQ/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IGNyZWF0ZSBhIGN1c3RvbSBldmVudCBmb3IgdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBDcmVhdGUgY3VzdG9tIGV2ZW50cyBmb3IgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBVc2UgdGhlIG1ldGhvZCB3aXRoIHRoaXMgcHJvcGVydHkga2V5IG9uIHRoZSBjb21wb25lbnQgdG8gY3JlYXRlIGN1c3RvbSBldmVudHNcbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzIChgdGhpc2AgY29udGV4dCB3aWxsIGJlIHRoZSBjb21wb25lbnQgaW5zdGFuY2UpXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBub3RpZnk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlOb3RpZmllcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSBob3cgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5IHNob3VsZCBiZSBtb25pdG9yZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQnkgZGVmYXVsdCBhIGRlY29yYXRlZCBwcm9wZXJ0eSB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzICh0aHJvdWdoIGEgY3VzdG9tIHNldHRlciBmb3IgdGhlIHByb3BlcnR5KS5cbiAgICAgKiBBbnkgYHNldGAtb3BlcmF0aW9uIG9mIHRoaXMgcHJvcGVydHkgd2lsbCB0aGVyZWZvcmUgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhbmQgaW5pdGlhdGVcbiAgICAgKiBhIHJlbmRlciBhcyB3ZWxsIGFzIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IG9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5ICh0aGlzIHdpbGwgYnlwYXNzIHJlbmRlciwgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uKVxuICAgICAqICogYHRydWVgOiBPYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSB1c2luZyB0aGUge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfVxuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSBwcm92aWRlZCBtZXRob2QgdG8gY2hlY2sgaWYgcHJvcGVydHkgdmFsdWUgaGFzIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYCAodXNlcyB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9IGludGVybmFsbHkpXG4gICAgICovXG4gICAgb2JzZXJ2ZTogYm9vbGVhbiB8IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3I7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gKlxuICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGNoYW5nZWRcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SOiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICAvLyBpbiBjYXNlIGBvbGRWYWx1ZWAgYW5kIGBuZXdWYWx1ZWAgYXJlIGBOYU5gLCBgKE5hTiAhPT0gTmFOKWAgcmV0dXJucyBgdHJ1ZWAsXG4gICAgLy8gYnV0IGAoTmFOID09PSBOYU4gfHwgTmFOID09PSBOYU4pYCByZXR1cm5zIGBmYWxzZWBcbiAgICByZXR1cm4gb2xkVmFsdWUgIT09IG5ld1ZhbHVlICYmIChvbGRWYWx1ZSA9PT0gb2xkVmFsdWUgfHwgbmV3VmFsdWUgPT09IG5ld1ZhbHVlKTtcbn07XG5cbi8vIFRPRE86IG1heWJlIHByb3ZpZGUgZmxhdCBhcnJheS9vYmplY3QgY2hhbmdlIGRldGVjdG9yPyBkYXRlIGNoYW5nZSBkZXRlY3Rvcj9cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT046IFByb3BlcnR5RGVjbGFyYXRpb24gPSB7XG4gICAgLy8gVE9ETzogY29uc2lkZXIgc2V0dGluZyBmYWxzZSBhcyBkZWZhdWx0IHZhbHVlXG4gICAgYXR0cmlidXRlOiB0cnVlLFxuICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCxcbiAgICByZWZsZWN0QXR0cmlidXRlOiB0cnVlLFxuICAgIHJlZmxlY3RQcm9wZXJ0eTogdHJ1ZSxcbiAgICBub3RpZnk6IHRydWUsXG4gICAgb2JzZXJ2ZTogREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1IsXG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IGNyZWF0ZUF0dHJpYnV0ZU5hbWUsIERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIFByb3BlcnR5RGVjbGFyYXRpb24gfSBmcm9tICcuL3Byb3BlcnR5LWRlY2xhcmF0aW9uLmpzJztcbmltcG9ydCB7IGdldFByb3BlcnR5RGVzY3JpcHRvciB9IGZyb20gJy4vdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IuanMnO1xuXG4vKipcbiAqIEEgdHlwZSBleHRlbnNpb24gdG8gYWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byBhIHtAbGluayBDb21wb25lbnR9IGNvbnN0cnVjdG9yIGR1cmluZyBkZWNvcmF0aW9uXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gdHlwZW9mIENvbXBvbmVudCAmIHsgb3ZlcnJpZGRlbj86IFNldDxzdHJpbmc+IH07XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHlcbiAqXG4gKiBAcmVtYXJrc1xuICogTWFueSBvZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9wdGlvbnMgc3VwcG9ydCBjdXN0b20gZnVuY3Rpb25zLCB3aGljaCB3aWxsIGJlIGludm9rZWRcbiAqIHdpdGggdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhcyBgdGhpc2AtY29udGV4dCBkdXJpbmcgZXhlY3V0aW9uLiBJbiBvcmRlciB0byBzdXBwb3J0IGNvcnJlY3RcbiAqIHR5cGluZyBpbiB0aGVzZSBmdW5jdGlvbnMsIHRoZSBgQHByb3BlcnR5YCBkZWNvcmF0b3Igc3VwcG9ydHMgZ2VuZXJpYyB0eXBlcy4gSGVyZSBpcyBhbiBleGFtcGxlXG4gKiBvZiBob3cgeW91IGNhbiB1c2UgdGhpcyB3aXRoIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn06XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIG15SGlkZGVuUHJvcGVydHkgPSB0cnVlO1xuICpcbiAqICAgICAgLy8gdXNlIGEgZ2VuZXJpYyB0byBzdXBwb3J0IHByb3BlciBpbnN0YW5jZSB0eXBpbmcgaW4gdGhlIHByb3BlcnR5IHJlZmxlY3RvclxuICogICAgICBAcHJvcGVydHk8TXlFbGVtZW50Pih7XG4gKiAgICAgICAgICByZWZsZWN0UHJvcGVydHk6IChwcm9wZXJ0eUtleTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gKiAgICAgICAgICAgICAgLy8gdGhlIGdlbmVyaWMgdHlwZSBhbGxvd3MgZm9yIGNvcnJlY3QgdHlwaW5nIG9mIHRoaXNcbiAqICAgICAgICAgICAgICBpZiAodGhpcy5teUhpZGRlblByb3BlcnR5ICYmIG5ld1ZhbHVlKSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdteS1wcm9wZXJ0eScsICcnKTtcbiAqICAgICAgICAgICAgICB9IGVsc2Uge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbXktcHJvcGVydHknKTtcbiAqICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSBmYWxzZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEgcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGRlZmluaW5nIGNsYXNzZXMgaW4gVHlwZVNjcmlwdCwgY2xhc3MgZmllbGRzIGFjdHVhbGx5IGRvbid0IGV4aXN0IG9uIHRoZSBjbGFzcydzIHByb3RvdHlwZSwgYnV0XG4gICAgICAgICAqIHJhdGhlciwgdGhleSBhcmUgaW5zdGFudGlhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgZXhpc3Qgb25seSBvbiB0aGUgaW5zdGFuY2UuIEFjY2Vzc29yIHByb3BlcnRpZXNcbiAgICAgICAgICogYXJlIGFuIGV4Y2VwdGlvbiBob3dldmVyIGFuZCBleGlzdCBvbiB0aGUgcHJvdG90eXBlLiBGdXJ0aGVybW9yZSwgYWNjZXNzb3JzIGFyZSBpbmhlcml0ZWQgYW5kIHdpbGxcbiAgICAgICAgICogYmUgaW52b2tlZCB3aGVuIHNldHRpbmcgKG9yIGdldHRpbmcpIGEgcHJvcGVydHkgb24gYW4gaW5zdGFuY2Ugb2YgYSBjaGlsZCBjbGFzcywgZXZlbiBpZiB0aGF0IGNsYXNzXG4gICAgICAgICAqIGRlZmluZXMgdGhlIHByb3BlcnR5IGZpZWxkIG9uIGl0cyBvd24uIE9ubHkgaWYgdGhlIGNoaWxkIGNsYXNzIGRlZmluZXMgbmV3IGFjY2Vzc29ycyB3aWxsIHRoZSBwYXJlbnRcbiAgICAgICAgICogY2xhc3MncyBhY2Nlc3NvcnMgbm90IGJlIGluaGVyaXRlZC5cbiAgICAgICAgICogVG8ga2VlcCB0aGlzIGJlaGF2aW9yIGludGFjdCwgd2UgbmVlZCB0byBlbnN1cmUsIHRoYXQgd2hlbiB3ZSBjcmVhdGUgYWNjZXNzb3JzIGZvciBwcm9wZXJ0aWVzLCB3aGljaFxuICAgICAgICAgKiBhcmUgbm90IGRlY2xhcmVkIGFzIGFjY2Vzc29ycywgd2UgaW52b2tlIHRoZSBwYXJlbnQgY2xhc3MncyBhY2Nlc3NvciBhcyBleHBlY3RlZC5cbiAgICAgICAgICogVGhlIHtAbGluayBnZXRQcm9wZXJ0eURlc2NyaXB0b3J9IGZ1bmN0aW9uIGFsbG93cyB1cyB0byBsb29rIGZvciBhY2Nlc3NvcnMgb24gdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICAgICAgICAgKiB0aGUgY2xhc3Mgd2UgYXJlIGRlY29yYXRpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gcHJvcGVydHlEZXNjcmlwdG9yIHx8IGdldFByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgY29uc3QgaGlkZGVuS2V5ID0gU3ltYm9sKGBfXyR7IHByb3BlcnR5S2V5LnRvU3RyaW5nKCkgfWApO1xuXG4gICAgICAgIC8vIGlmIHdlIGZvdW5kIGFuIGFjY2Vzc29yIGRlc2NyaXB0b3IgKGZyb20gZWl0aGVyIHRoaXMgY2xhc3Mgb3IgYSBwYXJlbnQpIHdlIHVzZSBpdCwgb3RoZXJ3aXNlIHdlIGNyZWF0ZVxuICAgICAgICAvLyBkZWZhdWx0IGFjY2Vzc29ycyB0byBzdG9yZSB0aGUgYWN0dWFsIHByb3BlcnR5IHZhbHVlIGluIGEgaGlkZGVuIGZpZWxkIGFuZCByZXRyaWV2ZSBpdCBmcm9tIHRoZXJlXG4gICAgICAgIGNvbnN0IGdldHRlciA9IGRlc2NyaXB0b3I/LmdldCB8fCBmdW5jdGlvbiAodGhpczogYW55KSB7IHJldHVybiB0aGlzW2hpZGRlbktleV07IH07XG4gICAgICAgIGNvbnN0IHNldHRlciA9IGRlc2NyaXB0b3I/LnNldCB8fCBmdW5jdGlvbiAodGhpczogYW55LCB2YWx1ZTogYW55KSB7IHRoaXNbaGlkZGVuS2V5XSA9IHZhbHVlOyB9O1xuXG4gICAgICAgIC8vIHdlIGRlZmluZSBhIG5ldyBhY2Nlc3NvciBkZXNjcmlwdG9yIHdoaWNoIHdpbGwgd3JhcCB0aGUgcHJldmlvdXNseSByZXRyaWV2ZWQgb3IgY3JlYXRlZCBhY2Nlc3NvcnNcbiAgICAgICAgLy8gYW5kIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgd2hlbmV2ZXIgdGhlIHByb3BlcnR5IGlzIHNldFxuICAgICAgICBjb25zdCB3cmFwcGVkRGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yICYgVGhpc1R5cGU8YW55PiA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IGFueSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHBhc3MgYHZhbHVlYCBvbiBhcyBgbmV3VmFsdWVgIC0gYW4gaW5oZXJpdGVkIHNldHRlciBtaWdodCBtb2RpZnkgaXRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIGdldCB0aGUgbmV3IHZhbHVlIGJ5IGludm9raW5nIHRoZSBnZXR0ZXJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUocHJvcGVydHlLZXksIG9sZFZhbHVlLCBnZXR0ZXIuY2FsbCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uOiBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+ID0geyAuLi5ERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdGhlIGRlZmF1bHQgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPSBjcmVhdGVBdHRyaWJ1dGVOYW1lKHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLm9ic2VydmUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24ub2JzZXJ2ZSA9IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04ub2JzZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgaW5oZXJpdGVkIGFuIG9ic2VydmVkIGF0dHJpYnV0ZSBmb3IgdGhlIHByb3BlcnR5IGZyb20gdGhlIGJhc2UgY2xhc3NcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gY29uc3RydWN0b3IucHJvcGVydGllcy5oYXMocHJvcGVydHlLZXkpID8gY29uc3RydWN0b3IucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpIS5hdHRyaWJ1dGUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSBpdCdzIGEgc3RyaW5nIGFuZCBpdCB3aWxsIGV4aXN0IGluIHRoZSBhdHRyaWJ1dGVzIG1hcFxuICAgICAgICBpZiAoYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgaW5oZXJpdGVkIGF0dHJpYnV0ZSBhcyBpdCdzIG92ZXJyaWRkZW5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZGVsZXRlKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgLy8gbWFyayBhdHRyaWJ1dGUgYXMgb3ZlcnJpZGRlbiBmb3Ige0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuIS5hZGQoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuc2V0KGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uICphZnRlciogcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlcywgc28gd2UgY2FuIHN0aWxsIGFjY2VzcyB0aGVcbiAgICAgICAgLy8gaW5oZXJpdGVkIHByb3BlcnR5IGRlY2xhcmF0aW9uIHdoZW4gcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlc1xuICAgICAgICBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgZGVjbGFyYXRpb24gYXMgUHJvcGVydHlEZWNsYXJhdGlvbik7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgLy8gaWYgbm8gcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYSBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIHdoaWNoIG11c3QgcmV0dXJuIHZvaWQgYW5kIHdlIGNhbiBkZWZpbmUgdGhlIHdyYXBwZWQgZGVzY3JpcHRvciBoZXJlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgd3JhcHBlZERlc2NyaXB0b3IpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGlmIGEgcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYW4gYWNjZXNzb3JcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciBhbmQgd2UgbXVzdCByZXR1cm4gdGhlIHdyYXBwZWQgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWREZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIHByb3BlcnR5IGRlY29yYXRvciBzdG9yZXMgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgaW4gdGhlIGNvbnN0cnVjdG9yLFxuICogd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhvc2Ugc3RhdGljIGZpZWxkcyBhcmUgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZVxuICogYWRkIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkcy4gV2UgYWxzbyBtYWtlXG4gKiBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGNvbnN0cnVjdG9ycyBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYmFzZSBjbGFzcydzIG1hcHMgdG8gcHJvcGVybHlcbiAqIGluaGVyaXQgYWxsIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlcy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IERlY29yYXRlZENvbXBvbmVudFR5cGUpIHtcblxuICAgIC8vIHRoaXMgd2lsbCBnaXZlIHVzIGEgY29tcGlsZS10aW1lIGVycm9yIGlmIHdlIHJlZmFjdG9yIG9uZSBvZiB0aGUgc3RhdGljIGNvbnN0cnVjdG9yIHByb3BlcnRpZXNcbiAgICAvLyBhbmQgd2Ugd29uJ3QgbWlzcyByZW5hbWluZyB0aGUgcHJvcGVydHkga2V5c1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAncHJvcGVydGllcyc7XG4gICAgY29uc3QgYXR0cmlidXRlczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdhdHRyaWJ1dGVzJztcbiAgICBjb25zdCBvdmVycmlkZGVuOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ292ZXJyaWRkZW4nO1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0aWVzKSkgY29uc3RydWN0b3IucHJvcGVydGllcyA9IG5ldyBNYXAoY29uc3RydWN0b3IucHJvcGVydGllcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVzKSkgY29uc3RydWN0b3IuYXR0cmlidXRlcyA9IG5ldyBNYXAoY29uc3RydWN0b3IuYXR0cmlidXRlcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShvdmVycmlkZGVuKSkgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiA9IG5ldyBTZXQoKTtcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IGNyZWF0ZUV2ZW50TmFtZSB9IGZyb20gJy4vZGVjb3JhdG9ycy9pbmRleC5qcyc7XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgRXZlbnRJbml0IG9iamVjdFxuICpcbiAqIEByZW1hcmtzXG4gKiBXZSB1c3VhbGx5IHdhbnQgb3VyIEN1c3RvbUV2ZW50cyB0byBidWJibGUsIGNyb3NzIHNoYWRvdyBET00gYm91bmRhcmllcyBhbmQgYmUgY2FuY2VsYWJsZSxcbiAqIHNvIHdlIHNldCB1cCBhIGRlZmF1bHQgb2JqZWN0IHdpdGggdGhpcyBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9FVkVOVF9JTklUOiBFdmVudEluaXQgPSB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGNvbXBvc2VkOiB0cnVlLFxufTtcblxuLyoqXG4gKiBUaGUge0BsaW5rIENvbXBvbmVudEV2ZW50fSBkZXRhaWxcbiAqXG4gKiBAcmVtYXJrc1xuICogQ3VzdG9tRXZlbnRzIHRoYXQgY3Jvc3Mgc2hhZG93IERPTSBib3VuZGFyaWVzIGdldCByZS10YXJnZXRlZC4gVGhpcyBtZWFucywgdGhlIGV2ZW50J3MgYHRhcmdldGAgcHJvcGVydHlcbiAqIGlzIHNldCB0byB0aGUgQ3VzdG9tRWxlbWVudCB3aGljaCBob2xkcyB0aGUgc2hhZG93IERPTS4gV2Ugd2FudCB0byBwcm92aWRlIHRoZSBvcmlnaW5hbCB0YXJnZXQgaW4gZWFjaFxuICogQ29tcG9uZW50RXZlbnQgc28gZ2xvYmFsIGV2ZW50IGxpc3RlbmVycyBjYW4gZWFzaWx5IGFjY2VzcyB0aGUgZXZlbnQncyBvcmlnaW5hbCB0YXJnZXQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RXZlbnREZXRhaWw8QyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIHRhcmdldDogQztcbn1cblxuLyoqXG4gKiBUaGUgQ29tcG9uZW50RXZlbnQgY2xhc3NcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIENvbXBvbmVudEV2ZW50IGNsYXNzIGV4dGVuZHMgQ3VzdG9tRXZlbnQgYW5kIHNpbXBseSBwcm92aWRlcyB0aGUgZGVmYXVsdCBFdmVudEluaXQgb2JqZWN0IGFuZCBpdHMgdHlwaW5nXG4gKiBlbnN1cmVzIHRoYXQgdGhlIGV2ZW50IGRldGFpbCBjb250YWlucyBhIHRhcmdldCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEV2ZW50PFQgPSBhbnksIEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IGV4dGVuZHMgQ3VzdG9tRXZlbnQ8VCAmIENvbXBvbmVudEV2ZW50RGV0YWlsPEM+PiB7XG5cbiAgICBjb25zdHJ1Y3RvciAodHlwZTogc3RyaW5nLCBkZXRhaWw6IFQgJiBDb21wb25lbnRFdmVudERldGFpbDxDPiwgaW5pdDogRXZlbnRJbml0ID0ge30pIHtcblxuICAgICAgICBjb25zdCBldmVudEluaXQ6IEN1c3RvbUV2ZW50SW5pdDxUICYgQ29tcG9uZW50RXZlbnREZXRhaWw8Qz4+ID0ge1xuICAgICAgICAgICAgLi4uREVGQVVMVF9FVkVOVF9JTklULFxuICAgICAgICAgICAgLi4uaW5pdCxcbiAgICAgICAgICAgIGRldGFpbCxcbiAgICAgICAgfTtcblxuICAgICAgICBzdXBlcih0eXBlLCBldmVudEluaXQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIHR5cGUgZm9yIHByb3BlcnR5IGNoYW5nZSBldmVudCBkZXRhaWxzLCBhcyB1c2VkIGJ5IHtAbGluayBQcm9wZXJ0eUNoYW5nZUV2ZW50fVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlRXZlbnREZXRhaWw8VCA9IGFueSwgQyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gZXh0ZW5kcyBDb21wb25lbnRFdmVudERldGFpbDxDPiB7XG4gICAgcHJvcGVydHk6IHN0cmluZztcbiAgICBwcmV2aW91czogVDtcbiAgICBjdXJyZW50OiBUO1xufVxuXG4vKipcbiAqIFRoZSBQcm9wZXJ0eUNoYW5nZUV2ZW50IGNsYXNzXG4gKlxuICogQHJlbWFya3NcbiAqIEEgY3VzdG9tIGV2ZW50LCBhcyBkaXNwYXRjaGVkIGJ5IHRoZSB7QGxpbmsgQ29tcG9uZW50Ll9ub3RpZnlQcm9wZXJ0eX0gbWV0aG9kLiBUaGUgY29uc3RydWN0b3JcbiAqIGVuc3VyZXMgYSBjb252ZW50aW9uYWwgZXZlbnQgbmFtZSBpcyBjcmVhdGVkIGZvciB0aGUgcHJvcGVydHkga2V5IGFuZCBpbXBvc2VzIHRoZSBjb3JyZWN0IHR5cGVcbiAqIG9uIHRoZSBldmVudCBkZXRhaWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUNoYW5nZUV2ZW50PFQgPSBhbnksIEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IGV4dGVuZHMgQ29tcG9uZW50RXZlbnQ8UHJvcGVydHlDaGFuZ2VFdmVudERldGFpbDxUPiwgQz4ge1xuXG4gICAgY29uc3RydWN0b3IgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgZGV0YWlsOiBQcm9wZXJ0eUNoYW5nZUV2ZW50RGV0YWlsPFQsIEM+LCBpbml0PzogRXZlbnRJbml0KSB7XG5cbiAgICAgICAgY29uc3QgdHlwZSA9IGNyZWF0ZUV2ZW50TmFtZShwcm9wZXJ0eUtleSwgJycsICdjaGFuZ2VkJyk7XG5cbiAgICAgICAgc3VwZXIodHlwZSwgZGV0YWlsLCBpbml0KTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIExpZmVjeWNsZUV2ZW50IGNsYXNzXG4gKlxuICogQHJlbWFya3NcbiAqIEEgY3VzdG9tIGV2ZW50LCBhcyBkaXNwYXRjaGVkIGJ5IHRoZSB7QGxpbmsgQ29tcG9uZW50Ll9ub3RpZnlMaWZlY3ljbGV9IG1ldGhvZC4gVGhlIGNvbnN0cnVjdG9yXG4gKiBlbnN1cmVzIHRoZSBhbGxvd2VkIGxpZmVjeWNsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaWZlY3ljbGVFdmVudDxUID0gYW55LCBDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiBleHRlbmRzIENvbXBvbmVudEV2ZW50PFQsIEM+IHtcblxuICAgIGNvbnN0cnVjdG9yIChsaWZlY3ljbGU6ICdhZG9wdGVkJyB8ICdjb25uZWN0ZWQnIHwgJ2Rpc2Nvbm5lY3RlZCcgfCAndXBkYXRlJywgZGV0YWlsOiBUICYgQ29tcG9uZW50RXZlbnREZXRhaWw8Qz4sIGluaXQ/OiBFdmVudEluaXQpIHtcblxuICAgICAgICBzdXBlcihsaWZlY3ljbGUsIGRldGFpbCwgaW5pdCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgcmVuZGVyLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEF0dHJpYnV0ZVJlZmxlY3RvciwgaXNBdHRyaWJ1dGVSZWZsZWN0b3IsIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciwgaXNQcm9wZXJ0eUtleSwgaXNQcm9wZXJ0eU5vdGlmaWVyLCBpc1Byb3BlcnR5UmVmbGVjdG9yLCBMaXN0ZW5lckRlY2xhcmF0aW9uLCBQcm9wZXJ0eURlY2xhcmF0aW9uLCBQcm9wZXJ0eU5vdGlmaWVyLCBQcm9wZXJ0eVJlZmxlY3RvciwgU2VsZWN0b3JEZWNsYXJhdGlvbiB9IGZyb20gJy4vZGVjb3JhdG9ycy9pbmRleC5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnRFdmVudCwgTGlmZWN5Y2xlRXZlbnQsIFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IgPSAoYXR0cmlidXRlUmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBhdHRyaWJ1dGUgcmVmbGVjdG9yICR7IFN0cmluZyhhdHRyaWJ1dGVSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IgPSAocHJvcGVydHlSZWZsZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IHJlZmxlY3RvciAkeyBTdHJpbmcocHJvcGVydHlSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUiA9IChwcm9wZXJ0eU5vdGlmaWVyOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSBub3RpZmllciAkeyBTdHJpbmcocHJvcGVydHlOb3RpZmllcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IENIQU5HRV9ERVRFQ1RPUl9FUlJPUiA9IChjaGFuZ2VEZXRlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yICR7IFN0cmluZyhjaGFuZ2VEZXRlY3RvcikgfS5gKTtcblxuLyoqXG4gKiBFeHRlbmRzIHRoZSBzdGF0aWMge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IHRvIGluY2x1ZGUgdGhlIGJvdW5kIGxpc3RlbmVyXG4gKiBmb3IgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogQGludGVybmFsXG4gKi9cbmludGVyZmFjZSBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gZXh0ZW5kcyBMaXN0ZW5lckRlY2xhcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBib3VuZCBsaXN0ZW5lciB3aWxsIGJlIHN0b3JlZCBoZXJlLCBzbyBpdCBjYW4gYmUgcmVtb3ZlZCBpdCBsYXRlclxuICAgICAqL1xuICAgIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGV2ZW50IHRhcmdldCB3aWxsIGFsd2F5cyBiZSByZXNvbHZlZCB0byBhbiBhY3R1YWwge0BsaW5rIEV2ZW50VGFyZ2V0fVxuICAgICAqL1xuICAgIHRhcmdldDogRXZlbnRUYXJnZXQ7XG59XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2VzLCBhcyB1c2VkIGluIHtAbGluayBDb21wb25lbnQudXBkYXRlQ2FsbGJhY2t9XG4gKi9cbmV4cG9ydCB0eXBlIENoYW5nZXMgPSBNYXA8UHJvcGVydHlLZXksIGFueT47XG5cbi8qKlxuICogVGhlIGNvbXBvbmVudCBiYXNlIGNsYXNzXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hlbiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICogaW5zdGFuY2UgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZVNoZWV0ICgpOiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVTaGVldCcpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBzdHlsZSBzaGVldCBhbmQgY2FjaGUgaXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBuZXcgQ1NTU3R5bGVTaGVldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQucmVwbGFjZVN5bmModGhpcy5zdHlsZXMuam9pbignXFxuJykpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVTaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBub2RlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZUVsZW1lbnQgKCk6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZUVsZW1lbnQnKSkge1xuXG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRpdGxlID0gdGhpcy5zZWxlY3RvcjtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBhdHRyaWJ1dGUgbmFtZXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkga2V5c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICogcHJvcGVydHkga2V5IHRoYXQgYmVsb25ncyB0byBhbiBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBQcm9wZXJ0eUtleT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9mIGEgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBQcm9wZXJ0eURlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIGxpc3RlbmVyfSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gb2YgYSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuZXJzOiBNYXA8UHJvcGVydHlLZXksIExpc3RlbmVyRGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBzZWxlY3RvciBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgc2VsZWN0b3J9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBTZWxlY3RvckRlY2xhcmF0aW9ufSBvZiBhIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIHNlbGVjdG9yczogTWFwPFByb3BlcnR5S2V5LCBTZWxlY3RvckRlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzZWxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzZWxlY3RvcmAgb3B0aW9uLCBpZiBwcm92aWRlZC5cbiAgICAgKiBPdGhlcndpc2UgdGhlIGRlY29yYXRvciB3aWxsIHVzZSB0aGlzIHByb3BlcnR5IHRvIGRlZmluZSB0aGUgY29tcG9uZW50LlxuICAgICAqL1xuICAgIHN0YXRpYyBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBzZXQgYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzaGFkb3dgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHRydWVgKS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2hhZG93OiBib29sZWFuO1xuXG4gICAgLy8gVE9ETzogY3JlYXRlIHRlc3RzIGZvciBzdHlsZSBpbmhlcml0YW5jZVxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzdHlsZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc3R5bGVzYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBTdHlsZXMgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICogVGhpcyBhbGxvd3MgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQgYW5kIGFkZCBhZGRpdGlvbmFsIHN0eWxlcyBvbiB0aGUgY2hpbGQgY29tcG9uZW50LlxuICAgICAqIEluIG9yZGVyIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50LCBhbiBleHBsaWNpdCBzdXBlciBjYWxsIGhhcyB0byBiZSBpbmNsdWRlZC4gQnlcbiAgICAgKiBkZWZhdWx0IG5vIHN0eWxlcyBhcmUgaW5oZXJpdGVkLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gW1xuICAgICAqICAgICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICogICAgICAgICAgICAgICc6aG9zdCB7IGJhY2tncm91bmQtY29sb3I6IGdyZWVuOyB9J1xuICAgICAqICAgICAgICAgIF07XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGB0ZW1wbGF0ZWAgb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogSWYgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IsIGl0IHdpbGwgaGF2ZSBwcmVjZWRlbmNlIG92ZXIgdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgICBUaGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHdoaWNoIHNob3VsZCBleGlzdCBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBzdGF0aWMgdGVtcGxhdGU/OiAoZWxlbWVudDogYW55LCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdG8gc3BlY2lmeSBhdHRyaWJ1dGVzIHdoaWNoIHNob3VsZCBiZSBvYnNlcnZlZCwgYnV0IGRvbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya1xuICAgICAqIEZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBkZWNvcmF0ZWQgd2l0aCB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IsIGFuIG9ic2VydmVkIGF0dHJpYnV0ZVxuICAgICAqIGlzIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzcGVjaWZpZWQgaGVyZS4gRm90IGF0dHJpYnV0ZXMgdGhhdCBkb24ndFxuICAgICAqIGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eSwgcmV0dXJuIHRoZSBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhpcyBnZXR0ZXIuIENoYW5nZXMgdG8gdGhlc2VcbiAgICAgKiBhdHRyaWJ1dGVzIGNhbiBiZSBoYW5kbGVkIGluIHRoZSB7QGxpbmsgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrfSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBXaGVuIGV4dGVuZGluZyBjb21wb25lbnRzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIHRoZSBzdXBlciBjbGFzcydzIG9ic2VydmVkQXR0cmlidXRlc1xuICAgICAqIGlmIHlvdSBvdmVycmlkZSB0aGlzIGdldHRlciAoZXhjZXB0IGlmIHlvdSBkb24ndCB3YW50IHRvIGluaGVyaXQgb2JzZXJ2ZWQgYXR0cmlidXRlcyk6XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbXG4gICAgICogICAgICAgICAgICAgIC4uLnN1cGVyLm9ic2VydmVkQXR0cmlidXRlcyxcbiAgICAgKiAgICAgICAgICAgICAgJ215LWFkZGl0aW9uYWwtYXR0cmlidXRlJ1xuICAgICAqICAgICAgICAgIF07XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdXBkYXRlUmVxdWVzdDogUHJvbWlzZTxib29sZWFuPiA9IFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY2hhbmdlZFByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdGluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5aW5nUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW5lckRlY2xhcmF0aW9uczogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uW10gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzVXBkYXRlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaXNSZWZsZWN0aW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlbmRlclJvb3Q6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yICguLi5hcmdzOiBhbnlbXSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJSb290ID0gdGhpcy5fY3JlYXRlUmVuZGVyUm9vdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgbW92ZWQgdG8gYSBuZXcgZG9jdW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGFkb3B0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdhZG9wdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIGRvY3VtZW50J3MgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fdW5saXN0ZW4oKTtcblxuICAgICAgICB0aGlzLl91bnNlbGVjdCgpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnZGlzY29ubmVjdGVkJyk7XG5cbiAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIG9uZSBvZiB0aGUgY29tcG9uZW50J3MgYXR0cmlidXRlcyBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGljaCBhdHRyaWJ1dGVzIHRvIG5vdGljZSBjaGFuZ2UgZm9yIGlzIHNwZWNpZmllZCBpbiB7QGxpbmsgb2JzZXJ2ZWRBdHRyaWJ1dGVzfS5cbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIEZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB3aXRoIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlLCB0aGlzIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUgaGFuZGxpbmcgb2YgYXR0cmlidXRlIGNoYW5nZXMuIFdoZW4gb3ZlcnJpZGluZ1xuICAgICAqIHRoaXMgbWV0aG9kLCBhIHN1cGVyLWNhbGwgc2hvdWxkIGJlIGluY2x1ZGVkLCB0byBlbnN1cmUgYXR0cmlidXRlIGNoYW5nZXMgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICogYXJlIHByb2Nlc3NlZCBjb3JyZWN0bHkuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBzdXBlci5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAqXG4gICAgICogICAgICAgICAgLy8gZG8gY3VzdG9tIGhhbmRsaW5nLi4uXG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZSBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUmVmbGVjdGluZyB8fCBvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgdXBkYXRlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgYHVwZGF0ZUNhbGxiYWNrYCBpcyBpbnZva2VkIHN5bmNocm9ub3VzbHkgYnkgdGhlIHtAbGluayB1cGRhdGV9IG1ldGhvZCBhbmQgdGhlcmVmb3JlIGhhcHBlbnMgZGlyZWN0bHkgYWZ0ZXJcbiAgICAgKiByZW5kZXJpbmcsIHByb3BlcnR5IHJlZmxlY3Rpb24gYW5kIHByb3BlcnR5IGNoYW5nZSBldmVudHMuXG4gICAgICpcbiAgICAgKiBOLkIuOiBDaGFuZ2VzIG1hZGUgdG8gcHJvcGVydGllcyBvciBhdHRyaWJ1dGVzIGluc2lkZSB0aGlzIGNhbGxiYWNrICp3b24ndCogY2F1c2UgYW5vdGhlciB1cGRhdGUuXG4gICAgICogVG8gY2F1c2UgYW4gdXBkYXRlLCBkZWZlciBjaGFuZ2VzIHdpdGggdGhlIGhlbHAgb2YgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgKiAgICAgICAgICAgICAgLy8gcGVyZm9ybSBjaGFuZ2VzIHdoaWNoIG5lZWQgdG8gY2F1c2UgYW5vdGhlciB1cGRhdGUgaGVyZVxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgICAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZmlyc3RVcGRhdGUgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIHdhcyB0aGUgZmlyc3QgdXBkYXRlXG4gICAgICovXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7IH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgY3VzdG9tIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBBbiBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIGV2ZW50SW5pdCBBIHtAbGluayBDdXN0b21FdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKiBAZGVwcmVjYXRlZCAgVXNlIHtAbGluayBDb21wb25lbnQuZGlzcGF0Y2h9IGluc3RlYWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5IChldmVudE5hbWU6IHN0cmluZywgZXZlbnRJbml0PzogQ3VzdG9tRXZlbnRJbml0KSB7XG5cbiAgICAgICAgLy8gVE9ETzogaW1wcm92ZSB0aGlzISB3ZSBzaG91bGQgcHVsbCB0aGUgZGlzcGF0Y2ggbWV0aG9kIGZyb20gZXhhbXBsZSBpbnRvIC4vZXZlbnRzXG4gICAgICAgIC8vIGFuZCB1c2UgaXQgaGVyZTsgd2Ugc2hvdWxkIGNoYW5nZSBub3RpZnkoKSBhcmd1bWVudHMgdG8gdHlwZSwgZGV0YWlsLCBpbml0XG4gICAgICAgIC8vIG1heWJlIHdlIHNob3VsZCBldmVuIHJlbmFtZSBpdCB0byBkaXNwYXRjaC4uLlxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgZXZlbnRJbml0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYW4gZXZlbnQgb24gdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBkaXNwYXRjaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBkaXNwYXRjaCAoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEge0BsaW5rIENvbXBvbmVudEV2ZW50fSBvbiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIGNhbGxlZCB3aXRoIGEgdHlwZSBhbmQgZGV0YWlsIGFyZ3VtZW50LCB0aGUgZGlzcGF0Y2ggbWV0aG9kIHdpbGwgY3JlYXRlIGEgbmV3IHtAbGluayBDb21wb25lbnRFdmVudH1cbiAgICAgKiBhbmQgc2V0IGl0cyBkZXRhaWwncyBgdGFyZ2V0YCBwcm9wZXJ0eSB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUgICAgICBUaGUgdHlwZSBvZiB0aGUgZXZlbnRcbiAgICAgKiBAcGFyYW0gZGV0YWlsICAgIEFuIG9wdGlvbmFsIGN1c3RvbSBldmVudCBkZXRhaWxcbiAgICAgKiBAcGFyYW0gaW5pdCAgICAgIEFuIG9wdGlvbmFsIHtAbGluayBFdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2g8VCA9IGFueT4gKHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgaW5pdD86IFBhcnRpYWw8RXZlbnRJbml0Pik6IGJvb2xlYW47XG5cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2g8VCA9IGFueT4gKGV2ZW50T3JUeXBlOiBFdmVudCB8IHN0cmluZywgZGV0YWlsPzogVCwgaW5pdDogUGFydGlhbDxFdmVudEluaXQ+ID0ge30pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50T3JUeXBlID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgICAgICBldmVudE9yVHlwZSA9IG5ldyBDb21wb25lbnRFdmVudDxUPihldmVudE9yVHlwZSwgeyB0YXJnZXQ6IHRoaXMsIC4uLmRldGFpbCEgfSwgaW5pdClcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnRPclR5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoIHByb3BlcnR5IGNoYW5nZXMgb2NjdXJyaW5nIGluIHRoZSBleGVjdXRvciBhbmQgcmFpc2UgY3VzdG9tIGV2ZW50c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIHNob3VsZCB0cmlnZ2VyIGN1c3RvbSBldmVudHMgd2hlbiB0aGV5IGFyZSBjYXVzZWQgYnkgaW50ZXJuYWwgc3RhdGUgY2hhbmdlcyxcbiAgICAgKiBidXQgbm90IGlmIHRoZXkgYXJlIGNhdXNlZCBieSBhIGNvbnN1bWVyIG9mIHRoZSBjb21wb25lbnQgQVBJIGRpcmVjdGx5LCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ215LWN1c3RvbS1lbGVtZW50JykuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIGBgYC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWVhbnMsIHdlIGNhbm5vdCBhdXRvbWF0ZSB0aGlzIHByb2Nlc3MgdGhyb3VnaCBwcm9wZXJ0eSBzZXR0ZXJzLCBhcyB3ZSBjYW4ndCBiZSBzdXJlIHdob1xuICAgICAqIGludm9rZWQgdGhlIHNldHRlciAtIGludGVybmFsIGNhbGxzIG9yIGV4dGVybmFsIGNhbGxzLlxuICAgICAqXG4gICAgICogT25lIG9wdGlvbiBpcyB0byBtYW51YWxseSByYWlzZSB0aGUgZXZlbnQsIHdoaWNoIGNhbiBiZWNvbWUgdGVkaW91cyBhbmQgZm9yY2VzIHVzIHRvIHVzZSBzdHJpbmctXG4gICAgICogYmFzZWQgZXZlbnQgbmFtZXMgb3IgcHJvcGVydHkgbmFtZXMsIHdoaWNoIGFyZSBkaWZmaWN1bHQgdG8gcmVmYWN0b3IsIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogLy8gaWYgd2UgcmVmYWN0b3IgdGhlIHByb3BlcnR5IG5hbWUsIHdlIGNhbiBlYXNpbHkgbWlzcyB0aGUgbm90aWZ5IGNhbGxcbiAgICAgKiB0aGlzLm5vdGlmeSgnY3VzdG9tUHJvcGVydHknKTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEEgbW9yZSBjb252ZW5pZW50IHdheSBpcyB0byBleGVjdXRlIHRoZSBpbnRlcm5hbCBjaGFuZ2VzIGluIGEgd3JhcHBlciB3aGljaCBjYW4gZGV0ZWN0IHRoZSBjaGFuZ2VkXG4gICAgICogcHJvcGVydGllcyBhbmQgd2lsbCBhdXRvbWF0aWNhbGx5IHJhaXNlIHRoZSByZXF1aXJlZCBldmVudHMuIFRoaXMgZWxpbWluYXRlcyB0aGUgbmVlZCB0byBtYW51YWxseVxuICAgICAqIHJhaXNlIGV2ZW50cyBhbmQgcmVmYWN0b3JpbmcgZG9lcyBubyBsb25nZXIgYWZmZWN0IHRoZSBwcm9jZXNzLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMud2F0Y2goKCkgPT4ge1xuICAgICAqXG4gICAgICogICAgICB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAgICAgIC8vIHdlIGNhbiBhZGQgbW9yZSBwcm9wZXJ0eSBtb2RpZmljYXRpb25zIHRvIG5vdGlmeSBpbiBoZXJlXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgQSBmdW5jdGlvbiB0aGF0IHBlcmZvcm1zIHRoZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBiZSBub3RpZmllZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3YXRjaCAoZXhlY3V0b3I6ICgpID0+IHZvaWQpIHtcblxuICAgICAgICAvLyBiYWNrIHVwIGN1cnJlbnQgY2hhbmdlZCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNoYW5nZXNcbiAgICAgICAgZXhlY3V0b3IoKTtcblxuICAgICAgICAvLyBhZGQgYWxsIG5ldyBvciB1cGRhdGVkIGNoYW5nZWQgcHJvcGVydGllcyB0byB0aGUgbm90aWZ5aW5nIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBbcHJvcGVydHlLZXksIG9sZFZhbHVlXSBvZiB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcykge1xuXG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9ICFwcmV2aW91c0NoYW5nZXMuaGFzKHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSAhYWRkZWQgJiYgdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBwcmV2aW91c0NoYW5nZXMuZ2V0KHByb3BlcnR5S2V5KSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoYWRkZWQgfHwgdXBkYXRlZCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdmFsdWUgb2YgYSBkZWNvcmF0ZWQgcHJvcGVydHkgb3IgaXRzIGFzc29jaWF0ZWRcbiAgICAgKiBhdHRyaWJ1dGUgY2hhbmdlcy4gSWYgeW91IG5lZWQgdGhlIGNvbXBvbmVudCB0byB1cGRhdGUgYmFzZWQgb24gYSBzdGF0ZSBjaGFuZ2UgdGhhdCBpc1xuICAgICAqIG5vdCBjb3ZlcmVkIGJ5IGEgZGVjb3JhdGVkIHByb3BlcnR5LCBjYWxsIHRoaXMgbWV0aG9kIHdpdGhvdXQgYW55IGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBrZXkgb2YgdGhlIGNoYW5nZWQgcHJvcGVydHkgdGhhdCByZXF1ZXN0cyB0aGUgdXBkYXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIHRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBBIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiB0aGUgdXBkYXRlIGlzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZXF1ZXN0VXBkYXRlIChwcm9wZXJ0eUtleT86IFByb3BlcnR5S2V5LCBvbGRWYWx1ZT86IGFueSwgbmV3VmFsdWU/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBpZiAocHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSdzIG9ic2VydmUgb3B0aW9uIGlzIGBmYWxzZWAsIHtAbGluayBoYXNDaGFuZ2VkfVxuICAgICAgICAgICAgLy8gd2lsbCByZXR1cm4gYGZhbHNlYCBhbmQgbm8gdXBkYXRlIHdpbGwgYmUgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzQ2hhbmdlZChwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSkgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIGNoYW5nZWQgcHJvcGVydHkgZm9yIGJhdGNoIHByb2Nlc3NpbmdcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgaW4gcmVmbGVjdGluZyBzdGF0ZSwgYW4gYXR0cmlidXRlIGlzIHJlZmxlY3RpbmcgdG8gdGhpcyBwcm9wZXJ0eSBhbmQgd2VcbiAgICAgICAgICAgIC8vIGNhbiBza2lwIHJlZmxlY3RpbmcgdGhlIHByb3BlcnR5IGJhY2sgdG8gdGhlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgLy8gcHJvcGVydHkgY2hhbmdlcyBuZWVkIHRvIGJlIHRyYWNrZWQgaG93ZXZlciBhbmQge0BsaW5rIHJlbmRlcn0gbXVzdCBiZSBjYWxsZWQgYWZ0ZXJcbiAgICAgICAgICAgIC8vIHRoZSBhdHRyaWJ1dGUgY2hhbmdlIGlzIHJlZmxlY3RlZCB0byB0aGlzIHByb3BlcnR5XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzUmVmbGVjdGluZykgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBlbnF1ZXVlIHVwZGF0ZSByZXF1ZXN0IGlmIG5vbmUgd2FzIGVucXVldWVkIGFscmVhZHlcbiAgICAgICAgICAgIHRoaXMuX2VucXVldWVVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVXNlcyBsaXQtaHRtbCdzIHtAbGluayBsaXQtaHRtbCNyZW5kZXJ9IG1ldGhvZCB0byByZW5kZXIgYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHRvIHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciByb290LiBUaGUgY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBzdGF0aWMgdGVtcGxhdGUgbWV0aG9kXG4gICAgICogYXV0b21hdGljYWxseS4gVG8gbWFrZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXZhaWxhYmxlIHRvIHRoZSB0ZW1wbGF0ZSBtZXRob2QsIHlvdSBjYW4gcGFzcyB0aGVtIHRvIHRoZVxuICAgICAqIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogY29uc3QgZGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlKSA9PiB7IC8vIHJldHVybiBzb21lIGRhdGUgdHJhbnNmb3JtYXRpb24uLi5cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnLFxuICAgICAqICAgICAgdGVtcGxhdGU6IChlbGVtZW50LCBmb3JtYXREYXRlKSA9PiBodG1sYDxzcGFuPkxhc3QgdXBkYXRlZDogJHsgZm9ybWF0RGF0ZShlbGVtZW50Lmxhc3RVcGRhdGVkKSB9PC9zcGFuPmBcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIEBwcm9wZXJ0eSgpXG4gICAgICogICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgKlxuICAgICAqICAgICAgcmVuZGVyICgpIHtcbiAgICAgKiAgICAgICAgICAvLyBtYWtlIHRoZSBkYXRlIGZvcm1hdHRlciBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIGJ5IHBhc3NpbmcgaXQgdG8gcmVuZGVyKClcbiAgICAgKiAgICAgICAgICBzdXBlci5yZW5kZXIoZGF0ZUZvcm1hdHRlcik7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBvYmplY3RzIHdoaWNoIHNob3VsZCBiZSBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoLi4uaGVscGVyczogYW55W10pIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbnN0cnVjdG9yLnRlbXBsYXRlICYmIGNvbnN0cnVjdG9yLnRlbXBsYXRlKHRoaXMsIC4uLmhlbHBlcnMpO1xuXG4gICAgICAgIGlmICh0ZW1wbGF0ZSkgcmVuZGVyKHRlbXBsYXRlLCB0aGlzLnJlbmRlclJvb3QsIHsgZXZlbnRDb250ZXh0OiB0aGlzIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbXBvbmVudCBhZnRlciBhbiB1cGRhdGUgd2FzIHJlcXVlc3RlZCB3aXRoIHtAbGluayByZXF1ZXN0VXBkYXRlfVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZW5kZXJzIHRoZSB0ZW1wbGF0ZSwgcmVmbGVjdHMgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIGF0dHJpYnV0ZXMgYW5kXG4gICAgICogZGlzcGF0Y2hlcyBjaGFuZ2UgZXZlbnRzIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBUbyBoYW5kbGUgdXBkYXRlcyBkaWZmZXJlbnRseSwgdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgICAgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlZCBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIHJlZmxlY3Rpb25zICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IHdlcmUgbWFya2VkIGZvciByZWZsZWN0aW9uIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9ucyBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvbiBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIGZpcnN0VXBkYXRlICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhpcyBpcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlIChjaGFuZ2VzOiBDaGFuZ2VzLCByZWZsZWN0aW9uczogQ2hhbmdlcywgbm90aWZpY2F0aW9uczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSB3ZSBhZG9wdCB0aGUgZWxlbWVudCdzIHN0eWxlcyBhbmQgc2V0IHVwIGRlY2xhcmVkIGxpc3RlbmVyc1xuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgdGhpcy5fc3R5bGUoKTtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdCgpO1xuICAgICAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnMgYWZ0ZXIgcmVuZGVyIHRvIGVuc3VyZSBhbGwgRE9NIGlzIHJlbmRlcmVkLCBhbGwgcHJvcGVydGllc1xuICAgICAgICAgICAgLy8gYXJlIHVwLXRvLWRhdGUgYW5kIGFueSB1c2VyLWNyZWF0ZWQgb2JqZWN0cyAoZS5nLiB3b3JrZXJzKSB3aWxsIGJlIGNyZWF0ZWQgaW4gYW5cbiAgICAgICAgICAgIC8vIG92ZXJyaWRkZW4gY29ubmVjdGVkQ2FsbGJhY2s7IGJ1dCBiZWZvcmUgZGlzcGF0Y2hpbmcgYW55IHByb3BlcnR5LWNoYW5nZSBldmVudHNcbiAgICAgICAgICAgIC8vIHRvIG1ha2Ugc3VyZSBsb2NhbCBsaXN0ZW5lcnMgYXJlIGJvdW5kIGZpcnN0XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW4oKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3QoKTtcblxuICAgICAgICAgICAgLy8gVE9ETzogY2FuIHdlIGNoZWNrIGlmIHNlbGVjdGVkIG5vZGVzIGNoYW5nZWQgYW5kIGlmIGxpc3RlbmVycyBhcmUgYWZmZWN0ZWQ/XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlZmxlY3RQcm9wZXJ0aWVzKHJlZmxlY3Rpb25zKTtcbiAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0aWVzKG5vdGlmaWNhdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgY29tcG9uZW50IGFmdGVyIGFuIHVwZGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogUmVzZXRzIHRoZSBjb21wb25lbnQncyBwcm9wZXJ0eSB0cmFja2luZyBtYXBzIHdoaWNoIGFyZSB1c2VkIGluIHRoZSB1cGRhdGUgY3ljbGUgdG8gdHJhY2sgY2hhbmdlcy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVzZXQgKCkge1xuXG4gICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHByb3BlcnR5IGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVzb2x2ZXMgdGhlIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfSBmb3IgdGhlIHByb3BlcnR5IGFuZCByZXR1cm5zIGl0cyByZXN1bHQuXG4gICAgICogSWYgbm9uZSBpcyBkZWZpbmVkICh0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24ncyBgb2JzZXJ2ZWAgb3B0aW9uIGlzIGBmYWxzZWApIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBjaGFuZ2VkLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNDaGFuZ2VkIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBvYnNlcnZlIGlzIGVpdGhlciBgZmFsc2VgIG9yIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZS5jYWxsKG51bGwsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBDSEFOR0VfREVURUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gZm9yIGEgZGVjb3JhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIGRlY2xhcmF0aW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFByb3BlcnR5RGVjbGFyYXRpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVjbGFyYXRpb24gfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbGwgcHJvcGVydHkgY2hhbmdlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgYWxsIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCwgd2hpY2ggaGF2ZSBiZWVuIG1hcmtlZCBmb3IgcmVmbGVjdGlvbi5cbiAgICAgKiBJdCBpcyBjYWxsZWQgYnkgdGhlIHtAbGluayBDb21wb25lbnQudXBkYXRlfSBtZXRob2QgYWZ0ZXIgdGhlIHRlbXBsYXRlIGhhcyBiZWVuIHJlbmRlcmVkLiBJZiBub1xuICAgICAqIHByb3BlcnRpZXMgbWFwIGlzIHByb3ZpZGVkLCB0aGlzIG1ldGhvZCB3aWxsIHJlZmxlY3QgYWxsIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBiZWVuIG1hcmtlZCBmb3JcbiAgICAgKiByZWZsZWN0aW9uIHNpbmNlIHRoZSBsYXN0IGB1cGRhdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnRpZXMgQW4gb3B0aW9uYWwgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHByZXZpb3VzIHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RQcm9wZXJ0aWVzIChwcm9wZXJ0aWVzPzogTWFwPFByb3BlcnR5S2V5LCBhbnk+KSB7XG5cbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgPz8gdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMgYXMgTWFwPGtleW9mIHRoaXMsIGFueT47XG5cbiAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZSwgcHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2UgY2hhbmdlIGV2ZW50cyBmb3IgYWxsIGNoYW5nZWQgcHJvcGVydGllc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHJhaXNlIGNoYW5nZSBldmVudHMgZm9yIGFsbCBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQsIHdoaWNoIGhhdmUgYmVlblxuICAgICAqIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uLiBJdCBpcyBjYWxsZWQgYnkgdGhlIHtAbGluayBDb21wb25lbnQudXBkYXRlfSBtZXRob2QgYWZ0ZXIgdGhlIHRlbXBsYXRlXG4gICAgICogaGFzIGJlZW4gcmVuZGVyZWQgYW5kIHByb3BlcnRpZXMgaGF2ZSBiZWVuIHJlZmxlY3RlZC4gSWYgbm8gcHJvcGVydGllcyBtYXAgaXMgcHJvdmlkZWQsIHRoaXNcbiAgICAgKiBtZXRob2Qgd2lsbCBub3RpZnkgYWxsIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBiZWVuIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uIHNpbmNlIHRoZSBsYXN0IGB1cGRhdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnRpZXMgQW4gb3B0aW9uYWwgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHByZXZpb3VzIHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeVByb3BlcnRpZXMgKHByb3BlcnRpZXM/OiBNYXA8UHJvcGVydHlLZXksIGFueT4pIHtcblxuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyA/PyB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzIGFzIE1hcDxrZXlvZiB0aGlzLCBhbnk+O1xuXG4gICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWUsIHByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMubm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIGFzc29jaWF0ZWQgcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RBdHRyaWJ1dGV9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICAvLyBpZ25vcmUgdXNlci1kZWZpbmVkIG9ic2VydmVkIGF0dHJpYnV0ZXNcbiAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIGFuZCByZW1vdmUgdGhlIGxvZ1xuICAgICAgICBpZiAoIXByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBvYnNlcnZlZCBhdHRyaWJ1dGUgXCIkeyBhdHRyaWJ1dGVOYW1lIH1cIiBub3QgZm91bmQuLi4gaWdub3JpbmcuLi5gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNBdHRyaWJ1dGVSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlLmNhbGwodGhpcywgYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZV0gYXMgQXR0cmlidXRlUmVmbGVjdG9yKShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5fSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkge1xuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHksIHdlIGNhbiBjYXRjaCB0aGUgc3RhdGUgdGhlcmVcbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5UmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5XSBhcyBQcm9wZXJ0eVJlZmxlY3RvcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJhaXNlIGFuIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSBub3RpZmllci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIG5vdGlmaWVyIHtAbGluayBfbm90aWZ5UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByYWlzZSBhbiBldmVudCBmb3JcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpIHtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlOb3RpZmllcihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnldIGFzIFByb3BlcnR5Tm90aWZpZXIpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBjb21wb25lbnQncyByZW5kZXIgcm9vdFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dC4gV2hlbiB1c2luZyB0aGUgY29tcG9uZW50XG4gICAgICogd2l0aCBzaGFkb3cgbW9kZSwgaXQgd2lsbCBiZSBhIHtAbGluayBTaGFkb3dSb290fSwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NyZWF0ZVJlbmRlclJvb3QgKCk6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkuc2hhZG93XG4gICAgICAgICAgICA/IHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pXG4gICAgICAgICAgICA6IHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgY29tcG9uZW50J3Mgc3R5bGVzIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlIHdpbGwgYmUgYWRvcHRlZFxuICAgICAqIGJ5IHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIG5vdCwgYSBzdHlsZSBlbGVtZW50IGlzIGNyZWF0ZWQgYW5kIGF0dGFjaGVkIHRvIHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIHRoZVxuICAgICAqIGNvbXBvbmVudCBpcyBub3QgdXNpbmcgc2hhZG93IG1vZGUsIGEgc2NyaXB0IHRhZyB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLiBGb3IgbXVsdGlwbGVcbiAgICAgKiBpbnN0YW5jZXMgb2YgdGhlIHNhbWUgY29tcG9uZW50IG9ubHkgb25lIHN0eWxlc2hlZXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3N0eWxlICgpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBsZXQgc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyB3ZSBpbnZva2UgdGhlIGdldHRlciBpbiB0aGUgaWYgc3RhdGVtZW50IHRvIGhhdmUgdGhlIGdldHRlciBpbnZva2VkIGxhemlseVxuICAgICAgICAvLyB0aGUgZ2V0dGVycyBmb3Igc3R5bGVTaGVldCBhbmQgc3R5bGVFbGVtZW50IHdpbGwgY3JlYXRlIHRoZSBhY3R1YWwgc3R5bGVTaGVldFxuICAgICAgICAvLyBhbmQgc3R5bGVFbGVtZW50IGFuZCBjYWNoZSB0aGVtIHN0YXRpY2FsbHkgYW5kIHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGJvdGhcbiAgICAgICAgLy8gd2UgcHJlZmVyIHRoZSBjb25zdHJ1Y3RhYmxlIHN0eWxlU2hlZXQgYW5kIGZhbGxiYWNrIHRvIHRoZSBzdHlsZSBlbGVtZW50XG4gICAgICAgIGlmICgoc3R5bGVTaGVldCA9IGNvbnN0cnVjdG9yLnN0eWxlU2hlZXQpKSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBwYXJ0IG9uY2Ugd2UgaGF2ZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIChDaHJvbWUgNzMpXG4gICAgICAgICAgICBpZiAoIWNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgaWYgKChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLmluY2x1ZGVzKHN0eWxlU2hlZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgICh0aGlzLnJlbmRlclJvb3QgYXMgU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW3N0eWxlU2hlZXRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0eWxlRWxlbWVudCA9IGNvbnN0cnVjdG9yLnN0eWxlRWxlbWVudCkpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB3ZSBkb24ndCBkdXBsaWNhdGUgc3R5bGVzaGVldHMgZm9yIG5vbi1zaGFkb3cgZWxlbWVudHNcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlQWxyZWFkeUFkZGVkID0gY29uc3RydWN0b3Iuc2hhZG93XG4gICAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgICAgIDogQXJyYXkuZnJvbShkb2N1bWVudC5zdHlsZVNoZWV0cykuZmluZChzdHlsZSA9PiBzdHlsZS50aXRsZSA9PT0gY29uc3RydWN0b3Iuc2VsZWN0b3IpICYmIHRydWUgfHwgZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChzdHlsZUFscmVhZHlBZGRlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBjbG9uZSB0aGUgY2FjaGVkIHN0eWxlIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gc3R5bGVFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKGNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb290LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgYXR0cmlidXRlIHJlZmxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBubyB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgYXR0cmlidXRlIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLmZyb21BdHRyaWJ1dGUuY2FsbCh0aGlzLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiB0aGlzXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGhhdmUgYSBkZWNsYXJhdGlvblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gaWYgdGhlIGRlZmF1bHQgcmVmbGVjdG9yIGlzIHVzZWQsIHdlIG5lZWQgdG8gY2hlY2sgaWYgYW4gYXR0cmlidXRlIGZvciB0aGlzIHByb3BlcnR5IGV4aXN0c1xuICAgICAgICAvLyBpZiBub3QsIHdlIHdvbid0IHJlZmxlY3RcbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlY2xhcmF0aW9uLmF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHksIGl0J3MgYSBzdHJpbmdcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlIGFzIHN0cmluZztcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci50b0F0dHJpYnV0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlKTtcblxuICAgICAgICAvLyB1bmRlZmluZWQgbWVhbnMgZG9uJ3QgY2hhbmdlXG4gICAgICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIG1lYW5zIHJlbW92ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGVsc2UgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRXZlbnR9XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXlcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5UHJvcGVydHk8VCA9IGFueT4gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IFQsIG5ld1ZhbHVlOiBUKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaChuZXcgUHJvcGVydHlDaGFuZ2VFdmVudChwcm9wZXJ0eUtleSwge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBwcmV2aW91czogb2xkVmFsdWUsXG4gICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZSxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEge0BsaW5rIExpZmVjeWNsZUV2ZW50fVxuICAgICAqXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZSBUaGUgbGlmZWN5Y2xlIGZvciB3aGljaCB0byByYWlzZSB0aGUgZXZlbnQgKHdpbGwgYmUgdGhlIGV2ZW50IG5hbWUpXG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeUxpZmVjeWNsZSAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbDogb2JqZWN0ID0ge30pIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoKG5ldyBMaWZlY3ljbGVFdmVudChsaWZlY3ljbGUsIHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgIC4uLmRldGFpbCxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW4gKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLmxpc3RlbmVycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbGlzdGVuZXIpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEZWNsYXJhdGlvbjogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgY2xhc3MncyBzdGF0aWMgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW50byBhbiBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGV2ZW50OiBkZWNsYXJhdGlvbi5ldmVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBkZWNsYXJhdGlvbi5vcHRpb25zLFxuXG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aGUgY29tcG9uZW50cyBsaXN0ZW5lciBtZXRob2QgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6ICh0aGlzW2xpc3RlbmVyIGFzIGtleW9mIHRoaXNdIGFzIHVua25vd24gYXMgRXZlbnRMaXN0ZW5lcikuYmluZCh0aGlzKSxcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnQgdGFyZ2V0IGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICgodHlwZW9mIGRlY2xhcmF0aW9uLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgPyBkZWNsYXJhdGlvbi50YXJnZXQuY2FsbCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgfHwgdGhpcyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgYm91bmQgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRhcmdldFxuICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmV2ZW50ISxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGluIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLnB1c2goaW5zdGFuY2VEZWNsYXJhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5ldmVudCEsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXJ5IGNvbXBvbmVudCBzZWxlY3RvcnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0ICgpIHtcblxuICAgICAgICAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zZWxlY3RvcnMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIHByb3BlcnR5KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSAoKHR5cGVvZiBkZWNsYXJhdGlvbi5yb290ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgID8gZGVjbGFyYXRpb24ucm9vdC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgOiBkZWNsYXJhdGlvbi5yb290KVxuICAgICAgICAgICAgICAgIHx8IHRoaXMucmVuZGVyUm9vdDtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRlY2xhcmF0aW9uLmFsbFxuICAgICAgICAgICAgICAgID8gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKGRlY2xhcmF0aW9uLnF1ZXJ5ISlcbiAgICAgICAgICAgICAgICA6IHJvb3QucXVlcnlTZWxlY3RvcihkZWNsYXJhdGlvbi5xdWVyeSEpO1xuXG4gICAgICAgICAgICB0aGlzW3Byb3BlcnR5IGFzIGtleW9mIHRoaXNdID0gZWxlbWVudCBhcyBhbnk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGNvbXBvbmVudCBzZWxlY3RvciByZWZlcmVuY2VzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Vuc2VsZWN0ICgpIHtcblxuICAgICAgICAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zZWxlY3RvcnMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIHByb3BlcnR5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXNbcHJvcGVydHkgYXMga2V5b2YgdGhpc10gPSBudWxsIGFzIGFueTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogcmV2aWV3IF9lbnF1ZXVlVXBkYXRlIG1ldGhvZFxuICAgIC8vIGF3YWl0IHByZXZpb3VzVXBkYXRlIGlzIGFscmVhZHkgZGVmZXJyaW5nIGV2ZXJ5dGhpbmcgdG8gbmV4dCBtaWNybyB0YXNrXG4gICAgLy8gdGhlbiB3ZSBhd2FpdCB1cGRhdGUgLSBleGNlcHQgZm9yIGZpcnN0IHRpbWUuLi5cbiAgICAvLyB3ZSBuZXZlciBlbnF1ZXVlIHdoZW4gX2hhc1JlcXVlc3RlZFVwZGF0ZSBpcyB0cnVlIGFuZCB3ZSBvbmx5IHNldCBpdCB0byBmYWxzZVxuICAgIC8vIGFmdGVyIHRoZSBuZXcgcmVxdWVzdCByZXNvbHZlZFxuICAgIC8qKlxuICAgICAqIEVucXVldWUgYSByZXF1ZXN0IGZvciBhbiBhc3luY2hyb25vdXMgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2VucXVldWVVcGRhdGUgKCkge1xuXG4gICAgICAgIGxldCByZXNvbHZlOiAocmVzdWx0OiBib29sZWFuKSA9PiB2b2lkO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVxdWVzdCA9IHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgLy8gbWFyayB0aGUgY29tcG9uZW50IGFzIGhhdmluZyByZXF1ZXN0ZWQgYW4gdXBkYXRlLCB0aGUge0BsaW5rIF9yZXF1ZXN0VXBkYXRlfVxuICAgICAgICAvLyBtZXRob2Qgd2lsbCBub3QgZW5xdWV1ZSBhIGZ1cnRoZXIgcmVxdWVzdCBmb3IgdXBkYXRlIGlmIG9uZSBpcyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzID0+IHJlc29sdmUgPSByZXMpO1xuXG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB1cGRhdGUgdG8gcmVzb2x2ZVxuICAgICAgICAvLyBgYXdhaXRgIGlzIGFzeW5jaHJvbm91cyBhbmQgd2lsbCByZXR1cm4gZXhlY3V0aW9uIHRvIHRoZSB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gbWV0aG9kXG4gICAgICAgIC8vIGFuZCBlc3NlbnRpYWxseSBhbGxvd3MgdXMgdG8gYmF0Y2ggbXVsdGlwbGUgc3luY2hyb25vdXMgcHJvcGVydHkgY2hhbmdlcywgYmVmb3JlIHRoZVxuICAgICAgICAvLyBleGVjdXRpb24gY2FuIHJlc3VtZSBoZXJlXG4gICAgICAgIGF3YWl0IHByZXZpb3VzUmVxdWVzdDtcblxuICAgICAgICAvLyBhc2sgdGhlIHNjaGVkdWxlciBmb3IgYSBuZXcgdXBkYXRlXG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9IHRoaXMuX3NjaGVkdWxlVXBkYXRlKCk7XG5cbiAgICAgICAgLy8gdGhlIGFjdHVhbCB1cGRhdGUgbWF5IGJlIHNjaGVkdWxlZCBhc3luY2hyb25vdXNseSBhcyB3ZWxsLCBpbiB3aGljaCBjYXNlIHdlIHdhaXQgZm9yIGl0XG4gICAgICAgIGlmICh1cGRhdGUpIGF3YWl0IHVwZGF0ZTtcblxuICAgICAgICAvLyBtYXJrIGNvbXBvbmVudCBhcyB1cGRhdGVkICphZnRlciogdGhlIHVwZGF0ZSB0byBwcmV2ZW50IGluZmludGUgbG9vcHMgaW4gdGhlIHVwZGF0ZSBwcm9jZXNzXG4gICAgICAgIC8vIE4uQi46IGFueSBwcm9wZXJ0eSBjaGFuZ2VzIGR1cmluZyB0aGUgdXBkYXRlIHdpbGwgbm90IHRyaWdnZXIgYW5vdGhlciB1cGRhdGVcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgbmV3IHtAbGluayBfdXBkYXRlUmVxdWVzdH0gYWZ0ZXIgdGhlIHJlc3VsdCBvZiB0aGUgY3VycmVudCB1cGRhdGUgcmVzb2x2ZXNcbiAgICAgICAgcmVzb2x2ZSEoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NoZWR1bGUgdGhlIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNjaGVkdWxlcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYXMgc29vbiBhcyBwb3NzaWJsZSBhbmQgYWxsIGNvbnNlY3V0aXZlIHVwZGF0ZXNcbiAgICAgKiBqdXN0IGJlZm9yZSB0aGUgbmV4dCBmcmFtZS4gSW4gdGhlIGxhdHRlciBjYXNlIGl0IHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgKiB0aGUgdXBkYXRlIGlzIGRvbmUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NjaGVkdWxlVXBkYXRlICgpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzY2hlZHVsZSB0aGUgdXBkYXRlIHZpYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdG8gYXZvaWQgbXVsdGlwbGUgcmVkcmF3cyBwZXIgZnJhbWVcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21wb25lbnQgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEludm9rZXMge0BsaW5rIHVwZGF0ZUNhbGxiYWNrfSBhZnRlciBwZXJmb3JtaW5nIHRoZSB1cGRhdGUgYW5kIGNsZWFucyB1cCB0aGUgY29tcG9uZW50XG4gICAgICogc3RhdGUuIER1cmluZyB0aGUgZmlyc3QgdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVzIHdpbGwgYmUgYWRkZWQuIERpc3BhdGNoZXMgdGhlIHVwZGF0ZVxuICAgICAqIGxpZmVjeWNsZSBldmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcGVyZm9ybVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgLy8gd2UgaGF2ZSB0byB3YWl0IHVudGlsIHRoZSBjb21wb25lbnQgaXMgY29ubmVjdGVkIGJlZm9yZSB3ZSBjYW4gZG8gYW55IHVwZGF0ZXNcbiAgICAgICAgLy8gdGhlIHtAbGluayBjb25uZWN0ZWRDYWxsYmFja30gd2lsbCBjYWxsIHtAbGluayByZXF1ZXN0VXBkYXRlfSBpbiBhbnkgY2FzZSwgc28gd2UgY2FuXG4gICAgICAgIC8vIHNpbXBseSBieXBhc3MgYW55IGFjdHVhbCB1cGRhdGUgYW5kIGNsZWFuLXVwIHVudGlsIHRoZW5cbiAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgY29uc3QgcmVmbGVjdGlvbnMgPSBuZXcgTWFwKHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBuZXcgTWFwKHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBwYXNzIGEgY29weSBvZiB0aGUgcHJvcGVydHkgY2hhbmdlcyB0byB0aGUgdXBkYXRlIG1ldGhvZCwgc28gcHJvcGVydHkgY2hhbmdlc1xuICAgICAgICAgICAgLy8gYXJlIGF2YWlsYWJsZSBpbiBhbiBvdmVycmlkZGVuIHVwZGF0ZSBtZXRob2RcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKGNoYW5nZXMsIHJlZmxlY3Rpb25zLCBub3RpZmljYXRpb25zLCAhdGhpcy5faGFzVXBkYXRlZCk7XG5cbiAgICAgICAgICAgIC8vIHJlc2V0IHByb3BlcnR5IG1hcHMgZGlyZWN0bHkgYWZ0ZXIgdGhlIHVwZGF0ZSwgc28gY2hhbmdlcyBkdXJpbmcgdGhlIHVwZGF0ZUNhbGxiYWNrXG4gICAgICAgICAgICAvLyBjYW4gYmUgcmVjb3JkZWQgZm9yIHRoZSBuZXh0IHVwZGF0ZSwgd2hpY2ggaGFzIHRvIGJlIHRyaWdnZXJlZCBtYW51YWxseSB0aG91Z2hcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayhjaGFuZ2VzLCAhdGhpcy5faGFzVXBkYXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgndXBkYXRlJywgeyBjaGFuZ2VzOiBjaGFuZ2VzLCBmaXJzdFVwZGF0ZTogIXRoaXMuX2hhc1VwZGF0ZWQgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2hhc1VwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyoqXG4gKiBBIHNpbXBsZSBjc3MgdGVtcGxhdGUgbGl0ZXJhbCB0YWdcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIHRhZyBpdHNlbGYgZG9lc24ndCBkbyBhbnl0aGluZyB0aGF0IGFuIHVudGFnZ2VkIHRlbXBsYXRlIGxpdGVyYWwgd291bGRuJ3QgZG8sIGJ1dCBpdCBjYW4gYmUgdXNlZCBieVxuICogZWRpdG9yIHBsdWdpbnMgdG8gaW5mZXIgdGhlIFwidmlydHVhbCBkb2N1bWVudCB0eXBlXCIgdG8gcHJvdmlkZSBjb2RlIGNvbXBsZXRpb24gYW5kIGhpZ2hsaWdodGluZy4gSXQgY291bGRcbiAqIGFsc28gYmUgdXNlZCBpbiB0aGUgZnV0dXJlIHRvIG1vcmUgc2VjdXJlbHkgY29udmVydCBzdWJzdGl0dXRpb25zIGludG8gc3RyaW5ncy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBjb2xvciA9ICdncmVlbic7XG4gKlxuICogY29uc3QgbWl4aW5Cb3ggPSAoYm9yZGVyV2lkdGg6IHN0cmluZyA9ICcxcHgnLCBib3JkZXJDb2xvcjogc3RyaW5nID0gJ3NpbHZlcicpID0+IGNzc2BcbiAqICAgZGlzcGxheTogYmxvY2s7XG4gKiAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gKiAgIGJvcmRlcjogJHtib3JkZXJXaWR0aH0gc29saWQgJHtib3JkZXJDb2xvcn07XG4gKiBgO1xuICpcbiAqIGNvbnN0IG1peGluSG92ZXIgPSAoc2VsZWN0b3I6IHN0cmluZykgPT4gY3NzYFxuICogJHsgc2VsZWN0b3IgfTpob3ZlciB7XG4gKiAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbiAqIH1cbiAqIGA7XG4gKlxuICogY29uc3Qgc3R5bGVzID0gY3NzYFxuICogOmhvc3Qge1xuICogICAtLWhvdmVyLWNvbG9yOiAkeyBjb2xvciB9O1xuICogICBkaXNwbGF5OiBibG9jaztcbiAqICAgJHsgbWl4aW5Cb3goKSB9XG4gKiB9XG4gKiAkeyBtaXhpbkhvdmVyKCc6aG9zdCcpIH1cbiAqIDo6c2xvdHRlZCgqKSB7XG4gKiAgIG1hcmdpbjogMDtcbiAqIH1cbiAqIGA7XG4gKlxuICogLy8gd2lsbCBwcm9kdWNlLi4uXG4gKiA6aG9zdCB7XG4gKiAtLWhvdmVyLWNvbG9yOiBncmVlbjtcbiAqIGRpc3BsYXk6IGJsb2NrO1xuICpcbiAqIGRpc3BsYXk6IGJsb2NrO1xuICogYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAqIGJvcmRlcjogMXB4IHNvbGlkIHNpbHZlcjtcbiAqXG4gKiB9XG4gKlxuICogOmhvc3Q6aG92ZXIge1xuICogYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuICogfVxuICpcbiAqIDo6c2xvdHRlZCgqKSB7XG4gKiBtYXJnaW46IDA7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IGNzcyA9IChsaXRlcmFsczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnN1YnN0aXR1dGlvbnM6IGFueVtdKSA9PiB7XG5cbiAgICByZXR1cm4gc3Vic3RpdHV0aW9ucy5yZWR1Y2UoKHByZXY6IHN0cmluZywgY3VycjogYW55LCBpOiBudW1iZXIpID0+IHByZXYgKyBjdXJyICsgbGl0ZXJhbHNbaSArIDFdLCBsaXRlcmFsc1swXSk7XG59O1xuXG4vLyBjb25zdCBjb2xvciA9ICdncmVlbic7XG5cbi8vIGNvbnN0IG1peGluQm94ID0gKGJvcmRlcldpZHRoOiBzdHJpbmcgPSAnMXB4JywgYm9yZGVyQ29sb3I6IHN0cmluZyA9ICdzaWx2ZXInKSA9PiBjc3NgXG4vLyAgIGRpc3BsYXk6IGJsb2NrO1xuLy8gICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuLy8gICBib3JkZXI6ICR7Ym9yZGVyV2lkdGh9IHNvbGlkICR7Ym9yZGVyQ29sb3J9O1xuLy8gYDtcblxuLy8gY29uc3QgbWl4aW5Ib3ZlciA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBjc3NgXG4vLyAkeyBzZWxlY3RvciB9OmhvdmVyIHtcbi8vICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuLy8gfVxuLy8gYDtcblxuLy8gY29uc3Qgc3R5bGVzID0gY3NzYFxuLy8gOmhvc3Qge1xuLy8gICAtLWhvdmVyLWNvbG9yOiAkeyBjb2xvciB9O1xuLy8gICBkaXNwbGF5OiBibG9jaztcbi8vICAgJHsgbWl4aW5Cb3goKSB9XG4vLyB9XG5cbi8vICR7IG1peGluSG92ZXIoJzpob3N0JykgfVxuXG4vLyA6OnNsb3R0ZWQoKikge1xuLy8gICBtYXJnaW46IDA7XG4vLyB9XG4vLyBgO1xuXG4vLyBjb25zb2xlLmxvZyhzdHlsZXMpO1xuIiwiZXhwb3J0IGNvbnN0IEFycm93VXAgPSAnQXJyb3dVcCc7XG5leHBvcnQgY29uc3QgQXJyb3dEb3duID0gJ0Fycm93RG93bic7XG5leHBvcnQgY29uc3QgQXJyb3dMZWZ0ID0gJ0Fycm93TGVmdCc7XG5leHBvcnQgY29uc3QgQXJyb3dSaWdodCA9ICdBcnJvd1JpZ2h0JztcbmV4cG9ydCBjb25zdCBFbnRlciA9ICdFbnRlcic7XG5leHBvcnQgY29uc3QgRXNjYXBlID0gJ0VzY2FwZSc7XG5leHBvcnQgY29uc3QgU3BhY2UgPSAnICc7XG5leHBvcnQgY29uc3QgVGFiID0gJ1RhYic7XG5leHBvcnQgY29uc3QgQmFja3NwYWNlID0gJ0JhY2tzcGFjZSc7XG5leHBvcnQgY29uc3QgQWx0ID0gJ0FsdCc7XG5leHBvcnQgY29uc3QgU2hpZnQgPSAnU2hpZnQnO1xuZXhwb3J0IGNvbnN0IENvbnRyb2wgPSAnQ29udHJvbCc7XG5leHBvcnQgY29uc3QgTWV0YSA9ICdNZXRhJztcbiIsImltcG9ydCB7IEFycm93RG93biwgQXJyb3dMZWZ0LCBBcnJvd1JpZ2h0LCBBcnJvd1VwIH0gZnJvbSAnLi9rZXlzJztcblxuZXhwb3J0IGludGVyZmFjZSBMaXN0SXRlbSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICBkaXNhYmxlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZlSXRlbUNoYW5nZTxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgQ3VzdG9tRXZlbnQge1xuICAgIHR5cGU6ICdhY3RpdmUtaXRlbS1jaGFuZ2UnO1xuICAgIGRldGFpbDoge1xuICAgICAgICBwcmV2aW91czoge1xuICAgICAgICAgICAgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGl0ZW06IFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIGN1cnJlbnQ6IHtcbiAgICAgICAgICAgIGluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpdGVtOiBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxufVxuXG50eXBlIExpc3RFbnRyeTxUIGV4dGVuZHMgTGlzdEl0ZW0+ID0gW251bWJlciB8IHVuZGVmaW5lZCwgVCB8IHVuZGVmaW5lZF07XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMaXN0S2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZUluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgYWN0aXZlSXRlbTogVCB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBsaXN0ZW5lcnM6IE1hcDxzdHJpbmcsIEV2ZW50TGlzdGVuZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgcHJvdGVjdGVkIGl0ZW1UeXBlOiBhbnk7XG5cbiAgICBwdWJsaWMgaXRlbXM6IFRbXTtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHVibGljIGhvc3Q6IEhUTUxFbGVtZW50LFxuICAgICAgICBpdGVtczogTm9kZUxpc3RPZjxUPixcbiAgICAgICAgcHVibGljIGRpcmVjdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICd2ZXJ0aWNhbCcpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuaXRlbXMgPSBBcnJheS5mcm9tKGl0ZW1zKTtcbiAgICAgICAgdGhpcy5pdGVtVHlwZSA9IHRoaXMuaXRlbXNbMF0gJiYgdGhpcy5pdGVtc1swXS5jb25zdHJ1Y3RvcjtcblxuICAgICAgICB0aGlzLmJpbmRIb3N0KCk7XG4gICAgfVxuXG4gICAgZ2V0QWN0aXZlSXRlbSAoKTogVCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlSXRlbTtcbiAgICB9O1xuXG4gICAgc2V0QWN0aXZlSXRlbSAoaXRlbTogVCwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICBjb25zdCBlbnRyeTogTGlzdEVudHJ5PFQ+ID0gW1xuICAgICAgICAgICAgaW5kZXggPiAtMSA/IGluZGV4IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaW5kZXggPiAtMSA/IGl0ZW0gOiB1bmRlZmluZWRcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKGVudHJ5LCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0TmV4dEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0TmV4dEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRQcmV2aW91c0l0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0UHJldmlvdXNFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0Rmlyc3RJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldEZpcnN0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldExhc3RJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldExhc3RFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBbcHJldiwgbmV4dF0gPSAodGhpcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykgPyBbQXJyb3dMZWZ0LCBBcnJvd1JpZ2h0XSA6IFtBcnJvd1VwLCBBcnJvd0Rvd25dO1xuICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuICAgICAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgcHJldjpcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0UHJldmlvdXNJdGVtQWN0aXZlKHRydWUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIG5leHQ6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldE5leHRJdGVtQWN0aXZlKHRydWUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlZG93biAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICBjb25zdCB0YXJnZXQ6IFQgfCBudWxsID0gZXZlbnQudGFyZ2V0IGFzIFQgfCBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLml0ZW1UeXBlICYmIHRhcmdldCBpbnN0YW5jZW9mIHRoaXMuaXRlbVR5cGUgJiYgIXRhcmdldCEuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldCBhcyBULCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUZvY3VzIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IHRhcmdldDogVCB8IG51bGwgPSBldmVudC50YXJnZXQgYXMgVCB8IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgdGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSAmJiAhdGFyZ2V0IS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZSAocHJldmlvdXNJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgY29uc3QgZXZlbnQ6IEFjdGl2ZUl0ZW1DaGFuZ2U8VD4gPSBuZXcgQ3VzdG9tRXZlbnQoJ2FjdGl2ZS1pdGVtLWNoYW5nZScsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBwcmV2aW91czoge1xuICAgICAgICAgICAgICAgICAgICBpbmRleDogcHJldmlvdXNJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogKHR5cGVvZiBwcmV2aW91c0luZGV4ID09PSAnbnVtYmVyJykgPyB0aGlzLml0ZW1zW3ByZXZpb3VzSW5kZXhdIDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiB0aGlzLmFjdGl2ZUluZGV4LFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiB0aGlzLmFjdGl2ZUl0ZW1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pIGFzIEFjdGl2ZUl0ZW1DaGFuZ2U8VD47XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0RW50cnlBY3RpdmUgKGVudHJ5OiBMaXN0RW50cnk8VD4sIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBbdGhpcy5hY3RpdmVJbmRleCwgdGhpcy5hY3RpdmVJdGVtXSA9IGVudHJ5O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXROZXh0RW50cnkgKGZyb21JbmRleD86IG51bWJlcik6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgZnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgPyBmcm9tSW5kZXhcbiAgICAgICAgICAgIDogKHR5cGVvZiB0aGlzLmFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlSW5kZXhcbiAgICAgICAgICAgICAgICA6IC0xO1xuXG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuaXRlbXMubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IG5leHRJbmRleCA9IGZyb21JbmRleCArIDE7XG4gICAgICAgIGxldCBuZXh0SXRlbSA9IHRoaXMuaXRlbXNbbmV4dEluZGV4XTtcblxuICAgICAgICB3aGlsZSAobmV4dEluZGV4IDwgbGFzdEluZGV4ICYmIG5leHRJdGVtICYmIG5leHRJdGVtLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIG5leHRJdGVtID0gdGhpcy5pdGVtc1srK25leHRJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG5leHRJdGVtICYmICFuZXh0SXRlbS5kaXNhYmxlZCkgPyBbbmV4dEluZGV4LCBuZXh0SXRlbV0gOiBbdGhpcy5hY3RpdmVJbmRleCwgdGhpcy5hY3RpdmVJdGVtXTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0UHJldmlvdXNFbnRyeSAoZnJvbUluZGV4PzogbnVtYmVyKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICBmcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICA/IGZyb21JbmRleFxuICAgICAgICAgICAgOiAodHlwZW9mIHRoaXMuYWN0aXZlSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmVJbmRleFxuICAgICAgICAgICAgICAgIDogMDtcblxuICAgICAgICBsZXQgcHJldkluZGV4ID0gZnJvbUluZGV4IC0gMTtcbiAgICAgICAgbGV0IHByZXZJdGVtID0gdGhpcy5pdGVtc1twcmV2SW5kZXhdO1xuXG4gICAgICAgIHdoaWxlIChwcmV2SW5kZXggPiAwICYmIHByZXZJdGVtICYmIHByZXZJdGVtLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIHByZXZJdGVtID0gdGhpcy5pdGVtc1stLXByZXZJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKHByZXZJdGVtICYmICFwcmV2SXRlbS5kaXNhYmxlZCkgPyBbcHJldkluZGV4LCBwcmV2SXRlbV0gOiBbdGhpcy5hY3RpdmVJbmRleCwgdGhpcy5hY3RpdmVJdGVtXTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0Rmlyc3RFbnRyeSAoKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXROZXh0RW50cnkoLTEpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRMYXN0RW50cnkgKCk6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJldmlvdXNFbnRyeSh0aGlzLml0ZW1zLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGJpbmRIb3N0ICgpIHtcblxuICAgICAgICAvLyBUT0RPOiBlbmFibGUgcmVjb25uZWN0aW5nIHRoZSBob3N0IGVsZW1lbnQ/IG5vIG5lZWQgaWYgRm9jdXNNYW5hZ2VyIGlzIGNyZWF0ZWQgaW4gY29ubmVjdGVkQ2FsbGJhY2tcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgTWFwKFtcbiAgICAgICAgICAgIFsnZm9jdXNpbicsIHRoaXMuaGFuZGxlRm9jdXMuYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5ZG93bi5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydtb3VzZWRvd24nLCB0aGlzLmhhbmRsZU1vdXNlZG93bi5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydkaXNjb25uZWN0ZWQnLCB0aGlzLnVuYmluZEhvc3QuYmluZCh0aGlzKV1cbiAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIsIGV2ZW50KSA9PiB0aGlzLmhvc3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgdW5iaW5kSG9zdCAoKSB7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIsIGV2ZW50KSA9PiB0aGlzLmhvc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGb2N1c0tleU1hbmFnZXI8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIExpc3RLZXlNYW5hZ2VyPFQ+IHtcblxuICAgIHByb3RlY3RlZCBzZXRFbnRyeUFjdGl2ZSAoZW50cnk6IExpc3RFbnRyeTxUPiwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHN1cGVyLnNldEVudHJ5QWN0aXZlKGVudHJ5LCBpbnRlcmFjdGl2ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlSXRlbSAmJiBpbnRlcmFjdGl2ZSkgdGhpcy5hY3RpdmVJdGVtLmZvY3VzKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuQGNvbXBvbmVudDxJY29uPih7XG4gICAgc2VsZWN0b3I6ICd1aS1pY29uJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgd2lkdGg6IHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSk7XG4gICAgICAgIGhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgcGFkZGluZzogY2FsYygodmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKSAtIHZhcigtLWZvbnQtc2l6ZSwgMWVtKSkgLyAyKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgdmVydGljYWwtYWxpZ246IGJvdHRvbTtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICB9XG4gICAgc3ZnIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgb3ZlcmZsb3c6IHZpc2libGU7XG4gICAgICAgIGZpbGw6IHZhcigtLWljb24tY29sb3IsIGN1cnJlbnRDb2xvcik7XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD11bmldKSB7XG4gICAgICAgIHBhZGRpbmc6IDBlbTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PW1hdF0pIHtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PWVpXSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKGVsZW1lbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0ID0gZWxlbWVudC5zZXQ7XG4gICAgICAgIGNvbnN0IGljb24gPSAoc2V0ID09PSAnbWF0JylcbiAgICAgICAgICAgID8gYGljXyR7IGVsZW1lbnQuaWNvbiB9XzI0cHhgXG4gICAgICAgICAgICA6IChzZXQgPT09ICdlaScpXG4gICAgICAgICAgICAgICAgPyBgZWktJHsgZWxlbWVudC5pY29uIH0taWNvbmBcbiAgICAgICAgICAgICAgICA6IGVsZW1lbnQuaWNvbjtcblxuICAgICAgICByZXR1cm4gaHRtbGBcbiAgICAgICAgPHN2ZyBmb2N1c2FibGU9XCJmYWxzZVwiPlxuICAgICAgICAgICAgPHVzZSBocmVmPVwiJHsgKGVsZW1lbnQuY29uc3RydWN0b3IgYXMgdHlwZW9mIEljb24pLmdldFNwcml0ZShzZXQpIH0jJHsgaWNvbiB9XCJcbiAgICAgICAgICAgIHhsaW5rOmhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIiAvPlxuICAgICAgICA8L3N2Zz5gO1xuICAgIH1cbn0pXG5leHBvcnQgY2xhc3MgSWNvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBmb3IgY2FjaGluZyBhbiBpY29uIHNldCdzIHNwcml0ZSB1cmxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9zcHJpdGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBzdmcgc3ByaXRlIHVybCBmb3IgdGhlIHJlcXVlc3RlZCBpY29uIHNldFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgc3ByaXRlIHVybCBmb3IgYW4gaWNvbiBzZXQgY2FuIGJlIHNldCB0aHJvdWdoIGEgYG1ldGFgIHRhZyBpbiB0aGUgaHRtbCBkb2N1bWVudC4gWW91IGNhbiBkZWZpbmVcbiAgICAgKiBjdXN0b20gaWNvbiBzZXRzIGJ5IGNob3NpbmcgYW4gaWRlbnRpZmllciAoc3VjaCBhcyBgOm15c2V0YCBpbnN0ZWFkIG9mIGA6ZmFgLCBgOm1hdGAgb3IgYDppZWApIGFuZFxuICAgICAqIGNvbmZpZ3VyaW5nIGl0cyBsb2NhdGlvbi5cbiAgICAgKlxuICAgICAqIGBgYGh0bWxcbiAgICAgKiA8IWRvY3R5cGUgaHRtbD5cbiAgICAgKiA8aHRtbD5cbiAgICAgKiAgICA8aGVhZD5cbiAgICAgKiAgICA8IS0tIHN1cHBvcnRzIG11bHRpcGxlIHN2ZyBzcHJpdGVzIC0tPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6ZmFcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvZm9udC1hd2Vzb21lL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6bWF0XCIgY29udGVudD1cImFzc2V0cy9pY29ucy9zcHJpdGVzL21hdGVyaWFsL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6ZWlcIiBjb250ZW50PVwiYXNzZXRzL2ljb24vc3ByaXRlcy9ldmlsLWljb25zL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgY3VzdG9tIHN2ZyBzcHJpdGVzIC0tPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6bXlzZXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb24vc3ByaXRlcy9teXNldC9teV9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8L2hlYWQ+XG4gICAgICogICAgLi4uXG4gICAgICogPC9odG1sPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogV2hlbiB1c2luZyB0aGUgaWNvbiBlbGVtZW50LCBzcGVjaWZ5IHlvdXIgY3VzdG9tIGljb24gc2V0LlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhLS0gdXNlIGF0dHJpYnV0ZXMgLS0+XG4gICAgICogPHVpLWljb24gZGF0YS1pY29uPVwibXlfaWNvbl9pZFwiIGRhdGEtc2V0PVwibXlzZXRcIj48L3VpLWljb24+XG4gICAgICogPCEtLSBvciB1c2UgcHJvcGVydHkgYmluZGluZ3Mgd2l0aGluIGxpdC1odG1sIHRlbXBsYXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiAuaWNvbj0keydteV9pY29uX2lkJ30gLnNldD0keydteXNldCd9PjwvdWktaWNvbj5cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIElmIG5vIHNwcml0ZSB1cmwgaXMgc3BlY2lmaWVkIGZvciBhIHNldCwgdGhlIGljb24gZWxlbWVudCB3aWxsIGF0dGVtcHQgdG8gdXNlIGFuIHN2ZyBpY29uIGZyb21cbiAgICAgKiBhbiBpbmxpbmVkIHN2ZyBlbGVtZW50IGluIHRoZSBjdXJyZW50IGRvY3VtZW50LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgZ2V0U3ByaXRlIChzZXQ6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9zcHJpdGVzLmhhcyhzZXQpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtZXRhW25hbWU9XCJ1aS1pY29uOnNwcml0ZTokeyBzZXQgfVwiXVtjb250ZW50XWApO1xuXG4gICAgICAgICAgICBpZiAobWV0YSkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlcy5zZXQoc2V0LCBtZXRhLmdldEF0dHJpYnV0ZSgnY29udGVudCcpISk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3ByaXRlcy5nZXQoc2V0KSB8fCAnJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLWljb24nXG4gICAgfSlcbiAgICBpY29uID0gJ2luZm8nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnZGF0YS1zZXQnXG4gICAgfSlcbiAgICBzZXQgPSAnZmEnXG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncm9sZScsICdpbWcnKTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0ICcuLi9pY29uL2ljb24nO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi4va2V5cyc7XG5cbkBjb21wb25lbnQ8QWNjb3JkaW9uSGVhZGVyPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY2NvcmRpb24taGVhZGVyJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBhbGw6IGluaGVyaXQ7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93O1xuICAgICAgICBmbGV4OiAxIDEgMTAwJTtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgICBwYWRkaW5nOiAxcmVtO1xuICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1kaXNhYmxlZD10cnVlXSkge1xuICAgICAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWV4cGFuZGVkPXRydWVdKSA+IHVpLWljb24uZXhwYW5kLFxuICAgIDpob3N0KFthcmlhLWV4cGFuZGVkPWZhbHNlXSkgPiB1aS1pY29uLmNvbGxhcHNlIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IGVsZW1lbnQgPT4gaHRtbGBcbiAgICA8c2xvdD48L3Nsb3Q+XG4gICAgPHVpLWljb24gY2xhc3M9XCJjb2xsYXBzZVwiIGRhdGEtaWNvbj1cIm1pbnVzXCIgZGF0YS1zZXQ9XCJ1bmlcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3VpLWljb24+XG4gICAgPHVpLWljb24gY2xhc3M9XCJleHBhbmRcIiBkYXRhLWljb249XCJwbHVzXCIgZGF0YS1zZXQ9XCJ1bmlcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3VpLWljb24+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25IZWFkZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1kaXNhYmxlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW5cbiAgICB9KVxuICAgIGdldCBkaXNhYmxlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdmFsdWUgPyBudWxsIDogMDtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWV4cGFuZGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtY29udHJvbHMnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZ1xuICAgIH0pXG4gICAgY29udHJvbHMhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZ1xuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCE6IG51bWJlciB8IG51bGw7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnYnV0dG9uJztcbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogMDtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2tleWRvd24nXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBFbnRlciB8fCBldmVudC5rZXkgPT09IFNwYWNlKSB7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IGh0bWwsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5leHBvcnQgdHlwZSBDb3B5cmlnaHRIZWxwZXIgPSAoZGF0ZTogRGF0ZSwgYXV0aG9yOiBzdHJpbmcpID0+IFRlbXBsYXRlUmVzdWx0O1xuXG5leHBvcnQgY29uc3QgY29weXJpZ2h0OiBDb3B5cmlnaHRIZWxwZXIgPSAoZGF0ZTogRGF0ZSwgYXV0aG9yOiBzdHJpbmcpOiBUZW1wbGF0ZVJlc3VsdCA9PiB7XG5cbiAgICByZXR1cm4gaHRtbGAmY29weTsgQ29weXJpZ2h0ICR7IGRhdGUuZ2V0RnVsbFllYXIoKSB9ICR7IGF1dGhvci50cmltKCkgfWA7XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBjb3B5cmlnaHQsIENvcHlyaWdodEhlbHBlciB9IGZyb20gJy4uL2hlbHBlcnMvY29weXJpZ2h0JztcbmltcG9ydCB7IEFjY29yZGlvbkhlYWRlciB9IGZyb20gJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5cbmxldCBuZXh0QWNjb3JkaW9uUGFuZWxJZCA9IDA7XG5cbkBjb21wb25lbnQ8QWNjb3JkaW9uUGFuZWw+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1wYW5lbCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWhlYWRlciB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93O1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24tYm9keSB7XG4gICAgICAgIGhlaWdodDogYXV0bztcbiAgICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICAgIHRyYW5zaXRpb246IGhlaWdodCAuMnMgZWFzZS1vdXQ7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5W2FyaWEtaGlkZGVuPXRydWVdIHtcbiAgICAgICAgaGVpZ2h0OiAwO1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cbiAgICAuY29weXJpZ2h0IHtcbiAgICAgICAgcGFkZGluZzogMCAxcmVtIDFyZW07XG4gICAgICAgIGNvbG9yOiB2YXIoLS1kaXNhYmxlZC1jb2xvciwgJyNjY2MnKTtcbiAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKHBhbmVsLCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlcikgPT4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWhlYWRlclwiXG4gICAgICAgIHJvbGU9XCJoZWFkaW5nXCJcbiAgICAgICAgYXJpYS1sZXZlbD1cIiR7IHBhbmVsLmxldmVsIH1cIlxuICAgICAgICBAY2xpY2s9JHsgcGFuZWwudG9nZ2xlIH0+XG4gICAgICAgIDxzbG90IG5hbWU9XCJoZWFkZXJcIj48L3Nsb3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInVpLWFjY29yZGlvbi1ib2R5XCJcbiAgICAgICAgaWQ9XCIkeyBwYW5lbC5pZCB9LWJvZHlcIlxuICAgICAgICBzdHlsZT1cImhlaWdodDogJHsgcGFuZWwuY29udGVudEhlaWdodCB9O1wiXG4gICAgICAgIHJvbGU9XCJyZWdpb25cIlxuICAgICAgICBhcmlhLWhpZGRlbj1cIiR7ICFwYW5lbC5leHBhbmRlZCB9XCJcbiAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiJHsgcGFuZWwuaWQgfS1oZWFkZXJcIj5cbiAgICAgICAgPHNsb3Q+PC9zbG90PlxuICAgICAgICA8c3BhbiBjbGFzcz1cImNvcHlyaWdodFwiPiR7IGNvcHlyaWdodChuZXcgRGF0ZSgpLCAnQWxleGFuZGVyIFdlbmRlJykgfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvblBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBfaGVhZGVyOiBBY2NvcmRpb25IZWFkZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgX2JvZHk6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IGNvbnRlbnRIZWlnaHQgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgcmV0dXJuICF0aGlzLmV4cGFuZGVkID9cbiAgICAgICAgICAgICcwcHgnIDpcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgP1xuICAgICAgICAgICAgICAgIGAkeyB0aGlzLl9ib2R5LnNjcm9sbEhlaWdodCB9cHhgIDpcbiAgICAgICAgICAgICAgICAnYXV0byc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIGxldmVsID0gMTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICAgIH0pXG4gICAgZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICAgIH0pXG4gICAgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yICgpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IGB1aS1hY2NvcmRpb24tcGFuZWwtJHsgbmV4dEFjY29yZGlvblBhbmVsSWQrKyB9YDtcbiAgICB9XG5cbiAgICB0b2dnbGUgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gd3JhcHBpbmcgdGhlIHByb3BlcnR5IGNoYW5nZSBpbiB0aGUgd2F0Y2ggbWV0aG9kIHdpbGwgZGlzcGF0Y2ggYSBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9oZWFkZXIpIHRoaXMuX2hlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0SGVhZGVyKHRoaXMucXVlcnlTZWxlY3RvcihBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSwgd2UgcXVlcnkgdGhlIGFjY29yZGlvbi1wYW5lbC1ib2R5XG4gICAgICAgICAgICB0aGlzLl9ib2R5ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoYCMkeyB0aGlzLmlkIH0tYm9keWApO1xuXG4gICAgICAgICAgICAvLyBoYXZpbmcgcXVlcmllZCB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHksIHtAbGluayBjb250ZW50SGVpZ2h0fSBjYW4gbm93IGNhbGN1bGF0ZSB0aGVcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaGVpZ2h0IG9mIHRoZSBwYW5lbCBib2R5IGZvciBhbmltYXRpb25cbiAgICAgICAgICAgIC8vIGluIG9yZGVyIHRvIHJlLWV2YWx1YXRlIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nIGZvciB7QGxpbmsgY29udGVudEhlaWdodH0gd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gdHJpZ2dlciBhbm90aGVyIHJlbmRlciAodGhpcyBpcyBjaGVhcCwgb25seSBjb250ZW50SGVpZ2h0IGhhcyBjaGFuZ2VkIGFuZCB3aWxsIGJlIHVwZGF0ZWQpXG4gICAgICAgICAgICAvLyBob3dldmVyIHdlIGNhbm5vdCByZXF1ZXN0IGFub3RoZXIgdXBkYXRlIHdoaWxlIHdlIGFyZSBzdGlsbCBpbiB0aGUgY3VycmVudCB1cGRhdGUgY3ljbGVcbiAgICAgICAgICAgIC8vIHVzaW5nIGEgUHJvbWlzZSwgd2UgY2FuIGRlZmVyIHJlcXVlc3RpbmcgdGhlIHVwZGF0ZSB1bnRpbCBhZnRlciB0aGUgY3VycmVudCB1cGRhdGUgaXMgZG9uZVxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHRydWUpLnRoZW4oKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIHJlbmRlciBtZXRob2QgdG8gaW5qZWN0IGN1c3RvbSBoZWxwZXJzIGludG8gdGhlIHRlbXBsYXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoKSB7XG5cbiAgICAgICAgc3VwZXIucmVuZGVyKGNvcHlyaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEhlYWRlciAoaGVhZGVyOiBBY2NvcmRpb25IZWFkZXIgfCBudWxsKSB7XG5cbiAgICAgICAgdGhpcy5faGVhZGVyID0gaGVhZGVyO1xuXG4gICAgICAgIGlmICghaGVhZGVyKSByZXR1cm47XG5cbiAgICAgICAgaGVhZGVyLnNldEF0dHJpYnV0ZSgnc2xvdCcsICdoZWFkZXInKTtcblxuICAgICAgICBoZWFkZXIuaWQgPSBoZWFkZXIuaWQgfHwgYCR7IHRoaXMuaWQgfS1oZWFkZXJgO1xuICAgICAgICBoZWFkZXIuY29udHJvbHMgPSBgJHsgdGhpcy5pZCB9LWJvZHlgO1xuICAgICAgICBoZWFkZXIuZXhwYW5kZWQgPSB0aGlzLmV4cGFuZGVkO1xuICAgICAgICBoZWFkZXIuZGlzYWJsZWQgPSB0aGlzLmRpc2FibGVkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBGb2N1c0tleU1hbmFnZXIgfSBmcm9tICcuLi9saXN0LWtleS1tYW5hZ2VyJztcbmltcG9ydCAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCB7IEFjY29yZGlvbkhlYWRlciB9IGZyb20gJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5pbXBvcnQgJy4vYWNjb3JkaW9uLXBhbmVsJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS1hY2NvcmRpb24nLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICAgIGJhY2tncm91bmQtY2xpcDogYm9yZGVyLWJveDtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGBcbiAgICA8c2xvdD48L3Nsb3Q+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb24gZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIGZvY3VzTWFuYWdlciE6IEZvY3VzS2V5TWFuYWdlcjxBY2NvcmRpb25IZWFkZXI+O1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgcmVmbGVjdEF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIHJvbGUgPSAncHJlc2VudGF0aW9uJztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgICAgIHRoaXMuZm9jdXNNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLCB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoQWNjb3JkaW9uSGVhZGVyLnNlbGVjdG9yKSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgY3NzIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcblxuZXhwb3J0IGNvbnN0IHN0eWxlcyA9IGNzc2BcbmRlbW8tYXBwIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbn1cblxuaGVhZGVyIHtcbiAgZmxleDogMCAwIGF1dG87XG59XG5cbm1haW4ge1xuICBmbGV4OiAxIDEgYXV0bztcbiAgcGFkZGluZzogMXJlbTtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgb3ZlcmZsb3c6IGF1dG87XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMTVyZW0sIDFmcikpO1xuICBncmlkLWdhcDogMXJlbTtcbn1cblxuLmljb25zIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1mbG93OiByb3cgd3JhcDtcbn1cblxuLnNldHRpbmdzLWxpc3Qge1xuICBwYWRkaW5nOiAwO1xuICBsaXN0LXN0eWxlOiBub25lO1xufVxuXG4uc2V0dGluZ3MtbGlzdCBsaSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2Vlbjtcbn1cblxudWktY2FyZCB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24ge1xuICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsOm5vdCg6Zmlyc3QtY2hpbGQpIHtcbiAgYm9yZGVyLXRvcDogdmFyKC0tYm9yZGVyLXdpZHRoKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWwgaDMge1xuICBtYXJnaW46IDFyZW07XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBwIHtcbiAgbWFyZ2luOiAxcmVtO1xufVxuYDtcbiIsImltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBBcHAgfSBmcm9tICcuL2FwcCc7XG5cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZSA9IChlbGVtZW50OiBBcHApID0+IGh0bWxgXG4gICAgPGhlYWRlcj5cbiAgICAgICAgPGgxPkV4YW1wbGVzPC9oMT5cbiAgICA8L2hlYWRlcj5cblxuICAgIDxtYWluPlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+SWNvbjwvaDI+XG5cbiAgICAgICAgICAgIDxoMz5Gb250IEF3ZXNvbWU8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbi1yaWdodCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2stb3BlbicgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BhaW50LWJydXNoJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoLWFsdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2V4Y2xhbWF0aW9uLXRyaWFuZ2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaW5mby1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdxdWVzdGlvbi1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXInIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5Vbmljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2FuZ2xlLXJpZ2h0LWInIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndW5sb2NrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2JydXNoLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXInIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5NYXRlcmlhbCBJY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uX3JpZ2h0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ21haWwnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrX29wZW4nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZWRpdCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjbGVhcicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdkZWxldGUnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnd2FybmluZycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2hlbHAnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYWNjb3VudF9jaXJjbGUnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVyc29uJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+RXZpbCBJY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndW5sb2NrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFwZXJjbGlwJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuY2lsJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjbG9zZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24nIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdxdWVzdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXInIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMj5DaGVja2JveDwvaDI+XG4gICAgICAgICAgICA8dWktY2hlY2tib3ggLmNoZWNrZWQ9JHsgdHJ1ZSB9PjwvdWktY2hlY2tib3g+XG5cbiAgICAgICAgICAgIDxoMj5Ub2dnbGU8L2gyPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwic2V0dGluZ3MtbGlzdFwiPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJub3RpZnktZW1haWxcIj5Ob3RpZmljYXRpb24gZW1haWw8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgbGFiZWwtb249XCJ5ZXNcIiBsYWJlbC1vZmY9XCJub1wiIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeS1lbWFpbFwiIGFyaWEtY2hlY2tlZD1cInRydWVcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJub3RpZnktc21zXCI+Tm90aWZpY2F0aW9uIHNtczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LXNtc1wiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwic2V0dGluZ3MtbGlzdFwiPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJub3RpZnlcIj5Ob3RpZmljYXRpb25zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeVwiIGFyaWEtY2hlY2tlZD1cInRydWVcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5DYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5BY3Rpb24gQ2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktYWN0aW9uLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktYWN0aW9uLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxidXR0b24gc2xvdD1cInVpLWFjdGlvbi1jYXJkLWFjdGlvbnNcIj5Nb3JlPC9idXR0b24+XG4gICAgICAgICAgICA8L3VpLWFjdGlvbi1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+UGxhaW4gQ2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktcGxhaW4tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWZvb3RlclwiPkNhcmQgZm9vdGVyPC9wPlxuICAgICAgICAgICAgPC91aS1wbGFpbi1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+VGFiczwvaDI+XG4gICAgICAgICAgICA8dWktdGFiLWxpc3Q+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0xXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0xXCI+PHNwYW4+Rmlyc3QgVGFiPC9zcGFuPjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItMlwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtMlwiPlNlY29uZCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTNcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTNcIiBhcmlhLWRpc2FibGVkPVwidHJ1ZVwiPlRoaXJkIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItNFwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtNFwiPkZvdXJ0aCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgIDwvdWktdGFiLWxpc3Q+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTFcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rmlyc3QgVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC4gTGF1ZGVtXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm8gcmVjdXNhYm8gYW5cbiAgICAgICAgICAgICAgICAgICAgZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMlwiPlxuICAgICAgICAgICAgICAgIDxoMz5TZWNvbmQgVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5JbiBjbGl0YSB0b2xsaXQgbWluaW11bSBxdW8sIGFuIGFjY3VzYXRhIHZvbHV0cGF0IGV1cmlwaWRpcyB2aW0uIEZlcnJpIHF1aWRhbSBkZWxlbml0aSBxdW8gZWEsIGR1b1xuICAgICAgICAgICAgICAgICAgICBhbmltYWwgYWNjdXNhbXVzIGV1LCBjaWJvIGVycm9yaWJ1cyBldCBtZWEuIEV4IGVhbSB3aXNpIGFkbW9kdW0gcHJhZXNlbnQsIGhhcyBjdSBvYmxpcXVlIGNldGVyb3NcbiAgICAgICAgICAgICAgICAgICAgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuIGVzdCwgZXQgYXV0ZW1cbiAgICAgICAgICAgICAgICAgICAgb21uZXMgY2l2aWJ1cyBtZWwuIE1lbCBldSB1YmlxdWUgZXF1aWRlbSBtb2xlc3RpYWUsIGNob3JvIGRvY2VuZGkgbW9kZXJhdGl1cyBlaSBuYW0uPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTNcIj5cbiAgICAgICAgICAgICAgICA8aDM+VGhpcmQgVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5JJ20gZGlzYWJsZWQsIHlvdSBzaG91bGRuJ3Qgc2VlIG1lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC00XCI+XG4gICAgICAgICAgICAgICAgPGgzPkZvdXJ0aCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkFjY29yZGlvbjwvaDI+XG5cbiAgICAgICAgICAgIDx1aS1hY2NvcmRpb24+XG5cbiAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLXBhbmVsIGlkPVwiY3VzdG9tLXBhbmVsLWlkXCIgZXhwYW5kZWQgbGV2ZWw9XCIzXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1oZWFkZXI+UGFuZWwgT25lPC91aS1hY2NvcmRpb24taGVhZGVyPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LlxuICAgICAgICAgICAgICAgICAgICAgICAgTGF1ZGVtIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3VzYWJvIGFuIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD5BdCB1c3UgZXBpY3VyZWkgYXNzZW50aW9yLCBwdXRlbnQgZGlzc2VudGlldCByZXB1ZGlhbmRhZSBlYSBxdW8uIFBybyBuZSBkZWJpdGlzIHBsYWNlcmF0XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduaWZlcnVtcXVlLCBpbiBzb25ldCB2b2x1bXVzIGludGVycHJldGFyaXMgY3VtLiBEb2xvcnVtIGFwcGV0ZXJlIG5lIHF1by4gRGljdGEgcXVhbGlzcXVlIGVvc1xuICAgICAgICAgICAgICAgICAgICAgICAgZWEsIGVhbSBhdCBudWxsYSB0YW1xdWFtLlxuICAgICAgICAgICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgICAgICA8L3VpLWFjY29yZGlvbi1wYW5lbD5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgbGV2ZWw9XCIzXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1oZWFkZXI+UGFuZWwgVHdvPC91aS1hY2NvcmRpb24taGVhZGVyPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1byBhbmltYWwgYWNjdXNhbXVzIGV1LCBjaWJvIGVycm9yaWJ1cyBldCBtZWEuIEV4IGVhbSB3aXNpIGFkbW9kdW0gcHJhZXNlbnQsIGhhcyBjdSBvYmxpcXVlXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXRlcm9zIGVsZWlmZW5kLiBFeCBtZWwgcGxhdG9uZW0gYXNzZW50aW9yIHBlcnNlcXVlcmlzLCB2aXggY2libyBsaWJyaXMgdXQuIEFkIHRpbWVhbSBhY2N1bXNhblxuICAgICAgICAgICAgICAgICAgICAgICAgZXN0LCBldCBhdXRlbSBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW0uPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD5RdWkgc3VhcyBzb2xldCBjZXRlcm9zIGN1LCBwZXJ0aW5heCB2dWxwdXRhdGUgZGV0ZXJydWlzc2V0IGVvcyBuZS4gTmUgaXVzIHZpZGUgbnVsbGFtLCBhbGllbnVtXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhZSByZWZvcm1pZGFucyBjdW0gYWQuIEVhIG1lbGlvcmUgc2FwaWVudGVtIGludGVycHJldGFyaXMgZWFtLiBDb21tdW5lIGRlbGljYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICByZXB1ZGlhbmRhZSBpbiBlb3MsIHBsYWNlcmF0IGluY29ycnVwdGUgZGVmaW5pdGlvbmVzIG5lYyBleC4gQ3UgZWxpdHIgdGFudGFzIGluc3RydWN0aW9yIHNpdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV1IGV1bSBhbGlhIGdyYWVjZSBuZWdsZWdlbnR1ci48L3A+XG5cbiAgICAgICAgICAgICAgICA8L3VpLWFjY29yZGlvbi1wYW5lbD5cblxuICAgICAgICAgICAgPC91aS1hY2NvcmRpb24+XG5cbiAgICAgICAgICAgIDxvdmVybGF5LWRlbW8+PC9vdmVybGF5LWRlbW8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgPC9tYWluPlxuICAgIGA7XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuLy8gd2UgY2FuIGRlZmluZSBtaXhpbnMgYXNcbmNvbnN0IG1peGluQ29udGFpbmVyOiAoYmFja2dyb3VuZD86IHN0cmluZykgPT4gc3RyaW5nID0gKGJhY2tncm91bmQ6IHN0cmluZyA9ICcjZmZmJykgPT4gY3NzYFxuICAgIGJhY2tncm91bmQ6ICR7IGJhY2tncm91bmQgfTtcbiAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbmA7XG5cbmNvbnN0IHN0eWxlID0gY3NzYFxuOmhvc3Qge1xuICAgIC0tbWF4LXdpZHRoOiA0MGNoO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1mbG93OiBjb2x1bW47XG4gICAgbWF4LXdpZHRoOiB2YXIoLS1tYXgtd2lkdGgpO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgLyogd2UgY2FuIGFwcGx5IG1peGlucyB3aXRoIHNwcmVhZCBzeW50YXggKi9cbiAgICAkeyBtaXhpbkNvbnRhaW5lcigpIH1cbn1cbjo6c2xvdHRlZCgqKSB7XG4gICAgbWFyZ2luOiAwO1xufVxuYDtcblxuQGNvbXBvbmVudDxDYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1jYXJkJyxcbiAgICBzdHlsZXM6IFtzdHlsZV0sXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1oZWFkZXJcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1mb290ZXJcIj48L3Nsb3Q+XG4gICAgPGRpdj5Xb3JrZXIgY291bnRlcjogJHsgY2FyZC5jb3VudGVyIH08L2Rpdj5cbiAgICA8YnV0dG9uPlN0b3Agd29ya2VyPC9idXR0b24+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDYXJkIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIhOiBudW1iZXI7XG5cbiAgICB3b3JrZXIhOiBXb3JrZXI7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnY2xpY2snLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSE7IH1cbiAgICB9KVxuICAgIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnbWVzc2FnZScsXG4gICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy53b3JrZXI7IH1cbiAgICB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKGV2ZW50OiBNZXNzYWdlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY291bnRlciA9IGV2ZW50LmRhdGEpO1xuICAgIH1cbn1cblxuQGNvbXBvbmVudDxBY3Rpb25DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY3Rpb24tY2FyZCcsXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2FyZCBleHRlbmRzIENhcmQge1xuXG4gICAgLy8gd2UgY2FuIGluaGVyaXQgc3R5bGVzIGV4cGxpY2l0bHlcbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICAgICAgICAnc2xvdFtuYW1lPXVpLWFjdGlvbi1jYXJkLWFjdGlvbnNdIHsgZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IHJpZ2h0OyB9J1xuICAgICAgICBdXG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6IG51bGwgfSlcbiAgICBoYW5kbGVDbGljayAoKSB7IH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlTWVzc2FnZSAoKSB7IH1cbn1cblxuQGNvbXBvbmVudDxQbGFpbkNhcmQ+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXBsYWluLWNhcmQnLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgOmhvc3Qge1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBtYXgtd2lkdGg6IDQwY2g7XG4gICAgICAgIH1gXG4gICAgXVxuICAgIC8vIGlmIHdlIGRvbid0IHNwZWNpZnkgYSB0ZW1wbGF0ZSwgaXQgd2lsbCBiZSBpbmhlcml0ZWRcbn0pXG5leHBvcnQgY2xhc3MgUGxhaW5DYXJkIGV4dGVuZHMgQ2FyZCB7IH1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIGNvbXBvbmVudCwgQ29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgfVxuICAgICAgICAuY2hlY2stbWFyayB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDAuMjVyZW07XG4gICAgICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDAuNjI1cmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMCAwIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBTaXplIHtcbiAgICB3aWR0aDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIGhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIG1heFdpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG4gICAgbWF4SGVpZ2h0OiBudW1iZXIgfCBzdHJpbmc7XG4gICAgbWluV2lkdGg6IG51bWJlciB8IHN0cmluZztcbiAgICBtaW5IZWlnaHQ6IG51bWJlciB8IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1NpemVDaGFuZ2VkIChzaXplPzogUGFydGlhbDxTaXplPiwgb3RoZXI/OiBQYXJ0aWFsPFNpemU+KTogYm9vbGVhbiB7XG5cbiAgICBpZiAoc2l6ZSAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBzaXplLndpZHRoICE9PSBvdGhlci53aWR0aFxuICAgICAgICAgICAgfHwgc2l6ZS5oZWlnaHQgIT09IG90aGVyLmhlaWdodFxuICAgICAgICAgICAgfHwgc2l6ZS5tYXhXaWR0aCAhPT0gb3RoZXIubWF4V2lkdGhcbiAgICAgICAgICAgIHx8IHNpemUubWF4SGVpZ2h0ICE9PSBvdGhlci5tYXhIZWlnaHRcbiAgICAgICAgICAgIHx8IHNpemUubWluV2lkdGggIT09IG90aGVyLm1pbldpZHRoXG4gICAgICAgICAgICB8fCBzaXplLm1pbkhlaWdodCAhPT0gb3RoZXIubWluSGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiBzaXplICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IE9mZnNldCwgaGFzT2Zmc2V0Q2hhbmdlZCB9IGZyb20gJy4vb2Zmc2V0JztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi9wb3NpdGlvbic7XG5cbmV4cG9ydCB0eXBlIEFsaWdubWVudE9wdGlvbiA9ICdzdGFydCcgfCAnY2VudGVyJyB8ICdlbmQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFsaWdubWVudCB7XG4gICAgaG9yaXpvbnRhbDogQWxpZ25tZW50T3B0aW9uO1xuICAgIHZlcnRpY2FsOiBBbGlnbm1lbnRPcHRpb247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxpZ25tZW50UGFpciB7XG4gICAgb3JpZ2luOiBBbGlnbm1lbnQ7XG4gICAgdGFyZ2V0OiBBbGlnbm1lbnQ7XG4gICAgb2Zmc2V0PzogT2Zmc2V0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJvdW5kaW5nQm94IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0FMSUdOTUVOVF9QQUlSOiBBbGlnbm1lbnRQYWlyID0ge1xuICAgIG9yaWdpbjoge1xuICAgICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICAgICAgdmVydGljYWw6ICdjZW50ZXInLFxuICAgIH0sXG4gICAgdGFyZ2V0OiB7XG4gICAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgfSxcbiAgICBvZmZzZXQ6IHtcbiAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgdmVydGljYWw6IDAsXG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQWxpZ25tZW50IChhbGlnbm1lbnQ6IGFueSk6IGFsaWdubWVudCBpcyBBbGlnbm1lbnQge1xuXG4gICAgcmV0dXJuIHR5cGVvZiAoYWxpZ25tZW50IGFzIEFsaWdubWVudCkuaG9yaXpvbnRhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIChhbGlnbm1lbnQgYXMgQWxpZ25tZW50KS52ZXJ0aWNhbCAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNBbGlnbm1lbnRDaGFuZ2VkIChhbGlnbm1lbnQ6IEFsaWdubWVudCwgb3RoZXI6IEFsaWdubWVudCk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKGFsaWdubWVudCAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBhbGlnbm1lbnQuaG9yaXpvbnRhbCAhPT0gb3RoZXIuaG9yaXpvbnRhbFxuICAgICAgICAgICAgfHwgYWxpZ25tZW50LnZlcnRpY2FsICE9PSBvdGhlci52ZXJ0aWNhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpZ25tZW50ICE9PSBvdGhlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkIChhbGlnbm1lbnRQYWlyPzogQWxpZ25tZW50UGFpciwgb3RoZXI/OiBBbGlnbm1lbnRQYWlyKTogYm9vbGVhbiB7XG5cbiAgICBpZiAoYWxpZ25tZW50UGFpciAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBoYXNBbGlnbm1lbnRDaGFuZ2VkKGFsaWdubWVudFBhaXIudGFyZ2V0LCBvdGhlci50YXJnZXQpXG4gICAgICAgICAgICB8fCBoYXNBbGlnbm1lbnRDaGFuZ2VkKGFsaWdubWVudFBhaXIub3JpZ2luLCBvdGhlci5vcmlnaW4pXG4gICAgICAgICAgICB8fCBoYXNPZmZzZXRDaGFuZ2VkKGFsaWdubWVudFBhaXIub2Zmc2V0LCBvdGhlci5vZmZzZXQpO1xuICAgIH1cblxuICAgIHJldHVybiBhbGlnbm1lbnRQYWlyICE9PSBvdGhlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsaWduZWRQb3NpdGlvbiAoZWxlbWVudEJveDogQm91bmRpbmdCb3gsIGVsZW1lbnRBbGlnbm1lbnQ6IEFsaWdubWVudCk6IFBvc2l0aW9uIHtcblxuICAgIGNvbnN0IHBvc2l0aW9uOiBQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgc3dpdGNoIChlbGVtZW50QWxpZ25tZW50Lmhvcml6b250YWwpIHtcblxuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94LnggKyBlbGVtZW50Qm94LndpZHRoIC8gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54ICsgZWxlbWVudEJveC53aWR0aDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZWxlbWVudEFsaWdubWVudC52ZXJ0aWNhbCkge1xuXG4gICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBlbGVtZW50Qm94Lnk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgcG9zaXRpb24ueSA9IGVsZW1lbnRCb3gueSArIGVsZW1lbnRCb3guaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0gZWxlbWVudEJveC55ICsgZWxlbWVudEJveC5oZWlnaHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXRQb3NpdGlvbiAob3JpZ2luQm94OiBCb3VuZGluZ0JveCwgb3JpZ2luQWxpZ25tZW50OiBBbGlnbm1lbnQsIHRhcmdldEJveDogQm91bmRpbmdCb3gsIHRhcmdldEFsaWdubWVudDogQWxpZ25tZW50KTogUG9zaXRpb24ge1xuXG4gICAgY29uc3Qgb3JpZ2luUG9zaXRpb24gPSBnZXRBbGlnbmVkUG9zaXRpb24ob3JpZ2luQm94LCBvcmlnaW5BbGlnbm1lbnQpO1xuICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0QWxpZ25lZFBvc2l0aW9uKHsgLi4udGFyZ2V0Qm94LCB4OiAwLCB5OiAwIH0sIHRhcmdldEFsaWdubWVudCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBvcmlnaW5Qb3NpdGlvbi54IC0gdGFyZ2V0UG9zaXRpb24ueCxcbiAgICAgICAgeTogb3JpZ2luUG9zaXRpb24ueSAtIHRhcmdldFBvc2l0aW9uLnksXG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbiB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT046IFBvc2l0aW9uID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc2l0aW9uIChwb3NpdGlvbjogYW55KTogcG9zaXRpb24gaXMgUG9zaXRpb24ge1xuXG4gICAgcmV0dXJuIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnggIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnkgIT09ICd1bmRlZmluZWQnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgIGlmIChwb3NpdGlvbiAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbi54ICE9PSBvdGhlci54XG4gICAgICAgICAgICB8fCBwb3NpdGlvbi55ICE9PSBvdGhlci55O1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbiAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBDU1NTZWxlY3RvciB9IGZyb20gJy4uL2RvbSc7XG5pbXBvcnQgeyBBbGlnbm1lbnRQYWlyLCBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZCwgREVGQVVMVF9BTElHTk1FTlRfUEFJUiB9IGZyb20gJy4vYWxpZ25tZW50JztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBoYXNTaXplQ2hhbmdlZCwgU2l6ZSB9IGZyb20gJy4vc2l6ZSc7XG5cbmV4cG9ydCBjb25zdCBWSUVXUE9SVCA9ICd2aWV3cG9ydCc7XG5cbmV4cG9ydCBjb25zdCBPUklHSU4gPSAnb3JpZ2luJztcblxuLyoqXG4gKiBBIFBvc2l0aW9uQ29uZmlnIGNvbnRhaW5zIHRoZSBzaXplIGFuZCBhbGlnbm1lbnQgb2YgYW4gRWxlbWVudCBhbmQgbWF5IGluY2x1ZGUgYW4gb3JpZ2luLCB3aGljaCByZWZlcmVuY2VzIGFuIG9yaWdpbiBFbGVtZW50XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25Db25maWcgZXh0ZW5kcyBTaXplIHtcbiAgICAvLyBUT0RPOiBoYW5kbGUgJ29yaWdpbicgY2FzZSBpbiBQb3NpdGlvblN0cmF0ZWd5XG4gICAgd2lkdGg6IG51bWJlciB8IHN0cmluZyB8ICdvcmlnaW4nO1xuICAgIGhlaWdodDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgbWF4V2lkdGg6IG51bWJlciB8IHN0cmluZyB8ICdvcmlnaW4nO1xuICAgIG1heEhlaWdodDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgbWluV2lkdGg6IG51bWJlciB8IHN0cmluZyB8ICdvcmlnaW4nO1xuICAgIG1pbkhlaWdodDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgb3JpZ2luOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgQ1NTU2VsZWN0b3IgfCAndmlld3BvcnQnO1xuICAgIGFsaWdubWVudDogQWxpZ25tZW50UGFpcjtcbn1cblxuZXhwb3J0IGNvbnN0IFBPU0lUSU9OX0NPTkZJR19GSUVMRFM6IChrZXlvZiBQb3NpdGlvbkNvbmZpZylbXSA9IFtcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdtYXhXaWR0aCcsXG4gICAgJ21heEhlaWdodCcsXG4gICAgJ21pbldpZHRoJyxcbiAgICAnbWluSGVpZ2h0JyxcbiAgICAnb3JpZ2luJyxcbiAgICAnYWxpZ25tZW50Jyxcbl07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRzogUG9zaXRpb25Db25maWcgPSB7XG4gICAgd2lkdGg6ICdhdXRvJyxcbiAgICBoZWlnaHQ6ICdhdXRvJyxcbiAgICBtYXhXaWR0aDogJzEwMHZ3JyxcbiAgICBtYXhIZWlnaHQ6ICcxMDB2aCcsXG4gICAgbWluV2lkdGg6ICdvcmlnaW4nLFxuICAgIG1pbkhlaWdodDogJ29yaWdpbicsXG4gICAgb3JpZ2luOiAndmlld3BvcnQnLFxuICAgIGFsaWdubWVudDogeyAuLi5ERUZBVUxUX0FMSUdOTUVOVF9QQUlSIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQb3NpdGlvbkNvbmZpZ0NoYW5nZWQgKHBvc2l0aW9uQ29uZmlnPzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4sIG90aGVyPzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4pOiBib29sZWFuIHtcblxuICAgIGlmIChwb3NpdGlvbkNvbmZpZyAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbkNvbmZpZy5vcmlnaW4gIT09IG90aGVyLm9yaWdpblxuICAgICAgICAgICAgfHwgaGFzQWxpZ25tZW50UGFpckNoYW5nZWQocG9zaXRpb25Db25maWcuYWxpZ25tZW50LCBvdGhlci5hbGlnbm1lbnQpXG4gICAgICAgICAgICB8fCBoYXNTaXplQ2hhbmdlZChwb3NpdGlvbkNvbmZpZywgb3RoZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbkNvbmZpZyAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBFc2NhcGUgfSBmcm9tICcuL2tleXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50QmluZGluZyB7XG4gICAgcmVhZG9ubHkgdGFyZ2V0OiBFdmVudFRhcmdldDtcbiAgICByZWFkb25seSB0eXBlOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsO1xuICAgIHJlYWRvbmx5IG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9ucyB8IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V2ZW50QmluZGluZyAoYmluZGluZzogYW55KTogYmluZGluZyBpcyBFdmVudEJpbmRpbmcge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBiaW5kaW5nID09PSAnb2JqZWN0J1xuICAgICAgICAmJiB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS50YXJnZXQgPT09ICdvYmplY3QnXG4gICAgICAgICYmIHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLnR5cGUgPT09ICdzdHJpbmcnXG4gICAgICAgICYmICh0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgfHwgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykubGlzdGVuZXIgPT09ICdvYmplY3QnKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNFc2NhcGUgKGV2ZW50PzogRXZlbnQpOiBib29sZWFuIHtcblxuICAgIHJldHVybiAoZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCk/LmtleSA9PT0gRXNjYXBlO1xufVxuXG4vKipcbiAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuIHtcblxuICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICBkZXRhaWxcbiAgICB9KSk7XG59XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgbWFuYWdpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgRXZlbnRNYW5hZ2VyIGNsYXNzIGNhbiBiZSB1c2VkIHRvIGhhbmRsZSBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgb24gbXVsdGlwbGUgdGFyZ2V0cy4gSXQgY2FjaGVzIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAqIGFuZCBjYW4gcmVtb3ZlIHRoZW0gc2VwYXJhdGVseSBvciBhbGwgdG9nZXRoZXIuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGV2ZW50IGxpc3RlbmVycyBuZWVkIHRvIGJlIGFkZGVkIGFuZCByZW1vdmVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIGEgY29tcG9uZW50IGFuZCBtYWtlcyBtYW51YWxseSBzYXZpbmcgcmVmZXJlbmNlcyB0byB0YXJnZXRzLCBsaXN0ZW5lcnMgYW5kIG9wdGlvbnMgdW5uZWNlc3NhcnkuXG4gKlxuICogYGBgdHNcbiAqICAvLyBjcmVhdGUgYW4gRXZlbnRNYW5hZ2VyIGluc3RhbmNlXG4gKiAgY29uc3QgbWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcbiAqXG4gKiAgLy8geW91IGNhbiBzYXZlIGEgcmVmZXJlbmNlIChhbiBFdmVudEJpbmRpbmcpIHRvIHRoZSBhZGRlZCBldmVudCBsaXN0ZW5lciBpZiB5b3UgbmVlZCB0byBtYW51YWxseSByZW1vdmUgaXQgbGF0ZXJcbiAqICBjb25zdCBiaW5kaW5nID0gbWFuYWdlci5saXN0ZW4oZG9jdW1lbnQsICdzY3JvbGwnLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8gLi4ub3IgaWdub3JlIHRoZSByZWZlcmVuY2UgaWYgeW91IGRvbid0IG5lZWQgaXRcbiAqICBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudC5ib2R5LCAnY2xpY2snLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8geW91IGNhbiByZW1vdmUgYSBzcGVjaWZpYyBldmVudCBsaXN0ZW5lciB1c2luZyBhIHJlZmVyZW5jZVxuICogIG1hbmFnZXIudW5saXN0ZW4oYmluZGluZyk7XG4gKlxuICogIC8vIC4uLm9yIHJlbW92ZSBhbGwgcHJldmlvdXNseSBhZGRlZCBldmVudCBsaXN0ZW5lcnMgaW4gb25lIGdvXG4gKiAgbWFuYWdlci51bmxpc3RlbkFsbCgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG4gICAgcHJvdGVjdGVkIGJpbmRpbmdzID0gbmV3IFNldDxFdmVudEJpbmRpbmc+KCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYW4gRXZlbnRCaW5kaW5nIGV4aXN0cyB0aGF0IG1hdGNoZXMgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICovXG4gICAgaGFzQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGhhc0JpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbjtcblxuICAgIGhhc0JpbmRpbmcgKFxuICAgICAgICB0YXJnZXRPckJpbmRpbmc6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIChpc0V2ZW50QmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA/IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nKVxuICAgICAgICAgICAgOiB0aGlzLmZpbmRCaW5kaW5nKHRhcmdldE9yQmluZGluZywgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucykpICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBmaW5kQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIGZpbmRCaW5kaW5nIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgbGV0IHNlYXJjaEJpbmRpbmc6IEV2ZW50QmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldCkgPyBiaW5kaW5nT3JUYXJnZXQgOiB0aGlzLmNyZWF0ZUJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBsZXQgZm91bmRCaW5kaW5nOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYmluZGluZ3MuaGFzKHNlYXJjaEJpbmRpbmcpKSByZXR1cm4gc2VhcmNoQmluZGluZztcblxuICAgICAgICBmb3IgKGxldCBiaW5kaW5nIG9mIHRoaXMuYmluZGluZ3MudmFsdWVzKCkpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZUJpbmRpbmdzKHNlYXJjaEJpbmRpbmcsIGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgICAgICBmb3VuZEJpbmRpbmcgPSBiaW5kaW5nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kQmluZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0IG9mIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyBhZGRlZCBvciB1bmRlZmluZWQgYSBtYXRjaGluZyBldmVudCBiaW5kaW5nIGFscmVhZHkgZXhpc3RzXG4gICAgICovXG4gICAgbGlzdGVuIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgbGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gYmluZGluZ09yVGFyZ2V0XG4gICAgICAgICAgICA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNCaW5kaW5nKGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFkZChiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lciBmcm9tIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyByZW1vdmVkIG9yIHVuZGVmaW5lZCBpZiBubyBtYXRjaGluZyBldmVudCBiaW5kaW5nIGV4aXN0c1xuICAgICAqL1xuICAgIHVubGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbik6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIHVubGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhblxuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoYmluZGluZykge1xuXG4gICAgICAgICAgICBiaW5kaW5nLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGJpbmRpbmcudHlwZSwgYmluZGluZy5saXN0ZW5lciwgYmluZGluZy5vcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5kZWxldGUoYmluZGluZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlaXIgdGFyZ2V0c1xuICAgICAqL1xuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLmJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB0aGlzLnVubGlzdGVuKGJpbmRpbmcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIGFuIEV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gICAgICovXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcblxuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ6IFBhcnRpYWw8RXZlbnRJbml0PiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGV2ZW50T3JUeXBlIGluc3RhbmNlb2YgRXZlbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50T3JUeXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnRPclR5cGUhLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICAgICAgZGV0YWlsXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdFxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byB7QGxpbmsgRXZlbnRCaW5kaW5nfSBvYmplY3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGJpbmRpbmcgb2JqZWN0cyBoYXZlIHRoZSBzYW1lIHRhcmdldCwgdHlwZSBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbXBhcmVCaW5kaW5ncyAoYmluZGluZzogRXZlbnRCaW5kaW5nLCBvdGhlcjogRXZlbnRCaW5kaW5nKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGJpbmRpbmcgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gYmluZGluZy50YXJnZXQgPT09IG90aGVyLnRhcmdldFxuICAgICAgICAgICAgJiYgYmluZGluZy50eXBlID09PSBvdGhlci50eXBlXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVMaXN0ZW5lcnMoYmluZGluZy5saXN0ZW5lciwgb3RoZXIubGlzdGVuZXIpXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVPcHRpb25zKGJpbmRpbmcub3B0aW9ucywgb3RoZXIub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUxpc3RlbmVycyAobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvdGhlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggbGlzdGVuZXJzIGJlaW5nIG51bGwsIGEgZnVuY3Rpb24gb3IgdGhlIHNhbWUgRXZlbnRMaXN0ZW5lck9iamVjdFxuICAgICAgICBpZiAobGlzdGVuZXIgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBjb21wYXJlcyB0aGUgaGFuZGxlcnMgb2YgdHdvIEV2ZW50TGlzdGVuZXJPYmplY3RzXG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChsaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudCA9PT0gKG90aGVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBldmVudCBsaXN0ZW5lciBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9wdGlvbnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZU9wdGlvbnMgKG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsIG90aGVyPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbiB7XG5cbiAgICAgICAgLy8gY2F0Y2hlcyBib3RoIG9wdGlvbnMgYmVpbmcgdW5kZWZpbmVkIG9yIHNhbWUgYm9vbGVhbiB2YWx1ZVxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHR3byBvcHRpb25zIG9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb3RoZXIgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNhcHR1cmUgPT09IG90aGVyLmNhcHR1cmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLnBhc3NpdmUgPT09IG90aGVyLnBhc3NpdmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLm9uY2UgPT09IG90aGVyLm9uY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgYW5pbWF0aW9uRnJhbWVUYXNrLCBUYXNrIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50L3Rhc2tzJztcbmltcG9ydCB7IEV2ZW50QmluZGluZywgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vZXZlbnRzJztcblxuLy8gVE9ETzogbW92ZSBOT09QIHRvIHNvbWUgdXRpbGl0eVxuY29uc3QgTk9PUDogKCkgPT4gdm9pZCA9ICgpID0+IHsgfTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJlaGF2aW9yIHtcblxuICAgIHByb3RlY3RlZCBfYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBfZWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcHJvdGVjdGVkIF91cGRhdGVUYXNrOiBUYXNrID0geyBwcm9taXNlOiBQcm9taXNlLnJlc29sdmUoKSwgY2FuY2VsOiBOT09QIH07XG5cbiAgICBwcm90ZWN0ZWQgX2V2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRydWUgaWYgdGhlIGJlaGF2aW9yJ3Mge0BsaW5rIEJlaGF2aW9yLmF0dGFjaH0gbWV0aG9kIHdhcyBjYWxsZWRcbiAgICAgKlxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIGdldCBoYXNBdHRhY2hlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBlbGVtZW50IHRoYXQgdGhlIGJlaGF2aW9yIGlzIGF0dGFjaGVkIHRvXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdlIG9ubHkgZXhwb3NlIGEgZ2V0dGVyIGZvciB0aGUgZWxlbWVudCwgc28gaXQgY2FuJ3QgYmUgc2V0IGRpcmVjdGx5LCBidXQgaGFzIHRvIGJlIHNldCB2aWFcbiAgICAgKiB0aGUgYmVoYXZpb3IncyBhdHRhY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIGdldCBlbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgdGhlIGJlaGF2aW9yIGluc3RhbmNlIHRvIGFuIEhUTUxFbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAgIEFuIG9wdGlvbmFsIEhUTUxFbGVtZW50IHRvIGF0dGFjaCB0aGUgYmVoYXZpb3IgdG9cbiAgICAgKiBAcGFyYW0gYXJncyAgICAgIE9wdGlvbmFsIGFyZ3VtYW50ZXMgd2hpY2ggY2FuIGJlIHBhc3NlZCB0byB0aGUgYXR0YWNoIG1ldGhvZFxuICAgICAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIGJlaGF2aW9yIHdhcyBzdWNjZXNzZnVsbHkgYXR0YWNoZWRcbiAgICAgKi9cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCwgLi4uYXJnczogYW55W10pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2hlcyB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogRGV0YWNoaW5nIGEgYmVoYXZpb3Igd2lsbCBjYW5jZWwgYW55IHNjaGVkdWxlZCB1cGRhdGUsIHJlbW92ZSBhbGwgYm91bmQgbGlzdGVuZXJzXG4gICAgICogYm91bmQgd2l0aCB0aGUge0BsaW5rIEJlaGF2aW9yLmxpc3Rlbn0gbWV0aG9kIGFuZCBjbGVhciB0aGUgYmVoYXZpb3IncyBlbGVtZW50XG4gICAgICogcmVmZXJlbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgIE9wdGlvbmFsIGFyZ3VtZW50cyB3aGljaCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBkZXRhY2ggbWV0aG9kXG4gICAgICovXG4gICAgZGV0YWNoICguLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuY2FuY2VsVXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy51bmxpc3RlbkFsbCgpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2Qgc2NoZWR1bGVzIGFuIHVwZGF0ZSBjYWxsIHVzaW5nIHJlcXVlc3RBbmltYXRpb25GcmFtZS4gSXQgcmV0dXJucyBhIFByb21pc2VcbiAgICAgKiB3aGljaCB3aWxsIHJlc29sdmUgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB1cGRhdGUgbWV0aG9kLCBvciByZWplY3QgaWYgYW4gZXJyb3JcbiAgICAgKiBvY2N1cnJzIGR1cmluZyB1cGRhdGUgb3IgdGhlIHVwZGF0ZSB3YXMgY2FuY2VsZWQuIElmIGFuIHVwZGF0ZSBoYXMgYmVlbiBzY2hlZHVsZWRcbiAgICAgKiBhbHJlYWR5LCBidXQgaGFzbid0IGV4ZWN1dGVkIHlldCwgdGhlIHNjaGVkdWxlZCB1cGRhdGUncyBwcm9taXNlIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIHJlcXVlc3RVcGRhdGUgKC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiAhdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRhc2sgPSBhbmltYXRpb25GcmFtZVRhc2soKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoLi4uYXJncyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVRhc2sucHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSByZXF1ZXN0ZWQgYnV0IG5vdCB5ZXQgZXhlY3V0ZWQgdXBkYXRlXG4gICAgICovXG4gICAgY2FuY2VsVXBkYXRlICgpIHtcblxuICAgICAgICB0aGlzLl91cGRhdGVUYXNrLmNhbmNlbCgpO1xuXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBzeW5jaHJvbm91c2x5LCBlLmcuIGluIHRoZSB1cGRhdGUgY3ljbGUgb2YgYSBjb21wb25lbnRcbiAgICAgKiB3aGljaCBpcyBhbHJlYWR5IHNjaGVkdWxlZCB2aWEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLiBJZiBhIGJlaGF2aW9yIHdhbnRzIHRvIHVwZGF0ZSBpdHNlbGZcbiAgICAgKiBiYXNlZCBvbiBzb21lIGV2ZW50LCBpdCBpcyByZWNvbW1lbmRlZCB0byB1c2Uge0BsaW5rIEJlaGF2aW9yLnJlcXVlc3RVcGRhdGV9IGluc3RlYWQuXG4gICAgICovXG4gICAgdXBkYXRlICguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0YWNoZWQ7XG4gICAgfVxuXG4gICAgbGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50TWFuYWdlci5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRNYW5hZ2VyLnVubGlzdGVuKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLl9ldmVudE1hbmFnZXIudW5saXN0ZW5BbGwoKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCAoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaDxUID0gYW55PiAodHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuO1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+IChldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiB0aGlzLmVsZW1lbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChldmVudE9yVHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5fZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKHRoaXMuZWxlbWVudCwgZXZlbnRPclR5cGUpXG4gICAgICAgICAgICAgICAgOiB0aGlzLl9ldmVudE1hbmFnZXIuZGlzcGF0Y2godGhpcy5lbGVtZW50LCBldmVudE9yVHlwZSEsIGRldGFpbCwgZXZlbnRJbml0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJcbmV4cG9ydCBmdW5jdGlvbiBhcHBseURlZmF1bHRzPFQ+IChjb25maWc6IFBhcnRpYWw8VD4sIGRlZmF1bHRzOiBUKTogVCB7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkZWZhdWx0cykge1xuXG4gICAgICAgIGlmIChjb25maWdba2V5XSA9PT0gdW5kZWZpbmVkKSBjb25maWdba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZyBhcyBUO1xufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuLi9iZWhhdmlvci9iZWhhdmlvcic7XG5pbXBvcnQgeyBhcHBseURlZmF1bHRzIH0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7IEJvdW5kaW5nQm94LCBnZXRUYXJnZXRQb3NpdGlvbiB9IGZyb20gJy4vYWxpZ25tZW50JztcbmltcG9ydCB7IGhhc1Bvc2l0aW9uQ2hhbmdlZCwgaXNQb3NpdGlvbiwgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IGhhc1NpemVDaGFuZ2VkLCBTaXplIH0gZnJvbSAnLi9zaXplJztcblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uQ29udHJvbGxlciBleHRlbmRzIEJlaGF2aW9yIHtcblxuICAgIHByaXZhdGUgX29yaWdpbjogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBjdXJyZW50UG9zaXRpb246IFBvc2l0aW9uIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRTaXplOiBTaXplIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGNvbmZpZzogUG9zaXRpb25Db25maWc7XG5cbiAgICAvLyBUT0RPOiBtYXliZSB3ZSBzaG91bGRuJ3QgYWxsb3cgQ1NTUXVlcnkgc3RyaW5ncywgYmVjYXVzZSBxdWVyeVNlbGVjdG9yKCkgdGhyb3VnaCBTaGFkb3dET00gd2lsbCBub3Qgd29ya1xuICAgIHByb3RlY3RlZCBzZXQgb3JpZ2luIChvcmlnaW46IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luIGVsZW1lbnQgaWYgaXQgaXMgYSBDU1Mgc2VsZWN0b3JcbiAgICAgICAgaWYgKHR5cGVvZiBvcmlnaW4gPT09ICdzdHJpbmcnICYmIG9yaWdpbiAhPT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBvcmlnaW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9yaWdpbikgYXMgSFRNTEVsZW1lbnQgfHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fb3JpZ2luID0gb3JpZ2luO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXQgb3JpZ2luICgpOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3JpZ2luO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHVuaWZ5IHRoZSB3YXkgY29uZmlndXJhdGlvbnMgYXJlIHRyZWF0ZWQgYnkgcG9zaXRpb24gYW5kIG92ZXJsYXkgY29udHJvbGxlci4uLlxuICAgIGNvbnN0cnVjdG9yIChjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPikge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWcgPSBhcHBseURlZmF1bHRzKGNvbmZpZyB8fCB7fSwgREVGQVVMVF9QT1NJVElPTl9DT05GSUcpO1xuXG4gICAgICAgIHRoaXMub3JpZ2luID0gdGhpcy5jb25maWcub3JpZ2luO1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlcXVlc3RVcGRhdGUgKHBvc2l0aW9uPzogUG9zaXRpb24sIHNpemU/OiBTaXplKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlcXVlc3RVcGRhdGUocG9zaXRpb24sIHNpemUpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAocG9zaXRpb24/OiBQb3NpdGlvbiwgc2l6ZT86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIGNvbnN0IG5leHRTaXplID0gc2l6ZSB8fCB0aGlzLmdldFNpemUoKTtcbiAgICAgICAgbGV0IHVwZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFBvc2l0aW9uIHx8IHRoaXMuaGFzUG9zaXRpb25DaGFuZ2VkKG5leHRQb3NpdGlvbiwgdGhpcy5jdXJyZW50UG9zaXRpb24pKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2l6ZSB8fCB0aGlzLmhhc1NpemVDaGFuZ2VkKG5leHRTaXplLCB0aGlzLmN1cnJlbnRTaXplKSkge1xuXG4gICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZShuZXh0U2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaXplID0gbmV4dFNpemU7XG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogVGhlIHBvc2l0aW9uIHdpbGwgZGVwZW5kIG9uIHRoZSBhbGlnbm1lbnQgYW5kIG9yaWdpbiBvcHRpb25zIG9mIHRoZSB7QGxpbmsgUG9zaXRpb25Db25maWd9LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbkJveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3godGhpcy5vcmlnaW4pO1xuICAgICAgICBjb25zdCB0YXJnZXRCb3ggPSB0aGlzLmdldEJvdW5kaW5nQm94KHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8gVE9ETzogaW5jbHVkZSBhbGlnbm1lbnQgb2Zmc2V0XG5cbiAgICAgICAgcmV0dXJuIGdldFRhcmdldFBvc2l0aW9uKG9yaWdpbkJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50Lm9yaWdpbiwgdGFyZ2V0Qm94LCB0aGlzLmNvbmZpZy5hbGlnbm1lbnQudGFyZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIHNpemUgb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogV2UgdGFrZSB0aGUgc2V0dGluZ3MgZnJvbSB0aGUge0BsaW5rIFBvc2l0aW9uQ29uZmlnfSBzbyB3ZSBhcmUgYWx3YXlzIHVwLXRvLWRhdGUgaWYgdGhlIGNvbmZpZ3VyYXRpb24gd2FzIHVwZGF0ZWQuXG4gICAgICpcbiAgICAgKiBUaGlzIGhvb2sgYWxzbyBhbGxvd3MgdXMgdG8gZG8gdGhpbmdzIGxpa2UgbWF0Y2hpbmcgdGhlIG9yaWdpbidzIHdpZHRoLCBvciBsb29raW5nIGF0IHRoZSBhdmFpbGFibGUgdmlld3BvcnQgZGltZW5zaW9ucy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U2l6ZSAoKTogU2l6ZSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLmNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5jb25maWcuaGVpZ2h0LFxuICAgICAgICAgICAgbWF4V2lkdGg6IHRoaXMuY29uZmlnLm1heFdpZHRoLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLmNvbmZpZy5tYXhIZWlnaHQsXG4gICAgICAgICAgICBtaW5XaWR0aDogdGhpcy5jb25maWcubWluV2lkdGgsXG4gICAgICAgICAgICBtaW5IZWlnaHQ6IHRoaXMuY29uZmlnLm1pbkhlaWdodCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0Qm91bmRpbmdCb3ggKHJlZmVyZW5jZTogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZCk6IEJvdW5kaW5nQm94IHtcblxuICAgICAgICBjb25zdCBib3VuZGluZ0JveDogQm91bmRpbmdCb3ggPSB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpc1Bvc2l0aW9uKHJlZmVyZW5jZSkpIHtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gueCA9IHJlZmVyZW5jZS54O1xuICAgICAgICAgICAgYm91bmRpbmdCb3gueSA9IHJlZmVyZW5jZS55O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlID09PSAndmlld3BvcnQnKSB7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBib3VuZGluZ0JveC5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWZlcmVuY2UgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5SZWN0ID0gcmVmZXJlbmNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC54ID0gb3JpZ2luUmVjdC5sZWZ0O1xuICAgICAgICAgICAgYm91bmRpbmdCb3gueSA9IG9yaWdpblJlY3QudG9wO1xuICAgICAgICAgICAgYm91bmRpbmdCb3gud2lkdGggPSBvcmlnaW5SZWN0LndpZHRoO1xuICAgICAgICAgICAgYm91bmRpbmdCb3guaGVpZ2h0ID0gb3JpZ2luUmVjdC5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm91bmRpbmdCb3g7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUudG9wID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLnkpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLmxlZnQgPSB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUucmlnaHQgPSAnJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVNpemUgKHNpemU6IFNpemUpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLndpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHNpemUud2lkdGgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLmhlaWdodCA9IHRoaXMucGFyc2VTdHlsZShzaXplLmhlaWdodCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubWF4V2lkdGggPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5tYXhXaWR0aCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubWF4SGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWF4SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5taW5XaWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1pbldpZHRoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5taW5IZWlnaHQgPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5taW5IZWlnaHQpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IG1heWJlIG5hbWUgdGhpcyBiZXR0ZXIsIGh1aD9cbiAgICBwcm90ZWN0ZWQgcGFyc2VTdHlsZSAodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGwpOiBzdHJpbmcge1xuXG4gICAgICAgIHJldHVybiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgPyBgJHsgdmFsdWUgfHwgMCB9cHhgIDogdmFsdWUgfHwgJyc7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1Bvc2l0aW9uQ2hhbmdlZCAocG9zaXRpb24/OiBQb3NpdGlvbiwgb3RoZXI/OiBQb3NpdGlvbik6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiBoYXNQb3NpdGlvbkNoYW5nZWQocG9zaXRpb24sIG90aGVyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFzU2l6ZUNoYW5nZWQgKHNpemU/OiBTaXplLCBvdGhlcj86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzU2l6ZUNoYW5nZWQoc2l6ZSwgb3RoZXIpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJlaGF2aW9yIH0gZnJvbSAnLi9iZWhhdmlvcic7XG5pbXBvcnQgeyBhcHBseURlZmF1bHRzIH0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRF9UWVBFID0gKHR5cGU6IHN0cmluZywgbWFwOiBzdHJpbmcgPSAnYmVoYXZpb3InKSA9PiBuZXcgRXJyb3IoXG4gICAgYFVuZGVmaW5lZCB0eXBlIGtleTogTm8gJHsgbWFwIH0gZm91bmQgZm9yIGtleSAnJHsgdHlwZSB9Jy5cbkFkZCBhICdkZWZhdWx0JyBrZXkgdG8geW91ciAkeyBtYXAgfSBtYXAgdG8gcHJvdmlkZSBhIGZhbGxiYWNrICR7IG1hcCB9IGZvciB1bmRlZmluZWQgdHlwZXMuYCk7XG5cbi8qKlxuICogQSBiZWhhdmlvciBjb25zdHJ1Y3RvclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhpcyB0eXBlIGVuZm9yY2VzIHtAbGluayBCZWhhdmlvcn0gY29uc3RydWN0b3JzIHdoaWNoIHJlY2VpdmUgYSBjb25maWd1cmF0aW9uIG9iamVjdCBhcyBmaXJzdCBwYXJhbWV0ZXIuXG4gKi9cbmV4cG9ydCB0eXBlIEJlaGF2aW9yQ29uc3RydWN0b3I8QiBleHRlbmRzIEJlaGF2aW9yLCBDID0gYW55PiA9IG5ldyAoY29uZmlndXJhdGlvbjogQywgLi4uYXJnczogYW55W10pID0+IEI7XG5cbmV4cG9ydCB0eXBlIEJlaGF2aW9yTWFwPEIgZXh0ZW5kcyBCZWhhdmlvciwgSyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSB7XG4gICAgW2tleSBpbiAoSyB8ICdkZWZhdWx0JyldOiBCZWhhdmlvckNvbnN0cnVjdG9yPEI+O1xufVxuXG5leHBvcnQgdHlwZSBDb25maWd1cmF0aW9uTWFwPEMsIEsgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+ID0ge1xuICAgIFtrZXkgaW4gKEsgfCAnZGVmYXVsdCcpXTogQztcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJlaGF2aW9yRmFjdG9yeTxCIGV4dGVuZHMgQmVoYXZpb3IsIEMsIEsgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHJvdGVjdGVkIGJlaGF2aW9yczogQmVoYXZpb3JNYXA8QiwgSz4sXG4gICAgICAgIHByb3RlY3RlZCBjb25maWd1cmF0aW9uczogQ29uZmlndXJhdGlvbk1hcDxDLCBLPixcbiAgICApIHsgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgYmVoYXZpb3Igb2YgdGhlIHNwZWNpZmllZCB0eXBlIGFuZCBjb25maWd1cmF0aW9uXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCB0eXBlIGtleSBleGlzdHMgaW4gYmVoYXZpb3IgYW5kIGNvbmZpZ3VyYXRpb24gbWFwLFxuICAgICAqIG1lcmdlcyB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUgaW50byB0aGUgcHJvdmlkZWRcbiAgICAgKiBjb25maWd1cmF0aW9uIGFuZCBjcmVhdGVzIGFuIGluc3RhbmNlIG9mIHRoZSBjb3JyZWN0IGJlaGF2aW9yIHdpdGggdGhlIG1lcmdlZFxuICAgICAqIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgY3JlYXRlICh0eXBlOiBLLCBjb25maWc6IFBhcnRpYWw8Qz4sIC4uLmFyZ3M6IGFueVtdKTogQiB7XG5cbiAgICAgICAgdGhpcy5jaGVja1R5cGUodHlwZSk7XG5cbiAgICAgICAgY29uc3QgYmVoYXZpb3IgPSB0aGlzLmdldEJlaGF2aW9yKHR5cGUpO1xuICAgICAgICBjb25zdCBjb25maWd1cmF0aW9uID0gYXBwbHlEZWZhdWx0cyhjb25maWcsIHRoaXMuZ2V0Q29uZmlndXJhdGlvbih0eXBlKSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UodHlwZSwgYmVoYXZpb3IsIGNvbmZpZ3VyYXRpb24sIC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGJlaGF2aW9yIGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieSBhbnkgQmVoYXZpb3JGYWN0b3J5IHRvIGFkanVzdCB0aGUgY3JlYXRpb24gb2YgQmVoYXZpb3IgaW5zdGFuY2VzLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRJbnN0YW5jZSAodHlwZTogSywgYmVoYXZpb3I6IEJlaGF2aW9yQ29uc3RydWN0b3I8QiwgQz4sIGNvbmZpZ3VyYXRpb246IEMsIC4uLmFyZ3M6IGFueVtdKTogQiB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBiZWhhdmlvcihjb25maWd1cmF0aW9uLCAuLi5hcmdzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgc3BlY2lmaWVkIHR5cGUgZXhpc3RzIGluIGJlaGF2aW9yIGFuZCBjb25maWd1cmF0aW9uIG1hcFxuICAgICAqXG4gICAgICogQHRocm93c1xuICAgICAqIHtAbGluayBVTkRFRklORURfVFlQRX0gZXJyb3IgaWYgbmVpdGhlciB0aGUgc3BlY2lmaWVkIHR5cGUgbm9yIGEgJ2RlZmF1bHQnIGtleVxuICAgICAqIGV4aXN0cyBpbiB0aGUgYmVoYXZpb3Igb3IgY29uZmlndXJhdGlvbiBtYXAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNoZWNrVHlwZSAodHlwZTogSykge1xuXG4gICAgICAgIGlmICghKHR5cGUgaW4gdGhpcy5iZWhhdmlvcnMgfHwgJ2RlZmF1bHQnIGluIHRoaXMuYmVoYXZpb3JzKSkgdGhyb3cgVU5ERUZJTkVEX1RZUEUodHlwZSwgJ2JlaGF2aW9yJyk7XG5cbiAgICAgICAgaWYgKCEodHlwZSBpbiB0aGlzLmNvbmZpZ3VyYXRpb25zIHx8ICdkZWZhdWx0JyBpbiB0aGlzLmNvbmZpZ3VyYXRpb25zKSkgdGhyb3cgVU5ERUZJTkVEX1RZUEUodHlwZSwgJ2NvbmZpZ3VyYXRpb24nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGJlaGF2aW9yIGNsYXNzIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUga2V5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEJlaGF2aW9yICh0eXBlOiBLKTogQmVoYXZpb3JDb25zdHJ1Y3RvcjxCPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYmVoYXZpb3JzW3R5cGVdIHx8IHRoaXMuYmVoYXZpb3JzWydkZWZhdWx0J107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUga2V5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldENvbmZpZ3VyYXRpb24gKHR5cGU6IEspOiBDIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uc1t0eXBlXSB8fCB0aGlzLmNvbmZpZ3VyYXRpb25zWydkZWZhdWx0J107XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTiwgUG9zaXRpb24gfSBmcm9tICcuLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgUG9zaXRpb25Db25maWcgfSBmcm9tICcuLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb25Db250cm9sbGVyIH0gZnJvbSAnLi4vcG9zaXRpb24tY29udHJvbGxlcic7XG5cbmV4cG9ydCBjb25zdCBDRU5URVJFRF9QT1NJVElPTl9DT05GSUc6IFBvc2l0aW9uQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxufTtcblxuZXhwb3J0IGNsYXNzIENlbnRlcmVkUG9zaXRpb25Db250cm9sbGVyIGV4dGVuZHMgUG9zaXRpb25Db250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIFdlIG92ZXJyaWRlIHRoZSBnZXRQb3NpdGlvbiBtZXRob2QgdG8gYWx3YXlzIHJldHVybiB0aGUge0BsaW5rIERFRkFVTFRfUE9TSVRJT059XG4gICAgICpcbiAgICAgKiBXZSBhY3R1YWxseSBkb24ndCBjYXJlIGFib3V0IHRoZSBwb3NpdGlvbiwgYmVjYXVzZSB3ZSBhcmUgZ29pbmcgdG8gdXNlIHZpZXdwb3J0IHJlbGF0aXZlXG4gICAgICogQ1NTIHVuaXRzIHRvIHBvc2l0aW9uIHRoZSBlbGVtZW50LiBBZnRlciB0aGUgZmlyc3QgY2FsY3VsYXRpb24gb2YgdGhlIHBvc2l0aW9uLCBpdCdzXG4gICAgICogbmV2ZXIgZ29pbmcgdG8gY2hhbmdlIGFuZCBhcHBseVBvc2l0aW9uIHdpbGwgb25seSBiZSBjYWxsZWQgb25jZS4gVGhpcyBtYWtlcyB0aGlzXG4gICAgICogcG9zaXRpb24gc3RyYXRlZ3kgcmVhbGx5IGNoZWFwLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIHJldHVybiBERUZBVUxUX1BPU0lUSU9OO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdlIG92ZXJyaWRlIHRoZSBhcHBseVBvc2l0aW9uIG1ldGhvZCB0byBjZW50ZXIgdGhlIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIHZpZXdwb3J0XG4gICAgICogZGltZW5zaW9ucyBhbmQgaXRzIG93biBzaXplLiBUaGlzIHN0eWxlIGhhcyB0byBiZSBhcHBsaWVkIG9ubHkgb25jZSBhbmQgaXMgcmVzcG9uc2l2ZVxuICAgICAqIGJ5IGRlZmF1bHQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUudG9wID0gJzUwdmgnO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLmxlZnQgPSAnNTB2dyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUucmlnaHQgPSAnJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoLTUwJSwgLTUwJSlgO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IFBvc2l0aW9uQ29udHJvbGxlciB9IGZyb20gJy4uL3Bvc2l0aW9uLWNvbnRyb2xsZXInO1xuXG5leHBvcnQgY29uc3QgQ09OTkVDVEVEX1BPU0lUSU9OX0NPTkZJRzogUG9zaXRpb25Db25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ3N0YXJ0JyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnZW5kJ1xuICAgICAgICB9LFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ3N0YXJ0J1xuICAgICAgICB9LFxuICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6IDAsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogMCxcbiAgICAgICAgfSxcbiAgICB9XG59O1xuXG5leHBvcnQgY2xhc3MgQ29ubmVjdGVkUG9zaXRpb25Db250cm9sbGVyIGV4dGVuZHMgUG9zaXRpb25Db250cm9sbGVyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHdpbmRvdywgJ3Jlc2l6ZScsICgpID0+IHRoaXMucmVxdWVzdFVwZGF0ZSgpLCB0cnVlKTtcbiAgICAgICAgdGhpcy5saXN0ZW4oZG9jdW1lbnQsICdzY3JvbGwnLCAoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSwgdHJ1ZSk7XG5cbiAgICAgICAgLy8gVE9ETzogYWRkIGNvbnRlbmQtY2hhbmdlZCBldmVudCB0byBvdmVybGF5IHZpYSBNdXRhdGlvbk9ic2VydmVyXG4gICAgICAgIC8vIGFuZCB1cGRhdGUgcG9zaXRpb24gd2hlbiBjb250ZW50IGNoYW5nZXNcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSBvdmVycmlkZSB0aGUgYXBwbHlQb3NpdGlvbiBtZXRob2QsIHNvIHdlIGNhbiB1c2UgYSBDU1MgdHJhbnNmb3JtIHRvIHBvc2l0aW9uIHRoZSBlbGVtZW50LlxuICAgICAqXG4gICAgICogVGhpcyBjYW4gcmVzdWx0IGluIGJldHRlciBwZXJmb3JtYW5jZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS50b3AgPSAnJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUucmlnaHQgPSAnJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgICAgICAvLyB0aGlzLmVsZW1lbnQhLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHsgdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpIH0sICR7IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi55KSB9KWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3JGYWN0b3J5LCBCZWhhdmlvck1hcCwgQ29uZmlndXJhdGlvbk1hcCB9IGZyb20gJy4uL2JlaGF2aW9yL2JlaGF2aW9yLWZhY3RvcnknO1xuaW1wb3J0IHsgQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIsIENFTlRFUkVEX1BPU0lUSU9OX0NPTkZJRyB9IGZyb20gJy4vY29udHJvbGxlci9jZW50ZXJlZC1wb3NpdGlvbi1jb250cm9sbGVyJztcbmltcG9ydCB7IENvbm5lY3RlZFBvc2l0aW9uQ29udHJvbGxlciwgQ09OTkVDVEVEX1BPU0lUSU9OX0NPTkZJRyB9IGZyb20gJy4vY29udHJvbGxlci9jb25uZWN0ZWQtcG9zaXRpb24tY29udHJvbGxlcic7XG5pbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgUG9zaXRpb25Db25maWcgfSBmcm9tICcuL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuL3Bvc2l0aW9uLWNvbnRyb2xsZXInO1xuXG5leHBvcnQgdHlwZSBQb3NpdGlvblR5cGVzID0gJ2RlZmF1bHQnIHwgJ2NlbnRlcmVkJyB8ICdjb25uZWN0ZWQnO1xuXG5leHBvcnQgY29uc3QgUE9TSVRJT05fQ09OVFJPTExFUlM6IEJlaGF2aW9yTWFwPFBvc2l0aW9uQ29udHJvbGxlciwgUG9zaXRpb25UeXBlcz4gPSB7XG4gICAgZGVmYXVsdDogUG9zaXRpb25Db250cm9sbGVyLFxuICAgIGNlbnRlcmVkOiBDZW50ZXJlZFBvc2l0aW9uQ29udHJvbGxlcixcbiAgICBjb25uZWN0ZWQ6IENvbm5lY3RlZFBvc2l0aW9uQ29udHJvbGxlcixcbn1cblxuZXhwb3J0IGNvbnN0IFBPU0lUSU9OX0NPTkZJR1VSQVRJT05TOiBDb25maWd1cmF0aW9uTWFwPFBvc2l0aW9uQ29uZmlnLCBQb3NpdGlvblR5cGVzPiA9IHtcbiAgICBkZWZhdWx0OiBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRyxcbiAgICBjZW50ZXJlZDogQ0VOVEVSRURfUE9TSVRJT05fQ09ORklHLFxuICAgIGNvbm5lY3RlZDogQ09OTkVDVEVEX1BPU0lUSU9OX0NPTkZJRyxcbn07XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5IGV4dGVuZHMgQmVoYXZpb3JGYWN0b3J5PFBvc2l0aW9uQ29udHJvbGxlciwgUG9zaXRpb25Db25maWcsIFBvc2l0aW9uVHlwZXM+IHtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHJvdGVjdGVkIGJlaGF2aW9ycyA9IFBPU0lUSU9OX0NPTlRST0xMRVJTLFxuICAgICAgICBwcm90ZWN0ZWQgY29uZmlndXJhdGlvbnMgPSBQT1NJVElPTl9DT05GSUdVUkFUSU9OUyxcbiAgICApIHtcblxuICAgICAgICBzdXBlcihiZWhhdmlvcnMsIGNvbmZpZ3VyYXRpb25zKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgSURHZW5lcmF0b3Ige1xuXG4gICAgcHJpdmF0ZSBfbmV4dCA9IDA7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcmVmaXggLSBBbiBvcHRpb25hbCBwcmVmaXggZm9yIHRoZSBnZW5lcmF0ZWQgSUQgaW5jbHVkaW5nIGFuIG9wdGlvbmFsIHNlcGFyYXRvciwgZS5nLjogYCdteS1wcmVmaXgtJyBvciAncHJlZml4LS0nIG9yICdwcmVmaXhfJyBvciAncHJlZml4YFxuICAgICAqIEBwYXJhbSBzdWZmaXggLSBBbiBvcHRpb25hbCBzdWZmaXggZm9yIHRoZSBnZW5lcmF0ZWQgSUQgaW5jbHVkaW5nIGFuIG9wdGlvbmFsIHNlcGFyYXRvciwgZS5nLjogYCctbXktc3VmZml4JyBvciAnLS1zdWZmaXgnIG9yICdfc3VmZml4JyBvciAnc3VmZml4YFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgcHJlZml4OiBzdHJpbmcgPSAnJywgcHVibGljIHN1ZmZpeDogc3RyaW5nID0gJycpIHsgfVxuXG4gICAgZ2V0TmV4dElEICgpOiBzdHJpbmcge1xuXG4gICAgICAgIHJldHVybiBgJHsgdGhpcy5wcmVmaXggfSR7IHRoaXMuX25leHQrKyB9JHsgdGhpcy5zdWZmaXggfWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBjb21wb25lbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgQ29uc3RydWN0b3IgfSBmcm9tICcuL2NvbnN0cnVjdG9yJztcblxuZXhwb3J0IGludGVyZmFjZSBIYXNSb2xlIHtcbiAgICByb2xlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNaXhpblJvbGU8VCBleHRlbmRzIHR5cGVvZiBDb21wb25lbnQ+IChCYXNlOiBULCByb2xlOiBzdHJpbmcgPSAnJyk6IFQgJiBDb25zdHJ1Y3RvcjxIYXNSb2xlPiB7XG5cbiAgICBAY29tcG9uZW50KHsgZGVmaW5lOiBmYWxzZSB9KVxuICAgIGNsYXNzIEJhc2VIYXNSb2xlIGV4dGVuZHMgQmFzZSBpbXBsZW1lbnRzIEhhc1JvbGUge1xuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nIH0pXG4gICAgICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgICAgICB0aGlzLnJvbGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgncm9sZScpIHx8IHJvbGU7XG5cbiAgICAgICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIEJhc2VIYXNSb2xlO1xufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuLi9iZWhhdmlvci9iZWhhdmlvcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9jdXNDaGFuZ2VFdmVudERldGFpbCB7XG4gICAgdHlwZTogJ2ZvY3VzaW4nIHwgJ2ZvY3Vzb3V0JztcbiAgICBldmVudDogRm9jdXNFdmVudDtcbiAgICB0YXJnZXQ6IEV2ZW50VGFyZ2V0O1xufVxuXG5leHBvcnQgdHlwZSBGb2N1c0NoYW5nZUV2ZW50ID0gQ3VzdG9tRXZlbnQ8Rm9jdXNDaGFuZ2VFdmVudERldGFpbD47XG5cbmV4cG9ydCBjbGFzcyBGb2N1c01vbml0b3IgZXh0ZW5kcyBCZWhhdmlvciB7XG5cbiAgICBoYXNGb2N1cyA9IGZhbHNlO1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2ZvY3VzaW4nLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzSW4oZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXNvdXQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzT3V0KGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNJbiAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5oYXNGb2N1cyA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2g8Rm9jdXNDaGFuZ2VFdmVudERldGFpbD4oJ2ZvY3VzLWNoYW5nZWQnLCB7IHR5cGU6ICdmb2N1c2luJywgZXZlbnQ6IGV2ZW50LCB0YXJnZXQ6IGV2ZW50LnRhcmdldCEgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNPdXQgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgLy8gaWYgdGhlIHJlbGF0ZWRUYXJnZXQgKHRoZSBlbGVtZW50IHdoaWNoIHdpbGwgcmVjZWl2ZSB0aGUgZm9jdXMgbmV4dCkgaXMgd2l0aGluIHRoZSBtb25pdG9yZWQgZWxlbWVudCxcbiAgICAgICAgLy8gd2UgY2FuIGlnbm9yZSB0aGlzIGV2ZW50OyBpdCB3aWxsIGV2ZW50dWFsbHkgYmUgaGFuZGxlZCBhcyBmb2N1c2luIGV2ZW50IG9mIHRoZSByZWxhdGVkVGFyZ2V0XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnQhID09PSBldmVudC5yZWxhdGVkVGFyZ2V0IHx8IHRoaXMuZWxlbWVudCEuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBOb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0ZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPignZm9jdXMtY2hhbmdlZCcsIHsgdHlwZTogJ2ZvY3Vzb3V0JywgZXZlbnQ6IGV2ZW50LCB0YXJnZXQ6IGV2ZW50LnRhcmdldCEgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDU1NTZWxlY3RvciB9IGZyb20gJy4uL2RvbSc7XG5pbXBvcnQgeyBUYWIgfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IEZvY3VzTW9uaXRvciB9IGZyb20gJy4vZm9jdXMtbW9uaXRvcic7XG5pbXBvcnQgeyBhcHBseURlZmF1bHRzIH0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuZXhwb3J0IGNvbnN0IFRBQkJBQkxFUyA9IFtcbiAgICAnYVtocmVmXTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ2FyZWFbaHJlZl06bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdpbnB1dDpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ3NlbGVjdDpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnaWZyYW1lOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnW2NvbnRlbnRFZGl0YWJsZV06bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuXTtcblxuZXhwb3J0IGludGVyZmFjZSBGb2N1c1RyYXBDb25maWcge1xuICAgIHRhYmJhYmxlU2VsZWN0b3I6IENTU1NlbGVjdG9yO1xuICAgIHdyYXBGb2N1czogYm9vbGVhbjtcbiAgICBhdXRvRm9jdXM6IGJvb2xlYW47XG4gICAgcmVzdG9yZUZvY3VzOiBib29sZWFuO1xuICAgIGluaXRpYWxGb2N1cz86IENTU1NlbGVjdG9yO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRzogRm9jdXNUcmFwQ29uZmlnID0ge1xuICAgIHRhYmJhYmxlU2VsZWN0b3I6IFRBQkJBQkxFUy5qb2luKCcsJyksXG4gICAgd3JhcEZvY3VzOiB0cnVlLFxuICAgIGF1dG9Gb2N1czogdHJ1ZSxcbiAgICByZXN0b3JlRm9jdXM6IHRydWUsXG59O1xuXG5leHBvcnQgY29uc3QgRk9DVVNfVFJBUF9DT05GSUdfRklFTERTOiAoa2V5b2YgRm9jdXNUcmFwQ29uZmlnKVtdID0gW1xuICAgICdhdXRvRm9jdXMnLFxuICAgICd3cmFwRm9jdXMnLFxuICAgICdpbml0aWFsRm9jdXMnLFxuICAgICdyZXN0b3JlRm9jdXMnLFxuICAgICd0YWJiYWJsZVNlbGVjdG9yJyxcbl07XG5cbmV4cG9ydCBjbGFzcyBGb2N1c1RyYXAgZXh0ZW5kcyBGb2N1c01vbml0b3Ige1xuXG4gICAgcHJvdGVjdGVkIHRhYmJhYmxlcyE6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+O1xuXG4gICAgcHJvdGVjdGVkIHN0YXJ0ITogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgZW5kITogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlnOiBGb2N1c1RyYXBDb25maWc7XG5cbiAgICBjb25zdHJ1Y3RvciAoY29uZmlnPzogUGFydGlhbDxGb2N1c1RyYXBDb25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IGFwcGx5RGVmYXVsdHMoY29uZmlnIHx8IHt9LCBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCFzdXBlci5hdHRhY2goZWxlbWVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c0luaXRpYWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdrZXlkb3duJywgKChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KSkgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICByZXR1cm4gc3VwZXIuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgZm9jdXNJbml0aWFsICgpIHtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuaW5pdGlhbEZvY3VzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxGb2N1cyA9IHRoaXMuZWxlbWVudCEucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5jb25maWcuaW5pdGlhbEZvY3VzKTtcblxuICAgICAgICAgICAgaWYgKGluaXRpYWxGb2N1cykge1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbEZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb2N1c1RyYXAgY291bGQgbm90IGZpbmQgaW5pdGlhbEZvY3VzIGVsZW1lbnQgc2VsZWN0b3IgJHsgdGhpcy5jb25maWcuaW5pdGlhbEZvY3VzIH0uIFBvc3NpYmxlIGVycm9yIGluIEZvY3VzVHJhcENvbmZpZy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9jdXNGaXJzdCgpO1xuICAgIH1cblxuICAgIGZvY3VzRmlyc3QgKCkge1xuXG4gICAgICAgIHRoaXMuc3RhcnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBmb2N1c0xhc3QgKCkge1xuXG4gICAgICAgIHRoaXMuZW5kLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICAvLyBUT0RPOiBkb2VzIHRoaXMgd29yayB3aXRoIHNoYWRvd0RPTSBhbmQgcmUtYXR0YWNobWVudCBvZiBvdmVybGF5P1xuICAgICAgICB0aGlzLnRhYmJhYmxlcyA9IHRoaXMuZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbCh0aGlzLmNvbmZpZy50YWJiYWJsZVNlbGVjdG9yKTtcblxuICAgICAgICBjb25zdCBsZW5ndGggPSB0aGlzLnRhYmJhYmxlcy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IGxlbmd0aFxuICAgICAgICAgICAgPyB0aGlzLnRhYmJhYmxlcy5pdGVtKDApXG4gICAgICAgICAgICA6IHRoaXMuZWxlbWVudCE7XG5cbiAgICAgICAgdGhpcy5lbmQgPSBsZW5ndGhcbiAgICAgICAgICAgID8gdGhpcy50YWJiYWJsZXMuaXRlbShsZW5ndGggLSAxKVxuICAgICAgICAgICAgOiB0aGlzLmVsZW1lbnQhO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgVGFiOlxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5zdGFydCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLndyYXBGb2N1cykgdGhpcy5mb2N1c0xhc3QoKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5lbmQpIHtcblxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy53cmFwRm9jdXMpIHRoaXMuZm9jdXNGaXJzdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRm9jdXNUcmFwQ29uZmlnLCBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLCBGT0NVU19UUkFQX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuLi8uLi9mb2N1cy9mb2N1cy10cmFwJztcblxuZXhwb3J0IHR5cGUgT3ZlcmxheVRyaWdnZXJDb25maWcgPSBGb2N1c1RyYXBDb25maWcgJiB7XG4gICAgdHJhcEZvY3VzOiBib29sZWFuO1xuICAgIGNsb3NlT25Fc2NhcGU6IGJvb2xlYW47XG4gICAgY2xvc2VPbkZvY3VzTG9zczogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUc6IE92ZXJsYXlUcmlnZ2VyQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUcsXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxuICAgIHRyYXBGb2N1czogdHJ1ZSxcbiAgICByZXN0b3JlRm9jdXM6IHRydWUsXG4gICAgY2xvc2VPbkVzY2FwZTogdHJ1ZSxcbiAgICBjbG9zZU9uRm9jdXNMb3NzOiB0cnVlLFxufTtcblxuZXhwb3J0IGNvbnN0IE9WRVJMQVlfVFJJR0dFUl9DT05GSUdfRklFTERTOiAoa2V5b2YgT3ZlcmxheVRyaWdnZXJDb25maWcpW10gPSBbXG4gICAgLi4uRk9DVVNfVFJBUF9DT05GSUdfRklFTERTLFxuICAgICd0cmFwRm9jdXMnLFxuICAgICdjbG9zZU9uRXNjYXBlJyxcbiAgICAnY2xvc2VPbkZvY3VzTG9zcycsXG5dO1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZywgUE9TSVRJT05fQ09ORklHX0ZJRUxEUyB9IGZyb20gJy4uL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLCBPdmVybGF5VHJpZ2dlckNvbmZpZywgT1ZFUkxBWV9UUklHR0VSX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuL3RyaWdnZXIvb3ZlcmxheS10cmlnZ2VyLWNvbmZpZyc7XG5cbmV4cG9ydCB0eXBlIE92ZXJsYXlDb25maWcgPSBQb3NpdGlvbkNvbmZpZyAmIE92ZXJsYXlUcmlnZ2VyQ29uZmlnICYge1xuICAgIHBvc2l0aW9uVHlwZTogc3RyaW5nO1xuICAgIHRyaWdnZXI/OiBIVE1MRWxlbWVudDtcbiAgICB0cmlnZ2VyVHlwZTogc3RyaW5nO1xuICAgIHN0YWNrZWQ6IGJvb2xlYW47XG4gICAgdGVtcGxhdGU/OiBUZW1wbGF0ZUZ1bmN0aW9uO1xuICAgIGNvbnRleHQ/OiBDb21wb25lbnQ7XG4gICAgYmFja2Ryb3A6IGJvb2xlYW47XG4gICAgY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBPVkVSTEFZX0NPTkZJR19GSUVMRFM6IChrZXlvZiBPdmVybGF5Q29uZmlnKVtdID0gW1xuICAgIC4uLlBPU0lUSU9OX0NPTkZJR19GSUVMRFMsXG4gICAgLi4uT1ZFUkxBWV9UUklHR0VSX0NPTkZJR19GSUVMRFMsXG4gICAgJ3Bvc2l0aW9uVHlwZScsXG4gICAgJ3RyaWdnZXInLFxuICAgICd0cmlnZ2VyVHlwZScsXG4gICAgJ3N0YWNrZWQnLFxuICAgICd0ZW1wbGF0ZScsXG4gICAgJ2NvbnRleHQnLFxuICAgICdiYWNrZHJvcCcsXG4gICAgJ2Nsb3NlT25CYWNrZHJvcENsaWNrJyxcbl07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX09WRVJMQVlfQ09ORklHOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0ge1xuICAgIC8vIC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIC8vIC4uLkRFRkFVTFRfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRyxcbiAgICBwb3NpdGlvblR5cGU6ICdkZWZhdWx0JyxcbiAgICB0cmlnZ2VyOiB1bmRlZmluZWQsXG4gICAgdHJpZ2dlclR5cGU6ICdkZWZhdWx0JyxcbiAgICBzdGFja2VkOiB0cnVlLFxuICAgIHRlbXBsYXRlOiB1bmRlZmluZWQsXG4gICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgIGJhY2tkcm9wOiB0cnVlLFxuICAgIGNsb3NlT25CYWNrZHJvcENsaWNrOiB0cnVlLFxufTtcbiIsIi8qKlxuICogQSBDU1Mgc2VsZWN0b3Igc3RyaW5nXG4gKlxuICogQHNlZVxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NTU19TZWxlY3RvcnNcbiAqL1xuZXhwb3J0IHR5cGUgQ1NTU2VsZWN0b3IgPSBzdHJpbmc7XG5cbi8qKlxuICogSW5zZXJ0IGEgTm9kZSBhZnRlciBhIHJlZmVyZW5jZSBOb2RlXG4gKlxuICogQHBhcmFtIG5ld0NoaWxkIC0gVGhlIE5vZGUgdG8gaW5zZXJ0XG4gKiBAcGFyYW0gcmVmQ2hpbGQgLSBUaGUgcmVmZXJlbmNlIE5vZGUgYWZ0ZXIgd2hpY2ggdG8gaW5zZXJ0XG4gKiBAcmV0dXJucyBUaGUgaW5zZXJ0ZWQgTm9kZVxuICovXG5leHBvcnQgY29uc3QgaW5zZXJ0QWZ0ZXIgPSA8VCBleHRlbmRzIE5vZGU+IChuZXdDaGlsZDogVCwgcmVmQ2hpbGQ6IE5vZGUpOiBUIHwgdW5kZWZpbmVkID0+IHtcblxuICAgIHJldHVybiByZWZDaGlsZC5wYXJlbnROb2RlPy5pbnNlcnRCZWZvcmUobmV3Q2hpbGQsIHJlZkNoaWxkLm5leHRTaWJsaW5nKTtcbn07XG5cbi8qKlxuICogUmVwbGFjZSBhIHJlZmVyZW5jZSBOb2RlIHdpdGggYSBuZXcgTm9kZVxuICpcbiAqIEBwYXJhbSBuZXdDaGlsZCAtIFRoZSBOb2RlIHRvIGluc2VydFxuICogQHBhcmFtIHJlZkNoaWxkIC0gVGhlIHJlZmVyZW5jZSBOb2RlIHRvIHJlcGxhY2VcbiAqIEByZXR1cm5zIFRoZSByZXBsYWNlZCByZWZlcmVuY2UgTm9kZVxuICovXG5leHBvcnQgY29uc3QgcmVwbGFjZVdpdGggPSA8VCBleHRlbmRzIE5vZGUsIFUgZXh0ZW5kcyBOb2RlPiAobmV3Q2hpbGQ6IFQsIHJlZkNoaWxkOiBVKTogVSB8IHVuZGVmaW5lZCA9PiB7XG5cbiAgICByZXR1cm4gcmVmQ2hpbGQucGFyZW50Tm9kZT8ucmVwbGFjZUNoaWxkKG5ld0NoaWxkLCByZWZDaGlsZCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50bHkgYWN0aXZlIGVsZW1lbnRcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEdldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWxlbWVudCwgYnV0IHBpZXJjZXMgc2hhZG93IHJvb3RzIHRvIGZpbmQgdGhlIGFjdGl2ZSBlbGVtZW50XG4gKiBhbHNvIHdpdGhpbiBhIGN1c3RvbSBlbGVtZW50IHdoaWNoIGhhcyBhIHNoYWRvdyByb290LlxuICovXG5leHBvcnQgY29uc3QgYWN0aXZlRWxlbWVudCA9ICgpOiBIVE1MRWxlbWVudCA9PiB7XG5cbiAgICBsZXQgcm9vdDogRG9jdW1lbnRPclNoYWRvd1Jvb3QgfCBudWxsID0gZG9jdW1lbnQ7XG5cbiAgICBsZXQgZWxlbWVudDtcblxuICAgIHdoaWxlIChyb290ICYmIChlbGVtZW50ID0gcm9vdC5hY3RpdmVFbGVtZW50KSkge1xuXG4gICAgICAgIHJvb3QgPSBlbGVtZW50LnNoYWRvd1Jvb3Q7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcbn1cbiIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuLi8uLi9iZWhhdmlvci9iZWhhdmlvcic7XG5pbXBvcnQgeyBhY3RpdmVFbGVtZW50IH0gZnJvbSAnLi4vLi4vZG9tJztcbmltcG9ydCB7IEZvY3VzQ2hhbmdlRXZlbnQsIEZvY3VzTW9uaXRvciB9IGZyb20gJy4uLy4uL2ZvY3VzL2ZvY3VzLW1vbml0b3InO1xuaW1wb3J0IHsgRm9jdXNUcmFwIH0gZnJvbSAnLi4vLi4vZm9jdXMvZm9jdXMtdHJhcCc7XG5pbXBvcnQgeyBFc2NhcGUgfSBmcm9tICcuLi8uLi9rZXlzJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuLi9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIHByZXZpb3VzRm9jdXM6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblxuICAgIHByb3RlY3RlZCBmb2N1c0JlaGF2aW9yPzogRm9jdXNNb25pdG9yO1xuXG4gICAgY29uc3RydWN0b3IgKHByb3RlY3RlZCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheVRyaWdnZXJDb25maWc+LCBwdWJsaWMgb3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5mb2N1c0JlaGF2aW9yID0gdGhpcy5jb25maWcudHJhcEZvY3VzXG4gICAgICAgICAgICA/IG5ldyBGb2N1c1RyYXAodGhpcy5jb25maWcpXG4gICAgICAgICAgICA6IG5ldyBGb2N1c01vbml0b3IoKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnb3Blbi1jaGFuZ2VkJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVPcGVuQ2hhbmdlKGV2ZW50IGFzIFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnZm9jdXMtY2hhbmdlZCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNDaGFuZ2UoZXZlbnQgYXMgRm9jdXNDaGFuZ2VFdmVudCkpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2tleWRvd24nLCBldmVudCA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJlbW92ZSBldmVudCBwYXJhbWV0ZXIuLi5cbiAgICBvcGVuIChldmVudD86IEV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGNsb3NlIChldmVudD86IEV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0b2dnbGUgKGV2ZW50PzogRXZlbnQsIG9wZW4/OiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSBvcGVuID8/ICF0aGlzLm92ZXJsYXkub3BlbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZSAoZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pIHtcblxuICAgICAgICBjb25zdCBvcGVuID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQ7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLmhhbmRsZU9wZW5DaGFuZ2UoKS4uLicsIGV2ZW50KTtcblxuICAgICAgICBpZiAob3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlRm9jdXMoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZm9jdXNCZWhhdmlvcikge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c0JlaGF2aW9yLmF0dGFjaCh0aGlzLm92ZXJsYXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzQmVoYXZpb3IpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNCZWhhdmlvci5kZXRhY2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0NoYW5nZSAoZXZlbnQ6IEZvY3VzQ2hhbmdlRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBoYXNGb2N1cyA9IGV2ZW50LmRldGFpbC50eXBlID09PSAnZm9jdXNpbic7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLmhhbmRsZUZvY3VzQ2hhbmdlKCkuLi4nLCBoYXNGb2N1cyk7XG5cbiAgICAgICAgaWYgKCFoYXNGb2N1cykge1xuXG4gICAgICAgICAgICAvLyB3aGVuIGxvb3NpbmcgZm9jdXMsIHdlIHdhaXQgZm9yIHBvdGVudGlhbCBmb2N1c2luIGV2ZW50cyBvbiBjaGlsZCBvciBwYXJlbnQgb3ZlcmxheXMgYnkgZGVsYXlpbmdcbiAgICAgICAgICAgIC8vIHRoZSBhY3RpdmUgY2hlY2sgaW4gYSBuZXcgbWFjcm90YXNrIHZpYSBzZXRUaW1lb3V0XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gd2UgY2hlY2sgaWYgdGhlIG92ZXJsYXkgaXMgYWN0aXZlIGFuZCBpZiBub3QsIHdlIGNsb3NlIGl0XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXkuc3RhdGljLmlzT3ZlcmxheUFjdGl2ZSh0aGlzLm92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byBnZXQgdGhlIHBhcmVudCBiZWZvcmUgY2xvc2luZyB0aGUgb3ZlcmxheSAtIHdoZW4gb3ZlcmxheSBpcyBjbG9zZWQsIGl0IGRvZXNuJ3QgaGF2ZSBhIHBhcmVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLm92ZXJsYXkuc3RhdGljLmdldFBhcmVudE92ZXJsYXkodGhpcy5vdmVybGF5KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuY2xvc2VPbkZvY3VzTG9zcykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIHBhcmVudCBvdmVybGF5LCB3ZSBsZXQgdGhlIHBhcmVudCBrbm93IHRoYXQgb3VyIG92ZXJsYXkgaGFzIGxvc3QgZm9jdXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBieSBkaXNwYXRjaGluZyB0aGUgRm9jdXNDaGFuZ2VFdmVudCBvbiB0aGUgcGFyZW50IG92ZXJsYXkgdG8gYmUgaGFuZGxlZCBvciBpZ25vcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBieSB0aGUgcGFyZW50J3MgT3ZlcmxheVRyaWdnZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLmhhbmRsZUtleWRvd24oKS4uLicsIGV2ZW50KTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEVzY2FwZTpcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5Lm9wZW4gfHwgIXRoaXMuY29uZmlnLmNsb3NlT25Fc2NhcGUpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcucmVzdG9yZUZvY3VzKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLm92ZXJsYXksICdvcGVuLWNoYW5nZWQnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uY2U6IG9wZW4tY2hhbmdlZCByZXN0b3JlRm9jdXMuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlRm9jdXMoKTtcblxuICAgICAgICAgICAgICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxuICAgIHByb3RlY3RlZCBzdG9yZUZvY3VzICgpIHtcblxuICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMgPSBhY3RpdmVFbGVtZW50KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLnN0b3JlRm9jdXMoKS4uLicsIHRoaXMucHJldmlvdXNGb2N1cyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlc3RvcmVGb2N1cyAoKSB7XG5cbiAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzLmZvY3VzKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLnJlc3RvcmVGb2N1cygpLi4uJywgdGhpcy5wcmV2aW91c0ZvY3VzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQcm9wZXJ0eUNoYW5nZUV2ZW50IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4uLy4uL2tleXMnO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcblxuZXhwb3J0IGNvbnN0IERJQUxPR19PVkVSTEFZX1RSSUdHRVJfQ09ORklHOiBPdmVybGF5VHJpZ2dlckNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUdcbn07XG5cbmV4cG9ydCBjbGFzcyBEaWFsb2dPdmVybGF5VHJpZ2dlciBleHRlbmRzIE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJywgJ2RpYWxvZycpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdjbGljaycsIChldmVudDogRXZlbnQpID0+IHRoaXMuaGFuZGxlQ2xpY2soZXZlbnQgYXMgTW91c2VFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAna2V5ZG93bicsIChldmVudDogRXZlbnQpID0+IHRoaXMuaGFuZGxlS2V5ZG93bihldmVudCBhcyBLZXlib2FyZEV2ZW50KSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyk7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLm92ZXJsYXkub3BlbiA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuQ2hhbmdlIChldmVudDogUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikge1xuXG4gICAgICAgIHN1cGVyLmhhbmRsZU9wZW5DaGFuZ2UoZXZlbnQpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEVudGVyOlxuICAgICAgICAgICAgY2FzZSBTcGFjZTpcblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBldmVudHMgdGhhdCBoYXBwZW4gb24gdGhlIHRyaWdnZXIgZWxlbWVudFxuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcblxuICAgICAgICAgICAgICAgIHN1cGVyLmhhbmRsZUtleWRvd24oZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcblxuZXhwb3J0IGNvbnN0IFRPT0xUSVBfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRzogT3ZlcmxheVRyaWdnZXJDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxuICAgIHRyYXBGb2N1czogZmFsc2UsXG4gICAgYXV0b0ZvY3VzOiBmYWxzZSxcbiAgICByZXN0b3JlRm9jdXM6IGZhbHNlLFxufTtcblxuZXhwb3J0IGNsYXNzIFRvb2x0aXBPdmVybGF5VHJpZ2dlciBleHRlbmRzIE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5yb2xlID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGhpcy5vdmVybGF5LmlkKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VlbnRlcicsIChldmVudCkgPT4gdGhpcy5vcGVuKGV2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdtb3VzZWxlYXZlJywgKGV2ZW50KSA9PiB0aGlzLmNsb3NlKGV2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdmb2N1cycsIChldmVudCkgPT4gdGhpcy5vcGVuKGV2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdibHVyJywgKGV2ZW50KSA9PiB0aGlzLmNsb3NlKGV2ZW50KSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcblxuICAgICAgICByZXR1cm4gc3VwZXIuZGV0YWNoKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3JGYWN0b3J5LCBCZWhhdmlvck1hcCwgQ29uZmlndXJhdGlvbk1hcCB9IGZyb20gJ2V4YW1wbGUvc3JjL2JlaGF2aW9yL2JlaGF2aW9yLWZhY3RvcnknO1xuaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4uL292ZXJsYXknO1xuaW1wb3J0IHsgRGlhbG9nT3ZlcmxheVRyaWdnZXIsIERJQUxPR19PVkVSTEFZX1RSSUdHRVJfQ09ORklHIH0gZnJvbSAnLi9kaWFsb2ctb3ZlcmxheS10cmlnZ2VyJztcbmltcG9ydCB7IE92ZXJsYXlUcmlnZ2VyIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXInO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLCBPdmVybGF5VHJpZ2dlckNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS10cmlnZ2VyLWNvbmZpZyc7XG5pbXBvcnQgeyBUb29sdGlwT3ZlcmxheVRyaWdnZXIsIFRPT0xUSVBfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRyB9IGZyb20gJy4vdG9vbHRpcC1vdmVybGF5LXRyaWdnZXInO1xuXG5leHBvcnQgdHlwZSBPdmVybGF5VHJpZ2dlclR5cGVzID0gJ2RlZmF1bHQnIHwgJ2RpYWxvZycgfCAndG9vbHRpcCc7XG5cbmV4cG9ydCBjb25zdCBPVkVSTEFZX1RSSUdHRVJTOiBCZWhhdmlvck1hcDxPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJUeXBlcz4gPSB7XG4gICAgZGVmYXVsdDogT3ZlcmxheVRyaWdnZXIsXG4gICAgZGlhbG9nOiBEaWFsb2dPdmVybGF5VHJpZ2dlcixcbiAgICB0b29sdGlwOiBUb29sdGlwT3ZlcmxheVRyaWdnZXIsXG59O1xuXG5leHBvcnQgY29uc3QgT1ZFUkxBWV9UUklHR0VSX0NPTkZJR1M6IENvbmZpZ3VyYXRpb25NYXA8T3ZlcmxheVRyaWdnZXJDb25maWcsIE92ZXJsYXlUcmlnZ2VyVHlwZXM+ID0ge1xuICAgIGRlZmF1bHQ6IERFRkFVTFRfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRyxcbiAgICBkaWFsb2c6IERJQUxPR19PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxuICAgIHRvb2x0aXA6IFRPT0xUSVBfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRyxcbn07XG5cbmV4cG9ydCBjbGFzcyBPdmVybGF5VHJpZ2dlckZhY3RvcnkgZXh0ZW5kcyBCZWhhdmlvckZhY3Rvcnk8T3ZlcmxheVRyaWdnZXIsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnLCBPdmVybGF5VHJpZ2dlclR5cGVzPiB7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBiZWhhdmlvcnMgPSBPVkVSTEFZX1RSSUdHRVJTLFxuICAgICAgICBwcm90ZWN0ZWQgY29uZmlndXJhdGlvbnMgPSBPVkVSTEFZX1RSSUdHRVJfQ09ORklHUyxcbiAgICApIHtcblxuICAgICAgICBzdXBlcihiZWhhdmlvcnMsIGNvbmZpZ3VyYXRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUge0BsaW5rIGNyZWF0ZX0gbWV0aG9kIHRvIGVuZm9yY2UgdGhlIG92ZXJsYXkgcGFyYW1ldGVyXG4gICAgICovXG4gICAgY3JlYXRlIChcbiAgICAgICAgdHlwZTogT3ZlcmxheVRyaWdnZXJUeXBlcyxcbiAgICAgICAgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlUcmlnZ2VyQ29uZmlnPixcbiAgICAgICAgb3ZlcmxheTogT3ZlcmxheSxcbiAgICAgICAgLi4uYXJnczogYW55W11cbiAgICApOiBPdmVybGF5VHJpZ2dlciB7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLmNyZWF0ZSh0eXBlLCBjb25maWcsIG92ZXJsYXksIC4uLmFyZ3MpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSwgUHJvcGVydHlDaGFuZ2VFdmVudCwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEJlaGF2aW9yRmFjdG9yeSB9IGZyb20gJy4uL2JlaGF2aW9yL2JlaGF2aW9yLWZhY3RvcnknO1xuaW1wb3J0IHsgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCB7IElER2VuZXJhdG9yIH0gZnJvbSAnLi4vaWQtZ2VuZXJhdG9yJztcbmltcG9ydCB7IE1peGluUm9sZSB9IGZyb20gJy4uL21peGlucy9yb2xlJztcbmltcG9ydCB7IFBvc2l0aW9uQ29uZmlnLCBQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuaW1wb3J0IHsgUG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSB9IGZyb20gJy4uL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbnRyb2xsZXItZmFjdG9yeSc7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfQ09ORklHLCBPdmVybGF5Q29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LWNvbmZpZyc7XG5pbXBvcnQgeyBPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJDb25maWcsIE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSB9IGZyb20gJy4vdHJpZ2dlcic7XG5pbXBvcnQgeyByZXBsYWNlV2l0aCwgaW5zZXJ0QWZ0ZXIgfSBmcm9tICcuLi9kb20nO1xuXG5jb25zdCBBTFJFQURZX0lOSVRJQUxJWkVEX0VSUk9SID0gKCkgPT4gbmV3IEVycm9yKCdDYW5ub3QgaW5pdGlhbGl6ZSBPdmVybGF5LiBPdmVybGF5IGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQuJyk7XG5cbmNvbnN0IEFMUkVBRFlfUkVHSVNURVJFRF9FUlJPUiA9IChvdmVybGF5OiBPdmVybGF5KSA9PiBuZXcgRXJyb3IoYE92ZXJsYXkgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkOiAkeyBvdmVybGF5LmlkIH0uYCk7XG5cbmNvbnN0IE5PVF9SRUdJU1RFUkVEX0VSUk9SID0gKG92ZXJsYXk6IE92ZXJsYXkpID0+IG5ldyBFcnJvcihgT3ZlcmxheSBpcyBub3QgcmVnaXN0ZXJlZDogJHsgb3ZlcmxheS5pZCB9LmApO1xuXG5jb25zdCBUSFJPV19VTlJFR0lTVEVSRURfT1ZFUkxBWSA9IChvdmVybGF5OiBPdmVybGF5KSA9PiB7XG5cbiAgICBpZiAoIShvdmVybGF5LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBPdmVybGF5KS5pc092ZXJsYXlSZWdpc3RlcmVkKG92ZXJsYXkpKSB7XG5cbiAgICAgICAgdGhyb3cgTk9UX1JFR0lTVEVSRURfRVJST1Iob3ZlcmxheSk7XG4gICAgfVxufVxuXG5jb25zdCBJRF9HRU5FUkFUT1IgPSBuZXcgSURHZW5lcmF0b3IoJ3BhcnRraXQtb3ZlcmxheS0nKTtcblxuZXhwb3J0IGludGVyZmFjZSBPdmVybGF5SW5pdCB7XG4gICAgb3ZlcmxheVRyaWdnZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8T3ZlcmxheVRyaWdnZXIsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnPjtcbiAgICBwb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8UG9zaXRpb25Db250cm9sbGVyLCBQb3NpdGlvbkNvbmZpZz47XG4gICAgb3ZlcmxheVJvb3Q6IEhUTUxFbGVtZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlTZXR0aW5ncyB7XG4gICAgLy8gVE9ETzogY2hlY2sgaWYgd2UgbmVlZCB0byBzdG9yZSBjb25maWcuLi5cbiAgICBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz47XG4gICAgZXZlbnRzOiBFdmVudE1hbmFnZXI7XG4gICAgcG9zaXRpb25Db250cm9sbGVyPzogUG9zaXRpb25Db250cm9sbGVyO1xuICAgIG92ZXJsYXlUcmlnZ2VyPzogT3ZlcmxheVRyaWdnZXI7XG59XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktb3ZlcmxheScsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgI2JmYmZiZjtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGAsXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBNaXhpblJvbGUoQ29tcG9uZW50LCAnZGlhbG9nJykge1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfb3ZlcmxheVRyaWdnZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8T3ZlcmxheVRyaWdnZXIsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnPiA9IG5ldyBPdmVybGF5VHJpZ2dlckZhY3RvcnkoKTtcblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9wb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8UG9zaXRpb25Db250cm9sbGVyLCBQb3NpdGlvbkNvbmZpZz4gPSBuZXcgUG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSgpO1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX292ZXJsYXlSb290OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG5cbiAgICBwcm90ZWN0ZWQgc3RhdGljIHJlZ2lzdGVyZWRPdmVybGF5cyA9IG5ldyBNYXA8T3ZlcmxheSwgT3ZlcmxheVNldHRpbmdzPigpO1xuXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBhY3RpdmVPdmVybGF5cyA9IG5ldyBTZXQ8T3ZlcmxheT4oKTtcblxuICAgIHN0YXRpYyBnZXQgb3ZlcmxheVRyaWdnZXJGYWN0b3J5ICgpOiBCZWhhdmlvckZhY3Rvcnk8T3ZlcmxheVRyaWdnZXIsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJsYXlUcmlnZ2VyRmFjdG9yeTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkgKCk6IEJlaGF2aW9yRmFjdG9yeTxQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uQ29uZmlnPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uQ29udHJvbGxlckZhY3Rvcnk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvdmVybGF5Um9vdCAoKTogSFRNTEVsZW1lbnQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9vdmVybGF5Um9vdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGlzSW5pdGlhbGl6ZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsaXplZDtcbiAgICB9XG5cbiAgICBzdGF0aWMgaW5pdGlhbGl6ZSAoY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlJbml0Pikge1xuXG4gICAgICAgIGlmICh0aGlzLmlzSW5pdGlhbGl6ZWQpIHRocm93IEFMUkVBRFlfSU5JVElBTElaRURfRVJST1IoKTtcblxuICAgICAgICB0aGlzLl9vdmVybGF5VHJpZ2dlckZhY3RvcnkgPSBjb25maWcub3ZlcmxheVRyaWdnZXJGYWN0b3J5IHx8IHRoaXMuX292ZXJsYXlUcmlnZ2VyRmFjdG9yeTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSA9IGNvbmZpZy5wb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5IHx8IHRoaXMuX3Bvc2l0aW9uQ29udHJvbGxlckZhY3Rvcnk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSb290ID0gY29uZmlnLm92ZXJsYXlSb290IHx8IHRoaXMuX292ZXJsYXlSb290O1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaXNPdmVybGF5UmVnaXN0ZXJlZCAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5oYXMob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBBbiBvdmVybGF5IGlzIGNvbnNpZGVyZWQgZm9jdXNlZCwgaWYgZWl0aGVyIGl0c2VsZiBvciBhbnkgb2YgaXRzIGRlc2NlbmRhbnQgbm9kZXMgaGFzIGZvY3VzLlxuICAgICovXG4gICAgc3RhdGljIGlzT3ZlcmxheUZvY3VzZWQgKG92ZXJsYXk6IE92ZXJsYXkpOiBib29sZWFuIHtcblxuICAgICAgICBUSFJPV19VTlJFR0lTVEVSRURfT1ZFUkxBWShvdmVybGF5KTtcblxuICAgICAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICByZXR1cm4gb3ZlcmxheSA9PT0gYWN0aXZlRWxlbWVudCB8fCBvdmVybGF5LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIG92ZXJsYXkgaXMgY29uc2lkZXJlZCBhY3RpdmUgaWYgaXQgaXMgZWl0aGVyIGZvY3VzZWQgb3IgaGFzIGEgZGVzY2VuZGFudCBvdmVybGF5IHdoaWNoIGlzIGZvY3VzZWQuXG4gICAgICovXG4gICAgc3RhdGljIGlzT3ZlcmxheUFjdGl2ZSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIFRIUk9XX1VOUkVHSVNURVJFRF9PVkVSTEFZKG92ZXJsYXkpO1xuXG4gICAgICAgIGxldCBpc0ZvdW5kID0gZmFsc2U7XG4gICAgICAgIGxldCBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChvdmVybGF5LmNvbmZpZy5zdGFja2VkICYmIG92ZXJsYXkub3Blbikge1xuXG4gICAgICAgICAgICBmb3IgKGxldCBjdXJyZW50IG9mIHRoaXMuYWN0aXZlT3ZlcmxheXMpIHtcblxuICAgICAgICAgICAgICAgIGlzRm91bmQgPSBpc0ZvdW5kIHx8IGN1cnJlbnQgPT09IG92ZXJsYXk7XG5cbiAgICAgICAgICAgICAgICBpc0FjdGl2ZSA9IGlzRm91bmQgJiYgdGhpcy5pc092ZXJsYXlGb2N1c2VkKGN1cnJlbnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzQWN0aXZlKSBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc0FjdGl2ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHBhcmVudCBvdmVybGF5IG9mIGFuIGFjdGl2ZSBvdmVybGF5XG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBJZiBhbiBvdmVybGF5IGlzIHN0YWNrZWQsIGl0cyBwYXJlbnQgb3ZlcmxheSBpcyB0aGUgb25lIGZyb20gd2hpY2ggaXQgd2FzIG9wZW5lZC5cbiAgICAgKiBUaGlzIHBhcmVudCBvdmVybGF5IHdpbGwgYmUgaW4gdGhlIGFjdGl2ZU92ZXJsYXlzIHN0YWNrIGp1c3QgYmVmb3JlIHRoaXMgb25lLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRQYXJlbnRPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KTogT3ZlcmxheSB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgVEhST1dfVU5SRUdJU1RFUkVEX09WRVJMQVkob3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKG92ZXJsYXkuY29uZmlnLnN0YWNrZWQgJiYgb3ZlcmxheS5vcGVuKSB7XG5cbiAgICAgICAgICAgIC8vIHdlIHN0YXJ0IHdpdGggcGFyZW50IGJlaW5nIHVuZGVmaW5lZFxuICAgICAgICAgICAgLy8gaWYgdGhlIGZpcnN0IGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzZXQgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIG92ZXJsYXlcbiAgICAgICAgICAgIC8vIHRoZW4gaW5kZWVkIHRoZSBvdmVybGF5IGhhcyBubyBwYXJlbnQgKHRoZSBmaXJzdCBhY3RpdmUgb3ZlcmxheSBpcyB0aGUgcm9vdClcbiAgICAgICAgICAgIGxldCBwYXJlbnQ6IE92ZXJsYXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggdGhlIGFjdGl2ZSBvdmVybGF5c1xuICAgICAgICAgICAgZm9yIChsZXQgY3VycmVudCBvZiB0aGlzLmFjdGl2ZU92ZXJsYXlzKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBoYXZlIHJlYWNoZWQgdGhlIHNwZWNpZmllZCBhY3RpdmUgb3ZlcmxheVxuICAgICAgICAgICAgICAgIC8vIHdlIGNhbiByZXR1cm4gdGhlIHBhcmVudCBvZiB0aGF0IG92ZXJsYXkgKGl0J3MgdGhlIGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzZXQganVzdCBiZWZvcmUgdGhpcyBvbmUpXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IG92ZXJsYXkpIHJldHVybiBwYXJlbnQ7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBoYXZlbid0IGZvdW5kIHRoZSBzcGVjaWZpZWQgb3ZlcmxheSB5ZXQsIHdlIHNldFxuICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IG92ZXJsYXkgYXMgcG90ZW50aWFsIHBhcmVudCBhbmQgbW92ZSBvblxuICAgICAgICAgICAgICAgIHBhcmVudCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAqIENyZWF0ZSBhIG5ldyBvdmVybGF5XG4gICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlT3ZlcmxheSAoY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+KTogT3ZlcmxheSB7XG5cbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoT3ZlcmxheS5zZWxlY3RvcikgYXMgT3ZlcmxheTtcblxuICAgICAgICBvdmVybGF5LmNvbmZpZyA9IHsgLi4uREVGQVVMVF9PVkVSTEFZX0NPTkZJRywgLi4uY29uZmlnIH0gYXMgT3ZlcmxheUNvbmZpZztcblxuICAgICAgICByZXR1cm4gb3ZlcmxheTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZGlzcG9zZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBvdmVybGF5LnBhcmVudEVsZW1lbnQ/LnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBvdmVybGF5J3MgY29uZmlndXJ0aW9uXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluaXRpYWxseSBfY29uZmlnIG9ubHkgY29udGFpbnMgYSBwYXJ0aWFsIE92ZXJsYXlDb25maWcsIGJ1dCBvbmNlIHRoZSBvdmVybGF5IGluc3RhbmNlIGhhcyBiZWVuXG4gICAgICogcmVnaXN0ZXJlZCwgX2NvbmZpZyB3aWxsIGJlIGEgZnVsbCBPdmVybGF5Q29uZmlnLiBUaGlzIGlzIHRvIGFsbG93IHRoZSBCZWhhdmlvckZhY3RvcmllcyBmb3JcbiAgICAgKiBwb3NpdGlvbiBhbmQgdHJpZ2dlciB0byBhcHBseSB0aGVpciBkZWZhdWx0IGNvbmZpZ3VyYXRpb24sIGJhc2VkIG9uIHRoZSBiZWhhdmlvciB0eXBlIHdoaWNoIGlzXG4gICAgICogY3JlYXRlZCBieSB0aGUgZmFjdG9yaWVzLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogKi9cbiAgICBwcm90ZWN0ZWQgX2NvbmZpZzogT3ZlcmxheUNvbmZpZyA9IHsgLi4uREVGQVVMVF9PVkVSTEFZX0NPTkZJRyB9IGFzIE92ZXJsYXlDb25maWc7XG5cbiAgICBwcm90ZWN0ZWQgbWFya2VyPzogQ29tbWVudDtcblxuICAgIHByb3RlY3RlZCBpc1JlYXR0YWNoaW5nID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXggPSAtMTtcblxuICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiB9KVxuICAgIG9wZW4gPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICBzZXQgY29uZmlnICh2YWx1ZTogT3ZlcmxheUNvbmZpZykge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdzZXQgY29uZmlnOiAnLCB2YWx1ZSk7XG4gICAgICAgIHRoaXMuX2NvbmZpZyA9IE9iamVjdC5hc3NpZ24odGhpcy5fY29uZmlnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGNvbmZpZyAoKTogT3ZlcmxheUNvbmZpZyB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgc2V0IG9yaWdpbiAodmFsdWU6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCAndmlld3BvcnQnKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3NldCBvcmlnaW46ICcsIHZhbHVlKTtcbiAgICAgICAgdGhpcy5jb25maWcub3JpZ2luID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCBvcmlnaW4gKCk6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCAndmlld3BvcnQnIHtcblxuICAgICAgICAvLyBUT0RPOiBmaXggdHlwaW5ncyBmb3Igb3JpZ2luIChyZW1vdmUgQ1NTU2VsZWN0b3IpXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5vcmlnaW4gYXMgUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8ICd2aWV3cG9ydCc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcgfSlcbiAgICBzZXQgcG9zaXRpb25UeXBlICh2YWx1ZTogc3RyaW5nKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3NldCBwb3NpdGlvblR5cGU6ICcsIHZhbHVlKTtcbiAgICAgICAgdGhpcy5jb25maWcucG9zaXRpb25UeXBlID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCBwb3NpdGlvblR5cGUgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBvc2l0aW9uVHlwZTtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgc2V0IHRyaWdnZXIgKHZhbHVlOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdzZXQgdHJpZ2dlcjogJywgdmFsdWUpO1xuICAgICAgICB0aGlzLmNvbmZpZy50cmlnZ2VyID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCB0cmlnZ2VyICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnRyaWdnZXI7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcgfSlcbiAgICBzZXQgdHJpZ2dlclR5cGUgKHZhbHVlOiBzdHJpbmcpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnc2V0IHRyaWdnZXJUeXBlOiAnLCB2YWx1ZSk7XG4gICAgICAgIHRoaXMuY29uZmlnLnRyaWdnZXJUeXBlID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCB0cmlnZ2VyVHlwZSAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcudHJpZ2dlclR5cGU7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXRpYyAoKTogdHlwZW9mIE92ZXJsYXkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBPdmVybGF5O1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBpZiAodGhpcy5pc1JlYXR0YWNoaW5nKSByZXR1cm47XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBJRF9HRU5FUkFUT1IuZ2V0TmV4dElEKCk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcigpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBpZiAodGhpcy5pc1JlYXR0YWNoaW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyKCk7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgYCR7ICF0aGlzLm9wZW4gfWApO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRpYy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KHRoaXMpPy5vdmVybGF5VHJpZ2dlcj8uYXR0YWNoKHRoaXMuY29uZmlnLnRyaWdnZXIpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5LnVwZGF0ZUNhbGxiYWNrKCkuLi4gY29uZmlnOiAnLCB0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLmhhcygnb3BlbicpKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBgJHsgIXRoaXMub3BlbiB9YCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnR5KCdvcGVuJywgY2hhbmdlcy5nZXQoJ29wZW4nKSwgdGhpcy5vcGVuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYW5nZXMuaGFzKCd0cmlnZ2VyJykgfHwgY2hhbmdlcy5oYXMoJ29yaWdpbicpIHx8IGNoYW5nZXMuaGFzKCd0cmlnZ2VyVHlwZScpIHx8IGNoYW5nZXMuaGFzKCdwb3NpdGlvblR5cGUnKSkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0aGUgb3ZlcmxheSdzIG9wZW4tY2hhbmdlZCBldmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIGFyZSBkaXNwYXRjaGVkIGR1cmluZyB0aGUgdXBkYXRlIGN5Y2xlIG9mIHRoZSBjb21wb25lbnQsIHNvIHRoZXkgcnVuIGluXG4gICAgICogYW4gYW5pbWF0aW9uRnJhbWUgY2FsbGJhY2suIFdlIGNhbiB0aGVyZWZvcmUgcnVuIGNvZGUgaW4gdGhlc2UgaGFuZGxlcnMsIHdoaWNoIHJ1bnMgaW5zaWRlXG4gICAgICogYW4gYW5pbWF0aW9uRnJhbWUsIGxpa2UgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5IHdpdGhvdXQgc2NoZWR1bGluZyBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAnb3Blbi1jaGFuZ2VkJywgb3B0aW9uczogeyBjYXB0dXJlOiB0cnVlIH0gfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZWQgKGV2ZW50OiBQcm9wZXJ0eUNoYW5nZUV2ZW50PGJvb2xlYW4+KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXkuaGFuZGxlT3BlbkNoYW5nZSgpLi4uJywgZXZlbnQuZGV0YWlsLmN1cnJlbnQpO1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXlSb290ID0gdGhpcy5zdGF0aWMub3ZlcmxheVJvb3Q7XG5cbiAgICAgICAgdGhpcy5pc1JlYXR0YWNoaW5nID0gdHJ1ZTtcblxuICAgICAgICBpZiAoZXZlbnQuZGV0YWlsLmN1cnJlbnQgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgdGhpcy5tYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KHRoaXMuaWQpO1xuXG4gICAgICAgICAgICByZXBsYWNlV2l0aCh0aGlzLm1hcmtlciwgdGhpcyk7XG5cbiAgICAgICAgICAgIG92ZXJsYXlSb290LmFwcGVuZENoaWxkKHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRpYy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KHRoaXMpPy5wb3NpdGlvbkNvbnRyb2xsZXI/LmF0dGFjaCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGljLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQodGhpcyk/LnBvc2l0aW9uQ29udHJvbGxlcj8udXBkYXRlKCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmVwbGFjZVdpdGgodGhpcywgdGhpcy5tYXJrZXIhKTtcblxuICAgICAgICAgICAgdGhpcy5tYXJrZXIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhdGljLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQodGhpcyk/LnBvc2l0aW9uQ29udHJvbGxlcj8uZGV0YWNoKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzUmVhdHRhY2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVnaXN0ZXIgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRpYy5pc092ZXJsYXlSZWdpc3RlcmVkKHRoaXMpKSB0aHJvdyBBTFJFQURZX1JFR0lTVEVSRURfRVJST1IodGhpcyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJseS5yZWdpc3RlcigpLi4uIGNvbmZpZzogJywgdGhpcy5jb25maWcpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBPdmVybGF5U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgICAgICAgZXZlbnRzOiBuZXcgRXZlbnRNYW5hZ2VyKCksXG4gICAgICAgICAgICBvdmVybGF5VHJpZ2dlcjogdGhpcy5zdGF0aWMub3ZlcmxheVRyaWdnZXJGYWN0b3J5LmNyZWF0ZSh0aGlzLmNvbmZpZy50cmlnZ2VyVHlwZSwgdGhpcy5jb25maWcsIHRoaXMpLFxuICAgICAgICAgICAgcG9zaXRpb25Db250cm9sbGVyOiB0aGlzLnN0YXRpYy5wb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5LmNyZWF0ZSh0aGlzLmNvbmZpZy5wb3NpdGlvblR5cGUsIHRoaXMuY29uZmlnKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnN0YXRpYy5yZWdpc3RlcmVkT3ZlcmxheXMuc2V0KHRoaXMsIHNldHRpbmdzKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgdW5yZWdpc3RlciAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRpYy5pc092ZXJsYXlSZWdpc3RlcmVkKHRoaXMpKSB0aHJvdyBOT1RfUkVHSVNURVJFRF9FUlJPUih0aGlzKTtcblxuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuc3RhdGljLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQodGhpcykhO1xuXG4gICAgICAgIHNldHRpbmdzLm92ZXJsYXlUcmlnZ2VyPy5kZXRhY2goKTtcbiAgICAgICAgc2V0dGluZ3MucG9zaXRpb25Db250cm9sbGVyPy5kZXRhY2goKTtcblxuICAgICAgICBzZXR0aW5ncy5vdmVybGF5VHJpZ2dlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgc2V0dGluZ3MucG9zaXRpb25Db250cm9sbGVyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMuc3RhdGljLnJlZ2lzdGVyZWRPdmVybGF5cy5kZWxldGUodGhpcyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvbmZpZ3VyZSAoY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0ge30pIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheS5jb25maWd1cmUoKS4uLicpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5zdGF0aWMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldCh0aGlzKSE7XG5cbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWcgYXMgT3ZlcmxheUNvbmZpZztcblxuICAgICAgICBzZXR0aW5ncy5vdmVybGF5VHJpZ2dlcj8uZGV0YWNoKCk7XG4gICAgICAgIHNldHRpbmdzLnBvc2l0aW9uQ29udHJvbGxlcj8uZGV0YWNoKCk7XG5cbiAgICAgICAgc2V0dGluZ3Mub3ZlcmxheVRyaWdnZXIgPSB0aGlzLnN0YXRpYy5vdmVybGF5VHJpZ2dlckZhY3RvcnkuY3JlYXRlKHRoaXMuY29uZmlnLnRyaWdnZXJUeXBlLCB0aGlzLmNvbmZpZywgdGhpcyk7XG4gICAgICAgIHNldHRpbmdzLnBvc2l0aW9uQ29udHJvbGxlciA9IHRoaXMuc3RhdGljLnBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkuY3JlYXRlKHRoaXMuY29uZmlnLnBvc2l0aW9uVHlwZSwgdGhpcy5jb25maWcpO1xuXG4gICAgICAgIHNldHRpbmdzLm92ZXJsYXlUcmlnZ2VyLmF0dGFjaCh0aGlzLmNvbmZpZy50cmlnZ2VyKTtcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbmZpZyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIHNlbGVjdG9yLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQ09OTkVDVEVEX1BPU0lUSU9OX0NPTkZJRyB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCAnLi9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTkZJRywgT3ZlcmxheUNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHsgRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcgfSBmcm9tICcuL3RyaWdnZXInO1xuaW1wb3J0IHsgbWljcm9UYXNrIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50L3Rhc2tzJztcblxuY29uc3QgQ09ORklHOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0ge1xuXG59O1xuXG5jb25zdCBESUFMT0dfQ09ORklHID0ge1xuICAgIC4uLkRFRkFVTFRfT1ZFUkxBWV9DT05GSUcsXG4gICAgLi4uRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsXG4gICAgLi4uQ09OTkVDVEVEX1BPU0lUSU9OX0NPTkZJR1xufVxuXG5AY29tcG9uZW50PE92ZXJsYXlEZW1vQ29tcG9uZW50Pih7XG4gICAgc2VsZWN0b3I6ICdvdmVybGF5LWRlbW8nLFxuICAgIHRlbXBsYXRlOiBlbGVtZW50ID0+IGh0bWxgXG4gICAgPGgyPk92ZXJsYXk8L2gyPlxuXG4gICAgPGJ1dHRvbiBAY2xpY2s9JHsgZWxlbWVudC5jaGFuZ2VSb2xlIH0+Q2hhbmdlIFJvbGU8L2J1dHRvbj5cbiAgICA8YnV0dG9uIEBjbGljaz0keyBlbGVtZW50LnRvZ2dsZSB9PlRvZ2dsZTwvYnV0dG9uPlxuXG4gICAgPHVpLW92ZXJsYXkgaWQ9XCJvdmVybGF5XCI+XG4gICAgICAgIDxoMz5PdmVybGF5PC9oMz5cbiAgICAgICAgPHA+VGhpcyBpcyBzb21lIG92ZXJsYXkgY29udGVudC48L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdGVybS4uLlwiLz4gPGJ1dHRvbj5TZWFyY2g8L2J1dHRvbj5cbiAgICAgICAgPC9wPlxuICAgIDwvdWktb3ZlcmxheT5cblxuICAgIDxidXR0b24gaWQ9XCJkaWFsb2ctYnV0dG9uXCI+RGlhbG9nPC9idXR0b24+XG5cbiAgICA8dWktb3ZlcmxheSB0cmlnZ2VyLXR5cGU9XCJkaWFsb2dcIiBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCIgLnRyaWdnZXI9JHsgZWxlbWVudC5kaWFsb2dCdXR0b24gfSAub3JpZ2luPSR7IGVsZW1lbnQuZGlhbG9nQnV0dG9uIH0+XG4gICAgICAgIDxoMz5EaWFsb2c8L2gzPlxuICAgICAgICA8cD5UaGlzIGlzIHNvbWUgZGlhbG9nIGNvbnRlbnQuPC9wPlxuICAgICAgICA8cD5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoIHRlcm0uLi5cIi8+IDxidXR0b24+U2VhcmNoPC9idXR0b24+XG4gICAgICAgIDwvcD5cbiAgICA8L3VpLW92ZXJsYXk+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5RGVtb0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICByb2xlcyA9IFsnZGlhbG9nJywgJ21lbnUnLCAndG9vbHRpcCddO1xuXG4gICAgY3VycmVudFJvbGUgPSAwO1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjb3ZlcmxheScgfSlcbiAgICBvdmVybGF5ITogT3ZlcmxheTtcblxuICAgIEBzZWxlY3Rvcih7IHF1ZXJ5OiAnI2RpYWxvZy1idXR0b24nIH0pXG4gICAgZGlhbG9nQnV0dG9uITogSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnRGVtby51cGRhdGVDYWxsYmFjaygpLi4uIGZpcnN0VXBkYXRlOiAnLCBmaXJzdFVwZGF0ZSk7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvdmVybGF5LWRlbW8uLi4gb3ZlcmxheTogJywgdGhpcy5vdmVybGF5KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvdmVybGF5LWRlbW8uLi4gZGlhbG9nQnV0dG9uOiAnLCB0aGlzLmRpYWxvZ0J1dHRvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGFuZ2VSb2xlICgpIHtcblxuICAgICAgICB0aGlzLmN1cnJlbnRSb2xlID0gKHRoaXMuY3VycmVudFJvbGUgKyAxIDwgdGhpcy5yb2xlcy5sZW5ndGgpID8gdGhpcy5jdXJyZW50Um9sZSArIDEgOiAwO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5yb2xlID0gdGhpcy5yb2xlc1t0aGlzLmN1cnJlbnRSb2xlXTtcbiAgICB9XG5cbiAgICB0b2dnbGUgKCkge1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5vcGVuID0gIXRoaXMub3ZlcmxheS5vcGVuO1xuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sXG4gICAgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLFxuICAgIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICBDaGFuZ2VzLCBDb21wb25lbnQsXG4gICAgY29tcG9uZW50LFxuICAgIGNzcyxcbiAgICBsaXN0ZW5lcixcbiAgICBwcm9wZXJ0eVxufSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IFRhYlBhbmVsIH0gZnJvbSAnLi90YWItcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIHBhZGRpbmc6IDAuNXJlbSAwLjVyZW07XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItYm90dG9tOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzKSB2YXIoLS1ib3JkZXItcmFkaXVzKSAwIDA7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtc2VsZWN0ZWQ9dHJ1ZV0pOmFmdGVyIHtcbiAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHotaW5kZXg6IDI7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIGJvdHRvbTogY2FsYygtMSAqIHZhcigtLWJvcmRlci13aWR0aCkpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWJvcmRlci13aWR0aCkgKyAwLjVyZW0pO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByaXZhdGUgX3BhbmVsOiBUYWJQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFdlIHByb3ZpZGUgb3VyIG93biB0YWJpbmRleCBwcm9wZXJ0eSwgc28gd2UgY2FuIHNldCBpdCB0byBgbnVsbGBcbiAgICAgKiB0byByZW1vdmUgdGhlIHRhYmluZGV4LWF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICd0YWJpbmRleCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCE6IG51bWJlciB8IG51bGw7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLXNlbGVjdGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IHNlbGVjdGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gICAgfVxuXG4gICAgc2V0IHNlbGVjdGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogKHZhbHVlID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICB9KVxuICAgIGdldCBkaXNhYmxlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAodGhpcy5zZWxlY3RlZCA/IDAgOiAtMSk7XG4gICAgfVxuXG4gICAgZ2V0IHBhbmVsICgpOiBUYWJQYW5lbCB8IG51bGwge1xuXG4gICAgICAgIGlmICghdGhpcy5fcGFuZWwpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRyb2xzKSBhcyBUYWJQYW5lbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9wYW5lbDtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFiJ1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAtMTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwubGFiZWxsZWRCeSA9IHRoaXMuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gZmFsc2UpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQXJyb3dEb3duIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBBY3RpdmVJdGVtQ2hhbmdlLCBGb2N1c0tleU1hbmFnZXIgfSBmcm9tICcuLi9saXN0LWtleS1tYW5hZ2VyJztcbmltcG9ydCB7IFRhYiB9IGZyb20gJy4vdGFiJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWItbGlzdCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3cgbm93cmFwO1xuICAgIH1cbiAgICA6OnNsb3R0ZWQodWktdGFiKSB7XG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4yNXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiTGlzdCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPFRhYj47XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRUYWIhOiBUYWI7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFibGlzdCc7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChUYWIuc2VsZWN0b3IpLCAnaG9yaXpvbnRhbCcpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBjb25zdCBzbG90ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoJ3Nsb3QnKSBhcyBIVE1MU2xvdEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIHNsb3QuYWRkRXZlbnRMaXN0ZW5lcignc2xvdGNoYW5nZScsICgpID0+IHtcblxuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGAke3Nsb3QubmFtZX0gY2hhbmdlZC4uLmAsIHNsb3QuYXNzaWduZWROb2RlcygpKTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IHRoaXMucXVlcnlTZWxlY3RvcihgJHsgVGFiLnNlbGVjdG9yIH1bYXJpYS1zZWxlY3RlZD10cnVlXWApIGFzIFRhYjtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUYWJcbiAgICAgICAgICAgICAgICA/IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oc2VsZWN0ZWRUYWIpXG4gICAgICAgICAgICAgICAgOiB0aGlzLmZvY3VzTWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcblxuICAgICAgICAgICAgLy8gc2V0dGluZyB0aGUgYWN0aXZlIGl0ZW0gdmlhIHRoZSBmb2N1cyBtYW5hZ2VyJ3MgQVBJIHdpbGwgbm90IHRyaWdnZXIgYW4gZXZlbnRcbiAgICAgICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gbWFudWFsbHkgc2VsZWN0IHRoZSBpbml0aWFsbHkgYWN0aXZlIHRhYlxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLnNlbGVjdFRhYih0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAna2V5ZG93bicgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEFycm93RG93bjpcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5mb2N1c01hbmFnZXIuZ2V0QWN0aXZlSXRlbSgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFRhYiAmJiBzZWxlY3RlZFRhYi5wYW5lbCkgc2VsZWN0ZWRUYWIucGFuZWwuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxUYWJMaXN0Pih7XG4gICAgICAgIGV2ZW50OiAnYWN0aXZlLWl0ZW0tY2hhbmdlJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvY3VzTWFuYWdlcjsgfVxuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUFjdGl2ZVRhYkNoYW5nZSAoZXZlbnQ6IEFjdGl2ZUl0ZW1DaGFuZ2U8VGFiPikge1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzVGFiID0gZXZlbnQuZGV0YWlsLnByZXZpb3VzLml0ZW07XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQuaXRlbTtcblxuICAgICAgICBpZiAocHJldmlvdXNUYWIgIT09IHNlbGVjdGVkVGFiKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RUYWIocHJldmlvdXNUYWIpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RUYWIoc2VsZWN0ZWRUYWIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuc2VsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0YWIucGFuZWwpIHRhYi5wYW5lbC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkZXNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuZGVzZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1wYW5lbCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgei1pbmRleDogMTtcbiAgICAgICAgcGFkZGluZzogMCAxcmVtO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAwIHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpO1xuICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtaGlkZGVuPXRydWVdKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYlBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtaGlkZGVuJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICB9KVxuICAgIGhpZGRlbiE6IGJvb2xlYW47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWxhYmVsbGVkYnknLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGxhYmVsbGVkQnkhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFicGFuZWwnXG4gICAgICAgIHRoaXMuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IC0xO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8VG9nZ2xlPih7XG4gICAgc2VsZWN0b3I6ICd1aS10b2dnbGUnLFxuICAgIHRlbXBsYXRlOiB0b2dnbGUgPT4gaHRtbGBcbiAgICA8c3R5bGU+XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIC0tdGltaW5nLWN1YmljOiBjdWJpYy1iZXppZXIoMC41NSwgMC4wNiwgMC42OCwgMC4xOSk7XG4gICAgICAgICAgICAtLXRpbWluZy1zaW5lOiBjdWJpYy1iZXppZXIoMC40NywgMCwgMC43NSwgMC43Mik7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tdGltaW5nOiB2YXIoLS10aW1pbmctc2luZSk7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tZHVyYXRpb246IC4xcztcbiAgICAgICAgfVxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgodmFyKC0tZm9udC1zaXplKSwgMWZyKSk7XG5cbiAgICAgICAgICAgIG1pbi13aWR0aDogY2FsYyh2YXIoLS1mb250LXNpemUpICogMiArIHZhcigtLWJvcmRlci13aWR0aCkgKiAyKTtcbiAgICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1mb250LXNpemUpICsgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgKiAyKTtcbiAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuXG4gICAgICAgICAgICAvKiB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3I7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7ICovXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD10cnVlXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICAgICAgfVxuICAgICAgICAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGhlaWdodDogdmFyKC0tZm9udC1zaXplKTtcbiAgICAgICAgICAgIHdpZHRoOiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgd2lkdGg6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl1bbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgLmxhYmVsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgLjI1cmVtO1xuICAgICAgICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIGp1c3RpZnktc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmxhYmVsLW9uIHtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwiZmFsc2VcIl0pIC5sYWJlbC1vZmYge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG5cbiAgICA8L3N0eWxlPlxuICAgIDxzcGFuIGNsYXNzPVwidG9nZ2xlLXRodW1iXCI+PC9zcGFuPlxuICAgICR7IHRvZ2dsZS5sYWJlbE9uICYmIHRvZ2dsZS5sYWJlbE9mZlxuICAgICAgICAgICAgPyBodG1sYDxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtb2ZmXCI+JHsgdG9nZ2xlLmxhYmVsT2ZmIH08L3NwYW4+PHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vblwiPiR7IHRvZ2dsZS5sYWJlbE9uIH08L3NwYW4+YFxuICAgICAgICAgICAgOiAnJ1xuICAgICAgICB9XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBUb2dnbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jaGVja2VkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGxhYmVsID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPbiA9ICcnO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZmFsc2VcbiAgICB9KVxuICAgIGxhYmVsT2ZmID0gJyc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnc3dpdGNoJztcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBwcm9wZXJ0eS1jaGFuZ2UgZXZlbnQgZm9yIGBjaGVja2VkYFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHNwYWNlIGtleSBmcm9tIHNjcm9sbGluZyB0aGUgcGFnZVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCAnLi9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gJy4vYXBwLnN0eWxlcyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZSB9IGZyb20gJy4vYXBwLnRlbXBsYXRlJztcbmltcG9ydCAnLi9jYXJkJztcbmltcG9ydCAnLi9jaGVja2JveCc7XG5pbXBvcnQgJy4vaWNvbi9pY29uJztcbmltcG9ydCAnLi9vdmVybGF5LW5ldy9kZW1vJztcbmltcG9ydCAnLi90YWJzL3RhYic7XG5pbXBvcnQgJy4vdGFicy90YWItbGlzdCc7XG5pbXBvcnQgJy4vdGFicy90YWItcGFuZWwnO1xuaW1wb3J0ICcuL3RvZ2dsZSc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGVtby1hcHAnLFxuICAgIHNoYWRvdzogZmFsc2UsXG4gICAgc3R5bGVzOiBbc3R5bGVzXSxcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbn0pXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHsgfVxuIiwiaW1wb3J0ICcuL3NyYy9hcHAnO1xuXG5mdW5jdGlvbiBib290c3RyYXAgKCkge1xuXG4gICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd1aS1jaGVja2JveCcpO1xuXG4gICAgaWYgKGNoZWNrYm94KSB7XG5cbiAgICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hlY2tlZC1jaGFuZ2VkJywgZXZlbnQgPT4gY29uc29sZS5sb2coKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwpKTtcbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYm9vdHN0cmFwKTtcbiJdLCJuYW1lcyI6WyJwcmVwYXJlQ29uc3RydWN0b3IiLCJUYWIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLElBNkNPLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLO0lBQ2xDLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUM7SUFDRjs7SUM5REE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEtBQUssU0FBUztJQUMvRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMseUJBQXlCO0lBQ25ELFFBQVEsU0FBUyxDQUFDO0FBQ2xCLElBWUE7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sV0FBVyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLO0lBQzdELElBQUksT0FBTyxLQUFLLEtBQUssR0FBRyxFQUFFO0lBQzFCLFFBQVEsTUFB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
