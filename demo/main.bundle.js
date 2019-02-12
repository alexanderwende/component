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
     * Removes nodes, starting from `startNode` (inclusive) to `endNode`
     * (exclusive), from `container`.
     */
    const removeNodes = (container, startNode, endNode = null) => {
        let node = startNode;
        while (node !== endNode) {
            const n = node.nextSibling;
            container.removeChild(node);
            node = n;
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
            let index = -1;
            let partIndex = 0;
            const nodesToRemove = [];
            const _prepareTemplate = (template) => {
                const content = template.content;
                // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
                // null
                const walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
                // Keeps track of the last index associated with a part. We try to delete
                // unnecessary nodes, but we never want to associate two different parts
                // to the same index. They must have a constant node between.
                let lastPartIndex = 0;
                while (walker.nextNode()) {
                    index++;
                    const node = walker.currentNode;
                    if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                        if (node.hasAttributes()) {
                            const attributes = node.attributes;
                            // Per
                            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                            // attributes are not guaranteed to be returned in document order.
                            // In particular, Edge/IE can return them out of order, so we cannot
                            // assume a correspondance between part index and attribute index.
                            let count = 0;
                            for (let i = 0; i < attributes.length; i++) {
                                if (attributes[i].value.indexOf(marker) >= 0) {
                                    count++;
                                }
                            }
                            while (count-- > 0) {
                                // Get the template literal section leading up to the first
                                // expression in this attribute
                                const stringForPart = result.strings[partIndex];
                                // Find the attribute name
                                const name = lastAttributeNameRegex.exec(stringForPart)[2];
                                // Find the corresponding attribute
                                // All bound attributes have had a suffix added in
                                // TemplateResult#getHTML to opt out of special attribute
                                // handling. To look up the attribute value we also need to add
                                // the suffix.
                                const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                                const attributeValue = node.getAttribute(attributeLookupName);
                                const strings = attributeValue.split(markerRegex);
                                this.parts.push({ type: 'attribute', index, name, strings });
                                node.removeAttribute(attributeLookupName);
                                partIndex += strings.length - 1;
                            }
                        }
                        if (node.tagName === 'TEMPLATE') {
                            _prepareTemplate(node);
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
                                parent.insertBefore((strings[i] === '') ? createMarker() :
                                    document.createTextNode(strings[i]), node);
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
                            while ((i = node.data.indexOf(marker, i + 1)) !==
                                -1) {
                                // Comment node has a binding marker inside, make an inactive part
                                // The binding won't work, but subsequent bindings will
                                // TODO (justinfagnani): consider whether it's even worth it to
                                // make bindings in comments work
                                this.parts.push({ type: 'node', index: -1 });
                            }
                        }
                    }
                }
            };
            _prepareTemplate(element);
            // Remove text binding nodes after the walk to not disturb the TreeWalker
            for (const n of nodesToRemove) {
                n.parentNode.removeChild(n);
            }
        }
    }
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
     * https://www.w3.org/TR/html5/syntax.html#attributes-0
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-character
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
    const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

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
            this._parts = [];
            this.template = template;
            this.processor = processor;
            this.options = options;
        }
        update(values) {
            let i = 0;
            for (const part of this._parts) {
                if (part !== undefined) {
                    part.setValue(values[i]);
                }
                i++;
            }
            for (const part of this._parts) {
                if (part !== undefined) {
                    part.commit();
                }
            }
        }
        _clone() {
            // When using the Custom Elements polyfill, clone the node, rather than
            // importing it, to keep the fragment in the template's document. This
            // leaves the fragment inert so custom elements won't upgrade and
            // potentially modify their contents by creating a polyfilled ShadowRoot
            // while we traverse the tree.
            const fragment = isCEPolyfill ?
                this.template.element.content.cloneNode(true) :
                document.importNode(this.template.element.content, true);
            const parts = this.template.parts;
            let partIndex = 0;
            let nodeIndex = 0;
            const _prepareInstance = (fragment) => {
                // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
                // null
                const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
                let node = walker.nextNode();
                // Loop through all the nodes and parts of a template
                while (partIndex < parts.length && node !== null) {
                    const part = parts[partIndex];
                    // Consecutive Parts may have the same node index, in the case of
                    // multiple bound attributes on an element. So each iteration we either
                    // increment the nodeIndex, if we aren't on a node with a part, or the
                    // partIndex if we are. By not incrementing the nodeIndex when we find a
                    // part, we allow for the next part to be associated with the current
                    // node if neccessasry.
                    if (!isTemplatePartActive(part)) {
                        this._parts.push(undefined);
                        partIndex++;
                    }
                    else if (nodeIndex === part.index) {
                        if (part.type === 'node') {
                            const part = this.processor.handleTextExpression(this.options);
                            part.insertAfterNode(node.previousSibling);
                            this._parts.push(part);
                        }
                        else {
                            this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                        }
                        partIndex++;
                    }
                    else {
                        nodeIndex++;
                        if (node.nodeName === 'TEMPLATE') {
                            _prepareInstance(node.content);
                        }
                        node = walker.nextNode();
                    }
                }
            };
            _prepareInstance(fragment);
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
            const endIndex = this.strings.length - 1;
            let html = '';
            for (let i = 0; i < endIndex; i++) {
                const s = this.strings[i];
                // This exec() call does two things:
                // 1) Appends a suffix to the bound attribute name to opt out of special
                // attribute value parsing that IE11 and Edge do, like for style and
                // many SVG attributes. The Template class also appends the same suffix
                // when looking up attributes to create Parts.
                // 2) Adds an unquoted-attribute-safe marker for the first expression in
                // an attribute. Subsequent attribute expressions will use node markers,
                // and this is safe since attributes with multiple expressions are
                // guaranteed to be quoted.
                const match = lastAttributeNameRegex.exec(s);
                if (match) {
                    // We're starting a new bound attribute.
                    // Add the safe attribute suffix, and use unquoted-attribute-safe
                    // marker.
                    html += s.substr(0, match.index) + match[1] + match[2] +
                        boundAttributeSuffix + match[3] + marker;
                }
                else {
                    // We're either in a bound node, or trailing bound attribute.
                    // Either way, nodeMarker is safe to use.
                    html += s + nodeMarker;
                }
            }
            return html + this.strings[endIndex];
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
    /**
     * Sets attribute values for AttributeParts, so that the value is only set once
     * even if there are multiple parts for an attribute.
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
                    if (v != null &&
                        (Array.isArray(v) ||
                            // tslint:disable-next-line:no-any
                            typeof v !== 'string' && v[Symbol.iterator])) {
                        for (const t of v) {
                            text += typeof t === 'string' ? t : String(t);
                        }
                    }
                    else {
                        text += typeof v === 'string' ? v : String(v);
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
    class AttributePart {
        constructor(comitter) {
            this.value = undefined;
            this.committer = comitter;
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
                const directive$$1 = this.value;
                this.value = noChange;
                directive$$1(this);
            }
            if (this.value === noChange) {
                return;
            }
            this.committer.commit();
        }
    }
    class NodePart {
        constructor(options) {
            this.value = undefined;
            this._pendingValue = undefined;
            this.options = options;
        }
        /**
         * Inserts this part into a container.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendInto(container) {
            this.startNode = container.appendChild(createMarker());
            this.endNode = container.appendChild(createMarker());
        }
        /**
         * Inserts this part between `ref` and `ref`'s next sibling. Both `ref` and
         * its next sibling must be static, unchanging nodes such as those that appear
         * in a literal section of a template.
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
            part._insert(this.startNode = createMarker());
            part._insert(this.endNode = createMarker());
        }
        /**
         * Appends this part after `ref`
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterPart(ref) {
            ref._insert(this.startNode = createMarker());
            this.endNode = ref.endNode;
            ref.endNode = this.startNode;
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (isDirective(this._pendingValue)) {
                const directive$$1 = this._pendingValue;
                this._pendingValue = noChange;
                directive$$1(this);
            }
            const value = this._pendingValue;
            if (value === noChange) {
                return;
            }
            if (isPrimitive(value)) {
                if (value !== this.value) {
                    this._commitText(value);
                }
            }
            else if (value instanceof TemplateResult) {
                this._commitTemplateResult(value);
            }
            else if (value instanceof Node) {
                this._commitNode(value);
            }
            else if (Array.isArray(value) ||
                // tslint:disable-next-line:no-any
                value[Symbol.iterator]) {
                this._commitIterable(value);
            }
            else if (value === nothing) {
                this.value = nothing;
                this.clear();
            }
            else {
                // Fallback, will render the string representation
                this._commitText(value);
            }
        }
        _insert(node) {
            this.endNode.parentNode.insertBefore(node, this.endNode);
        }
        _commitNode(value) {
            if (this.value === value) {
                return;
            }
            this.clear();
            this._insert(value);
            this.value = value;
        }
        _commitText(value) {
            const node = this.startNode.nextSibling;
            value = value == null ? '' : value;
            if (node === this.endNode.previousSibling &&
                node.nodeType === 3 /* Node.TEXT_NODE */) {
                // If we only have a single text node between the markers, we can just
                // set its value, rather than replacing it.
                // TODO(justinfagnani): Can we just check if this.value is primitive?
                node.data = value;
            }
            else {
                this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
            }
            this.value = value;
        }
        _commitTemplateResult(value) {
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
                this._commitNode(fragment);
                this.value = instance;
            }
        }
        _commitIterable(value) {
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
            this._pendingValue = undefined;
            if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
                throw new Error('Boolean attributes can only contain a single expression');
            }
            this.element = element;
            this.name = name;
            this.strings = strings;
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (isDirective(this._pendingValue)) {
                const directive$$1 = this._pendingValue;
                this._pendingValue = noChange;
                directive$$1(this);
            }
            if (this._pendingValue === noChange) {
                return;
            }
            const value = !!this._pendingValue;
            if (this.value !== value) {
                if (value) {
                    this.element.setAttribute(this.name, '');
                }
                else {
                    this.element.removeAttribute(this.name);
                }
            }
            this.value = value;
            this._pendingValue = noChange;
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
            this._pendingValue = undefined;
            this.element = element;
            this.eventName = eventName;
            this.eventContext = eventContext;
            this._boundHandleEvent = (e) => this.handleEvent(e);
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (isDirective(this._pendingValue)) {
                const directive$$1 = this._pendingValue;
                this._pendingValue = noChange;
                directive$$1(this);
            }
            if (this._pendingValue === noChange) {
                return;
            }
            const newListener = this._pendingValue;
            const oldListener = this.value;
            const shouldRemoveListener = newListener == null ||
                oldListener != null &&
                    (newListener.capture !== oldListener.capture ||
                        newListener.once !== oldListener.once ||
                        newListener.passive !== oldListener.passive);
            const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
            if (shouldRemoveListener) {
                this.element.removeEventListener(this.eventName, this._boundHandleEvent, this._options);
            }
            if (shouldAddListener) {
                this._options = getOptions(newListener);
                this.element.addEventListener(this.eventName, this._boundHandleEvent, this._options);
            }
            this.value = newListener;
            this._pendingValue = noChange;
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
                const comitter = new PropertyCommitter(element, name.slice(1), strings);
                return comitter.parts;
            }
            if (prefix === '@') {
                return [new EventPart(element, name.slice(1), options.eventContext)];
            }
            if (prefix === '?') {
                return [new BooleanAttributePart(element, name.slice(1), strings)];
            }
            const comitter = new AttributeCommitter(element, name, strings);
            return comitter.parts;
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
     * Renders a template to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result a TemplateResult created by evaluating a template tag like
     *     `html` or `svg`.
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
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.0.0');
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
     * characters. However, for consistencies sake, we apply the same rules for event names as
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
    /**
     * The default {@link CustomElement} property declaration
     */
    const DEFAULT_PROPERTY_DECLARATION = {
        attribute: true,
        converter: AttributeConverterDefault,
        reflectAttribute: true,
        reflectProperty: true,
        notify: true,
        observe: DEFAULT_PROPERTY_CHANGE_DETECTOR,
    };

    const ATTRIBUTE_REFLECTOR_ERROR = (attributeReflector) => new Error(`Error executing attribute reflector ${String(attributeReflector)}.`);
    const PROPERTY_REFLECTOR_ERROR = (propertyReflector) => new Error(`Error executing property reflector ${String(propertyReflector)}.`);
    const PROPERTY_NOTIFIER_ERROR = (propertyNotifier) => new Error(`Error executing property notifier ${String(propertyNotifier)}.`);
    const CHANGE_DETECTOR_ERROR = (changeDetector) => new Error(`Error executing property change detector ${String(changeDetector)}.`);
    /**
     * The custom element base class
     */
    class CustomElement extends HTMLElement {
        constructor() {
            super();
            this._updateRequest = Promise.resolve(true);
            this._changedProperties = new Map();
            this._reflectingProperties = new Map();
            this._notifyingProperties = new Map();
            this._listenerDeclarations = [];
            this._isConnected = false;
            this._hasUpdated = false;
            this._hasRequestedUpdate = false;
            this._isReflecting = false;
            this._renderRoot = this.createRenderRoot();
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
         * When extending custom elements, make sure to return the super class's observedAttributes
         * if you override this getter (except if you don't want to inherit observed attributes):
         *
         * ```typescript
         * @customElement({
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
         * Returns `true` if the custom element's {@link connectedCallback} was executed.
         */
        get isConnected() {
            return this._isConnected;
        }
        /**
         * Invoked each time the custom element is moved to a new document
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         */
        adoptedCallback() {
            this._notifyLifecycle('adopted');
        }
        /**
         * Invoked each time the custom element is appended into a document-connected element
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         */
        connectedCallback() {
            this._isConnected = true;
            this._listen();
            this.requestUpdate();
            this._notifyLifecycle('connected');
        }
        /**
         * Invoked each time the custom element is disconnected from the document's DOM
         *
         * @remarks
         * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
         */
        disconnectedCallback() {
            this._isConnected = false;
            this._unlisten();
            this._notifyLifecycle('disconnected');
        }
        /**
         * Invoked each time one of the custom element's attributes is added, removed, or changed
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
         * @customElement({
         *      selector: 'my-element'
         * })
         * class MyElement extends CustomElement {
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
            if (this._isReflecting)
                return;
            if (oldValue !== newValue)
                this.reflectAttribute(attribute, oldValue, newValue);
        }
        /**
         * Invoked each time the custom element updates
         *
         * @param changedProperties A map of properties that changed in the update, containg the property key and the old value
         * @param firstUpdate       A boolean indicating if this was the first update
         */
        updateCallback(changedProperties, firstUpdate) {
            this._notifyLifecycle('update', { firstUpdate });
        }
        /**
         * Creates the custom element's render root
         *
         * @remarks
         * The render root is where the {@link render} method will attach its DOM output.
         * When using the custom element with shadow mode, it will be a shadow root,
         * otherwise it will be the custom element itself.
         *
         * TODO: Can slots be used without shadow DOM?
         */
        createRenderRoot() {
            return this.constructor.shadow ?
                this.attachShadow({ mode: 'open' }) :
                this;
        }
        /**
         * Returns the template of the custom element
         *
         * @remarks
         * Override this method to provide a template for your custom element. The method must
         * return a {@link lit-html#TemplateResult} which is created using lit-html's
         * {@link lit-html#html | `html`} or {@link lit-html#svg | `svg`} template methods.
         *
         * Return nothing if your component does not need to render a template.
         *
         * ```typescript
         * import { html } from 'lit-html';
         *
         * @customElement({
         *      selector: 'my-element'
         * })
         * class MyElement extends CustomElement {
         *
         *       myProperty = 'Hello';
         *
         *      template () {
         *
         *          html`<h1>${this.myProperty} World!</h1>`;
         *      }
         * }
         * ```
         */
        template() { }
        /**
         * Renders the custom element's template to its {@link _renderRoot}
         *
         * @remarks
         * Uses lit-html's {@link lit-html#render} method to render a {@link lit-html#TemplateResult}.
         */
        render() {
            const template = this.template();
            if (template)
                render(template, this._renderRoot);
        }
        /**
         * Watch property changes occurring in the executor and raise custom events
         *
         * @remarks
         * Property changes should trigger custom events when they are caused by internal state changes,
         * but not if they are caused by a consumer of the custom element API directly, e.g.:
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
                if (!previousChanges.has(propertyKey) || this.hasChanged(propertyKey, previousChanges.get(propertyKey), oldValue)) {
                    this._notifyingProperties.set(propertyKey, oldValue);
                }
            }
        }
        /**
         * Request an update of the custom element
         *
         * @remarks
         * This method is called automatically when the value of a decorated property or its associated
         * attribute changes. If you need the custom element to update based on a state change that is
         * not covered by a decorated property, call this method without any arguments.
         *
         * @param propertyKey   The name of the changed property that requests the update
         * @param oldValue      The old property value
         * @param newValue      the new property value
         * @returns             A Promise which is resolved when the update is completed
         */
        requestUpdate(propertyKey, oldValue, newValue) {
            if (propertyKey) {
                if (!this.hasChanged(propertyKey, oldValue, newValue))
                    return this._updateRequest;
                // store changed property for batch processing
                this._changedProperties.set(propertyKey, oldValue);
                // if we are in reflecting state, an attribute is reflecting to this property and we
                // can skip reflecting the property back to the attribute
                // property changes need to be tracked however and {@link render} must be called after
                // the attribute change is reflected to this property
                // TODO: Maybe don't put it here if not marked as reflected
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
         * Updates the custom element after an update was requested with {@link requestUpdate}
         *
         * @remarks
         * This method renders the template, reflects changed properties to attributes and
         * dispatches change events for properties which are marked for notification.
         */
        update() {
            this.render();
            // reflect all properties marked for reflection
            this._reflectingProperties.forEach((oldValue, propertyKey) => {
                this.reflectProperty(propertyKey, oldValue, this[propertyKey]);
            });
            // notify all properties marked for notification
            this._notifyingProperties.forEach((oldValue, propertyKey) => {
                this.notifyProperty(propertyKey, oldValue, this[propertyKey]);
            });
            this.updateCallback(this._changedProperties, this._hasUpdated);
            this._hasUpdated = true;
        }
        /**
         * Check if a property changed
         *
         * @remarks
         * This method resolves the {@link PropertyChangeDetector} for the property and returns its result.
         * If none is defined (the property declaration's observe option is `false`) it returns false.
         * It catches any error in custom {@link PropertyChangeDetector}s and throws a more helpful one.
         *
         * @param propertyKey   The key of the property to check
         * @param oldValue      The old property value
         * @param newValue      The new property value
         * @returns             `true` if the property changed, `false` otherwise
         */
        hasChanged(propertyKey, oldValue, newValue) {
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);
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
            // TODO: test this
            if (!propertyKey) {
                console.log(`observed attribute "${attributeName}" not found... ignoring...`);
                return;
            }
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);
            // don't reflect if {@link propertyDeclaration.reflectAttribute} is false
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
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);
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
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);
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
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);
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
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);
            // TODO: test what happens if attribute is set to false but reflectProperty is true!
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
         */
        _notifyProperty(propertyKey, oldValue, newValue) {
            const eventName = createEventName(propertyKey, '', 'changed');
            this.dispatchEvent(new CustomEvent(eventName, {
                composed: true,
                detail: {
                    property: propertyKey,
                    previous: oldValue,
                    current: newValue
                }
            }));
        }
        /**
         * Dispatch a lifecycle event
         *
         * @param lifecycle The lifecycle for which to raise the event
         * @param detail    Optional event details
         */
        _notifyLifecycle(lifecycle, detail) {
            const eventName = createEventName(lifecycle, 'on');
            const eventInit = Object.assign({ composed: true }, (detail ? { detail: detail } : {}));
            this.dispatchEvent(new CustomEvent(eventName, eventInit));
        }
        /**
         * Bind custom element listeners.
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
                    target: (declaration.target) ?
                        (typeof declaration.target === 'function') ?
                            declaration.target() :
                            declaration.target :
                        this
                };
                // add the bound event listener to the target
                instanceDeclaration.target.addEventListener(instanceDeclaration.event, instanceDeclaration.listener, instanceDeclaration.options);
                // save the instance listener declaration on the component instance
                this._listenerDeclarations.push(instanceDeclaration);
            });
        }
        /**
         * Unbind custom element listeners.
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
         * Schedule the update of the custom element
         *
         * @remarks
         * Schedules the update of the custom element just before the next frame
         * and cleans up the custom elements state afterwards.
         */
        _scheduleUpdate() {
            return new Promise(resolve => {
                // schedule the update via requestAnimationFrame to avoid multiple redraws per frame
                requestAnimationFrame(() => {
                    this.update();
                    this._changedProperties = new Map();
                    this._reflectingProperties = new Map();
                    this._notifyingProperties = new Map();
                    // mark custom element as updated after the update to prevent infinte loops in the update process
                    // N.B.: any property changes during the update will be ignored
                    this._hasRequestedUpdate = false;
                    resolve();
                });
            });
        }
        /**
         * Enqueue a request for an asynchronous update
         */
        async _enqueueUpdate() {
            let resolve;
            const previousRequest = this._updateRequest;
            // mark the custom element as having requested an update, the {@link _requestUpdate} method
            // will not enqueue a further request for update if one is scheduled
            this._hasRequestedUpdate = true;
            this._updateRequest = new Promise(res => resolve = res);
            // wait for the previous update to resolve
            // `await` is asynchronous and will return execution to the {@link requestUpdate} method
            // and essentially allows us to batch multiple synchronous property changes, before the
            // execution can resume here
            await previousRequest;
            const result = this._scheduleUpdate();
            // the actual update is scheduled asynchronously as well
            await result;
            // resolve the new {@link _updateRequest} after the result of the current update resolves
            resolve(!this._hasRequestedUpdate);
        }
        /**
         * Gets the {@link PropertyDeclaration} for a decorated property
         *
         * @param propertyKey The property key for which to retrieve the declaration
         *
         * @internal
         * @private
         */
        _getPropertyDeclaration(propertyKey) {
            return this.constructor.properties.get(propertyKey);
        }
    }
    /**
     * A map of attribute names and their respective property keys
     *
     * @internal
     * @private
     */
    CustomElement.attributes = new Map();
    /**
     * A map of property keys and their respective property declarations
     *
     * @internal
     * @private
     */
    CustomElement.properties = new Map();
    /**
     * A map of property keys and their respective listener declarations
     *
     * @internal
     * @private
     */
    CustomElement.listeners = new Map();

    const DEFAULT_CUSTOM_ELEMENT_DECLARATION = {
        selector: '',
        shadow: true,
        define: true
    };
    /**
     * Decorates a {@link CustomElement} class
     *
     * @param options A custom element declaration
     */
    const customElement = (options = {}) => {
        const declaration = Object.assign({}, DEFAULT_CUSTOM_ELEMENT_DECLARATION, options);
        return (target) => {
            const constructor = target;
            constructor.selector = declaration.selector || target.selector;
            constructor.shadow = declaration.shadow;
            /**
             * Property decorators get called before class decorators, so at this point all decorated properties
             * have stored their associated attributes in {@link CustomElement.attributes}.
             * We can now combine them with the user-defined {@link CustomElement.observedAttributes} and,
             * by using a Set, eliminate all duplicates in the process.
             *
             * As the user-defined {@link CustomElement.observedAttributes} will also include decorator generated
             * observed attributes, we always inherit all observed attributes from a base class. For that reason
             * we have to keep track of attribute overrides when extending any {@link CustomElement} base class.
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
            // TODO: delete the overridden Set from the constructor
            /**
             * Finally we override the {@link CustomElement.observedAttributes} getter with a new one, which returns
             * the unique set of user defined and decorator generated observed attributes.
             *
             * N.B.: When extending an existing custom element, and oerriding a property with a different associated
             * attribute name, the base class's original attribute name remains in the {@link CustomElement.observedAttributes}
             * array. Changing the old attribute on the extended class will try to reflect the attribute, but won't
             * find the attribute in the extended class's {@link CustomElement.attributes} Map and will therefore be
             * ignored.
             */
            Reflect.defineProperty(constructor, 'observedAttributes', {
                configurable: true,
                enumerable: false,
                get() {
                    return observedAttributes;
                }
            });
            if (declaration.define) {
                window.customElements.define(constructor.selector, constructor);
            }
        };
    };

    /**
     * Decorates a {@link CustomElement} method as an event listener
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
     * Prepares the custom element constructor by initializing static properties for the listener decorator,
     * so we don't modify a base class's static properties.
     *
     * @remarks
     * When the listener decorator stores listener declarations in the constructor, we have to make sure the
     * static listeners field is initialized on the current constructor. Otherwise we add listener declarations
     * to the base class's static field. We also make sure to initialize the listener maps with the values of
     * the base class's map to properly inherit all listener declarations.
     *
     * @param constructor The custom element constructor to prepare
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
     * or a parent prototype - excluding {@link Object.prototype} itself, to
     * ensure correct prototype inheritance.
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
     * Decorates a {@link CustomElement} property
     *
     * @remarks
     * Many of the {@link PropertyDeclaration} options support custom functions, which will be invoked
     * with the custom element instance as `this`-context during execution. In order to support correct
     * typing in these functions, the `@property` decorator supports generic types. Here is an example
     * of how you can use this with a custom {@link PropertyReflector}:
     *
     * ```typescript
     * class MyElement extends CustomElement {
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
    const property = (options = {}) => {
        return (target, propertyKey) => {
            // TODO: We might not have to do this
            // class fields in typescript get initialized in the constructor and the field(/property) itself does not
            // get stored on the class's prototype. only getters and setters are stored on the prototype.
            // as such, when we decorate a property on a class, the property definition itself on the sub-class is
            // most likely intended to oerride the base class's setter/getter and we should not execute the base
            // class's setter/getter in the sub-class anymore. we should only be interested in setters/getters on the
            // sub-class and wrap them
            const descriptor = getPropertyDescriptor(target, propertyKey);
            const hiddenKey = (typeof propertyKey === 'string') ? `_${propertyKey}` : Symbol();
            const get = descriptor && descriptor.get || function () { return this[hiddenKey]; };
            const set = descriptor && descriptor.set || function (value) { this[hiddenKey] = value; };
            Object.defineProperty(target, propertyKey, {
                configurable: true,
                enumerable: true,
                get() {
                    return get.call(this);
                },
                set(value) {
                    const oldValue = this[propertyKey];
                    set.call(this, value);
                    this.requestUpdate(propertyKey, oldValue, value);
                }
            });
            const constructor = target.constructor;
            const declaration = Object.assign({}, DEFAULT_PROPERTY_DECLARATION, options);
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
                // mark attribute as overridden for {@link customElement} decorator
                constructor.overridden.add(attribute);
            }
            if (declaration.attribute) {
                constructor.attributes.set(declaration.attribute, propertyKey);
            }
            // store the property declaration last, so we can still access the inherited declaration
            // when processing the attributes
            constructor.properties.set(propertyKey, declaration);
        };
    };
    /**
     * Prepares the custom element constructor by initializing static properties for the property decorator,
     * so we don't modify a base class's static properties.
     *
     * @remarks
     * When the property decorator stores property declarations and attribute mappings in the constructor,
     * we have to make sure those static fields are initialized on the current constructor. Otherwise we
     * add property declarations and attribute mappings to the base class's static fields. We also make
     * sure to initialize the constructors maps with the values of the base class's maps to properly
     * inherit all property declarations and attributes.
     *
     * @param constructor The custom element constructor to prepare
     *
     * @internal
     * @private
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

    let Checkbox = class Checkbox extends CustomElement {
        constructor() {
            super();
            this.customRole = 'checkbox';
            this.customChecked = false;
        }
        onClick(event) {
            this.watch(() => {
                this.customChecked = !this.customChecked;
            });
            // this.customChecked = !this.customChecked;
            // this.notify('customChecked');
        }
        reflectChecked() {
            if (this.customChecked) {
                this.setAttribute('custom-checked', '');
                this.setAttribute('aria-checked', 'true');
            }
            else {
                this.removeAttribute('custom-checked');
                this.removeAttribute('aria-checked');
            }
        }
        notifyChecked() {
            console.log(`notifyChecked...`);
        }
        template() {
            return html `
            <style>
                :host {
                    display: inline-block;
                    width: 1rem;
                    height: 1rem;
                    border: 1px solid #999;
                }
                :host([custom-checked]) {
                    background-color: #ccc;
                }
            </style>`;
        }
    };
    __decorate([
        property(),
        __metadata("design:type", Object)
    ], Checkbox.prototype, "customRole", void 0);
    __decorate([
        property({
            converter: AttributeConverterBoolean,
            reflectProperty: 'reflectChecked',
            // reflectProperty: function (propertyKey: string, oldValue: any, newValue: any) {
            //     if (this.customChecked) {
            //         this.setAttribute('custom-checked', 'true');
            //         this.setAttribute('aria-checked', 'true');
            //     } else {
            //         this.removeAttribute('custom-checked');
            //         this.removeAttribute('aria-checked');
            //     }
            // },
            // notify: true,
            notify: 'notifyChecked',
        }),
        __metadata("design:type", Object)
    ], Checkbox.prototype, "customChecked", void 0);
    __decorate([
        listener({
            event: 'click'
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], Checkbox.prototype, "onClick", null);
    Checkbox = __decorate([
        customElement({
            selector: 'check-box'
        }),
        __metadata("design:paramtypes", [])
    ], Checkbox);

    function bootstrap() {
        const checkbox = document.querySelector('check-box');
        if (checkbox) {
            checkbox.addEventListener('checked-changed', event => console.log(event.detail));
        }
    }
    window.addEventListener('load', bootstrap);

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy91dGlscy9zdHJpbmctdXRpbHMudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS1kZWNsYXJhdGlvbi50cyIsIi4uL3NyYy9jdXN0b20tZWxlbWVudC50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL2N1c3RvbS1lbGVtZW50LnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvbGlzdGVuZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy91dGlscy9nZXQtcHJvcGVydHktZGVzY3JpcHRvci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3Byb3BlcnR5LnRzIiwic3JjL2NoZWNrYm94LnRzIiwibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5jb25zdCBkaXJlY3RpdmVzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogQnJhbmRzIGEgZnVuY3Rpb24gYXMgYSBkaXJlY3RpdmUgc28gdGhhdCBsaXQtaHRtbCB3aWxsIGNhbGwgdGhlIGZ1bmN0aW9uXG4gKiBkdXJpbmcgdGVtcGxhdGUgcmVuZGVyaW5nLCByYXRoZXIgdGhhbiBwYXNzaW5nIGFzIGEgdmFsdWUuXG4gKlxuICogQHBhcmFtIGYgVGhlIGRpcmVjdGl2ZSBmYWN0b3J5IGZ1bmN0aW9uLiBNdXN0IGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFcbiAqIGZ1bmN0aW9uIG9mIHRoZSBzaWduYXR1cmUgYChwYXJ0OiBQYXJ0KSA9PiB2b2lkYC4gVGhlIHJldHVybmVkIGZ1bmN0aW9uIHdpbGxcbiAqIGJlIGNhbGxlZCB3aXRoIHRoZSBwYXJ0IG9iamVjdFxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge2RpcmVjdGl2ZSwgaHRtbH0gZnJvbSAnbGl0LWh0bWwnO1xuICpcbiAqIGNvbnN0IGltbXV0YWJsZSA9IGRpcmVjdGl2ZSgodikgPT4gKHBhcnQpID0+IHtcbiAqICAgaWYgKHBhcnQudmFsdWUgIT09IHYpIHtcbiAqICAgICBwYXJ0LnNldFZhbHVlKHYpXG4gKiAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbmV4cG9ydCBjb25zdCBkaXJlY3RpdmUgPSAoZikgPT4gKCguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgZCA9IGYoLi4uYXJncyk7XG4gICAgZGlyZWN0aXZlcy5zZXQoZCwgdHJ1ZSk7XG4gICAgcmV0dXJuIGQ7XG59KTtcbmV4cG9ydCBjb25zdCBpc0RpcmVjdGl2ZSA9IChvKSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnZnVuY3Rpb24nICYmIGRpcmVjdGl2ZXMuaGFzKG8pO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcmVjdGl2ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIFRydWUgaWYgdGhlIGN1c3RvbSBlbGVtZW50cyBwb2x5ZmlsbCBpcyBpbiB1c2UuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NFUG9seWZpbGwgPSB3aW5kb3cuY3VzdG9tRWxlbWVudHMgIT09IHVuZGVmaW5lZCAmJlxuICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrICE9PVxuICAgICAgICB1bmRlZmluZWQ7XG4vKipcbiAqIFJlcGFyZW50cyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnROb2RlYCAoaW5jbHVzaXZlKSB0byBgZW5kTm9kZWBcbiAqIChleGNsdXNpdmUpLCBpbnRvIGFub3RoZXIgY29udGFpbmVyIChjb3VsZCBiZSB0aGUgc2FtZSBjb250YWluZXIpLCBiZWZvcmVcbiAqIGBiZWZvcmVOb2RlYC4gSWYgYGJlZm9yZU5vZGVgIGlzIG51bGwsIGl0IGFwcGVuZHMgdGhlIG5vZGVzIHRvIHRoZVxuICogY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgcmVwYXJlbnROb2RlcyA9IChjb250YWluZXIsIHN0YXJ0LCBlbmQgPSBudWxsLCBiZWZvcmUgPSBudWxsKSA9PiB7XG4gICAgbGV0IG5vZGUgPSBzdGFydDtcbiAgICB3aGlsZSAobm9kZSAhPT0gZW5kKSB7XG4gICAgICAgIGNvbnN0IG4gPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5vZGUsIGJlZm9yZSk7XG4gICAgICAgIG5vZGUgPSBuO1xuICAgIH1cbn07XG4vKipcbiAqIFJlbW92ZXMgbm9kZXMsIHN0YXJ0aW5nIGZyb20gYHN0YXJ0Tm9kZWAgKGluY2x1c2l2ZSkgdG8gYGVuZE5vZGVgXG4gKiAoZXhjbHVzaXZlKSwgZnJvbSBgY29udGFpbmVyYC5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZU5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnROb2RlLCBlbmROb2RlID0gbnVsbCkgPT4ge1xuICAgIGxldCBub2RlID0gc3RhcnROb2RlO1xuICAgIHdoaWxlIChub2RlICE9PSBlbmROb2RlKSB7XG4gICAgICAgIGNvbnN0IG4gPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIG5vZGUgPSBuO1xuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kb20uanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE4IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyB0aGF0IGEgdmFsdWUgd2FzIGhhbmRsZWQgYnkgYSBkaXJlY3RpdmUgYW5kXG4gKiBzaG91bGQgbm90IGJlIHdyaXR0ZW4gdG8gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vQ2hhbmdlID0ge307XG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIGEgTm9kZVBhcnQgdG8gZnVsbHkgY2xlYXIgaXRzIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBub3RoaW5nID0ge307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgd2l0aCBlbWJlZGRlZCB1bmlxdWUga2V5IHRvIGF2b2lkIGNvbGxpc2lvbiB3aXRoXG4gKiBwb3NzaWJsZSB0ZXh0IGluIHRlbXBsYXRlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG1hcmtlciA9IGB7e2xpdC0ke1N0cmluZyhNYXRoLnJhbmRvbSgpKS5zbGljZSgyKX19fWA7XG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHVzZWQgdGV4dC1wb3NpdGlvbnMsIG11bHRpLWJpbmRpbmcgYXR0cmlidXRlcywgYW5kXG4gKiBhdHRyaWJ1dGVzIHdpdGggbWFya3VwLWxpa2UgdGV4dCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBub2RlTWFya2VyID0gYDwhLS0ke21hcmtlcn0tLT5gO1xuZXhwb3J0IGNvbnN0IG1hcmtlclJlZ2V4ID0gbmV3IFJlZ0V4cChgJHttYXJrZXJ9fCR7bm9kZU1hcmtlcn1gKTtcbi8qKlxuICogU3VmZml4IGFwcGVuZGVkIHRvIGFsbCBib3VuZCBhdHRyaWJ1dGUgbmFtZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCA9ICckbGl0JCc7XG4vKipcbiAqIEFuIHVwZGF0ZWFibGUgVGVtcGxhdGUgdGhhdCB0cmFja3MgdGhlIGxvY2F0aW9uIG9mIGR5bmFtaWMgcGFydHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBlbGVtZW50KSB7XG4gICAgICAgIHRoaXMucGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBjb25zdCBub2Rlc1RvUmVtb3ZlID0gW107XG4gICAgICAgIGNvbnN0IF9wcmVwYXJlVGVtcGxhdGUgPSAodGVtcGxhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50O1xuICAgICAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZVxuICAgICAgICAgICAgLy8gbnVsbFxuICAgICAgICAgICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihjb250ZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBsYXN0IGluZGV4IGFzc29jaWF0ZWQgd2l0aCBhIHBhcnQuIFdlIHRyeSB0byBkZWxldGVcbiAgICAgICAgICAgIC8vIHVubmVjZXNzYXJ5IG5vZGVzLCBidXQgd2UgbmV2ZXIgd2FudCB0byBhc3NvY2lhdGUgdHdvIGRpZmZlcmVudCBwYXJ0c1xuICAgICAgICAgICAgLy8gdG8gdGhlIHNhbWUgaW5kZXguIFRoZXkgbXVzdCBoYXZlIGEgY29uc3RhbnQgbm9kZSBiZXR3ZWVuLlxuICAgICAgICAgICAgbGV0IGxhc3RQYXJ0SW5kZXggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHdhbGtlci5uZXh0Tm9kZSgpKSB7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gd2Fsa2VyLmN1cnJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxIC8qIE5vZGUuRUxFTUVOVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IG5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05hbWVkTm9kZU1hcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHJldHVybmVkIGluIGRvY3VtZW50IG9yZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW4gcGFydGljdWxhciwgRWRnZS9JRSBjYW4gcmV0dXJuIHRoZW0gb3V0IG9mIG9yZGVyLCBzbyB3ZSBjYW5ub3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc3VtZSBhIGNvcnJlc3BvbmRhbmNlIGJldHdlZW4gcGFydCBpbmRleCBhbmQgYXR0cmlidXRlIGluZGV4LlxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzW2ldLnZhbHVlLmluZGV4T2YobWFya2VyKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIHNlY3Rpb24gbGVhZGluZyB1cCB0byB0aGUgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIGluIHRoaXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nRm9yUGFydCA9IHJlc3VsdC5zdHJpbmdzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHN0cmluZ0ZvclBhcnQpWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxsIGJvdW5kIGF0dHJpYnV0ZXMgaGF2ZSBoYWQgYSBzdWZmaXggYWRkZWQgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUZW1wbGF0ZVJlc3VsdCNnZXRIVE1MIHRvIG9wdCBvdXQgb2Ygc3BlY2lhbCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoYW5kbGluZy4gVG8gbG9vayB1cCB0aGUgYXR0cmlidXRlIHZhbHVlIHdlIGFsc28gbmVlZCB0byBhZGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3VmZml4LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZUxvb2t1cE5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkgKyBib3VuZEF0dHJpYnV0ZVN1ZmZpeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSBhdHRyaWJ1dGVWYWx1ZS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ2F0dHJpYnV0ZScsIGluZGV4LCBuYW1lLCBzdHJpbmdzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZUxvb2t1cE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3ByZXBhcmVUZW1wbGF0ZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAzIC8qIE5vZGUuVEVYVF9OT0RFICovKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBub2RlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmluZGV4T2YobWFya2VyKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gZGF0YS5zcGxpdChtYXJrZXJSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG5ldyB0ZXh0IG5vZGUgZm9yIGVhY2ggbGl0ZXJhbCBzZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSgoc3RyaW5nc1tpXSA9PT0gJycpID8gY3JlYXRlTWFya2VyKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHJpbmdzW2ldKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleDogKytpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gdGV4dCwgd2UgbXVzdCBpbnNlcnQgYSBjb21tZW50IHRvIG1hcmsgb3VyIHBsYWNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHRydXN0IGl0IHdpbGwgc3RpY2sgYXJvdW5kIGFmdGVyIGNsb25pbmcuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RyaW5nc1tsYXN0SW5kZXhdID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZGF0YSA9IHN0cmluZ3NbbGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBwYXJ0IGZvciBlYWNoIG1hdGNoIGZvdW5kXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogTm9kZS5DT01NRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZGF0YSA9PT0gbWFya2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBmb2xsb3dpbmcgYXJlIHRydWU6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgKiBXZSBkb24ndCBoYXZlIGEgcHJldmlvdXNTaWJsaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgKiBUaGUgcHJldmlvdXNTaWJsaW5nIGlzIGFscmVhZHkgdGhlIHN0YXJ0IG9mIGEgcHJldmlvdXMgcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUucHJldmlvdXNTaWJsaW5nID09PSBudWxsIHx8IGluZGV4ID09PSBsYXN0UGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQYXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgbmV4dFNpYmxpbmcsIGtlZXAgdGhpcyBub2RlIHNvIHdlIGhhdmUgYW4gZW5kLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgd2UgY2FuIHJlbW92ZSBpdCB0byBzYXZlIGZ1dHVyZSBjb3N0cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA9IG5vZGUuZGF0YS5pbmRleE9mKG1hcmtlciwgaSArIDEpKSAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW1lbnQgbm9kZSBoYXMgYSBiaW5kaW5nIG1hcmtlciBpbnNpZGUsIG1ha2UgYW4gaW5hY3RpdmUgcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogY29uc2lkZXIgd2hldGhlciBpdCdzIGV2ZW4gd29ydGggaXQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIGJpbmRpbmdzIGluIGNvbW1lbnRzIHdvcmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiAtMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgX3ByZXBhcmVUZW1wbGF0ZShlbGVtZW50KTtcbiAgICAgICAgLy8gUmVtb3ZlIHRleHQgYmluZGluZyBub2RlcyBhZnRlciB0aGUgd2FsayB0byBub3QgZGlzdHVyYiB0aGUgVHJlZVdhbGtlclxuICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXNUb1JlbW92ZSkge1xuICAgICAgICAgICAgbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLy8gQWxsb3dzIGBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKWAgdG8gYmUgcmVuYW1lZCBmb3IgYVxuLy8gc21hbGwgbWFudWFsIHNpemUtc2F2aW5ncy5cbmV4cG9ydCBjb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbi8qKlxuICogVGhpcyByZWdleCBleHRyYWN0cyB0aGUgYXR0cmlidXRlIG5hbWUgcHJlY2VkaW5nIGFuIGF0dHJpYnV0ZS1wb3NpdGlvblxuICogZXhwcmVzc2lvbi4gSXQgZG9lcyB0aGlzIGJ5IG1hdGNoaW5nIHRoZSBzeW50YXggYWxsb3dlZCBmb3IgYXR0cmlidXRlc1xuICogYWdhaW5zdCB0aGUgc3RyaW5nIGxpdGVyYWwgZGlyZWN0bHkgcHJlY2VkaW5nIHRoZSBleHByZXNzaW9uLCBhc3N1bWluZyB0aGF0XG4gKiB0aGUgZXhwcmVzc2lvbiBpcyBpbiBhbiBhdHRyaWJ1dGUtdmFsdWUgcG9zaXRpb24uXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTBcbiAqXG4gKiBcIlxcMC1cXHgxRlxceDdGLVxceDlGXCIgYXJlIFVuaWNvZGUgY29udHJvbCBjaGFyYWN0ZXJzXG4gKlxuICogXCIgXFx4MDlcXHgwYVxceDBjXFx4MGRcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2luZnJhc3RydWN0dXJlLmh0bWwjc3BhY2UtY2hhcmFjdGVyXG4gKlxuICogU28gYW4gYXR0cmlidXRlIGlzOlxuICogICogVGhlIG5hbWU6IGFueSBjaGFyYWN0ZXIgZXhjZXB0IGEgY29udHJvbCBjaGFyYWN0ZXIsIHNwYWNlIGNoYXJhY3RlciwgKCcpLFxuICogICAgKFwiKSwgXCI+XCIsIFwiPVwiLCBvciBcIi9cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5IFwiPVwiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnk6XG4gKiAgICAqIEFueSBjaGFyYWN0ZXIgZXhjZXB0IHNwYWNlLCAoJyksIChcIiksIFwiPFwiLCBcIj5cIiwgXCI9XCIsIChgKSwgb3JcbiAqICAgICogKFwiKSB0aGVuIGFueSBub24tKFwiKSwgb3JcbiAqICAgICogKCcpIHRoZW4gYW55IG5vbi0oJylcbiAqL1xuZXhwb3J0IGNvbnN0IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXggPSAvKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKShbXlxcMC1cXHgxRlxceDdGLVxceDlGIFxceDA5XFx4MGFcXHgwY1xceDBkXCInPj0vXSspKFsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKj1bIFxceDA5XFx4MGFcXHgwY1xceDBkXSooPzpbXiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiJ2A8Pj1dKnxcIlteXCJdKnwnW14nXSopKSQvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzQ0VQb2x5ZmlsbCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGlzVGVtcGxhdGVQYXJ0QWN0aXZlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIGEgYFRlbXBsYXRlYCB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byB0aGUgRE9NIGFuZCB1cGRhdGVkXG4gKiB3aXRoIG5ldyB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUluc3RhbmNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgcHJvY2Vzc29yLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzID0gW107XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIHVwZGF0ZSh2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LnNldFZhbHVlKHZhbHVlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuX3BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5jb21taXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2xvbmUoKSB7XG4gICAgICAgIC8vIFdoZW4gdXNpbmcgdGhlIEN1c3RvbSBFbGVtZW50cyBwb2x5ZmlsbCwgY2xvbmUgdGhlIG5vZGUsIHJhdGhlciB0aGFuXG4gICAgICAgIC8vIGltcG9ydGluZyBpdCwgdG8ga2VlcCB0aGUgZnJhZ21lbnQgaW4gdGhlIHRlbXBsYXRlJ3MgZG9jdW1lbnQuIFRoaXNcbiAgICAgICAgLy8gbGVhdmVzIHRoZSBmcmFnbWVudCBpbmVydCBzbyBjdXN0b20gZWxlbWVudHMgd29uJ3QgdXBncmFkZSBhbmRcbiAgICAgICAgLy8gcG90ZW50aWFsbHkgbW9kaWZ5IHRoZWlyIGNvbnRlbnRzIGJ5IGNyZWF0aW5nIGEgcG9seWZpbGxlZCBTaGFkb3dSb290XG4gICAgICAgIC8vIHdoaWxlIHdlIHRyYXZlcnNlIHRoZSB0cmVlLlxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGlzQ0VQb2x5ZmlsbCA/XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkgOlxuICAgICAgICAgICAgZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLnRlbXBsYXRlLmVsZW1lbnQuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy50ZW1wbGF0ZS5wYXJ0cztcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgICAgICBjb25zdCBfcHJlcGFyZUluc3RhbmNlID0gKGZyYWdtZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBFZGdlIG5lZWRzIGFsbCA0IHBhcmFtZXRlcnMgcHJlc2VudDsgSUUxMSBuZWVkcyAzcmQgcGFyYW1ldGVyIHRvIGJlXG4gICAgICAgICAgICAvLyBudWxsXG4gICAgICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGZyYWdtZW50LCAxMzMgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR8VEVYVH0gKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICAgIGxldCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHRoZSBub2RlcyBhbmQgcGFydHMgb2YgYSB0ZW1wbGF0ZVxuICAgICAgICAgICAgd2hpbGUgKHBhcnRJbmRleCA8IHBhcnRzLmxlbmd0aCAmJiBub2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAgICAgLy8gQ29uc2VjdXRpdmUgUGFydHMgbWF5IGhhdmUgdGhlIHNhbWUgbm9kZSBpbmRleCwgaW4gdGhlIGNhc2Ugb2ZcbiAgICAgICAgICAgICAgICAvLyBtdWx0aXBsZSBib3VuZCBhdHRyaWJ1dGVzIG9uIGFuIGVsZW1lbnQuIFNvIGVhY2ggaXRlcmF0aW9uIHdlIGVpdGhlclxuICAgICAgICAgICAgICAgIC8vIGluY3JlbWVudCB0aGUgbm9kZUluZGV4LCBpZiB3ZSBhcmVuJ3Qgb24gYSBub2RlIHdpdGggYSBwYXJ0LCBvciB0aGVcbiAgICAgICAgICAgICAgICAvLyBwYXJ0SW5kZXggaWYgd2UgYXJlLiBCeSBub3QgaW5jcmVtZW50aW5nIHRoZSBub2RlSW5kZXggd2hlbiB3ZSBmaW5kIGFcbiAgICAgICAgICAgICAgICAvLyBwYXJ0LCB3ZSBhbGxvdyBmb3IgdGhlIG5leHQgcGFydCB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyBub2RlIGlmIG5lY2Nlc3Nhc3J5LlxuICAgICAgICAgICAgICAgIGlmICghaXNUZW1wbGF0ZVBhcnRBY3RpdmUocGFydCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFydHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZUluZGV4ID09PSBwYXJ0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICdub2RlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucHJvY2Vzc29yLmhhbmRsZVRleHRFeHByZXNzaW9uKHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Lmluc2VydEFmdGVyTm9kZShub2RlLnByZXZpb3VzU2libGluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFydHMucHVzaCguLi50aGlzLnByb2Nlc3Nvci5oYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhub2RlLCBwYXJ0Lm5hbWUsIHBhcnQuc3RyaW5ncywgdGhpcy5vcHRpb25zKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9wcmVwYXJlSW5zdGFuY2Uobm9kZS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfcHJlcGFyZUluc3RhbmNlKGZyYWdtZW50KTtcbiAgICAgICAgaWYgKGlzQ0VQb2x5ZmlsbCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRvcHROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIGN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1pbnN0YW5jZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGJvdW5kQXR0cmlidXRlU3VmZml4LCBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LCBtYXJrZXIsIG5vZGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIGBodG1sYCwgd2hpY2ggaG9sZHMgYSBUZW1wbGF0ZSBhbmQgdGhlIHZhbHVlcyBmcm9tXG4gKiBpbnRlcnBvbGF0ZWQgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RyaW5ncywgdmFsdWVzLCB0eXBlLCBwcm9jZXNzb3IpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIEhUTUwgdXNlZCB0byBjcmVhdGUgYSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAgICAgKi9cbiAgICBnZXRIVE1MKCkge1xuICAgICAgICBjb25zdCBlbmRJbmRleCA9IHRoaXMuc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgaHRtbCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3NbaV07XG4gICAgICAgICAgICAvLyBUaGlzIGV4ZWMoKSBjYWxsIGRvZXMgdHdvIHRoaW5nczpcbiAgICAgICAgICAgIC8vIDEpIEFwcGVuZHMgYSBzdWZmaXggdG8gdGhlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lIHRvIG9wdCBvdXQgb2Ygc3BlY2lhbFxuICAgICAgICAgICAgLy8gYXR0cmlidXRlIHZhbHVlIHBhcnNpbmcgdGhhdCBJRTExIGFuZCBFZGdlIGRvLCBsaWtlIGZvciBzdHlsZSBhbmRcbiAgICAgICAgICAgIC8vIG1hbnkgU1ZHIGF0dHJpYnV0ZXMuIFRoZSBUZW1wbGF0ZSBjbGFzcyBhbHNvIGFwcGVuZHMgdGhlIHNhbWUgc3VmZml4XG4gICAgICAgICAgICAvLyB3aGVuIGxvb2tpbmcgdXAgYXR0cmlidXRlcyB0byBjcmVhdGUgUGFydHMuXG4gICAgICAgICAgICAvLyAyKSBBZGRzIGFuIHVucXVvdGVkLWF0dHJpYnV0ZS1zYWZlIG1hcmtlciBmb3IgdGhlIGZpcnN0IGV4cHJlc3Npb24gaW5cbiAgICAgICAgICAgIC8vIGFuIGF0dHJpYnV0ZS4gU3Vic2VxdWVudCBhdHRyaWJ1dGUgZXhwcmVzc2lvbnMgd2lsbCB1c2Ugbm9kZSBtYXJrZXJzLFxuICAgICAgICAgICAgLy8gYW5kIHRoaXMgaXMgc2FmZSBzaW5jZSBhdHRyaWJ1dGVzIHdpdGggbXVsdGlwbGUgZXhwcmVzc2lvbnMgYXJlXG4gICAgICAgICAgICAvLyBndWFyYW50ZWVkIHRvIGJlIHF1b3RlZC5cbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGFzdEF0dHJpYnV0ZU5hbWVSZWdleC5leGVjKHMpO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgc3RhcnRpbmcgYSBuZXcgYm91bmQgYXR0cmlidXRlLlxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgc2FmZSBhdHRyaWJ1dGUgc3VmZml4LCBhbmQgdXNlIHVucXVvdGVkLWF0dHJpYnV0ZS1zYWZlXG4gICAgICAgICAgICAgICAgLy8gbWFya2VyLlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcy5zdWJzdHIoMCwgbWF0Y2guaW5kZXgpICsgbWF0Y2hbMV0gKyBtYXRjaFsyXSArXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kQXR0cmlidXRlU3VmZml4ICsgbWF0Y2hbM10gKyBtYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBlaXRoZXIgaW4gYSBib3VuZCBub2RlLCBvciB0cmFpbGluZyBib3VuZCBhdHRyaWJ1dGUuXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIHdheSwgbm9kZU1hcmtlciBpcyBzYWZlIHRvIHVzZS5cbiAgICAgICAgICAgICAgICBodG1sICs9IHMgKyBub2RlTWFya2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1sICsgdGhpcy5zdHJpbmdzW2VuZEluZGV4XTtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGVFbGVtZW50KCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHRoaXMuZ2V0SFRNTCgpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuLyoqXG4gKiBBIFRlbXBsYXRlUmVzdWx0IGZvciBTVkcgZnJhZ21lbnRzLlxuICpcbiAqIFRoaXMgY2xhc3Mgd3JhcHMgSFRNbCBpbiBhbiBgPHN2Zz5gIHRhZyBpbiBvcmRlciB0byBwYXJzZSBpdHMgY29udGVudHMgaW4gdGhlXG4gKiBTVkcgbmFtZXNwYWNlLCB0aGVuIG1vZGlmaWVzIHRoZSB0ZW1wbGF0ZSB0byByZW1vdmUgdGhlIGA8c3ZnPmAgdGFnIHNvIHRoYXRcbiAqIGNsb25lcyBvbmx5IGNvbnRhaW5lciB0aGUgb3JpZ2luYWwgZnJhZ21lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTVkdUZW1wbGF0ZVJlc3VsdCBleHRlbmRzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBnZXRIVE1MKCkge1xuICAgICAgICByZXR1cm4gYDxzdmc+JHtzdXBlci5nZXRIVE1MKCl9PC9zdmc+YDtcbiAgICB9XG4gICAgZ2V0VGVtcGxhdGVFbGVtZW50KCkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHN1cGVyLmdldFRlbXBsYXRlRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGVtcGxhdGUuY29udGVudDtcbiAgICAgICAgY29uc3Qgc3ZnRWxlbWVudCA9IGNvbnRlbnQuZmlyc3RDaGlsZDtcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChzdmdFbGVtZW50KTtcbiAgICAgICAgcmVwYXJlbnROb2Rlcyhjb250ZW50LCBzdmdFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtcmVzdWx0LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbmltcG9ydCB7IHJlbW92ZU5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL3BhcnQuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4vdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL3RlbXBsYXRlLXJlc3VsdC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVNYXJrZXIgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgISh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykpO1xufTtcbi8qKlxuICogU2V0cyBhdHRyaWJ1dGUgdmFsdWVzIGZvciBBdHRyaWJ1dGVQYXJ0cywgc28gdGhhdCB0aGUgdmFsdWUgaXMgb25seSBzZXQgb25jZVxuICogZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHMgZm9yIGFuIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRzW2ldID0gdGhpcy5fY3JlYXRlUGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaW5nbGUgcGFydC4gT3ZlcnJpZGUgdGhpcyB0byBjcmVhdGUgYSBkaWZmZXJudCB0eXBlIG9mIHBhcnQuXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXR0cmlidXRlUGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHBhcnQudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHYgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAoQXJyYXkuaXNBcnJheSh2KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHYgIT09ICdzdHJpbmcnICYmIHZbU3ltYm9sLml0ZXJhdG9yXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0IG9mIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgKz0gdHlwZW9mIHQgPT09ICdzdHJpbmcnID8gdCA6IFN0cmluZyh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogU3RyaW5nKHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgdGhpcy5fZ2V0VmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXR0cmlidXRlUGFydCB7XG4gICAgY29uc3RydWN0b3IoY29taXR0ZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jb21taXR0ZXIgPSBjb21pdHRlcjtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBub0NoYW5nZSAmJiAoIWlzUHJpbWl0aXZlKHZhbHVlKSB8fCB2YWx1ZSAhPT0gdGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhIG5vdCBhIGRpcmVjdGl2ZSwgZGlydHkgdGhlIGNvbW1pdHRlciBzbyB0aGF0IGl0J2xsXG4gICAgICAgICAgICAvLyBjYWxsIHNldEF0dHJpYnV0ZS4gSWYgdGhlIHZhbHVlIGlzIGEgZGlyZWN0aXZlLCBpdCdsbCBkaXJ0eSB0aGVcbiAgICAgICAgICAgIC8vIGNvbW1pdHRlciBpZiBpdCBjYWxscyBzZXRWYWx1ZSgpLlxuICAgICAgICAgICAgaWYgKCFpc0RpcmVjdGl2ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1pdHRlci5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb21taXR0ZXIuY29tbWl0KCk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE5vZGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgaW50byBhIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGFwcGVuZEludG8oY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGlzIHBhcnQgYmV0d2VlbiBgcmVmYCBhbmQgYHJlZmAncyBuZXh0IHNpYmxpbmcuIEJvdGggYHJlZmAgYW5kXG4gICAgICogaXRzIG5leHQgc2libGluZyBtdXN0IGJlIHN0YXRpYywgdW5jaGFuZ2luZyBub2RlcyBzdWNoIGFzIHRob3NlIHRoYXQgYXBwZWFyXG4gICAgICogaW4gYSBsaXRlcmFsIHNlY3Rpb24gb2YgYSB0ZW1wbGF0ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyTm9kZShyZWYpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSByZWY7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5uZXh0U2libGluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgaW50byBhIHBhcmVudCBwYXJ0LlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50b1BhcnQocGFydCkge1xuICAgICAgICBwYXJ0Ll9pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHBhcnQuX2luc2VydCh0aGlzLmVuZE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhpcyBwYXJ0IGFmdGVyIGByZWZgXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBpbnNlcnRBZnRlclBhcnQocmVmKSB7XG4gICAgICAgIHJlZi5faW5zZXJ0KHRoaXMuc3RhcnROb2RlID0gY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSByZWYuZW5kTm9kZTtcbiAgICAgICAgcmVmLmVuZE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZVJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy5fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fY29tbWl0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHxcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICAgIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gbm90aGluZykge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5vdGhpbmc7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBGYWxsYmFjaywgd2lsbCByZW5kZXIgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAgICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2luc2VydChub2RlKSB7XG4gICAgICAgIHRoaXMuZW5kTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbiAgICBfY29tbWl0Tm9kZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX2luc2VydCh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX2NvbW1pdFRleHQodmFsdWUpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuc3RhcnROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xuICAgICAgICBpZiAobm9kZSA9PT0gdGhpcy5lbmROb2RlLnByZXZpb3VzU2libGluZyAmJlxuICAgICAgICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gMyAvKiBOb2RlLlRFWFRfTk9ERSAqLykge1xuICAgICAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIHRleHQgbm9kZSBiZXR3ZWVuIHRoZSBtYXJrZXJzLCB3ZSBjYW4ganVzdFxuICAgICAgICAgICAgLy8gc2V0IGl0cyB2YWx1ZSwgcmF0aGVyIHRoYW4gcmVwbGFjaW5nIGl0LlxuICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogQ2FuIHdlIGp1c3QgY2hlY2sgaWYgdGhpcy52YWx1ZSBpcyBwcmltaXRpdmU/XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKSkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlRmFjdG9yeSh2YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgVGVtcGxhdGVJbnN0YW5jZSAmJlxuICAgICAgICAgICAgdGhpcy52YWx1ZS50ZW1wbGF0ZSA9PT0gdGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgcHJvcGFnYXRlIHRoZSB0ZW1wbGF0ZSBwcm9jZXNzb3IgZnJvbSB0aGUgVGVtcGxhdGVSZXN1bHRcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgdXNlIGl0cyBzeW50YXggZXh0ZW5zaW9uLCBldGMuIFRoZSB0ZW1wbGF0ZSBmYWN0b3J5IGNvbWVzXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSByZW5kZXIgZnVuY3Rpb24gb3B0aW9ucyBzbyB0aGF0IGl0IGNhbiBjb250cm9sIHRlbXBsYXRlXG4gICAgICAgICAgICAvLyBjYWNoaW5nIGFuZCBwcmVwcm9jZXNzaW5nLlxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSwgdmFsdWUucHJvY2Vzc29yLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBpbnN0YW5jZS5fY2xvbmUoKTtcbiAgICAgICAgICAgIGluc3RhbmNlLnVwZGF0ZSh2YWx1ZS52YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgICAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAgICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG4gICAgICAgIC8vIElmIF92YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgICAgICAvLyBpdGVyYWJsZSBhbmQgX3ZhbHVlIHdpbGwgY29udGFpbiB0aGUgTm9kZVBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgICAgIC8vIHJlbmRlci4gSWYgX3ZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgICAgIC8vIGFycmF5IGZvciBOb2RlUGFydHMuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgICAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMudmFsdWU7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgaXRlbVBhcnQ7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIHJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgICAgICBpZiAoaXRlbVBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0ID0gbmV3IE5vZGVQYXJ0KHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnRzLnB1c2goaXRlbVBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVBhcnQuYXBwZW5kSW50b1BhcnQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5pbnNlcnRBZnRlclBhcnQoaXRlbVBhcnRzW3BhcnRJbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtUGFydC5zZXRWYWx1ZShpdGVtKTtcbiAgICAgICAgICAgIGl0ZW1QYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgICAgICAgICB0aGlzLmNsZWFyKGl0ZW1QYXJ0ICYmIGl0ZW1QYXJ0LmVuZE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyKHN0YXJ0Tm9kZSA9IHRoaXMuc3RhcnROb2RlKSB7XG4gICAgICAgIHJlbW92ZU5vZGVzKHRoaXMuc3RhcnROb2RlLnBhcmVudE5vZGUsIHN0YXJ0Tm9kZS5uZXh0U2libGluZywgdGhpcy5lbmROb2RlKTtcbiAgICB9XG59XG4vKipcbiAqIEltcGxlbWVudHMgYSBib29sZWFuIGF0dHJpYnV0ZSwgcm91Z2hseSBhcyBkZWZpbmVkIGluIHRoZSBIVE1MXG4gKiBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIElmIHRoZSB2YWx1ZSBpcyB0cnV0aHksIHRoZW4gdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50IHdpdGggYSB2YWx1ZSBvZlxuICogJycuIElmIHRoZSB2YWx1ZSBpcyBmYWxzZXksIHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHN0cmluZ3MubGVuZ3RoICE9PSAyIHx8IHN0cmluZ3NbMF0gIT09ICcnIHx8IHN0cmluZ3NbMV0gIT09ICcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb2xlYW4gYXR0cmlidXRlcyBjYW4gb25seSBjb250YWluIGEgc2luZ2xlIGV4cHJlc3Npb24nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9ICEhdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHRoaXMubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG59XG4vKipcbiAqIFNldHMgYXR0cmlidXRlIHZhbHVlcyBmb3IgUHJvcGVydHlQYXJ0cywgc28gdGhhdCB0aGUgdmFsdWUgaXMgb25seSBzZXQgb25jZVxuICogZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgcGFydHMgZm9yIGEgcHJvcGVydHkuXG4gKlxuICogSWYgYW4gZXhwcmVzc2lvbiBjb250cm9scyB0aGUgd2hvbGUgcHJvcGVydHkgdmFsdWUsIHRoZW4gdGhlIHZhbHVlIGlzIHNpbXBseVxuICogYXNzaWduZWQgdG8gdGhlIHByb3BlcnR5IHVuZGVyIGNvbnRyb2wuIElmIHRoZXJlIGFyZSBzdHJpbmcgbGl0ZXJhbHMgb3JcbiAqIG11bHRpcGxlIGV4cHJlc3Npb25zLCB0aGVuIHRoZSBzdHJpbmdzIGFyZSBleHByZXNzaW9ucyBhcmUgaW50ZXJwb2xhdGVkIGludG9cbiAqIGEgc3RyaW5nIGZpcnN0LlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlDb21taXR0ZXIgZXh0ZW5kcyBBdHRyaWJ1dGVDb21taXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHRoaXMuc2luZ2xlID1cbiAgICAgICAgICAgIChzdHJpbmdzLmxlbmd0aCA9PT0gMiAmJiBzdHJpbmdzWzBdID09PSAnJyAmJiBzdHJpbmdzWzFdID09PSAnJyk7XG4gICAgfVxuICAgIF9jcmVhdGVQYXJ0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5UGFydCh0aGlzKTtcbiAgICB9XG4gICAgX2dldFZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5zaW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnRzWzBdLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5fZ2V0VmFsdWUoKTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMubmFtZV0gPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xufVxuLy8gRGV0ZWN0IGV2ZW50IGxpc3RlbmVyIG9wdGlvbnMgc3VwcG9ydC4gSWYgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eSBpcyByZWFkXG4vLyBmcm9tIHRoZSBvcHRpb25zIG9iamVjdCwgdGhlbiBvcHRpb25zIGFyZSBzdXBwb3J0ZWQuIElmIG5vdCwgdGhlbiB0aGUgdGhyaWRcbi8vIGFyZ3VtZW50IHRvIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlzIGludGVycHJldGVkIGFzIHRoZSBib29sZWFuIGNhcHR1cmVcbi8vIHZhbHVlIHNvIHdlIHNob3VsZCBvbmx5IHBhc3MgdGhlIGBjYXB0dXJlYCBwcm9wZXJ0eS5cbmxldCBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSBmYWxzZTtcbnRyeSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZ2V0IGNhcHR1cmUoKSB7XG4gICAgICAgICAgICBldmVudE9wdGlvbnNTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBvcHRpb25zLCBvcHRpb25zKTtcbn1cbmNhdGNoIChfZSkge1xufVxuZXhwb3J0IGNsYXNzIEV2ZW50UGFydCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgZXZlbnROYW1lLCBldmVudENvbnRleHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5ldmVudENvbnRleHQgPSBldmVudENvbnRleHQ7XG4gICAgICAgIHRoaXMuX2JvdW5kSGFuZGxlRXZlbnQgPSAoZSkgPT4gdGhpcy5oYW5kbGVFdmVudChlKTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgd2hpbGUgKGlzRGlyZWN0aXZlKHRoaXMuX3BlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHRoaXMuX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgICAgICAgICAgZGlyZWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nVmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3TGlzdGVuZXIgPSB0aGlzLl9wZW5kaW5nVmFsdWU7XG4gICAgICAgIGNvbnN0IG9sZExpc3RlbmVyID0gdGhpcy52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2hvdWxkUmVtb3ZlTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciA9PSBudWxsIHx8XG4gICAgICAgICAgICBvbGRMaXN0ZW5lciAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgKG5ld0xpc3RlbmVyLmNhcHR1cmUgIT09IG9sZExpc3RlbmVyLmNhcHR1cmUgfHxcbiAgICAgICAgICAgICAgICAgICAgbmV3TGlzdGVuZXIub25jZSAhPT0gb2xkTGlzdGVuZXIub25jZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5wYXNzaXZlICE9PSBvbGRMaXN0ZW5lci5wYXNzaXZlKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkQWRkTGlzdGVuZXIgPSBuZXdMaXN0ZW5lciAhPSBudWxsICYmIChvbGRMaXN0ZW5lciA9PSBudWxsIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcbiAgICAgICAgaWYgKHNob3VsZFJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zID0gZ2V0T3B0aW9ucyhuZXdMaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcy5fYm91bmRIYW5kbGVFdmVudCwgdGhpcy5fb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IG5ld0xpc3RlbmVyO1xuICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICB9XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmNhbGwodGhpcy5ldmVudENvbnRleHQgfHwgdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIFdlIGNvcHkgb3B0aW9ucyBiZWNhdXNlIG9mIHRoZSBpbmNvbnNpc3RlbnQgYmVoYXZpb3Igb2YgYnJvd3NlcnMgd2hlbiByZWFkaW5nXG4vLyB0aGUgdGhpcmQgYXJndW1lbnQgb2YgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuIElFMTEgZG9lc24ndCBzdXBwb3J0IG9wdGlvbnNcbi8vIGF0IGFsbC4gQ2hyb21lIDQxIG9ubHkgcmVhZHMgYGNhcHR1cmVgIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBvYmplY3QuXG5jb25zdCBnZXRPcHRpb25zID0gKG8pID0+IG8gJiZcbiAgICAoZXZlbnRPcHRpb25zU3VwcG9ydGVkID9cbiAgICAgICAgeyBjYXB0dXJlOiBvLmNhcHR1cmUsIHBhc3NpdmU6IG8ucGFzc2l2ZSwgb25jZTogby5vbmNlIH0gOlxuICAgICAgICBvLmNhcHR1cmUpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydHMuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBOb2RlUGFydCwgUHJvcGVydHlDb21taXR0ZXIgfSBmcm9tICcuL3BhcnRzLmpzJztcbi8qKlxuICogQ3JlYXRlcyBQYXJ0cyB3aGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGFydHMgZm9yIGFuIGF0dHJpYnV0ZS1wb3NpdGlvbiBiaW5kaW5nLCBnaXZlbiB0aGUgZXZlbnQsIGF0dHJpYnV0ZVxuICAgICAqIG5hbWUsIGFuZCBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBiaW5kaW5nXG4gICAgICogQHBhcmFtIG5hbWUgIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAqIEBwYXJhbSBzdHJpbmdzIFRoZSBzdHJpbmcgbGl0ZXJhbHMuIFRoZXJlIGFyZSBhbHdheXMgYXQgbGVhc3QgdHdvIHN0cmluZ3MsXG4gICAgICogICBldmVudCBmb3IgZnVsbHktY29udHJvbGxlZCBiaW5kaW5ncyB3aXRoIGEgc2luZ2xlIGV4cHJlc3Npb24uXG4gICAgICovXG4gICAgaGFuZGxlQXR0cmlidXRlRXhwcmVzc2lvbnMoZWxlbWVudCwgbmFtZSwgc3RyaW5ncywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBuYW1lWzBdO1xuICAgICAgICBpZiAocHJlZml4ID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbWl0dGVyID0gbmV3IFByb3BlcnR5Q29tbWl0dGVyKGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbWl0dGVyLnBhcnRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVmaXggPT09ICdAJykge1xuICAgICAgICAgICAgcmV0dXJuIFtuZXcgRXZlbnRQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIG9wdGlvbnMuZXZlbnRDb250ZXh0KV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJz8nKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBCb29sZWFuQXR0cmlidXRlUGFydChlbGVtZW50LCBuYW1lLnNsaWNlKDEpLCBzdHJpbmdzKV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29taXR0ZXIgPSBuZXcgQXR0cmlidXRlQ29tbWl0dGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpO1xuICAgICAgICByZXR1cm4gY29taXR0ZXIucGFydHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYSB0ZXh0LXBvc2l0aW9uIGJpbmRpbmcuXG4gICAgICogQHBhcmFtIHRlbXBsYXRlRmFjdG9yeVxuICAgICAqL1xuICAgIGhhbmRsZVRleHRFeHByZXNzaW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlUGFydChvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yID0gbmV3IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgbWFya2VyLCBUZW1wbGF0ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBUaGUgZGVmYXVsdCBUZW1wbGF0ZUZhY3Rvcnkgd2hpY2ggY2FjaGVzIFRlbXBsYXRlcyBrZXllZCBvblxuICogcmVzdWx0LnR5cGUgYW5kIHJlc3VsdC5zdHJpbmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVGYWN0b3J5KHJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZUNhY2hlID0gdGVtcGxhdGVDYWNoZXMuZ2V0KHJlc3VsdC50eXBlKTtcbiAgICBpZiAodGVtcGxhdGVDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUgPSB7XG4gICAgICAgICAgICBzdHJpbmdzQXJyYXk6IG5ldyBXZWFrTWFwKCksXG4gICAgICAgICAgICBrZXlTdHJpbmc6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgICAgICB0ZW1wbGF0ZUNhY2hlcy5zZXQocmVzdWx0LnR5cGUsIHRlbXBsYXRlQ2FjaGUpO1xuICAgIH1cbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFRlbXBsYXRlU3RyaW5nc0FycmF5IGlzIG5ldywgZ2VuZXJhdGUgYSBrZXkgZnJvbSB0aGUgc3RyaW5nc1xuICAgIC8vIFRoaXMga2V5IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXMgd2l0aCBpZGVudGljYWwgY29udGVudFxuICAgIGNvbnN0IGtleSA9IHJlc3VsdC5zdHJpbmdzLmpvaW4obWFya2VyKTtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLmdldChrZXkpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm90IHNlZW4gdGhpcyBrZXkgYmVmb3JlLCBjcmVhdGUgYSBuZXcgVGVtcGxhdGVcbiAgICAgICAgdGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0LCByZXN1bHQuZ2V0VGVtcGxhdGVFbGVtZW50KCkpO1xuICAgICAgICAvLyBDYWNoZSB0aGUgVGVtcGxhdGUgZm9yIHRoaXMga2V5XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUua2V5U3RyaW5nLnNldChrZXksIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgLy8gQ2FjaGUgYWxsIGZ1dHVyZSBxdWVyaWVzIGZvciB0aGlzIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gICAgdGVtcGxhdGVDYWNoZS5zdHJpbmdzQXJyYXkuc2V0KHJlc3VsdC5zdHJpbmdzLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xufVxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlQ2FjaGVzID0gbmV3IE1hcCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGUtZmFjdG9yeS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBOb2RlUGFydCB9IGZyb20gJy4vcGFydHMuanMnO1xuaW1wb3J0IHsgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCBjb25zdCBwYXJ0cyA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIFJlbmRlcnMgYSB0ZW1wbGF0ZSB0byBhIGNvbnRhaW5lci5cbiAqXG4gKiBUbyB1cGRhdGUgYSBjb250YWluZXIgd2l0aCBuZXcgdmFsdWVzLCByZWV2YWx1YXRlIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIGFuZFxuICogY2FsbCBgcmVuZGVyYCB3aXRoIHRoZSBuZXcgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSByZXN1bHQgYSBUZW1wbGF0ZVJlc3VsdCBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWcgbGlrZVxuICogICAgIGBodG1sYCBvciBgc3ZnYC5cbiAqIEBwYXJhbSBjb250YWluZXIgQSBET00gcGFyZW50IHRvIHJlbmRlciB0by4gVGhlIGVudGlyZSBjb250ZW50cyBhcmUgZWl0aGVyXG4gKiAgICAgcmVwbGFjZWQsIG9yIGVmZmljaWVudGx5IHVwZGF0ZWQgaWYgdGhlIHNhbWUgcmVzdWx0IHR5cGUgd2FzIHByZXZpb3VzXG4gKiAgICAgcmVuZGVyZWQgdGhlcmUuXG4gKiBAcGFyYW0gb3B0aW9ucyBSZW5kZXJPcHRpb25zIGZvciB0aGUgZW50aXJlIHJlbmRlciB0cmVlIHJlbmRlcmVkIHRvIHRoaXNcbiAqICAgICBjb250YWluZXIuIFJlbmRlciBvcHRpb25zIG11c3QgKm5vdCogY2hhbmdlIGJldHdlZW4gcmVuZGVycyB0byB0aGUgc2FtZVxuICogICAgIGNvbnRhaW5lciwgYXMgdGhvc2UgY2hhbmdlcyB3aWxsIG5vdCBlZmZlY3QgcHJldmlvdXNseSByZW5kZXJlZCBET00uXG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXIgPSAocmVzdWx0LCBjb250YWluZXIsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgcGFydCA9IHBhcnRzLmdldChjb250YWluZXIpO1xuICAgIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXMoY29udGFpbmVyLCBjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIHBhcnRzLnNldChjb250YWluZXIsIHBhcnQgPSBuZXcgTm9kZVBhcnQoT2JqZWN0LmFzc2lnbih7IHRlbXBsYXRlRmFjdG9yeSB9LCBvcHRpb25zKSkpO1xuICAgICAgICBwYXJ0LmFwcGVuZEludG8oY29udGFpbmVyKTtcbiAgICB9XG4gICAgcGFydC5zZXRWYWx1ZShyZXN1bHQpO1xuICAgIHBhcnQuY29tbWl0KCk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVuZGVyLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICpcbiAqIE1haW4gbGl0LWh0bWwgbW9kdWxlLlxuICpcbiAqIE1haW4gZXhwb3J0czpcbiAqXG4gKiAtICBbW2h0bWxdXVxuICogLSAgW1tzdmddXVxuICogLSAgW1tyZW5kZXJdXVxuICpcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqIEBwcmVmZXJyZWRcbiAqL1xuLyoqXG4gKiBEbyBub3QgcmVtb3ZlIHRoaXMgY29tbWVudDsgaXQga2VlcHMgdHlwZWRvYyBmcm9tIG1pc3BsYWNpbmcgdGhlIG1vZHVsZVxuICogZG9jcy5cbiAqL1xuaW1wb3J0IHsgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIH0gZnJvbSAnLi9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMnO1xuaW1wb3J0IHsgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtcmVzdWx0LmpzJztcbmV4cG9ydCB7IERlZmF1bHRUZW1wbGF0ZVByb2Nlc3NvciwgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yIH0gZnJvbSAnLi9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMnO1xuZXhwb3J0IHsgZGlyZWN0aXZlLCBpc0RpcmVjdGl2ZSB9IGZyb20gJy4vbGliL2RpcmVjdGl2ZS5qcyc7XG4vLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiByZW1vdmUgbGluZSB3aGVuIHdlIGdldCBOb2RlUGFydCBtb3ZpbmcgbWV0aG9kc1xuZXhwb3J0IHsgcmVtb3ZlTm9kZXMsIHJlcGFyZW50Tm9kZXMgfSBmcm9tICcuL2xpYi9kb20uanMnO1xuZXhwb3J0IHsgbm9DaGFuZ2UsIG5vdGhpbmcgfSBmcm9tICcuL2xpYi9wYXJ0LmpzJztcbmV4cG9ydCB7IEF0dHJpYnV0ZUNvbW1pdHRlciwgQXR0cmlidXRlUGFydCwgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsIEV2ZW50UGFydCwgaXNQcmltaXRpdmUsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciwgUHJvcGVydHlQYXJ0IH0gZnJvbSAnLi9saWIvcGFydHMuanMnO1xuZXhwb3J0IHsgcGFydHMsIHJlbmRlciB9IGZyb20gJy4vbGliL3JlbmRlci5qcyc7XG5leHBvcnQgeyB0ZW1wbGF0ZUNhY2hlcywgdGVtcGxhdGVGYWN0b3J5IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtZmFjdG9yeS5qcyc7XG5leHBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtaW5zdGFuY2UuanMnO1xuZXhwb3J0IHsgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi9saWIvdGVtcGxhdGUtcmVzdWx0LmpzJztcbmV4cG9ydCB7IGNyZWF0ZU1hcmtlciwgaXNUZW1wbGF0ZVBhcnRBY3RpdmUsIFRlbXBsYXRlIH0gZnJvbSAnLi9saWIvdGVtcGxhdGUuanMnO1xuLy8gSU1QT1JUQU5UOiBkbyBub3QgY2hhbmdlIHRoZSBwcm9wZXJ0eSBuYW1lIG9yIHRoZSBhc3NpZ25tZW50IGV4cHJlc3Npb24uXG4vLyBUaGlzIGxpbmUgd2lsbCBiZSB1c2VkIGluIHJlZ2V4ZXMgdG8gc2VhcmNoIGZvciBsaXQtaHRtbCB1c2FnZS5cbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IGluamVjdCB2ZXJzaW9uIG51bWJlciBhdCBidWlsZCB0aW1lXG4od2luZG93WydsaXRIdG1sVmVyc2lvbnMnXSB8fCAod2luZG93WydsaXRIdG1sVmVyc2lvbnMnXSA9IFtdKSkucHVzaCgnMS4wLjAnKTtcbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gSFRNTCB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBodG1sID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gbmV3IFRlbXBsYXRlUmVzdWx0KHN0cmluZ3MsIHZhbHVlcywgJ2h0bWwnLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBTVkcgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3Qgc3ZnID0gKHN0cmluZ3MsIC4uLnZhbHVlcykgPT4gbmV3IFNWR1RlbXBsYXRlUmVzdWx0KHN0cmluZ3MsIHZhbHVlcywgJ3N2ZycsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1saXQtaHRtbC5qcy5tYXAiLCIvKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIG1hcCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gYSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVNYXBwZXI8VCA9IGFueT4gPSAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IFQgfCBudWxsO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIG1hcCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZSB2YWx1ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU1hcHBlcjxUID0gYW55PiA9ICh2YWx1ZTogVCB8IG51bGwpID0+IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgaG9sZHMgYW4ge0BsaW5rIEF0dHJpYnV0ZU1hcHBlcn0gYW5kIGEge0BsaW5rIFByb3BlcnR5TWFwcGVyfVxuICpcbiAqIEByZW1hcmtzXG4gKiBGb3IgdGhlIG1vc3QgY29tbW9uIHR5cGVzLCBhIGNvbnZlcnRlciBleGlzdHMgd2hpY2ggY2FuIGJlIHJlZmVyZW5jZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBDdXN0b21FbGVtZW50LCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiB9IGZyb20gJ2N1c3RvbS1lbGVtZW50JztcbiAqXG4gKiBleHBvcnQgY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ3VzdG9tRWxlbWVudCB7XG4gKlxuICogICAgICBAcHJvcGVydHkoe1xuICogICAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuXG4gKiAgICAgIH0pXG4gKiAgICAgIG15UHJvcGVydHkgPSB0cnVlO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ29udmVydGVyPFQgPSBhbnk+IHtcbiAgICB0b0F0dHJpYnV0ZTogUHJvcGVydHlNYXBwZXI8VD47XG4gICAgZnJvbUF0dHJpYnV0ZTogQXR0cmlidXRlTWFwcGVyPFQ+O1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBjb252ZXJ0ZXJcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhpcyBjb252ZXJ0ZXIgaXMgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb252ZXJ0ZXIgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHVubGVzcyBhIGRpZmZlcmVudCBvbmVcbiAqIGlzIHNwZWNpZmllZC4gVGhlIGNvbnZlcnRlciB0cmllcyB0byBpbmZlciB0aGUgcHJvcGVydHkgdHlwZSB3aGVuIGNvbnZlcnRpbmcgdG8gYXR0cmlidXRlcyBhbmRcbiAqIHVzZXMgYEpTT04ucGFyc2UoKWAgd2hlbiBjb252ZXJ0aW5nIHN0cmluZ3MgZnJvbSBhdHRyaWJ1dGVzLiBJZiBgSlNPTi5wYXJzZSgpYCB0aHJvd3MgYW4gZXJyb3IsXG4gKiB0aGUgY29udmVydGVyIHdpbGwgdXNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0OiBBdHRyaWJ1dGVDb252ZXJ0ZXIgPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCBzdWNjZXNzZnVsbHkgcGFyc2UgYGJvb2xlYW5gLCBgbnVtYmVyYCBhbmQgYEpTT04uc3RyaW5naWZ5YCdkIHZhbHVlc1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGl0IHRocm93cywgaXQgbWVhbnMgd2UncmUgcHJvYmFibHkgZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgfSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG51bWJlciwgYmlnaW50LCBzeW1ib2wsIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbjogQXR0cmlidXRlQ29udmVydGVyPGJvb2xlYW4+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlICE9PSBudWxsKSxcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBib29sZWFuIHwgbnVsbCkgPT4gdmFsdWUgPyAnJyA6IG51bGxcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZzogQXR0cmlidXRlQ29udmVydGVyPHN0cmluZz4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwpID8gbnVsbCA6IHZhbHVlLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZhbHVlXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXI6IEF0dHJpYnV0ZUNvbnZlcnRlcjxudW1iZXI+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiBOdW1iZXIodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBudW1iZXIgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlck9iamVjdDogQXR0cmlidXRlQ29udmVydGVyPG9iamVjdD4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBvYmplY3QgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyQXJyYXk6IEF0dHJpYnV0ZUNvbnZlcnRlcjxhbnlbXT4gPSB7XG4gICAgLy8gYEpTT04ucGFyc2UoKWAgd2lsbCB0aHJvdyBhbiBlcnJvciBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IEpTT04ucGFyc2UodmFsdWUpLFxuICAgIC8vIHBhc3MgdGhyb3VnaCBudWxsIG9yIHVuZGVmaW5lZCB1c2luZyBgdmFsdWUgPT0gbnVsbGBcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBhbnlbXSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59O1xuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGF0ZTogQXR0cmlidXRlQ29udmVydGVyPERhdGU+ID0ge1xuICAgIC8vIGBuZXcgRGF0ZSgpYCB3aWxsIHJldHVybiBhbiBgSW52YWxpZCBEYXRlYCBmb3IgZW1wdHkgc3RyaW5ncyAtIHdlIGNvbnNpZGVyIGl0IG51bGxcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpID8gbnVsbCA6IG5ldyBEYXRlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogRGF0ZSB8IG51bGwpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufVxuIiwiY29uc3QgRklSU1QgPSAvXlteXS87XG5jb25zdCBTUEFDRVMgPSAvXFxzKyhbXFxTXSkvZztcbmNvbnN0IENBTUVMUyA9IC9bYS16XShbQS1aXSkvZztcbmNvbnN0IEtFQkFCUyA9IC8tKFthLXpdKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZy5yZXBsYWNlKEZJUlNULCBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSkgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gS0VCQUJTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1sxXS50b1VwcGVyQ2FzZSgpKTtcblxuICAgICAgICAgICAgS0VCQUJTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5jYXBpdGFsaXplKHN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZWJhYkNhc2UgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBtYXRjaGVzO1xuXG4gICAgaWYgKHN0cmluZykge1xuXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gU1BBQ0VTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgJy0nICsgbWF0Y2hlc1sxXSk7XG5cbiAgICAgICAgICAgIFNQQUNFUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKChtYXRjaGVzID0gQ0FNRUxTLmV4ZWMoc3RyaW5nKSkpIHtcblxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobWF0Y2hlc1swXSwgbWF0Y2hlc1swXVswXSArICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBDQU1FTFMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcudG9Mb3dlckNhc2UoKSA6IHN0cmluZztcbn1cbiIsImltcG9ydCB7IEN1c3RvbUVsZW1lbnQgfSBmcm9tICcuLi9jdXN0b20tZWxlbWVudCc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXIsIEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQgfSBmcm9tICcuL2F0dHJpYnV0ZS1jb252ZXJ0ZXInO1xuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnLi91dGlscy9zdHJpbmctdXRpbHMnO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlZmxlY3QgYW4gYXR0cmlidXRlIHZhbHVlIHRvIGEgcHJvcGVydHlcbiAqL1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDdXN0b21FbGVtZW50ID0gQ3VzdG9tRWxlbWVudD4gPSAodGhpczogVHlwZSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmVmbGVjdCBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIGF0dHJpYnV0ZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ3VzdG9tRWxlbWVudCA9IEN1c3RvbUVsZW1lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBkaXNwYXRjaCBhIGN1c3RvbSBldmVudCBmb3IgYSBwcm9wZXJ0eSBjaGFuZ2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlOb3RpZmllcjxUeXBlIGV4dGVuZHMgQ3VzdG9tRWxlbWVudCA9IEN1c3RvbUVsZW1lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gYHRydWVgIGlmIHRoZSBgb2xkVmFsdWVgIGFuZCB0aGUgYG5ld1ZhbHVlYCBvZiBhIHByb3BlcnR5IGFyZSBkaWZmZXJlbnQsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9XG4gKlxuICogQHBhcmFtIHJlZmxlY3RvciBBIHJlZmxlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0F0dHJpYnV0ZVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgQXR0cmlidXRlUmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVJlZmxlY3RvciAocmVmbGVjdG9yOiBhbnkpOiByZWZsZWN0b3IgaXMgUHJvcGVydHlSZWZsZWN0b3Ige1xuXG4gICAgcmV0dXJuIHR5cGVvZiByZWZsZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn1cbiAqXG4gKiBAcGFyYW0gbm90aWZpZXIgQSBub3RpZmllciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Tm90aWZpZXIgKG5vdGlmaWVyOiBhbnkpOiBub3RpZmllciBpcyBQcm9wZXJ0eU5vdGlmaWVyIHtcblxuICAgIHJldHVybiB0eXBlb2Ygbm90aWZpZXIgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gZGV0ZWN0b3IgQSBkZXRlY3RvciB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgKGRldGVjdG9yOiBhbnkpOiBkZXRlY3RvciBpcyBQcm9wZXJ0eUNoYW5nZURldGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgZGV0ZWN0b3IgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgUHJvcGVydHlLZXl9XG4gKlxuICogQHBhcmFtIGtleSBBIHByb3BlcnR5IGtleSB0byB0ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5S2V5IChrZXk6IGFueSk6IGtleSBpcyBQcm9wZXJ0eUtleSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGtleSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGtleSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIHN0cmluZyBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlIHJlbW92aW5nIGludmFsaWQgYXR0cmlidXRlIGNoYXJhY3RlcnNcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQSBzdHJpbmcgdG8gZW5jb2RlIGZvciB1c2UgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqIEByZXR1cm5zICAgICBBbiBlbmNvZGVkIHN0cmluZyB1c2FibGUgYXMgaHRtbCBhdHRyaWJ1dGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUF0dHJpYnV0ZSAodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4ga2ViYWJDYXNlKHZhbHVlLnJlcGxhY2UoL1xcVysvZywgJy0nKS5yZXBsYWNlKC9cXC0kLywgJycpKTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXR0cmlidXRlIG5hbWUgZnJvbSBhIHByb3BlcnR5IGtleVxuICpcbiAqIEByZW1hcmtzXG4gKiBOdW1lcmljIHByb3BlcnR5IGluZGV4ZXMgb3Igc3ltYm9scyBjYW4gY29udGFpbiBpbnZhbGlkIGNoYXJhY3RlcnMgZm9yIGF0dHJpYnV0ZSBuYW1lcy4gVGhpcyBtZXRob2RcbiAqIHNhbml0aXplcyB0aG9zZSBjaGFyYWN0ZXJzIGFuZCByZXBsYWNlcyBzZXF1ZW5jZXMgb2YgaW52YWxpZCBjaGFyYWN0ZXJzIHdpdGggYSBkYXNoLlxuICogQXR0cmlidXRlIG5hbWVzIGFyZSBub3QgYWxsb3dlZCB0byBzdGFydCB3aXRoIG51bWJlcnMgZWl0aGVyIGFuZCBhcmUgcHJlZml4ZWQgd2l0aCAnYXR0ci0nLlxuICpcbiAqIE4uQi46IFdoZW4gdXNpbmcgY3VzdG9tIHN5bWJvbHMgYXMgcHJvcGVydHkga2V5cywgdXNlIHVuaXF1ZSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzeW1ib2xzIHRvIGF2b2lkXG4gKiBjbGFzaGluZyBhdHRyaWJ1dGUgbmFtZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgYSA9IFN5bWJvbCgpO1xuICogY29uc3QgYiA9IFN5bWJvbCgpO1xuICpcbiAqIGEgIT09IGI7IC8vIHRydWVcbiAqXG4gKiBjcmVhdGVBdHRyaWJ1dGVOYW1lKGEpICE9PSBjcmVhdGVBdHRyaWJ1dGVOYW1lKGIpOyAvLyBmYWxzZSAtLT4gJ2F0dHItc3ltYm9sJyA9PT0gJ2F0dHItc3ltYm9sJ1xuICpcbiAqIGNvbnN0IGMgPSBTeW1ib2woJ2MnKTtcbiAqIGNvbnN0IGQgPSBTeW1ib2woJ2QnKTtcbiAqXG4gKiBjICE9PSBkOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShjKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShkKTsgLy8gdHJ1ZSAtLT4gJ2F0dHItc3ltYm9sLWMnID09PSAnYXR0ci1zeW1ib2wtZCdcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgYXR0cmlidXRlIG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZU5hbWUgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IHN0cmluZyB7XG5cbiAgICBpZiAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIHJldHVybiBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgYXR0cmlidXRlIG5hbWVzLCBpZiBzeW1ib2xzIGRvbid0IGhhdmUgdW5pcXVlIGRlc2NyaXB0aW9uXG4gICAgICAgIHJldHVybiBgYXR0ci0keyBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSkgfWA7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBldmVudCBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogRXZlbnQgbmFtZXMgZG9uJ3QgaGF2ZSB0aGUgc2FtZSByZXN0cmljdGlvbnMgYXMgYXR0cmlidXRlIG5hbWVzIHdoZW4gaXQgY29tZXMgdG8gaW52YWxpZFxuICogY2hhcmFjdGVycy4gSG93ZXZlciwgZm9yIGNvbnNpc3RlbmNpZXMgc2FrZSwgd2UgYXBwbHkgdGhlIHNhbWUgcnVsZXMgZm9yIGV2ZW50IG5hbWVzIGFzXG4gKiBmb3IgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIEEgcHJvcGVydHkga2V5IHRvIGNvbnZlcnQgdG8gYW4gYXR0cmlidXRlIG5hbWVcbiAqIEBwYXJhbSBwcmVmaXggICAgICAgIEFuIG9wdGlvbmFsIHByZWZpeCwgZS5nLjogJ29uJ1xuICogQHBhcmFtIHN1ZmZpeCAgICAgICAgQW4gb3B0aW9uYWwgc3VmZml4LCBlLmcuOiAnY2hhbmdlZCdcbiAqIEByZXR1cm5zICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgZXZlbnQgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnROYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHByZWZpeD86IHN0cmluZywgc3VmZml4Pzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIGxldCBwcm9wZXJ0eVN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGtlYmFiQ2FzZShwcm9wZXJ0eUtleSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXMgY291bGQgY3JlYXRlIG11bHRpcGxlIGlkZW50aWNhbCBldmVudCBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICBwcm9wZXJ0eVN0cmluZyA9IGVuY29kZUF0dHJpYnV0ZShTdHJpbmcocHJvcGVydHlLZXkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7IHByZWZpeCA/IGAkeyBrZWJhYkNhc2UocHJlZml4KSB9LWAgOiAnJyB9JHsgcHJvcGVydHlTdHJpbmcgfSR7IHN1ZmZpeCA/IGAtJHsga2ViYWJDYXNlKHN1ZmZpeCkgfWAgOiAnJyB9YDtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBDdXN0b21FbGVtZW50fSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIEN1c3RvbUVsZW1lbnQgPSBDdXN0b21FbGVtZW50PiB7XG4gICAgLyoqXG4gICAgICogRG9lcyBwcm9wZXJ0eSBoYXZlIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBObyBhdHRyaWJ1dGUgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBUaGUgYXR0cmlidXRlIG5hbWUgd2lsbCBiZSBpbmZlcnJlZCBieSBjYW1lbC1jYXNpbmcgdGhlIHByb3BlcnR5IG5hbWVcbiAgICAgKiAqIGBzdHJpbmdgOiBVc2UgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgYXR0cmlidXRlOiBib29sZWFuIHwgc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9taXplIHRoZSBjb252ZXJzaW9uIG9mIHZhbHVlcyBiZXR3ZWVuIHByb3BlcnR5IGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDb252ZXJ0ZXJzIGFyZSBvbmx5IHVzZWQgd2hlbiB7QGxpbmsgcmVmbGVjdFByb3BlcnR5fSBhbmQvb3Ige0BsaW5rIHJlZmxlY3RBdHRyaWJ1dGV9IGFyZSBzZXQgdG8gdHJ1ZS5cbiAgICAgKiBJZiBjdXN0b20gcmVmbGVjdG9ycyBhcmUgdXNlZCwgdGhleSBoYXZlIHRvIHRha2UgY2FyZSBvciBjb252ZXJ0aW5nIHRoZSBwcm9wZXJ0eS9hdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYEFUVFJJQlVURV9DT05WRVJURVJTLmRlZmF1bHRgXG4gICAgICovXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI7XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlJ3MgdmFsdWUgYmUgYXV0b21hdGljYWxseSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5P1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQb3NzaWJsZSB2YWx1ZXM6XG4gICAgICogKiBgZmFsc2VgOiBUaGUgYXR0cmlidXRlIHZhbHVlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCB0byB0aGUgcHJvcGVydHkgYXV0b21hdGljYWxseVxuICAgICAqICogYHRydWVgOiBBbnkgYXR0cmlidXRlIGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBwcm9wZXJ0eSB1c2luZyB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBBIG1ldGhvZCBvbiB0aGUgY3VzdG9tIGVsZW1lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBhdHRyaWJ1dGUgcmVmbGVjdGlvblxuICAgICAqICogYEZ1bmN0aW9uYDogVGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIGl0cyBgdGhpc2AgY29udGV4dCBib3VuZCB0byB0aGUgY3VzdG9tIGVsZW1lbnQgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIHRoZSBwcm9wZXJ0eSB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBwcm9wZXJ0eSB2YWx1ZSB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGB0cnVlYDogQW55IHByb3BlcnR5IGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSB1c2luZyB0aGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjdXN0b20gZWxlbWVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIHByb3BlcnR5IHJlZmxlY3Rpb25cbiAgICAgKiAqIGBGdW5jdGlvbmA6IFRoZSBwcm92aWRlZCBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgd2l0aCBpdHMgYHRoaXNgIGNvbnRleHQgYm91bmQgdG8gdGhlIGN1c3RvbSBlbGVtZW50IGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICByZWZsZWN0UHJvcGVydHk6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgUHJvcGVydHlSZWZsZWN0b3I8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgYSBwcm9wZXJ0eSB2YWx1ZSBjaGFuZ2UgcmFpc2UgYSBjdXN0b20gZXZlbnQ/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IGNyZWF0ZSBhIGN1c3RvbSBldmVudCBmb3IgdGhpcyBwcm9wZXJ0eVxuICAgICAqICogYHRydWVgOiBDcmVhdGUgY3VzdG9tIGV2ZW50cyBmb3IgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5XG4gICAgICogKiBgUHJvcGVydHlLZXlgOiBVc2UgdGhlIG1ldGhvZCB3aXRoIHRoaXMgcHJvcGVydHkga2V5IG9uIHRoZSBjdXN0b20gZWxlbWVudCB0byBjcmVhdGUgY3VzdG9tIGV2ZW50c1xuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gdG8gY3JlYXRlIGN1c3RvbSBldmVudHMgKGB0aGlzYCBjb250ZXh0IHdpbGwgYmUgdGhlIGN1c3RvbSBlbGVtZW50IGluc3RhbmNlKVxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgbm90aWZ5OiBib29sZWFuIHwga2V5b2YgVHlwZSB8IFByb3BlcnR5Tm90aWZpZXI8VHlwZT47XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgaG93IGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgbW9uaXRvcmVkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEJ5IGRlZmF1bHQgYSBkZWNvcmF0ZWQgcHJvcGVydHkgd2lsbCBiZSBvYnNlcnZlZCBmb3IgY2hhbmdlcyAodGhyb3VnaCBhIGN1c3RvbSBzZXR0ZXIgZm9yIHRoZSBwcm9wZXJ0eSkuXG4gICAgICogQW55IGBzZXRgLW9wZXJhdGlvbiBvZiB0aGlzIHByb3BlcnR5IHdpbGwgdGhlcmVmb3JlIHJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjdXN0b20gZWxlbWVudCBhbmQgaW5pdGlhdGVcbiAgICAgKiBhIHJlbmRlciBhcyB3ZWxsIGFzIHJlZmxlY3Rpb24gYW5kIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IERvbid0IG9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5ICh0aGlzIHdpbGwgYnlwYXNzIHJlbmRlciwgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uKVxuICAgICAqICogYHRydWVgOiBPYnNlcnZlIGNoYW5nZXMgb2YgdGhpcyBwcm9wZXJ0eSB1c2luZyB0aGUge0BsaW5rIERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SfVxuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSBwcm92aWRlZCBtZXRob2QgdG8gY2hlY2sgaWYgcHJvcGVydHkgdmFsdWUgaGFzIGNoYW5nZWRcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYCAodXNlcyB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9IGludGVybmFsbHkpXG4gICAgICovXG4gICAgb2JzZXJ2ZTogYm9vbGVhbiB8IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3I7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gKlxuICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAqIEByZXR1cm5zICAgICAgICAgQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGNoYW5nZWRcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SOiBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHtcbiAgICAvLyBpbiBjYXNlIGBvbGRWYWx1ZWAgYW5kIGBuZXdWYWx1ZWAgYXJlIGBOYU5gLCBgKE5hTiAhPT0gTmFOKWAgcmV0dXJucyBgdHJ1ZWAsXG4gICAgLy8gYnV0IGAoTmFOID09PSBOYU4gfHwgTmFOID09PSBOYU4pYCByZXR1cm5zIGBmYWxzZWBcbiAgICByZXR1cm4gb2xkVmFsdWUgIT09IG5ld1ZhbHVlICYmIChvbGRWYWx1ZSA9PT0gb2xkVmFsdWUgfHwgbmV3VmFsdWUgPT09IG5ld1ZhbHVlKTtcbn07XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIEN1c3RvbUVsZW1lbnR9IHByb3BlcnR5IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OOiBQcm9wZXJ0eURlY2xhcmF0aW9uID0ge1xuICAgIGF0dHJpYnV0ZTogdHJ1ZSxcbiAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlckRlZmF1bHQsXG4gICAgcmVmbGVjdEF0dHJpYnV0ZTogdHJ1ZSxcbiAgICByZWZsZWN0UHJvcGVydHk6IHRydWUsXG4gICAgbm90aWZ5OiB0cnVlLFxuICAgIG9ic2VydmU6IERFRkFVTFRfUFJPUEVSVFlfQ0hBTkdFX0RFVEVDVE9SLFxufTtcbiIsImltcG9ydCB7IHJlbmRlciwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBMaXN0ZW5lckRlY2xhcmF0aW9uIH0gZnJvbSAnLi9kZWNvcmF0b3JzL2xpc3RlbmVyJztcbmltcG9ydCB7IEF0dHJpYnV0ZVJlZmxlY3RvciwgY3JlYXRlRXZlbnROYW1lLCBpc0F0dHJpYnV0ZVJlZmxlY3RvciwgaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yLCBpc1Byb3BlcnR5S2V5LCBpc1Byb3BlcnR5Tm90aWZpZXIsIGlzUHJvcGVydHlSZWZsZWN0b3IsIFByb3BlcnR5RGVjbGFyYXRpb24sIFByb3BlcnR5Tm90aWZpZXIsIFByb3BlcnR5UmVmbGVjdG9yIH0gZnJvbSBcIi4vZGVjb3JhdG9ycy9wcm9wZXJ0eS1kZWNsYXJhdGlvblwiO1xuXG5jb25zdCBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SID0gKGF0dHJpYnV0ZVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgYXR0cmlidXRlIHJlZmxlY3RvciAkeyBTdHJpbmcoYXR0cmlidXRlUmVmbGVjdG9yKSB9LmApO1xuY29uc3QgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SID0gKHByb3BlcnR5UmVmbGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSByZWZsZWN0b3IgJHsgU3RyaW5nKHByb3BlcnR5UmVmbGVjdG9yKSB9LmApO1xuY29uc3QgUFJPUEVSVFlfTk9USUZJRVJfRVJST1IgPSAocHJvcGVydHlOb3RpZmllcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgbm90aWZpZXIgJHsgU3RyaW5nKHByb3BlcnR5Tm90aWZpZXIpIH0uYCk7XG5jb25zdCBDSEFOR0VfREVURUNUT1JfRVJST1IgPSAoY2hhbmdlRGV0ZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvciAkeyBTdHJpbmcoY2hhbmdlRGV0ZWN0b3IpIH0uYCk7XG5cbi8qKlxuICogRXh0ZW5kcyB0aGUgc3RhdGljIHtAbGluayBMaXN0ZW5lckRlY2xhcmF0aW9ufSB0byBpbmNsdWRlIHRoZSBib3VuZCBsaXN0ZW5lclxuICogZm9yIGEgY3VzdG9tIGVsZW1lbnQgaW5zdGFuY2UuXG4gKi9cbmludGVyZmFjZSBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gZXh0ZW5kcyBMaXN0ZW5lckRlY2xhcmF0aW9uIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBib3VuZCBsaXN0ZW5lciB3aWxsIGJlIHN0b3JlZCBoZXJlLCBzbyBpdCBjYW4gYmUgcmVtb3ZlZCBpdCBsYXRlclxuICAgICAqL1xuICAgIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGV2ZW50IHRhcmdldCB3aWxsIGFsd2F5cyBiZSByZXNvbHZlZCB0byBhbiBhY3R1YWwge0BsaW5rIEV2ZW50VGFyZ2V0fVxuICAgICAqL1xuICAgIHRhcmdldDogRXZlbnRUYXJnZXQ7XG59XG5cbi8qKlxuICogVGhlIGN1c3RvbSBlbGVtZW50IGJhc2UgY2xhc3NcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VzdG9tIGVsZW1lbnQncyBzZWxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHtAbGluayBjdXN0b21FbGVtZW50fSBkZWNvcmF0b3IncyBzZWxlY3RvciBvcHRpb24sIGlmIHByb3ZpZGVkLlxuICAgICAqIE90aGVyd2lzZSB0aGUgZGVjb3JhdG9yIHdpbGwgdXNlIHRoaXMgcHJvcGVydHkgdG8gZGVmaW5lIHRoZSBjdXN0b20gZWxlbWVudC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2VsZWN0b3I6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFVzZSBTaGFkb3cgRE9NXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgc2V0IGJ5IHRoZSB7QGxpbmsgY3VzdG9tRWxlbWVudH0gZGVjb3JhdG9yJ3Mgc2hhZG93IG9wdGlvbiAoZGVmYXVsdHMgdG8gYHRydWVgKS5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2hhZG93OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgYXR0cmlidXRlIG5hbWVzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGtleXNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3RhdGljIGF0dHJpYnV0ZXM6IE1hcDxzdHJpbmcsIFByb3BlcnR5S2V5PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHN0YXRpYyBwcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIFByb3BlcnR5RGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgb2YgcHJvcGVydHkga2V5cyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3RhdGljIGxpc3RlbmVyczogTWFwPFByb3BlcnR5S2V5LCBMaXN0ZW5lckRlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRvIHNwZWNpZnkgYXR0cmlidXRlcyB3aGljaCBzaG91bGQgYmUgb2JzZXJ2ZWQsIGJ1dCBkb24ndCBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtcbiAgICAgKiBGb3IgcHJvcGVydGllcyB3aGljaCBhcmUgZGVjb3JhdGVkIHdpdGggdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGVcbiAgICAgKiBpcyBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgYW5kIGRvZXMgbm90IG5lZWQgdG8gYmUgc3BlY2lmaWVkIGhlcmUuIEZvdCBhdHRyaWJ1dGVzIHRoYXQgZG9uJ3RcbiAgICAgKiBoYXZlIGFuIGFzc29jaWF0ZWQgcHJvcGVydHksIHJldHVybiB0aGUgYXR0cmlidXRlIG5hbWVzIGluIHRoaXMgZ2V0dGVyLiBDaGFuZ2VzIHRvIHRoZXNlXG4gICAgICogYXR0cmlidXRlcyBjYW4gYmUgaGFuZGxlZCBpbiB0aGUge0BsaW5rIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja30gbWV0aG9kLlxuICAgICAqXG4gICAgICogV2hlbiBleHRlbmRpbmcgY3VzdG9tIGVsZW1lbnRzLCBtYWtlIHN1cmUgdG8gcmV0dXJuIHRoZSBzdXBlciBjbGFzcydzIG9ic2VydmVkQXR0cmlidXRlc1xuICAgICAqIGlmIHlvdSBvdmVycmlkZSB0aGlzIGdldHRlciAoZXhjZXB0IGlmIHlvdSBkb24ndCB3YW50IHRvIGluaGVyaXQgb2JzZXJ2ZWQgYXR0cmlidXRlcyk6XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGN1c3RvbUVsZW1lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgTXlCYXNlRWxlbWVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICByZXR1cm4gWy4uLnN1cGVyLm9ic2VydmVkQXR0cmlidXRlcywgJ215LWFkZGl0aW9uYWwtYXR0cmlidXRlJ107XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBfcmVuZGVyUm9vdDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG5cbiAgICBwcm90ZWN0ZWQgX3VwZGF0ZVJlcXVlc3Q6IFByb21pc2U8Ym9vbGVhbj4gPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICBwcm90ZWN0ZWQgX2NoYW5nZWRQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgX3JlZmxlY3RpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgX25vdGlmeWluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBfbGlzdGVuZXJEZWNsYXJhdGlvbnM6IEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbltdID0gW107XG5cbiAgICBwcm90ZWN0ZWQgX2lzQ29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICBwcm90ZWN0ZWQgX2hhc1VwZGF0ZWQgPSBmYWxzZTtcblxuICAgIHByb3RlY3RlZCBfaGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICBwcm90ZWN0ZWQgX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGN1c3RvbSBlbGVtZW50J3Mge0BsaW5rIGNvbm5lY3RlZENhbGxiYWNrfSB3YXMgZXhlY3V0ZWQuXG4gICAgICovXG4gICAgZ2V0IGlzQ29ubmVjdGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IgKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyUm9vdCA9IHRoaXMuY3JlYXRlUmVuZGVyUm9vdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBtb3ZlZCB0byBhIG5ldyBkb2N1bWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKi9cbiAgICBhZG9wdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnYWRvcHRlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9saXN0ZW4oKTtcblxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgZG9jdW1lbnQncyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fdW5saXN0ZW4oKTtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIG9uZSBvZiB0aGUgY3VzdG9tIGVsZW1lbnQncyBhdHRyaWJ1dGVzIGlzIGFkZGVkLCByZW1vdmVkLCBvciBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdoaWNoIGF0dHJpYnV0ZXMgdG8gbm90aWNlIGNoYW5nZSBmb3IgaXMgc3BlY2lmaWVkIGluIHtAbGluayBvYnNlcnZlZEF0dHJpYnV0ZXN9LlxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1dlYl9Db21wb25lbnRzL1VzaW5nX2N1c3RvbV9lbGVtZW50cyNVc2luZ190aGVfbGlmZWN5Y2xlX2NhbGxiYWNrc1xuICAgICAqXG4gICAgICogRm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzIHdpdGggYW4gYXNzb2NpYXRlZCBhdHRyaWJ1dGUsIHRoaXMgaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5LlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gdG8gY3VzdG9taXplIHRoZSBoYW5kbGluZyBvZiBhdHRyaWJ1dGUgY2hhbmdlcy4gV2hlbiBvdmVycmlkaW5nXG4gICAgICogdGhpcyBtZXRob2QsIGEgc3VwZXItY2FsbCBzaG91bGQgYmUgaW5jbHVkZWQsIHRvIGVuc3VyZSBhdHRyaWJ1dGUgY2hhbmdlcyBmb3IgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgKiBhcmUgcHJvY2Vzc2VkIGNvcnJlY3RseS5cbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY3VzdG9tRWxlbWVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDdXN0b21FbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuICAgICAqXG4gICAgICogICAgICAgICAgc3VwZXIuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgKlxuICAgICAqICAgICAgICAgIC8vIGRvIGN1c3RvbSBoYW5kbGluZy4uLlxuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGUgVGhlIG5hbWUgb2YgdGhlIGNoYW5nZWQgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlICBUaGUgb2xkIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayAoYXR0cmlidXRlOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkge1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1JlZmxlY3RpbmcpIHJldHVybjtcblxuICAgICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB0aGlzLnJlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCB1cGRhdGVzXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlZFByb3BlcnRpZXMgQSBtYXAgb2YgcHJvcGVydGllcyB0aGF0IGNoYW5nZWQgaW4gdGhlIHVwZGF0ZSwgY29udGFpbmcgdGhlIHByb3BlcnR5IGtleSBhbmQgdGhlIG9sZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBmaXJzdFVwZGF0ZSAgICAgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIHdhcyB0aGUgZmlyc3QgdXBkYXRlXG4gICAgICovXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZWRQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4sIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5TGlmZWN5Y2xlKCd1cGRhdGUnLCB7IGZpcnN0VXBkYXRlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGN1c3RvbSBlbGVtZW50J3MgcmVuZGVyIHJvb3RcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIHJlbmRlciByb290IGlzIHdoZXJlIHRoZSB7QGxpbmsgcmVuZGVyfSBtZXRob2Qgd2lsbCBhdHRhY2ggaXRzIERPTSBvdXRwdXQuXG4gICAgICogV2hlbiB1c2luZyB0aGUgY3VzdG9tIGVsZW1lbnQgd2l0aCBzaGFkb3cgbW9kZSwgaXQgd2lsbCBiZSBhIHNoYWRvdyByb290LFxuICAgICAqIG90aGVyd2lzZSBpdCB3aWxsIGJlIHRoZSBjdXN0b20gZWxlbWVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBUT0RPOiBDYW4gc2xvdHMgYmUgdXNlZCB3aXRob3V0IHNoYWRvdyBET00/XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVJlbmRlclJvb3QgKCk6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIEN1c3RvbUVsZW1lbnQpLnNoYWRvdyA/XG4gICAgICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KSA6XG4gICAgICAgICAgICB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHRlbXBsYXRlIG9mIHRoZSBjdXN0b20gZWxlbWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBPdmVycmlkZSB0aGlzIG1ldGhvZCB0byBwcm92aWRlIGEgdGVtcGxhdGUgZm9yIHlvdXIgY3VzdG9tIGVsZW1lbnQuIFRoZSBtZXRob2QgbXVzdFxuICAgICAqIHJldHVybiBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0gd2hpY2ggaXMgY3JlYXRlZCB1c2luZyBsaXQtaHRtbCdzXG4gICAgICoge0BsaW5rIGxpdC1odG1sI2h0bWwgfCBgaHRtbGB9IG9yIHtAbGluayBsaXQtaHRtbCNzdmcgfCBgc3ZnYH0gdGVtcGxhdGUgbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIFJldHVybiBub3RoaW5nIGlmIHlvdXIgY29tcG9uZW50IGRvZXMgbm90IG5lZWQgdG8gcmVuZGVyIGEgdGVtcGxhdGUuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbiAgICAgKlxuICAgICAqIEBjdXN0b21FbGVtZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIEN1c3RvbUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICAgbXlQcm9wZXJ0eSA9ICdIZWxsbyc7XG4gICAgICpcbiAgICAgKiAgICAgIHRlbXBsYXRlICgpIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIGh0bWxgPGgxPiR7dGhpcy5teVByb3BlcnR5fSBXb3JsZCE8L2gxPmA7XG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB0ZW1wbGF0ZSAoKTogVGVtcGxhdGVSZXN1bHQgfCB2b2lkIHsgfVxuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0aGUgY3VzdG9tIGVsZW1lbnQncyB0ZW1wbGF0ZSB0byBpdHMge0BsaW5rIF9yZW5kZXJSb290fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBVc2VzIGxpdC1odG1sJ3Mge0BsaW5rIGxpdC1odG1sI3JlbmRlcn0gbWV0aG9kIHRvIHJlbmRlciBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoKSB7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKCk7XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlKSByZW5kZXIodGVtcGxhdGUsIHRoaXMuX3JlbmRlclJvb3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoIHByb3BlcnR5IGNoYW5nZXMgb2NjdXJyaW5nIGluIHRoZSBleGVjdXRvciBhbmQgcmFpc2UgY3VzdG9tIGV2ZW50c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIHNob3VsZCB0cmlnZ2VyIGN1c3RvbSBldmVudHMgd2hlbiB0aGV5IGFyZSBjYXVzZWQgYnkgaW50ZXJuYWwgc3RhdGUgY2hhbmdlcyxcbiAgICAgKiBidXQgbm90IGlmIHRoZXkgYXJlIGNhdXNlZCBieSBhIGNvbnN1bWVyIG9mIHRoZSBjdXN0b20gZWxlbWVudCBBUEkgZGlyZWN0bHksIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbXktY3VzdG9tLWVsZW1lbnQnKS5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogYGBgLlxuICAgICAqXG4gICAgICogVGhpcyBtZWFucywgd2UgY2Fubm90IGF1dG9tYXRlIHRoaXMgcHJvY2VzcyB0aHJvdWdoIHByb3BlcnR5IHNldHRlcnMsIGFzIHdlIGNhbid0IGJlIHN1cmUgd2hvXG4gICAgICogaW52b2tlZCB0aGUgc2V0dGVyIC0gaW50ZXJuYWwgY2FsbHMgb3IgZXh0ZXJuYWwgY2FsbHMuXG4gICAgICpcbiAgICAgKiBPbmUgb3B0aW9uIGlzIHRvIG1hbnVhbGx5IHJhaXNlIHRoZSBldmVudCwgd2hpY2ggY2FuIGJlY29tZSB0ZWRpb3VzIGFuZCBmb3JjZXMgdXMgdG8gdXNlIHN0cmluZy1cbiAgICAgKiBiYXNlZCBldmVudCBuYW1lcyBvciBwcm9wZXJ0eSBuYW1lcywgd2hpY2ggYXJlIGRpZmZpY3VsdCB0byByZWZhY3RvciwgZS5nLjpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAvLyBpZiB3ZSByZWZhY3RvciB0aGUgcHJvcGVydHkgbmFtZSwgd2UgY2FuIGVhc2lseSBtaXNzIHRoZSBub3RpZnkgY2FsbFxuICAgICAqIHRoaXMubm90aWZ5KCdjdXN0b21Qcm9wZXJ0eScpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQSBtb3JlIGNvbnZlbmllbnQgd2F5IGlzIHRvIGV4ZWN1dGUgdGhlIGludGVybmFsIGNoYW5nZXMgaW4gYSB3cmFwcGVyIHdoaWNoIGNhbiBkZXRlY3QgdGhlIGNoYW5nZWRcbiAgICAgKiBwcm9wZXJ0aWVzIGFuZCB3aWxsIGF1dG9tYXRpY2FsbHkgcmFpc2UgdGhlIHJlcXVpcmVkIGV2ZW50cy4gVGhpcyBlbGltaW5hdGVzIHRoZSBuZWVkIHRvIG1hbnVhbGx5XG4gICAgICogcmFpc2UgZXZlbnRzIGFuZCByZWZhY3RvcmluZyBkb2VzIG5vIGxvbmdlciBhZmZlY3QgdGhlIHByb2Nlc3MuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy53YXRjaCgoKSA9PiB7XG4gICAgICpcbiAgICAgKiAgICAgIHRoaXMuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqICAgICAgLy8gd2UgY2FuIGFkZCBtb3JlIHByb3BlcnR5IG1vZGlmaWNhdGlvbnMgdG8gbm90aWZ5IGluIGhlcmVcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBleGVjdXRvciBBIGZ1bmN0aW9uIHRoYXQgcGVyZm9ybXMgdGhlIGNoYW5nZXMgd2hpY2ggc2hvdWxkIGJlIG5vdGlmaWVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHdhdGNoIChleGVjdXRvcjogKCkgPT4gdm9pZCkge1xuXG4gICAgICAgIC8vIGJhY2sgdXAgY3VycmVudCBjaGFuZ2VkIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgcHJldmlvdXNDaGFuZ2VzID0gbmV3IE1hcCh0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyk7XG5cbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgY2hhbmdlc1xuICAgICAgICBleGVjdXRvcigpO1xuXG4gICAgICAgIC8vIGFkZCBhbGwgbmV3IG9yIHVwZGF0ZWQgY2hhbmdlZCBwcm9wZXJ0aWVzIHRvIHRoZSBub3RpZnlpbmcgcHJvcGVydGllc1xuICAgICAgICBmb3IgKGNvbnN0IFtwcm9wZXJ0eUtleSwgb2xkVmFsdWVdIG9mIHRoaXMuX2NoYW5nZWRQcm9wZXJ0aWVzKSB7XG5cbiAgICAgICAgICAgIGlmICghcHJldmlvdXNDaGFuZ2VzLmhhcyhwcm9wZXJ0eUtleSkgfHwgdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBwcmV2aW91c0NoYW5nZXMuZ2V0KHByb3BlcnR5S2V5KSwgb2xkVmFsdWUpKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGN1c3RvbSBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIHZhbHVlIG9mIGEgZGVjb3JhdGVkIHByb3BlcnR5IG9yIGl0cyBhc3NvY2lhdGVkXG4gICAgICogYXR0cmlidXRlIGNoYW5nZXMuIElmIHlvdSBuZWVkIHRoZSBjdXN0b20gZWxlbWVudCB0byB1cGRhdGUgYmFzZWQgb24gYSBzdGF0ZSBjaGFuZ2UgdGhhdCBpc1xuICAgICAqIG5vdCBjb3ZlcmVkIGJ5IGEgZGVjb3JhdGVkIHByb3BlcnR5LCBjYWxsIHRoaXMgbWV0aG9kIHdpdGhvdXQgYW55IGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIHByb3BlcnR5IHRoYXQgcmVxdWVzdHMgdGhlIHVwZGF0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICB0aGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgQSBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIHdoZW4gdGhlIHVwZGF0ZSBpcyBjb21wbGV0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVxdWVzdFVwZGF0ZSAocHJvcGVydHlLZXk/OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU/OiBhbnksIG5ld1ZhbHVlPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpKSByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcblxuICAgICAgICAgICAgLy8gc3RvcmUgY2hhbmdlZCBwcm9wZXJ0eSBmb3IgYmF0Y2ggcHJvY2Vzc2luZ1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBpbiByZWZsZWN0aW5nIHN0YXRlLCBhbiBhdHRyaWJ1dGUgaXMgcmVmbGVjdGluZyB0byB0aGlzIHByb3BlcnR5IGFuZCB3ZVxuICAgICAgICAgICAgLy8gY2FuIHNraXAgcmVmbGVjdGluZyB0aGUgcHJvcGVydHkgYmFjayB0byB0aGUgYXR0cmlidXRlXG4gICAgICAgICAgICAvLyBwcm9wZXJ0eSBjaGFuZ2VzIG5lZWQgdG8gYmUgdHJhY2tlZCBob3dldmVyIGFuZCB7QGxpbmsgcmVuZGVyfSBtdXN0IGJlIGNhbGxlZCBhZnRlclxuICAgICAgICAgICAgLy8gdGhlIGF0dHJpYnV0ZSBjaGFuZ2UgaXMgcmVmbGVjdGVkIHRvIHRoaXMgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIFRPRE86IE1heWJlIGRvbid0IHB1dCBpdCBoZXJlIGlmIG5vdCBtYXJrZWQgYXMgcmVmbGVjdGVkXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzUmVmbGVjdGluZykgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBlbnF1ZXVlIHVwZGF0ZSByZXF1ZXN0IGlmIG5vbmUgd2FzIGVucXVldWVkIGFscmVhZHlcbiAgICAgICAgICAgIHRoaXMuX2VucXVldWVVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGN1c3RvbSBlbGVtZW50IGFmdGVyIGFuIHVwZGF0ZSB3YXMgcmVxdWVzdGVkIHdpdGgge0BsaW5rIHJlcXVlc3RVcGRhdGV9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIHJlbmRlcnMgdGhlIHRlbXBsYXRlLCByZWZsZWN0cyBjaGFuZ2VkIHByb3BlcnRpZXMgdG8gYXR0cmlidXRlcyBhbmRcbiAgICAgKiBkaXNwYXRjaGVzIGNoYW5nZSBldmVudHMgZm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGUgKCkge1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gcmVmbGVjdCBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIHJlZmxlY3Rpb25cbiAgICAgICAgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWU6IGFueSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMucmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDdXN0b21FbGVtZW50XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG5vdGlmeSBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIG5vdGlmaWNhdGlvblxuICAgICAgICB0aGlzLl9ub3RpZnlpbmdQcm9wZXJ0aWVzLmZvckVhY2goKG9sZFZhbHVlLCBwcm9wZXJ0eUtleSkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDdXN0b21FbGVtZW50XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2sodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMsIHRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgIHRoaXMuX2hhc1VwZGF0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgcHJvcGVydHkgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCByZXNvbHZlcyB0aGUge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9IGZvciB0aGUgcHJvcGVydHkgYW5kIHJldHVybnMgaXRzIHJlc3VsdC5cbiAgICAgKiBJZiBub25lIGlzIGRlZmluZWQgKHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbidzIG9ic2VydmUgb3B0aW9uIGlzIGBmYWxzZWApIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBjaGFuZ2VkLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNDaGFuZ2VkIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5fZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gb2JzZXJ2ZSBpcyBlaXRoZXIgYGZhbHNlYCBvciBhIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBpc1Byb3BlcnR5Q2hhbmdlRGV0ZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKSkge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUuY2FsbChudWxsLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgdGhyb3cgQ0hBTkdFX0RFVEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIGFzc29jaWF0ZWQgcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RBdHRyaWJ1dGV9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDdXN0b21FbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSk7XG5cbiAgICAgICAgLy8gaWdub3JlIHVzZXItZGVmaW5lZCBvYnNlcnZlZCBhdHRyaWJ1dGVzXG4gICAgICAgIC8vIFRPRE86IHRlc3QgdGhpc1xuICAgICAgICBpZiAoIXByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBvYnNlcnZlZCBhdHRyaWJ1dGUgXCIkeyBhdHRyaWJ1dGVOYW1lIH1cIiBub3QgZm91bmQuLi4gaWdub3JpbmcuLi5gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuX2dldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBkb24ndCByZWZsZWN0IGlmIHtAbGluayBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGV9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzQXR0cmlidXRlUmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZS5jYWxsKHRoaXMsIGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEFUVFJJQlVURV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAodGhpc1twcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGVdIGFzIEF0dHJpYnV0ZVJlZmxlY3RvcikoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZsZWN0IGEgcHJvcGVydHkgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgYXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSByZWZsZWN0b3IuIElmIG5vdCwgaXQgd2lsbCB1c2UgdGhlIGRlZmF1bHRcbiAgICAgKiByZWZsZWN0b3Ige0BsaW5rIF9yZWZsZWN0UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5fZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgLy8gZG9uJ3QgcmVmbGVjdCBpZiB7QGxpbmsgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHl9IGlzIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSB7XG5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayBpcyBjYWxsZWQgc3luY2hyb25vdXNseSwgd2UgY2FuIGNhdGNoIHRoZSBzdGF0ZSB0aGVyZVxuICAgICAgICAgICAgdGhpcy5faXNSZWZsZWN0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9SRUZMRUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHldIGFzIFByb3BlcnR5UmVmbGVjdG9yKShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmFpc2UgYW4gZXZlbnQgZm9yIGEgcHJvcGVydHkgY2hhbmdlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWV0aG9kIGNoZWNrcywgaWYgYW55IGN1c3RvbSB7QGxpbmsgUHJvcGVydHlOb3RpZmllcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIG5vdGlmaWVyLiBJZiBub3QsIGl0IHdpbGwgdXNlIHRoZSBkZWZhdWx0XG4gICAgICogbm90aWZpZXIge0BsaW5rIF9ub3RpZnlQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJhaXNlIGFuIGV2ZW50IGZvclxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG5vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5fZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpIHtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlOb3RpZmllcihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnldIGFzIFByb3BlcnR5Tm90aWZpZXIpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgcmVmbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIElmIG5vIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGlzIGRlZmluZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSB0aGlzXG4gICAgICogbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCB0aGUgYXR0cmlidXRlIHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIHByb3BlcnR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byByZWZsZWN0XG4gICAgICogQHBhcmFtIG9sZFZhbHVlICAgICAgVGhlIG9sZCBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3JlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDdXN0b21FbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5S2V5ID0gY29uc3RydWN0b3IuYXR0cmlidXRlcy5nZXQoYXR0cmlidXRlTmFtZSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLl9nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLmZyb21BdHRyaWJ1dGUobmV3VmFsdWUpO1xuXG4gICAgICAgIHRoaXNbcHJvcGVydHlLZXkgYXMga2V5b2YgdGhpc10gPSBwcm9wZXJ0eVZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IHByb3BlcnR5IHJlZmxlY3RvclxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJZiBubyB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9IGlzIGRlZmluZWQgaW4gdGhlIHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufSB0aGlzXG4gICAgICogbWV0aG9kIGlzIHVzZWQgdG8gcmVmbGVjdCB0aGUgcHJvcGVydHkgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgYXR0cmlidXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnR5IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVmbGVjdFByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcblxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGhhdmUgYSBkZWNsYXJhdGlvblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5fZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIFRPRE86IHRlc3Qgd2hhdCBoYXBwZW5zIGlmIGF0dHJpYnV0ZSBpcyBzZXQgdG8gZmFsc2UgYnV0IHJlZmxlY3RQcm9wZXJ0eSBpcyB0cnVlIVxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gcHJvcGVydHlEZWNsYXJhdGlvbi5hdHRyaWJ1dGUgYXMgc3RyaW5nO1xuICAgICAgICAvLyByZXNvbHZlIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci50b0F0dHJpYnV0ZShuZXdWYWx1ZSk7XG5cbiAgICAgICAgLy8gdW5kZWZpbmVkIG1lYW5zIGRvbid0IGNoYW5nZVxuICAgICAgICBpZiAoYXR0cmlidXRlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVsbCBtZWFucyByZW1vdmUgdGhlIGF0dHJpYnV0ZVxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIHByb3BlcnR5LWNoYW5nZWQgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbm90aWZ5UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSk6IHZvaWQge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGNyZWF0ZUV2ZW50TmFtZShwcm9wZXJ0eUtleSwgJycsICdjaGFuZ2VkJyk7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHtcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBsaWZlY3ljbGUgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBsaWZlY3ljbGUgVGhlIGxpZmVjeWNsZSBmb3Igd2hpY2ggdG8gcmFpc2UgdGhlIGV2ZW50XG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ub3RpZnlMaWZlY3ljbGUgKGxpZmVjeWNsZTogc3RyaW5nLCBkZXRhaWw/OiBvYmplY3QpIHtcblxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBjcmVhdGVFdmVudE5hbWUobGlmZWN5Y2xlLCAnb24nKTtcblxuICAgICAgICBjb25zdCBldmVudEluaXQgPSB7XG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIC4uLihkZXRhaWwgPyB7IGRldGFpbDogZGV0YWlsIH0gOiB7fSlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgZXZlbnRJbml0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZWxlbWVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfbGlzdGVuICgpIHtcblxuICAgICAgICAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ3VzdG9tRWxlbWVudCkubGlzdGVuZXJzLmZvckVhY2goKGRlY2xhcmF0aW9uLCBsaXN0ZW5lcikgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZURlY2xhcmF0aW9uOiBJbnN0YW5jZUxpc3RlbmVyRGVjbGFyYXRpb24gPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb3B5IHRoZSBjbGFzcydzIHN0YXRpYyBsaXN0ZW5lciBkZWNsYXJhdGlvbiBpbnRvIGFuIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGRlY2xhcmF0aW9uLmV2ZW50LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGRlY2xhcmF0aW9uLm9wdGlvbnMsXG5cbiAgICAgICAgICAgICAgICAvLyBiaW5kIHRoZSBjb21wb25lbnRzIGxpc3RlbmVyIG1ldGhvZCB0byB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICBsaXN0ZW5lcjogKHRoaXNbbGlzdGVuZXIgYXMga2V5b2YgdGhpc10gYXMgdW5rbm93biBhcyBFdmVudExpc3RlbmVyKS5iaW5kKHRoaXMpLFxuXG4gICAgICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBldmVudCB0YXJnZXQgYW5kIHN0b3JlIGl0IGluIHRoZSBpbnN0YW5jZSBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIHRhcmdldDogKGRlY2xhcmF0aW9uLnRhcmdldCkgP1xuICAgICAgICAgICAgICAgICAgICAodHlwZW9mIGRlY2xhcmF0aW9uLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb24udGFyZ2V0KCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb24udGFyZ2V0IDpcbiAgICAgICAgICAgICAgICAgICAgdGhpc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gYWRkIHRoZSBib3VuZCBldmVudCBsaXN0ZW5lciB0byB0aGUgdGFyZ2V0XG4gICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGluc3RhbmNlRGVjbGFyYXRpb24uZXZlbnQgYXMgc3RyaW5nLCBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLCBpbnN0YW5jZURlY2xhcmF0aW9uLm9wdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBzYXZlIHRoZSBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvbiBvbiB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5wdXNoKGluc3RhbmNlRGVjbGFyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgY3VzdG9tIGVsZW1lbnQgbGlzdGVuZXJzLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihkZWNsYXJhdGlvbi5ldmVudCBhcyBzdHJpbmcsIGRlY2xhcmF0aW9uLmxpc3RlbmVyLCBkZWNsYXJhdGlvbi5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NoZWR1bGUgdGhlIHVwZGF0ZSBvZiB0aGUgY3VzdG9tIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2NoZWR1bGVzIHRoZSB1cGRhdGUgb2YgdGhlIGN1c3RvbSBlbGVtZW50IGp1c3QgYmVmb3JlIHRoZSBuZXh0IGZyYW1lXG4gICAgICogYW5kIGNsZWFucyB1cCB0aGUgY3VzdG9tIGVsZW1lbnRzIHN0YXRlIGFmdGVyd2FyZHMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9zY2hlZHVsZVVwZGF0ZSAoKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuXG4gICAgICAgICAgICAvLyBzY2hlZHVsZSB0aGUgdXBkYXRlIHZpYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdG8gYXZvaWQgbXVsdGlwbGUgcmVkcmF3cyBwZXIgZnJhbWVcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZsZWN0aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBtYXJrIGN1c3RvbSBlbGVtZW50IGFzIHVwZGF0ZWQgYWZ0ZXIgdGhlIHVwZGF0ZSB0byBwcmV2ZW50IGluZmludGUgbG9vcHMgaW4gdGhlIHVwZGF0ZSBwcm9jZXNzXG4gICAgICAgICAgICAgICAgLy8gTi5CLjogYW55IHByb3BlcnR5IGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGUgd2lsbCBiZSBpZ25vcmVkXG4gICAgICAgICAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5xdWV1ZSBhIHJlcXVlc3QgZm9yIGFuIGFzeW5jaHJvbm91cyB1cGRhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9lbnF1ZXVlVXBkYXRlICgpIHtcblxuICAgICAgICBsZXQgcmVzb2x2ZTogKHJlc3VsdDogYm9vbGVhbikgPT4gdm9pZDtcblxuICAgICAgICBjb25zdCBwcmV2aW91c1JlcXVlc3QgPSB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuXG4gICAgICAgIC8vIG1hcmsgdGhlIGN1c3RvbSBlbGVtZW50IGFzIGhhdmluZyByZXF1ZXN0ZWQgYW4gdXBkYXRlLCB0aGUge0BsaW5rIF9yZXF1ZXN0VXBkYXRlfSBtZXRob2RcbiAgICAgICAgLy8gd2lsbCBub3QgZW5xdWV1ZSBhIGZ1cnRoZXIgcmVxdWVzdCBmb3IgdXBkYXRlIGlmIG9uZSBpcyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzID0+IHJlc29sdmUgPSByZXMpO1xuXG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB1cGRhdGUgdG8gcmVzb2x2ZVxuICAgICAgICAvLyBgYXdhaXRgIGlzIGFzeW5jaHJvbm91cyBhbmQgd2lsbCByZXR1cm4gZXhlY3V0aW9uIHRvIHRoZSB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gbWV0aG9kXG4gICAgICAgIC8vIGFuZCBlc3NlbnRpYWxseSBhbGxvd3MgdXMgdG8gYmF0Y2ggbXVsdGlwbGUgc3luY2hyb25vdXMgcHJvcGVydHkgY2hhbmdlcywgYmVmb3JlIHRoZVxuICAgICAgICAvLyBleGVjdXRpb24gY2FuIHJlc3VtZSBoZXJlXG4gICAgICAgIGF3YWl0IHByZXZpb3VzUmVxdWVzdDtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zY2hlZHVsZVVwZGF0ZSgpO1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdXBkYXRlIGlzIHNjaGVkdWxlZCBhc3luY2hyb25vdXNseSBhcyB3ZWxsXG4gICAgICAgIGF3YWl0IHJlc3VsdDtcblxuICAgICAgICAvLyByZXNvbHZlIHRoZSBuZXcge0BsaW5rIF91cGRhdGVSZXF1ZXN0fSBhZnRlciB0aGUgcmVzdWx0IG9mIHRoZSBjdXJyZW50IHVwZGF0ZSByZXNvbHZlc1xuICAgICAgICByZXNvbHZlISghdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gZm9yIGEgZGVjb3JhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIGRlY2xhcmF0aW9uXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2dldFByb3BlcnR5RGVjbGFyYXRpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVjbGFyYXRpb24gfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ3VzdG9tRWxlbWVudCkucHJvcGVydGllcy5nZXQocHJvcGVydHlLZXkpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEN1c3RvbUVsZW1lbnQgfSBmcm9tICcuLi9jdXN0b20tZWxlbWVudCc7XG5pbXBvcnQgeyBEZWNvcmF0ZWRDdXN0b21FbGVtZW50VHlwZSB9IGZyb20gJy4vcHJvcGVydHknO1xuXG4vKipcbiAqIEEge0BsaW5rIEN1c3RvbUVsZW1lbnR9IGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VzdG9tRWxlbWVudERlY2xhcmF0aW9uIHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2VsZWN0b3Igb2YgdGhlIGN1c3RvbSBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoZSBzZWxlY3RvciB3aWxsIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGN1c3RvbSBlbGVtZW50IGNvbnN0cnVjdG9yIHdpdGggdGhlIGJyb3dzZXInc1xuICAgICAqIHtAbGluayB3aW5kb3cuY3VzdG9tRWxlbWVudHN9IEFQSS4gSWYgbm8gc2VsZWN0b3IgaXMgc3BlY2lmaWVkLCB0aGUgY3VzdG9tIGVsZW1lbnQgY2xhc3NcbiAgICAgKiBuZWVkcyB0byBwcm92aWRlIG9uZSBpbiBpdHMgc3RhdGljIHtAbGluayBDdXN0b21FbGVtZW50LnNlbGVjdG9yfSBwcm9wZXJ0eS5cbiAgICAgKiBBIHNlbGVjdG9yIGRlZmluZWQgaW4gdGhlIHtAbGluayBDdXN0b21FbGVtZW50RGVjbGFyYXRpb259IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlXG4gICAgICogc3RhdGljIGNsYXNzIHByb3BlcnR5LlxuICAgICAqL1xuICAgIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTSB0byByZW5kZXIgdGhlIGN1c3RvbSBlbGVtZW50cyB0ZW1wbGF0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2hhZG93IERPTSBjYW4gYmUgZGlzYWJsZWQgYnkgc2V0dGluZyB0aGlzIG9wdGlvbiB0byBgZmFsc2VgLCBpbiB3aGljaCBjYXNlIHRoZSBjdXN0b21cbiAgICAgKiBlbGVtZW50J3MgdGVtcGxhdGUgd2lsbCBiZSByZW5kZXJlZCBhcyBjaGlsZCBub2RlcyBvZiB0aGUgY3VzdG9tIGVsZW1lbnQuIFRoaXMgY2FuIGJlXG4gICAgICogdXNlZnVsIGlmIGFuIGlzb2xhdGVkIERPTSBhbmQgc2NvcGVkIENTUyBpcyBub3QgZGVzaXJlZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHNoYWRvdzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIEF1dG9tYXRpY2FsbHkgcmVnaXN0ZXIgdGhlIGN1c3RvbSBlbGVtZW50IHdpdGggdGhlIGJyb3dzZXIncyB7QGxpbmsgd2luZG93LmN1c3RvbUVsZW1lbnRzfSBBUEk/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEluIGNhc2VzIHdoZXJlIHlvdSB3YW50IHRvIGVtcGxveSBhIG1vZHVsZSBzeXN0ZW0gd2hpY2ggcmVnaXN0ZXJzIGN1c3RvbSBlbGVtZW50cyBvblxuICAgICAqIGEgY29uZGl0aW9uYWwgYmFzaXMsIHlvdSBjYW4gZGlzYWJsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIGJ5IHNldHRpbmcgdGhpcyBvcHRpb24gdG9cbiAgICAgKiBgZmFsc2VgLiBZb3VyIG1vZHVsZSBvciBib290c3RyYXAgc3lzdGVtIHdpbGwgaGF2ZSB0byB0YWtlIGNhcmUgb2YgZGVmaW5pbmcgdGhlIGN1c3RvbVxuICAgICAqIGVsZW1lbnQgbGF0ZXIuXG4gICAgICpcbiAgICAgKiBEZWZhdWx0IHZhbHVlOiBgdHJ1ZWBcbiAgICAgKi9cbiAgICBkZWZpbmU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NVU1RPTV9FTEVNRU5UX0RFQ0xBUkFUSU9OOiBDdXN0b21FbGVtZW50RGVjbGFyYXRpb24gPSB7XG4gICAgc2VsZWN0b3I6ICcnLFxuICAgIHNoYWRvdzogdHJ1ZSxcbiAgICBkZWZpbmU6IHRydWVcbn07XG5cbi8qKlxuICogRGVjb3JhdGVzIGEge0BsaW5rIEN1c3RvbUVsZW1lbnR9IGNsYXNzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSBjdXN0b20gZWxlbWVudCBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgY3VzdG9tRWxlbWVudCA9IChvcHRpb25zOiBQYXJ0aWFsPEN1c3RvbUVsZW1lbnREZWNsYXJhdGlvbj4gPSB7fSkgPT4ge1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB7IC4uLkRFRkFVTFRfQ1VTVE9NX0VMRU1FTlRfREVDTEFSQVRJT04sIC4uLm9wdGlvbnMgfTtcblxuICAgIHJldHVybiAodGFyZ2V0OiB0eXBlb2YgQ3VzdG9tRWxlbWVudCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0IGFzIERlY29yYXRlZEN1c3RvbUVsZW1lbnRUeXBlO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yLnNlbGVjdG9yID0gZGVjbGFyYXRpb24uc2VsZWN0b3IgfHwgdGFyZ2V0LnNlbGVjdG9yO1xuICAgICAgICBjb25zdHJ1Y3Rvci5zaGFkb3cgPSBkZWNsYXJhdGlvbi5zaGFkb3c7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3BlcnR5IGRlY29yYXRvcnMgZ2V0IGNhbGxlZCBiZWZvcmUgY2xhc3MgZGVjb3JhdG9ycywgc28gYXQgdGhpcyBwb2ludCBhbGwgZGVjb3JhdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICogaGF2ZSBzdG9yZWQgdGhlaXIgYXNzb2NpYXRlZCBhdHRyaWJ1dGVzIGluIHtAbGluayBDdXN0b21FbGVtZW50LmF0dHJpYnV0ZXN9LlxuICAgICAgICAgKiBXZSBjYW4gbm93IGNvbWJpbmUgdGhlbSB3aXRoIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIEN1c3RvbUVsZW1lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSBhbmQsXG4gICAgICAgICAqIGJ5IHVzaW5nIGEgU2V0LCBlbGltaW5hdGUgYWxsIGR1cGxpY2F0ZXMgaW4gdGhlIHByb2Nlc3MuXG4gICAgICAgICAqXG4gICAgICAgICAqIEFzIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIEN1c3RvbUVsZW1lbnQub2JzZXJ2ZWRBdHRyaWJ1dGVzfSB3aWxsIGFsc28gaW5jbHVkZSBkZWNvcmF0b3IgZ2VuZXJhdGVkXG4gICAgICAgICAqIG9ic2VydmVkIGF0dHJpYnV0ZXMsIHdlIGFsd2F5cyBpbmhlcml0IGFsbCBvYnNlcnZlZCBhdHRyaWJ1dGVzIGZyb20gYSBiYXNlIGNsYXNzLiBGb3IgdGhhdCByZWFzb25cbiAgICAgICAgICogd2UgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIGF0dHJpYnV0ZSBvdmVycmlkZXMgd2hlbiBleHRlbmRpbmcgYW55IHtAbGluayBDdXN0b21FbGVtZW50fSBiYXNlIGNsYXNzLlxuICAgICAgICAgKiBUaGlzIGlzIGRvbmUgaW4gdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLiBIZXJlIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRvIHJlbW92ZSBvdmVycmlkZGVuXG4gICAgICAgICAqIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIC8vIHdlIHRha2UgdGhlIGluaGVyaXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLi4uXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub2JzZXJ2ZWRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLnJlbW92ZSBvdmVycmlkZGVuIGdlbmVyYXRlZCBhdHRyaWJ1dGVzLi4uXG4gICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKGF0dHJpYnV0ZXMsIGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuICYmIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4uaGFzKGF0dHJpYnV0ZSkgPyBbXSA6IGF0dHJpYnV0ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSBhcyBzdHJpbmdbXVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLmFuZCByZWNvbWJpbmUgdGhlIGxpc3Qgd2l0aCB0aGUgbmV3bHkgZ2VuZXJhdGVkIGF0dHJpYnV0ZXMgKHRoZSBTZXQgcHJldmVudHMgZHVwbGljYXRlcylcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChbLi4udGFyZ2V0LmF0dHJpYnV0ZXMua2V5cygpXSlcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBUT0RPOiBkZWxldGUgdGhlIG92ZXJyaWRkZW4gU2V0IGZyb20gdGhlIGNvbnN0cnVjdG9yXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmFsbHkgd2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDdXN0b21FbGVtZW50Lm9ic2VydmVkQXR0cmlidXRlc30gZ2V0dGVyIHdpdGggYSBuZXcgb25lLCB3aGljaCByZXR1cm5zXG4gICAgICAgICAqIHRoZSB1bmlxdWUgc2V0IG9mIHVzZXIgZGVmaW5lZCBhbmQgZGVjb3JhdG9yIGdlbmVyYXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBOLkIuOiBXaGVuIGV4dGVuZGluZyBhbiBleGlzdGluZyBjdXN0b20gZWxlbWVudCwgYW5kIG9lcnJpZGluZyBhIHByb3BlcnR5IHdpdGggYSBkaWZmZXJlbnQgYXNzb2NpYXRlZFxuICAgICAgICAgKiBhdHRyaWJ1dGUgbmFtZSwgdGhlIGJhc2UgY2xhc3MncyBvcmlnaW5hbCBhdHRyaWJ1dGUgbmFtZSByZW1haW5zIGluIHRoZSB7QGxpbmsgQ3VzdG9tRWxlbWVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9XG4gICAgICAgICAqIGFycmF5LiBDaGFuZ2luZyB0aGUgb2xkIGF0dHJpYnV0ZSBvbiB0aGUgZXh0ZW5kZWQgY2xhc3Mgd2lsbCB0cnkgdG8gcmVmbGVjdCB0aGUgYXR0cmlidXRlLCBidXQgd29uJ3RcbiAgICAgICAgICogZmluZCB0aGUgYXR0cmlidXRlIGluIHRoZSBleHRlbmRlZCBjbGFzcydzIHtAbGluayBDdXN0b21FbGVtZW50LmF0dHJpYnV0ZXN9IE1hcCBhbmQgd2lsbCB0aGVyZWZvcmUgYmVcbiAgICAgICAgICogaWdub3JlZC5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsICdvYnNlcnZlZEF0dHJpYnV0ZXMnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCAoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5kZWZpbmUpIHtcblxuICAgICAgICAgICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZShjb25zdHJ1Y3Rvci5zZWxlY3RvciwgY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBDdXN0b21FbGVtZW50IH0gZnJvbSAnLi4vY3VzdG9tLWVsZW1lbnQnO1xuXG4vKipcbiAqIEEge0BsaW5rIEN1c3RvbUVsZW1lbnR9IGV2ZW50IGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGVuZXJEZWNsYXJhdGlvbiB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZXZlbnQgdG8gbGlzdGVuIHRvXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNldHRpbmcgZXZlbnQgdG8gYG51bGxgIGFsbG93cyB0byB1bmJpbmQgYW4gaW5oZXJpdGVkIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqL1xuICAgIGV2ZW50OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBzcGVjaWZpZXMgY2hhcmFjdGVyaXN0aWNzIGFib3V0IHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAqL1xuICAgIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucztcblxuICAgIC8qKlxuICAgICAqIEFuIGFsdGVybmF0aXZlIGV2ZW50IHRhcmdldCAoYnkgZGVmYXVsdCB0aGlzIHdpbGwgYmUgdGhlIHtAbGluayBDdXN0b21FbGVtZW50fSBpbnN0YW5jZSlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBjYW4gYmUgdXNlZnVsIGlmIHlvdSB3YW50IHRvIGxpc3RlbiB0byBlLmcuOlxuICAgICAqICogd2luZG93Lm9ucmVzaXplXG4gICAgICogKiBkb2N1bWVudC5vbmxvYWRcbiAgICAgKiAqIGRvY3VtZW50Lm9uc2Nyb2xsXG4gICAgICogKiBXb3JrZXIub25tZXNzYWdlIC0gVE9ETzogVGhpcyBjb3VsZCBiZSBpbnRlcmVzdGluZyB0byBzb2x2ZSwgd2UgbWlnaHQgbmVlZCB0byBnZXQgdGhlIHdvcmtlciBmcm9tIHRoZVxuICAgICAqICAgY29tcG9uZW50IGluc3RhbmNlLCBtYXliZSBhIHVzZSBjYXNlIGZvciBkaSBAc2VsZigpXG4gICAgICovXG4gICAgdGFyZ2V0PzogRXZlbnRUYXJnZXQgfCAoKCkgPT4gRXZlbnRUYXJnZXQpO1xufVxuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDdXN0b21FbGVtZW50fSBtZXRob2QgYXMgYW4gZXZlbnQgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgbGlzdGVuZXIgZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbmVyIChvcHRpb25zOiBMaXN0ZW5lckRlY2xhcmF0aW9uKSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ3VzdG9tRWxlbWVudDtcblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmV2ZW50ID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5kZWxldGUocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLmxpc3RlbmVycy5zZXQocHJvcGVydHlLZXksIHsgLi4ub3B0aW9ucyB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY3VzdG9tIGVsZW1lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBsaXN0ZW5lciBkZWNvcmF0b3Igc3RvcmVzIGxpc3RlbmVyIGRlY2xhcmF0aW9ucyBpbiB0aGUgY29uc3RydWN0b3IsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoZVxuICogc3RhdGljIGxpc3RlbmVycyBmaWVsZCBpcyBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlIGFkZCBsaXN0ZW5lciBkZWNsYXJhdGlvbnNcbiAqIHRvIHRoZSBiYXNlIGNsYXNzJ3Mgc3RhdGljIGZpZWxkLiBXZSBhbHNvIG1ha2Ugc3VyZSB0byBpbml0aWFsaXplIHRoZSBsaXN0ZW5lciBtYXBzIHdpdGggdGhlIHZhbHVlcyBvZlxuICogdGhlIGJhc2UgY2xhc3MncyBtYXAgdG8gcHJvcGVybHkgaW5oZXJpdCBhbGwgbGlzdGVuZXIgZGVjbGFyYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY3VzdG9tIGVsZW1lbnQgY29uc3RydWN0b3IgdG8gcHJlcGFyZVxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcHJlcGFyZUNvbnN0cnVjdG9yIChjb25zdHJ1Y3RvcjogdHlwZW9mIEN1c3RvbUVsZW1lbnQpIHtcblxuICAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ2xpc3RlbmVycycpKSBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMgPSBuZXcgTWFwKGNvbnN0cnVjdG9yLmxpc3RlbmVycyk7XG59XG4iLCIvKipcbiAqIEdldCB0aGUge0BsaW5rIFByb3BlcnR5RGVzY3JpcHRvcn0gb2YgYSBwcm9wZXJ0eSBmcm9tIGl0cyBwcm90b3R5cGVcbiAqIG9yIGEgcGFyZW50IHByb3RvdHlwZSAtIGV4Y2x1ZGluZyB7QGxpbmsgT2JqZWN0LnByb3RvdHlwZX0gaXRzZWxmLCB0b1xuICogZW5zdXJlIGNvcnJlY3QgcHJvdG90eXBlIGluaGVyaXRhbmNlLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgICAgICAgIFRoZSBwcm90b3R5cGUgdG8gZ2V0IHRoZSBkZXNjcmlwdG9yIGZyb21cbiAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGVzY3JpcHRvclxuICpcbiAqIEBpbnRlcm5hbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BlcnR5RGVzY3JpcHRvciAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZCB7XG5cbiAgICBpZiAocHJvcGVydHlLZXkgaW4gdGFyZ2V0KSB7XG5cbiAgICAgICAgd2hpbGUgKHRhcmdldCAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KHByb3BlcnR5S2V5KSkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhcmdldCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IEN1c3RvbUVsZW1lbnQgfSBmcm9tICcuLi9jdXN0b20tZWxlbWVudCc7XG5pbXBvcnQgeyBjcmVhdGVBdHRyaWJ1dGVOYW1lLCBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLCBQcm9wZXJ0eURlY2xhcmF0aW9uIH0gZnJvbSAnLi9wcm9wZXJ0eS1kZWNsYXJhdGlvbic7XG5pbXBvcnQgeyBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgfSBmcm9tICcuL3V0aWxzL2dldC1wcm9wZXJ0eS1kZXNjcmlwdG9yJztcblxuLyoqXG4gKiBBIHR5cGUgZXh0ZW5zaW9uIHRvIGFkZCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdG8gYSB7QGxpbmsgQ3VzdG9tRWxlbWVudH0gY29uc3RydWN0b3IgZHVyaW5nIGRlY29yYXRpb25cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIERlY29yYXRlZEN1c3RvbUVsZW1lbnRUeXBlID0gdHlwZW9mIEN1c3RvbUVsZW1lbnQgJiB7IG92ZXJyaWRkZW4/OiBTZXQ8c3RyaW5nPiB9O1xuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDdXN0b21FbGVtZW50fSBwcm9wZXJ0eVxuICpcbiAqIEByZW1hcmtzXG4gKiBNYW55IG9mIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gb3B0aW9ucyBzdXBwb3J0IGN1c3RvbSBmdW5jdGlvbnMsIHdoaWNoIHdpbGwgYmUgaW52b2tlZFxuICogd2l0aCB0aGUgY3VzdG9tIGVsZW1lbnQgaW5zdGFuY2UgYXMgYHRoaXNgLWNvbnRleHQgZHVyaW5nIGV4ZWN1dGlvbi4gSW4gb3JkZXIgdG8gc3VwcG9ydCBjb3JyZWN0XG4gKiB0eXBpbmcgaW4gdGhlc2UgZnVuY3Rpb25zLCB0aGUgYEBwcm9wZXJ0eWAgZGVjb3JhdG9yIHN1cHBvcnRzIGdlbmVyaWMgdHlwZXMuIEhlcmUgaXMgYW4gZXhhbXBsZVxuICogb2YgaG93IHlvdSBjYW4gdXNlIHRoaXMgd2l0aCBhIGN1c3RvbSB7QGxpbmsgUHJvcGVydHlSZWZsZWN0b3J9OlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIEN1c3RvbUVsZW1lbnQge1xuICpcbiAqICAgICAgbXlIaWRkZW5Qcm9wZXJ0eSA9IHRydWU7XG4gKlxuICogICAgICAvLyB1c2UgYSBnZW5lcmljIHRvIHN1cHBvcnQgcHJvcGVyIGluc3RhbmNlIHR5cGluZyBpbiB0aGUgcHJvcGVydHkgcmVmbGVjdG9yXG4gKiAgICAgIEBwcm9wZXJ0eTxNeUVsZW1lbnQ+KHtcbiAqICAgICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogKHByb3BlcnR5S2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAqICAgICAgICAgICAgICAvLyB0aGUgZ2VuZXJpYyB0eXBlIGFsbG93cyBmb3IgY29ycmVjdCB0eXBpbmcgb2YgdGhpc1xuICogICAgICAgICAgICAgIGlmICh0aGlzLm15SGlkZGVuUHJvcGVydHkgJiYgbmV3VmFsdWUpIHtcbiAqICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ215LXByb3BlcnR5JywgJycpO1xuICogICAgICAgICAgICAgIH0gZWxzZSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdteS1wcm9wZXJ0eScpO1xuICogICAgICAgICAgICAgIH1cbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgbXlQcm9wZXJ0eSA9IGZhbHNlO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgcHJvcGVydHkgPSA8VHlwZSBleHRlbmRzIEN1c3RvbUVsZW1lbnQgPSBDdXN0b21FbGVtZW50PiAob3B0aW9uczogUGFydGlhbDxQcm9wZXJ0eURlY2xhcmF0aW9uPFR5cGU+PiA9IHt9KSA9PiB7XG5cbiAgICByZXR1cm4gKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiB2b2lkID0+IHtcblxuICAgICAgICAvLyBUT0RPOiBXZSBtaWdodCBub3QgaGF2ZSB0byBkbyB0aGlzXG4gICAgICAgIC8vIGNsYXNzIGZpZWxkcyBpbiB0eXBlc2NyaXB0IGdldCBpbml0aWFsaXplZCBpbiB0aGUgY29uc3RydWN0b3IgYW5kIHRoZSBmaWVsZCgvcHJvcGVydHkpIGl0c2VsZiBkb2VzIG5vdFxuICAgICAgICAvLyBnZXQgc3RvcmVkIG9uIHRoZSBjbGFzcydzIHByb3RvdHlwZS4gb25seSBnZXR0ZXJzIGFuZCBzZXR0ZXJzIGFyZSBzdG9yZWQgb24gdGhlIHByb3RvdHlwZS5cbiAgICAgICAgLy8gYXMgc3VjaCwgd2hlbiB3ZSBkZWNvcmF0ZSBhIHByb3BlcnR5IG9uIGEgY2xhc3MsIHRoZSBwcm9wZXJ0eSBkZWZpbml0aW9uIGl0c2VsZiBvbiB0aGUgc3ViLWNsYXNzIGlzXG4gICAgICAgIC8vIG1vc3QgbGlrZWx5IGludGVuZGVkIHRvIG9lcnJpZGUgdGhlIGJhc2UgY2xhc3MncyBzZXR0ZXIvZ2V0dGVyIGFuZCB3ZSBzaG91bGQgbm90IGV4ZWN1dGUgdGhlIGJhc2VcbiAgICAgICAgLy8gY2xhc3MncyBzZXR0ZXIvZ2V0dGVyIGluIHRoZSBzdWItY2xhc3MgYW55bW9yZS4gd2Ugc2hvdWxkIG9ubHkgYmUgaW50ZXJlc3RlZCBpbiBzZXR0ZXJzL2dldHRlcnMgb24gdGhlXG4gICAgICAgIC8vIHN1Yi1jbGFzcyBhbmQgd3JhcCB0aGVtXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBnZXRQcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGNvbnN0IGhpZGRlbktleSA9ICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSA/IGBfJHsgcHJvcGVydHlLZXkgfWAgOiBTeW1ib2woKTtcbiAgICAgICAgY29uc3QgZ2V0ID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmdldCB8fCBmdW5jdGlvbiAodGhpczogYW55KSB7IHJldHVybiB0aGlzW2hpZGRlbktleV07IH07XG4gICAgICAgIGNvbnN0IHNldCA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5zZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSwgdmFsdWU6IGFueSkgeyB0aGlzW2hpZGRlbktleV0gPSB2YWx1ZTsgfTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogYW55IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0LmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0ICh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzW3Byb3BlcnR5S2V5XTtcbiAgICAgICAgICAgICAgICBzZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyBEZWNvcmF0ZWRDdXN0b21FbGVtZW50VHlwZTtcblxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbjogUHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlPiA9IHsgLi4uREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTiwgLi4ub3B0aW9ucyB9O1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgZGVjbGFyYXRpb24uYXR0cmlidXRlID0gY3JlYXRlQXR0cmlidXRlTmFtZShwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXQgdGhlIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGRldGVjdG9yXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5vYnNlcnZlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLm9ic2VydmUgPSBERUZBVUxUX1BST1BFUlRZX0RFQ0xBUkFUSU9OLm9ic2VydmU7XG4gICAgICAgIH1cblxuICAgICAgICBwcmVwYXJlQ29uc3RydWN0b3IoY29uc3RydWN0b3IpO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGluaGVyaXRlZCBhbiBvYnNlcnZlZCBhdHRyaWJ1dGUgZm9yIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBiYXNlIGNsYXNzXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuaGFzKHByb3BlcnR5S2V5KSA/IGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuZ2V0KHByb3BlcnR5S2V5KSEuYXR0cmlidXRlIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIGlmIGF0dHJpYnV0ZSBpcyB0cnV0aHkgaXQncyBhIHN0cmluZyBhbmQgaXQgd2lsbCBleGlzdCBpbiB0aGUgYXR0cmlidXRlcyBtYXBcbiAgICAgICAgaWYgKGF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIGluaGVyaXRlZCBhdHRyaWJ1dGUgYXMgaXQncyBvdmVycmlkZGVuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmRlbGV0ZShhdHRyaWJ1dGUgYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgLy8gbWFyayBhdHRyaWJ1dGUgYXMgb3ZlcnJpZGRlbiBmb3Ige0BsaW5rIGN1c3RvbUVsZW1lbnR9IGRlY29yYXRvclxuICAgICAgICAgICAgY29uc3RydWN0b3Iub3ZlcnJpZGRlbiEuYWRkKGF0dHJpYnV0ZSBhcyBzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLnNldChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBwcm9wZXJ0eSBkZWNsYXJhdGlvbiBsYXN0LCBzbyB3ZSBjYW4gc3RpbGwgYWNjZXNzIHRoZSBpbmhlcml0ZWQgZGVjbGFyYXRpb25cbiAgICAgICAgLy8gd2hlbiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBkZWNsYXJhdGlvbiBhcyBQcm9wZXJ0eURlY2xhcmF0aW9uKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY3VzdG9tIGVsZW1lbnQgY29uc3RydWN0b3IgYnkgaW5pdGlhbGl6aW5nIHN0YXRpYyBwcm9wZXJ0aWVzIGZvciB0aGUgcHJvcGVydHkgZGVjb3JhdG9yLFxuICogc28gd2UgZG9uJ3QgbW9kaWZ5IGEgYmFzZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEByZW1hcmtzXG4gKiBXaGVuIHRoZSBwcm9wZXJ0eSBkZWNvcmF0b3Igc3RvcmVzIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhbmQgYXR0cmlidXRlIG1hcHBpbmdzIGluIHRoZSBjb25zdHJ1Y3RvcixcbiAqIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRob3NlIHN0YXRpYyBmaWVsZHMgYXJlIGluaXRpYWxpemVkIG9uIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yLiBPdGhlcndpc2Ugd2VcbiAqIGFkZCBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZSBtYXBwaW5ncyB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZHMuIFdlIGFsc28gbWFrZVxuICogc3VyZSB0byBpbml0aWFsaXplIHRoZSBjb25zdHJ1Y3RvcnMgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2YgdGhlIGJhc2UgY2xhc3MncyBtYXBzIHRvIHByb3Blcmx5XG4gKiBpbmhlcml0IGFsbCBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZXMuXG4gKlxuICogQHBhcmFtIGNvbnN0cnVjdG9yIFRoZSBjdXN0b20gZWxlbWVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiBEZWNvcmF0ZWRDdXN0b21FbGVtZW50VHlwZSkge1xuXG4gICAgLy8gdGhpcyB3aWxsIGdpdmUgdXMgYSBjb21waWxlLXRpbWUgZXJyb3IgaWYgd2UgcmVmYWN0b3Igb25lIG9mIHRoZSBzdGF0aWMgY29uc3RydWN0b3IgcHJvcGVydGllc1xuICAgIC8vIGFuZCB3ZSB3b24ndCBtaXNzIHJlbmFtaW5nIHRoZSBwcm9wZXJ0eSBrZXlzXG4gICAgY29uc3QgcHJvcGVydGllczoga2V5b2YgRGVjb3JhdGVkQ3VzdG9tRWxlbWVudFR5cGUgPSAncHJvcGVydGllcyc7XG4gICAgY29uc3QgYXR0cmlidXRlczoga2V5b2YgRGVjb3JhdGVkQ3VzdG9tRWxlbWVudFR5cGUgPSAnYXR0cmlidXRlcyc7XG4gICAgY29uc3Qgb3ZlcnJpZGRlbjoga2V5b2YgRGVjb3JhdGVkQ3VzdG9tRWxlbWVudFR5cGUgPSAnb3ZlcnJpZGRlbic7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KHByb3BlcnRpZXMpKSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZXMpKSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KG92ZXJyaWRkZW4pKSBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuID0gbmV3IFNldCgpO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgY3VzdG9tRWxlbWVudCwgQ3VzdG9tRWxlbWVudCwgaHRtbCwgbGlzdGVuZXIsIHByb3BlcnR5LCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4uLy4uL3NyYyc7XG5cbkBjdXN0b21FbGVtZW50KHtcbiAgICBzZWxlY3RvcjogJ2NoZWNrLWJveCdcbn0pXG5leHBvcnQgY2xhc3MgQ2hlY2tib3ggZXh0ZW5kcyBDdXN0b21FbGVtZW50IHtcblxuICAgIEBwcm9wZXJ0eSgpXG4gICAgY3VzdG9tUm9sZSA9ICdjaGVja2JveCc7XG5cbiAgICBAcHJvcGVydHk8Q2hlY2tib3g+KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICByZWZsZWN0UHJvcGVydHk6ICdyZWZsZWN0Q2hlY2tlZCcsXG4gICAgICAgIC8vIHJlZmxlY3RQcm9wZXJ0eTogZnVuY3Rpb24gKHByb3BlcnR5S2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgLy8gICAgIGlmICh0aGlzLmN1c3RvbUNoZWNrZWQpIHtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnY3VzdG9tLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCAndHJ1ZScpO1xuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnY3VzdG9tLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jaGVja2VkJyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIG5vdGlmeTogdHJ1ZSxcbiAgICAgICAgbm90aWZ5OiAnbm90aWZ5Q2hlY2tlZCcsXG4gICAgICAgIC8vIG5vdGlmeTogZnVuY3Rpb24gKHByb3BlcnR5S2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdjdXN0b20gbm90aWZpZXIuLi4nKTtcbiAgICAgICAgLy8gfVxuICAgIH0pXG4gICAgY3VzdG9tQ2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IgKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIG9uQ2xpY2sgKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuY3VzdG9tQ2hlY2tlZCA9ICF0aGlzLmN1c3RvbUNoZWNrZWQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHRoaXMuY3VzdG9tQ2hlY2tlZCA9ICF0aGlzLmN1c3RvbUNoZWNrZWQ7XG5cbiAgICAgICAgLy8gdGhpcy5ub3RpZnkoJ2N1c3RvbUNoZWNrZWQnKTtcbiAgICB9XG5cbiAgICByZWZsZWN0Q2hlY2tlZCAoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VzdG9tQ2hlY2tlZCkge1xuXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnY3VzdG9tLWNoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1jaGVja2VkJywgJ3RydWUnKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnY3VzdG9tLWNoZWNrZWQnKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBub3RpZnlDaGVja2VkICgpIHtcblxuICAgICAgICBjb25zb2xlLmxvZyhgbm90aWZ5Q2hlY2tlZC4uLmApO1xuICAgIH1cblxuICAgIHRlbXBsYXRlICgpOiBUZW1wbGF0ZVJlc3VsdCB7XG5cbiAgICAgICAgcmV0dXJuIGh0bWxgXG4gICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAgICAgOmhvc3Qge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDFyZW07XG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICM5OTk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDpob3N0KFtjdXN0b20tY2hlY2tlZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjYztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L3N0eWxlPmA7XG4gICAgfVxufVxuIiwiaW1wb3J0ICcuL3NyYy9jaGVja2JveCc7XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcCAoKSB7XG5cbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NoZWNrLWJveCcpO1xuXG4gICAgaWYgKGNoZWNrYm94KSB7XG5cbiAgICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hlY2tlZC1jaGFuZ2VkJywgZXZlbnQgPT4gY29uc29sZS5sb2coKGV2ZW50IGFzIEN1c3RvbUV2ZW50KS5kZXRhaWwpKTtcbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYm9vdHN0cmFwKTtcbiJdLCJuYW1lcyI6WyJkaXJlY3RpdmUiLCJwcmVwYXJlQ29uc3RydWN0b3IiLCJ0c2xpYl8xLl9fZGVjb3JhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLElBMEJPLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLO0lBQ2xDLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxVQUFVLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUM7O0lDMUNGO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxLQUFLLFNBQVM7SUFDL0QsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLHlCQUF5QjtJQUNuRCxRQUFRLFNBQVMsQ0FBQztBQUNsQixJQWNBO0lBQ0E7SUFDQTtJQUNBO0FBQ0EsSUFBTyxNQUFNLFdBQVcsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxHQUFHLElBQUksS0FBSztJQUNyRSxJQUFJLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztJQUN6QixJQUFJLE9BQU8sSUFBSSxLQUFLLE9BQU8sRUFBRTtJQUM3QixRQUFRLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDbkMsUUFBUSxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLFFBQVEsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNqQixLQUFLO0lBQ0wsQ0FBQyxDQUFDOztJQzVDRjtJQUNBO0lBQ0E7SUFD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
