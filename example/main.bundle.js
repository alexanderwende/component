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

    /**
     * The default {@link ComponentDeclaration}
     */
    const DEFAULT_COMPONENT_DECLARATION = {
        selector: '',
        shadow: true,
        define: true,
    };

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
            const propertyValue = propertyDeclaration.converter.fromAttribute(newValue);
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
            const attributeValue = propertyDeclaration.converter.toAttribute(newValue);
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
            this.dispatchEvent(new CustomEvent(lifecycle, Object.assign({ composed: true }, (detail ? { detail: detail } : {}))));
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

    const ArrowUp = 'ArrowUp';
    const ArrowDown = 'ArrowDown';
    const ArrowLeft = 'ArrowLeft';
    const ArrowRight = 'ArrowRight';
    const Enter = 'Enter';
    const Space = ' ';

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

    const copyright = (date, author) => {
        return html `&copy; Copyright ${date.getFullYear()} ${author.trim()}`;
    };

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

            <button id="popover">Show Popover</button>

            <ui-overlay trigger="popover">
                <!-- <template> -->
                    <h3>Popover</h3>
                    <p>This is the content of the popover: ${element.counter}</p>
                <!-- </template> -->
            </ui-overlay>

            <button id="overlay-programmatic" @click=${element.showOverlay}>Show programmatic overlay</button>
        </div>

    </main>
    `;

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

    let Tab = class Tab extends Component {
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
    ], Tab.prototype, "role", void 0);
    __decorate([
        property({
            attribute: 'aria-controls',
            converter: AttributeConverterString,
        }),
        __metadata("design:type", String)
    ], Tab.prototype, "controls", void 0);
    __decorate([
        property({
            attribute: 'tabindex',
            converter: AttributeConverterNumber
        }),
        __metadata("design:type", Object)
    ], Tab.prototype, "tabindex", void 0);
    __decorate([
        property({
            attribute: 'aria-selected',
            converter: AttributeConverterARIABoolean
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Tab.prototype, "selected", null);
    __decorate([
        property({
            attribute: 'aria-disabled',
            converter: AttributeConverterARIABoolean,
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Tab.prototype, "disabled", null);
    Tab = __decorate([
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
    ], Tab);

    let TabList = class TabList extends Component {
        connectedCallback() {
            super.connectedCallback();
            this.role = 'tablist';
            this.focusManager = new FocusKeyManager(this, this.querySelectorAll(Tab.selector), 'horizontal');
        }
        updateCallback(changes, firstUpdate) {
            if (firstUpdate) {
                // const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;
                // slot.addEventListener('slotchange', () => {
                //     console.log(`${slot.name} changed...`, slot.assignedNodes());
                // });
                const selectedTab = this.querySelector(`${Tab.selector}[aria-selected=true]`);
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

    const DEFAULT_POSITION = {
        top: '',
        left: '',
        bottom: '',
        right: '',
        width: 'auto',
        height: 'auto',
        maxWidth: 'auto',
        maxHeight: 'auto',
        offsetHorizontal: '',
        offsetVertical: '',
    };
    class PositionStrategy {
        constructor(target, defaultPosition = DEFAULT_POSITION) {
            this.target = target;
            this.defaultPosition = Object.assign(Object.assign({}, DEFAULT_POSITION), defaultPosition);
            this.currentPosition = this.defaultPosition;
        }
        updatePosition(position) {
            this.nextPosition = position ? Object.assign(Object.assign({}, this.currentPosition), position) : undefined;
            if (!this.animationFrame) {
                this.animationFrame = requestAnimationFrame(() => {
                    const nextPosition = this.nextPosition || this.getPosition();
                    if (!this.comparePositions(this.currentPosition, nextPosition)) {
                        this.applyPosition(nextPosition);
                        this.currentPosition = nextPosition;
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
        getPosition() {
            return this.defaultPosition;
        }
        applyPosition(position) {
            this.target.style.top = position.top;
            this.target.style.left = position.left;
            this.target.style.bottom = position.bottom;
            this.target.style.right = position.right;
            this.target.style.width = position.width;
            this.target.style.height = position.height;
            this.target.style.maxWidth = position.maxWidth;
            this.target.style.maxHeight = position.maxHeight;
        }
        comparePositions(position, otherPosition) {
            const keys = Object.keys(position);
            return !keys.find((key => position[key] !== otherPosition[key]));
        }
    }
    const DEFAULT_POSITION_FIXED = Object.assign(Object.assign({}, DEFAULT_POSITION), { top: '50vh', left: '50vw', offsetHorizontal: '-50%', offsetVertical: '-50%' });
    class FixedPositionStrategy extends PositionStrategy {
        constructor(target, defaultPosition = DEFAULT_POSITION_FIXED) {
            super(target, defaultPosition);
            this.target = target;
        }
        getPosition() {
            return this.defaultPosition;
        }
        applyPosition(position) {
            super.applyPosition(position);
            this.target.style.transform = `translate(${position.offsetHorizontal, position.offsetVertical})`;
        }
    }
    class PositionManager {
        constructor(strategy) {
            this.strategy = strategy;
        }
        updatePosition(position) {
            this.strategy.updatePosition(position);
        }
        destroy() {
            this.strategy.destroy();
        }
    }

    class OverlayService {
        constructor() {
            this.overlays = new Map();
            if (!OverlayService.instance) {
                OverlayService.instance = this;
            }
            return OverlayService.instance;
        }
        hasOpenOverlays() {
            return [...this.overlays].find(([overlay]) => !overlay.hidden);
        }
        createOverlay(template, context) {
            const overlay = document.createElement(Overlay.selector);
            document.body.appendChild(overlay);
            context = context || overlay;
            this.renderOverlay(overlay, template, context);
            // to keep a template up-to-date with it's context, we have to render the template
            // everytime the context renders - that is, on every update which was triggered
            const updateListener = () => {
                // check the overlay hasn't been destroyed yet
                if (this.overlays.has(overlay)) {
                    this.renderOverlay(overlay, template, context);
                }
            };
            // we can use a component's 'update' event to re-render the template on every context update
            // lit-html will take care of efficiently updating the DOM
            context.addEventListener('update', updateListener);
            this.overlays.set(overlay, () => context.removeEventListener('update', updateListener));
            return overlay;
        }
        registerOverlay(overlay) {
            this.overlays.set(overlay, () => { });
        }
        openOverlay(overlay) {
            overlay.open();
        }
        closeOverlay(overlay) {
            overlay.close();
        }
        destroyOverlay(overlay, disconnect = true) {
            this.closeOverlay(overlay);
            const teardown = this.overlays.get(overlay);
            if (teardown)
                teardown();
            if (disconnect && overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
            }
            this.overlays.delete(overlay);
        }
        renderOverlay(overlay, template, context) {
            const result = template(context || overlay) || html ``;
            render(result, overlay, { eventContext: context || overlay });
        }
    }

    let Overlay = class Overlay extends Component {
        constructor() {
            super(...arguments);
            this.template = null;
            this.overlayService = new OverlayService();
            this.positionStrategy = new FixedPositionStrategy(this);
            this.triggerElement = null;
            this.triggerListener = null;
        }
        connectedCallback() {
            if (this.parentElement !== document.body) {
                document.body.appendChild(this);
                return;
            }
            super.connectedCallback();
            this.role = 'dialog';
            this.hidden = true;
            // this.positionManager = new PositionManager(new ConnectedPositionStrategy(this, document.getElementById(this.trigger)!));
            this.positionManager = new PositionManager(this.positionStrategy);
            this.template = this.querySelector('template');
            if (this.template) {
                this.templateObserver = new MutationObserver((mutations, observer) => this.updateTemplate());
                this.templateObserver.observe(
                // we can't observe a template directly, but the DocumentFragment stored in its content property
                this.template.content, {
                    attributes: true,
                    characterData: true,
                    childList: true,
                    subtree: true,
                });
            }
            this.overlayService.registerOverlay(this);
        }
        disconnectedCallback() {
            if (this.positionManager)
                this.positionManager.destroy();
            if (this.templateObserver)
                this.templateObserver.disconnect();
            this.overlayService.destroyOverlay(this, false);
        }
        updateCallback(changes, firstUpdate) {
            if (changes.has('trigger')) {
                this.updateTrigger(document.getElementById(this.trigger));
            }
        }
        open() {
            if (this.hidden) {
                this.watch(() => this.hidden = false);
                this.updateTemplate();
                this.reposition();
                if (this.triggerElement)
                    this.triggerElement.setAttribute('aria-expanded', 'true');
            }
        }
        close() {
            if (!this.hidden) {
                this.watch(() => this.hidden = true);
                if (this.triggerElement)
                    this.triggerElement.setAttribute('aria-expanded', 'false');
            }
        }
        toggle() {
            if (this.hidden) {
                this.open();
            }
            else {
                this.close();
            }
        }
        reposition() {
            if (this.positionManager) {
                this.positionManager.updatePosition();
            }
        }
        updateTrigger(triggerElement) {
            if (this.triggerElement && this.triggerListener) {
                if (this.triggerListener)
                    this.triggerElement.removeEventListener('click', this.triggerListener);
            }
            this.triggerElement = triggerElement;
            this.triggerListener = (event) => this.toggle();
            this.triggerElement.addEventListener('click', this.triggerListener);
            this.triggerElement.setAttribute('aria-haspopup', 'dialog');
            this.triggerElement.setAttribute('aria-expanded', this.hidden ? 'false' : 'true');
        }
        updateTemplate() {
            this.template = this.querySelector('template');
            if (this.template && !this.hidden) {
                const contentSlot = this.renderRoot.querySelector('slot');
                requestAnimationFrame(() => {
                    contentSlot.innerHTML = '';
                    // contentSlot.appendChild(this.template!.content.cloneNode(true));
                    contentSlot.appendChild(document.importNode(this.template.content, true));
                });
            }
        }
    };
    __decorate([
        property({
            converter: AttributeConverterString
        }),
        __metadata("design:type", String)
    ], Overlay.prototype, "role", void 0);
    __decorate([
        property({
            attribute: 'aria-hidden',
            converter: AttributeConverterARIABoolean,
            reflectAttribute: false,
        }),
        __metadata("design:type", Boolean)
    ], Overlay.prototype, "hidden", void 0);
    __decorate([
        property({
            converter: AttributeConverterString
        }),
        __metadata("design:type", String)
    ], Overlay.prototype, "trigger", void 0);
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

    let App = class App extends Component {
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
        showOverlay() {
            if (!this.overlay) {
                // create a template function in the app component's context
                const template = () => html `
                <h3>Programmatic Overlay</h3>
                <p>This is the content of the popover: ${this.counter}</p>
                <p><button @click=${this.closeOverlay}>Got it</button></p>
            `;
                // pass the template function and a reference to the template's context (the app component)
                // to the overlay service
                this.overlay = this.overlayService.createOverlay(template, this);
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
    ], App.prototype, "counter", void 0);
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

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9pY29uL2ljb24udHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1oZWFkZXIudHMiLCJzcmMvaGVscGVycy9jb3B5cmlnaHQudHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1wYW5lbC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIiwic3JjL2FwcC5zdHlsZXMudHMiLCJzcmMvYXBwLnRlbXBsYXRlLnRzIiwic3JjL2NhcmQudHMiLCJzcmMvY2hlY2tib3gudHMiLCJzcmMvdGFicy90YWIudHMiLCJzcmMvdGFicy90YWItbGlzdC50cyIsInNyYy90YWJzL3RhYi1wYW5lbC50cyIsInNyYy90b2dnbGUudHMiLCJzcmMvcG9zaXRpb24tbWFuYWdlci50cyIsInNyYy9vdmVybGF5L292ZXJsYXktc2VydmljZS50cyIsInNyYy9vdmVybGF5L292ZXJsYXkudHMiLCJzcmMvYXBwLnRzIiwibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5jb25zdCBkaXJlY3RpdmVzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogQnJhbmRzIGEgZnVuY3Rpb24gYXMgYSBkaXJlY3RpdmUgZmFjdG9yeSBmdW5jdGlvbiBzbyB0aGF0IGxpdC1odG1sIHdpbGwgY2FsbFxuICogdGhlIGZ1bmN0aW9uIGR1cmluZyB0ZW1wbGF0ZSByZW5kZXJpbmcsIHJhdGhlciB0aGFuIHBhc3NpbmcgYXMgYSB2YWx1ZS5cbiAqXG4gKiBBIF9kaXJlY3RpdmVfIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIFBhcnQgYXMgYW4gYXJndW1lbnQuIEl0IGhhcyB0aGVcbiAqIHNpZ25hdHVyZTogYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBfZmFjdG9yeV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGFyZ3VtZW50cyBmb3IgZGF0YSBhbmRcbiAqIGNvbmZpZ3VyYXRpb24gYW5kIHJldHVybnMgYSBkaXJlY3RpdmUuIFVzZXJzIG9mIGRpcmVjdGl2ZSB1c3VhbGx5IHJlZmVyIHRvXG4gKiB0aGUgZGlyZWN0aXZlIGZhY3RvcnkgYXMgdGhlIGRpcmVjdGl2ZS4gRm9yIGV4YW1wbGUsIFwiVGhlIHJlcGVhdCBkaXJlY3RpdmVcIi5cbiAqXG4gKiBVc3VhbGx5IGEgdGVtcGxhdGUgYXV0aG9yIHdpbGwgaW52b2tlIGEgZGlyZWN0aXZlIGZhY3RvcnkgaW4gdGhlaXIgdGVtcGxhdGVcbiAqIHdpdGggcmVsZXZhbnQgYXJndW1lbnRzLCB3aGljaCB3aWxsIHRoZW4gcmV0dXJuIGEgZGlyZWN0aXZlIGZ1bmN0aW9uLlxuICpcbiAqIEhlcmUncyBhbiBleGFtcGxlIG9mIHVzaW5nIHRoZSBgcmVwZWF0KClgIGRpcmVjdGl2ZSBmYWN0b3J5IHRoYXQgdGFrZXMgYW5cbiAqIGFycmF5IGFuZCBhIGZ1bmN0aW9uIHRvIHJlbmRlciBhbiBpdGVtOlxuICpcbiAqIGBgYGpzXG4gKiBodG1sYDx1bD48JHtyZXBlYXQoaXRlbXMsIChpdGVtKSA9PiBodG1sYDxsaT4ke2l0ZW19PC9saT5gKX08L3VsPmBcbiAqIGBgYFxuICpcbiAqIFdoZW4gYHJlcGVhdGAgaXMgaW52b2tlZCwgaXQgcmV0dXJucyBhIGRpcmVjdGl2ZSBmdW5jdGlvbiB0aGF0IGNsb3NlcyBvdmVyXG4gKiBgaXRlbXNgIGFuZCB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uIFdoZW4gdGhlIG91dGVyIHRlbXBsYXRlIGlzIHJlbmRlcmVkLCB0aGVcbiAqIHJldHVybiBkaXJlY3RpdmUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIFBhcnQgZm9yIHRoZSBleHByZXNzaW9uLlxuICogYHJlcGVhdGAgdGhlbiBwZXJmb3JtcyBpdCdzIGN1c3RvbSBsb2dpYyB0byByZW5kZXIgbXVsdGlwbGUgaXRlbXMuXG4gKlxuICogQHBhcmFtIGYgVGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uLiBNdXN0IGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFcbiAqIGZ1bmN0aW9uIG9mIHRoZSBzaWduYXR1cmUgYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC4gVGhlIHJldHVybmVkIGZ1bmN0aW9uIHdpbGxcbiAqIGJlIGNhbGxlZCB3aXRoIHRoZSBwYXJ0IG9iamVjdC5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGltcG9ydCB7ZGlyZWN0aXZlLCBodG1sfSBmcm9tICdsaXQtaHRtbCc7XG4gKlxuICogY29uc3QgaW1tdXRhYmxlID0gZGlyZWN0aXZlKCh2KSA9PiAocGFydCkgPT4ge1xuICogICBpZiAocGFydC52YWx1ZSAhPT0gdikge1xuICogICAgIHBhcnQuc2V0VmFsdWUodilcbiAqICAgfVxuICogfSk7XG4gKi9cbmV4cG9ydCBjb25zdCBkaXJlY3RpdmUgPSAoZikgPT4gKCguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgZCA9IGYoLi4uYXJncyk7XG4gICAgZGlyZWN0aXZlcy5zZXQoZCwgdHJ1ZSk7XG4gICAgcmV0dXJuIGQ7XG59KTtcbmV4cG9ydCBjb25zdCBpc0RpcmVjdGl2ZSA9IChvKSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnZnVuY3Rpb24nICYmIGRpcmVjdGl2ZXMuaGFzKG8pO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcmVjdGl2ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIFRydWUgaWYgdGhlIGN1c3RvbSBlbGVtZW50cyBwb2x5ZmlsbCBpcyBpbiB1c2UuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NFUG9seWZpbGwgPSB3aW5kb3cuY3VzdG9tRWxlbWVudHMgIT09IHVuZGVmaW5lZCAmJlxuICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrICE9PVxuICAgICAgICB1bmRlZmluZWQ7XG4vKipcbiAqIFJlcGFyZW50cyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLFxuICogaW50byBhbm90aGVyIGNvbnRhaW5lciAoY291bGQgYmUgdGhlIHNhbWUgY29udGFpbmVyKSwgYmVmb3JlIGBiZWZvcmVgLiBJZlxuICogYGJlZm9yZWAgaXMgbnVsbCwgaXQgYXBwZW5kcyB0aGUgbm9kZXMgdG8gdGhlIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlcGFyZW50Tm9kZXMgPSAoY29udGFpbmVyLCBzdGFydCwgZW5kID0gbnVsbCwgYmVmb3JlID0gbnVsbCkgPT4ge1xuICAgIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzdGFydC5uZXh0U2libGluZztcbiAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShzdGFydCwgYmVmb3JlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbn07XG4vKipcbiAqIFJlbW92ZXMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0YCAoaW5jbHVzaXZlKSB0byBgZW5kYCAoZXhjbHVzaXZlKSwgZnJvbVxuICogYGNvbnRhaW5lcmAuXG4gKi9cbmV4cG9ydCBjb25zdCByZW1vdmVOb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3RhcnQpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSB7fTtcbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBOb2RlUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB3aXRoIGVtYmVkZGVkIHVuaXF1ZSBrZXkgdG8gYXZvaWQgY29sbGlzaW9uIHdpdGhcbiAqIHBvc3NpYmxlIHRleHQgaW4gdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY29uc3QgbWFya2VyID0gYHt7bGl0LSR7U3RyaW5nKE1hdGgucmFuZG9tKCkpLnNsaWNlKDIpfX19YDtcbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgdXNlZCB0ZXh0LXBvc2l0aW9ucywgbXVsdGktYmluZGluZyBhdHRyaWJ1dGVzLCBhbmRcbiAqIGF0dHJpYnV0ZXMgd2l0aCBtYXJrdXAtbGlrZSB0ZXh0IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vZGVNYXJrZXIgPSBgPCEtLSR7bWFya2VyfS0tPmA7XG5leHBvcnQgY29uc3QgbWFya2VyUmVnZXggPSBuZXcgUmVnRXhwKGAke21hcmtlcn18JHtub2RlTWFya2VyfWApO1xuLyoqXG4gKiBTdWZmaXggYXBwZW5kZWQgdG8gYWxsIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBUZW1wbGF0ZSB0aGF0IHRyYWNrcyB0aGUgbG9jYXRpb24gb2YgZHluYW1pYyBwYXJ0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBjb25zdCBub2Rlc1RvUmVtb3ZlID0gW107XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGVsZW1lbnQuY29udGVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfFRFWFR9ICovLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBsYXN0IGluZGV4IGFzc29jaWF0ZWQgd2l0aCBhIHBhcnQuIFdlIHRyeSB0byBkZWxldGVcbiAgICAgICAgLy8gdW5uZWNlc3Nhcnkgbm9kZXMsIGJ1dCB3ZSBuZXZlciB3YW50IHRvIGFzc29jaWF0ZSB0d28gZGlmZmVyZW50IHBhcnRzXG4gICAgICAgIC8vIHRvIHRoZSBzYW1lIGluZGV4LiBUaGV5IG11c3QgaGF2ZSBhIGNvbnN0YW50IG5vZGUgYmV0d2Vlbi5cbiAgICAgICAgbGV0IGxhc3RQYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGNvbnN0IHsgc3RyaW5ncywgdmFsdWVzOiB7IGxlbmd0aCB9IH0gPSByZXN1bHQ7XG4gICAgICAgIHdoaWxlIChwYXJ0SW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UndmUgZXhoYXVzdGVkIHRoZSBjb250ZW50IGluc2lkZSBhIG5lc3RlZCB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgLy8gLSBUaGUgd2Fsa2VyIHdpbGwgZmluZCBhIG5leHROb2RlIG91dHNpZGUgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgLyogTm9kZS5FTEVNRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IG5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBsZW5ndGggfSA9IGF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBlclxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTmFtZWROb2RlTWFwLFxuICAgICAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGVzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSByZXR1cm5lZCBpbiBkb2N1bWVudCBvcmRlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gcGFydGljdWxhciwgRWRnZS9JRSBjYW4gcmV0dXJuIHRoZW0gb3V0IG9mIG9yZGVyLCBzbyB3ZSBjYW5ub3RcbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzdW1lIGEgY29ycmVzcG9uZGVuY2UgYmV0d2VlbiBwYXJ0IGluZGV4IGFuZCBhdHRyaWJ1dGUgaW5kZXguXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmRzV2l0aChhdHRyaWJ1dGVzW2ldLm5hbWUsIGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHRlbXBsYXRlIGxpdGVyYWwgc2VjdGlvbiBsZWFkaW5nIHVwIHRvIHRoZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhwcmVzc2lvbiBpbiB0aGlzIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nRm9yUGFydCA9IHN0cmluZ3NbcGFydEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHN0cmluZ0ZvclBhcnQpWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsbCBib3VuZCBhdHRyaWJ1dGVzIGhhdmUgaGFkIGEgc3VmZml4IGFkZGVkIGluXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZW1wbGF0ZVJlc3VsdCNnZXRIVE1MIHRvIG9wdCBvdXQgb2Ygc3BlY2lhbCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhbmRsaW5nLiBUbyBsb29rIHVwIHRoZSBhdHRyaWJ1dGUgdmFsdWUgd2UgYWxzbyBuZWVkIHRvIGFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN1ZmZpeC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZUxvb2t1cE5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkgKyBib3VuZEF0dHJpYnV0ZVN1ZmZpeDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRpY3MgPSBhdHRyaWJ1dGVWYWx1ZS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnYXR0cmlidXRlJywgaW5kZXgsIG5hbWUsIHN0cmluZ3M6IHN0YXRpY3MgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gc3RhdGljcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gbm9kZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbm9kZS5kYXRhO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmluZGV4T2YobWFya2VyKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5ncyA9IGRhdGEuc3BsaXQobWFya2VyUmVnZXgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2Ugbm9kZXMgYXJlIGFsc28gdXNlZCBhcyB0aGUgbWFya2VycyBmb3Igbm9kZSBwYXJ0c1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHMgPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ID0gY3JlYXRlTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggIT09IG51bGwgJiYgZW5kc1dpdGgobWF0Y2hbMl0sIGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyBtYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFsyXS5zbGljZSgwLCAtYm91bmRBdHRyaWJ1dGVTdWZmaXgubGVuZ3RoKSArIG1hdGNoWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaW5zZXJ0LCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXg6ICsraW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyB0ZXh0LCB3ZSBtdXN0IGluc2VydCBhIGNvbW1lbnQgdG8gbWFyayBvdXIgcGxhY2UuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiB0cnVzdCBpdCB3aWxsIHN0aWNrIGFyb3VuZCBhZnRlciBjbG9uaW5nLlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyaW5nc1tsYXN0SW5kZXhdID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSBzdHJpbmdzW2xhc3RJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHBhcnQgZm9yIGVhY2ggbWF0Y2ggZm91bmRcbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IGxhc3RJbmRleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIE5vZGUuQ09NTUVOVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZGF0YSA9PT0gbWFya2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGEgbmV3IG1hcmtlciBub2RlIHRvIGJlIHRoZSBzdGFydE5vZGUgb2YgdGhlIFBhcnQgaWYgYW55IG9mXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBmb2xsb3dpbmcgYXJlIHRydWU6XG4gICAgICAgICAgICAgICAgICAgIC8vICAqIFdlIGRvbid0IGhhdmUgYSBwcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gICogVGhlIHByZXZpb3VzU2libGluZyBpcyBhbHJlYWR5IHRoZSBzdGFydCBvZiBhIHByZXZpb3VzIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUucHJldmlvdXNTaWJsaW5nID09PSBudWxsIHx8IGluZGV4ID09PSBsYXN0UGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGFzdFBhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgbmV4dFNpYmxpbmcsIGtlZXAgdGhpcyBub2RlIHNvIHdlIGhhdmUgYW4gZW5kLlxuICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gcmVtb3ZlIGl0IHRvIHNhdmUgZnV0dXJlIGNvc3RzLlxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChpID0gbm9kZS5kYXRhLmluZGV4T2YobWFya2VyLCBpICsgMSkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBub2RlIGhhcyBhIGJpbmRpbmcgbWFya2VyIGluc2lkZSwgbWFrZSBhbiBpbmFjdGl2ZSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYmluZGluZyB3b24ndCB3b3JrLCBidXQgc3Vic2VxdWVudCBiaW5kaW5ncyB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogY29uc2lkZXIgd2hldGhlciBpdCdzIGV2ZW4gd29ydGggaXQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgYmluZGluZ3MgaW4gY29tbWVudHMgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogLTEgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgdGV4dCBiaW5kaW5nIG5vZGVzIGFmdGVyIHRoZSB3YWxrIHRvIG5vdCBkaXN0dXJiIHRoZSBUcmVlV2Fsa2VyXG4gICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlc1RvUmVtb3ZlKSB7XG4gICAgICAgICAgICBuLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobik7XG4gICAgICAgIH1cbiAgICB9XG59XG5jb25zdCBlbmRzV2l0aCA9IChzdHIsIHN1ZmZpeCkgPT4ge1xuICAgIGNvbnN0IGluZGV4ID0gc3RyLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGg7XG4gICAgcmV0dXJuIGluZGV4ID49IDAgJiYgc3RyLnNsaWNlKGluZGV4KSA9PT0gc3VmZml4O1xufTtcbmV4cG9ydCBjb25zdCBpc1RlbXBsYXRlUGFydEFjdGl2ZSA9IChwYXJ0KSA9PiBwYXJ0LmluZGV4ICE9PSAtMTtcbi8vIEFsbG93cyBgZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJylgIHRvIGJlIHJlbmFtZWQgZm9yIGFcbi8vIHNtYWxsIG1hbnVhbCBzaXplLXNhdmluZ3MuXG5leHBvcnQgY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4vKipcbiAqIFRoaXMgcmVnZXggZXh0cmFjdHMgdGhlIGF0dHJpYnV0ZSBuYW1lIHByZWNlZGluZyBhbiBhdHRyaWJ1dGUtcG9zaXRpb25cbiAqIGV4cHJlc3Npb24uIEl0IGRvZXMgdGhpcyBieSBtYXRjaGluZyB0aGUgc3ludGF4IGFsbG93ZWQgZm9yIGF0dHJpYnV0ZXNcbiAqIGFnYWluc3QgdGhlIHN0cmluZyBsaXRlcmFsIGRpcmVjdGx5IHByZWNlZGluZyB0aGUgZXhwcmVzc2lvbiwgYXNzdW1pbmcgdGhhdFxuICogdGhlIGV4cHJlc3Npb24gaXMgaW4gYW4gYXR0cmlidXRlLXZhbHVlIHBvc2l0aW9uLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjZWxlbWVudHMtYXR0cmlidXRlc1xuICpcbiAqIFwiIFxceDA5XFx4MGFcXHgwY1xceDBkXCIgYXJlIEhUTUwgc3BhY2UgY2hhcmFjdGVyczpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9pbmZyYXN0cnVjdHVyZS5odG1sI3NwYWNlLWNoYXJhY3RlcnNcbiAqXG4gKiBcIlxcMC1cXHgxRlxceDdGLVxceDlGXCIgYXJlIFVuaWNvZGUgY29udHJvbCBjaGFyYWN0ZXJzLCB3aGljaCBpbmNsdWRlcyBldmVyeVxuICogc3BhY2UgY2hhcmFjdGVyIGV4Y2VwdCBcIiBcIi5cbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSBjb250cm9sIGNoYXJhY3Rlciwgc3BhY2UgY2hhcmFjdGVyLCAoJyksXG4gKiAgICAoXCIpLCBcIj5cIiwgXCI9XCIsIG9yIFwiL1wiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5leHBvcnQgY29uc3QgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCA9IC8oWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0pKFteXFwwLVxceDFGXFx4N0YtXFx4OUYgXCInPj0vXSspKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKj1bIFxceDA5XFx4MGFcXHgwY1xceDBkXSooPzpbXiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiJ2A8Pj1dKnxcIlteXCJdKnwnW14nXSopKSQvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzQ0VQb2x5ZmlsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGlzVGVtcGxhdGVQYXJ0QWN0aXZlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIGEgYFRlbXBsYXRlYCB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byB0aGUgRE9NIGFuZCB1cGRhdGVkXG4gKiB3aXRoIG5ldyB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUluc3RhbmNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgcHJvY2Vzc29yLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX19wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICB1cGRhdGUodmFsdWVzKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX19wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2xvbmUoKSB7XG4gICAgICAgIC8vIFRoZXJlIGFyZSBhIG51bWJlciBvZiBzdGVwcyBpbiB0aGUgbGlmZWN5Y2xlIG9mIGEgdGVtcGxhdGUgaW5zdGFuY2Unc1xuICAgICAgICAvLyBET00gZnJhZ21lbnQ6XG4gICAgICAgIC8vICAxLiBDbG9uZSAtIGNyZWF0ZSB0aGUgaW5zdGFuY2UgZnJhZ21lbnRcbiAgICAgICAgLy8gIDIuIEFkb3B0IC0gYWRvcHQgaW50byB0aGUgbWFpbiBkb2N1bWVudFxuICAgICAgICAvLyAgMy4gUHJvY2VzcyAtIGZpbmQgcGFydCBtYXJrZXJzIGFuZCBjcmVhdGUgcGFydHNcbiAgICAgICAgLy8gIDQuIFVwZ3JhZGUgLSB1cGdyYWRlIGN1c3RvbSBlbGVtZW50c1xuICAgICAgICAvLyAgNS4gVXBkYXRlIC0gc2V0IG5vZGUsIGF0dHJpYnV0ZSwgcHJvcGVydHksIGV0Yy4sIHZhbHVlc1xuICAgICAgICAvLyAgNi4gQ29ubmVjdCAtIGNvbm5lY3QgdG8gdGhlIGRvY3VtZW50LiBPcHRpb25hbCBhbmQgb3V0c2lkZSBvZiB0aGlzXG4gICAgICAgIC8vICAgICBtZXRob2QuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGhhdmUgYSBmZXcgY29uc3RyYWludHMgb24gdGhlIG9yZGVyaW5nIG9mIHRoZXNlIHN0ZXBzOlxuICAgICAgICAvLyAgKiBXZSBuZWVkIHRvIHVwZ3JhZGUgYmVmb3JlIHVwZGF0aW5nLCBzbyB0aGF0IHByb3BlcnR5IHZhbHVlcyB3aWxsIHBhc3NcbiAgICAgICAgLy8gICAgdGhyb3VnaCBhbnkgcHJvcGVydHkgc2V0dGVycy5cbiAgICAgICAgLy8gICogV2Ugd291bGQgbGlrZSB0byBwcm9jZXNzIGJlZm9yZSB1cGdyYWRpbmcgc28gdGhhdCB3ZSdyZSBzdXJlIHRoYXQgdGhlXG4gICAgICAgIC8vICAgIGNsb25lZCBmcmFnbWVudCBpcyBpbmVydCBhbmQgbm90IGRpc3R1cmJlZCBieSBzZWxmLW1vZGlmeWluZyBET00uXG4gICAgICAgIC8vICAqIFdlIHdhbnQgY3VzdG9tIGVsZW1lbnRzIHRvIHVwZ3JhZGUgZXZlbiBpbiBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBHaXZlbiB0aGVzZSBjb25zdHJhaW50cywgd2l0aCBmdWxsIGN1c3RvbSBlbGVtZW50cyBzdXBwb3J0IHdlIHdvdWxkXG4gICAgICAgIC8vIHByZWZlciB0aGUgb3JkZXI6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLCBDb25uZWN0XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJ1dCBTYWZhcmkgZG9vZXMgbm90IGltcGxlbWVudCBDdXN0b21FbGVtZW50UmVnaXN0cnkjdXBncmFkZSwgc28gd2VcbiAgICAgICAgLy8gY2FuIG5vdCBpbXBsZW1lbnQgdGhhdCBvcmRlciBhbmQgc3RpbGwgaGF2ZSB1cGdyYWRlLWJlZm9yZS11cGRhdGUgYW5kXG4gICAgICAgIC8vIHVwZ3JhZGUgZGlzY29ubmVjdGVkIGZyYWdtZW50cy4gU28gd2UgaW5zdGVhZCBzYWNyaWZpY2UgdGhlXG4gICAgICAgIC8vIHByb2Nlc3MtYmVmb3JlLXVwZ3JhZGUgY29uc3RyYWludCwgc2luY2UgaW4gQ3VzdG9tIEVsZW1lbnRzIHYxIGVsZW1lbnRzXG4gICAgICAgIC8vIG11c3Qgbm90IG1vZGlmeSB0aGVpciBsaWdodCBET00gaW4gdGhlIGNvbnN0cnVjdG9yLiBXZSBzdGlsbCBoYXZlIGlzc3Vlc1xuICAgICAgICAvLyB3aGVuIGNvLWV4aXN0aW5nIHdpdGggQ0V2MCBlbGVtZW50cyBsaWtlIFBvbHltZXIgMSwgYW5kIHdpdGggcG9seWZpbGxzXG4gICAgICAgIC8vIHRoYXQgZG9uJ3Qgc3RyaWN0bHkgYWRoZXJlIHRvIHRoZSBuby1tb2RpZmljYXRpb24gcnVsZSBiZWNhdXNlIHNoYWRvd1xuICAgICAgICAvLyBET00sIHdoaWNoIG1heSBiZSBjcmVhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciwgaXMgZW11bGF0ZWQgYnkgYmVpbmcgcGxhY2VkXG4gICAgICAgIC8vIGluIHRoZSBsaWdodCBET00uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSByZXN1bHRpbmcgb3JkZXIgaXMgb24gbmF0aXZlIGlzOiBDbG9uZSwgQWRvcHQsIFVwZ3JhZGUsIFByb2Nlc3MsXG4gICAgICAgIC8vIFVwZGF0ZSwgQ29ubmVjdC4gZG9jdW1lbnQuaW1wb3J0Tm9kZSgpIHBlcmZvcm1zIENsb25lLCBBZG9wdCwgYW5kIFVwZ3JhZGVcbiAgICAgICAgLy8gaW4gb25lIHN0ZXAuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSBDdXN0b20gRWxlbWVudHMgdjEgcG9seWZpbGwgc3VwcG9ydHMgdXBncmFkZSgpLCBzbyB0aGUgb3JkZXIgd2hlblxuICAgICAgICAvLyBwb2x5ZmlsbGVkIGlzIHRoZSBtb3JlIGlkZWFsOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSxcbiAgICAgICAgLy8gQ29ubmVjdC5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpc0NFUG9seWZpbGwgP1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpIDpcbiAgICAgICAgICAgIGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMudGVtcGxhdGUucGFydHM7XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGZyYWdtZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgICAgICBsZXQgcGFydDtcbiAgICAgICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCB0aGUgbm9kZXMgYW5kIHBhcnRzIG9mIGEgdGVtcGxhdGVcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFydCA9IHBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICBpZiAoIWlzVGVtcGxhdGVQYXJ0QWN0aXZlKHBhcnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2dyZXNzIHRoZSB0cmVlIHdhbGtlciB1bnRpbCB3ZSBmaW5kIG91ciBuZXh0IHBhcnQncyBub2RlLlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IG11bHRpcGxlIHBhcnRzIG1heSBzaGFyZSB0aGUgc2FtZSBub2RlIChhdHRyaWJ1dGUgcGFydHNcbiAgICAgICAgICAgIC8vIG9uIGEgc2luZ2xlIGVsZW1lbnQpLCBzbyB0aGlzIGxvb3AgbWF5IG5vdCBydW4gYXQgYWxsLlxuICAgICAgICAgICAgd2hpbGUgKG5vZGVJbmRleCA8IHBhcnQuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgobm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBhIHRlbXBsYXRlIGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXZSd2ZSBhcnJpdmVkIGF0IG91ciBwYXJ0J3Mgbm9kZS5cbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICdub2RlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLnByb2Nlc3Nvci5oYW5kbGVUZXh0RXhwcmVzc2lvbih0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHBhcnQuaW5zZXJ0QWZ0ZXJOb2RlKG5vZGUucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKC4uLnRoaXMucHJvY2Vzc29yLmhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKG5vZGUsIHBhcnQubmFtZSwgcGFydC5zdHJpbmdzLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NFUG9seWZpbGwpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkb3B0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICBjdXN0b21FbGVtZW50cy51cGdyYWRlKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtaW5zdGFuY2UuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBib3VuZEF0dHJpYnV0ZVN1ZmZpeCwgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCwgbWFya2VyLCBub2RlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5jb25zdCBjb21tZW50TWFya2VyID0gYCAke21hcmtlcn0gYDtcbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIGBodG1sYCwgd2hpY2ggaG9sZHMgYSBUZW1wbGF0ZSBhbmQgdGhlIHZhbHVlcyBmcm9tXG4gKiBpbnRlcnBvbGF0ZWQgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RyaW5ncywgdmFsdWVzLCB0eXBlLCBwcm9jZXNzb3IpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIEhUTUwgdXNlZCB0byBjcmVhdGUgYSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAgICAgKi9cbiAgICBnZXRIVE1MKCkge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5zdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIGxldCBpc0NvbW1lbnRCaW5kaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5zdHJpbmdzW2ldO1xuICAgICAgICAgICAgLy8gRm9yIGVhY2ggYmluZGluZyB3ZSB3YW50IHRvIGRldGVybWluZSB0aGUga2luZCBvZiBtYXJrZXIgdG8gaW5zZXJ0XG4gICAgICAgICAgICAvLyBpbnRvIHRoZSB0ZW1wbGF0ZSBzb3VyY2UgYmVmb3JlIGl0J3MgcGFyc2VkIGJ5IHRoZSBicm93c2VyJ3MgSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBUaGUgbWFya2VyIHR5cGUgaXMgYmFzZWQgb24gd2hldGhlciB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhblxuICAgICAgICAgICAgLy8gYXR0cmlidXRlLCB0ZXh0LCBvciBjb21tZW50IHBvaXNpdGlvbi5cbiAgICAgICAgICAgIC8vICAgKiBGb3Igbm9kZS1wb3NpdGlvbiBiaW5kaW5ncyB3ZSBpbnNlcnQgYSBjb21tZW50IHdpdGggdGhlIG1hcmtlclxuICAgICAgICAgICAgLy8gICAgIHNlbnRpbmVsIGFzIGl0cyB0ZXh0IGNvbnRlbnQsIGxpa2UgPCEtLXt7bGl0LWd1aWR9fS0tPi5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgYXR0cmlidXRlIGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgZm9yIHRoZVxuICAgICAgICAgICAgLy8gICAgIGZpcnN0IGJpbmRpbmcsIHNvIHRoYXQgd2Ugc3VwcG9ydCB1bnF1b3RlZCBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gICAgICAgICAgICAvLyAgICAgU3Vic2VxdWVudCBiaW5kaW5ncyBjYW4gdXNlIGEgY29tbWVudCBtYXJrZXIgYmVjYXVzZSBtdWx0aS1iaW5kaW5nXG4gICAgICAgICAgICAvLyAgICAgYXR0cmlidXRlcyBtdXN0IGJlIHF1b3RlZC5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgY29tbWVudCBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIHNvIHdlIGRvbid0XG4gICAgICAgICAgICAvLyAgICAgY2xvc2UgdGhlIGNvbW1lbnQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGJ1dCBpcyAqbm90KiBhbiBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFdlIGRvbid0IG5lZWQgdG8gdHJhY2sgdGhlIHRyZWUgc3RydWN0dXJlIG9mIHRoZSBIVE1MLCBvbmx5XG4gICAgICAgICAgICAvLyB3aGV0aGVyIGEgYmluZGluZyBpcyBpbnNpZGUgYSBjb21tZW50LCBhbmQgaWYgbm90LCBpZiBpdCBhcHBlYXJzIHRvIGJlXG4gICAgICAgICAgICAvLyB0aGUgZmlyc3QgYmluZGluZyBpbiBhbiBhdHRyaWJ1dGUuXG4gICAgICAgICAgICBjb25zdCBjb21tZW50T3BlbiA9IHMubGFzdEluZGV4T2YoJzwhLS0nKTtcbiAgICAgICAgICAgIC8vIFdlJ3JlIGluIGNvbW1lbnQgcG9zaXRpb24gaWYgd2UgaGF2ZSBhIGNvbW1lbnQgb3BlbiB3aXRoIG5vIGZvbGxvd2luZ1xuICAgICAgICAgICAgLy8gY29tbWVudCBjbG9zZS4gQmVjYXVzZSA8LS0gY2FuIGFwcGVhciBpbiBhbiBhdHRyaWJ1dGUgdmFsdWUgdGhlcmUgY2FuXG4gICAgICAgICAgICAvLyBiZSBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgICAgICAgICBpc0NvbW1lbnRCaW5kaW5nID0gKGNvbW1lbnRPcGVuID4gLTEgfHwgaXNDb21tZW50QmluZGluZykgJiZcbiAgICAgICAgICAgICAgICBzLmluZGV4T2YoJy0tPicsIGNvbW1lbnRPcGVuICsgMSkgPT09IC0xO1xuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UgcHJlY2VlZGluZyB0aGVcbiAgICAgICAgICAgIC8vIGV4cHJlc3Npb24uIFRoaXMgY2FuIG1hdGNoIFwibmFtZT12YWx1ZVwiIGxpa2Ugc3RydWN0dXJlcyBpbiB0ZXh0LFxuICAgICAgICAgICAgLy8gY29tbWVudHMsIGFuZCBhdHRyaWJ1dGUgdmFsdWVzLCBzbyB0aGVyZSBjYW4gYmUgZmFsc2UtcG9zaXRpdmVzLlxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBvbmx5IGluIHRoaXMgYnJhbmNoIGlmIHdlIGRvbid0IGhhdmUgYSBhdHRyaWJ1dGUtbGlrZVxuICAgICAgICAgICAgICAgIC8vIHByZWNlZWRpbmcgc2VxdWVuY2UuIEZvciBjb21tZW50cywgdGhpcyBndWFyZHMgYWdhaW5zdCB1bnVzdWFsXG4gICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlIHZhbHVlcyBsaWtlIDxkaXYgZm9vPVwiPCEtLSR7J2Jhcid9XCI+LiBDYXNlcyBsaWtlXG4gICAgICAgICAgICAgICAgLy8gPCEtLSBmb289JHsnYmFyJ30tLT4gYXJlIGhhbmRsZWQgY29ycmVjdGx5IGluIHRoZSBhdHRyaWJ1dGUgYnJhbmNoXG4gICAgICAgICAgICAgICAgLy8gYmVsb3cuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzICsgKGlzQ29tbWVudEJpbmRpbmcgPyBjb21tZW50TWFya2VyIDogbm9kZU1hcmtlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgYXR0cmlidXRlcyB3ZSB1c2UganVzdCBhIG1hcmtlciBzZW50aW5lbCwgYW5kIGFsc28gYXBwZW5kIGFcbiAgICAgICAgICAgICAgICAvLyAkbGl0JCBzdWZmaXggdG8gdGhlIG5hbWUgdG8gb3B0LW91dCBvZiBhdHRyaWJ1dGUtc3BlY2lmaWMgcGFyc2luZ1xuICAgICAgICAgICAgICAgIC8vIHRoYXQgSUUgYW5kIEVkZ2UgZG8gZm9yIHN0eWxlIGFuZCBjZXJ0YWluIFNWRyBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcy5zdWJzdHIoMCwgYXR0cmlidXRlTWF0Y2guaW5kZXgpICsgYXR0cmlidXRlTWF0Y2hbMV0gK1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVNYXRjaFsyXSArIGJvdW5kQXR0cmlidXRlU3VmZml4ICsgYXR0cmlidXRlTWF0Y2hbM10gK1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSB0aGlzLnN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGhpcy5nZXRIVE1MKCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgZm9yIFNWRyBmcmFnbWVudHMuXG4gKlxuICogVGhpcyBjbGFzcyB3cmFwcyBIVE1MIGluIGFuIGA8c3ZnPmAgdGFnIGluIG9yZGVyIHRvIHBhcnNlIGl0cyBjb250ZW50cyBpbiB0aGVcbiAqIFNWRyBuYW1lc3BhY2UsIHRoZW4gbW9kaWZpZXMgdGhlIHRlbXBsYXRlIHRvIHJlbW92ZSB0aGUgYDxzdmc+YCB0YWcgc28gdGhhdFxuICogY2xvbmVzIG9ubHkgY29udGFpbmVyIHRoZSBvcmlnaW5hbCBmcmFnbWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNWR1RlbXBsYXRlUmVzdWx0IGV4dGVuZHMgVGVtcGxhdGVSZXN1bHQge1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIHJldHVybiBgPHN2Zz4ke3N1cGVyLmdldEhUTUwoKX08L3N2Zz5gO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gc3VwZXIuZ2V0VGVtcGxhdGVFbGVtZW50KCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50O1xuICAgICAgICBjb25zdCBzdmdFbGVtZW50ID0gY29udGVudC5maXJzdENoaWxkO1xuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKHN2Z0VsZW1lbnQpO1xuICAgICAgICByZXBhcmVudE5vZGVzKGNvbnRlbnQsIHN2Z0VsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1yZXN1bHQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vcGFydC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vdGVtcGxhdGUtcmVzdWx0LmpzJztcbmltcG9ydCB7IGNyZWF0ZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAhKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSk7XG59O1xuZXhwb3J0IGNvbnN0IGlzSXRlcmFibGUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHxcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAhISh2YWx1ZSAmJiB2YWx1ZVtTeW1ib2wuaXRlcmF0b3JdKTtcbn07XG4vKipcbiAqIFdyaXRlcyBhdHRyaWJ1dGUgdmFsdWVzIHRvIHRoZSBET00gZm9yIGEgZ3JvdXAgb2YgQXR0cmlidXRlUGFydHMgYm91bmQgdG8gYVxuICogc2luZ2xlIGF0dGlidXRlLiBUaGUgdmFsdWUgaXMgb25seSBzZXQgb25jZSBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0c1xuICogZm9yIGFuIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRzW2ldID0gdGhpcy5fY3JlYXRlUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaW5nbGUgcGFydC4gT3ZlcnJpZGUgdGhpcyB0byBjcmVhdGUgYSBkaWZmZXJudCB0eXBlIG9mIHBhcnQuXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXR0cmlidXRlUGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHBhcnQudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHYpIHx8ICFpc0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdiA6IFN0cmluZyh2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdCBvZiB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB0ID09PSAnc3RyaW5nJyA/IHQgOiBTdHJpbmcodCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGV4dCArPSBzdHJpbmdzW2xdO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsIHRoaXMuX2dldFZhbHVlKCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhbGwgb3IgcGFydCBvZiBhbiBhdHRyaWJ1dGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihjb21taXR0ZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jb21taXR0ZXIgPSBjb21taXR0ZXI7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbm9DaGFuZ2UgJiYgKCFpc1ByaW1pdGl2ZSh2YWx1ZSkgfHwgdmFsdWUgIT09IHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgYSBub3QgYSBkaXJlY3RpdmUsIGRpcnR5IHRoZSBjb21taXR0ZXIgc28gdGhhdCBpdCdsbFxuICAgICAgICAgICAgLy8gY2FsbCBzZXRBdHRyaWJ1dGUuIElmIHRoZSB2YWx1ZSBpcyBhIGRpcmVjdGl2ZSwgaXQnbGwgZGlydHkgdGhlXG4gICAgICAgICAgICAvLyBjb21taXR0ZXIgaWYgaXQgY2FsbHMgc2V0VmFsdWUoKS5cbiAgICAgICAgICAgIGlmICghaXNEaXJlY3RpdmUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21taXR0ZXIuZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWl0dGVyLmNvbW1pdCgpO1xuICAgIH1cbn1cbi8qKlxuICogQSBQYXJ0IHRoYXQgY29udHJvbHMgYSBsb2NhdGlvbiB3aXRoaW4gYSBOb2RlIHRyZWUuIExpa2UgYSBSYW5nZSwgTm9kZVBhcnRcbiAqIGhhcyBzdGFydCBhbmQgZW5kIGxvY2F0aW9ucyBhbmQgY2FuIHNldCBhbmQgdXBkYXRlIHRoZSBOb2RlcyBiZXR3ZWVuIHRob3NlXG4gKiBsb2NhdGlvbnMuXG4gKlxuICogTm9kZVBhcnRzIHN1cHBvcnQgc2V2ZXJhbCB2YWx1ZSB0eXBlczogcHJpbWl0aXZlcywgTm9kZXMsIFRlbXBsYXRlUmVzdWx0cyxcbiAqIGFzIHdlbGwgYXMgYXJyYXlzIGFuZCBpdGVyYWJsZXMgb2YgdGhvc2UgdHlwZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlUGFydCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50byhjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBhZnRlciB0aGUgYHJlZmAgbm9kZSAoYmV0d2VlbiBgcmVmYCBhbmQgYHJlZmAncyBuZXh0XG4gICAgICogc2libGluZykuIEJvdGggYHJlZmAgYW5kIGl0cyBuZXh0IHNpYmxpbmcgbXVzdCBiZSBzdGF0aWMsIHVuY2hhbmdpbmcgbm9kZXNcbiAgICAgKiBzdWNoIGFzIHRob3NlIHRoYXQgYXBwZWFyIGluIGEgbGl0ZXJhbCBzZWN0aW9uIG9mIGEgdGVtcGxhdGUuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlck5vZGUocmVmKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gcmVmO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBwYXJlbnQgcGFydC5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG9QYXJ0KHBhcnQpIHtcbiAgICAgICAgcGFydC5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgcGFydC5fX2luc2VydCh0aGlzLmVuZE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJQYXJ0KHJlZikge1xuICAgICAgICByZWYuX19pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5lbmROb2RlO1xuICAgICAgICByZWYuZW5kTm9kZSA9IHRoaXMuc3RhcnROb2RlO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm90aGluZztcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19pbnNlcnQobm9kZSkge1xuICAgICAgICB0aGlzLmVuZE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgdGhpcy5lbmROb2RlKTtcbiAgICB9XG4gICAgX19jb21taXROb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fX2luc2VydCh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZXh0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZS5uZXh0U2libGluZztcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbiAgICAgICAgLy8gSWYgYHZhbHVlYCBpc24ndCBhbHJlYWR5IGEgc3RyaW5nLCB3ZSBleHBsaWNpdGx5IGNvbnZlcnQgaXQgaGVyZSBpbiBjYXNlXG4gICAgICAgIC8vIGl0IGNhbid0IGJlIGltcGxpY2l0bHkgY29udmVydGVkIC0gaS5lLiBpdCdzIGEgc3ltYm9sLlxuICAgICAgICBjb25zdCB2YWx1ZUFzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZW5kTm9kZS5wcmV2aW91c1NpYmxpbmcgJiZcbiAgICAgICAgICAgIG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIG9ubHkgaGF2ZSBhIHNpbmdsZSB0ZXh0IG5vZGUgYmV0d2VlbiB0aGUgbWFya2Vycywgd2UgY2FuIGp1c3RcbiAgICAgICAgICAgIC8vIHNldCBpdHMgdmFsdWUsIHJhdGhlciB0aGFuIHJlcGxhY2luZyBpdC5cbiAgICAgICAgICAgIC8vIFRPRE8oanVzdGluZmFnbmFuaSk6IENhbiB3ZSBqdXN0IGNoZWNrIGlmIHRoaXMudmFsdWUgaXMgcHJpbWl0aXZlP1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gdmFsdWVBc1N0cmluZztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZhbHVlQXNTdHJpbmcpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGVGYWN0b3J5KHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICB0aGlzLnZhbHVlLnRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBwcm9wYWdhdGUgdGhlIHRlbXBsYXRlIHByb2Nlc3NvciBmcm9tIHRoZSBUZW1wbGF0ZVJlc3VsdFxuICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSB1c2UgaXRzIHN5bnRheCBleHRlbnNpb24sIGV0Yy4gVGhlIHRlbXBsYXRlIGZhY3RvcnkgY29tZXNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIHJlbmRlciBmdW5jdGlvbiBvcHRpb25zIHNvIHRoYXQgaXQgY2FuIGNvbnRyb2wgdGVtcGxhdGVcbiAgICAgICAgICAgIC8vIGNhY2hpbmcgYW5kIHByZXByb2Nlc3NpbmcuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlLCB2YWx1ZS5wcm9jZXNzb3IsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSgpO1xuICAgICAgICAgICAgaW5zdGFuY2UudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19jb21taXRJdGVyYWJsZSh2YWx1ZSkge1xuICAgICAgICAvLyBGb3IgYW4gSXRlcmFibGUsIHdlIGNyZWF0ZSBhIG5ldyBJbnN0YW5jZVBhcnQgcGVyIGl0ZW0sIHRoZW4gc2V0IGl0c1xuICAgICAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAgICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgICAgIC8vIG9mIFRlbXBsYXRlUmVzdWx0cyB0aGF0IHdpbGwgYmUgY29tbW9ubHkgcmV0dXJuZWQgZnJvbSBleHByZXNzaW9ucyBsaWtlOlxuICAgICAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuICAgICAgICAvLyBJZiBfdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAgICAgLy8gaXRlcmFibGUgYW5kIF92YWx1ZSB3aWxsIGNvbnRhaW4gdGhlIE5vZGVQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyByZW5kZXIuIElmIF92YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgICAgICAvLyBhcnJheSBmb3IgTm9kZVBhcnRzLlxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAgICAgLy8gaXRlbXMgZnJvbSBhIHByZXZpb3VzIHJlbmRlclxuICAgICAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLnZhbHVlO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGl0ZW1QYXJ0O1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byByZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgICAgaWYgKGl0ZW1QYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpdGVtUGFydCA9IG5ldyBOb2RlUGFydCh0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0cy5wdXNoKGl0ZW1QYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAocGFydEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0LmFwcGVuZEludG9QYXJ0KHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuaW5zZXJ0QWZ0ZXJQYXJ0KGl0ZW1QYXJ0c1twYXJ0SW5kZXggLSAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbVBhcnQuc2V0VmFsdWUoaXRlbSk7XG4gICAgICAgICAgICBpdGVtUGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICAgICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgICAgICAgICAgdGhpcy5jbGVhcihpdGVtUGFydCAmJiBpdGVtUGFydC5lbmROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcihzdGFydE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSkge1xuICAgICAgICByZW1vdmVOb2Rlcyh0aGlzLnN0YXJ0Tm9kZS5wYXJlbnROb2RlLCBzdGFydE5vZGUubmV4dFNpYmxpbmcsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxufVxuLyoqXG4gKiBJbXBsZW1lbnRzIGEgYm9vbGVhbiBhdHRyaWJ1dGUsIHJvdWdobHkgYXMgZGVmaW5lZCBpbiB0aGUgSFRNTFxuICogc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBJZiB0aGUgdmFsdWUgaXMgdHJ1dGh5LCB0aGVuIHRoZSBhdHRyaWJ1dGUgaXMgcHJlc2VudCB3aXRoIGEgdmFsdWUgb2ZcbiAqICcnLiBJZiB0aGUgdmFsdWUgaXMgZmFsc2V5LCB0aGUgYXR0cmlidXRlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb29sZWFuQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggIT09IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm9vbGVhbiBhdHRyaWJ1dGVzIGNhbiBvbmx5IGNvbnRhaW4gYSBzaW5nbGUgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSAhIXRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxufVxuLyoqXG4gKiBTZXRzIGF0dHJpYnV0ZSB2YWx1ZXMgZm9yIFByb3BlcnR5UGFydHMsIHNvIHRoYXQgdGhlIHZhbHVlIGlzIG9ubHkgc2V0IG9uY2VcbiAqIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzIGZvciBhIHByb3BlcnR5LlxuICpcbiAqIElmIGFuIGV4cHJlc3Npb24gY29udHJvbHMgdGhlIHdob2xlIHByb3BlcnR5IHZhbHVlLCB0aGVuIHRoZSB2YWx1ZSBpcyBzaW1wbHlcbiAqIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSB1bmRlciBjb250cm9sLiBJZiB0aGVyZSBhcmUgc3RyaW5nIGxpdGVyYWxzIG9yXG4gKiBtdWx0aXBsZSBleHByZXNzaW9ucywgdGhlbiB0aGUgc3RyaW5ncyBhcmUgZXhwcmVzc2lvbnMgYXJlIGludGVycG9sYXRlZCBpbnRvXG4gKiBhIHN0cmluZyBmaXJzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3BlcnR5Q29tbWl0dGVyIGV4dGVuZHMgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICB0aGlzLnNpbmdsZSA9XG4gICAgICAgICAgICAoc3RyaW5ncy5sZW5ndGggPT09IDIgJiYgc3RyaW5nc1swXSA9PT0gJycgJiYgc3RyaW5nc1sxXSA9PT0gJycpO1xuICAgIH1cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVBhcnQodGhpcyk7XG4gICAgfVxuICAgIF9nZXRWYWx1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0c1swXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFZhbHVlKCk7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudFt0aGlzLm5hbWVdID0gdGhpcy5fZ2V0VmFsdWUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbn1cbi8vIERldGVjdCBldmVudCBsaXN0ZW5lciBvcHRpb25zIHN1cHBvcnQuIElmIHRoZSBgY2FwdHVyZWAgcHJvcGVydHkgaXMgcmVhZFxuLy8gZnJvbSB0aGUgb3B0aW9ucyBvYmplY3QsIHRoZW4gb3B0aW9ucyBhcmUgc3VwcG9ydGVkLiBJZiBub3QsIHRoZW4gdGhlIHRocmlkXG4vLyBhcmd1bWVudCB0byBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lciBpcyBpbnRlcnByZXRlZCBhcyB0aGUgYm9vbGVhbiBjYXB0dXJlXG4vLyB2YWx1ZSBzbyB3ZSBzaG91bGQgb25seSBwYXNzIHRoZSBgY2FwdHVyZWAgcHJvcGVydHkuXG5sZXQgZXZlbnRPcHRpb25zU3VwcG9ydGVkID0gZmFsc2U7XG50cnkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGdldCBjYXB0dXJlKCkge1xuICAgICAgICAgICAgZXZlbnRPcHRpb25zU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG59XG5jYXRjaCAoX2UpIHtcbn1cbmV4cG9ydCBjbGFzcyBFdmVudFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRDb250ZXh0KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmV2ZW50Q29udGV4dCA9IGV2ZW50Q29udGV4dDtcbiAgICAgICAgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQgPSAoZSkgPT4gdGhpcy5oYW5kbGVFdmVudChlKTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdMaXN0ZW5lciA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGNvbnN0IG9sZExpc3RlbmVyID0gdGhpcy52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2hvdWxkUmVtb3ZlTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciA9PSBudWxsIHx8XG4gICAgICAgICAgICBvbGRMaXN0ZW5lciAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgKG5ld0xpc3RlbmVyLmNhcHR1cmUgIT09IG9sZExpc3RlbmVyLmNhcHR1cmUgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIub25jZSAhPT0gb2xkTGlzdGVuZXIub25jZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5wYXNzaXZlICE9PSBvbGRMaXN0ZW5lci5wYXNzaXZlKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkQWRkTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciAhPSBudWxsICYmIChvbGRMaXN0ZW5lciA9PSBudWxsIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcbiAgICAgICAgaWYgKHNob3VsZFJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQsIHRoaXMuX19vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX19vcHRpb25zID0gZ2V0T3B0aW9ucyhuZXdMaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQsIHRoaXMuX19vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gbmV3TGlzdGVuZXI7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmNhbGwodGhpcy5ldmVudENvbnRleHQgfHwgdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIFdlIGNvcHkgb3B0aW9ucyBiZWNhdXNlIG9mIHRoZSBpbmNvbnNpc3RlbnQgYmVoYXZpb3Igb2YgYnJvd3NlcnMgd2hlbiByZWFkaW5nXG4vLyB0aGUgdGhpcmQgYXJndW1lbnQgb2YgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuIElFMTEgZG9lc24ndCBzdXBwb3J0IG9wdGlvbnNcbi8vIGF0IGFsbC4gQ2hyb21lIDQxIG9ubHkgcmVhZHMgYGNhcHR1cmVgIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBvYmplY3QuXG5jb25zdCBnZXRPcHRpb25zID0gKG8pID0+IG8gJiZcbiAgICAoZXZlbnRPcHRpb25zU3VwcG9ydGVkID9cbiAgICAgICAgeyBjYXB0dXJlOiBvLmNhcHR1cmUsIHBhc3NpdmU6IG8ucGFzc2l2ZSwgb25jZTogby5vbmNlIH0gOlxuICAgICAgICBvLmNhcHR1cmUpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydHMuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIgfSBmcm9tICcuL3BhcnRzLmpzJztcbi8qKlxuICogQ3JlYXRlcyBQYXJ0cyB3aGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGFuIGF0dHJpYnV0ZS1wb3NpdGlvbiBiaW5kaW5nLCBnaXZlbiB0aGUgZXZlbnQsIGF0dHJpYnV0ZVxuICAgICAqIG5hbWUsIGFuZCBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBiaW5kaW5nXG4gICAgICogQHBhcmFtIG5hbWUgIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAqIEBwYXJhbSBzdHJpbmdzIFRoZSBzdHJpbmcgbGl0ZXJhbHMuIFRoZXJlIGFyZSBhbHdheXMgYXQgbGVhc3QgdHdvIHN0cmluZ3MsXG4gICAgICogICBldmVudCBmb3IgZnVsbHktY29udHJvbGxlZCBiaW5kaW5ncyB3aXRoIGEgc2luZ2xlIGV4cHJlc3Npb24uXG4gICAgICovXG4gICAgaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMoZWxlbWVudCwgbmFtZSwgc3RyaW5ncywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBuYW1lWzBdO1xuICAgICAgICBpZiAocHJlZml4ID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBQcm9wZXJ0eUNvbW1pdHRlcihlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKTtcbiAgICAgICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJ0AnKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBFdmVudFBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgb3B0aW9ucy5ldmVudENvbnRleHQpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnPycpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21taXR0ZXIgPSBuZXcgQXR0cmlidXRlQ29tbWl0dGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICByZXR1cm4gY29tbWl0dGVyLnBhcnRzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGEgdGV4dC1wb3NpdGlvbiBiaW5kaW5nLlxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZUZhY3RvcnlcbiAgICAgKi9cbiAgICBoYW5kbGVUZXh0RXhwcmVzc2lvbihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZVBhcnQob3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciA9IG5ldyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IG1hcmtlciwgVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogVGhlIGRlZmF1bHQgVGVtcGxhdGVGYWN0b3J5IHdoaWNoIGNhY2hlcyBUZW1wbGF0ZXMga2V5ZWQgb25cbiAqIHJlc3VsdC50eXBlIGFuZCByZXN1bHQuc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlRmFjdG9yeShyZXN1bHQpIHtcbiAgICBsZXQgdGVtcGxhdGVDYWNoZSA9IHRlbXBsYXRlQ2FjaGVzLmdldChyZXN1bHQudHlwZSk7XG4gICAgaWYgKHRlbXBsYXRlQ2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlID0ge1xuICAgICAgICAgICAgc3RyaW5nc0FycmF5OiBuZXcgV2Vha01hcCgpLFxuICAgICAgICAgICAga2V5U3RyaW5nOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICAgICAgdGVtcGxhdGVDYWNoZXMuc2V0KHJlc3VsdC50eXBlLCB0ZW1wbGF0ZUNhY2hlKTtcbiAgICB9XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuZ2V0KHJlc3VsdC5zdHJpbmdzKTtcbiAgICBpZiAodGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuICAgIC8vIElmIHRoZSBUZW1wbGF0ZVN0cmluZ3NBcnJheSBpcyBuZXcsIGdlbmVyYXRlIGEga2V5IGZyb20gdGhlIHN0cmluZ3NcbiAgICAvLyBUaGlzIGtleSBpcyBzaGFyZWQgYmV0d2VlbiBhbGwgdGVtcGxhdGVzIHdpdGggaWRlbnRpY2FsIGNvbnRlbnRcbiAgICBjb25zdCBrZXkgPSByZXN1bHQuc3RyaW5ncy5qb2luKG1hcmtlcik7XG4gICAgLy8gQ2hlY2sgaWYgd2UgYWxyZWFkeSBoYXZlIGEgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLmtleVN0cmluZy5nZXQoa2V5KTtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIG5vdCBzZWVuIHRoaXMga2V5IGJlZm9yZSwgY3JlYXRlIGEgbmV3IFRlbXBsYXRlXG4gICAgICAgIHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCwgcmVzdWx0LmdldFRlbXBsYXRlRWxlbWVudCgpKTtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgICAgICB0ZW1wbGF0ZUNhY2hlLmtleVN0cmluZy5zZXQoa2V5LCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8vIENhY2hlIGFsbCBmdXR1cmUgcXVlcmllcyBmb3IgdGhpcyBUZW1wbGF0ZVN0cmluZ3NBcnJheVxuICAgIHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LnNldChyZXN1bHQuc3RyaW5ncywgdGVtcGxhdGUpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbn1cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZUNhY2hlcyA9IG5ldyBNYXAoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLWZhY3RvcnkuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgTm9kZVBhcnQgfSBmcm9tICcuL3BhcnRzLmpzJztcbmltcG9ydCB7IHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgY29uc3QgcGFydHMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBSZW5kZXJzIGEgdGVtcGxhdGUgcmVzdWx0IG9yIG90aGVyIHZhbHVlIHRvIGEgY29udGFpbmVyLlxuICpcbiAqIFRvIHVwZGF0ZSBhIGNvbnRhaW5lciB3aXRoIG5ldyB2YWx1ZXMsIHJlZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGxpdGVyYWwgYW5kXG4gKiBjYWxsIGByZW5kZXJgIHdpdGggdGhlIG5ldyByZXN1bHQuXG4gKlxuICogQHBhcmFtIHJlc3VsdCBBbnkgdmFsdWUgcmVuZGVyYWJsZSBieSBOb2RlUGFydCAtIHR5cGljYWxseSBhIFRlbXBsYXRlUmVzdWx0XG4gKiAgICAgY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnIGxpa2UgYGh0bWxgIG9yIGBzdmdgLlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBwYXJlbnQgdG8gcmVuZGVyIHRvLiBUaGUgZW50aXJlIGNvbnRlbnRzIGFyZSBlaXRoZXJcbiAqICAgICByZXBsYWNlZCwgb3IgZWZmaWNpZW50bHkgdXBkYXRlZCBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXMgcHJldmlvdXNcbiAqICAgICByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFJlbmRlck9wdGlvbnMgZm9yIHRoZSBlbnRpcmUgcmVuZGVyIHRyZWUgcmVuZGVyZWQgdG8gdGhpc1xuICogICAgIGNvbnRhaW5lci4gUmVuZGVyIG9wdGlvbnMgbXVzdCAqbm90KiBjaGFuZ2UgYmV0d2VlbiByZW5kZXJzIHRvIHRoZSBzYW1lXG4gKiAgICAgY29udGFpbmVyLCBhcyB0aG9zZSBjaGFuZ2VzIHdpbGwgbm90IGVmZmVjdCBwcmV2aW91c2x5IHJlbmRlcmVkIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChyZXN1bHQsIGNvbnRhaW5lciwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBwYXJ0ID0gcGFydHMuZ2V0KGNvbnRhaW5lcik7XG4gICAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW1vdmVOb2Rlcyhjb250YWluZXIsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgcGFydHMuc2V0KGNvbnRhaW5lciwgcGFydCA9IG5ldyBOb2RlUGFydChPYmplY3QuYXNzaWduKHsgdGVtcGxhdGVGYWN0b3J5IH0sIG9wdGlvbnMpKSk7XG4gICAgICAgIHBhcnQuYXBwZW5kSW50byhjb250YWluZXIpO1xuICAgIH1cbiAgICBwYXJ0LnNldFZhbHVlKHJlc3VsdCk7XG4gICAgcGFydC5jb21taXQoKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXIuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKlxuICogTWFpbiBsaXQtaHRtbCBtb2R1bGUuXG4gKlxuICogTWFpbiBleHBvcnRzOlxuICpcbiAqIC0gIFtbaHRtbF1dXG4gKiAtICBbW3N2Z11dXG4gKiAtICBbW3JlbmRlcl1dXG4gKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICogQHByZWZlcnJlZFxuICovXG4vKipcbiAqIERvIG5vdCByZW1vdmUgdGhpcyBjb21tZW50OyBpdCBrZWVwcyB0eXBlZG9jIGZyb20gbWlzcGxhY2luZyB0aGUgbW9kdWxlXG4gKiBkb2NzLlxuICovXG5pbXBvcnQgeyBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5pbXBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5leHBvcnQgeyBkaXJlY3RpdmUsIGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9saWIvZGlyZWN0aXZlLmpzJztcbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IHJlbW92ZSBsaW5lIHdoZW4gd2UgZ2V0IE5vZGVQYXJ0IG1vdmluZyBtZXRob2RzXG5leHBvcnQgeyByZW1vdmVOb2RlcywgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vbGliL2RvbS5qcyc7XG5leHBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vbGliL3BhcnQuanMnO1xuZXhwb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBBdHRyaWJ1dGVQYXJ0LCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBpc0l0ZXJhYmxlLCBpc1ByaW1pdGl2ZSwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyLCBQcm9wZXJ0eVBhcnQgfSBmcm9tICcuL2xpYi9wYXJ0cy5qcyc7XG5leHBvcnQgeyBwYXJ0cywgcmVuZGVyIH0gZnJvbSAnLi9saWIvcmVuZGVyLmpzJztcbmV4cG9ydCB7IHRlbXBsYXRlQ2FjaGVzLCB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5leHBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgY3JlYXRlTWFya2VyLCBpc1RlbXBsYXRlUGFydEFjdGl2ZSwgVGVtcGxhdGUgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS5qcyc7XG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogaW5qZWN0IHZlcnNpb24gbnVtYmVyIGF0IGJ1aWxkIHRpbWVcbih3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddIHx8ICh3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddID0gW10pKS5wdXNoKCcxLjEuMicpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBIVE1MIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnaHRtbCcsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgU1ZHVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnc3ZnJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1odG1sLmpzLm1hcCIsIi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgbWFwIGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBhIHByb3BlcnR5IHZhbHVlXG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZU1hcHBlcjxUID0gYW55PiA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gVCB8IG51bGw7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgbWFwIGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gYXR0cmlidXRlIHZhbHVlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5TWFwcGVyPFQgPSBhbnk+ID0gKHZhbHVlOiBUIHwgbnVsbCkgPT4gc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBbiBvYmplY3QgdGhhdCBob2xkcyBhbiB7QGxpbmsgQXR0cmlidXRlTWFwcGVyfSBhbmQgYSB7QGxpbmsgUHJvcGVydHlNYXBwZXJ9XG4gKlxuICogQHJlbWFya3NcbiAqIEZvciB0aGUgbW9zdCBjb21tb24gdHlwZXMsIGEgY29udmVydGVyIGV4aXN0cyB3aGljaCBjYW4gYmUgcmVmZXJlbmNlZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICpcbiAqICAgICAgQHByb3BlcnR5KHtcbiAqICAgICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICogICAgICB9KVxuICogICAgICBteVByb3BlcnR5ID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZUNvbnZlcnRlcjxUID0gYW55PiB7XG4gICAgdG9BdHRyaWJ1dGU6IFByb3BlcnR5TWFwcGVyPFQ+O1xuICAgIGZyb21BdHRyaWJ1dGU6IEF0dHJpYnV0ZU1hcHBlcjxUPjtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgY29udmVydGVyXG4gKlxuICogQHJlbWFya3NcbiAqIFRoaXMgY29udmVydGVyIGlzIHVzZWQgYXMgdGhlIGRlZmF1bHQgY29udmVydGVyIGZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB1bmxlc3MgYSBkaWZmZXJlbnQgb25lXG4gKiBpcyBzcGVjaWZpZWQuIFRoZSBjb252ZXJ0ZXIgdHJpZXMgdG8gaW5mZXIgdGhlIHByb3BlcnR5IHR5cGUgd2hlbiBjb252ZXJ0aW5nIHRvIGF0dHJpYnV0ZXMgYW5kXG4gKiB1c2VzIGBKU09OLnBhcnNlKClgIHdoZW4gY29udmVydGluZyBzdHJpbmdzIGZyb20gYXR0cmlidXRlcy4gSWYgYEpTT04ucGFyc2UoKWAgdGhyb3dzIGFuIGVycm9yLFxuICogdGhlIGNvbnZlcnRlciB3aWxsIHVzZSB0aGUgYXR0cmlidXRlIHZhbHVlIGFzIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdDogQXR0cmlidXRlQ29udmVydGVyID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgc3VjY2Vzc2Z1bGx5IHBhcnNlIGBib29sZWFuYCwgYG51bWJlcmAgYW5kIGBKU09OLnN0cmluZ2lmeWAnZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBpdCB0aHJvd3MsIGl0IG1lYW5zIHdlJ3JlIHByb2JhYmx5IGRlYWxpbmcgd2l0aCBhIHJlZ3VsYXIgc3RyaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgIH0sXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IG51bGw7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBudW1iZXIsIGJpZ2ludCwgc3ltYm9sLCBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGJvb2xlYW4gYXR0cmlidXRlcywgbGlrZSBgZGlzYWJsZWRgLCB3aGljaCBhcmUgY29uc2lkZXJlZCB0cnVlIGlmIHRoZXkgYXJlIHNldCB3aXRoXG4gKiBhbnkgdmFsdWUgYXQgYWxsLiBJbiBvcmRlciB0byBzZXQgdGhlIGF0dHJpYnV0ZSB0byBmYWxzZSwgdGhlIGF0dHJpYnV0ZSBoYXMgdG8gYmUgcmVtb3ZlZCBieVxuICogc2V0dGluZyB0aGUgYXR0cmlidXRlIHZhbHVlIHRvIGBudWxsYC5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW46IEF0dHJpYnV0ZUNvbnZlcnRlcjxib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSAhPT0gbnVsbCksXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYm9vbGVhbiB8IG51bGwpID0+IHZhbHVlID8gJycgOiBudWxsXG59XG5cbi8qKlxuICogSGFuZGxlcyBib29sZWFuIEFSSUEgYXR0cmlidXRlcywgbGlrZSBgYXJpYS1jaGVja2VkYCBvciBgYXJpYS1zZWxlY3RlZGAsIHdoaWNoIGhhdmUgdG8gYmVcbiAqIHNldCBleHBsaWNpdGx5IHRvIGB0cnVlYCBvciBgZmFsc2VgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW46IEF0dHJpYnV0ZUNvbnZlcnRlcjxib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWUpID0+IHZhbHVlID09PSAndHJ1ZScsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPHN0cmluZz4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwpID8gbnVsbCA6IHZhbHVlLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZhbHVlXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxudW1iZXI+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiBOdW1iZXIodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBudW1iZXIgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck9iamVjdDogQXR0cmlidXRlQ29udmVydGVyPG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnlbXT4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnlbXSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGF0ZTogQXR0cmlidXRlQ29udmVydGVyPERhdGU+ID0ge1xuICAgIC8vIGBuZXcgRGF0ZSgpYCB3aWxsIHJldHVybiBhbiBgSW52YWxpZCBEYXRlYCBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IG5ldyBEYXRlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogRGF0ZSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlbGVjdG9yIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNlbGVjdG9yIHdpbGwgYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHdpdGggdGhlIGJyb3dzZXInc1xuICAgICAqIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQSS4gSWYgbm8gc2VsZWN0b3IgaXMgc3BlY2lmaWVkLCB0aGUgY29tcG9uZW50IGNsYXNzXG4gICAgICogbmVlZHMgdG8gcHJvdmlkZSBvbmUgaW4gaXRzIHN0YXRpYyB7QGxpbmsgQ29tcG9uZW50LnNlbGVjdG9yfSBwcm9wZXJ0eS5cbiAgICAgKiBBIHNlbGVjdG9yIGRlZmluZWQgaW4gdGhlIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn0gd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGVcbiAgICAgKiBzdGF0aWMgY2xhc3MgcHJvcGVydHkuXG4gICAgICovXG4gICAgc2VsZWN0b3I6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTSB0byByZW5kZXIgdGhlIGNvbXBvbmVudHMgdGVtcGxhdGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNoYWRvdyBET00gY2FuIGJlIGRpc2FibGVkIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYCwgaW4gd2hpY2ggY2FzZSB0aGVcbiAgICAgKiBjb21wb25lbnQncyB0ZW1wbGF0ZSB3aWxsIGJlIHJlbmRlcmVkIGFzIGNoaWxkIG5vZGVzIG9mIHRoZSBjb21wb25lbnQuIFRoaXMgY2FuIGJlXG4gICAgICogdXNlZnVsIGlmIGFuIGlzb2xhdGVkIERPTSBhbmQgc2NvcGVkIENTUyBpcyBub3QgZGVzaXJlZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHNoYWRvdzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBBdXRvbWF0aWNhbGx5IHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgYnJvd3NlcidzIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQST9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW4gY2FzZXMgd2hlcmUgeW91IHdhbnQgdG8gZW1wbG95IGEgbW9kdWxlIHN5c3RlbSB3aGljaCByZWdpc3RlcnMgY29tcG9uZW50cyBvbiBhXG4gICAgICogY29uZGl0aW9uYWwgYmFzaXMsIHlvdSBjYW4gZGlzYWJsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYC5cbiAgICAgKiBZb3VyIG1vZHVsZSBvciBib290c3RyYXAgc3lzdGVtIHdpbGwgaGF2ZSB0byB0YWtlIGNhcmUgb2YgZGVmaW5pbmcgdGhlIGNvbXBvbmVudCBsYXRlci5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIGRlZmluZTogYm9vbGVhbjtcbiAgICAvLyBUT0RPOiB0ZXN0IG1lZGlhIHF1ZXJpZXNcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEFuIGFycmF5IG9mIENTUyBydWxlc2V0cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL1N5bnRheCNDU1NfcnVsZXNldHMpLlxuICAgICAqIFN0eWxlcyBkZWZpbmVkIHVzaW5nIHRoZSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCBzdHlsZXMgZGVmaW5lZCBpbiB0aGUgY29tcG9uZW50J3NcbiAgICAgKiBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlci5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHN0eWxlczogW1xuICAgICAqICAgICAgICAgICdoMSwgaDIgeyBmb250LXNpemU6IDE2cHQ7IH0nLFxuICAgICAqICAgICAgICAgICdAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA5MDBweCkgeyBhcnRpY2xlIHsgcGFkZGluZzogMXJlbSAzcmVtOyB9IH0nXG4gICAgICogICAgICBdXG4gICAgICogfSlcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB1bmRlZmluZWRgXG4gICAgICovXG4gICAgc3R5bGVzPzogc3RyaW5nW107XG4gICAgLy8gVE9ETzogdXBkYXRlIGRvY3VtZW50YXRpb25cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEge0BsaW5rICNsaXQtaHRtbC5UZW1wbGF0ZVJlc3VsdH0uIFRoZSBmdW5jdGlvbidzIGBlbGVtZW50YFxuICAgICAqIHBhcmFtZXRlciB3aWxsIGJlIHRoZSBjdXJyZW50IGNvbXBvbmVudCBpbnN0YW5jZS4gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgYnkgdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFRoZSBtZXRob2QgbXVzdCByZXR1cm4gYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHdoaWNoIGlzIGNyZWF0ZWQgdXNpbmcgbGl0LWh0bWwnc1xuICAgICAqIHtAbGluayBsaXQtaHRtbCNodG1sIHwgYGh0bWxgfSBvciB7QGxpbmsgbGl0LWh0bWwjc3ZnIHwgYHN2Z2B9IHRlbXBsYXRlIG1ldGhvZHMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGNvbXBvbmVudCBpbnN0YW5jZSByZXF1ZXN0aW5nIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHRlbXBsYXRlPzogKGVsZW1lbnQ6IFR5cGUsIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT046IENvbXBvbmVudERlY2xhcmF0aW9uID0ge1xuICAgIHNlbGVjdG9yOiAnJyxcbiAgICBzaGFkb3c6IHRydWUsXG4gICAgZGVmaW5lOiB0cnVlLFxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnREZWNsYXJhdGlvbiwgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT04gfSBmcm9tICcuL2NvbXBvbmVudC1kZWNsYXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlIH0gZnJvbSAnLi9wcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gY2xhc3NcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudDxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogUGFydGlhbDxDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB7IC4uLkRFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICByZXR1cm4gKHRhcmdldDogdHlwZW9mIENvbXBvbmVudCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0IGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3RydWN0b3Iuc2VsZWN0b3IgPSBkZWNsYXJhdGlvbi5zZWxlY3RvciB8fCB0YXJnZXQuc2VsZWN0b3I7XG4gICAgICAgIGNvbnN0cnVjdG9yLnNoYWRvdyA9IGRlY2xhcmF0aW9uLnNoYWRvdztcbiAgICAgICAgY29uc3RydWN0b3IudGVtcGxhdGUgPSBkZWNsYXJhdGlvbi50ZW1wbGF0ZSB8fCB0YXJnZXQudGVtcGxhdGU7XG5cbiAgICAgICAgLy8gdXNlIGtleW9mIHNpZ25hdHVyZXMgdG8gY2F0Y2ggcmVmYWN0b3JpbmcgZXJyb3JzXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlc0tleToga2V5b2YgdHlwZW9mIENvbXBvbmVudCA9ICdvYnNlcnZlZEF0dHJpYnV0ZXMnO1xuICAgICAgICBjb25zdCBzdHlsZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnc3R5bGVzJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvcGVydHkgZGVjb3JhdG9ycyBnZXQgY2FsbGVkIGJlZm9yZSBjbGFzcyBkZWNvcmF0b3JzLCBzbyBhdCB0aGlzIHBvaW50IGFsbCBkZWNvcmF0ZWQgcHJvcGVydGllc1xuICAgICAgICAgKiBoYXZlIHN0b3JlZCB0aGVpciBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMgaW4ge0BsaW5rIENvbXBvbmVudC5hdHRyaWJ1dGVzfS5cbiAgICAgICAgICogV2UgY2FuIG5vdyBjb21iaW5lIHRoZW0gd2l0aCB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBhbmQsXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LCBlbGltaW5hdGUgYWxsIGR1cGxpY2F0ZXMgaW4gdGhlIHByb2Nlc3MuXG4gICAgICAgICAqXG4gICAgICAgICAqIEFzIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IHdpbGwgYWxzbyBpbmNsdWRlIGRlY29yYXRvciBnZW5lcmF0ZWRcbiAgICAgICAgICogb2JzZXJ2ZWQgYXR0cmlidXRlcywgd2UgYWx3YXlzIGluaGVyaXQgYWxsIG9ic2VydmVkIGF0dHJpYnV0ZXMgZnJvbSBhIGJhc2UgY2xhc3MuIEZvciB0aGF0IHJlYXNvblxuICAgICAgICAgKiB3ZSBoYXZlIHRvIGtlZXAgdHJhY2sgb2YgYXR0cmlidXRlIG92ZXJyaWRlcyB3aGVuIGV4dGVuZGluZyBhbnkge0BsaW5rIENvbXBvbmVudH0gYmFzZSBjbGFzcy5cbiAgICAgICAgICogVGhpcyBpcyBkb25lIGluIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvci4gSGVyZSB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0byByZW1vdmUgb3ZlcnJpZGRlblxuICAgICAgICAgKiBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZWRBdHRyaWJ1dGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAvLyB3ZSB0YWtlIHRoZSBpbmhlcml0ZWQgb2JzZXJ2ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm9ic2VydmVkQXR0cmlidXRlc1xuICAgICAgICAgICAgICAgICAgICAvLyAuLi5yZW1vdmUgb3ZlcnJpZGRlbiBnZW5lcmF0ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChhdHRyaWJ1dGVzLCBhdHRyaWJ1dGUpID0+IGF0dHJpYnV0ZXMuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiAmJiBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuLmhhcyhhdHRyaWJ1dGUpID8gW10gOiBhdHRyaWJ1dGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgc3RyaW5nW11cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAvLyAuLi5hbmQgcmVjb21iaW5lIHRoZSBsaXN0IHdpdGggdGhlIG5ld2x5IGdlbmVyYXRlZCBhdHRyaWJ1dGVzICh0aGUgU2V0IHByZXZlbnRzIGR1cGxpY2F0ZXMpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoWy4uLnRhcmdldC5hdHRyaWJ1dGVzLmtleXMoKV0pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gZGVsZXRlIHRoZSBvdmVycmlkZGVuIFNldCBmcm9tIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgY29uc3RydWN0b3Iub3ZlcnJpZGRlbjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IHN0eWxlcyBhdXRvbWF0aWNhbGx5LCB1bmxlc3MgZXhwbGljaXRseSByZXF1ZXN0ZWQsIHNvIHdlIGNoZWNrIGlmIHRoZVxuICAgICAgICAgKiBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHN0YXRpYyBzdHlsZXMgcHJvcGVydHkgKHdoaWNoIG1heSB1c2Ugc3VwZXIuc3R5bGVzIHRvIGV4cGxpY2l0bHkgaW5oZXJpdClcbiAgICAgICAgICogYW5kIGlmIGl0IGRvZXNuJ3QsIHdlIGlnbm9yZSB0aGUgcGFyZW50IGNsYXNzJ3Mgc3R5bGVzIChieSBub3QgaW52b2tpbmcgdGhlIGdldHRlcikuXG4gICAgICAgICAqIFdlIHRoZW4gbWVyZ2UgdGhlIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcyAoaWYgZXhpc3RpbmcpIGludG8gdGhlIHN0eWxlcyBhbmQgcmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICAgICAgICogYnkgdXNpbmcgYSBTZXQuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIChjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShzdHlsZXNLZXkpXG4gICAgICAgICAgICAgICAgICAgID8gY29uc3RydWN0b3Iuc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgIDogW11cbiAgICAgICAgICAgICAgICApLmNvbmNhdChkZWNsYXJhdGlvbi5zdHlsZXMgfHwgW10pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmFsbHkgd2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBnZXR0ZXIgd2l0aCBhIG5ldyBvbmUsIHdoaWNoIHJldHVybnNcbiAgICAgICAgICogdGhlIHVuaXF1ZSBzZXQgb2YgdXNlciBkZWZpbmVkIGFuZCBkZWNvcmF0b3IgZ2VuZXJhdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVkQXR0cmlidXRlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50LnN0eWxlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHN0YXRpY2FsbHkgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGRlZmluZWQgc3R5bGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgc3R5bGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0eWxlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmRlZmluZSkge1xuXG4gICAgICAgICAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKGNvbnN0cnVjdG9yLnNlbGVjdG9yLCBjb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBMaXN0ZW5lckRlY2xhcmF0aW9uIH0gZnJvbSAnLi9saXN0ZW5lci1kZWNsYXJhdGlvbi5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gbWV0aG9kIGFzIGFuIGV2ZW50IGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgVGhlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5lcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogTGlzdGVuZXJEZWNsYXJhdGlvbjxUeXBlPikge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmV2ZW50ID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5kZWxldGUocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5zZXQocHJvcGVydHlLZXksIHsgLi4ub3B0aW9ucyB9IGFzIExpc3RlbmVyRGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBsaXN0ZW5lciBkZWNvcmF0b3Igc3RvcmVzIGxpc3RlbmVyIGRlY2xhcmF0aW9ucyBpbiB0aGUgY29uc3RydWN0b3IsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoZVxuICogc3RhdGljIGxpc3RlbmVycyBmaWVsZCBpcyBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlIGFkZCBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAqIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkLiBXZSBhbHNvIG1ha2Ugc3VyZSB0byBpbml0aWFsaXplIHRoZSBsaXN0ZW5lciBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZlxuICogdGhlIGJhc2UgY2xhc3MncyBtYXAgdG8gcHJvcGVybHkgaW5oZXJpdCBhbGwgbGlzdGVuZXIgZGVjbGFyYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IHR5cGVvZiBDb21wb25lbnQpIHtcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ2xpc3RlbmVycycpKSBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLmxpc3RlbmVycyk7XG59XG4iLCJjb25zdCBGSVJTVCA9IC9eW15dLztcbmNvbnN0IFNQQUNFUyA9IC9cXHMrKFtcXFNdKS9nO1xuY29uc3QgQ0FNRUxTID0gL1thLXpdKFtBLVpdKS9nO1xuY29uc3QgS0VCQUJTID0gLy0oW2Etel0pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnJlcGxhY2UoRklSU1QsIHN0cmluZ1swXS50b1VwcGVyQ2FzZSgpKSA6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9Mb3dlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW1lbENhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBLRUJBQlMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBLRUJBQlMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmNhcGl0YWxpemUoc3RyaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlYmFiQ2FzZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IG1hdGNoZXM7XG5cbiAgICBpZiAoc3RyaW5nKSB7XG5cbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnRyaW0oKTtcblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBTUEFDRVMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCAnLScgKyBtYXRjaGVzWzFdKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBDQU1FTFMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzBdWzBdICsgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIENBTUVMUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy50b0xvd2VyQ2FzZSgpIDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlciwgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCB9IGZyb20gJy4vYXR0cmlidXRlLWNvbnZlcnRlci5qcyc7XG5pbXBvcnQgeyBrZWJhYkNhc2UgfSBmcm9tICcuL3V0aWxzL3N0cmluZy11dGlscy5qcyc7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgZGlzcGF0Y2ggYSBjdXN0b20gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Tm90aWZpZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJldHVybiBgdHJ1ZWAgaWYgdGhlIGBvbGRWYWx1ZWAgYW5kIHRoZSBgbmV3VmFsdWVgIG9mIGEgcHJvcGVydHkgYXJlIGRpZmZlcmVudCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gcmVmbGVjdG9yIEEgcmVmbGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0cmlidXRlUmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBBdHRyaWJ1dGVSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5UmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBQcm9wZXJ0eVJlZmxlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIHJlZmxlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eU5vdGlmaWVyfVxuICpcbiAqIEBwYXJhbSBub3RpZmllciBBIG5vdGlmaWVyIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlOb3RpZmllciAobm90aWZpZXI6IGFueSk6IG5vdGlmaWVyIGlzIFByb3BlcnR5Tm90aWZpZXIge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBub3RpZmllciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICpcbiAqIEBwYXJhbSBkZXRlY3RvciBBIGRldGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciAoZGV0ZWN0b3I6IGFueSk6IGRldGVjdG9yIGlzIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiBkZXRlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUtleX1cbiAqXG4gKiBAcGFyYW0ga2V5IEEgcHJvcGVydHkga2V5IHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlLZXkgKGtleTogYW55KToga2V5IGlzIFByb3BlcnR5S2V5IHtcblxuICAgIHJldHVybiB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJyB8fCB0eXBlb2Yga2V5ID09PSAnc3ltYm9sJztcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgc3RyaW5nIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGUgcmVtb3ZpbmcgaW52YWxpZCBhdHRyaWJ1dGUgY2hhcmFjdGVyc1xuICpcbiAqIEBwYXJhbSB2YWx1ZSBBIHN0cmluZyB0byBlbmNvZGUgZm9yIHVzZSBhcyBodG1sIGF0dHJpYnV0ZVxuICogQHJldHVybnMgICAgIEFuIGVuY29kZWQgc3RyaW5nIHVzYWJsZSBhcyBodG1sIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQXR0cmlidXRlICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBrZWJhYkNhc2UodmFsdWUucmVwbGFjZSgvXFxXKy9nLCAnLScpLnJlcGxhY2UoL1xcLSQvLCAnJykpO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBhdHRyaWJ1dGUgbmFtZSBmcm9tIGEgcHJvcGVydHkga2V5XG4gKlxuICogQHJlbWFya3NcbiAqIE51bWVyaWMgcHJvcGVydHkgaW5kZXhlcyBvciBzeW1ib2xzIGNhbiBjb250YWluIGludmFsaWQgY2hhcmFjdGVycyBmb3IgYXR0cmlidXRlIG5hbWVzLiBUaGlzIG1ldGhvZFxuICogc2FuaXRpemVzIHRob3NlIGNoYXJhY3RlcnMgYW5kIHJlcGxhY2VzIHNlcXVlbmNlcyBvZiBpbnZhbGlkIGNoYXJhY3RlcnMgd2l0aCBhIGRhc2guXG4gKiBBdHRyaWJ1dGUgbmFtZXMgYXJlIG5vdCBhbGxvd2VkIHRvIHN0YXJ0IHdpdGggbnVtYmVycyBlaXRoZXIgYW5kIGFyZSBwcmVmaXhlZCB3aXRoICdhdHRyLScuXG4gKlxuICogTi5CLjogV2hlbiB1c2luZyBjdXN0b20gc3ltYm9scyBhcyBwcm9wZXJ0eSBrZXlzLCB1c2UgdW5pcXVlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIHN5bWJvbHMgdG8gYXZvaWRcbiAqIGNsYXNoaW5nIGF0dHJpYnV0ZSBuYW1lcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBhID0gU3ltYm9sKCk7XG4gKiBjb25zdCBiID0gU3ltYm9sKCk7XG4gKlxuICogYSAhPT0gYjsgLy8gdHJ1ZVxuICpcbiAqIGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYSkgIT09IGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYik7IC8vIGZhbHNlIC0tPiAnYXR0ci1zeW1ib2wnID09PSAnYXR0ci1zeW1ib2wnXG4gKlxuICogY29uc3QgYyA9IFN5bWJvbCgnYycpO1xuICogY29uc3QgZCA9IFN5bWJvbCgnZCcpO1xuICpcbiAqIGMgIT09IGQ7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGMpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGQpOyAvLyB0cnVlIC0tPiAnYXR0ci1zeW1ib2wtYycgPT09ICdhdHRyLXN5bWJvbC1kJ1xuICogYGBgXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlTmFtZSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogc3RyaW5nIHtcblxuICAgIGlmICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgcmV0dXJuIGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBhdHRyaWJ1dGUgbmFtZXMsIGlmIHN5bWJvbHMgZG9uJ3QgaGF2ZSB1bmlxdWUgZGVzY3JpcHRpb25cbiAgICAgICAgcmV0dXJuIGBhdHRyLSR7IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKSB9YDtcbiAgICB9XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGV2ZW50IG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBFdmVudCBuYW1lcyBkb24ndCBoYXZlIHRoZSBzYW1lIHJlc3RyaWN0aW9ucyBhcyBhdHRyaWJ1dGUgbmFtZXMgd2hlbiBpdCBjb21lcyB0byBpbnZhbGlkXG4gKiBjaGFyYWN0ZXJzLiBIb3dldmVyLCBmb3IgY29uc2lzdGVuY3kncyBzYWtlLCB3ZSBhcHBseSB0aGUgc2FtZSBydWxlcyBmb3IgZXZlbnQgbmFtZXMgYXNcbiAqIGZvciBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHByZWZpeCAgICAgICAgQW4gb3B0aW9uYWwgcHJlZml4LCBlLmcuOiAnb24nXG4gKiBAcGFyYW0gc3VmZml4ICAgICAgICBBbiBvcHRpb25hbCBzdWZmaXgsIGUuZy46ICdjaGFuZ2VkJ1xuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBldmVudCBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudE5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgcHJlZml4Pzogc3RyaW5nLCBzdWZmaXg/OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IHByb3BlcnR5U3RyaW5nID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0ga2ViYWJDYXNlKHByb3BlcnR5S2V5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBjcmVhdGUgbXVsdGlwbGUgaWRlbnRpY2FsIGV2ZW50IG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0gZW5jb2RlQXR0cmlidXRlKFN0cmluZyhwcm9wZXJ0eUtleSkpO1xuICAgIH1cblxuICAgIHJldHVybiBgJHsgcHJlZml4ID8gYCR7IGtlYmFiQ2FzZShwcmVmaXgpIH0tYCA6ICcnIH0keyBwcm9wZXJ0eVN0cmluZyB9JHsgc3VmZml4ID8gYC0keyBrZWJhYkNhc2Uoc3VmZml4KSB9YCA6ICcnIH1gO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBEb2VzIHByb3BlcnR5IGhhdmUgYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IE5vIGF0dHJpYnV0ZSB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHByb3BlcnR5XG4gICAgICogKiBgdHJ1ZWA6IFRoZSBhdHRyaWJ1dGUgbmFtZSB3aWxsIGJlIGluZmVycmVkIGJ5IGNhbWVsLWNhc2luZyB0aGUgcHJvcGVydHkgbmFtZVxuICAgICAqICogYHN0cmluZ2A6IFVzZSB0aGUgcHJvdmlkZWQgc3RyaW5nIGFzIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBuYW1lXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGU6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b21pemUgdGhlIGNvbnZlcnNpb24gb2YgdmFsdWVzIGJldHdlZW4gcHJvcGVydHkgYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENvbnZlcnRlcnMgYXJlIG9ubHkgdXNlZCB3aGVuIHtAbGluayByZWZsZWN0UHJvcGVydHl9IGFuZC9vciB7QGxpbmsgcmVmbGVjdEF0dHJpYnV0ZX0gYXJlIHNldCB0byB0cnVlLlxuICAgICAqIElmIGN1c3RvbSByZWZsZWN0b3JzIGFyZSB1c2VkLCB0aGV5IGhhdmUgdG8gdGFrZSBjYXJlIG9yIGNvbnZlcnRpbmcgdGhlIHByb3BlcnR5L2F0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiB7QGxpbmsgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdH1cbiAgICAgKi9cbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUncyB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBhdHRyaWJ1dGUgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBhdHRyaWJ1dGUgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIHByb3BlcnR5IHVzaW5nIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjb21wb25lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBhdHRyaWJ1dGUgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0QXR0cmlidXRlOiBib29sZWFuIHwga2V5b2YgVHlwZSB8IEF0dHJpYnV0ZVJlZmxlY3RvcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgcHJvcGVydHkgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgcHJvcGVydHkgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBwcm9wZXJ0eSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgYXV0b21hdGljYWxseSB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgdXNpbmcgdGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgcHJvcGVydHkgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0UHJvcGVydHk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgYSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2UgcmFpc2UgYSBjdXN0b20gZXZlbnQ/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IGNyZWF0ZSBhIGN1c3RvbSBldmVudCBmb3IgdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBDcmVhdGUgY3VzdG9tIGV2ZW50cyBmb3IgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBVc2UgdGhlIG1ldGhvZCB3aXRoIHRoaXMgcHJvcGVydHkga2V5IG9uIHRoZSBjb21wb25lbnQgdG8gY3JlYXRlIGN1c3RvbSBldmVudHNcbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzIChgdGhpc2AgY29udGV4dCB3aWxsIGJlIHRoZSBjb21wb25lbnQgaW5zdGFuY2UpXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBub3RpZnk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlOb3RpZmllcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSBob3cgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5IHNob3VsZCBiZSBtb25pdG9yZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQnkgZGVmYXVsdCBhIGRlY29yYXRlZCBwcm9wZXJ0eSB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzICh0aHJvdWdoIGEgY3VzdG9tIHNldHRlciBmb3IgdGhlIHByb3BlcnR5KS5cbiAgICAgKiBBbnkgYHNldGAtb3BlcmF0aW9uIG9mIHRoaXMgcHJvcGVydHkgd2lsbCB0aGVyZWZvcmUgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhbmQgaW5pdGlhdGVcbiAgICAgKiBhIHJlbmRlciBhcyB3ZWxsIGFzIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IG9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5ICh0aGlzIHdpbGwgYnlwYXNzIHJlbmRlciwgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uKVxuICAgICAqICogYHRydWVgOiBPYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSB1c2luZyB0aGUge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfVxuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSBwcm92aWRlZCBtZXRob2QgdG8gY2hlY2sgaWYgcHJvcGVydHkgdmFsdWUgaGFzIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYCAodXNlcyB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9IGludGVybmFsbHkpXG4gICAgICovXG4gICAgb2JzZXJ2ZTogYm9vbGVhbiB8IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3I7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gKlxuICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGNoYW5nZWRcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SOiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICAvLyBpbiBjYXNlIGBvbGRWYWx1ZWAgYW5kIGBuZXdWYWx1ZWAgYXJlIGBOYU5gLCBgKE5hTiAhPT0gTmFOKWAgcmV0dXJucyBgdHJ1ZWAsXG4gICAgLy8gYnV0IGAoTmFOID09PSBOYU4gfHwgTmFOID09PSBOYU4pYCByZXR1cm5zIGBmYWxzZWBcbiAgICByZXR1cm4gb2xkVmFsdWUgIT09IG5ld1ZhbHVlICYmIChvbGRWYWx1ZSA9PT0gb2xkVmFsdWUgfHwgbmV3VmFsdWUgPT09IG5ld1ZhbHVlKTtcbn07XG5cbi8vIFRPRE86IG1heWJlIHByb3ZpZGUgZmxhdCBhcnJheS9vYmplY3QgY2hhbmdlIGRldGVjdG9yPyBkYXRlIGNoYW5nZSBkZXRlY3Rvcj9cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT046IFByb3BlcnR5RGVjbGFyYXRpb24gPSB7XG4gICAgYXR0cmlidXRlOiB0cnVlLFxuICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCxcbiAgICByZWZsZWN0QXR0cmlidXRlOiB0cnVlLFxuICAgIHJlZmxlY3RQcm9wZXJ0eTogdHJ1ZSxcbiAgICBub3RpZnk6IHRydWUsXG4gICAgb2JzZXJ2ZTogREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1IsXG59O1xuIiwiLyoqXG4gKiBHZXQgdGhlIHtAbGluayBQcm9wZXJ0eURlc2NyaXB0b3J9IG9mIGEgcHJvcGVydHkgZnJvbSBpdHMgcHJvdG90eXBlXG4gKiBvciBhIHBhcmVudCBwcm90b3R5cGUgLSBleGNsdWRpbmcge0BsaW5rIE9iamVjdC5wcm90b3R5cGV9IGl0c2VsZi5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0ICAgICAgICBUaGUgcHJvdG90eXBlIHRvIGdldCB0aGUgZGVzY3JpcHRvciBmcm9tXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IGZvciB3aGljaCB0byBnZXQgdGhlIGRlc2NyaXB0b3JcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQge1xuXG4gICAgaWYgKHByb3BlcnR5S2V5IGluIHRhcmdldCkge1xuXG4gICAgICAgIHdoaWxlICh0YXJnZXQgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcblxuICAgICAgICAgICAgaWYgKHRhcmdldC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eUtleSkpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXJnZXQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgY3JlYXRlQXR0cmlidXRlTmFtZSwgREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTiwgUHJvcGVydHlEZWNsYXJhdGlvbiB9IGZyb20gJy4vcHJvcGVydHktZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yIH0gZnJvbSAnLi91dGlscy9nZXQtcHJvcGVydHktZGVzY3JpcHRvci5qcyc7XG5cbi8qKlxuICogQSB0eXBlIGV4dGVuc2lvbiB0byBhZGQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRvIGEge0BsaW5rIENvbXBvbmVudH0gY29uc3RydWN0b3IgZHVyaW5nIGRlY29yYXRpb25cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSB0eXBlb2YgQ29tcG9uZW50ICYgeyBvdmVycmlkZGVuPzogU2V0PHN0cmluZz4gfTtcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBwcm9wZXJ0eVxuICpcbiAqIEByZW1hcmtzXG4gKiBNYW55IG9mIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gb3B0aW9ucyBzdXBwb3J0IGN1c3RvbSBmdW5jdGlvbnMsIHdoaWNoIHdpbGwgYmUgaW52b2tlZFxuICogd2l0aCB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFzIGB0aGlzYC1jb250ZXh0IGR1cmluZyBleGVjdXRpb24uIEluIG9yZGVyIHRvIHN1cHBvcnQgY29ycmVjdFxuICogdHlwaW5nIGluIHRoZXNlIGZ1bmN0aW9ucywgdGhlIGBAcHJvcGVydHlgIGRlY29yYXRvciBzdXBwb3J0cyBnZW5lcmljIHR5cGVzLiBIZXJlIGlzIGFuIGV4YW1wbGVcbiAqIG9mIGhvdyB5b3UgY2FuIHVzZSB0aGlzIHdpdGggYSBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICpcbiAqICAgICAgbXlIaWRkZW5Qcm9wZXJ0eSA9IHRydWU7XG4gKlxuICogICAgICAvLyB1c2UgYSBnZW5lcmljIHRvIHN1cHBvcnQgcHJvcGVyIGluc3RhbmNlIHR5cGluZyBpbiB0aGUgcHJvcGVydHkgcmVmbGVjdG9yXG4gKiAgICAgIEBwcm9wZXJ0eTxNeUVsZW1lbnQ+KHtcbiAqICAgICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogKHByb3BlcnR5S2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAqICAgICAgICAgICAgICAvLyB0aGUgZ2VuZXJpYyB0eXBlIGFsbG93cyBmb3IgY29ycmVjdCB0eXBpbmcgb2YgdGhpc1xuICogICAgICAgICAgICAgIGlmICh0aGlzLm15SGlkZGVuUHJvcGVydHkgJiYgbmV3VmFsdWUpIHtcbiAqICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ215LXByb3BlcnR5JywgJycpO1xuICogICAgICAgICAgICAgIH0gZWxzZSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdteS1wcm9wZXJ0eScpO1xuICogICAgICAgICAgICAgIH1cbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgbXlQcm9wZXJ0eSA9IGZhbHNlO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvcGVydHk8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8UHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICAgICAgdGFyZ2V0OiBPYmplY3QsXG4gICAgICAgIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgICAgcHJvcGVydHlEZXNjcmlwdG9yPzogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICk6IGFueSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gZGVmaW5pbmcgY2xhc3NlcyBpbiBUeXBlU2NyaXB0LCBjbGFzcyBmaWVsZHMgYWN0dWFsbHkgZG9uJ3QgZXhpc3Qgb24gdGhlIGNsYXNzJ3MgcHJvdG90eXBlLCBidXRcbiAgICAgICAgICogcmF0aGVyLCB0aGV5IGFyZSBpbnN0YW50aWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCBleGlzdCBvbmx5IG9uIHRoZSBpbnN0YW5jZS4gQWNjZXNzb3IgcHJvcGVydGllc1xuICAgICAgICAgKiBhcmUgYW4gZXhjZXB0aW9uIGhvd2V2ZXIgYW5kIGV4aXN0IG9uIHRoZSBwcm90b3R5cGUuIEZ1cnRoZXJtb3JlLCBhY2Nlc3NvcnMgYXJlIGluaGVyaXRlZCBhbmQgd2lsbFxuICAgICAgICAgKiBiZSBpbnZva2VkIHdoZW4gc2V0dGluZyAob3IgZ2V0dGluZykgYSBwcm9wZXJ0eSBvbiBhbiBpbnN0YW5jZSBvZiBhIGNoaWxkIGNsYXNzLCBldmVuIGlmIHRoYXQgY2xhc3NcbiAgICAgICAgICogZGVmaW5lcyB0aGUgcHJvcGVydHkgZmllbGQgb24gaXRzIG93bi4gT25seSBpZiB0aGUgY2hpbGQgY2xhc3MgZGVmaW5lcyBuZXcgYWNjZXNzb3JzIHdpbGwgdGhlIHBhcmVudFxuICAgICAgICAgKiBjbGFzcydzIGFjY2Vzc29ycyBub3QgYmUgaW5oZXJpdGVkLlxuICAgICAgICAgKiBUbyBrZWVwIHRoaXMgYmVoYXZpb3IgaW50YWN0LCB3ZSBuZWVkIHRvIGVuc3VyZSwgdGhhdCB3aGVuIHdlIGNyZWF0ZSBhY2Nlc3NvcnMgZm9yIHByb3BlcnRpZXMsIHdoaWNoXG4gICAgICAgICAqIGFyZSBub3QgZGVjbGFyZWQgYXMgYWNjZXNzb3JzLCB3ZSBpbnZva2UgdGhlIHBhcmVudCBjbGFzcydzIGFjY2Vzc29yIGFzIGV4cGVjdGVkLlxuICAgICAgICAgKiBUaGUge0BsaW5rIGdldFByb3BlcnR5RGVzY3JpcHRvcn0gZnVuY3Rpb24gYWxsb3dzIHVzIHRvIGxvb2sgZm9yIGFjY2Vzc29ycyBvbiB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gICAgICAgICAqIHRoZSBjbGFzcyB3ZSBhcmUgZGVjb3JhdGluZy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBwcm9wZXJ0eURlc2NyaXB0b3IgfHwgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICBjb25zdCBoaWRkZW5LZXkgPSAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykgPyBgX18keyBwcm9wZXJ0eUtleSB9YCA6IFN5bWJvbCgpO1xuXG4gICAgICAgIC8vIGlmIHdlIGZvdW5kIGFuIGFjY2Vzc29yIGRlc2NyaXB0b3IgKGZyb20gZWl0aGVyIHRoaXMgY2xhc3Mgb3IgYSBwYXJlbnQpIHdlIHVzZSBpdCwgb3RoZXJ3aXNlIHdlIGNyZWF0ZVxuICAgICAgICAvLyBkZWZhdWx0IGFjY2Vzc29ycyB0byBzdG9yZSB0aGUgYWN0dWFsIHByb3BlcnR5IHZhbHVlIGluIGEgaGlkZGVuIGZpZWxkIGFuZCByZXRyaWV2ZSBpdCBmcm9tIHRoZXJlXG4gICAgICAgIGNvbnN0IGdldHRlciA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5nZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSkgeyByZXR1cm4gdGhpc1toaWRkZW5LZXldOyB9O1xuICAgICAgICBjb25zdCBzZXR0ZXIgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3Iuc2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnksIHZhbHVlOiBhbnkpIHsgdGhpc1toaWRkZW5LZXldID0gdmFsdWU7IH07XG5cbiAgICAgICAgLy8gd2UgZGVmaW5lIGEgbmV3IGFjY2Vzc29yIGRlc2NyaXB0b3Igd2hpY2ggd2lsbCB3cmFwIHRoZSBwcmV2aW91c2x5IHJldHJpZXZlZCBvciBjcmVhdGVkIGFjY2Vzc29yc1xuICAgICAgICAvLyBhbmQgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCB3aGVuZXZlciB0aGUgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgIGNvbnN0IHdyYXBwZWREZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IgJiBUaGlzVHlwZTxhbnk+ID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogYW55IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0ICh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzW3Byb3BlcnR5S2V5XTtcbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgcGFzcyBgdmFsdWVgIG9uIGFzIGBuZXdWYWx1ZWAgLSBhbiBpbmhlcml0ZWQgc2V0dGVyIG1pZ2h0IG1vZGlmeSBpdFxuICAgICAgICAgICAgICAgIC8vIGluc3RlYWQgZ2V0IHRoZSBuZXcgdmFsdWUgYnkgaW52b2tpbmcgdGhlIGdldHRlclxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIGdldHRlci5jYWxsKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb246IFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4gPSB7IC4uLkRFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIC4uLm9wdGlvbnMgfTtcblxuICAgICAgICAvLyBnZW5lcmF0ZSB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgbmFtZVxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9IGNyZWF0ZUF0dHJpYnV0ZU5hbWUocHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0IHRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICAgICAgICBpZiAoZGVjbGFyYXRpb24ub2JzZXJ2ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5vYnNlcnZlID0gREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTi5vYnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICAvLyBjaGVjayBpZiB3ZSBpbmhlcml0ZWQgYW4gb2JzZXJ2ZWQgYXR0cmlidXRlIGZvciB0aGUgcHJvcGVydHkgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLmhhcyhwcm9wZXJ0eUtleSkgPyBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSkhLmF0dHJpYnV0ZSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBpZiBhdHRyaWJ1dGUgaXMgdHJ1dGh5IGl0J3MgYSBzdHJpbmcgYW5kIGl0IHdpbGwgZXhpc3QgaW4gdGhlIGF0dHJpYnV0ZXMgbWFwXG4gICAgICAgIGlmIChhdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmhlcml0ZWQgYXR0cmlidXRlIGFzIGl0J3Mgb3ZlcnJpZGRlblxuICAgICAgICAgICAgY29uc3RydWN0b3IuYXR0cmlidXRlcy5kZWxldGUoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBtYXJrIGF0dHJpYnV0ZSBhcyBvdmVycmlkZGVuIGZvciB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3JcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4hLmFkZChhdHRyaWJ1dGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IuYXR0cmlidXRlcy5zZXQoZGVjbGFyYXRpb24uYXR0cmlidXRlLCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24gKmFmdGVyKiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzLCBzbyB3ZSBjYW4gc3RpbGwgYWNjZXNzIHRoZVxuICAgICAgICAvLyBpbmhlcml0ZWQgcHJvcGVydHkgZGVjbGFyYXRpb24gd2hlbiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBkZWNsYXJhdGlvbiBhcyBQcm9wZXJ0eURlY2xhcmF0aW9uKTtcblxuICAgICAgICBpZiAoIXByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgICAgICAvLyBpZiBubyBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBkZWNvcmF0b3Igd2hpY2ggbXVzdCByZXR1cm4gdm9pZCBhbmQgd2UgY2FuIGRlZmluZSB0aGUgd3JhcHBlZCBkZXNjcmlwdG9yIGhlcmVcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCB3cmFwcGVkRGVzY3JpcHRvcik7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gaWYgYSBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhbiBhY2Nlc3NvclxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIGFuZCB3ZSBtdXN0IHJldHVybiB0aGUgd3JhcHBlZCBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlZERlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIHByb3BlcnR5IGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgcHJvcGVydHkgZGVjb3JhdG9yIHN0b3JlcyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZSBtYXBwaW5ncyBpbiB0aGUgY29uc3RydWN0b3IsXG4gKiB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aG9zZSBzdGF0aWMgZmllbGRzIGFyZSBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlXG4gKiBhZGQgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgdG8gdGhlIGJhc2UgY2xhc3MncyBzdGF0aWMgZmllbGRzLiBXZSBhbHNvIG1ha2VcbiAqIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgY29uc3RydWN0b3JzIG1hcHMgd2l0aCB0aGUgdmFsdWVzIG9mIHRoZSBiYXNlIGNsYXNzJ3MgbWFwcyB0byBwcm9wZXJseVxuICogaW5oZXJpdCBhbGwgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGVzLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZnVuY3Rpb24gcHJlcGFyZUNvbnN0cnVjdG9yIChjb25zdHJ1Y3RvcjogRGVjb3JhdGVkQ29tcG9uZW50VHlwZSkge1xuXG4gICAgLy8gdGhpcyB3aWxsIGdpdmUgdXMgYSBjb21waWxlLXRpbWUgZXJyb3IgaWYgd2UgcmVmYWN0b3Igb25lIG9mIHRoZSBzdGF0aWMgY29uc3RydWN0b3IgcHJvcGVydGllc1xuICAgIC8vIGFuZCB3ZSB3b24ndCBtaXNzIHJlbmFtaW5nIHRoZSBwcm9wZXJ0eSBrZXlzXG4gICAgY29uc3QgcHJvcGVydGllczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdwcm9wZXJ0aWVzJztcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ2F0dHJpYnV0ZXMnO1xuICAgIGNvbnN0IG92ZXJyaWRkZW46IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAnb3ZlcnJpZGRlbic7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KHByb3BlcnRpZXMpKSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZXMpKSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KG92ZXJyaWRkZW4pKSBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuID0gbmV3IFNldCgpO1xufVxuIiwiaW1wb3J0IHsgcmVuZGVyLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7XG4gICAgQXR0cmlidXRlUmVmbGVjdG9yLFxuICAgIGNyZWF0ZUV2ZW50TmFtZSxcbiAgICBpc0F0dHJpYnV0ZVJlZmxlY3RvcixcbiAgICBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IsXG4gICAgaXNQcm9wZXJ0eUtleSxcbiAgICBpc1Byb3BlcnR5Tm90aWZpZXIsXG4gICAgaXNQcm9wZXJ0eVJlZmxlY3RvcixcbiAgICBMaXN0ZW5lckRlY2xhcmF0aW9uLFxuICAgIFByb3BlcnR5RGVjbGFyYXRpb24sXG4gICAgUHJvcGVydHlOb3RpZmllcixcbiAgICBQcm9wZXJ0eVJlZmxlY3RvclxufSBmcm9tIFwiLi9kZWNvcmF0b3JzL2luZGV4LmpzXCI7XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IgPSAoYXR0cmlidXRlUmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBhdHRyaWJ1dGUgcmVmbGVjdG9yICR7IFN0cmluZyhhdHRyaWJ1dGVSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IgPSAocHJvcGVydHlSZWZsZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IHJlZmxlY3RvciAkeyBTdHJpbmcocHJvcGVydHlSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUiA9IChwcm9wZXJ0eU5vdGlmaWVyOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSBub3RpZmllciAkeyBTdHJpbmcocHJvcGVydHlOb3RpZmllcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IENIQU5HRV9ERVRFQ1RPUl9FUlJPUiA9IChjaGFuZ2VEZXRlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yICR7IFN0cmluZyhjaGFuZ2VEZXRlY3RvcikgfS5gKTtcblxuLyoqXG4gKiBFeHRlbmRzIHRoZSBzdGF0aWMge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IHRvIGluY2x1ZGUgdGhlIGJvdW5kIGxpc3RlbmVyXG4gKiBmb3IgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogQGludGVybmFsXG4gKi9cbmludGVyZmFjZSBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gZXh0ZW5kcyBMaXN0ZW5lckRlY2xhcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBib3VuZCBsaXN0ZW5lciB3aWxsIGJlIHN0b3JlZCBoZXJlLCBzbyBpdCBjYW4gYmUgcmVtb3ZlZCBpdCBsYXRlclxuICAgICAqL1xuICAgIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGV2ZW50IHRhcmdldCB3aWxsIGFsd2F5cyBiZSByZXNvbHZlZCB0byBhbiBhY3R1YWwge0BsaW5rIEV2ZW50VGFyZ2V0fVxuICAgICAqL1xuICAgIHRhcmdldDogRXZlbnRUYXJnZXQ7XG59XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2VzLCBhcyB1c2VkIGluICR7QGxpbmsgQ29tcG9uZW50LnVwZGF0ZUNhbGxiYWNrfVxuICovXG5leHBvcnQgdHlwZSBDaGFuZ2VzID0gTWFwPFByb3BlcnR5S2V5LCBhbnk+O1xuXG4vKipcbiAqIFRoZSBjb21wb25lbnQgYmFzZSBjbGFzc1xuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIGNhY2hlZCB7QGxpbmsgQ1NTU3R5bGVTaGVldH0gaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N0eWxlU2hlZXQ6IENTU1N0eWxlU2hlZXQgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoZW4gY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBDU1NTdHlsZVNoZWV0fVxuICAgICAqIGluc3RhbmNlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaCBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgc3R5bGVTaGVldCAoKTogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxlbmd0aCAmJiAhdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX3N0eWxlU2hlZXQnKSkge1xuXG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgc3R5bGUgc2hlZXQgYW5kIGNhY2hlIGl0IGluIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCB3b3JrIG9uY2UgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcnJpdmVcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL3dpY2cuZ2l0aHViLmlvL2NvbnN0cnVjdC1zdHlsZXNoZWV0cy9cbiAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVNoZWV0ID0gbmV3IENTU1N0eWxlU2hlZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVNoZWV0LnJlcGxhY2VTeW5jKHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlU2hlZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIGNhY2hlZCB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH0gaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBnZXR0ZXIgd2lsbCBjcmVhdGUgYSB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH0gbm9kZSBhbmQgY2FjaGUgaXQgZm9yIHVzZSB3aXRoIGVhY2hcbiAgICAgKiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgc3R5bGVFbGVtZW50ICgpOiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVFbGVtZW50JykpIHtcblxuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50aXRsZSA9IHRoaXMuc2VsZWN0b3I7XG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLnN0eWxlcy5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgYXR0cmlidXRlIG5hbWVzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGtleXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHByb3BlcnR5IGtleSB0aGF0IGJlbG9uZ3MgdG8gYW4gYXR0cmlidXRlIG5hbWUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgYXR0cmlidXRlczogTWFwPHN0cmluZywgUHJvcGVydHlLZXk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBvZiBhIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIHByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgUHJvcGVydHlEZWNsYXJhdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIGxpc3RlbmVyIGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IG9mIGEgbWV0aG9kLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIGxpc3RlbmVyczogTWFwPFByb3BlcnR5S2V5LCBMaXN0ZW5lckRlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzZWxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzZWxlY3RvcmAgb3B0aW9uLCBpZiBwcm92aWRlZC5cbiAgICAgKiBPdGhlcndpc2UgdGhlIGRlY29yYXRvciB3aWxsIHVzZSB0aGlzIHByb3BlcnR5IHRvIGRlZmluZSB0aGUgY29tcG9uZW50LlxuICAgICAqL1xuICAgIHN0YXRpYyBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBzZXQgYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzaGFkb3dgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHRydWVgKS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2hhZG93OiBib29sZWFuO1xuXG4gICAgLy8gVE9ETzogY3JlYXRlIHRlc3RzIGZvciBzdHlsZSBpbmhlcml0YW5jZVxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzdHlsZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc3R5bGVzYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBTdHlsZXMgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICogVGhpcyBhbGxvd3MgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQgYW5kIGFkZCBhZGRpdGlvbmFsIHN0eWxlcyBvbiB0aGUgY2hpbGQgY29tcG9uZW50LlxuICAgICAqIEluIG9yZGVyIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50LCBhbiBleHBsaWNpdCBzdXBlciBjYWxsIGhhcyB0byBiZSBpbmNsdWRlZC4gQnlcbiAgICAgKiBkZWZhdWx0IG5vIHN0eWxlcyBhcmUgaW5oZXJpdGVkLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gW1xuICAgICAqICAgICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICogICAgICAgICAgICAgICc6aG9zdCB7IGJhY2tncm91bmQtY29sb3I6IGdyZWVuOyB9J1xuICAgICAqICAgICAgICAgIF07XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGB0ZW1wbGF0ZWAgb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogSWYgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IsIGl0IHdpbGwgaGF2ZSBwcmVjZWRlbmNlIG92ZXIgdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgICBUaGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHdoaWNoIHNob3VsZCBleGlzdCBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBzdGF0aWMgdGVtcGxhdGU/OiAoZWxlbWVudDogYW55LCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdG8gc3BlY2lmeSBhdHRyaWJ1dGVzIHdoaWNoIHNob3VsZCBiZSBvYnNlcnZlZCwgYnV0IGRvbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya1xuICAgICAqIEZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBkZWNvcmF0ZWQgd2l0aCB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IsIGFuIG9ic2VydmVkIGF0dHJpYnV0ZVxuICAgICAqIGlzIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzcGVjaWZpZWQgaGVyZS4gRm90IGF0dHJpYnV0ZXMgdGhhdCBkb24ndFxuICAgICAqIGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eSwgcmV0dXJuIHRoZSBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhpcyBnZXR0ZXIuIENoYW5nZXMgdG8gdGhlc2VcbiAgICAgKiBhdHRyaWJ1dGVzIGNhbiBiZSBoYW5kbGVkIGluIHRoZSB7QGxpbmsgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrfSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBXaGVuIGV4dGVuZGluZyBjb21wb25lbnRzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIHRoZSBzdXBlciBjbGFzcydzIG9ic2VydmVkQXR0cmlidXRlc1xuICAgICAqIGlmIHlvdSBvdmVycmlkZSB0aGlzIGdldHRlciAoZXhjZXB0IGlmIHlvdSBkb24ndCB3YW50IHRvIGluaGVyaXQgb2JzZXJ2ZWQgYXR0cmlidXRlcyk6XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbLi4uc3VwZXIub2JzZXJ2ZWRBdHRyaWJ1dGVzLCAnbXktYWRkaXRpb25hbC1hdHRyaWJ1dGUnXTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMgKCk6IHN0cmluZ1tdIHtcblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF91cGRhdGVSZXF1ZXN0OiBQcm9taXNlPGJvb2xlYW4+ID0gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jaGFuZ2VkUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0aW5nUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2xpc3RlbmVyRGVjbGFyYXRpb25zOiBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXNVcGRhdGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSByZW5kZXIgcm9vdCBpcyB3aGVyZSB0aGUge0BsaW5rIHJlbmRlcn0gbWV0aG9kIHdpbGwgYXR0YWNoIGl0cyBET00gb3V0cHV0XG4gICAgICovXG4gICAgcmVhZG9ubHkgcmVuZGVyUm9vdDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKC4uLmFyZ3M6IGFueVtdKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlbmRlclJvb3QgPSB0aGlzLl9jcmVhdGVSZW5kZXJSb290KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBtb3ZlZCB0byBhIG5ldyBkb2N1bWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgYWRvcHRlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Fkb3B0ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgZG9jdW1lbnQncyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl91bmxpc3RlbigpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnZGlzY29ubmVjdGVkJyk7XG5cbiAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIG9uZSBvZiB0aGUgY29tcG9uZW50J3MgYXR0cmlidXRlcyBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGljaCBhdHRyaWJ1dGVzIHRvIG5vdGljZSBjaGFuZ2UgZm9yIGlzIHNwZWNpZmllZCBpbiB7QGxpbmsgb2JzZXJ2ZWRBdHRyaWJ1dGVzfS5cbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIEZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB3aXRoIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlLCB0aGlzIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUgaGFuZGxpbmcgb2YgYXR0cmlidXRlIGNoYW5nZXMuIFdoZW4gb3ZlcnJpZGluZ1xuICAgICAqIHRoaXMgbWV0aG9kLCBhIHN1cGVyLWNhbGwgc2hvdWxkIGJlIGluY2x1ZGVkLCB0byBlbnN1cmUgYXR0cmlidXRlIGNoYW5nZXMgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICogYXJlIHByb2Nlc3NlZCBjb3JyZWN0bHkuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBzdXBlci5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAqXG4gICAgICogICAgICAgICAgLy8gZG8gY3VzdG9tIGhhbmRsaW5nLi4uXG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZSBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUmVmbGVjdGluZyB8fCBvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgdXBkYXRlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgYHVwZGF0ZUNhbGxiYWNrYCBpcyBpbnZva2VkIHN5bmNocm9ub3VzbHkgYnkgdGhlIHtAbGluayB1cGRhdGV9IG1ldGhvZCBhbmQgdGhlcmVmb3JlIGhhcHBlbnMgZGlyZWN0bHkgYWZ0ZXJcbiAgICAgKiByZW5kZXJpbmcsIHByb3BlcnR5IHJlZmxlY3Rpb24gYW5kIHByb3BlcnR5IGNoYW5nZSBldmVudHMuXG4gICAgICpcbiAgICAgKiBOLkIuOiBDaGFuZ2VzIG1hZGUgdG8gcHJvcGVydGllcyBvciBhdHRyaWJ1dGVzIGluc2lkZSB0aGlzIGNhbGxiYWNrICp3b24ndCogY2F1c2UgYW5vdGhlciB1cGRhdGUuXG4gICAgICogVG8gY2F1c2UgYW4gdXBkYXRlLCBkZWZlciBjaGFuZ2VzIHdpdGggdGhlIGhlbHAgb2YgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgKiAgICAgICAgICAgICAgLy8gcGVyZm9ybSBjaGFuZ2VzIHdoaWNoIG5lZWQgdG8gY2F1c2UgYW5vdGhlciB1cGRhdGUgaGVyZVxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgICAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZmlyc3RVcGRhdGUgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIHdhcyB0aGUgZmlyc3QgdXBkYXRlXG4gICAgICovXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7IH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgY3VzdG9tIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBBbiBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIGV2ZW50SW5pdCBBIHtAbGluayBDdXN0b21FdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5IChldmVudE5hbWU6IHN0cmluZywgZXZlbnRJbml0PzogQ3VzdG9tRXZlbnRJbml0KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIGV2ZW50SW5pdCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoIHByb3BlcnR5IGNoYW5nZXMgb2NjdXJyaW5nIGluIHRoZSBleGVjdXRvciBhbmQgcmFpc2UgY3VzdG9tIGV2ZW50c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIHNob3VsZCB0cmlnZ2VyIGN1c3RvbSBldmVudHMgd2hlbiB0aGV5IGFyZSBjYXVzZWQgYnkgaW50ZXJuYWwgc3RhdGUgY2hhbmdlcyxcbiAgICAgKiBidXQgbm90IGlmIHRoZXkgYXJlIGNhdXNlZCBieSBhIGNvbnN1bWVyIG9mIHRoZSBjb21wb25lbnQgQVBJIGRpcmVjdGx5LCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ215LWN1c3RvbS1lbGVtZW50JykuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIGBgYC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWVhbnMsIHdlIGNhbm5vdCBhdXRvbWF0ZSB0aGlzIHByb2Nlc3MgdGhyb3VnaCBwcm9wZXJ0eSBzZXR0ZXJzLCBhcyB3ZSBjYW4ndCBiZSBzdXJlIHdob1xuICAgICAqIGludm9rZWQgdGhlIHNldHRlciAtIGludGVybmFsIGNhbGxzIG9yIGV4dGVybmFsIGNhbGxzLlxuICAgICAqXG4gICAgICogT25lIG9wdGlvbiBpcyB0byBtYW51YWxseSByYWlzZSB0aGUgZXZlbnQsIHdoaWNoIGNhbiBiZWNvbWUgdGVkaW91cyBhbmQgZm9yY2VzIHVzIHRvIHVzZSBzdHJpbmctXG4gICAgICogYmFzZWQgZXZlbnQgbmFtZXMgb3IgcHJvcGVydHkgbmFtZXMsIHdoaWNoIGFyZSBkaWZmaWN1bHQgdG8gcmVmYWN0b3IsIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogLy8gaWYgd2UgcmVmYWN0b3IgdGhlIHByb3BlcnR5IG5hbWUsIHdlIGNhbiBlYXNpbHkgbWlzcyB0aGUgbm90aWZ5IGNhbGxcbiAgICAgKiB0aGlzLm5vdGlmeSgnY3VzdG9tUHJvcGVydHknKTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEEgbW9yZSBjb252ZW5pZW50IHdheSBpcyB0byBleGVjdXRlIHRoZSBpbnRlcm5hbCBjaGFuZ2VzIGluIGEgd3JhcHBlciB3aGljaCBjYW4gZGV0ZWN0IHRoZSBjaGFuZ2VkXG4gICAgICogcHJvcGVydGllcyBhbmQgd2lsbCBhdXRvbWF0aWNhbGx5IHJhaXNlIHRoZSByZXF1aXJlZCBldmVudHMuIFRoaXMgZWxpbWluYXRlcyB0aGUgbmVlZCB0byBtYW51YWxseVxuICAgICAqIHJhaXNlIGV2ZW50cyBhbmQgcmVmYWN0b3JpbmcgZG9lcyBubyBsb25nZXIgYWZmZWN0IHRoZSBwcm9jZXNzLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMud2F0Y2goKCkgPT4ge1xuICAgICAqXG4gICAgICogICAgICB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAgICAgIC8vIHdlIGNhbiBhZGQgbW9yZSBwcm9wZXJ0eSBtb2RpZmljYXRpb25zIHRvIG5vdGlmeSBpbiBoZXJlXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgQSBmdW5jdGlvbiB0aGF0IHBlcmZvcm1zIHRoZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBiZSBub3RpZmllZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3YXRjaCAoZXhlY3V0b3I6ICgpID0+IHZvaWQpIHtcblxuICAgICAgICAvLyBiYWNrIHVwIGN1cnJlbnQgY2hhbmdlZCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNoYW5nZXNcbiAgICAgICAgZXhlY3V0b3IoKTtcblxuICAgICAgICAvLyBhZGQgYWxsIG5ldyBvciB1cGRhdGVkIGNoYW5nZWQgcHJvcGVydGllcyB0byB0aGUgbm90aWZ5aW5nIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBbcHJvcGVydHlLZXksIG9sZFZhbHVlXSBvZiB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcykge1xuXG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9ICFwcmV2aW91c0NoYW5nZXMuaGFzKHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSAhYWRkZWQgJiYgdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBwcmV2aW91c0NoYW5nZXMuZ2V0KHByb3BlcnR5S2V5KSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoYWRkZWQgfHwgdXBkYXRlZCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdmFsdWUgb2YgYSBkZWNvcmF0ZWQgcHJvcGVydHkgb3IgaXRzIGFzc29jaWF0ZWRcbiAgICAgKiBhdHRyaWJ1dGUgY2hhbmdlcy4gSWYgeW91IG5lZWQgdGhlIGNvbXBvbmVudCB0byB1cGRhdGUgYmFzZWQgb24gYSBzdGF0ZSBjaGFuZ2UgdGhhdCBpc1xuICAgICAqIG5vdCBjb3ZlcmVkIGJ5IGEgZGVjb3JhdGVkIHByb3BlcnR5LCBjYWxsIHRoaXMgbWV0aG9kIHdpdGhvdXQgYW55IGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIHByb3BlcnR5IHRoYXQgcmVxdWVzdHMgdGhlIHVwZGF0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICB0aGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgQSBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIHdoZW4gdGhlIHVwZGF0ZSBpcyBjb21wbGV0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVxdWVzdFVwZGF0ZSAocHJvcGVydHlLZXk/OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU/OiBhbnksIG5ld1ZhbHVlPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0ncyBvYnNlcnZlIG9wdGlvbiBpcyBgZmFsc2VgLCB7QGxpbmsgaGFzQ2hhbmdlZH1cbiAgICAgICAgICAgIC8vIHdpbGwgcmV0dXJuIGBmYWxzZWAgYW5kIG5vIHVwZGF0ZSB3aWxsIGJlIHJlcXVlc3RlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0NoYW5nZWQocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSkpIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuXG4gICAgICAgICAgICAvLyBzdG9yZSBjaGFuZ2VkIHByb3BlcnR5IGZvciBiYXRjaCBwcm9jZXNzaW5nXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgYXJlIGluIHJlZmxlY3Rpbmcgc3RhdGUsIGFuIGF0dHJpYnV0ZSBpcyByZWZsZWN0aW5nIHRvIHRoaXMgcHJvcGVydHkgYW5kIHdlXG4gICAgICAgICAgICAvLyBjYW4gc2tpcCByZWZsZWN0aW5nIHRoZSBwcm9wZXJ0eSBiYWNrIHRvIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIC8vIHByb3BlcnR5IGNoYW5nZXMgbmVlZCB0byBiZSB0cmFja2VkIGhvd2V2ZXIgYW5kIHtAbGluayByZW5kZXJ9IG11c3QgYmUgY2FsbGVkIGFmdGVyXG4gICAgICAgICAgICAvLyB0aGUgYXR0cmlidXRlIGNoYW5nZSBpcyByZWZsZWN0ZWQgdG8gdGhpcyBwcm9wZXJ0eVxuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1JlZmxlY3RpbmcpIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gZW5xdWV1ZSB1cGRhdGUgcmVxdWVzdCBpZiBub25lIHdhcyBlbnF1ZXVlZCBhbHJlYWR5XG4gICAgICAgICAgICB0aGlzLl9lbnF1ZXVlVXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZSB0byBpdHMge0BsaW5rIHJlbmRlclJvb3R9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFVzZXMgbGl0LWh0bWwncyB7QGxpbmsgbGl0LWh0bWwjcmVuZGVyfSBtZXRob2QgdG8gcmVuZGVyIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB0byB0aGVcbiAgICAgKiBjb21wb25lbnQncyByZW5kZXIgcm9vdC4gVGhlIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgc3RhdGljIHRlbXBsYXRlIG1ldGhvZFxuICAgICAqIGF1dG9tYXRpY2FsbHkuIFRvIG1ha2UgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGF2YWlsYWJsZSB0byB0aGUgdGVtcGxhdGUgbWV0aG9kLCB5b3UgY2FuIHBhc3MgdGhlbSB0byB0aGVcbiAgICAgKiByZW5kZXIgbWV0aG9kLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGNvbnN0IGRhdGVGb3JtYXR0ZXIgPSAoZGF0ZTogRGF0ZSkgPT4geyAvLyByZXR1cm4gc29tZSBkYXRlIHRyYW5zZm9ybWF0aW9uLi4uXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50JyxcbiAgICAgKiAgICAgIHRlbXBsYXRlOiAoZWxlbWVudCwgZm9ybWF0RGF0ZSkgPT4gaHRtbGA8c3Bhbj5MYXN0IHVwZGF0ZWQ6ICR7IGZvcm1hdERhdGUoZWxlbWVudC5sYXN0VXBkYXRlZCkgfTwvc3Bhbj5gXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBAcHJvcGVydHkoKVxuICAgICAqICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICpcbiAgICAgKiAgICAgIHJlbmRlciAoKSB7XG4gICAgICogICAgICAgICAgLy8gbWFrZSB0aGUgZGF0ZSBmb3JtYXR0ZXIgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSBieSBwYXNzaW5nIGl0IHRvIHJlbmRlcigpXG4gICAgICogICAgICAgICAgc3VwZXIucmVuZGVyKGRhdGVGb3JtYXR0ZXIpO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBoZWxwZXJzICAgQW55IGFkZGl0aW9uYWwgb2JqZWN0cyB3aGljaCBzaG91bGQgYmUgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSBzY29wZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW5kZXIgKC4uLmhlbHBlcnM6IGFueVtdKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSAmJiBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSh0aGlzLCAuLi5oZWxwZXJzKTtcblxuICAgICAgICBpZiAodGVtcGxhdGUpIHJlbmRlcih0ZW1wbGF0ZSwgdGhpcy5yZW5kZXJSb290LCB7IGV2ZW50Q29udGV4dDogdGhpcyB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjb21wb25lbnQgYWZ0ZXIgYW4gdXBkYXRlIHdhcyByZXF1ZXN0ZWQgd2l0aCB7QGxpbmsgcmVxdWVzdFVwZGF0ZX1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVuZGVycyB0aGUgdGVtcGxhdGUsIHJlZmxlY3RzIGNoYW5nZWQgcHJvcGVydGllcyB0byBhdHRyaWJ1dGVzIGFuZFxuICAgICAqIGRpc3BhdGNoZXMgY2hhbmdlIGV2ZW50cyBmb3IgcHJvcGVydGllcyB3aGljaCBhcmUgbWFya2VkIGZvciBub3RpZmljYXRpb24uXG4gICAgICogVG8gaGFuZGxlIHVwZGF0ZXMgZGlmZmVyZW50bHksIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGFuZCBhIG1hcCBvZiBwcm9wZXJ0eVxuICAgICAqIGNoYW5nZXMgaXMgcHJvdmlkZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlIChjaGFuZ2VzPzogQ2hhbmdlcykge1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gcmVmbGVjdCBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIHJlZmxlY3Rpb25cbiAgICAgICAgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWU6IGFueSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMucmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDb21wb25lbnRdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbm90aWZ5IGFsbCBwcm9wZXJ0aWVzIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uXG4gICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWUsIHByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMubm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIENvbXBvbmVudF0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHByb3BlcnR5IGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVzb2x2ZXMgdGhlIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfSBmb3IgdGhlIHByb3BlcnR5IGFuZCByZXR1cm5zIGl0cyByZXN1bHQuXG4gICAgICogSWYgbm9uZSBpcyBkZWZpbmVkICh0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24ncyBgb2JzZXJ2ZWAgb3B0aW9uIGlzIGBmYWxzZWApIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBjaGFuZ2VkLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNDaGFuZ2VkIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBvYnNlcnZlIGlzIGVpdGhlciBgZmFsc2VgIG9yIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZS5jYWxsKG51bGwsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBDSEFOR0VfREVURUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gZm9yIGEgZGVjb3JhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIGRlY2xhcmF0aW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFByb3BlcnR5RGVjbGFyYXRpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVjbGFyYXRpb24gfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIGFzc29jaWF0ZWQgcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RBdHRyaWJ1dGV9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICAvLyBpZ25vcmUgdXNlci1kZWZpbmVkIG9ic2VydmVkIGF0dHJpYnV0ZXNcbiAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIGFuZCByZW1vdmUgdGhlIGxvZ1xuICAgICAgICBpZiAoIXByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBvYnNlcnZlZCBhdHRyaWJ1dGUgXCIkeyBhdHRyaWJ1dGVOYW1lIH1cIiBub3QgZm91bmQuLi4gaWdub3JpbmcuLi5gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNBdHRyaWJ1dGVSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlLmNhbGwodGhpcywgYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZV0gYXMgQXR0cmlidXRlUmVmbGVjdG9yKShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5fSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkge1xuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHksIHdlIGNhbiBjYXRjaCB0aGUgc3RhdGUgdGhlcmVcbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5UmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5XSBhcyBQcm9wZXJ0eVJlZmxlY3RvcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJhaXNlIGFuIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSBub3RpZmllci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIG5vdGlmaWVyIHtAbGluayBfbm90aWZ5UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByYWlzZSBhbiBldmVudCBmb3JcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpIHtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlOb3RpZmllcihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnldIGFzIFByb3BlcnR5Tm90aWZpZXIpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBjb21wb25lbnQncyByZW5kZXIgcm9vdFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dC4gV2hlbiB1c2luZyB0aGUgY29tcG9uZW50XG4gICAgICogd2l0aCBzaGFkb3cgbW9kZSwgaXQgd2lsbCBiZSBhIHtAbGluayBTaGFkb3dSb290fSwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NyZWF0ZVJlbmRlclJvb3QgKCk6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkuc2hhZG93XG4gICAgICAgICAgICA/IHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pXG4gICAgICAgICAgICA6IHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgY29tcG9uZW50J3Mgc3R5bGVzIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlIHdpbGwgYmUgYWRvcHRlZFxuICAgICAqIGJ5IHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIG5vdCwgYSBzdHlsZSBlbGVtZW50IGlzIGNyZWF0ZWQgYW5kIGF0dGFjaGVkIHRvIHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIHRoZVxuICAgICAqIGNvbXBvbmVudCBpcyBub3QgdXNpbmcgc2hhZG93IG1vZGUsIGEgc2NyaXB0IHRhZyB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLiBGb3IgbXVsdGlwbGVcbiAgICAgKiBpbnN0YW5jZXMgb2YgdGhlIHNhbWUgY29tcG9uZW50IG9ubHkgb25lIHN0eWxlc2hlZXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2Fkb3B0U3R5bGVzICgpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcbiAgICAgICAgY29uc3Qgc3R5bGVTaGVldCA9IGNvbnN0cnVjdG9yLnN0eWxlU2hlZXQ7XG4gICAgICAgIGNvbnN0IHN0eWxlRWxlbWVudCA9IGNvbnN0cnVjdG9yLnN0eWxlRWxlbWVudDtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gY29uc3RydWN0b3Iuc3R5bGVzO1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0KSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBwYXJ0IG9uY2Ugd2UgaGF2ZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIChDaHJvbWUgNzMpXG4gICAgICAgICAgICBpZiAoIWNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgaWYgKChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLmluY2x1ZGVzKHN0eWxlU2hlZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgICh0aGlzLnJlbmRlclJvb3QgYXMgU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW3N0eWxlU2hlZXRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoc3R5bGVFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3Qgd2UgZG9uJ3QgZHVwbGljYXRlIHN0eWxlc2hlZXRzIGZvciBub24tc2hhZG93IGVsZW1lbnRzXG4gICAgICAgICAgICBjb25zdCBzdHlsZUFscmVhZHlBZGRlZCA9IGNvbnN0cnVjdG9yLnNoYWRvd1xuICAgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgICAgICA6IEFycmF5LmZyb20oZG9jdW1lbnQuc3R5bGVTaGVldHMpLmZpbmQoc3R5bGUgPT4gc3R5bGUudGl0bGUgPT09IGNvbnN0cnVjdG9yLnNlbGVjdG9yKSAmJiB0cnVlIHx8IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoc3R5bGVBbHJlYWR5QWRkZWQpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gY2xvbmUgdGhlIGNhY2hlZCBzdHlsZSBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChjb25zdHJ1Y3Rvci5zaGFkb3cpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vdC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlTmFtZSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgYXR0cmlidXRlIHZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci5mcm9tQXR0cmlidXRlKG5ld1ZhbHVlKTtcblxuICAgICAgICB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdID0gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgZm9yIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBhIGRlY2xhcmF0aW9uXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBpZiB0aGUgZGVmYXVsdCByZWZsZWN0b3IgaXMgdXNlZCwgd2UgbmVlZCB0byBjaGVjayBpZiBhbiBhdHRyaWJ1dGUgZm9yIHRoaXMgcHJvcGVydHkgZXhpc3RzXG4gICAgICAgIC8vIGlmIG5vdCwgd2Ugd29uJ3QgcmVmbGVjdFxuICAgICAgICBpZiAoIXByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSwgaXQncyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gcHJvcGVydHlEZWNsYXJhdGlvbi5hdHRyaWJ1dGUgYXMgc3RyaW5nO1xuXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLnRvQXR0cmlidXRlKG5ld1ZhbHVlKTtcblxuICAgICAgICAvLyB1bmRlZmluZWQgbWVhbnMgZG9uJ3QgY2hhbmdlXG4gICAgICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIG1lYW5zIHJlbW92ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGVsc2UgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgcHJvcGVydHktY2hhbmdlZCBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5XG4gICAgICogQHBhcmFtIG9sZFZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBjcmVhdGVFdmVudE5hbWUocHJvcGVydHlLZXksICcnLCAnY2hhbmdlZCcpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIGxpZmVjeWNsZSBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZSBUaGUgbGlmZWN5Y2xlIGZvciB3aGljaCB0byByYWlzZSB0aGUgZXZlbnQgKHdpbGwgYmUgdGhlIGV2ZW50IG5hbWUpXG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeUxpZmVjeWNsZSAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbD86IG9iamVjdCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQobGlmZWN5Y2xlLCB7XG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIC4uLihkZXRhaWwgPyB7IGRldGFpbDogZGV0YWlsIH0gOiB7fSlcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW4gKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLmxpc3RlbmVycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbGlzdGVuZXIpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEZWNsYXJhdGlvbjogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgY2xhc3MncyBzdGF0aWMgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW50byBhbiBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGV2ZW50OiBkZWNsYXJhdGlvbi5ldmVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBkZWNsYXJhdGlvbi5vcHRpb25zLFxuXG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aGUgY29tcG9uZW50cyBsaXN0ZW5lciBtZXRob2QgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6ICh0aGlzW2xpc3RlbmVyIGFzIGtleW9mIHRoaXNdIGFzIHVua25vd24gYXMgRXZlbnRMaXN0ZW5lcikuYmluZCh0aGlzKSxcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnQgdGFyZ2V0IGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICB0YXJnZXQ6IChkZWNsYXJhdGlvbi50YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgID8gKHR5cGVvZiBkZWNsYXJhdGlvbi50YXJnZXQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGRlY2xhcmF0aW9uLnRhcmdldC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgYm91bmQgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRhcmdldFxuICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmV2ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGluIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLnB1c2goaW5zdGFuY2VEZWNsYXJhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5ldmVudCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVucXVldWUgYSByZXF1ZXN0IGZvciBhbiBhc3luY2hyb25vdXMgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2VucXVldWVVcGRhdGUgKCkge1xuXG4gICAgICAgIGxldCByZXNvbHZlOiAocmVzdWx0OiBib29sZWFuKSA9PiB2b2lkO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVxdWVzdCA9IHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgLy8gbWFyayB0aGUgY29tcG9uZW50IGFzIGhhdmluZyByZXF1ZXN0ZWQgYW4gdXBkYXRlLCB0aGUge0BsaW5rIF9yZXF1ZXN0VXBkYXRlfVxuICAgICAgICAvLyBtZXRob2Qgd2lsbCBub3QgZW5xdWV1ZSBhIGZ1cnRoZXIgcmVxdWVzdCBmb3IgdXBkYXRlIGlmIG9uZSBpcyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzID0+IHJlc29sdmUgPSByZXMpO1xuXG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB1cGRhdGUgdG8gcmVzb2x2ZVxuICAgICAgICAvLyBgYXdhaXRgIGlzIGFzeW5jaHJvbm91cyBhbmQgd2lsbCByZXR1cm4gZXhlY3V0aW9uIHRvIHRoZSB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gbWV0aG9kXG4gICAgICAgIC8vIGFuZCBlc3NlbnRpYWxseSBhbGxvd3MgdXMgdG8gYmF0Y2ggbXVsdGlwbGUgc3luY2hyb25vdXMgcHJvcGVydHkgY2hhbmdlcywgYmVmb3JlIHRoZVxuICAgICAgICAvLyBleGVjdXRpb24gY2FuIHJlc3VtZSBoZXJlXG4gICAgICAgIGF3YWl0IHByZXZpb3VzUmVxdWVzdDtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zY2hlZHVsZVVwZGF0ZSgpO1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdXBkYXRlIG1heSBiZSBzY2hlZHVsZWQgYXN5bmNocm9ub3VzbHkgYXMgd2VsbFxuICAgICAgICBpZiAocmVzdWx0KSBhd2FpdCByZXN1bHQ7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgbmV3IHtAbGluayBfdXBkYXRlUmVxdWVzdH0gYWZ0ZXIgdGhlIHJlc3VsdCBvZiB0aGUgY3VycmVudCB1cGRhdGUgcmVzb2x2ZXNcbiAgICAgICAgcmVzb2x2ZSEoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NoZWR1bGUgdGhlIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNjaGVkdWxlcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYXMgc29vbiBhcyBwb3NzaWJsZSBhbmQgYWxsIGNvbnNlY3V0aXZlIHVwZGF0ZXNcbiAgICAgKiBqdXN0IGJlZm9yZSB0aGUgbmV4dCBmcmFtZS4gSW4gdGhlIGxhdHRlciBjYXNlIGl0IHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgKiB0aGUgdXBkYXRlIGlzIGRvbmUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NjaGVkdWxlVXBkYXRlICgpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzY2hlZHVsZSB0aGUgdXBkYXRlIHZpYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdG8gYXZvaWQgbXVsdGlwbGUgcmVkcmF3cyBwZXIgZnJhbWVcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21wb25lbnQgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEludm9rZXMge0BsaW5rIHVwZGF0ZUNhbGxiYWNrfSBhZnRlciBwZXJmb3JtaW5nIHRoZSB1cGRhdGUgYW5kIGNsZWFucyB1cCB0aGUgY29tcG9uZW50XG4gICAgICogc3RhdGUuIER1cmluZyB0aGUgZmlyc3QgdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVzIHdpbGwgYmUgYWRkZWQuIERpc3BhdGNoZXMgdGhlIHVwZGF0ZVxuICAgICAqIGxpZmVjeWNsZSBldmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcGVyZm9ybVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgLy8gd2UgaGF2ZSB0byB3YWl0IHVudGlsIHRoZSBjb21wb25lbnQgaXMgY29ubmVjdGVkIGJlZm9yZSB3ZSBjYW4gZG8gYW55IHVwZGF0ZXNcbiAgICAgICAgLy8gdGhlIHtAbGluayBjb25uZWN0ZWRDYWxsYmFja30gd2lsbCBjYWxsIHtAbGluayByZXF1ZXN0VXBkYXRlfSBpbiBhbnkgY2FzZSwgc28gd2UgY2FuXG4gICAgICAgIC8vIHNpbXBseSBieXBhc3MgYW55IGFjdHVhbCB1cGRhdGUgYW5kIGNsZWFuLXVwIHVudGlsIHRoZW5cbiAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBwYXNzIGEgY29weSBvZiB0aGUgcHJvcGVydHkgY2hhbmdlcyB0byB0aGUgdXBkYXRlIG1ldGhvZCwgc28gcHJvcGVydHkgY2hhbmdlc1xuICAgICAgICAgICAgLy8gYXJlIGF2YWlsYWJsZSBpbiBhbiBvdmVycmlkZGVuIHVwZGF0ZSBtZXRob2RcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKGNoYW5nZXMpO1xuXG4gICAgICAgICAgICAvLyByZXNldCBwcm9wZXJ0eSBtYXBzIGRpcmVjdGx5IGFmdGVyIHRoZSB1cGRhdGUsIHNvIGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGVDYWxsYmFja1xuICAgICAgICAgICAgLy8gY2FuIGJlIHJlY29yZGVkIGZvciB0aGUgbmV4dCB1cGRhdGUsIHdoaWNoIGhhcyB0byBiZSB0cmlnZ2VyZWQgbWFudWFsbHkgdGhvdWdoXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSB3ZSBhZG9wdCB0aGUgZWxlbWVudCdzIHN0eWxlcyBhbmQgc2V0IHVwIGRlY2xhcmVkIGxpc3RlbmVyc1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9hZG9wdFN0eWxlcygpO1xuXG4gICAgICAgICAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnMgYWZ0ZXIgdGhlIHVwZGF0ZSwgdGhpcyB3YXkgd2UgZW5zdXJlIGFsbCBET00gaXMgcmVuZGVyZWQsIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgLy8gYXJlIHVwLXRvLWRhdGUgYW5kIGFueSB1c2VyLWNyZWF0ZWQgb2JqZWN0cyAoZS5nLiB3b3JrZXJzKSB3aWxsIGJlIGNyZWF0ZWQgaW4gYW5cbiAgICAgICAgICAgICAgICAvLyBvdmVycmlkZGVuIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soY2hhbmdlcywgIXRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ3VwZGF0ZScsIHsgY2hhbmdlczogY2hhbmdlcywgZmlyc3RVcGRhdGU6ICF0aGlzLl9oYXNVcGRhdGVkIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hcmsgY29tcG9uZW50IGFzIHVwZGF0ZWQgKmFmdGVyKiB0aGUgdXBkYXRlIHRvIHByZXZlbnQgaW5maW50ZSBsb29wcyBpbiB0aGUgdXBkYXRlIHByb2Nlc3NcbiAgICAgICAgLy8gTi5CLjogYW55IHByb3BlcnR5IGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGUgd2lsbCBub3QgdHJpZ2dlciBhbm90aGVyIHVwZGF0ZVxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICB9XG59XG4iLCIvKipcbiAqIEEgc2ltcGxlIGNzcyB0ZW1wbGF0ZSBsaXRlcmFsIHRhZ1xuICpcbiAqIEByZW1hcmtzXG4gKiBUaGUgdGFnIGl0c2VsZiBkb2Vzbid0IGRvIGFueXRoaW5nIHRoYXQgYW4gdW50YWdnZWQgdGVtcGxhdGUgbGl0ZXJhbCB3b3VsZG4ndCBkbywgYnV0IGl0IGNhbiBiZSB1c2VkIGJ5XG4gKiBlZGl0b3IgcGx1Z2lucyB0byBpbmZlciB0aGUgXCJ2aXJ0dWFsIGRvY3VtZW50IHR5cGVcIiB0byBwcm92aWRlIGNvZGUgY29tcGxldGlvbiBhbmQgaGlnaGxpZ2h0aW5nLiBJdCBjb3VsZFxuICogYWxzbyBiZSB1c2VkIGluIHRoZSBmdXR1cmUgdG8gbW9yZSBzZWN1cmVseSBjb252ZXJ0IHN1YnN0aXR1dGlvbnMgaW50byBzdHJpbmdzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcbiAqXG4gKiBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuICogICBkaXNwbGF5OiBibG9jaztcbiAqICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAqICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbiAqIGA7XG4gKlxuICogY29uc3QgbWl4aW5Ib3ZlciA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBjc3NgXG4gKiAkeyBzZWxlY3RvciB9OmhvdmVyIHtcbiAqICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuICogfVxuICogYDtcbiAqXG4gKiBjb25zdCBzdHlsZXMgPSBjc3NgXG4gKiA6aG9zdCB7XG4gKiAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICAkeyBtaXhpbkJveCgpIH1cbiAqIH1cbiAqICR7IG1peGluSG92ZXIoJzpob3N0JykgfVxuICogOjpzbG90dGVkKCopIHtcbiAqICAgbWFyZ2luOiAwO1xuICogfVxuICogYDtcbiAqXG4gKiAvLyB3aWxsIHByb2R1Y2UuLi5cbiAqIDpob3N0IHtcbiAqIC0taG92ZXItY29sb3I6IGdyZWVuO1xuICogZGlzcGxheTogYmxvY2s7XG4gKlxuICogZGlzcGxheTogYmxvY2s7XG4gKiBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogYm9yZGVyOiAxcHggc29saWQgc2lsdmVyO1xuICpcbiAqIH1cbiAqXG4gKiA6aG9zdDpob3ZlciB7XG4gKiBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKlxuICogOjpzbG90dGVkKCopIHtcbiAqIG1hcmdpbjogMDtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgY3NzID0gKGxpdGVyYWxzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uc3Vic3RpdHV0aW9uczogYW55W10pID0+IHtcblxuICAgIHJldHVybiBzdWJzdGl0dXRpb25zLnJlZHVjZSgocHJldjogc3RyaW5nLCBjdXJyOiBhbnksIGk6IG51bWJlcikgPT4gcHJldiArIGN1cnIgKyBsaXRlcmFsc1tpICsgMV0sIGxpdGVyYWxzWzBdKTtcbn07XG5cbi8vIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcblxuLy8gY29uc3QgbWl4aW5Cb3ggPSAoYm9yZGVyV2lkdGg6IHN0cmluZyA9ICcxcHgnLCBib3JkZXJDb2xvcjogc3RyaW5nID0gJ3NpbHZlcicpID0+IGNzc2Bcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4vLyAgIGJvcmRlcjogJHtib3JkZXJXaWR0aH0gc29saWQgJHtib3JkZXJDb2xvcn07XG4vLyBgO1xuXG4vLyBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2Bcbi8vICR7IHNlbGVjdG9yIH06aG92ZXIge1xuLy8gICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4vLyB9XG4vLyBgO1xuXG4vLyBjb25zdCBzdHlsZXMgPSBjc3NgXG4vLyA6aG9zdCB7XG4vLyAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4vLyAgIGRpc3BsYXk6IGJsb2NrO1xuLy8gICAkeyBtaXhpbkJveCgpIH1cbi8vIH1cblxuLy8gJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG5cbi8vIDo6c2xvdHRlZCgqKSB7XG4vLyAgIG1hcmdpbjogMDtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4iLCJleHBvcnQgY29uc3QgQXJyb3dVcCA9ICdBcnJvd1VwJztcbmV4cG9ydCBjb25zdCBBcnJvd0Rvd24gPSAnQXJyb3dEb3duJztcbmV4cG9ydCBjb25zdCBBcnJvd0xlZnQgPSAnQXJyb3dMZWZ0JztcbmV4cG9ydCBjb25zdCBBcnJvd1JpZ2h0ID0gJ0Fycm93UmlnaHQnO1xuZXhwb3J0IGNvbnN0IEVudGVyID0gJ0VudGVyJztcbmV4cG9ydCBjb25zdCBFc2NhcGUgPSAnRXNjYXBlJztcbmV4cG9ydCBjb25zdCBTcGFjZSA9ICcgJztcbmV4cG9ydCBjb25zdCBUYWIgPSAnVGFiJztcbmV4cG9ydCBjb25zdCBCYWNrc3BhY2UgPSAnQmFja3NwYWNlJztcbmV4cG9ydCBjb25zdCBBbHQgPSAnQWx0JztcbmV4cG9ydCBjb25zdCBTaGlmdCA9ICdTaGlmdCc7XG5leHBvcnQgY29uc3QgQ29udHJvbCA9ICdDb250cm9sJztcbmV4cG9ydCBjb25zdCBNZXRhID0gJ01ldGEnO1xuIiwiaW1wb3J0IHsgQXJyb3dEb3duLCBBcnJvd0xlZnQsIEFycm93UmlnaHQsIEFycm93VXAgfSBmcm9tICcuL2tleXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RJdGVtIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVJdGVtQ2hhbmdlPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBDdXN0b21FdmVudCB7XG4gICAgdHlwZTogJ2FjdGl2ZS1pdGVtLWNoYW5nZSc7XG4gICAgZGV0YWlsOiB7XG4gICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGl0ZW06IFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnR5cGUgTGlzdEVudHJ5PFQgZXh0ZW5kcyBMaXN0SXRlbT4gPSBbbnVtYmVyIHwgdW5kZWZpbmVkLCBUIHwgdW5kZWZpbmVkXTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpc3RLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBFdmVudFRhcmdldCB7XG5cbiAgICBwcm90ZWN0ZWQgYWN0aXZlSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJdGVtOiBUIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGxpc3RlbmVyczogTWFwPHN0cmluZywgRXZlbnRMaXN0ZW5lcj4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgaXRlbVR5cGU6IGFueTtcblxuICAgIHB1YmxpYyBpdGVtczogVFtdO1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwdWJsaWMgaG9zdDogSFRNTEVsZW1lbnQsXG4gICAgICAgIGl0ZW1zOiBOb2RlTGlzdE9mPFQ+LFxuICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJykge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IEFycmF5LmZyb20oaXRlbXMpO1xuICAgICAgICB0aGlzLml0ZW1UeXBlID0gdGhpcy5pdGVtc1swXSAmJiB0aGlzLml0ZW1zWzBdLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHRoaXMuYmluZEhvc3QoKTtcbiAgICB9XG5cbiAgICBnZXRBY3RpdmVJdGVtICgpOiBUIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJdGVtO1xuICAgIH07XG5cbiAgICBzZXRBY3RpdmVJdGVtIChpdGVtOiBULCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBMaXN0RW50cnk8VD4gPSBbXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaW5kZXggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaXRlbSA6IHVuZGVmaW5lZFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXROZXh0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXROZXh0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldFByZXZpb3VzSXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRQcmV2aW91c0VudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRGaXJzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0Rmlyc3RFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0TGFzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0TGFzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IFtwcmV2LCBuZXh0XSA9ICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSA/IFtBcnJvd0xlZnQsIEFycm93UmlnaHRdIDogW0Fycm93VXAsIEFycm93RG93bl07XG4gICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBwcmV2OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQcmV2aW91c0l0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgbmV4dDpcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TmV4dEl0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IHRhcmdldDogVCB8IG51bGwgPSBldmVudC50YXJnZXQgYXMgVCB8IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgdGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSAmJiAhdGFyZ2V0IS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRm9jdXMgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlIChwcmV2aW91c0luZGV4OiBudW1iZXIgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICBjb25zdCBldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUPiA9IG5ldyBDdXN0b21FdmVudCgnYWN0aXZlLWl0ZW0tY2hhbmdlJywge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiAodHlwZW9mIHByZXZpb3VzSW5kZXggPT09ICdudW1iZXInKSA/IHRoaXMuaXRlbXNbcHJldmlvdXNJbmRleF0gOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHRoaXMuYWN0aXZlSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuYWN0aXZlSXRlbVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgQWN0aXZlSXRlbUNoYW5nZTxUPjtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRFbnRyeUFjdGl2ZSAoZW50cnk6IExpc3RFbnRyeTxUPiwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dID0gZW50cnk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldE5leHRFbnRyeSAoZnJvbUluZGV4PzogbnVtYmVyKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICBmcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICA/IGZyb21JbmRleFxuICAgICAgICAgICAgOiAodHlwZW9mIHRoaXMuYWN0aXZlSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmVJbmRleFxuICAgICAgICAgICAgICAgIDogLTE7XG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5pdGVtcy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgbmV4dEluZGV4ID0gZnJvbUluZGV4ICsgMTtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gdGhpcy5pdGVtc1tuZXh0SW5kZXhdO1xuXG4gICAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsYXN0SW5kZXggJiYgbmV4dEl0ZW0gJiYgbmV4dEl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zWysrbmV4dEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAobmV4dEl0ZW0gJiYgIW5leHRJdGVtLmRpc2FibGVkKSA/IFtuZXh0SW5kZXgsIG5leHRJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRQcmV2aW91c0VudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAwO1xuXG4gICAgICAgIGxldCBwcmV2SW5kZXggPSBmcm9tSW5kZXggLSAxO1xuICAgICAgICBsZXQgcHJldkl0ZW0gPSB0aGlzLml0ZW1zW3ByZXZJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKHByZXZJbmRleCA+IDAgJiYgcHJldkl0ZW0gJiYgcHJldkl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgcHJldkl0ZW0gPSB0aGlzLml0ZW1zWy0tcHJldkluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAocHJldkl0ZW0gJiYgIXByZXZJdGVtLmRpc2FibGVkKSA/IFtwcmV2SW5kZXgsIHByZXZJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRGaXJzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldE5leHRFbnRyeSgtMSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldExhc3RFbnRyeSAoKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcmV2aW91c0VudHJ5KHRoaXMuaXRlbXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYmluZEhvc3QgKCkge1xuXG4gICAgICAgIC8vIFRPRE86IGVuYWJsZSByZWNvbm5lY3RpbmcgdGhlIGhvc3QgZWxlbWVudD8gbm8gbmVlZCBpZiBGb2N1c01hbmFnZXIgaXMgY3JlYXRlZCBpbiBjb25uZWN0ZWRDYWxsYmFja1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBNYXAoW1xuICAgICAgICAgICAgWydmb2N1c2luJywgdGhpcy5oYW5kbGVGb2N1cy5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2Vkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2Rpc2Nvbm5lY3RlZCcsIHRoaXMudW5iaW5kSG9zdC5iaW5kKHRoaXMpXVxuICAgICAgICBdKTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1bmJpbmRIb3N0ICgpIHtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZvY3VzS2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgTGlzdEtleU1hbmFnZXI8VD4ge1xuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgc3VwZXIuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJdGVtICYmIGludGVyYWN0aXZlKSB0aGlzLmFjdGl2ZUl0ZW0uZm9jdXMoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50PEljb24+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWljb24nLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICB3aWR0aDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBwYWRkaW5nOiBjYWxjKCh2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pIC0gdmFyKC0tZm9udC1zaXplLCAxZW0pKSAvIDIpO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIH1cbiAgICBzdmcge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgICAgICAgZmlsbDogdmFyKC0taWNvbi1jb2xvciwgY3VycmVudENvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PXVuaV0pIHtcbiAgICAgICAgcGFkZGluZzogMGVtO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9bWF0XSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9ZWldKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBjb25zdCBzZXQgPSBlbGVtZW50LnNldDtcbiAgICAgICAgY29uc3QgaWNvbiA9IChzZXQgPT09ICdtYXQnKVxuICAgICAgICAgICAgPyBgaWNfJHsgZWxlbWVudC5pY29uIH1fMjRweGBcbiAgICAgICAgICAgIDogKHNldCA9PT0gJ2VpJylcbiAgICAgICAgICAgICAgICA/IGBlaS0keyBlbGVtZW50Lmljb24gfS1pY29uYFxuICAgICAgICAgICAgICAgIDogZWxlbWVudC5pY29uO1xuXG4gICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICA8c3ZnIGZvY3VzYWJsZT1cImZhbHNlXCI+XG4gICAgICAgICAgICA8dXNlIGhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIlxuICAgICAgICAgICAgeGxpbms6aHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiIC8+XG4gICAgICAgIDwvc3ZnPmA7XG4gICAgfVxufSlcbmV4cG9ydCBjbGFzcyBJY29uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIGZvciBjYWNoaW5nIGFuIGljb24gc2V0J3Mgc3ByaXRlIHVybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3Nwcml0ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHN2ZyBzcHJpdGUgdXJsIGZvciB0aGUgcmVxdWVzdGVkIGljb24gc2V0XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzcHJpdGUgdXJsIGZvciBhbiBpY29uIHNldCBjYW4gYmUgc2V0IHRocm91Z2ggYSBgbWV0YWAgdGFnIGluIHRoZSBodG1sIGRvY3VtZW50LiBZb3UgY2FuIGRlZmluZVxuICAgICAqIGN1c3RvbSBpY29uIHNldHMgYnkgY2hvc2luZyBhbiBpZGVudGlmaWVyIChzdWNoIGFzIGA6bXlzZXRgIGluc3RlYWQgb2YgYDpmYWAsIGA6bWF0YCBvciBgOmllYCkgYW5kXG4gICAgICogY29uZmlndXJpbmcgaXRzIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhZG9jdHlwZSBodG1sPlxuICAgICAqIDxodG1sPlxuICAgICAqICAgIDxoZWFkPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgbXVsdGlwbGUgc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpmYVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9mb250LWF3ZXNvbWUvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTptYXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvbWF0ZXJpYWwvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTplaVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL2V2aWwtaWNvbnMvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBjdXN0b20gc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpteXNldFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL215c2V0L215X3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwvaGVhZD5cbiAgICAgKiAgICAuLi5cbiAgICAgKiA8L2h0bWw+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBXaGVuIHVzaW5nIHRoZSBpY29uIGVsZW1lbnQsIHNwZWNpZnkgeW91ciBjdXN0b20gaWNvbiBzZXQuXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCEtLSB1c2UgYXR0cmlidXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiBkYXRhLWljb249XCJteV9pY29uX2lkXCIgZGF0YS1zZXQ9XCJteXNldFwiPjwvdWktaWNvbj5cbiAgICAgKiA8IS0tIG9yIHVzZSBwcm9wZXJ0eSBiaW5kaW5ncyB3aXRoaW4gbGl0LWh0bWwgdGVtcGxhdGVzIC0tPlxuICAgICAqIDx1aS1pY29uIC5pY29uPSR7J215X2ljb25faWQnfSAuc2V0PSR7J215c2V0J30+PC91aS1pY29uPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogSWYgbm8gc3ByaXRlIHVybCBpcyBzcGVjaWZpZWQgZm9yIGEgc2V0LCB0aGUgaWNvbiBlbGVtZW50IHdpbGwgYXR0ZW1wdCB0byB1c2UgYW4gc3ZnIGljb24gZnJvbVxuICAgICAqIGFuIGlubGluZWQgc3ZnIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBnZXRTcHJpdGUgKHNldDogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3Nwcml0ZXMuaGFzKHNldCkpIHtcblxuICAgICAgICAgICAgY29uc3QgbWV0YSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYG1ldGFbbmFtZT1cInVpLWljb246c3ByaXRlOiR7IHNldCB9XCJdW2NvbnRlbnRdYCk7XG5cbiAgICAgICAgICAgIGlmIChtZXRhKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVzLnNldChzZXQsIG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50JykhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zcHJpdGVzLmdldChzZXQpIHx8ICcnO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtaWNvbidcbiAgICB9KVxuICAgIGljb24gPSAnaW5mbyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLXNldCdcbiAgICB9KVxuICAgIHNldCA9ICdmYSdcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2ltZycpO1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgJy4uL2ljb24vaWNvbic7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcblxuQGNvbXBvbmVudDxBY2NvcmRpb25IZWFkZXI+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1oZWFkZXInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGFsbDogaW5oZXJpdDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIGZsZXg6IDEgMSAxMDAlO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWRpc2FibGVkPXRydWVdKSB7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9dHJ1ZV0pID4gdWktaWNvbi5leHBhbmQsXG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9ZmFsc2VdKSA+IHVpLWljb24uY29sbGFwc2Uge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8dWktaWNvbiBjbGFzcz1cImNvbGxhcHNlXCIgZGF0YS1pY29uPVwibWludXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICA8dWktaWNvbiBjbGFzcz1cImV4cGFuZFwiIGRhdGEtaWNvbj1cInBsdXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkhlYWRlciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5cbmV4cG9ydCB0eXBlIENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZykgPT4gVGVtcGxhdGVSZXN1bHQ7XG5cbmV4cG9ydCBjb25zdCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0ID0+IHtcblxuICAgIHJldHVybiBodG1sYCZjb3B5OyBDb3B5cmlnaHQgJHsgZGF0ZS5nZXRGdWxsWWVhcigpIH0gJHsgYXV0aG9yLnRyaW0oKSB9YDtcbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IGNvcHlyaWdodCwgQ29weXJpZ2h0SGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9jb3B5cmlnaHQnO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcblxubGV0IG5leHRBY2NvcmRpb25QYW5lbElkID0gMDtcblxuQGNvbXBvbmVudDxBY2NvcmRpb25QYW5lbD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24taGVhZGVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5IHtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgICBvdmVyZmxvdzogYXV0bztcbiAgICAgICAgdHJhbnNpdGlvbjogaGVpZ2h0IC4ycyBlYXNlLW91dDtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHlbYXJpYS1oaWRkZW49dHJ1ZV0ge1xuICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuICAgIC5jb3B5cmlnaHQge1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW0gMXJlbTtcbiAgICAgICAgY29sb3I6IHZhcigtLWRpc2FibGVkLWNvbG9yLCAnI2NjYycpO1xuICAgICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAocGFuZWwsIGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyKSA9PiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24taGVhZGVyXCJcbiAgICAgICAgcm9sZT1cImhlYWRpbmdcIlxuICAgICAgICBhcmlhLWxldmVsPVwiJHsgcGFuZWwubGV2ZWwgfVwiXG4gICAgICAgIEBjbGljaz0keyBwYW5lbC50b2dnbGUgfT5cbiAgICAgICAgPHNsb3QgbmFtZT1cImhlYWRlclwiPjwvc2xvdD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWJvZHlcIlxuICAgICAgICBpZD1cIiR7IHBhbmVsLmlkIH0tYm9keVwiXG4gICAgICAgIHN0eWxlPVwiaGVpZ2h0OiAkeyBwYW5lbC5jb250ZW50SGVpZ2h0IH07XCJcbiAgICAgICAgcm9sZT1cInJlZ2lvblwiXG4gICAgICAgIGFyaWEtaGlkZGVuPVwiJHsgIXBhbmVsLmV4cGFuZGVkIH1cIlxuICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCIkeyBwYW5lbC5pZCB9LWhlYWRlclwiPlxuICAgICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY29weXJpZ2h0XCI+JHsgY29weXJpZ2h0KG5ldyBEYXRlKCksICdBbGV4YW5kZXIgV2VuZGUnKSB9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIF9oZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwgPSBudWxsO1xuICAgIHByb3RlY3RlZCBfYm9keTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIHByb3RlY3RlZCBnZXQgY29udGVudEhlaWdodCAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gIXRoaXMuZXhwYW5kZWQgP1xuICAgICAgICAgICAgJzBweCcgOlxuICAgICAgICAgICAgdGhpcy5fYm9keSA/XG4gICAgICAgICAgICAgICAgYCR7IHRoaXMuX2JvZHkuc2Nyb2xsSGVpZ2h0IH1weGAgOlxuICAgICAgICAgICAgICAgICdhdXRvJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgbGV2ZWwgPSAxO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IgKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgYHVpLWFjY29yZGlvbi1wYW5lbC0keyBuZXh0QWNjb3JkaW9uUGFuZWxJZCsrIH1gO1xuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICAvLyB3cmFwcGluZyB0aGUgcHJvcGVydHkgY2hhbmdlIGluIHRoZSB3YXRjaCBtZXRob2Qgd2lsbCBkaXNwYXRjaCBhIHByb3BlcnR5IGNoYW5nZSBldmVudFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hlYWRlcikgdGhpcy5faGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRIZWFkZXIodGhpcy5xdWVyeVNlbGVjdG9yKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlLCB3ZSBxdWVyeSB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHlcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcihgIyR7IHRoaXMuaWQgfS1ib2R5YCk7XG5cbiAgICAgICAgICAgIC8vIGhhdmluZyBxdWVyaWVkIHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keSwge0BsaW5rIGNvbnRlbnRIZWlnaHR9IGNhbiBub3cgY2FsY3VsYXRlIHRoZVxuICAgICAgICAgICAgLy8gY29ycmVjdCBoZWlnaHQgb2YgdGhlIHBhbmVsIGJvZHkgZm9yIGFuaW1hdGlvblxuICAgICAgICAgICAgLy8gaW4gb3JkZXIgdG8gcmUtZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGJpbmRpbmcgZm9yIHtAbGluayBjb250ZW50SGVpZ2h0fSB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIGFub3RoZXIgcmVuZGVyICh0aGlzIGlzIGNoZWFwLCBvbmx5IGNvbnRlbnRIZWlnaHQgaGFzIGNoYW5nZWQgYW5kIHdpbGwgYmUgdXBkYXRlZClcbiAgICAgICAgICAgIC8vIGhvd2V2ZXIgd2UgY2Fubm90IHJlcXVlc3QgYW5vdGhlciB1cGRhdGUgd2hpbGUgd2UgYXJlIHN0aWxsIGluIHRoZSBjdXJyZW50IHVwZGF0ZSBjeWNsZVxuICAgICAgICAgICAgLy8gdXNpbmcgYSBQcm9taXNlLCB3ZSBjYW4gZGVmZXIgcmVxdWVzdGluZyB0aGUgdXBkYXRlIHVudGlsIGFmdGVyIHRoZSBjdXJyZW50IHVwZGF0ZSBpcyBkb25lXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodHJ1ZSkudGhlbigoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgcmVuZGVyIG1ldGhvZCB0byBpbmplY3QgY3VzdG9tIGhlbHBlcnMgaW50byB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICgpIHtcblxuICAgICAgICBzdXBlci5yZW5kZXIoY29weXJpZ2h0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0SGVhZGVyIChoZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwpIHtcblxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBoZWFkZXI7XG5cbiAgICAgICAgaWYgKCFoZWFkZXIpIHJldHVybjtcblxuICAgICAgICBoZWFkZXIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2hlYWRlcicpO1xuXG4gICAgICAgIGhlYWRlci5pZCA9IGhlYWRlci5pZCB8fCBgJHsgdGhpcy5pZCB9LWhlYWRlcmA7XG4gICAgICAgIGhlYWRlci5jb250cm9scyA9IGAkeyB0aGlzLmlkIH0tYm9keWA7XG4gICAgICAgIGhlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIGhlYWRlci5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCAnLi9hY2NvcmRpb24tcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPEFjY29yZGlvbkhlYWRlcj47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICByZWZsZWN0QXR0cmlidXRlOiBmYWxzZVxuICAgIH0pXG4gICAgcm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBjc3MgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gY3NzYFxuZGVtby1hcHAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuXG5oZWFkZXIge1xuICBmbGV4OiAwIDAgYXV0bztcbn1cblxubWFpbiB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBwYWRkaW5nOiAxcmVtO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBvdmVyZmxvdzogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgxNXJlbSwgMWZyKSk7XG4gIGdyaWQtZ2FwOiAxcmVtO1xufVxuXG4uaWNvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWZsb3c6IHJvdyB3cmFwO1xufVxuXG4uc2V0dGluZ3MtbGlzdCB7XG4gIHBhZGRpbmc6IDA7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5zZXR0aW5ncy1saXN0IGxpIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuXG51aS1jYXJkIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbiB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWw6bm90KDpmaXJzdC1jaGlsZCkge1xuICBib3JkZXItdG9wOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBoMyB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIHAge1xuICBtYXJnaW46IDFyZW07XG59XG5gO1xuIiwiaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vYXBwJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXkvb3ZlcmxheSc7XG5cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZSA9IChlbGVtZW50OiBBcHApID0+IGh0bWxgXG4gICAgPGhlYWRlcj5cbiAgICAgICAgPGgxPkV4YW1wbGVzPC9oMT5cbiAgICA8L2hlYWRlcj5cblxuICAgIDxtYWluPlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+SWNvbjwvaDI+XG5cbiAgICAgICAgICAgIDxoMz5Gb250IEF3ZXNvbWU8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbi1yaWdodCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2stb3BlbicgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BhaW50LWJydXNoJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoLWFsdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2V4Y2xhbWF0aW9uLXRyaWFuZ2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaW5mby1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdxdWVzdGlvbi1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXInIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5Vbmljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2FuZ2xlLXJpZ2h0LWInIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndW5sb2NrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2JydXNoLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXInIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5NYXRlcmlhbCBJY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uX3JpZ2h0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ21haWwnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrX29wZW4nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZWRpdCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjbGVhcicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdkZWxldGUnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnd2FybmluZycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2hlbHAnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYWNjb3VudF9jaXJjbGUnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVyc29uJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+RXZpbCBJY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndW5sb2NrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFwZXJjbGlwJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuY2lsJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjbG9zZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24nIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdxdWVzdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXInIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMj5DaGVja2JveDwvaDI+XG4gICAgICAgICAgICA8dWktY2hlY2tib3ggLmNoZWNrZWQ9JHsgdHJ1ZSB9PjwvdWktY2hlY2tib3g+XG5cbiAgICAgICAgICAgIDxoMj5Ub2dnbGU8L2gyPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwic2V0dGluZ3MtbGlzdFwiPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJub3RpZnktZW1haWxcIj5Ob3RpZmljYXRpb24gZW1haWw8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgbGFiZWwtb249XCJ5ZXNcIiBsYWJlbC1vZmY9XCJub1wiIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeS1lbWFpbFwiIGFyaWEtY2hlY2tlZD1cInRydWVcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJub3RpZnktc21zXCI+Tm90aWZpY2F0aW9uIHNtczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LXNtc1wiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwic2V0dGluZ3MtbGlzdFwiPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJub3RpZnlcIj5Ob3RpZmljYXRpb25zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeVwiIGFyaWEtY2hlY2tlZD1cInRydWVcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5DYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5BY3Rpb24gQ2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktYWN0aW9uLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktYWN0aW9uLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxidXR0b24gc2xvdD1cInVpLWFjdGlvbi1jYXJkLWFjdGlvbnNcIj5Nb3JlPC9idXR0b24+XG4gICAgICAgICAgICA8L3VpLWFjdGlvbi1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+UGxhaW4gQ2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktcGxhaW4tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWZvb3RlclwiPkNhcmQgZm9vdGVyPC9wPlxuICAgICAgICAgICAgPC91aS1wbGFpbi1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+VGFiczwvaDI+XG4gICAgICAgICAgICA8dWktdGFiLWxpc3Q+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0xXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0xXCI+PHNwYW4+Rmlyc3QgVGFiPC9zcGFuPjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItMlwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtMlwiPlNlY29uZCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTNcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTNcIiBhcmlhLWRpc2FibGVkPVwidHJ1ZVwiPlRoaXJkIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItNFwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtNFwiPkZvdXJ0aCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgIDwvdWktdGFiLWxpc3Q+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTFcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rmlyc3QgVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC4gTGF1ZGVtXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm8gcmVjdXNhYm8gYW5cbiAgICAgICAgICAgICAgICAgICAgZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMlwiPlxuICAgICAgICAgICAgICAgIDxoMz5TZWNvbmQgVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5JbiBjbGl0YSB0b2xsaXQgbWluaW11bSBxdW8sIGFuIGFjY3VzYXRhIHZvbHV0cGF0IGV1cmlwaWRpcyB2aW0uIEZlcnJpIHF1aWRhbSBkZWxlbml0aSBxdW8gZWEsIGR1b1xuICAgICAgICAgICAgICAgICAgICBhbmltYWwgYWNjdXNhbXVzIGV1LCBjaWJvIGVycm9yaWJ1cyBldCBtZWEuIEV4IGVhbSB3aXNpIGFkbW9kdW0gcHJhZXNlbnQsIGhhcyBjdSBvYmxpcXVlIGNldGVyb3NcbiAgICAgICAgICAgICAgICAgICAgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuIGVzdCwgZXQgYXV0ZW1cbiAgICAgICAgICAgICAgICAgICAgb21uZXMgY2l2aWJ1cyBtZWwuIE1lbCBldSB1YmlxdWUgZXF1aWRlbSBtb2xlc3RpYWUsIGNob3JvIGRvY2VuZGkgbW9kZXJhdGl1cyBlaSBuYW0uPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTNcIj5cbiAgICAgICAgICAgICAgICA8aDM+VGhpcmQgVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5JJ20gZGlzYWJsZWQsIHlvdSBzaG91bGRuJ3Qgc2VlIG1lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC00XCI+XG4gICAgICAgICAgICAgICAgPGgzPkZvdXJ0aCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkFjY29yZGlvbjwvaDI+XG5cbiAgICAgICAgICAgIDx1aS1hY2NvcmRpb24+XG5cbiAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLXBhbmVsIGlkPVwiY3VzdG9tLXBhbmVsLWlkXCIgZXhwYW5kZWQgbGV2ZWw9XCIzXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1oZWFkZXI+UGFuZWwgT25lPC91aS1hY2NvcmRpb24taGVhZGVyPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LlxuICAgICAgICAgICAgICAgICAgICAgICAgTGF1ZGVtIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3VzYWJvIGFuIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD5BdCB1c3UgZXBpY3VyZWkgYXNzZW50aW9yLCBwdXRlbnQgZGlzc2VudGlldCByZXB1ZGlhbmRhZSBlYSBxdW8uIFBybyBuZSBkZWJpdGlzIHBsYWNlcmF0XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduaWZlcnVtcXVlLCBpbiBzb25ldCB2b2x1bXVzIGludGVycHJldGFyaXMgY3VtLiBEb2xvcnVtIGFwcGV0ZXJlIG5lIHF1by4gRGljdGEgcXVhbGlzcXVlIGVvc1xuICAgICAgICAgICAgICAgICAgICAgICAgZWEsIGVhbSBhdCBudWxsYSB0YW1xdWFtLlxuICAgICAgICAgICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgICAgICA8L3VpLWFjY29yZGlvbi1wYW5lbD5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgbGV2ZWw9XCIzXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1oZWFkZXI+UGFuZWwgVHdvPC91aS1hY2NvcmRpb24taGVhZGVyPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1byBhbmltYWwgYWNjdXNhbXVzIGV1LCBjaWJvIGVycm9yaWJ1cyBldCBtZWEuIEV4IGVhbSB3aXNpIGFkbW9kdW0gcHJhZXNlbnQsIGhhcyBjdSBvYmxpcXVlXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXRlcm9zIGVsZWlmZW5kLiBFeCBtZWwgcGxhdG9uZW0gYXNzZW50aW9yIHBlcnNlcXVlcmlzLCB2aXggY2libyBsaWJyaXMgdXQuIEFkIHRpbWVhbSBhY2N1bXNhblxuICAgICAgICAgICAgICAgICAgICAgICAgZXN0LCBldCBhdXRlbSBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW0uPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD5RdWkgc3VhcyBzb2xldCBjZXRlcm9zIGN1LCBwZXJ0aW5heCB2dWxwdXRhdGUgZGV0ZXJydWlzc2V0IGVvcyBuZS4gTmUgaXVzIHZpZGUgbnVsbGFtLCBhbGllbnVtXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhZSByZWZvcm1pZGFucyBjdW0gYWQuIEVhIG1lbGlvcmUgc2FwaWVudGVtIGludGVycHJldGFyaXMgZWFtLiBDb21tdW5lIGRlbGljYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICByZXB1ZGlhbmRhZSBpbiBlb3MsIHBsYWNlcmF0IGluY29ycnVwdGUgZGVmaW5pdGlvbmVzIG5lYyBleC4gQ3UgZWxpdHIgdGFudGFzIGluc3RydWN0aW9yIHNpdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV1IGV1bSBhbGlhIGdyYWVjZSBuZWdsZWdlbnR1ci48L3A+XG5cbiAgICAgICAgICAgICAgICA8L3VpLWFjY29yZGlvbi1wYW5lbD5cblxuICAgICAgICAgICAgPC91aS1hY2NvcmRpb24+XG5cbiAgICAgICAgICAgIDxoMj5Qb3BvdmVyPC9oMj5cblxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInBvcG92ZXJcIj5TaG93IFBvcG92ZXI8L2J1dHRvbj5cblxuICAgICAgICAgICAgPHVpLW92ZXJsYXkgdHJpZ2dlcj1cInBvcG92ZXJcIj5cbiAgICAgICAgICAgICAgICA8IS0tIDx0ZW1wbGF0ZT4gLS0+XG4gICAgICAgICAgICAgICAgICAgIDxoMz5Qb3BvdmVyPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgPHA+VGhpcyBpcyB0aGUgY29udGVudCBvZiB0aGUgcG9wb3ZlcjogJHsgZWxlbWVudC5jb3VudGVyIH08L3A+XG4gICAgICAgICAgICAgICAgPCEtLSA8L3RlbXBsYXRlPiAtLT5cbiAgICAgICAgICAgIDwvdWktb3ZlcmxheT5cblxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIm92ZXJsYXktcHJvZ3JhbW1hdGljXCIgQGNsaWNrPSR7IGVsZW1lbnQuc2hvd092ZXJsYXkgfT5TaG93IHByb2dyYW1tYXRpYyBvdmVybGF5PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgPC9tYWluPlxuICAgIGA7XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuLy8gd2UgY2FuIGRlZmluZSBtaXhpbnMgYXNcbmNvbnN0IG1peGluQ29udGFpbmVyOiAoYmFja2dyb3VuZD86IHN0cmluZykgPT4gc3RyaW5nID0gKGJhY2tncm91bmQ6IHN0cmluZyA9ICcjZmZmJykgPT4gY3NzYFxuICAgIGJhY2tncm91bmQ6ICR7IGJhY2tncm91bmQgfTtcbiAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbmA7XG5cbmNvbnN0IHN0eWxlID0gY3NzYFxuOmhvc3Qge1xuICAgIC0tbWF4LXdpZHRoOiA0MGNoO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1mbG93OiBjb2x1bW47XG4gICAgbWF4LXdpZHRoOiB2YXIoLS1tYXgtd2lkdGgpO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgLyogd2UgY2FuIGFwcGx5IG1peGlucyB3aXRoIHNwcmVhZCBzeW50YXggKi9cbiAgICAkeyBtaXhpbkNvbnRhaW5lcigpIH1cbn1cbjo6c2xvdHRlZCgqKSB7XG4gICAgbWFyZ2luOiAwO1xufVxuYDtcblxuQGNvbXBvbmVudDxDYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1jYXJkJyxcbiAgICBzdHlsZXM6IFtzdHlsZV0sXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1oZWFkZXJcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1mb290ZXJcIj48L3Nsb3Q+XG4gICAgPGRpdj5Xb3JrZXIgY291bnRlcjogJHsgY2FyZC5jb3VudGVyIH08L2Rpdj5cbiAgICA8YnV0dG9uPlN0b3Agd29ya2VyPC9idXR0b24+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDYXJkIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIhOiBudW1iZXI7XG5cbiAgICB3b3JrZXIhOiBXb3JrZXI7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnY2xpY2snLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSE7IH1cbiAgICB9KVxuICAgIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnbWVzc2FnZScsXG4gICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy53b3JrZXI7IH1cbiAgICB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKGV2ZW50OiBNZXNzYWdlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY291bnRlciA9IGV2ZW50LmRhdGEpO1xuICAgIH1cbn1cblxuQGNvbXBvbmVudDxBY3Rpb25DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY3Rpb24tY2FyZCcsXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2FyZCBleHRlbmRzIENhcmQge1xuXG4gICAgLy8gd2UgY2FuIGluaGVyaXQgc3R5bGVzIGV4cGxpY2l0bHlcbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICAgICAgICAnc2xvdFtuYW1lPXVpLWFjdGlvbi1jYXJkLWFjdGlvbnNdIHsgZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IHJpZ2h0OyB9J1xuICAgICAgICBdXG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6IG51bGwgfSlcbiAgICBoYW5kbGVDbGljayAoKSB7IH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlTWVzc2FnZSAoKSB7IH1cbn1cblxuQGNvbXBvbmVudDxQbGFpbkNhcmQ+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXBsYWluLWNhcmQnLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgOmhvc3Qge1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBtYXgtd2lkdGg6IDQwY2g7XG4gICAgICAgIH1gXG4gICAgXVxuICAgIC8vIGlmIHdlIGRvbid0IHNwZWNpZnkgYSB0ZW1wbGF0ZSwgaXQgd2lsbCBiZSBpbmhlcml0ZWRcbn0pXG5leHBvcnQgY2xhc3MgUGxhaW5DYXJkIGV4dGVuZHMgQ2FyZCB7IH1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIGNvbXBvbmVudCwgQ29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgfVxuICAgICAgICAuY2hlY2stbWFyayB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDAuMjVyZW07XG4gICAgICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDAuNjI1cmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMCAwIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsXG4gICAgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIENoYW5nZXMsIENvbXBvbmVudCxcbiAgICBjb21wb25lbnQsXG4gICAgY3NzLFxuICAgIGxpc3RlbmVyLFxuICAgIHByb3BlcnR5XG59IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgVGFiUGFuZWwgfSBmcm9tICcuL3RhYi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgcGFkZGluZzogMC41cmVtIDAuNXJlbTtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIDAgMDtcbiAgICAgICAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1zZWxlY3RlZD10cnVlXSk6YWZ0ZXIge1xuICAgICAgICBjb250ZW50OiAnJztcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgYm90dG9tOiBjYWxjKC0xICogdmFyKC0tYm9yZGVyLXdpZHRoKSk7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tYm9yZGVyLXdpZHRoKSArIDAuNXJlbSk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWIgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJpdmF0ZSBfcGFuZWw6IFRhYlBhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIF9zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtY29udHJvbHMnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogV2UgcHJvdmlkZSBvdXIgb3duIHRhYmluZGV4IHByb3BlcnR5LCBzbyB3ZSBjYW4gc2V0IGl0IHRvIGBudWxsYFxuICAgICAqIHRvIHJlbW92ZSB0aGUgdGFiaW5kZXgtYXR0cmlidXRlLlxuICAgICAqL1xuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ3RhYmluZGV4JyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtc2VsZWN0ZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgc2VsZWN0ZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAodmFsdWUgPyAwIDogLTEpO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6ICh0aGlzLnNlbGVjdGVkID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBnZXQgcGFuZWwgKCk6IFRhYlBhbmVsIHwgbnVsbCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuXG4gICAgICAgICAgICB0aGlzLl9wYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udHJvbHMpIGFzIFRhYlBhbmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWInXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IC0xO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYW5lbCkgdGhpcy5wYW5lbC5sYWJlbGxlZEJ5ID0gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBkZXNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSBmYWxzZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBBcnJvd0Rvd24gfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IEFjdGl2ZUl0ZW1DaGFuZ2UsIEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi90YWInO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1saXN0JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdyBub3dyYXA7XG4gICAgfVxuICAgIDo6c2xvdHRlZCh1aS10YWIpIHtcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjI1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWJMaXN0IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8VGFiPjtcblxuICAgIHByb3RlY3RlZCBzZWxlY3RlZFRhYiE6IFRhYjtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJsaXN0JztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFRhYi5zZWxlY3RvciksICdob3Jpem9udGFsJyk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGNvbnN0IHNsb3QgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3Rvcignc2xvdCcpIGFzIEhUTUxTbG90RWxlbWVudDtcblxuICAgICAgICAgICAgLy8gc2xvdC5hZGRFdmVudExpc3RlbmVyKCdzbG90Y2hhbmdlJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coYCR7c2xvdC5uYW1lfSBjaGFuZ2VkLi4uYCwgc2xvdC5hc3NpZ25lZE5vZGVzKCkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5xdWVyeVNlbGVjdG9yKGAkeyBUYWIuc2VsZWN0b3IgfVthcmlhLXNlbGVjdGVkPXRydWVdYCkgYXMgVGFiO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRhYlxuICAgICAgICAgICAgICAgID8gdGhpcy5mb2N1c01hbmFnZXIuc2V0QWN0aXZlSXRlbShzZWxlY3RlZFRhYilcbiAgICAgICAgICAgICAgICA6IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuXG4gICAgICAgICAgICAvLyBzZXR0aW5nIHRoZSBhY3RpdmUgaXRlbSB2aWEgdGhlIGZvY3VzIG1hbmFnZXIncyBBUEkgd2lsbCBub3QgdHJpZ2dlciBhbiBldmVudFxuICAgICAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBtYW51YWxseSBzZWxlY3QgdGhlIGluaXRpYWxseSBhY3RpdmUgdGFiXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuc2VsZWN0VGFiKHRoaXMuZm9jdXNNYW5hZ2VyLmdldEFjdGl2ZUl0ZW0oKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdrZXlkb3duJyB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgQXJyb3dEb3duOlxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSB0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkVGFiICYmIHNlbGVjdGVkVGFiLnBhbmVsKSBzZWxlY3RlZFRhYi5wYW5lbC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyPFRhYkxpc3Q+KHtcbiAgICAgICAgZXZlbnQ6ICdhY3RpdmUtaXRlbS1jaGFuZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZm9jdXNNYW5hZ2VyOyB9XG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlQWN0aXZlVGFiQ2hhbmdlIChldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUYWI+KSB7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNUYWIgPSBldmVudC5kZXRhaWwucHJldmlvdXMuaXRlbTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSBldmVudC5kZXRhaWwuY3VycmVudC5pdGVtO1xuXG4gICAgICAgIGlmIChwcmV2aW91c1RhYiAhPT0gc2VsZWN0ZWRUYWIpIHtcblxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFRhYihwcmV2aW91c1RhYik7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdFRhYihzZWxlY3RlZFRhYik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5zZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRlc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5kZXNlbGVjdCgpO1xuXG4gICAgICAgICAgICBpZiAodGFiLnBhbmVsKSB0YWIucGFuZWwuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDAgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cyk7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1oaWRkZW4nLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtbGFiZWxsZWRieScsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgbGFiZWxsZWRCeSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJwYW5lbCdcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxUb2dnbGU+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRvZ2dsZScsXG4gICAgdGVtcGxhdGU6IHRvZ2dsZSA9PiBodG1sYFxuICAgIDxzdHlsZT5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgICAgLS10aW1pbmctY3ViaWM6IGN1YmljLWJlemllcigwLjU1LCAwLjA2LCAwLjY4LCAwLjE5KTtcbiAgICAgICAgICAgIC0tdGltaW5nLXNpbmU6IGN1YmljLWJlemllcigwLjQ3LCAwLCAwLjc1LCAwLjcyKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi10aW1pbmc6IHZhcigtLXRpbWluZy1zaW5lKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi1kdXJhdGlvbjogLjFzO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCh2YXIoLS1mb250LXNpemUpLCAxZnIpKTtcblxuICAgICAgICAgICAgbWluLXdpZHRoOiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKiAyICsgdmFyKC0tYm9yZGVyLXdpZHRoKSAqIDIpO1xuICAgICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKyB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSAqIDIpO1xuICAgICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICAgICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG5cbiAgICAgICAgICAgIC8qIHRyYW5zaXRpb24tcHJvcGVydHk6IGJhY2tncm91bmQtY29sb3IsIGJvcmRlci1jb2xvcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tZHVyYXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pO1xuICAgICAgICAgICAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTsgKi9cbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPXRydWVdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2xhYmVsLW9uXVtsYWJlbC1vZmZdKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgICAgICB9XG4gICAgICAgIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgaGVpZ2h0OiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgd2lkdGg6IHZhcigtLWZvbnQtc2l6ZSk7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICB3aWR0aDogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAwO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXVtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgfVxuICAgICAgICAubGFiZWwge1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgcGFkZGluZzogMCAuMjVyZW07XG4gICAgICAgICAgICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAganVzdGlmeS1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAubGFiZWwtb24ge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJmYWxzZVwiXSkgLmxhYmVsLW9mZiB7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgIH1cblxuICAgIDwvc3R5bGU+XG4gICAgPHNwYW4gY2xhc3M9XCJ0b2dnbGUtdGh1bWJcIj48L3NwYW4+XG4gICAgJHsgdG9nZ2xlLmxhYmVsT24gJiYgdG9nZ2xlLmxhYmVsT2ZmXG4gICAgICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vZmZcIj4keyB0b2dnbGUubGFiZWxPZmYgfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9uXCI+JHsgdG9nZ2xlLmxhYmVsT24gfTwvc3Bhbj5gXG4gICAgICAgICAgICA6ICcnXG4gICAgICAgIH1cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIFRvZ2dsZSBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNoZWNrZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZ1xuICAgIH0pXG4gICAgbGFiZWwgPSAnJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6IGZhbHNlXG4gICAgfSlcbiAgICBsYWJlbE9uID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPZmYgPSAnJztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdzd2l0Y2gnO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICAvLyB0cmlnZ2VyIHByb3BlcnR5LWNoYW5nZSBldmVudCBmb3IgYGNoZWNrZWRgXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBFbnRlciB8fCBldmVudC5rZXkgPT09IFNwYWNlKSB7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgIC8vIHByZXZlbnQgc3BhY2Uga2V5IGZyb20gc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW50ZXJmYWNlIFBvc2l0aW9uIHtcbiAgICB0b3A6IHN0cmluZztcbiAgICByaWdodDogc3RyaW5nO1xuICAgIGJvdHRvbTogc3RyaW5nO1xuICAgIGxlZnQ6IHN0cmluZztcbiAgICB3aWR0aDogc3RyaW5nO1xuICAgIGhlaWdodDogc3RyaW5nO1xuICAgIG1heFdpZHRoOiBzdHJpbmc7XG4gICAgbWF4SGVpZ2h0OiBzdHJpbmc7XG4gICAgb2Zmc2V0SG9yaXpvbnRhbDogc3RyaW5nO1xuICAgIG9mZnNldFZlcnRpY2FsOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OOiBQb3NpdGlvbiA9IHtcbiAgICB0b3A6ICcnLFxuICAgIGxlZnQ6ICcnLFxuICAgIGJvdHRvbTogJycsXG4gICAgcmlnaHQ6ICcnLFxuICAgIHdpZHRoOiAnYXV0bycsXG4gICAgaGVpZ2h0OiAnYXV0bycsXG4gICAgbWF4V2lkdGg6ICdhdXRvJyxcbiAgICBtYXhIZWlnaHQ6ICdhdXRvJyxcbiAgICBvZmZzZXRIb3Jpem9udGFsOiAnJyxcbiAgICBvZmZzZXRWZXJ0aWNhbDogJycsXG59O1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBwcm90ZWN0ZWQgYW5pbWF0aW9uRnJhbWU6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBkZWZhdWx0UG9zaXRpb246IFBvc2l0aW9uO1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRQb3NpdGlvbjogUG9zaXRpb247XG5cbiAgICBwcm90ZWN0ZWQgbmV4dFBvc2l0aW9uOiBQb3NpdGlvbiB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudCwgZGVmYXVsdFBvc2l0aW9uOiBQb3NpdGlvbiA9IERFRkFVTFRfUE9TSVRJT04pIHtcblxuICAgICAgICB0aGlzLmRlZmF1bHRQb3NpdGlvbiA9IHsgLi4uREVGQVVMVF9QT1NJVElPTiwgLi4uZGVmYXVsdFBvc2l0aW9uIH07XG4gICAgICAgIHRoaXMuY3VycmVudFBvc2l0aW9uID0gdGhpcy5kZWZhdWx0UG9zaXRpb247XG4gICAgfVxuXG4gICAgdXBkYXRlUG9zaXRpb24gKHBvc2l0aW9uPzogUGFydGlhbDxQb3NpdGlvbj4pIHtcblxuICAgICAgICB0aGlzLm5leHRQb3NpdGlvbiA9IHBvc2l0aW9uID8geyAuLi50aGlzLmN1cnJlbnRQb3NpdGlvbiwgLi4ucG9zaXRpb24gfSA6IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcblxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0aGlzLm5leHRQb3NpdGlvbiB8fCB0aGlzLmdldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29tcGFyZVBvc2l0aW9ucyh0aGlzLmN1cnJlbnRQb3NpdGlvbiwgbmV4dFBvc2l0aW9uKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3kgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG5cbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xuXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50b3AgPSBwb3NpdGlvbi50b3A7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0O1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5ib3R0b20gPSBwb3NpdGlvbi5ib3R0b207XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnJpZ2h0ID0gcG9zaXRpb24ucmlnaHQ7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoID0gcG9zaXRpb24ud2lkdGg7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmhlaWdodCA9IHBvc2l0aW9uLmhlaWdodDtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUubWF4V2lkdGggPSBwb3NpdGlvbi5tYXhXaWR0aDtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUubWF4SGVpZ2h0ID0gcG9zaXRpb24ubWF4SGVpZ2h0O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb21wYXJlUG9zaXRpb25zIChwb3NpdGlvbjogUG9zaXRpb24sIG90aGVyUG9zaXRpb246IFBvc2l0aW9uKTogYm9vbGVhbiB7XG5cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBvc2l0aW9uKTtcblxuICAgICAgICByZXR1cm4gIWtleXMuZmluZCgoa2V5ID0+IHBvc2l0aW9uW2tleSBhcyBrZXlvZiBQb3NpdGlvbl0gIT09IG90aGVyUG9zaXRpb25ba2V5IGFzIGtleW9mIFBvc2l0aW9uXSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgIHByb3RlY3RlZCB1cGRhdGVMaXN0ZW5lciE6IEV2ZW50TGlzdGVuZXI7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIHB1YmxpYyBvcmlnaW46IEhUTUxFbGVtZW50LCBkZWZhdWx0UG9zaXRpb246IFBvc2l0aW9uID0gREVGQVVMVF9QT1NJVElPTikge1xuXG4gICAgICAgIHN1cGVyKHRhcmdldCwgZGVmYXVsdFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVyID0gKCkgPT4gdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy51cGRhdGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzdHJveSAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy51cGRhdGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luOiBDbGllbnRSZWN0ID0gdGhpcy5vcmlnaW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnRoaXMuZGVmYXVsdFBvc2l0aW9uLFxuICAgICAgICAgICAgdG9wOiBgJHsgb3JpZ2luLmJvdHRvbSB9cHhgLFxuICAgICAgICAgICAgbGVmdDogYCR7IG9yaWdpbi5sZWZ0IH1weGAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgICAgIHN1cGVyLmFwcGx5UG9zaXRpb24oeyAuLi5wb3NpdGlvbiwgdG9wOiAnJywgbGVmdDogJycsIGJvdHRvbTogJycsIHJpZ2h0OiAnJyB9KTtcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7IHBvc2l0aW9uLmxlZnQgfSwgJHsgcG9zaXRpb24udG9wIH0pYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0ZJWEVEOiBQb3NpdGlvbiA9IHtcbiAgICAuLi5ERUZBVUxUX1BPU0lUSU9OLFxuICAgIHRvcDogJzUwdmgnLFxuICAgIGxlZnQ6ICc1MHZ3JyxcbiAgICBvZmZzZXRIb3Jpem9udGFsOiAnLTUwJScsXG4gICAgb2Zmc2V0VmVydGljYWw6ICctNTAlJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBGaXhlZFBvc2l0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudCwgZGVmYXVsdFBvc2l0aW9uOiBQb3NpdGlvbiA9IERFRkFVTFRfUE9TSVRJT05fRklYRUQpIHtcblxuICAgICAgICBzdXBlcih0YXJnZXQsIGRlZmF1bHRQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBzdXBlci5hcHBseVBvc2l0aW9uKHBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7IHBvc2l0aW9uLm9mZnNldEhvcml6b250YWwsIHBvc2l0aW9uLm9mZnNldFZlcnRpY2FsIH0pYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFBvc2l0aW9uU3RyYXRlZ3lUeXBlIHtcbiAgICBGaXhlZCA9ICdmaXhlZCcsXG4gICAgQ29ubmVjdGVkID0gJ2Nvbm5lY3RlZCcsXG59XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG5cbiAgICBjcmVhdGVQb3NpdGlvblN0cmF0ZWd5ICh0eXBlOiBQb3NpdGlvblN0cmF0ZWd5VHlwZSwgLi4uYXJnczogYW55W10pOiBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSBQb3NpdGlvblN0cmF0ZWd5VHlwZS5Db25uZWN0ZWQ6XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3koLi4uYXJncyBhcyBbSFRNTEVsZW1lbnQsIEhUTUxFbGVtZW50XSk7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpeGVkUG9zaXRpb25TdHJhdGVneSguLi5hcmdzIGFzIFtIVE1MRWxlbWVudF0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25NYW5hZ2VyIHtcblxuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgc3RyYXRlZ3k6IFBvc2l0aW9uU3RyYXRlZ3kpIHsgfVxuXG4gICAgdXBkYXRlUG9zaXRpb24gKHBvc2l0aW9uPzogUGFydGlhbDxQb3NpdGlvbj4pIHtcblxuICAgICAgICB0aGlzLnN0cmF0ZWd5LnVwZGF0ZVBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBkZXN0cm95ICgpIHtcblxuICAgICAgICB0aGlzLnN0cmF0ZWd5LmRlc3Ryb3koKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCwgcmVuZGVyIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gJy4uL3RlbXBsYXRlLWZ1bmN0aW9uJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlDb25maWcge1xuICAgIHBvc2l0aW9uOiAnZml4ZWQnIHwgJ2Nvbm5lY3RlZCcsXG4gICAgYmFja2Ryb3A6IGJvb2xlYW47XG4gICAgY2xvc2VPbkVzY2FwZTogYm9vbGVhbjtcbiAgICBjbG9zZU9uQmFja2Ryb3BDbGljazogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlTZXJ2aWNlIHtcblxuICAgIHN0YXRpYyBpbnN0YW5jZTogT3ZlcmxheVNlcnZpY2UgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgb3ZlcmxheXMgPSBuZXcgTWFwPE92ZXJsYXksICgpID0+IHZvaWQ+KCk7XG5cbiAgICBjb25zdHJ1Y3RvciAoKSB7XG5cbiAgICAgICAgaWYgKCFPdmVybGF5U2VydmljZS5pbnN0YW5jZSkge1xuXG4gICAgICAgICAgICBPdmVybGF5U2VydmljZS5pbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gT3ZlcmxheVNlcnZpY2UuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgaGFzT3Blbk92ZXJsYXlzICgpIHtcblxuICAgICAgICByZXR1cm4gWy4uLnRoaXMub3ZlcmxheXNdLmZpbmQoKFtvdmVybGF5XSkgPT4gIW92ZXJsYXkuaGlkZGVuKTtcbiAgICB9XG5cbiAgICBjcmVhdGVPdmVybGF5ICh0ZW1wbGF0ZTogVGVtcGxhdGVGdW5jdGlvbiwgY29udGV4dD86IENvbXBvbmVudCk6IE92ZXJsYXkge1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KE92ZXJsYXkuc2VsZWN0b3IpIGFzIE92ZXJsYXk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcblxuICAgICAgICBjb250ZXh0ID0gY29udGV4dCB8fCBvdmVybGF5O1xuXG4gICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5LCB0ZW1wbGF0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgLy8gdG8ga2VlcCBhIHRlbXBsYXRlIHVwLXRvLWRhdGUgd2l0aCBpdCdzIGNvbnRleHQsIHdlIGhhdmUgdG8gcmVuZGVyIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAvLyBldmVyeXRpbWUgdGhlIGNvbnRleHQgcmVuZGVycyAtIHRoYXQgaXMsIG9uIGV2ZXJ5IHVwZGF0ZSB3aGljaCB3YXMgdHJpZ2dlcmVkXG4gICAgICAgIGNvbnN0IHVwZGF0ZUxpc3RlbmVyID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0aGUgb3ZlcmxheSBoYXNuJ3QgYmVlbiBkZXN0cm95ZWQgeWV0XG4gICAgICAgICAgICBpZiAodGhpcy5vdmVybGF5cy5oYXMob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5LCB0ZW1wbGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEgY29tcG9uZW50J3MgJ3VwZGF0ZScgZXZlbnQgdG8gcmUtcmVuZGVyIHRoZSB0ZW1wbGF0ZSBvbiBldmVyeSBjb250ZXh0IHVwZGF0ZVxuICAgICAgICAvLyBsaXQtaHRtbCB3aWxsIHRha2UgY2FyZSBvZiBlZmZpY2llbnRseSB1cGRhdGluZyB0aGUgRE9NXG4gICAgICAgIGNvbnRleHQuYWRkRXZlbnRMaXN0ZW5lcigndXBkYXRlJywgdXBkYXRlTGlzdGVuZXIpO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheXMuc2V0KG92ZXJsYXksICgpID0+IGNvbnRleHQhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyKSk7XG5cbiAgICAgICAgcmV0dXJuIG92ZXJsYXk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5cy5zZXQob3ZlcmxheSwgKCkgPT4geyB9KTtcbiAgICB9XG5cbiAgICBvcGVuT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIG92ZXJsYXkub3BlbigpO1xuICAgIH1cblxuICAgIGNsb3NlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIG92ZXJsYXkuY2xvc2UoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95T3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZGlzY29ubmVjdDogYm9vbGVhbiA9IHRydWUpIHtcblxuICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICBjb25zdCB0ZWFyZG93biA9IHRoaXMub3ZlcmxheXMuZ2V0KG92ZXJsYXkpO1xuXG4gICAgICAgIGlmICh0ZWFyZG93bikgdGVhcmRvd24oKTtcblxuICAgICAgICBpZiAoZGlzY29ubmVjdCAmJiBvdmVybGF5LnBhcmVudEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgb3ZlcmxheS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vdmVybGF5cy5kZWxldGUob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlbmRlck92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIHRlbXBsYXRlOiBUZW1wbGF0ZUZ1bmN0aW9uLCBjb250ZXh0PzogQ29tcG9uZW50KSB7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGVtcGxhdGUoY29udGV4dCB8fCBvdmVybGF5KSB8fCBodG1sYGA7XG5cbiAgICAgICAgcmVuZGVyKHJlc3VsdCwgb3ZlcmxheSwgeyBldmVudENvbnRleHQ6IGNvbnRleHQgfHwgb3ZlcmxheSB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gXCJAcGFydGtpdC9jb21wb25lbnRcIjtcbmltcG9ydCB7IGh0bWwgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IENvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksIFBvc2l0aW9uTWFuYWdlciwgUG9zaXRpb25TdHJhdGVneSwgRml4ZWRQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSBcIi4uL3Bvc2l0aW9uLW1hbmFnZXJcIjtcbmltcG9ydCB7IE92ZXJsYXlTZXJ2aWNlIH0gZnJvbSBcIi4vb3ZlcmxheS1zZXJ2aWNlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGlkZGVuQ2hhbmdlRXZlbnQgZXh0ZW5kcyBDdXN0b21FdmVudCB7XG4gICAgdHlwZTogJ2hpZGRlbi1jaGFuZ2UnO1xuICAgIGRldGFpbDoge1xuICAgICAgICBoaWRkZW46IGJvb2xlYW47XG4gICAgfVxufVxuXG5AY29tcG9uZW50PE92ZXJsYXk+KHtcbiAgICBzZWxlY3RvcjogJ3VpLW92ZXJsYXknLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIGJvcmRlcjogMnB4IHNvbGlkICNiZmJmYmY7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtaGlkZGVuPXRydWVdKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICAgIHdpbGwtY2hhbmdlOiBhdXRvO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGBcbiAgICA8c2xvdD48L3Nsb3Q+XG4gICAgYCxcbn0pXG5leHBvcnQgY2xhc3MgT3ZlcmxheSBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgdGVtcGxhdGVPYnNlcnZlciE6IE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgICBwcm90ZWN0ZWQgdGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWhpZGRlbicsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sXG4gICAgICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGZhbHNlLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICB0cmlnZ2VyITogc3RyaW5nO1xuXG4gICAgcG9zaXRpb25TdHJhdGVneTogUG9zaXRpb25TdHJhdGVneSA9IG5ldyBGaXhlZFBvc2l0aW9uU3RyYXRlZ3kodGhpcyk7XG5cbiAgICBwcm90ZWN0ZWQgdHJpZ2dlckVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm90ZWN0ZWQgdHJpZ2dlckxpc3RlbmVyOiBFdmVudExpc3RlbmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm90ZWN0ZWQgcG9zaXRpb25NYW5hZ2VyITogUG9zaXRpb25NYW5hZ2VyO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnZGlhbG9nJztcblxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XG5cbiAgICAgICAgLy8gdGhpcy5wb3NpdGlvbk1hbmFnZXIgPSBuZXcgUG9zaXRpb25NYW5hZ2VyKG5ldyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KHRoaXMsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMudHJpZ2dlcikhKSk7XG4gICAgICAgIHRoaXMucG9zaXRpb25NYW5hZ2VyID0gbmV3IFBvc2l0aW9uTWFuYWdlcih0aGlzLnBvc2l0aW9uU3RyYXRlZ3kpO1xuXG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3RlbXBsYXRlJyk7XG5cbiAgICAgICAgaWYgKHRoaXMudGVtcGxhdGUpIHtcblxuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9uczogTXV0YXRpb25SZWNvcmRbXSwgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIpID0+IHRoaXMudXBkYXRlVGVtcGxhdGUoKSk7XG5cbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVPYnNlcnZlci5vYnNlcnZlKFxuICAgICAgICAgICAgICAgIC8vIHdlIGNhbid0IG9ic2VydmUgYSB0ZW1wbGF0ZSBkaXJlY3RseSwgYnV0IHRoZSBEb2N1bWVudEZyYWdtZW50IHN0b3JlZCBpbiBpdHMgY29udGVudCBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuY29udGVudCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5yZWdpc3Rlck92ZXJsYXkodGhpcyk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uTWFuYWdlcikgdGhpcy5wb3NpdGlvbk1hbmFnZXIuZGVzdHJveSgpO1xuICAgICAgICBpZiAodGhpcy50ZW1wbGF0ZU9ic2VydmVyKSB0aGlzLnRlbXBsYXRlT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UuZGVzdHJveU92ZXJsYXkodGhpcywgZmFsc2UpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChjaGFuZ2VzLmhhcygndHJpZ2dlcicpKSB7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlVHJpZ2dlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnRyaWdnZXIpISk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvcGVuICgpIHtcblxuICAgICAgICBpZiAodGhpcy5oaWRkZW4pIHtcblxuICAgICAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmhpZGRlbiA9IGZhbHNlKTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVUZW1wbGF0ZSgpO1xuXG4gICAgICAgICAgICB0aGlzLnJlcG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudHJpZ2dlckVsZW1lbnQpIHRoaXMudHJpZ2dlckVsZW1lbnQhLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhpZGRlbikge1xuXG4gICAgICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuaGlkZGVuID0gdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRyaWdnZXJFbGVtZW50KSB0aGlzLnRyaWdnZXJFbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGlkZGVuKSB7XG5cbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlcG9zaXRpb24gKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uTWFuYWdlcikge1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uTWFuYWdlci51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVRyaWdnZXIgKHRyaWdnZXJFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuXG4gICAgICAgIGlmICh0aGlzLnRyaWdnZXJFbGVtZW50ICYmIHRoaXMudHJpZ2dlckxpc3RlbmVyKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRyaWdnZXJMaXN0ZW5lcikgdGhpcy50cmlnZ2VyRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudHJpZ2dlckxpc3RlbmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlckVsZW1lbnQgPSB0cmlnZ2VyRWxlbWVudDtcbiAgICAgICAgdGhpcy50cmlnZ2VyTGlzdGVuZXIgPSAoZXZlbnQpID0+IHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudHJpZ2dlckxpc3RlbmVyKTtcblxuICAgICAgICB0aGlzLnRyaWdnZXJFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcsICdkaWFsb2cnKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLmhpZGRlbiA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVUZW1wbGF0ZSAoKSB7XG5cbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRoaXMucXVlcnlTZWxlY3RvcigndGVtcGxhdGUnKTtcblxuICAgICAgICBpZiAodGhpcy50ZW1wbGF0ZSAmJiAhdGhpcy5oaWRkZW4pIHtcblxuICAgICAgICAgICAgY29uc3QgY29udGVudFNsb3QgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3Rvcignc2xvdCcpIGFzIEhUTUxTbG90RWxlbWVudDtcblxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIGNvbnRlbnRTbG90LmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgICAgICAgICAgLy8gY29udGVudFNsb3QuYXBwZW5kQ2hpbGQodGhpcy50ZW1wbGF0ZSEuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICAgICAgICAgIGNvbnRlbnRTbG90LmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZSEuY29udGVudCwgdHJ1ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0ICcuL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSAnLi9hcHAuc3R5bGVzJztcbmltcG9ydCB7IHRlbXBsYXRlIH0gZnJvbSAnLi9hcHAudGVtcGxhdGUnO1xuaW1wb3J0ICcuL2NhcmQnO1xuaW1wb3J0ICcuL2NoZWNrYm94JztcbmltcG9ydCAnLi9pY29uL2ljb24nO1xuaW1wb3J0ICcuL3RhYnMvdGFiJztcbmltcG9ydCAnLi90YWJzL3RhYi1saXN0JztcbmltcG9ydCAnLi90YWJzL3RhYi1wYW5lbCc7XG5pbXBvcnQgJy4vdG9nZ2xlJztcbmltcG9ydCAnLi9vdmVybGF5L292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuL292ZXJsYXkvb3ZlcmxheS1zZXJ2aWNlJztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi9vdmVybGF5L292ZXJsYXknO1xuaW1wb3J0IHsgQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB9IGZyb20gJy4vcG9zaXRpb24tbWFuYWdlcic7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGVtby1hcHAnLFxuICAgIHNoYWRvdzogZmFsc2UsXG4gICAgc3R5bGVzOiBbc3R5bGVzXSxcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbn0pXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgcHJvdGVjdGVkIG92ZXJsYXk/OiBPdmVybGF5O1xuXG4gICAgcHJvdGVjdGVkIHRpbWVvdXQhOiBudW1iZXI7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyID0gMDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuY291bnQoKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICB9XG5cbiAgICBjb25maXJtICgpIHtcblxuICAgICAgICBhbGVydChgWW91IGNvbmZpcm1lZCBhdCAkeyB0aGlzLmNvdW50ZXIgfS5gKTtcbiAgICB9XG5cbiAgICBjYW5jZWwgKCkge1xuXG4gICAgICAgIGFsZXJ0KGBZb3UgY2FuY2VsbGVkIGF0ICR7IHRoaXMuY291bnRlciB9LmApO1xuICAgIH1cblxuICAgIHNob3dPdmVybGF5ICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheSkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSB0ZW1wbGF0ZSBmdW5jdGlvbiBpbiB0aGUgYXBwIGNvbXBvbmVudCdzIGNvbnRleHRcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gKCkgPT4gaHRtbGBcbiAgICAgICAgICAgICAgICA8aDM+UHJvZ3JhbW1hdGljIE92ZXJsYXk8L2gzPlxuICAgICAgICAgICAgICAgIDxwPlRoaXMgaXMgdGhlIGNvbnRlbnQgb2YgdGhlIHBvcG92ZXI6ICR7IHRoaXMuY291bnRlciB9PC9wPlxuICAgICAgICAgICAgICAgIDxwPjxidXR0b24gQGNsaWNrPSR7IHRoaXMuY2xvc2VPdmVybGF5IH0+R290IGl0PC9idXR0b24+PC9wPlxuICAgICAgICAgICAgYDtcblxuICAgICAgICAgICAgLy8gcGFzcyB0aGUgdGVtcGxhdGUgZnVuY3Rpb24gYW5kIGEgcmVmZXJlbmNlIHRvIHRoZSB0ZW1wbGF0ZSdzIGNvbnRleHQgKHRoZSBhcHAgY29tcG9uZW50KVxuICAgICAgICAgICAgLy8gdG8gdGhlIG92ZXJsYXkgc2VydmljZVxuICAgICAgICAgICAgdGhpcy5vdmVybGF5ID0gdGhpcy5vdmVybGF5U2VydmljZS5jcmVhdGVPdmVybGF5KHRlbXBsYXRlLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2Uub3Blbk92ZXJsYXkodGhpcy5vdmVybGF5KTtcbiAgICB9XG5cbiAgICBjbG9zZU92ZXJsYXkgKCkge1xuXG4gICAgICAgIC8vIGlmICh0aGlzLm92ZXJsYXkpIHRoaXMub3ZlcmxheVNlcnZpY2UuY2xvc2VPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheSkge1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlTZXJ2aWNlLmRlc3Ryb3lPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb3VudCAoKSB7XG5cbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY291bnRlcisrO1xuXG4gICAgICAgICAgICB0aGlzLmNvdW50KCk7XG5cbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN0b3AgKCkge1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgfVxufVxuIiwiaW1wb3J0ICcuL3NyYy9hcHAnO1xuXG5mdW5jdGlvbiBib290c3RyYXAgKCkge1xuXG4gICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd1aS1jaGVja2JveCcpO1xuXG4gICAgaWYgKGNoZWNrYm94KSB7XG5cbiAgICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hlY2tlZC1jaGFuZ2VkJywgZXZlbnQgPT4gY29uc29sZS5sb2coKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwpKTtcbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYm9vdHN0cmFwKTtcbiJdLCJuYW1lcyI6WyJwcmVwYXJlQ29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLElBNkNPLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLO0lBQ2xDLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUM7O0lDN0RGO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVM7SUFDL0QsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLHlCQUF5QjtJQUNuRCxRQUFRLFNBQVMsQ0FBQztBQUNsQixJQVlBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFdBQVcsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksS0FBSztJQUM3RCxJQUFJLE9BQU8sS0FBSyxLQUFLLEdBQUcsRUFBRTtJQUMxQixRQUFRLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDcEMsUUFBUSxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLFFBQVEsS0FB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
