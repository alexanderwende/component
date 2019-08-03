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
                    html += s + (isCommentBinding ? marker : nodeMarker);
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
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.1');
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
    const AttributeConverterBoolean = {
        fromAttribute: (value) => (value !== null),
        toAttribute: (value) => value ? '' : null
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
            this.dispatchEvent(new CustomEvent(lifecycle, {
                composed: true,
                ...(detail ? { detail: detail } : {})
            }));
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
        async _enqueueUpdate() {
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
            await previousRequest;
            const result = this._scheduleUpdate();
            // the actual update may be scheduled asynchronously as well
            if (result)
                await result;
            // resolve the new {@link _updateRequest} after the result of the current update resolves
            resolve(!this._hasRequestedUpdate);
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
        const declaration = { ...DEFAULT_COMPONENT_DECLARATION, ...options };
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
                constructor.listeners.set(propertyKey, { ...options });
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
            const declaration = { ...DEFAULT_PROPERTY_DECLARATION, ...options };
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
            if (this.itemType && event.target instanceof this.itemType) {
                const prevIndex = this.activeIndex;
                this.setActiveItem(event.target, true);
                if (prevIndex !== this.activeIndex)
                    this.dispatchActiveItemChange(prevIndex);
            }
        }
        handleFocus(event) {
            if (this.itemType && event.target instanceof this.itemType) {
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

    const ARIABooleanConverter = {
        fromAttribute: (value) => value === 'true',
        toAttribute: (value) => (value == null) ? value : value.toString()
    };

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
            converter: ARIABooleanConverter
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], AccordionHeader.prototype, "disabled", null);
    __decorate([
        property({
            attribute: 'aria-expanded',
            converter: ARIABooleanConverter
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
        handleClick(event) {
            event.preventDefault();
            if (this.disabled) {
                return;
            }
            this.select();
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
            converter: ARIABooleanConverter
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Tab.prototype, "selected", null);
    __decorate([
        property({
            attribute: 'aria-disabled',
            converter: ARIABooleanConverter,
        }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Tab.prototype, "disabled", null);
    __decorate([
        listener({ event: 'click' }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], Tab.prototype, "handleClick", null);
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

    let TabListNew = class TabListNew extends Component {
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
    ], TabListNew.prototype, "role", void 0);
    __decorate([
        listener({ event: 'keydown' }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], TabListNew.prototype, "handleKeyDown", null);
    __decorate([
        listener({
            event: 'active-item-change',
            target: function () { return this.focusManager; }
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TabListNew.prototype, "handleActiveTabChange", null);
    TabListNew = __decorate([
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
    ], TabListNew);

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
            converter: ARIABooleanConverter,
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
            converter: ARIABooleanConverter
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

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy91dGlscy9zdHJpbmctdXRpbHMudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS1kZWNsYXJhdGlvbi50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL2dldC1wcm9wZXJ0eS1kZXNjcmlwdG9yLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvcHJvcGVydHkudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9hcmlhLWJvb2xlYW4tY29udmVydGVyLnRzIiwic3JjL2ljb24vaWNvbi50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLWhlYWRlci50cyIsInNyYy9oZWxwZXJzL2NvcHlyaWdodC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmVsLnRzIiwic3JjL2FjY29yZGlvbi9hY2NvcmRpb24udHMiLCJzcmMvYXBwLnN0eWxlcy50cyIsInNyYy9hcHAudGVtcGxhdGUudHMiLCJzcmMvY2FyZC50cyIsInNyYy9jaGVja2JveC50cyIsInNyYy90YWJzL3RhYi50cyIsInNyYy90YWJzL3RhYi1saXN0LnRzIiwic3JjL3RhYnMvdGFiLXBhbmVsLnRzIiwic3JjL3RvZ2dsZS50cyIsInNyYy9hcHAudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmNvbnN0IGRpcmVjdGl2ZXMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBCcmFuZHMgYSBmdW5jdGlvbiBhcyBhIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uIHNvIHRoYXQgbGl0LWh0bWwgd2lsbCBjYWxsXG4gKiB0aGUgZnVuY3Rpb24gZHVyaW5nIHRlbXBsYXRlIHJlbmRlcmluZywgcmF0aGVyIHRoYW4gcGFzc2luZyBhcyBhIHZhbHVlLlxuICpcbiAqIEEgX2RpcmVjdGl2ZV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgUGFydCBhcyBhbiBhcmd1bWVudC4gSXQgaGFzIHRoZVxuICogc2lnbmF0dXJlOiBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLlxuICpcbiAqIEEgZGlyZWN0aXZlIF9mYWN0b3J5XyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYXJndW1lbnRzIGZvciBkYXRhIGFuZFxuICogY29uZmlndXJhdGlvbiBhbmQgcmV0dXJucyBhIGRpcmVjdGl2ZS4gVXNlcnMgb2YgZGlyZWN0aXZlIHVzdWFsbHkgcmVmZXIgdG9cbiAqIHRoZSBkaXJlY3RpdmUgZmFjdG9yeSBhcyB0aGUgZGlyZWN0aXZlLiBGb3IgZXhhbXBsZSwgXCJUaGUgcmVwZWF0IGRpcmVjdGl2ZVwiLlxuICpcbiAqIFVzdWFsbHkgYSB0ZW1wbGF0ZSBhdXRob3Igd2lsbCBpbnZva2UgYSBkaXJlY3RpdmUgZmFjdG9yeSBpbiB0aGVpciB0ZW1wbGF0ZVxuICogd2l0aCByZWxldmFudCBhcmd1bWVudHMsIHdoaWNoIHdpbGwgdGhlbiByZXR1cm4gYSBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKlxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgdXNpbmcgdGhlIGByZXBlYXQoKWAgZGlyZWN0aXZlIGZhY3RvcnkgdGhhdCB0YWtlcyBhblxuICogYXJyYXkgYW5kIGEgZnVuY3Rpb24gdG8gcmVuZGVyIGFuIGl0ZW06XG4gKlxuICogYGBganNcbiAqIGh0bWxgPHVsPjwke3JlcGVhdChpdGVtcywgKGl0ZW0pID0+IGh0bWxgPGxpPiR7aXRlbX08L2xpPmApfTwvdWw+YFxuICogYGBgXG4gKlxuICogV2hlbiBgcmVwZWF0YCBpcyBpbnZva2VkLCBpdCByZXR1cm5zIGEgZGlyZWN0aXZlIGZ1bmN0aW9uIHRoYXQgY2xvc2VzIG92ZXJcbiAqIGBpdGVtc2AgYW5kIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi4gV2hlbiB0aGUgb3V0ZXIgdGVtcGxhdGUgaXMgcmVuZGVyZWQsIHRoZVxuICogcmV0dXJuIGRpcmVjdGl2ZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgUGFydCBmb3IgdGhlIGV4cHJlc3Npb24uXG4gKiBgcmVwZWF0YCB0aGVuIHBlcmZvcm1zIGl0J3MgY3VzdG9tIGxvZ2ljIHRvIHJlbmRlciBtdWx0aXBsZSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0gZiBUaGUgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24uIE11c3QgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYVxuICogZnVuY3Rpb24gb2YgdGhlIHNpZ25hdHVyZSBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLiBUaGUgcmV0dXJuZWQgZnVuY3Rpb24gd2lsbFxuICogYmUgY2FsbGVkIHdpdGggdGhlIHBhcnQgb2JqZWN0LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogaW1wb3J0IHtkaXJlY3RpdmUsIGh0bWx9IGZyb20gJ2xpdC1odG1sJztcbiAqXG4gKiBjb25zdCBpbW11dGFibGUgPSBkaXJlY3RpdmUoKHYpID0+IChwYXJ0KSA9PiB7XG4gKiAgIGlmIChwYXJ0LnZhbHVlICE9PSB2KSB7XG4gKiAgICAgcGFydC5zZXRWYWx1ZSh2KVxuICogICB9XG4gKiB9KTtcbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9IChmKSA9PiAoKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBkID0gZiguLi5hcmdzKTtcbiAgICBkaXJlY3RpdmVzLnNldChkLCB0cnVlKTtcbiAgICByZXR1cm4gZDtcbn0pO1xuZXhwb3J0IGNvbnN0IGlzRGlyZWN0aXZlID0gKG8pID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdmdW5jdGlvbicgJiYgZGlyZWN0aXZlcy5oYXMobyk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlyZWN0aXZlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogVHJ1ZSBpZiB0aGUgY3VzdG9tIGVsZW1lbnRzIHBvbHlmaWxsIGlzIGluIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ0VQb2x5ZmlsbCA9IHdpbmRvdy5jdXN0b21FbGVtZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sgIT09XG4gICAgICAgIHVuZGVmaW5lZDtcbi8qKlxuICogUmVwYXJlbnRzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydGAgKGluY2x1c2l2ZSkgdG8gYGVuZGAgKGV4Y2x1c2l2ZSksXG4gKiBpbnRvIGFub3RoZXIgY29udGFpbmVyIChjb3VsZCBiZSB0aGUgc2FtZSBjb250YWluZXIpLCBiZWZvcmUgYGJlZm9yZWAuIElmXG4gKiBgYmVmb3JlYCBpcyBudWxsLCBpdCBhcHBlbmRzIHRoZSBub2RlcyB0byB0aGUgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgcmVwYXJlbnROb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsLCBiZWZvcmUgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKHN0YXJ0LCBiZWZvcmUpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8qKlxuICogUmVtb3ZlcyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLCBmcm9tXG4gKiBgY29udGFpbmVyYC5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZU5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwpID0+IHtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgICAgICBjb25zdCBuID0gc3RhcnQubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG9tLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxOCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IHt9O1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIE5vZGVQYXJ0IHRvIGZ1bGx5IGNsZWFyIGl0cyBjb250ZW50LlxuICovXG5leHBvcnQgY29uc3Qgbm90aGluZyA9IHt9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHdpdGggZW1iZWRkZWQgdW5pcXVlIGtleSB0byBhdm9pZCBjb2xsaXNpb24gd2l0aFxuICogcG9zc2libGUgdGV4dCBpbiB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBtYXJrZXIgPSBge3tsaXQtJHtTdHJpbmcoTWF0aC5yYW5kb20oKSkuc2xpY2UoMil9fX1gO1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB1c2VkIHRleHQtcG9zaXRpb25zLCBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZXMsIGFuZFxuICogYXR0cmlidXRlcyB3aXRoIG1hcmt1cC1saWtlIHRleHQgdmFsdWVzLlxuICovXG5leHBvcnQgY29uc3Qgbm9kZU1hcmtlciA9IGA8IS0tJHttYXJrZXJ9LS0+YDtcbmV4cG9ydCBjb25zdCBtYXJrZXJSZWdleCA9IG5ldyBSZWdFeHAoYCR7bWFya2VyfXwke25vZGVNYXJrZXJ9YCk7XG4vKipcbiAqIFN1ZmZpeCBhcHBlbmRlZCB0byBhbGwgYm91bmQgYXR0cmlidXRlIG5hbWVzLlxuICovXG5leHBvcnQgY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIFRlbXBsYXRlIHRoYXQgdHJhY2tzIHRoZSBsb2NhdGlvbiBvZiBkeW5hbWljIHBhcnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbXTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZWxlbWVudC5jb250ZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgaW5kZXggYXNzb2NpYXRlZCB3aXRoIGEgcGFydC4gV2UgdHJ5IHRvIGRlbGV0ZVxuICAgICAgICAvLyB1bm5lY2Vzc2FyeSBub2RlcywgYnV0IHdlIG5ldmVyIHdhbnQgdG8gYXNzb2NpYXRlIHR3byBkaWZmZXJlbnQgcGFydHNcbiAgICAgICAgLy8gdG8gdGhlIHNhbWUgaW5kZXguIFRoZXkgbXVzdCBoYXZlIGEgY29uc3RhbnQgbm9kZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgbGFzdFBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgeyBzdHJpbmdzLCB2YWx1ZXM6IHsgbGVuZ3RoIH0gfSA9IHJlc3VsdDtcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAvKiBOb2RlLkVMRU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGxlbmd0aCB9ID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9OYW1lZE5vZGVNYXAsXG4gICAgICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHJldHVybmVkIGluIGRvY3VtZW50IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBwYXJ0aWN1bGFyLCBFZGdlL0lFIGNhbiByZXR1cm4gdGhlbSBvdXQgb2Ygb3JkZXIsIHNvIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgICAgICAvLyBhc3N1bWUgYSBjb3JyZXNwb25kZW5jZSBiZXR3ZWVuIHBhcnQgaW5kZXggYW5kIGF0dHJpYnV0ZSBpbmRleC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoKGF0dHJpYnV0ZXNbaV0ubmFtZSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBzZWN0aW9uIGxlYWRpbmcgdXAgdG8gdGhlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIGluIHRoaXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gc3RyaW5nc1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMoc3RyaW5nRm9yUGFydClbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxsIGJvdW5kIGF0dHJpYnV0ZXMgaGF2ZSBoYWQgYSBzdWZmaXggYWRkZWQgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBsYXRlUmVzdWx0I2dldEhUTUwgdG8gb3B0IG91dCBvZiBzcGVjaWFsIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcuIFRvIGxvb2sgdXAgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB3ZSBhbHNvIG5lZWQgdG8gYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3VmZml4LlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTG9va3VwTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKSArIGJvdW5kQXR0cmlidXRlU3VmZml4O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IGF0dHJpYnV0ZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdhdHRyaWJ1dGUnLCBpbmRleCwgbmFtZSwgc3RyaW5nczogc3RhdGljcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBzdGF0aWNzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gZGF0YS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbnNlcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcyA9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocyA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBjcmVhdGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCAmJiBlbmRzV2l0aChtYXRjaFsyXSwgYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArIG1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzJdLnNsaWNlKDAsIC1ib3VuZEF0dHJpYnV0ZVN1ZmZpeC5sZW5ndGgpICsgbWF0Y2hbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpbnNlcnQsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogKytpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIHRleHQsIHdlIG11c3QgaW5zZXJ0IGEgY29tbWVudCB0byBtYXJrIG91ciBwbGFjZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHRydXN0IGl0IHdpbGwgc3RpY2sgYXJvdW5kIGFmdGVyIGNsb25pbmcuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9IHN0cmluZ3NbbGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgcGFydCBmb3IgZWFjaCBtYXRjaCBmb3VuZFxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogTm9kZS5DT01NRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kYXRhID09PSBtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2ZcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gICogV2UgZG9uJ3QgaGF2ZSBhIHByZXZpb3VzU2libGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyAgKiBUaGUgcHJldmlvdXNTaWJsaW5nIGlzIGFscmVhZHkgdGhlIHN0YXJ0IG9mIGEgcHJldmlvdXMgcGFydFxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IG51bGwgfHwgaW5kZXggPT09IGxhc3RQYXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0UGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBuZXh0U2libGluZywga2VlcCB0aGlzIG5vZGUgc28gd2UgaGF2ZSBhbiBlbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiByZW1vdmUgaXQgdG8gc2F2ZSBmdXR1cmUgY29zdHMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGkgPSBub2RlLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBjb25zaWRlciB3aGV0aGVyIGl0J3MgZXZlbiB3b3J0aCBpdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBiaW5kaW5ncyBpbiBjb21tZW50cyB3b3JrXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiAtMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSB0ZXh0IGJpbmRpbmcgbm9kZXMgYWZ0ZXIgdGhlIHdhbGsgdG8gbm90IGRpc3R1cmIgdGhlIFRyZWVXYWxrZXJcbiAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVuZHNXaXRoID0gKHN0ciwgc3VmZml4KSA9PiB7XG4gICAgY29uc3QgaW5kZXggPSBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aDtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBzdHIuc2xpY2UoaW5kZXgpID09PSBzdWZmaXg7XG59O1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLy8gQWxsb3dzIGBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKWAgdG8gYmUgcmVuYW1lZCBmb3IgYVxuLy8gc21hbGwgbWFudWFsIHNpemUtc2F2aW5ncy5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbi8qKlxuICogVGhpcyByZWdleCBleHRyYWN0cyB0aGUgYXR0cmlidXRlIG5hbWUgcHJlY2VkaW5nIGFuIGF0dHJpYnV0ZS1wb3NpdGlvblxuICogZXhwcmVzc2lvbi4gSXQgZG9lcyB0aGlzIGJ5IG1hdGNoaW5nIHRoZSBzeW50YXggYWxsb3dlZCBmb3IgYXR0cmlidXRlc1xuICogYWdhaW5zdCB0aGUgc3RyaW5nIGxpdGVyYWwgZGlyZWN0bHkgcHJlY2VkaW5nIHRoZSBleHByZXNzaW9uLCBhc3N1bWluZyB0aGF0XG4gKiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhbiBhdHRyaWJ1dGUtdmFsdWUgcG9zaXRpb24uXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx4MDlcXHgwYVxceDBjXFx4MGRcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2luZnJhc3RydWN0dXJlLmh0bWwjc3BhY2UtY2hhcmFjdGVyc1xuICpcbiAqIFwiXFwwLVxceDFGXFx4N0YtXFx4OUZcIiBhcmUgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnMsIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5XG4gKiBzcGFjZSBjaGFyYWN0ZXIgZXhjZXB0IFwiIFwiLlxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIGNvbnRyb2wgY2hhcmFjdGVyLCBzcGFjZSBjaGFyYWN0ZXIsICgnKSxcbiAqICAgIChcIiksIFwiPlwiLCBcIj1cIiwgb3IgXCIvXCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmV4cG9ydCBjb25zdCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4ID0gLyhbIFxceDA5XFx4MGFcXHgwY1xceDBkXSkoW15cXDAtXFx4MUZcXHg3Ri1cXHg5RiBcIic+PS9dKykoWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qPVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKig/OlteIFxceDA5XFx4MGFcXHgwY1xceDBkXCInYDw+PV0qfFwiW15cIl0qfCdbXiddKikpJC87XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNDRVBvbHlmaWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgYSBgVGVtcGxhdGVgIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIHRoZSBET00gYW5kIHVwZGF0ZWRcbiAqIHdpdGggbmV3IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlSW5zdGFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBwcm9jZXNzb3IsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fX3BhcnRzID0gW107XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIHVwZGF0ZSh2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5zZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jbG9uZSgpIHtcbiAgICAgICAgLy8gVGhlcmUgYXJlIGEgbnVtYmVyIG9mIHN0ZXBzIGluIHRoZSBsaWZlY3ljbGUgb2YgYSB0ZW1wbGF0ZSBpbnN0YW5jZSdzXG4gICAgICAgIC8vIERPTSBmcmFnbWVudDpcbiAgICAgICAgLy8gIDEuIENsb25lIC0gY3JlYXRlIHRoZSBpbnN0YW5jZSBmcmFnbWVudFxuICAgICAgICAvLyAgMi4gQWRvcHQgLSBhZG9wdCBpbnRvIHRoZSBtYWluIGRvY3VtZW50XG4gICAgICAgIC8vICAzLiBQcm9jZXNzIC0gZmluZCBwYXJ0IG1hcmtlcnMgYW5kIGNyZWF0ZSBwYXJ0c1xuICAgICAgICAvLyAgNC4gVXBncmFkZSAtIHVwZ3JhZGUgY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIC8vICA1LiBVcGRhdGUgLSBzZXQgbm9kZSwgYXR0cmlidXRlLCBwcm9wZXJ0eSwgZXRjLiwgdmFsdWVzXG4gICAgICAgIC8vICA2LiBDb25uZWN0IC0gY29ubmVjdCB0byB0aGUgZG9jdW1lbnQuIE9wdGlvbmFsIGFuZCBvdXRzaWRlIG9mIHRoaXNcbiAgICAgICAgLy8gICAgIG1ldGhvZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgaGF2ZSBhIGZldyBjb25zdHJhaW50cyBvbiB0aGUgb3JkZXJpbmcgb2YgdGhlc2Ugc3RlcHM6XG4gICAgICAgIC8vICAqIFdlIG5lZWQgdG8gdXBncmFkZSBiZWZvcmUgdXBkYXRpbmcsIHNvIHRoYXQgcHJvcGVydHkgdmFsdWVzIHdpbGwgcGFzc1xuICAgICAgICAvLyAgICB0aHJvdWdoIGFueSBwcm9wZXJ0eSBzZXR0ZXJzLlxuICAgICAgICAvLyAgKiBXZSB3b3VsZCBsaWtlIHRvIHByb2Nlc3MgYmVmb3JlIHVwZ3JhZGluZyBzbyB0aGF0IHdlJ3JlIHN1cmUgdGhhdCB0aGVcbiAgICAgICAgLy8gICAgY2xvbmVkIGZyYWdtZW50IGlzIGluZXJ0IGFuZCBub3QgZGlzdHVyYmVkIGJ5IHNlbGYtbW9kaWZ5aW5nIERPTS5cbiAgICAgICAgLy8gICogV2Ugd2FudCBjdXN0b20gZWxlbWVudHMgdG8gdXBncmFkZSBldmVuIGluIGRpc2Nvbm5lY3RlZCBmcmFnbWVudHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEdpdmVuIHRoZXNlIGNvbnN0cmFpbnRzLCB3aXRoIGZ1bGwgY3VzdG9tIGVsZW1lbnRzIHN1cHBvcnQgd2Ugd291bGRcbiAgICAgICAgLy8gcHJlZmVyIHRoZSBvcmRlcjogQ2xvbmUsIFByb2Nlc3MsIEFkb3B0LCBVcGdyYWRlLCBVcGRhdGUsIENvbm5lY3RcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQnV0IFNhZmFyaSBkb29lcyBub3QgaW1wbGVtZW50IEN1c3RvbUVsZW1lbnRSZWdpc3RyeSN1cGdyYWRlLCBzbyB3ZVxuICAgICAgICAvLyBjYW4gbm90IGltcGxlbWVudCB0aGF0IG9yZGVyIGFuZCBzdGlsbCBoYXZlIHVwZ3JhZGUtYmVmb3JlLXVwZGF0ZSBhbmRcbiAgICAgICAgLy8gdXBncmFkZSBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLiBTbyB3ZSBpbnN0ZWFkIHNhY3JpZmljZSB0aGVcbiAgICAgICAgLy8gcHJvY2Vzcy1iZWZvcmUtdXBncmFkZSBjb25zdHJhaW50LCBzaW5jZSBpbiBDdXN0b20gRWxlbWVudHMgdjEgZWxlbWVudHNcbiAgICAgICAgLy8gbXVzdCBub3QgbW9kaWZ5IHRoZWlyIGxpZ2h0IERPTSBpbiB0aGUgY29uc3RydWN0b3IuIFdlIHN0aWxsIGhhdmUgaXNzdWVzXG4gICAgICAgIC8vIHdoZW4gY28tZXhpc3Rpbmcgd2l0aCBDRXYwIGVsZW1lbnRzIGxpa2UgUG9seW1lciAxLCBhbmQgd2l0aCBwb2x5ZmlsbHNcbiAgICAgICAgLy8gdGhhdCBkb24ndCBzdHJpY3RseSBhZGhlcmUgdG8gdGhlIG5vLW1vZGlmaWNhdGlvbiBydWxlIGJlY2F1c2Ugc2hhZG93XG4gICAgICAgIC8vIERPTSwgd2hpY2ggbWF5IGJlIGNyZWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCBpcyBlbXVsYXRlZCBieSBiZWluZyBwbGFjZWRcbiAgICAgICAgLy8gaW4gdGhlIGxpZ2h0IERPTS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHJlc3VsdGluZyBvcmRlciBpcyBvbiBuYXRpdmUgaXM6IENsb25lLCBBZG9wdCwgVXBncmFkZSwgUHJvY2VzcyxcbiAgICAgICAgLy8gVXBkYXRlLCBDb25uZWN0LiBkb2N1bWVudC5pbXBvcnROb2RlKCkgcGVyZm9ybXMgQ2xvbmUsIEFkb3B0LCBhbmQgVXBncmFkZVxuICAgICAgICAvLyBpbiBvbmUgc3RlcC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIEN1c3RvbSBFbGVtZW50cyB2MSBwb2x5ZmlsbCBzdXBwb3J0cyB1cGdyYWRlKCksIHNvIHRoZSBvcmRlciB3aGVuXG4gICAgICAgIC8vIHBvbHlmaWxsZWQgaXMgdGhlIG1vcmUgaWRlYWw6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLFxuICAgICAgICAvLyBDb25uZWN0LlxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGlzQ0VQb2x5ZmlsbCA/XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkgOlxuICAgICAgICAgICAgZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy50ZW1wbGF0ZS5wYXJ0cztcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZnJhZ21lbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgICAgIGxldCBwYXJ0O1xuICAgICAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHRoZSBub2RlcyBhbmQgcGFydHMgb2YgYSB0ZW1wbGF0ZVxuICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIGlmICghaXNUZW1wbGF0ZVBhcnRBY3RpdmUocGFydCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgdGhlIHRyZWUgd2Fsa2VyIHVudGlsIHdlIGZpbmQgb3VyIG5leHQgcGFydCdzIG5vZGUuXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgbXVsdGlwbGUgcGFydHMgbWF5IHNoYXJlIHRoZSBzYW1lIG5vZGUgKGF0dHJpYnV0ZSBwYXJ0c1xuICAgICAgICAgICAgLy8gb24gYSBzaW5nbGUgZWxlbWVudCksIHNvIHRoaXMgbG9vcCBtYXkgbm90IHJ1biBhdCBhbGwuXG4gICAgICAgICAgICB3aGlsZSAobm9kZUluZGV4IDwgcGFydC5pbmRleCkge1xuICAgICAgICAgICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGV4aGF1c3RlZCB0aGUgY29udGVudCBpbnNpZGUgYSBuZXN0ZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBzdGlsbCBoYXZlIHBhcnRzICh0aGUgb3V0ZXIgZm9yLWxvb3ApLCB3ZSBrbm93OlxuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlIHdhbGtlciB3aWxsIGZpbmQgYSBuZXh0Tm9kZSBvdXRzaWRlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlJ3ZlIGFycml2ZWQgYXQgb3VyIHBhcnQncyBub2RlLlxuICAgICAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucHJvY2Vzc29yLmhhbmRsZVRleHRFeHByZXNzaW9uKHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcGFydC5pbnNlcnRBZnRlck5vZGUobm9kZS5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2goLi4udGhpcy5wcm9jZXNzb3IuaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMobm9kZSwgcGFydC5uYW1lLCBwYXJ0LnN0cmluZ3MsIHRoaXMub3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ0VQb2x5ZmlsbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRvcHROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIGN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1pbnN0YW5jZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJvdW5kQXR0cmlidXRlU3VmZml4LCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LCBtYXJrZXIsIG5vZGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIGBodG1sYCwgd2hpY2ggaG9sZHMgYSBUZW1wbGF0ZSBhbmQgdGhlIHZhbHVlcyBmcm9tXG4gKiBpbnRlcnBvbGF0ZWQgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RyaW5ncywgdmFsdWVzLCB0eXBlLCBwcm9jZXNzb3IpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIEhUTUwgdXNlZCB0byBjcmVhdGUgYSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAgICAgKi9cbiAgICBnZXRIVE1MKCkge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5zdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIGxldCBpc0NvbW1lbnRCaW5kaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5zdHJpbmdzW2ldO1xuICAgICAgICAgICAgLy8gRm9yIGVhY2ggYmluZGluZyB3ZSB3YW50IHRvIGRldGVybWluZSB0aGUga2luZCBvZiBtYXJrZXIgdG8gaW5zZXJ0XG4gICAgICAgICAgICAvLyBpbnRvIHRoZSB0ZW1wbGF0ZSBzb3VyY2UgYmVmb3JlIGl0J3MgcGFyc2VkIGJ5IHRoZSBicm93c2VyJ3MgSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBUaGUgbWFya2VyIHR5cGUgaXMgYmFzZWQgb24gd2hldGhlciB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhblxuICAgICAgICAgICAgLy8gYXR0cmlidXRlLCB0ZXh0LCBvciBjb21tZW50IHBvaXNpdGlvbi5cbiAgICAgICAgICAgIC8vICAgKiBGb3Igbm9kZS1wb3NpdGlvbiBiaW5kaW5ncyB3ZSBpbnNlcnQgYSBjb21tZW50IHdpdGggdGhlIG1hcmtlclxuICAgICAgICAgICAgLy8gICAgIHNlbnRpbmVsIGFzIGl0cyB0ZXh0IGNvbnRlbnQsIGxpa2UgPCEtLXt7bGl0LWd1aWR9fS0tPi5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgYXR0cmlidXRlIGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgZm9yIHRoZVxuICAgICAgICAgICAgLy8gICAgIGZpcnN0IGJpbmRpbmcsIHNvIHRoYXQgd2Ugc3VwcG9ydCB1bnF1b3RlZCBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gICAgICAgICAgICAvLyAgICAgU3Vic2VxdWVudCBiaW5kaW5ncyBjYW4gdXNlIGEgY29tbWVudCBtYXJrZXIgYmVjYXVzZSBtdWx0aS1iaW5kaW5nXG4gICAgICAgICAgICAvLyAgICAgYXR0cmlidXRlcyBtdXN0IGJlIHF1b3RlZC5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgY29tbWVudCBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIHNvIHdlIGRvbid0XG4gICAgICAgICAgICAvLyAgICAgY2xvc2UgdGhlIGNvbW1lbnQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGJ1dCBpcyAqbm90KiBhbiBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFdlIGRvbid0IG5lZWQgdG8gdHJhY2sgdGhlIHRyZWUgc3RydWN0dXJlIG9mIHRoZSBIVE1MLCBvbmx5XG4gICAgICAgICAgICAvLyB3aGV0aGVyIGEgYmluZGluZyBpcyBpbnNpZGUgYSBjb21tZW50LCBhbmQgaWYgbm90LCBpZiBpdCBhcHBlYXJzIHRvIGJlXG4gICAgICAgICAgICAvLyB0aGUgZmlyc3QgYmluZGluZyBpbiBhbiBhdHRyaWJ1dGUuXG4gICAgICAgICAgICBjb25zdCBjb21tZW50T3BlbiA9IHMubGFzdEluZGV4T2YoJzwhLS0nKTtcbiAgICAgICAgICAgIC8vIFdlJ3JlIGluIGNvbW1lbnQgcG9zaXRpb24gaWYgd2UgaGF2ZSBhIGNvbW1lbnQgb3BlbiB3aXRoIG5vIGZvbGxvd2luZ1xuICAgICAgICAgICAgLy8gY29tbWVudCBjbG9zZS4gQmVjYXVzZSA8LS0gY2FuIGFwcGVhciBpbiBhbiBhdHRyaWJ1dGUgdmFsdWUgdGhlcmUgY2FuXG4gICAgICAgICAgICAvLyBiZSBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgICAgICAgICBpc0NvbW1lbnRCaW5kaW5nID0gKGNvbW1lbnRPcGVuID4gLTEgfHwgaXNDb21tZW50QmluZGluZykgJiZcbiAgICAgICAgICAgICAgICBzLmluZGV4T2YoJy0tPicsIGNvbW1lbnRPcGVuICsgMSkgPT09IC0xO1xuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UgcHJlY2VlZGluZyB0aGVcbiAgICAgICAgICAgIC8vIGV4cHJlc3Npb24uIFRoaXMgY2FuIG1hdGNoIFwibmFtZT12YWx1ZVwiIGxpa2Ugc3RydWN0dXJlcyBpbiB0ZXh0LFxuICAgICAgICAgICAgLy8gY29tbWVudHMsIGFuZCBhdHRyaWJ1dGUgdmFsdWVzLCBzbyB0aGVyZSBjYW4gYmUgZmFsc2UtcG9zaXRpdmVzLlxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBvbmx5IGluIHRoaXMgYnJhbmNoIGlmIHdlIGRvbid0IGhhdmUgYSBhdHRyaWJ1dGUtbGlrZVxuICAgICAgICAgICAgICAgIC8vIHByZWNlZWRpbmcgc2VxdWVuY2UuIEZvciBjb21tZW50cywgdGhpcyBndWFyZHMgYWdhaW5zdCB1bnVzdWFsXG4gICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlIHZhbHVlcyBsaWtlIDxkaXYgZm9vPVwiPCEtLSR7J2Jhcid9XCI+LiBDYXNlcyBsaWtlXG4gICAgICAgICAgICAgICAgLy8gPCEtLSBmb289JHsnYmFyJ30tLT4gYXJlIGhhbmRsZWQgY29ycmVjdGx5IGluIHRoZSBhdHRyaWJ1dGUgYnJhbmNoXG4gICAgICAgICAgICAgICAgLy8gYmVsb3cuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzICsgKGlzQ29tbWVudEJpbmRpbmcgPyBtYXJrZXIgOiBub2RlTWFya2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBhdHRyaWJ1dGVzIHdlIHVzZSBqdXN0IGEgbWFya2VyIHNlbnRpbmVsLCBhbmQgYWxzbyBhcHBlbmQgYVxuICAgICAgICAgICAgICAgIC8vICRsaXQkIHN1ZmZpeCB0byB0aGUgbmFtZSB0byBvcHQtb3V0IG9mIGF0dHJpYnV0ZS1zcGVjaWZpYyBwYXJzaW5nXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBJRSBhbmQgRWRnZSBkbyBmb3Igc3R5bGUgYW5kIGNlcnRhaW4gU1ZHIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzLnN1YnN0cigwLCBhdHRyaWJ1dGVNYXRjaC5pbmRleCkgKyBhdHRyaWJ1dGVNYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU1hdGNoWzJdICsgYm91bmRBdHRyaWJ1dGVTdWZmaXggKyBhdHRyaWJ1dGVNYXRjaFszXSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBodG1sICs9IHRoaXMuc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0aGlzLmdldEhUTUwoKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCBmb3IgU1ZHIGZyYWdtZW50cy5cbiAqXG4gKiBUaGlzIGNsYXNzIHdyYXBzIEhUTUwgaW4gYW4gYDxzdmc+YCB0YWcgaW4gb3JkZXIgdG8gcGFyc2UgaXRzIGNvbnRlbnRzIGluIHRoZVxuICogU1ZHIG5hbWVzcGFjZSwgdGhlbiBtb2RpZmllcyB0aGUgdGVtcGxhdGUgdG8gcmVtb3ZlIHRoZSBgPHN2Zz5gIHRhZyBzbyB0aGF0XG4gKiBjbG9uZXMgb25seSBjb250YWluZXIgdGhlIG9yaWdpbmFsIGZyYWdtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU1ZHVGVtcGxhdGVSZXN1bHQgZXh0ZW5kcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgcmV0dXJuIGA8c3ZnPiR7c3VwZXIuZ2V0SFRNTCgpfTwvc3ZnPmA7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBzdXBlci5nZXRUZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBjb250ZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoc3ZnRWxlbWVudCk7XG4gICAgICAgIHJlcGFyZW50Tm9kZXMoY29udGVudCwgc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLXJlc3VsdC5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9wYXJ0LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuaW1wb3J0IHsgY3JlYXRlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICEodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpKTtcbn07XG5leHBvcnQgY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSB8fFxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICEhKHZhbHVlICYmIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pO1xufTtcbi8qKlxuICogV3JpdGVzIGF0dHJpYnV0ZSB2YWx1ZXMgdG8gdGhlIERPTSBmb3IgYSBncm91cCBvZiBBdHRyaWJ1dGVQYXJ0cyBib3VuZCB0byBhXG4gKiBzaW5nbGUgYXR0aWJ1dGUuIFRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzXG4gKiBmb3IgYW4gYXR0cmlidXRlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydHNbaV0gPSB0aGlzLl9jcmVhdGVQYXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNpbmdsZSBwYXJ0LiBPdmVycmlkZSB0aGlzIHRvIGNyZWF0ZSBhIGRpZmZlcm50IHR5cGUgb2YgcGFydC5cbiAgICAgKi9cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG4gICAgICAgIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gcGFydC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQcmltaXRpdmUodikgfHwgIWlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogU3RyaW5nKHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0IG9mIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHQgPT09ICdzdHJpbmcnID8gdCA6IFN0cmluZyh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgdGhpcy5fZ2V0VmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGFsbCBvciBwYXJ0IG9mIGFuIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGNvbW1pdHRlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNvbW1pdHRlciA9IGNvbW1pdHRlcjtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBub0NoYW5nZSAmJiAoIWlzUHJpbWl0aXZlKHZhbHVlKSB8fCB2YWx1ZSAhPT0gdGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhIG5vdCBhIGRpcmVjdGl2ZSwgZGlydHkgdGhlIGNvbW1pdHRlciBzbyB0aGF0IGl0J2xsXG4gICAgICAgICAgICAvLyBjYWxsIHNldEF0dHJpYnV0ZS4gSWYgdGhlIHZhbHVlIGlzIGEgZGlyZWN0aXZlLCBpdCdsbCBkaXJ0eSB0aGVcbiAgICAgICAgICAgIC8vIGNvbW1pdHRlciBpZiBpdCBjYWxscyBzZXRWYWx1ZSgpLlxuICAgICAgICAgICAgaWYgKCFpc0RpcmVjdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1pdHRlci5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21taXR0ZXIuY29tbWl0KCk7XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhIGxvY2F0aW9uIHdpdGhpbiBhIE5vZGUgdHJlZS4gTGlrZSBhIFJhbmdlLCBOb2RlUGFydFxuICogaGFzIHN0YXJ0IGFuZCBlbmQgbG9jYXRpb25zIGFuZCBjYW4gc2V0IGFuZCB1cGRhdGUgdGhlIE5vZGVzIGJldHdlZW4gdGhvc2VcbiAqIGxvY2F0aW9ucy5cbiAqXG4gKiBOb2RlUGFydHMgc3VwcG9ydCBzZXZlcmFsIHZhbHVlIHR5cGVzOiBwcmltaXRpdmVzLCBOb2RlcywgVGVtcGxhdGVSZXN1bHRzLFxuICogYXMgd2VsbCBhcyBhcnJheXMgYW5kIGl0ZXJhYmxlcyBvZiB0aG9zZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvKGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IGNvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBub2RlIChiZXR3ZWVuIGByZWZgIGFuZCBgcmVmYCdzIG5leHRcbiAgICAgKiBzaWJsaW5nKS4gQm90aCBgcmVmYCBhbmQgaXRzIG5leHQgc2libGluZyBtdXN0IGJlIHN0YXRpYywgdW5jaGFuZ2luZyBub2Rlc1xuICAgICAqIHN1Y2ggYXMgdGhvc2UgdGhhdCBhcHBlYXIgaW4gYSBsaXRlcmFsIHNlY3Rpb24gb2YgYSB0ZW1wbGF0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyTm9kZShyZWYpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSByZWY7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5uZXh0U2libGluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIHBhcmVudCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50b1BhcnQocGFydCkge1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICBwYXJ0Ll9faW5zZXJ0KHRoaXMuZW5kTm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlclBhcnQocmVmKSB7XG4gICAgICAgIHJlZi5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLmVuZE5vZGU7XG4gICAgICAgIHJlZi5lbmROb2RlID0gdGhpcy5zdGFydE5vZGU7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub3RoaW5nO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2luc2VydChub2RlKSB7XG4gICAgICAgIHRoaXMuZW5kTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbiAgICBfX2NvbW1pdE5vZGUodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLl9faW5zZXJ0KHZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfX2NvbW1pdFRleHQodmFsdWUpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuc3RhcnROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xuICAgICAgICAvLyBJZiBgdmFsdWVgIGlzbid0IGFscmVhZHkgYSBzdHJpbmcsIHdlIGV4cGxpY2l0bHkgY29udmVydCBpdCBoZXJlIGluIGNhc2VcbiAgICAgICAgLy8gaXQgY2FuJ3QgYmUgaW1wbGljaXRseSBjb252ZXJ0ZWQgLSBpLmUuIGl0J3MgYSBzeW1ib2wuXG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgICBpZiAobm9kZSA9PT0gdGhpcy5lbmROb2RlLnByZXZpb3VzU2libGluZyAmJlxuICAgICAgICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIHRleHQgbm9kZSBiZXR3ZWVuIHRoZSBtYXJrZXJzLCB3ZSBjYW4ganVzdFxuICAgICAgICAgICAgLy8gc2V0IGl0cyB2YWx1ZSwgcmF0aGVyIHRoYW4gcmVwbGFjaW5nIGl0LlxuICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogQ2FuIHdlIGp1c3QgY2hlY2sgaWYgdGhpcy52YWx1ZSBpcyBwcmltaXRpdmU/XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZUFzU3RyaW5nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWVBc1N0cmluZykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZUZhY3RvcnkodmFsdWUpO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlSW5zdGFuY2UgJiZcbiAgICAgICAgICAgIHRoaXMudmFsdWUudGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHByb3BhZ2F0ZSB0aGUgdGVtcGxhdGUgcHJvY2Vzc29yIGZyb20gdGhlIFRlbXBsYXRlUmVzdWx0XG4gICAgICAgICAgICAvLyBzbyB0aGF0IHdlIHVzZSBpdHMgc3ludGF4IGV4dGVuc2lvbiwgZXRjLiBUaGUgdGVtcGxhdGUgZmFjdG9yeSBjb21lc1xuICAgICAgICAgICAgLy8gZnJvbSB0aGUgcmVuZGVyIGZ1bmN0aW9uIG9wdGlvbnMgc28gdGhhdCBpdCBjYW4gY29udHJvbCB0ZW1wbGF0ZVxuICAgICAgICAgICAgLy8gY2FjaGluZyBhbmQgcHJlcHJvY2Vzc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUsIHZhbHVlLnByb2Nlc3NvciwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKCk7XG4gICAgICAgICAgICBpbnN0YW5jZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgICAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAgICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG4gICAgICAgIC8vIElmIF92YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgICAgICAvLyBpdGVyYWJsZSBhbmQgX3ZhbHVlIHdpbGwgY29udGFpbiB0aGUgTm9kZVBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlci4gSWYgX3ZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgICAgIC8vIGFycmF5IGZvciBOb2RlUGFydHMuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgICAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMudmFsdWU7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaXRlbVBhcnQ7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgICAgICBpZiAoaXRlbVBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0ID0gbmV3IE5vZGVQYXJ0KHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnRzLnB1c2goaXRlbVBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuYXBwZW5kSW50b1BhcnQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5pbnNlcnRBZnRlclBhcnQoaXRlbVBhcnRzW3BhcnRJbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtUGFydC5zZXRWYWx1ZShpdGVtKTtcbiAgICAgICAgICAgIGl0ZW1QYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKGl0ZW1QYXJ0ICYmIGl0ZW1QYXJ0LmVuZE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyKHN0YXJ0Tm9kZSA9IHRoaXMuc3RhcnROb2RlKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKHRoaXMuc3RhcnROb2RlLnBhcmVudE5vZGUsIHN0YXJ0Tm9kZS5uZXh0U2libGluZywgdGhpcy5lbmROb2RlKTtcbiAgICB9XG59XG4vKipcbiAqIEltcGxlbWVudHMgYSBib29sZWFuIGF0dHJpYnV0ZSwgcm91Z2hseSBhcyBkZWZpbmVkIGluIHRoZSBIVE1MXG4gKiBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIElmIHRoZSB2YWx1ZSBpcyB0cnV0aHksIHRoZW4gdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50IHdpdGggYSB2YWx1ZSBvZlxuICogJycuIElmIHRoZSB2YWx1ZSBpcyBmYWxzZXksIHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzdHJpbmdzLmxlbmd0aCAhPT0gMiB8fCBzdHJpbmdzWzBdICE9PSAnJyB8fCBzdHJpbmdzWzFdICE9PSAnJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb29sZWFuIGF0dHJpYnV0ZXMgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9ICEhdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG59XG4vKipcbiAqIFNldHMgYXR0cmlidXRlIHZhbHVlcyBmb3IgUHJvcGVydHlQYXJ0cywgc28gdGhhdCB0aGUgdmFsdWUgaXMgb25seSBzZXQgb25jZVxuICogZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHMgZm9yIGEgcHJvcGVydHkuXG4gKlxuICogSWYgYW4gZXhwcmVzc2lvbiBjb250cm9scyB0aGUgd2hvbGUgcHJvcGVydHkgdmFsdWUsIHRoZW4gdGhlIHZhbHVlIGlzIHNpbXBseVxuICogYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IHVuZGVyIGNvbnRyb2wuIElmIHRoZXJlIGFyZSBzdHJpbmcgbGl0ZXJhbHMgb3JcbiAqIG11bHRpcGxlIGV4cHJlc3Npb25zLCB0aGVuIHRoZSBzdHJpbmdzIGFyZSBleHByZXNzaW9ucyBhcmUgaW50ZXJwb2xhdGVkIGludG9cbiAqIGEgc3RyaW5nIGZpcnN0LlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlDb21taXR0ZXIgZXh0ZW5kcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHRoaXMuc2luZ2xlID1cbiAgICAgICAgICAgIChzdHJpbmdzLmxlbmd0aCA9PT0gMiAmJiBzdHJpbmdzWzBdID09PSAnJyAmJiBzdHJpbmdzWzFdID09PSAnJyk7XG4gICAgfVxuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5UGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5zaW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnRzWzBdLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0VmFsdWUoKTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMubmFtZV0gPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xufVxuLy8gRGV0ZWN0IGV2ZW50IGxpc3RlbmVyIG9wdGlvbnMgc3VwcG9ydC4gSWYgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eSBpcyByZWFkXG4vLyBmcm9tIHRoZSBvcHRpb25zIG9iamVjdCwgdGhlbiBvcHRpb25zIGFyZSBzdXBwb3J0ZWQuIElmIG5vdCwgdGhlbiB0aGUgdGhyaWRcbi8vIGFyZ3VtZW50IHRvIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlzIGludGVycHJldGVkIGFzIHRoZSBib29sZWFuIGNhcHR1cmVcbi8vIHZhbHVlIHNvIHdlIHNob3VsZCBvbmx5IHBhc3MgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eS5cbmxldCBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSBmYWxzZTtcbnRyeSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZ2V0IGNhcHR1cmUoKSB7XG4gICAgICAgICAgICBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbn1cbmNhdGNoIChfZSkge1xufVxuZXhwb3J0IGNsYXNzIEV2ZW50UGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgZXZlbnROYW1lLCBldmVudENvbnRleHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuZXZlbnRDb250ZXh0ID0gZXZlbnRDb250ZXh0O1xuICAgICAgICB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCA9IChlKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGUpO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0xpc3RlbmVyID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLnZhbHVlO1xuICAgICAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9IG5ld0xpc3RlbmVyID09IG51bGwgfHxcbiAgICAgICAgICAgIG9sZExpc3RlbmVyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAobmV3TGlzdGVuZXIuY2FwdHVyZSAhPT0gb2xkTGlzdGVuZXIuY2FwdHVyZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5vbmNlICE9PSBvbGRMaXN0ZW5lci5vbmNlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLnBhc3NpdmUgIT09IG9sZExpc3RlbmVyLnBhc3NpdmUpO1xuICAgICAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9IG5ld0xpc3RlbmVyICE9IG51bGwgJiYgKG9sZExpc3RlbmVyID09IG51bGwgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuICAgICAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaG91bGRBZGRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5fX29wdGlvbnMgPSBnZXRPcHRpb25zKG5ld0xpc3RlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fX29wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuY2FsbCh0aGlzLmV2ZW50Q29udGV4dCB8fCB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gV2UgY29weSBvcHRpb25zIGJlY2F1c2Ugb2YgdGhlIGluY29uc2lzdGVudCBiZWhhdmlvciBvZiBicm93c2VycyB3aGVuIHJlYWRpbmdcbi8vIHRoZSB0aGlyZCBhcmd1bWVudCBvZiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci4gSUUxMSBkb2Vzbid0IHN1cHBvcnQgb3B0aW9uc1xuLy8gYXQgYWxsLiBDaHJvbWUgNDEgb25seSByZWFkcyBgY2FwdHVyZWAgaWYgdGhlIGFyZ3VtZW50IGlzIGFuIG9iamVjdC5cbmNvbnN0IGdldE9wdGlvbnMgPSAobykgPT4gbyAmJlxuICAgIChldmVudE9wdGlvbnNTdXBwb3J0ZWQgP1xuICAgICAgICB7IGNhcHR1cmU6IG8uY2FwdHVyZSwgcGFzc2l2ZTogby5wYXNzaXZlLCBvbmNlOiBvLm9uY2UgfSA6XG4gICAgICAgIG8uY2FwdHVyZSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0cy5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciB9IGZyb20gJy4vcGFydHMuanMnO1xuLyoqXG4gKiBDcmVhdGVzIFBhcnRzIHdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3Ige1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYW4gYXR0cmlidXRlLXBvc2l0aW9uIGJpbmRpbmcsIGdpdmVuIHRoZSBldmVudCwgYXR0cmlidXRlXG4gICAgICogbmFtZSwgYW5kIHN0cmluZyBsaXRlcmFscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gbmFtZSAgVGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtIHN0cmluZ3MgVGhlIHN0cmluZyBsaXRlcmFscy4gVGhlcmUgYXJlIGFsd2F5cyBhdCBsZWFzdCB0d28gc3RyaW5ncyxcbiAgICAgKiAgIGV2ZW50IGZvciBmdWxseS1jb250cm9sbGVkIGJpbmRpbmdzIHdpdGggYSBzaW5nbGUgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBoYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IG5hbWVbMF07XG4gICAgICAgIGlmIChwcmVmaXggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IFByb3BlcnR5Q29tbWl0dGVyKGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnQCcpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEV2ZW50UGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBvcHRpb25zLmV2ZW50Q29udGV4dCldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICc/Jykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgQm9vbGVhbkF0dHJpYnV0ZVBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBBdHRyaWJ1dGVDb21taXR0ZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYSB0ZXh0LXBvc2l0aW9uIGJpbmRpbmcuXG4gICAgICogQHBhcmFtIHRlbXBsYXRlRmFjdG9yeVxuICAgICAqL1xuICAgIGhhbmRsZVRleHRFeHByZXNzaW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlUGFydChvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yID0gbmV3IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgbWFya2VyLCBUZW1wbGF0ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBUaGUgZGVmYXVsdCBUZW1wbGF0ZUZhY3Rvcnkgd2hpY2ggY2FjaGVzIFRlbXBsYXRlcyBrZXllZCBvblxuICogcmVzdWx0LnR5cGUgYW5kIHJlc3VsdC5zdHJpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVGYWN0b3J5KHJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZUNhY2hlID0gdGVtcGxhdGVDYWNoZXMuZ2V0KHJlc3VsdC50eXBlKTtcbiAgICBpZiAodGVtcGxhdGVDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUgPSB7XG4gICAgICAgICAgICBzdHJpbmdzQXJyYXk6IG5ldyBXZWFrTWFwKCksXG4gICAgICAgICAgICBrZXlTdHJpbmc6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlcy5zZXQocmVzdWx0LnR5cGUsIHRlbXBsYXRlQ2FjaGUpO1xuICAgIH1cbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFRlbXBsYXRlU3RyaW5nc0FycmF5IGlzIG5ldywgZ2VuZXJhdGUgYSBrZXkgZnJvbSB0aGUgc3RyaW5nc1xuICAgIC8vIFRoaXMga2V5IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXMgd2l0aCBpZGVudGljYWwgY29udGVudFxuICAgIGNvbnN0IGtleSA9IHJlc3VsdC5zdHJpbmdzLmpvaW4obWFya2VyKTtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLmdldChrZXkpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm90IHNlZW4gdGhpcyBrZXkgYmVmb3JlLCBjcmVhdGUgYSBuZXcgVGVtcGxhdGVcbiAgICAgICAgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0LCByZXN1bHQuZ2V0VGVtcGxhdGVFbGVtZW50KCkpO1xuICAgICAgICAvLyBDYWNoZSB0aGUgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLnNldChrZXksIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLy8gQ2FjaGUgYWxsIGZ1dHVyZSBxdWVyaWVzIGZvciB0aGlzIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gICAgdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuc2V0KHJlc3VsdC5zdHJpbmdzLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xufVxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlQ2FjaGVzID0gbmV3IE1hcCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtZmFjdG9yeS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBOb2RlUGFydCB9IGZyb20gJy4vcGFydHMuanMnO1xuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCBjb25zdCBwYXJ0cyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIFJlbmRlcnMgYSB0ZW1wbGF0ZSByZXN1bHQgb3Igb3RoZXIgdmFsdWUgdG8gYSBjb250YWluZXIuXG4gKlxuICogVG8gdXBkYXRlIGEgY29udGFpbmVyIHdpdGggbmV3IHZhbHVlcywgcmVldmFsdWF0ZSB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBhbmRcbiAqIGNhbGwgYHJlbmRlcmAgd2l0aCB0aGUgbmV3IHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gcmVzdWx0IEFueSB2YWx1ZSByZW5kZXJhYmxlIGJ5IE5vZGVQYXJ0IC0gdHlwaWNhbGx5IGEgVGVtcGxhdGVSZXN1bHRcbiAqICAgICBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWcgbGlrZSBgaHRtbGAgb3IgYHN2Z2AuXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIHBhcmVudCB0byByZW5kZXIgdG8uIFRoZSBlbnRpcmUgY29udGVudHMgYXJlIGVpdGhlclxuICogICAgIHJlcGxhY2VkLCBvciBlZmZpY2llbnRseSB1cGRhdGVkIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhcyBwcmV2aW91c1xuICogICAgIHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgUmVuZGVyT3B0aW9ucyBmb3IgdGhlIGVudGlyZSByZW5kZXIgdHJlZSByZW5kZXJlZCB0byB0aGlzXG4gKiAgICAgY29udGFpbmVyLiBSZW5kZXIgb3B0aW9ucyBtdXN0ICpub3QqIGNoYW5nZSBiZXR3ZWVuIHJlbmRlcnMgdG8gdGhlIHNhbWVcbiAqICAgICBjb250YWluZXIsIGFzIHRob3NlIGNoYW5nZXMgd2lsbCBub3QgZWZmZWN0IHByZXZpb3VzbHkgcmVuZGVyZWQgRE9NLlxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKHJlc3VsdCwgY29udGFpbmVyLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IHBhcnQgPSBwYXJ0cy5nZXQoY29udGFpbmVyKTtcbiAgICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKGNvbnRhaW5lciwgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICBwYXJ0cy5zZXQoY29udGFpbmVyLCBwYXJ0ID0gbmV3IE5vZGVQYXJ0KE9iamVjdC5hc3NpZ24oeyB0ZW1wbGF0ZUZhY3RvcnkgfSwgb3B0aW9ucykpKTtcbiAgICAgICAgcGFydC5hcHBlbmRJbnRvKGNvbnRhaW5lcik7XG4gICAgfVxuICAgIHBhcnQuc2V0VmFsdWUocmVzdWx0KTtcbiAgICBwYXJ0LmNvbW1pdCgpO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqXG4gKiBNYWluIGxpdC1odG1sIG1vZHVsZS5cbiAqXG4gKiBNYWluIGV4cG9ydHM6XG4gKlxuICogLSAgW1todG1sXV1cbiAqIC0gIFtbc3ZnXV1cbiAqIC0gIFtbcmVuZGVyXV1cbiAqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKiBAcHJlZmVycmVkXG4gKi9cbi8qKlxuICogRG8gbm90IHJlbW92ZSB0aGlzIGNvbW1lbnQ7IGl0IGtlZXBzIHR5cGVkb2MgZnJvbSBtaXNwbGFjaW5nIHRoZSBtb2R1bGVcbiAqIGRvY3MuXG4gKi9cbmltcG9ydCB7IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmltcG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB9IGZyb20gJy4vbGliL2RlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzJztcbmV4cG9ydCB7IGRpcmVjdGl2ZSwgaXNEaXJlY3RpdmUgfSBmcm9tICcuL2xpYi9kaXJlY3RpdmUuanMnO1xuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogcmVtb3ZlIGxpbmUgd2hlbiB3ZSBnZXQgTm9kZVBhcnQgbW92aW5nIG1ldGhvZHNcbmV4cG9ydCB7IHJlbW92ZU5vZGVzLCByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9saWIvZG9tLmpzJztcbmV4cG9ydCB7IG5vQ2hhbmdlLCBub3RoaW5nIH0gZnJvbSAnLi9saWIvcGFydC5qcyc7XG5leHBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEF0dHJpYnV0ZVBhcnQsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIGlzSXRlcmFibGUsIGlzUHJpbWl0aXZlLCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIsIFByb3BlcnR5UGFydCB9IGZyb20gJy4vbGliL3BhcnRzLmpzJztcbmV4cG9ydCB7IHBhcnRzLCByZW5kZXIgfSBmcm9tICcuL2xpYi9yZW5kZXIuanMnO1xuZXhwb3J0IHsgdGVtcGxhdGVDYWNoZXMsIHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLWluc3RhbmNlLmpzJztcbmV4cG9ydCB7IFNWR1RlbXBsYXRlUmVzdWx0LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vbGliL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5leHBvcnQgeyBjcmVhdGVNYXJrZXIsIGlzVGVtcGxhdGVQYXJ0QWN0aXZlLCBUZW1wbGF0ZSB9IGZyb20gJy4vbGliL3RlbXBsYXRlLmpzJztcbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBpbmplY3QgdmVyc2lvbiBudW1iZXIgYXQgYnVpbGQgdGltZVxuKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gfHwgKHdpbmRvd1snbGl0SHRtbFZlcnNpb25zJ10gPSBbXSkpLnB1c2goJzEuMS4xJyk7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBTVkdUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdzdmcnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGl0LWh0bWwuanMubWFwIiwiLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHkgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlTWFwcGVyPFQgPSBhbnk+ID0gKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiBUIHwgbnVsbDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlNYXBwZXI8VCA9IGFueT4gPSAodmFsdWU6IFQgfCBudWxsKSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEFuIG9iamVjdCB0aGF0IGhvbGRzIGFuIHtAbGluayBBdHRyaWJ1dGVNYXBwZXJ9IGFuZCBhIHtAbGluayBQcm9wZXJ0eU1hcHBlcn1cbiAqXG4gKiBAcmVtYXJrc1xuICogRm9yIHRoZSBtb3N0IGNvbW1vbiB0eXBlcywgYSBjb252ZXJ0ZXIgZXhpc3RzIHdoaWNoIGNhbiBiZSByZWZlcmVuY2VkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBAcHJvcGVydHkoe1xuICogICAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ29udmVydGVyPFQgPSBhbnk+IHtcbiAgICB0b0F0dHJpYnV0ZTogUHJvcGVydHlNYXBwZXI8VD47XG4gICAgZnJvbUF0dHJpYnV0ZTogQXR0cmlidXRlTWFwcGVyPFQ+O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBjb252ZXJ0ZXJcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhpcyBjb252ZXJ0ZXIgaXMgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb252ZXJ0ZXIgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHVubGVzcyBhIGRpZmZlcmVudCBvbmVcbiAqIGlzIHNwZWNpZmllZC4gVGhlIGNvbnZlcnRlciB0cmllcyB0byBpbmZlciB0aGUgcHJvcGVydHkgdHlwZSB3aGVuIGNvbnZlcnRpbmcgdG8gYXR0cmlidXRlcyBhbmRcbiAqIHVzZXMgYEpTT04ucGFyc2UoKWAgd2hlbiBjb252ZXJ0aW5nIHN0cmluZ3MgZnJvbSBhdHRyaWJ1dGVzLiBJZiBgSlNPTi5wYXJzZSgpYCB0aHJvd3MgYW4gZXJyb3IsXG4gKiB0aGUgY29udmVydGVyIHdpbGwgdXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0OiBBdHRyaWJ1dGVDb252ZXJ0ZXIgPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCBzdWNjZXNzZnVsbHkgcGFyc2UgYGJvb2xlYW5gLCBgbnVtYmVyYCBhbmQgYEpTT04uc3RyaW5naWZ5YCdkIHZhbHVlc1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0IHRocm93cywgaXQgbWVhbnMgd2UncmUgcHJvYmFibHkgZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgfSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG51bWJlciwgYmlnaW50LCBzeW1ib2wsIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPGJvb2xlYW4+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlICE9PSBudWxsKSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBib29sZWFuIHwgbnVsbCkgPT4gdmFsdWUgPyAnJyA6IG51bGxcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPHN0cmluZz4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwpID8gbnVsbCA6IHZhbHVlLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZhbHVlXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxudW1iZXI+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiBOdW1iZXIodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBudW1iZXIgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck9iamVjdDogQXR0cmlidXRlQ29udmVydGVyPG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnlbXT4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnlbXSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGF0ZTogQXR0cmlidXRlQ29udmVydGVyPERhdGU+ID0ge1xuICAgIC8vIGBuZXcgRGF0ZSgpYCB3aWxsIHJldHVybiBhbiBgSW52YWxpZCBEYXRlYCBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IG5ldyBEYXRlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogRGF0ZSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufVxuIiwiY29uc3QgRklSU1QgPSAvXlteXS87XG5jb25zdCBTUEFDRVMgPSAvXFxzKyhbXFxTXSkvZztcbmNvbnN0IENBTUVMUyA9IC9bYS16XShbQS1aXSkvZztcbmNvbnN0IEtFQkFCUyA9IC8tKFthLXpdKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gS0VCQUJTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgS0VCQUJTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5jYXBpdGFsaXplKHN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZWJhYkNhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gQ0FNRUxTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1swXVswXSArICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBDQU1FTFMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcudG9Mb3dlckNhc2UoKSA6IHN0cmluZztcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXIsIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQgfSBmcm9tICcuL2F0dHJpYnV0ZS1jb252ZXJ0ZXInO1xuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnLi91dGlscy9zdHJpbmctdXRpbHMnO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHlcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIGRpc3BhdGNoIGEgY3VzdG9tIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU5vdGlmaWVyPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYHRydWVgIGlmIHRoZSBgb2xkVmFsdWVgIGFuZCB0aGUgYG5ld1ZhbHVlYCBvZiBhIHByb3BlcnR5IGFyZSBkaWZmZXJlbnQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dHJpYnV0ZVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgQXR0cmlidXRlUmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgUHJvcGVydHlSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn1cbiAqXG4gKiBAcGFyYW0gbm90aWZpZXIgQSBub3RpZmllciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Tm90aWZpZXIgKG5vdGlmaWVyOiBhbnkpOiBub3RpZmllciBpcyBQcm9wZXJ0eU5vdGlmaWVyIHtcblxuICAgIHJldHVybiB0eXBlb2Ygbm90aWZpZXIgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gZGV0ZWN0b3IgQSBkZXRlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgKGRldGVjdG9yOiBhbnkpOiBkZXRlY3RvciBpcyBQcm9wZXJ0eUNoYW5nZURldGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgZGV0ZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlLZXl9XG4gKlxuICogQHBhcmFtIGtleSBBIHByb3BlcnR5IGtleSB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5S2V5IChrZXk6IGFueSk6IGtleSBpcyBQcm9wZXJ0eUtleSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGtleSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGtleSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIHN0cmluZyBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlIHJlbW92aW5nIGludmFsaWQgYXR0cmlidXRlIGNoYXJhY3RlcnNcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQSBzdHJpbmcgdG8gZW5jb2RlIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqIEByZXR1cm5zICAgICBBbiBlbmNvZGVkIHN0cmluZyB1c2FibGUgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUF0dHJpYnV0ZSAodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4ga2ViYWJDYXNlKHZhbHVlLnJlcGxhY2UoL1xcVysvZywgJy0nKS5yZXBsYWNlKC9cXC0kLywgJycpKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXR0cmlidXRlIG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBOdW1lcmljIHByb3BlcnR5IGluZGV4ZXMgb3Igc3ltYm9scyBjYW4gY29udGFpbiBpbnZhbGlkIGNoYXJhY3RlcnMgZm9yIGF0dHJpYnV0ZSBuYW1lcy4gVGhpcyBtZXRob2RcbiAqIHNhbml0aXplcyB0aG9zZSBjaGFyYWN0ZXJzIGFuZCByZXBsYWNlcyBzZXF1ZW5jZXMgb2YgaW52YWxpZCBjaGFyYWN0ZXJzIHdpdGggYSBkYXNoLlxuICogQXR0cmlidXRlIG5hbWVzIGFyZSBub3QgYWxsb3dlZCB0byBzdGFydCB3aXRoIG51bWJlcnMgZWl0aGVyIGFuZCBhcmUgcHJlZml4ZWQgd2l0aCAnYXR0ci0nLlxuICpcbiAqIE4uQi46IFdoZW4gdXNpbmcgY3VzdG9tIHN5bWJvbHMgYXMgcHJvcGVydHkga2V5cywgdXNlIHVuaXF1ZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzeW1ib2xzIHRvIGF2b2lkXG4gKiBjbGFzaGluZyBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgYSA9IFN5bWJvbCgpO1xuICogY29uc3QgYiA9IFN5bWJvbCgpO1xuICpcbiAqIGEgIT09IGI7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGEpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGIpOyAvLyBmYWxzZSAtLT4gJ2F0dHItc3ltYm9sJyA9PT0gJ2F0dHItc3ltYm9sJ1xuICpcbiAqIGNvbnN0IGMgPSBTeW1ib2woJ2MnKTtcbiAqIGNvbnN0IGQgPSBTeW1ib2woJ2QnKTtcbiAqXG4gKiBjICE9PSBkOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShjKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShkKTsgLy8gdHJ1ZSAtLT4gJ2F0dHItc3ltYm9sLWMnID09PSAnYXR0ci1zeW1ib2wtZCdcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgYXR0cmlidXRlIG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZU5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IHN0cmluZyB7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHJldHVybiBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgYXR0cmlidXRlIG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHJldHVybiBgYXR0ci0keyBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSkgfWA7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBldmVudCBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogRXZlbnQgbmFtZXMgZG9uJ3QgaGF2ZSB0aGUgc2FtZSByZXN0cmljdGlvbnMgYXMgYXR0cmlidXRlIG5hbWVzIHdoZW4gaXQgY29tZXMgdG8gaW52YWxpZFxuICogY2hhcmFjdGVycy4gSG93ZXZlciwgZm9yIGNvbnNpc3RlbmN5J3Mgc2FrZSwgd2UgYXBwbHkgdGhlIHNhbWUgcnVsZXMgZm9yIGV2ZW50IG5hbWVzIGFzXG4gKiBmb3IgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEBwYXJhbSBwcmVmaXggICAgICAgIEFuIG9wdGlvbmFsIHByZWZpeCwgZS5nLjogJ29uJ1xuICogQHBhcmFtIHN1ZmZpeCAgICAgICAgQW4gb3B0aW9uYWwgc3VmZml4LCBlLmcuOiAnY2hhbmdlZCdcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgZXZlbnQgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnROYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHByZWZpeD86IHN0cmluZywgc3VmZml4Pzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBwcm9wZXJ0eVN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBldmVudCBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7IHByZWZpeCA/IGAkeyBrZWJhYkNhc2UocHJlZml4KSB9LWAgOiAnJyB9JHsgcHJvcGVydHlTdHJpbmcgfSR7IHN1ZmZpeCA/IGAtJHsga2ViYWJDYXNlKHN1ZmZpeCkgfWAgOiAnJyB9YDtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogRG9lcyBwcm9wZXJ0eSBoYXZlIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBObyBhdHRyaWJ1dGUgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBUaGUgYXR0cmlidXRlIG5hbWUgd2lsbCBiZSBpbmZlcnJlZCBieSBjYW1lbC1jYXNpbmcgdGhlIHByb3BlcnR5IG5hbWVcbiAgICAgKiAqIGBzdHJpbmdgOiBVc2UgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgYXR0cmlidXRlOiBib29sZWFuIHwgc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9taXplIHRoZSBjb252ZXJzaW9uIG9mIHZhbHVlcyBiZXR3ZWVuIHByb3BlcnR5IGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDb252ZXJ0ZXJzIGFyZSBvbmx5IHVzZWQgd2hlbiB7QGxpbmsgcmVmbGVjdFByb3BlcnR5fSBhbmQvb3Ige0BsaW5rIHJlZmxlY3RBdHRyaWJ1dGV9IGFyZSBzZXQgdG8gdHJ1ZS5cbiAgICAgKiBJZiBjdXN0b20gcmVmbGVjdG9ycyBhcmUgdXNlZCwgdGhleSBoYXZlIHRvIHRha2UgY2FyZSBvciBjb252ZXJ0aW5nIHRoZSBwcm9wZXJ0eS9hdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZToge0BsaW5rIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHR9XG4gICAgICovXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI7XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlJ3MgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgYXR0cmlidXRlIHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgYXR0cmlidXRlIGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBwcm9wZXJ0eSB1c2luZyB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgYXR0cmlidXRlIHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIHByb3BlcnR5IHZhbHVlIGJlIGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogVGhlIHByb3BlcnR5IHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgcHJvcGVydHkgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIHVzaW5nIHRoZSBkZWZhdWx0IHByb3BlcnR5IHJlZmxlY3RvclxuICAgICAqICogYFByb3BlcnR5S2V5YDogQSBtZXRob2Qgb24gdGhlIGNvbXBvbmVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIHByb3BlcnR5IHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdFByb3BlcnR5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5UmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGEgcHJvcGVydHkgdmFsdWUgY2hhbmdlIHJhaXNlIGEgY3VzdG9tIGV2ZW50P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBjcmVhdGUgYSBjdXN0b20gZXZlbnQgZm9yIHRoaXMgcHJvcGVydHlcbiAgICAgKiAqIGB0cnVlYDogQ3JlYXRlIGN1c3RvbSBldmVudHMgZm9yIHRoaXMgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYFByb3BlcnR5S2V5YDogVXNlIHRoZSBtZXRob2Qgd2l0aCB0aGlzIHByb3BlcnR5IGtleSBvbiB0aGUgY29tcG9uZW50IHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzXG4gICAgICogKiBgRnVuY3Rpb25gOiBVc2UgdGhlIHRoZSBwcm92aWRlZCBmdW5jdGlvbiB0byBjcmVhdGUgY3VzdG9tIGV2ZW50cyAoYHRoaXNgIGNvbnRleHQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGluc3RhbmNlKVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgbm90aWZ5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5Tm90aWZpZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgaG93IGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgbW9uaXRvcmVkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEJ5IGRlZmF1bHQgYSBkZWNvcmF0ZWQgcHJvcGVydHkgd2lsbCBiZSBvYnNlcnZlZCBmb3IgY2hhbmdlcyAodGhyb3VnaCBhIGN1c3RvbSBzZXR0ZXIgZm9yIHRoZSBwcm9wZXJ0eSkuXG4gICAgICogQW55IGBzZXRgLW9wZXJhdGlvbiBvZiB0aGlzIHByb3BlcnR5IHdpbGwgdGhlcmVmb3JlIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYW5kIGluaXRpYXRlXG4gICAgICogYSByZW5kZXIgYXMgd2VsbCBhcyByZWZsZWN0aW9uIGFuZCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBvYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSAodGhpcyB3aWxsIGJ5cGFzcyByZW5kZXIsIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbilcbiAgICAgKiAqIGB0cnVlYDogT2JzZXJ2ZSBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgdXNpbmcgdGhlIHtAbGluayBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUn1cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgcHJvdmlkZWQgbWV0aG9kIHRvIGNoZWNrIGlmIHByb3BlcnR5IHZhbHVlIGhhcyBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWAgKHVzZXMge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfSBpbnRlcm5hbGx5KVxuICAgICAqL1xuICAgIG9ic2VydmU6IGJvb2xlYW4gfCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICpcbiAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gKiBAcmV0dXJucyAgICAgICAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2VkXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUjogUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB7XG4gICAgLy8gaW4gY2FzZSBgb2xkVmFsdWVgIGFuZCBgbmV3VmFsdWVgIGFyZSBgTmFOYCwgYChOYU4gIT09IE5hTilgIHJldHVybnMgYHRydWVgLFxuICAgIC8vIGJ1dCBgKE5hTiA9PT0gTmFOIHx8IE5hTiA9PT0gTmFOKWAgcmV0dXJucyBgZmFsc2VgXG4gICAgcmV0dXJuIG9sZFZhbHVlICE9PSBuZXdWYWx1ZSAmJiAob2xkVmFsdWUgPT09IG9sZFZhbHVlIHx8IG5ld1ZhbHVlID09PSBuZXdWYWx1ZSk7XG59O1xuXG4vLyBUT0RPOiBtYXliZSBwcm92aWRlIGZsYXQgYXJyYXkvb2JqZWN0IGNoYW5nZSBkZXRlY3Rvcj8gZGF0ZSBjaGFuZ2UgZGV0ZWN0b3I/XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OOiBQcm9wZXJ0eURlY2xhcmF0aW9uID0ge1xuICAgIGF0dHJpYnV0ZTogdHJ1ZSxcbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQsXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogdHJ1ZSxcbiAgICByZWZsZWN0UHJvcGVydHk6IHRydWUsXG4gICAgbm90aWZ5OiB0cnVlLFxuICAgIG9ic2VydmU6IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SLFxufTtcbiIsImltcG9ydCB7IHJlbmRlciwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBMaXN0ZW5lckRlY2xhcmF0aW9uIH0gZnJvbSAnLi9kZWNvcmF0b3JzL2xpc3RlbmVyJztcbmltcG9ydCB7IEF0dHJpYnV0ZVJlZmxlY3RvciwgY3JlYXRlRXZlbnROYW1lLCBpc0F0dHJpYnV0ZVJlZmxlY3RvciwgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yLCBpc1Byb3BlcnR5S2V5LCBpc1Byb3BlcnR5Tm90aWZpZXIsIGlzUHJvcGVydHlSZWZsZWN0b3IsIFByb3BlcnR5RGVjbGFyYXRpb24sIFByb3BlcnR5Tm90aWZpZXIsIFByb3BlcnR5UmVmbGVjdG9yIH0gZnJvbSBcIi4vZGVjb3JhdG9ycy9wcm9wZXJ0eS1kZWNsYXJhdGlvblwiO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SID0gKGF0dHJpYnV0ZVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgYXR0cmlidXRlIHJlZmxlY3RvciAkeyBTdHJpbmcoYXR0cmlidXRlUmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SID0gKHByb3BlcnR5UmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSByZWZsZWN0b3IgJHsgU3RyaW5nKHByb3BlcnR5UmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IgPSAocHJvcGVydHlOb3RpZmllcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgbm90aWZpZXIgJHsgU3RyaW5nKHByb3BlcnR5Tm90aWZpZXIpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBDSEFOR0VfREVURUNUT1JfRVJST1IgPSAoY2hhbmdlRGV0ZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvciAkeyBTdHJpbmcoY2hhbmdlRGV0ZWN0b3IpIH0uYCk7XG5cbi8qKlxuICogRXh0ZW5kcyB0aGUgc3RhdGljIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSB0byBpbmNsdWRlIHRoZSBib3VuZCBsaXN0ZW5lclxuICogZm9yIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5pbnRlcmZhY2UgSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uIGV4dGVuZHMgTGlzdGVuZXJEZWNsYXJhdGlvbiB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYm91bmQgbGlzdGVuZXIgd2lsbCBiZSBzdG9yZWQgaGVyZSwgc28gaXQgY2FuIGJlIHJlbW92ZWQgaXQgbGF0ZXJcbiAgICAgKi9cbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBldmVudCB0YXJnZXQgd2lsbCBhbHdheXMgYmUgcmVzb2x2ZWQgdG8gYW4gYWN0dWFsIHtAbGluayBFdmVudFRhcmdldH1cbiAgICAgKi9cbiAgICB0YXJnZXQ6IEV2ZW50VGFyZ2V0O1xufVxuXG4vKipcbiAqIEEgdHlwZSBmb3IgcHJvcGVydHkgY2hhbmdlcywgYXMgdXNlZCBpbiAke0BsaW5rIENvbXBvbmVudC51cGRhdGVDYWxsYmFja31cbiAqL1xuZXhwb3J0IHR5cGUgQ2hhbmdlcyA9IE1hcDxQcm9wZXJ0eUtleSwgYW55PjtcblxuLyoqXG4gKiBUaGUgY29tcG9uZW50IGJhc2UgY2xhc3NcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBjYWNoZWQge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdHlsZVNoZWV0OiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBDU1NTdHlsZVNoZWV0fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGVuIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJlIGF2YWlsYWJsZSwgdGhpcyBnZXR0ZXIgd2lsbCBjcmVhdGUgYSB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKiBpbnN0YW5jZSBhbmQgY2FjaGUgaXQgZm9yIHVzZSB3aXRoIGVhY2ggaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0IHN0eWxlU2hlZXQgKCk6IENTU1N0eWxlU2hlZXQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZVNoZWV0JykpIHtcblxuICAgICAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHN0eWxlIHNoZWV0IGFuZCBjYWNoZSBpdCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgd29yayBvbmNlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJyaXZlXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9jb25zdHJ1Y3Qtc3R5bGVzaGVldHMvXG4gICAgICAgICAgICAgICAgdGhpcy5fc3R5bGVTaGVldCA9IG5ldyBDU1NTdHlsZVNoZWV0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3R5bGVTaGVldC5yZXBsYWNlU3luYyh0aGlzLnN0eWxlcy5qb2luKCdcXG4nKSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHlsZVNoZWV0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBjYWNoZWQge0BsaW5rIEhUTUxTdHlsZUVsZW1lbnR9IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdHlsZUVsZW1lbnQ6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mge0BsaW5rIEhUTUxTdHlsZUVsZW1lbnR9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIEhUTUxTdHlsZUVsZW1lbnR9IG5vZGUgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoXG4gICAgICogaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0IHN0eWxlRWxlbWVudCAoKTogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxlbmd0aCAmJiAhdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX3N0eWxlRWxlbWVudCcpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQudGl0bGUgPSB0aGlzLnNlbGVjdG9yO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5zdHlsZXMuam9pbignXFxuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIGF0dHJpYnV0ZSBuYW1lcyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0eSBrZXlzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiBwcm9wZXJ0eSBrZXkgdGhhdCBiZWxvbmdzIHRvIGFuIGF0dHJpYnV0ZSBuYW1lLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIGF0dHJpYnV0ZXM6IE1hcDxzdHJpbmcsIFByb3BlcnR5S2V5PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gb2YgYSBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBwcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIFByb3BlcnR5RGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSBvZiBhIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBsaXN0ZW5lcnM6IE1hcDxQcm9wZXJ0eUtleSwgTGlzdGVuZXJEZWNsYXJhdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc2VsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBvdmVycmlkZGVuIGJ5IHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc2VsZWN0b3JgIG9wdGlvbiwgaWYgcHJvdmlkZWQuXG4gICAgICogT3RoZXJ3aXNlIHRoZSBkZWNvcmF0b3Igd2lsbCB1c2UgdGhpcyBwcm9wZXJ0eSB0byBkZWZpbmUgdGhlIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2VsZWN0b3I6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFVzZSBTaGFkb3cgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgc2V0IGJ5IHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc2hhZG93YCBvcHRpb24gKGRlZmF1bHRzIHRvIGB0cnVlYCkuXG4gICAgICovXG4gICAgc3RhdGljIHNoYWRvdzogYm9vbGVhbjtcblxuICAgIC8vIFRPRE86IGNyZWF0ZSB0ZXN0cyBmb3Igc3R5bGUgaW5oZXJpdGFuY2VcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENhbiBiZSBzZXQgdGhyb3VnaCB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHN0eWxlc2Agb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogU3R5bGVzIHNldCBpbiB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqIFRoaXMgYWxsb3dzIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50IGFuZCBhZGQgYWRkaXRpb25hbCBzdHlsZXMgb24gdGhlIGNoaWxkIGNvbXBvbmVudC5cbiAgICAgKiBJbiBvcmRlciB0byBpbmhlcml0IHN0eWxlcyBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCwgYW4gZXhwbGljaXQgc3VwZXIgY2FsbCBoYXMgdG8gYmUgaW5jbHVkZWQuIEJ5XG4gICAgICogZGVmYXVsdCBubyBzdHlsZXMgYXJlIGluaGVyaXRlZC5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIE15QmFzZUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKTogc3RyaW5nW10ge1xuICAgICAqXG4gICAgICogICAgICAgICAgcmV0dXJuIFtcbiAgICAgKiAgICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAqICAgICAgICAgICAgICAnOmhvc3QgeyBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjsgfSdcbiAgICAgKiAgICAgICAgICBdO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgdGVtcGxhdGVgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHVuZGVmaW5lZGApLlxuICAgICAqIElmIHNldCBpbiB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yLCBpdCB3aWxsIGhhdmUgcHJlY2VkZW5jZSBvdmVyIHRoZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50ICAgVGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBoZWxwZXJzICAgQW55IGFkZGl0aW9uYWwgcHJvcGVydGllcyB3aGljaCBzaG91bGQgZXhpc3QgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgc3RhdGljIHRlbXBsYXRlPzogKGVsZW1lbnQ6IGFueSwgLi4uaGVscGVyczogYW55W10pID0+IFRlbXBsYXRlUmVzdWx0IHwgdm9pZDtcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRvIHNwZWNpZnkgYXR0cmlidXRlcyB3aGljaCBzaG91bGQgYmUgb2JzZXJ2ZWQsIGJ1dCBkb24ndCBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtcbiAgICAgKiBGb3IgcHJvcGVydGllcyB3aGljaCBhcmUgZGVjb3JhdGVkIHdpdGggdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGVcbiAgICAgKiBpcyBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgYW5kIGRvZXMgbm90IG5lZWQgdG8gYmUgc3BlY2lmaWVkIGhlcmUuIEZvdCBhdHRyaWJ1dGVzIHRoYXQgZG9uJ3RcbiAgICAgKiBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHksIHJldHVybiB0aGUgYXR0cmlidXRlIG5hbWVzIGluIHRoaXMgZ2V0dGVyLiBDaGFuZ2VzIHRvIHRoZXNlXG4gICAgICogYXR0cmlidXRlcyBjYW4gYmUgaGFuZGxlZCBpbiB0aGUge0BsaW5rIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja30gbWV0aG9kLlxuICAgICAqXG4gICAgICogV2hlbiBleHRlbmRpbmcgY29tcG9uZW50cywgbWFrZSBzdXJlIHRvIHJldHVybiB0aGUgc3VwZXIgY2xhc3MncyBvYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgKiBpZiB5b3Ugb3ZlcnJpZGUgdGhpcyBnZXR0ZXIgKGV4Y2VwdCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IG9ic2VydmVkIGF0dHJpYnV0ZXMpOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gWy4uLnN1cGVyLm9ic2VydmVkQXR0cmlidXRlcywgJ215LWFkZGl0aW9uYWwtYXR0cmlidXRlJ107XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdXBkYXRlUmVxdWVzdDogUHJvbWlzZTxib29sZWFuPiA9IFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY2hhbmdlZFByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdGluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5aW5nUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW5lckRlY2xhcmF0aW9uczogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uW10gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzVXBkYXRlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaXNSZWZsZWN0aW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlbmRlclJvb3Q6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yICguLi5hcmdzOiBhbnlbXSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJSb290ID0gdGhpcy5fY3JlYXRlUmVuZGVyUm9vdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgbW92ZWQgdG8gYSBuZXcgZG9jdW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGFkb3B0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdhZG9wdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIGRvY3VtZW50J3MgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fdW5saXN0ZW4oKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Rpc2Nvbm5lY3RlZCcpO1xuXG4gICAgICAgIHRoaXMuX2hhc1VwZGF0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSBvbmUgb2YgdGhlIGNvbXBvbmVudCdzIGF0dHJpYnV0ZXMgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hpY2ggYXR0cmlidXRlcyB0byBub3RpY2UgY2hhbmdlIGZvciBpcyBzcGVjaWZpZWQgaW4ge0BsaW5rIG9ic2VydmVkQXR0cmlidXRlc30uXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBGb3IgZGVjb3JhdGVkIHByb3BlcnRpZXMgd2l0aCBhbiBhc3NvY2lhdGVkIGF0dHJpYnV0ZSwgdGhpcyBpcyBoYW5kbGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiB0byBjdXN0b21pemUgdGhlIGhhbmRsaW5nIG9mIGF0dHJpYnV0ZSBjaGFuZ2VzLiBXaGVuIG92ZXJyaWRpbmdcbiAgICAgKiB0aGlzIG1ldGhvZCwgYSBzdXBlci1jYWxsIHNob3VsZCBiZSBpbmNsdWRlZCwgdG8gZW5zdXJlIGF0dHJpYnV0ZSBjaGFuZ2VzIGZvciBkZWNvcmF0ZWQgcHJvcGVydGllc1xuICAgICAqIGFyZSBwcm9jZXNzZWQgY29ycmVjdGx5LlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICAgICAqXG4gICAgICogICAgICAgICAgc3VwZXIuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgKlxuICAgICAqICAgICAgICAgIC8vIGRvIGN1c3RvbSBoYW5kbGluZy4uLlxuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGUgVGhlIG5hbWUgb2YgdGhlIGNoYW5nZWQgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayAoYXR0cmlidXRlOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1JlZmxlY3RpbmcgfHwgb2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yZWZsZWN0QXR0cmlidXRlKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IHVwZGF0ZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIGB1cGRhdGVDYWxsYmFja2AgaXMgaW52b2tlZCBzeW5jaHJvbm91c2x5IGJ5IHRoZSB7QGxpbmsgdXBkYXRlfSBtZXRob2QgYW5kIHRoZXJlZm9yZSBoYXBwZW5zIGRpcmVjdGx5IGFmdGVyXG4gICAgICogcmVuZGVyaW5nLCBwcm9wZXJ0eSByZWZsZWN0aW9uIGFuZCBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnRzLlxuICAgICAqXG4gICAgICogTi5CLjogQ2hhbmdlcyBtYWRlIHRvIHByb3BlcnRpZXMgb3IgYXR0cmlidXRlcyBpbnNpZGUgdGhpcyBjYWxsYmFjayAqd29uJ3QqIGNhdXNlIGFub3RoZXIgdXBkYXRlLlxuICAgICAqIFRvIGNhdXNlIGFuIHVwZGF0ZSwgZGVmZXIgY2hhbmdlcyB3aXRoIHRoZSBoZWxwIG9mIGEgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuICAgICAqXG4gICAgICogICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICogICAgICAgICAgICAgIC8vIHBlcmZvcm0gY2hhbmdlcyB3aGljaCBuZWVkIHRvIGNhdXNlIGFub3RoZXIgdXBkYXRlIGhlcmVcbiAgICAgKiAgICAgICAgICB9KTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgICAgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlZCBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIGZpcnN0VXBkYXRlICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhpcyB3YXMgdGhlIGZpcnN0IHVwZGF0ZVxuICAgICAqL1xuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikgeyB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIGN1c3RvbSBldmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvQ3VzdG9tRXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudE5hbWUgQW4gZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSBldmVudEluaXQgQSB7QGxpbmsgQ3VzdG9tRXZlbnRJbml0fSBkaWN0aW9uYXJ5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeSAoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50SW5pdD86IEN1c3RvbUV2ZW50SW5pdCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBldmVudEluaXQpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaCBwcm9wZXJ0eSBjaGFuZ2VzIG9jY3VycmluZyBpbiB0aGUgZXhlY3V0b3IgYW5kIHJhaXNlIGN1c3RvbSBldmVudHNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUHJvcGVydHkgY2hhbmdlcyBzaG91bGQgdHJpZ2dlciBjdXN0b20gZXZlbnRzIHdoZW4gdGhleSBhcmUgY2F1c2VkIGJ5IGludGVybmFsIHN0YXRlIGNoYW5nZXMsXG4gICAgICogYnV0IG5vdCBpZiB0aGV5IGFyZSBjYXVzZWQgYnkgYSBjb25zdW1lciBvZiB0aGUgY29tcG9uZW50IEFQSSBkaXJlY3RseSwgZS5nLjpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdteS1jdXN0b20tZWxlbWVudCcpLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiBgYGAuXG4gICAgICpcbiAgICAgKiBUaGlzIG1lYW5zLCB3ZSBjYW5ub3QgYXV0b21hdGUgdGhpcyBwcm9jZXNzIHRocm91Z2ggcHJvcGVydHkgc2V0dGVycywgYXMgd2UgY2FuJ3QgYmUgc3VyZSB3aG9cbiAgICAgKiBpbnZva2VkIHRoZSBzZXR0ZXIgLSBpbnRlcm5hbCBjYWxscyBvciBleHRlcm5hbCBjYWxscy5cbiAgICAgKlxuICAgICAqIE9uZSBvcHRpb24gaXMgdG8gbWFudWFsbHkgcmFpc2UgdGhlIGV2ZW50LCB3aGljaCBjYW4gYmVjb21lIHRlZGlvdXMgYW5kIGZvcmNlcyB1cyB0byB1c2Ugc3RyaW5nLVxuICAgICAqIGJhc2VkIGV2ZW50IG5hbWVzIG9yIHByb3BlcnR5IG5hbWVzLCB3aGljaCBhcmUgZGlmZmljdWx0IHRvIHJlZmFjdG9yLCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIC8vIGlmIHdlIHJlZmFjdG9yIHRoZSBwcm9wZXJ0eSBuYW1lLCB3ZSBjYW4gZWFzaWx5IG1pc3MgdGhlIG5vdGlmeSBjYWxsXG4gICAgICogdGhpcy5ub3RpZnkoJ2N1c3RvbVByb3BlcnR5Jyk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBBIG1vcmUgY29udmVuaWVudCB3YXkgaXMgdG8gZXhlY3V0ZSB0aGUgaW50ZXJuYWwgY2hhbmdlcyBpbiBhIHdyYXBwZXIgd2hpY2ggY2FuIGRldGVjdCB0aGUgY2hhbmdlZFxuICAgICAqIHByb3BlcnRpZXMgYW5kIHdpbGwgYXV0b21hdGljYWxseSByYWlzZSB0aGUgcmVxdWlyZWQgZXZlbnRzLiBUaGlzIGVsaW1pbmF0ZXMgdGhlIG5lZWQgdG8gbWFudWFsbHlcbiAgICAgKiByYWlzZSBldmVudHMgYW5kIHJlZmFjdG9yaW5nIGRvZXMgbm8gbG9uZ2VyIGFmZmVjdCB0aGUgcHJvY2Vzcy5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiB0aGlzLndhdGNoKCgpID0+IHtcbiAgICAgKlxuICAgICAqICAgICAgdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogICAgICAvLyB3ZSBjYW4gYWRkIG1vcmUgcHJvcGVydHkgbW9kaWZpY2F0aW9ucyB0byBub3RpZnkgaW4gaGVyZVxuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGV4ZWN1dG9yIEEgZnVuY3Rpb24gdGhhdCBwZXJmb3JtcyB0aGUgY2hhbmdlcyB3aGljaCBzaG91bGQgYmUgbm90aWZpZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgd2F0Y2ggKGV4ZWN1dG9yOiAoKSA9PiB2b2lkKSB7XG5cbiAgICAgICAgLy8gYmFjayB1cCBjdXJyZW50IGNoYW5nZWQgcHJvcGVydGllc1xuICAgICAgICBjb25zdCBwcmV2aW91c0NoYW5nZXMgPSBuZXcgTWFwKHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKTtcblxuICAgICAgICAvLyBleGVjdXRlIHRoZSBjaGFuZ2VzXG4gICAgICAgIGV4ZWN1dG9yKCk7XG5cbiAgICAgICAgLy8gYWRkIGFsbCBuZXcgb3IgdXBkYXRlZCBjaGFuZ2VkIHByb3BlcnRpZXMgdG8gdGhlIG5vdGlmeWluZyBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciAoY29uc3QgW3Byb3BlcnR5S2V5LCBvbGRWYWx1ZV0gb2YgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpIHtcblxuICAgICAgICAgICAgY29uc3QgYWRkZWQgPSAhcHJldmlvdXNDaGFuZ2VzLmhhcyhwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gIWFkZGVkICYmIHRoaXMuaGFzQ2hhbmdlZChwcm9wZXJ0eUtleSwgcHJldmlvdXNDaGFuZ2VzLmdldChwcm9wZXJ0eUtleSksIG9sZFZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKGFkZGVkIHx8IHVwZGF0ZWQpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIHZhbHVlIG9mIGEgZGVjb3JhdGVkIHByb3BlcnR5IG9yIGl0cyBhc3NvY2lhdGVkXG4gICAgICogYXR0cmlidXRlIGNoYW5nZXMuIElmIHlvdSBuZWVkIHRoZSBjb21wb25lbnQgdG8gdXBkYXRlIGJhc2VkIG9uIGEgc3RhdGUgY2hhbmdlIHRoYXQgaXNcbiAgICAgKiBub3QgY292ZXJlZCBieSBhIGRlY29yYXRlZCBwcm9wZXJ0eSwgY2FsbCB0aGlzIG1ldGhvZCB3aXRob3V0IGFueSBhcmd1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBwcm9wZXJ0eSB0aGF0IHJlcXVlc3RzIHRoZSB1cGRhdGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgdGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEByZXR1cm5zICAgICAgICAgICAgIEEgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCB3aGVuIHRoZSB1cGRhdGUgaXMgY29tcGxldGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlcXVlc3RVcGRhdGUgKHByb3BlcnR5S2V5PzogUHJvcGVydHlLZXksIG9sZFZhbHVlPzogYW55LCBuZXdWYWx1ZT86IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eUtleSkge1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259J3Mgb2JzZXJ2ZSBvcHRpb24gaXMgYGZhbHNlYCwge0BsaW5rIGhhc0NoYW5nZWR9XG4gICAgICAgICAgICAvLyB3aWxsIHJldHVybiBgZmFsc2VgIGFuZCBubyB1cGRhdGUgd2lsbCBiZSByZXF1ZXN0ZWRcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpKSByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAgICAgLy8gc3RvcmUgY2hhbmdlZCBwcm9wZXJ0eSBmb3IgYmF0Y2ggcHJvY2Vzc2luZ1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBpbiByZWZsZWN0aW5nIHN0YXRlLCBhbiBhdHRyaWJ1dGUgaXMgcmVmbGVjdGluZyB0byB0aGlzIHByb3BlcnR5IGFuZCB3ZVxuICAgICAgICAgICAgLy8gY2FuIHNraXAgcmVmbGVjdGluZyB0aGUgcHJvcGVydHkgYmFjayB0byB0aGUgYXR0cmlidXRlXG4gICAgICAgICAgICAvLyBwcm9wZXJ0eSBjaGFuZ2VzIG5lZWQgdG8gYmUgdHJhY2tlZCBob3dldmVyIGFuZCB7QGxpbmsgcmVuZGVyfSBtdXN0IGJlIGNhbGxlZCBhZnRlclxuICAgICAgICAgICAgLy8gdGhlIGF0dHJpYnV0ZSBjaGFuZ2UgaXMgcmVmbGVjdGVkIHRvIHRoaXMgcHJvcGVydHlcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNSZWZsZWN0aW5nKSB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGVucXVldWUgdXBkYXRlIHJlcXVlc3QgaWYgbm9uZSB3YXMgZW5xdWV1ZWQgYWxyZWFkeVxuICAgICAgICAgICAgdGhpcy5fZW5xdWV1ZVVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUgdG8gaXRzIHtAbGluayByZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBVc2VzIGxpdC1odG1sJ3Mge0BsaW5rIGxpdC1odG1sI3JlbmRlcn0gbWV0aG9kIHRvIHJlbmRlciBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0gdG8gdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIHJvb3QuIFRoZSBjb21wb25lbnQgaW5zdGFuY2Ugd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHN0YXRpYyB0ZW1wbGF0ZSBtZXRob2RcbiAgICAgKiBhdXRvbWF0aWNhbGx5LiBUbyBtYWtlIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhdmFpbGFibGUgdG8gdGhlIHRlbXBsYXRlIG1ldGhvZCwgeW91IGNhbiBwYXNzIHRoZW0gdG8gdGhlXG4gICAgICogcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBjb25zdCBkYXRlRm9ybWF0dGVyID0gKGRhdGU6IERhdGUpID0+IHsgLy8gcmV0dXJuIHNvbWUgZGF0ZSB0cmFuc2Zvcm1hdGlvbi4uLlxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCcsXG4gICAgICogICAgICB0ZW1wbGF0ZTogKGVsZW1lbnQsIGZvcm1hdERhdGUpID0+IGh0bWxgPHNwYW4+TGFzdCB1cGRhdGVkOiAkeyBmb3JtYXREYXRlKGVsZW1lbnQubGFzdFVwZGF0ZWQpIH08L3NwYW4+YFxuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgQHByb3BlcnR5KClcbiAgICAgKiAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAqXG4gICAgICogICAgICByZW5kZXIgKCkge1xuICAgICAqICAgICAgICAgIC8vIG1ha2UgdGhlIGRhdGUgZm9ybWF0dGVyIGF2YWlsYWJsZSBpbiB0aGUgdGVtcGxhdGUgYnkgcGFzc2luZyBpdCB0byByZW5kZXIoKVxuICAgICAqICAgICAgICAgIHN1cGVyLnJlbmRlcihkYXRlRm9ybWF0dGVyKTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaGVscGVycyAgIEFueSBhZGRpdGlvbmFsIG9iamVjdHMgd2hpY2ggc2hvdWxkIGJlIGF2YWlsYWJsZSBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICguLi5oZWxwZXJzOiBhbnlbXSkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gY29uc3RydWN0b3IudGVtcGxhdGUgJiYgY29uc3RydWN0b3IudGVtcGxhdGUodGhpcywgLi4uaGVscGVycyk7XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlKSByZW5kZXIodGVtcGxhdGUsIHRoaXMucmVuZGVyUm9vdCwgeyBldmVudENvbnRleHQ6IHRoaXMgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgY29tcG9uZW50IGFmdGVyIGFuIHVwZGF0ZSB3YXMgcmVxdWVzdGVkIHdpdGgge0BsaW5rIHJlcXVlc3RVcGRhdGV9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIHJlbmRlcnMgdGhlIHRlbXBsYXRlLCByZWZsZWN0cyBjaGFuZ2VkIHByb3BlcnRpZXMgdG8gYXR0cmlidXRlcyBhbmRcbiAgICAgKiBkaXNwYXRjaGVzIGNoYW5nZSBldmVudHMgZm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uLlxuICAgICAqIFRvIGhhbmRsZSB1cGRhdGVzIGRpZmZlcmVudGx5LCB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBhbmQgYSBtYXAgb2YgcHJvcGVydHlcbiAgICAgKiBjaGFuZ2VzIGlzIHByb3ZpZGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5nZXMgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlZCBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZSAoY2hhbmdlcz86IENoYW5nZXMpIHtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgIC8vIHJlZmxlY3QgYWxsIHByb3BlcnRpZXMgbWFya2VkIGZvciByZWZsZWN0aW9uXG4gICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzLmZvckVhY2goKG9sZFZhbHVlOiBhbnksIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLnJlZmxlY3RQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgQ29tcG9uZW50XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG5vdGlmeSBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvblxuICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLmZvckVhY2goKG9sZFZhbHVlLCBwcm9wZXJ0eUtleSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDb21wb25lbnRdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSBwcm9wZXJ0eSBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIHJlc29sdmVzIHRoZSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn0gZm9yIHRoZSBwcm9wZXJ0eSBhbmQgcmV0dXJucyBpdHMgcmVzdWx0LlxuICAgICAqIElmIG5vbmUgaXMgZGVmaW5lZCAodGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uJ3MgYG9ic2VydmVgIG9wdGlvbiBpcyBgZmFsc2VgKSBpdCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gY2hlY2tcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEByZXR1cm5zICAgICAgICAgICAgIGB0cnVlYCBpZiB0aGUgcHJvcGVydHkgY2hhbmdlZCwgYGZhbHNlYCBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGFzQ2hhbmdlZCAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KTogYm9vbGVhbiB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gb2JzZXJ2ZSBpcyBlaXRoZXIgYGZhbHNlYCBvciBhIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKSkge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUuY2FsbChudWxsLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgdGhyb3cgQ0hBTkdFX0RFVEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IGZvciBhIGRlY29yYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5IFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHdoaWNoIHRvIHJldHJpZXZlIHRoZSBkZWNsYXJhdGlvblxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQcm9wZXJ0eURlY2xhcmF0aW9uIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBQcm9wZXJ0eURlY2xhcmF0aW9uIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBhc3NvY2lhdGVkIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSByZWZsZWN0b3IuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiByZWZsZWN0b3Ige0BsaW5rIF9yZWZsZWN0QXR0cmlidXRlfS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlTmFtZSBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0QXR0cmlidXRlIChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSk7XG5cbiAgICAgICAgLy8gaWdub3JlIHVzZXItZGVmaW5lZCBvYnNlcnZlZCBhdHRyaWJ1dGVzXG4gICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBhbmQgcmVtb3ZlIHRoZSBsb2dcbiAgICAgICAgaWYgKCFwcm9wZXJ0eUtleSkge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgb2JzZXJ2ZWQgYXR0cmlidXRlIFwiJHsgYXR0cmlidXRlTmFtZSB9XCIgbm90IGZvdW5kLi4uIGlnbm9yaW5nLi4uYCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBkb24ndCByZWZsZWN0IGlmIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGV9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzQXR0cmlidXRlUmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZS5jYWxsKHRoaXMsIGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGVdIGFzIEF0dHJpYnV0ZVJlZmxlY3RvcikoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGEgcHJvcGVydHkgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSByZWZsZWN0b3IuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiByZWZsZWN0b3Ige0BsaW5rIF9yZWZsZWN0UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBkb24ndCByZWZsZWN0IGlmIHtAbGluayBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpIHtcblxuICAgICAgICAgICAgLy8gYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIGlzIGNhbGxlZCBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gY2F0Y2ggdGhlIHN0YXRlIHRoZXJlXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eVJlZmxlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eV0gYXMgUHJvcGVydHlSZWZsZWN0b3IpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSYWlzZSBhbiBldmVudCBmb3IgYSBwcm9wZXJ0eSBjaGFuZ2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eU5vdGlmaWVyfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgbm90aWZpZXIuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiBub3RpZmllciB7QGxpbmsgX25vdGlmeVByb3BlcnR5fS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmFpc2UgYW4gZXZlbnQgZm9yXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSB7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5Tm90aWZpZXIocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeS5jYWxsKHRoaXMsIHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5XSBhcyBQcm9wZXJ0eU5vdGlmaWVyKShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeVByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgY29tcG9uZW50J3MgcmVuZGVyIHJvb3RcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHJlbmRlciByb290IGlzIHdoZXJlIHRoZSB7QGxpbmsgcmVuZGVyfSBtZXRob2Qgd2lsbCBhdHRhY2ggaXRzIERPTSBvdXRwdXQuIFdoZW4gdXNpbmcgdGhlIGNvbXBvbmVudFxuICAgICAqIHdpdGggc2hhZG93IG1vZGUsIGl0IHdpbGwgYmUgYSB7QGxpbmsgU2hhZG93Um9vdH0sIG90aGVyd2lzZSBpdCB3aWxsIGJlIHRoZSBjb21wb25lbnQgaXRzZWxmLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jcmVhdGVSZW5kZXJSb290ICgpOiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCB7XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnNoYWRvd1xuICAgICAgICAgICAgPyB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KVxuICAgICAgICAgICAgOiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGNvbXBvbmVudCdzIHN0eWxlcyB0byBpdHMge0BsaW5rIHJlbmRlclJvb3R9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJlIGF2YWlsYWJsZSwgdGhlIGNvbXBvbmVudCdzIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZSB3aWxsIGJlIGFkb3B0ZWRcbiAgICAgKiBieSB0aGUge0BsaW5rIFNoYWRvd1Jvb3R9LiBJZiBub3QsIGEgc3R5bGUgZWxlbWVudCBpcyBjcmVhdGVkIGFuZCBhdHRhY2hlZCB0byB0aGUge0BsaW5rIFNoYWRvd1Jvb3R9LiBJZiB0aGVcbiAgICAgKiBjb21wb25lbnQgaXMgbm90IHVzaW5nIHNoYWRvdyBtb2RlLCBhIHNjcmlwdCB0YWcgd2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQncyBgPGhlYWQ+YC4gRm9yIG11bHRpcGxlXG4gICAgICogaW5zdGFuY2VzIG9mIHRoZSBzYW1lIGNvbXBvbmVudCBvbmx5IG9uZSBzdHlsZXNoZWV0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9hZG9wdFN0eWxlcyAoKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG4gICAgICAgIGNvbnN0IHN0eWxlU2hlZXQgPSBjb25zdHJ1Y3Rvci5zdHlsZVNoZWV0O1xuICAgICAgICBjb25zdCBzdHlsZUVsZW1lbnQgPSBjb25zdHJ1Y3Rvci5zdHlsZUVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IGNvbnN0cnVjdG9yLnN0eWxlcztcblxuICAgICAgICBpZiAoc3R5bGVTaGVldCkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB0ZXN0IHRoaXMgcGFydCBvbmNlIHdlIGhhdmUgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyAoQ2hyb21lIDczKVxuICAgICAgICAgICAgaWYgKCFjb25zdHJ1Y3Rvci5zaGFkb3cpIHtcblxuICAgICAgICAgICAgICAgIGlmICgoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cy5pbmNsdWRlcyhzdHlsZVNoZWV0KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIC4uLihkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCB3b3JrIG9uY2UgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcnJpdmVcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL3dpY2cuZ2l0aHViLmlvL2NvbnN0cnVjdC1zdHlsZXNoZWV0cy9cbiAgICAgICAgICAgICAgICAodGhpcy5yZW5kZXJSb290IGFzIFNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtzdHlsZVNoZWV0XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKHN0eWxlRWxlbWVudCkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB0ZXN0IHdlIGRvbid0IGR1cGxpY2F0ZSBzdHlsZXNoZWV0cyBmb3Igbm9uLXNoYWRvdyBlbGVtZW50c1xuICAgICAgICAgICAgY29uc3Qgc3R5bGVBbHJlYWR5QWRkZWQgPSBjb25zdHJ1Y3Rvci5zaGFkb3dcbiAgICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICAgICAgOiBBcnJheS5mcm9tKGRvY3VtZW50LnN0eWxlU2hlZXRzKS5maW5kKHN0eWxlID0+IHN0eWxlLnRpdGxlID09PSBjb25zdHJ1Y3Rvci5zZWxlY3RvcikgJiYgdHJ1ZSB8fCBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHN0eWxlQWxyZWFkeUFkZGVkKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIGNsb25lIHRoZSBjYWNoZWQgc3R5bGUgZWxlbWVudFxuICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSBzdHlsZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29uc3RydWN0b3Iuc2hhZG93KSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb3QuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGlzIGRlZmluZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSB0aGlzXG4gICAgICogbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCB0aGUgYXR0cmlidXRlIHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0QXR0cmlidXRlIChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlEZWNsYXJhdGlvbi5jb252ZXJ0ZXIuZnJvbUF0dHJpYnV0ZShuZXdWYWx1ZSk7XG5cbiAgICAgICAgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiB0aGlzXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGhhdmUgYSBkZWNsYXJhdGlvblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gaWYgdGhlIGRlZmF1bHQgcmVmbGVjdG9yIGlzIHVzZWQsIHdlIG5lZWQgdG8gY2hlY2sgaWYgYW4gYXR0cmlidXRlIGZvciB0aGlzIHByb3BlcnR5IGV4aXN0c1xuICAgICAgICAvLyBpZiBub3QsIHdlIHdvbid0IHJlZmxlY3RcbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlY2xhcmF0aW9uLmF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHksIGl0J3MgYSBzdHJpbmdcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlIGFzIHN0cmluZztcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci50b0F0dHJpYnV0ZShuZXdWYWx1ZSk7XG5cbiAgICAgICAgLy8gdW5kZWZpbmVkIG1lYW5zIGRvbid0IGNoYW5nZVxuICAgICAgICBpZiAoYXR0cmlidXRlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVsbCBtZWFucyByZW1vdmUgdGhlIGF0dHJpYnV0ZVxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIHByb3BlcnR5LWNoYW5nZWQgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KTogdm9pZCB7XG5cbiAgICAgICAgY29uc3QgZXZlbnROYW1lID0gY3JlYXRlRXZlbnROYW1lKHByb3BlcnR5S2V5LCAnJywgJ2NoYW5nZWQnKTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eUtleSxcbiAgICAgICAgICAgICAgICBwcmV2aW91czogb2xkVmFsdWUsXG4gICAgICAgICAgICAgICAgY3VycmVudDogbmV3VmFsdWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBsaWZlY3ljbGUgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBsaWZlY3ljbGUgVGhlIGxpZmVjeWNsZSBmb3Igd2hpY2ggdG8gcmFpc2UgdGhlIGV2ZW50ICh3aWxsIGJlIHRoZSBldmVudCBuYW1lKVxuICAgICAqIEBwYXJhbSBkZXRhaWwgICAgT3B0aW9uYWwgZXZlbnQgZGV0YWlsc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlMaWZlY3ljbGUgKGxpZmVjeWNsZTogJ2Fkb3B0ZWQnIHwgJ2Nvbm5lY3RlZCcgfCAnZGlzY29ubmVjdGVkJyB8ICd1cGRhdGUnLCBkZXRhaWw/OiBvYmplY3QpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGxpZmVjeWNsZSwge1xuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICAuLi4oZGV0YWlsID8geyBkZXRhaWw6IGRldGFpbCB9IDoge30pXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGNvbXBvbmVudCBsaXN0ZW5lcnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbGlzdGVuICgpIHtcblxuICAgICAgICAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5saXN0ZW5lcnMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIGxpc3RlbmVyKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlRGVjbGFyYXRpb246IEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbiA9IHtcblxuICAgICAgICAgICAgICAgIC8vIGNvcHkgdGhlIGNsYXNzJ3Mgc3RhdGljIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGludG8gYW4gaW5zdGFuY2UgbGlzdGVuZXIgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICBldmVudDogZGVjbGFyYXRpb24uZXZlbnQsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZGVjbGFyYXRpb24ub3B0aW9ucyxcblxuICAgICAgICAgICAgICAgIC8vIGJpbmQgdGhlIGNvbXBvbmVudHMgbGlzdGVuZXIgbWV0aG9kIHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYW5kIHN0b3JlIGl0IGluIHRoZSBpbnN0YW5jZSBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGxpc3RlbmVyOiAodGhpc1tsaXN0ZW5lciBhcyBrZXlvZiB0aGlzXSBhcyB1bmtub3duIGFzIEV2ZW50TGlzdGVuZXIpLmJpbmQodGhpcyksXG5cbiAgICAgICAgICAgICAgICAvLyBkZXRlcm1pbmUgdGhlIGV2ZW50IHRhcmdldCBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAoZGVjbGFyYXRpb24udGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICA/ICh0eXBlb2YgZGVjbGFyYXRpb24udGFyZ2V0ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBkZWNsYXJhdGlvbi50YXJnZXQuY2FsbCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBkZWNsYXJhdGlvbi50YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgOiB0aGlzXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBhZGQgdGhlIGJvdW5kIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSB0YXJnZXRcbiAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24udGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi5ldmVudCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi5saXN0ZW5lcixcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBzYXZlIHRoZSBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvbiBpbiB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5wdXNoKGluc3RhbmNlRGVjbGFyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF91bmxpc3RlbiAoKSB7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJEZWNsYXJhdGlvbnMuZm9yRWFjaCgoZGVjbGFyYXRpb24pID0+IHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24udGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24uZXZlbnQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLm9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbnF1ZXVlIGEgcmVxdWVzdCBmb3IgYW4gYXN5bmNocm9ub3VzIHVwZGF0ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9lbnF1ZXVlVXBkYXRlICgpIHtcblxuICAgICAgICBsZXQgcmVzb2x2ZTogKHJlc3VsdDogYm9vbGVhbikgPT4gdm9pZDtcblxuICAgICAgICBjb25zdCBwcmV2aW91c1JlcXVlc3QgPSB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuXG4gICAgICAgIC8vIG1hcmsgdGhlIGNvbXBvbmVudCBhcyBoYXZpbmcgcmVxdWVzdGVkIGFuIHVwZGF0ZSwgdGhlIHtAbGluayBfcmVxdWVzdFVwZGF0ZX1cbiAgICAgICAgLy8gbWV0aG9kIHdpbGwgbm90IGVucXVldWUgYSBmdXJ0aGVyIHJlcXVlc3QgZm9yIHVwZGF0ZSBpZiBvbmUgaXMgc2NoZWR1bGVkXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlUmVxdWVzdCA9IG5ldyBQcm9taXNlPGJvb2xlYW4+KHJlcyA9PiByZXNvbHZlID0gcmVzKTtcblxuICAgICAgICAvLyB3YWl0IGZvciB0aGUgcHJldmlvdXMgdXBkYXRlIHRvIHJlc29sdmVcbiAgICAgICAgLy8gYGF3YWl0YCBpcyBhc3luY2hyb25vdXMgYW5kIHdpbGwgcmV0dXJuIGV4ZWN1dGlvbiB0byB0aGUge0BsaW5rIHJlcXVlc3RVcGRhdGV9IG1ldGhvZFxuICAgICAgICAvLyBhbmQgZXNzZW50aWFsbHkgYWxsb3dzIHVzIHRvIGJhdGNoIG11bHRpcGxlIHN5bmNocm9ub3VzIHByb3BlcnR5IGNoYW5nZXMsIGJlZm9yZSB0aGVcbiAgICAgICAgLy8gZXhlY3V0aW9uIGNhbiByZXN1bWUgaGVyZVxuICAgICAgICBhd2FpdCBwcmV2aW91c1JlcXVlc3Q7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fc2NoZWR1bGVVcGRhdGUoKTtcblxuICAgICAgICAvLyB0aGUgYWN0dWFsIHVwZGF0ZSBtYXkgYmUgc2NoZWR1bGVkIGFzeW5jaHJvbm91c2x5IGFzIHdlbGxcbiAgICAgICAgaWYgKHJlc3VsdCkgYXdhaXQgcmVzdWx0O1xuXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIG5ldyB7QGxpbmsgX3VwZGF0ZVJlcXVlc3R9IGFmdGVyIHRoZSByZXN1bHQgb2YgdGhlIGN1cnJlbnQgdXBkYXRlIHJlc29sdmVzXG4gICAgICAgIHJlc29sdmUhKCF0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNjaGVkdWxlIHRoZSB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTY2hlZHVsZXMgdGhlIGZpcnN0IHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50IGFzIHNvb24gYXMgcG9zc2libGUgYW5kIGFsbCBjb25zZWN1dGl2ZSB1cGRhdGVzXG4gICAgICoganVzdCBiZWZvcmUgdGhlIG5leHQgZnJhbWUuIEluIHRoZSBsYXR0ZXIgY2FzZSBpdCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIGFmdGVyXG4gICAgICogdGhlIHVwZGF0ZSBpcyBkb25lLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zY2hlZHVsZVVwZGF0ZSAoKTogUHJvbWlzZTx2b2lkPiB8IHZvaWQge1xuXG4gICAgICAgIGlmICghdGhpcy5faGFzVXBkYXRlZCkge1xuXG4gICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gc2NoZWR1bGUgdGhlIHVwZGF0ZSB2aWEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHRvIGF2b2lkIG11bHRpcGxlIHJlZHJhd3MgcGVyIGZyYW1lXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSB0aGUgY29tcG9uZW50IHVwZGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJbnZva2VzIHtAbGluayB1cGRhdGVDYWxsYmFja30gYWZ0ZXIgcGVyZm9ybWluZyB0aGUgdXBkYXRlIGFuZCBjbGVhbnMgdXAgdGhlIGNvbXBvbmVudFxuICAgICAqIHN0YXRlLiBEdXJpbmcgdGhlIGZpcnN0IHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlcyB3aWxsIGJlIGFkZGVkLiBEaXNwYXRjaGVzIHRoZSB1cGRhdGVcbiAgICAgKiBsaWZlY3ljbGUgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3BlcmZvcm1VcGRhdGUgKCkge1xuXG4gICAgICAgIC8vIHdlIGhhdmUgdG8gd2FpdCB1bnRpbCB0aGUgY29tcG9uZW50IGlzIGNvbm5lY3RlZCBiZWZvcmUgd2UgY2FuIGRvIGFueSB1cGRhdGVzXG4gICAgICAgIC8vIHRoZSB7QGxpbmsgY29ubmVjdGVkQ2FsbGJhY2t9IHdpbGwgY2FsbCB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gaW4gYW55IGNhc2UsIHNvIHdlIGNhblxuICAgICAgICAvLyBzaW1wbHkgYnlwYXNzIGFueSBhY3R1YWwgdXBkYXRlIGFuZCBjbGVhbi11cCB1bnRpbCB0aGVuXG4gICAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZXMgPSBuZXcgTWFwKHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgLy8gcGFzcyBhIGNvcHkgb2YgdGhlIHByb3BlcnR5IGNoYW5nZXMgdG8gdGhlIHVwZGF0ZSBtZXRob2QsIHNvIHByb3BlcnR5IGNoYW5nZXNcbiAgICAgICAgICAgIC8vIGFyZSBhdmFpbGFibGUgaW4gYW4gb3ZlcnJpZGRlbiB1cGRhdGUgbWV0aG9kXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShjaGFuZ2VzKTtcblxuICAgICAgICAgICAgLy8gcmVzZXQgcHJvcGVydHkgbWFwcyBkaXJlY3RseSBhZnRlciB0aGUgdXBkYXRlLCBzbyBjaGFuZ2VzIGR1cmluZyB0aGUgdXBkYXRlQ2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGNhbiBiZSByZWNvcmRlZCBmb3IgdGhlIG5leHQgdXBkYXRlLCB3aGljaCBoYXMgdG8gYmUgdHJpZ2dlcmVkIG1hbnVhbGx5IHRob3VnaFxuICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgIC8vIGluIHRoZSBmaXJzdCB1cGRhdGUgd2UgYWRvcHQgdGhlIGVsZW1lbnQncyBzdHlsZXMgYW5kIHNldCB1cCBkZWNsYXJlZCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIGlmICghdGhpcy5faGFzVXBkYXRlZCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRvcHRTdHlsZXMoKTtcblxuICAgICAgICAgICAgICAgIC8vIGJpbmQgbGlzdGVuZXJzIGFmdGVyIHRoZSB1cGRhdGUsIHRoaXMgd2F5IHdlIGVuc3VyZSBhbGwgRE9NIGlzIHJlbmRlcmVkLCBhbGwgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgIC8vIGFyZSB1cC10by1kYXRlIGFuZCBhbnkgdXNlci1jcmVhdGVkIG9iamVjdHMgKGUuZy4gd29ya2Vycykgd2lsbCBiZSBjcmVhdGVkIGluIGFuXG4gICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGRlbiBjb25uZWN0ZWRDYWxsYmFja1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrKGNoYW5nZXMsICF0aGlzLl9oYXNVcGRhdGVkKTtcblxuICAgICAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCd1cGRhdGUnLCB7IGNoYW5nZXM6IGNoYW5nZXMsIGZpcnN0VXBkYXRlOiAhdGhpcy5faGFzVXBkYXRlZCB9KTtcblxuICAgICAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYXJrIGNvbXBvbmVudCBhcyB1cGRhdGVkICphZnRlciogdGhlIHVwZGF0ZSB0byBwcmV2ZW50IGluZmludGUgbG9vcHMgaW4gdGhlIHVwZGF0ZSBwcm9jZXNzXG4gICAgICAgIC8vIE4uQi46IGFueSBwcm9wZXJ0eSBjaGFuZ2VzIGR1cmluZyB0aGUgdXBkYXRlIHdpbGwgbm90IHRyaWdnZXIgYW5vdGhlciB1cGRhdGVcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlbGVjdG9yIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNlbGVjdG9yIHdpbGwgYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHdpdGggdGhlIGJyb3dzZXInc1xuICAgICAqIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQSS4gSWYgbm8gc2VsZWN0b3IgaXMgc3BlY2lmaWVkLCB0aGUgY29tcG9uZW50IGNsYXNzXG4gICAgICogbmVlZHMgdG8gcHJvdmlkZSBvbmUgaW4gaXRzIHN0YXRpYyB7QGxpbmsgQ29tcG9uZW50LnNlbGVjdG9yfSBwcm9wZXJ0eS5cbiAgICAgKiBBIHNlbGVjdG9yIGRlZmluZWQgaW4gdGhlIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn0gd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGVcbiAgICAgKiBzdGF0aWMgY2xhc3MgcHJvcGVydHkuXG4gICAgICovXG4gICAgc2VsZWN0b3I6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTSB0byByZW5kZXIgdGhlIGNvbXBvbmVudHMgdGVtcGxhdGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNoYWRvdyBET00gY2FuIGJlIGRpc2FibGVkIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYCwgaW4gd2hpY2ggY2FzZSB0aGVcbiAgICAgKiBjb21wb25lbnQncyB0ZW1wbGF0ZSB3aWxsIGJlIHJlbmRlcmVkIGFzIGNoaWxkIG5vZGVzIG9mIHRoZSBjb21wb25lbnQuIFRoaXMgY2FuIGJlXG4gICAgICogdXNlZnVsIGlmIGFuIGlzb2xhdGVkIERPTSBhbmQgc2NvcGVkIENTUyBpcyBub3QgZGVzaXJlZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHNoYWRvdzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBBdXRvbWF0aWNhbGx5IHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgYnJvd3NlcidzIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQST9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW4gY2FzZXMgd2hlcmUgeW91IHdhbnQgdG8gZW1wbG95IGEgbW9kdWxlIHN5c3RlbSB3aGljaCByZWdpc3RlcnMgY29tcG9uZW50cyBvbiBhXG4gICAgICogY29uZGl0aW9uYWwgYmFzaXMsIHlvdSBjYW4gZGlzYWJsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYC5cbiAgICAgKiBZb3VyIG1vZHVsZSBvciBib290c3RyYXAgc3lzdGVtIHdpbGwgaGF2ZSB0byB0YWtlIGNhcmUgb2YgZGVmaW5pbmcgdGhlIGNvbXBvbmVudCBsYXRlci5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIGRlZmluZTogYm9vbGVhbjtcbiAgICAvLyBUT0RPOiB0ZXN0IG1lZGlhIHF1ZXJpZXNcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEFuIGFycmF5IG9mIENTUyBydWxlc2V0cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL1N5bnRheCNDU1NfcnVsZXNldHMpLlxuICAgICAqIFN0eWxlcyBkZWZpbmVkIHVzaW5nIHRoZSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCBzdHlsZXMgZGVmaW5lZCBpbiB0aGUgY29tcG9uZW50J3NcbiAgICAgKiBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlci5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHN0eWxlczogW1xuICAgICAqICAgICAgICAgICdoMSwgaDIgeyBmb250LXNpemU6IDE2cHQ7IH0nLFxuICAgICAqICAgICAgICAgICdAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA5MDBweCkgeyBhcnRpY2xlIHsgcGFkZGluZzogMXJlbSAzcmVtOyB9IH0nXG4gICAgICogICAgICBdXG4gICAgICogfSlcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB1bmRlZmluZWRgXG4gICAgICovXG4gICAgc3R5bGVzPzogc3RyaW5nW107XG4gICAgLy8gVE9ETzogdXBkYXRlIGRvY3VtZW50YXRpb25cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEge0BsaW5rICNsaXQtaHRtbC5UZW1wbGF0ZVJlc3VsdH0uIFRoZSBmdW5jdGlvbidzIGBlbGVtZW50YFxuICAgICAqIHBhcmFtZXRlciB3aWxsIGJlIHRoZSBjdXJyZW50IGNvbXBvbmVudCBpbnN0YW5jZS4gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgYnkgdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFRoZSBtZXRob2QgbXVzdCByZXR1cm4gYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHdoaWNoIGlzIGNyZWF0ZWQgdXNpbmcgbGl0LWh0bWwnc1xuICAgICAqIHtAbGluayBsaXQtaHRtbCNodG1sIHwgYGh0bWxgfSBvciB7QGxpbmsgbGl0LWh0bWwjc3ZnIHwgYHN2Z2B9IHRlbXBsYXRlIG1ldGhvZHMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGNvbXBvbmVudCBpbnN0YW5jZSByZXF1ZXN0aW5nIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHRlbXBsYXRlPzogKGVsZW1lbnQ6IFR5cGUsIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT046IENvbXBvbmVudERlY2xhcmF0aW9uID0ge1xuICAgIHNlbGVjdG9yOiAnJyxcbiAgICBzaGFkb3c6IHRydWUsXG4gICAgZGVmaW5lOiB0cnVlLFxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBDb21wb25lbnREZWNsYXJhdGlvbiwgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT04gfSBmcm9tICcuL2NvbXBvbmVudC1kZWNsYXJhdGlvbic7XG5pbXBvcnQgeyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlIH0gZnJvbSAnLi9wcm9wZXJ0eSc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gY2xhc3NcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudDxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogUGFydGlhbDxDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB7IC4uLkRFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICByZXR1cm4gKHRhcmdldDogdHlwZW9mIENvbXBvbmVudCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0IGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3RydWN0b3Iuc2VsZWN0b3IgPSBkZWNsYXJhdGlvbi5zZWxlY3RvciB8fCB0YXJnZXQuc2VsZWN0b3I7XG4gICAgICAgIGNvbnN0cnVjdG9yLnNoYWRvdyA9IGRlY2xhcmF0aW9uLnNoYWRvdztcbiAgICAgICAgY29uc3RydWN0b3IudGVtcGxhdGUgPSBkZWNsYXJhdGlvbi50ZW1wbGF0ZSB8fCB0YXJnZXQudGVtcGxhdGU7XG5cbiAgICAgICAgLy8gdXNlIGtleW9mIHNpZ25hdHVyZXMgdG8gY2F0Y2ggcmVmYWN0b3JpbmcgZXJyb3JzXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlc0tleToga2V5b2YgdHlwZW9mIENvbXBvbmVudCA9ICdvYnNlcnZlZEF0dHJpYnV0ZXMnO1xuICAgICAgICBjb25zdCBzdHlsZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnc3R5bGVzJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvcGVydHkgZGVjb3JhdG9ycyBnZXQgY2FsbGVkIGJlZm9yZSBjbGFzcyBkZWNvcmF0b3JzLCBzbyBhdCB0aGlzIHBvaW50IGFsbCBkZWNvcmF0ZWQgcHJvcGVydGllc1xuICAgICAgICAgKiBoYXZlIHN0b3JlZCB0aGVpciBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMgaW4ge0BsaW5rIENvbXBvbmVudC5hdHRyaWJ1dGVzfS5cbiAgICAgICAgICogV2UgY2FuIG5vdyBjb21iaW5lIHRoZW0gd2l0aCB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBhbmQsXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LCBlbGltaW5hdGUgYWxsIGR1cGxpY2F0ZXMgaW4gdGhlIHByb2Nlc3MuXG4gICAgICAgICAqXG4gICAgICAgICAqIEFzIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IHdpbGwgYWxzbyBpbmNsdWRlIGRlY29yYXRvciBnZW5lcmF0ZWRcbiAgICAgICAgICogb2JzZXJ2ZWQgYXR0cmlidXRlcywgd2UgYWx3YXlzIGluaGVyaXQgYWxsIG9ic2VydmVkIGF0dHJpYnV0ZXMgZnJvbSBhIGJhc2UgY2xhc3MuIEZvciB0aGF0IHJlYXNvblxuICAgICAgICAgKiB3ZSBoYXZlIHRvIGtlZXAgdHJhY2sgb2YgYXR0cmlidXRlIG92ZXJyaWRlcyB3aGVuIGV4dGVuZGluZyBhbnkge0BsaW5rIENvbXBvbmVudH0gYmFzZSBjbGFzcy5cbiAgICAgICAgICogVGhpcyBpcyBkb25lIGluIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvci4gSGVyZSB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0byByZW1vdmUgb3ZlcnJpZGRlblxuICAgICAgICAgKiBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZWRBdHRyaWJ1dGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAvLyB3ZSB0YWtlIHRoZSBpbmhlcml0ZWQgb2JzZXJ2ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm9ic2VydmVkQXR0cmlidXRlc1xuICAgICAgICAgICAgICAgICAgICAvLyAuLi5yZW1vdmUgb3ZlcnJpZGRlbiBnZW5lcmF0ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChhdHRyaWJ1dGVzLCBhdHRyaWJ1dGUpID0+IGF0dHJpYnV0ZXMuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiAmJiBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuLmhhcyhhdHRyaWJ1dGUpID8gW10gOiBhdHRyaWJ1dGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgc3RyaW5nW11cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAvLyAuLi5hbmQgcmVjb21iaW5lIHRoZSBsaXN0IHdpdGggdGhlIG5ld2x5IGdlbmVyYXRlZCBhdHRyaWJ1dGVzICh0aGUgU2V0IHByZXZlbnRzIGR1cGxpY2F0ZXMpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoWy4uLnRhcmdldC5hdHRyaWJ1dGVzLmtleXMoKV0pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gZGVsZXRlIHRoZSBvdmVycmlkZGVuIFNldCBmcm9tIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgY29uc3RydWN0b3Iub3ZlcnJpZGRlbjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IHN0eWxlcyBhdXRvbWF0aWNhbGx5LCB1bmxlc3MgZXhwbGljaXRseSByZXF1ZXN0ZWQsIHNvIHdlIGNoZWNrIGlmIHRoZVxuICAgICAgICAgKiBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHN0YXRpYyBzdHlsZXMgcHJvcGVydHkgKHdoaWNoIG1heSB1c2Ugc3VwZXIuc3R5bGVzIHRvIGV4cGxpY2l0bHkgaW5oZXJpdClcbiAgICAgICAgICogYW5kIGlmIGl0IGRvZXNuJ3QsIHdlIGlnbm9yZSB0aGUgcGFyZW50IGNsYXNzJ3Mgc3R5bGVzIChieSBub3QgaW52b2tpbmcgdGhlIGdldHRlcikuXG4gICAgICAgICAqIFdlIHRoZW4gbWVyZ2UgdGhlIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcyAoaWYgZXhpc3RpbmcpIGludG8gdGhlIHN0eWxlcyBhbmQgcmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICAgICAgICogYnkgdXNpbmcgYSBTZXQuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIChjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShzdHlsZXNLZXkpXG4gICAgICAgICAgICAgICAgICAgID8gY29uc3RydWN0b3Iuc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgIDogW11cbiAgICAgICAgICAgICAgICApLmNvbmNhdChkZWNsYXJhdGlvbi5zdHlsZXMgfHwgW10pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmFsbHkgd2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBnZXR0ZXIgd2l0aCBhIG5ldyBvbmUsIHdoaWNoIHJldHVybnNcbiAgICAgICAgICogdGhlIHVuaXF1ZSBzZXQgb2YgdXNlciBkZWZpbmVkIGFuZCBkZWNvcmF0b3IgZ2VuZXJhdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVkQXR0cmlidXRlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50LnN0eWxlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHN0YXRpY2FsbHkgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGRlZmluZWQgc3R5bGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgc3R5bGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0eWxlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmRlZmluZSkge1xuXG4gICAgICAgICAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKGNvbnN0cnVjdG9yLnNlbGVjdG9yLCBjb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5cbi8qKlxuICogQSB7QGxpbmsgQ29tcG9uZW50fSBldmVudCBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExpc3RlbmVyRGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGV2ZW50IHRvIGxpc3RlbiB0b1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTZXR0aW5nIGV2ZW50IHRvIGBudWxsYCBhbGxvd3MgdG8gdW5iaW5kIGFuIGluaGVyaXRlZCBldmVudCBsaXN0ZW5lci5cbiAgICAgKi9cbiAgICBldmVudDogc3RyaW5nIHwgbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgc3BlY2lmaWVzIGNoYXJhY3RlcmlzdGljcyBhYm91dCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICAgKi9cbiAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnM7XG5cbiAgICAvKipcbiAgICAgKiBBbiBhbHRlcm5hdGl2ZSBldmVudCB0YXJnZXQgKGJ5IGRlZmF1bHQgdGhpcyB3aWxsIGJlIHRoZSB7QGxpbmsgQ29tcG9uZW50fSBpbnN0YW5jZSlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBjYW4gYmUgdXNlZnVsIGlmIHlvdSB3YW50IHRvIGxpc3RlbiB0byBlLmcuOlxuICAgICAqICogd2luZG93Lm9ucmVzaXplXG4gICAgICogKiBkb2N1bWVudC5vbmxvYWRcbiAgICAgKiAqIGRvY3VtZW50Lm9uc2Nyb2xsXG4gICAgICogKiBXb3JrZXIub25tZXNzYWdlXG4gICAgICpcbiAgICAgKiBJZiBhIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCB0aGUgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIGJ5IGNvbXBvbmVudCBhZnRlciBpdHNcbiAgICAgKiB7QGxpbmsgY29ubmVjdGVkQ2FsbGJhY2t9IGhhcyB1cGRhdGVkIHRoZSBjb21wb25lbnQuIFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbiB3aWxsXG4gICAgICogYmUgdGhlIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICB3b3JrZXI6IFdvcmtlcjtcbiAgICAgKlxuICAgICAqICAgICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuICAgICAqICAgICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICogICAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgICAgKiAgICAgIH1cbiAgICAgKlxuICAgICAqICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuICAgICAqICAgICAgICAgIHN1cGVyLmRpc2Nvbm5lY3RlZENhbGxiYWNrKClcbiAgICAgKiAgICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgKiAgICAgIH1cbiAgICAgKlxuICAgICAqICAgICAgQGxpc3RlbmVyPE15RWxlbWVudD4oe1xuICAgICAqICAgICAgICAgIGV2ZW50OiAnbWVzc2FnZScsXG4gICAgICogICAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLndvcmtlcjsgfVxuICAgICAqICAgICAgfSlcbiAgICAgKiAgICAgIG9uTWVzc2FnZSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkge1xuICAgICAqICAgICAgICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIGV2ZW50LmRhdGFcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgdGFyZ2V0PzogRXZlbnRUYXJnZXQgfCAoKHRoaXM6IFR5cGUpID0+IEV2ZW50VGFyZ2V0KTtcbn1cblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBtZXRob2QgYXMgYW4gZXZlbnQgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgbGlzdGVuZXIgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbmVyPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBMaXN0ZW5lckRlY2xhcmF0aW9uPFR5cGU+KSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZXZlbnQgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IubGlzdGVuZXJzLmRlbGV0ZShwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IubGlzdGVuZXJzLnNldChwcm9wZXJ0eUtleSwgeyAuLi5vcHRpb25zIH0gYXMgTGlzdGVuZXJEZWNsYXJhdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBsaXN0ZW5lciBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIGxpc3RlbmVyIGRlY29yYXRvciBzdG9yZXMgbGlzdGVuZXIgZGVjbGFyYXRpb25zIGluIHRoZSBjb25zdHJ1Y3Rvciwgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhlXG4gKiBzdGF0aWMgbGlzdGVuZXJzIGZpZWxkIGlzIGluaXRpYWxpemVkIG9uIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yLiBPdGhlcndpc2Ugd2UgYWRkIGxpc3RlbmVyIGRlY2xhcmF0aW9uc1xuICogdG8gdGhlIGJhc2UgY2xhc3MncyBzdGF0aWMgZmllbGQuIFdlIGFsc28gbWFrZSBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGxpc3RlbmVyIG1hcHMgd2l0aCB0aGUgdmFsdWVzIG9mXG4gKiB0aGUgYmFzZSBjbGFzcydzIG1hcCB0byBwcm9wZXJseSBpbmhlcml0IGFsbCBsaXN0ZW5lciBkZWNsYXJhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnN0cnVjdG9yIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgdG8gcHJlcGFyZVxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcHJlcGFyZUNvbnN0cnVjdG9yIChjb25zdHJ1Y3RvcjogdHlwZW9mIENvbXBvbmVudCkge1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eSgnbGlzdGVuZXJzJykpIGNvbnN0cnVjdG9yLmxpc3RlbmVycyA9IG5ldyBNYXAoY29uc3RydWN0b3IubGlzdGVuZXJzKTtcbn1cbiIsIi8qKlxuICogR2V0IHRoZSB7QGxpbmsgUHJvcGVydHlEZXNjcmlwdG9yfSBvZiBhIHByb3BlcnR5IGZyb20gaXRzIHByb3RvdHlwZVxuICogb3IgYSBwYXJlbnQgcHJvdG90eXBlIC0gZXhjbHVkaW5nIHtAbGluayBPYmplY3QucHJvdG90eXBlfSBpdHNlbGYuXG4gKlxuICogQHBhcmFtIHRhcmdldCAgICAgICAgVGhlIHByb3RvdHlwZSB0byBnZXQgdGhlIGRlc2NyaXB0b3IgZnJvbVxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkZXNjcmlwdG9yXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZXNjcmlwdG9yIHwgdW5kZWZpbmVkIHtcblxuICAgIGlmIChwcm9wZXJ0eUtleSBpbiB0YXJnZXQpIHtcblxuICAgICAgICB3aGlsZSAodGFyZ2V0ICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkocHJvcGVydHlLZXkpKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IGNyZWF0ZUF0dHJpYnV0ZU5hbWUsIERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIFByb3BlcnR5RGVjbGFyYXRpb24gfSBmcm9tICcuL3Byb3BlcnR5LWRlY2xhcmF0aW9uJztcbmltcG9ydCB7IGdldFByb3BlcnR5RGVzY3JpcHRvciB9IGZyb20gJy4vdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3InO1xuXG4vKipcbiAqIEEgdHlwZSBleHRlbnNpb24gdG8gYWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byBhIHtAbGluayBDb21wb25lbnR9IGNvbnN0cnVjdG9yIGR1cmluZyBkZWNvcmF0aW9uXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gdHlwZW9mIENvbXBvbmVudCAmIHsgb3ZlcnJpZGRlbj86IFNldDxzdHJpbmc+IH07XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHlcbiAqXG4gKiBAcmVtYXJrc1xuICogTWFueSBvZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9wdGlvbnMgc3VwcG9ydCBjdXN0b20gZnVuY3Rpb25zLCB3aGljaCB3aWxsIGJlIGludm9rZWRcbiAqIHdpdGggdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhcyBgdGhpc2AtY29udGV4dCBkdXJpbmcgZXhlY3V0aW9uLiBJbiBvcmRlciB0byBzdXBwb3J0IGNvcnJlY3RcbiAqIHR5cGluZyBpbiB0aGVzZSBmdW5jdGlvbnMsIHRoZSBgQHByb3BlcnR5YCBkZWNvcmF0b3Igc3VwcG9ydHMgZ2VuZXJpYyB0eXBlcy4gSGVyZSBpcyBhbiBleGFtcGxlXG4gKiBvZiBob3cgeW91IGNhbiB1c2UgdGhpcyB3aXRoIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn06XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIG15SGlkZGVuUHJvcGVydHkgPSB0cnVlO1xuICpcbiAqICAgICAgLy8gdXNlIGEgZ2VuZXJpYyB0byBzdXBwb3J0IHByb3BlciBpbnN0YW5jZSB0eXBpbmcgaW4gdGhlIHByb3BlcnR5IHJlZmxlY3RvclxuICogICAgICBAcHJvcGVydHk8TXlFbGVtZW50Pih7XG4gKiAgICAgICAgICByZWZsZWN0UHJvcGVydHk6IChwcm9wZXJ0eUtleTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gKiAgICAgICAgICAgICAgLy8gdGhlIGdlbmVyaWMgdHlwZSBhbGxvd3MgZm9yIGNvcnJlY3QgdHlwaW5nIG9mIHRoaXNcbiAqICAgICAgICAgICAgICBpZiAodGhpcy5teUhpZGRlblByb3BlcnR5ICYmIG5ld1ZhbHVlKSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdteS1wcm9wZXJ0eScsICcnKTtcbiAqICAgICAgICAgICAgICB9IGVsc2Uge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbXktcHJvcGVydHknKTtcbiAqICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSBmYWxzZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEgcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGRlZmluaW5nIGNsYXNzZXMgaW4gVHlwZVNjcmlwdCwgY2xhc3MgZmllbGRzIGFjdHVhbGx5IGRvbid0IGV4aXN0IG9uIHRoZSBjbGFzcydzIHByb3RvdHlwZSwgYnV0XG4gICAgICAgICAqIHJhdGhlciwgdGhleSBhcmUgaW5zdGFudGlhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgZXhpc3Qgb25seSBvbiB0aGUgaW5zdGFuY2UuIEFjY2Vzc29yIHByb3BlcnRpZXNcbiAgICAgICAgICogYXJlIGFuIGV4Y2VwdGlvbiBob3dldmVyIGFuZCBleGlzdCBvbiB0aGUgcHJvdG90eXBlLiBGdXJ0aGVybW9yZSwgYWNjZXNzb3JzIGFyZSBpbmhlcml0ZWQgYW5kIHdpbGxcbiAgICAgICAgICogYmUgaW52b2tlZCB3aGVuIHNldHRpbmcgKG9yIGdldHRpbmcpIGEgcHJvcGVydHkgb24gYW4gaW5zdGFuY2Ugb2YgYSBjaGlsZCBjbGFzcywgZXZlbiBpZiB0aGF0IGNsYXNzXG4gICAgICAgICAqIGRlZmluZXMgdGhlIHByb3BlcnR5IGZpZWxkIG9uIGl0cyBvd24uIE9ubHkgaWYgdGhlIGNoaWxkIGNsYXNzIGRlZmluZXMgbmV3IGFjY2Vzc29ycyB3aWxsIHRoZSBwYXJlbnRcbiAgICAgICAgICogY2xhc3MncyBhY2Nlc3NvcnMgbm90IGJlIGluaGVyaXRlZC5cbiAgICAgICAgICogVG8ga2VlcCB0aGlzIGJlaGF2aW9yIGludGFjdCwgd2UgbmVlZCB0byBlbnN1cmUsIHRoYXQgd2hlbiB3ZSBjcmVhdGUgYWNjZXNzb3JzIGZvciBwcm9wZXJ0aWVzLCB3aGljaFxuICAgICAgICAgKiBhcmUgbm90IGRlY2xhcmVkIGFzIGFjY2Vzc29ycywgd2UgaW52b2tlIHRoZSBwYXJlbnQgY2xhc3MncyBhY2Nlc3NvciBhcyBleHBlY3RlZC5cbiAgICAgICAgICogVGhlIHtAbGluayBnZXRQcm9wZXJ0eURlc2NyaXB0b3J9IGZ1bmN0aW9uIGFsbG93cyB1cyB0byBsb29rIGZvciBhY2Nlc3NvcnMgb24gdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICAgICAgICAgKiB0aGUgY2xhc3Mgd2UgYXJlIGRlY29yYXRpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gcHJvcGVydHlEZXNjcmlwdG9yIHx8IGdldFByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgY29uc3QgaGlkZGVuS2V5ID0gKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpID8gYF9fJHsgcHJvcGVydHlLZXkgfWAgOiBTeW1ib2woKTtcblxuICAgICAgICAvLyBpZiB3ZSBmb3VuZCBhbiBhY2Nlc3NvciBkZXNjcmlwdG9yIChmcm9tIGVpdGhlciB0aGlzIGNsYXNzIG9yIGEgcGFyZW50KSB3ZSB1c2UgaXQsIG90aGVyd2lzZSB3ZSBjcmVhdGVcbiAgICAgICAgLy8gZGVmYXVsdCBhY2Nlc3NvcnMgdG8gc3RvcmUgdGhlIGFjdHVhbCBwcm9wZXJ0eSB2YWx1ZSBpbiBhIGhpZGRlbiBmaWVsZCBhbmQgcmV0cmlldmUgaXQgZnJvbSB0aGVyZVxuICAgICAgICBjb25zdCBnZXR0ZXIgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IuZ2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnkpIHsgcmV0dXJuIHRoaXNbaGlkZGVuS2V5XTsgfTtcbiAgICAgICAgY29uc3Qgc2V0dGVyID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnNldCB8fCBmdW5jdGlvbiAodGhpczogYW55LCB2YWx1ZTogYW55KSB7IHRoaXNbaGlkZGVuS2V5XSA9IHZhbHVlOyB9O1xuXG4gICAgICAgIC8vIHdlIGRlZmluZSBhIG5ldyBhY2Nlc3NvciBkZXNjcmlwdG9yIHdoaWNoIHdpbGwgd3JhcCB0aGUgcHJldmlvdXNseSByZXRyaWV2ZWQgb3IgY3JlYXRlZCBhY2Nlc3NvcnNcbiAgICAgICAgLy8gYW5kIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgd2hlbmV2ZXIgdGhlIHByb3BlcnR5IGlzIHNldFxuICAgICAgICBjb25zdCB3cmFwcGVkRGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yICYgVGhpc1R5cGU8YW55PiA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IGFueSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpc1twcm9wZXJ0eUtleV07XG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHBhc3MgYHZhbHVlYCBvbiBhcyBgbmV3VmFsdWVgIC0gYW4gaW5oZXJpdGVkIHNldHRlciBtaWdodCBtb2RpZnkgaXRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIGdldCB0aGUgbmV3IHZhbHVlIGJ5IGludm9raW5nIHRoZSBnZXR0ZXJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUocHJvcGVydHlLZXksIG9sZFZhbHVlLCBnZXR0ZXIuY2FsbCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uOiBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+ID0geyAuLi5ERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdGhlIGRlZmF1bHQgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPSBjcmVhdGVBdHRyaWJ1dGVOYW1lKHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLm9ic2VydmUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24ub2JzZXJ2ZSA9IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04ub2JzZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgaW5oZXJpdGVkIGFuIG9ic2VydmVkIGF0dHJpYnV0ZSBmb3IgdGhlIHByb3BlcnR5IGZyb20gdGhlIGJhc2UgY2xhc3NcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gY29uc3RydWN0b3IucHJvcGVydGllcy5oYXMocHJvcGVydHlLZXkpID8gY29uc3RydWN0b3IucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpIS5hdHRyaWJ1dGUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSBpdCdzIGEgc3RyaW5nIGFuZCBpdCB3aWxsIGV4aXN0IGluIHRoZSBhdHRyaWJ1dGVzIG1hcFxuICAgICAgICBpZiAoYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgaW5oZXJpdGVkIGF0dHJpYnV0ZSBhcyBpdCdzIG92ZXJyaWRkZW5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZGVsZXRlKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgLy8gbWFyayBhdHRyaWJ1dGUgYXMgb3ZlcnJpZGRlbiBmb3Ige0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuIS5hZGQoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuc2V0KGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uICphZnRlciogcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlcywgc28gd2UgY2FuIHN0aWxsIGFjY2VzcyB0aGVcbiAgICAgICAgLy8gaW5oZXJpdGVkIHByb3BlcnR5IGRlY2xhcmF0aW9uIHdoZW4gcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlc1xuICAgICAgICBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgZGVjbGFyYXRpb24gYXMgUHJvcGVydHlEZWNsYXJhdGlvbik7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgLy8gaWYgbm8gcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYSBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIHdoaWNoIG11c3QgcmV0dXJuIHZvaWQgYW5kIHdlIGNhbiBkZWZpbmUgdGhlIHdyYXBwZWQgZGVzY3JpcHRvciBoZXJlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgd3JhcHBlZERlc2NyaXB0b3IpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGlmIGEgcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYW4gYWNjZXNzb3JcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciBhbmQgd2UgbXVzdCByZXR1cm4gdGhlIHdyYXBwZWQgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWREZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIHByb3BlcnR5IGRlY29yYXRvciBzdG9yZXMgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgaW4gdGhlIGNvbnN0cnVjdG9yLFxuICogd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhvc2Ugc3RhdGljIGZpZWxkcyBhcmUgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZVxuICogYWRkIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkcy4gV2UgYWxzbyBtYWtlXG4gKiBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGNvbnN0cnVjdG9ycyBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYmFzZSBjbGFzcydzIG1hcHMgdG8gcHJvcGVybHlcbiAqIGluaGVyaXQgYWxsIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlcy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IERlY29yYXRlZENvbXBvbmVudFR5cGUpIHtcblxuICAgIC8vIHRoaXMgd2lsbCBnaXZlIHVzIGEgY29tcGlsZS10aW1lIGVycm9yIGlmIHdlIHJlZmFjdG9yIG9uZSBvZiB0aGUgc3RhdGljIGNvbnN0cnVjdG9yIHByb3BlcnRpZXNcbiAgICAvLyBhbmQgd2Ugd29uJ3QgbWlzcyByZW5hbWluZyB0aGUgcHJvcGVydHkga2V5c1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAncHJvcGVydGllcyc7XG4gICAgY29uc3QgYXR0cmlidXRlczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdhdHRyaWJ1dGVzJztcbiAgICBjb25zdCBvdmVycmlkZGVuOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ292ZXJyaWRkZW4nO1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0aWVzKSkgY29uc3RydWN0b3IucHJvcGVydGllcyA9IG5ldyBNYXAoY29uc3RydWN0b3IucHJvcGVydGllcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVzKSkgY29uc3RydWN0b3IuYXR0cmlidXRlcyA9IG5ldyBNYXAoY29uc3RydWN0b3IuYXR0cmlidXRlcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShvdmVycmlkZGVuKSkgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiA9IG5ldyBTZXQoKTtcbn1cbiIsIi8qKlxuICogQSBzaW1wbGUgY3NzIHRlbXBsYXRlIGxpdGVyYWwgdGFnXG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSB0YWcgaXRzZWxmIGRvZXNuJ3QgZG8gYW55dGhpbmcgdGhhdCBhbiB1bnRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFsIHdvdWxkbid0IGRvLCBidXQgaXQgY2FuIGJlIHVzZWQgYnlcbiAqIGVkaXRvciBwbHVnaW5zIHRvIGluZmVyIHRoZSBcInZpcnR1YWwgZG9jdW1lbnQgdHlwZVwiIHRvIHByb3ZpZGUgY29kZSBjb21wbGV0aW9uIGFuZCBoaWdobGlnaHRpbmcuIEl0IGNvdWxkXG4gKiBhbHNvIGJlIHVzZWQgaW4gdGhlIGZ1dHVyZSB0byBtb3JlIHNlY3VyZWx5IGNvbnZlcnQgc3Vic3RpdHV0aW9ucyBpbnRvIHN0cmluZ3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuICpcbiAqIGNvbnN0IG1peGluQm94ID0gKGJvcmRlcldpZHRoOiBzdHJpbmcgPSAnMXB4JywgYm9yZGVyQ29sb3I6IHN0cmluZyA9ICdzaWx2ZXInKSA9PiBjc3NgXG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogICBib3JkZXI6ICR7Ym9yZGVyV2lkdGh9IHNvbGlkICR7Ym9yZGVyQ29sb3J9O1xuICogYDtcbiAqXG4gKiBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2BcbiAqICR7IHNlbGVjdG9yIH06aG92ZXIge1xuICogICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKiBgO1xuICpcbiAqIGNvbnN0IHN0eWxlcyA9IGNzc2BcbiAqIDpob3N0IHtcbiAqICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbiAqICAgZGlzcGxheTogYmxvY2s7XG4gKiAgICR7IG1peGluQm94KCkgfVxuICogfVxuICogJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG4gKiA6OnNsb3R0ZWQoKikge1xuICogICBtYXJnaW46IDA7XG4gKiB9XG4gKiBgO1xuICpcbiAqIC8vIHdpbGwgcHJvZHVjZS4uLlxuICogOmhvc3Qge1xuICogLS1ob3Zlci1jb2xvcjogZ3JlZW47XG4gKiBkaXNwbGF5OiBibG9jaztcbiAqXG4gKiBkaXNwbGF5OiBibG9jaztcbiAqIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gKiBib3JkZXI6IDFweCBzb2xpZCBzaWx2ZXI7XG4gKlxuICogfVxuICpcbiAqIDpob3N0OmhvdmVyIHtcbiAqIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbiAqIH1cbiAqXG4gKiA6OnNsb3R0ZWQoKikge1xuICogbWFyZ2luOiAwO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBjc3MgPSAobGl0ZXJhbHM6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5zdWJzdGl0dXRpb25zOiBhbnlbXSkgPT4ge1xuXG4gICAgcmV0dXJuIHN1YnN0aXR1dGlvbnMucmVkdWNlKChwcmV2OiBzdHJpbmcsIGN1cnI6IGFueSwgaTogbnVtYmVyKSA9PiBwcmV2ICsgY3VyciArIGxpdGVyYWxzW2kgKyAxXSwgbGl0ZXJhbHNbMF0pO1xufTtcblxuLy8gY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuXG4vLyBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuLy8gICBkaXNwbGF5OiBibG9jaztcbi8vICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbi8vICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbi8vIGA7XG5cbi8vIGNvbnN0IG1peGluSG92ZXIgPSAoc2VsZWN0b3I6IHN0cmluZykgPT4gY3NzYFxuLy8gJHsgc2VsZWN0b3IgfTpob3ZlciB7XG4vLyAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnN0IHN0eWxlcyA9IGNzc2Bcbi8vIDpob3N0IHtcbi8vICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgICR7IG1peGluQm94KCkgfVxuLy8gfVxuXG4vLyAkeyBtaXhpbkhvdmVyKCc6aG9zdCcpIH1cblxuLy8gOjpzbG90dGVkKCopIHtcbi8vICAgbWFyZ2luOiAwO1xuLy8gfVxuLy8gYDtcblxuLy8gY29uc29sZS5sb2coc3R5bGVzKTtcbiIsImV4cG9ydCBjb25zdCBBcnJvd1VwID0gJ0Fycm93VXAnO1xuZXhwb3J0IGNvbnN0IEFycm93RG93biA9ICdBcnJvd0Rvd24nO1xuZXhwb3J0IGNvbnN0IEFycm93TGVmdCA9ICdBcnJvd0xlZnQnO1xuZXhwb3J0IGNvbnN0IEFycm93UmlnaHQgPSAnQXJyb3dSaWdodCc7XG5leHBvcnQgY29uc3QgRW50ZXIgPSAnRW50ZXInO1xuZXhwb3J0IGNvbnN0IEVzY2FwZSA9ICdFc2NhcGUnO1xuZXhwb3J0IGNvbnN0IFNwYWNlID0gJyAnO1xuZXhwb3J0IGNvbnN0IFRhYiA9ICdUYWInO1xuZXhwb3J0IGNvbnN0IEJhY2tzcGFjZSA9ICdCYWNrc3BhY2UnO1xuZXhwb3J0IGNvbnN0IEFsdCA9ICdBbHQnO1xuZXhwb3J0IGNvbnN0IFNoaWZ0ID0gJ1NoaWZ0JztcbmV4cG9ydCBjb25zdCBDb250cm9sID0gJ0NvbnRyb2wnO1xuZXhwb3J0IGNvbnN0IE1ldGEgPSAnTWV0YSc7XG4iLCJpbXBvcnQgeyBBcnJvd0Rvd24sIEFycm93TGVmdCwgQXJyb3dSaWdodCwgQXJyb3dVcCB9IGZyb20gJy4va2V5cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2ZUl0ZW1DaGFuZ2U8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEN1c3RvbUV2ZW50IHtcbiAgICB0eXBlOiAnYWN0aXZlLWl0ZW0tY2hhbmdlJztcbiAgICBkZXRhaWw6IHtcbiAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgIGluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpdGVtOiBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudHlwZSBMaXN0RW50cnk8VCBleHRlbmRzIExpc3RJdGVtPiA9IFtudW1iZXIgfCB1bmRlZmluZWQsIFQgfCB1bmRlZmluZWRdO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTGlzdEtleU1hbmFnZXI8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZUl0ZW06IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgbGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBpdGVtVHlwZTogYW55O1xuXG4gICAgcHVibGljIGl0ZW1zOiBUW107XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHB1YmxpYyBob3N0OiBIVE1MRWxlbWVudCxcbiAgICAgICAgaXRlbXM6IE5vZGVMaXN0T2Y8VD4sXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gQXJyYXkuZnJvbShpdGVtcyk7XG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSB0aGlzLml0ZW1zWzBdICYmIHRoaXMuaXRlbXNbMF0uY29uc3RydWN0b3I7XG5cbiAgICAgICAgdGhpcy5iaW5kSG9zdCgpO1xuICAgIH1cblxuICAgIGdldEFjdGl2ZUl0ZW0gKCk6IFQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUl0ZW07XG4gICAgfTtcblxuICAgIHNldEFjdGl2ZUl0ZW0gKGl0ZW06IFQsIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgY29uc3QgZW50cnk6IExpc3RFbnRyeTxUPiA9IFtcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpdGVtIDogdW5kZWZpbmVkXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldE5leHRJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldE5leHRFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0UHJldmlvdXNJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldFByZXZpb3VzRW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldEZpcnN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRGaXJzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRMYXN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRMYXN0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgW3ByZXYsIG5leHRdID0gKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gW0Fycm93TGVmdCwgQXJyb3dSaWdodF0gOiBbQXJyb3dVcCwgQXJyb3dEb3duXTtcbiAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIHByZXY6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBuZXh0OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXROZXh0SXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZWRvd24gKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRm9jdXMgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZSAocHJldmlvdXNJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgY29uc3QgZXZlbnQ6IEFjdGl2ZUl0ZW1DaGFuZ2U8VD4gPSBuZXcgQ3VzdG9tRXZlbnQoJ2FjdGl2ZS1pdGVtLWNoYW5nZScsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBwcmV2aW91czoge1xuICAgICAgICAgICAgICAgICAgICBpbmRleDogcHJldmlvdXNJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogKHR5cGVvZiBwcmV2aW91c0luZGV4ID09PSAnbnVtYmVyJykgPyB0aGlzLml0ZW1zW3ByZXZpb3VzSW5kZXhdIDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiB0aGlzLmFjdGl2ZUluZGV4LFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiB0aGlzLmFjdGl2ZUl0ZW1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pIGFzIEFjdGl2ZUl0ZW1DaGFuZ2U8VD47XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0RW50cnlBY3RpdmUgKGVudHJ5OiBMaXN0RW50cnk8VD4sIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBbdGhpcy5hY3RpdmVJbmRleCwgdGhpcy5hY3RpdmVJdGVtXSA9IGVudHJ5O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXROZXh0RW50cnkgKGZyb21JbmRleD86IG51bWJlcik6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgZnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgPyBmcm9tSW5kZXhcbiAgICAgICAgICAgIDogKHR5cGVvZiB0aGlzLmFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlSW5kZXhcbiAgICAgICAgICAgICAgICA6IC0xO1xuXG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuaXRlbXMubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IG5leHRJbmRleCA9IGZyb21JbmRleCArIDE7XG4gICAgICAgIGxldCBuZXh0SXRlbSA9IHRoaXMuaXRlbXNbbmV4dEluZGV4XTtcblxuICAgICAgICB3aGlsZSAobmV4dEluZGV4IDwgbGFzdEluZGV4ICYmIG5leHRJdGVtICYmIG5leHRJdGVtLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIG5leHRJdGVtID0gdGhpcy5pdGVtc1srK25leHRJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG5leHRJdGVtICYmICFuZXh0SXRlbS5kaXNhYmxlZCkgPyBbbmV4dEluZGV4LCBuZXh0SXRlbV0gOiBbdGhpcy5hY3RpdmVJbmRleCwgdGhpcy5hY3RpdmVJdGVtXTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0UHJldmlvdXNFbnRyeSAoZnJvbUluZGV4PzogbnVtYmVyKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICBmcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICA/IGZyb21JbmRleFxuICAgICAgICAgICAgOiAodHlwZW9mIHRoaXMuYWN0aXZlSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmVJbmRleFxuICAgICAgICAgICAgICAgIDogMDtcblxuICAgICAgICBsZXQgcHJldkluZGV4ID0gZnJvbUluZGV4IC0gMTtcbiAgICAgICAgbGV0IHByZXZJdGVtID0gdGhpcy5pdGVtc1twcmV2SW5kZXhdO1xuXG4gICAgICAgIHdoaWxlIChwcmV2SW5kZXggPiAwICYmIHByZXZJdGVtICYmIHByZXZJdGVtLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIHByZXZJdGVtID0gdGhpcy5pdGVtc1stLXByZXZJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKHByZXZJdGVtICYmICFwcmV2SXRlbS5kaXNhYmxlZCkgPyBbcHJldkluZGV4LCBwcmV2SXRlbV0gOiBbdGhpcy5hY3RpdmVJbmRleCwgdGhpcy5hY3RpdmVJdGVtXTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0Rmlyc3RFbnRyeSAoKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXROZXh0RW50cnkoLTEpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRMYXN0RW50cnkgKCk6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJldmlvdXNFbnRyeSh0aGlzLml0ZW1zLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGJpbmRIb3N0ICgpIHtcblxuICAgICAgICAvLyBUT0RPOiBlbmFibGUgcmVjb25uZWN0aW5nIHRoZSBob3N0IGVsZW1lbnQ/IG5vIG5lZWQgaWYgRm9jdXNNYW5hZ2VyIGlzIGNyZWF0ZWQgaW4gY29ubmVjdGVkQ2FsbGJhY2tcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBuZXcgTWFwKFtcbiAgICAgICAgICAgIFsnZm9jdXNpbicsIHRoaXMuaGFuZGxlRm9jdXMuYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5ZG93bi5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydtb3VzZWRvd24nLCB0aGlzLmhhbmRsZU1vdXNlZG93bi5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydkaXNjb25uZWN0ZWQnLCB0aGlzLnVuYmluZEhvc3QuYmluZCh0aGlzKV1cbiAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIsIGV2ZW50KSA9PiB0aGlzLmhvc3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgdW5iaW5kSG9zdCAoKSB7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIsIGV2ZW50KSA9PiB0aGlzLmhvc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGb2N1c0tleU1hbmFnZXI8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIExpc3RLZXlNYW5hZ2VyPFQ+IHtcblxuICAgIHByb3RlY3RlZCBzZXRFbnRyeUFjdGl2ZSAoZW50cnk6IExpc3RFbnRyeTxUPiwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHN1cGVyLnNldEVudHJ5QWN0aXZlKGVudHJ5LCBpbnRlcmFjdGl2ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlSXRlbSAmJiBpbnRlcmFjdGl2ZSkgdGhpcy5hY3RpdmVJdGVtLmZvY3VzKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyIH0gZnJvbSAnLi4vLi4vc3JjJztcblxuZXhwb3J0IGNvbnN0IEFSSUFCb29sZWFuQ29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Ym9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlKSA9PiB2YWx1ZSA9PT0gJ3RydWUnLFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGh0bWwsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vc3JjJztcblxuQGNvbXBvbmVudDxJY29uPih7XG4gICAgc2VsZWN0b3I6ICd1aS1pY29uJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgd2lkdGg6IHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSk7XG4gICAgICAgIGhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgcGFkZGluZzogY2FsYygodmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKSAtIHZhcigtLWZvbnQtc2l6ZSwgMWVtKSkgLyAyKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgdmVydGljYWwtYWxpZ246IGJvdHRvbTtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICB9XG4gICAgc3ZnIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgb3ZlcmZsb3c6IHZpc2libGU7XG4gICAgICAgIGZpbGw6IHZhcigtLWljb24tY29sb3IsIGN1cnJlbnRDb2xvcik7XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD11bmldKSB7XG4gICAgICAgIHBhZGRpbmc6IDBlbTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PW1hdF0pIHtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PWVpXSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKGVsZW1lbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0ID0gZWxlbWVudC5zZXQ7XG4gICAgICAgIGNvbnN0IGljb24gPSAoc2V0ID09PSAnbWF0JylcbiAgICAgICAgICAgID8gYGljXyR7IGVsZW1lbnQuaWNvbiB9XzI0cHhgXG4gICAgICAgICAgICA6IChzZXQgPT09ICdlaScpXG4gICAgICAgICAgICAgICAgPyBgZWktJHsgZWxlbWVudC5pY29uIH0taWNvbmBcbiAgICAgICAgICAgICAgICA6IGVsZW1lbnQuaWNvbjtcblxuICAgICAgICByZXR1cm4gaHRtbGBcbiAgICAgICAgPHN2ZyBmb2N1c2FibGU9XCJmYWxzZVwiPlxuICAgICAgICAgICAgPHVzZSBocmVmPVwiJHsgKGVsZW1lbnQuY29uc3RydWN0b3IgYXMgdHlwZW9mIEljb24pLmdldFNwcml0ZShzZXQpIH0jJHsgaWNvbiB9XCJcbiAgICAgICAgICAgIHhsaW5rOmhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIiAvPlxuICAgICAgICA8L3N2Zz5gO1xuICAgIH1cbn0pXG5leHBvcnQgY2xhc3MgSWNvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBmb3IgY2FjaGluZyBhbiBpY29uIHNldCdzIHNwcml0ZSB1cmxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9zcHJpdGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBzdmcgc3ByaXRlIHVybCBmb3IgdGhlIHJlcXVlc3RlZCBpY29uIHNldFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgc3ByaXRlIHVybCBmb3IgYW4gaWNvbiBzZXQgY2FuIGJlIHNldCB0aHJvdWdoIGEgYG1ldGFgIHRhZyBpbiB0aGUgaHRtbCBkb2N1bWVudC4gWW91IGNhbiBkZWZpbmVcbiAgICAgKiBjdXN0b20gaWNvbiBzZXRzIGJ5IGNob3NpbmcgYW4gaWRlbnRpZmllciAoc3VjaCBhcyBgOm15c2V0YCBpbnN0ZWFkIG9mIGA6ZmFgLCBgOm1hdGAgb3IgYDppZWApIGFuZFxuICAgICAqIGNvbmZpZ3VyaW5nIGl0cyBsb2NhdGlvbi5cbiAgICAgKlxuICAgICAqIGBgYGh0bWxcbiAgICAgKiA8IWRvY3R5cGUgaHRtbD5cbiAgICAgKiA8aHRtbD5cbiAgICAgKiAgICA8aGVhZD5cbiAgICAgKiAgICA8IS0tIHN1cHBvcnRzIG11bHRpcGxlIHN2ZyBzcHJpdGVzIC0tPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6ZmFcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvZm9udC1hd2Vzb21lL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6bWF0XCIgY29udGVudD1cImFzc2V0cy9pY29ucy9zcHJpdGVzL21hdGVyaWFsL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6ZWlcIiBjb250ZW50PVwiYXNzZXRzL2ljb24vc3ByaXRlcy9ldmlsLWljb25zL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgY3VzdG9tIHN2ZyBzcHJpdGVzIC0tPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6bXlzZXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb24vc3ByaXRlcy9teXNldC9teV9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8L2hlYWQ+XG4gICAgICogICAgLi4uXG4gICAgICogPC9odG1sPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogV2hlbiB1c2luZyB0aGUgaWNvbiBlbGVtZW50LCBzcGVjaWZ5IHlvdXIgY3VzdG9tIGljb24gc2V0LlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhLS0gdXNlIGF0dHJpYnV0ZXMgLS0+XG4gICAgICogPHVpLWljb24gZGF0YS1pY29uPVwibXlfaWNvbl9pZFwiIGRhdGEtc2V0PVwibXlzZXRcIj48L3VpLWljb24+XG4gICAgICogPCEtLSBvciB1c2UgcHJvcGVydHkgYmluZGluZ3Mgd2l0aGluIGxpdC1odG1sIHRlbXBsYXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiAuaWNvbj0keydteV9pY29uX2lkJ30gLnNldD0keydteXNldCd9PjwvdWktaWNvbj5cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIElmIG5vIHNwcml0ZSB1cmwgaXMgc3BlY2lmaWVkIGZvciBhIHNldCwgdGhlIGljb24gZWxlbWVudCB3aWxsIGF0dGVtcHQgdG8gdXNlIGFuIHN2ZyBpY29uIGZyb21cbiAgICAgKiBhbiBpbmxpbmVkIHN2ZyBlbGVtZW50IGluIHRoZSBjdXJyZW50IGRvY3VtZW50LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgZ2V0U3ByaXRlIChzZXQ6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9zcHJpdGVzLmhhcyhzZXQpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtZXRhW25hbWU9XCJ1aS1pY29uOnNwcml0ZTokeyBzZXQgfVwiXVtjb250ZW50XWApO1xuXG4gICAgICAgICAgICBpZiAobWV0YSkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlcy5zZXQoc2V0LCBtZXRhLmdldEF0dHJpYnV0ZSgnY29udGVudCcpISk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3ByaXRlcy5nZXQoc2V0KSB8fCAnJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLWljb24nXG4gICAgfSlcbiAgICBpY29uID0gJ2luZm8nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnZGF0YS1zZXQnXG4gICAgfSlcbiAgICBzZXQgPSAnZmEnXG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncm9sZScsICdpbWcnKTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgaHRtbCwgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vc3JjJztcbmltcG9ydCB7IEFSSUFCb29sZWFuQ29udmVydGVyIH0gZnJvbSAnLi4vYXJpYS1ib29sZWFuLWNvbnZlcnRlcic7XG5pbXBvcnQgJy4uL2ljb24vaWNvbic7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcblxuQGNvbXBvbmVudDxBY2NvcmRpb25IZWFkZXI+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1oZWFkZXInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGFsbDogaW5oZXJpdDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIGZsZXg6IDEgMSAxMDAlO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWRpc2FibGVkPXRydWVdKSB7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9dHJ1ZV0pID4gdWktaWNvbi5leHBhbmQsXG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9ZmFsc2VdKSA+IHVpLWljb24uY29sbGFwc2Uge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8dWktaWNvbiBjbGFzcz1cImNvbGxhcHNlXCIgZGF0YS1pY29uPVwibWludXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICA8dWktaWNvbiBjbGFzcz1cImV4cGFuZFwiIGRhdGEtaWNvbj1cInBsdXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkhlYWRlciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBUklBQm9vbGVhbkNvbnZlcnRlclxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEFSSUFCb29sZWFuQ29udmVydGVyXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBjYXBpdGFsaXplIH0gZnJvbSAnLi4vLi4vLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvc3RyaW5nLXV0aWxzJztcblxuZXhwb3J0IHR5cGUgQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKSA9PiBUZW1wbGF0ZVJlc3VsdDtcblxuZXhwb3J0IGNvbnN0IGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHQgPT4ge1xuXG4gICAgcmV0dXJuIGh0bWxgJmNvcHk7IENvcHlyaWdodCAkeyBkYXRlLmdldEZ1bGxZZWFyKCkgfSAkeyBhdXRob3IudHJpbSgpIH1gO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBodG1sLCBwcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBjb3B5cmlnaHQsIENvcHlyaWdodEhlbHBlciB9IGZyb20gJy4uL2hlbHBlcnMvY29weXJpZ2h0JztcbmltcG9ydCB7IEFjY29yZGlvbkhlYWRlciB9IGZyb20gJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5cbmxldCBuZXh0QWNjb3JkaW9uUGFuZWxJZCA9IDA7XG5cbkBjb21wb25lbnQ8QWNjb3JkaW9uUGFuZWw+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1wYW5lbCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWhlYWRlciB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93O1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24tYm9keSB7XG4gICAgICAgIGhlaWdodDogYXV0bztcbiAgICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICAgIHRyYW5zaXRpb246IGhlaWdodCAuMnMgZWFzZS1vdXQ7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5W2FyaWEtaGlkZGVuPXRydWVdIHtcbiAgICAgICAgaGVpZ2h0OiAwO1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cbiAgICAuY29weXJpZ2h0IHtcbiAgICAgICAgcGFkZGluZzogMCAxcmVtIDFyZW07XG4gICAgICAgIGNvbG9yOiB2YXIoLS1kaXNhYmxlZC1jb2xvciwgJyNjY2MnKTtcbiAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKHBhbmVsLCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlcikgPT4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWhlYWRlclwiXG4gICAgICAgIHJvbGU9XCJoZWFkaW5nXCJcbiAgICAgICAgYXJpYS1sZXZlbD1cIiR7IHBhbmVsLmxldmVsIH1cIlxuICAgICAgICBAY2xpY2s9JHsgcGFuZWwudG9nZ2xlIH0+XG4gICAgICAgIDxzbG90IG5hbWU9XCJoZWFkZXJcIj48L3Nsb3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInVpLWFjY29yZGlvbi1ib2R5XCJcbiAgICAgICAgaWQ9XCIkeyBwYW5lbC5pZCB9LWJvZHlcIlxuICAgICAgICBzdHlsZT1cImhlaWdodDogJHsgcGFuZWwuY29udGVudEhlaWdodCB9O1wiXG4gICAgICAgIHJvbGU9XCJyZWdpb25cIlxuICAgICAgICBhcmlhLWhpZGRlbj1cIiR7ICFwYW5lbC5leHBhbmRlZCB9XCJcbiAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiJHsgcGFuZWwuaWQgfS1oZWFkZXJcIj5cbiAgICAgICAgPHNsb3Q+PC9zbG90PlxuICAgICAgICA8c3BhbiBjbGFzcz1cImNvcHlyaWdodFwiPiR7IGNvcHlyaWdodChuZXcgRGF0ZSgpLCAnQWxleGFuZGVyIFdlbmRlJykgfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvblBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBfaGVhZGVyOiBBY2NvcmRpb25IZWFkZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgX2JvZHk6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IGNvbnRlbnRIZWlnaHQgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgcmV0dXJuICF0aGlzLmV4cGFuZGVkID9cbiAgICAgICAgICAgICcwcHgnIDpcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgP1xuICAgICAgICAgICAgICAgIGAkeyB0aGlzLl9ib2R5LnNjcm9sbEhlaWdodCB9cHhgIDpcbiAgICAgICAgICAgICAgICAnYXV0byc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIGxldmVsID0gMTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICAgIH0pXG4gICAgZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICAgIH0pXG4gICAgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yICgpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IGB1aS1hY2NvcmRpb24tcGFuZWwtJHsgbmV4dEFjY29yZGlvblBhbmVsSWQrKyB9YDtcbiAgICB9XG5cbiAgICB0b2dnbGUgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gd3JhcHBpbmcgdGhlIHByb3BlcnR5IGNoYW5nZSBpbiB0aGUgd2F0Y2ggbWV0aG9kIHdpbGwgZGlzcGF0Y2ggYSBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9oZWFkZXIpIHRoaXMuX2hlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0SGVhZGVyKHRoaXMucXVlcnlTZWxlY3RvcihBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSwgd2UgcXVlcnkgdGhlIGFjY29yZGlvbi1wYW5lbC1ib2R5XG4gICAgICAgICAgICB0aGlzLl9ib2R5ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoYCMkeyB0aGlzLmlkIH0tYm9keWApO1xuXG4gICAgICAgICAgICAvLyBoYXZpbmcgcXVlcmllZCB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHksIHtAbGluayBjb250ZW50SGVpZ2h0fSBjYW4gbm93IGNhbGN1bGF0ZSB0aGVcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaGVpZ2h0IG9mIHRoZSBwYW5lbCBib2R5IGZvciBhbmltYXRpb25cbiAgICAgICAgICAgIC8vIGluIG9yZGVyIHRvIHJlLWV2YWx1YXRlIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nIGZvciB7QGxpbmsgY29udGVudEhlaWdodH0gd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gdHJpZ2dlciBhbm90aGVyIHJlbmRlciAodGhpcyBpcyBjaGVhcCwgb25seSBjb250ZW50SGVpZ2h0IGhhcyBjaGFuZ2VkIGFuZCB3aWxsIGJlIHVwZGF0ZWQpXG4gICAgICAgICAgICAvLyBob3dldmVyIHdlIGNhbm5vdCByZXF1ZXN0IGFub3RoZXIgdXBkYXRlIHdoaWxlIHdlIGFyZSBzdGlsbCBpbiB0aGUgY3VycmVudCB1cGRhdGUgY3ljbGVcbiAgICAgICAgICAgIC8vIHVzaW5nIGEgUHJvbWlzZSwgd2UgY2FuIGRlZmVyIHJlcXVlc3RpbmcgdGhlIHVwZGF0ZSB1bnRpbCBhZnRlciB0aGUgY3VycmVudCB1cGRhdGUgaXMgZG9uZVxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHRydWUpLnRoZW4oKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIHJlbmRlciBtZXRob2QgdG8gaW5qZWN0IGN1c3RvbSBoZWxwZXJzIGludG8gdGhlIHRlbXBsYXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoKSB7XG5cbiAgICAgICAgc3VwZXIucmVuZGVyKGNvcHlyaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEhlYWRlciAoaGVhZGVyOiBBY2NvcmRpb25IZWFkZXIgfCBudWxsKSB7XG5cbiAgICAgICAgdGhpcy5faGVhZGVyID0gaGVhZGVyO1xuXG4gICAgICAgIGlmICghaGVhZGVyKSByZXR1cm47XG5cbiAgICAgICAgaGVhZGVyLnNldEF0dHJpYnV0ZSgnc2xvdCcsICdoZWFkZXInKTtcblxuICAgICAgICBoZWFkZXIuaWQgPSBoZWFkZXIuaWQgfHwgYCR7IHRoaXMuaWQgfS1oZWFkZXJgO1xuICAgICAgICBoZWFkZXIuY29udHJvbHMgPSBgJHsgdGhpcy5pZCB9LWJvZHlgO1xuICAgICAgICBoZWFkZXIuZXhwYW5kZWQgPSB0aGlzLmV4cGFuZGVkO1xuICAgICAgICBoZWFkZXIuZGlzYWJsZWQgPSB0aGlzLmRpc2FibGVkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGh0bWwsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vc3JjJztcbmltcG9ydCB7IEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCAnLi9hY2NvcmRpb24tcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPEFjY29yZGlvbkhlYWRlcj47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICByZWZsZWN0QXR0cmlidXRlOiBmYWxzZVxuICAgIH0pXG4gICAgcm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBjc3MgfSBmcm9tICcuLi8uLi9zcmMnO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gY3NzYFxuZGVtby1hcHAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuXG5oZWFkZXIge1xuICBmbGV4OiAwIDAgYXV0bztcbn1cblxubWFpbiB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBwYWRkaW5nOiAxcmVtO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBvdmVyZmxvdzogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgxNXJlbSwgMWZyKSk7XG4gIGdyaWQtZ2FwOiAxcmVtO1xufVxuXG4uaWNvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWZsb3c6IHJvdyB3cmFwO1xufVxuXG4uc2V0dGluZ3MtbGlzdCB7XG4gIHBhZGRpbmc6IDA7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5zZXR0aW5ncy1saXN0IGxpIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuXG51aS1jYXJkIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbiB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWw6bm90KDpmaXJzdC1jaGlsZCkge1xuICBib3JkZXItdG9wOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBoMyB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIHAge1xuICBtYXJnaW46IDFyZW07XG59XG5gO1xuIiwiaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vYXBwJztcblxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlID0gKGVsZW1lbnQ6IEFwcCkgPT4gaHRtbGBcbiAgICA8aGVhZGVyPlxuICAgICAgICA8aDE+RXhhbXBsZXM8L2gxPlxuICAgIDwvaGVhZGVyPlxuXG4gICAgPG1haW4+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5JY29uPC9oMj5cblxuICAgICAgICAgICAgPGgzPkZvbnQgQXdlc29tZTwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jay1vcGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFpbnQtYnJ1c2gnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24tdHJpYW5nbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPlVuaWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYW5nbGUtcmlnaHQtYicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZS1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPk1hdGVyaWFsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb25fcmlnaHQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbWFpbCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2tfb3BlbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlZGl0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2RlbGV0ZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd3YXJuaW5nJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaGVscCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhY2NvdW50X2NpcmNsZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZXJzb24nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5FdmlsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYXBlcmNsaXAnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW5jaWwnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgyPkNoZWNrYm94PC9oMj5cbiAgICAgICAgICAgIDx1aS1jaGVja2JveCAuY2hlY2tlZD0keyB0cnVlIH0+PC91aS1jaGVja2JveD5cblxuICAgICAgICAgICAgPGgyPlRvZ2dsZTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1lbWFpbFwiPk5vdGlmaWNhdGlvbiBlbWFpbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LWVtYWlsXCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1zbXNcIj5Ob3RpZmljYXRpb24gc21zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktc21zXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeVwiPk5vdGlmaWNhdGlvbnM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5XCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkNhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktY2FyZD5cblxuICAgICAgICAgICAgPGgyPkFjdGlvbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1hY3Rpb24tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBzbG90PVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPk1vcmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvdWktYWN0aW9uLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5QbGFpbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1wbGFpbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLXBsYWluLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5UYWJzPC9oMj5cbiAgICAgICAgICAgIDx1aS10YWItbGlzdD5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTFcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTFcIj48c3Bhbj5GaXJzdCBUYWI8L3NwYW4+PC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0yXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0yXCI+U2Vjb25kIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItM1wiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtM1wiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+VGhpcmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi00XCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC00XCI+Rm91cnRoIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgPC91aS10YWItbGlzdD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMVwiPlxuICAgICAgICAgICAgICAgIDxoMz5GaXJzdCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0yXCI+XG4gICAgICAgICAgICAgICAgPGgzPlNlY29uZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSwgZHVvXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWUgY2V0ZXJvc1xuICAgICAgICAgICAgICAgICAgICBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW4gZXN0LCBldCBhdXRlbVxuICAgICAgICAgICAgICAgICAgICBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpIG5hbS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtM1wiPlxuICAgICAgICAgICAgICAgIDxoMz5UaGlyZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkknbSBkaXNhYmxlZCwgeW91IHNob3VsZG4ndCBzZWUgbWUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTRcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rm91cnRoIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+QWNjb3JkaW9uPC9oMj5cblxuICAgICAgICAgICAgPHVpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgaWQ9XCJjdXN0b20tcGFuZWwtaWRcIiBleHBhbmRlZCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBPbmU8L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICBMYXVkZW0gY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3Ryb1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXNhYm8gYW4gZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPkF0IHVzdSBlcGljdXJlaSBhc3NlbnRpb3IsIHB1dGVudCBkaXNzZW50aWV0IHJlcHVkaWFuZGFlIGVhIHF1by4gUHJvIG5lIGRlYml0aXMgcGxhY2VyYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25pZmVydW1xdWUsIGluIHNvbmV0IHZvbHVtdXMgaW50ZXJwcmV0YXJpcyBjdW0uIERvbG9ydW0gYXBwZXRlcmUgbmUgcXVvLiBEaWN0YSBxdWFsaXNxdWUgZW9zXG4gICAgICAgICAgICAgICAgICAgICAgICBlYSwgZWFtIGF0IG51bGxhIHRhbXF1YW0uXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBUd288L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVvIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNldGVyb3MgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuXG4gICAgICAgICAgICAgICAgICAgICAgICBlc3QsIGV0IGF1dGVtIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPlF1aSBzdWFzIHNvbGV0IGNldGVyb3MgY3UsIHBlcnRpbmF4IHZ1bHB1dGF0ZSBkZXRlcnJ1aXNzZXQgZW9zIG5lLiBOZSBpdXMgdmlkZSBudWxsYW0sIGFsaWVudW1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFlIHJlZm9ybWlkYW5zIGN1bSBhZC4gRWEgbWVsaW9yZSBzYXBpZW50ZW0gaW50ZXJwcmV0YXJpcyBlYW0uIENvbW11bmUgZGVsaWNhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHVkaWFuZGFlIGluIGVvcywgcGxhY2VyYXQgaW5jb3JydXB0ZSBkZWZpbml0aW9uZXMgbmVjIGV4LiBDdSBlbGl0ciB0YW50YXMgaW5zdHJ1Y3Rpb3Igc2l0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXUgZXVtIGFsaWEgZ3JhZWNlIG5lZ2xlZ2VudHVyLjwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICA8L3VpLWFjY29yZGlvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICA8L21haW4+XG4gICAgYDtcbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGh0bWwsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJy4uLy4uL3NyYyc7XG5cbi8vIHdlIGNhbiBkZWZpbmUgbWl4aW5zIGFzXG5jb25zdCBtaXhpbkNvbnRhaW5lcjogKGJhY2tncm91bmQ/OiBzdHJpbmcpID0+IHN0cmluZyA9IChiYWNrZ3JvdW5kOiBzdHJpbmcgPSAnI2ZmZicpID0+IGNzc2BcbiAgICBiYWNrZ3JvdW5kOiAkeyBiYWNrZ3JvdW5kIH07XG4gICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG5gO1xuXG5jb25zdCBzdHlsZSA9IGNzc2Bcbjpob3N0IHtcbiAgICAtLW1heC13aWR0aDogNDBjaDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZmxvdzogY29sdW1uO1xuICAgIG1heC13aWR0aDogdmFyKC0tbWF4LXdpZHRoKTtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICAgIC8qIHdlIGNhbiBhcHBseSBtaXhpbnMgd2l0aCBzcHJlYWQgc3ludGF4ICovXG4gICAgJHsgbWl4aW5Db250YWluZXIoKSB9XG59XG46OnNsb3R0ZWQoKikge1xuICAgIG1hcmdpbjogMDtcbn1cbmA7XG5cbkBjb21wb25lbnQ8Q2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2FyZCcsXG4gICAgc3R5bGVzOiBbc3R5bGVdLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1jYXJkLWJvZHlcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtZm9vdGVyXCI+PC9zbG90PlxuICAgIDxkaXY+V29ya2VyIGNvdW50ZXI6ICR7IGNhcmQuY291bnRlciB9PC9kaXY+XG4gICAgPGJ1dHRvbj5TdG9wIHdvcmtlcjwvYnV0dG9uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyITogbnVtYmVyO1xuXG4gICAgd29ya2VyITogV29ya2VyO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJykhOyB9XG4gICAgfSlcbiAgICBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ21lc3NhZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud29ya2VyOyB9XG4gICAgfSlcbiAgICBoYW5kbGVNZXNzYWdlIChldmVudDogTWVzc2FnZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNvdW50ZXIgPSBldmVudC5kYXRhKTtcbiAgICB9XG59XG5cbkBjb21wb25lbnQ8QWN0aW9uQ2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWN0aW9uLWNhcmQnLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjdGlvbkNhcmQgZXh0ZW5kcyBDYXJkIHtcblxuICAgIC8vIHdlIGNhbiBpbmhlcml0IHN0eWxlcyBleHBsaWNpdGx5XG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAgICAgICAgJ3Nsb3RbbmFtZT11aS1hY3Rpb24tY2FyZC1hY3Rpb25zXSB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiByaWdodDsgfSdcbiAgICAgICAgXVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlQ2xpY2sgKCkgeyB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogbnVsbCB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKCkgeyB9XG59XG5cbkBjb21wb25lbnQ8UGxhaW5DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1wbGFpbi1jYXJkJyxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgbWF4LXdpZHRoOiA0MGNoO1xuICAgICAgICB9YFxuICAgIF1cbiAgICAvLyBpZiB3ZSBkb24ndCBzcGVjaWZ5IGEgdGVtcGxhdGUsIGl0IHdpbGwgYmUgaW5oZXJpdGVkXG59KVxuZXhwb3J0IGNsYXNzIFBsYWluQ2FyZCBleHRlbmRzIENhcmQgeyB9XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBjb21wb25lbnQsIENvbXBvbmVudCwgY3NzLCBodG1sLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICcuLi8uLi9zcmMnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgfVxuICAgICAgICAuY2hlY2stbWFyayB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDAuMjVyZW07XG4gICAgICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDAuNjI1cmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMCAwIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsXG4gICAgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIENoYW5nZXMsXG4gICAgQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudCxcbiAgICBjc3MsXG4gICAgaHRtbCxcbiAgICBsaXN0ZW5lcixcbiAgICBwcm9wZXJ0eVxufSBmcm9tICcuLi8uLi8uLi9zcmMnO1xuaW1wb3J0IHsgQVJJQUJvb2xlYW5Db252ZXJ0ZXIgfSBmcm9tICcuLi9hcmlhLWJvb2xlYW4tY29udmVydGVyJztcbmltcG9ydCB7IFRhYlBhbmVsIH0gZnJvbSAnLi90YWItcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIHBhZGRpbmc6IDAuNXJlbSAwLjVyZW07XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItYm90dG9tOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzKSB2YXIoLS1ib3JkZXItcmFkaXVzKSAwIDA7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtc2VsZWN0ZWQ9dHJ1ZV0pOmFmdGVyIHtcbiAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHotaW5kZXg6IDI7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIGJvdHRvbTogY2FsYygtMSAqIHZhcigtLWJvcmRlci13aWR0aCkpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWJvcmRlci13aWR0aCkgKyAwLjVyZW0pO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByaXZhdGUgX3BhbmVsOiBUYWJQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFdlIHByb3ZpZGUgb3VyIG93biB0YWJpbmRleCBwcm9wZXJ0eSwgc28gd2UgY2FuIHNldCBpdCB0byBgbnVsbGBcbiAgICAgKiB0byByZW1vdmUgdGhlIHRhYmluZGV4LWF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICd0YWJpbmRleCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCE6IG51bWJlciB8IG51bGw7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLXNlbGVjdGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBUklBQm9vbGVhbkNvbnZlcnRlclxuICAgIH0pXG4gICAgZ2V0IHNlbGVjdGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gICAgfVxuXG4gICAgc2V0IHNlbGVjdGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogKHZhbHVlID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBUklBQm9vbGVhbkNvbnZlcnRlcixcbiAgICB9KVxuICAgIGdldCBkaXNhYmxlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAodGhpcy5zZWxlY3RlZCA/IDAgOiAtMSk7XG4gICAgfVxuXG4gICAgZ2V0IHBhbmVsICgpOiBUYWJQYW5lbCB8IG51bGwge1xuXG4gICAgICAgIGlmICghdGhpcy5fcGFuZWwpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRyb2xzKSBhcyBUYWJQYW5lbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9wYW5lbDtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFiJ1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAtMTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwubGFiZWxsZWRCeSA9IHRoaXMuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gZmFsc2UpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAnY2xpY2snIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWxlY3QoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBodG1sLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9zcmMnO1xuaW1wb3J0IHsgQXJyb3dEb3duIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBBY3RpdmVJdGVtQ2hhbmdlLCBGb2N1c0tleU1hbmFnZXIgfSBmcm9tICcuLi9saXN0LWtleS1tYW5hZ2VyJztcbmltcG9ydCB7IFRhYiB9IGZyb20gJy4vdGFiJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWItbGlzdCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3cgbm93cmFwO1xuICAgIH1cbiAgICA6OnNsb3R0ZWQodWktdGFiKSB7XG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4yNXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiTGlzdE5ldyBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPFRhYj47XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRUYWIhOiBUYWI7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFibGlzdCc7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChUYWIuc2VsZWN0b3IpLCAnaG9yaXpvbnRhbCcpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBjb25zdCBzbG90ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoJ3Nsb3QnKSBhcyBIVE1MU2xvdEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIHNsb3QuYWRkRXZlbnRMaXN0ZW5lcignc2xvdGNoYW5nZScsICgpID0+IHtcblxuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGAke3Nsb3QubmFtZX0gY2hhbmdlZC4uLmAsIHNsb3QuYXNzaWduZWROb2RlcygpKTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IHRoaXMucXVlcnlTZWxlY3RvcihgJHsgVGFiLnNlbGVjdG9yIH1bYXJpYS1zZWxlY3RlZD10cnVlXWApIGFzIFRhYjtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUYWJcbiAgICAgICAgICAgICAgICA/IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oc2VsZWN0ZWRUYWIpXG4gICAgICAgICAgICAgICAgOiB0aGlzLmZvY3VzTWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcblxuICAgICAgICAgICAgLy8gc2V0dGluZyB0aGUgYWN0aXZlIGl0ZW0gdmlhIHRoZSBmb2N1cyBtYW5hZ2VyJ3MgQVBJIHdpbGwgbm90IHRyaWdnZXIgYW4gZXZlbnRcbiAgICAgICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gbWFudWFsbHkgc2VsZWN0IHRoZSBpbml0aWFsbHkgYWN0aXZlIHRhYlxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLnNlbGVjdFRhYih0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAna2V5ZG93bicgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEFycm93RG93bjpcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5mb2N1c01hbmFnZXIuZ2V0QWN0aXZlSXRlbSgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFRhYiAmJiBzZWxlY3RlZFRhYi5wYW5lbCkgc2VsZWN0ZWRUYWIucGFuZWwuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxUYWJMaXN0TmV3Pih7XG4gICAgICAgIGV2ZW50OiAnYWN0aXZlLWl0ZW0tY2hhbmdlJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvY3VzTWFuYWdlcjsgfVxuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUFjdGl2ZVRhYkNoYW5nZSAoZXZlbnQ6IEFjdGl2ZUl0ZW1DaGFuZ2U8VGFiPikge1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzVGFiID0gZXZlbnQuZGV0YWlsLnByZXZpb3VzLml0ZW07XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQuaXRlbTtcblxuICAgICAgICBpZiAocHJldmlvdXNUYWIgIT09IHNlbGVjdGVkVGFiKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RUYWIocHJldmlvdXNUYWIpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RUYWIoc2VsZWN0ZWRUYWIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuc2VsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0YWIucGFuZWwpIHRhYi5wYW5lbC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkZXNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuZGVzZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGh0bWwsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vc3JjJztcbmltcG9ydCB7IEFSSUFCb29sZWFuQ29udmVydGVyIH0gZnJvbSAnLi4vYXJpYS1ib29sZWFuLWNvbnZlcnRlcic7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDAgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cyk7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1oaWRkZW4nLFxuICAgICAgICBjb252ZXJ0ZXI6IEFSSUFCb29sZWFuQ29udmVydGVyLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtbGFiZWxsZWRieScsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgbGFiZWxsZWRCeSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJwYW5lbCdcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgaHRtbCwgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vc3JjJztcbmltcG9ydCB7IEFSSUFCb29sZWFuQ29udmVydGVyIH0gZnJvbSAnLi9hcmlhLWJvb2xlYW4tY29udmVydGVyJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8VG9nZ2xlPih7XG4gICAgc2VsZWN0b3I6ICd1aS10b2dnbGUnLFxuICAgIHRlbXBsYXRlOiB0b2dnbGUgPT4gaHRtbGBcbiAgICA8c3R5bGU+XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIC0tdGltaW5nLWN1YmljOiBjdWJpYy1iZXppZXIoMC41NSwgMC4wNiwgMC42OCwgMC4xOSk7XG4gICAgICAgICAgICAtLXRpbWluZy1zaW5lOiBjdWJpYy1iZXppZXIoMC40NywgMCwgMC43NSwgMC43Mik7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tdGltaW5nOiB2YXIoLS10aW1pbmctc2luZSk7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tZHVyYXRpb246IC4xcztcbiAgICAgICAgfVxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgodmFyKC0tZm9udC1zaXplKSwgMWZyKSk7XG5cbiAgICAgICAgICAgIG1pbi13aWR0aDogY2FsYyh2YXIoLS1mb250LXNpemUpICogMiArIHZhcigtLWJvcmRlci13aWR0aCkgKiAyKTtcbiAgICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1mb250LXNpemUpICsgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgKiAyKTtcbiAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuXG4gICAgICAgICAgICAvKiB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3I7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7ICovXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD10cnVlXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICAgICAgfVxuICAgICAgICAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGhlaWdodDogdmFyKC0tZm9udC1zaXplKTtcbiAgICAgICAgICAgIHdpZHRoOiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgd2lkdGg6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl1bbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgLmxhYmVsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgLjI1cmVtO1xuICAgICAgICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIGp1c3RpZnktc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmxhYmVsLW9uIHtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwiZmFsc2VcIl0pIC5sYWJlbC1vZmYge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG5cbiAgICA8L3N0eWxlPlxuICAgIDxzcGFuIGNsYXNzPVwidG9nZ2xlLXRodW1iXCI+PC9zcGFuPlxuICAgICR7IHRvZ2dsZS5sYWJlbE9uICYmIHRvZ2dsZS5sYWJlbE9mZlxuICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vZmZcIj4keyB0b2dnbGUubGFiZWxPZmYgfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9uXCI+JHsgdG9nZ2xlLmxhYmVsT24gfTwvc3Bhbj5gXG4gICAgICAgIDogJydcbiAgICB9XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBUb2dnbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jaGVja2VkJyxcbiAgICAgICAgY29udmVydGVyOiBBUklBQm9vbGVhbkNvbnZlcnRlclxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGxhYmVsID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPbiA9ICcnO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZmFsc2VcbiAgICB9KVxuICAgIGxhYmVsT2ZmID0gJyc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnc3dpdGNoJztcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBwcm9wZXJ0eS1jaGFuZ2UgZXZlbnQgZm9yIGBjaGVja2VkYFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHNwYWNlIGtleSBmcm9tIHNjcm9sbGluZyB0aGUgcGFnZVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50IH0gZnJvbSAnLi4vLi4vc3JjJztcbmltcG9ydCAnLi9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gJy4vYXBwLnN0eWxlcyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZSB9IGZyb20gJy4vYXBwLnRlbXBsYXRlJztcbmltcG9ydCAnLi9jYXJkJztcbmltcG9ydCAnLi9jaGVja2JveCc7XG5pbXBvcnQgJy4vaWNvbi9pY29uJztcbmltcG9ydCAnLi90YWJzL3RhYic7XG5pbXBvcnQgJy4vdGFicy90YWItbGlzdCc7XG5pbXBvcnQgJy4vdGFicy90YWItcGFuZWwnO1xuaW1wb3J0ICcuL3RvZ2dsZSc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGVtby1hcHAnLFxuICAgIHNoYWRvdzogZmFsc2UsXG4gICAgc3R5bGVzOiBbc3R5bGVzXSxcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbn0pXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHsgfVxuIiwiaW1wb3J0ICcuL3NyYy9hcHAnO1xuXG5mdW5jdGlvbiBib290c3RyYXAgKCkge1xuXG4gICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd1aS1jaGVja2JveCcpO1xuXG4gICAgaWYgKGNoZWNrYm94KSB7XG5cbiAgICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hlY2tlZC1jaGFuZ2VkJywgZXZlbnQgPT4gY29uc29sZS5sb2coKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwpKTtcbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYm9vdHN0cmFwKTtcbiJdLCJuYW1lcyI6WyJwcmVwYXJlQ29uc3RydWN0b3IiLCJ0c2xpYl8xLl9fZGVjb3JhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLElBNkNPLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLO0lBQ2xDLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUM7O0lDN0RGO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVM7SUFDL0QsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLHlCQUF5QjtJQUNuRCxRQUFRLFNBQVMs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
