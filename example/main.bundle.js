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

            <button id="popover">Show Popover</button>

            <ui-overlay trigger="#popover" position-type="connected">
                <!-- <template> -->
                    <h3>Popover</h3>
                    <p>This is the content of the popover: ${element.counter}</p>
                <!-- </template> -->
            </ui-overlay>

            <button id="overlay-programmatic" @click=${element.showOverlay}>Show programmatic overlay</button>
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
        }
        updatePosition(position) {
            this.nextPosition = position ? Object.assign(Object.assign({}, (this.currentPosition || this.defaultPosition)), position) : undefined;
            if (!this.animationFrame) {
                this.animationFrame = requestAnimationFrame(() => {
                    const nextPosition = this.nextPosition || this.getPosition();
                    if (!this.currentPosition || !this.comparePositions(this.currentPosition, nextPosition)) {
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
            this.target.style.top = this.parseStyle(position.top);
            this.target.style.left = this.parseStyle(position.left);
            this.target.style.bottom = this.parseStyle(position.bottom);
            this.target.style.right = this.parseStyle(position.right);
            this.target.style.width = this.parseStyle(position.width);
            this.target.style.height = this.parseStyle(position.height);
            this.target.style.maxWidth = this.parseStyle(position.maxWidth);
            this.target.style.maxHeight = this.parseStyle(position.maxHeight);
        }
        parseStyle(value) {
            return (typeof value === 'number') ? `${value}px` : value;
        }
        comparePositions(position, otherPosition) {
            const keys = Object.keys(position);
            return !keys.find((key => position[key] !== otherPosition[key]));
        }
    }
    //# sourceMappingURL=position-strategy.js.map

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
    //# sourceMappingURL=fixed-position-strategy.js.map

    const DEFAULT_ALIGNMENT_PAIR = {
        origin: {
            horizontal: "start" /* Start */,
            vertical: "end" /* End */
        },
        target: {
            horizontal: "start" /* Start */,
            vertical: "start" /* Start */
        }
    };
    //# sourceMappingURL=alignment.js.map

    class ConnectedPositionStrategy extends PositionStrategy {
        constructor(target, origin, defaultPosition = DEFAULT_POSITION, alignment = DEFAULT_ALIGNMENT_PAIR) {
            super(target, defaultPosition);
            this.target = target;
            this.origin = origin;
            this.alignment = alignment;
            this.updateListener = () => this.updatePosition();
            window.addEventListener('resize', this.updateListener);
            document.addEventListener('scroll', this.updateListener, true);
        }
        destroy() {
            super.destroy();
            window.removeEventListener('resize', this.updateListener);
            document.removeEventListener('scroll', this.updateListener, true);
        }
        getPosition() {
            const origin = this.origin.getBoundingClientRect();
            const target = this.target.getBoundingClientRect();
            const position = Object.assign({}, this.defaultPosition);
            switch (this.alignment.origin.horizontal) {
                case "center" /* Center */:
                    position.left = origin.left + origin.width / 2;
                    break;
                case "start" /* Start */:
                    position.left = origin.left;
                    break;
                case "end" /* End */:
                    position.left = origin.right;
                    break;
            }
            switch (this.alignment.origin.vertical) {
                case "center" /* Center */:
                    position.top = origin.top + origin.height / 2;
                    break;
                case "start" /* Start */:
                    position.top = origin.top;
                    break;
                case "end" /* End */:
                    position.top = origin.bottom;
                    break;
            }
            switch (this.alignment.target.horizontal) {
                case "center" /* Center */:
                    position.left = position.left - target.width / 2;
                    break;
                case "end" /* End */:
                    position.left = position.left - target.width;
                    break;
                case "start" /* Start */:
                    break;
            }
            switch (this.alignment.target.vertical) {
                case "center" /* Center */:
                    position.top = position.top - target.height / 2;
                    break;
                case "end" /* End */:
                    position.top = position.top - target.height;
                    break;
                case "start" /* Start */:
                    break;
            }
            // TODO: include offset
            return position;
        }
        applyPosition(position) {
            super.applyPosition(Object.assign(Object.assign({}, position), { top: '', left: '', bottom: '', right: '' }));
            this.target.style.transform = `translate(${position.left}, ${position.top})`;
        }
    }
    //# sourceMappingURL=connected-position-strategy.js.map

    const DEFAULT_POSITION_STRATEGIES = {
        fixed: FixedPositionStrategy,
        connected: ConnectedPositionStrategy,
    };
    class PositionStrategyFactory {
        constructor(strategies = DEFAULT_POSITION_STRATEGIES) {
            this.strategies = strategies;
        }
        createPositionStrategy(type, ...args) {
            return this.strategies[type] ? new this.strategies[type](...args) : new FixedPositionStrategy(...args);
        }
    }
    //# sourceMappingURL=position-strategy-factory.js.map

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
    //# sourceMappingURL=event-manager.js.map

    class Behavior {
        constructor() {
            this.eventManager = new EventManager();
        }
        get hasAttached() {
            return this._element !== undefined;
        }
        get element() {
            return this._element;
        }
        attach(element, ...args) {
            this._element = element;
        }
        detach(...args) {
            this.eventManager.unlistenAll();
            this._element = undefined;
        }
        listen(target, type, listener, options) {
            this.eventManager.listen(target, type, listener, options);
        }
        unlisten(target, type, listener, options) {
            this.eventManager.unlisten(target, type, listener, options);
        }
        dispatch(eventOrType, detail, eventInit) {
            if (this.hasAttached) {
                return (eventOrType instanceof Event)
                    ? this.eventManager.dispatch(this.element, eventOrType)
                    : this.eventManager.dispatch(this.element, eventOrType, detail, eventInit);
            }
            return false;
        }
    }
    //# sourceMappingURL=behavior.js.map

    class OverlayTrigger extends Behavior {
        constructor(overlay) {
            super();
            this.overlay = overlay;
            this.overlayService = new OverlayService();
        }
        attach(element) {
            super.attach(element);
            this.element.setAttribute('aria-haspopup', 'dialog');
            this.eventManager.listen(this.element, 'keydown', (event) => this.handleKeydown(event));
            this.eventManager.listen(this.element, 'mousedown', (event) => this.handleMousedown(event));
            this.eventManager.listen(this.overlay, 'open-changed', () => this.update());
            this.update();
        }
        detach() {
            this.element.removeAttribute('aria-haspopup');
            this.element.removeAttribute('aria-expanded');
            super.detach();
        }
        update() {
            if (this.hasAttached) {
                this.element.setAttribute('aria-expanded', this.overlay.open ? 'true' : 'false');
            }
        }
        handleKeydown(event) {
            switch (event.key) {
                case Enter:
                case Space:
                    this.overlayService.toggleOverlay(this.overlay, event);
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                case Escape:
                    this.overlayService.closeOverlay(this.overlay, event);
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        }
        handleMousedown(event) {
            this.overlayService.toggleOverlay(this.overlay, event);
        }
    }
    class TooltipOverlayTrigger extends OverlayTrigger {
        constructor(overlay) {
            super(overlay);
            this.overlay = overlay;
        }
        attach(element) {
            // TODO: this will run the OverlayTrigger's attach method and add all default event handlers... we don't want that!
            super.attach(element);
            this.overlay.role = 'tooltip';
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('aria-describedby', this.overlay.id);
            this.eventManager.listen(this.element, 'mouseenter', () => this.openTooltip());
            this.eventManager.listen(this.element, 'mouseleave', () => this.closeTooltip());
            this.eventManager.listen(this.element, 'focus', () => this.openTooltip());
            this.eventManager.listen(this.element, 'blur', () => this.closeTooltip());
        }
        detach() {
            this.element.removeAttribute('tabindex');
            this.element.removeAttribute('aria-describedby');
            super.detach();
        }
        update() { }
        openTooltip() { }
        closeTooltip() { }
    }
    // export class TreeOverlayTrigger { }
    // export class GridOverlayTrigger { }

    const DEFAULT_OVERLAY_TRIGGERS = {
        default: OverlayTrigger,
        tooltip: TooltipOverlayTrigger,
    };
    class OverlayTriggerFactory {
        constructor(triggers = DEFAULT_OVERLAY_TRIGGERS) {
            this.triggers = triggers;
        }
        createOverlayTrigger(type, ...args) {
            return this.triggers[type] ? new this.triggers[type](...args) : new OverlayTrigger(...args);
        }
    }
    //# sourceMappingURL=overlay-trigger-factory.js.map

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

    const insertAfter = (newChild, refChild) => {
        return refChild.parentNode.insertBefore(newChild, refChild.nextSibling);
    };
    //# sourceMappingURL=dom.js.map

    const OVERLAY_UNREGISTERED_ERROR = (overlay) => new Error(`Overlay is not registered: ${overlay.selector}`);
    // export interface OverlayState {
    //     config: OverlayConfig;
    //     positionStrategy: PositionStrategy;
    //     overlayTrigger: OverlayTrigger;
    //     template: TemplateFunction;
    //     context: Component;
    //     destroy: () => void;
    // }
    let OVERLAY_SERVICE_INSTANCE;
    class OverlayService {
        constructor(positionStrategyFactory = new PositionStrategyFactory(), overlayTriggerFactory = new OverlayTriggerFactory(), root = document.body) {
            this.positionStrategyFactory = positionStrategyFactory;
            this.overlayTriggerFactory = overlayTriggerFactory;
            this.root = root;
            this.registeredOverlays = new Map();
            this.activeOverlays = [];
            if (!OVERLAY_SERVICE_INSTANCE) {
                OVERLAY_SERVICE_INSTANCE = this;
                this.createBackdrop();
            }
            return OVERLAY_SERVICE_INSTANCE;
        }
        hasOpenOverlays() {
            return this.activeOverlays.length > 0;
        }
        hasOverlay(overlay) {
            return this.registeredOverlays.has(overlay);
        }
        isOverlayOpen(overlay) {
            this._throwUnregiseredOverlay(overlay);
            return this.activeOverlays.includes(overlay);
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
                    isActive = this.isOverlayActive(this.activeOverlays[index]);
                }
            }
            return isActive;
        }
        createBackdrop() {
            this.backdrop = document.createElement(OverlayBackdrop.selector);
            this.root.appendChild(this.backdrop);
        }
        createOverlay(config) {
            const overlay = document.createElement(Overlay.selector);
            const definition = this.configureOverlay(overlay, config);
            this.registerOverlay(overlay, definition);
            if (definition.template) {
                this.renderOverlay(overlay);
            }
            return overlay;
        }
        /**
         * Register on overlay with the overlay service
         *
         * @description
         * Adds the overlay instance to the overlay service's registry, extracts the overlay's configuration and
         * attaches the overlay to the overlay service's root location in the document body.
         *
         * @returns True if the overlay was registered successfully, false if the overlay has been registered already
         */
        registerOverlay(overlay, definition) {
            console.log('registerOverlay...', this.registeredOverlays.has(overlay));
            if (!this.hasOverlay(overlay)) {
                if (!definition) {
                    // if no definition is provided with the register call, we extract it from the overlay properties
                    definition = this.configureOverlay(overlay, {
                        triggerType: overlay.triggerType,
                        positionType: overlay.positionType,
                        template: overlay.template,
                        context: overlay.context || overlay
                    });
                }
                this.registeredOverlays.set(overlay, definition);
                this.attachOverlay(overlay);
                return true;
            }
            else {
                return false;
            }
        }
        openOverlay(overlay, event) {
            this._throwUnregiseredOverlay(overlay);
            if (!overlay.open) {
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
                overlay.show();
            }
        }
        closeOverlay(overlay, event) {
            this._throwUnregiseredOverlay(overlay);
            if (this.isOverlayOpen(overlay)) {
                let isFound = false;
                while (!isFound) {
                    // activeOverlay is either a descendant of overlay or overlay itself
                    let activeOverlay = this.activeOverlays.pop();
                    // if we arrived at the overlay, we stop closing
                    isFound = activeOverlay === overlay;
                    activeOverlay.hide();
                }
            }
        }
        toggleOverlay(overlay, event) {
            if (overlay.open) {
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
                const { updateListener, context, positionStrategy } = this.registeredOverlays.get(overlay);
                context.addEventListener('update', updateListener);
                this.renderOverlay(overlay);
                positionStrategy.updatePosition();
            }
        }
        onOverlayClose(overlay) {
            if (this.hasOverlay(overlay)) {
                const { updateListener, context } = this.registeredOverlays.get(overlay);
                context.removeEventListener('update', updateListener);
            }
        }
        configureOverlay(overlay, config = {}) {
            const overlayDefinition = Object.assign({}, this.registeredOverlays.get(overlay)) || {};
            const positionType = config.positionType || 'fixed';
            overlayDefinition.positionStrategy = this.positionStrategyFactory.createPositionStrategy(positionType, overlay);
            const triggerType = config.triggerType;
            if (triggerType) {
                overlayDefinition.overlayTrigger = this.overlayTriggerFactory.createOverlayTrigger(triggerType);
            }
            const openChangeListener = ((event) => {
                const open = event.detail.current;
                if (open) {
                    this.onOverlayOpen(overlay);
                }
                else {
                    this.onOverlayClose(overlay);
                }
            });
            overlay.addEventListener('open-changed', openChangeListener);
            overlayDefinition.updateListener = () => {
                this.renderOverlay(overlay);
            };
            // const template = config.template || overlay.template;
            const template = config.template;
            // const context = config.context || overlay.context || overlay;
            const context = config.context || overlay;
            // to keep a template up-to-date with it's context, we have to render the template
            // everytime the context renders - that is, on every update which was triggered
            // we can use a component's 'update' event to re-render the template on every context update
            // lit-html will take care of efficiently updating the DOM
            // context.addEventListener('update', updateListener);
            overlayDefinition.template = template;
            overlayDefinition.context = context;
            overlayDefinition.destroy = () => {
                overlay.removeEventListener('open-changed', openChangeListener);
                // context!.removeEventListener('update', updateListener);
            };
            return overlayDefinition;
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
                const { template, context } = this.registeredOverlays.get(overlay);
                if (template) {
                    render(template(context), overlay, { eventContext: context });
                }
            }
            // const result = template(context || overlay) || html``;
            // render(result, overlay, { eventContext: context || overlay });
        }
        _throwUnregiseredOverlay(overlay) {
            if (!this.hasOverlay(overlay)) {
                throw OVERLAY_UNREGISTERED_ERROR(overlay.constructor);
            }
        }
    }
    //# sourceMappingURL=overlay-service.js.map

    let OVERLAY_COUNTER = 0;
    function nextOverlayId() {
        return `partkit-overlay-${OVERLAY_COUNTER++}`;
    }
    let Overlay = class Overlay extends Component {
        constructor() {
            super(...arguments);
            this.overlayService = new OverlayService();
            this.triggerInstance = null;
            // protected triggerElement: HTMLElement | null = null;
            // protected positionManager!: PositionManager;
            this.open = false;
            this.tabindex = -1;
            this.triggerType = 'default';
            this.positionType = 'fixed';
            this.positionStrategy = new FixedPositionStrategy(this);
            // protected initTemplate () {
            //     this.template = this.querySelector('template');
            //     if (this.template) {
            //         this.templateObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => this.updateTemplate());
            //         this.templateObserver.observe(
            //             // we can't observe a template directly, but the DocumentFragment stored in its content property
            //             this.template.content,
            //             {
            //                 attributes: true,
            //                 characterData: true,
            //                 childList: true,
            //                 subtree: true,
            //             }
            //         );
            //     }
            // }
            // protected updateTemplate () {
            //     this.template = this.querySelector('template');
            //     if (this.template && !this.hidden) {
            //         const contentSlot = this.renderRoot.querySelector('slot') as HTMLSlotElement;
            //         requestAnimationFrame(() => {
            //             contentSlot.innerHTML = '';
            //             contentSlot.appendChild(document.importNode(this.template!.content, true));
            //         });
            //     }
            // }
        }
        connectedCallback() {
            if (!this.overlayService.hasOverlay(this)) {
                this.overlayService.registerOverlay(this);
                return;
            }
            // if (this.overlayService.registerOverlay(this)) return;
            super.connectedCallback();
            this.id = this.id || nextOverlayId();
            this.role = 'dialog';
            // this.positionManager = new PositionManager(new ConnectedPositionStrategy(this, document.getElementById(this.trigger)!));
            // this.positionManager = new PositionManager(this.positionStrategy);
            // this.initTemplate();
        }
        disconnectedCallback() {
            // if (this.positionManager) this.positionManager.destroy();
            // if (this.templateObserver) this.templateObserver.disconnect();
            this.overlayService.destroyOverlay(this, false);
        }
        updateCallback(changes, firstUpdate) {
            if (changes.has('trigger')) {
                this.updateTrigger(document.querySelector(this.trigger));
            }
        }
        hasFocus() {
            // TODO: should query overlay service to check for descendants with focus
        }
        show() {
            if (!this.open) {
                this.watch(() => this.open = true);
                // this.updateTemplate();
                // this.reposition();
                // this.overlayService.onShowOverlay(this);
            }
        }
        hide() {
            if (this.open) {
                this.watch(() => this.open = false);
                // this.overlayService.onHideOverlay(this);
            }
        }
        toggle() {
            if (!this.open) {
                this.show();
            }
            else {
                this.hide();
            }
        }
        // reposition () {
        //     if (this.positionManager) {
        //         this.positionManager.updatePosition();
        //     }
        // }
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
        updateTrigger(triggerElement) {
            if (this.triggerInstance) {
                this.triggerInstance.detach();
            }
            this.triggerInstance = new OverlayTrigger(this);
            this.triggerInstance.attach(triggerElement);
        }
    };
    __decorate([
        property({
            converter: AttributeConverterBoolean,
            reflectProperty: 'reflectOpen'
        }),
        __metadata("design:type", Object)
    ], Overlay.prototype, "open", void 0);
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
    ], Overlay.prototype, "trigger", void 0);
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Overlay.prototype, "triggerType", void 0);
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Overlay.prototype, "positionType", void 0);
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
    //# sourceMappingURL=tab.js.map

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
                this.overlay = this.overlayService.createOverlay({ template: template, context: this });
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
    //# sourceMappingURL=main.js.map

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9pY29uL2ljb24udHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1oZWFkZXIudHMiLCJzcmMvaGVscGVycy9jb3B5cmlnaHQudHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1wYW5lbC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIiwic3JjL2FwcC5zdHlsZXMudHMiLCJzcmMvYXBwLnRlbXBsYXRlLnRzIiwic3JjL2NhcmQudHMiLCJzcmMvY2hlY2tib3gudHMiLCJzcmMvcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3kudHMiLCJzcmMvcG9zaXRpb24vc3RyYXRlZ2llcy9maXhlZC1wb3NpdGlvbi1zdHJhdGVneS50cyIsInNyYy9wb3NpdGlvbi9hbGlnbm1lbnQudHMiLCJzcmMvcG9zaXRpb24vc3RyYXRlZ2llcy9jb25uZWN0ZWQtcG9zaXRpb24tc3RyYXRlZ3kudHMiLCJzcmMvcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeS50cyIsInNyYy9ldmVudC1tYW5hZ2VyLnRzIiwic3JjL2JlaGF2aW9yLnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS10cmlnZ2VyLnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS10cmlnZ2VyLWZhY3RvcnkudHMiLCJzcmMvb3ZlcmxheS9vdmVybGF5LWJhY2tkcm9wLnRzIiwic3JjL2RvbS50cyIsInNyYy9vdmVybGF5L292ZXJsYXktc2VydmljZS50cyIsInNyYy9vdmVybGF5L292ZXJsYXkudHMiLCJzcmMvdGFicy90YWIudHMiLCJzcmMvdGFicy90YWItbGlzdC50cyIsInNyYy90YWJzL3RhYi1wYW5lbC50cyIsInNyYy90b2dnbGUudHMiLCJzcmMvYXBwLnRzIiwibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5jb25zdCBkaXJlY3RpdmVzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogQnJhbmRzIGEgZnVuY3Rpb24gYXMgYSBkaXJlY3RpdmUgZmFjdG9yeSBmdW5jdGlvbiBzbyB0aGF0IGxpdC1odG1sIHdpbGwgY2FsbFxuICogdGhlIGZ1bmN0aW9uIGR1cmluZyB0ZW1wbGF0ZSByZW5kZXJpbmcsIHJhdGhlciB0aGFuIHBhc3NpbmcgYXMgYSB2YWx1ZS5cbiAqXG4gKiBBIF9kaXJlY3RpdmVfIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIFBhcnQgYXMgYW4gYXJndW1lbnQuIEl0IGhhcyB0aGVcbiAqIHNpZ25hdHVyZTogYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBfZmFjdG9yeV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGFyZ3VtZW50cyBmb3IgZGF0YSBhbmRcbiAqIGNvbmZpZ3VyYXRpb24gYW5kIHJldHVybnMgYSBkaXJlY3RpdmUuIFVzZXJzIG9mIGRpcmVjdGl2ZSB1c3VhbGx5IHJlZmVyIHRvXG4gKiB0aGUgZGlyZWN0aXZlIGZhY3RvcnkgYXMgdGhlIGRpcmVjdGl2ZS4gRm9yIGV4YW1wbGUsIFwiVGhlIHJlcGVhdCBkaXJlY3RpdmVcIi5cbiAqXG4gKiBVc3VhbGx5IGEgdGVtcGxhdGUgYXV0aG9yIHdpbGwgaW52b2tlIGEgZGlyZWN0aXZlIGZhY3RvcnkgaW4gdGhlaXIgdGVtcGxhdGVcbiAqIHdpdGggcmVsZXZhbnQgYXJndW1lbnRzLCB3aGljaCB3aWxsIHRoZW4gcmV0dXJuIGEgZGlyZWN0aXZlIGZ1bmN0aW9uLlxuICpcbiAqIEhlcmUncyBhbiBleGFtcGxlIG9mIHVzaW5nIHRoZSBgcmVwZWF0KClgIGRpcmVjdGl2ZSBmYWN0b3J5IHRoYXQgdGFrZXMgYW5cbiAqIGFycmF5IGFuZCBhIGZ1bmN0aW9uIHRvIHJlbmRlciBhbiBpdGVtOlxuICpcbiAqIGBgYGpzXG4gKiBodG1sYDx1bD48JHtyZXBlYXQoaXRlbXMsIChpdGVtKSA9PiBodG1sYDxsaT4ke2l0ZW19PC9saT5gKX08L3VsPmBcbiAqIGBgYFxuICpcbiAqIFdoZW4gYHJlcGVhdGAgaXMgaW52b2tlZCwgaXQgcmV0dXJucyBhIGRpcmVjdGl2ZSBmdW5jdGlvbiB0aGF0IGNsb3NlcyBvdmVyXG4gKiBgaXRlbXNgIGFuZCB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uIFdoZW4gdGhlIG91dGVyIHRlbXBsYXRlIGlzIHJlbmRlcmVkLCB0aGVcbiAqIHJldHVybiBkaXJlY3RpdmUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIFBhcnQgZm9yIHRoZSBleHByZXNzaW9uLlxuICogYHJlcGVhdGAgdGhlbiBwZXJmb3JtcyBpdCdzIGN1c3RvbSBsb2dpYyB0byByZW5kZXIgbXVsdGlwbGUgaXRlbXMuXG4gKlxuICogQHBhcmFtIGYgVGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uLiBNdXN0IGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFcbiAqIGZ1bmN0aW9uIG9mIHRoZSBzaWduYXR1cmUgYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC4gVGhlIHJldHVybmVkIGZ1bmN0aW9uIHdpbGxcbiAqIGJlIGNhbGxlZCB3aXRoIHRoZSBwYXJ0IG9iamVjdC5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGltcG9ydCB7ZGlyZWN0aXZlLCBodG1sfSBmcm9tICdsaXQtaHRtbCc7XG4gKlxuICogY29uc3QgaW1tdXRhYmxlID0gZGlyZWN0aXZlKCh2KSA9PiAocGFydCkgPT4ge1xuICogICBpZiAocGFydC52YWx1ZSAhPT0gdikge1xuICogICAgIHBhcnQuc2V0VmFsdWUodilcbiAqICAgfVxuICogfSk7XG4gKi9cbmV4cG9ydCBjb25zdCBkaXJlY3RpdmUgPSAoZikgPT4gKCguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgZCA9IGYoLi4uYXJncyk7XG4gICAgZGlyZWN0aXZlcy5zZXQoZCwgdHJ1ZSk7XG4gICAgcmV0dXJuIGQ7XG59KTtcbmV4cG9ydCBjb25zdCBpc0RpcmVjdGl2ZSA9IChvKSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnZnVuY3Rpb24nICYmIGRpcmVjdGl2ZXMuaGFzKG8pO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcmVjdGl2ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIFRydWUgaWYgdGhlIGN1c3RvbSBlbGVtZW50cyBwb2x5ZmlsbCBpcyBpbiB1c2UuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NFUG9seWZpbGwgPSB3aW5kb3cuY3VzdG9tRWxlbWVudHMgIT09IHVuZGVmaW5lZCAmJlxuICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrICE9PVxuICAgICAgICB1bmRlZmluZWQ7XG4vKipcbiAqIFJlcGFyZW50cyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLFxuICogaW50byBhbm90aGVyIGNvbnRhaW5lciAoY291bGQgYmUgdGhlIHNhbWUgY29udGFpbmVyKSwgYmVmb3JlIGBiZWZvcmVgLiBJZlxuICogYGJlZm9yZWAgaXMgbnVsbCwgaXQgYXBwZW5kcyB0aGUgbm9kZXMgdG8gdGhlIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlcGFyZW50Tm9kZXMgPSAoY29udGFpbmVyLCBzdGFydCwgZW5kID0gbnVsbCwgYmVmb3JlID0gbnVsbCkgPT4ge1xuICAgIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzdGFydC5uZXh0U2libGluZztcbiAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShzdGFydCwgYmVmb3JlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbn07XG4vKipcbiAqIFJlbW92ZXMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0YCAoaW5jbHVzaXZlKSB0byBgZW5kYCAoZXhjbHVzaXZlKSwgZnJvbVxuICogYGNvbnRhaW5lcmAuXG4gKi9cbmV4cG9ydCBjb25zdCByZW1vdmVOb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3RhcnQpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSB7fTtcbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBOb2RlUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB3aXRoIGVtYmVkZGVkIHVuaXF1ZSBrZXkgdG8gYXZvaWQgY29sbGlzaW9uIHdpdGhcbiAqIHBvc3NpYmxlIHRleHQgaW4gdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY29uc3QgbWFya2VyID0gYHt7bGl0LSR7U3RyaW5nKE1hdGgucmFuZG9tKCkpLnNsaWNlKDIpfX19YDtcbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgdXNlZCB0ZXh0LXBvc2l0aW9ucywgbXVsdGktYmluZGluZyBhdHRyaWJ1dGVzLCBhbmRcbiAqIGF0dHJpYnV0ZXMgd2l0aCBtYXJrdXAtbGlrZSB0ZXh0IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vZGVNYXJrZXIgPSBgPCEtLSR7bWFya2VyfS0tPmA7XG5leHBvcnQgY29uc3QgbWFya2VyUmVnZXggPSBuZXcgUmVnRXhwKGAke21hcmtlcn18JHtub2RlTWFya2VyfWApO1xuLyoqXG4gKiBTdWZmaXggYXBwZW5kZWQgdG8gYWxsIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBUZW1wbGF0ZSB0aGF0IHRyYWNrcyB0aGUgbG9jYXRpb24gb2YgZHluYW1pYyBwYXJ0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBjb25zdCBub2Rlc1RvUmVtb3ZlID0gW107XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGVsZW1lbnQuY29udGVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfFRFWFR9ICovLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBsYXN0IGluZGV4IGFzc29jaWF0ZWQgd2l0aCBhIHBhcnQuIFdlIHRyeSB0byBkZWxldGVcbiAgICAgICAgLy8gdW5uZWNlc3Nhcnkgbm9kZXMsIGJ1dCB3ZSBuZXZlciB3YW50IHRvIGFzc29jaWF0ZSB0d28gZGlmZmVyZW50IHBhcnRzXG4gICAgICAgIC8vIHRvIHRoZSBzYW1lIGluZGV4LiBUaGV5IG11c3QgaGF2ZSBhIGNvbnN0YW50IG5vZGUgYmV0d2Vlbi5cbiAgICAgICAgbGV0IGxhc3RQYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGNvbnN0IHsgc3RyaW5ncywgdmFsdWVzOiB7IGxlbmd0aCB9IH0gPSByZXN1bHQ7XG4gICAgICAgIHdoaWxlIChwYXJ0SW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UndmUgZXhoYXVzdGVkIHRoZSBjb250ZW50IGluc2lkZSBhIG5lc3RlZCB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgLy8gLSBUaGUgd2Fsa2VyIHdpbGwgZmluZCBhIG5leHROb2RlIG91dHNpZGUgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgLyogTm9kZS5FTEVNRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IG5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBsZW5ndGggfSA9IGF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBlclxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTmFtZWROb2RlTWFwLFxuICAgICAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGVzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSByZXR1cm5lZCBpbiBkb2N1bWVudCBvcmRlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gcGFydGljdWxhciwgRWRnZS9JRSBjYW4gcmV0dXJuIHRoZW0gb3V0IG9mIG9yZGVyLCBzbyB3ZSBjYW5ub3RcbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzdW1lIGEgY29ycmVzcG9uZGVuY2UgYmV0d2VlbiBwYXJ0IGluZGV4IGFuZCBhdHRyaWJ1dGUgaW5kZXguXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmRzV2l0aChhdHRyaWJ1dGVzW2ldLm5hbWUsIGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHRlbXBsYXRlIGxpdGVyYWwgc2VjdGlvbiBsZWFkaW5nIHVwIHRvIHRoZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhwcmVzc2lvbiBpbiB0aGlzIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nRm9yUGFydCA9IHN0cmluZ3NbcGFydEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHN0cmluZ0ZvclBhcnQpWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsbCBib3VuZCBhdHRyaWJ1dGVzIGhhdmUgaGFkIGEgc3VmZml4IGFkZGVkIGluXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZW1wbGF0ZVJlc3VsdCNnZXRIVE1MIHRvIG9wdCBvdXQgb2Ygc3BlY2lhbCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhbmRsaW5nLiBUbyBsb29rIHVwIHRoZSBhdHRyaWJ1dGUgdmFsdWUgd2UgYWxzbyBuZWVkIHRvIGFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN1ZmZpeC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZUxvb2t1cE5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkgKyBib3VuZEF0dHJpYnV0ZVN1ZmZpeDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRpY3MgPSBhdHRyaWJ1dGVWYWx1ZS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnYXR0cmlidXRlJywgaW5kZXgsIG5hbWUsIHN0cmluZ3M6IHN0YXRpY3MgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gc3RhdGljcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gbm9kZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbm9kZS5kYXRhO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmluZGV4T2YobWFya2VyKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5ncyA9IGRhdGEuc3BsaXQobWFya2VyUmVnZXgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2Ugbm9kZXMgYXJlIGFsc28gdXNlZCBhcyB0aGUgbWFya2VycyBmb3Igbm9kZSBwYXJ0c1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHMgPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ID0gY3JlYXRlTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggIT09IG51bGwgJiYgZW5kc1dpdGgobWF0Y2hbMl0sIGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyBtYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFsyXS5zbGljZSgwLCAtYm91bmRBdHRyaWJ1dGVTdWZmaXgubGVuZ3RoKSArIG1hdGNoWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaW5zZXJ0LCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXg6ICsraW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyB0ZXh0LCB3ZSBtdXN0IGluc2VydCBhIGNvbW1lbnQgdG8gbWFyayBvdXIgcGxhY2UuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiB0cnVzdCBpdCB3aWxsIHN0aWNrIGFyb3VuZCBhZnRlciBjbG9uaW5nLlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyaW5nc1tsYXN0SW5kZXhdID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSBzdHJpbmdzW2xhc3RJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHBhcnQgZm9yIGVhY2ggbWF0Y2ggZm91bmRcbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IGxhc3RJbmRleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIE5vZGUuQ09NTUVOVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZGF0YSA9PT0gbWFya2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGEgbmV3IG1hcmtlciBub2RlIHRvIGJlIHRoZSBzdGFydE5vZGUgb2YgdGhlIFBhcnQgaWYgYW55IG9mXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBmb2xsb3dpbmcgYXJlIHRydWU6XG4gICAgICAgICAgICAgICAgICAgIC8vICAqIFdlIGRvbid0IGhhdmUgYSBwcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gICogVGhlIHByZXZpb3VzU2libGluZyBpcyBhbHJlYWR5IHRoZSBzdGFydCBvZiBhIHByZXZpb3VzIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUucHJldmlvdXNTaWJsaW5nID09PSBudWxsIHx8IGluZGV4ID09PSBsYXN0UGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGFzdFBhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgbmV4dFNpYmxpbmcsIGtlZXAgdGhpcyBub2RlIHNvIHdlIGhhdmUgYW4gZW5kLlxuICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gcmVtb3ZlIGl0IHRvIHNhdmUgZnV0dXJlIGNvc3RzLlxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChpID0gbm9kZS5kYXRhLmluZGV4T2YobWFya2VyLCBpICsgMSkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBub2RlIGhhcyBhIGJpbmRpbmcgbWFya2VyIGluc2lkZSwgbWFrZSBhbiBpbmFjdGl2ZSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYmluZGluZyB3b24ndCB3b3JrLCBidXQgc3Vic2VxdWVudCBiaW5kaW5ncyB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogY29uc2lkZXIgd2hldGhlciBpdCdzIGV2ZW4gd29ydGggaXQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgYmluZGluZ3MgaW4gY29tbWVudHMgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogLTEgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgdGV4dCBiaW5kaW5nIG5vZGVzIGFmdGVyIHRoZSB3YWxrIHRvIG5vdCBkaXN0dXJiIHRoZSBUcmVlV2Fsa2VyXG4gICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlc1RvUmVtb3ZlKSB7XG4gICAgICAgICAgICBuLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobik7XG4gICAgICAgIH1cbiAgICB9XG59XG5jb25zdCBlbmRzV2l0aCA9IChzdHIsIHN1ZmZpeCkgPT4ge1xuICAgIGNvbnN0IGluZGV4ID0gc3RyLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGg7XG4gICAgcmV0dXJuIGluZGV4ID49IDAgJiYgc3RyLnNsaWNlKGluZGV4KSA9PT0gc3VmZml4O1xufTtcbmV4cG9ydCBjb25zdCBpc1RlbXBsYXRlUGFydEFjdGl2ZSA9IChwYXJ0KSA9PiBwYXJ0LmluZGV4ICE9PSAtMTtcbi8vIEFsbG93cyBgZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJylgIHRvIGJlIHJlbmFtZWQgZm9yIGFcbi8vIHNtYWxsIG1hbnVhbCBzaXplLXNhdmluZ3MuXG5leHBvcnQgY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4vKipcbiAqIFRoaXMgcmVnZXggZXh0cmFjdHMgdGhlIGF0dHJpYnV0ZSBuYW1lIHByZWNlZGluZyBhbiBhdHRyaWJ1dGUtcG9zaXRpb25cbiAqIGV4cHJlc3Npb24uIEl0IGRvZXMgdGhpcyBieSBtYXRjaGluZyB0aGUgc3ludGF4IGFsbG93ZWQgZm9yIGF0dHJpYnV0ZXNcbiAqIGFnYWluc3QgdGhlIHN0cmluZyBsaXRlcmFsIGRpcmVjdGx5IHByZWNlZGluZyB0aGUgZXhwcmVzc2lvbiwgYXNzdW1pbmcgdGhhdFxuICogdGhlIGV4cHJlc3Npb24gaXMgaW4gYW4gYXR0cmlidXRlLXZhbHVlIHBvc2l0aW9uLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjZWxlbWVudHMtYXR0cmlidXRlc1xuICpcbiAqIFwiIFxceDA5XFx4MGFcXHgwY1xceDBkXCIgYXJlIEhUTUwgc3BhY2UgY2hhcmFjdGVyczpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9pbmZyYXN0cnVjdHVyZS5odG1sI3NwYWNlLWNoYXJhY3RlcnNcbiAqXG4gKiBcIlxcMC1cXHgxRlxceDdGLVxceDlGXCIgYXJlIFVuaWNvZGUgY29udHJvbCBjaGFyYWN0ZXJzLCB3aGljaCBpbmNsdWRlcyBldmVyeVxuICogc3BhY2UgY2hhcmFjdGVyIGV4Y2VwdCBcIiBcIi5cbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSBjb250cm9sIGNoYXJhY3Rlciwgc3BhY2UgY2hhcmFjdGVyLCAoJyksXG4gKiAgICAoXCIpLCBcIj5cIiwgXCI9XCIsIG9yIFwiL1wiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5leHBvcnQgY29uc3QgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCA9IC8oWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0pKFteXFwwLVxceDFGXFx4N0YtXFx4OUYgXCInPj0vXSspKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKj1bIFxceDA5XFx4MGFcXHgwY1xceDBkXSooPzpbXiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiJ2A8Pj1dKnxcIlteXCJdKnwnW14nXSopKSQvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzQ0VQb2x5ZmlsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGlzVGVtcGxhdGVQYXJ0QWN0aXZlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIGEgYFRlbXBsYXRlYCB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byB0aGUgRE9NIGFuZCB1cGRhdGVkXG4gKiB3aXRoIG5ldyB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUluc3RhbmNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgcHJvY2Vzc29yLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX19wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICB1cGRhdGUodmFsdWVzKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX19wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2xvbmUoKSB7XG4gICAgICAgIC8vIFRoZXJlIGFyZSBhIG51bWJlciBvZiBzdGVwcyBpbiB0aGUgbGlmZWN5Y2xlIG9mIGEgdGVtcGxhdGUgaW5zdGFuY2Unc1xuICAgICAgICAvLyBET00gZnJhZ21lbnQ6XG4gICAgICAgIC8vICAxLiBDbG9uZSAtIGNyZWF0ZSB0aGUgaW5zdGFuY2UgZnJhZ21lbnRcbiAgICAgICAgLy8gIDIuIEFkb3B0IC0gYWRvcHQgaW50byB0aGUgbWFpbiBkb2N1bWVudFxuICAgICAgICAvLyAgMy4gUHJvY2VzcyAtIGZpbmQgcGFydCBtYXJrZXJzIGFuZCBjcmVhdGUgcGFydHNcbiAgICAgICAgLy8gIDQuIFVwZ3JhZGUgLSB1cGdyYWRlIGN1c3RvbSBlbGVtZW50c1xuICAgICAgICAvLyAgNS4gVXBkYXRlIC0gc2V0IG5vZGUsIGF0dHJpYnV0ZSwgcHJvcGVydHksIGV0Yy4sIHZhbHVlc1xuICAgICAgICAvLyAgNi4gQ29ubmVjdCAtIGNvbm5lY3QgdG8gdGhlIGRvY3VtZW50LiBPcHRpb25hbCBhbmQgb3V0c2lkZSBvZiB0aGlzXG4gICAgICAgIC8vICAgICBtZXRob2QuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGhhdmUgYSBmZXcgY29uc3RyYWludHMgb24gdGhlIG9yZGVyaW5nIG9mIHRoZXNlIHN0ZXBzOlxuICAgICAgICAvLyAgKiBXZSBuZWVkIHRvIHVwZ3JhZGUgYmVmb3JlIHVwZGF0aW5nLCBzbyB0aGF0IHByb3BlcnR5IHZhbHVlcyB3aWxsIHBhc3NcbiAgICAgICAgLy8gICAgdGhyb3VnaCBhbnkgcHJvcGVydHkgc2V0dGVycy5cbiAgICAgICAgLy8gICogV2Ugd291bGQgbGlrZSB0byBwcm9jZXNzIGJlZm9yZSB1cGdyYWRpbmcgc28gdGhhdCB3ZSdyZSBzdXJlIHRoYXQgdGhlXG4gICAgICAgIC8vICAgIGNsb25lZCBmcmFnbWVudCBpcyBpbmVydCBhbmQgbm90IGRpc3R1cmJlZCBieSBzZWxmLW1vZGlmeWluZyBET00uXG4gICAgICAgIC8vICAqIFdlIHdhbnQgY3VzdG9tIGVsZW1lbnRzIHRvIHVwZ3JhZGUgZXZlbiBpbiBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBHaXZlbiB0aGVzZSBjb25zdHJhaW50cywgd2l0aCBmdWxsIGN1c3RvbSBlbGVtZW50cyBzdXBwb3J0IHdlIHdvdWxkXG4gICAgICAgIC8vIHByZWZlciB0aGUgb3JkZXI6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLCBDb25uZWN0XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJ1dCBTYWZhcmkgZG9vZXMgbm90IGltcGxlbWVudCBDdXN0b21FbGVtZW50UmVnaXN0cnkjdXBncmFkZSwgc28gd2VcbiAgICAgICAgLy8gY2FuIG5vdCBpbXBsZW1lbnQgdGhhdCBvcmRlciBhbmQgc3RpbGwgaGF2ZSB1cGdyYWRlLWJlZm9yZS11cGRhdGUgYW5kXG4gICAgICAgIC8vIHVwZ3JhZGUgZGlzY29ubmVjdGVkIGZyYWdtZW50cy4gU28gd2UgaW5zdGVhZCBzYWNyaWZpY2UgdGhlXG4gICAgICAgIC8vIHByb2Nlc3MtYmVmb3JlLXVwZ3JhZGUgY29uc3RyYWludCwgc2luY2UgaW4gQ3VzdG9tIEVsZW1lbnRzIHYxIGVsZW1lbnRzXG4gICAgICAgIC8vIG11c3Qgbm90IG1vZGlmeSB0aGVpciBsaWdodCBET00gaW4gdGhlIGNvbnN0cnVjdG9yLiBXZSBzdGlsbCBoYXZlIGlzc3Vlc1xuICAgICAgICAvLyB3aGVuIGNvLWV4aXN0aW5nIHdpdGggQ0V2MCBlbGVtZW50cyBsaWtlIFBvbHltZXIgMSwgYW5kIHdpdGggcG9seWZpbGxzXG4gICAgICAgIC8vIHRoYXQgZG9uJ3Qgc3RyaWN0bHkgYWRoZXJlIHRvIHRoZSBuby1tb2RpZmljYXRpb24gcnVsZSBiZWNhdXNlIHNoYWRvd1xuICAgICAgICAvLyBET00sIHdoaWNoIG1heSBiZSBjcmVhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciwgaXMgZW11bGF0ZWQgYnkgYmVpbmcgcGxhY2VkXG4gICAgICAgIC8vIGluIHRoZSBsaWdodCBET00uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSByZXN1bHRpbmcgb3JkZXIgaXMgb24gbmF0aXZlIGlzOiBDbG9uZSwgQWRvcHQsIFVwZ3JhZGUsIFByb2Nlc3MsXG4gICAgICAgIC8vIFVwZGF0ZSwgQ29ubmVjdC4gZG9jdW1lbnQuaW1wb3J0Tm9kZSgpIHBlcmZvcm1zIENsb25lLCBBZG9wdCwgYW5kIFVwZ3JhZGVcbiAgICAgICAgLy8gaW4gb25lIHN0ZXAuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSBDdXN0b20gRWxlbWVudHMgdjEgcG9seWZpbGwgc3VwcG9ydHMgdXBncmFkZSgpLCBzbyB0aGUgb3JkZXIgd2hlblxuICAgICAgICAvLyBwb2x5ZmlsbGVkIGlzIHRoZSBtb3JlIGlkZWFsOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSxcbiAgICAgICAgLy8gQ29ubmVjdC5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpc0NFUG9seWZpbGwgP1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpIDpcbiAgICAgICAgICAgIGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMudGVtcGxhdGUucGFydHM7XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGZyYWdtZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgICAgICBsZXQgcGFydDtcbiAgICAgICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCB0aGUgbm9kZXMgYW5kIHBhcnRzIG9mIGEgdGVtcGxhdGVcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFydCA9IHBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICBpZiAoIWlzVGVtcGxhdGVQYXJ0QWN0aXZlKHBhcnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2dyZXNzIHRoZSB0cmVlIHdhbGtlciB1bnRpbCB3ZSBmaW5kIG91ciBuZXh0IHBhcnQncyBub2RlLlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IG11bHRpcGxlIHBhcnRzIG1heSBzaGFyZSB0aGUgc2FtZSBub2RlIChhdHRyaWJ1dGUgcGFydHNcbiAgICAgICAgICAgIC8vIG9uIGEgc2luZ2xlIGVsZW1lbnQpLCBzbyB0aGlzIGxvb3AgbWF5IG5vdCBydW4gYXQgYWxsLlxuICAgICAgICAgICAgd2hpbGUgKG5vZGVJbmRleCA8IHBhcnQuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgobm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBhIHRlbXBsYXRlIGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXZSd2ZSBhcnJpdmVkIGF0IG91ciBwYXJ0J3Mgbm9kZS5cbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICdub2RlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLnByb2Nlc3Nvci5oYW5kbGVUZXh0RXhwcmVzc2lvbih0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHBhcnQuaW5zZXJ0QWZ0ZXJOb2RlKG5vZGUucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKC4uLnRoaXMucHJvY2Vzc29yLmhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKG5vZGUsIHBhcnQubmFtZSwgcGFydC5zdHJpbmdzLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NFUG9seWZpbGwpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkb3B0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICBjdXN0b21FbGVtZW50cy51cGdyYWRlKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtaW5zdGFuY2UuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBib3VuZEF0dHJpYnV0ZVN1ZmZpeCwgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCwgbWFya2VyLCBub2RlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5jb25zdCBjb21tZW50TWFya2VyID0gYCAke21hcmtlcn0gYDtcbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIGBodG1sYCwgd2hpY2ggaG9sZHMgYSBUZW1wbGF0ZSBhbmQgdGhlIHZhbHVlcyBmcm9tXG4gKiBpbnRlcnBvbGF0ZWQgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RyaW5ncywgdmFsdWVzLCB0eXBlLCBwcm9jZXNzb3IpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIEhUTUwgdXNlZCB0byBjcmVhdGUgYSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAgICAgKi9cbiAgICBnZXRIVE1MKCkge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5zdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIGxldCBpc0NvbW1lbnRCaW5kaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5zdHJpbmdzW2ldO1xuICAgICAgICAgICAgLy8gRm9yIGVhY2ggYmluZGluZyB3ZSB3YW50IHRvIGRldGVybWluZSB0aGUga2luZCBvZiBtYXJrZXIgdG8gaW5zZXJ0XG4gICAgICAgICAgICAvLyBpbnRvIHRoZSB0ZW1wbGF0ZSBzb3VyY2UgYmVmb3JlIGl0J3MgcGFyc2VkIGJ5IHRoZSBicm93c2VyJ3MgSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBUaGUgbWFya2VyIHR5cGUgaXMgYmFzZWQgb24gd2hldGhlciB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhblxuICAgICAgICAgICAgLy8gYXR0cmlidXRlLCB0ZXh0LCBvciBjb21tZW50IHBvaXNpdGlvbi5cbiAgICAgICAgICAgIC8vICAgKiBGb3Igbm9kZS1wb3NpdGlvbiBiaW5kaW5ncyB3ZSBpbnNlcnQgYSBjb21tZW50IHdpdGggdGhlIG1hcmtlclxuICAgICAgICAgICAgLy8gICAgIHNlbnRpbmVsIGFzIGl0cyB0ZXh0IGNvbnRlbnQsIGxpa2UgPCEtLXt7bGl0LWd1aWR9fS0tPi5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgYXR0cmlidXRlIGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgZm9yIHRoZVxuICAgICAgICAgICAgLy8gICAgIGZpcnN0IGJpbmRpbmcsIHNvIHRoYXQgd2Ugc3VwcG9ydCB1bnF1b3RlZCBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gICAgICAgICAgICAvLyAgICAgU3Vic2VxdWVudCBiaW5kaW5ncyBjYW4gdXNlIGEgY29tbWVudCBtYXJrZXIgYmVjYXVzZSBtdWx0aS1iaW5kaW5nXG4gICAgICAgICAgICAvLyAgICAgYXR0cmlidXRlcyBtdXN0IGJlIHF1b3RlZC5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgY29tbWVudCBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIHNvIHdlIGRvbid0XG4gICAgICAgICAgICAvLyAgICAgY2xvc2UgdGhlIGNvbW1lbnQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGJ1dCBpcyAqbm90KiBhbiBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFdlIGRvbid0IG5lZWQgdG8gdHJhY2sgdGhlIHRyZWUgc3RydWN0dXJlIG9mIHRoZSBIVE1MLCBvbmx5XG4gICAgICAgICAgICAvLyB3aGV0aGVyIGEgYmluZGluZyBpcyBpbnNpZGUgYSBjb21tZW50LCBhbmQgaWYgbm90LCBpZiBpdCBhcHBlYXJzIHRvIGJlXG4gICAgICAgICAgICAvLyB0aGUgZmlyc3QgYmluZGluZyBpbiBhbiBhdHRyaWJ1dGUuXG4gICAgICAgICAgICBjb25zdCBjb21tZW50T3BlbiA9IHMubGFzdEluZGV4T2YoJzwhLS0nKTtcbiAgICAgICAgICAgIC8vIFdlJ3JlIGluIGNvbW1lbnQgcG9zaXRpb24gaWYgd2UgaGF2ZSBhIGNvbW1lbnQgb3BlbiB3aXRoIG5vIGZvbGxvd2luZ1xuICAgICAgICAgICAgLy8gY29tbWVudCBjbG9zZS4gQmVjYXVzZSA8LS0gY2FuIGFwcGVhciBpbiBhbiBhdHRyaWJ1dGUgdmFsdWUgdGhlcmUgY2FuXG4gICAgICAgICAgICAvLyBiZSBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgICAgICAgICBpc0NvbW1lbnRCaW5kaW5nID0gKGNvbW1lbnRPcGVuID4gLTEgfHwgaXNDb21tZW50QmluZGluZykgJiZcbiAgICAgICAgICAgICAgICBzLmluZGV4T2YoJy0tPicsIGNvbW1lbnRPcGVuICsgMSkgPT09IC0xO1xuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UgcHJlY2VlZGluZyB0aGVcbiAgICAgICAgICAgIC8vIGV4cHJlc3Npb24uIFRoaXMgY2FuIG1hdGNoIFwibmFtZT12YWx1ZVwiIGxpa2Ugc3RydWN0dXJlcyBpbiB0ZXh0LFxuICAgICAgICAgICAgLy8gY29tbWVudHMsIGFuZCBhdHRyaWJ1dGUgdmFsdWVzLCBzbyB0aGVyZSBjYW4gYmUgZmFsc2UtcG9zaXRpdmVzLlxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBvbmx5IGluIHRoaXMgYnJhbmNoIGlmIHdlIGRvbid0IGhhdmUgYSBhdHRyaWJ1dGUtbGlrZVxuICAgICAgICAgICAgICAgIC8vIHByZWNlZWRpbmcgc2VxdWVuY2UuIEZvciBjb21tZW50cywgdGhpcyBndWFyZHMgYWdhaW5zdCB1bnVzdWFsXG4gICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlIHZhbHVlcyBsaWtlIDxkaXYgZm9vPVwiPCEtLSR7J2Jhcid9XCI+LiBDYXNlcyBsaWtlXG4gICAgICAgICAgICAgICAgLy8gPCEtLSBmb289JHsnYmFyJ30tLT4gYXJlIGhhbmRsZWQgY29ycmVjdGx5IGluIHRoZSBhdHRyaWJ1dGUgYnJhbmNoXG4gICAgICAgICAgICAgICAgLy8gYmVsb3cuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzICsgKGlzQ29tbWVudEJpbmRpbmcgPyBjb21tZW50TWFya2VyIDogbm9kZU1hcmtlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgYXR0cmlidXRlcyB3ZSB1c2UganVzdCBhIG1hcmtlciBzZW50aW5lbCwgYW5kIGFsc28gYXBwZW5kIGFcbiAgICAgICAgICAgICAgICAvLyAkbGl0JCBzdWZmaXggdG8gdGhlIG5hbWUgdG8gb3B0LW91dCBvZiBhdHRyaWJ1dGUtc3BlY2lmaWMgcGFyc2luZ1xuICAgICAgICAgICAgICAgIC8vIHRoYXQgSUUgYW5kIEVkZ2UgZG8gZm9yIHN0eWxlIGFuZCBjZXJ0YWluIFNWRyBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcy5zdWJzdHIoMCwgYXR0cmlidXRlTWF0Y2guaW5kZXgpICsgYXR0cmlidXRlTWF0Y2hbMV0gK1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVNYXRjaFsyXSArIGJvdW5kQXR0cmlidXRlU3VmZml4ICsgYXR0cmlidXRlTWF0Y2hbM10gK1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSB0aGlzLnN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGhpcy5nZXRIVE1MKCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgZm9yIFNWRyBmcmFnbWVudHMuXG4gKlxuICogVGhpcyBjbGFzcyB3cmFwcyBIVE1MIGluIGFuIGA8c3ZnPmAgdGFnIGluIG9yZGVyIHRvIHBhcnNlIGl0cyBjb250ZW50cyBpbiB0aGVcbiAqIFNWRyBuYW1lc3BhY2UsIHRoZW4gbW9kaWZpZXMgdGhlIHRlbXBsYXRlIHRvIHJlbW92ZSB0aGUgYDxzdmc+YCB0YWcgc28gdGhhdFxuICogY2xvbmVzIG9ubHkgY29udGFpbmVyIHRoZSBvcmlnaW5hbCBmcmFnbWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNWR1RlbXBsYXRlUmVzdWx0IGV4dGVuZHMgVGVtcGxhdGVSZXN1bHQge1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIHJldHVybiBgPHN2Zz4ke3N1cGVyLmdldEhUTUwoKX08L3N2Zz5gO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gc3VwZXIuZ2V0VGVtcGxhdGVFbGVtZW50KCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50O1xuICAgICAgICBjb25zdCBzdmdFbGVtZW50ID0gY29udGVudC5maXJzdENoaWxkO1xuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKHN2Z0VsZW1lbnQpO1xuICAgICAgICByZXBhcmVudE5vZGVzKGNvbnRlbnQsIHN2Z0VsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1yZXN1bHQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vcGFydC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vdGVtcGxhdGUtcmVzdWx0LmpzJztcbmltcG9ydCB7IGNyZWF0ZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAhKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSk7XG59O1xuZXhwb3J0IGNvbnN0IGlzSXRlcmFibGUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHxcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAhISh2YWx1ZSAmJiB2YWx1ZVtTeW1ib2wuaXRlcmF0b3JdKTtcbn07XG4vKipcbiAqIFdyaXRlcyBhdHRyaWJ1dGUgdmFsdWVzIHRvIHRoZSBET00gZm9yIGEgZ3JvdXAgb2YgQXR0cmlidXRlUGFydHMgYm91bmQgdG8gYVxuICogc2luZ2xlIGF0dGlidXRlLiBUaGUgdmFsdWUgaXMgb25seSBzZXQgb25jZSBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0c1xuICogZm9yIGFuIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRzW2ldID0gdGhpcy5fY3JlYXRlUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaW5nbGUgcGFydC4gT3ZlcnJpZGUgdGhpcyB0byBjcmVhdGUgYSBkaWZmZXJudCB0eXBlIG9mIHBhcnQuXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXR0cmlidXRlUGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHBhcnQudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHYpIHx8ICFpc0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdiA6IFN0cmluZyh2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdCBvZiB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB0ID09PSAnc3RyaW5nJyA/IHQgOiBTdHJpbmcodCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGV4dCArPSBzdHJpbmdzW2xdO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsIHRoaXMuX2dldFZhbHVlKCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhbGwgb3IgcGFydCBvZiBhbiBhdHRyaWJ1dGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihjb21taXR0ZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jb21taXR0ZXIgPSBjb21taXR0ZXI7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbm9DaGFuZ2UgJiYgKCFpc1ByaW1pdGl2ZSh2YWx1ZSkgfHwgdmFsdWUgIT09IHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgYSBub3QgYSBkaXJlY3RpdmUsIGRpcnR5IHRoZSBjb21taXR0ZXIgc28gdGhhdCBpdCdsbFxuICAgICAgICAgICAgLy8gY2FsbCBzZXRBdHRyaWJ1dGUuIElmIHRoZSB2YWx1ZSBpcyBhIGRpcmVjdGl2ZSwgaXQnbGwgZGlydHkgdGhlXG4gICAgICAgICAgICAvLyBjb21taXR0ZXIgaWYgaXQgY2FsbHMgc2V0VmFsdWUoKS5cbiAgICAgICAgICAgIGlmICghaXNEaXJlY3RpdmUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21taXR0ZXIuZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWl0dGVyLmNvbW1pdCgpO1xuICAgIH1cbn1cbi8qKlxuICogQSBQYXJ0IHRoYXQgY29udHJvbHMgYSBsb2NhdGlvbiB3aXRoaW4gYSBOb2RlIHRyZWUuIExpa2UgYSBSYW5nZSwgTm9kZVBhcnRcbiAqIGhhcyBzdGFydCBhbmQgZW5kIGxvY2F0aW9ucyBhbmQgY2FuIHNldCBhbmQgdXBkYXRlIHRoZSBOb2RlcyBiZXR3ZWVuIHRob3NlXG4gKiBsb2NhdGlvbnMuXG4gKlxuICogTm9kZVBhcnRzIHN1cHBvcnQgc2V2ZXJhbCB2YWx1ZSB0eXBlczogcHJpbWl0aXZlcywgTm9kZXMsIFRlbXBsYXRlUmVzdWx0cyxcbiAqIGFzIHdlbGwgYXMgYXJyYXlzIGFuZCBpdGVyYWJsZXMgb2YgdGhvc2UgdHlwZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlUGFydCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50byhjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBhZnRlciB0aGUgYHJlZmAgbm9kZSAoYmV0d2VlbiBgcmVmYCBhbmQgYHJlZmAncyBuZXh0XG4gICAgICogc2libGluZykuIEJvdGggYHJlZmAgYW5kIGl0cyBuZXh0IHNpYmxpbmcgbXVzdCBiZSBzdGF0aWMsIHVuY2hhbmdpbmcgbm9kZXNcbiAgICAgKiBzdWNoIGFzIHRob3NlIHRoYXQgYXBwZWFyIGluIGEgbGl0ZXJhbCBzZWN0aW9uIG9mIGEgdGVtcGxhdGUuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlck5vZGUocmVmKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gcmVmO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBwYXJlbnQgcGFydC5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG9QYXJ0KHBhcnQpIHtcbiAgICAgICAgcGFydC5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgcGFydC5fX2luc2VydCh0aGlzLmVuZE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJQYXJ0KHJlZikge1xuICAgICAgICByZWYuX19pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5lbmROb2RlO1xuICAgICAgICByZWYuZW5kTm9kZSA9IHRoaXMuc3RhcnROb2RlO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm90aGluZztcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19pbnNlcnQobm9kZSkge1xuICAgICAgICB0aGlzLmVuZE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgdGhpcy5lbmROb2RlKTtcbiAgICB9XG4gICAgX19jb21taXROb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fX2luc2VydCh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZXh0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZS5uZXh0U2libGluZztcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbiAgICAgICAgLy8gSWYgYHZhbHVlYCBpc24ndCBhbHJlYWR5IGEgc3RyaW5nLCB3ZSBleHBsaWNpdGx5IGNvbnZlcnQgaXQgaGVyZSBpbiBjYXNlXG4gICAgICAgIC8vIGl0IGNhbid0IGJlIGltcGxpY2l0bHkgY29udmVydGVkIC0gaS5lLiBpdCdzIGEgc3ltYm9sLlxuICAgICAgICBjb25zdCB2YWx1ZUFzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZW5kTm9kZS5wcmV2aW91c1NpYmxpbmcgJiZcbiAgICAgICAgICAgIG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIG9ubHkgaGF2ZSBhIHNpbmdsZSB0ZXh0IG5vZGUgYmV0d2VlbiB0aGUgbWFya2Vycywgd2UgY2FuIGp1c3RcbiAgICAgICAgICAgIC8vIHNldCBpdHMgdmFsdWUsIHJhdGhlciB0aGFuIHJlcGxhY2luZyBpdC5cbiAgICAgICAgICAgIC8vIFRPRE8oanVzdGluZmFnbmFuaSk6IENhbiB3ZSBqdXN0IGNoZWNrIGlmIHRoaXMudmFsdWUgaXMgcHJpbWl0aXZlP1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gdmFsdWVBc1N0cmluZztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZhbHVlQXNTdHJpbmcpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGVGYWN0b3J5KHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICB0aGlzLnZhbHVlLnRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBwcm9wYWdhdGUgdGhlIHRlbXBsYXRlIHByb2Nlc3NvciBmcm9tIHRoZSBUZW1wbGF0ZVJlc3VsdFxuICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSB1c2UgaXRzIHN5bnRheCBleHRlbnNpb24sIGV0Yy4gVGhlIHRlbXBsYXRlIGZhY3RvcnkgY29tZXNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIHJlbmRlciBmdW5jdGlvbiBvcHRpb25zIHNvIHRoYXQgaXQgY2FuIGNvbnRyb2wgdGVtcGxhdGVcbiAgICAgICAgICAgIC8vIGNhY2hpbmcgYW5kIHByZXByb2Nlc3NpbmcuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlLCB2YWx1ZS5wcm9jZXNzb3IsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSgpO1xuICAgICAgICAgICAgaW5zdGFuY2UudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19jb21taXRJdGVyYWJsZSh2YWx1ZSkge1xuICAgICAgICAvLyBGb3IgYW4gSXRlcmFibGUsIHdlIGNyZWF0ZSBhIG5ldyBJbnN0YW5jZVBhcnQgcGVyIGl0ZW0sIHRoZW4gc2V0IGl0c1xuICAgICAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAgICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgICAgIC8vIG9mIFRlbXBsYXRlUmVzdWx0cyB0aGF0IHdpbGwgYmUgY29tbW9ubHkgcmV0dXJuZWQgZnJvbSBleHByZXNzaW9ucyBsaWtlOlxuICAgICAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuICAgICAgICAvLyBJZiBfdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAgICAgLy8gaXRlcmFibGUgYW5kIF92YWx1ZSB3aWxsIGNvbnRhaW4gdGhlIE5vZGVQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyByZW5kZXIuIElmIF92YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgICAgICAvLyBhcnJheSBmb3IgTm9kZVBhcnRzLlxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAgICAgLy8gaXRlbXMgZnJvbSBhIHByZXZpb3VzIHJlbmRlclxuICAgICAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLnZhbHVlO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGl0ZW1QYXJ0O1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byByZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgICAgaWYgKGl0ZW1QYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpdGVtUGFydCA9IG5ldyBOb2RlUGFydCh0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0cy5wdXNoKGl0ZW1QYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAocGFydEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0LmFwcGVuZEludG9QYXJ0KHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuaW5zZXJ0QWZ0ZXJQYXJ0KGl0ZW1QYXJ0c1twYXJ0SW5kZXggLSAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbVBhcnQuc2V0VmFsdWUoaXRlbSk7XG4gICAgICAgICAgICBpdGVtUGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICAgICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgICAgICAgICAgdGhpcy5jbGVhcihpdGVtUGFydCAmJiBpdGVtUGFydC5lbmROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcihzdGFydE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSkge1xuICAgICAgICByZW1vdmVOb2Rlcyh0aGlzLnN0YXJ0Tm9kZS5wYXJlbnROb2RlLCBzdGFydE5vZGUubmV4dFNpYmxpbmcsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxufVxuLyoqXG4gKiBJbXBsZW1lbnRzIGEgYm9vbGVhbiBhdHRyaWJ1dGUsIHJvdWdobHkgYXMgZGVmaW5lZCBpbiB0aGUgSFRNTFxuICogc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBJZiB0aGUgdmFsdWUgaXMgdHJ1dGh5LCB0aGVuIHRoZSBhdHRyaWJ1dGUgaXMgcHJlc2VudCB3aXRoIGEgdmFsdWUgb2ZcbiAqICcnLiBJZiB0aGUgdmFsdWUgaXMgZmFsc2V5LCB0aGUgYXR0cmlidXRlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb29sZWFuQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggIT09IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm9vbGVhbiBhdHRyaWJ1dGVzIGNhbiBvbmx5IGNvbnRhaW4gYSBzaW5nbGUgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSAhIXRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxufVxuLyoqXG4gKiBTZXRzIGF0dHJpYnV0ZSB2YWx1ZXMgZm9yIFByb3BlcnR5UGFydHMsIHNvIHRoYXQgdGhlIHZhbHVlIGlzIG9ubHkgc2V0IG9uY2VcbiAqIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzIGZvciBhIHByb3BlcnR5LlxuICpcbiAqIElmIGFuIGV4cHJlc3Npb24gY29udHJvbHMgdGhlIHdob2xlIHByb3BlcnR5IHZhbHVlLCB0aGVuIHRoZSB2YWx1ZSBpcyBzaW1wbHlcbiAqIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSB1bmRlciBjb250cm9sLiBJZiB0aGVyZSBhcmUgc3RyaW5nIGxpdGVyYWxzIG9yXG4gKiBtdWx0aXBsZSBleHByZXNzaW9ucywgdGhlbiB0aGUgc3RyaW5ncyBhcmUgZXhwcmVzc2lvbnMgYXJlIGludGVycG9sYXRlZCBpbnRvXG4gKiBhIHN0cmluZyBmaXJzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3BlcnR5Q29tbWl0dGVyIGV4dGVuZHMgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICB0aGlzLnNpbmdsZSA9XG4gICAgICAgICAgICAoc3RyaW5ncy5sZW5ndGggPT09IDIgJiYgc3RyaW5nc1swXSA9PT0gJycgJiYgc3RyaW5nc1sxXSA9PT0gJycpO1xuICAgIH1cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVBhcnQodGhpcyk7XG4gICAgfVxuICAgIF9nZXRWYWx1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0c1swXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFZhbHVlKCk7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudFt0aGlzLm5hbWVdID0gdGhpcy5fZ2V0VmFsdWUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbn1cbi8vIERldGVjdCBldmVudCBsaXN0ZW5lciBvcHRpb25zIHN1cHBvcnQuIElmIHRoZSBgY2FwdHVyZWAgcHJvcGVydHkgaXMgcmVhZFxuLy8gZnJvbSB0aGUgb3B0aW9ucyBvYmplY3QsIHRoZW4gb3B0aW9ucyBhcmUgc3VwcG9ydGVkLiBJZiBub3QsIHRoZW4gdGhlIHRocmlkXG4vLyBhcmd1bWVudCB0byBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lciBpcyBpbnRlcnByZXRlZCBhcyB0aGUgYm9vbGVhbiBjYXB0dXJlXG4vLyB2YWx1ZSBzbyB3ZSBzaG91bGQgb25seSBwYXNzIHRoZSBgY2FwdHVyZWAgcHJvcGVydHkuXG5sZXQgZXZlbnRPcHRpb25zU3VwcG9ydGVkID0gZmFsc2U7XG50cnkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGdldCBjYXB0dXJlKCkge1xuICAgICAgICAgICAgZXZlbnRPcHRpb25zU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG59XG5jYXRjaCAoX2UpIHtcbn1cbmV4cG9ydCBjbGFzcyBFdmVudFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRDb250ZXh0KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmV2ZW50Q29udGV4dCA9IGV2ZW50Q29udGV4dDtcbiAgICAgICAgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQgPSAoZSkgPT4gdGhpcy5oYW5kbGVFdmVudChlKTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdMaXN0ZW5lciA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGNvbnN0IG9sZExpc3RlbmVyID0gdGhpcy52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2hvdWxkUmVtb3ZlTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciA9PSBudWxsIHx8XG4gICAgICAgICAgICBvbGRMaXN0ZW5lciAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgKG5ld0xpc3RlbmVyLmNhcHR1cmUgIT09IG9sZExpc3RlbmVyLmNhcHR1cmUgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIub25jZSAhPT0gb2xkTGlzdGVuZXIub25jZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5wYXNzaXZlICE9PSBvbGRMaXN0ZW5lci5wYXNzaXZlKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkQWRkTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciAhPSBudWxsICYmIChvbGRMaXN0ZW5lciA9PSBudWxsIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcbiAgICAgICAgaWYgKHNob3VsZFJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQsIHRoaXMuX19vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX19vcHRpb25zID0gZ2V0T3B0aW9ucyhuZXdMaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQsIHRoaXMuX19vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gbmV3TGlzdGVuZXI7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmNhbGwodGhpcy5ldmVudENvbnRleHQgfHwgdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIFdlIGNvcHkgb3B0aW9ucyBiZWNhdXNlIG9mIHRoZSBpbmNvbnNpc3RlbnQgYmVoYXZpb3Igb2YgYnJvd3NlcnMgd2hlbiByZWFkaW5nXG4vLyB0aGUgdGhpcmQgYXJndW1lbnQgb2YgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuIElFMTEgZG9lc24ndCBzdXBwb3J0IG9wdGlvbnNcbi8vIGF0IGFsbC4gQ2hyb21lIDQxIG9ubHkgcmVhZHMgYGNhcHR1cmVgIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBvYmplY3QuXG5jb25zdCBnZXRPcHRpb25zID0gKG8pID0+IG8gJiZcbiAgICAoZXZlbnRPcHRpb25zU3VwcG9ydGVkID9cbiAgICAgICAgeyBjYXB0dXJlOiBvLmNhcHR1cmUsIHBhc3NpdmU6IG8ucGFzc2l2ZSwgb25jZTogby5vbmNlIH0gOlxuICAgICAgICBvLmNhcHR1cmUpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydHMuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIgfSBmcm9tICcuL3BhcnRzLmpzJztcbi8qKlxuICogQ3JlYXRlcyBQYXJ0cyB3aGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGFuIGF0dHJpYnV0ZS1wb3NpdGlvbiBiaW5kaW5nLCBnaXZlbiB0aGUgZXZlbnQsIGF0dHJpYnV0ZVxuICAgICAqIG5hbWUsIGFuZCBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBiaW5kaW5nXG4gICAgICogQHBhcmFtIG5hbWUgIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAqIEBwYXJhbSBzdHJpbmdzIFRoZSBzdHJpbmcgbGl0ZXJhbHMuIFRoZXJlIGFyZSBhbHdheXMgYXQgbGVhc3QgdHdvIHN0cmluZ3MsXG4gICAgICogICBldmVudCBmb3IgZnVsbHktY29udHJvbGxlZCBiaW5kaW5ncyB3aXRoIGEgc2luZ2xlIGV4cHJlc3Npb24uXG4gICAgICovXG4gICAgaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMoZWxlbWVudCwgbmFtZSwgc3RyaW5ncywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBuYW1lWzBdO1xuICAgICAgICBpZiAocHJlZml4ID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBQcm9wZXJ0eUNvbW1pdHRlcihlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKTtcbiAgICAgICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJ0AnKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBFdmVudFBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgb3B0aW9ucy5ldmVudENvbnRleHQpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnPycpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21taXR0ZXIgPSBuZXcgQXR0cmlidXRlQ29tbWl0dGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICByZXR1cm4gY29tbWl0dGVyLnBhcnRzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGEgdGV4dC1wb3NpdGlvbiBiaW5kaW5nLlxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZUZhY3RvcnlcbiAgICAgKi9cbiAgICBoYW5kbGVUZXh0RXhwcmVzc2lvbihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZVBhcnQob3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciA9IG5ldyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IG1hcmtlciwgVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogVGhlIGRlZmF1bHQgVGVtcGxhdGVGYWN0b3J5IHdoaWNoIGNhY2hlcyBUZW1wbGF0ZXMga2V5ZWQgb25cbiAqIHJlc3VsdC50eXBlIGFuZCByZXN1bHQuc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlRmFjdG9yeShyZXN1bHQpIHtcbiAgICBsZXQgdGVtcGxhdGVDYWNoZSA9IHRlbXBsYXRlQ2FjaGVzLmdldChyZXN1bHQudHlwZSk7XG4gICAgaWYgKHRlbXBsYXRlQ2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlID0ge1xuICAgICAgICAgICAgc3RyaW5nc0FycmF5OiBuZXcgV2Vha01hcCgpLFxuICAgICAgICAgICAga2V5U3RyaW5nOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICAgICAgdGVtcGxhdGVDYWNoZXMuc2V0KHJlc3VsdC50eXBlLCB0ZW1wbGF0ZUNhY2hlKTtcbiAgICB9XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuZ2V0KHJlc3VsdC5zdHJpbmdzKTtcbiAgICBpZiAodGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuICAgIC8vIElmIHRoZSBUZW1wbGF0ZVN0cmluZ3NBcnJheSBpcyBuZXcsIGdlbmVyYXRlIGEga2V5IGZyb20gdGhlIHN0cmluZ3NcbiAgICAvLyBUaGlzIGtleSBpcyBzaGFyZWQgYmV0d2VlbiBhbGwgdGVtcGxhdGVzIHdpdGggaWRlbnRpY2FsIGNvbnRlbnRcbiAgICBjb25zdCBrZXkgPSByZXN1bHQuc3RyaW5ncy5qb2luKG1hcmtlcik7XG4gICAgLy8gQ2hlY2sgaWYgd2UgYWxyZWFkeSBoYXZlIGEgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLmtleVN0cmluZy5nZXQoa2V5KTtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIG5vdCBzZWVuIHRoaXMga2V5IGJlZm9yZSwgY3JlYXRlIGEgbmV3IFRlbXBsYXRlXG4gICAgICAgIHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCwgcmVzdWx0LmdldFRlbXBsYXRlRWxlbWVudCgpKTtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgICAgICB0ZW1wbGF0ZUNhY2hlLmtleVN0cmluZy5zZXQoa2V5LCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8vIENhY2hlIGFsbCBmdXR1cmUgcXVlcmllcyBmb3IgdGhpcyBUZW1wbGF0ZVN0cmluZ3NBcnJheVxuICAgIHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LnNldChyZXN1bHQuc3RyaW5ncywgdGVtcGxhdGUpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbn1cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZUNhY2hlcyA9IG5ldyBNYXAoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLWZhY3RvcnkuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgTm9kZVBhcnQgfSBmcm9tICcuL3BhcnRzLmpzJztcbmltcG9ydCB7IHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgY29uc3QgcGFydHMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBSZW5kZXJzIGEgdGVtcGxhdGUgcmVzdWx0IG9yIG90aGVyIHZhbHVlIHRvIGEgY29udGFpbmVyLlxuICpcbiAqIFRvIHVwZGF0ZSBhIGNvbnRhaW5lciB3aXRoIG5ldyB2YWx1ZXMsIHJlZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGxpdGVyYWwgYW5kXG4gKiBjYWxsIGByZW5kZXJgIHdpdGggdGhlIG5ldyByZXN1bHQuXG4gKlxuICogQHBhcmFtIHJlc3VsdCBBbnkgdmFsdWUgcmVuZGVyYWJsZSBieSBOb2RlUGFydCAtIHR5cGljYWxseSBhIFRlbXBsYXRlUmVzdWx0XG4gKiAgICAgY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnIGxpa2UgYGh0bWxgIG9yIGBzdmdgLlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBwYXJlbnQgdG8gcmVuZGVyIHRvLiBUaGUgZW50aXJlIGNvbnRlbnRzIGFyZSBlaXRoZXJcbiAqICAgICByZXBsYWNlZCwgb3IgZWZmaWNpZW50bHkgdXBkYXRlZCBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXMgcHJldmlvdXNcbiAqICAgICByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFJlbmRlck9wdGlvbnMgZm9yIHRoZSBlbnRpcmUgcmVuZGVyIHRyZWUgcmVuZGVyZWQgdG8gdGhpc1xuICogICAgIGNvbnRhaW5lci4gUmVuZGVyIG9wdGlvbnMgbXVzdCAqbm90KiBjaGFuZ2UgYmV0d2VlbiByZW5kZXJzIHRvIHRoZSBzYW1lXG4gKiAgICAgY29udGFpbmVyLCBhcyB0aG9zZSBjaGFuZ2VzIHdpbGwgbm90IGVmZmVjdCBwcmV2aW91c2x5IHJlbmRlcmVkIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChyZXN1bHQsIGNvbnRhaW5lciwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBwYXJ0ID0gcGFydHMuZ2V0KGNvbnRhaW5lcik7XG4gICAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW1vdmVOb2Rlcyhjb250YWluZXIsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgcGFydHMuc2V0KGNvbnRhaW5lciwgcGFydCA9IG5ldyBOb2RlUGFydChPYmplY3QuYXNzaWduKHsgdGVtcGxhdGVGYWN0b3J5IH0sIG9wdGlvbnMpKSk7XG4gICAgICAgIHBhcnQuYXBwZW5kSW50byhjb250YWluZXIpO1xuICAgIH1cbiAgICBwYXJ0LnNldFZhbHVlKHJlc3VsdCk7XG4gICAgcGFydC5jb21taXQoKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXIuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKlxuICogTWFpbiBsaXQtaHRtbCBtb2R1bGUuXG4gKlxuICogTWFpbiBleHBvcnRzOlxuICpcbiAqIC0gIFtbaHRtbF1dXG4gKiAtICBbW3N2Z11dXG4gKiAtICBbW3JlbmRlcl1dXG4gKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICogQHByZWZlcnJlZFxuICovXG4vKipcbiAqIERvIG5vdCByZW1vdmUgdGhpcyBjb21tZW50OyBpdCBrZWVwcyB0eXBlZG9jIGZyb20gbWlzcGxhY2luZyB0aGUgbW9kdWxlXG4gKiBkb2NzLlxuICovXG5pbXBvcnQgeyBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5pbXBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5leHBvcnQgeyBkaXJlY3RpdmUsIGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9saWIvZGlyZWN0aXZlLmpzJztcbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IHJlbW92ZSBsaW5lIHdoZW4gd2UgZ2V0IE5vZGVQYXJ0IG1vdmluZyBtZXRob2RzXG5leHBvcnQgeyByZW1vdmVOb2RlcywgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vbGliL2RvbS5qcyc7XG5leHBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vbGliL3BhcnQuanMnO1xuZXhwb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBBdHRyaWJ1dGVQYXJ0LCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBpc0l0ZXJhYmxlLCBpc1ByaW1pdGl2ZSwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyLCBQcm9wZXJ0eVBhcnQgfSBmcm9tICcuL2xpYi9wYXJ0cy5qcyc7XG5leHBvcnQgeyBwYXJ0cywgcmVuZGVyIH0gZnJvbSAnLi9saWIvcmVuZGVyLmpzJztcbmV4cG9ydCB7IHRlbXBsYXRlQ2FjaGVzLCB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5leHBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgY3JlYXRlTWFya2VyLCBpc1RlbXBsYXRlUGFydEFjdGl2ZSwgVGVtcGxhdGUgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS5qcyc7XG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogaW5qZWN0IHZlcnNpb24gbnVtYmVyIGF0IGJ1aWxkIHRpbWVcbih3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddIHx8ICh3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddID0gW10pKS5wdXNoKCcxLjEuMicpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBIVE1MIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnaHRtbCcsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgU1ZHVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnc3ZnJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1odG1sLmpzLm1hcCIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuLi9jb21wb25lbnRcIjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHkgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlTWFwcGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQsIFQgPSBhbnk+ID0gKHRoaXM6IEMsIHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiBUIHwgbnVsbDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlNYXBwZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudCwgVCA9IGFueT4gPSAodGhpczogQywgdmFsdWU6IFQgfCBudWxsKSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEFuIG9iamVjdCB0aGF0IGhvbGRzIGFuIHtAbGluayBBdHRyaWJ1dGVNYXBwZXJ9IGFuZCBhIHtAbGluayBQcm9wZXJ0eU1hcHBlcn1cbiAqXG4gKiBAcmVtYXJrc1xuICogRm9yIHRoZSBtb3N0IGNvbW1vbiB0eXBlcywgYSBjb252ZXJ0ZXIgZXhpc3RzIHdoaWNoIGNhbiBiZSByZWZlcmVuY2VkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBAcHJvcGVydHkoe1xuICogICAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ29udmVydGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQsIFQgPSBhbnk+IHtcbiAgICB0b0F0dHJpYnV0ZTogUHJvcGVydHlNYXBwZXI8QywgVD47XG4gICAgZnJvbUF0dHJpYnV0ZTogQXR0cmlidXRlTWFwcGVyPEMsIFQ+O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBjb252ZXJ0ZXJcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhpcyBjb252ZXJ0ZXIgaXMgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb252ZXJ0ZXIgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHVubGVzcyBhIGRpZmZlcmVudCBvbmVcbiAqIGlzIHNwZWNpZmllZC4gVGhlIGNvbnZlcnRlciB0cmllcyB0byBpbmZlciB0aGUgcHJvcGVydHkgdHlwZSB3aGVuIGNvbnZlcnRpbmcgdG8gYXR0cmlidXRlcyBhbmRcbiAqIHVzZXMgYEpTT04ucGFyc2UoKWAgd2hlbiBjb252ZXJ0aW5nIHN0cmluZ3MgZnJvbSBhdHRyaWJ1dGVzLiBJZiBgSlNPTi5wYXJzZSgpYCB0aHJvd3MgYW4gZXJyb3IsXG4gKiB0aGUgY29udmVydGVyIHdpbGwgdXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0OiBBdHRyaWJ1dGVDb252ZXJ0ZXIgPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCBzdWNjZXNzZnVsbHkgcGFyc2UgYGJvb2xlYW5gLCBgbnVtYmVyYCBhbmQgYEpTT04uc3RyaW5naWZ5YCdkIHZhbHVlc1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0IHRocm93cywgaXQgbWVhbnMgd2UncmUgcHJvYmFibHkgZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgfSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG51bWJlciwgYmlnaW50LCBzeW1ib2wsIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBhdHRyaWJ1dGVzLCBsaWtlIGBkaXNhYmxlZGAsIHdoaWNoIGFyZSBjb25zaWRlcmVkIHRydWUgaWYgdGhleSBhcmUgc2V0IHdpdGhcbiAqIGFueSB2YWx1ZSBhdCBhbGwuIEluIG9yZGVyIHRvIHNldCB0aGUgYXR0cmlidXRlIHRvIGZhbHNlLCB0aGUgYXR0cmlidXRlIGhhcyB0byBiZSByZW1vdmVkIGJ5XG4gKiBzZXR0aW5nIHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gYG51bGxgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgYm9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgIT09IG51bGwpLFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGJvb2xlYW4gfCBudWxsKSA9PiB2YWx1ZSA/ICcnIDogbnVsbFxufVxuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBBUklBIGF0dHJpYnV0ZXMsIGxpa2UgYGFyaWEtY2hlY2tlZGAgb3IgYGFyaWEtc2VsZWN0ZWRgLCB3aGljaCBoYXZlIHRvIGJlXG4gKiBzZXQgZXhwbGljaXRseSB0byBgdHJ1ZWAgb3IgYGZhbHNlYC5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWUpID0+IHZhbHVlID09PSAndHJ1ZScsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgc3RyaW5nPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogdmFsdWUsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdmFsdWVcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlcjogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgbnVtYmVyPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogTnVtYmVyKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJPYmplY3Q6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIGFueVtdPiA9IHtcbiAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogSlNPTi5wYXJzZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGFueVtdIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn07XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEYXRlOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBEYXRlPiA9IHtcbiAgICAvLyBgbmV3IERhdGUoKWAgd2lsbCByZXR1cm4gYW4gYEludmFsaWQgRGF0ZWAgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBuZXcgRGF0ZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IERhdGUgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBzZWxlY3RvciBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzZWxlY3RvciB3aWxsIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB3aXRoIHRoZSBicm93c2VyJ3NcbiAgICAgKiB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEkuIElmIG5vIHNlbGVjdG9yIGlzIHNwZWNpZmllZCwgdGhlIGNvbXBvbmVudCBjbGFzc1xuICAgICAqIG5lZWRzIHRvIHByb3ZpZGUgb25lIGluIGl0cyBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zZWxlY3Rvcn0gcHJvcGVydHkuXG4gICAgICogQSBzZWxlY3RvciBkZWZpbmVkIGluIHRoZSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlXG4gICAgICogc3RhdGljIGNsYXNzIHByb3BlcnR5LlxuICAgICAqL1xuICAgIHNlbGVjdG9yOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET00gdG8gcmVuZGVyIHRoZSBjb21wb25lbnRzIHRlbXBsYXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTaGFkb3cgRE9NIGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgICogY29tcG9uZW50J3MgdGVtcGxhdGUgd2lsbCBiZSByZW5kZXJlZCBhcyBjaGlsZCBub2RlcyBvZiB0aGUgY29tcG9uZW50LiBUaGlzIGNhbiBiZVxuICAgICAqIHVzZWZ1bCBpZiBhbiBpc29sYXRlZCBET00gYW5kIHNjb3BlZCBDU1MgaXMgbm90IGRlc2lyZWQuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBzaGFkb3c6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSByZWdpc3RlciB0aGUgY29tcG9uZW50IHdpdGggdGhlIGJyb3dzZXIncyB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluIGNhc2VzIHdoZXJlIHlvdSB3YW50IHRvIGVtcGxveSBhIG1vZHVsZSBzeXN0ZW0gd2hpY2ggcmVnaXN0ZXJzIGNvbXBvbmVudHMgb24gYVxuICAgICAqIGNvbmRpdGlvbmFsIGJhc2lzLCB5b3UgY2FuIGRpc2FibGUgYXV0b21hdGljIHJlZ2lzdHJhdGlvbiBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAuXG4gICAgICogWW91ciBtb2R1bGUgb3IgYm9vdHN0cmFwIHN5c3RlbSB3aWxsIGhhdmUgdG8gdGFrZSBjYXJlIG9mIGRlZmluaW5nIHRoZSBjb21wb25lbnQgbGF0ZXIuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBkZWZpbmU6IGJvb2xlYW47XG4gICAgLy8gVE9ETzogdGVzdCBtZWRpYSBxdWVyaWVzXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBBbiBhcnJheSBvZiBDU1MgcnVsZXNldHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9TeW50YXgjQ1NTX3J1bGVzZXRzKS5cbiAgICAgKiBTdHlsZXMgZGVmaW5lZCB1c2luZyB0aGUgZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggc3R5bGVzIGRlZmluZWQgaW4gdGhlIGNvbXBvbmVudCdzXG4gICAgICogc3RhdGljIHtAbGluayBDb21wb25lbnQuc3R5bGVzfSBnZXR0ZXIuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzdHlsZXM6IFtcbiAgICAgKiAgICAgICAgICAnaDEsIGgyIHsgZm9udC1zaXplOiAxNnB0OyB9JyxcbiAgICAgKiAgICAgICAgICAnQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogOTAwcHgpIHsgYXJ0aWNsZSB7IHBhZGRpbmc6IDFyZW0gM3JlbTsgfSB9J1xuICAgICAqICAgICAgXVxuICAgICAqIH0pXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqL1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIC8vIFRPRE86IHVwZGF0ZSBkb2N1bWVudGF0aW9uXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHtAbGluayAjbGl0LWh0bWwuVGVtcGxhdGVSZXN1bHR9LiBUaGUgZnVuY3Rpb24ncyBgZWxlbWVudGBcbiAgICAgKiBwYXJhbWV0ZXIgd2lsbCBiZSB0aGUgY3VycmVudCBjb21wb25lbnQgaW5zdGFuY2UuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIGJ5IHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBUaGUgbWV0aG9kIG11c3QgcmV0dXJuIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB3aGljaCBpcyBjcmVhdGVkIHVzaW5nIGxpdC1odG1sJ3NcbiAgICAgKiB7QGxpbmsgbGl0LWh0bWwjaHRtbCB8IGBodG1sYH0gb3Ige0BsaW5rIGxpdC1odG1sI3N2ZyB8IGBzdmdgfSB0ZW1wbGF0ZSBtZXRob2RzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHVuZGVmaW5lZGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBjb21wb25lbnQgaW5zdGFuY2UgcmVxdWVzdGluZyB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZT86IChlbGVtZW50OiBUeXBlLCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OOiBDb21wb25lbnREZWNsYXJhdGlvbiA9IHtcbiAgICBzZWxlY3RvcjogJycsXG4gICAgc2hhZG93OiB0cnVlLFxuICAgIGRlZmluZTogdHJ1ZSxcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50RGVjbGFyYXRpb24sIERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OIH0gZnJvbSAnLi9jb21wb25lbnQtZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSB9IGZyb20gJy4vcHJvcGVydHkuanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IGNsYXNzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnQ8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8Q29tcG9uZW50RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0geyAuLi5ERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgcmV0dXJuICh0YXJnZXQ6IHR5cGVvZiBDb21wb25lbnQpID0+IHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldCBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yLnNlbGVjdG9yID0gZGVjbGFyYXRpb24uc2VsZWN0b3IgfHwgdGFyZ2V0LnNlbGVjdG9yO1xuICAgICAgICBjb25zdHJ1Y3Rvci5zaGFkb3cgPSBkZWNsYXJhdGlvbi5zaGFkb3c7XG4gICAgICAgIGNvbnN0cnVjdG9yLnRlbXBsYXRlID0gZGVjbGFyYXRpb24udGVtcGxhdGUgfHwgdGFyZ2V0LnRlbXBsYXRlO1xuXG4gICAgICAgIC8vIHVzZSBrZXlvZiBzaWduYXR1cmVzIHRvIGNhdGNoIHJlZmFjdG9yaW5nIGVycm9yc1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnb2JzZXJ2ZWRBdHRyaWJ1dGVzJztcbiAgICAgICAgY29uc3Qgc3R5bGVzS2V5OiBrZXlvZiB0eXBlb2YgQ29tcG9uZW50ID0gJ3N0eWxlcyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3BlcnR5IGRlY29yYXRvcnMgZ2V0IGNhbGxlZCBiZWZvcmUgY2xhc3MgZGVjb3JhdG9ycywgc28gYXQgdGhpcyBwb2ludCBhbGwgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICogaGF2ZSBzdG9yZWQgdGhlaXIgYXNzb2NpYXRlZCBhdHRyaWJ1dGVzIGluIHtAbGluayBDb21wb25lbnQuYXR0cmlidXRlc30uXG4gICAgICAgICAqIFdlIGNhbiBub3cgY29tYmluZSB0aGVtIHdpdGggdGhlIHVzZXItZGVmaW5lZCB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gYW5kLFxuICAgICAgICAgKiBieSB1c2luZyBhIFNldCwgZWxpbWluYXRlIGFsbCBkdXBsaWNhdGVzIGluIHRoZSBwcm9jZXNzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBBcyB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSB3aWxsIGFsc28gaW5jbHVkZSBkZWNvcmF0b3IgZ2VuZXJhdGVkXG4gICAgICAgICAqIG9ic2VydmVkIGF0dHJpYnV0ZXMsIHdlIGFsd2F5cyBpbmhlcml0IGFsbCBvYnNlcnZlZCBhdHRyaWJ1dGVzIGZyb20gYSBiYXNlIGNsYXNzLiBGb3IgdGhhdCByZWFzb25cbiAgICAgICAgICogd2UgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIGF0dHJpYnV0ZSBvdmVycmlkZXMgd2hlbiBleHRlbmRpbmcgYW55IHtAbGluayBDb21wb25lbnR9IGJhc2UgY2xhc3MuXG4gICAgICAgICAqIFRoaXMgaXMgZG9uZSBpbiB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IuIEhlcmUgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdG8gcmVtb3ZlIG92ZXJyaWRkZW5cbiAgICAgICAgICogYXR0cmlidXRlcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlcyA9IFtcbiAgICAgICAgICAgIC4uLm5ldyBTZXQoXG4gICAgICAgICAgICAgICAgLy8gd2UgdGFrZSB0aGUgaW5oZXJpdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4ucmVtb3ZlIG92ZXJyaWRkZW4gZ2VuZXJhdGVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgoYXR0cmlidXRlcywgYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4gJiYgY29uc3RydWN0b3Iub3ZlcnJpZGRlbi5oYXMoYXR0cmlidXRlKSA/IFtdIDogYXR0cmlidXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdIGFzIHN0cmluZ1tdXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4uYW5kIHJlY29tYmluZSB0aGUgbGlzdCB3aXRoIHRoZSBuZXdseSBnZW5lcmF0ZWQgYXR0cmlidXRlcyAodGhlIFNldCBwcmV2ZW50cyBkdXBsaWNhdGVzKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KFsuLi50YXJnZXQuYXR0cmlidXRlcy5rZXlzKCldKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIGRlbGV0ZSB0aGUgb3ZlcnJpZGRlbiBTZXQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIGRvbid0IHdhbnQgdG8gaW5oZXJpdCBzdHlsZXMgYXV0b21hdGljYWxseSwgdW5sZXNzIGV4cGxpY2l0bHkgcmVxdWVzdGVkLCBzbyB3ZSBjaGVjayBpZiB0aGVcbiAgICAgICAgICogY29uc3RydWN0b3IgZGVjbGFyZXMgYSBzdGF0aWMgc3R5bGVzIHByb3BlcnR5ICh3aGljaCBtYXkgdXNlIHN1cGVyLnN0eWxlcyB0byBleHBsaWNpdGx5IGluaGVyaXQpXG4gICAgICAgICAqIGFuZCBpZiBpdCBkb2Vzbid0LCB3ZSBpZ25vcmUgdGhlIHBhcmVudCBjbGFzcydzIHN0eWxlcyAoYnkgbm90IGludm9raW5nIHRoZSBnZXR0ZXIpLlxuICAgICAgICAgKiBXZSB0aGVuIG1lcmdlIHRoZSBkZWNvcmF0b3IgZGVmaW5lZCBzdHlsZXMgKGlmIGV4aXN0aW5nKSBpbnRvIHRoZSBzdHlsZXMgYW5kIHJlbW92ZSBkdXBsaWNhdGVzXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAoY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoc3R5bGVzS2V5KVxuICAgICAgICAgICAgICAgICAgICA/IGNvbnN0cnVjdG9yLnN0eWxlc1xuICAgICAgICAgICAgICAgICAgICA6IFtdXG4gICAgICAgICAgICAgICAgKS5jb25jYXQoZGVjbGFyYXRpb24uc3R5bGVzIHx8IFtdKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaW5hbGx5IHdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHVzZXIgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGdlbmVyYXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgb2JzZXJ2ZWRBdHRyaWJ1dGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBvdmVycmlkZSB0aGUge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlciB3aXRoIGEgbmV3IG9uZSwgd2hpY2ggcmV0dXJuc1xuICAgICAgICAgKiB0aGUgdW5pcXVlIHNldCBvZiBzdGF0aWNhbGx5IGRlZmluZWQgYW5kIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcy5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIHN0eWxlc0tleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5kZWZpbmUpIHtcblxuICAgICAgICAgICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZShjb25zdHJ1Y3Rvci5zZWxlY3RvciwgY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgTGlzdGVuZXJEZWNsYXJhdGlvbiB9IGZyb20gJy4vbGlzdGVuZXItZGVjbGFyYXRpb24uanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IG1ldGhvZCBhcyBhbiBldmVudCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IExpc3RlbmVyRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5ldmVudCA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBMaXN0ZW5lckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIGxpc3RlbmVyIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yIHN0b3JlcyBsaXN0ZW5lciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBsaXN0ZW5lcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgbGlzdGVuZXIgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBiYXNlIGNsYXNzJ3MgbWFwIHRvIHByb3Blcmx5IGluaGVyaXQgYWxsIGxpc3RlbmVyIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiB0eXBlb2YgQ29tcG9uZW50KSB7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KCdsaXN0ZW5lcnMnKSkgY29uc3RydWN0b3IubGlzdGVuZXJzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5saXN0ZW5lcnMpO1xufVxuIiwiY29uc3QgRklSU1QgPSAvXlteXS87XG5jb25zdCBTUEFDRVMgPSAvXFxzKyhbXFxTXSkvZztcbmNvbnN0IENBTUVMUyA9IC9bYS16XShbQS1aXSkvZztcbmNvbnN0IEtFQkFCUyA9IC8tKFthLXpdKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gS0VCQUJTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgS0VCQUJTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5jYXBpdGFsaXplKHN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZWJhYkNhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gQ0FNRUxTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1swXVswXSArICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBDQU1FTFMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcudG9Mb3dlckNhc2UoKSA6IHN0cmluZztcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXIsIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQgfSBmcm9tICcuL2F0dHJpYnV0ZS1jb252ZXJ0ZXIuanMnO1xuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnLi91dGlscy9zdHJpbmctdXRpbHMuanMnO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHlcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIGRpc3BhdGNoIGEgY3VzdG9tIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU5vdGlmaWVyPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYHRydWVgIGlmIHRoZSBgb2xkVmFsdWVgIGFuZCB0aGUgYG5ld1ZhbHVlYCBvZiBhIHByb3BlcnR5IGFyZSBkaWZmZXJlbnQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dHJpYnV0ZVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgQXR0cmlidXRlUmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgUHJvcGVydHlSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn1cbiAqXG4gKiBAcGFyYW0gbm90aWZpZXIgQSBub3RpZmllciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Tm90aWZpZXIgKG5vdGlmaWVyOiBhbnkpOiBub3RpZmllciBpcyBQcm9wZXJ0eU5vdGlmaWVyIHtcblxuICAgIHJldHVybiB0eXBlb2Ygbm90aWZpZXIgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gZGV0ZWN0b3IgQSBkZXRlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgKGRldGVjdG9yOiBhbnkpOiBkZXRlY3RvciBpcyBQcm9wZXJ0eUNoYW5nZURldGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgZGV0ZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlLZXl9XG4gKlxuICogQHBhcmFtIGtleSBBIHByb3BlcnR5IGtleSB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5S2V5IChrZXk6IGFueSk6IGtleSBpcyBQcm9wZXJ0eUtleSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGtleSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGtleSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIHN0cmluZyBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlIHJlbW92aW5nIGludmFsaWQgYXR0cmlidXRlIGNoYXJhY3RlcnNcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQSBzdHJpbmcgdG8gZW5jb2RlIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqIEByZXR1cm5zICAgICBBbiBlbmNvZGVkIHN0cmluZyB1c2FibGUgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUF0dHJpYnV0ZSAodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4ga2ViYWJDYXNlKHZhbHVlLnJlcGxhY2UoL1xcVysvZywgJy0nKS5yZXBsYWNlKC9cXC0kLywgJycpKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXR0cmlidXRlIG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBOdW1lcmljIHByb3BlcnR5IGluZGV4ZXMgb3Igc3ltYm9scyBjYW4gY29udGFpbiBpbnZhbGlkIGNoYXJhY3RlcnMgZm9yIGF0dHJpYnV0ZSBuYW1lcy4gVGhpcyBtZXRob2RcbiAqIHNhbml0aXplcyB0aG9zZSBjaGFyYWN0ZXJzIGFuZCByZXBsYWNlcyBzZXF1ZW5jZXMgb2YgaW52YWxpZCBjaGFyYWN0ZXJzIHdpdGggYSBkYXNoLlxuICogQXR0cmlidXRlIG5hbWVzIGFyZSBub3QgYWxsb3dlZCB0byBzdGFydCB3aXRoIG51bWJlcnMgZWl0aGVyIGFuZCBhcmUgcHJlZml4ZWQgd2l0aCAnYXR0ci0nLlxuICpcbiAqIE4uQi46IFdoZW4gdXNpbmcgY3VzdG9tIHN5bWJvbHMgYXMgcHJvcGVydHkga2V5cywgdXNlIHVuaXF1ZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzeW1ib2xzIHRvIGF2b2lkXG4gKiBjbGFzaGluZyBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgYSA9IFN5bWJvbCgpO1xuICogY29uc3QgYiA9IFN5bWJvbCgpO1xuICpcbiAqIGEgIT09IGI7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGEpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGIpOyAvLyBmYWxzZSAtLT4gJ2F0dHItc3ltYm9sJyA9PT0gJ2F0dHItc3ltYm9sJ1xuICpcbiAqIGNvbnN0IGMgPSBTeW1ib2woJ2MnKTtcbiAqIGNvbnN0IGQgPSBTeW1ib2woJ2QnKTtcbiAqXG4gKiBjICE9PSBkOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShjKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShkKTsgLy8gdHJ1ZSAtLT4gJ2F0dHItc3ltYm9sLWMnID09PSAnYXR0ci1zeW1ib2wtZCdcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgYXR0cmlidXRlIG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZU5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IHN0cmluZyB7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHJldHVybiBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgYXR0cmlidXRlIG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHJldHVybiBgYXR0ci0keyBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSkgfWA7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBldmVudCBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogRXZlbnQgbmFtZXMgZG9uJ3QgaGF2ZSB0aGUgc2FtZSByZXN0cmljdGlvbnMgYXMgYXR0cmlidXRlIG5hbWVzIHdoZW4gaXQgY29tZXMgdG8gaW52YWxpZFxuICogY2hhcmFjdGVycy4gSG93ZXZlciwgZm9yIGNvbnNpc3RlbmN5J3Mgc2FrZSwgd2UgYXBwbHkgdGhlIHNhbWUgcnVsZXMgZm9yIGV2ZW50IG5hbWVzIGFzXG4gKiBmb3IgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEBwYXJhbSBwcmVmaXggICAgICAgIEFuIG9wdGlvbmFsIHByZWZpeCwgZS5nLjogJ29uJ1xuICogQHBhcmFtIHN1ZmZpeCAgICAgICAgQW4gb3B0aW9uYWwgc3VmZml4LCBlLmcuOiAnY2hhbmdlZCdcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgZXZlbnQgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnROYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHByZWZpeD86IHN0cmluZywgc3VmZml4Pzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBwcm9wZXJ0eVN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBldmVudCBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7IHByZWZpeCA/IGAkeyBrZWJhYkNhc2UocHJlZml4KSB9LWAgOiAnJyB9JHsgcHJvcGVydHlTdHJpbmcgfSR7IHN1ZmZpeCA/IGAtJHsga2ViYWJDYXNlKHN1ZmZpeCkgfWAgOiAnJyB9YDtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogRG9lcyBwcm9wZXJ0eSBoYXZlIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBObyBhdHRyaWJ1dGUgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBUaGUgYXR0cmlidXRlIG5hbWUgd2lsbCBiZSBpbmZlcnJlZCBieSBjYW1lbC1jYXNpbmcgdGhlIHByb3BlcnR5IG5hbWVcbiAgICAgKiAqIGBzdHJpbmdgOiBVc2UgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgYXR0cmlidXRlOiBib29sZWFuIHwgc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9taXplIHRoZSBjb252ZXJzaW9uIG9mIHZhbHVlcyBiZXR3ZWVuIHByb3BlcnR5IGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDb252ZXJ0ZXJzIGFyZSBvbmx5IHVzZWQgd2hlbiB7QGxpbmsgcmVmbGVjdFByb3BlcnR5fSBhbmQvb3Ige0BsaW5rIHJlZmxlY3RBdHRyaWJ1dGV9IGFyZSBzZXQgdG8gdHJ1ZS5cbiAgICAgKiBJZiBjdXN0b20gcmVmbGVjdG9ycyBhcmUgdXNlZCwgdGhleSBoYXZlIHRvIHRha2UgY2FyZSBvciBjb252ZXJ0aW5nIHRoZSBwcm9wZXJ0eS9hdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZToge0BsaW5rIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHR9XG4gICAgICovXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlJ3MgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgYXR0cmlidXRlIHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgYXR0cmlidXRlIGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBwcm9wZXJ0eSB1c2luZyB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgYXR0cmlidXRlIHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIHByb3BlcnR5IHZhbHVlIGJlIGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogVGhlIHByb3BlcnR5IHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgcHJvcGVydHkgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIHVzaW5nIHRoZSBkZWZhdWx0IHByb3BlcnR5IHJlZmxlY3RvclxuICAgICAqICogYFByb3BlcnR5S2V5YDogQSBtZXRob2Qgb24gdGhlIGNvbXBvbmVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIHByb3BlcnR5IHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdFByb3BlcnR5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5UmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGEgcHJvcGVydHkgdmFsdWUgY2hhbmdlIHJhaXNlIGEgY3VzdG9tIGV2ZW50P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBjcmVhdGUgYSBjdXN0b20gZXZlbnQgZm9yIHRoaXMgcHJvcGVydHlcbiAgICAgKiAqIGB0cnVlYDogQ3JlYXRlIGN1c3RvbSBldmVudHMgZm9yIHRoaXMgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYFByb3BlcnR5S2V5YDogVXNlIHRoZSBtZXRob2Qgd2l0aCB0aGlzIHByb3BlcnR5IGtleSBvbiB0aGUgY29tcG9uZW50IHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzXG4gICAgICogKiBgRnVuY3Rpb25gOiBVc2UgdGhlIHRoZSBwcm92aWRlZCBmdW5jdGlvbiB0byBjcmVhdGUgY3VzdG9tIGV2ZW50cyAoYHRoaXNgIGNvbnRleHQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGluc3RhbmNlKVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgbm90aWZ5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5Tm90aWZpZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgaG93IGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgbW9uaXRvcmVkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEJ5IGRlZmF1bHQgYSBkZWNvcmF0ZWQgcHJvcGVydHkgd2lsbCBiZSBvYnNlcnZlZCBmb3IgY2hhbmdlcyAodGhyb3VnaCBhIGN1c3RvbSBzZXR0ZXIgZm9yIHRoZSBwcm9wZXJ0eSkuXG4gICAgICogQW55IGBzZXRgLW9wZXJhdGlvbiBvZiB0aGlzIHByb3BlcnR5IHdpbGwgdGhlcmVmb3JlIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYW5kIGluaXRpYXRlXG4gICAgICogYSByZW5kZXIgYXMgd2VsbCBhcyByZWZsZWN0aW9uIGFuZCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBvYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSAodGhpcyB3aWxsIGJ5cGFzcyByZW5kZXIsIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbilcbiAgICAgKiAqIGB0cnVlYDogT2JzZXJ2ZSBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgdXNpbmcgdGhlIHtAbGluayBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUn1cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgcHJvdmlkZWQgbWV0aG9kIHRvIGNoZWNrIGlmIHByb3BlcnR5IHZhbHVlIGhhcyBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWAgKHVzZXMge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfSBpbnRlcm5hbGx5KVxuICAgICAqL1xuICAgIG9ic2VydmU6IGJvb2xlYW4gfCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICpcbiAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gKiBAcmV0dXJucyAgICAgICAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2VkXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUjogUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB7XG4gICAgLy8gaW4gY2FzZSBgb2xkVmFsdWVgIGFuZCBgbmV3VmFsdWVgIGFyZSBgTmFOYCwgYChOYU4gIT09IE5hTilgIHJldHVybnMgYHRydWVgLFxuICAgIC8vIGJ1dCBgKE5hTiA9PT0gTmFOIHx8IE5hTiA9PT0gTmFOKWAgcmV0dXJucyBgZmFsc2VgXG4gICAgcmV0dXJuIG9sZFZhbHVlICE9PSBuZXdWYWx1ZSAmJiAob2xkVmFsdWUgPT09IG9sZFZhbHVlIHx8IG5ld1ZhbHVlID09PSBuZXdWYWx1ZSk7XG59O1xuXG4vLyBUT0RPOiBtYXliZSBwcm92aWRlIGZsYXQgYXJyYXkvb2JqZWN0IGNoYW5nZSBkZXRlY3Rvcj8gZGF0ZSBjaGFuZ2UgZGV0ZWN0b3I/XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OOiBQcm9wZXJ0eURlY2xhcmF0aW9uID0ge1xuICAgIGF0dHJpYnV0ZTogdHJ1ZSxcbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQsXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogdHJ1ZSxcbiAgICByZWZsZWN0UHJvcGVydHk6IHRydWUsXG4gICAgbm90aWZ5OiB0cnVlLFxuICAgIG9ic2VydmU6IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SLFxufTtcbiIsIi8qKlxuICogR2V0IHRoZSB7QGxpbmsgUHJvcGVydHlEZXNjcmlwdG9yfSBvZiBhIHByb3BlcnR5IGZyb20gaXRzIHByb3RvdHlwZVxuICogb3IgYSBwYXJlbnQgcHJvdG90eXBlIC0gZXhjbHVkaW5nIHtAbGluayBPYmplY3QucHJvdG90eXBlfSBpdHNlbGYuXG4gKlxuICogQHBhcmFtIHRhcmdldCAgICAgICAgVGhlIHByb3RvdHlwZSB0byBnZXQgdGhlIGRlc2NyaXB0b3IgZnJvbVxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkZXNjcmlwdG9yXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZXNjcmlwdG9yIHwgdW5kZWZpbmVkIHtcblxuICAgIGlmIChwcm9wZXJ0eUtleSBpbiB0YXJnZXQpIHtcblxuICAgICAgICB3aGlsZSAodGFyZ2V0ICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkocHJvcGVydHlLZXkpKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IGNyZWF0ZUF0dHJpYnV0ZU5hbWUsIERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIFByb3BlcnR5RGVjbGFyYXRpb24gfSBmcm9tICcuL3Byb3BlcnR5LWRlY2xhcmF0aW9uLmpzJztcbmltcG9ydCB7IGdldFByb3BlcnR5RGVzY3JpcHRvciB9IGZyb20gJy4vdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IuanMnO1xuXG4vKipcbiAqIEEgdHlwZSBleHRlbnNpb24gdG8gYWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byBhIHtAbGluayBDb21wb25lbnR9IGNvbnN0cnVjdG9yIGR1cmluZyBkZWNvcmF0aW9uXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gdHlwZW9mIENvbXBvbmVudCAmIHsgb3ZlcnJpZGRlbj86IFNldDxzdHJpbmc+IH07XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHlcbiAqXG4gKiBAcmVtYXJrc1xuICogTWFueSBvZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9wdGlvbnMgc3VwcG9ydCBjdXN0b20gZnVuY3Rpb25zLCB3aGljaCB3aWxsIGJlIGludm9rZWRcbiAqIHdpdGggdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhcyBgdGhpc2AtY29udGV4dCBkdXJpbmcgZXhlY3V0aW9uLiBJbiBvcmRlciB0byBzdXBwb3J0IGNvcnJlY3RcbiAqIHR5cGluZyBpbiB0aGVzZSBmdW5jdGlvbnMsIHRoZSBgQHByb3BlcnR5YCBkZWNvcmF0b3Igc3VwcG9ydHMgZ2VuZXJpYyB0eXBlcy4gSGVyZSBpcyBhbiBleGFtcGxlXG4gKiBvZiBob3cgeW91IGNhbiB1c2UgdGhpcyB3aXRoIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn06XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIG15SGlkZGVuUHJvcGVydHkgPSB0cnVlO1xuICpcbiAqICAgICAgLy8gdXNlIGEgZ2VuZXJpYyB0byBzdXBwb3J0IHByb3BlciBpbnN0YW5jZSB0eXBpbmcgaW4gdGhlIHByb3BlcnR5IHJlZmxlY3RvclxuICogICAgICBAcHJvcGVydHk8TXlFbGVtZW50Pih7XG4gKiAgICAgICAgICByZWZsZWN0UHJvcGVydHk6IChwcm9wZXJ0eUtleTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gKiAgICAgICAgICAgICAgLy8gdGhlIGdlbmVyaWMgdHlwZSBhbGxvd3MgZm9yIGNvcnJlY3QgdHlwaW5nIG9mIHRoaXNcbiAqICAgICAgICAgICAgICBpZiAodGhpcy5teUhpZGRlblByb3BlcnR5ICYmIG5ld1ZhbHVlKSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdteS1wcm9wZXJ0eScsICcnKTtcbiAqICAgICAgICAgICAgICB9IGVsc2Uge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbXktcHJvcGVydHknKTtcbiAqICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSBmYWxzZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEgcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGRlZmluaW5nIGNsYXNzZXMgaW4gVHlwZVNjcmlwdCwgY2xhc3MgZmllbGRzIGFjdHVhbGx5IGRvbid0IGV4aXN0IG9uIHRoZSBjbGFzcydzIHByb3RvdHlwZSwgYnV0XG4gICAgICAgICAqIHJhdGhlciwgdGhleSBhcmUgaW5zdGFudGlhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgZXhpc3Qgb25seSBvbiB0aGUgaW5zdGFuY2UuIEFjY2Vzc29yIHByb3BlcnRpZXNcbiAgICAgICAgICogYXJlIGFuIGV4Y2VwdGlvbiBob3dldmVyIGFuZCBleGlzdCBvbiB0aGUgcHJvdG90eXBlLiBGdXJ0aGVybW9yZSwgYWNjZXNzb3JzIGFyZSBpbmhlcml0ZWQgYW5kIHdpbGxcbiAgICAgICAgICogYmUgaW52b2tlZCB3aGVuIHNldHRpbmcgKG9yIGdldHRpbmcpIGEgcHJvcGVydHkgb24gYW4gaW5zdGFuY2Ugb2YgYSBjaGlsZCBjbGFzcywgZXZlbiBpZiB0aGF0IGNsYXNzXG4gICAgICAgICAqIGRlZmluZXMgdGhlIHByb3BlcnR5IGZpZWxkIG9uIGl0cyBvd24uIE9ubHkgaWYgdGhlIGNoaWxkIGNsYXNzIGRlZmluZXMgbmV3IGFjY2Vzc29ycyB3aWxsIHRoZSBwYXJlbnRcbiAgICAgICAgICogY2xhc3MncyBhY2Nlc3NvcnMgbm90IGJlIGluaGVyaXRlZC5cbiAgICAgICAgICogVG8ga2VlcCB0aGlzIGJlaGF2aW9yIGludGFjdCwgd2UgbmVlZCB0byBlbnN1cmUsIHRoYXQgd2hlbiB3ZSBjcmVhdGUgYWNjZXNzb3JzIGZvciBwcm9wZXJ0aWVzLCB3aGljaFxuICAgICAgICAgKiBhcmUgbm90IGRlY2xhcmVkIGFzIGFjY2Vzc29ycywgd2UgaW52b2tlIHRoZSBwYXJlbnQgY2xhc3MncyBhY2Nlc3NvciBhcyBleHBlY3RlZC5cbiAgICAgICAgICogVGhlIHtAbGluayBnZXRQcm9wZXJ0eURlc2NyaXB0b3J9IGZ1bmN0aW9uIGFsbG93cyB1cyB0byBsb29rIGZvciBhY2Nlc3NvcnMgb24gdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICAgICAgICAgKiB0aGUgY2xhc3Mgd2UgYXJlIGRlY29yYXRpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gcHJvcGVydHlEZXNjcmlwdG9yIHx8IGdldFByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgY29uc3QgaGlkZGVuS2V5ID0gKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpID8gYF9fJHsgcHJvcGVydHlLZXkgfWAgOiBTeW1ib2woKTtcblxuICAgICAgICAvLyBpZiB3ZSBmb3VuZCBhbiBhY2Nlc3NvciBkZXNjcmlwdG9yIChmcm9tIGVpdGhlciB0aGlzIGNsYXNzIG9yIGEgcGFyZW50KSB3ZSB1c2UgaXQsIG90aGVyd2lzZSB3ZSBjcmVhdGVcbiAgICAgICAgLy8gZGVmYXVsdCBhY2Nlc3NvcnMgdG8gc3RvcmUgdGhlIGFjdHVhbCBwcm9wZXJ0eSB2YWx1ZSBpbiBhIGhpZGRlbiBmaWVsZCBhbmQgcmV0cmlldmUgaXQgZnJvbSB0aGVyZVxuICAgICAgICBjb25zdCBnZXR0ZXIgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IuZ2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnkpIHsgcmV0dXJuIHRoaXNbaGlkZGVuS2V5XTsgfTtcbiAgICAgICAgY29uc3Qgc2V0dGVyID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnNldCB8fCBmdW5jdGlvbiAodGhpczogYW55LCB2YWx1ZTogYW55KSB7IHRoaXNbaGlkZGVuS2V5XSA9IHZhbHVlOyB9O1xuXG4gICAgICAgIC8vIHdlIGRlZmluZSBhIG5ldyBhY2Nlc3NvciBkZXNjcmlwdG9yIHdoaWNoIHdpbGwgd3JhcCB0aGUgcHJldmlvdXNseSByZXRyaWV2ZWQgb3IgY3JlYXRlZCBhY2Nlc3NvcnNcbiAgICAgICAgLy8gYW5kIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgd2hlbmV2ZXIgdGhlIHByb3BlcnR5IGlzIHNldFxuICAgICAgICBjb25zdCB3cmFwcGVkRGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yICYgVGhpc1R5cGU8YW55PiA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IGFueSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpc1twcm9wZXJ0eUtleV07XG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHBhc3MgYHZhbHVlYCBvbiBhcyBgbmV3VmFsdWVgIC0gYW4gaW5oZXJpdGVkIHNldHRlciBtaWdodCBtb2RpZnkgaXRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIGdldCB0aGUgbmV3IHZhbHVlIGJ5IGludm9raW5nIHRoZSBnZXR0ZXJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUocHJvcGVydHlLZXksIG9sZFZhbHVlLCBnZXR0ZXIuY2FsbCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uOiBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+ID0geyAuLi5ERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdGhlIGRlZmF1bHQgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPSBjcmVhdGVBdHRyaWJ1dGVOYW1lKHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLm9ic2VydmUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24ub2JzZXJ2ZSA9IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04ub2JzZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgaW5oZXJpdGVkIGFuIG9ic2VydmVkIGF0dHJpYnV0ZSBmb3IgdGhlIHByb3BlcnR5IGZyb20gdGhlIGJhc2UgY2xhc3NcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gY29uc3RydWN0b3IucHJvcGVydGllcy5oYXMocHJvcGVydHlLZXkpID8gY29uc3RydWN0b3IucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpIS5hdHRyaWJ1dGUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSBpdCdzIGEgc3RyaW5nIGFuZCBpdCB3aWxsIGV4aXN0IGluIHRoZSBhdHRyaWJ1dGVzIG1hcFxuICAgICAgICBpZiAoYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgaW5oZXJpdGVkIGF0dHJpYnV0ZSBhcyBpdCdzIG92ZXJyaWRkZW5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZGVsZXRlKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgLy8gbWFyayBhdHRyaWJ1dGUgYXMgb3ZlcnJpZGRlbiBmb3Ige0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuIS5hZGQoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuc2V0KGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uICphZnRlciogcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlcywgc28gd2UgY2FuIHN0aWxsIGFjY2VzcyB0aGVcbiAgICAgICAgLy8gaW5oZXJpdGVkIHByb3BlcnR5IGRlY2xhcmF0aW9uIHdoZW4gcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlc1xuICAgICAgICBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgZGVjbGFyYXRpb24gYXMgUHJvcGVydHlEZWNsYXJhdGlvbik7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgLy8gaWYgbm8gcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYSBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIHdoaWNoIG11c3QgcmV0dXJuIHZvaWQgYW5kIHdlIGNhbiBkZWZpbmUgdGhlIHdyYXBwZWQgZGVzY3JpcHRvciBoZXJlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgd3JhcHBlZERlc2NyaXB0b3IpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGlmIGEgcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYW4gYWNjZXNzb3JcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciBhbmQgd2UgbXVzdCByZXR1cm4gdGhlIHdyYXBwZWQgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWREZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIHByb3BlcnR5IGRlY29yYXRvciBzdG9yZXMgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgaW4gdGhlIGNvbnN0cnVjdG9yLFxuICogd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhvc2Ugc3RhdGljIGZpZWxkcyBhcmUgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZVxuICogYWRkIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkcy4gV2UgYWxzbyBtYWtlXG4gKiBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGNvbnN0cnVjdG9ycyBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYmFzZSBjbGFzcydzIG1hcHMgdG8gcHJvcGVybHlcbiAqIGluaGVyaXQgYWxsIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlcy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IERlY29yYXRlZENvbXBvbmVudFR5cGUpIHtcblxuICAgIC8vIHRoaXMgd2lsbCBnaXZlIHVzIGEgY29tcGlsZS10aW1lIGVycm9yIGlmIHdlIHJlZmFjdG9yIG9uZSBvZiB0aGUgc3RhdGljIGNvbnN0cnVjdG9yIHByb3BlcnRpZXNcbiAgICAvLyBhbmQgd2Ugd29uJ3QgbWlzcyByZW5hbWluZyB0aGUgcHJvcGVydHkga2V5c1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAncHJvcGVydGllcyc7XG4gICAgY29uc3QgYXR0cmlidXRlczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdhdHRyaWJ1dGVzJztcbiAgICBjb25zdCBvdmVycmlkZGVuOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ292ZXJyaWRkZW4nO1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0aWVzKSkgY29uc3RydWN0b3IucHJvcGVydGllcyA9IG5ldyBNYXAoY29uc3RydWN0b3IucHJvcGVydGllcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVzKSkgY29uc3RydWN0b3IuYXR0cmlidXRlcyA9IG5ldyBNYXAoY29uc3RydWN0b3IuYXR0cmlidXRlcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShvdmVycmlkZGVuKSkgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiA9IG5ldyBTZXQoKTtcbn1cbiIsImltcG9ydCB7IHJlbmRlciwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQge1xuICAgIEF0dHJpYnV0ZVJlZmxlY3RvcixcbiAgICBjcmVhdGVFdmVudE5hbWUsXG4gICAgaXNBdHRyaWJ1dGVSZWZsZWN0b3IsXG4gICAgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yLFxuICAgIGlzUHJvcGVydHlLZXksXG4gICAgaXNQcm9wZXJ0eU5vdGlmaWVyLFxuICAgIGlzUHJvcGVydHlSZWZsZWN0b3IsXG4gICAgTGlzdGVuZXJEZWNsYXJhdGlvbixcbiAgICBQcm9wZXJ0eURlY2xhcmF0aW9uLFxuICAgIFByb3BlcnR5Tm90aWZpZXIsXG4gICAgUHJvcGVydHlSZWZsZWN0b3Jcbn0gZnJvbSBcIi4vZGVjb3JhdG9ycy9pbmRleC5qc1wiO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SID0gKGF0dHJpYnV0ZVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgYXR0cmlidXRlIHJlZmxlY3RvciAkeyBTdHJpbmcoYXR0cmlidXRlUmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SID0gKHByb3BlcnR5UmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSByZWZsZWN0b3IgJHsgU3RyaW5nKHByb3BlcnR5UmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IgPSAocHJvcGVydHlOb3RpZmllcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgbm90aWZpZXIgJHsgU3RyaW5nKHByb3BlcnR5Tm90aWZpZXIpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBDSEFOR0VfREVURUNUT1JfRVJST1IgPSAoY2hhbmdlRGV0ZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvciAkeyBTdHJpbmcoY2hhbmdlRGV0ZWN0b3IpIH0uYCk7XG5cbi8qKlxuICogRXh0ZW5kcyB0aGUgc3RhdGljIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSB0byBpbmNsdWRlIHRoZSBib3VuZCBsaXN0ZW5lclxuICogZm9yIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5pbnRlcmZhY2UgSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uIGV4dGVuZHMgTGlzdGVuZXJEZWNsYXJhdGlvbiB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYm91bmQgbGlzdGVuZXIgd2lsbCBiZSBzdG9yZWQgaGVyZSwgc28gaXQgY2FuIGJlIHJlbW92ZWQgaXQgbGF0ZXJcbiAgICAgKi9cbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBldmVudCB0YXJnZXQgd2lsbCBhbHdheXMgYmUgcmVzb2x2ZWQgdG8gYW4gYWN0dWFsIHtAbGluayBFdmVudFRhcmdldH1cbiAgICAgKi9cbiAgICB0YXJnZXQ6IEV2ZW50VGFyZ2V0O1xufVxuXG4vKipcbiAqIEEgdHlwZSBmb3IgcHJvcGVydHkgY2hhbmdlcywgYXMgdXNlZCBpbiAke0BsaW5rIENvbXBvbmVudC51cGRhdGVDYWxsYmFja31cbiAqL1xuZXhwb3J0IHR5cGUgQ2hhbmdlcyA9IE1hcDxQcm9wZXJ0eUtleSwgYW55PjtcblxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZUV2ZW50RGV0YWlsPFQ+IHtcbiAgICBwcm9wZXJ0eTogc3RyaW5nO1xuICAgIHByZXZpb3VzOiBUO1xuICAgIGN1cnJlbnQ6IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2VFdmVudDxUPiBleHRlbmRzIEN1c3RvbUV2ZW50PFByb3BlcnR5Q2hhbmdlRXZlbnREZXRhaWw8VD4+IHt9XG5cbi8qKlxuICogVGhlIGNvbXBvbmVudCBiYXNlIGNsYXNzXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hlbiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICogaW5zdGFuY2UgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZVNoZWV0ICgpOiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVTaGVldCcpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBzdHlsZSBzaGVldCBhbmQgY2FjaGUgaXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBuZXcgQ1NTU3R5bGVTaGVldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQucmVwbGFjZVN5bmModGhpcy5zdHlsZXMuam9pbignXFxuJykpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVTaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBub2RlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZUVsZW1lbnQgKCk6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZUVsZW1lbnQnKSkge1xuXG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRpdGxlID0gdGhpcy5zZWxlY3RvcjtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBhdHRyaWJ1dGUgbmFtZXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkga2V5c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICogcHJvcGVydHkga2V5IHRoYXQgYmVsb25ncyB0byBhbiBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBQcm9wZXJ0eUtleT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9mIGEgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBQcm9wZXJ0eURlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gb2YgYSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuZXJzOiBNYXA8UHJvcGVydHlLZXksIExpc3RlbmVyRGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHNlbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgb3ZlcnJpZGRlbiBieSB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHNlbGVjdG9yYCBvcHRpb24sIGlmIHByb3ZpZGVkLlxuICAgICAqIE90aGVyd2lzZSB0aGUgZGVjb3JhdG9yIHdpbGwgdXNlIHRoaXMgcHJvcGVydHkgdG8gZGVmaW5lIHRoZSBjb21wb25lbnQuXG4gICAgICovXG4gICAgc3RhdGljIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIHNldCBieSB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHNoYWRvd2Agb3B0aW9uIChkZWZhdWx0cyB0byBgdHJ1ZWApLlxuICAgICAqL1xuICAgIHN0YXRpYyBzaGFkb3c6IGJvb2xlYW47XG5cbiAgICAvLyBUT0RPOiBjcmVhdGUgdGVzdHMgZm9yIHN0eWxlIGluaGVyaXRhbmNlXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzdHlsZXNgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHVuZGVmaW5lZGApLlxuICAgICAqIFN0eWxlcyBzZXQgaW4gdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvciB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0eS5cbiAgICAgKiBUaGlzIGFsbG93cyB0byBpbmhlcml0IHN0eWxlcyBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCBhbmQgYWRkIGFkZGl0aW9uYWwgc3R5bGVzIG9uIHRoZSBjaGlsZCBjb21wb25lbnQuXG4gICAgICogSW4gb3JkZXIgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQsIGFuIGV4cGxpY2l0IHN1cGVyIGNhbGwgaGFzIHRvIGJlIGluY2x1ZGVkLiBCeVxuICAgICAqIGRlZmF1bHQgbm8gc3R5bGVzIGFyZSBpbmhlcml0ZWQuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBzdHlsZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbXG4gICAgICogICAgICAgICAgICAgIC4uLnN1cGVyLnN0eWxlcyxcbiAgICAgKiAgICAgICAgICAgICAgJzpob3N0IHsgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47IH0nXG4gICAgICogICAgICAgICAgXTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCk6IHN0cmluZ1tdIHtcblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENhbiBiZSBzZXQgdGhyb3VnaCB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHRlbXBsYXRlYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBJZiBzZXQgaW4gdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvciwgaXQgd2lsbCBoYXZlIHByZWNlZGVuY2Ugb3ZlciB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAgIFRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gaGVscGVycyAgIEFueSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgd2hpY2ggc2hvdWxkIGV4aXN0IGluIHRoZSB0ZW1wbGF0ZSBzY29wZVxuICAgICAqL1xuICAgIHN0YXRpYyB0ZW1wbGF0ZT86IChlbGVtZW50OiBhbnksIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0byBzcGVjaWZ5IGF0dHJpYnV0ZXMgd2hpY2ggc2hvdWxkIGJlIG9ic2VydmVkLCBidXQgZG9uJ3QgaGF2ZSBhbiBhc3NvY2lhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrXG4gICAgICogRm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIGRlY29yYXRlZCB3aXRoIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciwgYW4gb2JzZXJ2ZWQgYXR0cmlidXRlXG4gICAgICogaXMgYXV0b21hdGljYWxseSBjcmVhdGVkIGFuZCBkb2VzIG5vdCBuZWVkIHRvIGJlIHNwZWNpZmllZCBoZXJlLiBGb3QgYXR0cmlidXRlcyB0aGF0IGRvbid0XG4gICAgICogaGF2ZSBhbiBhc3NvY2lhdGVkIHByb3BlcnR5LCByZXR1cm4gdGhlIGF0dHJpYnV0ZSBuYW1lcyBpbiB0aGlzIGdldHRlci4gQ2hhbmdlcyB0byB0aGVzZVxuICAgICAqIGF0dHJpYnV0ZXMgY2FuIGJlIGhhbmRsZWQgaW4gdGhlIHtAbGluayBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2t9IG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFdoZW4gZXh0ZW5kaW5nIGNvbXBvbmVudHMsIG1ha2Ugc3VyZSB0byByZXR1cm4gdGhlIHN1cGVyIGNsYXNzJ3Mgb2JzZXJ2ZWRBdHRyaWJ1dGVzXG4gICAgICogaWYgeW91IG92ZXJyaWRlIHRoaXMgZ2V0dGVyIChleGNlcHQgaWYgeW91IGRvbid0IHdhbnQgdG8gaW5oZXJpdCBvYnNlcnZlZCBhdHRyaWJ1dGVzKTpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIE15QmFzZUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuICAgICAqXG4gICAgICogICAgICAgICAgcmV0dXJuIFsuLi5zdXBlci5vYnNlcnZlZEF0dHJpYnV0ZXMsICdteS1hZGRpdGlvbmFsLWF0dHJpYnV0ZSddO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVJlcXVlc3Q6IFByb21pc2U8Ym9vbGVhbj4gPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NoYW5nZWRQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeWluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJEZWNsYXJhdGlvbnM6IEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbltdID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2hhc1VwZGF0ZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJlbmRlciByb290IGlzIHdoZXJlIHRoZSB7QGxpbmsgcmVuZGVyfSBtZXRob2Qgd2lsbCBhdHRhY2ggaXRzIERPTSBvdXRwdXRcbiAgICAgKi9cbiAgICByZWFkb25seSByZW5kZXJSb290OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAoLi4uYXJnczogYW55W10pIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyUm9vdCA9IHRoaXMuX2NyZWF0ZVJlbmRlclJvb3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIG1vdmVkIHRvIGEgbmV3IGRvY3VtZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBhZG9wdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnYWRvcHRlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgYXBwZW5kZWQgaW50byBhIGRvY3VtZW50LWNvbm5lY3RlZCBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdjb25uZWN0ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBkb2N1bWVudCdzIERPTVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX3VubGlzdGVuKCk7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdkaXNjb25uZWN0ZWQnKTtcblxuICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgb25lIG9mIHRoZSBjb21wb25lbnQncyBhdHRyaWJ1dGVzIGlzIGFkZGVkLCByZW1vdmVkLCBvciBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoaWNoIGF0dHJpYnV0ZXMgdG8gbm90aWNlIGNoYW5nZSBmb3IgaXMgc3BlY2lmaWVkIGluIHtAbGluayBvYnNlcnZlZEF0dHJpYnV0ZXN9LlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogRm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHdpdGggYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGUsIHRoaXMgaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5LlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gdG8gY3VzdG9taXplIHRoZSBoYW5kbGluZyBvZiBhdHRyaWJ1dGUgY2hhbmdlcy4gV2hlbiBvdmVycmlkaW5nXG4gICAgICogdGhpcyBtZXRob2QsIGEgc3VwZXItY2FsbCBzaG91bGQgYmUgaW5jbHVkZWQsIHRvIGVuc3VyZSBhdHRyaWJ1dGUgY2hhbmdlcyBmb3IgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgKiBhcmUgcHJvY2Vzc2VkIGNvcnJlY3RseS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayAoYXR0cmlidXRlOiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHN1cGVyLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICpcbiAgICAgKiAgICAgICAgICAvLyBkbyBjdXN0b20gaGFuZGxpbmcuLi5cbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBpZiAodGhpcy5faXNSZWZsZWN0aW5nIHx8IG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCB1cGRhdGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBgdXBkYXRlQ2FsbGJhY2tgIGlzIGludm9rZWQgc3luY2hyb25vdXNseSBieSB0aGUge0BsaW5rIHVwZGF0ZX0gbWV0aG9kIGFuZCB0aGVyZWZvcmUgaGFwcGVucyBkaXJlY3RseSBhZnRlclxuICAgICAqIHJlbmRlcmluZywgcHJvcGVydHkgcmVmbGVjdGlvbiBhbmQgcHJvcGVydHkgY2hhbmdlIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIE4uQi46IENoYW5nZXMgbWFkZSB0byBwcm9wZXJ0aWVzIG9yIGF0dHJpYnV0ZXMgaW5zaWRlIHRoaXMgY2FsbGJhY2sgKndvbid0KiBjYXVzZSBhbm90aGVyIHVwZGF0ZS5cbiAgICAgKiBUbyBjYXVzZSBhbiB1cGRhdGUsIGRlZmVyIGNoYW5nZXMgd2l0aCB0aGUgaGVscCBvZiBhIFByb21pc2UuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAqICAgICAgICAgICAgICAvLyBwZXJmb3JtIGNoYW5nZXMgd2hpY2ggbmVlZCB0byBjYXVzZSBhbm90aGVyIHVwZGF0ZSBoZXJlXG4gICAgICogICAgICAgICAgfSk7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5nZXMgICAgICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IGNoYW5nZWQgaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBmaXJzdFVwZGF0ZSAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoaXMgd2FzIHRoZSBmaXJzdCB1cGRhdGVcbiAgICAgKi9cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHsgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBjdXN0b20gZXZlbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIEFuIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0gZXZlbnRJbml0IEEge0BsaW5rIEN1c3RvbUV2ZW50SW5pdH0gZGljdGlvbmFyeVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnkgKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudEluaXQ/OiBDdXN0b21FdmVudEluaXQpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgZXZlbnRJbml0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2ggcHJvcGVydHkgY2hhbmdlcyBvY2N1cnJpbmcgaW4gdGhlIGV4ZWN1dG9yIGFuZCByYWlzZSBjdXN0b20gZXZlbnRzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFByb3BlcnR5IGNoYW5nZXMgc2hvdWxkIHRyaWdnZXIgY3VzdG9tIGV2ZW50cyB3aGVuIHRoZXkgYXJlIGNhdXNlZCBieSBpbnRlcm5hbCBzdGF0ZSBjaGFuZ2VzLFxuICAgICAqIGJ1dCBub3QgaWYgdGhleSBhcmUgY2F1c2VkIGJ5IGEgY29uc3VtZXIgb2YgdGhlIGNvbXBvbmVudCBBUEkgZGlyZWN0bHksIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbXktY3VzdG9tLWVsZW1lbnQnKS5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogYGBgLlxuICAgICAqXG4gICAgICogVGhpcyBtZWFucywgd2UgY2Fubm90IGF1dG9tYXRlIHRoaXMgcHJvY2VzcyB0aHJvdWdoIHByb3BlcnR5IHNldHRlcnMsIGFzIHdlIGNhbid0IGJlIHN1cmUgd2hvXG4gICAgICogaW52b2tlZCB0aGUgc2V0dGVyIC0gaW50ZXJuYWwgY2FsbHMgb3IgZXh0ZXJuYWwgY2FsbHMuXG4gICAgICpcbiAgICAgKiBPbmUgb3B0aW9uIGlzIHRvIG1hbnVhbGx5IHJhaXNlIHRoZSBldmVudCwgd2hpY2ggY2FuIGJlY29tZSB0ZWRpb3VzIGFuZCBmb3JjZXMgdXMgdG8gdXNlIHN0cmluZy1cbiAgICAgKiBiYXNlZCBldmVudCBuYW1lcyBvciBwcm9wZXJ0eSBuYW1lcywgd2hpY2ggYXJlIGRpZmZpY3VsdCB0byByZWZhY3RvciwgZS5nLjpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAvLyBpZiB3ZSByZWZhY3RvciB0aGUgcHJvcGVydHkgbmFtZSwgd2UgY2FuIGVhc2lseSBtaXNzIHRoZSBub3RpZnkgY2FsbFxuICAgICAqIHRoaXMubm90aWZ5KCdjdXN0b21Qcm9wZXJ0eScpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQSBtb3JlIGNvbnZlbmllbnQgd2F5IGlzIHRvIGV4ZWN1dGUgdGhlIGludGVybmFsIGNoYW5nZXMgaW4gYSB3cmFwcGVyIHdoaWNoIGNhbiBkZXRlY3QgdGhlIGNoYW5nZWRcbiAgICAgKiBwcm9wZXJ0aWVzIGFuZCB3aWxsIGF1dG9tYXRpY2FsbHkgcmFpc2UgdGhlIHJlcXVpcmVkIGV2ZW50cy4gVGhpcyBlbGltaW5hdGVzIHRoZSBuZWVkIHRvIG1hbnVhbGx5XG4gICAgICogcmFpc2UgZXZlbnRzIGFuZCByZWZhY3RvcmluZyBkb2VzIG5vIGxvbmdlciBhZmZlY3QgdGhlIHByb2Nlc3MuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy53YXRjaCgoKSA9PiB7XG4gICAgICpcbiAgICAgKiAgICAgIHRoaXMuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqICAgICAgLy8gd2UgY2FuIGFkZCBtb3JlIHByb3BlcnR5IG1vZGlmaWNhdGlvbnMgdG8gbm90aWZ5IGluIGhlcmVcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBleGVjdXRvciBBIGZ1bmN0aW9uIHRoYXQgcGVyZm9ybXMgdGhlIGNoYW5nZXMgd2hpY2ggc2hvdWxkIGJlIG5vdGlmaWVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdhdGNoIChleGVjdXRvcjogKCkgPT4gdm9pZCkge1xuXG4gICAgICAgIC8vIGJhY2sgdXAgY3VycmVudCBjaGFuZ2VkIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgcHJldmlvdXNDaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG5cbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgY2hhbmdlc1xuICAgICAgICBleGVjdXRvcigpO1xuXG4gICAgICAgIC8vIGFkZCBhbGwgbmV3IG9yIHVwZGF0ZWQgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIHRoZSBub3RpZnlpbmcgcHJvcGVydGllc1xuICAgICAgICBmb3IgKGNvbnN0IFtwcm9wZXJ0eUtleSwgb2xkVmFsdWVdIG9mIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZGVkID0gIXByZXZpb3VzQ2hhbmdlcy5oYXMocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9ICFhZGRlZCAmJiB0aGlzLmhhc0NoYW5nZWQocHJvcGVydHlLZXksIHByZXZpb3VzQ2hhbmdlcy5nZXQocHJvcGVydHlLZXkpLCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIGlmIChhZGRlZCB8fCB1cGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSB2YWx1ZSBvZiBhIGRlY29yYXRlZCBwcm9wZXJ0eSBvciBpdHMgYXNzb2NpYXRlZFxuICAgICAqIGF0dHJpYnV0ZSBjaGFuZ2VzLiBJZiB5b3UgbmVlZCB0aGUgY29tcG9uZW50IHRvIHVwZGF0ZSBiYXNlZCBvbiBhIHN0YXRlIGNoYW5nZSB0aGF0IGlzXG4gICAgICogbm90IGNvdmVyZWQgYnkgYSBkZWNvcmF0ZWQgcHJvcGVydHksIGNhbGwgdGhpcyBtZXRob2Qgd2l0aG91dCBhbnkgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIG5hbWUgb2YgdGhlIGNoYW5nZWQgcHJvcGVydHkgdGhhdCByZXF1ZXN0cyB0aGUgdXBkYXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIHRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBBIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiB0aGUgdXBkYXRlIGlzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZXF1ZXN0VXBkYXRlIChwcm9wZXJ0eUtleT86IFByb3BlcnR5S2V5LCBvbGRWYWx1ZT86IGFueSwgbmV3VmFsdWU/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBpZiAocHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSdzIG9ic2VydmUgb3B0aW9uIGlzIGBmYWxzZWAsIHtAbGluayBoYXNDaGFuZ2VkfVxuICAgICAgICAgICAgLy8gd2lsbCByZXR1cm4gYGZhbHNlYCBhbmQgbm8gdXBkYXRlIHdpbGwgYmUgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzQ2hhbmdlZChwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSkgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIGNoYW5nZWQgcHJvcGVydHkgZm9yIGJhdGNoIHByb2Nlc3NpbmdcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgaW4gcmVmbGVjdGluZyBzdGF0ZSwgYW4gYXR0cmlidXRlIGlzIHJlZmxlY3RpbmcgdG8gdGhpcyBwcm9wZXJ0eSBhbmQgd2VcbiAgICAgICAgICAgIC8vIGNhbiBza2lwIHJlZmxlY3RpbmcgdGhlIHByb3BlcnR5IGJhY2sgdG8gdGhlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgLy8gcHJvcGVydHkgY2hhbmdlcyBuZWVkIHRvIGJlIHRyYWNrZWQgaG93ZXZlciBhbmQge0BsaW5rIHJlbmRlcn0gbXVzdCBiZSBjYWxsZWQgYWZ0ZXJcbiAgICAgICAgICAgIC8vIHRoZSBhdHRyaWJ1dGUgY2hhbmdlIGlzIHJlZmxlY3RlZCB0byB0aGlzIHByb3BlcnR5XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzUmVmbGVjdGluZykgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBlbnF1ZXVlIHVwZGF0ZSByZXF1ZXN0IGlmIG5vbmUgd2FzIGVucXVldWVkIGFscmVhZHlcbiAgICAgICAgICAgIHRoaXMuX2VucXVldWVVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVXNlcyBsaXQtaHRtbCdzIHtAbGluayBsaXQtaHRtbCNyZW5kZXJ9IG1ldGhvZCB0byByZW5kZXIgYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHRvIHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciByb290LiBUaGUgY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBzdGF0aWMgdGVtcGxhdGUgbWV0aG9kXG4gICAgICogYXV0b21hdGljYWxseS4gVG8gbWFrZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXZhaWxhYmxlIHRvIHRoZSB0ZW1wbGF0ZSBtZXRob2QsIHlvdSBjYW4gcGFzcyB0aGVtIHRvIHRoZVxuICAgICAqIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogY29uc3QgZGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlKSA9PiB7IC8vIHJldHVybiBzb21lIGRhdGUgdHJhbnNmb3JtYXRpb24uLi5cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnLFxuICAgICAqICAgICAgdGVtcGxhdGU6IChlbGVtZW50LCBmb3JtYXREYXRlKSA9PiBodG1sYDxzcGFuPkxhc3QgdXBkYXRlZDogJHsgZm9ybWF0RGF0ZShlbGVtZW50Lmxhc3RVcGRhdGVkKSB9PC9zcGFuPmBcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIEBwcm9wZXJ0eSgpXG4gICAgICogICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgKlxuICAgICAqICAgICAgcmVuZGVyICgpIHtcbiAgICAgKiAgICAgICAgICAvLyBtYWtlIHRoZSBkYXRlIGZvcm1hdHRlciBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIGJ5IHBhc3NpbmcgaXQgdG8gcmVuZGVyKClcbiAgICAgKiAgICAgICAgICBzdXBlci5yZW5kZXIoZGF0ZUZvcm1hdHRlcik7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBvYmplY3RzIHdoaWNoIHNob3VsZCBiZSBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoLi4uaGVscGVyczogYW55W10pIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbnN0cnVjdG9yLnRlbXBsYXRlICYmIGNvbnN0cnVjdG9yLnRlbXBsYXRlKHRoaXMsIC4uLmhlbHBlcnMpO1xuXG4gICAgICAgIGlmICh0ZW1wbGF0ZSkgcmVuZGVyKHRlbXBsYXRlLCB0aGlzLnJlbmRlclJvb3QsIHsgZXZlbnRDb250ZXh0OiB0aGlzIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbXBvbmVudCBhZnRlciBhbiB1cGRhdGUgd2FzIHJlcXVlc3RlZCB3aXRoIHtAbGluayByZXF1ZXN0VXBkYXRlfVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZW5kZXJzIHRoZSB0ZW1wbGF0ZSwgcmVmbGVjdHMgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIGF0dHJpYnV0ZXMgYW5kXG4gICAgICogZGlzcGF0Y2hlcyBjaGFuZ2UgZXZlbnRzIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBUbyBoYW5kbGUgdXBkYXRlcyBkaWZmZXJlbnRseSwgdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gYW5kIGEgbWFwIG9mIHByb3BlcnR5XG4gICAgICogY2hhbmdlcyBpcyBwcm92aWRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IGNoYW5nZWQgaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGUgKGNoYW5nZXM/OiBDaGFuZ2VzKSB7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcblxuICAgICAgICAvLyByZWZsZWN0IGFsbCBwcm9wZXJ0aWVzIG1hcmtlZCBmb3IgcmVmbGVjdGlvblxuICAgICAgICB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZTogYW55LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIENvbXBvbmVudF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBub3RpZnkgYWxsIHByb3BlcnRpZXMgbWFya2VkIGZvciBub3RpZmljYXRpb25cbiAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZSwgcHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgQ29tcG9uZW50XSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgcHJvcGVydHkgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZXNvbHZlcyB0aGUge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9IGZvciB0aGUgcHJvcGVydHkgYW5kIHJldHVybnMgaXRzIHJlc3VsdC5cbiAgICAgKiBJZiBub25lIGlzIGRlZmluZWQgKHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbidzIGBvYnNlcnZlYCBvcHRpb24gaXMgYGZhbHNlYCkgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IGNoYW5nZWQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhhc0NoYW5nZWQgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIG9ic2VydmUgaXMgZWl0aGVyIGBmYWxzZWAgb3IgYSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZSkpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlLmNhbGwobnVsbCwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgIHRocm93IENIQU5HRV9ERVRFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBmb3IgYSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSBUaGUgcHJvcGVydHkga2V5IGZvciB3aGljaCB0byByZXRyaWV2ZSB0aGUgZGVjbGFyYXRpb25cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UHJvcGVydHlEZWNsYXJhdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZWNsYXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnByb3BlcnRpZXMuZ2V0KHByb3BlcnR5S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogYXNzb2NpYXRlZCBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgcmVmbGVjdG9yLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogcmVmbGVjdG9yIHtAbGluayBfcmVmbGVjdEF0dHJpYnV0ZX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIC8vIGlnbm9yZSB1c2VyLWRlZmluZWQgb2JzZXJ2ZWQgYXR0cmlidXRlc1xuICAgICAgICAvLyBUT0RPOiB0ZXN0IHRoaXMgYW5kIHJlbW92ZSB0aGUgbG9nXG4gICAgICAgIGlmICghcHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYG9ic2VydmVkIGF0dHJpYnV0ZSBcIiR7IGF0dHJpYnV0ZU5hbWUgfVwiIG5vdCBmb3VuZC4uLiBpZ25vcmluZy4uLmApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlfSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc0F0dHJpYnV0ZVJlZmxlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUuY2FsbCh0aGlzLCBhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlXSBhcyBBdHRyaWJ1dGVSZWZsZWN0b3IpKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgcmVmbGVjdG9yLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogcmVmbGVjdG9yIHtAbGluayBfcmVmbGVjdFByb3BlcnR5fS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHl9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSB7XG5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayBpcyBjYWxsZWQgc3luY2hyb25vdXNseSwgd2UgY2FuIGNhdGNoIHRoZSBzdGF0ZSB0aGVyZVxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHldIGFzIFByb3BlcnR5UmVmbGVjdG9yKShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2UgYW4gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIG5vdGlmaWVyLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogbm90aWZpZXIge0BsaW5rIF9ub3RpZnlQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJhaXNlIGFuIGV2ZW50IGZvclxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkge1xuXG4gICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eU5vdGlmaWVyKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeV0gYXMgUHJvcGVydHlOb3RpZmllcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGNvbXBvbmVudCdzIHJlbmRlciByb290XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSByZW5kZXIgcm9vdCBpcyB3aGVyZSB0aGUge0BsaW5rIHJlbmRlcn0gbWV0aG9kIHdpbGwgYXR0YWNoIGl0cyBET00gb3V0cHV0LiBXaGVuIHVzaW5nIHRoZSBjb21wb25lbnRcbiAgICAgKiB3aXRoIHNoYWRvdyBtb2RlLCBpdCB3aWxsIGJlIGEge0BsaW5rIFNoYWRvd1Jvb3R9LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGl0c2VsZi5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY3JlYXRlUmVuZGVyUm9vdCAoKTogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zaGFkb3dcbiAgICAgICAgICAgID8gdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSlcbiAgICAgICAgICAgIDogdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBjb21wb25lbnQncyBzdHlsZXMgdG8gaXRzIHtAbGluayByZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH0gaW5zdGFuY2Ugd2lsbCBiZSBhZG9wdGVkXG4gICAgICogYnkgdGhlIHtAbGluayBTaGFkb3dSb290fS4gSWYgbm90LCBhIHN0eWxlIGVsZW1lbnQgaXMgY3JlYXRlZCBhbmQgYXR0YWNoZWQgdG8gdGhlIHtAbGluayBTaGFkb3dSb290fS4gSWYgdGhlXG4gICAgICogY29tcG9uZW50IGlzIG5vdCB1c2luZyBzaGFkb3cgbW9kZSwgYSBzY3JpcHQgdGFnIHdpbGwgYmUgYXBwZW5kZWQgdG8gdGhlIGRvY3VtZW50J3MgYDxoZWFkPmAuIEZvciBtdWx0aXBsZVxuICAgICAqIGluc3RhbmNlcyBvZiB0aGUgc2FtZSBjb21wb25lbnQgb25seSBvbmUgc3R5bGVzaGVldCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYWRvcHRTdHlsZXMgKCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuICAgICAgICBjb25zdCBzdHlsZVNoZWV0ID0gY29uc3RydWN0b3Iuc3R5bGVTaGVldDtcbiAgICAgICAgY29uc3Qgc3R5bGVFbGVtZW50ID0gY29uc3RydWN0b3Iuc3R5bGVFbGVtZW50O1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBjb25zdHJ1Y3Rvci5zdHlsZXM7XG5cbiAgICAgICAgaWYgKHN0eWxlU2hlZXQpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIHBhcnQgb25jZSB3ZSBoYXZlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgKENocm9tZSA3MylcbiAgICAgICAgICAgIGlmICghY29uc3RydWN0b3Iuc2hhZG93KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMuaW5jbHVkZXMoc3R5bGVTaGVldCkpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW1xuICAgICAgICAgICAgICAgICAgICAuLi4oZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVTaGVldFxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgd29yayBvbmNlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJyaXZlXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9jb25zdHJ1Y3Qtc3R5bGVzaGVldHMvXG4gICAgICAgICAgICAgICAgKHRoaXMucmVuZGVyUm9vdCBhcyBTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMgPSBbc3R5bGVTaGVldF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChzdHlsZUVsZW1lbnQpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB3ZSBkb24ndCBkdXBsaWNhdGUgc3R5bGVzaGVldHMgZm9yIG5vbi1zaGFkb3cgZWxlbWVudHNcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlQWxyZWFkeUFkZGVkID0gY29uc3RydWN0b3Iuc2hhZG93XG4gICAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgICAgIDogQXJyYXkuZnJvbShkb2N1bWVudC5zdHlsZVNoZWV0cykuZmluZChzdHlsZSA9PiBzdHlsZS50aXRsZSA9PT0gY29uc3RydWN0b3Iuc2VsZWN0b3IpICYmIHRydWUgfHwgZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChzdHlsZUFscmVhZHlBZGRlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBjbG9uZSB0aGUgY2FjaGVkIHN0eWxlIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gc3R5bGVFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKGNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb290LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgYXR0cmlidXRlIHJlZmxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBubyB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgYXR0cmlidXRlIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLmZyb21BdHRyaWJ1dGUuY2FsbCh0aGlzLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiB0aGlzXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGhhdmUgYSBkZWNsYXJhdGlvblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gaWYgdGhlIGRlZmF1bHQgcmVmbGVjdG9yIGlzIHVzZWQsIHdlIG5lZWQgdG8gY2hlY2sgaWYgYW4gYXR0cmlidXRlIGZvciB0aGlzIHByb3BlcnR5IGV4aXN0c1xuICAgICAgICAvLyBpZiBub3QsIHdlIHdvbid0IHJlZmxlY3RcbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlY2xhcmF0aW9uLmF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHksIGl0J3MgYSBzdHJpbmdcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlIGFzIHN0cmluZztcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci50b0F0dHJpYnV0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlKTtcblxuICAgICAgICAvLyB1bmRlZmluZWQgbWVhbnMgZG9uJ3QgY2hhbmdlXG4gICAgICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIG1lYW5zIHJlbW92ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGVsc2UgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgcHJvcGVydHktY2hhbmdlZCBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5XG4gICAgICogQHBhcmFtIG9sZFZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBjcmVhdGVFdmVudE5hbWUocHJvcGVydHlLZXksICcnLCAnY2hhbmdlZCcpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIGxpZmVjeWNsZSBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZSBUaGUgbGlmZWN5Y2xlIGZvciB3aGljaCB0byByYWlzZSB0aGUgZXZlbnQgKHdpbGwgYmUgdGhlIGV2ZW50IG5hbWUpXG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeUxpZmVjeWNsZSAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbD86IG9iamVjdCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQobGlmZWN5Y2xlLCB7XG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIC4uLihkZXRhaWwgPyB7IGRldGFpbDogZGV0YWlsIH0gOiB7fSlcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW4gKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLmxpc3RlbmVycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbGlzdGVuZXIpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEZWNsYXJhdGlvbjogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgY2xhc3MncyBzdGF0aWMgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW50byBhbiBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGV2ZW50OiBkZWNsYXJhdGlvbi5ldmVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBkZWNsYXJhdGlvbi5vcHRpb25zLFxuXG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aGUgY29tcG9uZW50cyBsaXN0ZW5lciBtZXRob2QgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6ICh0aGlzW2xpc3RlbmVyIGFzIGtleW9mIHRoaXNdIGFzIHVua25vd24gYXMgRXZlbnRMaXN0ZW5lcikuYmluZCh0aGlzKSxcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnQgdGFyZ2V0IGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICB0YXJnZXQ6IChkZWNsYXJhdGlvbi50YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgID8gKHR5cGVvZiBkZWNsYXJhdGlvbi50YXJnZXQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGRlY2xhcmF0aW9uLnRhcmdldC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgYm91bmQgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRhcmdldFxuICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmV2ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGluIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLnB1c2goaW5zdGFuY2VEZWNsYXJhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5ldmVudCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVucXVldWUgYSByZXF1ZXN0IGZvciBhbiBhc3luY2hyb25vdXMgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2VucXVldWVVcGRhdGUgKCkge1xuXG4gICAgICAgIGxldCByZXNvbHZlOiAocmVzdWx0OiBib29sZWFuKSA9PiB2b2lkO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVxdWVzdCA9IHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgLy8gbWFyayB0aGUgY29tcG9uZW50IGFzIGhhdmluZyByZXF1ZXN0ZWQgYW4gdXBkYXRlLCB0aGUge0BsaW5rIF9yZXF1ZXN0VXBkYXRlfVxuICAgICAgICAvLyBtZXRob2Qgd2lsbCBub3QgZW5xdWV1ZSBhIGZ1cnRoZXIgcmVxdWVzdCBmb3IgdXBkYXRlIGlmIG9uZSBpcyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzID0+IHJlc29sdmUgPSByZXMpO1xuXG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB1cGRhdGUgdG8gcmVzb2x2ZVxuICAgICAgICAvLyBgYXdhaXRgIGlzIGFzeW5jaHJvbm91cyBhbmQgd2lsbCByZXR1cm4gZXhlY3V0aW9uIHRvIHRoZSB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gbWV0aG9kXG4gICAgICAgIC8vIGFuZCBlc3NlbnRpYWxseSBhbGxvd3MgdXMgdG8gYmF0Y2ggbXVsdGlwbGUgc3luY2hyb25vdXMgcHJvcGVydHkgY2hhbmdlcywgYmVmb3JlIHRoZVxuICAgICAgICAvLyBleGVjdXRpb24gY2FuIHJlc3VtZSBoZXJlXG4gICAgICAgIGF3YWl0IHByZXZpb3VzUmVxdWVzdDtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zY2hlZHVsZVVwZGF0ZSgpO1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdXBkYXRlIG1heSBiZSBzY2hlZHVsZWQgYXN5bmNocm9ub3VzbHkgYXMgd2VsbFxuICAgICAgICBpZiAocmVzdWx0KSBhd2FpdCByZXN1bHQ7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgbmV3IHtAbGluayBfdXBkYXRlUmVxdWVzdH0gYWZ0ZXIgdGhlIHJlc3VsdCBvZiB0aGUgY3VycmVudCB1cGRhdGUgcmVzb2x2ZXNcbiAgICAgICAgcmVzb2x2ZSEoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NoZWR1bGUgdGhlIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNjaGVkdWxlcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYXMgc29vbiBhcyBwb3NzaWJsZSBhbmQgYWxsIGNvbnNlY3V0aXZlIHVwZGF0ZXNcbiAgICAgKiBqdXN0IGJlZm9yZSB0aGUgbmV4dCBmcmFtZS4gSW4gdGhlIGxhdHRlciBjYXNlIGl0IHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgKiB0aGUgdXBkYXRlIGlzIGRvbmUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NjaGVkdWxlVXBkYXRlICgpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzY2hlZHVsZSB0aGUgdXBkYXRlIHZpYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdG8gYXZvaWQgbXVsdGlwbGUgcmVkcmF3cyBwZXIgZnJhbWVcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21wb25lbnQgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEludm9rZXMge0BsaW5rIHVwZGF0ZUNhbGxiYWNrfSBhZnRlciBwZXJmb3JtaW5nIHRoZSB1cGRhdGUgYW5kIGNsZWFucyB1cCB0aGUgY29tcG9uZW50XG4gICAgICogc3RhdGUuIER1cmluZyB0aGUgZmlyc3QgdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVzIHdpbGwgYmUgYWRkZWQuIERpc3BhdGNoZXMgdGhlIHVwZGF0ZVxuICAgICAqIGxpZmVjeWNsZSBldmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcGVyZm9ybVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgLy8gd2UgaGF2ZSB0byB3YWl0IHVudGlsIHRoZSBjb21wb25lbnQgaXMgY29ubmVjdGVkIGJlZm9yZSB3ZSBjYW4gZG8gYW55IHVwZGF0ZXNcbiAgICAgICAgLy8gdGhlIHtAbGluayBjb25uZWN0ZWRDYWxsYmFja30gd2lsbCBjYWxsIHtAbGluayByZXF1ZXN0VXBkYXRlfSBpbiBhbnkgY2FzZSwgc28gd2UgY2FuXG4gICAgICAgIC8vIHNpbXBseSBieXBhc3MgYW55IGFjdHVhbCB1cGRhdGUgYW5kIGNsZWFuLXVwIHVudGlsIHRoZW5cbiAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBwYXNzIGEgY29weSBvZiB0aGUgcHJvcGVydHkgY2hhbmdlcyB0byB0aGUgdXBkYXRlIG1ldGhvZCwgc28gcHJvcGVydHkgY2hhbmdlc1xuICAgICAgICAgICAgLy8gYXJlIGF2YWlsYWJsZSBpbiBhbiBvdmVycmlkZGVuIHVwZGF0ZSBtZXRob2RcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKGNoYW5nZXMpO1xuXG4gICAgICAgICAgICAvLyByZXNldCBwcm9wZXJ0eSBtYXBzIGRpcmVjdGx5IGFmdGVyIHRoZSB1cGRhdGUsIHNvIGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGVDYWxsYmFja1xuICAgICAgICAgICAgLy8gY2FuIGJlIHJlY29yZGVkIGZvciB0aGUgbmV4dCB1cGRhdGUsIHdoaWNoIGhhcyB0byBiZSB0cmlnZ2VyZWQgbWFudWFsbHkgdGhvdWdoXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSB3ZSBhZG9wdCB0aGUgZWxlbWVudCdzIHN0eWxlcyBhbmQgc2V0IHVwIGRlY2xhcmVkIGxpc3RlbmVyc1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9hZG9wdFN0eWxlcygpO1xuXG4gICAgICAgICAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnMgYWZ0ZXIgdGhlIHVwZGF0ZSwgdGhpcyB3YXkgd2UgZW5zdXJlIGFsbCBET00gaXMgcmVuZGVyZWQsIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgLy8gYXJlIHVwLXRvLWRhdGUgYW5kIGFueSB1c2VyLWNyZWF0ZWQgb2JqZWN0cyAoZS5nLiB3b3JrZXJzKSB3aWxsIGJlIGNyZWF0ZWQgaW4gYW5cbiAgICAgICAgICAgICAgICAvLyBvdmVycmlkZGVuIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soY2hhbmdlcywgIXRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ3VwZGF0ZScsIHsgY2hhbmdlczogY2hhbmdlcywgZmlyc3RVcGRhdGU6ICF0aGlzLl9oYXNVcGRhdGVkIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hcmsgY29tcG9uZW50IGFzIHVwZGF0ZWQgKmFmdGVyKiB0aGUgdXBkYXRlIHRvIHByZXZlbnQgaW5maW50ZSBsb29wcyBpbiB0aGUgdXBkYXRlIHByb2Nlc3NcbiAgICAgICAgLy8gTi5CLjogYW55IHByb3BlcnR5IGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGUgd2lsbCBub3QgdHJpZ2dlciBhbm90aGVyIHVwZGF0ZVxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICB9XG59XG4iLCIvKipcbiAqIEEgc2ltcGxlIGNzcyB0ZW1wbGF0ZSBsaXRlcmFsIHRhZ1xuICpcbiAqIEByZW1hcmtzXG4gKiBUaGUgdGFnIGl0c2VsZiBkb2Vzbid0IGRvIGFueXRoaW5nIHRoYXQgYW4gdW50YWdnZWQgdGVtcGxhdGUgbGl0ZXJhbCB3b3VsZG4ndCBkbywgYnV0IGl0IGNhbiBiZSB1c2VkIGJ5XG4gKiBlZGl0b3IgcGx1Z2lucyB0byBpbmZlciB0aGUgXCJ2aXJ0dWFsIGRvY3VtZW50IHR5cGVcIiB0byBwcm92aWRlIGNvZGUgY29tcGxldGlvbiBhbmQgaGlnaGxpZ2h0aW5nLiBJdCBjb3VsZFxuICogYWxzbyBiZSB1c2VkIGluIHRoZSBmdXR1cmUgdG8gbW9yZSBzZWN1cmVseSBjb252ZXJ0IHN1YnN0aXR1dGlvbnMgaW50byBzdHJpbmdzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcbiAqXG4gKiBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuICogICBkaXNwbGF5OiBibG9jaztcbiAqICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAqICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbiAqIGA7XG4gKlxuICogY29uc3QgbWl4aW5Ib3ZlciA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBjc3NgXG4gKiAkeyBzZWxlY3RvciB9OmhvdmVyIHtcbiAqICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuICogfVxuICogYDtcbiAqXG4gKiBjb25zdCBzdHlsZXMgPSBjc3NgXG4gKiA6aG9zdCB7XG4gKiAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICAkeyBtaXhpbkJveCgpIH1cbiAqIH1cbiAqICR7IG1peGluSG92ZXIoJzpob3N0JykgfVxuICogOjpzbG90dGVkKCopIHtcbiAqICAgbWFyZ2luOiAwO1xuICogfVxuICogYDtcbiAqXG4gKiAvLyB3aWxsIHByb2R1Y2UuLi5cbiAqIDpob3N0IHtcbiAqIC0taG92ZXItY29sb3I6IGdyZWVuO1xuICogZGlzcGxheTogYmxvY2s7XG4gKlxuICogZGlzcGxheTogYmxvY2s7XG4gKiBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogYm9yZGVyOiAxcHggc29saWQgc2lsdmVyO1xuICpcbiAqIH1cbiAqXG4gKiA6aG9zdDpob3ZlciB7XG4gKiBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKlxuICogOjpzbG90dGVkKCopIHtcbiAqIG1hcmdpbjogMDtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgY3NzID0gKGxpdGVyYWxzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uc3Vic3RpdHV0aW9uczogYW55W10pID0+IHtcblxuICAgIHJldHVybiBzdWJzdGl0dXRpb25zLnJlZHVjZSgocHJldjogc3RyaW5nLCBjdXJyOiBhbnksIGk6IG51bWJlcikgPT4gcHJldiArIGN1cnIgKyBsaXRlcmFsc1tpICsgMV0sIGxpdGVyYWxzWzBdKTtcbn07XG5cbi8vIGNvbnN0IGNvbG9yID0gJ2dyZWVuJztcblxuLy8gY29uc3QgbWl4aW5Cb3ggPSAoYm9yZGVyV2lkdGg6IHN0cmluZyA9ICcxcHgnLCBib3JkZXJDb2xvcjogc3RyaW5nID0gJ3NpbHZlcicpID0+IGNzc2Bcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4vLyAgIGJvcmRlcjogJHtib3JkZXJXaWR0aH0gc29saWQgJHtib3JkZXJDb2xvcn07XG4vLyBgO1xuXG4vLyBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2Bcbi8vICR7IHNlbGVjdG9yIH06aG92ZXIge1xuLy8gICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4vLyB9XG4vLyBgO1xuXG4vLyBjb25zdCBzdHlsZXMgPSBjc3NgXG4vLyA6aG9zdCB7XG4vLyAgIC0taG92ZXItY29sb3I6ICR7IGNvbG9yIH07XG4vLyAgIGRpc3BsYXk6IGJsb2NrO1xuLy8gICAkeyBtaXhpbkJveCgpIH1cbi8vIH1cblxuLy8gJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG5cbi8vIDo6c2xvdHRlZCgqKSB7XG4vLyAgIG1hcmdpbjogMDtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4iLCJleHBvcnQgY29uc3QgQXJyb3dVcCA9ICdBcnJvd1VwJztcbmV4cG9ydCBjb25zdCBBcnJvd0Rvd24gPSAnQXJyb3dEb3duJztcbmV4cG9ydCBjb25zdCBBcnJvd0xlZnQgPSAnQXJyb3dMZWZ0JztcbmV4cG9ydCBjb25zdCBBcnJvd1JpZ2h0ID0gJ0Fycm93UmlnaHQnO1xuZXhwb3J0IGNvbnN0IEVudGVyID0gJ0VudGVyJztcbmV4cG9ydCBjb25zdCBFc2NhcGUgPSAnRXNjYXBlJztcbmV4cG9ydCBjb25zdCBTcGFjZSA9ICcgJztcbmV4cG9ydCBjb25zdCBUYWIgPSAnVGFiJztcbmV4cG9ydCBjb25zdCBCYWNrc3BhY2UgPSAnQmFja3NwYWNlJztcbmV4cG9ydCBjb25zdCBBbHQgPSAnQWx0JztcbmV4cG9ydCBjb25zdCBTaGlmdCA9ICdTaGlmdCc7XG5leHBvcnQgY29uc3QgQ29udHJvbCA9ICdDb250cm9sJztcbmV4cG9ydCBjb25zdCBNZXRhID0gJ01ldGEnO1xuIiwiaW1wb3J0IHsgQXJyb3dEb3duLCBBcnJvd0xlZnQsIEFycm93UmlnaHQsIEFycm93VXAgfSBmcm9tICcuL2tleXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RJdGVtIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVJdGVtQ2hhbmdlPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBDdXN0b21FdmVudCB7XG4gICAgdHlwZTogJ2FjdGl2ZS1pdGVtLWNoYW5nZSc7XG4gICAgZGV0YWlsOiB7XG4gICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGl0ZW06IFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbnR5cGUgTGlzdEVudHJ5PFQgZXh0ZW5kcyBMaXN0SXRlbT4gPSBbbnVtYmVyIHwgdW5kZWZpbmVkLCBUIHwgdW5kZWZpbmVkXTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpc3RLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBFdmVudFRhcmdldCB7XG5cbiAgICBwcm90ZWN0ZWQgYWN0aXZlSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJdGVtOiBUIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGxpc3RlbmVyczogTWFwPHN0cmluZywgRXZlbnRMaXN0ZW5lcj4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgaXRlbVR5cGU6IGFueTtcblxuICAgIHB1YmxpYyBpdGVtczogVFtdO1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwdWJsaWMgaG9zdDogSFRNTEVsZW1lbnQsXG4gICAgICAgIGl0ZW1zOiBOb2RlTGlzdE9mPFQ+LFxuICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJykge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IEFycmF5LmZyb20oaXRlbXMpO1xuICAgICAgICB0aGlzLml0ZW1UeXBlID0gdGhpcy5pdGVtc1swXSAmJiB0aGlzLml0ZW1zWzBdLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHRoaXMuYmluZEhvc3QoKTtcbiAgICB9XG5cbiAgICBnZXRBY3RpdmVJdGVtICgpOiBUIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJdGVtO1xuICAgIH07XG5cbiAgICBzZXRBY3RpdmVJdGVtIChpdGVtOiBULCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBMaXN0RW50cnk8VD4gPSBbXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaW5kZXggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmRleCA+IC0xID8gaXRlbSA6IHVuZGVmaW5lZFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXROZXh0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXROZXh0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldFByZXZpb3VzSXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRQcmV2aW91c0VudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRGaXJzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0Rmlyc3RFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0TGFzdEl0ZW1BY3RpdmUgKGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0TGFzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IFtwcmV2LCBuZXh0XSA9ICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSA/IFtBcnJvd0xlZnQsIEFycm93UmlnaHRdIDogW0Fycm93VXAsIEFycm93RG93bl07XG4gICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBwcmV2OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQcmV2aW91c0l0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgbmV4dDpcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TmV4dEl0ZW1BY3RpdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIGNvbnN0IHRhcmdldDogVCB8IG51bGwgPSBldmVudC50YXJnZXQgYXMgVCB8IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMuaXRlbVR5cGUgJiYgdGFyZ2V0IGluc3RhbmNlb2YgdGhpcy5pdGVtVHlwZSAmJiAhdGFyZ2V0IS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0IGFzIFQsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRm9jdXMgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlIChwcmV2aW91c0luZGV4OiBudW1iZXIgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICBjb25zdCBldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUPiA9IG5ldyBDdXN0b21FdmVudCgnYWN0aXZlLWl0ZW0tY2hhbmdlJywge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiAodHlwZW9mIHByZXZpb3VzSW5kZXggPT09ICdudW1iZXInKSA/IHRoaXMuaXRlbXNbcHJldmlvdXNJbmRleF0gOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHRoaXMuYWN0aXZlSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuYWN0aXZlSXRlbVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgQWN0aXZlSXRlbUNoYW5nZTxUPjtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRFbnRyeUFjdGl2ZSAoZW50cnk6IExpc3RFbnRyeTxUPiwgaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dID0gZW50cnk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldE5leHRFbnRyeSAoZnJvbUluZGV4PzogbnVtYmVyKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICBmcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICA/IGZyb21JbmRleFxuICAgICAgICAgICAgOiAodHlwZW9mIHRoaXMuYWN0aXZlSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmVJbmRleFxuICAgICAgICAgICAgICAgIDogLTE7XG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5pdGVtcy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgbmV4dEluZGV4ID0gZnJvbUluZGV4ICsgMTtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gdGhpcy5pdGVtc1tuZXh0SW5kZXhdO1xuXG4gICAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsYXN0SW5kZXggJiYgbmV4dEl0ZW0gJiYgbmV4dEl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zWysrbmV4dEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAobmV4dEl0ZW0gJiYgIW5leHRJdGVtLmRpc2FibGVkKSA/IFtuZXh0SW5kZXgsIG5leHRJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRQcmV2aW91c0VudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAwO1xuXG4gICAgICAgIGxldCBwcmV2SW5kZXggPSBmcm9tSW5kZXggLSAxO1xuICAgICAgICBsZXQgcHJldkl0ZW0gPSB0aGlzLml0ZW1zW3ByZXZJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKHByZXZJbmRleCA+IDAgJiYgcHJldkl0ZW0gJiYgcHJldkl0ZW0uZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgcHJldkl0ZW0gPSB0aGlzLml0ZW1zWy0tcHJldkluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAocHJldkl0ZW0gJiYgIXByZXZJdGVtLmRpc2FibGVkKSA/IFtwcmV2SW5kZXgsIHByZXZJdGVtXSA6IFt0aGlzLmFjdGl2ZUluZGV4LCB0aGlzLmFjdGl2ZUl0ZW1dO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRGaXJzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldE5leHRFbnRyeSgtMSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldExhc3RFbnRyeSAoKTogTGlzdEVudHJ5PFQ+IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcmV2aW91c0VudHJ5KHRoaXMuaXRlbXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYmluZEhvc3QgKCkge1xuXG4gICAgICAgIC8vIFRPRE86IGVuYWJsZSByZWNvbm5lY3RpbmcgdGhlIGhvc3QgZWxlbWVudD8gbm8gbmVlZCBpZiBGb2N1c01hbmFnZXIgaXMgY3JlYXRlZCBpbiBjb25uZWN0ZWRDYWxsYmFja1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBNYXAoW1xuICAgICAgICAgICAgWydmb2N1c2luJywgdGhpcy5oYW5kbGVGb2N1cy5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJdLFxuICAgICAgICAgICAgWydrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2Vkb3duLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2Rpc2Nvbm5lY3RlZCcsIHRoaXMudW5iaW5kSG9zdC5iaW5kKHRoaXMpXVxuICAgICAgICBdKTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1bmJpbmRIb3N0ICgpIHtcblxuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHRoaXMuaG9zdC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZvY3VzS2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgTGlzdEtleU1hbmFnZXI8VD4ge1xuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgc3VwZXIuc2V0RW50cnlBY3RpdmUoZW50cnksIGludGVyYWN0aXZlKTtcblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJdGVtICYmIGludGVyYWN0aXZlKSB0aGlzLmFjdGl2ZUl0ZW0uZm9jdXMoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50PEljb24+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWljb24nLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICB3aWR0aDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBwYWRkaW5nOiBjYWxjKCh2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pIC0gdmFyKC0tZm9udC1zaXplLCAxZW0pKSAvIDIpO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIH1cbiAgICBzdmcge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICBsaW5lLWhlaWdodDogaW5oZXJpdDtcbiAgICAgICAgZm9udC1zaXplOiBpbmhlcml0O1xuICAgICAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgICAgICAgZmlsbDogdmFyKC0taWNvbi1jb2xvciwgY3VycmVudENvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PXVuaV0pIHtcbiAgICAgICAgcGFkZGluZzogMGVtO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9bWF0XSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9ZWldKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoZWxlbWVudCkgPT4ge1xuICAgICAgICBjb25zdCBzZXQgPSBlbGVtZW50LnNldDtcbiAgICAgICAgY29uc3QgaWNvbiA9IChzZXQgPT09ICdtYXQnKVxuICAgICAgICAgICAgPyBgaWNfJHsgZWxlbWVudC5pY29uIH1fMjRweGBcbiAgICAgICAgICAgIDogKHNldCA9PT0gJ2VpJylcbiAgICAgICAgICAgICAgICA/IGBlaS0keyBlbGVtZW50Lmljb24gfS1pY29uYFxuICAgICAgICAgICAgICAgIDogZWxlbWVudC5pY29uO1xuXG4gICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICA8c3ZnIGZvY3VzYWJsZT1cImZhbHNlXCI+XG4gICAgICAgICAgICA8dXNlIGhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIlxuICAgICAgICAgICAgeGxpbms6aHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiIC8+XG4gICAgICAgIDwvc3ZnPmA7XG4gICAgfVxufSlcbmV4cG9ydCBjbGFzcyBJY29uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIGZvciBjYWNoaW5nIGFuIGljb24gc2V0J3Mgc3ByaXRlIHVybFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgX3Nwcml0ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHN2ZyBzcHJpdGUgdXJsIGZvciB0aGUgcmVxdWVzdGVkIGljb24gc2V0XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzcHJpdGUgdXJsIGZvciBhbiBpY29uIHNldCBjYW4gYmUgc2V0IHRocm91Z2ggYSBgbWV0YWAgdGFnIGluIHRoZSBodG1sIGRvY3VtZW50LiBZb3UgY2FuIGRlZmluZVxuICAgICAqIGN1c3RvbSBpY29uIHNldHMgYnkgY2hvc2luZyBhbiBpZGVudGlmaWVyIChzdWNoIGFzIGA6bXlzZXRgIGluc3RlYWQgb2YgYDpmYWAsIGA6bWF0YCBvciBgOmllYCkgYW5kXG4gICAgICogY29uZmlndXJpbmcgaXRzIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhZG9jdHlwZSBodG1sPlxuICAgICAqIDxodG1sPlxuICAgICAqICAgIDxoZWFkPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgbXVsdGlwbGUgc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpmYVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9mb250LWF3ZXNvbWUvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTptYXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvbWF0ZXJpYWwvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTplaVwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL2V2aWwtaWNvbnMvc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBjdXN0b20gc3ZnIHNwcml0ZXMgLS0+XG4gICAgICogICAgPG1ldGEgbmFtZT1cInVpLWljb246c3ZnLXNwcml0ZTpteXNldFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbi9zcHJpdGVzL215c2V0L215X3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwvaGVhZD5cbiAgICAgKiAgICAuLi5cbiAgICAgKiA8L2h0bWw+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBXaGVuIHVzaW5nIHRoZSBpY29uIGVsZW1lbnQsIHNwZWNpZnkgeW91ciBjdXN0b20gaWNvbiBzZXQuXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCEtLSB1c2UgYXR0cmlidXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiBkYXRhLWljb249XCJteV9pY29uX2lkXCIgZGF0YS1zZXQ9XCJteXNldFwiPjwvdWktaWNvbj5cbiAgICAgKiA8IS0tIG9yIHVzZSBwcm9wZXJ0eSBiaW5kaW5ncyB3aXRoaW4gbGl0LWh0bWwgdGVtcGxhdGVzIC0tPlxuICAgICAqIDx1aS1pY29uIC5pY29uPSR7J215X2ljb25faWQnfSAuc2V0PSR7J215c2V0J30+PC91aS1pY29uPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogSWYgbm8gc3ByaXRlIHVybCBpcyBzcGVjaWZpZWQgZm9yIGEgc2V0LCB0aGUgaWNvbiBlbGVtZW50IHdpbGwgYXR0ZW1wdCB0byB1c2UgYW4gc3ZnIGljb24gZnJvbVxuICAgICAqIGFuIGlubGluZWQgc3ZnIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBnZXRTcHJpdGUgKHNldDogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3Nwcml0ZXMuaGFzKHNldCkpIHtcblxuICAgICAgICAgICAgY29uc3QgbWV0YSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYG1ldGFbbmFtZT1cInVpLWljb246c3ByaXRlOiR7IHNldCB9XCJdW2NvbnRlbnRdYCk7XG5cbiAgICAgICAgICAgIGlmIChtZXRhKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVzLnNldChzZXQsIG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50JykhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zcHJpdGVzLmdldChzZXQpIHx8ICcnO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtaWNvbidcbiAgICB9KVxuICAgIGljb24gPSAnaW5mbyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLXNldCdcbiAgICB9KVxuICAgIHNldCA9ICdmYSdcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2ltZycpO1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgJy4uL2ljb24vaWNvbic7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcblxuQGNvbXBvbmVudDxBY2NvcmRpb25IZWFkZXI+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1oZWFkZXInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGFsbDogaW5oZXJpdDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIGZsZXg6IDEgMSAxMDAlO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWRpc2FibGVkPXRydWVdKSB7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9dHJ1ZV0pID4gdWktaWNvbi5leHBhbmQsXG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9ZmFsc2VdKSA+IHVpLWljb24uY29sbGFwc2Uge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8dWktaWNvbiBjbGFzcz1cImNvbGxhcHNlXCIgZGF0YS1pY29uPVwibWludXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICA8dWktaWNvbiBjbGFzcz1cImV4cGFuZFwiIGRhdGEtaWNvbj1cInBsdXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkhlYWRlciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5cbmV4cG9ydCB0eXBlIENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZykgPT4gVGVtcGxhdGVSZXN1bHQ7XG5cbmV4cG9ydCBjb25zdCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlciA9IChkYXRlOiBEYXRlLCBhdXRob3I6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0ID0+IHtcblxuICAgIHJldHVybiBodG1sYCZjb3B5OyBDb3B5cmlnaHQgJHsgZGF0ZS5nZXRGdWxsWWVhcigpIH0gJHsgYXV0aG9yLnRyaW0oKSB9YDtcbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IGNvcHlyaWdodCwgQ29weXJpZ2h0SGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9jb3B5cmlnaHQnO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcblxubGV0IG5leHRBY2NvcmRpb25QYW5lbElkID0gMDtcblxuQGNvbXBvbmVudDxBY2NvcmRpb25QYW5lbD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24taGVhZGVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5IHtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgICBvdmVyZmxvdzogYXV0bztcbiAgICAgICAgdHJhbnNpdGlvbjogaGVpZ2h0IC4ycyBlYXNlLW91dDtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHlbYXJpYS1oaWRkZW49dHJ1ZV0ge1xuICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuICAgIC5jb3B5cmlnaHQge1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW0gMXJlbTtcbiAgICAgICAgY29sb3I6IHZhcigtLWRpc2FibGVkLWNvbG9yLCAnI2NjYycpO1xuICAgICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAocGFuZWwsIGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyKSA9PiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24taGVhZGVyXCJcbiAgICAgICAgcm9sZT1cImhlYWRpbmdcIlxuICAgICAgICBhcmlhLWxldmVsPVwiJHsgcGFuZWwubGV2ZWwgfVwiXG4gICAgICAgIEBjbGljaz0keyBwYW5lbC50b2dnbGUgfT5cbiAgICAgICAgPHNsb3QgbmFtZT1cImhlYWRlclwiPjwvc2xvdD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWJvZHlcIlxuICAgICAgICBpZD1cIiR7IHBhbmVsLmlkIH0tYm9keVwiXG4gICAgICAgIHN0eWxlPVwiaGVpZ2h0OiAkeyBwYW5lbC5jb250ZW50SGVpZ2h0IH07XCJcbiAgICAgICAgcm9sZT1cInJlZ2lvblwiXG4gICAgICAgIGFyaWEtaGlkZGVuPVwiJHsgIXBhbmVsLmV4cGFuZGVkIH1cIlxuICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCIkeyBwYW5lbC5pZCB9LWhlYWRlclwiPlxuICAgICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY29weXJpZ2h0XCI+JHsgY29weXJpZ2h0KG5ldyBEYXRlKCksICdBbGV4YW5kZXIgV2VuZGUnKSB9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIF9oZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwgPSBudWxsO1xuICAgIHByb3RlY3RlZCBfYm9keTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIHByb3RlY3RlZCBnZXQgY29udGVudEhlaWdodCAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gIXRoaXMuZXhwYW5kZWQgP1xuICAgICAgICAgICAgJzBweCcgOlxuICAgICAgICAgICAgdGhpcy5fYm9keSA/XG4gICAgICAgICAgICAgICAgYCR7IHRoaXMuX2JvZHkuc2Nyb2xsSGVpZ2h0IH1weGAgOlxuICAgICAgICAgICAgICAgICdhdXRvJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgbGV2ZWwgPSAxO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IgKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgYHVpLWFjY29yZGlvbi1wYW5lbC0keyBuZXh0QWNjb3JkaW9uUGFuZWxJZCsrIH1gO1xuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICAvLyB3cmFwcGluZyB0aGUgcHJvcGVydHkgY2hhbmdlIGluIHRoZSB3YXRjaCBtZXRob2Qgd2lsbCBkaXNwYXRjaCBhIHByb3BlcnR5IGNoYW5nZSBldmVudFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hlYWRlcikgdGhpcy5faGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRIZWFkZXIodGhpcy5xdWVyeVNlbGVjdG9yKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlLCB3ZSBxdWVyeSB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHlcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcihgIyR7IHRoaXMuaWQgfS1ib2R5YCk7XG5cbiAgICAgICAgICAgIC8vIGhhdmluZyBxdWVyaWVkIHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keSwge0BsaW5rIGNvbnRlbnRIZWlnaHR9IGNhbiBub3cgY2FsY3VsYXRlIHRoZVxuICAgICAgICAgICAgLy8gY29ycmVjdCBoZWlnaHQgb2YgdGhlIHBhbmVsIGJvZHkgZm9yIGFuaW1hdGlvblxuICAgICAgICAgICAgLy8gaW4gb3JkZXIgdG8gcmUtZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGJpbmRpbmcgZm9yIHtAbGluayBjb250ZW50SGVpZ2h0fSB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIGFub3RoZXIgcmVuZGVyICh0aGlzIGlzIGNoZWFwLCBvbmx5IGNvbnRlbnRIZWlnaHQgaGFzIGNoYW5nZWQgYW5kIHdpbGwgYmUgdXBkYXRlZClcbiAgICAgICAgICAgIC8vIGhvd2V2ZXIgd2UgY2Fubm90IHJlcXVlc3QgYW5vdGhlciB1cGRhdGUgd2hpbGUgd2UgYXJlIHN0aWxsIGluIHRoZSBjdXJyZW50IHVwZGF0ZSBjeWNsZVxuICAgICAgICAgICAgLy8gdXNpbmcgYSBQcm9taXNlLCB3ZSBjYW4gZGVmZXIgcmVxdWVzdGluZyB0aGUgdXBkYXRlIHVudGlsIGFmdGVyIHRoZSBjdXJyZW50IHVwZGF0ZSBpcyBkb25lXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodHJ1ZSkudGhlbigoKSA9PiB0aGlzLnJlcXVlc3RVcGRhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgcmVuZGVyIG1ldGhvZCB0byBpbmplY3QgY3VzdG9tIGhlbHBlcnMgaW50byB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICgpIHtcblxuICAgICAgICBzdXBlci5yZW5kZXIoY29weXJpZ2h0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2V0SGVhZGVyIChoZWFkZXI6IEFjY29yZGlvbkhlYWRlciB8IG51bGwpIHtcblxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBoZWFkZXI7XG5cbiAgICAgICAgaWYgKCFoZWFkZXIpIHJldHVybjtcblxuICAgICAgICBoZWFkZXIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2hlYWRlcicpO1xuXG4gICAgICAgIGhlYWRlci5pZCA9IGhlYWRlci5pZCB8fCBgJHsgdGhpcy5pZCB9LWhlYWRlcmA7XG4gICAgICAgIGhlYWRlci5jb250cm9scyA9IGAkeyB0aGlzLmlkIH0tYm9keWA7XG4gICAgICAgIGhlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIGhlYWRlci5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0IHsgQWNjb3JkaW9uSGVhZGVyIH0gZnJvbSAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCAnLi9hY2NvcmRpb24tcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPEFjY29yZGlvbkhlYWRlcj47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICByZWZsZWN0QXR0cmlidXRlOiBmYWxzZVxuICAgIH0pXG4gICAgcm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChBY2NvcmRpb25IZWFkZXIuc2VsZWN0b3IpKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBjc3MgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gY3NzYFxuZGVtby1hcHAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuXG5oZWFkZXIge1xuICBmbGV4OiAwIDAgYXV0bztcbn1cblxubWFpbiB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBwYWRkaW5nOiAxcmVtO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBvdmVyZmxvdzogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgxNXJlbSwgMWZyKSk7XG4gIGdyaWQtZ2FwOiAxcmVtO1xufVxuXG4uaWNvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWZsb3c6IHJvdyB3cmFwO1xufVxuXG4uc2V0dGluZ3MtbGlzdCB7XG4gIHBhZGRpbmc6IDA7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5zZXR0aW5ncy1saXN0IGxpIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuXG51aS1jYXJkIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbiB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWw6bm90KDpmaXJzdC1jaGlsZCkge1xuICBib3JkZXItdG9wOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBoMyB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIHAge1xuICBtYXJnaW46IDFyZW07XG59XG5gO1xuIiwiaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vYXBwJztcblxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlID0gKGVsZW1lbnQ6IEFwcCkgPT4gaHRtbGBcbiAgICA8aGVhZGVyPlxuICAgICAgICA8aDE+RXhhbXBsZXM8L2gxPlxuICAgIDwvaGVhZGVyPlxuXG4gICAgPG1haW4+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5JY29uPC9oMj5cblxuICAgICAgICAgICAgPGgzPkZvbnQgQXdlc29tZTwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jay1vcGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFpbnQtYnJ1c2gnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24tdHJpYW5nbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPlVuaWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYW5nbGUtcmlnaHQtYicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZS1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPk1hdGVyaWFsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb25fcmlnaHQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbWFpbCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2tfb3BlbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlZGl0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2RlbGV0ZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd3YXJuaW5nJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaGVscCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhY2NvdW50X2NpcmNsZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZXJzb24nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5FdmlsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYXBlcmNsaXAnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW5jaWwnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgyPkNoZWNrYm94PC9oMj5cbiAgICAgICAgICAgIDx1aS1jaGVja2JveCAuY2hlY2tlZD0keyB0cnVlIH0+PC91aS1jaGVja2JveD5cblxuICAgICAgICAgICAgPGgyPlRvZ2dsZTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1lbWFpbFwiPk5vdGlmaWNhdGlvbiBlbWFpbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LWVtYWlsXCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1zbXNcIj5Ob3RpZmljYXRpb24gc21zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktc21zXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeVwiPk5vdGlmaWNhdGlvbnM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5XCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkNhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktY2FyZD5cblxuICAgICAgICAgICAgPGgyPkFjdGlvbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1hY3Rpb24tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBzbG90PVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPk1vcmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvdWktYWN0aW9uLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5QbGFpbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1wbGFpbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLXBsYWluLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5UYWJzPC9oMj5cbiAgICAgICAgICAgIDx1aS10YWItbGlzdD5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTFcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTFcIj48c3Bhbj5GaXJzdCBUYWI8L3NwYW4+PC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0yXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0yXCI+U2Vjb25kIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItM1wiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtM1wiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+VGhpcmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi00XCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC00XCI+Rm91cnRoIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgPC91aS10YWItbGlzdD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMVwiPlxuICAgICAgICAgICAgICAgIDxoMz5GaXJzdCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0yXCI+XG4gICAgICAgICAgICAgICAgPGgzPlNlY29uZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSwgZHVvXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWUgY2V0ZXJvc1xuICAgICAgICAgICAgICAgICAgICBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW4gZXN0LCBldCBhdXRlbVxuICAgICAgICAgICAgICAgICAgICBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpIG5hbS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtM1wiPlxuICAgICAgICAgICAgICAgIDxoMz5UaGlyZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkknbSBkaXNhYmxlZCwgeW91IHNob3VsZG4ndCBzZWUgbWUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTRcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rm91cnRoIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+QWNjb3JkaW9uPC9oMj5cblxuICAgICAgICAgICAgPHVpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgaWQ9XCJjdXN0b20tcGFuZWwtaWRcIiBleHBhbmRlZCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBPbmU8L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICBMYXVkZW0gY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3Ryb1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXNhYm8gYW4gZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPkF0IHVzdSBlcGljdXJlaSBhc3NlbnRpb3IsIHB1dGVudCBkaXNzZW50aWV0IHJlcHVkaWFuZGFlIGVhIHF1by4gUHJvIG5lIGRlYml0aXMgcGxhY2VyYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25pZmVydW1xdWUsIGluIHNvbmV0IHZvbHVtdXMgaW50ZXJwcmV0YXJpcyBjdW0uIERvbG9ydW0gYXBwZXRlcmUgbmUgcXVvLiBEaWN0YSBxdWFsaXNxdWUgZW9zXG4gICAgICAgICAgICAgICAgICAgICAgICBlYSwgZWFtIGF0IG51bGxhIHRhbXF1YW0uXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBUd288L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVvIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNldGVyb3MgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuXG4gICAgICAgICAgICAgICAgICAgICAgICBlc3QsIGV0IGF1dGVtIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPlF1aSBzdWFzIHNvbGV0IGNldGVyb3MgY3UsIHBlcnRpbmF4IHZ1bHB1dGF0ZSBkZXRlcnJ1aXNzZXQgZW9zIG5lLiBOZSBpdXMgdmlkZSBudWxsYW0sIGFsaWVudW1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFlIHJlZm9ybWlkYW5zIGN1bSBhZC4gRWEgbWVsaW9yZSBzYXBpZW50ZW0gaW50ZXJwcmV0YXJpcyBlYW0uIENvbW11bmUgZGVsaWNhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHVkaWFuZGFlIGluIGVvcywgcGxhY2VyYXQgaW5jb3JydXB0ZSBkZWZpbml0aW9uZXMgbmVjIGV4LiBDdSBlbGl0ciB0YW50YXMgaW5zdHJ1Y3Rpb3Igc2l0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXUgZXVtIGFsaWEgZ3JhZWNlIG5lZ2xlZ2VudHVyLjwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICA8L3VpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgPGgyPlBvcG92ZXI8L2gyPlxuXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwicG9wb3ZlclwiPlNob3cgUG9wb3ZlcjwvYnV0dG9uPlxuXG4gICAgICAgICAgICA8dWktb3ZlcmxheSB0cmlnZ2VyPVwiI3BvcG92ZXJcIiBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCI+XG4gICAgICAgICAgICAgICAgPCEtLSA8dGVtcGxhdGU+IC0tPlxuICAgICAgICAgICAgICAgICAgICA8aDM+UG9wb3ZlcjwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwPlRoaXMgaXMgdGhlIGNvbnRlbnQgb2YgdGhlIHBvcG92ZXI6ICR7IGVsZW1lbnQuY291bnRlciB9PC9wPlxuICAgICAgICAgICAgICAgIDwhLS0gPC90ZW1wbGF0ZT4gLS0+XG4gICAgICAgICAgICA8L3VpLW92ZXJsYXk+XG5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJvdmVybGF5LXByb2dyYW1tYXRpY1wiIEBjbGljaz0keyBlbGVtZW50LnNob3dPdmVybGF5IH0+U2hvdyBwcm9ncmFtbWF0aWMgb3ZlcmxheTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgIDwvbWFpbj5cbiAgICBgO1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbi8vIHdlIGNhbiBkZWZpbmUgbWl4aW5zIGFzXG5jb25zdCBtaXhpbkNvbnRhaW5lcjogKGJhY2tncm91bmQ/OiBzdHJpbmcpID0+IHN0cmluZyA9IChiYWNrZ3JvdW5kOiBzdHJpbmcgPSAnI2ZmZicpID0+IGNzc2BcbiAgICBiYWNrZ3JvdW5kOiAkeyBiYWNrZ3JvdW5kIH07XG4gICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG5gO1xuXG5jb25zdCBzdHlsZSA9IGNzc2Bcbjpob3N0IHtcbiAgICAtLW1heC13aWR0aDogNDBjaDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZmxvdzogY29sdW1uO1xuICAgIG1heC13aWR0aDogdmFyKC0tbWF4LXdpZHRoKTtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICAgIC8qIHdlIGNhbiBhcHBseSBtaXhpbnMgd2l0aCBzcHJlYWQgc3ludGF4ICovXG4gICAgJHsgbWl4aW5Db250YWluZXIoKSB9XG59XG46OnNsb3R0ZWQoKikge1xuICAgIG1hcmdpbjogMDtcbn1cbmA7XG5cbkBjb21wb25lbnQ8Q2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2FyZCcsXG4gICAgc3R5bGVzOiBbc3R5bGVdLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1jYXJkLWJvZHlcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtZm9vdGVyXCI+PC9zbG90PlxuICAgIDxkaXY+V29ya2VyIGNvdW50ZXI6ICR7IGNhcmQuY291bnRlciB9PC9kaXY+XG4gICAgPGJ1dHRvbj5TdG9wIHdvcmtlcjwvYnV0dG9uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyITogbnVtYmVyO1xuXG4gICAgd29ya2VyITogV29ya2VyO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJykhOyB9XG4gICAgfSlcbiAgICBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ21lc3NhZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud29ya2VyOyB9XG4gICAgfSlcbiAgICBoYW5kbGVNZXNzYWdlIChldmVudDogTWVzc2FnZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNvdW50ZXIgPSBldmVudC5kYXRhKTtcbiAgICB9XG59XG5cbkBjb21wb25lbnQ8QWN0aW9uQ2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWN0aW9uLWNhcmQnLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjdGlvbkNhcmQgZXh0ZW5kcyBDYXJkIHtcblxuICAgIC8vIHdlIGNhbiBpbmhlcml0IHN0eWxlcyBleHBsaWNpdGx5XG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAgICAgICAgJ3Nsb3RbbmFtZT11aS1hY3Rpb24tY2FyZC1hY3Rpb25zXSB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiByaWdodDsgfSdcbiAgICAgICAgXVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlQ2xpY2sgKCkgeyB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogbnVsbCB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKCkgeyB9XG59XG5cbkBjb21wb25lbnQ8UGxhaW5DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1wbGFpbi1jYXJkJyxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgbWF4LXdpZHRoOiA0MGNoO1xuICAgICAgICB9YFxuICAgIF1cbiAgICAvLyBpZiB3ZSBkb24ndCBzcGVjaWZ5IGEgdGVtcGxhdGUsIGl0IHdpbGwgYmUgaW5oZXJpdGVkXG59KVxuZXhwb3J0IGNsYXNzIFBsYWluQ2FyZCBleHRlbmRzIENhcmQgeyB9XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBjb21wb25lbnQsIENvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8Q2hlY2tib3g+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWNoZWNrYm94JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgICAgICB3aWR0aDogMXJlbTtcbiAgICAgICAgICAgIGhlaWdodDogMXJlbTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgICAgICAgICAgYm94LXNpemluZzogY29udGVudC1ib3g7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAuMXMgZWFzZS1pbjtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgI2JmYmZiZik7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgI2JmYmZiZik7XG4gICAgICAgIH1cbiAgICAgICAgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwLjI1cmVtO1xuICAgICAgICAgICAgbGVmdDogMC4xMjVyZW07XG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiAwLjYyNXJlbTtcbiAgICAgICAgICAgIGhlaWdodDogMC4yNXJlbTtcbiAgICAgICAgICAgIGJvcmRlcjogc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IDAgMCB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKTtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC00NWRlZyk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAuMXMgZWFzZS1pbjtcbiAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl0pIC5jaGVjay1tYXJrIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogY2hlY2tib3ggPT4gaHRtbGBcbiAgICA8c3BhbiBjbGFzcz1cImNoZWNrLW1hcmtcIj48L3NwYW4+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDaGVja2JveCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvLyBDaHJvbWUgYWxyZWFkeSByZWZsZWN0cyBhcmlhIHByb3BlcnRpZXMsIGJ1dCBGaXJlZm94IGRvZXNuJ3QsIHNvIHdlIG5lZWQgYSBwcm9wZXJ0eSBkZWNvcmF0b3JcbiAgICAvLyBob3dldmVyLCB3ZSBjYW5ub3QgaW5pdGlhbGl6ZSByb2xlIHdpdGggYSB2YWx1ZSBoZXJlLCBhcyBDaHJvbWUncyByZWZsZWN0aW9uIHdpbGwgY2F1c2UgYW5cbiAgICAvLyBhdHRyaWJ1dGUgY2hhbmdlIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgdGhhdCB3aWxsIHRocm93IGFuIGVycm9yXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3czYy9hcmlhL2lzc3Vlcy82OTFcbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHk8Q2hlY2tib3g+KHtcbiAgICAgICAgLy8gdGhlIGNvbnZlcnRlciB3aWxsIGJlIHVzZWQgdG8gcmVmbGVjdCBmcm9tIHRoZSBjaGVja2VkIGF0dHJpYnV0ZSB0byB0aGUgcHJvcGVydHksIGJ1dCBub3RcbiAgICAgICAgLy8gdGhlIG90aGVyIHdheSBhcm91bmQsIGFzIHdlIGRlZmluZSBhIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbixcbiAgICAgICAgLy8gd2UgY2FuIHVzZSBhIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gdG8gcmVmbGVjdCB0byBtdWx0aXBsZSBhdHRyaWJ1dGVzIGluIGRpZmZlcmVudCB3YXlzXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZnVuY3Rpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJycpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2tleWRvd24nXG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIC8vIFRPRE86IERvY3VtZW50IHRoaXMgdXNlIGNhc2UhXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2N1c3RvbS1lbGVtZW50cy5odG1sI2N1c3RvbS1lbGVtZW50LWNvbmZvcm1hbmNlXG4gICAgICAgIC8vIEhUTUxFbGVtZW50IGhhcyBhIHNldHRlciBhbmQgZ2V0dGVyIGZvciB0YWJJbmRleCwgd2UgZG9uJ3QgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvciB0byByZWZsZWN0IGl0XG4gICAgICAgIC8vIHdlIGFyZSBub3QgYWxsb3dlZCB0byBzZXQgaXQgaW4gdGhlIGNvbnN0cnVjdG9yIHRob3VnaCwgYXMgaXQgY3JlYXRlcyBhIHJlZmxlY3RlZCBhdHRyaWJ1dGUsIHdoaWNoXG4gICAgICAgIC8vIGNhdXNlcyBhbiBlcnJvclxuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcblxuICAgICAgICAvLyB3ZSBpbml0aWFsaXplIHJvbGUgaW4gdGhlIGNvbm5lY3RlZENhbGxiYWNrIGFzIHdlbGwsIHRvIHByZXZlbnQgQ2hyb21lIGZyb20gcmVmbGVjdGluZyBlYXJseVxuICAgICAgICB0aGlzLnJvbGUgPSAnY2hlY2tib3gnO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSBcIi4vcG9zaXRpb25cIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT046IFBvc2l0aW9uID0ge1xuICAgIHRvcDogJycsXG4gICAgbGVmdDogJycsXG4gICAgYm90dG9tOiAnJyxcbiAgICByaWdodDogJycsXG4gICAgd2lkdGg6ICdhdXRvJyxcbiAgICBoZWlnaHQ6ICdhdXRvJyxcbiAgICBtYXhXaWR0aDogJ2F1dG8nLFxuICAgIG1heEhlaWdodDogJ2F1dG8nLFxuICAgIG9mZnNldEhvcml6b250YWw6ICcnLFxuICAgIG9mZnNldFZlcnRpY2FsOiAnJyxcbn07XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgIHByb3RlY3RlZCBhbmltYXRpb25GcmFtZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGRlZmF1bHRQb3NpdGlvbjogUG9zaXRpb247XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFBvc2l0aW9uOiBQb3NpdGlvbiB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBuZXh0UG9zaXRpb246IFBvc2l0aW9uIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyB0YXJnZXQ6IEhUTUxFbGVtZW50LCBkZWZhdWx0UG9zaXRpb246IFBvc2l0aW9uID0gREVGQVVMVF9QT1NJVElPTikge1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdFBvc2l0aW9uID0geyAuLi5ERUZBVUxUX1BPU0lUSU9OLCAuLi5kZWZhdWx0UG9zaXRpb24gfTtcbiAgICB9XG5cbiAgICB1cGRhdGVQb3NpdGlvbiAocG9zaXRpb24/OiBQYXJ0aWFsPFBvc2l0aW9uPikge1xuXG4gICAgICAgIHRoaXMubmV4dFBvc2l0aW9uID0gcG9zaXRpb24gPyB7IC4uLih0aGlzLmN1cnJlbnRQb3NpdGlvbiB8fCB0aGlzLmRlZmF1bHRQb3NpdGlvbiksIC4uLnBvc2l0aW9uIH0gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5uZXh0UG9zaXRpb24gfHwgdGhpcy5nZXRQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRQb3NpdGlvbiB8fCAhdGhpcy5jb21wYXJlUG9zaXRpb25zKHRoaXMuY3VycmVudFBvc2l0aW9uLCBuZXh0UG9zaXRpb24pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseVBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3kgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG5cbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRlZmF1bHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLnRvcCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ubGVmdCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmJvdHRvbSA9IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi5ib3R0b20pO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5yaWdodCA9IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi5yaWdodCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLndpZHRoKTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLmhlaWdodCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLm1heFdpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLm1heFdpZHRoKTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUubWF4SGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLm1heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHBhcnNlU3R5bGUgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XG5cbiAgICAgICAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSA/IGAkeyB2YWx1ZSB9cHhgIDogdmFsdWU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvbXBhcmVQb3NpdGlvbnMgKHBvc2l0aW9uOiBQb3NpdGlvbiwgb3RoZXJQb3NpdGlvbjogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocG9zaXRpb24pO1xuXG4gICAgICAgIHJldHVybiAha2V5cy5maW5kKChrZXkgPT4gcG9zaXRpb25ba2V5IGFzIGtleW9mIFBvc2l0aW9uXSAhPT0gb3RoZXJQb3NpdGlvbltrZXkgYXMga2V5b2YgUG9zaXRpb25dKSk7XG4gICAgfVxufVxuXG4iLCJpbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gXCIuLi9wb3NpdGlvblwiO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTiwgUG9zaXRpb25TdHJhdGVneSB9IGZyb20gXCIuLi9wb3NpdGlvbi1zdHJhdGVneVwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9GSVhFRDogUG9zaXRpb24gPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTixcbiAgICB0b3A6ICc1MHZoJyxcbiAgICBsZWZ0OiAnNTB2dycsXG4gICAgb2Zmc2V0SG9yaXpvbnRhbDogJy01MCUnLFxuICAgIG9mZnNldFZlcnRpY2FsOiAnLTUwJScsXG59O1xuXG5leHBvcnQgY2xhc3MgRml4ZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIGRlZmF1bHRQb3NpdGlvbjogUG9zaXRpb24gPSBERUZBVUxUX1BPU0lUSU9OX0ZJWEVEKSB7XG5cbiAgICAgICAgc3VwZXIodGFyZ2V0LCBkZWZhdWx0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRlZmF1bHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgc3VwZXIuYXBwbHlQb3NpdGlvbihwb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgkeyBwb3NpdGlvbi5vZmZzZXRIb3Jpem9udGFsLCBwb3NpdGlvbi5vZmZzZXRWZXJ0aWNhbCB9KWA7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IGVudW0gQXhpc0FsaWdubWVudCB7XG4gICAgU3RhcnQgPSAnc3RhcnQnLFxuICAgIENlbnRlciA9ICdjZW50ZXInLFxuICAgIEVuZCA9ICdlbmQnXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxpZ25tZW50T2Zmc2V0IHtcbiAgICBob3Jpem9udGFsOiBzdHJpbmc7XG4gICAgdmVydGljYWw6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbGlnbm1lbnQge1xuICAgIGhvcml6b250YWw6IEF4aXNBbGlnbm1lbnQ7XG4gICAgdmVydGljYWw6IEF4aXNBbGlnbm1lbnQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxpZ25tZW50UGFpciB7XG4gICAgdGFyZ2V0OiBBbGlnbm1lbnQ7XG4gICAgb3JpZ2luOiBBbGlnbm1lbnQ7XG4gICAgb2Zmc2V0PzogQWxpZ25tZW50T2Zmc2V0O1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9BTElHTk1FTlRfUEFJUjogQWxpZ25tZW50UGFpciA9IHtcbiAgICBvcmlnaW46IHtcbiAgICAgICAgaG9yaXpvbnRhbDogQXhpc0FsaWdubWVudC5TdGFydCxcbiAgICAgICAgdmVydGljYWw6IEF4aXNBbGlnbm1lbnQuRW5kXG4gICAgfSxcbiAgICB0YXJnZXQ6IHtcbiAgICAgICAgaG9yaXpvbnRhbDogQXhpc0FsaWdubWVudC5TdGFydCxcbiAgICAgICAgdmVydGljYWw6IEF4aXNBbGlnbm1lbnQuU3RhcnRcbiAgICB9XG59O1xuIiwiaW1wb3J0IHsgQWxpZ25tZW50UGFpciwgQXhpc0FsaWdubWVudCwgREVGQVVMVF9BTElHTk1FTlRfUEFJUiB9IGZyb20gXCIuLi9hbGlnbm1lbnRcIjtcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSBcIi4uL3Bvc2l0aW9uXCI7XG5pbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OLCBQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSBcIi4uL3Bvc2l0aW9uLXN0cmF0ZWd5XCI7XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBwcm90ZWN0ZWQgdXBkYXRlTGlzdGVuZXIhOiBFdmVudExpc3RlbmVyO1xuXG4gICAgcHJvdGVjdGVkIGFsaWdubWVudDogQWxpZ25tZW50UGFpcjtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsXG4gICAgICAgIHB1YmxpYyBvcmlnaW46IEhUTUxFbGVtZW50LFxuICAgICAgICBkZWZhdWx0UG9zaXRpb246IFBvc2l0aW9uID0gREVGQVVMVF9QT1NJVElPTixcbiAgICAgICAgYWxpZ25tZW50OiBBbGlnbm1lbnRQYWlyID0gREVGQVVMVF9BTElHTk1FTlRfUEFJUlxuICAgICkge1xuXG4gICAgICAgIHN1cGVyKHRhcmdldCwgZGVmYXVsdFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLmFsaWdubWVudCA9IGFsaWdubWVudDtcblxuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVyID0gKCkgPT4gdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy51cGRhdGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzdHJveSAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy51cGRhdGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luOiBDbGllbnRSZWN0ID0gdGhpcy5vcmlnaW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHRhcmdldDogQ2xpZW50UmVjdCA9IHRoaXMudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0geyAuLi50aGlzLmRlZmF1bHRQb3NpdGlvbiB9O1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5hbGlnbm1lbnQub3JpZ2luLmhvcml6b250YWwpIHtcblxuICAgICAgICAgICAgY2FzZSBBeGlzQWxpZ25tZW50LkNlbnRlcjpcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gb3JpZ2luLmxlZnQgKyBvcmlnaW4ud2lkdGggLyAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEF4aXNBbGlnbm1lbnQuU3RhcnQ6XG4gICAgICAgICAgICAgICAgcG9zaXRpb24ubGVmdCA9IG9yaWdpbi5sZWZ0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEF4aXNBbGlnbm1lbnQuRW5kOlxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLmxlZnQgPSBvcmlnaW4ucmlnaHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKHRoaXMuYWxpZ25tZW50Lm9yaWdpbi52ZXJ0aWNhbCkge1xuXG4gICAgICAgICAgICBjYXNlIEF4aXNBbGlnbm1lbnQuQ2VudGVyOlxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnRvcCA9IG9yaWdpbi50b3AgKyBvcmlnaW4uaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBBeGlzQWxpZ25tZW50LlN0YXJ0OlxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnRvcCA9IG9yaWdpbi50b3A7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgQXhpc0FsaWdubWVudC5FbmQ6XG4gICAgICAgICAgICAgICAgcG9zaXRpb24udG9wID0gb3JpZ2luLmJvdHRvbTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAodGhpcy5hbGlnbm1lbnQudGFyZ2V0Lmhvcml6b250YWwpIHtcblxuICAgICAgICAgICAgY2FzZSBBeGlzQWxpZ25tZW50LkNlbnRlcjpcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gKHBvc2l0aW9uLmxlZnQgYXMgbnVtYmVyKSAtIHRhcmdldC53aWR0aCAvIDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgQXhpc0FsaWdubWVudC5FbmQ6XG4gICAgICAgICAgICAgICAgcG9zaXRpb24ubGVmdCA9IChwb3NpdGlvbi5sZWZ0IGFzIG51bWJlcikgLSB0YXJnZXQud2lkdGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgQXhpc0FsaWdubWVudC5TdGFydDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAodGhpcy5hbGlnbm1lbnQudGFyZ2V0LnZlcnRpY2FsKSB7XG5cbiAgICAgICAgICAgIGNhc2UgQXhpc0FsaWdubWVudC5DZW50ZXI6XG4gICAgICAgICAgICAgICAgcG9zaXRpb24udG9wID0gKHBvc2l0aW9uLnRvcCBhcyBudW1iZXIpIC0gdGFyZ2V0LmhlaWdodCAvIDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgQXhpc0FsaWdubWVudC5FbmQ6XG4gICAgICAgICAgICAgICAgcG9zaXRpb24udG9wID0gKHBvc2l0aW9uLnRvcCBhcyBudW1iZXIpIC0gdGFyZ2V0LmhlaWdodDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBBeGlzQWxpZ25tZW50LlN0YXJ0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogaW5jbHVkZSBvZmZzZXRcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBzdXBlci5hcHBseVBvc2l0aW9uKHsgLi4ucG9zaXRpb24sIHRvcDogJycsIGxlZnQ6ICcnLCBib3R0b206ICcnLCByaWdodDogJycgfSk7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgkeyBwb3NpdGlvbi5sZWZ0IH0sICR7IHBvc2l0aW9uLnRvcCB9KWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tIFwiLi9wb3NpdGlvblwiO1xuaW1wb3J0IHsgUG9zaXRpb25TdHJhdGVneSB9IGZyb20gXCIuL3Bvc2l0aW9uLXN0cmF0ZWd5XCI7XG5pbXBvcnQgeyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSBcIi4vc3RyYXRlZ2llcy9jb25uZWN0ZWQtcG9zaXRpb24tc3RyYXRlZ3lcIjtcbmltcG9ydCB7IEZpeGVkUG9zaXRpb25TdHJhdGVneSB9IGZyb20gXCIuL3N0cmF0ZWdpZXMvZml4ZWQtcG9zaXRpb24tc3RyYXRlZ3lcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvblN0cmF0ZWd5TWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiB7IG5ldyguLi5hcmdzOiBhbnlbXSk6IFBvc2l0aW9uU3RyYXRlZ3kgfTtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT05fU1RSQVRFR0lFUzogUG9zaXRpb25TdHJhdGVneU1hcCA9IHtcbiAgICBmaXhlZDogRml4ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICAgIGNvbm5lY3RlZDogQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbn07XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHJvdGVjdGVkIHN0cmF0ZWdpZXM6IFBvc2l0aW9uU3RyYXRlZ3lNYXAgPSBERUZBVUxUX1BPU0lUSU9OX1NUUkFURUdJRVMpIHsgfVxuXG4gICAgY3JlYXRlUG9zaXRpb25TdHJhdGVneSAodHlwZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IFBvc2l0aW9uU3RyYXRlZ3kge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnN0cmF0ZWdpZXNbdHlwZV0gPyBuZXcgdGhpcy5zdHJhdGVnaWVzW3R5cGVdKC4uLmFyZ3MpIDogbmV3IEZpeGVkUG9zaXRpb25TdHJhdGVneSguLi5hcmdzIGFzIFtIVE1MRWxlbWVudCwgUG9zaXRpb25dKTtcbiAgICB9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIEV2ZW50QmluZGluZyB7XG4gICAgcmVhZG9ubHkgdGFyZ2V0OiBFdmVudFRhcmdldDtcbiAgICByZWFkb25seSB0eXBlOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsO1xuICAgIHJlYWRvbmx5IG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9ucyB8IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V2ZW50QmluZGluZyAoYmluZGluZzogYW55KTogYmluZGluZyBpcyBFdmVudEJpbmRpbmcge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBiaW5kaW5nID09PSAnb2JqZWN0J1xuICAgICAgICAmJiB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS50YXJnZXQgPT09ICdvYmplY3QnXG4gICAgICAgICYmIHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLnR5cGUgPT09ICdzdHJpbmcnXG4gICAgICAgICYmICh0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgfHwgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykubGlzdGVuZXIgPT09ICdvYmplY3QnKTtcbn1cblxuLyoqXG4gKiBBIGNsYXNzIGZvciBtYW5hZ2luZyBldmVudCBsaXN0ZW5lcnNcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBFdmVudE1hbmFnZXIgY2xhc3MgY2FuIGJlIHVzZWQgdG8gaGFuZGxlIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyBvbiBtdWx0aXBsZSB0YXJnZXRzLiBJdCBjYWNoZXMgYWxsIGV2ZW50IGxpc3RlbmVyc1xuICogYW5kIGNhbiByZW1vdmUgdGhlbSBzZXBhcmF0ZWx5IG9yIGFsbCB0b2dldGhlci4gVGhpcyBjYW4gYmUgdXNlZnVsIHdoZW4gZXZlbnQgbGlzdGVuZXJzIG5lZWQgdG8gYmUgYWRkZWQgYW5kIHJlbW92ZWQgZHVyaW5nXG4gKiB0aGUgbGlmZXRpbWUgb2YgYSBjb21wb25lbnQgYW5kIG1ha2VzIG1hbnVhbGx5IHNhdmluZyByZWZlcmVuY2VzIHRvIHRhcmdldHMsIGxpc3RlbmVycyBhbmQgb3B0aW9ucyB1bm5lY2Vzc2FyeS5cbiAqXG4gKiBgYGB0c1xuICogIC8vIGNyZWF0ZSBhbiBFdmVudE1hbmFnZXIgaW5zdGFuY2VcbiAqICBjb25zdCBtYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuICpcbiAqICAvLyB5b3UgY2FuIHNhdmUgYSByZWZlcmVuY2UgKGFuIEV2ZW50QmluZGluZykgdG8gdGhlIGFkZGVkIGV2ZW50IGxpc3RlbmVyIGlmIHlvdSBuZWVkIHRvIG1hbnVhbGx5IHJlbW92ZSBpdCBsYXRlclxuICogIGNvbnN0IGJpbmRpbmcgPSBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudCwgJ3Njcm9sbCcsIChldmVudCkgPT4gey4uLn0pO1xuICpcbiAqICAvLyAuLi5vciBpZ25vcmUgdGhlIHJlZmVyZW5jZSBpZiB5b3UgZG9uJ3QgbmVlZCBpdFxuICogIG1hbmFnZXIubGlzdGVuKGRvY3VtZW50LmJvZHksICdjbGljaycsIChldmVudCkgPT4gey4uLn0pO1xuICpcbiAqICAvLyB5b3UgY2FuIHJlbW92ZSBhIHNwZWNpZmljIGV2ZW50IGxpc3RlbmVyIHVzaW5nIGEgcmVmZXJlbmNlXG4gKiAgbWFuYWdlci51bmxpc3RlbihiaW5kaW5nKTtcbiAqXG4gKiAgLy8gLi4ub3IgcmVtb3ZlIGFsbCBwcmV2aW91c2x5IGFkZGVkIGV2ZW50IGxpc3RlbmVycyBpbiBvbmUgZ29cbiAqICBtYW5hZ2VyLnVubGlzdGVuQWxsKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciB7XG5cbiAgICBwcm90ZWN0ZWQgYmluZGluZ3MgPSBuZXcgU2V0PEV2ZW50QmluZGluZz4oKTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBoYXNCaW5kaW5nIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGFuIEV2ZW50QmluZGluZyBleGlzdHMgdGhhdCBtYXRjaGVzIHRoZSB0YXJnZXQsIHR5cGUsIGxpc3RlbmVyIGFuZCBvcHRpb25zXG4gICAgICovXG4gICAgaGFzQmluZGluZyAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBib29sZWFuO1xuXG4gICAgaGFzQmluZGluZyAoXG4gICAgICAgIHRhcmdldE9yQmluZGluZzogRXZlbnRCaW5kaW5nIHwgRXZlbnRUYXJnZXQsXG4gICAgICAgIHR5cGU/OiBzdHJpbmcsXG4gICAgICAgIGxpc3RlbmVyPzogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnNcbiAgICApOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gKGlzRXZlbnRCaW5kaW5nKHRhcmdldE9yQmluZGluZylcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nLCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKSkgIT09IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbiBleGlzdGluZyBFdmVudEJpbmRpbmcgdGhhdCBtYXRjaGVzIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbiBleGlzdGluZyBFdmVudEJpbmRpbmcgdGhhdCBtYXRjaGVzIHRoZSB0YXJnZXQsIHR5cGUsIGxpc3RlbmVyIGFuZCBvcHRpb25zXG4gICAgICovXG4gICAgZmluZEJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgZmluZEJpbmRpbmcgKFxuICAgICAgICBiaW5kaW5nT3JUYXJnZXQ6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBsZXQgc2VhcmNoQmluZGluZzogRXZlbnRCaW5kaW5nID0gaXNFdmVudEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0KSA/IGJpbmRpbmdPclRhcmdldCA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGxldCBmb3VuZEJpbmRpbmc6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5iaW5kaW5ncy5oYXMoc2VhcmNoQmluZGluZykpIHJldHVybiBzZWFyY2hCaW5kaW5nO1xuXG4gICAgICAgIGZvciAobGV0IGJpbmRpbmcgb2YgdGhpcy5iaW5kaW5ncy52YWx1ZXMoKSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb21wYXJlQmluZGluZ3Moc2VhcmNoQmluZGluZywgYmluZGluZykpIHtcblxuICAgICAgICAgICAgICAgIGZvdW5kQmluZGluZyA9IGJpbmRpbmc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm91bmRCaW5kaW5nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSB0YXJnZXRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgRXZlbnRCaW5kaW5nfSB3aGljaCB3YXMgYWRkZWQgb3IgdW5kZWZpbmVkIGEgbWF0Y2hpbmcgZXZlbnQgYmluZGluZyBhbHJlYWR5IGV4aXN0c1xuICAgICAqL1xuICAgIGxpc3RlbiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICBsaXN0ZW4gKFxuICAgICAgICBiaW5kaW5nT3JUYXJnZXQ6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBjb25zdCBiaW5kaW5nID0gaXNFdmVudEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0KVxuICAgICAgICAgICAgPyBiaW5kaW5nT3JUYXJnZXRcbiAgICAgICAgICAgIDogdGhpcy5jcmVhdGVCaW5kaW5nKGJpbmRpbmdPclRhcmdldCwgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0JpbmRpbmcoYmluZGluZykpIHtcblxuICAgICAgICAgICAgYmluZGluZy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihiaW5kaW5nLnR5cGUsIGJpbmRpbmcubGlzdGVuZXIsIGJpbmRpbmcub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMuYmluZGluZ3MuYWRkKGJpbmRpbmcpO1xuXG4gICAgICAgICAgICByZXR1cm4gYmluZGluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldCBvZiB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgRXZlbnRCaW5kaW5nfSB3aGljaCB3YXMgcmVtb3ZlZCBvciB1bmRlZmluZWQgaWYgbm8gbWF0Y2hpbmcgZXZlbnQgYmluZGluZyBleGlzdHNcbiAgICAgKi9cbiAgICB1bmxpc3RlbiAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgZXZlbnQgbGlzdGVuZXIgZnJvbSB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgdW5saXN0ZW4gKFxuICAgICAgICBiaW5kaW5nT3JUYXJnZXQ6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuXG4gICAgKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBjb25zdCBiaW5kaW5nID0gaXNFdmVudEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0KVxuICAgICAgICAgICAgPyB0aGlzLmZpbmRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgIDogdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmIChiaW5kaW5nKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmRlbGV0ZShiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGVpciB0YXJnZXRzXG4gICAgICovXG4gICAgdW5saXN0ZW5BbGwgKCkge1xuXG4gICAgICAgIHRoaXMuYmluZGluZ3MuZm9yRWFjaChiaW5kaW5nID0+IHRoaXMudW5saXN0ZW4oYmluZGluZykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYW4gRXZlbnQgb24gdGhlIHRhcmdldFxuICAgICAqL1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudDogRXZlbnQpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2hlcyBhIEN1c3RvbUV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuO1xuXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIGV2ZW50T3JUeXBlPzogRXZlbnQgfCBzdHJpbmcsIGRldGFpbD86IFQsIGV2ZW50SW5pdDogUGFydGlhbDxFdmVudEluaXQ+ID0ge30pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoZXZlbnRPclR5cGUgaW5zdGFuY2VvZiBFdmVudCkge1xuXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXZlbnRPclR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE9yVHlwZSEsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICAuLi5ldmVudEluaXQsXG4gICAgICAgICAgICBkZXRhaWxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4ge0BsaW5rIEV2ZW50QmluZGluZ30gb2JqZWN0XG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlQmluZGluZyAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBFdmVudEJpbmRpbmcge1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBsaXN0ZW5lcixcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdHNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgYmluZGluZyBvYmplY3RzIGhhdmUgdGhlIHNhbWUgdGFyZ2V0LCB0eXBlIGxpc3RlbmVyIGFuZCBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUJpbmRpbmdzIChiaW5kaW5nOiBFdmVudEJpbmRpbmcsIG90aGVyOiBFdmVudEJpbmRpbmcpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoYmluZGluZyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHJldHVybiBiaW5kaW5nLnRhcmdldCA9PT0gb3RoZXIudGFyZ2V0XG4gICAgICAgICAgICAmJiBiaW5kaW5nLnR5cGUgPT09IG90aGVyLnR5cGVcbiAgICAgICAgICAgICYmIHRoaXMuY29tcGFyZUxpc3RlbmVycyhiaW5kaW5nLmxpc3RlbmVyLCBvdGhlci5saXN0ZW5lcilcbiAgICAgICAgICAgICYmIHRoaXMuY29tcGFyZU9wdGlvbnMoYmluZGluZy5vcHRpb25zLCBvdGhlci5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0d28gZXZlbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGxpc3RlbmVycyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb21wYXJlTGlzdGVuZXJzIChsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG90aGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIC8vIGNhdGNoZXMgYm90aCBsaXN0ZW5lcnMgYmVpbmcgbnVsbCwgYSBmdW5jdGlvbiBvciB0aGUgc2FtZSBFdmVudExpc3RlbmVyT2JqZWN0XG4gICAgICAgIGlmIChsaXN0ZW5lciA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHRoZSBoYW5kbGVycyBvZiB0d28gRXZlbnRMaXN0ZW5lck9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG90aGVyID09PSAnb2JqZWN0Jykge1xuXG4gICAgICAgICAgICByZXR1cm4gKGxpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50ID09PSAob3RoZXIgYXMgRXZlbnRMaXN0ZW5lck9iamVjdCkuaGFuZGxlRXZlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyIG9wdGlvbnNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgb3B0aW9ucyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb21wYXJlT3B0aW9ucyAob3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucywgb3RoZXI/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggb3B0aW9ucyBiZWluZyB1bmRlZmluZWQgb3Igc2FtZSBib29sZWFuIHZhbHVlXG4gICAgICAgIGlmIChvcHRpb25zID09PSBvdGhlcikgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgLy8gY29tcGFyZXMgdHdvIG9wdGlvbnMgb2JqZWN0c1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY2FwdHVyZSA9PT0gb3RoZXIuY2FwdHVyZVxuICAgICAgICAgICAgICAgICYmIG9wdGlvbnMucGFzc2l2ZSA9PT0gb3RoZXIucGFzc2l2ZVxuICAgICAgICAgICAgICAgICYmIG9wdGlvbnMub25jZSA9PT0gb3RoZXIub25jZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFdmVudEJpbmRpbmcsIEV2ZW50TWFuYWdlciB9IGZyb20gXCIuL2V2ZW50LW1hbmFnZXJcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJlaGF2aW9yIHtcblxuICAgIHByb3RlY3RlZCBfZWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuXG4gICAgZ2V0IGhhc0F0dGFjaGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudCAhPT0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGdldCBlbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCwgLi4uYXJnczogYW55W10pIHtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBkZXRhY2ggKC4uLmFyZ3M6IGFueVtdKSB7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIudW5saXN0ZW5BbGwoKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxpc3RlbiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpIHtcblxuICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIudW5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2ggKGV2ZW50OiBFdmVudCk6IGJvb2xlYW47XG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaDxUID0gYW55PiAoZXZlbnRPclR5cGU/OiBFdmVudCB8IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChldmVudE9yVHlwZSBpbnN0YW5jZW9mIEV2ZW50KVxuICAgICAgICAgICAgICAgID8gdGhpcy5ldmVudE1hbmFnZXIuZGlzcGF0Y2godGhpcy5lbGVtZW50ISwgZXZlbnRPclR5cGUpXG4gICAgICAgICAgICAgICAgOiB0aGlzLmV2ZW50TWFuYWdlci5kaXNwYXRjaCh0aGlzLmVsZW1lbnQhLCBldmVudE9yVHlwZSEsIGRldGFpbCwgZXZlbnRJbml0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBCZWhhdmlvciB9IGZyb20gJy4uL2JlaGF2aW9yJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tIFwiLi9vdmVybGF5XCI7XG5pbXBvcnQgeyBPdmVybGF5U2VydmljZSB9IGZyb20gXCIuL292ZXJsYXktc2VydmljZVwiO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlLCBFc2NhcGUgfSBmcm9tICcuLi9rZXlzJztcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgcHJvdGVjdGVkIG92ZXJsYXlTZXJ2aWNlID0gbmV3IE92ZXJsYXlTZXJ2aWNlKCk7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICBzdXBlci5hdHRhY2goZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCAnZGlhbG9nJyk7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuZWxlbWVudCEsICdrZXlkb3duJywgKGV2ZW50OiBFdmVudCkgPT4gdGhpcy5oYW5kbGVLZXlkb3duKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMuZWxlbWVudCEsICdtb3VzZWRvd24nLCAoZXZlbnQ6IEV2ZW50KSA9PiB0aGlzLmhhbmRsZU1vdXNlZG93bihldmVudCBhcyBNb3VzZUV2ZW50KSk7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRoaXMub3ZlcmxheSwgJ29wZW4tY2hhbmdlZCcsICgpID0+IHRoaXMudXBkYXRlKCkpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpO1xuXG4gICAgICAgIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLm92ZXJsYXkub3BlbiA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBFbnRlcjpcbiAgICAgICAgICAgIGNhc2UgU3BhY2U6XG4gICAgICAgICAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS50b2dnbGVPdmVybGF5KHRoaXMub3ZlcmxheSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRXNjYXBlOlxuICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UuY2xvc2VPdmVybGF5KHRoaXMub3ZlcmxheSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UudG9nZ2xlT3ZlcmxheSh0aGlzLm92ZXJsYXksIGV2ZW50KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUb29sdGlwT3ZlcmxheVRyaWdnZXIgZXh0ZW5kcyBPdmVybGF5VHJpZ2dlciB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBzdXBlcihvdmVybGF5KTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIHJ1biB0aGUgT3ZlcmxheVRyaWdnZXIncyBhdHRhY2ggbWV0aG9kIGFuZCBhZGQgYWxsIGRlZmF1bHQgZXZlbnQgaGFuZGxlcnMuLi4gd2UgZG9uJ3Qgd2FudCB0aGF0IVxuICAgICAgICBzdXBlci5hdHRhY2goZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5LnJvbGUgPSAndG9vbHRpcCc7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aGlzLm92ZXJsYXkuaWQpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VlbnRlcicsICgpID0+IHRoaXMub3BlblRvb2x0aXAoKSk7XG4gICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VsZWF2ZScsICgpID0+IHRoaXMuY2xvc2VUb29sdGlwKCkpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXMnLCAoKSA9PiB0aGlzLm9wZW5Ub29sdGlwKCkpO1xuICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2JsdXInLCAoKSA9PiB0aGlzLmNsb3NlVG9vbHRpcCgpKTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCkge1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpO1xuXG4gICAgICAgIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7IH1cblxuICAgIHByb3RlY3RlZCBvcGVuVG9vbHRpcCAoKSB7IH1cblxuICAgIHByb3RlY3RlZCBjbG9zZVRvb2x0aXAgKCkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZW51T3ZlcmxheVRyaWdnZXIgeyB9XG5cbmV4cG9ydCBjbGFzcyBMaXN0Ym94T3ZlcmxheVRyaWdnZXIgeyB9XG5cbmV4cG9ydCBjbGFzcyBEaWFsb2dPdmVybGF5VHJpZ2dlciBleHRlbmRzIE92ZXJsYXlUcmlnZ2VyIHsgfVxuXG4vLyBleHBvcnQgY2xhc3MgVHJlZU92ZXJsYXlUcmlnZ2VyIHsgfVxuXG4vLyBleHBvcnQgY2xhc3MgR3JpZE92ZXJsYXlUcmlnZ2VyIHsgfVxuIiwiaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIsIFRvb2x0aXBPdmVybGF5VHJpZ2dlciB9IGZyb20gJy4vb3ZlcmxheS10cmlnZ2VyJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlUcmlnZ2VyTWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiB7IG5ldyguLi5hcmdzOiBhbnlbXSk6IE92ZXJsYXlUcmlnZ2VyIH07XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX09WRVJMQVlfVFJJR0dFUlM6IE92ZXJsYXlUcmlnZ2VyTWFwID0ge1xuICAgIGRlZmF1bHQ6IE92ZXJsYXlUcmlnZ2VyLFxuICAgIHRvb2x0aXA6IFRvb2x0aXBPdmVybGF5VHJpZ2dlcixcbn07XG5cbmV4cG9ydCBjbGFzcyBPdmVybGF5VHJpZ2dlckZhY3Rvcnkge1xuXG4gICAgY29uc3RydWN0b3IgKHByb3RlY3RlZCB0cmlnZ2VyczogT3ZlcmxheVRyaWdnZXJNYXAgPSBERUZBVUxUX09WRVJMQVlfVFJJR0dFUlMpIHsgfVxuXG4gICAgY3JlYXRlT3ZlcmxheVRyaWdnZXIgKHR5cGU6IHN0cmluZywgLi4uYXJnczogYW55W10pOiBPdmVybGF5VHJpZ2dlciB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcnNbdHlwZV0gPyBuZXcgdGhpcy50cmlnZ2Vyc1t0eXBlXSguLi5hcmdzKSA6IG5ldyBPdmVybGF5VHJpZ2dlciguLi5hcmdzIGFzIFtPdmVybGF5XSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHksIEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4gfSBmcm9tIFwiQHBhcnRraXQvY29tcG9uZW50XCI7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktb3ZlcmxheS1iYWNrZHJvcCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1vdmVybGF5LWJhY2tkcm9wLWJhY2tncm91bmQpO1xuICAgIH1cbiAgICA6aG9zdChbaGlkZGVuXSkge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICA6aG9zdChbdHJhbnNwYXJlbnRdKSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIH1cbiAgICBgXVxufSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5QmFja2Ryb3AgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBoaWRkZW4hOiBib29sZWFuO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICB0cmFuc3BhcmVudCA9IGZhbHNlO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIHNob3cgKCkge1xuXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5oaWRkZW4gPSBmYWxzZSk7XG4gICAgfVxuXG4gICAgaGlkZSAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmhpZGRlbiA9IHRydWUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjb25zdCBpbnNlcnRBZnRlciA9IDxUIGV4dGVuZHMgTm9kZT4gKG5ld0NoaWxkOiBULCByZWZDaGlsZDogTm9kZSk6IFQgPT4ge1xuICAgIHJldHVybiByZWZDaGlsZC5wYXJlbnROb2RlIS5pbnNlcnRCZWZvcmUobmV3Q2hpbGQsIHJlZkNoaWxkLm5leHRTaWJsaW5nKTtcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCwgcmVuZGVyIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gJy4uL3RlbXBsYXRlLWZ1bmN0aW9uJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0IHsgUG9zaXRpb25TdHJhdGVneUZhY3RvcnkgfSBmcm9tIFwiLi4vcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeVwiO1xuaW1wb3J0IHsgUG9zaXRpb25TdHJhdGVneSB9IGZyb20gXCIuLi9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneVwiO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXJGYWN0b3J5IH0gZnJvbSAnLi9vdmVybGF5LXRyaWdnZXItZmFjdG9yeSc7XG5pbXBvcnQgeyBPdmVybGF5VHJpZ2dlciB9IGZyb20gJy4vb3ZlcmxheS10cmlnZ2VyJztcbmltcG9ydCB7IE92ZXJsYXlCYWNrZHJvcCB9IGZyb20gJy4vb3ZlcmxheS1iYWNrZHJvcCc7XG5pbXBvcnQgeyBpbnNlcnRBZnRlciB9IGZyb20gJy4uL2RvbSc7XG5cbmNvbnN0IE9WRVJMQVlfVU5SRUdJU1RFUkVEX0VSUk9SID0gKG92ZXJsYXk6IHR5cGVvZiBPdmVybGF5KSA9PiBuZXcgRXJyb3IoYE92ZXJsYXkgaXMgbm90IHJlZ2lzdGVyZWQ6ICR7IG92ZXJsYXkuc2VsZWN0b3IgfWApO1xuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlDb25maWcge1xuICAgIHBvc2l0aW9uVHlwZTogc3RyaW5nO1xuICAgIHRyaWdnZXJUeXBlOiBzdHJpbmc7XG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlRnVuY3Rpb247XG4gICAgY29udGV4dDogQ29tcG9uZW50O1xuICAgIGJhY2tkcm9wOiBib29sZWFuO1xuICAgIGNsb3NlT25Fc2NhcGU6IGJvb2xlYW47XG4gICAgY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IGJvb2xlYW47XG4gICAgYXV0b0ZvY3VzOiBib29sZWFuO1xuICAgIHRyYXBGb2N1czogYm9vbGVhbjtcbiAgICByZXN0b3JlRm9jdXM6IGJvb2xlYW47XG59XG5cbi8vIGV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheVN0YXRlIHtcbi8vICAgICBjb25maWc6IE92ZXJsYXlDb25maWc7XG4vLyAgICAgcG9zaXRpb25TdHJhdGVneTogUG9zaXRpb25TdHJhdGVneTtcbi8vICAgICBvdmVybGF5VHJpZ2dlcjogT3ZlcmxheVRyaWdnZXI7XG4vLyAgICAgdGVtcGxhdGU6IFRlbXBsYXRlRnVuY3Rpb247XG4vLyAgICAgY29udGV4dDogQ29tcG9uZW50O1xuLy8gICAgIGRlc3Ryb3k6ICgpID0+IHZvaWQ7XG4vLyB9XG5cbmxldCBPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0U6IE92ZXJsYXlTZXJ2aWNlIHwgdW5kZWZpbmVkO1xuXG4vLyBleHBvcnQgY2xhc3MgT3ZlcmxheVNlcnZpY2VPbGQge1xuXG4vLyAgICAgcHJvdGVjdGVkIF9vdmVybGF5cyA9IG5ldyBNYXA8T3ZlcmxheSwgT3ZlcmxheVN0YXRlPigpO1xuXG4vLyAgICAgLy8gYSBzdGFjayBvZiBjdXJyZW50bHkgYWN0aXZlIG92ZXJsYXlzXG4vLyAgICAgcHJvdGVjdGVkIF9hY3RpdmVPdmVybGF5czogT3ZlcmxheVtdID0gW107XG5cbi8vICAgICBwcm90ZWN0ZWQgb3ZlcmxheXMgPSBuZXcgTWFwPE92ZXJsYXksICgpID0+IHZvaWQ+KCk7XG5cbi8vICAgICBwcm90ZWN0ZWQgYmFja2Ryb3AhOiBPdmVybGF5QmFja2Ryb3A7XG5cbi8vICAgICBjb25zdHJ1Y3RvciAoXG4vLyAgICAgICAgIHByb3RlY3RlZCBwb3NpdGlvblN0cmF0ZWd5RmFjdG9yeTogUG9zaXRpb25TdHJhdGVneUZhY3RvcnkgPSBuZXcgUG9zaXRpb25TdHJhdGVneUZhY3RvcnkoKSxcbi8vICAgICAgICAgcHJvdGVjdGVkIG92ZXJsYXlUcmlnZ2VyRmFjdG9yeTogT3ZlcmxheVRyaWdnZXJGYWN0b3J5ID0gbmV3IE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSgpLFxuLy8gICAgICAgICBwcm90ZWN0ZWQgcm9vdDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XG4vLyAgICAgKSB7XG5cbi8vICAgICAgICAgaWYgKCFPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0UpIHtcblxuLy8gICAgICAgICAgICAgT1ZFUkxBWV9TRVJWSUNFX0lOU1RBTkNFID0gdGhpcztcblxuLy8gICAgICAgICAgICAgdGhpcy5jcmVhdGVCYWNrZHJvcCgpO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgcmV0dXJuIE9WRVJMQVlfU0VSVklDRV9JTlNUQU5DRTtcbi8vICAgICB9XG5cbi8vICAgICAvLyBjcmVhdGVQb3NpdGlvblN0cmF0ZWd5ICh0eXBlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogUG9zaXRpb25TdHJhdGVneSB7XG5cbi8vICAgICAvLyAgICAgcmV0dXJuIHRoaXMucG9zaXRpb25TdHJhdGVneUZhY3RvcnkuY3JlYXRlUG9zaXRpb25TdHJhdGVneSh0eXBlLCAuLi5hcmdzKTtcbi8vICAgICAvLyB9XG5cbi8vICAgICAvLyBjcmVhdGVPdmVybGF5VHJpZ2dlciAodHlwZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IE92ZXJsYXlUcmlnZ2VyIHtcblxuLy8gICAgIC8vICAgICByZXR1cm4gdGhpcy5vdmVybGF5VHJpZ2dlckZhY3RvcnkuY3JlYXRlT3ZlcmxheVRyaWdnZXIodHlwZSwgLi4uYXJncyk7XG4vLyAgICAgLy8gfVxuXG4vLyAgICAgaGFzT3Blbk92ZXJsYXlzICgpIHtcblxuLy8gICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlT3ZlcmxheXMubGVuZ3RoID4gMDtcbi8vICAgICB9XG5cbi8vICAgICBpc092ZXJsYXlPcGVuIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbi8vICAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZU92ZXJsYXlzLmluY2x1ZGVzKG92ZXJsYXkpO1xuLy8gICAgIH1cblxuLy8gICAgIGNyZWF0ZUJhY2tkcm9wICgpIHtcblxuLy8gICAgICAgICB0aGlzLmJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChPdmVybGF5QmFja2Ryb3Auc2VsZWN0b3IpIGFzIE92ZXJsYXlCYWNrZHJvcDtcblxuLy8gICAgICAgICB0aGlzLnJvb3QuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZHJvcCk7XG4vLyAgICAgfVxuXG4vLyAgICAgY3JlYXRlT3ZlcmxheSAodGVtcGxhdGU6IFRlbXBsYXRlRnVuY3Rpb24sIGNvbnRleHQ/OiBDb21wb25lbnQsIHBvc2l0aW9uU3RyYXRlZ3k/OiBQb3NpdGlvblN0cmF0ZWd5KTogT3ZlcmxheSB7XG5cbi8vICAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoT3ZlcmxheS5zZWxlY3RvcikgYXMgT3ZlcmxheTtcblxuLy8gICAgICAgICBvdmVybGF5LnBvc2l0aW9uU3RyYXRlZ3kgPSBwb3NpdGlvblN0cmF0ZWd5IHx8IHRoaXMucG9zaXRpb25TdHJhdGVneUZhY3RvcnkuY3JlYXRlUG9zaXRpb25TdHJhdGVneSgnZml4ZWQnLCBvdmVybGF5KTtcblxuLy8gICAgICAgICBjb250ZXh0ID0gY29udGV4dCB8fCBvdmVybGF5O1xuXG4vLyAgICAgICAgIC8vIHRvIGtlZXAgYSB0ZW1wbGF0ZSB1cC10by1kYXRlIHdpdGggaXQncyBjb250ZXh0LCB3ZSBoYXZlIHRvIHJlbmRlciB0aGUgdGVtcGxhdGVcbi8vICAgICAgICAgLy8gZXZlcnl0aW1lIHRoZSBjb250ZXh0IHJlbmRlcnMgLSB0aGF0IGlzLCBvbiBldmVyeSB1cGRhdGUgd2hpY2ggd2FzIHRyaWdnZXJlZFxuLy8gICAgICAgICBjb25zdCB1cGRhdGVMaXN0ZW5lciA9ICgpID0+IHtcblxuLy8gICAgICAgICAgICAgLy8gY2hlY2sgdGhlIG92ZXJsYXkgaGFzbid0IGJlZW4gZGVzdHJveWVkIHlldFxuLy8gICAgICAgICAgICAgaWYgKHRoaXMub3ZlcmxheXMuaGFzKG92ZXJsYXkpKSB7XG5cbi8vICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck92ZXJsYXkob3ZlcmxheSwgdGVtcGxhdGUsIGNvbnRleHQpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgLy8gd2UgY2FuIHVzZSBhIGNvbXBvbmVudCdzICd1cGRhdGUnIGV2ZW50IHRvIHJlLXJlbmRlciB0aGUgdGVtcGxhdGUgb24gZXZlcnkgY29udGV4dCB1cGRhdGVcbi8vICAgICAgICAgLy8gbGl0LWh0bWwgd2lsbCB0YWtlIGNhcmUgb2YgZWZmaWNpZW50bHkgdXBkYXRpbmcgdGhlIERPTVxuLy8gICAgICAgICBjb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyKTtcblxuLy8gICAgICAgICB0aGlzLm92ZXJsYXlzLnNldChvdmVybGF5LCAoKSA9PiBjb250ZXh0IS5yZW1vdmVFdmVudExpc3RlbmVyKCd1cGRhdGUnLCB1cGRhdGVMaXN0ZW5lcikpO1xuXG4vLyAgICAgICAgIHRoaXMuYXR0YWNoT3ZlcmxheShvdmVybGF5KTtcblxuLy8gICAgICAgICB0aGlzLnJlbmRlck92ZXJsYXkob3ZlcmxheSwgdGVtcGxhdGUsIGNvbnRleHQpO1xuXG4vLyAgICAgICAgIHJldHVybiBvdmVybGF5O1xuLy8gICAgIH1cblxuLy8gICAgIHJlZ2lzdGVyT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4vLyAgICAgICAgIGNvbnNvbGUubG9nKCdyZWdpc3Rlck92ZXJsYXkuLi4nLCB0aGlzLm92ZXJsYXlzLmhhcyhvdmVybGF5KSk7XG5cbi8vICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlzLmhhcyhvdmVybGF5KSkge1xuXG4vLyAgICAgICAgICAgICB0aGlzLm92ZXJsYXlzLnNldChvdmVybGF5LCAoKSA9PiB7IH0pO1xuXG4vLyAgICAgICAgICAgICB0aGlzLmF0dGFjaE92ZXJsYXkob3ZlcmxheSk7XG5cbi8vICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4vLyAgICAgICAgIH0gZWxzZSB7XG5cbi8vICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cblxuLy8gICAgIG9wZW5PdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCBldmVudD86IEV2ZW50KSB7XG5cbi8vICAgICAgICAgaWYgKCF0aGlzLmlzT3ZlcmxheU9wZW4ob3ZlcmxheSkpIHtcblxuLy8gICAgICAgICAgICAgb3ZlcmxheS5zaG93KCk7XG5cbi8vICAgICAgICAgICAgIHRoaXMuX2FjdGl2ZU92ZXJsYXlzLnB1c2gob3ZlcmxheSk7XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG5cbi8vICAgICBvblNob3dPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbi8vICAgICAgICAgdGhpcy5iYWNrZHJvcC5zaG93KCk7XG4vLyAgICAgfVxuXG4vLyAgICAgY2xvc2VPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbi8vICAgICAgICAgaWYgKHRoaXMuaXNPdmVybGF5T3BlbihvdmVybGF5KSkge1xuXG4vLyAgICAgICAgICAgICAvLyBjbG9zZSBhbGwgZGVzY2VuZGFudCBvdmVybGF5cyBieSBlbXB0eWluZyB0aGUgc3RhY2sgdW50aWwgd2UgcmVhY2ggdGhlIGN1cnJlbnQgb3ZlcmxheVxuLy8gICAgICAgICAgICAgbGV0IGRlc2NhbmRhbnQgPSB0aGlzLl9hY3RpdmVPdmVybGF5cy5wb3AoKSE7XG5cbi8vICAgICAgICAgICAgIHdoaWxlIChkZXNjYW5kYW50ICE9PSBvdmVybGF5KSB7XG5cbi8vICAgICAgICAgICAgICAgICBkZXNjYW5kYW50LmhpZGUoKTtcblxuLy8gICAgICAgICAgICAgICAgIGRlc2NhbmRhbnQgPSB0aGlzLl9hY3RpdmVPdmVybGF5cy5wb3AoKSE7XG4vLyAgICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAgIG92ZXJsYXkuaGlkZSgpO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuXG4vLyAgICAgb25IaWRlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4vLyAgICAgICAgIGlmICghdGhpcy5oYXNPcGVuT3ZlcmxheXMoKSkgdGhpcy5iYWNrZHJvcC5oaWRlKCk7XG4vLyAgICAgfVxuXG4vLyAgICAgZGVzdHJveU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGRpc2Nvbm5lY3Q6IGJvb2xlYW4gPSB0cnVlKSB7XG5cbi8vICAgICAgICAgLy8gVE9ETzogd2UgbmVlZCB0byBhbHNvIGRlc3Ryb3kgZGVzY2VuZGFudCBvdmVybGF5c1xuLy8gICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheShvdmVybGF5KTtcblxuLy8gICAgICAgICBjb25zdCB0ZWFyZG93biA9IHRoaXMub3ZlcmxheXMuZ2V0KG92ZXJsYXkpO1xuXG4vLyAgICAgICAgIGlmICh0ZWFyZG93bikgdGVhcmRvd24oKTtcblxuLy8gICAgICAgICBpZiAoZGlzY29ubmVjdCAmJiBvdmVybGF5LnBhcmVudEVsZW1lbnQpIHtcblxuLy8gICAgICAgICAgICAgb3ZlcmxheS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgdGhpcy5vdmVybGF5cy5kZWxldGUob3ZlcmxheSk7XG4vLyAgICAgfVxuXG4vLyAgICAgcHJvdGVjdGVkIGNvbmZpZ3VyZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9LCBjb250ZXh0PzogQ29tcG9uZW50KTogT3ZlcmxheVN0YXRlIHtcblxuLy8gICAgICAgICBjb25zdCBvdmVybGF5U3RhdGUgPSB7IC4uLnRoaXMuX292ZXJsYXlzLmdldChvdmVybGF5KSB9IHx8IHt9IGFzIFBhcnRpYWw8T3ZlcmxheVN0YXRlPjtcblxuXG5cbi8vICAgICAgICAgY29uc3QgcG9zaXRpb25UeXBlID0gY29uZmlnLnBvc2l0aW9uVHlwZSB8fCAnZml4ZWQnO1xuXG4vLyAgICAgICAgIG92ZXJsYXlTdGF0ZS5wb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5wb3NpdGlvblN0cmF0ZWd5RmFjdG9yeS5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KHBvc2l0aW9uVHlwZSwgb3ZlcmxheSk7XG5cblxuXG4vLyAgICAgICAgIGNvbnN0IHRyaWdnZXJUeXBlID0gY29uZmlnLnRyaWdnZXJUeXBlO1xuXG4vLyAgICAgICAgIGlmICh0cmlnZ2VyVHlwZSkge1xuXG4vLyAgICAgICAgICAgICBvdmVybGF5U3RhdGUub3ZlcmxheVRyaWdnZXIgPSB0aGlzLm92ZXJsYXlUcmlnZ2VyRmFjdG9yeS5jcmVhdGVPdmVybGF5VHJpZ2dlcih0cmlnZ2VyVHlwZSk7XG4vLyAgICAgICAgIH1cblxuXG5cbi8vICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBjb25maWcudGVtcGxhdGUgfHwgb3ZlcmxheS50ZW1wbGF0ZTtcblxuLy8gICAgICAgICBpZiAodGVtcGxhdGUpIHtcblxuLy8gICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwgb3ZlcmxheS5jb250ZXh0IHx8IG92ZXJsYXk7XG5cbi8vICAgICAgICAgICAgIC8vIHRvIGtlZXAgYSB0ZW1wbGF0ZSB1cC10by1kYXRlIHdpdGggaXQncyBjb250ZXh0LCB3ZSBoYXZlIHRvIHJlbmRlciB0aGUgdGVtcGxhdGVcbi8vICAgICAgICAgICAgIC8vIGV2ZXJ5dGltZSB0aGUgY29udGV4dCByZW5kZXJzIC0gdGhhdCBpcywgb24gZXZlcnkgdXBkYXRlIHdoaWNoIHdhcyB0cmlnZ2VyZWRcbi8vICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUxpc3RlbmVyID0gKCkgPT4ge1xuXG4vLyAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdGhlIG92ZXJsYXkgaGFzbid0IGJlZW4gZGVzdHJveWVkIHlldFxuLy8gICAgICAgICAgICAgICAgIGlmICh0aGlzLm92ZXJsYXlzLmhhcyhvdmVybGF5KSkge1xuXG4vLyAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5LCB0ZW1wbGF0ZSwgY29udGV4dCk7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuXG4vLyAgICAgICAgICAgICAvLyB3ZSBjYW4gdXNlIGEgY29tcG9uZW50J3MgJ3VwZGF0ZScgZXZlbnQgdG8gcmUtcmVuZGVyIHRoZSB0ZW1wbGF0ZSBvbiBldmVyeSBjb250ZXh0IHVwZGF0ZVxuLy8gICAgICAgICAgICAgLy8gbGl0LWh0bWwgd2lsbCB0YWtlIGNhcmUgb2YgZWZmaWNpZW50bHkgdXBkYXRpbmcgdGhlIERPTVxuLy8gICAgICAgICAgICAgY29udGV4dC5hZGRFdmVudExpc3RlbmVyKCd1cGRhdGUnLCB1cGRhdGVMaXN0ZW5lcik7XG5cbi8vICAgICAgICAgICAgIG92ZXJsYXlTdGF0ZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuLy8gICAgICAgICAgICAgb3ZlcmxheVN0YXRlLmNvbnRleHQgPSBjb250ZXh0O1xuLy8gICAgICAgICAgICAgb3ZlcmxheVN0YXRlLmRlc3Ryb3kgPSAoKSA9PiBjb250ZXh0IS5yZW1vdmVFdmVudExpc3RlbmVyKCd1cGRhdGUnLCB1cGRhdGVMaXN0ZW5lcik7XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICByZXR1cm4gb3ZlcmxheVN0YXRlIGFzIE92ZXJsYXlTdGF0ZTtcbi8vICAgICB9XG5cbi8vICAgICAvKipcbi8vICAgICAgKiBBdHRhY2ggYW4gb3ZlcmxheSB0byB0aGUge0BsaW5rIE92ZXJsYXlTZXJ2aWNlfSdzIHJvb3QgZWxlbWVudFxuLy8gICAgICAqXG4vLyAgICAgICogQWxsIG92ZXJsYXlzIGFyZSBhdHRhY2hlZCB0byB0aGUgcm9vdCBlbGVtZW50IGluIG9yZGVyLCBhZnRlciB0aGUge0BsaW5rIE92ZXJsYXlCYWNrZHJvcH0uXG4vLyAgICAgICpcbi8vICAgICAgKiBAcGFyYW0gb3ZlcmxheSAtIFRoZSBvdmVybGF5IGluc3RhbmNlIHRvIGF0dGFjaFxuLy8gICAgICAqL1xuLy8gICAgIHByb3RlY3RlZCBhdHRhY2hPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbi8vICAgICAgICAgaWYgKG92ZXJsYXkucGFyZW50RWxlbWVudCA9PT0gdGhpcy5yb290KSByZXR1cm47XG5cbi8vICAgICAgICAgbGV0IGxhc3RPdmVybGF5OiBIVE1MRWxlbWVudCA9IHRoaXMuYmFja2Ryb3A7XG5cbi8vICAgICAgICAgd2hpbGUgKGxhc3RPdmVybGF5Lm5leHRTaWJsaW5nICYmIGxhc3RPdmVybGF5Lm5leHRTaWJsaW5nIGluc3RhbmNlb2YgT3ZlcmxheSkge1xuXG4vLyAgICAgICAgICAgICBsYXN0T3ZlcmxheSA9IGxhc3RPdmVybGF5Lm5leHRTaWJsaW5nO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgaW5zZXJ0QWZ0ZXIob3ZlcmxheSwgbGFzdE92ZXJsYXkpO1xuLy8gICAgIH1cblxuLy8gICAgIHByb3RlY3RlZCByZW5kZXJPdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCB0ZW1wbGF0ZTogVGVtcGxhdGVGdW5jdGlvbiwgY29udGV4dD86IENvbXBvbmVudCkge1xuXG4vLyAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRlbXBsYXRlKGNvbnRleHQgfHwgb3ZlcmxheSkgfHwgaHRtbGBgO1xuXG4vLyAgICAgICAgIHJlbmRlcihyZXN1bHQsIG92ZXJsYXksIHsgZXZlbnRDb250ZXh0OiBjb250ZXh0IHx8IG92ZXJsYXkgfSk7XG4vLyAgICAgfVxuLy8gfVxuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlEZWZpbml0aW9uIHtcbiAgICBjb25maWc6IE92ZXJsYXlDb25maWc7XG4gICAgcG9zaXRpb25TdHJhdGVneTogUG9zaXRpb25TdHJhdGVneTtcbiAgICBvdmVybGF5VHJpZ2dlcjogT3ZlcmxheVRyaWdnZXI7XG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlRnVuY3Rpb247XG4gICAgY29udGV4dDogQ29tcG9uZW50O1xuICAgIHVwZGF0ZUxpc3RlbmVyOiAoZXZlbnQ6IEN1c3RvbUV2ZW50KSA9PiB2b2lkO1xuICAgIG9wZW5DaGFuZ2VMaXN0ZW5lcjogKGV2ZW50OiBDdXN0b21FdmVudCkgPT4gdm9pZDtcbiAgICBkZXN0cm95OiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgT3ZlcmxheVNlcnZpY2Uge1xuXG4gICAgcHJvdGVjdGVkIHJlZ2lzdGVyZWRPdmVybGF5czogTWFwPE92ZXJsYXksIE92ZXJsYXlEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVPdmVybGF5czogT3ZlcmxheVtdID0gW107XG5cbiAgICBwcm90ZWN0ZWQgYmFja2Ryb3AhOiBPdmVybGF5QmFja2Ryb3A7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBwb3NpdGlvblN0cmF0ZWd5RmFjdG9yeTogUG9zaXRpb25TdHJhdGVneUZhY3RvcnkgPSBuZXcgUG9zaXRpb25TdHJhdGVneUZhY3RvcnkoKSxcbiAgICAgICAgcHJvdGVjdGVkIG92ZXJsYXlUcmlnZ2VyRmFjdG9yeTogT3ZlcmxheVRyaWdnZXJGYWN0b3J5ID0gbmV3IE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSgpLFxuICAgICAgICBwcm90ZWN0ZWQgcm9vdDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XG4gICAgKSB7XG5cbiAgICAgICAgaWYgKCFPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0UpIHtcblxuICAgICAgICAgICAgT1ZFUkxBWV9TRVJWSUNFX0lOU1RBTkNFID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5jcmVhdGVCYWNrZHJvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIE9WRVJMQVlfU0VSVklDRV9JTlNUQU5DRTtcbiAgICB9XG5cbiAgICBoYXNPcGVuT3ZlcmxheXMgKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU92ZXJsYXlzLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgaGFzT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5oYXMob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgaXNPdmVybGF5T3BlbiAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU92ZXJsYXlzLmluY2x1ZGVzKG92ZXJsYXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIG92ZXJsYXkgaXMgY29uc2lkZXJlZCBmb2N1c2VkLCBpZiBlaXRoZXIgaXRzZWxmIG9yIGFueSBvZiBpdHMgZGVzY2VuZGFudCBub2RlcyBoYXMgZm9jdXMuXG4gICAgICovXG4gICAgaXNPdmVybGF5Rm9jdXNlZCAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIHJldHVybiBvdmVybGF5ID09PSBhY3RpdmVFbGVtZW50IHx8IG92ZXJsYXkuY29udGFpbnMoYWN0aXZlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gb3ZlcmxheSBpcyBjb25zaWRlcmVkIGFjdGl2ZSBpZiBpdCBpcyBlaXRoZXIgZm9jdXNlZCBvciBoYXMgYSBkZXNjZW5kYW50IG92ZXJsYXkgd2hpY2ggaXMgZm9jdXNlZC5cbiAgICAgKi9cbiAgICBpc092ZXJsYXlBY3RpdmUgKG92ZXJsYXk6IE92ZXJsYXkpOiBib29sZWFuIHtcblxuICAgICAgICB0aGlzLl90aHJvd1VucmVnaXNlcmVkT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICBsZXQgaXNGb3VuZCA9IGZhbHNlO1xuICAgICAgICBsZXQgaXNBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHRoaXMuYWN0aXZlT3ZlcmxheXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aCAmJiAhaXNBY3RpdmU7IGluZGV4KyspIHtcblxuICAgICAgICAgICAgaWYgKCFpc0ZvdW5kICYmIHRoaXMuYWN0aXZlT3ZlcmxheXNbaW5kZXhdID09PSBvdmVybGF5KSBpc0ZvdW5kID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzRm91bmQpIHtcblxuICAgICAgICAgICAgICAgIGlzQWN0aXZlID0gdGhpcy5pc092ZXJsYXlBY3RpdmUodGhpcy5hY3RpdmVPdmVybGF5c1tpbmRleF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH1cblxuICAgIGNyZWF0ZUJhY2tkcm9wICgpIHtcblxuICAgICAgICB0aGlzLmJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChPdmVybGF5QmFja2Ryb3Auc2VsZWN0b3IpIGFzIE92ZXJsYXlCYWNrZHJvcDtcblxuICAgICAgICB0aGlzLnJvb3QuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZHJvcCk7XG4gICAgfVxuXG4gICAgY3JlYXRlT3ZlcmxheSAoY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+KTogT3ZlcmxheSB7XG5cbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoT3ZlcmxheS5zZWxlY3RvcikgYXMgT3ZlcmxheTtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5jb25maWd1cmVPdmVybGF5KG92ZXJsYXksIGNvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3Rlck92ZXJsYXkob3ZlcmxheSwgZGVmaW5pdGlvbik7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24udGVtcGxhdGUpIHtcblxuICAgICAgICAgICAgdGhpcy5yZW5kZXJPdmVybGF5KG92ZXJsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG92ZXJsYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgb24gb3ZlcmxheSB3aXRoIHRoZSBvdmVybGF5IHNlcnZpY2VcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIEFkZHMgdGhlIG92ZXJsYXkgaW5zdGFuY2UgdG8gdGhlIG92ZXJsYXkgc2VydmljZSdzIHJlZ2lzdHJ5LCBleHRyYWN0cyB0aGUgb3ZlcmxheSdzIGNvbmZpZ3VyYXRpb24gYW5kXG4gICAgICogYXR0YWNoZXMgdGhlIG92ZXJsYXkgdG8gdGhlIG92ZXJsYXkgc2VydmljZSdzIHJvb3QgbG9jYXRpb24gaW4gdGhlIGRvY3VtZW50IGJvZHkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvdmVybGF5IHdhcyByZWdpc3RlcmVkIHN1Y2Nlc3NmdWxseSwgZmFsc2UgaWYgdGhlIG92ZXJsYXkgaGFzIGJlZW4gcmVnaXN0ZXJlZCBhbHJlYWR5XG4gICAgICovXG4gICAgcmVnaXN0ZXJPdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCBkZWZpbml0aW9uPzogT3ZlcmxheURlZmluaXRpb24pOiBib29sZWFuIHtcblxuICAgICAgICBjb25zb2xlLmxvZygncmVnaXN0ZXJPdmVybGF5Li4uJywgdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuaGFzKG92ZXJsYXkpKTtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkge1xuXG4gICAgICAgICAgICBpZiAoIWRlZmluaXRpb24pIHtcblxuICAgICAgICAgICAgICAgIC8vIGlmIG5vIGRlZmluaXRpb24gaXMgcHJvdmlkZWQgd2l0aCB0aGUgcmVnaXN0ZXIgY2FsbCwgd2UgZXh0cmFjdCBpdCBmcm9tIHRoZSBvdmVybGF5IHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uID0gdGhpcy5jb25maWd1cmVPdmVybGF5KG92ZXJsYXksIHtcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlclR5cGU6IG92ZXJsYXkudHJpZ2dlclR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogb3ZlcmxheS5wb3NpdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBvdmVybGF5LnRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBvdmVybGF5LmNvbnRleHQgfHwgb3ZlcmxheVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5zZXQob3ZlcmxheSwgZGVmaW5pdGlvbik7XG5cbiAgICAgICAgICAgIHRoaXMuYXR0YWNoT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb3Blbk92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGV2ZW50PzogRXZlbnQpIHtcblxuICAgICAgICB0aGlzLl90aHJvd1VucmVnaXNlcmVkT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICBpZiAoIW92ZXJsYXkub3Blbikge1xuXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGNoZWNrIGlmIGFuIGV2ZW50IGNhdXNlZCB0aGUgb3ZlcmxheSB0byBvcGVuIGFuZCBpZiBpdCBvcmlnaW5hdGVzIGZyb20gYW55IGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzdGFja1xuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuYWN0aXZlT3ZlcmxheXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gbGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgaWYgKGV2ZW50ICYmIGxlbmd0aCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGluZGV4OyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZU92ZXJsYXkgPSB0aGlzLmFjdGl2ZU92ZXJsYXlzW2luZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlT3ZlcmxheSA9PT0gZXZlbnQudGFyZ2V0IHx8IGFjdGl2ZU92ZXJsYXkuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBmb3VuZCB0aGUgYWN0aXZlIG92ZXJsYXkgdGhhdCBjYXVzZWQgdGhlIGV2ZW50LCB3ZSBrZWVwIHRoZSBzdGFjayB1cCB0byB0aGlzIG92ZXJsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3RpdmUgb3ZlcmxheSBkaWRuJ3QgY2F1c2UgdGhlIGV2ZW50LCBzbyBpdCBzaG91bGQgYmUgY2xvc2VkIGFuZCBkaXNjYXJkZWQgZnJvbSB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwdXNoIG92ZXJsYXkgb24gdGhlIHN0YWNrIHRvIG1hcmsgaXQgYXMgY3VycmVudGx5IGFjdGl2ZSBvdmVybGF5XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU92ZXJsYXlzLnB1c2gob3ZlcmxheSk7XG5cbiAgICAgICAgICAgIG92ZXJsYXkuc2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2VPdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCBldmVudD86IEV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNPdmVybGF5T3BlbihvdmVybGF5KSkge1xuXG4gICAgICAgICAgICBsZXQgaXNGb3VuZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB3aGlsZSAoIWlzRm91bmQpIHtcblxuICAgICAgICAgICAgICAgIC8vIGFjdGl2ZU92ZXJsYXkgaXMgZWl0aGVyIGEgZGVzY2VuZGFudCBvZiBvdmVybGF5IG9yIG92ZXJsYXkgaXRzZWxmXG4gICAgICAgICAgICAgICAgbGV0IGFjdGl2ZU92ZXJsYXkgPSB0aGlzLmFjdGl2ZU92ZXJsYXlzLnBvcCgpITtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGFycml2ZWQgYXQgdGhlIG92ZXJsYXksIHdlIHN0b3AgY2xvc2luZ1xuICAgICAgICAgICAgICAgIGlzRm91bmQgPSBhY3RpdmVPdmVybGF5ID09PSBvdmVybGF5O1xuXG4gICAgICAgICAgICAgICAgYWN0aXZlT3ZlcmxheS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b2dnbGVPdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCBldmVudD86IEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKG92ZXJsYXkub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheShvdmVybGF5LCBldmVudCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5vcGVuT3ZlcmxheShvdmVybGF5LCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95T3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZGlzY29ubmVjdDogYm9vbGVhbiA9IHRydWUpIHtcblxuICAgICAgICB0aGlzLl90aHJvd1VucmVnaXNlcmVkT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICAvLyBUT0RPOiB3ZSBuZWVkIHRvIGFsc28gZGVzdHJveSBkZXNjZW5kYW50IG92ZXJsYXlzP1xuICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpO1xuXG4gICAgICAgIGlmIChkZWZpbml0aW9uICYmIGRlZmluaXRpb24uZGVzdHJveSkge1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaXNjb25uZWN0ICYmIG92ZXJsYXkucGFyZW50RWxlbWVudCkge1xuXG4gICAgICAgICAgICBvdmVybGF5LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQob3ZlcmxheSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5kZWxldGUob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uT3ZlcmxheU9wZW4gKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNPdmVybGF5KG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHsgdXBkYXRlTGlzdGVuZXIsIGNvbnRleHQsIHBvc2l0aW9uU3RyYXRlZ3kgfSA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgICAgIGNvbnRleHQuYWRkRXZlbnRMaXN0ZW5lcigndXBkYXRlJywgdXBkYXRlTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICAgICAgcG9zaXRpb25TdHJhdGVneS51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uT3ZlcmxheUNsb3NlIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkge1xuXG4gICAgICAgICAgICBjb25zdCB7IHVwZGF0ZUxpc3RlbmVyLCBjb250ZXh0IH0gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgICAgICBjb250ZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvbmZpZ3VyZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9KTogT3ZlcmxheURlZmluaXRpb24ge1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXlEZWZpbml0aW9uID0geyAuLi50aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkgfSB8fCB7fSBhcyBQYXJ0aWFsPE92ZXJsYXlEZWZpbml0aW9uPjtcblxuXG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25UeXBlID0gY29uZmlnLnBvc2l0aW9uVHlwZSB8fCAnZml4ZWQnO1xuXG4gICAgICAgIG92ZXJsYXlEZWZpbml0aW9uLnBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLnBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LmNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3kocG9zaXRpb25UeXBlLCBvdmVybGF5KTtcblxuXG5cbiAgICAgICAgY29uc3QgdHJpZ2dlclR5cGUgPSBjb25maWcudHJpZ2dlclR5cGU7XG5cbiAgICAgICAgaWYgKHRyaWdnZXJUeXBlKSB7XG5cbiAgICAgICAgICAgIG92ZXJsYXlEZWZpbml0aW9uLm92ZXJsYXlUcmlnZ2VyID0gdGhpcy5vdmVybGF5VHJpZ2dlckZhY3RvcnkuY3JlYXRlT3ZlcmxheVRyaWdnZXIodHJpZ2dlclR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3BlbkNoYW5nZUxpc3RlbmVyID0gKChldmVudDogUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBvcGVuID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQ7XG5cbiAgICAgICAgICAgIGlmIChvcGVuKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uT3ZlcmxheU9wZW4ob3ZlcmxheSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9uT3ZlcmxheUNsb3NlKG92ZXJsYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSBhcyBFdmVudExpc3RlbmVyO1xuXG4gICAgICAgIG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignb3Blbi1jaGFuZ2VkJywgb3BlbkNoYW5nZUxpc3RlbmVyKTtcblxuICAgICAgICBvdmVybGF5RGVmaW5pdGlvbi51cGRhdGVMaXN0ZW5lciA9ICgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5yZW5kZXJPdmVybGF5KG92ZXJsYXkpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBjb25zdCB0ZW1wbGF0ZSA9IGNvbmZpZy50ZW1wbGF0ZSB8fCBvdmVybGF5LnRlbXBsYXRlO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbmZpZy50ZW1wbGF0ZTtcblxuICAgICAgICAvLyBjb25zdCBjb250ZXh0ID0gY29uZmlnLmNvbnRleHQgfHwgb3ZlcmxheS5jb250ZXh0IHx8IG92ZXJsYXk7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBjb25maWcuY29udGV4dCB8fCBvdmVybGF5O1xuXG5cblxuXG4gICAgICAgIC8vIHRvIGtlZXAgYSB0ZW1wbGF0ZSB1cC10by1kYXRlIHdpdGggaXQncyBjb250ZXh0LCB3ZSBoYXZlIHRvIHJlbmRlciB0aGUgdGVtcGxhdGVcbiAgICAgICAgLy8gZXZlcnl0aW1lIHRoZSBjb250ZXh0IHJlbmRlcnMgLSB0aGF0IGlzLCBvbiBldmVyeSB1cGRhdGUgd2hpY2ggd2FzIHRyaWdnZXJlZFxuXG5cbiAgICAgICAgLy8gd2UgY2FuIHVzZSBhIGNvbXBvbmVudCdzICd1cGRhdGUnIGV2ZW50IHRvIHJlLXJlbmRlciB0aGUgdGVtcGxhdGUgb24gZXZlcnkgY29udGV4dCB1cGRhdGVcbiAgICAgICAgLy8gbGl0LWh0bWwgd2lsbCB0YWtlIGNhcmUgb2YgZWZmaWNpZW50bHkgdXBkYXRpbmcgdGhlIERPTVxuICAgICAgICAvLyBjb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyKTtcblxuICAgICAgICBvdmVybGF5RGVmaW5pdGlvbi50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICBvdmVybGF5RGVmaW5pdGlvbi5jb250ZXh0ID0gY29udGV4dDtcblxuXG4gICAgICAgIG92ZXJsYXlEZWZpbml0aW9uLmRlc3Ryb3kgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgIG92ZXJsYXkucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3Blbi1jaGFuZ2VkJywgb3BlbkNoYW5nZUxpc3RlbmVyKTtcbiAgICAgICAgICAgIC8vIGNvbnRleHQhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gb3ZlcmxheURlZmluaXRpb24gYXMgT3ZlcmxheURlZmluaXRpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIG92ZXJsYXkgdG8gdGhlIHtAbGluayBPdmVybGF5U2VydmljZX0ncyByb290IGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEFsbCBvdmVybGF5cyBhcmUgYXR0YWNoZWQgdG8gdGhlIHJvb3QgZWxlbWVudCBpbiBvcmRlciwgYWZ0ZXIgdGhlIHtAbGluayBPdmVybGF5QmFja2Ryb3B9LlxuICAgICAqXG4gICAgICogQHBhcmFtIG92ZXJsYXkgLSBUaGUgb3ZlcmxheSBpbnN0YW5jZSB0byBhdHRhY2hcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXR0YWNoT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmIChvdmVybGF5LnBhcmVudEVsZW1lbnQgPT09IHRoaXMucm9vdCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBsYXN0T3ZlcmxheTogSFRNTEVsZW1lbnQgPSB0aGlzLmJhY2tkcm9wO1xuXG4gICAgICAgIHdoaWxlIChsYXN0T3ZlcmxheS5uZXh0U2libGluZyAmJiBsYXN0T3ZlcmxheS5uZXh0U2libGluZyBpbnN0YW5jZW9mIE92ZXJsYXkpIHtcblxuICAgICAgICAgICAgbGFzdE92ZXJsYXkgPSBsYXN0T3ZlcmxheS5uZXh0U2libGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGluc2VydEFmdGVyKG92ZXJsYXksIGxhc3RPdmVybGF5KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVuZGVyT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmICh0aGlzLmhhc092ZXJsYXkob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgY29uc3QgeyB0ZW1wbGF0ZSwgY29udGV4dCB9ID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG5cbiAgICAgICAgICAgICAgICByZW5kZXIodGVtcGxhdGUoY29udGV4dCksIG92ZXJsYXksIHsgZXZlbnRDb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29uc3QgcmVzdWx0ID0gdGVtcGxhdGUoY29udGV4dCB8fCBvdmVybGF5KSB8fCBodG1sYGA7XG5cbiAgICAgICAgLy8gcmVuZGVyKHJlc3VsdCwgb3ZlcmxheSwgeyBldmVudENvbnRleHQ6IGNvbnRleHQgfHwgb3ZlcmxheSB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF90aHJvd1VucmVnaXNlcmVkT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNPdmVybGF5KG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIHRocm93IE9WRVJMQVlfVU5SRUdJU1RFUkVEX0VSUk9SKG92ZXJsYXkuY29uc3RydWN0b3IgYXMgdHlwZW9mIE92ZXJsYXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyIH0gZnJvbSBcIkBwYXJ0a2l0L2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgUG9zaXRpb25NYW5hZ2VyIH0gZnJvbSBcIi4uL3Bvc2l0aW9uL3Bvc2l0aW9uLW1hbmFnZXJcIjtcbmltcG9ydCB7IFBvc2l0aW9uU3RyYXRlZ3kgfSBmcm9tIFwiLi4vcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3lcIjtcbmltcG9ydCB7IEZpeGVkUG9zaXRpb25TdHJhdGVneSB9IGZyb20gXCIuLi9wb3NpdGlvbi9zdHJhdGVnaWVzL2ZpeGVkLXBvc2l0aW9uLXN0cmF0ZWd5XCI7XG5pbXBvcnQgeyBPdmVybGF5U2VydmljZSB9IGZyb20gXCIuL292ZXJsYXktc2VydmljZVwiO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tIFwiLi9vdmVybGF5LXRyaWdnZXJcIjtcbmltcG9ydCB7IFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vdGVtcGxhdGUtZnVuY3Rpb25cIjtcblxubGV0IE9WRVJMQVlfQ09VTlRFUiA9IDA7XG5cbmZ1bmN0aW9uIG5leHRPdmVybGF5SWQgKCk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gYHBhcnRraXQtb3ZlcmxheS0keyBPVkVSTEFZX0NPVU5URVIrKyB9YDtcbn1cblxuQGNvbXBvbmVudDxPdmVybGF5Pih7XG4gICAgc2VsZWN0b3I6ICd1aS1vdmVybGF5JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IDJweCBzb2xpZCAjYmZiZmJmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICAgIHdpbGwtY2hhbmdlOiB0cmFuc2Zvcm07XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWhpZGRlbj10cnVlXSkge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICB3aWxsLWNoYW5nZTogYXV0bztcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGAsXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIHRlbXBsYXRlT2JzZXJ2ZXIhOiBNdXRhdGlvbk9ic2VydmVyO1xuXG4gICAgcHJvdGVjdGVkIG92ZXJsYXlTZXJ2aWNlID0gbmV3IE92ZXJsYXlTZXJ2aWNlKCk7XG5cbiAgICBwcm90ZWN0ZWQgdHJpZ2dlckluc3RhbmNlOiBPdmVybGF5VHJpZ2dlciB8IG51bGwgPSBudWxsO1xuXG4gICAgLy8gcHJvdGVjdGVkIHRyaWdnZXJFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgLy8gcHJvdGVjdGVkIHBvc2l0aW9uTWFuYWdlciE6IFBvc2l0aW9uTWFuYWdlcjtcblxuICAgIEBwcm9wZXJ0eTxPdmVybGF5Pih7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbixcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiAncmVmbGVjdE9wZW4nXG4gICAgfSlcbiAgICBvcGVuID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXggPSAtMTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBjb250ZXh0OiBDb21wb25lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHRyaWdnZXIhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHRyaWdnZXJUeXBlID0gJ2RlZmF1bHQnO1xuXG4gICAgQHByb3BlcnR5KClcbiAgICBwb3NpdGlvblR5cGUgPSAnZml4ZWQnO1xuXG4gICAgcG9zaXRpb25TdHJhdGVneTogUG9zaXRpb25TdHJhdGVneSA9IG5ldyBGaXhlZFBvc2l0aW9uU3RyYXRlZ3kodGhpcyk7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlTZXJ2aWNlLmhhc092ZXJsYXkodGhpcykpIHtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5yZWdpc3Rlck92ZXJsYXkodGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmICh0aGlzLm92ZXJsYXlTZXJ2aWNlLnJlZ2lzdGVyT3ZlcmxheSh0aGlzKSkgcmV0dXJuO1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgbmV4dE92ZXJsYXlJZCgpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdkaWFsb2cnO1xuXG4gICAgICAgIC8vIHRoaXMucG9zaXRpb25NYW5hZ2VyID0gbmV3IFBvc2l0aW9uTWFuYWdlcihuZXcgQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSh0aGlzLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnRyaWdnZXIpISkpO1xuICAgICAgICAvLyB0aGlzLnBvc2l0aW9uTWFuYWdlciA9IG5ldyBQb3NpdGlvbk1hbmFnZXIodGhpcy5wb3NpdGlvblN0cmF0ZWd5KTtcblxuICAgICAgICAvLyB0aGlzLmluaXRUZW1wbGF0ZSgpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICAvLyBpZiAodGhpcy5wb3NpdGlvbk1hbmFnZXIpIHRoaXMucG9zaXRpb25NYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICAgICAgLy8gaWYgKHRoaXMudGVtcGxhdGVPYnNlcnZlcikgdGhpcy50ZW1wbGF0ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcblxuICAgICAgICB0aGlzLm92ZXJsYXlTZXJ2aWNlLmRlc3Ryb3lPdmVybGF5KHRoaXMsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoY2hhbmdlcy5oYXMoJ3RyaWdnZXInKSkge1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyaWdnZXIoZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnRyaWdnZXIpISBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYXNGb2N1cyAoKSB7XG5cbiAgICAgICAgLy8gVE9ETzogc2hvdWxkIHF1ZXJ5IG92ZXJsYXkgc2VydmljZSB0byBjaGVjayBmb3IgZGVzY2VuZGFudHMgd2l0aCBmb2N1c1xuXG4gICAgfVxuXG4gICAgc2hvdyAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLm9wZW4gPSB0cnVlKTtcblxuICAgICAgICAgICAgLy8gdGhpcy51cGRhdGVUZW1wbGF0ZSgpO1xuXG4gICAgICAgICAgICAvLyB0aGlzLnJlcG9zaXRpb24oKTtcblxuICAgICAgICAgICAgLy8gdGhpcy5vdmVybGF5U2VydmljZS5vblNob3dPdmVybGF5KHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGlkZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMub3BlbiA9IGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gdGhpcy5vdmVybGF5U2VydmljZS5vbkhpZGVPdmVybGF5KHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLnNob3coKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlcG9zaXRpb24gKCkge1xuXG4gICAgLy8gICAgIGlmICh0aGlzLnBvc2l0aW9uTWFuYWdlcikge1xuXG4gICAgLy8gICAgICAgICB0aGlzLnBvc2l0aW9uTWFuYWdlci51cGRhdGVQb3NpdGlvbigpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG4gICAgcmVmbGVjdE9wZW4gKCkge1xuXG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ29wZW4nLCAnJyk7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnb3BlbicpO1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVUcmlnZ2VyICh0cmlnZ2VyRWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICBpZiAodGhpcy50cmlnZ2VySW5zdGFuY2UpIHtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VySW5zdGFuY2UuZGV0YWNoKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJJbnN0YW5jZSA9IG5ldyBPdmVybGF5VHJpZ2dlcih0aGlzKTtcbiAgICAgICAgdGhpcy50cmlnZ2VySW5zdGFuY2UuYXR0YWNoKHRyaWdnZXJFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvLyBwcm90ZWN0ZWQgaW5pdFRlbXBsYXRlICgpIHtcblxuICAgIC8vICAgICB0aGlzLnRlbXBsYXRlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCd0ZW1wbGF0ZScpO1xuXG4gICAgLy8gICAgIGlmICh0aGlzLnRlbXBsYXRlKSB7XG5cbiAgICAvLyAgICAgICAgIHRoaXMudGVtcGxhdGVPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnM6IE11dGF0aW9uUmVjb3JkW10sIG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyKSA9PiB0aGlzLnVwZGF0ZVRlbXBsYXRlKCkpO1xuXG4gICAgLy8gICAgICAgICB0aGlzLnRlbXBsYXRlT2JzZXJ2ZXIub2JzZXJ2ZShcbiAgICAvLyAgICAgICAgICAgICAvLyB3ZSBjYW4ndCBvYnNlcnZlIGEgdGVtcGxhdGUgZGlyZWN0bHksIGJ1dCB0aGUgRG9jdW1lbnRGcmFnbWVudCBzdG9yZWQgaW4gaXRzIGNvbnRlbnQgcHJvcGVydHlcbiAgICAvLyAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmNvbnRlbnQsXG4gICAgLy8gICAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgIC8vICAgICAgICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlLFxuICAgIC8vICAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgLy8gICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cblxuICAgIC8vIHByb3RlY3RlZCB1cGRhdGVUZW1wbGF0ZSAoKSB7XG5cbiAgICAvLyAgICAgdGhpcy50ZW1wbGF0ZSA9IHRoaXMucXVlcnlTZWxlY3RvcigndGVtcGxhdGUnKTtcblxuICAgIC8vICAgICBpZiAodGhpcy50ZW1wbGF0ZSAmJiAhdGhpcy5oaWRkZW4pIHtcblxuICAgIC8vICAgICAgICAgY29uc3QgY29udGVudFNsb3QgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3Rvcignc2xvdCcpIGFzIEhUTUxTbG90RWxlbWVudDtcblxuICAgIC8vICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuICAgIC8vICAgICAgICAgICAgIGNvbnRlbnRTbG90LmlubmVySFRNTCA9ICcnO1xuXG4gICAgLy8gICAgICAgICAgICAgY29udGVudFNsb3QuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLnRlbXBsYXRlIS5jb250ZW50LCB0cnVlKSk7XG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbn1cbiIsImltcG9ydCB7XG4gICAgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sXG4gICAgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLFxuICAgIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICBDaGFuZ2VzLCBDb21wb25lbnQsXG4gICAgY29tcG9uZW50LFxuICAgIGNzcyxcbiAgICBsaXN0ZW5lcixcbiAgICBwcm9wZXJ0eVxufSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IFRhYlBhbmVsIH0gZnJvbSAnLi90YWItcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIHBhZGRpbmc6IDAuNXJlbSAwLjVyZW07XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItYm90dG9tOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzKSB2YXIoLS1ib3JkZXItcmFkaXVzKSAwIDA7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtc2VsZWN0ZWQ9dHJ1ZV0pOmFmdGVyIHtcbiAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHotaW5kZXg6IDI7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIGJvdHRvbTogY2FsYygtMSAqIHZhcigtLWJvcmRlci13aWR0aCkpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWJvcmRlci13aWR0aCkgKyAwLjVyZW0pO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByaXZhdGUgX3BhbmVsOiBUYWJQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFdlIHByb3ZpZGUgb3VyIG93biB0YWJpbmRleCBwcm9wZXJ0eSwgc28gd2UgY2FuIHNldCBpdCB0byBgbnVsbGBcbiAgICAgKiB0byByZW1vdmUgdGhlIHRhYmluZGV4LWF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICd0YWJpbmRleCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCE6IG51bWJlciB8IG51bGw7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLXNlbGVjdGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IHNlbGVjdGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gICAgfVxuXG4gICAgc2V0IHNlbGVjdGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogKHZhbHVlID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICB9KVxuICAgIGdldCBkaXNhYmxlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAodGhpcy5zZWxlY3RlZCA/IDAgOiAtMSk7XG4gICAgfVxuXG4gICAgZ2V0IHBhbmVsICgpOiBUYWJQYW5lbCB8IG51bGwge1xuXG4gICAgICAgIGlmICghdGhpcy5fcGFuZWwpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRyb2xzKSBhcyBUYWJQYW5lbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9wYW5lbDtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFiJ1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAtMTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwubGFiZWxsZWRCeSA9IHRoaXMuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gZmFsc2UpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQXJyb3dEb3duIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBBY3RpdmVJdGVtQ2hhbmdlLCBGb2N1c0tleU1hbmFnZXIgfSBmcm9tICcuLi9saXN0LWtleS1tYW5hZ2VyJztcbmltcG9ydCB7IFRhYiB9IGZyb20gJy4vdGFiJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWItbGlzdCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3cgbm93cmFwO1xuICAgIH1cbiAgICA6OnNsb3R0ZWQodWktdGFiKSB7XG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4yNXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiTGlzdCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPFRhYj47XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRUYWIhOiBUYWI7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFibGlzdCc7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChUYWIuc2VsZWN0b3IpLCAnaG9yaXpvbnRhbCcpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBjb25zdCBzbG90ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoJ3Nsb3QnKSBhcyBIVE1MU2xvdEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIHNsb3QuYWRkRXZlbnRMaXN0ZW5lcignc2xvdGNoYW5nZScsICgpID0+IHtcblxuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGAke3Nsb3QubmFtZX0gY2hhbmdlZC4uLmAsIHNsb3QuYXNzaWduZWROb2RlcygpKTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IHRoaXMucXVlcnlTZWxlY3RvcihgJHsgVGFiLnNlbGVjdG9yIH1bYXJpYS1zZWxlY3RlZD10cnVlXWApIGFzIFRhYjtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUYWJcbiAgICAgICAgICAgICAgICA/IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oc2VsZWN0ZWRUYWIpXG4gICAgICAgICAgICAgICAgOiB0aGlzLmZvY3VzTWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcblxuICAgICAgICAgICAgLy8gc2V0dGluZyB0aGUgYWN0aXZlIGl0ZW0gdmlhIHRoZSBmb2N1cyBtYW5hZ2VyJ3MgQVBJIHdpbGwgbm90IHRyaWdnZXIgYW4gZXZlbnRcbiAgICAgICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gbWFudWFsbHkgc2VsZWN0IHRoZSBpbml0aWFsbHkgYWN0aXZlIHRhYlxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLnNlbGVjdFRhYih0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAna2V5ZG93bicgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEFycm93RG93bjpcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5mb2N1c01hbmFnZXIuZ2V0QWN0aXZlSXRlbSgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFRhYiAmJiBzZWxlY3RlZFRhYi5wYW5lbCkgc2VsZWN0ZWRUYWIucGFuZWwuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxUYWJMaXN0Pih7XG4gICAgICAgIGV2ZW50OiAnYWN0aXZlLWl0ZW0tY2hhbmdlJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvY3VzTWFuYWdlcjsgfVxuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUFjdGl2ZVRhYkNoYW5nZSAoZXZlbnQ6IEFjdGl2ZUl0ZW1DaGFuZ2U8VGFiPikge1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzVGFiID0gZXZlbnQuZGV0YWlsLnByZXZpb3VzLml0ZW07XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQuaXRlbTtcblxuICAgICAgICBpZiAocHJldmlvdXNUYWIgIT09IHNlbGVjdGVkVGFiKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RUYWIocHJldmlvdXNUYWIpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RUYWIoc2VsZWN0ZWRUYWIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuc2VsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0YWIucGFuZWwpIHRhYi5wYW5lbC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkZXNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuZGVzZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1wYW5lbCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgei1pbmRleDogMTtcbiAgICAgICAgcGFkZGluZzogMCAxcmVtO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAwIHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpO1xuICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtaGlkZGVuPXRydWVdKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYlBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtaGlkZGVuJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICB9KVxuICAgIGhpZGRlbiE6IGJvb2xlYW47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWxhYmVsbGVkYnknLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGxhYmVsbGVkQnkhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFicGFuZWwnXG4gICAgICAgIHRoaXMuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IC0xO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8VG9nZ2xlPih7XG4gICAgc2VsZWN0b3I6ICd1aS10b2dnbGUnLFxuICAgIHRlbXBsYXRlOiB0b2dnbGUgPT4gaHRtbGBcbiAgICA8c3R5bGU+XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIC0tdGltaW5nLWN1YmljOiBjdWJpYy1iZXppZXIoMC41NSwgMC4wNiwgMC42OCwgMC4xOSk7XG4gICAgICAgICAgICAtLXRpbWluZy1zaW5lOiBjdWJpYy1iZXppZXIoMC40NywgMCwgMC43NSwgMC43Mik7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tdGltaW5nOiB2YXIoLS10aW1pbmctc2luZSk7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tZHVyYXRpb246IC4xcztcbiAgICAgICAgfVxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgodmFyKC0tZm9udC1zaXplKSwgMWZyKSk7XG5cbiAgICAgICAgICAgIG1pbi13aWR0aDogY2FsYyh2YXIoLS1mb250LXNpemUpICogMiArIHZhcigtLWJvcmRlci13aWR0aCkgKiAyKTtcbiAgICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1mb250LXNpemUpICsgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgKiAyKTtcbiAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuXG4gICAgICAgICAgICAvKiB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3I7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7ICovXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD10cnVlXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICAgICAgfVxuICAgICAgICAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGhlaWdodDogdmFyKC0tZm9udC1zaXplKTtcbiAgICAgICAgICAgIHdpZHRoOiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgd2lkdGg6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl1bbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgLmxhYmVsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgLjI1cmVtO1xuICAgICAgICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIGp1c3RpZnktc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmxhYmVsLW9uIHtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwiZmFsc2VcIl0pIC5sYWJlbC1vZmYge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG5cbiAgICA8L3N0eWxlPlxuICAgIDxzcGFuIGNsYXNzPVwidG9nZ2xlLXRodW1iXCI+PC9zcGFuPlxuICAgICR7IHRvZ2dsZS5sYWJlbE9uICYmIHRvZ2dsZS5sYWJlbE9mZlxuICAgICAgICAgICAgPyBodG1sYDxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtb2ZmXCI+JHsgdG9nZ2xlLmxhYmVsT2ZmIH08L3NwYW4+PHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vblwiPiR7IHRvZ2dsZS5sYWJlbE9uIH08L3NwYW4+YFxuICAgICAgICAgICAgOiAnJ1xuICAgICAgICB9XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBUb2dnbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jaGVja2VkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGxhYmVsID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPbiA9ICcnO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZmFsc2VcbiAgICB9KVxuICAgIGxhYmVsT2ZmID0gJyc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnc3dpdGNoJztcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBwcm9wZXJ0eS1jaGFuZ2UgZXZlbnQgZm9yIGBjaGVja2VkYFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHNwYWNlIGtleSBmcm9tIHNjcm9sbGluZyB0aGUgcGFnZVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0ICcuL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSAnLi9hcHAuc3R5bGVzJztcbmltcG9ydCB7IHRlbXBsYXRlIH0gZnJvbSAnLi9hcHAudGVtcGxhdGUnO1xuaW1wb3J0ICcuL2NhcmQnO1xuaW1wb3J0ICcuL2NoZWNrYm94JztcbmltcG9ydCAnLi9pY29uL2ljb24nO1xuaW1wb3J0ICcuL292ZXJsYXkvb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi9vdmVybGF5L292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuL292ZXJsYXkvb3ZlcmxheS1zZXJ2aWNlJztcbmltcG9ydCAnLi90YWJzL3RhYic7XG5pbXBvcnQgJy4vdGFicy90YWItbGlzdCc7XG5pbXBvcnQgJy4vdGFicy90YWItcGFuZWwnO1xuaW1wb3J0ICcuL3RvZ2dsZSc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGVtby1hcHAnLFxuICAgIHNoYWRvdzogZmFsc2UsXG4gICAgc3R5bGVzOiBbc3R5bGVzXSxcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbn0pXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgcHJvdGVjdGVkIG92ZXJsYXk/OiBPdmVybGF5O1xuXG4gICAgcHJvdGVjdGVkIHRpbWVvdXQhOiBudW1iZXI7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyID0gMDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuY291bnQoKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICB9XG5cbiAgICBjb25maXJtICgpIHtcblxuICAgICAgICBhbGVydChgWW91IGNvbmZpcm1lZCBhdCAkeyB0aGlzLmNvdW50ZXIgfS5gKTtcbiAgICB9XG5cbiAgICBjYW5jZWwgKCkge1xuXG4gICAgICAgIGFsZXJ0KGBZb3UgY2FuY2VsbGVkIGF0ICR7IHRoaXMuY291bnRlciB9LmApO1xuICAgIH1cblxuICAgIHNob3dPdmVybGF5IChldmVudDogRXZlbnQpIHtcblxuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheSkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSB0ZW1wbGF0ZSBmdW5jdGlvbiBpbiB0aGUgYXBwIGNvbXBvbmVudCdzIGNvbnRleHRcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gKCkgPT4gaHRtbGBcbiAgICAgICAgICAgICAgICA8aDM+UHJvZ3JhbW1hdGljIE92ZXJsYXk8L2gzPlxuICAgICAgICAgICAgICAgIDxwPlRoaXMgaXMgdGhlIGNvbnRlbnQgb2YgdGhlIHBvcG92ZXI6ICR7IHRoaXMuY291bnRlciB9PC9wPlxuICAgICAgICAgICAgICAgIDxwPjxidXR0b24gQGNsaWNrPSR7IHRoaXMuY2xvc2VPdmVybGF5IH0+R290IGl0PC9idXR0b24+PC9wPlxuICAgICAgICAgICAgYDtcblxuICAgICAgICAgICAgY29uc3QgdHJpZ2dlciA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICAgICAgLy8gcGFzcyB0aGUgdGVtcGxhdGUgZnVuY3Rpb24gYW5kIGEgcmVmZXJlbmNlIHRvIHRoZSB0ZW1wbGF0ZSdzIGNvbnRleHQgKHRoZSBhcHAgY29tcG9uZW50KVxuICAgICAgICAgICAgLy8gdG8gdGhlIG92ZXJsYXkgc2VydmljZVxuICAgICAgICAgICAgdGhpcy5vdmVybGF5ID0gdGhpcy5vdmVybGF5U2VydmljZS5jcmVhdGVPdmVybGF5KHsgdGVtcGxhdGU6IHRlbXBsYXRlLCBjb250ZXh0OiB0aGlzIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5vcGVuT3ZlcmxheSh0aGlzLm92ZXJsYXkpO1xuICAgIH1cblxuICAgIGNsb3NlT3ZlcmxheSAoKSB7XG5cbiAgICAgICAgLy8gaWYgKHRoaXMub3ZlcmxheSkgdGhpcy5vdmVybGF5U2VydmljZS5jbG9zZU92ZXJsYXkodGhpcy5vdmVybGF5KTtcblxuICAgICAgICBpZiAodGhpcy5vdmVybGF5KSB7XG5cbiAgICAgICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UuZGVzdHJveU92ZXJsYXkodGhpcy5vdmVybGF5KTtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvdW50ICgpIHtcblxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jb3VudGVyKys7XG5cbiAgICAgICAgICAgIHRoaXMuY291bnQoKTtcblxuICAgICAgICB9LCAxMDAwKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc3RvcCAoKSB7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG5cbiAgICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB9XG59XG4iLCJpbXBvcnQgJy4vc3JjL2FwcCc7XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcCAoKSB7XG5cbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VpLWNoZWNrYm94Jyk7XG5cbiAgICBpZiAoY2hlY2tib3gpIHtcblxuICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGVja2VkLWNoYW5nZWQnLCBldmVudCA9PiBjb25zb2xlLmxvZygoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpLmRldGFpbCkpO1xuICAgIH1cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBib290c3RyYXApO1xuIl0sIm5hbWVzIjpbInByZXBhcmVDb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDakMsSUE2Q08sTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUs7SUFDbEMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLFVBQVUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQztJQUNGOztJQzlEQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElB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
