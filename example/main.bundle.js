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

    class TemplateController extends Behavior {
        constructor(config) {
            super();
            this.config = config;
        }
        attach(element) {
            var _a;
            if (!super.attach(element))
                return false;
            if (this.config.template) {
                const context = (_a = this.config.context, (_a !== null && _a !== void 0 ? _a : this.element));
                this.listen(context, 'update', () => this.update());
            }
            return true;
        }
        update() {
            var _a;
            if (!this.hasAttached)
                return;
            if (this.config.template) {
                const template = this.config.template;
                const context = (_a = this.config.context, (_a !== null && _a !== void 0 ? _a : this.element));
                render(template(context), this.element, { eventContext: context });
            }
        }
    }
    //# sourceMappingURL=template-controller.js.map

    const DEFAULT_OVERLAY_CONFIG = {
        positionType: 'default',
        triggerType: 'default',
        trigger: undefined,
        stacked: true,
        backdrop: true,
        closeOnBackdropClick: true,
    };
    function MixinOverlayConfig(Base, config = {}) {
        let BaseHasOverlayConfig = class BaseHasOverlayConfig extends Base {
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
                 */
                this._config = Object.assign(Object.assign({}, DEFAULT_OVERLAY_CONFIG), config);
            }
            set config(value) {
                // TODO: setting config creates a new object each time ==> need to sync with behaviors
                this._config = Object.assign(Object.assign({}, this._config), value);
            }
            get config() {
                return this._config;
            }
            //=================================
            // {@link OverlayConfig} properties
            //=================================
            set triggerType(value) {
                this.config = { triggerType: value };
            }
            get triggerType() {
                return this._config.triggerType;
            }
            set positionType(value) {
                this.config = { positionType: value };
            }
            get positionType() {
                return this._config.positionType;
            }
            set trigger(value) {
                this.config = { trigger: value };
            }
            get trigger() {
                return this._config.trigger;
            }
            set template(value) {
                this.config = { template: value };
            }
            get template() {
                return this._config.template;
            }
            set context(value) {
                this.config = { context: value };
            }
            get context() {
                return this._config.context;
            }
            set stacked(value) {
                this.config = { stacked: value };
            }
            get stacked() {
                return this._config.stacked;
            }
            set backdrop(value) {
                this.config = { backdrop: value };
            }
            get backdrop() {
                return this._config.backdrop;
            }
            set closeOnBackdropClick(value) {
                this.config = { closeOnBackdropClick: value };
            }
            get closeOnBackdropClick() {
                return this._config.closeOnBackdropClick;
            }
            //==================================
            // {@link PositionConfig} properties
            //==================================
            set origin(value) {
                this.config = { origin: value };
            }
            get origin() {
                return this._config.origin;
            }
            set width(value) {
                this.config = { width: value };
            }
            ;
            get width() {
                return this._config.width;
            }
            set height(value) {
                this.config = { height: value };
            }
            ;
            get height() {
                return this._config.height;
            }
            set maxWidth(value) {
                this.config = { maxWidth: value };
            }
            ;
            get maxWidth() {
                return this._config.maxWidth;
            }
            set maxHeight(value) {
                this.config = { maxHeight: value };
            }
            ;
            get maxHeight() {
                return this._config.maxHeight;
            }
            set minWidth(value) {
                this.config = { minWidth: value };
            }
            ;
            get minWidth() {
                return this._config.minWidth;
            }
            set minHeight(value) {
                this.config = { minHeight: value };
            }
            ;
            get minHeight() {
                return this._config.minHeight;
            }
            set alignment(value) {
                this.config = { alignment: Object.assign(Object.assign({}, this._config.alignment), value) };
            }
            ;
            get alignment() {
                return this._config.alignment;
            }
            //========================================
            // {@link OverlayTriggerConfig} properties
            //========================================
            set autoFocus(value) {
                this.config = { autoFocus: value };
            }
            get autoFocus() {
                return this._config.autoFocus;
            }
            set trapFocus(value) {
                this.config = { trapFocus: value };
            }
            get trapFocus() {
                return this._config.trapFocus;
            }
            set wrapFocus(value) {
                this.config = { wrapFocus: value };
            }
            get wrapFocus() {
                return this._config.wrapFocus;
            }
            set restoreFocus(value) {
                this.config = { restoreFocus: value };
            }
            get restoreFocus() {
                return this._config.restoreFocus;
            }
            set closeOnEscape(value) {
                this.config = { closeOnEscape: value };
            }
            get closeOnEscape() {
                return this._config.closeOnEscape;
            }
            set closeOnFocusLoss(value) {
                this.config = { closeOnFocusLoss: value };
            }
            get closeOnFocusLoss() {
                return this._config.closeOnFocusLoss;
            }
            set initialFocus(value) {
                this.config = { initialFocus: value };
            }
            get initialFocus() {
                return this._config.initialFocus;
            }
            set tabbableSelector(value) {
                this.config = { tabbableSelector: value };
            }
            get tabbableSelector() {
                return this._config.tabbableSelector;
            }
        };
        __decorate([
            property({
                attribute: false,
                observe: PropertyChangeDetectorObject,
            }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "config", null);
        __decorate([
            property({ converter: AttributeConverterString }),
            __metadata("design:type", String),
            __metadata("design:paramtypes", [String])
        ], BaseHasOverlayConfig.prototype, "triggerType", null);
        __decorate([
            property({ converter: AttributeConverterString }),
            __metadata("design:type", String),
            __metadata("design:paramtypes", [String])
        ], BaseHasOverlayConfig.prototype, "positionType", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "trigger", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "template", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "context", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "stacked", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "backdrop", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "closeOnBackdropClick", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "origin", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "width", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "height", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "maxWidth", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "maxHeight", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "minWidth", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "minHeight", null);
        __decorate([
            property({
                attribute: false,
                observe: PropertyChangeDetectorObject
            }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "alignment", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "autoFocus", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "trapFocus", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "wrapFocus", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "restoreFocus", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "closeOnEscape", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], BaseHasOverlayConfig.prototype, "closeOnFocusLoss", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], BaseHasOverlayConfig.prototype, "initialFocus", null);
        __decorate([
            property({ attribute: false }),
            __metadata("design:type", String),
            __metadata("design:paramtypes", [String])
        ], BaseHasOverlayConfig.prototype, "tabbableSelector", null);
        BaseHasOverlayConfig = __decorate([
            component({ define: false })
        ], BaseHasOverlayConfig);
        return BaseHasOverlayConfig;
    }
    //# sourceMappingURL=overlay-config.js.map

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
            if (this.overlay.isActive)
                return;
            // if this trigger's overlay is no longer active we can close it
            // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
            const parent = this.overlay.getParentOverlay();
            if (this.config.closeOnFocusLoss) {
                this.overlay.hide();
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
                    this.overlay.hide();
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

    const DEFAULT_OVERLAY_TRIGGER_CONFIG = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), { autoFocus: true, trapFocus: true, restoreFocus: true, closeOnEscape: true, closeOnFocusLoss: true });
    //# sourceMappingURL=overlay-trigger-config.js.map

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
            this.overlay.toggle();
        }
        handleKeydown(event) {
            switch (event.key) {
                case Enter:
                case Space:
                    // handle events that happen on the trigger element
                    if (event.target === this.element) {
                        cancel(event);
                        this.overlay.toggle();
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
            this.listen(this.element, 'mouseenter', () => this.overlay.show());
            this.listen(this.element, 'mouseleave', () => this.overlay.hide());
            this.listen(this.element, 'focus', () => this.overlay.show());
            this.listen(this.element, 'blur', () => this.overlay.hide());
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

    var Overlay_1;
    const ALREADY_INITIALIZED_ERROR = () => new Error('Cannot initialize Overlay. Overlay has already been initialized.');
    const ID_GENERATOR = new IDGenerator('partkit-overlay-');
    let Overlay = Overlay_1 = class Overlay extends MixinOverlayConfig(MixinRole(Component, 'dialog'), Object.assign({}, DEFAULT_OVERLAY_CONFIG)) {
        constructor() {
            super(...arguments);
            this._open = false;
            this.isReattaching = false;
            this.tabindex = -1;
            this.zindex = 1;
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
            // TODO: maybe we can allow changing OverlayInit...
            if (this.isInitialized)
                throw ALREADY_INITIALIZED_ERROR();
            this._overlayTriggerFactory = config.overlayTriggerFactory || this._overlayTriggerFactory;
            this._positionControllerFactory = config.positionControllerFactory || this._positionControllerFactory;
            this._overlayRoot = config.overlayRoot || this._overlayRoot;
            this._initialized = true;
        }
        get static() {
            return this.constructor;
        }
        /**
        * An overlay is considered focused, if either itself or any of its descendant nodes has focus.
        */
        get isFocused() {
            return this.open && this.contains(activeElement());
        }
        /**
         * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
         */
        get isActive() {
            let isFound = false;
            let isActive = false;
            if (this.config.stacked && this.open) {
                for (let current of this.static.activeOverlays) {
                    isFound = isFound || current === this;
                    isActive = isFound && current.isFocused;
                    if (isActive)
                        break;
                }
            }
            console.log('Overlay.isActive()... ', this.id, isActive);
            return isActive;
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
        connectedCallback() {
            if (this.isReattaching)
                return;
            super.connectedCallback();
            this.id = this.id || ID_GENERATOR.getNextID();
            this._marker = document.createComment(this.id);
        }
        disconnectedCallback() {
            var _a, _b;
            if (this.isReattaching)
                return;
            // TODO: test that closing a disconnected overlay doesn't behave unexpected
            this.hide();
            (_a = this.overlayTrigger) === null || _a === void 0 ? void 0 : _a.detach();
            (_b = this.positionController) === null || _b === void 0 ? void 0 : _b.detach();
            this.overlayTrigger = undefined;
            this.positionController = undefined;
            super.disconnectedCallback();
        }
        updateCallback(changes, firstUpdate) {
            this.style.zIndex = this.zindex.toString();
            if (firstUpdate) {
                this.setAttribute('aria-hidden', `${!this.open}`);
                this.configure();
            }
            else {
                if (changes.has('config')) {
                    console.log('Overlay.updateCallback()... config: ', this.config);
                    this.configure();
                }
            }
            if (changes.has('open')) {
                this.setAttribute('aria-hidden', `${!this.open}`);
                this.notifyProperty('open', changes.get('open'), this.open);
            }
        }
        show() {
            this.open = true;
        }
        hide() {
            this.open = false;
        }
        toggle(open) {
            this.open = (open !== null && open !== void 0 ? open : !this.open);
        }
        dispose() {
            var _a;
            this.hide();
            (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this);
        }
        /**
         * Get the parent overlay of an active overlay
         *
         * @description
         * If an overlay is stacked, its parent overlay is the one from which it was opened.
         * The parent overlay will be in the activeOverlays stack just before this one.
         */
        getParentOverlay() {
            if (this.config.stacked && this.open) {
                // we start with parent being undefined
                // if the first active overlay in the set matches the specified overlay
                // then indeed the overlay has no parent (the first active overlay is the root)
                let parent = undefined;
                // go through the active overlays
                for (let current of this.static.activeOverlays) {
                    // if we have reached the specified active overlay
                    // we can return the parent of that overlay (it's the active overlay in the stack just before this one)
                    if (current === this)
                        return parent;
                    // if we haven't found the specified overlay yet, we set
                    // the current overlay as potential parent and move on
                    parent = current;
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
            // TODO: non-stacked overlays should get a higher z-index
            // only stacked overlays participate in the stack management
            if (!this.config.stacked)
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
            // open ? this.static.activeOverlays.add(this) : this.static.activeOverlays.delete(this);
            if (open) {
                this.static.activeOverlays.add(this);
                this.zindex = this.static._zIndex + this.static.activeOverlays.size;
            }
            else {
                this.static.activeOverlays.delete(this);
                this.zindex = 0;
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
            // overlays can be nested, which means that 'open-changed'-events can bubble from
            // a nested overlay to its parent - we only want to handle events from this overlay
            // instance, so we check the {@link ComponentEvent}'s detail.target property
            if (event.detail.target !== this)
                return;
            if (this.open) {
                this.handleOpen();
            }
            else {
                this.handleClose();
            }
        }
        handleOpen() {
            var _a, _b, _c, _d;
            this.moveToRoot();
            (_a = this.positionController) === null || _a === void 0 ? void 0 : _a.attach(this);
            (_b = this.positionController) === null || _b === void 0 ? void 0 : _b.update();
            (_c = this.templateController) === null || _c === void 0 ? void 0 : _c.attach(this);
            (_d = this.templateController) === null || _d === void 0 ? void 0 : _d.update();
        }
        handleClose() {
            var _a, _b;
            (_a = this.positionController) === null || _a === void 0 ? void 0 : _a.detach();
            (_b = this.templateController) === null || _b === void 0 ? void 0 : _b.detach();
            this.moveFromRoot();
        }
        configure() {
            var _a, _b, _c;
            console.log('Overlay.configure()... config: ', this.config);
            // dispose of the overlay trigger and position controller
            (_a = this.overlayTrigger) === null || _a === void 0 ? void 0 : _a.detach();
            (_b = this.positionController) === null || _b === void 0 ? void 0 : _b.detach();
            (_c = this.templateController) === null || _c === void 0 ? void 0 : _c.detach();
            // recreate the overlay trigger and position controller from the config
            this.overlayTrigger = this.static.overlayTriggerFactory.create(this.config.triggerType, this.config, this);
            this.positionController = this.static.positionControllerFactory.create(this.config.positionType, this.config);
            this.templateController = new TemplateController(this.config);
            // attach the overlay trigger
            this.overlayTrigger.attach(this.config.trigger);
            // attach the position controller, if the overlay is open
            if (this.open) {
                this.positionController.attach(this);
                this.positionController.update();
                this.templateController.attach(this);
                this.templateController.update();
            }
        }
        moveToRoot() {
            if (!this.static.overlayRoot)
                return;
            this.isReattaching = true;
            replaceWith(this._marker, this);
            // TODO: think about this: if we move overlays in the DOM, then a component's selectors might
            // get lost if an update happens in that component while the overlay is open
            // maybe it's better to select dialogs instances only once after 1st render?
            // maybe have a selector option to disable re-querying?
            this.static.overlayRoot.appendChild(this);
            this.isReattaching = false;
        }
        moveFromRoot() {
            if (!this.static.overlayRoot)
                return;
            this.isReattaching = true;
            replaceWith(this, this._marker);
            this.isReattaching = false;
        }
    };
    /** @internal */
    Overlay._initialized = false;
    /** @internal */
    Overlay._overlayTriggerFactory = new OverlayTriggerFactory();
    /** @internal */
    Overlay._positionControllerFactory = new PositionControllerFactory();
    Overlay._zIndex = 1000000;
    Overlay.activeOverlays = new Set();
    __decorate([
        property({ converter: AttributeConverterBoolean }),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], Overlay.prototype, "open", null);
    __decorate([
        property({ converter: AttributeConverterNumber }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "tabindex", void 0);
    __decorate([
        property({ attribute: false, converter: AttributeConverterNumber }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "zindex", void 0);
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

    let OverlayDemoComponent = class OverlayDemoComponent extends Component {
        constructor() {
            super(...arguments);
            this.counter = 0;
        }
        get dialogConfig() {
            return {
                triggerType: 'dialog',
                positionType: 'connected',
                trigger: this.dialogButton,
                origin: this.dialogButton,
            };
        }
        get tooltipConfig() {
            return {
                triggerType: 'tooltip',
                positionType: 'connected',
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
                        vertical: '1rem'
                    }
                },
                trigger: this.tooltipTrigger,
                origin: this.tooltipTrigger,
                stacked: false,
            };
        }
        connectedCallback() {
            super.connectedCallback();
            this.count();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            clearTimeout(this.timeout);
            this.counter = 0;
        }
        updateCallback(changes, firstUpdate) {
        }
        toggleOverlay() {
            this.overlay.open = !this.overlay.open;
        }
        toggleProgrammaticOverlay() {
            if (!this.programmaticOverlay) {
                const template = () => html `
                <h3>Programmatic Overlay</h3>
                <p>This is some overlay content from a template function.</p>
                <p>This counter is from the demo component's context: ${this.counter}</p>
                <p><button @click=${this.toggleProgrammaticOverlay}>Got it</button></p>
            `;
                this.programmaticOverlay = new Overlay();
                this.programmaticOverlay.config = { template, context: this };
                this.renderRoot.appendChild(this.programmaticOverlay);
                this.programmaticOverlay.show();
            }
            else {
                this.programmaticOverlay.toggle();
            }
        }
        count() {
            this.timeout = setTimeout(() => {
                this.counter++;
                this.count();
            }, 1000);
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
    __decorate([
        selector({ query: '#tooltip-trigger' }),
        __metadata("design:type", HTMLSpanElement)
    ], OverlayDemoComponent.prototype, "tooltipTrigger", void 0);
    __decorate([
        property({ attribute: false }),
        __metadata("design:type", Object)
    ], OverlayDemoComponent.prototype, "counter", void 0);
    OverlayDemoComponent = __decorate([
        component({
            selector: 'overlay-demo',
            styles: [css `
    :host {
        display: block;
        padding-bottom: 20rem;
    }
    `],
            template: element => html `
    <h2>Overlay</h2>

    <h3>Default Overlay</h3>

    <p>An overlay with its default configuration. The overlay is opened and closed programmatically.</p>

    <button @click=${element.toggleOverlay}>Toggle Overlay</button>

    <ui-overlay id="overlay">
        <h3>Overlay</h3>
        <p>This is the overlay's content.</p>
        <p>Some interactive elements showcase the auto-focus and focus-trap behavior of the overlay.</p>
        <p>
            <label>Some text field <input type="text" placeholder=""/></label>
        </p>
        <p>
            <label>Some checkbox <input type="checkbox"/></label>
        </p>
        <p>
            <button>Some button</button>
        </p>
    </ui-overlay>

    <h3>Programmatic Overlay</h3>

    <p>An overlay which is created via the static Overlay.create() method.</p>

    <button @click=${element.toggleProgrammaticOverlay}>Toggle Overlay</button>

    <h3>Tooltip</h3>

    <p>An overlay which is configured as a tooltip, with its <code>trigger-type</code> being <code>"tooltip"</code> and <code>position-type</code> being <code>"connected"</code>. Tooltips should not be stacked, as they are not considered active - meaning, they usually don't receive focus and are not interactive.</p>

    <p>This is some sample text with a <a href="#" id="tooltip-trigger">tooltip</a>.</p>

    <ui-overlay id="tooltip" .config=${element.tooltipConfig}>
        <p>This is the tooltip content.</p>
    </ui-overlay>

    <h3>Dialog</h3>

    <p>An overlay which is configured as a dialog, with its <code>trigger-type</code> being <code>"dialog"</code> and <code>position-type</code> being <code>"connected"</code>.</p>
    <p>The dialog itself contains 2 nested dialogs to showcase overlay's stacking feature and focus management.</p>

    <button id="dialog-button">Toggle Dialog</button>

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
            <h3>Nested Dialog 1</h3>
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3NlbGVjdG9yLWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvdGFza3MudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9zZWxlY3Rvci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvcHJvcGVydHkudHMiLCIuLi9zcmMvZXZlbnRzLnRzIiwiLi4vc3JjL2NvbXBvbmVudC50cyIsIi4uL3NyYy9jc3MudHMiLCJzcmMva2V5cy50cyIsInNyYy9saXN0LWtleS1tYW5hZ2VyLnRzIiwic3JjL2ljb24vaWNvbi50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLWhlYWRlci50cyIsInNyYy9oZWxwZXJzL2NvcHlyaWdodC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmVsLnRzIiwic3JjL2FjY29yZGlvbi9hY2NvcmRpb24udHMiLCJzcmMvYXBwLnN0eWxlcy50cyIsInNyYy9hcHAudGVtcGxhdGUudHMiLCJzcmMvY2FyZC50cyIsInNyYy9jaGVja2JveC50cyIsInNyYy9kb20udHMiLCJzcmMvaWQtZ2VuZXJhdG9yLnRzIiwic3JjL21peGlucy9yb2xlLnRzIiwic3JjL3Bvc2l0aW9uL3NpemUudHMiLCJzcmMvcG9zaXRpb24vYWxpZ25tZW50LnRzIiwic3JjL3Bvc2l0aW9uL3Bvc2l0aW9uLnRzIiwic3JjL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZy50cyIsInNyYy9ldmVudHMudHMiLCJzcmMvYmVoYXZpb3IvYmVoYXZpb3IudHMiLCJzcmMvcG9zaXRpb24vcG9zaXRpb24tY29udHJvbGxlci50cyIsInNyYy91dGlscy9jb25maWcudHMiLCJzcmMvYmVoYXZpb3IvYmVoYXZpb3ItZmFjdG9yeS50cyIsInNyYy9wb3NpdGlvbi9jb250cm9sbGVyL2NlbnRlcmVkLXBvc2l0aW9uLWNvbnRyb2xsZXIudHMiLCJzcmMvcG9zaXRpb24vY29udHJvbGxlci9jb25uZWN0ZWQtcG9zaXRpb24tY29udHJvbGxlci50cyIsInNyYy9wb3NpdGlvbi9wb3NpdGlvbi1jb250cm9sbGVyLWZhY3RvcnkudHMiLCJzcmMvdGVtcGxhdGUvdGVtcGxhdGUtY29udHJvbGxlci50cyIsInNyYy9vdmVybGF5LW5ldy9vdmVybGF5LWNvbmZpZy50cyIsInNyYy9mb2N1cy9mb2N1cy1jaGFuZ2UtZXZlbnQudHMiLCJzcmMvZm9jdXMvZm9jdXMtbW9uaXRvci50cyIsInNyYy9mb2N1cy9mb2N1cy10cmFwLnRzIiwic3JjL292ZXJsYXktbmV3L3RyaWdnZXIvb3ZlcmxheS10cmlnZ2VyLnRzIiwic3JjL292ZXJsYXktbmV3L3RyaWdnZXIvb3ZlcmxheS10cmlnZ2VyLWNvbmZpZy50cyIsInNyYy9vdmVybGF5LW5ldy90cmlnZ2VyL2RpYWxvZy1vdmVybGF5LXRyaWdnZXIudHMiLCJzcmMvb3ZlcmxheS1uZXcvdHJpZ2dlci90b29sdGlwLW92ZXJsYXktdHJpZ2dlci50cyIsInNyYy9vdmVybGF5LW5ldy90cmlnZ2VyL292ZXJsYXktdHJpZ2dlci1mYWN0b3J5LnRzIiwic3JjL292ZXJsYXktbmV3L292ZXJsYXkudHMiLCJzcmMvb3ZlcmxheS1uZXcvZGVtby50cyIsInNyYy90YWJzL3RhYi50cyIsInNyYy90YWJzL3RhYi1saXN0LnRzIiwic3JjL3RhYnMvdGFiLXBhbmVsLnRzIiwic3JjL3RvZ2dsZS50cyIsInNyYy9ldmVudC1vcmRlci1kZW1vLnRzIiwic3JjL2FwcC50cyIsIm1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuY29uc3QgZGlyZWN0aXZlcyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIEJyYW5kcyBhIGZ1bmN0aW9uIGFzIGEgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24gc28gdGhhdCBsaXQtaHRtbCB3aWxsIGNhbGxcbiAqIHRoZSBmdW5jdGlvbiBkdXJpbmcgdGVtcGxhdGUgcmVuZGVyaW5nLCByYXRoZXIgdGhhbiBwYXNzaW5nIGFzIGEgdmFsdWUuXG4gKlxuICogQSBfZGlyZWN0aXZlXyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBQYXJ0IGFzIGFuIGFyZ3VtZW50LiBJdCBoYXMgdGhlXG4gKiBzaWduYXR1cmU6IGAocGFydDogUGFydCkgPT4gdm9pZGAuXG4gKlxuICogQSBkaXJlY3RpdmUgX2ZhY3RvcnlfIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhcmd1bWVudHMgZm9yIGRhdGEgYW5kXG4gKiBjb25maWd1cmF0aW9uIGFuZCByZXR1cm5zIGEgZGlyZWN0aXZlLiBVc2VycyBvZiBkaXJlY3RpdmUgdXN1YWxseSByZWZlciB0b1xuICogdGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGFzIHRoZSBkaXJlY3RpdmUuIEZvciBleGFtcGxlLCBcIlRoZSByZXBlYXQgZGlyZWN0aXZlXCIuXG4gKlxuICogVXN1YWxseSBhIHRlbXBsYXRlIGF1dGhvciB3aWxsIGludm9rZSBhIGRpcmVjdGl2ZSBmYWN0b3J5IGluIHRoZWlyIHRlbXBsYXRlXG4gKiB3aXRoIHJlbGV2YW50IGFyZ3VtZW50cywgd2hpY2ggd2lsbCB0aGVuIHJldHVybiBhIGRpcmVjdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBIZXJlJ3MgYW4gZXhhbXBsZSBvZiB1c2luZyB0aGUgYHJlcGVhdCgpYCBkaXJlY3RpdmUgZmFjdG9yeSB0aGF0IHRha2VzIGFuXG4gKiBhcnJheSBhbmQgYSBmdW5jdGlvbiB0byByZW5kZXIgYW4gaXRlbTpcbiAqXG4gKiBgYGBqc1xuICogaHRtbGA8dWw+PCR7cmVwZWF0KGl0ZW1zLCAoaXRlbSkgPT4gaHRtbGA8bGk+JHtpdGVtfTwvbGk+YCl9PC91bD5gXG4gKiBgYGBcbiAqXG4gKiBXaGVuIGByZXBlYXRgIGlzIGludm9rZWQsIGl0IHJldHVybnMgYSBkaXJlY3RpdmUgZnVuY3Rpb24gdGhhdCBjbG9zZXMgb3ZlclxuICogYGl0ZW1zYCBhbmQgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uLiBXaGVuIHRoZSBvdXRlciB0ZW1wbGF0ZSBpcyByZW5kZXJlZCwgdGhlXG4gKiByZXR1cm4gZGlyZWN0aXZlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBQYXJ0IGZvciB0aGUgZXhwcmVzc2lvbi5cbiAqIGByZXBlYXRgIHRoZW4gcGVyZm9ybXMgaXQncyBjdXN0b20gbG9naWMgdG8gcmVuZGVyIG11bHRpcGxlIGl0ZW1zLlxuICpcbiAqIEBwYXJhbSBmIFRoZSBkaXJlY3RpdmUgZmFjdG9yeSBmdW5jdGlvbi4gTXVzdCBiZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhXG4gKiBmdW5jdGlvbiBvZiB0aGUgc2lnbmF0dXJlIGAocGFydDogUGFydCkgPT4gdm9pZGAuIFRoZSByZXR1cm5lZCBmdW5jdGlvbiB3aWxsXG4gKiBiZSBjYWxsZWQgd2l0aCB0aGUgcGFydCBvYmplY3QuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBpbXBvcnQge2RpcmVjdGl2ZSwgaHRtbH0gZnJvbSAnbGl0LWh0bWwnO1xuICpcbiAqIGNvbnN0IGltbXV0YWJsZSA9IGRpcmVjdGl2ZSgodikgPT4gKHBhcnQpID0+IHtcbiAqICAgaWYgKHBhcnQudmFsdWUgIT09IHYpIHtcbiAqICAgICBwYXJ0LnNldFZhbHVlKHYpXG4gKiAgIH1cbiAqIH0pO1xuICovXG5leHBvcnQgY29uc3QgZGlyZWN0aXZlID0gKGYpID0+ICgoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IGQgPSBmKC4uLmFyZ3MpO1xuICAgIGRpcmVjdGl2ZXMuc2V0KGQsIHRydWUpO1xuICAgIHJldHVybiBkO1xufSk7XG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmUgPSAobykgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ2Z1bmN0aW9uJyAmJiBkaXJlY3RpdmVzLmhhcyhvKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RpdmUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBUcnVlIGlmIHRoZSBjdXN0b20gZWxlbWVudHMgcG9seWZpbGwgaXMgaW4gdXNlLlxuICovXG5leHBvcnQgY29uc3QgaXNDRVBvbHlmaWxsID0gd2luZG93LmN1c3RvbUVsZW1lbnRzICE9PSB1bmRlZmluZWQgJiZcbiAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMucG9seWZpbGxXcmFwRmx1c2hDYWxsYmFjayAhPT1cbiAgICAgICAgdW5kZWZpbmVkO1xuLyoqXG4gKiBSZXBhcmVudHMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0YCAoaW5jbHVzaXZlKSB0byBgZW5kYCAoZXhjbHVzaXZlKSxcbiAqIGludG8gYW5vdGhlciBjb250YWluZXIgKGNvdWxkIGJlIHRoZSBzYW1lIGNvbnRhaW5lciksIGJlZm9yZSBgYmVmb3JlYC4gSWZcbiAqIGBiZWZvcmVgIGlzIG51bGwsIGl0IGFwcGVuZHMgdGhlIG5vZGVzIHRvIHRoZSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCByZXBhcmVudE5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwsIGJlZm9yZSA9IG51bGwpID0+IHtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgICAgICBjb25zdCBuID0gc3RhcnQubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoc3RhcnQsIGJlZm9yZSk7XG4gICAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG59O1xuLyoqXG4gKiBSZW1vdmVzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydGAgKGluY2x1c2l2ZSkgdG8gYGVuZGAgKGV4Y2x1c2l2ZSksIGZyb21cbiAqIGBjb250YWluZXJgLlxuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlTm9kZXMgPSAoY29udGFpbmVyLCBzdGFydCwgZW5kID0gbnVsbCkgPT4ge1xuICAgIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzdGFydC5uZXh0U2libGluZztcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHN0YXJ0KTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kb20uanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE4IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyB0aGF0IGEgdmFsdWUgd2FzIGhhbmRsZWQgYnkgYSBkaXJlY3RpdmUgYW5kXG4gKiBzaG91bGQgbm90IGJlIHdyaXR0ZW4gdG8gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vQ2hhbmdlID0ge307XG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIGEgTm9kZVBhcnQgdG8gZnVsbHkgY2xlYXIgaXRzIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBub3RoaW5nID0ge307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgd2l0aCBlbWJlZGRlZCB1bmlxdWUga2V5IHRvIGF2b2lkIGNvbGxpc2lvbiB3aXRoXG4gKiBwb3NzaWJsZSB0ZXh0IGluIHRlbXBsYXRlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG1hcmtlciA9IGB7e2xpdC0ke1N0cmluZyhNYXRoLnJhbmRvbSgpKS5zbGljZSgyKX19fWA7XG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHVzZWQgdGV4dC1wb3NpdGlvbnMsIG11bHRpLWJpbmRpbmcgYXR0cmlidXRlcywgYW5kXG4gKiBhdHRyaWJ1dGVzIHdpdGggbWFya3VwLWxpa2UgdGV4dCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBub2RlTWFya2VyID0gYDwhLS0ke21hcmtlcn0tLT5gO1xuZXhwb3J0IGNvbnN0IG1hcmtlclJlZ2V4ID0gbmV3IFJlZ0V4cChgJHttYXJrZXJ9fCR7bm9kZU1hcmtlcn1gKTtcbi8qKlxuICogU3VmZml4IGFwcGVuZGVkIHRvIGFsbCBib3VuZCBhdHRyaWJ1dGUgbmFtZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCA9ICckbGl0JCc7XG4vKipcbiAqIEFuIHVwZGF0ZWFibGUgVGVtcGxhdGUgdGhhdCB0cmFja3MgdGhlIGxvY2F0aW9uIG9mIGR5bmFtaWMgcGFydHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBlbGVtZW50KSB7XG4gICAgICAgIHRoaXMucGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgY29uc3Qgbm9kZXNUb1JlbW92ZSA9IFtdO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgICAgICAvLyBFZGdlIG5lZWRzIGFsbCA0IHBhcmFtZXRlcnMgcHJlc2VudDsgSUUxMSBuZWVkcyAzcmQgcGFyYW1ldGVyIHRvIGJlIG51bGxcbiAgICAgICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihlbGVtZW50LmNvbnRlbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgbGFzdCBpbmRleCBhc3NvY2lhdGVkIHdpdGggYSBwYXJ0LiBXZSB0cnkgdG8gZGVsZXRlXG4gICAgICAgIC8vIHVubmVjZXNzYXJ5IG5vZGVzLCBidXQgd2UgbmV2ZXIgd2FudCB0byBhc3NvY2lhdGUgdHdvIGRpZmZlcmVudCBwYXJ0c1xuICAgICAgICAvLyB0byB0aGUgc2FtZSBpbmRleC4gVGhleSBtdXN0IGhhdmUgYSBjb25zdGFudCBub2RlIGJldHdlZW4uXG4gICAgICAgIGxldCBsYXN0UGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBjb25zdCB7IHN0cmluZ3MsIHZhbHVlczogeyBsZW5ndGggfSB9ID0gcmVzdWx0O1xuICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGV4aGF1c3RlZCB0aGUgY29udGVudCBpbnNpZGUgYSBuZXN0ZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHdlIHN0aWxsIGhhdmUgcGFydHMgKHRoZSBvdXRlciBmb3ItbG9vcCksIHdlIGtub3c6XG4gICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBhIHRlbXBsYXRlIGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgIC8vIC0gVGhlIHdhbGtlciB3aWxsIGZpbmQgYSBuZXh0Tm9kZSBvdXRzaWRlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxIC8qIE5vZGUuRUxFTUVOVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBub2RlLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBhdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICAvLyBQZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05hbWVkTm9kZU1hcCxcbiAgICAgICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlcyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgcmV0dXJuZWQgaW4gZG9jdW1lbnQgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIEluIHBhcnRpY3VsYXIsIEVkZ2UvSUUgY2FuIHJldHVybiB0aGVtIG91dCBvZiBvcmRlciwgc28gd2UgY2Fubm90XG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc3VtZSBhIGNvcnJlc3BvbmRlbmNlIGJldHdlZW4gcGFydCBpbmRleCBhbmQgYXR0cmlidXRlIGluZGV4LlxuICAgICAgICAgICAgICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5kc1dpdGgoYXR0cmlidXRlc1tpXS5uYW1lLCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjb3VudC0tID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIHNlY3Rpb24gbGVhZGluZyB1cCB0byB0aGUgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4cHJlc3Npb24gaW4gdGhpcyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ0ZvclBhcnQgPSBzdHJpbmdzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzdHJpbmdGb3JQYXJ0KVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbGwgYm91bmQgYXR0cmlidXRlcyBoYXZlIGhhZCBhIHN1ZmZpeCBhZGRlZCBpblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVtcGxhdGVSZXN1bHQjZ2V0SFRNTCB0byBvcHQgb3V0IG9mIHNwZWNpYWwgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoYW5kbGluZy4gVG8gbG9vayB1cCB0aGUgYXR0cmlidXRlIHZhbHVlIHdlIGFsc28gbmVlZCB0byBhZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdWZmaXguXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVMb29rdXBOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpICsgYm91bmRBdHRyaWJ1dGVTdWZmaXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0aWNzID0gYXR0cmlidXRlVmFsdWUuc3BsaXQobWFya2VyUmVnZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ2F0dHJpYnV0ZScsIGluZGV4LCBuYW1lLCBzdHJpbmdzOiBzdGF0aWNzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IHN0YXRpY3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAzIC8qIE5vZGUuVEVYVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5vZGUuZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5pbmRleE9mKG1hcmtlcikgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSBkYXRhLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG5ldyB0ZXh0IG5vZGUgZm9yIGVhY2ggbGl0ZXJhbCBzZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIG5vZGVzIGFyZSBhbHNvIHVzZWQgYXMgdGhlIG1hcmtlcnMgZm9yIG5vZGUgcGFydHNcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluc2VydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzID0gc3RyaW5nc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGNyZWF0ZU1hcmtlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoICE9PSBudWxsICYmIGVuZHNXaXRoKG1hdGNoWzJdLCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgbWF0Y2hbMV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMl0uc2xpY2UoMCwgLWJvdW5kQXR0cmlidXRlU3VmZml4Lmxlbmd0aCkgKyBtYXRjaFszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGluc2VydCwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiArK2luZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gdGV4dCwgd2UgbXVzdCBpbnNlcnQgYSBjb21tZW50IHRvIG1hcmsgb3VyIHBsYWNlLlxuICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gdHJ1c3QgaXQgd2lsbCBzdGljayBhcm91bmQgYWZ0ZXIgY2xvbmluZy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0cmluZ3NbbGFzdEluZGV4XSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb1JlbW92ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gc3RyaW5nc1tsYXN0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBwYXJ0IGZvciBlYWNoIG1hdGNoIGZvdW5kXG4gICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBsYXN0SW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBOb2RlLkNPTU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmRhdGEgPT09IG1hcmtlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBtYXJrZXIgbm9kZSB0byBiZSB0aGUgc3RhcnROb2RlIG9mIHRoZSBQYXJ0IGlmIGFueSBvZlxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZm9sbG93aW5nIGFyZSB0cnVlOlxuICAgICAgICAgICAgICAgICAgICAvLyAgKiBXZSBkb24ndCBoYXZlIGEgcHJldmlvdXNTaWJsaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vICAqIFRoZSBwcmV2aW91c1NpYmxpbmcgaXMgYWxyZWFkeSB0aGUgc3RhcnQgb2YgYSBwcmV2aW91cyBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXZpb3VzU2libGluZyA9PT0gbnVsbCB8fCBpbmRleCA9PT0gbGFzdFBhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RQYXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIG5leHRTaWJsaW5nLCBrZWVwIHRoaXMgbm9kZSBzbyB3ZSBoYXZlIGFuIGVuZC5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHJlbW92ZSBpdCB0byBzYXZlIGZ1dHVyZSBjb3N0cy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb1JlbW92ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA9IG5vZGUuZGF0YS5pbmRleE9mKG1hcmtlciwgaSArIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW1lbnQgbm9kZSBoYXMgYSBiaW5kaW5nIG1hcmtlciBpbnNpZGUsIG1ha2UgYW4gaW5hY3RpdmUgcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGJpbmRpbmcgd29uJ3Qgd29yaywgYnV0IHN1YnNlcXVlbnQgYmluZGluZ3Mgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGNvbnNpZGVyIHdoZXRoZXIgaXQncyBldmVuIHdvcnRoIGl0IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIGJpbmRpbmdzIGluIGNvbW1lbnRzIHdvcmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXg6IC0xIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVtb3ZlIHRleHQgYmluZGluZyBub2RlcyBhZnRlciB0aGUgd2FsayB0byBub3QgZGlzdHVyYiB0aGUgVHJlZVdhbGtlclxuICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXNUb1JlbW92ZSkge1xuICAgICAgICAgICAgbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pO1xuICAgICAgICB9XG4gICAgfVxufVxuY29uc3QgZW5kc1dpdGggPSAoc3RyLCBzdWZmaXgpID0+IHtcbiAgICBjb25zdCBpbmRleCA9IHN0ci5sZW5ndGggLSBzdWZmaXgubGVuZ3RoO1xuICAgIHJldHVybiBpbmRleCA+PSAwICYmIHN0ci5zbGljZShpbmRleCkgPT09IHN1ZmZpeDtcbn07XG5leHBvcnQgY29uc3QgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgPSAocGFydCkgPT4gcGFydC5pbmRleCAhPT0gLTE7XG4vLyBBbGxvd3MgYGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpYCB0byBiZSByZW5hbWVkIGZvciBhXG4vLyBzbWFsbCBtYW51YWwgc2l6ZS1zYXZpbmdzLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuLyoqXG4gKiBUaGlzIHJlZ2V4IGV4dHJhY3RzIHRoZSBhdHRyaWJ1dGUgbmFtZSBwcmVjZWRpbmcgYW4gYXR0cmlidXRlLXBvc2l0aW9uXG4gKiBleHByZXNzaW9uLiBJdCBkb2VzIHRoaXMgYnkgbWF0Y2hpbmcgdGhlIHN5bnRheCBhbGxvd2VkIGZvciBhdHRyaWJ1dGVzXG4gKiBhZ2FpbnN0IHRoZSBzdHJpbmcgbGl0ZXJhbCBkaXJlY3RseSBwcmVjZWRpbmcgdGhlIGV4cHJlc3Npb24sIGFzc3VtaW5nIHRoYXRcbiAqIHRoZSBleHByZXNzaW9uIGlzIGluIGFuIGF0dHJpYnV0ZS12YWx1ZSBwb3NpdGlvbi5cbiAqXG4gKiBTZWUgYXR0cmlidXRlcyBpbiB0aGUgSFRNTCBzcGVjOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2VsZW1lbnRzLWF0dHJpYnV0ZXNcbiAqXG4gKiBcIiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiIGFyZSBIVE1MIHNwYWNlIGNoYXJhY3RlcnM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNzcGFjZS1jaGFyYWN0ZXJzXG4gKlxuICogXCJcXDAtXFx4MUZcXHg3Ri1cXHg5RlwiIGFyZSBVbmljb2RlIGNvbnRyb2wgY2hhcmFjdGVycywgd2hpY2ggaW5jbHVkZXMgZXZlcnlcbiAqIHNwYWNlIGNoYXJhY3RlciBleGNlcHQgXCIgXCIuXG4gKlxuICogU28gYW4gYXR0cmlidXRlIGlzOlxuICogICogVGhlIG5hbWU6IGFueSBjaGFyYWN0ZXIgZXhjZXB0IGEgY29udHJvbCBjaGFyYWN0ZXIsIHNwYWNlIGNoYXJhY3RlciwgKCcpLFxuICogICAgKFwiKSwgXCI+XCIsIFwiPVwiLCBvciBcIi9cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5IFwiPVwiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnk6XG4gKiAgICAqIEFueSBjaGFyYWN0ZXIgZXhjZXB0IHNwYWNlLCAoJyksIChcIiksIFwiPFwiLCBcIj5cIiwgXCI9XCIsIChgKSwgb3JcbiAqICAgICogKFwiKSB0aGVuIGFueSBub24tKFwiKSwgb3JcbiAqICAgICogKCcpIHRoZW4gYW55IG5vbi0oJylcbiAqL1xuZXhwb3J0IGNvbnN0IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXggPSAvKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKShbXlxcMC1cXHgxRlxceDdGLVxceDlGIFwiJz49L10rKShbIFxceDA5XFx4MGFcXHgwY1xceDBkXSo9WyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qKD86W14gXFx4MDlcXHgwYVxceDBjXFx4MGRcIidgPD49XSp8XCJbXlwiXSp8J1teJ10qKSkkLztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyBpc0NFUG9seWZpbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBpc1RlbXBsYXRlUGFydEFjdGl2ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiBhIGBUZW1wbGF0ZWAgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSBhbmQgdXBkYXRlZFxuICogd2l0aCBuZXcgdmFsdWVzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSB7XG4gICAgY29uc3RydWN0b3IodGVtcGxhdGUsIHByb2Nlc3Nvciwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLl9fcGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvcjtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgdXBkYXRlKHZhbHVlcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LnNldFZhbHVlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX19wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuY29tbWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Nsb25lKCkge1xuICAgICAgICAvLyBUaGVyZSBhcmUgYSBudW1iZXIgb2Ygc3RlcHMgaW4gdGhlIGxpZmVjeWNsZSBvZiBhIHRlbXBsYXRlIGluc3RhbmNlJ3NcbiAgICAgICAgLy8gRE9NIGZyYWdtZW50OlxuICAgICAgICAvLyAgMS4gQ2xvbmUgLSBjcmVhdGUgdGhlIGluc3RhbmNlIGZyYWdtZW50XG4gICAgICAgIC8vICAyLiBBZG9wdCAtIGFkb3B0IGludG8gdGhlIG1haW4gZG9jdW1lbnRcbiAgICAgICAgLy8gIDMuIFByb2Nlc3MgLSBmaW5kIHBhcnQgbWFya2VycyBhbmQgY3JlYXRlIHBhcnRzXG4gICAgICAgIC8vICA0LiBVcGdyYWRlIC0gdXBncmFkZSBjdXN0b20gZWxlbWVudHNcbiAgICAgICAgLy8gIDUuIFVwZGF0ZSAtIHNldCBub2RlLCBhdHRyaWJ1dGUsIHByb3BlcnR5LCBldGMuLCB2YWx1ZXNcbiAgICAgICAgLy8gIDYuIENvbm5lY3QgLSBjb25uZWN0IHRvIHRoZSBkb2N1bWVudC4gT3B0aW9uYWwgYW5kIG91dHNpZGUgb2YgdGhpc1xuICAgICAgICAvLyAgICAgbWV0aG9kLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSBoYXZlIGEgZmV3IGNvbnN0cmFpbnRzIG9uIHRoZSBvcmRlcmluZyBvZiB0aGVzZSBzdGVwczpcbiAgICAgICAgLy8gICogV2UgbmVlZCB0byB1cGdyYWRlIGJlZm9yZSB1cGRhdGluZywgc28gdGhhdCBwcm9wZXJ0eSB2YWx1ZXMgd2lsbCBwYXNzXG4gICAgICAgIC8vICAgIHRocm91Z2ggYW55IHByb3BlcnR5IHNldHRlcnMuXG4gICAgICAgIC8vICAqIFdlIHdvdWxkIGxpa2UgdG8gcHJvY2VzcyBiZWZvcmUgdXBncmFkaW5nIHNvIHRoYXQgd2UncmUgc3VyZSB0aGF0IHRoZVxuICAgICAgICAvLyAgICBjbG9uZWQgZnJhZ21lbnQgaXMgaW5lcnQgYW5kIG5vdCBkaXN0dXJiZWQgYnkgc2VsZi1tb2RpZnlpbmcgRE9NLlxuICAgICAgICAvLyAgKiBXZSB3YW50IGN1c3RvbSBlbGVtZW50cyB0byB1cGdyYWRlIGV2ZW4gaW4gZGlzY29ubmVjdGVkIGZyYWdtZW50cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gR2l2ZW4gdGhlc2UgY29uc3RyYWludHMsIHdpdGggZnVsbCBjdXN0b20gZWxlbWVudHMgc3VwcG9ydCB3ZSB3b3VsZFxuICAgICAgICAvLyBwcmVmZXIgdGhlIG9yZGVyOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSwgQ29ubmVjdFxuICAgICAgICAvL1xuICAgICAgICAvLyBCdXQgU2FmYXJpIGRvb2VzIG5vdCBpbXBsZW1lbnQgQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5I3VwZ3JhZGUsIHNvIHdlXG4gICAgICAgIC8vIGNhbiBub3QgaW1wbGVtZW50IHRoYXQgb3JkZXIgYW5kIHN0aWxsIGhhdmUgdXBncmFkZS1iZWZvcmUtdXBkYXRlIGFuZFxuICAgICAgICAvLyB1cGdyYWRlIGRpc2Nvbm5lY3RlZCBmcmFnbWVudHMuIFNvIHdlIGluc3RlYWQgc2FjcmlmaWNlIHRoZVxuICAgICAgICAvLyBwcm9jZXNzLWJlZm9yZS11cGdyYWRlIGNvbnN0cmFpbnQsIHNpbmNlIGluIEN1c3RvbSBFbGVtZW50cyB2MSBlbGVtZW50c1xuICAgICAgICAvLyBtdXN0IG5vdCBtb2RpZnkgdGhlaXIgbGlnaHQgRE9NIGluIHRoZSBjb25zdHJ1Y3Rvci4gV2Ugc3RpbGwgaGF2ZSBpc3N1ZXNcbiAgICAgICAgLy8gd2hlbiBjby1leGlzdGluZyB3aXRoIENFdjAgZWxlbWVudHMgbGlrZSBQb2x5bWVyIDEsIGFuZCB3aXRoIHBvbHlmaWxsc1xuICAgICAgICAvLyB0aGF0IGRvbid0IHN0cmljdGx5IGFkaGVyZSB0byB0aGUgbm8tbW9kaWZpY2F0aW9uIHJ1bGUgYmVjYXVzZSBzaGFkb3dcbiAgICAgICAgLy8gRE9NLCB3aGljaCBtYXkgYmUgY3JlYXRlZCBpbiB0aGUgY29uc3RydWN0b3IsIGlzIGVtdWxhdGVkIGJ5IGJlaW5nIHBsYWNlZFxuICAgICAgICAvLyBpbiB0aGUgbGlnaHQgRE9NLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgcmVzdWx0aW5nIG9yZGVyIGlzIG9uIG5hdGl2ZSBpczogQ2xvbmUsIEFkb3B0LCBVcGdyYWRlLCBQcm9jZXNzLFxuICAgICAgICAvLyBVcGRhdGUsIENvbm5lY3QuIGRvY3VtZW50LmltcG9ydE5vZGUoKSBwZXJmb3JtcyBDbG9uZSwgQWRvcHQsIGFuZCBVcGdyYWRlXG4gICAgICAgIC8vIGluIG9uZSBzdGVwLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgQ3VzdG9tIEVsZW1lbnRzIHYxIHBvbHlmaWxsIHN1cHBvcnRzIHVwZ3JhZGUoKSwgc28gdGhlIG9yZGVyIHdoZW5cbiAgICAgICAgLy8gcG9seWZpbGxlZCBpcyB0aGUgbW9yZSBpZGVhbDogQ2xvbmUsIFByb2Nlc3MsIEFkb3B0LCBVcGdyYWRlLCBVcGRhdGUsXG4gICAgICAgIC8vIENvbm5lY3QuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaXNDRVBvbHlmaWxsID9cbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LmNsb25lTm9kZSh0cnVlKSA6XG4gICAgICAgICAgICBkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnRlbXBsYXRlLnBhcnRzO1xuICAgICAgICAvLyBFZGdlIG5lZWRzIGFsbCA0IHBhcmFtZXRlcnMgcHJlc2VudDsgSUUxMSBuZWVkcyAzcmQgcGFyYW1ldGVyIHRvIGJlIG51bGxcbiAgICAgICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihmcmFnbWVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfFRFWFR9ICovLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICAgICAgbGV0IHBhcnQ7XG4gICAgICAgIGxldCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgdGhlIG5vZGVzIGFuZCBwYXJ0cyBvZiBhIHRlbXBsYXRlXG4gICAgICAgIHdoaWxlIChwYXJ0SW5kZXggPCBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcnQgPSBwYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgaWYgKCFpc1RlbXBsYXRlUGFydEFjdGl2ZShwYXJ0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9ncmVzcyB0aGUgdHJlZSB3YWxrZXIgdW50aWwgd2UgZmluZCBvdXIgbmV4dCBwYXJ0J3Mgbm9kZS5cbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBtdWx0aXBsZSBwYXJ0cyBtYXkgc2hhcmUgdGhlIHNhbWUgbm9kZSAoYXR0cmlidXRlIHBhcnRzXG4gICAgICAgICAgICAvLyBvbiBhIHNpbmdsZSBlbGVtZW50KSwgc28gdGhpcyBsb29wIG1heSBub3QgcnVuIGF0IGFsbC5cbiAgICAgICAgICAgIHdoaWxlIChub2RlSW5kZXggPCBwYXJ0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgbm9kZUluZGV4Kys7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gbm9kZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UndmUgZXhoYXVzdGVkIHRoZSBjb250ZW50IGluc2lkZSBhIG5lc3RlZCB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHdlIHN0aWxsIGhhdmUgcGFydHMgKHRoZSBvdXRlciBmb3ItbG9vcCksIHdlIGtub3c6XG4gICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGUgd2Fsa2VyIHdpbGwgZmluZCBhIG5leHROb2RlIG91dHNpZGUgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UndmUgYXJyaXZlZCBhdCBvdXIgcGFydCdzIG5vZGUuXG4gICAgICAgICAgICBpZiAocGFydC50eXBlID09PSAnbm9kZScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wcm9jZXNzb3IuaGFuZGxlVGV4dEV4cHJlc3Npb24odGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICBwYXJ0Lmluc2VydEFmdGVyTm9kZShub2RlLnByZXZpb3VzU2libGluZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaCguLi50aGlzLnByb2Nlc3Nvci5oYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhub2RlLCBwYXJ0Lm5hbWUsIHBhcnQuc3RyaW5ncywgdGhpcy5vcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDRVBvbHlmaWxsKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZG9wdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgICAgICAgY3VzdG9tRWxlbWVudHMudXBncmFkZShmcmFnbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLWluc3RhbmNlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgYm91bmRBdHRyaWJ1dGVTdWZmaXgsIGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXgsIG1hcmtlciwgbm9kZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuY29uc3QgY29tbWVudE1hcmtlciA9IGAgJHttYXJrZXJ9IGA7XG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiBgaHRtbGAsIHdoaWNoIGhvbGRzIGEgVGVtcGxhdGUgYW5kIHRoZSB2YWx1ZXMgZnJvbVxuICogaW50ZXJwb2xhdGVkIGV4cHJlc3Npb25zLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0cmluZ3MsIHZhbHVlcywgdHlwZSwgcHJvY2Vzc29yKSB7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHN0cmluZyBvZiBIVE1MIHVzZWQgdG8gY3JlYXRlIGEgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gICAgICovXG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgY29uc3QgbCA9IHRoaXMuc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgaHRtbCA9ICcnO1xuICAgICAgICBsZXQgaXNDb21tZW50QmluZGluZyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMuc3RyaW5nc1tpXTtcbiAgICAgICAgICAgIC8vIEZvciBlYWNoIGJpbmRpbmcgd2Ugd2FudCB0byBkZXRlcm1pbmUgdGhlIGtpbmQgb2YgbWFya2VyIHRvIGluc2VydFxuICAgICAgICAgICAgLy8gaW50byB0aGUgdGVtcGxhdGUgc291cmNlIGJlZm9yZSBpdCdzIHBhcnNlZCBieSB0aGUgYnJvd3NlcidzIEhUTUxcbiAgICAgICAgICAgIC8vIHBhcnNlci4gVGhlIG1hcmtlciB0eXBlIGlzIGJhc2VkIG9uIHdoZXRoZXIgdGhlIGV4cHJlc3Npb24gaXMgaW4gYW5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZSwgdGV4dCwgb3IgY29tbWVudCBwb2lzaXRpb24uXG4gICAgICAgICAgICAvLyAgICogRm9yIG5vZGUtcG9zaXRpb24gYmluZGluZ3Mgd2UgaW5zZXJ0IGEgY29tbWVudCB3aXRoIHRoZSBtYXJrZXJcbiAgICAgICAgICAgIC8vICAgICBzZW50aW5lbCBhcyBpdHMgdGV4dCBjb250ZW50LCBsaWtlIDwhLS17e2xpdC1ndWlkfX0tLT4uXG4gICAgICAgICAgICAvLyAgICogRm9yIGF0dHJpYnV0ZSBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIGZvciB0aGVcbiAgICAgICAgICAgIC8vICAgICBmaXJzdCBiaW5kaW5nLCBzbyB0aGF0IHdlIHN1cHBvcnQgdW5xdW90ZWQgYXR0cmlidXRlIGJpbmRpbmdzLlxuICAgICAgICAgICAgLy8gICAgIFN1YnNlcXVlbnQgYmluZGluZ3MgY2FuIHVzZSBhIGNvbW1lbnQgbWFya2VyIGJlY2F1c2UgbXVsdGktYmluZGluZ1xuICAgICAgICAgICAgLy8gICAgIGF0dHJpYnV0ZXMgbXVzdCBiZSBxdW90ZWQuXG4gICAgICAgICAgICAvLyAgICogRm9yIGNvbW1lbnQgYmluZGluZ3Mgd2UgaW5zZXJ0IGp1c3QgdGhlIG1hcmtlciBzZW50aW5lbCBzbyB3ZSBkb24ndFxuICAgICAgICAgICAgLy8gICAgIGNsb3NlIHRoZSBjb21tZW50LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBzY2FucyB0aGUgdGVtcGxhdGUgc291cmNlLCBidXQgaXMgKm5vdCogYW4gSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBXZSBkb24ndCBuZWVkIHRvIHRyYWNrIHRoZSB0cmVlIHN0cnVjdHVyZSBvZiB0aGUgSFRNTCwgb25seVxuICAgICAgICAgICAgLy8gd2hldGhlciBhIGJpbmRpbmcgaXMgaW5zaWRlIGEgY29tbWVudCwgYW5kIGlmIG5vdCwgaWYgaXQgYXBwZWFycyB0byBiZVxuICAgICAgICAgICAgLy8gdGhlIGZpcnN0IGJpbmRpbmcgaW4gYW4gYXR0cmlidXRlLlxuICAgICAgICAgICAgY29uc3QgY29tbWVudE9wZW4gPSBzLmxhc3RJbmRleE9mKCc8IS0tJyk7XG4gICAgICAgICAgICAvLyBXZSdyZSBpbiBjb21tZW50IHBvc2l0aW9uIGlmIHdlIGhhdmUgYSBjb21tZW50IG9wZW4gd2l0aCBubyBmb2xsb3dpbmdcbiAgICAgICAgICAgIC8vIGNvbW1lbnQgY2xvc2UuIEJlY2F1c2UgPC0tIGNhbiBhcHBlYXIgaW4gYW4gYXR0cmlidXRlIHZhbHVlIHRoZXJlIGNhblxuICAgICAgICAgICAgLy8gYmUgZmFsc2UgcG9zaXRpdmVzLlxuICAgICAgICAgICAgaXNDb21tZW50QmluZGluZyA9IChjb21tZW50T3BlbiA+IC0xIHx8IGlzQ29tbWVudEJpbmRpbmcpICYmXG4gICAgICAgICAgICAgICAgcy5pbmRleE9mKCctLT4nLCBjb21tZW50T3BlbiArIDEpID09PSAtMTtcbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGFuIGF0dHJpYnV0ZS1saWtlIHNlcXVlbmNlIHByZWNlZWRpbmcgdGhlXG4gICAgICAgICAgICAvLyBleHByZXNzaW9uLiBUaGlzIGNhbiBtYXRjaCBcIm5hbWU9dmFsdWVcIiBsaWtlIHN0cnVjdHVyZXMgaW4gdGV4dCxcbiAgICAgICAgICAgIC8vIGNvbW1lbnRzLCBhbmQgYXR0cmlidXRlIHZhbHVlcywgc28gdGhlcmUgY2FuIGJlIGZhbHNlLXBvc2l0aXZlcy5cbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZU1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZU1hdGNoID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgb25seSBpbiB0aGlzIGJyYW5jaCBpZiB3ZSBkb24ndCBoYXZlIGEgYXR0cmlidXRlLWxpa2VcbiAgICAgICAgICAgICAgICAvLyBwcmVjZWVkaW5nIHNlcXVlbmNlLiBGb3IgY29tbWVudHMsIHRoaXMgZ3VhcmRzIGFnYWluc3QgdW51c3VhbFxuICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZSB2YWx1ZXMgbGlrZSA8ZGl2IGZvbz1cIjwhLS0keydiYXInfVwiPi4gQ2FzZXMgbGlrZVxuICAgICAgICAgICAgICAgIC8vIDwhLS0gZm9vPSR7J2Jhcid9LS0+IGFyZSBoYW5kbGVkIGNvcnJlY3RseSBpbiB0aGUgYXR0cmlidXRlIGJyYW5jaFxuICAgICAgICAgICAgICAgIC8vIGJlbG93LlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcyArIChpc0NvbW1lbnRCaW5kaW5nID8gY29tbWVudE1hcmtlciA6IG5vZGVNYXJrZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIGF0dHJpYnV0ZXMgd2UgdXNlIGp1c3QgYSBtYXJrZXIgc2VudGluZWwsIGFuZCBhbHNvIGFwcGVuZCBhXG4gICAgICAgICAgICAgICAgLy8gJGxpdCQgc3VmZml4IHRvIHRoZSBuYW1lIHRvIG9wdC1vdXQgb2YgYXR0cmlidXRlLXNwZWNpZmljIHBhcnNpbmdcbiAgICAgICAgICAgICAgICAvLyB0aGF0IElFIGFuZCBFZGdlIGRvIGZvciBzdHlsZSBhbmQgY2VydGFpbiBTVkcgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMuc3Vic3RyKDAsIGF0dHJpYnV0ZU1hdGNoLmluZGV4KSArIGF0dHJpYnV0ZU1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlTWF0Y2hbMl0gKyBib3VuZEF0dHJpYnV0ZVN1ZmZpeCArIGF0dHJpYnV0ZU1hdGNoWzNdICtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy5zdHJpbmdzW2xdO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGVFbGVtZW50KCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHRoaXMuZ2V0SFRNTCgpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuLyoqXG4gKiBBIFRlbXBsYXRlUmVzdWx0IGZvciBTVkcgZnJhZ21lbnRzLlxuICpcbiAqIFRoaXMgY2xhc3Mgd3JhcHMgSFRNTCBpbiBhbiBgPHN2Zz5gIHRhZyBpbiBvcmRlciB0byBwYXJzZSBpdHMgY29udGVudHMgaW4gdGhlXG4gKiBTVkcgbmFtZXNwYWNlLCB0aGVuIG1vZGlmaWVzIHRoZSB0ZW1wbGF0ZSB0byByZW1vdmUgdGhlIGA8c3ZnPmAgdGFnIHNvIHRoYXRcbiAqIGNsb25lcyBvbmx5IGNvbnRhaW5lciB0aGUgb3JpZ2luYWwgZnJhZ21lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTVkdUZW1wbGF0ZVJlc3VsdCBleHRlbmRzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBnZXRIVE1MKCkge1xuICAgICAgICByZXR1cm4gYDxzdmc+JHtzdXBlci5nZXRIVE1MKCl9PC9zdmc+YDtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGVFbGVtZW50KCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHN1cGVyLmdldFRlbXBsYXRlRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGVtcGxhdGUuY29udGVudDtcbiAgICAgICAgY29uc3Qgc3ZnRWxlbWVudCA9IGNvbnRlbnQuZmlyc3RDaGlsZDtcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChzdmdFbGVtZW50KTtcbiAgICAgICAgcmVwYXJlbnROb2Rlcyhjb250ZW50LCBzdmdFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtcmVzdWx0LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL3BhcnQuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgISh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykpO1xufTtcbmV4cG9ydCBjb25zdCBpc0l0ZXJhYmxlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpIHx8XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgISEodmFsdWUgJiYgdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSk7XG59O1xuLyoqXG4gKiBXcml0ZXMgYXR0cmlidXRlIHZhbHVlcyB0byB0aGUgRE9NIGZvciBhIGdyb3VwIG9mIEF0dHJpYnV0ZVBhcnRzIGJvdW5kIHRvIGFcbiAqIHNpbmdsZSBhdHRpYnV0ZS4gVGhlIHZhbHVlIGlzIG9ubHkgc2V0IG9uY2UgZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHNcbiAqIGZvciBhbiBhdHRyaWJ1dGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgICAgIHRoaXMucGFydHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wYXJ0c1tpXSA9IHRoaXMuX2NyZWF0ZVBhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2luZ2xlIHBhcnQuIE92ZXJyaWRlIHRoaXMgdG8gY3JlYXRlIGEgZGlmZmVybnQgdHlwZSBvZiBwYXJ0LlxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IEF0dHJpYnV0ZVBhcnQodGhpcyk7XG4gICAgfVxuICAgIF9nZXRWYWx1ZSgpIHtcbiAgICAgICAgY29uc3Qgc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcbiAgICAgICAgY29uc3QgbCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IHRleHQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRleHQgKz0gc3RyaW5nc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLnBhcnRzW2ldO1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBwYXJ0LnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2KSB8fCAhaXNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiBTdHJpbmcodik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHQgb2Ygdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdCA9PT0gJ3N0cmluZycgPyB0IDogU3RyaW5nKHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRleHQgKz0gc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCB0aGlzLl9nZXRWYWx1ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQSBQYXJ0IHRoYXQgY29udHJvbHMgYWxsIG9yIHBhcnQgb2YgYW4gYXR0cmlidXRlIHZhbHVlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoY29tbWl0dGVyKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY29tbWl0dGVyID0gY29tbWl0dGVyO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IG5vQ2hhbmdlICYmICghaXNQcmltaXRpdmUodmFsdWUpIHx8IHZhbHVlICE9PSB0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGEgbm90IGEgZGlyZWN0aXZlLCBkaXJ0eSB0aGUgY29tbWl0dGVyIHNvIHRoYXQgaXQnbGxcbiAgICAgICAgICAgIC8vIGNhbGwgc2V0QXR0cmlidXRlLiBJZiB0aGUgdmFsdWUgaXMgYSBkaXJlY3RpdmUsIGl0J2xsIGRpcnR5IHRoZVxuICAgICAgICAgICAgLy8gY29tbWl0dGVyIGlmIGl0IGNhbGxzIHNldFZhbHVlKCkuXG4gICAgICAgICAgICBpZiAoIWlzRGlyZWN0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tbWl0dGVyLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1pdHRlci5jb21taXQoKTtcbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGEgbG9jYXRpb24gd2l0aGluIGEgTm9kZSB0cmVlLiBMaWtlIGEgUmFuZ2UsIE5vZGVQYXJ0XG4gKiBoYXMgc3RhcnQgYW5kIGVuZCBsb2NhdGlvbnMgYW5kIGNhbiBzZXQgYW5kIHVwZGF0ZSB0aGUgTm9kZXMgYmV0d2VlbiB0aG9zZVxuICogbG9jYXRpb25zLlxuICpcbiAqIE5vZGVQYXJ0cyBzdXBwb3J0IHNldmVyYWwgdmFsdWUgdHlwZXM6IHByaW1pdGl2ZXMsIE5vZGVzLCBUZW1wbGF0ZVJlc3VsdHMsXG4gKiBhcyB3ZWxsIGFzIGFycmF5cyBhbmQgaXRlcmFibGVzIG9mIHRob3NlIHR5cGVzLlxuICovXG5leHBvcnQgY2xhc3MgTm9kZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG8oY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIG5vZGUgKGJldHdlZW4gYHJlZmAgYW5kIGByZWZgJ3MgbmV4dFxuICAgICAqIHNpYmxpbmcpLiBCb3RoIGByZWZgIGFuZCBpdHMgbmV4dCBzaWJsaW5nIG11c3QgYmUgc3RhdGljLCB1bmNoYW5naW5nIG5vZGVzXG4gICAgICogc3VjaCBhcyB0aG9zZSB0aGF0IGFwcGVhciBpbiBhIGxpdGVyYWwgc2VjdGlvbiBvZiBhIHRlbXBsYXRlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJOb2RlKHJlZikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IHJlZjtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgcGFyZW50IHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvUGFydChwYXJ0KSB7XG4gICAgICAgIHBhcnQuX19pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHBhcnQuX19pbnNlcnQodGhpcy5lbmROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBhZnRlciB0aGUgYHJlZmAgcGFydC5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyUGFydChyZWYpIHtcbiAgICAgICAgcmVmLl9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYuZW5kTm9kZTtcbiAgICAgICAgcmVmLmVuZE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNQcmltaXRpdmUodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZVJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0l0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gbm90aGluZykge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5vdGhpbmc7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBGYWxsYmFjaywgd2lsbCByZW5kZXIgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9faW5zZXJ0KG5vZGUpIHtcbiAgICAgICAgdGhpcy5lbmROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxuICAgIF9fY29tbWl0Tm9kZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX19pbnNlcnQodmFsdWUpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9fY29tbWl0VGV4dCh2YWx1ZSkge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zdGFydE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG4gICAgICAgIC8vIElmIGB2YWx1ZWAgaXNuJ3QgYWxyZWFkeSBhIHN0cmluZywgd2UgZXhwbGljaXRseSBjb252ZXJ0IGl0IGhlcmUgaW4gY2FzZVxuICAgICAgICAvLyBpdCBjYW4ndCBiZSBpbXBsaWNpdGx5IGNvbnZlcnRlZCAtIGkuZS4gaXQncyBhIHN5bWJvbC5cbiAgICAgICAgY29uc3QgdmFsdWVBc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLmVuZE5vZGUucHJldmlvdXNTaWJsaW5nICYmXG4gICAgICAgICAgICBub2RlLm5vZGVUeXBlID09PSAzIC8qIE5vZGUuVEVYVF9OT0RFICovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBvbmx5IGhhdmUgYSBzaW5nbGUgdGV4dCBub2RlIGJldHdlZW4gdGhlIG1hcmtlcnMsIHdlIGNhbiBqdXN0XG4gICAgICAgICAgICAvLyBzZXQgaXRzIHZhbHVlLCByYXRoZXIgdGhhbiByZXBsYWNpbmcgaXQuXG4gICAgICAgICAgICAvLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBDYW4gd2UganVzdCBjaGVjayBpZiB0aGlzLnZhbHVlIGlzIHByaW1pdGl2ZT9cbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IHZhbHVlQXNTdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZShkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZUFzU3RyaW5nKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlRmFjdG9yeSh2YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVJbnN0YW5jZSAmJlxuICAgICAgICAgICAgdGhpcy52YWx1ZS50ZW1wbGF0ZSA9PT0gdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgcHJvcGFnYXRlIHRoZSB0ZW1wbGF0ZSBwcm9jZXNzb3IgZnJvbSB0aGUgVGVtcGxhdGVSZXN1bHRcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgdXNlIGl0cyBzeW50YXggZXh0ZW5zaW9uLCBldGMuIFRoZSB0ZW1wbGF0ZSBmYWN0b3J5IGNvbWVzXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSByZW5kZXIgZnVuY3Rpb24gb3B0aW9ucyBzbyB0aGF0IGl0IGNhbiBjb250cm9sIHRlbXBsYXRlXG4gICAgICAgICAgICAvLyBjYWNoaW5nIGFuZCBwcmVwcm9jZXNzaW5nLlxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSwgdmFsdWUucHJvY2Vzc29yLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpbnN0YW5jZS5fY2xvbmUoKTtcbiAgICAgICAgICAgIGluc3RhbmNlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9fY29tbWl0SXRlcmFibGUodmFsdWUpIHtcbiAgICAgICAgLy8gRm9yIGFuIEl0ZXJhYmxlLCB3ZSBjcmVhdGUgYSBuZXcgSW5zdGFuY2VQYXJ0IHBlciBpdGVtLCB0aGVuIHNldCBpdHNcbiAgICAgICAgLy8gdmFsdWUgdG8gdGhlIGl0ZW0uIFRoaXMgaXMgYSBsaXR0bGUgYml0IG9mIG92ZXJoZWFkIGZvciBldmVyeSBpdGVtIGluXG4gICAgICAgIC8vIGFuIEl0ZXJhYmxlLCBidXQgaXQgbGV0cyB1cyByZWN1cnNlIGVhc2lseSBhbmQgZWZmaWNpZW50bHkgdXBkYXRlIEFycmF5c1xuICAgICAgICAvLyBvZiBUZW1wbGF0ZVJlc3VsdHMgdGhhdCB3aWxsIGJlIGNvbW1vbmx5IHJldHVybmVkIGZyb20gZXhwcmVzc2lvbnMgbGlrZTpcbiAgICAgICAgLy8gYXJyYXkubWFwKChpKSA9PiBodG1sYCR7aX1gKSwgYnkgcmV1c2luZyBleGlzdGluZyBUZW1wbGF0ZUluc3RhbmNlcy5cbiAgICAgICAgLy8gSWYgX3ZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgICAgIC8vIGl0ZXJhYmxlIGFuZCBfdmFsdWUgd2lsbCBjb250YWluIHRoZSBOb2RlUGFydHMgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAgICAgLy8gcmVuZGVyLiBJZiBfdmFsdWUgaXMgbm90IGFuIGFycmF5LCBjbGVhciB0aGlzIHBhcnQgYW5kIG1ha2UgYSBuZXdcbiAgICAgICAgLy8gYXJyYXkgZm9yIE5vZGVQYXJ0cy5cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTGV0cyB1cyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGl0ZW1zIHdlIHN0YW1wZWQgc28gd2UgY2FuIGNsZWFyIGxlZnRvdmVyXG4gICAgICAgIC8vIGl0ZW1zIGZyb20gYSBwcmV2aW91cyByZW5kZXJcbiAgICAgICAgY29uc3QgaXRlbVBhcnRzID0gdGhpcy52YWx1ZTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpdGVtUGFydDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gcmV1c2UgYW4gZXhpc3RpbmcgcGFydFxuICAgICAgICAgICAgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICAgIGlmIChpdGVtUGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnQgPSBuZXcgTm9kZVBhcnQodGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpdGVtUGFydHMucHVzaChpdGVtUGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5hcHBlbmRJbnRvUGFydCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0Lmluc2VydEFmdGVyUGFydChpdGVtUGFydHNbcGFydEluZGV4IC0gMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1QYXJ0LnNldFZhbHVlKGl0ZW0pO1xuICAgICAgICAgICAgaXRlbVBhcnQuY29tbWl0KCk7XG4gICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydEluZGV4IDwgaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gVHJ1bmNhdGUgdGhlIHBhcnRzIGFycmF5IHNvIF92YWx1ZSByZWZsZWN0cyB0aGUgY3VycmVudCBzdGF0ZVxuICAgICAgICAgICAgaXRlbVBhcnRzLmxlbmd0aCA9IHBhcnRJbmRleDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoaXRlbVBhcnQgJiYgaXRlbVBhcnQuZW5kTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXIoc3RhcnROb2RlID0gdGhpcy5zdGFydE5vZGUpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXModGhpcy5zdGFydE5vZGUucGFyZW50Tm9kZSwgc3RhcnROb2RlLm5leHRTaWJsaW5nLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbn1cbi8qKlxuICogSW1wbGVtZW50cyBhIGJvb2xlYW4gYXR0cmlidXRlLCByb3VnaGx5IGFzIGRlZmluZWQgaW4gdGhlIEhUTUxcbiAqIHNwZWNpZmljYXRpb24uXG4gKlxuICogSWYgdGhlIHZhbHVlIGlzIHRydXRoeSwgdGhlbiB0aGUgYXR0cmlidXRlIGlzIHByZXNlbnQgd2l0aCBhIHZhbHVlIG9mXG4gKiAnJy4gSWYgdGhlIHZhbHVlIGlzIGZhbHNleSwgdGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHN0cmluZ3MubGVuZ3RoICE9PSAyIHx8IHN0cmluZ3NbMF0gIT09ICcnIHx8IHN0cmluZ3NbMV0gIT09ICcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb2xlYW4gYXR0cmlidXRlcyBjYW4gb25seSBjb250YWluIGEgc2luZ2xlIGV4cHJlc3Npb24nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gISF0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHRoaXMubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbn1cbi8qKlxuICogU2V0cyBhdHRyaWJ1dGUgdmFsdWVzIGZvciBQcm9wZXJ0eVBhcnRzLCBzbyB0aGF0IHRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlXG4gKiBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0cyBmb3IgYSBwcm9wZXJ0eS5cbiAqXG4gKiBJZiBhbiBleHByZXNzaW9uIGNvbnRyb2xzIHRoZSB3aG9sZSBwcm9wZXJ0eSB2YWx1ZSwgdGhlbiB0aGUgdmFsdWUgaXMgc2ltcGx5XG4gKiBhc3NpZ25lZCB0byB0aGUgcHJvcGVydHkgdW5kZXIgY29udHJvbC4gSWYgdGhlcmUgYXJlIHN0cmluZyBsaXRlcmFscyBvclxuICogbXVsdGlwbGUgZXhwcmVzc2lvbnMsIHRoZW4gdGhlIHN0cmluZ3MgYXJlIGV4cHJlc3Npb25zIGFyZSBpbnRlcnBvbGF0ZWQgaW50b1xuICogYSBzdHJpbmcgZmlyc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUNvbW1pdHRlciBleHRlbmRzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKTtcbiAgICAgICAgdGhpcy5zaW5nbGUgPVxuICAgICAgICAgICAgKHN0cmluZ3MubGVuZ3RoID09PSAyICYmIHN0cmluZ3NbMF0gPT09ICcnICYmIHN0cmluZ3NbMV0gPT09ICcnKTtcbiAgICB9XG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnNpbmdsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydHNbMF0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRWYWx1ZSgpO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRbdGhpcy5uYW1lXSA9IHRoaXMuX2dldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUHJvcGVydHlQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG59XG4vLyBEZXRlY3QgZXZlbnQgbGlzdGVuZXIgb3B0aW9ucyBzdXBwb3J0LiBJZiB0aGUgYGNhcHR1cmVgIHByb3BlcnR5IGlzIHJlYWRcbi8vIGZyb20gdGhlIG9wdGlvbnMgb2JqZWN0LCB0aGVuIG9wdGlvbnMgYXJlIHN1cHBvcnRlZC4gSWYgbm90LCB0aGVuIHRoZSB0aHJpZFxuLy8gYXJndW1lbnQgdG8gYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaXMgaW50ZXJwcmV0ZWQgYXMgdGhlIGJvb2xlYW4gY2FwdHVyZVxuLy8gdmFsdWUgc28gd2Ugc2hvdWxkIG9ubHkgcGFzcyB0aGUgYGNhcHR1cmVgIHByb3BlcnR5LlxubGV0IGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IGZhbHNlO1xudHJ5IHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBnZXQgY2FwdHVyZSgpIHtcbiAgICAgICAgICAgIGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xufVxuY2F0Y2ggKF9lKSB7XG59XG5leHBvcnQgY2xhc3MgRXZlbnRQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBldmVudE5hbWUsIGV2ZW50Q29udGV4dCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5ldmVudENvbnRleHQgPSBldmVudENvbnRleHQ7XG4gICAgICAgIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50ID0gKGUpID0+IHRoaXMuaGFuZGxlRXZlbnQoZSk7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3TGlzdGVuZXIgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBjb25zdCBvbGRMaXN0ZW5lciA9IHRoaXMudmFsdWU7XG4gICAgICAgIGNvbnN0IHNob3VsZFJlbW92ZUxpc3RlbmVyID0gbmV3TGlzdGVuZXIgPT0gbnVsbCB8fFxuICAgICAgICAgICAgb2xkTGlzdGVuZXIgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIChuZXdMaXN0ZW5lci5jYXB0dXJlICE9PSBvbGRMaXN0ZW5lci5jYXB0dXJlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLm9uY2UgIT09IG9sZExpc3RlbmVyLm9uY2UgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIucGFzc2l2ZSAhPT0gb2xkTGlzdGVuZXIucGFzc2l2ZSk7XG4gICAgICAgIGNvbnN0IHNob3VsZEFkZExpc3RlbmVyID0gbmV3TGlzdGVuZXIgIT0gbnVsbCAmJiAob2xkTGlzdGVuZXIgPT0gbnVsbCB8fCBzaG91bGRSZW1vdmVMaXN0ZW5lcik7XG4gICAgICAgIGlmIChzaG91bGRSZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudE5hbWUsIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9fb3B0aW9ucyA9IGdldE9wdGlvbnMobmV3TGlzdGVuZXIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5ldmVudE5hbWUsIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IG5ld0xpc3RlbmVyO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS5jYWxsKHRoaXMuZXZlbnRDb250ZXh0IHx8IHRoaXMuZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS5oYW5kbGVFdmVudChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBXZSBjb3B5IG9wdGlvbnMgYmVjYXVzZSBvZiB0aGUgaW5jb25zaXN0ZW50IGJlaGF2aW9yIG9mIGJyb3dzZXJzIHdoZW4gcmVhZGluZ1xuLy8gdGhlIHRoaXJkIGFyZ3VtZW50IG9mIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyLiBJRTExIGRvZXNuJ3Qgc3VwcG9ydCBvcHRpb25zXG4vLyBhdCBhbGwuIENocm9tZSA0MSBvbmx5IHJlYWRzIGBjYXB0dXJlYCBpZiB0aGUgYXJndW1lbnQgaXMgYW4gb2JqZWN0LlxuY29uc3QgZ2V0T3B0aW9ucyA9IChvKSA9PiBvICYmXG4gICAgKGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA/XG4gICAgICAgIHsgY2FwdHVyZTogby5jYXB0dXJlLCBwYXNzaXZlOiBvLnBhc3NpdmUsIG9uY2U6IG8ub25jZSB9IDpcbiAgICAgICAgby5jYXB0dXJlKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnRzLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IEF0dHJpYnV0ZUNvbW1pdHRlciwgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsIEV2ZW50UGFydCwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyIH0gZnJvbSAnLi9wYXJ0cy5qcyc7XG4vKipcbiAqIENyZWF0ZXMgUGFydHMgd2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhbiBhdHRyaWJ1dGUtcG9zaXRpb24gYmluZGluZywgZ2l2ZW4gdGhlIGV2ZW50LCBhdHRyaWJ1dGVcbiAgICAgKiBuYW1lLCBhbmQgc3RyaW5nIGxpdGVyYWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYmluZGluZ1xuICAgICAqIEBwYXJhbSBuYW1lICBUaGUgYXR0cmlidXRlIG5hbWVcbiAgICAgKiBAcGFyYW0gc3RyaW5ncyBUaGUgc3RyaW5nIGxpdGVyYWxzLiBUaGVyZSBhcmUgYWx3YXlzIGF0IGxlYXN0IHR3byBzdHJpbmdzLFxuICAgICAqICAgZXZlbnQgZm9yIGZ1bGx5LWNvbnRyb2xsZWQgYmluZGluZ3Mgd2l0aCBhIHNpbmdsZSBleHByZXNzaW9uLlxuICAgICAqL1xuICAgIGhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gbmFtZVswXTtcbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBjb25zdCBjb21taXR0ZXIgPSBuZXcgUHJvcGVydHlDb21taXR0ZXIoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyk7XG4gICAgICAgICAgICByZXR1cm4gY29tbWl0dGVyLnBhcnRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICdAJykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgRXZlbnRQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIG9wdGlvbnMuZXZlbnRDb250ZXh0KV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJz8nKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBCb29sZWFuQXR0cmlidXRlUGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IEF0dHJpYnV0ZUNvbW1pdHRlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKTtcbiAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhIHRleHQtcG9zaXRpb24gYmluZGluZy5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVGYWN0b3J5XG4gICAgICovXG4gICAgaGFuZGxlVGV4dEV4cHJlc3Npb24ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVQYXJ0KG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgPSBuZXcgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBtYXJrZXIsIFRlbXBsYXRlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIFRoZSBkZWZhdWx0IFRlbXBsYXRlRmFjdG9yeSB3aGljaCBjYWNoZXMgVGVtcGxhdGVzIGtleWVkIG9uXG4gKiByZXN1bHQudHlwZSBhbmQgcmVzdWx0LnN0cmluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUZhY3RvcnkocmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlQ2FjaGUgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQocmVzdWx0LnR5cGUpO1xuICAgIGlmICh0ZW1wbGF0ZUNhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGVtcGxhdGVDYWNoZSA9IHtcbiAgICAgICAgICAgIHN0cmluZ3NBcnJheTogbmV3IFdlYWtNYXAoKSxcbiAgICAgICAgICAgIGtleVN0cmluZzogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgICAgIHRlbXBsYXRlQ2FjaGVzLnNldChyZXN1bHQudHlwZSwgdGVtcGxhdGVDYWNoZSk7XG4gICAgfVxuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LmdldChyZXN1bHQuc3RyaW5ncyk7XG4gICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgVGVtcGxhdGVTdHJpbmdzQXJyYXkgaXMgbmV3LCBnZW5lcmF0ZSBhIGtleSBmcm9tIHRoZSBzdHJpbmdzXG4gICAgLy8gVGhpcyBrZXkgaXMgc2hhcmVkIGJldHdlZW4gYWxsIHRlbXBsYXRlcyB3aXRoIGlkZW50aWNhbCBjb250ZW50XG4gICAgY29uc3Qga2V5ID0gcmVzdWx0LnN0cmluZ3Muam9pbihtYXJrZXIpO1xuICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgaGF2ZSBhIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuZ2V0KGtleSk7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBub3Qgc2VlbiB0aGlzIGtleSBiZWZvcmUsIGNyZWF0ZSBhIG5ldyBUZW1wbGF0ZVxuICAgICAgICB0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQsIHJlc3VsdC5nZXRUZW1wbGF0ZUVsZW1lbnQoKSk7XG4gICAgICAgIC8vIENhY2hlIHRoZSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICAgICAgdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuc2V0KGtleSwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvLyBDYWNoZSBhbGwgZnV0dXJlIHF1ZXJpZXMgZm9yIHRoaXMgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAgICB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5zZXQocmVzdWx0LnN0cmluZ3MsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG59XG5leHBvcnQgY29uc3QgdGVtcGxhdGVDYWNoZXMgPSBuZXcgTWFwKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1mYWN0b3J5LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IE5vZGVQYXJ0IH0gZnJvbSAnLi9wYXJ0cy5qcyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IGNvbnN0IHBhcnRzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogUmVuZGVycyBhIHRlbXBsYXRlIHJlc3VsdCBvciBvdGhlciB2YWx1ZSB0byBhIGNvbnRhaW5lci5cbiAqXG4gKiBUbyB1cGRhdGUgYSBjb250YWluZXIgd2l0aCBuZXcgdmFsdWVzLCByZWV2YWx1YXRlIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIGFuZFxuICogY2FsbCBgcmVuZGVyYCB3aXRoIHRoZSBuZXcgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSByZXN1bHQgQW55IHZhbHVlIHJlbmRlcmFibGUgYnkgTm9kZVBhcnQgLSB0eXBpY2FsbHkgYSBUZW1wbGF0ZVJlc3VsdFxuICogICAgIGNyZWF0ZWQgYnkgZXZhbHVhdGluZyBhIHRlbXBsYXRlIHRhZyBsaWtlIGBodG1sYCBvciBgc3ZnYC5cbiAqIEBwYXJhbSBjb250YWluZXIgQSBET00gcGFyZW50IHRvIHJlbmRlciB0by4gVGhlIGVudGlyZSBjb250ZW50cyBhcmUgZWl0aGVyXG4gKiAgICAgcmVwbGFjZWQsIG9yIGVmZmljaWVudGx5IHVwZGF0ZWQgaWYgdGhlIHNhbWUgcmVzdWx0IHR5cGUgd2FzIHByZXZpb3VzXG4gKiAgICAgcmVuZGVyZWQgdGhlcmUuXG4gKiBAcGFyYW0gb3B0aW9ucyBSZW5kZXJPcHRpb25zIGZvciB0aGUgZW50aXJlIHJlbmRlciB0cmVlIHJlbmRlcmVkIHRvIHRoaXNcbiAqICAgICBjb250YWluZXIuIFJlbmRlciBvcHRpb25zIG11c3QgKm5vdCogY2hhbmdlIGJldHdlZW4gcmVuZGVycyB0byB0aGUgc2FtZVxuICogICAgIGNvbnRhaW5lciwgYXMgdGhvc2UgY2hhbmdlcyB3aWxsIG5vdCBlZmZlY3QgcHJldmlvdXNseSByZW5kZXJlZCBET00uXG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXIgPSAocmVzdWx0LCBjb250YWluZXIsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgcGFydCA9IHBhcnRzLmdldChjb250YWluZXIpO1xuICAgIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXMoY29udGFpbmVyLCBjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIHBhcnRzLnNldChjb250YWluZXIsIHBhcnQgPSBuZXcgTm9kZVBhcnQoT2JqZWN0LmFzc2lnbih7IHRlbXBsYXRlRmFjdG9yeSB9LCBvcHRpb25zKSkpO1xuICAgICAgICBwYXJ0LmFwcGVuZEludG8oY29udGFpbmVyKTtcbiAgICB9XG4gICAgcGFydC5zZXRWYWx1ZShyZXN1bHQpO1xuICAgIHBhcnQuY29tbWl0KCk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVuZGVyLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICpcbiAqIE1haW4gbGl0LWh0bWwgbW9kdWxlLlxuICpcbiAqIE1haW4gZXhwb3J0czpcbiAqXG4gKiAtICBbW2h0bWxdXVxuICogLSAgW1tzdmddXVxuICogLSAgW1tyZW5kZXJdXVxuICpcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqIEBwcmVmZXJyZWRcbiAqL1xuLyoqXG4gKiBEbyBub3QgcmVtb3ZlIHRoaXMgY29tbWVudDsgaXQga2VlcHMgdHlwZWRvYyBmcm9tIG1pc3BsYWNpbmcgdGhlIG1vZHVsZVxuICogZG9jcy5cbiAqL1xuaW1wb3J0IHsgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIH0gZnJvbSAnLi9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMnO1xuaW1wb3J0IHsgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtcmVzdWx0LmpzJztcbmV4cG9ydCB7IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciwgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIH0gZnJvbSAnLi9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMnO1xuZXhwb3J0IHsgZGlyZWN0aXZlLCBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vbGliL2RpcmVjdGl2ZS5qcyc7XG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiByZW1vdmUgbGluZSB3aGVuIHdlIGdldCBOb2RlUGFydCBtb3ZpbmcgbWV0aG9kc1xuZXhwb3J0IHsgcmVtb3ZlTm9kZXMsIHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2xpYi9kb20uanMnO1xuZXhwb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL2xpYi9wYXJ0LmpzJztcbmV4cG9ydCB7IEF0dHJpYnV0ZUNvbW1pdHRlciwgQXR0cmlidXRlUGFydCwgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsIEV2ZW50UGFydCwgaXNJdGVyYWJsZSwgaXNQcmltaXRpdmUsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciwgUHJvcGVydHlQYXJ0IH0gZnJvbSAnLi9saWIvcGFydHMuanMnO1xuZXhwb3J0IHsgcGFydHMsIHJlbmRlciB9IGZyb20gJy4vbGliL3JlbmRlci5qcyc7XG5leHBvcnQgeyB0ZW1wbGF0ZUNhY2hlcywgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuZXhwb3J0IHsgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtcmVzdWx0LmpzJztcbmV4cG9ydCB7IGNyZWF0ZU1hcmtlciwgaXNUZW1wbGF0ZVBhcnRBY3RpdmUsIFRlbXBsYXRlIH0gZnJvbSAnLi9saWIvdGVtcGxhdGUuanMnO1xuLy8gSU1QT1JUQU5UOiBkbyBub3QgY2hhbmdlIHRoZSBwcm9wZXJ0eSBuYW1lIG9yIHRoZSBhc3NpZ25tZW50IGV4cHJlc3Npb24uXG4vLyBUaGlzIGxpbmUgd2lsbCBiZSB1c2VkIGluIHJlZ2V4ZXMgdG8gc2VhcmNoIGZvciBsaXQtaHRtbCB1c2FnZS5cbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IGluamVjdCB2ZXJzaW9uIG51bWJlciBhdCBidWlsZCB0aW1lXG4od2luZG93WydsaXRIdG1sVmVyc2lvbnMnXSB8fCAod2luZG93WydsaXRIdG1sVmVyc2lvbnMnXSA9IFtdKSkucHVzaCgnMS4xLjInKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gSFRNTCB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBodG1sID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gbmV3IFRlbXBsYXRlUmVzdWx0KHN0cmluZ3MsIHZhbHVlcywgJ2h0bWwnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBTVkcgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3Qgc3ZnID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gbmV3IFNWR1RlbXBsYXRlUmVzdWx0KHN0cmluZ3MsIHZhbHVlcywgJ3N2ZycsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1saXQtaHRtbC5qcy5tYXAiLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIG1hcCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVNYXBwZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IGFueSwgVCA9IGFueT4gPSAodGhpczogQywgdmFsdWU6IHN0cmluZyB8IG51bGwpID0+IFQgfCBudWxsO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIG1hcCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZSB2YWx1ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU1hcHBlcjxDIGV4dGVuZHMgQ29tcG9uZW50ID0gYW55LCBUID0gYW55PiA9ICh0aGlzOiBDLCB2YWx1ZTogVCB8IG51bGwpID0+IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgaG9sZHMgYW4ge0BsaW5rIEF0dHJpYnV0ZU1hcHBlcn0gYW5kIGEge0BsaW5rIFByb3BlcnR5TWFwcGVyfVxuICpcbiAqIEByZW1hcmtzXG4gKiBGb3IgdGhlIG1vc3QgY29tbW9uIHR5cGVzLCBhIGNvbnZlcnRlciBleGlzdHMgd2hpY2ggY2FuIGJlIHJlZmVyZW5jZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIEBwcm9wZXJ0eSh7XG4gKiAgICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAqICAgICAgfSlcbiAqICAgICAgbXlQcm9wZXJ0eSA9IHRydWU7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVDb252ZXJ0ZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IGFueSwgVCA9IGFueT4ge1xuICAgIHRvQXR0cmlidXRlOiBQcm9wZXJ0eU1hcHBlcjxDLCBUPjtcbiAgICBmcm9tQXR0cmlidXRlOiBBdHRyaWJ1dGVNYXBwZXI8QywgVD47XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgYXR0cmlidXRlIGNvbnZlcnRlclxuICpcbiAqIEByZW1hcmtzXG4gKiBUaGlzIGNvbnZlcnRlciBpcyB1c2VkIGFzIHRoZSBkZWZhdWx0IGNvbnZlcnRlciBmb3IgZGVjb3JhdGVkIHByb3BlcnRpZXMgdW5sZXNzIGEgZGlmZmVyZW50IG9uZVxuICogaXMgc3BlY2lmaWVkLiBUaGUgY29udmVydGVyIHRyaWVzIHRvIGluZmVyIHRoZSBwcm9wZXJ0eSB0eXBlIHdoZW4gY29udmVydGluZyB0byBhdHRyaWJ1dGVzIGFuZFxuICogdXNlcyBgSlNPTi5wYXJzZSgpYCB3aGVuIGNvbnZlcnRpbmcgc3RyaW5ncyBmcm9tIGF0dHJpYnV0ZXMuIElmIGBKU09OLnBhcnNlKClgIHRocm93cyBhbiBlcnJvcixcbiAqIHRoZSBjb252ZXJ0ZXIgd2lsbCB1c2UgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBhcyBhIHN0cmluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQ6IEF0dHJpYnV0ZUNvbnZlcnRlciA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHtcbiAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHN1Y2Nlc3NmdWxseSBwYXJzZSBgYm9vbGVhbmAsIGBudW1iZXJgIGFuZCBgSlNPTi5zdHJpbmdpZnlgJ2QgdmFsdWVzXG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgaXQgdGhyb3dzLCBpdCBtZWFucyB3ZSdyZSBwcm9iYWJseSBkZWFsaW5nIHdpdGggYSByZWd1bGFyIHN0cmluZ1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICB9LFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiBudWxsO1xuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgZGVmYXVsdDogLy8gbnVtYmVyLCBiaWdpbnQsIHN5bWJvbCwgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBib29sZWFuIGF0dHJpYnV0ZXMsIGxpa2UgYGRpc2FibGVkYCwgd2hpY2ggYXJlIGNvbnNpZGVyZWQgdHJ1ZSBpZiB0aGV5IGFyZSBzZXQgd2l0aFxuICogYW55IHZhbHVlIGF0IGFsbC4gSW4gb3JkZXIgdG8gc2V0IHRoZSBhdHRyaWJ1dGUgdG8gZmFsc2UsIHRoZSBhdHRyaWJ1dGUgaGFzIHRvIGJlIHJlbW92ZWQgYnlcbiAqIHNldHRpbmcgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBgbnVsbGAuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSAhPT0gbnVsbCksXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYm9vbGVhbiB8IG51bGwpID0+IHZhbHVlID8gJycgOiBudWxsXG59XG5cbi8qKlxuICogSGFuZGxlcyBib29sZWFuIEFSSUEgYXR0cmlidXRlcywgbGlrZSBgYXJpYS1jaGVja2VkYCBvciBgYXJpYS1zZWxlY3RlZGAsIHdoaWNoIGhhdmUgdG8gYmVcbiAqIHNldCBleHBsaWNpdGx5IHRvIGB0cnVlYCBvciBgZmFsc2VgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW46IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnksIGJvb2xlYW4+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZSkgPT4gdmFsdWUgPT09ICd0cnVlJyxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZSkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBzdHJpbmc+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiB2YWx1ZSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWRcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2YWx1ZVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55LCBudW1iZXI+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiBOdW1iZXIodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBudW1iZXIgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck9iamVjdDogQXR0cmlidXRlQ29udmVydGVyPGFueSwgb2JqZWN0PiA9IHtcbiAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogSlNPTi5wYXJzZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IG9iamVjdCB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJBcnJheTogQXR0cmlidXRlQ29udmVydGVyPGFueSwgYW55W10+ID0ge1xuICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBKU09OLnBhcnNlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYW55W10gfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckRhdGU6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnksIERhdGU+ID0ge1xuICAgIC8vIGBuZXcgRGF0ZSgpYCB3aWxsIHJldHVybiBhbiBgSW52YWxpZCBEYXRlYCBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IG5ldyBEYXRlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogRGF0ZSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlbGVjdG9yIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNlbGVjdG9yIHdpbGwgYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHdpdGggdGhlIGJyb3dzZXInc1xuICAgICAqIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQSS4gSWYgbm8gc2VsZWN0b3IgaXMgc3BlY2lmaWVkLCB0aGUgY29tcG9uZW50IGNsYXNzXG4gICAgICogbmVlZHMgdG8gcHJvdmlkZSBvbmUgaW4gaXRzIHN0YXRpYyB7QGxpbmsgQ29tcG9uZW50LnNlbGVjdG9yfSBwcm9wZXJ0eS5cbiAgICAgKiBBIHNlbGVjdG9yIGRlZmluZWQgaW4gdGhlIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn0gd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGVcbiAgICAgKiBzdGF0aWMgY2xhc3MgcHJvcGVydHkuXG4gICAgICovXG4gICAgc2VsZWN0b3I6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTSB0byByZW5kZXIgdGhlIGNvbXBvbmVudHMgdGVtcGxhdGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNoYWRvdyBET00gY2FuIGJlIGRpc2FibGVkIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYCwgaW4gd2hpY2ggY2FzZSB0aGVcbiAgICAgKiBjb21wb25lbnQncyB0ZW1wbGF0ZSB3aWxsIGJlIHJlbmRlcmVkIGFzIGNoaWxkIG5vZGVzIG9mIHRoZSBjb21wb25lbnQuIFRoaXMgY2FuIGJlXG4gICAgICogdXNlZnVsIGlmIGFuIGlzb2xhdGVkIERPTSBhbmQgc2NvcGVkIENTUyBpcyBub3QgZGVzaXJlZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHNoYWRvdzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBBdXRvbWF0aWNhbGx5IHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgYnJvd3NlcidzIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQST9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW4gY2FzZXMgd2hlcmUgeW91IHdhbnQgdG8gZW1wbG95IGEgbW9kdWxlIHN5c3RlbSB3aGljaCByZWdpc3RlcnMgY29tcG9uZW50cyBvbiBhXG4gICAgICogY29uZGl0aW9uYWwgYmFzaXMsIHlvdSBjYW4gZGlzYWJsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG8gYGZhbHNlYC5cbiAgICAgKiBZb3VyIG1vZHVsZSBvciBib290c3RyYXAgc3lzdGVtIHdpbGwgaGF2ZSB0byB0YWtlIGNhcmUgb2YgZGVmaW5pbmcgdGhlIGNvbXBvbmVudCBsYXRlci5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIGRlZmluZTogYm9vbGVhbjtcbiAgICAvLyBUT0RPOiB0ZXN0IG1lZGlhIHF1ZXJpZXNcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEFuIGFycmF5IG9mIENTUyBydWxlc2V0cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL1N5bnRheCNDU1NfcnVsZXNldHMpLlxuICAgICAqIFN0eWxlcyBkZWZpbmVkIHVzaW5nIHRoZSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCBzdHlsZXMgZGVmaW5lZCBpbiB0aGUgY29tcG9uZW50J3NcbiAgICAgKiBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlci5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHN0eWxlczogW1xuICAgICAqICAgICAgICAgICdoMSwgaDIgeyBmb250LXNpemU6IDE2cHQ7IH0nLFxuICAgICAqICAgICAgICAgICdAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA5MDBweCkgeyBhcnRpY2xlIHsgcGFkZGluZzogMXJlbSAzcmVtOyB9IH0nXG4gICAgICogICAgICBdXG4gICAgICogfSlcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB1bmRlZmluZWRgXG4gICAgICovXG4gICAgc3R5bGVzPzogc3RyaW5nW107XG4gICAgLy8gVE9ETzogdXBkYXRlIGRvY3VtZW50YXRpb25cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEge0BsaW5rICNsaXQtaHRtbC5UZW1wbGF0ZVJlc3VsdH0uIFRoZSBmdW5jdGlvbidzIGBlbGVtZW50YFxuICAgICAqIHBhcmFtZXRlciB3aWxsIGJlIHRoZSBjdXJyZW50IGNvbXBvbmVudCBpbnN0YW5jZS4gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgYnkgdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFRoZSBtZXRob2QgbXVzdCByZXR1cm4gYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHdoaWNoIGlzIGNyZWF0ZWQgdXNpbmcgbGl0LWh0bWwnc1xuICAgICAqIHtAbGluayBsaXQtaHRtbCNodG1sIHwgYGh0bWxgfSBvciB7QGxpbmsgbGl0LWh0bWwjc3ZnIHwgYHN2Z2B9IHRlbXBsYXRlIG1ldGhvZHMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGNvbXBvbmVudCBpbnN0YW5jZSByZXF1ZXN0aW5nIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHRlbXBsYXRlPzogKGVsZW1lbnQ6IFR5cGUsIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT046IENvbXBvbmVudERlY2xhcmF0aW9uID0ge1xuICAgIHNlbGVjdG9yOiAnJyxcbiAgICBzaGFkb3c6IHRydWUsXG4gICAgZGVmaW5lOiB0cnVlLFxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnREZWNsYXJhdGlvbiwgREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT04gfSBmcm9tICcuL2NvbXBvbmVudC1kZWNsYXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlIH0gZnJvbSAnLi9wcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gY2xhc3NcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudDxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogUGFydGlhbDxDb21wb25lbnREZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB7IC4uLkRFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICByZXR1cm4gKHRhcmdldDogdHlwZW9mIENvbXBvbmVudCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0IGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3RydWN0b3Iuc2VsZWN0b3IgPSBkZWNsYXJhdGlvbi5zZWxlY3RvciB8fCB0YXJnZXQuc2VsZWN0b3I7XG4gICAgICAgIGNvbnN0cnVjdG9yLnNoYWRvdyA9IGRlY2xhcmF0aW9uLnNoYWRvdztcbiAgICAgICAgY29uc3RydWN0b3IudGVtcGxhdGUgPSBkZWNsYXJhdGlvbi50ZW1wbGF0ZSB8fCB0YXJnZXQudGVtcGxhdGU7XG5cbiAgICAgICAgLy8gdXNlIGtleW9mIHNpZ25hdHVyZXMgdG8gY2F0Y2ggcmVmYWN0b3JpbmcgZXJyb3JzXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlc0tleToga2V5b2YgdHlwZW9mIENvbXBvbmVudCA9ICdvYnNlcnZlZEF0dHJpYnV0ZXMnO1xuICAgICAgICBjb25zdCBzdHlsZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnc3R5bGVzJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvcGVydHkgZGVjb3JhdG9ycyBnZXQgY2FsbGVkIGJlZm9yZSBjbGFzcyBkZWNvcmF0b3JzLCBzbyBhdCB0aGlzIHBvaW50IGFsbCBkZWNvcmF0ZWQgcHJvcGVydGllc1xuICAgICAgICAgKiBoYXZlIHN0b3JlZCB0aGVpciBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMgaW4ge0BsaW5rIENvbXBvbmVudC5hdHRyaWJ1dGVzfS5cbiAgICAgICAgICogV2UgY2FuIG5vdyBjb21iaW5lIHRoZW0gd2l0aCB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBhbmQsXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LCBlbGltaW5hdGUgYWxsIGR1cGxpY2F0ZXMgaW4gdGhlIHByb2Nlc3MuXG4gICAgICAgICAqXG4gICAgICAgICAqIEFzIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IHdpbGwgYWxzbyBpbmNsdWRlIGRlY29yYXRvciBnZW5lcmF0ZWRcbiAgICAgICAgICogb2JzZXJ2ZWQgYXR0cmlidXRlcywgd2UgYWx3YXlzIGluaGVyaXQgYWxsIG9ic2VydmVkIGF0dHJpYnV0ZXMgZnJvbSBhIGJhc2UgY2xhc3MuIEZvciB0aGF0IHJlYXNvblxuICAgICAgICAgKiB3ZSBoYXZlIHRvIGtlZXAgdHJhY2sgb2YgYXR0cmlidXRlIG92ZXJyaWRlcyB3aGVuIGV4dGVuZGluZyBhbnkge0BsaW5rIENvbXBvbmVudH0gYmFzZSBjbGFzcy5cbiAgICAgICAgICogVGhpcyBpcyBkb25lIGluIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvci4gSGVyZSB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0byByZW1vdmUgb3ZlcnJpZGRlblxuICAgICAgICAgKiBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZWRBdHRyaWJ1dGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAvLyB3ZSB0YWtlIHRoZSBpbmhlcml0ZWQgb2JzZXJ2ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm9ic2VydmVkQXR0cmlidXRlc1xuICAgICAgICAgICAgICAgICAgICAvLyAuLi5yZW1vdmUgb3ZlcnJpZGRlbiBnZW5lcmF0ZWQgYXR0cmlidXRlcy4uLlxuICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChhdHRyaWJ1dGVzLCBhdHRyaWJ1dGUpID0+IGF0dHJpYnV0ZXMuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiAmJiBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuLmhhcyhhdHRyaWJ1dGUpID8gW10gOiBhdHRyaWJ1dGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgc3RyaW5nW11cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAvLyAuLi5hbmQgcmVjb21iaW5lIHRoZSBsaXN0IHdpdGggdGhlIG5ld2x5IGdlbmVyYXRlZCBhdHRyaWJ1dGVzICh0aGUgU2V0IHByZXZlbnRzIGR1cGxpY2F0ZXMpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoWy4uLnRhcmdldC5hdHRyaWJ1dGVzLmtleXMoKV0pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gZGVsZXRlIHRoZSBvdmVycmlkZGVuIFNldCBmcm9tIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgY29uc3RydWN0b3Iub3ZlcnJpZGRlbjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IHN0eWxlcyBhdXRvbWF0aWNhbGx5LCB1bmxlc3MgZXhwbGljaXRseSByZXF1ZXN0ZWQsIHNvIHdlIGNoZWNrIGlmIHRoZVxuICAgICAgICAgKiBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHN0YXRpYyBzdHlsZXMgcHJvcGVydHkgKHdoaWNoIG1heSB1c2Ugc3VwZXIuc3R5bGVzIHRvIGV4cGxpY2l0bHkgaW5oZXJpdClcbiAgICAgICAgICogYW5kIGlmIGl0IGRvZXNuJ3QsIHdlIGlnbm9yZSB0aGUgcGFyZW50IGNsYXNzJ3Mgc3R5bGVzIChieSBub3QgaW52b2tpbmcgdGhlIGdldHRlcikuXG4gICAgICAgICAqIFdlIHRoZW4gbWVyZ2UgdGhlIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcyAoaWYgZXhpc3RpbmcpIGludG8gdGhlIHN0eWxlcyBhbmQgcmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICAgICAgICogYnkgdXNpbmcgYSBTZXQuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIChjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShzdHlsZXNLZXkpXG4gICAgICAgICAgICAgICAgICAgID8gY29uc3RydWN0b3Iuc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgIDogW11cbiAgICAgICAgICAgICAgICApLmNvbmNhdChkZWNsYXJhdGlvbi5zdHlsZXMgfHwgW10pXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmFsbHkgd2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBnZXR0ZXIgd2l0aCBhIG5ldyBvbmUsIHdoaWNoIHJldHVybnNcbiAgICAgICAgICogdGhlIHVuaXF1ZSBzZXQgb2YgdXNlciBkZWZpbmVkIGFuZCBkZWNvcmF0b3IgZ2VuZXJhdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVkQXR0cmlidXRlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50LnN0eWxlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHN0YXRpY2FsbHkgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGRlZmluZWQgc3R5bGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgc3R5bGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0ICgpOiBzdHJpbmdbXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0eWxlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmRlZmluZSkge1xuXG4gICAgICAgICAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKGNvbnN0cnVjdG9yLnNlbGVjdG9yLCBjb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBMaXN0ZW5lckRlY2xhcmF0aW9uIH0gZnJvbSAnLi9saXN0ZW5lci1kZWNsYXJhdGlvbi5qcyc7XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gbWV0aG9kIGFzIGFuIGV2ZW50IGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgVGhlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5lcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogTGlzdGVuZXJEZWNsYXJhdGlvbjxUeXBlPikge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmV2ZW50ID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5kZWxldGUocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5zZXQocHJvcGVydHlLZXksIHsgLi4ub3B0aW9ucyB9IGFzIExpc3RlbmVyRGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBsaXN0ZW5lciBkZWNvcmF0b3Igc3RvcmVzIGxpc3RlbmVyIGRlY2xhcmF0aW9ucyBpbiB0aGUgY29uc3RydWN0b3IsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoZVxuICogc3RhdGljIGxpc3RlbmVycyBmaWVsZCBpcyBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlIGFkZCBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAqIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkLiBXZSBhbHNvIG1ha2Ugc3VyZSB0byBpbml0aWFsaXplIHRoZSBsaXN0ZW5lciBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZlxuICogdGhlIGJhc2UgY2xhc3MncyBtYXAgdG8gcHJvcGVybHkgaW5oZXJpdCBhbGwgbGlzdGVuZXIgZGVjbGFyYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IHR5cGVvZiBDb21wb25lbnQpIHtcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ2xpc3RlbmVycycpKSBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLmxpc3RlbmVycyk7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gc2VsZWN0b3IgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZWxlY3RvckRlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2VsZWN0b3IgdG8gcXVlcnlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2V0dGluZyBxdWVyeSB0byBgbnVsbGAgYWxsb3dzIHRvIHVuYmluZCBhbiBpbmhlcml0ZWQgc2VsZWN0b3IuXG4gICAgICovXG4gICAgcXVlcnk6IHN0cmluZyB8IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcm9vdCBlbGVtZW50L2RvY3VtZW50IGZyb20gd2hpY2ggdG8gcXVlcnlcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IFRoZSBjb21wb25lbnQncyBgcmVuZGVyUm9vdGBcbiAgICAgKi9cbiAgICByb290PzogRG9jdW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHwgRWxlbWVudCB8ICgodGhpczogVHlwZSkgPT4gRG9jdW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHwgRWxlbWVudCB8IHVuZGVmaW5lZCk7XG5cbiAgICAvKipcbiAgICAgKiBVc2UgcXVlcnlTZWxlY3RvckFsbCBmb3IgcXVlcnlpbmdcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGBmYWxzZWBcbiAgICAgKi9cbiAgICBhbGw/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRUxFQ1RPUl9ERUNMQVJBVElPTjogU2VsZWN0b3JEZWNsYXJhdGlvbiA9IHtcbiAgICBxdWVyeTogbnVsbCxcbiAgICBhbGw6IGZhbHNlLFxufTtcbiIsIi8qKlxuICogR2V0IHRoZSB7QGxpbmsgUHJvcGVydHlEZXNjcmlwdG9yfSBvZiBhIHByb3BlcnR5IGZyb20gaXRzIHByb3RvdHlwZVxuICogb3IgYSBwYXJlbnQgcHJvdG90eXBlIC0gZXhjbHVkaW5nIHtAbGluayBPYmplY3QucHJvdG90eXBlfSBpdHNlbGYuXG4gKlxuICogQHBhcmFtIHRhcmdldCAgICAgICAgVGhlIHByb3RvdHlwZSB0byBnZXQgdGhlIGRlc2NyaXB0b3IgZnJvbVxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkZXNjcmlwdG9yXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZXNjcmlwdG9yIHwgdW5kZWZpbmVkIHtcblxuICAgIGlmIChwcm9wZXJ0eUtleSBpbiB0YXJnZXQpIHtcblxuICAgICAgICB3aGlsZSAodGFyZ2V0ICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkocHJvcGVydHlLZXkpKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiLyoqXG4gKiBBIHRhc2sgb2JqZWN0IGludGVyZmFjZSBhcyByZXR1cm5lZCBieSB0aGUgc2NoZWR1bGVyIG1ldGhvZHNcbiAqXG4gKiBAcmVtYXJrc1xuICogQSB0YXNrIGlzIGFuIG9iamVjdCBjb25zaXN0aW5nIG9mIGEge0BsaW5rIFByb21pc2V9IHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWRcbiAqIHdoZW4gdGhlIHRhc2sgY2FsbGJhY2sgd2FzIGV4ZWN1dGVkIGFuZCBhIGNhbmNlbCBtZXRob2QsIHdoaWNoIHdpbGwgcHJldmVudFxuICogdGhlIHRhc2sgY2FsbGJhY2sgZnJvbSBiZWluZyBleGVjdXRlZCBhbmQgcmVqZWN0IHRoZSB0YXNrJ3MgUHJvbWlzZS4gQSB0YXNrXG4gKiB3aGljaCBpcyBhbHJlYWR5IHJlc29sdmVkIGNhbm5vdCBiZSBjYW5jZWxlZCBhbnltb3JlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhc2s8VCA9IGFueT4ge1xuICAgIHByb21pc2U6IFByb21pc2U8VD47XG4gICAgY2FuY2VsOiAoKSA9PiB2b2lkO1xufTtcblxuLyoqXG4gKiBBIHNwZWNpYWwgZXJyb3IgY2xhc3Mgd2hpY2ggaXMgdGhyb3duIHdoZW4gYSB0YXNrIGlzIGNhbmNlbGVkXG4gKlxuICogQHJlbWFya3NcbiAqIFRoaXMgZXJyb3IgY2xhc3MgaXMgdXNlZCB0byByZWplY3QgYSB0YXNrJ3MgUHJvbWlzZSwgd2hlbiB0aGUgdGFza1xuICogaXMgY2FuY2VsZWQuIFlvdSBjYW4gY2hlY2sgZm9yIHRoaXMgc3BlY2lmaWMgZXJyb3IsIHRvIGhhbmRsZSBjYW5jZWxlZFxuICogdGFza3MgZGlmZmVyZW50IGZyb20gb3RoZXJ3aXNlIHJlamVjdGVkIHRhc2tzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHRhc2sgPSBtaWNyb1Rhc2soKCkgPT4ge1xuICogICAgICAvLyBkbyBzdGguLi5cbiAqIH0pO1xuICpcbiAqIHRhc2suY2FuY2VsKCk7XG4gKlxuICogdGFzay5wcm9taXNlLmNhdGNoKHJlYXNvbiA9PiB7XG4gKiAgICAgIGlmIChyZWFzb24gaW5zdGFuY2VvZiBUYXNrQ2FuY2VsZWRFcnJvcikge1xuICogICAgICAgICAgLy8gLi4udGhpcyB0YXNrIHdhcyBjYW5jZWxlZFxuICogICAgICB9XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgVGFza0NhbmNlbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cbiAgICBjb25zdHJ1Y3RvciAobWVzc2FnZT86IHN0cmluZykge1xuXG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuXG4gICAgICAgIHRoaXMubmFtZSA9ICdUYXNrQ2FuY2VsZWRFcnJvcic7XG4gICAgfVxufVxuXG5jb25zdCBUQVNLX0NBTkNFTEVEX0VSUk9SID0gKCkgPT4gbmV3IFRhc2tDYW5jZWxlZEVycm9yKCdUYXNrIGNhbmNlbGVkLicpO1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBtaWNyby10YXNrIGFuZCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsXG4gKiByZXNvbHZlIHdoZW4gdGhlIHRhc2sgd2FzIGV4ZWN1dGVkLlxuICpcbiAqIEByZW1hcmtzXG4gKiBVc2VzIHtAbGluayBQcm9taXNlLnRoZW59IHRvIHNjaGVkdWxlIHRoZSB0YXNrIGNhbGxiYWNrIGluIHRoZSBuZXh0IG1pY3JvLXRhc2suXG4gKiBJZiB0aGUgdGFzayBpcyBjYW5jZWxlZCBiZWZvcmUgdGhlIG5leHQgbWljcm8tdGFzaywgdGhlIFByb21pc2UgZXhlY3V0b3Igd29uJ3RcbiAqIHJ1biB0aGUgdGFzayBjYWxsYmFjayBidXQgcmVqZWN0IHRoZSBQcm9taXNlLlxuICpcbiAqIEBwYXJhbSB0YXNrICBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZVxuICogQHJldHVybnMgICAgIEEgUHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgYWZ0ZXIgdGhlIGNhbGxiYWNrIHdhcyBleGVjdXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWljcm9UYXNrPFQgPSBhbnk+ICh0YXNrOiAoKSA9PiBUKTogVGFzazxUPiB7XG5cbiAgICBsZXQgY2FuY2VsZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGFjdHVhbCBQcm9taXNlIGlzIGNyZWF0ZWQgaW4gYFByb21pc2UudGhlbmAncyBleGVjdXRvciwgaW4gb3JkZXJcbiAgICAgICAgICogZm9yIGl0IHRvIGV4ZWN1dGUgdGhlIHRhc2sgaW4gdGhlIG5leHQgbWljcm8tdGFzay4gVGhpcyBtZWFucyB3ZSBjYW4ndFxuICAgICAgICAgKiBnZXQgYSByZWZlcmVuY2Ugb2YgdGhlIFByb21pc2UncyByZWplY3QgbWV0aG9kIGluIHRoZSBzY29wZSBvZiB0aGlzXG4gICAgICAgICAqIGZ1bmN0aW9uLiBCdXQgd2UgY2FuIHVzZSBhIGxvY2FsIHZhcmlhYmxlIGluIHRoaXMgZnVuY3Rpb24ncyBzY29wZSB0b1xuICAgICAgICAgKiBwcmV2ZW50IHtAbGluayBydW5UYXNrfSB0byBiZSBleGVjdXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChjYW5jZWxlZCkge1xuXG4gICAgICAgICAgICAgICAgcmVqZWN0KFRBU0tfQ0FOQ0VMRURfRVJST1IoKSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBydW5UYXNrKHRhc2ssIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgY2FuY2VsID0gKCkgPT4gY2FuY2VsZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHsgcHJvbWlzZSwgY2FuY2VsIH07XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSB0YXNrIGNhbGxiYWNrIGluIHRoZSBuZXh0IG1hY3JvLXRhc2sgYW5kIHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGxcbiAqIHJlc29sdmUgd2hlbiB0aGUgdGFzayB3YXMgZXhlY3V0ZWRcbiAqXG4gKiBAcmVtYXJrc1xuICogVXNlcyB7QGxpbmsgc2V0VGltZW91dH0gdG8gc2NoZWR1bGUgdGhlIHRhc2sgY2FsbGJhY2sgaW4gdGhlIG5leHQgbWFjcm8tdGFzay5cbiAqIElmIHRoZSB0YXNrIGlzIGNhbmNlbGVkIGJlZm9yZSB0aGUgbmV4dCBtYWNyby10YXNrLCB0aGUgdGltZW91dCBpcyBjbGVhcmVkIGFuZFxuICogdGhlIFByb21zaWUgaXMgcmVqZWN0ZWQuXG4gKlxuICogQHBhcmFtIHRhc2sgIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlXG4gKiBAcmV0dXJucyAgICAgQSBQcm9taXNlIHdoaWNoIHdpbGwgcmVzb2x2ZSBhZnRlciB0aGUgY2FsbGJhY2sgd2FzIGV4ZWN1dGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWNyb1Rhc2s8VCA9IGFueT4gKHRhc2s6ICgpID0+IFQpOiBUYXNrPFQ+IHtcblxuICAgIGxldCBjYW5jZWwhOiAoKSA9PiB2b2lkO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICBsZXQgdGltZW91dDogbnVtYmVyIHwgdW5kZWZpbmVkID0gc2V0VGltZW91dCgoKSA9PiBydW5UYXNrKHRhc2ssIHJlc29sdmUsIHJlamVjdCksIDApO1xuXG4gICAgICAgIGNhbmNlbCA9ICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICByZWplY3QoVEFTS19DQU5DRUxFRF9FUlJPUigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7IHByb21pc2UsIGNhbmNlbCB9O1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWUgYW5kIHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGxcbiAqIHJlc29sdmUgd2hlbiB0aGUgdGFzayB3YXMgZXhlY3V0ZWRcbiAqXG4gKiBAcmVtYXJrc1xuICogVXNlcyB7QGxpbmsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lfSB0byBzY2hlZHVsZSB0aGUgdGFzayBjYWxsYmFjayBpbiB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWUuXG4gKiBJZiB0aGUgdGFzayBpcyBjYW5jZWxlZCBiZWZvcmUgdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lLCB0aGUgYW5pbWF0aW9uIGZyYW1lIGlzIGNhbmNlbGVkIGFuZFxuICogdGhlIFByb21zaWUgaXMgcmVqZWN0ZWQuXG4gKlxuICogQHBhcmFtIHRhc2sgIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlXG4gKiBAcmV0dXJucyAgICAgQSBQcm9taXNlIHdoaWNoIHdpbGwgcmVzb2x2ZSBhZnRlciB0aGUgY2FsbGJhY2sgd2FzIGV4ZWN1dGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRpb25GcmFtZVRhc2s8VCA9IGFueT4gKHRhc2s6ICgpID0+IFQpOiBUYXNrPFQ+IHtcblxuICAgIGxldCBjYW5jZWwhOiAoKSA9PiB2b2lkO1xuXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICBsZXQgYW5pbWF0aW9uRnJhbWU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBydW5UYXNrKHRhc2ssIHJlc29sdmUsIHJlamVjdCkpO1xuXG4gICAgICAgIGNhbmNlbCA9ICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWUpO1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHJlamVjdChUQVNLX0NBTkNFTEVEX0VSUk9SKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHsgcHJvbWlzZSwgY2FuY2VsIH07XG59XG5cbi8qKlxuICogUnVucyBhIHRhc2sgY2FsbGJhY2sgc2FmZWx5IGFnYWluc3QgYSBQcm9taXNlJ3MgcmVqZWN0IGFuZCByZXNvbHZlIGNhbGxiYWNrcy5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHJ1blRhc2s8VCA9IGFueT4gKHRhc2s6ICgpID0+IFQsIHJlc29sdmU6ICh2YWx1ZTogVCkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uOiBhbnkpID0+IHZvaWQpIHtcblxuICAgIHRyeSB7XG5cbiAgICAgICAgcmVzb2x2ZSh0YXNrKCkpO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBTZWxlY3RvckRlY2xhcmF0aW9uLCBERUZBVUxUX1NFTEVDVE9SX0RFQ0xBUkFUSU9OIH0gZnJvbSAnLi9zZWxlY3Rvci1kZWNsYXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgfSBmcm9tICcuL3V0aWxzL2dldC1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzJztcbmltcG9ydCB7IG1pY3JvVGFzayB9IGZyb20gJy4uL3Rhc2tzLmpzJztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBwcm9wZXJ0eSBhcyBhIHNlbGVjdG9yXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgVGhlIHNlbGVjdG9yIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogU2VsZWN0b3JEZWNsYXJhdGlvbjxUeXBlPikge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICAgICAgdGFyZ2V0OiBPYmplY3QsXG4gICAgICAgIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgICAgcHJvcGVydHlEZXNjcmlwdG9yPzogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICk6IGFueSB7XG5cbiAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IHByb3BlcnR5RGVzY3JpcHRvciB8fCBnZXRQcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGNvbnN0IGhpZGRlbktleSA9IFN5bWJvbChgX18keyBwcm9wZXJ0eUtleS50b1N0cmluZygpIH1gKTtcblxuICAgICAgICBjb25zdCBnZXR0ZXIgPSBkZXNjcmlwdG9yPy5nZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSkgeyByZXR1cm4gdGhpc1toaWRkZW5LZXldOyB9O1xuICAgICAgICBjb25zdCBzZXR0ZXIgPSBkZXNjcmlwdG9yPy5zZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSwgdmFsdWU6IGFueSkgeyB0aGlzW2hpZGRlbktleV0gPSB2YWx1ZTsgfTtcblxuICAgICAgICBjb25zdCB3cmFwcGVkRGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAodGhpczogVHlwZSk6IGFueSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodGhpczogVHlwZSwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIHNlbGVjdG9ycyBhcmUgcXVlcmllZCBkdXJpbmcgdGhlIHVwZGF0ZSBjeWNsZSwgdGhpcyBtZWFucywgd2hlbiB0aGV5IGNoYW5nZVxuICAgICAgICAgICAgICAgIC8vIHdlIGNhbm5vdCB0cmlnZ2VyIGFub3RoZXIgdXBkYXRlIGZyb20gd2l0aGluIHRoZSBjdXJyZW50IHVwZGF0ZSBjeWNsZVxuICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gdXBkYXRlIGp1c3QgYWZ0ZXIgdGhpcyB1cGRhdGUgaXMgb3ZlclxuICAgICAgICAgICAgICAgIC8vIGFsc28sIHNlbGVjdG9ycyBhcmUgbm90IHByb3BlcnRpZXMsIHNvIHRoZXkgZG9uJ3QgYXBwZWFyIGluIHRoZSBwcm9wZXJ0eSBtYXBzXG4gICAgICAgICAgICAgICAgLy8gdGhhdCdzIHdoeSB3ZSBpbnZva2UgcmVxdWVzdFVwZGF0ZSB3aXRob3V0IGFueSBwYXJhbWV0ZXJzXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbHVlICE9PSBnZXR0ZXIuY2FsbCh0aGlzKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIG1pY3JvVGFzaygoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBvcHRpb25zID0geyAuLi5ERUZBVUxUX1NFTEVDVE9SX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5xdWVyeSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5zZWxlY3RvcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5zZWxlY3RvcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBTZWxlY3RvckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgICAgIC8vIGlmIG5vIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGEgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciB3aGljaCBtdXN0IHJldHVybiB2b2lkIGFuZCB3ZSBjYW4gZGVmaW5lIHRoZSB3cmFwcGVkIGRlc2NyaXB0b3IgaGVyZVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIHdyYXBwZWREZXNjcmlwdG9yKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBpZiBhIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGFuIGFjY2Vzc29yXG4gICAgICAgICAgICAvLyBkZWNvcmF0b3IgYW5kIHdlIG11c3QgcmV0dXJuIHRoZSB3cmFwcGVkIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVkRGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIHNlbGVjdG9yIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgc2VsZWN0b3IgZGVjb3JhdG9yIHN0b3JlcyBzZWxlY3RvciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBzZWxlY3RvcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgc2VsZWN0b3IgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgc2VsZWN0b3IgbWFwIHdpdGggdGhlIHZhbHVlcyBvZlxuICogdGhlIGJhc2UgY2xhc3MncyBtYXAgdG8gcHJvcGVybHkgaW5oZXJpdCBhbGwgc2VsZWN0b3IgZGVjbGFyYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IHR5cGVvZiBDb21wb25lbnQpIHtcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ3NlbGVjdG9ycycpKSBjb25zdHJ1Y3Rvci5zZWxlY3RvcnMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLnNlbGVjdG9ycyk7XG59XG4iLCJjb25zdCBGSVJTVCA9IC9eW15dLztcbmNvbnN0IFNQQUNFUyA9IC9cXHMrKFtcXFNdKS9nO1xuY29uc3QgQ0FNRUxTID0gL1thLXpdKFtBLVpdKS9nO1xuY29uc3QgS0VCQUJTID0gLy0oW2Etel0pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnJlcGxhY2UoRklSU1QsIHN0cmluZ1swXS50b1VwcGVyQ2FzZSgpKSA6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9Mb3dlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW1lbENhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBLRUJBQlMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBLRUJBQlMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmNhcGl0YWxpemUoc3RyaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlYmFiQ2FzZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IG1hdGNoZXM7XG5cbiAgICBpZiAoc3RyaW5nKSB7XG5cbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnRyaW0oKTtcblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBTUEFDRVMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCAnLScgKyBtYXRjaGVzWzFdKTtcblxuICAgICAgICAgICAgU1BBQ0VTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBDQU1FTFMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzBdWzBdICsgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIENBTUVMUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy50b0xvd2VyQ2FzZSgpIDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlciwgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCB9IGZyb20gJy4vYXR0cmlidXRlLWNvbnZlcnRlci5qcyc7XG5pbXBvcnQgeyBrZWJhYkNhc2UgfSBmcm9tICcuL3V0aWxzL3N0cmluZy11dGlscy5qcyc7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgZGlzcGF0Y2ggYSBjdXN0b20gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Tm90aWZpZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJldHVybiBgdHJ1ZWAgaWYgdGhlIGBvbGRWYWx1ZWAgYW5kIHRoZSBgbmV3VmFsdWVgIG9mIGEgcHJvcGVydHkgYXJlIGRpZmZlcmVudCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gcmVmbGVjdG9yIEEgcmVmbGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXR0cmlidXRlUmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBBdHRyaWJ1dGVSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5UmVmbGVjdG9yIChyZWZsZWN0b3I6IGFueSk6IHJlZmxlY3RvciBpcyBQcm9wZXJ0eVJlZmxlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIHJlZmxlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eU5vdGlmaWVyfVxuICpcbiAqIEBwYXJhbSBub3RpZmllciBBIG5vdGlmaWVyIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlOb3RpZmllciAobm90aWZpZXI6IGFueSk6IG5vdGlmaWVyIGlzIFByb3BlcnR5Tm90aWZpZXIge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBub3RpZmllciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICpcbiAqIEBwYXJhbSBkZXRlY3RvciBBIGRldGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciAoZGV0ZWN0b3I6IGFueSk6IGRldGVjdG9yIGlzIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiBkZXRlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eUtleX1cbiAqXG4gKiBAcGFyYW0ga2V5IEEgcHJvcGVydHkga2V5IHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlLZXkgKGtleTogYW55KToga2V5IGlzIFByb3BlcnR5S2V5IHtcblxuICAgIHJldHVybiB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJyB8fCB0eXBlb2Yga2V5ID09PSAnc3ltYm9sJztcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgc3RyaW5nIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGUgcmVtb3ZpbmcgaW52YWxpZCBhdHRyaWJ1dGUgY2hhcmFjdGVyc1xuICpcbiAqIEBwYXJhbSB2YWx1ZSBBIHN0cmluZyB0byBlbmNvZGUgZm9yIHVzZSBhcyBodG1sIGF0dHJpYnV0ZVxuICogQHJldHVybnMgICAgIEFuIGVuY29kZWQgc3RyaW5nIHVzYWJsZSBhcyBodG1sIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQXR0cmlidXRlICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBrZWJhYkNhc2UodmFsdWUucmVwbGFjZSgvXFxXKy9nLCAnLScpLnJlcGxhY2UoL1xcLSQvLCAnJykpO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBhdHRyaWJ1dGUgbmFtZSBmcm9tIGEgcHJvcGVydHkga2V5XG4gKlxuICogQHJlbWFya3NcbiAqIE51bWVyaWMgcHJvcGVydHkgaW5kZXhlcyBvciBzeW1ib2xzIGNhbiBjb250YWluIGludmFsaWQgY2hhcmFjdGVycyBmb3IgYXR0cmlidXRlIG5hbWVzLiBUaGlzIG1ldGhvZFxuICogc2FuaXRpemVzIHRob3NlIGNoYXJhY3RlcnMgYW5kIHJlcGxhY2VzIHNlcXVlbmNlcyBvZiBpbnZhbGlkIGNoYXJhY3RlcnMgd2l0aCBhIGRhc2guXG4gKiBBdHRyaWJ1dGUgbmFtZXMgYXJlIG5vdCBhbGxvd2VkIHRvIHN0YXJ0IHdpdGggbnVtYmVycyBlaXRoZXIgYW5kIGFyZSBwcmVmaXhlZCB3aXRoICdhdHRyLScuXG4gKlxuICogTi5CLjogV2hlbiB1c2luZyBjdXN0b20gc3ltYm9scyBhcyBwcm9wZXJ0eSBrZXlzLCB1c2UgdW5pcXVlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIHN5bWJvbHMgdG8gYXZvaWRcbiAqIGNsYXNoaW5nIGF0dHJpYnV0ZSBuYW1lcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBhID0gU3ltYm9sKCk7XG4gKiBjb25zdCBiID0gU3ltYm9sKCk7XG4gKlxuICogYSAhPT0gYjsgLy8gdHJ1ZVxuICpcbiAqIGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYSkgIT09IGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYik7IC8vIGZhbHNlIC0tPiAnYXR0ci1zeW1ib2wnID09PSAnYXR0ci1zeW1ib2wnXG4gKlxuICogY29uc3QgYyA9IFN5bWJvbCgnYycpO1xuICogY29uc3QgZCA9IFN5bWJvbCgnZCcpO1xuICpcbiAqIGMgIT09IGQ7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGMpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGQpOyAvLyB0cnVlIC0tPiAnYXR0ci1zeW1ib2wtYycgPT09ICdhdHRyLXN5bWJvbC1kJ1xuICogYGBgXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlTmFtZSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogc3RyaW5nIHtcblxuICAgIGlmICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgcmV0dXJuIGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBhdHRyaWJ1dGUgbmFtZXMsIGlmIHN5bWJvbHMgZG9uJ3QgaGF2ZSB1bmlxdWUgZGVzY3JpcHRpb25cbiAgICAgICAgcmV0dXJuIGBhdHRyLSR7IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKSB9YDtcbiAgICB9XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGV2ZW50IG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBFdmVudCBuYW1lcyBkb24ndCBoYXZlIHRoZSBzYW1lIHJlc3RyaWN0aW9ucyBhcyBhdHRyaWJ1dGUgbmFtZXMgd2hlbiBpdCBjb21lcyB0byBpbnZhbGlkXG4gKiBjaGFyYWN0ZXJzLiBIb3dldmVyLCBmb3IgY29uc2lzdGVuY3kncyBzYWtlLCB3ZSBhcHBseSB0aGUgc2FtZSBydWxlcyBmb3IgZXZlbnQgbmFtZXMgYXNcbiAqIGZvciBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgQSBwcm9wZXJ0eSBrZXkgdG8gY29udmVydCB0byBhbiBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHByZWZpeCAgICAgICAgQW4gb3B0aW9uYWwgcHJlZml4LCBlLmcuOiAnb24nXG4gKiBAcGFyYW0gc3VmZml4ICAgICAgICBBbiBvcHRpb25hbCBzdWZmaXgsIGUuZy46ICdjaGFuZ2VkJ1xuICogQHJldHVybnMgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBldmVudCBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudE5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgcHJlZml4Pzogc3RyaW5nLCBzdWZmaXg/OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IHByb3BlcnR5U3RyaW5nID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0ga2ViYWJDYXNlKHByb3BlcnR5S2V5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBjcmVhdGUgbXVsdGlwbGUgaWRlbnRpY2FsIGV2ZW50IG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHByb3BlcnR5U3RyaW5nID0gZW5jb2RlQXR0cmlidXRlKFN0cmluZyhwcm9wZXJ0eUtleSkpO1xuICAgIH1cblxuICAgIHJldHVybiBgJHsgcHJlZml4ID8gYCR7IGtlYmFiQ2FzZShwcmVmaXgpIH0tYCA6ICcnIH0keyBwcm9wZXJ0eVN0cmluZyB9JHsgc3VmZml4ID8gYC0keyBrZWJhYkNhc2Uoc3VmZml4KSB9YCA6ICcnIH1gO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBEb2VzIHByb3BlcnR5IGhhdmUgYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IE5vIGF0dHJpYnV0ZSB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHByb3BlcnR5XG4gICAgICogKiBgdHJ1ZWA6IFRoZSBhdHRyaWJ1dGUgbmFtZSB3aWxsIGJlIGluZmVycmVkIGJ5IGNhbWVsLWNhc2luZyB0aGUgcHJvcGVydHkgbmFtZVxuICAgICAqICogYHN0cmluZ2A6IFVzZSB0aGUgcHJvdmlkZWQgc3RyaW5nIGFzIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBuYW1lXG4gICAgICpcbiAgICAgKiAvLyBUT0RPOiBjb25zaWRlciBzZXR0aW5nIHRoaXMgdG8gZmFsc2VcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGU6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b21pemUgdGhlIGNvbnZlcnNpb24gb2YgdmFsdWVzIGJldHdlZW4gcHJvcGVydHkgYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENvbnZlcnRlcnMgYXJlIG9ubHkgdXNlZCB3aGVuIHtAbGluayByZWZsZWN0UHJvcGVydHl9IGFuZC9vciB7QGxpbmsgcmVmbGVjdEF0dHJpYnV0ZX0gYXJlIHNldCB0byB0cnVlLlxuICAgICAqIElmIGN1c3RvbSByZWZsZWN0b3JzIGFyZSB1c2VkLCB0aGV5IGhhdmUgdG8gdGFrZSBjYXJlIG9yIGNvbnZlcnRpbmcgdGhlIHByb3BlcnR5L2F0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiB7QGxpbmsgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdH1cbiAgICAgKi9cbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUncyB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBhdHRyaWJ1dGUgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBhdHRyaWJ1dGUgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIHByb3BlcnR5IHVzaW5nIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjb21wb25lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBhdHRyaWJ1dGUgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0QXR0cmlidXRlOiBib29sZWFuIHwga2V5b2YgVHlwZSB8IEF0dHJpYnV0ZVJlZmxlY3RvcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCB0aGUgcHJvcGVydHkgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgcHJvcGVydHkgdmFsdWUgd2lsbCBub3QgYmUgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgdHJ1ZWA6IEFueSBwcm9wZXJ0eSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgYXV0b21hdGljYWxseSB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgdXNpbmcgdGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgcHJvcGVydHkgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0UHJvcGVydHk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgYSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2UgcmFpc2UgYSBjdXN0b20gZXZlbnQ/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IGNyZWF0ZSBhIGN1c3RvbSBldmVudCBmb3IgdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBDcmVhdGUgY3VzdG9tIGV2ZW50cyBmb3IgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBVc2UgdGhlIG1ldGhvZCB3aXRoIHRoaXMgcHJvcGVydHkga2V5IG9uIHRoZSBjb21wb25lbnQgdG8gY3JlYXRlIGN1c3RvbSBldmVudHNcbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzIChgdGhpc2AgY29udGV4dCB3aWxsIGJlIHRoZSBjb21wb25lbnQgaW5zdGFuY2UpXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBub3RpZnk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlOb3RpZmllcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSBob3cgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5IHNob3VsZCBiZSBtb25pdG9yZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQnkgZGVmYXVsdCBhIGRlY29yYXRlZCBwcm9wZXJ0eSB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzICh0aHJvdWdoIGEgY3VzdG9tIHNldHRlciBmb3IgdGhlIHByb3BlcnR5KS5cbiAgICAgKiBBbnkgYHNldGAtb3BlcmF0aW9uIG9mIHRoaXMgcHJvcGVydHkgd2lsbCB0aGVyZWZvcmUgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhbmQgaW5pdGlhdGVcbiAgICAgKiBhIHJlbmRlciBhcyB3ZWxsIGFzIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IG9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5ICh0aGlzIHdpbGwgYnlwYXNzIHJlbmRlciwgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uKVxuICAgICAqICogYHRydWVgOiBPYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSB1c2luZyB0aGUge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfVxuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSBwcm92aWRlZCBtZXRob2QgdG8gY2hlY2sgaWYgcHJvcGVydHkgdmFsdWUgaGFzIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYCAodXNlcyB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9IGludGVybmFsbHkpXG4gICAgICovXG4gICAgb2JzZXJ2ZTogYm9vbGVhbiB8IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3I7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gKlxuICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGNoYW5nZWRcbiAqL1xuZXhwb3J0IGNvbnN0IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3JEZWZhdWx0OiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICAvLyBpbiBjYXNlIGBvbGRWYWx1ZWAgYW5kIGBuZXdWYWx1ZWAgYXJlIGBOYU5gLCBgKE5hTiAhPT0gTmFOKWAgcmV0dXJucyBgdHJ1ZWAsXG4gICAgLy8gYnV0IGAoTmFOID09PSBOYU4gfHwgTmFOID09PSBOYU4pYCByZXR1cm5zIGBmYWxzZWBcbiAgICByZXR1cm4gb2xkVmFsdWUgIT09IG5ld1ZhbHVlICYmIChvbGRWYWx1ZSA9PT0gb2xkVmFsdWUgfHwgbmV3VmFsdWUgPT09IG5ld1ZhbHVlKTtcbn07XG5cbi8vIFRPRE86IGFkZCB0ZXN0cyBmb3IgY2hhbmdlIGRldGVjdG9yc1xuLy8gVE9ETzogbW92ZSBjaGFuZ2UgZGV0ZWN0b3IgdG8gb3duIGZpbGVzP1xuZXhwb3J0IGNvbnN0IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3JPYmplY3Q6IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9sZEtleXMgPSBPYmplY3Qua2V5cyhvbGRWYWx1ZSk7XG4gICAgY29uc3QgbmV3S2V5cyA9IE9iamVjdC5rZXlzKG5ld1ZhbHVlKTtcbiAgICByZXR1cm4gb2xkS2V5cy5sZW5ndGggIT09IG5ld0tleXMubGVuZ3RoIHx8IG9sZEtleXMuc29tZShrZXkgPT4gb2xkVmFsdWVba2V5XSAhPT0gbmV3VmFsdWVba2V5XSk7XG59XG5cbmV4cG9ydCBjb25zdCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yQXJyYXk6IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueVtdLCBuZXdWYWx1ZTogYW55W10pID0+IHtcbiAgICByZXR1cm4gb2xkVmFsdWUubGVuZ3RoICE9PSBuZXdWYWx1ZS5sZW5ndGggfHwgb2xkVmFsdWUuc29tZSgodmFsdWUsIGluZGV4KSA9PiB2YWx1ZSAhPT0gbmV3VmFsdWVbaW5kZXhdKTtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT046IFByb3BlcnR5RGVjbGFyYXRpb24gPSB7XG4gICAgLy8gVE9ETzogY29uc2lkZXIgc2V0dGluZyBmYWxzZSBhcyBkZWZhdWx0IHZhbHVlXG4gICAgYXR0cmlidXRlOiB0cnVlLFxuICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdCxcbiAgICByZWZsZWN0QXR0cmlidXRlOiB0cnVlLFxuICAgIHJlZmxlY3RQcm9wZXJ0eTogdHJ1ZSxcbiAgICBub3RpZnk6IHRydWUsXG4gICAgb2JzZXJ2ZTogUHJvcGVydHlDaGFuZ2VEZXRlY3RvckRlZmF1bHQsXG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IGNyZWF0ZUF0dHJpYnV0ZU5hbWUsIERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIFByb3BlcnR5RGVjbGFyYXRpb24gfSBmcm9tICcuL3Byb3BlcnR5LWRlY2xhcmF0aW9uLmpzJztcbmltcG9ydCB7IGdldFByb3BlcnR5RGVzY3JpcHRvciB9IGZyb20gJy4vdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IuanMnO1xuXG4vKipcbiAqIEEgdHlwZSBleHRlbnNpb24gdG8gYWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byBhIHtAbGluayBDb21wb25lbnR9IGNvbnN0cnVjdG9yIGR1cmluZyBkZWNvcmF0aW9uXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gdHlwZW9mIENvbXBvbmVudCAmIHsgb3ZlcnJpZGRlbj86IFNldDxzdHJpbmc+IH07XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHlcbiAqXG4gKiBAcmVtYXJrc1xuICogTWFueSBvZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9wdGlvbnMgc3VwcG9ydCBjdXN0b20gZnVuY3Rpb25zLCB3aGljaCB3aWxsIGJlIGludm9rZWRcbiAqIHdpdGggdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhcyBgdGhpc2AtY29udGV4dCBkdXJpbmcgZXhlY3V0aW9uLiBJbiBvcmRlciB0byBzdXBwb3J0IGNvcnJlY3RcbiAqIHR5cGluZyBpbiB0aGVzZSBmdW5jdGlvbnMsIHRoZSBgQHByb3BlcnR5YCBkZWNvcmF0b3Igc3VwcG9ydHMgZ2VuZXJpYyB0eXBlcy4gSGVyZSBpcyBhbiBleGFtcGxlXG4gKiBvZiBob3cgeW91IGNhbiB1c2UgdGhpcyB3aXRoIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn06XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIG15SGlkZGVuUHJvcGVydHkgPSB0cnVlO1xuICpcbiAqICAgICAgLy8gdXNlIGEgZ2VuZXJpYyB0byBzdXBwb3J0IHByb3BlciBpbnN0YW5jZSB0eXBpbmcgaW4gdGhlIHByb3BlcnR5IHJlZmxlY3RvclxuICogICAgICBAcHJvcGVydHk8TXlFbGVtZW50Pih7XG4gKiAgICAgICAgICByZWZsZWN0UHJvcGVydHk6IChwcm9wZXJ0eUtleTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gKiAgICAgICAgICAgICAgLy8gdGhlIGdlbmVyaWMgdHlwZSBhbGxvd3MgZm9yIGNvcnJlY3QgdHlwaW5nIG9mIHRoaXNcbiAqICAgICAgICAgICAgICBpZiAodGhpcy5teUhpZGRlblByb3BlcnR5ICYmIG5ld1ZhbHVlKSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdteS1wcm9wZXJ0eScsICcnKTtcbiAqICAgICAgICAgICAgICB9IGVsc2Uge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbXktcHJvcGVydHknKTtcbiAqICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSBmYWxzZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEgcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGRlZmluaW5nIGNsYXNzZXMgaW4gVHlwZVNjcmlwdCwgY2xhc3MgZmllbGRzIGFjdHVhbGx5IGRvbid0IGV4aXN0IG9uIHRoZSBjbGFzcydzIHByb3RvdHlwZSwgYnV0XG4gICAgICAgICAqIHJhdGhlciwgdGhleSBhcmUgaW5zdGFudGlhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgZXhpc3Qgb25seSBvbiB0aGUgaW5zdGFuY2UuIEFjY2Vzc29yIHByb3BlcnRpZXNcbiAgICAgICAgICogYXJlIGFuIGV4Y2VwdGlvbiBob3dldmVyIGFuZCBleGlzdCBvbiB0aGUgcHJvdG90eXBlLiBGdXJ0aGVybW9yZSwgYWNjZXNzb3JzIGFyZSBpbmhlcml0ZWQgYW5kIHdpbGxcbiAgICAgICAgICogYmUgaW52b2tlZCB3aGVuIHNldHRpbmcgKG9yIGdldHRpbmcpIGEgcHJvcGVydHkgb24gYW4gaW5zdGFuY2Ugb2YgYSBjaGlsZCBjbGFzcywgZXZlbiBpZiB0aGF0IGNsYXNzXG4gICAgICAgICAqIGRlZmluZXMgdGhlIHByb3BlcnR5IGZpZWxkIG9uIGl0cyBvd24uIE9ubHkgaWYgdGhlIGNoaWxkIGNsYXNzIGRlZmluZXMgbmV3IGFjY2Vzc29ycyB3aWxsIHRoZSBwYXJlbnRcbiAgICAgICAgICogY2xhc3MncyBhY2Nlc3NvcnMgbm90IGJlIGluaGVyaXRlZC5cbiAgICAgICAgICogVG8ga2VlcCB0aGlzIGJlaGF2aW9yIGludGFjdCwgd2UgbmVlZCB0byBlbnN1cmUsIHRoYXQgd2hlbiB3ZSBjcmVhdGUgYWNjZXNzb3JzIGZvciBwcm9wZXJ0aWVzLCB3aGljaFxuICAgICAgICAgKiBhcmUgbm90IGRlY2xhcmVkIGFzIGFjY2Vzc29ycywgd2UgaW52b2tlIHRoZSBwYXJlbnQgY2xhc3MncyBhY2Nlc3NvciBhcyBleHBlY3RlZC5cbiAgICAgICAgICogVGhlIHtAbGluayBnZXRQcm9wZXJ0eURlc2NyaXB0b3J9IGZ1bmN0aW9uIGFsbG93cyB1cyB0byBsb29rIGZvciBhY2Nlc3NvcnMgb24gdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICAgICAgICAgKiB0aGUgY2xhc3Mgd2UgYXJlIGRlY29yYXRpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gcHJvcGVydHlEZXNjcmlwdG9yIHx8IGdldFByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgY29uc3QgaGlkZGVuS2V5ID0gU3ltYm9sKGBfXyR7IHByb3BlcnR5S2V5LnRvU3RyaW5nKCkgfWApO1xuXG4gICAgICAgIC8vIGlmIHdlIGZvdW5kIGFuIGFjY2Vzc29yIGRlc2NyaXB0b3IgKGZyb20gZWl0aGVyIHRoaXMgY2xhc3Mgb3IgYSBwYXJlbnQpIHdlIHVzZSBpdCwgb3RoZXJ3aXNlIHdlIGNyZWF0ZVxuICAgICAgICAvLyBkZWZhdWx0IGFjY2Vzc29ycyB0byBzdG9yZSB0aGUgYWN0dWFsIHByb3BlcnR5IHZhbHVlIGluIGEgaGlkZGVuIGZpZWxkIGFuZCByZXRyaWV2ZSBpdCBmcm9tIHRoZXJlXG4gICAgICAgIGNvbnN0IGdldHRlciA9IGRlc2NyaXB0b3I/LmdldCB8fCBmdW5jdGlvbiAodGhpczogYW55KSB7IHJldHVybiB0aGlzW2hpZGRlbktleV07IH07XG4gICAgICAgIGNvbnN0IHNldHRlciA9IGRlc2NyaXB0b3I/LnNldCB8fCBmdW5jdGlvbiAodGhpczogYW55LCB2YWx1ZTogYW55KSB7IHRoaXNbaGlkZGVuS2V5XSA9IHZhbHVlOyB9O1xuXG4gICAgICAgIC8vIHdlIGRlZmluZSBhIG5ldyBhY2Nlc3NvciBkZXNjcmlwdG9yIHdoaWNoIHdpbGwgd3JhcCB0aGUgcHJldmlvdXNseSByZXRyaWV2ZWQgb3IgY3JlYXRlZCBhY2Nlc3NvcnNcbiAgICAgICAgLy8gYW5kIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgd2hlbmV2ZXIgdGhlIHByb3BlcnR5IGlzIHNldFxuICAgICAgICBjb25zdCB3cmFwcGVkRGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yICYgVGhpc1R5cGU8YW55PiA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IGFueSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHBhc3MgYHZhbHVlYCBvbiBhcyBgbmV3VmFsdWVgIC0gYW4gaW5oZXJpdGVkIHNldHRlciBtaWdodCBtb2RpZnkgaXRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIGdldCB0aGUgbmV3IHZhbHVlIGJ5IGludm9raW5nIHRoZSBnZXR0ZXJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUocHJvcGVydHlLZXksIG9sZFZhbHVlLCBnZXR0ZXIuY2FsbCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uOiBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+ID0geyAuLi5ERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdGhlIGRlZmF1bHQgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPSBjcmVhdGVBdHRyaWJ1dGVOYW1lKHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLm9ic2VydmUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24ub2JzZXJ2ZSA9IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04ub2JzZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgaW5oZXJpdGVkIGFuIG9ic2VydmVkIGF0dHJpYnV0ZSBmb3IgdGhlIHByb3BlcnR5IGZyb20gdGhlIGJhc2UgY2xhc3NcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gY29uc3RydWN0b3IucHJvcGVydGllcy5oYXMocHJvcGVydHlLZXkpID8gY29uc3RydWN0b3IucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpIS5hdHRyaWJ1dGUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSBpdCdzIGEgc3RyaW5nIGFuZCBpdCB3aWxsIGV4aXN0IGluIHRoZSBhdHRyaWJ1dGVzIG1hcFxuICAgICAgICBpZiAoYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgaW5oZXJpdGVkIGF0dHJpYnV0ZSBhcyBpdCdzIG92ZXJyaWRkZW5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZGVsZXRlKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgLy8gbWFyayBhdHRyaWJ1dGUgYXMgb3ZlcnJpZGRlbiBmb3Ige0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuIS5hZGQoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuc2V0KGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uICphZnRlciogcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlcywgc28gd2UgY2FuIHN0aWxsIGFjY2VzcyB0aGVcbiAgICAgICAgLy8gaW5oZXJpdGVkIHByb3BlcnR5IGRlY2xhcmF0aW9uIHdoZW4gcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlc1xuICAgICAgICBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgZGVjbGFyYXRpb24gYXMgUHJvcGVydHlEZWNsYXJhdGlvbik7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgLy8gaWYgbm8gcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYSBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIHdoaWNoIG11c3QgcmV0dXJuIHZvaWQgYW5kIHdlIGNhbiBkZWZpbmUgdGhlIHdyYXBwZWQgZGVzY3JpcHRvciBoZXJlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgd3JhcHBlZERlc2NyaXB0b3IpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGlmIGEgcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYW4gYWNjZXNzb3JcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciBhbmQgd2UgbXVzdCByZXR1cm4gdGhlIHdyYXBwZWQgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWREZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIHByb3BlcnR5IGRlY29yYXRvciBzdG9yZXMgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgaW4gdGhlIGNvbnN0cnVjdG9yLFxuICogd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhvc2Ugc3RhdGljIGZpZWxkcyBhcmUgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZVxuICogYWRkIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkcy4gV2UgYWxzbyBtYWtlXG4gKiBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGNvbnN0cnVjdG9ycyBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYmFzZSBjbGFzcydzIG1hcHMgdG8gcHJvcGVybHlcbiAqIGluaGVyaXQgYWxsIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlcy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IERlY29yYXRlZENvbXBvbmVudFR5cGUpIHtcblxuICAgIC8vIHRoaXMgd2lsbCBnaXZlIHVzIGEgY29tcGlsZS10aW1lIGVycm9yIGlmIHdlIHJlZmFjdG9yIG9uZSBvZiB0aGUgc3RhdGljIGNvbnN0cnVjdG9yIHByb3BlcnRpZXNcbiAgICAvLyBhbmQgd2Ugd29uJ3QgbWlzcyByZW5hbWluZyB0aGUgcHJvcGVydHkga2V5c1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAncHJvcGVydGllcyc7XG4gICAgY29uc3QgYXR0cmlidXRlczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdhdHRyaWJ1dGVzJztcbiAgICBjb25zdCBvdmVycmlkZGVuOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ292ZXJyaWRkZW4nO1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0aWVzKSkgY29uc3RydWN0b3IucHJvcGVydGllcyA9IG5ldyBNYXAoY29uc3RydWN0b3IucHJvcGVydGllcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVzKSkgY29uc3RydWN0b3IuYXR0cmlidXRlcyA9IG5ldyBNYXAoY29uc3RydWN0b3IuYXR0cmlidXRlcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShvdmVycmlkZGVuKSkgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiA9IG5ldyBTZXQoKTtcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IGNyZWF0ZUV2ZW50TmFtZSB9IGZyb20gJy4vZGVjb3JhdG9ycy9pbmRleC5qcyc7XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgRXZlbnRJbml0IG9iamVjdFxuICpcbiAqIEByZW1hcmtzXG4gKiBXZSB1c3VhbGx5IHdhbnQgb3VyIEN1c3RvbUV2ZW50cyB0byBidWJibGUsIGNyb3NzIHNoYWRvdyBET00gYm91bmRhcmllcyBhbmQgYmUgY2FuY2VsYWJsZSxcbiAqIHNvIHdlIHNldCB1cCBhIGRlZmF1bHQgb2JqZWN0IHdpdGggdGhpcyBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9FVkVOVF9JTklUOiBFdmVudEluaXQgPSB7XG4gICAgYnViYmxlczogdHJ1ZSxcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIGNvbXBvc2VkOiB0cnVlLFxufTtcblxuLyoqXG4gKiBUaGUge0BsaW5rIENvbXBvbmVudEV2ZW50fSBkZXRhaWxcbiAqXG4gKiBAcmVtYXJrc1xuICogQ3VzdG9tRXZlbnRzIHRoYXQgY3Jvc3Mgc2hhZG93IERPTSBib3VuZGFyaWVzIGdldCByZS10YXJnZXRlZC4gVGhpcyBtZWFucywgdGhlIGV2ZW50J3MgYHRhcmdldGAgcHJvcGVydHlcbiAqIGlzIHNldCB0byB0aGUgQ3VzdG9tRWxlbWVudCB3aGljaCBob2xkcyB0aGUgc2hhZG93IERPTS4gV2Ugd2FudCB0byBwcm92aWRlIHRoZSBvcmlnaW5hbCB0YXJnZXQgaW4gZWFjaFxuICogQ29tcG9uZW50RXZlbnQgc28gZ2xvYmFsIGV2ZW50IGxpc3RlbmVycyBjYW4gZWFzaWx5IGFjY2VzcyB0aGUgZXZlbnQncyBvcmlnaW5hbCB0YXJnZXQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RXZlbnREZXRhaWw8QyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIHRhcmdldDogQztcbn1cblxuLyoqXG4gKiBUaGUgQ29tcG9uZW50RXZlbnQgY2xhc3NcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIENvbXBvbmVudEV2ZW50IGNsYXNzIGV4dGVuZHMgQ3VzdG9tRXZlbnQgYW5kIHNpbXBseSBwcm92aWRlcyB0aGUgZGVmYXVsdCBFdmVudEluaXQgb2JqZWN0IGFuZCBpdHMgdHlwaW5nXG4gKiBlbnN1cmVzIHRoYXQgdGhlIGV2ZW50IGRldGFpbCBjb250YWlucyBhIHRhcmdldCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEV2ZW50PFQgPSBhbnksIEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IGV4dGVuZHMgQ3VzdG9tRXZlbnQ8VCAmIENvbXBvbmVudEV2ZW50RGV0YWlsPEM+PiB7XG5cbiAgICBjb25zdHJ1Y3RvciAodHlwZTogc3RyaW5nLCBkZXRhaWw6IFQgJiBDb21wb25lbnRFdmVudERldGFpbDxDPiwgaW5pdDogRXZlbnRJbml0ID0ge30pIHtcblxuICAgICAgICBjb25zdCBldmVudEluaXQ6IEN1c3RvbUV2ZW50SW5pdDxUICYgQ29tcG9uZW50RXZlbnREZXRhaWw8Qz4+ID0ge1xuICAgICAgICAgICAgLi4uREVGQVVMVF9FVkVOVF9JTklULFxuICAgICAgICAgICAgLi4uaW5pdCxcbiAgICAgICAgICAgIGRldGFpbCxcbiAgICAgICAgfTtcblxuICAgICAgICBzdXBlcih0eXBlLCBldmVudEluaXQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIHR5cGUgZm9yIHByb3BlcnR5IGNoYW5nZSBldmVudCBkZXRhaWxzLCBhcyB1c2VkIGJ5IHtAbGluayBQcm9wZXJ0eUNoYW5nZUV2ZW50fVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlRXZlbnREZXRhaWw8VCA9IGFueSwgQyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gZXh0ZW5kcyBDb21wb25lbnRFdmVudERldGFpbDxDPiB7XG4gICAgcHJvcGVydHk6IHN0cmluZztcbiAgICBwcmV2aW91czogVDtcbiAgICBjdXJyZW50OiBUO1xufVxuXG4vKipcbiAqIFRoZSBQcm9wZXJ0eUNoYW5nZUV2ZW50IGNsYXNzXG4gKlxuICogQHJlbWFya3NcbiAqIEEgY3VzdG9tIGV2ZW50LCBhcyBkaXNwYXRjaGVkIGJ5IHRoZSB7QGxpbmsgQ29tcG9uZW50Ll9ub3RpZnlQcm9wZXJ0eX0gbWV0aG9kLiBUaGUgY29uc3RydWN0b3JcbiAqIGVuc3VyZXMgYSBjb252ZW50aW9uYWwgZXZlbnQgbmFtZSBpcyBjcmVhdGVkIGZvciB0aGUgcHJvcGVydHkga2V5IGFuZCBpbXBvc2VzIHRoZSBjb3JyZWN0IHR5cGVcbiAqIG9uIHRoZSBldmVudCBkZXRhaWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUNoYW5nZUV2ZW50PFQgPSBhbnksIEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IGV4dGVuZHMgQ29tcG9uZW50RXZlbnQ8UHJvcGVydHlDaGFuZ2VFdmVudERldGFpbDxUPiwgQz4ge1xuXG4gICAgY29uc3RydWN0b3IgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgZGV0YWlsOiBQcm9wZXJ0eUNoYW5nZUV2ZW50RGV0YWlsPFQsIEM+LCBpbml0PzogRXZlbnRJbml0KSB7XG5cbiAgICAgICAgY29uc3QgdHlwZSA9IGNyZWF0ZUV2ZW50TmFtZShwcm9wZXJ0eUtleSwgJycsICdjaGFuZ2VkJyk7XG5cbiAgICAgICAgc3VwZXIodHlwZSwgZGV0YWlsLCBpbml0KTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIExpZmVjeWNsZUV2ZW50IGNsYXNzXG4gKlxuICogQHJlbWFya3NcbiAqIEEgY3VzdG9tIGV2ZW50LCBhcyBkaXNwYXRjaGVkIGJ5IHRoZSB7QGxpbmsgQ29tcG9uZW50Ll9ub3RpZnlMaWZlY3ljbGV9IG1ldGhvZC4gVGhlIGNvbnN0cnVjdG9yXG4gKiBlbnN1cmVzIHRoZSBhbGxvd2VkIGxpZmVjeWNsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaWZlY3ljbGVFdmVudDxUID0gYW55LCBDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiBleHRlbmRzIENvbXBvbmVudEV2ZW50PFQsIEM+IHtcblxuICAgIGNvbnN0cnVjdG9yIChsaWZlY3ljbGU6ICdhZG9wdGVkJyB8ICdjb25uZWN0ZWQnIHwgJ2Rpc2Nvbm5lY3RlZCcgfCAndXBkYXRlJywgZGV0YWlsOiBUICYgQ29tcG9uZW50RXZlbnREZXRhaWw8Qz4sIGluaXQ/OiBFdmVudEluaXQpIHtcblxuICAgICAgICBzdXBlcihsaWZlY3ljbGUsIGRldGFpbCwgaW5pdCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgcmVuZGVyLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEF0dHJpYnV0ZVJlZmxlY3RvciwgaXNBdHRyaWJ1dGVSZWZsZWN0b3IsIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciwgaXNQcm9wZXJ0eUtleSwgaXNQcm9wZXJ0eU5vdGlmaWVyLCBpc1Byb3BlcnR5UmVmbGVjdG9yLCBMaXN0ZW5lckRlY2xhcmF0aW9uLCBQcm9wZXJ0eURlY2xhcmF0aW9uLCBQcm9wZXJ0eU5vdGlmaWVyLCBQcm9wZXJ0eVJlZmxlY3RvciwgU2VsZWN0b3JEZWNsYXJhdGlvbiB9IGZyb20gJy4vZGVjb3JhdG9ycy9pbmRleC5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnRFdmVudCwgTGlmZWN5Y2xlRXZlbnQsIFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICcuL2V2ZW50cy5qcyc7XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IgPSAoYXR0cmlidXRlUmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBhdHRyaWJ1dGUgcmVmbGVjdG9yICR7IFN0cmluZyhhdHRyaWJ1dGVSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IgPSAocHJvcGVydHlSZWZsZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IHJlZmxlY3RvciAkeyBTdHJpbmcocHJvcGVydHlSZWZsZWN0b3IpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUiA9IChwcm9wZXJ0eU5vdGlmaWVyOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSBub3RpZmllciAkeyBTdHJpbmcocHJvcGVydHlOb3RpZmllcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IENIQU5HRV9ERVRFQ1RPUl9FUlJPUiA9IChjaGFuZ2VEZXRlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yICR7IFN0cmluZyhjaGFuZ2VEZXRlY3RvcikgfS5gKTtcblxuLyoqXG4gKiBFeHRlbmRzIHRoZSBzdGF0aWMge0BsaW5rIExpc3RlbmVyRGVjbGFyYXRpb259IHRvIGluY2x1ZGUgdGhlIGJvdW5kIGxpc3RlbmVyXG4gKiBmb3IgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogQGludGVybmFsXG4gKi9cbmludGVyZmFjZSBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gZXh0ZW5kcyBMaXN0ZW5lckRlY2xhcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBib3VuZCBsaXN0ZW5lciB3aWxsIGJlIHN0b3JlZCBoZXJlLCBzbyBpdCBjYW4gYmUgcmVtb3ZlZCBpdCBsYXRlclxuICAgICAqL1xuICAgIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGV2ZW50IHRhcmdldCB3aWxsIGFsd2F5cyBiZSByZXNvbHZlZCB0byBhbiBhY3R1YWwge0BsaW5rIEV2ZW50VGFyZ2V0fVxuICAgICAqL1xuICAgIHRhcmdldDogRXZlbnRUYXJnZXQ7XG59XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2VzLCBhcyB1c2VkIGluIHtAbGluayBDb21wb25lbnQudXBkYXRlQ2FsbGJhY2t9XG4gKi9cbmV4cG9ydCB0eXBlIENoYW5nZXMgPSBNYXA8UHJvcGVydHlLZXksIGFueT47XG5cbi8qKlxuICogVGhlIGNvbXBvbmVudCBiYXNlIGNsYXNzXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hlbiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICogaW5zdGFuY2UgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZVNoZWV0ICgpOiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVTaGVldCcpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBzdHlsZSBzaGVldCBhbmQgY2FjaGUgaXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBuZXcgQ1NTU3R5bGVTaGVldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQucmVwbGFjZVN5bmModGhpcy5zdHlsZXMuam9pbignXFxuJykpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVTaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBub2RlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZUVsZW1lbnQgKCk6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZUVsZW1lbnQnKSkge1xuXG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRpdGxlID0gdGhpcy5zZWxlY3RvcjtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBhdHRyaWJ1dGUgbmFtZXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkga2V5c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICogcHJvcGVydHkga2V5IHRoYXQgYmVsb25ncyB0byBhbiBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBQcm9wZXJ0eUtleT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9mIGEgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBQcm9wZXJ0eURlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIGxpc3RlbmVyfSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gb2YgYSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuZXJzOiBNYXA8UHJvcGVydHlLZXksIExpc3RlbmVyRGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBzZWxlY3RvciBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgc2VsZWN0b3J9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBTZWxlY3RvckRlY2xhcmF0aW9ufSBvZiBhIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIHNlbGVjdG9yczogTWFwPFByb3BlcnR5S2V5LCBTZWxlY3RvckRlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzZWxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzZWxlY3RvcmAgb3B0aW9uLCBpZiBwcm92aWRlZC5cbiAgICAgKiBPdGhlcndpc2UgdGhlIGRlY29yYXRvciB3aWxsIHVzZSB0aGlzIHByb3BlcnR5IHRvIGRlZmluZSB0aGUgY29tcG9uZW50LlxuICAgICAqL1xuICAgIHN0YXRpYyBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBzZXQgYnkgdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzaGFkb3dgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHRydWVgKS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2hhZG93OiBib29sZWFuO1xuXG4gICAgLy8gVE9ETzogY3JlYXRlIHRlc3RzIGZvciBzdHlsZSBpbmhlcml0YW5jZVxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzdHlsZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc3R5bGVzYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBTdHlsZXMgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3Igd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICogVGhpcyBhbGxvd3MgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQgYW5kIGFkZCBhZGRpdGlvbmFsIHN0eWxlcyBvbiB0aGUgY2hpbGQgY29tcG9uZW50LlxuICAgICAqIEluIG9yZGVyIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50LCBhbiBleHBsaWNpdCBzdXBlciBjYWxsIGhhcyB0byBiZSBpbmNsdWRlZC4gQnlcbiAgICAgKiBkZWZhdWx0IG5vIHN0eWxlcyBhcmUgaW5oZXJpdGVkLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gW1xuICAgICAqICAgICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICogICAgICAgICAgICAgICc6aG9zdCB7IGJhY2tncm91bmQtY29sb3I6IGdyZWVuOyB9J1xuICAgICAqICAgICAgICAgIF07XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgc3R5bGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGB0ZW1wbGF0ZWAgb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogSWYgc2V0IGluIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IsIGl0IHdpbGwgaGF2ZSBwcmVjZWRlbmNlIG92ZXIgdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgICBUaGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHdoaWNoIHNob3VsZCBleGlzdCBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBzdGF0aWMgdGVtcGxhdGU/OiAoZWxlbWVudDogYW55LCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdG8gc3BlY2lmeSBhdHRyaWJ1dGVzIHdoaWNoIHNob3VsZCBiZSBvYnNlcnZlZCwgYnV0IGRvbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya1xuICAgICAqIEZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBkZWNvcmF0ZWQgd2l0aCB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IsIGFuIG9ic2VydmVkIGF0dHJpYnV0ZVxuICAgICAqIGlzIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzcGVjaWZpZWQgaGVyZS4gRm90IGF0dHJpYnV0ZXMgdGhhdCBkb24ndFxuICAgICAqIGhhdmUgYW4gYXNzb2NpYXRlZCBwcm9wZXJ0eSwgcmV0dXJuIHRoZSBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhpcyBnZXR0ZXIuIENoYW5nZXMgdG8gdGhlc2VcbiAgICAgKiBhdHRyaWJ1dGVzIGNhbiBiZSBoYW5kbGVkIGluIHRoZSB7QGxpbmsgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrfSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBXaGVuIGV4dGVuZGluZyBjb21wb25lbnRzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIHRoZSBzdXBlciBjbGFzcydzIG9ic2VydmVkQXR0cmlidXRlc1xuICAgICAqIGlmIHlvdSBvdmVycmlkZSB0aGlzIGdldHRlciAoZXhjZXB0IGlmIHlvdSBkb24ndCB3YW50IHRvIGluaGVyaXQgb2JzZXJ2ZWQgYXR0cmlidXRlcyk6XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbXG4gICAgICogICAgICAgICAgICAgIC4uLnN1cGVyLm9ic2VydmVkQXR0cmlidXRlcyxcbiAgICAgKiAgICAgICAgICAgICAgJ215LWFkZGl0aW9uYWwtYXR0cmlidXRlJ1xuICAgICAqICAgICAgICAgIF07XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdXBkYXRlUmVxdWVzdDogUHJvbWlzZTxib29sZWFuPiA9IFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY2hhbmdlZFByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdGluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5aW5nUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW5lckRlY2xhcmF0aW9uczogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uW10gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzVXBkYXRlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaXNSZWZsZWN0aW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgY29tcG9uZW50J3MgdXBkYXRlIGN5Y2xlIHdhcyBydW4gYXQgbGVhc3Qgb25jZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIHByb3BlcnR5IGlzIGFuYWxvZ291cyB0byB0aGUge0BsaW5rIHVwZGF0ZX0gYW5kIHtAbGluayB1cGRhdGVDYWxsYmFja30gbWV0aG9kJ3MgYGZpcnN0VXBkYXRlYCBwYXJhbWV0ZXIuXG4gICAgICogSXQgY2FuIGJlIHVzZWZ1bCBpbiBzaXR1YXRpb25zIHdoZXJlIGxvZ2ljIGNhbid0IGJlIHJ1biBpbnNpZGUgYSBjb21wb25lbnQncyB1cGRhdGUvdXBkYXRlQ2FsbGJhY2sgbWV0aG9kcyBidXRcbiAgICAgKiB3ZSBzdGlsbCBuZWVkIHRvIGtub3cgaWYgdGhlIGNvbXBvbmVudCBoYXMgdXBkYXRlZCBhbHJlYWR5LlxuICAgICAqXG4gICAgICogQHJlYWRvbmx5XG4gICAgICovXG4gICAgZ2V0IGhhc1VwZGF0ZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9oYXNVcGRhdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSByZW5kZXIgcm9vdCBpcyB3aGVyZSB0aGUge0BsaW5rIHJlbmRlcn0gbWV0aG9kIHdpbGwgYXR0YWNoIGl0cyBET00gb3V0cHV0XG4gICAgICovXG4gICAgcmVhZG9ubHkgcmVuZGVyUm9vdDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKC4uLmFyZ3M6IGFueVtdKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlbmRlclJvb3QgPSB0aGlzLl9jcmVhdGVSZW5kZXJSb290KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBtb3ZlZCB0byBhIG5ldyBkb2N1bWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgYWRvcHRlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Fkb3B0ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgZG9jdW1lbnQncyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl91bmxpc3RlbigpO1xuXG4gICAgICAgIHRoaXMuX3Vuc2VsZWN0KCk7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdkaXNjb25uZWN0ZWQnKTtcblxuICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgb25lIG9mIHRoZSBjb21wb25lbnQncyBhdHRyaWJ1dGVzIGlzIGFkZGVkLCByZW1vdmVkLCBvciBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoaWNoIGF0dHJpYnV0ZXMgdG8gbm90aWNlIGNoYW5nZSBmb3IgaXMgc3BlY2lmaWVkIGluIHtAbGluayBvYnNlcnZlZEF0dHJpYnV0ZXN9LlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogRm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHdpdGggYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGUsIHRoaXMgaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5LlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gdG8gY3VzdG9taXplIHRoZSBoYW5kbGluZyBvZiBhdHRyaWJ1dGUgY2hhbmdlcy4gV2hlbiBvdmVycmlkaW5nXG4gICAgICogdGhpcyBtZXRob2QsIGEgc3VwZXItY2FsbCBzaG91bGQgYmUgaW5jbHVkZWQsIHRvIGVuc3VyZSBhdHRyaWJ1dGUgY2hhbmdlcyBmb3IgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgKiBhcmUgcHJvY2Vzc2VkIGNvcnJlY3RseS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayAoYXR0cmlidXRlOiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHN1cGVyLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICpcbiAgICAgKiAgICAgICAgICAvLyBkbyBjdXN0b20gaGFuZGxpbmcuLi5cbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBpZiAodGhpcy5faXNSZWZsZWN0aW5nIHx8IG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCB1cGRhdGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBgdXBkYXRlQ2FsbGJhY2tgIGlzIGludm9rZWQgc3luY2hyb25vdXNseSBieSB0aGUge0BsaW5rIHVwZGF0ZX0gbWV0aG9kIGFuZCB0aGVyZWZvcmUgaGFwcGVucyBkaXJlY3RseSBhZnRlclxuICAgICAqIHJlbmRlcmluZywgcHJvcGVydHkgcmVmbGVjdGlvbiBhbmQgcHJvcGVydHkgY2hhbmdlIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIE4uQi46IENoYW5nZXMgbWFkZSB0byBwcm9wZXJ0aWVzIG9yIGF0dHJpYnV0ZXMgaW5zaWRlIHRoaXMgY2FsbGJhY2sgKndvbid0KiBjYXVzZSBhbm90aGVyIHVwZGF0ZS5cbiAgICAgKiBUbyBjYXVzZSBhbiB1cGRhdGUsIGRlZmVyIGNoYW5nZXMgd2l0aCB0aGUgaGVscCBvZiBhIFByb21pc2UuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAqICAgICAgICAgICAgICAvLyBwZXJmb3JtIGNoYW5nZXMgd2hpY2ggbmVlZCB0byBjYXVzZSBhbm90aGVyIHVwZGF0ZSBoZXJlXG4gICAgICogICAgICAgICAgfSk7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5nZXMgICAgICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IGNoYW5nZWQgaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBmaXJzdFVwZGF0ZSAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoaXMgd2FzIHRoZSBmaXJzdCB1cGRhdGVcbiAgICAgKi9cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHsgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBjdXN0b20gZXZlbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIEFuIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0gZXZlbnRJbml0IEEge0BsaW5rIEN1c3RvbUV2ZW50SW5pdH0gZGljdGlvbmFyeVxuICAgICAqIEBkZXByZWNhdGVkICBVc2Uge0BsaW5rIENvbXBvbmVudC5kaXNwYXRjaH0gaW5zdGVhZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnkgKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudEluaXQ/OiBDdXN0b21FdmVudEluaXQpIHtcblxuICAgICAgICAvLyBUT0RPOiBpbXByb3ZlIHRoaXMhIHdlIHNob3VsZCBwdWxsIHRoZSBkaXNwYXRjaCBtZXRob2QgZnJvbSBleGFtcGxlIGludG8gLi9ldmVudHNcbiAgICAgICAgLy8gYW5kIHVzZSBpdCBoZXJlOyB3ZSBzaG91bGQgY2hhbmdlIG5vdGlmeSgpIGFyZ3VtZW50cyB0byB0eXBlLCBkZXRhaWwsIGluaXRcbiAgICAgICAgLy8gbWF5YmUgd2Ugc2hvdWxkIGV2ZW4gcmVuYW1lIGl0IHRvIGRpc3BhdGNoLi4uXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBldmVudEluaXQpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhbiBldmVudCBvbiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRvIGRpc3BhdGNoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRpc3BhdGNoIChldmVudDogRXZlbnQpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSB7QGxpbmsgQ29tcG9uZW50RXZlbnR9IG9uIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgY2FsbGVkIHdpdGggYSB0eXBlIGFuZCBkZXRhaWwgYXJndW1lbnQsIHRoZSBkaXNwYXRjaCBtZXRob2Qgd2lsbCBjcmVhdGUgYSBuZXcge0BsaW5rIENvbXBvbmVudEV2ZW50fVxuICAgICAqIGFuZCBzZXQgaXRzIGRldGFpbCdzIGB0YXJnZXRgIHByb3BlcnR5IHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHlwZSAgICAgIFRoZSB0eXBlIG9mIHRoZSBldmVudFxuICAgICAqIEBwYXJhbSBkZXRhaWwgICAgQW4gb3B0aW9uYWwgY3VzdG9tIGV2ZW50IGRldGFpbFxuICAgICAqIEBwYXJhbSBpbml0ICAgICAgQW4gb3B0aW9uYWwge0BsaW5rIEV2ZW50SW5pdH0gZGljdGlvbmFyeVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBkaXNwYXRjaDxUID0gYW55PiAodHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBpbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcblxuICAgIHByb3RlY3RlZCBkaXNwYXRjaDxUID0gYW55PiAoZXZlbnRPclR5cGU6IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBpbml0OiBQYXJ0aWFsPEV2ZW50SW5pdD4gPSB7fSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICh0eXBlb2YgZXZlbnRPclR5cGUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgICAgIGV2ZW50T3JUeXBlID0gbmV3IENvbXBvbmVudEV2ZW50PFQ+KGV2ZW50T3JUeXBlLCB7IHRhcmdldDogdGhpcywgLi4uZGV0YWlsISB9LCBpbml0KVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudE9yVHlwZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2ggcHJvcGVydHkgY2hhbmdlcyBvY2N1cnJpbmcgaW4gdGhlIGV4ZWN1dG9yIGFuZCByYWlzZSBjdXN0b20gZXZlbnRzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFByb3BlcnR5IGNoYW5nZXMgc2hvdWxkIHRyaWdnZXIgY3VzdG9tIGV2ZW50cyB3aGVuIHRoZXkgYXJlIGNhdXNlZCBieSBpbnRlcm5hbCBzdGF0ZSBjaGFuZ2VzLFxuICAgICAqIGJ1dCBub3QgaWYgdGhleSBhcmUgY2F1c2VkIGJ5IGEgY29uc3VtZXIgb2YgdGhlIGNvbXBvbmVudCBBUEkgZGlyZWN0bHksIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbXktY3VzdG9tLWVsZW1lbnQnKS5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogYGBgLlxuICAgICAqXG4gICAgICogVGhpcyBtZWFucywgd2UgY2Fubm90IGF1dG9tYXRlIHRoaXMgcHJvY2VzcyB0aHJvdWdoIHByb3BlcnR5IHNldHRlcnMsIGFzIHdlIGNhbid0IGJlIHN1cmUgd2hvXG4gICAgICogaW52b2tlZCB0aGUgc2V0dGVyIC0gaW50ZXJuYWwgY2FsbHMgb3IgZXh0ZXJuYWwgY2FsbHMuXG4gICAgICpcbiAgICAgKiBPbmUgb3B0aW9uIGlzIHRvIG1hbnVhbGx5IHJhaXNlIHRoZSBldmVudCwgd2hpY2ggY2FuIGJlY29tZSB0ZWRpb3VzIGFuZCBmb3JjZXMgdXMgdG8gdXNlIHN0cmluZy1cbiAgICAgKiBiYXNlZCBldmVudCBuYW1lcyBvciBwcm9wZXJ0eSBuYW1lcywgd2hpY2ggYXJlIGRpZmZpY3VsdCB0byByZWZhY3RvciwgZS5nLjpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAvLyBpZiB3ZSByZWZhY3RvciB0aGUgcHJvcGVydHkgbmFtZSwgd2UgY2FuIGVhc2lseSBtaXNzIHRoZSBub3RpZnkgY2FsbFxuICAgICAqIHRoaXMubm90aWZ5KCdjdXN0b21Qcm9wZXJ0eScpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQSBtb3JlIGNvbnZlbmllbnQgd2F5IGlzIHRvIGV4ZWN1dGUgdGhlIGludGVybmFsIGNoYW5nZXMgaW4gYSB3cmFwcGVyIHdoaWNoIGNhbiBkZXRlY3QgdGhlIGNoYW5nZWRcbiAgICAgKiBwcm9wZXJ0aWVzIGFuZCB3aWxsIGF1dG9tYXRpY2FsbHkgcmFpc2UgdGhlIHJlcXVpcmVkIGV2ZW50cy4gVGhpcyBlbGltaW5hdGVzIHRoZSBuZWVkIHRvIG1hbnVhbGx5XG4gICAgICogcmFpc2UgZXZlbnRzIGFuZCByZWZhY3RvcmluZyBkb2VzIG5vIGxvbmdlciBhZmZlY3QgdGhlIHByb2Nlc3MuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy53YXRjaCgoKSA9PiB7XG4gICAgICpcbiAgICAgKiAgICAgIHRoaXMuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqICAgICAgLy8gd2UgY2FuIGFkZCBtb3JlIHByb3BlcnR5IG1vZGlmaWNhdGlvbnMgdG8gbm90aWZ5IGluIGhlcmVcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBleGVjdXRvciBBIGZ1bmN0aW9uIHRoYXQgcGVyZm9ybXMgdGhlIGNoYW5nZXMgd2hpY2ggc2hvdWxkIGJlIG5vdGlmaWVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdhdGNoIChleGVjdXRvcjogKCkgPT4gdm9pZCkge1xuXG4gICAgICAgIC8vIGJhY2sgdXAgY3VycmVudCBjaGFuZ2VkIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgcHJldmlvdXNDaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG5cbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgY2hhbmdlc1xuICAgICAgICBleGVjdXRvcigpO1xuXG4gICAgICAgIC8vIGFkZCBhbGwgbmV3IG9yIHVwZGF0ZWQgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIHRoZSBub3RpZnlpbmcgcHJvcGVydGllc1xuICAgICAgICBmb3IgKGNvbnN0IFtwcm9wZXJ0eUtleSwgb2xkVmFsdWVdIG9mIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZGVkID0gIXByZXZpb3VzQ2hhbmdlcy5oYXMocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9ICFhZGRlZCAmJiB0aGlzLmhhc0NoYW5nZWQocHJvcGVydHlLZXksIHByZXZpb3VzQ2hhbmdlcy5nZXQocHJvcGVydHlLZXkpLCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIGlmIChhZGRlZCB8fCB1cGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSB2YWx1ZSBvZiBhIGRlY29yYXRlZCBwcm9wZXJ0eSBvciBpdHMgYXNzb2NpYXRlZFxuICAgICAqIGF0dHJpYnV0ZSBjaGFuZ2VzLiBJZiB5b3UgbmVlZCB0aGUgY29tcG9uZW50IHRvIHVwZGF0ZSBiYXNlZCBvbiBhIHN0YXRlIGNoYW5nZSB0aGF0IGlzXG4gICAgICogbm90IGNvdmVyZWQgYnkgYSBkZWNvcmF0ZWQgcHJvcGVydHksIGNhbGwgdGhpcyBtZXRob2Qgd2l0aG91dCBhbnkgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIGtleSBvZiB0aGUgY2hhbmdlZCBwcm9wZXJ0eSB0aGF0IHJlcXVlc3RzIHRoZSB1cGRhdGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgdGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEByZXR1cm5zICAgICAgICAgICAgIEEgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCB3aGVuIHRoZSB1cGRhdGUgaXMgY29tcGxldGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlcXVlc3RVcGRhdGUgKHByb3BlcnR5S2V5PzogUHJvcGVydHlLZXksIG9sZFZhbHVlPzogYW55LCBuZXdWYWx1ZT86IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eUtleSkge1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259J3Mgb2JzZXJ2ZSBvcHRpb24gaXMgYGZhbHNlYCwge0BsaW5rIGhhc0NoYW5nZWR9XG4gICAgICAgICAgICAvLyB3aWxsIHJldHVybiBgZmFsc2VgIGFuZCBubyB1cGRhdGUgd2lsbCBiZSByZXF1ZXN0ZWRcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpKSByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAgICAgLy8gc3RvcmUgY2hhbmdlZCBwcm9wZXJ0eSBmb3IgYmF0Y2ggcHJvY2Vzc2luZ1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBpbiByZWZsZWN0aW5nIHN0YXRlLCBhbiBhdHRyaWJ1dGUgaXMgcmVmbGVjdGluZyB0byB0aGlzIHByb3BlcnR5IGFuZCB3ZVxuICAgICAgICAgICAgLy8gY2FuIHNraXAgcmVmbGVjdGluZyB0aGUgcHJvcGVydHkgYmFjayB0byB0aGUgYXR0cmlidXRlXG4gICAgICAgICAgICAvLyBwcm9wZXJ0eSBjaGFuZ2VzIG5lZWQgdG8gYmUgdHJhY2tlZCBob3dldmVyIGFuZCB7QGxpbmsgcmVuZGVyfSBtdXN0IGJlIGNhbGxlZCBhZnRlclxuICAgICAgICAgICAgLy8gdGhlIGF0dHJpYnV0ZSBjaGFuZ2UgaXMgcmVmbGVjdGVkIHRvIHRoaXMgcHJvcGVydHlcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNSZWZsZWN0aW5nKSB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGVucXVldWUgdXBkYXRlIHJlcXVlc3QgaWYgbm9uZSB3YXMgZW5xdWV1ZWQgYWxyZWFkeVxuICAgICAgICAgICAgdGhpcy5fZW5xdWV1ZVVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUgdG8gaXRzIHtAbGluayByZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBVc2VzIGxpdC1odG1sJ3Mge0BsaW5rIGxpdC1odG1sI3JlbmRlcn0gbWV0aG9kIHRvIHJlbmRlciBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0gdG8gdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIHJvb3QuIFRoZSBjb21wb25lbnQgaW5zdGFuY2Ugd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHN0YXRpYyB0ZW1wbGF0ZSBtZXRob2RcbiAgICAgKiBhdXRvbWF0aWNhbGx5LiBUbyBtYWtlIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhdmFpbGFibGUgdG8gdGhlIHRlbXBsYXRlIG1ldGhvZCwgeW91IGNhbiBwYXNzIHRoZW0gdG8gdGhlXG4gICAgICogcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBjb25zdCBkYXRlRm9ybWF0dGVyID0gKGRhdGU6IERhdGUpID0+IHsgLy8gcmV0dXJuIHNvbWUgZGF0ZSB0cmFuc2Zvcm1hdGlvbi4uLlxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCcsXG4gICAgICogICAgICB0ZW1wbGF0ZTogKGVsZW1lbnQsIGZvcm1hdERhdGUpID0+IGh0bWxgPHNwYW4+TGFzdCB1cGRhdGVkOiAkeyBmb3JtYXREYXRlKGVsZW1lbnQubGFzdFVwZGF0ZWQpIH08L3NwYW4+YFxuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgQHByb3BlcnR5KClcbiAgICAgKiAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAqXG4gICAgICogICAgICByZW5kZXIgKCkge1xuICAgICAqICAgICAgICAgIC8vIG1ha2UgdGhlIGRhdGUgZm9ybWF0dGVyIGF2YWlsYWJsZSBpbiB0aGUgdGVtcGxhdGUgYnkgcGFzc2luZyBpdCB0byByZW5kZXIoKVxuICAgICAqICAgICAgICAgIHN1cGVyLnJlbmRlcihkYXRlRm9ybWF0dGVyKTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaGVscGVycyAgIEFueSBhZGRpdGlvbmFsIG9iamVjdHMgd2hpY2ggc2hvdWxkIGJlIGF2YWlsYWJsZSBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICguLi5oZWxwZXJzOiBhbnlbXSkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gY29uc3RydWN0b3IudGVtcGxhdGUgJiYgY29uc3RydWN0b3IudGVtcGxhdGUodGhpcywgLi4uaGVscGVycyk7XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlKSByZW5kZXIodGVtcGxhdGUsIHRoaXMucmVuZGVyUm9vdCwgeyBldmVudENvbnRleHQ6IHRoaXMgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgY29tcG9uZW50IGFmdGVyIGFuIHVwZGF0ZSB3YXMgcmVxdWVzdGVkIHdpdGgge0BsaW5rIHJlcXVlc3RVcGRhdGV9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIHJlbmRlcnMgdGhlIHRlbXBsYXRlLCByZWZsZWN0cyBjaGFuZ2VkIHByb3BlcnRpZXMgdG8gYXR0cmlidXRlcyBhbmRcbiAgICAgKiBkaXNwYXRjaGVzIGNoYW5nZSBldmVudHMgZm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uLlxuICAgICAqIFRvIGhhbmRsZSB1cGRhdGVzIGRpZmZlcmVudGx5LCB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgICAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gcmVmbGVjdGlvbnMgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBtYXJrZWQgZm9yIHJlZmxlY3Rpb24gaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25zIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCB3ZXJlIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZmlyc3RVcGRhdGUgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIGlzIHRoZSBmaXJzdCB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGUgKGNoYW5nZXM6IENoYW5nZXMsIHJlZmxlY3Rpb25zOiBDaGFuZ2VzLCBub3RpZmljYXRpb25zOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcblxuICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlIHdlIGFkb3B0IHRoZSBlbGVtZW50J3Mgc3R5bGVzIGFuZCBzZXQgdXAgZGVjbGFyZWQgbGlzdGVuZXJzXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICB0aGlzLl9zdHlsZSgpO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0KCk7XG4gICAgICAgICAgICAvLyBiaW5kIGxpc3RlbmVycyBhZnRlciByZW5kZXIgdG8gZW5zdXJlIGFsbCBET00gaXMgcmVuZGVyZWQsIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAvLyBhcmUgdXAtdG8tZGF0ZSBhbmQgYW55IHVzZXItY3JlYXRlZCBvYmplY3RzIChlLmcuIHdvcmtlcnMpIHdpbGwgYmUgY3JlYXRlZCBpbiBhblxuICAgICAgICAgICAgLy8gb3ZlcnJpZGRlbiBjb25uZWN0ZWRDYWxsYmFjazsgYnV0IGJlZm9yZSBkaXNwYXRjaGluZyBhbnkgcHJvcGVydHktY2hhbmdlIGV2ZW50c1xuICAgICAgICAgICAgLy8gdG8gbWFrZSBzdXJlIGxvY2FsIGxpc3RlbmVycyBhcmUgYm91bmQgZmlyc3RcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbigpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdCgpO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBjYW4gd2UgY2hlY2sgaWYgc2VsZWN0ZWQgbm9kZXMgY2hhbmdlZCBhbmQgaWYgbGlzdGVuZXJzIGFyZSBhZmZlY3RlZD9cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVmbGVjdFByb3BlcnRpZXMocmVmbGVjdGlvbnMpO1xuICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnRpZXMobm90aWZpY2F0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBjb21wb25lbnQgYWZ0ZXIgYW4gdXBkYXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBSZXNldHMgdGhlIGNvbXBvbmVudCdzIHByb3BlcnR5IHRyYWNraW5nIG1hcHMgd2hpY2ggYXJlIHVzZWQgaW4gdGhlIHVwZGF0ZSBjeWNsZSB0byB0cmFjayBjaGFuZ2VzLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZXNldCAoKSB7XG5cbiAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgcHJvcGVydHkgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZXNvbHZlcyB0aGUge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9IGZvciB0aGUgcHJvcGVydHkgYW5kIHJldHVybnMgaXRzIHJlc3VsdC5cbiAgICAgKiBJZiBub25lIGlzIGRlZmluZWQgKHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbidzIGBvYnNlcnZlYCBvcHRpb24gaXMgYGZhbHNlYCkgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IGNoYW5nZWQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhhc0NoYW5nZWQgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIG9ic2VydmUgaXMgZWl0aGVyIGBmYWxzZWAgb3IgYSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZSkpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlLmNhbGwobnVsbCwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgIHRocm93IENIQU5HRV9ERVRFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBmb3IgYSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSBUaGUgcHJvcGVydHkga2V5IGZvciB3aGljaCB0byByZXRyaWV2ZSB0aGUgZGVjbGFyYXRpb25cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UHJvcGVydHlEZWNsYXJhdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZWNsYXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnByb3BlcnRpZXMuZ2V0KHByb3BlcnR5S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGFsbCBwcm9wZXJ0eSBjaGFuZ2VzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCBhbGwgcHJvcGVydGllcyBvZiB0aGUgY29tcG9uZW50LCB3aGljaCBoYXZlIGJlZW4gbWFya2VkIGZvciByZWZsZWN0aW9uLlxuICAgICAqIEl0IGlzIGNhbGxlZCBieSB0aGUge0BsaW5rIENvbXBvbmVudC51cGRhdGV9IG1ldGhvZCBhZnRlciB0aGUgdGVtcGxhdGUgaGFzIGJlZW4gcmVuZGVyZWQuIElmIG5vXG4gICAgICogcHJvcGVydGllcyBtYXAgaXMgcHJvdmlkZWQsIHRoaXMgbWV0aG9kIHdpbGwgcmVmbGVjdCBhbGwgcHJvcGVydGllcyB3aGljaCBoYXZlIGJlZW4gbWFya2VkIGZvclxuICAgICAqIHJlZmxlY3Rpb24gc2luY2UgdGhlIGxhc3QgYHVwZGF0ZWAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydGllcyBBbiBvcHRpb25hbCBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcHJldmlvdXMgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdFByb3BlcnRpZXMgKHByb3BlcnRpZXM/OiBNYXA8UHJvcGVydHlLZXksIGFueT4pIHtcblxuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyA/PyB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcyBhcyBNYXA8a2V5b2YgdGhpcywgYW55PjtcblxuICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKG9sZFZhbHVlLCBwcm9wZXJ0eUtleSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLnJlZmxlY3RQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgdGhpc10pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSYWlzZSBjaGFuZ2UgZXZlbnRzIGZvciBhbGwgY2hhbmdlZCBwcm9wZXJ0aWVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gcmFpc2UgY2hhbmdlIGV2ZW50cyBmb3IgYWxsIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCwgd2hpY2ggaGF2ZSBiZWVuXG4gICAgICogbWFya2VkIGZvciBub3RpZmljYXRpb24uIEl0IGlzIGNhbGxlZCBieSB0aGUge0BsaW5rIENvbXBvbmVudC51cGRhdGV9IG1ldGhvZCBhZnRlciB0aGUgdGVtcGxhdGVcbiAgICAgKiBoYXMgYmVlbiByZW5kZXJlZCBhbmQgcHJvcGVydGllcyBoYXZlIGJlZW4gcmVmbGVjdGVkLiBJZiBubyBwcm9wZXJ0aWVzIG1hcCBpcyBwcm92aWRlZCwgdGhpc1xuICAgICAqIG1ldGhvZCB3aWxsIG5vdGlmeSBhbGwgcHJvcGVydGllcyB3aGljaCBoYXZlIGJlZW4gbWFya2VkIGZvciBub3RpZmljYXRpb24gc2luY2UgdGhlIGxhc3QgYHVwZGF0ZWAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydGllcyBBbiBvcHRpb25hbCBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcHJldmlvdXMgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5UHJvcGVydGllcyAocHJvcGVydGllcz86IE1hcDxQcm9wZXJ0eUtleSwgYW55Pikge1xuXG4gICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzID8/IHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMgYXMgTWFwPGtleW9mIHRoaXMsIGFueT47XG5cbiAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZSwgcHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgdGhpc10pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogYXNzb2NpYXRlZCBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgcmVmbGVjdG9yLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogcmVmbGVjdG9yIHtAbGluayBfcmVmbGVjdEF0dHJpYnV0ZX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIC8vIGlnbm9yZSB1c2VyLWRlZmluZWQgb2JzZXJ2ZWQgYXR0cmlidXRlc1xuICAgICAgICAvLyBUT0RPOiB0ZXN0IHRoaXMgYW5kIHJlbW92ZSB0aGUgbG9nXG4gICAgICAgIGlmICghcHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYG9ic2VydmVkIGF0dHJpYnV0ZSBcIiR7IGF0dHJpYnV0ZU5hbWUgfVwiIG5vdCBmb3VuZC4uLiBpZ25vcmluZy4uLmApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlfSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc0F0dHJpYnV0ZVJlZmxlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUuY2FsbCh0aGlzLCBhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlXSBhcyBBdHRyaWJ1dGVSZWZsZWN0b3IpKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgcmVmbGVjdG9yLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogcmVmbGVjdG9yIHtAbGluayBfcmVmbGVjdFByb3BlcnR5fS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHl9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSB7XG5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayBpcyBjYWxsZWQgc3luY2hyb25vdXNseSwgd2UgY2FuIGNhdGNoIHRoZSBzdGF0ZSB0aGVyZVxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHldIGFzIFByb3BlcnR5UmVmbGVjdG9yKShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2UgYW4gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIG5vdGlmaWVyLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogbm90aWZpZXIge0BsaW5rIF9ub3RpZnlQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJhaXNlIGFuIGV2ZW50IGZvclxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkge1xuXG4gICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eU5vdGlmaWVyKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeV0gYXMgUHJvcGVydHlOb3RpZmllcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGNvbXBvbmVudCdzIHJlbmRlciByb290XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSByZW5kZXIgcm9vdCBpcyB3aGVyZSB0aGUge0BsaW5rIHJlbmRlcn0gbWV0aG9kIHdpbGwgYXR0YWNoIGl0cyBET00gb3V0cHV0LiBXaGVuIHVzaW5nIHRoZSBjb21wb25lbnRcbiAgICAgKiB3aXRoIHNoYWRvdyBtb2RlLCBpdCB3aWxsIGJlIGEge0BsaW5rIFNoYWRvd1Jvb3R9LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGl0c2VsZi5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY3JlYXRlUmVuZGVyUm9vdCAoKTogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zaGFkb3dcbiAgICAgICAgICAgID8gdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSlcbiAgICAgICAgICAgIDogdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBjb21wb25lbnQncyBzdHlsZXMgdG8gaXRzIHtAbGluayByZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH0gaW5zdGFuY2Ugd2lsbCBiZSBhZG9wdGVkXG4gICAgICogYnkgdGhlIHtAbGluayBTaGFkb3dSb290fS4gSWYgbm90LCBhIHN0eWxlIGVsZW1lbnQgaXMgY3JlYXRlZCBhbmQgYXR0YWNoZWQgdG8gdGhlIHtAbGluayBTaGFkb3dSb290fS4gSWYgdGhlXG4gICAgICogY29tcG9uZW50IGlzIG5vdCB1c2luZyBzaGFkb3cgbW9kZSwgYSBzY3JpcHQgdGFnIHdpbGwgYmUgYXBwZW5kZWQgdG8gdGhlIGRvY3VtZW50J3MgYDxoZWFkPmAuIEZvciBtdWx0aXBsZVxuICAgICAqIGluc3RhbmNlcyBvZiB0aGUgc2FtZSBjb21wb25lbnQgb25seSBvbmUgc3R5bGVzaGVldCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc3R5bGUgKCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGxldCBzdHlsZVNoZWV0OiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIHdlIGludm9rZSB0aGUgZ2V0dGVyIGluIHRoZSBpZiBzdGF0ZW1lbnQgdG8gaGF2ZSB0aGUgZ2V0dGVyIGludm9rZWQgbGF6aWx5XG4gICAgICAgIC8vIHRoZSBnZXR0ZXJzIGZvciBzdHlsZVNoZWV0IGFuZCBzdHlsZUVsZW1lbnQgd2lsbCBjcmVhdGUgdGhlIGFjdHVhbCBzdHlsZVNoZWV0XG4gICAgICAgIC8vIGFuZCBzdHlsZUVsZW1lbnQgYW5kIGNhY2hlIHRoZW0gc3RhdGljYWxseSBhbmQgd2UgZG9uJ3Qgd2FudCB0byBjcmVhdGUgYm90aFxuICAgICAgICAvLyB3ZSBwcmVmZXIgdGhlIGNvbnN0cnVjdGFibGUgc3R5bGVTaGVldCBhbmQgZmFsbGJhY2sgdG8gdGhlIHN0eWxlIGVsZW1lbnRcbiAgICAgICAgaWYgKChzdHlsZVNoZWV0ID0gY29uc3RydWN0b3Iuc3R5bGVTaGVldCkpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIHBhcnQgb25jZSB3ZSBoYXZlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgKENocm9tZSA3MylcbiAgICAgICAgICAgIGlmICghY29uc3RydWN0b3Iuc2hhZG93KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMuaW5jbHVkZXMoc3R5bGVTaGVldCkpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW1xuICAgICAgICAgICAgICAgICAgICAuLi4oZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVTaGVldFxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgd29yayBvbmNlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJyaXZlXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9jb25zdHJ1Y3Qtc3R5bGVzaGVldHMvXG4gICAgICAgICAgICAgICAgKHRoaXMucmVuZGVyUm9vdCBhcyBTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMgPSBbc3R5bGVTaGVldF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmICgoc3R5bGVFbGVtZW50ID0gY29uc3RydWN0b3Iuc3R5bGVFbGVtZW50KSkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB0ZXN0IHdlIGRvbid0IGR1cGxpY2F0ZSBzdHlsZXNoZWV0cyBmb3Igbm9uLXNoYWRvdyBlbGVtZW50c1xuICAgICAgICAgICAgY29uc3Qgc3R5bGVBbHJlYWR5QWRkZWQgPSBjb25zdHJ1Y3Rvci5zaGFkb3dcbiAgICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICAgICAgOiBBcnJheS5mcm9tKGRvY3VtZW50LnN0eWxlU2hlZXRzKS5maW5kKHN0eWxlID0+IHN0eWxlLnRpdGxlID09PSBjb25zdHJ1Y3Rvci5zZWxlY3RvcikgJiYgdHJ1ZSB8fCBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHN0eWxlQWxyZWFkeUFkZGVkKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIGNsb25lIHRoZSBjYWNoZWQgc3R5bGUgZWxlbWVudFxuICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSBzdHlsZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29uc3RydWN0b3Iuc2hhZG93KSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb3QuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGlzIGRlZmluZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSB0aGlzXG4gICAgICogbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCB0aGUgYXR0cmlidXRlIHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0QXR0cmlidXRlIChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlEZWNsYXJhdGlvbi5jb252ZXJ0ZXIuZnJvbUF0dHJpYnV0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlKTtcblxuICAgICAgICB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdID0gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgZm9yIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBhIGRlY2xhcmF0aW9uXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBpZiB0aGUgZGVmYXVsdCByZWZsZWN0b3IgaXMgdXNlZCwgd2UgbmVlZCB0byBjaGVjayBpZiBhbiBhdHRyaWJ1dGUgZm9yIHRoaXMgcHJvcGVydHkgZXhpc3RzXG4gICAgICAgIC8vIGlmIG5vdCwgd2Ugd29uJ3QgcmVmbGVjdFxuICAgICAgICBpZiAoIXByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSwgaXQncyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gcHJvcGVydHlEZWNsYXJhdGlvbi5hdHRyaWJ1dGUgYXMgc3RyaW5nO1xuXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLnRvQXR0cmlidXRlLmNhbGwodGhpcywgbmV3VmFsdWUpO1xuXG4gICAgICAgIC8vIHVuZGVmaW5lZCBtZWFucyBkb24ndCBjaGFuZ2VcbiAgICAgICAgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIG51bGwgbWVhbnMgcmVtb3ZlIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgZWxzZSBpZiAoYXR0cmlidXRlVmFsdWUgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VFdmVudH1cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ub3RpZnlQcm9wZXJ0eTxUID0gYW55PiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogVCwgbmV3VmFsdWU6IFQpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoKG5ldyBQcm9wZXJ0eUNoYW5nZUV2ZW50KHByb3BlcnR5S2V5LCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICBwcm9wZXJ0eTogcHJvcGVydHlLZXkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIHByZXZpb3VzOiBvbGRWYWx1ZSxcbiAgICAgICAgICAgIGN1cnJlbnQ6IG5ld1ZhbHVlLFxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSB7QGxpbmsgTGlmZWN5Y2xlRXZlbnR9XG4gICAgICpcbiAgICAgKiBAcGFyYW0gbGlmZWN5Y2xlIFRoZSBsaWZlY3ljbGUgZm9yIHdoaWNoIHRvIHJhaXNlIHRoZSBldmVudCAod2lsbCBiZSB0aGUgZXZlbnQgbmFtZSlcbiAgICAgKiBAcGFyYW0gZGV0YWlsICAgIE9wdGlvbmFsIGV2ZW50IGRldGFpbHNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5TGlmZWN5Y2xlIChsaWZlY3ljbGU6ICdhZG9wdGVkJyB8ICdjb25uZWN0ZWQnIHwgJ2Rpc2Nvbm5lY3RlZCcgfCAndXBkYXRlJywgZGV0YWlsOiBvYmplY3QgPSB7fSkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2gobmV3IExpZmVjeWNsZUV2ZW50KGxpZmVjeWNsZSwge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgLi4uZGV0YWlsLFxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2xpc3RlbiAoKSB7XG5cbiAgICAgICAgKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkubGlzdGVuZXJzLmZvckVhY2goKGRlY2xhcmF0aW9uLCBsaXN0ZW5lcikgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZURlY2xhcmF0aW9uOiBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb3B5IHRoZSBjbGFzcydzIHN0YXRpYyBsaXN0ZW5lciBkZWNsYXJhdGlvbiBpbnRvIGFuIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGRlY2xhcmF0aW9uLmV2ZW50LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGRlY2xhcmF0aW9uLm9wdGlvbnMsXG5cbiAgICAgICAgICAgICAgICAvLyBiaW5kIHRoZSBjb21wb25lbnRzIGxpc3RlbmVyIG1ldGhvZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICBsaXN0ZW5lcjogKHRoaXNbbGlzdGVuZXIgYXMga2V5b2YgdGhpc10gYXMgdW5rbm93biBhcyBFdmVudExpc3RlbmVyKS5iaW5kKHRoaXMpLFxuXG4gICAgICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBldmVudCB0YXJnZXQgYW5kIHN0b3JlIGl0IGluIHRoZSBpbnN0YW5jZSBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIHRhcmdldDogKCh0eXBlb2YgZGVjbGFyYXRpb24udGFyZ2V0ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICA/IGRlY2xhcmF0aW9uLnRhcmdldC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIDogZGVjbGFyYXRpb24udGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICB8fCB0aGlzLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gYWRkIHRoZSBib3VuZCBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24uZXZlbnQhLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi5vcHRpb25zKTtcblxuICAgICAgICAgICAgLy8gc2F2ZSB0aGUgaW5zdGFuY2UgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW4gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJEZWNsYXJhdGlvbnMucHVzaChpbnN0YW5jZURlY2xhcmF0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGNvbXBvbmVudCBsaXN0ZW5lcnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdW5saXN0ZW4gKCkge1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2xhcmF0aW9uKSA9PiB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLmV2ZW50ISxcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5saXN0ZW5lcixcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUXVlcnkgY29tcG9uZW50IHNlbGVjdG9yc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3QgKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnNlbGVjdG9ycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgcHJvcGVydHkpID0+IHtcblxuICAgICAgICAgICAgY29uc3Qgcm9vdCA9ICgodHlwZW9mIGRlY2xhcmF0aW9uLnJvb3QgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgPyBkZWNsYXJhdGlvbi5yb290LmNhbGwodGhpcylcbiAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnJvb3QpXG4gICAgICAgICAgICAgICAgfHwgdGhpcy5yZW5kZXJSb290O1xuXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZGVjbGFyYXRpb24uYWxsXG4gICAgICAgICAgICAgICAgPyByb290LnF1ZXJ5U2VsZWN0b3JBbGwoZGVjbGFyYXRpb24ucXVlcnkhKVxuICAgICAgICAgICAgICAgIDogcm9vdC5xdWVyeVNlbGVjdG9yKGRlY2xhcmF0aW9uLnF1ZXJ5ISk7XG5cbiAgICAgICAgICAgIHRoaXNbcHJvcGVydHkgYXMga2V5b2YgdGhpc10gPSBlbGVtZW50IGFzIGFueTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgY29tcG9uZW50IHNlbGVjdG9yIHJlZmVyZW5jZXNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdW5zZWxlY3QgKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnNlbGVjdG9ycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgcHJvcGVydHkpID0+IHtcblxuICAgICAgICAgICAgdGhpc1twcm9wZXJ0eSBhcyBrZXlvZiB0aGlzXSA9IHVuZGVmaW5lZCBhcyBhbnk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJldmlldyBfZW5xdWV1ZVVwZGF0ZSBtZXRob2RcbiAgICAvLyBhd2FpdCBwcmV2aW91c1VwZGF0ZSBpcyBhbHJlYWR5IGRlZmVycmluZyBldmVyeXRoaW5nIHRvIG5leHQgbWljcm8gdGFza1xuICAgIC8vIHRoZW4gd2UgYXdhaXQgdXBkYXRlIC0gZXhjZXB0IGZvciBmaXJzdCB0aW1lLi4uXG4gICAgLy8gd2UgbmV2ZXIgZW5xdWV1ZSB3aGVuIF9oYXNSZXF1ZXN0ZWRVcGRhdGUgaXMgdHJ1ZSBhbmQgd2Ugb25seSBzZXQgaXQgdG8gZmFsc2VcbiAgICAvLyBhZnRlciB0aGUgbmV3IHJlcXVlc3QgcmVzb2x2ZWRcbiAgICAvKipcbiAgICAgKiBFbnF1ZXVlIGEgcmVxdWVzdCBmb3IgYW4gYXN5bmNocm9ub3VzIHVwZGF0ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9lbnF1ZXVlVXBkYXRlICgpIHtcblxuICAgICAgICBsZXQgcmVzb2x2ZTogKHJlc3VsdDogYm9vbGVhbikgPT4gdm9pZDtcblxuICAgICAgICBjb25zdCBwcmV2aW91c1JlcXVlc3QgPSB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuXG4gICAgICAgIC8vIG1hcmsgdGhlIGNvbXBvbmVudCBhcyBoYXZpbmcgcmVxdWVzdGVkIGFuIHVwZGF0ZSwgdGhlIHtAbGluayBfcmVxdWVzdFVwZGF0ZX1cbiAgICAgICAgLy8gbWV0aG9kIHdpbGwgbm90IGVucXVldWUgYSBmdXJ0aGVyIHJlcXVlc3QgZm9yIHVwZGF0ZSBpZiBvbmUgaXMgc2NoZWR1bGVkXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlUmVxdWVzdCA9IG5ldyBQcm9taXNlPGJvb2xlYW4+KHJlcyA9PiByZXNvbHZlID0gcmVzKTtcblxuICAgICAgICAvLyB3YWl0IGZvciB0aGUgcHJldmlvdXMgdXBkYXRlIHRvIHJlc29sdmVcbiAgICAgICAgLy8gYGF3YWl0YCBpcyBhc3luY2hyb25vdXMgYW5kIHdpbGwgcmV0dXJuIGV4ZWN1dGlvbiB0byB0aGUge0BsaW5rIHJlcXVlc3RVcGRhdGV9IG1ldGhvZFxuICAgICAgICAvLyBhbmQgZXNzZW50aWFsbHkgYWxsb3dzIHVzIHRvIGJhdGNoIG11bHRpcGxlIHN5bmNocm9ub3VzIHByb3BlcnR5IGNoYW5nZXMsIGJlZm9yZSB0aGVcbiAgICAgICAgLy8gZXhlY3V0aW9uIGNhbiByZXN1bWUgaGVyZVxuICAgICAgICBhd2FpdCBwcmV2aW91c1JlcXVlc3Q7XG5cbiAgICAgICAgLy8gYXNrIHRoZSBzY2hlZHVsZXIgZm9yIGEgbmV3IHVwZGF0ZVxuICAgICAgICBjb25zdCB1cGRhdGUgPSB0aGlzLl9zY2hlZHVsZVVwZGF0ZSgpO1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdXBkYXRlIG1heSBiZSBzY2hlZHVsZWQgYXN5bmNocm9ub3VzbHkgYXMgd2VsbCwgaW4gd2hpY2ggY2FzZSB3ZSB3YWl0IGZvciBpdFxuICAgICAgICBpZiAodXBkYXRlKSBhd2FpdCB1cGRhdGU7XG5cbiAgICAgICAgLy8gbWFyayBjb21wb25lbnQgYXMgdXBkYXRlZCAqYWZ0ZXIqIHRoZSB1cGRhdGUgdG8gcHJldmVudCBpbmZpbnRlIGxvb3BzIGluIHRoZSB1cGRhdGUgcHJvY2Vzc1xuICAgICAgICAvLyBOLkIuOiBhbnkgcHJvcGVydHkgY2hhbmdlcyBkdXJpbmcgdGhlIHVwZGF0ZSB3aWxsIG5vdCB0cmlnZ2VyIGFub3RoZXIgdXBkYXRlXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIG5ldyB7QGxpbmsgX3VwZGF0ZVJlcXVlc3R9IGFmdGVyIHRoZSByZXN1bHQgb2YgdGhlIGN1cnJlbnQgdXBkYXRlIHJlc29sdmVzXG4gICAgICAgIHJlc29sdmUhKCF0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNjaGVkdWxlIHRoZSB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTY2hlZHVsZXMgdGhlIGZpcnN0IHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50IGFzIHNvb24gYXMgcG9zc2libGUgYW5kIGFsbCBjb25zZWN1dGl2ZSB1cGRhdGVzXG4gICAgICoganVzdCBiZWZvcmUgdGhlIG5leHQgZnJhbWUuIEluIHRoZSBsYXR0ZXIgY2FzZSBpdCByZXR1cm5zIGEgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIGFmdGVyXG4gICAgICogdGhlIHVwZGF0ZSBpcyBkb25lLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zY2hlZHVsZVVwZGF0ZSAoKTogUHJvbWlzZTx2b2lkPiB8IHZvaWQge1xuXG4gICAgICAgIGlmICghdGhpcy5faGFzVXBkYXRlZCkge1xuXG4gICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gc2NoZWR1bGUgdGhlIHVwZGF0ZSB2aWEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHRvIGF2b2lkIG11bHRpcGxlIHJlZHJhd3MgcGVyIGZyYW1lXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSB0aGUgY29tcG9uZW50IHVwZGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJbnZva2VzIHtAbGluayB1cGRhdGVDYWxsYmFja30gYWZ0ZXIgcGVyZm9ybWluZyB0aGUgdXBkYXRlIGFuZCBjbGVhbnMgdXAgdGhlIGNvbXBvbmVudFxuICAgICAqIHN0YXRlLiBEdXJpbmcgdGhlIGZpcnN0IHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlcyB3aWxsIGJlIGFkZGVkLiBEaXNwYXRjaGVzIHRoZSB1cGRhdGVcbiAgICAgKiBsaWZlY3ljbGUgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3BlcmZvcm1VcGRhdGUgKCkge1xuXG4gICAgICAgIC8vIHdlIGhhdmUgdG8gd2FpdCB1bnRpbCB0aGUgY29tcG9uZW50IGlzIGNvbm5lY3RlZCBiZWZvcmUgd2UgY2FuIGRvIGFueSB1cGRhdGVzXG4gICAgICAgIC8vIHRoZSB7QGxpbmsgY29ubmVjdGVkQ2FsbGJhY2t9IHdpbGwgY2FsbCB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gaW4gYW55IGNhc2UsIHNvIHdlIGNhblxuICAgICAgICAvLyBzaW1wbHkgYnlwYXNzIGFueSBhY3R1YWwgdXBkYXRlIGFuZCBjbGVhbi11cCB1bnRpbCB0aGVuXG4gICAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZXMgPSBuZXcgTWFwKHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIGNvbnN0IHJlZmxlY3Rpb25zID0gbmV3IE1hcCh0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcyk7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25zID0gbmV3IE1hcCh0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgLy8gcGFzcyBhIGNvcHkgb2YgdGhlIHByb3BlcnR5IGNoYW5nZXMgdG8gdGhlIHVwZGF0ZSBtZXRob2QsIHNvIHByb3BlcnR5IGNoYW5nZXNcbiAgICAgICAgICAgIC8vIGFyZSBhdmFpbGFibGUgaW4gYW4gb3ZlcnJpZGRlbiB1cGRhdGUgbWV0aG9kXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShjaGFuZ2VzLCByZWZsZWN0aW9ucywgbm90aWZpY2F0aW9ucywgIXRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgICAgICAvLyByZXNldCBwcm9wZXJ0eSBtYXBzIGRpcmVjdGx5IGFmdGVyIHRoZSB1cGRhdGUsIHNvIGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGVDYWxsYmFja1xuICAgICAgICAgICAgLy8gY2FuIGJlIHJlY29yZGVkIGZvciB0aGUgbmV4dCB1cGRhdGUsIHdoaWNoIGhhcyB0byBiZSB0cmlnZ2VyZWQgbWFudWFsbHkgdGhvdWdoXG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soY2hhbmdlcywgIXRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ3VwZGF0ZScsIHsgY2hhbmdlczogY2hhbmdlcywgZmlyc3RVcGRhdGU6ICF0aGlzLl9oYXNVcGRhdGVkIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qKlxuICogQSBzaW1wbGUgY3NzIHRlbXBsYXRlIGxpdGVyYWwgdGFnXG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSB0YWcgaXRzZWxmIGRvZXNuJ3QgZG8gYW55dGhpbmcgdGhhdCBhbiB1bnRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFsIHdvdWxkbid0IGRvLCBidXQgaXQgY2FuIGJlIHVzZWQgYnlcbiAqIGVkaXRvciBwbHVnaW5zIHRvIGluZmVyIHRoZSBcInZpcnR1YWwgZG9jdW1lbnQgdHlwZVwiIHRvIHByb3ZpZGUgY29kZSBjb21wbGV0aW9uIGFuZCBoaWdobGlnaHRpbmcuIEl0IGNvdWxkXG4gKiBhbHNvIGJlIHVzZWQgaW4gdGhlIGZ1dHVyZSB0byBtb3JlIHNlY3VyZWx5IGNvbnZlcnQgc3Vic3RpdHV0aW9ucyBpbnRvIHN0cmluZ3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuICpcbiAqIGNvbnN0IG1peGluQm94ID0gKGJvcmRlcldpZHRoOiBzdHJpbmcgPSAnMXB4JywgYm9yZGVyQ29sb3I6IHN0cmluZyA9ICdzaWx2ZXInKSA9PiBjc3NgXG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogICBib3JkZXI6ICR7Ym9yZGVyV2lkdGh9IHNvbGlkICR7Ym9yZGVyQ29sb3J9O1xuICogYDtcbiAqXG4gKiBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2BcbiAqICR7IHNlbGVjdG9yIH06aG92ZXIge1xuICogICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKiBgO1xuICpcbiAqIGNvbnN0IHN0eWxlcyA9IGNzc2BcbiAqIDpob3N0IHtcbiAqICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbiAqICAgZGlzcGxheTogYmxvY2s7XG4gKiAgICR7IG1peGluQm94KCkgfVxuICogfVxuICogJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG4gKiA6OnNsb3R0ZWQoKikge1xuICogICBtYXJnaW46IDA7XG4gKiB9XG4gKiBgO1xuICpcbiAqIC8vIHdpbGwgcHJvZHVjZS4uLlxuICogOmhvc3Qge1xuICogLS1ob3Zlci1jb2xvcjogZ3JlZW47XG4gKiBkaXNwbGF5OiBibG9jaztcbiAqXG4gKiBkaXNwbGF5OiBibG9jaztcbiAqIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gKiBib3JkZXI6IDFweCBzb2xpZCBzaWx2ZXI7XG4gKlxuICogfVxuICpcbiAqIDpob3N0OmhvdmVyIHtcbiAqIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbiAqIH1cbiAqXG4gKiA6OnNsb3R0ZWQoKikge1xuICogbWFyZ2luOiAwO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBjc3MgPSAobGl0ZXJhbHM6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5zdWJzdGl0dXRpb25zOiBhbnlbXSkgPT4ge1xuXG4gICAgcmV0dXJuIHN1YnN0aXR1dGlvbnMucmVkdWNlKChwcmV2OiBzdHJpbmcsIGN1cnI6IGFueSwgaTogbnVtYmVyKSA9PiBwcmV2ICsgY3VyciArIGxpdGVyYWxzW2kgKyAxXSwgbGl0ZXJhbHNbMF0pO1xufTtcblxuLy8gY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuXG4vLyBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuLy8gICBkaXNwbGF5OiBibG9jaztcbi8vICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbi8vICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbi8vIGA7XG5cbi8vIGNvbnN0IG1peGluSG92ZXIgPSAoc2VsZWN0b3I6IHN0cmluZykgPT4gY3NzYFxuLy8gJHsgc2VsZWN0b3IgfTpob3ZlciB7XG4vLyAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnN0IHN0eWxlcyA9IGNzc2Bcbi8vIDpob3N0IHtcbi8vICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgICR7IG1peGluQm94KCkgfVxuLy8gfVxuXG4vLyAkeyBtaXhpbkhvdmVyKCc6aG9zdCcpIH1cblxuLy8gOjpzbG90dGVkKCopIHtcbi8vICAgbWFyZ2luOiAwO1xuLy8gfVxuLy8gYDtcblxuLy8gY29uc29sZS5sb2coc3R5bGVzKTtcbiIsImV4cG9ydCBjb25zdCBBcnJvd1VwID0gJ0Fycm93VXAnO1xuZXhwb3J0IGNvbnN0IEFycm93RG93biA9ICdBcnJvd0Rvd24nO1xuZXhwb3J0IGNvbnN0IEFycm93TGVmdCA9ICdBcnJvd0xlZnQnO1xuZXhwb3J0IGNvbnN0IEFycm93UmlnaHQgPSAnQXJyb3dSaWdodCc7XG5leHBvcnQgY29uc3QgRW50ZXIgPSAnRW50ZXInO1xuZXhwb3J0IGNvbnN0IEVzY2FwZSA9ICdFc2NhcGUnO1xuZXhwb3J0IGNvbnN0IFNwYWNlID0gJyAnO1xuZXhwb3J0IGNvbnN0IFRhYiA9ICdUYWInO1xuZXhwb3J0IGNvbnN0IEJhY2tzcGFjZSA9ICdCYWNrc3BhY2UnO1xuZXhwb3J0IGNvbnN0IEFsdCA9ICdBbHQnO1xuZXhwb3J0IGNvbnN0IFNoaWZ0ID0gJ1NoaWZ0JztcbmV4cG9ydCBjb25zdCBDb250cm9sID0gJ0NvbnRyb2wnO1xuZXhwb3J0IGNvbnN0IE1ldGEgPSAnTWV0YSc7XG4iLCJpbXBvcnQgeyBBcnJvd0Rvd24sIEFycm93TGVmdCwgQXJyb3dSaWdodCwgQXJyb3dVcCB9IGZyb20gJy4va2V5cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2ZUl0ZW1DaGFuZ2U8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEN1c3RvbUV2ZW50IHtcbiAgICB0eXBlOiAnYWN0aXZlLWl0ZW0tY2hhbmdlJztcbiAgICBkZXRhaWw6IHtcbiAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgIGluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpdGVtOiBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudHlwZSBMaXN0RW50cnk8VCBleHRlbmRzIExpc3RJdGVtPiA9IFtudW1iZXIgfCB1bmRlZmluZWQsIFQgfCB1bmRlZmluZWRdO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTGlzdEtleU1hbmFnZXI8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZUl0ZW06IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgbGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBpdGVtVHlwZTogYW55O1xuXG4gICAgcHVibGljIGl0ZW1zOiBUW107XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHB1YmxpYyBob3N0OiBIVE1MRWxlbWVudCxcbiAgICAgICAgaXRlbXM6IE5vZGVMaXN0T2Y8VD4sXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gQXJyYXkuZnJvbShpdGVtcyk7XG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSB0aGlzLml0ZW1zWzBdICYmIHRoaXMuaXRlbXNbMF0uY29uc3RydWN0b3I7XG5cbiAgICAgICAgdGhpcy5iaW5kSG9zdCgpO1xuICAgIH1cblxuICAgIGdldEFjdGl2ZUl0ZW0gKCk6IFQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUl0ZW07XG4gICAgfTtcblxuICAgIHNldEFjdGl2ZUl0ZW0gKGl0ZW06IFQsIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgY29uc3QgZW50cnk6IExpc3RFbnRyeTxUPiA9IFtcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpdGVtIDogdW5kZWZpbmVkXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldE5leHRJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldE5leHRFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0UHJldmlvdXNJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldFByZXZpb3VzRW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldEZpcnN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRGaXJzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRMYXN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRMYXN0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgW3ByZXYsIG5leHRdID0gKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gW0Fycm93TGVmdCwgQXJyb3dSaWdodF0gOiBbQXJyb3dVcCwgQXJyb3dEb3duXTtcbiAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIHByZXY6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBuZXh0OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXROZXh0SXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZWRvd24gKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVGb2N1cyAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zdCB0YXJnZXQ6IFQgfCBudWxsID0gZXZlbnQudGFyZ2V0IGFzIFQgfCBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLml0ZW1UeXBlICYmIHRhcmdldCBpbnN0YW5jZW9mIHRoaXMuaXRlbVR5cGUgJiYgIXRhcmdldCEuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldCBhcyBULCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UgKHByZXZpb3VzSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50OiBBY3RpdmVJdGVtQ2hhbmdlPFQ+ID0gbmV3IEN1c3RvbUV2ZW50KCdhY3RpdmUtaXRlbS1jaGFuZ2UnLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHByZXZpb3VzSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06ICh0eXBlb2YgcHJldmlvdXNJbmRleCA9PT0gJ251bWJlcicpID8gdGhpcy5pdGVtc1twcmV2aW91c0luZGV4XSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgICAgICAgICBpbmRleDogdGhpcy5hY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogdGhpcy5hY3RpdmVJdGVtXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSBhcyBBY3RpdmVJdGVtQ2hhbmdlPFQ+O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV0gPSBlbnRyeTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TmV4dEVudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAtMTtcblxuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBuZXh0SW5kZXggPSBmcm9tSW5kZXggKyAxO1xuICAgICAgICBsZXQgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zW25leHRJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKG5leHRJbmRleCA8IGxhc3RJbmRleCAmJiBuZXh0SXRlbSAmJiBuZXh0SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBuZXh0SXRlbSA9IHRoaXMuaXRlbXNbKytuZXh0SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChuZXh0SXRlbSAmJiAhbmV4dEl0ZW0uZGlzYWJsZWQpID8gW25leHRJbmRleCwgbmV4dEl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFByZXZpb3VzRW50cnkgKGZyb21JbmRleD86IG51bWJlcik6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgZnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgPyBmcm9tSW5kZXhcbiAgICAgICAgICAgIDogKHR5cGVvZiB0aGlzLmFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlSW5kZXhcbiAgICAgICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgbGV0IHByZXZJbmRleCA9IGZyb21JbmRleCAtIDE7XG4gICAgICAgIGxldCBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbcHJldkluZGV4XTtcblxuICAgICAgICB3aGlsZSAocHJldkluZGV4ID4gMCAmJiBwcmV2SXRlbSAmJiBwcmV2SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbLS1wcmV2SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChwcmV2SXRlbSAmJiAhcHJldkl0ZW0uZGlzYWJsZWQpID8gW3ByZXZJbmRleCwgcHJldkl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEZpcnN0RW50cnkgKCk6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEVudHJ5KC0xKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TGFzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFByZXZpb3VzRW50cnkodGhpcy5pdGVtcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBiaW5kSG9zdCAoKSB7XG5cbiAgICAgICAgLy8gVE9ETzogZW5hYmxlIHJlY29ubmVjdGluZyB0aGUgaG9zdCBlbGVtZW50PyBubyBuZWVkIGlmIEZvY3VzTWFuYWdlciBpcyBjcmVhdGVkIGluIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IE1hcChbXG4gICAgICAgICAgICBbJ2ZvY3VzaW4nLCB0aGlzLmhhbmRsZUZvY3VzLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnZGlzY29ubmVjdGVkJywgdGhpcy51bmJpbmRIb3N0LmJpbmQodGhpcyldXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVuYmluZEhvc3QgKCkge1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9jdXNLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBMaXN0S2V5TWFuYWdlcjxUPiB7XG5cbiAgICBwcm90ZWN0ZWQgc2V0RW50cnlBY3RpdmUgKGVudHJ5OiBMaXN0RW50cnk8VD4sIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBzdXBlci5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW0gJiYgaW50ZXJhY3RpdmUpIHRoaXMuYWN0aXZlSXRlbS5mb2N1cygpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQ8SWNvbj4oe1xuICAgIHNlbGVjdG9yOiAndWktaWNvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgIHdpZHRoOiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSk7XG4gICAgICAgIHBhZGRpbmc6IGNhbGMoKHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSkgLSB2YXIoLS1mb250LXNpemUsIDFlbSkpIC8gMik7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgICAgICBmb250LXNpemU6IGluaGVyaXQ7XG4gICAgICAgIHZlcnRpY2FsLWFsaWduOiBib3R0b207XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgfVxuICAgIHN2ZyB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgICAgICBmb250LXNpemU6IGluaGVyaXQ7XG4gICAgICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICAgICAgICBmaWxsOiB2YXIoLS1pY29uLWNvbG9yLCBjdXJyZW50Q29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9dW5pXSkge1xuICAgICAgICBwYWRkaW5nOiAwZW07XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD1tYXRdKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD1laV0pIHtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IChlbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNldCA9IGVsZW1lbnQuc2V0O1xuICAgICAgICBjb25zdCBpY29uID0gKHNldCA9PT0gJ21hdCcpXG4gICAgICAgICAgICA/IGBpY18keyBlbGVtZW50Lmljb24gfV8yNHB4YFxuICAgICAgICAgICAgOiAoc2V0ID09PSAnZWknKVxuICAgICAgICAgICAgICAgID8gYGVpLSR7IGVsZW1lbnQuaWNvbiB9LWljb25gXG4gICAgICAgICAgICAgICAgOiBlbGVtZW50Lmljb247XG5cbiAgICAgICAgcmV0dXJuIGh0bWxgXG4gICAgICAgIDxzdmcgZm9jdXNhYmxlPVwiZmFsc2VcIj5cbiAgICAgICAgICAgIDx1c2UgaHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiXG4gICAgICAgICAgICB4bGluazpocmVmPVwiJHsgKGVsZW1lbnQuY29uc3RydWN0b3IgYXMgdHlwZW9mIEljb24pLmdldFNwcml0ZShzZXQpIH0jJHsgaWNvbiB9XCIgLz5cbiAgICAgICAgPC9zdmc+YDtcbiAgICB9XG59KVxuZXhwb3J0IGNsYXNzIEljb24gZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgZm9yIGNhY2hpbmcgYW4gaWNvbiBzZXQncyBzcHJpdGUgdXJsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfc3ByaXRlczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgc3ZnIHNwcml0ZSB1cmwgZm9yIHRoZSByZXF1ZXN0ZWQgaWNvbiBzZXRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNwcml0ZSB1cmwgZm9yIGFuIGljb24gc2V0IGNhbiBiZSBzZXQgdGhyb3VnaCBhIGBtZXRhYCB0YWcgaW4gdGhlIGh0bWwgZG9jdW1lbnQuIFlvdSBjYW4gZGVmaW5lXG4gICAgICogY3VzdG9tIGljb24gc2V0cyBieSBjaG9zaW5nIGFuIGlkZW50aWZpZXIgKHN1Y2ggYXMgYDpteXNldGAgaW5zdGVhZCBvZiBgOmZhYCwgYDptYXRgIG9yIGA6aWVgKSBhbmRcbiAgICAgKiBjb25maWd1cmluZyBpdHMgbG9jYXRpb24uXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCFkb2N0eXBlIGh0bWw+XG4gICAgICogPGh0bWw+XG4gICAgICogICAgPGhlYWQ+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBtdWx0aXBsZSBzdmcgc3ByaXRlcyAtLT5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOmZhXCIgY29udGVudD1cImFzc2V0cy9pY29ucy9zcHJpdGVzL2ZvbnQtYXdlc29tZS9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOm1hdFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9tYXRlcmlhbC9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOmVpXCIgY29udGVudD1cImFzc2V0cy9pY29uL3Nwcml0ZXMvZXZpbC1pY29ucy9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8IS0tIHN1cHBvcnRzIGN1c3RvbSBzdmcgc3ByaXRlcyAtLT5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOm15c2V0XCIgY29udGVudD1cImFzc2V0cy9pY29uL3Nwcml0ZXMvbXlzZXQvbXlfc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPC9oZWFkPlxuICAgICAqICAgIC4uLlxuICAgICAqIDwvaHRtbD5cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIFdoZW4gdXNpbmcgdGhlIGljb24gZWxlbWVudCwgc3BlY2lmeSB5b3VyIGN1c3RvbSBpY29uIHNldC5cbiAgICAgKlxuICAgICAqIGBgYGh0bWxcbiAgICAgKiA8IS0tIHVzZSBhdHRyaWJ1dGVzIC0tPlxuICAgICAqIDx1aS1pY29uIGRhdGEtaWNvbj1cIm15X2ljb25faWRcIiBkYXRhLXNldD1cIm15c2V0XCI+PC91aS1pY29uPlxuICAgICAqIDwhLS0gb3IgdXNlIHByb3BlcnR5IGJpbmRpbmdzIHdpdGhpbiBsaXQtaHRtbCB0ZW1wbGF0ZXMgLS0+XG4gICAgICogPHVpLWljb24gLmljb249JHsnbXlfaWNvbl9pZCd9IC5zZXQ9JHsnbXlzZXQnfT48L3VpLWljb24+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBJZiBubyBzcHJpdGUgdXJsIGlzIHNwZWNpZmllZCBmb3IgYSBzZXQsIHRoZSBpY29uIGVsZW1lbnQgd2lsbCBhdHRlbXB0IHRvIHVzZSBhbiBzdmcgaWNvbiBmcm9tXG4gICAgICogYW4gaW5saW5lZCBzdmcgZWxlbWVudCBpbiB0aGUgY3VycmVudCBkb2N1bWVudC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIGdldFNwcml0ZSAoc2V0OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgICAgIGlmICghdGhpcy5fc3ByaXRlcy5oYXMoc2V0KSkge1xuXG4gICAgICAgICAgICBjb25zdCBtZXRhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWV0YVtuYW1lPVwidWktaWNvbjpzcHJpdGU6JHsgc2V0IH1cIl1bY29udGVudF1gKTtcblxuICAgICAgICAgICAgaWYgKG1ldGEpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZXMuc2V0KHNldCwgbWV0YS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKSEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nwcml0ZXMuZ2V0KHNldCkgfHwgJyc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnZGF0YS1pY29uJ1xuICAgIH0pXG4gICAgaWNvbiA9ICdpbmZvJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtc2V0J1xuICAgIH0pXG4gICAgc2V0ID0gJ2ZhJ1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnaW1nJyk7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCAnLi4vaWNvbi9pY29uJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4uL2tleXMnO1xuXG5AY29tcG9uZW50PEFjY29yZGlvbkhlYWRlcj4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLWhlYWRlcicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgYWxsOiBpbmhlcml0O1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgZmxleDogMSAxIDEwMCU7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZGlzYWJsZWQ9dHJ1ZV0pIHtcbiAgICAgICAgY3Vyc29yOiBkZWZhdWx0O1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1leHBhbmRlZD10cnVlXSkgPiB1aS1pY29uLmV4cGFuZCxcbiAgICA6aG9zdChbYXJpYS1leHBhbmRlZD1mYWxzZV0pID4gdWktaWNvbi5jb2xsYXBzZSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBlbGVtZW50ID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIDx1aS1pY29uIGNsYXNzPVwiY29sbGFwc2VcIiBkYXRhLWljb249XCJtaW51c1wiIGRhdGEtc2V0PVwidW5pXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC91aS1pY29uPlxuICAgIDx1aS1pY29uIGNsYXNzPVwiZXhwYW5kXCIgZGF0YS1pY29uPVwicGx1c1wiIGRhdGEtc2V0PVwidW5pXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC91aS1pY29uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uSGVhZGVyIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgZGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6IDA7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1leHBhbmRlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW5cbiAgICB9KVxuICAgIGV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXghOiBudW1iZXIgfCBudWxsO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ2J1dHRvbic7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBodG1sLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuZXhwb3J0IHR5cGUgQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKSA9PiBUZW1wbGF0ZVJlc3VsdDtcblxuZXhwb3J0IGNvbnN0IGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHQgPT4ge1xuXG4gICAgcmV0dXJuIGh0bWxgJmNvcHk7IENvcHlyaWdodCAkeyBkYXRlLmdldEZ1bGxZZWFyKCkgfSAkeyBhdXRob3IudHJpbSgpIH1gO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgY29weXJpZ2h0LCBDb3B5cmlnaHRIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2NvcHlyaWdodCc7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuXG5sZXQgbmV4dEFjY29yZGlvblBhbmVsSWQgPSAwO1xuXG5AY29tcG9uZW50PEFjY29yZGlvblBhbmVsPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY2NvcmRpb24tcGFuZWwnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1oZWFkZXIge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHkge1xuICAgICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICAgIG92ZXJmbG93OiBhdXRvO1xuICAgICAgICB0cmFuc2l0aW9uOiBoZWlnaHQgLjJzIGVhc2Utb3V0O1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24tYm9keVthcmlhLWhpZGRlbj10cnVlXSB7XG4gICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG4gICAgLmNvcHlyaWdodCB7XG4gICAgICAgIHBhZGRpbmc6IDAgMXJlbSAxcmVtO1xuICAgICAgICBjb2xvcjogdmFyKC0tZGlzYWJsZWQtY29sb3IsICcjY2NjJyk7XG4gICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IChwYW5lbCwgY29weXJpZ2h0OiBDb3B5cmlnaHRIZWxwZXIpID0+IGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cInVpLWFjY29yZGlvbi1oZWFkZXJcIlxuICAgICAgICByb2xlPVwiaGVhZGluZ1wiXG4gICAgICAgIGFyaWEtbGV2ZWw9XCIkeyBwYW5lbC5sZXZlbCB9XCJcbiAgICAgICAgQGNsaWNrPSR7IHBhbmVsLnRvZ2dsZSB9PlxuICAgICAgICA8c2xvdCBuYW1lPVwiaGVhZGVyXCI+PC9zbG90PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24tYm9keVwiXG4gICAgICAgIGlkPVwiJHsgcGFuZWwuaWQgfS1ib2R5XCJcbiAgICAgICAgc3R5bGU9XCJoZWlnaHQ6ICR7IHBhbmVsLmNvbnRlbnRIZWlnaHQgfTtcIlxuICAgICAgICByb2xlPVwicmVnaW9uXCJcbiAgICAgICAgYXJpYS1oaWRkZW49XCIkeyAhcGFuZWwuZXhwYW5kZWQgfVwiXG4gICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIiR7IHBhbmVsLmlkIH0taGVhZGVyXCI+XG4gICAgICAgIDxzbG90Pjwvc2xvdD5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3B5cmlnaHRcIj4keyBjb3B5cmlnaHQobmV3IERhdGUoKSwgJ0FsZXhhbmRlciBXZW5kZScpIH08L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25QYW5lbCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2hlYWRlcjogQWNjb3JkaW9uSGVhZGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIF9ib2R5OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJvdGVjdGVkIGdldCBjb250ZW50SGVpZ2h0ICgpOiBzdHJpbmcge1xuXG4gICAgICAgIHJldHVybiAhdGhpcy5leHBhbmRlZCA/XG4gICAgICAgICAgICAnMHB4JyA6XG4gICAgICAgICAgICB0aGlzLl9ib2R5ID9cbiAgICAgICAgICAgICAgICBgJHsgdGhpcy5fYm9keS5zY3JvbGxIZWlnaHQgfXB4YCA6XG4gICAgICAgICAgICAgICAgJ2F1dG8nO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICBsZXZlbCA9IDE7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvciAoKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBgdWktYWNjb3JkaW9uLXBhbmVsLSR7IG5leHRBY2NvcmRpb25QYW5lbElkKysgfWA7XG4gICAgfVxuXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdyYXBwaW5nIHRoZSBwcm9wZXJ0eSBjaGFuZ2UgaW4gdGhlIHdhdGNoIG1ldGhvZCB3aWxsIGRpc3BhdGNoIGEgcHJvcGVydHkgY2hhbmdlIGV2ZW50XG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5faGVhZGVyKSB0aGlzLl9oZWFkZXIuZXhwYW5kZWQgPSB0aGlzLmV4cGFuZGVkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnNldEhlYWRlcih0aGlzLnF1ZXJ5U2VsZWN0b3IoQWNjb3JkaW9uSGVhZGVyLnNlbGVjdG9yKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGluIHRoZSBmaXJzdCB1cGRhdGUsIHdlIHF1ZXJ5IHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keVxuICAgICAgICAgICAgdGhpcy5fYm9keSA9IHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKGAjJHsgdGhpcy5pZCB9LWJvZHlgKTtcblxuICAgICAgICAgICAgLy8gaGF2aW5nIHF1ZXJpZWQgdGhlIGFjY29yZGlvbi1wYW5lbC1ib2R5LCB7QGxpbmsgY29udGVudEhlaWdodH0gY2FuIG5vdyBjYWxjdWxhdGUgdGhlXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGhlaWdodCBvZiB0aGUgcGFuZWwgYm9keSBmb3IgYW5pbWF0aW9uXG4gICAgICAgICAgICAvLyBpbiBvcmRlciB0byByZS1ldmFsdWF0ZSB0aGUgdGVtcGxhdGUgYmluZGluZyBmb3Ige0BsaW5rIGNvbnRlbnRIZWlnaHR9IHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgYW5vdGhlciByZW5kZXIgKHRoaXMgaXMgY2hlYXAsIG9ubHkgY29udGVudEhlaWdodCBoYXMgY2hhbmdlZCBhbmQgd2lsbCBiZSB1cGRhdGVkKVxuICAgICAgICAgICAgLy8gaG93ZXZlciB3ZSBjYW5ub3QgcmVxdWVzdCBhbm90aGVyIHVwZGF0ZSB3aGlsZSB3ZSBhcmUgc3RpbGwgaW4gdGhlIGN1cnJlbnQgdXBkYXRlIGN5Y2xlXG4gICAgICAgICAgICAvLyB1c2luZyBhIFByb21pc2UsIHdlIGNhbiBkZWZlciByZXF1ZXN0aW5nIHRoZSB1cGRhdGUgdW50aWwgYWZ0ZXIgdGhlIGN1cnJlbnQgdXBkYXRlIGlzIGRvbmVcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSh0cnVlKS50aGVuKCgpID0+IHRoaXMucmVxdWVzdFVwZGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSByZW5kZXIgbWV0aG9kIHRvIGluamVjdCBjdXN0b20gaGVscGVycyBpbnRvIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW5kZXIgKCkge1xuXG4gICAgICAgIHN1cGVyLnJlbmRlcihjb3B5cmlnaHQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRIZWFkZXIgKGhlYWRlcjogQWNjb3JkaW9uSGVhZGVyIHwgbnVsbCkge1xuXG4gICAgICAgIHRoaXMuX2hlYWRlciA9IGhlYWRlcjtcblxuICAgICAgICBpZiAoIWhlYWRlcikgcmV0dXJuO1xuXG4gICAgICAgIGhlYWRlci5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnaGVhZGVyJyk7XG5cbiAgICAgICAgaGVhZGVyLmlkID0gaGVhZGVyLmlkIHx8IGAkeyB0aGlzLmlkIH0taGVhZGVyYDtcbiAgICAgICAgaGVhZGVyLmNvbnRyb2xzID0gYCR7IHRoaXMuaWQgfS1ib2R5YDtcbiAgICAgICAgaGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgaGVhZGVyLmRpc2FibGVkID0gdGhpcy5kaXNhYmxlZDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRm9jdXNLZXlNYW5hZ2VyIH0gZnJvbSAnLi4vbGlzdC1rZXktbWFuYWdlcic7XG5pbXBvcnQgJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8QWNjb3JkaW9uSGVhZGVyPjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICByb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAncHJlc2VudGF0aW9uJztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGNzcyB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBjc3NgXG5kZW1vLWFwcCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG5cbmhlYWRlciB7XG4gIGZsZXg6IDAgMCBhdXRvO1xufVxuXG5tYWluIHtcbiAgZmxleDogMSAxIGF1dG87XG4gIHBhZGRpbmc6IDFyZW07XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIG92ZXJmbG93OiBhdXRvO1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDE1cmVtLCAxZnIpKTtcbiAgZ3JpZC1nYXA6IDFyZW07XG59XG5cbi5pY29ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZmxvdzogcm93IHdyYXA7XG59XG5cbi5zZXR0aW5ncy1saXN0IHtcbiAgcGFkZGluZzogMDtcbiAgbGlzdC1zdHlsZTogbm9uZTtcbn1cblxuLnNldHRpbmdzLWxpc3QgbGkge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG5cbnVpLWNhcmQge1xuICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbn1cblxudWktYWNjb3JkaW9uIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbDpub3QoOmZpcnN0LWNoaWxkKSB7XG4gIGJvcmRlci10b3A6IHZhcigtLWJvcmRlci13aWR0aCkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIGgzIHtcbiAgbWFyZ2luOiAxcmVtO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWwgcCB7XG4gIG1hcmdpbjogMXJlbTtcbn1cbmA7XG4iLCJpbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSAnLi9hcHAnO1xuXG5leHBvcnQgY29uc3QgdGVtcGxhdGUgPSAoZWxlbWVudDogQXBwKSA9PiBodG1sYFxuICAgIDxoZWFkZXI+XG4gICAgICAgIDxoMT5FeGFtcGxlczwvaDE+XG4gICAgPC9oZWFkZXI+XG5cbiAgICA8bWFpbj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkljb248L2gyPlxuXG4gICAgICAgICAgICA8aDM+Rm9udCBBd2Vzb21lPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrLW9wZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYWludC1icnVzaCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbi10cmlhbmdsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8tY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncXVlc3Rpb24tY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+VW5pY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhbmdsZS1yaWdodC1iJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VubG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyLWNpcmNsZScgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+TWF0ZXJpYWwgSWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbl9yaWdodCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdtYWlsJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9ja19vcGVuJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2JydXNoJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VkaXQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZGVsZXRlJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3dhcm5pbmcnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaW5mbycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdoZWxwJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2FjY291bnRfY2lyY2xlJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlcnNvbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICdjbGVhcicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPkV2aWwgSWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbi1yaWdodCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VubG9jaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BhcGVyY2xpcCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbmNpbCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2V4Y2xhbWF0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncXVlc3Rpb24nIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICdjbG9zZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDI+Q2hlY2tib3g8L2gyPlxuICAgICAgICAgICAgPHVpLWNoZWNrYm94IC5jaGVja2VkPSR7IHRydWUgfT48L3VpLWNoZWNrYm94PlxuXG4gICAgICAgICAgICA8aDI+VG9nZ2xlPC9oMj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cInNldHRpbmdzLWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5LWVtYWlsXCI+Tm90aWZpY2F0aW9uIGVtYWlsPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktZW1haWxcIiBhcmlhLWNoZWNrZWQ9XCJ0cnVlXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5LXNtc1wiPk5vdGlmaWNhdGlvbiBzbXM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgbGFiZWwtb249XCJ5ZXNcIiBsYWJlbC1vZmY9XCJub1wiIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeS1zbXNcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cInNldHRpbmdzLWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5XCI+Tm90aWZpY2F0aW9uczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnlcIiBhcmlhLWNoZWNrZWQ9XCJ0cnVlXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+Q2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWZvb3RlclwiPkNhcmQgZm9vdGVyPC9wPlxuICAgICAgICAgICAgPC91aS1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+QWN0aW9uIENhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWFjdGlvbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+TW9yZTwvYnV0dG9uPlxuICAgICAgICAgICAgPC91aS1hY3Rpb24tY2FyZD5cblxuICAgICAgICAgICAgPGgyPlBsYWluIENhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLXBsYWluLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktcGxhaW4tY2FyZD5cblxuICAgICAgICAgICAgPGgyPlRhYnM8L2gyPlxuICAgICAgICAgICAgPHVpLXRhYi1saXN0PlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItMVwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtMVwiPjxzcGFuPkZpcnN0IFRhYjwvc3Bhbj48L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTJcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTJcIj5TZWNvbmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0zXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0zXCIgYXJpYS1kaXNhYmxlZD1cInRydWVcIj5UaGlyZCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTRcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTRcIj5Gb3VydGggVGFiPC91aS10YWI+XG4gICAgICAgICAgICA8L3VpLXRhYi1saXN0PlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0xXCI+XG4gICAgICAgICAgICAgICAgPGgzPkZpcnN0IFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTJcIj5cbiAgICAgICAgICAgICAgICA8aDM+U2Vjb25kIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLCBkdW9cbiAgICAgICAgICAgICAgICAgICAgYW5pbWFsIGFjY3VzYW11cyBldSwgY2libyBlcnJvcmlidXMgZXQgbWVhLiBFeCBlYW0gd2lzaSBhZG1vZHVtIHByYWVzZW50LCBoYXMgY3Ugb2JsaXF1ZSBjZXRlcm9zXG4gICAgICAgICAgICAgICAgICAgIGVsZWlmZW5kLiBFeCBtZWwgcGxhdG9uZW0gYXNzZW50aW9yIHBlcnNlcXVlcmlzLCB2aXggY2libyBsaWJyaXMgdXQuIEFkIHRpbWVhbSBhY2N1bXNhbiBlc3QsIGV0IGF1dGVtXG4gICAgICAgICAgICAgICAgICAgIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWkgbmFtLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0zXCI+XG4gICAgICAgICAgICAgICAgPGgzPlRoaXJkIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+SSdtIGRpc2FibGVkLCB5b3Ugc2hvdWxkbid0IHNlZSBtZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtNFwiPlxuICAgICAgICAgICAgICAgIDxoMz5Gb3VydGggVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC4gTGF1ZGVtXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm8gcmVjdXNhYm8gYW5cbiAgICAgICAgICAgICAgICAgICAgZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5BY2NvcmRpb248L2gyPlxuXG4gICAgICAgICAgICA8dWktYWNjb3JkaW9uPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBpZD1cImN1c3RvbS1wYW5lbC1pZFwiIGV4cGFuZGVkIGxldmVsPVwiM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24taGVhZGVyPlBhbmVsIE9uZTwvdWktYWNjb3JkaW9uLWhlYWRlcj5cblxuICAgICAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIExhdWRlbSBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN1c2FibyBhbiBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+QXQgdXN1IGVwaWN1cmVpIGFzc2VudGlvciwgcHV0ZW50IGRpc3NlbnRpZXQgcmVwdWRpYW5kYWUgZWEgcXVvLiBQcm8gbmUgZGViaXRpcyBwbGFjZXJhdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmlmZXJ1bXF1ZSwgaW4gc29uZXQgdm9sdW11cyBpbnRlcnByZXRhcmlzIGN1bS4gRG9sb3J1bSBhcHBldGVyZSBuZSBxdW8uIERpY3RhIHF1YWxpc3F1ZSBlb3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhLCBlYW0gYXQgbnVsbGEgdGFtcXVhbS5cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgPC91aS1hY2NvcmRpb24tcGFuZWw+XG5cbiAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLXBhbmVsIGxldmVsPVwiM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24taGVhZGVyPlBhbmVsIFR3bzwvdWktYWNjb3JkaW9uLWhlYWRlcj5cblxuICAgICAgICAgICAgICAgICAgICA8cD5JbiBjbGl0YSB0b2xsaXQgbWluaW11bSBxdW8sIGFuIGFjY3VzYXRhIHZvbHV0cGF0IGV1cmlwaWRpcyB2aW0uIEZlcnJpIHF1aWRhbSBkZWxlbml0aSBxdW8gZWEsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW8gYW5pbWFsIGFjY3VzYW11cyBldSwgY2libyBlcnJvcmlidXMgZXQgbWVhLiBFeCBlYW0gd2lzaSBhZG1vZHVtIHByYWVzZW50LCBoYXMgY3Ugb2JsaXF1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2V0ZXJvcyBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVzdCwgZXQgYXV0ZW0gb21uZXMgY2l2aWJ1cyBtZWwuIE1lbCBldSB1YmlxdWUgZXF1aWRlbSBtb2xlc3RpYWUsIGNob3JvIGRvY2VuZGkgbW9kZXJhdGl1cyBlaVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+UXVpIHN1YXMgc29sZXQgY2V0ZXJvcyBjdSwgcGVydGluYXggdnVscHV0YXRlIGRldGVycnVpc3NldCBlb3MgbmUuIE5lIGl1cyB2aWRlIG51bGxhbSwgYWxpZW51bVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaWxsYWUgcmVmb3JtaWRhbnMgY3VtIGFkLiBFYSBtZWxpb3JlIHNhcGllbnRlbSBpbnRlcnByZXRhcmlzIGVhbS4gQ29tbXVuZSBkZWxpY2F0YVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwdWRpYW5kYWUgaW4gZW9zLCBwbGFjZXJhdCBpbmNvcnJ1cHRlIGRlZmluaXRpb25lcyBuZWMgZXguIEN1IGVsaXRyIHRhbnRhcyBpbnN0cnVjdGlvciBzaXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldSBldW0gYWxpYSBncmFlY2UgbmVnbGVnZW50dXIuPC9wPlxuXG4gICAgICAgICAgICAgICAgPC91aS1hY2NvcmRpb24tcGFuZWw+XG5cbiAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uPlxuXG4gICAgICAgICAgICA8b3ZlcmxheS1kZW1vPjwvb3ZlcmxheS1kZW1vPlxuXG4gICAgICAgICAgICA8ZXZlbnQtb3JkZXItZGVtbz48L2V2ZW50LW9yZGVyLWRlbW8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgPC9tYWluPlxuICAgIGA7XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuLy8gd2UgY2FuIGRlZmluZSBtaXhpbnMgYXNcbmNvbnN0IG1peGluQ29udGFpbmVyOiAoYmFja2dyb3VuZD86IHN0cmluZykgPT4gc3RyaW5nID0gKGJhY2tncm91bmQ6IHN0cmluZyA9ICcjZmZmJykgPT4gY3NzYFxuICAgIGJhY2tncm91bmQ6ICR7IGJhY2tncm91bmQgfTtcbiAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbmA7XG5cbmNvbnN0IHN0eWxlID0gY3NzYFxuOmhvc3Qge1xuICAgIC0tbWF4LXdpZHRoOiA0MGNoO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1mbG93OiBjb2x1bW47XG4gICAgbWF4LXdpZHRoOiB2YXIoLS1tYXgtd2lkdGgpO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgLyogd2UgY2FuIGFwcGx5IG1peGlucyB3aXRoIHNwcmVhZCBzeW50YXggKi9cbiAgICAkeyBtaXhpbkNvbnRhaW5lcigpIH1cbn1cbjo6c2xvdHRlZCgqKSB7XG4gICAgbWFyZ2luOiAwO1xufVxuYDtcblxuQGNvbXBvbmVudDxDYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1jYXJkJyxcbiAgICBzdHlsZXM6IFtzdHlsZV0sXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1oZWFkZXJcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1mb290ZXJcIj48L3Nsb3Q+XG4gICAgPGRpdj5Xb3JrZXIgY291bnRlcjogJHsgY2FyZC5jb3VudGVyIH08L2Rpdj5cbiAgICA8YnV0dG9uPlN0b3Agd29ya2VyPC9idXR0b24+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDYXJkIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIhOiBudW1iZXI7XG5cbiAgICB3b3JrZXIhOiBXb3JrZXI7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnY2xpY2snLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSE7IH1cbiAgICB9KVxuICAgIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnbWVzc2FnZScsXG4gICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy53b3JrZXI7IH1cbiAgICB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKGV2ZW50OiBNZXNzYWdlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY291bnRlciA9IGV2ZW50LmRhdGEpO1xuICAgIH1cbn1cblxuQGNvbXBvbmVudDxBY3Rpb25DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY3Rpb24tY2FyZCcsXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2FyZCBleHRlbmRzIENhcmQge1xuXG4gICAgLy8gd2UgY2FuIGluaGVyaXQgc3R5bGVzIGV4cGxpY2l0bHlcbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICAgICAgICAnc2xvdFtuYW1lPXVpLWFjdGlvbi1jYXJkLWFjdGlvbnNdIHsgZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IHJpZ2h0OyB9J1xuICAgICAgICBdXG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6IG51bGwgfSlcbiAgICBoYW5kbGVDbGljayAoKSB7IH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlTWVzc2FnZSAoKSB7IH1cbn1cblxuQGNvbXBvbmVudDxQbGFpbkNhcmQ+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXBsYWluLWNhcmQnLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgOmhvc3Qge1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBtYXgtd2lkdGg6IDQwY2g7XG4gICAgICAgIH1gXG4gICAgXVxuICAgIC8vIGlmIHdlIGRvbid0IHNwZWNpZnkgYSB0ZW1wbGF0ZSwgaXQgd2lsbCBiZSBpbmhlcml0ZWRcbn0pXG5leHBvcnQgY2xhc3MgUGxhaW5DYXJkIGV4dGVuZHMgQ2FyZCB7IH1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIGNvbXBvbmVudCwgQ29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICBoZWlnaHQ6IDFyZW07XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICAgICAgYm94LXNpemluZzogY29udGVudC1ib3g7XG4gICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkge1xuICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsICNiZmJmYmYpO1xuICAgIH1cbiAgICAuY2hlY2stbWFyayB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgdG9wOiAwLjI1cmVtO1xuICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHdpZHRoOiAwLjYyNXJlbTtcbiAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICBib3JkZXI6IHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICBib3JkZXItd2lkdGg6IDAgMCB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKTtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgdHJhbnNpdGlvbjogLjFzIGVhc2UtaW47XG4gICAgICAgIG9wYWNpdHk6IDA7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAuY2hlY2stbWFyayB7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBBIENTUyBzZWxlY3RvciBzdHJpbmdcbiAqXG4gKiBAc2VlXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX1NlbGVjdG9yc1xuICovXG5leHBvcnQgdHlwZSBDU1NTZWxlY3RvciA9IHN0cmluZztcblxuLyoqXG4gKiBJbnNlcnQgYSBOb2RlIGFmdGVyIGEgcmVmZXJlbmNlIE5vZGVcbiAqXG4gKiBAcGFyYW0gbmV3Q2hpbGQgLSBUaGUgTm9kZSB0byBpbnNlcnRcbiAqIEBwYXJhbSByZWZDaGlsZCAtIFRoZSByZWZlcmVuY2UgTm9kZSBhZnRlciB3aGljaCB0byBpbnNlcnRcbiAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCBOb2RlXG4gKi9cbmV4cG9ydCBjb25zdCBpbnNlcnRBZnRlciA9IDxUIGV4dGVuZHMgTm9kZT4gKG5ld0NoaWxkOiBULCByZWZDaGlsZDogTm9kZSk6IFQgfCB1bmRlZmluZWQgPT4ge1xuXG4gICAgcmV0dXJuIHJlZkNoaWxkLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShuZXdDaGlsZCwgcmVmQ2hpbGQubmV4dFNpYmxpbmcpO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlIGEgcmVmZXJlbmNlIE5vZGUgd2l0aCBhIG5ldyBOb2RlXG4gKlxuICogQHBhcmFtIG5ld0NoaWxkIC0gVGhlIE5vZGUgdG8gaW5zZXJ0XG4gKiBAcGFyYW0gcmVmQ2hpbGQgLSBUaGUgcmVmZXJlbmNlIE5vZGUgdG8gcmVwbGFjZVxuICogQHJldHVybnMgVGhlIHJlcGxhY2VkIHJlZmVyZW5jZSBOb2RlXG4gKi9cbmV4cG9ydCBjb25zdCByZXBsYWNlV2l0aCA9IDxUIGV4dGVuZHMgTm9kZSwgVSBleHRlbmRzIE5vZGU+IChuZXdDaGlsZDogVCwgcmVmQ2hpbGQ6IFUpOiBVIHwgdW5kZWZpbmVkID0+IHtcblxuICAgIHJldHVybiByZWZDaGlsZC5wYXJlbnROb2RlPy5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIHJlZkNoaWxkKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWxlbWVudFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogR2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50LCBidXQgcGllcmNlcyBzaGFkb3cgcm9vdHMgdG8gZmluZCB0aGUgYWN0aXZlIGVsZW1lbnRcbiAqIGFsc28gd2l0aGluIGEgY3VzdG9tIGVsZW1lbnQgd2hpY2ggaGFzIGEgc2hhZG93IHJvb3QuXG4gKi9cbmV4cG9ydCBjb25zdCBhY3RpdmVFbGVtZW50ID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcblxuICAgIGxldCBzaGFkb3dSb290OiBEb2N1bWVudE9yU2hhZG93Um9vdCB8IG51bGwgPSBkb2N1bWVudDtcbiAgICBsZXQgYWN0aXZlRWxlbWVudDogRWxlbWVudCA9IHNoYWRvd1Jvb3QuYWN0aXZlRWxlbWVudCA/PyBkb2N1bWVudC5ib2R5O1xuXG4gICAgd2hpbGUgKHNoYWRvd1Jvb3QgJiYgc2hhZG93Um9vdC5hY3RpdmVFbGVtZW50KSB7XG5cbiAgICAgICAgYWN0aXZlRWxlbWVudCA9IHNoYWRvd1Jvb3QuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgc2hhZG93Um9vdCA9IGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdDtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbn1cbiIsImV4cG9ydCBjbGFzcyBJREdlbmVyYXRvciB7XG5cbiAgICBwcml2YXRlIF9uZXh0ID0gMDtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHByZWZpeCAtIEFuIG9wdGlvbmFsIHByZWZpeCBmb3IgdGhlIGdlbmVyYXRlZCBJRCBpbmNsdWRpbmcgYW4gb3B0aW9uYWwgc2VwYXJhdG9yLCBlLmcuOiBgJ215LXByZWZpeC0nIG9yICdwcmVmaXgtLScgb3IgJ3ByZWZpeF8nIG9yICdwcmVmaXhgXG4gICAgICogQHBhcmFtIHN1ZmZpeCAtIEFuIG9wdGlvbmFsIHN1ZmZpeCBmb3IgdGhlIGdlbmVyYXRlZCBJRCBpbmNsdWRpbmcgYW4gb3B0aW9uYWwgc2VwYXJhdG9yLCBlLmcuOiBgJy1teS1zdWZmaXgnIG9yICctLXN1ZmZpeCcgb3IgJ19zdWZmaXgnIG9yICdzdWZmaXhgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyBwcmVmaXg6IHN0cmluZyA9ICcnLCBwdWJsaWMgc3VmZml4OiBzdHJpbmcgPSAnJykgeyB9XG5cbiAgICBnZXROZXh0SUQgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgcmV0dXJuIGAkeyB0aGlzLnByZWZpeCB9JHsgdGhpcy5fbmV4dCsrIH0keyB0aGlzLnN1ZmZpeCB9YDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIHByb3BlcnR5LCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIGNvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBDb25zdHJ1Y3RvciB9IGZyb20gJy4vY29uc3RydWN0b3InO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhhc1JvbGUge1xuICAgIHJvbGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1peGluUm9sZTxUIGV4dGVuZHMgdHlwZW9mIENvbXBvbmVudD4gKEJhc2U6IFQsIHJvbGU6IHN0cmluZyA9ICcnKTogVCAmIENvbnN0cnVjdG9yPEhhc1JvbGU+IHtcblxuICAgIEBjb21wb25lbnQoeyBkZWZpbmU6IGZhbHNlIH0pXG4gICAgY2xhc3MgQmFzZUhhc1JvbGUgZXh0ZW5kcyBCYXNlIGltcGxlbWVudHMgSGFzUm9sZSB7XG5cbiAgICAgICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcgfSlcbiAgICAgICAgcm9sZSE6IHN0cmluZztcblxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgICAgIHRoaXMucm9sZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdyb2xlJykgfHwgcm9sZTtcblxuICAgICAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gQmFzZUhhc1JvbGU7XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFNpemUge1xuICAgIHdpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG4gICAgaGVpZ2h0OiBudW1iZXIgfCBzdHJpbmc7XG4gICAgbWF4V2lkdGg6IG51bWJlciB8IHN0cmluZztcbiAgICBtYXhIZWlnaHQ6IG51bWJlciB8IHN0cmluZztcbiAgICBtaW5XaWR0aDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIG1pbkhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2l6ZUNoYW5nZWQgKHNpemU/OiBQYXJ0aWFsPFNpemU+LCBvdGhlcj86IFBhcnRpYWw8U2l6ZT4pOiBib29sZWFuIHtcblxuICAgIGlmIChzaXplICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHNpemUud2lkdGggIT09IG90aGVyLndpZHRoXG4gICAgICAgICAgICB8fCBzaXplLmhlaWdodCAhPT0gb3RoZXIuaGVpZ2h0XG4gICAgICAgICAgICB8fCBzaXplLm1heFdpZHRoICE9PSBvdGhlci5tYXhXaWR0aFxuICAgICAgICAgICAgfHwgc2l6ZS5tYXhIZWlnaHQgIT09IG90aGVyLm1heEhlaWdodFxuICAgICAgICAgICAgfHwgc2l6ZS5taW5XaWR0aCAhPT0gb3RoZXIubWluV2lkdGhcbiAgICAgICAgICAgIHx8IHNpemUubWluSGVpZ2h0ICE9PSBvdGhlci5taW5IZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpemUgIT09IG90aGVyO1xufVxuIiwiaW1wb3J0IHsgT2Zmc2V0LCBoYXNPZmZzZXRDaGFuZ2VkIH0gZnJvbSAnLi9vZmZzZXQnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcblxuZXhwb3J0IHR5cGUgQWxpZ25tZW50T3B0aW9uID0gJ3N0YXJ0JyB8ICdjZW50ZXInIHwgJ2VuZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxpZ25tZW50IHtcbiAgICBob3Jpem9udGFsOiBBbGlnbm1lbnRPcHRpb247XG4gICAgdmVydGljYWw6IEFsaWdubWVudE9wdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbGlnbm1lbnRQYWlyIHtcbiAgICBvcmlnaW46IEFsaWdubWVudDtcbiAgICB0YXJnZXQ6IEFsaWdubWVudDtcbiAgICBvZmZzZXQ/OiBPZmZzZXQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQm91bmRpbmdCb3gge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQUxJR05NRU5UX1BBSVI6IEFsaWdubWVudFBhaXIgPSB7XG4gICAgb3JpZ2luOiB7XG4gICAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgfSxcbiAgICB0YXJnZXQ6IHtcbiAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgIHZlcnRpY2FsOiAnY2VudGVyJyxcbiAgICB9LFxuICAgIG9mZnNldDoge1xuICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICB2ZXJ0aWNhbDogMCxcbiAgICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNBbGlnbm1lbnQgKGFsaWdubWVudDogYW55KTogYWxpZ25tZW50IGlzIEFsaWdubWVudCB7XG5cbiAgICByZXR1cm4gdHlwZW9mIChhbGlnbm1lbnQgYXMgQWxpZ25tZW50KS5ob3Jpem9udGFsICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgKGFsaWdubWVudCBhcyBBbGlnbm1lbnQpLnZlcnRpY2FsICE9PSAndW5kZWZpbmVkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FsaWdubWVudENoYW5nZWQgKGFsaWdubWVudDogQWxpZ25tZW50LCBvdGhlcjogQWxpZ25tZW50KTogYm9vbGVhbiB7XG5cbiAgICBpZiAoYWxpZ25tZW50ICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIGFsaWdubWVudC5ob3Jpem9udGFsICE9PSBvdGhlci5ob3Jpem9udGFsXG4gICAgICAgICAgICB8fCBhbGlnbm1lbnQudmVydGljYWwgIT09IG90aGVyLnZlcnRpY2FsO1xuICAgIH1cblxuICAgIHJldHVybiBhbGlnbm1lbnQgIT09IG90aGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWxpZ25tZW50UGFpckNoYW5nZWQgKGFsaWdubWVudFBhaXI/OiBBbGlnbm1lbnRQYWlyLCBvdGhlcj86IEFsaWdubWVudFBhaXIpOiBib29sZWFuIHtcblxuICAgIGlmIChhbGlnbm1lbnRQYWlyICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIGhhc0FsaWdubWVudENoYW5nZWQoYWxpZ25tZW50UGFpci50YXJnZXQsIG90aGVyLnRhcmdldClcbiAgICAgICAgICAgIHx8IGhhc0FsaWdubWVudENoYW5nZWQoYWxpZ25tZW50UGFpci5vcmlnaW4sIG90aGVyLm9yaWdpbilcbiAgICAgICAgICAgIHx8IGhhc09mZnNldENoYW5nZWQoYWxpZ25tZW50UGFpci5vZmZzZXQsIG90aGVyLm9mZnNldCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsaWdubWVudFBhaXIgIT09IG90aGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxpZ25lZFBvc2l0aW9uIChlbGVtZW50Qm94OiBCb3VuZGluZ0JveCwgZWxlbWVudEFsaWdubWVudDogQWxpZ25tZW50KTogUG9zaXRpb24ge1xuXG4gICAgY29uc3QgcG9zaXRpb246IFBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICBzd2l0Y2ggKGVsZW1lbnRBbGlnbm1lbnQuaG9yaXpvbnRhbCkge1xuXG4gICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94Lng7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgcG9zaXRpb24ueCA9IGVsZW1lbnRCb3gueCArIGVsZW1lbnRCb3gud2lkdGggLyAyO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94LnggKyBlbGVtZW50Qm94LndpZHRoO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgc3dpdGNoIChlbGVtZW50QWxpZ25tZW50LnZlcnRpY2FsKSB7XG5cbiAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgcG9zaXRpb24ueSA9IGVsZW1lbnRCb3gueTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0gZWxlbWVudEJveC55ICsgZWxlbWVudEJveC5oZWlnaHQgLyAyO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBlbGVtZW50Qm94LnkgKyBlbGVtZW50Qm94LmhlaWdodDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldFBvc2l0aW9uIChvcmlnaW5Cb3g6IEJvdW5kaW5nQm94LCBvcmlnaW5BbGlnbm1lbnQ6IEFsaWdubWVudCwgdGFyZ2V0Qm94OiBCb3VuZGluZ0JveCwgdGFyZ2V0QWxpZ25tZW50OiBBbGlnbm1lbnQpOiBQb3NpdGlvbiB7XG5cbiAgICBjb25zdCBvcmlnaW5Qb3NpdGlvbiA9IGdldEFsaWduZWRQb3NpdGlvbihvcmlnaW5Cb3gsIG9yaWdpbkFsaWdubWVudCk7XG4gICAgY29uc3QgdGFyZ2V0UG9zaXRpb24gPSBnZXRBbGlnbmVkUG9zaXRpb24oeyAuLi50YXJnZXRCb3gsIHg6IDAsIHk6IDAgfSwgdGFyZ2V0QWxpZ25tZW50KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IG9yaWdpblBvc2l0aW9uLnggLSB0YXJnZXRQb3NpdGlvbi54LFxuICAgICAgICB5OiBvcmlnaW5Qb3NpdGlvbi55IC0gdGFyZ2V0UG9zaXRpb24ueSxcbiAgICB9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uIHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTjogUG9zaXRpb24gPSB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUG9zaXRpb24gKHBvc2l0aW9uOiBhbnkpOiBwb3NpdGlvbiBpcyBQb3NpdGlvbiB7XG5cbiAgICByZXR1cm4gdHlwZW9mIChwb3NpdGlvbiBhcyBQb3NpdGlvbikueCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIChwb3NpdGlvbiBhcyBQb3NpdGlvbikueSAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgIGlmIChwb3NpdGlvbiAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbi54ICE9PSBvdGhlci54XG4gICAgICAgICAgICB8fCBwb3NpdGlvbi55ICE9PSBvdGhlci55O1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbiAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBBbGlnbm1lbnRQYWlyLCBERUZBVUxUX0FMSUdOTUVOVF9QQUlSLCBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZCB9IGZyb20gJy4vYWxpZ25tZW50JztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBoYXNTaXplQ2hhbmdlZCwgU2l6ZSB9IGZyb20gJy4vc2l6ZSc7XG5cbmV4cG9ydCBjb25zdCBWSUVXUE9SVCA9ICd2aWV3cG9ydCc7XG5cbmV4cG9ydCBjb25zdCBPUklHSU4gPSAnb3JpZ2luJztcblxuLyoqXG4gKiBBIFBvc2l0aW9uQ29uZmlnIGNvbnRhaW5zIHRoZSBzaXplIGFuZCBhbGlnbm1lbnQgb2YgYW4gRWxlbWVudCBhbmQgbWF5IGluY2x1ZGUgYW4gb3JpZ2luLCB3aGljaCByZWZlcmVuY2VzIGFuIG9yaWdpbiBFbGVtZW50XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25Db25maWcgZXh0ZW5kcyBTaXplIHtcbiAgICB3aWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgaGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBtYXhXaWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgbWF4SGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBtaW5XaWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgbWluSGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBvcmlnaW46IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCAndmlld3BvcnQnO1xuICAgIGFsaWdubWVudDogQWxpZ25tZW50UGFpcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT05fQ09ORklHOiBQb3NpdGlvbkNvbmZpZyA9IHtcbiAgICB3aWR0aDogJ2F1dG8nLFxuICAgIGhlaWdodDogJ2F1dG8nLFxuICAgIG1heFdpZHRoOiAnMTAwdncnLFxuICAgIG1heEhlaWdodDogJzEwMHZoJyxcbiAgICBtaW5XaWR0aDogJ2F1dG8nLFxuICAgIG1pbkhlaWdodDogJ2F1dG8nLFxuICAgIG9yaWdpbjogJ3ZpZXdwb3J0JyxcbiAgICBhbGlnbm1lbnQ6IHsgLi4uREVGQVVMVF9BTElHTk1FTlRfUEFJUiB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGFzUG9zaXRpb25Db25maWdDaGFuZ2VkIChwb3NpdGlvbkNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+LCBvdGhlcj86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KTogYm9vbGVhbiB7XG5cbiAgICBpZiAocG9zaXRpb25Db25maWcgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gcG9zaXRpb25Db25maWcub3JpZ2luICE9PSBvdGhlci5vcmlnaW5cbiAgICAgICAgICAgIHx8IGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkKHBvc2l0aW9uQ29uZmlnLmFsaWdubWVudCwgb3RoZXIuYWxpZ25tZW50KVxuICAgICAgICAgICAgfHwgaGFzU2l6ZUNoYW5nZWQocG9zaXRpb25Db25maWcsIG90aGVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb25Db25maWcgIT09IG90aGVyO1xufVxuIiwiaW1wb3J0IHsgRXNjYXBlIH0gZnJvbSAnLi9rZXlzJztcblxuZXhwb3J0IGludGVyZmFjZSBFdmVudEJpbmRpbmcge1xuICAgIHJlYWRvbmx5IHRhcmdldDogRXZlbnRUYXJnZXQ7XG4gICAgcmVhZG9ubHkgdHlwZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbDtcbiAgICByZWFkb25seSBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFdmVudEJpbmRpbmcgKGJpbmRpbmc6IGFueSk6IGJpbmRpbmcgaXMgRXZlbnRCaW5kaW5nIHtcblxuICAgIHJldHVybiB0eXBlb2YgYmluZGluZyA9PT0gJ29iamVjdCdcbiAgICAgICAgJiYgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykudGFyZ2V0ID09PSAnb2JqZWN0J1xuICAgICAgICAmJiB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS50eXBlID09PSAnc3RyaW5nJ1xuICAgICAgICAmJiAodHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykubGlzdGVuZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIHx8IHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLmxpc3RlbmVyID09PSAnb2JqZWN0Jyk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXNjYXBlIChldmVudD86IEV2ZW50KTogYm9vbGVhbiB7XG5cbiAgICByZXR1cm4gKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpPy5rZXkgPT09IEVzY2FwZTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaGVzIGEgQ3VzdG9tRXZlbnQgb24gdGhlIHRhcmdldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbiB7XG5cbiAgICByZXR1cm4gdGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHR5cGUsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIC4uLmV2ZW50SW5pdCxcbiAgICAgICAgZGV0YWlsXG4gICAgfSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsIChldmVudDogRXZlbnQpIHtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgbWFuYWdpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgRXZlbnRNYW5hZ2VyIGNsYXNzIGNhbiBiZSB1c2VkIHRvIGhhbmRsZSBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgb24gbXVsdGlwbGUgdGFyZ2V0cy4gSXQgY2FjaGVzIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAqIGFuZCBjYW4gcmVtb3ZlIHRoZW0gc2VwYXJhdGVseSBvciBhbGwgdG9nZXRoZXIuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGV2ZW50IGxpc3RlbmVycyBuZWVkIHRvIGJlIGFkZGVkIGFuZCByZW1vdmVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIGEgY29tcG9uZW50IGFuZCBtYWtlcyBtYW51YWxseSBzYXZpbmcgcmVmZXJlbmNlcyB0byB0YXJnZXRzLCBsaXN0ZW5lcnMgYW5kIG9wdGlvbnMgdW5uZWNlc3NhcnkuXG4gKlxuICogYGBgdHNcbiAqICAvLyBjcmVhdGUgYW4gRXZlbnRNYW5hZ2VyIGluc3RhbmNlXG4gKiAgY29uc3QgbWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcbiAqXG4gKiAgLy8geW91IGNhbiBzYXZlIGEgcmVmZXJlbmNlIChhbiBFdmVudEJpbmRpbmcpIHRvIHRoZSBhZGRlZCBldmVudCBsaXN0ZW5lciBpZiB5b3UgbmVlZCB0byBtYW51YWxseSByZW1vdmUgaXQgbGF0ZXJcbiAqICBjb25zdCBiaW5kaW5nID0gbWFuYWdlci5saXN0ZW4oZG9jdW1lbnQsICdzY3JvbGwnLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8gLi4ub3IgaWdub3JlIHRoZSByZWZlcmVuY2UgaWYgeW91IGRvbid0IG5lZWQgaXRcbiAqICBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudC5ib2R5LCAnY2xpY2snLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8geW91IGNhbiByZW1vdmUgYSBzcGVjaWZpYyBldmVudCBsaXN0ZW5lciB1c2luZyBhIHJlZmVyZW5jZVxuICogIG1hbmFnZXIudW5saXN0ZW4oYmluZGluZyk7XG4gKlxuICogIC8vIC4uLm9yIHJlbW92ZSBhbGwgcHJldmlvdXNseSBhZGRlZCBldmVudCBsaXN0ZW5lcnMgaW4gb25lIGdvXG4gKiAgbWFuYWdlci51bmxpc3RlbkFsbCgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG4gICAgcHJvdGVjdGVkIGJpbmRpbmdzID0gbmV3IFNldDxFdmVudEJpbmRpbmc+KCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYW4gRXZlbnRCaW5kaW5nIGV4aXN0cyB0aGF0IG1hdGNoZXMgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICovXG4gICAgaGFzQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGhhc0JpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbjtcblxuICAgIGhhc0JpbmRpbmcgKFxuICAgICAgICB0YXJnZXRPckJpbmRpbmc6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIChpc0V2ZW50QmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA/IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nKVxuICAgICAgICAgICAgOiB0aGlzLmZpbmRCaW5kaW5nKHRhcmdldE9yQmluZGluZywgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucykpICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBmaW5kQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIGZpbmRCaW5kaW5nIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgbGV0IHNlYXJjaEJpbmRpbmc6IEV2ZW50QmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldCkgPyBiaW5kaW5nT3JUYXJnZXQgOiB0aGlzLmNyZWF0ZUJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBsZXQgZm91bmRCaW5kaW5nOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYmluZGluZ3MuaGFzKHNlYXJjaEJpbmRpbmcpKSByZXR1cm4gc2VhcmNoQmluZGluZztcblxuICAgICAgICBmb3IgKGxldCBiaW5kaW5nIG9mIHRoaXMuYmluZGluZ3MudmFsdWVzKCkpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZUJpbmRpbmdzKHNlYXJjaEJpbmRpbmcsIGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgICAgICBmb3VuZEJpbmRpbmcgPSBiaW5kaW5nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kQmluZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0IG9mIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyBhZGRlZCBvciB1bmRlZmluZWQgYSBtYXRjaGluZyBldmVudCBiaW5kaW5nIGFscmVhZHkgZXhpc3RzXG4gICAgICovXG4gICAgbGlzdGVuIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgbGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gYmluZGluZ09yVGFyZ2V0XG4gICAgICAgICAgICA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNCaW5kaW5nKGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFkZChiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lciBmcm9tIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyByZW1vdmVkIG9yIHVuZGVmaW5lZCBpZiBubyBtYXRjaGluZyBldmVudCBiaW5kaW5nIGV4aXN0c1xuICAgICAqL1xuICAgIHVubGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbik6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIHVubGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhblxuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoYmluZGluZykge1xuXG4gICAgICAgICAgICBiaW5kaW5nLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGJpbmRpbmcudHlwZSwgYmluZGluZy5saXN0ZW5lciwgYmluZGluZy5vcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5kZWxldGUoYmluZGluZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlaXIgdGFyZ2V0c1xuICAgICAqL1xuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLmJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB0aGlzLnVubGlzdGVuKGJpbmRpbmcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIGFuIEV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gICAgICovXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcblxuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ6IFBhcnRpYWw8RXZlbnRJbml0PiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGV2ZW50T3JUeXBlIGluc3RhbmNlb2YgRXZlbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50T3JUeXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnRPclR5cGUhLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICAgICAgZGV0YWlsXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdFxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byB7QGxpbmsgRXZlbnRCaW5kaW5nfSBvYmplY3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGJpbmRpbmcgb2JqZWN0cyBoYXZlIHRoZSBzYW1lIHRhcmdldCwgdHlwZSBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbXBhcmVCaW5kaW5ncyAoYmluZGluZzogRXZlbnRCaW5kaW5nLCBvdGhlcjogRXZlbnRCaW5kaW5nKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGJpbmRpbmcgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gYmluZGluZy50YXJnZXQgPT09IG90aGVyLnRhcmdldFxuICAgICAgICAgICAgJiYgYmluZGluZy50eXBlID09PSBvdGhlci50eXBlXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVMaXN0ZW5lcnMoYmluZGluZy5saXN0ZW5lciwgb3RoZXIubGlzdGVuZXIpXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVPcHRpb25zKGJpbmRpbmcub3B0aW9ucywgb3RoZXIub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUxpc3RlbmVycyAobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvdGhlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggbGlzdGVuZXJzIGJlaW5nIG51bGwsIGEgZnVuY3Rpb24gb3IgdGhlIHNhbWUgRXZlbnRMaXN0ZW5lck9iamVjdFxuICAgICAgICBpZiAobGlzdGVuZXIgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBjb21wYXJlcyB0aGUgaGFuZGxlcnMgb2YgdHdvIEV2ZW50TGlzdGVuZXJPYmplY3RzXG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChsaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudCA9PT0gKG90aGVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBldmVudCBsaXN0ZW5lciBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9wdGlvbnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZU9wdGlvbnMgKG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsIG90aGVyPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbiB7XG5cbiAgICAgICAgLy8gY2F0Y2hlcyBib3RoIG9wdGlvbnMgYmVpbmcgdW5kZWZpbmVkIG9yIHNhbWUgYm9vbGVhbiB2YWx1ZVxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHR3byBvcHRpb25zIG9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb3RoZXIgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNhcHR1cmUgPT09IG90aGVyLmNhcHR1cmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLnBhc3NpdmUgPT09IG90aGVyLnBhc3NpdmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLm9uY2UgPT09IG90aGVyLm9uY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgYW5pbWF0aW9uRnJhbWVUYXNrLCBUYXNrIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50L3Rhc2tzJztcbmltcG9ydCB7IEV2ZW50QmluZGluZywgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vZXZlbnRzJztcblxuLy8gVE9ETzogbW92ZSBOT09QIHRvIHNvbWUgdXRpbGl0eVxuY29uc3QgTk9PUDogKCkgPT4gdm9pZCA9ICgpID0+IHsgfTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJlaGF2aW9yIHtcblxuICAgIHByb3RlY3RlZCBfYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBfZWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcHJvdGVjdGVkIF91cGRhdGVUYXNrOiBUYXNrID0geyBwcm9taXNlOiBQcm9taXNlLnJlc29sdmUoKSwgY2FuY2VsOiBOT09QIH07XG5cbiAgICBwcm90ZWN0ZWQgX2V2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRydWUgaWYgdGhlIGJlaGF2aW9yJ3Mge0BsaW5rIEJlaGF2aW9yLmF0dGFjaH0gbWV0aG9kIHdhcyBjYWxsZWRcbiAgICAgKlxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIGdldCBoYXNBdHRhY2hlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBlbGVtZW50IHRoYXQgdGhlIGJlaGF2aW9yIGlzIGF0dGFjaGVkIHRvXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdlIG9ubHkgZXhwb3NlIGEgZ2V0dGVyIGZvciB0aGUgZWxlbWVudCwgc28gaXQgY2FuJ3QgYmUgc2V0IGRpcmVjdGx5LCBidXQgaGFzIHRvIGJlIHNldCB2aWFcbiAgICAgKiB0aGUgYmVoYXZpb3IncyBhdHRhY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIGdldCBlbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgdGhlIGJlaGF2aW9yIGluc3RhbmNlIHRvIGFuIEhUTUxFbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAgIEFuIG9wdGlvbmFsIEhUTUxFbGVtZW50IHRvIGF0dGFjaCB0aGUgYmVoYXZpb3IgdG9cbiAgICAgKiBAcGFyYW0gYXJncyAgICAgIE9wdGlvbmFsIGFyZ3VtYW50ZXMgd2hpY2ggY2FuIGJlIHBhc3NlZCB0byB0aGUgYXR0YWNoIG1ldGhvZFxuICAgICAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIGJlaGF2aW9yIHdhcyBzdWNjZXNzZnVsbHkgYXR0YWNoZWRcbiAgICAgKi9cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCwgLi4uYXJnczogYW55W10pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2hlcyB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogRGV0YWNoaW5nIGEgYmVoYXZpb3Igd2lsbCBjYW5jZWwgYW55IHNjaGVkdWxlZCB1cGRhdGUsIHJlbW92ZSBhbGwgYm91bmQgbGlzdGVuZXJzXG4gICAgICogYm91bmQgd2l0aCB0aGUge0BsaW5rIEJlaGF2aW9yLmxpc3Rlbn0gbWV0aG9kIGFuZCBjbGVhciB0aGUgYmVoYXZpb3IncyBlbGVtZW50XG4gICAgICogcmVmZXJlbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgIE9wdGlvbmFsIGFyZ3VtZW50cyB3aGljaCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBkZXRhY2ggbWV0aG9kXG4gICAgICovXG4gICAgZGV0YWNoICguLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuY2FuY2VsVXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy51bmxpc3RlbkFsbCgpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2Qgc2NoZWR1bGVzIGFuIHVwZGF0ZSBjYWxsIHVzaW5nIHJlcXVlc3RBbmltYXRpb25GcmFtZS4gSXQgcmV0dXJucyBhIFByb21pc2VcbiAgICAgKiB3aGljaCB3aWxsIHJlc29sdmUgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB1cGRhdGUgbWV0aG9kLCBvciByZWplY3QgaWYgYW4gZXJyb3JcbiAgICAgKiBvY2N1cnJzIGR1cmluZyB1cGRhdGUgb3IgdGhlIHVwZGF0ZSB3YXMgY2FuY2VsZWQuIElmIGFuIHVwZGF0ZSBoYXMgYmVlbiBzY2hlZHVsZWRcbiAgICAgKiBhbHJlYWR5LCBidXQgaGFzbid0IGV4ZWN1dGVkIHlldCwgdGhlIHNjaGVkdWxlZCB1cGRhdGUncyBwcm9taXNlIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIHJlcXVlc3RVcGRhdGUgKC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiAhdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRhc2sgPSBhbmltYXRpb25GcmFtZVRhc2soKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoLi4uYXJncyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVRhc2sucHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSByZXF1ZXN0ZWQgYnV0IG5vdCB5ZXQgZXhlY3V0ZWQgdXBkYXRlXG4gICAgICovXG4gICAgY2FuY2VsVXBkYXRlICgpIHtcblxuICAgICAgICB0aGlzLl91cGRhdGVUYXNrLmNhbmNlbCgpO1xuXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBzeW5jaHJvbm91c2x5LCBlLmcuIGluIHRoZSB1cGRhdGUgY3ljbGUgb2YgYSBjb21wb25lbnRcbiAgICAgKiB3aGljaCBpcyBhbHJlYWR5IHNjaGVkdWxlZCB2aWEgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLiBJZiBhIGJlaGF2aW9yIHdhbnRzIHRvIHVwZGF0ZSBpdHNlbGZcbiAgICAgKiBiYXNlZCBvbiBzb21lIGV2ZW50LCBpdCBpcyByZWNvbW1lbmRlZCB0byB1c2Uge0BsaW5rIEJlaGF2aW9yLnJlcXVlc3RVcGRhdGV9IGluc3RlYWQuXG4gICAgICovXG4gICAgdXBkYXRlICguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0YWNoZWQ7XG4gICAgfVxuXG4gICAgbGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50TWFuYWdlci5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRNYW5hZ2VyLnVubGlzdGVuKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLl9ldmVudE1hbmFnZXIudW5saXN0ZW5BbGwoKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCAoZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaDxUID0gYW55PiAodHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuO1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+IChldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCAmJiB0aGlzLmVsZW1lbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChldmVudE9yVHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5fZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKHRoaXMuZWxlbWVudCwgZXZlbnRPclR5cGUpXG4gICAgICAgICAgICAgICAgOiB0aGlzLl9ldmVudE1hbmFnZXIuZGlzcGF0Y2godGhpcy5lbGVtZW50LCBldmVudE9yVHlwZSEsIGRldGFpbCwgZXZlbnRJbml0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCZWhhdmlvciB9IGZyb20gJy4uL2JlaGF2aW9yL2JlaGF2aW9yJztcbmltcG9ydCB7IEJvdW5kaW5nQm94LCBnZXRUYXJnZXRQb3NpdGlvbiB9IGZyb20gJy4vYWxpZ25tZW50JztcbmltcG9ydCB7IGhhc1Bvc2l0aW9uQ2hhbmdlZCwgaXNQb3NpdGlvbiwgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcbmltcG9ydCB7IFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgaGFzU2l6ZUNoYW5nZWQsIFNpemUgfSBmcm9tICcuL3NpemUnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db250cm9sbGVyIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRQb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFNpemU6IFNpemUgfCB1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3RvciAocHJvdGVjdGVkIGNvbmZpZzogUG9zaXRpb25Db25maWcpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlcXVlc3RVcGRhdGUgKHBvc2l0aW9uPzogUG9zaXRpb24sIHNpemU/OiBTaXplKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlcXVlc3RVcGRhdGUocG9zaXRpb24sIHNpemUpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAocG9zaXRpb24/OiBQb3NpdGlvbiwgc2l6ZT86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIGNvbnN0IG5leHRTaXplID0gc2l6ZSB8fCB0aGlzLmdldFNpemUoKTtcbiAgICAgICAgbGV0IHVwZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFBvc2l0aW9uIHx8IHRoaXMuaGFzUG9zaXRpb25DaGFuZ2VkKG5leHRQb3NpdGlvbiwgdGhpcy5jdXJyZW50UG9zaXRpb24pKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2l6ZSB8fCB0aGlzLmhhc1NpemVDaGFuZ2VkKG5leHRTaXplLCB0aGlzLmN1cnJlbnRTaXplKSkge1xuXG4gICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZShuZXh0U2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTaXplID0gbmV4dFNpemU7XG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogVGhlIHBvc2l0aW9uIHdpbGwgZGVwZW5kIG9uIHRoZSBhbGlnbm1lbnQgYW5kIG9yaWdpbiBvcHRpb25zIG9mIHRoZSB7QGxpbmsgUG9zaXRpb25Db25maWd9LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbkJveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3godGhpcy5jb25maWcub3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0Qm94ID0gdGhpcy5nZXRCb3VuZGluZ0JveCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgICAgIC8vIFRPRE86IGluY2x1ZGUgYWxpZ25tZW50IG9mZnNldFxuXG4gICAgICAgIHJldHVybiBnZXRUYXJnZXRQb3NpdGlvbihvcmlnaW5Cb3gsIHRoaXMuY29uZmlnLmFsaWdubWVudC5vcmlnaW4sIHRhcmdldEJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50LnRhcmdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFdlIHRha2UgdGhlIHNldHRpbmdzIGZyb20gdGhlIHtAbGluayBQb3NpdGlvbkNvbmZpZ30gc28gd2UgYXJlIGFsd2F5cyB1cC10by1kYXRlIGlmIHRoZSBjb25maWd1cmF0aW9uIHdhcyB1cGRhdGVkLlxuICAgICAqXG4gICAgICogVGhpcyBob29rIGFsc28gYWxsb3dzIHVzIHRvIGRvIHRoaW5ncyBsaWtlIG1hdGNoaW5nIHRoZSBvcmlnaW4ncyB3aWR0aCwgb3IgbG9va2luZyBhdCB0aGUgYXZhaWxhYmxlIHZpZXdwb3J0IGRpbWVuc2lvbnMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFNpemUgKCk6IFNpemUge1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbldpZHRoID0gKHRoaXMuY29uZmlnLm9yaWdpbiA9PT0gJ3ZpZXdwb3J0JylcbiAgICAgICAgICAgID8gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgICAgIDogKHRoaXMuY29uZmlnLm9yaWdpbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5jb25maWcub3JpZ2luLmNsaWVudFdpZHRoXG4gICAgICAgICAgICAgICAgOiAnYXV0byc7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luSGVpZ2h0ID0gKHRoaXMuY29uZmlnLm9yaWdpbiA9PT0gJ3ZpZXdwb3J0JylcbiAgICAgICAgICAgID8gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgICA6ICh0aGlzLmNvbmZpZy5vcmlnaW4gaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgICAgICAgICA/IHRoaXMuY29uZmlnLm9yaWdpbi5jbGllbnRIZWlnaHRcbiAgICAgICAgICAgICAgICA6ICdhdXRvJztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6ICh0aGlzLmNvbmZpZy53aWR0aCA9PT0gJ29yaWdpbicpID8gb3JpZ2luV2lkdGggOiB0aGlzLmNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogKHRoaXMuY29uZmlnLmhlaWdodCA9PT0gJ29yaWdpbicpID8gb3JpZ2luSGVpZ2h0IDogdGhpcy5jb25maWcuaGVpZ2h0LFxuICAgICAgICAgICAgbWF4V2lkdGg6ICh0aGlzLmNvbmZpZy5tYXhXaWR0aCA9PT0gJ29yaWdpbicpID8gb3JpZ2luV2lkdGggOiB0aGlzLmNvbmZpZy5tYXhXaWR0aCxcbiAgICAgICAgICAgIG1heEhlaWdodDogKHRoaXMuY29uZmlnLm1heEhlaWdodCA9PT0gJ29yaWdpbicpID8gb3JpZ2luSGVpZ2h0IDogdGhpcy5jb25maWcubWF4V2lkdGgsXG4gICAgICAgICAgICBtaW5XaWR0aDogKHRoaXMuY29uZmlnLm1pbldpZHRoID09PSAnb3JpZ2luJykgPyBvcmlnaW5XaWR0aCA6IHRoaXMuY29uZmlnLm1pbldpZHRoLFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAodGhpcy5jb25maWcubWluSGVpZ2h0ID09PSAnb3JpZ2luJykgPyBvcmlnaW5IZWlnaHQgOiB0aGlzLmNvbmZpZy5taW5IZWlnaHQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEJvdW5kaW5nQm94IChyZWZlcmVuY2U6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpOiBCb3VuZGluZ0JveCB7XG5cbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3g6IEJvdW5kaW5nQm94ID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNQb3NpdGlvbihyZWZlcmVuY2UpKSB7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnggPSByZWZlcmVuY2UueDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSByZWZlcmVuY2UueTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZSA9PT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgYm91bmRpbmdCb3guaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luUmVjdCA9IHJlZmVyZW5jZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gueCA9IG9yaWdpblJlY3QubGVmdDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSBvcmlnaW5SZWN0LnRvcDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LndpZHRoID0gb3JpZ2luUmVjdC53aWR0aDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LmhlaWdodCA9IG9yaWdpblJlY3QuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kaW5nQm94O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRvcCA9IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi55KTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlTaXplIChzaXplOiBTaXplKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS53aWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLndpZHRoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5oZWlnaHQgPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLm1heFdpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWF4V2lkdGgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLm1heEhlaWdodCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1heEhlaWdodCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubWluV2lkdGggPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5taW5XaWR0aCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubWluSGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWluSGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBtYXliZSBuYW1lIHRoaXMgYmV0dGVyLCBodWg/XG4gICAgcHJvdGVjdGVkIHBhcnNlU3R5bGUgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpID8gYCR7IHZhbHVlIHx8IDAgfXB4YCA6IHZhbHVlIHx8ICcnO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzUG9zaXRpb25DaGFuZ2VkKHBvc2l0aW9uLCBvdGhlcik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1NpemVDaGFuZ2VkIChzaXplPzogU2l6ZSwgb3RoZXI/OiBTaXplKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIGhhc1NpemVDaGFuZ2VkKHNpemUsIG90aGVyKTtcbiAgICB9XG59XG4iLCJcbmV4cG9ydCBmdW5jdGlvbiBhcHBseURlZmF1bHRzPFQ+IChjb25maWc6IFBhcnRpYWw8VD4sIGRlZmF1bHRzOiBUKTogVCB7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkZWZhdWx0cykge1xuXG4gICAgICAgIGlmIChjb25maWdba2V5XSA9PT0gdW5kZWZpbmVkKSBjb25maWdba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZyBhcyBUO1xufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuL2JlaGF2aW9yJztcbmltcG9ydCB7IGFwcGx5RGVmYXVsdHMgfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5leHBvcnQgY29uc3QgVU5ERUZJTkVEX1RZUEUgPSAodHlwZTogc3RyaW5nLCBtYXA6IHN0cmluZyA9ICdiZWhhdmlvcicpID0+IG5ldyBFcnJvcihcbiAgICBgVW5kZWZpbmVkIHR5cGUga2V5OiBObyAkeyBtYXAgfSBmb3VuZCBmb3Iga2V5ICckeyB0eXBlIH0nLlxuQWRkIGEgJ2RlZmF1bHQnIGtleSB0byB5b3VyICR7IG1hcCB9IG1hcCB0byBwcm92aWRlIGEgZmFsbGJhY2sgJHsgbWFwIH0gZm9yIHVuZGVmaW5lZCB0eXBlcy5gKTtcblxuLyoqXG4gKiBBIGJlaGF2aW9yIGNvbnN0cnVjdG9yXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGlzIHR5cGUgZW5mb3JjZXMge0BsaW5rIEJlaGF2aW9yfSBjb25zdHJ1Y3RvcnMgd2hpY2ggcmVjZWl2ZSBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGZpcnN0IHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0IHR5cGUgQmVoYXZpb3JDb25zdHJ1Y3RvcjxCIGV4dGVuZHMgQmVoYXZpb3IsIEMgPSBhbnk+ID0gbmV3IChjb25maWd1cmF0aW9uOiBDLCAuLi5hcmdzOiBhbnlbXSkgPT4gQjtcblxuZXhwb3J0IHR5cGUgQmVoYXZpb3JNYXA8QiBleHRlbmRzIEJlaGF2aW9yLCBLIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IHtcbiAgICBba2V5IGluIChLIHwgJ2RlZmF1bHQnKV06IEJlaGF2aW9yQ29uc3RydWN0b3I8Qj47XG59XG5cbmV4cG9ydCB0eXBlIENvbmZpZ3VyYXRpb25NYXA8QywgSyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4gPSB7XG4gICAgW2tleSBpbiAoSyB8ICdkZWZhdWx0JyldOiBDO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmVoYXZpb3JGYWN0b3J5PEIgZXh0ZW5kcyBCZWhhdmlvciwgQywgSyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwcm90ZWN0ZWQgYmVoYXZpb3JzOiBCZWhhdmlvck1hcDxCLCBLPixcbiAgICAgICAgcHJvdGVjdGVkIGNvbmZpZ3VyYXRpb25zOiBDb25maWd1cmF0aW9uTWFwPEMsIEs+LFxuICAgICkgeyB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBiZWhhdmlvciBvZiB0aGUgc3BlY2lmaWVkIHR5cGUgYW5kIGNvbmZpZ3VyYXRpb25cbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIHR5cGUga2V5IGV4aXN0cyBpbiBiZWhhdmlvciBhbmQgY29uZmlndXJhdGlvbiBtYXAsXG4gICAgICogbWVyZ2VzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpZWQgdHlwZSBpbnRvIHRoZSBwcm92aWRlZFxuICAgICAqIGNvbmZpZ3VyYXRpb24gYW5kIGNyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgdGhlIGNvcnJlY3QgYmVoYXZpb3Igd2l0aCB0aGUgbWVyZ2VkXG4gICAgICogY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBjcmVhdGUgKHR5cGU6IEssIGNvbmZpZzogUGFydGlhbDxDPiwgLi4uYXJnczogYW55W10pOiBCIHtcblxuICAgICAgICB0aGlzLmNoZWNrVHlwZSh0eXBlKTtcblxuICAgICAgICBjb25zdCBiZWhhdmlvciA9IHRoaXMuZ2V0QmVoYXZpb3IodHlwZSk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBhcHBseURlZmF1bHRzKGNvbmZpZywgdGhpcy5nZXRDb25maWd1cmF0aW9uKHR5cGUpKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRJbnN0YW5jZSh0eXBlLCBiZWhhdmlvciwgY29uZmlndXJhdGlvbiwgLi4uYXJncyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgYmVoYXZpb3IgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5IGFueSBCZWhhdmlvckZhY3RvcnkgdG8gYWRqdXN0IHRoZSBjcmVhdGlvbiBvZiBCZWhhdmlvciBpbnN0YW5jZXMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEluc3RhbmNlICh0eXBlOiBLLCBiZWhhdmlvcjogQmVoYXZpb3JDb25zdHJ1Y3RvcjxCLCBDPiwgY29uZmlndXJhdGlvbjogQywgLi4uYXJnczogYW55W10pOiBCIHtcblxuICAgICAgICByZXR1cm4gbmV3IGJlaGF2aW9yKGNvbmZpZ3VyYXRpb24sIC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgdHlwZSBleGlzdHMgaW4gYmVoYXZpb3IgYW5kIGNvbmZpZ3VyYXRpb24gbWFwXG4gICAgICpcbiAgICAgKiBAdGhyb3dzXG4gICAgICoge0BsaW5rIFVOREVGSU5FRF9UWVBFfSBlcnJvciBpZiBuZWl0aGVyIHRoZSBzcGVjaWZpZWQgdHlwZSBub3IgYSAnZGVmYXVsdCcga2V5XG4gICAgICogZXhpc3RzIGluIHRoZSBiZWhhdmlvciBvciBjb25maWd1cmF0aW9uIG1hcC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY2hlY2tUeXBlICh0eXBlOiBLKSB7XG5cbiAgICAgICAgaWYgKCEodHlwZSBpbiB0aGlzLmJlaGF2aW9ycyB8fCAnZGVmYXVsdCcgaW4gdGhpcy5iZWhhdmlvcnMpKSB0aHJvdyBVTkRFRklORURfVFlQRSh0eXBlLCAnYmVoYXZpb3InKTtcblxuICAgICAgICBpZiAoISh0eXBlIGluIHRoaXMuY29uZmlndXJhdGlvbnMgfHwgJ2RlZmF1bHQnIGluIHRoaXMuY29uZmlndXJhdGlvbnMpKSB0aHJvdyBVTkRFRklORURfVFlQRSh0eXBlLCAnY29uZmlndXJhdGlvbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmVoYXZpb3IgY2xhc3MgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZSBrZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0QmVoYXZpb3IgKHR5cGU6IEspOiBCZWhhdmlvckNvbnN0cnVjdG9yPEI+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5iZWhhdmlvcnNbdHlwZV0gfHwgdGhpcy5iZWhhdmlvcnNbJ2RlZmF1bHQnXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpZWQgdHlwZSBrZXlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0Q29uZmlndXJhdGlvbiAodHlwZTogSyk6IEMge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25zW3R5cGVdIHx8IHRoaXMuY29uZmlndXJhdGlvbnNbJ2RlZmF1bHQnXTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OLCBQb3NpdGlvbiB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbi1jb250cm9sbGVyJztcblxuZXhwb3J0IGNvbnN0IENFTlRFUkVEX1BPU0lUSU9OX0NPTkZJRzogUG9zaXRpb25Db25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBQb3NpdGlvbkNvbnRyb2xsZXIge1xuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGdldFBvc2l0aW9uIG1ldGhvZCB0byBhbHdheXMgcmV0dXJuIHRoZSB7QGxpbmsgREVGQVVMVF9QT1NJVElPTn1cbiAgICAgKlxuICAgICAqIFdlIGFjdHVhbGx5IGRvbid0IGNhcmUgYWJvdXQgdGhlIHBvc2l0aW9uLCBiZWNhdXNlIHdlIGFyZSBnb2luZyB0byB1c2Ugdmlld3BvcnQgcmVsYXRpdmVcbiAgICAgKiBDU1MgdW5pdHMgdG8gcG9zaXRpb24gdGhlIGVsZW1lbnQuIEFmdGVyIHRoZSBmaXJzdCBjYWxjdWxhdGlvbiBvZiB0aGUgcG9zaXRpb24sIGl0J3NcbiAgICAgKiBuZXZlciBnb2luZyB0byBjaGFuZ2UgYW5kIGFwcGx5UG9zaXRpb24gd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlLiBUaGlzIG1ha2VzIHRoaXNcbiAgICAgKiBwb3NpdGlvbiBjb250cm9sbGVyIHJlYWxseSBjaGVhcC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UG9zaXRpb24gKCk6IFBvc2l0aW9uIHtcblxuICAgICAgICByZXR1cm4gREVGQVVMVF9QT1NJVElPTjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSBvdmVycmlkZSB0aGUgYXBwbHlQb3NpdGlvbiBtZXRob2QgdG8gY2VudGVyIHRoZSBlbGVtZW50IHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydFxuICAgICAqIGRpbWVuc2lvbnMgYW5kIGl0cyBvd24gc2l6ZS4gVGhpcyBzdHlsZSBoYXMgdG8gYmUgYXBwbGllZCBvbmx5IG9uY2UgYW5kIGlzIHJlc3BvbnNpdmVcbiAgICAgKiBieSBkZWZhdWx0LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRvcCA9ICc1MHZoJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gJzUwdncnO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKC01MCUsIC01MCUpYDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbi1jb250cm9sbGVyJztcblxuZXhwb3J0IGNvbnN0IENPTk5FQ1RFRF9QT1NJVElPTl9DT05GSUc6IFBvc2l0aW9uQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIG1pbldpZHRoOiAnb3JpZ2luJyxcbiAgICBtaW5IZWlnaHQ6ICdvcmlnaW4nLFxuICAgIGFsaWdubWVudDoge1xuICAgICAgICBvcmlnaW46IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2VuZCdcbiAgICAgICAgfSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICAgICAgdmVydGljYWw6ICdzdGFydCdcbiAgICAgICAgfSxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICAgICAgdmVydGljYWw6IDAsXG4gICAgICAgIH0sXG4gICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIENvbm5lY3RlZFBvc2l0aW9uQ29udHJvbGxlciBleHRlbmRzIFBvc2l0aW9uQ29udHJvbGxlciB7XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCFzdXBlci5hdHRhY2goZWxlbWVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih3aW5kb3csICdyZXNpemUnLCAoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubGlzdGVuKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCksIHRydWUpO1xuXG4gICAgICAgIC8vIFRPRE86IGFkZCBjb250ZW5kLWNoYW5nZWQgZXZlbnQgdG8gb3ZlcmxheSB2aWEgTXV0YXRpb25PYnNlcnZlclxuICAgICAgICAvLyBhbmQgdXBkYXRlIHBvc2l0aW9uIHdoZW4gY29udGVudCBjaGFuZ2VzXG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kLCBzbyB3ZSBjYW4gdXNlIGEgQ1NTIHRyYW5zZm9ybSB0byBwb3NpdGlvbiB0aGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FuIHJlc3VsdCBpbiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICovXG4gICAgLy8gcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgLy8gICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgLy8gICAgIHRoaXMuZWxlbWVudCEuc3R5bGUudG9wID0gJyc7XG4gICAgLy8gICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubGVmdCA9ICcnO1xuICAgIC8vICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgLy8gICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAvLyAgICAgLy8gdGhpcy5lbGVtZW50IS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi54KSB9LCAkeyB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueSkgfSlgO1xuICAgIC8vIH1cbn1cbiIsImltcG9ydCB7IEJlaGF2aW9yRmFjdG9yeSwgQmVoYXZpb3JNYXAsIENvbmZpZ3VyYXRpb25NYXAgfSBmcm9tICcuLi9iZWhhdmlvci9iZWhhdmlvci1mYWN0b3J5JztcbmltcG9ydCB7IENlbnRlcmVkUG9zaXRpb25Db250cm9sbGVyLCBDRU5URVJFRF9QT1NJVElPTl9DT05GSUcgfSBmcm9tICcuL2NvbnRyb2xsZXIvY2VudGVyZWQtcG9zaXRpb24tY29udHJvbGxlcic7XG5pbXBvcnQgeyBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIsIENPTk5FQ1RFRF9QT1NJVElPTl9DT05GSUcgfSBmcm9tICcuL2NvbnRyb2xsZXIvY29ubmVjdGVkLXBvc2l0aW9uLWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb25Db250cm9sbGVyIH0gZnJvbSAnLi9wb3NpdGlvbi1jb250cm9sbGVyJztcblxuZXhwb3J0IHR5cGUgUG9zaXRpb25UeXBlcyA9ICdkZWZhdWx0JyB8ICdjZW50ZXJlZCcgfCAnY29ubmVjdGVkJztcblxuZXhwb3J0IGNvbnN0IFBPU0lUSU9OX0NPTlRST0xMRVJTOiBCZWhhdmlvck1hcDxQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uVHlwZXM+ID0ge1xuICAgIGRlZmF1bHQ6IFBvc2l0aW9uQ29udHJvbGxlcixcbiAgICBjZW50ZXJlZDogQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIsXG4gICAgY29ubmVjdGVkOiBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIsXG59XG5cbmV4cG9ydCBjb25zdCBQT1NJVElPTl9DT05GSUdVUkFUSU9OUzogQ29uZmlndXJhdGlvbk1hcDxQb3NpdGlvbkNvbmZpZywgUG9zaXRpb25UeXBlcz4gPSB7XG4gICAgZGVmYXVsdDogREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG4gICAgY2VudGVyZWQ6IENFTlRFUkVEX1BPU0lUSU9OX0NPTkZJRyxcbiAgICBjb25uZWN0ZWQ6IENPTk5FQ1RFRF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSBleHRlbmRzIEJlaGF2aW9yRmFjdG9yeTxQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uQ29uZmlnLCBQb3NpdGlvblR5cGVzPiB7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBiZWhhdmlvcnMgPSBQT1NJVElPTl9DT05UUk9MTEVSUyxcbiAgICAgICAgcHJvdGVjdGVkIGNvbmZpZ3VyYXRpb25zID0gUE9TSVRJT05fQ09ORklHVVJBVElPTlMsXG4gICAgKSB7XG5cbiAgICAgICAgc3VwZXIoYmVoYXZpb3JzLCBjb25maWd1cmF0aW9ucyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICcuLi9iZWhhdmlvcic7XG5pbXBvcnQgeyBUZW1wbGF0ZUNvbmZpZyB9IGZyb20gJy4vdGVtcGxhdGUtY29uZmlnJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJ2xpdC1odG1sJztcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQ29udHJvbGxlciBleHRlbmRzIEJlaGF2aW9yIHtcblxuICAgIGNvbnN0cnVjdG9yIChwcm90ZWN0ZWQgY29uZmlnOiBUZW1wbGF0ZUNvbmZpZykge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnRlbXBsYXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNvbmZpZy5jb250ZXh0ID8/IHRoaXMuZWxlbWVudCE7XG5cbiAgICAgICAgICAgIHRoaXMubGlzdGVuKGNvbnRleHQsICd1cGRhdGUnLCAoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnRlbXBsYXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5jb25maWcudGVtcGxhdGU7XG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb25maWcuY29udGV4dCA/PyB0aGlzLmVsZW1lbnQhO1xuXG4gICAgICAgICAgICByZW5kZXIodGVtcGxhdGUoY29udGV4dCksIHRoaXMuZWxlbWVudCEsIHsgZXZlbnRDb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgcHJvcGVydHksIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3JPYmplY3QgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgQ29uc3RydWN0b3IgfSBmcm9tICcuLi9taXhpbnMvY29uc3RydWN0b3InO1xuaW1wb3J0IHsgQWxpZ25tZW50UGFpciwgUG9zaXRpb24sIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuaW1wb3J0IHsgVGVtcGxhdGVDb25maWcsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tICcuLi90ZW1wbGF0ZSc7XG5pbXBvcnQgeyBPdmVybGF5VHJpZ2dlckNvbmZpZyB9IGZyb20gJy4vdHJpZ2dlcic7XG5cbmV4cG9ydCB0eXBlIE92ZXJsYXlDb25maWcgPSBQb3NpdGlvbkNvbmZpZyAmIE92ZXJsYXlUcmlnZ2VyQ29uZmlnICYgVGVtcGxhdGVDb25maWcgJiB7XG4gICAgcG9zaXRpb25UeXBlOiBzdHJpbmc7XG4gICAgdHJpZ2dlclR5cGU6IHN0cmluZztcbiAgICB0cmlnZ2VyPzogSFRNTEVsZW1lbnQ7XG4gICAgc3RhY2tlZDogYm9vbGVhbjtcbiAgICBiYWNrZHJvcDogYm9vbGVhbjtcbiAgICBjbG9zZU9uQmFja2Ryb3BDbGljazogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfT1ZFUkxBWV9DT05GSUc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7XG4gICAgcG9zaXRpb25UeXBlOiAnZGVmYXVsdCcsXG4gICAgdHJpZ2dlclR5cGU6ICdkZWZhdWx0JyxcbiAgICB0cmlnZ2VyOiB1bmRlZmluZWQsXG4gICAgc3RhY2tlZDogdHJ1ZSxcbiAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICBjbG9zZU9uQmFja2Ryb3BDbGljazogdHJ1ZSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGFzT3ZlcmxheUNvbmZpZyBleHRlbmRzIE92ZXJsYXlDb25maWcge1xuXG4gICAgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTWl4aW5PdmVybGF5Q29uZmlnPFQgZXh0ZW5kcyB0eXBlb2YgQ29tcG9uZW50PiAoQmFzZTogVCwgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0ge30pOiBUICYgQ29uc3RydWN0b3I8SGFzT3ZlcmxheUNvbmZpZz4ge1xuXG4gICAgQGNvbXBvbmVudCh7IGRlZmluZTogZmFsc2UgfSlcbiAgICBjbGFzcyBCYXNlSGFzT3ZlcmxheUNvbmZpZyBleHRlbmRzIEJhc2UgaW1wbGVtZW50cyBPdmVybGF5Q29uZmlnIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG92ZXJsYXkncyBjb25maWd1cmF0aW9uXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZW1hcmtzXG4gICAgICAgICAqIEluaXRpYWxseSBfY29uZmlnIG9ubHkgY29udGFpbnMgYSBwYXJ0aWFsIE92ZXJsYXlDb25maWcsIGJ1dCBvbmNlIHRoZSBvdmVybGF5IGluc3RhbmNlIGhhcyBiZWVuXG4gICAgICAgICAqIHJlZ2lzdGVyZWQsIF9jb25maWcgd2lsbCBiZSBhIGZ1bGwgT3ZlcmxheUNvbmZpZy4gVGhpcyBpcyB0byBhbGxvdyB0aGUgQmVoYXZpb3JGYWN0b3JpZXMgZm9yXG4gICAgICAgICAqIHBvc2l0aW9uIGFuZCB0cmlnZ2VyIHRvIGFwcGx5IHRoZWlyIGRlZmF1bHQgY29uZmlndXJhdGlvbiwgYmFzZWQgb24gdGhlIGJlaGF2aW9yIHR5cGUgd2hpY2ggaXNcbiAgICAgICAgICogY3JlYXRlZCBieSB0aGUgZmFjdG9yaWVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAaW50ZXJuYWxcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBfY29uZmlnOiBPdmVybGF5Q29uZmlnID0geyAuLi5ERUZBVUxUX09WRVJMQVlfQ09ORklHLCAuLi5jb25maWcgfSBhcyBPdmVybGF5Q29uZmlnO1xuXG4gICAgICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlLFxuICAgICAgICAgICAgb2JzZXJ2ZTogUHJvcGVydHlDaGFuZ2VEZXRlY3Rvck9iamVjdCxcbiAgICAgICAgfSlcbiAgICAgICAgc2V0IGNvbmZpZyAodmFsdWU6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogc2V0dGluZyBjb25maWcgY3JlYXRlcyBhIG5ldyBvYmplY3QgZWFjaCB0aW1lID09PiBuZWVkIHRvIHN5bmMgd2l0aCBiZWhhdmlvcnNcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4udGhpcy5fY29uZmlnLCAuLi52YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCBjb25maWcgKCk6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4ge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8ge0BsaW5rIE92ZXJsYXlDb25maWd9IHByb3BlcnRpZXNcbiAgICAgICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgICBAcHJvcGVydHkoeyBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyB9KVxuICAgICAgICBzZXQgdHJpZ2dlclR5cGUgKHZhbHVlOiBzdHJpbmcpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IHRyaWdnZXJUeXBlOiB2YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCB0cmlnZ2VyVHlwZSAoKTogc3RyaW5nIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy50cmlnZ2VyVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nIH0pXG4gICAgICAgIHNldCBwb3NpdGlvblR5cGUgKHZhbHVlOiBzdHJpbmcpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IHBvc2l0aW9uVHlwZTogdmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcG9zaXRpb25UeXBlICgpOiBzdHJpbmcge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLnBvc2l0aW9uVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IHRyaWdnZXIgKHZhbHVlOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgdHJpZ2dlcjogdmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgdHJpZ2dlciAoKTogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLnRyaWdnZXI7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCB0ZW1wbGF0ZSAodmFsdWU6IFRlbXBsYXRlRnVuY3Rpb24gfCB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IHRlbXBsYXRlOiB2YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCB0ZW1wbGF0ZSAoKTogVGVtcGxhdGVGdW5jdGlvbiB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWcudGVtcGxhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCBjb250ZXh0ICh2YWx1ZTogQ29tcG9uZW50IHwgdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0geyBjb250ZXh0OiB2YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCBjb250ZXh0ICgpOiBDb21wb25lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLmNvbnRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCBzdGFja2VkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgc3RhY2tlZDogdmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgc3RhY2tlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWcuc3RhY2tlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IGJhY2tkcm9wICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgYmFja2Ryb3A6IHZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGJhY2tkcm9wICgpOiBib29sZWFuIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5iYWNrZHJvcDtcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IGNsb3NlT25CYWNrZHJvcENsaWNrICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IHZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNsb3NlT25CYWNrZHJvcENsaWNrICgpOiBib29sZWFuIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5jbG9zZU9uQmFja2Ryb3BDbGljaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyB7QGxpbmsgUG9zaXRpb25Db25maWd9IHByb3BlcnRpZXNcbiAgICAgICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgICAgICBzZXQgb3JpZ2luICh2YWx1ZTogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8ICd2aWV3cG9ydCcpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IG9yaWdpbjogdmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgb3JpZ2luICgpOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgJ3ZpZXdwb3J0JyB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWcub3JpZ2luO1xuICAgICAgICB9XG5cbiAgICAgICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgICAgICBzZXQgd2lkdGggKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IHdpZHRoOiB2YWx1ZSB9O1xuICAgICAgICB9O1xuICAgICAgICBnZXQgd2lkdGggKCk6IHN0cmluZyB8IG51bWJlciB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWcud2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCBoZWlnaHQgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IGhlaWdodDogdmFsdWUgfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2V0IGhlaWdodCAoKTogc3RyaW5nIHwgbnVtYmVyIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCBtYXhXaWR0aCAodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgbWF4V2lkdGg6IHZhbHVlIH07XG4gICAgICAgIH07XG4gICAgICAgIGdldCBtYXhXaWR0aCAoKTogc3RyaW5nIHwgbnVtYmVyIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5tYXhXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IG1heEhlaWdodCAodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgbWF4SGVpZ2h0OiB2YWx1ZSB9O1xuICAgICAgICB9O1xuICAgICAgICBnZXQgbWF4SGVpZ2h0ICgpOiBzdHJpbmcgfCBudW1iZXIge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLm1heEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IG1pbldpZHRoICh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0geyBtaW5XaWR0aDogdmFsdWUgfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2V0IG1pbldpZHRoICgpOiBzdHJpbmcgfCBudW1iZXIge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLm1pbldpZHRoO1xuXG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCBtaW5IZWlnaHQgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IG1pbkhlaWdodDogdmFsdWUgfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2V0IG1pbkhlaWdodCAoKTogc3RyaW5nIHwgbnVtYmVyIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5taW5IZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoe1xuICAgICAgICAgICAgYXR0cmlidXRlOiBmYWxzZSxcbiAgICAgICAgICAgIG9ic2VydmU6IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3JPYmplY3RcbiAgICAgICAgfSlcbiAgICAgICAgc2V0IGFsaWdubWVudCAodmFsdWU6IEFsaWdubWVudFBhaXIpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IGFsaWdubWVudDogeyAuLi50aGlzLl9jb25maWcuYWxpZ25tZW50LCAuLi52YWx1ZSB9IH07XG4gICAgICAgIH07XG4gICAgICAgIGdldCBhbGlnbm1lbnQgKCk6IEFsaWdubWVudFBhaXIge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLmFsaWdubWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyB7QGxpbmsgT3ZlcmxheVRyaWdnZXJDb25maWd9IHByb3BlcnRpZXNcbiAgICAgICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgICAgICBzZXQgYXV0b0ZvY3VzICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgYXV0b0ZvY3VzOiB2YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCBhdXRvRm9jdXMgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLmF1dG9Gb2N1cztcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IHRyYXBGb2N1cyAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IHRyYXBGb2N1czogdmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgdHJhcEZvY3VzICgpOiBib29sZWFuIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy50cmFwRm9jdXM7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCB3cmFwRm9jdXMgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0geyB3cmFwRm9jdXM6IHZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHdyYXBGb2N1cyAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWcud3JhcEZvY3VzO1xuICAgICAgICB9XG5cbiAgICAgICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgICAgICBzZXQgcmVzdG9yZUZvY3VzICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHsgcmVzdG9yZUZvY3VzOiB2YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCByZXN0b3JlRm9jdXMgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLnJlc3RvcmVGb2N1cztcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IGNsb3NlT25Fc2NhcGUgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0geyBjbG9zZU9uRXNjYXBlOiB2YWx1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGdldCBjbG9zZU9uRXNjYXBlICgpOiBib29sZWFuIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5jbG9zZU9uRXNjYXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSB9KVxuICAgICAgICBzZXQgY2xvc2VPbkZvY3VzTG9zcyAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IGNsb3NlT25Gb2N1c0xvc3M6IHZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNsb3NlT25Gb2N1c0xvc3MgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLmNsb3NlT25Gb2N1c0xvc3M7XG4gICAgICAgIH1cblxuICAgICAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgICAgIHNldCBpbml0aWFsRm9jdXMgKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IGluaXRpYWxGb2N1czogdmFsdWUgfTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgaW5pdGlhbEZvY3VzICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnLmluaXRpYWxGb2N1cztcbiAgICAgICAgfVxuXG4gICAgICAgIEBwcm9wZXJ0eSh7IGF0dHJpYnV0ZTogZmFsc2UgfSlcbiAgICAgICAgc2V0IHRhYmJhYmxlU2VsZWN0b3IgKHZhbHVlOiBzdHJpbmcpIHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7IHRhYmJhYmxlU2VsZWN0b3I6IHZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHRhYmJhYmxlU2VsZWN0b3IgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWcudGFiYmFibGVTZWxlY3RvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBCYXNlSGFzT3ZlcmxheUNvbmZpZztcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUV2ZW50TmFtZSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9jdXNDaGFuZ2VFdmVudERldGFpbCB7XG4gICAgaGFzRm9jdXM6IGJvb2xlYW47XG4gICAgdGFyZ2V0OiBIVE1MRWxlbWVudDtcbiAgICByZWxhdGVkVGFyZ2V0PzogSFRNTEVsZW1lbnQ7XG59XG5cbmV4cG9ydCBjb25zdCBGT0NVU19DSEFOR0VfRVZFTlRfSU5JVDogRXZlbnRJbml0ID0ge1xuICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICBjb21wb3NlZDogdHJ1ZSxcbn07XG5cbi8qKlxuICogVGhlIEZvY3VzQ2hhbmdlRXZlbnRcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIEZvY3VzQ2hhbmdlRXZlbnQgaXMgZGlzcGF0Y2hlZCBieSB0aGUge0BsaW5rIEZvY3VzTW9uaXRvcn0gKmFmdGVyKiB0aGUgZm9jdXMgc3RhdGUgb2YgdGhlXG4gKiBtb25pdG9yZWQgZWxlbWVudCBoYXMgY2hhbmdlZC4gVGhpcyBtZWFucywgY2FsbGluZyB7QGxpbmsgYWN0aXZlRWxlbWVudH0gaW4gYW4gZXZlbnQgaGFuZGxlclxuICogYXR0YWNoZWQgdG8gdGhpcyBldmVudCB3aWxsIHJldHVybiB0aGUgYWN0aXZlIGVsZW1lbnQgYWZ0ZXIgdGhlIGZvY3VzIGNoYW5nZS4gVGhpcyBpcyBkaWZmZXJlbnRcbiAqIHRvIGZvY3VzaW4vZm9jdXNvdXQuIEFkZGl0aW9uYWxseSwgRm9jdXNDaGFuZ2VFdmVudCBpcyBvbmx5IHRyaWdnZXJlZCwgd2hlbiB0aGUgZm9jdXMgbW92ZXMgaW50b1xuICogdGhlIG1vbml0b3JlZCBlbGVtZW50IG9yIG91dCBvZiB0aGUgbW9uaXRvcmVkIGVsZW1lbnQsIGJ1dCBub3Qgd2hlbiB0aGUgZm9jdXMgbW92ZXMgd2l0aGluIHRoZVxuICogbW9uaXRvcmVkIGVsZW1lbnQuIEZvY3VzQ2hhbmdlRXZlbnQgYnViYmxlcyB1cCB0aGUgRE9NLlxuICovXG5leHBvcnQgY2xhc3MgRm9jdXNDaGFuZ2VFdmVudCBleHRlbmRzIEN1c3RvbUV2ZW50PEZvY3VzQ2hhbmdlRXZlbnREZXRhaWw+IHtcblxuICAgIGNvbnN0cnVjdG9yIChkZXRhaWw6IEZvY3VzQ2hhbmdlRXZlbnREZXRhaWwsIGluaXQ6IEV2ZW50SW5pdCA9IHt9KSB7XG5cbiAgICAgICAgY29uc3QgdHlwZSA9IGNyZWF0ZUV2ZW50TmFtZSgnZm9jdXMnLCAnJywgJ2NoYW5nZWQnKTtcblxuICAgICAgICBjb25zdCBldmVudEluaXQ6IEN1c3RvbUV2ZW50SW5pdDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPiA9IHtcbiAgICAgICAgICAgIC4uLkZPQ1VTX0NIQU5HRV9FVkVOVF9JTklULFxuICAgICAgICAgICAgLi4uaW5pdCxcbiAgICAgICAgICAgIGRldGFpbCxcbiAgICAgICAgfTtcblxuICAgICAgICBzdXBlcih0eXBlLCBldmVudEluaXQpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IG1hY3JvVGFzayB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudC90YXNrcyc7XG5pbXBvcnQgeyBCZWhhdmlvciB9IGZyb20gJy4uL2JlaGF2aW9yL2JlaGF2aW9yJztcbmltcG9ydCB7IGFjdGl2ZUVsZW1lbnQgfSBmcm9tICcuLi9kb20nO1xuaW1wb3J0IHsgY2FuY2VsIH0gZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCB7IEZvY3VzQ2hhbmdlRXZlbnQgfSBmcm9tICcuL2ZvY3VzLWNoYW5nZS1ldmVudCc7XG5cbi8qKlxuICogVGhlIEZvY3VzTW9uaXRvciBiZWhhdmlvclxuICpcbiAqIEByZW1hcmtzXG4gKiBUaGUgRm9jdXNNb25pdG9yIGJlaGF2aW9yIGNhbiBiZSBhdHRhY2hlZCB0byBhbiBlbGVtZW50IHRvIG1vbml0b3IgdGhlIGZvY3VzIHN0YXRlXG4gKiBvZiB0aGUgZWxlbWVudCBhbmQgaXRzIGRlc2NlbmRhbnRzLiBJdCBkaXNwYXRjaGVzIGEge0BsaW5rIEZvY3VzQ2hhbmdlRXZlbnR9IGlmXG4gKiB0aGUgZm9jdXMgaXMgbW92ZWQgaW50byB0aGUgZWxlbWVudCAob3Igb25lIG9mIGl0cyBkZXNjZW5kYW50cykgb3IgaWYgdGhlIGZvY3VzXG4gKiBtb3ZlcyBvdXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBGb2N1c01vbml0b3IgZXh0ZW5kcyBCZWhhdmlvciB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcHJldmlvdXMgZm9jdXMgc3RhdGUgKHdoZW4gdGhlIGxhc3QgRm9jdXNDaGFuZ2VFdmVudCB3YXMgZGlzcGF0Y2hlZClcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGFkRm9jdXM/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgZm9jdXMgc3RhdGVcbiAgICAgKi9cbiAgICBoYXNGb2N1cyA9IGZhbHNlO1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSBmb2N1c1xuICAgICAgICB0aGlzLmhhc0ZvY3VzID0gdGhpcy5lbGVtZW50IS5jb250YWlucyhhY3RpdmVFbGVtZW50KCkpO1xuXG4gICAgICAgIC8vIGF0dGFjaCBldmVudCBoYW5kbGVyc1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXNpbicsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNJbihldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdmb2N1c291dCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNPdXQoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0luIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLmhhc0ZvY3VzID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gc2NoZWR1bGUgdG8gZGlzcGF0Y2ggYSBmb2N1cy1jaGFuZ2VkIGV2ZW50IGluIHRoZSBuZXh0IG1hY3JvLXRhc2sgdG8gbWFrZVxuICAgICAgICAgICAgLy8gc3VyZSBpdCBpcyBkaXNwYXRjaGVkIGFmdGVyIHRoZSBmb2N1cyBoYXMgbW92ZWRcbiAgICAgICAgICAgIC8vIHdlIGFsc28gY2hlY2sgdGhhdCBmb2N1cyBzdGF0ZSBoYXNuJ3QgY2hhbmdlZCB1bnRpbCB0aGUgbWFjcm8tdGFza1xuICAgICAgICAgICAgbWFjcm9UYXNrKCgpID0+IHRoaXMuaGFzRm9jdXMgJiYgdGhpcy5ub3RpZnlGb2N1c0NoYW5nZShldmVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcCB0aGUgb3JpZ2luYWwgZm9jdXNpbiBldmVudCBmcm9tIGJ1YmJsaW5nIHVwIHRoZSBET00gYW5kIGVuZGluZyB1cCBpbiBhIHBhcmVudFxuICAgICAgICAvLyBjb21wb25lbnQncyBmb2N1cyBtb25pdG9yXG4gICAgICAgIGNhbmNlbChldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUZvY3VzT3V0IChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0ZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gc2NoZWR1bGUgdG8gZGlzcGF0Y2ggYSBmb2N1cy1jaGFuZ2VkIGV2ZW50IGluIHRoZSBuZXh0IG1hY3JvLXRhc2sgdG8gbWFrZVxuICAgICAgICAgICAgLy8gc3VyZSBpdCBpcyBkaXNwYXRjaGVkIGFmdGVyIHRoZSBmb2N1cyBoYXMgbW92ZWRcbiAgICAgICAgICAgIC8vIHdlIGFsc28gY2hlY2sgdGhhdCBmb2N1cyBzdGF0ZSBoYXNuJ3QgY2hhbmdlZCB1bnRpbCB0aGUgbWFjcm8tdGFza1xuICAgICAgICAgICAgbWFjcm9UYXNrKCgpID0+ICF0aGlzLmhhc0ZvY3VzICYmIHRoaXMubm90aWZ5Rm9jdXNDaGFuZ2UoZXZlbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3AgdGhlIG9yaWdpbmFsIGZvY3Vzb3V0IGV2ZW50IGZyb20gYnViYmxpbmcgdXAgdGhlIERPTSBhbmQgZW5kaW5nIHVwIGluIGEgcGFyZW50XG4gICAgICAgIC8vIGNvbXBvbmVudCdzIGZvY3VzIG1vbml0b3JcbiAgICAgICAgY2FuY2VsKGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbm90aWZ5Rm9jdXNDaGFuZ2UgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIGRpc3BhdGNoIGFuIGV2ZW50IGlmIG91ciBjdXJyZW50IGZvY3VzIHN0YXRlIGlzIGRpZmZlcmVudFxuICAgICAgICAvLyB0aGFuIHRoZSBsYXN0IHRpbWUgd2UgZGlzcGF0Y2hlZCBhbiBldmVudCAtIHRoaXMgZmlsdGVycyBvdXQgY2FzZXMgd2hlcmVcbiAgICAgICAgLy8gd2UgaGF2ZSBhIGNvbnNlY3V0aXZlIGZvY3Vzb3V0L2ZvY3VzaW4gZXZlbnQgd2hlbiB0aGUgZm9jdXMgbW92ZXMgd2l0aGluXG4gICAgICAgIC8vIHRoZSBtb25pdG9yZWQgZWxlbWVudCAod2UgZG9uJ3Qgd2FudCB0byBub3RpZnkgaWYgZm9jdXMgY2hhbmdlcyB3aXRoaW4pXG4gICAgICAgIGlmICh0aGlzLmhhc0ZvY3VzICE9PSB0aGlzLmhhZEZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFkRm9jdXMgPSB0aGlzLmhhc0ZvY3VzO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoKG5ldyBGb2N1c0NoYW5nZUV2ZW50KHtcbiAgICAgICAgICAgICAgICBoYXNGb2N1czogdGhpcy5oYXNGb2N1cyxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMuZWxlbWVudCBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgICAgICByZWxhdGVkVGFyZ2V0OiBldmVudC5yZWxhdGVkVGFyZ2V0IGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ1NTU2VsZWN0b3IgfSBmcm9tICcuLi9kb20nO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBGb2N1c01vbml0b3IgfSBmcm9tICcuL2ZvY3VzLW1vbml0b3InO1xuaW1wb3J0IHsgYXBwbHlEZWZhdWx0cyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbi8qKlxuICogQSBDU1Mgc2VsZWN0b3IgZm9yIG1hdGNoaW5nIGVsZW1lbnRzIHdoaWNoIGFyZSBub3QgZGlzYWJsZWQgb3IgcmVtb3ZlZCBmcm9tIHRoZSB0YWIgb3JkZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IElOVEVSQUNUSVZFID0gJzpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKSc7XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgQ1NTIHNlbGVjdG9ycyB0byBtYXRjaCBnZW5lcmFsbHkgdGFiYmFibGUgZWxlbWVudHNcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IEVMRU1FTlRTID0gW1xuICAgICdhW2hyZWZdJyxcbiAgICAnYXJlYVtocmVmXScsXG4gICAgJ2J1dHRvbicsXG4gICAgJ2lucHV0JyxcbiAgICAnc2VsZWN0JyxcbiAgICAndGV4dGFyZWEnLFxuICAgICdpZnJhbWUnLFxuICAgICdbY29udGVudEVkaXRhYmxlXScsXG4gICAgJ1t0YWJpbmRleF0nLFxuXTtcblxuLyoqXG4gKiBBbiBhcnJheSBvZiBDU1Mgc2VsZWN0b3JzIHRvIG1hdGNoIGludGVyYWN0aXZlLCB0YWJiYWJsZSBlbGVtZW50c1xuICovXG5leHBvcnQgY29uc3QgVEFCQkFCTEVTID0gRUxFTUVOVFMubWFwKEVMRU1FTlQgPT4gYCR7IEVMRU1FTlQgfSR7IElOVEVSQUNUSVZFIH1gKTtcblxuLyoqXG4gKiBUaGUge0BsaW5rIEZvY3VzVHJhcH0gY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGb2N1c1RyYXBDb25maWcge1xuICAgIHRhYmJhYmxlU2VsZWN0b3I6IENTU1NlbGVjdG9yO1xuICAgIHdyYXBGb2N1czogYm9vbGVhbjtcbiAgICBhdXRvRm9jdXM6IGJvb2xlYW47XG4gICAgcmVzdG9yZUZvY3VzOiBib29sZWFuO1xuICAgIGluaXRpYWxGb2N1cz86IENTU1NlbGVjdG9yO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBGb2N1c1RyYXB9IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUc6IEZvY3VzVHJhcENvbmZpZyA9IHtcbiAgICB0YWJiYWJsZVNlbGVjdG9yOiBUQUJCQUJMRVMuam9pbignLCcpLFxuICAgIHdyYXBGb2N1czogdHJ1ZSxcbiAgICBhdXRvRm9jdXM6IHRydWUsXG4gICAgcmVzdG9yZUZvY3VzOiB0cnVlLFxufTtcblxuLyoqXG4gKiBUaGUgRm9jdXNUcmFwIGJlaGF2aW9yXG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSBGb2N1c1RyYXAgYmVoYXZpb3IgZXh0ZW5kcyB0aGUge0BsaW5rIEZvY3VzTW9uaXRvcn0gYmVoYXZpb3IgYW5kIGFkZHMgYWRkaXRpb25hbFxuICogZnVuY3Rpb25hbGl0eSB0byBpdCwgbGlrZSB0cmFwcGluZyB0aGUgZm9jdXMgaW4gdGhlIG1vbml0b3JlZCBlbGVtZW50LCBhdXRvIHdyYXBwaW5nXG4gKiB0aGUgZm9jdXMgb3JkZXIsIGFzIHdlbGwgYXMgYXV0by1mb2N1cyBhbmQgcmVzdG9yZS1mb2N1cy4gVGhlIGJlaGF2aW9yIG9mIHRoZVxuICogRm9jdXNUcmFwIGNhbiBiZSBkZWZpbmVkIHRocm91Z2ggYSB7QGxpbmsgRm9jdXNUcmFwQ29uZmlnfS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvY3VzVHJhcCBleHRlbmRzIEZvY3VzTW9uaXRvciB7XG5cbiAgICBwcm90ZWN0ZWQgdGFiYmFibGVzITogTm9kZUxpc3RPZjxIVE1MRWxlbWVudD47XG5cbiAgICBwcm90ZWN0ZWQgc3RhcnQhOiBIVE1MRWxlbWVudDtcblxuICAgIHByb3RlY3RlZCBlbmQhOiBIVE1MRWxlbWVudDtcblxuICAgIHByb3RlY3RlZCBjb25maWc6IEZvY3VzVHJhcENvbmZpZztcblxuICAgIGNvbnN0cnVjdG9yIChjb25maWc/OiBQYXJ0aWFsPEZvY3VzVHJhcENvbmZpZz4pIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuY29uZmlnID0gYXBwbHlEZWZhdWx0cyhjb25maWcgfHwge30sIERFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUcpO1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2tleWRvd24nLCAoKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLmhhbmRsZUtleURvd24oZXZlbnQpKSBhcyBFdmVudExpc3RlbmVyKTtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuYXV0b0ZvY3VzKSB0aGlzLmZvY3VzSW5pdGlhbCgpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZvY3VzSW5pdGlhbCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmluaXRpYWxGb2N1cykge1xuXG4gICAgICAgICAgICBjb25zdCBpbml0aWFsRm9jdXMgPSB0aGlzLmVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHRoaXMuY29uZmlnLmluaXRpYWxGb2N1cyk7XG5cbiAgICAgICAgICAgIGlmIChpbml0aWFsRm9jdXMpIHtcblxuICAgICAgICAgICAgICAgIGluaXRpYWxGb2N1cy5mb2N1cygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm9jdXNUcmFwIGNvdWxkIG5vdCBmaW5kIGluaXRpYWxGb2N1cyBlbGVtZW50IHNlbGVjdG9yICR7IHRoaXMuY29uZmlnLmluaXRpYWxGb2N1cyB9LiBQb3NzaWJsZSBlcnJvciBpbiBGb2N1c1RyYXBDb25maWcuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZvY3VzRmlyc3QoKTtcbiAgICB9XG5cbiAgICBmb2N1c0ZpcnN0ICgpIHtcblxuICAgICAgICB0aGlzLnN0YXJ0LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgZm9jdXNMYXN0ICgpIHtcblxuICAgICAgICB0aGlzLmVuZC5mb2N1cygpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy50YWJiYWJsZXMgPSB0aGlzLmVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5jb25maWcudGFiYmFibGVTZWxlY3Rvcik7XG5cbiAgICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy50YWJiYWJsZXMubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuc3RhcnQgPSBsZW5ndGhcbiAgICAgICAgICAgID8gdGhpcy50YWJiYWJsZXMuaXRlbSgwKVxuICAgICAgICAgICAgOiB0aGlzLmVsZW1lbnQhO1xuXG4gICAgICAgIHRoaXMuZW5kID0gbGVuZ3RoXG4gICAgICAgICAgICA/IHRoaXMudGFiYmFibGVzLml0ZW0obGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIDogdGhpcy5lbGVtZW50ITtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIFRhYjpcblxuICAgICAgICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSAmJiBldmVudC50YXJnZXQgPT09IHRoaXMuc3RhcnQpIHtcblxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy53cmFwRm9jdXMpIHRoaXMuZm9jdXNMYXN0KCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFldmVudC5zaGlmdEtleSAmJiBldmVudC50YXJnZXQgPT09IHRoaXMuZW5kKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcud3JhcEZvY3VzKSB0aGlzLmZvY3VzRmlyc3QoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgbWFjcm9UYXNrIH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50L3Rhc2tzJztcbmltcG9ydCB7IEJlaGF2aW9yIH0gZnJvbSAnLi4vLi4vYmVoYXZpb3InO1xuaW1wb3J0IHsgYWN0aXZlRWxlbWVudCB9IGZyb20gJy4uLy4uL2RvbSc7XG5pbXBvcnQgeyBjYW5jZWwgfSBmcm9tICcuLi8uLi9ldmVudHMnO1xuaW1wb3J0IHsgRm9jdXNDaGFuZ2VFdmVudCwgRm9jdXNNb25pdG9yLCBGb2N1c1RyYXAgfSBmcm9tICcuLi8uLi9mb2N1cyc7XG5pbXBvcnQgeyBFc2NhcGUgfSBmcm9tICcuLi8uLi9rZXlzJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuLi9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIHByZXZpb3VzRm9jdXM6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblxuICAgIHByb3RlY3RlZCBmb2N1c0JlaGF2aW9yPzogRm9jdXNNb25pdG9yO1xuXG4gICAgY29uc3RydWN0b3IgKHByb3RlY3RlZCBjb25maWc6IE92ZXJsYXlUcmlnZ2VyQ29uZmlnLCBwdWJsaWMgb3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5mb2N1c0JlaGF2aW9yID0gdGhpcy5jb25maWcudHJhcEZvY3VzXG4gICAgICAgICAgICA/IG5ldyBGb2N1c1RyYXAodGhpcy5jb25maWcpXG4gICAgICAgICAgICA6IG5ldyBGb2N1c01vbml0b3IoKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnb3Blbi1jaGFuZ2VkJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVPcGVuQ2hhbmdlKGV2ZW50IGFzIFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnZm9jdXMtY2hhbmdlZCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNDaGFuZ2UoZXZlbnQgYXMgRm9jdXNDaGFuZ2VFdmVudCkpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2tleWRvd24nLCBldmVudCA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuQ2hhbmdlIChldmVudDogUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikge1xuXG4gICAgICAgIC8vIGlmIGl0J3MgYW4gZXZlbnQgYnViYmxpbmcgdXAgZnJvbSBhIG5lc3RlZCBvdmVybGF5LCBpZ25vcmUgaXRcbiAgICAgICAgaWYgKGV2ZW50LmRldGFpbC50YXJnZXQgIT09IHRoaXMub3ZlcmxheSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG9wZW4gPSBldmVudC5kZXRhaWwuY3VycmVudDtcblxuICAgICAgICBpZiAob3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlRm9jdXMoKTtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c0JlaGF2aW9yPy5hdHRhY2godGhpcy5vdmVybGF5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzQmVoYXZpb3I/LmRldGFjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUZvY3VzQ2hhbmdlIChldmVudDogRm9jdXNDaGFuZ2VFdmVudCkge1xuXG4gICAgICAgIC8vIHRoaXMgb3ZlcmxheSB0cmlnZ2VyIG9ubHkgaGFuZGxlcyBGb2N1c0NoYW5nZUV2ZW50cyB3aGljaCB3ZXJlIGRpc3BhdGNoZWQgb24gaXRzIG93biBvdmVybGF5XG4gICAgICAgIC8vIGlmIHRoZSBldmVudCdzIHRhcmdldCBpcyBub3QgdGhpcyB0cmlnZ2VyJ3Mgb3ZlcmxheSwgdGhlbiB0aGUgZXZlbnQgaXMgYnViYmxpbmcgZnJvbSBhIG5lc3RlZCBvdmVybGF5XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMub3ZlcmxheSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5VHJpZ2dlci5oYW5kbGVGb2N1c0NoYW5nZSgpLi4uICVzLCAlcywgYnViYmxpbmc6ICVzJywgdGhpcy5vdmVybGF5LmlkLCBldmVudC5kZXRhaWwuaGFzRm9jdXMsIGV2ZW50LnRhcmdldCAhPT0gdGhpcy5vdmVybGF5KTtcblxuICAgICAgICAvLyB3ZSBvbmx5IG5lZWQgdG8gaGFuZGxlIGZvY3VzIGxvc3NcbiAgICAgICAgaWYgKGV2ZW50LmRldGFpbC5oYXNGb2N1cykgcmV0dXJuO1xuXG4gICAgICAgIC8vIHRoZSBGb2N1c0NoYW5nZUV2ZW50IGlzIGRpc3BhdGNoZWQgYWZ0ZXIgdGhlIGZvY3VzIGhhcyBjaGFuZ2VkLCBzbyB3ZSBjYW4gY2hlY2sgaWYgb3VyIG92ZXJsYXkgaXNcbiAgICAgICAgLy8gc3RpbGwgYWN0aXZlIC0gdGhlIGZvY3VzIG1pZ2h0IGhhdmUgbW92ZWQgdG8gYSBuZXN0ZWQgb3ZlcmxheSAoaGlnaGVyIGluIHRoZSBzdGFjaylcbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheS5pc0FjdGl2ZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlmIHRoaXMgdHJpZ2dlcidzIG92ZXJsYXkgaXMgbm8gbG9uZ2VyIGFjdGl2ZSB3ZSBjYW4gY2xvc2UgaXRcblxuICAgICAgICAvLyB3ZSBoYXZlIHRvIGdldCB0aGUgcGFyZW50IGJlZm9yZSBjbG9zaW5nIHRoZSBvdmVybGF5IC0gd2hlbiBvdmVybGF5IGlzIGNsb3NlZCwgaXQgZG9lc24ndCBoYXZlIGEgcGFyZW50XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMub3ZlcmxheS5nZXRQYXJlbnRPdmVybGF5KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmNsb3NlT25Gb2N1c0xvc3MpIHtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5LmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBwYXJlbnQgb3ZlcmxheSwgd2UgbGV0IHRoZSBwYXJlbnQga25vdyB0aGF0IG91ciBvdmVybGF5IGhhcyBsb3N0IGZvY3VzIGJ5IGRpc3BhdGNoaW5nIHRoZVxuICAgICAgICAvLyBGb2N1c0NoYW5nZUV2ZW50IG9uIHRoZSBwYXJlbnQgb3ZlcmxheSB0byBiZSBoYW5kbGVkIG9yIGlnbm9yZWQgYnkgdGhlIHBhcmVudCdzIE92ZXJsYXlUcmlnZ2VyXG4gICAgICAgIG1hY3JvVGFzaygoKSA9PiBwYXJlbnQ/LmRpc3BhdGNoRXZlbnQoZXZlbnQpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEVzY2FwZTpcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5Lm9wZW4gfHwgIXRoaXMuY29uZmlnLmNsb3NlT25Fc2NhcGUpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNhbmNlbChldmVudCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXkuaGlkZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnJlc3RvcmVGb2N1cykge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ29wZW4tY2hhbmdlZCcsICgpID0+IHRoaXMucmVzdG9yZUZvY3VzKCksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBzdG9yZUZvY3VzICgpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheVRyaWdnZXIuc3RvcmVGb2N1cygpLi4uJywgdGhpcy5wcmV2aW91c0ZvY3VzKTtcblxuICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMgPSBhY3RpdmVFbGVtZW50KCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlc3RvcmVGb2N1cyAoKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlUcmlnZ2VyLnJlc3RvcmVGb2N1cygpLi4uJywgdGhpcy5wcmV2aW91c0ZvY3VzKTtcblxuICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMuZm9jdXMoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLCBGb2N1c1RyYXBDb25maWcgfSBmcm9tICcuLi8uLi9mb2N1cyc7XG5cbmV4cG9ydCB0eXBlIE92ZXJsYXlUcmlnZ2VyQ29uZmlnID0gRm9jdXNUcmFwQ29uZmlnICYge1xuICAgIHRyYXBGb2N1czogYm9vbGVhbjtcbiAgICBjbG9zZU9uRXNjYXBlOiBib29sZWFuO1xuICAgIGNsb3NlT25Gb2N1c0xvc3M6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHOiBPdmVybGF5VHJpZ2dlckNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLFxuICAgIGF1dG9Gb2N1czogdHJ1ZSxcbiAgICB0cmFwRm9jdXM6IHRydWUsXG4gICAgcmVzdG9yZUZvY3VzOiB0cnVlLFxuICAgIGNsb3NlT25Fc2NhcGU6IHRydWUsXG4gICAgY2xvc2VPbkZvY3VzTG9zczogdHJ1ZSxcbn07XG4iLCJpbXBvcnQgeyBQcm9wZXJ0eUNoYW5nZUV2ZW50IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4uLy4uL2tleXMnO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcbmltcG9ydCB7IGNhbmNlbCB9IGZyb20gJ2V4YW1wbGUvc3JjL2V2ZW50cyc7XG5cbmV4cG9ydCBjb25zdCBESUFMT0dfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRzogT3ZlcmxheVRyaWdnZXJDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHXG59O1xuXG5leHBvcnQgY2xhc3MgRGlhbG9nT3ZlcmxheVRyaWdnZXIgZXh0ZW5kcyBPdmVybGF5VHJpZ2dlciB7XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgLy8gd2UgZW5mb3JjZSB0aGUgZWxlbWVudCBieSBvbmx5IGF0dGFjaGluZywgaWYgaXQgaXMgcHJvdmlkZWRcbiAgICAgICAgaWYgKCFlbGVtZW50IHx8ICFzdXBlci5hdHRhY2goZWxlbWVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnNldEF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcsICdkaWFsb2cnKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnY2xpY2snLCBldmVudCA9PiB0aGlzLmhhbmRsZUNsaWNrKGV2ZW50IGFzIE1vdXNlRXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2tleWRvd24nLCBldmVudCA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpO1xuXG4gICAgICAgIHJldHVybiBzdXBlci5kZXRhY2goKTtcbiAgICB9XG5cbiAgICB1cGRhdGUgKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgdGhpcy5vdmVybGF5Lm9wZW4gPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZSAoZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pIHtcblxuICAgICAgICBzdXBlci5oYW5kbGVPcGVuQ2hhbmdlKGV2ZW50KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLm92ZXJsYXkudG9nZ2xlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBFbnRlcjpcbiAgICAgICAgICAgIGNhc2UgU3BhY2U6XG5cbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgZXZlbnRzIHRoYXQgaGFwcGVuIG9uIHRoZSB0cmlnZ2VyIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmVsZW1lbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICBjYW5jZWwoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXkudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcblxuICAgICAgICAgICAgICAgIHN1cGVyLmhhbmRsZUtleWRvd24oZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcblxuZXhwb3J0IGNvbnN0IFRPT0xUSVBfT1ZFUkxBWV9UUklHR0VSX0NPTkZJRzogT3ZlcmxheVRyaWdnZXJDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxuICAgIHRyYXBGb2N1czogZmFsc2UsXG4gICAgYXV0b0ZvY3VzOiBmYWxzZSxcbiAgICByZXN0b3JlRm9jdXM6IGZhbHNlLFxufTtcblxuZXhwb3J0IGNsYXNzIFRvb2x0aXBPdmVybGF5VHJpZ2dlciBleHRlbmRzIE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICAvLyB3ZSBlbmZvcmNlIHRoZSBlbGVtZW50IGJ5IG9ubHkgYXR0YWNoaW5nLCBpZiBpdCBpcyBwcm92aWRlZFxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5yb2xlID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGhpcy5vdmVybGF5LmlkKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VlbnRlcicsICgpID0+IHRoaXMub3ZlcmxheS5zaG93KCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VsZWF2ZScsICgpID0+IHRoaXMub3ZlcmxheS5oaWRlKCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXMnLCAoKSA9PiB0aGlzLm92ZXJsYXkuc2hvdygpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2JsdXInLCAoKSA9PiB0aGlzLm92ZXJsYXkuaGlkZSgpKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpO1xuXG4gICAgICAgIHJldHVybiBzdXBlci5kZXRhY2goKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCZWhhdmlvckZhY3RvcnksIEJlaGF2aW9yTWFwLCBDb25maWd1cmF0aW9uTWFwIH0gZnJvbSAnZXhhbXBsZS9zcmMvYmVoYXZpb3IvYmVoYXZpb3ItZmFjdG9yeSc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi4vb3ZlcmxheSc7XG5pbXBvcnQgeyBEaWFsb2dPdmVybGF5VHJpZ2dlciwgRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcgfSBmcm9tICcuL2RpYWxvZy1vdmVybGF5LXRyaWdnZXInO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItY29uZmlnJztcbmltcG9ydCB7IFRvb2x0aXBPdmVybGF5VHJpZ2dlciwgVE9PTFRJUF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHIH0gZnJvbSAnLi90b29sdGlwLW92ZXJsYXktdHJpZ2dlcic7XG5cbmV4cG9ydCB0eXBlIE92ZXJsYXlUcmlnZ2VyVHlwZXMgPSAnZGVmYXVsdCcgfCAnZGlhbG9nJyB8ICd0b29sdGlwJztcblxuZXhwb3J0IGNvbnN0IE9WRVJMQVlfVFJJR0dFUlM6IEJlaGF2aW9yTWFwPE92ZXJsYXlUcmlnZ2VyLCBPdmVybGF5VHJpZ2dlclR5cGVzPiA9IHtcbiAgICBkZWZhdWx0OiBPdmVybGF5VHJpZ2dlcixcbiAgICBkaWFsb2c6IERpYWxvZ092ZXJsYXlUcmlnZ2VyLFxuICAgIHRvb2x0aXA6IFRvb2x0aXBPdmVybGF5VHJpZ2dlcixcbn07XG5cbmV4cG9ydCBjb25zdCBPVkVSTEFZX1RSSUdHRVJfQ09ORklHUzogQ29uZmlndXJhdGlvbk1hcDxPdmVybGF5VHJpZ2dlckNvbmZpZywgT3ZlcmxheVRyaWdnZXJUeXBlcz4gPSB7XG4gICAgZGVmYXVsdDogREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxuICAgIGRpYWxvZzogRElBTE9HX09WRVJMQVlfVFJJR0dFUl9DT05GSUcsXG4gICAgdG9vbHRpcDogVE9PTFRJUF9PVkVSTEFZX1RSSUdHRVJfQ09ORklHLFxufTtcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSBleHRlbmRzIEJlaGF2aW9yRmFjdG9yeTxPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJDb25maWcsIE92ZXJsYXlUcmlnZ2VyVHlwZXM+IHtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHJvdGVjdGVkIGJlaGF2aW9ycyA9IE9WRVJMQVlfVFJJR0dFUlMsXG4gICAgICAgIHByb3RlY3RlZCBjb25maWd1cmF0aW9ucyA9IE9WRVJMQVlfVFJJR0dFUl9DT05GSUdTLFxuICAgICkge1xuXG4gICAgICAgIHN1cGVyKGJlaGF2aW9ycywgY29uZmlndXJhdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSB7QGxpbmsgY3JlYXRlfSBtZXRob2QgdG8gZW5mb3JjZSB0aGUgb3ZlcmxheSBwYXJhbWV0ZXJcbiAgICAgKi9cbiAgICBjcmVhdGUgKFxuICAgICAgICB0eXBlOiBPdmVybGF5VHJpZ2dlclR5cGVzLFxuICAgICAgICBjb25maWc6IFBhcnRpYWw8T3ZlcmxheVRyaWdnZXJDb25maWc+LFxuICAgICAgICBvdmVybGF5OiBPdmVybGF5LFxuICAgICAgICAuLi5hcmdzOiBhbnlbXVxuICAgICk6IE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgICAgICByZXR1cm4gc3VwZXIuY3JlYXRlKHR5cGUsIGNvbmZpZywgb3ZlcmxheSwgLi4uYXJncyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHksIFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEJlaGF2aW9yRmFjdG9yeSB9IGZyb20gJy4uL2JlaGF2aW9yJztcbmltcG9ydCB7IGFjdGl2ZUVsZW1lbnQsIHJlcGxhY2VXaXRoIH0gZnJvbSAnLi4vZG9tJztcbmltcG9ydCB7IElER2VuZXJhdG9yIH0gZnJvbSAnLi4vaWQtZ2VuZXJhdG9yJztcbmltcG9ydCB7IE1peGluUm9sZSB9IGZyb20gJy4uL21peGlucy9yb2xlJztcbmltcG9ydCB7IFBvc2l0aW9uQ29uZmlnLCBQb3NpdGlvbkNvbnRyb2xsZXIsIFBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkgfSBmcm9tICcuLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBUZW1wbGF0ZUNvbnRyb2xsZXIgfSBmcm9tICcuLi90ZW1wbGF0ZSc7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfQ09ORklHLCBNaXhpbk92ZXJsYXlDb25maWcgfSBmcm9tICcuL292ZXJsYXktY29uZmlnJztcbmltcG9ydCB7IE92ZXJsYXlUcmlnZ2VyLCBPdmVybGF5VHJpZ2dlckNvbmZpZywgT3ZlcmxheVRyaWdnZXJGYWN0b3J5IH0gZnJvbSAnLi90cmlnZ2VyJztcblxuY29uc3QgQUxSRUFEWV9JTklUSUFMSVpFRF9FUlJPUiA9ICgpID0+IG5ldyBFcnJvcignQ2Fubm90IGluaXRpYWxpemUgT3ZlcmxheS4gT3ZlcmxheSBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkLicpO1xuXG5jb25zdCBJRF9HRU5FUkFUT1IgPSBuZXcgSURHZW5lcmF0b3IoJ3BhcnRraXQtb3ZlcmxheS0nKTtcblxuZXhwb3J0IGludGVyZmFjZSBPdmVybGF5SW5pdCB7XG4gICAgb3ZlcmxheVRyaWdnZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8T3ZlcmxheVRyaWdnZXIsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnPjtcbiAgICBwb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8UG9zaXRpb25Db250cm9sbGVyLCBQb3NpdGlvbkNvbmZpZz47XG4gICAgb3ZlcmxheVJvb3Q/OiBIVE1MRWxlbWVudDtcbiAgICB6SW5kZXg/OiBudW1iZXI7XG59XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktb3ZlcmxheScsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgYm9yZGVyOiAycHggc29saWQgI2JmYmZiZjtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGAsXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBNaXhpbk92ZXJsYXlDb25maWcoTWl4aW5Sb2xlKENvbXBvbmVudCwgJ2RpYWxvZycpLCB7IC4uLkRFRkFVTFRfT1ZFUkxBWV9DT05GSUcgfSkge1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfb3ZlcmxheVRyaWdnZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8T3ZlcmxheVRyaWdnZXIsIE92ZXJsYXlUcmlnZ2VyQ29uZmlnPiA9IG5ldyBPdmVybGF5VHJpZ2dlckZhY3RvcnkoKTtcblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9wb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5OiBCZWhhdmlvckZhY3Rvcnk8UG9zaXRpb25Db250cm9sbGVyLCBQb3NpdGlvbkNvbmZpZz4gPSBuZXcgUG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSgpO1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX292ZXJsYXlSb290PzogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF96SW5kZXggPSAxXzAwMF8wMDA7XG5cbiAgICBwcm90ZWN0ZWQgc3RhdGljIGFjdGl2ZU92ZXJsYXlzID0gbmV3IFNldDxPdmVybGF5PigpO1xuXG4gICAgc3RhdGljIGdldCBvdmVybGF5VHJpZ2dlckZhY3RvcnkgKCk6IEJlaGF2aW9yRmFjdG9yeTxPdmVybGF5VHJpZ2dlciwgT3ZlcmxheVRyaWdnZXJDb25maWc+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVRyaWdnZXJGYWN0b3J5O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSAoKTogQmVoYXZpb3JGYWN0b3J5PFBvc2l0aW9uQ29udHJvbGxlciwgUG9zaXRpb25Db25maWc+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IG92ZXJsYXlSb290ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSb290O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgaXNJbml0aWFsaXplZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxpemVkO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbml0aWFsaXplIChjb25maWc6IFBhcnRpYWw8T3ZlcmxheUluaXQ+KSB7XG5cbiAgICAgICAgLy8gVE9ETzogbWF5YmUgd2UgY2FuIGFsbG93IGNoYW5naW5nIE92ZXJsYXlJbml0Li4uXG4gICAgICAgIGlmICh0aGlzLmlzSW5pdGlhbGl6ZWQpIHRocm93IEFMUkVBRFlfSU5JVElBTElaRURfRVJST1IoKTtcblxuICAgICAgICB0aGlzLl9vdmVybGF5VHJpZ2dlckZhY3RvcnkgPSBjb25maWcub3ZlcmxheVRyaWdnZXJGYWN0b3J5IHx8IHRoaXMuX292ZXJsYXlUcmlnZ2VyRmFjdG9yeTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSA9IGNvbmZpZy5wb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5IHx8IHRoaXMuX3Bvc2l0aW9uQ29udHJvbGxlckZhY3Rvcnk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSb290ID0gY29uZmlnLm92ZXJsYXlSb290IHx8IHRoaXMuX292ZXJsYXlSb290O1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX29wZW4gPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBfbWFya2VyITogQ29tbWVudDtcblxuICAgIHByb3RlY3RlZCBpc1JlYXR0YWNoaW5nID0gZmFsc2U7XG5cbiAgICBwcm90ZWN0ZWQgb3ZlcmxheVRyaWdnZXI/OiBPdmVybGF5VHJpZ2dlcjtcblxuICAgIHByb3RlY3RlZCBwb3NpdGlvbkNvbnRyb2xsZXI/OiBQb3NpdGlvbkNvbnRyb2xsZXI7XG5cbiAgICBwcm90ZWN0ZWQgdGVtcGxhdGVDb250cm9sbGVyPzogVGVtcGxhdGVDb250cm9sbGVyO1xuXG4gICAgcHJvdGVjdGVkIGdldCBzdGF0aWMgKCk6IHR5cGVvZiBPdmVybGF5IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgT3ZlcmxheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEFuIG92ZXJsYXkgaXMgY29uc2lkZXJlZCBmb2N1c2VkLCBpZiBlaXRoZXIgaXRzZWxmIG9yIGFueSBvZiBpdHMgZGVzY2VuZGFudCBub2RlcyBoYXMgZm9jdXMuXG4gICAgKi9cbiAgICBnZXQgaXNGb2N1c2VkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5vcGVuICYmIHRoaXMuY29udGFpbnMoYWN0aXZlRWxlbWVudCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBvdmVybGF5IGlzIGNvbnNpZGVyZWQgYWN0aXZlIGlmIGl0IGlzIGVpdGhlciBmb2N1c2VkIG9yIGhhcyBhIGRlc2NlbmRhbnQgb3ZlcmxheSB3aGljaCBpcyBmb2N1c2VkLlxuICAgICAqL1xuICAgIGdldCBpc0FjdGl2ZSAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgbGV0IGlzRm91bmQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGlzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YWNrZWQgJiYgdGhpcy5vcGVuKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGN1cnJlbnQgb2YgdGhpcy5zdGF0aWMuYWN0aXZlT3ZlcmxheXMpIHtcblxuICAgICAgICAgICAgICAgIGlzRm91bmQgPSBpc0ZvdW5kIHx8IGN1cnJlbnQgPT09IHRoaXM7XG5cbiAgICAgICAgICAgICAgICBpc0FjdGl2ZSA9IGlzRm91bmQgJiYgY3VycmVudC5pc0ZvY3VzZWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNBY3RpdmUpIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXkuaXNBY3RpdmUoKS4uLiAnLCB0aGlzLmlkLCBpc0FjdGl2ZSk7XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7IGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiB9KVxuICAgIHNldCBvcGVuICh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICAvLyBpZiBvcGVuIGhhcyBjaGFuZ2VkIHdlIHVwZGF0ZSB0aGUgYWN0aXZlIG92ZXJsYXkgc3RhY2sgc3luY2hyb25vdXNseVxuICAgICAgICBpZiAodGhpcy5fb3BlbiAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX29wZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhY2sodmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBvcGVuICgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wZW47XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHsgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIgfSlcbiAgICB0YWJpbmRleCA9IC0xO1xuXG4gICAgQHByb3BlcnR5KHsgYXR0cmlidXRlOiBmYWxzZSwgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIgfSlcbiAgICB6aW5kZXggPSAxO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmlzUmVhdHRhY2hpbmcpIHJldHVybjtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IElEX0dFTkVSQVRPUi5nZXROZXh0SUQoKTtcblxuICAgICAgICB0aGlzLl9tYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KHRoaXMuaWQpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBpZiAodGhpcy5pc1JlYXR0YWNoaW5nKSByZXR1cm47XG5cbiAgICAgICAgLy8gVE9ETzogdGVzdCB0aGF0IGNsb3NpbmcgYSBkaXNjb25uZWN0ZWQgb3ZlcmxheSBkb2Vzbid0IGJlaGF2ZSB1bmV4cGVjdGVkXG4gICAgICAgIHRoaXMuaGlkZSgpO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheVRyaWdnZXI/LmRldGFjaCgpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uQ29udHJvbGxlcj8uZGV0YWNoKCk7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5VHJpZ2dlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbkNvbnRyb2xsZXIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLnN0eWxlLnpJbmRleCA9IHRoaXMuemluZGV4LnRvU3RyaW5nKCk7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGAkeyAhdGhpcy5vcGVuIH1gKTtcblxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoY2hhbmdlcy5oYXMoJ2NvbmZpZycpKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheS51cGRhdGVDYWxsYmFjaygpLi4uIGNvbmZpZzogJywgdGhpcy5jb25maWcpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLmhhcygnb3BlbicpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGAkeyAhdGhpcy5vcGVuIH1gKTtcblxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eSgnb3BlbicsIGNoYW5nZXMuZ2V0KCdvcGVuJyksIHRoaXMub3Blbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93ICgpIHtcblxuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGhpZGUgKCkge1xuXG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRvZ2dsZSAob3Blbj86IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLm9wZW4gPSBvcGVuID8/ICF0aGlzLm9wZW47XG4gICAgfVxuXG4gICAgZGlzcG9zZSAoKSB7XG5cbiAgICAgICAgdGhpcy5oaWRlKCk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnRFbGVtZW50Py5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHBhcmVudCBvdmVybGF5IG9mIGFuIGFjdGl2ZSBvdmVybGF5XG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBJZiBhbiBvdmVybGF5IGlzIHN0YWNrZWQsIGl0cyBwYXJlbnQgb3ZlcmxheSBpcyB0aGUgb25lIGZyb20gd2hpY2ggaXQgd2FzIG9wZW5lZC5cbiAgICAgKiBUaGUgcGFyZW50IG92ZXJsYXkgd2lsbCBiZSBpbiB0aGUgYWN0aXZlT3ZlcmxheXMgc3RhY2sganVzdCBiZWZvcmUgdGhpcyBvbmUuXG4gICAgICovXG4gICAgZ2V0UGFyZW50T3ZlcmxheSAoKTogT3ZlcmxheSB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YWNrZWQgJiYgdGhpcy5vcGVuKSB7XG5cbiAgICAgICAgICAgIC8vIHdlIHN0YXJ0IHdpdGggcGFyZW50IGJlaW5nIHVuZGVmaW5lZFxuICAgICAgICAgICAgLy8gaWYgdGhlIGZpcnN0IGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzZXQgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIG92ZXJsYXlcbiAgICAgICAgICAgIC8vIHRoZW4gaW5kZWVkIHRoZSBvdmVybGF5IGhhcyBubyBwYXJlbnQgKHRoZSBmaXJzdCBhY3RpdmUgb3ZlcmxheSBpcyB0aGUgcm9vdClcbiAgICAgICAgICAgIGxldCBwYXJlbnQ6IE92ZXJsYXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggdGhlIGFjdGl2ZSBvdmVybGF5c1xuICAgICAgICAgICAgZm9yIChsZXQgY3VycmVudCBvZiB0aGlzLnN0YXRpYy5hY3RpdmVPdmVybGF5cykge1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSByZWFjaGVkIHRoZSBzcGVjaWZpZWQgYWN0aXZlIG92ZXJsYXlcbiAgICAgICAgICAgICAgICAvLyB3ZSBjYW4gcmV0dXJuIHRoZSBwYXJlbnQgb2YgdGhhdCBvdmVybGF5IChpdCdzIHRoZSBhY3RpdmUgb3ZlcmxheSBpbiB0aGUgc3RhY2sganVzdCBiZWZvcmUgdGhpcyBvbmUpXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMpIHJldHVybiBwYXJlbnQ7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBoYXZlbid0IGZvdW5kIHRoZSBzcGVjaWZpZWQgb3ZlcmxheSB5ZXQsIHdlIHNldFxuICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IG92ZXJsYXkgYXMgcG90ZW50aWFsIHBhcmVudCBhbmQgbW92ZSBvblxuICAgICAgICAgICAgICAgIHBhcmVudCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIHtAbGluayBPdmVybGF5LihhY3RpdmVPdmVybGF5czpzdGF0aWMpfSBzdGFja1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiB7QGxpbmsgT3ZlcmxheX0gaXMgYSBzdGFja2VkIG92ZXJsYXkgc3lzdGVtLiBUaGlzIG1lYW5zLCB0aGF0IGF0IGFueSBnaXZlbiB0aW1lLCB0aGVyZSBpcyBhdFxuICAgICAqIG1heGltdW0gb25lIG92ZXJsYXkgY29uc2lkZXJlZCB0aGUgYWN0aXZlIG92ZXJsYXkuIFRoaXMgaXMgdXN1YWxseSB0aGUgZm9jdXNlZCBvdmVybGF5IGFuZFxuICAgICAqIGl0IGlzIGFsd2F5cyB0aGUgbGFzdCBvdmVybGF5IGluIHRoZSB7QGxpbmsgT3ZlcmxheS4oYWN0aXZlT3ZlcmxheXM6c3RhdGljKX0gc3RhY2suXG4gICAgICogV2hlbiBhIHN0YWNrZWQgb3ZlcmxheSBpcyBvcGVuZWQgb3IgY2xvc2VkLCB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUge0BsaW5rIE92ZXJsYXkuKGFjdGl2ZU92ZXJsYXlzOnN0YXRpYyl9XG4gICAgICogc3RhY2sgdG8gcmVmbGVjdCB0aGUgbmV3IHN0YWNrIG9yZGVyLiBUaGUgcnVsZXMgZm9yIHVwZGF0aW5nIHRoZSBzdGFjayBhcmUgYXMgZm9sbG93czpcbiAgICAgKlxuICAgICAqICogd2hlbiBvcGVuaW5nIGEgc3RhY2tlZCBvdmVybGF5LCBpdCBpcyBhZGRlZCB0byB0aGUgc3RhY2tcbiAgICAgKiAqIHdoZW4gY2xvc2luZyBhIHN0YWNrZWQgb3ZlcmxheSwgYWxsIG92ZXJsYXlzIGhpZ2hlciBpbiB0aGUgc3RhY2sgaGF2ZSB0byBiZSBjbG9zZWQgdG9vXG4gICAgICogKiB3aGVuIG9wZW5pbmcgYSBzdGFja2VkIG92ZXJsYXkgd2l0aCBhIHRyaWdnZXIsIHdlIGxvb2sgZm9yIGFuIG92ZXJsYXkgaW4gdGhlIHN0YWNrIHdoaWNoXG4gICAgICogICBjb250YWlucyB0aGUgb3BlbmluZyBvdmVybGF5J3MgdHJpZ2dlciAtIGFsbCBvdmVybGF5cyBoaWdoZXIgaW4gdGhlIHN0YWNrIGhhdmUgdG8gYmUgY2xvc2VkXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbnZva2VkIGZyb20gdGhlIHtAbGluayBPdmVybGF5Lm9wZW59IHNldHRlciBhbmQgaXMgZXhlY3V0ZWQgaW1tZWRpYXRlbHkgYW5kXG4gICAgICogc3luY2hyb25vdXNseSB0byBndWFyYW50ZWUgdGhlIG9yZGVyIGluIHdoaWNoIG92ZXJsYXlzIGFyZSBvcGVuZWQvY2xvc2VkIGFuZCB0aGUgc3RhYmlsaXR5IG9mXG4gICAgICogdGhlIHN0YWNrIGFzIG9wcG9zZWQgdG8gYmVpbmcgc2NoZWR1bGVkIGluIHRoZSB1cGRhdGUgY3ljbGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3BlbiAgYHRydWVgIGlmIHRoZSBvdmVybGF5IGlzIG9wZW5pbmcsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVN0YWNrIChvcGVuOiBib29sZWFuKSB7XG5cbiAgICAgICAgLy8gVE9ETzogbm9uLXN0YWNrZWQgb3ZlcmxheXMgc2hvdWxkIGdldCBhIGhpZ2hlciB6LWluZGV4XG5cbiAgICAgICAgLy8gb25seSBzdGFja2VkIG92ZXJsYXlzIHBhcnRpY2lwYXRlIGluIHRoZSBzdGFjayBtYW5hZ2VtZW50XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuc3RhY2tlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHR1cm4gc3RhY2sgaW50byBhcnJheSBhbmQgcmV2ZXJzZSBpdCwgYXMgd2Ugd2FudCB0byBzdGFydCB3aXRoIHRoZSBjdXJyZW50bHkgYWN0aXZlIG92ZXJsYXlcbiAgICAgICAgY29uc3QgYWN0aXZlT3ZlcmxheXMgPSBbLi4udGhpcy5zdGF0aWMuYWN0aXZlT3ZlcmxheXNdLnJldmVyc2UoKTtcblxuICAgICAgICAvLyB0aGVuIGl0ZXJhdGUgb3ZlciB0aGUgcmV2ZXJzZSBzdGFjayBhbmQgY2xvc2UgZWFjaCBjdXJyZW50bHkgYWN0aXZlIG92ZXJsYXkgb25lIGJ5IG9uZVxuICAgICAgICAvLyB1bnRpbCB3ZSBmaW5kIGFuIGFjdGl2ZSBvdmVybGF5IHdoaWNoIGZ1bGZpbGxzIHRoZSBydWxlcyBhbmQgY2FuIHN0YXkgb3BlblxuICAgICAgICBhY3RpdmVPdmVybGF5cy5zb21lKGFjdGl2ZU92ZXJsYXkgPT4ge1xuXG4gICAgICAgICAgICAvLyB3ZSBhcmUgZG9uZSBpbiB0aGUgZm9sbG93aW5nIGNhc2VzOlxuICAgICAgICAgICAgY29uc3QgZG9uZSA9IG9wZW5cbiAgICAgICAgICAgICAgICAvLyBbdGhpcyBvdmVybGF5IGlzIG9wZW5pbmddOlxuICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50bHkgYWN0aXZlIG92ZXJsYXkgY29udGFpbnMgdGhlIHRyaWdnZXIgb2YgdGhpcyBvdmVybGF5IGFuZCBjYW4gYmVcbiAgICAgICAgICAgICAgICAvLyBjb25zaWRlcmVkIHRoZSBwYXJlbnQgb2YgdGhpcyBvdmVybGF5IGluIHRoZSBzdGFjayAtIG9yICB0aGlzIG92ZXJsYXkgZG9lc24ndFxuICAgICAgICAgICAgICAgIC8vIGhhdmUgYSB0cmlnZ2VyIGFuZCB3ZSBjb25zaWRlciB0aGUgY3VycmVudGx5IGFjdGl2ZSBvdmVybGF5IHRoZSBwYXJlbnRcbiAgICAgICAgICAgICAgICA/IHRoaXMudHJpZ2dlciAmJiBhY3RpdmVPdmVybGF5LmNvbnRhaW5zKHRoaXMudHJpZ2dlcikgfHwgIXRoaXMudHJpZ2dlclxuICAgICAgICAgICAgICAgIC8vIFt0aGlzIG92ZXJsYXkgaXMgY2xvc2luZ106XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnRseSBhY3RpdmUgb3ZlcmxheSBpcyB0aGlzIG92ZXJsYXkgd2hpY2ggd2UgYXJlIGFib3V0IHRvIGNsb3NlO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBjdXJyZW50bHkgYWN0aXZlIG92ZXJsYXkgaXMgbm90IHRoaXMgb3ZlcmxheSwgdGhlbiBpdCBpcyBhbiBhY3RpdmVcbiAgICAgICAgICAgICAgICAvLyBvdmVybGF5IGhpZ2hlciBpbiB0aGUgc3RhY2sgd2hpY2ggaGFzIHRvIGJlIGNsb3NlZFxuICAgICAgICAgICAgICAgIDogYWN0aXZlT3ZlcmxheSA9PT0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCFkb25lKSB7XG5cbiAgICAgICAgICAgICAgICBhY3RpdmVPdmVybGF5Lm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRvbmU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGZpbmFsbHkgd2UgYWRkL3JlbW92ZSB0aGlzIG92ZXJsYXkgdG8vZnJvbSB0aGUgc3RhY2tcbiAgICAgICAgLy8gb3BlbiA/IHRoaXMuc3RhdGljLmFjdGl2ZU92ZXJsYXlzLmFkZCh0aGlzKSA6IHRoaXMuc3RhdGljLmFjdGl2ZU92ZXJsYXlzLmRlbGV0ZSh0aGlzKTtcblxuICAgICAgICBpZiAob3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRpYy5hY3RpdmVPdmVybGF5cy5hZGQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnppbmRleCA9IHRoaXMuc3RhdGljLl96SW5kZXggKyB0aGlzLnN0YXRpYy5hY3RpdmVPdmVybGF5cy5zaXplO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhdGljLmFjdGl2ZU92ZXJsYXlzLmRlbGV0ZSh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuemluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0aGUgb3ZlcmxheSdzIG9wZW4tY2hhbmdlZCBldmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIGFyZSBkaXNwYXRjaGVkIGR1cmluZyB0aGUgdXBkYXRlIGN5Y2xlIG9mIHRoZSBjb21wb25lbnQsIHNvIHRoZXkgcnVuIGluXG4gICAgICogYW4gYW5pbWF0aW9uRnJhbWUgY2FsbGJhY2suIFdlIGNhbiB0aGVyZWZvcmUgcnVuIGNvZGUgaW4gdGhlc2UgaGFuZGxlcnMsIHdoaWNoIHJ1bnMgaW5zaWRlXG4gICAgICogYW4gYW5pbWF0aW9uRnJhbWUsIGxpa2UgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5IHdpdGhvdXQgc2NoZWR1bGluZyBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudFxuICAgICAqL1xuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAnb3Blbi1jaGFuZ2VkJywgb3B0aW9uczogeyBjYXB0dXJlOiB0cnVlIH0gfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZWQgKGV2ZW50OiBQcm9wZXJ0eUNoYW5nZUV2ZW50PGJvb2xlYW4+KSB7XG5cbiAgICAgICAgLy8gb3ZlcmxheXMgY2FuIGJlIG5lc3RlZCwgd2hpY2ggbWVhbnMgdGhhdCAnb3Blbi1jaGFuZ2VkJy1ldmVudHMgY2FuIGJ1YmJsZSBmcm9tXG4gICAgICAgIC8vIGEgbmVzdGVkIG92ZXJsYXkgdG8gaXRzIHBhcmVudCAtIHdlIG9ubHkgd2FudCB0byBoYW5kbGUgZXZlbnRzIGZyb20gdGhpcyBvdmVybGF5XG4gICAgICAgIC8vIGluc3RhbmNlLCBzbyB3ZSBjaGVjayB0aGUge0BsaW5rIENvbXBvbmVudEV2ZW50fSdzIGRldGFpbC50YXJnZXQgcHJvcGVydHlcbiAgICAgICAgaWYgKGV2ZW50LmRldGFpbC50YXJnZXQgIT09IHRoaXMpIHJldHVybjtcblxuICAgICAgICBpZiAodGhpcy5vcGVuKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlT3BlbigpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuICgpIHtcblxuICAgICAgICB0aGlzLm1vdmVUb1Jvb3QoKTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uQ29udHJvbGxlcj8uYXR0YWNoKHRoaXMpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uQ29udHJvbGxlcj8udXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy50ZW1wbGF0ZUNvbnRyb2xsZXI/LmF0dGFjaCh0aGlzKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZUNvbnRyb2xsZXI/LnVwZGF0ZSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVDbG9zZSAoKSB7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbkNvbnRyb2xsZXI/LmRldGFjaCgpO1xuICAgICAgICB0aGlzLnRlbXBsYXRlQ29udHJvbGxlcj8uZGV0YWNoKCk7XG5cbiAgICAgICAgdGhpcy5tb3ZlRnJvbVJvb3QoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlndXJlICgpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheS5jb25maWd1cmUoKS4uLiBjb25maWc6ICcsIHRoaXMuY29uZmlnKTtcblxuICAgICAgICAvLyBkaXNwb3NlIG9mIHRoZSBvdmVybGF5IHRyaWdnZXIgYW5kIHBvc2l0aW9uIGNvbnRyb2xsZXJcbiAgICAgICAgdGhpcy5vdmVybGF5VHJpZ2dlcj8uZGV0YWNoKCk7XG4gICAgICAgIHRoaXMucG9zaXRpb25Db250cm9sbGVyPy5kZXRhY2goKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZUNvbnRyb2xsZXI/LmRldGFjaCgpO1xuXG4gICAgICAgIC8vIHJlY3JlYXRlIHRoZSBvdmVybGF5IHRyaWdnZXIgYW5kIHBvc2l0aW9uIGNvbnRyb2xsZXIgZnJvbSB0aGUgY29uZmlnXG4gICAgICAgIHRoaXMub3ZlcmxheVRyaWdnZXIgPSB0aGlzLnN0YXRpYy5vdmVybGF5VHJpZ2dlckZhY3RvcnkuY3JlYXRlKHRoaXMuY29uZmlnLnRyaWdnZXJUeXBlISwgdGhpcy5jb25maWcsIHRoaXMpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uQ29udHJvbGxlciA9IHRoaXMuc3RhdGljLnBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkuY3JlYXRlKHRoaXMuY29uZmlnLnBvc2l0aW9uVHlwZSEsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZUNvbnRyb2xsZXIgPSBuZXcgVGVtcGxhdGVDb250cm9sbGVyKHRoaXMuY29uZmlnKTtcblxuICAgICAgICAvLyBhdHRhY2ggdGhlIG92ZXJsYXkgdHJpZ2dlclxuICAgICAgICB0aGlzLm92ZXJsYXlUcmlnZ2VyLmF0dGFjaCh0aGlzLmNvbmZpZy50cmlnZ2VyKTtcblxuICAgICAgICAvLyBhdHRhY2ggdGhlIHBvc2l0aW9uIGNvbnRyb2xsZXIsIGlmIHRoZSBvdmVybGF5IGlzIG9wZW5cbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uQ29udHJvbGxlci5hdHRhY2godGhpcyk7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uQ29udHJvbGxlci51cGRhdGUoKTtcblxuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZUNvbnRyb2xsZXIuYXR0YWNoKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZUNvbnRyb2xsZXIudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbW92ZVRvUm9vdCAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRpYy5vdmVybGF5Um9vdCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuaXNSZWF0dGFjaGluZyA9IHRydWU7XG5cbiAgICAgICAgcmVwbGFjZVdpdGgodGhpcy5fbWFya2VyLCB0aGlzKTtcblxuICAgICAgICAvLyBUT0RPOiB0aGluayBhYm91dCB0aGlzOiBpZiB3ZSBtb3ZlIG92ZXJsYXlzIGluIHRoZSBET00sIHRoZW4gYSBjb21wb25lbnQncyBzZWxlY3RvcnMgbWlnaHRcbiAgICAgICAgLy8gZ2V0IGxvc3QgaWYgYW4gdXBkYXRlIGhhcHBlbnMgaW4gdGhhdCBjb21wb25lbnQgd2hpbGUgdGhlIG92ZXJsYXkgaXMgb3BlblxuICAgICAgICAvLyBtYXliZSBpdCdzIGJldHRlciB0byBzZWxlY3QgZGlhbG9ncyBpbnN0YW5jZXMgb25seSBvbmNlIGFmdGVyIDFzdCByZW5kZXI/XG4gICAgICAgIC8vIG1heWJlIGhhdmUgYSBzZWxlY3RvciBvcHRpb24gdG8gZGlzYWJsZSByZS1xdWVyeWluZz9cbiAgICAgICAgdGhpcy5zdGF0aWMub3ZlcmxheVJvb3QuYXBwZW5kQ2hpbGQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5pc1JlYXR0YWNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG1vdmVGcm9tUm9vdCAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRpYy5vdmVybGF5Um9vdCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuaXNSZWF0dGFjaGluZyA9IHRydWU7XG5cbiAgICAgICAgcmVwbGFjZVdpdGgodGhpcywgdGhpcy5fbWFya2VyKTtcblxuICAgICAgICB0aGlzLmlzUmVhdHRhY2hpbmcgPSBmYWxzZTtcbiAgICB9XG59XG5cbi8vIFRPRE86IGZpZ3VyZSBvdXQgaG93IHRvIGFkZCB3ZWIgY29tcG9uZW50IHR5cGVzIHRvIGh0bWwgbGFuZ3VhZ2Ugc2VydmVyXG5kZWNsYXJlIGdsb2JhbCB7XG5cbiAgICBpbnRlcmZhY2UgSFRNTEVsZW1lbnRUYWdOYW1lTWFwIHtcbiAgICAgICAgJ3VpLW92ZXJsYXknOiBPdmVybGF5XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIHNlbGVjdG9yLCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgJy4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXlDb25maWcgfSBmcm9tICcuL292ZXJsYXktY29uZmlnJztcblxuQGNvbXBvbmVudDxPdmVybGF5RGVtb0NvbXBvbmVudD4oe1xuICAgIHNlbGVjdG9yOiAnb3ZlcmxheS1kZW1vJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcGFkZGluZy1ib3R0b206IDIwcmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxoMj5PdmVybGF5PC9oMj5cblxuICAgIDxoMz5EZWZhdWx0IE92ZXJsYXk8L2gzPlxuXG4gICAgPHA+QW4gb3ZlcmxheSB3aXRoIGl0cyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uIFRoZSBvdmVybGF5IGlzIG9wZW5lZCBhbmQgY2xvc2VkIHByb2dyYW1tYXRpY2FsbHkuPC9wPlxuXG4gICAgPGJ1dHRvbiBAY2xpY2s9JHsgZWxlbWVudC50b2dnbGVPdmVybGF5IH0+VG9nZ2xlIE92ZXJsYXk8L2J1dHRvbj5cblxuICAgIDx1aS1vdmVybGF5IGlkPVwib3ZlcmxheVwiPlxuICAgICAgICA8aDM+T3ZlcmxheTwvaDM+XG4gICAgICAgIDxwPlRoaXMgaXMgdGhlIG92ZXJsYXkncyBjb250ZW50LjwvcD5cbiAgICAgICAgPHA+U29tZSBpbnRlcmFjdGl2ZSBlbGVtZW50cyBzaG93Y2FzZSB0aGUgYXV0by1mb2N1cyBhbmQgZm9jdXMtdHJhcCBiZWhhdmlvciBvZiB0aGUgb3ZlcmxheS48L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgPGxhYmVsPlNvbWUgdGV4dCBmaWVsZCA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIlwiLz48L2xhYmVsPlxuICAgICAgICA8L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgPGxhYmVsPlNvbWUgY2hlY2tib3ggPGlucHV0IHR5cGU9XCJjaGVja2JveFwiLz48L2xhYmVsPlxuICAgICAgICA8L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgPGJ1dHRvbj5Tb21lIGJ1dHRvbjwvYnV0dG9uPlxuICAgICAgICA8L3A+XG4gICAgPC91aS1vdmVybGF5PlxuXG4gICAgPGgzPlByb2dyYW1tYXRpYyBPdmVybGF5PC9oMz5cblxuICAgIDxwPkFuIG92ZXJsYXkgd2hpY2ggaXMgY3JlYXRlZCB2aWEgdGhlIHN0YXRpYyBPdmVybGF5LmNyZWF0ZSgpIG1ldGhvZC48L3A+XG5cbiAgICA8YnV0dG9uIEBjbGljaz0keyBlbGVtZW50LnRvZ2dsZVByb2dyYW1tYXRpY092ZXJsYXkgfT5Ub2dnbGUgT3ZlcmxheTwvYnV0dG9uPlxuXG4gICAgPGgzPlRvb2x0aXA8L2gzPlxuXG4gICAgPHA+QW4gb3ZlcmxheSB3aGljaCBpcyBjb25maWd1cmVkIGFzIGEgdG9vbHRpcCwgd2l0aCBpdHMgPGNvZGU+dHJpZ2dlci10eXBlPC9jb2RlPiBiZWluZyA8Y29kZT5cInRvb2x0aXBcIjwvY29kZT4gYW5kIDxjb2RlPnBvc2l0aW9uLXR5cGU8L2NvZGU+IGJlaW5nIDxjb2RlPlwiY29ubmVjdGVkXCI8L2NvZGU+LiBUb29sdGlwcyBzaG91bGQgbm90IGJlIHN0YWNrZWQsIGFzIHRoZXkgYXJlIG5vdCBjb25zaWRlcmVkIGFjdGl2ZSAtIG1lYW5pbmcsIHRoZXkgdXN1YWxseSBkb24ndCByZWNlaXZlIGZvY3VzIGFuZCBhcmUgbm90IGludGVyYWN0aXZlLjwvcD5cblxuICAgIDxwPlRoaXMgaXMgc29tZSBzYW1wbGUgdGV4dCB3aXRoIGEgPGEgaHJlZj1cIiNcIiBpZD1cInRvb2x0aXAtdHJpZ2dlclwiPnRvb2x0aXA8L2E+LjwvcD5cblxuICAgIDx1aS1vdmVybGF5IGlkPVwidG9vbHRpcFwiIC5jb25maWc9JHsgZWxlbWVudC50b29sdGlwQ29uZmlnIH0+XG4gICAgICAgIDxwPlRoaXMgaXMgdGhlIHRvb2x0aXAgY29udGVudC48L3A+XG4gICAgPC91aS1vdmVybGF5PlxuXG4gICAgPGgzPkRpYWxvZzwvaDM+XG5cbiAgICA8cD5BbiBvdmVybGF5IHdoaWNoIGlzIGNvbmZpZ3VyZWQgYXMgYSBkaWFsb2csIHdpdGggaXRzIDxjb2RlPnRyaWdnZXItdHlwZTwvY29kZT4gYmVpbmcgPGNvZGU+XCJkaWFsb2dcIjwvY29kZT4gYW5kIDxjb2RlPnBvc2l0aW9uLXR5cGU8L2NvZGU+IGJlaW5nIDxjb2RlPlwiY29ubmVjdGVkXCI8L2NvZGU+LjwvcD5cbiAgICA8cD5UaGUgZGlhbG9nIGl0c2VsZiBjb250YWlucyAyIG5lc3RlZCBkaWFsb2dzIHRvIHNob3djYXNlIG92ZXJsYXkncyBzdGFja2luZyBmZWF0dXJlIGFuZCBmb2N1cyBtYW5hZ2VtZW50LjwvcD5cblxuICAgIDxidXR0b24gaWQ9XCJkaWFsb2ctYnV0dG9uXCI+VG9nZ2xlIERpYWxvZzwvYnV0dG9uPlxuXG4gICAgPHVpLW92ZXJsYXkgaWQ9XCJkaWFsb2dcIiAuY29uZmlnPSR7IGVsZW1lbnQuZGlhbG9nQ29uZmlnIH0+XG4gICAgICAgIDxoMz5EaWFsb2c8L2gzPlxuICAgICAgICA8cD5UaGlzIGlzIHNvbWUgZGlhbG9nIGNvbnRlbnQuPC9wPlxuICAgICAgICA8cD5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJuZXN0ZWQtZGlhbG9nLWJ1dHRvblwiPk5lc3RlZCBkaWFsb2cgMTwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cIm5lc3RlZC1kaWFsb2ctYnV0dG9uLTJcIj5OZXN0ZWQgZGlhbG9nIDI8L2J1dHRvbj5cbiAgICAgICAgPC9wPlxuICAgICAgICA8dWktb3ZlcmxheVxuICAgICAgICAgICAgaWQ9XCJuZXN0ZWQtZGlhbG9nXCJcbiAgICAgICAgICAgIHRyaWdnZXItdHlwZT1cImRpYWxvZ1wiXG4gICAgICAgICAgICBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCJcbiAgICAgICAgICAgIC50cmlnZ2VyPSR7IGVsZW1lbnQubmVzdGVkRGlhbG9nQnV0dG9uIH1cbiAgICAgICAgICAgIC5vcmlnaW49JHsgZWxlbWVudC5uZXN0ZWREaWFsb2dCdXR0b24gfT5cbiAgICAgICAgICAgIDxoMz5OZXN0ZWQgRGlhbG9nIDE8L2gzPlxuICAgICAgICAgICAgPHA+VGhpcyBpcyBzb21lIGRpYWxvZyBjb250ZW50LjwvcD5cbiAgICAgICAgPC91aS1vdmVybGF5PlxuICAgICAgICA8dWktb3ZlcmxheVxuICAgICAgICAgICAgaWQ9XCJuZXN0ZWQtZGlhbG9nLTJcIlxuICAgICAgICAgICAgdHJpZ2dlci10eXBlPVwiZGlhbG9nXCJcbiAgICAgICAgICAgIHBvc2l0aW9uLXR5cGU9XCJjb25uZWN0ZWRcIlxuICAgICAgICAgICAgLnRyaWdnZXI9JHsgZWxlbWVudC5uZXN0ZWREaWFsb2dCdXR0b24yIH1cbiAgICAgICAgICAgIC5vcmlnaW49JHsgZWxlbWVudC5uZXN0ZWREaWFsb2dCdXR0b24yIH0+XG4gICAgICAgICAgICA8aDM+TmVzdGVkIERpYWxvZyAyPC9oMz5cbiAgICAgICAgICAgIDxwPlRoaXMgaXMgc29tZSBkaWFsb2cgY29udGVudC48L3A+XG4gICAgICAgIDwvdWktb3ZlcmxheT5cbiAgICA8L3VpLW92ZXJsYXk+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5RGVtb0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgdGltZW91dD86IG51bWJlcjtcblxuICAgIHByb2dyYW1tYXRpY092ZXJsYXk/OiBPdmVybGF5O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjb3ZlcmxheScgfSlcbiAgICBvdmVybGF5ITogT3ZlcmxheTtcblxuICAgIEBzZWxlY3Rvcih7IHF1ZXJ5OiAnI2RpYWxvZycgfSlcbiAgICBkaWFsb2chOiBPdmVybGF5O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjZGlhbG9nLWJ1dHRvbicgfSlcbiAgICBkaWFsb2dCdXR0b24hOiBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgIEBzZWxlY3Rvcih7IHF1ZXJ5OiAnI25lc3RlZC1kaWFsb2cnIH0pXG4gICAgbmVzdGVkRGlhbG9nITogT3ZlcmxheTtcblxuICAgIEBzZWxlY3Rvcih7IHF1ZXJ5OiAnI25lc3RlZC1kaWFsb2ctYnV0dG9uJyB9KVxuICAgIG5lc3RlZERpYWxvZ0J1dHRvbiE6IEhUTUxCdXR0b25FbGVtZW50O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjbmVzdGVkLWRpYWxvZy0yJyB9KVxuICAgIG5lc3RlZERpYWxvZzIhOiBPdmVybGF5O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjbmVzdGVkLWRpYWxvZy1idXR0b24tMicgfSlcbiAgICBuZXN0ZWREaWFsb2dCdXR0b24yITogSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICBAc2VsZWN0b3IoeyBxdWVyeTogJyN0b29sdGlwLXRyaWdnZXInIH0pXG4gICAgdG9vbHRpcFRyaWdnZXIhOiBIVE1MU3BhbkVsZW1lbnQ7XG5cbiAgICBnZXQgZGlhbG9nQ29uZmlnICgpOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRyaWdnZXJUeXBlOiAnZGlhbG9nJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICB0cmlnZ2VyOiB0aGlzLmRpYWxvZ0J1dHRvbixcbiAgICAgICAgICAgIG9yaWdpbjogdGhpcy5kaWFsb2dCdXR0b24sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0IHRvb2x0aXBDb25maWcgKCk6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHJpZ2dlclR5cGU6ICd0b29sdGlwJyxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogJ2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICBhbGlnbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBvcmlnaW46IHtcbiAgICAgICAgICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIGhvcml6b250YWw6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogJ2VuZCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWw6ICcxcmVtJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cmlnZ2VyOiB0aGlzLnRvb2x0aXBUcmlnZ2VyLFxuICAgICAgICAgICAgb3JpZ2luOiB0aGlzLnRvb2x0aXBUcmlnZ2VyLFxuICAgICAgICAgICAgc3RhY2tlZDogZmFsc2UsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAcHJvcGVydHkoeyBhdHRyaWJ1dGU6IGZhbHNlIH0pXG4gICAgY291bnRlciA9IDA7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLmNvdW50KCk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmRpc2Nvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG5cbiAgICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuXG4gICAgfVxuXG4gICAgdG9nZ2xlT3ZlcmxheSAoKSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5Lm9wZW4gPSAhdGhpcy5vdmVybGF5Lm9wZW47XG4gICAgfVxuXG4gICAgdG9nZ2xlUHJvZ3JhbW1hdGljT3ZlcmxheSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb2dyYW1tYXRpY092ZXJsYXkpIHtcblxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSAoKSA9PiBodG1sYFxuICAgICAgICAgICAgICAgIDxoMz5Qcm9ncmFtbWF0aWMgT3ZlcmxheTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+VGhpcyBpcyBzb21lIG92ZXJsYXkgY29udGVudCBmcm9tIGEgdGVtcGxhdGUgZnVuY3Rpb24uPC9wPlxuICAgICAgICAgICAgICAgIDxwPlRoaXMgY291bnRlciBpcyBmcm9tIHRoZSBkZW1vIGNvbXBvbmVudCdzIGNvbnRleHQ6ICR7IHRoaXMuY291bnRlciB9PC9wPlxuICAgICAgICAgICAgICAgIDxwPjxidXR0b24gQGNsaWNrPSR7IHRoaXMudG9nZ2xlUHJvZ3JhbW1hdGljT3ZlcmxheSB9PkdvdCBpdDwvYnV0dG9uPjwvcD5cbiAgICAgICAgICAgIGA7XG5cbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbW1hdGljT3ZlcmxheSA9IG5ldyBPdmVybGF5KCk7XG5cbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbW1hdGljT3ZlcmxheS5jb25maWcgPSB7IHRlbXBsYXRlLCBjb250ZXh0OiB0aGlzIH07XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vdC5hcHBlbmRDaGlsZCh0aGlzLnByb2dyYW1tYXRpY092ZXJsYXkpO1xuXG4gICAgICAgICAgICB0aGlzLnByb2dyYW1tYXRpY092ZXJsYXkuc2hvdygpO1xuXG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5wcm9ncmFtbWF0aWNPdmVybGF5LnRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvdW50ICgpIHtcblxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jb3VudGVyKys7XG5cbiAgICAgICAgICAgIHRoaXMuY291bnQoKTtcblxuICAgICAgICB9LCAxMDAwKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgIEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlcixcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgQ2hhbmdlcywgQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudCxcbiAgICBjc3MsXG4gICAgbGlzdGVuZXIsXG4gICAgcHJvcGVydHlcbn0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBUYWJQYW5lbCB9IGZyb20gJy4vdGFiLXBhbmVsJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93O1xuICAgICAgICBwYWRkaW5nOiAwLjVyZW0gMC41cmVtO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyKTtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgMCAwO1xuICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLXNlbGVjdGVkPXRydWVdKTphZnRlciB7XG4gICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB6LWluZGV4OiAyO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICBib3R0b206IGNhbGMoLTEgKiB2YXIoLS1ib3JkZXItd2lkdGgpKTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1ib3JkZXItd2lkdGgpICsgMC41cmVtKTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcml2YXRlIF9wYW5lbDogVGFiUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICAgIHByaXZhdGUgX3NlbGVjdGVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgY29udHJvbHMhOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBXZSBwcm92aWRlIG91ciBvd24gdGFiaW5kZXggcHJvcGVydHksIHNvIHdlIGNhbiBzZXQgaXQgdG8gYG51bGxgXG4gICAgICogdG8gcmVtb3ZlIHRoZSB0YWJpbmRleC1hdHRyaWJ1dGUuXG4gICAgICovXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAndGFiaW5kZXgnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXghOiBudW1iZXIgfCBudWxsO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1zZWxlY3RlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW5cbiAgICB9KVxuICAgIGdldCBzZWxlY3RlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xuICAgIH1cblxuICAgIHNldCBzZWxlY3RlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6ICh2YWx1ZSA/IDAgOiAtMSk7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1kaXNhYmxlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sXG4gICAgfSlcbiAgICBnZXQgZGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdmFsdWUgPyBudWxsIDogKHRoaXMuc2VsZWN0ZWQgPyAwIDogLTEpO1xuICAgIH1cblxuICAgIGdldCBwYW5lbCAoKTogVGFiUGFuZWwgfCBudWxsIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jb250cm9scykgYXMgVGFiUGFuZWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fcGFuZWw7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3RhYidcbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogLTE7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhbmVsKSB0aGlzLnBhbmVsLmxhYmVsbGVkQnkgPSB0aGlzLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0ICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5zZWxlY3RlZCA9IHRydWUpO1xuICAgIH1cblxuICAgIGRlc2VsZWN0ICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5zZWxlY3RlZCA9IGZhbHNlKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFycm93RG93biB9IGZyb20gJy4uL2tleXMnO1xuaW1wb3J0IHsgQWN0aXZlSXRlbUNoYW5nZSwgRm9jdXNLZXlNYW5hZ2VyIH0gZnJvbSAnLi4vbGlzdC1rZXktbWFuYWdlcic7XG5pbXBvcnQgeyBUYWIgfSBmcm9tICcuL3RhYic7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLWxpc3QnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93IG5vd3JhcDtcbiAgICB9XG4gICAgOjpzbG90dGVkKHVpLXRhYikge1xuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuMjVyZW07XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYkxpc3QgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIGZvY3VzTWFuYWdlciE6IEZvY3VzS2V5TWFuYWdlcjxUYWI+O1xuXG4gICAgcHJvdGVjdGVkIHNlbGVjdGVkVGFiITogVGFiO1xuXG4gICAgQHByb3BlcnR5KClcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3RhYmxpc3QnO1xuXG4gICAgICAgIHRoaXMuZm9jdXNNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLCB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoVGFiLnNlbGVjdG9yKSwgJ2hvcml6b250YWwnKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gY29uc3Qgc2xvdCA9IHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdzbG90JykgYXMgSFRNTFNsb3RFbGVtZW50O1xuXG4gICAgICAgICAgICAvLyBzbG90LmFkZEV2ZW50TGlzdGVuZXIoJ3Nsb3RjaGFuZ2UnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhgJHtzbG90Lm5hbWV9IGNoYW5nZWQuLi5gLCBzbG90LmFzc2lnbmVkTm9kZXMoKSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoYCR7IFRhYi5zZWxlY3RvciB9W2FyaWEtc2VsZWN0ZWQ9dHJ1ZV1gKSBhcyBUYWI7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGFiXG4gICAgICAgICAgICAgICAgPyB0aGlzLmZvY3VzTWFuYWdlci5zZXRBY3RpdmVJdGVtKHNlbGVjdGVkVGFiKVxuICAgICAgICAgICAgICAgIDogdGhpcy5mb2N1c01hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG5cbiAgICAgICAgICAgIC8vIHNldHRpbmcgdGhlIGFjdGl2ZSBpdGVtIHZpYSB0aGUgZm9jdXMgbWFuYWdlcidzIEFQSSB3aWxsIG5vdCB0cmlnZ2VyIGFuIGV2ZW50XG4gICAgICAgICAgICAvLyBzbyB3ZSBoYXZlIHRvIG1hbnVhbGx5IHNlbGVjdCB0aGUgaW5pdGlhbGx5IGFjdGl2ZSB0YWJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gdGhpcy5zZWxlY3RUYWIodGhpcy5mb2N1c01hbmFnZXIuZ2V0QWN0aXZlSXRlbSgpKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogJ2tleWRvd24nIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBBcnJvd0Rvd246XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IHRoaXMuZm9jdXNNYW5hZ2VyLmdldEFjdGl2ZUl0ZW0oKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRUYWIgJiYgc2VsZWN0ZWRUYWIucGFuZWwpIHNlbGVjdGVkVGFiLnBhbmVsLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8VGFiTGlzdD4oe1xuICAgICAgICBldmVudDogJ2FjdGl2ZS1pdGVtLWNoYW5nZScsXG4gICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5mb2N1c01hbmFnZXI7IH1cbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVBY3RpdmVUYWJDaGFuZ2UgKGV2ZW50OiBBY3RpdmVJdGVtQ2hhbmdlPFRhYj4pIHtcblxuICAgICAgICBjb25zdCBwcmV2aW91c1RhYiA9IGV2ZW50LmRldGFpbC5wcmV2aW91cy5pdGVtO1xuICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IGV2ZW50LmRldGFpbC5jdXJyZW50Lml0ZW07XG5cbiAgICAgICAgaWYgKHByZXZpb3VzVGFiICE9PSBzZWxlY3RlZFRhYikge1xuXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0VGFiKHByZXZpb3VzVGFiKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0VGFiKHNlbGVjdGVkVGFiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZWxlY3RUYWIgKHRhYj86IFRhYikge1xuXG4gICAgICAgIGlmICh0YWIpIHtcblxuICAgICAgICAgICAgdGFiLnNlbGVjdCgpO1xuXG4gICAgICAgICAgICBpZiAodGFiLnBhbmVsKSB0YWIucGFuZWwuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGVzZWxlY3RUYWIgKHRhYj86IFRhYikge1xuXG4gICAgICAgIGlmICh0YWIpIHtcblxuICAgICAgICAgICAgdGFiLmRlc2VsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0YWIucGFuZWwpIHRhYi5wYW5lbC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWItcGFuZWwnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIHotaW5kZXg6IDE7XG4gICAgICAgIHBhZGRpbmc6IDAgMXJlbTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMCB2YXIoLS1ib3JkZXItcmFkaXVzKSB2YXIoLS1ib3JkZXItcmFkaXVzKSB2YXIoLS1ib3JkZXItcmFkaXVzKTtcbiAgICAgICAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWhpZGRlbj10cnVlXSkge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWJQYW5lbCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWhpZGRlbicsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sXG4gICAgfSlcbiAgICBoaWRkZW4hOiBib29sZWFuO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1sYWJlbGxlZGJ5JyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICBsYWJlbGxlZEJ5ITogc3RyaW5nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3RhYnBhbmVsJ1xuICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAtMTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuL2tleXMnO1xuXG5AY29tcG9uZW50PFRvZ2dsZT4oe1xuICAgIHNlbGVjdG9yOiAndWktdG9nZ2xlJyxcbiAgICB0ZW1wbGF0ZTogdG9nZ2xlID0+IGh0bWxgXG4gICAgPHN0eWxlPlxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICAtLXRpbWluZy1jdWJpYzogY3ViaWMtYmV6aWVyKDAuNTUsIDAuMDYsIDAuNjgsIDAuMTkpO1xuICAgICAgICAgICAgLS10aW1pbmctc2luZTogY3ViaWMtYmV6aWVyKDAuNDcsIDAsIDAuNzUsIDAuNzIpO1xuICAgICAgICAgICAgLS10cmFuc2l0aW9uLXRpbWluZzogdmFyKC0tdGltaW5nLXNpbmUpO1xuICAgICAgICAgICAgLS10cmFuc2l0aW9uLWR1cmF0aW9uOiAuMXM7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWdyaWQ7XG4gICAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KHZhcigtLWZvbnQtc2l6ZSksIDFmcikpO1xuXG4gICAgICAgICAgICBtaW4td2lkdGg6IGNhbGModmFyKC0tZm9udC1zaXplKSAqIDIgKyB2YXIoLS1ib3JkZXItd2lkdGgpICogMik7XG4gICAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZm9udC1zaXplKSArIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pICogMik7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogdmFyKC0tZm9udC1zaXplLCAxcmVtKTtcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG5cbiAgICAgICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tZm9udC1zaXplLCAxcmVtKTtcblxuICAgICAgICAgICAgLyogdHJhbnNpdGlvbi1wcm9wZXJ0eTogYmFja2dyb3VuZC1jb2xvciwgYm9yZGVyLWNvbG9yO1xuICAgICAgICAgICAgdHJhbnNpdGlvbi1kdXJhdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbik7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjogdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpOyAqL1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9dHJ1ZV0pIHtcbiAgICAgICAgICAgIGJvcmRlci1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbbGFiZWwtb25dW2xhYmVsLW9mZl0pIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgIH1cbiAgICAgICAgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBoZWlnaHQ6IHZhcigtLWZvbnQtc2l6ZSk7XG4gICAgICAgICAgICB3aWR0aDogdmFyKC0tZm9udC1zaXplKTtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2xhYmVsLW9uXVtsYWJlbC1vZmZdKSAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIHdpZHRoOiA1MCU7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IDA7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgbGVmdDogNTAlO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdW2xhYmVsLW9uXVtsYWJlbC1vZmZdKSAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICB9XG4gICAgICAgIC5sYWJlbCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBwYWRkaW5nOiAwIC4yNXJlbTtcbiAgICAgICAgICAgIGFsaWduLXNlbGY6IHN0cmV0Y2g7XG4gICAgICAgICAgICBqdXN0aWZ5LXNlbGY6IHN0cmV0Y2g7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgICAgICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl0pIC5sYWJlbC1vbiB7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cImZhbHNlXCJdKSAubGFiZWwtb2ZmIHtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgfVxuXG4gICAgPC9zdHlsZT5cbiAgICA8c3BhbiBjbGFzcz1cInRvZ2dsZS10aHVtYlwiPjwvc3Bhbj5cbiAgICAkeyB0b2dnbGUubGFiZWxPbiAmJiB0b2dnbGUubGFiZWxPZmZcbiAgICAgICAgICAgID8gaHRtbGA8c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9mZlwiPiR7IHRvZ2dsZS5sYWJlbE9mZiB9PC9zcGFuPjxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtb25cIj4keyB0b2dnbGUubGFiZWxPbiB9PC9zcGFuPmBcbiAgICAgICAgICAgIDogJydcbiAgICAgICAgfVxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgVG9nZ2xlIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtY2hlY2tlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW5cbiAgICB9KVxuICAgIGNoZWNrZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBsYWJlbCA9ICcnO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZmFsc2VcbiAgICB9KVxuICAgIGxhYmVsT24gPSAnJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6IGZhbHNlXG4gICAgfSlcbiAgICBsYWJlbE9mZiA9ICcnO1xuXG4gICAgQHByb3BlcnR5KClcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3N3aXRjaCc7XG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAnY2xpY2snXG4gICAgfSlcbiAgICB0b2dnbGUgKCkge1xuXG4gICAgICAgIC8vIHRyaWdnZXIgcHJvcGVydHktY2hhbmdlIGV2ZW50IGZvciBgY2hlY2tlZGBcbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2tleWRvd24nXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcblxuICAgICAgICAgICAgLy8gcHJldmVudCBzcGFjZSBrZXkgZnJvbSBzY3JvbGxpbmcgdGhlIHBhZ2VcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgc2VsZWN0b3IsIGxpc3RlbmVyLCBDaGFuZ2VzLCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBjc3MgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7IGFjdGl2ZUVsZW1lbnQgfSBmcm9tICcuL2RvbSc7XG5pbXBvcnQgeyBGb2N1c01vbml0b3IsIEZvY3VzQ2hhbmdlRXZlbnQgfSBmcm9tICcuL2ZvY3VzJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdmb2N1cy1jb250YWluZXInLFxuICAgIHRlbXBsYXRlOiBlbGVtZW50ID0+IGh0bWxgXG4gICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIvPiA8YnV0dG9uPk9LPC9idXR0b24+XG4gICAgYCxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICB9XG4gICAgYF0sXG59KVxuZXhwb3J0IGNsYXNzIEZvY3VzQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01vbml0b3IgPSBuZXcgRm9jdXNNb25pdG9yKCk7XG5cbiAgICBAcHJvcGVydHkoeyBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciB9KVxuICAgIHRhYmluZGV4ID0gMDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLmZvY3VzTW9uaXRvci5hdHRhY2godGhpcyk7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5mb2N1c01vbml0b3IuZGV0YWNoKCk7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG59XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZXZlbnQtb3JkZXItZGVtbycsXG4gICAgdGVtcGxhdGU6IGVsZW1lbnQgPT4gaHRtbGBcbiAgICA8Zm9jdXMtY29udGFpbmVyIGlkPVwib25lXCI+PC9mb2N1cy1jb250YWluZXI+XG4gICAgPGZvY3VzLWNvbnRhaW5lciBpZD1cInR3b1wiPjwvZm9jdXMtY29udGFpbmVyPlxuICAgIGAsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgfVxuICAgIGBdLFxufSlcbmV4cG9ydCBjbGFzcyBFdmVudE9yZGVyRGVtbyBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjb25lJyB9KVxuICAgIGNvbnRhaW5lck9uZSE6IEhUTUxFbGVtZW50O1xuXG4gICAgQHNlbGVjdG9yKHsgcXVlcnk6ICcjdHdvJyB9KVxuICAgIGNvbnRhaW5lclR3byE6IEhUTUxFbGVtZW50O1xuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0Q2hhbmdlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0Q2hhbmdlKSB7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmlucHV0T25lLCAnZm9jdXNpbicsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNJbihldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgICAgICAvLyB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5pbnB1dE9uZSwgJ2ZvY3Vzb3V0JywgZXZlbnQgPT4gdGhpcy5oYW5kbGVGb2N1c091dChldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgICAgICAvLyB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5pbnB1dE9uZSwgJ2ZvY3VzJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVGb2N1cyhldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgICAgICAvLyB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5pbnB1dE9uZSwgJ2JsdXInLCBldmVudCA9PiB0aGlzLmhhbmRsZUJsdXIoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuY29udGFpbmVyT25lLCAnZm9jdXMtY2hhbmdlZCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNDaGFuZ2UoZXZlbnQgYXMgRm9jdXNDaGFuZ2VFdmVudCkpO1xuXG4gICAgICAgICAgICAvLyB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5pbnB1dFR3bywgJ2ZvY3VzaW4nLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzSW4oZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRUd28sICdmb2N1c291dCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNPdXQoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRUd28sICdmb2N1cycsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXMoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuaW5wdXRUd28sICdibHVyJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVCbHVyKGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmNvbnRhaW5lclR3bywgJ2ZvY3VzLWNoYW5nZWQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzQ2hhbmdlKGV2ZW50IGFzIEZvY3VzQ2hhbmdlRXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci51bmxpc3RlbkFsbCgpO1xuXG4gICAgICAgIHN1cGVyLmRpc2Nvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdmb2N1c2luJywgdGFyZ2V0OiBkb2N1bWVudCB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0luIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdAZm9jdXNpbjogJywgKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5pZCwgYWN0aXZlRWxlbWVudCgpKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogJ2ZvY3Vzb3V0JywgdGFyZ2V0OiBkb2N1bWVudCB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c091dCAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnQGZvY3Vzb3V0OiAnLCAoZXZlbnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmlkLCBhY3RpdmVFbGVtZW50KCkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1cyAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnQGZvY3VzOiAnLCAoZXZlbnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmlkLCBhY3RpdmVFbGVtZW50KCkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVCbHVyIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdAYmx1cjogJywgKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5pZCwgYWN0aXZlRWxlbWVudCgpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNDaGFuZ2UgKGV2ZW50OiBGb2N1c0NoYW5nZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coYEBmb2N1cy1jaGFuZ2VkWyR7IGV2ZW50LmRldGFpbC5oYXNGb2N1cyB9XTogYCwgKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5pZCwgYWN0aXZlRWxlbWVudCgpLCBkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgJy4vYWNjb3JkaW9uL2FjY29yZGlvbic7XG5pbXBvcnQgeyBzdHlsZXMgfSBmcm9tICcuL2FwcC5zdHlsZXMnO1xuaW1wb3J0IHsgdGVtcGxhdGUgfSBmcm9tICcuL2FwcC50ZW1wbGF0ZSc7XG5pbXBvcnQgJy4vY2FyZCc7XG5pbXBvcnQgJy4vY2hlY2tib3gnO1xuaW1wb3J0ICcuL2ljb24vaWNvbic7XG5pbXBvcnQgJy4vb3ZlcmxheS1uZXcvZGVtbyc7XG5pbXBvcnQgJy4vdGFicy90YWInO1xuaW1wb3J0ICcuL3RhYnMvdGFiLWxpc3QnO1xuaW1wb3J0ICcuL3RhYnMvdGFiLXBhbmVsJztcbmltcG9ydCAnLi90b2dnbGUnO1xuaW1wb3J0ICcuL2V2ZW50LW9yZGVyLWRlbW8nXG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGVtby1hcHAnLFxuICAgIHNoYWRvdzogZmFsc2UsXG4gICAgc3R5bGVzOiBbc3R5bGVzXSxcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbn0pXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHsgfVxuIiwiaW1wb3J0ICcuL3NyYy9hcHAnO1xuXG5mdW5jdGlvbiBib290c3RyYXAgKCkge1xuXG4gICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd1aS1jaGVja2JveCcpO1xuXG4gICAgaWYgKGNoZWNrYm94KSB7XG5cbiAgICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hlY2tlZC1jaGFuZ2VkJywgZXZlbnQgPT4gY29uc29sZS5sb2coKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwpKTtcbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYm9vdHN0cmFwKTtcbiJdLCJuYW1lcyI6WyJwcmVwYXJlQ29uc3RydWN0b3IiLCJUYWIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLElBNkNPLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLO0lBQ2xDLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUM7SUFDRjs7SUM5REE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEtBQUssU0FBUztJQUMvRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMseUJBQXlCO0lBQ25ELFFBQVEsU0FBUyxDQUFDO0FBQ2xCLElBWUE7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sV0FBVyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLO0lBQzdELElBQUksT0FBTyxLQUFLLEtBQUssR0FBRyxFQUFFO0lBQzFCLFFBQVEsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNwQyxRQUFRLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLEtBQUs7SUFDTCxDQUFDLENBQUM7SUFDRjs7SUMxQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQzNCO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQzFCOztJQ3RCQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xFO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0MsSUFBTyxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakU7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQztJQUM1QztJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sUUFBUSxDQUFDO0lBQ3RCLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7SUFDakMsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUN4QixRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQy9CLFFBQVEsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLFFBQVEsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ3pCO0lBQ0EsUUFBUSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLCtDQUErQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakk7SUFDQTtJQUNBO0lBQ0EsUUFBUSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFDOUIsUUFBUSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2QixRQUFRLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUMxQixRQUFRLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFDdkQsUUFBUSxPQUFPLFNBQVMsR0FBRyxNQUFNLEVBQUU7SUFDbkMsWUFBWSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0MsWUFBWSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7SUFDL0I7SUFDQTtJQUNBO0lBQ0E7SUFDQSxnQkFBZ0IsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDakQsZ0JBQWdCLFNBQVM7SUFDekIsYUFBYTtJQUNiLFlBQVksS0FBSyxFQUFFLENBQUM7SUFDcEIsWUFBWSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQywwQkFBMEI7SUFDN0QsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO0lBQzFDLG9CQUFvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3ZELG9CQUFvQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQ2xEO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxvQkFBb0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLG9CQUFvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3JELHdCQUF3QixJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLEVBQUU7SUFDaEYsNEJBQTRCLEtBQUssRUFBRSxDQUFDO0lBQ3BDLHlCQUF5QjtJQUN6QixxQkFBcUI7SUFDckIsb0JBQW9CLE9BQU8sS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3hDO0lBQ0E7SUFDQSx3QkFBd0IsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pFO0lBQ0Esd0JBQXdCLE1BQU0sSUFBSSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0Esd0JBQXdCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLG9CQUFvQixDQUFDO0lBQzlGLHdCQUF3QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDdEYsd0JBQXdCLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNsRSx3QkFBd0IsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxRSx3QkFBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDOUYsd0JBQXdCLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN4RCxxQkFBcUI7SUFDckIsaUJBQWlCO0lBQ2pCLGdCQUFnQixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFO0lBQ2pELG9CQUFvQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLG9CQUFvQixNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEQsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixpQkFBaUIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsdUJBQXVCO0lBQy9ELGdCQUFnQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3ZDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQy9DLG9CQUFvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ25ELG9CQUFvQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVELG9CQUFvQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN6RDtJQUNBO0lBQ0Esb0JBQW9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDeEQsd0JBQXdCLElBQUksTUFBTSxDQUFDO0lBQ25DLHdCQUF3QixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0Msd0JBQXdCLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUN0Qyw0QkFBNEIsTUFBTSxHQUFHLFlBQVksRUFBRSxDQUFDO0lBQ3BELHlCQUF5QjtJQUN6Qiw2QkFBNkI7SUFDN0IsNEJBQTRCLE1BQU0sS0FBSyxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSw0QkFBNEIsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtJQUM1RixnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLG9DQUFvQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRiw2QkFBNkI7SUFDN0IsNEJBQTRCLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLHlCQUF5QjtJQUN6Qix3QkFBd0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUQsd0JBQXdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzFFLHFCQUFxQjtJQUNyQjtJQUNBO0lBQ0Esb0JBQW9CLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUNuRCx3QkFBd0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRSx3QkFBd0IsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxxQkFBcUI7SUFDckIseUJBQXlCO0lBQ3pCLHdCQUF3QixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxxQkFBcUI7SUFDckI7SUFDQSxvQkFBb0IsU0FBUyxJQUFJLFNBQVMsQ0FBQztJQUMzQyxpQkFBaUI7SUFDakIsYUFBYTtJQUNiLGlCQUFpQixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQywwQkFBMEI7SUFDbEUsZ0JBQWdCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7SUFDMUMsb0JBQW9CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDbkQ7SUFDQTtJQUNBO0lBQ0E7SUFDQSxvQkFBb0IsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssYUFBYSxFQUFFO0lBQ2xGLHdCQUF3QixLQUFLLEVBQUUsQ0FBQztJQUNoQyx3QkFBd0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRSxxQkFBcUI7SUFDckIsb0JBQW9CLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDMUMsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzdEO0lBQ0E7SUFDQSxvQkFBb0IsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRTtJQUNuRCx3QkFBd0IsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdkMscUJBQXFCO0lBQ3JCLHlCQUF5QjtJQUN6Qix3QkFBd0IsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCx3QkFBd0IsS0FBSyxFQUFFLENBQUM7SUFDaEMscUJBQXFCO0lBQ3JCLG9CQUFvQixTQUFTLEVBQUUsQ0FBQztJQUNoQyxpQkFBaUI7SUFDakIscUJBQXFCO0lBQ3JCLG9CQUFvQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQixvQkFBb0IsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO0lBQzFFO0lBQ0E7SUFDQTtJQUNBO0lBQ0Esd0JBQXdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLHdCQUF3QixTQUFTLEVBQUUsQ0FBQztJQUNwQyxxQkFBcUI7SUFDckIsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixTQUFTO0lBQ1Q7SUFDQSxRQUFRLEtBQUssTUFBTSxDQUFDLElBQUksYUFBYSxFQUFFO0lBQ3ZDLFlBQVksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsU0FBUztJQUNULEtBQUs7SUFDTCxDQUFDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLO0lBQ2xDLElBQUksTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzdDLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQ3JELENBQUMsQ0FBQztBQUNGLElBQU8sTUFBTSxvQkFBb0IsR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2hFO0lBQ0E7QUFDQSxJQUFPLE1BQU0sWUFBWSxHQUFHLE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3RDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLHNCQUFzQixHQUFHLDRJQUE0SSxDQUFDO0lBQ25MOztJQ3BOQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBS0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sZ0JBQWdCLENBQUM7SUFDOUIsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUU7SUFDOUMsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUMxQixRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQ2pDLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDbkMsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMvQixLQUFLO0lBQ0wsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0lBQ25CLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLFFBQVEsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0lBQ3pDLFlBQVksSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO0lBQ3BDLGdCQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLGFBQWE7SUFDYixZQUFZLENBQUMsRUFBRSxDQUFDO0lBQ2hCLFNBQVM7SUFDVCxRQUFRLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtJQUN6QyxZQUFZLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtJQUNwQyxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzlCLGFBQWE7SUFDYixTQUFTO0lBQ1QsS0FBSztJQUNMLElBQUksTUFBTSxHQUFHO0lBQ2I7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxRQUFRLE1BQU0sUUFBUSxHQUFHLFlBQVk7SUFDckMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztJQUN6RCxZQUFZLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JFLFFBQVEsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLFFBQVEsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDMUM7SUFDQSxRQUFRLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRywrQ0FBK0MsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFILFFBQVEsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFFBQVEsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFFBQVEsSUFBSSxJQUFJLENBQUM7SUFDakIsUUFBUSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckM7SUFDQSxRQUFRLE9BQU8sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7SUFDekMsWUFBWSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLFlBQVksSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFFO0lBQzdDLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3QyxnQkFBZ0IsU0FBUyxFQUFFLENBQUM7SUFDNUIsZ0JBQWdCLFNBQVM7SUFDekIsYUFBYTtJQUNiO0lBQ0E7SUFDQTtJQUNBLFlBQVksT0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRTtJQUMzQyxnQkFBZ0IsU0FBUyxFQUFFLENBQUM7SUFDNUIsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxVQUFVLEVBQUU7SUFDbEQsb0JBQW9CLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsb0JBQW9CLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0RCxpQkFBaUI7SUFDakIsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUksRUFBRTtJQUN6RDtJQUNBO0lBQ0E7SUFDQTtJQUNBLG9CQUFvQixNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNyRCxvQkFBb0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QyxpQkFBaUI7SUFDakIsYUFBYTtJQUNiO0lBQ0EsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO0lBQ3RDLGdCQUFnQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRSxnQkFBZ0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDM0QsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLGFBQWE7SUFDYixpQkFBaUI7SUFDakIsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzdILGFBQWE7SUFDYixZQUFZLFNBQVMsRUFBRSxDQUFDO0lBQ3hCLFNBQVM7SUFDVCxRQUFRLElBQUksWUFBWSxFQUFFO0lBQzFCLFlBQVksUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxZQUFZLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsU0FBUztJQUNULFFBQVEsT0FBTyxRQUFRLENBQUM7SUFDeEIsS0FBSztJQUNMLENBQUM7SUFDRDs7SUN4SUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUtBLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQztJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxjQUFjLENBQUM7SUFDNUIsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0lBQ2xELFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDL0IsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUM3QixRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDbkMsS0FBSztJQUNMO0lBQ0E7SUFDQTtJQUNBLElBQUksT0FBTyxHQUFHO0lBQ2QsUUFBUSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDMUMsUUFBUSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdEIsUUFBUSxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUNyQyxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDcEMsWUFBWSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RDO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxZQUFZLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEQ7SUFDQTtJQUNBO0lBQ0EsWUFBWSxnQkFBZ0IsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxnQkFBZ0I7SUFDcEUsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN6RDtJQUNBO0lBQ0E7SUFDQSxZQUFZLE1BQU0sY0FBYyxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxZQUFZLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtJQUN6QztJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsZ0JBQWdCLElBQUksSUFBSSxDQUFDLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBQzVFLGFBQWE7SUFDYixpQkFBaUI7SUFDakI7SUFDQTtJQUNBO0lBQ0EsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUM3RSxvQkFBb0IsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLG9CQUFvQixHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDaEYsb0JBQW9CLE1BQU0sQ0FBQztJQUMzQixhQUFhO0lBQ2IsU0FBUztJQUNULFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsUUFBUSxPQUFPLElBQUksQ0FBQztJQUNwQixLQUFLO0lBQ0wsSUFBSSxrQkFBa0IsR0FBRztJQUN6QixRQUFRLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDNUQsUUFBUSxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1QyxRQUFRLE9BQU8sUUFBUSxDQUFDO0lBQ3hCLEtBQUs7SUFDTCxDQUFDO0FBQ0QsSUFvQkE7O0lDaEhBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFTTyxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssS0FBSztJQUN0QyxJQUFJLFFBQVEsS0FBSyxLQUFLLElBQUk7SUFDMUIsUUFBUSxFQUFFLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUMsRUFBRTtJQUNyRSxDQUFDLENBQUM7QUFDRixJQUFPLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBSyxLQUFLO0lBQ3JDLElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUMvQjtJQUNBLFFBQVEsQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDO0lBQ0Y7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxrQkFBa0IsQ0FBQztJQUNoQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtJQUN4QyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzFCLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDL0IsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUN6QixRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQy9CLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDeEIsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDckQsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMvQyxTQUFTO0lBQ1QsS0FBSztJQUNMO0lBQ0E7SUFDQTtJQUNBLElBQUksV0FBVyxHQUFHO0lBQ2xCLFFBQVEsT0FBTyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxLQUFLO0lBQ0wsSUFBSSxTQUFTLEdBQUc7SUFDaEIsUUFBUSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3JDLFFBQVEsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDckMsUUFBUSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdEIsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3BDLFlBQVksSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixZQUFZLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsWUFBWSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7SUFDcEMsZ0JBQWdCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDckMsZ0JBQWdCLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ3RELG9CQUFvQixJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsaUJBQWlCO0lBQ2pCLHFCQUFxQjtJQUNyQixvQkFBb0IsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDdkMsd0JBQXdCLElBQUksSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RSxxQkFBcUI7SUFDckIsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixTQUFTO0lBQ1QsUUFBUSxJQUFJLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLFFBQVEsT0FBTyxJQUFJLENBQUM7SUFDcEIsS0FBSztJQUNMLElBQUksTUFBTSxHQUFHO0lBQ2IsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7SUFDeEIsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUMvQixZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDbkUsU0FBUztJQUNULEtBQUs7SUFDTCxDQUFDO0lBQ0Q7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLGFBQWEsQ0FBQztJQUMzQixJQUFJLFdBQVcsQ0FBQyxTQUFTLEVBQUU7SUFDM0IsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztJQUMvQixRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ25DLEtBQUs7SUFDTCxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7SUFDcEIsUUFBUSxJQUFJLEtBQUssS0FBSyxRQUFRLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUNqRixZQUFZLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQy9CO0lBQ0E7SUFDQTtJQUNBLFlBQVksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUNyQyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQzVDLGFBQWE7SUFDYixTQUFTO0lBQ1QsS0FBSztJQUNMLElBQUksTUFBTSxHQUFHO0lBQ2IsUUFBUSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDeEMsWUFBWSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3pDLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7SUFDbEMsWUFBWSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsU0FBUztJQUNULFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtJQUNyQyxZQUFZLE9BQU87SUFDbkIsU0FBUztJQUNULFFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQyxLQUFLO0lBQ0wsQ0FBQztJQUNEO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sUUFBUSxDQUFDO0lBQ3RCLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtJQUN6QixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0lBQy9CLFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7SUFDeEMsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMvQixLQUFLO0lBQ0w7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRTtJQUMxQixRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDN0QsS0FBSztJQUNMO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsSUFBSSxlQUFlLENBQUMsR0FBRyxFQUFFO0lBQ3pCLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFDN0IsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7SUFDdkMsS0FBSztJQUNMO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUU7SUFDekIsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUN2RCxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELEtBQUs7SUFDTDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsSUFBSSxlQUFlLENBQUMsR0FBRyxFQUFFO0lBQ3pCLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDdEQsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDbkMsUUFBUSxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDckMsS0FBSztJQUNMLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtJQUNwQixRQUFRLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLEtBQUs7SUFDTCxJQUFJLE1BQU0sR0FBRztJQUNiLFFBQVEsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO0lBQ2pELFlBQVksTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUNsRCxZQUFZLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0lBQzNDLFlBQVksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLFNBQVM7SUFDVCxRQUFRLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDMUMsUUFBUSxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUU7SUFDaEMsWUFBWSxPQUFPO0lBQ25CLFNBQVM7SUFDVCxRQUFRLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQ2hDLFlBQVksSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRTtJQUN0QyxnQkFBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QyxhQUFhO0lBQ2IsU0FBUztJQUNULGFBQWEsSUFBSSxLQUFLLFlBQVksY0FBYyxFQUFFO0lBQ2xELFlBQVksSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLFNBQVM7SUFDVCxhQUFhLElBQUksS0FBSyxZQUFZLElBQUksRUFBRTtJQUN4QyxZQUFZLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsU0FBUztJQUNULGFBQWEsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDcEMsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsU0FBUztJQUNULGFBQWEsSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFO0lBQ3BDLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7SUFDakMsWUFBWSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDekIsU0FBUztJQUNULGFBQWE7SUFDYjtJQUNBLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxTQUFTO0lBQ1QsS0FBSztJQUNMLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtJQUNuQixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pFLEtBQUs7SUFDTCxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUU7SUFDeEIsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO0lBQ2xDLFlBQVksT0FBTztJQUNuQixTQUFTO0lBQ1QsUUFBUSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDM0IsS0FBSztJQUNMLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRTtJQUN4QixRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO0lBQ2hELFFBQVEsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUMzQztJQUNBO0lBQ0EsUUFBUSxNQUFNLGFBQWEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRixRQUFRLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZTtJQUNqRCxZQUFZLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyx1QkFBdUI7SUFDdEQ7SUFDQTtJQUNBO0lBQ0EsWUFBWSxJQUFJLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQztJQUN0QyxTQUFTO0lBQ1QsYUFBYTtJQUNiLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDdEUsU0FBUztJQUNULFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDM0IsS0FBSztJQUNMLElBQUksc0JBQXNCLENBQUMsS0FBSyxFQUFFO0lBQ2xDLFFBQVEsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0QsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLFlBQVksZ0JBQWdCO0lBQ2xELFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO0lBQzlDLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLFNBQVM7SUFDVCxhQUFhO0lBQ2I7SUFDQTtJQUNBO0lBQ0E7SUFDQSxZQUFZLE1BQU0sUUFBUSxHQUFHLElBQUksZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNGLFlBQVksTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQy9DLFlBQVksUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsWUFBWSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7SUFDbEMsU0FBUztJQUNULEtBQUs7SUFDTCxJQUFJLGdCQUFnQixDQUFDLEtBQUssRUFBRTtJQUM1QjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN4QyxZQUFZLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQzVCLFlBQVksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3pCLFNBQVM7SUFDVDtJQUNBO0lBQ0EsUUFBUSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3JDLFFBQVEsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFFBQVEsSUFBSSxRQUFRLENBQUM7SUFDckIsUUFBUSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtJQUNsQztJQUNBLFlBQVksUUFBUSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QztJQUNBLFlBQVksSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0lBQ3hDLGdCQUFnQixRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELGdCQUFnQixTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3pDLGdCQUFnQixJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7SUFDckMsb0JBQW9CLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsaUJBQWlCO0lBQ2pCLHFCQUFxQjtJQUNyQixvQkFBb0IsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixZQUFZLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsWUFBWSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDOUIsWUFBWSxTQUFTLEVBQUUsQ0FBQztJQUN4QixTQUFTO0lBQ1QsUUFBUSxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFO0lBQzFDO0lBQ0EsWUFBWSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztJQUN6QyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyRCxTQUFTO0lBQ1QsS0FBSztJQUNMLElBQUksS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO0lBQ3RDLFFBQVEsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BGLEtBQUs7SUFDTCxDQUFDO0lBQ0Q7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0sb0JBQW9CLENBQUM7SUFDbEMsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7SUFDeEMsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztJQUMvQixRQUFRLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBQ3hDLFFBQVEsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDNUUsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7SUFDdkYsU0FBUztJQUNULFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDL0IsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUN6QixRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQy9CLEtBQUs7SUFDTCxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7SUFDcEIsUUFBUSxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUNwQyxLQUFLO0lBQ0wsSUFBSSxNQUFNLEdBQUc7SUFDYixRQUFRLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtJQUNqRCxZQUFZLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDbEQsWUFBWSxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUMzQyxZQUFZLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixTQUFTO0lBQ1QsUUFBUSxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssUUFBUSxFQUFFO0lBQzlDLFlBQVksT0FBTztJQUNuQixTQUFTO0lBQ1QsUUFBUSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM1QyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7SUFDbEMsWUFBWSxJQUFJLEtBQUssRUFBRTtJQUN2QixnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6RCxhQUFhO0lBQ2IsaUJBQWlCO0lBQ2pCLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsYUFBYTtJQUNiLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDL0IsU0FBUztJQUNULFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFDdkMsS0FBSztJQUNMLENBQUM7SUFDRDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUFPLE1BQU0saUJBQWlCLFNBQVMsa0JBQWtCLENBQUM7SUFDMUQsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7SUFDeEMsUUFBUSxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0QyxRQUFRLElBQUksQ0FBQyxNQUFNO0lBQ25CLGFBQWEsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDN0UsS0FBSztJQUNMLElBQUksV0FBVyxHQUFHO0lBQ2xCLFFBQVEsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxLQUFLO0lBQ0wsSUFBSSxTQUFTLEdBQUc7SUFDaEIsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7SUFDekIsWUFBWSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLFNBQVM7SUFDVCxRQUFRLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLEtBQUs7SUFDTCxJQUFJLE1BQU0sR0FBRztJQUNiLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0lBQ3hCLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDL0I7SUFDQSxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2RCxTQUFTO0lBQ1QsS0FBSztJQUNMLENBQUM7QUFDRCxJQUFPLE1BQU0sWUFBWSxTQUFTLGFBQWEsQ0FBQztJQUNoRCxDQUFDO0lBQ0Q7SUFDQTtJQUNBO0lBQ0E7SUFDQSxJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztJQUNsQyxJQUFJO0lBQ0osSUFBSSxNQUFNLE9BQU8sR0FBRztJQUNwQixRQUFRLElBQUksT0FBTyxHQUFHO0lBQ3RCLFlBQVkscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0lBQ3pDLFlBQVksT0FBTyxLQUFLLENBQUM7SUFDekIsU0FBUztJQUNULEtBQUssQ0FBQztJQUNOO0lBQ0EsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RDtJQUNBLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELE9BQU8sRUFBRSxFQUFFO0lBQ1gsQ0FBQztBQUNELElBQU8sTUFBTSxTQUFTLENBQUM7SUFDdkIsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUU7SUFDbEQsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztJQUMvQixRQUFRLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBQ3hDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDL0IsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUNuQyxRQUFRLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ3pDLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsS0FBSztJQUNMLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtJQUNwQixRQUFRLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLEtBQUs7SUFDTCxJQUFJLE1BQU0sR0FBRztJQUNiLFFBQVEsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO0lBQ2pELFlBQVksTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUNsRCxZQUFZLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0lBQzNDLFlBQVksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLFNBQVM7SUFDVCxRQUFRLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxRQUFRLEVBQUU7SUFDOUMsWUFBWSxPQUFPO0lBQ25CLFNBQVM7SUFDVCxRQUFRLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDaEQsUUFBUSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLFFBQVEsTUFBTSxvQkFBb0IsR0FBRyxXQUFXLElBQUksSUFBSTtJQUN4RCxZQUFZLFdBQVcsSUFBSSxJQUFJO0lBQy9CLGlCQUFpQixXQUFXLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQyxPQUFPO0lBQzVELG9CQUFvQixXQUFXLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxJQUFJO0lBQ3pELG9CQUFvQixXQUFXLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRSxRQUFRLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxJQUFJLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxJQUFJLG9CQUFvQixDQUFDLENBQUM7SUFDdkcsUUFBUSxJQUFJLG9CQUFvQixFQUFFO0lBQ2xDLFlBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEcsU0FBUztJQUNULFFBQVEsSUFBSSxpQkFBaUIsRUFBRTtJQUMvQixZQUFZLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JELFlBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkcsU0FBUztJQUNULFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7SUFDakMsUUFBUSxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUN2QyxLQUFLO0lBQ0wsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO0lBQ3ZCLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO0lBQzlDLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RFLFNBQVM7SUFDVCxhQUFhO0lBQ2IsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxTQUFTO0lBQ1QsS0FBSztJQUNMLENBQUM7SUFDRDtJQUNBO0lBQ0E7SUFDQSxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzNCLEtBQUsscUJBQXFCO0lBQzFCLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtJQUNoRSxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQjs7SUMvYkE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQSxJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSx3QkFBd0IsQ0FBQztJQUN0QztJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxJQUFJLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtJQUNoRSxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixRQUFRLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtJQUM1QixZQUFZLE1BQU0sU0FBUyxHQUFHLElBQUksaUJBQWlCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckYsWUFBWSxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUM7SUFDbkMsU0FBUztJQUNULFFBQVEsSUFBSSxNQUFNLEtBQUssR0FBRyxFQUFFO0lBQzVCLFlBQVksT0FBTyxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLFNBQVM7SUFDVCxRQUFRLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtJQUM1QixZQUFZLE9BQU8sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0UsU0FBUztJQUNULFFBQVEsTUFBTSxTQUFTLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pFLFFBQVEsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQy9CLEtBQUs7SUFDTDtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksb0JBQW9CLENBQUMsT0FBTyxFQUFFO0lBQ2xDLFFBQVEsT0FBTyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxLQUFLO0lBQ0wsQ0FBQztBQUNELElBQU8sTUFBTSx3QkFBd0IsR0FBRyxJQUFJLHdCQUF3QixFQUFFLENBQUM7SUFDdkU7O0lDbkRBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFO0lBQ3hDLElBQUksSUFBSSxhQUFhLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsSUFBSSxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7SUFDckMsUUFBUSxhQUFhLEdBQUc7SUFDeEIsWUFBWSxZQUFZLEVBQUUsSUFBSSxPQUFPLEVBQUU7SUFDdkMsWUFBWSxTQUFTLEVBQUUsSUFBSSxHQUFHLEVBQUU7SUFDaEMsU0FBUyxDQUFDO0lBQ1YsUUFBUSxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDdkQsS0FBSztJQUNMLElBQUksSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLElBQUksSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0lBQ2hDLFFBQVEsT0FBTyxRQUFRLENBQUM7SUFDeEIsS0FBSztJQUNMO0lBQ0E7SUFDQSxJQUFJLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDO0lBQ0EsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEQsSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7SUFDaEM7SUFDQSxRQUFRLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztJQUNyRTtJQUNBLFFBQVEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELEtBQUs7SUFDTDtJQUNBLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3RCxJQUFJLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7QUFDRCxJQUFPLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDeEM7O0lDL0NBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFNTyxNQUFNLEtBQUssR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQ25DO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sS0FBSztJQUN0RCxJQUFJLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsSUFBSSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7SUFDNUIsUUFBUSxXQUFXLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRCxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9GLFFBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQyxLQUFLO0lBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztJQUNGOztJQzdDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBOEJBO0lBQ0E7SUFDQTtJQUNBLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlFO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sS0FBSyxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2xILElBS0E7O0lDeEJBOzs7Ozs7Ozs7QUFTQSxJQUFPLE1BQU0seUJBQXlCLEdBQXVCO1FBQ3pELGFBQWEsRUFBRSxDQUFDLEtBQW9COztZQUVoQyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtnQkFDaEMsT0FBTyxJQUFJLENBQUM7YUFDZjs7Z0JBRUcsSUFBSTs7b0JBRUEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM1QjtnQkFDRCxPQUFPLEtBQUssRUFBRTs7b0JBRVYsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO1NBQ1I7UUFDRCxXQUFXLEVBQUUsQ0FBQyxLQUFVO1lBQ3BCLFFBQVEsT0FBTyxLQUFLO2dCQUNoQixLQUFLLFNBQVM7b0JBQ1YsT0FBTyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDN0IsS0FBSyxRQUFRO29CQUNULE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzRCxLQUFLLFdBQVc7b0JBQ1osT0FBTyxLQUFLLENBQUM7Z0JBQ2pCLEtBQUssUUFBUTtvQkFDVCxPQUFPLEtBQUssQ0FBQztnQkFDakI7b0JBQ0ksT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDL0I7U0FDSjtLQUNKLENBQUM7SUFFRjs7Ozs7QUFLQSxJQUFPLE1BQU0seUJBQXlCLEdBQXFDO1FBQ3ZFLGFBQWEsRUFBRSxDQUFDLEtBQW9CLE1BQU0sS0FBSyxLQUFLLElBQUksQ0FBQztRQUN6RCxXQUFXLEVBQUUsQ0FBQyxLQUFxQixLQUFLLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSTtLQUM1RCxDQUFBO0lBRUQ7Ozs7QUFJQSxJQUFPLE1BQU0sNkJBQTZCLEdBQXFDO1FBQzNFLGFBQWEsRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTTs7UUFFMUMsV0FBVyxFQUFFLENBQUMsS0FBSyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUNyRSxDQUFDO0FBRUYsSUFBTyxNQUFNLHdCQUF3QixHQUFvQztRQUNyRSxhQUFhLEVBQUUsQ0FBQyxLQUFvQixLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSzs7UUFFeEUsV0FBVyxFQUFFLENBQUMsS0FBb0IsS0FBSyxLQUFLO0tBQy9DLENBQUE7QUFFRCxJQUFPLE1BQU0sd0JBQXdCLEdBQW9DO1FBQ3JFLGFBQWEsRUFBRSxDQUFDLEtBQW9CLEtBQUssQ0FBQyxLQUFLLEtBQUssSUFBSSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOztRQUVoRixXQUFXLEVBQUUsQ0FBQyxLQUFvQixLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUNwRixDQUFBO0FBRUQ7O0lDMUJBOzs7QUFHQSxJQUFPLE1BQU0sNkJBQTZCLEdBQXlCO1FBQy9ELFFBQVEsRUFBRSxFQUFFO1FBQ1osTUFBTSxFQUFFLElBQUk7UUFDWixNQUFNLEVBQUUsSUFBSTtLQUNmLENBQUM7OztJQ25GRjs7Ozs7QUFLQSxhQUFnQixTQUFTLENBQXNDLFVBQStDLEVBQUU7UUFFNUcsTUFBTSxXQUFXLG1DQUFRLDZCQUE2QixHQUFLLE9BQU8sQ0FBRSxDQUFDO1FBRXJFLE9BQU8sQ0FBQyxNQUF3QjtZQUU1QixNQUFNLFdBQVcsR0FBRyxNQUFnQyxDQUFDO1lBRXJELFdBQVcsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQy9ELFdBQVcsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztZQUN4QyxXQUFXLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQzs7WUFHL0QsTUFBTSxxQkFBcUIsR0FBMkIsb0JBQW9CLENBQUM7WUFDM0UsTUFBTSxTQUFTLEdBQTJCLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7OztZQWNuRCxNQUFNLGtCQUFrQixHQUFHO2dCQUN2QixHQUFHLElBQUksR0FBRzs7Z0JBRU4sV0FBVyxDQUFDLGtCQUFrQjs7cUJBRXpCLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEtBQUssVUFBVSxDQUFDLE1BQU0sQ0FDaEQsV0FBVyxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQ2pGLEVBQWMsQ0FDakI7O3FCQUVBLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQzdDO2FBQ0osQ0FBQzs7WUFHRixPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUM7Ozs7Ozs7O1lBUzlCLE1BQU0sTUFBTSxHQUFHO2dCQUNYLEdBQUcsSUFBSSxHQUFHLENBQ04sQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztzQkFDaEMsV0FBVyxDQUFDLE1BQU07c0JBQ2xCLEVBQUUsRUFDTixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FDckM7YUFDSixDQUFDOzs7OztZQU1GLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLHFCQUFxQixFQUFFO2dCQUN2RCxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLEdBQUc7b0JBQ0MsT0FBTyxrQkFBa0IsQ0FBQztpQkFDN0I7YUFDSixDQUFDLENBQUM7Ozs7O1lBTUgsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFO2dCQUMzQyxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLEdBQUc7b0JBQ0MsT0FBTyxNQUFNLENBQUM7aUJBQ2pCO2FBQ0osQ0FBQyxDQUFDO1lBRUgsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUVwQixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ25FO1NBQ0osQ0FBQztJQUNOLENBQUM7QUFBQTs7SUNoR0Q7Ozs7O0FBS0EsYUFBZ0IsUUFBUSxDQUFzQyxPQUFrQztRQUU1RixPQUFPLFVBQVUsTUFBYyxFQUFFLFdBQW1CLEVBQUUsVUFBOEI7WUFFaEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQStCLENBQUM7WUFFM0Qsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFaEMsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtnQkFFeEIsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7YUFFN0M7aUJBQU07Z0JBRUgsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGtCQUFLLE9BQU8sQ0FBeUIsQ0FBQyxDQUFDO2FBQ2pGO1NBQ0osQ0FBQTtJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7O0lBZUEsU0FBUyxrQkFBa0IsQ0FBRSxXQUE2QjtRQUV0RCxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFBRSxXQUFXLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6RyxDQUFDOzs7SUNoQk0sTUFBTSw0QkFBNEIsR0FBd0I7UUFDN0QsS0FBSyxFQUFFLElBQUk7UUFDWCxHQUFHLEVBQUUsS0FBSztLQUNiLENBQUM7OztJQ2hDRjs7Ozs7Ozs7OztBQVVBLGFBQWdCLHFCQUFxQixDQUFFLE1BQWMsRUFBRSxXQUF3QjtRQUUzRSxJQUFJLFdBQVcsSUFBSSxNQUFNLEVBQUU7WUFFdkIsT0FBTyxNQUFNLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFFaEMsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUVwQyxPQUFPLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQy9EO2dCQUVELE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFDO1NBQ0o7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDOzs7SUNaRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxVQUFhLGlCQUFrQixTQUFRLEtBQUs7UUFFeEMsWUFBYSxPQUFnQjtZQUV6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFZixJQUFJLENBQUMsSUFBSSxHQUFHLG1CQUFtQixDQUFDO1NBQ25DO0tBQ0o7SUFFRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTFFOzs7Ozs7Ozs7Ozs7QUFZQSxhQUFnQixTQUFTLENBQVcsSUFBYTtRQUU3QyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFckIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7WUFTbkMsT0FBTyxJQUFJLE9BQU8sQ0FBSSxDQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUVsQyxJQUFJLFFBQVEsRUFBRTtvQkFFVixNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2lCQUVqQztxQkFBTTtvQkFFSCxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDbEM7YUFDSixDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztBQVlBLGFBQWdCLFNBQVMsQ0FBVyxJQUFhO1FBRTdDLElBQUksTUFBbUIsQ0FBQztRQUV4QixNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBSSxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBRTNDLElBQUksT0FBTyxHQUF1QixVQUFVLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RixNQUFNLEdBQUc7Z0JBRUwsSUFBSSxPQUFPLEVBQUU7b0JBQ1QsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN0QixPQUFPLEdBQUcsU0FBUyxDQUFDO29CQUNwQixNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2lCQUNqQzthQUNKLENBQUM7U0FDTCxDQUFDLENBQUM7UUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O0FBWUEsYUFBZ0Isa0JBQWtCLENBQVcsSUFBYTtRQUV0RCxJQUFJLE1BQW1CLENBQUM7UUFFeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUUzQyxJQUFJLGNBQWMsR0FBdUIscUJBQXFCLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXJHLE1BQU0sR0FBRztnQkFFTCxJQUFJLGNBQWMsRUFBRTtvQkFDaEIsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ3JDLGNBQWMsR0FBRyxTQUFTLENBQUM7b0JBQzNCLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7aUJBQ2pDO2FBQ0osQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7Ozs7SUFNQSxTQUFTLE9BQU8sQ0FBVyxJQUFhLEVBQUUsT0FBMkIsRUFBRSxNQUE2QjtRQUVoRyxJQUFJO1lBRUEsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FFbkI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUVaLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqQjtJQUNMLENBQUM7OztJQ3hLRDs7Ozs7QUFLQSxhQUFnQixRQUFRLENBQXNDLE9BQWtDO1FBRTVGLE9BQU8sVUFDSCxNQUFjLEVBQ2QsV0FBd0IsRUFDeEIsa0JBQXVDOztZQUd2QyxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEYsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQU0sV0FBVyxDQUFDLFFBQVEsRUFBRyxFQUFFLENBQUMsQ0FBQztZQUUxRCxNQUFNLE1BQU0sR0FBRyxPQUFBLFVBQVUsMENBQUUsR0FBRyxLQUFJLGNBQXVCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNuRixNQUFNLE1BQU0sR0FBRyxPQUFBLFVBQVUsMENBQUUsR0FBRyxLQUFJLFVBQXFCLEtBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUVoRyxNQUFNLGlCQUFpQixHQUF1QjtnQkFDMUMsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixHQUFHO29CQUNDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDNUI7Z0JBQ0QsR0FBRyxDQUFjLEtBQVU7b0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOzs7Ozs7b0JBTXpCLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBRWhDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO3FCQUN6QztpQkFDSjthQUNKLENBQUE7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBK0IsQ0FBQztZQUUzRCxPQUFPLG1DQUFRLDRCQUE0QixHQUFLLE9BQU8sQ0FBRSxDQUFDO1lBRTFEQSxvQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVoQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUV4QixXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUU3QztpQkFBTTtnQkFFSCxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsa0JBQUssT0FBTyxDQUF5QixDQUFDLENBQUM7YUFDakY7WUFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUU7OztnQkFJckIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUM7YUFFakU7aUJBQU07OztnQkFJSCxPQUFPLGlCQUFpQixDQUFDO2FBQzVCO1NBQ0osQ0FBQTtJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7O0lBZUEsU0FBU0Esb0JBQWtCLENBQUUsV0FBNkI7UUFFdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQUUsV0FBVyxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekcsQ0FBQzs7O0lDNUZELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQztJQUM1QixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUM7QUFDL0IsYUFzQ2dCLFNBQVMsQ0FBRSxNQUFjO1FBRXJDLElBQUksT0FBTyxDQUFDO1FBRVosSUFBSSxNQUFNLEVBQUU7WUFFUixNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXZCLFFBQVEsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUc7Z0JBRXBDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRELE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCO1lBRUQsUUFBUSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFFcEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCO1NBQ0o7UUFFRCxPQUFPLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQ2xELENBQUM7OztJQ3pDRDs7Ozs7QUFLQSxhQUFnQixvQkFBb0IsQ0FBRSxTQUFjO1FBRWhELE9BQU8sT0FBTyxTQUFTLEtBQUssVUFBVSxDQUFDO0lBQzNDLENBQUM7SUFFRDs7Ozs7QUFLQSxhQUFnQixtQkFBbUIsQ0FBRSxTQUFjO1FBRS9DLE9BQU8sT0FBTyxTQUFTLEtBQUssVUFBVSxDQUFDO0lBQzNDLENBQUM7SUFFRDs7Ozs7QUFLQSxhQUFnQixrQkFBa0IsQ0FBRSxRQUFhO1FBRTdDLE9BQU8sT0FBTyxRQUFRLEtBQUssVUFBVSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7QUFLQSxhQUFnQix3QkFBd0IsQ0FBRSxRQUFhO1FBRW5ELE9BQU8sT0FBTyxRQUFRLEtBQUssVUFBVSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7QUFLQSxhQUFnQixhQUFhLENBQUUsR0FBUTtRQUVuQyxPQUFPLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDO0lBQ3pGLENBQUM7SUFFRDs7Ozs7O0FBTUEsYUFBZ0IsZUFBZSxDQUFFLEtBQWE7UUFFMUMsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEJBLGFBQWdCLG1CQUFtQixDQUFFLFdBQXdCO1FBRXpELElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO1lBRWpDLE9BQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBRWpDO2FBQU07O1lBR0gsT0FBTyxRQUFTLGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUUsRUFBRSxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O0FBYUEsYUFBZ0IsZUFBZSxDQUFFLFdBQXdCLEVBQUUsTUFBZSxFQUFFLE1BQWU7UUFFdkYsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBRXhCLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO1lBRWpDLGNBQWMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7U0FFM0M7YUFBTTs7WUFHSCxjQUFjLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsT0FBTyxHQUFJLE1BQU0sR0FBRyxHQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUUsR0FBRyxHQUFHLEVBQUcsR0FBSSxjQUFlLEdBQUksTUFBTSxHQUFHLElBQUssU0FBUyxDQUFDLE1BQU0sQ0FBRSxFQUFFLEdBQUcsRUFBRyxFQUFFLENBQUM7SUFDekgsQ0FBQztJQTJGRDs7Ozs7OztBQU9BLElBQU8sTUFBTSw2QkFBNkIsR0FBMkIsQ0FBQyxRQUFhLEVBQUUsUUFBYTs7O1FBRzlGLE9BQU8sUUFBUSxLQUFLLFFBQVEsS0FBSyxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQztJQUNyRixDQUFDLENBQUM7SUFFRjtJQUNBO0FBQ0EsSUFBTyxNQUFNLDRCQUE0QixHQUEyQixDQUFDLFFBQWEsRUFBRSxRQUFhO1FBQzdGLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDckcsQ0FBQyxDQUFBO0FBRUQsSUFJQTs7O0FBR0EsSUFBTyxNQUFNLDRCQUE0QixHQUF3Qjs7UUFFN0QsU0FBUyxFQUFFLElBQUk7UUFDZixTQUFTLEVBQUUseUJBQXlCO1FBQ3BDLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsZUFBZSxFQUFFLElBQUk7UUFDckIsTUFBTSxFQUFFLElBQUk7UUFDWixPQUFPLEVBQUUsNkJBQTZCO0tBQ3pDLENBQUM7OztJQy9RRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStCQSxhQUFnQixRQUFRLENBQXNDLFVBQThDLEVBQUU7UUFFMUcsT0FBTyxVQUNILE1BQWMsRUFDZCxXQUF3QixFQUN4QixrQkFBdUM7Ozs7Ozs7Ozs7Ozs7O1lBZXZDLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixJQUFJLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNwRixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBTSxXQUFXLENBQUMsUUFBUSxFQUFHLEVBQUUsQ0FBQyxDQUFDOzs7WUFJMUQsTUFBTSxNQUFNLEdBQUcsT0FBQSxVQUFVLDBDQUFFLEdBQUcsS0FBSSxjQUF1QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDbkYsTUFBTSxNQUFNLEdBQUcsT0FBQSxVQUFVLDBDQUFFLEdBQUcsS0FBSSxVQUFxQixLQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7OztZQUloRyxNQUFNLGlCQUFpQixHQUF1QztnQkFDMUQsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixHQUFHO29CQUNDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDNUI7Z0JBQ0QsR0FBRyxDQUFFLEtBQVU7b0JBQ1gsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7OztvQkFHekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDaEU7YUFDSixDQUFBO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQXFDLENBQUM7WUFFakUsTUFBTSxXQUFXLG1DQUFtQyw0QkFBNEIsR0FBSyxPQUFPLENBQUUsQ0FBQzs7WUFHL0YsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtnQkFFaEMsV0FBVyxDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM1RDs7WUFHRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO2dCQUU5QixXQUFXLENBQUMsT0FBTyxHQUFHLDRCQUE0QixDQUFDLE9BQU8sQ0FBQzthQUM5RDtZQUVEQSxvQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7WUFHaEMsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFFLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7WUFHM0gsSUFBSSxTQUFTLEVBQUU7O2dCQUdYLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQW1CLENBQUMsQ0FBQzs7Z0JBRW5ELFdBQVcsQ0FBQyxVQUFXLENBQUMsR0FBRyxDQUFDLFNBQW1CLENBQUMsQ0FBQzthQUNwRDtZQUVELElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRTtnQkFFdkIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNsRTs7O1lBSUQsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFdBQWtDLENBQUMsQ0FBQztZQUU1RSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7OztnQkFJckIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUM7YUFFakU7aUJBQU07OztnQkFJSCxPQUFPLGlCQUFpQixDQUFDO2FBQzVCO1NBQ0osQ0FBQztJQUNOLENBQUM7QUFBQSxJQUVEOzs7Ozs7Ozs7Ozs7Ozs7SUFlQSxTQUFTQSxvQkFBa0IsQ0FBRSxXQUFtQzs7O1FBSTVELE1BQU0sVUFBVSxHQUFpQyxZQUFZLENBQUM7UUFDOUQsTUFBTSxVQUFVLEdBQWlDLFlBQVksQ0FBQztRQUM5RCxNQUFNLFVBQVUsR0FBaUMsWUFBWSxDQUFDO1FBRTlELElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztZQUFFLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztZQUFFLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztZQUFFLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNwRixDQUFDOzs7SUNyS0Q7Ozs7Ozs7QUFPQSxJQUFPLE1BQU0sa0JBQWtCLEdBQWM7UUFDekMsT0FBTyxFQUFFLElBQUk7UUFDYixVQUFVLEVBQUUsSUFBSTtRQUNoQixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDO0lBY0Y7Ozs7Ozs7QUFPQSxVQUFhLGNBQXlELFNBQVEsV0FBd0M7UUFFbEgsWUFBYSxJQUFZLEVBQUUsTUFBbUMsRUFBRSxPQUFrQixFQUFFO1lBRWhGLE1BQU0sU0FBUyxpREFDUixrQkFBa0IsR0FDbEIsSUFBSSxLQUNQLE1BQU0sR0FDVCxDQUFDO1lBRUYsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMxQjtLQUNKO0lBV0Q7Ozs7Ozs7O0FBUUEsVUFBYSxtQkFBOEQsU0FBUSxjQUErQztRQUU5SCxZQUFhLFdBQXdCLEVBQUUsTUFBdUMsRUFBRSxJQUFnQjtZQUU1RixNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV6RCxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM3QjtLQUNKO0lBRUQ7Ozs7Ozs7QUFPQSxVQUFhLGNBQXlELFNBQVEsY0FBb0I7UUFFOUYsWUFBYSxTQUE4RCxFQUFFLE1BQW1DLEVBQUUsSUFBZ0I7WUFFOUgsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEM7S0FDSjs7O0lDckZEOzs7SUFHQSxNQUFNLHlCQUF5QixHQUFHLENBQUMsa0JBQTBDLEtBQUssSUFBSSxLQUFLLENBQUMsdUNBQXdDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBRSxHQUFHLENBQUMsQ0FBQztJQUNwSzs7O0lBR0EsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLGlCQUF5QyxLQUFLLElBQUksS0FBSyxDQUFDLHNDQUF1QyxNQUFNLENBQUMsaUJBQWlCLENBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEs7OztJQUdBLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxnQkFBd0MsS0FBSyxJQUFJLEtBQUssQ0FBQyxxQ0FBc0MsTUFBTSxDQUFDLGdCQUFnQixDQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVKOzs7SUFHQSxNQUFNLHFCQUFxQixHQUFHLENBQUMsY0FBc0MsS0FBSyxJQUFJLEtBQUssQ0FBQyw0Q0FBNkMsTUFBTSxDQUFDLGNBQWMsQ0FBRSxHQUFHLENBQUMsQ0FBQztJQTBCN0o7OztBQUdBLFVBQXNCLFNBQVUsU0FBUSxXQUFXOzs7O1FBcVIvQyxZQUFhLEdBQUcsSUFBVztZQUV2QixLQUFLLEVBQUUsQ0FBQzs7Ozs7WUFyRUosbUJBQWMsR0FBcUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Ozs7WUFNekQsdUJBQWtCLEdBQTBCLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7O1lBTXRELDBCQUFxQixHQUEwQixJQUFJLEdBQUcsRUFBRSxDQUFDOzs7OztZQU16RCx5QkFBb0IsR0FBMEIsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Ozs7WUFNeEQsMEJBQXFCLEdBQWtDLEVBQUUsQ0FBQzs7Ozs7WUFNMUQsZ0JBQVcsR0FBRyxLQUFLLENBQUM7Ozs7O1lBTXBCLHdCQUFtQixHQUFHLEtBQUssQ0FBQzs7Ozs7WUFNNUIsa0JBQWEsR0FBRyxLQUFLLENBQUM7WUE2QjFCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDOUM7Ozs7Ozs7Ozs7O1FBdFFPLFdBQVcsVUFBVTtZQUV6QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFFM0QsSUFBSTs7OztvQkFLQSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7b0JBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBRXhEO2dCQUFDLE9BQU8sS0FBSyxFQUFFLEdBQUc7YUFDdEI7WUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDM0I7Ozs7Ozs7Ozs7O1FBb0JPLFdBQVcsWUFBWTtZQUUzQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFFN0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzRDtZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUM3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTBGRCxXQUFXLE1BQU07WUFFYixPQUFPLEVBQUUsQ0FBQztTQUNiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTBDRCxXQUFXLGtCQUFrQjtZQUV6QixPQUFPLEVBQUUsQ0FBQztTQUNiOzs7Ozs7Ozs7OztRQTRERCxJQUFJLFVBQVU7WUFFVixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDM0I7Ozs7Ozs7OztRQXlCRCxlQUFlO1lBRVgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3BDOzs7Ozs7Ozs7UUFVRCxpQkFBaUI7WUFFYixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDOzs7Ozs7Ozs7UUFVRCxvQkFBb0I7WUFFaEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRWpCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVqQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQWtDRCx3QkFBd0IsQ0FBRSxTQUFpQixFQUFFLFFBQXVCLEVBQUUsUUFBdUI7WUFFekYsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLFFBQVEsS0FBSyxRQUFRO2dCQUFFLE9BQU87WUFFeEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDeEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBOEJELGNBQWMsQ0FBRSxPQUFnQixFQUFFLFdBQW9CLEtBQUs7Ozs7Ozs7Ozs7O1FBWWpELE1BQU0sQ0FBRSxTQUFpQixFQUFFLFNBQTJCOzs7O1lBSzVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxXQUFXLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDN0Q7UUFzQlMsUUFBUSxDQUFXLFdBQTJCLEVBQUUsTUFBVSxFQUFFLE9BQTJCLEVBQUU7WUFFL0YsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUU7Z0JBRWpDLFdBQVcsR0FBRyxJQUFJLGNBQWMsQ0FBSSxXQUFXLGtCQUFJLE1BQU0sRUFBRSxJQUFJLElBQUssTUFBTyxHQUFJLElBQUksQ0FBQyxDQUFBO2FBQ3ZGO1lBRUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQXVDUyxLQUFLLENBQUUsUUFBb0I7O1lBR2pDLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztZQUd6RCxRQUFRLEVBQUUsQ0FBQzs7WUFHWCxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUUzRCxNQUFNLEtBQUssR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBRW5HLElBQUksS0FBSyxJQUFJLE9BQU8sRUFBRTtvQkFFbEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3hEO2FBQ0o7U0FDSjs7Ozs7Ozs7Ozs7Ozs7UUFlUyxhQUFhLENBQUUsV0FBeUIsRUFBRSxRQUFjLEVBQUUsUUFBYztZQUU5RSxJQUFJLFdBQVcsRUFBRTs7O2dCQUliLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO29CQUFFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQzs7Z0JBR2xGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzs7OztnQkFNbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhO29CQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ2xGO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTs7Z0JBRzNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN6QjtZQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztTQUM5Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFpQ1MsTUFBTSxDQUFFLEdBQUcsT0FBYztZQUUvQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBK0IsQ0FBQztZQUV6RCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFFaEYsSUFBSSxRQUFRO2dCQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQzNFOzs7Ozs7Ozs7Ozs7OztRQWVTLE1BQU0sQ0FBRSxPQUFnQixFQUFFLFdBQW9CLEVBQUUsYUFBc0IsRUFBRSxjQUF1QixLQUFLO1lBRTFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7WUFHZCxJQUFJLFdBQVcsRUFBRTtnQkFFYixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOzs7OztnQkFLZixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFFbEI7aUJBQU07Z0JBRUgsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOzthQUdsQjtZQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDeEM7Ozs7Ozs7UUFRUyxLQUFLO1lBRVgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7U0FDekM7Ozs7Ozs7Ozs7Ozs7O1FBZVMsVUFBVSxDQUFFLFdBQXdCLEVBQUUsUUFBYSxFQUFFLFFBQWE7WUFFeEUsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7O1lBR3JFLElBQUksbUJBQW1CLElBQUksd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRTlFLElBQUk7b0JBQ0EsT0FBTyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBRXJFO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUVaLE1BQU0scUJBQXFCLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzVEO2FBQ0o7WUFFRCxPQUFPLEtBQUssQ0FBQztTQUNoQjs7Ozs7O1FBT1Msc0JBQXNCLENBQUUsV0FBd0I7WUFFdEQsT0FBUSxJQUFJLENBQUMsV0FBZ0MsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzdFOzs7Ozs7Ozs7Ozs7UUFhUyxpQkFBaUIsQ0FBRSxVQUFrQztZQUUzRCxVQUFVLElBQUcsVUFBVSxhQUFWLFVBQVUsY0FBVixVQUFVLEdBQUksSUFBSSxDQUFDLHFCQUE2QyxDQUFBLENBQUM7WUFFOUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXO2dCQUVyQyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQXlCLENBQUMsQ0FBQyxDQUFDO2FBQ2hGLENBQUMsQ0FBQztTQUNOOzs7Ozs7Ozs7Ozs7UUFhUyxnQkFBZ0IsQ0FBRSxVQUFrQztZQUUxRCxVQUFVLElBQUcsVUFBVSxhQUFWLFVBQVUsY0FBVixVQUFVLEdBQUksSUFBSSxDQUFDLG9CQUE0QyxDQUFBLENBQUM7WUFFN0UsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXO2dCQUVyQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQXlCLENBQUMsQ0FBQyxDQUFDO2FBQy9FLENBQUMsQ0FBQztTQUNOOzs7Ozs7Ozs7Ozs7Ozs7UUFnQlMsZ0JBQWdCLENBQUUsYUFBcUIsRUFBRSxRQUF1QixFQUFFLFFBQXVCO1lBRS9GLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUErQixDQUFDO1lBRXpELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDOzs7WUFJOUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFFZCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF3QixhQUFjLDRCQUE0QixDQUFDLENBQUM7Z0JBRWhGLE9BQU87YUFDVjtZQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBRSxDQUFDOztZQUd0RSxJQUFJLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFO2dCQUV0QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFFMUIsSUFBSSxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO29CQUU1RCxJQUFJO3dCQUNBLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztxQkFFdEY7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBRVosTUFBTSx5QkFBeUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUN6RTtpQkFFSjtxQkFBTSxJQUFJLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO29CQUU1RCxJQUFJO3dCQUNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBd0IsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUV6RztvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFFWixNQUFNLHlCQUF5QixDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7cUJBQ3pFO2lCQUVKO3FCQUFNO29CQUVILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUM3RDtnQkFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQzthQUM5QjtTQUNKOzs7Ozs7Ozs7Ozs7Ozs7UUFnQlMsZUFBZSxDQUFFLFdBQXdCLEVBQUUsUUFBYSxFQUFFLFFBQWE7WUFFN0UsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7O1lBR3JFLElBQUksbUJBQW1CLElBQUksbUJBQW1CLENBQUMsZUFBZSxFQUFFOztnQkFHNUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7Z0JBRTFCLElBQUksbUJBQW1CLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBRTFELElBQUk7d0JBQ0EsbUJBQW1CLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztxQkFFbkY7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBRVosTUFBTSx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztxQkFDdkU7aUJBRUo7cUJBQU0sSUFBSSxhQUFhLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBRTNELElBQUk7d0JBQ0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBdUIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUVyRztvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFFWixNQUFNLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxDQUFDO3FCQUN2RTtpQkFFSjtxQkFBTTtvQkFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFDMUQ7Z0JBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7YUFDOUI7U0FDSjs7Ozs7Ozs7Ozs7Ozs7O1FBZ0JTLGNBQWMsQ0FBRSxXQUF3QixFQUFFLFFBQWEsRUFBRSxRQUFhO1lBRTVFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXJFLElBQUksbUJBQW1CLElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFO2dCQUVuRCxJQUFJLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUVoRCxJQUFJO3dCQUNBLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7cUJBRTFFO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUVaLE1BQU0sdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7cUJBQ3hFO2lCQUVKO3FCQUFNLElBQUksYUFBYSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUVsRCxJQUFJO3dCQUNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQXNCLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztxQkFFM0Y7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBRVosTUFBTSx1QkFBdUIsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDN0Q7aUJBRUo7cUJBQU07b0JBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUN6RDthQUNKO1NBQ0o7Ozs7Ozs7Ozs7O1FBWU8saUJBQWlCO1lBRXJCLE9BQVEsSUFBSSxDQUFDLFdBQWdDLENBQUMsTUFBTTtrQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztrQkFDbkMsSUFBSSxDQUFDO1NBQ2Q7Ozs7Ozs7Ozs7Ozs7UUFjTyxNQUFNO1lBRVYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQStCLENBQUM7WUFFekQsSUFBSSxVQUFxQyxDQUFDO1lBQzFDLElBQUksWUFBMEMsQ0FBQzs7Ozs7WUFNL0MsS0FBSyxVQUFVLEdBQUcsV0FBVyxDQUFDLFVBQVUsR0FBRzs7Z0JBR3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO29CQUVyQixJQUFLLFFBQWlDLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzt3QkFBRSxPQUFPO29CQUV0RixRQUFpQyxDQUFDLGtCQUFrQixHQUFHO3dCQUNwRCxHQUFJLFFBQWlDLENBQUMsa0JBQWtCO3dCQUN4RCxVQUFVO3FCQUNiLENBQUM7aUJBRUw7cUJBQU07OztvQkFJRixJQUFJLENBQUMsVUFBeUIsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNyRTthQUVKO2lCQUFNLEtBQUssWUFBWSxHQUFHLFdBQVcsQ0FBQyxZQUFZLEdBQUc7O2dCQUdsRCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxNQUFNO3NCQUN0QyxLQUFLO3NCQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQztnQkFFNUcsSUFBSSxpQkFBaUI7b0JBQUUsT0FBTzs7Z0JBRzlCLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTNDLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtvQkFFcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRXRDO3FCQUFNO29CQUVILFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNwQzthQUNKO1NBQ0o7Ozs7Ozs7Ozs7Ozs7OztRQWdCTyxpQkFBaUIsQ0FBRSxhQUFxQixFQUFFLFFBQXVCLEVBQUUsUUFBdUI7WUFFOUYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQStCLENBQUM7WUFFekQsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFFLENBQUM7WUFFL0QsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFFLENBQUM7WUFFdEUsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXZGLElBQUksQ0FBQyxXQUF5QixDQUFDLEdBQUcsYUFBYSxDQUFDO1NBQ25EOzs7Ozs7Ozs7Ozs7Ozs7UUFnQk8sZ0JBQWdCLENBQUUsV0FBd0IsRUFBRSxRQUFhLEVBQUUsUUFBYTs7WUFHNUUsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFFLENBQUM7OztZQUl0RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUztnQkFBRSxPQUFPOztZQUczQyxNQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxTQUFtQixDQUFDOztZQUc5RCxNQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7O1lBR3RGLElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTtnQkFFOUIsT0FBTzthQUNWOztpQkFFSSxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0JBRTlCLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7YUFFdkM7aUJBQU07Z0JBRUgsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDcEQ7U0FDSjs7Ozs7Ozs7Ozs7UUFZTyxlQUFlLENBQVcsV0FBd0IsRUFBRSxRQUFXLEVBQUUsUUFBVztZQUVoRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksbUJBQW1CLENBQUMsV0FBVyxFQUFFO2dCQUMvQyxNQUFNLEVBQUUsSUFBSTtnQkFDWixRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRTtnQkFDaEMsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLE9BQU8sRUFBRSxRQUFRO2FBQ3BCLENBQUMsQ0FBQyxDQUFDO1NBQ1A7Ozs7Ozs7Ozs7UUFXTyxnQkFBZ0IsQ0FBRSxTQUE4RCxFQUFFLFNBQWlCLEVBQUU7WUFFekcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxTQUFTLGtCQUN0QyxNQUFNLEVBQUUsSUFBSSxJQUNULE1BQU0sRUFDWCxDQUFDLENBQUM7U0FDUDs7Ozs7OztRQVFPLE9BQU87WUFFVixJQUFJLENBQUMsV0FBZ0MsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLFFBQVE7Z0JBRTNFLE1BQU0sbUJBQW1CLEdBQWdDOztvQkFHckQsS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLO29CQUN4QixPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU87O29CQUc1QixRQUFRLEVBQUcsSUFBSSxDQUFDLFFBQXNCLENBQThCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7b0JBRy9FLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxXQUFXLENBQUMsTUFBTSxLQUFLLFVBQVU7MEJBQzVDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzswQkFDN0IsV0FBVyxDQUFDLE1BQU07MkJBQ2pCLElBQUk7aUJBQ2QsQ0FBQzs7Z0JBR0YsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUN2QyxtQkFBbUIsQ0FBQyxLQUFNLEVBQzFCLG1CQUFtQixDQUFDLFFBQVEsRUFDNUIsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7O2dCQUdqQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDeEQsQ0FBQyxDQUFDO1NBQ047Ozs7Ozs7UUFRTyxTQUFTO1lBRWIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVc7Z0JBRTNDLFdBQVcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQ2xDLFdBQVcsQ0FBQyxLQUFNLEVBQ2xCLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM1QixDQUFDLENBQUM7U0FDTjs7Ozs7OztRQVFPLE9BQU87WUFFVixJQUFJLENBQUMsV0FBZ0MsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLFFBQVE7Z0JBRTNFLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLFdBQVcsQ0FBQyxJQUFJLEtBQUssVUFBVTtzQkFDL0MsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3NCQUMzQixXQUFXLENBQUMsSUFBSTt1QkFDZixJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUV2QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRztzQkFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxLQUFNLENBQUM7c0JBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEtBQU0sQ0FBQyxDQUFDO2dCQUU3QyxJQUFJLENBQUMsUUFBc0IsQ0FBQyxHQUFHLE9BQWMsQ0FBQzthQUNqRCxDQUFDLENBQUM7U0FDTjs7Ozs7OztRQVFPLFNBQVM7WUFFWixJQUFJLENBQUMsV0FBZ0MsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLFFBQVE7Z0JBRTNFLElBQUksQ0FBQyxRQUFzQixDQUFDLEdBQUcsU0FBZ0IsQ0FBQzthQUNuRCxDQUFDLENBQUM7U0FDTjs7Ozs7Ozs7Ozs7O1FBYWEsY0FBYzs7Z0JBRXhCLElBQUksT0FBa0MsQ0FBQztnQkFFdkMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQzs7O2dCQUk1QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO2dCQUVoQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksT0FBTyxDQUFVLEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7Ozs7O2dCQU1qRSxNQUFNLGVBQWUsQ0FBQzs7Z0JBR3RCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7Z0JBR3RDLElBQUksTUFBTTtvQkFBRSxNQUFNLE1BQU0sQ0FBQzs7O2dCQUl6QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDOztnQkFHakMsT0FBUSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDdkM7U0FBQTs7Ozs7Ozs7Ozs7O1FBYU8sZUFBZTtZQUVuQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFFbkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBRXpCO2lCQUFNOztnQkFHSCxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQztvQkFFaEQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUV0QixPQUFPLEVBQUUsQ0FBQztpQkFDYixDQUFDLENBQUMsQ0FBQzthQUNQO1NBQ0o7Ozs7Ozs7Ozs7OztRQWFPLGNBQWM7Ozs7WUFLbEIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUVsQixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDakQsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3hELE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOzs7Z0JBSXpELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7OztnQkFJcEUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUViLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVoRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFFdEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7YUFDM0I7U0FDSjs7SUF6ckNEOzs7Ozs7Ozs7SUFTTyxvQkFBVSxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXhEOzs7Ozs7Ozs7SUFTTyxvQkFBVSxHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXJFOzs7Ozs7Ozs7SUFTTyxtQkFBUyxHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXBFOzs7Ozs7Ozs7SUFTTyxtQkFBUyxHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDOzs7SUM5SnhFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdURBLElBQU8sTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUE4QixFQUFFLEdBQUcsYUFBb0I7UUFFdkUsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBWSxFQUFFLElBQVMsRUFBRSxDQUFTLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BILENBQUMsQ0FBQztJQUVGO0lBRUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUVBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFFQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFFQTtJQUVBO0lBQ0E7SUFDQTtJQUNBO0lBRUE7OztJQ3hGTyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDakMsSUFBTyxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDckMsSUFBTyxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDckMsSUFBTyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUM7QUFDdkMsSUFBTyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7QUFDN0IsSUFBTyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDL0IsSUFBTyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDekIsSUFBTyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDekI7O1VDY3NCLGNBQW1DLFNBQVEsV0FBVztRQVl4RSxZQUNXLElBQWlCLEVBQ3hCLEtBQW9CLEVBQ2IsWUFBdUMsVUFBVTtZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQUpELFNBQUksR0FBSixJQUFJLENBQWE7WUFFakIsY0FBUyxHQUFULFNBQVMsQ0FBd0M7WUFUbEQsY0FBUyxHQUErQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBYXhELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFFM0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ25CO1FBRUQsYUFBYTtZQUVULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUMxQjs7UUFFRCxhQUFhLENBQUUsSUFBTyxFQUFFLFdBQVcsR0FBRyxLQUFLO1lBRXZDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sS0FBSyxHQUFpQjtnQkFDeEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxTQUFTO2dCQUM5QixLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLFNBQVM7YUFDaEMsQ0FBQztZQUVGLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsaUJBQWlCLENBQUUsV0FBVyxHQUFHLEtBQUs7WUFFbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDekQ7UUFFRCxxQkFBcUIsQ0FBRSxXQUFXLEdBQUcsS0FBSztZQUV0QyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsa0JBQWtCLENBQUUsV0FBVyxHQUFHLEtBQUs7WUFFbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxpQkFBaUIsQ0FBRSxXQUFXLEdBQUcsS0FBSztZQUVsQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUN6RDtRQUVELGFBQWEsQ0FBRSxLQUFvQjtZQUUvQixNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxZQUFZLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDeEcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNuQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFFcEIsUUFBUSxLQUFLLENBQUMsR0FBRztnQkFFYixLQUFLLElBQUk7b0JBRUwsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQyxPQUFPLEdBQUcsSUFBSSxDQUFDO29CQUNmLE1BQU07Z0JBRVYsS0FBSyxJQUFJO29CQUVMLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDZixNQUFNO2FBQ2I7WUFFRCxJQUFJLE9BQU8sRUFBRTtnQkFFVCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXZCLElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyxXQUFXO29CQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNoRjtTQUNKO1FBRUQsZUFBZSxDQUFFLEtBQWlCO1lBRTlCLE1BQU0sTUFBTSxHQUFhLEtBQUssQ0FBQyxNQUFrQixDQUFDO1lBRWxELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLFlBQVksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLE1BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBRXZFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBRW5DLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFNUMsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLFdBQVc7b0JBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2hGO1NBQ0o7UUFFRCxXQUFXLENBQUUsS0FBaUI7WUFFMUIsTUFBTSxNQUFNLEdBQWEsS0FBSyxDQUFDLE1BQWtCLENBQUM7WUFFbEQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sWUFBWSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTyxDQUFDLFFBQVEsRUFBRTtnQkFFdkUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFFbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBVyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsV0FBVztvQkFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDaEY7U0FDSjtRQUVTLHdCQUF3QixDQUFFLGFBQWlDO1lBRWpFLE1BQU0sS0FBSyxHQUF3QixJQUFJLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDckUsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixRQUFRLEVBQUU7d0JBQ04sS0FBSyxFQUFFLGFBQWE7d0JBQ3BCLElBQUksRUFBRSxDQUFDLE9BQU8sYUFBYSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLFNBQVM7cUJBQ3BGO29CQUNELE9BQU8sRUFBRTt3QkFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVc7d0JBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtxQkFDeEI7aUJBQ0o7YUFDSixDQUF3QixDQUFDO1lBRTFCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7UUFFUyxjQUFjLENBQUUsS0FBbUIsRUFBRSxXQUFXLEdBQUcsS0FBSztZQUU5RCxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUMvQztRQUVTLFlBQVksQ0FBRSxTQUFrQjtZQUV0QyxTQUFTLEdBQUcsQ0FBQyxPQUFPLFNBQVMsS0FBSyxRQUFRO2tCQUNwQyxTQUFTO2tCQUNULENBQUMsT0FBTyxJQUFJLENBQUMsV0FBVyxLQUFLLFFBQVE7c0JBQ2pDLElBQUksQ0FBQyxXQUFXO3NCQUNoQixDQUFDLENBQUMsQ0FBQztZQUViLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN4QyxJQUFJLFNBQVMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckMsT0FBTyxTQUFTLEdBQUcsU0FBUyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUUzRCxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN6RztRQUVTLGdCQUFnQixDQUFFLFNBQWtCO1lBRTFDLFNBQVMsR0FBRyxDQUFDLE9BQU8sU0FBUyxLQUFLLFFBQVE7a0JBQ3BDLFNBQVM7a0JBQ1QsQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssUUFBUTtzQkFDakMsSUFBSSxDQUFDLFdBQVc7c0JBQ2hCLENBQUMsQ0FBQztZQUVaLElBQUksU0FBUyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQyxPQUFPLFNBQVMsR0FBRyxDQUFDLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7Z0JBRW5ELFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDdEM7WUFFRCxPQUFPLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3pHO1FBRVMsYUFBYTtZQUVuQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQztRQUVTLFlBQVk7WUFFbEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNuRDtRQUVTLFFBQVE7O1lBR2QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQztnQkFDckIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFrQixDQUFDO2dCQUN6RCxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQWtCLENBQUM7Z0JBQzNELENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBa0IsQ0FBQztnQkFDL0QsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0MsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDNUY7UUFFUyxVQUFVO1lBRWhCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQy9GO0tBQ0o7QUFFRCxVQUFhLGVBQW9DLFNBQVEsY0FBaUI7UUFFNUQsY0FBYyxDQUFFLEtBQW1CLEVBQUUsV0FBVyxHQUFHLEtBQUs7WUFFOUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFekMsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLFdBQVc7Z0JBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUMvRDtLQUNKOzs7O0lDak1ELElBQWEsSUFBSSxZQUFqQixNQUFhLElBQUssU0FBUSxTQUFTO1FBQW5DOztZQTRESSxTQUFJLEdBQUcsTUFBTSxDQUFDO1lBS2QsUUFBRyxHQUFHLElBQUksQ0FBQTtTQVNiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFoQ2EsT0FBTyxTQUFTLENBQUUsR0FBVztZQUVuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBRXpCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsNkJBQThCLEdBQUksYUFBYSxDQUFDLENBQUM7Z0JBRXJGLElBQUksSUFBSSxFQUFFO29CQUVOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUM7aUJBQ3pEO2FBQ0o7WUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN2QztRQVlELGlCQUFpQjtZQUViLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRTFCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzVDO0tBQ0osQ0FBQTtJQXhFRzs7O0lBR2lCLGFBQVEsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQXVEM0Q7UUFIQyxRQUFRLENBQUM7WUFDTixTQUFTLEVBQUUsV0FBVztTQUN6QixDQUFDOztzQ0FDWTtJQUtkO1FBSEMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLFVBQVU7U0FDeEIsQ0FBQzs7cUNBQ1E7SUFqRUQsSUFBSTtRQTlDaEIsU0FBUyxDQUFPO1lBQ2IsUUFBUSxFQUFFLFNBQVM7WUFDbkIsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBNEJYLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQyxPQUFPO2dCQUNkLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ3hCLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLEtBQUs7c0JBQ3JCLE1BQU8sT0FBTyxDQUFDLElBQUssT0FBTztzQkFDM0IsQ0FBQyxHQUFHLEtBQUssSUFBSTswQkFDVCxNQUFPLE9BQU8sQ0FBQyxJQUFLLE9BQU87MEJBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBRXZCLE9BQU8sSUFBSSxDQUFBOzt5QkFFUSxPQUFPLENBQUMsV0FBMkIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFFLElBQUssSUFBSzswQkFDNUQsT0FBTyxDQUFDLFdBQTJCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxJQUFLLElBQUs7ZUFDMUUsQ0FBQzthQUNYO1NBQ0osQ0FBQztPQUNXLElBQUksQ0EwRWhCOzs7SUMzRkQsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZ0IsU0FBUSxTQUFTO1FBQTlDOztZQUVjLGNBQVMsR0FBRyxLQUFLLENBQUM7WUFxQjVCLGFBQVEsR0FBRyxLQUFLLENBQUM7U0EwQ3BCO1FBekRHLElBQUksUUFBUTtZQUVSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUN6QjtRQUVELElBQUksUUFBUSxDQUFFLEtBQWM7WUFFeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztTQUNwQztRQXdCRCxpQkFBaUI7WUFFYixLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztTQUM1QztRQUtTLGFBQWEsQ0FBRSxLQUFvQjtZQUV6QyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssS0FBSyxFQUFFO2dCQUU1QyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFFeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7b0JBQ3ZDLE9BQU8sRUFBRSxJQUFJO29CQUNiLFVBQVUsRUFBRSxJQUFJO2lCQUNuQixDQUFDLENBQUMsQ0FBQzthQUNQO1NBQ0o7S0FDSixDQUFBO0lBekRHO1FBSkMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLGVBQWU7WUFDMUIsU0FBUyxFQUFFLDZCQUE2QjtTQUMzQyxDQUFDOzs7bURBSUQ7SUFZRDtRQUpDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSxlQUFlO1lBQzFCLFNBQVMsRUFBRSw2QkFBNkI7U0FDM0MsQ0FBQzs7cURBQ2U7SUFNakI7UUFKQyxRQUFRLENBQUM7WUFDTixTQUFTLEVBQUUsZUFBZTtZQUMxQixTQUFTLEVBQUUsd0JBQXdCO1NBQ3RDLENBQUM7O3FEQUNnQjtJQUtsQjtRQUhDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQzs7aURBQ1k7SUFLZDtRQUhDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQzs7cURBQ3VCO0lBYXpCO1FBSEMsUUFBUSxDQUFDO1lBQ04sS0FBSyxFQUFFLFNBQVM7U0FDbkIsQ0FBQzs7eUNBQzhCLGFBQWE7O3dEQVk1QztJQWhFUSxlQUFlO1FBM0IzQixTQUFTLENBQWtCO1lBQ3hCLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FrQlgsQ0FBQztZQUNGLFFBQVEsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFBOzs7O0tBSXhCO1NBQ0osQ0FBQztPQUNXLGVBQWUsQ0FpRTNCOzs7SUM3Rk0sTUFBTSxTQUFTLEdBQW9CLENBQUMsSUFBVSxFQUFFLE1BQWM7UUFFakUsT0FBTyxJQUFJLENBQUEsb0JBQXFCLElBQUksQ0FBQyxXQUFXLEVBQUcsSUFBSyxNQUFNLENBQUMsSUFBSSxFQUFHLEVBQUUsQ0FBQztJQUM3RSxDQUFDLENBQUE7OztJQ0ZELElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBOEM3QixJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFlLFNBQVEsU0FBUztRQTZCekM7WUFFSSxLQUFLLEVBQUUsQ0FBQztZQTdCRixZQUFPLEdBQTJCLElBQUksQ0FBQztZQUN2QyxVQUFLLEdBQXVCLElBQUksQ0FBQztZQWMzQyxVQUFLLEdBQUcsQ0FBQyxDQUFDO1lBS1YsYUFBUSxHQUFHLEtBQUssQ0FBQztZQUtqQixhQUFRLEdBQUcsS0FBSyxDQUFDO1lBTWIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxJQUFJLHNCQUF1QixvQkFBb0IsRUFBRyxFQUFFLENBQUM7U0FDekU7UUE3QkQsSUFBYyxhQUFhO1lBRXZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDakIsS0FBSztnQkFDTCxJQUFJLENBQUMsS0FBSztvQkFDTixHQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBYSxJQUFJO29CQUNoQyxNQUFNLENBQUM7U0FDbEI7UUF3QkQsTUFBTTtZQUVGLElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTzs7WUFHMUIsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFFUCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDL0IsSUFBSSxJQUFJLENBQUMsT0FBTztvQkFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQzNELENBQUMsQ0FBQztTQUNOO1FBRUQsaUJBQWlCO1lBRWIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsY0FBYyxDQUFFLE9BQWdCLEVBQUUsV0FBb0I7WUFFbEQsSUFBSSxXQUFXLEVBQUU7O2dCQUdiLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSyxJQUFJLENBQUMsRUFBRyxPQUFPLENBQUMsQ0FBQzs7Ozs7OztnQkFRakUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQzthQUMxRDtTQUNKOzs7O1FBS1MsTUFBTTtZQUVaLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0I7UUFFUyxTQUFTLENBQUUsTUFBOEI7WUFFL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFFdEIsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUVwQixNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUV0QyxNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksR0FBSSxJQUFJLENBQUMsRUFBRyxTQUFTLENBQUM7WUFDL0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFJLElBQUksQ0FBQyxFQUFHLE9BQU8sQ0FBQztZQUN0QyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDaEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ25DO0tBQ0osQ0FBQTtJQTVFRztRQUhDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQzs7aURBQ1E7SUFLVjtRQUhDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx5QkFBeUI7U0FDdkMsQ0FBQzs7b0RBQ2U7SUFLakI7UUFIQyxRQUFRLENBQUM7WUFDTixTQUFTLEVBQUUseUJBQXlCO1NBQ3ZDLENBQUM7O29EQUNlO0lBM0JSLGNBQWM7UUE1QzFCLFNBQVMsQ0FBaUI7WUFDdkIsUUFBUSxFQUFFLG9CQUFvQjtZQUM5QixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBdUJYLENBQUM7WUFDRixRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBMEIsS0FBSyxJQUFJLENBQUE7OztzQkFHbEMsS0FBSyxDQUFDLEtBQU07aUJBQ2pCLEtBQUssQ0FBQyxNQUFPOzs7O2NBSWhCLEtBQUssQ0FBQyxFQUFHO3lCQUNFLEtBQUssQ0FBQyxhQUFjOzt1QkFFdEIsQ0FBQyxLQUFLLENBQUMsUUFBUzsyQkFDWixLQUFLLENBQUMsRUFBRzs7a0NBRUYsU0FBUyxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsaUJBQWlCLENBQUU7O0tBRXZFO1NBQ0osQ0FBQzs7T0FDVyxjQUFjLENBNkYxQjs7O0lDeEhELElBQWEsU0FBUyxHQUF0QixNQUFhLFNBQVUsU0FBUSxTQUFTO1FBQXhDOztZQU9JLFNBQUksR0FBRyxjQUFjLENBQUM7U0FVekI7UUFSRyxpQkFBaUI7WUFFYixLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztZQUUzQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDbEc7S0FDSixDQUFBO0lBVkc7UUFIQyxRQUFRLENBQUM7WUFDTixnQkFBZ0IsRUFBRSxLQUFLO1NBQzFCLENBQUM7OzJDQUNvQjtJQVBiLFNBQVM7UUFqQnJCLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxjQUFjO1lBQ3hCLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQTs7Ozs7Ozs7OztLQVVYLENBQUM7WUFDRixRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUE7O0tBRW5CO1NBQ0osQ0FBQztPQUNXLFNBQVMsQ0FpQnJCOzs7SUN2Q00sTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUR4QixDQUFDOzs7SUN0REssTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFZLEtBQUssSUFBSSxDQUFBOzs7Ozs7Ozs7Ozs7O2lDQWFaLGVBQWdCO2lDQUNoQixVQUFXO2lDQUNYLE1BQU87aUNBQ1AsV0FBWTtpQ0FDWixhQUFjO2lDQUNkLEtBQU07aUNBQ04sT0FBUTtpQ0FDUixPQUFRO2lDQUNSLFdBQVk7aUNBQ1osc0JBQXVCO2lDQUN2QixhQUFjO2lDQUNkLGlCQUFrQjtpQ0FDbEIsYUFBYztpQ0FDZCxNQUFPOzs7Ozt3REFLZ0IsT0FBUTs7OzZEQUdILE9BQVE7Ozs7Ozs7aUNBT3BDLGVBQWdCLFNBQVUsS0FBTTtpQ0FDaEMsY0FBZSxTQUFVLEtBQU07aUNBQy9CLE1BQU8sU0FBVSxLQUFNO2lDQUN2QixRQUFTLFNBQVUsS0FBTTtpQ0FDekIsV0FBWSxTQUFVLEtBQU07aUNBQzVCLEtBQU0sU0FBVSxLQUFNO2lDQUN0QixPQUFRLFNBQVUsS0FBTTtpQ0FDeEIsT0FBUSxTQUFVLEtBQU07aUNBQ3hCLFdBQVksU0FBVSxLQUFNO2lDQUM1QixhQUFjLFNBQVUsS0FBTTtpQ0FDOUIsTUFBTyxTQUFVLEtBQU07Ozs7O3dEQUtBLE9BQVEsU0FBVSxLQUFNOzs7NkRBR25CLE9BQVEsU0FBVSxLQUFNOzs7Ozs7O2lDQU9wRCxlQUFnQixTQUFVLEtBQU07aUNBQ2hDLE1BQU8sU0FBVSxLQUFNO2lDQUN2QixNQUFPLFNBQVUsS0FBTTtpQ0FDdkIsV0FBWSxTQUFVLEtBQU07aUNBQzVCLE9BQVEsU0FBVSxLQUFNO2lDQUN4QixNQUFPLFNBQVUsS0FBTTtpQ0FDdkIsT0FBUSxTQUFVLEtBQU07aUNBQ3hCLE9BQVEsU0FBVSxLQUFNO2lDQUN4QixRQUFTLFNBQVUsS0FBTTtpQ0FDekIsU0FBVSxTQUFVLEtBQU07aUNBQzFCLE1BQU8sU0FBVSxLQUFNO2lDQUN2QixNQUFPLFNBQVUsS0FBTTtpQ0FDdkIsZ0JBQWlCLFNBQVUsS0FBTTtpQ0FDakMsUUFBUyxTQUFVLEtBQU07Ozs7O3dEQUtGLE9BQVEsU0FBVSxLQUFNOzs7NkRBR25CLE9BQVEsU0FBVSxLQUFNOzs7Ozs7O2lDQU9wRCxlQUFnQixTQUFVLElBQUs7aUNBQy9CLFVBQVcsU0FBVSxJQUFLO2lDQUMxQixNQUFPLFNBQVUsSUFBSztpQ0FDdEIsUUFBUyxTQUFVLElBQUs7aUNBQ3hCLFdBQVksU0FBVSxJQUFLO2lDQUMzQixRQUFTLFNBQVUsSUFBSztpQ0FDeEIsT0FBUSxTQUFVLElBQUs7aUNBQ3ZCLE9BQVEsU0FBVSxJQUFLO2lDQUN2QixPQUFRLFNBQVUsSUFBSztpQ0FDdkIsYUFBYyxTQUFVLElBQUs7aUNBQzdCLFVBQVcsU0FBVSxJQUFLO2lDQUMxQixNQUFPLFNBQVUsSUFBSzs7Ozs7d0RBS0MsT0FBUSxTQUFVLElBQUs7Ozs2REFHbEIsT0FBUSxTQUFVLElBQUs7Ozs7O29DQUtoRCxJQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBc0hyQyxDQUFDOzs7SUM1T047SUFDQSxNQUFNLGNBQWMsR0FBb0MsQ0FBQyxhQUFxQixNQUFNLEtBQUssR0FBRyxDQUFBO2tCQUN6RSxVQUFXOzs7OztDQUs3QixDQUFDO0lBRUYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFBOzs7Ozs7OztNQVFWLGNBQWMsRUFBRzs7Ozs7Q0FLdkIsQ0FBQztJQWFGLElBQWEsSUFBSSxHQUFqQixNQUFhLElBQUssU0FBUSxTQUFTO1FBUy9CLGlCQUFpQjtZQUViLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRTFCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDekM7UUFFRCxvQkFBb0I7WUFFaEIsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFFN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUMzQjtRQU1ELFdBQVcsQ0FBRSxLQUFpQjtZQUUxQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQzNCO1FBTUQsYUFBYSxDQUFFLEtBQW1CO1lBRTlCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMvQztLQUNKLENBQUE7SUFuQ0c7UUFIQyxRQUFRLENBQUM7WUFDTixTQUFTLEVBQUUsS0FBSztTQUNuQixDQUFDOzt5Q0FDZTtJQXNCakI7UUFKQyxRQUFRLENBQU87WUFDWixLQUFLLEVBQUUsT0FBTztZQUNkLE1BQU0sRUFBRSxjQUFjLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFFLENBQUMsRUFBRTtTQUMzRSxDQUFDOzt5Q0FDa0IsVUFBVTs7MkNBRzdCO0lBTUQ7UUFKQyxRQUFRLENBQU87WUFDWixLQUFLLEVBQUUsU0FBUztZQUNoQixNQUFNLEVBQUUsY0FBYyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtTQUM5QyxDQUFDOzt5Q0FDb0IsWUFBWTs7NkNBR2pDO0lBdkNRLElBQUk7UUFYaEIsU0FBUyxDQUFPO1lBQ2IsUUFBUSxFQUFFLFNBQVM7WUFDbkIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2YsUUFBUSxFQUFFLElBQUksSUFBSSxJQUFJLENBQUE7Ozs7MkJBSUUsSUFBSSxDQUFDLE9BQVE7O0tBRXBDO1NBQ0osQ0FBQztPQUNXLElBQUksQ0F3Q2hCO0lBVUQsSUFBYSxVQUFVLEdBQXZCLE1BQWEsVUFBVyxTQUFRLElBQUk7O1FBR2hDLFdBQVcsTUFBTTtZQUNiLE9BQU87Z0JBQ0gsR0FBRyxLQUFLLENBQUMsTUFBTTtnQkFDZiwwRUFBMEU7YUFDN0UsQ0FBQTtTQUNKO1FBR0QsV0FBVyxNQUFPO1FBR2xCLGFBQWEsTUFBTztLQUN2QixDQUFBO0lBSkc7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7Ozs7aURBQ1I7SUFHbEI7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7Ozs7bURBQ047SUFkWCxVQUFVO1FBUnRCLFNBQVMsQ0FBYTtZQUNuQixRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFFBQVEsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFBOzs7O0tBSXJCO1NBQ0osQ0FBQztPQUNXLFVBQVUsQ0FldEI7SUFZRCxJQUFhLFNBQVMsR0FBdEIsTUFBYSxTQUFVLFNBQVEsSUFBSTtLQUFJLENBQUE7SUFBMUIsU0FBUztRQVZyQixTQUFTLENBQVk7WUFDbEIsUUFBUSxFQUFFLGVBQWU7WUFDekIsTUFBTSxFQUFFO2dCQUNKOzs7VUFHRTthQUNMOztTQUVKLENBQUM7T0FDVyxTQUFTLENBQWlCOzs7SUN4RXZDLElBQWEsUUFBUSxHQUFyQixNQUFhLFFBQVMsU0FBUSxTQUFTO1FBQXZDOztZQXdCSSxZQUFPLEdBQUcsS0FBSyxDQUFDO1NBcUNuQjtRQWhDRyxNQUFNO1lBRUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEQ7UUFLUyxZQUFZLENBQUUsS0FBb0I7WUFFeEMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLEtBQUssRUFBRTtnQkFFNUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUVkLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUMxQjtTQUNKO1FBRUQsaUJBQWlCO1lBRWIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Ozs7OztZQU8xQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs7WUFHbEIsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7U0FDMUI7S0FDSixDQUFBO0lBdERHO1FBREMsUUFBUSxFQUFFOzswQ0FDRztJQWlCZDtRQWZDLFFBQVEsQ0FBVzs7O1lBR2hCLFNBQVMsRUFBRSx5QkFBeUI7O1lBRXBDLGVBQWUsRUFBRSxVQUFVLFdBQXdCLEVBQUUsUUFBYSxFQUFFLFFBQWE7Z0JBQzdFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDZCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQzdDO3FCQUFNO29CQUNILElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUM5QzthQUNKO1NBQ0osQ0FBQzs7NkNBQ2M7SUFLaEI7UUFIQyxRQUFRLENBQUM7WUFDTixLQUFLLEVBQUUsT0FBTztTQUNqQixDQUFDOzs7OzBDQUlEO0lBS0Q7UUFIQyxRQUFRLENBQUM7WUFDTixLQUFLLEVBQUUsU0FBUztTQUNuQixDQUFDOzt5Q0FDNkIsYUFBYTs7Z0RBUTNDO0lBN0NRLFFBQVE7UUF2Q3BCLFNBQVMsQ0FBVztZQUNqQixRQUFRLEVBQUUsYUFBYTtZQUN2QixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBZ0NYLENBQUM7WUFDRixRQUFRLEVBQUUsUUFBUSxJQUFJLElBQUksQ0FBQTs7S0FFekI7U0FDSixDQUFDO09BQ1csUUFBUSxDQTZEcEI7OztJQ2hHRDs7Ozs7OztBQU9BLElBS0E7Ozs7Ozs7QUFPQSxJQUFPLE1BQU0sV0FBVyxHQUFHLENBQWtDLFFBQVcsRUFBRSxRQUFXOztRQUVqRixhQUFPLFFBQVEsQ0FBQyxVQUFVLDBDQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFO0lBQ2pFLENBQUMsQ0FBQTtJQUVEOzs7Ozs7O0FBT0EsSUFBTyxNQUFNLGFBQWEsR0FBRzs7UUFFekIsSUFBSSxVQUFVLEdBQWdDLFFBQVEsQ0FBQztRQUN2RCxJQUFJLGFBQWEsU0FBWSxVQUFVLENBQUMsYUFBYSx1Q0FBSSxRQUFRLENBQUMsSUFBSSxFQUFBLENBQUM7UUFFdkUsT0FBTyxVQUFVLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRTtZQUUzQyxhQUFhLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztZQUN6QyxVQUFVLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQztTQUN6QztRQUVELE9BQU8sYUFBNEIsQ0FBQztJQUN4QyxDQUFDLENBQUE7OztVQ25EWSxXQUFXOzs7Ozs7UUFTcEIsWUFBb0IsU0FBaUIsRUFBRSxFQUFTLFNBQWlCLEVBQUU7WUFBL0MsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUFTLFdBQU0sR0FBTixNQUFNLENBQWE7WUFQM0QsVUFBSyxHQUFHLENBQUMsQ0FBQztTQU9zRDtRQUV4RSxTQUFTO1lBRUwsT0FBTyxHQUFJLElBQUksQ0FBQyxNQUFPLEdBQUksSUFBSSxDQUFDLEtBQUssRUFBRyxHQUFJLElBQUksQ0FBQyxNQUFPLEVBQUUsQ0FBQztTQUM5RDtLQUNKOzs7YUNSZSxTQUFTLENBQThCLElBQU8sRUFBRSxPQUFlLEVBQUU7UUFHN0UsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLElBQUk7WUFLMUIsaUJBQWlCO2dCQUViLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7Z0JBRTlDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQzdCO1NBQ0osQ0FBQTtRQVJHO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLENBQUM7O2lEQUNwQztRQUhaLFdBQVc7WUFEaEIsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO1dBQ3ZCLFdBQVcsQ0FXaEI7UUFFRCxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDOzs7YUNmZSxjQUFjLENBQUUsSUFBb0IsRUFBRSxLQUFxQjtRQUV2RSxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUU7WUFFZixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUs7bUJBQzFCLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU07bUJBQzVCLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFFBQVE7bUJBQ2hDLElBQUksQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLFNBQVM7bUJBQ2xDLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFFBQVE7bUJBQ2hDLElBQUksQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQztTQUM3QztRQUVELE9BQU8sSUFBSSxLQUFLLEtBQUssQ0FBQztJQUMxQixDQUFDOzs7SUNDTSxNQUFNLHNCQUFzQixHQUFrQjtRQUNqRCxNQUFNLEVBQUU7WUFDSixVQUFVLEVBQUUsUUFBUTtZQUNwQixRQUFRLEVBQUUsUUFBUTtTQUNyQjtRQUNELE1BQU0sRUFBRTtZQUNKLFVBQVUsRUFBRSxRQUFRO1lBQ3BCLFFBQVEsRUFBRSxRQUFRO1NBQ3JCO1FBQ0QsTUFBTSxFQUFFO1lBQ0osVUFBVSxFQUFFLENBQUM7WUFDYixRQUFRLEVBQUUsQ0FBQztTQUNkO0tBQ0osQ0FBQztBQUVGLGFBNEJnQixrQkFBa0IsQ0FBRSxVQUF1QixFQUFFLGdCQUEyQjtRQUVwRixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBRTFDLFFBQVEsZ0JBQWdCLENBQUMsVUFBVTtZQUUvQixLQUFLLE9BQU87Z0JBQ1IsUUFBUSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixNQUFNO1lBRVYsS0FBSyxRQUFRO2dCQUNULFFBQVEsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDakQsTUFBTTtZQUVWLEtBQUssS0FBSztnQkFDTixRQUFRLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztnQkFDN0MsTUFBTTtTQUNiO1FBRUQsUUFBUSxnQkFBZ0IsQ0FBQyxRQUFRO1lBRTdCLEtBQUssT0FBTztnQkFDUixRQUFRLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU07WUFFVixLQUFLLFFBQVE7Z0JBQ1QsUUFBUSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNO1lBRVYsS0FBSyxLQUFLO2dCQUNOLFFBQVEsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUM5QyxNQUFNO1NBQ2I7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0FBRUQsYUFBZ0IsaUJBQWlCLENBQUUsU0FBc0IsRUFBRSxlQUEwQixFQUFFLFNBQXNCLEVBQUUsZUFBMEI7UUFFckksTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sY0FBYyxHQUFHLGtCQUFrQixpQ0FBTSxTQUFTLEtBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFJLGVBQWUsQ0FBQyxDQUFDO1FBRXpGLE9BQU87WUFDSCxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQztZQUN0QyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQztTQUN6QyxDQUFBO0lBQ0wsQ0FBQzs7O0lDM0dNLE1BQU0sZ0JBQWdCLEdBQWE7UUFDdEMsQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztLQUNQLENBQUM7QUFFRixhQUFnQixVQUFVLENBQUUsUUFBYTtRQUVyQyxPQUFPLE9BQVEsUUFBcUIsQ0FBQyxDQUFDLEtBQUssV0FBVyxJQUFJLE9BQVEsUUFBcUIsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDO0lBQzlHLENBQUM7QUFFRCxhQUFnQixrQkFBa0IsQ0FBRSxRQUFtQixFQUFFLEtBQWdCO1FBRXJFLElBQUksUUFBUSxJQUFJLEtBQUssRUFBRTtZQUVuQixPQUFPLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7bUJBQ3RCLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNqQztRQUVELE9BQU8sUUFBUSxLQUFLLEtBQUssQ0FBQztJQUM5QixDQUFDOzs7SUNGTSxNQUFNLHVCQUF1QixHQUFtQjtRQUNuRCxLQUFLLEVBQUUsTUFBTTtRQUNiLE1BQU0sRUFBRSxNQUFNO1FBQ2QsUUFBUSxFQUFFLE9BQU87UUFDakIsU0FBUyxFQUFFLE9BQU87UUFDbEIsUUFBUSxFQUFFLE1BQU07UUFDaEIsU0FBUyxFQUFFLE1BQU07UUFDakIsTUFBTSxFQUFFLFVBQVU7UUFDbEIsU0FBUyxvQkFBTyxzQkFBc0IsQ0FBRTtLQUMzQyxDQUFDO0FBRUY7O2FDeEJnQixjQUFjLENBQUUsT0FBWTtRQUV4QyxPQUFPLE9BQU8sT0FBTyxLQUFLLFFBQVE7ZUFDM0IsT0FBUSxPQUF3QixDQUFDLE1BQU0sS0FBSyxRQUFRO2VBQ3BELE9BQVEsT0FBd0IsQ0FBQyxJQUFJLEtBQUssUUFBUTtnQkFDakQsT0FBUSxPQUF3QixDQUFDLFFBQVEsS0FBSyxVQUFVO21CQUNyRCxPQUFRLE9BQXdCLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7QUFHRCxhQW1CZ0IsTUFBTSxDQUFFLEtBQVk7UUFFaEMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkEsVUFBYSxZQUFZO1FBQXpCO1lBRWMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFnQixDQUFDO1NBOE9oRDtRQWxPRyxVQUFVLENBQ04sZUFBMkMsRUFDM0MsSUFBYSxFQUNiLFFBQW9ELEVBQ3BELE9BQTJDO1lBRzNDLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO2tCQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztrQkFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSyxFQUFFLFFBQVMsRUFBRSxPQUFPLENBQUMsTUFBTSxTQUFTLENBQUM7U0FDckY7UUFZRCxXQUFXLENBQ1AsZUFBMkMsRUFDM0MsSUFBYSxFQUNiLFFBQW9ELEVBQ3BELE9BQTJDO1lBRzNDLElBQUksYUFBYSxHQUFpQixjQUFjLENBQUMsZUFBZSxDQUFDLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUssRUFBRSxRQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFckosSUFBSSxZQUFzQyxDQUFDO1lBRTNDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO2dCQUFFLE9BQU8sYUFBYSxDQUFDO1lBRTNELEtBQUssSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFFeEMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsRUFBRTtvQkFFOUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztvQkFDdkIsTUFBTTtpQkFDVDthQUNKO1lBRUQsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFnQkQsTUFBTSxDQUNGLGVBQTJDLEVBQzNDLElBQWEsRUFDYixRQUFvRCxFQUNwRCxPQUEyQztZQUczQyxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDO2tCQUN6QyxlQUFlO2tCQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUssRUFBRSxRQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFckUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRTNCLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFakYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRTNCLE9BQU8sT0FBTyxDQUFDO2FBQ2xCO1NBQ0o7UUFnQkQsUUFBUSxDQUNKLGVBQTJDLEVBQzNDLElBQWEsRUFDYixRQUFvRCxFQUNwRCxPQUF3QztZQUd4QyxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDO2tCQUN6QyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztrQkFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSyxFQUFFLFFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVuRSxJQUFJLE9BQU8sRUFBRTtnQkFFVCxPQUFPLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRXBGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU5QixPQUFPLE9BQU8sQ0FBQzthQUNsQjtTQUNKOzs7O1FBS0QsV0FBVztZQUVQLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDNUQ7UUFZRCxRQUFRLENBQVcsTUFBbUIsRUFBRSxXQUE0QixFQUFFLE1BQVUsRUFBRSxZQUFnQyxFQUFFO1lBRWhILElBQUksV0FBVyxZQUFZLEtBQUssRUFBRTtnQkFFOUIsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksV0FBVyxDQUFDLFdBQVksZ0NBQ3BELE9BQU8sRUFBRSxJQUFJLEVBQ2IsUUFBUSxFQUFFLElBQUksRUFDZCxVQUFVLEVBQUUsSUFBSSxJQUNiLFNBQVMsS0FDWixNQUFNLElBQ1IsQ0FBQyxDQUFDO1NBQ1A7Ozs7OztRQU9TLGFBQWEsQ0FBRSxNQUFtQixFQUFFLElBQVksRUFBRSxRQUFtRCxFQUFFLE9BQTJDO1lBRXhKLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDakIsTUFBTTtnQkFDTixJQUFJO2dCQUNKLFFBQVE7Z0JBQ1IsT0FBTzthQUNWLENBQUMsQ0FBQztTQUNOOzs7Ozs7OztRQVNTLGVBQWUsQ0FBRSxPQUFxQixFQUFFLEtBQW1CO1lBRWpFLElBQUksT0FBTyxLQUFLLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFFbkMsT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxNQUFNO21CQUMvQixPQUFPLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJO21CQUMzQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDO21CQUN2RCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlEOzs7Ozs7OztRQVNTLGdCQUFnQixDQUFFLFFBQW1ELEVBQUUsS0FBZ0Q7O1lBRzdILElBQUksUUFBUSxLQUFLLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUM7O1lBR3BDLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFFM0QsT0FBUSxRQUFnQyxDQUFDLFdBQVcsS0FBTSxLQUE2QixDQUFDLFdBQVcsQ0FBQzthQUN2RztZQUVELE9BQU8sS0FBSyxDQUFDO1NBQ2hCOzs7Ozs7OztRQVNTLGNBQWMsQ0FBRSxPQUEyQyxFQUFFLEtBQXlDOztZQUc1RyxJQUFJLE9BQU8sS0FBSyxLQUFLO2dCQUFFLE9BQU8sSUFBSSxDQUFDOztZQUduQyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBRTFELE9BQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsT0FBTzt1QkFDakMsT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsT0FBTzt1QkFDakMsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ3RDO1lBRUQsT0FBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7O0lDbFREO0lBQ0EsTUFBTSxJQUFJLEdBQWUsU0FBUyxDQUFDO0FBRW5DLFVBQXNCLFFBQVE7UUFBOUI7WUFFYyxjQUFTLEdBQUcsS0FBSyxDQUFDO1lBSWxCLHdCQUFtQixHQUFHLEtBQUssQ0FBQztZQUU1QixnQkFBVyxHQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFFakUsa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1NBZ0poRDs7Ozs7O1FBeklHLElBQUksV0FBVztZQUVYLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUN6Qjs7Ozs7Ozs7UUFTRCxJQUFJLE9BQU87WUFFUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDeEI7Ozs7Ozs7O1FBU0QsTUFBTSxDQUFFLE9BQXFCLEVBQUUsR0FBRyxJQUFXO1lBRXpDLElBQUksSUFBSSxDQUFDLFdBQVc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFFeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFFdEIsT0FBTyxJQUFJLENBQUM7U0FDZjs7Ozs7Ozs7Ozs7UUFZRCxNQUFNLENBQUUsR0FBRyxJQUFXO1lBRWxCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUVwQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRW5CLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBRTFCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXZCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7Ozs7Ozs7Ozs7UUFXRCxhQUFhLENBQUUsR0FBRyxJQUFXO1lBRXpCLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFFL0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztnQkFFaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztvQkFFbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUVyQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO2lCQUNwQyxDQUFDLENBQUM7YUFDTjtZQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7U0FDbkM7Ozs7UUFLRCxZQUFZO1lBRVIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO1NBQ3BDOzs7Ozs7Ozs7UUFVRCxNQUFNLENBQUUsR0FBRyxJQUFXO1lBRWxCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUMzQjtRQUVELE1BQU0sQ0FBRSxNQUFtQixFQUFFLElBQVksRUFBRSxRQUFtRCxFQUFFLE9BQTJDO1lBRXZJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDckU7UUFFRCxRQUFRLENBQUUsTUFBbUIsRUFBRSxJQUFZLEVBQUUsUUFBbUQsRUFBRSxPQUF3QztZQUV0SSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsV0FBVztZQUVQLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDcEM7UUFJRCxRQUFRLENBQVcsV0FBNEIsRUFBRSxNQUFVLEVBQUUsU0FBOEI7WUFFdkYsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBRWxDLE9BQU8sQ0FBQyxXQUFXLFlBQVksS0FBSztzQkFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7c0JBQ3RELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBWSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzthQUNwRjtZQUVELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0tBQ0o7OztVQzFKWSxrQkFBbUIsU0FBUSxRQUFRO1FBTTVDLFlBQXVCLE1BQXNCO1lBRXpDLEtBQUssRUFBRSxDQUFDO1lBRlcsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7U0FHNUM7UUFFRCxNQUFNLENBQUUsT0FBb0I7WUFFeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRXpDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsYUFBYSxDQUFFLFFBQW1CLEVBQUUsSUFBVztZQUUzQyxPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzlDO1FBRUQsTUFBTSxDQUFFLFFBQW1CLEVBQUUsSUFBVztZQUVwQyxNQUFNLFlBQVksR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUV0RixJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLFlBQVksQ0FBQztnQkFDcEMsT0FBTyxHQUFHLElBQUksQ0FBQzthQUNsQjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFFdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUM7Z0JBQzVCLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDbEI7WUFFRCxPQUFPLE9BQU8sQ0FBQztTQUNsQjs7Ozs7OztRQVFTLFdBQVc7WUFFakIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztZQUlwRCxPQUFPLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzlHOzs7Ozs7Ozs7UUFVUyxPQUFPO1lBRWIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVO2tCQUNoRCxNQUFNLENBQUMsVUFBVTtrQkFDakIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sWUFBWSxXQUFXO3NCQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXO3NCQUM5QixNQUFNLENBQUM7WUFFakIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVO2tCQUNqRCxNQUFNLENBQUMsV0FBVztrQkFDbEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sWUFBWSxXQUFXO3NCQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZO3NCQUMvQixNQUFNLENBQUM7WUFFakIsT0FBTztnQkFDSCxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztnQkFDekUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssUUFBUSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07Z0JBQzdFLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2dCQUNsRixTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxRQUFRLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtnQkFDckYsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQ2xGLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLFFBQVEsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTO2FBQ3pGLENBQUM7U0FDTDtRQUVTLGNBQWMsQ0FBRSxTQUFzRDtZQUU1RSxNQUFNLFdBQVcsR0FBZ0I7Z0JBQzdCLENBQUMsRUFBRSxDQUFDO2dCQUNKLENBQUMsRUFBRSxDQUFDO2dCQUNKLEtBQUssRUFBRSxDQUFDO2dCQUNSLE1BQU0sRUFBRSxDQUFDO2FBQ1osQ0FBQztZQUVGLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUV2QixXQUFXLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLFdBQVcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUUvQjtpQkFBTSxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUU7Z0JBRWpDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDdEMsV0FBVyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO2FBRTNDO2lCQUFNLElBQUksU0FBUyxZQUFZLFdBQVcsRUFBRTtnQkFFekMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBRXJELFdBQVcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztnQkFDaEMsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO2dCQUMvQixXQUFXLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7Z0JBQ3JDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQzthQUMxQztZQUVELE9BQU8sV0FBVyxDQUFDO1NBQ3RCO1FBRVMsYUFBYSxDQUFFLFFBQWtCO1lBRXZDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPO1lBRTlCLElBQUksQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1NBRW5DO1FBRVMsU0FBUyxDQUFFLElBQVU7WUFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU87WUFFOUIsSUFBSSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbkU7O1FBR1MsVUFBVSxDQUFFLEtBQTZCO1lBRS9DLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksR0FBSSxLQUFLLElBQUksQ0FBRSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztTQUMxRTtRQUVTLGtCQUFrQixDQUFFLFFBQW1CLEVBQUUsS0FBZ0I7WUFFL0QsT0FBTyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDOUM7UUFFUyxjQUFjLENBQUUsSUFBVyxFQUFFLEtBQVk7WUFFL0MsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3RDO0tBQ0o7OzthQzNLZSxhQUFhLENBQUssTUFBa0IsRUFBRSxRQUFXO1FBRTdELEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFO1lBRXhCLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVM7Z0JBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM5RDtRQUVELE9BQU8sTUFBVyxDQUFDO0lBQ3ZCLENBQUM7OztJQ05NLE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBWSxFQUFFLE1BQWMsVUFBVSxLQUFLLElBQUksS0FBSyxDQUMvRSwwQkFBMkIsR0FBSSxtQkFBb0IsSUFBSzs4QkFDN0IsR0FBSSw4QkFBK0IsR0FBSSx1QkFBdUIsQ0FBQyxDQUFDO0FBa0IvRixVQUFzQixlQUFlO1FBRWpDLFlBQ2MsU0FBNEIsRUFDNUIsY0FBc0M7WUFEdEMsY0FBUyxHQUFULFNBQVMsQ0FBbUI7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQXdCO1NBQy9DOzs7Ozs7Ozs7O1FBV0wsTUFBTSxDQUFFLElBQU8sRUFBRSxNQUFrQixFQUFFLEdBQUcsSUFBVztZQUUvQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV6RSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUNuRTs7Ozs7OztRQVFTLFdBQVcsQ0FBRSxJQUFPLEVBQUUsUUFBbUMsRUFBRSxhQUFnQixFQUFFLEdBQUcsSUFBVztZQUVqRyxPQUFPLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQy9DOzs7Ozs7OztRQVNTLFNBQVMsQ0FBRSxJQUFPO1lBRXhCLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFBRSxNQUFNLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFckcsSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUFFLE1BQU0sY0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztTQUN2SDs7OztRQUtTLFdBQVcsQ0FBRSxJQUFPO1lBRTFCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVEOzs7O1FBS1MsZ0JBQWdCLENBQUUsSUFBTztZQUUvQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN0RTtLQUNKOzs7SUNyRk0sTUFBTSx3QkFBd0IscUJBQzlCLHVCQUF1QixDQUM3QixDQUFDO0FBRUYsVUFBYSwwQkFBMkIsU0FBUSxrQkFBa0I7Ozs7Ozs7OztRQVVwRCxXQUFXO1lBRWpCLE9BQU8sZ0JBQWdCLENBQUM7U0FDM0I7Ozs7OztRQU9TLGFBQWEsQ0FBRSxRQUFrQjtZQUV2QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQUUsT0FBTztZQUU5QixJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBRWhDLElBQUksQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQztTQUMzRDtLQUNKOzs7SUNuQ00sTUFBTSx5QkFBeUIsbUNBQy9CLHVCQUF1QixLQUMxQixRQUFRLEVBQUUsUUFBUSxFQUNsQixTQUFTLEVBQUUsUUFBUSxFQUNuQixTQUFTLEVBQUU7WUFDUCxNQUFNLEVBQUU7Z0JBQ0osVUFBVSxFQUFFLE9BQU87Z0JBQ25CLFFBQVEsRUFBRSxLQUFLO2FBQ2xCO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLFVBQVUsRUFBRSxPQUFPO2dCQUNuQixRQUFRLEVBQUUsT0FBTzthQUNwQjtZQUNELE1BQU0sRUFBRTtnQkFDSixVQUFVLEVBQUUsQ0FBQztnQkFDYixRQUFRLEVBQUUsQ0FBQzthQUNkO1NBQ0osR0FDSixDQUFDO0FBRUYsVUFBYSwyQkFBNEIsU0FBUSxrQkFBa0I7UUFFL0QsTUFBTSxDQUFFLE9BQW9CO1lBRXhCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUV6QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7WUFLbEUsT0FBTyxJQUFJLENBQUM7U0FDZjtLQWtCSjs7O0lDL0NNLE1BQU0sb0JBQW9CLEdBQW1EO1FBQ2hGLE9BQU8sRUFBRSxrQkFBa0I7UUFDM0IsUUFBUSxFQUFFLDBCQUEwQjtRQUNwQyxTQUFTLEVBQUUsMkJBQTJCO0tBQ3pDLENBQUE7QUFFRCxJQUFPLE1BQU0sdUJBQXVCLEdBQW9EO1FBQ3BGLE9BQU8sRUFBRSx1QkFBdUI7UUFDaEMsUUFBUSxFQUFFLHdCQUF3QjtRQUNsQyxTQUFTLEVBQUUseUJBQXlCO0tBQ3ZDLENBQUM7QUFFRixVQUFhLHlCQUEwQixTQUFRLGVBQWtFO1FBRTdHLFlBQ2MsWUFBWSxvQkFBb0IsRUFDaEMsaUJBQWlCLHVCQUF1QjtZQUdsRCxLQUFLLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBSnZCLGNBQVMsR0FBVCxTQUFTLENBQXVCO1lBQ2hDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtTQUlyRDtLQUNKOzs7VUN6Qlksa0JBQW1CLFNBQVEsUUFBUTtRQUU1QyxZQUF1QixNQUFzQjtZQUV6QyxLQUFLLEVBQUUsQ0FBQztZQUZXLFdBQU0sR0FBTixNQUFNLENBQWdCO1NBRzVDO1FBRUQsTUFBTSxDQUFFLE9BQW9COztZQUV4QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFekMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFFdEIsTUFBTSxPQUFPLFNBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLHVDQUFJLElBQUksQ0FBQyxPQUFRLEVBQUEsQ0FBQztnQkFFckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDdkQ7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTTs7WUFFRixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQUUsT0FBTztZQUU5QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUV0QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDdEMsTUFBTSxPQUFPLFNBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLHVDQUFJLElBQUksQ0FBQyxPQUFRLEVBQUEsQ0FBQztnQkFFckQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBUSxFQUFFLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDdkU7U0FDSjtLQUNKOzs7SUN0Qk0sTUFBTSxzQkFBc0IsR0FBMkI7UUFDMUQsWUFBWSxFQUFFLFNBQVM7UUFDdkIsV0FBVyxFQUFFLFNBQVM7UUFDdEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLElBQUk7UUFDYixRQUFRLEVBQUUsSUFBSTtRQUNkLG9CQUFvQixFQUFFLElBQUk7S0FDN0IsQ0FBQztBQU9GLGFBQWdCLGtCQUFrQixDQUE4QixJQUFPLEVBQUUsU0FBaUMsRUFBRTtRQUd4RyxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLElBQUk7WUFBdkM7Ozs7Ozs7Ozs7Ozs7Z0JBYWMsWUFBTyxHQUFrQixnQ0FBSyxzQkFBc0IsR0FBSyxNQUFNLENBQW1CLENBQUM7YUErUWhHO1lBelFHLElBQUksTUFBTSxDQUFFLEtBQTZCOztnQkFHckMsSUFBSSxDQUFDLE9BQU8sbUNBQVEsSUFBSSxDQUFDLE9BQU8sR0FBSyxLQUFLLENBQUUsQ0FBQzthQUNoRDtZQUNELElBQUksTUFBTTtnQkFFTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDdkI7Ozs7WUFPRCxJQUFJLFdBQVcsQ0FBRSxLQUFhO2dCQUUxQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3hDO1lBQ0QsSUFBSSxXQUFXO2dCQUVYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDbkM7WUFHRCxJQUFJLFlBQVksQ0FBRSxLQUFhO2dCQUUzQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3pDO1lBQ0QsSUFBSSxZQUFZO2dCQUVaLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7YUFDcEM7WUFHRCxJQUFJLE9BQU8sQ0FBRSxLQUE4QjtnQkFFdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUNwQztZQUNELElBQUksT0FBTztnQkFFUCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBR0QsSUFBSSxRQUFRLENBQUUsS0FBbUM7Z0JBRTdDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDckM7WUFDRCxJQUFJLFFBQVE7Z0JBRVIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUdELElBQUksT0FBTyxDQUFFLEtBQTRCO2dCQUVyQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3BDO1lBQ0QsSUFBSSxPQUFPO2dCQUVQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFHRCxJQUFJLE9BQU8sQ0FBRSxLQUFjO2dCQUV2QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3BDO1lBQ0QsSUFBSSxPQUFPO2dCQUVQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFHRCxJQUFJLFFBQVEsQ0FBRSxLQUFjO2dCQUV4QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3JDO1lBQ0QsSUFBSSxRQUFRO2dCQUVSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFHRCxJQUFJLG9CQUFvQixDQUFFLEtBQWM7Z0JBRXBDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUNqRDtZQUNELElBQUksb0JBQW9CO2dCQUVwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7YUFDNUM7Ozs7WUFPRCxJQUFJLE1BQU0sQ0FBRSxLQUEwQztnQkFFbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUNuQztZQUNELElBQUksTUFBTTtnQkFFTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBR0QsSUFBSSxLQUFLLENBQUUsS0FBc0I7Z0JBRTdCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDbEM7O1lBQ0QsSUFBSSxLQUFLO2dCQUVMLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDN0I7WUFHRCxJQUFJLE1BQU0sQ0FBRSxLQUFzQjtnQkFFOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUNuQzs7WUFDRCxJQUFJLE1BQU07Z0JBRU4sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUdELElBQUksUUFBUSxDQUFFLEtBQXNCO2dCQUVoQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3JDOztZQUNELElBQUksUUFBUTtnQkFFUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBR0QsSUFBSSxTQUFTLENBQUUsS0FBc0I7Z0JBRWpDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDdEM7O1lBQ0QsSUFBSSxTQUFTO2dCQUVULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDakM7WUFHRCxJQUFJLFFBQVEsQ0FBRSxLQUFzQjtnQkFFaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUNyQzs7WUFDRCxJQUFJLFFBQVE7Z0JBRVIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUVoQztZQUdELElBQUksU0FBUyxDQUFFLEtBQXNCO2dCQUVqQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3RDOztZQUNELElBQUksU0FBUztnQkFFVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2FBQ2pDO1lBTUQsSUFBSSxTQUFTLENBQUUsS0FBb0I7Z0JBRS9CLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxTQUFTLGtDQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFLLEtBQUssQ0FBRSxFQUFFLENBQUM7YUFDeEU7O1lBQ0QsSUFBSSxTQUFTO2dCQUVULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDakM7Ozs7WUFPRCxJQUFJLFNBQVMsQ0FBRSxLQUFjO2dCQUV6QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3RDO1lBQ0QsSUFBSSxTQUFTO2dCQUVULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDakM7WUFHRCxJQUFJLFNBQVMsQ0FBRSxLQUFjO2dCQUV6QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3RDO1lBQ0QsSUFBSSxTQUFTO2dCQUVULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDakM7WUFHRCxJQUFJLFNBQVMsQ0FBRSxLQUFjO2dCQUV6QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3RDO1lBQ0QsSUFBSSxTQUFTO2dCQUVULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDakM7WUFHRCxJQUFJLFlBQVksQ0FBRSxLQUFjO2dCQUU1QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3pDO1lBQ0QsSUFBSSxZQUFZO2dCQUVaLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7YUFDcEM7WUFHRCxJQUFJLGFBQWEsQ0FBRSxLQUFjO2dCQUU3QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQzFDO1lBQ0QsSUFBSSxhQUFhO2dCQUViLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7YUFDckM7WUFHRCxJQUFJLGdCQUFnQixDQUFFLEtBQWM7Z0JBRWhDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUM3QztZQUNELElBQUksZ0JBQWdCO2dCQUVoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDeEM7WUFHRCxJQUFJLFlBQVksQ0FBRSxLQUF5QjtnQkFFdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUN6QztZQUNELElBQUksWUFBWTtnQkFFWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO2FBQ3BDO1lBR0QsSUFBSSxnQkFBZ0IsQ0FBRSxLQUFhO2dCQUUvQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDN0M7WUFDRCxJQUFJLGdCQUFnQjtnQkFFaEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2FBQ3hDO1NBQ0osQ0FBQTtRQXpRRztZQUpDLFFBQVEsQ0FBQztnQkFDTixTQUFTLEVBQUUsS0FBSztnQkFDaEIsT0FBTyxFQUFFLDRCQUE0QjthQUN4QyxDQUFDOzs7MERBS0Q7UUFXRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxDQUFDOzs7K0RBSWpEO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQzs7O2dFQUlqRDtRQU9EO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7MkRBSTlCO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7Ozs0REFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7OzJEQUk5QjtRQU9EO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7MkRBSTlCO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7Ozs0REFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7O3dFQUk5QjtRQVdEO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7MERBSTlCO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7Ozt5REFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7OzBEQUk5QjtRQU9EO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7NERBSTlCO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7Ozs2REFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7OzREQUk5QjtRQVFEO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7NkRBSTlCO1FBVUQ7WUFKQyxRQUFRLENBQUM7Z0JBQ04sU0FBUyxFQUFFLEtBQUs7Z0JBQ2hCLE9BQU8sRUFBRSw0QkFBNEI7YUFDeEMsQ0FBQzs7OzZEQUlEO1FBV0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7Ozs2REFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7OzZEQUk5QjtRQU9EO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7NkRBSTlCO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7OztnRUFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7O2lFQUk5QjtRQU9EO1lBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDOzs7b0VBSTlCO1FBT0Q7WUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7OztnRUFJOUI7UUFPRDtZQURDLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7O29FQUk5QjtRQXZSQyxvQkFBb0I7WUFEekIsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO1dBQ3ZCLG9CQUFvQixDQTRSekI7UUFFRCxPQUFPLG9CQUFvQixDQUFDO0lBQ2hDLENBQUM7OztJQ3ZUTSxNQUFNLHVCQUF1QixHQUFjO1FBQzlDLE9BQU8sRUFBRSxJQUFJO1FBQ2IsVUFBVSxFQUFFLElBQUk7UUFDaEIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQztJQUVGOzs7Ozs7Ozs7OztBQVdBLFVBQWEsZ0JBQWlCLFNBQVEsV0FBbUM7UUFFckUsWUFBYSxNQUE4QixFQUFFLE9BQWtCLEVBQUU7WUFFN0QsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFckQsTUFBTSxTQUFTLGlEQUNSLHVCQUF1QixHQUN2QixJQUFJLEtBQ1AsTUFBTSxHQUNULENBQUM7WUFFRixLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzFCO0tBQ0o7OztJQ2pDRDs7Ozs7Ozs7O0FBU0EsVUFBYSxZQUFhLFNBQVEsUUFBUTtRQUExQzs7Ozs7WUFVSSxhQUFRLEdBQUcsS0FBSyxDQUFDO1NBbUVwQjtRQWpFRyxNQUFNLENBQUUsT0FBb0I7WUFFeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDOztZQUd6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7O1lBR3hELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBbUIsQ0FBQyxDQUFDLENBQUM7WUFDeEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFtQixDQUFDLENBQUMsQ0FBQztZQUUxRixPQUFPLElBQUksQ0FBQztTQUNmO1FBRVMsYUFBYSxDQUFFLEtBQWlCO1lBRXRDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUVoQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs7OztnQkFLckIsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNuRTs7O1lBSUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pCO1FBRVMsY0FBYyxDQUFFLEtBQWlCO1lBRXZDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFFZixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7OztnQkFLdEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3BFOzs7WUFJRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakI7UUFFUyxpQkFBaUIsQ0FBRSxLQUFpQjs7Ozs7WUFNMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBRWpDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFFOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGdCQUFnQixDQUFDO29CQUMvQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0JBQ3ZCLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBc0I7b0JBQ25DLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBNEI7aUJBQ3BELENBQUMsQ0FBQyxDQUFDO2FBQ1A7U0FDSjtLQUNKOzs7SUN2RkQ7Ozs7OztJQU1BLE1BQU0sV0FBVyxHQUFHLHVDQUF1QyxDQUFDO0lBRTVEOzs7Ozs7SUFNQSxNQUFNLFFBQVEsR0FBRztRQUNiLFNBQVM7UUFDVCxZQUFZO1FBQ1osUUFBUTtRQUNSLE9BQU87UUFDUCxRQUFRO1FBQ1IsVUFBVTtRQUNWLFFBQVE7UUFDUixtQkFBbUI7UUFDbkIsWUFBWTtLQUNmLENBQUM7SUFFRjs7O0FBR0EsSUFBTyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFJLE9BQVEsR0FBSSxXQUFZLEVBQUUsQ0FBQyxDQUFDO0lBYWpGOzs7QUFHQSxJQUFPLE1BQU0seUJBQXlCLEdBQW9CO1FBQ3RELGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3JDLFNBQVMsRUFBRSxJQUFJO1FBQ2YsU0FBUyxFQUFFLElBQUk7UUFDZixZQUFZLEVBQUUsSUFBSTtLQUNyQixDQUFDO0lBRUY7Ozs7Ozs7OztBQVNBLFVBQWEsU0FBVSxTQUFRLFlBQVk7UUFVdkMsWUFBYSxNQUFpQztZQUUxQyxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUUseUJBQXlCLENBQUMsQ0FBQztTQUN4RTtRQUVELE1BQU0sQ0FBRSxPQUFvQjtZQUV4QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFekMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBUSxFQUFFLFNBQVMsR0FBRyxDQUFDLEtBQW9CLEtBQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBbUIsQ0FBQztZQUU5RyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUztnQkFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFL0MsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELFlBQVk7WUFFUixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO2dCQUUxQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBUSxDQUFDLGFBQWEsQ0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUV4RixJQUFJLFlBQVksRUFBRTtvQkFFZCxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3JCLE9BQU87aUJBRVY7cUJBQU07b0JBRUgsT0FBTyxDQUFDLElBQUksQ0FBQywwREFBMkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFhLHNDQUFzQyxDQUFDLENBQUM7aUJBQzVJO2FBQ0o7WUFFRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDckI7UUFFRCxVQUFVO1lBRU4sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN0QjtRQUVELFNBQVM7WUFFTCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3BCO1FBRUQsTUFBTTtZQUVGLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPO1lBRTlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFOUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFFckMsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNO2tCQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztrQkFDdEIsSUFBSSxDQUFDLE9BQVEsQ0FBQztZQUVwQixJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU07a0JBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztrQkFDL0IsSUFBSSxDQUFDLE9BQVEsQ0FBQztTQUN2QjtRQUVTLGFBQWEsQ0FBRSxLQUFvQjtZQUV6QyxRQUFRLEtBQUssQ0FBQyxHQUFHO2dCQUViLEtBQUssR0FBRztvQkFFSixJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUUvQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBRXZCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTOzRCQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztxQkFFL0M7eUJBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUVyRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBRXZCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTOzRCQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztxQkFDaEQ7b0JBRUQsTUFBTTthQUNiO1NBQ0o7S0FDSjs7O1VDM0pZLGNBQWUsU0FBUSxRQUFRO1FBTXhDLFlBQXVCLE1BQTRCLEVBQVMsT0FBZ0I7WUFFeEUsS0FBSyxFQUFFLENBQUM7WUFGVyxXQUFNLEdBQU4sTUFBTSxDQUFzQjtZQUFTLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFKbEUsa0JBQWEsR0FBZ0IsUUFBUSxDQUFDLElBQUksQ0FBQztZQVFqRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUztrQkFDcEMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztrQkFDMUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztTQUM1QjtRQUVELE1BQU0sQ0FBRSxPQUFxQjtZQUV6QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQXFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pILElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUF5QixDQUFDLENBQUMsQ0FBQztZQUV2RyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQXNCLENBQUMsQ0FBQyxDQUFDO1lBRTFGLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFUyxnQkFBZ0IsQ0FBRSxLQUFtQzs7O1lBRzNELElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTztZQUVqRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUVsQyxJQUFJLElBQUksRUFBRTtnQkFFTixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRWxCLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7YUFFNUM7aUJBQU07Z0JBRUgsTUFBQSxJQUFJLENBQUMsYUFBYSwwQ0FBRSxNQUFNLEdBQUc7YUFDaEM7U0FDSjtRQUVTLGlCQUFpQixDQUFFLEtBQXVCOzs7WUFJaEQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPO2dCQUFFLE9BQU87WUFFMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0REFBNEQsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7WUFHakosSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQUUsT0FBTzs7O1lBSWxDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRO2dCQUFFLE9BQU87OztZQUtsQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFFL0MsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO2dCQUU5QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3ZCOzs7WUFJRCxTQUFTLENBQUMsNkJBQU0sTUFBTSwwQ0FBRSxhQUFhLENBQUMsS0FBSyxJQUFDLENBQUMsQ0FBQztTQUNqRDtRQUVTLGFBQWEsQ0FBRSxLQUFvQjtZQUV6QyxRQUFRLEtBQUssQ0FBQyxHQUFHO2dCQUViLEtBQUssTUFBTTtvQkFFUCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWE7d0JBQUUsT0FBTztvQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUVkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXBCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7d0JBRTFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDeEY7b0JBRUQsTUFBTTthQUNiO1NBQ0o7UUFFUyxVQUFVO1lBRWhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRWxFLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxFQUFFLENBQUM7U0FDeEM7UUFFUyxZQUFZO1lBRWxCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDOUI7S0FDSjs7SUNoSE0sTUFBTSw4QkFBOEIsbUNBQ3BDLHlCQUF5QixLQUM1QixTQUFTLEVBQUUsSUFBSSxFQUNmLFNBQVMsRUFBRSxJQUFJLEVBQ2YsWUFBWSxFQUFFLElBQUksRUFDbEIsYUFBYSxFQUFFLElBQUksRUFDbkIsZ0JBQWdCLEVBQUUsSUFBSSxHQUN6QixDQUFDOzs7SUNUSyxNQUFNLDZCQUE2QixxQkFDbkMsOEJBQThCLENBQ3BDLENBQUM7QUFFRixVQUFhLG9CQUFxQixTQUFRLGNBQWM7UUFFcEQsTUFBTSxDQUFFLE9BQW9COztZQUd4QixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFckQsSUFBSSxDQUFDLE9BQVEsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBbUIsQ0FBQyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFzQixDQUFDLENBQUMsQ0FBQztZQUUzRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFZCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTTtZQUVGLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUVwQyxJQUFJLENBQUMsT0FBUSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsT0FBUSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUUvQyxPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUN6QjtRQUVELE1BQU07WUFFRixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQUUsT0FBTztZQUU5QixJQUFJLENBQUMsT0FBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1NBQ3JGO1FBRVMsZ0JBQWdCLENBQUUsS0FBbUM7WUFFM0QsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNqQjtRQUVTLFdBQVcsQ0FBRSxLQUFpQjtZQUVwQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3pCO1FBRVMsYUFBYSxDQUFFLEtBQW9CO1lBRXpDLFFBQVEsS0FBSyxDQUFDLEdBQUc7Z0JBRWIsS0FBSyxLQUFLLENBQUM7Z0JBQ1gsS0FBSyxLQUFLOztvQkFHTixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFFL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ3RCLE1BQU07cUJBQ1Q7Z0JBRUw7b0JBRUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDM0IsTUFBTTthQUNiO1NBQ0o7S0FDSjs7O0lDMUVNLE1BQU0sOEJBQThCLG1DQUNwQyw4QkFBOEIsS0FDakMsU0FBUyxFQUFFLEtBQUssRUFDaEIsU0FBUyxFQUFFLEtBQUssRUFDaEIsWUFBWSxFQUFFLEtBQUssR0FDdEIsQ0FBQztBQUVGLFVBQWEscUJBQXNCLFNBQVEsY0FBYztRQUVyRCxNQUFNLENBQUUsT0FBb0I7O1lBR3hCLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUVyRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFFOUIsSUFBSSxDQUFDLE9BQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFRLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBUSxFQUFFLFlBQVksRUFBRSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUU5RCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTTtZQUVGLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUVwQyxJQUFJLENBQUMsT0FBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsT0FBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRWxELE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3pCO0tBQ0o7OztJQzlCTSxNQUFNLGdCQUFnQixHQUFxRDtRQUM5RSxPQUFPLEVBQUUsY0FBYztRQUN2QixNQUFNLEVBQUUsb0JBQW9CO1FBQzVCLE9BQU8sRUFBRSxxQkFBcUI7S0FDakMsQ0FBQztBQUVGLElBQU8sTUFBTSx1QkFBdUIsR0FBZ0U7UUFDaEcsT0FBTyxFQUFFLDhCQUE4QjtRQUN2QyxNQUFNLEVBQUUsNkJBQTZCO1FBQ3JDLE9BQU8sRUFBRSw4QkFBOEI7S0FDMUMsQ0FBQztBQUVGLFVBQWEscUJBQXNCLFNBQVEsZUFBMEU7UUFFakgsWUFDYyxZQUFZLGdCQUFnQixFQUM1QixpQkFBaUIsdUJBQXVCO1lBR2xELEtBQUssQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFKdkIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1NBSXJEOzs7O1FBS0QsTUFBTSxDQUNGLElBQXlCLEVBQ3pCLE1BQXFDLEVBQ3JDLE9BQWdCLEVBQ2hCLEdBQUcsSUFBVztZQUdkLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3ZEO0tBQ0o7OztJQ2hDRCxNQUFNLHlCQUF5QixHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQztJQUV0SCxNQUFNLFlBQVksR0FBRyxJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBNEJ6RCxJQUFhLE9BQU8sZUFBcEIsTUFBYSxPQUFRLFNBQVEsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsb0JBQU8sc0JBQXNCLEVBQUc7UUFBOUc7O1lBa0RjLFVBQUssR0FBRyxLQUFLLENBQUM7WUFJZCxrQkFBYSxHQUFHLEtBQUssQ0FBQztZQTJEaEMsYUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBR2QsV0FBTSxHQUFHLENBQUMsQ0FBQztTQTBSZDtRQTVYRyxXQUFXLHFCQUFxQjtZQUU1QixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztTQUN0QztRQUVELFdBQVcseUJBQXlCO1lBRWhDLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDO1NBQzFDO1FBRUQsV0FBVyxXQUFXO1lBRWxCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztTQUM1QjtRQUVELFdBQVcsYUFBYTtZQUVwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDNUI7UUFFRCxPQUFPLFVBQVUsQ0FBRSxNQUE0Qjs7WUFHM0MsSUFBSSxJQUFJLENBQUMsYUFBYTtnQkFBRSxNQUFNLHlCQUF5QixFQUFFLENBQUM7WUFFMUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUM7WUFDMUYsSUFBSSxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDdEcsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUM7WUFFNUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7U0FDNUI7UUFjRCxJQUFjLE1BQU07WUFFaEIsT0FBTyxJQUFJLENBQUMsV0FBNkIsQ0FBQztTQUM3Qzs7OztRQUtELElBQUksU0FBUztZQUVULE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDdEQ7Ozs7UUFLRCxJQUFJLFFBQVE7WUFFUixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBRXJCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtnQkFFbEMsS0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtvQkFFNUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDO29CQUV0QyxRQUFRLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUM7b0JBRXhDLElBQUksUUFBUTt3QkFBRSxNQUFNO2lCQUN2QjthQUNKO1lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXpELE9BQU8sUUFBUSxDQUFDO1NBQ25CO1FBR0QsSUFBSSxJQUFJLENBQUUsS0FBYzs7WUFFcEIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0I7U0FDSjtRQUNELElBQUksSUFBSTtZQUNKLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyQjtRQVFELGlCQUFpQjtZQUViLElBQUksSUFBSSxDQUFDLGFBQWE7Z0JBQUUsT0FBTztZQUUvQixLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRTlDLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbEQ7UUFFRCxvQkFBb0I7O1lBRWhCLElBQUksSUFBSSxDQUFDLGFBQWE7Z0JBQUUsT0FBTzs7WUFHL0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRVosTUFBQSxJQUFJLENBQUMsY0FBYywwQ0FBRSxNQUFNLEdBQUc7WUFDOUIsTUFBQSxJQUFJLENBQUMsa0JBQWtCLDBDQUFFLE1BQU0sR0FBRztZQUVsQyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztZQUNoQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO1lBRXBDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQ2hDO1FBRUQsY0FBYyxDQUFFLE9BQWdCLEVBQUUsV0FBb0I7WUFFbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzQyxJQUFJLFdBQVcsRUFBRTtnQkFFYixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxHQUFJLENBQUMsSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7Z0JBRXBELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUVwQjtpQkFBTTtnQkFFSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUVqRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQ3BCO2FBQ0o7WUFFRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBRXJCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLEdBQUksQ0FBQyxJQUFJLENBQUMsSUFBSyxFQUFFLENBQUMsQ0FBQztnQkFFcEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0Q7U0FDSjtRQUVELElBQUk7WUFFQSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNwQjtRQUVELElBQUk7WUFFQSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUNyQjtRQUVELE1BQU0sQ0FBRSxJQUFjO1lBRWxCLElBQUksQ0FBQyxJQUFJLElBQUcsSUFBSSxhQUFKLElBQUksY0FBSixJQUFJLEdBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBLENBQUM7U0FDbEM7UUFFRCxPQUFPOztZQUVILElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVaLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtTQUN6Qzs7Ozs7Ozs7UUFTRCxnQkFBZ0I7WUFFWixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Ozs7Z0JBS2xDLElBQUksTUFBTSxHQUF3QixTQUFTLENBQUM7O2dCQUc1QyxLQUFLLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFOzs7b0JBSTVDLElBQUksT0FBTyxLQUFLLElBQUk7d0JBQUUsT0FBTyxNQUFNLENBQUM7OztvQkFJcEMsTUFBTSxHQUFHLE9BQU8sQ0FBQztpQkFDcEI7YUFDSjtTQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBdUJTLFdBQVcsQ0FBRSxJQUFhOzs7WUFLaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFBRSxPQUFPOztZQUdqQyxNQUFNLGNBQWMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7O1lBSWpFLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYTs7Z0JBRzdCLE1BQU0sSUFBSSxHQUFHLElBQUk7Ozs7O3NCQUtYLElBQUksQ0FBQyxPQUFPLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTzs7Ozs7c0JBS3JFLGFBQWEsS0FBSyxJQUFJLENBQUM7Z0JBRTdCLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBRVAsYUFBYSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7aUJBQzlCO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ2YsQ0FBQyxDQUFDOzs7WUFLSCxJQUFJLElBQUksRUFBRTtnQkFFTixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO2FBRXZFO2lCQUFNO2dCQUVILElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7YUFDbkI7U0FDSjs7Ozs7Ozs7Ozs7UUFhUyxpQkFBaUIsQ0FBRSxLQUFtQzs7OztZQUs1RCxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUk7Z0JBQUUsT0FBTztZQUV6QyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBRVgsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBRXJCO2lCQUFNO2dCQUVILElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN0QjtTQUNKO1FBRVMsVUFBVTs7WUFFaEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWxCLE1BQUEsSUFBSSxDQUFDLGtCQUFrQiwwQ0FBRSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ3RDLE1BQUEsSUFBSSxDQUFDLGtCQUFrQiwwQ0FBRSxNQUFNLEdBQUc7WUFFbEMsTUFBQSxJQUFJLENBQUMsa0JBQWtCLDBDQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDdEMsTUFBQSxJQUFJLENBQUMsa0JBQWtCLDBDQUFFLE1BQU0sR0FBRztTQUNyQztRQUVTLFdBQVc7O1lBRWpCLE1BQUEsSUFBSSxDQUFDLGtCQUFrQiwwQ0FBRSxNQUFNLEdBQUc7WUFDbEMsTUFBQSxJQUFJLENBQUMsa0JBQWtCLDBDQUFFLE1BQU0sR0FBRztZQUVsQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDdkI7UUFFUyxTQUFTOztZQUVmLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztZQUc1RCxNQUFBLElBQUksQ0FBQyxjQUFjLDBDQUFFLE1BQU0sR0FBRztZQUM5QixNQUFBLElBQUksQ0FBQyxrQkFBa0IsMENBQUUsTUFBTSxHQUFHO1lBQ2xDLE1BQUEsSUFBSSxDQUFDLGtCQUFrQiwwQ0FBRSxNQUFNLEdBQUc7O1lBR2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9HLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7WUFHOUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7WUFHaEQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUVYLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFFakMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3BDO1NBQ0o7UUFFUyxVQUFVO1lBRWhCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7Z0JBQUUsT0FBTztZQUVyQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUUxQixXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7WUFNaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1NBQzlCO1FBRVMsWUFBWTtZQUVsQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXO2dCQUFFLE9BQU87WUFFckMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFFMUIsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7U0FDOUI7S0FDSixDQUFBO0lBNVlHO0lBQ2lCLG9CQUFZLEdBQUcsS0FBSyxDQUFDO0lBRXRDO0lBQ2lCLDhCQUFzQixHQUEwRCxJQUFJLHFCQUFxQixFQUFFLENBQUM7SUFFN0g7SUFDaUIsa0NBQTBCLEdBQXdELElBQUkseUJBQXlCLEVBQUUsQ0FBQztJQUtsSCxlQUFPLEdBQUcsT0FBUyxDQUFDO0lBRXBCLHNCQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVcsQ0FBQztJQXFGckQ7UUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUseUJBQXlCLEVBQUUsQ0FBQzs7O3VDQU9sRDtJQU1EO1FBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLENBQUM7OzZDQUNwQztJQUdkO1FBREMsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQzs7MkNBQ3pEO0lBK0xYO1FBREMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQzs7eUNBQzVCLG1CQUFtQjs7b0RBZXREO0lBbFVRLE9BQU87UUFuQm5CLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxZQUFZO1lBQ3RCLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7O0tBWVgsQ0FBQztZQUNGLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQTs7S0FFbkI7U0FDSixDQUFDO09BQ1csT0FBTyxDQThZbkI7O0lDOVZELElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQXFCLFNBQVEsU0FBUztRQUFuRDs7WUFnRUksWUFBTyxHQUFHLENBQUMsQ0FBQztTQWdFZjtRQWxHRyxJQUFJLFlBQVk7WUFDWixPQUFPO2dCQUNILFdBQVcsRUFBRSxRQUFRO2dCQUNyQixZQUFZLEVBQUUsV0FBVztnQkFDekIsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDNUIsQ0FBQztTQUNMO1FBRUQsSUFBSSxhQUFhO1lBQ2IsT0FBTztnQkFDSCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLFNBQVMsRUFBRTtvQkFDUCxNQUFNLEVBQUU7d0JBQ0osVUFBVSxFQUFFLFFBQVE7d0JBQ3BCLFFBQVEsRUFBRSxPQUFPO3FCQUNwQjtvQkFDRCxNQUFNLEVBQUU7d0JBQ0osVUFBVSxFQUFFLFFBQVE7d0JBQ3BCLFFBQVEsRUFBRSxLQUFLO3FCQUNsQjtvQkFDRCxNQUFNLEVBQUU7d0JBQ0osVUFBVSxFQUFFLENBQUM7d0JBQ2IsUUFBUSxFQUFFLE1BQU07cUJBQ25CO2lCQUNKO2dCQUNELE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYztnQkFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUMzQixPQUFPLEVBQUUsS0FBSzthQUNqQixDQUFBO1NBQ0o7UUFLRCxpQkFBaUI7WUFFYixLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDaEI7UUFFRCxvQkFBb0I7WUFFaEIsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFFN0IsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUzQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztTQUNwQjtRQUVELGNBQWMsQ0FBRSxPQUFnQixFQUFFLFdBQW9CO1NBR3JEO1FBRUQsYUFBYTtZQUVULElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7U0FDMUM7UUFFRCx5QkFBeUI7WUFFckIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFFM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUE7Ozt3RUFHa0MsSUFBSSxDQUFDLE9BQVE7b0NBQ2pELElBQUksQ0FBQyx5QkFBMEI7YUFDdkQsQ0FBQztnQkFFRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFFekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBRTlELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7YUFHbkM7aUJBQU07Z0JBRUgsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3JDO1NBQ0o7UUFFUyxLQUFLO1lBRVgsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7Z0JBRXRCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFZixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFFaEIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNaO0tBQ0osQ0FBQTtJQXpIRztRQURDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQztrQ0FDdEIsT0FBTzt5REFBQztJQUdsQjtRQURDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztrQ0FDdEIsT0FBTzt3REFBQztJQUdqQjtRQURDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO2tDQUN2QixpQkFBaUI7OERBQUM7SUFHakM7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztrQ0FDdkIsT0FBTzs4REFBQztJQUd2QjtRQURDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxDQUFDO2tDQUN4QixpQkFBaUI7b0VBQUM7SUFHdkM7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztrQ0FDeEIsT0FBTzsrREFBQztJQUd4QjtRQURDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRSxDQUFDO2tDQUN6QixpQkFBaUI7cUVBQUM7SUFHeEM7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztrQ0FDdkIsZUFBZTtnRUFBQztJQW9DakM7UUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7O3lEQUNuQjtJQWhFSCxvQkFBb0I7UUFuRmhDLFNBQVMsQ0FBdUI7WUFDN0IsUUFBUSxFQUFFLGNBQWM7WUFDeEIsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFBOzs7OztLQUtYLENBQUM7WUFDRixRQUFRLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQTs7Ozs7OztxQkFPUCxPQUFPLENBQUMsYUFBYzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQXFCdEIsT0FBTyxDQUFDLHlCQUEwQjs7Ozs7Ozs7dUNBUWhCLE9BQU8sQ0FBQyxhQUFjOzs7Ozs7Ozs7OztzQ0FXdkIsT0FBTyxDQUFDLFlBQWE7Ozs7Ozs7Ozs7O3VCQVdwQyxPQUFPLENBQUMsa0JBQW1CO3NCQUM1QixPQUFPLENBQUMsa0JBQW1COzs7Ozs7Ozt1QkFRMUIsT0FBTyxDQUFDLG1CQUFvQjtzQkFDN0IsT0FBTyxDQUFDLG1CQUFvQjs7Ozs7S0FLOUM7U0FDSixDQUFDO09BQ1csb0JBQW9CLENBZ0loQzs7SUMvS0QsSUFBYUMsS0FBRyxHQUFoQixNQUFhLEdBQUksU0FBUSxTQUFTO1FBQWxDOztZQUVZLFdBQU0sR0FBb0IsSUFBSSxDQUFDO1lBRS9CLGNBQVMsR0FBRyxLQUFLLENBQUM7WUFFbEIsY0FBUyxHQUFHLEtBQUssQ0FBQztTQThGN0I7UUFuRUcsSUFBSSxRQUFRO1lBRVIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxRQUFRLENBQUUsS0FBYztZQUV4QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUV2QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzRDtRQU1ELElBQUksUUFBUTtZQUVSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUN6QjtRQUVELElBQUksUUFBUSxDQUFFLEtBQWM7WUFFeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0Q7UUFFRCxJQUFJLEtBQUs7WUFFTCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFFZCxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBYSxDQUFDO2FBQ3BFO1lBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ3RCO1FBRUQsaUJBQWlCO1lBRWIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUE7WUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztTQUM3QztRQUVELGNBQWMsQ0FBRSxPQUFnQixFQUFFLFdBQW9CO1lBRWxELElBQUksV0FBVyxFQUFFO2dCQUViLElBQUksSUFBSSxDQUFDLEtBQUs7b0JBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUNuRDtTQUNKO1FBRUQsTUFBTTtZQUVGLElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTztZQUUxQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUMxQztRQUVELFFBQVE7WUFFSixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU87WUFFMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUM7U0FDM0M7S0FDSixDQUFBO0lBekZHO1FBSEMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLHdCQUF3QjtTQUN0QyxDQUFDOzt1Q0FDWTtJQU1kO1FBSkMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLGVBQWU7WUFDMUIsU0FBUyxFQUFFLHdCQUF3QjtTQUN0QyxDQUFDOzsyQ0FDZ0I7SUFVbEI7UUFKQyxRQUFRLENBQUM7WUFDTixTQUFTLEVBQUUsVUFBVTtZQUNyQixTQUFTLEVBQUUsd0JBQXdCO1NBQ3RDLENBQUM7OzJDQUN1QjtJQU16QjtRQUpDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSxlQUFlO1lBQzFCLFNBQVMsRUFBRSw2QkFBNkI7U0FDM0MsQ0FBQzs7O3lDQUlEO0lBYUQ7UUFKQyxRQUFRLENBQUM7WUFDTixTQUFTLEVBQUUsZUFBZTtZQUMxQixTQUFTLEVBQUUsNkJBQTZCO1NBQzNDLENBQUM7Ozt5Q0FJRDtBQXBEUUEsU0FBRztRQTdCZixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsUUFBUTtZQUNsQixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXdCWCxDQUFDO1lBQ0YsUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFBLGVBQWU7U0FDdEMsQ0FBQztPQUNXQSxLQUFHLENBb0dmOzs7SUMzSEQsSUFBYSxPQUFPLEdBQXBCLE1BQWEsT0FBUSxTQUFRLFNBQVM7UUFTbEMsaUJBQWlCO1lBRWIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFFdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDQSxLQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDcEc7UUFFRCxjQUFjLENBQUUsT0FBZ0IsRUFBRSxXQUFvQjtZQUVsRCxJQUFJLFdBQVcsRUFBRTs7Ozs7Z0JBU2IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFJQSxLQUFHLENBQUMsUUFBUyxzQkFBc0IsQ0FBUSxDQUFDO2dCQUV2RixXQUFXO3NCQUNMLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztzQkFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDOzs7Z0JBSTdDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ25GO1NBQ0o7UUFHUyxhQUFhLENBQUUsS0FBb0I7WUFFekMsUUFBUSxLQUFLLENBQUMsR0FBRztnQkFFYixLQUFLLFNBQVM7b0JBRVYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDdEQsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUs7d0JBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDaEUsTUFBTTthQUNiO1NBQ0o7UUFNUyxxQkFBcUIsQ0FBRSxLQUE0QjtZQUV6RCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDL0MsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRTlDLElBQUksV0FBVyxLQUFLLFdBQVcsRUFBRTtnQkFFN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMvQjtTQUNKO1FBRVMsU0FBUyxDQUFFLEdBQVM7WUFFMUIsSUFBSSxHQUFHLEVBQUU7Z0JBRUwsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUViLElBQUksR0FBRyxDQUFDLEtBQUs7b0JBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQzNDO1NBQ0o7UUFFUyxXQUFXLENBQUUsR0FBUztZQUU1QixJQUFJLEdBQUcsRUFBRTtnQkFFTCxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRWYsSUFBSSxHQUFHLENBQUMsS0FBSztvQkFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDMUM7U0FDSjtLQUNKLENBQUE7SUFsRkc7UUFEQyxRQUFRLEVBQUU7O3lDQUNHO0lBbUNkO1FBREMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDOzt5Q0FDQyxhQUFhOztnREFVNUM7SUFNRDtRQUpDLFFBQVEsQ0FBVTtZQUNmLEtBQUssRUFBRSxvQkFBb0I7WUFDM0IsTUFBTSxFQUFFLGNBQWMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7U0FDcEQsQ0FBQzs7Ozt3REFXRDtJQXBFUSxPQUFPO1FBYm5CLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQTs7Ozs7Ozs7S0FRWCxDQUFDO1lBQ0YsUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFBLGVBQWU7U0FDdEMsQ0FBQztPQUNXLE9BQU8sQ0F5Rm5COzs7SUN0RkQsSUFBYSxRQUFRLEdBQXJCLE1BQWEsUUFBUyxTQUFRLFNBQVM7UUFtQm5DLGlCQUFpQjtZQUViLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRTFCLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFBO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdEI7S0FDSixDQUFBO0lBdEJHO1FBSEMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLHdCQUF3QjtTQUN0QyxDQUFDOzswQ0FDWTtJQU1kO1FBSkMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLGFBQWE7WUFDeEIsU0FBUyxFQUFFLDZCQUE2QjtTQUMzQyxDQUFDOzs0Q0FDZTtJQU1qQjtRQUpDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSxpQkFBaUI7WUFDNUIsU0FBUyxFQUFFLHdCQUF3QjtTQUN0QyxDQUFDOztnREFDa0I7SUFqQlgsUUFBUTtRQW5CcEIsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLGNBQWM7WUFDeEIsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7OztLQWNYLENBQUM7WUFDRixRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUEsZUFBZTtTQUN0QyxDQUFDO09BQ1csUUFBUSxDQTJCcEI7OztJQ21ERCxJQUFhLE1BQU0sR0FBbkIsTUFBYSxNQUFPLFNBQVEsU0FBUztRQUFyQzs7WUFNSSxZQUFPLEdBQUcsS0FBSyxDQUFDO1lBS2hCLFVBQUssR0FBRyxFQUFFLENBQUM7WUFNWCxZQUFPLEdBQUcsRUFBRSxDQUFDO1lBTWIsYUFBUSxHQUFHLEVBQUUsQ0FBQztTQW1DakI7UUE5QkcsaUJBQWlCO1lBRWIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDckI7UUFLRCxNQUFNOztZQUdGLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xEO1FBS1MsWUFBWSxDQUFFLEtBQW9CO1lBRXhDLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUU7Z0JBRTVDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Z0JBR2QsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQzFCO1NBQ0o7S0FDSixDQUFBO0lBcERHO1FBSkMsUUFBUSxDQUFDO1lBQ04sU0FBUyxFQUFFLGNBQWM7WUFDekIsU0FBUyxFQUFFLDZCQUE2QjtTQUMzQyxDQUFDOzsyQ0FDYztJQUtoQjtRQUhDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQzs7eUNBQ1M7SUFNWDtRQUpDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsZUFBZSxFQUFFLEtBQUs7U0FDekIsQ0FBQzs7MkNBQ1c7SUFNYjtRQUpDLFFBQVEsQ0FBQztZQUNOLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsZUFBZSxFQUFFLEtBQUs7U0FDekIsQ0FBQzs7NENBQ1k7SUFHZDtRQURDLFFBQVEsRUFBRTs7d0NBQ0c7SUFhZDtRQUhDLFFBQVEsQ0FBQztZQUNOLEtBQUssRUFBRSxPQUFPO1NBQ2pCLENBQUM7Ozs7d0NBS0Q7SUFLRDtRQUhDLFFBQVEsQ0FBQztZQUNOLEtBQUssRUFBRSxTQUFTO1NBQ25CLENBQUM7O3lDQUM2QixhQUFhOzs4Q0FTM0M7SUF6RFEsTUFBTTtRQWhHbEIsU0FBUyxDQUFTO1lBQ2YsUUFBUSxFQUFFLFdBQVc7WUFDckIsUUFBUSxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUF3RnJCLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLFFBQVE7Y0FDMUIsSUFBSSxDQUFBLGlDQUFrQyxNQUFNLENBQUMsUUFBUyx1Q0FBd0MsTUFBTSxDQUFDLE9BQVEsU0FBUztjQUN0SCxFQUNOO0tBQ0g7U0FDSixDQUFDO09BQ1csTUFBTSxDQTBEbEI7OztJQzdJRCxJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFlLFNBQVEsU0FBUztRQUE3Qzs7WUFFYyxpQkFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7WUFHNUMsYUFBUSxHQUFHLENBQUMsQ0FBQztTQWVoQjtRQWJHLGlCQUFpQjtZQUViLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRS9CLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzdCO1FBRUQsb0JBQW9CO1lBRWhCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFM0IsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7U0FDaEM7S0FDSixDQUFBO0lBZkc7UUFEQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQzs7b0RBQ3JDO0lBTEosY0FBYztRQVgxQixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFFBQVEsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFBOztLQUV4QjtZQUNELE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQTs7OztLQUlYLENBQUM7U0FDTCxDQUFDO09BQ1csY0FBYyxDQW9CMUI7SUFjRCxJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFlLFNBQVEsU0FBUztRQUE3Qzs7WUFFYyxpQkFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7U0EyRC9DO1FBbkRHLGNBQWMsQ0FBRSxPQUFnQixFQUFFLFdBQW9CO1lBRWxELElBQUksV0FBVyxFQUFFOzs7OztnQkFNYixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQXlCLENBQUMsQ0FBQyxDQUFDOzs7OztnQkFNekgsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxlQUFlLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUF5QixDQUFDLENBQUMsQ0FBQzthQUM1SDtTQUNKO1FBRUQsb0JBQW9CO1lBRWhCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFaEMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7U0FDaEM7UUFHUyxhQUFhLENBQUUsS0FBaUI7WUFFdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUcsS0FBSyxDQUFDLE1BQTJCLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDckY7UUFHUyxjQUFjLENBQUUsS0FBaUI7WUFFdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUcsS0FBSyxDQUFDLE1BQTJCLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDdEY7UUFFUyxXQUFXLENBQUUsS0FBaUI7WUFFcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUcsS0FBSyxDQUFDLE1BQTJCLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDbkY7UUFFUyxVQUFVLENBQUUsS0FBaUI7WUFFbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUcsS0FBSyxDQUFDLE1BQTJCLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDbEY7UUFFUyxpQkFBaUIsQ0FBRSxLQUF1QjtZQUVoRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFtQixLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVMsS0FBSyxFQUFHLEtBQUssQ0FBQyxNQUEyQixDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDL0k7S0FDSixDQUFBO0lBeERHO1FBREMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO2tDQUNiLFdBQVc7d0RBQUM7SUFHM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7a0NBQ2IsV0FBVzt3REFBQztJQTRCM0I7UUFEQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQzs7eUNBQ2pCLFVBQVU7O3VEQUd6QztJQUdEO1FBREMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7O3lDQUNqQixVQUFVOzt3REFHMUM7SUE3Q1EsY0FBYztRQVoxQixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsa0JBQWtCO1lBQzVCLFFBQVEsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFBOzs7S0FHeEI7WUFDRCxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUE7Ozs7S0FJWCxDQUFDO1NBQ0wsQ0FBQztPQUNXLGNBQWMsQ0E2RDFCOzs7SUM1RkQsSUFBYSxHQUFHLEdBQWhCLE1BQWEsR0FBSSxTQUFRLFNBQVM7S0FBSSxDQUFBO0lBQXpCLEdBQUc7UUFOZixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsVUFBVTtZQUNwQixNQUFNLEVBQUUsS0FBSztZQUNiLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNoQixRQUFRLEVBQUUsUUFBUTtTQUNyQixDQUFDO09BQ1csR0FBRyxDQUFzQjs7O0lDbEJ0QyxTQUFTLFNBQVM7UUFFZCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXZELElBQUksUUFBUSxFQUFFO1lBRVYsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLEtBQUssSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFFLEtBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNyRztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDOzs7OzsifQ==
