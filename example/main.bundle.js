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
     * Executes a task callback in the next macro-task and returns a Promise which will
     * resolve when the task was executed
     *
     * @remarks
     * Uses {@link setTimeout} to schedule the task callback in the next macro-task.
     * If the task is canceled before the next macro-task, the timeout is cleared and
     * the Promsie is rejected.
     *
     * @param task  The callback function to execute
     * @returns     A Promise which will resolve after the callback was executed
     */
    function macroTask(task) {
        let cancel;
        const promise = new Promise((resolve, reject) => {
            let timeout = setTimeout(() => runTask(task, resolve, reject), 0);
            cancel = () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = undefined;
                    reject(TASK_CANCELED_ERROR());
                }
            };
        });
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
                    const oldValue = getter.call(this);
                    setter.call(this, value);
                    // selectors are queried during the update cycle, this means, when they change
                    // we cannot trigger another update from within the current update cycle
                    // we need to schedule an update just after this update is over
                    // also, selectors are not properties, so they don't appear in the property maps
                    // that's why we invoke requestUpdate without any parameters
                    if (oldValue !== getter.call(this)) {
                        microTask(() => this.requestUpdate());
                    }
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
    const PropertyChangeDetectorDefault = (oldValue, newValue) => {
        // in case `oldValue` and `newValue` are `NaN`, `(NaN !== NaN)` returns `true`,
        // but `(NaN === NaN || NaN === NaN)` returns `false`
        return oldValue !== newValue && (oldValue === oldValue || newValue === newValue);
    };
    // TODO: add tests for change detectors
    // TODO: move change detector to own files?
    const PropertyChangeDetectorObject = (oldValue, newValue) => {
        const oldKeys = Object.keys(oldValue);
        const newKeys = Object.keys(newValue);
        return oldKeys.length !== newKeys.length || oldKeys.some(key => oldValue[key] !== newValue[key]);
    };
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
        observe: PropertyChangeDetectorDefault,
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
         * A boolean indicating if the component's update cycle was run at least once
         *
         * @remarks
         * This property is analogous to the {@link update} and {@link updateCallback} method's `firstUpdate` parameter.
         * It can be useful in situations where logic can't be run inside a component's update/updateCallback methods but
         * we still need to know if the component has updated already.
         *
         * @readonly
         */
        get hasUpdated() {
            return this._hasUpdated;
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
                this[property] = undefined;
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

            <event-order-demo></event-order-demo>
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
        minWidth: 'auto',
        minHeight: 'auto',
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
    function cancel(event) {
        event.preventDefault();
        event.stopPropagation();
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

    class PositionController extends Behavior {
        constructor(config) {
            super();
            this.config = config;
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
            const originBox = this.getBoundingBox(this.config.origin);
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
            const originWidth = (this.config.origin === 'viewport')
                ? window.innerWidth
                : (this.config.origin instanceof HTMLElement)
                    ? this.config.origin.clientWidth
                    : 'auto';
            const originHeight = (this.config.origin === 'viewport')
                ? window.innerHeight
                : (this.config.origin instanceof HTMLElement)
                    ? this.config.origin.clientHeight
                    : 'auto';
            return {
                width: (this.config.width === 'origin') ? originWidth : this.config.width,
                height: (this.config.height === 'origin') ? originHeight : this.config.height,
                maxWidth: (this.config.maxWidth === 'origin') ? originWidth : this.config.maxWidth,
                maxHeight: (this.config.maxHeight === 'origin') ? originHeight : this.config.maxWidth,
                minWidth: (this.config.minWidth === 'origin') ? originWidth : this.config.minWidth,
                minHeight: (this.config.minHeight === 'origin') ? originHeight : this.config.minHeight,
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

    function applyDefaults(config, defaults) {
        for (const key in defaults) {
            if (config[key] === undefined)
                config[key] = defaults[key];
        }
        return config;
    }
    //# sourceMappingURL=config.js.map

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
         * position controller really cheap.
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

    const CONNECTED_POSITION_CONFIG = Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG), { minWidth: 'origin', minHeight: 'origin', alignment: {
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
        var _a;
        let shadowRoot = document;
        let activeElement = (_a = shadowRoot.activeElement, (_a !== null && _a !== void 0 ? _a : document.body));
        while (shadowRoot && shadowRoot.activeElement) {
            activeElement = shadowRoot.activeElement;
            shadowRoot = activeElement.shadowRoot;
        }
        return activeElement;
    };
    //# sourceMappingURL=dom.js.map

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

    const FOCUS_CHANGE_EVENT_INIT = {
        bubbles: true,
        cancelable: true,
        composed: true,
    };
    /**
     * The FocusChangeEvent
     *
     * @remarks
     * The FocusChangeEvent is dispatched by the {@link FocusMonitor} *after* the focus state of the
     * monitored element has changed. This means, calling {@link activeElement} in an event handler
     * attached to this event will return the active element after the focus change. This is different
     * to focusin/focusout. Additionally, FocusChangeEvent is only triggered, when the focus moves into
     * the monitored element or out of the monitored element, but not when the focus moves within the
     * monitored element. FocusChangeEvent bubbles up the DOM.
     */
    class FocusChangeEvent extends CustomEvent {
        constructor(detail, init = {}) {
            const type = createEventName('focus', '', 'changed');
            const eventInit = Object.assign(Object.assign(Object.assign({}, FOCUS_CHANGE_EVENT_INIT), init), { detail });
            super(type, eventInit);
        }
    }
    //# sourceMappingURL=focus-change-event.js.map

    /**
     * The FocusMonitor behavior
     *
     * @remarks
     * The FocusMonitor behavior can be attached to an element to monitor the focus state
     * of the element and its descendants. It dispatches a {@link FocusChangeEvent} if
     * the focus is moved into the element (or one of its descendants) or if the focus
     * moves out.
     */
    class FocusMonitor extends Behavior {
        constructor() {
            super(...arguments);
            /**
             * The current focus state
             */
            this.hasFocus = false;
        }
        attach(element) {
            if (!super.attach(element))
                return false;
            // check if we have focus
            this.hasFocus = this.element.contains(activeElement());
            // attach event handlers
            this.listen(this.element, 'focusin', event => this.handleFocusIn(event));
            this.listen(this.element, 'focusout', event => this.handleFocusOut(event));
            return true;
        }
        handleFocusIn(event) {
            if (!this.hasFocus) {
                this.hasFocus = true;
                // schedule to dispatch a focus-changed event in the next macro-task to make
                // sure it is dispatched after the focus has moved
                // we also check that focus state hasn't changed until the macro-task
                macroTask(() => this.hasFocus && this.notifyFocusChange(event));
            }
            // stop the original focusin event from bubbling up the DOM and ending up in a parent
            // component's focus monitor
            cancel(event);
        }
        handleFocusOut(event) {
            if (this.hasFocus) {
                this.hasFocus = false;
                // schedule to dispatch a focus-changed event in the next macro-task to make
                // sure it is dispatched after the focus has moved
                // we also check that focus state hasn't changed until the macro-task
                macroTask(() => !this.hasFocus && this.notifyFocusChange(event));
            }
            // stop the original focusout event from bubbling up the DOM and ending up in a parent
            // component's focus monitor
            cancel(event);
        }
        notifyFocusChange(event) {
            // we only need to dispatch an event if our current focus state is different
            // than the last time we dispatched an event - this filters out cases where
            // we have a consecutive focusout/focusin event when the focus moves within
            // the monitored element (we don't want to notify if focus changes within)
            if (this.hasFocus !== this.hadFocus) {
                this.hadFocus = this.hasFocus;
                this.dispatch(new FocusChangeEvent({
                    hasFocus: this.hasFocus,
                    target: this.element,
                    relatedTarget: event.relatedTarget,
                }));
            }
        }
    }
    //# sourceMappingURL=focus-monitor.js.map

    /**
     * A CSS selector for matching elements which are not disabled or removed from the tab order
     *
     * @private
     * @internal
     */
    const INTERACTIVE = ':not([disabled]):not([tabindex^="-"])';
    /**
     * An array of CSS selectors to match generally tabbable elements
     *
     * @private
     * @internal
     */
    const ELEMENTS = [
        'a[href]',
        'area[href]',
        'button',
        'input',
        'select',
        'textarea',
        'iframe',
        '[contentEditable]',
        '[tabindex]',
    ];
    /**
     * An array of CSS selectors to match interactive, tabbable elements
     */
    const TABBABLES = ELEMENTS.map(ELEMENT => `${ELEMENT}${INTERACTIVE}`);
    /**
     * The default {@link FocusTrap} configuration
     */
    const DEFAULT_FOCUS_TRAP_CONFIG = {
        tabbableSelector: TABBABLES.join(','),
        wrapFocus: true,
        autoFocus: true,
        restoreFocus: true,
    };
    /**
     * The FocusTrap behavior
     *
     * @remarks
     * The FocusTrap behavior extends the {@link FocusMonitor} behavior and adds additional
     * functionality to it, like trapping the focus in the monitored element, auto wrapping
     * the focus order, as well as auto-focus and restore-focus. The behavior of the
     * FocusTrap can be defined through a {@link FocusTrapConfig}.
     */
    class FocusTrap extends FocusMonitor {
        constructor(config) {
            super();
            this.config = applyDefaults(config || {}, DEFAULT_FOCUS_TRAP_CONFIG);
        }
        attach(element) {
            if (!super.attach(element))
                return false;
            this.update();
            this.listen(this.element, 'keydown', ((event) => this.handleKeyDown(event)));
            if (this.config.autoFocus)
                this.focusInitial();
            return true;
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
        positionType: 'default',
        triggerType: 'default',
        trigger: undefined,
        stacked: true,
        template: undefined,
        context: undefined,
        backdrop: true,
        closeOnBackdropClick: true,
    };
    //# sourceMappingURL=overlay-config.js.map

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
        open() {
            this.overlay.open = true;
        }
        close() {
            this.overlay.open = false;
        }
        toggle(open) {
            this.overlay.open = (open !== null && open !== void 0 ? open : !this.overlay.open);
        }
        handleOpenChange(event) {
            var _a, _b;
            // if it's an event bubbling up from a nested overlay, ignore it
            if (event.detail.target !== this.overlay)
                return;
            const open = event.detail.current;
            if (open) {
                this.storeFocus();
                (_a = this.focusBehavior) === null || _a === void 0 ? void 0 : _a.attach(this.overlay);
            }
            else {
                (_b = this.focusBehavior) === null || _b === void 0 ? void 0 : _b.detach();
            }
        }
        handleFocusChange(event) {
            // this overlay trigger only handles FocusChangeEvents which were dispatched on its own overlay
            // if the event's target is not this trigger's overlay, then the event is bubbling from a nested overlay
            if (event.target !== this.overlay)
                return;
            console.log('OverlayTrigger.handleFocusChange()... %s, %s, bubbling: %s', this.overlay.id, event.detail.hasFocus, event.target !== this.overlay);
            // we only need to handle focus loss
            if (event.detail.hasFocus)
                return;
            // the FocusChangeEvent is dispatched after the focus has changed, so we can check if our overlay is
            // still active - the focus might have moved to a nested overlay (higher in the stack)
            if (this.overlay.static.isOverlayActive(this.overlay))
                return;
            // if this trigger's overlay is no longer active we can close it
            // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
            const parent = this.overlay.static.getParentOverlay(this.overlay);
            if (this.config.closeOnFocusLoss) {
                this.close();
            }
            // if we have a parent overlay, we let the parent know that our overlay has lost focus by dispatching the
            // FocusChangeEvent on the parent overlay to be handled or ignored by the parent's OverlayTrigger
            macroTask(() => { var _a; return (_a = parent) === null || _a === void 0 ? void 0 : _a.dispatchEvent(event); });
        }
        handleKeydown(event) {
            switch (event.key) {
                case Escape:
                    if (!this.overlay.open || !this.config.closeOnEscape)
                        return;
                    cancel(event);
                    this.close();
                    if (this.config.restoreFocus) {
                        this.listen(this.overlay, 'open-changed', () => this.restoreFocus(), { once: true });
                    }
                    break;
            }
        }
        storeFocus() {
            console.log('OverlayTrigger.storeFocus()...', this.previousFocus);
            this.previousFocus = activeElement();
        }
        restoreFocus() {
            console.log('OverlayTrigger.restoreFocus()...', this.previousFocus);
            this.previousFocus.focus();
        }
    }
    //# sourceMappingURL=overlay-trigger.js.map

    const DIALOG_OVERLAY_TRIGGER_CONFIG = Object.assign({}, DEFAULT_OVERLAY_TRIGGER_CONFIG);
    class DialogOverlayTrigger extends OverlayTrigger {
        attach(element) {
            // we enforce the element by only attaching, if it is provided
            if (!element || !super.attach(element))
                return false;
            this.element.setAttribute('aria-haspopup', 'dialog');
            this.listen(this.element, 'click', event => this.handleClick(event));
            this.listen(this.element, 'keydown', event => this.handleKeydown(event));
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
            this.toggle();
        }
        handleKeydown(event) {
            switch (event.key) {
                case Enter:
                case Space:
                    // handle events that happen on the trigger element
                    if (event.target === this.element) {
                        cancel(event);
                        this.toggle();
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
            // we enforce the element by only attaching, if it is provided
            if (!element || !super.attach(element))
                return false;
            this.overlay.role = 'tooltip';
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('aria-describedby', this.overlay.id);
            this.listen(this.element, 'mouseenter', () => this.open());
            this.listen(this.element, 'mouseleave', () => this.close());
            this.listen(this.element, 'focus', () => this.open());
            this.listen(this.element, 'blur', () => this.close());
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
             * The overlay's configuration
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
            this._open = false;
            this.isReattaching = false;
            this.tabindex = -1;
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
            return overlay.contains(activeElement());
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
            console.log('isOverlayActive(): ', overlay.id, isActive);
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
        set open(value) {
            // if open has changed we update the active overlay stack synchronously
            if (this._open !== value) {
                this._open = value;
                this.updateStack(value);
            }
        }
        get open() {
            return this._open;
        }
        set config(value) {
            this._config = Object.assign(Object.assign({}, this._config), value);
        }
        get config() {
            return this._config;
        }
        set origin(value) {
            this._config.origin = value;
        }
        get origin() {
            return this._config.origin;
        }
        set positionType(value) {
            this._config.positionType = value;
        }
        get positionType() {
            return this._config.positionType;
        }
        set trigger(value) {
            this._config.trigger = value;
        }
        get trigger() {
            return this._config.trigger;
        }
        set triggerType(value) {
            this._config.triggerType = value;
        }
        get triggerType() {
            return this._config.triggerType;
        }
        // set width(value: string | number) {
        //     this._config.width = value;
        // };
        // get width (): string | number {
        //     return this._config.width;
        // }
        // set height(value: string | number) {
        //     this._config.width = value;
        // };
        // get height (): string | number {
        //     return this._config.height;
        // }
        // set maxWidth(value: string | number) {
        //     this._config.width = value;
        // };
        // get maxWidth (): string | number {
        //     return this._config.maxWidth;
        // }
        // set maxHeight(value: string | number) {
        //     this._config.width = value;
        // };
        // get maxHeight (): string | number {
        //     return this._config.maxHeight;
        // }
        // set minWidth(value: string | number) {
        //     this._config.minWidth = value;
        // };
        // get minWidth (): string | number {
        //     return this._config.minWidth;
        // }
        // set minHeight(value: string | number) {
        //     this._config.minHeight = value;
        // };
        // get minHeight (): string | number{
        //     return this._config.minHeight;
        // }
        // alignment: import("../position").AlignmentPair;
        // tabbableSelector: string;
        // wrapFocus: boolean;
        // autoFocus: boolean;
        // restoreFocus: boolean;
        // initialFocus?: string | undefined;
        // trapFocus: boolean;
        // closeOnEscape: boolean;
        // closeOnFocusLoss: boolean;
        // stacked: boolean;
        // template?: import("../template-function").TemplateFunction | undefined;
        // context?: Component | undefined;
        // backdrop: boolean;
        // closeOnBackdropClick: boolean;
        get static() {
            return this.constructor;
        }
        connectedCallback() {
            if (this.isReattaching)
                return;
            super.connectedCallback();
            this.id = this.id || ID_GENERATOR.getNextID();
            this.marker = document.createComment(this.id);
            this.register();
        }
        disconnectedCallback() {
            if (this.isReattaching)
                return;
            this.unregister();
            super.disconnectedCallback();
        }
        updateCallback(changes, firstUpdate) {
            if (firstUpdate) {
                this.setAttribute('aria-hidden', `${!this.open}`);
                this.configure();
            }
            else {
                if (changes.has('open')) {
                    this.setAttribute('aria-hidden', `${!this.open}`);
                    this.notifyProperty('open', changes.get('open'), this.open);
                }
                if (changes.has('config') || changes.has('trigger') || changes.has('origin') || changes.has('triggerType') || changes.has('positionType')) {
                    console.log('Overlay.updateCallback()... config: ', this.config);
                    this.configure();
                }
            }
        }
        /**
         * Update the {@link Overlay.(activeOverlays:static)} stack
         *
         * @remarks
         * {@link Overlay} is a stacked overlay system. This means, that at any given time, there is at
         * maximum one overlay considered the active overlay. This is usually the focused overlay and
         * it is always the last overlay in the {@link Overlay.(activeOverlays:static)} stack.
         * When a stacked overlay is opened or closed, we need to update the {@link Overlay.(activeOverlays:static)}
         * stack to reflect the new stack order. The rules for updating the stack are as follows:
         *
         * * when opening a stacked overlay, it is added to the stack
         * * when closing a stacked overlay, all overlays higher in the stack have to be closed too
         * * when opening a stacked overlay with a trigger, we look for an overlay in the stack which
         *   contains the opening overlay's trigger - all overlays higher in the stack have to be closed
         *
         * This method is invoked from the {@link Overlay.open} setter and is executed immediately and
         * synchronously to guarantee the order in which overlays are opened/closed and the stability of
         * the stack as opposed to being scheduled in the update cycle.
         *
         * @param open  `true` if the overlay is opening, `false` otherwise
         */
        updateStack(open) {
            // only stacked overlays participate in the stack management
            if (!this._config.stacked)
                return;
            // turn stack into array and reverse it, as we want to start with the currently active overlay
            const activeOverlays = [...this.static.activeOverlays].reverse();
            // then iterate over the reverse stack and close each currently active overlay one by one
            // until we find an active overlay which fulfills the rules and can stay open
            activeOverlays.some(activeOverlay => {
                // we are done in the following cases:
                const done = open
                    // [this overlay is opening]:
                    // the currently active overlay contains the trigger of this overlay and can be
                    // considered the parent of this overlay in the stack - or  this overlay doesn't
                    // have a trigger and we consider the currently active overlay the parent
                    ? this.trigger && activeOverlay.contains(this.trigger) || !this.trigger
                    // [this overlay is closing]:
                    // the currently active overlay is this overlay which we are about to close;
                    // if the currently active overlay is not this overlay, then it is an active
                    // overlay higher in the stack which has to be closed
                    : activeOverlay === this;
                if (!done) {
                    activeOverlay.open = false;
                }
                return done;
            });
            // finally we add/remove this overlay to/from the stack
            open ? this.static.activeOverlays.add(this) : this.static.activeOverlays.delete(this);
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
            // overlays can be nested, which means that 'open-changed'-events can bubble from
            // a nested overlay to its parent - we only want to handle events from this overlay
            // instance, so we check the {@link ComponentEvent}'s detail.target property
            if (event.detail.target !== this)
                return;
            console.log('Overlay.handleOpenChange()...', event.detail.current);
            if (event.detail.current === true) {
                this.handleOpen();
            }
            else {
                this.handleClose();
            }
            console.log('activeOverlays: ', this.static.activeOverlays);
        }
        handleOpen() {
            var _a, _b, _c;
            this.moveToRoot();
            const positionController = (_a = this.static.registeredOverlays.get(this)) === null || _a === void 0 ? void 0 : _a.positionController;
            (_b = positionController) === null || _b === void 0 ? void 0 : _b.attach(this);
            (_c = positionController) === null || _c === void 0 ? void 0 : _c.update();
        }
        handleClose() {
            var _a, _b;
            (_b = (_a = this.static.registeredOverlays.get(this)) === null || _a === void 0 ? void 0 : _a.positionController) === null || _b === void 0 ? void 0 : _b.detach();
            this.moveFromRoot();
        }
        register() {
            if (this.static.isOverlayRegistered(this))
                throw ALREADY_REGISTERED_ERROR(this);
            console.log('Overly.register()... config: ', this.config);
            const settings = {
                config: this.config,
                events: new EventManager(),
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
        configure() {
            var _a, _b, _c, _d;
            console.log('Overlay.configure()... config: ', this.config);
            const settings = this.static.registeredOverlays.get(this);
            // dispose of the overlay trigger and position controller
            (_a = settings.overlayTrigger) === null || _a === void 0 ? void 0 : _a.detach();
            (_b = settings.positionController) === null || _b === void 0 ? void 0 : _b.detach();
            // recreate the overlay trigger and position controller from the config
            settings.overlayTrigger = this.static.overlayTriggerFactory.create(this._config.triggerType, this.config, this);
            settings.positionController = this.static.positionControllerFactory.create(this._config.positionType, this.config);
            // attach the overlay trigger
            settings.overlayTrigger.attach(this.config.trigger);
            // attach the position controller, if the overlay is open
            if (this.open) {
                (_c = settings.positionController) === null || _c === void 0 ? void 0 : _c.attach(this);
                (_d = settings.positionController) === null || _d === void 0 ? void 0 : _d.update();
            }
        }
        moveToRoot() {
            if (!this.static.overlayRoot)
                return;
            this.isReattaching = true;
            replaceWith(this.marker, this);
            // TODO: think about this: if we move overlays in the DOM, then a component's selectors might
            // get lost if an update happens in that component while the overlay is open
            this.static.overlayRoot.appendChild(this);
            this.isReattaching = false;
        }
        moveFromRoot() {
            if (!this.static.overlayRoot)
                return;
            this.isReattaching = true;
            replaceWith(this, this.marker);
            this.isReattaching = false;
        }
    };
    /** @internal */
    Overlay._initialized = false;
    /** @internal */
    Overlay._overlayTriggerFactory = new OverlayTriggerFactory();
    /** @internal */
    Overlay._positionControllerFactory = new PositionControllerFactory();
    Overlay.registeredOverlays = new Map();
    Overlay.activeOverlays = new Set();
    __decorate([
        property({ converter: AttributeConverterNumber }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "tabindex", void 0);
    __decorate([
        property({ converter: AttributeConverterBoolean }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Overlay.prototype, "open", null);
    __decorate([
        property({
            attribute: false,
            observe: PropertyChangeDetectorObject,
        }),
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
        get dialogConfig() {
            return {
                triggerType: 'dialog',
                positionType: 'connected',
                trigger: this.dialogButton,
                origin: this.dialogButton,
            };
        }
        updateCallback(changes, firstUpdate) {
            console.log('Demo.updateCallback()... firstUpdate: ', firstUpdate);
        }
        changeRole() {
            this.currentRole = (this.currentRole + 1 < this.roles.length) ? this.currentRole + 1 : 0;
            this.overlay.role = this.roles[this.currentRole];
            this.requestUpdate();
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
        selector({ query: '#dialog' }),
        __metadata("design:type", Overlay)
    ], OverlayDemoComponent.prototype, "dialog", void 0);
    __decorate([
        selector({ query: '#dialog-button' }),
        __metadata("design:type", HTMLButtonElement)
    ], OverlayDemoComponent.prototype, "dialogButton", void 0);
    __decorate([
        selector({ query: '#nested-dialog' }),
        __metadata("design:type", Overlay)
    ], OverlayDemoComponent.prototype, "nestedDialog", void 0);
    __decorate([
        selector({ query: '#nested-dialog-button' }),
        __metadata("design:type", HTMLButtonElement)
    ], OverlayDemoComponent.prototype, "nestedDialogButton", void 0);
    __decorate([
        selector({ query: '#nested-dialog-2' }),
        __metadata("design:type", Overlay)
    ], OverlayDemoComponent.prototype, "nestedDialog2", void 0);
    __decorate([
        selector({ query: '#nested-dialog-button-2' }),
        __metadata("design:type", HTMLButtonElement)
    ], OverlayDemoComponent.prototype, "nestedDialogButton2", void 0);
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

    <ui-overlay id="dialog" .config=${element.dialogConfig}>
        <h3>Dialog</h3>
        <p>This is some dialog content.</p>
        <p>
            <button id="nested-dialog-button">Nested dialog 1</button>
            <button id="nested-dialog-button-2">Nested dialog 2</button>
        </p>
        <ui-overlay
            id="nested-dialog"
            trigger-type="dialog"
            position-type="connected"
            .trigger=${element.nestedDialogButton}
            .origin=${element.nestedDialogButton}>
            <h3>Nested Dialog</h3>
            <p>This is some dialog content.</p>
        </ui-overlay>
        <ui-overlay
            id="nested-dialog-2"
            trigger-type="dialog"
            position-type="connected"
            .trigger=${element.nestedDialogButton2}
            .origin=${element.nestedDialogButton2}>
            <h3>Nested Dialog 2</h3>
            <p>This is some dialog content.</p>
        </ui-overlay>
    </ui-overlay>
    `
        })
    ], OverlayDemoComponent);
    //# sourceMappingURL=demo.js.map

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

    let FocusContainer = class FocusContainer extends Component {
        constructor() {
            super(...arguments);
            this.focusMonitor = new FocusMonitor();
            this.tabindex = 0;
        }
        connectedCallback() {
            this.focusMonitor.attach(this);
            super.connectedCallback();
        }
        disconnectedCallback() {
            this.focusMonitor.detach();
            super.disconnectedCallback();
        }
    };
    __decorate([
        property({ converter: AttributeConverterNumber }),
        __metadata("design:type", Object)
    ], FocusContainer.prototype, "tabindex", void 0);
    FocusContainer = __decorate([
        component({
            selector: 'focus-container',
            template: element => html `
    <input type="text"/> <button>OK</button>
    `,
            styles: [css `
    :host {
        display: block;
    }
    `],
        })
    ], FocusContainer);
    let EventOrderDemo = class EventOrderDemo extends Component {
        constructor() {
            super(...arguments);
            this.eventManager = new EventManager();
        }
        updateCallback(changes, firstChange) {
            if (firstChange) {
                // this.eventManager.listen(this.inputOne, 'focusin', event => this.handleFocusIn(event as FocusEvent));
                // this.eventManager.listen(this.inputOne, 'focusout', event => this.handleFocusOut(event as FocusEvent));
                // this.eventManager.listen(this.inputOne, 'focus', event => this.handleFocus(event as FocusEvent));
                // this.eventManager.listen(this.inputOne, 'blur', event => this.handleBlur(event as FocusEvent));
                this.eventManager.listen(this.containerOne, 'focus-changed', event => this.handleFocusChange(event));
                // this.eventManager.listen(this.inputTwo, 'focusin', event => this.handleFocusIn(event as FocusEvent));
                // this.eventManager.listen(this.inputTwo, 'focusout', event => this.handleFocusOut(event as FocusEvent));
                // this.eventManager.listen(this.inputTwo, 'focus', event => this.handleFocus(event as FocusEvent));
                // this.eventManager.listen(this.inputTwo, 'blur', event => this.handleBlur(event as FocusEvent));
                this.eventManager.listen(this.containerTwo, 'focus-changed', event => this.handleFocusChange(event));
            }
        }
        disconnectedCallback() {
            this.eventManager.unlistenAll();
            super.disconnectedCallback();
        }
        handleFocusIn(event) {
            console.log('@focusin: ', event.target.id, activeElement());
        }
        handleFocusOut(event) {
            console.log('@focusout: ', event.target.id, activeElement());
        }
        handleFocus(event) {
            console.log('@focus: ', event.target.id, activeElement());
        }
        handleBlur(event) {
            console.log('@blur: ', event.target.id, activeElement());
        }
        handleFocusChange(event) {
            console.log(`@focus-changed[${event.detail.hasFocus}]: `, event.target.id, activeElement(), document.activeElement);
        }
    };
    __decorate([
        selector({ query: '#one' }),
        __metadata("design:type", HTMLElement)
    ], EventOrderDemo.prototype, "containerOne", void 0);
    __decorate([
        selector({ query: '#two' }),
        __metadata("design:type", HTMLElement)
    ], EventOrderDemo.prototype, "containerTwo", void 0);
    __decorate([
        listener({ event: 'focusin', target: document }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [FocusEvent]),
        __metadata("design:returntype", void 0)
    ], EventOrderDemo.prototype, "handleFocusIn", null);
    __decorate([
        listener({ event: 'focusout', target: document }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [FocusEvent]),
        __metadata("design:returntype", void 0)
    ], EventOrderDemo.prototype, "handleFocusOut", null);
    EventOrderDemo = __decorate([
        component({
            selector: 'event-order-demo',
            template: element => html `
    <focus-container id="one"></focus-container>
    <focus-container id="two"></focus-container>
    `,
            styles: [css `
    :host {
        display: block;
    }
    `],
        })
    ], EventOrderDemo);
    //# sourceMappingURL=event-order-demo.js.map

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3NlbGVjdG9yLWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvdGFza3MudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9zZWxlY3Rvci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvcHJvcGVydHkudHMiLCIuLi9zcmMvZXZlbnRzLnRzIiwiLi4vc3JjL2NvbXBvbmVudC50cyIsIi4uL3NyYy9jc3MudHMiLCJzcmMva2V5cy50cyIsInNyYy9saXN0LWtleS1tYW5hZ2VyLnRzIiwic3JjL2ljb24vaWNvbi50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLWhlYWRlci50cyIsInNyYy9oZWxwZXJzL2NvcHlyaWdodC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmVsLnRzIiwic3JjL2FjY29yZGlvbi9hY2NvcmRpb24udHMiLCJzcmMvYXBwLnN0eWxlcy50cyIsInNyYy9hcHAudGVtcGxhdGUudHMiLCJzcmMvY2FyZC50cyIsInNyYy9jaGVja2JveC50cyIsInNyYy9wb3NpdGlvbi9zaXplLnRzIiwic3JjL3Bvc2l0aW9uL2FsaWdubWVudC50cyIsInNyYy9wb3NpdGlvbi9wb3NpdGlvbi50cyIsInNyYy9wb3NpdGlvbi9wb3NpdGlvbi1jb25maWcudHMiLCJzcmMvZXZlbnRzLnRzIiwic3JjL2JlaGF2aW9yL2JlaGF2aW9yLnRzIiwic3JjL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbnRyb2xsZXIudHMiLCJzcmMvdXRpbHMvY29uZmlnLnRzIiwic3JjL2JlaGF2aW9yL2JlaGF2aW9yLWZhY3RvcnkudHMiLCJzcmMvcG9zaXRpb24vY29udHJvbGxlci9jZW50ZXJlZC1wb3NpdGlvbi1jb250cm9sbGVyLnRzIiwic3JjL3Bvc2l0aW9uL2NvbnRyb2xsZXIvY29ubmVjdGVkLXBvc2l0aW9uLWNvbnRyb2xsZXIudHMiLCJzcmMvcG9zaXRpb24vcG9zaXRpb24tY29udHJvbGxlci1mYWN0b3J5LnRzIiwic3JjL2RvbS50cyIsInNyYy9pZC1nZW5lcmF0b3IudHMiLCJzcmMvbWl4aW5zL3JvbGUudHMiLCJzcmMvZm9jdXMvZm9jdXMtY2hhbmdlLWV2ZW50LnRzIiwic3JjL2ZvY3VzL2ZvY3VzLW1vbml0b3IudHMiLCJzcmMvZm9jdXMvZm9jdXMtdHJhcC50cyIsInNyYy9vdmVybGF5LW5ldy90cmlnZ2VyL292ZXJsYXktdHJpZ2dlci1jb25maWcudHMiLCJzcmMvb3ZlcmxheS1uZXcvb3ZlcmxheS1jb25maWcudHMiLCJzcmMvb3ZlcmxheS1uZXcvdHJpZ2dlci9vdmVybGF5LXRyaWdnZXIudHMiLCJzcmMvb3ZlcmxheS1uZXcvdHJpZ2dlci9kaWFsb2ctb3ZlcmxheS10cmlnZ2VyLnRzIiwic3JjL292ZXJsYXktbmV3L3RyaWdnZXIvdG9vbHRpcC1vdmVybGF5LXRyaWdnZXIudHMiLCJzcmMvb3ZlcmxheS1uZXcvdHJpZ2dlci9vdmVybGF5LXRyaWdnZXItZmFjdG9yeS50cyIsInNyYy9vdmVybGF5LW5ldy9vdmVybGF5LnRzIiwic3JjL292ZXJsYXktbmV3L2RlbW8udHMiLCJzcmMvdGFicy90YWIudHMiLCJzcmMvdGFicy90YWItbGlzdC50cyIsInNyYy90YWJzL3RhYi1wYW5lbC50cyIsInNyYy90b2dnbGUudHMiLCJzcmMvZXZlbnQtb3JkZXItZGVtby50cyIsInNyYy9hcHAudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmNvbnN0IGRpcmVjdGl2ZXMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBCcmFuZHMgYSBmdW5jdGlvbiBhcyBhIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uIHNvIHRoYXQgbGl0LWh0bWwgd2lsbCBjYWxsXG4gKiB0aGUgZnVuY3Rpb24gZHVyaW5nIHRlbXBsYXRlIHJlbmRlcmluZywgcmF0aGVyIHRoYW4gcGFzc2luZyBhcyBhIHZhbHVlLlxuICpcbiAqIEEgX2RpcmVjdGl2ZV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgUGFydCBhcyBhbiBhcmd1bWVudC4gSXQgaGFzIHRoZVxuICogc2lnbmF0dXJlOiBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLlxuICpcbiAqIEEgZGlyZWN0aXZlIF9mYWN0b3J5XyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYXJndW1lbnRzIGZvciBkYXRhIGFuZFxuICogY29uZmlndXJhdGlvbiBhbmQgcmV0dXJucyBhIGRpcmVjdGl2ZS4gVXNlcnMgb2YgZGlyZWN0aXZlIHVzdWFsbHkgcmVmZXIgdG9cbiAqIHRoZSBkaXJlY3RpdmUgZmFjdG9yeSBhcyB0aGUgZGlyZWN0aXZlLiBGb3IgZXhhbXBsZSwgXCJUaGUgcmVwZWF0IGRpcmVjdGl2ZVwiLlxuICpcbiAqIFVzdWFsbHkgYSB0ZW1wbGF0ZSBhdXRob3Igd2lsbCBpbnZva2UgYSBkaXJlY3RpdmUgZmFjdG9yeSBpbiB0aGVpciB0ZW1wbGF0ZVxuICogd2l0aCByZWxldmFudCBhcmd1bWVudHMsIHdoaWNoIHdpbGwgdGhlbiByZXR1cm4gYSBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKlxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgdXNpbmcgdGhlIGByZXBlYXQoKWAgZGlyZWN0aXZlIGZhY3RvcnkgdGhhdCB0YWtlcyBhblxuICogYXJyYXkgYW5kIGEgZnVuY3Rpb24gdG8gcmVuZGVyIGFuIGl0ZW06XG4gKlxuICogYGBganNcbiAqIGh0bWxgPHVsPjwke3JlcGVhdChpdGVtcywgKGl0ZW0pID0+IGh0bWxgPGxpPiR7aXRlbX08L2xpPmApfTwvdWw+YFxuICogYGBgXG4gKlxuICogV2hlbiBgcmVwZWF0YCBpcyBpbnZva2VkLCBpdCByZXR1cm5zIGEgZGlyZWN0aXZlIGZ1bmN0aW9uIHRoYXQgY2xvc2VzIG92ZXJcbiAqIGBpdGVtc2AgYW5kIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi4gV2hlbiB0aGUgb3V0ZXIgdGVtcGxhdGUgaXMgcmVuZGVyZWQsIHRoZVxuICogcmV0dXJuIGRpcmVjdGl2ZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgUGFydCBmb3IgdGhlIGV4cHJlc3Npb24uXG4gKiBgcmVwZWF0YCB0aGVuIHBlcmZvcm1zIGl0J3MgY3VzdG9tIGxvZ2ljIHRvIHJlbmRlciBtdWx0aXBsZSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0gZiBUaGUgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24uIE11c3QgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYVxuICogZnVuY3Rpb24gb2YgdGhlIHNpZ25hdHVyZSBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLiBUaGUgcmV0dXJuZWQgZnVuY3Rpb24gd2lsbFxuICogYmUgY2FsbGVkIHdpdGggdGhlIHBhcnQgb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogaW1wb3J0IHtkaXJlY3RpdmUsIGh0bWx9IGZyb20gJ2xpdC1odG1sJztcbiAqXG4gKiBjb25zdCBpbW11dGFibGUgPSBkaXJlY3RpdmUoKHYpID0+IChwYXJ0KSA9PiB7XG4gKiAgIGlmIChwYXJ0LnZhbHVlICE9PSB2KSB7XG4gKiAgICAgcGFydC5zZXRWYWx1ZSh2KVxuICogICB9XG4gKiB9KTtcbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9IChmKSA9PiAoKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBkID0gZiguLi5hcmdzKTtcbiAgICBkaXJlY3RpdmVzLnNldChkLCB0cnVlKTtcbiAgICByZXR1cm4gZDtcbn0pO1xuZXhwb3J0IGNvbnN0IGlzRGlyZWN0aXZlID0gKG8pID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdmdW5jdGlvbicgJiYgZGlyZWN0aXZlcy5oYXMobyk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlyZWN0aXZlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogVHJ1ZSBpZiB0aGUgY3VzdG9tIGVsZW1lbnRzIHBvbHlmaWxsIGlzIGluIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ0VQb2x5ZmlsbCA9IHdpbmRvdy5jdXN0b21FbGVtZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sgIT09XG4gICAgICAgIHVuZGVmaW5lZDtcbi8qKlxuICogUmVwYXJlbnRzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydGAgKGluY2x1c2l2ZSkgdG8gYGVuZGAgKGV4Y2x1c2l2ZSksXG4gKiBpbnRvIGFub3RoZXIgY29udGFpbmVyIChjb3VsZCBiZSB0aGUgc2FtZSBjb250YWluZXIpLCBiZWZvcmUgYGJlZm9yZWAuIElmXG4gKiBgYmVmb3JlYCBpcyBudWxsLCBpdCBhcHBlbmRzIHRoZSBub2RlcyB0byB0aGUgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgcmVwYXJlbnROb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsLCBiZWZvcmUgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKHN0YXJ0LCBiZWZvcmUpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8qKlxuICogUmVtb3ZlcyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLCBmcm9tXG4gKiBgY29udGFpbmVyYC5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZU5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwpID0+IHtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgICAgICBjb25zdCBuID0gc3RhcnQubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG9tLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxOCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IHt9O1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIE5vZGVQYXJ0IHRvIGZ1bGx5IGNsZWFyIGl0cyBjb250ZW50LlxuICovXG5leHBvcnQgY29uc3Qgbm90aGluZyA9IHt9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHdpdGggZW1iZWRkZWQgdW5pcXVlIGtleSB0byBhdm9pZCBjb2xsaXNpb24gd2l0aFxuICogcG9zc2libGUgdGV4dCBpbiB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBtYXJrZXIgPSBge3tsaXQtJHtTdHJpbmcoTWF0aC5yYW5kb20oKSkuc2xpY2UoMil9fX1gO1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB1c2VkIHRleHQtcG9zaXRpb25zLCBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZXMsIGFuZFxuICogYXR0cmlidXRlcyB3aXRoIG1hcmt1cC1saWtlIHRleHQgdmFsdWVzLlxuICovXG5leHBvcnQgY29uc3Qgbm9kZU1hcmtlciA9IGA8IS0tJHttYXJrZXJ9LS0+YDtcbmV4cG9ydCBjb25zdCBtYXJrZXJSZWdleCA9IG5ldyBSZWdFeHAoYCR7bWFya2VyfXwke25vZGVNYXJrZXJ9YCk7XG4vKipcbiAqIFN1ZmZpeCBhcHBlbmRlZCB0byBhbGwgYm91bmQgYXR0cmlidXRlIG5hbWVzLlxuICovXG5leHBvcnQgY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIFRlbXBsYXRlIHRoYXQgdHJhY2tzIHRoZSBsb2NhdGlvbiBvZiBkeW5hbWljIHBhcnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbXTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZWxlbWVudC5jb250ZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgaW5kZXggYXNzb2NpYXRlZCB3aXRoIGEgcGFydC4gV2UgdHJ5IHRvIGRlbGV0ZVxuICAgICAgICAvLyB1bm5lY2Vzc2FyeSBub2RlcywgYnV0IHdlIG5ldmVyIHdhbnQgdG8gYXNzb2NpYXRlIHR3byBkaWZmZXJlbnQgcGFydHNcbiAgICAgICAgLy8gdG8gdGhlIHNhbWUgaW5kZXguIFRoZXkgbXVzdCBoYXZlIGEgY29uc3RhbnQgbm9kZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgbGFzdFBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgeyBzdHJpbmdzLCB2YWx1ZXM6IHsgbGVuZ3RoIH0gfSA9IHJlc3VsdDtcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAvKiBOb2RlLkVMRU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGxlbmd0aCB9ID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9OYW1lZE5vZGVNYXAsXG4gICAgICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHJldHVybmVkIGluIGRvY3VtZW50IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBwYXJ0aWN1bGFyLCBFZGdlL0lFIGNhbiByZXR1cm4gdGhlbSBvdXQgb2Ygb3JkZXIsIHNvIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgICAgICAvLyBhc3N1bWUgYSBjb3JyZXNwb25kZW5jZSBiZXR3ZWVuIHBhcnQgaW5kZXggYW5kIGF0dHJpYnV0ZSBpbmRleC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoKGF0dHJpYnV0ZXNbaV0ubmFtZSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBzZWN0aW9uIGxlYWRpbmcgdXAgdG8gdGhlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIGluIHRoaXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gc3RyaW5nc1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMoc3RyaW5nRm9yUGFydClbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxsIGJvdW5kIGF0dHJpYnV0ZXMgaGF2ZSBoYWQgYSBzdWZmaXggYWRkZWQgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBsYXRlUmVzdWx0I2dldEhUTUwgdG8gb3B0IG91dCBvZiBzcGVjaWFsIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcuIFRvIGxvb2sgdXAgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB3ZSBhbHNvIG5lZWQgdG8gYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3VmZml4LlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTG9va3VwTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKSArIGJvdW5kQXR0cmlidXRlU3VmZml4O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IGF0dHJpYnV0ZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdhdHRyaWJ1dGUnLCBpbmRleCwgbmFtZSwgc3RyaW5nczogc3RhdGljcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBzdGF0aWNzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gZGF0YS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbnNlcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcyA9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocyA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBjcmVhdGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCAmJiBlbmRzV2l0aChtYXRjaFsyXSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArIG1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzJdLnNsaWNlKDAsIC1ib3VuZEF0dHJpYnV0ZVN1ZmZpeC5sZW5ndGgpICsgbWF0Y2hbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpbnNlcnQsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogKytpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIHRleHQsIHdlIG11c3QgaW5zZXJ0IGEgY29tbWVudCB0byBtYXJrIG91ciBwbGFjZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHRydXN0IGl0IHdpbGwgc3RpY2sgYXJvdW5kIGFmdGVyIGNsb25pbmcuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9IHN0cmluZ3NbbGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgcGFydCBmb3IgZWFjaCBtYXRjaCBmb3VuZFxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogTm9kZS5DT01NRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kYXRhID09PSBtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2ZcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gICogV2UgZG9uJ3QgaGF2ZSBhIHByZXZpb3VzU2libGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyAgKiBUaGUgcHJldmlvdXNTaWJsaW5nIGlzIGFscmVhZHkgdGhlIHN0YXJ0IG9mIGEgcHJldmlvdXMgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IG51bGwgfHwgaW5kZXggPT09IGxhc3RQYXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0UGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBuZXh0U2libGluZywga2VlcCB0aGlzIG5vZGUgc28gd2UgaGF2ZSBhbiBlbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiByZW1vdmUgaXQgdG8gc2F2ZSBmdXR1cmUgY29zdHMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGkgPSBub2RlLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBjb25zaWRlciB3aGV0aGVyIGl0J3MgZXZlbiB3b3J0aCBpdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBiaW5kaW5ncyBpbiBjb21tZW50cyB3b3JrXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiAtMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSB0ZXh0IGJpbmRpbmcgbm9kZXMgYWZ0ZXIgdGhlIHdhbGsgdG8gbm90IGRpc3R1cmIgdGhlIFRyZWVXYWxrZXJcbiAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVuZHNXaXRoID0gKHN0ciwgc3VmZml4KSA9PiB7XG4gICAgY29uc3QgaW5kZXggPSBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aDtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBzdHIuc2xpY2UoaW5kZXgpID09PSBzdWZmaXg7XG59O1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLy8gQWxsb3dzIGBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKWAgdG8gYmUgcmVuYW1lZCBmb3IgYVxuLy8gc21hbGwgbWFudWFsIHNpemUtc2F2aW5ncy5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbi8qKlxuICogVGhpcyByZWdleCBleHRyYWN0cyB0aGUgYXR0cmlidXRlIG5hbWUgcHJlY2VkaW5nIGFuIGF0dHJpYnV0ZS1wb3NpdGlvblxuICogZXhwcmVzc2lvbi4gSXQgZG9lcyB0aGlzIGJ5IG1hdGNoaW5nIHRoZSBzeW50YXggYWxsb3dlZCBmb3IgYXR0cmlidXRlc1xuICogYWdhaW5zdCB0aGUgc3RyaW5nIGxpdGVyYWwgZGlyZWN0bHkgcHJlY2VkaW5nIHRoZSBleHByZXNzaW9uLCBhc3N1bWluZyB0aGF0XG4gKiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhbiBhdHRyaWJ1dGUtdmFsdWUgcG9zaXRpb24uXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx4MDlcXHgwYVxceDBjXFx4MGRcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2luZnJhc3RydWN0dXJlLmh0bWwjc3BhY2UtY2hhcmFjdGVyc1xuICpcbiAqIFwiXFwwLVxceDFGXFx4N0YtXFx4OUZcIiBhcmUgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnMsIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5XG4gKiBzcGFjZSBjaGFyYWN0ZXIgZXhjZXB0IFwiIFwiLlxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIGNvbnRyb2wgY2hhcmFjdGVyLCBzcGFjZSBjaGFyYWN0ZXIsICgnKSxcbiAqICAgIChcIiksIFwiPlwiLCBcIj1cIiwgb3IgXCIvXCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmV4cG9ydCBjb25zdCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4ID0gLyhbIFxceDA5XFx4MGFcXHgwY1xceDBkXSkoW15cXDAtXFx4MUZcXHg3Ri1cXHg5RiBcIic+PS9dKykoWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qPVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKig/OlteIFxceDA5XFx4MGFcXHgwY1xceDBkXCInYDw+PV0qfFwiW15cIl0qfCdbXiddKikpJC87XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNDRVBvbHlmaWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgYSBgVGVtcGxhdGVgIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIHRoZSBET00gYW5kIHVwZGF0ZWRcbiAqIHdpdGggbmV3IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlSW5zdGFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBwcm9jZXNzb3IsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fX3BhcnRzID0gW107XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIHVwZGF0ZSh2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5zZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jbG9uZSgpIHtcbiAgICAgICAgLy8gVGhlcmUgYXJlIGEgbnVtYmVyIG9mIHN0ZXBzIGluIHRoZSBsaWZlY3ljbGUgb2YgYSB0ZW1wbGF0ZSBpbnN0YW5jZSdzXG4gICAgICAgIC8vIERPTSBmcmFnbWVudDpcbiAgICAgICAgLy8gIDEuIENsb25lIC0gY3JlYXRlIHRoZSBpbnN0YW5jZSBmcmFnbWVudFxuICAgICAgICAvLyAgMi4gQWRvcHQgLSBhZG9wdCBpbnRvIHRoZSBtYWluIGRvY3VtZW50XG4gICAgICAgIC8vICAzLiBQcm9jZXNzIC0gZmluZCBwYXJ0IG1hcmtlcnMgYW5kIGNyZWF0ZSBwYXJ0c1xuICAgICAgICAvLyAgNC4gVXBncmFkZSAtIHVwZ3JhZGUgY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIC8vICA1LiBVcGRhdGUgLSBzZXQgbm9kZSwgYXR0cmlidXRlLCBwcm9wZXJ0eSwgZXRjLiwgdmFsdWVzXG4gICAgICAgIC8vICA2LiBDb25uZWN0IC0gY29ubmVjdCB0byB0aGUgZG9jdW1lbnQuIE9wdGlvbmFsIGFuZCBvdXRzaWRlIG9mIHRoaXNcbiAgICAgICAgLy8gICAgIG1ldGhvZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgaGF2ZSBhIGZldyBjb25zdHJhaW50cyBvbiB0aGUgb3JkZXJpbmcgb2YgdGhlc2Ugc3RlcHM6XG4gICAgICAgIC8vICAqIFdlIG5lZWQgdG8gdXBncmFkZSBiZWZvcmUgdXBkYXRpbmcsIHNvIHRoYXQgcHJvcGVydHkgdmFsdWVzIHdpbGwgcGFzc1xuICAgICAgICAvLyAgICB0aHJvdWdoIGFueSBwcm9wZXJ0eSBzZXR0ZXJzLlxuICAgICAgICAvLyAgKiBXZSB3b3VsZCBsaWtlIHRvIHByb2Nlc3MgYmVmb3JlIHVwZ3JhZGluZyBzbyB0aGF0IHdlJ3JlIHN1cmUgdGhhdCB0aGVcbiAgICAgICAgLy8gICAgY2xvbmVkIGZyYWdtZW50IGlzIGluZXJ0IGFuZCBub3QgZGlzdHVyYmVkIGJ5IHNlbGYtbW9kaWZ5aW5nIERPTS5cbiAgICAgICAgLy8gICogV2Ugd2FudCBjdXN0b20gZWxlbWVudHMgdG8gdXBncmFkZSBldmVuIGluIGRpc2Nvbm5lY3RlZCBmcmFnbWVudHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEdpdmVuIHRoZXNlIGNvbnN0cmFpbnRzLCB3aXRoIGZ1bGwgY3VzdG9tIGVsZW1lbnRzIHN1cHBvcnQgd2Ugd291bGRcbiAgICAgICAgLy8gcHJlZmVyIHRoZSBvcmRlcjogQ2xvbmUsIFByb2Nlc3MsIEFkb3B0LCBVcGdyYWRlLCBVcGRhdGUsIENvbm5lY3RcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQnV0IFNhZmFyaSBkb29lcyBub3QgaW1wbGVtZW50IEN1c3RvbUVsZW1lbnRSZWdpc3RyeSN1cGdyYWRlLCBzbyB3ZVxuICAgICAgICAvLyBjYW4gbm90IGltcGxlbWVudCB0aGF0IG9yZGVyIGFuZCBzdGlsbCBoYXZlIHVwZ3JhZGUtYmVmb3JlLXVwZGF0ZSBhbmRcbiAgICAgICAgLy8gdXBncmFkZSBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLiBTbyB3ZSBpbnN0ZWFkIHNhY3JpZmljZSB0aGVcbiAgICAgICAgLy8gcHJvY2Vzcy1iZWZvcmUtdXBncmFkZSBjb25zdHJhaW50LCBzaW5jZSBpbiBDdXN0b20gRWxlbWVudHMgdjEgZWxlbWVudHNcbiAgICAgICAgLy8gbXVzdCBub3QgbW9kaWZ5IHRoZWlyIGxpZ2h0IERPTSBpbiB0aGUgY29uc3RydWN0b3IuIFdlIHN0aWxsIGhhdmUgaXNzdWVzXG4gICAgICAgIC8vIHdoZW4gY28tZXhpc3Rpbmcgd2l0aCBDRXYwIGVsZW1lbnRzIGxpa2UgUG9seW1lciAxLCBhbmQgd2l0aCBwb2x5ZmlsbHNcbiAgICAgICAgLy8gdGhhdCBkb24ndCBzdHJpY3RseSBhZGhlcmUgdG8gdGhlIG5vLW1vZGlmaWNhdGlvbiBydWxlIGJlY2F1c2Ugc2hhZG93XG4gICAgICAgIC8vIERPTSwgd2hpY2ggbWF5IGJlIGNyZWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCBpcyBlbXVsYXRlZCBieSBiZWluZyBwbGFjZWRcbiAgICAgICAgLy8gaW4gdGhlIGxpZ2h0IERPTS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHJlc3VsdGluZyBvcmRlciBpcyBvbiBuYXRpdmUgaXM6IENsb25lLCBBZG9wdCwgVXBncmFkZSwgUHJvY2VzcyxcbiAgICAgICAgLy8gVXBkYXRlLCBDb25uZWN0LiBkb2N1bWVudC5pbXBvcnROb2RlKCkgcGVyZm9ybXMgQ2xvbmUsIEFkb3B0LCBhbmQgVXBncmFkZVxuICAgICAgICAvLyBpbiBvbmUgc3RlcC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIEN1c3RvbSBFbGVtZW50cyB2MSBwb2x5ZmlsbCBzdXBwb3J0cyB1cGdyYWRlKCksIHNvIHRoZSBvcmRlciB3aGVuXG4gICAgICAgIC8vIHBvbHlmaWxsZWQgaXMgdGhlIG1vcmUgaWRlYWw6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLFxuICAgICAgICAvLyBDb25uZWN0LlxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGlzQ0VQb2x5ZmlsbCA/XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkgOlxuICAgICAgICAgICAgZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy50ZW1wbGF0ZS5wYXJ0cztcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZnJhZ21lbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgICAgIGxldCBwYXJ0O1xuICAgICAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHRoZSBub2RlcyBhbmQgcGFydHMgb2YgYSB0ZW1wbGF0ZVxuICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIGlmICghaXNUZW1wbGF0ZVBhcnRBY3RpdmUocGFydCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgdGhlIHRyZWUgd2Fsa2VyIHVudGlsIHdlIGZpbmQgb3VyIG5leHQgcGFydCdzIG5vZGUuXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgbXVsdGlwbGUgcGFydHMgbWF5IHNoYXJlIHRoZSBzYW1lIG5vZGUgKGF0dHJpYnV0ZSBwYXJ0c1xuICAgICAgICAgICAgLy8gb24gYSBzaW5nbGUgZWxlbWVudCksIHNvIHRoaXMgbG9vcCBtYXkgbm90IHJ1biBhdCBhbGwuXG4gICAgICAgICAgICB3aGlsZSAobm9kZUluZGV4IDwgcGFydC5pbmRleCkge1xuICAgICAgICAgICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGV4aGF1c3RlZCB0aGUgY29udGVudCBpbnNpZGUgYSBuZXN0ZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlIHdhbGtlciB3aWxsIGZpbmQgYSBuZXh0Tm9kZSBvdXRzaWRlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlJ3ZlIGFycml2ZWQgYXQgb3VyIHBhcnQncyBub2RlLlxuICAgICAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucHJvY2Vzc29yLmhhbmRsZVRleHRFeHByZXNzaW9uKHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcGFydC5pbnNlcnRBZnRlck5vZGUobm9kZS5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2goLi4udGhpcy5wcm9jZXNzb3IuaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMobm9kZSwgcGFydC5uYW1lLCBwYXJ0LnN0cmluZ3MsIHRoaXMub3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ0VQb2x5ZmlsbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRvcHROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIGN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1pbnN0YW5jZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJvdW5kQXR0cmlidXRlU3VmZml4LCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LCBtYXJrZXIsIG5vZGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmNvbnN0IGNvbW1lbnRNYXJrZXIgPSBgICR7bWFya2VyfSBgO1xuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgYGh0bWxgLCB3aGljaCBob2xkcyBhIFRlbXBsYXRlIGFuZCB0aGUgdmFsdWVzIGZyb21cbiAqIGludGVycG9sYXRlZCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdHJpbmdzLCB2YWx1ZXMsIHR5cGUsIHByb2Nlc3Nvcikge1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgSFRNTCB1c2VkIHRvIGNyZWF0ZSBhIGA8dGVtcGxhdGU+YCBlbGVtZW50LlxuICAgICAqL1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLnN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgbGV0IGlzQ29tbWVudEJpbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3NbaV07XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBiaW5kaW5nIHdlIHdhbnQgdG8gZGV0ZXJtaW5lIHRoZSBraW5kIG9mIG1hcmtlciB0byBpbnNlcnRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIHRlbXBsYXRlIHNvdXJjZSBiZWZvcmUgaXQncyBwYXJzZWQgYnkgdGhlIGJyb3dzZXIncyBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFRoZSBtYXJrZXIgdHlwZSBpcyBiYXNlZCBvbiB3aGV0aGVyIHRoZSBleHByZXNzaW9uIGlzIGluIGFuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGUsIHRleHQsIG9yIGNvbW1lbnQgcG9pc2l0aW9uLlxuICAgICAgICAgICAgLy8gICAqIEZvciBub2RlLXBvc2l0aW9uIGJpbmRpbmdzIHdlIGluc2VydCBhIGNvbW1lbnQgd2l0aCB0aGUgbWFya2VyXG4gICAgICAgICAgICAvLyAgICAgc2VudGluZWwgYXMgaXRzIHRleHQgY29udGVudCwgbGlrZSA8IS0te3tsaXQtZ3VpZH19LS0+LlxuICAgICAgICAgICAgLy8gICAqIEZvciBhdHRyaWJ1dGUgYmluZGluZ3Mgd2UgaW5zZXJ0IGp1c3QgdGhlIG1hcmtlciBzZW50aW5lbCBmb3IgdGhlXG4gICAgICAgICAgICAvLyAgICAgZmlyc3QgYmluZGluZywgc28gdGhhdCB3ZSBzdXBwb3J0IHVucXVvdGVkIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAgICAgICAgICAgIC8vICAgICBTdWJzZXF1ZW50IGJpbmRpbmdzIGNhbiB1c2UgYSBjb21tZW50IG1hcmtlciBiZWNhdXNlIG11bHRpLWJpbmRpbmdcbiAgICAgICAgICAgIC8vICAgICBhdHRyaWJ1dGVzIG11c3QgYmUgcXVvdGVkLlxuICAgICAgICAgICAgLy8gICAqIEZvciBjb21tZW50IGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgc28gd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vICAgICBjbG9zZSB0aGUgY29tbWVudC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgc2NhbnMgdGhlIHRlbXBsYXRlIHNvdXJjZSwgYnV0IGlzICpub3QqIGFuIEhUTUxcbiAgICAgICAgICAgIC8vIHBhcnNlci4gV2UgZG9uJ3QgbmVlZCB0byB0cmFjayB0aGUgdHJlZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwsIG9ubHlcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgYSBiaW5kaW5nIGlzIGluc2lkZSBhIGNvbW1lbnQsIGFuZCBpZiBub3QsIGlmIGl0IGFwcGVhcnMgdG8gYmVcbiAgICAgICAgICAgIC8vIHRoZSBmaXJzdCBiaW5kaW5nIGluIGFuIGF0dHJpYnV0ZS5cbiAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRPcGVuID0gcy5sYXN0SW5kZXhPZignPCEtLScpO1xuICAgICAgICAgICAgLy8gV2UncmUgaW4gY29tbWVudCBwb3NpdGlvbiBpZiB3ZSBoYXZlIGEgY29tbWVudCBvcGVuIHdpdGggbm8gZm9sbG93aW5nXG4gICAgICAgICAgICAvLyBjb21tZW50IGNsb3NlLiBCZWNhdXNlIDwtLSBjYW4gYXBwZWFyIGluIGFuIGF0dHJpYnV0ZSB2YWx1ZSB0aGVyZSBjYW5cbiAgICAgICAgICAgIC8vIGJlIGZhbHNlIHBvc2l0aXZlcy5cbiAgICAgICAgICAgIGlzQ29tbWVudEJpbmRpbmcgPSAoY29tbWVudE9wZW4gPiAtMSB8fCBpc0NvbW1lbnRCaW5kaW5nKSAmJlxuICAgICAgICAgICAgICAgIHMuaW5kZXhPZignLS0+JywgY29tbWVudE9wZW4gKyAxKSA9PT0gLTE7XG4gICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhbiBhdHRyaWJ1dGUtbGlrZSBzZXF1ZW5jZSBwcmVjZWVkaW5nIHRoZVxuICAgICAgICAgICAgLy8gZXhwcmVzc2lvbi4gVGhpcyBjYW4gbWF0Y2ggXCJuYW1lPXZhbHVlXCIgbGlrZSBzdHJ1Y3R1cmVzIGluIHRleHQsXG4gICAgICAgICAgICAvLyBjb21tZW50cywgYW5kIGF0dHJpYnV0ZSB2YWx1ZXMsIHNvIHRoZXJlIGNhbiBiZSBmYWxzZS1wb3NpdGl2ZXMuXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVNYXRjaCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzKTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVNYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgaW4gdGhpcyBicmFuY2ggaWYgd2UgZG9uJ3QgaGF2ZSBhIGF0dHJpYnV0ZS1saWtlXG4gICAgICAgICAgICAgICAgLy8gcHJlY2VlZGluZyBzZXF1ZW5jZS4gRm9yIGNvbW1lbnRzLCB0aGlzIGd1YXJkcyBhZ2FpbnN0IHVudXN1YWxcbiAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGUgdmFsdWVzIGxpa2UgPGRpdiBmb289XCI8IS0tJHsnYmFyJ31cIj4uIENhc2VzIGxpa2VcbiAgICAgICAgICAgICAgICAvLyA8IS0tIGZvbz0keydiYXInfS0tPiBhcmUgaGFuZGxlZCBjb3JyZWN0bHkgaW4gdGhlIGF0dHJpYnV0ZSBicmFuY2hcbiAgICAgICAgICAgICAgICAvLyBiZWxvdy5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMgKyAoaXNDb21tZW50QmluZGluZyA/IGNvbW1lbnRNYXJrZXIgOiBub2RlTWFya2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBhdHRyaWJ1dGVzIHdlIHVzZSBqdXN0IGEgbWFya2VyIHNlbnRpbmVsLCBhbmQgYWxzbyBhcHBlbmQgYVxuICAgICAgICAgICAgICAgIC8vICRsaXQkIHN1ZmZpeCB0byB0aGUgbmFtZSB0byBvcHQtb3V0IG9mIGF0dHJpYnV0ZS1zcGVjaWZpYyBwYXJzaW5nXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBJRSBhbmQgRWRnZSBkbyBmb3Igc3R5bGUgYW5kIGNlcnRhaW4gU1ZHIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzLnN1YnN0cigwLCBhdHRyaWJ1dGVNYXRjaC5pbmRleCkgKyBhdHRyaWJ1dGVNYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU1hdGNoWzJdICsgYm91bmRBdHRyaWJ1dGVTdWZmaXggKyBhdHRyaWJ1dGVNYXRjaFszXSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBodG1sICs9IHRoaXMuc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0aGlzLmdldEhUTUwoKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCBmb3IgU1ZHIGZyYWdtZW50cy5cbiAqXG4gKiBUaGlzIGNsYXNzIHdyYXBzIEhUTUwgaW4gYW4gYDxzdmc+YCB0YWcgaW4gb3JkZXIgdG8gcGFyc2UgaXRzIGNvbnRlbnRzIGluIHRoZVxuICogU1ZHIG5hbWVzcGFjZSwgdGhlbiBtb2RpZmllcyB0aGUgdGVtcGxhdGUgdG8gcmVtb3ZlIHRoZSBgPHN2Zz5gIHRhZyBzbyB0aGF0XG4gKiBjbG9uZXMgb25seSBjb250YWluZXIgdGhlIG9yaWdpbmFsIGZyYWdtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU1ZHVGVtcGxhdGVSZXN1bHQgZXh0ZW5kcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgcmV0dXJuIGA8c3ZnPiR7c3VwZXIuZ2V0SFRNTCgpfTwvc3ZnPmA7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBzdXBlci5nZXRUZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBjb250ZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoc3ZnRWxlbWVudCk7XG4gICAgICAgIHJlcGFyZW50Tm9kZXMoY29udGVudCwgc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLXJlc3VsdC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9wYXJ0LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuaW1wb3J0IHsgY3JlYXRlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICEodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpKTtcbn07XG5leHBvcnQgY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSB8fFxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICEhKHZhbHVlICYmIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pO1xufTtcbi8qKlxuICogV3JpdGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdG8gdGhlIERPTSBmb3IgYSBncm91cCBvZiBBdHRyaWJ1dGVQYXJ0cyBib3VuZCB0byBhXG4gKiBzaW5nbGUgYXR0aWJ1dGUuIFRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzXG4gKiBmb3IgYW4gYXR0cmlidXRlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydHNbaV0gPSB0aGlzLl9jcmVhdGVQYXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNpbmdsZSBwYXJ0LiBPdmVycmlkZSB0aGlzIHRvIGNyZWF0ZSBhIGRpZmZlcm50IHR5cGUgb2YgcGFydC5cbiAgICAgKi9cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG4gICAgICAgIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gcGFydC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQcmltaXRpdmUodikgfHwgIWlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogU3RyaW5nKHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0IG9mIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHQgPT09ICdzdHJpbmcnID8gdCA6IFN0cmluZyh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgdGhpcy5fZ2V0VmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGFsbCBvciBwYXJ0IG9mIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGNvbW1pdHRlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNvbW1pdHRlciA9IGNvbW1pdHRlcjtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBub0NoYW5nZSAmJiAoIWlzUHJpbWl0aXZlKHZhbHVlKSB8fCB2YWx1ZSAhPT0gdGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhIG5vdCBhIGRpcmVjdGl2ZSwgZGlydHkgdGhlIGNvbW1pdHRlciBzbyB0aGF0IGl0J2xsXG4gICAgICAgICAgICAvLyBjYWxsIHNldEF0dHJpYnV0ZS4gSWYgdGhlIHZhbHVlIGlzIGEgZGlyZWN0aXZlLCBpdCdsbCBkaXJ0eSB0aGVcbiAgICAgICAgICAgIC8vIGNvbW1pdHRlciBpZiBpdCBjYWxscyBzZXRWYWx1ZSgpLlxuICAgICAgICAgICAgaWYgKCFpc0RpcmVjdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1pdHRlci5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21taXR0ZXIuY29tbWl0KCk7XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhIGxvY2F0aW9uIHdpdGhpbiBhIE5vZGUgdHJlZS4gTGlrZSBhIFJhbmdlLCBOb2RlUGFydFxuICogaGFzIHN0YXJ0IGFuZCBlbmQgbG9jYXRpb25zIGFuZCBjYW4gc2V0IGFuZCB1cGRhdGUgdGhlIE5vZGVzIGJldHdlZW4gdGhvc2VcbiAqIGxvY2F0aW9ucy5cbiAqXG4gKiBOb2RlUGFydHMgc3VwcG9ydCBzZXZlcmFsIHZhbHVlIHR5cGVzOiBwcmltaXRpdmVzLCBOb2RlcywgVGVtcGxhdGVSZXN1bHRzLFxuICogYXMgd2VsbCBhcyBhcnJheXMgYW5kIGl0ZXJhYmxlcyBvZiB0aG9zZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvKGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBub2RlIChiZXR3ZWVuIGByZWZgIGFuZCBgcmVmYCdzIG5leHRcbiAgICAgKiBzaWJsaW5nKS4gQm90aCBgcmVmYCBhbmQgaXRzIG5leHQgc2libGluZyBtdXN0IGJlIHN0YXRpYywgdW5jaGFuZ2luZyBub2Rlc1xuICAgICAqIHN1Y2ggYXMgdGhvc2UgdGhhdCBhcHBlYXIgaW4gYSBsaXRlcmFsIHNlY3Rpb24gb2YgYSB0ZW1wbGF0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyTm9kZShyZWYpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSByZWY7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5uZXh0U2libGluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIHBhcmVudCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50b1BhcnQocGFydCkge1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuZW5kTm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlclBhcnQocmVmKSB7XG4gICAgICAgIHJlZi5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLmVuZE5vZGU7XG4gICAgICAgIHJlZi5lbmROb2RlID0gdGhpcy5zdGFydE5vZGU7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub3RoaW5nO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2luc2VydChub2RlKSB7XG4gICAgICAgIHRoaXMuZW5kTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbiAgICBfX2NvbW1pdE5vZGUodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLl9faW5zZXJ0KHZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfX2NvbW1pdFRleHQodmFsdWUpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuc3RhcnROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xuICAgICAgICAvLyBJZiBgdmFsdWVgIGlzbid0IGFscmVhZHkgYSBzdHJpbmcsIHdlIGV4cGxpY2l0bHkgY29udmVydCBpdCBoZXJlIGluIGNhc2VcbiAgICAgICAgLy8gaXQgY2FuJ3QgYmUgaW1wbGljaXRseSBjb252ZXJ0ZWQgLSBpLmUuIGl0J3MgYSBzeW1ib2wuXG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgICBpZiAobm9kZSA9PT0gdGhpcy5lbmROb2RlLnByZXZpb3VzU2libGluZyAmJlxuICAgICAgICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIHRleHQgbm9kZSBiZXR3ZWVuIHRoZSBtYXJrZXJzLCB3ZSBjYW4ganVzdFxuICAgICAgICAgICAgLy8gc2V0IGl0cyB2YWx1ZSwgcmF0aGVyIHRoYW4gcmVwbGFjaW5nIGl0LlxuICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogQ2FuIHdlIGp1c3QgY2hlY2sgaWYgdGhpcy52YWx1ZSBpcyBwcmltaXRpdmU/XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZUFzU3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWVBc1N0cmluZykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZUZhY3RvcnkodmFsdWUpO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlSW5zdGFuY2UgJiZcbiAgICAgICAgICAgIHRoaXMudmFsdWUudGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHByb3BhZ2F0ZSB0aGUgdGVtcGxhdGUgcHJvY2Vzc29yIGZyb20gdGhlIFRlbXBsYXRlUmVzdWx0XG4gICAgICAgICAgICAvLyBzbyB0aGF0IHdlIHVzZSBpdHMgc3ludGF4IGV4dGVuc2lvbiwgZXRjLiBUaGUgdGVtcGxhdGUgZmFjdG9yeSBjb21lc1xuICAgICAgICAgICAgLy8gZnJvbSB0aGUgcmVuZGVyIGZ1bmN0aW9uIG9wdGlvbnMgc28gdGhhdCBpdCBjYW4gY29udHJvbCB0ZW1wbGF0ZVxuICAgICAgICAgICAgLy8gY2FjaGluZyBhbmQgcHJlcHJvY2Vzc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUsIHZhbHVlLnByb2Nlc3NvciwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKCk7XG4gICAgICAgICAgICBpbnN0YW5jZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgICAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAgICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG4gICAgICAgIC8vIElmIF92YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgICAgICAvLyBpdGVyYWJsZSBhbmQgX3ZhbHVlIHdpbGwgY29udGFpbiB0aGUgTm9kZVBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlci4gSWYgX3ZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgICAgIC8vIGFycmF5IGZvciBOb2RlUGFydHMuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgICAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMudmFsdWU7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaXRlbVBhcnQ7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgICAgICBpZiAoaXRlbVBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0ID0gbmV3IE5vZGVQYXJ0KHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnRzLnB1c2goaXRlbVBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuYXBwZW5kSW50b1BhcnQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5pbnNlcnRBZnRlclBhcnQoaXRlbVBhcnRzW3BhcnRJbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtUGFydC5zZXRWYWx1ZShpdGVtKTtcbiAgICAgICAgICAgIGl0ZW1QYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKGl0ZW1QYXJ0ICYmIGl0ZW1QYXJ0LmVuZE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyKHN0YXJ0Tm9kZSA9IHRoaXMuc3RhcnROb2RlKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKHRoaXMuc3RhcnROb2RlLnBhcmVudE5vZGUsIHN0YXJ0Tm9kZS5uZXh0U2libGluZywgdGhpcy5lbmROb2RlKTtcbiAgICB9XG59XG4vKipcbiAqIEltcGxlbWVudHMgYSBib29sZWFuIGF0dHJpYnV0ZSwgcm91Z2hseSBhcyBkZWZpbmVkIGluIHRoZSBIVE1MXG4gKiBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIElmIHRoZSB2YWx1ZSBpcyB0cnV0aHksIHRoZW4gdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50IHdpdGggYSB2YWx1ZSBvZlxuICogJycuIElmIHRoZSB2YWx1ZSBpcyBmYWxzZXksIHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzdHJpbmdzLmxlbmd0aCAhPT0gMiB8fCBzdHJpbmdzWzBdICE9PSAnJyB8fCBzdHJpbmdzWzFdICE9PSAnJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb29sZWFuIGF0dHJpYnV0ZXMgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9ICEhdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG59XG4vKipcbiAqIFNldHMgYXR0cmlidXRlIHZhbHVlcyBmb3IgUHJvcGVydHlQYXJ0cywgc28gdGhhdCB0aGUgdmFsdWUgaXMgb25seSBzZXQgb25jZVxuICogZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHMgZm9yIGEgcHJvcGVydHkuXG4gKlxuICogSWYgYW4gZXhwcmVzc2lvbiBjb250cm9scyB0aGUgd2hvbGUgcHJvcGVydHkgdmFsdWUsIHRoZW4gdGhlIHZhbHVlIGlzIHNpbXBseVxuICogYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IHVuZGVyIGNvbnRyb2wuIElmIHRoZXJlIGFyZSBzdHJpbmcgbGl0ZXJhbHMgb3JcbiAqIG11bHRpcGxlIGV4cHJlc3Npb25zLCB0aGVuIHRoZSBzdHJpbmdzIGFyZSBleHByZXNzaW9ucyBhcmUgaW50ZXJwb2xhdGVkIGludG9cbiAqIGEgc3RyaW5nIGZpcnN0LlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlDb21taXR0ZXIgZXh0ZW5kcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHRoaXMuc2luZ2xlID1cbiAgICAgICAgICAgIChzdHJpbmdzLmxlbmd0aCA9PT0gMiAmJiBzdHJpbmdzWzBdID09PSAnJyAmJiBzdHJpbmdzWzFdID09PSAnJyk7XG4gICAgfVxuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5UGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5zaW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnRzWzBdLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0VmFsdWUoKTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMubmFtZV0gPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xufVxuLy8gRGV0ZWN0IGV2ZW50IGxpc3RlbmVyIG9wdGlvbnMgc3VwcG9ydC4gSWYgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eSBpcyByZWFkXG4vLyBmcm9tIHRoZSBvcHRpb25zIG9iamVjdCwgdGhlbiBvcHRpb25zIGFyZSBzdXBwb3J0ZWQuIElmIG5vdCwgdGhlbiB0aGUgdGhyaWRcbi8vIGFyZ3VtZW50IHRvIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlzIGludGVycHJldGVkIGFzIHRoZSBib29sZWFuIGNhcHR1cmVcbi8vIHZhbHVlIHNvIHdlIHNob3VsZCBvbmx5IHBhc3MgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eS5cbmxldCBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSBmYWxzZTtcbnRyeSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZ2V0IGNhcHR1cmUoKSB7XG4gICAgICAgICAgICBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbn1cbmNhdGNoIChfZSkge1xufVxuZXhwb3J0IGNsYXNzIEV2ZW50UGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgZXZlbnROYW1lLCBldmVudENvbnRleHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuZXZlbnRDb250ZXh0ID0gZXZlbnRDb250ZXh0O1xuICAgICAgICB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCA9IChlKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGUpO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0xpc3RlbmVyID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLnZhbHVlO1xuICAgICAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9IG5ld0xpc3RlbmVyID09IG51bGwgfHxcbiAgICAgICAgICAgIG9sZExpc3RlbmVyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAobmV3TGlzdGVuZXIuY2FwdHVyZSAhPT0gb2xkTGlzdGVuZXIuY2FwdHVyZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5vbmNlICE9PSBvbGRMaXN0ZW5lci5vbmNlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLnBhc3NpdmUgIT09IG9sZExpc3RlbmVyLnBhc3NpdmUpO1xuICAgICAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9IG5ld0xpc3RlbmVyICE9IG51bGwgJiYgKG9sZExpc3RlbmVyID09IG51bGwgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuICAgICAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaG91bGRBZGRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5fX29wdGlvbnMgPSBnZXRPcHRpb25zKG5ld0xpc3RlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuY2FsbCh0aGlzLmV2ZW50Q29udGV4dCB8fCB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gV2UgY29weSBvcHRpb25zIGJlY2F1c2Ugb2YgdGhlIGluY29uc2lzdGVudCBiZWhhdmlvciBvZiBicm93c2VycyB3aGVuIHJlYWRpbmdcbi8vIHRoZSB0aGlyZCBhcmd1bWVudCBvZiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci4gSUUxMSBkb2Vzbid0IHN1cHBvcnQgb3B0aW9uc1xuLy8gYXQgYWxsLiBDaHJvbWUgNDEgb25seSByZWFkcyBgY2FwdHVyZWAgaWYgdGhlIGFyZ3VtZW50IGlzIGFuIG9iamVjdC5cbmNvbnN0IGdldE9wdGlvbnMgPSAobykgPT4gbyAmJlxuICAgIChldmVudE9wdGlvbnNTdXBwb3J0ZWQgP1xuICAgICAgICB7IGNhcHR1cmU6IG8uY2FwdHVyZSwgcGFzc2l2ZTogby5wYXNzaXZlLCBvbmNlOiBvLm9uY2UgfSA6XG4gICAgICAgIG8uY2FwdHVyZSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0cy5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciB9IGZyb20gJy4vcGFydHMuanMnO1xuLyoqXG4gKiBDcmVhdGVzIFBhcnRzIHdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3Ige1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYW4gYXR0cmlidXRlLXBvc2l0aW9uIGJpbmRpbmcsIGdpdmVuIHRoZSBldmVudCwgYXR0cmlidXRlXG4gICAgICogbmFtZSwgYW5kIHN0cmluZyBsaXRlcmFscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gbmFtZSAgVGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtIHN0cmluZ3MgVGhlIHN0cmluZyBsaXRlcmFscy4gVGhlcmUgYXJlIGFsd2F5cyBhdCBsZWFzdCB0d28gc3RyaW5ncyxcbiAgICAgKiAgIGV2ZW50IGZvciBmdWxseS1jb250cm9sbGVkIGJpbmRpbmdzIHdpdGggYSBzaW5nbGUgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBoYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IG5hbWVbMF07XG4gICAgICAgIGlmIChwcmVmaXggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IFByb3BlcnR5Q29tbWl0dGVyKGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnQCcpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEV2ZW50UGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBvcHRpb25zLmV2ZW50Q29udGV4dCldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICc/Jykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgQm9vbGVhbkF0dHJpYnV0ZVBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBBdHRyaWJ1dGVDb21taXR0ZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYSB0ZXh0LXBvc2l0aW9uIGJpbmRpbmcuXG4gICAgICogQHBhcmFtIHRlbXBsYXRlRmFjdG9yeVxuICAgICAqL1xuICAgIGhhbmRsZVRleHRFeHByZXNzaW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlUGFydChvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yID0gbmV3IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgbWFya2VyLCBUZW1wbGF0ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBUaGUgZGVmYXVsdCBUZW1wbGF0ZUZhY3Rvcnkgd2hpY2ggY2FjaGVzIFRlbXBsYXRlcyBrZXllZCBvblxuICogcmVzdWx0LnR5cGUgYW5kIHJlc3VsdC5zdHJpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVGYWN0b3J5KHJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZUNhY2hlID0gdGVtcGxhdGVDYWNoZXMuZ2V0KHJlc3VsdC50eXBlKTtcbiAgICBpZiAodGVtcGxhdGVDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUgPSB7XG4gICAgICAgICAgICBzdHJpbmdzQXJyYXk6IG5ldyBXZWFrTWFwKCksXG4gICAgICAgICAgICBrZXlTdHJpbmc6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlcy5zZXQocmVzdWx0LnR5cGUsIHRlbXBsYXRlQ2FjaGUpO1xuICAgIH1cbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFRlbXBsYXRlU3RyaW5nc0FycmF5IGlzIG5ldywgZ2VuZXJhdGUgYSBrZXkgZnJvbSB0aGUgc3RyaW5nc1xuICAgIC8vIFRoaXMga2V5IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXMgd2l0aCBpZGVudGljYWwgY29udGVudFxuICAgIGNvbnN0IGtleSA9IHJlc3VsdC5zdHJpbmdzLmpvaW4obWFya2VyKTtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLmdldChrZXkpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm90IHNlZW4gdGhpcyBrZXkgYmVmb3JlLCBjcmVhdGUgYSBuZXcgVGVtcGxhdGVcbiAgICAgICAgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0LCByZXN1bHQuZ2V0VGVtcGxhdGVFbGVtZW50KCkpO1xuICAgICAgICAvLyBDYWNoZSB0aGUgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLnNldChrZXksIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLy8gQ2FjaGUgYWxsIGZ1dHVyZSBxdWVyaWVzIGZvciB0aGlzIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gICAgdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuc2V0KHJlc3VsdC5zdHJpbmdzLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xufVxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlQ2FjaGVzID0gbmV3IE1hcCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtZmFjdG9yeS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBOb2RlUGFydCB9IGZyb20gJy4vcGFydHMuanMnO1xuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCBjb25zdCBwYXJ0cyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIFJlbmRlcnMgYSB0ZW1wbGF0ZSByZXN1bHQgb3Igb3RoZXIgdmFsdWUgdG8gYSBjb250YWluZXIuXG4gKlxuICogVG8gdXBkYXRlIGEgY29udGFpbmVyIHdpdGggbmV3IHZhbHVlcywgcmVldmFsdWF0ZSB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBhbmRcbiAqIGNhbGwgYHJlbmRlcmAgd2l0aCB0aGUgbmV3IHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gcmVzdWx0IEFueSB2YWx1ZSByZW5kZXJhYmxlIGJ5IE5vZGVQYXJ0IC0gdHlwaWNhbGx5IGEgVGVtcGxhdGVSZXN1bHRcbiAqICAgICBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWcgbGlrZSBgaHRtbGAgb3IgYHN2Z2AuXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIHBhcmVudCB0byByZW5kZXIgdG8uIFRoZSBlbnRpcmUgY29udGVudHMgYXJlIGVpdGhlclxuICogICAgIHJlcGxhY2VkLCBvciBlZmZpY2llbnRseSB1cGRhdGVkIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhcyBwcmV2aW91c1xuICogICAgIHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgUmVuZGVyT3B0aW9ucyBmb3IgdGhlIGVudGlyZSByZW5kZXIgdHJlZSByZW5kZXJlZCB0byB0aGlzXG4gKiAgICAgY29udGFpbmVyLiBSZW5kZXIgb3B0aW9ucyBtdXN0ICpub3QqIGNoYW5nZSBiZXR3ZWVuIHJlbmRlcnMgdG8gdGhlIHNhbWVcbiAqICAgICBjb250YWluZXIsIGFzIHRob3NlIGNoYW5nZXMgd2lsbCBub3QgZWZmZWN0IHByZXZpb3VzbHkgcmVuZGVyZWQgRE9NLlxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKHJlc3VsdCwgY29udGFpbmVyLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IHBhcnQgPSBwYXJ0cy5nZXQoY29udGFpbmVyKTtcbiAgICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKGNvbnRhaW5lciwgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICBwYXJ0cy5zZXQoY29udGFpbmVyLCBwYXJ0ID0gbmV3IE5vZGVQYXJ0KE9iamVjdC5hc3NpZ24oeyB0ZW1wbGF0ZUZhY3RvcnkgfSwgb3B0aW9ucykpKTtcbiAgICAgICAgcGFydC5hcHBlbmRJbnRvKGNvbnRhaW5lcik7XG4gICAgfVxuICAgIHBhcnQuc2V0VmFsdWUocmVzdWx0KTtcbiAgICBwYXJ0LmNvbW1pdCgpO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqXG4gKiBNYWluIGxpdC1odG1sIG1vZHVsZS5cbiAqXG4gKiBNYWluIGV4cG9ydHM6XG4gKlxuICogLSAgW1todG1sXV1cbiAqIC0gIFtbc3ZnXV1cbiAqIC0gIFtbcmVuZGVyXV1cbiAqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKiBAcHJlZmVycmVkXG4gKi9cbi8qKlxuICogRG8gbm90IHJlbW92ZSB0aGlzIGNvbW1lbnQ7IGl0IGtlZXBzIHR5cGVkb2MgZnJvbSBtaXNwbGFjaW5nIHRoZSBtb2R1bGVcbiAqIGRvY3MuXG4gKi9cbmltcG9ydCB7IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmltcG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmV4cG9ydCB7IGRpcmVjdGl2ZSwgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2xpYi9kaXJlY3RpdmUuanMnO1xuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogcmVtb3ZlIGxpbmUgd2hlbiB3ZSBnZXQgTm9kZVBhcnQgbW92aW5nIG1ldGhvZHNcbmV4cG9ydCB7IHJlbW92ZU5vZGVzLCByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9saWIvZG9tLmpzJztcbmV4cG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9saWIvcGFydC5qcyc7XG5leHBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEF0dHJpYnV0ZVBhcnQsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIGlzSXRlcmFibGUsIGlzUHJpbWl0aXZlLCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIsIFByb3BlcnR5UGFydCB9IGZyb20gJy4vbGliL3BhcnRzLmpzJztcbmV4cG9ydCB7IHBhcnRzLCByZW5kZXIgfSBmcm9tICcuL2xpYi9yZW5kZXIuanMnO1xuZXhwb3J0IHsgdGVtcGxhdGVDYWNoZXMsIHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmV4cG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBjcmVhdGVNYXJrZXIsIGlzVGVtcGxhdGVQYXJ0QWN0aXZlLCBUZW1wbGF0ZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLmpzJztcbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBpbmplY3QgdmVyc2lvbiBudW1iZXIgYXQgYnVpbGQgdGltZVxuKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gfHwgKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gPSBbXSkpLnB1c2goJzEuMS4yJyk7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBTVkdUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdzdmcnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGl0LWh0bWwuanMubWFwIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHkgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlTWFwcGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBhbnksIFQgPSBhbnk+ID0gKHRoaXM6IEMsIHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiBUIHwgbnVsbDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlNYXBwZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IGFueSwgVCA9IGFueT4gPSAodGhpczogQywgdmFsdWU6IFQgfCBudWxsKSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEFuIG9iamVjdCB0aGF0IGhvbGRzIGFuIHtAbGluayBBdHRyaWJ1dGVNYXBwZXJ9IGFuZCBhIHtAbGluayBQcm9wZXJ0eU1hcHBlcn1cbiAqXG4gKiBAcmVtYXJrc1xuICogRm9yIHRoZSBtb3N0IGNvbW1vbiB0eXBlcywgYSBjb252ZXJ0ZXIgZXhpc3RzIHdoaWNoIGNhbiBiZSByZWZlcmVuY2VkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBAcHJvcGVydHkoe1xuICogICAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ29udmVydGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBhbnksIFQgPSBhbnk+IHtcbiAgICB0b0F0dHJpYnV0ZTogUHJvcGVydHlNYXBwZXI8QywgVD47XG4gICAgZnJvbUF0dHJpYnV0ZTogQXR0cmlidXRlTWFwcGVyPEMsIFQ+O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBjb252ZXJ0ZXJcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhpcyBjb252ZXJ0ZXIgaXMgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb252ZXJ0ZXIgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHVubGVzcyBhIGRpZmZlcmVudCBvbmVcbiAqIGlzIHNwZWNpZmllZC4gVGhlIGNvbnZlcnRlciB0cmllcyB0byBpbmZlciB0aGUgcHJvcGVydHkgdHlwZSB3aGVuIGNvbnZlcnRpbmcgdG8gYXR0cmlidXRlcyBhbmRcbiAqIHVzZXMgYEpTT04ucGFyc2UoKWAgd2hlbiBjb252ZXJ0aW5nIHN0cmluZ3MgZnJvbSBhdHRyaWJ1dGVzLiBJZiBgSlNPTi5wYXJzZSgpYCB0aHJvd3MgYW4gZXJyb3IsXG4gKiB0aGUgY29udmVydGVyIHdpbGwgdXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0OiBBdHRyaWJ1dGVDb252ZXJ0ZXIgPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCBzdWNjZXNzZnVsbHkgcGFyc2UgYGJvb2xlYW5gLCBgbnVtYmVyYCBhbmQgYEpTT04uc3RyaW5naWZ5YCdkIHZhbHVlc1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0IHRocm93cywgaXQgbWVhbnMgd2UncmUgcHJvYmFibHkgZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgfSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG51bWJlciwgYmlnaW50LCBzeW1ib2wsIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBhdHRyaWJ1dGVzLCBsaWtlIGBkaXNhYmxlZGAsIHdoaWNoIGFyZSBjb25zaWRlcmVkIHRydWUgaWYgdGhleSBhcmUgc2V0IHdpdGhcbiAqIGFueSB2YWx1ZSBhdCBhbGwuIEluIG9yZGVyIHRvIHNldCB0aGUgYXR0cmlidXRlIHRvIGZhbHNlLCB0aGUgYXR0cmlidXRlIGhhcyB0byBiZSByZW1vdmVkIGJ5XG4gKiBzZXR0aW5nIHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gYG51bGxgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPGFueSwgYm9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgIT09IG51bGwpLFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGJvb2xlYW4gfCBudWxsKSA9PiB2YWx1ZSA/ICcnIDogbnVsbFxufVxuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBBUklBIGF0dHJpYnV0ZXMsIGxpa2UgYGFyaWEtY2hlY2tlZGAgb3IgYGFyaWEtc2VsZWN0ZWRgLCB3aGljaCBoYXZlIHRvIGJlXG4gKiBzZXQgZXhwbGljaXRseSB0byBgdHJ1ZWAgb3IgYGZhbHNlYC5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWUpID0+IHZhbHVlID09PSAndHJ1ZScsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPGFueSwgc3RyaW5nPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogdmFsdWUsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdmFsdWVcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlcjogQXR0cmlidXRlQ29udmVydGVyPGFueSwgbnVtYmVyPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogTnVtYmVyKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJPYmplY3Q6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnksIG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnksIGFueVtdPiA9IHtcbiAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogSlNPTi5wYXJzZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGFueVtdIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn07XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEYXRlOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBEYXRlPiA9IHtcbiAgICAvLyBgbmV3IERhdGUoKWAgd2lsbCByZXR1cm4gYW4gYEludmFsaWQgRGF0ZWAgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBuZXcgRGF0ZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IERhdGUgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBzZWxlY3RvciBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzZWxlY3RvciB3aWxsIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB3aXRoIHRoZSBicm93c2VyJ3NcbiAgICAgKiB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEkuIElmIG5vIHNlbGVjdG9yIGlzIHNwZWNpZmllZCwgdGhlIGNvbXBvbmVudCBjbGFzc1xuICAgICAqIG5lZWRzIHRvIHByb3ZpZGUgb25lIGluIGl0cyBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zZWxlY3Rvcn0gcHJvcGVydHkuXG4gICAgICogQSBzZWxlY3RvciBkZWZpbmVkIGluIHRoZSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlXG4gICAgICogc3RhdGljIGNsYXNzIHByb3BlcnR5LlxuICAgICAqL1xuICAgIHNlbGVjdG9yOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET00gdG8gcmVuZGVyIHRoZSBjb21wb25lbnRzIHRlbXBsYXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTaGFkb3cgRE9NIGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgICogY29tcG9uZW50J3MgdGVtcGxhdGUgd2lsbCBiZSByZW5kZXJlZCBhcyBjaGlsZCBub2RlcyBvZiB0aGUgY29tcG9uZW50LiBUaGlzIGNhbiBiZVxuICAgICAqIHVzZWZ1bCBpZiBhbiBpc29sYXRlZCBET00gYW5kIHNjb3BlZCBDU1MgaXMgbm90IGRlc2lyZWQuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBzaGFkb3c6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSByZWdpc3RlciB0aGUgY29tcG9uZW50IHdpdGggdGhlIGJyb3dzZXIncyB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluIGNhc2VzIHdoZXJlIHlvdSB3YW50IHRvIGVtcGxveSBhIG1vZHVsZSBzeXN0ZW0gd2hpY2ggcmVnaXN0ZXJzIGNvbXBvbmVudHMgb24gYVxuICAgICAqIGNvbmRpdGlvbmFsIGJhc2lzLCB5b3UgY2FuIGRpc2FibGUgYXV0b21hdGljIHJlZ2lzdHJhdGlvbiBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAuXG4gICAgICogWW91ciBtb2R1bGUgb3IgYm9vdHN0cmFwIHN5c3RlbSB3aWxsIGhhdmUgdG8gdGFrZSBjYXJlIG9mIGRlZmluaW5nIHRoZSBjb21wb25lbnQgbGF0ZXIuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBkZWZpbmU6IGJvb2xlYW47XG4gICAgLy8gVE9ETzogdGVzdCBtZWRpYSBxdWVyaWVzXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBBbiBhcnJheSBvZiBDU1MgcnVsZXNldHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9TeW50YXgjQ1NTX3J1bGVzZXRzKS5cbiAgICAgKiBTdHlsZXMgZGVmaW5lZCB1c2luZyB0aGUgZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggc3R5bGVzIGRlZmluZWQgaW4gdGhlIGNvbXBvbmVudCdzXG4gICAgICogc3RhdGljIHtAbGluayBDb21wb25lbnQuc3R5bGVzfSBnZXR0ZXIuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzdHlsZXM6IFtcbiAgICAgKiAgICAgICAgICAnaDEsIGgyIHsgZm9udC1zaXplOiAxNnB0OyB9JyxcbiAgICAgKiAgICAgICAgICAnQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogOTAwcHgpIHsgYXJ0aWNsZSB7IHBhZGRpbmc6IDFyZW0gM3JlbTsgfSB9J1xuICAgICAqICAgICAgXVxuICAgICAqIH0pXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqL1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIC8vIFRPRE86IHVwZGF0ZSBkb2N1bWVudGF0aW9uXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHtAbGluayAjbGl0LWh0bWwuVGVtcGxhdGVSZXN1bHR9LiBUaGUgZnVuY3Rpb24ncyBgZWxlbWVudGBcbiAgICAgKiBwYXJhbWV0ZXIgd2lsbCBiZSB0aGUgY3VycmVudCBjb21wb25lbnQgaW5zdGFuY2UuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIGJ5IHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBUaGUgbWV0aG9kIG11c3QgcmV0dXJuIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB3aGljaCBpcyBjcmVhdGVkIHVzaW5nIGxpdC1odG1sJ3NcbiAgICAgKiB7QGxpbmsgbGl0LWh0bWwjaHRtbCB8IGBodG1sYH0gb3Ige0BsaW5rIGxpdC1odG1sI3N2ZyB8IGBzdmdgfSB0ZW1wbGF0ZSBtZXRob2RzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHVuZGVmaW5lZGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBjb21wb25lbnQgaW5zdGFuY2UgcmVxdWVzdGluZyB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZT86IChlbGVtZW50OiBUeXBlLCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OOiBDb21wb25lbnREZWNsYXJhdGlvbiA9IHtcbiAgICBzZWxlY3RvcjogJycsXG4gICAgc2hhZG93OiB0cnVlLFxuICAgIGRlZmluZTogdHJ1ZSxcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50RGVjbGFyYXRpb24sIERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OIH0gZnJvbSAnLi9jb21wb25lbnQtZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSB9IGZyb20gJy4vcHJvcGVydHkuanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IGNsYXNzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnQ8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8Q29tcG9uZW50RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0geyAuLi5ERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgcmV0dXJuICh0YXJnZXQ6IHR5cGVvZiBDb21wb25lbnQpID0+IHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldCBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yLnNlbGVjdG9yID0gZGVjbGFyYXRpb24uc2VsZWN0b3IgfHwgdGFyZ2V0LnNlbGVjdG9yO1xuICAgICAgICBjb25zdHJ1Y3Rvci5zaGFkb3cgPSBkZWNsYXJhdGlvbi5zaGFkb3c7XG4gICAgICAgIGNvbnN0cnVjdG9yLnRlbXBsYXRlID0gZGVjbGFyYXRpb24udGVtcGxhdGUgfHwgdGFyZ2V0LnRlbXBsYXRlO1xuXG4gICAgICAgIC8vIHVzZSBrZXlvZiBzaWduYXR1cmVzIHRvIGNhdGNoIHJlZmFjdG9yaW5nIGVycm9yc1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnb2JzZXJ2ZWRBdHRyaWJ1dGVzJztcbiAgICAgICAgY29uc3Qgc3R5bGVzS2V5OiBrZXlvZiB0eXBlb2YgQ29tcG9uZW50ID0gJ3N0eWxlcyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3BlcnR5IGRlY29yYXRvcnMgZ2V0IGNhbGxlZCBiZWZvcmUgY2xhc3MgZGVjb3JhdG9ycywgc28gYXQgdGhpcyBwb2ludCBhbGwgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICogaGF2ZSBzdG9yZWQgdGhlaXIgYXNzb2NpYXRlZCBhdHRyaWJ1dGVzIGluIHtAbGluayBDb21wb25lbnQuYXR0cmlidXRlc30uXG4gICAgICAgICAqIFdlIGNhbiBub3cgY29tYmluZSB0aGVtIHdpdGggdGhlIHVzZXItZGVmaW5lZCB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gYW5kLFxuICAgICAgICAgKiBieSB1c2luZyBhIFNldCwgZWxpbWluYXRlIGFsbCBkdXBsaWNhdGVzIGluIHRoZSBwcm9jZXNzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBBcyB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSB3aWxsIGFsc28gaW5jbHVkZSBkZWNvcmF0b3IgZ2VuZXJhdGVkXG4gICAgICAgICAqIG9ic2VydmVkIGF0dHJpYnV0ZXMsIHdlIGFsd2F5cyBpbmhlcml0IGFsbCBvYnNlcnZlZCBhdHRyaWJ1dGVzIGZyb20gYSBiYXNlIGNsYXNzLiBGb3IgdGhhdCByZWFzb25cbiAgICAgICAgICogd2UgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIGF0dHJpYnV0ZSBvdmVycmlkZXMgd2hlbiBleHRlbmRpbmcgYW55IHtAbGluayBDb21wb25lbnR9IGJhc2UgY2xhc3MuXG4gICAgICAgICAqIFRoaXMgaXMgZG9uZSBpbiB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IuIEhlcmUgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdG8gcmVtb3ZlIG92ZXJyaWRkZW5cbiAgICAgICAgICogYXR0cmlidXRlcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlcyA9IFtcbiAgICAgICAgICAgIC4uLm5ldyBTZXQoXG4gICAgICAgICAgICAgICAgLy8gd2UgdGFrZSB0aGUgaW5oZXJpdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4ucmVtb3ZlIG92ZXJyaWRkZW4gZ2VuZXJhdGVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgoYXR0cmlidXRlcywgYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4gJiYgY29uc3RydWN0b3Iub3ZlcnJpZGRlbi5oYXMoYXR0cmlidXRlKSA/IFtdIDogYXR0cmlidXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdIGFzIHN0cmluZ1tdXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4uYW5kIHJlY29tYmluZSB0aGUgbGlzdCB3aXRoIHRoZSBuZXdseSBnZW5lcmF0ZWQgYXR0cmlidXRlcyAodGhlIFNldCBwcmV2ZW50cyBkdXBsaWNhdGVzKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KFsuLi50YXJnZXQuYXR0cmlidXRlcy5rZXlzKCldKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIGRlbGV0ZSB0aGUgb3ZlcnJpZGRlbiBTZXQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIGRvbid0IHdhbnQgdG8gaW5oZXJpdCBzdHlsZXMgYXV0b21hdGljYWxseSwgdW5sZXNzIGV4cGxpY2l0bHkgcmVxdWVzdGVkLCBzbyB3ZSBjaGVjayBpZiB0aGVcbiAgICAgICAgICogY29uc3RydWN0b3IgZGVjbGFyZXMgYSBzdGF0aWMgc3R5bGVzIHByb3BlcnR5ICh3aGljaCBtYXkgdXNlIHN1cGVyLnN0eWxlcyB0byBleHBsaWNpdGx5IGluaGVyaXQpXG4gICAgICAgICAqIGFuZCBpZiBpdCBkb2Vzbid0LCB3ZSBpZ25vcmUgdGhlIHBhcmVudCBjbGFzcydzIHN0eWxlcyAoYnkgbm90IGludm9raW5nIHRoZSBnZXR0ZXIpLlxuICAgICAgICAgKiBXZSB0aGVuIG1lcmdlIHRoZSBkZWNvcmF0b3IgZGVmaW5lZCBzdHlsZXMgKGlmIGV4aXN0aW5nKSBpbnRvIHRoZSBzdHlsZXMgYW5kIHJlbW92ZSBkdXBsaWNhdGVzXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAoY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoc3R5bGVzS2V5KVxuICAgICAgICAgICAgICAgICAgICA/IGNvbnN0cnVjdG9yLnN0eWxlc1xuICAgICAgICAgICAgICAgICAgICA6IFtdXG4gICAgICAgICAgICAgICAgKS5jb25jYXQoZGVjbGFyYXRpb24uc3R5bGVzIHx8IFtdKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaW5hbGx5IHdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHVzZXIgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGdlbmVyYXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgb2JzZXJ2ZWRBdHRyaWJ1dGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBvdmVycmlkZSB0aGUge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlciB3aXRoIGEgbmV3IG9uZSwgd2hpY2ggcmV0dXJuc1xuICAgICAgICAgKiB0aGUgdW5pcXVlIHNldCBvZiBzdGF0aWNhbGx5IGRlZmluZWQgYW5kIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcy5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIHN0eWxlc0tleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5kZWZpbmUpIHtcblxuICAgICAgICAgICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZShjb25zdHJ1Y3Rvci5zZWxlY3RvciwgY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgTGlzdGVuZXJEZWNsYXJhdGlvbiB9IGZyb20gJy4vbGlzdGVuZXItZGVjbGFyYXRpb24uanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IG1ldGhvZCBhcyBhbiBldmVudCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IExpc3RlbmVyRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5ldmVudCA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBMaXN0ZW5lckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIGxpc3RlbmVyIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yIHN0b3JlcyBsaXN0ZW5lciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBsaXN0ZW5lcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgbGlzdGVuZXIgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBiYXNlIGNsYXNzJ3MgbWFwIHRvIHByb3Blcmx5IGluaGVyaXQgYWxsIGxpc3RlbmVyIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiB0eXBlb2YgQ29tcG9uZW50KSB7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KCdsaXN0ZW5lcnMnKSkgY29uc3RydWN0b3IubGlzdGVuZXJzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5saXN0ZW5lcnMpO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IHNlbGVjdG9yIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0b3JEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlbGVjdG9yIHRvIHF1ZXJ5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNldHRpbmcgcXVlcnkgdG8gYG51bGxgIGFsbG93cyB0byB1bmJpbmQgYW4gaW5oZXJpdGVkIHNlbGVjdG9yLlxuICAgICAqL1xuICAgIHF1ZXJ5OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJvb3QgZWxlbWVudC9kb2N1bWVudCBmcm9tIHdoaWNoIHRvIHF1ZXJ5XG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBUaGUgY29tcG9uZW50J3MgYHJlbmRlclJvb3RgXG4gICAgICovXG4gICAgcm9vdD86IERvY3VtZW50IHwgRG9jdW1lbnRGcmFnbWVudCB8IEVsZW1lbnQgfCAoKHRoaXM6IFR5cGUpID0+IERvY3VtZW50IHwgRG9jdW1lbnRGcmFnbWVudCB8IEVsZW1lbnQgfCB1bmRlZmluZWQpO1xuXG4gICAgLyoqXG4gICAgICogVXNlIHF1ZXJ5U2VsZWN0b3JBbGwgZm9yIHF1ZXJ5aW5nXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgZmFsc2VgXG4gICAgICovXG4gICAgYWxsPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VMRUNUT1JfREVDTEFSQVRJT046IFNlbGVjdG9yRGVjbGFyYXRpb24gPSB7XG4gICAgcXVlcnk6IG51bGwsXG4gICAgYWxsOiBmYWxzZSxcbn07XG4iLCIvKipcbiAqIEdldCB0aGUge0BsaW5rIFByb3BlcnR5RGVzY3JpcHRvcn0gb2YgYSBwcm9wZXJ0eSBmcm9tIGl0cyBwcm90b3R5cGVcbiAqIG9yIGEgcGFyZW50IHByb3RvdHlwZSAtIGV4Y2x1ZGluZyB7QGxpbmsgT2JqZWN0LnByb3RvdHlwZX0gaXRzZWxmLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgICAgICAgIFRoZSBwcm90b3R5cGUgdG8gZ2V0IHRoZSBkZXNjcmlwdG9yIGZyb21cbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGVzY3JpcHRvclxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BlcnR5RGVzY3JpcHRvciAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZCB7XG5cbiAgICBpZiAocHJvcGVydHlLZXkgaW4gdGFyZ2V0KSB7XG5cbiAgICAgICAgd2hpbGUgKHRhcmdldCAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KHByb3BlcnR5S2V5KSkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhcmdldCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsIi8qKlxuICogQSB0YXNrIG9iamVjdCBpbnRlcmZhY2UgYXMgcmV0dXJuZWQgYnkgdGhlIHNjaGVkdWxlciBtZXRob2RzXG4gKlxuICogQHJlbWFya3NcbiAqIEEgdGFzayBpcyBhbiBvYmplY3QgY29uc2lzdGluZyBvZiBhIHtAbGluayBQcm9taXNlfSB3aGljaCB3aWxsIGJlIHJlc29sdmVkXG4gKiB3aGVuIHRoZSB0YXNrIGNhbGxiYWNrIHdhcyBleGVjdXRlZCBhbmQgYSBjYW5jZWwgbWV0aG9kLCB3aGljaCB3aWxsIHByZXZlbnRcbiAqIHRoZSB0YXNrIGNhbGxiYWNrIGZyb20gYmVpbmcgZXhlY3V0ZWQgYW5kIHJlamVjdCB0aGUgdGFzaydzIFByb21pc2UuIEEgdGFza1xuICogd2hpY2ggaXMgYWxyZWFkeSByZXNvbHZlZCBjYW5ub3QgYmUgY2FuY2VsZWQgYW55bW9yZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXNrPFQgPSBhbnk+IHtcbiAgICBwcm9taXNlOiBQcm9taXNlPFQ+O1xuICAgIGNhbmNlbDogKCkgPT4gdm9pZDtcbn07XG5cbi8qKlxuICogQSBzcGVjaWFsIGVycm9yIGNsYXNzIHdoaWNoIGlzIHRocm93biB3aGVuIGEgdGFzayBpcyBjYW5jZWxlZFxuICpcbiAqIEByZW1hcmtzXG4gKiBUaGlzIGVycm9yIGNsYXNzIGlzIHVzZWQgdG8gcmVqZWN0IGEgdGFzaydzIFByb21pc2UsIHdoZW4gdGhlIHRhc2tcbiAqIGlzIGNhbmNlbGVkLiBZb3UgY2FuIGNoZWNrIGZvciB0aGlzIHNwZWNpZmljIGVycm9yLCB0byBoYW5kbGUgY2FuY2VsZWRcbiAqIHRhc2tzIGRpZmZlcmVudCBmcm9tIG90aGVyd2lzZSByZWplY3RlZCB0YXNrcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCB0YXNrID0gbWljcm9UYXNrKCgpID0+IHtcbiAqICAgICAgLy8gZG8gc3RoLi4uXG4gKiB9KTtcbiAqXG4gKiB0YXNrLmNhbmNlbCgpO1xuICpcbiAqIHRhc2sucHJvbWlzZS5jYXRjaChyZWFzb24gPT4ge1xuICogICAgICBpZiAocmVhc29uIGluc3RhbmNlb2YgVGFza0NhbmNlbGVkRXJyb3IpIHtcbiAqICAgICAgICAgIC8vIC4uLnRoaXMgdGFzayB3YXMgY2FuY2VsZWRcbiAqICAgICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFRhc2tDYW5jZWxlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgY29uc3RydWN0b3IgKG1lc3NhZ2U/OiBzdHJpbmcpIHtcblxuICAgICAgICBzdXBlcihtZXNzYWdlKTtcblxuICAgICAgICB0aGlzLm5hbWUgPSAnVGFza0NhbmNlbGVkRXJyb3InO1xuICAgIH1cbn1cblxuY29uc3QgVEFTS19DQU5DRUxFRF9FUlJPUiA9ICgpID0+IG5ldyBUYXNrQ2FuY2VsZWRFcnJvcignVGFzayBjYW5jZWxlZC4nKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgbWljcm8tdGFzayBhbmQgcmV0dXJucyBhIFByb21pc2Ugd2hpY2ggd2lsbFxuICogcmVzb2x2ZSB3aGVuIHRoZSB0YXNrIHdhcyBleGVjdXRlZC5cbiAqXG4gKiBAcmVtYXJrc1xuICogVXNlcyB7QGxpbmsgUHJvbWlzZS50aGVufSB0byBzY2hlZHVsZSB0aGUgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBtaWNyby10YXNrLlxuICogSWYgdGhlIHRhc2sgaXMgY2FuY2VsZWQgYmVmb3JlIHRoZSBuZXh0IG1pY3JvLXRhc2ssIHRoZSBQcm9taXNlIGV4ZWN1dG9yIHdvbid0XG4gKiBydW4gdGhlIHRhc2sgY2FsbGJhY2sgYnV0IHJlamVjdCB0aGUgUHJvbWlzZS5cbiAqXG4gKiBAcGFyYW0gdGFzayAgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGVcbiAqIEByZXR1cm5zICAgICBBIFByb21pc2Ugd2hpY2ggd2lsbCByZXNvbHZlIGFmdGVyIHRoZSBjYWxsYmFjayB3YXMgZXhlY3V0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pY3JvVGFzazxUID0gYW55PiAodGFzazogKCkgPT4gVCk6IFRhc2s8VD4ge1xuXG4gICAgbGV0IGNhbmNlbGVkID0gZmFsc2U7XG5cbiAgICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBhY3R1YWwgUHJvbWlzZSBpcyBjcmVhdGVkIGluIGBQcm9taXNlLnRoZW5gJ3MgZXhlY3V0b3IsIGluIG9yZGVyXG4gICAgICAgICAqIGZvciBpdCB0byBleGVjdXRlIHRoZSB0YXNrIGluIHRoZSBuZXh0IG1pY3JvLXRhc2suIFRoaXMgbWVhbnMgd2UgY2FuJ3RcbiAgICAgICAgICogZ2V0IGEgcmVmZXJlbmNlIG9mIHRoZSBQcm9taXNlJ3MgcmVqZWN0IG1ldGhvZCBpbiB0aGUgc2NvcGUgb2YgdGhpc1xuICAgICAgICAgKiBmdW5jdGlvbi4gQnV0IHdlIGNhbiB1c2UgYSBsb2NhbCB2YXJpYWJsZSBpbiB0aGlzIGZ1bmN0aW9uJ3Mgc2NvcGUgdG9cbiAgICAgICAgICogcHJldmVudCB7QGxpbmsgcnVuVGFza30gdG8gYmUgZXhlY3V0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHtcblxuICAgICAgICAgICAgICAgIHJlamVjdChUQVNLX0NBTkNFTEVEX0VSUk9SKCkpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcnVuVGFzayh0YXNrLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNhbmNlbCA9ICgpID0+IGNhbmNlbGVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB7IHByb21pc2UsIGNhbmNlbCB9O1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBtYWNyby10YXNrIGFuZCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsXG4gKiByZXNvbHZlIHdoZW4gdGhlIHRhc2sgd2FzIGV4ZWN1dGVkXG4gKlxuICogQHJlbWFya3NcbiAqIFVzZXMge0BsaW5rIHNldFRpbWVvdXR9IHRvIHNjaGVkdWxlIHRoZSB0YXNrIGNhbGxiYWNrIGluIHRoZSBuZXh0IG1hY3JvLXRhc2suXG4gKiBJZiB0aGUgdGFzayBpcyBjYW5jZWxlZCBiZWZvcmUgdGhlIG5leHQgbWFjcm8tdGFzaywgdGhlIHRpbWVvdXQgaXMgY2xlYXJlZCBhbmRcbiAqIHRoZSBQcm9tc2llIGlzIHJlamVjdGVkLlxuICpcbiAqIEBwYXJhbSB0YXNrICBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZVxuICogQHJldHVybnMgICAgIEEgUHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgYWZ0ZXIgdGhlIGNhbGxiYWNrIHdhcyBleGVjdXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFjcm9UYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBUKTogVGFzazxUPiB7XG5cbiAgICBsZXQgY2FuY2VsITogKCkgPT4gdm9pZDtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgbGV0IHRpbWVvdXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHNldFRpbWVvdXQoKCkgPT4gcnVuVGFzayh0YXNrLCByZXNvbHZlLCByZWplY3QpLCAwKTtcblxuICAgICAgICBjYW5jZWwgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFRBU0tfQ0FOQ0VMRURfRVJST1IoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4geyBwcm9taXNlLCBjYW5jZWwgfTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lIGFuZCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsXG4gKiByZXNvbHZlIHdoZW4gdGhlIHRhc2sgd2FzIGV4ZWN1dGVkXG4gKlxuICogQHJlbWFya3NcbiAqIFVzZXMge0BsaW5rIHJlcXVlc3RBbmltYXRpb25GcmFtZX0gdG8gc2NoZWR1bGUgdGhlIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lLlxuICogSWYgdGhlIHRhc2sgaXMgY2FuY2VsZWQgYmVmb3JlIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZSwgdGhlIGFuaW1hdGlvbiBmcmFtZSBpcyBjYW5jZWxlZCBhbmRcbiAqIHRoZSBQcm9tc2llIGlzIHJlamVjdGVkLlxuICpcbiAqIEBwYXJhbSB0YXNrICBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZVxuICogQHJldHVybnMgICAgIEEgUHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgYWZ0ZXIgdGhlIGNhbGxiYWNrIHdhcyBleGVjdXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0aW9uRnJhbWVUYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBUKTogVGFzazxUPiB7XG5cbiAgICBsZXQgY2FuY2VsITogKCkgPT4gdm9pZDtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgbGV0IGFuaW1hdGlvbkZyYW1lOiBudW1iZXIgfCB1bmRlZmluZWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gcnVuVGFzayh0YXNrLCByZXNvbHZlLCByZWplY3QpKTtcblxuICAgICAgICBjYW5jZWwgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICByZWplY3QoVEFTS19DQU5DRUxFRF9FUlJPUigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7IHByb21pc2UsIGNhbmNlbCB9O1xufVxuXG4vKipcbiAqIFJ1bnMgYSB0YXNrIGNhbGxiYWNrIHNhZmVseSBhZ2FpbnN0IGEgUHJvbWlzZSdzIHJlamVjdCBhbmQgcmVzb2x2ZSBjYWxsYmFja3MuXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBydW5UYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBULCByZXNvbHZlOiAodmFsdWU6IFQpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbjogYW55KSA9PiB2b2lkKSB7XG5cbiAgICB0cnkge1xuXG4gICAgICAgIHJlc29sdmUodGFzaygpKTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgU2VsZWN0b3JEZWNsYXJhdGlvbiwgREVGQVVMVF9TRUxFQ1RPUl9ERUNMQVJBVElPTiB9IGZyb20gJy4vc2VsZWN0b3ItZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yIH0gZnJvbSAnLi91dGlscy9nZXQtcHJvcGVydHktZGVzY3JpcHRvci5qcyc7XG5pbXBvcnQgeyBtaWNyb1Rhc2sgfSBmcm9tICcuLi90YXNrcy5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHkgYXMgYSBzZWxlY3RvclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBzZWxlY3RvciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFNlbGVjdG9yRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBwcm9wZXJ0eURlc2NyaXB0b3IgfHwgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICBjb25zdCBoaWRkZW5LZXkgPSBTeW1ib2woYF9fJHsgcHJvcGVydHlLZXkudG9TdHJpbmcoKSB9YCk7XG5cbiAgICAgICAgY29uc3QgZ2V0dGVyID0gZGVzY3JpcHRvcj8uZ2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnkpIHsgcmV0dXJuIHRoaXNbaGlkZGVuS2V5XTsgfTtcbiAgICAgICAgY29uc3Qgc2V0dGVyID0gZGVzY3JpcHRvcj8uc2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnksIHZhbHVlOiBhbnkpIHsgdGhpc1toaWRkZW5LZXldID0gdmFsdWU7IH07XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlZERlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvciA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKHRoaXM6IFR5cGUpOiBhbnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQgKHRoaXM6IFR5cGUsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIHNldHRlci5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAvLyBzZWxlY3RvcnMgYXJlIHF1ZXJpZWQgZHVyaW5nIHRoZSB1cGRhdGUgY3ljbGUsIHRoaXMgbWVhbnMsIHdoZW4gdGhleSBjaGFuZ2VcbiAgICAgICAgICAgICAgICAvLyB3ZSBjYW5ub3QgdHJpZ2dlciBhbm90aGVyIHVwZGF0ZSBmcm9tIHdpdGhpbiB0aGUgY3VycmVudCB1cGRhdGUgY3ljbGVcbiAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIHVwZGF0ZSBqdXN0IGFmdGVyIHRoaXMgdXBkYXRlIGlzIG92ZXJcbiAgICAgICAgICAgICAgICAvLyBhbHNvLCBzZWxlY3RvcnMgYXJlIG5vdCBwcm9wZXJ0aWVzLCBzbyB0aGV5IGRvbid0IGFwcGVhciBpbiB0aGUgcHJvcGVydHkgbWFwc1xuICAgICAgICAgICAgICAgIC8vIHRoYXQncyB3aHkgd2UgaW52b2tlIHJlcXVlc3RVcGRhdGUgd2l0aG91dCBhbnkgcGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgIGlmIChvbGRWYWx1ZSAhPT0gZ2V0dGVyLmNhbGwodGhpcykpIHtcblxuICAgICAgICAgICAgICAgICAgICBtaWNyb1Rhc2soKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgb3B0aW9ucyA9IHsgLi4uREVGQVVMVF9TRUxFQ1RPUl9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucXVlcnkgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3Iuc2VsZWN0b3JzLmRlbGV0ZShwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3Iuc2VsZWN0b3JzLnNldChwcm9wZXJ0eUtleSwgeyAuLi5vcHRpb25zIH0gYXMgU2VsZWN0b3JEZWNsYXJhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgICAgICAvLyBpZiBubyBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBkZWNvcmF0b3Igd2hpY2ggbXVzdCByZXR1cm4gdm9pZCBhbmQgd2UgY2FuIGRlZmluZSB0aGUgd3JhcHBlZCBkZXNjcmlwdG9yIGhlcmVcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCB3cmFwcGVkRGVzY3JpcHRvcik7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gaWYgYSBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhbiBhY2Nlc3NvclxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIGFuZCB3ZSBtdXN0IHJldHVybiB0aGUgd3JhcHBlZCBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlZERlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBzZWxlY3RvciBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIHNlbGVjdG9yIGRlY29yYXRvciBzdG9yZXMgc2VsZWN0b3IgZGVjbGFyYXRpb25zIGluIHRoZSBjb25zdHJ1Y3Rvciwgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhlXG4gKiBzdGF0aWMgc2VsZWN0b3JzIGZpZWxkIGlzIGluaXRpYWxpemVkIG9uIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yLiBPdGhlcndpc2Ugd2UgYWRkIHNlbGVjdG9yIGRlY2xhcmF0aW9uc1xuICogdG8gdGhlIGJhc2UgY2xhc3MncyBzdGF0aWMgZmllbGQuIFdlIGFsc28gbWFrZSBzdXJlIHRvIGluaXRpYWxpemUgdGhlIHNlbGVjdG9yIG1hcCB3aXRoIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBiYXNlIGNsYXNzJ3MgbWFwIHRvIHByb3Blcmx5IGluaGVyaXQgYWxsIHNlbGVjdG9yIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiB0eXBlb2YgQ29tcG9uZW50KSB7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KCdzZWxlY3RvcnMnKSkgY29uc3RydWN0b3Iuc2VsZWN0b3JzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5zZWxlY3RvcnMpO1xufVxuIiwiY29uc3QgRklSU1QgPSAvXlteXS87XG5jb25zdCBTUEFDRVMgPSAvXFxzKyhbXFxTXSkvZztcbmNvbnN0IENBTUVMUyA9IC9bYS16XShbQS1aXSkvZztcbmNvbnN0IEtFQkFCUyA9IC8tKFthLXpdKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gS0VCQUJTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgS0VCQUJTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5jYXBpdGFsaXplKHN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZWJhYkNhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gQ0FNRUxTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1swXVswXSArICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBDQU1FTFMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcudG9Mb3dlckNhc2UoKSA6IHN0cmluZztcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXIsIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQgfSBmcm9tICcuL2F0dHJpYnV0ZS1jb252ZXJ0ZXIuanMnO1xuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnLi91dGlscy9zdHJpbmctdXRpbHMuanMnO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHlcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIGRpc3BhdGNoIGEgY3VzdG9tIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU5vdGlmaWVyPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYHRydWVgIGlmIHRoZSBgb2xkVmFsdWVgIGFuZCB0aGUgYG5ld1ZhbHVlYCBvZiBhIHByb3BlcnR5IGFyZSBkaWZmZXJlbnQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dHJpYnV0ZVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgQXR0cmlidXRlUmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgUHJvcGVydHlSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn1cbiAqXG4gKiBAcGFyYW0gbm90aWZpZXIgQSBub3RpZmllciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Tm90aWZpZXIgKG5vdGlmaWVyOiBhbnkpOiBub3RpZmllciBpcyBQcm9wZXJ0eU5vdGlmaWVyIHtcblxuICAgIHJldHVybiB0eXBlb2Ygbm90aWZpZXIgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gZGV0ZWN0b3IgQSBkZXRlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgKGRldGVjdG9yOiBhbnkpOiBkZXRlY3RvciBpcyBQcm9wZXJ0eUNoYW5nZURldGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgZGV0ZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlLZXl9XG4gKlxuICogQHBhcmFtIGtleSBBIHByb3BlcnR5IGtleSB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5S2V5IChrZXk6IGFueSk6IGtleSBpcyBQcm9wZXJ0eUtleSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGtleSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGtleSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIHN0cmluZyBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlIHJlbW92aW5nIGludmFsaWQgYXR0cmlidXRlIGNoYXJhY3RlcnNcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQSBzdHJpbmcgdG8gZW5jb2RlIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqIEByZXR1cm5zICAgICBBbiBlbmNvZGVkIHN0cmluZyB1c2FibGUgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUF0dHJpYnV0ZSAodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4ga2ViYWJDYXNlKHZhbHVlLnJlcGxhY2UoL1xcVysvZywgJy0nKS5yZXBsYWNlKC9cXC0kLywgJycpKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXR0cmlidXRlIG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBOdW1lcmljIHByb3BlcnR5IGluZGV4ZXMgb3Igc3ltYm9scyBjYW4gY29udGFpbiBpbnZhbGlkIGNoYXJhY3RlcnMgZm9yIGF0dHJpYnV0ZSBuYW1lcy4gVGhpcyBtZXRob2RcbiAqIHNhbml0aXplcyB0aG9zZSBjaGFyYWN0ZXJzIGFuZCByZXBsYWNlcyBzZXF1ZW5jZXMgb2YgaW52YWxpZCBjaGFyYWN0ZXJzIHdpdGggYSBkYXNoLlxuICogQXR0cmlidXRlIG5hbWVzIGFyZSBub3QgYWxsb3dlZCB0byBzdGFydCB3aXRoIG51bWJlcnMgZWl0aGVyIGFuZCBhcmUgcHJlZml4ZWQgd2l0aCAnYXR0ci0nLlxuICpcbiAqIE4uQi46IFdoZW4gdXNpbmcgY3VzdG9tIHN5bWJvbHMgYXMgcHJvcGVydHkga2V5cywgdXNlIHVuaXF1ZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzeW1ib2xzIHRvIGF2b2lkXG4gKiBjbGFzaGluZyBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgYSA9IFN5bWJvbCgpO1xuICogY29uc3QgYiA9IFN5bWJvbCgpO1xuICpcbiAqIGEgIT09IGI7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGEpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGIpOyAvLyBmYWxzZSAtLT4gJ2F0dHItc3ltYm9sJyA9PT0gJ2F0dHItc3ltYm9sJ1xuICpcbiAqIGNvbnN0IGMgPSBTeW1ib2woJ2MnKTtcbiAqIGNvbnN0IGQgPSBTeW1ib2woJ2QnKTtcbiAqXG4gKiBjICE9PSBkOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShjKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShkKTsgLy8gdHJ1ZSAtLT4gJ2F0dHItc3ltYm9sLWMnID09PSAnYXR0ci1zeW1ib2wtZCdcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgYXR0cmlidXRlIG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZU5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IHN0cmluZyB7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHJldHVybiBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgYXR0cmlidXRlIG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHJldHVybiBgYXR0ci0keyBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSkgfWA7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBldmVudCBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogRXZlbnQgbmFtZXMgZG9uJ3QgaGF2ZSB0aGUgc2FtZSByZXN0cmljdGlvbnMgYXMgYXR0cmlidXRlIG5hbWVzIHdoZW4gaXQgY29tZXMgdG8gaW52YWxpZFxuICogY2hhcmFjdGVycy4gSG93ZXZlciwgZm9yIGNvbnNpc3RlbmN5J3Mgc2FrZSwgd2UgYXBwbHkgdGhlIHNhbWUgcnVsZXMgZm9yIGV2ZW50IG5hbWVzIGFzXG4gKiBmb3IgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEBwYXJhbSBwcmVmaXggICAgICAgIEFuIG9wdGlvbmFsIHByZWZpeCwgZS5nLjogJ29uJ1xuICogQHBhcmFtIHN1ZmZpeCAgICAgICAgQW4gb3B0aW9uYWwgc3VmZml4LCBlLmcuOiAnY2hhbmdlZCdcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgZXZlbnQgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnROYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHByZWZpeD86IHN0cmluZywgc3VmZml4Pzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBwcm9wZXJ0eVN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBldmVudCBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7IHByZWZpeCA/IGAkeyBrZWJhYkNhc2UocHJlZml4KSB9LWAgOiAnJyB9JHsgcHJvcGVydHlTdHJpbmcgfSR7IHN1ZmZpeCA/IGAtJHsga2ViYWJDYXNlKHN1ZmZpeCkgfWAgOiAnJyB9YDtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogRG9lcyBwcm9wZXJ0eSBoYXZlIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBObyBhdHRyaWJ1dGUgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBUaGUgYXR0cmlidXRlIG5hbWUgd2lsbCBiZSBpbmZlcnJlZCBieSBjYW1lbC1jYXNpbmcgdGhlIHByb3BlcnR5IG5hbWVcbiAgICAgKiAqIGBzdHJpbmdgOiBVc2UgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICAgICAqXG4gICAgICogLy8gVE9ETzogY29uc2lkZXIgc2V0dGluZyB0aGlzIHRvIGZhbHNlXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgYXR0cmlidXRlOiBib29sZWFuIHwgc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9taXplIHRoZSBjb252ZXJzaW9uIG9mIHZhbHVlcyBiZXR3ZWVuIHByb3BlcnR5IGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDb252ZXJ0ZXJzIGFyZSBvbmx5IHVzZWQgd2hlbiB7QGxpbmsgcmVmbGVjdFByb3BlcnR5fSBhbmQvb3Ige0BsaW5rIHJlZmxlY3RBdHRyaWJ1dGV9IGFyZSBzZXQgdG8gdHJ1ZS5cbiAgICAgKiBJZiBjdXN0b20gcmVmbGVjdG9ycyBhcmUgdXNlZCwgdGhleSBoYXZlIHRvIHRha2UgY2FyZSBvciBjb252ZXJ0aW5nIHRoZSBwcm9wZXJ0eS9hdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZToge0BsaW5rIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHR9XG4gICAgICovXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlJ3MgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgYXR0cmlidXRlIHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgYXR0cmlidXRlIGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBwcm9wZXJ0eSB1c2luZyB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgYXR0cmlidXRlIHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIHByb3BlcnR5IHZhbHVlIGJlIGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogVGhlIHByb3BlcnR5IHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgcHJvcGVydHkgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIHVzaW5nIHRoZSBkZWZhdWx0IHByb3BlcnR5IHJlZmxlY3RvclxuICAgICAqICogYFByb3BlcnR5S2V5YDogQSBtZXRob2Qgb24gdGhlIGNvbXBvbmVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIHByb3BlcnR5IHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdFByb3BlcnR5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5UmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGEgcHJvcGVydHkgdmFsdWUgY2hhbmdlIHJhaXNlIGEgY3VzdG9tIGV2ZW50P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBjcmVhdGUgYSBjdXN0b20gZXZlbnQgZm9yIHRoaXMgcHJvcGVydHlcbiAgICAgKiAqIGB0cnVlYDogQ3JlYXRlIGN1c3RvbSBldmVudHMgZm9yIHRoaXMgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYFByb3BlcnR5S2V5YDogVXNlIHRoZSBtZXRob2Qgd2l0aCB0aGlzIHByb3BlcnR5IGtleSBvbiB0aGUgY29tcG9uZW50IHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzXG4gICAgICogKiBgRnVuY3Rpb25gOiBVc2UgdGhlIHRoZSBwcm92aWRlZCBmdW5jdGlvbiB0byBjcmVhdGUgY3VzdG9tIGV2ZW50cyAoYHRoaXNgIGNvbnRleHQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGluc3RhbmNlKVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgbm90aWZ5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5Tm90aWZpZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgaG93IGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgbW9uaXRvcmVkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEJ5IGRlZmF1bHQgYSBkZWNvcmF0ZWQgcHJvcGVydHkgd2lsbCBiZSBvYnNlcnZlZCBmb3IgY2hhbmdlcyAodGhyb3VnaCBhIGN1c3RvbSBzZXR0ZXIgZm9yIHRoZSBwcm9wZXJ0eSkuXG4gICAgICogQW55IGBzZXRgLW9wZXJhdGlvbiBvZiB0aGlzIHByb3BlcnR5IHdpbGwgdGhlcmVmb3JlIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYW5kIGluaXRpYXRlXG4gICAgICogYSByZW5kZXIgYXMgd2VsbCBhcyByZWZsZWN0aW9uIGFuZCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBvYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSAodGhpcyB3aWxsIGJ5cGFzcyByZW5kZXIsIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbilcbiAgICAgKiAqIGB0cnVlYDogT2JzZXJ2ZSBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgdXNpbmcgdGhlIHtAbGluayBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUn1cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgcHJvdmlkZWQgbWV0aG9kIHRvIGNoZWNrIGlmIHByb3BlcnR5IHZhbHVlIGhhcyBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWAgKHVzZXMge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfSBpbnRlcm5hbGx5KVxuICAgICAqL1xuICAgIG9ic2VydmU6IGJvb2xlYW4gfCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICpcbiAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gKiBAcmV0dXJucyAgICAgICAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2VkXG4gKi9cbmV4cG9ydCBjb25zdCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yRGVmYXVsdDogUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB7XG4gICAgLy8gaW4gY2FzZSBgb2xkVmFsdWVgIGFuZCBgbmV3VmFsdWVgIGFyZSBgTmFOYCwgYChOYU4gIT09IE5hTilgIHJldHVybnMgYHRydWVgLFxuICAgIC8vIGJ1dCBgKE5hTiA9PT0gTmFOIHx8IE5hTiA9PT0gTmFOKWAgcmV0dXJucyBgZmFsc2VgXG4gICAgcmV0dXJuIG9sZFZhbHVlICE9PSBuZXdWYWx1ZSAmJiAob2xkVmFsdWUgPT09IG9sZFZhbHVlIHx8IG5ld1ZhbHVlID09PSBuZXdWYWx1ZSk7XG59O1xuXG4vLyBUT0RPOiBhZGQgdGVzdHMgZm9yIGNoYW5nZSBkZXRlY3RvcnNcbi8vIFRPRE86IG1vdmUgY2hhbmdlIGRldGVjdG9yIHRvIG93biBmaWxlcz9cbmV4cG9ydCBjb25zdCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yT2JqZWN0OiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICBjb25zdCBvbGRLZXlzID0gT2JqZWN0LmtleXMob2xkVmFsdWUpO1xuICAgIGNvbnN0IG5ld0tleXMgPSBPYmplY3Qua2V5cyhuZXdWYWx1ZSk7XG4gICAgcmV0dXJuIG9sZEtleXMubGVuZ3RoICE9PSBuZXdLZXlzLmxlbmd0aCB8fCBvbGRLZXlzLnNvbWUoa2V5ID0+IG9sZFZhbHVlW2tleV0gIT09IG5ld1ZhbHVlW2tleV0pO1xufVxuXG5leHBvcnQgY29uc3QgUHJvcGVydHlDaGFuZ2VEZXRlY3RvckFycmF5OiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnlbXSwgbmV3VmFsdWU6IGFueVtdKSA9PiB7XG4gICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCAhPT0gbmV3VmFsdWUubGVuZ3RoIHx8IG9sZFZhbHVlLnNvbWUoKHZhbHVlLCBpbmRleCkgPT4gdmFsdWUgIT09IG5ld1ZhbHVlW2luZGV4XSk7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OOiBQcm9wZXJ0eURlY2xhcmF0aW9uID0ge1xuICAgIC8vIFRPRE86IGNvbnNpZGVyIHNldHRpbmcgZmFsc2UgYXMgZGVmYXVsdCB2YWx1ZVxuICAgIGF0dHJpYnV0ZTogdHJ1ZSxcbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQsXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogdHJ1ZSxcbiAgICByZWZsZWN0UHJvcGVydHk6IHRydWUsXG4gICAgbm90aWZ5OiB0cnVlLFxuICAgIG9ic2VydmU6IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3JEZWZhdWx0LFxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVBdHRyaWJ1dGVOYW1lLCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCBQcm9wZXJ0eURlY2xhcmF0aW9uIH0gZnJvbSAnLi9wcm9wZXJ0eS1kZWNsYXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgfSBmcm9tICcuL3V0aWxzL2dldC1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzJztcblxuLyoqXG4gKiBBIHR5cGUgZXh0ZW5zaW9uIHRvIGFkZCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdG8gYSB7QGxpbmsgQ29tcG9uZW50fSBjb25zdHJ1Y3RvciBkdXJpbmcgZGVjb3JhdGlvblxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9IHR5cGVvZiBDb21wb25lbnQgJiB7IG92ZXJyaWRkZW4/OiBTZXQ8c3RyaW5nPiB9O1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IHByb3BlcnR5XG4gKlxuICogQHJlbWFya3NcbiAqIE1hbnkgb2YgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBvcHRpb25zIHN1cHBvcnQgY3VzdG9tIGZ1bmN0aW9ucywgd2hpY2ggd2lsbCBiZSBpbnZva2VkXG4gKiB3aXRoIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYXMgYHRoaXNgLWNvbnRleHQgZHVyaW5nIGV4ZWN1dGlvbi4gSW4gb3JkZXIgdG8gc3VwcG9ydCBjb3JyZWN0XG4gKiB0eXBpbmcgaW4gdGhlc2UgZnVuY3Rpb25zLCB0aGUgYEBwcm9wZXJ0eWAgZGVjb3JhdG9yIHN1cHBvcnRzIGdlbmVyaWMgdHlwZXMuIEhlcmUgaXMgYW4gZXhhbXBsZVxuICogb2YgaG93IHlvdSBjYW4gdXNlIHRoaXMgd2l0aCBhIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9OlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBteUhpZGRlblByb3BlcnR5ID0gdHJ1ZTtcbiAqXG4gKiAgICAgIC8vIHVzZSBhIGdlbmVyaWMgdG8gc3VwcG9ydCBwcm9wZXIgaW5zdGFuY2UgdHlwaW5nIGluIHRoZSBwcm9wZXJ0eSByZWZsZWN0b3JcbiAqICAgICAgQHByb3BlcnR5PE15RWxlbWVudD4oe1xuICogICAgICAgICAgcmVmbGVjdFByb3BlcnR5OiAocHJvcGVydHlLZXk6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICogICAgICAgICAgICAgIC8vIHRoZSBnZW5lcmljIHR5cGUgYWxsb3dzIGZvciBjb3JyZWN0IHR5cGluZyBvZiB0aGlzXG4gKiAgICAgICAgICAgICAgaWYgKHRoaXMubXlIaWRkZW5Qcm9wZXJ0eSAmJiBuZXdWYWx1ZSkge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnbXktcHJvcGVydHknLCAnJyk7XG4gKiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAqICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ215LXByb3BlcnR5Jyk7XG4gKiAgICAgICAgICAgICAgfVxuICogICAgICAgICAgfVxuICogICAgICB9KVxuICogICAgICBteVByb3BlcnR5ID0gZmFsc2U7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0eTxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogUGFydGlhbDxQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+PiA9IHt9KSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKFxuICAgICAgICB0YXJnZXQ6IE9iamVjdCxcbiAgICAgICAgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LFxuICAgICAgICBwcm9wZXJ0eURlc2NyaXB0b3I/OiBQcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgKTogYW55IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hlbiBkZWZpbmluZyBjbGFzc2VzIGluIFR5cGVTY3JpcHQsIGNsYXNzIGZpZWxkcyBhY3R1YWxseSBkb24ndCBleGlzdCBvbiB0aGUgY2xhc3MncyBwcm90b3R5cGUsIGJ1dFxuICAgICAgICAgKiByYXRoZXIsIHRoZXkgYXJlIGluc3RhbnRpYXRlZCBpbiB0aGUgY29uc3RydWN0b3IgYW5kIGV4aXN0IG9ubHkgb24gdGhlIGluc3RhbmNlLiBBY2Nlc3NvciBwcm9wZXJ0aWVzXG4gICAgICAgICAqIGFyZSBhbiBleGNlcHRpb24gaG93ZXZlciBhbmQgZXhpc3Qgb24gdGhlIHByb3RvdHlwZS4gRnVydGhlcm1vcmUsIGFjY2Vzc29ycyBhcmUgaW5oZXJpdGVkIGFuZCB3aWxsXG4gICAgICAgICAqIGJlIGludm9rZWQgd2hlbiBzZXR0aW5nIChvciBnZXR0aW5nKSBhIHByb3BlcnR5IG9uIGFuIGluc3RhbmNlIG9mIGEgY2hpbGQgY2xhc3MsIGV2ZW4gaWYgdGhhdCBjbGFzc1xuICAgICAgICAgKiBkZWZpbmVzIHRoZSBwcm9wZXJ0eSBmaWVsZCBvbiBpdHMgb3duLiBPbmx5IGlmIHRoZSBjaGlsZCBjbGFzcyBkZWZpbmVzIG5ldyBhY2Nlc3NvcnMgd2lsbCB0aGUgcGFyZW50XG4gICAgICAgICAqIGNsYXNzJ3MgYWNjZXNzb3JzIG5vdCBiZSBpbmhlcml0ZWQuXG4gICAgICAgICAqIFRvIGtlZXAgdGhpcyBiZWhhdmlvciBpbnRhY3QsIHdlIG5lZWQgdG8gZW5zdXJlLCB0aGF0IHdoZW4gd2UgY3JlYXRlIGFjY2Vzc29ycyBmb3IgcHJvcGVydGllcywgd2hpY2hcbiAgICAgICAgICogYXJlIG5vdCBkZWNsYXJlZCBhcyBhY2Nlc3NvcnMsIHdlIGludm9rZSB0aGUgcGFyZW50IGNsYXNzJ3MgYWNjZXNzb3IgYXMgZXhwZWN0ZWQuXG4gICAgICAgICAqIFRoZSB7QGxpbmsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yfSBmdW5jdGlvbiBhbGxvd3MgdXMgdG8gbG9vayBmb3IgYWNjZXNzb3JzIG9uIHRoZSBwcm90b3R5cGUgY2hhaW4gb2ZcbiAgICAgICAgICogdGhlIGNsYXNzIHdlIGFyZSBkZWNvcmF0aW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IHByb3BlcnR5RGVzY3JpcHRvciB8fCBnZXRQcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGNvbnN0IGhpZGRlbktleSA9IFN5bWJvbChgX18keyBwcm9wZXJ0eUtleS50b1N0cmluZygpIH1gKTtcblxuICAgICAgICAvLyBpZiB3ZSBmb3VuZCBhbiBhY2Nlc3NvciBkZXNjcmlwdG9yIChmcm9tIGVpdGhlciB0aGlzIGNsYXNzIG9yIGEgcGFyZW50KSB3ZSB1c2UgaXQsIG90aGVyd2lzZSB3ZSBjcmVhdGVcbiAgICAgICAgLy8gZGVmYXVsdCBhY2Nlc3NvcnMgdG8gc3RvcmUgdGhlIGFjdHVhbCBwcm9wZXJ0eSB2YWx1ZSBpbiBhIGhpZGRlbiBmaWVsZCBhbmQgcmV0cmlldmUgaXQgZnJvbSB0aGVyZVxuICAgICAgICBjb25zdCBnZXR0ZXIgPSBkZXNjcmlwdG9yPy5nZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSkgeyByZXR1cm4gdGhpc1toaWRkZW5LZXldOyB9O1xuICAgICAgICBjb25zdCBzZXR0ZXIgPSBkZXNjcmlwdG9yPy5zZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSwgdmFsdWU6IGFueSkgeyB0aGlzW2hpZGRlbktleV0gPSB2YWx1ZTsgfTtcblxuICAgICAgICAvLyB3ZSBkZWZpbmUgYSBuZXcgYWNjZXNzb3IgZGVzY3JpcHRvciB3aGljaCB3aWxsIHdyYXAgdGhlIHByZXZpb3VzbHkgcmV0cmlldmVkIG9yIGNyZWF0ZWQgYWNjZXNzb3JzXG4gICAgICAgIC8vIGFuZCByZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50IHdoZW5ldmVyIHRoZSBwcm9wZXJ0eSBpcyBzZXRcbiAgICAgICAgY29uc3Qgd3JhcHBlZERlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvciAmIFRoaXNUeXBlPGFueT4gPSB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0ICgpOiBhbnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQgKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIHNldHRlci5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBwYXNzIGB2YWx1ZWAgb24gYXMgYG5ld1ZhbHVlYCAtIGFuIGluaGVyaXRlZCBzZXR0ZXIgbWlnaHQgbW9kaWZ5IGl0XG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCBnZXQgdGhlIG5ldyB2YWx1ZSBieSBpbnZva2luZyB0aGUgZ2V0dGVyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgZ2V0dGVyLmNhbGwodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgRGVjb3JhdGVkQ29tcG9uZW50VHlwZTtcblxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbjogUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlPiA9IHsgLi4uREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24uYXR0cmlidXRlID0gY3JlYXRlQXR0cmlidXRlTmFtZShwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXQgdGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5vYnNlcnZlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLm9ic2VydmUgPSBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLm9ic2VydmU7XG4gICAgICAgIH1cblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGluaGVyaXRlZCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGUgZm9yIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBiYXNlIGNsYXNzXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuaGFzKHByb3BlcnR5S2V5KSA/IGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuZ2V0KHByb3BlcnR5S2V5KSEuYXR0cmlidXRlIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHkgaXQncyBhIHN0cmluZyBhbmQgaXQgd2lsbCBleGlzdCBpbiB0aGUgYXR0cmlidXRlcyBtYXBcbiAgICAgICAgaWYgKGF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIGluaGVyaXRlZCBhdHRyaWJ1dGUgYXMgaXQncyBvdmVycmlkZGVuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmRlbGV0ZShhdHRyaWJ1dGUgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIC8vIG1hcmsgYXR0cmlidXRlIGFzIG92ZXJyaWRkZW4gZm9yIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvclxuICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiEuYWRkKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLnNldChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbiAqYWZ0ZXIqIHByb2Nlc3NpbmcgdGhlIGF0dHJpYnV0ZXMsIHNvIHdlIGNhbiBzdGlsbCBhY2Nlc3MgdGhlXG4gICAgICAgIC8vIGluaGVyaXRlZCBwcm9wZXJ0eSBkZWNsYXJhdGlvbiB3aGVuIHByb2Nlc3NpbmcgdGhlIGF0dHJpYnV0ZXNcbiAgICAgICAgY29uc3RydWN0b3IucHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIGRlY2xhcmF0aW9uIGFzIFByb3BlcnR5RGVjbGFyYXRpb24pO1xuXG4gICAgICAgIGlmICghcHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgICAgIC8vIGlmIG5vIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGEgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciB3aGljaCBtdXN0IHJldHVybiB2b2lkIGFuZCB3ZSBjYW4gZGVmaW5lIHRoZSB3cmFwcGVkIGRlc2NyaXB0b3IgaGVyZVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIHdyYXBwZWREZXNjcmlwdG9yKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBpZiBhIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGFuIGFjY2Vzc29yXG4gICAgICAgICAgICAvLyBkZWNvcmF0b3IgYW5kIHdlIG11c3QgcmV0dXJuIHRoZSB3cmFwcGVkIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVkRGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgcHJvcGVydHkgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3Igc3RvcmVzIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIGluIHRoZSBjb25zdHJ1Y3RvcixcbiAqIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRob3NlIHN0YXRpYyBmaWVsZHMgYXJlIGluaXRpYWxpemVkIG9uIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yLiBPdGhlcndpc2Ugd2VcbiAqIGFkZCBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZSBtYXBwaW5ncyB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZHMuIFdlIGFsc28gbWFrZVxuICogc3VyZSB0byBpbml0aWFsaXplIHRoZSBjb25zdHJ1Y3RvcnMgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2YgdGhlIGJhc2UgY2xhc3MncyBtYXBzIHRvIHByb3Blcmx5XG4gKiBpbmhlcml0IGFsbCBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZXMuXG4gKlxuICogQHBhcmFtIGNvbnN0cnVjdG9yIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgdG8gcHJlcGFyZVxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlKSB7XG5cbiAgICAvLyB0aGlzIHdpbGwgZ2l2ZSB1cyBhIGNvbXBpbGUtdGltZSBlcnJvciBpZiB3ZSByZWZhY3RvciBvbmUgb2YgdGhlIHN0YXRpYyBjb25zdHJ1Y3RvciBwcm9wZXJ0aWVzXG4gICAgLy8gYW5kIHdlIHdvbid0IG1pc3MgcmVuYW1pbmcgdGhlIHByb3BlcnR5IGtleXNcbiAgICBjb25zdCBwcm9wZXJ0aWVzOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ3Byb3BlcnRpZXMnO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAnYXR0cmlidXRlcyc7XG4gICAgY29uc3Qgb3ZlcnJpZGRlbjoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdvdmVycmlkZGVuJztcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkocHJvcGVydGllcykpIGNvbnN0cnVjdG9yLnByb3BlcnRpZXMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLnByb3BlcnRpZXMpO1xuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlcykpIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMpO1xuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkob3ZlcnJpZGRlbikpIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4gPSBuZXcgU2V0KCk7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFdmVudE5hbWUgfSBmcm9tICcuL2RlY29yYXRvcnMvaW5kZXguanMnO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IEV2ZW50SW5pdCBvYmplY3RcbiAqXG4gKiBAcmVtYXJrc1xuICogV2UgdXN1YWxseSB3YW50IG91ciBDdXN0b21FdmVudHMgdG8gYnViYmxlLCBjcm9zcyBzaGFkb3cgRE9NIGJvdW5kYXJpZXMgYW5kIGJlIGNhbmNlbGFibGUsXG4gKiBzbyB3ZSBzZXQgdXAgYSBkZWZhdWx0IG9iamVjdCB3aXRoIHRoaXMgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRVZFTlRfSU5JVDogRXZlbnRJbml0ID0ge1xuICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICBjb21wb3NlZDogdHJ1ZSxcbn07XG5cbi8qKlxuICogVGhlIHtAbGluayBDb21wb25lbnRFdmVudH0gZGV0YWlsXG4gKlxuICogQHJlbWFya3NcbiAqIEN1c3RvbUV2ZW50cyB0aGF0IGNyb3NzIHNoYWRvdyBET00gYm91bmRhcmllcyBnZXQgcmUtdGFyZ2V0ZWQuIFRoaXMgbWVhbnMsIHRoZSBldmVudCdzIGB0YXJnZXRgIHByb3BlcnR5XG4gKiBpcyBzZXQgdG8gdGhlIEN1c3RvbUVsZW1lbnQgd2hpY2ggaG9sZHMgdGhlIHNoYWRvdyBET00uIFdlIHdhbnQgdG8gcHJvdmlkZSB0aGUgb3JpZ2luYWwgdGFyZ2V0IGluIGVhY2hcbiAqIENvbXBvbmVudEV2ZW50IHNvIGdsb2JhbCBldmVudCBsaXN0ZW5lcnMgY2FuIGVhc2lseSBhY2Nlc3MgdGhlIGV2ZW50J3Mgb3JpZ2luYWwgdGFyZ2V0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEV2ZW50RGV0YWlsPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICB0YXJnZXQ6IEM7XG59XG5cbi8qKlxuICogVGhlIENvbXBvbmVudEV2ZW50IGNsYXNzXG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSBDb21wb25lbnRFdmVudCBjbGFzcyBleHRlbmRzIEN1c3RvbUV2ZW50IGFuZCBzaW1wbHkgcHJvdmlkZXMgdGhlIGRlZmF1bHQgRXZlbnRJbml0IG9iamVjdCBhbmQgaXRzIHR5cGluZ1xuICogZW5zdXJlcyB0aGF0IHRoZSBldmVudCBkZXRhaWwgY29udGFpbnMgYSB0YXJnZXQgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFdmVudDxUID0gYW55LCBDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiBleHRlbmRzIEN1c3RvbUV2ZW50PFQgJiBDb21wb25lbnRFdmVudERldGFpbDxDPj4ge1xuXG4gICAgY29uc3RydWN0b3IgKHR5cGU6IHN0cmluZywgZGV0YWlsOiBUICYgQ29tcG9uZW50RXZlbnREZXRhaWw8Qz4sIGluaXQ6IEV2ZW50SW5pdCA9IHt9KSB7XG5cbiAgICAgICAgY29uc3QgZXZlbnRJbml0OiBDdXN0b21FdmVudEluaXQ8VCAmIENvbXBvbmVudEV2ZW50RGV0YWlsPEM+PiA9IHtcbiAgICAgICAgICAgIC4uLkRFRkFVTFRfRVZFTlRfSU5JVCxcbiAgICAgICAgICAgIC4uLmluaXQsXG4gICAgICAgICAgICBkZXRhaWwsXG4gICAgICAgIH07XG5cbiAgICAgICAgc3VwZXIodHlwZSwgZXZlbnRJbml0KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnQgZGV0YWlscywgYXMgdXNlZCBieSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VFdmVudH1cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZUV2ZW50RGV0YWlsPFQgPSBhbnksIEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IGV4dGVuZHMgQ29tcG9uZW50RXZlbnREZXRhaWw8Qz4ge1xuICAgIHByb3BlcnR5OiBzdHJpbmc7XG4gICAgcHJldmlvdXM6IFQ7XG4gICAgY3VycmVudDogVDtcbn1cblxuLyoqXG4gKiBUaGUgUHJvcGVydHlDaGFuZ2VFdmVudCBjbGFzc1xuICpcbiAqIEByZW1hcmtzXG4gKiBBIGN1c3RvbSBldmVudCwgYXMgZGlzcGF0Y2hlZCBieSB0aGUge0BsaW5rIENvbXBvbmVudC5fbm90aWZ5UHJvcGVydHl9IG1ldGhvZC4gVGhlIGNvbnN0cnVjdG9yXG4gKiBlbnN1cmVzIGEgY29udmVudGlvbmFsIGV2ZW50IG5hbWUgaXMgY3JlYXRlZCBmb3IgdGhlIHByb3BlcnR5IGtleSBhbmQgaW1wb3NlcyB0aGUgY29ycmVjdCB0eXBlXG4gKiBvbiB0aGUgZXZlbnQgZGV0YWlsLlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlDaGFuZ2VFdmVudDxUID0gYW55LCBDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiBleHRlbmRzIENvbXBvbmVudEV2ZW50PFByb3BlcnR5Q2hhbmdlRXZlbnREZXRhaWw8VD4sIEM+IHtcblxuICAgIGNvbnN0cnVjdG9yIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIGRldGFpbDogUHJvcGVydHlDaGFuZ2VFdmVudERldGFpbDxULCBDPiwgaW5pdD86IEV2ZW50SW5pdCkge1xuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBjcmVhdGVFdmVudE5hbWUocHJvcGVydHlLZXksICcnLCAnY2hhbmdlZCcpO1xuXG4gICAgICAgIHN1cGVyKHR5cGUsIGRldGFpbCwgaW5pdCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoZSBMaWZlY3ljbGVFdmVudCBjbGFzc1xuICpcbiAqIEByZW1hcmtzXG4gKiBBIGN1c3RvbSBldmVudCwgYXMgZGlzcGF0Y2hlZCBieSB0aGUge0BsaW5rIENvbXBvbmVudC5fbm90aWZ5TGlmZWN5Y2xlfSBtZXRob2QuIFRoZSBjb25zdHJ1Y3RvclxuICogZW5zdXJlcyB0aGUgYWxsb3dlZCBsaWZlY3ljbGVzLlxuICovXG5leHBvcnQgY2xhc3MgTGlmZWN5Y2xlRXZlbnQ8VCA9IGFueSwgQyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gZXh0ZW5kcyBDb21wb25lbnRFdmVudDxULCBDPiB7XG5cbiAgICBjb25zdHJ1Y3RvciAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbDogVCAmIENvbXBvbmVudEV2ZW50RGV0YWlsPEM+LCBpbml0PzogRXZlbnRJbml0KSB7XG5cbiAgICAgICAgc3VwZXIobGlmZWN5Y2xlLCBkZXRhaWwsIGluaXQpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IHJlbmRlciwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVSZWZsZWN0b3IsIGlzQXR0cmlidXRlUmVmbGVjdG9yLCBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IsIGlzUHJvcGVydHlLZXksIGlzUHJvcGVydHlOb3RpZmllciwgaXNQcm9wZXJ0eVJlZmxlY3RvciwgTGlzdGVuZXJEZWNsYXJhdGlvbiwgUHJvcGVydHlEZWNsYXJhdGlvbiwgUHJvcGVydHlOb3RpZmllciwgUHJvcGVydHlSZWZsZWN0b3IsIFNlbGVjdG9yRGVjbGFyYXRpb24gfSBmcm9tICcuL2RlY29yYXRvcnMvaW5kZXguanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50RXZlbnQsIExpZmVjeWNsZUV2ZW50LCBQcm9wZXJ0eUNoYW5nZUV2ZW50IH0gZnJvbSAnLi9ldmVudHMuanMnO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SID0gKGF0dHJpYnV0ZVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgYXR0cmlidXRlIHJlZmxlY3RvciAkeyBTdHJpbmcoYXR0cmlidXRlUmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SID0gKHByb3BlcnR5UmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSByZWZsZWN0b3IgJHsgU3RyaW5nKHByb3BlcnR5UmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IgPSAocHJvcGVydHlOb3RpZmllcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgbm90aWZpZXIgJHsgU3RyaW5nKHByb3BlcnR5Tm90aWZpZXIpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBDSEFOR0VfREVURUNUT1JfRVJST1IgPSAoY2hhbmdlRGV0ZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvciAkeyBTdHJpbmcoY2hhbmdlRGV0ZWN0b3IpIH0uYCk7XG5cbi8qKlxuICogRXh0ZW5kcyB0aGUgc3RhdGljIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSB0byBpbmNsdWRlIHRoZSBib3VuZCBsaXN0ZW5lclxuICogZm9yIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5pbnRlcmZhY2UgSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uIGV4dGVuZHMgTGlzdGVuZXJEZWNsYXJhdGlvbiB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYm91bmQgbGlzdGVuZXIgd2lsbCBiZSBzdG9yZWQgaGVyZSwgc28gaXQgY2FuIGJlIHJlbW92ZWQgaXQgbGF0ZXJcbiAgICAgKi9cbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBldmVudCB0YXJnZXQgd2lsbCBhbHdheXMgYmUgcmVzb2x2ZWQgdG8gYW4gYWN0dWFsIHtAbGluayBFdmVudFRhcmdldH1cbiAgICAgKi9cbiAgICB0YXJnZXQ6IEV2ZW50VGFyZ2V0O1xufVxuXG4vKipcbiAqIEEgdHlwZSBmb3IgcHJvcGVydHkgY2hhbmdlcywgYXMgdXNlZCBpbiB7QGxpbmsgQ29tcG9uZW50LnVwZGF0ZUNhbGxiYWNrfVxuICovXG5leHBvcnQgdHlwZSBDaGFuZ2VzID0gTWFwPFByb3BlcnR5S2V5LCBhbnk+O1xuXG4vKipcbiAqIFRoZSBjb21wb25lbnQgYmFzZSBjbGFzc1xuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIGNhY2hlZCB7QGxpbmsgQ1NTU3R5bGVTaGVldH0gaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N0eWxlU2hlZXQ6IENTU1N0eWxlU2hlZXQgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoZW4gY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBDU1NTdHlsZVNoZWV0fVxuICAgICAqIGluc3RhbmNlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaCBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgc3R5bGVTaGVldCAoKTogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxlbmd0aCAmJiAhdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX3N0eWxlU2hlZXQnKSkge1xuXG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgc3R5bGUgc2hlZXQgYW5kIGNhY2hlIGl0IGluIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCB3b3JrIG9uY2UgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcnJpdmVcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL3dpY2cuZ2l0aHViLmlvL2NvbnN0cnVjdC1zdHlsZXNoZWV0cy9cbiAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVNoZWV0ID0gbmV3IENTU1N0eWxlU2hlZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHlsZVNoZWV0LnJlcGxhY2VTeW5jKHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlU2hlZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIGNhY2hlZCB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH0gaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBnZXR0ZXIgd2lsbCBjcmVhdGUgYSB7QGxpbmsgSFRNTFN0eWxlRWxlbWVudH0gbm9kZSBhbmQgY2FjaGUgaXQgZm9yIHVzZSB3aXRoIGVhY2hcbiAgICAgKiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgc3R5bGVFbGVtZW50ICgpOiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVFbGVtZW50JykpIHtcblxuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50aXRsZSA9IHRoaXMuc2VsZWN0b3I7XG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLnN0eWxlcy5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgYXR0cmlidXRlIG5hbWVzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGtleXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHByb3BlcnR5IGtleSB0aGF0IGJlbG9uZ3MgdG8gYW4gYXR0cmlidXRlIG5hbWUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgYXR0cmlidXRlczogTWFwPHN0cmluZywgUHJvcGVydHlLZXk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBvZiBhIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIHByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgUHJvcGVydHlEZWNsYXJhdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIGxpc3RlbmVyIGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBsaXN0ZW5lcn0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IG9mIGEgbWV0aG9kLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIGxpc3RlbmVyczogTWFwPFByb3BlcnR5S2V5LCBMaXN0ZW5lckRlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgc2VsZWN0b3IgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHNlbGVjdG9yfSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgU2VsZWN0b3JEZWNsYXJhdGlvbn0gb2YgYSBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBzZWxlY3RvcnM6IE1hcDxQcm9wZXJ0eUtleSwgU2VsZWN0b3JEZWNsYXJhdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc2VsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBvdmVycmlkZGVuIGJ5IHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc2VsZWN0b3JgIG9wdGlvbiwgaWYgcHJvdmlkZWQuXG4gICAgICogT3RoZXJ3aXNlIHRoZSBkZWNvcmF0b3Igd2lsbCB1c2UgdGhpcyBwcm9wZXJ0eSB0byBkZWZpbmUgdGhlIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2VsZWN0b3I6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFVzZSBTaGFkb3cgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgc2V0IGJ5IHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc2hhZG93YCBvcHRpb24gKGRlZmF1bHRzIHRvIGB0cnVlYCkuXG4gICAgICovXG4gICAgc3RhdGljIHNoYWRvdzogYm9vbGVhbjtcblxuICAgIC8vIFRPRE86IGNyZWF0ZSB0ZXN0cyBmb3Igc3R5bGUgaW5oZXJpdGFuY2VcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENhbiBiZSBzZXQgdGhyb3VnaCB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHN0eWxlc2Agb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogU3R5bGVzIHNldCBpbiB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqIFRoaXMgYWxsb3dzIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50IGFuZCBhZGQgYWRkaXRpb25hbCBzdHlsZXMgb24gdGhlIGNoaWxkIGNvbXBvbmVudC5cbiAgICAgKiBJbiBvcmRlciB0byBpbmhlcml0IHN0eWxlcyBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCwgYW4gZXhwbGljaXQgc3VwZXIgY2FsbCBoYXMgdG8gYmUgaW5jbHVkZWQuIEJ5XG4gICAgICogZGVmYXVsdCBubyBzdHlsZXMgYXJlIGluaGVyaXRlZC5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIE15QmFzZUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKTogc3RyaW5nW10ge1xuICAgICAqXG4gICAgICogICAgICAgICAgcmV0dXJuIFtcbiAgICAgKiAgICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAqICAgICAgICAgICAgICAnOmhvc3QgeyBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjsgfSdcbiAgICAgKiAgICAgICAgICBdO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgdGVtcGxhdGVgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHVuZGVmaW5lZGApLlxuICAgICAqIElmIHNldCBpbiB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yLCBpdCB3aWxsIGhhdmUgcHJlY2VkZW5jZSBvdmVyIHRoZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50ICAgVGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBoZWxwZXJzICAgQW55IGFkZGl0aW9uYWwgcHJvcGVydGllcyB3aGljaCBzaG91bGQgZXhpc3QgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgc3RhdGljIHRlbXBsYXRlPzogKGVsZW1lbnQ6IGFueSwgLi4uaGVscGVyczogYW55W10pID0+IFRlbXBsYXRlUmVzdWx0IHwgdm9pZDtcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRvIHNwZWNpZnkgYXR0cmlidXRlcyB3aGljaCBzaG91bGQgYmUgb2JzZXJ2ZWQsIGJ1dCBkb24ndCBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtcbiAgICAgKiBGb3IgcHJvcGVydGllcyB3aGljaCBhcmUgZGVjb3JhdGVkIHdpdGggdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGVcbiAgICAgKiBpcyBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgYW5kIGRvZXMgbm90IG5lZWQgdG8gYmUgc3BlY2lmaWVkIGhlcmUuIEZvdCBhdHRyaWJ1dGVzIHRoYXQgZG9uJ3RcbiAgICAgKiBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHksIHJldHVybiB0aGUgYXR0cmlidXRlIG5hbWVzIGluIHRoaXMgZ2V0dGVyLiBDaGFuZ2VzIHRvIHRoZXNlXG4gICAgICogYXR0cmlidXRlcyBjYW4gYmUgaGFuZGxlZCBpbiB0aGUge0BsaW5rIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja30gbWV0aG9kLlxuICAgICAqXG4gICAgICogV2hlbiBleHRlbmRpbmcgY29tcG9uZW50cywgbWFrZSBzdXJlIHRvIHJldHVybiB0aGUgc3VwZXIgY2xhc3MncyBvYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgKiBpZiB5b3Ugb3ZlcnJpZGUgdGhpcyBnZXR0ZXIgKGV4Y2VwdCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IG9ic2VydmVkIGF0dHJpYnV0ZXMpOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gW1xuICAgICAqICAgICAgICAgICAgICAuLi5zdXBlci5vYnNlcnZlZEF0dHJpYnV0ZXMsXG4gICAgICogICAgICAgICAgICAgICdteS1hZGRpdGlvbmFsLWF0dHJpYnV0ZSdcbiAgICAgKiAgICAgICAgICBdO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVJlcXVlc3Q6IFByb21pc2U8Ym9vbGVhbj4gPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NoYW5nZWRQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeWluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJEZWNsYXJhdGlvbnM6IEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbltdID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2hhc1VwZGF0ZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIGNvbXBvbmVudCdzIHVwZGF0ZSBjeWNsZSB3YXMgcnVuIGF0IGxlYXN0IG9uY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBwcm9wZXJ0eSBpcyBhbmFsb2dvdXMgdG8gdGhlIHtAbGluayB1cGRhdGV9IGFuZCB7QGxpbmsgdXBkYXRlQ2FsbGJhY2t9IG1ldGhvZCdzIGBmaXJzdFVwZGF0ZWAgcGFyYW1ldGVyLlxuICAgICAqIEl0IGNhbiBiZSB1c2VmdWwgaW4gc2l0dWF0aW9ucyB3aGVyZSBsb2dpYyBjYW4ndCBiZSBydW4gaW5zaWRlIGEgY29tcG9uZW50J3MgdXBkYXRlL3VwZGF0ZUNhbGxiYWNrIG1ldGhvZHMgYnV0XG4gICAgICogd2Ugc3RpbGwgbmVlZCB0byBrbm93IGlmIHRoZSBjb21wb25lbnQgaGFzIHVwZGF0ZWQgYWxyZWFkeS5cbiAgICAgKlxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIGdldCBoYXNVcGRhdGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5faGFzVXBkYXRlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlbmRlclJvb3Q6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yICguLi5hcmdzOiBhbnlbXSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJSb290ID0gdGhpcy5fY3JlYXRlUmVuZGVyUm9vdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgbW92ZWQgdG8gYSBuZXcgZG9jdW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGFkb3B0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdhZG9wdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIGRvY3VtZW50J3MgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fdW5saXN0ZW4oKTtcblxuICAgICAgICB0aGlzLl91bnNlbGVjdCgpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnZGlzY29ubmVjdGVkJyk7XG5cbiAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIG9uZSBvZiB0aGUgY29tcG9uZW50J3MgYXR0cmlidXRlcyBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGljaCBhdHRyaWJ1dGVzIHRvIG5vdGljZSBjaGFuZ2UgZm9yIGlzIHNwZWNpZmllZCBpbiB7QGxpbmsgb2JzZXJ2ZWRBdHRyaWJ1dGVzfS5cbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIEZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB3aXRoIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlLCB0aGlzIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUgaGFuZGxpbmcgb2YgYXR0cmlidXRlIGNoYW5nZXMuIFdoZW4gb3ZlcnJpZGluZ1xuICAgICAqIHRoaXMgbWV0aG9kLCBhIHN1cGVyLWNhbGwgc2hvdWxkIGJlIGluY2x1ZGVkLCB0byBlbnN1cmUgYXR0cmlidXRlIGNoYW5nZXMgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICogYXJlIHByb2Nlc3NlZCBjb3JyZWN0bHkuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBzdXBlci5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAqXG4gICAgICogICAgICAgICAgLy8gZG8gY3VzdG9tIGhhbmRsaW5nLi4uXG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZSBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUmVmbGVjdGluZyB8fCBvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgdXBkYXRlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgYHVwZGF0ZUNhbGxiYWNrYCBpcyBpbnZva2VkIHN5bmNocm9ub3VzbHkgYnkgdGhlIHtAbGluayB1cGRhdGV9IG1ldGhvZCBhbmQgdGhlcmVmb3JlIGhhcHBlbnMgZGlyZWN0bHkgYWZ0ZXJcbiAgICAgKiByZW5kZXJpbmcsIHByb3BlcnR5IHJlZmxlY3Rpb24gYW5kIHByb3BlcnR5IGNoYW5nZSBldmVudHMuXG4gICAgICpcbiAgICAgKiBOLkIuOiBDaGFuZ2VzIG1hZGUgdG8gcHJvcGVydGllcyBvciBhdHRyaWJ1dGVzIGluc2lkZSB0aGlzIGNhbGxiYWNrICp3b24ndCogY2F1c2UgYW5vdGhlciB1cGRhdGUuXG4gICAgICogVG8gY2F1c2UgYW4gdXBkYXRlLCBkZWZlciBjaGFuZ2VzIHdpdGggdGhlIGhlbHAgb2YgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgKiAgICAgICAgICAgICAgLy8gcGVyZm9ybSBjaGFuZ2VzIHdoaWNoIG5lZWQgdG8gY2F1c2UgYW5vdGhlciB1cGRhdGUgaGVyZVxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgICAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZmlyc3RVcGRhdGUgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIHdhcyB0aGUgZmlyc3QgdXBkYXRlXG4gICAgICovXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7IH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgY3VzdG9tIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBBbiBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIGV2ZW50SW5pdCBBIHtAbGluayBDdXN0b21FdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKiBAZGVwcmVjYXRlZCAgVXNlIHtAbGluayBDb21wb25lbnQuZGlzcGF0Y2h9IGluc3RlYWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5IChldmVudE5hbWU6IHN0cmluZywgZXZlbnRJbml0PzogQ3VzdG9tRXZlbnRJbml0KSB7XG5cbiAgICAgICAgLy8gVE9ETzogaW1wcm92ZSB0aGlzISB3ZSBzaG91bGQgcHVsbCB0aGUgZGlzcGF0Y2ggbWV0aG9kIGZyb20gZXhhbXBsZSBpbnRvIC4vZXZlbnRzXG4gICAgICAgIC8vIGFuZCB1c2UgaXQgaGVyZTsgd2Ugc2hvdWxkIGNoYW5nZSBub3RpZnkoKSBhcmd1bWVudHMgdG8gdHlwZSwgZGV0YWlsLCBpbml0XG4gICAgICAgIC8vIG1heWJlIHdlIHNob3VsZCBldmVuIHJlbmFtZSBpdCB0byBkaXNwYXRjaC4uLlxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgZXZlbnRJbml0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYW4gZXZlbnQgb24gdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBkaXNwYXRjaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBkaXNwYXRjaCAoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEge0BsaW5rIENvbXBvbmVudEV2ZW50fSBvbiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIGNhbGxlZCB3aXRoIGEgdHlwZSBhbmQgZGV0YWlsIGFyZ3VtZW50LCB0aGUgZGlzcGF0Y2ggbWV0aG9kIHdpbGwgY3JlYXRlIGEgbmV3IHtAbGluayBDb21wb25lbnRFdmVudH1cbiAgICAgKiBhbmQgc2V0IGl0cyBkZXRhaWwncyBgdGFyZ2V0YCBwcm9wZXJ0eSB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUgICAgICBUaGUgdHlwZSBvZiB0aGUgZXZlbnRcbiAgICAgKiBAcGFyYW0gZGV0YWlsICAgIEFuIG9wdGlvbmFsIGN1c3RvbSBldmVudCBkZXRhaWxcbiAgICAgKiBAcGFyYW0gaW5pdCAgICAgIEFuIG9wdGlvbmFsIHtAbGluayBFdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2g8VCA9IGFueT4gKHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgaW5pdD86IFBhcnRpYWw8RXZlbnRJbml0Pik6IGJvb2xlYW47XG5cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2g8VCA9IGFueT4gKGV2ZW50T3JUeXBlOiBFdmVudCB8IHN0cmluZywgZGV0YWlsPzogVCwgaW5pdDogUGFydGlhbDxFdmVudEluaXQ+ID0ge30pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50T3JUeXBlID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgICAgICBldmVudE9yVHlwZSA9IG5ldyBDb21wb25lbnRFdmVudDxUPihldmVudE9yVHlwZSwgeyB0YXJnZXQ6IHRoaXMsIC4uLmRldGFpbCEgfSwgaW5pdClcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnRPclR5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoIHByb3BlcnR5IGNoYW5nZXMgb2NjdXJyaW5nIGluIHRoZSBleGVjdXRvciBhbmQgcmFpc2UgY3VzdG9tIGV2ZW50c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIHNob3VsZCB0cmlnZ2VyIGN1c3RvbSBldmVudHMgd2hlbiB0aGV5IGFyZSBjYXVzZWQgYnkgaW50ZXJuYWwgc3RhdGUgY2hhbmdlcyxcbiAgICAgKiBidXQgbm90IGlmIHRoZXkgYXJlIGNhdXNlZCBieSBhIGNvbnN1bWVyIG9mIHRoZSBjb21wb25lbnQgQVBJIGRpcmVjdGx5LCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ215LWN1c3RvbS1lbGVtZW50JykuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIGBgYC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWVhbnMsIHdlIGNhbm5vdCBhdXRvbWF0ZSB0aGlzIHByb2Nlc3MgdGhyb3VnaCBwcm9wZXJ0eSBzZXR0ZXJzLCBhcyB3ZSBjYW4ndCBiZSBzdXJlIHdob1xuICAgICAqIGludm9rZWQgdGhlIHNldHRlciAtIGludGVybmFsIGNhbGxzIG9yIGV4dGVybmFsIGNhbGxzLlxuICAgICAqXG4gICAgICogT25lIG9wdGlvbiBpcyB0byBtYW51YWxseSByYWlzZSB0aGUgZXZlbnQsIHdoaWNoIGNhbiBiZWNvbWUgdGVkaW91cyBhbmQgZm9yY2VzIHVzIHRvIHVzZSBzdHJpbmctXG4gICAgICogYmFzZWQgZXZlbnQgbmFtZXMgb3IgcHJvcGVydHkgbmFtZXMsIHdoaWNoIGFyZSBkaWZmaWN1bHQgdG8gcmVmYWN0b3IsIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogLy8gaWYgd2UgcmVmYWN0b3IgdGhlIHByb3BlcnR5IG5hbWUsIHdlIGNhbiBlYXNpbHkgbWlzcyB0aGUgbm90aWZ5IGNhbGxcbiAgICAgKiB0aGlzLm5vdGlmeSgnY3VzdG9tUHJvcGVydHknKTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEEgbW9yZSBjb252ZW5pZW50IHdheSBpcyB0byBleGVjdXRlIHRoZSBpbnRlcm5hbCBjaGFuZ2VzIGluIGEgd3JhcHBlciB3aGljaCBjYW4gZGV0ZWN0IHRoZSBjaGFuZ2VkXG4gICAgICogcHJvcGVydGllcyBhbmQgd2lsbCBhdXRvbWF0aWNhbGx5IHJhaXNlIHRoZSByZXF1aXJlZCBldmVudHMuIFRoaXMgZWxpbWluYXRlcyB0aGUgbmVlZCB0byBtYW51YWxseVxuICAgICAqIHJhaXNlIGV2ZW50cyBhbmQgcmVmYWN0b3JpbmcgZG9lcyBubyBsb25nZXIgYWZmZWN0IHRoZSBwcm9jZXNzLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMud2F0Y2goKCkgPT4ge1xuICAgICAqXG4gICAgICogICAgICB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAgICAgIC8vIHdlIGNhbiBhZGQgbW9yZSBwcm9wZXJ0eSBtb2RpZmljYXRpb25zIHRvIG5vdGlmeSBpbiBoZXJlXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgQSBmdW5jdGlvbiB0aGF0IHBlcmZvcm1zIHRoZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBiZSBub3RpZmllZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3YXRjaCAoZXhlY3V0b3I6ICgpID0+IHZvaWQpIHtcblxuICAgICAgICAvLyBiYWNrIHVwIGN1cnJlbnQgY2hhbmdlZCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNoYW5nZXNcbiAgICAgICAgZXhlY3V0b3IoKTtcblxuICAgICAgICAvLyBhZGQgYWxsIG5ldyBvciB1cGRhdGVkIGNoYW5nZWQgcHJvcGVydGllcyB0byB0aGUgbm90aWZ5aW5nIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBbcHJvcGVydHlLZXksIG9sZFZhbHVlXSBvZiB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcykge1xuXG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9ICFwcmV2aW91c0NoYW5nZXMuaGFzKHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSAhYWRkZWQgJiYgdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBwcmV2aW91c0NoYW5nZXMuZ2V0KHByb3BlcnR5S2V5KSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoYWRkZWQgfHwgdXBkYXRlZCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdmFsdWUgb2YgYSBkZWNvcmF0ZWQgcHJvcGVydHkgb3IgaXRzIGFzc29jaWF0ZWRcbiAgICAgKiBhdHRyaWJ1dGUgY2hhbmdlcy4gSWYgeW91IG5lZWQgdGhlIGNvbXBvbmVudCB0byB1cGRhdGUgYmFzZWQgb24gYSBzdGF0ZSBjaGFuZ2UgdGhhdCBpc1xuICAgICAqIG5vdCBjb3ZlcmVkIGJ5IGEgZGVjb3JhdGVkIHByb3BlcnR5LCBjYWxsIHRoaXMgbWV0aG9kIHdpdGhvdXQgYW55IGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBrZXkgb2YgdGhlIGNoYW5nZWQgcHJvcGVydHkgdGhhdCByZXF1ZXN0cyB0aGUgdXBkYXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIHRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBBIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiB0aGUgdXBkYXRlIGlzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZXF1ZXN0VXBkYXRlIChwcm9wZXJ0eUtleT86IFByb3BlcnR5S2V5LCBvbGRWYWx1ZT86IGFueSwgbmV3VmFsdWU/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBpZiAocHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSdzIG9ic2VydmUgb3B0aW9uIGlzIGBmYWxzZWAsIHtAbGluayBoYXNDaGFuZ2VkfVxuICAgICAgICAgICAgLy8gd2lsbCByZXR1cm4gYGZhbHNlYCBhbmQgbm8gdXBkYXRlIHdpbGwgYmUgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzQ2hhbmdlZChwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSkgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIGNoYW5nZWQgcHJvcGVydHkgZm9yIGJhdGNoIHByb2Nlc3NpbmdcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgaW4gcmVmbGVjdGluZyBzdGF0ZSwgYW4gYXR0cmlidXRlIGlzIHJlZmxlY3RpbmcgdG8gdGhpcyBwcm9wZXJ0eSBhbmQgd2VcbiAgICAgICAgICAgIC8vIGNhbiBza2lwIHJlZmxlY3RpbmcgdGhlIHByb3BlcnR5IGJhY2sgdG8gdGhlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgLy8gcHJvcGVydHkgY2hhbmdlcyBuZWVkIHRvIGJlIHRyYWNrZWQgaG93ZXZlciBhbmQge0BsaW5rIHJlbmRlcn0gbXVzdCBiZSBjYWxsZWQgYWZ0ZXJcbiAgICAgICAgICAgIC8vIHRoZSBhdHRyaWJ1dGUgY2hhbmdlIGlzIHJlZmxlY3RlZCB0byB0aGlzIHByb3BlcnR5XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzUmVmbGVjdGluZykgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBlbnF1ZXVlIHVwZGF0ZSByZXF1ZXN0IGlmIG5vbmUgd2FzIGVucXVldWVkIGFscmVhZHlcbiAgICAgICAgICAgIHRoaXMuX2VucXVldWVVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVXNlcyBsaXQtaHRtbCdzIHtAbGluayBsaXQtaHRtbCNyZW5kZXJ9IG1ldGhvZCB0byByZW5kZXIgYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHRvIHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciByb290LiBUaGUgY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBzdGF0aWMgdGVtcGxhdGUgbWV0aG9kXG4gICAgICogYXV0b21hdGljYWxseS4gVG8gbWFrZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXZhaWxhYmxlIHRvIHRoZSB0ZW1wbGF0ZSBtZXRob2QsIHlvdSBjYW4gcGFzcyB0aGVtIHRvIHRoZVxuICAgICAqIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogY29uc3QgZGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlKSA9PiB7IC8vIHJldHVybiBzb21lIGRhdGUgdHJhbnNmb3JtYXRpb24uLi5cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnLFxuICAgICAqICAgICAgdGVtcGxhdGU6IChlbGVtZW50LCBmb3JtYXREYXRlKSA9PiBodG1sYDxzcGFuPkxhc3QgdXBkYXRlZDogJHsgZm9ybWF0RGF0ZShlbGVtZW50Lmxhc3RVcGRhdGVkKSB9PC9zcGFuPmBcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIEBwcm9wZXJ0eSgpXG4gICAgICogICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgKlxuICAgICAqICAgICAgcmVuZGVyICgpIHtcbiAgICAgKiAgICAgICAgICAvLyBtYWtlIHRoZSBkYXRlIGZvcm1hdHRlciBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIGJ5IHBhc3NpbmcgaXQgdG8gcmVuZGVyKClcbiAgICAgKiAgICAgICAgICBzdXBlci5yZW5kZXIoZGF0ZUZvcm1hdHRlcik7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBvYmplY3RzIHdoaWNoIHNob3VsZCBiZSBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoLi4uaGVscGVyczogYW55W10pIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbnN0cnVjdG9yLnRlbXBsYXRlICYmIGNvbnN0cnVjdG9yLnRlbXBsYXRlKHRoaXMsIC4uLmhlbHBlcnMpO1xuXG4gICAgICAgIGlmICh0ZW1wbGF0ZSkgcmVuZGVyKHRlbXBsYXRlLCB0aGlzLnJlbmRlclJvb3QsIHsgZXZlbnRDb250ZXh0OiB0aGlzIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbXBvbmVudCBhZnRlciBhbiB1cGRhdGUgd2FzIHJlcXVlc3RlZCB3aXRoIHtAbGluayByZXF1ZXN0VXBkYXRlfVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZW5kZXJzIHRoZSB0ZW1wbGF0ZSwgcmVmbGVjdHMgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIGF0dHJpYnV0ZXMgYW5kXG4gICAgICogZGlzcGF0Y2hlcyBjaGFuZ2UgZXZlbnRzIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBUbyBoYW5kbGUgdXBkYXRlcyBkaWZmZXJlbnRseSwgdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgICAgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlZCBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIHJlZmxlY3Rpb25zICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IHdlcmUgbWFya2VkIGZvciByZWZsZWN0aW9uIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9ucyBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvbiBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIGZpcnN0VXBkYXRlICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhpcyBpcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlIChjaGFuZ2VzOiBDaGFuZ2VzLCByZWZsZWN0aW9uczogQ2hhbmdlcywgbm90aWZpY2F0aW9uczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSB3ZSBhZG9wdCB0aGUgZWxlbWVudCdzIHN0eWxlcyBhbmQgc2V0IHVwIGRlY2xhcmVkIGxpc3RlbmVyc1xuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgdGhpcy5fc3R5bGUoKTtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdCgpO1xuICAgICAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnMgYWZ0ZXIgcmVuZGVyIHRvIGVuc3VyZSBhbGwgRE9NIGlzIHJlbmRlcmVkLCBhbGwgcHJvcGVydGllc1xuICAgICAgICAgICAgLy8gYXJlIHVwLXRvLWRhdGUgYW5kIGFueSB1c2VyLWNyZWF0ZWQgb2JqZWN0cyAoZS5nLiB3b3JrZXJzKSB3aWxsIGJlIGNyZWF0ZWQgaW4gYW5cbiAgICAgICAgICAgIC8vIG92ZXJyaWRkZW4gY29ubmVjdGVkQ2FsbGJhY2s7IGJ1dCBiZWZvcmUgZGlzcGF0Y2hpbmcgYW55IHByb3BlcnR5LWNoYW5nZSBldmVudHNcbiAgICAgICAgICAgIC8vIHRvIG1ha2Ugc3VyZSBsb2NhbCBsaXN0ZW5lcnMgYXJlIGJvdW5kIGZpcnN0XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW4oKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3QoKTtcblxuICAgICAgICAgICAgLy8gVE9ETzogY2FuIHdlIGNoZWNrIGlmIHNlbGVjdGVkIG5vZGVzIGNoYW5nZWQgYW5kIGlmIGxpc3RlbmVycyBhcmUgYWZmZWN0ZWQ/XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlZmxlY3RQcm9wZXJ0aWVzKHJlZmxlY3Rpb25zKTtcbiAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0aWVzKG5vdGlmaWNhdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgY29tcG9uZW50IGFmdGVyIGFuIHVwZGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogUmVzZXRzIHRoZSBjb21wb25lbnQncyBwcm9wZXJ0eSB0cmFja2luZyBtYXBzIHdoaWNoIGFyZSB1c2VkIGluIHRoZSB1cGRhdGUgY3ljbGUgdG8gdHJhY2sgY2hhbmdlcy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVzZXQgKCkge1xuXG4gICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHByb3BlcnR5IGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVzb2x2ZXMgdGhlIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfSBmb3IgdGhlIHByb3BlcnR5IGFuZCByZXR1cm5zIGl0cyByZXN1bHQuXG4gICAgICogSWYgbm9uZSBpcyBkZWZpbmVkICh0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24ncyBgb2JzZXJ2ZWAgb3B0aW9uIGlzIGBmYWxzZWApIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBjaGFuZ2VkLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNDaGFuZ2VkIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBvYnNlcnZlIGlzIGVpdGhlciBgZmFsc2VgIG9yIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZS5jYWxsKG51bGwsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBDSEFOR0VfREVURUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gZm9yIGEgZGVjb3JhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIGRlY2xhcmF0aW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFByb3BlcnR5RGVjbGFyYXRpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVjbGFyYXRpb24gfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbGwgcHJvcGVydHkgY2hhbmdlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgYWxsIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCwgd2hpY2ggaGF2ZSBiZWVuIG1hcmtlZCBmb3IgcmVmbGVjdGlvbi5cbiAgICAgKiBJdCBpcyBjYWxsZWQgYnkgdGhlIHtAbGluayBDb21wb25lbnQudXBkYXRlfSBtZXRob2QgYWZ0ZXIgdGhlIHRlbXBsYXRlIGhhcyBiZWVuIHJlbmRlcmVkLiBJZiBub1xuICAgICAqIHByb3BlcnRpZXMgbWFwIGlzIHByb3ZpZGVkLCB0aGlzIG1ldGhvZCB3aWxsIHJlZmxlY3QgYWxsIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBiZWVuIG1hcmtlZCBmb3JcbiAgICAgKiByZWZsZWN0aW9uIHNpbmNlIHRoZSBsYXN0IGB1cGRhdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnRpZXMgQW4gb3B0aW9uYWwgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHByZXZpb3VzIHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RQcm9wZXJ0aWVzIChwcm9wZXJ0aWVzPzogTWFwPFByb3BlcnR5S2V5LCBhbnk+KSB7XG5cbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgPz8gdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMgYXMgTWFwPGtleW9mIHRoaXMsIGFueT47XG5cbiAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZSwgcHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2UgY2hhbmdlIGV2ZW50cyBmb3IgYWxsIGNoYW5nZWQgcHJvcGVydGllc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHJhaXNlIGNoYW5nZSBldmVudHMgZm9yIGFsbCBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQsIHdoaWNoIGhhdmUgYmVlblxuICAgICAqIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uLiBJdCBpcyBjYWxsZWQgYnkgdGhlIHtAbGluayBDb21wb25lbnQudXBkYXRlfSBtZXRob2QgYWZ0ZXIgdGhlIHRlbXBsYXRlXG4gICAgICogaGFzIGJlZW4gcmVuZGVyZWQgYW5kIHByb3BlcnRpZXMgaGF2ZSBiZWVuIHJlZmxlY3RlZC4gSWYgbm8gcHJvcGVydGllcyBtYXAgaXMgcHJvdmlkZWQsIHRoaXNcbiAgICAgKiBtZXRob2Qgd2lsbCBub3RpZnkgYWxsIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBiZWVuIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uIHNpbmNlIHRoZSBsYXN0IGB1cGRhdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnRpZXMgQW4gb3B0aW9uYWwgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHByZXZpb3VzIHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeVByb3BlcnRpZXMgKHByb3BlcnRpZXM/OiBNYXA8UHJvcGVydHlLZXksIGFueT4pIHtcblxuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyA/PyB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzIGFzIE1hcDxrZXlvZiB0aGlzLCBhbnk+O1xuXG4gICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWUsIHByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMubm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIGFzc29jaWF0ZWQgcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RBdHRyaWJ1dGV9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICAvLyBpZ25vcmUgdXNlci1kZWZpbmVkIG9ic2VydmVkIGF0dHJpYnV0ZXNcbiAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIGFuZCByZW1vdmUgdGhlIGxvZ1xuICAgICAgICBpZiAoIXByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBvYnNlcnZlZCBhdHRyaWJ1dGUgXCIkeyBhdHRyaWJ1dGVOYW1lIH1cIiBub3QgZm91bmQuLi4gaWdub3JpbmcuLi5gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNBdHRyaWJ1dGVSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlLmNhbGwodGhpcywgYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZV0gYXMgQXR0cmlidXRlUmVmbGVjdG9yKShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5fSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkge1xuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHksIHdlIGNhbiBjYXRjaCB0aGUgc3RhdGUgdGhlcmVcbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5UmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5XSBhcyBQcm9wZXJ0eVJlZmxlY3RvcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJhaXNlIGFuIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSBub3RpZmllci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIG5vdGlmaWVyIHtAbGluayBfbm90aWZ5UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByYWlzZSBhbiBldmVudCBmb3JcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpIHtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlOb3RpZmllcihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnldIGFzIFByb3BlcnR5Tm90aWZpZXIpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBjb21wb25lbnQncyByZW5kZXIgcm9vdFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dC4gV2hlbiB1c2luZyB0aGUgY29tcG9uZW50XG4gICAgICogd2l0aCBzaGFkb3cgbW9kZSwgaXQgd2lsbCBiZSBhIHtAbGluayBTaGFkb3dSb290fSwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NyZWF0ZVJlbmRlclJvb3QgKCk6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkuc2hhZG93XG4gICAgICAgICAgICA/IHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pXG4gICAgICAgICAgICA6IHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgY29tcG9uZW50J3Mgc3R5bGVzIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlIHdpbGwgYmUgYWRvcHRlZFxuICAgICAqIGJ5IHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIG5vdCwgYSBzdHlsZSBlbGVtZW50IGlzIGNyZWF0ZWQgYW5kIGF0dGFjaGVkIHRvIHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIHRoZVxuICAgICAqIGNvbXBvbmVudCBpcyBub3QgdXNpbmcgc2hhZG93IG1vZGUsIGEgc2NyaXB0IHRhZyB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLiBGb3IgbXVsdGlwbGVcbiAgICAgKiBpbnN0YW5jZXMgb2YgdGhlIHNhbWUgY29tcG9uZW50IG9ubHkgb25lIHN0eWxlc2hlZXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3N0eWxlICgpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBsZXQgc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyB3ZSBpbnZva2UgdGhlIGdldHRlciBpbiB0aGUgaWYgc3RhdGVtZW50IHRvIGhhdmUgdGhlIGdldHRlciBpbnZva2VkIGxhemlseVxuICAgICAgICAvLyB0aGUgZ2V0dGVycyBmb3Igc3R5bGVTaGVldCBhbmQgc3R5bGVFbGVtZW50IHdpbGwgY3JlYXRlIHRoZSBhY3R1YWwgc3R5bGVTaGVldFxuICAgICAgICAvLyBhbmQgc3R5bGVFbGVtZW50IGFuZCBjYWNoZSB0aGVtIHN0YXRpY2FsbHkgYW5kIHdlIGRvbid0IHdhbnQgdG8gY3JlYXRlIGJvdGhcbiAgICAgICAgLy8gd2UgcHJlZmVyIHRoZSBjb25zdHJ1Y3RhYmxlIHN0eWxlU2hlZXQgYW5kIGZhbGxiYWNrIHRvIHRoZSBzdHlsZSBlbGVtZW50XG4gICAgICAgIGlmICgoc3R5bGVTaGVldCA9IGNvbnN0cnVjdG9yLnN0eWxlU2hlZXQpKSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBwYXJ0IG9uY2Ugd2UgaGF2ZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIChDaHJvbWUgNzMpXG4gICAgICAgICAgICBpZiAoIWNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgaWYgKChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLmluY2x1ZGVzKHN0eWxlU2hlZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgICh0aGlzLnJlbmRlclJvb3QgYXMgU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW3N0eWxlU2hlZXRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0eWxlRWxlbWVudCA9IGNvbnN0cnVjdG9yLnN0eWxlRWxlbWVudCkpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB3ZSBkb24ndCBkdXBsaWNhdGUgc3R5bGVzaGVldHMgZm9yIG5vbi1zaGFkb3cgZWxlbWVudHNcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlQWxyZWFkeUFkZGVkID0gY29uc3RydWN0b3Iuc2hhZG93XG4gICAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgICAgIDogQXJyYXkuZnJvbShkb2N1bWVudC5zdHlsZVNoZWV0cykuZmluZChzdHlsZSA9PiBzdHlsZS50aXRsZSA9PT0gY29uc3RydWN0b3Iuc2VsZWN0b3IpICYmIHRydWUgfHwgZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChzdHlsZUFscmVhZHlBZGRlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBjbG9uZSB0aGUgY2FjaGVkIHN0eWxlIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gc3R5bGVFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKGNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb290LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgYXR0cmlidXRlIHJlZmxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBubyB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgYXR0cmlidXRlIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLmZyb21BdHRyaWJ1dGUuY2FsbCh0aGlzLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiB0aGlzXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGhhdmUgYSBkZWNsYXJhdGlvblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gaWYgdGhlIGRlZmF1bHQgcmVmbGVjdG9yIGlzIHVzZWQsIHdlIG5lZWQgdG8gY2hlY2sgaWYgYW4gYXR0cmlidXRlIGZvciB0aGlzIHByb3BlcnR5IGV4aXN0c1xuICAgICAgICAvLyBpZiBub3QsIHdlIHdvbid0IHJlZmxlY3RcbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlY2xhcmF0aW9uLmF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHksIGl0J3MgYSBzdHJpbmdcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlIGFzIHN0cmluZztcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci50b0F0dHJpYnV0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlKTtcblxuICAgICAgICAvLyB1bmRlZmluZWQgbWVhbnMgZG9uJ3QgY2hhbmdlXG4gICAgICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIG1lYW5zIHJlbW92ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGVsc2UgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRXZlbnR9XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXlcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5UHJvcGVydHk8VCA9IGFueT4gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IFQsIG5ld1ZhbHVlOiBUKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaChuZXcgUHJvcGVydHlDaGFuZ2VFdmVudChwcm9wZXJ0eUtleSwge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBwcmV2aW91czogb2xkVmFsdWUsXG4gICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZSxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEge0BsaW5rIExpZmVjeWNsZUV2ZW50fVxuICAgICAqXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZSBUaGUgbGlmZWN5Y2xlIGZvciB3aGljaCB0byByYWlzZSB0aGUgZXZlbnQgKHdpbGwgYmUgdGhlIGV2ZW50IG5hbWUpXG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeUxpZmVjeWNsZSAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbDogb2JqZWN0ID0ge30pIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoKG5ldyBMaWZlY3ljbGVFdmVudChsaWZlY3ljbGUsIHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgIC4uLmRldGFpbCxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW4gKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLmxpc3RlbmVycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbGlzdGVuZXIpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEZWNsYXJhdGlvbjogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgY2xhc3MncyBzdGF0aWMgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW50byBhbiBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGV2ZW50OiBkZWNsYXJhdGlvbi5ldmVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBkZWNsYXJhdGlvbi5vcHRpb25zLFxuXG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aGUgY29tcG9uZW50cyBsaXN0ZW5lciBtZXRob2QgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6ICh0aGlzW2xpc3RlbmVyIGFzIGtleW9mIHRoaXNdIGFzIHVua25vd24gYXMgRXZlbnRMaXN0ZW5lcikuYmluZCh0aGlzKSxcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnQgdGFyZ2V0IGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICgodHlwZW9mIGRlY2xhcmF0aW9uLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgPyBkZWNsYXJhdGlvbi50YXJnZXQuY2FsbCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgfHwgdGhpcyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgYm91bmQgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRhcmdldFxuICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmV2ZW50ISxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGluIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLnB1c2goaW5zdGFuY2VEZWNsYXJhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5ldmVudCEsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXJ5IGNvbXBvbmVudCBzZWxlY3RvcnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0ICgpIHtcblxuICAgICAgICAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zZWxlY3RvcnMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIHByb3BlcnR5KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSAoKHR5cGVvZiBkZWNsYXJhdGlvbi5yb290ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgID8gZGVjbGFyYXRpb24ucm9vdC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgOiBkZWNsYXJhdGlvbi5yb290KVxuICAgICAgICAgICAgICAgIHx8IHRoaXMucmVuZGVyUm9vdDtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRlY2xhcmF0aW9uLmFsbFxuICAgICAgICAgICAgICAgID8gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKGRlY2xhcmF0aW9uLnF1ZXJ5ISlcbiAgICAgICAgICAgICAgICA6IHJvb3QucXVlcnlTZWxlY3RvcihkZWNsYXJhdGlvbi5xdWVyeSEpO1xuXG4gICAgICAgICAgICB0aGlzW3Byb3BlcnR5IGFzIGtleW9mIHRoaXNdID0gZWxlbWVudCBhcyBhbnk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGNvbXBvbmVudCBzZWxlY3RvciByZWZlcmVuY2VzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Vuc2VsZWN0ICgpIHtcblxuICAgICAgICAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zZWxlY3RvcnMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIHByb3BlcnR5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXNbcHJvcGVydHkgYXMga2V5b2YgdGhpc10gPSB1bmRlZmluZWQgYXMgYW55O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiByZXZpZXcgX2VucXVldWVVcGRhdGUgbWV0aG9kXG4gICAgLy8gYXdhaXQgcHJldmlvdXNVcGRhdGUgaXMgYWxyZWFkeSBkZWZlcnJpbmcgZXZlcnl0aGluZyB0byBuZXh0IG1pY3JvIHRhc2tcbiAgICAvLyB0aGVuIHdlIGF3YWl0IHVwZGF0ZSAtIGV4Y2VwdCBmb3IgZmlyc3QgdGltZS4uLlxuICAgIC8vIHdlIG5ldmVyIGVucXVldWUgd2hlbiBfaGFzUmVxdWVzdGVkVXBkYXRlIGlzIHRydWUgYW5kIHdlIG9ubHkgc2V0IGl0IHRvIGZhbHNlXG4gICAgLy8gYWZ0ZXIgdGhlIG5ldyByZXF1ZXN0IHJlc29sdmVkXG4gICAgLyoqXG4gICAgICogRW5xdWV1ZSBhIHJlcXVlc3QgZm9yIGFuIGFzeW5jaHJvbm91cyB1cGRhdGVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfZW5xdWV1ZVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgbGV0IHJlc29sdmU6IChyZXN1bHQ6IGJvb2xlYW4pID0+IHZvaWQ7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNSZXF1ZXN0ID0gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAvLyBtYXJrIHRoZSBjb21wb25lbnQgYXMgaGF2aW5nIHJlcXVlc3RlZCBhbiB1cGRhdGUsIHRoZSB7QGxpbmsgX3JlcXVlc3RVcGRhdGV9XG4gICAgICAgIC8vIG1ldGhvZCB3aWxsIG5vdCBlbnF1ZXVlIGEgZnVydGhlciByZXF1ZXN0IGZvciB1cGRhdGUgaWYgb25lIGlzIHNjaGVkdWxlZFxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJlcXVlc3QgPSBuZXcgUHJvbWlzZTxib29sZWFuPihyZXMgPT4gcmVzb2x2ZSA9IHJlcyk7XG5cbiAgICAgICAgLy8gd2FpdCBmb3IgdGhlIHByZXZpb3VzIHVwZGF0ZSB0byByZXNvbHZlXG4gICAgICAgIC8vIGBhd2FpdGAgaXMgYXN5bmNocm9ub3VzIGFuZCB3aWxsIHJldHVybiBleGVjdXRpb24gdG8gdGhlIHtAbGluayByZXF1ZXN0VXBkYXRlfSBtZXRob2RcbiAgICAgICAgLy8gYW5kIGVzc2VudGlhbGx5IGFsbG93cyB1cyB0byBiYXRjaCBtdWx0aXBsZSBzeW5jaHJvbm91cyBwcm9wZXJ0eSBjaGFuZ2VzLCBiZWZvcmUgdGhlXG4gICAgICAgIC8vIGV4ZWN1dGlvbiBjYW4gcmVzdW1lIGhlcmVcbiAgICAgICAgYXdhaXQgcHJldmlvdXNSZXF1ZXN0O1xuXG4gICAgICAgIC8vIGFzayB0aGUgc2NoZWR1bGVyIGZvciBhIG5ldyB1cGRhdGVcbiAgICAgICAgY29uc3QgdXBkYXRlID0gdGhpcy5fc2NoZWR1bGVVcGRhdGUoKTtcblxuICAgICAgICAvLyB0aGUgYWN0dWFsIHVwZGF0ZSBtYXkgYmUgc2NoZWR1bGVkIGFzeW5jaHJvbm91c2x5IGFzIHdlbGwsIGluIHdoaWNoIGNhc2Ugd2Ugd2FpdCBmb3IgaXRcbiAgICAgICAgaWYgKHVwZGF0ZSkgYXdhaXQgdXBkYXRlO1xuXG4gICAgICAgIC8vIG1hcmsgY29tcG9uZW50IGFzIHVwZGF0ZWQgKmFmdGVyKiB0aGUgdXBkYXRlIHRvIHByZXZlbnQgaW5maW50ZSBsb29wcyBpbiB0aGUgdXBkYXRlIHByb2Nlc3NcbiAgICAgICAgLy8gTi5CLjogYW55IHByb3BlcnR5IGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGUgd2lsbCBub3QgdHJpZ2dlciBhbm90aGVyIHVwZGF0ZVxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBuZXcge0BsaW5rIF91cGRhdGVSZXF1ZXN0fSBhZnRlciB0aGUgcmVzdWx0IG9mIHRoZSBjdXJyZW50IHVwZGF0ZSByZXNvbHZlc1xuICAgICAgICByZXNvbHZlISghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTY2hlZHVsZSB0aGUgdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2NoZWR1bGVzIHRoZSBmaXJzdCB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhcyBzb29uIGFzIHBvc3NpYmxlIGFuZCBhbGwgY29uc2VjdXRpdmUgdXBkYXRlc1xuICAgICAqIGp1c3QgYmVmb3JlIHRoZSBuZXh0IGZyYW1lLiBJbiB0aGUgbGF0dGVyIGNhc2UgaXQgcmV0dXJucyBhIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCBhZnRlclxuICAgICAqIHRoZSB1cGRhdGUgaXMgZG9uZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2NoZWR1bGVVcGRhdGUgKCk6IFByb21pc2U8dm9pZD4gfCB2b2lkIHtcblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1VwZGF0ZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIHNjaGVkdWxlIHRoZSB1cGRhdGUgdmlhIHJlcXVlc3RBbmltYXRpb25GcmFtZSB0byBhdm9pZCBtdWx0aXBsZSByZWRyYXdzIHBlciBmcmFtZVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGNvbXBvbmVudCB1cGRhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW52b2tlcyB7QGxpbmsgdXBkYXRlQ2FsbGJhY2t9IGFmdGVyIHBlcmZvcm1pbmcgdGhlIHVwZGF0ZSBhbmQgY2xlYW5zIHVwIHRoZSBjb21wb25lbnRcbiAgICAgKiBzdGF0ZS4gRHVyaW5nIHRoZSBmaXJzdCB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZXMgd2lsbCBiZSBhZGRlZC4gRGlzcGF0Y2hlcyB0aGUgdXBkYXRlXG4gICAgICogbGlmZWN5Y2xlIGV2ZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wZXJmb3JtVXBkYXRlICgpIHtcblxuICAgICAgICAvLyB3ZSBoYXZlIHRvIHdhaXQgdW50aWwgdGhlIGNvbXBvbmVudCBpcyBjb25uZWN0ZWQgYmVmb3JlIHdlIGNhbiBkbyBhbnkgdXBkYXRlc1xuICAgICAgICAvLyB0aGUge0BsaW5rIGNvbm5lY3RlZENhbGxiYWNrfSB3aWxsIGNhbGwge0BsaW5rIHJlcXVlc3RVcGRhdGV9IGluIGFueSBjYXNlLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8gc2ltcGx5IGJ5cGFzcyBhbnkgYWN0dWFsIHVwZGF0ZSBhbmQgY2xlYW4tdXAgdW50aWwgdGhlblxuICAgICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG4gICAgICAgICAgICBjb25zdCByZWZsZWN0aW9ucyA9IG5ldyBNYXAodGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMpO1xuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9ucyA9IG5ldyBNYXAodGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIHBhc3MgYSBjb3B5IG9mIHRoZSBwcm9wZXJ0eSBjaGFuZ2VzIHRvIHRoZSB1cGRhdGUgbWV0aG9kLCBzbyBwcm9wZXJ0eSBjaGFuZ2VzXG4gICAgICAgICAgICAvLyBhcmUgYXZhaWxhYmxlIGluIGFuIG92ZXJyaWRkZW4gdXBkYXRlIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy51cGRhdGUoY2hhbmdlcywgcmVmbGVjdGlvbnMsIG5vdGlmaWNhdGlvbnMsICF0aGlzLl9oYXNVcGRhdGVkKTtcblxuICAgICAgICAgICAgLy8gcmVzZXQgcHJvcGVydHkgbWFwcyBkaXJlY3RseSBhZnRlciB0aGUgdXBkYXRlLCBzbyBjaGFuZ2VzIGR1cmluZyB0aGUgdXBkYXRlQ2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGNhbiBiZSByZWNvcmRlZCBmb3IgdGhlIG5leHQgdXBkYXRlLCB3aGljaCBoYXMgdG8gYmUgdHJpZ2dlcmVkIG1hbnVhbGx5IHRob3VnaFxuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKGNoYW5nZXMsICF0aGlzLl9oYXNVcGRhdGVkKTtcblxuICAgICAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCd1cGRhdGUnLCB7IGNoYW5nZXM6IGNoYW5nZXMsIGZpcnN0VXBkYXRlOiAhdGhpcy5faGFzVXBkYXRlZCB9KTtcblxuICAgICAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKipcbiAqIEEgc2ltcGxlIGNzcyB0ZW1wbGF0ZSBsaXRlcmFsIHRhZ1xuICpcbiAqIEByZW1hcmtzXG4gKiBUaGUgdGFnIGl0c2VsZiBkb2Vzbid0IGRvIGFueXRoaW5nIHRoYXQgYW4gdW50YWdnZWQgdGVtcGxhdGUgbGl0ZXJhbCB3b3VsZG4ndCBkbywgYnV0IGl0IGNhbiBiZSB1c2VkIGJ5XG4gKiBlZGl0b3IgcGx1Z2lucyB0byBpbmZlciB0aGUgXCJ2aXJ0dWFsIGRvY3VtZW50IHR5cGVcIiB0byBwcm92aWRlIGNvZGUgY29tcGxldGlvbiBhbmQgaGlnaGxpZ2h0aW5nLiBJdCBjb3VsZFxuICogYWxzbyBiZSB1c2VkIGluIHRoZSBmdXR1cmUgdG8gbW9yZSBzZWN1cmVseSBjb252ZXJ0IHN1YnN0aXR1dGlvbnMgaW50byBzdHJpbmdzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcbiAqXG4gKiBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuICogICBkaXNwbGF5OiBibG9jaztcbiAqICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAqICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbiAqIGA7XG4gKlxuICogY29uc3QgbWl4aW5Ib3ZlciA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBjc3NgXG4gKiAkeyBzZWxlY3RvciB9OmhvdmVyIHtcbiAqICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuICogfVxuICogYDtcbiAqXG4gKiBjb25zdCBzdHlsZXMgPSBjc3NgXG4gKiA6aG9zdCB7XG4gKiAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICAkeyBtaXhpbkJveCgpIH1cbiAqIH1cbiAqICR7IG1peGluSG92ZXIoJzpob3N0JykgfVxuICogOjpzbG90dGVkKCopIHtcbiAqICAgbWFyZ2luOiAwO1xuICogfVxuICogYDtcbiAqXG4gKiAvLyB3aWxsIHByb2R1Y2UuLi5cbiAqIDpob3N0IHtcbiAqIC0taG92ZXItY29sb3I6IGdyZWVuO1xuICogZGlzcGxheTogYmxvY2s7XG4gKlxuICogZGlzcGxheTogYmxvY2s7XG4gKiBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogYm9yZGVyOiAxcHggc29saWQgc2lsdmVyO1xuICpcbiAqIH1cbiAqXG4gKiA6aG9zdDpob3ZlciB7XG4gKiBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKlxuICogOjpzbG90dGVkKCopIHtcbiAqIG1hcmdpbjogMDtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgY3NzID0gKGxpdGVyYWxzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uc3Vic3RpdHV0aW9uczogYW55W10pID0+IHtcblxuICAgIHJldHVybiBzdWJzdGl0dXRpb25zLnJlZHVjZSgocHJldjogc3RyaW5nLCBjdXJyOiBhbnksIGk6IG51bWJlcikgPT4gcHJldiArIGN1cnIgKyBsaXRlcmFsc1tpICsgMV0sIGxpdGVyYWxzWzBdKTtcbn07XG5cbi8vIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcblxuLy8gY29uc3QgbWl4aW5Cb3ggPSAoYm9yZGVyV2lkdGg6IHN0cmluZyA9ICcxcHgnLCBib3JkZXJDb2xvcjogc3RyaW5nID0gJ3NpbHZlcicpID0+IGNzc2Bcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4vLyAgIGJvcmRlcjogJHtib3JkZXJXaWR0aH0gc29saWQgJHtib3JkZXJDb2xvcn07XG4vLyBgO1xuXG4vLyBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2Bcbi8vICR7IHNlbGVjdG9yIH06aG92ZXIge1xuLy8gICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4vLyB9XG4vLyBgO1xuXG4vLyBjb25zdCBzdHlsZXMgPSBjc3NgXG4vLyA6aG9zdCB7XG4vLyAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4vLyAgIGRpc3BsYXk6IGJsb2NrO1xuLy8gICAkeyBtaXhpbkJveCgpIH1cbi8vIH1cblxuLy8gJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG5cbi8vIDo6c2xvdHRlZCgqKSB7XG4vLyAgIG1hcmdpbjogMDtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4iLCJleHBvcnQgY29uc3QgQXJyb3dVcCA9ICdBcnJvd1VwJztcbmV4cG9ydCBjb25zdCBBcnJvd0Rvd24gPSAnQXJyb3dEb3duJztcbmV4cG9ydCBjb25zdCBBcnJvd0xlZnQgPSAnQXJyb3dMZWZ0JztcbmV4cG9ydCBjb25zdCBBcnJvd1JpZ2h0ID0gJ0Fycm93UmlnaHQnO1xuZXhwb3J0IGNvbnN0IEVudGVyID0gJ0VudGVyJztcbmV4cG9ydCBjb25zdCBFc2NhcGUgPSAnRXNjYXBlJztcbmV4cG9ydCBjb25zdCBTcGFjZSA9ICcgJztcbmV4cG9ydCBjb25zdCBUYWIgPSAnVGFiJztcbmV4cG9ydCBjb25zdCBCYWNrc3BhY2UgPSAnQmFja3NwYWNlJztcbmV4cG9ydCBjb25zdCBBbHQgPSAnQWx0JztcbmV4cG9ydCBjb25zdCBTaGlmdCA9ICdTaGlmdCc7XG5leHBvcnQgY29uc3QgQ29udHJvbCA9ICdDb250cm9sJztcbmV4cG9ydCBjb25zdCBNZXRhID0gJ01ldGEnO1xuIiwiaW1wb3J0IHsgQXJyb3dEb3duLCBBcnJvd0xlZnQsIEFycm93UmlnaHQsIEFycm93VXAgfSBmcm9tICcuL2tleXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RJdGVtIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVJdGVtQ2hhbmdlPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBDdXN0b21FdmVudCB7XG4gICAgdHlwZTogJ2FjdGl2ZS1pdGVtLWNoYW5nZSc7XG4gICAgZGV0YWlsOiB7XG4gICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGl0ZW06IFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnR5cGUgTGlzdEVudHJ5PFQgZXh0ZW5kcyBMaXN0SXRlbT4gPSBbbnVtYmVyIHwgdW5kZWZpbmVkLCBUIHwgdW5kZWZpbmVkXTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpc3RLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBFdmVudFRhcmdldCB7XG5cbiAgICBwcm90ZWN0ZWQgYWN0aXZlSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJdGVtOiBUIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGxpc3RlbmVyczogTWFwPHN0cmluZywgRXZlbnRMaXN0ZW5lcj4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgaXRlbVR5cGU6IGFueTtcblxuICAgIHB1YmxpYyBpdGVtczogVFtdO1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwdWJsaWMgaG9zdDogSFRNTEVsZW1lbnQsXG4gICAgICAgIGl0ZW1zOiBOb2RlTGlzdE9mPFQ+LFxuICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJykge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IEFycmF5LmZyb20oaXRlbXMpO1xuICAgICAgICB0aGlzLml0ZW1UeXBlID0gdGhpcy5pdGVtc1swXSAmJiB0aGlzLml0ZW1zWzBdLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHRoaXMuYmluZEhvc3QoKTtcbiAgICB9XG5cbiAgICBnZXRBY3RpdmVJdGVtICgpOiBUIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJdGVtO1xuICAgIH07XG5cbiAgICBzZXRBY3RpdmVJdGVtIChpdGVtOiBULCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBMaXN0RW50cnk8VD4gPSBbXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaW5kZXggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaXRlbSA6IHVuZGVmaW5lZFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXROZXh0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXROZXh0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldFByZXZpb3VzSXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRQcmV2aW91c0VudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRGaXJzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0Rmlyc3RFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0TGFzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0TGFzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IFtwcmV2LCBuZXh0XSA9ICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSA/IFtBcnJvd0xlZnQsIEFycm93UmlnaHRdIDogW0Fycm93VXAsIEFycm93RG93bl07XG4gICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBwcmV2OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQcmV2aW91c0l0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgbmV4dDpcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TmV4dEl0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IHRhcmdldDogVCB8IG51bGwgPSBldmVudC50YXJnZXQgYXMgVCB8IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgdGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSAmJiAhdGFyZ2V0IS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRm9jdXMgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlIChwcmV2aW91c0luZGV4OiBudW1iZXIgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICBjb25zdCBldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUPiA9IG5ldyBDdXN0b21FdmVudCgnYWN0aXZlLWl0ZW0tY2hhbmdlJywge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiAodHlwZW9mIHByZXZpb3VzSW5kZXggPT09ICdudW1iZXInKSA/IHRoaXMuaXRlbXNbcHJldmlvdXNJbmRleF0gOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHRoaXMuYWN0aXZlSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuYWN0aXZlSXRlbVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgQWN0aXZlSXRlbUNoYW5nZTxUPjtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRFbnRyeUFjdGl2ZSAoZW50cnk6IExpc3RFbnRyeTxUPiwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dID0gZW50cnk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldE5leHRFbnRyeSAoZnJvbUluZGV4PzogbnVtYmVyKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICBmcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICA/IGZyb21JbmRleFxuICAgICAgICAgICAgOiAodHlwZW9mIHRoaXMuYWN0aXZlSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmVJbmRleFxuICAgICAgICAgICAgICAgIDogLTE7XG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5pdGVtcy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgbmV4dEluZGV4ID0gZnJvbUluZGV4ICsgMTtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gdGhpcy5pdGVtc1tuZXh0SW5kZXhdO1xuXG4gICAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsYXN0SW5kZXggJiYgbmV4dEl0ZW0gJiYgbmV4dEl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zWysrbmV4dEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAobmV4dEl0ZW0gJiYgIW5leHRJdGVtLmRpc2FibGVkKSA/IFtuZXh0SW5kZXgsIG5leHRJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRQcmV2aW91c0VudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAwO1xuXG4gICAgICAgIGxldCBwcmV2SW5kZXggPSBmcm9tSW5kZXggLSAxO1xuICAgICAgICBsZXQgcHJldkl0ZW0gPSB0aGlzLml0ZW1zW3ByZXZJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKHByZXZJbmRleCA+IDAgJiYgcHJldkl0ZW0gJiYgcHJldkl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgcHJldkl0ZW0gPSB0aGlzLml0ZW1zWy0tcHJldkluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAocHJldkl0ZW0gJiYgIXByZXZJdGVtLmRpc2FibGVkKSA/IFtwcmV2SW5kZXgsIHByZXZJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRGaXJzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldE5leHRFbnRyeSgtMSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldExhc3RFbnRyeSAoKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcmV2aW91c0VudHJ5KHRoaXMuaXRlbXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYmluZEhvc3QgKCkge1xuXG4gICAgICAgIC8vIFRPRE86IGVuYWJsZSByZWNvbm5lY3RpbmcgdGhlIGhvc3QgZWxlbWVudD8gbm8gbmVlZCBpZiBGb2N1c01hbmFnZXIgaXMgY3JlYXRlZCBpbiBjb25uZWN0ZWRDYWxsYmFja1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBNYXAoW1xuICAgICAgICAgICAgWydmb2N1c2luJywgdGhpcy5oYW5kbGVGb2N1cy5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2Vkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2Rpc2Nvbm5lY3RlZCcsIHRoaXMudW5iaW5kSG9zdC5iaW5kKHRoaXMpXVxuICAgICAgICBdKTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1bmJpbmRIb3N0ICgpIHtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZvY3VzS2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgTGlzdEtleU1hbmFnZXI8VD4ge1xuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgc3VwZXIuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJdGVtICYmIGludGVyYWN0aXZlKSB0aGlzLmFjdGl2ZUl0ZW0uZm9jdXMoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50PEljb24+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWljb24nLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICB3aWR0aDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBwYWRkaW5nOiBjYWxjKCh2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pIC0gdmFyKC0tZm9udC1zaXplLCAxZW0pKSAvIDIpO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIH1cbiAgICBzdmcge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgICAgICAgZmlsbDogdmFyKC0taWNvbi1jb2xvciwgY3VycmVudENvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PXVuaV0pIHtcbiAgICAgICAgcGFkZGluZzogMGVtO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9bWF0XSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9ZWldKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBjb25zdCBzZXQgPSBlbGVtZW50LnNldDtcbiAgICAgICAgY29uc3QgaWNvbiA9IChzZXQgPT09ICdtYXQnKVxuICAgICAgICAgICAgPyBgaWNfJHsgZWxlbWVudC5pY29uIH1fMjRweGBcbiAgICAgICAgICAgIDogKHNldCA9PT0gJ2VpJylcbiAgICAgICAgICAgICAgICA/IGBlaS0keyBlbGVtZW50Lmljb24gfS1pY29uYFxuICAgICAgICAgICAgICAgIDogZWxlbWVudC5pY29uO1xuXG4gICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICA8c3ZnIGZvY3VzYWJsZT1cImZhbHNlXCI+XG4gICAgICAgICAgICA8dXNlIGhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIlxuICAgICAgICAgICAgeGxpbms6aHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiIC8+XG4gICAgICAgIDwvc3ZnPmA7XG4gICAgfVxufSlcbmV4cG9ydCBjbGFzcyBJY29uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIGZvciBjYWNoaW5nIGFuIGljb24gc2V0J3Mgc3ByaXRlIHVybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3Nwcml0ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHN2ZyBzcHJpdGUgdXJsIGZvciB0aGUgcmVxdWVzdGVkIGljb24gc2V0XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzcHJpdGUgdXJsIGZvciBhbiBpY29uIHNldCBjYW4gYmUgc2V0IHRocm91Z2ggYSBgbWV0YWAgdGFnIGluIHRoZSBodG1sIGRvY3VtZW50LiBZb3UgY2FuIGRlZmluZVxuICAgICAqIGN1c3RvbSBpY29uIHNldHMgYnkgY2hvc2luZyBhbiBpZGVudGlmaWVyIChzdWNoIGFzIGA6bXlzZXRgIGluc3RlYWQgb2YgYDpmYWAsIGA6bWF0YCBvciBgOmllYCkgYW5kXG4gICAgICogY29uZmlndXJpbmcgaXRzIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhZG9jdHlwZSBodG1sPlxuICAgICAqIDxodG1sPlxuICAgICAqICAgIDxoZWFkPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgbXVsdGlwbGUgc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpmYVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9mb250LWF3ZXNvbWUvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTptYXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvbWF0ZXJpYWwvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTplaVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL2V2aWwtaWNvbnMvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBjdXN0b20gc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpteXNldFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL215c2V0L215X3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwvaGVhZD5cbiAgICAgKiAgICAuLi5cbiAgICAgKiA8L2h0bWw+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBXaGVuIHVzaW5nIHRoZSBpY29uIGVsZW1lbnQsIHNwZWNpZnkgeW91ciBjdXN0b20gaWNvbiBzZXQuXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCEtLSB1c2UgYXR0cmlidXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiBkYXRhLWljb249XCJteV9pY29uX2lkXCIgZGF0YS1zZXQ9XCJteXNldFwiPjwvdWktaWNvbj5cbiAgICAgKiA8IS0tIG9yIHVzZSBwcm9wZXJ0eSBiaW5kaW5ncyB3aXRoaW4gbGl0LWh0bWwgdGVtcGxhdGVzIC0tPlxuICAgICAqIDx1aS1pY29uIC5pY29uPSR7J215X2ljb25faWQnfSAuc2V0PSR7J215c2V0J30+PC91aS1pY29uPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogSWYgbm8gc3ByaXRlIHVybCBpcyBzcGVjaWZpZWQgZm9yIGEgc2V0LCB0aGUgaWNvbiBlbGVtZW50IHdpbGwgYXR0ZW1wdCB0byB1c2UgYW4gc3ZnIGljb24gZnJvbVxuICAgICAqIGFuIGlubGluZWQgc3ZnIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBnZXRTcHJpdGUgKHNldDogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3Nwcml0ZXMuaGFzKHNldCkpIHtcblxuICAgICAgICAgICAgY29uc3QgbWV0YSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYG1ldGFbbmFtZT1cInVpLWljb246c3ByaXRlOiR7IHNldCB9XCJdW2NvbnRlbnRdYCk7XG5cbiAgICAgICAgICAgIGlmIChtZXRhKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVzLnNldChzZXQsIG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50JykhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zcHJpdGVzLmdldChzZXQpIHx8ICcnO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtaWNvbidcbiAgICB9KVxuICAgIGljb24gPSAnaW5mbyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLXNldCdcbiAgICB9KVxuICAgIHNldCA9ICdmYSdcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2ltZycpO1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgJy4uL2ljb24vaWNvbic7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcblxuQGNvbXBvbmVudDxBY2NvcmRpb25IZWFkZXI+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1oZWFkZXInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGFsbDogaW5oZXJpdDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIGZsZXg6IDEgMSAxMDAlO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWRpc2FibGVkPXRydWVdKSB7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9dHJ1ZV0pID4gdWktaWNvbi5leHBhbmQsXG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9ZmFsc2VdKSA+IHVpLWljb24uY29sbGFwc2Uge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8dWktaWNvbiBjbGFzcz1cImNvbGxhcHNlXCIgZGF0YS1pY29uPVwibWludXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICA8dWktaWNvbiBjbGFzcz1cImV4cGFuZFwiIGRhdGEtaWNvbj1cInBsdXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkhlYWRlciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5cbmV4cG9ydCB0eXBlIENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZykgPT4gVGVtcGxhdGVSZXN1bHQ7XG5cbmV4cG9ydCBjb25zdCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0ID0+IHtcblxuICAgIHJldHVybiBodG1sYCZjb3B5OyBDb3B5cmlnaHQgJHsgZGF0ZS5nZXRGdWxsWWVhcigpIH0gJHsgYXV0aG9yLnRyaW0oKSB9YDtcbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IGNvcHlyaWdodCwgQ29weXJpZ2h0SGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9jb3B5cmlnaHQnO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcblxubGV0IG5leHRBY2NvcmRpb25QYW5lbElkID0gMDtcblxuQGNvbXBvbmVudDxBY2NvcmRpb25QYW5lbD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24taGVhZGVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5IHtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgICBvdmVyZmxvdzogYXV0bztcbiAgICAgICAgdHJhbnNpdGlvbjogaGVpZ2h0IC4ycyBlYXNlLW91dDtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHlbYXJpYS1oaWRkZW49dHJ1ZV0ge1xuICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuICAgIC5jb3B5cmlnaHQge1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW0gMXJlbTtcbiAgICAgICAgY29sb3I6IHZhcigtLWRpc2FibGVkLWNvbG9yLCAnI2NjYycpO1xuICAgICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAocGFuZWwsIGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyKSA9PiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24taGVhZGVyXCJcbiAgICAgICAgcm9sZT1cImhlYWRpbmdcIlxuICAgICAgICBhcmlhLWxldmVsPVwiJHsgcGFuZWwubGV2ZWwgfVwiXG4gICAgICAgIEBjbGljaz0keyBwYW5lbC50b2dnbGUgfT5cbiAgICAgICAgPHNsb3QgbmFtZT1cImhlYWRlclwiPjwvc2xvdD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWJvZHlcIlxuICAgICAgICBpZD1cIiR7IHBhbmVsLmlkIH0tYm9keVwiXG4gICAgICAgIHN0eWxlPVwiaGVpZ2h0OiAkeyBwYW5lbC5jb250ZW50SGVpZ2h0IH07XCJcbiAgICAgICAgcm9sZT1cInJlZ2lvblwiXG4gICAgICAgIGFyaWEtaGlkZGVuPVwiJHsgIXBhbmVsLmV4cGFuZGVkIH1cIlxuICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCIkeyBwYW5lbC5pZCB9LWhlYWRlclwiPlxuICAgICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY29weXJpZ2h0XCI+JHsgY29weXJpZ2h0KG5ldyBEYXRlKCksICdBbGV4YW5kZXIgV2VuZGUnKSB9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIF9oZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwgPSBudWxsO1xuICAgIHByb3RlY3RlZCBfYm9keTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIHByb3RlY3RlZCBnZXQgY29udGVudEhlaWdodCAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gIXRoaXMuZXhwYW5kZWQgP1xuICAgICAgICAgICAgJzBweCcgOlxuICAgICAgICAgICAgdGhpcy5fYm9keSA/XG4gICAgICAgICAgICAgICAgYCR7IHRoaXMuX2JvZHkuc2Nyb2xsSGVpZ2h0IH1weGAgOlxuICAgICAgICAgICAgICAgICdhdXRvJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgbGV2ZWwgPSAxO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IgKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgYHVpLWFjY29yZGlvbi1wYW5lbC0keyBuZXh0QWNjb3JkaW9uUGFuZWxJZCsrIH1gO1xuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICAvLyB3cmFwcGluZyB0aGUgcHJvcGVydHkgY2hhbmdlIGluIHRoZSB3YXRjaCBtZXRob2Qgd2lsbCBkaXNwYXRjaCBhIHByb3BlcnR5IGNoYW5nZSBldmVudFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hlYWRlcikgdGhpcy5faGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRIZWFkZXIodGhpcy5xdWVyeVNlbGVjdG9yKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlLCB3ZSBxdWVyeSB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHlcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcihgIyR7IHRoaXMuaWQgfS1ib2R5YCk7XG5cbiAgICAgICAgICAgIC8vIGhhdmluZyBxdWVyaWVkIHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keSwge0BsaW5rIGNvbnRlbnRIZWlnaHR9IGNhbiBub3cgY2FsY3VsYXRlIHRoZVxuICAgICAgICAgICAgLy8gY29ycmVjdCBoZWlnaHQgb2YgdGhlIHBhbmVsIGJvZHkgZm9yIGFuaW1hdGlvblxuICAgICAgICAgICAgLy8gaW4gb3JkZXIgdG8gcmUtZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGJpbmRpbmcgZm9yIHtAbGluayBjb250ZW50SGVpZ2h0fSB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIGFub3RoZXIgcmVuZGVyICh0aGlzIGlzIGNoZWFwLCBvbmx5IGNvbnRlbnRIZWlnaHQgaGFzIGNoYW5nZWQgYW5kIHdpbGwgYmUgdXBkYXRlZClcbiAgICAgICAgICAgIC8vIGhvd2V2ZXIgd2UgY2Fubm90IHJlcXVlc3QgYW5vdGhlciB1cGRhdGUgd2hpbGUgd2UgYXJlIHN0aWxsIGluIHRoZSBjdXJyZW50IHVwZGF0ZSBjeWNsZVxuICAgICAgICAgICAgLy8gdXNpbmcgYSBQcm9taXNlLCB3ZSBjYW4gZGVmZXIgcmVxdWVzdGluZyB0aGUgdXBkYXRlIHVudGlsIGFmdGVyIHRoZSBjdXJyZW50IHVwZGF0ZSBpcyBkb25lXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodHJ1ZSkudGhlbigoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgcmVuZGVyIG1ldGhvZCB0byBpbmplY3QgY3VzdG9tIGhlbHBlcnMgaW50byB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICgpIHtcblxuICAgICAgICBzdXBlci5yZW5kZXIoY29weXJpZ2h0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0SGVhZGVyIChoZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwpIHtcblxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBoZWFkZXI7XG5cbiAgICAgICAgaWYgKCFoZWFkZXIpIHJldHVybjtcblxuICAgICAgICBoZWFkZXIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2hlYWRlcicpO1xuXG4gICAgICAgIGhlYWRlci5pZCA9IGhlYWRlci5pZCB8fCBgJHsgdGhpcy5pZCB9LWhlYWRlcmA7XG4gICAgICAgIGhlYWRlci5jb250cm9scyA9IGAkeyB0aGlzLmlkIH0tYm9keWA7XG4gICAgICAgIGhlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIGhlYWRlci5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCAnLi9hY2NvcmRpb24tcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPEFjY29yZGlvbkhlYWRlcj47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICByZWZsZWN0QXR0cmlidXRlOiBmYWxzZVxuICAgIH0pXG4gICAgcm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBjc3MgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gY3NzYFxuZGVtby1hcHAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuXG5oZWFkZXIge1xuICBmbGV4OiAwIDAgYXV0bztcbn1cblxubWFpbiB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBwYWRkaW5nOiAxcmVtO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBvdmVyZmxvdzogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgxNXJlbSwgMWZyKSk7XG4gIGdyaWQtZ2FwOiAxcmVtO1xufVxuXG4uaWNvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWZsb3c6IHJvdyB3cmFwO1xufVxuXG4uc2V0dGluZ3MtbGlzdCB7XG4gIHBhZGRpbmc6IDA7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5zZXR0aW5ncy1saXN0IGxpIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuXG51aS1jYXJkIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbiB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWw6bm90KDpmaXJzdC1jaGlsZCkge1xuICBib3JkZXItdG9wOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBoMyB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIHAge1xuICBtYXJnaW46IDFyZW07XG59XG5gO1xuIiwiaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vYXBwJztcblxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlID0gKGVsZW1lbnQ6IEFwcCkgPT4gaHRtbGBcbiAgICA8aGVhZGVyPlxuICAgICAgICA8aDE+RXhhbXBsZXM8L2gxPlxuICAgIDwvaGVhZGVyPlxuXG4gICAgPG1haW4+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5JY29uPC9oMj5cblxuICAgICAgICAgICAgPGgzPkZvbnQgQXdlc29tZTwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jay1vcGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFpbnQtYnJ1c2gnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24tdHJpYW5nbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPlVuaWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYW5nbGUtcmlnaHQtYicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZS1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPk1hdGVyaWFsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb25fcmlnaHQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbWFpbCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2tfb3BlbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlZGl0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2RlbGV0ZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd3YXJuaW5nJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaGVscCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhY2NvdW50X2NpcmNsZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZXJzb24nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5FdmlsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYXBlcmNsaXAnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW5jaWwnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgyPkNoZWNrYm94PC9oMj5cbiAgICAgICAgICAgIDx1aS1jaGVja2JveCAuY2hlY2tlZD0keyB0cnVlIH0+PC91aS1jaGVja2JveD5cblxuICAgICAgICAgICAgPGgyPlRvZ2dsZTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1lbWFpbFwiPk5vdGlmaWNhdGlvbiBlbWFpbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LWVtYWlsXCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1zbXNcIj5Ob3RpZmljYXRpb24gc21zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktc21zXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeVwiPk5vdGlmaWNhdGlvbnM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5XCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkNhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktY2FyZD5cblxuICAgICAgICAgICAgPGgyPkFjdGlvbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1hY3Rpb24tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBzbG90PVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPk1vcmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvdWktYWN0aW9uLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5QbGFpbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1wbGFpbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLXBsYWluLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5UYWJzPC9oMj5cbiAgICAgICAgICAgIDx1aS10YWItbGlzdD5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTFcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTFcIj48c3Bhbj5GaXJzdCBUYWI8L3NwYW4+PC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0yXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0yXCI+U2Vjb25kIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItM1wiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtM1wiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+VGhpcmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi00XCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC00XCI+Rm91cnRoIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgPC91aS10YWItbGlzdD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMVwiPlxuICAgICAgICAgICAgICAgIDxoMz5GaXJzdCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0yXCI+XG4gICAgICAgICAgICAgICAgPGgzPlNlY29uZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSwgZHVvXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWUgY2V0ZXJvc1xuICAgICAgICAgICAgICAgICAgICBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW4gZXN0LCBldCBhdXRlbVxuICAgICAgICAgICAgICAgICAgICBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpIG5hbS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtM1wiPlxuICAgICAgICAgICAgICAgIDxoMz5UaGlyZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkknbSBkaXNhYmxlZCwgeW91IHNob3VsZG4ndCBzZWUgbWUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTRcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rm91cnRoIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+QWNjb3JkaW9uPC9oMj5cblxuICAgICAgICAgICAgPHVpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgaWQ9XCJjdXN0b20tcGFuZWwtaWRcIiBleHBhbmRlZCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBPbmU8L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICBMYXVkZW0gY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3Ryb1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXNhYm8gYW4gZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPkF0IHVzdSBlcGljdXJlaSBhc3NlbnRpb3IsIHB1dGVudCBkaXNzZW50aWV0IHJlcHVkaWFuZGFlIGVhIHF1by4gUHJvIG5lIGRlYml0aXMgcGxhY2VyYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25pZmVydW1xdWUsIGluIHNvbmV0IHZvbHVtdXMgaW50ZXJwcmV0YXJpcyBjdW0uIERvbG9ydW0gYXBwZXRlcmUgbmUgcXVvLiBEaWN0YSBxdWFsaXNxdWUgZW9zXG4gICAgICAgICAgICAgICAgICAgICAgICBlYSwgZWFtIGF0IG51bGxhIHRhbXF1YW0uXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBUd288L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVvIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNldGVyb3MgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuXG4gICAgICAgICAgICAgICAgICAgICAgICBlc3QsIGV0IGF1dGVtIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPlF1aSBzdWFzIHNvbGV0IGNldGVyb3MgY3UsIHBlcnRpbmF4IHZ1bHB1dGF0ZSBkZXRlcnJ1aXNzZXQgZW9zIG5lLiBOZSBpdXMgdmlkZSBudWxsYW0sIGFsaWVudW1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFlIHJlZm9ybWlkYW5zIGN1bSBhZC4gRWEgbWVsaW9yZSBzYXBpZW50ZW0gaW50ZXJwcmV0YXJpcyBlYW0uIENvbW11bmUgZGVsaWNhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHVkaWFuZGFlIGluIGVvcywgcGxhY2VyYXQgaW5jb3JydXB0ZSBkZWZpbml0aW9uZXMgbmVjIGV4LiBDdSBlbGl0ciB0YW50YXMgaW5zdHJ1Y3Rpb3Igc2l0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXUgZXVtIGFsaWEgZ3JhZWNlIG5lZ2xlZ2VudHVyLjwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICA8L3VpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgPG92ZXJsYXktZGVtbz48L292ZXJsYXktZGVtbz5cblxuICAgICAgICAgICAgPGV2ZW50LW9yZGVyLWRlbW8+PC9ldmVudC1vcmRlci1kZW1vPlxuICAgICAgICA8L2Rpdj5cblxuICAgIDwvbWFpbj5cbiAgICBgO1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbi8vIHdlIGNhbiBkZWZpbmUgbWl4aW5zIGFzXG5jb25zdCBtaXhpbkNvbnRhaW5lcjogKGJhY2tncm91bmQ/OiBzdHJpbmcpID0+IHN0cmluZyA9IChiYWNrZ3JvdW5kOiBzdHJpbmcgPSAnI2ZmZicpID0+IGNzc2BcbiAgICBiYWNrZ3JvdW5kOiAkeyBiYWNrZ3JvdW5kIH07XG4gICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG5gO1xuXG5jb25zdCBzdHlsZSA9IGNzc2Bcbjpob3N0IHtcbiAgICAtLW1heC13aWR0aDogNDBjaDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZmxvdzogY29sdW1uO1xuICAgIG1heC13aWR0aDogdmFyKC0tbWF4LXdpZHRoKTtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICAgIC8qIHdlIGNhbiBhcHBseSBtaXhpbnMgd2l0aCBzcHJlYWQgc3ludGF4ICovXG4gICAgJHsgbWl4aW5Db250YWluZXIoKSB9XG59XG46OnNsb3R0ZWQoKikge1xuICAgIG1hcmdpbjogMDtcbn1cbmA7XG5cbkBjb21wb25lbnQ8Q2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2FyZCcsXG4gICAgc3R5bGVzOiBbc3R5bGVdLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1jYXJkLWJvZHlcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtZm9vdGVyXCI+PC9zbG90PlxuICAgIDxkaXY+V29ya2VyIGNvdW50ZXI6ICR7IGNhcmQuY291bnRlciB9PC9kaXY+XG4gICAgPGJ1dHRvbj5TdG9wIHdvcmtlcjwvYnV0dG9uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyITogbnVtYmVyO1xuXG4gICAgd29ya2VyITogV29ya2VyO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJykhOyB9XG4gICAgfSlcbiAgICBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ21lc3NhZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud29ya2VyOyB9XG4gICAgfSlcbiAgICBoYW5kbGVNZXNzYWdlIChldmVudDogTWVzc2FnZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNvdW50ZXIgPSBldmVudC5kYXRhKTtcbiAgICB9XG59XG5cbkBjb21wb25lbnQ8QWN0aW9uQ2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWN0aW9uLWNhcmQnLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjdGlvbkNhcmQgZXh0ZW5kcyBDYXJkIHtcblxuICAgIC8vIHdlIGNhbiBpbmhlcml0IHN0eWxlcyBleHBsaWNpdGx5XG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAgICAgICAgJ3Nsb3RbbmFtZT11aS1hY3Rpb24tY2FyZC1hY3Rpb25zXSB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiByaWdodDsgfSdcbiAgICAgICAgXVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlQ2xpY2sgKCkgeyB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogbnVsbCB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKCkgeyB9XG59XG5cbkBjb21wb25lbnQ8UGxhaW5DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1wbGFpbi1jYXJkJyxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgbWF4LXdpZHRoOiA0MGNoO1xuICAgICAgICB9YFxuICAgIF1cbiAgICAvLyBpZiB3ZSBkb24ndCBzcGVjaWZ5IGEgdGVtcGxhdGUsIGl0IHdpbGwgYmUgaW5oZXJpdGVkXG59KVxuZXhwb3J0IGNsYXNzIFBsYWluQ2FyZCBleHRlbmRzIENhcmQgeyB9XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBjb21wb25lbnQsIENvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8Q2hlY2tib3g+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWNoZWNrYm94JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICB3aWR0aDogMXJlbTtcbiAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgIGJveC1zaXppbmc6IGNvbnRlbnQtYm94O1xuICAgICAgICB0cmFuc2l0aW9uOiAuMXMgZWFzZS1pbjtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl0pIHtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgI2JmYmZiZik7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICB9XG4gICAgLmNoZWNrLW1hcmsge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMC4yNXJlbTtcbiAgICAgICAgbGVmdDogMC4xMjVyZW07XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB3aWR0aDogMC42MjVyZW07XG4gICAgICAgIGhlaWdodDogMC4yNXJlbTtcbiAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgYm9yZGVyLXdpZHRoOiAwIDAgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSk7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC00NWRlZyk7XG4gICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICBvcGFjaXR5OiAwO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogY2hlY2tib3ggPT4gaHRtbGBcbiAgICA8c3BhbiBjbGFzcz1cImNoZWNrLW1hcmtcIj48L3NwYW4+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDaGVja2JveCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvLyBDaHJvbWUgYWxyZWFkeSByZWZsZWN0cyBhcmlhIHByb3BlcnRpZXMsIGJ1dCBGaXJlZm94IGRvZXNuJ3QsIHNvIHdlIG5lZWQgYSBwcm9wZXJ0eSBkZWNvcmF0b3JcbiAgICAvLyBob3dldmVyLCB3ZSBjYW5ub3QgaW5pdGlhbGl6ZSByb2xlIHdpdGggYSB2YWx1ZSBoZXJlLCBhcyBDaHJvbWUncyByZWZsZWN0aW9uIHdpbGwgY2F1c2UgYW5cbiAgICAvLyBhdHRyaWJ1dGUgY2hhbmdlIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgdGhhdCB3aWxsIHRocm93IGFuIGVycm9yXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3czYy9hcmlhL2lzc3Vlcy82OTFcbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHk8Q2hlY2tib3g+KHtcbiAgICAgICAgLy8gdGhlIGNvbnZlcnRlciB3aWxsIGJlIHVzZWQgdG8gcmVmbGVjdCBmcm9tIHRoZSBjaGVja2VkIGF0dHJpYnV0ZSB0byB0aGUgcHJvcGVydHksIGJ1dCBub3RcbiAgICAgICAgLy8gdGhlIG90aGVyIHdheSBhcm91bmQsIGFzIHdlIGRlZmluZSBhIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbixcbiAgICAgICAgLy8gd2UgY2FuIHVzZSBhIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gdG8gcmVmbGVjdCB0byBtdWx0aXBsZSBhdHRyaWJ1dGVzIGluIGRpZmZlcmVudCB3YXlzXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZnVuY3Rpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJycpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2tleWRvd24nXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIC8vIFRPRE86IERvY3VtZW50IHRoaXMgdXNlIGNhc2UhXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2N1c3RvbS1lbGVtZW50cy5odG1sI2N1c3RvbS1lbGVtZW50LWNvbmZvcm1hbmNlXG4gICAgICAgIC8vIEhUTUxFbGVtZW50IGhhcyBhIHNldHRlciBhbmQgZ2V0dGVyIGZvciB0YWJJbmRleCwgd2UgZG9uJ3QgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvciB0byByZWZsZWN0IGl0XG4gICAgICAgIC8vIHdlIGFyZSBub3QgYWxsb3dlZCB0byBzZXQgaXQgaW4gdGhlIGNvbnN0cnVjdG9yIHRob3VnaCwgYXMgaXQgY3JlYXRlcyBhIHJlZmxlY3RlZCBhdHRyaWJ1dGUsIHdoaWNoXG4gICAgICAgIC8vIGNhdXNlcyBhbiBlcnJvclxuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcblxuICAgICAgICAvLyB3ZSBpbml0aWFsaXplIHJvbGUgaW4gdGhlIGNvbm5lY3RlZENhbGxiYWNrIGFzIHdlbGwsIHRvIHByZXZlbnQgQ2hyb21lIGZyb20gcmVmbGVjdGluZyBlYXJseVxuICAgICAgICB0aGlzLnJvbGUgPSAnY2hlY2tib3gnO1xuICAgIH1cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgU2l6ZSB7XG4gICAgd2lkdGg6IG51bWJlciB8IHN0cmluZztcbiAgICBoZWlnaHQ6IG51bWJlciB8IHN0cmluZztcbiAgICBtYXhXaWR0aDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIG1heEhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIG1pbldpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG4gICAgbWluSGVpZ2h0OiBudW1iZXIgfCBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTaXplQ2hhbmdlZCAoc2l6ZT86IFBhcnRpYWw8U2l6ZT4sIG90aGVyPzogUGFydGlhbDxTaXplPik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHNpemUgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gc2l6ZS53aWR0aCAhPT0gb3RoZXIud2lkdGhcbiAgICAgICAgICAgIHx8IHNpemUuaGVpZ2h0ICE9PSBvdGhlci5oZWlnaHRcbiAgICAgICAgICAgIHx8IHNpemUubWF4V2lkdGggIT09IG90aGVyLm1heFdpZHRoXG4gICAgICAgICAgICB8fCBzaXplLm1heEhlaWdodCAhPT0gb3RoZXIubWF4SGVpZ2h0XG4gICAgICAgICAgICB8fCBzaXplLm1pbldpZHRoICE9PSBvdGhlci5taW5XaWR0aFxuICAgICAgICAgICAgfHwgc2l6ZS5taW5IZWlnaHQgIT09IG90aGVyLm1pbkhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2l6ZSAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBPZmZzZXQsIGhhc09mZnNldENoYW5nZWQgfSBmcm9tICcuL29mZnNldCc7XG5pbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gJy4vcG9zaXRpb24nO1xuXG5leHBvcnQgdHlwZSBBbGlnbm1lbnRPcHRpb24gPSAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJztcblxuZXhwb3J0IGludGVyZmFjZSBBbGlnbm1lbnQge1xuICAgIGhvcml6b250YWw6IEFsaWdubWVudE9wdGlvbjtcbiAgICB2ZXJ0aWNhbDogQWxpZ25tZW50T3B0aW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFsaWdubWVudFBhaXIge1xuICAgIG9yaWdpbjogQWxpZ25tZW50O1xuICAgIHRhcmdldDogQWxpZ25tZW50O1xuICAgIG9mZnNldD86IE9mZnNldDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCb3VuZGluZ0JveCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9BTElHTk1FTlRfUEFJUjogQWxpZ25tZW50UGFpciA9IHtcbiAgICBvcmlnaW46IHtcbiAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgIHZlcnRpY2FsOiAnY2VudGVyJyxcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICAgICAgdmVydGljYWw6ICdjZW50ZXInLFxuICAgIH0sXG4gICAgb2Zmc2V0OiB7XG4gICAgICAgIGhvcml6b250YWw6IDAsXG4gICAgICAgIHZlcnRpY2FsOiAwLFxuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FsaWdubWVudCAoYWxpZ25tZW50OiBhbnkpOiBhbGlnbm1lbnQgaXMgQWxpZ25tZW50IHtcblxuICAgIHJldHVybiB0eXBlb2YgKGFsaWdubWVudCBhcyBBbGlnbm1lbnQpLmhvcml6b250YWwgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAoYWxpZ25tZW50IGFzIEFsaWdubWVudCkudmVydGljYWwgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWxpZ25tZW50Q2hhbmdlZCAoYWxpZ25tZW50OiBBbGlnbm1lbnQsIG90aGVyOiBBbGlnbm1lbnQpOiBib29sZWFuIHtcblxuICAgIGlmIChhbGlnbm1lbnQgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gYWxpZ25tZW50Lmhvcml6b250YWwgIT09IG90aGVyLmhvcml6b250YWxcbiAgICAgICAgICAgIHx8IGFsaWdubWVudC52ZXJ0aWNhbCAhPT0gb3RoZXIudmVydGljYWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsaWdubWVudCAhPT0gb3RoZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZCAoYWxpZ25tZW50UGFpcj86IEFsaWdubWVudFBhaXIsIG90aGVyPzogQWxpZ25tZW50UGFpcik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKGFsaWdubWVudFBhaXIgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gaGFzQWxpZ25tZW50Q2hhbmdlZChhbGlnbm1lbnRQYWlyLnRhcmdldCwgb3RoZXIudGFyZ2V0KVxuICAgICAgICAgICAgfHwgaGFzQWxpZ25tZW50Q2hhbmdlZChhbGlnbm1lbnRQYWlyLm9yaWdpbiwgb3RoZXIub3JpZ2luKVxuICAgICAgICAgICAgfHwgaGFzT2Zmc2V0Q2hhbmdlZChhbGlnbm1lbnRQYWlyLm9mZnNldCwgb3RoZXIub2Zmc2V0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpZ25tZW50UGFpciAhPT0gb3RoZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGlnbmVkUG9zaXRpb24gKGVsZW1lbnRCb3g6IEJvdW5kaW5nQm94LCBlbGVtZW50QWxpZ25tZW50OiBBbGlnbm1lbnQpOiBQb3NpdGlvbiB7XG5cbiAgICBjb25zdCBwb3NpdGlvbjogUG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgIHN3aXRjaCAoZWxlbWVudEFsaWdubWVudC5ob3Jpem9udGFsKSB7XG5cbiAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgcG9zaXRpb24ueCA9IGVsZW1lbnRCb3gueDtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54ICsgZWxlbWVudEJveC53aWR0aCAvIDI7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgcG9zaXRpb24ueCA9IGVsZW1lbnRCb3gueCArIGVsZW1lbnRCb3gud2lkdGg7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGVsZW1lbnRBbGlnbm1lbnQudmVydGljYWwpIHtcblxuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0gZWxlbWVudEJveC55O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBlbGVtZW50Qm94LnkgKyBlbGVtZW50Qm94LmhlaWdodCAvIDI7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgcG9zaXRpb24ueSA9IGVsZW1lbnRCb3gueSArIGVsZW1lbnRCb3guaGVpZ2h0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFyZ2V0UG9zaXRpb24gKG9yaWdpbkJveDogQm91bmRpbmdCb3gsIG9yaWdpbkFsaWdubWVudDogQWxpZ25tZW50LCB0YXJnZXRCb3g6IEJvdW5kaW5nQm94LCB0YXJnZXRBbGlnbm1lbnQ6IEFsaWdubWVudCk6IFBvc2l0aW9uIHtcblxuICAgIGNvbnN0IG9yaWdpblBvc2l0aW9uID0gZ2V0QWxpZ25lZFBvc2l0aW9uKG9yaWdpbkJveCwgb3JpZ2luQWxpZ25tZW50KTtcbiAgICBjb25zdCB0YXJnZXRQb3NpdGlvbiA9IGdldEFsaWduZWRQb3NpdGlvbih7IC4uLnRhcmdldEJveCwgeDogMCwgeTogMCB9LCB0YXJnZXRBbGlnbm1lbnQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogb3JpZ2luUG9zaXRpb24ueCAtIHRhcmdldFBvc2l0aW9uLngsXG4gICAgICAgIHk6IG9yaWdpblBvc2l0aW9uLnkgLSB0YXJnZXRQb3NpdGlvbi55LFxuICAgIH1cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb24ge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OOiBQb3NpdGlvbiA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQb3NpdGlvbiAocG9zaXRpb246IGFueSk6IHBvc2l0aW9uIGlzIFBvc2l0aW9uIHtcblxuICAgIHJldHVybiB0eXBlb2YgKHBvc2l0aW9uIGFzIFBvc2l0aW9uKS54ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgKHBvc2l0aW9uIGFzIFBvc2l0aW9uKS55ICE9PSAndW5kZWZpbmVkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Bvc2l0aW9uQ2hhbmdlZCAocG9zaXRpb24/OiBQb3NpdGlvbiwgb3RoZXI/OiBQb3NpdGlvbik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHBvc2l0aW9uICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uLnggIT09IG90aGVyLnhcbiAgICAgICAgICAgIHx8IHBvc2l0aW9uLnkgIT09IG90aGVyLnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IEFsaWdubWVudFBhaXIsIERFRkFVTFRfQUxJR05NRU5UX1BBSVIsIGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkIH0gZnJvbSAnLi9hbGlnbm1lbnQnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcbmltcG9ydCB7IGhhc1NpemVDaGFuZ2VkLCBTaXplIH0gZnJvbSAnLi9zaXplJztcblxuZXhwb3J0IGNvbnN0IFZJRVdQT1JUID0gJ3ZpZXdwb3J0JztcblxuZXhwb3J0IGNvbnN0IE9SSUdJTiA9ICdvcmlnaW4nO1xuXG4vKipcbiAqIEEgUG9zaXRpb25Db25maWcgY29udGFpbnMgdGhlIHNpemUgYW5kIGFsaWdubWVudCBvZiBhbiBFbGVtZW50IGFuZCBtYXkgaW5jbHVkZSBhbiBvcmlnaW4sIHdoaWNoIHJlZmVyZW5jZXMgYW4gb3JpZ2luIEVsZW1lbnRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbmZpZyBleHRlbmRzIFNpemUge1xuICAgIHdpZHRoOiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBoZWlnaHQ6IG51bWJlciB8IHN0cmluZyB8ICdvcmlnaW4nO1xuICAgIG1heFdpZHRoOiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBtYXhIZWlnaHQ6IG51bWJlciB8IHN0cmluZyB8ICdvcmlnaW4nO1xuICAgIG1pbldpZHRoOiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBtaW5IZWlnaHQ6IG51bWJlciB8IHN0cmluZyB8ICdvcmlnaW4nO1xuICAgIG9yaWdpbjogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8ICd2aWV3cG9ydCc7XG4gICAgYWxpZ25tZW50OiBBbGlnbm1lbnRQYWlyO1xufVxuXG5leHBvcnQgY29uc3QgUE9TSVRJT05fQ09ORklHX0ZJRUxEUzogKGtleW9mIFBvc2l0aW9uQ29uZmlnKVtdID0gW1xuICAgICd3aWR0aCcsXG4gICAgJ2hlaWdodCcsXG4gICAgJ21heFdpZHRoJyxcbiAgICAnbWF4SGVpZ2h0JyxcbiAgICAnbWluV2lkdGgnLFxuICAgICdtaW5IZWlnaHQnLFxuICAgICdvcmlnaW4nLFxuICAgICdhbGlnbm1lbnQnLFxuXTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT05fQ09ORklHOiBQb3NpdGlvbkNvbmZpZyA9IHtcbiAgICB3aWR0aDogJ2F1dG8nLFxuICAgIGhlaWdodDogJ2F1dG8nLFxuICAgIG1heFdpZHRoOiAnMTAwdncnLFxuICAgIG1heEhlaWdodDogJzEwMHZoJyxcbiAgICBtaW5XaWR0aDogJ2F1dG8nLFxuICAgIG1pbkhlaWdodDogJ2F1dG8nLFxuICAgIG9yaWdpbjogJ3ZpZXdwb3J0JyxcbiAgICBhbGlnbm1lbnQ6IHsgLi4uREVGQVVMVF9BTElHTk1FTlRfUEFJUiB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGFzUG9zaXRpb25Db25maWdDaGFuZ2VkIChwb3NpdGlvbkNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+LCBvdGhlcj86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KTogYm9vbGVhbiB7XG5cbiAgICBpZiAocG9zaXRpb25Db25maWcgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gcG9zaXRpb25Db25maWcub3JpZ2luICE9PSBvdGhlci5vcmlnaW5cbiAgICAgICAgICAgIHx8IGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkKHBvc2l0aW9uQ29uZmlnLmFsaWdubWVudCwgb3RoZXIuYWxpZ25tZW50KVxuICAgICAgICAgICAgfHwgaGFzU2l6ZUNoYW5nZWQocG9zaXRpb25Db25maWcsIG90aGVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb25Db25maWcgIT09IG90aGVyO1xufVxuIiwiaW1wb3J0IHsgRXNjYXBlIH0gZnJvbSAnLi9rZXlzJztcblxuZXhwb3J0IGludGVyZmFjZSBFdmVudEJpbmRpbmcge1xuICAgIHJlYWRvbmx5IHRhcmdldDogRXZlbnRUYXJnZXQ7XG4gICAgcmVhZG9ubHkgdHlwZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbDtcbiAgICByZWFkb25seSBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFdmVudEJpbmRpbmcgKGJpbmRpbmc6IGFueSk6IGJpbmRpbmcgaXMgRXZlbnRCaW5kaW5nIHtcblxuICAgIHJldHVybiB0eXBlb2YgYmluZGluZyA9PT0gJ29iamVjdCdcbiAgICAgICAgJiYgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykudGFyZ2V0ID09PSAnb2JqZWN0J1xuICAgICAgICAmJiB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS50eXBlID09PSAnc3RyaW5nJ1xuICAgICAgICAmJiAodHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykubGlzdGVuZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIHx8IHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLmxpc3RlbmVyID09PSAnb2JqZWN0Jyk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXNjYXBlIChldmVudD86IEV2ZW50KTogYm9vbGVhbiB7XG5cbiAgICByZXR1cm4gKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpPy5rZXkgPT09IEVzY2FwZTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaGVzIGEgQ3VzdG9tRXZlbnQgb24gdGhlIHRhcmdldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbiB7XG5cbiAgICByZXR1cm4gdGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHR5cGUsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIC4uLmV2ZW50SW5pdCxcbiAgICAgICAgZGV0YWlsXG4gICAgfSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsIChldmVudDogRXZlbnQpIHtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgbWFuYWdpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgRXZlbnRNYW5hZ2VyIGNsYXNzIGNhbiBiZSB1c2VkIHRvIGhhbmRsZSBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgb24gbXVsdGlwbGUgdGFyZ2V0cy4gSXQgY2FjaGVzIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAqIGFuZCBjYW4gcmVtb3ZlIHRoZW0gc2VwYXJhdGVseSBvciBhbGwgdG9nZXRoZXIuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGV2ZW50IGxpc3RlbmVycyBuZWVkIHRvIGJlIGFkZGVkIGFuZCByZW1vdmVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIGEgY29tcG9uZW50IGFuZCBtYWtlcyBtYW51YWxseSBzYXZpbmcgcmVmZXJlbmNlcyB0byB0YXJnZXRzLCBsaXN0ZW5lcnMgYW5kIG9wdGlvbnMgdW5uZWNlc3NhcnkuXG4gKlxuICogYGBgdHNcbiAqICAvLyBjcmVhdGUgYW4gRXZlbnRNYW5hZ2VyIGluc3RhbmNlXG4gKiAgY29uc3QgbWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcbiAqXG4gKiAgLy8geW91IGNhbiBzYXZlIGEgcmVmZXJlbmNlIChhbiBFdmVudEJpbmRpbmcpIHRvIHRoZSBhZGRlZCBldmVudCBsaXN0ZW5lciBpZiB5b3UgbmVlZCB0byBtYW51YWxseSByZW1vdmUgaXQgbGF0ZXJcbiAqICBjb25zdCBiaW5kaW5nID0gbWFuYWdlci5saXN0ZW4oZG9jdW1lbnQsICdzY3JvbGwnLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8gLi4ub3IgaWdub3JlIHRoZSByZWZlcmVuY2UgaWYgeW91IGRvbid0IG5lZWQgaXRcbiAqICBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudC5ib2R5LCAnY2xpY2snLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8geW91IGNhbiByZW1vdmUgYSBzcGVjaWZpYyBldmVudCBsaXN0ZW5lciB1c2luZyBhIHJlZmVyZW5jZVxuICogIG1hbmFnZXIudW5saXN0ZW4oYmluZGluZyk7XG4gKlxuICogIC8vIC4uLm9yIHJlbW92ZSBhbGwgcHJldmlvdXNseSBhZGRlZCBldmVudCBsaXN0ZW5lcnMgaW4gb25lIGdvXG4gKiAgbWFuYWdlci51bmxpc3RlbkFsbCgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG4gICAgcHJvdGVjdGVkIGJpbmRpbmdzID0gbmV3IFNldDxFdmVudEJpbmRpbmc+KCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYW4gRXZlbnRCaW5kaW5nIGV4aXN0cyB0aGF0IG1hdGNoZXMgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICovXG4gICAgaGFzQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGhhc0JpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbjtcblxuICAgIGhhc0JpbmRpbmcgKFxuICAgICAgICB0YXJnZXRPckJpbmRpbmc6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIChpc0V2ZW50QmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA/IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nKVxuICAgICAgICAgICAgOiB0aGlzLmZpbmRCaW5kaW5nKHRhcmdldE9yQmluZGluZywgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucykpICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBmaW5kQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIGZpbmRCaW5kaW5nIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgbGV0IHNlYXJjaEJpbmRpbmc6IEV2ZW50QmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldCkgPyBiaW5kaW5nT3JUYXJnZXQgOiB0aGlzLmNyZWF0ZUJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBsZXQgZm91bmRCaW5kaW5nOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYmluZGluZ3MuaGFzKHNlYXJjaEJpbmRpbmcpKSByZXR1cm4gc2VhcmNoQmluZGluZztcblxuICAgICAgICBmb3IgKGxldCBiaW5kaW5nIG9mIHRoaXMuYmluZGluZ3MudmFsdWVzKCkpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZUJpbmRpbmdzKHNlYXJjaEJpbmRpbmcsIGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgICAgICBmb3VuZEJpbmRpbmcgPSBiaW5kaW5nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kQmluZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0IG9mIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyBhZGRlZCBvciB1bmRlZmluZWQgYSBtYXRjaGluZyBldmVudCBiaW5kaW5nIGFscmVhZHkgZXhpc3RzXG4gICAgICovXG4gICAgbGlzdGVuIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgbGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gYmluZGluZ09yVGFyZ2V0XG4gICAgICAgICAgICA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNCaW5kaW5nKGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFkZChiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lciBmcm9tIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyByZW1vdmVkIG9yIHVuZGVmaW5lZCBpZiBubyBtYXRjaGluZyBldmVudCBiaW5kaW5nIGV4aXN0c1xuICAgICAqL1xuICAgIHVubGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbik6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIHVubGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhblxuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoYmluZGluZykge1xuXG4gICAgICAgICAgICBiaW5kaW5nLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGJpbmRpbmcudHlwZSwgYmluZGluZy5saXN0ZW5lciwgYmluZGluZy5vcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5kZWxldGUoYmluZGluZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlaXIgdGFyZ2V0c1xuICAgICAqL1xuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLmJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB0aGlzLnVubGlzdGVuKGJpbmRpbmcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIGFuIEV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gICAgICovXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcblxuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ6IFBhcnRpYWw8RXZlbnRJbml0PiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGV2ZW50T3JUeXBlIGluc3RhbmNlb2YgRXZlbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50T3JUeXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnRPclR5cGUhLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICAgICAgZGV0YWlsXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdFxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byB7QGxpbmsgRXZlbnRCaW5kaW5nfSBvYmplY3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGJpbmRpbmcgb2JqZWN0cyBoYXZlIHRoZSBzYW1lIHRhcmdldCwgdHlwZSBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbXBhcmVCaW5kaW5ncyAoYmluZGluZzogRXZlbnRCaW5kaW5nLCBvdGhlcjogRXZlbnRCaW5kaW5nKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGJpbmRpbmcgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gYmluZGluZy50YXJnZXQgPT09IG90aGVyLnRhcmdldFxuICAgICAgICAgICAgJiYgYmluZGluZy50eXBlID09PSBvdGhlci50eXBlXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVMaXN0ZW5lcnMoYmluZGluZy5saXN0ZW5lciwgb3RoZXIubGlzdGVuZXIpXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVPcHRpb25zKGJpbmRpbmcub3B0aW9ucywgb3RoZXIub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUxpc3RlbmVycyAobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvdGhlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggbGlzdGVuZXJzIGJlaW5nIG51bGwsIGEgZnVuY3Rpb24gb3IgdGhlIHNhbWUgRXZlbnRMaXN0ZW5lck9iamVjdFxuICAgICAgICBpZiAobGlzdGVuZXIgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBjb21wYXJlcyB0aGUgaGFuZGxlcnMgb2YgdHdvIEV2ZW50TGlzdGVuZXJPYmplY3RzXG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChsaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudCA9PT0gKG90aGVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBldmVudCBsaXN0ZW5lciBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9wdGlvbnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZU9wdGlvbnMgKG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsIG90aGVyPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbiB7XG5cbiAgICAgICAgLy8gY2F0Y2hlcyBib3RoIG9wdGlvbnMgYmVpbmcgdW5kZWZpbmVkIG9yIHNhbWUgYm9vbGVhbiB2YWx1ZVxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHR3byBvcHRpb25zIG9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb3RoZXIgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNhcHR1cmUgPT09IG90aGVyLmNhcHR1cmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLnBhc3NpdmUgPT09IG90aGVyLnBhc3NpdmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLm9uY2UgPT09IG90aGVyLm9uY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgYW5pbWF0aW9uRnJhbWVUYXNrLCBUYXNrIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50L3Rhc2tzJztcbmltcG9ydCB7IEV2ZW50QmluZGluZywgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vZXZlbnRzJztcblxuLy8gVE9ETzogbW92ZSBOT09QIHRvIHNvbWUgdXRpbGl0eVxuY29uc3QgTk9PUDogKCkgPT4gdm9pZCA9ICgpID0+IHsgfTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJlaGF2aW9yIHtcblxuICAgIHByb3RlY3RlZCBfYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBfZWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcHJvdGVjdGVkIF91cGRhdGVUYXNrOiBUYXNrID0geyBwcm9taXNlOiBQcm9taXNlLnJlc29sdmUoKSwgY2FuY2VsOiBOT09QIH07XG5cbiAgICBwcm90ZWN0ZWQgX2V2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRydWUgaWYgdGhlIGJlaGF2aW9yJ3Mge0BsaW5rIEJlaGF2aW9yLmF0dGFjaH0gbWV0aG9kIHdhcyBjYWxsZWRcbiAgICAgKlxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIGdldCBoYXNBdHRhY2hlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBlbGVtZW50IHRoYXQgdGhlIGJlaGF2aW9yIGlzIGF0dGFjaGVkIHRvXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdlIG9ubHkgZXhwb3NlIGEgZ2V0dGVyIGZvciB0aGUgZWxlbWVudCwgc28gaXQgY2FuJ3QgYmUgc2V0IGRpcmVjdGx5LCBidXQgaGFzIHRvIGJlIHNldCB2aWFcbiAgICAgKiB0aGUgYmVoYXZpb3IncyBhdHRhY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIGdldCBlbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgdGhlIGJlaGF2aW9yIGluc3RhbmNlIHRvIGFuIEhUTUxFbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAgIEFuIG9wdGlvbmFsIEhUTUxFbGVtZW50IHRvIGF0dGFjaCB0aGUgYmVoYXZpb3IgdG9cbiAgICAgKiBAcGFyYW0gYXJncyAgICAgIE9wdGlvbmFsIGFyZ3VtYW50ZXMgd2hpY2ggY2FuIGJlIHBhc3NlZCB0byB0aGUgYXR0YWNoIG1ldGhvZFxuICAgICAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIGJlaGF2aW9yIHdhcyBzdWNjZXNzZnVsbHkgYXR0YWNoZWRcbiAgICAgKi9cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCwgLi4uYXJnczogYW55W10pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2hlcyB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogRGV0YWNoaW5nIGEgYmVoYXZpb3Igd2lsbCBjYW5jZWwgYW55IHNjaGVkdWxlZCB1cGRhdGUsIHJlbW92ZSBhbGwgYm91bmQgbGlzdGVuZXJzXG4gICAgICogYm91bmQgd2l0aCB0aGUge0BsaW5rIEJlaGF2aW9yLmxpc3Rlbn0gbWV0aG9kIGFuZCBjbGVhciB0aGUgYmVoYXZpb3IncyBlbGVtZW50XG4gICAgICogcmVmZXJlbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgIE9wdGlvbmFsIGFyZ3VtZW50cyB3aGljaCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBkZXRhY2ggbWV0aG9kXG4gICAgICovXG4gICAgZGV0YWNoICguLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuY2FuY2VsVXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy51bmxpc3RlbkFsbCgpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2Qgc2NoZWR1bGVzIGFuIHVwZGF0ZSBjYWxsIHVzaW5nIHJlcXVlc3RBbmltYXRpb25GcmFtZS4gSXQgcmV0dXJucyBhIFByb21pc2VcbiAgICAgKiB3aGljaCB3aWxsIHJlc29sdmUgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB1cGRhdGUgbWV0aG9kLCBvciByZWplY3QgaWYgYW4gZXJyb3JcbiAgICAgKiBvY2N1cnJzIGR1cmluZyB1cGRhdGUgb3IgdGhlIHVwZGF0ZSB3YXMgY2FuY2VsZWQuIElmIGFuIHVwZGF0ZSBoYXMgYmVlbiBzY2hlZHVsZWRcbiAgICAgKiBhbHJlYWR5LCBidXQgaGFzbid0IGV4ZWN1dGVkIHlldCwgdGhlIHNjaGVkdWxlZCB1cGRhdGUncyBwcm9taXNlIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIHJlcXVlc3RVcGRhdGUgKC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiAhdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRhc2sgPSBhbmltYXRpb25GcmFtZVRhc2soKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoLi4uYXJncyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVRhc2sucHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSByZXF1ZXN0ZWQgYnV0IG5vdCB5ZXQgZXhlY3V0ZWQgdXBkYXRlXG4gICAgICovXG4gICAgY2FuY2VsVXBkYXRlICgpIHtcblxuICAgICAgICB0aGlzLl91cGRhdGVUYXNrLmNhbmNlbCgpO1xuXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBzeW5jaHJvbm91c2x5LCBlLmcuIGluIHRoZSB1cGRhdGUgY3ljbGUgb2YgYSBjb21wb25lbnRcbiAgICAgKiB3aGljaCBpcyBhbHJlYWR5IHNjaGVkdWxlZCB2aWEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLiBJZiBhIGJlaGF2aW9yIHdhbnRzIHRvIHVwZGF0ZSBpdHNlbGZcbiAgICAgKiBiYXNlZCBvbiBzb21lIGV2ZW50LCBpdCBpcyByZWNvbW1lbmRlZCB0byB1c2Uge0BsaW5rIEJlaGF2aW9yLnJlcXVlc3RVcGRhdGV9IGluc3RlYWQuXG4gICAgICovXG4gICAgdXBkYXRlICguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0YWNoZWQ7XG4gICAgfVxuXG4gICAgbGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50TWFuYWdlci5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRNYW5hZ2VyLnVubGlzdGVuKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLl9ldmVudE1hbmFnZXIudW5saXN0ZW5BbGwoKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCAoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaDxUID0gYW55PiAodHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuO1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+IChldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiB0aGlzLmVsZW1lbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChldmVudE9yVHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5fZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKHRoaXMuZWxlbWVudCwgZXZlbnRPclR5cGUpXG4gICAgICAgICAgICAgICAgOiB0aGlzLl9ldmVudE1hbmFnZXIuZGlzcGF0Y2godGhpcy5lbGVtZW50LCBldmVudE9yVHlwZSEsIGRldGFpbCwgZXZlbnRJbml0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCZWhhdmlvciB9IGZyb20gJy4uL2JlaGF2aW9yL2JlaGF2aW9yJztcbmltcG9ydCB7IEJvdW5kaW5nQm94LCBnZXRUYXJnZXRQb3NpdGlvbiB9IGZyb20gJy4vYWxpZ25tZW50JztcbmltcG9ydCB7IGhhc1Bvc2l0aW9uQ2hhbmdlZCwgaXNQb3NpdGlvbiwgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcbmltcG9ydCB7IFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgaGFzU2l6ZUNoYW5nZWQsIFNpemUgfSBmcm9tICcuL3NpemUnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db250cm9sbGVyIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRQb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFNpemU6IFNpemUgfCB1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3RvciAocHJvdGVjdGVkIGNvbmZpZzogUG9zaXRpb25Db25maWcpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlcXVlc3RVcGRhdGUgKHBvc2l0aW9uPzogUG9zaXRpb24sIHNpemU/OiBTaXplKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlcXVlc3RVcGRhdGUocG9zaXRpb24sIHNpemUpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAocG9zaXRpb24/OiBQb3NpdGlvbiwgc2l6ZT86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIGNvbnN0IG5leHRTaXplID0gc2l6ZSB8fCB0aGlzLmdldFNpemUoKTtcbiAgICAgICAgbGV0IHVwZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFBvc2l0aW9uIHx8IHRoaXMuaGFzUG9zaXRpb25DaGFuZ2VkKG5leHRQb3NpdGlvbiwgdGhpcy5jdXJyZW50UG9zaXRpb24pKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2l6ZSB8fCB0aGlzLmhhc1NpemVDaGFuZ2VkKG5leHRTaXplLCB0aGlzLmN1cnJlbnRTaXplKSkge1xuXG4gICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZShuZXh0U2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaXplID0gbmV4dFNpemU7XG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogVGhlIHBvc2l0aW9uIHdpbGwgZGVwZW5kIG9uIHRoZSBhbGlnbm1lbnQgYW5kIG9yaWdpbiBvcHRpb25zIG9mIHRoZSB7QGxpbmsgUG9zaXRpb25Db25maWd9LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbkJveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3godGhpcy5jb25maWcub3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0Qm94ID0gdGhpcy5nZXRCb3VuZGluZ0JveCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgICAgIC8vIFRPRE86IGluY2x1ZGUgYWxpZ25tZW50IG9mZnNldFxuXG4gICAgICAgIHJldHVybiBnZXRUYXJnZXRQb3NpdGlvbihvcmlnaW5Cb3gsIHRoaXMuY29uZmlnLmFsaWdubWVudC5vcmlnaW4sIHRhcmdldEJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50LnRhcmdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFdlIHRha2UgdGhlIHNldHRpbmdzIGZyb20gdGhlIHtAbGluayBQb3NpdGlvbkNvbmZpZ30gc28gd2UgYXJlIGFsd2F5cyB1cC10by1kYXRlIGlmIHRoZSBjb25maWd1cmF0aW9uIHdhcyB1cGRhdGVkLlxuICAgICAqXG4gICAgICogVGhpcyBob29rIGFsc28gYWxsb3dzIHVzIHRvIGRvIHRoaW5ncyBsaWtlIG1hdGNoaW5nIHRoZSBvcmlnaW4ncyB3aWR0aCwgb3IgbG9va2luZyBhdCB0aGUgYXZhaWxhYmxlIHZpZXdwb3J0IGRpbWVuc2lvbnMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFNpemUgKCk6IFNpemUge1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbldpZHRoID0gKHRoaXMuY29uZmlnLm9yaWdpbiA9PT0gJ3ZpZXdwb3J0JylcbiAgICAgICAgICAgID8gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgICAgIDogKHRoaXMuY29uZmlnLm9yaWdpbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5jb25maWcub3JpZ2luLmNsaWVudFdpZHRoXG4gICAgICAgICAgICAgICAgOiAnYXV0byc7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luSGVpZ2h0ID0gKHRoaXMuY29uZmlnLm9yaWdpbiA9PT0gJ3ZpZXdwb3J0JylcbiAgICAgICAgICAgID8gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgICA6ICh0aGlzLmNvbmZpZy5vcmlnaW4gaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgICAgICAgICA/IHRoaXMuY29uZmlnLm9yaWdpbi5jbGllbnRIZWlnaHRcbiAgICAgICAgICAgICAgICA6ICdhdXRvJztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6ICh0aGlzLmNvbmZpZy53aWR0aCA9PT0gJ29yaWdpbicpID8gb3JpZ2luV2lkdGggOiB0aGlzLmNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogKHRoaXMuY29uZmlnLmhlaWdodCA9PT0gJ29yaWdpbicpID8gb3JpZ2luSGVpZ2h0IDogdGhpcy5jb25maWcuaGVpZ2h0LFxuICAgICAgICAgICAgbWF4V2lkdGg6ICh0aGlzLmNvbmZpZy5tYXhXaWR0aCA9PT0gJ29yaWdpbicpID8gb3JpZ2luV2lkdGggOiB0aGlzLmNvbmZpZy5tYXhXaWR0aCxcbiAgICAgICAgICAgIG1heEhlaWdodDogKHRoaXMuY29uZmlnLm1heEhlaWdodCA9PT0gJ29yaWdpbicpID8gb3JpZ2luSGVpZ2h0IDogdGhpcy5jb25maWcubWF4V2lkdGgsXG4gICAgICAgICAgICBtaW5XaWR0aDogKHRoaXMuY29uZmlnLm1pbldpZHRoID09PSAnb3JpZ2luJykgPyBvcmlnaW5XaWR0aCA6IHRoaXMuY29uZmlnLm1pbldpZHRoLFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAodGhpcy5jb25maWcubWluSGVpZ2h0ID09PSAnb3JpZ2luJykgPyBvcmlnaW5IZWlnaHQgOiB0aGlzLmNvbmZpZy5taW5IZWlnaHQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEJvdW5kaW5nQm94IChyZWZlcmVuY2U6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpOiBCb3VuZGluZ0JveCB7XG5cbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3g6IEJvdW5kaW5nQm94ID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNQb3NpdGlvbihyZWZlcmVuY2UpKSB7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnggPSByZWZlcmVuY2UueDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSByZWZlcmVuY2UueTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZSA9PT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgYm91bmRpbmdCb3guaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luUmVjdCA9IHJlZmVyZW5jZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gueCA9IG9yaWdpblJlY3QubGVmdDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSBvcmlnaW5SZWN0LnRvcDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LndpZHRoID0gb3JpZ2luUmVjdC53aWR0aDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LmhlaWdodCA9IG9yaWdpblJlY3QuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kaW5nQm94O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRvcCA9IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi55KTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlTaXplIChzaXplOiBTaXplKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS53aWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLndpZHRoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5oZWlnaHQgPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLm1heFdpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWF4V2lkdGgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLm1heEhlaWdodCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1heEhlaWdodCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubWluV2lkdGggPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5taW5XaWR0aCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubWluSGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWluSGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBtYXliZSBuYW1lIHRoaXMgYmV0dGVyLCBodWg/XG4gICAgcHJvdGVjdGVkIHBhcnNlU3R5bGUgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpID8gYCR7IHZhbHVlIHx8IDAgfXB4YCA6IHZhbHVlIHx8ICcnO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzUG9zaXRpb25DaGFuZ2VkKHBvc2l0aW9uLCBvdGhlcik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1NpemVDaGFuZ2VkIChzaXplPzogU2l6ZSwgb3RoZXI/OiBTaXplKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIGhhc1NpemVDaGFuZ2VkKHNpemUsIG90aGVyKTtcbiAgICB9XG59XG4iLCJcbmV4cG9ydCBmdW5jdGlvbiBhcHBseURlZmF1bHRzPFQ+IChjb25maWc6IFBhcnRpYWw8VD4sIGRlZmF1bHRzOiBUKTogVCB7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkZWZhdWx0cykge1xuXG4gICAgICAgIGlmIChjb25maWdba2V5XSA9PT0gdW5kZWZpbmVkKSBjb25maWdba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZyBhcyBUO1xufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuL2JlaGF2aW9yJztcbmltcG9ydCB7IGFwcGx5RGVmYXVsdHMgfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5leHBvcnQgY29uc3QgVU5ERUZJTkVEX1RZUEUgPSAodHlwZTogc3RyaW5nLCBtYXA6IHN0cmluZyA9ICdiZWhhdmlvcicpID0+IG5ldyBFcnJvcihcbiAgICBgVW5kZWZpbmVkIHR5cGUga2V5OiBObyAkeyBtYXAgfSBmb3VuZCBmb3Iga2V5ICckeyB0eXBlIH0nLlxuQWRkIGEgJ2RlZmF1bHQnIGtleSB0byB5b3VyICR7IG1hcCB9IG1hcCB0byBwcm92aWRlIGEgZmFsbGJhY2sgJHsgbWFwIH0gZm9yIHVuZGVmaW5lZCB0eXBlcy5gKTtcblxuLyoqXG4gKiBBIGJlaGF2aW9yIGNvbnN0cnVjdG9yXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGlzIHR5cGUgZW5mb3JjZXMge0BsaW5rIEJlaGF2aW9yfSBjb25zdHJ1Y3RvcnMgd2hpY2ggcmVjZWl2ZSBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGZpcnN0IHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0IHR5cGUgQmVoYXZpb3JDb25zdHJ1Y3RvcjxCIGV4dGVuZHMgQmVoYXZpb3IsIEMgPSBhbnk+ID0gbmV3IChjb25maWd1cmF0aW9uOiBDLCAuLi5hcmdzOiBhbnlbXSkgPT4gQjtcblxuZXhwb3J0IHR5cGUgQmVoYXZpb3JNYXA8QiBleHRlbmRzIEJlaGF2aW9yLCBLIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IHtcbiAgICBba2V5IGluIChLIHwgJ2RlZmF1bHQnKV06IEJlaGF2aW9yQ29uc3RydWN0b3I8Qj47XG59XG5cbmV4cG9ydCB0eXBlIENvbmZpZ3VyYXRpb25NYXA8QywgSyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSB7XG4gICAgW2tleSBpbiAoSyB8ICdkZWZhdWx0JyldOiBDO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmVoYXZpb3JGYWN0b3J5PEIgZXh0ZW5kcyBCZWhhdmlvciwgQywgSyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwcm90ZWN0ZWQgYmVoYXZpb3JzOiBCZWhhdmlvck1hcDxCLCBLPixcbiAgICAgICAgcHJvdGVjdGVkIGNvbmZpZ3VyYXRpb25zOiBDb25maWd1cmF0aW9uTWFwPEMsIEs+LFxuICAgICkgeyB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBiZWhhdmlvciBvZiB0aGUgc3BlY2lmaWVkIHR5cGUgYW5kIGNvbmZpZ3VyYXRpb25cbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIHR5cGUga2V5IGV4aXN0cyBpbiBiZWhhdmlvciBhbmQgY29uZmlndXJhdGlvbiBtYXAsXG4gICAgICogbWVyZ2VzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpZWQgdHlwZSBpbnRvIHRoZSBwcm92aWRlZFxuICAgICAqIGNvbmZpZ3VyYXRpb24gYW5kIGNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgdGhlIGNvcnJlY3QgYmVoYXZpb3Igd2l0aCB0aGUgbWVyZ2VkXG4gICAgICogY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBjcmVhdGUgKHR5cGU6IEssIGNvbmZpZzogUGFydGlhbDxDPiwgLi4uYXJnczogYW55W10pOiBCIHtcblxuICAgICAgICB0aGlzLmNoZWNrVHlwZSh0eXBlKTtcblxuICAgICAgICBjb25zdCBiZWhhdmlvciA9IHRoaXMuZ2V0QmVoYXZpb3IodHlwZSk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBhcHBseURlZmF1bHRzKGNvbmZpZywgdGhpcy5nZXRDb25maWd1cmF0aW9uKHR5cGUpKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnN0YW5jZSh0eXBlLCBiZWhhdmlvciwgY29uZmlndXJhdGlvbiwgLi4uYXJncyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5IGFueSBCZWhhdmlvckZhY3RvcnkgdG8gYWRqdXN0IHRoZSBjcmVhdGlvbiBvZiBCZWhhdmlvciBpbnN0YW5jZXMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEluc3RhbmNlICh0eXBlOiBLLCBiZWhhdmlvcjogQmVoYXZpb3JDb25zdHJ1Y3RvcjxCLCBDPiwgY29uZmlndXJhdGlvbjogQywgLi4uYXJnczogYW55W10pOiBCIHtcblxuICAgICAgICByZXR1cm4gbmV3IGJlaGF2aW9yKGNvbmZpZ3VyYXRpb24sIC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgdHlwZSBleGlzdHMgaW4gYmVoYXZpb3IgYW5kIGNvbmZpZ3VyYXRpb24gbWFwXG4gICAgICpcbiAgICAgKiBAdGhyb3dzXG4gICAgICoge0BsaW5rIFVOREVGSU5FRF9UWVBFfSBlcnJvciBpZiBuZWl0aGVyIHRoZSBzcGVjaWZpZWQgdHlwZSBub3IgYSAnZGVmYXVsdCcga2V5XG4gICAgICogZXhpc3RzIGluIHRoZSBiZWhhdmlvciBvciBjb25maWd1cmF0aW9uIG1hcC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY2hlY2tUeXBlICh0eXBlOiBLKSB7XG5cbiAgICAgICAgaWYgKCEodHlwZSBpbiB0aGlzLmJlaGF2aW9ycyB8fCAnZGVmYXVsdCcgaW4gdGhpcy5iZWhhdmlvcnMpKSB0aHJvdyBVTkRFRklORURfVFlQRSh0eXBlLCAnYmVoYXZpb3InKTtcblxuICAgICAgICBpZiAoISh0eXBlIGluIHRoaXMuY29uZmlndXJhdGlvbnMgfHwgJ2RlZmF1bHQnIGluIHRoaXMuY29uZmlndXJhdGlvbnMpKSB0aHJvdyBVTkRFRklORURfVFlQRSh0eXBlLCAnY29uZmlndXJhdGlvbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmVoYXZpb3IgY2xhc3MgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZSBrZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0QmVoYXZpb3IgKHR5cGU6IEspOiBCZWhhdmlvckNvbnN0cnVjdG9yPEI+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5iZWhhdmlvcnNbdHlwZV0gfHwgdGhpcy5iZWhhdmlvcnNbJ2RlZmF1bHQnXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpZWQgdHlwZSBrZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0Q29uZmlndXJhdGlvbiAodHlwZTogSyk6IEMge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25zW3R5cGVdIHx8IHRoaXMuY29uZmlndXJhdGlvbnNbJ2RlZmF1bHQnXTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OLCBQb3NpdGlvbiB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbi1jb250cm9sbGVyJztcblxuZXhwb3J0IGNvbnN0IENFTlRFUkVEX1BPU0lUSU9OX0NPTkZJRzogUG9zaXRpb25Db25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBQb3NpdGlvbkNvbnRyb2xsZXIge1xuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGdldFBvc2l0aW9uIG1ldGhvZCB0byBhbHdheXMgcmV0dXJuIHRoZSB7QGxpbmsgREVGQVVMVF9QT1NJVElPTn1cbiAgICAgKlxuICAgICAqIFdlIGFjdHVhbGx5IGRvbid0IGNhcmUgYWJvdXQgdGhlIHBvc2l0aW9uLCBiZWNhdXNlIHdlIGFyZSBnb2luZyB0byB1c2Ugdmlld3BvcnQgcmVsYXRpdmVcbiAgICAgKiBDU1MgdW5pdHMgdG8gcG9zaXRpb24gdGhlIGVsZW1lbnQuIEFmdGVyIHRoZSBmaXJzdCBjYWxjdWxhdGlvbiBvZiB0aGUgcG9zaXRpb24sIGl0J3NcbiAgICAgKiBuZXZlciBnb2luZyB0byBjaGFuZ2UgYW5kIGFwcGx5UG9zaXRpb24gd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlLiBUaGlzIG1ha2VzIHRoaXNcbiAgICAgKiBwb3NpdGlvbiBjb250cm9sbGVyIHJlYWxseSBjaGVhcC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UG9zaXRpb24gKCk6IFBvc2l0aW9uIHtcblxuICAgICAgICByZXR1cm4gREVGQVVMVF9QT1NJVElPTjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSBvdmVycmlkZSB0aGUgYXBwbHlQb3NpdGlvbiBtZXRob2QgdG8gY2VudGVyIHRoZSBlbGVtZW50IHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydFxuICAgICAqIGRpbWVuc2lvbnMgYW5kIGl0cyBvd24gc2l6ZS4gVGhpcyBzdHlsZSBoYXMgdG8gYmUgYXBwbGllZCBvbmx5IG9uY2UgYW5kIGlzIHJlc3BvbnNpdmVcbiAgICAgKiBieSBkZWZhdWx0LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRvcCA9ICc1MHZoJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gJzUwdncnO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKC01MCUsIC01MCUpYDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbi1jb250cm9sbGVyJztcblxuZXhwb3J0IGNvbnN0IENPTk5FQ1RFRF9QT1NJVElPTl9DT05GSUc6IFBvc2l0aW9uQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIG1pbldpZHRoOiAnb3JpZ2luJyxcbiAgICBtaW5IZWlnaHQ6ICdvcmlnaW4nLFxuICAgIGFsaWdubWVudDoge1xuICAgICAgICBvcmlnaW46IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2VuZCdcbiAgICAgICAgfSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICAgICAgdmVydGljYWw6ICdzdGFydCdcbiAgICAgICAgfSxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICAgICAgdmVydGljYWw6IDAsXG4gICAgICAgIH0sXG4gICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIENvbm5lY3RlZFBvc2l0aW9uQ29udHJvbGxlciBleHRlbmRzIFBvc2l0aW9uQ29udHJvbGxlciB7XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCFzdXBlci5hdHRhY2goZWxlbWVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih3aW5kb3csICdyZXNpemUnLCAoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubGlzdGVuKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCksIHRydWUpO1xuXG4gICAgICAgIC8vIFRPRE86IGFkZCBjb250ZW5kLWNoYW5nZWQgZXZlbnQgdG8gb3ZlcmxheSB2aWEgTXV0YXRpb25PYnNlcnZlclxuICAgICAgICAvLyBhbmQgdXBkYXRlIHBvc2l0aW9uIHdoZW4gY29udGVudCBjaGFuZ2VzXG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kLCBzbyB3ZSBjYW4gdXNlIGEgQ1NTIHRyYW5zZm9ybSB0byBwb3NpdGlvbiB0aGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FuIHJlc3VsdCBpbiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICovXG4gICAgLy8gcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgLy8gICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgLy8gICAgIHRoaXMuZWxlbWVudCEuc3R5bGUudG9wID0gJyc7XG4gICAgLy8gICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubGVmdCA9ICcnO1xuICAgIC8vICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgLy8gICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAvLyAgICAgLy8gdGhpcy5lbGVtZW50IS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi54KSB9LCAkeyB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueSkgfSlgO1xuICAgIC8vIH1cbn1cbiIsImltcG9ydCB7IEJlaGF2aW9yRmFjdG9yeSwgQmVoYXZpb3JNYXAsIENvbmZpZ3VyYXRpb25NYXAgfSBmcm9tICcuLi9iZWhhdmlvci9iZWhhdmlvci1mYWN0b3J5JztcbmltcG9ydCB7IENlbnRlcmVkUG9zaXRpb25Db250cm9sbGVyLCBDRU5URVJFRF9QT1NJVElPTl9DT05GSUcgfSBmcm9tICcuL2NvbnRyb2xsZXIvY2VudGVyZWQtcG9zaXRpb24tY29udHJvbGxlcic7XG5pbXBvcnQgeyBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIsIENPTk5FQ1RFRF9QT1NJVElPTl9DT05GSUcgfSBmcm9tICcuL2NvbnRyb2xsZXIvY29ubmVjdGVkLXBvc2l0aW9uLWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb25Db250cm9sbGVyIH0gZnJvbSAnLi9wb3NpdGlvbi1jb250cm9sbGVyJztcblxuZXhwb3J0IHR5cGUgUG9zaXRpb25UeXBlcyA9ICdkZWZhdWx0JyB8ICdjZW50ZXJlZCcgfCAnY29ubmVjdGVkJztcblxuZXhwb3J0IGNvbnN0IFBPU0lUSU9OX0NPTlRST0xMRVJTOiBCZWhhdmlvck1hcDxQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uVHlwZXM+ID0ge1xuICAgIGRlZmF1bHQ6IFBvc2l0aW9uQ29udHJvbGxlcixcbiAgICBjZW50ZXJlZDogQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIsXG4gICAgY29ubmVjdGVkOiBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIsXG59XG5cbmV4cG9ydCBjb25zdCBQT1NJVElPTl9DT05GSUdVUkFUSU9OUzogQ29uZmlndXJhdGlvbk1hcDxQb3NpdGlvbkNvbmZpZywgUG9zaXRpb25UeXBlcz4gPSB7XG4gICAgZGVmYXVsdDogREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG4gICAgY2VudGVyZWQ6IENFTlRFUkVEX1BPU0lUSU9OX0NPTkZJRyxcbiAgICBjb25uZWN0ZWQ6IENPTk5FQ1RFRF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSBleHRlbmRzIEJlaGF2aW9yRmFjdG9yeTxQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uQ29uZmlnLCBQb3NpdGlvblR5cGVzPiB7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBiZWhhdmlvcnMgPSBQT1NJVElPTl9DT05UUk9MTEVSUyxcbiAgICAgICAgcHJvdGVjdGVkIGNvbmZpZ3VyYXRpb25zID0gUE9TSVRJT05fQ09ORklHVVJBVElPTlMsXG4gICAgKSB7XG5cbiAgICAgICAgc3VwZXIoYmVoYXZpb3JzLCBjb25maWd1cmF0aW9ucyk7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBBIENTUyBzZWxlY3RvciBzdHJpbmdcbiAqXG4gKiBAc2VlXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX1NlbGVjdG9yc1xuICovXG5leHBvcnQgdHlwZSBDU1NTZWxlY3RvciA9IHN0cmluZztcblxuLyoqXG4gKiBJbnNlcnQgYSBOb2RlIGFmdGVyIGEgcmVmZXJlbmNlIE5vZGVcbiAqXG4gKiBAcGFyYW0gbmV3Q2hpbGQgLSBUaGUgTm9kZSB0byBpbnNlcnRcbiAqIEBwYXJhbSByZWZDaGlsZCAtIFRoZSByZWZlcmVuY2UgTm9kZSBhZnRlciB3aGljaCB0byBpbnNlcnRcbiAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCBOb2RlXG4gKi9cbmV4cG9ydCBjb25zdCBpbnNlcnRBZnRlciA9IDxUIGV4dGVuZHMgTm9kZT4gKG5ld0NoaWxkOiBULCByZWZDaGlsZDogTm9kZSk6IFQgfCB1bmRlZmluZWQgPT4ge1xuXG4gICAgcmV0dXJuIHJlZkNoaWxkLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShuZXdDaGlsZCwgcmVmQ2hpbGQubmV4dFNpYmxpbmcpO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlIGEgcmVmZXJlbmNlIE5vZGUgd2l0aCBhIG5ldyBOb2RlXG4gKlxuICogQHBhcmFtIG5ld0NoaWxkIC0gVGhlIE5vZGUgdG8gaW5zZXJ0XG4gKiBAcGFyYW0gcmVmQ2hpbGQgLSBUaGUgcmVmZXJlbmNlIE5vZGUgdG8gcmVwbGFjZVxuICogQHJldHVybnMgVGhlIHJlcGxhY2VkIHJlZmVyZW5jZSBOb2RlXG4gKi9cbmV4cG9ydCBjb25zdCByZXBsYWNlV2l0aCA9IDxUIGV4dGVuZHMgTm9kZSwgVSBleHRlbmRzIE5vZGU+IChuZXdDaGlsZDogVCwgcmVmQ2hpbGQ6IFUpOiBVIHwgdW5kZWZpbmVkID0+IHtcblxuICAgIHJldHVybiByZWZDaGlsZC5wYXJlbnROb2RlPy5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIHJlZkNoaWxkKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWxlbWVudFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogR2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50LCBidXQgcGllcmNlcyBzaGFkb3cgcm9vdHMgdG8gZmluZCB0aGUgYWN0aXZlIGVsZW1lbnRcbiAqIGFsc28gd2l0aGluIGEgY3VzdG9tIGVsZW1lbnQgd2hpY2ggaGFzIGEgc2hhZG93IHJvb3QuXG4gKi9cbmV4cG9ydCBjb25zdCBhY3RpdmVFbGVtZW50ID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcblxuICAgIGxldCBzaGFkb3dSb290OiBEb2N1bWVudE9yU2hhZG93Um9vdCB8IG51bGwgPSBkb2N1bWVudDtcbiAgICBsZXQgYWN0aXZlRWxlbWVudDogRWxlbWVudCA9IHNoYWRvd1Jvb3QuYWN0aXZlRWxlbWVudCA/PyBkb2N1bWVudC5ib2R5O1xuXG4gICAgd2hpbGUgKHNoYWRvd1Jvb3QgJiYgc2hhZG93Um9vdC5hY3RpdmVFbGVtZW50KSB7XG5cbiAgICAgICAgYWN0aXZlRWxlbWVudCA9IHNoYWRvd1Jvb3QuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgc2hhZG93Um9vdCA9IGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdDtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbn1cbiIsImV4cG9ydCBjbGFzcyBJREdlbmVyYXRvciB7XG5cbiAgICBwcml2YXRlIF9uZXh0ID0gMDtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHByZWZpeCAtIEFuIG9wdGlvbmFsIHByZWZpeCBmb3IgdGhlIGdlbmVyYXRlZCBJRCBpbmNsdWRpbmcgYW4gb3B0aW9uYWwgc2VwYXJhdG9yLCBlLmcuOiBgJ215LXByZWZpeC0nIG9yICdwcmVmaXgtLScgb3IgJ3ByZWZpeF8nIG9yICdwcmVmaXhgXG4gICAgICogQHBhcmFtIHN1ZmZpeCAtIEFuIG9wdGlvbmFsIHN1ZmZpeCBmb3IgdGhlIGdlbmVyYXRlZCBJRCBpbmNsdWRpbmcgYW4gb3B0aW9uYWwgc2VwYXJhdG9yLCBlLmcuOiBgJy1teS1zdWZmaXgnIG9yICctLXN1ZmZpeCcgb3IgJ19zdWZmaXgnIG9yICdzdWZmaXhgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyBwcmVmaXg6IHN0cmluZyA9ICcnLCBwdWJsaWMgc3VmZml4OiBzdHJpbmcgPSAnJykgeyB9XG5cbiAgICBnZXROZXh0SUQgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgcmV0dXJuIGAkeyB0aGlzLnByZWZpeCB9JHsgdGhpcy5fbmV4dCsrIH0keyB0aGlzLnN1ZmZpeCB9YDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIHByb3BlcnR5LCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIGNvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBDb25zdHJ1Y3RvciB9IGZyb20gJy4vY29uc3RydWN0b3InO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhhc1JvbGUge1xuICAgIHJvbGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1peGluUm9sZTxUIGV4dGVuZHMgdHlwZW9mIENvbXBvbmVudD4gKEJhc2U6IFQsIHJvbGU6IHN0cmluZyA9ICcnKTogVCAmIENvbnN0cnVjdG9yPEhhc1JvbGU+IHtcblxuICAgIEBjb21wb25lbnQoeyBkZWZpbmU6IGZhbHNlIH0pXG4gICAgY2xhc3MgQmFzZUhhc1JvbGUgZXh0ZW5kcyBCYXNlIGltcGxlbWVudHMgSGFzUm9sZSB7XG5cbiAgICAgICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcgfSlcbiAgICAgICAgcm9sZSE6IHN0cmluZztcblxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgICAgIHRoaXMucm9sZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdyb2xlJykgfHwgcm9sZTtcblxuICAgICAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gQmFzZUhhc1JvbGU7XG59XG4iLCJpbXBvcnQgeyBjcmVhdGVFdmVudE5hbWUgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzQ2hhbmdlRXZlbnREZXRhaWwge1xuICAgIGhhc0ZvY3VzOiBib29sZWFuO1xuICAgIHRhcmdldDogSFRNTEVsZW1lbnQ7XG4gICAgcmVsYXRlZFRhcmdldD86IEhUTUxFbGVtZW50O1xufVxuXG5leHBvcnQgY29uc3QgRk9DVVNfQ0hBTkdFX0VWRU5UX0lOSVQ6IEV2ZW50SW5pdCA9IHtcbiAgICBidWJibGVzOiB0cnVlLFxuICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgY29tcG9zZWQ6IHRydWUsXG59O1xuXG4vKipcbiAqIFRoZSBGb2N1c0NoYW5nZUV2ZW50XG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSBGb2N1c0NoYW5nZUV2ZW50IGlzIGRpc3BhdGNoZWQgYnkgdGhlIHtAbGluayBGb2N1c01vbml0b3J9ICphZnRlciogdGhlIGZvY3VzIHN0YXRlIG9mIHRoZVxuICogbW9uaXRvcmVkIGVsZW1lbnQgaGFzIGNoYW5nZWQuIFRoaXMgbWVhbnMsIGNhbGxpbmcge0BsaW5rIGFjdGl2ZUVsZW1lbnR9IGluIGFuIGV2ZW50IGhhbmRsZXJcbiAqIGF0dGFjaGVkIHRvIHRoaXMgZXZlbnQgd2lsbCByZXR1cm4gdGhlIGFjdGl2ZSBlbGVtZW50IGFmdGVyIHRoZSBmb2N1cyBjaGFuZ2UuIFRoaXMgaXMgZGlmZmVyZW50XG4gKiB0byBmb2N1c2luL2ZvY3Vzb3V0LiBBZGRpdGlvbmFsbHksIEZvY3VzQ2hhbmdlRXZlbnQgaXMgb25seSB0cmlnZ2VyZWQsIHdoZW4gdGhlIGZvY3VzIG1vdmVzIGludG9cbiAqIHRoZSBtb25pdG9yZWQgZWxlbWVudCBvciBvdXQgb2YgdGhlIG1vbml0b3JlZCBlbGVtZW50LCBidXQgbm90IHdoZW4gdGhlIGZvY3VzIG1vdmVzIHdpdGhpbiB0aGVcbiAqIG1vbml0b3JlZCBlbGVtZW50LiBGb2N1c0NoYW5nZUV2ZW50IGJ1YmJsZXMgdXAgdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvY3VzQ2hhbmdlRXZlbnQgZXh0ZW5kcyBDdXN0b21FdmVudDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPiB7XG5cbiAgICBjb25zdHJ1Y3RvciAoZGV0YWlsOiBGb2N1c0NoYW5nZUV2ZW50RGV0YWlsLCBpbml0OiBFdmVudEluaXQgPSB7fSkge1xuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBjcmVhdGVFdmVudE5hbWUoJ2ZvY3VzJywgJycsICdjaGFuZ2VkJyk7XG5cbiAgICAgICAgY29uc3QgZXZlbnRJbml0OiBDdXN0b21FdmVudEluaXQ8Rm9jdXNDaGFuZ2VFdmVudERldGFpbD4gPSB7XG4gICAgICAgICAgICAuLi5GT0NVU19DSEFOR0VfRVZFTlRfSU5JVCxcbiAgICAgICAgICAgIC4uLmluaXQsXG4gICAgICAgICAgICBkZXRhaWwsXG4gICAgICAgIH07XG5cbiAgICAgICAgc3VwZXIodHlwZSwgZXZlbnRJbml0KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBtYWNyb1Rhc2sgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQvdGFza3MnO1xuaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuLi9iZWhhdmlvci9iZWhhdmlvcic7XG5pbXBvcnQgeyBhY3RpdmVFbGVtZW50IH0gZnJvbSAnLi4vZG9tJztcbmltcG9ydCB7IGNhbmNlbCB9IGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgeyBGb2N1c0NoYW5nZUV2ZW50IH0gZnJvbSAnLi9mb2N1cy1jaGFuZ2UtZXZlbnQnO1xuXG4vKipcbiAqIFRoZSBGb2N1c01vbml0b3IgYmVoYXZpb3JcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIEZvY3VzTW9uaXRvciBiZWhhdmlvciBjYW4gYmUgYXR0YWNoZWQgdG8gYW4gZWxlbWVudCB0byBtb25pdG9yIHRoZSBmb2N1cyBzdGF0ZVxuICogb2YgdGhlIGVsZW1lbnQgYW5kIGl0cyBkZXNjZW5kYW50cy4gSXQgZGlzcGF0Y2hlcyBhIHtAbGluayBGb2N1c0NoYW5nZUV2ZW50fSBpZlxuICogdGhlIGZvY3VzIGlzIG1vdmVkIGludG8gdGhlIGVsZW1lbnQgKG9yIG9uZSBvZiBpdHMgZGVzY2VuZGFudHMpIG9yIGlmIHRoZSBmb2N1c1xuICogbW92ZXMgb3V0LlxuICovXG5leHBvcnQgY2xhc3MgRm9jdXNNb25pdG9yIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgLyoqXG4gICAgICogVGhlIHByZXZpb3VzIGZvY3VzIHN0YXRlICh3aGVuIHRoZSBsYXN0IEZvY3VzQ2hhbmdlRXZlbnQgd2FzIGRpc3BhdGNoZWQpXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhhZEZvY3VzPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IGZvY3VzIHN0YXRlXG4gICAgICovXG4gICAgaGFzRm9jdXMgPSBmYWxzZTtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgZm9jdXNcbiAgICAgICAgdGhpcy5oYXNGb2N1cyA9IHRoaXMuZWxlbWVudCEuY29udGFpbnMoYWN0aXZlRWxlbWVudCgpKTtcblxuICAgICAgICAvLyBhdHRhY2ggZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2ZvY3VzaW4nLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzSW4oZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXNvdXQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzT3V0KGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNJbiAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5oYXNGb2N1cyA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIHNjaGVkdWxlIHRvIGRpc3BhdGNoIGEgZm9jdXMtY2hhbmdlZCBldmVudCBpbiB0aGUgbmV4dCBtYWNyby10YXNrIHRvIG1ha2VcbiAgICAgICAgICAgIC8vIHN1cmUgaXQgaXMgZGlzcGF0Y2hlZCBhZnRlciB0aGUgZm9jdXMgaGFzIG1vdmVkXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIGNoZWNrIHRoYXQgZm9jdXMgc3RhdGUgaGFzbid0IGNoYW5nZWQgdW50aWwgdGhlIG1hY3JvLXRhc2tcbiAgICAgICAgICAgIG1hY3JvVGFzaygoKSA9PiB0aGlzLmhhc0ZvY3VzICYmIHRoaXMubm90aWZ5Rm9jdXNDaGFuZ2UoZXZlbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3AgdGhlIG9yaWdpbmFsIGZvY3VzaW4gZXZlbnQgZnJvbSBidWJibGluZyB1cCB0aGUgRE9NIGFuZCBlbmRpbmcgdXAgaW4gYSBwYXJlbnRcbiAgICAgICAgLy8gY29tcG9uZW50J3MgZm9jdXMgbW9uaXRvclxuICAgICAgICBjYW5jZWwoZXZlbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c091dCAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNGb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLmhhc0ZvY3VzID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIHNjaGVkdWxlIHRvIGRpc3BhdGNoIGEgZm9jdXMtY2hhbmdlZCBldmVudCBpbiB0aGUgbmV4dCBtYWNyby10YXNrIHRvIG1ha2VcbiAgICAgICAgICAgIC8vIHN1cmUgaXQgaXMgZGlzcGF0Y2hlZCBhZnRlciB0aGUgZm9jdXMgaGFzIG1vdmVkXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIGNoZWNrIHRoYXQgZm9jdXMgc3RhdGUgaGFzbid0IGNoYW5nZWQgdW50aWwgdGhlIG1hY3JvLXRhc2tcbiAgICAgICAgICAgIG1hY3JvVGFzaygoKSA9PiAhdGhpcy5oYXNGb2N1cyAmJiB0aGlzLm5vdGlmeUZvY3VzQ2hhbmdlKGV2ZW50KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9wIHRoZSBvcmlnaW5hbCBmb2N1c291dCBldmVudCBmcm9tIGJ1YmJsaW5nIHVwIHRoZSBET00gYW5kIGVuZGluZyB1cCBpbiBhIHBhcmVudFxuICAgICAgICAvLyBjb21wb25lbnQncyBmb2N1cyBtb25pdG9yXG4gICAgICAgIGNhbmNlbChldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG5vdGlmeUZvY3VzQ2hhbmdlIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIC8vIHdlIG9ubHkgbmVlZCB0byBkaXNwYXRjaCBhbiBldmVudCBpZiBvdXIgY3VycmVudCBmb2N1cyBzdGF0ZSBpcyBkaWZmZXJlbnRcbiAgICAgICAgLy8gdGhhbiB0aGUgbGFzdCB0aW1lIHdlIGRpc3BhdGNoZWQgYW4gZXZlbnQgLSB0aGlzIGZpbHRlcnMgb3V0IGNhc2VzIHdoZXJlXG4gICAgICAgIC8vIHdlIGhhdmUgYSBjb25zZWN1dGl2ZSBmb2N1c291dC9mb2N1c2luIGV2ZW50IHdoZW4gdGhlIGZvY3VzIG1vdmVzIHdpdGhpblxuICAgICAgICAvLyB0aGUgbW9uaXRvcmVkIGVsZW1lbnQgKHdlIGRvbid0IHdhbnQgdG8gbm90aWZ5IGlmIGZvY3VzIGNoYW5nZXMgd2l0aGluKVxuICAgICAgICBpZiAodGhpcy5oYXNGb2N1cyAhPT0gdGhpcy5oYWRGb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLmhhZEZvY3VzID0gdGhpcy5oYXNGb2N1cztcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaChuZXcgRm9jdXNDaGFuZ2VFdmVudCh7XG4gICAgICAgICAgICAgICAgaGFzRm9jdXM6IHRoaXMuaGFzRm9jdXMsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLmVsZW1lbnQgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogZXZlbnQucmVsYXRlZFRhcmdldCBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENTU1NlbGVjdG9yIH0gZnJvbSAnLi4vZG9tJztcbmltcG9ydCB7IFRhYiB9IGZyb20gJy4uL2tleXMnO1xuaW1wb3J0IHsgRm9jdXNNb25pdG9yIH0gZnJvbSAnLi9mb2N1cy1tb25pdG9yJztcbmltcG9ydCB7IGFwcGx5RGVmYXVsdHMgfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG4vKipcbiAqIEEgQ1NTIHNlbGVjdG9yIGZvciBtYXRjaGluZyBlbGVtZW50cyB3aGljaCBhcmUgbm90IGRpc2FibGVkIG9yIHJlbW92ZWQgZnJvbSB0aGUgdGFiIG9yZGVyXG4gKlxuICogQHByaXZhdGVcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBJTlRFUkFDVElWRSA9ICc6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknO1xuXG4vKipcbiAqIEFuIGFycmF5IG9mIENTUyBzZWxlY3RvcnMgdG8gbWF0Y2ggZ2VuZXJhbGx5IHRhYmJhYmxlIGVsZW1lbnRzXG4gKlxuICogQHByaXZhdGVcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBFTEVNRU5UUyA9IFtcbiAgICAnYVtocmVmXScsXG4gICAgJ2FyZWFbaHJlZl0nLFxuICAgICdidXR0b24nLFxuICAgICdpbnB1dCcsXG4gICAgJ3NlbGVjdCcsXG4gICAgJ3RleHRhcmVhJyxcbiAgICAnaWZyYW1lJyxcbiAgICAnW2NvbnRlbnRFZGl0YWJsZV0nLFxuICAgICdbdGFiaW5kZXhdJyxcbl07XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgQ1NTIHNlbGVjdG9ycyB0byBtYXRjaCBpbnRlcmFjdGl2ZSwgdGFiYmFibGUgZWxlbWVudHNcbiAqL1xuZXhwb3J0IGNvbnN0IFRBQkJBQkxFUyA9IEVMRU1FTlRTLm1hcChFTEVNRU5UID0+IGAkeyBFTEVNRU5UIH0keyBJTlRFUkFDVElWRSB9YCk7XG5cbi8qKlxuICogVGhlIHtAbGluayBGb2N1c1RyYXB9IGNvbmZpZ3VyYXRpb24gaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRm9jdXNUcmFwQ29uZmlnIHtcbiAgICB0YWJiYWJsZVNlbGVjdG9yOiBDU1NTZWxlY3RvcjtcbiAgICB3cmFwRm9jdXM6IGJvb2xlYW47XG4gICAgYXV0b0ZvY3VzOiBib29sZWFuO1xuICAgIHJlc3RvcmVGb2N1czogYm9vbGVhbjtcbiAgICBpbml0aWFsRm9jdXM/OiBDU1NTZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgRm9jdXNUcmFwfSBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHOiBGb2N1c1RyYXBDb25maWcgPSB7XG4gICAgdGFiYmFibGVTZWxlY3RvcjogVEFCQkFCTEVTLmpvaW4oJywnKSxcbiAgICB3cmFwRm9jdXM6IHRydWUsXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxuICAgIHJlc3RvcmVGb2N1czogdHJ1ZSxcbn07XG5cbi8qKlxuICogQW4gYXJyYXkgb2Yge0BsaW5rIEZvY3VzVHJhcENvbmZpZ30gcHJvcGVydHkgbmFtZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEZPQ1VTX1RSQVBfQ09ORklHX0ZJRUxEUzogKGtleW9mIEZvY3VzVHJhcENvbmZpZylbXSA9IFtcbiAgICAnYXV0b0ZvY3VzJyxcbiAgICAnd3JhcEZvY3VzJyxcbiAgICAnaW5pdGlhbEZvY3VzJyxcbiAgICAncmVzdG9yZUZvY3VzJyxcbiAgICAndGFiYmFibGVTZWxlY3RvcicsXG5dO1xuXG4vKipcbiAqIFRoZSBGb2N1c1RyYXAgYmVoYXZpb3JcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIEZvY3VzVHJhcCBiZWhhdmlvciBleHRlbmRzIHRoZSB7QGxpbmsgRm9jdXNNb25pdG9yfSBiZWhhdmlvciBhbmQgYWRkcyBhZGRpdGlvbmFsXG4gKiBmdW5jdGlvbmFsaXR5IHRvIGl0LCBsaWtlIHRyYXBwaW5nIHRoZSBmb2N1cyBpbiB0aGUgbW9uaXRvcmVkIGVsZW1lbnQsIGF1dG8gd3JhcHBpbmdcbiAqIHRoZSBmb2N1cyBvcmRlciwgYXMgd2VsbCBhcyBhdXRvLWZvY3VzIGFuZCByZXN0b3JlLWZvY3VzLiBUaGUgYmVoYXZpb3Igb2YgdGhlXG4gKiBGb2N1c1RyYXAgY2FuIGJlIGRlZmluZWQgdGhyb3VnaCBhIHtAbGluayBGb2N1c1RyYXBDb25maWd9LlxuICovXG5leHBvcnQgY2xhc3MgRm9jdXNUcmFwIGV4dGVuZHMgRm9jdXNNb25pdG9yIHtcblxuICAgIHByb3RlY3RlZCB0YWJiYWJsZXMhOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PjtcblxuICAgIHByb3RlY3RlZCBzdGFydCE6IEhUTUxFbGVtZW50O1xuXG4gICAgcHJvdGVjdGVkIGVuZCE6IEhUTUxFbGVtZW50O1xuXG4gICAgcHJvdGVjdGVkIGNvbmZpZzogRm9jdXNUcmFwQ29uZmlnO1xuXG4gICAgY29uc3RydWN0b3IgKGNvbmZpZz86IFBhcnRpYWw8Rm9jdXNUcmFwQ29uZmlnPikge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWcgPSBhcHBseURlZmF1bHRzKGNvbmZpZyB8fCB7fSwgREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRyk7XG4gICAgfVxuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAna2V5ZG93bicsICgoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHRoaXMuaGFuZGxlS2V5RG93bihldmVudCkpIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvRm9jdXMpIHRoaXMuZm9jdXNJbml0aWFsKCk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZm9jdXNJbml0aWFsICgpIHtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuaW5pdGlhbEZvY3VzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxGb2N1cyA9IHRoaXMuZWxlbWVudCEucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5jb25maWcuaW5pdGlhbEZvY3VzKTtcblxuICAgICAgICAgICAgaWYgKGluaXRpYWxGb2N1cykge1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbEZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb2N1c1RyYXAgY291bGQgbm90IGZpbmQgaW5pdGlhbEZvY3VzIGVsZW1lbnQgc2VsZWN0b3IgJHsgdGhpcy5jb25maWcuaW5pdGlhbEZvY3VzIH0uIFBvc3NpYmxlIGVycm9yIGluIEZvY3VzVHJhcENvbmZpZy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9jdXNGaXJzdCgpO1xuICAgIH1cblxuICAgIGZvY3VzRmlyc3QgKCkge1xuXG4gICAgICAgIHRoaXMuc3RhcnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBmb2N1c0xhc3QgKCkge1xuXG4gICAgICAgIHRoaXMuZW5kLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLnRhYmJhYmxlcyA9IHRoaXMuZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbCh0aGlzLmNvbmZpZy50YWJiYWJsZVNlbGVjdG9yKTtcblxuICAgICAgICBjb25zdCBsZW5ndGggPSB0aGlzLnRhYmJhYmxlcy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IGxlbmd0aFxuICAgICAgICAgICAgPyB0aGlzLnRhYmJhYmxlcy5pdGVtKDApXG4gICAgICAgICAgICA6IHRoaXMuZWxlbWVudCE7XG5cbiAgICAgICAgdGhpcy5lbmQgPSBsZW5ndGhcbiAgICAgICAgICAgID8gdGhpcy50YWJiYWJsZXMuaXRlbShsZW5ndGggLSAxKVxuICAgICAgICAgICAgOiB0aGlzLmVsZW1lbnQhO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgVGFiOlxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5zdGFydCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLndyYXBGb2N1cykgdGhpcy5mb2N1c0xhc3QoKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5lbmQpIHtcblxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy53cmFwRm9jdXMpIHRoaXMuZm9jdXNGaXJzdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRm9jdXNUcmFwQ29uZmlnLCBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLCBGT0NVU19UUkFQX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuLi8uLi9mb2N1cyc7XG5cbmV4cG9ydCB0eXBlIE92ZXJsYXlUcmlnZ2VyQ29uZmlnID0gRm9jdXNUcmFwQ29uZmlnICYge1xuICAgIHRyYXBGb2N1czogYm9vbGVhbjtcbiAgICBjbG9zZU9uRXNjYXBlOiBib29sZWFuO1xuICAgIGNsb3NlT25Gb2N1c0xvc3M6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHOiBPdmVybGF5VHJpZ2dlckNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLFxuICAgIGF1dG9Gb2N1czogdHJ1ZSxcbiAgICB0cmFwRm9jdXM6IHRydWUsXG4gICAgcmVzdG9yZUZvY3VzOiB0cnVlLFxuICAgIGNsb3NlT25Fc2NhcGU6IHRydWUsXG4gICAgY2xvc2VPbkZvY3VzTG9zczogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjb25zdCBPVkVSTEFZX1RSSUdHRVJfQ09ORklHX0ZJRUxEUzogKGtleW9mIE92ZXJsYXlUcmlnZ2VyQ29uZmlnKVtdID0gW1xuICAgIC4uLkZPQ1VTX1RSQVBfQ09ORklHX0ZJRUxEUyxcbiAgICAndHJhcEZvY3VzJyxcbiAgICAnY2xvc2VPbkVzY2FwZScsXG4gICAgJ2Nsb3NlT25Gb2N1c0xvc3MnLFxuXTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbmZpZywgUE9TSVRJT05fQ09ORklHX0ZJRUxEUyB9IGZyb20gJy4uL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXJDb25maWcsIE9WRVJMQVlfVFJJR0dFUl9DT05GSUdfRklFTERTIH0gZnJvbSAnLi90cmlnZ2VyL292ZXJsYXktdHJpZ2dlci1jb25maWcnO1xuXG5leHBvcnQgdHlwZSBPdmVybGF5Q29uZmlnID0gUG9zaXRpb25Db25maWcgJiBPdmVybGF5VHJpZ2dlckNvbmZpZyAmIHtcbiAgICBwb3NpdGlvblR5cGU6IHN0cmluZztcbiAgICB0cmlnZ2VyVHlwZTogc3RyaW5nO1xuICAgIHRyaWdnZXI/OiBIVE1MRWxlbWVudDtcbiAgICBzdGFja2VkOiBib29sZWFuO1xuICAgIHRlbXBsYXRlPzogVGVtcGxhdGVGdW5jdGlvbjtcbiAgICBjb250ZXh0PzogQ29tcG9uZW50O1xuICAgIGJhY2tkcm9wOiBib29sZWFuO1xuICAgIGNsb3NlT25CYWNrZHJvcENsaWNrOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgT1ZFUkxBWV9DT05GSUdfRklFTERTOiAoa2V5b2YgT3ZlcmxheUNvbmZpZylbXSA9IFtcbiAgICAuLi5QT1NJVElPTl9DT05GSUdfRklFTERTLFxuICAgIC4uLk9WRVJMQVlfVFJJR0dFUl9DT05GSUdfRklFTERTLFxuICAgICdwb3NpdGlvblR5cGUnLFxuICAgICd0cmlnZ2VyJyxcbiAgICAndHJpZ2dlclR5cGUnLFxuICAgICdzdGFja2VkJyxcbiAgICAndGVtcGxhdGUnLFxuICAgICdjb250ZXh0JyxcbiAgICAnYmFja2Ryb3AnLFxuICAgICdjbG9zZU9uQmFja2Ryb3BDbGljaycsXG5dO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX0NPTkZJRzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHtcbiAgICBwb3NpdGlvblR5cGU6ICdkZWZhdWx0JyxcbiAgICB0cmlnZ2VyVHlwZTogJ2RlZmF1bHQnLFxuICAgIHRyaWdnZXI6IHVuZGVmaW5lZCxcbiAgICBzdGFja2VkOiB0cnVlLFxuICAgIHRlbXBsYXRlOiB1bmRlZmluZWQsXG4gICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgIGJhY2tkcm9wOiB0cnVlLFxuICAgIGNsb3NlT25CYWNrZHJvcENsaWNrOiB0cnVlLFxufTtcbiIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgbWFjcm9UYXNrIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50L3Rhc2tzJztcbmltcG9ydCB7IEJlaGF2aW9yIH0gZnJvbSAnLi4vLi4vYmVoYXZpb3IvYmVoYXZpb3InO1xuaW1wb3J0IHsgYWN0aXZlRWxlbWVudCB9IGZyb20gJy4uLy4uL2RvbSc7XG5pbXBvcnQgeyBGb2N1c0NoYW5nZUV2ZW50LCBGb2N1c01vbml0b3IsIEZvY3VzVHJhcCB9IGZyb20gJy4uLy4uL2ZvY3VzJztcbmltcG9ydCB7IEVzY2FwZSB9IGZyb20gJy4uLy4uL2tleXMnO1xuaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4uL292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXJDb25maWcgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlci1jb25maWcnO1xuaW1wb3J0IHsgY2FuY2VsIH0gZnJvbSAnZXhhbXBsZS9zcmMvZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIHByZXZpb3VzRm9jdXM6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblxuICAgIHByb3RlY3RlZCBmb2N1c0JlaGF2aW9yPzogRm9jdXNNb25pdG9yO1xuXG4gICAgY29uc3RydWN0b3IgKHByb3RlY3RlZCBjb25maWc6IE92ZXJsYXlUcmlnZ2VyQ29uZmlnLCBwdWJsaWMgb3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5mb2N1c0JlaGF2aW9yID0gdGhpcy5jb25maWcudHJhcEZvY3VzXG4gICAgICAgICAgICA/IG5ldyBGb2N1c1RyYXAodGhpcy5jb25maWcpXG4gICAgICAgICAgICA6IG5ldyBGb2N1c01vbml0b3IoKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnb3Blbi1jaGFuZ2VkJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVPcGVuQ2hhbmdlKGV2ZW50IGFzIFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnZm9jdXMtY2hhbmdlZCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNDaGFuZ2UoZXZlbnQgYXMgRm9jdXNDaGFuZ2VFdmVudCkpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2tleWRvd24nLCBldmVudCA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG9wZW4gKCkge1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5vcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjbG9zZSAoKSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0b2dnbGUgKG9wZW4/OiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSBvcGVuID8/ICF0aGlzLm92ZXJsYXkub3BlbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZSAoZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pIHtcblxuICAgICAgICAvLyBpZiBpdCdzIGFuIGV2ZW50IGJ1YmJsaW5nIHVwIGZyb20gYSBuZXN0ZWQgb3ZlcmxheSwgaWdub3JlIGl0XG4gICAgICAgIGlmIChldmVudC5kZXRhaWwudGFyZ2V0ICE9PSB0aGlzLm92ZXJsYXkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBvcGVuID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQ7XG5cbiAgICAgICAgaWYgKG9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5zdG9yZUZvY3VzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNCZWhhdmlvcj8uYXR0YWNoKHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c0JlaGF2aW9yPy5kZXRhY2goKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0NoYW5nZSAoZXZlbnQ6IEZvY3VzQ2hhbmdlRXZlbnQpIHtcblxuICAgICAgICAvLyB0aGlzIG92ZXJsYXkgdHJpZ2dlciBvbmx5IGhhbmRsZXMgRm9jdXNDaGFuZ2VFdmVudHMgd2hpY2ggd2VyZSBkaXNwYXRjaGVkIG9uIGl0cyBvd24gb3ZlcmxheVxuICAgICAgICAvLyBpZiB0aGUgZXZlbnQncyB0YXJnZXQgaXMgbm90IHRoaXMgdHJpZ2dlcidzIG92ZXJsYXksIHRoZW4gdGhlIGV2ZW50IGlzIGJ1YmJsaW5nIGZyb20gYSBuZXN0ZWQgb3ZlcmxheVxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSB0aGlzLm92ZXJsYXkpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheVRyaWdnZXIuaGFuZGxlRm9jdXNDaGFuZ2UoKS4uLiAlcywgJXMsIGJ1YmJsaW5nOiAlcycsIHRoaXMub3ZlcmxheS5pZCwgZXZlbnQuZGV0YWlsLmhhc0ZvY3VzLCBldmVudC50YXJnZXQgIT09IHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIGhhbmRsZSBmb2N1cyBsb3NzXG4gICAgICAgIGlmIChldmVudC5kZXRhaWwuaGFzRm9jdXMpIHJldHVybjtcblxuICAgICAgICAvLyB0aGUgRm9jdXNDaGFuZ2VFdmVudCBpcyBkaXNwYXRjaGVkIGFmdGVyIHRoZSBmb2N1cyBoYXMgY2hhbmdlZCwgc28gd2UgY2FuIGNoZWNrIGlmIG91ciBvdmVybGF5IGlzXG4gICAgICAgIC8vIHN0aWxsIGFjdGl2ZSAtIHRoZSBmb2N1cyBtaWdodCBoYXZlIG1vdmVkIHRvIGEgbmVzdGVkIG92ZXJsYXkgKGhpZ2hlciBpbiB0aGUgc3RhY2spXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXkuc3RhdGljLmlzT3ZlcmxheUFjdGl2ZSh0aGlzLm92ZXJsYXkpKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWYgdGhpcyB0cmlnZ2VyJ3Mgb3ZlcmxheSBpcyBubyBsb25nZXIgYWN0aXZlIHdlIGNhbiBjbG9zZSBpdFxuXG4gICAgICAgIC8vIHdlIGhhdmUgdG8gZ2V0IHRoZSBwYXJlbnQgYmVmb3JlIGNsb3NpbmcgdGhlIG92ZXJsYXkgLSB3aGVuIG92ZXJsYXkgaXMgY2xvc2VkLCBpdCBkb2Vzbid0IGhhdmUgYSBwYXJlbnRcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5vdmVybGF5LnN0YXRpYy5nZXRQYXJlbnRPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmNsb3NlT25Gb2N1c0xvc3MpIHtcblxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIHBhcmVudCBvdmVybGF5LCB3ZSBsZXQgdGhlIHBhcmVudCBrbm93IHRoYXQgb3VyIG92ZXJsYXkgaGFzIGxvc3QgZm9jdXMgYnkgZGlzcGF0Y2hpbmcgdGhlXG4gICAgICAgIC8vIEZvY3VzQ2hhbmdlRXZlbnQgb24gdGhlIHBhcmVudCBvdmVybGF5IHRvIGJlIGhhbmRsZWQgb3IgaWdub3JlZCBieSB0aGUgcGFyZW50J3MgT3ZlcmxheVRyaWdnZXJcbiAgICAgICAgbWFjcm9UYXNrKCgpID0+IHBhcmVudD8uZGlzcGF0Y2hFdmVudChldmVudCkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgRXNjYXBlOlxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXkub3BlbiB8fCAhdGhpcy5jb25maWcuY2xvc2VPbkVzY2FwZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgY2FuY2VsKGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5yZXN0b3JlRm9jdXMpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLm92ZXJsYXksICdvcGVuLWNoYW5nZWQnLCAoKSA9PiB0aGlzLnJlc3RvcmVGb2N1cygpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc3RvcmVGb2N1cyAoKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLnN0b3JlRm9jdXMoKS4uLicsIHRoaXMucHJldmlvdXNGb2N1cyk7XG5cbiAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzID0gYWN0aXZlRWxlbWVudCgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCByZXN0b3JlRm9jdXMgKCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5VHJpZ2dlci5yZXN0b3JlRm9jdXMoKS4uLicsIHRoaXMucHJldmlvdXNGb2N1cyk7XG5cbiAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzLmZvY3VzKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUHJvcGVydHlDaGFuZ2VFdmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi8uLi9rZXlzJztcbmltcG9ydCB7IE92ZXJsYXlUcmlnZ2VyIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXInO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLCBPdmVybGF5VHJpZ2dlckNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS10cmlnZ2VyLWNvbmZpZyc7XG5pbXBvcnQgeyBjYW5jZWwgfSBmcm9tICdleGFtcGxlL3NyYy9ldmVudHMnO1xuXG5leHBvcnQgY29uc3QgRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUc6IE92ZXJsYXlUcmlnZ2VyQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfT1ZFUkxBWV9UUklHR0VSX0NPTkZJR1xufTtcblxuZXhwb3J0IGNsYXNzIERpYWxvZ092ZXJsYXlUcmlnZ2VyIGV4dGVuZHMgT3ZlcmxheVRyaWdnZXIge1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIC8vIHdlIGVuZm9yY2UgdGhlIGVsZW1lbnQgYnkgb25seSBhdHRhY2hpbmcsIGlmIGl0IGlzIHByb3ZpZGVkXG4gICAgICAgIGlmICghZWxlbWVudCB8fCAhc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCAnZGlhbG9nJyk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2NsaWNrJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVDbGljayhldmVudCBhcyBNb3VzZUV2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdrZXlkb3duJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVLZXlkb3duKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGRldGFjaCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnKTtcblxuICAgICAgICByZXR1cm4gc3VwZXIuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRoaXMub3ZlcmxheS5vcGVuID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU9wZW5DaGFuZ2UgKGV2ZW50OiBQcm9wZXJ0eUNoYW5nZUV2ZW50PGJvb2xlYW4+KSB7XG5cbiAgICAgICAgc3VwZXIuaGFuZGxlT3BlbkNoYW5nZShldmVudCk7XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlQ2xpY2sgKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEVudGVyOlxuICAgICAgICAgICAgY2FzZSBTcGFjZTpcblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBldmVudHMgdGhhdCBoYXBwZW4gb24gdGhlIHRyaWdnZXIgZWxlbWVudFxuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcblxuICAgICAgICAgICAgICAgIHN1cGVyLmhhbmRsZUtleWRvd24oZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcblxuZXhwb3J0IGNvbnN0IFRPT0xUSVBfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRzogT3ZlcmxheVRyaWdnZXJDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxuICAgIHRyYXBGb2N1czogZmFsc2UsXG4gICAgYXV0b0ZvY3VzOiBmYWxzZSxcbiAgICByZXN0b3JlRm9jdXM6IGZhbHNlLFxufTtcblxuZXhwb3J0IGNsYXNzIFRvb2x0aXBPdmVybGF5VHJpZ2dlciBleHRlbmRzIE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICAvLyB3ZSBlbmZvcmNlIHRoZSBlbGVtZW50IGJ5IG9ubHkgYXR0YWNoaW5nLCBpZiBpdCBpcyBwcm92aWRlZFxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5yb2xlID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGhpcy5vdmVybGF5LmlkKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VlbnRlcicsICgpID0+IHRoaXMub3BlbigpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ21vdXNlbGVhdmUnLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXMnLCAoKSA9PiB0aGlzLm9wZW4oKSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdibHVyJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpO1xuXG4gICAgICAgIHJldHVybiBzdXBlci5kZXRhY2goKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCZWhhdmlvckZhY3RvcnksIEJlaGF2aW9yTWFwLCBDb25maWd1cmF0aW9uTWFwIH0gZnJvbSAnZXhhbXBsZS9zcmMvYmVoYXZpb3IvYmVoYXZpb3ItZmFjdG9yeSc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi4vb3ZlcmxheSc7XG5pbXBvcnQgeyBEaWFsb2dPdmVybGF5VHJpZ2dlciwgRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcgfSBmcm9tICcuL2RpYWxvZy1vdmVybGF5LXRyaWdnZXInO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcbmltcG9ydCB7IFRvb2x0aXBPdmVybGF5VHJpZ2dlciwgVE9PTFRJUF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHIH0gZnJvbSAnLi90b29sdGlwLW92ZXJsYXktdHJpZ2dlcic7XG5cbmV4cG9ydCB0eXBlIE92ZXJsYXlUcmlnZ2VyVHlwZXMgPSAnZGVmYXVsdCcgfCAnZGlhbG9nJyB8ICd0b29sdGlwJztcblxuZXhwb3J0IGNvbnN0IE9WRVJMQVlfVFJJR0dFUlM6IEJlaGF2aW9yTWFwPE92ZXJsYXlUcmlnZ2VyLCBPdmVybGF5VHJpZ2dlclR5cGVzPiA9IHtcbiAgICBkZWZhdWx0OiBPdmVybGF5VHJpZ2dlcixcbiAgICBkaWFsb2c6IERpYWxvZ092ZXJsYXlUcmlnZ2VyLFxuICAgIHRvb2x0aXA6IFRvb2x0aXBPdmVybGF5VHJpZ2dlcixcbn07XG5cbmV4cG9ydCBjb25zdCBPVkVSTEFZX1RSSUdHRVJfQ09ORklHUzogQ29uZmlndXJhdGlvbk1hcDxPdmVybGF5VHJpZ2dlckNvbmZpZywgT3ZlcmxheVRyaWdnZXJUeXBlcz4gPSB7XG4gICAgZGVmYXVsdDogREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxuICAgIGRpYWxvZzogRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsXG4gICAgdG9vbHRpcDogVE9PTFRJUF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxufTtcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSBleHRlbmRzIEJlaGF2aW9yRmFjdG9yeTxPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJDb25maWcsIE92ZXJsYXlUcmlnZ2VyVHlwZXM+IHtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHJvdGVjdGVkIGJlaGF2aW9ycyA9IE9WRVJMQVlfVFJJR0dFUlMsXG4gICAgICAgIHByb3RlY3RlZCBjb25maWd1cmF0aW9ucyA9IE9WRVJMQVlfVFJJR0dFUl9DT05GSUdTLFxuICAgICkge1xuXG4gICAgICAgIHN1cGVyKGJlaGF2aW9ycywgY29uZmlndXJhdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSB7QGxpbmsgY3JlYXRlfSBtZXRob2QgdG8gZW5mb3JjZSB0aGUgb3ZlcmxheSBwYXJhbWV0ZXJcbiAgICAgKi9cbiAgICBjcmVhdGUgKFxuICAgICAgICB0eXBlOiBPdmVybGF5VHJpZ2dlclR5cGVzLFxuICAgICAgICBjb25maWc6IFBhcnRpYWw8T3ZlcmxheVRyaWdnZXJDb25maWc+LFxuICAgICAgICBvdmVybGF5OiBPdmVybGF5LFxuICAgICAgICAuLi5hcmdzOiBhbnlbXVxuICAgICk6IE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgICAgICByZXR1cm4gc3VwZXIuY3JlYXRlKHR5cGUsIGNvbmZpZywgb3ZlcmxheSwgLi4uYXJncyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSwgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvck9iamVjdCwgUHJvcGVydHlDaGFuZ2VFdmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQmVoYXZpb3JGYWN0b3J5IH0gZnJvbSAnLi4vYmVoYXZpb3IvYmVoYXZpb3ItZmFjdG9yeSc7XG5pbXBvcnQgeyByZXBsYWNlV2l0aCwgYWN0aXZlRWxlbWVudCB9IGZyb20gJy4uL2RvbSc7XG5pbXBvcnQgeyBFdmVudE1hbmFnZXIgfSBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0IHsgSURHZW5lcmF0b3IgfSBmcm9tICcuLi9pZC1nZW5lcmF0b3InO1xuaW1wb3J0IHsgTWl4aW5Sb2xlIH0gZnJvbSAnLi4vbWl4aW5zL3JvbGUnO1xuaW1wb3J0IHsgUG9zaXRpb24sIFBvc2l0aW9uQ29uZmlnLCBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5IH0gZnJvbSAnLi4vcG9zaXRpb24vcG9zaXRpb24tY29udHJvbGxlci1mYWN0b3J5JztcbmltcG9ydCB7IERFRkFVTFRfT1ZFUkxBWV9DT05GSUcsIE92ZXJsYXlDb25maWcgfSBmcm9tICcuL292ZXJsYXktY29uZmlnJztcbmltcG9ydCB7IE92ZXJsYXlUcmlnZ2VyLCBPdmVybGF5VHJpZ2dlckNvbmZpZywgT3ZlcmxheVRyaWdnZXJGYWN0b3J5IH0gZnJvbSAnLi90cmlnZ2VyJztcblxuY29uc3QgQUxSRUFEWV9JTklUSUFMSVpFRF9FUlJPUiA9ICgpID0+IG5ldyBFcnJvcignQ2Fubm90IGluaXRpYWxpemUgT3ZlcmxheS4gT3ZlcmxheSBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkLicpO1xuXG5jb25zdCBBTFJFQURZX1JFR0lTVEVSRURfRVJST1IgPSAob3ZlcmxheTogT3ZlcmxheSkgPT4gbmV3IEVycm9yKGBPdmVybGF5IGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZDogJHsgb3ZlcmxheS5pZCB9LmApO1xuXG5jb25zdCBOT1RfUkVHSVNURVJFRF9FUlJPUiA9IChvdmVybGF5OiBPdmVybGF5KSA9PiBuZXcgRXJyb3IoYE92ZXJsYXkgaXMgbm90IHJlZ2lzdGVyZWQ6ICR7IG92ZXJsYXkuaWQgfS5gKTtcblxuY29uc3QgVEhST1dfVU5SRUdJU1RFUkVEX09WRVJMQVkgPSAob3ZlcmxheTogT3ZlcmxheSkgPT4ge1xuXG4gICAgaWYgKCEob3ZlcmxheS5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgT3ZlcmxheSkuaXNPdmVybGF5UmVnaXN0ZXJlZChvdmVybGF5KSkge1xuXG4gICAgICAgIHRocm93IE5PVF9SRUdJU1RFUkVEX0VSUk9SKG92ZXJsYXkpO1xuICAgIH1cbn1cblxuY29uc3QgSURfR0VORVJBVE9SID0gbmV3IElER2VuZXJhdG9yKCdwYXJ0a2l0LW92ZXJsYXktJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheUluaXQge1xuICAgIG92ZXJsYXlUcmlnZ2VyRmFjdG9yeTogQmVoYXZpb3JGYWN0b3J5PE92ZXJsYXlUcmlnZ2VyLCBPdmVybGF5VHJpZ2dlckNvbmZpZz47XG4gICAgcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeTogQmVoYXZpb3JGYWN0b3J5PFBvc2l0aW9uQ29udHJvbGxlciwgUG9zaXRpb25Db25maWc+O1xuICAgIG92ZXJsYXlSb290PzogSFRNTEVsZW1lbnQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheVNldHRpbmdzIHtcbiAgICAvLyBUT0RPOiBjaGVjayBpZiB3ZSBuZWVkIHRvIHN0b3JlIGNvbmZpZy4uLlxuICAgIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPjtcbiAgICBldmVudHM6IEV2ZW50TWFuYWdlcjtcbiAgICBwb3NpdGlvbkNvbnRyb2xsZXI/OiBQb3NpdGlvbkNvbnRyb2xsZXI7XG4gICAgb3ZlcmxheVRyaWdnZXI/OiBPdmVybGF5VHJpZ2dlcjtcbn1cblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS1vdmVybGF5JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IDJweCBzb2xpZCAjYmZiZmJmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWhpZGRlbj10cnVlXSkge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGBcbiAgICA8c2xvdD48L3Nsb3Q+XG4gICAgYCxcbn0pXG5leHBvcnQgY2xhc3MgT3ZlcmxheSBleHRlbmRzIE1peGluUm9sZShDb21wb25lbnQsICdkaWFsb2cnKSB7XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9vdmVybGF5VHJpZ2dlckZhY3Rvcnk6IEJlaGF2aW9yRmFjdG9yeTxPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJDb25maWc+ID0gbmV3IE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSgpO1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3Bvc2l0aW9uQ29udHJvbGxlckZhY3Rvcnk6IEJlaGF2aW9yRmFjdG9yeTxQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uQ29uZmlnPiA9IG5ldyBQb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5KCk7XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfb3ZlcmxheVJvb3Q/OiBIVE1MRWxlbWVudDtcblxuICAgIHByb3RlY3RlZCBzdGF0aWMgcmVnaXN0ZXJlZE92ZXJsYXlzID0gbmV3IE1hcDxPdmVybGF5LCBPdmVybGF5U2V0dGluZ3M+KCk7XG5cbiAgICBwcm90ZWN0ZWQgc3RhdGljIGFjdGl2ZU92ZXJsYXlzID0gbmV3IFNldDxPdmVybGF5PigpO1xuXG4gICAgc3RhdGljIGdldCBvdmVybGF5VHJpZ2dlckZhY3RvcnkgKCk6IEJlaGF2aW9yRmFjdG9yeTxPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJDb25maWc+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVRyaWdnZXJGYWN0b3J5O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSAoKTogQmVoYXZpb3JGYWN0b3J5PFBvc2l0aW9uQ29udHJvbGxlciwgUG9zaXRpb25Db25maWc+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IG92ZXJsYXlSb290ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSb290O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgaXNJbml0aWFsaXplZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxpemVkO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbml0aWFsaXplIChjb25maWc6IFBhcnRpYWw8T3ZlcmxheUluaXQ+KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkgdGhyb3cgQUxSRUFEWV9JTklUSUFMSVpFRF9FUlJPUigpO1xuXG4gICAgICAgIHRoaXMuX292ZXJsYXlUcmlnZ2VyRmFjdG9yeSA9IGNvbmZpZy5vdmVybGF5VHJpZ2dlckZhY3RvcnkgfHwgdGhpcy5fb3ZlcmxheVRyaWdnZXJGYWN0b3J5O1xuICAgICAgICB0aGlzLl9wb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5ID0gY29uZmlnLnBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkgfHwgdGhpcy5fcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeTtcbiAgICAgICAgdGhpcy5fb3ZlcmxheVJvb3QgPSBjb25maWcub3ZlcmxheVJvb3QgfHwgdGhpcy5fb3ZlcmxheVJvb3Q7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHN0YXRpYyBpc092ZXJsYXlSZWdpc3RlcmVkIChvdmVybGF5OiBPdmVybGF5KTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmhhcyhvdmVybGF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEFuIG92ZXJsYXkgaXMgY29uc2lkZXJlZCBmb2N1c2VkLCBpZiBlaXRoZXIgaXRzZWxmIG9yIGFueSBvZiBpdHMgZGVzY2VuZGFudCBub2RlcyBoYXMgZm9jdXMuXG4gICAgKi9cbiAgICBzdGF0aWMgaXNPdmVybGF5Rm9jdXNlZCAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIFRIUk9XX1VOUkVHSVNURVJFRF9PVkVSTEFZKG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiBvdmVybGF5LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gb3ZlcmxheSBpcyBjb25zaWRlcmVkIGFjdGl2ZSBpZiBpdCBpcyBlaXRoZXIgZm9jdXNlZCBvciBoYXMgYSBkZXNjZW5kYW50IG92ZXJsYXkgd2hpY2ggaXMgZm9jdXNlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNPdmVybGF5QWN0aXZlIChvdmVybGF5OiBPdmVybGF5KTogYm9vbGVhbiB7XG5cbiAgICAgICAgVEhST1dfVU5SRUdJU1RFUkVEX09WRVJMQVkob3ZlcmxheSk7XG5cbiAgICAgICAgbGV0IGlzRm91bmQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGlzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKG92ZXJsYXkuY29uZmlnLnN0YWNrZWQgJiYgb3ZlcmxheS5vcGVuKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGN1cnJlbnQgb2YgdGhpcy5hY3RpdmVPdmVybGF5cykge1xuXG4gICAgICAgICAgICAgICAgaXNGb3VuZCA9IGlzRm91bmQgfHwgY3VycmVudCA9PT0gb3ZlcmxheTtcblxuICAgICAgICAgICAgICAgIGlzQWN0aXZlID0gaXNGb3VuZCAmJiB0aGlzLmlzT3ZlcmxheUZvY3VzZWQoY3VycmVudCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNBY3RpdmUpIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2lzT3ZlcmxheUFjdGl2ZSgpOiAnLCBvdmVybGF5LmlkLCBpc0FjdGl2ZSk7XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcGFyZW50IG92ZXJsYXkgb2YgYW4gYWN0aXZlIG92ZXJsYXlcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIElmIGFuIG92ZXJsYXkgaXMgc3RhY2tlZCwgaXRzIHBhcmVudCBvdmVybGF5IGlzIHRoZSBvbmUgZnJvbSB3aGljaCBpdCB3YXMgb3BlbmVkLlxuICAgICAqIFRoaXMgcGFyZW50IG92ZXJsYXkgd2lsbCBiZSBpbiB0aGUgYWN0aXZlT3ZlcmxheXMgc3RhY2sganVzdCBiZWZvcmUgdGhpcyBvbmUuXG4gICAgICovXG4gICAgc3RhdGljIGdldFBhcmVudE92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXkpOiBPdmVybGF5IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBUSFJPV19VTlJFR0lTVEVSRURfT1ZFUkxBWShvdmVybGF5KTtcblxuICAgICAgICBpZiAob3ZlcmxheS5jb25maWcuc3RhY2tlZCAmJiBvdmVybGF5Lm9wZW4pIHtcblxuICAgICAgICAgICAgLy8gd2Ugc3RhcnQgd2l0aCBwYXJlbnQgYmVpbmcgdW5kZWZpbmVkXG4gICAgICAgICAgICAvLyBpZiB0aGUgZmlyc3QgYWN0aXZlIG92ZXJsYXkgaW4gdGhlIHNldCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgb3ZlcmxheVxuICAgICAgICAgICAgLy8gdGhlbiBpbmRlZWQgdGhlIG92ZXJsYXkgaGFzIG5vIHBhcmVudCAodGhlIGZpcnN0IGFjdGl2ZSBvdmVybGF5IGlzIHRoZSByb290KVxuICAgICAgICAgICAgbGV0IHBhcmVudDogT3ZlcmxheSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCB0aGUgYWN0aXZlIG92ZXJsYXlzXG4gICAgICAgICAgICBmb3IgKGxldCBjdXJyZW50IG9mIHRoaXMuYWN0aXZlT3ZlcmxheXMpIHtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGhhdmUgcmVhY2hlZCB0aGUgc3BlY2lmaWVkIGFjdGl2ZSBvdmVybGF5XG4gICAgICAgICAgICAgICAgLy8gd2UgY2FuIHJldHVybiB0aGUgcGFyZW50IG9mIHRoYXQgb3ZlcmxheSAoaXQncyB0aGUgYWN0aXZlIG92ZXJsYXkgaW4gdGhlIHNldCBqdXN0IGJlZm9yZSB0aGlzIG9uZSlcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gb3ZlcmxheSkgcmV0dXJuIHBhcmVudDtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGhhdmVuJ3QgZm91bmQgdGhlIHNwZWNpZmllZCBvdmVybGF5IHlldCwgd2Ugc2V0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgb3ZlcmxheSBhcyBwb3RlbnRpYWwgcGFyZW50IGFuZCBtb3ZlIG9uXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gY3VycmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICogQ3JlYXRlIGEgbmV3IG92ZXJsYXlcbiAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVPdmVybGF5IChjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pOiBPdmVybGF5IHtcblxuICAgICAgICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChPdmVybGF5LnNlbGVjdG9yKSBhcyBPdmVybGF5O1xuXG4gICAgICAgIG92ZXJsYXkuY29uZmlnID0geyAuLi5ERUZBVUxUX09WRVJMQVlfQ09ORklHLCAuLi5jb25maWcgfSBhcyBPdmVybGF5Q29uZmlnO1xuXG4gICAgICAgIHJldHVybiBvdmVybGF5O1xuICAgIH1cblxuICAgIHN0YXRpYyBkaXNwb3NlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIG92ZXJsYXkucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG92ZXJsYXkncyBjb25maWd1cmF0aW9uXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluaXRpYWxseSBfY29uZmlnIG9ubHkgY29udGFpbnMgYSBwYXJ0aWFsIE92ZXJsYXlDb25maWcsIGJ1dCBvbmNlIHRoZSBvdmVybGF5IGluc3RhbmNlIGhhcyBiZWVuXG4gICAgICogcmVnaXN0ZXJlZCwgX2NvbmZpZyB3aWxsIGJlIGEgZnVsbCBPdmVybGF5Q29uZmlnLiBUaGlzIGlzIHRvIGFsbG93IHRoZSBCZWhhdmlvckZhY3RvcmllcyBmb3JcbiAgICAgKiBwb3NpdGlvbiBhbmQgdHJpZ2dlciB0byBhcHBseSB0aGVpciBkZWZhdWx0IGNvbmZpZ3VyYXRpb24sIGJhc2VkIG9uIHRoZSBiZWhhdmlvciB0eXBlIHdoaWNoIGlzXG4gICAgICogY3JlYXRlZCBieSB0aGUgZmFjdG9yaWVzLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogKi9cbiAgICBwcm90ZWN0ZWQgX2NvbmZpZzogT3ZlcmxheUNvbmZpZyA9IHsgLi4uREVGQVVMVF9PVkVSTEFZX0NPTkZJRyB9IGFzIE92ZXJsYXlDb25maWc7XG5cbiAgICBwcm90ZWN0ZWQgX29wZW4gPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBtYXJrZXIhOiBDb21tZW50O1xuXG4gICAgcHJvdGVjdGVkIGlzUmVhdHRhY2hpbmcgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyIH0pXG4gICAgdGFiaW5kZXggPSAtMTtcblxuICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiB9KVxuICAgIHNldCBvcGVuICh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICAvLyBpZiBvcGVuIGhhcyBjaGFuZ2VkIHdlIHVwZGF0ZSB0aGUgYWN0aXZlIG92ZXJsYXkgc3RhY2sgc3luY2hyb25vdXNseVxuICAgICAgICBpZiAodGhpcy5fb3BlbiAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX29wZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhY2sodmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBvcGVuICgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wZW47XG4gICAgfVxuXG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlLFxuICAgICAgICBvYnNlcnZlOiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yT2JqZWN0LFxuICAgIH0pXG4gICAgc2V0IGNvbmZpZyAodmFsdWU6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pIHtcbiAgICAgICAgdGhpcy5fY29uZmlnID0geyAuLi50aGlzLl9jb25maWcsIC4uLnZhbHVlIH07XG4gICAgfVxuICAgIGdldCBjb25maWcgKCk6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgIH1cblxuXG4gICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgIHNldCBvcmlnaW4gKHZhbHVlOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgJ3ZpZXdwb3J0Jykge1xuICAgICAgICB0aGlzLl9jb25maWcub3JpZ2luID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCBvcmlnaW4gKCk6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCAndmlld3BvcnQnIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5vcmlnaW47XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcgfSlcbiAgICBzZXQgcG9zaXRpb25UeXBlICh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZy5wb3NpdGlvblR5cGUgPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0IHBvc2l0aW9uVHlwZSAoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5wb3NpdGlvblR5cGU7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgIHNldCB0cmlnZ2VyICh2YWx1ZTogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnLnRyaWdnZXIgPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0IHRyaWdnZXIgKCk6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy50cmlnZ2VyO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nIH0pXG4gICAgc2V0IHRyaWdnZXJUeXBlICh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZy50cmlnZ2VyVHlwZSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXQgdHJpZ2dlclR5cGUgKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWcudHJpZ2dlclR5cGU7XG4gICAgfVxuXG4gICAgLy8gc2V0IHdpZHRoKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgICAvLyAgICAgdGhpcy5fY29uZmlnLndpZHRoID0gdmFsdWU7XG4gICAgLy8gfTtcbiAgICAvLyBnZXQgd2lkdGggKCk6IHN0cmluZyB8IG51bWJlciB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLl9jb25maWcud2lkdGg7XG4gICAgLy8gfVxuICAgIC8vIHNldCBoZWlnaHQodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICAgIC8vICAgICB0aGlzLl9jb25maWcud2lkdGggPSB2YWx1ZTtcbiAgICAvLyB9O1xuICAgIC8vIGdldCBoZWlnaHQgKCk6IHN0cmluZyB8IG51bWJlciB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLl9jb25maWcuaGVpZ2h0O1xuICAgIC8vIH1cbiAgICAvLyBzZXQgbWF4V2lkdGgodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICAgIC8vICAgICB0aGlzLl9jb25maWcud2lkdGggPSB2YWx1ZTtcbiAgICAvLyB9O1xuICAgIC8vIGdldCBtYXhXaWR0aCAoKTogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5tYXhXaWR0aDtcbiAgICAvLyB9XG4gICAgLy8gc2V0IG1heEhlaWdodCh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgLy8gICAgIHRoaXMuX2NvbmZpZy53aWR0aCA9IHZhbHVlO1xuICAgIC8vIH07XG4gICAgLy8gZ2V0IG1heEhlaWdodCAoKTogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5tYXhIZWlnaHQ7XG4gICAgLy8gfVxuICAgIC8vIHNldCBtaW5XaWR0aCh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgLy8gICAgIHRoaXMuX2NvbmZpZy5taW5XaWR0aCA9IHZhbHVlO1xuICAgIC8vIH07XG4gICAgLy8gZ2V0IG1pbldpZHRoICgpOiBzdHJpbmcgfCBudW1iZXIge1xuICAgIC8vICAgICByZXR1cm4gdGhpcy5fY29uZmlnLm1pbldpZHRoO1xuICAgIC8vIH1cbiAgICAvLyBzZXQgbWluSGVpZ2h0KHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgICAvLyAgICAgdGhpcy5fY29uZmlnLm1pbkhlaWdodCA9IHZhbHVlO1xuICAgIC8vIH07XG4gICAgLy8gZ2V0IG1pbkhlaWdodCAoKTogc3RyaW5nIHwgbnVtYmVye1xuICAgIC8vICAgICByZXR1cm4gdGhpcy5fY29uZmlnLm1pbkhlaWdodDtcbiAgICAvLyB9XG5cbiAgICAvLyBhbGlnbm1lbnQ6IGltcG9ydChcIi4uL3Bvc2l0aW9uXCIpLkFsaWdubWVudFBhaXI7XG4gICAgLy8gdGFiYmFibGVTZWxlY3Rvcjogc3RyaW5nO1xuICAgIC8vIHdyYXBGb2N1czogYm9vbGVhbjtcbiAgICAvLyBhdXRvRm9jdXM6IGJvb2xlYW47XG4gICAgLy8gcmVzdG9yZUZvY3VzOiBib29sZWFuO1xuICAgIC8vIGluaXRpYWxGb2N1cz86IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvLyB0cmFwRm9jdXM6IGJvb2xlYW47XG4gICAgLy8gY2xvc2VPbkVzY2FwZTogYm9vbGVhbjtcbiAgICAvLyBjbG9zZU9uRm9jdXNMb3NzOiBib29sZWFuO1xuICAgIC8vIHN0YWNrZWQ6IGJvb2xlYW47XG4gICAgLy8gdGVtcGxhdGU/OiBpbXBvcnQoXCIuLi90ZW1wbGF0ZS1mdW5jdGlvblwiKS5UZW1wbGF0ZUZ1bmN0aW9uIHwgdW5kZWZpbmVkO1xuICAgIC8vIGNvbnRleHQ/OiBDb21wb25lbnQgfCB1bmRlZmluZWQ7XG4gICAgLy8gYmFja2Ryb3A6IGJvb2xlYW47XG4gICAgLy8gY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IGJvb2xlYW47XG5cbiAgICBnZXQgc3RhdGljICgpOiB0eXBlb2YgT3ZlcmxheSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIE92ZXJsYXk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmlzUmVhdHRhY2hpbmcpIHJldHVybjtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IElEX0dFTkVSQVRPUi5nZXROZXh0SUQoKTtcblxuICAgICAgICB0aGlzLm1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQodGhpcy5pZCk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcigpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBpZiAodGhpcy5pc1JlYXR0YWNoaW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyKCk7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgYCR7ICF0aGlzLm9wZW4gfWApO1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLmhhcygnb3BlbicpKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBgJHsgIXRoaXMub3BlbiB9YCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnR5KCdvcGVuJywgY2hhbmdlcy5nZXQoJ29wZW4nKSwgdGhpcy5vcGVuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoYW5nZXMuaGFzKCdjb25maWcnKSB8fCBjaGFuZ2VzLmhhcygndHJpZ2dlcicpIHx8IGNoYW5nZXMuaGFzKCdvcmlnaW4nKSB8fCBjaGFuZ2VzLmhhcygndHJpZ2dlclR5cGUnKSB8fCBjaGFuZ2VzLmhhcygncG9zaXRpb25UeXBlJykpIHtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5LnVwZGF0ZUNhbGxiYWNrKCkuLi4gY29uZmlnOiAnLCB0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSB7QGxpbmsgT3ZlcmxheS4oYWN0aXZlT3ZlcmxheXM6c3RhdGljKX0gc3RhY2tcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICoge0BsaW5rIE92ZXJsYXl9IGlzIGEgc3RhY2tlZCBvdmVybGF5IHN5c3RlbS4gVGhpcyBtZWFucywgdGhhdCBhdCBhbnkgZ2l2ZW4gdGltZSwgdGhlcmUgaXMgYXRcbiAgICAgKiBtYXhpbXVtIG9uZSBvdmVybGF5IGNvbnNpZGVyZWQgdGhlIGFjdGl2ZSBvdmVybGF5LiBUaGlzIGlzIHVzdWFsbHkgdGhlIGZvY3VzZWQgb3ZlcmxheSBhbmRcbiAgICAgKiBpdCBpcyBhbHdheXMgdGhlIGxhc3Qgb3ZlcmxheSBpbiB0aGUge0BsaW5rIE92ZXJsYXkuKGFjdGl2ZU92ZXJsYXlzOnN0YXRpYyl9IHN0YWNrLlxuICAgICAqIFdoZW4gYSBzdGFja2VkIG92ZXJsYXkgaXMgb3BlbmVkIG9yIGNsb3NlZCwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHtAbGluayBPdmVybGF5LihhY3RpdmVPdmVybGF5czpzdGF0aWMpfVxuICAgICAqIHN0YWNrIHRvIHJlZmxlY3QgdGhlIG5ldyBzdGFjayBvcmRlci4gVGhlIHJ1bGVzIGZvciB1cGRhdGluZyB0aGUgc3RhY2sgYXJlIGFzIGZvbGxvd3M6XG4gICAgICpcbiAgICAgKiAqIHdoZW4gb3BlbmluZyBhIHN0YWNrZWQgb3ZlcmxheSwgaXQgaXMgYWRkZWQgdG8gdGhlIHN0YWNrXG4gICAgICogKiB3aGVuIGNsb3NpbmcgYSBzdGFja2VkIG92ZXJsYXksIGFsbCBvdmVybGF5cyBoaWdoZXIgaW4gdGhlIHN0YWNrIGhhdmUgdG8gYmUgY2xvc2VkIHRvb1xuICAgICAqICogd2hlbiBvcGVuaW5nIGEgc3RhY2tlZCBvdmVybGF5IHdpdGggYSB0cmlnZ2VyLCB3ZSBsb29rIGZvciBhbiBvdmVybGF5IGluIHRoZSBzdGFjayB3aGljaFxuICAgICAqICAgY29udGFpbnMgdGhlIG9wZW5pbmcgb3ZlcmxheSdzIHRyaWdnZXIgLSBhbGwgb3ZlcmxheXMgaGlnaGVyIGluIHRoZSBzdGFjayBoYXZlIHRvIGJlIGNsb3NlZFxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW52b2tlZCBmcm9tIHRoZSB7QGxpbmsgT3ZlcmxheS5vcGVufSBzZXR0ZXIgYW5kIGlzIGV4ZWN1dGVkIGltbWVkaWF0ZWx5IGFuZFxuICAgICAqIHN5bmNocm9ub3VzbHkgdG8gZ3VhcmFudGVlIHRoZSBvcmRlciBpbiB3aGljaCBvdmVybGF5cyBhcmUgb3BlbmVkL2Nsb3NlZCBhbmQgdGhlIHN0YWJpbGl0eSBvZlxuICAgICAqIHRoZSBzdGFjayBhcyBvcHBvc2VkIHRvIGJlaW5nIHNjaGVkdWxlZCBpbiB0aGUgdXBkYXRlIGN5Y2xlLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9wZW4gIGB0cnVlYCBpZiB0aGUgb3ZlcmxheSBpcyBvcGVuaW5nLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVTdGFjayAob3BlbjogYm9vbGVhbikge1xuXG4gICAgICAgIC8vIG9ubHkgc3RhY2tlZCBvdmVybGF5cyBwYXJ0aWNpcGF0ZSBpbiB0aGUgc3RhY2sgbWFuYWdlbWVudFxuICAgICAgICBpZiAoIXRoaXMuX2NvbmZpZy5zdGFja2VkKSByZXR1cm47XG5cbiAgICAgICAgLy8gdHVybiBzdGFjayBpbnRvIGFycmF5IGFuZCByZXZlcnNlIGl0LCBhcyB3ZSB3YW50IHRvIHN0YXJ0IHdpdGggdGhlIGN1cnJlbnRseSBhY3RpdmUgb3ZlcmxheVxuICAgICAgICBjb25zdCBhY3RpdmVPdmVybGF5cyA9IFsuLi50aGlzLnN0YXRpYy5hY3RpdmVPdmVybGF5c10ucmV2ZXJzZSgpO1xuXG4gICAgICAgIC8vIHRoZW4gaXRlcmF0ZSBvdmVyIHRoZSByZXZlcnNlIHN0YWNrIGFuZCBjbG9zZSBlYWNoIGN1cnJlbnRseSBhY3RpdmUgb3ZlcmxheSBvbmUgYnkgb25lXG4gICAgICAgIC8vIHVudGlsIHdlIGZpbmQgYW4gYWN0aXZlIG92ZXJsYXkgd2hpY2ggZnVsZmlsbHMgdGhlIHJ1bGVzIGFuZCBjYW4gc3RheSBvcGVuXG4gICAgICAgIGFjdGl2ZU92ZXJsYXlzLnNvbWUoYWN0aXZlT3ZlcmxheSA9PiB7XG5cbiAgICAgICAgICAgIC8vIHdlIGFyZSBkb25lIGluIHRoZSBmb2xsb3dpbmcgY2FzZXM6XG4gICAgICAgICAgICBjb25zdCBkb25lID0gb3BlblxuICAgICAgICAgICAgICAgIC8vIFt0aGlzIG92ZXJsYXkgaXMgb3BlbmluZ106XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnRseSBhY3RpdmUgb3ZlcmxheSBjb250YWlucyB0aGUgdHJpZ2dlciBvZiB0aGlzIG92ZXJsYXkgYW5kIGNhbiBiZVxuICAgICAgICAgICAgICAgIC8vIGNvbnNpZGVyZWQgdGhlIHBhcmVudCBvZiB0aGlzIG92ZXJsYXkgaW4gdGhlIHN0YWNrIC0gb3IgIHRoaXMgb3ZlcmxheSBkb2Vzbid0XG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBhIHRyaWdnZXIgYW5kIHdlIGNvbnNpZGVyIHRoZSBjdXJyZW50bHkgYWN0aXZlIG92ZXJsYXkgdGhlIHBhcmVudFxuICAgICAgICAgICAgICAgID8gdGhpcy50cmlnZ2VyICYmIGFjdGl2ZU92ZXJsYXkuY29udGFpbnModGhpcy50cmlnZ2VyKSB8fCAhdGhpcy50cmlnZ2VyXG4gICAgICAgICAgICAgICAgLy8gW3RoaXMgb3ZlcmxheSBpcyBjbG9zaW5nXTpcbiAgICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudGx5IGFjdGl2ZSBvdmVybGF5IGlzIHRoaXMgb3ZlcmxheSB3aGljaCB3ZSBhcmUgYWJvdXQgdG8gY2xvc2U7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGN1cnJlbnRseSBhY3RpdmUgb3ZlcmxheSBpcyBub3QgdGhpcyBvdmVybGF5LCB0aGVuIGl0IGlzIGFuIGFjdGl2ZVxuICAgICAgICAgICAgICAgIC8vIG92ZXJsYXkgaGlnaGVyIGluIHRoZSBzdGFjayB3aGljaCBoYXMgdG8gYmUgY2xvc2VkXG4gICAgICAgICAgICAgICAgOiBhY3RpdmVPdmVybGF5ID09PSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIWRvbmUpIHtcblxuICAgICAgICAgICAgICAgIGFjdGl2ZU92ZXJsYXkub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZmluYWxseSB3ZSBhZGQvcmVtb3ZlIHRoaXMgb3ZlcmxheSB0by9mcm9tIHRoZSBzdGFja1xuICAgICAgICBvcGVuID8gdGhpcy5zdGF0aWMuYWN0aXZlT3ZlcmxheXMuYWRkKHRoaXMpIDogdGhpcy5zdGF0aWMuYWN0aXZlT3ZlcmxheXMuZGVsZXRlKHRoaXMpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRoZSBvdmVybGF5J3Mgb3Blbi1jaGFuZ2VkIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFByb3BlcnR5IGNoYW5nZXMgYXJlIGRpc3BhdGNoZWQgZHVyaW5nIHRoZSB1cGRhdGUgY3ljbGUgb2YgdGhlIGNvbXBvbmVudCwgc28gdGhleSBydW4gaW5cbiAgICAgKiBhbiBhbmltYXRpb25GcmFtZSBjYWxsYmFjay4gV2UgY2FuIHRoZXJlZm9yZSBydW4gY29kZSBpbiB0aGVzZSBoYW5kbGVycywgd2hpY2ggcnVucyBpbnNpZGVcbiAgICAgKiBhbiBhbmltYXRpb25GcmFtZSwgbGlrZSB1cGRhdGluZyB0aGUgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkgd2l0aG91dCBzY2hlZHVsaW5nIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdvcGVuLWNoYW5nZWQnLCBvcHRpb25zOiB7IGNhcHR1cmU6IHRydWUgfSB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuQ2hhbmdlZCAoZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pIHtcblxuICAgICAgICAvLyBvdmVybGF5cyBjYW4gYmUgbmVzdGVkLCB3aGljaCBtZWFucyB0aGF0ICdvcGVuLWNoYW5nZWQnLWV2ZW50cyBjYW4gYnViYmxlIGZyb21cbiAgICAgICAgLy8gYSBuZXN0ZWQgb3ZlcmxheSB0byBpdHMgcGFyZW50IC0gd2Ugb25seSB3YW50IHRvIGhhbmRsZSBldmVudHMgZnJvbSB0aGlzIG92ZXJsYXlcbiAgICAgICAgLy8gaW5zdGFuY2UsIHNvIHdlIGNoZWNrIHRoZSB7QGxpbmsgQ29tcG9uZW50RXZlbnR9J3MgZGV0YWlsLnRhcmdldCBwcm9wZXJ0eVxuICAgICAgICBpZiAoZXZlbnQuZGV0YWlsLnRhcmdldCAhPT0gdGhpcykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5LmhhbmRsZU9wZW5DaGFuZ2UoKS4uLicsIGV2ZW50LmRldGFpbC5jdXJyZW50KTtcblxuICAgICAgICBpZiAoZXZlbnQuZGV0YWlsLmN1cnJlbnQgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgdGhpcy5oYW5kbGVPcGVuKCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2FjdGl2ZU92ZXJsYXlzOiAnLCB0aGlzLnN0YXRpYy5hY3RpdmVPdmVybGF5cyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU9wZW4gKCkge1xuXG4gICAgICAgIHRoaXMubW92ZVRvUm9vdCgpO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29udHJvbGxlciA9IHRoaXMuc3RhdGljLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQodGhpcyk/LnBvc2l0aW9uQ29udHJvbGxlcjtcblxuICAgICAgICBwb3NpdGlvbkNvbnRyb2xsZXI/LmF0dGFjaCh0aGlzKTtcbiAgICAgICAgcG9zaXRpb25Db250cm9sbGVyPy51cGRhdGUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlQ2xvc2UgKCkge1xuXG4gICAgICAgIHRoaXMuc3RhdGljLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQodGhpcyk/LnBvc2l0aW9uQ29udHJvbGxlcj8uZGV0YWNoKCk7XG5cbiAgICAgICAgdGhpcy5tb3ZlRnJvbVJvb3QoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVnaXN0ZXIgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRpYy5pc092ZXJsYXlSZWdpc3RlcmVkKHRoaXMpKSB0aHJvdyBBTFJFQURZX1JFR0lTVEVSRURfRVJST1IodGhpcyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJseS5yZWdpc3RlcigpLi4uIGNvbmZpZzogJywgdGhpcy5jb25maWcpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBPdmVybGF5U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgICAgICAgZXZlbnRzOiBuZXcgRXZlbnRNYW5hZ2VyKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zdGF0aWMucmVnaXN0ZXJlZE92ZXJsYXlzLnNldCh0aGlzLCBzZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVucmVnaXN0ZXIgKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0aWMuaXNPdmVybGF5UmVnaXN0ZXJlZCh0aGlzKSkgdGhyb3cgTk9UX1JFR0lTVEVSRURfRVJST1IodGhpcyk7XG5cbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB0aGlzLnN0YXRpYy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KHRoaXMpITtcblxuICAgICAgICBzZXR0aW5ncy5vdmVybGF5VHJpZ2dlcj8uZGV0YWNoKCk7XG4gICAgICAgIHNldHRpbmdzLnBvc2l0aW9uQ29udHJvbGxlcj8uZGV0YWNoKCk7XG5cbiAgICAgICAgc2V0dGluZ3Mub3ZlcmxheVRyaWdnZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHNldHRpbmdzLnBvc2l0aW9uQ29udHJvbGxlciA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLnN0YXRpYy5yZWdpc3RlcmVkT3ZlcmxheXMuZGVsZXRlKHRoaXMpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb25maWd1cmUgKCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5LmNvbmZpZ3VyZSgpLi4uIGNvbmZpZzogJywgdGhpcy5jb25maWcpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5zdGF0aWMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldCh0aGlzKSE7XG5cbiAgICAgICAgLy8gZGlzcG9zZSBvZiB0aGUgb3ZlcmxheSB0cmlnZ2VyIGFuZCBwb3NpdGlvbiBjb250cm9sbGVyXG4gICAgICAgIHNldHRpbmdzLm92ZXJsYXlUcmlnZ2VyPy5kZXRhY2goKTtcbiAgICAgICAgc2V0dGluZ3MucG9zaXRpb25Db250cm9sbGVyPy5kZXRhY2goKTtcblxuICAgICAgICAvLyByZWNyZWF0ZSB0aGUgb3ZlcmxheSB0cmlnZ2VyIGFuZCBwb3NpdGlvbiBjb250cm9sbGVyIGZyb20gdGhlIGNvbmZpZ1xuICAgICAgICBzZXR0aW5ncy5vdmVybGF5VHJpZ2dlciA9IHRoaXMuc3RhdGljLm92ZXJsYXlUcmlnZ2VyRmFjdG9yeS5jcmVhdGUodGhpcy5fY29uZmlnLnRyaWdnZXJUeXBlLCB0aGlzLmNvbmZpZywgdGhpcyk7XG4gICAgICAgIHNldHRpbmdzLnBvc2l0aW9uQ29udHJvbGxlciA9IHRoaXMuc3RhdGljLnBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkuY3JlYXRlKHRoaXMuX2NvbmZpZy5wb3NpdGlvblR5cGUsIHRoaXMuY29uZmlnKTtcblxuICAgICAgICAvLyBhdHRhY2ggdGhlIG92ZXJsYXkgdHJpZ2dlclxuICAgICAgICBzZXR0aW5ncy5vdmVybGF5VHJpZ2dlci5hdHRhY2godGhpcy5jb25maWcudHJpZ2dlcik7XG5cbiAgICAgICAgLy8gYXR0YWNoIHRoZSBwb3NpdGlvbiBjb250cm9sbGVyLCBpZiB0aGUgb3ZlcmxheSBpcyBvcGVuXG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgc2V0dGluZ3MucG9zaXRpb25Db250cm9sbGVyPy5hdHRhY2godGhpcyk7XG4gICAgICAgICAgICBzZXR0aW5ncy5wb3NpdGlvbkNvbnRyb2xsZXI/LnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG1vdmVUb1Jvb3QgKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0aWMub3ZlcmxheVJvb3QpIHJldHVybjtcblxuICAgICAgICB0aGlzLmlzUmVhdHRhY2hpbmcgPSB0cnVlO1xuXG4gICAgICAgIHJlcGxhY2VXaXRoKHRoaXMubWFya2VyLCB0aGlzKTtcblxuICAgICAgICAvLyBUT0RPOiB0aGluayBhYm91dCB0aGlzOiBpZiB3ZSBtb3ZlIG92ZXJsYXlzIGluIHRoZSBET00sIHRoZW4gYSBjb21wb25lbnQncyBzZWxlY3RvcnMgbWlnaHRcbiAgICAgICAgLy8gZ2V0IGxvc3QgaWYgYW4gdXBkYXRlIGhhcHBlbnMgaW4gdGhhdCBjb21wb25lbnQgd2hpbGUgdGhlIG92ZXJsYXkgaXMgb3BlblxuICAgICAgICB0aGlzLnN0YXRpYy5vdmVybGF5Um9vdC5hcHBlbmRDaGlsZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmlzUmVhdHRhY2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbW92ZUZyb21Sb290ICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGljLm92ZXJsYXlSb290KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5pc1JlYXR0YWNoaW5nID0gdHJ1ZTtcblxuICAgICAgICByZXBsYWNlV2l0aCh0aGlzLCB0aGlzLm1hcmtlcik7XG5cbiAgICAgICAgdGhpcy5pc1JlYXR0YWNoaW5nID0gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBUT0RPOiBmaWd1cmUgb3V0IGhvdyB0byBhZGQgd2ViIGNvbXBvbmVudCB0eXBlcyB0byBodG1sIGxhbmd1YWdlIHNlcnZlclxuZGVjbGFyZSBnbG9iYWwge1xuXG4gICAgaW50ZXJmYWNlIEhUTUxFbGVtZW50VGFnTmFtZU1hcCB7XG4gICAgICAgICd1aS1vdmVybGF5JzogT3ZlcmxheVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBzZWxlY3RvciB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQ09OTkVDVEVEX1BPU0lUSU9OX0NPTkZJRyB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCAnLi9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTkZJRywgT3ZlcmxheUNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHsgRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcgfSBmcm9tICcuL3RyaWdnZXInO1xuXG5jb25zdCBDT05GSUc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7XG5cbn07XG5cbmNvbnN0IERJQUxPR19DT05GSUcgPSB7XG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX0NPTkZJRyxcbiAgICAuLi5ESUFMT0dfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRyxcbiAgICAuLi5DT05ORUNURURfUE9TSVRJT05fQ09ORklHXG59XG5cbkBjb21wb25lbnQ8T3ZlcmxheURlbW9Db21wb25lbnQ+KHtcbiAgICBzZWxlY3RvcjogJ292ZXJsYXktZGVtbycsXG4gICAgdGVtcGxhdGU6IGVsZW1lbnQgPT4gaHRtbGBcbiAgICA8aDI+T3ZlcmxheTwvaDI+XG5cbiAgICA8YnV0dG9uIEBjbGljaz0keyBlbGVtZW50LmNoYW5nZVJvbGUgfT5DaGFuZ2UgUm9sZTwvYnV0dG9uPlxuICAgIDxidXR0b24gQGNsaWNrPSR7IGVsZW1lbnQudG9nZ2xlIH0+VG9nZ2xlPC9idXR0b24+XG5cbiAgICA8dWktb3ZlcmxheSBpZD1cIm92ZXJsYXlcIj5cbiAgICAgICAgPGgzPk92ZXJsYXk8L2gzPlxuICAgICAgICA8cD5UaGlzIGlzIHNvbWUgb3ZlcmxheSBjb250ZW50LjwvcD5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaCB0ZXJtLi4uXCIvPiA8YnV0dG9uPlNlYXJjaDwvYnV0dG9uPlxuICAgICAgICA8L3A+XG4gICAgPC91aS1vdmVybGF5PlxuXG4gICAgPGJ1dHRvbiBpZD1cImRpYWxvZy1idXR0b25cIj5EaWFsb2c8L2J1dHRvbj5cblxuICAgIDx1aS1vdmVybGF5IGlkPVwiZGlhbG9nXCIgLmNvbmZpZz0keyBlbGVtZW50LmRpYWxvZ0NvbmZpZyB9PlxuICAgICAgICA8aDM+RGlhbG9nPC9oMz5cbiAgICAgICAgPHA+VGhpcyBpcyBzb21lIGRpYWxvZyBjb250ZW50LjwvcD5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwibmVzdGVkLWRpYWxvZy1idXR0b25cIj5OZXN0ZWQgZGlhbG9nIDE8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJuZXN0ZWQtZGlhbG9nLWJ1dHRvbi0yXCI+TmVzdGVkIGRpYWxvZyAyPC9idXR0b24+XG4gICAgICAgIDwvcD5cbiAgICAgICAgPHVpLW92ZXJsYXlcbiAgICAgICAgICAgIGlkPVwibmVzdGVkLWRpYWxvZ1wiXG4gICAgICAgICAgICB0cmlnZ2VyLXR5cGU9XCJkaWFsb2dcIlxuICAgICAgICAgICAgcG9zaXRpb24tdHlwZT1cImNvbm5lY3RlZFwiXG4gICAgICAgICAgICAudHJpZ2dlcj0keyBlbGVtZW50Lm5lc3RlZERpYWxvZ0J1dHRvbiB9XG4gICAgICAgICAgICAub3JpZ2luPSR7IGVsZW1lbnQubmVzdGVkRGlhbG9nQnV0dG9uIH0+XG4gICAgICAgICAgICA8aDM+TmVzdGVkIERpYWxvZzwvaDM+XG4gICAgICAgICAgICA8cD5UaGlzIGlzIHNvbWUgZGlhbG9nIGNvbnRlbnQuPC9wPlxuICAgICAgICA8L3VpLW92ZXJsYXk+XG4gICAgICAgIDx1aS1vdmVybGF5XG4gICAgICAgICAgICBpZD1cIm5lc3RlZC1kaWFsb2ctMlwiXG4gICAgICAgICAgICB0cmlnZ2VyLXR5cGU9XCJkaWFsb2dcIlxuICAgICAgICAgICAgcG9zaXRpb24tdHlwZT1cImNvbm5lY3RlZFwiXG4gICAgICAgICAgICAudHJpZ2dlcj0keyBlbGVtZW50Lm5lc3RlZERpYWxvZ0J1dHRvbjIgfVxuICAgICAgICAgICAgLm9yaWdpbj0keyBlbGVtZW50Lm5lc3RlZERpYWxvZ0J1dHRvbjIgfT5cbiAgICAgICAgICAgIDxoMz5OZXN0ZWQgRGlhbG9nIDI8L2gzPlxuICAgICAgICAgICAgPHA+VGhpcyBpcyBzb21lIGRpYWxvZyBjb250ZW50LjwvcD5cbiAgICAgICAgPC91aS1vdmVybGF5PlxuICAgIDwvdWktb3ZlcmxheT5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXlEZW1vQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHJvbGVzID0gWydkaWFsb2cnLCAnbWVudScsICd0b29sdGlwJ107XG5cbiAgICBjdXJyZW50Um9sZSA9IDA7XG5cbiAgICBAc2VsZWN0b3IoeyBxdWVyeTogJyNvdmVybGF5JyB9KVxuICAgIG92ZXJsYXkhOiBPdmVybGF5O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjZGlhbG9nJyB9KVxuICAgIGRpYWxvZyE6IE92ZXJsYXk7XG5cbiAgICBAc2VsZWN0b3IoeyBxdWVyeTogJyNkaWFsb2ctYnV0dG9uJyB9KVxuICAgIGRpYWxvZ0J1dHRvbiE6IEhUTUxCdXR0b25FbGVtZW50O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjbmVzdGVkLWRpYWxvZycgfSlcbiAgICBuZXN0ZWREaWFsb2chOiBPdmVybGF5O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjbmVzdGVkLWRpYWxvZy1idXR0b24nIH0pXG4gICAgbmVzdGVkRGlhbG9nQnV0dG9uITogSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICBAc2VsZWN0b3IoeyBxdWVyeTogJyNuZXN0ZWQtZGlhbG9nLTInIH0pXG4gICAgbmVzdGVkRGlhbG9nMiE6IE92ZXJsYXk7XG5cbiAgICBAc2VsZWN0b3IoeyBxdWVyeTogJyNuZXN0ZWQtZGlhbG9nLWJ1dHRvbi0yJyB9KVxuICAgIG5lc3RlZERpYWxvZ0J1dHRvbjIhOiBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgIGdldCBkaWFsb2dDb25maWcgKCk6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHJpZ2dlclR5cGU6ICdkaWFsb2cnLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiAnY29ubmVjdGVkJyxcbiAgICAgICAgICAgIHRyaWdnZXI6IHRoaXMuZGlhbG9nQnV0dG9uLFxuICAgICAgICAgICAgb3JpZ2luOiB0aGlzLmRpYWxvZ0J1dHRvbixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnRGVtby51cGRhdGVDYWxsYmFjaygpLi4uIGZpcnN0VXBkYXRlOiAnLCBmaXJzdFVwZGF0ZSk7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZVJvbGUgKCkge1xuXG4gICAgICAgIHRoaXMuY3VycmVudFJvbGUgPSAodGhpcy5jdXJyZW50Um9sZSArIDEgPCB0aGlzLnJvbGVzLmxlbmd0aCkgPyB0aGlzLmN1cnJlbnRSb2xlICsgMSA6IDA7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5LnJvbGUgPSB0aGlzLnJvbGVzW3RoaXMuY3VycmVudFJvbGVdO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSAhdGhpcy5vdmVybGF5Lm9wZW47XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsXG4gICAgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIENoYW5nZXMsIENvbXBvbmVudCxcbiAgICBjb21wb25lbnQsXG4gICAgY3NzLFxuICAgIGxpc3RlbmVyLFxuICAgIHByb3BlcnR5XG59IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgVGFiUGFuZWwgfSBmcm9tICcuL3RhYi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgcGFkZGluZzogMC41cmVtIDAuNXJlbTtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIDAgMDtcbiAgICAgICAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1zZWxlY3RlZD10cnVlXSk6YWZ0ZXIge1xuICAgICAgICBjb250ZW50OiAnJztcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgYm90dG9tOiBjYWxjKC0xICogdmFyKC0tYm9yZGVyLXdpZHRoKSk7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tYm9yZGVyLXdpZHRoKSArIDAuNXJlbSk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWIgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJpdmF0ZSBfcGFuZWw6IFRhYlBhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIF9zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtY29udHJvbHMnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogV2UgcHJvdmlkZSBvdXIgb3duIHRhYmluZGV4IHByb3BlcnR5LCBzbyB3ZSBjYW4gc2V0IGl0IHRvIGBudWxsYFxuICAgICAqIHRvIHJlbW92ZSB0aGUgdGFiaW5kZXgtYXR0cmlidXRlLlxuICAgICAqL1xuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ3RhYmluZGV4JyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtc2VsZWN0ZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgc2VsZWN0ZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAodmFsdWUgPyAwIDogLTEpO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6ICh0aGlzLnNlbGVjdGVkID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBnZXQgcGFuZWwgKCk6IFRhYlBhbmVsIHwgbnVsbCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuXG4gICAgICAgICAgICB0aGlzLl9wYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udHJvbHMpIGFzIFRhYlBhbmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWInXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IC0xO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYW5lbCkgdGhpcy5wYW5lbC5sYWJlbGxlZEJ5ID0gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBkZXNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSBmYWxzZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBBcnJvd0Rvd24gfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IEFjdGl2ZUl0ZW1DaGFuZ2UsIEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi90YWInO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1saXN0JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdyBub3dyYXA7XG4gICAgfVxuICAgIDo6c2xvdHRlZCh1aS10YWIpIHtcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjI1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWJMaXN0IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8VGFiPjtcblxuICAgIHByb3RlY3RlZCBzZWxlY3RlZFRhYiE6IFRhYjtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJsaXN0JztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFRhYi5zZWxlY3RvciksICdob3Jpem9udGFsJyk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGNvbnN0IHNsb3QgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3Rvcignc2xvdCcpIGFzIEhUTUxTbG90RWxlbWVudDtcblxuICAgICAgICAgICAgLy8gc2xvdC5hZGRFdmVudExpc3RlbmVyKCdzbG90Y2hhbmdlJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coYCR7c2xvdC5uYW1lfSBjaGFuZ2VkLi4uYCwgc2xvdC5hc3NpZ25lZE5vZGVzKCkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5xdWVyeVNlbGVjdG9yKGAkeyBUYWIuc2VsZWN0b3IgfVthcmlhLXNlbGVjdGVkPXRydWVdYCkgYXMgVGFiO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRhYlxuICAgICAgICAgICAgICAgID8gdGhpcy5mb2N1c01hbmFnZXIuc2V0QWN0aXZlSXRlbShzZWxlY3RlZFRhYilcbiAgICAgICAgICAgICAgICA6IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuXG4gICAgICAgICAgICAvLyBzZXR0aW5nIHRoZSBhY3RpdmUgaXRlbSB2aWEgdGhlIGZvY3VzIG1hbmFnZXIncyBBUEkgd2lsbCBub3QgdHJpZ2dlciBhbiBldmVudFxuICAgICAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBtYW51YWxseSBzZWxlY3QgdGhlIGluaXRpYWxseSBhY3RpdmUgdGFiXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuc2VsZWN0VGFiKHRoaXMuZm9jdXNNYW5hZ2VyLmdldEFjdGl2ZUl0ZW0oKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdrZXlkb3duJyB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgQXJyb3dEb3duOlxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSB0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkVGFiICYmIHNlbGVjdGVkVGFiLnBhbmVsKSBzZWxlY3RlZFRhYi5wYW5lbC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyPFRhYkxpc3Q+KHtcbiAgICAgICAgZXZlbnQ6ICdhY3RpdmUtaXRlbS1jaGFuZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZm9jdXNNYW5hZ2VyOyB9XG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlQWN0aXZlVGFiQ2hhbmdlIChldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUYWI+KSB7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNUYWIgPSBldmVudC5kZXRhaWwucHJldmlvdXMuaXRlbTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSBldmVudC5kZXRhaWwuY3VycmVudC5pdGVtO1xuXG4gICAgICAgIGlmIChwcmV2aW91c1RhYiAhPT0gc2VsZWN0ZWRUYWIpIHtcblxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFRhYihwcmV2aW91c1RhYik7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdFRhYihzZWxlY3RlZFRhYik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5zZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRlc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5kZXNlbGVjdCgpO1xuXG4gICAgICAgICAgICBpZiAodGFiLnBhbmVsKSB0YWIucGFuZWwuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDAgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cyk7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1oaWRkZW4nLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtbGFiZWxsZWRieScsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgbGFiZWxsZWRCeSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJwYW5lbCdcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxUb2dnbGU+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRvZ2dsZScsXG4gICAgdGVtcGxhdGU6IHRvZ2dsZSA9PiBodG1sYFxuICAgIDxzdHlsZT5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgICAgLS10aW1pbmctY3ViaWM6IGN1YmljLWJlemllcigwLjU1LCAwLjA2LCAwLjY4LCAwLjE5KTtcbiAgICAgICAgICAgIC0tdGltaW5nLXNpbmU6IGN1YmljLWJlemllcigwLjQ3LCAwLCAwLjc1LCAwLjcyKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi10aW1pbmc6IHZhcigtLXRpbWluZy1zaW5lKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi1kdXJhdGlvbjogLjFzO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCh2YXIoLS1mb250LXNpemUpLCAxZnIpKTtcblxuICAgICAgICAgICAgbWluLXdpZHRoOiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKiAyICsgdmFyKC0tYm9yZGVyLXdpZHRoKSAqIDIpO1xuICAgICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKyB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSAqIDIpO1xuICAgICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICAgICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG5cbiAgICAgICAgICAgIC8qIHRyYW5zaXRpb24tcHJvcGVydHk6IGJhY2tncm91bmQtY29sb3IsIGJvcmRlci1jb2xvcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tZHVyYXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pO1xuICAgICAgICAgICAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTsgKi9cbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPXRydWVdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2xhYmVsLW9uXVtsYWJlbC1vZmZdKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgICAgICB9XG4gICAgICAgIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgaGVpZ2h0OiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgd2lkdGg6IHZhcigtLWZvbnQtc2l6ZSk7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICB3aWR0aDogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAwO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXVtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgfVxuICAgICAgICAubGFiZWwge1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgcGFkZGluZzogMCAuMjVyZW07XG4gICAgICAgICAgICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAganVzdGlmeS1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAubGFiZWwtb24ge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJmYWxzZVwiXSkgLmxhYmVsLW9mZiB7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgIH1cblxuICAgIDwvc3R5bGU+XG4gICAgPHNwYW4gY2xhc3M9XCJ0b2dnbGUtdGh1bWJcIj48L3NwYW4+XG4gICAgJHsgdG9nZ2xlLmxhYmVsT24gJiYgdG9nZ2xlLmxhYmVsT2ZmXG4gICAgICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vZmZcIj4keyB0b2dnbGUubGFiZWxPZmYgfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9uXCI+JHsgdG9nZ2xlLmxhYmVsT24gfTwvc3Bhbj5gXG4gICAgICAgICAgICA6ICcnXG4gICAgICAgIH1cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIFRvZ2dsZSBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNoZWNrZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZ1xuICAgIH0pXG4gICAgbGFiZWwgPSAnJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6IGZhbHNlXG4gICAgfSlcbiAgICBsYWJlbE9uID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPZmYgPSAnJztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdzd2l0Y2gnO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICAvLyB0cmlnZ2VyIHByb3BlcnR5LWNoYW5nZSBldmVudCBmb3IgYGNoZWNrZWRgXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBFbnRlciB8fCBldmVudC5rZXkgPT09IFNwYWNlKSB7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgIC8vIHByZXZlbnQgc3BhY2Uga2V5IGZyb20gc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIHNlbGVjdG9yLCBsaXN0ZW5lciwgQ2hhbmdlcywgcHJvcGVydHksIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgY3NzIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBFdmVudE1hbmFnZXIgfSBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQgeyBhY3RpdmVFbGVtZW50IH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHsgRm9jdXNNb25pdG9yLCBGb2N1c0NoYW5nZUV2ZW50IH0gZnJvbSAnLi9mb2N1cyc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZm9jdXMtY29udGFpbmVyJyxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiLz4gPGJ1dHRvbj5PSzwvYnV0dG9uPlxuICAgIGAsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgfVxuICAgIGBdLFxufSlcbmV4cG9ydCBjbGFzcyBGb2N1c0NvbnRhaW5lciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNb25pdG9yID0gbmV3IEZvY3VzTW9uaXRvcigpO1xuXG4gICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIgfSlcbiAgICB0YWJpbmRleCA9IDA7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5mb2N1c01vbml0b3IuYXR0YWNoKHRoaXMpO1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuZm9jdXNNb25pdG9yLmRldGFjaCgpO1xuXG4gICAgICAgIHN1cGVyLmRpc2Nvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxufVxuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2V2ZW50LW9yZGVyLWRlbW8nLFxuICAgIHRlbXBsYXRlOiBlbGVtZW50ID0+IGh0bWxgXG4gICAgPGZvY3VzLWNvbnRhaW5lciBpZD1cIm9uZVwiPjwvZm9jdXMtY29udGFpbmVyPlxuICAgIDxmb2N1cy1jb250YWluZXIgaWQ9XCJ0d29cIj48L2ZvY3VzLWNvbnRhaW5lcj5cbiAgICBgLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIH1cbiAgICBgXSxcbn0pXG5leHBvcnQgY2xhc3MgRXZlbnRPcmRlckRlbW8gZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIGV2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcblxuICAgIEBzZWxlY3Rvcih7IHF1ZXJ5OiAnI29uZScgfSlcbiAgICBjb250YWluZXJPbmUhOiBIVE1MRWxlbWVudDtcblxuICAgIEBzZWxlY3Rvcih7IHF1ZXJ5OiAnI3R3bycgfSlcbiAgICBjb250YWluZXJUd28hOiBIVE1MRWxlbWVudDtcblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdENoYW5nZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdENoYW5nZSkge1xuXG4gICAgICAgICAgICAvLyB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5pbnB1dE9uZSwgJ2ZvY3VzaW4nLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzSW4oZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRPbmUsICdmb2N1c291dCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNPdXQoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRPbmUsICdmb2N1cycsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXMoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRPbmUsICdibHVyJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVCbHVyKGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmNvbnRhaW5lck9uZSwgJ2ZvY3VzLWNoYW5nZWQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzQ2hhbmdlKGV2ZW50IGFzIEZvY3VzQ2hhbmdlRXZlbnQpKTtcblxuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRUd28sICdmb2N1c2luJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVGb2N1c0luKGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcbiAgICAgICAgICAgIC8vIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmlucHV0VHdvLCAnZm9jdXNvdXQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzT3V0KGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcbiAgICAgICAgICAgIC8vIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmlucHV0VHdvLCAnZm9jdXMnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzKGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcbiAgICAgICAgICAgIC8vIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmlucHV0VHdvLCAnYmx1cicsIGV2ZW50ID0+IHRoaXMuaGFuZGxlQmx1cihldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5jb250YWluZXJUd28sICdmb2N1cy1jaGFuZ2VkJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVGb2N1c0NoYW5nZShldmVudCBhcyBGb2N1c0NoYW5nZUV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIudW5saXN0ZW5BbGwoKTtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAnZm9jdXNpbicsIHRhcmdldDogZG9jdW1lbnQgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNJbiAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnQGZvY3VzaW46ICcsIChldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuaWQsIGFjdGl2ZUVsZW1lbnQoKSk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdmb2N1c291dCcsIHRhcmdldDogZG9jdW1lbnQgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNPdXQgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0Bmb2N1c291dDogJywgKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5pZCwgYWN0aXZlRWxlbWVudCgpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXMgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0Bmb2N1czogJywgKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5pZCwgYWN0aXZlRWxlbWVudCgpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlQmx1ciAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnQGJsdXI6ICcsIChldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuaWQsIGFjdGl2ZUVsZW1lbnQoKSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUZvY3VzQ2hhbmdlIChldmVudDogRm9jdXNDaGFuZ2VFdmVudCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGBAZm9jdXMtY2hhbmdlZFskeyBldmVudC5kZXRhaWwuaGFzRm9jdXMgfV06IGAsIChldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuaWQsIGFjdGl2ZUVsZW1lbnQoKSwgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0ICcuL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSAnLi9hcHAuc3R5bGVzJztcbmltcG9ydCB7IHRlbXBsYXRlIH0gZnJvbSAnLi9hcHAudGVtcGxhdGUnO1xuaW1wb3J0ICcuL2NhcmQnO1xuaW1wb3J0ICcuL2NoZWNrYm94JztcbmltcG9ydCAnLi9pY29uL2ljb24nO1xuaW1wb3J0ICcuL292ZXJsYXktbmV3L2RlbW8nO1xuaW1wb3J0ICcuL3RhYnMvdGFiJztcbmltcG9ydCAnLi90YWJzL3RhYi1saXN0JztcbmltcG9ydCAnLi90YWJzL3RhYi1wYW5lbCc7XG5pbXBvcnQgJy4vdG9nZ2xlJztcbmltcG9ydCAnLi9ldmVudC1vcmRlci1kZW1vJ1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2RlbW8tYXBwJyxcbiAgICBzaGFkb3c6IGZhbHNlLFxuICAgIHN0eWxlczogW3N0eWxlc10sXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG59KVxuZXhwb3J0IGNsYXNzIEFwcCBleHRlbmRzIENvbXBvbmVudCB7IH1cbiIsImltcG9ydCAnLi9zcmMvYXBwJztcblxuZnVuY3Rpb24gYm9vdHN0cmFwICgpIHtcblxuICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndWktY2hlY2tib3gnKTtcblxuICAgIGlmIChjaGVja2JveCkge1xuXG4gICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoZWNrZWQtY2hhbmdlZCcsIGV2ZW50ID0+IGNvbnNvbGUubG9nKChldmVudCBhcyBDdXN0b21FdmVudCkuZGV0YWlsKSk7XG4gICAgfVxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGJvb3RzdHJhcCk7XG4iXSwibmFtZXMiOlsicHJlcGFyZUNvbnN0cnVjdG9yIiwiVGFiIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsTUFBTSxVQUFVLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUNqQyxJQTZDTyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSztJQUNsQyxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssVUFBVSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDO0lBQ0Y7O0lDOURBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxN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
