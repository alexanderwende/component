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
            this.listen(this.element, 'keydown', ((event) => this.handleKeyDown(event)));
            this.update();
            if (this.config.autoFocus) {
                this.focusInitial();
            }
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
        // TODO: add option to match width of origin element
        // matchOriginWidth: false,
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
        'trigger',
        'triggerType',
        'template',
        'context',
        'backdrop',
        'closeOnEscape',
        'closeOnBackdropClick',
        'trapFocus',
        'autoFocus',
        'initialFocus',
        'restoreFocus',
        'wrapFocus',
        'tabbableSelector'
    ];
    const DEFAULT_OVERLAY_CONFIG = Object.assign(Object.assign(Object.assign({}, DEFAULT_POSITION_CONFIG), DEFAULT_FOCUS_TRAP_CONFIG), { positionType: 'default', trigger: undefined, triggerType: undefined, template: undefined, context: undefined, backdrop: true, trapFocus: true, closeOnEscape: true, closeOnBackdropClick: true });
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

    class DefaultOverlayTrigger extends Behavior {
        constructor(overlay) {
            super();
            this.overlay = overlay;
            this.overlayService = new OverlayService();
        }
        attach(element) {
            super.attach(element);
            this.element.setAttribute('aria-haspopup', 'dialog');
            this.listen(this.element, 'keydown', (event) => this.handleKeydown(event));
            this.listen(this.element, 'mousedown', (event) => this.handleMousedown(event));
            this.listen(this.overlay, 'open-changed', () => this.update());
            this.listen(this.overlay, 'keydown', (event) => this.handleKeydown(event));
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
        handleKeydown(event) {
            switch (event.key) {
                case Enter:
                case Space:
                    if (event.target !== this.element)
                        return;
                    this.overlayService.toggleOverlay(this.overlay, event);
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                case Escape:
                    if (!this.overlayService.isOverlayOpen(this.overlay))
                        return;
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
    class TooltipOverlayTrigger extends Behavior {
        constructor(overlay) {
            super();
            this.overlay = overlay;
            this.overlayService = new OverlayService();
        }
        attach(element) {
            super.attach(element);
            this.overlay.role = 'tooltip';
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('aria-describedby', this.overlay.id);
            this.listen(this.element, 'mouseenter', (event) => this.openTooltip(event));
            this.listen(this.element, 'mouseleave', (event) => this.closeTooltip(event));
            this.listen(this.element, 'focus', (event) => this.openTooltip(event));
            this.listen(this.element, 'blur', (event) => this.closeTooltip(event));
        }
        detach() {
            if (!this.hasAttached)
                return;
            this.element.removeAttribute('tabindex');
            this.element.removeAttribute('aria-describedby');
            super.detach();
        }
        update() { }
        openTooltip(event) {
            this.overlayService.openOverlay(this.overlay, event);
        }
        closeTooltip(event) {
            this.overlayService.closeOverlay(this.overlay, event);
        }
    }
    // export class DialogOverlayTrigger extends Behavior implements OverlayTrigger { }
    // export class TreeOverlayTrigger { }
    // export class GridOverlayTrigger { }
    //# sourceMappingURL=overlay-trigger.js.map

    const DEFAULT_OVERLAY_TRIGGERS = {
        default: DefaultOverlayTrigger,
        tooltip: TooltipOverlayTrigger,
    };
    class OverlayTriggerFactory {
        constructor(triggers = DEFAULT_OVERLAY_TRIGGERS) {
            this.triggers = triggers;
        }
        createOverlayTrigger(type, overlay) {
            return this.triggers[type]
                ? new this.triggers[type](overlay)
                : new DefaultOverlayTrigger(overlay);
        }
    }
    //# sourceMappingURL=overlay-trigger-factory.js.map

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

    class OverlayController extends Behavior {
        constructor(overlay, config) {
            super();
            this.overlay = overlay;
            this.config = config;
            this.overlayService = new OverlayService();
            this.listen(this.overlay, 'keydown', (event) => this.handleKeydown(event));
            this.listen(this.overlay, 'open-changed', () => this.update());
            if (this.config.trapFocus) {
                this.focusTrap = new FocusTrap(this.config);
                this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event));
            }
        }
        attach(element) {
            super.attach(element);
            this.element.setAttribute('aria-haspopup', 'dialog');
            this.listen(this.element, 'keydown', (event) => this.handleKeydown(event));
            this.listen(this.element, 'mousedown', (event) => this.handleMousedown(event));
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
        open(event) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.overlayService.openOverlay(this.overlay, event);
                if (this.focusTrap) {
                    this.saveFocus();
                    this.focusTrap.attach(this.overlay);
                }
                return result;
            });
        }
        close(event) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.overlayService.closeOverlay(this.overlay, event);
                if (this.focusTrap) {
                    this.focusTrap.detach();
                    this.restoreFocus(event);
                }
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
        saveFocus() {
            this.previousFocus = document.activeElement || undefined;
        }
        restoreFocus(event) {
            // we only restore the focus if the overlay is closed pressing Escape or programmatically
            const restoreFocus = this.config.restoreFocus
                && this.previousFocus
                && (this.isEscape(event) || !event);
            if (restoreFocus) {
                console.log('OverlayController.restoreFocus...', event);
                this.previousFocus.focus();
            }
            this.previousFocus = undefined;
        }
        handleFocusChange(event) {
            const hasFocus = event.detail.type === 'focusin';
            if (!hasFocus) {
                // when loosing focus, we wait for potential focusin events on child overlays by delaying the active check with a promise
                Promise.resolve().then(() => {
                    // then we check if the overlay is active and if not, we close it
                    if (!this.overlayService.isOverlayActive(this.overlay))
                        this.close(event);
                });
            }
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
                case Escape:
                    if (!this.overlayService.isOverlayOpen(this.overlay))
                        return;
                    this.close(event);
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        }
        handleMousedown(event) {
            this.toggle(event);
        }
        isEscape(event) {
            return event && event.type === 'keydown' && event.key === Escape || false;
        }
    }

    const OVERLAY_UNREGISTERED_ERROR = (overlay) => new Error(`Overlay is not registered: ${overlay.selector}`);
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
                    isActive = this.isOverlayFocused(this.activeOverlays[index]);
                }
            }
            return isActive;
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
        // openOverlay (overlay: Overlay, event?: Event) {
        //     this._throwUnregiseredOverlay(overlay);
        //     if (this.isOverlayOpen(overlay)) return;
        //     // we need to check if an event caused the overlay to open and if it originates from any active overlay in the stack
        //     let length = this.activeOverlays.length,
        //         index = length - 1;
        //     if (event && length && event.target instanceof Node) {
        //         for (index; index >= 0; index--) {
        //             let activeOverlay = this.activeOverlays[index];
        //             if (activeOverlay === event.target || activeOverlay.contains(event.target)) {
        //                 // we found the active overlay that caused the event, we keep the stack up to this overlay
        //                 break;
        //             } else {
        //                 // the active overlay didn't cause the event, so it should be closed and discarded from the stack
        //                 this.closeOverlay(overlay);
        //             }
        //         }
        //     }
        //     // push overlay on the stack to mark it as currently active overlay
        //     this.activeOverlays.push(overlay);
        //     overlay.show();
        // }
        openOverlay(overlay, event) {
            return __awaiter(this, void 0, void 0, function* () {
                this._throwUnregiseredOverlay(overlay);
                return new Promise((resolve, reject) => {
                    if (this.isOverlayOpen(overlay)) {
                        reject(false);
                        return;
                    }
                    overlay.addEventListener('open-changed', (event) => resolve(true), { once: true });
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
                });
            });
        }
        closeOverlay(overlay, event) {
            return __awaiter(this, void 0, void 0, function* () {
                this._throwUnregiseredOverlay(overlay);
                return new Promise((resolve, reject) => {
                    if (!this.isOverlayOpen(overlay)) {
                        reject(false);
                        return;
                    }
                    overlay.addEventListener('open-changed', (event) => resolve(true), { once: true });
                    let isFound = false;
                    while (!isFound) {
                        // activeOverlay is either a descendant of overlay or overlay itself
                        let activeOverlay = this.activeOverlays.pop();
                        // if we arrived at the overlay, we stop closing
                        isFound = activeOverlay === overlay;
                        activeOverlay.hide();
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
                const { updateListener, positionStrategy, focusTrap, config } = this.registeredOverlays.get(overlay);
                if (config.template && config.context) {
                    // to keep a template up-to-date with it's context, we have to render the template
                    // everytime the context renders - that is, on every update which was triggered
                    config.context.addEventListener('update', updateListener);
                    this.renderOverlay(overlay);
                }
                if (positionStrategy) {
                    positionStrategy.update();
                }
                // if (focusTrap) {
                //     focusTrap.attach(overlay);
                // }
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
                const { updateListener, focusTrap, config } = this.registeredOverlays.get(overlay);
                if (config.template && config.context) {
                    config.context.removeEventListener('update', updateListener);
                }
                // if (focusTrap) {
                //     focusTrap.detach();
                // }
                // this.backdrop.hide();
            }
        }
        configureOverlay(overlay, config = {}) {
            console.log('configureOverlay()... ', overlay, config);
            const definition = {
                config: config,
                positionStrategy: this.createPositionStrategy(overlay, config),
                overlayTrigger: this.createOverlayTrigger(overlay, config),
                // focusTrap: this.createFocusTrap(overlay, config),
                updateListener: () => this.renderOverlay(overlay),
                openChangeListener: (event) => this.handleOpenChange(overlay, event),
                focusChangeListener: (event) => this.handleFocusChange(overlay, event),
                destroy: () => {
                    overlay.removeEventListener('open-changed', definition.openChangeListener);
                    // overlay.removeEventListener('focus-changed', definition.focusChangeListener as EventListener);
                    this.disposePositionStrategy(overlay);
                    this.disposeOverlayTrigger(overlay);
                    // this.disposeFocusTrap(overlay);
                }
            };
            overlay.addEventListener('open-changed', definition.openChangeListener);
            // overlay.addEventListener('focus-changed', definition.focusChangeListener as EventListener);
            return definition;
        }
        updateOverlayConfig(overlay, config = {}) {
            this._throwUnregiseredOverlay(overlay);
            const overlayDefinition = this.registeredOverlays.get(overlay);
            const overlayConfig = Object.assign(Object.assign({}, overlayDefinition.config), config);
            this.updatePositionStrategy(overlay, overlayConfig);
            this.updateOverlayTrigger(overlay, overlayConfig);
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
        updateOverlayTrigger(overlay, config) {
            const definition = this.registeredOverlays.get(overlay);
            const hasTypeChanged = config.triggerType !== definition.config.triggerType;
            const hasTriggerChanged = config.trigger !== definition.config.trigger;
            console.log('updateOverlayTrigger... type changed: %s, trigger changed: %s', hasTypeChanged, hasTriggerChanged);
            if (hasTriggerChanged || hasTypeChanged) {
                this.disposeOverlayTrigger(overlay);
                definition.overlayTrigger = this.createOverlayTrigger(overlay, config);
            }
        }
        createOverlayTrigger(overlay, config) {
            if (config.trigger && config.triggerType) {
                // const overlayTrigger = this.overlayTriggerFactory.createOverlayTrigger(config.triggerType, overlay);
                const overlayTrigger = new OverlayController(overlay, config);
                overlayTrigger.attach(document.querySelector(config.trigger));
                return overlayTrigger;
            }
        }
        disposeOverlayTrigger(overlay) {
            const definition = this.registeredOverlays.get(overlay);
            if (definition.overlayTrigger) {
                definition.overlayTrigger.detach();
                definition.overlayTrigger = undefined;
            }
        }
        updateFocusTrap() { }
        createFocusTrap(overlay, config) {
            if (config.trapFocus) {
                const focusTrapConfig = ['autoFocus', 'initialFocus', 'restoreFocus', 'wrapFocus'].reduce((previous, current) => {
                    if (config[current] !== undefined) {
                        previous[current] = config[current];
                    }
                    return previous;
                }, {});
                return new FocusTrap(focusTrapConfig);
            }
        }
        disposeFocusTrap(overlay) {
            const definition = this.registeredOverlays.get(overlay);
            if (definition.focusTrap) {
                definition.focusTrap.detach();
                definition.focusTrap = undefined;
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

    let OVERLAY_COUNTER = 0;
    function nextOverlayId() {
        return `partkit-overlay-${OVERLAY_COUNTER++}`;
    }
    let Overlay = class Overlay extends Component {
        constructor() {
            super(...arguments);
            // TODO: clean this up
            this._config = Object.assign(Object.assign({}, DEFAULT_FOCUS_TRAP_CONFIG), { trapFocus: true });
            this.isRegistered = false;
            this.overlayService = new OverlayService();
            this.open = false;
            this.tabindex = -1;
            this.triggerType = 'default';
            this.positionType = 'default';
            this.origin = 'viewport';
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
            if (!this.overlayService.hasOverlay(this)) {
                this.isRegistered = this.overlayService.registerOverlay(this, this.config);
                return;
            }
            this.id = this.id || nextOverlayId();
            this.role = 'dialog';
            super.connectedCallback();
        }
        disconnectedCallback() {
            // we remove the overlay from the overlay service when the overlay gets disconnected
            // however, during registration, the overlay will be moved to the document body, which
            // essentially removes and reattaches the overlay; during this time the overlay won't
            // be registered yet and we don't remove the overlay from the overlay service
            if (this.isRegistered) {
                this.overlayService.destroyOverlay(this, false);
            }
            super.disconnectedCallback();
        }
        updateCallback(changes, firstUpdate) {
            const config = {};
            OVERLAY_CONFIG_FIELDS.forEach(key => {
                if (changes.has(key))
                    config[key] = this[key];
            });
            if (Object.keys(config).length > 0) ;
        }
        hasFocus() {
            // TODO: should query overlay service to check for descendants with focus
        }
        show() {
            if (!this.open) {
                this.watch(() => this.open = true);
            }
        }
        hide() {
            if (this.open) {
                this.watch(() => this.open = false);
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
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Overlay.prototype, "origin", void 0);
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
                this.overlay = this.overlayService.createOverlay({ positionType: 'centered', template: template, context: this });
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

    <ui-overlay trigger="#overlay" position-type="connected" origin="#overlay" .config=${customOverlayConfig}>
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

    <ui-overlay trigger="#another-overlay" position-type="connected" origin="#another-overlay">
        <h3>Another Overlay</h3>
        <p>Just some static content...</p>
    </ui-overlay>

    <button id="overlay-programmatic" @click=${element.showOverlay}>Show programmatic overlay</button>

    <p>We have <a href="#" id="tooltip">tooltips</a> too...</p>

    <ui-overlay trigger="#tooltip" trigger-type="tooltip" position-type="connected" origin="#tooltip" .config=${tooltipOverlayConfig}>
        <p>I am the tooltip content.</p>
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL3N0cmluZy11dGlscy50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LWRlY2xhcmF0aW9uLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9pY29uL2ljb24udHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1oZWFkZXIudHMiLCJzcmMvaGVscGVycy9jb3B5cmlnaHQudHMiLCJzcmMvYWNjb3JkaW9uL2FjY29yZGlvbi1wYW5lbC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIiwic3JjL2FwcC5zdHlsZXMudHMiLCJzcmMvYXBwLnRlbXBsYXRlLnRzIiwic3JjL2NhcmQudHMiLCJzcmMvY2hlY2tib3gudHMiLCJzcmMvZXZlbnQtbWFuYWdlci50cyIsInNyYy9iZWhhdmlvci50cyIsInNyYy9vdmVybGF5L2ZvY3VzLW1vbml0b3IudHMiLCJzcmMvb3ZlcmxheS9mb2N1cy10cmFwLnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vb2Zmc2V0LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vYWxpZ25tZW50LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vc2l6ZS50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZy50cyIsInNyYy9vdmVybGF5L292ZXJsYXktY29uZmlnLnRzIiwic3JjL2RvbS50cyIsInNyYy9vdmVybGF5L292ZXJsYXktYmFja2Ryb3AudHMiLCJzcmMvb3ZlcmxheS9vdmVybGF5LXRyaWdnZXIudHMiLCJzcmMvb3ZlcmxheS9vdmVybGF5LXRyaWdnZXItZmFjdG9yeS50cyIsInNyYy9vdmVybGF5L3Bvc2l0aW9uL3Bvc2l0aW9uLnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3kudHMiLCJzcmMvb3ZlcmxheS9wb3NpdGlvbi9zdHJhdGVnaWVzL2NlbnRlcmVkLXBvc2l0aW9uLXN0cmF0ZWd5LnRzIiwic3JjL292ZXJsYXkvcG9zaXRpb24vc3RyYXRlZ2llcy9jb25uZWN0ZWQtcG9zaXRpb24tc3RyYXRlZ3kudHMiLCJzcmMvb3ZlcmxheS9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneS1mYWN0b3J5LnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS1jb250cm9sbGVyLnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS1zZXJ2aWNlLnRzIiwic3JjL292ZXJsYXkvb3ZlcmxheS50cyIsInNyYy9vdmVybGF5LWRlbW8udHMiLCJzcmMvdGFicy90YWIudHMiLCJzcmMvdGFicy90YWItbGlzdC50cyIsInNyYy90YWJzL3RhYi1wYW5lbC50cyIsInNyYy90b2dnbGUudHMiLCJzcmMvYXBwLnRzIiwibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5jb25zdCBkaXJlY3RpdmVzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogQnJhbmRzIGEgZnVuY3Rpb24gYXMgYSBkaXJlY3RpdmUgZmFjdG9yeSBmdW5jdGlvbiBzbyB0aGF0IGxpdC1odG1sIHdpbGwgY2FsbFxuICogdGhlIGZ1bmN0aW9uIGR1cmluZyB0ZW1wbGF0ZSByZW5kZXJpbmcsIHJhdGhlciB0aGFuIHBhc3NpbmcgYXMgYSB2YWx1ZS5cbiAqXG4gKiBBIF9kaXJlY3RpdmVfIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIFBhcnQgYXMgYW4gYXJndW1lbnQuIEl0IGhhcyB0aGVcbiAqIHNpZ25hdHVyZTogYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBfZmFjdG9yeV8gaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGFyZ3VtZW50cyBmb3IgZGF0YSBhbmRcbiAqIGNvbmZpZ3VyYXRpb24gYW5kIHJldHVybnMgYSBkaXJlY3RpdmUuIFVzZXJzIG9mIGRpcmVjdGl2ZSB1c3VhbGx5IHJlZmVyIHRvXG4gKiB0aGUgZGlyZWN0aXZlIGZhY3RvcnkgYXMgdGhlIGRpcmVjdGl2ZS4gRm9yIGV4YW1wbGUsIFwiVGhlIHJlcGVhdCBkaXJlY3RpdmVcIi5cbiAqXG4gKiBVc3VhbGx5IGEgdGVtcGxhdGUgYXV0aG9yIHdpbGwgaW52b2tlIGEgZGlyZWN0aXZlIGZhY3RvcnkgaW4gdGhlaXIgdGVtcGxhdGVcbiAqIHdpdGggcmVsZXZhbnQgYXJndW1lbnRzLCB3aGljaCB3aWxsIHRoZW4gcmV0dXJuIGEgZGlyZWN0aXZlIGZ1bmN0aW9uLlxuICpcbiAqIEhlcmUncyBhbiBleGFtcGxlIG9mIHVzaW5nIHRoZSBgcmVwZWF0KClgIGRpcmVjdGl2ZSBmYWN0b3J5IHRoYXQgdGFrZXMgYW5cbiAqIGFycmF5IGFuZCBhIGZ1bmN0aW9uIHRvIHJlbmRlciBhbiBpdGVtOlxuICpcbiAqIGBgYGpzXG4gKiBodG1sYDx1bD48JHtyZXBlYXQoaXRlbXMsIChpdGVtKSA9PiBodG1sYDxsaT4ke2l0ZW19PC9saT5gKX08L3VsPmBcbiAqIGBgYFxuICpcbiAqIFdoZW4gYHJlcGVhdGAgaXMgaW52b2tlZCwgaXQgcmV0dXJucyBhIGRpcmVjdGl2ZSBmdW5jdGlvbiB0aGF0IGNsb3NlcyBvdmVyXG4gKiBgaXRlbXNgIGFuZCB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uIFdoZW4gdGhlIG91dGVyIHRlbXBsYXRlIGlzIHJlbmRlcmVkLCB0aGVcbiAqIHJldHVybiBkaXJlY3RpdmUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIFBhcnQgZm9yIHRoZSBleHByZXNzaW9uLlxuICogYHJlcGVhdGAgdGhlbiBwZXJmb3JtcyBpdCdzIGN1c3RvbSBsb2dpYyB0byByZW5kZXIgbXVsdGlwbGUgaXRlbXMuXG4gKlxuICogQHBhcmFtIGYgVGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uLiBNdXN0IGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFcbiAqIGZ1bmN0aW9uIG9mIHRoZSBzaWduYXR1cmUgYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC4gVGhlIHJldHVybmVkIGZ1bmN0aW9uIHdpbGxcbiAqIGJlIGNhbGxlZCB3aXRoIHRoZSBwYXJ0IG9iamVjdC5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGltcG9ydCB7ZGlyZWN0aXZlLCBodG1sfSBmcm9tICdsaXQtaHRtbCc7XG4gKlxuICogY29uc3QgaW1tdXRhYmxlID0gZGlyZWN0aXZlKCh2KSA9PiAocGFydCkgPT4ge1xuICogICBpZiAocGFydC52YWx1ZSAhPT0gdikge1xuICogICAgIHBhcnQuc2V0VmFsdWUodilcbiAqICAgfVxuICogfSk7XG4gKi9cbmV4cG9ydCBjb25zdCBkaXJlY3RpdmUgPSAoZikgPT4gKCguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgZCA9IGYoLi4uYXJncyk7XG4gICAgZGlyZWN0aXZlcy5zZXQoZCwgdHJ1ZSk7XG4gICAgcmV0dXJuIGQ7XG59KTtcbmV4cG9ydCBjb25zdCBpc0RpcmVjdGl2ZSA9IChvKSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnZnVuY3Rpb24nICYmIGRpcmVjdGl2ZXMuaGFzKG8pO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcmVjdGl2ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIFRydWUgaWYgdGhlIGN1c3RvbSBlbGVtZW50cyBwb2x5ZmlsbCBpcyBpbiB1c2UuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NFUG9seWZpbGwgPSB3aW5kb3cuY3VzdG9tRWxlbWVudHMgIT09IHVuZGVmaW5lZCAmJlxuICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrICE9PVxuICAgICAgICB1bmRlZmluZWQ7XG4vKipcbiAqIFJlcGFyZW50cyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnRgIChpbmNsdXNpdmUpIHRvIGBlbmRgIChleGNsdXNpdmUpLFxuICogaW50byBhbm90aGVyIGNvbnRhaW5lciAoY291bGQgYmUgdGhlIHNhbWUgY29udGFpbmVyKSwgYmVmb3JlIGBiZWZvcmVgLiBJZlxuICogYGJlZm9yZWAgaXMgbnVsbCwgaXQgYXBwZW5kcyB0aGUgbm9kZXMgdG8gdGhlIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlcGFyZW50Tm9kZXMgPSAoY29udGFpbmVyLCBzdGFydCwgZW5kID0gbnVsbCwgYmVmb3JlID0gbnVsbCkgPT4ge1xuICAgIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzdGFydC5uZXh0U2libGluZztcbiAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShzdGFydCwgYmVmb3JlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbn07XG4vKipcbiAqIFJlbW92ZXMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0YCAoaW5jbHVzaXZlKSB0byBgZW5kYCAoZXhjbHVzaXZlKSwgZnJvbVxuICogYGNvbnRhaW5lcmAuXG4gKi9cbmV4cG9ydCBjb25zdCByZW1vdmVOb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsKSA9PiB7XG4gICAgd2hpbGUgKHN0YXJ0ICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IHN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3RhcnQpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSB7fTtcbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBOb2RlUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB3aXRoIGVtYmVkZGVkIHVuaXF1ZSBrZXkgdG8gYXZvaWQgY29sbGlzaW9uIHdpdGhcbiAqIHBvc3NpYmxlIHRleHQgaW4gdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY29uc3QgbWFya2VyID0gYHt7bGl0LSR7U3RyaW5nKE1hdGgucmFuZG9tKCkpLnNsaWNlKDIpfX19YDtcbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgdXNlZCB0ZXh0LXBvc2l0aW9ucywgbXVsdGktYmluZGluZyBhdHRyaWJ1dGVzLCBhbmRcbiAqIGF0dHJpYnV0ZXMgd2l0aCBtYXJrdXAtbGlrZSB0ZXh0IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vZGVNYXJrZXIgPSBgPCEtLSR7bWFya2VyfS0tPmA7XG5leHBvcnQgY29uc3QgbWFya2VyUmVnZXggPSBuZXcgUmVnRXhwKGAke21hcmtlcn18JHtub2RlTWFya2VyfWApO1xuLyoqXG4gKiBTdWZmaXggYXBwZW5kZWQgdG8gYWxsIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBUZW1wbGF0ZSB0aGF0IHRyYWNrcyB0aGUgbG9jYXRpb24gb2YgZHluYW1pYyBwYXJ0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBjb25zdCBub2Rlc1RvUmVtb3ZlID0gW107XG4gICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGVsZW1lbnQuY29udGVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfFRFWFR9ICovLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBsYXN0IGluZGV4IGFzc29jaWF0ZWQgd2l0aCBhIHBhcnQuIFdlIHRyeSB0byBkZWxldGVcbiAgICAgICAgLy8gdW5uZWNlc3Nhcnkgbm9kZXMsIGJ1dCB3ZSBuZXZlciB3YW50IHRvIGFzc29jaWF0ZSB0d28gZGlmZmVyZW50IHBhcnRzXG4gICAgICAgIC8vIHRvIHRoZSBzYW1lIGluZGV4LiBUaGV5IG11c3QgaGF2ZSBhIGNvbnN0YW50IG5vZGUgYmV0d2Vlbi5cbiAgICAgICAgbGV0IGxhc3RQYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGNvbnN0IHsgc3RyaW5ncywgdmFsdWVzOiB7IGxlbmd0aCB9IH0gPSByZXN1bHQ7XG4gICAgICAgIHdoaWxlIChwYXJ0SW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UndmUgZXhoYXVzdGVkIHRoZSBjb250ZW50IGluc2lkZSBhIG5lc3RlZCB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIGEgdGVtcGxhdGUgaW4gdGhlIHN0YWNrXG4gICAgICAgICAgICAgICAgLy8gLSBUaGUgd2Fsa2VyIHdpbGwgZmluZCBhIG5leHROb2RlIG91dHNpZGUgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgLyogTm9kZS5FTEVNRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IG5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBsZW5ndGggfSA9IGF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBlclxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTmFtZWROb2RlTWFwLFxuICAgICAgICAgICAgICAgICAgICAvLyBhdHRyaWJ1dGVzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSByZXR1cm5lZCBpbiBkb2N1bWVudCBvcmRlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gcGFydGljdWxhciwgRWRnZS9JRSBjYW4gcmV0dXJuIHRoZW0gb3V0IG9mIG9yZGVyLCBzbyB3ZSBjYW5ub3RcbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzdW1lIGEgY29ycmVzcG9uZGVuY2UgYmV0d2VlbiBwYXJ0IGluZGV4IGFuZCBhdHRyaWJ1dGUgaW5kZXguXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmRzV2l0aChhdHRyaWJ1dGVzW2ldLm5hbWUsIGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHRlbXBsYXRlIGxpdGVyYWwgc2VjdGlvbiBsZWFkaW5nIHVwIHRvIHRoZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhwcmVzc2lvbiBpbiB0aGlzIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nRm9yUGFydCA9IHN0cmluZ3NbcGFydEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHN0cmluZ0ZvclBhcnQpWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsbCBib3VuZCBhdHRyaWJ1dGVzIGhhdmUgaGFkIGEgc3VmZml4IGFkZGVkIGluXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZW1wbGF0ZVJlc3VsdCNnZXRIVE1MIHRvIG9wdCBvdXQgb2Ygc3BlY2lhbCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhbmRsaW5nLiBUbyBsb29rIHVwIHRoZSBhdHRyaWJ1dGUgdmFsdWUgd2UgYWxzbyBuZWVkIHRvIGFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN1ZmZpeC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZUxvb2t1cE5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkgKyBib3VuZEF0dHJpYnV0ZVN1ZmZpeDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVMb29rdXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRpY3MgPSBhdHRyaWJ1dGVWYWx1ZS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnYXR0cmlidXRlJywgaW5kZXgsIG5hbWUsIHN0cmluZ3M6IHN0YXRpY3MgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gc3RhdGljcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gbm9kZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbm9kZS5kYXRhO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmluZGV4T2YobWFya2VyKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5ncyA9IGRhdGEuc3BsaXQobWFya2VyUmVnZXgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2Ugbm9kZXMgYXJlIGFsc28gdXNlZCBhcyB0aGUgbWFya2VycyBmb3Igbm9kZSBwYXJ0c1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHMgPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ID0gY3JlYXRlTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggIT09IG51bGwgJiYgZW5kc1dpdGgobWF0Y2hbMl0sIGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyBtYXRjaFsxXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFsyXS5zbGljZSgwLCAtYm91bmRBdHRyaWJ1dGVTdWZmaXgubGVuZ3RoKSArIG1hdGNoWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaW5zZXJ0LCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXg6ICsraW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyB0ZXh0LCB3ZSBtdXN0IGluc2VydCBhIGNvbW1lbnQgdG8gbWFyayBvdXIgcGxhY2UuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHdlIGNhbiB0cnVzdCBpdCB3aWxsIHN0aWNrIGFyb3VuZCBhZnRlciBjbG9uaW5nLlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyaW5nc1tsYXN0SW5kZXhdID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSBzdHJpbmdzW2xhc3RJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHBhcnQgZm9yIGVhY2ggbWF0Y2ggZm91bmRcbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IGxhc3RJbmRleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIE5vZGUuQ09NTUVOVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZGF0YSA9PT0gbWFya2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGEgbmV3IG1hcmtlciBub2RlIHRvIGJlIHRoZSBzdGFydE5vZGUgb2YgdGhlIFBhcnQgaWYgYW55IG9mXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBmb2xsb3dpbmcgYXJlIHRydWU6XG4gICAgICAgICAgICAgICAgICAgIC8vICAqIFdlIGRvbid0IGhhdmUgYSBwcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gICogVGhlIHByZXZpb3VzU2libGluZyBpcyBhbHJlYWR5IHRoZSBzdGFydCBvZiBhIHByZXZpb3VzIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUucHJldmlvdXNTaWJsaW5nID09PSBudWxsIHx8IGluZGV4ID09PSBsYXN0UGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGFzdFBhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgbmV4dFNpYmxpbmcsIGtlZXAgdGhpcyBub2RlIHNvIHdlIGhhdmUgYW4gZW5kLlxuICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gcmVtb3ZlIGl0IHRvIHNhdmUgZnV0dXJlIGNvc3RzLlxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChpID0gbm9kZS5kYXRhLmluZGV4T2YobWFya2VyLCBpICsgMSkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBub2RlIGhhcyBhIGJpbmRpbmcgbWFya2VyIGluc2lkZSwgbWFrZSBhbiBpbmFjdGl2ZSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYmluZGluZyB3b24ndCB3b3JrLCBidXQgc3Vic2VxdWVudCBiaW5kaW5ncyB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogY29uc2lkZXIgd2hldGhlciBpdCdzIGV2ZW4gd29ydGggaXQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgYmluZGluZ3MgaW4gY29tbWVudHMgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogLTEgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgdGV4dCBiaW5kaW5nIG5vZGVzIGFmdGVyIHRoZSB3YWxrIHRvIG5vdCBkaXN0dXJiIHRoZSBUcmVlV2Fsa2VyXG4gICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlc1RvUmVtb3ZlKSB7XG4gICAgICAgICAgICBuLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobik7XG4gICAgICAgIH1cbiAgICB9XG59XG5jb25zdCBlbmRzV2l0aCA9IChzdHIsIHN1ZmZpeCkgPT4ge1xuICAgIGNvbnN0IGluZGV4ID0gc3RyLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGg7XG4gICAgcmV0dXJuIGluZGV4ID49IDAgJiYgc3RyLnNsaWNlKGluZGV4KSA9PT0gc3VmZml4O1xufTtcbmV4cG9ydCBjb25zdCBpc1RlbXBsYXRlUGFydEFjdGl2ZSA9IChwYXJ0KSA9PiBwYXJ0LmluZGV4ICE9PSAtMTtcbi8vIEFsbG93cyBgZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJylgIHRvIGJlIHJlbmFtZWQgZm9yIGFcbi8vIHNtYWxsIG1hbnVhbCBzaXplLXNhdmluZ3MuXG5leHBvcnQgY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4vKipcbiAqIFRoaXMgcmVnZXggZXh0cmFjdHMgdGhlIGF0dHJpYnV0ZSBuYW1lIHByZWNlZGluZyBhbiBhdHRyaWJ1dGUtcG9zaXRpb25cbiAqIGV4cHJlc3Npb24uIEl0IGRvZXMgdGhpcyBieSBtYXRjaGluZyB0aGUgc3ludGF4IGFsbG93ZWQgZm9yIGF0dHJpYnV0ZXNcbiAqIGFnYWluc3QgdGhlIHN0cmluZyBsaXRlcmFsIGRpcmVjdGx5IHByZWNlZGluZyB0aGUgZXhwcmVzc2lvbiwgYXNzdW1pbmcgdGhhdFxuICogdGhlIGV4cHJlc3Npb24gaXMgaW4gYW4gYXR0cmlidXRlLXZhbHVlIHBvc2l0aW9uLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjZWxlbWVudHMtYXR0cmlidXRlc1xuICpcbiAqIFwiIFxceDA5XFx4MGFcXHgwY1xceDBkXCIgYXJlIEhUTUwgc3BhY2UgY2hhcmFjdGVyczpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9pbmZyYXN0cnVjdHVyZS5odG1sI3NwYWNlLWNoYXJhY3RlcnNcbiAqXG4gKiBcIlxcMC1cXHgxRlxceDdGLVxceDlGXCIgYXJlIFVuaWNvZGUgY29udHJvbCBjaGFyYWN0ZXJzLCB3aGljaCBpbmNsdWRlcyBldmVyeVxuICogc3BhY2UgY2hhcmFjdGVyIGV4Y2VwdCBcIiBcIi5cbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSBjb250cm9sIGNoYXJhY3Rlciwgc3BhY2UgY2hhcmFjdGVyLCAoJyksXG4gKiAgICAoXCIpLCBcIj5cIiwgXCI9XCIsIG9yIFwiL1wiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5leHBvcnQgY29uc3QgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCA9IC8oWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0pKFteXFwwLVxceDFGXFx4N0YtXFx4OUYgXCInPj0vXSspKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKj1bIFxceDA5XFx4MGFcXHgwY1xceDBkXSooPzpbXiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiJ2A8Pj1dKnxcIlteXCJdKnwnW14nXSopKSQvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzQ0VQb2x5ZmlsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGlzVGVtcGxhdGVQYXJ0QWN0aXZlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIGEgYFRlbXBsYXRlYCB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byB0aGUgRE9NIGFuZCB1cGRhdGVkXG4gKiB3aXRoIG5ldyB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUluc3RhbmNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgcHJvY2Vzc29yLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX19wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICB1cGRhdGUodmFsdWVzKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX19wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2xvbmUoKSB7XG4gICAgICAgIC8vIFRoZXJlIGFyZSBhIG51bWJlciBvZiBzdGVwcyBpbiB0aGUgbGlmZWN5Y2xlIG9mIGEgdGVtcGxhdGUgaW5zdGFuY2Unc1xuICAgICAgICAvLyBET00gZnJhZ21lbnQ6XG4gICAgICAgIC8vICAxLiBDbG9uZSAtIGNyZWF0ZSB0aGUgaW5zdGFuY2UgZnJhZ21lbnRcbiAgICAgICAgLy8gIDIuIEFkb3B0IC0gYWRvcHQgaW50byB0aGUgbWFpbiBkb2N1bWVudFxuICAgICAgICAvLyAgMy4gUHJvY2VzcyAtIGZpbmQgcGFydCBtYXJrZXJzIGFuZCBjcmVhdGUgcGFydHNcbiAgICAgICAgLy8gIDQuIFVwZ3JhZGUgLSB1cGdyYWRlIGN1c3RvbSBlbGVtZW50c1xuICAgICAgICAvLyAgNS4gVXBkYXRlIC0gc2V0IG5vZGUsIGF0dHJpYnV0ZSwgcHJvcGVydHksIGV0Yy4sIHZhbHVlc1xuICAgICAgICAvLyAgNi4gQ29ubmVjdCAtIGNvbm5lY3QgdG8gdGhlIGRvY3VtZW50LiBPcHRpb25hbCBhbmQgb3V0c2lkZSBvZiB0aGlzXG4gICAgICAgIC8vICAgICBtZXRob2QuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGhhdmUgYSBmZXcgY29uc3RyYWludHMgb24gdGhlIG9yZGVyaW5nIG9mIHRoZXNlIHN0ZXBzOlxuICAgICAgICAvLyAgKiBXZSBuZWVkIHRvIHVwZ3JhZGUgYmVmb3JlIHVwZGF0aW5nLCBzbyB0aGF0IHByb3BlcnR5IHZhbHVlcyB3aWxsIHBhc3NcbiAgICAgICAgLy8gICAgdGhyb3VnaCBhbnkgcHJvcGVydHkgc2V0dGVycy5cbiAgICAgICAgLy8gICogV2Ugd291bGQgbGlrZSB0byBwcm9jZXNzIGJlZm9yZSB1cGdyYWRpbmcgc28gdGhhdCB3ZSdyZSBzdXJlIHRoYXQgdGhlXG4gICAgICAgIC8vICAgIGNsb25lZCBmcmFnbWVudCBpcyBpbmVydCBhbmQgbm90IGRpc3R1cmJlZCBieSBzZWxmLW1vZGlmeWluZyBET00uXG4gICAgICAgIC8vICAqIFdlIHdhbnQgY3VzdG9tIGVsZW1lbnRzIHRvIHVwZ3JhZGUgZXZlbiBpbiBkaXNjb25uZWN0ZWQgZnJhZ21lbnRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBHaXZlbiB0aGVzZSBjb25zdHJhaW50cywgd2l0aCBmdWxsIGN1c3RvbSBlbGVtZW50cyBzdXBwb3J0IHdlIHdvdWxkXG4gICAgICAgIC8vIHByZWZlciB0aGUgb3JkZXI6IENsb25lLCBQcm9jZXNzLCBBZG9wdCwgVXBncmFkZSwgVXBkYXRlLCBDb25uZWN0XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJ1dCBTYWZhcmkgZG9vZXMgbm90IGltcGxlbWVudCBDdXN0b21FbGVtZW50UmVnaXN0cnkjdXBncmFkZSwgc28gd2VcbiAgICAgICAgLy8gY2FuIG5vdCBpbXBsZW1lbnQgdGhhdCBvcmRlciBhbmQgc3RpbGwgaGF2ZSB1cGdyYWRlLWJlZm9yZS11cGRhdGUgYW5kXG4gICAgICAgIC8vIHVwZ3JhZGUgZGlzY29ubmVjdGVkIGZyYWdtZW50cy4gU28gd2UgaW5zdGVhZCBzYWNyaWZpY2UgdGhlXG4gICAgICAgIC8vIHByb2Nlc3MtYmVmb3JlLXVwZ3JhZGUgY29uc3RyYWludCwgc2luY2UgaW4gQ3VzdG9tIEVsZW1lbnRzIHYxIGVsZW1lbnRzXG4gICAgICAgIC8vIG11c3Qgbm90IG1vZGlmeSB0aGVpciBsaWdodCBET00gaW4gdGhlIGNvbnN0cnVjdG9yLiBXZSBzdGlsbCBoYXZlIGlzc3Vlc1xuICAgICAgICAvLyB3aGVuIGNvLWV4aXN0aW5nIHdpdGggQ0V2MCBlbGVtZW50cyBsaWtlIFBvbHltZXIgMSwgYW5kIHdpdGggcG9seWZpbGxzXG4gICAgICAgIC8vIHRoYXQgZG9uJ3Qgc3RyaWN0bHkgYWRoZXJlIHRvIHRoZSBuby1tb2RpZmljYXRpb24gcnVsZSBiZWNhdXNlIHNoYWRvd1xuICAgICAgICAvLyBET00sIHdoaWNoIG1heSBiZSBjcmVhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciwgaXMgZW11bGF0ZWQgYnkgYmVpbmcgcGxhY2VkXG4gICAgICAgIC8vIGluIHRoZSBsaWdodCBET00uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSByZXN1bHRpbmcgb3JkZXIgaXMgb24gbmF0aXZlIGlzOiBDbG9uZSwgQWRvcHQsIFVwZ3JhZGUsIFByb2Nlc3MsXG4gICAgICAgIC8vIFVwZGF0ZSwgQ29ubmVjdC4gZG9jdW1lbnQuaW1wb3J0Tm9kZSgpIHBlcmZvcm1zIENsb25lLCBBZG9wdCwgYW5kIFVwZ3JhZGVcbiAgICAgICAgLy8gaW4gb25lIHN0ZXAuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSBDdXN0b20gRWxlbWVudHMgdjEgcG9seWZpbGwgc3VwcG9ydHMgdXBncmFkZSgpLCBzbyB0aGUgb3JkZXIgd2hlblxuICAgICAgICAvLyBwb2x5ZmlsbGVkIGlzIHRoZSBtb3JlIGlkZWFsOiBDbG9uZSwgUHJvY2VzcywgQWRvcHQsIFVwZ3JhZGUsIFVwZGF0ZSxcbiAgICAgICAgLy8gQ29ubmVjdC5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpc0NFUG9seWZpbGwgP1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpIDpcbiAgICAgICAgICAgIGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZS5lbGVtZW50LmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMudGVtcGxhdGUucGFydHM7XG4gICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmUgbnVsbFxuICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGZyYWdtZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgICAgICBsZXQgcGFydDtcbiAgICAgICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCB0aGUgbm9kZXMgYW5kIHBhcnRzIG9mIGEgdGVtcGxhdGVcbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFydCA9IHBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICBpZiAoIWlzVGVtcGxhdGVQYXJ0QWN0aXZlKHBhcnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3BhcnRzLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2dyZXNzIHRoZSB0cmVlIHdhbGtlciB1bnRpbCB3ZSBmaW5kIG91ciBuZXh0IHBhcnQncyBub2RlLlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IG11bHRpcGxlIHBhcnRzIG1heSBzaGFyZSB0aGUgc2FtZSBub2RlIChhdHRyaWJ1dGUgcGFydHNcbiAgICAgICAgICAgIC8vIG9uIGEgc2luZ2xlIGVsZW1lbnQpLCBzbyB0aGlzIGxvb3AgbWF5IG5vdCBydW4gYXQgYWxsLlxuICAgICAgICAgICAgd2hpbGUgKG5vZGVJbmRleCA8IHBhcnQuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgobm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBleGhhdXN0ZWQgdGhlIGNvbnRlbnQgaW5zaWRlIGEgbmVzdGVkIHRlbXBsYXRlIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2Ugc3RpbGwgaGF2ZSBwYXJ0cyAodGhlIG91dGVyIGZvci1sb29wKSwgd2Uga25vdzpcbiAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBhIHRlbXBsYXRlIGluIHRoZSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZSB3YWxrZXIgd2lsbCBmaW5kIGEgbmV4dE5vZGUgb3V0c2lkZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXZSd2ZSBhcnJpdmVkIGF0IG91ciBwYXJ0J3Mgbm9kZS5cbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICdub2RlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnQgPSB0aGlzLnByb2Nlc3Nvci5oYW5kbGVUZXh0RXhwcmVzc2lvbih0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHBhcnQuaW5zZXJ0QWZ0ZXJOb2RlKG5vZGUucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19wYXJ0cy5wdXNoKC4uLnRoaXMucHJvY2Vzc29yLmhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKG5vZGUsIHBhcnQubmFtZSwgcGFydC5zdHJpbmdzLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NFUG9seWZpbGwpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkb3B0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICBjdXN0b21FbGVtZW50cy51cGdyYWRlKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtaW5zdGFuY2UuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBib3VuZEF0dHJpYnV0ZVN1ZmZpeCwgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCwgbWFya2VyLCBub2RlTWFya2VyIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5jb25zdCBjb21tZW50TWFya2VyID0gYCAke21hcmtlcn0gYDtcbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIGBodG1sYCwgd2hpY2ggaG9sZHMgYSBUZW1wbGF0ZSBhbmQgdGhlIHZhbHVlcyBmcm9tXG4gKiBpbnRlcnBvbGF0ZWQgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RyaW5ncywgdmFsdWVzLCB0eXBlLCBwcm9jZXNzb3IpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIEhUTUwgdXNlZCB0byBjcmVhdGUgYSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAgICAgKi9cbiAgICBnZXRIVE1MKCkge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5zdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIGxldCBpc0NvbW1lbnRCaW5kaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5zdHJpbmdzW2ldO1xuICAgICAgICAgICAgLy8gRm9yIGVhY2ggYmluZGluZyB3ZSB3YW50IHRvIGRldGVybWluZSB0aGUga2luZCBvZiBtYXJrZXIgdG8gaW5zZXJ0XG4gICAgICAgICAgICAvLyBpbnRvIHRoZSB0ZW1wbGF0ZSBzb3VyY2UgYmVmb3JlIGl0J3MgcGFyc2VkIGJ5IHRoZSBicm93c2VyJ3MgSFRNTFxuICAgICAgICAgICAgLy8gcGFyc2VyLiBUaGUgbWFya2VyIHR5cGUgaXMgYmFzZWQgb24gd2hldGhlciB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhblxuICAgICAgICAgICAgLy8gYXR0cmlidXRlLCB0ZXh0LCBvciBjb21tZW50IHBvaXNpdGlvbi5cbiAgICAgICAgICAgIC8vICAgKiBGb3Igbm9kZS1wb3NpdGlvbiBiaW5kaW5ncyB3ZSBpbnNlcnQgYSBjb21tZW50IHdpdGggdGhlIG1hcmtlclxuICAgICAgICAgICAgLy8gICAgIHNlbnRpbmVsIGFzIGl0cyB0ZXh0IGNvbnRlbnQsIGxpa2UgPCEtLXt7bGl0LWd1aWR9fS0tPi5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgYXR0cmlidXRlIGJpbmRpbmdzIHdlIGluc2VydCBqdXN0IHRoZSBtYXJrZXIgc2VudGluZWwgZm9yIHRoZVxuICAgICAgICAgICAgLy8gICAgIGZpcnN0IGJpbmRpbmcsIHNvIHRoYXQgd2Ugc3VwcG9ydCB1bnF1b3RlZCBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gICAgICAgICAgICAvLyAgICAgU3Vic2VxdWVudCBiaW5kaW5ncyBjYW4gdXNlIGEgY29tbWVudCBtYXJrZXIgYmVjYXVzZSBtdWx0aS1iaW5kaW5nXG4gICAgICAgICAgICAvLyAgICAgYXR0cmlidXRlcyBtdXN0IGJlIHF1b3RlZC5cbiAgICAgICAgICAgIC8vICAgKiBGb3IgY29tbWVudCBiaW5kaW5ncyB3ZSBpbnNlcnQganVzdCB0aGUgbWFya2VyIHNlbnRpbmVsIHNvIHdlIGRvbid0XG4gICAgICAgICAgICAvLyAgICAgY2xvc2UgdGhlIGNvbW1lbnQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGJ1dCBpcyAqbm90KiBhbiBIVE1MXG4gICAgICAgICAgICAvLyBwYXJzZXIuIFdlIGRvbid0IG5lZWQgdG8gdHJhY2sgdGhlIHRyZWUgc3RydWN0dXJlIG9mIHRoZSBIVE1MLCBvbmx5XG4gICAgICAgICAgICAvLyB3aGV0aGVyIGEgYmluZGluZyBpcyBpbnNpZGUgYSBjb21tZW50LCBhbmQgaWYgbm90LCBpZiBpdCBhcHBlYXJzIHRvIGJlXG4gICAgICAgICAgICAvLyB0aGUgZmlyc3QgYmluZGluZyBpbiBhbiBhdHRyaWJ1dGUuXG4gICAgICAgICAgICBjb25zdCBjb21tZW50T3BlbiA9IHMubGFzdEluZGV4T2YoJzwhLS0nKTtcbiAgICAgICAgICAgIC8vIFdlJ3JlIGluIGNvbW1lbnQgcG9zaXRpb24gaWYgd2UgaGF2ZSBhIGNvbW1lbnQgb3BlbiB3aXRoIG5vIGZvbGxvd2luZ1xuICAgICAgICAgICAgLy8gY29tbWVudCBjbG9zZS4gQmVjYXVzZSA8LS0gY2FuIGFwcGVhciBpbiBhbiBhdHRyaWJ1dGUgdmFsdWUgdGhlcmUgY2FuXG4gICAgICAgICAgICAvLyBiZSBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgICAgICAgICBpc0NvbW1lbnRCaW5kaW5nID0gKGNvbW1lbnRPcGVuID4gLTEgfHwgaXNDb21tZW50QmluZGluZykgJiZcbiAgICAgICAgICAgICAgICBzLmluZGV4T2YoJy0tPicsIGNvbW1lbnRPcGVuICsgMSkgPT09IC0xO1xuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UgcHJlY2VlZGluZyB0aGVcbiAgICAgICAgICAgIC8vIGV4cHJlc3Npb24uIFRoaXMgY2FuIG1hdGNoIFwibmFtZT12YWx1ZVwiIGxpa2Ugc3RydWN0dXJlcyBpbiB0ZXh0LFxuICAgICAgICAgICAgLy8gY29tbWVudHMsIGFuZCBhdHRyaWJ1dGUgdmFsdWVzLCBzbyB0aGVyZSBjYW4gYmUgZmFsc2UtcG9zaXRpdmVzLlxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBvbmx5IGluIHRoaXMgYnJhbmNoIGlmIHdlIGRvbid0IGhhdmUgYSBhdHRyaWJ1dGUtbGlrZVxuICAgICAgICAgICAgICAgIC8vIHByZWNlZWRpbmcgc2VxdWVuY2UuIEZvciBjb21tZW50cywgdGhpcyBndWFyZHMgYWdhaW5zdCB1bnVzdWFsXG4gICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlIHZhbHVlcyBsaWtlIDxkaXYgZm9vPVwiPCEtLSR7J2Jhcid9XCI+LiBDYXNlcyBsaWtlXG4gICAgICAgICAgICAgICAgLy8gPCEtLSBmb289JHsnYmFyJ30tLT4gYXJlIGhhbmRsZWQgY29ycmVjdGx5IGluIHRoZSBhdHRyaWJ1dGUgYnJhbmNoXG4gICAgICAgICAgICAgICAgLy8gYmVsb3cuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzICsgKGlzQ29tbWVudEJpbmRpbmcgPyBjb21tZW50TWFya2VyIDogbm9kZU1hcmtlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgYXR0cmlidXRlcyB3ZSB1c2UganVzdCBhIG1hcmtlciBzZW50aW5lbCwgYW5kIGFsc28gYXBwZW5kIGFcbiAgICAgICAgICAgICAgICAvLyAkbGl0JCBzdWZmaXggdG8gdGhlIG5hbWUgdG8gb3B0LW91dCBvZiBhdHRyaWJ1dGUtc3BlY2lmaWMgcGFyc2luZ1xuICAgICAgICAgICAgICAgIC8vIHRoYXQgSUUgYW5kIEVkZ2UgZG8gZm9yIHN0eWxlIGFuZCBjZXJ0YWluIFNWRyBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcy5zdWJzdHIoMCwgYXR0cmlidXRlTWF0Y2guaW5kZXgpICsgYXR0cmlidXRlTWF0Y2hbMV0gK1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVNYXRjaFsyXSArIGJvdW5kQXR0cmlidXRlU3VmZml4ICsgYXR0cmlidXRlTWF0Y2hbM10gK1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSB0aGlzLnN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGhpcy5nZXRIVE1MKCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgZm9yIFNWRyBmcmFnbWVudHMuXG4gKlxuICogVGhpcyBjbGFzcyB3cmFwcyBIVE1MIGluIGFuIGA8c3ZnPmAgdGFnIGluIG9yZGVyIHRvIHBhcnNlIGl0cyBjb250ZW50cyBpbiB0aGVcbiAqIFNWRyBuYW1lc3BhY2UsIHRoZW4gbW9kaWZpZXMgdGhlIHRlbXBsYXRlIHRvIHJlbW92ZSB0aGUgYDxzdmc+YCB0YWcgc28gdGhhdFxuICogY2xvbmVzIG9ubHkgY29udGFpbmVyIHRoZSBvcmlnaW5hbCBmcmFnbWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNWR1RlbXBsYXRlUmVzdWx0IGV4dGVuZHMgVGVtcGxhdGVSZXN1bHQge1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIHJldHVybiBgPHN2Zz4ke3N1cGVyLmdldEhUTUwoKX08L3N2Zz5gO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gc3VwZXIuZ2V0VGVtcGxhdGVFbGVtZW50KCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50O1xuICAgICAgICBjb25zdCBzdmdFbGVtZW50ID0gY29udGVudC5maXJzdENoaWxkO1xuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKHN2Z0VsZW1lbnQpO1xuICAgICAgICByZXBhcmVudE5vZGVzKGNvbnRlbnQsIHN2Z0VsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1yZXN1bHQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vcGFydC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vdGVtcGxhdGUtcmVzdWx0LmpzJztcbmltcG9ydCB7IGNyZWF0ZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAhKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSk7XG59O1xuZXhwb3J0IGNvbnN0IGlzSXRlcmFibGUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHxcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAhISh2YWx1ZSAmJiB2YWx1ZVtTeW1ib2wuaXRlcmF0b3JdKTtcbn07XG4vKipcbiAqIFdyaXRlcyBhdHRyaWJ1dGUgdmFsdWVzIHRvIHRoZSBET00gZm9yIGEgZ3JvdXAgb2YgQXR0cmlidXRlUGFydHMgYm91bmQgdG8gYVxuICogc2luZ2xlIGF0dGlidXRlLiBUaGUgdmFsdWUgaXMgb25seSBzZXQgb25jZSBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0c1xuICogZm9yIGFuIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRzW2ldID0gdGhpcy5fY3JlYXRlUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaW5nbGUgcGFydC4gT3ZlcnJpZGUgdGhpcyB0byBjcmVhdGUgYSBkaWZmZXJudCB0eXBlIG9mIHBhcnQuXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXR0cmlidXRlUGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHBhcnQudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHYpIHx8ICFpc0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdiA6IFN0cmluZyh2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdCBvZiB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB0ID09PSAnc3RyaW5nJyA/IHQgOiBTdHJpbmcodCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGV4dCArPSBzdHJpbmdzW2xdO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsIHRoaXMuX2dldFZhbHVlKCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBBIFBhcnQgdGhhdCBjb250cm9scyBhbGwgb3IgcGFydCBvZiBhbiBhdHRyaWJ1dGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihjb21taXR0ZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jb21taXR0ZXIgPSBjb21taXR0ZXI7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbm9DaGFuZ2UgJiYgKCFpc1ByaW1pdGl2ZSh2YWx1ZSkgfHwgdmFsdWUgIT09IHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgYSBub3QgYSBkaXJlY3RpdmUsIGRpcnR5IHRoZSBjb21taXR0ZXIgc28gdGhhdCBpdCdsbFxuICAgICAgICAgICAgLy8gY2FsbCBzZXRBdHRyaWJ1dGUuIElmIHRoZSB2YWx1ZSBpcyBhIGRpcmVjdGl2ZSwgaXQnbGwgZGlydHkgdGhlXG4gICAgICAgICAgICAvLyBjb21taXR0ZXIgaWYgaXQgY2FsbHMgc2V0VmFsdWUoKS5cbiAgICAgICAgICAgIGlmICghaXNEaXJlY3RpdmUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21taXR0ZXIuZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWl0dGVyLmNvbW1pdCgpO1xuICAgIH1cbn1cbi8qKlxuICogQSBQYXJ0IHRoYXQgY29udHJvbHMgYSBsb2NhdGlvbiB3aXRoaW4gYSBOb2RlIHRyZWUuIExpa2UgYSBSYW5nZSwgTm9kZVBhcnRcbiAqIGhhcyBzdGFydCBhbmQgZW5kIGxvY2F0aW9ucyBhbmQgY2FuIHNldCBhbmQgdXBkYXRlIHRoZSBOb2RlcyBiZXR3ZWVuIHRob3NlXG4gKiBsb2NhdGlvbnMuXG4gKlxuICogTm9kZVBhcnRzIHN1cHBvcnQgc2V2ZXJhbCB2YWx1ZSB0eXBlczogcHJpbWl0aXZlcywgTm9kZXMsIFRlbXBsYXRlUmVzdWx0cyxcbiAqIGFzIHdlbGwgYXMgYXJyYXlzIGFuZCBpdGVyYWJsZXMgb2YgdGhvc2UgdHlwZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlUGFydCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50byhjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBhZnRlciB0aGUgYHJlZmAgbm9kZSAoYmV0d2VlbiBgcmVmYCBhbmQgYHJlZmAncyBuZXh0XG4gICAgICogc2libGluZykuIEJvdGggYHJlZmAgYW5kIGl0cyBuZXh0IHNpYmxpbmcgbXVzdCBiZSBzdGF0aWMsIHVuY2hhbmdpbmcgbm9kZXNcbiAgICAgKiBzdWNoIGFzIHRob3NlIHRoYXQgYXBwZWFyIGluIGEgbGl0ZXJhbCBzZWN0aW9uIG9mIGEgdGVtcGxhdGUuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlck5vZGUocmVmKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gcmVmO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGludG8gYSBwYXJlbnQgcGFydC5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG9QYXJ0KHBhcnQpIHtcbiAgICAgICAgcGFydC5fX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgcGFydC5fX2luc2VydCh0aGlzLmVuZE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhpcyBwYXJ0IGFmdGVyIHRoZSBgcmVmYCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJQYXJ0KHJlZikge1xuICAgICAgICByZWYuX19pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5lbmROb2RlO1xuICAgICAgICByZWYuZW5kTm9kZSA9IHRoaXMuc3RhcnROb2RlO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX19wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbW1pdE5vZGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm90aGluZztcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19pbnNlcnQobm9kZSkge1xuICAgICAgICB0aGlzLmVuZE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgdGhpcy5lbmROb2RlKTtcbiAgICB9XG4gICAgX19jb21taXROb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5fX2luc2VydCh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX19jb21taXRUZXh0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZS5uZXh0U2libGluZztcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbiAgICAgICAgLy8gSWYgYHZhbHVlYCBpc24ndCBhbHJlYWR5IGEgc3RyaW5nLCB3ZSBleHBsaWNpdGx5IGNvbnZlcnQgaXQgaGVyZSBpbiBjYXNlXG4gICAgICAgIC8vIGl0IGNhbid0IGJlIGltcGxpY2l0bHkgY29udmVydGVkIC0gaS5lLiBpdCdzIGEgc3ltYm9sLlxuICAgICAgICBjb25zdCB2YWx1ZUFzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZW5kTm9kZS5wcmV2aW91c1NpYmxpbmcgJiZcbiAgICAgICAgICAgIG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIG9ubHkgaGF2ZSBhIHNpbmdsZSB0ZXh0IG5vZGUgYmV0d2VlbiB0aGUgbWFya2Vycywgd2UgY2FuIGp1c3RcbiAgICAgICAgICAgIC8vIHNldCBpdHMgdmFsdWUsIHJhdGhlciB0aGFuIHJlcGxhY2luZyBpdC5cbiAgICAgICAgICAgIC8vIFRPRE8oanVzdGluZmFnbmFuaSk6IENhbiB3ZSBqdXN0IGNoZWNrIGlmIHRoaXMudmFsdWUgaXMgcHJpbWl0aXZlP1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gdmFsdWVBc1N0cmluZztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19jb21taXROb2RlKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZhbHVlQXNTdHJpbmcpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGVGYWN0b3J5KHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICB0aGlzLnZhbHVlLnRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBwcm9wYWdhdGUgdGhlIHRlbXBsYXRlIHByb2Nlc3NvciBmcm9tIHRoZSBUZW1wbGF0ZVJlc3VsdFxuICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSB1c2UgaXRzIHN5bnRheCBleHRlbnNpb24sIGV0Yy4gVGhlIHRlbXBsYXRlIGZhY3RvcnkgY29tZXNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIHJlbmRlciBmdW5jdGlvbiBvcHRpb25zIHNvIHRoYXQgaXQgY2FuIGNvbnRyb2wgdGVtcGxhdGVcbiAgICAgICAgICAgIC8vIGNhY2hpbmcgYW5kIHByZXByb2Nlc3NpbmcuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlLCB2YWx1ZS5wcm9jZXNzb3IsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSgpO1xuICAgICAgICAgICAgaW5zdGFuY2UudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX19jb21taXRJdGVyYWJsZSh2YWx1ZSkge1xuICAgICAgICAvLyBGb3IgYW4gSXRlcmFibGUsIHdlIGNyZWF0ZSBhIG5ldyBJbnN0YW5jZVBhcnQgcGVyIGl0ZW0sIHRoZW4gc2V0IGl0c1xuICAgICAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAgICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgICAgIC8vIG9mIFRlbXBsYXRlUmVzdWx0cyB0aGF0IHdpbGwgYmUgY29tbW9ubHkgcmV0dXJuZWQgZnJvbSBleHByZXNzaW9ucyBsaWtlOlxuICAgICAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuICAgICAgICAvLyBJZiBfdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAgICAgLy8gaXRlcmFibGUgYW5kIF92YWx1ZSB3aWxsIGNvbnRhaW4gdGhlIE5vZGVQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyByZW5kZXIuIElmIF92YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgICAgICAvLyBhcnJheSBmb3IgTm9kZVBhcnRzLlxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAgICAgLy8gaXRlbXMgZnJvbSBhIHByZXZpb3VzIHJlbmRlclxuICAgICAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLnZhbHVlO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IGl0ZW1QYXJ0O1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byByZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAgICAgaWYgKGl0ZW1QYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpdGVtUGFydCA9IG5ldyBOb2RlUGFydCh0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0cy5wdXNoKGl0ZW1QYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAocGFydEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0LmFwcGVuZEludG9QYXJ0KHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuaW5zZXJ0QWZ0ZXJQYXJ0KGl0ZW1QYXJ0c1twYXJ0SW5kZXggLSAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbVBhcnQuc2V0VmFsdWUoaXRlbSk7XG4gICAgICAgICAgICBpdGVtUGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICAgICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgICAgICAgICAgdGhpcy5jbGVhcihpdGVtUGFydCAmJiBpdGVtUGFydC5lbmROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcihzdGFydE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSkge1xuICAgICAgICByZW1vdmVOb2Rlcyh0aGlzLnN0YXJ0Tm9kZS5wYXJlbnROb2RlLCBzdGFydE5vZGUubmV4dFNpYmxpbmcsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxufVxuLyoqXG4gKiBJbXBsZW1lbnRzIGEgYm9vbGVhbiBhdHRyaWJ1dGUsIHJvdWdobHkgYXMgZGVmaW5lZCBpbiB0aGUgSFRNTFxuICogc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBJZiB0aGUgdmFsdWUgaXMgdHJ1dGh5LCB0aGVuIHRoZSBhdHRyaWJ1dGUgaXMgcHJlc2VudCB3aXRoIGEgdmFsdWUgb2ZcbiAqICcnLiBJZiB0aGUgdmFsdWUgaXMgZmFsc2V5LCB0aGUgYXR0cmlidXRlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb29sZWFuQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggIT09IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm9vbGVhbiBhdHRyaWJ1dGVzIGNhbiBvbmx5IGNvbnRhaW4gYSBzaW5nbGUgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX19wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSAhIXRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgfVxufVxuLyoqXG4gKiBTZXRzIGF0dHJpYnV0ZSB2YWx1ZXMgZm9yIFByb3BlcnR5UGFydHMsIHNvIHRoYXQgdGhlIHZhbHVlIGlzIG9ubHkgc2V0IG9uY2VcbiAqIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhcnRzIGZvciBhIHByb3BlcnR5LlxuICpcbiAqIElmIGFuIGV4cHJlc3Npb24gY29udHJvbHMgdGhlIHdob2xlIHByb3BlcnR5IHZhbHVlLCB0aGVuIHRoZSB2YWx1ZSBpcyBzaW1wbHlcbiAqIGFzc2lnbmVkIHRvIHRoZSBwcm9wZXJ0eSB1bmRlciBjb250cm9sLiBJZiB0aGVyZSBhcmUgc3RyaW5nIGxpdGVyYWxzIG9yXG4gKiBtdWx0aXBsZSBleHByZXNzaW9ucywgdGhlbiB0aGUgc3RyaW5ncyBhcmUgZXhwcmVzc2lvbnMgYXJlIGludGVycG9sYXRlZCBpbnRvXG4gKiBhIHN0cmluZyBmaXJzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3BlcnR5Q29tbWl0dGVyIGV4dGVuZHMgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICB0aGlzLnNpbmdsZSA9XG4gICAgICAgICAgICAoc3RyaW5ncy5sZW5ndGggPT09IDIgJiYgc3RyaW5nc1swXSA9PT0gJycgJiYgc3RyaW5nc1sxXSA9PT0gJycpO1xuICAgIH1cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVBhcnQodGhpcyk7XG4gICAgfVxuICAgIF9nZXRWYWx1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJ0c1swXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuX2dldFZhbHVlKCk7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudFt0aGlzLm5hbWVdID0gdGhpcy5fZ2V0VmFsdWUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbn1cbi8vIERldGVjdCBldmVudCBsaXN0ZW5lciBvcHRpb25zIHN1cHBvcnQuIElmIHRoZSBgY2FwdHVyZWAgcHJvcGVydHkgaXMgcmVhZFxuLy8gZnJvbSB0aGUgb3B0aW9ucyBvYmplY3QsIHRoZW4gb3B0aW9ucyBhcmUgc3VwcG9ydGVkLiBJZiBub3QsIHRoZW4gdGhlIHRocmlkXG4vLyBhcmd1bWVudCB0byBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lciBpcyBpbnRlcnByZXRlZCBhcyB0aGUgYm9vbGVhbiBjYXB0dXJlXG4vLyB2YWx1ZSBzbyB3ZSBzaG91bGQgb25seSBwYXNzIHRoZSBgY2FwdHVyZWAgcHJvcGVydHkuXG5sZXQgZXZlbnRPcHRpb25zU3VwcG9ydGVkID0gZmFsc2U7XG50cnkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGdldCBjYXB0dXJlKCkge1xuICAgICAgICAgICAgZXZlbnRPcHRpb25zU3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0Jywgb3B0aW9ucywgb3B0aW9ucyk7XG59XG5jYXRjaCAoX2UpIHtcbn1cbmV4cG9ydCBjbGFzcyBFdmVudFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRDb250ZXh0KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmV2ZW50Q29udGV4dCA9IGV2ZW50Q29udGV4dDtcbiAgICAgICAgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQgPSAoZSkgPT4gdGhpcy5oYW5kbGVFdmVudChlKTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdMaXN0ZW5lciA9IHRoaXMuX19wZW5kaW5nVmFsdWU7XG4gICAgICAgIGNvbnN0IG9sZExpc3RlbmVyID0gdGhpcy52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2hvdWxkUmVtb3ZlTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciA9PSBudWxsIHx8XG4gICAgICAgICAgICBvbGRMaXN0ZW5lciAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgKG5ld0xpc3RlbmVyLmNhcHR1cmUgIT09IG9sZExpc3RlbmVyLmNhcHR1cmUgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIub25jZSAhPT0gb2xkTGlzdGVuZXIub25jZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5wYXNzaXZlICE9PSBvbGRMaXN0ZW5lci5wYXNzaXZlKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkQWRkTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciAhPSBudWxsICYmIChvbGRMaXN0ZW5lciA9PSBudWxsIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcbiAgICAgICAgaWYgKHNob3VsZFJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQsIHRoaXMuX19vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX19vcHRpb25zID0gZ2V0T3B0aW9ucyhuZXdMaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fX2JvdW5kSGFuZGxlRXZlbnQsIHRoaXMuX19vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gbmV3TGlzdGVuZXI7XG4gICAgICAgIHRoaXMuX19wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmNhbGwodGhpcy5ldmVudENvbnRleHQgfHwgdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIFdlIGNvcHkgb3B0aW9ucyBiZWNhdXNlIG9mIHRoZSBpbmNvbnNpc3RlbnQgYmVoYXZpb3Igb2YgYnJvd3NlcnMgd2hlbiByZWFkaW5nXG4vLyB0aGUgdGhpcmQgYXJndW1lbnQgb2YgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuIElFMTEgZG9lc24ndCBzdXBwb3J0IG9wdGlvbnNcbi8vIGF0IGFsbC4gQ2hyb21lIDQxIG9ubHkgcmVhZHMgYGNhcHR1cmVgIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBvYmplY3QuXG5jb25zdCBnZXRPcHRpb25zID0gKG8pID0+IG8gJiZcbiAgICAoZXZlbnRPcHRpb25zU3VwcG9ydGVkID9cbiAgICAgICAgeyBjYXB0dXJlOiBvLmNhcHR1cmUsIHBhc3NpdmU6IG8ucGFzc2l2ZSwgb25jZTogby5vbmNlIH0gOlxuICAgICAgICBvLmNhcHR1cmUpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydHMuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIgfSBmcm9tICcuL3BhcnRzLmpzJztcbi8qKlxuICogQ3JlYXRlcyBQYXJ0cyB3aGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGFuIGF0dHJpYnV0ZS1wb3NpdGlvbiBiaW5kaW5nLCBnaXZlbiB0aGUgZXZlbnQsIGF0dHJpYnV0ZVxuICAgICAqIG5hbWUsIGFuZCBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBiaW5kaW5nXG4gICAgICogQHBhcmFtIG5hbWUgIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAqIEBwYXJhbSBzdHJpbmdzIFRoZSBzdHJpbmcgbGl0ZXJhbHMuIFRoZXJlIGFyZSBhbHdheXMgYXQgbGVhc3QgdHdvIHN0cmluZ3MsXG4gICAgICogICBldmVudCBmb3IgZnVsbHktY29udHJvbGxlZCBiaW5kaW5ncyB3aXRoIGEgc2luZ2xlIGV4cHJlc3Npb24uXG4gICAgICovXG4gICAgaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMoZWxlbWVudCwgbmFtZSwgc3RyaW5ncywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBuYW1lWzBdO1xuICAgICAgICBpZiAocHJlZml4ID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1pdHRlciA9IG5ldyBQcm9wZXJ0eUNvbW1pdHRlcihlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKTtcbiAgICAgICAgICAgIHJldHVybiBjb21taXR0ZXIucGFydHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJ0AnKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBFdmVudFBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgb3B0aW9ucy5ldmVudENvbnRleHQpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnPycpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21taXR0ZXIgPSBuZXcgQXR0cmlidXRlQ29tbWl0dGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICByZXR1cm4gY29tbWl0dGVyLnBhcnRzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGEgdGV4dC1wb3NpdGlvbiBiaW5kaW5nLlxuICAgICAqIEBwYXJhbSB0ZW1wbGF0ZUZhY3RvcnlcbiAgICAgKi9cbiAgICBoYW5kbGVUZXh0RXhwcmVzc2lvbihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZVBhcnQob3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciA9IG5ldyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlZmF1bHQtdGVtcGxhdGUtcHJvY2Vzc29yLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IG1hcmtlciwgVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogVGhlIGRlZmF1bHQgVGVtcGxhdGVGYWN0b3J5IHdoaWNoIGNhY2hlcyBUZW1wbGF0ZXMga2V5ZWQgb25cbiAqIHJlc3VsdC50eXBlIGFuZCByZXN1bHQuc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlRmFjdG9yeShyZXN1bHQpIHtcbiAgICBsZXQgdGVtcGxhdGVDYWNoZSA9IHRlbXBsYXRlQ2FjaGVzLmdldChyZXN1bHQudHlwZSk7XG4gICAgaWYgKHRlbXBsYXRlQ2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlID0ge1xuICAgICAgICAgICAgc3RyaW5nc0FycmF5OiBuZXcgV2Vha01hcCgpLFxuICAgICAgICAgICAga2V5U3RyaW5nOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICAgICAgdGVtcGxhdGVDYWNoZXMuc2V0KHJlc3VsdC50eXBlLCB0ZW1wbGF0ZUNhY2hlKTtcbiAgICB9XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuZ2V0KHJlc3VsdC5zdHJpbmdzKTtcbiAgICBpZiAodGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuICAgIC8vIElmIHRoZSBUZW1wbGF0ZVN0cmluZ3NBcnJheSBpcyBuZXcsIGdlbmVyYXRlIGEga2V5IGZyb20gdGhlIHN0cmluZ3NcbiAgICAvLyBUaGlzIGtleSBpcyBzaGFyZWQgYmV0d2VlbiBhbGwgdGVtcGxhdGVzIHdpdGggaWRlbnRpY2FsIGNvbnRlbnRcbiAgICBjb25zdCBrZXkgPSByZXN1bHQuc3RyaW5ncy5qb2luKG1hcmtlcik7XG4gICAgLy8gQ2hlY2sgaWYgd2UgYWxyZWFkeSBoYXZlIGEgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLmtleVN0cmluZy5nZXQoa2V5KTtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIG5vdCBzZWVuIHRoaXMga2V5IGJlZm9yZSwgY3JlYXRlIGEgbmV3IFRlbXBsYXRlXG4gICAgICAgIHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCwgcmVzdWx0LmdldFRlbXBsYXRlRWxlbWVudCgpKTtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgICAgICB0ZW1wbGF0ZUNhY2hlLmtleVN0cmluZy5zZXQoa2V5LCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8vIENhY2hlIGFsbCBmdXR1cmUgcXVlcmllcyBmb3IgdGhpcyBUZW1wbGF0ZVN0cmluZ3NBcnJheVxuICAgIHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LnNldChyZXN1bHQuc3RyaW5ncywgdGVtcGxhdGUpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbn1cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZUNhY2hlcyA9IG5ldyBNYXAoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLWZhY3RvcnkuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgTm9kZVBhcnQgfSBmcm9tICcuL3BhcnRzLmpzJztcbmltcG9ydCB7IHRlbXBsYXRlRmFjdG9yeSB9IGZyb20gJy4vdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgY29uc3QgcGFydHMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBSZW5kZXJzIGEgdGVtcGxhdGUgcmVzdWx0IG9yIG90aGVyIHZhbHVlIHRvIGEgY29udGFpbmVyLlxuICpcbiAqIFRvIHVwZGF0ZSBhIGNvbnRhaW5lciB3aXRoIG5ldyB2YWx1ZXMsIHJlZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGxpdGVyYWwgYW5kXG4gKiBjYWxsIGByZW5kZXJgIHdpdGggdGhlIG5ldyByZXN1bHQuXG4gKlxuICogQHBhcmFtIHJlc3VsdCBBbnkgdmFsdWUgcmVuZGVyYWJsZSBieSBOb2RlUGFydCAtIHR5cGljYWxseSBhIFRlbXBsYXRlUmVzdWx0XG4gKiAgICAgY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnIGxpa2UgYGh0bWxgIG9yIGBzdmdgLlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBwYXJlbnQgdG8gcmVuZGVyIHRvLiBUaGUgZW50aXJlIGNvbnRlbnRzIGFyZSBlaXRoZXJcbiAqICAgICByZXBsYWNlZCwgb3IgZWZmaWNpZW50bHkgdXBkYXRlZCBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXMgcHJldmlvdXNcbiAqICAgICByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFJlbmRlck9wdGlvbnMgZm9yIHRoZSBlbnRpcmUgcmVuZGVyIHRyZWUgcmVuZGVyZWQgdG8gdGhpc1xuICogICAgIGNvbnRhaW5lci4gUmVuZGVyIG9wdGlvbnMgbXVzdCAqbm90KiBjaGFuZ2UgYmV0d2VlbiByZW5kZXJzIHRvIHRoZSBzYW1lXG4gKiAgICAgY29udGFpbmVyLCBhcyB0aG9zZSBjaGFuZ2VzIHdpbGwgbm90IGVmZmVjdCBwcmV2aW91c2x5IHJlbmRlcmVkIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChyZXN1bHQsIGNvbnRhaW5lciwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBwYXJ0ID0gcGFydHMuZ2V0KGNvbnRhaW5lcik7XG4gICAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW1vdmVOb2Rlcyhjb250YWluZXIsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgcGFydHMuc2V0KGNvbnRhaW5lciwgcGFydCA9IG5ldyBOb2RlUGFydChPYmplY3QuYXNzaWduKHsgdGVtcGxhdGVGYWN0b3J5IH0sIG9wdGlvbnMpKSk7XG4gICAgICAgIHBhcnQuYXBwZW5kSW50byhjb250YWluZXIpO1xuICAgIH1cbiAgICBwYXJ0LnNldFZhbHVlKHJlc3VsdCk7XG4gICAgcGFydC5jb21taXQoKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXIuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKlxuICogTWFpbiBsaXQtaHRtbCBtb2R1bGUuXG4gKlxuICogTWFpbiBleHBvcnRzOlxuICpcbiAqIC0gIFtbaHRtbF1dXG4gKiAtICBbW3N2Z11dXG4gKiAtICBbW3JlbmRlcl1dXG4gKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICogQHByZWZlcnJlZFxuICovXG4vKipcbiAqIERvIG5vdCByZW1vdmUgdGhpcyBjb21tZW50OyBpdCBrZWVwcyB0eXBlZG9jIGZyb20gbWlzcGxhY2luZyB0aGUgbW9kdWxlXG4gKiBkb2NzLlxuICovXG5pbXBvcnQgeyBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5pbXBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5leHBvcnQgeyBkaXJlY3RpdmUsIGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9saWIvZGlyZWN0aXZlLmpzJztcbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IHJlbW92ZSBsaW5lIHdoZW4gd2UgZ2V0IE5vZGVQYXJ0IG1vdmluZyBtZXRob2RzXG5leHBvcnQgeyByZW1vdmVOb2RlcywgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vbGliL2RvbS5qcyc7XG5leHBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vbGliL3BhcnQuanMnO1xuZXhwb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBBdHRyaWJ1dGVQYXJ0LCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBpc0l0ZXJhYmxlLCBpc1ByaW1pdGl2ZSwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyLCBQcm9wZXJ0eVBhcnQgfSBmcm9tICcuL2xpYi9wYXJ0cy5qcyc7XG5leHBvcnQgeyBwYXJ0cywgcmVuZGVyIH0gZnJvbSAnLi9saWIvcmVuZGVyLmpzJztcbmV4cG9ydCB7IHRlbXBsYXRlQ2FjaGVzLCB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5leHBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgY3JlYXRlTWFya2VyLCBpc1RlbXBsYXRlUGFydEFjdGl2ZSwgVGVtcGxhdGUgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS5qcyc7XG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogaW5qZWN0IHZlcnNpb24gbnVtYmVyIGF0IGJ1aWxkIHRpbWVcbih3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddIHx8ICh3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddID0gW10pKS5wdXNoKCcxLjEuMicpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBIVE1MIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnaHRtbCcsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgU1ZHVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnc3ZnJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1odG1sLmpzLm1hcCIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuLi9jb21wb25lbnRcIjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHkgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlTWFwcGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQsIFQgPSBhbnk+ID0gKHRoaXM6IEMsIHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiBUIHwgbnVsbDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBtYXAgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlNYXBwZXI8QyBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudCwgVCA9IGFueT4gPSAodGhpczogQywgdmFsdWU6IFQgfCBudWxsKSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEFuIG9iamVjdCB0aGF0IGhvbGRzIGFuIHtAbGluayBBdHRyaWJ1dGVNYXBwZXJ9IGFuZCBhIHtAbGluayBQcm9wZXJ0eU1hcHBlcn1cbiAqXG4gKiBAcmVtYXJrc1xuICogRm9yIHRoZSBtb3N0IGNvbW1vbiB0eXBlcywgYSBjb252ZXJ0ZXIgZXhpc3RzIHdoaWNoIGNhbiBiZSByZWZlcmVuY2VkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0uXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gKlxuICogICAgICBAcHJvcGVydHkoe1xuICogICAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ29udmVydGVyPEMgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQsIFQgPSBhbnk+IHtcbiAgICB0b0F0dHJpYnV0ZTogUHJvcGVydHlNYXBwZXI8QywgVD47XG4gICAgZnJvbUF0dHJpYnV0ZTogQXR0cmlidXRlTWFwcGVyPEMsIFQ+O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBjb252ZXJ0ZXJcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhpcyBjb252ZXJ0ZXIgaXMgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb252ZXJ0ZXIgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHVubGVzcyBhIGRpZmZlcmVudCBvbmVcbiAqIGlzIHNwZWNpZmllZC4gVGhlIGNvbnZlcnRlciB0cmllcyB0byBpbmZlciB0aGUgcHJvcGVydHkgdHlwZSB3aGVuIGNvbnZlcnRpbmcgdG8gYXR0cmlidXRlcyBhbmRcbiAqIHVzZXMgYEpTT04ucGFyc2UoKWAgd2hlbiBjb252ZXJ0aW5nIHN0cmluZ3MgZnJvbSBhdHRyaWJ1dGVzLiBJZiBgSlNPTi5wYXJzZSgpYCB0aHJvd3MgYW4gZXJyb3IsXG4gKiB0aGUgY29udmVydGVyIHdpbGwgdXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0OiBBdHRyaWJ1dGVDb252ZXJ0ZXIgPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCBzdWNjZXNzZnVsbHkgcGFyc2UgYGJvb2xlYW5gLCBgbnVtYmVyYCBhbmQgYEpTT04uc3RyaW5naWZ5YCdkIHZhbHVlc1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0IHRocm93cywgaXQgbWVhbnMgd2UncmUgcHJvYmFibHkgZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgfSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG51bWJlciwgYmlnaW50LCBzeW1ib2wsIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBhdHRyaWJ1dGVzLCBsaWtlIGBkaXNhYmxlZGAsIHdoaWNoIGFyZSBjb25zaWRlcmVkIHRydWUgaWYgdGhleSBhcmUgc2V0IHdpdGhcbiAqIGFueSB2YWx1ZSBhdCBhbGwuIEluIG9yZGVyIHRvIHNldCB0aGUgYXR0cmlidXRlIHRvIGZhbHNlLCB0aGUgYXR0cmlidXRlIGhhcyB0byBiZSByZW1vdmVkIGJ5XG4gKiBzZXR0aW5nIHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gYG51bGxgLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgYm9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgIT09IG51bGwpLFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGJvb2xlYW4gfCBudWxsKSA9PiB2YWx1ZSA/ICcnIDogbnVsbFxufVxuXG4vKipcbiAqIEhhbmRsZXMgYm9vbGVhbiBBUklBIGF0dHJpYnV0ZXMsIGxpa2UgYGFyaWEtY2hlY2tlZGAgb3IgYGFyaWEtc2VsZWN0ZWRgLCB3aGljaCBoYXZlIHRvIGJlXG4gKiBzZXQgZXhwbGljaXRseSB0byBgdHJ1ZWAgb3IgYGZhbHNlYC5cbiAqL1xuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWUpID0+IHZhbHVlID09PSAndHJ1ZScsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgc3RyaW5nPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogdmFsdWUsXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdmFsdWVcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlcjogQXR0cmlidXRlQ29udmVydGVyPENvbXBvbmVudCwgbnVtYmVyPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogTnVtYmVyKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJPYmplY3Q6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxDb21wb25lbnQsIGFueVtdPiA9IHtcbiAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgPyBudWxsIDogSlNPTi5wYXJzZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IGFueVtdIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn07XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEYXRlOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Q29tcG9uZW50LCBEYXRlPiA9IHtcbiAgICAvLyBgbmV3IERhdGUoKWAgd2lsbCByZXR1cm4gYW4gYEludmFsaWQgRGF0ZWAgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBuZXcgRGF0ZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IERhdGUgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBzZWxlY3RvciBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzZWxlY3RvciB3aWxsIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB3aXRoIHRoZSBicm93c2VyJ3NcbiAgICAgKiB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEkuIElmIG5vIHNlbGVjdG9yIGlzIHNwZWNpZmllZCwgdGhlIGNvbXBvbmVudCBjbGFzc1xuICAgICAqIG5lZWRzIHRvIHByb3ZpZGUgb25lIGluIGl0cyBzdGF0aWMge0BsaW5rIENvbXBvbmVudC5zZWxlY3Rvcn0gcHJvcGVydHkuXG4gICAgICogQSBzZWxlY3RvciBkZWZpbmVkIGluIHRoZSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlXG4gICAgICogc3RhdGljIGNsYXNzIHByb3BlcnR5LlxuICAgICAqL1xuICAgIHNlbGVjdG9yOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogVXNlIFNoYWRvdyBET00gdG8gcmVuZGVyIHRoZSBjb21wb25lbnRzIHRlbXBsYXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBTaGFkb3cgRE9NIGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgICogY29tcG9uZW50J3MgdGVtcGxhdGUgd2lsbCBiZSByZW5kZXJlZCBhcyBjaGlsZCBub2RlcyBvZiB0aGUgY29tcG9uZW50LiBUaGlzIGNhbiBiZVxuICAgICAqIHVzZWZ1bCBpZiBhbiBpc29sYXRlZCBET00gYW5kIHNjb3BlZCBDU1MgaXMgbm90IGRlc2lyZWQuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBzaGFkb3c6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSByZWdpc3RlciB0aGUgY29tcG9uZW50IHdpdGggdGhlIGJyb3dzZXIncyB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluIGNhc2VzIHdoZXJlIHlvdSB3YW50IHRvIGVtcGxveSBhIG1vZHVsZSBzeXN0ZW0gd2hpY2ggcmVnaXN0ZXJzIGNvbXBvbmVudHMgb24gYVxuICAgICAqIGNvbmRpdGlvbmFsIGJhc2lzLCB5b3UgY2FuIGRpc2FibGUgYXV0b21hdGljIHJlZ2lzdHJhdGlvbiBieSBzZXR0aW5nIHRoaXMgb3B0aW9uIHRvIGBmYWxzZWAuXG4gICAgICogWW91ciBtb2R1bGUgb3IgYm9vdHN0cmFwIHN5c3RlbSB3aWxsIGhhdmUgdG8gdGFrZSBjYXJlIG9mIGRlZmluaW5nIHRoZSBjb21wb25lbnQgbGF0ZXIuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBkZWZpbmU6IGJvb2xlYW47XG4gICAgLy8gVE9ETzogdGVzdCBtZWRpYSBxdWVyaWVzXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBBbiBhcnJheSBvZiBDU1MgcnVsZXNldHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9TeW50YXgjQ1NTX3J1bGVzZXRzKS5cbiAgICAgKiBTdHlsZXMgZGVmaW5lZCB1c2luZyB0aGUgZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggc3R5bGVzIGRlZmluZWQgaW4gdGhlIGNvbXBvbmVudCdzXG4gICAgICogc3RhdGljIHtAbGluayBDb21wb25lbnQuc3R5bGVzfSBnZXR0ZXIuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzdHlsZXM6IFtcbiAgICAgKiAgICAgICAgICAnaDEsIGgyIHsgZm9udC1zaXplOiAxNnB0OyB9JyxcbiAgICAgKiAgICAgICAgICAnQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogOTAwcHgpIHsgYXJ0aWNsZSB7IHBhZGRpbmc6IDFyZW0gM3JlbTsgfSB9J1xuICAgICAqICAgICAgXVxuICAgICAqIH0pXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdW5kZWZpbmVkYFxuICAgICAqL1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIC8vIFRPRE86IHVwZGF0ZSBkb2N1bWVudGF0aW9uXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHtAbGluayAjbGl0LWh0bWwuVGVtcGxhdGVSZXN1bHR9LiBUaGUgZnVuY3Rpb24ncyBgZWxlbWVudGBcbiAgICAgKiBwYXJhbWV0ZXIgd2lsbCBiZSB0aGUgY3VycmVudCBjb21wb25lbnQgaW5zdGFuY2UuIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIGJ5IHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHJlbmRlciBtZXRob2QuXG4gICAgICpcbiAgICAgKiBUaGUgbWV0aG9kIG11c3QgcmV0dXJuIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB3aGljaCBpcyBjcmVhdGVkIHVzaW5nIGxpdC1odG1sJ3NcbiAgICAgKiB7QGxpbmsgbGl0LWh0bWwjaHRtbCB8IGBodG1sYH0gb3Ige0BsaW5rIGxpdC1odG1sI3N2ZyB8IGBzdmdgfSB0ZW1wbGF0ZSBtZXRob2RzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHVuZGVmaW5lZGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBjb21wb25lbnQgaW5zdGFuY2UgcmVxdWVzdGluZyB0aGUgdGVtcGxhdGVcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZT86IChlbGVtZW50OiBUeXBlLCAuLi5oZWxwZXJzOiBhbnlbXSkgPT4gVGVtcGxhdGVSZXN1bHQgfCB2b2lkO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBDb21wb25lbnREZWNsYXJhdGlvbn1cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OOiBDb21wb25lbnREZWNsYXJhdGlvbiA9IHtcbiAgICBzZWxlY3RvcjogJycsXG4gICAgc2hhZG93OiB0cnVlLFxuICAgIGRlZmluZTogdHJ1ZSxcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50RGVjbGFyYXRpb24sIERFRkFVTFRfQ09NUE9ORU5UX0RFQ0xBUkFUSU9OIH0gZnJvbSAnLi9jb21wb25lbnQtZGVjbGFyYXRpb24uanMnO1xuaW1wb3J0IHsgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSB9IGZyb20gJy4vcHJvcGVydHkuanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IGNsYXNzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnQ8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8Q29tcG9uZW50RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0geyAuLi5ERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgcmV0dXJuICh0YXJnZXQ6IHR5cGVvZiBDb21wb25lbnQpID0+IHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldCBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yLnNlbGVjdG9yID0gZGVjbGFyYXRpb24uc2VsZWN0b3IgfHwgdGFyZ2V0LnNlbGVjdG9yO1xuICAgICAgICBjb25zdHJ1Y3Rvci5zaGFkb3cgPSBkZWNsYXJhdGlvbi5zaGFkb3c7XG4gICAgICAgIGNvbnN0cnVjdG9yLnRlbXBsYXRlID0gZGVjbGFyYXRpb24udGVtcGxhdGUgfHwgdGFyZ2V0LnRlbXBsYXRlO1xuXG4gICAgICAgIC8vIHVzZSBrZXlvZiBzaWduYXR1cmVzIHRvIGNhdGNoIHJlZmFjdG9yaW5nIGVycm9yc1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXNLZXk6IGtleW9mIHR5cGVvZiBDb21wb25lbnQgPSAnb2JzZXJ2ZWRBdHRyaWJ1dGVzJztcbiAgICAgICAgY29uc3Qgc3R5bGVzS2V5OiBrZXlvZiB0eXBlb2YgQ29tcG9uZW50ID0gJ3N0eWxlcyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3BlcnR5IGRlY29yYXRvcnMgZ2V0IGNhbGxlZCBiZWZvcmUgY2xhc3MgZGVjb3JhdG9ycywgc28gYXQgdGhpcyBwb2ludCBhbGwgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICogaGF2ZSBzdG9yZWQgdGhlaXIgYXNzb2NpYXRlZCBhdHRyaWJ1dGVzIGluIHtAbGluayBDb21wb25lbnQuYXR0cmlidXRlc30uXG4gICAgICAgICAqIFdlIGNhbiBub3cgY29tYmluZSB0aGVtIHdpdGggdGhlIHVzZXItZGVmaW5lZCB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gYW5kLFxuICAgICAgICAgKiBieSB1c2luZyBhIFNldCwgZWxpbWluYXRlIGFsbCBkdXBsaWNhdGVzIGluIHRoZSBwcm9jZXNzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBBcyB0aGUgdXNlci1kZWZpbmVkIHtAbGluayBDb21wb25lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSB3aWxsIGFsc28gaW5jbHVkZSBkZWNvcmF0b3IgZ2VuZXJhdGVkXG4gICAgICAgICAqIG9ic2VydmVkIGF0dHJpYnV0ZXMsIHdlIGFsd2F5cyBpbmhlcml0IGFsbCBvYnNlcnZlZCBhdHRyaWJ1dGVzIGZyb20gYSBiYXNlIGNsYXNzLiBGb3IgdGhhdCByZWFzb25cbiAgICAgICAgICogd2UgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIGF0dHJpYnV0ZSBvdmVycmlkZXMgd2hlbiBleHRlbmRpbmcgYW55IHtAbGluayBDb21wb25lbnR9IGJhc2UgY2xhc3MuXG4gICAgICAgICAqIFRoaXMgaXMgZG9uZSBpbiB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IuIEhlcmUgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdG8gcmVtb3ZlIG92ZXJyaWRkZW5cbiAgICAgICAgICogYXR0cmlidXRlcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlcyA9IFtcbiAgICAgICAgICAgIC4uLm5ldyBTZXQoXG4gICAgICAgICAgICAgICAgLy8gd2UgdGFrZSB0aGUgaW5oZXJpdGVkIG9ic2VydmVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4ucmVtb3ZlIG92ZXJyaWRkZW4gZ2VuZXJhdGVkIGF0dHJpYnV0ZXMuLi5cbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgoYXR0cmlidXRlcywgYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4gJiYgY29uc3RydWN0b3Iub3ZlcnJpZGRlbi5oYXMoYXR0cmlidXRlKSA/IFtdIDogYXR0cmlidXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdIGFzIHN0cmluZ1tdXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4uYW5kIHJlY29tYmluZSB0aGUgbGlzdCB3aXRoIHRoZSBuZXdseSBnZW5lcmF0ZWQgYXR0cmlidXRlcyAodGhlIFNldCBwcmV2ZW50cyBkdXBsaWNhdGVzKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KFsuLi50YXJnZXQuYXR0cmlidXRlcy5rZXlzKCldKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIGRlbGV0ZSB0aGUgb3ZlcnJpZGRlbiBTZXQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlIGRvbid0IHdhbnQgdG8gaW5oZXJpdCBzdHlsZXMgYXV0b21hdGljYWxseSwgdW5sZXNzIGV4cGxpY2l0bHkgcmVxdWVzdGVkLCBzbyB3ZSBjaGVjayBpZiB0aGVcbiAgICAgICAgICogY29uc3RydWN0b3IgZGVjbGFyZXMgYSBzdGF0aWMgc3R5bGVzIHByb3BlcnR5ICh3aGljaCBtYXkgdXNlIHN1cGVyLnN0eWxlcyB0byBleHBsaWNpdGx5IGluaGVyaXQpXG4gICAgICAgICAqIGFuZCBpZiBpdCBkb2Vzbid0LCB3ZSBpZ25vcmUgdGhlIHBhcmVudCBjbGFzcydzIHN0eWxlcyAoYnkgbm90IGludm9raW5nIHRoZSBnZXR0ZXIpLlxuICAgICAgICAgKiBXZSB0aGVuIG1lcmdlIHRoZSBkZWNvcmF0b3IgZGVmaW5lZCBzdHlsZXMgKGlmIGV4aXN0aW5nKSBpbnRvIHRoZSBzdHlsZXMgYW5kIHJlbW92ZSBkdXBsaWNhdGVzXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVzID0gW1xuICAgICAgICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgICAgICAgICAoY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoc3R5bGVzS2V5KVxuICAgICAgICAgICAgICAgICAgICA/IGNvbnN0cnVjdG9yLnN0eWxlc1xuICAgICAgICAgICAgICAgICAgICA6IFtdXG4gICAgICAgICAgICAgICAgKS5jb25jYXQoZGVjbGFyYXRpb24uc3R5bGVzIHx8IFtdKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaW5hbGx5IHdlIG92ZXJyaWRlIHRoZSB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHVzZXIgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGdlbmVyYXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvciwgb2JzZXJ2ZWRBdHRyaWJ1dGVzS2V5LCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBvdmVycmlkZSB0aGUge0BsaW5rIENvbXBvbmVudC5zdHlsZXN9IGdldHRlciB3aXRoIGEgbmV3IG9uZSwgd2hpY2ggcmV0dXJuc1xuICAgICAgICAgKiB0aGUgdW5pcXVlIHNldCBvZiBzdGF0aWNhbGx5IGRlZmluZWQgYW5kIGRlY29yYXRvciBkZWZpbmVkIHN0eWxlcy5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIHN0eWxlc0tleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5kZWZpbmUpIHtcblxuICAgICAgICAgICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZShjb25zdHJ1Y3Rvci5zZWxlY3RvciwgY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgTGlzdGVuZXJEZWNsYXJhdGlvbiB9IGZyb20gJy4vbGlzdGVuZXItZGVjbGFyYXRpb24uanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IG1ldGhvZCBhcyBhbiBldmVudCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IExpc3RlbmVyRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5ldmVudCA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBMaXN0ZW5lckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIGxpc3RlbmVyIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yIHN0b3JlcyBsaXN0ZW5lciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBsaXN0ZW5lcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgbGlzdGVuZXIgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBiYXNlIGNsYXNzJ3MgbWFwIHRvIHByb3Blcmx5IGluaGVyaXQgYWxsIGxpc3RlbmVyIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiB0eXBlb2YgQ29tcG9uZW50KSB7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KCdsaXN0ZW5lcnMnKSkgY29uc3RydWN0b3IubGlzdGVuZXJzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5saXN0ZW5lcnMpO1xufVxuIiwiY29uc3QgRklSU1QgPSAvXlteXS87XG5jb25zdCBTUEFDRVMgPSAvXFxzKyhbXFxTXSkvZztcbmNvbnN0IENBTUVMUyA9IC9bYS16XShbQS1aXSkvZztcbmNvbnN0IEtFQkFCUyA9IC8tKFthLXpdKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gS0VCQUJTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgS0VCQUJTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5jYXBpdGFsaXplKHN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZWJhYkNhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gQ0FNRUxTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1swXVswXSArICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBDQU1FTFMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcudG9Mb3dlckNhc2UoKSA6IHN0cmluZztcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXIsIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQgfSBmcm9tICcuL2F0dHJpYnV0ZS1jb252ZXJ0ZXIuanMnO1xuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnLi91dGlscy9zdHJpbmctdXRpbHMuanMnO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHlcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlSZWZsZWN0b3I8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gPSAodGhpczogVHlwZSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIGRpc3BhdGNoIGEgY3VzdG9tIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU5vdGlmaWVyPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYHRydWVgIGlmIHRoZSBgb2xkVmFsdWVgIGFuZCB0aGUgYG5ld1ZhbHVlYCBvZiBhIHByb3BlcnR5IGFyZSBkaWZmZXJlbnQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dHJpYnV0ZVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgQXR0cmlidXRlUmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgUHJvcGVydHlSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn1cbiAqXG4gKiBAcGFyYW0gbm90aWZpZXIgQSBub3RpZmllciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Tm90aWZpZXIgKG5vdGlmaWVyOiBhbnkpOiBub3RpZmllciBpcyBQcm9wZXJ0eU5vdGlmaWVyIHtcblxuICAgIHJldHVybiB0eXBlb2Ygbm90aWZpZXIgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gZGV0ZWN0b3IgQSBkZXRlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgKGRldGVjdG9yOiBhbnkpOiBkZXRlY3RvciBpcyBQcm9wZXJ0eUNoYW5nZURldGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgZGV0ZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlLZXl9XG4gKlxuICogQHBhcmFtIGtleSBBIHByb3BlcnR5IGtleSB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5S2V5IChrZXk6IGFueSk6IGtleSBpcyBQcm9wZXJ0eUtleSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGtleSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGtleSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIHN0cmluZyBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlIHJlbW92aW5nIGludmFsaWQgYXR0cmlidXRlIGNoYXJhY3RlcnNcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQSBzdHJpbmcgdG8gZW5jb2RlIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqIEByZXR1cm5zICAgICBBbiBlbmNvZGVkIHN0cmluZyB1c2FibGUgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUF0dHJpYnV0ZSAodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4ga2ViYWJDYXNlKHZhbHVlLnJlcGxhY2UoL1xcVysvZywgJy0nKS5yZXBsYWNlKC9cXC0kLywgJycpKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXR0cmlidXRlIG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBOdW1lcmljIHByb3BlcnR5IGluZGV4ZXMgb3Igc3ltYm9scyBjYW4gY29udGFpbiBpbnZhbGlkIGNoYXJhY3RlcnMgZm9yIGF0dHJpYnV0ZSBuYW1lcy4gVGhpcyBtZXRob2RcbiAqIHNhbml0aXplcyB0aG9zZSBjaGFyYWN0ZXJzIGFuZCByZXBsYWNlcyBzZXF1ZW5jZXMgb2YgaW52YWxpZCBjaGFyYWN0ZXJzIHdpdGggYSBkYXNoLlxuICogQXR0cmlidXRlIG5hbWVzIGFyZSBub3QgYWxsb3dlZCB0byBzdGFydCB3aXRoIG51bWJlcnMgZWl0aGVyIGFuZCBhcmUgcHJlZml4ZWQgd2l0aCAnYXR0ci0nLlxuICpcbiAqIE4uQi46IFdoZW4gdXNpbmcgY3VzdG9tIHN5bWJvbHMgYXMgcHJvcGVydHkga2V5cywgdXNlIHVuaXF1ZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzeW1ib2xzIHRvIGF2b2lkXG4gKiBjbGFzaGluZyBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgYSA9IFN5bWJvbCgpO1xuICogY29uc3QgYiA9IFN5bWJvbCgpO1xuICpcbiAqIGEgIT09IGI7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGEpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGIpOyAvLyBmYWxzZSAtLT4gJ2F0dHItc3ltYm9sJyA9PT0gJ2F0dHItc3ltYm9sJ1xuICpcbiAqIGNvbnN0IGMgPSBTeW1ib2woJ2MnKTtcbiAqIGNvbnN0IGQgPSBTeW1ib2woJ2QnKTtcbiAqXG4gKiBjICE9PSBkOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShjKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShkKTsgLy8gdHJ1ZSAtLT4gJ2F0dHItc3ltYm9sLWMnID09PSAnYXR0ci1zeW1ib2wtZCdcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgYXR0cmlidXRlIG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZU5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IHN0cmluZyB7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHJldHVybiBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgYXR0cmlidXRlIG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHJldHVybiBgYXR0ci0keyBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSkgfWA7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBldmVudCBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogRXZlbnQgbmFtZXMgZG9uJ3QgaGF2ZSB0aGUgc2FtZSByZXN0cmljdGlvbnMgYXMgYXR0cmlidXRlIG5hbWVzIHdoZW4gaXQgY29tZXMgdG8gaW52YWxpZFxuICogY2hhcmFjdGVycy4gSG93ZXZlciwgZm9yIGNvbnNpc3RlbmN5J3Mgc2FrZSwgd2UgYXBwbHkgdGhlIHNhbWUgcnVsZXMgZm9yIGV2ZW50IG5hbWVzIGFzXG4gKiBmb3IgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEBwYXJhbSBwcmVmaXggICAgICAgIEFuIG9wdGlvbmFsIHByZWZpeCwgZS5nLjogJ29uJ1xuICogQHBhcmFtIHN1ZmZpeCAgICAgICAgQW4gb3B0aW9uYWwgc3VmZml4LCBlLmcuOiAnY2hhbmdlZCdcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgZXZlbnQgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnROYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHByZWZpeD86IHN0cmluZywgc3VmZml4Pzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBwcm9wZXJ0eVN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBldmVudCBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7IHByZWZpeCA/IGAkeyBrZWJhYkNhc2UocHJlZml4KSB9LWAgOiAnJyB9JHsgcHJvcGVydHlTdHJpbmcgfSR7IHN1ZmZpeCA/IGAtJHsga2ViYWJDYXNlKHN1ZmZpeCkgfWAgOiAnJyB9YDtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG4gICAgLyoqXG4gICAgICogRG9lcyBwcm9wZXJ0eSBoYXZlIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBObyBhdHRyaWJ1dGUgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBUaGUgYXR0cmlidXRlIG5hbWUgd2lsbCBiZSBpbmZlcnJlZCBieSBjYW1lbC1jYXNpbmcgdGhlIHByb3BlcnR5IG5hbWVcbiAgICAgKiAqIGBzdHJpbmdgOiBVc2UgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgYXR0cmlidXRlOiBib29sZWFuIHwgc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9taXplIHRoZSBjb252ZXJzaW9uIG9mIHZhbHVlcyBiZXR3ZWVuIHByb3BlcnR5IGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDb252ZXJ0ZXJzIGFyZSBvbmx5IHVzZWQgd2hlbiB7QGxpbmsgcmVmbGVjdFByb3BlcnR5fSBhbmQvb3Ige0BsaW5rIHJlZmxlY3RBdHRyaWJ1dGV9IGFyZSBzZXQgdG8gdHJ1ZS5cbiAgICAgKiBJZiBjdXN0b20gcmVmbGVjdG9ycyBhcmUgdXNlZCwgdGhleSBoYXZlIHRvIHRha2UgY2FyZSBvciBjb252ZXJ0aW5nIHRoZSBwcm9wZXJ0eS9hdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZToge0BsaW5rIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHR9XG4gICAgICovXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlJ3MgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgYXR0cmlidXRlIHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgYXR0cmlidXRlIGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBwcm9wZXJ0eSB1c2luZyB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY29tcG9uZW50IHdpdGggdGhhdCBwcm9wZXJ0eSBrZXkgd2lsbCBiZSBpbnZva2VkIHRvIGhhbmRsZSB0aGUgYXR0cmlidXRlIHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBBdHRyaWJ1dGVSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIHByb3BlcnR5IHZhbHVlIGJlIGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkIHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogVGhlIHByb3BlcnR5IHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgcHJvcGVydHkgY2hhbmdlIHdpbGwgYmUgcmVmbGVjdGVkIGF1dG9tYXRpY2FsbHkgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIHVzaW5nIHRoZSBkZWZhdWx0IHByb3BlcnR5IHJlZmxlY3RvclxuICAgICAqICogYFByb3BlcnR5S2V5YDogQSBtZXRob2Qgb24gdGhlIGNvbXBvbmVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIHByb3BlcnR5IHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgcmVmbGVjdFByb3BlcnR5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5UmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGEgcHJvcGVydHkgdmFsdWUgY2hhbmdlIHJhaXNlIGEgY3VzdG9tIGV2ZW50P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBjcmVhdGUgYSBjdXN0b20gZXZlbnQgZm9yIHRoaXMgcHJvcGVydHlcbiAgICAgKiAqIGB0cnVlYDogQ3JlYXRlIGN1c3RvbSBldmVudHMgZm9yIHRoaXMgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYFByb3BlcnR5S2V5YDogVXNlIHRoZSBtZXRob2Qgd2l0aCB0aGlzIHByb3BlcnR5IGtleSBvbiB0aGUgY29tcG9uZW50IHRvIGNyZWF0ZSBjdXN0b20gZXZlbnRzXG4gICAgICogKiBgRnVuY3Rpb25gOiBVc2UgdGhlIHRoZSBwcm92aWRlZCBmdW5jdGlvbiB0byBjcmVhdGUgY3VzdG9tIGV2ZW50cyAoYHRoaXNgIGNvbnRleHQgd2lsbCBiZSB0aGUgY29tcG9uZW50IGluc3RhbmNlKVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgbm90aWZ5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5Tm90aWZpZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgaG93IGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgbW9uaXRvcmVkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEJ5IGRlZmF1bHQgYSBkZWNvcmF0ZWQgcHJvcGVydHkgd2lsbCBiZSBvYnNlcnZlZCBmb3IgY2hhbmdlcyAodGhyb3VnaCBhIGN1c3RvbSBzZXR0ZXIgZm9yIHRoZSBwcm9wZXJ0eSkuXG4gICAgICogQW55IGBzZXRgLW9wZXJhdGlvbiBvZiB0aGlzIHByb3BlcnR5IHdpbGwgdGhlcmVmb3JlIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYW5kIGluaXRpYXRlXG4gICAgICogYSByZW5kZXIgYXMgd2VsbCBhcyByZWZsZWN0aW9uIGFuZCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBEb24ndCBvYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSAodGhpcyB3aWxsIGJ5cGFzcyByZW5kZXIsIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbilcbiAgICAgKiAqIGB0cnVlYDogT2JzZXJ2ZSBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgdXNpbmcgdGhlIHtAbGluayBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUn1cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFVzZSB0aGUgcHJvdmlkZWQgbWV0aG9kIHRvIGNoZWNrIGlmIHByb3BlcnR5IHZhbHVlIGhhcyBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWAgKHVzZXMge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfSBpbnRlcm5hbGx5KVxuICAgICAqL1xuICAgIG9ic2VydmU6IGJvb2xlYW4gfCBQcm9wZXJ0eUNoYW5nZURldGVjdG9yO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICpcbiAqIEBwYXJhbSBvbGRWYWx1ZSAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICogQHBhcmFtIG5ld1ZhbHVlICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gKiBAcmV0dXJucyAgICAgICAgIEEgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2VkXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUjogUHJvcGVydHlDaGFuZ2VEZXRlY3RvciA9IChvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSA9PiB7XG4gICAgLy8gaW4gY2FzZSBgb2xkVmFsdWVgIGFuZCBgbmV3VmFsdWVgIGFyZSBgTmFOYCwgYChOYU4gIT09IE5hTilgIHJldHVybnMgYHRydWVgLFxuICAgIC8vIGJ1dCBgKE5hTiA9PT0gTmFOIHx8IE5hTiA9PT0gTmFOKWAgcmV0dXJucyBgZmFsc2VgXG4gICAgcmV0dXJuIG9sZFZhbHVlICE9PSBuZXdWYWx1ZSAmJiAob2xkVmFsdWUgPT09IG9sZFZhbHVlIHx8IG5ld1ZhbHVlID09PSBuZXdWYWx1ZSk7XG59O1xuXG4vLyBUT0RPOiBtYXliZSBwcm92aWRlIGZsYXQgYXJyYXkvb2JqZWN0IGNoYW5nZSBkZXRlY3Rvcj8gZGF0ZSBjaGFuZ2UgZGV0ZWN0b3I/XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OOiBQcm9wZXJ0eURlY2xhcmF0aW9uID0ge1xuICAgIGF0dHJpYnV0ZTogdHJ1ZSxcbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQsXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogdHJ1ZSxcbiAgICByZWZsZWN0UHJvcGVydHk6IHRydWUsXG4gICAgbm90aWZ5OiB0cnVlLFxuICAgIG9ic2VydmU6IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SLFxufTtcbiIsIi8qKlxuICogR2V0IHRoZSB7QGxpbmsgUHJvcGVydHlEZXNjcmlwdG9yfSBvZiBhIHByb3BlcnR5IGZyb20gaXRzIHByb3RvdHlwZVxuICogb3IgYSBwYXJlbnQgcHJvdG90eXBlIC0gZXhjbHVkaW5nIHtAbGluayBPYmplY3QucHJvdG90eXBlfSBpdHNlbGYuXG4gKlxuICogQHBhcmFtIHRhcmdldCAgICAgICAgVGhlIHByb3RvdHlwZSB0byBnZXQgdGhlIGRlc2NyaXB0b3IgZnJvbVxuICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkZXNjcmlwdG9yXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yICh0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KTogUHJvcGVydHlEZXNjcmlwdG9yIHwgdW5kZWZpbmVkIHtcblxuICAgIGlmIChwcm9wZXJ0eUtleSBpbiB0YXJnZXQpIHtcblxuICAgICAgICB3aGlsZSAodGFyZ2V0ICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkocHJvcGVydHlLZXkpKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IGNyZWF0ZUF0dHJpYnV0ZU5hbWUsIERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIFByb3BlcnR5RGVjbGFyYXRpb24gfSBmcm9tICcuL3Byb3BlcnR5LWRlY2xhcmF0aW9uLmpzJztcbmltcG9ydCB7IGdldFByb3BlcnR5RGVzY3JpcHRvciB9IGZyb20gJy4vdXRpbHMvZ2V0LXByb3BlcnR5LWRlc2NyaXB0b3IuanMnO1xuXG4vKipcbiAqIEEgdHlwZSBleHRlbnNpb24gdG8gYWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byBhIHtAbGluayBDb21wb25lbnR9IGNvbnN0cnVjdG9yIGR1cmluZyBkZWNvcmF0aW9uXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gdHlwZW9mIENvbXBvbmVudCAmIHsgb3ZlcnJpZGRlbj86IFNldDxzdHJpbmc+IH07XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIENvbXBvbmVudH0gcHJvcGVydHlcbiAqXG4gKiBAcmVtYXJrc1xuICogTWFueSBvZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9wdGlvbnMgc3VwcG9ydCBjdXN0b20gZnVuY3Rpb25zLCB3aGljaCB3aWxsIGJlIGludm9rZWRcbiAqIHdpdGggdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhcyBgdGhpc2AtY29udGV4dCBkdXJpbmcgZXhlY3V0aW9uLiBJbiBvcmRlciB0byBzdXBwb3J0IGNvcnJlY3RcbiAqIHR5cGluZyBpbiB0aGVzZSBmdW5jdGlvbnMsIHRoZSBgQHByb3BlcnR5YCBkZWNvcmF0b3Igc3VwcG9ydHMgZ2VuZXJpYyB0eXBlcy4gSGVyZSBpcyBhbiBleGFtcGxlXG4gKiBvZiBob3cgeW91IGNhbiB1c2UgdGhpcyB3aXRoIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn06XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAqXG4gKiAgICAgIG15SGlkZGVuUHJvcGVydHkgPSB0cnVlO1xuICpcbiAqICAgICAgLy8gdXNlIGEgZ2VuZXJpYyB0byBzdXBwb3J0IHByb3BlciBpbnN0YW5jZSB0eXBpbmcgaW4gdGhlIHByb3BlcnR5IHJlZmxlY3RvclxuICogICAgICBAcHJvcGVydHk8TXlFbGVtZW50Pih7XG4gKiAgICAgICAgICByZWZsZWN0UHJvcGVydHk6IChwcm9wZXJ0eUtleTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gKiAgICAgICAgICAgICAgLy8gdGhlIGdlbmVyaWMgdHlwZSBhbGxvd3MgZm9yIGNvcnJlY3QgdHlwaW5nIG9mIHRoaXNcbiAqICAgICAgICAgICAgICBpZiAodGhpcy5teUhpZGRlblByb3BlcnR5ICYmIG5ld1ZhbHVlKSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdteS1wcm9wZXJ0eScsICcnKTtcbiAqICAgICAgICAgICAgICB9IGVsc2Uge1xuICogICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbXktcHJvcGVydHknKTtcbiAqICAgICAgICAgICAgICB9XG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSBmYWxzZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEgcHJvcGVydHkgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4+ID0ge30pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoXG4gICAgICAgIHRhcmdldDogT2JqZWN0LFxuICAgICAgICBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksXG4gICAgICAgIHByb3BlcnR5RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICApOiBhbnkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGRlZmluaW5nIGNsYXNzZXMgaW4gVHlwZVNjcmlwdCwgY2xhc3MgZmllbGRzIGFjdHVhbGx5IGRvbid0IGV4aXN0IG9uIHRoZSBjbGFzcydzIHByb3RvdHlwZSwgYnV0XG4gICAgICAgICAqIHJhdGhlciwgdGhleSBhcmUgaW5zdGFudGlhdGVkIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgZXhpc3Qgb25seSBvbiB0aGUgaW5zdGFuY2UuIEFjY2Vzc29yIHByb3BlcnRpZXNcbiAgICAgICAgICogYXJlIGFuIGV4Y2VwdGlvbiBob3dldmVyIGFuZCBleGlzdCBvbiB0aGUgcHJvdG90eXBlLiBGdXJ0aGVybW9yZSwgYWNjZXNzb3JzIGFyZSBpbmhlcml0ZWQgYW5kIHdpbGxcbiAgICAgICAgICogYmUgaW52b2tlZCB3aGVuIHNldHRpbmcgKG9yIGdldHRpbmcpIGEgcHJvcGVydHkgb24gYW4gaW5zdGFuY2Ugb2YgYSBjaGlsZCBjbGFzcywgZXZlbiBpZiB0aGF0IGNsYXNzXG4gICAgICAgICAqIGRlZmluZXMgdGhlIHByb3BlcnR5IGZpZWxkIG9uIGl0cyBvd24uIE9ubHkgaWYgdGhlIGNoaWxkIGNsYXNzIGRlZmluZXMgbmV3IGFjY2Vzc29ycyB3aWxsIHRoZSBwYXJlbnRcbiAgICAgICAgICogY2xhc3MncyBhY2Nlc3NvcnMgbm90IGJlIGluaGVyaXRlZC5cbiAgICAgICAgICogVG8ga2VlcCB0aGlzIGJlaGF2aW9yIGludGFjdCwgd2UgbmVlZCB0byBlbnN1cmUsIHRoYXQgd2hlbiB3ZSBjcmVhdGUgYWNjZXNzb3JzIGZvciBwcm9wZXJ0aWVzLCB3aGljaFxuICAgICAgICAgKiBhcmUgbm90IGRlY2xhcmVkIGFzIGFjY2Vzc29ycywgd2UgaW52b2tlIHRoZSBwYXJlbnQgY2xhc3MncyBhY2Nlc3NvciBhcyBleHBlY3RlZC5cbiAgICAgICAgICogVGhlIHtAbGluayBnZXRQcm9wZXJ0eURlc2NyaXB0b3J9IGZ1bmN0aW9uIGFsbG93cyB1cyB0byBsb29rIGZvciBhY2Nlc3NvcnMgb24gdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICAgICAgICAgKiB0aGUgY2xhc3Mgd2UgYXJlIGRlY29yYXRpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gcHJvcGVydHlEZXNjcmlwdG9yIHx8IGdldFByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgY29uc3QgaGlkZGVuS2V5ID0gKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpID8gYF9fJHsgcHJvcGVydHlLZXkgfWAgOiBTeW1ib2woKTtcblxuICAgICAgICAvLyBpZiB3ZSBmb3VuZCBhbiBhY2Nlc3NvciBkZXNjcmlwdG9yIChmcm9tIGVpdGhlciB0aGlzIGNsYXNzIG9yIGEgcGFyZW50KSB3ZSB1c2UgaXQsIG90aGVyd2lzZSB3ZSBjcmVhdGVcbiAgICAgICAgLy8gZGVmYXVsdCBhY2Nlc3NvcnMgdG8gc3RvcmUgdGhlIGFjdHVhbCBwcm9wZXJ0eSB2YWx1ZSBpbiBhIGhpZGRlbiBmaWVsZCBhbmQgcmV0cmlldmUgaXQgZnJvbSB0aGVyZVxuICAgICAgICBjb25zdCBnZXR0ZXIgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IuZ2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnkpIHsgcmV0dXJuIHRoaXNbaGlkZGVuS2V5XTsgfTtcbiAgICAgICAgY29uc3Qgc2V0dGVyID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnNldCB8fCBmdW5jdGlvbiAodGhpczogYW55LCB2YWx1ZTogYW55KSB7IHRoaXNbaGlkZGVuS2V5XSA9IHZhbHVlOyB9O1xuXG4gICAgICAgIC8vIHdlIGRlZmluZSBhIG5ldyBhY2Nlc3NvciBkZXNjcmlwdG9yIHdoaWNoIHdpbGwgd3JhcCB0aGUgcHJldmlvdXNseSByZXRyaWV2ZWQgb3IgY3JlYXRlZCBhY2Nlc3NvcnNcbiAgICAgICAgLy8gYW5kIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgd2hlbmV2ZXIgdGhlIHByb3BlcnR5IGlzIHNldFxuICAgICAgICBjb25zdCB3cmFwcGVkRGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yICYgVGhpc1R5cGU8YW55PiA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IGFueSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpc1twcm9wZXJ0eUtleV07XG4gICAgICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHBhc3MgYHZhbHVlYCBvbiBhcyBgbmV3VmFsdWVgIC0gYW4gaW5oZXJpdGVkIHNldHRlciBtaWdodCBtb2RpZnkgaXRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIGdldCB0aGUgbmV3IHZhbHVlIGJ5IGludm9raW5nIHRoZSBnZXR0ZXJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUocHJvcGVydHlLZXksIG9sZFZhbHVlLCBnZXR0ZXIuY2FsbCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyBEZWNvcmF0ZWRDb21wb25lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uOiBQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+ID0geyAuLi5ERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCAuLi5vcHRpb25zIH07XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdGhlIGRlZmF1bHQgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPSBjcmVhdGVBdHRyaWJ1dGVOYW1lKHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLm9ic2VydmUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24ub2JzZXJ2ZSA9IERFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04ub2JzZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXBhcmVDb25zdHJ1Y3Rvcihjb25zdHJ1Y3Rvcik7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgaW5oZXJpdGVkIGFuIG9ic2VydmVkIGF0dHJpYnV0ZSBmb3IgdGhlIHByb3BlcnR5IGZyb20gdGhlIGJhc2UgY2xhc3NcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gY29uc3RydWN0b3IucHJvcGVydGllcy5oYXMocHJvcGVydHlLZXkpID8gY29uc3RydWN0b3IucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpIS5hdHRyaWJ1dGUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSBpdCdzIGEgc3RyaW5nIGFuZCBpdCB3aWxsIGV4aXN0IGluIHRoZSBhdHRyaWJ1dGVzIG1hcFxuICAgICAgICBpZiAoYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgaW5oZXJpdGVkIGF0dHJpYnV0ZSBhcyBpdCdzIG92ZXJyaWRkZW5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuZGVsZXRlKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgLy8gbWFyayBhdHRyaWJ1dGUgYXMgb3ZlcnJpZGRlbiBmb3Ige0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuIS5hZGQoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmF0dHJpYnV0ZXMuc2V0KGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uICphZnRlciogcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlcywgc28gd2UgY2FuIHN0aWxsIGFjY2VzcyB0aGVcbiAgICAgICAgLy8gaW5oZXJpdGVkIHByb3BlcnR5IGRlY2xhcmF0aW9uIHdoZW4gcHJvY2Vzc2luZyB0aGUgYXR0cmlidXRlc1xuICAgICAgICBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgZGVjbGFyYXRpb24gYXMgUHJvcGVydHlEZWNsYXJhdGlvbik7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICAgICAgLy8gaWYgbm8gcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYSBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIHdoaWNoIG11c3QgcmV0dXJuIHZvaWQgYW5kIHdlIGNhbiBkZWZpbmUgdGhlIHdyYXBwZWQgZGVzY3JpcHRvciBoZXJlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgd3JhcHBlZERlc2NyaXB0b3IpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGlmIGEgcHJvcGVydHlEZXNjcmlwdG9yIHdhcyBkZWZpbmVkIGZvciB0aGlzIGRlY29yYXRvciwgdGhpcyBkZWNvcmF0b3IgaXMgYW4gYWNjZXNzb3JcbiAgICAgICAgICAgIC8vIGRlY29yYXRvciBhbmQgd2UgbXVzdCByZXR1cm4gdGhlIHdyYXBwZWQgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWREZXNjcmlwdG9yO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogUHJlcGFyZXMgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBieSBpbml0aWFsaXppbmcgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3IsXG4gKiBzbyB3ZSBkb24ndCBtb2RpZnkgYSBiYXNlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnRpZXMuXG4gKlxuICogQHJlbWFya3NcbiAqIFdoZW4gdGhlIHByb3BlcnR5IGRlY29yYXRvciBzdG9yZXMgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgaW4gdGhlIGNvbnN0cnVjdG9yLFxuICogd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhvc2Ugc3RhdGljIGZpZWxkcyBhcmUgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZVxuICogYWRkIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkcy4gV2UgYWxzbyBtYWtlXG4gKiBzdXJlIHRvIGluaXRpYWxpemUgdGhlIGNvbnN0cnVjdG9ycyBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYmFzZSBjbGFzcydzIG1hcHMgdG8gcHJvcGVybHlcbiAqIGluaGVyaXQgYWxsIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlcy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb25zdHJ1Y3RvciAoY29uc3RydWN0b3I6IERlY29yYXRlZENvbXBvbmVudFR5cGUpIHtcblxuICAgIC8vIHRoaXMgd2lsbCBnaXZlIHVzIGEgY29tcGlsZS10aW1lIGVycm9yIGlmIHdlIHJlZmFjdG9yIG9uZSBvZiB0aGUgc3RhdGljIGNvbnN0cnVjdG9yIHByb3BlcnRpZXNcbiAgICAvLyBhbmQgd2Ugd29uJ3QgbWlzcyByZW5hbWluZyB0aGUgcHJvcGVydHkga2V5c1xuICAgIGNvbnN0IHByb3BlcnRpZXM6IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAncHJvcGVydGllcyc7XG4gICAgY29uc3QgYXR0cmlidXRlczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdhdHRyaWJ1dGVzJztcbiAgICBjb25zdCBvdmVycmlkZGVuOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ292ZXJyaWRkZW4nO1xuXG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0aWVzKSkgY29uc3RydWN0b3IucHJvcGVydGllcyA9IG5ldyBNYXAoY29uc3RydWN0b3IucHJvcGVydGllcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVzKSkgY29uc3RydWN0b3IuYXR0cmlidXRlcyA9IG5ldyBNYXAoY29uc3RydWN0b3IuYXR0cmlidXRlcyk7XG4gICAgaWYgKCFjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShvdmVycmlkZGVuKSkgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiA9IG5ldyBTZXQoKTtcbn1cbiIsImltcG9ydCB7IHJlbmRlciwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQge1xuICAgIEF0dHJpYnV0ZVJlZmxlY3RvcixcbiAgICBjcmVhdGVFdmVudE5hbWUsXG4gICAgaXNBdHRyaWJ1dGVSZWZsZWN0b3IsXG4gICAgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yLFxuICAgIGlzUHJvcGVydHlLZXksXG4gICAgaXNQcm9wZXJ0eU5vdGlmaWVyLFxuICAgIGlzUHJvcGVydHlSZWZsZWN0b3IsXG4gICAgTGlzdGVuZXJEZWNsYXJhdGlvbixcbiAgICBQcm9wZXJ0eURlY2xhcmF0aW9uLFxuICAgIFByb3BlcnR5Tm90aWZpZXIsXG4gICAgUHJvcGVydHlSZWZsZWN0b3Jcbn0gZnJvbSBcIi4vZGVjb3JhdG9ycy9pbmRleC5qc1wiO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SID0gKGF0dHJpYnV0ZVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgYXR0cmlidXRlIHJlZmxlY3RvciAkeyBTdHJpbmcoYXR0cmlidXRlUmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SID0gKHByb3BlcnR5UmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSByZWZsZWN0b3IgJHsgU3RyaW5nKHByb3BlcnR5UmVmbGVjdG9yKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IgPSAocHJvcGVydHlOb3RpZmllcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgbm90aWZpZXIgJHsgU3RyaW5nKHByb3BlcnR5Tm90aWZpZXIpIH0uYCk7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBDSEFOR0VfREVURUNUT1JfRVJST1IgPSAoY2hhbmdlRGV0ZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvciAkeyBTdHJpbmcoY2hhbmdlRGV0ZWN0b3IpIH0uYCk7XG5cbi8qKlxuICogRXh0ZW5kcyB0aGUgc3RhdGljIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSB0byBpbmNsdWRlIHRoZSBib3VuZCBsaXN0ZW5lclxuICogZm9yIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5pbnRlcmZhY2UgSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uIGV4dGVuZHMgTGlzdGVuZXJEZWNsYXJhdGlvbiB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYm91bmQgbGlzdGVuZXIgd2lsbCBiZSBzdG9yZWQgaGVyZSwgc28gaXQgY2FuIGJlIHJlbW92ZWQgaXQgbGF0ZXJcbiAgICAgKi9cbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBldmVudCB0YXJnZXQgd2lsbCBhbHdheXMgYmUgcmVzb2x2ZWQgdG8gYW4gYWN0dWFsIHtAbGluayBFdmVudFRhcmdldH1cbiAgICAgKi9cbiAgICB0YXJnZXQ6IEV2ZW50VGFyZ2V0O1xufVxuXG4vKipcbiAqIEEgdHlwZSBmb3IgcHJvcGVydHkgY2hhbmdlcywgYXMgdXNlZCBpbiB7QGxpbmsgdXBkYXRlQ2FsbGJhY2t9XG4gKi9cbmV4cG9ydCB0eXBlIENoYW5nZXMgPSBNYXA8UHJvcGVydHlLZXksIGFueT47XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnQgZGV0YWlscywgYXMgdXNlZCBieSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VFdmVudH1cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZUV2ZW50RGV0YWlsPFQ+IHtcbiAgICBwcm9wZXJ0eTogc3RyaW5nO1xuICAgIHByZXZpb3VzOiBUO1xuICAgIGN1cnJlbnQ6IFQ7XG59XG5cbi8qKlxuICogQSB0eXBlIGZvciBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnRzLCBhcyBkaXNwYXRjaGVkIGJ5IHRoZSB7QGxpbmsgX25vdGlmeVByb3BlcnR5fSBtZXRob2RcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZUV2ZW50PFQ+IGV4dGVuZHMgQ3VzdG9tRXZlbnQ8UHJvcGVydHlDaGFuZ2VFdmVudERldGFpbDxUPj4ge31cblxuLyoqXG4gKiBUaGUgY29tcG9uZW50IGJhc2UgY2xhc3NcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBjYWNoZWQge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdHlsZVNoZWV0OiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBDU1NTdHlsZVNoZWV0fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGVuIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJlIGF2YWlsYWJsZSwgdGhpcyBnZXR0ZXIgd2lsbCBjcmVhdGUgYSB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKiBpbnN0YW5jZSBhbmQgY2FjaGUgaXQgZm9yIHVzZSB3aXRoIGVhY2ggaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0IHN0eWxlU2hlZXQgKCk6IENTU1N0eWxlU2hlZXQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZVNoZWV0JykpIHtcblxuICAgICAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHN0eWxlIHNoZWV0IGFuZCBjYWNoZSBpdCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgd29yayBvbmNlIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJyaXZlXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9jb25zdHJ1Y3Qtc3R5bGVzaGVldHMvXG4gICAgICAgICAgICAgICAgdGhpcy5fc3R5bGVTaGVldCA9IG5ldyBDU1NTdHlsZVNoZWV0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3R5bGVTaGVldC5yZXBsYWNlU3luYyh0aGlzLnN0eWxlcy5qb2luKCdcXG4nKSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHlsZVNoZWV0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBjYWNoZWQge0BsaW5rIEhUTUxTdHlsZUVsZW1lbnR9IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdHlsZUVsZW1lbnQ6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mge0BsaW5rIEhUTUxTdHlsZUVsZW1lbnR9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIEhUTUxTdHlsZUVsZW1lbnR9IG5vZGUgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoXG4gICAgICogaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0IHN0eWxlRWxlbWVudCAoKTogSFRNTFN0eWxlRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxlbmd0aCAmJiAhdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX3N0eWxlRWxlbWVudCcpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQudGl0bGUgPSB0aGlzLnNlbGVjdG9yO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gdGhpcy5zdHlsZXMuam9pbignXFxuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIGF0dHJpYnV0ZSBuYW1lcyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0eSBrZXlzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiBwcm9wZXJ0eSBrZXkgdGhhdCBiZWxvbmdzIHRvIGFuIGF0dHJpYnV0ZSBuYW1lLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIGF0dHJpYnV0ZXM6IE1hcDxzdHJpbmcsIFByb3BlcnR5S2V5PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gb2YgYSBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBwcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIFByb3BlcnR5RGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtYXAgaXMgcG9wdWxhdGVkIGJ5IHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciBhbmQgY2FuIGJlIHVzZWQgdG8gb2J0YWluIHRoZVxuICAgICAqIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSBvZiBhIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBsaXN0ZW5lcnM6IE1hcDxQcm9wZXJ0eUtleSwgTGlzdGVuZXJEZWNsYXJhdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc2VsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2lsbCBiZSBvdmVycmlkZGVuIGJ5IHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc2VsZWN0b3JgIG9wdGlvbiwgaWYgcHJvdmlkZWQuXG4gICAgICogT3RoZXJ3aXNlIHRoZSBkZWNvcmF0b3Igd2lsbCB1c2UgdGhpcyBwcm9wZXJ0eSB0byBkZWZpbmUgdGhlIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2VsZWN0b3I6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFVzZSBTaGFkb3cgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgc2V0IGJ5IHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgc2hhZG93YCBvcHRpb24gKGRlZmF1bHRzIHRvIGB0cnVlYCkuXG4gICAgICovXG4gICAgc3RhdGljIHNoYWRvdzogYm9vbGVhbjtcblxuICAgIC8vIFRPRE86IGNyZWF0ZSB0ZXN0cyBmb3Igc3R5bGUgaW5oZXJpdGFuY2VcbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3Mgc3R5bGVzXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENhbiBiZSBzZXQgdGhyb3VnaCB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHN0eWxlc2Agb3B0aW9uIChkZWZhdWx0cyB0byBgdW5kZWZpbmVkYCkuXG4gICAgICogU3R5bGVzIHNldCBpbiB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yIHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIGNsYXNzJ3Mgc3RhdGljIHByb3BlcnR5LlxuICAgICAqIFRoaXMgYWxsb3dzIHRvIGluaGVyaXQgc3R5bGVzIGZyb20gYSBwYXJlbnQgY29tcG9uZW50IGFuZCBhZGQgYWRkaXRpb25hbCBzdHlsZXMgb24gdGhlIGNoaWxkIGNvbXBvbmVudC5cbiAgICAgKiBJbiBvcmRlciB0byBpbmhlcml0IHN0eWxlcyBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCwgYW4gZXhwbGljaXQgc3VwZXIgY2FsbCBoYXMgdG8gYmUgaW5jbHVkZWQuIEJ5XG4gICAgICogZGVmYXVsdCBubyBzdHlsZXMgYXJlIGluaGVyaXRlZC5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIE15QmFzZUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKTogc3RyaW5nW10ge1xuICAgICAqXG4gICAgICogICAgICAgICAgcmV0dXJuIFtcbiAgICAgKiAgICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAqICAgICAgICAgICAgICAnOmhvc3QgeyBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjsgfSdcbiAgICAgKiAgICAgICAgICBdO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ2FuIGJlIHNldCB0aHJvdWdoIHRoZSB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3IncyBgdGVtcGxhdGVgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHVuZGVmaW5lZGApLlxuICAgICAqIElmIHNldCBpbiB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yLCBpdCB3aWxsIGhhdmUgcHJlY2VkZW5jZSBvdmVyIHRoZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50ICAgVGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBoZWxwZXJzICAgQW55IGFkZGl0aW9uYWwgcHJvcGVydGllcyB3aGljaCBzaG91bGQgZXhpc3QgaW4gdGhlIHRlbXBsYXRlIHNjb3BlXG4gICAgICovXG4gICAgc3RhdGljIHRlbXBsYXRlPzogKGVsZW1lbnQ6IGFueSwgLi4uaGVscGVyczogYW55W10pID0+IFRlbXBsYXRlUmVzdWx0IHwgdm9pZDtcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRvIHNwZWNpZnkgYXR0cmlidXRlcyB3aGljaCBzaG91bGQgYmUgb2JzZXJ2ZWQsIGJ1dCBkb24ndCBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtcbiAgICAgKiBGb3IgcHJvcGVydGllcyB3aGljaCBhcmUgZGVjb3JhdGVkIHdpdGggdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGVcbiAgICAgKiBpcyBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgYW5kIGRvZXMgbm90IG5lZWQgdG8gYmUgc3BlY2lmaWVkIGhlcmUuIEZvdCBhdHRyaWJ1dGVzIHRoYXQgZG9uJ3RcbiAgICAgKiBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHksIHJldHVybiB0aGUgYXR0cmlidXRlIG5hbWVzIGluIHRoaXMgZ2V0dGVyLiBDaGFuZ2VzIHRvIHRoZXNlXG4gICAgICogYXR0cmlidXRlcyBjYW4gYmUgaGFuZGxlZCBpbiB0aGUge0BsaW5rIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja30gbWV0aG9kLlxuICAgICAqXG4gICAgICogV2hlbiBleHRlbmRpbmcgY29tcG9uZW50cywgbWFrZSBzdXJlIHRvIHJldHVybiB0aGUgc3VwZXIgY2xhc3MncyBvYnNlcnZlZEF0dHJpYnV0ZXNcbiAgICAgKiBpZiB5b3Ugb3ZlcnJpZGUgdGhpcyBnZXR0ZXIgKGV4Y2VwdCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBpbmhlcml0IG9ic2VydmVkIGF0dHJpYnV0ZXMpOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gWy4uLnN1cGVyLm9ic2VydmVkQXR0cmlidXRlcywgJ215LWFkZGl0aW9uYWwtYXR0cmlidXRlJ107XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdXBkYXRlUmVxdWVzdDogUHJvbWlzZTxib29sZWFuPiA9IFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY2hhbmdlZFByb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVmbGVjdGluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5aW5nUHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBhbnk+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW5lckRlY2xhcmF0aW9uczogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uW10gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzVXBkYXRlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaXNSZWZsZWN0aW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dFxuICAgICAqL1xuICAgIHJlYWRvbmx5IHJlbmRlclJvb3Q6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yICguLi5hcmdzOiBhbnlbXSkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJSb290ID0gdGhpcy5fY3JlYXRlUmVuZGVyUm9vdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgbW92ZWQgdG8gYSBuZXcgZG9jdW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGFkb3B0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCdhZG9wdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIGRvY3VtZW50J3MgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogTi5CLjogV2hlbiBvdmVycmlkaW5nIHRoaXMgY2FsbGJhY2ssIG1ha2Ugc3VyZSB0byBpbmNsdWRlIGEgc3VwZXItY2FsbC5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgdGhpcy5fdW5saXN0ZW4oKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Rpc2Nvbm5lY3RlZCcpO1xuXG4gICAgICAgIHRoaXMuX2hhc1VwZGF0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSBvbmUgb2YgdGhlIGNvbXBvbmVudCdzIGF0dHJpYnV0ZXMgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hpY2ggYXR0cmlidXRlcyB0byBub3RpY2UgY2hhbmdlIGZvciBpcyBzcGVjaWZpZWQgaW4ge0BsaW5rIG9ic2VydmVkQXR0cmlidXRlc30uXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBGb3IgZGVjb3JhdGVkIHByb3BlcnRpZXMgd2l0aCBhbiBhc3NvY2lhdGVkIGF0dHJpYnV0ZSwgdGhpcyBpcyBoYW5kbGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiB0byBjdXN0b21pemUgdGhlIGhhbmRsaW5nIG9mIGF0dHJpYnV0ZSBjaGFuZ2VzLiBXaGVuIG92ZXJyaWRpbmdcbiAgICAgKiB0aGlzIG1ldGhvZCwgYSBzdXBlci1jYWxsIHNob3VsZCBiZSBpbmNsdWRlZCwgdG8gZW5zdXJlIGF0dHJpYnV0ZSBjaGFuZ2VzIGZvciBkZWNvcmF0ZWQgcHJvcGVydGllc1xuICAgICAqIGFyZSBwcm9jZXNzZWQgY29ycmVjdGx5LlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICAgICAqXG4gICAgICogICAgICAgICAgc3VwZXIuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgKlxuICAgICAqICAgICAgICAgIC8vIGRvIGN1c3RvbSBoYW5kbGluZy4uLlxuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGUgVGhlIG5hbWUgb2YgdGhlIGNoYW5nZWQgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayAoYXR0cmlidXRlOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1JlZmxlY3RpbmcgfHwgb2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yZWZsZWN0QXR0cmlidXRlKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IHVwZGF0ZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIGB1cGRhdGVDYWxsYmFja2AgaXMgaW52b2tlZCBzeW5jaHJvbm91c2x5IGJ5IHRoZSB7QGxpbmsgdXBkYXRlfSBtZXRob2QgYW5kIHRoZXJlZm9yZSBoYXBwZW5zIGRpcmVjdGx5IGFmdGVyXG4gICAgICogcmVuZGVyaW5nLCBwcm9wZXJ0eSByZWZsZWN0aW9uIGFuZCBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnRzLlxuICAgICAqXG4gICAgICogTi5CLjogQ2hhbmdlcyBtYWRlIHRvIHByb3BlcnRpZXMgb3IgYXR0cmlidXRlcyBpbnNpZGUgdGhpcyBjYWxsYmFjayAqd29uJ3QqIGNhdXNlIGFub3RoZXIgdXBkYXRlLlxuICAgICAqIFRvIGNhdXNlIGFuIHVwZGF0ZSwgZGVmZXIgY2hhbmdlcyB3aXRoIHRoZSBoZWxwIG9mIGEgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuICAgICAqXG4gICAgICogICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICogICAgICAgICAgICAgIC8vIHBlcmZvcm0gY2hhbmdlcyB3aGljaCBuZWVkIHRvIGNhdXNlIGFub3RoZXIgdXBkYXRlIGhlcmVcbiAgICAgKiAgICAgICAgICB9KTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgICAgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlZCBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIGZpcnN0VXBkYXRlICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhpcyB3YXMgdGhlIGZpcnN0IHVwZGF0ZVxuICAgICAqL1xuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikgeyB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIGN1c3RvbSBldmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvQ3VzdG9tRXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudE5hbWUgQW4gZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSBldmVudEluaXQgQSB7QGxpbmsgQ3VzdG9tRXZlbnRJbml0fSBkaWN0aW9uYXJ5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeSAoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50SW5pdD86IEN1c3RvbUV2ZW50SW5pdCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBldmVudEluaXQpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaCBwcm9wZXJ0eSBjaGFuZ2VzIG9jY3VycmluZyBpbiB0aGUgZXhlY3V0b3IgYW5kIHJhaXNlIGN1c3RvbSBldmVudHNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUHJvcGVydHkgY2hhbmdlcyBzaG91bGQgdHJpZ2dlciBjdXN0b20gZXZlbnRzIHdoZW4gdGhleSBhcmUgY2F1c2VkIGJ5IGludGVybmFsIHN0YXRlIGNoYW5nZXMsXG4gICAgICogYnV0IG5vdCBpZiB0aGV5IGFyZSBjYXVzZWQgYnkgYSBjb25zdW1lciBvZiB0aGUgY29tcG9uZW50IEFQSSBkaXJlY3RseSwgZS5nLjpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdteS1jdXN0b20tZWxlbWVudCcpLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiBgYGAuXG4gICAgICpcbiAgICAgKiBUaGlzIG1lYW5zLCB3ZSBjYW5ub3QgYXV0b21hdGUgdGhpcyBwcm9jZXNzIHRocm91Z2ggcHJvcGVydHkgc2V0dGVycywgYXMgd2UgY2FuJ3QgYmUgc3VyZSB3aG9cbiAgICAgKiBpbnZva2VkIHRoZSBzZXR0ZXIgLSBpbnRlcm5hbCBjYWxscyBvciBleHRlcm5hbCBjYWxscy5cbiAgICAgKlxuICAgICAqIE9uZSBvcHRpb24gaXMgdG8gbWFudWFsbHkgcmFpc2UgdGhlIGV2ZW50LCB3aGljaCBjYW4gYmVjb21lIHRlZGlvdXMgYW5kIGZvcmNlcyB1cyB0byB1c2Ugc3RyaW5nLVxuICAgICAqIGJhc2VkIGV2ZW50IG5hbWVzIG9yIHByb3BlcnR5IG5hbWVzLCB3aGljaCBhcmUgZGlmZmljdWx0IHRvIHJlZmFjdG9yLCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIC8vIGlmIHdlIHJlZmFjdG9yIHRoZSBwcm9wZXJ0eSBuYW1lLCB3ZSBjYW4gZWFzaWx5IG1pc3MgdGhlIG5vdGlmeSBjYWxsXG4gICAgICogdGhpcy5ub3RpZnkoJ2N1c3RvbVByb3BlcnR5Jyk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBBIG1vcmUgY29udmVuaWVudCB3YXkgaXMgdG8gZXhlY3V0ZSB0aGUgaW50ZXJuYWwgY2hhbmdlcyBpbiBhIHdyYXBwZXIgd2hpY2ggY2FuIGRldGVjdCB0aGUgY2hhbmdlZFxuICAgICAqIHByb3BlcnRpZXMgYW5kIHdpbGwgYXV0b21hdGljYWxseSByYWlzZSB0aGUgcmVxdWlyZWQgZXZlbnRzLiBUaGlzIGVsaW1pbmF0ZXMgdGhlIG5lZWQgdG8gbWFudWFsbHlcbiAgICAgKiByYWlzZSBldmVudHMgYW5kIHJlZmFjdG9yaW5nIGRvZXMgbm8gbG9uZ2VyIGFmZmVjdCB0aGUgcHJvY2Vzcy5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiB0aGlzLndhdGNoKCgpID0+IHtcbiAgICAgKlxuICAgICAqICAgICAgdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogICAgICAvLyB3ZSBjYW4gYWRkIG1vcmUgcHJvcGVydHkgbW9kaWZpY2F0aW9ucyB0byBub3RpZnkgaW4gaGVyZVxuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGV4ZWN1dG9yIEEgZnVuY3Rpb24gdGhhdCBwZXJmb3JtcyB0aGUgY2hhbmdlcyB3aGljaCBzaG91bGQgYmUgbm90aWZpZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgd2F0Y2ggKGV4ZWN1dG9yOiAoKSA9PiB2b2lkKSB7XG5cbiAgICAgICAgLy8gYmFjayB1cCBjdXJyZW50IGNoYW5nZWQgcHJvcGVydGllc1xuICAgICAgICBjb25zdCBwcmV2aW91c0NoYW5nZXMgPSBuZXcgTWFwKHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKTtcblxuICAgICAgICAvLyBleGVjdXRlIHRoZSBjaGFuZ2VzXG4gICAgICAgIGV4ZWN1dG9yKCk7XG5cbiAgICAgICAgLy8gYWRkIGFsbCBuZXcgb3IgdXBkYXRlZCBjaGFuZ2VkIHByb3BlcnRpZXMgdG8gdGhlIG5vdGlmeWluZyBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciAoY29uc3QgW3Byb3BlcnR5S2V5LCBvbGRWYWx1ZV0gb2YgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpIHtcblxuICAgICAgICAgICAgY29uc3QgYWRkZWQgPSAhcHJldmlvdXNDaGFuZ2VzLmhhcyhwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gIWFkZGVkICYmIHRoaXMuaGFzQ2hhbmdlZChwcm9wZXJ0eUtleSwgcHJldmlvdXNDaGFuZ2VzLmdldChwcm9wZXJ0eUtleSksIG9sZFZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKGFkZGVkIHx8IHVwZGF0ZWQpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIHZhbHVlIG9mIGEgZGVjb3JhdGVkIHByb3BlcnR5IG9yIGl0cyBhc3NvY2lhdGVkXG4gICAgICogYXR0cmlidXRlIGNoYW5nZXMuIElmIHlvdSBuZWVkIHRoZSBjb21wb25lbnQgdG8gdXBkYXRlIGJhc2VkIG9uIGEgc3RhdGUgY2hhbmdlIHRoYXQgaXNcbiAgICAgKiBub3QgY292ZXJlZCBieSBhIGRlY29yYXRlZCBwcm9wZXJ0eSwgY2FsbCB0aGlzIG1ldGhvZCB3aXRob3V0IGFueSBhcmd1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBwcm9wZXJ0eSB0aGF0IHJlcXVlc3RzIHRoZSB1cGRhdGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgdGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEByZXR1cm5zICAgICAgICAgICAgIEEgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCB3aGVuIHRoZSB1cGRhdGUgaXMgY29tcGxldGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlcXVlc3RVcGRhdGUgKHByb3BlcnR5S2V5PzogUHJvcGVydHlLZXksIG9sZFZhbHVlPzogYW55LCBuZXdWYWx1ZT86IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eUtleSkge1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259J3Mgb2JzZXJ2ZSBvcHRpb24gaXMgYGZhbHNlYCwge0BsaW5rIGhhc0NoYW5nZWR9XG4gICAgICAgICAgICAvLyB3aWxsIHJldHVybiBgZmFsc2VgIGFuZCBubyB1cGRhdGUgd2lsbCBiZSByZXF1ZXN0ZWRcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpKSByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAgICAgLy8gc3RvcmUgY2hhbmdlZCBwcm9wZXJ0eSBmb3IgYmF0Y2ggcHJvY2Vzc2luZ1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBpbiByZWZsZWN0aW5nIHN0YXRlLCBhbiBhdHRyaWJ1dGUgaXMgcmVmbGVjdGluZyB0byB0aGlzIHByb3BlcnR5IGFuZCB3ZVxuICAgICAgICAgICAgLy8gY2FuIHNraXAgcmVmbGVjdGluZyB0aGUgcHJvcGVydHkgYmFjayB0byB0aGUgYXR0cmlidXRlXG4gICAgICAgICAgICAvLyBwcm9wZXJ0eSBjaGFuZ2VzIG5lZWQgdG8gYmUgdHJhY2tlZCBob3dldmVyIGFuZCB7QGxpbmsgcmVuZGVyfSBtdXN0IGJlIGNhbGxlZCBhZnRlclxuICAgICAgICAgICAgLy8gdGhlIGF0dHJpYnV0ZSBjaGFuZ2UgaXMgcmVmbGVjdGVkIHRvIHRoaXMgcHJvcGVydHlcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNSZWZsZWN0aW5nKSB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGVucXVldWUgdXBkYXRlIHJlcXVlc3QgaWYgbm9uZSB3YXMgZW5xdWV1ZWQgYWxyZWFkeVxuICAgICAgICAgICAgdGhpcy5fZW5xdWV1ZVVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUgdG8gaXRzIHtAbGluayByZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBVc2VzIGxpdC1odG1sJ3Mge0BsaW5rIGxpdC1odG1sI3JlbmRlcn0gbWV0aG9kIHRvIHJlbmRlciBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0gdG8gdGhlXG4gICAgICogY29tcG9uZW50J3MgcmVuZGVyIHJvb3QuIFRoZSBjb21wb25lbnQgaW5zdGFuY2Ugd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHN0YXRpYyB0ZW1wbGF0ZSBtZXRob2RcbiAgICAgKiBhdXRvbWF0aWNhbGx5LiBUbyBtYWtlIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhdmFpbGFibGUgdG8gdGhlIHRlbXBsYXRlIG1ldGhvZCwgeW91IGNhbiBwYXNzIHRoZW0gdG8gdGhlXG4gICAgICogcmVuZGVyIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBjb25zdCBkYXRlRm9ybWF0dGVyID0gKGRhdGU6IERhdGUpID0+IHsgLy8gcmV0dXJuIHNvbWUgZGF0ZSB0cmFuc2Zvcm1hdGlvbi4uLlxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCcsXG4gICAgICogICAgICB0ZW1wbGF0ZTogKGVsZW1lbnQsIGZvcm1hdERhdGUpID0+IGh0bWxgPHNwYW4+TGFzdCB1cGRhdGVkOiAkeyBmb3JtYXREYXRlKGVsZW1lbnQubGFzdFVwZGF0ZWQpIH08L3NwYW4+YFxuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgQHByb3BlcnR5KClcbiAgICAgKiAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAqXG4gICAgICogICAgICByZW5kZXIgKCkge1xuICAgICAqICAgICAgICAgIC8vIG1ha2UgdGhlIGRhdGUgZm9ybWF0dGVyIGF2YWlsYWJsZSBpbiB0aGUgdGVtcGxhdGUgYnkgcGFzc2luZyBpdCB0byByZW5kZXIoKVxuICAgICAqICAgICAgICAgIHN1cGVyLnJlbmRlcihkYXRlRm9ybWF0dGVyKTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaGVscGVycyAgIEFueSBhZGRpdGlvbmFsIG9iamVjdHMgd2hpY2ggc2hvdWxkIGJlIGF2YWlsYWJsZSBpbiB0aGUgdGVtcGxhdGUgc2NvcGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVuZGVyICguLi5oZWxwZXJzOiBhbnlbXSkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gY29uc3RydWN0b3IudGVtcGxhdGUgJiYgY29uc3RydWN0b3IudGVtcGxhdGUodGhpcywgLi4uaGVscGVycyk7XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlKSByZW5kZXIodGVtcGxhdGUsIHRoaXMucmVuZGVyUm9vdCwgeyBldmVudENvbnRleHQ6IHRoaXMgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgY29tcG9uZW50IGFmdGVyIGFuIHVwZGF0ZSB3YXMgcmVxdWVzdGVkIHdpdGgge0BsaW5rIHJlcXVlc3RVcGRhdGV9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIHJlbmRlcnMgdGhlIHRlbXBsYXRlLCByZWZsZWN0cyBjaGFuZ2VkIHByb3BlcnRpZXMgdG8gYXR0cmlidXRlcyBhbmRcbiAgICAgKiBkaXNwYXRjaGVzIGNoYW5nZSBldmVudHMgZm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uLlxuICAgICAqIFRvIGhhbmRsZSB1cGRhdGVzIGRpZmZlcmVudGx5LCB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBhbmQgYSBtYXAgb2YgcHJvcGVydHlcbiAgICAgKiBjaGFuZ2VzIGlzIHByb3ZpZGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5nZXMgICBBIG1hcCBvZiBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlZCBpbiB0aGUgdXBkYXRlLCBjb250YWluZyB0aGUgcHJvcGVydHkga2V5IGFuZCB0aGUgb2xkIHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZSAoY2hhbmdlcz86IENoYW5nZXMpIHtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgIC8vIHJlZmxlY3QgYWxsIHByb3BlcnRpZXMgbWFya2VkIGZvciByZWZsZWN0aW9uXG4gICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzLmZvckVhY2goKG9sZFZhbHVlOiBhbnksIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLnJlZmxlY3RQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgQ29tcG9uZW50XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG5vdGlmeSBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvblxuICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLmZvckVhY2goKG9sZFZhbHVlLCBwcm9wZXJ0eUtleSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDb21wb25lbnRdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSBwcm9wZXJ0eSBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIHJlc29sdmVzIHRoZSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn0gZm9yIHRoZSBwcm9wZXJ0eSBhbmQgcmV0dXJucyBpdHMgcmVzdWx0LlxuICAgICAqIElmIG5vbmUgaXMgZGVmaW5lZCAodGhlIHByb3BlcnR5IGRlY2xhcmF0aW9uJ3MgYG9ic2VydmVgIG9wdGlvbiBpcyBgZmFsc2VgKSBpdCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gY2hlY2tcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEByZXR1cm5zICAgICAgICAgICAgIGB0cnVlYCBpZiB0aGUgcHJvcGVydHkgY2hhbmdlZCwgYGZhbHNlYCBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGFzQ2hhbmdlZCAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KTogYm9vbGVhbiB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gb2JzZXJ2ZSBpcyBlaXRoZXIgYGZhbHNlYCBvciBhIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKSkge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUuY2FsbChudWxsLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgdGhyb3cgQ0hBTkdFX0RFVEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IGZvciBhIGRlY29yYXRlZCBwcm9wZXJ0eVxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5IFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHdoaWNoIHRvIHJldHJpZXZlIHRoZSBkZWNsYXJhdGlvblxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRQcm9wZXJ0eURlY2xhcmF0aW9uIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBQcm9wZXJ0eURlY2xhcmF0aW9uIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBhc3NvY2lhdGVkIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSByZWZsZWN0b3IuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiByZWZsZWN0b3Ige0BsaW5rIF9yZWZsZWN0QXR0cmlidXRlfS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlTmFtZSBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0QXR0cmlidXRlIChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSk7XG5cbiAgICAgICAgLy8gaWdub3JlIHVzZXItZGVmaW5lZCBvYnNlcnZlZCBhdHRyaWJ1dGVzXG4gICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBhbmQgcmVtb3ZlIHRoZSBsb2dcbiAgICAgICAgaWYgKCFwcm9wZXJ0eUtleSkge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgb2JzZXJ2ZWQgYXR0cmlidXRlIFwiJHsgYXR0cmlidXRlTmFtZSB9XCIgbm90IGZvdW5kLi4uIGlnbm9yaW5nLi4uYCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBkb24ndCByZWZsZWN0IGlmIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGV9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzQXR0cmlidXRlUmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZS5jYWxsKHRoaXMsIGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGVdIGFzIEF0dHJpYnV0ZVJlZmxlY3RvcikoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGEgcHJvcGVydHkgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSByZWZsZWN0b3IuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiByZWZsZWN0b3Ige0BsaW5rIF9yZWZsZWN0UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBkb24ndCByZWZsZWN0IGlmIHtAbGluayBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpIHtcblxuICAgICAgICAgICAgLy8gYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIGlzIGNhbGxlZCBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gY2F0Y2ggdGhlIHN0YXRlIHRoZXJlXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNQcm9wZXJ0eVJlZmxlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHJvcGVydHlLZXkocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eV0gYXMgUHJvcGVydHlSZWZsZWN0b3IpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RQcm9wZXJ0eShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSYWlzZSBhbiBldmVudCBmb3IgYSBwcm9wZXJ0eSBjaGFuZ2VcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eU5vdGlmaWVyfSBoYXMgYmVlbiBkZWZpbmVkIGZvciB0aGVcbiAgICAgKiBwcm9wZXJ0eSBhbmQgaW52b2tlcyB0aGUgYXBwcm9wcmlhdGUgbm90aWZpZXIuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiBub3RpZmllciB7QGxpbmsgX25vdGlmeVByb3BlcnR5fS5cbiAgICAgKlxuICAgICAqIEl0IGNhdGNoZXMgYW55IGVycm9yIGluIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmFpc2UgYW4gZXZlbnQgZm9yXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSB7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5Tm90aWZpZXIocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeS5jYWxsKHRoaXMsIHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5XSBhcyBQcm9wZXJ0eU5vdGlmaWVyKShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeVByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgY29tcG9uZW50J3MgcmVuZGVyIHJvb3RcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHJlbmRlciByb290IGlzIHdoZXJlIHRoZSB7QGxpbmsgcmVuZGVyfSBtZXRob2Qgd2lsbCBhdHRhY2ggaXRzIERPTSBvdXRwdXQuIFdoZW4gdXNpbmcgdGhlIGNvbXBvbmVudFxuICAgICAqIHdpdGggc2hhZG93IG1vZGUsIGl0IHdpbGwgYmUgYSB7QGxpbmsgU2hhZG93Um9vdH0sIG90aGVyd2lzZSBpdCB3aWxsIGJlIHRoZSBjb21wb25lbnQgaXRzZWxmLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jcmVhdGVSZW5kZXJSb290ICgpOiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCB7XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLnNoYWRvd1xuICAgICAgICAgICAgPyB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KVxuICAgICAgICAgICAgOiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGNvbXBvbmVudCdzIHN0eWxlcyB0byBpdHMge0BsaW5rIHJlbmRlclJvb3R9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIGNvbnN0cnVjdGFibGUgc3R5bGVzaGVldHMgYXJlIGF2YWlsYWJsZSwgdGhlIGNvbXBvbmVudCdzIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZSB3aWxsIGJlIGFkb3B0ZWRcbiAgICAgKiBieSB0aGUge0BsaW5rIFNoYWRvd1Jvb3R9LiBJZiBub3QsIGEgc3R5bGUgZWxlbWVudCBpcyBjcmVhdGVkIGFuZCBhdHRhY2hlZCB0byB0aGUge0BsaW5rIFNoYWRvd1Jvb3R9LiBJZiB0aGVcbiAgICAgKiBjb21wb25lbnQgaXMgbm90IHVzaW5nIHNoYWRvdyBtb2RlLCBhIHNjcmlwdCB0YWcgd2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQncyBgPGhlYWQ+YC4gRm9yIG11bHRpcGxlXG4gICAgICogaW5zdGFuY2VzIG9mIHRoZSBzYW1lIGNvbXBvbmVudCBvbmx5IG9uZSBzdHlsZXNoZWV0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9hZG9wdFN0eWxlcyAoKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG4gICAgICAgIGNvbnN0IHN0eWxlU2hlZXQgPSBjb25zdHJ1Y3Rvci5zdHlsZVNoZWV0O1xuICAgICAgICBjb25zdCBzdHlsZUVsZW1lbnQgPSBjb25zdHJ1Y3Rvci5zdHlsZUVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IGNvbnN0cnVjdG9yLnN0eWxlcztcblxuICAgICAgICBpZiAoc3R5bGVTaGVldCkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB0ZXN0IHRoaXMgcGFydCBvbmNlIHdlIGhhdmUgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyAoQ2hyb21lIDczKVxuICAgICAgICAgICAgaWYgKCFjb25zdHJ1Y3Rvci5zaGFkb3cpIHtcblxuICAgICAgICAgICAgICAgIGlmICgoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cy5pbmNsdWRlcyhzdHlsZVNoZWV0KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIC4uLihkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCB3b3JrIG9uY2UgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcnJpdmVcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL3dpY2cuZ2l0aHViLmlvL2NvbnN0cnVjdC1zdHlsZXNoZWV0cy9cbiAgICAgICAgICAgICAgICAodGhpcy5yZW5kZXJSb290IGFzIFNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtzdHlsZVNoZWV0XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKHN0eWxlRWxlbWVudCkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB0ZXN0IHdlIGRvbid0IGR1cGxpY2F0ZSBzdHlsZXNoZWV0cyBmb3Igbm9uLXNoYWRvdyBlbGVtZW50c1xuICAgICAgICAgICAgY29uc3Qgc3R5bGVBbHJlYWR5QWRkZWQgPSBjb25zdHJ1Y3Rvci5zaGFkb3dcbiAgICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICAgICAgOiBBcnJheS5mcm9tKGRvY3VtZW50LnN0eWxlU2hlZXRzKS5maW5kKHN0eWxlID0+IHN0eWxlLnRpdGxlID09PSBjb25zdHJ1Y3Rvci5zZWxlY3RvcikgJiYgdHJ1ZSB8fCBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHN0eWxlQWxyZWFkeUFkZGVkKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIGNsb25lIHRoZSBjYWNoZWQgc3R5bGUgZWxlbWVudFxuICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSBzdHlsZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29uc3RydWN0b3Iuc2hhZG93KSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb3QuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGlzIGRlZmluZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSB0aGlzXG4gICAgICogbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCB0aGUgYXR0cmlidXRlIHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0QXR0cmlidXRlIChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlEZWNsYXJhdGlvbi5jb252ZXJ0ZXIuZnJvbUF0dHJpYnV0ZS5jYWxsKHRoaXMsIG5ld1ZhbHVlKTtcblxuICAgICAgICB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdID0gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgZm9yIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBhIGRlY2xhcmF0aW9uXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBpZiB0aGUgZGVmYXVsdCByZWZsZWN0b3IgaXMgdXNlZCwgd2UgbmVlZCB0byBjaGVjayBpZiBhbiBhdHRyaWJ1dGUgZm9yIHRoaXMgcHJvcGVydHkgZXhpc3RzXG4gICAgICAgIC8vIGlmIG5vdCwgd2Ugd29uJ3QgcmVmbGVjdFxuICAgICAgICBpZiAoIXByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSwgaXQncyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gcHJvcGVydHlEZWNsYXJhdGlvbi5hdHRyaWJ1dGUgYXMgc3RyaW5nO1xuXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLnRvQXR0cmlidXRlLmNhbGwodGhpcywgbmV3VmFsdWUpO1xuXG4gICAgICAgIC8vIHVuZGVmaW5lZCBtZWFucyBkb24ndCBjaGFuZ2VcbiAgICAgICAgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIG51bGwgbWVhbnMgcmVtb3ZlIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgZWxzZSBpZiAoYXR0cmlidXRlVmFsdWUgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBwcm9wZXJ0eS1jaGFuZ2VkIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXlcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSk6IHZvaWQge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGNyZWF0ZUV2ZW50TmFtZShwcm9wZXJ0eUtleSwgJycsICdjaGFuZ2VkJyk7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogcHJvcGVydHlLZXksXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IG9sZFZhbHVlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgbGlmZWN5Y2xlIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gbGlmZWN5Y2xlIFRoZSBsaWZlY3ljbGUgZm9yIHdoaWNoIHRvIHJhaXNlIHRoZSBldmVudCAod2lsbCBiZSB0aGUgZXZlbnQgbmFtZSlcbiAgICAgKiBAcGFyYW0gZGV0YWlsICAgIE9wdGlvbmFsIGV2ZW50IGRldGFpbHNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbm90aWZ5TGlmZWN5Y2xlIChsaWZlY3ljbGU6ICdhZG9wdGVkJyB8ICdjb25uZWN0ZWQnIHwgJ2Rpc2Nvbm5lY3RlZCcgfCAndXBkYXRlJywgZGV0YWlsPzogb2JqZWN0KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChsaWZlY3ljbGUsIHtcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgLi4uKGRldGFpbCA/IHsgZGV0YWlsOiBkZXRhaWwgfSA6IHt9KVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2xpc3RlbiAoKSB7XG5cbiAgICAgICAgKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkubGlzdGVuZXJzLmZvckVhY2goKGRlY2xhcmF0aW9uLCBsaXN0ZW5lcikgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZURlY2xhcmF0aW9uOiBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb3B5IHRoZSBjbGFzcydzIHN0YXRpYyBsaXN0ZW5lciBkZWNsYXJhdGlvbiBpbnRvIGFuIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGRlY2xhcmF0aW9uLmV2ZW50LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGRlY2xhcmF0aW9uLm9wdGlvbnMsXG5cbiAgICAgICAgICAgICAgICAvLyBiaW5kIHRoZSBjb21wb25lbnRzIGxpc3RlbmVyIG1ldGhvZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICBsaXN0ZW5lcjogKHRoaXNbbGlzdGVuZXIgYXMga2V5b2YgdGhpc10gYXMgdW5rbm93biBhcyBFdmVudExpc3RlbmVyKS5iaW5kKHRoaXMpLFxuXG4gICAgICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBldmVudCB0YXJnZXQgYW5kIHN0b3JlIGl0IGluIHRoZSBpbnN0YW5jZSBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIHRhcmdldDogKGRlY2xhcmF0aW9uLnRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgPyAodHlwZW9mIGRlY2xhcmF0aW9uLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZGVjbGFyYXRpb24udGFyZ2V0LmNhbGwodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZGVjbGFyYXRpb24udGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgIDogdGhpc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gYWRkIHRoZSBib3VuZCBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24uZXZlbnQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi5vcHRpb25zKTtcblxuICAgICAgICAgICAgLy8gc2F2ZSB0aGUgaW5zdGFuY2UgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW4gdGhlIGNvbXBvbmVudCBpbnN0YW5jZVxuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJEZWNsYXJhdGlvbnMucHVzaChpbnN0YW5jZURlY2xhcmF0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGNvbXBvbmVudCBsaXN0ZW5lcnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdW5saXN0ZW4gKCkge1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2xhcmF0aW9uKSA9PiB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLmV2ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5saXN0ZW5lcixcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5xdWV1ZSBhIHJlcXVlc3QgZm9yIGFuIGFzeW5jaHJvbm91cyB1cGRhdGVcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfZW5xdWV1ZVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgbGV0IHJlc29sdmU6IChyZXN1bHQ6IGJvb2xlYW4pID0+IHZvaWQ7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNSZXF1ZXN0ID0gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAvLyBtYXJrIHRoZSBjb21wb25lbnQgYXMgaGF2aW5nIHJlcXVlc3RlZCBhbiB1cGRhdGUsIHRoZSB7QGxpbmsgX3JlcXVlc3RVcGRhdGV9XG4gICAgICAgIC8vIG1ldGhvZCB3aWxsIG5vdCBlbnF1ZXVlIGEgZnVydGhlciByZXF1ZXN0IGZvciB1cGRhdGUgaWYgb25lIGlzIHNjaGVkdWxlZFxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJlcXVlc3QgPSBuZXcgUHJvbWlzZTxib29sZWFuPihyZXMgPT4gcmVzb2x2ZSA9IHJlcyk7XG5cbiAgICAgICAgLy8gd2FpdCBmb3IgdGhlIHByZXZpb3VzIHVwZGF0ZSB0byByZXNvbHZlXG4gICAgICAgIC8vIGBhd2FpdGAgaXMgYXN5bmNocm9ub3VzIGFuZCB3aWxsIHJldHVybiBleGVjdXRpb24gdG8gdGhlIHtAbGluayByZXF1ZXN0VXBkYXRlfSBtZXRob2RcbiAgICAgICAgLy8gYW5kIGVzc2VudGlhbGx5IGFsbG93cyB1cyB0byBiYXRjaCBtdWx0aXBsZSBzeW5jaHJvbm91cyBwcm9wZXJ0eSBjaGFuZ2VzLCBiZWZvcmUgdGhlXG4gICAgICAgIC8vIGV4ZWN1dGlvbiBjYW4gcmVzdW1lIGhlcmVcbiAgICAgICAgYXdhaXQgcHJldmlvdXNSZXF1ZXN0O1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3NjaGVkdWxlVXBkYXRlKCk7XG5cbiAgICAgICAgLy8gdGhlIGFjdHVhbCB1cGRhdGUgbWF5IGJlIHNjaGVkdWxlZCBhc3luY2hyb25vdXNseSBhcyB3ZWxsXG4gICAgICAgIGlmIChyZXN1bHQpIGF3YWl0IHJlc3VsdDtcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBuZXcge0BsaW5rIF91cGRhdGVSZXF1ZXN0fSBhZnRlciB0aGUgcmVzdWx0IG9mIHRoZSBjdXJyZW50IHVwZGF0ZSByZXNvbHZlc1xuICAgICAgICByZXNvbHZlISghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTY2hlZHVsZSB0aGUgdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2NoZWR1bGVzIHRoZSBmaXJzdCB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCBhcyBzb29uIGFzIHBvc3NpYmxlIGFuZCBhbGwgY29uc2VjdXRpdmUgdXBkYXRlc1xuICAgICAqIGp1c3QgYmVmb3JlIHRoZSBuZXh0IGZyYW1lLiBJbiB0aGUgbGF0dGVyIGNhc2UgaXQgcmV0dXJucyBhIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCBhZnRlclxuICAgICAqIHRoZSB1cGRhdGUgaXMgZG9uZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2NoZWR1bGVVcGRhdGUgKCk6IFByb21pc2U8dm9pZD4gfCB2b2lkIHtcblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1VwZGF0ZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIHNjaGVkdWxlIHRoZSB1cGRhdGUgdmlhIHJlcXVlc3RBbmltYXRpb25GcmFtZSB0byBhdm9pZCBtdWx0aXBsZSByZWRyYXdzIHBlciBmcmFtZVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gdGhlIGNvbXBvbmVudCB1cGRhdGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSW52b2tlcyB7QGxpbmsgdXBkYXRlQ2FsbGJhY2t9IGFmdGVyIHBlcmZvcm1pbmcgdGhlIHVwZGF0ZSBhbmQgY2xlYW5zIHVwIHRoZSBjb21wb25lbnRcbiAgICAgKiBzdGF0ZS4gRHVyaW5nIHRoZSBmaXJzdCB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZXMgd2lsbCBiZSBhZGRlZC4gRGlzcGF0Y2hlcyB0aGUgdXBkYXRlXG4gICAgICogbGlmZWN5Y2xlIGV2ZW50LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wZXJmb3JtVXBkYXRlICgpIHtcblxuICAgICAgICAvLyB3ZSBoYXZlIHRvIHdhaXQgdW50aWwgdGhlIGNvbXBvbmVudCBpcyBjb25uZWN0ZWQgYmVmb3JlIHdlIGNhbiBkbyBhbnkgdXBkYXRlc1xuICAgICAgICAvLyB0aGUge0BsaW5rIGNvbm5lY3RlZENhbGxiYWNrfSB3aWxsIGNhbGwge0BsaW5rIHJlcXVlc3RVcGRhdGV9IGluIGFueSBjYXNlLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8gc2ltcGx5IGJ5cGFzcyBhbnkgYWN0dWFsIHVwZGF0ZSBhbmQgY2xlYW4tdXAgdW50aWwgdGhlblxuICAgICAgICBpZiAodGhpcy5pc0Nvbm5lY3RlZCkge1xuXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIHBhc3MgYSBjb3B5IG9mIHRoZSBwcm9wZXJ0eSBjaGFuZ2VzIHRvIHRoZSB1cGRhdGUgbWV0aG9kLCBzbyBwcm9wZXJ0eSBjaGFuZ2VzXG4gICAgICAgICAgICAvLyBhcmUgYXZhaWxhYmxlIGluIGFuIG92ZXJyaWRkZW4gdXBkYXRlIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy51cGRhdGUoY2hhbmdlcyk7XG5cbiAgICAgICAgICAgIC8vIHJlc2V0IHByb3BlcnR5IG1hcHMgZGlyZWN0bHkgYWZ0ZXIgdGhlIHVwZGF0ZSwgc28gY2hhbmdlcyBkdXJpbmcgdGhlIHVwZGF0ZUNhbGxiYWNrXG4gICAgICAgICAgICAvLyBjYW4gYmUgcmVjb3JkZWQgZm9yIHRoZSBuZXh0IHVwZGF0ZSwgd2hpY2ggaGFzIHRvIGJlIHRyaWdnZXJlZCBtYW51YWxseSB0aG91Z2hcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgZmlyc3QgdXBkYXRlIHdlIGFkb3B0IHRoZSBlbGVtZW50J3Mgc3R5bGVzIGFuZCBzZXQgdXAgZGVjbGFyZWQgbGlzdGVuZXJzXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2hhc1VwZGF0ZWQpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2Fkb3B0U3R5bGVzKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBiaW5kIGxpc3RlbmVycyBhZnRlciB0aGUgdXBkYXRlLCB0aGlzIHdheSB3ZSBlbnN1cmUgYWxsIERPTSBpcyByZW5kZXJlZCwgYWxsIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAvLyBhcmUgdXAtdG8tZGF0ZSBhbmQgYW55IHVzZXItY3JlYXRlZCBvYmplY3RzIChlLmcuIHdvcmtlcnMpIHdpbGwgYmUgY3JlYXRlZCBpbiBhblxuICAgICAgICAgICAgICAgIC8vIG92ZXJyaWRkZW4gY29ubmVjdGVkQ2FsbGJhY2tcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51cGRhdGVDYWxsYmFjayhjaGFuZ2VzLCAhdGhpcy5faGFzVXBkYXRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgndXBkYXRlJywgeyBjaGFuZ2VzOiBjaGFuZ2VzLCBmaXJzdFVwZGF0ZTogIXRoaXMuX2hhc1VwZGF0ZWQgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2hhc1VwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFyayBjb21wb25lbnQgYXMgdXBkYXRlZCAqYWZ0ZXIqIHRoZSB1cGRhdGUgdG8gcHJldmVudCBpbmZpbnRlIGxvb3BzIGluIHRoZSB1cGRhdGUgcHJvY2Vzc1xuICAgICAgICAvLyBOLkIuOiBhbnkgcHJvcGVydHkgY2hhbmdlcyBkdXJpbmcgdGhlIHVwZGF0ZSB3aWxsIG5vdCB0cmlnZ2VyIGFub3RoZXIgdXBkYXRlXG4gICAgICAgIHRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSA9IGZhbHNlO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQSBzaW1wbGUgY3NzIHRlbXBsYXRlIGxpdGVyYWwgdGFnXG4gKlxuICogQHJlbWFya3NcbiAqIFRoZSB0YWcgaXRzZWxmIGRvZXNuJ3QgZG8gYW55dGhpbmcgdGhhdCBhbiB1bnRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFsIHdvdWxkbid0IGRvLCBidXQgaXQgY2FuIGJlIHVzZWQgYnlcbiAqIGVkaXRvciBwbHVnaW5zIHRvIGluZmVyIHRoZSBcInZpcnR1YWwgZG9jdW1lbnQgdHlwZVwiIHRvIHByb3ZpZGUgY29kZSBjb21wbGV0aW9uIGFuZCBoaWdobGlnaHRpbmcuIEl0IGNvdWxkXG4gKiBhbHNvIGJlIHVzZWQgaW4gdGhlIGZ1dHVyZSB0byBtb3JlIHNlY3VyZWx5IGNvbnZlcnQgc3Vic3RpdHV0aW9ucyBpbnRvIHN0cmluZ3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuICpcbiAqIGNvbnN0IG1peGluQm94ID0gKGJvcmRlcldpZHRoOiBzdHJpbmcgPSAnMXB4JywgYm9yZGVyQ29sb3I6IHN0cmluZyA9ICdzaWx2ZXInKSA9PiBjc3NgXG4gKiAgIGRpc3BsYXk6IGJsb2NrO1xuICogICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICogICBib3JkZXI6ICR7Ym9yZGVyV2lkdGh9IHNvbGlkICR7Ym9yZGVyQ29sb3J9O1xuICogYDtcbiAqXG4gKiBjb25zdCBtaXhpbkhvdmVyID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+IGNzc2BcbiAqICR7IHNlbGVjdG9yIH06aG92ZXIge1xuICogICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ob3Zlci1jb2xvciwgZG9kZ2VyYmx1ZSk7XG4gKiB9XG4gKiBgO1xuICpcbiAqIGNvbnN0IHN0eWxlcyA9IGNzc2BcbiAqIDpob3N0IHtcbiAqICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbiAqICAgZGlzcGxheTogYmxvY2s7XG4gKiAgICR7IG1peGluQm94KCkgfVxuICogfVxuICogJHsgbWl4aW5Ib3ZlcignOmhvc3QnKSB9XG4gKiA6OnNsb3R0ZWQoKikge1xuICogICBtYXJnaW46IDA7XG4gKiB9XG4gKiBgO1xuICpcbiAqIC8vIHdpbGwgcHJvZHVjZS4uLlxuICogOmhvc3Qge1xuICogLS1ob3Zlci1jb2xvcjogZ3JlZW47XG4gKiBkaXNwbGF5OiBibG9jaztcbiAqXG4gKiBkaXNwbGF5OiBibG9jaztcbiAqIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gKiBib3JkZXI6IDFweCBzb2xpZCBzaWx2ZXI7XG4gKlxuICogfVxuICpcbiAqIDpob3N0OmhvdmVyIHtcbiAqIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbiAqIH1cbiAqXG4gKiA6OnNsb3R0ZWQoKikge1xuICogbWFyZ2luOiAwO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBjc3MgPSAobGl0ZXJhbHM6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5zdWJzdGl0dXRpb25zOiBhbnlbXSkgPT4ge1xuXG4gICAgcmV0dXJuIHN1YnN0aXR1dGlvbnMucmVkdWNlKChwcmV2OiBzdHJpbmcsIGN1cnI6IGFueSwgaTogbnVtYmVyKSA9PiBwcmV2ICsgY3VyciArIGxpdGVyYWxzW2kgKyAxXSwgbGl0ZXJhbHNbMF0pO1xufTtcblxuLy8gY29uc3QgY29sb3IgPSAnZ3JlZW4nO1xuXG4vLyBjb25zdCBtaXhpbkJveCA9IChib3JkZXJXaWR0aDogc3RyaW5nID0gJzFweCcsIGJvcmRlckNvbG9yOiBzdHJpbmcgPSAnc2lsdmVyJykgPT4gY3NzYFxuLy8gICBkaXNwbGF5OiBibG9jaztcbi8vICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbi8vICAgYm9yZGVyOiAke2JvcmRlcldpZHRofSBzb2xpZCAke2JvcmRlckNvbG9yfTtcbi8vIGA7XG5cbi8vIGNvbnN0IG1peGluSG92ZXIgPSAoc2VsZWN0b3I6IHN0cmluZykgPT4gY3NzYFxuLy8gJHsgc2VsZWN0b3IgfTpob3ZlciB7XG4vLyAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbi8vIH1cbi8vIGA7XG5cbi8vIGNvbnN0IHN0eWxlcyA9IGNzc2Bcbi8vIDpob3N0IHtcbi8vICAgLS1ob3Zlci1jb2xvcjogJHsgY29sb3IgfTtcbi8vICAgZGlzcGxheTogYmxvY2s7XG4vLyAgICR7IG1peGluQm94KCkgfVxuLy8gfVxuXG4vLyAkeyBtaXhpbkhvdmVyKCc6aG9zdCcpIH1cblxuLy8gOjpzbG90dGVkKCopIHtcbi8vICAgbWFyZ2luOiAwO1xuLy8gfVxuLy8gYDtcblxuLy8gY29uc29sZS5sb2coc3R5bGVzKTtcbiIsImV4cG9ydCBjb25zdCBBcnJvd1VwID0gJ0Fycm93VXAnO1xuZXhwb3J0IGNvbnN0IEFycm93RG93biA9ICdBcnJvd0Rvd24nO1xuZXhwb3J0IGNvbnN0IEFycm93TGVmdCA9ICdBcnJvd0xlZnQnO1xuZXhwb3J0IGNvbnN0IEFycm93UmlnaHQgPSAnQXJyb3dSaWdodCc7XG5leHBvcnQgY29uc3QgRW50ZXIgPSAnRW50ZXInO1xuZXhwb3J0IGNvbnN0IEVzY2FwZSA9ICdFc2NhcGUnO1xuZXhwb3J0IGNvbnN0IFNwYWNlID0gJyAnO1xuZXhwb3J0IGNvbnN0IFRhYiA9ICdUYWInO1xuZXhwb3J0IGNvbnN0IEJhY2tzcGFjZSA9ICdCYWNrc3BhY2UnO1xuZXhwb3J0IGNvbnN0IEFsdCA9ICdBbHQnO1xuZXhwb3J0IGNvbnN0IFNoaWZ0ID0gJ1NoaWZ0JztcbmV4cG9ydCBjb25zdCBDb250cm9sID0gJ0NvbnRyb2wnO1xuZXhwb3J0IGNvbnN0IE1ldGEgPSAnTWV0YSc7XG4iLCJpbXBvcnQgeyBBcnJvd0Rvd24sIEFycm93TGVmdCwgQXJyb3dSaWdodCwgQXJyb3dVcCB9IGZyb20gJy4va2V5cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2ZUl0ZW1DaGFuZ2U8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEN1c3RvbUV2ZW50IHtcbiAgICB0eXBlOiAnYWN0aXZlLWl0ZW0tY2hhbmdlJztcbiAgICBkZXRhaWw6IHtcbiAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgIGluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpdGVtOiBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudHlwZSBMaXN0RW50cnk8VCBleHRlbmRzIExpc3RJdGVtPiA9IFtudW1iZXIgfCB1bmRlZmluZWQsIFQgfCB1bmRlZmluZWRdO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTGlzdEtleU1hbmFnZXI8VCBleHRlbmRzIExpc3RJdGVtPiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblxuICAgIHByb3RlY3RlZCBhY3RpdmVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZUl0ZW06IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgbGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBpdGVtVHlwZTogYW55O1xuXG4gICAgcHVibGljIGl0ZW1zOiBUW107XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHB1YmxpYyBob3N0OiBIVE1MRWxlbWVudCxcbiAgICAgICAgaXRlbXM6IE5vZGVMaXN0T2Y8VD4sXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gQXJyYXkuZnJvbShpdGVtcyk7XG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSB0aGlzLml0ZW1zWzBdICYmIHRoaXMuaXRlbXNbMF0uY29uc3RydWN0b3I7XG5cbiAgICAgICAgdGhpcy5iaW5kSG9zdCgpO1xuICAgIH1cblxuICAgIGdldEFjdGl2ZUl0ZW0gKCk6IFQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUl0ZW07XG4gICAgfTtcblxuICAgIHNldEFjdGl2ZUl0ZW0gKGl0ZW06IFQsIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgY29uc3QgZW50cnk6IExpc3RFbnRyeTxUPiA9IFtcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpdGVtIDogdW5kZWZpbmVkXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldE5leHRJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldE5leHRFbnRyeSgpLCBpbnRlcmFjdGl2ZSk7XG4gICAgfVxuXG4gICAgc2V0UHJldmlvdXNJdGVtQWN0aXZlIChpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZSh0aGlzLmdldFByZXZpb3VzRW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIHNldEZpcnN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRGaXJzdEVudHJ5KCksIGludGVyYWN0aXZlKTtcbiAgICB9XG5cbiAgICBzZXRMYXN0SXRlbUFjdGl2ZSAoaW50ZXJhY3RpdmUgPSBmYWxzZSkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRMYXN0RW50cnkoKSwgaW50ZXJhY3RpdmUpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgW3ByZXYsIG5leHRdID0gKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gW0Fycm93TGVmdCwgQXJyb3dSaWdodF0gOiBbQXJyb3dVcCwgQXJyb3dEb3duXTtcbiAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIHByZXY6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBuZXh0OlxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXROZXh0SXRlbUFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZWRvd24gKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0OiBUIHwgbnVsbCA9IGV2ZW50LnRhcmdldCBhcyBUIHwgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5pdGVtVHlwZSAmJiB0YXJnZXQgaW5zdGFuY2VvZiB0aGlzLml0ZW1UeXBlICYmICF0YXJnZXQhLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXQgYXMgVCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHRoaXMuZGlzcGF0Y2hBY3RpdmVJdGVtQ2hhbmdlKHByZXZJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVGb2N1cyAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblxuICAgICAgICBjb25zdCB0YXJnZXQ6IFQgfCBudWxsID0gZXZlbnQudGFyZ2V0IGFzIFQgfCBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLml0ZW1UeXBlICYmIHRhcmdldCBpbnN0YW5jZW9mIHRoaXMuaXRlbVR5cGUgJiYgIXRhcmdldCEuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldCBhcyBULCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UgKHByZXZpb3VzSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50OiBBY3RpdmVJdGVtQ2hhbmdlPFQ+ID0gbmV3IEN1c3RvbUV2ZW50KCdhY3RpdmUtaXRlbS1jaGFuZ2UnLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHByZXZpb3VzSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06ICh0eXBlb2YgcHJldmlvdXNJbmRleCA9PT0gJ251bWJlcicpID8gdGhpcy5pdGVtc1twcmV2aW91c0luZGV4XSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgICAgICAgICBpbmRleDogdGhpcy5hY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogdGhpcy5hY3RpdmVJdGVtXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSBhcyBBY3RpdmVJdGVtQ2hhbmdlPFQ+O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+LCBpbnRlcmFjdGl2ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV0gPSBlbnRyeTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TmV4dEVudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAtMTtcblxuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBuZXh0SW5kZXggPSBmcm9tSW5kZXggKyAxO1xuICAgICAgICBsZXQgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zW25leHRJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKG5leHRJbmRleCA8IGxhc3RJbmRleCAmJiBuZXh0SXRlbSAmJiBuZXh0SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBuZXh0SXRlbSA9IHRoaXMuaXRlbXNbKytuZXh0SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChuZXh0SXRlbSAmJiAhbmV4dEl0ZW0uZGlzYWJsZWQpID8gW25leHRJbmRleCwgbmV4dEl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFByZXZpb3VzRW50cnkgKGZyb21JbmRleD86IG51bWJlcik6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgZnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgPyBmcm9tSW5kZXhcbiAgICAgICAgICAgIDogKHR5cGVvZiB0aGlzLmFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlSW5kZXhcbiAgICAgICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgbGV0IHByZXZJbmRleCA9IGZyb21JbmRleCAtIDE7XG4gICAgICAgIGxldCBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbcHJldkluZGV4XTtcblxuICAgICAgICB3aGlsZSAocHJldkluZGV4ID4gMCAmJiBwcmV2SXRlbSAmJiBwcmV2SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbLS1wcmV2SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChwcmV2SXRlbSAmJiAhcHJldkl0ZW0uZGlzYWJsZWQpID8gW3ByZXZJbmRleCwgcHJldkl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEZpcnN0RW50cnkgKCk6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEVudHJ5KC0xKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TGFzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFByZXZpb3VzRW50cnkodGhpcy5pdGVtcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBiaW5kSG9zdCAoKSB7XG5cbiAgICAgICAgLy8gVE9ETzogZW5hYmxlIHJlY29ubmVjdGluZyB0aGUgaG9zdCBlbGVtZW50PyBubyBuZWVkIGlmIEZvY3VzTWFuYWdlciBpcyBjcmVhdGVkIGluIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IE1hcChbXG4gICAgICAgICAgICBbJ2ZvY3VzaW4nLCB0aGlzLmhhbmRsZUZvY3VzLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnZGlzY29ubmVjdGVkJywgdGhpcy51bmJpbmRIb3N0LmJpbmQodGhpcyldXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVuYmluZEhvc3QgKCkge1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9jdXNLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBMaXN0S2V5TWFuYWdlcjxUPiB7XG5cbiAgICBwcm90ZWN0ZWQgc2V0RW50cnlBY3RpdmUgKGVudHJ5OiBMaXN0RW50cnk8VD4sIGludGVyYWN0aXZlID0gZmFsc2UpIHtcblxuICAgICAgICBzdXBlci5zZXRFbnRyeUFjdGl2ZShlbnRyeSwgaW50ZXJhY3RpdmUpO1xuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW0gJiYgaW50ZXJhY3RpdmUpIHRoaXMuYWN0aXZlSXRlbS5mb2N1cygpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQ8SWNvbj4oe1xuICAgIHNlbGVjdG9yOiAndWktaWNvbicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgIHdpZHRoOiB2YXIoLS1saW5lLWhlaWdodCwgMS41ZW0pO1xuICAgICAgICBoZWlnaHQ6IHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSk7XG4gICAgICAgIHBhZGRpbmc6IGNhbGMoKHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSkgLSB2YXIoLS1mb250LXNpemUsIDFlbSkpIC8gMik7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgICAgICBmb250LXNpemU6IGluaGVyaXQ7XG4gICAgICAgIHZlcnRpY2FsLWFsaWduOiBib3R0b207XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgfVxuICAgIHN2ZyB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBpbmhlcml0O1xuICAgICAgICBmb250LXNpemU6IGluaGVyaXQ7XG4gICAgICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICAgICAgICBmaWxsOiB2YXIoLS1pY29uLWNvbG9yLCBjdXJyZW50Q29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbZGF0YS1zZXQ9dW5pXSkge1xuICAgICAgICBwYWRkaW5nOiAwZW07XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD1tYXRdKSB7XG4gICAgICAgIHBhZGRpbmc6IDA7XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD1laV0pIHtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IChlbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNldCA9IGVsZW1lbnQuc2V0O1xuICAgICAgICBjb25zdCBpY29uID0gKHNldCA9PT0gJ21hdCcpXG4gICAgICAgICAgICA/IGBpY18keyBlbGVtZW50Lmljb24gfV8yNHB4YFxuICAgICAgICAgICAgOiAoc2V0ID09PSAnZWknKVxuICAgICAgICAgICAgICAgID8gYGVpLSR7IGVsZW1lbnQuaWNvbiB9LWljb25gXG4gICAgICAgICAgICAgICAgOiBlbGVtZW50Lmljb247XG5cbiAgICAgICAgcmV0dXJuIGh0bWxgXG4gICAgICAgIDxzdmcgZm9jdXNhYmxlPVwiZmFsc2VcIj5cbiAgICAgICAgICAgIDx1c2UgaHJlZj1cIiR7IChlbGVtZW50LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBJY29uKS5nZXRTcHJpdGUoc2V0KSB9IyR7IGljb24gfVwiXG4gICAgICAgICAgICB4bGluazpocmVmPVwiJHsgKGVsZW1lbnQuY29uc3RydWN0b3IgYXMgdHlwZW9mIEljb24pLmdldFNwcml0ZShzZXQpIH0jJHsgaWNvbiB9XCIgLz5cbiAgICAgICAgPC9zdmc+YDtcbiAgICB9XG59KVxuZXhwb3J0IGNsYXNzIEljb24gZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgZm9yIGNhY2hpbmcgYW4gaWNvbiBzZXQncyBzcHJpdGUgdXJsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN0YXRpYyBfc3ByaXRlczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgc3ZnIHNwcml0ZSB1cmwgZm9yIHRoZSByZXF1ZXN0ZWQgaWNvbiBzZXRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHNwcml0ZSB1cmwgZm9yIGFuIGljb24gc2V0IGNhbiBiZSBzZXQgdGhyb3VnaCBhIGBtZXRhYCB0YWcgaW4gdGhlIGh0bWwgZG9jdW1lbnQuIFlvdSBjYW4gZGVmaW5lXG4gICAgICogY3VzdG9tIGljb24gc2V0cyBieSBjaG9zaW5nIGFuIGlkZW50aWZpZXIgKHN1Y2ggYXMgYDpteXNldGAgaW5zdGVhZCBvZiBgOmZhYCwgYDptYXRgIG9yIGA6aWVgKSBhbmRcbiAgICAgKiBjb25maWd1cmluZyBpdHMgbG9jYXRpb24uXG4gICAgICpcbiAgICAgKiBgYGBodG1sXG4gICAgICogPCFkb2N0eXBlIGh0bWw+XG4gICAgICogPGh0bWw+XG4gICAgICogICAgPGhlYWQ+XG4gICAgICogICAgPCEtLSBzdXBwb3J0cyBtdWx0aXBsZSBzdmcgc3ByaXRlcyAtLT5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOmZhXCIgY29udGVudD1cImFzc2V0cy9pY29ucy9zcHJpdGVzL2ZvbnQtYXdlc29tZS9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOm1hdFwiIGNvbnRlbnQ9XCJhc3NldHMvaWNvbnMvc3ByaXRlcy9tYXRlcmlhbC9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOmVpXCIgY29udGVudD1cImFzc2V0cy9pY29uL3Nwcml0ZXMvZXZpbC1pY29ucy9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8IS0tIHN1cHBvcnRzIGN1c3RvbSBzdmcgc3ByaXRlcyAtLT5cbiAgICAgKiAgICA8bWV0YSBuYW1lPVwidWktaWNvbjpzdmctc3ByaXRlOm15c2V0XCIgY29udGVudD1cImFzc2V0cy9pY29uL3Nwcml0ZXMvbXlzZXQvbXlfc3ByaXRlLnN2Z1wiIC8+XG4gICAgICogICAgPC9oZWFkPlxuICAgICAqICAgIC4uLlxuICAgICAqIDwvaHRtbD5cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIFdoZW4gdXNpbmcgdGhlIGljb24gZWxlbWVudCwgc3BlY2lmeSB5b3VyIGN1c3RvbSBpY29uIHNldC5cbiAgICAgKlxuICAgICAqIGBgYGh0bWxcbiAgICAgKiA8IS0tIHVzZSBhdHRyaWJ1dGVzIC0tPlxuICAgICAqIDx1aS1pY29uIGRhdGEtaWNvbj1cIm15X2ljb25faWRcIiBkYXRhLXNldD1cIm15c2V0XCI+PC91aS1pY29uPlxuICAgICAqIDwhLS0gb3IgdXNlIHByb3BlcnR5IGJpbmRpbmdzIHdpdGhpbiBsaXQtaHRtbCB0ZW1wbGF0ZXMgLS0+XG4gICAgICogPHVpLWljb24gLmljb249JHsnbXlfaWNvbl9pZCd9IC5zZXQ9JHsnbXlzZXQnfT48L3VpLWljb24+XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBJZiBubyBzcHJpdGUgdXJsIGlzIHNwZWNpZmllZCBmb3IgYSBzZXQsIHRoZSBpY29uIGVsZW1lbnQgd2lsbCBhdHRlbXB0IHRvIHVzZSBhbiBzdmcgaWNvbiBmcm9tXG4gICAgICogYW4gaW5saW5lZCBzdmcgZWxlbWVudCBpbiB0aGUgY3VycmVudCBkb2N1bWVudC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIGdldFNwcml0ZSAoc2V0OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgICAgIGlmICghdGhpcy5fc3ByaXRlcy5oYXMoc2V0KSkge1xuXG4gICAgICAgICAgICBjb25zdCBtZXRhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWV0YVtuYW1lPVwidWktaWNvbjpzcHJpdGU6JHsgc2V0IH1cIl1bY29udGVudF1gKTtcblxuICAgICAgICAgICAgaWYgKG1ldGEpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZXMuc2V0KHNldCwgbWV0YS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKSEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nwcml0ZXMuZ2V0KHNldCkgfHwgJyc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnZGF0YS1pY29uJ1xuICAgIH0pXG4gICAgaWNvbiA9ICdpbmZvJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2RhdGEtc2V0J1xuICAgIH0pXG4gICAgc2V0ID0gJ2ZhJ1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnaW1nJyk7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlciwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCAnLi4vaWNvbi9pY29uJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4uL2tleXMnO1xuXG5AY29tcG9uZW50PEFjY29yZGlvbkhlYWRlcj4oe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uLWhlYWRlcicsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgYWxsOiBpbmhlcml0O1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgZmxleDogMSAxIDEwMCU7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZGlzYWJsZWQ9dHJ1ZV0pIHtcbiAgICAgICAgY3Vyc29yOiBkZWZhdWx0O1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1leHBhbmRlZD10cnVlXSkgPiB1aS1pY29uLmV4cGFuZCxcbiAgICA6aG9zdChbYXJpYS1leHBhbmRlZD1mYWxzZV0pID4gdWktaWNvbi5jb2xsYXBzZSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBlbGVtZW50ID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIDx1aS1pY29uIGNsYXNzPVwiY29sbGFwc2VcIiBkYXRhLWljb249XCJtaW51c1wiIGRhdGEtc2V0PVwidW5pXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC91aS1pY29uPlxuICAgIDx1aS1pY29uIGNsYXNzPVwiZXhwYW5kXCIgZGF0YS1pY29uPVwicGx1c1wiIGRhdGEtc2V0PVwidW5pXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC91aS1pY29uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uSGVhZGVyIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgZGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6IDA7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1leHBhbmRlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW5cbiAgICB9KVxuICAgIGV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNvbnRyb2xzJyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXghOiBudW1iZXIgfCBudWxsO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ2J1dHRvbic7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBodG1sLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJ2xpdC1odG1sJztcblxuZXhwb3J0IHR5cGUgQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKSA9PiBUZW1wbGF0ZVJlc3VsdDtcblxuZXhwb3J0IGNvbnN0IGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHQgPT4ge1xuXG4gICAgcmV0dXJuIGh0bWxgJmNvcHk7IENvcHlyaWdodCAkeyBkYXRlLmdldEZ1bGxZZWFyKCkgfSAkeyBhdXRob3IudHJpbSgpIH1gO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBDaGFuZ2VzLCBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgY29weXJpZ2h0LCBDb3B5cmlnaHRIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2NvcHlyaWdodCc7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuXG5sZXQgbmV4dEFjY29yZGlvblBhbmVsSWQgPSAwO1xuXG5AY29tcG9uZW50PEFjY29yZGlvblBhbmVsPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY2NvcmRpb24tcGFuZWwnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1oZWFkZXIge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWJvZHkge1xuICAgICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICAgIG92ZXJmbG93OiBhdXRvO1xuICAgICAgICB0cmFuc2l0aW9uOiBoZWlnaHQgLjJzIGVhc2Utb3V0O1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24tYm9keVthcmlhLWhpZGRlbj10cnVlXSB7XG4gICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG4gICAgLmNvcHlyaWdodCB7XG4gICAgICAgIHBhZGRpbmc6IDAgMXJlbSAxcmVtO1xuICAgICAgICBjb2xvcjogdmFyKC0tZGlzYWJsZWQtY29sb3IsICcjY2NjJyk7XG4gICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6IChwYW5lbCwgY29weXJpZ2h0OiBDb3B5cmlnaHRIZWxwZXIpID0+IGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cInVpLWFjY29yZGlvbi1oZWFkZXJcIlxuICAgICAgICByb2xlPVwiaGVhZGluZ1wiXG4gICAgICAgIGFyaWEtbGV2ZWw9XCIkeyBwYW5lbC5sZXZlbCB9XCJcbiAgICAgICAgQGNsaWNrPSR7IHBhbmVsLnRvZ2dsZSB9PlxuICAgICAgICA8c2xvdCBuYW1lPVwiaGVhZGVyXCI+PC9zbG90PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ1aS1hY2NvcmRpb24tYm9keVwiXG4gICAgICAgIGlkPVwiJHsgcGFuZWwuaWQgfS1ib2R5XCJcbiAgICAgICAgc3R5bGU9XCJoZWlnaHQ6ICR7IHBhbmVsLmNvbnRlbnRIZWlnaHQgfTtcIlxuICAgICAgICByb2xlPVwicmVnaW9uXCJcbiAgICAgICAgYXJpYS1oaWRkZW49XCIkeyAhcGFuZWwuZXhwYW5kZWQgfVwiXG4gICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIiR7IHBhbmVsLmlkIH0taGVhZGVyXCI+XG4gICAgICAgIDxzbG90Pjwvc2xvdD5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3B5cmlnaHRcIj4keyBjb3B5cmlnaHQobmV3IERhdGUoKSwgJ0FsZXhhbmRlciBXZW5kZScpIH08L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25QYW5lbCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2hlYWRlcjogQWNjb3JkaW9uSGVhZGVyIHwgbnVsbCA9IG51bGw7XG4gICAgcHJvdGVjdGVkIF9ib2R5OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJvdGVjdGVkIGdldCBjb250ZW50SGVpZ2h0ICgpOiBzdHJpbmcge1xuXG4gICAgICAgIHJldHVybiAhdGhpcy5leHBhbmRlZCA/XG4gICAgICAgICAgICAnMHB4JyA6XG4gICAgICAgICAgICB0aGlzLl9ib2R5ID9cbiAgICAgICAgICAgICAgICBgJHsgdGhpcy5fYm9keS5zY3JvbGxIZWlnaHQgfXB4YCA6XG4gICAgICAgICAgICAgICAgJ2F1dG8nO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICBsZXZlbCA9IDE7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW5cbiAgICB9KVxuICAgIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvciAoKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBgdWktYWNjb3JkaW9uLXBhbmVsLSR7IG5leHRBY2NvcmRpb25QYW5lbElkKysgfWA7XG4gICAgfVxuXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdyYXBwaW5nIHRoZSBwcm9wZXJ0eSBjaGFuZ2UgaW4gdGhlIHdhdGNoIG1ldGhvZCB3aWxsIGRpc3BhdGNoIGEgcHJvcGVydHkgY2hhbmdlIGV2ZW50XG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5faGVhZGVyKSB0aGlzLl9oZWFkZXIuZXhwYW5kZWQgPSB0aGlzLmV4cGFuZGVkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnNldEhlYWRlcih0aGlzLnF1ZXJ5U2VsZWN0b3IoQWNjb3JkaW9uSGVhZGVyLnNlbGVjdG9yKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGluIHRoZSBmaXJzdCB1cGRhdGUsIHdlIHF1ZXJ5IHRoZSBhY2NvcmRpb24tcGFuZWwtYm9keVxuICAgICAgICAgICAgdGhpcy5fYm9keSA9IHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKGAjJHsgdGhpcy5pZCB9LWJvZHlgKTtcblxuICAgICAgICAgICAgLy8gaGF2aW5nIHF1ZXJpZWQgdGhlIGFjY29yZGlvbi1wYW5lbC1ib2R5LCB7QGxpbmsgY29udGVudEhlaWdodH0gY2FuIG5vdyBjYWxjdWxhdGUgdGhlXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGhlaWdodCBvZiB0aGUgcGFuZWwgYm9keSBmb3IgYW5pbWF0aW9uXG4gICAgICAgICAgICAvLyBpbiBvcmRlciB0byByZS1ldmFsdWF0ZSB0aGUgdGVtcGxhdGUgYmluZGluZyBmb3Ige0BsaW5rIGNvbnRlbnRIZWlnaHR9IHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgYW5vdGhlciByZW5kZXIgKHRoaXMgaXMgY2hlYXAsIG9ubHkgY29udGVudEhlaWdodCBoYXMgY2hhbmdlZCBhbmQgd2lsbCBiZSB1cGRhdGVkKVxuICAgICAgICAgICAgLy8gaG93ZXZlciB3ZSBjYW5ub3QgcmVxdWVzdCBhbm90aGVyIHVwZGF0ZSB3aGlsZSB3ZSBhcmUgc3RpbGwgaW4gdGhlIGN1cnJlbnQgdXBkYXRlIGN5Y2xlXG4gICAgICAgICAgICAvLyB1c2luZyBhIFByb21pc2UsIHdlIGNhbiBkZWZlciByZXF1ZXN0aW5nIHRoZSB1cGRhdGUgdW50aWwgYWZ0ZXIgdGhlIGN1cnJlbnQgdXBkYXRlIGlzIGRvbmVcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSh0cnVlKS50aGVuKCgpID0+IHRoaXMucmVxdWVzdFVwZGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSByZW5kZXIgbWV0aG9kIHRvIGluamVjdCBjdXN0b20gaGVscGVycyBpbnRvIHRoZSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW5kZXIgKCkge1xuXG4gICAgICAgIHN1cGVyLnJlbmRlcihjb3B5cmlnaHQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXRIZWFkZXIgKGhlYWRlcjogQWNjb3JkaW9uSGVhZGVyIHwgbnVsbCkge1xuXG4gICAgICAgIHRoaXMuX2hlYWRlciA9IGhlYWRlcjtcblxuICAgICAgICBpZiAoIWhlYWRlcikgcmV0dXJuO1xuXG4gICAgICAgIGhlYWRlci5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnaGVhZGVyJyk7XG5cbiAgICAgICAgaGVhZGVyLmlkID0gaGVhZGVyLmlkIHx8IGAkeyB0aGlzLmlkIH0taGVhZGVyYDtcbiAgICAgICAgaGVhZGVyLmNvbnRyb2xzID0gYCR7IHRoaXMuaWQgfS1ib2R5YDtcbiAgICAgICAgaGVhZGVyLmV4cGFuZGVkID0gdGhpcy5leHBhbmRlZDtcbiAgICAgICAgaGVhZGVyLmRpc2FibGVkID0gdGhpcy5kaXNhYmxlZDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRm9jdXNLZXlNYW5hZ2VyIH0gZnJvbSAnLi4vbGlzdC1rZXktbWFuYWdlcic7XG5pbXBvcnQgJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0ICcuL2FjY29yZGlvbi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktYWNjb3JkaW9uJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgXG4gICAgPHNsb3Q+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWNjb3JkaW9uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8QWNjb3JkaW9uSGVhZGVyPjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICByb2xlID0gJ3ByZXNlbnRhdGlvbic7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAncHJlc2VudGF0aW9uJztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKEFjY29yZGlvbkhlYWRlci5zZWxlY3RvcikpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGNzcyB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBjc3NgXG5kZW1vLWFwcCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG5cbmhlYWRlciB7XG4gIGZsZXg6IDAgMCBhdXRvO1xufVxuXG5tYWluIHtcbiAgZmxleDogMSAxIGF1dG87XG4gIHBhZGRpbmc6IDFyZW07XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIG92ZXJmbG93OiBhdXRvO1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDE1cmVtLCAxZnIpKTtcbiAgZ3JpZC1nYXA6IDFyZW07XG59XG5cbi5pY29ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZmxvdzogcm93IHdyYXA7XG59XG5cbi5zZXR0aW5ncy1saXN0IHtcbiAgcGFkZGluZzogMDtcbiAgbGlzdC1zdHlsZTogbm9uZTtcbn1cblxuLnNldHRpbmdzLWxpc3QgbGkge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG59XG5cbnVpLWNhcmQge1xuICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbn1cblxudWktYWNjb3JkaW9uIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbDpub3QoOmZpcnN0LWNoaWxkKSB7XG4gIGJvcmRlci10b3A6IHZhcigtLWJvcmRlci13aWR0aCkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIGgzIHtcbiAgbWFyZ2luOiAxcmVtO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWwgcCB7XG4gIG1hcmdpbjogMXJlbTtcbn1cbmA7XG4iLCJpbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSAnLi9hcHAnO1xuXG5leHBvcnQgY29uc3QgdGVtcGxhdGUgPSAoZWxlbWVudDogQXBwKSA9PiBodG1sYFxuICAgIDxoZWFkZXI+XG4gICAgICAgIDxoMT5FeGFtcGxlczwvaDE+XG4gICAgPC9oZWFkZXI+XG5cbiAgICA8bWFpbj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkljb248L2gyPlxuXG4gICAgICAgICAgICA8aDM+Rm9udCBBd2Vzb21lPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrLW9wZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYWludC1icnVzaCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbi10cmlhbmdsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8tY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncXVlc3Rpb24tY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+VW5pY29uczwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhbmdsZS1yaWdodC1iJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VubG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGVuJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RyYXNoLWFsdCcgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyLWNpcmNsZScgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZyBlbHNlPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDM+TWF0ZXJpYWwgSWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbl9yaWdodCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdtYWlsJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9ja19vcGVuJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2JydXNoJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VkaXQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZGVsZXRlJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3dhcm5pbmcnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaW5mbycgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdoZWxwJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2FjY291bnRfY2lyY2xlJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlcnNvbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICdjbGVhcicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPkV2aWwgSWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2hldnJvbi1yaWdodCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2VudmVsb3BlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VubG9jaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BhcGVyY2xpcCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbmNpbCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaCcgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2V4Y2xhbWF0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncXVlc3Rpb24nIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1c2VyJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICdjbG9zZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgICA8aDI+Q2hlY2tib3g8L2gyPlxuICAgICAgICAgICAgPHVpLWNoZWNrYm94IC5jaGVja2VkPSR7IHRydWUgfT48L3VpLWNoZWNrYm94PlxuXG4gICAgICAgICAgICA8aDI+VG9nZ2xlPC9oMj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cInNldHRpbmdzLWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5LWVtYWlsXCI+Tm90aWZpY2F0aW9uIGVtYWlsPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktZW1haWxcIiBhcmlhLWNoZWNrZWQ9XCJ0cnVlXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5LXNtc1wiPk5vdGlmaWNhdGlvbiBzbXM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgbGFiZWwtb249XCJ5ZXNcIiBsYWJlbC1vZmY9XCJub1wiIGFyaWEtbGFiZWxsZWRieT1cIm5vdGlmeS1zbXNcIj48L3VpLXRvZ2dsZT5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cInNldHRpbmdzLWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZ5XCI+Tm90aWZpY2F0aW9uczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnlcIiBhcmlhLWNoZWNrZWQ9XCJ0cnVlXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+Q2FyZDwvaDI+XG4gICAgICAgICAgICA8dWktY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtYm9keVwiPkNhcmQgYm9keSB0ZXh0Li4uPC9wPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWZvb3RlclwiPkNhcmQgZm9vdGVyPC9wPlxuICAgICAgICAgICAgPC91aS1jYXJkPlxuXG4gICAgICAgICAgICA8aDI+QWN0aW9uIENhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWFjdGlvbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+Q2FyZCBUaXRsZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+TW9yZTwvYnV0dG9uPlxuICAgICAgICAgICAgPC91aS1hY3Rpb24tY2FyZD5cblxuICAgICAgICAgICAgPGgyPlBsYWluIENhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLXBsYWluLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktcGxhaW4tY2FyZD5cblxuICAgICAgICAgICAgPGgyPlRhYnM8L2gyPlxuICAgICAgICAgICAgPHVpLXRhYi1saXN0PlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItMVwiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtMVwiPjxzcGFuPkZpcnN0IFRhYjwvc3Bhbj48L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTJcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTJcIj5TZWNvbmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0zXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0zXCIgYXJpYS1kaXNhYmxlZD1cInRydWVcIj5UaGlyZCBUYWI8L3VpLXRhYj5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTRcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTRcIj5Gb3VydGggVGFiPC91aS10YWI+XG4gICAgICAgICAgICA8L3VpLXRhYi1saXN0PlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0xXCI+XG4gICAgICAgICAgICAgICAgPGgzPkZpcnN0IFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTJcIj5cbiAgICAgICAgICAgICAgICA8aDM+U2Vjb25kIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLCBkdW9cbiAgICAgICAgICAgICAgICAgICAgYW5pbWFsIGFjY3VzYW11cyBldSwgY2libyBlcnJvcmlidXMgZXQgbWVhLiBFeCBlYW0gd2lzaSBhZG1vZHVtIHByYWVzZW50LCBoYXMgY3Ugb2JsaXF1ZSBjZXRlcm9zXG4gICAgICAgICAgICAgICAgICAgIGVsZWlmZW5kLiBFeCBtZWwgcGxhdG9uZW0gYXNzZW50aW9yIHBlcnNlcXVlcmlzLCB2aXggY2libyBsaWJyaXMgdXQuIEFkIHRpbWVhbSBhY2N1bXNhbiBlc3QsIGV0IGF1dGVtXG4gICAgICAgICAgICAgICAgICAgIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWkgbmFtLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0zXCI+XG4gICAgICAgICAgICAgICAgPGgzPlRoaXJkIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+SSdtIGRpc2FibGVkLCB5b3Ugc2hvdWxkbid0IHNlZSBtZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtNFwiPlxuICAgICAgICAgICAgICAgIDxoMz5Gb3VydGggVGFiIFBhbmVsPC9oMz5cbiAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC4gTGF1ZGVtXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0aXR1YW0gZWEgdXN1LCB2aXJ0dXRlIHBvbmRlcnVtIHBvc2lkb25pdW0gbm8gZW9zLiBEb2xvcmVzIGNvbnNldGV0dXIgZXggaGFzLiBOb3N0cm8gcmVjdXNhYm8gYW5cbiAgICAgICAgICAgICAgICAgICAgZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5BY2NvcmRpb248L2gyPlxuXG4gICAgICAgICAgICA8dWktYWNjb3JkaW9uPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBpZD1cImN1c3RvbS1wYW5lbC1pZFwiIGV4cGFuZGVkIGxldmVsPVwiM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24taGVhZGVyPlBhbmVsIE9uZTwvdWktYWNjb3JkaW9uLWhlYWRlcj5cblxuICAgICAgICAgICAgICAgICAgICA8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgbm8gcHJpbWEgcXVhbGlzcXVlIGV1cmlwaWRpcyBlc3QuIFF1YWxpc3F1ZSBxdWFlcmVuZHVtIGF0IGVzdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIExhdWRlbSBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN1c2FibyBhbiBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+QXQgdXN1IGVwaWN1cmVpIGFzc2VudGlvciwgcHV0ZW50IGRpc3NlbnRpZXQgcmVwdWRpYW5kYWUgZWEgcXVvLiBQcm8gbmUgZGViaXRpcyBwbGFjZXJhdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmlmZXJ1bXF1ZSwgaW4gc29uZXQgdm9sdW11cyBpbnRlcnByZXRhcmlzIGN1bS4gRG9sb3J1bSBhcHBldGVyZSBuZSBxdW8uIERpY3RhIHF1YWxpc3F1ZSBlb3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhLCBlYW0gYXQgbnVsbGEgdGFtcXVhbS5cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgPC91aS1hY2NvcmRpb24tcGFuZWw+XG5cbiAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLXBhbmVsIGxldmVsPVwiM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24taGVhZGVyPlBhbmVsIFR3bzwvdWktYWNjb3JkaW9uLWhlYWRlcj5cblxuICAgICAgICAgICAgICAgICAgICA8cD5JbiBjbGl0YSB0b2xsaXQgbWluaW11bSBxdW8sIGFuIGFjY3VzYXRhIHZvbHV0cGF0IGV1cmlwaWRpcyB2aW0uIEZlcnJpIHF1aWRhbSBkZWxlbml0aSBxdW8gZWEsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW8gYW5pbWFsIGFjY3VzYW11cyBldSwgY2libyBlcnJvcmlidXMgZXQgbWVhLiBFeCBlYW0gd2lzaSBhZG1vZHVtIHByYWVzZW50LCBoYXMgY3Ugb2JsaXF1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2V0ZXJvcyBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVzdCwgZXQgYXV0ZW0gb21uZXMgY2l2aWJ1cyBtZWwuIE1lbCBldSB1YmlxdWUgZXF1aWRlbSBtb2xlc3RpYWUsIGNob3JvIGRvY2VuZGkgbW9kZXJhdGl1cyBlaVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+UXVpIHN1YXMgc29sZXQgY2V0ZXJvcyBjdSwgcGVydGluYXggdnVscHV0YXRlIGRldGVycnVpc3NldCBlb3MgbmUuIE5lIGl1cyB2aWRlIG51bGxhbSwgYWxpZW51bVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaWxsYWUgcmVmb3JtaWRhbnMgY3VtIGFkLiBFYSBtZWxpb3JlIHNhcGllbnRlbSBpbnRlcnByZXRhcmlzIGVhbS4gQ29tbXVuZSBkZWxpY2F0YVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwdWRpYW5kYWUgaW4gZW9zLCBwbGFjZXJhdCBpbmNvcnJ1cHRlIGRlZmluaXRpb25lcyBuZWMgZXguIEN1IGVsaXRyIHRhbnRhcyBpbnN0cnVjdGlvciBzaXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBldSBldW0gYWxpYSBncmFlY2UgbmVnbGVnZW50dXIuPC9wPlxuXG4gICAgICAgICAgICAgICAgPC91aS1hY2NvcmRpb24tcGFuZWw+XG5cbiAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uPlxuXG4gICAgICAgICAgICA8aDI+UG9wb3ZlcjwvaDI+XG5cbiAgICAgICAgICAgIDxvdmVybGF5LWRlbW8+PC9vdmVybGF5LWRlbW8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgPC9tYWluPlxuICAgIGA7XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIGNvbXBvbmVudCwgY3NzLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcblxuLy8gd2UgY2FuIGRlZmluZSBtaXhpbnMgYXNcbmNvbnN0IG1peGluQ29udGFpbmVyOiAoYmFja2dyb3VuZD86IHN0cmluZykgPT4gc3RyaW5nID0gKGJhY2tncm91bmQ6IHN0cmluZyA9ICcjZmZmJykgPT4gY3NzYFxuICAgIGJhY2tncm91bmQ6ICR7IGJhY2tncm91bmQgfTtcbiAgICBiYWNrZ3JvdW5kLWNsaXA6IGJvcmRlci1ib3g7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbmA7XG5cbmNvbnN0IHN0eWxlID0gY3NzYFxuOmhvc3Qge1xuICAgIC0tbWF4LXdpZHRoOiA0MGNoO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1mbG93OiBjb2x1bW47XG4gICAgbWF4LXdpZHRoOiB2YXIoLS1tYXgtd2lkdGgpO1xuICAgIHBhZGRpbmc6IDFyZW07XG4gICAgLyogd2UgY2FuIGFwcGx5IG1peGlucyB3aXRoIHNwcmVhZCBzeW50YXggKi9cbiAgICAkeyBtaXhpbkNvbnRhaW5lcigpIH1cbn1cbjo6c2xvdHRlZCgqKSB7XG4gICAgbWFyZ2luOiAwO1xufVxuYDtcblxuQGNvbXBvbmVudDxDYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1jYXJkJyxcbiAgICBzdHlsZXM6IFtzdHlsZV0sXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1oZWFkZXJcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktY2FyZC1mb290ZXJcIj48L3Nsb3Q+XG4gICAgPGRpdj5Xb3JrZXIgY291bnRlcjogJHsgY2FyZC5jb3VudGVyIH08L2Rpdj5cbiAgICA8YnV0dG9uPlN0b3Agd29ya2VyPC9idXR0b24+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBDYXJkIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIhOiBudW1iZXI7XG5cbiAgICB3b3JrZXIhOiBXb3JrZXI7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnY2xpY2snLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSE7IH1cbiAgICB9KVxuICAgIGhhbmRsZUNsaWNrIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcjxDYXJkPih7XG4gICAgICAgIGV2ZW50OiAnbWVzc2FnZScsXG4gICAgICAgIHRhcmdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy53b3JrZXI7IH1cbiAgICB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKGV2ZW50OiBNZXNzYWdlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY291bnRlciA9IGV2ZW50LmRhdGEpO1xuICAgIH1cbn1cblxuQGNvbXBvbmVudDxBY3Rpb25DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1hY3Rpb24tY2FyZCcsXG4gICAgdGVtcGxhdGU6IGNhcmQgPT4gaHRtbGBcbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1hY3Rpb24tY2FyZC1hY3Rpb25zXCI+PC9zbG90PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2FyZCBleHRlbmRzIENhcmQge1xuXG4gICAgLy8gd2UgY2FuIGluaGVyaXQgc3R5bGVzIGV4cGxpY2l0bHlcbiAgICBzdGF0aWMgZ2V0IHN0eWxlcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAuLi5zdXBlci5zdHlsZXMsXG4gICAgICAgICAgICAnc2xvdFtuYW1lPXVpLWFjdGlvbi1jYXJkLWFjdGlvbnNdIHsgZGlzcGxheTogYmxvY2s7IHRleHQtYWxpZ246IHJpZ2h0OyB9J1xuICAgICAgICBdXG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6IG51bGwgfSlcbiAgICBoYW5kbGVDbGljayAoKSB7IH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlTWVzc2FnZSAoKSB7IH1cbn1cblxuQGNvbXBvbmVudDxQbGFpbkNhcmQ+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXBsYWluLWNhcmQnLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgOmhvc3Qge1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBtYXgtd2lkdGg6IDQwY2g7XG4gICAgICAgIH1gXG4gICAgXVxuICAgIC8vIGlmIHdlIGRvbid0IHNwZWNpZnkgYSB0ZW1wbGF0ZSwgaXQgd2lsbCBiZSBpbmhlcml0ZWRcbn0pXG5leHBvcnQgY2xhc3MgUGxhaW5DYXJkIGV4dGVuZHMgQ2FyZCB7IH1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4sIGNvbXBvbmVudCwgQ29tcG9uZW50LCBjc3MsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgfVxuICAgICAgICAuY2hlY2stbWFyayB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDAuMjVyZW07XG4gICAgICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDAuNjI1cmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMCAwIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBFdmVudEJpbmRpbmcge1xuICAgIHJlYWRvbmx5IHRhcmdldDogRXZlbnRUYXJnZXQ7XG4gICAgcmVhZG9ubHkgdHlwZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbDtcbiAgICByZWFkb25seSBvcHRpb25zPzogRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFdmVudEJpbmRpbmcgKGJpbmRpbmc6IGFueSk6IGJpbmRpbmcgaXMgRXZlbnRCaW5kaW5nIHtcblxuICAgIHJldHVybiB0eXBlb2YgYmluZGluZyA9PT0gJ29iamVjdCdcbiAgICAgICAgJiYgdHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykudGFyZ2V0ID09PSAnb2JqZWN0J1xuICAgICAgICAmJiB0eXBlb2YgKGJpbmRpbmcgYXMgRXZlbnRCaW5kaW5nKS50eXBlID09PSAnc3RyaW5nJ1xuICAgICAgICAmJiAodHlwZW9mIChiaW5kaW5nIGFzIEV2ZW50QmluZGluZykubGlzdGVuZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIHx8IHR5cGVvZiAoYmluZGluZyBhcyBFdmVudEJpbmRpbmcpLmxpc3RlbmVyID09PSAnb2JqZWN0Jyk7XG59XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgbWFuYWdpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgRXZlbnRNYW5hZ2VyIGNsYXNzIGNhbiBiZSB1c2VkIHRvIGhhbmRsZSBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgb24gbXVsdGlwbGUgdGFyZ2V0cy4gSXQgY2FjaGVzIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAqIGFuZCBjYW4gcmVtb3ZlIHRoZW0gc2VwYXJhdGVseSBvciBhbGwgdG9nZXRoZXIuIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIGV2ZW50IGxpc3RlbmVycyBuZWVkIHRvIGJlIGFkZGVkIGFuZCByZW1vdmVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIGEgY29tcG9uZW50IGFuZCBtYWtlcyBtYW51YWxseSBzYXZpbmcgcmVmZXJlbmNlcyB0byB0YXJnZXRzLCBsaXN0ZW5lcnMgYW5kIG9wdGlvbnMgdW5uZWNlc3NhcnkuXG4gKlxuICogYGBgdHNcbiAqICAvLyBjcmVhdGUgYW4gRXZlbnRNYW5hZ2VyIGluc3RhbmNlXG4gKiAgY29uc3QgbWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcbiAqXG4gKiAgLy8geW91IGNhbiBzYXZlIGEgcmVmZXJlbmNlIChhbiBFdmVudEJpbmRpbmcpIHRvIHRoZSBhZGRlZCBldmVudCBsaXN0ZW5lciBpZiB5b3UgbmVlZCB0byBtYW51YWxseSByZW1vdmUgaXQgbGF0ZXJcbiAqICBjb25zdCBiaW5kaW5nID0gbWFuYWdlci5saXN0ZW4oZG9jdW1lbnQsICdzY3JvbGwnLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8gLi4ub3IgaWdub3JlIHRoZSByZWZlcmVuY2UgaWYgeW91IGRvbid0IG5lZWQgaXRcbiAqICBtYW5hZ2VyLmxpc3Rlbihkb2N1bWVudC5ib2R5LCAnY2xpY2snLCAoZXZlbnQpID0+IHsuLi59KTtcbiAqXG4gKiAgLy8geW91IGNhbiByZW1vdmUgYSBzcGVjaWZpYyBldmVudCBsaXN0ZW5lciB1c2luZyBhIHJlZmVyZW5jZVxuICogIG1hbmFnZXIudW5saXN0ZW4oYmluZGluZyk7XG4gKlxuICogIC8vIC4uLm9yIHJlbW92ZSBhbGwgcHJldmlvdXNseSBhZGRlZCBldmVudCBsaXN0ZW5lcnMgaW4gb25lIGdvXG4gKiAgbWFuYWdlci51bmxpc3RlbkFsbCgpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuXG4gICAgcHJvdGVjdGVkIGJpbmRpbmdzID0gbmV3IFNldDxFdmVudEJpbmRpbmc+KCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYW4gRXZlbnRCaW5kaW5nIGV4aXN0cyB0aGF0IG1hdGNoZXMgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICovXG4gICAgaGFzQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbiBFdmVudEJpbmRpbmcgZXhpc3RzIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGhhc0JpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbjtcblxuICAgIGhhc0JpbmRpbmcgKFxuICAgICAgICB0YXJnZXRPckJpbmRpbmc6IEV2ZW50QmluZGluZyB8IEV2ZW50VGFyZ2V0LFxuICAgICAgICB0eXBlPzogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zXG4gICAgKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIChpc0V2ZW50QmluZGluZyh0YXJnZXRPckJpbmRpbmcpXG4gICAgICAgICAgICA/IHRoaXMuZmluZEJpbmRpbmcodGFyZ2V0T3JCaW5kaW5nKVxuICAgICAgICAgICAgOiB0aGlzLmZpbmRCaW5kaW5nKHRhcmdldE9yQmluZGluZywgdHlwZSEsIGxpc3RlbmVyISwgb3B0aW9ucykpICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgYmluZGluZyBvYmplY3RcbiAgICAgKi9cbiAgICBmaW5kQmluZGluZyAoYmluZGluZzogRXZlbnRCaW5kaW5nKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgYW4gZXhpc3RpbmcgRXZlbnRCaW5kaW5nIHRoYXQgbWF0Y2hlcyB0aGUgdGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqL1xuICAgIGZpbmRCaW5kaW5nICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIGZpbmRCaW5kaW5nIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgbGV0IHNlYXJjaEJpbmRpbmc6IEV2ZW50QmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldCkgPyBiaW5kaW5nT3JUYXJnZXQgOiB0aGlzLmNyZWF0ZUJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBsZXQgZm91bmRCaW5kaW5nOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMuYmluZGluZ3MuaGFzKHNlYXJjaEJpbmRpbmcpKSByZXR1cm4gc2VhcmNoQmluZGluZztcblxuICAgICAgICBmb3IgKGxldCBiaW5kaW5nIG9mIHRoaXMuYmluZGluZ3MudmFsdWVzKCkpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZUJpbmRpbmdzKHNlYXJjaEJpbmRpbmcsIGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgICAgICBmb3VuZEJpbmRpbmcgPSBiaW5kaW5nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kQmluZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0IG9mIHRoZSBiaW5kaW5nIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyBhZGRlZCBvciB1bmRlZmluZWQgYSBtYXRjaGluZyBldmVudCBiaW5kaW5nIGFscmVhZHkgZXhpc3RzXG4gICAgICovXG4gICAgbGlzdGVuIChiaW5kaW5nOiBFdmVudEJpbmRpbmcpOiBFdmVudEJpbmRpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIGFkZGVkIG9yIHVuZGVmaW5lZCBhIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgYWxyZWFkeSBleGlzdHNcbiAgICAgKi9cbiAgICBsaXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgbGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gYmluZGluZ09yVGFyZ2V0XG4gICAgICAgICAgICA6IHRoaXMuY3JlYXRlQmluZGluZyhiaW5kaW5nT3JUYXJnZXQsIHR5cGUhLCBsaXN0ZW5lciEsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNCaW5kaW5nKGJpbmRpbmcpKSB7XG5cbiAgICAgICAgICAgIGJpbmRpbmcudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoYmluZGluZy50eXBlLCBiaW5kaW5nLmxpc3RlbmVyLCBiaW5kaW5nLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFkZChiaW5kaW5nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lciBmcm9tIHRoZSB0YXJnZXQgb2YgdGhlIGJpbmRpbmcgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIEV2ZW50QmluZGluZ30gd2hpY2ggd2FzIHJlbW92ZWQgb3IgdW5kZWZpbmVkIGlmIG5vIG1hdGNoaW5nIGV2ZW50IGJpbmRpbmcgZXhpc3RzXG4gICAgICovXG4gICAgdW5saXN0ZW4gKGJpbmRpbmc6IEV2ZW50QmluZGluZyk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHRhcmdldFxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHtAbGluayBFdmVudEJpbmRpbmd9IHdoaWNoIHdhcyByZW1vdmVkIG9yIHVuZGVmaW5lZCBpZiBubyBtYXRjaGluZyBldmVudCBiaW5kaW5nIGV4aXN0c1xuICAgICAqL1xuICAgIHVubGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbik6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZDtcblxuICAgIHVubGlzdGVuIChcbiAgICAgICAgYmluZGluZ09yVGFyZ2V0OiBFdmVudEJpbmRpbmcgfCBFdmVudFRhcmdldCxcbiAgICAgICAgdHlwZT86IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI/OiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhblxuICAgICk6IEV2ZW50QmluZGluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3QgYmluZGluZyA9IGlzRXZlbnRCaW5kaW5nKGJpbmRpbmdPclRhcmdldClcbiAgICAgICAgICAgID8gdGhpcy5maW5kQmluZGluZyhiaW5kaW5nT3JUYXJnZXQpXG4gICAgICAgICAgICA6IHRoaXMuZmluZEJpbmRpbmcoYmluZGluZ09yVGFyZ2V0LCB0eXBlISwgbGlzdGVuZXIhLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoYmluZGluZykge1xuXG4gICAgICAgICAgICBiaW5kaW5nLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGJpbmRpbmcudHlwZSwgYmluZGluZy5saXN0ZW5lciwgYmluZGluZy5vcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5kZWxldGUoYmluZGluZyk7XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlaXIgdGFyZ2V0c1xuICAgICAqL1xuICAgIHVubGlzdGVuQWxsICgpIHtcblxuICAgICAgICB0aGlzLmJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB0aGlzLnVubGlzdGVuKGJpbmRpbmcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIGFuIEV2ZW50IG9uIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNwYXRjaDxUID0gYW55PiAodGFyZ2V0OiBFdmVudFRhcmdldCwgZXZlbnQ6IEV2ZW50KTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBDdXN0b21FdmVudCBvbiB0aGUgdGFyZ2V0XG4gICAgICovXG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgZGV0YWlsPzogVCwgZXZlbnRJbml0PzogUGFydGlhbDxFdmVudEluaXQ+KTogYm9vbGVhbjtcblxuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCBldmVudE9yVHlwZT86IEV2ZW50IHwgc3RyaW5nLCBkZXRhaWw/OiBULCBldmVudEluaXQ6IFBhcnRpYWw8RXZlbnRJbml0PiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGV2ZW50T3JUeXBlIGluc3RhbmNlb2YgRXZlbnQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50T3JUeXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnRPclR5cGUhLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgLi4uZXZlbnRJbml0LFxuICAgICAgICAgICAgZGV0YWlsXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIHtAbGluayBFdmVudEJpbmRpbmd9IG9iamVjdFxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUJpbmRpbmcgKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogRXZlbnRCaW5kaW5nIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byB7QGxpbmsgRXZlbnRCaW5kaW5nfSBvYmplY3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGJpbmRpbmcgb2JqZWN0cyBoYXZlIHRoZSBzYW1lIHRhcmdldCwgdHlwZSBsaXN0ZW5lciBhbmQgb3B0aW9uc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbXBhcmVCaW5kaW5ncyAoYmluZGluZzogRXZlbnRCaW5kaW5nLCBvdGhlcjogRXZlbnRCaW5kaW5nKTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKGJpbmRpbmcgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gYmluZGluZy50YXJnZXQgPT09IG90aGVyLnRhcmdldFxuICAgICAgICAgICAgJiYgYmluZGluZy50eXBlID09PSBvdGhlci50eXBlXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVMaXN0ZW5lcnMoYmluZGluZy5saXN0ZW5lciwgb3RoZXIubGlzdGVuZXIpXG4gICAgICAgICAgICAmJiB0aGlzLmNvbXBhcmVPcHRpb25zKGJpbmRpbmcub3B0aW9ucywgb3RoZXIub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZUxpc3RlbmVycyAobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvdGhlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwpOiBib29sZWFuIHtcblxuICAgICAgICAvLyBjYXRjaGVzIGJvdGggbGlzdGVuZXJzIGJlaW5nIG51bGwsIGEgZnVuY3Rpb24gb3IgdGhlIHNhbWUgRXZlbnRMaXN0ZW5lck9iamVjdFxuICAgICAgICBpZiAobGlzdGVuZXIgPT09IG90aGVyKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBjb21wYXJlcyB0aGUgaGFuZGxlcnMgb2YgdHdvIEV2ZW50TGlzdGVuZXJPYmplY3RzXG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvdGhlciA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChsaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudCA9PT0gKG90aGVyIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBldmVudCBsaXN0ZW5lciBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9wdGlvbnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGFyZU9wdGlvbnMgKG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsIG90aGVyPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogYm9vbGVhbiB7XG5cbiAgICAgICAgLy8gY2F0Y2hlcyBib3RoIG9wdGlvbnMgYmVpbmcgdW5kZWZpbmVkIG9yIHNhbWUgYm9vbGVhbiB2YWx1ZVxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gb3RoZXIpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbXBhcmVzIHR3byBvcHRpb25zIG9iamVjdHNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb3RoZXIgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNhcHR1cmUgPT09IG90aGVyLmNhcHR1cmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLnBhc3NpdmUgPT09IG90aGVyLnBhc3NpdmVcbiAgICAgICAgICAgICAgICAmJiBvcHRpb25zLm9uY2UgPT09IG90aGVyLm9uY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRXZlbnRCaW5kaW5nLCBFdmVudE1hbmFnZXIgfSBmcm9tIFwiLi9ldmVudC1tYW5hZ2VyXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCZWhhdmlvciB7XG5cbiAgICBwcm90ZWN0ZWQgX2VsZW1lbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGV2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoKTtcblxuICAgIGdldCBoYXNBdHRhY2hlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQgIT09IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBnZXQgZWxlbWVudCAoKTogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQsIC4uLmFyZ3M6IGFueVtdKSB7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgZGV0YWNoICguLi5hcmdzOiBhbnlbXSkge1xuXG4gICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLnVubGlzdGVuQWxsKCk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsaXN0ZW4gKHRhcmdldDogRXZlbnRUYXJnZXQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKSB7XG5cbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIubGlzdGVuKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVubGlzdGVuICh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCwgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLnVubGlzdGVuKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoIChldmVudDogRXZlbnQpOiBib29sZWFuO1xuICAgIGRpc3BhdGNoPFQgPSBhbnk+ICh0eXBlOiBzdHJpbmcsIGRldGFpbD86IFQsIGV2ZW50SW5pdD86IFBhcnRpYWw8RXZlbnRJbml0Pik6IGJvb2xlYW47XG4gICAgZGlzcGF0Y2g8VCA9IGFueT4gKGV2ZW50T3JUeXBlPzogRXZlbnQgfCBzdHJpbmcsIGRldGFpbD86IFQsIGV2ZW50SW5pdD86IFBhcnRpYWw8RXZlbnRJbml0Pik6IGJvb2xlYW4ge1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dGFjaGVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAoZXZlbnRPclR5cGUgaW5zdGFuY2VvZiBFdmVudClcbiAgICAgICAgICAgICAgICA/IHRoaXMuZXZlbnRNYW5hZ2VyLmRpc3BhdGNoKHRoaXMuZWxlbWVudCEsIGV2ZW50T3JUeXBlKVxuICAgICAgICAgICAgICAgIDogdGhpcy5ldmVudE1hbmFnZXIuZGlzcGF0Y2godGhpcy5lbGVtZW50ISwgZXZlbnRPclR5cGUhLCBkZXRhaWwsIGV2ZW50SW5pdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQmVoYXZpb3IgfSBmcm9tIFwiLi4vYmVoYXZpb3JcIjtcblxuZXhwb3J0IGludGVyZmFjZSBGb2N1c0NoYW5nZUV2ZW50RGV0YWlsIHtcbiAgICB0eXBlOiAnZm9jdXNpbicgfCAnZm9jdXNvdXQnO1xuICAgIGV2ZW50OiBGb2N1c0V2ZW50O1xufVxuXG5leHBvcnQgdHlwZSBGb2N1c0NoYW5nZUV2ZW50ID0gQ3VzdG9tRXZlbnQ8Rm9jdXNDaGFuZ2VFdmVudERldGFpbD47XG5cbmV4cG9ydCBjbGFzcyBGb2N1c01vbml0b3IgZXh0ZW5kcyBCZWhhdmlvciB7XG5cbiAgICBoYXNGb2N1cyA9IGZhbHNlO1xuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuXG4gICAgICAgIHN1cGVyLmF0dGFjaChlbGVtZW50KTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXNpbicsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNJbihldmVudCBhcyBGb2N1c0V2ZW50KSk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdmb2N1c291dCcsIGV2ZW50ID0+IHRoaXMuaGFuZGxlRm9jdXNPdXQoZXZlbnQgYXMgRm9jdXNFdmVudCkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0luIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLmhhc0ZvY3VzID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPignZm9jdXMtY2hhbmdlZCcsIHsgdHlwZTogJ2ZvY3VzaW4nLCBldmVudDogZXZlbnQgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNPdXQgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cbiAgICAgICAgLy8gaWYgdGhlIHJlbGF0ZWRUYXJnZXQgKHRoZSBlbGVtZW50IHdoaWNoIHdpbGwgcmVjZWl2ZSB0aGUgZm9jdXMgbmV4dCkgaXMgd2l0aGluIHRoZSBtb25pdG9yZWQgZWxlbWVudCxcbiAgICAgICAgLy8gd2UgY2FuIGlnbm9yZSB0aGlzIGV2ZW50OyBpdCB3aWxsIGV2ZW50dWFsbHkgYmUgaGFuZGxlZCBhcyBmb2N1c2luIGV2ZW50IG9mIHRoZSByZWxhdGVkVGFyZ2V0XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnQhID09PSBldmVudC5yZWxhdGVkVGFyZ2V0IHx8IHRoaXMuZWxlbWVudCEuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBOb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0ZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaDxGb2N1c0NoYW5nZUV2ZW50RGV0YWlsPignZm9jdXMtY2hhbmdlZCcsIHsgdHlwZTogJ2ZvY3Vzb3V0JywgZXZlbnQ6IGV2ZW50IH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ1NTU2VsZWN0b3IgfSBmcm9tICcuLi9kb20nO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi4va2V5cyc7XG5pbXBvcnQgeyBGb2N1c01vbml0b3IgfSBmcm9tICcuL2ZvY3VzLW1vbml0b3InO1xuXG5leHBvcnQgY29uc3QgVEFCQkFCTEVTID0gW1xuICAgICdhW2hyZWZdOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnYXJlYVtocmVmXTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ2lucHV0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAnc2VsZWN0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgICAndGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdpZnJhbWU6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAgICdbY29udGVudEVkaXRhYmxlXTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICAgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleF49XCItXCJdKScsXG5dO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzVHJhcENvbmZpZyB7XG4gICAgdGFiYmFibGVTZWxlY3RvcjogQ1NTU2VsZWN0b3I7XG4gICAgd3JhcEZvY3VzOiBib29sZWFuO1xuICAgIGF1dG9Gb2N1czogYm9vbGVhbjtcbiAgICByZXN0b3JlRm9jdXM6IGJvb2xlYW47XG4gICAgaW5pdGlhbEZvY3VzPzogQ1NTU2VsZWN0b3I7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHOiBGb2N1c1RyYXBDb25maWcgPSB7XG4gICAgdGFiYmFibGVTZWxlY3RvcjogVEFCQkFCTEVTLmpvaW4oJywnKSxcbiAgICB3cmFwRm9jdXM6IHRydWUsXG4gICAgYXV0b0ZvY3VzOiB0cnVlLFxuICAgIHJlc3RvcmVGb2N1czogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBGb2N1c1RyYXAgZXh0ZW5kcyBGb2N1c01vbml0b3Ige1xuXG4gICAgcHJvdGVjdGVkIHRhYmJhYmxlcyE6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+O1xuXG4gICAgcHJvdGVjdGVkIHN0YXJ0ITogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgZW5kITogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlnOiBGb2N1c1RyYXBDb25maWc7XG5cbiAgICBjb25zdHJ1Y3RvciAoY29uZmlnPzogUGFydGlhbDxGb2N1c1RyYXBDb25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgfVxuXG4gICAgYXR0YWNoIChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuXG4gICAgICAgIHN1cGVyLmF0dGFjaChlbGVtZW50KTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAna2V5ZG93bicsICgoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHRoaXMuaGFuZGxlS2V5RG93bihldmVudCkpIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9Gb2N1cykge1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzSW5pdGlhbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICBzdXBlci5kZXRhY2goKTtcbiAgICB9XG5cbiAgICBmb2N1c0luaXRpYWwgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5pbml0aWFsRm9jdXMpIHtcblxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbEZvY3VzID0gdGhpcy5lbGVtZW50IS5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50Pih0aGlzLmNvbmZpZy5pbml0aWFsRm9jdXMpO1xuXG4gICAgICAgICAgICBpZiAoaW5pdGlhbEZvY3VzKSB7XG5cbiAgICAgICAgICAgICAgICBpbml0aWFsRm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvY3VzVHJhcCBjb3VsZCBub3QgZmluZCBpbml0aWFsRm9jdXMgZWxlbWVudCBzZWxlY3RvciAkeyB0aGlzLmNvbmZpZy5pbml0aWFsRm9jdXMgfS4gUG9zc2libGUgZXJyb3IgaW4gRm9jdXNUcmFwQ29uZmlnLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb2N1c0ZpcnN0KCk7XG4gICAgfVxuXG4gICAgZm9jdXNGaXJzdCAoKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydC5mb2N1cygpO1xuICAgIH1cblxuICAgIGZvY3VzTGFzdCAoKSB7XG5cbiAgICAgICAgdGhpcy5lbmQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUgKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMudGFiYmFibGVzID0gdGhpcy5lbGVtZW50IS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuY29uZmlnLnRhYmJhYmxlU2VsZWN0b3IpO1xuXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMudGFiYmFibGVzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLnN0YXJ0ID0gbGVuZ3RoXG4gICAgICAgICAgICA/IHRoaXMudGFiYmFibGVzLml0ZW0oMClcbiAgICAgICAgICAgIDogdGhpcy5lbGVtZW50ITtcblxuICAgICAgICB0aGlzLmVuZCA9IGxlbmd0aFxuICAgICAgICAgICAgPyB0aGlzLnRhYmJhYmxlcy5pdGVtKGxlbmd0aCAtIDEpXG4gICAgICAgICAgICA6IHRoaXMuZWxlbWVudCE7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBUYWI6XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZXZlbnQudGFyZ2V0ID09PSB0aGlzLnN0YXJ0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcud3JhcEZvY3VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzTGFzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFldmVudC5zaGlmdEtleSAmJiBldmVudC50YXJnZXQgPT09IHRoaXMuZW5kKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcud3JhcEZvY3VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzRmlyc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgT2Zmc2V0IHtcbiAgICBob3Jpem9udGFsOiBzdHJpbmcgfCBudW1iZXI7XG4gICAgdmVydGljYWw6IHN0cmluZyB8IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc09mZnNldENoYW5nZWQgKG9mZnNldD86IE9mZnNldCwgb3RoZXI/OiBPZmZzZXQpOiBib29sZWFuIHtcblxuICAgIGlmIChvZmZzZXQgJiYgb3RoZXIpIHtcblxuICAgICAgICByZXR1cm4gb2Zmc2V0Lmhvcml6b250YWwgIT09IG90aGVyLmhvcml6b250YWxcbiAgICAgICAgICAgIHx8IG9mZnNldC52ZXJ0aWNhbCAhPT0gb3RoZXIudmVydGljYWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9mZnNldCAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBPZmZzZXQsIGhhc09mZnNldENoYW5nZWQgfSBmcm9tICcuL29mZnNldCc7XG5pbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gJy4vcG9zaXRpb24nO1xuXG5leHBvcnQgdHlwZSBBbGlnbm1lbnRPcHRpb24gPSAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJztcblxuZXhwb3J0IGludGVyZmFjZSBBbGlnbm1lbnQge1xuICAgIGhvcml6b250YWw6IEFsaWdubWVudE9wdGlvbjtcbiAgICB2ZXJ0aWNhbDogQWxpZ25tZW50T3B0aW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFsaWdubWVudFBhaXIge1xuICAgIG9yaWdpbjogQWxpZ25tZW50O1xuICAgIHRhcmdldDogQWxpZ25tZW50O1xuICAgIG9mZnNldD86IE9mZnNldDtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQUxJR05NRU5UX1BBSVI6IEFsaWdubWVudFBhaXIgPSB7XG4gICAgb3JpZ2luOiB7XG4gICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgIHZlcnRpY2FsOiAnZW5kJ1xuICAgIH0sXG4gICAgdGFyZ2V0OiB7XG4gICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnXG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQWxpZ25tZW50IChhbGlnbm1lbnQ6IGFueSk6IGFsaWdubWVudCBpcyBBbGlnbm1lbnQge1xuXG4gICAgcmV0dXJuIHR5cGVvZiAoYWxpZ25tZW50IGFzIEFsaWdubWVudCkuaG9yaXpvbnRhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIChhbGlnbm1lbnQgYXMgQWxpZ25tZW50KS52ZXJ0aWNhbCAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNBbGlnbm1lbnRDaGFuZ2VkIChhbGlnbm1lbnQ6IEFsaWdubWVudCwgb3RoZXI6IEFsaWdubWVudCk6IGJvb2xlYW4ge1xuXG4gICAgaWYgKGFsaWdubWVudCAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBhbGlnbm1lbnQuaG9yaXpvbnRhbCAhPT0gb3RoZXIuaG9yaXpvbnRhbFxuICAgICAgICAgICAgfHwgYWxpZ25tZW50LnZlcnRpY2FsICE9PSBvdGhlci52ZXJ0aWNhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxpZ25tZW50ICE9PSBvdGhlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FsaWdubWVudFBhaXJDaGFuZ2VkIChhbGlnbm1lbnRQYWlyPzogQWxpZ25tZW50UGFpciwgb3RoZXI/OiBBbGlnbm1lbnRQYWlyKTogYm9vbGVhbiB7XG5cbiAgICBpZiAoYWxpZ25tZW50UGFpciAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBoYXNBbGlnbm1lbnRDaGFuZ2VkKGFsaWdubWVudFBhaXIudGFyZ2V0LCBvdGhlci50YXJnZXQpXG4gICAgICAgICAgICB8fCBoYXNBbGlnbm1lbnRDaGFuZ2VkKGFsaWdubWVudFBhaXIub3JpZ2luLCBvdGhlci5vcmlnaW4pXG4gICAgICAgICAgICB8fCBoYXNPZmZzZXRDaGFuZ2VkKGFsaWdubWVudFBhaXIub2Zmc2V0LCBvdGhlci5vZmZzZXQpO1xuICAgIH1cblxuICAgIHJldHVybiBhbGlnbm1lbnRQYWlyICE9PSBvdGhlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCb3VuZGluZ0JveCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxpZ25lZFBvc2l0aW9uIChlbGVtZW50Qm94OiBCb3VuZGluZ0JveCwgZWxlbWVudEFsaWdubWVudDogQWxpZ25tZW50KTogUG9zaXRpb24ge1xuXG4gICAgY29uc3QgcG9zaXRpb246IFBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICBzd2l0Y2ggKGVsZW1lbnRBbGlnbm1lbnQuaG9yaXpvbnRhbCkge1xuXG4gICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94Lng7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgcG9zaXRpb24ueCA9IGVsZW1lbnRCb3gueCArIGVsZW1lbnRCb3gud2lkdGggLyAyO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBlbGVtZW50Qm94LnggKyBlbGVtZW50Qm94LndpZHRoO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgc3dpdGNoIChlbGVtZW50QWxpZ25tZW50LnZlcnRpY2FsKSB7XG5cbiAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgcG9zaXRpb24ueSA9IGVsZW1lbnRCb3gueTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgICBwb3NpdGlvbi55ID0gZWxlbWVudEJveC55ICsgZWxlbWVudEJveC5oZWlnaHQgLyAyO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPSBlbGVtZW50Qm94LnkgKyBlbGVtZW50Qm94LmhlaWdodDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldFBvc2l0aW9uIChvcmlnaW5Cb3g6IEJvdW5kaW5nQm94LCBvcmlnaW5BbGlnbm1lbnQ6IEFsaWdubWVudCwgdGFyZ2V0Qm94OiBCb3VuZGluZ0JveCwgdGFyZ2V0QWxpZ25tZW50OiBBbGlnbm1lbnQpOiBQb3NpdGlvbiB7XG5cbiAgICBjb25zdCBvcmlnaW5Qb3NpdGlvbiA9IGdldEFsaWduZWRQb3NpdGlvbihvcmlnaW5Cb3gsIG9yaWdpbkFsaWdubWVudCk7XG4gICAgY29uc3QgdGFyZ2V0UG9zaXRpb24gPSBnZXRBbGlnbmVkUG9zaXRpb24oeyAuLi50YXJnZXRCb3gsIHg6IDAsIHk6IDAgfSwgdGFyZ2V0QWxpZ25tZW50KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IG9yaWdpblBvc2l0aW9uLnggLSB0YXJnZXRQb3NpdGlvbi54LFxuICAgICAgICB5OiBvcmlnaW5Qb3NpdGlvbi55IC0gdGFyZ2V0UG9zaXRpb24ueSxcbiAgICB9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFNpemUge1xuICAgIHdpZHRoOiBzdHJpbmcgfCBudW1iZXI7XG4gICAgaGVpZ2h0OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgbWF4V2lkdGg6IHN0cmluZyB8IG51bWJlcjtcbiAgICBtYXhIZWlnaHQ6IHN0cmluZyB8IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1NpemVDaGFuZ2VkIChzaXplPzogUGFydGlhbDxTaXplPiwgb3RoZXI/OiBQYXJ0aWFsPFNpemU+KTogYm9vbGVhbiB7XG5cbiAgICBpZiAoc2l6ZSAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBzaXplLndpZHRoICE9PSBvdGhlci53aWR0aFxuICAgICAgICAgICAgfHwgc2l6ZS5oZWlnaHQgIT09IG90aGVyLmhlaWdodFxuICAgICAgICAgICAgfHwgc2l6ZS5tYXhXaWR0aCAhPT0gb3RoZXIubWF4V2lkdGhcbiAgICAgICAgICAgIHx8IHNpemUubWF4SGVpZ2h0ICE9PSBvdGhlci5tYXhIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpemUgIT09IG90aGVyO1xufVxuIiwiaW1wb3J0IHsgQ1NTU2VsZWN0b3IgfSBmcm9tICcuLi8uLi9kb20nO1xuaW1wb3J0IHsgQWxpZ25tZW50UGFpciwgaGFzQWxpZ25tZW50UGFpckNoYW5nZWQgfSBmcm9tICcuL2FsaWdubWVudCc7XG5pbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gJy4vcG9zaXRpb24nO1xuaW1wb3J0IHsgaGFzU2l6ZUNoYW5nZWQsIFNpemUgfSBmcm9tICcuL3NpemUnO1xuXG4vKipcbiAqIEEgUG9zaXRpb25Db25maWcgY29udGFpbnMgdGhlIHNpemUgYW5kIGFsaWdubWVudCBvZiBhbiBFbGVtZW50IGFuZCBtYXkgaW5jbHVkZSBhbiBvcmlnaW4sIHdoaWNoIHJlZmVyZW5jZXMgYW4gb3JpZ2luIEVsZW1lbnRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbmZpZyBleHRlbmRzIFNpemUge1xuICAgIG9yaWdpbjogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IENTU1NlbGVjdG9yIHwgJ3ZpZXdwb3J0JztcbiAgICBhbGlnbm1lbnQ6IEFsaWdubWVudFBhaXI7XG59XG5cbmV4cG9ydCBjb25zdCBQT1NJVElPTl9DT05GSUdfRklFTERTOiAoa2V5b2YgUG9zaXRpb25Db25maWcpW10gPSBbXG4gICAgJ3dpZHRoJyxcbiAgICAnaGVpZ2h0JyxcbiAgICAnbWF4V2lkdGgnLFxuICAgICdtYXhIZWlnaHQnLFxuICAgICdvcmlnaW4nLFxuICAgICdhbGlnbm1lbnQnXG5dO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9DT05GSUc6IFBvc2l0aW9uQ29uZmlnID0ge1xuICAgIHdpZHRoOiAnYXV0bycsXG4gICAgbWF4V2lkdGg6ICcxMDB2dycsXG4gICAgaGVpZ2h0OiAnYXV0bycsXG4gICAgbWF4SGVpZ2h0OiAnMTAwdmgnLFxuICAgIG9yaWdpbjogJ3ZpZXdwb3J0JyxcbiAgICAvLyBUT0RPOiBhZGQgb3B0aW9uIHRvIG1hdGNoIHdpZHRoIG9mIG9yaWdpbiBlbGVtZW50XG4gICAgLy8gbWF0Y2hPcmlnaW5XaWR0aDogZmFsc2UsXG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2NlbnRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZCAocG9zaXRpb25Db25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPiwgb3RoZXI/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IGJvb2xlYW4ge1xuXG4gICAgaWYgKHBvc2l0aW9uQ29uZmlnICYmIG90aGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnLm9yaWdpbiAhPT0gb3RoZXIub3JpZ2luXG4gICAgICAgICAgICB8fCBoYXNBbGlnbm1lbnRQYWlyQ2hhbmdlZChwb3NpdGlvbkNvbmZpZy5hbGlnbm1lbnQsIG90aGVyLmFsaWdubWVudClcbiAgICAgICAgICAgIHx8IGhhc1NpemVDaGFuZ2VkKHBvc2l0aW9uQ29uZmlnLCBvdGhlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uQ29uZmlnICE9PSBvdGhlcjtcbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRywgRm9jdXNUcmFwQ29uZmlnIH0gZnJvbSAnLi9mb2N1cy10cmFwJztcbmltcG9ydCB7IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLCBQb3NpdGlvbkNvbmZpZyB9IGZyb20gJy4vcG9zaXRpb24vcG9zaXRpb24tY29uZmlnJztcblxuZXhwb3J0IHR5cGUgT3ZlcmxheUNvbmZpZyA9IFBvc2l0aW9uQ29uZmlnICYgRm9jdXNUcmFwQ29uZmlnICYge1xuICAgIC8vIFRPRE86IG1heWJlIGludHJvZHVjZSBhIGNvbnN0IGZvciB0aGUgJ3ZpZXdwb3J0JyB2YWx1ZT9cbiAgICBwb3NpdGlvblR5cGU6IHN0cmluZztcbiAgICB0cmlnZ2VyPzogc3RyaW5nO1xuICAgIHRyaWdnZXJUeXBlPzogc3RyaW5nO1xuICAgIHRlbXBsYXRlPzogVGVtcGxhdGVGdW5jdGlvbjtcbiAgICBjb250ZXh0PzogQ29tcG9uZW50O1xuICAgIGJhY2tkcm9wOiBib29sZWFuO1xuICAgIHRyYXBGb2N1czogYm9vbGVhbjtcbiAgICBjbG9zZU9uRXNjYXBlOiBib29sZWFuO1xuICAgIGNsb3NlT25CYWNrZHJvcENsaWNrOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgT1ZFUkxBWV9DT05GSUdfRklFTERTOiAoa2V5b2YgT3ZlcmxheUNvbmZpZylbXSA9IFtcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdtYXhXaWR0aCcsXG4gICAgJ21heEhlaWdodCcsXG4gICAgJ29yaWdpbicsXG4gICAgJ2FsaWdubWVudCcsXG4gICAgJ3Bvc2l0aW9uVHlwZScsXG4gICAgJ3RyaWdnZXInLFxuICAgICd0cmlnZ2VyVHlwZScsXG4gICAgJ3RlbXBsYXRlJyxcbiAgICAnY29udGV4dCcsXG4gICAgJ2JhY2tkcm9wJyxcbiAgICAnY2xvc2VPbkVzY2FwZScsXG4gICAgJ2Nsb3NlT25CYWNrZHJvcENsaWNrJyxcbiAgICAndHJhcEZvY3VzJyxcbiAgICAnYXV0b0ZvY3VzJyxcbiAgICAnaW5pdGlhbEZvY3VzJyxcbiAgICAncmVzdG9yZUZvY3VzJyxcbiAgICAnd3JhcEZvY3VzJyxcbiAgICAndGFiYmFibGVTZWxlY3Rvcidcbl07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX09WRVJMQVlfQ09ORklHOiBPdmVybGF5Q29uZmlnID0ge1xuICAgIC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIC4uLkRFRkFVTFRfRk9DVVNfVFJBUF9DT05GSUcsXG4gICAgcG9zaXRpb25UeXBlOiAnZGVmYXVsdCcsXG4gICAgdHJpZ2dlcjogdW5kZWZpbmVkLFxuICAgIHRyaWdnZXJUeXBlOiB1bmRlZmluZWQsXG4gICAgdGVtcGxhdGU6IHVuZGVmaW5lZCxcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgYmFja2Ryb3A6IHRydWUsXG4gICAgdHJhcEZvY3VzOiB0cnVlLFxuICAgIGNsb3NlT25Fc2NhcGU6IHRydWUsXG4gICAgY2xvc2VPbkJhY2tkcm9wQ2xpY2s6IHRydWUsXG59O1xuIiwiLyoqXG4gKiBBIENTUyBzZWxlY3RvciBzdHJpbmdcbiAqXG4gKiBAc2VlXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX1NlbGVjdG9yc1xuICovXG5leHBvcnQgdHlwZSBDU1NTZWxlY3RvciA9IHN0cmluZztcblxuLyoqXG4gKiBJbnNlcnQgYSBOb2RlIGFmdGVyIGEgcmVmZXJlbmNlIE5vZGVcbiAqXG4gKiBAcGFyYW0gbmV3Q2hpbGQgLSBUaGUgTm9kZSB0byBpbnNlcnRcbiAqIEBwYXJhbSByZWZDaGlsZCAtIFRoZSByZWZlcmVuY2UgTm9kZSBhZnRlciB3aGljaCB0byBpbnNlcnRcbiAqL1xuZXhwb3J0IGNvbnN0IGluc2VydEFmdGVyID0gPFQgZXh0ZW5kcyBOb2RlPiAobmV3Q2hpbGQ6IFQsIHJlZkNoaWxkOiBOb2RlKTogVCA9PiB7XG5cbiAgICByZXR1cm4gcmVmQ2hpbGQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKG5ld0NoaWxkLCByZWZDaGlsZC5uZXh0U2libGluZyk7XG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgcHJvcGVydHksIEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW4gfSBmcm9tIFwiQHBhcnRraXQvY29tcG9uZW50XCI7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktb3ZlcmxheS1iYWNrZHJvcCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1vdmVybGF5LWJhY2tkcm9wLWJhY2tncm91bmQpO1xuICAgIH1cbiAgICA6aG9zdChbaGlkZGVuXSkge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICA6aG9zdChbdHJhbnNwYXJlbnRdKSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgIH1cbiAgICBgXVxufSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5QmFja2Ryb3AgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICBoaWRkZW4hOiBib29sZWFuO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gICAgfSlcbiAgICB0cmFuc3BhcmVudCA9IGZhbHNlO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIHNob3cgKCkge1xuXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5oaWRkZW4gPSBmYWxzZSk7XG4gICAgfVxuXG4gICAgaGlkZSAoKSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmhpZGRlbiA9IHRydWUpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJlaGF2aW9yIH0gZnJvbSAnLi4vYmVoYXZpb3InO1xuaW1wb3J0IHsgRW50ZXIsIEVzY2FwZSwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuL292ZXJsYXktc2VydmljZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheVRyaWdnZXIgZXh0ZW5kcyBCZWhhdmlvciB7XG5cbiAgICB1cGRhdGUgKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0T3ZlcmxheVRyaWdnZXIgZXh0ZW5kcyBCZWhhdmlvciBpbXBsZW1lbnRzIE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyBvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgc3VwZXIuYXR0YWNoKGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJywgJ2RpYWxvZycpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMuZWxlbWVudCEsICdrZXlkb3duJywgKGV2ZW50OiBFdmVudCkgPT4gdGhpcy5oYW5kbGVLZXlkb3duKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ21vdXNlZG93bicsIChldmVudDogRXZlbnQpID0+IHRoaXMuaGFuZGxlTW91c2Vkb3duKGV2ZW50IGFzIE1vdXNlRXZlbnQpKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLm92ZXJsYXksICdvcGVuLWNoYW5nZWQnLCAoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5vdmVybGF5LCAna2V5ZG93bicsIChldmVudDogRXZlbnQpID0+IHRoaXMuaGFuZGxlS2V5ZG93bihldmVudCBhcyBLZXlib2FyZEV2ZW50KSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG5cbiAgICBkZXRhY2ggKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJyk7XG5cbiAgICAgICAgc3VwZXIuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRoaXMub3ZlcmxheS5vcGVuID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcblxuICAgICAgICAgICAgY2FzZSBFbnRlcjpcbiAgICAgICAgICAgIGNhc2UgU3BhY2U6XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UudG9nZ2xlT3ZlcmxheSh0aGlzLm92ZXJsYXksIGV2ZW50KTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEVzY2FwZTpcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5U2VydmljZS5pc092ZXJsYXlPcGVuKHRoaXMub3ZlcmxheSkpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UuY2xvc2VPdmVybGF5KHRoaXMub3ZlcmxheSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2UudG9nZ2xlT3ZlcmxheSh0aGlzLm92ZXJsYXksIGV2ZW50KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUb29sdGlwT3ZlcmxheVRyaWdnZXIgZXh0ZW5kcyBCZWhhdmlvciBpbXBsZW1lbnRzIE92ZXJsYXlUcmlnZ2VyIHtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgY29uc3RydWN0b3IgKHB1YmxpYyBvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhdHRhY2ggKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgc3VwZXIuYXR0YWNoKGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMub3ZlcmxheS5yb2xlID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCEuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGhpcy5vdmVybGF5LmlkKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VlbnRlcicsIChldmVudCkgPT4gdGhpcy5vcGVuVG9vbHRpcChldmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2VsZWF2ZScsIChldmVudCkgPT4gdGhpcy5jbG9zZVRvb2x0aXAoZXZlbnQpKTtcblxuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnZm9jdXMnLCAoZXZlbnQpID0+IHRoaXMub3BlblRvb2x0aXAoZXZlbnQpKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2JsdXInLCAoZXZlbnQpID0+IHRoaXMuY2xvc2VUb29sdGlwKGV2ZW50KSk7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50IS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcblxuICAgICAgICBzdXBlci5kZXRhY2goKTtcbiAgICB9XG5cbiAgICB1cGRhdGUgKCkgeyB9XG5cbiAgICBwcm90ZWN0ZWQgb3BlblRvb2x0aXAgKGV2ZW50OiBFdmVudCkge1xuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2Uub3Blbk92ZXJsYXkodGhpcy5vdmVybGF5LCBldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNsb3NlVG9vbHRpcCAoZXZlbnQ6IEV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5jbG9zZU92ZXJsYXkodGhpcy5vdmVybGF5LCBldmVudCk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWVudU92ZXJsYXlUcmlnZ2VyIHsgfVxuXG5leHBvcnQgY2xhc3MgTGlzdGJveE92ZXJsYXlUcmlnZ2VyIHsgfVxuXG4vLyBleHBvcnQgY2xhc3MgRGlhbG9nT3ZlcmxheVRyaWdnZXIgZXh0ZW5kcyBCZWhhdmlvciBpbXBsZW1lbnRzIE92ZXJsYXlUcmlnZ2VyIHsgfVxuXG4vLyBleHBvcnQgY2xhc3MgVHJlZU92ZXJsYXlUcmlnZ2VyIHsgfVxuXG4vLyBleHBvcnQgY2xhc3MgR3JpZE92ZXJsYXlUcmlnZ2VyIHsgfVxuIiwiaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5VHJpZ2dlciwgVG9vbHRpcE92ZXJsYXlUcmlnZ2VyLCBEZWZhdWx0T3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheVRyaWdnZXJNYXAge1xuICAgIFtrZXk6IHN0cmluZ106IHsgbmV3KG92ZXJsYXk6IE92ZXJsYXkpOiBPdmVybGF5VHJpZ2dlciB9O1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PVkVSTEFZX1RSSUdHRVJTOiBPdmVybGF5VHJpZ2dlck1hcCA9IHtcbiAgICBkZWZhdWx0OiBEZWZhdWx0T3ZlcmxheVRyaWdnZXIsXG4gICAgdG9vbHRpcDogVG9vbHRpcE92ZXJsYXlUcmlnZ2VyLFxufTtcblxuZXhwb3J0IGNsYXNzIE92ZXJsYXlUcmlnZ2VyRmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHJvdGVjdGVkIHRyaWdnZXJzOiBPdmVybGF5VHJpZ2dlck1hcCA9IERFRkFVTFRfT1ZFUkxBWV9UUklHR0VSUykgeyB9XG5cbiAgICBjcmVhdGVPdmVybGF5VHJpZ2dlciAodHlwZTogc3RyaW5nLCBvdmVybGF5OiBPdmVybGF5KTogT3ZlcmxheVRyaWdnZXIge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRyaWdnZXJzW3R5cGVdXG4gICAgICAgICAgICA/IG5ldyB0aGlzLnRyaWdnZXJzW3R5cGVdKG92ZXJsYXkpXG4gICAgICAgICAgICA6IG5ldyBEZWZhdWx0T3ZlcmxheVRyaWdnZXIob3ZlcmxheSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbiB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9TSVRJT046IFBvc2l0aW9uID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc2l0aW9uIChwb3NpdGlvbjogYW55KTogcG9zaXRpb24gaXMgUG9zaXRpb24ge1xuXG4gICAgcmV0dXJuIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnggIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiAocG9zaXRpb24gYXMgUG9zaXRpb24pLnkgIT09ICd1bmRlZmluZWQnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQb3NpdGlvbkNoYW5nZWQgKHBvc2l0aW9uPzogUG9zaXRpb24sIG90aGVyPzogUG9zaXRpb24pOiBib29sZWFuIHtcblxuICAgIGlmIChwb3NpdGlvbiAmJiBvdGhlcikge1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbi54ICE9PSBvdGhlci54XG4gICAgICAgICAgICB8fCBwb3NpdGlvbi55ICE9PSBvdGhlci55O1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbiAhPT0gb3RoZXI7XG59XG4iLCJpbXBvcnQgeyBCb3VuZGluZ0JveCwgZ2V0VGFyZ2V0UG9zaXRpb24gfSBmcm9tICcuL2FsaWdubWVudCc7XG5pbXBvcnQgeyBoYXNQb3NpdGlvbkNoYW5nZWQsIGlzUG9zaXRpb24sIFBvc2l0aW9uIH0gZnJvbSAnLi9wb3NpdGlvbic7XG5pbXBvcnQgeyBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgUG9zaXRpb25Db25maWcgfSBmcm9tICcuL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBoYXNTaXplQ2hhbmdlZCwgU2l6ZSB9IGZyb20gJy4vc2l6ZSc7XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5IHtcblxuICAgIHByaXZhdGUgX2NvbmZpZzogUG9zaXRpb25Db25maWcgPSBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRztcblxuICAgIHByaXZhdGUgX29yaWdpbjogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIHByb3RlY3RlZCBhbmltYXRpb25GcmFtZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHJvdGVjdGVkIGN1cnJlbnRQb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgY3VycmVudFNpemU6IFNpemUgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgc2V0IG9yaWdpbiAob3JpZ2luOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgLy8gY2FjaGUgdGhlIG9yaWdpbiBlbGVtZW50IGlmIGl0IGlzIGEgQ1NTIHNlbGVjdG9yXG4gICAgICAgIGlmICh0eXBlb2Ygb3JpZ2luID09PSAnc3RyaW5nJyAmJiBvcmlnaW4gIT09ICd2aWV3cG9ydCcpIHtcblxuICAgICAgICAgICAgb3JpZ2luID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcmlnaW4pIGFzIEhUTUxFbGVtZW50IHx8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX29yaWdpbiA9IG9yaWdpbjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IG9yaWdpbiAoKTogUG9zaXRpb24gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX29yaWdpbjtcbiAgICB9XG5cbiAgICBzZXQgY29uZmlnIChjb25maWc6IFBvc2l0aW9uQ29uZmlnKSB7XG5cbiAgICAgICAgdGhpcy5fY29uZmlnID0geyAuLi50aGlzLl9jb25maWcsIC4uLmNvbmZpZyB9O1xuXG4gICAgICAgIHRoaXMub3JpZ2luID0gdGhpcy5jb25maWcub3JpZ2luO1xuICAgIH1cblxuICAgIGdldCBjb25maWcgKCk6IFBvc2l0aW9uQ29uZmlnIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yIChwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudCwgY29uZmlnPzogUGFydGlhbDxQb3NpdGlvbkNvbmZpZz4pIHtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyBhcyBQb3NpdGlvbkNvbmZpZztcbiAgICB9XG5cbiAgICB1cGRhdGUgKHBvc2l0aW9uPzogUG9zaXRpb24sIHNpemU/OiBTaXplKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFuaW1hdGlvbkZyYW1lKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRTaXplID0gc2l6ZSB8fCB0aGlzLmdldFNpemUoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50UG9zaXRpb24gfHwgdGhpcy5oYXNQb3NpdGlvbkNoYW5nZWQobmV4dFBvc2l0aW9uLCB0aGlzLmN1cnJlbnRQb3NpdGlvbikpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTaXplIHx8IHRoaXMuaGFzU2l6ZUNoYW5nZWQobmV4dFNpemUsIHRoaXMuY3VycmVudFNpemUpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseVNpemUobmV4dFNpemUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTaXplID0gbmV4dFNpemU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uRnJhbWUpIHtcblxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZSk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgcG9zaXRpb25lZCBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBUaGUgcG9zaXRpb24gd2lsbCBkZXBlbmQgb24gdGhlIGFsaWdubWVudCBhbmQgb3JpZ2luIG9wdGlvbnMgb2YgdGhlIHtAbGluayBQb3NpdGlvbkNvbmZpZ30uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luQm94ID0gdGhpcy5nZXRCb3VuZGluZ0JveCh0aGlzLm9yaWdpbik7XG4gICAgICAgIGNvbnN0IHRhcmdldEJveCA9IHRoaXMuZ2V0Qm91bmRpbmdCb3godGhpcy50YXJnZXQpO1xuXG4gICAgICAgIC8vIFRPRE86IGluY2x1ZGUgYWxpZ25tZW50IG9mZnNldFxuXG4gICAgICAgIHJldHVybiBnZXRUYXJnZXRQb3NpdGlvbihvcmlnaW5Cb3gsIHRoaXMuY29uZmlnLmFsaWdubWVudC5vcmlnaW4sIHRhcmdldEJveCwgdGhpcy5jb25maWcuYWxpZ25tZW50LnRhcmdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBwb3NpdGlvbmVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFdlIHRha2UgdGhlIHNldHRpbmdzIGZyb20gdGhlIHtAbGluayBQb3NpdGlvbkNvbmZpZ30gc28gd2UgYXJlIGFsd2F5cyB1cC10by1kYXRlIGlmIHRoZSBjb25maWd1cmF0aW9uIHdhcyB1cGRhdGVkLlxuICAgICAqXG4gICAgICogVGhpcyBob29rIGFsc28gYWxsb3dzIHVzIHRvIGRvIHRoaW5ncyBsaWtlIG1hdGNoaW5nIHRoZSBvcmlnaW4ncyB3aWR0aCwgb3IgbG9va2luZyBhdCB0aGUgYXZhaWxhYmxlIHZpZXdwb3J0IGRpbWVuc2lvbnMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFNpemUgKCk6IFNpemUge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5jb25maWcud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuY29uZmlnLmhlaWdodCxcbiAgICAgICAgICAgIG1heFdpZHRoOiB0aGlzLmNvbmZpZy5tYXhXaWR0aCxcbiAgICAgICAgICAgIG1heEhlaWdodDogdGhpcy5jb25maWcubWF4SGVpZ2h0LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRCb3VuZGluZ0JveCAocmVmZXJlbmNlOiBQb3NpdGlvbiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgdW5kZWZpbmVkKTogQm91bmRpbmdCb3gge1xuXG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94OiBCb3VuZGluZ0JveCA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGlzUG9zaXRpb24ocmVmZXJlbmNlKSkge1xuXG4gICAgICAgICAgICBib3VuZGluZ0JveC54ID0gcmVmZXJlbmNlLng7XG4gICAgICAgICAgICBib3VuZGluZ0JveC55ID0gcmVmZXJlbmNlLnk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWZlcmVuY2UgPT09ICd2aWV3cG9ydCcpIHtcblxuICAgICAgICAgICAgYm91bmRpbmdCb3gud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGJvdW5kaW5nQm94LmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIGNvbnN0IG9yaWdpblJlY3QgPSByZWZlcmVuY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIGJvdW5kaW5nQm94LnggPSBvcmlnaW5SZWN0LmxlZnQ7XG4gICAgICAgICAgICBib3VuZGluZ0JveC55ID0gb3JpZ2luUmVjdC50b3A7XG4gICAgICAgICAgICBib3VuZGluZ0JveC53aWR0aCA9IG9yaWdpblJlY3Qud2lkdGg7XG4gICAgICAgICAgICBib3VuZGluZ0JveC5oZWlnaHQgPSBvcmlnaW5SZWN0LmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLnkpO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5yaWdodCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhcHBseVNpemUgKHNpemU6IFNpemUpIHtcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS53aWR0aCA9IHRoaXMucGFyc2VTdHlsZShzaXplLndpZHRoKTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKHNpemUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUubWF4V2lkdGggPSB0aGlzLnBhcnNlU3R5bGUoc2l6ZS5tYXhXaWR0aCk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLm1heEhlaWdodCA9IHRoaXMucGFyc2VTdHlsZShzaXplLm1heEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHBhcnNlU3R5bGUgKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XG5cbiAgICAgICAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSA/IGAkeyB2YWx1ZSB9cHhgIDogdmFsdWU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhc1Bvc2l0aW9uQ2hhbmdlZCAocG9zaXRpb24/OiBQb3NpdGlvbiwgb3RoZXI/OiBQb3NpdGlvbik6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiBoYXNQb3NpdGlvbkNoYW5nZWQocG9zaXRpb24sIG90aGVyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFzU2l6ZUNoYW5nZWQgKHNpemU/OiBTaXplLCBvdGhlcj86IFNpemUpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gaGFzU2l6ZUNoYW5nZWQoc2l6ZSwgb3RoZXIpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IERFRkFVTFRfUE9TSVRJT04sIFBvc2l0aW9uIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IFBvc2l0aW9uU3RyYXRlZ3kgfSBmcm9tICcuLi9wb3NpdGlvbi1zdHJhdGVneSc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRDogUG9zaXRpb25Db25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9QT1NJVElPTl9DT05GSUcsXG59O1xuXG5leHBvcnQgY2xhc3MgQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIodGFyZ2V0LCB7IC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NFTlRFUkVELCAuLi5jb25maWcgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGdldFBvc2l0aW9uIG1ldGhvZCB0byBhbHdheXMgcmV0dXJuIHRoZSB7QGxpbmsgREVGQVVMVF9QT1NJVElPTn1cbiAgICAgKlxuICAgICAqIFdlIGFjdHVhbGx5IGRvbid0IGNhcmUgYWJvdXQgdGhlIHBvc2l0aW9uLCBiZWNhdXNlIHdlIGFyZSBnb2luZyB0byB1c2Ugdmlld3BvcnQgcmVsYXRpdmVcbiAgICAgKiBDU1MgdW5pdHMgdG8gcG9zaXRpb24gdGhlIGVsZW1lbnQuIEFmdGVyIHRoZSBmaXJzdCBjYWxjdWxhdGlvbiBvZiB0aGUgcG9zaXRpb24sIGl0J3NcbiAgICAgKiBuZXZlciBnb2luZyB0byBjaGFuZ2UgYW5kIGFwcGx5UG9zaXRpb24gd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlLiBUaGlzIG1ha2VzIHRoaXNcbiAgICAgKiBwb3NpdGlvbiBzdHJhdGVneSByZWFsbHkgY2hlYXAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFBvc2l0aW9uICgpOiBQb3NpdGlvbiB7XG5cbiAgICAgICAgcmV0dXJuIERFRkFVTFRfUE9TSVRJT047XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kIHRvIGNlbnRlciB0aGUgZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgdmlld3BvcnRcbiAgICAgKiBkaW1lbnNpb25zIGFuZCBpdHMgb3duIHNpemUuIFRoaXMgc3R5bGUgaGFzIHRvIGJlIGFwcGxpZWQgb25seSBvbmNlIGFuZCBpcyByZXNwb25zaXZlXG4gICAgICogYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXBwbHlQb3NpdGlvbiAocG9zaXRpb246IFBvc2l0aW9uKSB7XG5cbiAgICAgICAgdGhpcy50YXJnZXQuc3R5bGUudG9wID0gJzUwdmgnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gJzUwdncnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5yaWdodCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5ib3R0b20gPSAnJztcblxuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKC01MCUsIC01MCUpYDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSAnLi4vcG9zaXRpb24tc3RyYXRlZ3knO1xuaW1wb3J0IHsgUG9zaXRpb25Db25maWcsIERFRkFVTFRfUE9TSVRJT05fQ09ORklHIH0gZnJvbSAnLi4vcG9zaXRpb24tY29uZmlnJztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi4vcG9zaXRpb24nO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QT1NJVElPTl9DT05GSUdfQ09OTkVDVEVEOiBQb3NpdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX1BPU0lUSU9OX0NPTkZJRyxcbiAgICBhbGlnbm1lbnQ6IHtcbiAgICAgICAgb3JpZ2luOiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnc3RhcnQnLFxuICAgICAgICAgICAgdmVydGljYWw6ICdlbmQnXG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ3N0YXJ0JyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9LFxuICAgIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cbiAgICBwcm90ZWN0ZWQgdXBkYXRlTGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IFBhcnRpYWw8UG9zaXRpb25Db25maWc+KSB7XG5cbiAgICAgICAgc3VwZXIodGFyZ2V0LCB7IC4uLkRFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NPTk5FQ1RFRCwgLi4uY29uZmlnIH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlTGlzdGVuZXIgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy51cGRhdGVMaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGVzdHJveSAoKSB7XG5cbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlTGlzdGVuZXIpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLnVwZGF0ZUxpc3RlbmVyLCB0cnVlKTtcblxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2Ugb3ZlcnJpZGUgdGhlIGFwcGx5UG9zaXRpb24gbWV0aG9kLCBzbyB3ZSBjYW4gdXNlIGEgQ1NTIHRyYW5zZm9ybSB0byBwb3NpdGlvbiB0aGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FuIHJlc3VsdCBpbiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFwcGx5UG9zaXRpb24gKHBvc2l0aW9uOiBQb3NpdGlvbikge1xuXG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnRvcCA9ICcnO1xuICAgICAgICB0aGlzLnRhcmdldC5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLmJvdHRvbSA9ICcnO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHsgdGhpcy5wYXJzZVN0eWxlKHBvc2l0aW9uLngpIH0sICR7IHRoaXMucGFyc2VTdHlsZShwb3NpdGlvbi55KSB9KWA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgREVGQVVMVF9QT1NJVElPTl9DT05GSUcsIFBvc2l0aW9uQ29uZmlnIH0gZnJvbSAnLi9wb3NpdGlvbi1jb25maWcnO1xuaW1wb3J0IHsgUG9zaXRpb25TdHJhdGVneSB9IGZyb20gJy4vcG9zaXRpb24tc3RyYXRlZ3knO1xuaW1wb3J0IHsgQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5LCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRCB9IGZyb20gJy4vc3RyYXRlZ2llcy9jZW50ZXJlZC1wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQgeyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DT05ORUNURUQgfSBmcm9tICcuL3N0cmF0ZWdpZXMvY29ubmVjdGVkLXBvc2l0aW9uLXN0cmF0ZWd5JztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvblN0cmF0ZWd5TWFwIHtcbiAgICBba2V5OiBzdHJpbmddOiB7IG5ldyh0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IFBvc2l0aW9uU3RyYXRlZ3kgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbmZpZ01hcCB7XG4gICAgW2tleTogc3RyaW5nXTogUG9zaXRpb25Db25maWc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX1NUUkFURUdJRVM6IFBvc2l0aW9uU3RyYXRlZ3lNYXAgPSB7XG4gICAgZGVmYXVsdDogUG9zaXRpb25TdHJhdGVneSxcbiAgICBjZW50ZXJlZDogQ2VudGVyZWRQb3NpdGlvblN0cmF0ZWd5LFxuICAgIGNvbm5lY3RlZDogQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR1M6IFBvc2l0aW9uQ29uZmlnTWFwID0ge1xuICAgIGRlZmF1bHQ6IERFRkFVTFRfUE9TSVRJT05fQ09ORklHLFxuICAgIGNlbnRlcmVkOiBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR19DRU5URVJFRCxcbiAgICBjb25uZWN0ZWQ6IERFRkFVTFRfUE9TSVRJT05fQ09ORklHX0NPTk5FQ1RFRCxcbn07XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHByb3RlY3RlZCBzdHJhdGVnaWVzOiBQb3NpdGlvblN0cmF0ZWd5TWFwID0gREVGQVVMVF9QT1NJVElPTl9TVFJBVEVHSUVTLFxuICAgICAgICBwcm90ZWN0ZWQgY29uZmlnczogUG9zaXRpb25Db25maWdNYXAgPSBERUZBVUxUX1BPU0lUSU9OX0NPTkZJR1NcbiAgICApIHsgfVxuXG4gICAgY3JlYXRlUG9zaXRpb25TdHJhdGVneSAodHlwZTogc3RyaW5nLCB0YXJnZXQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPik6IFBvc2l0aW9uU3RyYXRlZ3kge1xuXG4gICAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5zdHJhdGVnaWVzW3R5cGVdIHx8IFBvc2l0aW9uU3RyYXRlZ3k7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7IC4uLnRoaXMuY29uZmlnc1t0eXBlXSB8fCBERUZBVUxUX1BPU0lUSU9OX0NPTkZJRywgLi4uY29uZmlnIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBzdHJhdGVneSh0YXJnZXQsIGNvbmZpZ3VyYXRpb24pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEJlaGF2aW9yIH0gZnJvbSAnLi4vYmVoYXZpb3InO1xuaW1wb3J0IHsgRm9jdXNUcmFwIH0gZnJvbSAnLi9mb2N1cy10cmFwJztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXknO1xuaW1wb3J0IHsgT3ZlcmxheUNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHsgT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuL292ZXJsYXktc2VydmljZSc7XG5pbXBvcnQgeyBGb2N1c0NoYW5nZUV2ZW50IH0gZnJvbSAnLi9mb2N1cy1tb25pdG9yJztcbmltcG9ydCB7IEVzY2FwZSwgU3BhY2UsIEVudGVyIH0gZnJvbSAnLi4va2V5cyc7XG5cbmV4cG9ydCBjbGFzcyBPdmVybGF5Q29udHJvbGxlciBleHRlbmRzIEJlaGF2aW9yIHtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzVHJhcDtcblxuICAgIHByb3RlY3RlZCBwcmV2aW91c0ZvY3VzPzogSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvciAocHVibGljIG92ZXJsYXk6IE92ZXJsYXksIHByb3RlY3RlZCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2tleWRvd24nLCAoZXZlbnQ6IEV2ZW50KSA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLm92ZXJsYXksICdvcGVuLWNoYW5nZWQnLCAoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcudHJhcEZvY3VzKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNUcmFwID0gbmV3IEZvY3VzVHJhcCh0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgIHRoaXMubGlzdGVuKHRoaXMub3ZlcmxheSwgJ2ZvY3VzLWNoYW5nZWQnLCBldmVudCA9PiB0aGlzLmhhbmRsZUZvY3VzQ2hhbmdlKGV2ZW50IGFzIEZvY3VzQ2hhbmdlRXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGF0dGFjaCAoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblxuICAgICAgICBzdXBlci5hdHRhY2goZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCAnZGlhbG9nJyk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy5lbGVtZW50ISwgJ2tleWRvd24nLCAoZXZlbnQ6IEV2ZW50KSA9PiB0aGlzLmhhbmRsZUtleWRvd24oZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLmVsZW1lbnQhLCAnbW91c2Vkb3duJywgKGV2ZW50OiBFdmVudCkgPT4gdGhpcy5oYW5kbGVNb3VzZWRvd24oZXZlbnQgYXMgTW91c2VFdmVudCkpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgZGV0YWNoICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0YWNoZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oYXNwb3B1cCcpO1xuICAgICAgICB0aGlzLmVsZW1lbnQhLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpO1xuXG4gICAgICAgIHN1cGVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dGFjaGVkKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5lbGVtZW50IS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLm92ZXJsYXkub3BlbiA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgIH1cblxuICAgIGFzeW5jIG9wZW4gKGV2ZW50PzogRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm92ZXJsYXlTZXJ2aWNlLm9wZW5PdmVybGF5KHRoaXMub3ZlcmxheSwgZXZlbnQpO1xuXG4gICAgICAgIGlmICh0aGlzLmZvY3VzVHJhcCkge1xuXG4gICAgICAgICAgICB0aGlzLnNhdmVGb2N1cygpO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzVHJhcC5hdHRhY2godGhpcy5vdmVybGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2UgKGV2ZW50PzogRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm92ZXJsYXlTZXJ2aWNlLmNsb3NlT3ZlcmxheSh0aGlzLm92ZXJsYXksIGV2ZW50KTtcblxuICAgICAgICBpZiAodGhpcy5mb2N1c1RyYXApIHtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c1RyYXAuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIHRoaXMucmVzdG9yZUZvY3VzKGV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgYXN5bmMgdG9nZ2xlIChldmVudD86IEV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheVNlcnZpY2UuaXNPdmVybGF5T3Blbih0aGlzLm92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb3NlKGV2ZW50KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcGVuKGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBzYXZlRm9jdXMgKCkge1xuXG4gICAgICAgIHRoaXMucHJldmlvdXNGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQgfHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCByZXN0b3JlRm9jdXMgKGV2ZW50PzogRXZlbnQpIHtcblxuICAgICAgICAvLyB3ZSBvbmx5IHJlc3RvcmUgdGhlIGZvY3VzIGlmIHRoZSBvdmVybGF5IGlzIGNsb3NlZCBwcmVzc2luZyBFc2NhcGUgb3IgcHJvZ3JhbW1hdGljYWxseVxuICAgICAgICBjb25zdCByZXN0b3JlRm9jdXMgPSB0aGlzLmNvbmZpZy5yZXN0b3JlRm9jdXNcbiAgICAgICAgICAgICYmIHRoaXMucHJldmlvdXNGb2N1c1xuICAgICAgICAgICAgJiYgKHRoaXMuaXNFc2NhcGUoZXZlbnQpIHx8ICFldmVudCk7XG5cbiAgICAgICAgaWYgKHJlc3RvcmVGb2N1cykge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnT3ZlcmxheUNvbnRyb2xsZXIucmVzdG9yZUZvY3VzLi4uJywgZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzIS5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVGb2N1c0NoYW5nZSAoZXZlbnQ6IEZvY3VzQ2hhbmdlRXZlbnQpIHtcblxuICAgICAgICBjb25zdCBoYXNGb2N1cyA9IGV2ZW50LmRldGFpbC50eXBlID09PSAnZm9jdXNpbic7XG5cbiAgICAgICAgaWYgKCFoYXNGb2N1cykge1xuXG4gICAgICAgICAgICAvLyB3aGVuIGxvb3NpbmcgZm9jdXMsIHdlIHdhaXQgZm9yIHBvdGVudGlhbCBmb2N1c2luIGV2ZW50cyBvbiBjaGlsZCBvdmVybGF5cyBieSBkZWxheWluZyB0aGUgYWN0aXZlIGNoZWNrIHdpdGggYSBwcm9taXNlXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gd2UgY2hlY2sgaWYgdGhlIG92ZXJsYXkgaXMgYWN0aXZlIGFuZCBpZiBub3QsIHdlIGNsb3NlIGl0XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlTZXJ2aWNlLmlzT3ZlcmxheUFjdGl2ZSh0aGlzLm92ZXJsYXkpKSB0aGlzLmNsb3NlKGV2ZW50KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5ZG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEVudGVyOlxuICAgICAgICAgICAgY2FzZSBTcGFjZTpcblxuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuZWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRXNjYXBlOlxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlTZXJ2aWNlLmlzT3ZlcmxheU9wZW4odGhpcy5vdmVybGF5KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZShldmVudCk7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVNb3VzZWRvd24gKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy50b2dnbGUoZXZlbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBpc0VzY2FwZSAoZXZlbnQ/OiBFdmVudCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiBldmVudCAmJiBldmVudC50eXBlID09PSAna2V5ZG93bicgJiYgKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpLmtleSA9PT0gRXNjYXBlIHx8IGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlRXZlbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgaW5zZXJ0QWZ0ZXIgfSBmcm9tICcuLi9kb20nO1xuaW1wb3J0IHsgRm9jdXNUcmFwLCBGb2N1c1RyYXBDb25maWcgfSBmcm9tICcuL2ZvY3VzLXRyYXAnO1xuaW1wb3J0IHsgT3ZlcmxheSB9IGZyb20gJy4vb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5QmFja2Ryb3AgfSBmcm9tICcuL292ZXJsYXktYmFja2Ryb3AnO1xuaW1wb3J0IHsgT3ZlcmxheUNvbmZpZyB9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHsgT3ZlcmxheVRyaWdnZXIgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBPdmVybGF5VHJpZ2dlckZhY3RvcnkgfSBmcm9tICcuL292ZXJsYXktdHJpZ2dlci1mYWN0b3J5JztcbmltcG9ydCB7IGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZCwgUG9zaXRpb25Db25maWcsIFBPU0lUSU9OX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuL3Bvc2l0aW9uL3Bvc2l0aW9uLWNvbmZpZyc7XG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSAnLi9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneSc7XG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB9IGZyb20gJy4vcG9zaXRpb24vcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5pbXBvcnQgeyBGb2N1c0NoYW5nZUV2ZW50IH0gZnJvbSAnLi9mb2N1cy1tb25pdG9yJztcbmltcG9ydCB7IE92ZXJsYXlDb250cm9sbGVyIH0gZnJvbSAnLi9vdmVybGF5LWNvbnRyb2xsZXInO1xuXG5jb25zdCBPVkVSTEFZX1VOUkVHSVNURVJFRF9FUlJPUiA9IChvdmVybGF5OiB0eXBlb2YgT3ZlcmxheSkgPT4gbmV3IEVycm9yKGBPdmVybGF5IGlzIG5vdCByZWdpc3RlcmVkOiAkeyBvdmVybGF5LnNlbGVjdG9yIH1gKTtcblxubGV0IE9WRVJMQVlfU0VSVklDRV9JTlNUQU5DRTogT3ZlcmxheVNlcnZpY2UgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheURlZmluaXRpb24ge1xuICAgIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPjtcbiAgICBwb3NpdGlvblN0cmF0ZWd5PzogUG9zaXRpb25TdHJhdGVneTtcbiAgICBvdmVybGF5VHJpZ2dlcj86IE92ZXJsYXlUcmlnZ2VyO1xuICAgIGZvY3VzVHJhcD86IEZvY3VzVHJhcDtcbiAgICB1cGRhdGVMaXN0ZW5lcjogKGV2ZW50OiBDdXN0b21FdmVudCkgPT4gdm9pZDtcbiAgICBvcGVuQ2hhbmdlTGlzdGVuZXI6IChldmVudDogQ3VzdG9tRXZlbnQpID0+IHZvaWQ7XG4gICAgZm9jdXNDaGFuZ2VMaXN0ZW5lcjogKGV2ZW50OiBGb2N1c0NoYW5nZUV2ZW50KSA9PiB2b2lkO1xuICAgIGRlc3Ryb3k6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBPdmVybGF5U2VydmljZSB7XG5cbiAgICBwcm90ZWN0ZWQgcmVnaXN0ZXJlZE92ZXJsYXlzOiBNYXA8T3ZlcmxheSwgT3ZlcmxheURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZU92ZXJsYXlzOiBPdmVybGF5W10gPSBbXTtcblxuICAgIHByb3RlY3RlZCBiYWNrZHJvcCE6IE92ZXJsYXlCYWNrZHJvcDtcblxuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgcHJvdGVjdGVkIHBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5OiBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSA9IG5ldyBQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSgpLFxuICAgICAgICBwcm90ZWN0ZWQgb3ZlcmxheVRyaWdnZXJGYWN0b3J5OiBPdmVybGF5VHJpZ2dlckZhY3RvcnkgPSBuZXcgT3ZlcmxheVRyaWdnZXJGYWN0b3J5KCksXG4gICAgICAgIHByb3RlY3RlZCByb290OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmJvZHlcbiAgICApIHtcblxuICAgICAgICBpZiAoIU9WRVJMQVlfU0VSVklDRV9JTlNUQU5DRSkge1xuXG4gICAgICAgICAgICBPVkVSTEFZX1NFUlZJQ0VfSU5TVEFOQ0UgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUJhY2tkcm9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gT1ZFUkxBWV9TRVJWSUNFX0lOU1RBTkNFO1xuICAgIH1cblxuICAgIGhhc09wZW5PdmVybGF5cyAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlT3ZlcmxheXMubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBoYXNPdmVybGF5IChvdmVybGF5OiBPdmVybGF5KTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmhhcyhvdmVybGF5KTtcbiAgICB9XG5cbiAgICBpc092ZXJsYXlPcGVuIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlT3ZlcmxheXMuaW5jbHVkZXMob3ZlcmxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gb3ZlcmxheSBpcyBjb25zaWRlcmVkIGZvY3VzZWQsIGlmIGVpdGhlciBpdHNlbGYgb3IgYW55IG9mIGl0cyBkZXNjZW5kYW50IG5vZGVzIGhhcyBmb2N1cy5cbiAgICAgKi9cbiAgICBpc092ZXJsYXlGb2N1c2VkIChvdmVybGF5OiBPdmVybGF5KTogYm9vbGVhbiB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgcmV0dXJuIG92ZXJsYXkgPT09IGFjdGl2ZUVsZW1lbnQgfHwgb3ZlcmxheS5jb250YWlucyhhY3RpdmVFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBvdmVybGF5IGlzIGNvbnNpZGVyZWQgYWN0aXZlIGlmIGl0IGlzIGVpdGhlciBmb2N1c2VkIG9yIGhhcyBhIGRlc2NlbmRhbnQgb3ZlcmxheSB3aGljaCBpcyBmb2N1c2VkLlxuICAgICAqL1xuICAgIGlzT3ZlcmxheUFjdGl2ZSAob3ZlcmxheTogT3ZlcmxheSk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGxldCBpc0ZvdW5kID0gZmFsc2U7XG4gICAgICAgIGxldCBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdGhpcy5hY3RpdmVPdmVybGF5cy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoICYmICFpc0FjdGl2ZTsgaW5kZXgrKykge1xuXG4gICAgICAgICAgICBpZiAoIWlzRm91bmQgJiYgdGhpcy5hY3RpdmVPdmVybGF5c1tpbmRleF0gPT09IG92ZXJsYXkpIGlzRm91bmQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNGb3VuZCkge1xuXG4gICAgICAgICAgICAgICAgaXNBY3RpdmUgPSB0aGlzLmlzT3ZlcmxheUZvY3VzZWQodGhpcy5hY3RpdmVPdmVybGF5c1tpbmRleF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH1cblxuICAgIGNyZWF0ZUJhY2tkcm9wICgpIHtcblxuICAgICAgICB0aGlzLmJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChPdmVybGF5QmFja2Ryb3Auc2VsZWN0b3IpIGFzIE92ZXJsYXlCYWNrZHJvcDtcblxuICAgICAgICB0aGlzLnJvb3QuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZHJvcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IG92ZXJsYXlcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIENyZWF0ZXMgYSBuZXcgb3ZlcmxheSBpbnN0YW5jZXMgYW5kIHJlZ2lzdGVycyBpdCB3aXRoIHRoZSBzZXJ2aWNlLlxuICAgICAqL1xuICAgIGNyZWF0ZU92ZXJsYXkgKGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPik6IE92ZXJsYXkge1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KE92ZXJsYXkuc2VsZWN0b3IpIGFzIE92ZXJsYXk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3Rlck92ZXJsYXkob3ZlcmxheSwgY29uZmlnKTtcblxuICAgICAgICByZXR1cm4gb3ZlcmxheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhbiBvdmVybGF5IHdpdGggdGhlIG92ZXJsYXkgc2VydmljZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQWRkcyB0aGUgb3ZlcmxheSBpbnN0YW5jZSB0byB0aGUgb3ZlcmxheSBzZXJ2aWNlJ3MgcmVnaXN0cnksIGV4dHJhY3RzIHRoZSBvdmVybGF5J3MgY29uZmlndXJhdGlvbiBhbmRcbiAgICAgKiBhdHRhY2hlcyB0aGUgb3ZlcmxheSB0byB0aGUgb3ZlcmxheSBzZXJ2aWNlJ3Mgcm9vdCBsb2NhdGlvbiBpbiB0aGUgZG9jdW1lbnQgYm9keS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG92ZXJsYXkgd2FzIHJlZ2lzdGVyZWQgc3VjY2Vzc2Z1bGx5LCBmYWxzZSBpZiB0aGUgb3ZlcmxheSBoYXMgYmVlbiByZWdpc3RlcmVkIGFscmVhZHlcbiAgICAgKi9cbiAgICByZWdpc3Rlck92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9KTogYm9vbGVhbiB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLnNldChvdmVybGF5LCB0aGlzLmNvbmZpZ3VyZU92ZXJsYXkob3ZlcmxheSwgY29uZmlnKSk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBvcGVuT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ/OiBFdmVudCkge1xuXG4gICAgLy8gICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgLy8gICAgIGlmICh0aGlzLmlzT3ZlcmxheU9wZW4ob3ZlcmxheSkpIHJldHVybjtcblxuICAgIC8vICAgICAvLyB3ZSBuZWVkIHRvIGNoZWNrIGlmIGFuIGV2ZW50IGNhdXNlZCB0aGUgb3ZlcmxheSB0byBvcGVuIGFuZCBpZiBpdCBvcmlnaW5hdGVzIGZyb20gYW55IGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzdGFja1xuICAgIC8vICAgICBsZXQgbGVuZ3RoID0gdGhpcy5hY3RpdmVPdmVybGF5cy5sZW5ndGgsXG4gICAgLy8gICAgICAgICBpbmRleCA9IGxlbmd0aCAtIDE7XG5cbiAgICAvLyAgICAgaWYgKGV2ZW50ICYmIGxlbmd0aCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG5cbiAgICAvLyAgICAgICAgIGZvciAoaW5kZXg7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcblxuICAgIC8vICAgICAgICAgICAgIGxldCBhY3RpdmVPdmVybGF5ID0gdGhpcy5hY3RpdmVPdmVybGF5c1tpbmRleF07XG5cbiAgICAvLyAgICAgICAgICAgICBpZiAoYWN0aXZlT3ZlcmxheSA9PT0gZXZlbnQudGFyZ2V0IHx8IGFjdGl2ZU92ZXJsYXkuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuXG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIHdlIGZvdW5kIHRoZSBhY3RpdmUgb3ZlcmxheSB0aGF0IGNhdXNlZCB0aGUgZXZlbnQsIHdlIGtlZXAgdGhlIHN0YWNrIHVwIHRvIHRoaXMgb3ZlcmxheVxuICAgIC8vICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgIC8vICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gdGhlIGFjdGl2ZSBvdmVybGF5IGRpZG4ndCBjYXVzZSB0aGUgZXZlbnQsIHNvIGl0IHNob3VsZCBiZSBjbG9zZWQgYW5kIGRpc2NhcmRlZCBmcm9tIHRoZSBzdGFja1xuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheShvdmVybGF5KTtcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICAvLyBwdXNoIG92ZXJsYXkgb24gdGhlIHN0YWNrIHRvIG1hcmsgaXQgYXMgY3VycmVudGx5IGFjdGl2ZSBvdmVybGF5XG4gICAgLy8gICAgIHRoaXMuYWN0aXZlT3ZlcmxheXMucHVzaChvdmVybGF5KTtcblxuICAgIC8vICAgICBvdmVybGF5LnNob3coKTtcbiAgICAvLyB9XG5cbiAgICBhc3luYyBvcGVuT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ/OiBFdmVudCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzT3ZlcmxheU9wZW4ob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgICAgIHJlamVjdChmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4tY2hhbmdlZCcsIChldmVudCkgPT4gcmVzb2x2ZSh0cnVlKSwgeyBvbmNlOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGNoZWNrIGlmIGFuIGV2ZW50IGNhdXNlZCB0aGUgb3ZlcmxheSB0byBvcGVuIGFuZCBpZiBpdCBvcmlnaW5hdGVzIGZyb20gYW55IGFjdGl2ZSBvdmVybGF5IGluIHRoZSBzdGFja1xuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuYWN0aXZlT3ZlcmxheXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gbGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgaWYgKGV2ZW50ICYmIGxlbmd0aCAmJiBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGluZGV4OyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjdGl2ZU92ZXJsYXkgPSB0aGlzLmFjdGl2ZU92ZXJsYXlzW2luZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlT3ZlcmxheSA9PT0gZXZlbnQudGFyZ2V0IHx8IGFjdGl2ZU92ZXJsYXkuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBmb3VuZCB0aGUgYWN0aXZlIG92ZXJsYXkgdGhhdCBjYXVzZWQgdGhlIGV2ZW50LCB3ZSBrZWVwIHRoZSBzdGFjayB1cCB0byB0aGlzIG92ZXJsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3RpdmUgb3ZlcmxheSBkaWRuJ3QgY2F1c2UgdGhlIGV2ZW50LCBzbyBpdCBzaG91bGQgYmUgY2xvc2VkIGFuZCBkaXNjYXJkZWQgZnJvbSB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwdXNoIG92ZXJsYXkgb24gdGhlIHN0YWNrIHRvIG1hcmsgaXQgYXMgY3VycmVudGx5IGFjdGl2ZSBvdmVybGF5XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU92ZXJsYXlzLnB1c2gob3ZlcmxheSk7XG5cbiAgICAgICAgICAgIG92ZXJsYXkuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjbG9zZU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGV2ZW50PzogRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgICAgICB0aGlzLl90aHJvd1VucmVnaXNlcmVkT3ZlcmxheShvdmVybGF5KTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNPdmVybGF5T3BlbihvdmVybGF5KSkge1xuXG4gICAgICAgICAgICAgICAgcmVqZWN0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignb3Blbi1jaGFuZ2VkJywgKGV2ZW50KSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIGxldCBpc0ZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHdoaWxlICghaXNGb3VuZCkge1xuXG4gICAgICAgICAgICAgICAgLy8gYWN0aXZlT3ZlcmxheSBpcyBlaXRoZXIgYSBkZXNjZW5kYW50IG9mIG92ZXJsYXkgb3Igb3ZlcmxheSBpdHNlbGZcbiAgICAgICAgICAgICAgICBsZXQgYWN0aXZlT3ZlcmxheSA9IHRoaXMuYWN0aXZlT3ZlcmxheXMucG9wKCkhO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgYXJyaXZlZCBhdCB0aGUgb3ZlcmxheSwgd2Ugc3RvcCBjbG9zaW5nXG4gICAgICAgICAgICAgICAgaXNGb3VuZCA9IGFjdGl2ZU92ZXJsYXkgPT09IG92ZXJsYXk7XG5cbiAgICAgICAgICAgICAgICBhY3RpdmVPdmVybGF5LmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ/OiBFdmVudCkge1xuXG4gICAgICAgIGlmICh0aGlzLmlzT3ZlcmxheU9wZW4ob3ZlcmxheSkpIHtcblxuICAgICAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkob3ZlcmxheSwgZXZlbnQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkob3ZlcmxheSwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveU92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXksIGRpc2Nvbm5lY3Q6IGJvb2xlYW4gPSB0cnVlKSB7XG5cbiAgICAgICAgdGhpcy5fdGhyb3dVbnJlZ2lzZXJlZE92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgLy8gVE9ETzogd2UgbmVlZCB0byBhbHNvIGRlc3Ryb3kgZGVzY2VuZGFudCBvdmVybGF5cz9cbiAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkob3ZlcmxheSk7XG5cbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KTtcblxuICAgICAgICBpZiAoZGVmaW5pdGlvbiAmJiBkZWZpbml0aW9uLmRlc3Ryb3kpIHtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5kZXN0cm95KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlzY29ubmVjdCAmJiBvdmVybGF5LnBhcmVudEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgb3ZlcmxheS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZGVsZXRlKG92ZXJsYXkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbk92ZXJsYXlPcGVuIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkge1xuXG4gICAgICAgICAgICBjb25zdCB7IHVwZGF0ZUxpc3RlbmVyLCBwb3NpdGlvblN0cmF0ZWd5LCBmb2N1c1RyYXAsIGNvbmZpZyB9ID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy50ZW1wbGF0ZSAmJiBjb25maWcuY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgLy8gdG8ga2VlcCBhIHRlbXBsYXRlIHVwLXRvLWRhdGUgd2l0aCBpdCdzIGNvbnRleHQsIHdlIGhhdmUgdG8gcmVuZGVyIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIC8vIGV2ZXJ5dGltZSB0aGUgY29udGV4dCByZW5kZXJzIC0gdGhhdCBpcywgb24gZXZlcnkgdXBkYXRlIHdoaWNoIHdhcyB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICBjb25maWcuY29udGV4dC5hZGRFdmVudExpc3RlbmVyKCd1cGRhdGUnLCB1cGRhdGVMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyKTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyT3ZlcmxheShvdmVybGF5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uU3RyYXRlZ3kpIHtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uU3RyYXRlZ3kudXBkYXRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChmb2N1c1RyYXApIHtcblxuICAgICAgICAgICAgLy8gICAgIGZvY3VzVHJhcC5hdHRhY2gob3ZlcmxheSk7XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIC8vIFRPRE86IG1hbmFnZSBiYWNrZHJvcFxuXG4gICAgICAgICAgICAvLyBpZiAoY29uZmlnLmJhY2tkcm9wKSB7XG5cbiAgICAgICAgICAgIC8vICAgICB0aGlzLmJhY2tkcm9wLnNob3coKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbk92ZXJsYXlDbG9zZSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgZG9lc24ndCBnZXQgY2FsbGVkIHdoZW4gcHJvZ3JhbW1hdGljIG92ZXJsYXlzIGNsb3NlLi4uXG4gICAgICAgIC8vIHRoZSBpc3N1ZSBpcyB0aGUgb3Blbi1jaGFuZ2VkIGV2ZW50IGJlaW5nIHRyaWdnZXJlZCBpbiB0aGUgb3ZlcmxheSdzIHVwZGF0ZSBjeWNsZVxuICAgICAgICAvLyB3aGljaCBpcyBhZnRlciB0aGUgb3ZlcmxheSB3YXMgZGVzdHJveWVkIGFscmVhZHkuLi5cbiAgICAgICAgaWYgKHRoaXMuaGFzT3ZlcmxheShvdmVybGF5KSkge1xuXG4gICAgICAgICAgICBjb25zdCB7IHVwZGF0ZUxpc3RlbmVyLCBmb2N1c1RyYXAsIGNvbmZpZyB9ID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy50ZW1wbGF0ZSAmJiBjb25maWcuY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgY29uZmlnLmNvbnRleHQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndXBkYXRlJywgdXBkYXRlTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChmb2N1c1RyYXApIHtcblxuICAgICAgICAgICAgLy8gICAgIGZvY3VzVHJhcC5kZXRhY2goKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgLy8gdGhpcy5iYWNrZHJvcC5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlndXJlT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSwgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0ge30pOiBPdmVybGF5RGVmaW5pdGlvbiB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2NvbmZpZ3VyZU92ZXJsYXkoKS4uLiAnLCBvdmVybGF5LCBjb25maWcpO1xuXG4gICAgICAgIGNvbnN0IGRlZmluaXRpb246IE92ZXJsYXlEZWZpbml0aW9uID0ge1xuICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLmNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3kob3ZlcmxheSwgY29uZmlnKSxcbiAgICAgICAgICAgIG92ZXJsYXlUcmlnZ2VyOiB0aGlzLmNyZWF0ZU92ZXJsYXlUcmlnZ2VyKG92ZXJsYXksIGNvbmZpZyksXG4gICAgICAgICAgICAvLyBmb2N1c1RyYXA6IHRoaXMuY3JlYXRlRm9jdXNUcmFwKG92ZXJsYXksIGNvbmZpZyksXG4gICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcjogKCkgPT4gdGhpcy5yZW5kZXJPdmVybGF5KG92ZXJsYXkpLFxuICAgICAgICAgICAgb3BlbkNoYW5nZUxpc3RlbmVyOiAoZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pID0+IHRoaXMuaGFuZGxlT3BlbkNoYW5nZShvdmVybGF5LCBldmVudCksXG4gICAgICAgICAgICBmb2N1c0NoYW5nZUxpc3RlbmVyOiAoZXZlbnQ6IEZvY3VzQ2hhbmdlRXZlbnQpID0+IHRoaXMuaGFuZGxlRm9jdXNDaGFuZ2Uob3ZlcmxheSwgZXZlbnQpLFxuICAgICAgICAgICAgZGVzdHJveTogKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgb3ZlcmxheS5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuLWNoYW5nZWQnLCBkZWZpbml0aW9uLm9wZW5DaGFuZ2VMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAvLyBvdmVybGF5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzLWNoYW5nZWQnLCBkZWZpbml0aW9uLmZvY3VzQ2hhbmdlTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2VQb3NpdGlvblN0cmF0ZWd5KG92ZXJsYXkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcG9zZU92ZXJsYXlUcmlnZ2VyKG92ZXJsYXkpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZGlzcG9zZUZvY3VzVHJhcChvdmVybGF5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGFzIE92ZXJsYXlEZWZpbml0aW9uO1xuXG4gICAgICAgIG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignb3Blbi1jaGFuZ2VkJywgZGVmaW5pdGlvbi5vcGVuQ2hhbmdlTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIC8vIG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMtY2hhbmdlZCcsIGRlZmluaXRpb24uZm9jdXNDaGFuZ2VMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyKTtcblxuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVPdmVybGF5Q29uZmlnIChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7fSkge1xuXG4gICAgICAgIHRoaXMuX3Rocm93VW5yZWdpc2VyZWRPdmVybGF5KG92ZXJsYXkpO1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXlEZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBjb25zdCBvdmVybGF5Q29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0geyAuLi5vdmVybGF5RGVmaW5pdGlvbi5jb25maWcsIC4uLmNvbmZpZyB9O1xuXG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb25TdHJhdGVneShvdmVybGF5LCBvdmVybGF5Q29uZmlnKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZU92ZXJsYXlUcmlnZ2VyKG92ZXJsYXksIG92ZXJsYXlDb25maWcpO1xuXG4gICAgICAgIC8vIGZpbmFsbHkgc3RvcmUgdGhlIHVwZGF0ZWQgY29uZmlnIGluIHRoZSBPdmVybGF5RGVmaW5pdGlvblxuICAgICAgICBvdmVybGF5RGVmaW5pdGlvbi5jb25maWcgPSBvdmVybGF5Q29uZmlnO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVQb3NpdGlvblN0cmF0ZWd5IChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pIHtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBjb25zdCBoYXNUeXBlQ2hhbmdlZCA9IGRlZmluaXRpb24uY29uZmlnLnBvc2l0aW9uVHlwZSAhPT0gY29uZmlnLnBvc2l0aW9uVHlwZTtcbiAgICAgICAgY29uc3QgaGFzQ29uZmlnQ2hhbmdlZCA9IGhhc1Bvc2l0aW9uQ29uZmlnQ2hhbmdlZChkZWZpbml0aW9uLmNvbmZpZywgY29uZmlnKTtcblxuICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlUG9zaXRpb25TdHJhdGVneS4uLiB0eXBlIGNoYW5nZWQ6ICVzLCBjb25maWcgY2hhbmdlZDogJXMnLCBoYXNUeXBlQ2hhbmdlZCwgaGFzQ29uZmlnQ2hhbmdlZCk7XG5cbiAgICAgICAgaWYgKGhhc1R5cGVDaGFuZ2VkIHx8IGhhc0NvbmZpZ0NoYW5nZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5kaXNwb3NlUG9zaXRpb25TdHJhdGVneShvdmVybGF5KTtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5wb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KG92ZXJsYXksIGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUG9zaXRpb25TdHJhdGVneSAob3ZlcmxheTogT3ZlcmxheSwgY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+KTogUG9zaXRpb25TdHJhdGVneSB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5wb3NpdGlvblR5cGUpIHtcblxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMucG9zaXRpb25TdHJhdGVneUZhY3RvcnkuY3JlYXRlUG9zaXRpb25TdHJhdGVneShcbiAgICAgICAgICAgICAgICBjb25maWcucG9zaXRpb25UeXBlLFxuICAgICAgICAgICAgICAgIG92ZXJsYXksXG4gICAgICAgICAgICAgICAgdGhpcy5fZXh0cmFjdFBvc2l0aW9uQ29uZmlnKGNvbmZpZykpO1xuXG4gICAgICAgICAgICAvLyB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgYnVpbGRzIGl0cyBvd24gY29uZmlnIGJhc2VkIG9uIHRoZSBwb3NpdGlvblR5cGUgc2V0dGluZywgd2UgbmVlZCB0byByZWZsZWN0IHRoaXMgYmFja1xuICAgICAgICAgICAgLy8gVE9ETzogdGhpcyBzZWVtcyBhIHRhZCBoYWNreS4uLlxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihjb25maWcsIHBvc2l0aW9uU3RyYXRlZ3kuY29uZmlnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uU3RyYXRlZ3k7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcG9zZVBvc2l0aW9uU3RyYXRlZ3kgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gdGhpcy5yZWdpc3RlcmVkT3ZlcmxheXMuZ2V0KG92ZXJsYXkpITtcblxuICAgICAgICBpZiAoZGVmaW5pdGlvbi5wb3NpdGlvblN0cmF0ZWd5KSB7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24ucG9zaXRpb25TdHJhdGVneS5kZXN0cm95KCk7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24ucG9zaXRpb25TdHJhdGVneSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIHRyaWdnZXIgZWxlbWVudCBhbmQgdHJpZ2dlciB0eXBlIG9mIGFuIE92ZXJsYXlcbiAgICAgKlxuICAgICAqIElmIHRoZSB0cmlnZ2VyIGVsZW1lbnQgY2hhbmdlZCwgdGhlIE92ZXJsYXlUcmlnZ2VyIGluc3RhbmNlIHdpbGwgYmUgZGV0YWNoZWQgZnJvbSB0aGUgb2xkIHRyaWdnZXIgZWxlbWVudFxuICAgICAqIGFuZCByZS1hdHRhY2hlZCB0byB0aGUgbmV3IHRyaWdnZXIgZWxlbWVudC4gSWYgdGhlIHRyaWdnZXIgdHlwZSBjaGFuZ2VkLCB0aGUgb2xkIE92ZXJsYXlUcmlnZ2VyIHdpbGwgYmUgZGV0YWNoZWQsXG4gICAgICogYSBuZXcgb25lIHdpbGwgYmUgY3JlYXRlZCBhbmQgYXR0YWNoZWQgdG8gdGhlIHRyaWdnZXIgZWxlbWVudC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlT3ZlcmxheVRyaWdnZXIgKG92ZXJsYXk6IE92ZXJsYXksIGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPikge1xuXG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhO1xuXG4gICAgICAgIGNvbnN0IGhhc1R5cGVDaGFuZ2VkID0gY29uZmlnLnRyaWdnZXJUeXBlICE9PSBkZWZpbml0aW9uLmNvbmZpZy50cmlnZ2VyVHlwZTtcbiAgICAgICAgY29uc3QgaGFzVHJpZ2dlckNoYW5nZWQgPSBjb25maWcudHJpZ2dlciAhPT0gZGVmaW5pdGlvbi5jb25maWcudHJpZ2dlcjtcblxuICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlT3ZlcmxheVRyaWdnZXIuLi4gdHlwZSBjaGFuZ2VkOiAlcywgdHJpZ2dlciBjaGFuZ2VkOiAlcycsIGhhc1R5cGVDaGFuZ2VkLCBoYXNUcmlnZ2VyQ2hhbmdlZCk7XG5cbiAgICAgICAgaWYgKGhhc1RyaWdnZXJDaGFuZ2VkIHx8IGhhc1R5cGVDaGFuZ2VkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZU92ZXJsYXlUcmlnZ2VyKG92ZXJsYXkpO1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLm92ZXJsYXlUcmlnZ2VyID0gdGhpcy5jcmVhdGVPdmVybGF5VHJpZ2dlcihvdmVybGF5LCBjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZU92ZXJsYXlUcmlnZ2VyIChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pOiBPdmVybGF5VHJpZ2dlciB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgaWYgKGNvbmZpZy50cmlnZ2VyICYmIGNvbmZpZy50cmlnZ2VyVHlwZSkge1xuXG4gICAgICAgICAgICAvLyBjb25zdCBvdmVybGF5VHJpZ2dlciA9IHRoaXMub3ZlcmxheVRyaWdnZXJGYWN0b3J5LmNyZWF0ZU92ZXJsYXlUcmlnZ2VyKGNvbmZpZy50cmlnZ2VyVHlwZSwgb3ZlcmxheSk7XG4gICAgICAgICAgICBjb25zdCBvdmVybGF5VHJpZ2dlciA9IG5ldyBPdmVybGF5Q29udHJvbGxlcihvdmVybGF5LCBjb25maWcpO1xuXG4gICAgICAgICAgICBvdmVybGF5VHJpZ2dlci5hdHRhY2goZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb25maWcudHJpZ2dlcikgYXMgSFRNTEVsZW1lbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gb3ZlcmxheVRyaWdnZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGlzcG9zZU92ZXJsYXlUcmlnZ2VyIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24ub3ZlcmxheVRyaWdnZXIpIHtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5vdmVybGF5VHJpZ2dlci5kZXRhY2goKTtcblxuICAgICAgICAgICAgZGVmaW5pdGlvbi5vdmVybGF5VHJpZ2dlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVGb2N1c1RyYXAgKCkgeyB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlRm9jdXNUcmFwIChvdmVybGF5OiBPdmVybGF5LCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pOiBGb2N1c1RyYXAgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmIChjb25maWcudHJhcEZvY3VzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGZvY3VzVHJhcENvbmZpZyA9IFsnYXV0b0ZvY3VzJywgJ2luaXRpYWxGb2N1cycsICdyZXN0b3JlRm9jdXMnLCAnd3JhcEZvY3VzJ10ucmVkdWNlKFxuICAgICAgICAgICAgICAgIChwcmV2aW91cywgY3VycmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdbY3VycmVudCBhcyBrZXlvZiBGb2N1c1RyYXBDb25maWddICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNbY3VycmVudCBhcyBrZXlvZiBGb2N1c1RyYXBDb25maWddID0gY29uZmlnW2N1cnJlbnQgYXMga2V5b2YgRm9jdXNUcmFwQ29uZmlnXSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7fSBhcyBQYXJ0aWFsPEZvY3VzVHJhcENvbmZpZz5cbiAgICAgICAgICAgIClcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGb2N1c1RyYXAoZm9jdXNUcmFwQ29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwb3NlRm9jdXNUcmFwIChvdmVybGF5OiBPdmVybGF5KSB7XG5cbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMucmVnaXN0ZXJlZE92ZXJsYXlzLmdldChvdmVybGF5KSE7XG5cbiAgICAgICAgaWYgKGRlZmluaXRpb24uZm9jdXNUcmFwKSB7XG5cbiAgICAgICAgICAgIGRlZmluaXRpb24uZm9jdXNUcmFwLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBkZWZpbml0aW9uLmZvY3VzVHJhcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBvdmVybGF5IHRvIHRoZSB7QGxpbmsgT3ZlcmxheVNlcnZpY2V9J3Mgcm9vdCBlbGVtZW50XG4gICAgICpcbiAgICAgKiBBbGwgb3ZlcmxheXMgYXJlIGF0dGFjaGVkIHRvIHRoZSByb290IGVsZW1lbnQgaW4gb3JkZXIsIGFmdGVyIHRoZSB7QGxpbmsgT3ZlcmxheUJhY2tkcm9wfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvdmVybGF5IC0gVGhlIG92ZXJsYXkgaW5zdGFuY2UgdG8gYXR0YWNoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGF0dGFjaE92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBpZiAob3ZlcmxheS5wYXJlbnRFbGVtZW50ID09PSB0aGlzLnJvb3QpIHJldHVybjtcblxuICAgICAgICBsZXQgbGFzdE92ZXJsYXk6IEhUTUxFbGVtZW50ID0gdGhpcy5iYWNrZHJvcDtcblxuICAgICAgICB3aGlsZSAobGFzdE92ZXJsYXkubmV4dFNpYmxpbmcgJiYgbGFzdE92ZXJsYXkubmV4dFNpYmxpbmcgaW5zdGFuY2VvZiBPdmVybGF5KSB7XG5cbiAgICAgICAgICAgIGxhc3RPdmVybGF5ID0gbGFzdE92ZXJsYXkubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpbnNlcnRBZnRlcihvdmVybGF5LCBsYXN0T3ZlcmxheSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlbmRlck92ZXJsYXkgKG92ZXJsYXk6IE92ZXJsYXkpIHtcblxuICAgICAgICBpZiAodGhpcy5oYXNPdmVybGF5KG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHVzZSB0ZW1wbGF0ZSBhbmQgY29udGV4dCBmcm9tIGRlZmluaXRpb24uY29uZmlnXG4gICAgICAgICAgICBjb25zdCB7IHRlbXBsYXRlLCBjb250ZXh0IH0gPSB0aGlzLnJlZ2lzdGVyZWRPdmVybGF5cy5nZXQob3ZlcmxheSkhLmNvbmZpZztcblxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBjb250ZXh0IGlzIGFsd2F5cyBhdmFpbGFibGUsIG90aGVyd2lzZSB1c2Ugb3ZlcmxheSBhcyBmYWxsYmFjay1jb250ZXh0XG4gICAgICAgICAgICAgICAgcmVuZGVyKHRlbXBsYXRlKGNvbnRleHQgfHwgb3ZlcmxheSksIG92ZXJsYXksIHsgZXZlbnRDb250ZXh0OiBjb250ZXh0IHx8IG92ZXJsYXkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlT3BlbkNoYW5nZSAob3ZlcmxheTogT3ZlcmxheSwgZXZlbnQ6IFByb3BlcnR5Q2hhbmdlRXZlbnQ8Ym9vbGVhbj4pIHtcblxuICAgICAgICBjb25zdCBvcGVuID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQ7XG5cbiAgICAgICAgaWYgKG9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlPcGVuKG92ZXJsYXkpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMub25PdmVybGF5Q2xvc2Uob3ZlcmxheSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRm9jdXNDaGFuZ2UgKG92ZXJsYXk6IE92ZXJsYXksIGV2ZW50OiBGb2N1c0NoYW5nZUV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgaGFzRm9jdXMgPSBldmVudC5kZXRhaWwudHlwZSA9PT0gJ2ZvY3VzaW4nO1xuXG4gICAgICAgIGlmICghaGFzRm9jdXMpIHtcblxuICAgICAgICAgICAgLy8gd2hlbiBsb29zaW5nIGZvY3VzLCB3ZSB3YWl0IGZvciBwb3RlbnRpYWwgZm9jdXNpbiBldmVudHMgb24gY2hpbGQgb3ZlcmxheXMgYnkgZGVsYXlpbmcgdGhlIGFjdGl2ZSBjaGVjayB3aXRoIGEgcHJvbWlzZVxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIGNoZWNrIGlmIHRoZSBvdmVybGF5IGlzIGFjdGl2ZSBhbmQgaWYgbm90LCB3ZSBjbG9zZSBpdFxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc092ZXJsYXlBY3RpdmUob3ZlcmxheSkpIHRoaXMuY2xvc2VPdmVybGF5KG92ZXJsYXksIGV2ZW50KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9leHRyYWN0UG9zaXRpb25Db25maWcgKG92ZXJsYXlDb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4pOiBQYXJ0aWFsPFBvc2l0aW9uQ29uZmlnPiB7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25Db25maWc6IFBhcnRpYWw8UG9zaXRpb25Db25maWc+ID0ge307XG5cbiAgICAgICAgUE9TSVRJT05fQ09ORklHX0ZJRUxEUy5mb3JFYWNoKGtleSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChvdmVybGF5Q29uZmlnW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Db25maWdba2V5XSA9IG92ZXJsYXlDb25maWdba2V5XSBhcyBhbnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbkNvbmZpZztcbiAgICB9XG5cbiAgICBwcml2YXRlIF90aHJvd1VucmVnaXNlcmVkT3ZlcmxheSAob3ZlcmxheTogT3ZlcmxheSkge1xuXG4gICAgICAgIGlmICghdGhpcy5oYXNPdmVybGF5KG92ZXJsYXkpKSB7XG5cbiAgICAgICAgICAgIHRocm93IE9WRVJMQVlfVU5SRUdJU1RFUkVEX0VSUk9SKG92ZXJsYXkuY29uc3RydWN0b3IgYXMgdHlwZW9mIE92ZXJsYXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENoYW5nZXMsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSAnLi4vdGVtcGxhdGUtZnVuY3Rpb24nO1xuaW1wb3J0IHsgREVGQVVMVF9GT0NVU19UUkFQX0NPTkZJRyB9IGZyb20gJy4vZm9jdXMtdHJhcCc7XG5pbXBvcnQgeyBPdmVybGF5Q29uZmlnLCBPVkVSTEFZX0NPTkZJR19GSUVMRFMgfSBmcm9tICcuL292ZXJsYXktY29uZmlnJztcbmltcG9ydCB7IE92ZXJsYXlTZXJ2aWNlIH0gZnJvbSAnLi9vdmVybGF5LXNlcnZpY2UnO1xuXG5sZXQgT1ZFUkxBWV9DT1VOVEVSID0gMDtcblxuZnVuY3Rpb24gbmV4dE92ZXJsYXlJZCAoKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBgcGFydGtpdC1vdmVybGF5LSR7IE9WRVJMQVlfQ09VTlRFUisrIH1gO1xufVxuXG5AY29tcG9uZW50PE92ZXJsYXk+KHtcbiAgICBzZWxlY3RvcjogJ3VpLW92ZXJsYXknLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIGJvcmRlcjogMnB4IHNvbGlkICNiZmJmYmY7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtaGlkZGVuPXRydWVdKSB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICAgIHdpbGwtY2hhbmdlOiBhdXRvO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGBcbiAgICA8c2xvdD48L3Nsb3Q+XG4gICAgYCxcbn0pXG5leHBvcnQgY2xhc3MgT3ZlcmxheSBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvLyBUT0RPOiBjbGVhbiB0aGlzIHVwXG4gICAgcHJpdmF0ZSBfY29uZmlnOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+ID0geyAuLi5ERUZBVUxUX0ZPQ1VTX1RSQVBfQ09ORklHLCB0cmFwRm9jdXM6IHRydWUgfTtcblxuICAgIHByb3RlY3RlZCBpc1JlZ2lzdGVyZWQgPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBvdmVybGF5U2VydmljZSA9IG5ldyBPdmVybGF5U2VydmljZSgpO1xuXG4gICAgQHByb3BlcnR5PE92ZXJsYXk+KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6ICdyZWZsZWN0T3BlbidcbiAgICB9KVxuICAgIG9wZW4gPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyTnVtYmVyXG4gICAgfSlcbiAgICB0YWJpbmRleCA9IC0xO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVGdW5jdGlvbiB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnRleHQ6IENvbXBvbmVudCB8IHVuZGVmaW5lZDtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgdHJpZ2dlciE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgdHJpZ2dlclR5cGUgPSAnZGVmYXVsdCc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHBvc2l0aW9uVHlwZSA9ICdkZWZhdWx0JztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgb3JpZ2luID0gJ3ZpZXdwb3J0JztcblxuICAgIHNldCBjb25maWcgKGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPikge1xuXG4gICAgICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4udGhpcy5fY29uZmlnLCAuLi5jb25maWcgfTtcbiAgICB9XG5cbiAgICBnZXQgY29uZmlnICgpOiBQYXJ0aWFsPE92ZXJsYXlDb25maWc+IHtcblxuICAgICAgICBjb25zdCBjb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7IC4uLnRoaXMuX2NvbmZpZyB9O1xuXG4gICAgICAgIE9WRVJMQVlfQ09ORklHX0ZJRUxEUy5mb3JFYWNoKGtleSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzW2tleSBhcyBrZXlvZiBPdmVybGF5XSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICBjb25maWdba2V5XSA9IHRoaXNba2V5IGFzIGtleW9mIE92ZXJsYXldIGFzIGFueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlTZXJ2aWNlLmhhc092ZXJsYXkodGhpcykpIHtcblxuICAgICAgICAgICAgdGhpcy5pc1JlZ2lzdGVyZWQgPSB0aGlzLm92ZXJsYXlTZXJ2aWNlLnJlZ2lzdGVyT3ZlcmxheSh0aGlzLCB0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IG5leHRPdmVybGF5SWQoKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnZGlhbG9nJztcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICAvLyB3ZSByZW1vdmUgdGhlIG92ZXJsYXkgZnJvbSB0aGUgb3ZlcmxheSBzZXJ2aWNlIHdoZW4gdGhlIG92ZXJsYXkgZ2V0cyBkaXNjb25uZWN0ZWRcbiAgICAgICAgLy8gaG93ZXZlciwgZHVyaW5nIHJlZ2lzdHJhdGlvbiwgdGhlIG92ZXJsYXkgd2lsbCBiZSBtb3ZlZCB0byB0aGUgZG9jdW1lbnQgYm9keSwgd2hpY2hcbiAgICAgICAgLy8gZXNzZW50aWFsbHkgcmVtb3ZlcyBhbmQgcmVhdHRhY2hlcyB0aGUgb3ZlcmxheTsgZHVyaW5nIHRoaXMgdGltZSB0aGUgb3ZlcmxheSB3b24ndFxuICAgICAgICAvLyBiZSByZWdpc3RlcmVkIHlldCBhbmQgd2UgZG9uJ3QgcmVtb3ZlIHRoZSBvdmVybGF5IGZyb20gdGhlIG92ZXJsYXkgc2VydmljZVxuICAgICAgICBpZiAodGhpcy5pc1JlZ2lzdGVyZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5U2VydmljZS5kZXN0cm95T3ZlcmxheSh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPdmVybGF5Q29uZmlnPiA9IHt9O1xuXG4gICAgICAgIE9WRVJMQVlfQ09ORklHX0ZJRUxEUy5mb3JFYWNoKGtleSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLmhhcyhrZXkpKSBjb25maWdba2V5XSA9ICh0aGlzIGFzIGFueSlba2V5XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKGNvbmZpZykubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiB3aGVuIG92ZXJsYXkgZ2V0cyBjcmVhdGVkIHZpYSBvdmVybGF5IHNlcnZpY2UsIHRoZSBjb25maWcgZnJvbSBvdXRzaWRlIHNob3VsZCBvdmVycmlkZSBvdmVybGF5J3MgZGVmYXVsdHNcbiAgICAgICAgICAgIC8vIHRoaXMub3ZlcmxheVNlcnZpY2UudXBkYXRlT3ZlcmxheUNvbmZpZyh0aGlzLCBjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFzRm9jdXMgKCkge1xuXG4gICAgICAgIC8vIFRPRE86IHNob3VsZCBxdWVyeSBvdmVybGF5IHNlcnZpY2UgdG8gY2hlY2sgZm9yIGRlc2NlbmRhbnRzIHdpdGggZm9jdXNcbiAgICB9XG5cbiAgICBzaG93ICgpIHtcblxuICAgICAgICBpZiAoIXRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMub3BlbiA9IHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGlkZSAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMub3BlbiA9IGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wZW4pIHtcblxuICAgICAgICAgICAgdGhpcy5zaG93KCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWZsZWN0T3BlbiAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnb3BlbicsICcnKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdvcGVuJyk7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgJy4vb3ZlcmxheS9vdmVybGF5JztcbmltcG9ydCB7IE92ZXJsYXkgfSBmcm9tICcuL292ZXJsYXkvb3ZlcmxheSc7XG5pbXBvcnQgeyBPdmVybGF5Q29uZmlnIH0gZnJvbSAnLi9vdmVybGF5L292ZXJsYXktY29uZmlnJztcbmltcG9ydCB7IE92ZXJsYXlTZXJ2aWNlIH0gZnJvbSAnLi9vdmVybGF5L292ZXJsYXktc2VydmljZSc7XG5cbmNvbnN0IGN1c3RvbU92ZXJsYXlDb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7XG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ3N0YXJ0JyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnc3RhcnQnLFxuICAgICAgICB9LFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6ICdzdGFydCcsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ2VuZCcsXG4gICAgICAgIH0sXG4gICAgICAgIG9mZnNldDoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuY29uc3QgdG9vbHRpcE92ZXJsYXlDb25maWc6IFBhcnRpYWw8T3ZlcmxheUNvbmZpZz4gPSB7XG4gICAgYmFja2Ryb3A6IGZhbHNlLFxuICAgIHRyYXBGb2N1czogZmFsc2UsXG4gICAgYWxpZ25tZW50OiB7XG4gICAgICAgIG9yaWdpbjoge1xuICAgICAgICAgICAgaG9yaXpvbnRhbDogJ2NlbnRlcicsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogJ3N0YXJ0JyxcbiAgICAgICAgfSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHZlcnRpY2FsOiAnZW5kJyxcbiAgICAgICAgfSxcbiAgICAgICAgb2Zmc2V0OiB7XG4gICAgICAgICAgICBob3Jpem9udGFsOiAwLFxuICAgICAgICAgICAgdmVydGljYWw6IDEwLFxuICAgICAgICB9XG4gICAgfVxufTtcblxuQGNvbXBvbmVudDxPdmVybGF5RGVtb0NvbXBvbmVudD4oe1xuICAgIHNlbGVjdG9yOiAnb3ZlcmxheS1kZW1vJyxcbiAgICBzaGFkb3c6IGZhbHNlLFxuICAgIHRlbXBsYXRlOiAoZWxlbWVudCkgPT4gaHRtbGBcbiAgICA8YnV0dG9uIGlkPVwib3ZlcmxheVwiPlNob3cgT3ZlcmxheTwvYnV0dG9uPlxuXG4gICAgPHVpLW92ZXJsYXkgdHJpZ2dlcj1cIiNvdmVybGF5XCIgcG9zaXRpb24tdHlwZT1cImNvbm5lY3RlZFwiIG9yaWdpbj1cIiNvdmVybGF5XCIgLmNvbmZpZz0keyBjdXN0b21PdmVybGF5Q29uZmlnIH0+XG4gICAgICAgIDxoMz5PdmVybGF5PC9oMz5cbiAgICAgICAgPHA+VGhpcyBpcyB0aGUgY29udGVudCBvZiB0aGUgb3ZlcmxheTogJHsgZWxlbWVudC5jb3VudGVyIH08L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgVGhpcyBpcyBhbiBpbnB1dDogPGlucHV0IHR5cGU9XCJ0ZXh0XCIvPlxuICAgICAgICA8L3A+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgVGhpcyBidXR0b24gb3BlbnMgYW5vdGhlciBvdmVybGF5OlxuXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiYW5vdGhlci1vdmVybGF5XCI+QW5vdGhlciBPdmVybGF5PC9idXR0b24+XG4gICAgICAgIDwvcD5cbiAgICA8L3VpLW92ZXJsYXk+XG5cbiAgICA8dWktb3ZlcmxheSB0cmlnZ2VyPVwiI2Fub3RoZXItb3ZlcmxheVwiIHBvc2l0aW9uLXR5cGU9XCJjb25uZWN0ZWRcIiBvcmlnaW49XCIjYW5vdGhlci1vdmVybGF5XCI+XG4gICAgICAgIDxoMz5Bbm90aGVyIE92ZXJsYXk8L2gzPlxuICAgICAgICA8cD5KdXN0IHNvbWUgc3RhdGljIGNvbnRlbnQuLi48L3A+XG4gICAgPC91aS1vdmVybGF5PlxuXG4gICAgPGJ1dHRvbiBpZD1cIm92ZXJsYXktcHJvZ3JhbW1hdGljXCIgQGNsaWNrPSR7IGVsZW1lbnQuc2hvd092ZXJsYXkgfT5TaG93IHByb2dyYW1tYXRpYyBvdmVybGF5PC9idXR0b24+XG5cbiAgICA8cD5XZSBoYXZlIDxhIGhyZWY9XCIjXCIgaWQ9XCJ0b29sdGlwXCI+dG9vbHRpcHM8L2E+IHRvby4uLjwvcD5cblxuICAgIDx1aS1vdmVybGF5IHRyaWdnZXI9XCIjdG9vbHRpcFwiIHRyaWdnZXItdHlwZT1cInRvb2x0aXBcIiBwb3NpdGlvbi10eXBlPVwiY29ubmVjdGVkXCIgb3JpZ2luPVwiI3Rvb2x0aXBcIiAuY29uZmlnPSR7IHRvb2x0aXBPdmVybGF5Q29uZmlnIH0+XG4gICAgICAgIDxwPkkgYW0gdGhlIHRvb2x0aXAgY29udGVudC48L3A+XG4gICAgPC91aS1vdmVybGF5PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgT3ZlcmxheURlbW9Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIG92ZXJsYXlTZXJ2aWNlID0gbmV3IE92ZXJsYXlTZXJ2aWNlKCk7XG5cbiAgICBwcm90ZWN0ZWQgb3ZlcmxheT86IE92ZXJsYXk7XG5cbiAgICBwcm90ZWN0ZWQgdGltZW91dCE6IG51bWJlcjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIGNvdW50ZXIgPSAwO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5jb3VudCgpO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH1cblxuICAgIGNvbmZpcm0gKCkge1xuXG4gICAgICAgIGFsZXJ0KGBZb3UgY29uZmlybWVkIGF0ICR7IHRoaXMuY291bnRlciB9LmApO1xuICAgIH1cblxuICAgIGNhbmNlbCAoKSB7XG5cbiAgICAgICAgYWxlcnQoYFlvdSBjYW5jZWxsZWQgYXQgJHsgdGhpcy5jb3VudGVyIH0uYCk7XG4gICAgfVxuXG4gICAgc2hvd092ZXJsYXkgKGV2ZW50OiBFdmVudCkge1xuXG4gICAgICAgIGlmICghdGhpcy5vdmVybGF5KSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHRlbXBsYXRlIGZ1bmN0aW9uIGluIHRoZSBhcHAgY29tcG9uZW50J3MgY29udGV4dFxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSAoKSA9PiBodG1sYFxuICAgICAgICAgICAgICAgIDxoMz5Qcm9ncmFtbWF0aWMgT3ZlcmxheTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+VGhpcyBpcyB0aGUgY29udGVudCBvZiB0aGUgcG9wb3ZlcjogJHsgdGhpcy5jb3VudGVyIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+PGJ1dHRvbiBAY2xpY2s9JHsgdGhpcy5jbG9zZU92ZXJsYXkgfT5Hb3QgaXQ8L2J1dHRvbj48L3A+XG4gICAgICAgICAgICBgO1xuXG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VyID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgICAgICAvLyBwYXNzIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiBhbmQgYSByZWZlcmVuY2UgdG8gdGhlIHRlbXBsYXRlJ3MgY29udGV4dCAodGhlIGFwcCBjb21wb25lbnQpXG4gICAgICAgICAgICAvLyB0byB0aGUgb3ZlcmxheSBzZXJ2aWNlXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlTZXJ2aWNlLmNyZWF0ZU92ZXJsYXkoeyBwb3NpdGlvblR5cGU6ICdjZW50ZXJlZCcsIHRlbXBsYXRlOiB0ZW1wbGF0ZSwgY29udGV4dDogdGhpcyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3ZlcmxheVNlcnZpY2Uub3Blbk92ZXJsYXkodGhpcy5vdmVybGF5KTtcbiAgICB9XG5cbiAgICBjbG9zZU92ZXJsYXkgKCkge1xuXG4gICAgICAgIC8vIGlmICh0aGlzLm92ZXJsYXkpIHRoaXMub3ZlcmxheVNlcnZpY2UuY2xvc2VPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheSkge1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlTZXJ2aWNlLmRlc3Ryb3lPdmVybGF5KHRoaXMub3ZlcmxheSk7XG5cbiAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb3VudCAoKSB7XG5cbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY291bnRlcisrO1xuXG4gICAgICAgICAgICB0aGlzLmNvdW50KCk7XG5cbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN0b3AgKCkge1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJBUklBQm9vbGVhbixcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsXG4gICAgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIENoYW5nZXMsIENvbXBvbmVudCxcbiAgICBjb21wb25lbnQsXG4gICAgY3NzLFxuICAgIGxpc3RlbmVyLFxuICAgIHByb3BlcnR5XG59IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgVGFiUGFuZWwgfSBmcm9tICcuL3RhYi1wYW5lbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdztcbiAgICAgICAgcGFkZGluZzogMC41cmVtIDAuNXJlbTtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMpIHZhcigtLWJvcmRlci1yYWRpdXMpIDAgMDtcbiAgICAgICAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1zZWxlY3RlZD10cnVlXSk6YWZ0ZXIge1xuICAgICAgICBjb250ZW50OiAnJztcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgYm90dG9tOiBjYWxjKC0xICogdmFyKC0tYm9yZGVyLXdpZHRoKSk7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tYm9yZGVyLXdpZHRoKSArIDAuNXJlbSk7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWIgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJpdmF0ZSBfcGFuZWw6IFRhYlBhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIF9zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtY29udHJvbHMnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICB9KVxuICAgIGNvbnRyb2xzITogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogV2UgcHJvdmlkZSBvdXIgb3duIHRhYmluZGV4IHByb3BlcnR5LCBzbyB3ZSBjYW4gc2V0IGl0IHRvIGBudWxsYFxuICAgICAqIHRvIHJlbW92ZSB0aGUgdGFiaW5kZXgtYXR0cmlidXRlLlxuICAgICAqL1xuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ3RhYmluZGV4JyxcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtc2VsZWN0ZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBnZXQgc2VsZWN0ZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAodmFsdWUgPyAwIDogLTEpO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZGlzYWJsZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHZhbHVlID8gbnVsbCA6ICh0aGlzLnNlbGVjdGVkID8gMCA6IC0xKTtcbiAgICB9XG5cbiAgICBnZXQgcGFuZWwgKCk6IFRhYlBhbmVsIHwgbnVsbCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuXG4gICAgICAgICAgICB0aGlzLl9wYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udHJvbHMpIGFzIFRhYlBhbmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWInXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6IC0xO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbGxiYWNrIChjaGFuZ2VzOiBDaGFuZ2VzLCBmaXJzdFVwZGF0ZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChmaXJzdFVwZGF0ZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYW5lbCkgdGhpcy5wYW5lbC5sYWJlbGxlZEJ5ID0gdGhpcy5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBkZXNlbGVjdCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuc2VsZWN0ZWQgPSBmYWxzZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGNzcywgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBBcnJvd0Rvd24gfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCB7IEFjdGl2ZUl0ZW1DaGFuZ2UsIEZvY3VzS2V5TWFuYWdlciB9IGZyb20gJy4uL2xpc3Qta2V5LW1hbmFnZXInO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAnLi90YWInO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRhYi1saXN0JyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWZsb3c6IHJvdyBub3dyYXA7XG4gICAgfVxuICAgIDo6c2xvdHRlZCh1aS10YWIpIHtcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjI1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGA8c2xvdD48L3Nsb3Q+YFxufSlcbmV4cG9ydCBjbGFzcyBUYWJMaXN0IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBmb2N1c01hbmFnZXIhOiBGb2N1c0tleU1hbmFnZXI8VGFiPjtcblxuICAgIHByb3RlY3RlZCBzZWxlY3RlZFRhYiE6IFRhYjtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJsaXN0JztcblxuICAgICAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcywgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFRhYi5zZWxlY3RvciksICdob3Jpem9udGFsJyk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGNvbnN0IHNsb3QgPSB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3Rvcignc2xvdCcpIGFzIEhUTUxTbG90RWxlbWVudDtcblxuICAgICAgICAgICAgLy8gc2xvdC5hZGRFdmVudExpc3RlbmVyKCdzbG90Y2hhbmdlJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coYCR7c2xvdC5uYW1lfSBjaGFuZ2VkLi4uYCwgc2xvdC5hc3NpZ25lZE5vZGVzKCkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGFiID0gdGhpcy5xdWVyeVNlbGVjdG9yKGAkeyBUYWIuc2VsZWN0b3IgfVthcmlhLXNlbGVjdGVkPXRydWVdYCkgYXMgVGFiO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRhYlxuICAgICAgICAgICAgICAgID8gdGhpcy5mb2N1c01hbmFnZXIuc2V0QWN0aXZlSXRlbShzZWxlY3RlZFRhYilcbiAgICAgICAgICAgICAgICA6IHRoaXMuZm9jdXNNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuXG4gICAgICAgICAgICAvLyBzZXR0aW5nIHRoZSBhY3RpdmUgaXRlbSB2aWEgdGhlIGZvY3VzIG1hbmFnZXIncyBBUEkgd2lsbCBub3QgdHJpZ2dlciBhbiBldmVudFxuICAgICAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBtYW51YWxseSBzZWxlY3QgdGhlIGluaXRpYWxseSBhY3RpdmUgdGFiXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuc2VsZWN0VGFiKHRoaXMuZm9jdXNNYW5hZ2VyLmdldEFjdGl2ZUl0ZW0oKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHsgZXZlbnQ6ICdrZXlkb3duJyB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlEb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG5cbiAgICAgICAgICAgIGNhc2UgQXJyb3dEb3duOlxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSB0aGlzLmZvY3VzTWFuYWdlci5nZXRBY3RpdmVJdGVtKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkVGFiICYmIHNlbGVjdGVkVGFiLnBhbmVsKSBzZWxlY3RlZFRhYi5wYW5lbC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyPFRhYkxpc3Q+KHtcbiAgICAgICAgZXZlbnQ6ICdhY3RpdmUtaXRlbS1jaGFuZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZm9jdXNNYW5hZ2VyOyB9XG4gICAgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlQWN0aXZlVGFiQ2hhbmdlIChldmVudDogQWN0aXZlSXRlbUNoYW5nZTxUYWI+KSB7XG5cbiAgICAgICAgY29uc3QgcHJldmlvdXNUYWIgPSBldmVudC5kZXRhaWwucHJldmlvdXMuaXRlbTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSBldmVudC5kZXRhaWwuY3VycmVudC5pdGVtO1xuXG4gICAgICAgIGlmIChwcmV2aW91c1RhYiAhPT0gc2VsZWN0ZWRUYWIpIHtcblxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFRhYihwcmV2aW91c1RhYik7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdFRhYihzZWxlY3RlZFRhYik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5zZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRlc2VsZWN0VGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICBpZiAodGFiKSB7XG5cbiAgICAgICAgICAgIHRhYi5kZXNlbGVjdCgpO1xuXG4gICAgICAgICAgICBpZiAodGFiLnBhbmVsKSB0YWIucGFuZWwuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsIENvbXBvbmVudCwgY29tcG9uZW50LCBjc3MsIHByb3BlcnR5IH0gZnJvbSAnQHBhcnRraXQvY29tcG9uZW50JztcbmltcG9ydCB7IGh0bWwgfSBmcm9tICdsaXQtaHRtbCc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDAgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cyk7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1oaWRkZW4nLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtbGFiZWxsZWRieScsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgbGFiZWxsZWRCeSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJwYW5lbCdcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQVJJQUJvb2xlYW4sIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZywgQ29tcG9uZW50LCBjb21wb25lbnQsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJ0BwYXJ0a2l0L2NvbXBvbmVudCc7XG5pbXBvcnQgeyBodG1sIH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxUb2dnbGU+KHtcbiAgICBzZWxlY3RvcjogJ3VpLXRvZ2dsZScsXG4gICAgdGVtcGxhdGU6IHRvZ2dsZSA9PiBodG1sYFxuICAgIDxzdHlsZT5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgICAgLS10aW1pbmctY3ViaWM6IGN1YmljLWJlemllcigwLjU1LCAwLjA2LCAwLjY4LCAwLjE5KTtcbiAgICAgICAgICAgIC0tdGltaW5nLXNpbmU6IGN1YmljLWJlemllcigwLjQ3LCAwLCAwLjc1LCAwLjcyKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi10aW1pbmc6IHZhcigtLXRpbWluZy1zaW5lKTtcbiAgICAgICAgICAgIC0tdHJhbnNpdGlvbi1kdXJhdGlvbjogLjFzO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCh2YXIoLS1mb250LXNpemUpLCAxZnIpKTtcblxuICAgICAgICAgICAgbWluLXdpZHRoOiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKiAyICsgdmFyKC0tYm9yZGVyLXdpZHRoKSAqIDIpO1xuICAgICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWZvbnQtc2l6ZSkgKyB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSAqIDIpO1xuICAgICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICAgICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWZvbnQtc2l6ZSwgMXJlbSk7XG5cbiAgICAgICAgICAgIC8qIHRyYW5zaXRpb24tcHJvcGVydHk6IGJhY2tncm91bmQtY29sb3IsIGJvcmRlci1jb2xvcjtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tZHVyYXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pO1xuICAgICAgICAgICAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTsgKi9cbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPXRydWVdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2xhYmVsLW9uXVtsYWJlbC1vZmZdKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgICAgICB9XG4gICAgICAgIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgaGVpZ2h0OiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgd2lkdGg6IHZhcigtLWZvbnQtc2l6ZSk7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICB3aWR0aDogNTAlO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAwO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXVtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogY2FsYyh2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKSAtIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pKTtcbiAgICAgICAgfVxuICAgICAgICAubGFiZWwge1xuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgcGFkZGluZzogMCAuMjVyZW07XG4gICAgICAgICAgICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAganVzdGlmeS1zZWxmOiBzdHJldGNoO1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1kdXJhdGlvbikgdmFyKC0tdHJhbnNpdGlvbi10aW1pbmcpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSAubGFiZWwtb24ge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJmYWxzZVwiXSkgLmxhYmVsLW9mZiB7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgIH1cblxuICAgIDwvc3R5bGU+XG4gICAgPHNwYW4gY2xhc3M9XCJ0b2dnbGUtdGh1bWJcIj48L3NwYW4+XG4gICAgJHsgdG9nZ2xlLmxhYmVsT24gJiYgdG9nZ2xlLmxhYmVsT2ZmXG4gICAgICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vZmZcIj4keyB0b2dnbGUubGFiZWxPZmYgfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9uXCI+JHsgdG9nZ2xlLmxhYmVsT24gfTwvc3Bhbj5gXG4gICAgICAgICAgICA6ICcnXG4gICAgICAgIH1cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIFRvZ2dsZSBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWNoZWNrZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckFSSUFCb29sZWFuXG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZ1xuICAgIH0pXG4gICAgbGFiZWwgPSAnJztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6IGZhbHNlXG4gICAgfSlcbiAgICBsYWJlbE9uID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPZmYgPSAnJztcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdzd2l0Y2gnO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gMDtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICAvLyB0cmlnZ2VyIHByb3BlcnR5LWNoYW5nZSBldmVudCBmb3IgYGNoZWNrZWRgXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdrZXlkb3duJ1xuICAgIH0pXG4gICAgcHJvdGVjdGVkIGhhbmRlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBFbnRlciB8fCBldmVudC5rZXkgPT09IFNwYWNlKSB7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgIC8vIHByZXZlbnQgc3BhY2Uga2V5IGZyb20gc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQgfSBmcm9tICdAcGFydGtpdC9jb21wb25lbnQnO1xuaW1wb3J0ICcuL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSAnLi9hcHAuc3R5bGVzJztcbmltcG9ydCB7IHRlbXBsYXRlIH0gZnJvbSAnLi9hcHAudGVtcGxhdGUnO1xuaW1wb3J0ICcuL2NhcmQnO1xuaW1wb3J0ICcuL2NoZWNrYm94JztcbmltcG9ydCAnLi9pY29uL2ljb24nO1xuaW1wb3J0ICcuL292ZXJsYXktZGVtbyc7XG5pbXBvcnQgJy4vdGFicy90YWInO1xuaW1wb3J0ICcuL3RhYnMvdGFiLWxpc3QnO1xuaW1wb3J0ICcuL3RhYnMvdGFiLXBhbmVsJztcbmltcG9ydCAnLi90b2dnbGUnO1xuXG5AY29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2RlbW8tYXBwJyxcbiAgICBzaGFkb3c6IGZhbHNlLFxuICAgIHN0eWxlczogW3N0eWxlc10sXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG59KVxuZXhwb3J0IGNsYXNzIEFwcCBleHRlbmRzIENvbXBvbmVudCB7IH1cbiIsImltcG9ydCAnLi9zcmMvYXBwJztcblxuZnVuY3Rpb24gYm9vdHN0cmFwICgpIHtcblxuICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndWktY2hlY2tib3gnKTtcblxuICAgIGlmIChjaGVja2JveCkge1xuXG4gICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoZWNrZWQtY2hhbmdlZCcsIGV2ZW50ID0+IGNvbnNvbGUubG9nKChldmVudCBhcyBDdXN0b21FdmVudCkuZGV0YWlsKSk7XG4gICAgfVxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGJvb3RzdHJhcCk7XG4iXSwibmFtZXMiOlsicHJlcGFyZUNvbnN0cnVjdG9yIiwiVGFiIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsTUFBTSxVQUFVLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUNqQyxJQTZDTyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSztJQUNsQyxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssVUFBVSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDO0lBQ0Y7O0lDOURBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVM7SUFDL0QsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLHlCQUF5QjtJQUNuRCxRQUFRLFNBQVMsQ0FBQztBQUNsQixJQVlBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFdBQVcsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksS0FBSztJQUM3RCxJQUFJLE9BQU8sS0FBSyxLQUFLLEdBQUcsRUFBRTtJQUMxQixR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
