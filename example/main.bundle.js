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

    class Behavior {
        constructor() {
            this._attached = false;
            this.eventManager = new EventManager();
        }
        get hasAttached() {
            return this._attached;
        }
        /**
         * The element that the behavior is attached to
         *
         * @description
         * We only expose a getter for the element, so it can't be set directly, but has to be set via
         * the behavior's attach method.
         */
        get element() {
            return this._element;
        }
        attach(element, ...args) {
            if (this.hasAttached)
                return false;
            this._element = element;
            this._attached = true;
            return true;
        }
        detach(...args) {
            if (!this.hasAttached)
                return false;
            this.eventManager.unlistenAll();
            this._element = undefined;
            this._attached = false;
            return true;
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
            if (!super.attach(element))
                return false;
            this.listen(this.element, 'focusin', event => this.handleFocusIn(event));
            this.listen(this.element, 'focusout', event => this.handleFocusOut(event));
            return true;
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

    // TODO: move to default-overlay-controller
    const DEFAULT_OVERLAY_CONTROLLER_CONFIG = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), { autoFocus: true, trapFocus: true, restoreFocus: true, closeOnEscape: true, closeOnFocusLoss: true });
    //# sourceMappingURL=overlay-controller-config.js.map

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
            this.previousFocus = document.body;
            this.isClosing = false;
            this.focusTrap = this.config.trapFocus
                ? new FocusTrap(config)
                : new FocusMonitor();
        }
        attach(element) {
            if (!super.attach(element))
                return false;
            this.listen(this.overlay, 'command-open', event => this.handleOpen(event));
            this.listen(this.overlay, 'command-close', event => this.handleClose(event));
            this.listen(this.overlay, 'open-changed', event => this.handleOpenChange(event));
            this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event));
            this.listen(this.overlay, 'keydown', event => this.handleKeydown(event));
            return true;
        }
        open(event) {
            dispatch(this.overlay, 'command-open', {
                target: this.overlay,
                source: event,
            });
        }
        close(event) {
            dispatch(this.overlay, 'command-close', {
                target: this.overlay,
                source: event,
            });
        }
        toggle(event, open) {
            open = (typeof open === 'boolean') ? open : !this.overlay.open;
            if (open) {
                this.open(event);
            }
            else {
                this.close(event);
            }
        }
        handleOpen(event) {
            this.isClosing = false;
            console.log('OverlayController.handleOpen()...', event);
            this.storeFocus();
        }
        handleClose(event) {
            this.isClosing = true;
            console.log('OverlayController.handleClose()...', event);
            this.restoreFocus(event);
        }
        handleOpenChange(event) {
            const open = event.detail.current;
            console.log('OverlayController.handleOpenChange()...', event);
            if (open) {
                if (this.focusTrap) {
                    this.focusTrap.attach(this.overlay);
                }
            }
            else {
                if (this.focusTrap) {
                    this.focusTrap.detach();
                }
            }
        }
        handleFocusChange(event) {
            const hasFocus = event.detail.type === 'focusin';
            console.log('OverlayController.handleFocusChange()...', this.isClosing, hasFocus);
            if (!hasFocus && !this.isClosing) {
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
                    if (!this.overlay.open || !this.config.closeOnEscape)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    this.close(event);
                    break;
            }
        }
        storeFocus() {
            this.previousFocus = document.activeElement || document.body;
            console.log('overlay-controller.storeFocus()...', this.previousFocus);
        }
        restoreFocus(event) {
            console.log('overlay-controller.restoreFocus()...', this.previousFocus, event);
            // we only restore the focus if the overlay is closed pressing Escape or programmatically
            const restoreFocus = this.config.restoreFocus && (!event || this.isEscape(event.detail.source));
            if (restoreFocus) {
                this.previousFocus.focus();
            }
            // this.previousFocus = document.body;
        }
        isEscape(event) {
            return event && event.key === Escape || false;
        }
    }
    //# sourceMappingURL=default-overlay-controller-new.js.map

    const DIALOG_OVERLAY_CONTROLLER_CONFIG = Object.assign({}, DEFAULT_OVERLAY_CONTROLLER_CONFIG);
    class DialogOverlayController extends DefaultOverlayController {
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
    //# sourceMappingURL=dialog-overlay-controller.js.map

    const TOOLTIP_OVERLAY_CONTROLLER_CONFIG = Object.assign(Object.assign({}, DEFAULT_OVERLAY_CONTROLLER_CONFIG), { trapFocus: false, autoFocus: false, restoreFocus: false });
    class TooltipOverlayController extends DefaultOverlayController {
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
    //# sourceMappingURL=overlay-controller-factory.js.map

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

    const ID_GENERATOR = new IDGenerator('partkit-overlay-');
    let Overlay = class Overlay extends Component {
        constructor() {
            super(...arguments);
            // TODO: clean this up
            this._config = Object.assign({}, DEFAULT_OVERLAY_CONFIG);
            this._open = false;
            this.tabindex = -1;
            this.controllerType = 'default';
            this.positionType = 'default';
            this.origin = 'viewport';
        }
        set open(value) {
            if (value === this.open)
                return;
            // setting the open property of the overlay doesn't actually set anything, therefore requestUpdate won't see any changes
            // instead, we dispatch an event which acts as a command to open or close the overlay
            // we do this to allow the OverlayService and OverlayControllers to listen to these events and run their appropriate logic
            // in the same way, the OverlayService and OverlayController can dispatch this event and the overlay will behave as if its
            // open property would have been set, without re-emitting the same event
            // we will handle the actual property change in the handlers below
            dispatch(this, value ? 'command-open' : 'command-close', {
                target: this,
                source: undefined,
            });
        }
        get open() {
            return this._open;
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
            super.connectedCallback();
        }
        updateCallback(changes, firstUpdate) {
            // OVERLAY_CONFIG_FIELDS.forEach(key => {
            //     if (changes.has(key)) config[key] = (this as any)[key];
            // });
            // if (Object.keys(config).length > 0) {
            //     // TODO: when overlay gets created via overlay service, the config from outside should override overlay's defaults
            //     // this.overlayService.updateOverlayConfig(this, config);
            // }
            if (firstUpdate) {
                this.setAttribute('aria-hidden', `${!this.open}`);
            }
            if (changes.has('open')) {
                this.setAttribute('aria-hidden', `${!this.open}`);
                this.notifyProperty('open', changes.get('open'), this.open);
            }
        }
        handleOpen(event) {
            console.log('Overlay.handleOpen()...');
            if (!this.open) {
                this._open = true;
                this.requestUpdate('open', false, true);
            }
        }
        handleClose(event) {
            console.log('Overlay.handleClose()...');
            if (this.open) {
                this._open = false;
                this.requestUpdate('open', true, false);
            }
        }
    };
    __decorate([
        property({
            converter: AttributeConverterBoolean,
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
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [CustomEvent]),
        __metadata("design:returntype", void 0)
    ], Overlay.prototype, "handleOpen", null);
    __decorate([
        listener({
            event: 'command-close',
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [CustomEvent]),
        __metadata("design:returntype", void 0)
    ], Overlay.prototype, "handleClose", null);
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
    //# sourceMappingURL=overlay.js.map

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

    function applyDefaults(config, defaults) {
        for (const key in defaults) {
            if (config[key] === undefined)
                config[key] = defaults[key];
        }
        return config;
    }
    //# sourceMappingURL=config.js.map

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
            return (typeof value === 'number') ? `${value || 0}px` : value || '';
        }
        hasPositionChanged(position, other) {
            return hasPositionChanged(position, other);
        }
        hasSizeChanged(size, other) {
            return hasSizeChanged(size, other);
        }
    }
    class PositionController extends Behavior {
        constructor(config) {
            super();
            this.config = applyDefaults(config || {}, DEFAULT_POSITION_CONFIG);
            this.origin = this.config.origin;
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
        update(position, size) {
            if (!this.hasAttached)
                return;
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
        attach(element) {
            if (!super.attach(element))
                return false;
            this.update();
            return true;
        }
        detach() {
            if (!this.hasAttached)
                return false;
            return super.detach();
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
        }
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
    class ConnectedPositionController extends PositionController {
        attach(element) {
            if (!super.attach(element))
                return false;
            this.listen(window, 'resize', () => this.update(), true);
            this.listen(document, 'scroll', () => this.update(), true);
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
            this.element.style.transform = `translate(${this.parseStyle(position.x)}, ${this.parseStyle(position.y)})`;
        }
    }
    //# sourceMappingURL=connected-position-strategy.js.map

    const DEFAULT_POSITION_STRATEGIES = {
        default: PositionStrategy,
        centered: CenteredPositionStrategy,
        connected: ConnectedPositionStrategy,
    };
    const DEFAULT_POSITION_CONTROLLERS = {
        default: PositionController,
        centered: CenteredPositionController,
        connected: ConnectedPositionController,
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
    class PositionControllerFactory {
        constructor(controllers = DEFAULT_POSITION_CONTROLLERS, configs = DEFAULT_POSITION_CONFIGS) {
            this.controllers = controllers;
            this.configs = configs;
        }
        createPositionController(type, config) {
            const controller = this.controllers[type] || PositionController;
            const configuration = Object.assign(Object.assign({}, this.configs[type] || DEFAULT_POSITION_CONFIG), config);
            return new controller(configuration);
        }
    }

    // TODO: overlay.selector is probably not very useful in context of this error...
    const OVERLAY_UNREGISTERED_ERROR = (overlay) => new Error(`Overlay is not registered: ${overlay.selector}`);
    let OVERLAY_SERVICE_INSTANCE;
    class OverlayService {
        constructor(positionStrategyFactory = new PositionStrategyFactory(), positionControllerFactory = new PositionControllerFactory(), overlayControllerFactory = new OverlayControllerFactory(), root = document.body) {
            this.positionStrategyFactory = positionStrategyFactory;
            this.positionControllerFactory = positionControllerFactory;
            this.overlayControllerFactory = overlayControllerFactory;
            this.root = root;
            this.registeredOverlays = new Map();
            this.activeOverlays = new Set();
            if (!OVERLAY_SERVICE_INSTANCE) {
                OVERLAY_SERVICE_INSTANCE = this;
                this.createBackdrop();
                document.body.addEventListener('connected', event => (event.target instanceof Overlay) && this.handleOverlayConnected(event), { capture: true });
                document.body.addEventListener('disconnected', event => (event.target instanceof Overlay) && this.handleOverlayDisconnected(event), { capture: true });
            }
            return OVERLAY_SERVICE_INSTANCE;
        }
        hasOverlay(overlay) {
            return this.registeredOverlays.has(overlay);
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
            const { config } = this.registeredOverlays.get(overlay);
            let isFound = false;
            let isActive = false;
            if (config.stacked && overlay.open) {
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
        getParentOverlay(overlay) {
            this._throwUnregiseredOverlay(overlay);
            const { config } = this.registeredOverlays.get(overlay);
            if (config.stacked && overlay.open) {
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
        destroyOverlay(overlay, disconnect = true) {
            this._throwUnregiseredOverlay(overlay);
            // TODO: we need to also destroy descendant overlays?
            this.closeOverlay(overlay);
            const definition = this.registeredOverlays.get(overlay);
            definition.events.unlistenAll();
            this.disposePositionStrategy(overlay);
            this.disposePositionController(overlay);
            this.disposeOverlayController(overlay);
            if (disconnect && overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
            }
            this.registeredOverlays.delete(overlay);
        }
        openOverlay(overlay, event) {
            console.log('opening overlay...', overlay);
            dispatch(overlay, 'command-open', {
                target: overlay,
                source: event,
            });
        }
        closeOverlay(overlay, event) {
            console.log('closing overlay...', overlay);
            dispatch(overlay, 'command-close', {
                target: overlay,
                source: event,
            });
        }
        toggleOverlay(overlay, event, open) {
            open = (typeof open === 'boolean') ? open : !overlay.open;
            if (open) {
                this.openOverlay(overlay, event);
            }
            else {
                this.closeOverlay(overlay, event);
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
            console.log('renderOverlay()...');
            if (this.hasOverlay(overlay)) {
                const { template, context } = this.registeredOverlays.get(overlay).config;
                if (template) {
                    // TODO: check if context is always available, otherwise use overlay as fallback-context
                    render(template(context || overlay), overlay, { eventContext: context || overlay });
                }
            }
        }
        configureOverlay(overlay, config = {}) {
            console.log('configureOverlay()... ', overlay, config);
            const settings = {
                config: config,
                events: new EventManager(),
                // positionStrategy: this.createPositionStrategy(overlay, config),
                positionController: this.createPositionController(overlay, config),
                overlayController: this.createOverlayController(overlay, config),
            };
            settings.events.listen(overlay, 'open-changed', event => this.handleOverlayOpenChanged(event));
            settings.events.listen(overlay, 'command-open', event => this.handleCommandOpen(event));
            settings.events.listen(overlay, 'command-close', event => this.handleCommandClose(event));
            return settings;
        }
        createPositionStrategy(overlay, config) {
            if (config.positionType) {
                const positionStrategy = this.positionStrategyFactory.createPositionStrategy(config.positionType, overlay, config);
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
        createPositionController(overlay, config) {
            if (config.positionType) {
                const positionController = this.positionControllerFactory.createPositionController(config.positionType, config);
                return positionController;
            }
        }
        disposePositionController(overlay) {
            const definition = this.registeredOverlays.get(overlay);
            if (definition.positionController) {
                definition.positionController.detach();
                definition.positionController = undefined;
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
        handleOverlayConnected(event) {
            const overlay = event.target;
            if (this.registeringOverlay === overlay)
                return;
            this.registeringOverlay = overlay;
            console.log('OverlayService.handleOverlayConnected()...', event);
            this.registerOverlay(overlay, overlay.config);
            this.registeringOverlay = undefined;
        }
        handleOverlayDisconnected(event) {
            const overlay = event.target;
            if (this.registeringOverlay === overlay)
                return;
            console.log('OverlayService.handleOverlayDisconnected()...', event);
            this.destroyOverlay(overlay, false);
        }
        handleOverlayOpenChanged(event) {
            console.log('overlay open-changed...', event);
            const overlay = event.target;
            const { positionStrategy, positionController } = this.registeredOverlays.get(overlay);
            if (overlay.open) {
                if (positionStrategy) {
                    positionStrategy.update();
                }
                if (positionController) {
                    positionController.attach(overlay);
                }
            }
            else {
                if (positionController) {
                    positionController.detach();
                }
            }
        }
        handleCommandOpen(event) {
            const overlay = event.detail.target;
            const source = event.detail.source;
            const { config, events, positionStrategy } = this.registeredOverlays.get(overlay);
            if (config.stacked) {
                if (source && source.target instanceof Node && this.activeOverlays.size) {
                    const activeOverlays = [...this.activeOverlays];
                    for (let index = activeOverlays.length - 1; index >= 0; index--) {
                        const lastOverlay = activeOverlays[index];
                        if (lastOverlay === source.target || lastOverlay.contains(source.target)) {
                            // we found the active overlay that caused the event, we keep the stack up to this overlay
                            break;
                        }
                        else {
                            // the active overlay didn't cause the event, so it should be closed and discarded from the stack
                            this.closeOverlay(overlay);
                        }
                    }
                }
                this.activeOverlays.add(overlay);
            }
            if (config.template && config.context) {
                // to keep a template up-to-date with it's context, we have to render the template
                // everytime the context renders - that is, on every update which was triggered
                // TODO: fix context's update listener
                // config.context.addEventListener('update', updateListener as EventListener);
                this.renderOverlay(overlay);
            }
            // if (positionStrategy) {
            //     positionStrategy.update();
            // }
            // TODO: manage backdrop
            // if (config.backdrop) {
            //     this.backdrop.show();
            // }
        }
        handleCommandClose(event) {
            const overlay = event.detail.target;
            const source = event.detail.source;
            const config = this.registeredOverlays.get(overlay).config;
            if (config.stacked) {
                if (this.activeOverlays.size) {
                    const activeOverlays = [...this.activeOverlays];
                    for (let index = activeOverlays.length - 1; index >= 0; index--) {
                        const lastOverlay = activeOverlays[index];
                        if (lastOverlay === overlay) {
                            // we found the active overlay that caused the event, we keep the stack up to this overlay
                            break;
                        }
                        else {
                            // the active overlay is a descendant of the one that's closed, so it should be closed and discarded from the stack
                            this.closeOverlay(lastOverlay);
                        }
                    }
                }
                this.activeOverlays.delete(overlay);
            }
            if (config.template && config.context) ;
            // TODO: manage backdrop
            // if (config.backdrop) {
            //     this.backdrop.hide();
            // }
        }
        _throwUnregiseredOverlay(overlay) {
            if (!this.hasOverlay(overlay)) {
                throw OVERLAY_UNREGISTERED_ERROR(overlay.constructor);
            }
        }
    }
    //# sourceMappingURL=overlay-service-new.js.map

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
            // TODO: this will fail the first time, as createOverlay is intrinsically async - it creates the overlay and reattaches it, which will
            // cause a second connected callback which we actually have to wait for before opening the overlay...
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
    //# sourceMappingURL=overlay-demo.js.map

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9pY29uL2ljb24udHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1oZWFkZXIudHMiLCJzcmMvaGVscGVycy9jb3B5cmlnaHQudHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1wYW5lbC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIiwic3JjL2FwcC5zdHlsZXMudHMiLCJzcmMvYXBwLnRlbXBsYXRlLnRzIiwic3JjL2NhcmQudHMiLCJzcmMvY2hlY2tib3gudHMiLCJzcmMvZXZlbnQtbWFuYWdlci50cyIsInNyYy9iZWhhdmlvci50cyIsInNyYy9vdmVybGF5L2ZvY3VzLW1vbml0b3IudHMiLCJzcmMvb3ZlcmxheS9mb2N1cy10cmFwLnRzIiwic3JjL292ZXJsYXkvY29udHJvbGxlci9vdmVybGF5LWNvbnRyb2xsZXItY29uZmlnLnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vYWxpZ25tZW50LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vc2l6ZS50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZy50cyIsInNyYy9vdmVybGF5L292ZXJsYXktY29uZmlnLnRzIiwic3JjL2RvbS50cyIsInNyYy9vdmVybGF5L2NvbnRyb2xsZXIvZGVmYXVsdC1vdmVybGF5LWNvbnRyb2xsZXItbmV3LnRzIiwic3JjL292ZXJsYXkvY29udHJvbGxlci9kaWFsb2ctb3ZlcmxheS1jb250cm9sbGVyLnRzIiwic3JjL292ZXJsYXkvY29udHJvbGxlci90b29sdGlwLW92ZXJsYXktY29udHJvbGxlci50cyIsInNyYy9vdmVybGF5L2NvbnRyb2xsZXIvb3ZlcmxheS1jb250cm9sbGVyLWZhY3RvcnkudHMiLCJzcmMvaWQtZ2VuZXJhdG9yLnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS50cyIsInNyYy9vdmVybGF5L292ZXJsYXktYmFja2Ryb3AudHMiLCJzcmMvb3ZlcmxheS9wb3NpdGlvbi9wb3NpdGlvbi50cyIsInNyYy9vdmVybGF5L2NvbmZpZy50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3Bvc2l0aW9uLXN0cmF0ZWd5LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vc3RyYXRlZ2llcy9jZW50ZXJlZC1wb3NpdGlvbi1zdHJhdGVneS50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3N0cmF0ZWdpZXMvY29ubmVjdGVkLXBvc2l0aW9uLXN0cmF0ZWd5LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeS50cyIsInNyYy9vdmVybGF5L292ZXJsYXktc2VydmljZS1uZXcudHMiLCJzcmMvb3ZlcmxheS1kZW1vLnRzIiwic3JjL3RhYnMvdGFiLnRzIiwic3JjL3RhYnMvdGFiLWxpc3QudHMiLCJzcmMvdGFicy90YWItcGFuZWwudHMiLCJzcmMvdG9nZ2xlLnRzIiwic3JjL2FwcC50cyIsIm1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuY29uc3QgZGlyZWN0aXZlcyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIEJyYW5kcyBhIGZ1bmN0aW9uIGFzIGEgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24gc28gdGhhdCBsaXQtaHRtbCB3aWxsIGNhbGxcbiAqIHRoZSBmdW5jdGlvbiBkdXJpbmcgdGVtcGxhdGUgcmVuZGVyaW5nLCByYXRoZXIgdGhhbiBwYXNzaW5nIGFzIGEgdmFsdWUuXG4gKlxuICogQSBfZGlyZWN0aXZlXyBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBQYXJ0IGFzIGFuIGFyZ3VtZW50LiBJdCBoYXMgdGhlXG4gKiBzaWduYXR1cmU6IGAocGFydDogUGFydCkgPT4gdm9pZGAuXG4gKlxuICogQSBkaXJlY3RpdmUgX2ZhY3RvcnlfIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhcmd1bWVudHMgZm9yIGRhdGEgYW5kXG4gKiBjb25maWd1cmF0aW9uIGFuZCByZXR1cm5zIGEgZGlyZWN0aXZlLiBVc2VycyBvZiBkaXJlY3RpdmUgdXN1YWxseSByZWZlciB0b1xuICogdGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGFzIHRoZSBkaXJlY3RpdmUuIEZvciBleGFtcGxlLCBcIlRoZSByZXBlYXQgZGlyZWN0aXZlXCIuXG4gKlxuICogVXN1YWxseSBhIHRlbXBsYXRlIGF1dGhvciB3aWxsIGludm9rZSBhIGRpcmVjdGl2ZSBmYWN0b3J5IGluIHRoZWlyIHRlbXBsYXRlXG4gKiB3aXRoIHJlbGV2YW50IGFyZ3VtZW50cywgd2hpY2ggd2lsbCB0aGVuIHJldHVybiBhIGRpcmVjdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBIZXJlJ3MgYW4gZXhhbXBsZSBvZiB1c2luZyB0aGUgYHJlcGVhdCgpYCBkaXJlY3RpdmUgZmFjdG9yeSB0aGF0IHRha2VzIGFuXG4gKiBhcnJheSBhbmQgYSBmdW5jdGlvbiB0byByZW5kZXIgYW4gaXRlbTpcbiAqXG4gKiBgYGBqc1xuICogaHRtbGA8dWw+PCR7cmVwZWF0KGl0ZW1zLCAoaXRlbSkgPT4gaHRtbGA8bGk+JHtpdGVtfTwvbGk+YCl9PC91bD5gXG4gKiBgYGBcbiAqXG4gKiBXaGVuIGByZXBlYXRgIGlzIGludm9rZWQsIGl0IHJldHVybnMgYSBkaXJlY3RpdmUgZnVuY3Rpb24gdGhhdCBjbG9zZXMgb3ZlclxuICogYGl0ZW1zYCBhbmQgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uLiBXaGVuIHRoZSBvdXRlciB0ZW1wbGF0ZSBpcyByZW5kZXJlZCwgdGhlXG4gKiByZXR1cm4gZGlyZWN0aXZlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBQYXJ0IGZvciB0aGUgZXhwcmVzc2lvbi5cbiAqIGByZXBlYXRgIHRoZW4gcGVyZm9ybXMgaXQncyBjdXN0b20gbG9naWMgdG8gcmVuZGVyIG11bHRpcGxlIGl0ZW1zLlxuICpcbiAqIEBwYXJhbSBmIFRoZSBkaXJlY3RpdmUgZmFjdG9yeSBmdW5jdGlvbi4gTXVzdCBiZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhXG4gKiBmdW5jdGlvbiBvZiB0aGUgc2lnbmF0dXJlIGAocGFydDogUGFydCkgPT4gdm9pZGAuIFRoZSByZXR1cm5lZCBmdW5jdGlvbiB3aWxsXG4gKiBiZSBjYWxsZWQgd2l0aCB0aGUgcGFydCBvYmplY3QuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBpbXBvcnQge2RpcmVjdGl2ZSwgaHRtbH0gZnJvbSAnbGl0LWh0bWwnO1xuICpcbiAqIGNvbnN0IGltbXV0YWJsZSA9IGRpcmVjdGl2ZSgodikgPT4gKHBhcnQpID0+IHtcbiAqICAgaWYgKHBhcnQudmFsdWUgIT09IHYpIHtcbiAqICAgICBwYXJ0LnNldFZhbHVlKHYpXG4gKiAgIH1cbiAqIH0pO1xuICovXG5leHBvcnQgY29uc3QgZGlyZWN0aXZlID0gKGYpID0+ICgoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IGQgPSBmKC4uLmFyZ3MpO1xuICAgIGRpcmVjdGl2ZXMuc2V0KGQsIHRydWUpO1xuICAgIHJldHVybiBkO1xufSk7XG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmUgPSAobykgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ2Z1bmN0aW9uJyAmJiBkaXJlY3RpdmVzLmhhcyhvKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RpdmUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBUcnVlIGlmIHRoZSBjdXN0b20gZWxlbWVudHMgcG9seWZpbGwgaXMgaW4gdXNlLlxuICovXG5leHBvcnQgY29uc3QgaXNDRVBvbHlmaWxsID0gd2luZG93LmN1c3RvbUVsZW1lbnRzICE9PSB1bmRlZmluZWQgJiZcbiAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMucG9seWZpbGxXcmFwRmx1c2hDYWxsYmFjayAhPT1cbiAgICAgICAgdW5kZWZpbmVkO1xuLyoqXG4gKiBSZXBhcmVudHMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0YCAoaW5jbHVzaXZlKSB0byBgZW5kYCAoZXhjbHVzaXZlKSxcbiAqIGludG8gYW5vdGhlciBjb250YWluZXIgKGNvdWxkIGJlIHRoZSBzYW1lIGNvbnRhaW5lciksIGJlZm9yZSBgYmVmb3JlYC4gSWZcbiAqIGBiZWZvcmVgIGlzIG51bGwsIGl0IGFwcGVuZHMgdGhlIG5vZGVzIHRvIHRoZSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCByZXBhcmVudE5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwsIGJlZm9yZSA9IG51bGwpID0+IHtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgICAgICBjb25zdCBuID0gc3RhcnQubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoc3RhcnQsIGJlZm9yZSk7XG4gICAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG59O1xuLyoqXG4gKiBSZW1vdmVzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydGAgKGluY2x1c2l2ZSkgdG8gYGVuZGAgKGV4Y2x1c2l2ZSksIGZyb21cbiAqIGBjb250YWluZXJgLlxuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlTm9kZXMgPSAoY29udGFpbmVyLCBzdGFydCwgZW5kID0gbnVsbCkgPT4ge1xuICAgIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzdGFydC5uZXh0U2libGluZztcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHN0YXJ0KTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kb20uanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE4IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyB0aGF0IGEgdmFsdWUgd2FzIGhhbmRsZWQgYnkgYSBkaXJlY3RpdmUgYW5kXG4gKiBzaG91bGQgbm90IGJlIHdyaXR0ZW4gdG8gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vQ2hhbmdlID0ge307XG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIGEgTm9kZVBhcnQgdG8gZnVsbHkgY2xlYXIgaXRzIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBub3RoaW5nID0ge307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgd2l0aCBlbWJlZGRlZCB1bmlxdWUga2V5IHRvIGF2b2lkIGNvbGxpc2lvbiB3aXRoXG4gKiBwb3NzaWJsZSB0ZXh0IGluIHRlbXBsYXRlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG1hcmtlciA9IGB7e2xpdC0ke1N0cmluZyhNYXRoLnJhbmRvbSgpKS5zbGljZSgyKX19fWA7XG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHVzZWQgdGV4dC1wb3NpdGlvbnMsIG11bHRpLWJpbmRpbmcgYXR0cmlidXRlcywgYW5kXG4gKiBhdHRyaWJ1dGVzIHdpdGggbWFya3VwLWxpa2UgdGV4dCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBub2RlTWFya2VyID0gYDwhLS0ke21hcmtlcn0tLT5gO1xuZXhwb3J0IGNvbnN0IG1hcmtlclJlZ2V4ID0gbmV3IFJlZ0V4cChgJHttYXJrZXJ9fCR7bm9kZU1hcmtlcn1gKTtcbi8qKlxuICogU3VmZml4IGFwcGVuZGVkIHRvIGFsbCBib3VuZCBhdHRyaWJ1dGUgbmFtZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCA9ICckbGl0JCc7XG4vKipcbiAqIEFuIHVwZGF0ZWFibGUgVGVtcGxhdGUgdGhhdCB0cmFja3MgdGhlIGxvY2F0aW9uIG9mIGR5bmFtaWMgcGFydHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBlbGVtZW50KSB7XG4gICAgICAgIHRoaXMucGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgY29uc3Qgbm9kZXNUb1JlbW92ZSA9IFtdO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgICAgICAvLyBFZGdlIG5lZWRzIGFsbCA0IHBhcmFtZXRlcnMgcHJlc2VudDsgSUUxMSBuZWVkcyAzcmQgcGFyYW1ldGVyIHRvIGJlIG51bGxcbiAgICAgICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihlbGVtZW50LmNvbnRlbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgbGFzdCBpbmRleCBhc3NvY2lhdGVkIHdpdGggYSBwYXJ0LiBXZSB0cnkgdG8gZGVsZXRlXG4gICAgICAgIC8vIHVubmVjZXNzYXJ5IG5vZGVzLCBidXQgd2UgbmV2ZXIgd2FudCB0byBhc3NvY2lhdGUgdHdvIGRpZmZlcmVudCBwYXJ0c1xuICAgICAgICAvLyB0byB0aGUgc2FtZSBpbmRleC4gVGhleSBtdXN0IGhhdmUgYSBjb25zdGFudCBub2RlIGJldHdlZW4uXG4gICAgICAgIGxldCBsYXN0UGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBjb25zdCB7IHN0cmluZ3MsIHZhbHVlczogeyBsZW5ndGggfSB9ID0gcmVzdWx0O1xuICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGV4aGF1c3RlZCB0aGUgY29udGVudCBpbnNpZGUgYSBuZXN0ZWQgdGVtcGxhdGUgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHdlIHN0aWxsIGhhdmUgcGFydHMgKHRoZSBvdXRlciBmb3ItbG9vcCksIHdlIGtub3c6XG4gICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBhIHRlbXBsYXRlIGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgIC8vIC0gVGhlIHdhbGtlciB3aWxsIGZpbmQgYSBuZXh0Tm9kZSBvdXRzaWRlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxIC8qIE5vZGUuRUxFTUVOVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBub2RlLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBhdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICAvLyBQZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05hbWVkTm9kZU1hcCxcbiAgICAgICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlcyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgcmV0dXJuZWQgaW4gZG9jdW1lbnQgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIEluIHBhcnRpY3VsYXIsIEVkZ2UvSUUgY2FuIHJldHVybiB0aGVtIG91dCBvZiBvcmRlciwgc28gd2UgY2Fubm90XG4gICAgICAgICAgICAgICAgICAgIC8vIGFzc3VtZSBhIGNvcnJlc3BvbmRlbmNlIGJldHdlZW4gcGFydCBpbmRleCBhbmQgYXR0cmlidXRlIGluZGV4LlxuICAgICAgICAgICAgICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5kc1dpdGgoYXR0cmlidXRlc1tpXS5uYW1lLCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjb3VudC0tID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIHNlY3Rpb24gbGVhZGluZyB1cCB0byB0aGUgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4cHJlc3Npb24gaW4gdGhpcyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ0ZvclBhcnQgPSBzdHJpbmdzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzdHJpbmdGb3JQYXJ0KVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbGwgYm91bmQgYXR0cmlidXRlcyBoYXZlIGhhZCBhIHN1ZmZpeCBhZGRlZCBpblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVtcGxhdGVSZXN1bHQjZ2V0SFRNTCB0byBvcHQgb3V0IG9mIHNwZWNpYWwgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoYW5kbGluZy4gVG8gbG9vayB1cCB0aGUgYXR0cmlidXRlIHZhbHVlIHdlIGFsc28gbmVlZCB0byBhZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdWZmaXguXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVMb29rdXBOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpICsgYm91bmRBdHRyaWJ1dGVTdWZmaXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0aWNzID0gYXR0cmlidXRlVmFsdWUuc3BsaXQobWFya2VyUmVnZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ2F0dHJpYnV0ZScsIGluZGV4LCBuYW1lLCBzdHJpbmdzOiBzdGF0aWNzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IHN0YXRpY3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAzIC8qIE5vZGUuVEVYVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5vZGUuZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5pbmRleE9mKG1hcmtlcikgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSBkYXRhLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG5ldyB0ZXh0IG5vZGUgZm9yIGVhY2ggbGl0ZXJhbCBzZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIG5vZGVzIGFyZSBhbHNvIHVzZWQgYXMgdGhlIG1hcmtlcnMgZm9yIG5vZGUgcGFydHNcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluc2VydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzID0gc3RyaW5nc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydCA9IGNyZWF0ZU1hcmtlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoICE9PSBudWxsICYmIGVuZHNXaXRoKG1hdGNoWzJdLCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgbWF0Y2hbMV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMl0uc2xpY2UoMCwgLWJvdW5kQXR0cmlidXRlU3VmZml4Lmxlbmd0aCkgKyBtYXRjaFszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGluc2VydCwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiArK2luZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gdGV4dCwgd2UgbXVzdCBpbnNlcnQgYSBjb21tZW50IHRvIG1hcmsgb3VyIHBsYWNlLlxuICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gdHJ1c3QgaXQgd2lsbCBzdGljayBhcm91bmQgYWZ0ZXIgY2xvbmluZy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0cmluZ3NbbGFzdEluZGV4XSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb1JlbW92ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gc3RyaW5nc1tsYXN0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBwYXJ0IGZvciBlYWNoIG1hdGNoIGZvdW5kXG4gICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBsYXN0SW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBOb2RlLkNPTU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmRhdGEgPT09IG1hcmtlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBtYXJrZXIgbm9kZSB0byBiZSB0aGUgc3RhcnROb2RlIG9mIHRoZSBQYXJ0IGlmIGFueSBvZlxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZm9sbG93aW5nIGFyZSB0cnVlOlxuICAgICAgICAgICAgICAgICAgICAvLyAgKiBXZSBkb24ndCBoYXZlIGEgcHJldmlvdXNTaWJsaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vICAqIFRoZSBwcmV2aW91c1NpYmxpbmcgaXMgYWxyZWFkeSB0aGUgc3RhcnQgb2YgYSBwcmV2aW91cyBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLnByZXZpb3VzU2libGluZyA9PT0gbnVsbCB8fCBpbmRleCA9PT0gbGFzdFBhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RQYXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIG5leHRTaWJsaW5nLCBrZWVwIHRoaXMgbm9kZSBzbyB3ZSBoYXZlIGFuIGVuZC5cbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHJlbW92ZSBpdCB0byBzYXZlIGZ1dHVyZSBjb3N0cy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb1JlbW92ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA9IG5vZGUuZGF0YS5pbmRleE9mKG1hcmtlciwgaSArIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW1lbnQgbm9kZSBoYXMgYSBiaW5kaW5nIG1hcmtlciBpbnNpZGUsIG1ha2UgYW4gaW5hY3RpdmUgcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGJpbmRpbmcgd29uJ3Qgd29yaywgYnV0IHN1YnNlcXVlbnQgYmluZGluZ3Mgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGNvbnNpZGVyIHdoZXRoZXIgaXQncyBldmVuIHdvcnRoIGl0IHRvXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIGJpbmRpbmdzIGluIGNvbW1lbnRzIHdvcmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXg6IC0xIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVtb3ZlIHRleHQgYmluZGluZyBub2RlcyBhZnRlciB0aGUgd2FsayB0byBub3QgZGlzdHVyYiB0aGUgVHJlZVdhbGtlclxuICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXNUb1JlbW92ZSkge1xuICAgICAgICAgICAgbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pO1xuICAgICAgICB9XG4gICAgfVxufVxuY29uc3QgZW5kc1dpdGggPSAoc3RyLCBzdWZmaXgpID0+IHtcbiAgICBjb25zdCBpbmRleCA9IHN0ci5sZW5ndGggLSBzdWZmaXgubGVuZ3RoO1xuICAgIHJldHVybiBpbmRleCA+PSAwICYmIHN0ci5zbGljZShpbmRleCkgPT09IHN1ZmZpeDtcbn07XG5leHBvcnQgY29uc3QgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgPSAocGFydCkgPT4gcGFydC5pbmRleCAhPT0gLTE7XG4vLyBBbGxvd3MgYGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpYCB0byBiZSByZW5hbWVkIGZvciBhXG4vLyBzbWFsbCBtYW51YWwgc2l6ZS1zYXZpbmdzLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuLyoqXG4gKiBUaGlzIHJlZ2V4IGV4dHJhY3RzIHRoZSBhdHRyaWJ1dGUgbmFtZSBwcmVjZWRpbmcgYW4gYXR0cmlidXRlLXBvc2l0aW9uXG4gKiBleHByZXNzaW9uLiBJdCBkb2VzIHRoaXMgYnkgbWF0Y2hpbmcgdGhlIHN5bnRheCBhbGxvd2VkIGZvciBhdHRyaWJ1dGVzXG4gKiBhZ2FpbnN0IHRoZSBzdHJpbmcgbGl0ZXJhbCBkaXJlY3RseSBwcmVjZWRpbmcgdGhlIGV4cHJlc3Npb24sIGFzc3VtaW5nIHRoYXRcbiAqIHRoZSBleHByZXNzaW9uIGlzIGluIGFuIGF0dHJpYnV0ZS12YWx1ZSBwb3NpdGlvbi5cbiAqXG4gKiBTZWUgYXR0cmlidXRlcyBpbiB0aGUgSFRNTCBzcGVjOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2VsZW1lbnRzLWF0dHJpYnV0ZXNcbiAqXG4gKiBcIiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiIGFyZSBIVE1MIHNwYWNlIGNoYXJhY3RlcnM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNzcGFjZS1jaGFyYWN0ZXJzXG4gKlxuICogXCJcXDAtXFx4MUZcXHg3Ri1cXHg5RlwiIGFyZSBVbmljb2RlIGNvbnRyb2wgY2hhcmFjdGVycywgd2hpY2ggaW5jbHVkZXMgZXZlcnlcbiAqIHNwYWNlIGNoYXJhY3RlciBleGNlcHQgXCIgXCIuXG4gKlxuICogU28gYW4gYXR0cmlidXRlIGlzOlxuICogICogVGhlIG5hbWU6IGFueSBjaGFyYWN0ZXIgZXhjZXB0IGEgY29udHJvbCBjaGFyYWN0ZXIsIHNwYWNlIGNoYXJhY3RlciwgKCcpLFxuICogICAgKFwiKSwgXCI+XCIsIFwiPVwiLCBvciBcIi9cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5IFwiPVwiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnk6XG4gKiAgICAqIEFueSBjaGFyYWN0ZXIgZXhjZXB0IHNwYWNlLCAoJyksIChcIiksIFwiPFwiLCBcIj5cIiwgXCI9XCIsIChgKSwgb3JcbiAqICAgICogKFwiKSB0aGVuIGFueSBub24tKFwiKSwgb3JcbiAqICAgICogKCcpIHRoZW4gYW55IG5vbi0oJylcbiAqL1xuZXhwb3J0IGNvbnN0IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXggPSAvKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKShbXlxcMC1cXHgxRlxceDdGLVxceDlGIFwiJz49L10rKShbIFxceDA5XFx4MGFcXHgwY1xceDBkXSo9WyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qKD86W14gXFx4MDlcXHgwYVxceDBjXFx4MGRcIidgPD49XSp8XCJbXlwiXSp8J1teJ10qKSkkLztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyBpc0NFUG9seWZpbGwgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBpc1RlbXBsYXRlUGFydEFjdGl2ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiBhIGBUZW1wbGF0ZWAgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSBhbmQgdXBkYXRlZFxuICogd2l0aCBuZXcgdmFsdWVzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSB7XG4gICAgY29uc3RydWN0b3IodGVtcGxhdGUsIHByb2Nlc3Nvciwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLl9fcGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvcjtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgdXBkYXRlKHZhbHVlcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LnNldFZhbHVlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX19wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuY29tbWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Nsb25lKCkge1xuICAgICAgICAvLyBUaGVyZSBhcmUgYSBudW1iZXIgb2Ygc3RlcHMgaW4gdGhlIGxpZmVjeWNsZSBvZiBhIHRlbXBsYXRlIGluc3RhbmNlJ3NcbiAgICAgICAgLy8gRE9NIGZyYWdtZW50OlxuICAgICAgICAvLyAgMS4gQ2xvbmUgLSBjcmVhdGUgdGhlIGluc3RhbmNlIGZyYWdtZW50XG4gICAgICAgIC8vICAyLiBBZG9wdCAtIGFkb3B0IGludG8gdGhlIG1haW4gZG9jdW1lbnRcbiAgICAgICAgLy8gIDMuIFByb2Nlc3MgLSBmaW5kIHBhcnQgbWFya2VycyBhbmQgY3JlYXRlIHBhcnRzXG4gICAgICAgIC8vICA0LiBVcGdyYWRlIC0gdXBncmFkZSBjdXN0b20gZWxlbWVudHNcbiAgICAgICAgLy8gIDUuIFVwZGF0ZSAtIHNldCBub2RlLCBhdHRyaWJ1dGUsIHByb3BlcnR5LCBldGMuLCB2YWx1ZXNcbiAgICAgICAgLy8gIDYuIENvbm5lY3QgLSBjb25uZWN0IHRvIHRoZSBkb2N1bWVudC4gT3B0aW9uYWwgYW5kIG91dHNpZGUgb2YgdGhpc1xuICAgICAgICAvLyAgICAgbWV0aG9kLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSBoYXZlIGEgZmV3IGNvbnN0cmFpbnRzIG9uIHRoZSBvcmRlcmluZyBvZiB0aGVzZSBzdGVwczpcbiAgICAgICAgLy8gICogV2UgbmVlZCB0byB1cGdyYWRlIGJlZm9yZSB1cGRhdGluZywgc28gdGhhdCBwcm9wZXJ0eSB2YWx1ZXMgd2lsbCBwYXNzXG4gICAgICAgIC8vICAgIHRocm91Z2ggYW55IHByb3BlcnR5IHNldHRlcnMuXG4gICAgICAgIC8vICAqIFdlIHdvdWxkIGxpa2UgdG8gcHJvY2VzcyBiZWZvcmUgdXBncmFkaW5nIHNvIHRoYXQgd2UncmUgc3VyZSB0aGF0IHRoZVxuICAgICAgICAvLyAgICBjbG9uZWQgZnJhZ21lbnQgaXMgaW5lcnQgYW5kIG5vdCBkaXN0dXJiZWQgYnkgc2VsZi1tb2RpZnlpbmcgRE9NLlxuICAgICAgICAvLyAgKiBXZSB3YW50IGN1c3RvbSBlbGVtZW50cyB0byB1cGdyYWRlIGV2ZW4gaW4gZGlzY29ubmVjdGVkIGZyYWdtZW50cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gR2l2ZW4gdGhlc2UgY29uc3RyYWludHMsIHdpdGggZnVsbCBjdXN0b20gZWxlbWVudHMgc3VwcG9ydCB3ZSB3b3VsZFxuICAgICAgICAvLyBwcmVmZXIgdGhlIG9yZGVyOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSwgQ29ubmVjdFxuICAgICAgICAvL1xuICAgICAgICAvLyBCdXQgU2FmYXJpIGRvb2VzIG5vdCBpbXBsZW1lbnQgQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5I3VwZ3JhZGUsIHNvIHdlXG4gICAgICAgIC8vIGNhbiBub3QgaW1wbGVtZW50IHRoYXQgb3JkZXIgYW5kIHN0aWxsIGhhdmUgdXBncmFkZS1iZWZvcmUtdXBkYXRlIGFuZFxuICAgICAgICAvLyB1cGdyYWRlIGRpc2Nvbm5lY3RlZCBmcmFnbWVudHMuIFNvIHdlIGluc3RlYWQgc2FjcmlmaWNlIHRoZVxuICAgICAgICAvLyBwcm9jZXNzLWJlZm9yZS11cGdyYWRlIGNvbnN0cmFpbnQsIHNpbmNlIGluIEN1c3RvbSBFbGVtZW50cyB2MSBlbGVtZW50c1xuICAgICAgICAvLyBtdXN0IG5vdCBtb2RpZnkgdGhlaXIgbGlnaHQgRE9NIGluIHRoZSBjb25zdHJ1Y3Rvci4gV2Ugc3RpbGwgaGF2ZSBpc3N1ZXNcbiAgICAgICAgLy8gd2hlbiBjby1leGlzdGluZyB3aXRoIENFdjAgZWxlbWVudHMgbGlrZSBQb2x5bWVyIDEsIGFuZCB3aXRoIHBvbHlmaWxsc1xuICAgICAgICAvLyB0aGF0IGRvbid0IHN0cmljdGx5IGFkaGVyZSB0byB0aGUgbm8tbW9kaWZpY2F0aW9uIHJ1bGUgYmVjYXVzZSBzaGFkb3dcbiAgICAgICAgLy8gRE9NLCB3aGljaCBtYXkgYmUgY3JlYXRlZCBpbiB0aGUgY29uc3RydWN0b3IsIGlzIGVtdWxhdGVkIGJ5IGJlaW5nIHBsYWNlZFxuICAgICAgICAvLyBpbiB0aGUgbGlnaHQgRE9NLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgcmVzdWx0aW5nIG9yZGVyIGlzIG9uIG5hdGl2ZSBpczogQ2xvbmUsIEFkb3B0LCBVcGdyYWRlLCBQcm9jZXNzLFxuICAgICAgICAvLyBVcGRhdGUsIENvbm5lY3QuIGRvY3VtZW50LmltcG9ydE5vZGUoKSBwZXJmb3JtcyBDbG9uZSwgQWRvcHQsIGFuZCBVcGdyYWRlXG4gICAgICAgIC8vIGluIG9uZSBzdGVwLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgQ3VzdG9tIEVsZW1lbnRzIHYxIHBvbHlmaWxsIHN1cHBvcnRzIHVwZ3JhZGUoKSwgc28gdGhlIG9yZGVyIHdoZW5cbiAgICAgICAgLy8gcG9seWZpbGxlZCBpcyB0aGUgbW9yZSBpZGVhbDogQ2xvbmUsIFByb2Nlc3MsIEFkb3B0LCBVcGdyYWRlLCBVcGRhdGUsXG4gICAgICAgIC8vIENvbm5lY3QuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaXNDRVBvbHlmaWxsID9cbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LmNsb25lTm9kZSh0cnVlKSA6XG4gICAgICAgICAgICBkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnRlbXBsYXRlLnBhcnRzO1xuICAgICAgICAvLyBFZGdlIG5lZWRzIGFsbCA0IHBhcmFtZXRlcnMgcHJlc2VudDsgSUUxMSBuZWVkcyAzcmQgcGFyYW1ldGVyIHRvIGJlIG51bGxcbiAgICAgICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihmcmFnbWVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfFRFWFR9ICovLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICAgICAgbGV0IHBhcnQ7XG4gICAgICAgIGxldCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgdGhlIG5vZGVzIGFuZCBwYXJ0cyBvZiBhIHRlbXBsYXRlXG4gICAgICAgIHdoaWxlIChwYXJ0SW5kZXggPCBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcnQgPSBwYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgaWYgKCFpc1RlbXBsYXRlUGFydEFjdGl2ZShwYXJ0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9ncmVzcyB0aGUgdHJlZSB3YWxrZXIgdW50aWwgd2UgZmluZCBvdXIgbmV4dCBwYXJ0J3Mgbm9kZS5cbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBtdWx0aXBsZSBwYXJ0cyBtYXkgc2hhcmUgdGhlIHNhbWUgbm9kZSAoYXR0cmlidXRlIHBhcnRzXG4gICAgICAgICAgICAvLyBvbiBhIHNpbmdsZSBlbGVtZW50KSwgc28gdGhpcyBsb29wIG1heSBub3QgcnVuIGF0IGFsbC5cbiAgICAgICAgICAgIHdoaWxlIChub2RlSW5kZXggPCBwYXJ0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgbm9kZUluZGV4Kys7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gbm9kZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UndmUgZXhoYXVzdGVkIHRoZSBjb250ZW50IGluc2lkZSBhIG5lc3RlZCB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHdlIHN0aWxsIGhhdmUgcGFydHMgKHRoZSBvdXRlciBmb3ItbG9vcCksIHdlIGtub3c6XG4gICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgYSB0ZW1wbGF0ZSBpbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGUgd2Fsa2VyIHdpbGwgZmluZCBhIG5leHROb2RlIG91dHNpZGUgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UndmUgYXJyaXZlZCBhdCBvdXIgcGFydCdzIG5vZGUuXG4gICAgICAgICAgICBpZiAocGFydC50eXBlID09PSAnbm9kZScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wcm9jZXNzb3IuaGFuZGxlVGV4dEV4cHJlc3Npb24odGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICBwYXJ0Lmluc2VydEFmdGVyTm9kZShub2RlLnByZXZpb3VzU2libGluZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaCguLi50aGlzLnByb2Nlc3Nvci5oYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhub2RlLCBwYXJ0Lm5hbWUsIHBhcnQuc3RyaW5ncywgdGhpcy5vcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDRVBvbHlmaWxsKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZG9wdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgICAgICAgY3VzdG9tRWxlbWVudHMudXBncmFkZShmcmFnbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLWluc3RhbmNlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgYm91bmRBdHRyaWJ1dGVTdWZmaXgsIGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXgsIG1hcmtlciwgbm9kZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuY29uc3QgY29tbWVudE1hcmtlciA9IGAgJHttYXJrZXJ9IGA7XG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiBgaHRtbGAsIHdoaWNoIGhvbGRzIGEgVGVtcGxhdGUgYW5kIHRoZSB2YWx1ZXMgZnJvbVxuICogaW50ZXJwb2xhdGVkIGV4cHJlc3Npb25zLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0cmluZ3MsIHZhbHVlcywgdHlwZSwgcHJvY2Vzc29yKSB7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHN0cmluZyBvZiBIVE1MIHVzZWQgdG8gY3JlYXRlIGEgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gICAgICovXG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgY29uc3QgbCA9IHRoaXMuc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgaHRtbCA9ICcnO1xuICAgICAgICBsZXQgaXNDb21tZW50QmluZGluZyA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMuc3RyaW5nc1tpXTtcbiAgICAgICAgICAgIC8vIEZvciBlYWNoIGJpbmRpbmcgd2Ugd2FudCB0byBkZXRlcm1pbmUgdGhlIGtpbmQgb2YgbWFya2VyIHRvIGluc2VydFxuICAgICAgICAgICAgLy8gaW50byB0aGUgdGVtcGxhdGUgc291cmNlIGJlZm9yZSBpdCdzIHBhcnNlZCBieSB0aGUgYnJvd3NlcidzIEhUTUxcbiAgICAgICAgICAgIC8vIHBhcnNlci4gVGhlIG1hcmtlciB0eXBlIGlzIGJhc2VkIG9uIHdoZXRoZXIgdGhlIGV4cHJlc3Npb24gaXMgaW4gYW5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZSwgdGV4dCwgb3IgY29tbWVudCBwb2lzaXRpb24uXG4gICAgICAgICAgICAvLyAgICogRm9yIG5vZGUtcG9zaXRpb24gYmluZGluZ3Mgd2UgaW5zZXJ0IGEgY29tbWVudCB3aXRoIHRoZSBtYXJrZXJcbiAgICAgICAgICAgIC8vICAgICBzZW50aW5lbCBhcyBpdHMgdGV4dCBjb250ZW50LCBsaWtlIDwhLS17e2xpdC1ndWlkfX0tLT4uXG4gICAgICAgICAgICAvLyAgICogRm9yIGF0dHJpYnV0ZSBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIGZvciB0aGVcbiAgICAgICAgICAgIC8vICAgICBmaXJzdCBiaW5kaW5nLCBzbyB0aGF0IHdlIHN1cHBvcnQgdW5xdW90ZWQgYXR0cmlidXRlIGJpbmRpbmdzLlxuICAgICAgICAgICAgLy8gICAgIFN1YnNlcXVlbnQgYmluZGluZ3MgY2FuIHVzZSBhIGNvbW1lbnQgbWFya2VyIGJlY2F1c2UgbXVsdGktYmluZGluZ1xuICAgICAgICAgICAgLy8gICAgIGF0dHJpYnV0ZXMgbXVzdCBiZSBxdW90ZWQuXG4gICAgICAgICAgICAvLyAgICogRm9yIGNvbW1lbnQgYmluZGluZ3Mgd2UgaW5zZXJ0IGp1c3QgdGhlIG1hcmtlciBzZW50aW5lbCBzbyB3ZSBkb24ndFxuICAgICAgICAgICAgLy8gICAgIGNsb3NlIHRoZSBjb21tZW50LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBzY2FucyB0aGUgdGVtcGxhdGUgc291cmNlLCBidXQgaXMgKm5vdCogYW4gSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBXZSBkb24ndCBuZWVkIHRvIHRyYWNrIHRoZSB0cmVlIHN0cnVjdHVyZSBvZiB0aGUgSFRNTCwgb25seVxuICAgICAgICAgICAgLy8gd2hldGhlciBhIGJpbmRpbmcgaXMgaW5zaWRlIGEgY29tbWVudCwgYW5kIGlmIG5vdCwgaWYgaXQgYXBwZWFycyB0byBiZVxuICAgICAgICAgICAgLy8gdGhlIGZpcnN0IGJpbmRpbmcgaW4gYW4gYXR0cmlidXRlLlxuICAgICAgICAgICAgY29uc3QgY29tbWVudE9wZW4gPSBzLmxhc3RJbmRleE9mKCc8IS0tJyk7XG4gICAgICAgICAgICAvLyBXZSdyZSBpbiBjb21tZW50IHBvc2l0aW9uIGlmIHdlIGhhdmUgYSBjb21tZW50IG9wZW4gd2l0aCBubyBmb2xsb3dpbmdcbiAgICAgICAgICAgIC8vIGNvbW1lbnQgY2xvc2UuIEJlY2F1c2UgPC0tIGNhbiBhcHBlYXIgaW4gYW4gYXR0cmlidXRlIHZhbHVlIHRoZXJlIGNhblxuICAgICAgICAgICAgLy8gYmUgZmFsc2UgcG9zaXRpdmVzLlxuICAgICAgICAgICAgaXNDb21tZW50QmluZGluZyA9IChjb21tZW50T3BlbiA+IC0xIHx8IGlzQ29tbWVudEJpbmRpbmcpICYmXG4gICAgICAgICAgICAgICAgcy5pbmRleE9mKCctLT4nLCBjb21tZW50T3BlbiArIDEpID09PSAtMTtcbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGFuIGF0dHJpYnV0ZS1saWtlIHNlcXVlbmNlIHByZWNlZWRpbmcgdGhlXG4gICAgICAgICAgICAvLyBleHByZXNzaW9uLiBUaGlzIGNhbiBtYXRjaCBcIm5hbWU9dmFsdWVcIiBsaWtlIHN0cnVjdHVyZXMgaW4gdGV4dCxcbiAgICAgICAgICAgIC8vIGNvbW1lbnRzLCBhbmQgYXR0cmlidXRlIHZhbHVlcywgc28gdGhlcmUgY2FuIGJlIGZhbHNlLXBvc2l0aXZlcy5cbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZU1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZU1hdGNoID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgb25seSBpbiB0aGlzIGJyYW5jaCBpZiB3ZSBkb24ndCBoYXZlIGEgYXR0cmlidXRlLWxpa2VcbiAgICAgICAgICAgICAgICAvLyBwcmVjZWVkaW5nIHNlcXVlbmNlLiBGb3IgY29tbWVudHMsIHRoaXMgZ3VhcmRzIGFnYWluc3QgdW51c3VhbFxuICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZSB2YWx1ZXMgbGlrZSA8ZGl2IGZvbz1cIjwhLS0keydiYXInfVwiPi4gQ2FzZXMgbGlrZVxuICAgICAgICAgICAgICAgIC8vIDwhLS0gZm9vPSR7J2Jhcid9LS0+IGFyZSBoYW5kbGVkIGNvcnJlY3RseSBpbiB0aGUgYXR0cmlidXRlIGJyYW5jaFxuICAgICAgICAgICAgICAgIC8vIGJlbG93LlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcyArIChpc0NvbW1lbnRCaW5kaW5nID8gY29tbWVudE1hcmtlciA6IG5vZGVNYXJrZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIGF0dHJpYnV0ZXMgd2UgdXNlIGp1c3QgYSBtYXJrZXIgc2VudGluZWwsIGFuZCBhbHNvIGFwcGVuZCBhXG4gICAgICAgICAgICAgICAgLy8gJGxpdCQgc3VmZml4IHRvIHRoZSBuYW1lIHRvIG9wdC1vdXQgb2YgYXR0cmlidXRlLXNwZWNpZmljIHBhcnNpbmdcbiAgICAgICAgICAgICAgICAvLyB0aGF0IElFIGFuZCBFZGdlIGRvIGZvciBzdHlsZSBhbmQgY2VydGFpbiBTVkcgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMuc3Vic3RyKDAsIGF0dHJpYnV0ZU1hdGNoLmluZGV4KSArIGF0dHJpYnV0ZU1hdGNoWzFdICtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlTWF0Y2hbMl0gKyBib3VuZEF0dHJpYnV0ZVN1ZmZpeCArIGF0dHJpYnV0ZU1hdGNoWzNdICtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGh0bWwgKz0gdGhpcy5zdHJpbmdzW2xdO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGVFbGVtZW50KCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHRoaXMuZ2V0SFRNTCgpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuLyoqXG4gKiBBIFRlbXBsYXRlUmVzdWx0IGZvciBTVkcgZnJhZ21lbnRzLlxuICpcbiAqIFRoaXMgY2xhc3Mgd3JhcHMgSFRNTCBpbiBhbiBgPHN2Zz5gIHRhZyBpbiBvcmRlciB0byBwYXJzZSBpdHMgY29udGVudHMgaW4gdGhlXG4gKiBTVkcgbmFtZXNwYWNlLCB0aGVuIG1vZGlmaWVzIHRoZSB0ZW1wbGF0ZSB0byByZW1vdmUgdGhlIGA8c3ZnPmAgdGFnIHNvIHRoYXRcbiAqIGNsb25lcyBvbmx5IGNvbnRhaW5lciB0aGUgb3JpZ2luYWwgZnJhZ21lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTVkdUZW1wbGF0ZVJlc3VsdCBleHRlbmRzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBnZXRIVE1MKCkge1xuICAgICAgICByZXR1cm4gYDxzdmc+JHtzdXBlci5nZXRIVE1MKCl9PC9zdmc+YDtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGVFbGVtZW50KCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHN1cGVyLmdldFRlbXBsYXRlRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGVtcGxhdGUuY29udGVudDtcbiAgICAgICAgY29uc3Qgc3ZnRWxlbWVudCA9IGNvbnRlbnQuZmlyc3RDaGlsZDtcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChzdmdFbGVtZW50KTtcbiAgICAgICAgcmVwYXJlbnROb2Rlcyhjb250ZW50LCBzdmdFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtcmVzdWx0LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL3BhcnQuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgISh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykpO1xufTtcbmV4cG9ydCBjb25zdCBpc0l0ZXJhYmxlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpIHx8XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgISEodmFsdWUgJiYgdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSk7XG59O1xuLyoqXG4gKiBXcml0ZXMgYXR0cmlidXRlIHZhbHVlcyB0byB0aGUgRE9NIGZvciBhIGdyb3VwIG9mIEF0dHJpYnV0ZVBhcnRzIGJvdW5kIHRvIGFcbiAqIHNpbmdsZSBhdHRpYnV0ZS4gVGhlIHZhbHVlIGlzIG9ubHkgc2V0IG9uY2UgZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHNcbiAqIGZvciBhbiBhdHRyaWJ1dGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgICAgIHRoaXMucGFydHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wYXJ0c1tpXSA9IHRoaXMuX2NyZWF0ZVBhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2luZ2xlIHBhcnQuIE92ZXJyaWRlIHRoaXMgdG8gY3JlYXRlIGEgZGlmZmVybnQgdHlwZSBvZiBwYXJ0LlxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IEF0dHJpYnV0ZVBhcnQodGhpcyk7XG4gICAgfVxuICAgIF9nZXRWYWx1ZSgpIHtcbiAgICAgICAgY29uc3Qgc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcbiAgICAgICAgY29uc3QgbCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IHRleHQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRleHQgKz0gc3RyaW5nc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLnBhcnRzW2ldO1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBwYXJ0LnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2KSB8fCAhaXNJdGVyYWJsZSh2KSkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiBTdHJpbmcodik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHQgb2Ygdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdCA9PT0gJ3N0cmluZycgPyB0IDogU3RyaW5nKHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRleHQgKz0gc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCB0aGlzLl9nZXRWYWx1ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQSBQYXJ0IHRoYXQgY29udHJvbHMgYWxsIG9yIHBhcnQgb2YgYW4gYXR0cmlidXRlIHZhbHVlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoY29tbWl0dGVyKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY29tbWl0dGVyID0gY29tbWl0dGVyO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IG5vQ2hhbmdlICYmICghaXNQcmltaXRpdmUodmFsdWUpIHx8IHZhbHVlICE9PSB0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGEgbm90IGEgZGlyZWN0aXZlLCBkaXJ0eSB0aGUgY29tbWl0dGVyIHNvIHRoYXQgaXQnbGxcbiAgICAgICAgICAgIC8vIGNhbGwgc2V0QXR0cmlidXRlLiBJZiB0aGUgdmFsdWUgaXMgYSBkaXJlY3RpdmUsIGl0J2xsIGRpcnR5IHRoZVxuICAgICAgICAgICAgLy8gY29tbWl0dGVyIGlmIGl0IGNhbGxzIHNldFZhbHVlKCkuXG4gICAgICAgICAgICBpZiAoIWlzRGlyZWN0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tbWl0dGVyLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1pdHRlci5jb21taXQoKTtcbiAgICB9XG59XG4vKipcbiAqIEEgUGFydCB0aGF0IGNvbnRyb2xzIGEgbG9jYXRpb24gd2l0aGluIGEgTm9kZSB0cmVlLiBMaWtlIGEgUmFuZ2UsIE5vZGVQYXJ0XG4gKiBoYXMgc3RhcnQgYW5kIGVuZCBsb2NhdGlvbnMgYW5kIGNhbiBzZXQgYW5kIHVwZGF0ZSB0aGUgTm9kZXMgYmV0d2VlbiB0aG9zZVxuICogbG9jYXRpb25zLlxuICpcbiAqIE5vZGVQYXJ0cyBzdXBwb3J0IHNldmVyYWwgdmFsdWUgdHlwZXM6IHByaW1pdGl2ZXMsIE5vZGVzLCBUZW1wbGF0ZVJlc3VsdHMsXG4gKiBhcyB3ZWxsIGFzIGFycmF5cyBhbmQgaXRlcmFibGVzIG9mIHRob3NlIHR5cGVzLlxuICovXG5leHBvcnQgY2xhc3MgTm9kZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG8oY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYWZ0ZXIgdGhlIGByZWZgIG5vZGUgKGJldHdlZW4gYHJlZmAgYW5kIGByZWZgJ3MgbmV4dFxuICAgICAqIHNpYmxpbmcpLiBCb3RoIGByZWZgIGFuZCBpdHMgbmV4dCBzaWJsaW5nIG11c3QgYmUgc3RhdGljLCB1bmNoYW5naW5nIG5vZGVzXG4gICAgICogc3VjaCBhcyB0aG9zZSB0aGF0IGFwcGVhciBpbiBhIGxpdGVyYWwgc2VjdGlvbiBvZiBhIHRlbXBsYXRlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJOb2RlKHJlZikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IHJlZjtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgcGFyZW50IHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvUGFydChwYXJ0KSB7XG4gICAgICAgIHBhcnQuX19pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHBhcnQuX19pbnNlcnQodGhpcy5lbmROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBhZnRlciB0aGUgYHJlZmAgcGFydC5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyUGFydChyZWYpIHtcbiAgICAgICAgcmVmLl9faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYuZW5kTm9kZTtcbiAgICAgICAgcmVmLmVuZE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNQcmltaXRpdmUodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZVJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0l0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gbm90aGluZykge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5vdGhpbmc7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBGYWxsYmFjaywgd2lsbCByZW5kZXIgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9faW5zZXJ0KG5vZGUpIHtcbiAgICAgICAgdGhpcy5lbmROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxuICAgIF9fY29tbWl0Tm9kZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX19pbnNlcnQodmFsdWUpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9fY29tbWl0VGV4dCh2YWx1ZSkge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zdGFydE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG4gICAgICAgIC8vIElmIGB2YWx1ZWAgaXNuJ3QgYWxyZWFkeSBhIHN0cmluZywgd2UgZXhwbGljaXRseSBjb252ZXJ0IGl0IGhlcmUgaW4gY2FzZVxuICAgICAgICAvLyBpdCBjYW4ndCBiZSBpbXBsaWNpdGx5IGNvbnZlcnRlZCAtIGkuZS4gaXQncyBhIHN5bWJvbC5cbiAgICAgICAgY29uc3QgdmFsdWVBc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLmVuZE5vZGUucHJldmlvdXNTaWJsaW5nICYmXG4gICAgICAgICAgICBub2RlLm5vZGVUeXBlID09PSAzIC8qIE5vZGUuVEVYVF9OT0RFICovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBvbmx5IGhhdmUgYSBzaW5nbGUgdGV4dCBub2RlIGJldHdlZW4gdGhlIG1hcmtlcnMsIHdlIGNhbiBqdXN0XG4gICAgICAgICAgICAvLyBzZXQgaXRzIHZhbHVlLCByYXRoZXIgdGhhbiByZXBsYWNpbmcgaXQuXG4gICAgICAgICAgICAvLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBDYW4gd2UganVzdCBjaGVjayBpZiB0aGlzLnZhbHVlIGlzIHByaW1pdGl2ZT9cbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IHZhbHVlQXNTdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZShkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZUFzU3RyaW5nKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlRmFjdG9yeSh2YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVJbnN0YW5jZSAmJlxuICAgICAgICAgICAgdGhpcy52YWx1ZS50ZW1wbGF0ZSA9PT0gdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgcHJvcGFnYXRlIHRoZSB0ZW1wbGF0ZSBwcm9jZXNzb3IgZnJvbSB0aGUgVGVtcGxhdGVSZXN1bHRcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgdXNlIGl0cyBzeW50YXggZXh0ZW5zaW9uLCBldGMuIFRoZSB0ZW1wbGF0ZSBmYWN0b3J5IGNvbWVzXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSByZW5kZXIgZnVuY3Rpb24gb3B0aW9ucyBzbyB0aGF0IGl0IGNhbiBjb250cm9sIHRlbXBsYXRlXG4gICAgICAgICAgICAvLyBjYWNoaW5nIGFuZCBwcmVwcm9jZXNzaW5nLlxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSwgdmFsdWUucHJvY2Vzc29yLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpbnN0YW5jZS5fY2xvbmUoKTtcbiAgICAgICAgICAgIGluc3RhbmNlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9fY29tbWl0SXRlcmFibGUodmFsdWUpIHtcbiAgICAgICAgLy8gRm9yIGFuIEl0ZXJhYmxlLCB3ZSBjcmVhdGUgYSBuZXcgSW5zdGFuY2VQYXJ0IHBlciBpdGVtLCB0aGVuIHNldCBpdHNcbiAgICAgICAgLy8gdmFsdWUgdG8gdGhlIGl0ZW0uIFRoaXMgaXMgYSBsaXR0bGUgYml0IG9mIG92ZXJoZWFkIGZvciBldmVyeSBpdGVtIGluXG4gICAgICAgIC8vIGFuIEl0ZXJhYmxlLCBidXQgaXQgbGV0cyB1cyByZWN1cnNlIGVhc2lseSBhbmQgZWZmaWNpZW50bHkgdXBkYXRlIEFycmF5c1xuICAgICAgICAvLyBvZiBUZW1wbGF0ZVJlc3VsdHMgdGhhdCB3aWxsIGJlIGNvbW1vbmx5IHJldHVybmVkIGZyb20gZXhwcmVzc2lvbnMgbGlrZTpcbiAgICAgICAgLy8gYXJyYXkubWFwKChpKSA9PiBodG1sYCR7aX1gKSwgYnkgcmV1c2luZyBleGlzdGluZyBUZW1wbGF0ZUluc3RhbmNlcy5cbiAgICAgICAgLy8gSWYgX3ZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgICAgIC8vIGl0ZXJhYmxlIGFuZCBfdmFsdWUgd2lsbCBjb250YWluIHRoZSBOb2RlUGFydHMgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAgICAgLy8gcmVuZGVyLiBJZiBfdmFsdWUgaXMgbm90IGFuIGFycmF5LCBjbGVhciB0aGlzIHBhcnQgYW5kIG1ha2UgYSBuZXdcbiAgICAgICAgLy8gYXJyYXkgZm9yIE5vZGVQYXJ0cy5cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTGV0cyB1cyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGl0ZW1zIHdlIHN0YW1wZWQgc28gd2UgY2FuIGNsZWFyIGxlZnRvdmVyXG4gICAgICAgIC8vIGl0ZW1zIGZyb20gYSBwcmV2aW91cyByZW5kZXJcbiAgICAgICAgY29uc3QgaXRlbVBhcnRzID0gdGhpcy52YWx1ZTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpdGVtUGFydDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gcmV1c2UgYW4gZXhpc3RpbmcgcGFydFxuICAgICAgICAgICAgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICAgIGlmIChpdGVtUGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnQgPSBuZXcgTm9kZVBhcnQodGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpdGVtUGFydHMucHVzaChpdGVtUGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5hcHBlbmRJbnRvUGFydCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0Lmluc2VydEFmdGVyUGFydChpdGVtUGFydHNbcGFydEluZGV4IC0gMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1QYXJ0LnNldFZhbHVlKGl0ZW0pO1xuICAgICAgICAgICAgaXRlbVBhcnQuY29tbWl0KCk7XG4gICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydEluZGV4IDwgaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gVHJ1bmNhdGUgdGhlIHBhcnRzIGFycmF5IHNvIF92YWx1ZSByZWZsZWN0cyB0aGUgY3VycmVudCBzdGF0ZVxuICAgICAgICAgICAgaXRlbVBhcnRzLmxlbmd0aCA9IHBhcnRJbmRleDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoaXRlbVBhcnQgJiYgaXRlbVBhcnQuZW5kTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXIoc3RhcnROb2RlID0gdGhpcy5zdGFydE5vZGUpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXModGhpcy5zdGFydE5vZGUucGFyZW50Tm9kZSwgc3RhcnROb2RlLm5leHRTaWJsaW5nLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbn1cbi8qKlxuICogSW1wbGVtZW50cyBhIGJvb2xlYW4gYXR0cmlidXRlLCByb3VnaGx5IGFzIGRlZmluZWQgaW4gdGhlIEhUTUxcbiAqIHNwZWNpZmljYXRpb24uXG4gKlxuICogSWYgdGhlIHZhbHVlIGlzIHRydXRoeSwgdGhlbiB0aGUgYXR0cmlidXRlIGlzIHByZXNlbnQgd2l0aCBhIHZhbHVlIG9mXG4gKiAnJy4gSWYgdGhlIHZhbHVlIGlzIGZhbHNleSwgdGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHN0cmluZ3MubGVuZ3RoICE9PSAyIHx8IHN0cmluZ3NbMF0gIT09ICcnIHx8IHN0cmluZ3NbMV0gIT09ICcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb2xlYW4gYXR0cmlidXRlcyBjYW4gb25seSBjb250YWluIGEgc2luZ2xlIGV4cHJlc3Npb24nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gISF0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHRoaXMubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbn1cbi8qKlxuICogU2V0cyBhdHRyaWJ1dGUgdmFsdWVzIGZvciBQcm9wZXJ0eVBhcnRzLCBzbyB0aGF0IHRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlXG4gKiBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0cyBmb3IgYSBwcm9wZXJ0eS5cbiAqXG4gKiBJZiBhbiBleHByZXNzaW9uIGNvbnRyb2xzIHRoZSB3aG9sZSBwcm9wZXJ0eSB2YWx1ZSwgdGhlbiB0aGUgdmFsdWUgaXMgc2ltcGx5XG4gKiBhc3NpZ25lZCB0byB0aGUgcHJvcGVydHkgdW5kZXIgY29udHJvbC4gSWYgdGhlcmUgYXJlIHN0cmluZyBsaXRlcmFscyBvclxuICogbXVsdGlwbGUgZXhwcmVzc2lvbnMsIHRoZW4gdGhlIHN0cmluZ3MgYXJlIGV4cHJlc3Npb25zIGFyZSBpbnRlcnBvbGF0ZWQgaW50b1xuICogYSBzdHJpbmcgZmlyc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUNvbW1pdHRlciBleHRlbmRzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKTtcbiAgICAgICAgdGhpcy5zaW5nbGUgPVxuICAgICAgICAgICAgKHN0cmluZ3MubGVuZ3RoID09PSAyICYmIHN0cmluZ3NbMF0gPT09ICcnICYmIHN0cmluZ3NbMV0gPT09ICcnKTtcbiAgICB9XG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnNpbmdsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydHNbMF0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRWYWx1ZSgpO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRbdGhpcy5uYW1lXSA9IHRoaXMuX2dldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUHJvcGVydHlQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG59XG4vLyBEZXRlY3QgZXZlbnQgbGlzdGVuZXIgb3B0aW9ucyBzdXBwb3J0LiBJZiB0aGUgYGNhcHR1cmVgIHByb3BlcnR5IGlzIHJlYWRcbi8vIGZyb20gdGhlIG9wdGlvbnMgb2JqZWN0LCB0aGVuIG9wdGlvbnMgYXJlIHN1cHBvcnRlZC4gSWYgbm90LCB0aGVuIHRoZSB0aHJpZFxuLy8gYXJndW1lbnQgdG8gYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaXMgaW50ZXJwcmV0ZWQgYXMgdGhlIGJvb2xlYW4gY2FwdHVyZVxuLy8gdmFsdWUgc28gd2Ugc2hvdWxkIG9ubHkgcGFzcyB0aGUgYGNhcHR1cmVgIHByb3BlcnR5LlxubGV0IGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IGZhbHNlO1xudHJ5IHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBnZXQgY2FwdHVyZSgpIHtcbiAgICAgICAgICAgIGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xufVxuY2F0Y2ggKF9lKSB7XG59XG5leHBvcnQgY2xhc3MgRXZlbnRQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBldmVudE5hbWUsIGV2ZW50Q29udGV4dCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5ldmVudENvbnRleHQgPSBldmVudENvbnRleHQ7XG4gICAgICAgIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50ID0gKGUpID0+IHRoaXMuaGFuZGxlRXZlbnQoZSk7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3TGlzdGVuZXIgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBjb25zdCBvbGRMaXN0ZW5lciA9IHRoaXMudmFsdWU7XG4gICAgICAgIGNvbnN0IHNob3VsZFJlbW92ZUxpc3RlbmVyID0gbmV3TGlzdGVuZXIgPT0gbnVsbCB8fFxuICAgICAgICAgICAgb2xkTGlzdGVuZXIgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIChuZXdMaXN0ZW5lci5jYXB0dXJlICE9PSBvbGRMaXN0ZW5lci5jYXB0dXJlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLm9uY2UgIT09IG9sZExpc3RlbmVyLm9uY2UgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIucGFzc2l2ZSAhPT0gb2xkTGlzdGVuZXIucGFzc2l2ZSk7XG4gICAgICAgIGNvbnN0IHNob3VsZEFkZExpc3RlbmVyID0gbmV3TGlzdGVuZXIgIT0gbnVsbCAmJiAob2xkTGlzdGVuZXIgPT0gbnVsbCB8fCBzaG91bGRSZW1vdmVMaXN0ZW5lcik7XG4gICAgICAgIGlmIChzaG91bGRSZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudE5hbWUsIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9fb3B0aW9ucyA9IGdldE9wdGlvbnMobmV3TGlzdGVuZXIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5ldmVudE5hbWUsIHRoaXMuX19ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IG5ld0xpc3RlbmVyO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS5jYWxsKHRoaXMuZXZlbnRDb250ZXh0IHx8IHRoaXMuZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS5oYW5kbGVFdmVudChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBXZSBjb3B5IG9wdGlvbnMgYmVjYXVzZSBvZiB0aGUgaW5jb25zaXN0ZW50IGJlaGF2aW9yIG9mIGJyb3dzZXJzIHdoZW4gcmVhZGluZ1xuLy8gdGhlIHRoaXJkIGFyZ3VtZW50IG9mIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyLiBJRTExIGRvZXNuJ3Qgc3VwcG9ydCBvcHRpb25zXG4vLyBhdCBhbGwuIENocm9tZSA0MSBvbmx5IHJlYWRzIGBjYXB0dXJlYCBpZiB0aGUgYXJndW1lbnQgaXMgYW4gb2JqZWN0LlxuY29uc3QgZ2V0T3B0aW9ucyA9IChvKSA9PiBvICYmXG4gICAgKGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA/XG4gICAgICAgIHsgY2FwdHVyZTogby5jYXB0dXJlLCBwYXNzaXZlOiBvLnBhc3NpdmUsIG9uY2U6IG8ub25jZSB9IDpcbiAgICAgICAgby5jYXB0dXJlKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnRzLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IEF0dHJpYnV0ZUNvbW1pdHRlciwgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsIEV2ZW50UGFydCwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyIH0gZnJvbSAnLi9wYXJ0cy5qcyc7XG4vKipcbiAqIENyZWF0ZXMgUGFydHMgd2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhbiBhdHRyaWJ1dGUtcG9zaXRpb24gYmluZGluZywgZ2l2ZW4gdGhlIGV2ZW50LCBhdHRyaWJ1dGVcbiAgICAgKiBuYW1lLCBhbmQgc3RyaW5nIGxpdGVyYWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYmluZGluZ1xuICAgICAqIEBwYXJhbSBuYW1lICBUaGUgYXR0cmlidXRlIG5hbWVcbiAgICAgKiBAcGFyYW0gc3RyaW5ncyBUaGUgc3RyaW5nIGxpdGVyYWxzLiBUaGVyZSBhcmUgYWx3YXlzIGF0IGxlYXN0IHR3byBzdHJpbmdzLFxuICAgICAqICAgZXZlbnQgZm9yIGZ1bGx5LWNvbnRyb2xsZWQgYmluZGluZ3Mgd2l0aCBhIHNpbmdsZSBleHByZXNzaW9uLlxuICAgICAqL1xuICAgIGhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gbmFtZVswXTtcbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBjb25zdCBjb21taXR0ZXIgPSBuZXcgUHJvcGVydHlDb21taXR0ZXIoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyk7XG4gICAgICAgICAgICByZXR1cm4gY29tbWl0dGVyLnBhcnRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICdAJykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgRXZlbnRQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIG9wdGlvbnMuZXZlbnRDb250ZXh0KV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJz8nKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBCb29sZWFuQXR0cmlidXRlUGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tbWl0dGVyID0gbmV3IEF0dHJpYnV0ZUNvbW1pdHRlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKTtcbiAgICAgICAgcmV0dXJuIGNvbW1pdHRlci5wYXJ0cztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhIHRleHQtcG9zaXRpb24gYmluZGluZy5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVGYWN0b3J5XG4gICAgICovXG4gICAgaGFuZGxlVGV4dEV4cHJlc3Npb24ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVQYXJ0KG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgPSBuZXcgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBtYXJrZXIsIFRlbXBsYXRlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIFRoZSBkZWZhdWx0IFRlbXBsYXRlRmFjdG9yeSB3aGljaCBjYWNoZXMgVGVtcGxhdGVzIGtleWVkIG9uXG4gKiByZXN1bHQudHlwZSBhbmQgcmVzdWx0LnN0cmluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUZhY3RvcnkocmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlQ2FjaGUgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQocmVzdWx0LnR5cGUpO1xuICAgIGlmICh0ZW1wbGF0ZUNhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGVtcGxhdGVDYWNoZSA9IHtcbiAgICAgICAgICAgIHN0cmluZ3NBcnJheTogbmV3IFdlYWtNYXAoKSxcbiAgICAgICAgICAgIGtleVN0cmluZzogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgICAgIHRlbXBsYXRlQ2FjaGVzLnNldChyZXN1bHQudHlwZSwgdGVtcGxhdGVDYWNoZSk7XG4gICAgfVxuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LmdldChyZXN1bHQuc3RyaW5ncyk7XG4gICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgVGVtcGxhdGVTdHJpbmdzQXJyYXkgaXMgbmV3LCBnZW5lcmF0ZSBhIGtleSBmcm9tIHRoZSBzdHJpbmdzXG4gICAgLy8gVGhpcyBrZXkgaXMgc2hhcmVkIGJldHdlZW4gYWxsIHRlbXBsYXRlcyB3aXRoIGlkZW50aWNhbCBjb250ZW50XG4gICAgY29uc3Qga2V5ID0gcmVzdWx0LnN0cmluZ3Muam9pbihtYXJrZXIpO1xuICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgaGF2ZSBhIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuZ2V0KGtleSk7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBub3Qgc2VlbiB0aGlzIGtleSBiZWZvcmUsIGNyZWF0ZSBhIG5ldyBUZW1wbGF0ZVxuICAgICAgICB0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQsIHJlc3VsdC5nZXRUZW1wbGF0ZUVsZW1lbnQoKSk7XG4gICAgICAgIC8vIENhY2hlIHRoZSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICAgICAgdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuc2V0KGtleSwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvLyBDYWNoZSBhbGwgZnV0dXJlIHF1ZXJpZXMgZm9yIHRoaXMgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAgICB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5zZXQocmVzdWx0LnN0cmluZ3MsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG59XG5leHBvcnQgY29uc3QgdGVtcGxhdGVDYWNoZXMgPSBuZXcgTWFwKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1mYWN0b3J5LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IE5vZGVQYXJ0IH0gZnJvbSAnLi9wYXJ0cy5qcyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IGNvbnN0IHBhcnRzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogUmVuZGVycyBhIHRlbXBsYXRlIHJlc3VsdCBvciBvdGhlciB2YWx1ZSB0byBhIGNvbnRhaW5lci5cbiAqXG4gKiBUbyB1cGRhdGUgYSBjb250YWluZXIgd2l0aCBuZXcgdmFsdWVzLCByZWV2YWx1YXRlIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIGFuZFxuICogY2FsbCBgcmVuZGVyYCB3aXRoIHRoZSBuZXcgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSByZXN1bHQgQW55IHZhbHVlIHJlbmRlcmFibGUgYnkgTm9kZVBhcnQgLSB0eXBpY2FsbHkgYSBUZW1wbGF0ZVJlc3VsdFxuICogICAgIGNyZWF0ZWQgYnkgZXZhbHVhdGluZyBhIHRlbXBsYXRlIHRhZyBsaWtlIGBodG1sYCBvciBgc3ZnYC5cbiAqIEBwYXJhbSBjb250YWluZXIgQSBET00gcGFyZW50IHRvIHJlbmRlciB0by4gVGhlIGVudGlyZSBjb250ZW50cyBhcmUgZWl0aGVyXG4gKiAgICAgcmVwbGFjZWQsIG9yIGVmZmljaWVudGx5IHVwZGF0ZWQgaWYgdGhlIHNhbWUgcmVzdWx0IHR5cGUgd2FzIHByZXZpb3VzXG4gKiAgICAgcmVuZGVyZWQgdGhlcmUuXG4gKiBAcGFyYW0gb3B0aW9ucyBSZW5kZXJPcHRpb25zIGZvciB0aGUgZW50aXJlIHJlbmRlciB0cmVlIHJlbmRlcmVkIHRvIHRoaXNcbiAqICAgICBjb250YWluZXIuIFJlbmRlciBvcHRpb25zIG11c3QgKm5vdCogY2hhbmdlIGJldHdlZW4gcmVuZGVycyB0byB0aGUgc2FtZVxuICogICAgIGNvbnRhaW5lciwgYXMgdGhvc2UgY2hhbmdlcyB3aWxsIG5vdCBlZmZlY3QgcHJldmlvdXNseSByZW5kZXJlZCBET00uXG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXIgPSAocmVzdWx0LCBjb250YWluZXIsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgcGFydCA9IHBhcnRzLmdldChjb250YWluZXIpO1xuICAgIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXMoY29udGFpbmVyLCBjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIHBhcnRzLnNldChjb250YWluZXIsIHBhcnQgPSBuZXcgTm9kZVBhcnQoT2JqZWN0LmFzc2lnbih7IHRlbXBsYXRlRmFjdG9yeSB9LCBvcHRpb25zKSkpO1xuICAgICAgICBwYXJ0LmFwcGVuZEludG8oY29udGFpbmVyKTtcbiAgICB9XG4gICAgcGFydC5zZXRWYWx1ZShyZXN1bHQpO1xuICAgIHBhcnQuY29tbWl0KCk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVuZGVyLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICpcbiAqIE1haW4gbGl0LWh0bWwgbW9kdWxlLlxuICpcbiAqIE1haW4gZXhwb3J0czpcbiAqXG4gKiAtICBbW2h0bWxdXVxuICogLSAgW1tzdmddXVxuICogLSAgW1tyZW5kZXJdXVxuICpcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqIEBwcmVmZXJyZWRcbiAqL1xuLyoqXG4gKiBEbyBub3QgcmVtb3ZlIHRoaXMgY29tbWVudDsgaXQga2VlcHMgdHlwZWRvYyBmcm9tIG1pc3BsYWNpbmcgdGhlIG1vZHVsZVxuICogZG9jcy5cbiAqL1xuaW1wb3J0IHsgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIH0gZnJvbSAnLi9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMnO1xuaW1wb3J0IHsgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtcmVzdWx0LmpzJztcbmV4cG9ydCB7IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciwgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIH0gZnJvbSAnLi9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMnO1xuZXhwb3J0IHsgZGlyZWN0aXZlLCBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vbGliL2RpcmVjdGl2ZS5qcyc7XG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiByZW1vdmUgbGluZSB3aGVuIHdlIGdldCBOb2RlUGFydCBtb3ZpbmcgbWV0aG9kc1xuZXhwb3J0IHsgcmVtb3ZlTm9kZXMsIHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2xpYi9kb20uanMnO1xuZXhwb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL2xpYi9wYXJ0LmpzJztcbmV4cG9ydCB7IEF0dHJpYnV0ZUNvbW1pdHRlciwgQXR0cmlidXRlUGFydCwgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsIEV2ZW50UGFydCwgaXNJdGVyYWJsZSwgaXNQcmltaXRpdmUsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciwgUHJvcGVydHlQYXJ0IH0gZnJvbSAnLi9saWIvcGFydHMuanMnO1xuZXhwb3J0IHsgcGFydHMsIHJlbmRlciB9IGZyb20gJy4vbGliL3JlbmRlci5qcyc7XG5leHBvcnQgeyB0ZW1wbGF0ZUNhY2hlcywgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuZXhwb3J0IHsgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtcmVzdWx0LmpzJztcbmV4cG9ydCB7IGNyZWF0ZU1hcmtlciwgaXNUZW1wbGF0ZVBhcnRBY3RpdmUsIFRlbXBsYXRlIH0gZnJvbSAnLi9saWIvdGVtcGxhdGUuanMnO1xuLy8gSU1QT1JUQU5UOiBkbyBub3QgY2hhbmdlIHRoZSBwcm9wZXJ0eSBuYW1lIG9yIHRoZSBhc3NpZ25tZW50IGV4cHJlc3Npb24uXG4vLyBUaGlzIGxpbmUgd2lsbCBiZSB1c2VkIGluIHJlZ2V4ZXMgdG8gc2VhcmNoIGZvciBsaXQtaHRtbCB1c2FnZS5cbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IGluamVjdCB2ZXJzaW9uIG51bWJlciBhdCBidWlsZCB0aW1lXG4od2luZG93WydsaXRIdG1sVmVyc2lvbnMnXSB8fCAod2luZG93WydsaXRIdG1sVmVyc2lvbnMnXSA9IFtdKSkucHVzaCgnMS4xLjInKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gSFRNTCB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBodG1sID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gbmV3IFRlbXBsYXRlUmVzdWx0KHN0cmluZ3MsIHZhbHVlcywgJ2h0bWwnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBTVkcgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3Qgc3ZnID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gbmV3IFNWR1RlbXBsYXRlUmVzdWx0KHN0cmluZ3MsIHZhbHVlcywgJ3N2ZycsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1saXQtaHRtbC5qcy5tYXAiLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi4vY29tcG9uZW50XCI7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgbWFwIGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBhIHByb3BlcnR5IHZhbHVlXG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZU1hcHBlcjxDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50LCBUID0gYW55PiA9ICh0aGlzOiBDLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gVCB8IG51bGw7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgbWFwIGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gYXR0cmlidXRlIHZhbHVlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5TWFwcGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQsIFQgPSBhbnk+ID0gKHRoaXM6IEMsIHZhbHVlOiBUIHwgbnVsbCkgPT4gc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBbiBvYmplY3QgdGhhdCBob2xkcyBhbiB7QGxpbmsgQXR0cmlidXRlTWFwcGVyfSBhbmQgYSB7QGxpbmsgUHJvcGVydHlNYXBwZXJ9XG4gKlxuICogQHJlbWFya3NcbiAqIEZvciB0aGUgbW9zdCBjb21tb24gdHlwZXMsIGEgY29udmVydGVyIGV4aXN0cyB3aGljaCBjYW4gYmUgcmVmZXJlbmNlZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICpcbiAqICAgICAgQHByb3BlcnR5KHtcbiAqICAgICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICogICAgICB9KVxuICogICAgICBteVByb3BlcnR5ID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZUNvbnZlcnRlcjxDIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50LCBUID0gYW55PiB7XG4gICAgdG9BdHRyaWJ1dGU6IFByb3BlcnR5TWFwcGVyPEMsIFQ+O1xuICAgIGZyb21BdHRyaWJ1dGU6IEF0dHJpYnV0ZU1hcHBlcjxDLCBUPjtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgY29udmVydGVyXG4gKlxuICogQHJlbWFya3NcbiAqIFRoaXMgY29udmVydGVyIGlzIHVzZWQgYXMgdGhlIGRlZmF1bHQgY29udmVydGVyIGZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB1bmxlc3MgYSBkaWZmZXJlbnQgb25lXG4gKiBpcyBzcGVjaWZpZWQuIFRoZSBjb252ZXJ0ZXIgdHJpZXMgdG8gaW5mZXIgdGhlIHByb3BlcnR5IHR5cGUgd2hlbiBjb252ZXJ0aW5nIHRvIGF0dHJpYnV0ZXMgYW5kXG4gKiB1c2VzIGBKU09OLnBhcnNlKClgIHdoZW4gY29udmVydGluZyBzdHJpbmdzIGZyb20gYXR0cmlidXRlcy4gSWYgYEpTT04ucGFyc2UoKWAgdGhyb3dzIGFuIGVycm9yLFxuICogdGhlIGNvbnZlcnRlciB3aWxsIHVzZSB0aGUgYXR0cmlidXRlIHZhbHVlIGFzIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdDogQXR0cmlidXRlQ29udmVydGVyID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgc3VjY2Vzc2Z1bGx5IHBhcnNlIGBib29sZWFuYCwgYG51bWJlcmAgYW5kIGBKU09OLnN0cmluZ2lmeWAnZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBpdCB0aHJvd3MsIGl0IG1lYW5zIHdlJ3JlIHByb2JhYmx5IGRlYWxpbmcgd2l0aCBhIHJlZ3VsYXIgc3RyaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgIH0sXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IG51bGw7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBudW1iZXIsIGJpZ2ludCwgc3ltYm9sLCBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGJvb2xlYW4gYXR0cmlidXRlcywgbGlrZSBgZGlzYWJsZWRgLCB3aGljaCBhcmUgY29uc2lkZXJlZCB0cnVlIGlmIHRoZXkgYXJlIHNldCB3aXRoXG4gKiBhbnkgdmFsdWUgYXQgYWxsLiBJbiBvcmRlciB0byBzZXQgdGhlIGF0dHJpYnV0ZSB0byBmYWxzZSwgdGhlIGF0dHJpYnV0ZSBoYXMgdG8gYmUgcmVtb3ZlZCBieVxuICogc2V0dGluZyB0aGUgYXR0cmlidXRlIHZhbHVlIHRvIGBudWxsYC5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW46IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIGJvb2xlYW4+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlICE9PSBudWxsKSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBib29sZWFuIHwgbnVsbCkgPT4gdmFsdWUgPyAnJyA6IG51bGxcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGJvb2xlYW4gQVJJQSBhdHRyaWJ1dGVzLCBsaWtlIGBhcmlhLWNoZWNrZWRgIG9yIGBhcmlhLXNlbGVjdGVkYCwgd2hpY2ggaGF2ZSB0byBiZVxuICogc2V0IGV4cGxpY2l0bHkgdG8gYHRydWVgIG9yIGBmYWxzZWAuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgYm9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlKSA9PiB2YWx1ZSA9PT0gJ3RydWUnLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn07XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmc6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIHN0cmluZz4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwpID8gbnVsbCA6IHZhbHVlLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZhbHVlXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIG51bWJlcj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwpID8gbnVsbCA6IE51bWJlcih2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IG51bWJlciB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyT2JqZWN0OiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBvYmplY3Q+ID0ge1xuICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBKU09OLnBhcnNlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogb2JqZWN0IHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckFycmF5OiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBhbnlbXT4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnlbXSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGF0ZTogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgRGF0ZT4gPSB7XG4gICAgLy8gYG5ldyBEYXRlKClgIHdpbGwgcmV0dXJuIGFuIGBJbnZhbGlkIERhdGVgIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogbmV3IERhdGUodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBEYXRlIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5cbi8qKlxuICogQSB7QGxpbmsgQ29tcG9uZW50fSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudERlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2VsZWN0b3Igb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgc2VsZWN0b3Igd2lsbCBiZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3Igd2l0aCB0aGUgYnJvd3NlcidzXG4gICAgICoge0BsaW5rIHdpbmRvdy5jdXN0b21FbGVtZW50c30gQVBJLiBJZiBubyBzZWxlY3RvciBpcyBzcGVjaWZpZWQsIHRoZSBjb21wb25lbnQgY2xhc3NcbiAgICAgKiBuZWVkcyB0byBwcm92aWRlIG9uZSBpbiBpdHMgc3RhdGljIHtAbGluayBDb21wb25lbnQuc2VsZWN0b3J9IHByb3BlcnR5LlxuICAgICAqIEEgc2VsZWN0b3IgZGVmaW5lZCBpbiB0aGUge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufSB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRoZVxuICAgICAqIHN0YXRpYyBjbGFzcyBwcm9wZXJ0eS5cbiAgICAgKi9cbiAgICBzZWxlY3Rvcjogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFVzZSBTaGFkb3cgRE9NIHRvIHJlbmRlciB0aGUgY29tcG9uZW50cyB0ZW1wbGF0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2hhZG93IERPTSBjYW4gYmUgZGlzYWJsZWQgYnkgc2V0dGluZyB0aGlzIG9wdGlvbiB0byBgZmFsc2VgLCBpbiB3aGljaCBjYXNlIHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHRlbXBsYXRlIHdpbGwgYmUgcmVuZGVyZWQgYXMgY2hpbGQgbm9kZXMgb2YgdGhlIGNvbXBvbmVudC4gVGhpcyBjYW4gYmVcbiAgICAgKiB1c2VmdWwgaWYgYW4gaXNvbGF0ZWQgRE9NIGFuZCBzY29wZWQgQ1NTIGlzIG5vdCBkZXNpcmVkLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgc2hhZG93OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIEF1dG9tYXRpY2FsbHkgcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSBicm93c2VyJ3Mge0BsaW5rIHdpbmRvdy5jdXN0b21FbGVtZW50c30gQVBJP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJbiBjYXNlcyB3aGVyZSB5b3Ugd2FudCB0byBlbXBsb3kgYSBtb2R1bGUgc3lzdGVtIHdoaWNoIHJlZ2lzdGVycyBjb21wb25lbnRzIG9uIGFcbiAgICAgKiBjb25kaXRpb25hbCBiYXNpcywgeW91IGNhbiBkaXNhYmxlIGF1dG9tYXRpYyByZWdpc3RyYXRpb24gYnkgc2V0dGluZyB0aGlzIG9wdGlvbiB0byBgZmFsc2VgLlxuICAgICAqIFlvdXIgbW9kdWxlIG9yIGJvb3RzdHJhcCBzeXN0ZW0gd2lsbCBoYXZlIHRvIHRha2UgY2FyZSBvZiBkZWZpbmluZyB0aGUgY29tcG9uZW50IGxhdGVyLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgZGVmaW5lOiBib29sZWFuO1xuICAgIC8vIFRPRE86IHRlc3QgbWVkaWEgcXVlcmllc1xuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzdHlsZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQW4gYXJyYXkgb2YgQ1NTIHJ1bGVzZXRzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvU3ludGF4I0NTU19ydWxlc2V0cykuXG4gICAgICogU3R5bGVzIGRlZmluZWQgdXNpbmcgdGhlIGRlY29yYXRvciB3aWxsIGJlIG1lcmdlZCB3aXRoIHN0eWxlcyBkZWZpbmVkIGluIHRoZSBjb21wb25lbnQnc1xuICAgICAqIHN0YXRpYyB7QGxpbmsgQ29tcG9uZW50LnN0eWxlc30gZ2V0dGVyLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc3R5bGVzOiBbXG4gICAgICogICAgICAgICAgJ2gxLCBoMiB7IGZvbnQtc2l6ZTogMTZwdDsgfScsXG4gICAgICogICAgICAgICAgJ0BtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDkwMHB4KSB7IGFydGljbGUgeyBwYWRkaW5nOiAxcmVtIDNyZW07IH0gfSdcbiAgICAgKiAgICAgIF1cbiAgICAgKiB9KVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHVuZGVmaW5lZGBcbiAgICAgKi9cbiAgICBzdHlsZXM/OiBzdHJpbmdbXTtcbiAgICAvLyBUT0RPOiB1cGRhdGUgZG9jdW1lbnRhdGlvblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBBIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB7QGxpbmsgI2xpdC1odG1sLlRlbXBsYXRlUmVzdWx0fS4gVGhlIGZ1bmN0aW9uJ3MgYGVsZW1lbnRgXG4gICAgICogcGFyYW1ldGVyIHdpbGwgYmUgdGhlIGN1cnJlbnQgY29tcG9uZW50IGluc3RhbmNlLiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCBieSB0aGVcbiAgICAgKiBjb21wb25lbnQncyByZW5kZXIgbWV0aG9kLlxuICAgICAqXG4gICAgICogVGhlIG1ldGhvZCBtdXN0IHJldHVybiBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0gd2hpY2ggaXMgY3JlYXRlZCB1c2luZyBsaXQtaHRtbCdzXG4gICAgICoge0BsaW5rIGxpdC1odG1sI2h0bWwgfCBgaHRtbGB9IG9yIHtAbGluayBsaXQtaHRtbCNzdmcgfCBgc3ZnYH0gdGVtcGxhdGUgbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB1bmRlZmluZWRgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgY29tcG9uZW50IGluc3RhbmNlIHJlcXVlc3RpbmcgdGhlIHRlbXBsYXRlXG4gICAgICovXG4gICAgdGVtcGxhdGU/OiAoZWxlbWVudDogVHlwZSwgLi4uaGVscGVyczogYW55W10pID0+IFRlbXBsYXRlUmVzdWx0IHwgdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTjogQ29tcG9uZW50RGVjbGFyYXRpb24gPSB7XG4gICAgc2VsZWN0b3I6ICcnLFxuICAgIHNoYWRvdzogdHJ1ZSxcbiAgICBkZWZpbmU6IHRydWUsXG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IENvbXBvbmVudERlY2xhcmF0aW9uLCBERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTiB9IGZyb20gJy4vY29tcG9uZW50LWRlY2xhcmF0aW9uLmpzJztcbmltcG9ydCB7IERlY29yYXRlZENvbXBvbmVudFR5cGUgfSBmcm9tICcuL3Byb3BlcnR5LmpzJztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBjbGFzc1xuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPENvbXBvbmVudERlY2xhcmF0aW9uPFR5cGU+PiA9IHt9KSB7XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHsgLi4uREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT04sIC4uLm9wdGlvbnMgfTtcblxuICAgIHJldHVybiAodGFyZ2V0OiB0eXBlb2YgQ29tcG9uZW50KSA9PiB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQgYXMgRGVjb3JhdGVkQ29tcG9uZW50VHlwZTtcblxuICAgICAgICBjb25zdHJ1Y3Rvci5zZWxlY3RvciA9IGRlY2xhcmF0aW9uLnNlbGVjdG9yIHx8IHRhcmdldC5zZWxlY3RvcjtcbiAgICAgICAgY29uc3RydWN0b3Iuc2hhZG93ID0gZGVjbGFyYXRpb24uc2hhZG93O1xuICAgICAgICBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSA9IGRlY2xhcmF0aW9uLnRlbXBsYXRlIHx8IHRhcmdldC50ZW1wbGF0ZTtcblxuICAgICAgICAvLyB1c2Uga2V5b2Ygc2lnbmF0dXJlcyB0byBjYXRjaCByZWZhY3RvcmluZyBlcnJvcnNcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZWRBdHRyaWJ1dGVzS2V5OiBrZXlvZiB0eXBlb2YgQ29tcG9uZW50ID0gJ29ic2VydmVkQXR0cmlidXRlcyc7XG4gICAgICAgIGNvbnN0IHN0eWxlc0tleToga2V5b2YgdHlwZW9mIENvbXBvbmVudCA9ICdzdHlsZXMnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9wZXJ0eSBkZWNvcmF0b3JzIGdldCBjYWxsZWQgYmVmb3JlIGNsYXNzIGRlY29yYXRvcnMsIHNvIGF0IHRoaXMgcG9pbnQgYWxsIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICAgICAqIGhhdmUgc3RvcmVkIHRoZWlyIGFzc29jaWF0ZWQgYXR0cmlidXRlcyBpbiB7QGxpbmsgQ29tcG9uZW50LmF0dHJpYnV0ZXN9LlxuICAgICAgICAgKiBXZSBjYW4gbm93IGNvbWJpbmUgdGhlbSB3aXRoIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IGFuZCxcbiAgICAgICAgICogYnkgdXNpbmcgYSBTZXQsIGVsaW1pbmF0ZSBhbGwgZHVwbGljYXRlcyBpbiB0aGUgcHJvY2Vzcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQXMgdGhlIHVzZXItZGVmaW5lZCB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gd2lsbCBhbHNvIGluY2x1ZGUgZGVjb3JhdG9yIGdlbmVyYXRlZFxuICAgICAgICAgKiBvYnNlcnZlZCBhdHRyaWJ1dGVzLCB3ZSBhbHdheXMgaW5oZXJpdCBhbGwgb2JzZXJ2ZWQgYXR0cmlidXRlcyBmcm9tIGEgYmFzZSBjbGFzcy4gRm9yIHRoYXQgcmVhc29uXG4gICAgICAgICAqIHdlIGhhdmUgdG8ga2VlcCB0cmFjayBvZiBhdHRyaWJ1dGUgb3ZlcnJpZGVzIHdoZW4gZXh0ZW5kaW5nIGFueSB7QGxpbmsgQ29tcG9uZW50fSBiYXNlIGNsYXNzLlxuICAgICAgICAgKiBUaGlzIGlzIGRvbmUgaW4gdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLiBIZXJlIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRvIHJlbW92ZSBvdmVycmlkZGVuXG4gICAgICAgICAqIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIC8vIHdlIHRha2UgdGhlIGluaGVyaXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLi4uXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub2JzZXJ2ZWRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLnJlbW92ZSBvdmVycmlkZGVuIGdlbmVyYXRlZCBhdHRyaWJ1dGVzLi4uXG4gICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKGF0dHJpYnV0ZXMsIGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuICYmIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4uaGFzKGF0dHJpYnV0ZSkgPyBbXSA6IGF0dHJpYnV0ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSBhcyBzdHJpbmdbXVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLmFuZCByZWNvbWJpbmUgdGhlIGxpc3Qgd2l0aCB0aGUgbmV3bHkgZ2VuZXJhdGVkIGF0dHJpYnV0ZXMgKHRoZSBTZXQgcHJldmVudHMgZHVwbGljYXRlcylcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChbLi4udGFyZ2V0LmF0dHJpYnV0ZXMua2V5cygpXSlcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBkZWxldGUgdGhlIG92ZXJyaWRkZW4gU2V0IGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgIGRlbGV0ZSBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBkb24ndCB3YW50IHRvIGluaGVyaXQgc3R5bGVzIGF1dG9tYXRpY2FsbHksIHVubGVzcyBleHBsaWNpdGx5IHJlcXVlc3RlZCwgc28gd2UgY2hlY2sgaWYgdGhlXG4gICAgICAgICAqIGNvbnN0cnVjdG9yIGRlY2xhcmVzIGEgc3RhdGljIHN0eWxlcyBwcm9wZXJ0eSAod2hpY2ggbWF5IHVzZSBzdXBlci5zdHlsZXMgdG8gZXhwbGljaXRseSBpbmhlcml0KVxuICAgICAgICAgKiBhbmQgaWYgaXQgZG9lc24ndCwgd2UgaWdub3JlIHRoZSBwYXJlbnQgY2xhc3MncyBzdHlsZXMgKGJ5IG5vdCBpbnZva2luZyB0aGUgZ2V0dGVyKS5cbiAgICAgICAgICogV2UgdGhlbiBtZXJnZSB0aGUgZGVjb3JhdG9yIGRlZmluZWQgc3R5bGVzIChpZiBleGlzdGluZykgaW50byB0aGUgc3R5bGVzIGFuZCByZW1vdmUgZHVwbGljYXRlc1xuICAgICAgICAgKiBieSB1c2luZyBhIFNldC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgICAgIC4uLm5ldyBTZXQoXG4gICAgICAgICAgICAgICAgKGNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KHN0eWxlc0tleSlcbiAgICAgICAgICAgICAgICAgICAgPyBjb25zdHJ1Y3Rvci5zdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgOiBbXVxuICAgICAgICAgICAgICAgICkuY29uY2F0KGRlY2xhcmF0aW9uLnN0eWxlcyB8fCBbXSlcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmluYWxseSB3ZSBvdmVycmlkZSB0aGUge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IGdldHRlciB3aXRoIGEgbmV3IG9uZSwgd2hpY2ggcmV0dXJuc1xuICAgICAgICAgKiB0aGUgdW5pcXVlIHNldCBvZiB1c2VyIGRlZmluZWQgYW5kIGRlY29yYXRvciBnZW5lcmF0ZWQgb2JzZXJ2ZWQgYXR0cmlidXRlcy5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIG9ic2VydmVkQXR0cmlidXRlc0tleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBnZXQgKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZWRBdHRyaWJ1dGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDb21wb25lbnQuc3R5bGVzfSBnZXR0ZXIgd2l0aCBhIG5ldyBvbmUsIHdoaWNoIHJldHVybnNcbiAgICAgICAgICogdGhlIHVuaXF1ZSBzZXQgb2Ygc3RhdGljYWxseSBkZWZpbmVkIGFuZCBkZWNvcmF0b3IgZGVmaW5lZCBzdHlsZXMuXG4gICAgICAgICAqL1xuICAgICAgICBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBzdHlsZXNLZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3R5bGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uZGVmaW5lKSB7XG5cbiAgICAgICAgICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoY29uc3RydWN0b3Iuc2VsZWN0b3IsIGNvbnN0cnVjdG9yKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IExpc3RlbmVyRGVjbGFyYXRpb24gfSBmcm9tICcuL2xpc3RlbmVyLWRlY2xhcmF0aW9uLmpzJztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBtZXRob2QgYXMgYW4gZXZlbnQgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgbGlzdGVuZXIgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbmVyPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBMaXN0ZW5lckRlY2xhcmF0aW9uPFR5cGU+KSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZXZlbnQgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IubGlzdGVuZXJzLmRlbGV0ZShwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IubGlzdGVuZXJzLnNldChwcm9wZXJ0eUtleSwgeyAuLi5vcHRpb25zIH0gYXMgTGlzdGVuZXJEZWNsYXJhdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBsaXN0ZW5lciBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIGxpc3RlbmVyIGRlY29yYXRvciBzdG9yZXMgbGlzdGVuZXIgZGVjbGFyYXRpb25zIGluIHRoZSBjb25zdHJ1Y3Rvciwgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhlXG4gKiBzdGF0aWMgbGlzdGVuZXJzIGZpZWxkIGlzIGluaXRpYWxpemVkIG9uIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yLiBPdGhlcndpc2Ugd2UgYWRkIGxpc3RlbmVyIGRlY2xhcmF0aW9uc1xuICogdG8gdGhlIGJhc2UgY2xhc3MncyBzdGF0aWMgZmllbGQuIFdlIGFsc28gbWFrZSBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGxpc3RlbmVyIG1hcHMgd2l0aCB0aGUgdmFsdWVzIG9mXG4gKiB0aGUgYmFzZSBjbGFzcydzIG1hcCB0byBwcm9wZXJseSBpbmhlcml0IGFsbCBsaXN0ZW5lciBkZWNsYXJhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnN0cnVjdG9yIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgdG8gcHJlcGFyZVxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcHJlcGFyZUNvbnN0cnVjdG9yIChjb25zdHJ1Y3RvcjogdHlwZW9mIENvbXBvbmVudCkge1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eSgnbGlzdGVuZXJzJykpIGNvbnN0cnVjdG9yLmxpc3RlbmVycyA9IG5ldyBNYXAoY29uc3RydWN0b3IubGlzdGVuZXJzKTtcbn1cbiIsImNvbnN0IEZJUlNUID0gL15bXl0vO1xuY29uc3QgU1BBQ0VTID0gL1xccysoW1xcU10pL2c7XG5jb25zdCBDQU1FTFMgPSAvW2Etel0oW0EtWl0pL2c7XG5jb25zdCBLRUJBQlMgPSAvLShbYS16XSkvZztcblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvVXBwZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5jYXBpdGFsaXplIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnJlcGxhY2UoRklSU1QsIHN0cmluZ1swXS50b0xvd2VyQ2FzZSgpKSA6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsQ2FzZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IG1hdGNoZXM7XG5cbiAgICBpZiAoc3RyaW5nKSB7XG5cbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnRyaW0oKTtcblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBTUEFDRVMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBTUEFDRVMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IEtFQkFCUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIEtFQkFCUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuY2FwaXRhbGl6ZShzdHJpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24ga2ViYWJDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBTUEFDRVMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IENBTUVMUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMF1bMF0gKyAnLScgKyBtYXRjaGVzWzFdKTtcblxuICAgICAgICAgICAgQ0FNRUxTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnRvTG93ZXJDYXNlKCkgOiBzdHJpbmc7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0IH0gZnJvbSAnLi9hdHRyaWJ1dGUtY29udmVydGVyLmpzJztcbmltcG9ydCB7IGtlYmFiQ2FzZSB9IGZyb20gJy4vdXRpbHMvc3RyaW5nLXV0aWxzLmpzJztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZWZsZWN0IGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBhIHByb3BlcnR5XG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZWZsZWN0IGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gYXR0cmlidXRlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5UmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBkaXNwYXRjaCBhIGN1c3RvbSBldmVudCBmb3IgYSBwcm9wZXJ0eSBjaGFuZ2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlOb3RpZmllcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmV0dXJuIGB0cnVlYCBpZiB0aGUgYG9sZFZhbHVlYCBhbmQgdGhlIGBuZXdWYWx1ZWAgb2YgYSBwcm9wZXJ0eSBhcmUgZGlmZmVyZW50LCBgZmFsc2VgIG90aGVyd2lzZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBdHRyaWJ1dGVSZWZsZWN0b3IgKHJlZmxlY3RvcjogYW55KTogcmVmbGVjdG9yIGlzIEF0dHJpYnV0ZVJlZmxlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIHJlZmxlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gcmVmbGVjdG9yIEEgcmVmbGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlSZWZsZWN0b3IgKHJlZmxlY3RvcjogYW55KTogcmVmbGVjdG9yIGlzIFByb3BlcnR5UmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9XG4gKlxuICogQHBhcmFtIG5vdGlmaWVyIEEgbm90aWZpZXIgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eU5vdGlmaWVyIChub3RpZmllcjogYW55KTogbm90aWZpZXIgaXMgUHJvcGVydHlOb3RpZmllciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIG5vdGlmaWVyID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gKlxuICogQHBhcmFtIGRldGVjdG9yIEEgZGV0ZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yIChkZXRlY3RvcjogYW55KTogZGV0ZWN0b3IgaXMgUHJvcGVydHlDaGFuZ2VEZXRlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGRldGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5S2V5fVxuICpcbiAqIEBwYXJhbSBrZXkgQSBwcm9wZXJ0eSBrZXkgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eUtleSAoa2V5OiBhbnkpOiBrZXkgaXMgUHJvcGVydHlLZXkge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBrZXkgPT09ICdudW1iZXInIHx8IHR5cGVvZiBrZXkgPT09ICdzeW1ib2wnO1xufVxuXG4vKipcbiAqIEVuY29kZXMgYSBzdHJpbmcgZm9yIHVzZSBhcyBodG1sIGF0dHJpYnV0ZSByZW1vdmluZyBpbnZhbGlkIGF0dHJpYnV0ZSBjaGFyYWN0ZXJzXG4gKlxuICogQHBhcmFtIHZhbHVlIEEgc3RyaW5nIHRvIGVuY29kZSBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlXG4gKiBAcmV0dXJucyAgICAgQW4gZW5jb2RlZCBzdHJpbmcgdXNhYmxlIGFzIGh0bWwgYXR0cmlidXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVBdHRyaWJ1dGUgKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIGtlYmFiQ2FzZSh2YWx1ZS5yZXBsYWNlKC9cXFcrL2csICctJykucmVwbGFjZSgvXFwtJC8sICcnKSk7XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGF0dHJpYnV0ZSBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogTnVtZXJpYyBwcm9wZXJ0eSBpbmRleGVzIG9yIHN5bWJvbHMgY2FuIGNvbnRhaW4gaW52YWxpZCBjaGFyYWN0ZXJzIGZvciBhdHRyaWJ1dGUgbmFtZXMuIFRoaXMgbWV0aG9kXG4gKiBzYW5pdGl6ZXMgdGhvc2UgY2hhcmFjdGVycyBhbmQgcmVwbGFjZXMgc2VxdWVuY2VzIG9mIGludmFsaWQgY2hhcmFjdGVycyB3aXRoIGEgZGFzaC5cbiAqIEF0dHJpYnV0ZSBuYW1lcyBhcmUgbm90IGFsbG93ZWQgdG8gc3RhcnQgd2l0aCBudW1iZXJzIGVpdGhlciBhbmQgYXJlIHByZWZpeGVkIHdpdGggJ2F0dHItJy5cbiAqXG4gKiBOLkIuOiBXaGVuIHVzaW5nIGN1c3RvbSBzeW1ib2xzIGFzIHByb3BlcnR5IGtleXMsIHVzZSB1bmlxdWUgZGVzY3JpcHRpb25zIGZvciB0aGUgc3ltYm9scyB0byBhdm9pZFxuICogY2xhc2hpbmcgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IGEgPSBTeW1ib2woKTtcbiAqIGNvbnN0IGIgPSBTeW1ib2woKTtcbiAqXG4gKiBhICE9PSBiOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShhKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShiKTsgLy8gZmFsc2UgLS0+ICdhdHRyLXN5bWJvbCcgPT09ICdhdHRyLXN5bWJvbCdcbiAqXG4gKiBjb25zdCBjID0gU3ltYm9sKCdjJyk7XG4gKiBjb25zdCBkID0gU3ltYm9sKCdkJyk7XG4gKlxuICogYyAhPT0gZDsgLy8gdHJ1ZVxuICpcbiAqIGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYykgIT09IGNyZWF0ZUF0dHJpYnV0ZU5hbWUoZCk7IC8vIHRydWUgLS0+ICdhdHRyLXN5bWJvbC1jJyA9PT0gJ2F0dHItc3ltYm9sLWQnXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBBIHByb3BlcnR5IGtleSB0byBjb252ZXJ0IHRvIGFuIGF0dHJpYnV0ZSBuYW1lXG4gKiBAcmV0dXJucyAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIGF0dHJpYnV0ZSBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVOYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBzdHJpbmcge1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICByZXR1cm4ga2ViYWJDYXNlKHByb3BlcnR5S2V5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBjcmVhdGUgbXVsdGlwbGUgaWRlbnRpY2FsIGF0dHJpYnV0ZSBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICByZXR1cm4gYGF0dHItJHsgZW5jb2RlQXR0cmlidXRlKFN0cmluZyhwcm9wZXJ0eUtleSkpIH1gO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gZXZlbnQgbmFtZSBmcm9tIGEgcHJvcGVydHkga2V5XG4gKlxuICogQHJlbWFya3NcbiAqIEV2ZW50IG5hbWVzIGRvbid0IGhhdmUgdGhlIHNhbWUgcmVzdHJpY3Rpb25zIGFzIGF0dHJpYnV0ZSBuYW1lcyB3aGVuIGl0IGNvbWVzIHRvIGludmFsaWRcbiAqIGNoYXJhY3RlcnMuIEhvd2V2ZXIsIGZvciBjb25zaXN0ZW5jeSdzIHNha2UsIHdlIGFwcGx5IHRoZSBzYW1lIHJ1bGVzIGZvciBldmVudCBuYW1lcyBhc1xuICogZm9yIGF0dHJpYnV0ZSBuYW1lcy5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBBIHByb3BlcnR5IGtleSB0byBjb252ZXJ0IHRvIGFuIGF0dHJpYnV0ZSBuYW1lXG4gKiBAcGFyYW0gcHJlZml4ICAgICAgICBBbiBvcHRpb25hbCBwcmVmaXgsIGUuZy46ICdvbidcbiAqIEBwYXJhbSBzdWZmaXggICAgICAgIEFuIG9wdGlvbmFsIHN1ZmZpeCwgZS5nLjogJ2NoYW5nZWQnXG4gKiBAcmV0dXJucyAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIGV2ZW50IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50TmFtZSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBwcmVmaXg/OiBzdHJpbmcsIHN1ZmZpeD86IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgcHJvcGVydHlTdHJpbmcgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgcHJvcGVydHlTdHJpbmcgPSBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgZXZlbnQgbmFtZXMsIGlmIHN5bWJvbHMgZG9uJ3QgaGF2ZSB1bmlxdWUgZGVzY3JpcHRpb25cbiAgICAgICAgcHJvcGVydHlTdHJpbmcgPSBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAkeyBwcmVmaXggPyBgJHsga2ViYWJDYXNlKHByZWZpeCkgfS1gIDogJycgfSR7IHByb3BlcnR5U3RyaW5nIH0keyBzdWZmaXggPyBgLSR7IGtlYmFiQ2FzZShzdWZmaXgpIH1gIDogJycgfWA7XG59XG5cbi8qKlxuICogQSB7QGxpbmsgQ29tcG9uZW50fSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIC8qKlxuICAgICAqIERvZXMgcHJvcGVydHkgaGF2ZSBhbiBhc3NvY2lhdGVkIGF0dHJpYnV0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogTm8gYXR0cmlidXRlIHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcHJvcGVydHlcbiAgICAgKiAqIGB0cnVlYDogVGhlIGF0dHJpYnV0ZSBuYW1lIHdpbGwgYmUgaW5mZXJyZWQgYnkgY2FtZWwtY2FzaW5nIHRoZSBwcm9wZXJ0eSBuYW1lXG4gICAgICogKiBgc3RyaW5nYDogVXNlIHRoZSBwcm92aWRlZCBzdHJpbmcgYXMgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIG5hbWVcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIGF0dHJpYnV0ZTogYm9vbGVhbiB8IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEN1c3RvbWl6ZSB0aGUgY29udmVyc2lvbiBvZiB2YWx1ZXMgYmV0d2VlbiBwcm9wZXJ0eSBhbmQgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ29udmVydGVycyBhcmUgb25seSB1c2VkIHdoZW4ge0BsaW5rIHJlZmxlY3RQcm9wZXJ0eX0gYW5kL29yIHtAbGluayByZWZsZWN0QXR0cmlidXRlfSBhcmUgc2V0IHRvIHRydWUuXG4gICAgICogSWYgY3VzdG9tIHJlZmxlY3RvcnMgYXJlIHVzZWQsIHRoZXkgaGF2ZSB0byB0YWtlIGNhcmUgb3IgY29udmVydGluZyB0aGUgcHJvcGVydHkvYXR0cmlidXRlIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IHtAbGluayBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0fVxuICAgICAqL1xuICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSdzIHZhbHVlIGJlIGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkIHRvIHRoZSBwcm9wZXJ0eT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogVGhlIGF0dHJpYnV0ZSB2YWx1ZSB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5IGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGB0cnVlYDogQW55IGF0dHJpYnV0ZSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgYXV0b21hdGljYWxseSB0byB0aGUgcHJvcGVydHkgdXNpbmcgdGhlIGRlZmF1bHQgYXR0cmlidXRlIHJlZmxlY3RvclxuICAgICAqICogYFByb3BlcnR5S2V5YDogQSBtZXRob2Qgb24gdGhlIGNvbXBvbmVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIGF0dHJpYnV0ZSByZWZsZWN0aW9uXG4gICAgICogKiBgRnVuY3Rpb25gOiBUaGUgcHJvdmlkZWQgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIHdpdGggaXRzIGB0aGlzYCBjb250ZXh0IGJvdW5kIHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIHRoZSBwcm9wZXJ0eSB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBwcm9wZXJ0eSB2YWx1ZSB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGB0cnVlYDogQW55IHByb3BlcnR5IGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSB1c2luZyB0aGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjb21wb25lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBwcm9wZXJ0eSByZWZsZWN0aW9uXG4gICAgICogKiBgRnVuY3Rpb25gOiBUaGUgcHJvdmlkZWQgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIHdpdGggaXRzIGB0aGlzYCBjb250ZXh0IGJvdW5kIHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHJlZmxlY3RQcm9wZXJ0eTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCBhIHByb3BlcnR5IHZhbHVlIGNoYW5nZSByYWlzZSBhIGN1c3RvbSBldmVudD9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogRG9uJ3QgY3JlYXRlIGEgY3VzdG9tIGV2ZW50IGZvciB0aGlzIHByb3BlcnR5XG4gICAgICogKiBgdHJ1ZWA6IENyZWF0ZSBjdXN0b20gZXZlbnRzIGZvciB0aGlzIHByb3BlcnR5IGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IFVzZSB0aGUgbWV0aG9kIHdpdGggdGhpcyBwcm9wZXJ0eSBrZXkgb24gdGhlIGNvbXBvbmVudCB0byBjcmVhdGUgY3VzdG9tIGV2ZW50c1xuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gdG8gY3JlYXRlIGN1c3RvbSBldmVudHMgKGB0aGlzYCBjb250ZXh0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSlcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIG5vdGlmeTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBQcm9wZXJ0eU5vdGlmaWVyPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIGhvdyBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIG1vbml0b3JlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBCeSBkZWZhdWx0IGEgZGVjb3JhdGVkIHByb3BlcnR5IHdpbGwgYmUgb2JzZXJ2ZWQgZm9yIGNoYW5nZXMgKHRocm91Z2ggYSBjdXN0b20gc2V0dGVyIGZvciB0aGUgcHJvcGVydHkpLlxuICAgICAqIEFueSBgc2V0YC1vcGVyYXRpb24gb2YgdGhpcyBwcm9wZXJ0eSB3aWxsIHRoZXJlZm9yZSByZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50IGFuZCBpbml0aWF0ZVxuICAgICAqIGEgcmVuZGVyIGFzIHdlbGwgYXMgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogRG9uJ3Qgb2JzZXJ2ZSBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgKHRoaXMgd2lsbCBieXBhc3MgcmVuZGVyLCByZWZsZWN0aW9uIGFuZCBub3RpZmljYXRpb24pXG4gICAgICogKiBgdHJ1ZWA6IE9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5IHVzaW5nIHRoZSB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9XG4gICAgICogKiBgRnVuY3Rpb25gOiBVc2UgdGhlIHByb3ZpZGVkIG1ldGhvZCB0byBjaGVjayBpZiBwcm9wZXJ0eSB2YWx1ZSBoYXMgY2hhbmdlZFxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgICh1c2VzIHtAbGluayBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUn0gaW50ZXJuYWxseSlcbiAgICAgKi9cbiAgICBvYnNlcnZlOiBib29sZWFuIHwgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcjtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAqXG4gKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICogQHJldHVybnMgICAgICAgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgcHJvcGVydHkgdmFsdWUgY2hhbmdlZFxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1I6IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4ge1xuICAgIC8vIGluIGNhc2UgYG9sZFZhbHVlYCBhbmQgYG5ld1ZhbHVlYCBhcmUgYE5hTmAsIGAoTmFOICE9PSBOYU4pYCByZXR1cm5zIGB0cnVlYCxcbiAgICAvLyBidXQgYChOYU4gPT09IE5hTiB8fCBOYU4gPT09IE5hTilgIHJldHVybnMgYGZhbHNlYFxuICAgIHJldHVybiBvbGRWYWx1ZSAhPT0gbmV3VmFsdWUgJiYgKG9sZFZhbHVlID09PSBvbGRWYWx1ZSB8fCBuZXdWYWx1ZSA9PT0gbmV3VmFsdWUpO1xufTtcblxuLy8gVE9ETzogbWF5YmUgcHJvdmlkZSBmbGF0IGFycmF5L29iamVjdCBjaGFuZ2UgZGV0ZWN0b3I/IGRhdGUgY2hhbmdlIGRldGVjdG9yP1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTjogUHJvcGVydHlEZWNsYXJhdGlvbiA9IHtcbiAgICBhdHRyaWJ1dGU6IHRydWUsXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0LFxuICAgIHJlZmxlY3RBdHRyaWJ1dGU6IHRydWUsXG4gICAgcmVmbGVjdFByb3BlcnR5OiB0cnVlLFxuICAgIG5vdGlmeTogdHJ1ZSxcbiAgICBvYnNlcnZlOiBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUixcbn07XG4iLCIvKipcbiAqIEdldCB0aGUge0BsaW5rIFByb3BlcnR5RGVzY3JpcHRvcn0gb2YgYSBwcm9wZXJ0eSBmcm9tIGl0cyBwcm90b3R5cGVcbiAqIG9yIGEgcGFyZW50IHByb3RvdHlwZSAtIGV4Y2x1ZGluZyB7QGxpbmsgT2JqZWN0LnByb3RvdHlwZX0gaXRzZWxmLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgICAgICAgIFRoZSBwcm90b3R5cGUgdG8gZ2V0IHRoZSBkZXNjcmlwdG9yIGZyb21cbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGVzY3JpcHRvclxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BlcnR5RGVzY3JpcHRvciAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZCB7XG5cbiAgICBpZiAocHJvcGVydHlLZXkgaW4gdGFyZ2V0KSB7XG5cbiAgICAgICAgd2hpbGUgKHRhcmdldCAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KHByb3BlcnR5S2V5KSkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhcmdldCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVBdHRyaWJ1dGVOYW1lLCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCBQcm9wZXJ0eURlY2xhcmF0aW9uIH0gZnJvbSAnLi9wcm9wZXJ0eS1kZWNsYXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgfSBmcm9tICcuL3V0aWxzL2dldC1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzJztcblxuLyoqXG4gKiBBIHR5cGUgZXh0ZW5zaW9uIHRvIGFkZCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdG8gYSB7QGxpbmsgQ29tcG9uZW50fSBjb25zdHJ1Y3RvciBkdXJpbmcgZGVjb3JhdGlvblxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9IHR5cGVvZiBDb21wb25lbnQgJiB7IG92ZXJyaWRkZW4/OiBTZXQ8c3RyaW5nPiB9O1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IHByb3BlcnR5XG4gKlxuICogQHJlbWFya3NcbiAqIE1hbnkgb2YgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBvcHRpb25zIHN1cHBvcnQgY3VzdG9tIGZ1bmN0aW9ucywgd2hpY2ggd2lsbCBiZSBpbnZva2VkXG4gKiB3aXRoIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYXMgYHRoaXNgLWNvbnRleHQgZHVyaW5nIGV4ZWN1dGlvbi4gSW4gb3JkZXIgdG8gc3VwcG9ydCBjb3JyZWN0XG4gKiB0eXBpbmcgaW4gdGhlc2UgZnVuY3Rpb25zLCB0aGUgYEBwcm9wZXJ0eWAgZGVjb3JhdG9yIHN1cHBvcnRzIGdlbmVyaWMgdHlwZXMuIEhlcmUgaXMgYW4gZXhhbXBsZVxuICogb2YgaG93IHlvdSBjYW4gdXNlIHRoaXMgd2l0aCBhIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9OlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBteUhpZGRlblByb3BlcnR5ID0gdHJ1ZTtcbiAqXG4gKiAgICAgIC8vIHVzZSBhIGdlbmVyaWMgdG8gc3VwcG9ydCBwcm9wZXIgaW5zdGFuY2UgdHlwaW5nIGluIHRoZSBwcm9wZXJ0eSByZWZsZWN0b3JcbiAqICAgICAgQHByb3BlcnR5PE15RWxlbWVudD4oe1xuICogICAgICAgICAgcmVmbGVjdFByb3BlcnR5OiAocHJvcGVydHlLZXk6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICogICAgICAgICAgICAgIC8vIHRoZSBnZW5lcmljIHR5cGUgYWxsb3dzIGZvciBjb3JyZWN0IHR5cGluZyBvZiB0aGlzXG4gKiAgICAgICAgICAgICAgaWYgKHRoaXMubXlIaWRkZW5Qcm9wZXJ0eSAmJiBuZXdWYWx1ZSkge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnbXktcHJvcGVydHknLCAnJyk7XG4gKiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAqICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ215LXByb3BlcnR5Jyk7XG4gKiAgICAgICAgICAgICAgfVxuICogICAgICAgICAgfVxuICogICAgICB9KVxuICogICAgICBteVByb3BlcnR5ID0gZmFsc2U7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0eTxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiAob3B0aW9uczogUGFydGlhbDxQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+PiA9IHt9KSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKFxuICAgICAgICB0YXJnZXQ6IE9iamVjdCxcbiAgICAgICAgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LFxuICAgICAgICBwcm9wZXJ0eURlc2NyaXB0b3I/OiBQcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgKTogYW55IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hlbiBkZWZpbmluZyBjbGFzc2VzIGluIFR5cGVTY3JpcHQsIGNsYXNzIGZpZWxkcyBhY3R1YWxseSBkb24ndCBleGlzdCBvbiB0aGUgY2xhc3MncyBwcm90b3R5cGUsIGJ1dFxuICAgICAgICAgKiByYXRoZXIsIHRoZXkgYXJlIGluc3RhbnRpYXRlZCBpbiB0aGUgY29uc3RydWN0b3IgYW5kIGV4aXN0IG9ubHkgb24gdGhlIGluc3RhbmNlLiBBY2Nlc3NvciBwcm9wZXJ0aWVzXG4gICAgICAgICAqIGFyZSBhbiBleGNlcHRpb24gaG93ZXZlciBhbmQgZXhpc3Qgb24gdGhlIHByb3RvdHlwZS4gRnVydGhlcm1vcmUsIGFjY2Vzc29ycyBhcmUgaW5oZXJpdGVkIGFuZCB3aWxsXG4gICAgICAgICAqIGJlIGludm9rZWQgd2hlbiBzZXR0aW5nIChvciBnZXR0aW5nKSBhIHByb3BlcnR5IG9uIGFuIGluc3RhbmNlIG9mIGEgY2hpbGQgY2xhc3MsIGV2ZW4gaWYgdGhhdCBjbGFzc1xuICAgICAgICAgKiBkZWZpbmVzIHRoZSBwcm9wZXJ0eSBmaWVsZCBvbiBpdHMgb3duLiBPbmx5IGlmIHRoZSBjaGlsZCBjbGFzcyBkZWZpbmVzIG5ldyBhY2Nlc3NvcnMgd2lsbCB0aGUgcGFyZW50XG4gICAgICAgICAqIGNsYXNzJ3MgYWNjZXNzb3JzIG5vdCBiZSBpbmhlcml0ZWQuXG4gICAgICAgICAqIFRvIGtlZXAgdGhpcyBiZWhhdmlvciBpbnRhY3QsIHdlIG5lZWQgdG8gZW5zdXJlLCB0aGF0IHdoZW4gd2UgY3JlYXRlIGFjY2Vzc29ycyBmb3IgcHJvcGVydGllcywgd2hpY2hcbiAgICAgICAgICogYXJlIG5vdCBkZWNsYXJlZCBhcyBhY2Nlc3NvcnMsIHdlIGludm9rZSB0aGUgcGFyZW50IGNsYXNzJ3MgYWNjZXNzb3IgYXMgZXhwZWN0ZWQuXG4gICAgICAgICAqIFRoZSB7QGxpbmsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yfSBmdW5jdGlvbiBhbGxvd3MgdXMgdG8gbG9vayBmb3IgYWNjZXNzb3JzIG9uIHRoZSBwcm90b3R5cGUgY2hhaW4gb2ZcbiAgICAgICAgICogdGhlIGNsYXNzIHdlIGFyZSBkZWNvcmF0aW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IHByb3BlcnR5RGVzY3JpcHRvciB8fCBnZXRQcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGNvbnN0IGhpZGRlbktleSA9ICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSA/IGBfXyR7IHByb3BlcnR5S2V5IH1gIDogU3ltYm9sKCk7XG5cbiAgICAgICAgLy8gaWYgd2UgZm91bmQgYW4gYWNjZXNzb3IgZGVzY3JpcHRvciAoZnJvbSBlaXRoZXIgdGhpcyBjbGFzcyBvciBhIHBhcmVudCkgd2UgdXNlIGl0LCBvdGhlcndpc2Ugd2UgY3JlYXRlXG4gICAgICAgIC8vIGRlZmF1bHQgYWNjZXNzb3JzIHRvIHN0b3JlIHRoZSBhY3R1YWwgcHJvcGVydHkgdmFsdWUgaW4gYSBoaWRkZW4gZmllbGQgYW5kIHJldHJpZXZlIGl0IGZyb20gdGhlcmVcbiAgICAgICAgY29uc3QgZ2V0dGVyID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmdldCB8fCBmdW5jdGlvbiAodGhpczogYW55KSB7IHJldHVybiB0aGlzW2hpZGRlbktleV07IH07XG4gICAgICAgIGNvbnN0IHNldHRlciA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5zZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSwgdmFsdWU6IGFueSkgeyB0aGlzW2hpZGRlbktleV0gPSB2YWx1ZTsgfTtcblxuICAgICAgICAvLyB3ZSBkZWZpbmUgYSBuZXcgYWNjZXNzb3IgZGVzY3JpcHRvciB3aGljaCB3aWxsIHdyYXAgdGhlIHByZXZpb3VzbHkgcmV0cmlldmVkIG9yIGNyZWF0ZWQgYWNjZXNzb3JzXG4gICAgICAgIC8vIGFuZCByZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50IHdoZW5ldmVyIHRoZSBwcm9wZXJ0eSBpcyBzZXRcbiAgICAgICAgY29uc3Qgd3JhcHBlZERlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvciAmIFRoaXNUeXBlPGFueT4gPSB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0ICgpOiBhbnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQgKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXNbcHJvcGVydHlLZXldO1xuICAgICAgICAgICAgICAgIHNldHRlci5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBwYXNzIGB2YWx1ZWAgb24gYXMgYG5ld1ZhbHVlYCAtIGFuIGluaGVyaXRlZCBzZXR0ZXIgbWlnaHQgbW9kaWZ5IGl0XG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCBnZXQgdGhlIG5ldyB2YWx1ZSBieSBpbnZva2luZyB0aGUgZ2V0dGVyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgZ2V0dGVyLmNhbGwodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3IgYXMgRGVjb3JhdGVkQ29tcG9uZW50VHlwZTtcblxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbjogUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlPiA9IHsgLi4uREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24uYXR0cmlidXRlID0gY3JlYXRlQXR0cmlidXRlTmFtZShwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXQgdGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5vYnNlcnZlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLm9ic2VydmUgPSBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLm9ic2VydmU7XG4gICAgICAgIH1cblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGluaGVyaXRlZCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGUgZm9yIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBiYXNlIGNsYXNzXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuaGFzKHByb3BlcnR5S2V5KSA/IGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuZ2V0KHByb3BlcnR5S2V5KSEuYXR0cmlidXRlIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHkgaXQncyBhIHN0cmluZyBhbmQgaXQgd2lsbCBleGlzdCBpbiB0aGUgYXR0cmlidXRlcyBtYXBcbiAgICAgICAgaWYgKGF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIGluaGVyaXRlZCBhdHRyaWJ1dGUgYXMgaXQncyBvdmVycmlkZGVuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmRlbGV0ZShhdHRyaWJ1dGUgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIC8vIG1hcmsgYXR0cmlidXRlIGFzIG92ZXJyaWRkZW4gZm9yIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvclxuICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiEuYWRkKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLnNldChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbiAqYWZ0ZXIqIHByb2Nlc3NpbmcgdGhlIGF0dHJpYnV0ZXMsIHNvIHdlIGNhbiBzdGlsbCBhY2Nlc3MgdGhlXG4gICAgICAgIC8vIGluaGVyaXRlZCBwcm9wZXJ0eSBkZWNsYXJhdGlvbiB3aGVuIHByb2Nlc3NpbmcgdGhlIGF0dHJpYnV0ZXNcbiAgICAgICAgY29uc3RydWN0b3IucHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIGRlY2xhcmF0aW9uIGFzIFByb3BlcnR5RGVjbGFyYXRpb24pO1xuXG4gICAgICAgIGlmICghcHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cbiAgICAgICAgICAgIC8vIGlmIG5vIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGEgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciB3aGljaCBtdXN0IHJldHVybiB2b2lkIGFuZCB3ZSBjYW4gZGVmaW5lIHRoZSB3cmFwcGVkIGRlc2NyaXB0b3IgaGVyZVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIHdyYXBwZWREZXNjcmlwdG9yKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBpZiBhIHByb3BlcnR5RGVzY3JpcHRvciB3YXMgZGVmaW5lZCBmb3IgdGhpcyBkZWNvcmF0b3IsIHRoaXMgZGVjb3JhdG9yIGlzIGFuIGFjY2Vzc29yXG4gICAgICAgICAgICAvLyBkZWNvcmF0b3IgYW5kIHdlIG11c3QgcmV0dXJuIHRoZSB3cmFwcGVkIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVkRGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG4vKipcbiAqIFByZXBhcmVzIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgcHJvcGVydHkgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3Igc3RvcmVzIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIGluIHRoZSBjb25zdHJ1Y3RvcixcbiAqIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRob3NlIHN0YXRpYyBmaWVsZHMgYXJlIGluaXRpYWxpemVkIG9uIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yLiBPdGhlcndpc2Ugd2VcbiAqIGFkZCBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZSBtYXBwaW5ncyB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZHMuIFdlIGFsc28gbWFrZVxuICogc3VyZSB0byBpbml0aWFsaXplIHRoZSBjb25zdHJ1Y3RvcnMgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2YgdGhlIGJhc2UgY2xhc3MncyBtYXBzIHRvIHByb3Blcmx5XG4gKiBpbmhlcml0IGFsbCBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZXMuXG4gKlxuICogQHBhcmFtIGNvbnN0cnVjdG9yIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgdG8gcHJlcGFyZVxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlKSB7XG5cbiAgICAvLyB0aGlzIHdpbGwgZ2l2ZSB1cyBhIGNvbXBpbGUtdGltZSBlcnJvciBpZiB3ZSByZWZhY3RvciBvbmUgb2YgdGhlIHN0YXRpYyBjb25zdHJ1Y3RvciBwcm9wZXJ0aWVzXG4gICAgLy8gYW5kIHdlIHdvbid0IG1pc3MgcmVuYW1pbmcgdGhlIHByb3BlcnR5IGtleXNcbiAgICBjb25zdCBwcm9wZXJ0aWVzOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ3Byb3BlcnRpZXMnO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAnYXR0cmlidXRlcyc7XG4gICAgY29uc3Qgb3ZlcnJpZGRlbjoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdvdmVycmlkZGVuJztcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkocHJvcGVydGllcykpIGNvbnN0cnVjdG9yLnByb3BlcnRpZXMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLnByb3BlcnRpZXMpO1xuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlcykpIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMpO1xuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkob3ZlcnJpZGRlbikpIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4gPSBuZXcgU2V0KCk7XG59XG4iLCJpbXBvcnQgeyByZW5kZXIsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVSZWZsZWN0b3IsXG4gICAgY3JlYXRlRXZlbnROYW1lLFxuICAgIGlzQXR0cmlidXRlUmVmbGVjdG9yLFxuICAgIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvcixcbiAgICBpc1Byb3BlcnR5S2V5LFxuICAgIGlzUHJvcGVydHlOb3RpZmllcixcbiAgICBpc1Byb3BlcnR5UmVmbGVjdG9yLFxuICAgIExpc3RlbmVyRGVjbGFyYXRpb24sXG4gICAgUHJvcGVydHlEZWNsYXJhdGlvbixcbiAgICBQcm9wZXJ0eU5vdGlmaWVyLFxuICAgIFByb3BlcnR5UmVmbGVjdG9yXG59IGZyb20gXCIuL2RlY29yYXRvcnMvaW5kZXguanNcIjtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUiA9IChhdHRyaWJ1dGVSZWZsZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIGF0dHJpYnV0ZSByZWZsZWN0b3IgJHsgU3RyaW5nKGF0dHJpYnV0ZVJlZmxlY3RvcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUiA9IChwcm9wZXJ0eVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgcmVmbGVjdG9yICR7IFN0cmluZyhwcm9wZXJ0eVJlZmxlY3RvcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IFBST1BFUlRZX05PVElGSUVSX0VSUk9SID0gKHByb3BlcnR5Tm90aWZpZXI6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IG5vdGlmaWVyICR7IFN0cmluZyhwcm9wZXJ0eU5vdGlmaWVyKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgQ0hBTkdFX0RFVEVDVE9SX0VSUk9SID0gKGNoYW5nZURldGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3IgJHsgU3RyaW5nKGNoYW5nZURldGVjdG9yKSB9LmApO1xuXG4vKipcbiAqIEV4dGVuZHMgdGhlIHN0YXRpYyB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gdG8gaW5jbHVkZSB0aGUgYm91bmQgbGlzdGVuZXJcbiAqIGZvciBhIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuaW50ZXJmYWNlIEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbiBleHRlbmRzIExpc3RlbmVyRGVjbGFyYXRpb24ge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJvdW5kIGxpc3RlbmVyIHdpbGwgYmUgc3RvcmVkIGhlcmUsIHNvIGl0IGNhbiBiZSByZW1vdmVkIGl0IGxhdGVyXG4gICAgICovXG4gICAgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZXZlbnQgdGFyZ2V0IHdpbGwgYWx3YXlzIGJlIHJlc29sdmVkIHRvIGFuIGFjdHVhbCB7QGxpbmsgRXZlbnRUYXJnZXR9XG4gICAgICovXG4gICAgdGFyZ2V0OiBFdmVudFRhcmdldDtcbn1cblxuLyoqXG4gKiBBIHR5cGUgZm9yIHByb3BlcnR5IGNoYW5nZXMsIGFzIHVzZWQgaW4ge0BsaW5rIHVwZGF0ZUNhbGxiYWNrfVxuICovXG5leHBvcnQgdHlwZSBDaGFuZ2VzID0gTWFwPFByb3BlcnR5S2V5LCBhbnk+O1xuXG4vKipcbiAqIEEgdHlwZSBmb3IgcHJvcGVydHkgY2hhbmdlIGV2ZW50IGRldGFpbHMsIGFzIHVzZWQgYnkge0BsaW5rIFByb3BlcnR5Q2hhbmdlRXZlbnR9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2VFdmVudERldGFpbDxUPiB7XG4gICAgcHJvcGVydHk6IHN0cmluZztcbiAgICBwcmV2aW91czogVDtcbiAgICBjdXJyZW50OiBUO1xufVxuXG4vKipcbiAqIEEgdHlwZSBmb3IgcHJvcGVydHkgY2hhbmdlIGV2ZW50cywgYXMgZGlzcGF0Y2hlZCBieSB0aGUge0BsaW5rIF9ub3RpZnlQcm9wZXJ0eX0gbWV0aG9kXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2VFdmVudDxUPiBleHRlbmRzIEN1c3RvbUV2ZW50PFByb3BlcnR5Q2hhbmdlRXZlbnREZXRhaWw8VD4+IHt9XG5cbi8qKlxuICogVGhlIGNvbXBvbmVudCBiYXNlIGNsYXNzXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hlbiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICogaW5zdGFuY2UgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZVNoZWV0ICgpOiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVTaGVldCcpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBzdHlsZSBzaGVldCBhbmQgY2FjaGUgaXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBuZXcgQ1NTU3R5bGVTaGVldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQucmVwbGFjZVN5bmModGhpcy5zdHlsZXMuam9pbignXFxuJykpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVTaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBub2RlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZUVsZW1lbnQgKCk6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZUVsZW1lbnQnKSkge1xuXG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRpdGxlID0gdGhpcy5zZWxlY3RvcjtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBhdHRyaWJ1dGUgbmFtZXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkga2V5c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICogcHJvcGVydHkga2V5IHRoYXQgYmVsb25ncyB0byBhbiBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBQcm9wZXJ0eUtleT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9mIGEgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBQcm9wZXJ0eURlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gb2YgYSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuZXJzOiBNYXA8UHJvcGVydHlLZXksIExpc3RlbmVyRGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHNlbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgb3ZlcnJpZGRlbiBieSB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHNlbGVjdG9yYCBvcHRpb24sIGlmIHByb3ZpZGVkLlxuICAgICAqIE90aGVyd2lzZSB0aGUgZGVjb3JhdG9yIHdpbGwgdXNlIHRoaXMgcHJvcGVydHkgdG8gZGVmaW5lIHRoZSBjb21wb25lbnQuXG4gICAgICovXG4gICAgc3RhdGljIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIHNldCBieSB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHNoYWRvd2Agb3B0aW9uIChkZWZhdWx0cyB0byBgdHJ1ZWApLlxuICAgICAqL1xuICAgIHN0YXRpYyBzaGFkb3c6IGJvb2xlYW47XG5cbiAgICAvLyBUT0RPOiBjcmVhdGUgdGVzdHMgZm9yIHN0eWxlIGluaGVyaXRhbmNlXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzdHlsZXNgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHVuZGVmaW5lZGApLlxuICAgICAqIFN0eWxlcyBzZXQgaW4gdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvciB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0eS5cbiAgICAgKiBUaGlzIGFsbG93cyB0byBpbmhlcml0IHN0eWxlcyBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCBhbmQgYWRkIGFkZGl0aW9uYWwgc3R5bGVzIG9uIHRoZSBjaGlsZCBjb21wb25lbnQuXG4gICAgICogSW4gb3JkZXIgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQsIGFuIGV4cGxpY2l0IHN1cGVyIGNhbGwgaGFzIHRvIGJlIGluY2x1ZGVkLiBCeVxuICAgICAqIGRlZmF1bHQgbm8gc3R5bGVzIGFyZSBpbmhlcml0ZWQuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBzdHlsZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbXG4gICAgICogICAgICAgICAgICAgIC4uLnN1cGVyLnN0eWxlcyxcbiAgICAgKiAgICAgICAgICAgICAgJzpob3N0IHsgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47IH0nXG4gICAgICogICAgICAgICAgXTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCk6IHN0cmluZ1tdIHtcblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENhbiBiZSBzZXQgdGhyb3VnaCB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHRlbXBsYXRlYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBJZiBzZXQgaW4gdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvciwgaXQgd2lsbCBoYXZlIHByZWNlZGVuY2Ugb3ZlciB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAgIFRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gaGVscGVycyAgIEFueSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgd2hpY2ggc2hvdWxkIGV4aXN0IGluIHRoZSB0ZW1wbGF0ZSBzY29wZVxuICAgICAqL1xuICAgIHN0YXRpYyB0ZW1wbGF0ZT86IChlbGVtZW50OiBhbnksIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0byBzcGVjaWZ5IGF0dHJpYnV0ZXMgd2hpY2ggc2hvdWxkIGJlIG9ic2VydmVkLCBidXQgZG9uJ3QgaGF2ZSBhbiBhc3NvY2lhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrXG4gICAgICogRm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIGRlY29yYXRlZCB3aXRoIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciwgYW4gb2JzZXJ2ZWQgYXR0cmlidXRlXG4gICAgICogaXMgYXV0b21hdGljYWxseSBjcmVhdGVkIGFuZCBkb2VzIG5vdCBuZWVkIHRvIGJlIHNwZWNpZmllZCBoZXJlLiBGb3QgYXR0cmlidXRlcyB0aGF0IGRvbid0XG4gICAgICogaGF2ZSBhbiBhc3NvY2lhdGVkIHByb3BlcnR5LCByZXR1cm4gdGhlIGF0dHJpYnV0ZSBuYW1lcyBpbiB0aGlzIGdldHRlci4gQ2hhbmdlcyB0byB0aGVzZVxuICAgICAqIGF0dHJpYnV0ZXMgY2FuIGJlIGhhbmRsZWQgaW4gdGhlIHtAbGluayBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2t9IG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFdoZW4gZXh0ZW5kaW5nIGNvbXBvbmVudHMsIG1ha2Ugc3VyZSB0byByZXR1cm4gdGhlIHN1cGVyIGNsYXNzJ3Mgb2JzZXJ2ZWRBdHRyaWJ1dGVzXG4gICAgICogaWYgeW91IG92ZXJyaWRlIHRoaXMgZ2V0dGVyIChleGNlcHQgaWYgeW91IGRvbid0IHdhbnQgdG8gaW5oZXJpdCBvYnNlcnZlZCBhdHRyaWJ1dGVzKTpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIE15QmFzZUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuICAgICAqXG4gICAgICogICAgICAgICAgcmV0dXJuIFsuLi5zdXBlci5vYnNlcnZlZEF0dHJpYnV0ZXMsICdteS1hZGRpdGlvbmFsLWF0dHJpYnV0ZSddO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVJlcXVlc3Q6IFByb21pc2U8Ym9vbGVhbj4gPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NoYW5nZWRQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeWluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJEZWNsYXJhdGlvbnM6IEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbltdID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2hhc1VwZGF0ZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJlbmRlciByb290IGlzIHdoZXJlIHRoZSB7QGxpbmsgcmVuZGVyfSBtZXRob2Qgd2lsbCBhdHRhY2ggaXRzIERPTSBvdXRwdXRcbiAgICAgKi9cbiAgICByZWFkb25seSByZW5kZXJSb290OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAoLi4uYXJnczogYW55W10pIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyUm9vdCA9IHRoaXMuX2NyZWF0ZVJlbmRlclJvb3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIG1vdmVkIHRvIGEgbmV3IGRvY3VtZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBhZG9wdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnYWRvcHRlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgYXBwZW5kZWQgaW50byBhIGRvY3VtZW50LWNvbm5lY3RlZCBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdjb25uZWN0ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBkb2N1bWVudCdzIERPTVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX3VubGlzdGVuKCk7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdkaXNjb25uZWN0ZWQnKTtcblxuICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgb25lIG9mIHRoZSBjb21wb25lbnQncyBhdHRyaWJ1dGVzIGlzIGFkZGVkLCByZW1vdmVkLCBvciBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoaWNoIGF0dHJpYnV0ZXMgdG8gbm90aWNlIGNoYW5nZSBmb3IgaXMgc3BlY2lmaWVkIGluIHtAbGluayBvYnNlcnZlZEF0dHJpYnV0ZXN9LlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogRm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHdpdGggYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGUsIHRoaXMgaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5LlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gdG8gY3VzdG9taXplIHRoZSBoYW5kbGluZyBvZiBhdHRyaWJ1dGUgY2hhbmdlcy4gV2hlbiBvdmVycmlkaW5nXG4gICAgICogdGhpcyBtZXRob2QsIGEgc3VwZXItY2FsbCBzaG91bGQgYmUgaW5jbHVkZWQsIHRvIGVuc3VyZSBhdHRyaWJ1dGUgY2hhbmdlcyBmb3IgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgKiBhcmUgcHJvY2Vzc2VkIGNvcnJlY3RseS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayAoYXR0cmlidXRlOiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHN1cGVyLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICpcbiAgICAgKiAgICAgICAgICAvLyBkbyBjdXN0b20gaGFuZGxpbmcuLi5cbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBpZiAodGhpcy5faXNSZWZsZWN0aW5nIHx8IG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCB1cGRhdGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBgdXBkYXRlQ2FsbGJhY2tgIGlzIGludm9rZWQgc3luY2hyb25vdXNseSBieSB0aGUge0BsaW5rIHVwZGF0ZX0gbWV0aG9kIGFuZCB0aGVyZWZvcmUgaGFwcGVucyBkaXJlY3RseSBhZnRlclxuICAgICAqIHJlbmRlcmluZywgcHJvcGVydHkgcmVmbGVjdGlvbiBhbmQgcHJvcGVydHkgY2hhbmdlIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIE4uQi46IENoYW5nZXMgbWFkZSB0byBwcm9wZXJ0aWVzIG9yIGF0dHJpYnV0ZXMgaW5zaWRlIHRoaXMgY2FsbGJhY2sgKndvbid0KiBjYXVzZSBhbm90aGVyIHVwZGF0ZS5cbiAgICAgKiBUbyBjYXVzZSBhbiB1cGRhdGUsIGRlZmVyIGNoYW5nZXMgd2l0aCB0aGUgaGVscCBvZiBhIFByb21pc2UuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAqICAgICAgICAgICAgICAvLyBwZXJmb3JtIGNoYW5nZXMgd2hpY2ggbmVlZCB0byBjYXVzZSBhbm90aGVyIHVwZGF0ZSBoZXJlXG4gICAgICogICAgICAgICAgfSk7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5nZXMgICAgICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IGNoYW5nZWQgaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBmaXJzdFVwZGF0ZSAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoaXMgd2FzIHRoZSBmaXJzdCB1cGRhdGVcbiAgICAgKi9cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHsgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBjdXN0b20gZXZlbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIEFuIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0gZXZlbnRJbml0IEEge0BsaW5rIEN1c3RvbUV2ZW50SW5pdH0gZGljdGlvbmFyeVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnkgKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudEluaXQ/OiBDdXN0b21FdmVudEluaXQpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgZXZlbnRJbml0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2ggcHJvcGVydHkgY2hhbmdlcyBvY2N1cnJpbmcgaW4gdGhlIGV4ZWN1dG9yIGFuZCByYWlzZSBjdXN0b20gZXZlbnRzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFByb3BlcnR5IGNoYW5nZXMgc2hvdWxkIHRyaWdnZXIgY3VzdG9tIGV2ZW50cyB3aGVuIHRoZXkgYXJlIGNhdXNlZCBieSBpbnRlcm5hbCBzdGF0ZSBjaGFuZ2VzLFxuICAgICAqIGJ1dCBub3QgaWYgdGhleSBhcmUgY2F1c2VkIGJ5IGEgY29uc3VtZXIgb2YgdGhlIGNvbXBvbmVudCBBUEkgZGlyZWN0bHksIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbXktY3VzdG9tLWVsZW1lbnQnKS5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogYGBgLlxuICAgICAqXG4gICAgICogVGhpcyBtZWFucywgd2UgY2Fubm90IGF1dG9tYXRlIHRoaXMgcHJvY2VzcyB0aHJvdWdoIHByb3BlcnR5IHNldHRlcnMsIGFzIHdlIGNhbid0IGJlIHN1cmUgd2hvXG4gICAgICogaW52b2tlZCB0aGUgc2V0dGVyIC0gaW50ZXJuYWwgY2FsbHMgb3IgZXh0ZXJuYWwgY2FsbHMuXG4gICAgICpcbiAgICAgKiBPbmUgb3B0aW9uIGlzIHRvIG1hbnVhbGx5IHJhaXNlIHRoZSBldmVudCwgd2hpY2ggY2FuIGJlY29tZSB0ZWRpb3VzIGFuZCBmb3JjZXMgdXMgdG8gdXNlIHN0cmluZy1cbiAgICAgKiBiYXNlZCBldmVudCBuYW1lcyBvciBwcm9wZXJ0eSBuYW1lcywgd2hpY2ggYXJlIGRpZmZpY3VsdCB0byByZWZhY3RvciwgZS5nLjpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAvLyBpZiB3ZSByZWZhY3RvciB0aGUgcHJvcGVydHkgbmFtZSwgd2UgY2FuIGVhc2lseSBtaXNzIHRoZSBub3RpZnkgY2FsbFxuICAgICAqIHRoaXMubm90aWZ5KCdjdXN0b21Qcm9wZXJ0eScpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQSBtb3JlIGNvbnZlbmllbnQgd2F5IGlzIHRvIGV4ZWN1dGUgdGhlIGludGVybmFsIGNoYW5nZXMgaW4gYSB3cmFwcGVyIHdoaWNoIGNhbiBkZXRlY3QgdGhlIGNoYW5nZWRcbiAgICAgKiBwcm9wZXJ0aWVzIGFuZCB3aWxsIGF1dG9tYXRpY2FsbHkgcmFpc2UgdGhlIHJlcXVpcmVkIGV2ZW50cy4gVGhpcyBlbGltaW5hdGVzIHRoZSBuZWVkIHRvIG1hbnVhbGx5XG4gICAgICogcmFpc2UgZXZlbnRzIGFuZCByZWZhY3RvcmluZyBkb2VzIG5vIGxvbmdlciBhZmZlY3QgdGhlIHByb2Nlc3MuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy53YXRjaCgoKSA9PiB7XG4gICAgICpcbiAgICAgKiAgICAgIHRoaXMuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqICAgICAgLy8gd2UgY2FuIGFkZCBtb3JlIHByb3BlcnR5IG1vZGlmaWNhdGlvbnMgdG8gbm90aWZ5IGluIGhlcmVcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBleGVjdXRvciBBIGZ1bmN0aW9uIHRoYXQgcGVyZm9ybXMgdGhlIGNoYW5nZXMgd2hpY2ggc2hvdWxkIGJlIG5vdGlmaWVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdhdGNoIChleGVjdXRvcjogKCkgPT4gdm9pZCkge1xuXG4gICAgICAgIC8vIGJhY2sgdXAgY3VycmVudCBjaGFuZ2VkIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgcHJldmlvdXNDaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG5cbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgY2hhbmdlc1xuICAgICAgICBleGVjdXRvcigpO1xuXG4gICAgICAgIC8vIGFkZCBhbGwgbmV3IG9yIHVwZGF0ZWQgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIHRoZSBub3RpZnlpbmcgcHJvcGVydGllc1xuICAgICAgICBmb3IgKGNvbnN0IFtwcm9wZXJ0eUtleSwgb2xkVmFsdWVdIG9mIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZGVkID0gIXByZXZpb3VzQ2hhbmdlcy5oYXMocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9ICFhZGRlZCAmJiB0aGlzLmhhc0NoYW5nZWQocHJvcGVydHlLZXksIHByZXZpb3VzQ2hhbmdlcy5nZXQocHJvcGVydHlLZXkpLCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIGlmIChhZGRlZCB8fCB1cGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSB2YWx1ZSBvZiBhIGRlY29yYXRlZCBwcm9wZXJ0eSBvciBpdHMgYXNzb2NpYXRlZFxuICAgICAqIGF0dHJpYnV0ZSBjaGFuZ2VzLiBJZiB5b3UgbmVlZCB0aGUgY29tcG9uZW50IHRvIHVwZGF0ZSBiYXNlZCBvbiBhIHN0YXRlIGNoYW5nZSB0aGF0IGlzXG4gICAgICogbm90IGNvdmVyZWQgYnkgYSBkZWNvcmF0ZWQgcHJvcGVydHksIGNhbGwgdGhpcyBtZXRob2Qgd2l0aG91dCBhbnkgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIG5hbWUgb2YgdGhlIGNoYW5nZWQgcHJvcGVydHkgdGhhdCByZXF1ZXN0cyB0aGUgdXBkYXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIHRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBBIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiB0aGUgdXBkYXRlIGlzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZXF1ZXN0VXBkYXRlIChwcm9wZXJ0eUtleT86IFByb3BlcnR5S2V5LCBvbGRWYWx1ZT86IGFueSwgbmV3VmFsdWU/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBpZiAocHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSdzIG9ic2VydmUgb3B0aW9uIGlzIGBmYWxzZWAsIHtAbGluayBoYXNDaGFuZ2VkfVxuICAgICAgICAgICAgLy8gd2lsbCByZXR1cm4gYGZhbHNlYCBhbmQgbm8gdXBkYXRlIHdpbGwgYmUgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzQ2hhbmdlZChwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSkgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIGNoYW5nZWQgcHJvcGVydHkgZm9yIGJhdGNoIHByb2Nlc3NpbmdcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgaW4gcmVmbGVjdGluZyBzdGF0ZSwgYW4gYXR0cmlidXRlIGlzIHJlZmxlY3RpbmcgdG8gdGhpcyBwcm9wZXJ0eSBhbmQgd2VcbiAgICAgICAgICAgIC8vIGNhbiBza2lwIHJlZmxlY3RpbmcgdGhlIHByb3BlcnR5IGJhY2sgdG8gdGhlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgLy8gcHJvcGVydHkgY2hhbmdlcyBuZWVkIHRvIGJlIHRyYWNrZWQgaG93ZXZlciBhbmQge0BsaW5rIHJlbmRlcn0gbXVzdCBiZSBjYWxsZWQgYWZ0ZXJcbiAgICAgICAgICAgIC8vIHRoZSBhdHRyaWJ1dGUgY2hhbmdlIGlzIHJlZmxlY3RlZCB0byB0aGlzIHByb3BlcnR5XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzUmVmbGVjdGluZykgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBlbnF1ZXVlIHVwZGF0ZSByZXF1ZXN0IGlmIG5vbmUgd2FzIGVucXVldWVkIGFscmVhZHlcbiAgICAgICAgICAgIHRoaXMuX2VucXVldWVVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVXNlcyBsaXQtaHRtbCdzIHtAbGluayBsaXQtaHRtbCNyZW5kZXJ9IG1ldGhvZCB0byByZW5kZXIgYSB7QGxpbmsgbGl0LWh0bWwjVGVtcGxhdGVSZXN1bHR9IHRvIHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciByb290LiBUaGUgY29tcG9uZW50IGluc3RhbmNlIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBzdGF0aWMgdGVtcGxhdGUgbWV0aG9kXG4gICAgICogYXV0b21hdGljYWxseS4gVG8gbWFrZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXZhaWxhYmxlIHRvIHRoZSB0ZW1wbGF0ZSBtZXRob2QsIHlvdSBjYW4gcGFzcyB0aGVtIHRvIHRoZVxuICAgICAqIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogY29uc3QgZGF0ZUZvcm1hdHRlciA9IChkYXRlOiBEYXRlKSA9PiB7IC8vIHJldHVybiBzb21lIGRhdGUgdHJhbnNmb3JtYXRpb24uLi5cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnLFxuICAgICAqICAgICAgdGVtcGxhdGU6IChlbGVtZW50LCBmb3JtYXREYXRlKSA9PiBodG1sYDxzcGFuPkxhc3QgdXBkYXRlZDogJHsgZm9ybWF0RGF0ZShlbGVtZW50Lmxhc3RVcGRhdGVkKSB9PC9zcGFuPmBcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIEBwcm9wZXJ0eSgpXG4gICAgICogICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgKlxuICAgICAqICAgICAgcmVuZGVyICgpIHtcbiAgICAgKiAgICAgICAgICAvLyBtYWtlIHRoZSBkYXRlIGZvcm1hdHRlciBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIGJ5IHBhc3NpbmcgaXQgdG8gcmVuZGVyKClcbiAgICAgKiAgICAgICAgICBzdXBlci5yZW5kZXIoZGF0ZUZvcm1hdHRlcik7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGhlbHBlcnMgICBBbnkgYWRkaXRpb25hbCBvYmplY3RzIHdoaWNoIHNob3VsZCBiZSBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoLi4uaGVscGVyczogYW55W10pIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbnN0cnVjdG9yLnRlbXBsYXRlICYmIGNvbnN0cnVjdG9yLnRlbXBsYXRlKHRoaXMsIC4uLmhlbHBlcnMpO1xuXG4gICAgICAgIGlmICh0ZW1wbGF0ZSkgcmVuZGVyKHRlbXBsYXRlLCB0aGlzLnJlbmRlclJvb3QsIHsgZXZlbnRDb250ZXh0OiB0aGlzIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbXBvbmVudCBhZnRlciBhbiB1cGRhdGUgd2FzIHJlcXVlc3RlZCB3aXRoIHtAbGluayByZXF1ZXN0VXBkYXRlfVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZW5kZXJzIHRoZSB0ZW1wbGF0ZSwgcmVmbGVjdHMgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIGF0dHJpYnV0ZXMgYW5kXG4gICAgICogZGlzcGF0Y2hlcyBjaGFuZ2UgZXZlbnRzIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBUbyBoYW5kbGUgdXBkYXRlcyBkaWZmZXJlbnRseSwgdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gYW5kIGEgbWFwIG9mIHByb3BlcnR5XG4gICAgICogY2hhbmdlcyBpcyBwcm92aWRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IGNoYW5nZWQgaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGUgKGNoYW5nZXM/OiBDaGFuZ2VzKSB7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcblxuICAgICAgICAvLyByZWZsZWN0IGFsbCBwcm9wZXJ0aWVzIG1hcmtlZCBmb3IgcmVmbGVjdGlvblxuICAgICAgICB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZTogYW55LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIENvbXBvbmVudF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBub3RpZnkgYWxsIHByb3BlcnRpZXMgbWFya2VkIGZvciBub3RpZmljYXRpb25cbiAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5mb3JFYWNoKChvbGRWYWx1ZSwgcHJvcGVydHlLZXkpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgQ29tcG9uZW50XSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgcHJvcGVydHkgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZXNvbHZlcyB0aGUge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9IGZvciB0aGUgcHJvcGVydHkgYW5kIHJldHVybnMgaXRzIHJlc3VsdC5cbiAgICAgKiBJZiBub25lIGlzIGRlZmluZWQgKHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbidzIGBvYnNlcnZlYCBvcHRpb24gaXMgYGZhbHNlYCkgaXQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcmV0dXJucyAgICAgICAgICAgICBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IGNoYW5nZWQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhhc0NoYW5nZWQgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIG9ic2VydmUgaXMgZWl0aGVyIGBmYWxzZWAgb3IgYSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZSkpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlLmNhbGwobnVsbCwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgIHRocm93IENIQU5HRV9ERVRFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSBmb3IgYSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSBUaGUgcHJvcGVydHkga2V5IGZvciB3aGljaCB0byByZXRyaWV2ZSB0aGUgZGVjbGFyYXRpb25cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UHJvcGVydHlEZWNsYXJhdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZWNsYXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnByb3BlcnRpZXMuZ2V0KHByb3BlcnR5S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogYXNzb2NpYXRlZCBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgcmVmbGVjdG9yLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogcmVmbGVjdG9yIHtAbGluayBfcmVmbGVjdEF0dHJpYnV0ZX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIC8vIGlnbm9yZSB1c2VyLWRlZmluZWQgb2JzZXJ2ZWQgYXR0cmlidXRlc1xuICAgICAgICAvLyBUT0RPOiB0ZXN0IHRoaXMgYW5kIHJlbW92ZSB0aGUgbG9nXG4gICAgICAgIGlmICghcHJvcGVydHlLZXkpIHtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYG9ic2VydmVkIGF0dHJpYnV0ZSBcIiR7IGF0dHJpYnV0ZU5hbWUgfVwiIG5vdCBmb3VuZC4uLiBpZ25vcmluZy4uLmApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlfSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc0F0dHJpYnV0ZVJlZmxlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUuY2FsbCh0aGlzLCBhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlXSBhcyBBdHRyaWJ1dGVSZWZsZWN0b3IpKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgcmVmbGVjdG9yLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogcmVmbGVjdG9yIHtAbGluayBfcmVmbGVjdFByb3BlcnR5fS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHl9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSB7XG5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayBpcyBjYWxsZWQgc3luY2hyb25vdXNseSwgd2UgY2FuIGNhdGNoIHRoZSBzdGF0ZSB0aGVyZVxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHldIGFzIFByb3BlcnR5UmVmbGVjdG9yKShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2UgYW4gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIG5vdGlmaWVyLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogbm90aWZpZXIge0BsaW5rIF9ub3RpZnlQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJhaXNlIGFuIGV2ZW50IGZvclxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkge1xuXG4gICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eU5vdGlmaWVyKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeV0gYXMgUHJvcGVydHlOb3RpZmllcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGNvbXBvbmVudCdzIHJlbmRlciByb290XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSByZW5kZXIgcm9vdCBpcyB3aGVyZSB0aGUge0BsaW5rIHJlbmRlcn0gbWV0aG9kIHdpbGwgYXR0YWNoIGl0cyBET00gb3V0cHV0LiBXaGVuIHVzaW5nIHRoZSBjb21wb25lbnRcbiAgICAgKiB3aXRoIHNoYWRvdyBtb2RlLCBpdCB3aWxsIGJlIGEge0BsaW5rIFNoYWRvd1Jvb3R9LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGl0c2VsZi5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY3JlYXRlUmVuZGVyUm9vdCAoKTogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5zaGFkb3dcbiAgICAgICAgICAgID8gdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSlcbiAgICAgICAgICAgIDogdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBjb21wb25lbnQncyBzdHlsZXMgdG8gaXRzIHtAbGluayByZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH0gaW5zdGFuY2Ugd2lsbCBiZSBhZG9wdGVkXG4gICAgICogYnkgdGhlIHtAbGluayBTaGFkb3dSb290fS4gSWYgbm90LCBhIHN0eWxlIGVsZW1lbnQgaXMgY3JlYXRlZCBhbmQgYXR0YWNoZWQgdG8gdGhlIHtAbGluayBTaGFkb3dSb290fS4gSWYgdGhlXG4gICAgICogY29tcG9uZW50IGlzIG5vdCB1c2luZyBzaGFkb3cgbW9kZSwgYSBzY3JpcHQgdGFnIHdpbGwgYmUgYXBwZW5kZWQgdG8gdGhlIGRvY3VtZW50J3MgYDxoZWFkPmAuIEZvciBtdWx0aXBsZVxuICAgICAqIGluc3RhbmNlcyBvZiB0aGUgc2FtZSBjb21wb25lbnQgb25seSBvbmUgc3R5bGVzaGVldCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYWRvcHRTdHlsZXMgKCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuICAgICAgICBjb25zdCBzdHlsZVNoZWV0ID0gY29uc3RydWN0b3Iuc3R5bGVTaGVldDtcbiAgICAgICAgY29uc3Qgc3R5bGVFbGVtZW50ID0gY29uc3RydWN0b3Iuc3R5bGVFbGVtZW50O1xuICAgICAgICBjb25zdCBzdHlsZXMgPSBjb25zdHJ1Y3Rvci5zdHlsZXM7XG5cbiAgICAgICAgaWYgKHN0eWxlU2hlZXQpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIHBhcnQgb25jZSB3ZSBoYXZlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgKENocm9tZSA3MylcbiAgICAgICAgICAgIGlmICghY29uc3RydWN0b3Iuc2hhZG93KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMuaW5jbHVkZXMoc3R5bGVTaGVldCkpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW1xuICAgICAgICAgICAgICAgICAgICAuLi4oZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVTaGVldFxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgd29yayBvbmNlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJyaXZlXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9jb25zdHJ1Y3Qtc3R5bGVzaGVldHMvXG4gICAgICAgICAgICAgICAgKHRoaXMucmVuZGVyUm9vdCBhcyBTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMgPSBbc3R5bGVTaGVldF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChzdHlsZUVsZW1lbnQpIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogdGVzdCB3ZSBkb24ndCBkdXBsaWNhdGUgc3R5bGVzaGVldHMgZm9yIG5vbi1zaGFkb3cgZWxlbWVudHNcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlQWxyZWFkeUFkZGVkID0gY29uc3RydWN0b3Iuc2hhZG93XG4gICAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgICAgIDogQXJyYXkuZnJvbShkb2N1bWVudC5zdHlsZVNoZWV0cykuZmluZChzdHlsZSA9PiBzdHlsZS50aXRsZSA9PT0gY29uc3RydWN0b3Iuc2VsZWN0b3IpICYmIHRydWUgfHwgZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChzdHlsZUFscmVhZHlBZGRlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBjbG9uZSB0aGUgY2FjaGVkIHN0eWxlIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gc3R5bGVFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKGNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb290LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgYXR0cmlidXRlIHJlZmxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBubyB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIGF0dHJpYnV0ZSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgYXR0cmlidXRlIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdEF0dHJpYnV0ZSAoYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleSA9IGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZ2V0KGF0dHJpYnV0ZU5hbWUpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLmZyb21BdHRyaWJ1dGUuY2FsbCh0aGlzLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiB0aGlzXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgcHJvcGVydHkgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGhhdmUgYSBkZWNsYXJhdGlvblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgLy8gaWYgdGhlIGRlZmF1bHQgcmVmbGVjdG9yIGlzIHVzZWQsIHdlIG5lZWQgdG8gY2hlY2sgaWYgYW4gYXR0cmlidXRlIGZvciB0aGlzIHByb3BlcnR5IGV4aXN0c1xuICAgICAgICAvLyBpZiBub3QsIHdlIHdvbid0IHJlZmxlY3RcbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlY2xhcmF0aW9uLmF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHksIGl0J3MgYSBzdHJpbmdcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlIGFzIHN0cmluZztcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci50b0F0dHJpYnV0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlKTtcblxuICAgICAgICAvLyB1bmRlZmluZWQgbWVhbnMgZG9uJ3QgY2hhbmdlXG4gICAgICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIG1lYW5zIHJlbW92ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGVsc2UgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgcHJvcGVydHktY2hhbmdlZCBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5XG4gICAgICogQHBhcmFtIG9sZFZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBjcmVhdGVFdmVudE5hbWUocHJvcGVydHlLZXksICcnLCAnY2hhbmdlZCcpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIGxpZmVjeWNsZSBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZSBUaGUgbGlmZWN5Y2xlIGZvciB3aGljaCB0byByYWlzZSB0aGUgZXZlbnQgKHdpbGwgYmUgdGhlIGV2ZW50IG5hbWUpXG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeUxpZmVjeWNsZSAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbD86IG9iamVjdCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQobGlmZWN5Y2xlLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgLi4uKGRldGFpbCA/IHsgZGV0YWlsOiBkZXRhaWwgfSA6IHt9KVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2xpc3RlbiAoKSB7XG5cbiAgICAgICAgKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkubGlzdGVuZXJzLmZvckVhY2goKGRlY2xhcmF0aW9uLCBsaXN0ZW5lcikgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZURlY2xhcmF0aW9uOiBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb3B5IHRoZSBjbGFzcydzIHN0YXRpYyBsaXN0ZW5lciBkZWNsYXJhdGlvbiBpbnRvIGFuIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGRlY2xhcmF0aW9uLmV2ZW50LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGRlY2xhcmF0aW9uLm9wdGlvbnMsXG5cbiAgICAgICAgICAgICAgICAvLyBiaW5kIHRoZSBjb21wb25lbnRzIGxpc3RlbmVyIG1ldGhvZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICBsaXN0ZW5lcjogKHRoaXNbbGlzdGVuZXIgYXMga2V5b2YgdGhpc10gYXMgdW5rbm93biBhcyBFdmVudExpc3RlbmVyKS5iaW5kKHRoaXMpLFxuXG4gICAgICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBldmVudCB0YXJnZXQgYW5kIHN0b3JlIGl0IGluIHRoZSBpbnN0YW5jZSBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIHRhcmdldDogKGRlY2xhcmF0aW9uLnRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgPyAodHlwZW9mIGRlY2xhcmF0aW9uLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZGVjbGFyYXRpb24udGFyZ2V0LmNhbGwodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZGVjbGFyYXRpb24udGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgIDogdGhpc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gYWRkIHRoZSBib3VuZCBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24uZXZlbnQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi5vcHRpb25zKTtcblxuICAgICAgICAgICAgLy8gc2F2ZSB0aGUgaW5zdGFuY2UgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW4gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJEZWNsYXJhdGlvbnMucHVzaChpbnN0YW5jZURlY2xhcmF0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGNvbXBvbmVudCBsaXN0ZW5lcnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdW5saXN0ZW4gKCkge1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2xhcmF0aW9uKSA9PiB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLmV2ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5saXN0ZW5lcixcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5xdWV1ZSBhIHJlcXVlc3QgZm9yIGFuIGFzeW5jaHJvbm91cyB1cGRhdGVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfZW5xdWV1ZVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgbGV0IHJlc29sdmU6IChyZXN1bHQ6IGJvb2xlYW4pID0+IHZvaWQ7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNSZXF1ZXN0ID0gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAvLyBtYXJrIHRoZSBjb21wb25lbnQgYXMgaGF2aW5nIHJlcXVlc3RlZCBhbiB1cGRhdGUsIHRoZSB7QGxpbmsgX3JlcXVlc3RVcGRhdGV9XG4gICAgICAgIC8vIG1ldGhvZCB3aWxsIG5vdCBlbnF1ZXVlIGEgZnVydGhlciByZXF1ZXN0IGZvciB1cGRhdGUgaWYgb25lIGlzIHNjaGVkdWxlZFxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJlcXVlc3QgPSBuZXcgUHJvbWlzZTxib29sZWFuPihyZXMgPT4gcmVzb2x2ZSA9IHJlcyk7XG5cbiAgICAgICAgLy8gd2FpdCBmb3IgdGhlIHByZXZpb3VzIHVwZGF0ZSB0byByZXNvbHZlXG4gICAgICAgIC8vIGBhd2FpdGAgaXMgYXN5bmNocm9ub3VzIGFuZCB3aWxsIHJldHVybiBleGVjdXRpb24gdG8gdGhlIHtAbGluayByZXF1ZXN0VXBkYXRlfSBtZXRob2RcbiAgICAgICAgLy8gYW5kIGVzc2VudGlhbGx5IGFsbG93cyB1cyB0byBiYXRjaCBtdWx0aXBsZSBzeW5jaHJvbm91cyBwcm9wZXJ0eSBjaGFuZ2VzLCBiZWZvcmUgdGhlXG4gICAgICAgIC8vIGV4ZWN1dGlvbiBjYW4gcmVzdW1lIGhlcmVcbiAgICAgICAgYXdhaXQgcHJldmlvdXNSZXF1ZXN0O1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3NjaGVkdWxlVXBkYXRlKCk7XG5cbiAgICAgICAgLy8gdGhlIGFjdHVhbCB1cGRhdGUgbWF5IGJlIHNjaGVkdWxlZCBhc3luY2hyb25vdXNseSBhcyB3ZWxsXG4gICAgICAgIGlmIChyZXN1bHQpIGF3YWl0IHJlc3VsdDtcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBuZXcge0BsaW5rIF91cGRhdGVSZXF1ZXN0fSBhZnRlciB0aGUgcmVzdWx0IG9mIHRoZSBjdXJyZW50IHVwZGF0ZSByZXNvbHZlc1xuICAgICAgICByZXNvbHZlISghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTY2hlZHVsZSB0aGUgdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2NoZWR1bGVzIHRoZSBmaXJzdCB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhcyBzb29uIGFzIHBvc3NpYmxlIGFuZCBhbGwgY29uc2VjdXRpdmUgdXBkYXRlc1xuICAgICAqIGp1c3QgYmVmb3JlIHRoZSBuZXh0IGZyYW1lLiBJbiB0aGUgbGF0dGVyIGNhc2UgaXQgcmV0dXJucyBhIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCBhZnRlclxuICAgICAqIHRoZSB1cGRhdGUgaXMgZG9uZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2NoZWR1bGVVcGRhdGUgKCk6IFByb21pc2U8dm9pZD4gfCB2b2lkIHtcblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1VwZGF0ZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIHNjaGVkdWxlIHRoZSB1cGRhdGUgdmlhIHJlcXVlc3RBbmltYXRpb25GcmFtZSB0byBhdm9pZCBtdWx0aXBsZSByZWRyYXdzIHBlciBmcmFtZVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGNvbXBvbmVudCB1cGRhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW52b2tlcyB7QGxpbmsgdXBkYXRlQ2FsbGJhY2t9IGFmdGVyIHBlcmZvcm1pbmcgdGhlIHVwZGF0ZSBhbmQgY2xlYW5zIHVwIHRoZSBjb21wb25lbnRcbiAgICAgKiBzdGF0ZS4gRHVyaW5nIHRoZSBmaXJzdCB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZXMgd2lsbCBiZSBhZGRlZC4gRGlzcGF0Y2hlcyB0aGUgdXBkYXRlXG4gICAgICogbGlmZWN5Y2xlIGV2ZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wZXJmb3JtVXBkYXRlICgpIHtcblxuICAgICAgICAvLyB3ZSBoYXZlIHRvIHdhaXQgdW50aWwgdGhlIGNvbXBvbmVudCBpcyBjb25uZWN0ZWQgYmVmb3JlIHdlIGNhbiBkbyBhbnkgdXBkYXRlc1xuICAgICAgICAvLyB0aGUge0BsaW5rIGNvbm5lY3RlZENhbGxiYWNrfSB3aWxsIGNhbGwge0BsaW5rIHJlcXVlc3RVcGRhdGV9IGluIGFueSBjYXNlLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8gc2ltcGx5IGJ5cGFzcyBhbnkgYWN0dWFsIHVwZGF0ZSBhbmQgY2xlYW4tdXAgdW50aWwgdGhlblxuICAgICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIHBhc3MgYSBjb3B5IG9mIHRoZSBwcm9wZXJ0eSBjaGFuZ2VzIHRvIHRoZSB1cGRhdGUgbWV0aG9kLCBzbyBwcm9wZXJ0eSBjaGFuZ2VzXG4gICAgICAgICAgICAvLyBhcmUgYXZhaWxhYmxlIGluIGFuIG92ZXJyaWRkZW4gdXBkYXRlIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy51cGRhdGUoY2hhbmdlcyk7XG5cbiAgICAgICAgICAgIC8vIHJlc2V0IHByb3BlcnR5IG1hcHMgZGlyZWN0bHkgYWZ0ZXIgdGhlIHVwZGF0ZSwgc28gY2hhbmdlcyBkdXJpbmcgdGhlIHVwZGF0ZUNhbGxiYWNrXG4gICAgICAgICAgICAvLyBjYW4gYmUgcmVjb3JkZWQgZm9yIHRoZSBuZXh0IHVwZGF0ZSwgd2hpY2ggaGFzIHRvIGJlIHRyaWdnZXJlZCBtYW51YWxseSB0aG91Z2hcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlIHdlIGFkb3B0IHRoZSBlbGVtZW50J3Mgc3R5bGVzIGFuZCBzZXQgdXAgZGVjbGFyZWQgbGlzdGVuZXJzXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2hhc1VwZGF0ZWQpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Fkb3B0U3R5bGVzKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBiaW5kIGxpc3RlbmVycyBhZnRlciB0aGUgdXBkYXRlLCB0aGlzIHdheSB3ZSBlbnN1cmUgYWxsIERPTSBpcyByZW5kZXJlZCwgYWxsIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAvLyBhcmUgdXAtdG8tZGF0ZSBhbmQgYW55IHVzZXItY3JlYXRlZCBvYmplY3RzIChlLmcuIHdvcmtlcnMpIHdpbGwgYmUgY3JlYXRlZCBpbiBhblxuICAgICAgICAgICAgICAgIC8vIG92ZXJyaWRkZW4gY29ubmVjdGVkQ2FsbGJhY2tcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayhjaGFuZ2VzLCAhdGhpcy5faGFzVXBkYXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgndXBkYXRlJywgeyBjaGFuZ2VzOiBjaGFuZ2VzLCBmaXJzdFVwZGF0ZTogIXRoaXMuX2hhc1VwZGF0ZWQgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2hhc1VwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFyayBjb21wb25lbnQgYXMgdXBkYXRlZCAqYWZ0ZXIqIHRoZSB1cGRhdGUgdG8gcHJldmVudCBpbmZpbnRlIGxvb3BzIGluIHRoZSB1cGRhdGUgcHJvY2Vzc1xuICAgICAgICAvLyBOLkIuOiBhbnkgcHJvcGVydHkgY2hhbmdlcyBkdXJpbmcgdGhlIHVwZGF0ZSB3aWxsIG5vdCB0cmlnZ2VyIGFub3RoZXIgdXBkYXRlXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQSBzaW1wbGUgY3NzIHRlbXBsYXRlIGxpdGVyYWwgdGFnXG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSB0YWcgaXRzZWxmIGRvZXNuJ3QgZG8gYW55dGhpbmcgdGhhdCBhbiB1bnRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFsIHdvdWxkbid0IGRvLCBidXQgaXQgY2FuIGJlIHVzZWQgYnlcbiAqIGVkaXRvciBwbHVnaW5zIHRvIGluZmVyIHRoZSBcInZpcnR1YWwgZG9jdW1lbnQgdHlwZVwiIHRvIHByb3ZpZGUgY29kZSBjb21wbGV0aW9uIGFuZCBoaWdobGlnaHRpbmcuIEl0IGNvdWxkXG4gKiBhbHNvIGJlIHVzZWQgaW4gdGhlIGZ1dHVyZSB0byBtb3JlIHNlY3VyZWx5IGNvbnZlcnQgc3Vic3RpdHV0aW9ucyBpbnRvIHN0cmluZ3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuICpcbiAqIGNvbnN0IG1peGluQm94ID0gKGJvcmRlcldpZHRoOiBzdHJpbmcgPSAnMXB4JywgYm9yZGVyQ29sb3I6IHN0cmluZyA9ICdzaWx2ZXInKSA9PiBjc3NgXG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogICBib3JkZXI6ICR7Ym9yZGVyV2lkdGh9IHNvbGlkICR7Ym9yZGVyQ29sb3J9O1xuICogYDtcbiAqXG4gKiBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2BcbiAqICR7IHNlbGVjdG9yIH06aG92ZXIge1xuICogICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKiBgO1xuICpcbiAqIGNvbnN0IHN0eWxlcyA9IGNzc2BcbiAqIDpob3N0IHtcbiAqICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbiAqICAgZGlzcGxheTogYmxvY2s7XG4gKiAgICR7IG1peGluQm94KCkgfVxuICogfVxuICogJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG4gKiA6OnNsb3R0ZWQoKikge1xuICogICBtYXJnaW46IDA7XG4gKiB9XG4gKiBgO1xuICpcbiAqIC8vIHdpbGwgcHJvZHVjZS4uLlxuICogOmhvc3Qge1xuICogLS1ob3Zlci1jb2xvcjogZ3JlZW47XG4gKiBkaXNwbGF5OiBibG9jaztcbiAqXG4gKiBkaXNwbGF5OiBibG9jaztcbiAqIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gKiBib3JkZXI6IDFweCBzb2xpZCBzaWx2ZXI7XG4gKlxuICogfVxuICpcbiAqIDpob3N0OmhvdmVyIHtcbiAqIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbiAqIH1cbiAqXG4gKiA6OnNsb3R0ZWQoKikge1xuICogbWFyZ2luOiAwO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBjc3MgPSAobGl0ZXJhbHM6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5zdWJzdGl0dXRpb25zOiBhbnlbXSkgPT4ge1xuXG4gICAgcmV0dXJuIHN1YnN0aXR1dGlvbnMucmVkdWNlKChwcmV2OiBzdHJpbmcsIGN1cnI6IGFueSwgaTogbnVtYmVyKSA9PiBwcmV2ICsgY3VyciArIGxpdGVyYWxzW2kgKyAxXSwgbGl0ZXJhbHNbMF0pO1xufTtcblxuLy8gY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuXG4vLyBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuLy8gICBkaXNwbGF5OiBibG9jaztcbi8vICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbi8vICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbi8vIGA7XG5cbi8vIGNvbnN0IG1peGluSG92ZXIgPSAoc2VsZWN0b3I6IHN0cmluZykgPT4gY3NzYFxuLy8gJHsgc2VsZWN0b3IgfTpob3ZlciB7XG4vLyAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnN0IHN0eWxlcyA9IGNzc2Bcbi8vIDpob3N0IHtcbi8vICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgICR7IG1peGluQm94KCkgfVxuLy8gfVxuXG4vLyAkeyBtaXhpbkhvdmVyKCc6aG9zdCcpIH1cblxuLy8gOjpzbG90dGVkKCopIHtcbi8vICAgbWFyZ2luOiAwO1xuLy8gfVxuLy8gYDtcblxuLy8gY29uc29sZS5sb2coc3R5bGVzKTtcbiIsImV4cG9ydCBjb25zdCBBcnJvd1VwID0gJ0Fycm93VXAnO1xuZXhwb3J0IGNvbnN0IEFycm93RG93biA9ICdBcnJvd0Rvd24nO1xuZXhwb3J0IGNvbnN0IEFycm93TGVmdCA9ICdBcnJvd0xlZnQnO1xuZXhwb3J0IGNvbnN0IEFycm93UmlnaHQgPSAnQXJyb3dSaWdodCc7XG5leHBvcnQgY29uc3QgRW50ZXIgPSAnRW50ZXInO1xuZXhwb3J0IGNvbnN0IEVzY2FwZSA9ICdFc2NhcGUnO1xuZXhwb3J0IGNvbnN0IFNwYWNlID0gJyAnO1xuZXhwb3J0IGNvbnN0IFRhYiA9ICdUYWInO1xuZXhwb3J0IGNvbnN0IEJhY2tzcGFjZSA9ICdCYWNrc3BhY2UnO1xuZXhwb3J0IGNvbnN0IEFsdCA9ICdBbHQnO1xuZXhwb3J0IGNvbnN0IFNoaWZ0ID0gJ1NoaWZ0JztcbmV4cG9ydCBjb25zdCBDb250cm9sID0gJ0NvbnRyb2wnO1xuZXhwb3J0IGNvbnN0IE1ldGEgPSAnTWV0YSc7XG4iLCJpbXBvcnQgeyBBcnJvd0Rvd24sIEFycm93TGVmdCwgQXJyb3dSaWdodCwgQXJyb3dVcCB9IGZyb20gJy4va2V5cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2ZUl0ZW1DaGFuZ2U8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEN1c3RvbUV2ZW50IHtcbiAgICB0eXBlOiAnYWN0aXZlLWl0ZW0tY2hhbmdlJztcbiAgICBkZXRhaWw6IHtcbiAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgIGluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpdGVtOiBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudHlwZSBMaXN0RW50cnk8VCBleHRlbmRzIExpc3RJdGVtPiA9IFtudW1iZXIgfCB1bmRlZmluZWQsIFQgfCB1bmRlZmluZWRdO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTGlzdEtleU1hbmFnZXI8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZUl0ZW06IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgbGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBpdGVtVHlwZTogYW55O1xuXG4gICAgcHVibGljIGl0ZW1zOiBUW107XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHB1YmxpYyBob3N0OiBIVE1MRWxlbWVudCxcbiAgICAgICAgaXRlbXM6IE5vZGVMaXN0T2Y8VD4sXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gQXJyYXkuZnJvbShpdGVtcyk7XG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSB0aGlzLml0ZW1zWzBdICYmIHRoaXMuaXRlbXNbMF0uY29uc3RydWN0b3I7XG5cbiAgICAgICAgdGhpcy5iaW5kSG9zdCgpO1xuICAgIH1cblxuICAgIGdldEFjdGl2ZUl0ZW0gKCk6IFQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUl0ZW07XG4gICAgfTtcblxuICAgIHNldEFjdGl2ZUl0ZW0gKGl0ZW06IFQsIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgY29uc3QgZW50cnk6IExpc3RFbnRyeTxUPiA9IFtcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpdGVtIDogdW5kZWZpbmVkXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldE5leHRJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldE5leHRFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0UHJldmlvdXNJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldFByZXZpb3VzRW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldEZpcnN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRGaXJzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRMYXN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRMYXN0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgW3ByZXYsIG5leHRdID0gKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gW0Fycm93TGVmdCwgQXJyb3dSaWdodF0gOiBbQXJyb3dVcCwgQXJyb3dEb3duXTtcbiAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIHByZXY6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBuZXh0OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXROZXh0SXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZWRvd24gKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVGb2N1cyAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zdCB0YXJnZXQ6IFQgfCBudWxsID0gZXZlbnQudGFyZ2V0IGFzIFQgfCBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLml0ZW1UeXBlICYmIHRhcmdldCBpbnN0YW5jZW9mIHRoaXMuaXRlbVR5cGUgJiYgIXRhcmdldCEuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldCBhcyBULCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UgKHByZXZpb3VzSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50OiBBY3RpdmVJdGVtQ2hhbmdlPFQ+ID0gbmV3IEN1c3RvbUV2ZW50KCdhY3RpdmUtaXRlbS1jaGFuZ2UnLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHByZXZpb3VzSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06ICh0eXBlb2YgcHJldmlvdXNJbmRleCA9PT0gJ251bWJlcicpID8gdGhpcy5pdGVtc1twcmV2aW91c0luZGV4XSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgICAgICAgICBpbmRleDogdGhpcy5hY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogdGhpcy5hY3RpdmVJdGVtXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSBhcyBBY3RpdmVJdGVtQ2hhbmdlPFQ+O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV0gPSBlbnRyeTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TmV4dEVudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAtMTtcblxuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBuZXh0SW5kZXggPSBmcm9tSW5kZXggKyAxO1xuICAgICAgICBsZXQgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zW25leHRJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKG5leHRJbmRleCA8IGxhc3RJbmRleCAmJiBuZXh0SXRlbSAmJiBuZXh0SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBuZXh0SXRlbSA9IHRoaXMuaXRlbXNbKytuZXh0SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChuZXh0SXRlbSAmJiAhbmV4dEl0ZW0uZGlzYWJsZWQpID8gW25leHRJbmRleCwgbmV4dEl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFByZXZpb3VzRW50cnkgKGZyb21JbmRleD86IG51bWJlcik6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgZnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgPyBmcm9tSW5kZXhcbiAgICAgICAgICAgIDogKHR5cGVvZiB0aGlzLmFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlSW5kZXhcbiAgICAgICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgbGV0IHByZXZJbmRleCA9IGZyb21JbmRleCAtIDE7XG4gICAgICAgIGxldCBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbcHJldkluZGV4XTtcblxuICAgICAgICB3aGlsZSAocHJldkluZGV4ID4gMCAmJiBwcmV2SXRlbSAmJiBwcmV2SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbLS1wcmV2SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChwcmV2SXRlbSAmJiAhcHJldkl0ZW0uZGlzYWJsZWQpID8gW3ByZXZJbmRleCwgcHJldkl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEZpcnN0RW50cnkgKCk6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEVudHJ5KC0xKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TGFzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFByZXZpb3VzRW50cnkodGhpcy5pdGVtcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBiaW5kSG9zdCAoKSB7XG5cbiAgICAgICAgLy8gVE9ETzogZW5hYmxlIHJlY29ubmVjdGluZyB0aGUgaG9zdCBlbGVtZW50PyBubyBuZWVkIGlmIEZvY3VzTWFuYWdlciBpcyBjcmVhdGVkIGluIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IE1hcChbXG4gICAgICAgICAgICBbJ2ZvY3VzaW4nLCB0aGlzLmhhbmRsZUZvY3VzLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnZGlzY29ubmVjdGVkJywgdGhpcy51bmJpbmRIb3N0LmJpbmQodGhpcyldXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVuYmluZEhvc3QgKCkge1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9jdXNLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBMaXN0S2V5TWFuYWdlcjxUPiB7XG5cbiAgICBwcm90ZWN0ZWQgc2V0RW50cnlBY3RpdmUgKGVudHJ5OiBMaXN0RW50cnk8VD4sIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBzdXBlci5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW0gJiYgaW50ZXJhY3RpdmUpIHRoaXMuYWN0aXZlSXRlbS5mb2N1cygpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQ8SWNvbj4oe1xuICAgIHNlbGVjdG9yOiAndWktaWNvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgIHdpZHRoOiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSk7XG4gICAgICAgIHBhZGRpbmc6IGNhbGMoKHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSkgLSB2YXIoLS1mb250LXNpemUsIDFlbSkpIC8gMik7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgICAgICBmb250LXNpemU6IGluaGVyaXQ7XG4gICAgICAgIHZlcnRpY2FsLWFsaWduOiBib3R0b207XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgfVxuICAgIHN2ZyB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgICAgICBmb250LXNpemU6IGluaGVyaXQ7XG4gICAgICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICAgICAgICBmaWxsOiB2YXIoLS1pY29uLWNvbG9yLCBjdXJyZW50Q29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9dW5pXSkge1xuICAgICAgICBwYWRkaW5nOiAwZW07XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD1tYXRdKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD1laV0pIHtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IChlbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNldCA9IGVsZW1lbnQuc2V0O1xuICAgICAgICBjb25zdCBpY29uID0gKHNldCA9PT0gJ21hdCcpXG4gICAgICAgICAgICA/IGBpY18keyBlbGVtZW50Lmljb24gfV8yNHB4YFxuICAgICAgICAgICAgOiAoc2V0ID09PSAnZWknKVxuICAgICAgICAgICAgICAgID8gYGVpLSR7IGVsZW1lbnQuaWNvbiB9LWljb25gXG4gICAgICAgICAgICAgICAgOiBlbGVtZW50Lmljb247XG5cbiAgICAgICAgcmV0dXJuIGh0bWxgXG4gICAgICAgIDxzdmcgZm9jdXNhYmxlPVwiZmFsc2VcIj5cbiAgICAgICAgICAgIDx1c2UgaHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiXG4gICAgICAgICAgICB4bGluazpocmVmPVwiJHsgKGVsZW1lbnQuY29uc3RydWN0b3IgYXMgdHlwZW9mIEljb24pLmdldFNwcml0ZShzZXQpIH0jJHsgaWNvbiB9XCIgLz5cbiAgICAgICAgPC9zdmc+YDtcbiAgICB9XG59KVxuZXhwb3J0IGNsYXNzIEljb24gZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgZm9yIGNhY2hpbmcgYW4gaWNvbiBzZXQncyBzcHJpdGUgdXJsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfc3ByaXRlczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgc3ZnIHNwcml0ZSB1cmwgZm9yIHRoZSByZXF1ZXN0ZWQgaWNvbiBzZXRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNwcml0ZSB1cmwgZm9yIGFuIGljb24gc2V0IGNhbiBiZSBzZXQgdGhyb3VnaCBhIGBtZXRhYCB0YWcgaW4gdGhlIGh0bWwgZG9jdW1lbnQuIFlvdSBjYW4gZGVmaW5lXG4gICAgICogY3VzdG9tIGljb24gc2V0cyBieSBjaG9zaW5nIGFuIGlkZW50aWZpZXIgKHN1Y2ggYXMgYDpteXNldGAgaW5zdGVhZCBvZiBgOmZhYCwgYDptYXRgIG9yIGA6aWVgKSBhbmRcbiAgICAgKiBjb25maWd1cmluZyBpdHMgbG9jYXRpb24uXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCFkb2N0eXBlIGh0bWw+XG4gICAgICogPGh0bWw+XG4gICAgICogICAgPGhlYWQ+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBtdWx0aXBsZSBzdmcgc3ByaXRlcyAtLT5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOmZhXCIgY29udGVudD1cImFzc2V0cy9pY29ucy9zcHJpdGVzL2ZvbnQtYXdlc29tZS9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOm1hdFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9tYXRlcmlhbC9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOmVpXCIgY29udGVudD1cImFzc2V0cy9pY29uL3Nwcml0ZXMvZXZpbC1pY29ucy9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8IS0tIHN1cHBvcnRzIGN1c3RvbSBzdmcgc3ByaXRlcyAtLT5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOm15c2V0XCIgY29udGVudD1cImFzc2V0cy9pY29uL3Nwcml0ZXMvbXlzZXQvbXlfc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPC9oZWFkPlxuICAgICAqICAgIC4uLlxuICAgICAqIDwvaHRtbD5cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIFdoZW4gdXNpbmcgdGhlIGljb24gZWxlbWVudCwgc3BlY2lmeSB5b3VyIGN1c3RvbSBpY29uIHNldC5cbiAgICAgKlxuICAgICAqIGBgYGh0bWxcbiAgICAgKiA8IS0tIHVzZSBhdHRyaWJ1dGVzIC0tPlxuICAgICAqIDx1aS1pY29uIGRhdGEtaWNvbj1cIm15X2ljb25faWRcIiBkYXRhLXNldD1cIm15c2V0XCI+PC91aS1pY29uPlxuICAgICAqIDwhLS0gb3IgdXNlIHByb3BlcnR5IGJpbmRpbmdzIHdpdGhpbiBsaXQtaHRtbCB0ZW1wbGF0ZXMgLS0+XG4gICAgICogPHVpLWljb24gLmljb249JHsnbXlfaWNvbl9pZCd9IC5zZXQ9JHsnbXlzZXQnfT48L3VpLWljb24+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBJZiBubyBzcHJpdGUgdXJsIGlzIHNwZWNpZmllZCBmb3IgYSBzZXQsIHRoZSBpY29uIGVsZW1lbnQgd2lsbCBhdHRlbXB0IHRvIHVzZSBhbiBzdmcgaWNvbiBmcm9tXG4gICAgICogYW4gaW5saW5lZCBzdmcgZWxlbWVudCBpbiB0aGUgY3VycmVudCBkb2N1bWVudC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIGdldFNwcml0ZSAoc2V0OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgICAgIGlmICghdGhpcy5fc3ByaXRlcy5oYXMoc2V0KSkge1xuXG4gICAgICAgICAgICBjb25zdCBtZXRhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWV0YVtuYW1lPVwidWktaWNvbjpzcHJpdGU6JHsgc2V0IH1cIl1bY29udGVudF1gKTtcblxuICAgICAgICAgICAgaWYgKG1ldGEpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZXMuc2V0KHNldCwgbWV0YS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKSEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nwcml0ZXMuZ2V0KHNldCkgfHwgJyc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnZGF0YS1pY29uJ1xuICAgIH0pXG4gICAgaWNvbiA9ICdpbmZvJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtc2V0J1xuICAgIH0pXG4gICAgc2V0ID0gJ2ZhJ1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnaW1nJyk7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCAnLi4vaWNvbi9pY29uJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4uL2tleXMnO1xuXG5AY29tcG9uZW50PEFjY29yZGlvbkhlYWRlcj4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLWhlYWRlcicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgYWxsOiBpbmhlcml0O1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgZmxleDogMSAxIDEwMCU7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZGlzYWJsZWQ9dHJ1ZV0pIHtcbiAgICAgICAgY3Vyc29yOiBkZWZhdWx0O1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1leHBhbmRlZD10cnVlXSkgPiB1aS1pY29uLmV4cGFuZCxcbiAgICA6aG9zdChbYXJpYS1leHBhbmRlZD1mYWxzZV0pID4gdWktaWNvbi5jb2xsYXBzZSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBlbGVtZW50ID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIDx1aS1pY29uIGNsYXNzPVwiY29sbGFwc2VcIiBkYXRhLWljb249XCJtaW51c1wiIGRhdGEtc2V0PVwidW5pXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC91aS1pY29uPlxuICAgIDx1aS1pY29uIGNsYXNzPVwiZXhwYW5kXCIgZGF0YS1pY29uPVwicGx1c1wiIGRhdGEtc2V0PVwidW5pXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC91aS1pY29uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uSGVhZGVyIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgZGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6IDA7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1leHBhbmRlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW5cbiAgICB9KVxuICAgIGV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXghOiBudW1iZXIgfCBudWxsO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ2J1dHRvbic7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBodG1sLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuZXhwb3J0IHR5cGUgQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKSA9PiBUZW1wbGF0ZVJlc3VsdDtcblxuZXhwb3J0IGNvbnN0IGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHQgPT4ge1xuXG4gICAgcmV0dXJuIGh0bWxgJmNvcHk7IENvcHlyaWdodCAkeyBkYXRlLmdldEZ1bGxZZWFyKCkgfSAkeyBhdXRob3IudHJpbSgpIH1gO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgY29weXJpZ2h0LCBDb3B5cmlnaHRIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2NvcHlyaWdodCc7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuXG5sZXQgbmV4dEFjY29yZGlvblBhbmVsSWQgPSAwO1xuXG5AY29tcG9uZW50PEFjY29yZGlvblBhbmVsPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY2NvcmRpb24tcGFuZWwnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1oZWFkZXIge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHkge1xuICAgICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICAgIG92ZXJmbG93OiBhdXRvO1xuICAgICAgICB0cmFuc2l0aW9uOiBoZWlnaHQgLjJzIGVhc2Utb3V0O1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24tYm9keVthcmlhLWhpZGRlbj10cnVlXSB7XG4gICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG4gICAgLmNvcHlyaWdodCB7XG4gICAgICAgIHBhZGRpbmc6IDAgMXJlbSAxcmVtO1xuICAgICAgICBjb2xvcjogdmFyKC0tZGlzYWJsZWQtY29sb3IsICcjY2NjJyk7XG4gICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IChwYW5lbCwgY29weXJpZ2h0OiBDb3B5cmlnaHRIZWxwZXIpID0+IGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cInVpLWFjY29yZGlvbi1oZWFkZXJcIlxuICAgICAgICByb2xlPVwiaGVhZGluZ1wiXG4gICAgICAgIGFyaWEtbGV2ZWw9XCIkeyBwYW5lbC5sZXZlbCB9XCJcbiAgICAgICAgQGNsaWNrPSR7IHBhbmVsLnRvZ2dsZSB9PlxuICAgICAgICA8c2xvdCBuYW1lPVwiaGVhZGVyXCI+PC9zbG90PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24tYm9keVwiXG4gICAgICAgIGlkPVwiJHsgcGFuZWwuaWQgfS1ib2R5XCJcbiAgICAgICAgc3R5bGU9XCJoZWlnaHQ6ICR7IHBhbmVsLmNvbnRlbnRIZWlnaHQgfTtcIlxuICAgICAgICByb2xlPVwicmVnaW9uXCJcbiAgICAgICAgYXJpYS1oaWRkZW49XCIkeyAhcGFuZWwuZXhwYW5kZWQgfVwiXG4gICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIiR7IHBhbmVsLmlkIH0taGVhZGVyXCI+XG4gICAgICAgIDxzbG90Pjwvc2xvdD5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3B5cmlnaHRcIj4keyBjb3B5cmlnaHQobmV3IERhdGUoKSwgJ0FsZXhhbmRlciBXZW5kZScpIH08L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25QYW5lbCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2hlYWRlcjogQWNjb3JkaW9uSGVhZGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIF9ib2R5OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJvdGVjdGVkIGdldCBjb250ZW50SGVpZ2h0ICgpOiBzdHJpbmcge1xuXG4gICAgICAgIHJldHVybiAhdGhpcy5leHBhbmRlZCA/XG4gICAgICAgICAgICAnMHB4JyA6XG4gICAgICAgICAgICB0aGlzLl9ib2R5ID9cbiAgICAgICAgICAgICAgICBgJHsgdGhpcy5fYm9keS5zY3JvbGxIZWlnaHQgfXB4YCA6XG4gICAgICAgICAgICAgICAgJ2F1dG8nO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICBsZXZlbCA9IDE7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvciAoKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBgdWktYWNjb3JkaW9uLXBhbmVsLSR7IG5leHRBY2NvcmRpb25QYW5lbElkKysgfWA7XG4gICAgfVxuXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdyYXBwaW5nIHRoZSBwcm9wZXJ0eSBjaGFuZ2UgaW4gdGhlIHdhdGNoIG1ldGhvZCB3aWxsIGRpc3BhdGNoIGEgcHJvcGVydHkgY2hhbmdlIGV2ZW50XG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5faGVhZGVyKSB0aGlzLl9oZWFkZXIuZXhwYW5kZWQgPSB0aGlzLmV4cGFuZGVkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnNldEhlYWRlcih0aGlzLnF1ZXJ5U2VsZWN0b3IoQWNjb3JkaW9uSGVhZGVyLnNlbGVjdG9yKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGluIHRoZSBmaXJzdCB1cGRhdGUsIHdlIHF1ZXJ5IHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keVxuICAgICAgICAgICAgdGhpcy5fYm9keSA9IHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKGAjJHsgdGhpcy5pZCB9LWJvZHlgKTtcblxuICAgICAgICAgICAgLy8gaGF2aW5nIHF1ZXJpZWQgdGhlIGFjY29yZGlvbi1wYW5lbC1ib2R5LCB7QGxpbmsgY29udGVudEhlaWdodH0gY2FuIG5vdyBjYWxjdWxhdGUgdGhlXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGhlaWdodCBvZiB0aGUgcGFuZWwgYm9keSBmb3IgYW5pbWF0aW9uXG4gICAgICAgICAgICAvLyBpbiBvcmRlciB0byByZS1ldmFsdWF0ZSB0aGUgdGVtcGxhdGUgYmluZGluZyBmb3Ige0BsaW5rIGNvbnRlbnRIZWlnaHR9IHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgYW5vdGhlciByZW5kZXIgKHRoaXMgaXMgY2hlYXAsIG9ubHkgY29udGVudEhlaWdodCBoYXMgY2hhbmdlZCBhbmQgd2lsbCBiZSB1cGRhdGVkKVxuICAgICAgICAgICAgLy8gaG93ZXZlciB3ZSBjYW5ub3QgcmVxdWVzdCBhbm90aGVyIHVwZGF0ZSB3aGlsZSB3ZSBhcmUgc3RpbGwgaW4gdGhlIGN1cnJlbnQgdXBkYXRlIGN5Y2xlXG4gICAgICAgICAgICAvLyB1c2luZyBhIFByb21pc2UsIHdlIGNhbiBkZWZlciByZXF1ZXN0aW5nIHRoZSB1cGRhdGUgdW50aWwgYWZ0ZXIgdGhlIGN1cnJlbnQgdXBkYXRlIGlzIGRvbmVcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSh0cnVlKS50aGVuKCgpID0+IHRoaXMucmVxdWVzdFVwZGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSByZW5kZXIgbWV0aG9kIHRvIGluamVjdCBjdXN0b20gaGVscGVycyBpbnRvIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW5kZXIgKCkge1xuXG4gICAgICAgIHN1cGVyLnJlbmRlcihjb3B5cmlnaHQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRIZWFkZXIgKGhlYWRlcjogQWNjb3JkaW9uSGVhZGVyIHwgbnVsbCkge1xuXG4gICAgICAgIHRoaXMuX2hlYWRlciA9IGhlYWRlcjtcblxuICAgICAgICBpZiAoIWhlYWRlcikgcmV0dXJuO1xuXG4gICAgICAgIGhlYWRlci5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnaGVhZGVyJyk7XG5cbiAgICAgICAgaGVhZGVyLmlkID0gaGVhZGVyLmlkIHx8IGAkeyB0aGlzLmlkIH0taGVhZGVyYDtcbiAgICAgICAgaGVhZGVyLmNvbnRyb2xzID0gYCR7IHRoaXMuaWQgfS1ib2R5YDtcbiAgICAgICAgaGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgaGVhZGVyLmRpc2FibGVkID0gdGhpcy5kaXNhYmxlZDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRm9jdXNLZXlNYW5hZ2VyIH0gZnJvbSAnLi4vbGlzdC1rZXktbWFuYWdlcic7XG5pbXBvcnQgJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8QWNjb3JkaW9uSGVhZGVyPjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICByb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAncHJlc2VudGF0aW9uJztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGNzcyB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBjc3NgXG5kZW1vLWFwcCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG5cbmhlYWRlciB7XG4gIGZsZXg6IDAgMCBhdXRvO1xufVxuXG5tYWluIHtcbiAgZmxleDogMSAxIGF1dG87XG4gIHBhZGRpbmc6IDFyZW07XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIG92ZXJmbG93OiBhdXRvO1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDE1cmVtLCAxZnIpKTtcbiAgZ3JpZC1nYXA6IDFyZW07XG59XG5cbi5pY29ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZmxvdzogcm93IHdyYXA7XG59XG5cbi5zZXR0aW5ncy1saXN0IHtcbiAgcGFkZGluZzogMDtcbiAgbGlzdC1zdHlsZTogbm9uZTtcbn1cblxuLnNldHRpbmdzLWxpc3QgbGkge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG5cbnVpLWNhcmQge1xuICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbn1cblxudWktYWNjb3JkaW9uIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbDpub3QoOmZpcnN0LWNoaWxkKSB7XG4gIGJvcmRlci10b3A6IHZhcigtLWJvcmRlci13aWR0aCkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIGgzIHtcbiAgbWFyZ2luOiAxcmVtO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWwgcCB7XG4gIG1hcmdpbjogMXJlbTtcbn1cbmA7XG4iLCJpbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSAnLi9hcHAnO1xuXG5leHBvcnQgY29uc3QgdGVtcGxhdGUgPSAoZWxlbWVudDogQXBwKSA9PiBodG1sYFxuICAgIDxoZWFkZXI+XG4gICAgICAgIDxoMT5FeGFtcGxlczwvaDE+XG4gICAgPC9oZWFkZXI+XG5cbiAgICA8bWFpbj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkljb248L2gyPlxuXG4gICAgICAgICAgICA8aDM+Rm9udCBBd2Vzb21lPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrLW9wZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYWludC1icnVzaCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbi10cmlhbmdsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8tY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncXVlc3Rpb24tY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+VW5pY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhbmdsZS1yaWdodC1iJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VubG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyLWNpcmNsZScgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+TWF0ZXJpYWwgSWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbl9yaWdodCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdtYWlsJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9ja19vcGVuJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2JydXNoJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VkaXQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZGVsZXRlJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3dhcm5pbmcnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaW5mbycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdoZWxwJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2FjY291bnRfY2lyY2xlJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlcnNvbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICdjbGVhcicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPkV2aWwgSWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbi1yaWdodCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VubG9jaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BhcGVyY2xpcCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbmNpbCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2V4Y2xhbWF0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncXVlc3Rpb24nIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICdjbG9zZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDI+Q2hlY2tib3g8L2gyPlxuICAgICAgICAgICAgPHVpLWNoZWNrYm94IC5jaGVja2VkPSR7IHRydWUgfT48L3VpLWNoZWNrYm94PlxuXG4gICAgICAgICAgICA8aDI+VG9nZ2xlPC9oMj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cInNldHRpbmdzLWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5LWVtYWlsXCI+Tm90aWZpY2F0aW9uIGVtYWlsPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktZW1haWxcIiBhcmlhLWNoZWNrZWQ9XCJ0cnVlXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5LXNtc1wiPk5vdGlmaWNhdGlvbiBzbXM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgbGFiZWwtb249XCJ5ZXNcIiBsYWJlbC1vZmY9XCJub1wiIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeS1zbXNcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cInNldHRpbmdzLWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5XCI+Tm90aWZpY2F0aW9uczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnlcIiBhcmlhLWNoZWNrZWQ9XCJ0cnVlXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+Q2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWZvb3RlclwiPkNhcmQgZm9vdGVyPC9wPlxuICAgICAgICAgICAgPC91aS1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+QWN0aW9uIENhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWFjdGlvbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+TW9yZTwvYnV0dG9uPlxuICAgICAgICAgICAgPC91aS1hY3Rpb24tY2FyZD5cblxuICAgICAgICAgICAgPGgyPlBsYWluIENhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLXBsYWluLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktcGxhaW4tY2FyZD5cblxuICAgICAgICAgICAgPGgyPlRhYnM8L2gyPlxuICAgICAgICAgICAgPHVpLXRhYi1saXN0PlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItMVwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtMVwiPjxzcGFuPkZpcnN0IFRhYjwvc3Bhbj48L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTJcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTJcIj5TZWNvbmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0zXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0zXCIgYXJpYS1kaXNhYmxlZD1cInRydWVcIj5UaGlyZCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTRcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTRcIj5Gb3VydGggVGFiPC91aS10YWI+XG4gICAgICAgICAgICA8L3VpLXRhYi1saXN0PlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0xXCI+XG4gICAgICAgICAgICAgICAgPGgzPkZpcnN0IFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTJcIj5cbiAgICAgICAgICAgICAgICA8aDM+U2Vjb25kIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLCBkdW9cbiAgICAgICAgICAgICAgICAgICAgYW5pbWFsIGFjY3VzYW11cyBldSwgY2libyBlcnJvcmlidXMgZXQgbWVhLiBFeCBlYW0gd2lzaSBhZG1vZHVtIHByYWVzZW50LCBoYXMgY3Ugb2JsaXF1ZSBjZXRlcm9zXG4gICAgICAgICAgICAgICAgICAgIGVsZWlmZW5kLiBFeCBtZWwgcGxhdG9uZW0gYXNzZW50aW9yIHBlcnNlcXVlcmlzLCB2aXggY2libyBsaWJyaXMgdXQuIEFkIHRpbWVhbSBhY2N1bXNhbiBlc3QsIGV0IGF1dGVtXG4gICAgICAgICAgICAgICAgICAgIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWkgbmFtLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0zXCI+XG4gICAgICAgICAgICAgICAgPGgzPlRoaXJkIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+SSdtIGRpc2FibGVkLCB5b3Ugc2hvdWxkbid0IHNlZSBtZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtNFwiPlxuICAgICAgICAgICAgICAgIDxoMz5Gb3VydGggVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC4gTGF1ZGVtXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm8gcmVjdXNhYm8gYW5cbiAgICAgICAgICAgICAgICAgICAgZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5BY2NvcmRpb248L2gyPlxuXG4gICAgICAgICAgICA8dWktYWNjb3JkaW9uPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBpZD1cImN1c3RvbS1wYW5lbC1pZFwiIGV4cGFuZGVkIGxldmVsPVwiM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24taGVhZGVyPlBhbmVsIE9uZTwvdWktYWNjb3JkaW9uLWhlYWRlcj5cblxuICAgICAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIExhdWRlbSBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN1c2FibyBhbiBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+QXQgdXN1IGVwaWN1cmVpIGFzc2VudGlvciwgcHV0ZW50IGRpc3NlbnRpZXQgcmVwdWRpYW5kYWUgZWEgcXVvLiBQcm8gbmUgZGViaXRpcyBwbGFjZXJhdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmlmZXJ1bXF1ZSwgaW4gc29uZXQgdm9sdW11cyBpbnRlcnByZXRhcmlzIGN1bS4gRG9sb3J1bSBhcHBldGVyZSBuZSBxdW8uIERpY3RhIHF1YWxpc3F1ZSBlb3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhLCBlYW0gYXQgbnVsbGEgdGFtcXVhbS5cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgPC91aS1hY2NvcmRpb24tcGFuZWw+XG5cbiAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLXBhbmVsIGxldmVsPVwiM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24taGVhZGVyPlBhbmVsIFR3bzwvdWktYWNjb3JkaW9uLWhlYWRlcj5cblxuICAgICAgICAgICAgICAgICAgICA8cD5JbiBjbGl0YSB0b2xsaXQgbWluaW11bSBxdW8sIGFuIGFjY3VzYXRhIHZvbHV0cGF0IGV1cmlwaWRpcyB2aW0uIEZlcnJpIHF1aWRhbSBkZWxlbml0aSBxdW8gZWEsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW8gYW5pbWFsIGFjY3VzYW11cyBldSwgY2libyBlcnJvcmlidXMgZXQgbWVhLiBFeCBlYW0gd2lzaSBhZG1vZHVtIHByYWVzZW50LCBoYXMgY3Ugb2JsaXF1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2V0ZXJvcyBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVzdCwgZXQgYXV0ZW0gb21uZXMgY2l2aWJ1cyBtZWwuIE1lbCBldSB1YmlxdWUgZXF1aWRlbSBtb2xlc3RpYWUsIGNob3JvIGRvY2VuZGkgbW9kZXJhdGl1cyBlaVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+UXVpIHN1YXMgc29sZXQgY2V0ZXJvcyBjdSwgcGVydGluYXggdnVscHV0YXRlIGRldGVycnVpc3NldCBlb3MgbmUuIE5lIGl1cyB2aWRlIG51bGxhbSwgYWxpZW51bVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaWxsYWUgcmVmb3JtaWRhbnMgY3VtIGFkLiBFYSBtZWxpb3JlIHNhcGllbnRlbSBpbnRlcnByZXRhcmlzIGVhbS4gQ29tbXVuZSBkZWxpY2F0YVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwdWRpYW5kYWUgaW4gZW9zLCBwbGFjZXJhdCBpbmNvcnJ1cHRlIGRlZmluaXRpb25lcyBuZWMgZXguIEN1IGVsaXRyIHRhbnRhcyBpbnN0cnVjdGlvciBzaXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldSBldW0gYWxpYSBncmFlY2UgbmVnbGVnZW50dXIuPC9wPlxuXG4gICAgICAgICAgICAgICAgPC91aS1hY2NvcmRpb24tcGFuZWw+XG5cbiAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uPlxuXG4gICAgICAgICAgICA8aDI+UG9wb3ZlcjwvaDI+XG5cbiAgICAgICAgICAgIDxvdmVybGF5LWRlbW8+PC9vdmVybGF5LWRlbW8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgPC9tYWluPlxuICAgIGA7XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuLy8gd2UgY2FuIGRlZmluZSBtaXhpbnMgYXNcbmNvbnN0IG1peGluQ29udGFpbmVyOiAoYmFja2dyb3VuZD86IHN0cmluZykgPT4gc3RyaW5nID0gKGJhY2tncm91bmQ6IHN0cmluZyA9ICcjZmZmJykgPT4gY3NzYFxuICAgIGJhY2tncm91bmQ6ICR7IGJhY2tncm91bmQgfTtcbiAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbmA7XG5cbmNvbnN0IHN0eWxlID0gY3NzYFxuOmhvc3Qge1xuICAgIC0tbWF4LXdpZHRoOiA0MGNoO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1mbG93OiBjb2x1bW47XG4gICAgbWF4LXdpZHRoOiB2YXIoLS1tYXgtd2lkdGgpO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgLyogd2UgY2FuIGFwcGx5IG1peGlucyB3aXRoIHNwcmVhZCBzeW50YXggKi9cbiAgICAkeyBtaXhpbkNvbnRhaW5lcigpIH1cbn1cbjo6c2xvdHRlZCgqKSB7XG4gICAgbWFyZ2luOiAwO1xufVxuYDtcblxuQGNvbXBvbmVudDxDYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1jYXJkJyxcbiAgICBzdHlsZXM6IFtzdHlsZV0sXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1oZWFkZXJcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1mb290ZXJcIj48L3Nsb3Q+XG4gICAgPGRpdj5Xb3JrZXIgY291bnRlcjogJHsgY2FyZC5jb3VudGVyIH08L2Rpdj5cbiAgICA8YnV0dG9uPlN0b3Agd29ya2VyPC9idXR0b24+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDYXJkIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIhOiBudW1iZXI7XG5cbiAgICB3b3JrZXIhOiBXb3JrZXI7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnY2xpY2snLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSE7IH1cbiAgICB9KVxuICAgIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnbWVzc2FnZScsXG4gICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy53b3JrZXI7IH1cbiAgICB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKGV2ZW50OiBNZXNzYWdlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY291bnRlciA9IGV2ZW50LmRhdGEpO1xuICAgIH1cbn1cblxuQGNvbXBvbmVudDxBY3Rpb25DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY3Rpb24tY2FyZCcsXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2FyZCBleHRlbmRzIENhcmQge1xuXG4gICAgLy8gd2UgY2FuIGluaGVyaXQgc3R5bGVzIGV4cGxpY2l0bHlcbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICAgICAgICAnc2xvdFtuYW1lPXVpLWFjdGlvbi1jYXJkLWFjdGlvbnNdIHsgZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IHJpZ2h0OyB9J1xuICAgICAgICBdXG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6IG51bGwgfSlcbiAgICBoYW5kbGVDbGljayAoKSB7IH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlTWVzc2FnZSAoKSB7IH1cbn1cblxuQGNvbXBvbmVudDxQbGFpbkNhcmQ+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXBsYWluLWNhcmQnLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgOmhvc3Qge1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBtYXgtd2lkdGg6IDQwY2g7XG4gICAgICAgIH1gXG4gICAgXVxuICAgIC8vIGlmIHdlIGRvbid0IHNwZWNpZnkgYSB0ZW1wbGF0ZSwgaXQgd2lsbCBiZSBpbmhlcml0ZWRcbn0pXG5leHBvcnQgY2xhc3MgUGxhaW5DYXJkIGV4dGVuZHMgQ2FyZCB7IH1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIGNvbXBvbmVudCwgQ29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgfVxuICAgICAgICAuY2hlY2stbWFyayB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDAuMjVyZW07XG4gICAgICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDAuNjI1cmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMCAwIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBFdmVudEJpbmRpbmcge1xuICAgIHJlYWRvbmx5IHRhcmdldDogRXZlbnRUYXJnZXQ7XG4gICAgcmVhZG9ubHkgdHlwZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbDtcbiAgICByZWFkb25seSBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFdmVudEJpbmRpbmcgKGJpbmRpbmc6IGFueSk6IGJpbmRpbmcgaXMgRXZlbnRCaW5kaW5nIHtcblxuICAgIHJldHVybiB0eXBlb2YgYmluZGluZyA9PT0gJ29iamVjdCdcbiAgICAgICAgJiYgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykudGFyZ2V0ID09PSAnb2JqZWN0J1xuICAgICAgICAmJiB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS50eXBlID09PSAnc3RyaW5nJ1xuICAgICAgICAmJiAodHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykubGlzdGVuZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIHx8IHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLmxpc3RlbmVyID09PSAnb2JqZWN0Jyk7XG59XG5cbi8qKlxuICogRGlzcGF0Y2hlcyBhIEN1c3RvbUV2ZW50IG9uIHRoZSB0YXJnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGRldGFpbD86IFQsIGV2ZW50SW5pdD86IFBhcnRpYWw8RXZlbnRJbml0Pik6IGJvb2xlYW4ge1xuXG4gICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAuLi5ldmVudEluaXQsXG4gICAgICAgIGRldGFpbFxuICAgIH0pKTtcbn1cblxuLyoqXG4gKiBBIGNsYXNzIGZvciBtYW5hZ2luZyBldmVudCBsaXN0ZW5lcnNcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBFdmVudE1hbmFnZXIgY2xhc3MgY2FuIGJlIHVzZWQgdG8gaGFuZGxlIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyBvbiBtdWx0aXBsZSB0YXJnZXRzLiBJdCBjYWNoZXMgYWxsIGV2ZW50IGxpc3RlbmVyc1xuICogYW5kIGNhbiByZW1vdmUgdGhlbSBzZXBhcmF0ZWx5IG9yIGFsbCB0b2dldGhlci4gVGhpcyBjYW4gYmUgdXNlZnVsIHdoZW4gZXZlbnQgbGlzdGVuZXJzIG5lZWQgdG8gYmUgYWRkZWQgYW5kIHJlbW92ZWQgZHVyaW5nXG4gKiB0aGUgbGlmZXRpbWUgb2YgYSBjb21wb25lbnQgYW5kIG1ha2VzIG1hbnVhbGx5IHNhdmluZyByZWZlcmVuY2VzIHRvIHRhcmdldHMsIGxpc3RlbmVycyBhbmQgb3B0aW9ucyB1bm5lY2Vzc2FyeS5cbiAqXG4gKiBgYGB0c1xuICogIC8vIGNyZWF0ZSBhbiBFdmVudE1hbmFnZXIgaW5zdGFuY2VcbiAqICBjb25zdCBtYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuICpcbiAqICAvLyB5b3UgY2FuIHNhdmUgYSByZWZlcmVuY2UgKGFuIEV2ZW50QmluZGluZykgdG8gdGhlIGFkZGVkIGV2ZW50IGxpc3RlbmVyIGlmIHlvdSBuZWVkIHRvIG1hbnVhbGx5IHJlbW92ZSBpdCBsYXRlclxuICogIGNvbnN0IGJpbmRpbmcgPSBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudCwgJ3Njcm9sbCcsIChldmVudCkgPT4gey4uLn0pO1xuICpcbiAqICAvLyAuLi5vciBpZ25vcmUgdGhlIHJlZmVyZW5jZSBpZiB5b3UgZG9uJ3QgbmVlZCBpdFxuICogIG1hbmFnZXIubGlzdGVuKGRvY3VtZW50LmJvZHksICdjbGljaycsIChldmVudCkgPT4gey4uLn0pO1xuICpcbiAqICAvLyB5b3UgY2FuIHJlbW92ZSBhIHNwZWNpZmljIGV2ZW50IGxpc3RlbmVyIHVzaW5nIGEgcmVmZXJlbmNlXG4gKiAgbWFuYWdlci51bmxpc3RlbihiaW5kaW5nKTtcbiAqXG4gKiAgLy8gLi4ub3IgcmVtb3ZlIGFsbCBwcmV2aW91c2x5IGFkZGVkIGV2ZW50IGxpc3RlbmVycyBpbiBvbmUgZ29cbiAqICBtYW5hZ2VyLnVubGlzdGVuQWxsKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciB7XG5cbiAgICBwcm90ZWN0ZWQgYmluZGluZ3MgPSBuZXcgU2V0PEV2ZW50QmluZGluZz4oKTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBoYXNCaW5kaW5nIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGFuIEV2ZW50QmluZGluZyBleGlzdHMgdGhhdCBtYXRjaGVzIHRoZSB0YXJnZXQsIHR5cGUsIGxpc3RlbmVyIGFuZCBvcHRpb25zXG4gICAgICovXG4gICAgaGFzQmluZGluZyAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBib29sZWFuO1xuXG4gICAgaGFzQmluZGluZyAoXG4gICAgICAgIHRhcmdldE9yQmluZGluZzogRXZlbnRCaW5kaW5nIHwgRXZlbnRUYXJnZXQsXG4gICAgICAgIHR5cGU/OiBzdHJpbmcsXG4gICAgICAgIGxpc3RlbmVyPzogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnNcbiAgICApOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gKGlzRXZlbnRCaW5kaW5nKHRhcmdldE9yQmluZGluZylcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nLCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKSkgIT09IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbiBleGlzdGluZyBFdmVudEJpbmRpbmcgdGhhdCBtYXRjaGVzIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbiBleGlzdGluZyBFdmVudEJpbmRpbmcgdGhhdCBtYXRjaGVzIHRoZSB0YXJnZXQsIHR5cGUsIGxpc3RlbmVyIGFuZCBvcHRpb25zXG4gICAgICovXG4gICAgZmluZEJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgZmluZEJpbmRpbmcgKFxuICAgICAgICBiaW5kaW5nT3JUYXJnZXQ6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBsZXQgc2VhcmNoQmluZGluZzogRXZlbnRCaW5kaW5nID0gaXNFdmVudEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0KSA/IGJpbmRpbmdPclRhcmdldCA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGxldCBmb3VuZEJpbmRpbmc6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5iaW5kaW5ncy5oYXMoc2VhcmNoQmluZGluZykpIHJldHVybiBzZWFyY2hCaW5kaW5nO1xuXG4gICAgICAgIGZvciAobGV0IGJpbmRpbmcgb2YgdGhpcy5iaW5kaW5ncy52YWx1ZXMoKSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb21wYXJlQmluZGluZ3Moc2VhcmNoQmluZGluZywgYmluZGluZykpIHtcblxuICAgICAgICAgICAgICAgIGZvdW5kQmluZGluZyA9IGJpbmRpbmc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm91bmRCaW5kaW5nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSB0YXJnZXRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgRXZlbnRCaW5kaW5nfSB3aGljaCB3YXMgYWRkZWQgb3IgdW5kZWZpbmVkIGEgbWF0Y2hpbmcgZXZlbnQgYmluZGluZyBhbHJlYWR5IGV4aXN0c1xuICAgICAqL1xuICAgIGxpc3RlbiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICBsaXN0ZW4gKFxuICAgICAgICBiaW5kaW5nT3JUYXJnZXQ6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBjb25zdCBiaW5kaW5nID0gaXNFdmVudEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0KVxuICAgICAgICAgICAgPyBiaW5kaW5nT3JUYXJnZXRcbiAgICAgICAgICAgIDogdGhpcy5jcmVhdGVCaW5kaW5nKGJpbmRpbmdPclRhcmdldCwgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0JpbmRpbmcoYmluZGluZykpIHtcblxuICAgICAgICAgICAgYmluZGluZy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihiaW5kaW5nLnR5cGUsIGJpbmRpbmcubGlzdGVuZXIsIGJpbmRpbmcub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMuYmluZGluZ3MuYWRkKGJpbmRpbmcpO1xuXG4gICAgICAgICAgICByZXR1cm4gYmluZGluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldCBvZiB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgRXZlbnRCaW5kaW5nfSB3aGljaCB3YXMgcmVtb3ZlZCBvciB1bmRlZmluZWQgaWYgbm8gbWF0Y2hpbmcgZXZlbnQgYmluZGluZyBleGlzdHNcbiAgICAgKi9cbiAgICB1bmxpc3RlbiAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgZXZlbnQgbGlzdGVuZXIgZnJvbSB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgdW5saXN0ZW4gKFxuICAgICAgICBiaW5kaW5nT3JUYXJnZXQ6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuXG4gICAgKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBjb25zdCBiaW5kaW5nID0gaXNFdmVudEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0KVxuICAgICAgICAgICAgPyB0aGlzLmZpbmRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgIDogdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmIChiaW5kaW5nKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmRlbGV0ZShiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGVpciB0YXJnZXRzXG4gICAgICovXG4gICAgdW5saXN0ZW5BbGwgKCkge1xuXG4gICAgICAgIHRoaXMuYmluZGluZ3MuZm9yRWFjaChiaW5kaW5nID0+IHRoaXMudW5saXN0ZW4oYmluZGluZykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYW4gRXZlbnQgb24gdGhlIHRhcmdldFxuICAgICAqL1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudDogRXZlbnQpOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2hlcyBhIEN1c3RvbUV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ/OiBQYXJ0aWFsPEV2ZW50SW5pdD4pOiBib29sZWFuO1xuXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIGV2ZW50T3JUeXBlPzogRXZlbnQgfCBzdHJpbmcsIGRldGFpbD86IFQsIGV2ZW50SW5pdDogUGFydGlhbDxFdmVudEluaXQ+ID0ge30pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoZXZlbnRPclR5cGUgaW5zdGFuY2VvZiBFdmVudCkge1xuXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXZlbnRPclR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE9yVHlwZSEsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICAuLi5ldmVudEluaXQsXG4gICAgICAgICAgICBkZXRhaWxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4ge0BsaW5rIEV2ZW50QmluZGluZ30gb2JqZWN0XG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlQmluZGluZyAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBFdmVudEJpbmRpbmcge1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBsaXN0ZW5lcixcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdHNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgYmluZGluZyBvYmplY3RzIGhhdmUgdGhlIHNhbWUgdGFyZ2V0LCB0eXBlIGxpc3RlbmVyIGFuZCBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUJpbmRpbmdzIChiaW5kaW5nOiBFdmVudEJpbmRpbmcsIG90aGVyOiBFdmVudEJpbmRpbmcpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoYmluZGluZyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHJldHVybiBiaW5kaW5nLnRhcmdldCA9PT0gb3RoZXIudGFyZ2V0XG4gICAgICAgICAgICAmJiBiaW5kaW5nLnR5cGUgPT09IG90aGVyLnR5cGVcbiAgICAgICAgICAgICYmIHRoaXMuY29tcGFyZUxpc3RlbmVycyhiaW5kaW5nLmxpc3RlbmVyLCBvdGhlci5saXN0ZW5lcilcbiAgICAgICAgICAgICYmIHRoaXMuY29tcGFyZU9wdGlvbnMoYmluZGluZy5vcHRpb25zLCBvdGhlci5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0d28gZXZlbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGxpc3RlbmVycyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb21wYXJlTGlzdGVuZXJzIChsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG90aGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIC8vIGNhdGNoZXMgYm90aCBsaXN0ZW5lcnMgYmVpbmcgbnVsbCwgYSBmdW5jdGlvbiBvciB0aGUgc2FtZSBFdmVudExpc3RlbmVyT2JqZWN0XG4gICAgICAgIGlmIChsaXN0ZW5lciA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHRoZSBoYW5kbGVycyBvZiB0d28gRXZlbnRMaXN0ZW5lck9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG90aGVyID09PSAnb2JqZWN0Jykge1xuXG4gICAgICAgICAgICByZXR1cm4gKGxpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50ID09PSAob3RoZXIgYXMgRXZlbnRMaXN0ZW5lck9iamVjdCkuaGFuZGxlRXZlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyIG9wdGlvbnNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgb3B0aW9ucyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb21wYXJlT3B0aW9ucyAob3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucywgb3RoZXI/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggb3B0aW9ucyBiZWluZyB1bmRlZmluZWQgb3Igc2FtZSBib29sZWFuIHZhbHVlXG4gICAgICAgIGlmIChvcHRpb25zID09PSBvdGhlcikgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgLy8gY29tcGFyZXMgdHdvIG9wdGlvbnMgb2JqZWN0c1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY2FwdHVyZSA9PT0gb3RoZXIuY2FwdHVyZVxuICAgICAgICAgICAgICAgICYmIG9wdGlvbnMucGFzc2l2ZSA9PT0gb3RoZXIucGFzc2l2ZVxuICAgICAgICAgICAgICAgICYmIG9wdGlvbnMub25jZSA9PT0gb3RoZXIub25jZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFdmVudEJpbmRpbmcsIEV2ZW50TWFuYWdlciB9IGZyb20gXCIuL2V2ZW50LW1hbmFnZXJcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJlaGF2aW9yIHtcblxuICAgIHByb3RlY3RlZCBfYXR0YWNoZWQgPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBfZWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuXG4gICAgZ2V0IGhhc0F0dGFjaGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fYXR0YWNoZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGVsZW1lbnQgdGhhdCB0aGUgYmVoYXZpb3IgaXMgYXR0YWNoZWQgdG9cbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFdlIG9ubHkgZXhwb3NlIGEgZ2V0dGVyIGZvciB0aGUgZWxlbWVudCwgc28gaXQgY2FuJ3QgYmUgc2V0IGRpcmVjdGx5LCBidXQgaGFzIHRvIGJlIHNldCB2aWFcbiAgICAgKiB0aGUgYmVoYXZpb3IncyBhdHRhY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIGdldCBlbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfVxuXG4gICAgYXR0YWNoIChlbGVtZW50PzogSFRNTEVsZW1lbnQsIC4uLmFyZ3M6IGFueVtdKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcblxuICAgICAgICB0aGlzLl9hdHRhY2hlZCA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZGV0YWNoICguLi5hcmdzOiBhbnlbXSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLnVubGlzdGVuQWxsKCk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLl9hdHRhY2hlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGxpc3RlbiAodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50TWFuYWdlci5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdW5saXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudE1hbmFnZXIudW5saXN0ZW4odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2ggKGV2ZW50OiBFdmVudCk6IGJvb2xlYW47XG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaDxUID0gYW55PiAoZXZlbnRPclR5cGU/OiBFdmVudCB8IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQgJiYgdGhpcy5lbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHJldHVybiAoZXZlbnRPclR5cGUgaW5zdGFuY2VvZiBFdmVudClcbiAgICAgICAgICAgICAgICA/IHRoaXMuZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKHRoaXMuZWxlbWVudCwgZXZlbnRPclR5cGUpXG4gICAgICAgICAgICAgICAgOiB0aGlzLmV2ZW50TWFuYWdlci5kaXNwYXRjaCh0aGlzLmVsZW1lbnQsIGV2ZW50T3JUeXBlISwgZGV0YWlsLCBldmVudEluaXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJlaGF2aW9yIH0gZnJvbSBcIi4uL2JlaGF2aW9yXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9jdXNDaGFuZ2VFdmVudERldGFpbCB7XG4gICAgdHlwZTogJ2ZvY3VzaW4nIHwgJ2ZvY3Vzb3V0JztcbiAgICBldmVudDogRm9jdXNFdmVudDtcbn1cblxuZXhwb3J0IHR5cGUgRm9jdXNDaGFuZ2VFdmVudCA9IEN1c3RvbUV2ZW50PEZvY3VzQ2hhbmdlRXZlbnREZXRhaWw+O1xuXG5leHBvcnQgY2xhc3MgRm9jdXNNb25pdG9yIGV4dGVuZHMgQmVoYXZpb3Ige1xuXG4gICAgaGFzRm9jdXMgPSBmYWxzZTtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdmb2N1c2luJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVGb2N1c0luKGV2ZW50IGFzIEZvY3VzRXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2ZvY3Vzb3V0JywgZXZlbnQgPT4gdGhpcy5oYW5kbGVGb2N1c091dChldmVudCBhcyBGb2N1c0V2ZW50KSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUZvY3VzSW4gKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzRm9jdXMgPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoPEZvY3VzQ2hhbmdlRXZlbnREZXRhaWw+KCdmb2N1cy1jaGFuZ2VkJywgeyB0eXBlOiAnZm9jdXNpbicsIGV2ZW50OiBldmVudCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c091dCAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICAvLyBpZiB0aGUgcmVsYXRlZFRhcmdldCAodGhlIGVsZW1lbnQgd2hpY2ggd2lsbCByZWNlaXZlIHRoZSBmb2N1cyBuZXh0KSBpcyB3aXRoaW4gdGhlIG1vbml0b3JlZCBlbGVtZW50LFxuICAgICAgICAvLyB3ZSBjYW4gaWdub3JlIHRoaXMgZXZlbnQ7IGl0IHdpbGwgZXZlbnR1YWxseSBiZSBoYW5kbGVkIGFzIGZvY3VzaW4gZXZlbnQgb2YgdGhlIHJlbGF0ZWRUYXJnZXRcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCEgPT09IGV2ZW50LnJlbGF0ZWRUYXJnZXQgfHwgdGhpcy5lbGVtZW50IS5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0IGFzIE5vZGUpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5oYXNGb2N1cyA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoPEZvY3VzQ2hhbmdlRXZlbnREZXRhaWw+KCdmb2N1cy1jaGFuZ2VkJywgeyB0eXBlOiAnZm9jdXNvdXQnLCBldmVudDogZXZlbnQgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDU1NTZWxlY3RvciB9IGZyb20gJy4uL2RvbSc7XG5pbXBvcnQgeyBUYWIgfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IEZvY3VzTW9uaXRvciB9IGZyb20gJy4vZm9jdXMtbW9uaXRvcic7XG5cbmV4cG9ydCBjb25zdCBUQUJCQUJMRVMgPSBbXG4gICAgJ2FbaHJlZl06bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdhcmVhW2hyZWZdOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnaW5wdXQ6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdzZWxlY3Q6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICd0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ2lmcmFtZTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ1tjb250ZW50RWRpdGFibGVdOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnW3RhYmluZGV4XTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbl07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9jdXNUcmFwQ29uZmlnIHtcbiAgICB0YWJiYWJsZVNlbGVjdG9yOiBDU1NTZWxlY3RvcjtcbiAgICB3cmFwRm9jdXM6IGJvb2xlYW47XG4gICAgYXV0b0ZvY3VzOiBib29sZWFuO1xuICAgIHJlc3RvcmVGb2N1czogYm9vbGVhbjtcbiAgICBpbml0aWFsRm9jdXM/OiBDU1NTZWxlY3Rvcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUc6IEZvY3VzVHJhcENvbmZpZyA9IHtcbiAgICB0YWJiYWJsZVNlbGVjdG9yOiBUQUJCQUJMRVMuam9pbignLCcpLFxuICAgIHdyYXBGb2N1czogdHJ1ZSxcbiAgICBhdXRvRm9jdXM6IHRydWUsXG4gICAgcmVzdG9yZUZvY3VzOiB0cnVlLFxufTtcblxuZXhwb3J0IGNsYXNzIEZvY3VzVHJhcCBleHRlbmRzIEZvY3VzTW9uaXRvciB7XG5cbiAgICBwcm90ZWN0ZWQgdGFiYmFibGVzITogTm9kZUxpc3RPZjxIVE1MRWxlbWVudD47XG5cbiAgICBwcm90ZWN0ZWQgc3RhcnQhOiBIVE1MRWxlbWVudDtcblxuICAgIHByb3RlY3RlZCBlbmQhOiBIVE1MRWxlbWVudDtcblxuICAgIHByb3RlY3RlZCBjb25maWc6IEZvY3VzVHJhcENvbmZpZztcblxuICAgIGNvbnN0cnVjdG9yIChjb25maWc/OiBQYXJ0aWFsPEZvY3VzVHJhcENvbmZpZz4pIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLCAuLi5jb25maWcgfTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCFzdXBlci5hdHRhY2goZWxlbWVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c0luaXRpYWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdrZXlkb3duJywgKChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KSkgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICByZXR1cm4gc3VwZXIuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgZm9jdXNJbml0aWFsICgpIHtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuaW5pdGlhbEZvY3VzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxGb2N1cyA9IHRoaXMuZWxlbWVudCEucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4odGhpcy5jb25maWcuaW5pdGlhbEZvY3VzKTtcblxuICAgICAgICAgICAgaWYgKGluaXRpYWxGb2N1cykge1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbEZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb2N1c1RyYXAgY291bGQgbm90IGZpbmQgaW5pdGlhbEZvY3VzIGVsZW1lbnQgc2VsZWN0b3IgJHsgdGhpcy5jb25maWcuaW5pdGlhbEZvY3VzIH0uIFBvc3NpYmxlIGVycm9yIGluIEZvY3VzVHJhcENvbmZpZy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9jdXNGaXJzdCgpO1xuICAgIH1cblxuICAgIGZvY3VzRmlyc3QgKCkge1xuXG4gICAgICAgIHRoaXMuc3RhcnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBmb2N1c0xhc3QgKCkge1xuXG4gICAgICAgIHRoaXMuZW5kLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLnRhYmJhYmxlcyA9IHRoaXMuZWxlbWVudCEucXVlcnlTZWxlY3RvckFsbCh0aGlzLmNvbmZpZy50YWJiYWJsZVNlbGVjdG9yKTtcblxuICAgICAgICBjb25zdCBsZW5ndGggPSB0aGlzLnRhYmJhYmxlcy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IGxlbmd0aFxuICAgICAgICAgICAgPyB0aGlzLnRhYmJhYmxlcy5pdGVtKDApXG4gICAgICAgICAgICA6IHRoaXMuZWxlbWVudCE7XG5cbiAgICAgICAgdGhpcy5lbmQgPSBsZW5ndGhcbiAgICAgICAgICAgID8gdGhpcy50YWJiYWJsZXMuaXRlbShsZW5ndGggLSAxKVxuICAgICAgICAgICAgOiB0aGlzLmVsZW1lbnQhO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgVGFiOlxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5zdGFydCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLndyYXBGb2N1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1c0xhc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghZXZlbnQuc2hpZnRLZXkgJiYgZXZlbnQudGFyZ2V0ID09PSB0aGlzLmVuZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLndyYXBGb2N1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1c0ZpcnN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBGb2N1c1RyYXBDb25maWcsIERFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUcgfSBmcm9tICcuLi9mb2N1cy10cmFwJztcblxuZXhwb3J0IHR5cGUgT3ZlcmxheUNvbnRyb2xsZXJDb25maWcgPSBGb2N1c1RyYXBDb25maWcgJiB7XG4gICAgYXV0b0ZvY3VzOiBib29sZWFuO1xuICAgIHRyYXBGb2N1czogYm9vbGVhbjtcbiAgICByZXN0b3JlRm9jdXM6IGJvb2xlYW47XG4gICAgY2xvc2VPbkVzY2FwZTogYm9vbGVhbjtcbiAgICBjbG9zZU9uRm9jdXNMb3NzOiBib29sZWFuO1xufTtcblxuLy8gVE9ETzogbW92ZSB0byBkZWZhdWx0LW92ZXJsYXktY29udHJvbGxlclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRzogT3ZlcmxheUNvbnRyb2xsZXJDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRyxcbiAgICBhdXRvRm9jdXM6IHRydWUsXG4gICAgdHJhcEZvY3VzOiB0cnVlLFxuICAgIHJlc3RvcmVGb2N1czogdHJ1ZSxcbiAgICBjbG9zZU9uRXNjYXBlOiB0cnVlLFxuICAgIGNsb3NlT25Gb2N1c0xvc3M6IHRydWUsXG59O1xuIiwiaW1wb3J0IHsgT2Zmc2V0LCBoYXNPZmZzZXRDaGFuZ2VkIH0gZnJvbSAnLi9vZmZzZXQnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcblxuZXhwb3J0IHR5cGUgQWxpZ25tZW50T3B0aW9uID0gJ3N0YXJ0JyB8ICdjZW50ZXInIHwgJ2VuZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWxpZ25tZW50IHtcbiAgICBob3Jpem9udGFsOiBBbGlnbm1lbnRPcHRpb247XG4gICAgdmVydGljYWw6IEFsaWdubWVudE9wdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbGlnbm1lbnRQYWlyIHtcbiAgICBvcmlnaW46IEFsaWdubWVudDtcbiAgICB0YXJnZXQ6IEFsaWdubWVudDtcbiAgICBvZmZzZXQ/OiBPZmZzZXQ7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0FMSUdOTUVOVF9QQUlSOiBBbGlnbm1lbnRQYWlyID0ge1xuICAgIG9yaWdpbjoge1xuICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICB2ZXJ0aWNhbDogJ2VuZCdcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICB2ZXJ0aWNhbDogJ3N0YXJ0J1xuICAgIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FsaWdubWVudCAoYWxpZ25tZW50OiBhbnkpOiBhbGlnbm1lbnQgaXMgQWxpZ25tZW50IHtcblxuICAgIHJldHVybiB0eXBlb2YgKGFsaWdubWVudCBhcyBBbGlnbm1lbnQpLmhvcml6b250YWwgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAoYWxpZ25tZW50IGFzIEFsaWdubWVudCkudmVydGljYWwgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWxpZ25tZW50Q2hhbmdlZCAoYWxpZ25tZW50OiBBbGlnbm1lbnQsIG90aGVyOiBBbGlnbm1lbnQpOiBib29sZWFuIHtcblxuICAgIGlmIChhbGlnbm1lbnQgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gYWxpZ25tZW50Lmhvcml6b250YWwgIT09IG90aGVyLmhvcml6b250YWxcbiAgICAgICAgICAgIHx8IGFsaWdubWVudC52ZXJ0aWNhbCAhPT0gb3RoZXIudmVydGljYWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsaWdubWVudCAhPT0gb3RoZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZCAoYWxpZ25tZW50UGFpcj86IEFsaWdubWVudFBhaXIsIG90aGVyPzogQWxpZ25tZW50UGFpcik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKGFsaWdubWVudFBhaXIgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gaGFzQWxpZ25tZW50Q2hhbmdlZChhbGlnbm1lbnRQYWlyLnRhcmdldCwgb3RoZXIudGFyZ2V0KVxuICAgICAgICAgICAgfHwgaGFzQWxpZ25tZW50Q2hhbmdlZChhbGlnbm1lbnRQYWlyLm9yaWdpbiwgb3RoZXIub3JpZ2luKVxuICAgICAgICAgICAgfHwgaGFzT2Zmc2V0Q2hhbmdlZChhbGlnbm1lbnRQYWlyLm9mZnNldCwgb3RoZXIub2Zmc2V0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpZ25tZW50UGFpciAhPT0gb3RoZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQm91bmRpbmdCb3gge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsaWduZWRQb3NpdGlvbiAoZWxlbWVudEJveDogQm91bmRpbmdCb3gsIGVsZW1lbnRBbGlnbm1lbnQ6IEFsaWdubWVudCk6IFBvc2l0aW9uIHtcblxuICAgIGNvbnN0IHBvc2l0aW9uOiBQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgc3dpdGNoIChlbGVtZW50QWxpZ25tZW50Lmhvcml6b250YWwpIHtcblxuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94LnggKyBlbGVtZW50Qm94LndpZHRoIC8gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gZWxlbWVudEJveC54ICsgZWxlbWVudEJveC53aWR0aDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZWxlbWVudEFsaWdubWVudC52ZXJ0aWNhbCkge1xuXG4gICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBlbGVtZW50Qm94Lnk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgcG9zaXRpb24ueSA9IGVsZW1lbnRCb3gueSArIGVsZW1lbnRCb3guaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0gZWxlbWVudEJveC55ICsgZWxlbWVudEJveC5oZWlnaHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXRQb3NpdGlvbiAob3JpZ2luQm94OiBCb3VuZGluZ0JveCwgb3JpZ2luQWxpZ25tZW50OiBBbGlnbm1lbnQsIHRhcmdldEJveDogQm91bmRpbmdCb3gsIHRhcmdldEFsaWdubWVudDogQWxpZ25tZW50KTogUG9zaXRpb24ge1xuXG4gICAgY29uc3Qgb3JpZ2luUG9zaXRpb24gPSBnZXRBbGlnbmVkUG9zaXRpb24ob3JpZ2luQm94LCBvcmlnaW5BbGlnbm1lbnQpO1xuICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0QWxpZ25lZFBvc2l0aW9uKHsgLi4udGFyZ2V0Qm94LCB4OiAwLCB5OiAwIH0sIHRhcmdldEFsaWdubWVudCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBvcmlnaW5Qb3NpdGlvbi54IC0gdGFyZ2V0UG9zaXRpb24ueCxcbiAgICAgICAgeTogb3JpZ2luUG9zaXRpb24ueSAtIHRhcmdldFBvc2l0aW9uLnksXG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBTaXplIHtcbiAgICB3aWR0aDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIGhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xuICAgIG1heFdpZHRoOiBudW1iZXIgfCBzdHJpbmc7XG4gICAgbWF4SGVpZ2h0OiBudW1iZXIgfCBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTaXplQ2hhbmdlZCAoc2l6ZT86IFBhcnRpYWw8U2l6ZT4sIG90aGVyPzogUGFydGlhbDxTaXplPik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHNpemUgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gc2l6ZS53aWR0aCAhPT0gb3RoZXIud2lkdGhcbiAgICAgICAgICAgIHx8IHNpemUuaGVpZ2h0ICE9PSBvdGhlci5oZWlnaHRcbiAgICAgICAgICAgIHx8IHNpemUubWF4V2lkdGggIT09IG90aGVyLm1heFdpZHRoXG4gICAgICAgICAgICB8fCBzaXplLm1heEhlaWdodCAhPT0gb3RoZXIubWF4SGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiBzaXplICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IENTU1NlbGVjdG9yIH0gZnJvbSAnLi4vLi4vZG9tJztcbmltcG9ydCB7IEFsaWdubWVudFBhaXIsIGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkIH0gZnJvbSAnLi9hbGlnbm1lbnQnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uJztcbmltcG9ydCB7IGhhc1NpemVDaGFuZ2VkLCBTaXplIH0gZnJvbSAnLi9zaXplJztcblxuZXhwb3J0IGNvbnN0IFZJRVdQT1JUID0gJ3ZpZXdwb3J0JztcblxuZXhwb3J0IGNvbnN0IE9SSUdJTiA9ICdvcmlnaW4nO1xuXG4vKipcbiAqIEEgUG9zaXRpb25Db25maWcgY29udGFpbnMgdGhlIHNpemUgYW5kIGFsaWdubWVudCBvZiBhbiBFbGVtZW50IGFuZCBtYXkgaW5jbHVkZSBhbiBvcmlnaW4sIHdoaWNoIHJlZmVyZW5jZXMgYW4gb3JpZ2luIEVsZW1lbnRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbmZpZyBleHRlbmRzIFNpemUge1xuICAgIC8vIFRPRE86IGhhbmRsZSAnb3JpZ2luJyBjYXNlIGluIFBvc2l0aW9uU3RyYXRlZ3lcbiAgICB3aWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgaGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBtYXhXaWR0aDogbnVtYmVyIHwgc3RyaW5nIHwgJ29yaWdpbic7XG4gICAgbWF4SGVpZ2h0OiBudW1iZXIgfCBzdHJpbmcgfCAnb3JpZ2luJztcbiAgICBvcmlnaW46IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBDU1NTZWxlY3RvciB8ICd2aWV3cG9ydCc7XG4gICAgYWxpZ25tZW50OiBBbGlnbm1lbnRQYWlyO1xufVxuXG5leHBvcnQgY29uc3QgUE9TSVRJT05fQ09ORklHX0ZJRUxEUzogKGtleW9mIFBvc2l0aW9uQ29uZmlnKVtdID0gW1xuICAgICd3aWR0aCcsXG4gICAgJ2hlaWdodCcsXG4gICAgJ21heFdpZHRoJyxcbiAgICAnbWF4SGVpZ2h0JyxcbiAgICAnb3JpZ2luJyxcbiAgICAnYWxpZ25tZW50J1xuXTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT05fQ09ORklHOiBQb3NpdGlvbkNvbmZpZyA9IHtcbiAgICB3aWR0aDogJ2F1dG8nLFxuICAgIG1heFdpZHRoOiAnMTAwdncnLFxuICAgIGhlaWdodDogJ2F1dG8nLFxuICAgIG1heEhlaWdodDogJzEwMHZoJyxcbiAgICBvcmlnaW46ICd2aWV3cG9ydCcsXG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZCAocG9zaXRpb25Db25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPiwgb3RoZXI/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHBvc2l0aW9uQ29uZmlnICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnLm9yaWdpbiAhPT0gb3RoZXIub3JpZ2luXG4gICAgICAgICAgICB8fCBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZChwb3NpdGlvbkNvbmZpZy5hbGlnbm1lbnQsIG90aGVyLmFsaWdubWVudClcbiAgICAgICAgICAgIHx8IGhhc1NpemVDaGFuZ2VkKHBvc2l0aW9uQ29uZmlnLCBvdGhlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLCBPdmVybGF5Q29udHJvbGxlckNvbmZpZyB9IGZyb20gJy4vY29udHJvbGxlci9vdmVybGF5LWNvbnRyb2xsZXItY29uZmlnJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4vcG9zaXRpb24vcG9zaXRpb24tY29uZmlnJztcblxuZXhwb3J0IHR5cGUgT3ZlcmxheUNvbmZpZyA9IFBvc2l0aW9uQ29uZmlnICYgT3ZlcmxheUNvbnRyb2xsZXJDb25maWcgJiB7XG4gICAgLy8gVE9ETzogbWF5YmUgaW50cm9kdWNlIGEgY29uc3QgZm9yIHRoZSAndmlld3BvcnQnIHZhbHVlP1xuICAgIHBvc2l0aW9uVHlwZTogc3RyaW5nO1xuICAgIGNvbnRyb2xsZXI/OiBzdHJpbmc7XG4gICAgY29udHJvbGxlclR5cGU6IHN0cmluZztcbiAgICBzdGFja2VkOiBib29sZWFuO1xuICAgIHRlbXBsYXRlPzogVGVtcGxhdGVGdW5jdGlvbjtcbiAgICBjb250ZXh0PzogQ29tcG9uZW50O1xuICAgIGJhY2tkcm9wOiBib29sZWFuO1xuICAgIGNsb3NlT25CYWNrZHJvcENsaWNrOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgT1ZFUkxBWV9DT05GSUdfRklFTERTOiAoa2V5b2YgT3ZlcmxheUNvbmZpZylbXSA9IFtcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdtYXhXaWR0aCcsXG4gICAgJ21heEhlaWdodCcsXG4gICAgJ29yaWdpbicsXG4gICAgJ2FsaWdubWVudCcsXG4gICAgJ3Bvc2l0aW9uVHlwZScsXG4gICAgJ2NvbnRyb2xsZXInLFxuICAgICdjb250cm9sbGVyVHlwZScsXG4gICAgJ3N0YWNrZWQnLFxuICAgICd0ZW1wbGF0ZScsXG4gICAgJ2NvbnRleHQnLFxuICAgICdiYWNrZHJvcCcsXG4gICAgJ2Nsb3NlT25Fc2NhcGUnLFxuICAgICdjbG9zZU9uRm9jdXNMb3NzJyxcbiAgICAnY2xvc2VPbkJhY2tkcm9wQ2xpY2snLFxuICAgICd0cmFwRm9jdXMnLFxuICAgICdhdXRvRm9jdXMnLFxuICAgICdpbml0aWFsRm9jdXMnLFxuICAgICdyZXN0b3JlRm9jdXMnLFxuICAgICd3cmFwRm9jdXMnLFxuICAgICd0YWJiYWJsZVNlbGVjdG9yJ1xuXTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfT1ZFUkxBWV9DT05GSUc6IE92ZXJsYXlDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG4gICAgLi4uREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLFxuICAgIHBvc2l0aW9uVHlwZTogJ2RlZmF1bHQnLFxuICAgIGNvbnRyb2xsZXI6IHVuZGVmaW5lZCxcbiAgICBjb250cm9sbGVyVHlwZTogJ2RlZmF1bHQnLFxuICAgIHN0YWNrZWQ6IHRydWUsXG4gICAgdGVtcGxhdGU6IHVuZGVmaW5lZCxcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgYmFja2Ryb3A6IHRydWUsXG4gICAgY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IHRydWUsXG59O1xuIiwiLyoqXG4gKiBBIENTUyBzZWxlY3RvciBzdHJpbmdcbiAqXG4gKiBAc2VlXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX1NlbGVjdG9yc1xuICovXG5leHBvcnQgdHlwZSBDU1NTZWxlY3RvciA9IHN0cmluZztcblxuLyoqXG4gKiBJbnNlcnQgYSBOb2RlIGFmdGVyIGEgcmVmZXJlbmNlIE5vZGVcbiAqXG4gKiBAcGFyYW0gbmV3Q2hpbGQgLSBUaGUgTm9kZSB0byBpbnNlcnRcbiAqIEBwYXJhbSByZWZDaGlsZCAtIFRoZSByZWZlcmVuY2UgTm9kZSBhZnRlciB3aGljaCB0byBpbnNlcnRcbiAqL1xuZXhwb3J0IGNvbnN0IGluc2VydEFmdGVyID0gPFQgZXh0ZW5kcyBOb2RlPiAobmV3Q2hpbGQ6IFQsIHJlZkNoaWxkOiBOb2RlKTogVCA9PiB7XG5cbiAgICByZXR1cm4gcmVmQ2hpbGQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKG5ld0NoaWxkLCByZWZDaGlsZC5uZXh0U2libGluZyk7XG59O1xuIiwiaW1wb3J0IHsgUHJvcGVydHlDaGFuZ2VFdmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBCZWhhdmlvciB9IGZyb20gJy4uLy4uL2JlaGF2aW9yJztcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi4vLi4vZXZlbnQtbWFuYWdlcic7XG5pbXBvcnQgeyBFc2NhcGUgfSBmcm9tICcuLi8uLi9rZXlzJztcbmltcG9ydCB7IEZvY3VzQ2hhbmdlRXZlbnQsIEZvY3VzTW9uaXRvciB9IGZyb20gJy4uL2ZvY3VzLW1vbml0b3InO1xuaW1wb3J0IHsgRm9jdXNUcmFwIH0gZnJvbSAnLi4vZm9jdXMtdHJhcCc7XG5pbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5U2VydmljZSB9IGZyb20gJy4uL292ZXJsYXktc2VydmljZS1uZXcnO1xuaW1wb3J0IHsgT3ZlcmxheUNvbnRyb2xsZXIgfSBmcm9tICcuL292ZXJsYXktY29udHJvbGxlcic7XG5pbXBvcnQgeyBPdmVybGF5Q29udHJvbGxlckNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb250cm9sbGVyLWNvbmZpZyc7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIgZXh0ZW5kcyBCZWhhdmlvciBpbXBsZW1lbnRzIE92ZXJsYXlDb250cm9sbGVyIHtcblxuICAgIHByb3RlY3RlZCBwcmV2aW91c0ZvY3VzOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNUcmFwIHwgRm9jdXNNb25pdG9yO1xuXG4gICAgcHJvdGVjdGVkIGlzQ2xvc2luZyA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyBvdmVybGF5OiBPdmVybGF5LCBwcm90ZWN0ZWQgb3ZlcmxheVNlcnZpY2U6IE92ZXJsYXlTZXJ2aWNlLCBwcm90ZWN0ZWQgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb250cm9sbGVyQ29uZmlnPikge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLmNvbmZpZy50cmFwRm9jdXNcbiAgICAgICAgICAgID8gbmV3IEZvY3VzVHJhcChjb25maWcpXG4gICAgICAgICAgICA6IG5ldyBGb2N1c01vbml0b3IoKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ/OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnY29tbWFuZC1vcGVuJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVPcGVuKGV2ZW50IGFzIEN1c3RvbUV2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2NvbW1hbmQtY2xvc2UnLCBldmVudCA9PiB0aGlzLmhhbmRsZUNsb3NlKGV2ZW50IGFzIEN1c3RvbUV2ZW50KSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnb3Blbi1jaGFuZ2VkJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVPcGVuQ2hhbmdlKGV2ZW50IGFzIFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAnZm9jdXMtY2hhbmdlZCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNDaGFuZ2UoZXZlbnQgYXMgRm9jdXNDaGFuZ2VFdmVudCkpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2tleWRvd24nLCBldmVudCA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG9wZW4gKGV2ZW50PzogRXZlbnQpIHtcblxuICAgICAgICBkaXNwYXRjaCh0aGlzLm92ZXJsYXksICdjb21tYW5kLW9wZW4nLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMub3ZlcmxheSxcbiAgICAgICAgICAgIHNvdXJjZTogZXZlbnQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlIChldmVudD86IEV2ZW50KSB7XG5cbiAgICAgICAgZGlzcGF0Y2godGhpcy5vdmVybGF5LCAnY29tbWFuZC1jbG9zZScsIHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy5vdmVybGF5LFxuICAgICAgICAgICAgc291cmNlOiBldmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlIChldmVudD86IEV2ZW50LCBvcGVuPzogYm9vbGVhbikge1xuXG4gICAgICAgIG9wZW4gPSAodHlwZW9mIG9wZW4gPT09ICdib29sZWFuJykgPyBvcGVuIDogIXRoaXMub3ZlcmxheS5vcGVuO1xuXG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW4oZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbG9zZShldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbiAoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5pc0Nsb3NpbmcgPSBmYWxzZTtcblxuICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheUNvbnRyb2xsZXIuaGFuZGxlT3BlbigpLi4uJywgZXZlbnQpO1xuXG4gICAgICAgIHRoaXMuc3RvcmVGb2N1cygpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVDbG9zZSAoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5pc0Nsb3NpbmcgPSB0cnVlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5Q29udHJvbGxlci5oYW5kbGVDbG9zZSgpLi4uJywgZXZlbnQpO1xuXG4gICAgICAgIHRoaXMucmVzdG9yZUZvY3VzKGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZSAoZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pIHtcblxuICAgICAgICBjb25zdCBvcGVuID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQ7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlDb250cm9sbGVyLmhhbmRsZU9wZW5DaGFuZ2UoKS4uLicsIGV2ZW50KTtcblxuICAgICAgICBpZiAob3Blbikge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5mb2N1c1RyYXApIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNUcmFwLmF0dGFjaCh0aGlzLm92ZXJsYXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzVHJhcCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c1RyYXAuZGV0YWNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNDaGFuZ2UgKGV2ZW50OiBGb2N1c0NoYW5nZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgaGFzRm9jdXMgPSBldmVudC5kZXRhaWwudHlwZSA9PT0gJ2ZvY3VzaW4nO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5Q29udHJvbGxlci5oYW5kbGVGb2N1c0NoYW5nZSgpLi4uJywgdGhpcy5pc0Nsb3NpbmcsIGhhc0ZvY3VzKTtcblxuICAgICAgICBpZiAoIWhhc0ZvY3VzICYmICF0aGlzLmlzQ2xvc2luZykge1xuXG4gICAgICAgICAgICAvLyB3aGVuIGxvb3NpbmcgZm9jdXMsIHdlIHdhaXQgZm9yIHBvdGVudGlhbCBmb2N1c2luIGV2ZW50cyBvbiBjaGlsZCBvciBwYXJlbnQgb3ZlcmxheXMgYnkgZGVsYXlpbmdcbiAgICAgICAgICAgIC8vIHRoZSBhY3RpdmUgY2hlY2sgaW4gYSBuZXcgbWFjcm90YXNrIHZpYSBzZXRUaW1lb3V0XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gd2UgY2hlY2sgaWYgdGhlIG92ZXJsYXkgaXMgYWN0aXZlIGFuZCBpZiBub3QsIHdlIGNsb3NlIGl0XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlTZXJ2aWNlLmlzT3ZlcmxheUFjdGl2ZSh0aGlzLm92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byBnZXQgdGhlIHBhcmVudCBiZWZvcmUgY2xvc2luZyB0aGUgb3ZlcmxheSAtIHdoZW4gb3ZlcmxheSBpcyBjbG9zZWQsIGl0IGRvZXNuJ3QgaGF2ZSBhIHBhcmVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLm92ZXJsYXlTZXJ2aWNlLmdldFBhcmVudE92ZXJsYXkodGhpcy5vdmVybGF5KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuY2xvc2VPbkZvY3VzTG9zcykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIHBhcmVudCBvdmVybGF5LCB3ZSBsZXQgdGhlIHBhcmVudCBrbm93IHRoYXQgb3VyIG92ZXJsYXkgaGFzIGxvc3QgZm9jdXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBieSBkaXNwYXRjaGluZyB0aGUgRm9jdXNDaGFuZ2VFdmVudCBvbiB0aGUgcGFyZW50IG92ZXJsYXkgdG8gYmUgaGFuZGxlZCBvciBpZ25vcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBieSB0aGUgcGFyZW50J3MgT3ZlcmxheUNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ292ZXJsYXktY29udHJvbGxlci5oYW5kbGVLZXlkb3duKCkuLi4nLCBldmVudCk7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBFc2NhcGU6XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3ZlcmxheS5vcGVuIHx8ICF0aGlzLmNvbmZpZy5jbG9zZU9uRXNjYXBlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZShldmVudCk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICBwcm90ZWN0ZWQgc3RvcmVGb2N1cyAoKSB7XG5cbiAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdvdmVybGF5LWNvbnRyb2xsZXIuc3RvcmVGb2N1cygpLi4uJywgdGhpcy5wcmV2aW91c0ZvY3VzKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVzdG9yZUZvY3VzIChldmVudD86IEN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ292ZXJsYXktY29udHJvbGxlci5yZXN0b3JlRm9jdXMoKS4uLicsIHRoaXMucHJldmlvdXNGb2N1cywgZXZlbnQpO1xuXG4gICAgICAgIC8vIHdlIG9ubHkgcmVzdG9yZSB0aGUgZm9jdXMgaWYgdGhlIG92ZXJsYXkgaXMgY2xvc2VkIHByZXNzaW5nIEVzY2FwZSBvciBwcm9ncmFtbWF0aWNhbGx5XG4gICAgICAgIGNvbnN0IHJlc3RvcmVGb2N1cyA9IHRoaXMuY29uZmlnLnJlc3RvcmVGb2N1cyAmJiAoIWV2ZW50IHx8IHRoaXMuaXNFc2NhcGUoZXZlbnQuZGV0YWlsLnNvdXJjZSkpO1xuXG4gICAgICAgIGlmIChyZXN0b3JlRm9jdXMpIHtcblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzIS5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcy5wcmV2aW91c0ZvY3VzID0gZG9jdW1lbnQuYm9keTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaXNFc2NhcGUgKGV2ZW50PzogRXZlbnQpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gZXZlbnQgJiYgKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpLmtleSA9PT0gRXNjYXBlIHx8IGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi4vLi4va2V5cyc7XG5pbXBvcnQgeyBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIgfSBmcm9tICcuL2RlZmF1bHQtb3ZlcmxheS1jb250cm9sbGVyLW5ldyc7XG5pbXBvcnQgeyBERUZBVUxUX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUcsIE92ZXJsYXlDb250cm9sbGVyQ29uZmlnIH0gZnJvbSAnLi9vdmVybGF5LWNvbnRyb2xsZXItY29uZmlnJztcbmltcG9ydCB7IEZvY3VzVHJhcCB9IGZyb20gJy4uL2ZvY3VzLXRyYXAnO1xuXG5leHBvcnQgY29uc3QgRElBTE9HX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUc6IE92ZXJsYXlDb250cm9sbGVyQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJR1xufTtcblxuZXhwb3J0IGNsYXNzIERpYWxvZ092ZXJsYXlDb250cm9sbGVyIGV4dGVuZHMgRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyIHtcblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcblxuICAgICAgICBpZiAoIXN1cGVyLmF0dGFjaChlbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJywgJ2RpYWxvZycpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdjbGljaycsIChldmVudDogRXZlbnQpID0+IHRoaXMuaGFuZGxlQ2xpY2soZXZlbnQgYXMgTW91c2VFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAna2V5ZG93bicsIChldmVudDogRXZlbnQpID0+IHRoaXMuaGFuZGxlS2V5ZG93bihldmVudCBhcyBLZXlib2FyZEV2ZW50KSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyk7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLm92ZXJsYXkub3BlbiA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPcGVuQ2hhbmdlIChldmVudDogUHJvcGVydHlDaGFuZ2VFdmVudDxib29sZWFuPikge1xuXG4gICAgICAgIHN1cGVyLmhhbmRsZU9wZW5DaGFuZ2UoZXZlbnQpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMudG9nZ2xlKGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEVudGVyOlxuICAgICAgICAgICAgY2FzZSBTcGFjZTpcblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBldmVudHMgdGhhdCBoYXBwZW4gb24gdGhlIHRyaWdnZXIgZWxlbWVudFxuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZShldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcblxuICAgICAgICAgICAgICAgIHN1cGVyLmhhbmRsZUtleWRvd24oZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyIH0gZnJvbSAnLi9kZWZhdWx0LW92ZXJsYXktY29udHJvbGxlci1uZXcnO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLCBPdmVybGF5Q29udHJvbGxlckNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb250cm9sbGVyLWNvbmZpZyc7XG5cbmV4cG9ydCBjb25zdCBUT09MVElQX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUc6IE92ZXJsYXlDb250cm9sbGVyQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRyxcbiAgICB0cmFwRm9jdXM6IGZhbHNlLFxuICAgIGF1dG9Gb2N1czogZmFsc2UsXG4gICAgcmVzdG9yZUZvY3VzOiBmYWxzZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBUb29sdGlwT3ZlcmxheUNvbnRyb2xsZXIgZXh0ZW5kcyBEZWZhdWx0T3ZlcmxheUNvbnRyb2xsZXIge1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5LnJvbGUgPSAndG9vbHRpcCc7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aGlzLm92ZXJsYXkuaWQpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdtb3VzZWVudGVyJywgKGV2ZW50KSA9PiB0aGlzLm9wZW4oZXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ21vdXNlbGVhdmUnLCAoZXZlbnQpID0+IHRoaXMuY2xvc2UoZXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2ZvY3VzJywgKGV2ZW50KSA9PiB0aGlzLm9wZW4oZXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2JsdXInLCAoZXZlbnQpID0+IHRoaXMuY2xvc2UoZXZlbnQpKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpO1xuXG4gICAgICAgIHJldHVybiBzdXBlci5kZXRhY2goKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBPdmVybGF5IH0gZnJvbSAnLi4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5U2VydmljZSB9IGZyb20gJy4uL292ZXJsYXktc2VydmljZS1uZXcnO1xuaW1wb3J0IHsgRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyIH0gZnJvbSAnLi9kZWZhdWx0LW92ZXJsYXktY29udHJvbGxlci1uZXcnO1xuaW1wb3J0IHsgRGlhbG9nT3ZlcmxheUNvbnRyb2xsZXIsIERJQUxPR19PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHIH0gZnJvbSAnLi9kaWFsb2ctb3ZlcmxheS1jb250cm9sbGVyJztcbmltcG9ydCB7IE92ZXJsYXlDb250cm9sbGVyIH0gZnJvbSAnLi9vdmVybGF5LWNvbnRyb2xsZXInO1xuaW1wb3J0IHsgREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLCBPdmVybGF5Q29udHJvbGxlckNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb250cm9sbGVyLWNvbmZpZyc7XG5pbXBvcnQgeyBUb29sdGlwT3ZlcmxheUNvbnRyb2xsZXIsIFRPT0xUSVBfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRyB9IGZyb20gJy4vdG9vbHRpcC1vdmVybGF5LWNvbnRyb2xsZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlDb250cm9sbGVyTWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiB7IG5ldyhvdmVybGF5OiBPdmVybGF5LCBvdmVybGF5U2VydmljZTogT3ZlcmxheVNlcnZpY2UsIGNvbmZpZzogT3ZlcmxheUNvbnRyb2xsZXJDb25maWcpOiBPdmVybGF5Q29udHJvbGxlciB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlDb250cm9sbGVyQ29uZmlnTWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiBPdmVybGF5Q29udHJvbGxlckNvbmZpZztcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSUzogT3ZlcmxheUNvbnRyb2xsZXJNYXAgPSB7XG4gICAgZGVmYXVsdDogRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyLFxuICAgIGRpYWxvZzogRGlhbG9nT3ZlcmxheUNvbnRyb2xsZXIsXG4gICAgdG9vbHRpcDogVG9vbHRpcE92ZXJsYXlDb250cm9sbGVyLFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJR1M6IE92ZXJsYXlDb250cm9sbGVyQ29uZmlnTWFwID0ge1xuICAgIGRlZmF1bHQ6IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRyxcbiAgICBkaWFsb2c6IERJQUxPR19PVkVSTEFZX0NPTlRST0xMRVJfQ09ORklHLFxuICAgIHRvb2x0aXA6IFRPT0xUSVBfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRyxcbn07XG5cbmV4cG9ydCBjbGFzcyBPdmVybGF5Q29udHJvbGxlckZhY3Rvcnkge1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwcm90ZWN0ZWQgY29udHJvbGxlcnM6IE92ZXJsYXlDb250cm9sbGVyTWFwID0gREVGQVVMVF9PVkVSTEFZX0NPTlRST0xMRVJTLFxuICAgICAgICBwcm90ZWN0ZWQgY29uZmlnczogT3ZlcmxheUNvbnRyb2xsZXJDb25maWdNYXAgPSBERUZBVUxUX09WRVJMQVlfQ09OVFJPTExFUl9DT05GSUdTXG4gICAgKSB7IH1cblxuICAgIGNyZWF0ZU92ZXJsYXlDb250cm9sbGVyICh0eXBlOiBzdHJpbmcsIG92ZXJsYXk6IE92ZXJsYXksIG92ZXJsYXlTZXJ2aWNlOiBPdmVybGF5U2VydmljZSwgY29uZmlnPzogUGFydGlhbDxPdmVybGF5Q29udHJvbGxlckNvbmZpZz4pOiBPdmVybGF5Q29udHJvbGxlciB7XG5cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcnNbdHlwZV0gfHwgRGVmYXVsdE92ZXJsYXlDb250cm9sbGVyO1xuICAgICAgICBjb25zdCBjb25maWd1cmF0aW9uID0geyAuLi4odGhpcy5jb25maWdzW3R5cGVdIHx8IERFRkFVTFRfT1ZFUkxBWV9DT05UUk9MTEVSX0NPTkZJRyksIC4uLmNvbmZpZyB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgY29udHJvbGxlcihvdmVybGF5LCBvdmVybGF5U2VydmljZSwgY29uZmlndXJhdGlvbik7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIElER2VuZXJhdG9yIHtcblxuICAgIHByaXZhdGUgX25leHQgPSAwO1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJlZml4IC0gQW4gb3B0aW9uYWwgcHJlZml4IGZvciB0aGUgZ2VuZXJhdGVkIElEIGluY2x1ZGluZyBhbiBvcHRpb25hbCBzZXBhcmF0b3IsIGUuZy46IGAnbXktcHJlZml4LScgb3IgJ3ByZWZpeC0tJyBvciAncHJlZml4Xycgb3IgJ3ByZWZpeGBcbiAgICAgKiBAcGFyYW0gc3VmZml4IC0gQW4gb3B0aW9uYWwgc3VmZml4IGZvciB0aGUgZ2VuZXJhdGVkIElEIGluY2x1ZGluZyBhbiBvcHRpb25hbCBzZXBhcmF0b3IsIGUuZy46IGAnLW15LXN1ZmZpeCcgb3IgJy0tc3VmZml4JyBvciAnX3N1ZmZpeCcgb3IgJ3N1ZmZpeGBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHByZWZpeDogc3RyaW5nID0gJycsIHB1YmxpYyBzdWZmaXg6IHN0cmluZyA9ICcnKSB7IH1cblxuICAgIGdldE5leHRJRCAoKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gYCR7IHRoaXMucHJlZml4IH0keyB0aGlzLl9uZXh0KysgfSR7IHRoaXMuc3VmZml4IH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4uL2V2ZW50LW1hbmFnZXInO1xuaW1wb3J0IHsgSURHZW5lcmF0b3IgfSBmcm9tICcuLi9pZC1nZW5lcmF0b3InO1xuaW1wb3J0IHsgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gJy4uL3RlbXBsYXRlLWZ1bmN0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfT1ZFUkxBWV9DT05GSUcsIE92ZXJsYXlDb25maWcsIE9WRVJMQVlfQ09ORklHX0ZJRUxEUyB9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuXG5jb25zdCBJRF9HRU5FUkFUT1IgPSBuZXcgSURHZW5lcmF0b3IoJ3BhcnRraXQtb3ZlcmxheS0nKTtcblxuQGNvbXBvbmVudDxPdmVybGF5Pih7XG4gICAgc2VsZWN0b3I6ICd1aS1vdmVybGF5JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICBib3JkZXI6IDJweCBzb2xpZCAjYmZiZmJmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICAgIHdpbGwtY2hhbmdlOiB0cmFuc2Zvcm07XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWhpZGRlbj10cnVlXSkge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICB3aWxsLWNoYW5nZTogYXV0bztcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGAsXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgLy8gVE9ETzogY2xlYW4gdGhpcyB1cFxuICAgIHByaXZhdGUgX2NvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHsgLi4uREVGQVVMVF9PVkVSTEFZX0NPTkZJRyB9O1xuXG4gICAgcHJvdGVjdGVkIF9vcGVuID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHk8T3ZlcmxheT4oe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sXG4gICAgfSlcbiAgICBzZXQgb3BlbiAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAodmFsdWUgPT09IHRoaXMub3BlbikgcmV0dXJuO1xuXG4gICAgICAgIC8vIHNldHRpbmcgdGhlIG9wZW4gcHJvcGVydHkgb2YgdGhlIG92ZXJsYXkgZG9lc24ndCBhY3R1YWxseSBzZXQgYW55dGhpbmcsIHRoZXJlZm9yZSByZXF1ZXN0VXBkYXRlIHdvbid0IHNlZSBhbnkgY2hhbmdlc1xuICAgICAgICAvLyBpbnN0ZWFkLCB3ZSBkaXNwYXRjaCBhbiBldmVudCB3aGljaCBhY3RzIGFzIGEgY29tbWFuZCB0byBvcGVuIG9yIGNsb3NlIHRoZSBvdmVybGF5XG4gICAgICAgIC8vIHdlIGRvIHRoaXMgdG8gYWxsb3cgdGhlIE92ZXJsYXlTZXJ2aWNlIGFuZCBPdmVybGF5Q29udHJvbGxlcnMgdG8gbGlzdGVuIHRvIHRoZXNlIGV2ZW50cyBhbmQgcnVuIHRoZWlyIGFwcHJvcHJpYXRlIGxvZ2ljXG4gICAgICAgIC8vIGluIHRoZSBzYW1lIHdheSwgdGhlIE92ZXJsYXlTZXJ2aWNlIGFuZCBPdmVybGF5Q29udHJvbGxlciBjYW4gZGlzcGF0Y2ggdGhpcyBldmVudCBhbmQgdGhlIG92ZXJsYXkgd2lsbCBiZWhhdmUgYXMgaWYgaXRzXG4gICAgICAgIC8vIG9wZW4gcHJvcGVydHkgd291bGQgaGF2ZSBiZWVuIHNldCwgd2l0aG91dCByZS1lbWl0dGluZyB0aGUgc2FtZSBldmVudFxuICAgICAgICAvLyB3ZSB3aWxsIGhhbmRsZSB0aGUgYWN0dWFsIHByb3BlcnR5IGNoYW5nZSBpbiB0aGUgaGFuZGxlcnMgYmVsb3dcbiAgICAgICAgZGlzcGF0Y2godGhpcywgdmFsdWUgPyAnY29tbWFuZC1vcGVuJyA6ICdjb21tYW5kLWNsb3NlJywge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgc291cmNlOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBvcGVuICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3BlbjtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXggPSAtMTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBjb250ZXh0OiBDb21wb25lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIGNvbnRyb2xsZXIhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIGNvbnRyb2xsZXJUeXBlID0gJ2RlZmF1bHQnO1xuXG4gICAgQHByb3BlcnR5KClcbiAgICBwb3NpdGlvblR5cGUgPSAnZGVmYXVsdCc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIG9yaWdpbiA9ICd2aWV3cG9ydCc7XG5cbiAgICBzZXQgY29uZmlnIChjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pIHtcblxuICAgICAgICB0aGlzLl9jb25maWcgPSB7IC4uLnRoaXMuX2NvbmZpZywgLi4uY29uZmlnIH07XG4gICAgfVxuXG4gICAgZ2V0IGNvbmZpZyAoKTogUGFydGlhbDxPdmVybGF5Q29uZmlnPiB7XG5cbiAgICAgICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0geyAuLi50aGlzLl9jb25maWcgfTtcblxuICAgICAgICBPVkVSTEFZX0NPTkZJR19GSUVMRFMuZm9yRWFjaChrZXkgPT4ge1xuXG4gICAgICAgICAgICBpZiAodGhpc1trZXkgYXMga2V5b2YgT3ZlcmxheV0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgY29uZmlnW2tleV0gPSB0aGlzW2tleSBhcyBrZXlvZiBPdmVybGF5XSBhcyBhbnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IElEX0dFTkVSQVRPUi5nZXROZXh0SUQoKTtcbiAgICAgICAgdGhpcy5yb2xlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSB8fCAnZGlhbG9nJztcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9O1xuXG4gICAgICAgIC8vIE9WRVJMQVlfQ09ORklHX0ZJRUxEUy5mb3JFYWNoKGtleSA9PiB7XG5cbiAgICAgICAgLy8gICAgIGlmIChjaGFuZ2VzLmhhcyhrZXkpKSBjb25maWdba2V5XSA9ICh0aGlzIGFzIGFueSlba2V5XTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gaWYgKE9iamVjdC5rZXlzKGNvbmZpZykubGVuZ3RoID4gMCkge1xuXG4gICAgICAgIC8vICAgICAvLyBUT0RPOiB3aGVuIG92ZXJsYXkgZ2V0cyBjcmVhdGVkIHZpYSBvdmVybGF5IHNlcnZpY2UsIHRoZSBjb25maWcgZnJvbSBvdXRzaWRlIHNob3VsZCBvdmVycmlkZSBvdmVybGF5J3MgZGVmYXVsdHNcbiAgICAgICAgLy8gICAgIC8vIHRoaXMub3ZlcmxheVNlcnZpY2UudXBkYXRlT3ZlcmxheUNvbmZpZyh0aGlzLCBjb25maWcpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGAkeyAhdGhpcy5vcGVuIH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLmhhcygnb3BlbicpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGAkeyAhdGhpcy5vcGVuIH1gKTtcblxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eSgnb3BlbicsIGNoYW5nZXMuZ2V0KCdvcGVuJyksIHRoaXMub3Blbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NvbW1hbmQtb3BlbicsXG4gICAgICAgIC8vIG9wdGlvbnM6IHsgY2FwdHVyZTogdHJ1ZSB9LFxuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZU9wZW4gKGV2ZW50OiBDdXN0b21FdmVudCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5LmhhbmRsZU9wZW4oKS4uLicpO1xuXG4gICAgICAgIGlmICghdGhpcy5vcGVuKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX29wZW4gPSB0cnVlO1xuXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoJ29wZW4nLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NvbW1hbmQtY2xvc2UnLFxuICAgICAgICAvLyBvcHRpb25zOiB7IGNhcHR1cmU6IHRydWUgfSxcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVDbG9zZSAoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXkuaGFuZGxlQ2xvc2UoKS4uLicpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5fb3BlbiA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoJ29wZW4nLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiB9IGZyb20gXCJAcGFydGtpdC9jb21wb25lbnRcIjtcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS1vdmVybGF5LWJhY2tkcm9wJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLW92ZXJsYXktYmFja2Ryb3AtYmFja2dyb3VuZCk7XG4gICAgfVxuICAgIDpob3N0KFtoaWRkZW5dKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIDpob3N0KFt0cmFuc3BhcmVudF0pIHtcbiAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIGBdXG59KVxuZXhwb3J0IGNsYXNzIE92ZXJsYXlCYWNrZHJvcCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGhpZGRlbiE6IGJvb2xlYW47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIHRyYW5zcGFyZW50ID0gZmFsc2U7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgc2hvdyAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmhpZGRlbiA9IGZhbHNlKTtcbiAgICB9XG5cbiAgICBoaWRlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuaGlkZGVuID0gdHJ1ZSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbiB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT046IFBvc2l0aW9uID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc2l0aW9uIChwb3NpdGlvbjogYW55KTogcG9zaXRpb24gaXMgUG9zaXRpb24ge1xuXG4gICAgcmV0dXJuIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnggIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnkgIT09ICd1bmRlZmluZWQnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgIGlmIChwb3NpdGlvbiAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbi54ICE9PSBvdGhlci54XG4gICAgICAgICAgICB8fCBwb3NpdGlvbi55ICE9PSBvdGhlci55O1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbiAhPT0gb3RoZXI7XG59XG4iLCJcbmV4cG9ydCBmdW5jdGlvbiBhcHBseURlZmF1bHRzPFQ+IChjb25maWc6IFBhcnRpYWw8VD4sIGRlZmF1bHRzOiBUKTogVCB7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkZWZhdWx0cykge1xuXG4gICAgICAgIGlmIChjb25maWdba2V5XSA9PT0gdW5kZWZpbmVkKSBjb25maWdba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZyBhcyBUO1xufVxuIiwiaW1wb3J0IHsgQm91bmRpbmdCb3gsIGdldFRhcmdldFBvc2l0aW9uIH0gZnJvbSAnLi9hbGlnbm1lbnQnO1xuaW1wb3J0IHsgaGFzUG9zaXRpb25DaGFuZ2VkLCBpc1Bvc2l0aW9uLCBQb3NpdGlvbiB9IGZyb20gJy4vcG9zaXRpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgaGFzU2l6ZUNoYW5nZWQsIFNpemUgfSBmcm9tICcuL3NpemUnO1xuaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tICdleGFtcGxlL3NyYy9iZWhhdmlvcic7XG5pbXBvcnQgeyBhcHBseURlZmF1bHRzIH0gZnJvbSAnLi4vY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uU3RyYXRlZ3kge1xuXG4gICAgcHJpdmF0ZSBfY29uZmlnOiBQb3NpdGlvbkNvbmZpZyA9IERFRkFVTFRfUE9TSVRJT05fQ09ORklHO1xuXG4gICAgcHJpdmF0ZSBfb3JpZ2luOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGFuaW1hdGlvbkZyYW1lOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFBvc2l0aW9uOiBQb3NpdGlvbiB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBjdXJyZW50U2l6ZTogU2l6ZSB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBzZXQgb3JpZ2luIChvcmlnaW46IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luIGVsZW1lbnQgaWYgaXQgaXMgYSBDU1Mgc2VsZWN0b3JcbiAgICAgICAgaWYgKHR5cGVvZiBvcmlnaW4gPT09ICdzdHJpbmcnICYmIG9yaWdpbiAhPT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBvcmlnaW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9yaWdpbikgYXMgSFRNTEVsZW1lbnQgfHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fb3JpZ2luID0gb3JpZ2luO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXQgb3JpZ2luICgpOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3JpZ2luO1xuICAgIH1cblxuICAgIHNldCBjb25maWcgKGNvbmZpZzogUG9zaXRpb25Db25maWcpIHtcblxuICAgICAgICB0aGlzLl9jb25maWcgPSB7IC4uLnRoaXMuX2NvbmZpZywgLi4uY29uZmlnIH07XG5cbiAgICAgICAgdGhpcy5vcmlnaW4gPSB0aGlzLmNvbmZpZy5vcmlnaW47XG4gICAgfVxuXG4gICAgZ2V0IGNvbmZpZyAoKTogUG9zaXRpb25Db25maWcge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyB0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPikge1xuXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnIGFzIFBvc2l0aW9uQ29uZmlnO1xuICAgIH1cblxuICAgIHVwZGF0ZSAocG9zaXRpb24/OiBQb3NpdGlvbiwgc2l6ZT86IFNpemUpIHtcblxuICAgICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcblxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dFNpemUgPSBzaXplIHx8IHRoaXMuZ2V0U2l6ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRQb3NpdGlvbiB8fCB0aGlzLmhhc1Bvc2l0aW9uQ2hhbmdlZChuZXh0UG9zaXRpb24sIHRoaXMuY3VycmVudFBvc2l0aW9uKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNpemUgfHwgdGhpcy5oYXNTaXplQ2hhbmdlZChuZXh0U2l6ZSwgdGhpcy5jdXJyZW50U2l6ZSkpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZShuZXh0U2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNpemUgPSBuZXh0U2l6ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95ICgpIHtcblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25GcmFtZSkge1xuXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lKTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFRoZSBwb3NpdGlvbiB3aWxsIGRlcGVuZCBvbiB0aGUgYWxpZ25tZW50IGFuZCBvcmlnaW4gb3B0aW9ucyBvZiB0aGUge0BsaW5rIFBvc2l0aW9uQ29uZmlnfS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UG9zaXRpb24gKCk6IFBvc2l0aW9uIHtcblxuICAgICAgICBjb25zdCBvcmlnaW5Cb3ggPSB0aGlzLmdldEJvdW5kaW5nQm94KHRoaXMub3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0Qm94ID0gdGhpcy5nZXRCb3VuZGluZ0JveCh0aGlzLnRhcmdldCk7XG5cbiAgICAgICAgLy8gVE9ETzogaW5jbHVkZSBhbGlnbm1lbnQgb2Zmc2V0XG5cbiAgICAgICAgcmV0dXJuIGdldFRhcmdldFBvc2l0aW9uKG9yaWdpbkJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50Lm9yaWdpbiwgdGFyZ2V0Qm94LCB0aGlzLmNvbmZpZy5hbGlnbm1lbnQudGFyZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIHNpemUgb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogV2UgdGFrZSB0aGUgc2V0dGluZ3MgZnJvbSB0aGUge0BsaW5rIFBvc2l0aW9uQ29uZmlnfSBzbyB3ZSBhcmUgYWx3YXlzIHVwLXRvLWRhdGUgaWYgdGhlIGNvbmZpZ3VyYXRpb24gd2FzIHVwZGF0ZWQuXG4gICAgICpcbiAgICAgKiBUaGlzIGhvb2sgYWxzbyBhbGxvd3MgdXMgdG8gZG8gdGhpbmdzIGxpa2UgbWF0Y2hpbmcgdGhlIG9yaWdpbidzIHdpZHRoLCBvciBsb29raW5nIGF0IHRoZSBhdmFpbGFibGUgdmlld3BvcnQgZGltZW5zaW9ucy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U2l6ZSAoKTogU2l6ZSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLmNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5jb25maWcuaGVpZ2h0LFxuICAgICAgICAgICAgbWF4V2lkdGg6IHRoaXMuY29uZmlnLm1heFdpZHRoLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLmNvbmZpZy5tYXhIZWlnaHQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEJvdW5kaW5nQm94IChyZWZlcmVuY2U6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpOiBCb3VuZGluZ0JveCB7XG5cbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3g6IEJvdW5kaW5nQm94ID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNQb3NpdGlvbihyZWZlcmVuY2UpKSB7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnggPSByZWZlcmVuY2UueDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSByZWZlcmVuY2UueTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZSA9PT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgYm91bmRpbmdCb3guaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luUmVjdCA9IHJlZmVyZW5jZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gueCA9IG9yaWdpblJlY3QubGVmdDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSBvcmlnaW5SZWN0LnRvcDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LndpZHRoID0gb3JpZ2luUmVjdC53aWR0aDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LmhlaWdodCA9IG9yaWdpblJlY3QuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kaW5nQm94O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50b3AgPSB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueSk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmJvdHRvbSA9ICcnO1xuXG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFwcGx5U2l6ZSAoc2l6ZTogU2l6ZSkge1xuXG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLndpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHNpemUud2lkdGgpO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5oZWlnaHQgPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5tYXhXaWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1heFdpZHRoKTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUubWF4SGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWF4SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcGFyc2VTdHlsZSAodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGwpOiBzdHJpbmcge1xuXG4gICAgICAgIHJldHVybiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgPyBgJHsgdmFsdWUgfHwgMCB9cHhgIDogdmFsdWUgfHwgJyc7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1Bvc2l0aW9uQ2hhbmdlZCAocG9zaXRpb24/OiBQb3NpdGlvbiwgb3RoZXI/OiBQb3NpdGlvbik6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiBoYXNQb3NpdGlvbkNoYW5nZWQocG9zaXRpb24sIG90aGVyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFzU2l6ZUNoYW5nZWQgKHNpemU/OiBTaXplLCBvdGhlcj86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzU2l6ZUNoYW5nZWQoc2l6ZSwgb3RoZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uQ29udHJvbGxlciBleHRlbmRzIEJlaGF2aW9yIHtcblxuICAgIHByaXZhdGUgX29yaWdpbjogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhbmltYXRpb25GcmFtZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRQb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFNpemU6IFNpemUgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlnOiBQb3NpdGlvbkNvbmZpZztcblxuICAgIHByb3RlY3RlZCBzZXQgb3JpZ2luIChvcmlnaW46IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblxuICAgICAgICAvLyBjYWNoZSB0aGUgb3JpZ2luIGVsZW1lbnQgaWYgaXQgaXMgYSBDU1Mgc2VsZWN0b3JcbiAgICAgICAgaWYgKHR5cGVvZiBvcmlnaW4gPT09ICdzdHJpbmcnICYmIG9yaWdpbiAhPT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBvcmlnaW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9yaWdpbikgYXMgSFRNTEVsZW1lbnQgfHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fb3JpZ2luID0gb3JpZ2luO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXQgb3JpZ2luICgpOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fb3JpZ2luO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yIChjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPikge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWcgPSBhcHBseURlZmF1bHRzKGNvbmZpZyB8fCB7fSwgREVGQVVMVF9QT1NJVElPTl9DT05GSUcpO1xuXG4gICAgICAgIHRoaXMub3JpZ2luID0gdGhpcy5jb25maWcub3JpZ2luO1xuICAgIH1cblxuICAgIHVwZGF0ZSAocG9zaXRpb24/OiBQb3NpdGlvbiwgc2l6ZT86IFNpemUpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcblxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dFNpemUgPSBzaXplIHx8IHRoaXMuZ2V0U2l6ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRQb3NpdGlvbiB8fCB0aGlzLmhhc1Bvc2l0aW9uQ2hhbmdlZChuZXh0UG9zaXRpb24sIHRoaXMuY3VycmVudFBvc2l0aW9uKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNpemUgfHwgdGhpcy5oYXNTaXplQ2hhbmdlZChuZXh0U2l6ZSwgdGhpcy5jdXJyZW50U2l6ZSkpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZShuZXh0U2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNpemUgPSBuZXh0U2l6ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCFzdXBlci5hdHRhY2goZWxlbWVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGRldGFjaCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogVGhlIHBvc2l0aW9uIHdpbGwgZGVwZW5kIG9uIHRoZSBhbGlnbm1lbnQgYW5kIG9yaWdpbiBvcHRpb25zIG9mIHRoZSB7QGxpbmsgUG9zaXRpb25Db25maWd9LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQb3NpdGlvbiAoKTogUG9zaXRpb24ge1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbkJveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3godGhpcy5vcmlnaW4pO1xuICAgICAgICBjb25zdCB0YXJnZXRCb3ggPSB0aGlzLmdldEJvdW5kaW5nQm94KHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8gVE9ETzogaW5jbHVkZSBhbGlnbm1lbnQgb2Zmc2V0XG5cbiAgICAgICAgcmV0dXJuIGdldFRhcmdldFBvc2l0aW9uKG9yaWdpbkJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50Lm9yaWdpbiwgdGFyZ2V0Qm94LCB0aGlzLmNvbmZpZy5hbGlnbm1lbnQudGFyZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIHNpemUgb2YgdGhlIHBvc2l0aW9uZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogV2UgdGFrZSB0aGUgc2V0dGluZ3MgZnJvbSB0aGUge0BsaW5rIFBvc2l0aW9uQ29uZmlnfSBzbyB3ZSBhcmUgYWx3YXlzIHVwLXRvLWRhdGUgaWYgdGhlIGNvbmZpZ3VyYXRpb24gd2FzIHVwZGF0ZWQuXG4gICAgICpcbiAgICAgKiBUaGlzIGhvb2sgYWxzbyBhbGxvd3MgdXMgdG8gZG8gdGhpbmdzIGxpa2UgbWF0Y2hpbmcgdGhlIG9yaWdpbidzIHdpZHRoLCBvciBsb29raW5nIGF0IHRoZSBhdmFpbGFibGUgdmlld3BvcnQgZGltZW5zaW9ucy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U2l6ZSAoKTogU2l6ZSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLmNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5jb25maWcuaGVpZ2h0LFxuICAgICAgICAgICAgbWF4V2lkdGg6IHRoaXMuY29uZmlnLm1heFdpZHRoLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLmNvbmZpZy5tYXhIZWlnaHQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEJvdW5kaW5nQm94IChyZWZlcmVuY2U6IFBvc2l0aW9uIHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCB1bmRlZmluZWQpOiBCb3VuZGluZ0JveCB7XG5cbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3g6IEJvdW5kaW5nQm94ID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNQb3NpdGlvbihyZWZlcmVuY2UpKSB7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnggPSByZWZlcmVuY2UueDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSByZWZlcmVuY2UueTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZSA9PT0gJ3ZpZXdwb3J0Jykge1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgYm91bmRpbmdCb3guaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luUmVjdCA9IHJlZmVyZW5jZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gueCA9IG9yaWdpblJlY3QubGVmdDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnkgPSBvcmlnaW5SZWN0LnRvcDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LndpZHRoID0gb3JpZ2luUmVjdC53aWR0aDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LmhlaWdodCA9IG9yaWdpblJlY3QuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kaW5nQm94O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRvcCA9IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi55KTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlTaXplIChzaXplOiBTaXplKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS53aWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLndpZHRoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5oZWlnaHQgPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLm1heFdpZHRoID0gdGhpcy5wYXJzZVN0eWxlKHNpemUubWF4V2lkdGgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLm1heEhlaWdodCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHBhcnNlU3R5bGUgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKTogc3RyaW5nIHtcblxuICAgICAgICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpID8gYCR7IHZhbHVlIHx8IDAgfXB4YCA6IHZhbHVlIHx8ICcnO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzUG9zaXRpb25DaGFuZ2VkKHBvc2l0aW9uLCBvdGhlcik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1NpemVDaGFuZ2VkIChzaXplPzogU2l6ZSwgb3RoZXI/OiBTaXplKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIGhhc1NpemVDaGFuZ2VkKHNpemUsIG90aGVyKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OLCBQb3NpdGlvbiB9IGZyb20gJy4uL3Bvc2l0aW9uJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5LCBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbi1zdHJhdGVneSc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRDogUG9zaXRpb25Db25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIodGFyZ2V0LCB7IC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NFTlRFUkVELCAuLi5jb25maWcgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGdldFBvc2l0aW9uIG1ldGhvZCB0byBhbHdheXMgcmV0dXJuIHRoZSB7QGxpbmsgREVGQVVMVF9QT1NJVElPTn1cbiAgICAgKlxuICAgICAqIFdlIGFjdHVhbGx5IGRvbid0IGNhcmUgYWJvdXQgdGhlIHBvc2l0aW9uLCBiZWNhdXNlIHdlIGFyZSBnb2luZyB0byB1c2Ugdmlld3BvcnQgcmVsYXRpdmVcbiAgICAgKiBDU1MgdW5pdHMgdG8gcG9zaXRpb24gdGhlIGVsZW1lbnQuIEFmdGVyIHRoZSBmaXJzdCBjYWxjdWxhdGlvbiBvZiB0aGUgcG9zaXRpb24sIGl0J3NcbiAgICAgKiBuZXZlciBnb2luZyB0byBjaGFuZ2UgYW5kIGFwcGx5UG9zaXRpb24gd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlLiBUaGlzIG1ha2VzIHRoaXNcbiAgICAgKiBwb3NpdGlvbiBzdHJhdGVneSByZWFsbHkgY2hlYXAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgcmV0dXJuIERFRkFVTFRfUE9TSVRJT047XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kIHRvIGNlbnRlciB0aGUgZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgdmlld3BvcnRcbiAgICAgKiBkaW1lbnNpb25zIGFuZCBpdHMgb3duIHNpemUuIFRoaXMgc3R5bGUgaGFzIHRvIGJlIGFwcGxpZWQgb25seSBvbmNlIGFuZCBpcyByZXNwb25zaXZlXG4gICAgICogYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gJzUwdmgnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gJzUwdncnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5yaWdodCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKC01MCUsIC01MCUpYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDZW50ZXJlZFBvc2l0aW9uQ29udHJvbGxlciBleHRlbmRzIFBvc2l0aW9uQ29udHJvbGxlciB7XG5cbiAgICAvKipcbiAgICAgKiBXZSBvdmVycmlkZSB0aGUgZ2V0UG9zaXRpb24gbWV0aG9kIHRvIGFsd2F5cyByZXR1cm4gdGhlIHtAbGluayBERUZBVUxUX1BPU0lUSU9OfVxuICAgICAqXG4gICAgICogV2UgYWN0dWFsbHkgZG9uJ3QgY2FyZSBhYm91dCB0aGUgcG9zaXRpb24sIGJlY2F1c2Ugd2UgYXJlIGdvaW5nIHRvIHVzZSB2aWV3cG9ydCByZWxhdGl2ZVxuICAgICAqIENTUyB1bml0cyB0byBwb3NpdGlvbiB0aGUgZWxlbWVudC4gQWZ0ZXIgdGhlIGZpcnN0IGNhbGN1bGF0aW9uIG9mIHRoZSBwb3NpdGlvbiwgaXQnc1xuICAgICAqIG5ldmVyIGdvaW5nIHRvIGNoYW5nZSBhbmQgYXBwbHlQb3NpdGlvbiB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UuIFRoaXMgbWFrZXMgdGhpc1xuICAgICAqIHBvc2l0aW9uIHN0cmF0ZWd5IHJlYWxseSBjaGVhcC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0UG9zaXRpb24gKCk6IFBvc2l0aW9uIHtcblxuICAgICAgICByZXR1cm4gREVGQVVMVF9QT1NJVElPTjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSBvdmVycmlkZSB0aGUgYXBwbHlQb3NpdGlvbiBtZXRob2QgdG8gY2VudGVyIHRoZSBlbGVtZW50IHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydFxuICAgICAqIGRpbWVuc2lvbnMgYW5kIGl0cyBvd24gc2l6ZS4gVGhpcyBzdHlsZSBoYXMgdG8gYmUgYXBwbGllZCBvbmx5IG9uY2UgYW5kIGlzIHJlc3BvbnNpdmVcbiAgICAgKiBieSBkZWZhdWx0LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhcHBseVBvc2l0aW9uIChwb3NpdGlvbjogUG9zaXRpb24pIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnRvcCA9ICc1MHZoJztcbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS5sZWZ0ID0gJzUwdncnO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKC01MCUsIC01MCUpYDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5LCBQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbmZpZywgREVGQVVMVF9QT1NJVElPTl9DT05GSUcgfSBmcm9tICcuLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuLi9wb3NpdGlvbic7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DT05ORUNURUQ6IFBvc2l0aW9uQ29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIGFsaWdubWVudDoge1xuICAgICAgICBvcmlnaW46IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2VuZCdcbiAgICAgICAgfSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICAgICAgdmVydGljYWw6ICdzdGFydCdcbiAgICAgICAgfSxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICAgICAgdmVydGljYWw6IDAsXG4gICAgICAgIH0sXG4gICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIENvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgIHByb3RlY3RlZCB1cGRhdGVMaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjtcblxuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudCwgY29uZmlnPzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4pIHtcblxuICAgICAgICBzdXBlcih0YXJnZXQsIHsgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUdfQ09OTkVDVEVELCAuLi5jb25maWcgfSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVMaXN0ZW5lciA9ICgpID0+IHRoaXMudXBkYXRlKCk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlTGlzdGVuZXIpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyLCB0cnVlKTtcbiAgICB9XG5cbiAgICBkZXN0cm95ICgpIHtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGVMaXN0ZW5lcik7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMudXBkYXRlTGlzdGVuZXIsIHRydWUpO1xuXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSBvdmVycmlkZSB0aGUgYXBwbHlQb3NpdGlvbiBtZXRob2QsIHNvIHdlIGNhbiB1c2UgYSBDU1MgdHJhbnNmb3JtIHRvIHBvc2l0aW9uIHRoZSBlbGVtZW50LlxuICAgICAqXG4gICAgICogVGhpcyBjYW4gcmVzdWx0IGluIGJldHRlciBwZXJmb3JtYW5jZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gJyc7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUucmlnaHQgPSAnJztcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgkeyB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueCkgfSwgJHsgdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLnkpIH0pYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBQb3NpdGlvbkNvbnRyb2xsZXIge1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICghc3VwZXIuYXR0YWNoKGVsZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4od2luZG93LCAncmVzaXplJywgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubGlzdGVuKGRvY3VtZW50LCAnc2Nyb2xsJywgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kLCBzbyB3ZSBjYW4gdXNlIGEgQ1NTIHRyYW5zZm9ybSB0byBwb3NpdGlvbiB0aGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FuIHJlc3VsdCBpbiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUudG9wID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc3R5bGUuYm90dG9tID0gJyc7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi54KSB9LCAkeyB0aGlzLnBhcnNlU3R5bGUocG9zaXRpb24ueSkgfSlgO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IFBvc2l0aW9uU3RyYXRlZ3ksIFBvc2l0aW9uQ29udHJvbGxlciB9IGZyb20gJy4vcG9zaXRpb24tc3RyYXRlZ3knO1xuaW1wb3J0IHsgQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5LCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRCwgQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuL3N0cmF0ZWdpZXMvY2VudGVyZWQtcG9zaXRpb24tc3RyYXRlZ3knO1xuaW1wb3J0IHsgQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSwgREVGQVVMVF9QT1NJVElPTl9DT05GSUdfQ09OTkVDVEVELCBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuL3N0cmF0ZWdpZXMvY29ubmVjdGVkLXBvc2l0aW9uLXN0cmF0ZWd5JztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvblN0cmF0ZWd5TWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiB7IG5ldyh0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IFBvc2l0aW9uU3RyYXRlZ3kgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbnRyb2xsZXJNYXAge1xuICAgIFtrZXk6IHN0cmluZ106IHsgbmV3KGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KTogUG9zaXRpb25Db250cm9sbGVyIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25Db25maWdNYXAge1xuICAgIFtrZXk6IHN0cmluZ106IFBvc2l0aW9uQ29uZmlnO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9TVFJBVEVHSUVTOiBQb3NpdGlvblN0cmF0ZWd5TWFwID0ge1xuICAgIGRlZmF1bHQ6IFBvc2l0aW9uU3RyYXRlZ3ksXG4gICAgY2VudGVyZWQ6IENlbnRlcmVkUG9zaXRpb25TdHJhdGVneSxcbiAgICBjb25uZWN0ZWQ6IENvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9DT05UUk9MTEVSUzogUG9zaXRpb25Db250cm9sbGVyTWFwID0ge1xuICAgIGRlZmF1bHQ6IFBvc2l0aW9uQ29udHJvbGxlcixcbiAgICBjZW50ZXJlZDogQ2VudGVyZWRQb3NpdGlvbkNvbnRyb2xsZXIsXG4gICAgY29ubmVjdGVkOiBDb25uZWN0ZWRQb3NpdGlvbkNvbnRyb2xsZXIsXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9DT05GSUdTOiBQb3NpdGlvbkNvbmZpZ01hcCA9IHtcbiAgICBkZWZhdWx0OiBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRyxcbiAgICBjZW50ZXJlZDogREVGQVVMVF9QT1NJVElPTl9DT05GSUdfQ0VOVEVSRUQsXG4gICAgY29ubmVjdGVkOiBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DT05ORUNURUQsXG59O1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25TdHJhdGVneUZhY3Rvcnkge1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwcm90ZWN0ZWQgc3RyYXRlZ2llczogUG9zaXRpb25TdHJhdGVneU1hcCA9IERFRkFVTFRfUE9TSVRJT05fU1RSQVRFR0lFUyxcbiAgICAgICAgcHJvdGVjdGVkIGNvbmZpZ3M6IFBvc2l0aW9uQ29uZmlnTWFwID0gREVGQVVMVF9QT1NJVElPTl9DT05GSUdTXG4gICAgKSB7IH1cblxuICAgIGNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3kgKHR5cGU6IHN0cmluZywgdGFyZ2V0OiBIVE1MRWxlbWVudCwgY29uZmlnPzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4pOiBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgICAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuc3RyYXRlZ2llc1t0eXBlXSB8fCBQb3NpdGlvblN0cmF0ZWd5O1xuICAgICAgICBjb25zdCBjb25maWd1cmF0aW9uID0geyAuLi50aGlzLmNvbmZpZ3NbdHlwZV0gfHwgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIC4uLmNvbmZpZyB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgc3RyYXRlZ3kodGFyZ2V0LCBjb25maWd1cmF0aW9uKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5IHtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHJvdGVjdGVkIGNvbnRyb2xsZXJzOiBQb3NpdGlvbkNvbnRyb2xsZXJNYXAgPSBERUZBVUxUX1BPU0lUSU9OX0NPTlRST0xMRVJTLFxuICAgICAgICBwcm90ZWN0ZWQgY29uZmlnczogUG9zaXRpb25Db25maWdNYXAgPSBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR1NcbiAgICApIHsgfVxuXG4gICAgY3JlYXRlUG9zaXRpb25Db250cm9sbGVyICh0eXBlOiBzdHJpbmcsIGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KTogUG9zaXRpb25Db250cm9sbGVyIHtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyc1t0eXBlXSB8fCBQb3NpdGlvbkNvbnRyb2xsZXI7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7IC4uLnRoaXMuY29uZmlnc1t0eXBlXSB8fCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgLi4uY29uZmlnIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBjb250cm9sbGVyKGNvbmZpZ3VyYXRpb24pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IHJlbmRlciB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IGluc2VydEFmdGVyIH0gZnJvbSAnLi4vZG9tJztcbmltcG9ydCB7IGRpc3BhdGNoLCBFdmVudE1hbmFnZXIgfSBmcm9tICcuLi9ldmVudC1tYW5hZ2VyJztcbmltcG9ydCB7IE92ZXJsYXlDb250cm9sbGVyLCBPdmVybGF5Q29udHJvbGxlckZhY3RvcnkgfSBmcm9tICcuL2NvbnRyb2xsZXInO1xuaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5QmFja2Ryb3AgfSBmcm9tICcuL292ZXJsYXktYmFja2Ryb3AnO1xuaW1wb3J0IHsgT3ZlcmxheUNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb25TdHJhdGVneSwgUG9zaXRpb25Db250cm9sbGVyIH0gZnJvbSAnLi9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSwgUG9zaXRpb25Db250cm9sbGVyRmFjdG9yeSB9IGZyb20gJy4vcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5cbi8vIFRPRE86IG92ZXJsYXkuc2VsZWN0b3IgaXMgcHJvYmFibHkgbm90IHZlcnkgdXNlZnVsIGluIGNvbnRleHQgb2YgdGhpcyBlcnJvci4uLlxuY29uc3QgT1ZFUkxBWV9VTlJFR0lTVEVSRURfRVJST1IgPSAob3ZlcmxheTogdHlwZW9mIE92ZXJsYXkpID0+IG5ldyBFcnJvcihgT3ZlcmxheSBpcyBub3QgcmVnaXN0ZXJlZDogJHsgb3ZlcmxheS5zZWxlY3RvciB9YCk7XG5cbmxldCBPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0U6IE92ZXJsYXlTZXJ2aWNlIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXlTZXR0aW5ncyB7XG4gICAgZXZlbnRzOiBFdmVudE1hbmFnZXI7XG4gICAgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+O1xuICAgIHBvc2l0aW9uU3RyYXRlZ3k/OiBQb3NpdGlvblN0cmF0ZWd5O1xuICAgIHBvc2l0aW9uQ29udHJvbGxlcj86IFBvc2l0aW9uQ29udHJvbGxlcjtcbiAgICBvdmVybGF5Q29udHJvbGxlcj86IE92ZXJsYXlDb250cm9sbGVyO1xufVxuXG5leHBvcnQgY2xhc3MgT3ZlcmxheVNlcnZpY2Uge1xuXG4gICAgcmVnaXN0ZXJlZE92ZXJsYXlzID0gbmV3IE1hcDxPdmVybGF5LCBPdmVybGF5U2V0dGluZ3M+KCk7XG5cbiAgICBhY3RpdmVPdmVybGF5cyA9IG5ldyBTZXQ8T3ZlcmxheT4oKTtcblxuICAgIHByb3RlY3RlZCBiYWNrZHJvcCE6IE92ZXJsYXlCYWNrZHJvcDtcblxuICAgIHByb3RlY3RlZCByZWdpc3RlcmluZ092ZXJsYXk/OiBPdmVybGF5O1xuXG4gICAgY29uc3RydWN0b3IgKFxuICAgICAgICBwcm90ZWN0ZWQgcG9zaXRpb25TdHJhdGVneUZhY3Rvcnk6IFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5ID0gbmV3IFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5KCksXG4gICAgICAgIHByb3RlY3RlZCBwb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5OiBQb3NpdGlvbkNvbnRyb2xsZXJGYWN0b3J5ID0gbmV3IFBvc2l0aW9uQ29udHJvbGxlckZhY3RvcnkoKSxcbiAgICAgICAgcHJvdGVjdGVkIG92ZXJsYXlDb250cm9sbGVyRmFjdG9yeTogT3ZlcmxheUNvbnRyb2xsZXJGYWN0b3J5ID0gbmV3IE92ZXJsYXlDb250cm9sbGVyRmFjdG9yeSgpLFxuICAgICAgICBwcm90ZWN0ZWQgcm9vdDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5ib2R5XG4gICAgKSB7XG5cbiAgICAgICAgaWYgKCFPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0UpIHtcblxuICAgICAgICAgICAgT1ZFUkxBWV9TRVJWSUNFX0lOU1RBTkNFID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5jcmVhdGVCYWNrZHJvcCgpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgJ2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgZXZlbnQgPT4gKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE92ZXJsYXkpICYmIHRoaXMuaGFuZGxlT3ZlcmxheUNvbm5lY3RlZChldmVudCBhcyBDdXN0b21FdmVudCksXG4gICAgICAgICAgICAgICAgeyBjYXB0dXJlOiB0cnVlIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnZGlzY29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICBldmVudCA9PiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgT3ZlcmxheSkgJiYgdGhpcy5oYW5kbGVPdmVybGF5RGlzY29ubmVjdGVkKGV2ZW50IGFzIEN1c3RvbUV2ZW50KSxcbiAgICAgICAgICAgICAgICB7IGNhcHR1cmU6IHRydWUgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0U7XG4gICAgfVxuXG4gICAgaGFzT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5oYXMob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gb3ZlcmxheSBpcyBjb25zaWRlcmVkIGZvY3VzZWQsIGlmIGVpdGhlciBpdHNlbGYgb3IgYW55IG9mIGl0cyBkZXNjZW5kYW50IG5vZGVzIGhhcyBmb2N1cy5cbiAgICAgKi9cbiAgICBpc092ZXJsYXlGb2N1c2VkIChvdmVybGF5OiBPdmVybGF5KTogYm9vbGVhbiB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgcmV0dXJuIG92ZXJsYXkgPT09IGFjdGl2ZUVsZW1lbnQgfHwgb3ZlcmxheS5jb250YWlucyhhY3RpdmVFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBvdmVybGF5IGlzIGNvbnNpZGVyZWQgYWN0aXZlIGlmIGl0IGlzIGVpdGhlciBmb2N1c2VkIG9yIGhhcyBhIGRlc2NlbmRhbnQgb3ZlcmxheSB3aGljaCBpcyBmb2N1c2VkLlxuICAgICAqL1xuICAgIGlzT3ZlcmxheUFjdGl2ZSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgIGxldCBpc0ZvdW5kID0gZmFsc2U7XG4gICAgICAgIGxldCBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChjb25maWcuc3RhY2tlZCAmJiBvdmVybGF5Lm9wZW4pIHtcblxuICAgICAgICAgICAgZm9yIChsZXQgY3VycmVudCBvZiB0aGlzLmFjdGl2ZU92ZXJsYXlzKSB7XG5cbiAgICAgICAgICAgICAgICBpc0ZvdW5kID0gaXNGb3VuZCB8fCBjdXJyZW50ID09PSBvdmVybGF5O1xuXG4gICAgICAgICAgICAgICAgaXNBY3RpdmUgPSBpc0ZvdW5kICYmIHRoaXMuaXNPdmVybGF5Rm9jdXNlZChjdXJyZW50KTtcblxuICAgICAgICAgICAgICAgIGlmIChpc0FjdGl2ZSkgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXNBY3RpdmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBwYXJlbnQgb3ZlcmxheSBvZiBhbiBhY3RpdmUgb3ZlcmxheVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogSWYgYW4gb3ZlcmxheSBpcyBzdGFja2VkLCBpdHMgcGFyZW50IG92ZXJsYXkgaXMgdGhlIG9uZSBmcm9tIHdoaWNoIGl0IHdhcyBvcGVuZWQuXG4gICAgICogVGhpcyBwYXJlbnQgb3ZlcmxheSB3aWxsIGJlIGluIHRoZSBhY3RpdmVPdmVybGF5cyBzdGFjayBqdXN0IGJlZm9yZSB0aGlzIG9uZS5cbiAgICAgKi9cbiAgICBnZXRQYXJlbnRPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KTogT3ZlcmxheSB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgY29uc3QgeyBjb25maWcgfSA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5zdGFja2VkICYmIG92ZXJsYXkub3Blbikge1xuXG4gICAgICAgICAgICAvLyB3ZSBzdGFydCB3aXRoIHBhcmVudCBiZWluZyB1bmRlZmluZWRcbiAgICAgICAgICAgIC8vIGlmIHRoZSBmaXJzdCBhY3RpdmUgb3ZlcmxheSBpbiB0aGUgc2V0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCBvdmVybGF5XG4gICAgICAgICAgICAvLyB0aGVuIGluZGVlZCB0aGUgb3ZlcmxheSBoYXMgbm8gcGFyZW50ICh0aGUgZmlyc3QgYWN0aXZlIG92ZXJsYXkgaXMgdGhlIHJvb3QpXG4gICAgICAgICAgICBsZXQgcGFyZW50OiBPdmVybGF5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIHRoZSBhY3RpdmUgb3ZlcmxheXNcbiAgICAgICAgICAgIGZvciAobGV0IGN1cnJlbnQgb2YgdGhpcy5hY3RpdmVPdmVybGF5cykge1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSByZWFjaGVkIHRoZSBzcGVjaWZpZWQgYWN0aXZlIG92ZXJsYXlcbiAgICAgICAgICAgICAgICAvLyB3ZSBjYW4gcmV0dXJuIHRoZSBwYXJlbnQgb2YgdGhhdCBvdmVybGF5IChpdCdzIHRoZSBhY3RpdmUgb3ZlcmxheSBpbiB0aGUgc2V0IGp1c3QgYmVmb3JlIHRoaXMgb25lKVxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSBvdmVybGF5KSByZXR1cm4gcGFyZW50O1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZW4ndCBmb3VuZCB0aGUgc3BlY2lmaWVkIG92ZXJsYXkgeWV0LCB3ZSBzZXRcbiAgICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudCBvdmVybGF5IGFzIHBvdGVudGlhbCBwYXJlbnQgYW5kIG1vdmUgb25cbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBjdXJyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlQmFja2Ryb3AgKCkge1xuXG4gICAgICAgIHRoaXMuYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KE92ZXJsYXlCYWNrZHJvcC5zZWxlY3RvcikgYXMgT3ZlcmxheUJhY2tkcm9wO1xuXG4gICAgICAgIHRoaXMucm9vdC5hcHBlbmRDaGlsZCh0aGlzLmJhY2tkcm9wKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgb3ZlcmxheVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQ3JlYXRlcyBhIG5ldyBvdmVybGF5IGluc3RhbmNlcyBhbmQgcmVnaXN0ZXJzIGl0IHdpdGggdGhlIHNlcnZpY2UuXG4gICAgICovXG4gICAgY3JlYXRlT3ZlcmxheSAoY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+KTogT3ZlcmxheSB7XG5cbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoT3ZlcmxheS5zZWxlY3RvcikgYXMgT3ZlcmxheTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyT3ZlcmxheShvdmVybGF5LCBjb25maWcpO1xuXG4gICAgICAgIHJldHVybiBvdmVybGF5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGFuIG92ZXJsYXkgd2l0aCB0aGUgb3ZlcmxheSBzZXJ2aWNlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBBZGRzIHRoZSBvdmVybGF5IGluc3RhbmNlIHRvIHRoZSBvdmVybGF5IHNlcnZpY2UncyByZWdpc3RyeSwgZXh0cmFjdHMgdGhlIG92ZXJsYXkncyBjb25maWd1cmF0aW9uIGFuZFxuICAgICAqIGF0dGFjaGVzIHRoZSBvdmVybGF5IHRvIHRoZSBvdmVybGF5IHNlcnZpY2UncyByb290IGxvY2F0aW9uIGluIHRoZSBkb2N1bWVudCBib2R5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb3ZlcmxheSB3YXMgcmVnaXN0ZXJlZCBzdWNjZXNzZnVsbHksIGZhbHNlIGlmIHRoZSBvdmVybGF5IGhhcyBiZWVuIHJlZ2lzdGVyZWQgYWxyZWFkeVxuICAgICAqL1xuICAgIHJlZ2lzdGVyT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0ge30pOiBib29sZWFuIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNPdmVybGF5KG92ZXJsYXkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuc2V0KG92ZXJsYXksIHRoaXMuY29uZmlndXJlT3ZlcmxheShvdmVybGF5LCBjb25maWcpKTtcblxuICAgICAgICB0aGlzLmF0dGFjaE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGRlc3Ryb3lPdmVybGF5IChvdmVybGF5OiBPdmVybGF5LCBkaXNjb25uZWN0OiBib29sZWFuID0gdHJ1ZSkge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIC8vIFRPRE86IHdlIG5lZWQgdG8gYWxzbyBkZXN0cm95IGRlc2NlbmRhbnQgb3ZlcmxheXM/XG4gICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgIGRlZmluaXRpb24uZXZlbnRzLnVubGlzdGVuQWxsKCk7XG5cbiAgICAgICAgdGhpcy5kaXNwb3NlUG9zaXRpb25TdHJhdGVneShvdmVybGF5KTtcbiAgICAgICAgdGhpcy5kaXNwb3NlUG9zaXRpb25Db250cm9sbGVyKG92ZXJsYXkpO1xuICAgICAgICB0aGlzLmRpc3Bvc2VPdmVybGF5Q29udHJvbGxlcihvdmVybGF5KTtcblxuICAgICAgICBpZiAoZGlzY29ubmVjdCAmJiBvdmVybGF5LnBhcmVudEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgb3ZlcmxheS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZGVsZXRlKG92ZXJsYXkpO1xuICAgIH1cblxuXG5cblxuXG4gICAgb3Blbk92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGV2ZW50PzogRXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnb3BlbmluZyBvdmVybGF5Li4uJywgb3ZlcmxheSk7XG5cbiAgICAgICAgZGlzcGF0Y2gob3ZlcmxheSwgJ2NvbW1hbmQtb3BlbicsIHtcbiAgICAgICAgICAgIHRhcmdldDogb3ZlcmxheSxcbiAgICAgICAgICAgIHNvdXJjZTogZXZlbnQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ/OiBFdmVudCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdjbG9zaW5nIG92ZXJsYXkuLi4nLCBvdmVybGF5KTtcblxuICAgICAgICBkaXNwYXRjaChvdmVybGF5LCAnY29tbWFuZC1jbG9zZScsIHtcbiAgICAgICAgICAgIHRhcmdldDogb3ZlcmxheSxcbiAgICAgICAgICAgIHNvdXJjZTogZXZlbnQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvZ2dsZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGV2ZW50PzogRXZlbnQsIG9wZW4/OiBib29sZWFuKSB7XG5cbiAgICAgICAgb3BlbiA9ICh0eXBlb2Ygb3BlbiA9PT0gJ2Jvb2xlYW4nKSA/IG9wZW4gOiAhb3ZlcmxheS5vcGVuO1xuXG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5PdmVybGF5KG92ZXJsYXksIGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXksIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gb3ZlcmxheSB0byB0aGUge0BsaW5rIE92ZXJsYXlTZXJ2aWNlfSdzIHJvb3QgZWxlbWVudFxuICAgICAqXG4gICAgICogQWxsIG92ZXJsYXlzIGFyZSBhdHRhY2hlZCB0byB0aGUgcm9vdCBlbGVtZW50IGluIG9yZGVyLCBhZnRlciB0aGUge0BsaW5rIE92ZXJsYXlCYWNrZHJvcH0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3ZlcmxheSAtIFRoZSBvdmVybGF5IGluc3RhbmNlIHRvIGF0dGFjaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhdHRhY2hPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgaWYgKG92ZXJsYXkucGFyZW50RWxlbWVudCA9PT0gdGhpcy5yb290KSByZXR1cm47XG5cbiAgICAgICAgbGV0IGxhc3RPdmVybGF5OiBIVE1MRWxlbWVudCA9IHRoaXMuYmFja2Ryb3A7XG5cbiAgICAgICAgd2hpbGUgKGxhc3RPdmVybGF5Lm5leHRTaWJsaW5nICYmIGxhc3RPdmVybGF5Lm5leHRTaWJsaW5nIGluc3RhbmNlb2YgT3ZlcmxheSkge1xuXG4gICAgICAgICAgICBsYXN0T3ZlcmxheSA9IGxhc3RPdmVybGF5Lm5leHRTaWJsaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5zZXJ0QWZ0ZXIob3ZlcmxheSwgbGFzdE92ZXJsYXkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCByZW5kZXJPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3JlbmRlck92ZXJsYXkoKS4uLicpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc092ZXJsYXkob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgY29uc3QgeyB0ZW1wbGF0ZSwgY29udGV4dCB9ID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpIS5jb25maWc7XG5cbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgY29udGV4dCBpcyBhbHdheXMgYXZhaWxhYmxlLCBvdGhlcndpc2UgdXNlIG92ZXJsYXkgYXMgZmFsbGJhY2stY29udGV4dFxuICAgICAgICAgICAgICAgIHJlbmRlcih0ZW1wbGF0ZShjb250ZXh0IHx8IG92ZXJsYXkpLCBvdmVybGF5LCB7IGV2ZW50Q29udGV4dDogY29udGV4dCB8fCBvdmVybGF5IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNvbmZpZ3VyZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9KTogT3ZlcmxheVNldHRpbmdzIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnY29uZmlndXJlT3ZlcmxheSgpLi4uICcsIG92ZXJsYXksIGNvbmZpZyk7XG5cbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IE92ZXJsYXlTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgZXZlbnRzOiBuZXcgRXZlbnRNYW5hZ2VyKCksXG4gICAgICAgICAgICAvLyBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLmNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3kob3ZlcmxheSwgY29uZmlnKSxcbiAgICAgICAgICAgIHBvc2l0aW9uQ29udHJvbGxlcjogdGhpcy5jcmVhdGVQb3NpdGlvbkNvbnRyb2xsZXIob3ZlcmxheSwgY29uZmlnKSxcbiAgICAgICAgICAgIG92ZXJsYXlDb250cm9sbGVyOiB0aGlzLmNyZWF0ZU92ZXJsYXlDb250cm9sbGVyKG92ZXJsYXksIGNvbmZpZyksXG4gICAgICAgIH07XG5cbiAgICAgICAgc2V0dGluZ3MuZXZlbnRzLmxpc3RlbihvdmVybGF5LCAnb3Blbi1jaGFuZ2VkJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVPdmVybGF5T3BlbkNoYW5nZWQoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpKTtcbiAgICAgICAgc2V0dGluZ3MuZXZlbnRzLmxpc3RlbihvdmVybGF5LCAnY29tbWFuZC1vcGVuJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVDb21tYW5kT3BlbihldmVudCBhcyBDdXN0b21FdmVudCkpO1xuICAgICAgICBzZXR0aW5ncy5ldmVudHMubGlzdGVuKG92ZXJsYXksICdjb21tYW5kLWNsb3NlJywgZXZlbnQgPT4gdGhpcy5oYW5kbGVDb21tYW5kQ2xvc2UoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpKTtcblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3kgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPik6IFBvc2l0aW9uU3RyYXRlZ3kgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmIChjb25maWcucG9zaXRpb25UeXBlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLnBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LmNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3koY29uZmlnLnBvc2l0aW9uVHlwZSwgb3ZlcmxheSwgY29uZmlnKTtcblxuICAgICAgICAgICAgLy8gdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGJ1aWxkcyBpdHMgb3duIGNvbmZpZyBiYXNlZCBvbiB0aGUgcG9zaXRpb25UeXBlIHNldHRpbmcsIHdlIG5lZWQgdG8gcmVmbGVjdCB0aGlzIGJhY2tcbiAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgc2VlbXMgYSB0YWQgaGFja3kuLi5cbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oY29uZmlnLCBwb3NpdGlvblN0cmF0ZWd5LmNvbmZpZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBwb3NpdGlvblN0cmF0ZWd5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRpc3Bvc2VQb3NpdGlvblN0cmF0ZWd5IChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24ucG9zaXRpb25TdHJhdGVneSkge1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLnBvc2l0aW9uU3RyYXRlZ3kuZGVzdHJveSgpO1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLnBvc2l0aW9uU3RyYXRlZ3kgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUG9zaXRpb25Db250cm9sbGVyIChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pOiBQb3NpdGlvbkNvbnRyb2xsZXIgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmIChjb25maWcucG9zaXRpb25UeXBlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29udHJvbGxlciA9IHRoaXMucG9zaXRpb25Db250cm9sbGVyRmFjdG9yeS5jcmVhdGVQb3NpdGlvbkNvbnRyb2xsZXIoY29uZmlnLnBvc2l0aW9uVHlwZSwgY29uZmlnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uQ29udHJvbGxlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwb3NlUG9zaXRpb25Db250cm9sbGVyIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24ucG9zaXRpb25Db250cm9sbGVyKSB7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24ucG9zaXRpb25Db250cm9sbGVyLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLnBvc2l0aW9uQ29udHJvbGxlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVPdmVybGF5Q29udHJvbGxlciAob3ZlcmxheTogT3ZlcmxheSwgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+KTogT3ZlcmxheUNvbnRyb2xsZXIgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmIChjb25maWcuY29udHJvbGxlclR5cGUpIHtcblxuICAgICAgICAgICAgY29uc3Qgb3ZlcmxheUNvbnRyb2xsZXIgPSB0aGlzLm92ZXJsYXlDb250cm9sbGVyRmFjdG9yeS5jcmVhdGVPdmVybGF5Q29udHJvbGxlcihjb25maWcuY29udHJvbGxlclR5cGUsIG92ZXJsYXksIHRoaXMsIGNvbmZpZyk7XG4gICAgICAgICAgICBjb25zdCBjb250cm9sbGVyRWxlbWVudCA9IGNvbmZpZy5jb250cm9sbGVyID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb25maWcuY29udHJvbGxlcikgYXMgSFRNTEVsZW1lbnQgfHwgdW5kZWZpbmVkIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBvdmVybGF5Q29udHJvbGxlci5hdHRhY2goY29udHJvbGxlckVsZW1lbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb3ZlcmxheUNvbnRyb2xsZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcG9zZU92ZXJsYXlDb250cm9sbGVyIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24ub3ZlcmxheUNvbnRyb2xsZXIpIHtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5vdmVybGF5Q29udHJvbGxlci5kZXRhY2goKTtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5vdmVybGF5Q29udHJvbGxlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPdmVybGF5Q29ubmVjdGVkIChldmVudDogQ3VzdG9tRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBvdmVybGF5ID0gZXZlbnQudGFyZ2V0IGFzIE92ZXJsYXk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVnaXN0ZXJpbmdPdmVybGF5ID09PSBvdmVybGF5KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcmluZ092ZXJsYXkgPSBvdmVybGF5O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdPdmVybGF5U2VydmljZS5oYW5kbGVPdmVybGF5Q29ubmVjdGVkKCkuLi4nLCBldmVudCk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3Rlck92ZXJsYXkob3ZlcmxheSwgb3ZlcmxheS5jb25maWcpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJpbmdPdmVybGF5ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVPdmVybGF5RGlzY29ubmVjdGVkIChldmVudDogQ3VzdG9tRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBvdmVybGF5ID0gZXZlbnQudGFyZ2V0IGFzIE92ZXJsYXk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVnaXN0ZXJpbmdPdmVybGF5ID09PSBvdmVybGF5KSByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coJ092ZXJsYXlTZXJ2aWNlLmhhbmRsZU92ZXJsYXlEaXNjb25uZWN0ZWQoKS4uLicsIGV2ZW50KTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3lPdmVybGF5KG92ZXJsYXksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3ZlcmxheU9wZW5DaGFuZ2VkIChldmVudDogQ3VzdG9tRXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnb3ZlcmxheSBvcGVuLWNoYW5nZWQuLi4nLCBldmVudCk7XG5cbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGV2ZW50LnRhcmdldCBhcyBPdmVybGF5O1xuXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb25TdHJhdGVneSwgcG9zaXRpb25Db250cm9sbGVyIH0gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgIGlmIChvdmVybGF5Lm9wZW4pIHtcblxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uU3RyYXRlZ3kpIHtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uU3RyYXRlZ3kudXBkYXRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbkNvbnRyb2xsZXIpIHtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uQ29udHJvbGxlci5hdHRhY2gob3ZlcmxheSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uQ29udHJvbGxlcikge1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Db250cm9sbGVyLmRldGFjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUNvbW1hbmRPcGVuIChldmVudDogQ3VzdG9tRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBvdmVybGF5ID0gZXZlbnQuZGV0YWlsLnRhcmdldDtcbiAgICAgICAgY29uc3Qgc291cmNlID0gZXZlbnQuZGV0YWlsLnNvdXJjZTtcblxuICAgICAgICBjb25zdCB7IGNvbmZpZywgZXZlbnRzLCBwb3NpdGlvblN0cmF0ZWd5IH0gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgIGlmIChjb25maWcuc3RhY2tlZCkge1xuXG4gICAgICAgICAgICBpZiAoc291cmNlICYmIHNvdXJjZS50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmIHRoaXMuYWN0aXZlT3ZlcmxheXMuc2l6ZSkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlT3ZlcmxheXMgPSBbLi4udGhpcy5hY3RpdmVPdmVybGF5c107XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IGFjdGl2ZU92ZXJsYXlzLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0T3ZlcmxheSA9IGFjdGl2ZU92ZXJsYXlzW2luZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdE92ZXJsYXkgPT09IHNvdXJjZS50YXJnZXQgfHwgbGFzdE92ZXJsYXkuY29udGFpbnMoc291cmNlLnRhcmdldCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgZm91bmQgdGhlIGFjdGl2ZSBvdmVybGF5IHRoYXQgY2F1c2VkIHRoZSBldmVudCwgd2Uga2VlcCB0aGUgc3RhY2sgdXAgdG8gdGhpcyBvdmVybGF5XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYWN0aXZlIG92ZXJsYXkgZGlkbid0IGNhdXNlIHRoZSBldmVudCwgc28gaXQgc2hvdWxkIGJlIGNsb3NlZCBhbmQgZGlzY2FyZGVkIGZyb20gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheShvdmVybGF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hY3RpdmVPdmVybGF5cy5hZGQob3ZlcmxheSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnLnRlbXBsYXRlICYmIGNvbmZpZy5jb250ZXh0KSB7XG5cbiAgICAgICAgICAgIC8vIHRvIGtlZXAgYSB0ZW1wbGF0ZSB1cC10by1kYXRlIHdpdGggaXQncyBjb250ZXh0LCB3ZSBoYXZlIHRvIHJlbmRlciB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGltZSB0aGUgY29udGV4dCByZW5kZXJzIC0gdGhhdCBpcywgb24gZXZlcnkgdXBkYXRlIHdoaWNoIHdhcyB0cmlnZ2VyZWRcblxuICAgICAgICAgICAgLy8gVE9ETzogZml4IGNvbnRleHQncyB1cGRhdGUgbGlzdGVuZXJcbiAgICAgICAgICAgIC8vIGNvbmZpZy5jb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlck92ZXJsYXkob3ZlcmxheSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAocG9zaXRpb25TdHJhdGVneSkge1xuXG4gICAgICAgIC8vICAgICBwb3NpdGlvblN0cmF0ZWd5LnVwZGF0ZSgpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gVE9ETzogbWFuYWdlIGJhY2tkcm9wXG5cbiAgICAgICAgLy8gaWYgKGNvbmZpZy5iYWNrZHJvcCkge1xuXG4gICAgICAgIC8vICAgICB0aGlzLmJhY2tkcm9wLnNob3coKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVDb21tYW5kQ2xvc2UgKGV2ZW50OiBDdXN0b21FdmVudCkge1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBldmVudC5kZXRhaWwudGFyZ2V0O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBldmVudC5kZXRhaWwuc291cmNlO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSEuY29uZmlnO1xuXG4gICAgICAgIGlmIChjb25maWcuc3RhY2tlZCkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVPdmVybGF5cy5zaXplKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmVPdmVybGF5cyA9IFsuLi50aGlzLmFjdGl2ZU92ZXJsYXlzXTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gYWN0aXZlT3ZlcmxheXMubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RPdmVybGF5ID0gYWN0aXZlT3ZlcmxheXNbaW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0T3ZlcmxheSA9PT0gb3ZlcmxheSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBmb3VuZCB0aGUgYWN0aXZlIG92ZXJsYXkgdGhhdCBjYXVzZWQgdGhlIGV2ZW50LCB3ZSBrZWVwIHRoZSBzdGFjayB1cCB0byB0aGlzIG92ZXJsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3RpdmUgb3ZlcmxheSBpcyBhIGRlc2NlbmRhbnQgb2YgdGhlIG9uZSB0aGF0J3MgY2xvc2VkLCBzbyBpdCBzaG91bGQgYmUgY2xvc2VkIGFuZCBkaXNjYXJkZWQgZnJvbSB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KGxhc3RPdmVybGF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hY3RpdmVPdmVybGF5cy5kZWxldGUob3ZlcmxheSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnLnRlbXBsYXRlICYmIGNvbmZpZy5jb250ZXh0KSB7XG5cbiAgICAgICAgICAgIC8vIGNvbmZpZy5jb250ZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VwZGF0ZScsIHVwZGF0ZUxpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXIpO8aSXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBtYW5hZ2UgYmFja2Ryb3BcblxuICAgICAgICAvLyBpZiAoY29uZmlnLmJhY2tkcm9wKSB7XG5cbiAgICAgICAgLy8gICAgIHRoaXMuYmFja2Ryb3AuaGlkZSgpO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkge1xuXG4gICAgICAgICAgICB0aHJvdyBPVkVSTEFZX1VOUkVHSVNURVJFRF9FUlJPUihvdmVybGF5LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBPdmVybGF5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgT3ZlcmxheSwgT3ZlcmxheUNvbmZpZywgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0ICcuL292ZXJsYXkvb3ZlcmxheSc7XG5cbmNvbnN0IGN1c3RvbU92ZXJsYXlDb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7XG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ3N0YXJ0JyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnLFxuICAgICAgICB9LFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2VuZCcsXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuY29uc3QgdG9vbHRpcE92ZXJsYXlDb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7XG4gICAgYmFja2Ryb3A6IGZhbHNlLFxuICAgIHRyYXBGb2N1czogZmFsc2UsXG4gICAgc3RhY2tlZDogZmFsc2UsXG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ3N0YXJ0JyxcbiAgICAgICAgfSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnZW5kJyxcbiAgICAgICAgfSxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICAgICAgdmVydGljYWw6IDEwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuQGNvbXBvbmVudDxPdmVybGF5RGVtb0NvbXBvbmVudD4oe1xuICAgIHNlbGVjdG9yOiAnb3ZlcmxheS1kZW1vJyxcbiAgICBzaGFkb3c6IGZhbHNlLFxuICAgIHRlbXBsYXRlOiAoZWxlbWVudCkgPT4gaHRtbGBcbiAgICA8YnV0dG9uIGlkPVwib3ZlcmxheVwiPlNob3cgT3ZlcmxheTwvYnV0dG9uPlxuXG4gICAgPHVpLW92ZXJsYXkgY29udHJvbGxlcj1cIiNvdmVybGF5XCIgY29udHJvbGxlci10eXBlPVwiZGlhbG9nXCIgcG9zaXRpb24tdHlwZT1cImNvbm5lY3RlZFwiIG9yaWdpbj1cIiNvdmVybGF5XCIgLmNvbmZpZz0keyBjdXN0b21PdmVybGF5Q29uZmlnIH0+XG4gICAgICAgIDxoMz5PdmVybGF5PC9oMz5cbiAgICAgICAgPHA+VGhpcyBpcyB0aGUgY29udGVudCBvZiB0aGUgb3ZlcmxheTogJHsgZWxlbWVudC5jb3VudGVyIH08L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgVGhpcyBpcyBhbiBpbnB1dDogPGlucHV0IHR5cGU9XCJ0ZXh0XCIvPlxuICAgICAgICA8L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgVGhpcyBidXR0b24gb3BlbnMgYW5vdGhlciBvdmVybGF5OlxuXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiYW5vdGhlci1vdmVybGF5XCI+QW5vdGhlciBPdmVybGF5PC9idXR0b24+XG4gICAgICAgIDwvcD5cbiAgICA8L3VpLW92ZXJsYXk+XG5cbiAgICA8dWktb3ZlcmxheSBjb250cm9sbGVyPVwiI2Fub3RoZXItb3ZlcmxheVwiIGNvbnRyb2xsZXItdHlwZT1cImRpYWxvZ1wiIHBvc2l0aW9uLXR5cGU9XCJjb25uZWN0ZWRcIiBvcmlnaW49XCIjYW5vdGhlci1vdmVybGF5XCI+XG4gICAgICAgIDxoMz5Bbm90aGVyIE92ZXJsYXk8L2gzPlxuICAgICAgICA8cD5KdXN0IHNvbWUgc3RhdGljIGNvbnRlbnQuLi48L3A+XG4gICAgPC91aS1vdmVybGF5PlxuXG4gICAgPGJ1dHRvbiBpZD1cIm92ZXJsYXktcHJvZ3JhbW1hdGljXCIgQGNsaWNrPSR7IGVsZW1lbnQuc2hvd092ZXJsYXkgfT5TaG93IHByb2dyYW1tYXRpYyBvdmVybGF5PC9idXR0b24+XG5cbiAgICA8cD5XZSBoYXZlIDxhIGhyZWY9XCIjXCIgaWQ9XCJ0b29sdGlwXCI+dG9vbHRpcHM8L2E+IHRvby4uLjwvcD5cblxuICAgIDx1aS1vdmVybGF5IGNvbnRyb2xsZXI9XCIjdG9vbHRpcFwiIGNvbnRyb2xsZXItdHlwZT1cInRvb2x0aXBcIiBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCIgb3JpZ2luPVwiI3Rvb2x0aXBcIiAuY29uZmlnPSR7IHRvb2x0aXBPdmVybGF5Q29uZmlnIH0+XG4gICAgICAgIDxwPkkgYW0gdGhlIHRvb2x0aXAgY29udGVudC48L3A+XG4gICAgPC91aS1vdmVybGF5PlxuXG4gICAgPHVpLW92ZXJsYXkgY29udHJvbGxlcj1cIiN0b29sdGlwXCIgY29udHJvbGxlci10eXBlPVwiZGlhbG9nXCIgcG9zaXRpb24tdHlwZT1cImNvbm5lY3RlZFwiIG9yaWdpbj1cIiN0b29sdGlwXCI+XG4gICAgICAgIDxwPkknbSBhbm90aGVyIG92ZXJsYXkgb24gdGhlIHRvb2x0aXAgdHJpZ2dlci48L3A+XG4gICAgPC91aS1vdmVybGF5PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgT3ZlcmxheURlbW9Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIG92ZXJsYXlTZXJ2aWNlID0gbmV3IE92ZXJsYXlTZXJ2aWNlKCk7XG5cbiAgICBwcm90ZWN0ZWQgb3ZlcmxheT86IE92ZXJsYXk7XG5cbiAgICBwcm90ZWN0ZWQgdGltZW91dCE6IG51bWJlcjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIgPSAwO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5jb3VudCgpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH1cblxuICAgIGNvbmZpcm0gKCkge1xuXG4gICAgICAgIGFsZXJ0KGBZb3UgY29uZmlybWVkIGF0ICR7IHRoaXMuY291bnRlciB9LmApO1xuICAgIH1cblxuICAgIGNhbmNlbCAoKSB7XG5cbiAgICAgICAgYWxlcnQoYFlvdSBjYW5jZWxsZWQgYXQgJHsgdGhpcy5jb3VudGVyIH0uYCk7XG4gICAgfVxuXG4gICAgc2hvd092ZXJsYXkgKGV2ZW50OiBFdmVudCkge1xuXG4gICAgICAgIGlmICghdGhpcy5vdmVybGF5KSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHRlbXBsYXRlIGZ1bmN0aW9uIGluIHRoZSBhcHAgY29tcG9uZW50J3MgY29udGV4dFxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSAoKSA9PiBodG1sYFxuICAgICAgICAgICAgICAgIDxoMz5Qcm9ncmFtbWF0aWMgT3ZlcmxheTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+VGhpcyBpcyB0aGUgY29udGVudCBvZiB0aGUgcG9wb3ZlcjogJHsgdGhpcy5jb3VudGVyIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+PGJ1dHRvbiBAY2xpY2s9JHsgdGhpcy5jbG9zZU92ZXJsYXkgfT5Hb3QgaXQ8L2J1dHRvbj48L3A+XG4gICAgICAgICAgICBgO1xuXG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VyID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgICAgICAvLyBwYXNzIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiBhbmQgYSByZWZlcmVuY2UgdG8gdGhlIHRlbXBsYXRlJ3MgY29udGV4dCAodGhlIGFwcCBjb21wb25lbnQpXG4gICAgICAgICAgICAvLyB0byB0aGUgb3ZlcmxheSBzZXJ2aWNlXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlTZXJ2aWNlLmNyZWF0ZU92ZXJsYXkoeyBwb3NpdGlvblR5cGU6ICdjZW50ZXJlZCcsIGNvbnRyb2xsZXJUeXBlOiAnZGVmYXVsdCcsIHRlbXBsYXRlOiB0ZW1wbGF0ZSwgY29udGV4dDogdGhpcywgc3RhY2tlZDogdHJ1ZSwgdHJhcEZvY3VzOiB0cnVlLCBhdXRvRm9jdXM6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgZmFpbCB0aGUgZmlyc3QgdGltZSwgYXMgY3JlYXRlT3ZlcmxheSBpcyBpbnRyaW5zaWNhbGx5IGFzeW5jIC0gaXQgY3JlYXRlcyB0aGUgb3ZlcmxheSBhbmQgcmVhdHRhY2hlcyBpdCwgd2hpY2ggd2lsbFxuICAgICAgICAvLyBjYXVzZSBhIHNlY29uZCBjb25uZWN0ZWQgY2FsbGJhY2sgd2hpY2ggd2UgYWN0dWFsbHkgaGF2ZSB0byB3YWl0IGZvciBiZWZvcmUgb3BlbmluZyB0aGUgb3ZlcmxheS4uLlxuICAgICAgICB0aGlzLm92ZXJsYXlTZXJ2aWNlLm9wZW5PdmVybGF5KHRoaXMub3ZlcmxheSk7XG4gICAgfVxuXG4gICAgY2xvc2VPdmVybGF5ICgpIHtcblxuICAgICAgICAvLyBpZiAodGhpcy5vdmVybGF5KSB0aGlzLm92ZXJsYXlTZXJ2aWNlLmNsb3NlT3ZlcmxheSh0aGlzLm92ZXJsYXkpO1xuXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXkpIHtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5kZXN0cm95T3ZlcmxheSh0aGlzLm92ZXJsYXkpO1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY291bnQgKCkge1xuXG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmNvdW50ZXIrKztcblxuICAgICAgICAgICAgdGhpcy5jb3VudCgpO1xuXG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzdG9wICgpIHtcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcblxuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sXG4gICAgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLFxuICAgIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICBDaGFuZ2VzLCBDb21wb25lbnQsXG4gICAgY29tcG9uZW50LFxuICAgIGNzcyxcbiAgICBsaXN0ZW5lcixcbiAgICBwcm9wZXJ0eVxufSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IFRhYlBhbmVsIH0gZnJvbSAnLi90YWItcGFuZWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIHBhZGRpbmc6IDAuNXJlbSAwLjVyZW07XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItYm90dG9tOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzKSB2YXIoLS1ib3JkZXItcmFkaXVzKSAwIDA7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtc2VsZWN0ZWQ9dHJ1ZV0pOmFmdGVyIHtcbiAgICAgICAgY29udGVudDogJyc7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHotaW5kZXg6IDI7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIGJvdHRvbTogY2FsYygtMSAqIHZhcigtLWJvcmRlci13aWR0aCkpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWJvcmRlci13aWR0aCkgKyAwLjVyZW0pO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByaXZhdGUgX3BhbmVsOiBUYWJQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFdlIHByb3ZpZGUgb3VyIG93biB0YWJpbmRleCBwcm9wZXJ0eSwgc28gd2UgY2FuIHNldCBpdCB0byBgbnVsbGBcbiAgICAgKiB0byByZW1vdmUgdGhlIHRhYmluZGV4LWF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICd0YWJpbmRleCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCE6IG51bWJlciB8IG51bGw7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLXNlbGVjdGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgZ2V0IHNlbGVjdGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gICAgfVxuXG4gICAgc2V0IHNlbGVjdGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogKHZhbHVlID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICB9KVxuICAgIGdldCBkaXNhYmxlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAodGhpcy5zZWxlY3RlZCA/IDAgOiAtMSk7XG4gICAgfVxuXG4gICAgZ2V0IHBhbmVsICgpOiBUYWJQYW5lbCB8IG51bGwge1xuXG4gICAgICAgIGlmICghdGhpcy5fcGFuZWwpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRyb2xzKSBhcyBUYWJQYW5lbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9wYW5lbDtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFiJ1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAtMTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwubGFiZWxsZWRCeSA9IHRoaXMuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzZWxlY3QgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLnNlbGVjdGVkID0gZmFsc2UpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQXJyb3dEb3duIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBBY3RpdmVJdGVtQ2hhbmdlLCBGb2N1c0tleU1hbmFnZXIgfSBmcm9tICcuLi9saXN0LWtleS1tYW5hZ2VyJztcbmltcG9ydCB7IFRhYiB9IGZyb20gJy4vdGFiJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWItbGlzdCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3cgbm93cmFwO1xuICAgIH1cbiAgICA6OnNsb3R0ZWQodWktdGFiKSB7XG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4yNXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiTGlzdCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgZm9jdXNNYW5hZ2VyITogRm9jdXNLZXlNYW5hZ2VyPFRhYj47XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRUYWIhOiBUYWI7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFibGlzdCc7XG5cbiAgICAgICAgdGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMsIHRoaXMucXVlcnlTZWxlY3RvckFsbChUYWIuc2VsZWN0b3IpLCAnaG9yaXpvbnRhbCcpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBjb25zdCBzbG90ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoJ3Nsb3QnKSBhcyBIVE1MU2xvdEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIHNsb3QuYWRkRXZlbnRMaXN0ZW5lcignc2xvdGNoYW5nZScsICgpID0+IHtcblxuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGAke3Nsb3QubmFtZX0gY2hhbmdlZC4uLmAsIHNsb3QuYXNzaWduZWROb2RlcygpKTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRhYiA9IHRoaXMucXVlcnlTZWxlY3RvcihgJHsgVGFiLnNlbGVjdG9yIH1bYXJpYS1zZWxlY3RlZD10cnVlXWApIGFzIFRhYjtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUYWJcbiAgICAgICAgICAgICAgICA/IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oc2VsZWN0ZWRUYWIpXG4gICAgICAgICAgICAgICAgOiB0aGlzLmZvY3VzTWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcblxuICAgICAgICAgICAgLy8gc2V0dGluZyB0aGUgYWN0aXZlIGl0ZW0gdmlhIHRoZSBmb2N1cyBtYW5hZ2VyJ3MgQVBJIHdpbGwgbm90IHRyaWdnZXIgYW4gZXZlbnRcbiAgICAgICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gbWFudWFsbHkgc2VsZWN0IHRoZSBpbml0aWFsbHkgYWN0aXZlIHRhYlxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLnNlbGVjdFRhYih0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAna2V5ZG93bicgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEFycm93RG93bjpcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5mb2N1c01hbmFnZXIuZ2V0QWN0aXZlSXRlbSgpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFRhYiAmJiBzZWxlY3RlZFRhYi5wYW5lbCkgc2VsZWN0ZWRUYWIucGFuZWwuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxUYWJMaXN0Pih7XG4gICAgICAgIGV2ZW50OiAnYWN0aXZlLWl0ZW0tY2hhbmdlJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmZvY3VzTWFuYWdlcjsgfVxuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUFjdGl2ZVRhYkNoYW5nZSAoZXZlbnQ6IEFjdGl2ZUl0ZW1DaGFuZ2U8VGFiPikge1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzVGFiID0gZXZlbnQuZGV0YWlsLnByZXZpb3VzLml0ZW07XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQuaXRlbTtcblxuICAgICAgICBpZiAocHJldmlvdXNUYWIgIT09IHNlbGVjdGVkVGFiKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RUYWIocHJldmlvdXNUYWIpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RUYWIoc2VsZWN0ZWRUYWIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuc2VsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0YWIucGFuZWwpIHRhYi5wYW5lbC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkZXNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuZGVzZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1wYW5lbCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgei1pbmRleDogMTtcbiAgICAgICAgcGFkZGluZzogMCAxcmVtO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXIpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAwIHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpO1xuICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtaGlkZGVuPXRydWVdKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYlBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtaGlkZGVuJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICB9KVxuICAgIGhpZGRlbiE6IGJvb2xlYW47XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWxhYmVsbGVkYnknLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGxhYmVsbGVkQnkhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFicGFuZWwnXG4gICAgICAgIHRoaXMuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IC0xO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8VG9nZ2xlPih7XG4gICAgc2VsZWN0b3I6ICd1aS10b2dnbGUnLFxuICAgIHRlbXBsYXRlOiB0b2dnbGUgPT4gaHRtbGBcbiAgICA8c3R5bGU+XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIC0tdGltaW5nLWN1YmljOiBjdWJpYy1iZXppZXIoMC41NSwgMC4wNiwgMC42OCwgMC4xOSk7XG4gICAgICAgICAgICAtLXRpbWluZy1zaW5lOiBjdWJpYy1iZXppZXIoMC40NywgMCwgMC43NSwgMC43Mik7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tdGltaW5nOiB2YXIoLS10aW1pbmctc2luZSk7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tZHVyYXRpb246IC4xcztcbiAgICAgICAgfVxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgodmFyKC0tZm9udC1zaXplKSwgMWZyKSk7XG5cbiAgICAgICAgICAgIG1pbi13aWR0aDogY2FsYyh2YXIoLS1mb250LXNpemUpICogMiArIHZhcigtLWJvcmRlci13aWR0aCkgKiAyKTtcbiAgICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1mb250LXNpemUpICsgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgKiAyKTtcbiAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuXG4gICAgICAgICAgICAvKiB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3I7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7ICovXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD10cnVlXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICAgICAgfVxuICAgICAgICAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGhlaWdodDogdmFyKC0tZm9udC1zaXplKTtcbiAgICAgICAgICAgIHdpZHRoOiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgd2lkdGg6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl1bbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgLmxhYmVsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgLjI1cmVtO1xuICAgICAgICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIGp1c3RpZnktc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmxhYmVsLW9uIHtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwiZmFsc2VcIl0pIC5sYWJlbC1vZmYge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG5cbiAgICA8L3N0eWxlPlxuICAgIDxzcGFuIGNsYXNzPVwidG9nZ2xlLXRodW1iXCI+PC9zcGFuPlxuICAgICR7IHRvZ2dsZS5sYWJlbE9uICYmIHRvZ2dsZS5sYWJlbE9mZlxuICAgICAgICAgICAgPyBodG1sYDxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtb2ZmXCI+JHsgdG9nZ2xlLmxhYmVsT2ZmIH08L3NwYW4+PHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vblwiPiR7IHRvZ2dsZS5sYWJlbE9uIH08L3NwYW4+YFxuICAgICAgICAgICAgOiAnJ1xuICAgICAgICB9XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBUb2dnbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jaGVja2VkJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhblxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGxhYmVsID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPbiA9ICcnO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZmFsc2VcbiAgICB9KVxuICAgIGxhYmVsT2ZmID0gJyc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnc3dpdGNoJztcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBwcm9wZXJ0eS1jaGFuZ2UgZXZlbnQgZm9yIGBjaGVja2VkYFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHNwYWNlIGtleSBmcm9tIHNjcm9sbGluZyB0aGUgcGFnZVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCAnLi9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gJy4vYXBwLnN0eWxlcyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZSB9IGZyb20gJy4vYXBwLnRlbXBsYXRlJztcbmltcG9ydCAnLi9jYXJkJztcbmltcG9ydCAnLi9jaGVja2JveCc7XG5pbXBvcnQgJy4vaWNvbi9pY29uJztcbmltcG9ydCAnLi9vdmVybGF5LWRlbW8nO1xuaW1wb3J0ICcuL3RhYnMvdGFiJztcbmltcG9ydCAnLi90YWJzL3RhYi1saXN0JztcbmltcG9ydCAnLi90YWJzL3RhYi1wYW5lbCc7XG5pbXBvcnQgJy4vdG9nZ2xlJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkZW1vLWFwcCcsXG4gICAgc2hhZG93OiBmYWxzZSxcbiAgICBzdHlsZXM6IFtzdHlsZXNdLFxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxufSlcbmV4cG9ydCBjbGFzcyBBcHAgZXh0ZW5kcyBDb21wb25lbnQgeyB9XG4iLCJpbXBvcnQgJy4vc3JjL2FwcCc7XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcCAoKSB7XG5cbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VpLWNoZWNrYm94Jyk7XG5cbiAgICBpZiAoY2hlY2tib3gpIHtcblxuICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGVja2VkLWNoYW5nZWQnLCBldmVudCA9PiBjb25zb2xlLmxvZygoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpLmRldGFpbCkpO1xuICAgIH1cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBib290c3RyYXApO1xuIl0sIm5hbWVzIjpbInByZXBhcmVDb25zdHJ1Y3RvciIsIlRhYiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDakMsSUE2Q08sTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUs7SUFDbEMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLFVBQVUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQztJQUNGOztJQzlEQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGNBQWMsS0FBSyxTQUFTO0lBQy9ELElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUI7SUFDbkQsUUFBUSxTQUFTLENBQUM7QUFDbEIsSUFZQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxXQUFXLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxJQUFJLEtBQUs7SUFDN0QsSUFBSSxPQUFPLEtBQUssS0FBSyxHQUFHLEVBQUU7SUFDMUIsUUFBUSxNQUFNLENBQUMsR0FBRyxLQUFLLENB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
